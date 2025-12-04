import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { GoogleGenAI } from "@google/genai";

/**
 * @file BackupRecoveryView.tsx
 * @description This file implements a comprehensive Backup & Recovery management dashboard.
 * It integrates features for managing backup jobs, defining recovery policies, simulating disaster recovery,
 * configuring storage targets, monitoring backup health, and advanced reporting.
 * The aim is to provide a "real-world" enterprise-grade interface for infrastructure resilience.
 */

// --- GLOBAL UTILITIES AND CONSTANTS ---
/**
 * Generates a unique ID string.
 * @returns {string} A unique ID.
 */
export const generateUniqueId = (): string => Math.random().toString(36).substr(2, 9);

/**
 * Formats a timestamp into a human-readable date and time string.
 * @param {string | Date} timestamp - The timestamp to format.
 * @returns {string} Formatted date and time.
 */
export const formatTimestamp = (timestamp: string | Date): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
};

/**
 * Converts bytes to a human-readable size string (e.g., KB, MB, GB).
 * @param {number} bytes - The number of bytes.
 * @returns {string} Formatted size string.
 */
export const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Enum for Backup Job Status.
 * @enum {string}
 */
export enum BackupStatus {
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    IN_PROGRESS = 'IN_PROGRESS',
    SCHEDULED = 'SCHEDULED',
    CANCELLED = 'CANCELLED',
    PARTIAL = 'PARTIAL'
}

/**
 * Enum for Recovery Point Objective (RPO) units.
 * @enum {string}
 */
export enum RPOUnit {
    MINUTES = 'MINUTES',
    HOURS = 'HOURS',
    DAYS = 'DAYS'
}

/**
 * Enum for Recovery Time Objective (RTO) units.
 * @enum {string}
 */
export enum RTOUnit {
    MINUTES = 'MINUTES',
    HOURS = 'HOURS',
    DAYS = 'DAYS'
}

/**
 * Enum for Backup Frequency.
 * @enum {string}
 */
export enum BackupFrequency {
    HOURLY = 'HOURLY',
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    CUSTOM = 'CUSTOM'
}

/**
 * Enum for Backup Type.
 * @enum {string}
 */
export enum BackupType {
    FULL = 'FULL',
    INCREMENTAL = 'INCREMENTAL',
    DIFFERENTIAL = 'DIFFERENTIAL'
}

/**
 * Enum for Storage Target Type.
 * @enum {string}
 */
export enum StorageTargetType {
    S3 = 'AWS S3',
    AZURE_BLOB = 'Azure Blob Storage',
    GCS = 'Google Cloud Storage',
    NFS = 'NFS Share',
    LOCAL = 'Local Disk'
}

/**
 * Enum for Alert Severity.
 * @enum {string}
 */
export enum AlertSeverity {
    INFO = 'INFO',
    WARNING = 'WARNING',
    CRITICAL = 'CRITICAL',
    HIGH = 'HIGH',
    MEDIUM = 'MEDIUM',
    LOW = 'LOW'
}

/**
 * Enum for Compliance Standard.
 * @enum {string}
 */
export enum ComplianceStandard {
    GDPR = 'GDPR',
    HIPAA = 'HIPAA',
    PCI_DSS = 'PCI DSS',
    ISO_27001 = 'ISO 27001'
}

/**
 * Enum for DR Drill Status.
 * @enum {string}
 */
export enum DRDrillStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED_SUCCESS = 'COMPLETED_SUCCESS',
    COMPLETED_FAILED = 'COMPLETED_FAILED',
    SCHEDULED = 'SCHEDULED'
}

/**
 * Enum for Playbook Status.
 * @enum {string}
 */
export enum PlaybookStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    DEPRECATED = 'DEPRECATED'
}

// --- INTERFACES FOR NEW DATA STRUCTURES ---

/**
 * Interface for a detailed Backup Job.
 * Extends the existing `BackupJob` type from `DataContext`.
 */
export interface DetailedBackupJob {
    id: string;
    service: string;
    type: BackupType;
    status: BackupStatus;
    timestamp: string;
    duration: string; // e.g., "1h 30m"
    size: number; // in bytes
    policyId?: string;
    storageTargetId?: string;
    recoveryPoint?: string; // Timestamp of the recovery point
    logs: string[];
    progress: number; // 0-100
}

/**
 * Interface for a Backup Policy.
 */
export interface BackupPolicy {
    id: string;
    name: string;
    description: string;
    services: string[]; // Services covered by this policy
    frequency: BackupFrequency;
    schedule: string; // e.g., "Every 4 hours", "Daily at 2 AM", "Every Mon, Wed, Fri"
    retentionDays: number; // How long backups are kept
    backupType: BackupType;
    rpoUnit: RPOUnit;
    rpoValue: number;
    enabled: boolean;
    storageTargetId: string;
    lastUpdated: string;
}

/**
 * Interface for a Storage Target.
 */
export interface StorageTarget {
    id: string;
    name: string;
    type: StorageTargetType;
    location: string; // e.g., "us-east-1", "Azure East US"
    endpoint?: string; // For S3, GCS, Azure Blob
    accessKeyId?: string; // Masked in UI
    secretAccessKey?: string; // Masked in UI
    mountPath?: string; // For NFS, Local
    capacityBytes: number;
    usedBytes: number;
    enabled: boolean;
    createdAt: string;
}

/**
 * Interface for a Recovery Plan.
 */
export interface RecoveryPlan {
    id: string;
    name: string;
    description: string;
    targetServices: string[];
    rtoUnit: RTOUnit;
    rtoValue: number;
    recoverySteps: string[]; // Detailed steps for recovery
    validationSteps: string[]; // Steps to validate recovery
    associatedPolicies: string[]; // IDs of backup policies supporting this plan
    lastTested: string | null;
    status: PlaybookStatus; // Draft, Active, Deprecated
    createdBy: string;
    lastModifiedBy: string;
    version: string;
    // AI generated fields
    aiGeneratedSummary?: string;
    aiOptimizedSteps?: string[];
}

/**
 * Interface for a DR Drill (test of a Recovery Plan).
 */
export interface DRDrill {
    id: string;
    planId: string;
    planName: string;
    startTime: string;
    endTime: string | null;
    status: DRDrillStatus;
    triggeredBy: string;
    outcome: string; // Detailed outcome or summary
    logs: string[];
    durationMinutes: number | null;
    testRecoveryPoint?: string; // Specific backup used for the drill
}

/**
 * Interface for an Alert Rule.
 */
export interface AlertRule {
    id: string;
    name: string;
    description: string;
    condition: string; // e.g., "Backup Failure Rate > 10%", "RPO Breach"
    severity: AlertSeverity;
    notificationChannels: string[]; // e.g., "email:admin@example.com", "slack:#dr-alerts"
    enabled: boolean;
    lastTriggered: string | null;
}

/**
 * Interface for an Audit Log entry.
 */
export interface AuditLog {
    id: string;
    timestamp: string;
    actor: string;
    action: string; // e.g., "Created Backup Policy 'DailyDB'", "Triggered DR Drill for 'WebAppFailover'"
    target: string; // The resource acted upon
    details: string; // JSON string or detailed message
    ipAddress: string;
}

/**
 * Interface for a Compliance Report.
 */
export interface ComplianceReport {
    id: string;
    standard: ComplianceStandard;
    generationDate: string;
    periodStart: string;
    periodEnd: string;
    complianceStatus: string; // e.g., "Compliant", "Non-Compliant (Minor)", "Non-Compliant (Critical)"
    findings: string[]; // List of non-compliance findings
    recommendations: string[]; // Recommendations for improvement
    generatedBy: string;
    reportFileUrl?: string; // URL to a PDF report
}

// --- MOCK DATA GENERATORS ---
const MOCK_SERVICES = ['Database A', 'Microservice X', 'Payment Gateway', 'User Auth', 'Analytics Engine', 'CMS Backend'];

const generateMockDetailedBackupJob = (count: number): DetailedBackupJob[] => {
    const jobs: DetailedBackupJob[] = [];
    for (let i = 0; i < count; i++) {
        const status = Object.values(BackupStatus)[Math.floor(Math.random() * Object.values(BackupStatus).length)];
        const service = MOCK_SERVICES[Math.floor(Math.random() * MOCK_SERVICES.length)];
        const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
        const durationSeconds = Math.floor(Math.random() * 3600) + 60; // 1 min to 1 hour
        const duration = `${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s`;
        const size = Math.floor(Math.random() * (500 * 1024 * 1024)) + (10 * 1024 * 1024); // 10MB to 500MB
        const type = Object.values(BackupType)[Math.floor(Math.random() * Object.values(BackupType).length)];
        const progress = status === BackupStatus.IN_PROGRESS ? Math.floor(Math.random() * 99) + 1 : (status === BackupStatus.SUCCESS ? 100 : 0);

        jobs.push({
            id: generateUniqueId(),
            service,
            type,
            status,
            timestamp: formatTimestamp(timestamp),
            duration,
            size,
            logs: [`Backup started for ${service}`, `Phase 1 complete`, `Transferring data...`, `Backup finished. Status: ${status}`],
            progress,
            recoveryPoint: formatTimestamp(new Date(new Date(timestamp).getTime() - Math.random() * 60 * 60 * 1000)), // Point before backup
        });
    }
    return jobs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const generateMockBackupPolicies = (count: number): BackupPolicy[] => {
    const policies: BackupPolicy[] = [];
    const storageTargets = generateMockStorageTargets(2); // Ensure we have some targets
    for (let i = 0; i < count; i++) {
        const frequency = Object.values(BackupFrequency)[Math.floor(Math.random() * Object.values(BackupFrequency).length)];
        const services = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => MOCK_SERVICES[Math.floor(Math.random() * MOCK_SERVICES.length)]);
        policies.push({
            id: `policy-${generateUniqueId()}`,
            name: `Policy ${String.fromCharCode(65 + i)} - ${frequency}`,
            description: `Automated backup policy for ${services.join(', ')} with ${frequency} frequency.`,
            services: Array.from(new Set(services)), // Unique services
            frequency,
            schedule: frequency === BackupFrequency.HOURLY ? 'Every 4 hours' : 'Daily at 2 AM',
            retentionDays: Math.floor(Math.random() * 365) + 7,
            backupType: Object.values(BackupType)[Math.floor(Math.random() * Object.values(BackupType).length)],
            rpoUnit: Object.values(RPOUnit)[Math.floor(Math.random() * Object.values(RPOUnit).length)],
            rpoValue: Math.floor(Math.random() * 12) + 1,
            enabled: Math.random() > 0.1,
            storageTargetId: storageTargets[Math.floor(Math.random() * storageTargets.length)].id,
            lastUpdated: formatTimestamp(new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000))
        });
    }
    return policies;
};

const generateMockStorageTargets = (count: number): StorageTarget[] => {
    const targets: StorageTarget[] = [];
    for (let i = 0; i < count; i++) {
        const type = Object.values(StorageTargetType)[Math.floor(Math.random() * Object.values(StorageTargetType).length)];
        const totalCapacity = Math.random() * (10 * 1024 * 1024 * 1024 * 1024) + (1 * 1024 * 1024 * 1024 * 1024); // 1TB to 10TB
        const usedCapacity = Math.random() * totalCapacity * 0.8; // Up to 80% used
        targets.push({
            id: `storage-${generateUniqueId()}`,
            name: `${type} Target ${i + 1}`,
            type,
            location: type.includes('AWS') ? 'us-east-1' : (type.includes('Azure') ? 'East US' : (type.includes('Google') ? 'asia-southeast1' : 'datacenter-01')),
            capacityBytes: totalCapacity,
            usedBytes: usedCapacity,
            enabled: Math.random() > 0.05,
            createdAt: formatTimestamp(new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000))
        });
    }
    return targets;
};

const generateMockRecoveryPlans = (count: number, policies: BackupPolicy[]): RecoveryPlan[] => {
    const plans: RecoveryPlan[] = [];
    for (let i = 0; i < count; i++) {
        const targetServices = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => MOCK_SERVICES[Math.floor(Math.random() * MOCK_SERVICES.length)]);
        const associatedPolicies = policies
            .filter(p => targetServices.some(ts => p.services.includes(ts)))
            .map(p => p.id)
            .slice(0, Math.floor(Math.random() * 2) + 1);

        plans.push({
            id: `plan-${generateUniqueId()}`,
            name: `DR Plan for ${targetServices[0]}`,
            description: `Detailed recovery playbook for ${targetServices.join(', ')} to ensure business continuity.`,
            targetServices: Array.from(new Set(targetServices)),
            rtoUnit: Object.values(RTOUnit)[Math.floor(Math.random() * Object.values(RTOUnit).length)],
            rtoValue: Math.floor(Math.random() * 8) + 1,
            recoverySteps: [
                "1. Declare disaster and activate plan.",
                "2. Failover to DR region/site.",
                "3. Restore data from latest available backup.",
                "4. Verify application functionality.",
                "5. Cutover to restored services."
            ],
            validationSteps: [
                "1. Check service endpoints.",
                "2. Perform data integrity checks.",
                "3. Conduct user acceptance testing."
            ],
            associatedPolicies,
            lastTested: Math.random() > 0.5 ? formatTimestamp(new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)) : null,
            status: Object.values(PlaybookStatus)[Math.floor(Math.random() * Object.values(PlaybookStatus).length)],
            createdBy: 'admin@example.com',
            lastModifiedBy: 'admin@example.com',
            version: `1.${Math.floor(Math.random() * 10)}`,
            aiGeneratedSummary: `AI-powered summary: This plan focuses on rapid failover for ${targetServices[0]} using a multi-region strategy.`,
            aiOptimizedSteps: ["AI-optimized step 1", "AI-optimized step 2"]
        });
    }
    return plans;
};

const generateMockDRDrills = (count: number, plans: RecoveryPlan[]): DRDrill[] => {
    const drills: DRDrill[] = [];
    for (let i = 0; i < count; i++) {
        const plan = plans[Math.floor(Math.random() * plans.length)];
        const status = Object.values(DRDrillStatus)[Math.floor(Math.random() * Object.values(DRDrillStatus).length)];
        const startTime = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
        const durationMinutes = status === DRDrillStatus.IN_PROGRESS ? null : Math.floor(Math.random() * 240) + 30; // 30 mins to 4 hours
        const endTime = durationMinutes ? new Date(startTime.getTime() + durationMinutes * 60 * 1000) : null;
        drills.push({
            id: `drill-${generateUniqueId()}`,
            planId: plan.id,
            planName: plan.name,
            startTime: formatTimestamp(startTime),
            endTime: endTime ? formatTimestamp(endTime) : null,
            status,
            triggeredBy: Math.random() > 0.7 ? 'system' : 'ops_user@example.com',
            outcome: status === DRDrillStatus.COMPLETED_SUCCESS ? 'Successfully validated RTO/RPO targets.' : (status === DRDrillStatus.COMPLETED_FAILED ? 'Identified issues in step 3, requiring plan revision.' : 'N/A'),
            logs: ["Drill initiated.", "Service failover started.", "Data restoration validation passed."],
            durationMinutes,
            testRecoveryPoint: formatTimestamp(new Date(startTime.getTime() - Math.random() * 24 * 60 * 60 * 1000))
        });
    }
    return drills.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
};

const generateMockAlertRules = (count: number): AlertRule[] => {
    const rules: AlertRule[] = [];
    const conditions = ["Backup Failure Rate > 10%", "RPO Breach for Database A", "Storage Target Capacity > 90%", "No successful backup in 24h"];
    for (let i = 0; i < count; i++) {
        rules.push({
            id: `alert-${generateUniqueId()}`,
            name: `Alert Rule ${i + 1}`,
            description: `Alert when ${conditions[Math.floor(Math.random() * conditions.length)]}.`,
            condition: conditions[Math.floor(Math.random() * conditions.length)],
            severity: Object.values(AlertSeverity)[Math.floor(Math.random() * Object.values(AlertSeverity).length)],
            notificationChannels: ['email:ops@example.com', 'slack:#alerts'],
            enabled: Math.random() > 0.1,
            lastTriggered: Math.random() > 0.5 ? formatTimestamp(new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)) : null
        });
    }
    return rules;
};

const generateMockAuditLogs = (count: number): AuditLog[] => {
    const logs: AuditLog[] = [];
    const actions = ["Created Backup Policy", "Modified Storage Target", "Triggered DR Drill", "Deleted Backup Job", "Viewed Recovery Plan"];
    const actors = ["admin@example.com", "ops_user@example.com", "system"];
    const targets = ["Policy-001", "Storage-AWS-S3", "Plan-WebApp", "Job-DBA-20231026", "ComplianceReport-GDPR"];
    for (let i = 0; i < count; i++) {
        const action = actions[Math.floor(Math.random() * actions.length)];
        logs.push({
            id: `audit-${generateUniqueId()}`,
            timestamp: formatTimestamp(new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)),
            actor: actors[Math.floor(Math.random() * actors.length)],
            action,
            target: targets[Math.floor(Math.random() * targets.length)],
            details: `Details for action: ${action} on ${targets[Math.floor(Math.random() * targets.length)]}.`,
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`
        });
    }
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const generateMockComplianceReports = (count: number): ComplianceReport[] => {
    const reports: ComplianceReport[] = [];
    for (let i = 0; i < count; i++) {
        const standard = Object.values(ComplianceStandard)[Math.floor(Math.random() * Object.values(ComplianceStandard).length)];
        const generationDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
        const periodStart = new Date(generationDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        const complianceStatus = Math.random() > 0.8 ? 'Non-Compliant (Minor)' : 'Compliant';
        reports.push({
            id: `report-${generateUniqueId()}`,
            standard,
            generationDate: formatTimestamp(generationDate),
            periodStart: formatTimestamp(periodStart),
            periodEnd: formatTimestamp(generationDate),
            complianceStatus,
            findings: complianceStatus !== 'Compliant' ? [`Finding: Minor RPO breach for service X`, `Recommendation: Adjust policy 'HourlyDB' to lower RPO.`] : [],
            recommendations: complianceStatus !== 'Compliant' ? [`Review policy settings for ${standard}.`] : [],
            generatedBy: 'compliance_officer@example.com',
            reportFileUrl: `https://example.com/reports/${standard.toLowerCase()}-${generateUniqueId()}.pdf`
        });
    }
    return reports.sort((a, b) => new Date(b.generationDate).getTime() - new Date(a.generationDate).getTime());
};

// --- REACT COMPONENTS (EXPORTED WHERE APPLICABLE FOR REUSABILITY/STRUCTURE) ---

/**
 * Props for the ActionButton component.
 */
export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    onClick: () => void;
    isLoading?: boolean;
    loadingText?: string;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

/**
 * A generic action button component.
 * @param {ActionButtonProps} props - The props for the button.
 * @returns {JSX.Element} The rendered button.
 */
export const ActionButton: React.FC<ActionButtonProps> = ({
    label,
    onClick,
    isLoading = false,
    loadingText = 'Processing...',
    variant = 'primary',
    className,
    disabled,
    ...rest
}) => {
    const baseStyle = "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200";
    let variantStyle = "";
    switch (variant) {
        case 'primary':
            variantStyle = "bg-cyan-600 hover:bg-cyan-700 text-white";
            break;
        case 'secondary':
            variantStyle = "bg-gray-600 hover:bg-gray-700 text-white";
            break;
        case 'danger':
            variantStyle = "bg-red-600 hover:bg-red-700 text-white";
            break;
        case 'success':
            variantStyle = "bg-green-600 hover:bg-green-700 text-white";
            break;
    }

    return (
        <button
            onClick={onClick}
            disabled={isLoading || disabled}
            className={`${baseStyle} ${variantStyle} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}
            {...rest}
        >
            {isLoading ? loadingText : label}
        </button>
    );
};

/**
 * Props for the Modal component.
 */
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
    widthClass?: string; // e.g., 'max-w-2xl'
}

/**
 * A generic modal component.
 * @param {ModalProps} props - The props for the modal.
 * @returns {JSX.Element | null} The rendered modal or null if not open.
 */
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className, widthClass = 'max-w-2xl' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className={`bg-gray-800 rounded-lg shadow-2xl w-full ${widthClass} ${className || ''}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

/**
 * Props for the StatusBadge component.
 */
export interface StatusBadgeProps {
    status: string;
    type?: 'success' | 'warning' | 'error' | 'info' | 'default';
}

/**
 * A reusable status badge component.
 * @param {StatusBadgeProps} props - The props for the badge.
 * @returns {JSX.Element} The rendered badge.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
    let colorClass = 'bg-gray-700 text-gray-300';
    switch (type || status.toLowerCase()) {
        case 'success':
        case 'completed_success':
        case 'compliant':
            colorClass = 'bg-green-700 text-green-300';
            break;
        case 'warning':
        case 'partial':
        case 'in_progress':
            colorClass = 'bg-yellow-700 text-yellow-300';
            break;
        case 'error':
        case 'failed':
        case 'non-compliant (critical)':
            colorClass = 'bg-red-700 text-red-300';
            break;
        case 'info':
        case 'scheduled':
        case 'pending':
            colorClass = 'bg-blue-700 text-blue-300';
            break;
        case 'active':
            colorClass = 'bg-purple-700 text-purple-300';
            break;
        case 'draft':
            colorClass = 'bg-indigo-700 text-indigo-300';
            break;
        default:
            colorClass = 'bg-gray-700 text-gray-300';
            break;
    }
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            {status.replace(/_/g, ' ')}
        </span>
    );
};

/**
 * Props for the ProgressBar component.
 */
export interface ProgressBarProps {
    progress: number; // 0-100
    label?: string;
    color?: string; // Tailwind color class, e.g., 'bg-green-500'
}

/**
 * A simple progress bar component.
 * @param {ProgressBarProps} props - The props for the progress bar.
 * @returns {JSX.Element} The rendered progress bar.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, color = 'bg-cyan-500' }) => {
    const clampedProgress = Math.max(0, Math.min(100, progress));
    return (
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div
                className={`h-2.5 rounded-full ${color}`}
                style={{ width: `${clampedProgress}%` }}
                role="progressbar"
                aria-valuenow={clampedProgress}
                aria-valuemin={0}
                aria-valuemax={100}
            ></div>
            {label && <p className="text-xs text-gray-400 mt-1">{label}: {clampedProgress}%</p>}
        </div>
    );
};

/**
 * Props for the CollapsibleSection component.
 */
export interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

/**
 * A collapsible section component for better UI organization.
 * @param {CollapsibleSectionProps} props - The props for the section.
 * @returns {JSX.Element} The rendered collapsible section.
 */
export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <Card className="p-0">
            <div
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-700/50 transition-colors duration-150"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h4 className="text-lg font-semibold text-white">{title}</h4>
                <svg
                    className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            {isOpen && (
                <div className="p-4 border-t border-gray-700">
                    {children}
                </div>
            )}
        </Card>
    );
};

/**
 * Form for creating/editing a backup policy.
 */
export interface BackupPolicyFormProps {
    policy?: BackupPolicy;
    onSave: (policy: BackupPolicy) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
    storageTargets: StorageTarget[];
    services: string[];
}

export const BackupPolicyForm: React.FC<BackupPolicyFormProps> = ({
    policy: initialPolicy, onSave, onCancel, isLoading, storageTargets, services
}) => {
    const [policy, setPolicy] = useState<BackupPolicy>(
        initialPolicy || {
            id: generateUniqueId(),
            name: '',
            description: '',
            services: [],
            frequency: BackupFrequency.DAILY,
            schedule: 'Daily at 2 AM',
            retentionDays: 30,
            backupType: BackupType.FULL,
            rpoUnit: RPOUnit.HOURS,
            rpoValue: 4,
            enabled: true,
            storageTargetId: storageTargets[0]?.id || '',
            lastUpdated: formatTimestamp(new Date())
        }
    );
    const [selectedServices, setSelectedServices] = useState<string[]>(initialPolicy?.services || []);

    useEffect(() => {
        setPolicy(initialPolicy || {
            id: generateUniqueId(),
            name: '',
            description: '',
            services: [],
            frequency: BackupFrequency.DAILY,
            schedule: 'Daily at 2 AM',
            retentionDays: 30,
            backupType: BackupType.FULL,
            rpoUnit: RPOUnit.HOURS,
            rpoValue: 4,
            enabled: true,
            storageTargetId: storageTargets[0]?.id || '',
            lastUpdated: formatTimestamp(new Date())
        });
        setSelectedServices(initialPolicy?.services || []);
    }, [initialPolicy, storageTargets]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setPolicy(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedServices(value);
        setPolicy(prev => ({ ...prev, services: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(policy);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-gray-300">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-400">Policy Name</label>
                <input type="text" id="name" name="name" value={policy.name} onChange={handleChange} required
                       className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none" />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-400">Description</label>
                <textarea id="description" name="description" value={policy.description} onChange={handleChange}
                          className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none"></textarea>
            </div>
            <div>
                <label htmlFor="services" className="block text-sm font-medium text-gray-400">Covered Services</label>
                <select multiple id="services" name="services" value={selectedServices} onChange={handleServiceChange} required
                        className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none min-h-[80px]">
                    {services.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple services.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="frequency" className="block text-sm font-medium text-gray-400">Frequency</label>
                    <select id="frequency" name="frequency" value={policy.frequency} onChange={handleChange} required
                            className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none">
                        {Object.values(BackupFrequency).map(f => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="schedule" className="block text-sm font-medium text-gray-400">Schedule Details</label>
                    <input type="text" id="schedule" name="schedule" value={policy.schedule} onChange={handleChange} required
                           className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none" />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label htmlFor="retentionDays" className="block text-sm font-medium text-gray-400">Retention (Days)</label>
                    <input type="number" id="retentionDays" name="retentionDays" value={policy.retentionDays} onChange={handleChange} required
                           min="1" className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none" />
                </div>
                <div>
                    <label htmlFor="backupType" className="block text-sm font-medium text-gray-400">Backup Type</label>
                    <select id="backupType" name="backupType" value={policy.backupType} onChange={handleChange} required
                            className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none">
                        {Object.values(BackupType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="storageTargetId" className="block text-sm font-medium text-gray-400">Storage Target</label>
                    <select id="storageTargetId" name="storageTargetId" value={policy.storageTargetId} onChange={handleChange} required
                            className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none">
                        {storageTargets.map(target => (
                            <option key={target.id} value={target.id}>{target.name} ({target.type})</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="rpoValue" className="block text-sm font-medium text-gray-400">RPO Value</label>
                    <input type="number" id="rpoValue" name="rpoValue" value={policy.rpoValue} onChange={handleChange} required
                           min="1" className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none" />
                </div>
                <div>
                    <label htmlFor="rpoUnit" className="block text-sm font-medium text-gray-400">RPO Unit</label>
                    <select id="rpoUnit" name="rpoUnit" value={policy.rpoUnit} onChange={handleChange} required
                            className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none">
                        {Object.values(RPOUnit).map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex items-center">
                <input type="checkbox" id="enabled" name="enabled" checked={policy.enabled} onChange={handleChange}
                       className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500" />
                <label htmlFor="enabled" className="ml-2 block text-sm text-gray-400">Enabled</label>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
                <ActionButton label="Cancel" onClick={onCancel} variant="secondary" disabled={isLoading} />
                <ActionButton label={initialPolicy ? "Update Policy" : "Create Policy"} onClick={handleSubmit} isLoading={isLoading} loadingText="Saving..." />
            </div>
        </form>
    );
};

/**
 * Form for creating/editing a recovery plan.
 */
export interface RecoveryPlanFormProps {
    plan?: RecoveryPlan;
    onSave: (plan: RecoveryPlan) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
    policies: BackupPolicy[];
    services: string[];
}

export const RecoveryPlanForm: React.FC<RecoveryPlanFormProps> = ({
    plan: initialPlan, onSave, onCancel, isLoading, policies, services
}) => {
    const [plan, setPlan] = useState<RecoveryPlan>(
        initialPlan || {
            id: generateUniqueId(),
            name: '',
            description: '',
            targetServices: [],
            rtoUnit: RTOUnit.HOURS,
            rtoValue: 1,
            recoverySteps: [''],
            validationSteps: [''],
            associatedPolicies: [],
            lastTested: null,
            status: PlaybookStatus.DRAFT,
            createdBy: 'current_user@example.com',
            lastModifiedBy: 'current_user@example.com',
            version: '1.0'
        }
    );
    const [selectedTargetServices, setSelectedTargetServices] = useState<string[]>(initialPlan?.targetServices || []);
    const [selectedAssociatedPolicies, setSelectedAssociatedPolicies] = useState<string[]>(initialPlan?.associatedPolicies || []);

    useEffect(() => {
        setPlan(initialPlan || {
            id: generateUniqueId(),
            name: '',
            description: '',
            targetServices: [],
            rtoUnit: RTOUnit.HOURS,
            rtoValue: 1,
            recoverySteps: [''],
            validationSteps: [''],
            associatedPolicies: [],
            lastTested: null,
            status: PlaybookStatus.DRAFT,
            createdBy: 'current_user@example.com',
            lastModifiedBy: 'current_user@example.com',
            version: '1.0'
        });
        setSelectedTargetServices(initialPlan?.targetServices || []);
        setSelectedAssociatedPolicies(initialPlan?.associatedPolicies || []);
    }, [initialPlan]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPlan(prev => ({ ...prev, [name]: value }));
    };

    const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedTargetServices(value);
        setPlan(prev => ({ ...prev, targetServices: value }));
    };

    const handlePolicyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedAssociatedPolicies(value);
        setPlan(prev => ({ ...prev, associatedPolicies: value }));
    };

    const handleStepChange = (index: number, value: string, type: 'recovery' | 'validation') => {
        if (type === 'recovery') {
            const newSteps = [...plan.recoverySteps];
            newSteps[index] = value;
            setPlan(prev => ({ ...prev, recoverySteps: newSteps }));
        } else {
            const newSteps = [...plan.validationSteps];
            newSteps[index] = value;
            setPlan(prev => ({ ...prev, validationSteps: newSteps }));
        }
    };

    const addStep = (type: 'recovery' | 'validation') => {
        if (type === 'recovery') {
            setPlan(prev => ({ ...prev, recoverySteps: [...prev.recoverySteps, ''] }));
        } else {
            setPlan(prev => ({ ...prev, validationSteps: [...prev.validationSteps, ''] }));
        }
    };

    const removeStep = (index: number, type: 'recovery' | 'validation') => {
        if (type === 'recovery') {
            setPlan(prev => ({ ...prev, recoverySteps: prev.recoverySteps.filter((_, i) => i !== index) }));
        } else {
            setPlan(prev => ({ ...prev, validationSteps: prev.validationSteps.filter((_, i) => i !== index) }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(plan);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-gray-300">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-400">Plan Name</label>
                <input type="text" id="name" name="name" value={plan.name} onChange={handleChange} required
                       className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none" />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-400">Description</label>
                <textarea id="description" name="description" value={plan.description} onChange={handleChange}
                          className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none"></textarea>
            </div>
            <div>
                <label htmlFor="targetServices" className="block text-sm font-medium text-gray-400">Target Services</label>
                <select multiple id="targetServices" name="targetServices" value={selectedTargetServices} onChange={handleServiceChange} required
                        className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none min-h-[80px]">
                    {services.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple services.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="rtoValue" className="block text-sm font-medium text-gray-400">RTO Value</label>
                    <input type="number" id="rtoValue" name="rtoValue" value={plan.rtoValue} onChange={handleChange} required
                           min="1" className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none" />
                </div>
                <div>
                    <label htmlFor="rtoUnit" className="block text-sm font-medium text-gray-400">RTO Unit</label>
                    <select id="rtoUnit" name="rtoUnit" value={plan.rtoUnit} onChange={handleChange} required
                            className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none">
                        {Object.values(RTOUnit).map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                </div>
            </div>

            {/* Recovery Steps */}
            <div>
                <label className="block text-sm font-medium text-gray-400">Recovery Steps</label>
                {plan.recoverySteps.map((step, index) => (
                    <div key={`rec-step-${index}`} className="flex items-center space-x-2 mb-2">
                        <textarea
                            value={step}
                            onChange={(e) => handleStepChange(index, e.target.value, 'recovery')}
                            rows={2}
                            className="flex-grow bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none"
                            placeholder={`Step ${index + 1}`}
                        />
                        <ActionButton label="-" onClick={() => removeStep(index, 'recovery')} variant="danger" className="h-fit" />
                    </div>
                ))}
                <ActionButton label="Add Recovery Step" onClick={() => addStep('recovery')} variant="secondary" className="mt-2" />
            </div>

            {/* Validation Steps */}
            <div>
                <label className="block text-sm font-medium text-gray-400">Validation Steps</label>
                {plan.validationSteps.map((step, index) => (
                    <div key={`val-step-${index}`} className="flex items-center space-x-2 mb-2">
                        <textarea
                            value={step}
                            onChange={(e) => handleStepChange(index, e.target.value, 'validation')}
                            rows={2}
                            className="flex-grow bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none"
                            placeholder={`Step ${index + 1}`}
                        />
                        <ActionButton label="-" onClick={() => removeStep(index, 'validation')} variant="danger" className="h-fit" />
                    </div>
                ))}
                <ActionButton label="Add Validation Step" onClick={() => addStep('validation')} variant="secondary" className="mt-2" />
            </div>

            <div>
                <label htmlFor="associatedPolicies" className="block text-sm font-medium text-gray-400">Associated Backup Policies</label>
                <select multiple id="associatedPolicies" name="associatedPolicies" value={selectedAssociatedPolicies} onChange={handlePolicyChange}
                        className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none min-h-[80px]">
                    {policies.map(p => <option key={p.id} value={p.id}>{p.name} ({p.frequency})</option>)}
                </select>
                <p className="text-xs text-gray-500 mt-1">Select policies that feed backups for this plan.</p>
            </div>

            <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-400">Plan Status</label>
                <select id="status" name="status" value={plan.status} onChange={handleChange} required
                        className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none">
                    {Object.values(PlaybookStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
                <ActionButton label="Cancel" onClick={onCancel} variant="secondary" disabled={isLoading} />
                <ActionButton label={initialPlan ? "Update Plan" : "Create Plan"} onClick={handleSubmit} isLoading={isLoading} loadingText="Saving..." />
            </div>
        </form>
    );
};

/**
 * Form for creating/editing a storage target.
 */
export interface StorageTargetFormProps {
    target?: StorageTarget;
    onSave: (target: StorageTarget) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}

export const StorageTargetForm: React.FC<StorageTargetFormProps> = ({ target: initialTarget, onSave, onCancel, isLoading }) => {
    const [target, setTarget] = useState<StorageTarget>(
        initialTarget || {
            id: generateUniqueId(),
            name: '',
            type: StorageTargetType.S3,
            location: '',
            capacityBytes: 1024 * 1024 * 1024 * 1024, // 1TB default
            usedBytes: 0,
            enabled: true,
            createdAt: formatTimestamp(new Date())
        }
    );

    useEffect(() => {
        setTarget(initialTarget || {
            id: generateUniqueId(),
            name: '',
            type: StorageTargetType.S3,
            location: '',
            capacityBytes: 1024 * 1024 * 1024 * 1024,
            usedBytes: 0,
            enabled: true,
            createdAt: formatTimestamp(new Date())
        });
    }, [initialTarget]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setTarget(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (name === 'capacityBytes' || name === 'usedBytes' ? parseInt(value) || 0 : value)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(target);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-gray-300">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-400">Target Name</label>
                <input type="text" id="name" name="name" value={target.name} onChange={handleChange} required
                       className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none" />
            </div>
            <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-400">Storage Type</label>
                <select id="type" name="type" value={target.type} onChange={handleChange} required
                        className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none">
                    {Object.values(StorageTargetType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-400">Location/Region</label>
                <input type="text" id="location" name="location" value={target.location} onChange={handleChange} required
                       className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none" />
            </div>
            {(target.type === StorageTargetType.S3 || target.type === StorageTargetType.GCS || target.type === StorageTargetType.AZURE_BLOB) && (
                <>
                    <div>
                        <label htmlFor="endpoint" className="block text-sm font-medium text-gray-400">Endpoint URL (Optional)</label>
                        <input type="text" id="endpoint" name="endpoint" value={target.endpoint || ''} onChange={handleChange}
                               className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none" />
                    </div>
                    <div>
                        <label htmlFor="accessKeyId" className="block text-sm font-medium text-gray-400">Access Key ID</label>
                        <input type="password" id="accessKeyId" name="accessKeyId" value={target.accessKeyId || ''} onChange={handleChange}
                               className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none" />
                    </div>
                    <div>
                        <label htmlFor="secretAccessKey" className="block text-sm font-medium text-gray-400">Secret Access Key</label>
                        <input type="password" id="secretAccessKey" name="secretAccessKey" value={target.secretAccessKey || ''} onChange={handleChange}
                               className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none" />
                    </div>
                </>
            )}
            {(target.type === StorageTargetType.NFS || target.type === StorageTargetType.LOCAL) && (
                <div>
                    <label htmlFor="mountPath" className="block text-sm font-medium text-gray-400">Mount Path</label>
                    <input type="text" id="mountPath" name="mountPath" value={target.mountPath || ''} onChange={handleChange} required
                           className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none" />
                </div>
            )}
            <div>
                <label htmlFor="capacityBytes" className="block text-sm font-medium text-gray-400">Total Capacity (Bytes)</label>
                <input type="number" id="capacityBytes" name="capacityBytes" value={target.capacityBytes} onChange={handleChange} required
                       min="0" className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none" />
                <p className="text-xs text-gray-500 mt-1">Current: {formatBytes(target.capacityBytes)}</p>
            </div>
            <div>
                <label htmlFor="usedBytes" className="block text-sm font-medium text-gray-400">Used Capacity (Bytes)</label>
                <input type="number" id="usedBytes" name="usedBytes" value={target.usedBytes} onChange={handleChange} required
                       min="0" max={target.capacityBytes} className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none" />
                <p className="text-xs text-gray-500 mt-1">Current: {formatBytes(target.usedBytes)}</p>
            </div>
            <div className="flex items-center">
                <input type="checkbox" id="enabled" name="enabled" checked={target.enabled} onChange={handleChange}
                       className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500" />
                <label htmlFor="enabled" className="ml-2 block text-sm text-gray-400">Enabled</label>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
                <ActionButton label="Cancel" onClick={onCancel} variant="secondary" disabled={isLoading} />
                <ActionButton label={initialTarget ? "Update Target" : "Add Target"} onClick={handleSubmit} isLoading={isLoading} loadingText="Saving..." />
            </div>
        </form>
    );
};

// --- MAIN BACKUPRECOVERYVIEW COMPONENT ---

const BackupRecoveryView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("BackupRecoveryView must be within DataProvider");

    const { backupJobs: initialBackupJobs, services: availableServices } = context;

    // --- Core State Management ---
    const [detailedBackupJobs, setDetailedBackupJobs] = useState<DetailedBackupJob[]>(() => generateMockDetailedBackupJob(20));
    const [backupPolicies, setBackupPolicies] = useState<BackupPolicy[]>(() => generateMockBackupPolicies(5));
    const [storageTargets, setStorageTargets] = useState<StorageTarget[]>(() => generateMockStorageTargets(3));
    const [recoveryPlans, setRecoveryPlans] = useState<RecoveryPlan[]>(() => generateMockRecoveryPlans(5, backupPolicies));
    const [drDrills, setDrDrills] = useState<DRDrill[]>(() => generateMockDRDrills(10, recoveryPlans));
    const [alertRules, setAlertRules] = useState<AlertRule[]>(() => generateMockAlertRules(4));
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => generateMockAuditLogs(30));
    const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>(() => generateMockComplianceReports(3));

    // --- UI State Management for Modals & Forms ---
    const [isSimulatorOpen, setSimulatorOpen] = useState(false);
    const [scenario, setScenario] = useState("Primary database corruption");
    const [aiPlan, setAiPlan] = useState(''); // Renamed to aiPlan to avoid conflict with `plan` variable within component
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isPolicyFormOpen, setPolicyFormOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<BackupPolicy | undefined>(undefined);
    const [isRecoveryPlanFormOpen, setRecoveryPlanFormOpen] = useState(false);
    const [editingRecoveryPlan, setEditingRecoveryPlan] = useState<RecoveryPlan | undefined>(undefined);
    const [isStorageTargetFormOpen, setStorageTargetFormOpen] = useState(false);
    const [editingStorageTarget, setEditingStorageTarget] = useState<StorageTarget | undefined>(undefined);
    const [selectedDrillPlanId, setSelectedDrillPlanId] = useState<string | null>(null);
    const [isTriggerDrillModalOpen, setTriggerDrillModalOpen] = useState(false);
    const [isAlertRuleFormOpen, setAlertRuleFormOpen] = useState(false);
    const [editingAlertRule, setEditingAlertRule] = useState<AlertRule | undefined>(undefined);
    const [selectedJobForDetails, setSelectedJobForDetails] = useState<DetailedBackupJob | null>(null);
    const [isJobDetailsModalOpen, setJobDetailsModalOpen] = useState(false);
    const [isManualBackupModalOpen, setManualBackupModalOpen] = useState(false);
    const [manualBackupService, setManualBackupService] = useState<string>('');
    const [manualBackupType, setManualBackupType] = useState<BackupType>(BackupType.FULL);
    const [isManualBackupLoading, setIsManualBackupLoading] = useState(false);

    // --- Derived State & Memorized Values ---
    const successfulBackups24h = useMemo(() => {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return detailedBackupJobs.filter(job =>
            job.status === BackupStatus.SUCCESS &&
            new Date(job.timestamp).getTime() > twentyFourHoursAgo.getTime()
        ).length;
    }, [detailedBackupJobs]);

    const totalBackups24h = useMemo(() => {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return detailedBackupJobs.filter(job =>
            new Date(job.timestamp).getTime() > twentyFourHoursAgo.getTime()
        ).length;
    }, [detailedBackupJobs]);

    const backupSuccessRate = useMemo(() => {
        return totalBackups24h > 0 ? (successfulBackups24h / totalBackups24h * 100).toFixed(2) : 'N/A';
    }, [successfulBackups24h, totalBackups24h]);

    const overallRPO = useMemo(() => {
        // Simple average for demonstration; in real-world, this would be more complex
        if (backupPolicies.length === 0) return 'N/A';
        const totalMinutes = backupPolicies.reduce((sum, p) => {
            let minutes = p.rpoValue;
            if (p.rpoUnit === RPOUnit.HOURS) minutes *= 60;
            if (p.rpoUnit === RPOUnit.DAYS) minutes *= 24 * 60;
            return sum + minutes;
        }, 0);
        return `${Math.round(totalMinutes / backupPolicies.length / 60)}h`;
    }, [backupPolicies]);

    const overallRTO = useMemo(() => {
        // Simple average for demonstration
        if (recoveryPlans.length === 0) return 'N/A';
        const totalMinutes = recoveryPlans.reduce((sum, p) => {
            let minutes = p.rtoValue;
            if (p.rtoUnit === RTOUnit.HOURS) minutes *= 60;
            if (p.rtoUnit === RTOUnit.DAYS) minutes *= 24 * 60;
            return sum + minutes;
        }, 0);
        return `${Math.round(totalMinutes / recoveryPlans.length / 60)}h`;
    }, [recoveryPlans]);

    const totalStorageCapacity = useMemo(() => storageTargets.reduce((sum, t) => sum + t.capacityBytes, 0), [storageTargets]);
    const totalStorageUsed = useMemo(() => storageTargets.reduce((sum, t) => sum + t.usedBytes, 0), [storageTargets]);
    const storageUtilization = useMemo(() => totalStorageCapacity > 0 ? (totalStorageUsed / totalStorageCapacity * 100).toFixed(2) : '0', [totalStorageCapacity, totalStorageUsed]);

    // --- API & State Update Handlers ---

    /**
     * Handles the AI DR Plan simulation.
     */
    const handleSimulate = async () => {
        setIsAiLoading(true); setAiPlan('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Generate a high-level disaster recovery plan (DRP) for this scenario: "${scenario}". Include steps for failover, data restoration, and post-recovery validation. Make it detailed, around 500 words, and structured with headings.`;
            const model = ai.getGenerativeModel({ model: 'gemini-pro' }); // Using a more capable model
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            setAiPlan(text);
        } catch (err) {
            console.error("AI Simulation Error:", err);
            setAiPlan("Failed to generate plan. Please check API key and try again. Error: " + (err as Error).message);
        } finally {
            setIsAiLoading(false);
        }
    };

    /**
     * Handles saving a backup policy (create or update).
     * @param {BackupPolicy} policy - The policy to save.
     */
    const handleSavePolicy = useCallback(async (policy: BackupPolicy) => {
        // Simulate API call
        setIsAiLoading(true); // Re-using AI loading state for general form submission simulation
        await new Promise(resolve => setTimeout(resolve, 1500));
        setBackupPolicies(prev => {
            const existingIndex = prev.findIndex(p => p.id === policy.id);
            if (existingIndex > -1) {
                const updated = [...prev];
                updated[existingIndex] = { ...policy, lastUpdated: formatTimestamp(new Date()) };
                return updated;
            }
            return [...prev, policy];
        });
        setPolicyFormOpen(false);
        setEditingPolicy(undefined);
        setIsAiLoading(false);
        console.log("Saved policy:", policy);
    }, []);

    /**
     * Handles deleting a backup policy.
     * @param {string} policyId - The ID of the policy to delete.
     */
    const handleDeletePolicy = useCallback(async (policyId: string) => {
        if (!window.confirm("Are you sure you want to delete this policy?")) return;
        setIsAiLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setBackupPolicies(prev => prev.filter(p => p.id !== policyId));
        setIsAiLoading(false);
        console.log("Deleted policy:", policyId);
    }, []);

    /**
     * Handles saving a recovery plan.
     * @param {RecoveryPlan} plan - The plan to save.
     */
    const handleSaveRecoveryPlan = useCallback(async (plan: RecoveryPlan) => {
        setIsAiLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setRecoveryPlans(prev => {
            const existingIndex = prev.findIndex(p => p.id === plan.id);
            if (existingIndex > -1) {
                const updated = [...prev];
                updated[existingIndex] = { ...plan, lastModifiedBy: 'current_user@example.com', lastTested: plan.lastTested || null };
                return updated;
            }
            return [...prev, plan];
        });
        setRecoveryPlanFormOpen(false);
        setEditingRecoveryPlan(undefined);
        setIsAiLoading(false);
        console.log("Saved recovery plan:", plan);
    }, []);

    /**
     * Handles deleting a recovery plan.
     * @param {string} planId - The ID of the plan to delete.
     */
    const handleDeleteRecoveryPlan = useCallback(async (planId: string) => {
        if (!window.confirm("Are you sure you want to delete this recovery plan?")) return;
        setIsAiLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRecoveryPlans(prev => prev.filter(p => p.id !== planId));
        setIsAiLoading(false);
        console.log("Deleted recovery plan:", planId);
    }, []);

    /**
     * Handles saving a storage target.
     * @param {StorageTarget} target - The storage target to save.
     */
    const handleSaveStorageTarget = useCallback(async (target: StorageTarget) => {
        setIsAiLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStorageTargets(prev => {
            const existingIndex = prev.findIndex(t => t.id === target.id);
            if (existingIndex > -1) {
                const updated = [...prev];
                updated[existingIndex] = target;
                return updated;
            }
            return [...prev, target];
        });
        setStorageTargetFormOpen(false);
        setEditingStorageTarget(undefined);
        setIsAiLoading(false);
        console.log("Saved storage target:", target);
    }, []);

    /**
     * Handles deleting a storage target.
     * @param {string} targetId - The ID of the target to delete.
     */
    const handleDeleteStorageTarget = useCallback(async (targetId: string) => {
        if (!window.confirm("Are you sure you want to delete this storage target?")) return;
        setIsAiLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStorageTargets(prev => prev.filter(t => t.id !== targetId));
        setIsAiLoading(false);
        console.log("Deleted storage target:", targetId);
    }, []);

    /**
     * Triggers a DR drill for a selected plan.
     */
    const handleTriggerDrill = useCallback(async () => {
        if (!selectedDrillPlanId) return;
        setIsAiLoading(true); // Re-using for drill
        setTriggerDrillModalOpen(false);
        console.log(`Triggering DR drill for plan: ${selectedDrillPlanId}`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate drill initiation
        const newDrill: DRDrill = {
            id: `drill-${generateUniqueId()}`,
            planId: selectedDrillPlanId,
            planName: recoveryPlans.find(p => p.id === selectedDrillPlanId)?.name || 'Unknown Plan',
            startTime: formatTimestamp(new Date()),
            endTime: null,
            status: DRDrillStatus.IN_PROGRESS,
            triggeredBy: 'current_user@example.com',
            outcome: 'Drill initiated...',
            logs: [`DR Drill for plan ${selectedDrillPlanId} initiated.`],
            durationMinutes: null
        };
        setDrDrills(prev => [newDrill, ...prev]);
        setSelectedDrillPlanId(null);
        setIsAiLoading(false);

        // Simulate drill completion after a delay
        setTimeout(() => {
            setDrDrills(prev => prev.map(drill => {
                if (drill.id === newDrill.id) {
                    const duration = Math.floor(Math.random() * 120) + 30;
                    return {
                        ...drill,
                        endTime: formatTimestamp(new Date(new Date(drill.startTime).getTime() + duration * 60 * 1000)),
                        status: Math.random() > 0.2 ? DRDrillStatus.COMPLETED_SUCCESS : DRDrillStatus.COMPLETED_FAILED,
                        outcome: Math.random() > 0.2 ? 'Drill completed successfully, RTO/RPO validated.' : 'Drill failed, identified issues in restoration phase.',
                        durationMinutes: duration,
                        logs: [...drill.logs, `Drill completed. Status: ${Math.random() > 0.2 ? 'SUCCESS' : 'FAILED'}`]
                    };
                }
                return drill;
            }));
        }, Math.random() * 10000 + 5000); // 5 to 15 seconds for drill to complete
    }, [selectedDrillPlanId, recoveryPlans]);

    /**
     * Handles saving an alert rule.
     * @param {AlertRule} rule - The alert rule to save.
     */
    const handleSaveAlertRule = useCallback(async (rule: AlertRule) => {
        setIsAiLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setAlertRules(prev => {
            const existingIndex = prev.findIndex(r => r.id === rule.id);
            if (existingIndex > -1) {
                const updated = [...prev];
                updated[existingIndex] = rule;
                return updated;
            }
            return [...prev, rule];
        });
        setAlertRuleFormOpen(false);
        setEditingAlertRule(undefined);
        setIsAiLoading(false);
        console.log("Saved alert rule:", rule);
    }, []);

    /**
     * Handles deleting an alert rule.
     * @param {string} ruleId - The ID of the rule to delete.
     */
    const handleDeleteAlertRule = useCallback(async (ruleId: string) => {
        if (!window.confirm("Are you sure you want to delete this alert rule?")) return;
        setIsAiLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAlertRules(prev => prev.filter(r => r.id !== ruleId));
        setIsAiLoading(false);
        console.log("Deleted alert rule:", ruleId);
    }, []);

    /**
     * Triggers a manual backup for a specified service and type.
     */
    const handleTriggerManualBackup = useCallback(async () => {
        if (!manualBackupService) {
            alert('Please select a service for manual backup.');
            return;
        }

        setIsManualBackupLoading(true);
        setManualBackupModalOpen(false);
        console.log(`Initiating manual ${manualBackupType} backup for service: ${manualBackupService}`);

        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call to start backup

        const newJob: DetailedBackupJob = {
            id: generateUniqueId(),
            service: manualBackupService,
            type: manualBackupType,
            status: BackupStatus.IN_PROGRESS,
            timestamp: formatTimestamp(new Date()),
            duration: '0m 0s',
            size: 0,
            logs: [`Manual ${manualBackupType} backup initiated for ${manualBackupService}.`],
            progress: 0,
            recoveryPoint: formatTimestamp(new Date())
        };

        setDetailedBackupJobs(prev => [newJob, ...prev]);
        setIsManualBackupLoading(false);

        // Simulate backup completion
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += 10;
            if (currentProgress > 100) {
                clearInterval(interval);
                setDetailedBackupJobs(prev => prev.map(job => {
                    if (job.id === newJob.id) {
                        const finalStatus = Math.random() > 0.1 ? BackupStatus.SUCCESS : BackupStatus.FAILED; // 10% failure chance
                        const finalSize = Math.floor(Math.random() * (200 * 1024 * 1024)) + (5 * 1024 * 1024); // 5MB to 200MB
                        const finalDurationSeconds = Math.floor(Math.random() * 300) + 30; // 30 sec to 5 min
                        const finalDuration = `${Math.floor(finalDurationSeconds / 60)}m ${finalDurationSeconds % 60}s`;
                        return {
                            ...job,
                            status: finalStatus,
                            duration: finalDuration,
                            size: finalSize,
                            progress: 100,
                            logs: [...job.logs, `Backup completed. Status: ${finalStatus}. Size: ${formatBytes(finalSize)}. Duration: ${finalDuration}.`]
                        };
                    }
                    return job;
                }));
            } else {
                setDetailedBackupJobs(prev => prev.map(job =>
                    job.id === newJob.id ? { ...job, progress: currentProgress } : job
                ));
            }
        }, 500); // Update progress every 0.5 seconds
    }, [manualBackupService, manualBackupType]);

    // --- JSX Rendering Logic ---
    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Backup & Recovery Operations Center</h2>
                    <div className="flex space-x-3">
                        <ActionButton
                            label="Manual Backup"
                            onClick={() => setManualBackupModalOpen(true)}
                            variant="primary"
                        />
                        <ActionButton
                            label="AI DR Plan Simulator"
                            onClick={() => setSimulatorOpen(true)}
                            variant="secondary"
                        />
                    </div>
                </div>

                {/* Top-level Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="text-center">
                        <p className="text-3xl font-bold text-green-400">{backupSuccessRate}%</p>
                        <p className="text-sm text-gray-400 mt-1">Backup Success (24h)</p>
                    </Card>
                    <Card className="text-center">
                        <p className="text-3xl font-bold text-white">{overallRPO}</p>
                        <p className="text-sm text-gray-400 mt-1">Avg. Recovery Point Objective</p>
                    </Card>
                    <Card className="text-center">
                        <p className="text-3xl font-bold text-white">{overallRTO}</p>
                        <p className="text-sm text-gray-400 mt-1">Avg. Recovery Time Objective</p>
                    </Card>
                    <Card className="text-center">
                        <p className="text-3xl font-bold text-cyan-400">{storageUtilization}%</p>
                        <p className="text-sm text-gray-400 mt-1">Storage Utilization</p>
                    </Card>
                </div>

                {/* Recent Backup Jobs - Expanded */}
                <CollapsibleSection title="Recent Backup Jobs" defaultOpen={true}>
                    <table className="w-full text-sm text-gray-300">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-4 py-2 text-left">Service</th>
                                <th scope="col" className="px-4 py-2 text-left">Type</th>
                                <th scope="col" className="px-4 py-2 text-left">Status</th>
                                <th scope="col" className="px-4 py-2 text-left">Timestamp</th>
                                <th scope="col" className="px-4 py-2 text-left">Duration</th>
                                <th scope="col" className="px-4 py-2 text-left">Size</th>
                                <th scope="col" className="px-4 py-2 text-left">Progress</th>
                                <th scope="col" className="px-4 py-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detailedBackupJobs.slice(0, 10).map(job => (
                                <tr key={job.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                                    <td className="px-4 py-2">{job.service}</td>
                                    <td className="px-4 py-2">{job.type}</td>
                                    <td className="px-4 py-2"><StatusBadge status={job.status} /></td>
                                    <td className="px-4 py-2">{job.timestamp}</td>
                                    <td className="px-4 py-2">{job.duration}</td>
                                    <td className="px-4 py-2">{formatBytes(job.size)}</td>
                                    <td className="px-4 py-2">
                                        <ProgressBar progress={job.progress} />
                                    </td>
                                    <td className="px-4 py-2">
                                        <ActionButton
                                            label="Details"
                                            onClick={() => { setSelectedJobForDetails(job); setJobDetailsModalOpen(true); }}
                                            variant="secondary"
                                            className="px-2 py-1"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-4 text-center">
                        <ActionButton label="View All Backup Jobs" onClick={() => {/* navigate to full jobs list */}} variant="secondary" />
                    </div>
                </CollapsibleSection>

                {/* Backup Policies Management */}
                <CollapsibleSection title="Backup Policies">
                    <div className="mb-4 flex justify-end">
                        <ActionButton label="Create New Policy" onClick={() => { setEditingPolicy(undefined); setPolicyFormOpen(true); }} />
                    </div>
                    <table className="w-full text-sm text-gray-300">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-4 py-2 text-left">Name</th>
                                <th scope="col" className="px-4 py-2 text-left">Services</th>
                                <th scope="col" className="px-4 py-2 text-left">Frequency</th>
                                <th scope="col" className="px-4 py-2 text-left">Retention</th>
                                <th scope="col" className="px-4 py-2 text-left">RPO</th>
                                <th scope="col" className="px-4 py-2 text-left">Status</th>
                                <th scope="col" className="px-4 py-2 text-left">Last Updated</th>
                                <th scope="col" className="px-4 py-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {backupPolicies.map(policy => (
                                <tr key={policy.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                                    <td className="px-4 py-2">{policy.name}</td>
                                    <td className="px-4 py-2">{policy.services.join(', ')}</td>
                                    <td className="px-4 py-2">{policy.frequency.replace(/_/g, ' ')}</td>
                                    <td className="px-4 py-2">{policy.retentionDays} days</td>
                                    <td className="px-4 py-2">{policy.rpoValue} {policy.rpoUnit}</td>
                                    <td className="px-4 py-2"><StatusBadge status={policy.enabled ? 'ACTIVE' : 'DISABLED'} type={policy.enabled ? 'success' : 'error'} /></td>
                                    <td className="px-4 py-2">{policy.lastUpdated}</td>
                                    <td className="px-4 py-2 flex space-x-2">
                                        <ActionButton
                                            label="Edit"
                                            onClick={() => { setEditingPolicy(policy); setPolicyFormOpen(true); }}
                                            variant="secondary"
                                            className="px-2 py-1"
                                        />
                                        <ActionButton
                                            label="Delete"
                                            onClick={() => handleDeletePolicy(policy.id)}
                                            variant="danger"
                                            className="px-2 py-1"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CollapsibleSection>

                {/* Recovery Plans & DR Drills */}
                <CollapsibleSection title="Recovery Plans & DR Drills">
                    <div className="mb-4 flex justify-end space-x-2">
                        <ActionButton label="Create New Plan" onClick={() => { setEditingRecoveryPlan(undefined); setRecoveryPlanFormOpen(true); }} />
                        <ActionButton label="Trigger DR Drill" onClick={() => setTriggerDrillModalOpen(true)} variant="danger" />
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-3">Recovery Plans</h4>
                    <table className="w-full text-sm text-gray-300 mb-8">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-4 py-2 text-left">Name</th>
                                <th scope="col" className="px-4 py-2 text-left">Target Services</th>
                                <th scope="col" className="px-4 py-2 text-left">RTO</th>
                                <th scope="col" className="px-4 py-2 text-left">Status</th>
                                <th scope="col" className="px-4 py-2 text-left">Last Tested</th>
                                <th scope="col" className="px-4 py-2 text-left">Version</th>
                                <th scope="col" className="px-4 py-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recoveryPlans.map(plan => (
                                <tr key={plan.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                                    <td className="px-4 py-2">{plan.name}</td>
                                    <td className="px-4 py-2">{plan.targetServices.join(', ')}</td>
                                    <td className="px-4 py-2">{plan.rtoValue} {plan.rtoUnit}</td>
                                    <td className="px-4 py-2"><StatusBadge status={plan.status} /></td>
                                    <td className="px-4 py-2">{plan.lastTested || 'Never'}</td>
                                    <td className="px-4 py-2">{plan.version}</td>
                                    <td className="px-4 py-2 flex space-x-2">
                                        <ActionButton
                                            label="Edit"
                                            onClick={() => { setEditingRecoveryPlan(plan); setRecoveryPlanFormOpen(true); }}
                                            variant="secondary"
                                            className="px-2 py-1"
                                        />
                                        <ActionButton
                                            label="Delete"
                                            onClick={() => handleDeleteRecoveryPlan(plan.id)}
                                            variant="danger"
                                            className="px-2 py-1"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <h4 className="text-xl font-semibold text-white mb-3">Recent DR Drills</h4>
                    <table className="w-full text-sm text-gray-300">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-4 py-2 text-left">Plan</th>
                                <th scope="col" className="px-4 py-2 text-left">Start Time</th>
                                <th scope="col" className="px-4 py-2 text-left">End Time</th>
                                <th scope="col" className="px-4 py-2 text-left">Duration</th>
                                <th scope="col" className="px-4 py-2 text-left">Status</th>
                                <th scope="col" className="px-4 py-2 text-left">Triggered By</th>
                                <th scope="col" className="px-4 py-2 text-left">Outcome</th>
                                <th scope="col" className="px-4 py-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drDrills.slice(0, 5).map(drill => (
                                <tr key={drill.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                                    <td className="px-4 py-2">{drill.planName}</td>
                                    <td className="px-4 py-2">{drill.startTime}</td>
                                    <td className="px-4 py-2">{drill.endTime || 'N/A'}</td>
                                    <td className="px-4 py-2">{drill.durationMinutes ? `${drill.durationMinutes} min` : 'N/A'}</td>
                                    <td className="px-4 py-2"><StatusBadge status={drill.status} /></td>
                                    <td className="px-4 py-2">{drill.triggeredBy}</td>
                                    <td className="px-4 py-2 max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">{drill.outcome}</td>
                                    <td className="px-4 py-2">
                                        <ActionButton
                                            label="View Logs"
                                            onClick={() => alert(`Drill Logs for ${drill.planName}:\n${drill.logs.join('\n')}`)}
                                            variant="secondary"
                                            className="px-2 py-1"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-4 text-center">
                        <ActionButton label="View All DR Drills" onClick={() => {/* navigate to full drills list */}} variant="secondary" />
                    </div>
                </CollapsibleSection>

                {/* Storage Targets Management */}
                <CollapsibleSection title="Storage Targets">
                    <div className="mb-4 flex justify-end">
                        <ActionButton label="Add New Target" onClick={() => { setEditingStorageTarget(undefined); setStorageTargetFormOpen(true); }} />
                    </div>
                    <table className="w-full text-sm text-gray-300">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-4 py-2 text-left">Name</th>
                                <th scope="col" className="px-4 py-2 text-left">Type</th>
                                <th scope="col" className="px-4 py-2 text-left">Location</th>
                                <th scope="col" className="px-4 py-2 text-left">Capacity</th>
                                <th scope="col" className="px-4 py-2 text-left">Used</th>
                                <th scope="col" className="px-4 py-2 text-left">Utilization</th>
                                <th scope="col" className="px-4 py-2 text-left">Status</th>
                                <th scope="col" className="px-4 py-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {storageTargets.map(target => (
                                <tr key={target.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                                    <td className="px-4 py-2">{target.name}</td>
                                    <td className="px-4 py-2">{target.type}</td>
                                    <td className="px-4 py-2">{target.location}</td>
                                    <td className="px-4 py-2">{formatBytes(target.capacityBytes)}</td>
                                    <td className="px-4 py-2">{formatBytes(target.usedBytes)}</td>
                                    <td className="px-4 py-2">
                                        <ProgressBar
                                            progress={(target.usedBytes / target.capacityBytes) * 100}
                                            color={(target.usedBytes / target.capacityBytes) > 0.8 ? 'bg-red-500' : 'bg-cyan-500'}
                                        />
                                    </td>
                                    <td className="px-4 py-2"><StatusBadge status={target.enabled ? 'ACTIVE' : 'DISABLED'} type={target.enabled ? 'success' : 'error'} /></td>
                                    <td className="px-4 py-2 flex space-x-2">
                                        <ActionButton
                                            label="Edit"
                                            onClick={() => { setEditingStorageTarget(target); setStorageTargetFormOpen(true); }}
                                            variant="secondary"
                                            className="px-2 py-1"
                                        />
                                        <ActionButton
                                            label="Delete"
                                            onClick={() => handleDeleteStorageTarget(target.id)}
                                            variant="danger"
                                            className="px-2 py-1"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CollapsibleSection>

                {/* Monitoring & Alerting */}
                <CollapsibleSection title="Alert Rules">
                    <div className="mb-4 flex justify-end">
                        <ActionButton label="Create New Rule" onClick={() => { setEditingAlertRule(undefined); setAlertRuleFormOpen(true); }} />
                    </div>
                    <table className="w-full text-sm text-gray-300">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-4 py-2 text-left">Name</th>
                                <th scope="col" className="px-4 py-2 text-left">Condition</th>
                                <th scope="col" className="px-4 py-2 text-left">Severity</th>
                                <th scope="col" className="px-4 py-2 text-left">Channels</th>
                                <th scope="col" className="px-4 py-2 text-left">Status</th>
                                <th scope="col" className="px-4 py-2 text-left">Last Triggered</th>
                                <th scope="col" className="px-4 py-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alertRules.map(rule => (
                                <tr key={rule.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                                    <td className="px-4 py-2">{rule.name}</td>
                                    <td className="px-4 py-2">{rule.condition}</td>
                                    <td className="px-4 py-2"><StatusBadge status={rule.severity} /></td>
                                    <td className="px-4 py-2">{rule.notificationChannels.join(', ')}</td>
                                    <td className="px-4 py-2"><StatusBadge status={rule.enabled ? 'ENABLED' : 'DISABLED'} type={rule.enabled ? 'success' : 'error'} /></td>
                                    <td className="px-4 py-2">{rule.lastTriggered || 'Never'}</td>
                                    <td className="px-4 py-2 flex space-x-2">
                                        <ActionButton
                                            label="Edit"
                                            onClick={() => { setEditingAlertRule(rule); setAlertRuleFormOpen(true); }}
                                            variant="secondary"
                                            className="px-2 py-1"
                                        />
                                        <ActionButton
                                            label="Delete"
                                            onClick={() => handleDeleteAlertRule(rule.id)}
                                            variant="danger"
                                            className="px-2 py-1"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CollapsibleSection>

                {/* Compliance & Audit */}
                <CollapsibleSection title="Compliance Reports">
                    <div className="mb-4 flex justify-end">
                        <ActionButton label="Generate New Report" onClick={() => alert('Generating new compliance report...')} />
                    </div>
                    <table className="w-full text-sm text-gray-300">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-4 py-2 text-left">Standard</th>
                                <th scope="col" className="px-4 py-2 text-left">Generation Date</th>
                                <th scope="col" className="px-4 py-2 text-left">Period</th>
                                <th scope="col" className="px-4 py-2 text-left">Status</th>
                                <th scope="col" className="px-4 py-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {complianceReports.map(report => (
                                <tr key={report.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                                    <td className="px-4 py-2">{report.standard}</td>
                                    <td className="px-4 py-2">{report.generationDate}</td>
                                    <td className="px-4 py-2">{report.periodStart} - {report.periodEnd}</td>
                                    <td className="px-4 py-2"><StatusBadge status={report.complianceStatus} /></td>
                                    <td className="px-4 py-2">
                                        {report.reportFileUrl && (
                                            <a href={report.reportFileUrl} target="_blank" rel="noopener noreferrer">
                                                <ActionButton label="View Report" variant="secondary" className="px-2 py-1" />
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CollapsibleSection>

                <CollapsibleSection title="Audit Logs">
                    <table className="w-full text-sm text-gray-300">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-4 py-2 text-left">Timestamp</th>
                                <th scope="col" className="px-4 py-2 text-left">Actor</th>
                                <th scope="col" className="px-4 py-2 text-left">Action</th>
                                <th scope="col" className="px-4 py-2 text-left">Target</th>
                                <th scope="col" className="px-4 py-2 text-left">IP Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditLogs.slice(0, 15).map(log => (
                                <tr key={log.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                                    <td className="px-4 py-2">{log.timestamp}</td>
                                    <td className="px-4 py-2">{log.actor}</td>
                                    <td className="px-4 py-2">{log.action}</td>
                                    <td className="px-4 py-2">{log.target}</td>
                                    <td className="px-4 py-2">{log.ipAddress}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-4 text-center">
                        <ActionButton label="View All Audit Logs" onClick={() => {/* navigate to full audit logs */}} variant="secondary" />
                    </div>
                </CollapsibleSection>
            </div>

            {/* AI DR Plan Simulator Modal */}
            <Modal isOpen={isSimulatorOpen} onClose={() => setSimulatorOpen(false)} title="AI DR Plan Simulator">
                <div className="p-6 space-y-4">
                    <label htmlFor="scenarioInput" className="block text-sm font-medium text-gray-400">Describe your disaster scenario:</label>
                    <textarea
                        id="scenarioInput"
                        value={scenario}
                        onChange={e => setScenario(e.target.value)}
                        className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none min-h-[100px]"
                        placeholder="e.g., 'Primary data center outage affecting all services', 'Ransomware attack encrypting critical databases'"
                    />
                    <ActionButton
                        label="Simulate DR Plan"
                        onClick={handleSimulate}
                        isLoading={isAiLoading}
                        loadingText="Simulating..."
                        className="w-full"
                    />
                    {aiPlan && (
                        <Card title="Simulated Plan">
                            <div className="min-h-[10rem] max-h-60 overflow-y-auto text-sm text-gray-300 whitespace-pre-line p-2 bg-gray-900/30 rounded">
                                {aiPlan}
                            </div>
                        </Card>
                    )}
                </div>
            </Modal>

            {/* Backup Policy Form Modal */}
            <Modal isOpen={isPolicyFormOpen} onClose={() => setPolicyFormOpen(false)} title={editingPolicy ? "Edit Backup Policy" : "Create Backup Policy"} widthClass="max-w-3xl">
                <BackupPolicyForm
                    policy={editingPolicy}
                    onSave={handleSavePolicy}
                    onCancel={() => { setPolicyFormOpen(false); setEditingPolicy(undefined); }}
                    isLoading={isAiLoading}
                    storageTargets={storageTargets}
                    services={availableServices || MOCK_SERVICES}
                />
            </Modal>

            {/* Recovery Plan Form Modal */}
            <Modal isOpen={isRecoveryPlanFormOpen} onClose={() => setRecoveryPlanFormOpen(false)} title={editingRecoveryPlan ? "Edit Recovery Plan" : "Create Recovery Plan"} widthClass="max-w-4xl">
                <RecoveryPlanForm
                    plan={editingRecoveryPlan}
                    onSave={handleSaveRecoveryPlan}
                    onCancel={() => { setRecoveryPlanFormOpen(false); setEditingRecoveryPlan(undefined); }}
                    isLoading={isAiLoading}
                    policies={backupPolicies}
                    services={availableServices || MOCK_SERVICES}
                />
            </Modal>

            {/* Storage Target Form Modal */}
            <Modal isOpen={isStorageTargetFormOpen} onClose={() => setStorageTargetFormOpen(false)} title={editingStorageTarget ? "Edit Storage Target" : "Add Storage Target"} widthClass="max-w-2xl">
                <StorageTargetForm
                    target={editingStorageTarget}
                    onSave={handleSaveStorageTarget}
                    onCancel={() => { setStorageTargetFormOpen(false); setEditingStorageTarget(undefined); }}
                    isLoading={isAiLoading}
                />
            </Modal>

            {/* Trigger DR Drill Modal */}
            <Modal isOpen={isTriggerDrillModalOpen} onClose={() => setTriggerDrillModalOpen(false)} title="Trigger Disaster Recovery Drill">
                <div className="space-y-4 text-gray-300">
                    <p className="text-gray-400">Select a recovery plan to initiate a simulated DR drill. This will test the plan's effectiveness without impacting production.</p>
                    <div>
                        <label htmlFor="drillPlanSelect" className="block text-sm font-medium text-gray-400">Select Recovery Plan</label>
                        <select
                            id="drillPlanSelect"
                            value={selectedDrillPlanId || ''}
                            onChange={(e) => setSelectedDrillPlanId(e.target.value)}
                            className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none"
                            required
                        >
                            <option value="">-- Select a Plan --</option>
                            {recoveryPlans.filter(p => p.status === PlaybookStatus.ACTIVE).map(plan => (
                                <option key={plan.id} value={plan.id}>{plan.name} (RTO: {plan.rtoValue}{plan.rtoUnit.charAt(0)})</option>
                            ))}
                        </select>
                    </div>
                    <p className="text-yellow-400 text-sm">
                        <span className="font-bold">Warning:</span> Triggering a drill will create an entry in the DR Drills log and simulate the recovery process.
                    </p>
                    <div className="flex justify-end space-x-2">
                        <ActionButton label="Cancel" onClick={() => setTriggerDrillModalOpen(false)} variant="secondary" disabled={isAiLoading} />
                        <ActionButton label="Start Drill" onClick={handleTriggerDrill} isLoading={isAiLoading} loadingText="Initiating..." disabled={!selectedDrillPlanId} />
                    </div>
                </div>
            </Modal>

            {/* Alert Rule Form Modal */}
            <Modal isOpen={isAlertRuleFormOpen} onClose={() => setAlertRuleFormOpen(false)} title={editingAlertRule ? "Edit Alert Rule" : "Create Alert Rule"} widthClass="max-w-2xl">
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    await handleSaveAlertRule(editingAlertRule || {
                        id: generateUniqueId(),
                        name: '',
                        description: '',
                        condition: '',
                        severity: AlertSeverity.MEDIUM,
                        notificationChannels: [],
                        enabled: true,
                        lastTriggered: null
                    });
                }} className="space-y-4 text-gray-300">
                    <div>
                        <label htmlFor="alertName" className="block text-sm font-medium text-gray-400">Rule Name</label>
                        <input
                            type="text" id="alertName" name="name"
                            value={editingAlertRule?.name || ''}
                            onChange={(e) => setEditingAlertRule(prev => ({ ...prev!, name: e.target.value }))}
                            className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="alertDescription" className="block text-sm font-medium text-gray-400">Description</label>
                        <textarea
                            id="alertDescription" name="description"
                            value={editingAlertRule?.description || ''}
                            onChange={(e) => setEditingAlertRule(prev => ({ ...prev!, description: e.target.value }))}
                            className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="alertCondition" className="block text-sm font-medium text-gray-400">Condition</label>
                        <input
                            type="text" id="alertCondition" name="condition"
                            value={editingAlertRule?.condition || ''}
                            onChange={(e) => setEditingAlertRule(prev => ({ ...prev!, condition: e.target.value }))}
                            className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none"
                            placeholder="e.g., 'Backup Failure Rate > 10%'"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="alertSeverity" className="block text-sm font-medium text-gray-400">Severity</label>
                        <select
                            id="alertSeverity" name="severity"
                            value={editingAlertRule?.severity || AlertSeverity.MEDIUM}
                            onChange={(e) => setEditingAlertRule(prev => ({ ...prev!, severity: e.target.value as AlertSeverity }))}
                            className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none"
                            required
                        >
                            {Object.values(AlertSeverity).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="notificationChannels" className="block text-sm font-medium text-gray-400">Notification Channels (comma-separated)</label>
                        <input
                            type="text" id="notificationChannels" name="notificationChannels"
                            value={editingAlertRule?.notificationChannels.join(', ') || ''}
                            onChange={(e) => setEditingAlertRule(prev => ({ ...prev!, notificationChannels: e.target.value.split(',').map(c => c.trim()).filter(Boolean) }))}
                            className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none"
                            placeholder="e.g., 'email:ops@example.com, slack:#dr-alerts'"
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox" id="alertEnabled" name="enabled"
                            checked={editingAlertRule?.enabled || false}
                            onChange={(e) => setEditingAlertRule(prev => ({ ...prev!, enabled: e.target.checked }))}
                            className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                        />
                        <label htmlFor="alertEnabled" className="ml-2 block text-sm text-gray-400">Enabled</label>
                    </div>
                    <div className="flex justify-end space-x-2 mt-6">
                        <ActionButton label="Cancel" onClick={() => { setAlertRuleFormOpen(false); setEditingAlertRule(undefined); }} variant="secondary" disabled={isAiLoading} />
                        <ActionButton label={editingAlertRule ? "Update Rule" : "Create Rule"} type="submit" isLoading={isAiLoading} loadingText="Saving..." />
                    </div>
                </form>
            </Modal>

            {/* Backup Job Details Modal */}
            <Modal isOpen={isJobDetailsModalOpen} onClose={() => setJobDetailsModalOpen(false)} title="Backup Job Details" widthClass="max-w-2xl">
                {selectedJobForDetails ? (
                    <div className="space-y-3 text-gray-300">
                        <p><strong>Service:</strong> {selectedJobForDetails.service}</p>
                        <p><strong>Type:</strong> {selectedJobForDetails.type}</p>
                        <p><strong>Status:</strong> <StatusBadge status={selectedJobForDetails.status} /></p>
                        <p><strong>Timestamp:</strong> {selectedJobForDetails.timestamp}</p>
                        <p><strong>Duration:</strong> {selectedJobForDetails.duration}</p>
                        <p><strong>Size:</strong> {formatBytes(selectedJobForDetails.size)}</p>
                        <p><strong>Recovery Point:</strong> {selectedJobForDetails.recoveryPoint}</p>
                        <div>
                            <strong>Logs:</strong>
                            <div className="bg-gray-900/50 p-3 rounded text-xs max-h-40 overflow-y-auto mt-1">
                                {selectedJobForDetails.logs.length > 0 ? (
                                    selectedJobForDetails.logs.map((log, i) => <p key={i}>{log}</p>)
                                ) : (
                                    <p>No logs available.</p>
                                )}
                            </div>
                        </div>
                        <div className="pt-2 border-t border-gray-700 text-right">
                            <ActionButton label="Initiate Recovery" onClick={() => alert(`Initiating recovery for ${selectedJobForDetails.service} from point ${selectedJobForDetails.recoveryPoint}.`)} variant="success" className="mr-2" />
                            <ActionButton label="Close" onClick={() => setJobDetailsModalOpen(false)} variant="secondary" />
                        </div>
                    </div>
                ) : <p>No job selected.</p>}
            </Modal>

            {/* Manual Backup Modal */}
            <Modal isOpen={isManualBackupModalOpen} onClose={() => setManualBackupModalOpen(false)} title="Trigger Manual Backup" widthClass="max-w-xl">
                <div className="space-y-4 text-gray-300">
                    <p className="text-gray-400">Manually trigger a backup for a specific service. This will run outside of scheduled policies.</p>
                    <div>
                        <label htmlFor="manualServiceSelect" className="block text-sm font-medium text-gray-400">Select Service</label>
                        <select
                            id="manualServiceSelect"
                            value={manualBackupService}
                            onChange={(e) => setManualBackupService(e.target.value)}
                            className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none"
                            required
                        >
                            <option value="">-- Select a Service --</option>
                            {(availableServices || MOCK_SERVICES).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="manualBackupType" className="block text-sm font-medium text-gray-400">Backup Type</label>
                        <select
                            id="manualBackupType"
                            value={manualBackupType}
                            onChange={(e) => setManualBackupType(e.target.value as BackupType)}
                            className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none"
                            required
                        >
                            {Object.values(BackupType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2 mt-6">
                        <ActionButton label="Cancel" onClick={() => setManualBackupModalOpen(false)} variant="secondary" disabled={isManualBackupLoading} />
                        <ActionButton label="Start Backup" onClick={handleTriggerManualBackup} isLoading={isManualBackupLoading} loadingText="Starting..." disabled={!manualBackupService} />
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default BackupRecoveryView;