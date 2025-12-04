import React, { useState, useMemo, useContext, useEffect, useCallback, useRef } from 'react'; // Added useEffect, useCallback, useRef
import Card from '../../../Card';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts'; // Added LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar
import { GoogleGenAI } from "@google/genai";
import { DataContext } from '../../../../context/DataContext';
import type { RiskProfile } from '../../../../types'; // Original type

// =====================================================================================================================
// START: EXTENDED TYPE DEFINITIONS
// For the purpose of this exercise, these types are defined locally. In a real app, they'd be in '../../../../types.ts'
// =====================================================================================================================

export type RiskFactorKey = 'transaction' | 'identity' | 'behavioral' | 'network' | 'geographic' | 'financial' | 'compliance' | 'social';

export interface RiskFactorConfig {
    key: RiskFactorKey;
    name: string;
    description: string;
    weight: number; // 0-100, contribution to overall score
    minThreshold: number; // Minimum acceptable score
    maxThreshold: number; // Maximum concerning score
    category: 'primary' | 'secondary' | 'environmental';
    isEnabled: boolean;
    lastUpdated: string;
    updatedBy: string;
}

export type RiskRuleOperator = '>' | '<' | '>=' | '<=' | '==' | '!=';
export type RiskRuleActionType = 'adjustScore' | 'setFlag' | 'applyPenalty' | 'recommendAction';
export type RiskRuleTarget = 'overallScore' | RiskFactorKey;

export interface RiskRuleCondition {
    factor: RiskFactorKey | 'overallScore';
    operator: RiskRuleOperator;
    value: number;
}

export interface RiskRuleAction {
    type: RiskRuleActionType;
    target: RiskRuleTarget;
    value?: number | string; // e.g., score adjustment, flag name
    message?: string; // For recommendations, penalties
}

export interface RiskRule {
    id: string;
    name: string;
    description: string;
    conditions: RiskRuleCondition[];
    actions: RiskRuleAction[];
    priority: number; // Lower number means higher priority
    isEnabled: boolean;
    createdBy: string;
    createdAt: string;
    lastModifiedBy: string;
    lastModifiedAt: string;
    version: number;
}

export interface HistoricalRiskRecord {
    timestamp: number; // Unix timestamp
    overallScore: number;
    factorScores: { [key in RiskFactorKey]?: number }; // Snapshot of factor scores
    triggeredRules: string[]; // IDs of rules that fired
    snapshotBy: string; // User or system that triggered the snapshot
    notes?: string;
}

export interface RiskAlertConfiguration {
    id: string;
    name: string;
    description: string;
    targetProfileIds: string[] | 'all'; // Which profiles this alert applies to
    thresholdOperator: RiskRuleOperator; // e.g., '>', '<'
    thresholdValue: number;
    factorTrigger?: RiskFactorKey; // Optional: trigger on a specific factor score
    notificationChannels: ('email' | 'slack' | 'dashboard' | 'sms')[];
    recipients: string[]; // User IDs or email addresses
    isEnabled: boolean;
    createdAt: string;
    lastModifiedAt: string;
}

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    userId: string;
    action: string; // e.g., 'CREATE_PROFILE', 'UPDATE_RULE', 'SIMULATE_RISK'
    entityType: 'RiskProfile' | 'RiskRule' | 'RiskFactorConfig' | 'RiskAlertConfig';
    entityId: string;
    details: Record<string, any>; // OldValue, NewValue, etc.
}

export interface RiskReportConfig {
    id: string;
    name: string;
    templateType: 'summary' | 'detailed' | 'historical';
    targetProfileIds: string[] | 'all';
    dateRange: {
        startDate: string; // ISO date string
        endDate: string; // ISO date string
    };
    includeSections: {
        summary: boolean;
        factorBreakdown: boolean;
        historicalTrends: boolean;
        triggeredRules: boolean;
        recommendations: boolean;
    };
    outputFormat: 'PDF' | 'CSV';
    schedule: 'manual' | 'daily' | 'weekly' | 'monthly';
    scheduledTime?: string; // HH:MM
    lastGenerated?: string; // ISO date string
    createdBy: string;
}

export type RiskProfileExtended = RiskProfile & {
    factors: { [key in RiskFactorKey]: number }; // Ensure all factors are present
    lastAnalyzed: string;
    version: number;
    status: 'active' | 'archived' | 'pending_review';
    tags: string[];
    riskScoreHistory: HistoricalRiskRecord[]; // Embedded history for simplicity
};

// =====================================================================================================================
// END: EXTENDED TYPE DEFINITIONS
// =====================================================================================================================

// =====================================================================================================================
// START: MOCK DATA AND UTILITIES (would typically be fetched from API or managed by DataContext)
// =====================================================================================================================

const mockFactorConfigs: RiskFactorConfig[] = [
    { key: 'transaction', name: 'Transaction Risk', description: 'Assesses risk related to transaction patterns and values.', weight: 25, minThreshold: 20, maxThreshold: 80, category: 'primary', isEnabled: true, lastUpdated: '2023-10-26T10:00:00Z', updatedBy: 'system' },
    { key: 'identity', name: 'Identity Risk', description: 'Evaluates the trustworthiness and verification level of the entity\'s identity.', weight: 30, minThreshold: 15, maxThreshold: 70, category: 'primary', isEnabled: true, lastUpdated: '2023-10-26T10:00:00Z', updatedBy: 'system' },
    { key: 'behavioral', name: 'Behavioral Risk', description: 'Monitors user behavior patterns for anomalies or suspicious activities.', weight: 20, minThreshold: 10, maxThreshold: 75, category: 'primary', isEnabled: true, lastUpdated: '2023-10-26T10:00:00Z', updatedBy: 'system' },
    { key: 'network', name: 'Network Risk', description: 'Analyzes network activity, IP reputation, and connection patterns.', weight: 15, minThreshold: 5, maxThreshold: 60, category: 'primary', isEnabled: true, lastUpdated: '2023-10-26T10:00:00Z', updatedBy: 'system' },
    { key: 'geographic', name: 'Geographic Risk', description: 'Risk associated with the entity\'s declared or observed geographic locations.', weight: 5, minThreshold: 0, maxThreshold: 50, category: 'secondary', isEnabled: true, lastUpdated: '2023-10-26T10:00:00Z', updatedBy: 'system' },
    { key: 'financial', name: 'Financial Risk', description: 'Risk related to financial stability, credit history, and asset verification.', weight: 10, minThreshold: 10, maxThreshold: 85, category: 'secondary', isEnabled: true, lastUpdated: '2023-10-26T10:00:00Z', updatedBy: 'system' },
    { key: 'compliance', name: 'Compliance Risk', description: 'Risk of non-adherence to regulatory requirements and internal policies.', weight: 10, minThreshold: 0, maxThreshold: 90, category: 'environmental', isEnabled: true, lastUpdated: '2023-10-26T10:00:00Z', updatedBy: 'system' },
    { key: 'social', name: 'Social Engineering Risk', description: 'Susceptibility to social engineering attacks or phishing attempts.', weight: 5, minThreshold: 0, maxThreshold: 60, category: 'environmental', isEnabled: true, lastUpdated: '2023-10-26T10:00:00Z', updatedBy: 'system' },
];

const mockRiskRules: RiskRule[] = [
    {
        id: 'rule-001', name: 'High Transaction & Identity Risk', description: 'Flags entities with extremely high transaction and identity scores.',
        conditions: [{ factor: 'transaction', operator: '>', value: 80 }, { factor: 'identity', operator: '>', value: 70 }],
        actions: [{ type: 'setFlag', target: 'overallScore', value: 'HighPriorityReview' }, { type: 'adjustScore', target: 'overallScore', value: 15 }],
        priority: 10, isEnabled: true, createdBy: 'admin', createdAt: '2023-01-01T00:00:00Z', lastModifiedBy: 'admin', lastModifiedAt: '2023-01-01T00:00:00Z', version: 1
    },
    {
        id: 'rule-002', name: 'Suspicious Behavioral Pattern', description: 'Increases score if behavioral risk is high and network risk is also elevated.',
        conditions: [{ factor: 'behavioral', operator: '>', value: 75 }, { factor: 'network', operator: '>', value: 50 }],
        actions: [{ type: 'adjustScore', target: 'overallScore', value: 10 }, { type: 'recommendAction', target: 'overallScore', message: 'Investigate behavioral anomalies' }],
        priority: 20, isEnabled: true, createdBy: 'admin', createdAt: '2023-01-05T00:00:00Z', lastModifiedBy: 'admin', lastModifiedAt: '2023-01-05T00:00:00Z', version: 1
    },
    {
        id: 'rule-003', name: 'Low Risk Profile Exemption', description: 'Reduces score slightly for very low risk profiles to prioritize others.',
        conditions: [{ factor: 'overallScore', operator: '<', value: 20 }],
        actions: [{ type: 'adjustScore', target: 'overallScore', value: -5 }],
        priority: 100, isEnabled: true, createdBy: 'system', createdAt: '2023-02-10T00:00:00Z', lastModifiedBy: 'system', lastModifiedAt: '2023-02-10T00:00:00Z', version: 1
    },
    {
        id: 'rule-004', name: 'Geographic Anomaly Alert', description: 'Triggers an alert if geographic risk is exceptionally high.',
        conditions: [{ factor: 'geographic', operator: '>', value: 85 }],
        actions: [{ type: 'setFlag', target: 'overallScore', value: 'GeographicMismatch' }],
        priority: 15, isEnabled: true, createdBy: 'security_analyst', createdAt: '2023-03-01T00:00:00Z', lastModifiedBy: 'security_analyst', lastModifiedAt: '2023-03-01T00:00:00Z', version: 1
    },
    {
        id: 'rule-005', name: 'New Entity Initial Review', description: 'Automatically flags new entities for an initial review if certain factors are missing or low.',
        conditions: [{ factor: 'transaction', operator: '<', value: 10 }, { factor: 'identity', operator: '<', value: 10 }],
        actions: [{ type: 'setFlag', target: 'overallScore', value: 'InitialReviewNeeded' }, { type: 'recommendAction', target: 'overallScore', message: 'Perform manual KYC/KYB for new entity.' }],
        priority: 5, isEnabled: true, createdBy: 'onboarding_team', createdAt: '2023-04-15T00:00:00Z', lastModifiedBy: 'onboarding_team', lastModifiedAt: '2023-04-15T00:00:00Z', version: 1
    },
    {
        id: 'rule-006', name: 'Compliance Violation detected', description: 'Sets a critical flag if compliance risk crosses a severe threshold.',
        conditions: [{ factor: 'compliance', operator: '>', value: 90 }],
        actions: [{ type: 'setFlag', target: 'overallScore', value: 'CriticalComplianceViolation' }, { type: 'adjustScore', target: 'overallScore', value: 20 }],
        priority: 1, isEnabled: true, createdBy: 'legal_team', createdAt: '2023-05-20T00:00:00Z', lastModifiedBy: 'legal_team', lastModifiedAt: '2023-05-20T00:00:00Z', version: 1
    },
    {
        id: 'rule-007', name: 'Elevated Financial and Transaction Risk', description: 'Identifies entities with combined high financial and transaction risks.',
        conditions: [{ factor: 'financial', operator: '>', value: 70 }, { factor: 'transaction', operator: '>', value: 70 }],
        actions: [{ type: 'setFlag', target: 'overallScore', value: 'HighFinancialTransactionRisk' }, { type: 'adjustScore', target: 'overallScore', value: 12 }],
        priority: 8, isEnabled: true, createdBy: 'risk_management', createdAt: '2023-06-01T00:00:00Z', lastModifiedBy: 'risk_management', lastModifiedAt: '2023-06-01T00:00:00Z', version: 1
    },
    {
        id: 'rule-008', name: 'Repeated Small Anomalies', description: 'If multiple minor factors are slightly elevated, increment overall risk.',
        conditions: [
            { factor: 'behavioral', operator: '>', value: 60 },
            { factor: 'network', operator: '>', value: 40 },
            { factor: 'geographic', operator: '>', value: 30 }
        ],
        actions: [{ type: 'adjustScore', target: 'overallScore', value: 8 }],
        priority: 30, isEnabled: true, createdBy: 'system', createdAt: '2023-07-10T00:00:00Z', lastModifiedBy: 'system', lastModifiedAt: '2023-07-10T00:00:00Z', version: 1
    },
    {
        id: 'rule-009', name: 'Suspicious IP Cluster Detection', description: 'If network risk is extreme, indicate potential bot activity.',
        conditions: [{ factor: 'network', operator: '>', value: 85 }],
        actions: [{ type: 'setFlag', target: 'overallScore', value: 'PotentialBotnetActivity' }, { type: 'recommendAction', target: 'overallScore', message: 'Block IP range and review associated accounts.' }],
        priority: 3, isEnabled: true, createdBy: 'security_analyst', createdAt: '2023-08-01T00:00:00Z', lastModifiedBy: 'security_analyst', lastModifiedAt: '2023-08-01T00:00:00Z', version: 1
    },
    {
        id: 'rule-010', name: 'Sanctioned Entity Match', description: 'Critical alert for identity matches against sanctioned lists.',
        conditions: [{ factor: 'identity', operator: '>', value: 95 }], // Assuming a high identity score implies a match
        actions: [{ type: 'setFlag', target: 'overallScore', value: 'SanctionedEntityMatch' }, { type: 'adjustScore', target: 'overallScore', value: 30 }, { type: 'recommendAction', target: 'overallScore', message: 'Immediately freeze assets and report to authorities.' }],
        priority: 0, isEnabled: true, createdBy: 'compliance_officer', createdAt: '2023-09-01T00:00:00Z', lastModifiedBy: 'compliance_officer', lastModifiedAt: '2023-09-01T00:00:00Z', version: 1
    },
    {
        id: 'rule-011', name: 'Weak Identity Verification', description: 'Increases risk if identity verification methods are considered weak.',
        conditions: [{ factor: 'identity', operator: '<', value: 30 }],
        actions: [{ type: 'adjustScore', target: 'overallScore', value: 5 }, { type: 'recommendAction', target: 'overallScore', message: 'Request stronger identity verification.' }],
        priority: 40, isEnabled: true, createdBy: 'onboarding_team', createdAt: '2023-09-15T00:00:00Z', lastModifiedBy: 'onboarding_team', lastModifiedAt: '2023-09-15T00:00:00Z', version: 1
    },
    {
        id: 'rule-012', name: 'High Volume Low Value Transactions', description: 'Identifies potential money mule activity.',
        conditions: [{ factor: 'transaction', operator: '>', value: 70 }, { factor: 'financial', operator: '<', value: 40 }], // High transaction volume but low financial stability
        actions: [{ type: 'setFlag', target: 'overallScore', value: 'PotentialMoneyMule' }, { type: 'adjustScore', target: 'overallScore', value: 18 }, { type: 'recommendAction', target: 'overallScore', message: 'Review transaction patterns and source of funds.' }],
        priority: 7, isEnabled: true, createdBy: 'risk_management', createdAt: '2023-10-01T00:00:00Z', lastModifiedBy: 'risk_management', lastModifiedAt: '2023-10-01T00:00:00Z', version: 1
    },
    {
        id: 'rule-013', name: 'Social Engineering Susceptibility', description: 'Flags entities exhibiting signs of being targeted or compromised via social engineering.',
        conditions: [{ factor: 'social', operator: '>', value: 70 }],
        actions: [{ type: 'setFlag', target: 'overallScore', value: 'SocialEngineeringTarget' }, { type: 'recommendAction', target: 'overallScore', message: 'Provide security awareness training.' }],
        priority: 25, isEnabled: true, createdBy: 'security_analyst', createdAt: '2023-10-10T00:00:00Z', lastModifiedBy: 'security_analyst', lastModifiedAt: '2023-10-10T00:00:00Z', version: 1
    },
    {
        id: 'rule-014', name: 'Low Compliance Score Warning', description: 'Warns if a profile has a below-average compliance score.',
        conditions: [{ factor: 'compliance', operator: '<', value: 50 }],
        actions: [{ type: 'setFlag', target: 'overallScore', value: 'ComplianceWarning' }, { type: 'recommendAction', target: 'overallScore', message: 'Review compliance documents and status.' }],
        priority: 50, isEnabled: true, createdBy: 'legal_team', createdAt: '2023-10-20T00:00:00Z', lastModifiedBy: 'legal_team', lastModifiedAt: '2023-10-20T00:00:00Z', version: 1
    },
    {
        id: 'rule-015', name: 'Elevated Identity & Geographic Mismatch', description: 'High risk when identity and geographic factors indicate conflicting information.',
        conditions: [{ factor: 'identity', operator: '>', value: 60 }, { factor: 'geographic', operator: '>', value: 60 }],
        actions: [{ type: 'setFlag', target: 'overallScore', value: 'IdentityGeographicMismatch' }, { type: 'adjustScore', target: 'overallScore', value: 15 }, { type: 'recommendAction', target: 'overallScore', message: 'Verify address and identity documents thoroughly.' }],
        priority: 12, isEnabled: true, createdBy: 'system', createdAt: '2023-10-25T00:00:00Z', lastModifiedBy: 'system', lastModifiedAt: '2023-10-25T00:00:00Z', version: 1
    },
    {
        id: 'rule-016', name: 'Multiple Factor Exceeds Average', description: 'Flags entities where multiple factors are above an average threshold, indicating general higher risk.',
        conditions: [
            { factor: 'transaction', operator: '>', value: 50 },
            { factor: 'identity', operator: '>', value: 50 },
            { factor: 'behavioral', operator: '>', value: 50 }
        ],
        actions: [{ type: 'adjustScore', target: 'overallScore', value: 7 }],
        priority: 45, isEnabled: true, createdBy: 'system', createdAt: '2023-11-01T00:00:00Z', lastModifiedBy: 'system', lastModifiedAt: '2023-11-01T00:00:00Z', version: 1
    },
    {
        id: 'rule-017', name: 'High-Value Entity, Low Verification', description: 'Increases scrutiny for profiles with significant financial involvement but poor identity verification.',
        conditions: [{ factor: 'financial', operator: '>', value: 80 }, { factor: 'identity', operator: '<', value: 40 }],
        actions: [{ type: 'setFlag', target: 'overallScore', value: 'HighValueLowVerification' }, { type: 'adjustScore', target: 'overallScore', value: 20 }, { type: 'recommendAction', target: 'overallScore', message: 'Mandatory enhanced due diligence for this entity.' }],
        priority: 2, isEnabled: true, createdBy: 'risk_management', createdAt: '2023-11-05T00:00:00Z', lastModifiedBy: 'risk_management', lastModifiedAt: '2023-11-05T00:00:00Z', version: 1
    },
    {
        id: 'rule-018', name: 'Continuous Suspicious Behavior', description: 'Applies a severe penalty if behavioral risk remains high over time (implied by high current score).',
        conditions: [{ factor: 'behavioral', operator: '>', value: 90 }],
        actions: [{ type: 'applyPenalty', target: 'overallScore', value: 25 }, { type: 'recommendAction', target: 'overallScore', message: 'Consider temporary suspension or account freeze.' }],
        priority: 6, isEnabled: true, createdBy: 'system', createdAt: '2023-11-10T00:00:00Z', lastModifiedBy: 'system', lastModifiedAt: '2023-11-10T00:00:00Z', version: 1
    },
    {
        id: 'rule-019', name: 'Abnormal Network Access Patterns', description: 'Flags if network risk indicates highly unusual access locations or times.',
        conditions: [{ factor: 'network', operator: '>', value: 75 }],
        actions: [{ type: 'setFlag', target: 'overallScore', value: 'AbnormalNetworkAccess' }, { type: 'recommendAction', target: 'overallScore', message: 'Force password reset and MFA verification.' }],
        priority: 9, isEnabled: true, createdBy: 'security_analyst', createdAt: '2023-11-15T00:00:00Z', lastModifiedBy: 'security_analyst', lastModifiedAt: '2023-11-15T00:00:00Z', version: 1
    },
    {
        id: 'rule-020', name: 'Low Overall Score, High Potential', description: 'Identifies entities with low current risk but high financial potential, suggesting close monitoring.',
        conditions: [{ factor: 'overallScore', operator: '<', value: 30 }, { factor: 'financial', operator: '>', value: 70 }],
        actions: [{ type: 'setFlag', target: 'overallScore', value: 'LowRiskHighPotential' }, { type: 'recommendAction', target: 'overallScore', message: 'Regular monitoring with standard risk checks.' }],
        priority: 60, isEnabled: true, createdBy: 'business_dev', createdAt: '2023-11-20T00:00:00Z', lastModifiedBy: 'business_dev', lastModifiedAt: '2023-11-20T00:00:00Z', version: 1
    },
    {
        id: 'rule-021', name: 'Rapid Increase in Transaction Volume', description: 'Captures sudden spikes in transaction activity not matching historical patterns.',
        conditions: [{ factor: 'transaction', operator: '>', value: 85 }], // Assuming a very high score indicates rapid increase
        actions: [{ type: 'setFlag', target: 'overallScore', value: 'RapidTxVolumeIncrease' }, { type: 'adjustScore', target: 'overallScore', value: 10 }, { type: 'recommendAction', target: 'overallScore', message: 'Review recent transaction history and source of funds.' }],
        priority: 11, isEnabled: true, createdBy: 'system', createdAt: '2023-11-25T00:00:00Z', lastModifiedBy: 'system', lastModifiedAt: '2023-11-25T00:00:00Z', version: 1
    },
    {
        id: 'rule-022', name: 'Conflicting Identity Attributes', description: 'Signals inconsistencies in provided identity information.',
        conditions: [{ factor: 'identity', operator: '>', value: 80 }], // High identity risk score can imply internal conflicts
        actions: [{ type: 'setFlag', target: 'overallScore', value: 'ConflictingIdentityData' }, { type: 'adjustScore', target: 'overallScore', value: 12 }, { type: 'recommendAction', target: 'overallScore', message: 'Manual verification of all identity documents and data points.' }],
        priority: 13, isEnabled: true, createdBy: 'compliance_officer', createdAt: '2023-12-01T00:00:00Z', lastModifiedBy: 'compliance_officer', lastModifiedAt: '2023-12-01T00:00:00Z', version: 1
    },
    {
        id: 'rule-023', name: 'Behavioral Deviation from Norm', description: 'Detects significant departures from an entity\'s established behavioral baseline.',
        conditions: [{ factor: 'behavioral', operator: '>', value: 80 }],
        actions: [{ type: 'setFlag', target: 'overallScore', value: 'BehavioralDeviation' }, { type: 'adjustScore', target: 'overallScore', value: 10 }, { type: 'recommendAction', target: 'overallScore', message: 'Analyze recent activity for unusual patterns.' }],
        priority: 14, isEnabled: true, createdBy: 'system', createdAt: '2023-12-05T00:00:00Z', lastModifiedBy: 'system', lastModifiedAt: '2023-12-05T00:00:00Z', version: 1
    },
    {
        id: 'rule-024', name: 'Multiple Failed Login Attempts', description: 'Elevates risk due to repeated unsuccessful authentication attempts.',
        conditions: [{ factor: 'network', operator: '>', value: 60 }, { factor: 'behavioral', operator: '>', value: 50 }], // Network for origin, behavioral for frequency
        actions: [{ type: 'setFlag', target: 'overallScore', value: 'MultipleFailedLogins' }, { type: 'adjustScore', target: 'overallScore', value: 8 }, { type: 'recommendAction', target: 'overallScore', message: 'Review login logs and consider temporary account lock.' }],
        priority: 22, isEnabled: true, createdBy: 'security_analyst', createdAt: '2023-12-10T00:00:00Z', lastModifiedBy: 'security_analyst', lastModifiedAt: '2023-12-10T00:00:00Z', version: 1
    },
    {
        id: 'rule-025', name: 'Lack of Recent Activity (Dormant Account Risk)', description: 'Flags accounts that have been dormant for extended periods, potentially reactivated for illicit purposes.',
        conditions: [{ factor: 'behavioral', operator: '<', value: 20 }, { factor: 'transaction', operator: '<', value: 10 }], // Low behavioral and transaction for dormancy
        actions: [{ type: 'setFlag', target: 'overallScore', value: 'DormantAccountRisk' }, { type: 'adjustScore', target: 'overallScore', value: 5 }, { type: 'recommendAction', target: 'overallScore', message: 'Monitor closely upon reactivation.' }],
        priority: 55, isEnabled: true, createdBy: 'system', createdAt: '2023-12-15T00:00:00Z', lastModifiedBy: 'system', lastModifiedAt: '2023-12-15T00:00:00Z', version: 1
    },
    {
        id: 'rule-026', name: 'High Risk Geo-location Access', description: 'Immediate flag for access attempts from known high-risk geographical regions.',
        conditions: [{ factor: 'geographic', operator: '>', value: 90 }],
        actions: [{ type: 'setFlag', target: 'overallScore', value: 'HighRiskGeoLocation' }, { type: 'adjustScore', target: 'overallScore', value: 20 }, { type: 'recommendAction', target: 'overallScore', message: 'Block access and alert user.' }],
        priority: 4, isEnabled: true, createdBy: 'security_ops', createdAt: '2023-12-20T00:00:00Z', lastModifiedBy: 'security_ops', lastModifiedAt: '2023-12-20T00:00:00Z', version: 1
    },
    {
        id: 'rule-027', name: 'Compromised Device Indication', description: 'Triggers if network and behavioral factors suggest a device compromise.',
        conditions: [{ factor: 'network', operator: '>', value: 80 }, { factor: 'behavioral', operator: '>', value: 70 }],
        actions: [{ type: 'setFlag', target: 'overallScore', value: 'CompromisedDevice' }, { type: 'adjustScore', target: 'overallScore', value: 25 }, { type: 'recommendAction', target: 'overallScore', message: 'Isolate device and initiate incident response.' }],
        priority: 2, isEnabled: true, createdBy: 'security_ops', createdAt: '2023-12-25T00:00:00Z', lastModifiedBy: 'security_ops', lastModifiedAt: '2023-12-25T00:00:00Z', version: 1
    },
    {
        id: 'rule-028', name: 'Pattern of Small Value Transfers to High Risk Regions', description: 'Detects micro-laundering patterns.',
        conditions: [{ factor: 'transaction', operator: '>', value: 70 }, { factor: 'geographic', operator: '>', value: 70 }, { factor: 'financial', operator: '<', value: 50 }],
        actions: [{ type: 'setFlag', target: 'overallScore', value: 'MicroLaunderingPattern' }, { type: 'adjustScore', target: 'overallScore', value: 18 }, { type: 'recommendAction', target: 'overallScore', message: 'Investigate transaction network and associated entities.' }],
        priority: 5, isEnabled: true, createdBy: 'financial_crimes', createdAt: '2024-01-01T00:00:00Z', lastModifiedBy: 'financial_crimes', lastModifiedAt: '2024-01-01T00:00:00Z', version: 1
    },
    {
        id: 'rule-029', name: 'New Registration from Known Fraudulent Network', description: 'Flags new identities originating from network indicators associated with fraud.',
        conditions: [{ factor: 'identity', operator: '>', value: 70 }, { factor: 'network', operator: '>', value: 70 }],
        actions: [{ type: 'setFlag', target: 'overallScore', value: 'FraudulentNetworkOrigin' }, { type: 'adjustScore', target: 'overallScore', value: 22 }, { type: 'recommendAction', target: 'overallScore', message: 'Deny registration and blacklist related identifiers.' }],
        priority: 1, isEnabled: true, createdBy: 'onboarding_team', createdAt: '2024-01-05T00:00:00Z', lastModifiedBy: 'onboarding_team', lastModifiedAt: '2024-01-05T00:00:00Z', version: 1
    },
    {
        id: 'rule-030', name: 'Excessive API Call Volume', description: 'Detects automated or bot-like behavior through API interaction patterns.',
        conditions: [{ factor: 'behavioral', operator: '>', value: 85 }], // Assuming API call volume contributes to behavioral risk
        actions: [{ type: 'setFlag', target: 'overallScore', value: 'ExcessiveAPICalls' }, { type: 'adjustScore', target: 'overallScore', value: 10 }, { type: 'recommendAction', target: 'overallScore', message: 'Rate-limit API access and review application logs.' }],
        priority: 16, isEnabled: true, createdBy: 'engineering', createdAt: '2024-01-10T00:00:00Z', lastModifiedBy: 'engineering', lastModifiedAt: '2024-01-10T00:00:00Z', version: 1
    },
];

const mockAlertConfigs: RiskAlertConfiguration[] = [
    {
        id: 'alert-001', name: 'Critical Risk Threshold Exceeded', description: 'Notify when any profile\'s overall score goes above 80.',
        targetProfileIds: 'all', thresholdOperator: '>', thresholdValue: 80,
        notificationChannels: ['email', 'dashboard'], recipients: ['admin@example.com'], isEnabled: true,
        createdAt: '2023-01-01T00:00:00Z', lastModifiedAt: '2023-01-01T00:00:00Z'
    },
    {
        id: 'alert-002', name: 'High Identity Risk Detected', description: 'Notify security team if identity risk is high for any profile.',
        targetProfileIds: 'all', thresholdOperator: '>', thresholdValue: 70, factorTrigger: 'identity',
        notificationChannels: ['slack', 'dashboard'], recipients: ['security_team@example.com'], isEnabled: true,
        createdAt: '2023-02-01T00:00:00Z', lastModifiedAt: '2023-02-01T00:00:00Z'
    },
    {
        id: 'alert-003', name: 'Transaction Risk Spike - Entity 123', description: 'Alert for specific entity (ent-123) if transaction risk jumps.',
        targetProfileIds: ['ent-123'], thresholdOperator: '>', thresholdValue: 75, factorTrigger: 'transaction',
        notificationChannels: ['email', 'sms'], recipients: ['risk_ops@example.com'], isEnabled: true,
        createdAt: '2023-03-01T00:00:00Z', lastModifiedAt: '2023-03-01T00:00:00Z'
    },
];

const mockReportConfigs: RiskReportConfig[] = [
    {
        id: 'report-001', name: 'Weekly Risk Summary', templateType: 'summary', targetProfileIds: 'all',
        dateRange: { startDate: '2023-10-01', endDate: '2023-10-07' },
        includeSections: { summary: true, factorBreakdown: true, historicalTrends: false, triggeredRules: false, recommendations: false },
        outputFormat: 'PDF', schedule: 'weekly', scheduledTime: '09:00',
        lastGenerated: '2023-10-08T09:00:00Z', createdBy: 'admin'
    },
    {
        id: 'report-002', name: 'Monthly Detailed Risk Analysis', templateType: 'detailed', targetProfileIds: 'all',
        dateRange: { startDate: '2023-09-01', endDate: '2023-09-30' },
        includeSections: { summary: true, factorBreakdown: true, historicalTrends: true, triggeredRules: true, recommendations: true },
        outputFormat: 'CSV', schedule: 'monthly', scheduledTime: '10:00',
        lastGenerated: '2023-10-01T10:00:00Z', createdBy: 'risk_analyst'
    },
];

// Utility to generate unique IDs
const generateUniqueId = (): string => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Utility to deep clone an object
const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

// Function to generate realistic historical risk data for a profile
export const generateRandomHistoricalData = (profileId: string, days: number = 30): HistoricalRiskRecord[] => {
    const history: HistoricalRiskRecord[] = [];
    let currentScore = Math.floor(Math.random() * 100);
    const factors: { [key in RiskFactorKey]: number } = {
        transaction: Math.floor(Math.random() * 100),
        identity: Math.floor(Math.random() * 100),
        behavioral: Math.floor(Math.random() * 100),
        network: Math.floor(Math.random() * 100),
        geographic: Math.floor(Math.random() * 100),
        financial: Math.floor(Math.random() * 100),
        compliance: Math.floor(Math.random() * 100),
        social: Math.floor(Math.random() * 100),
    };

    for (let i = days - 1; i >= 0; i--) {
        const timestamp = Date.now() - i * 24 * 60 * 60 * 1000; // Go back `i` days
        currentScore = Math.max(0, Math.min(100, currentScore + (Math.random() - 0.5) * 10)); // Jiggle score a bit
        Object.keys(factors).forEach(key => {
            factors[key as RiskFactorKey] = Math.max(0, Math.min(100, factors[key as RiskFactorKey] + (Math.random() - 0.5) * 8));
        });

        history.push({
            timestamp: timestamp,
            overallScore: Math.round(currentScore),
            factorScores: deepClone(factors),
            triggeredRules: Math.random() < 0.2 ? [mockRiskRules[Math.floor(Math.random() * mockRiskRules.length)].id] : [],
            snapshotBy: 'system',
        });
    }
    return history;
};

// Initialize some extended mock risk profiles
let initialMockRiskProfiles: RiskProfileExtended[] = [
    {
        id: 'ent-123', name: 'Acme Corp', type: 'Organization', overallScore: 78,
        factors: { transaction: 85, identity: 70, behavioral: 65, network: 80, geographic: 50, financial: 75, compliance: 60, social: 40 },
        lastAnalyzed: '2023-11-01T12:00:00Z', version: 1, status: 'active', tags: ['High Risk', 'Enterprise'],
        riskScoreHistory: generateRandomHistoricalData('ent-123', 60)
    },
    {
        id: 'user-456', name: 'John Doe', type: 'Individual', overallScore: 45,
        factors: { transaction: 40, identity: 55, behavioral: 30, network: 20, geographic: 30, financial: 60, compliance: 50, social: 20 },
        lastAnalyzed: '2023-11-02T10:30:00Z', version: 1, status: 'active', tags: ['Individual', 'Low Risk'],
        riskScoreHistory: generateRandomHistoricalData('user-456', 60)
    },
    {
        id: 'fin-789', name: 'Global Finance Inc.', type: 'Financial Institution', overallScore: 62,
        factors: { transaction: 60, identity: 65, behavioral: 50, network: 45, geographic: 70, financial: 80, compliance: 75, social: 30 },
        lastAnalyzed: '2023-10-30T14:00:00Z', version: 1, status: 'active', tags: ['Partner', 'Medium Risk'],
        riskScoreHistory: generateRandomHistoricalData('fin-789', 60)
    },
    {
        id: 'ecom-001', name: 'OnlineStoreX', type: 'E-commerce', overallScore: 30,
        factors: { transaction: 25, identity: 35, behavioral: 40, network: 30, geographic: 20, financial: 25, compliance: 30, social: 15 },
        lastAnalyzed: '2023-11-03T09:15:00Z', version: 1, status: 'active', tags: ['Vendor', 'Low Risk'],
        riskScoreHistory: generateRandomHistoricalData('ecom-001', 60)
    },
    {
        id: 'dev-202', name: 'Developer Team Alpha', type: 'Internal', overallScore: 18,
        factors: { transaction: 10, identity: 20, behavioral: 15, network: 5, geographic: 10, financial: 15, compliance: 20, social: 5 },
        lastAnalyzed: '2023-11-04T11:45:00Z', version: 1, status: 'archived', tags: ['Internal', 'No Risk'],
        riskScoreHistory: generateRandomHistoricalData('dev-202', 60)
    },
];

// Helper to evaluate a single rule condition
const evaluateCondition = (factorValue: number, condition: RiskRuleCondition): boolean => {
    switch (condition.operator) {
        case '>': return factorValue > condition.value;
        case '<': return factorValue < condition.value;
        case '>=': return factorValue >= condition.value;
        case '<=': return factorValue <= condition.value;
        case '==': return factorValue === condition.value;
        case '!=': return factorValue !== condition.value;
        default: return false;
    }
};

// Core function for applying rules to a risk profile
export const applyRiskRules = (profile: RiskProfileExtended, rules: RiskRule[], factorConfigs: RiskFactorConfig[]): {
    newOverallScore: number;
    triggeredRules: RiskRule[];
    flags: Set<string>;
    recommendations: Set<string>;
} => {
    let newOverallScore = profile.overallScore;
    const triggeredRules: RiskRule[] = [];
    const flags = new Set<string>();
    const recommendations = new Set<string>();

    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority); // Apply higher priority rules first

    for (const rule of sortedRules) {
        if (!rule.isEnabled) continue;

        const allConditionsMet = rule.conditions.every(condition => {
            const factorKey = condition.factor;
            let factorValue = 0;
            if (factorKey === 'overallScore') {
                factorValue = newOverallScore; // Use the potentially adjusted score
            } else {
                factorValue = profile.factors[factorKey as RiskFactorKey];
            }
            return evaluateCondition(factorValue, condition);
        });

        if (allConditionsMet) {
            triggeredRules.push(rule);
            for (const action of rule.actions) {
                if (action.type === 'adjustScore' && action.value !== undefined) {
                    newOverallScore += (action.value as number);
                } else if (action.type === 'setFlag' && typeof action.value === 'string') {
                    flags.add(action.value);
                } else if (action.type === 'applyPenalty' && action.value !== undefined) {
                    newOverallScore += (action.value as number); // Penalties increase score
                } else if (action.type === 'recommendAction' && typeof action.message === 'string') {
                    recommendations.add(action.message);
                }
            }
        }
    }

    // Ensure score stays within 0-100 range
    newOverallScore = Math.max(0, Math.min(100, newOverallScore));

    return { newOverallScore, triggeredRules, flags, recommendations };
};

// =====================================================================================================================
// END: MOCK DATA AND UTILITIES
// =====================================================================================================================

// =====================================================================================================================
// START: SHARED UI COMPONENTS
// =====================================================================================================================

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
    const baseClasses = "font-semibold py-2 px-4 rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";
    const variantClasses = {
        primary: "bg-cyan-600 hover:bg-cyan-700 text-white focus:ring-cyan-500",
        secondary: "bg-gray-700 hover:bg-gray-600 text-gray-200 focus:ring-gray-500",
        danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
        ghost: "bg-transparent hover:bg-gray-700 text-gray-300 focus:ring-gray-500 border border-gray-700",
    };
    const sizeClasses = {
        sm: "text-sm py-1 px-3",
        md: "text-base py-2 px-4",
        lg: "text-lg py-3 px-6",
    };
    return (
        <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>
            {children}
        </button>
    );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
    <input
        className={`w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${className}`}
        {...props}
    />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className = '', children, ...props }) => (
    <select
        className={`w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${className}`}
        {...props}
    >
        {children}
    </select>
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className = '', ...props }) => (
    <textarea
        className={`w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${className}`}
        rows={3}
        {...props}
    />
);

export const Slider: React.FC<{ value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number; label?: string; className?: string }> = ({ value, onChange, min = 0, max = 100, step = 1, label, className = '' }) => {
    return (
        <div className={`flex flex-col space-y-1 ${className}`}>
            {label && <label className="block text-gray-300 text-sm">{label}: <span className="font-mono text-cyan-400">{value}</span></label>}
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-lg [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:bg-gray-600 [&::-moz-range-thumb]:bg-cyan-500 [&::-moz-range-track]:bg-gray-600"
            />
        </div>
    );
};

export const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label?: string; className?: string; name?: string }> = ({ checked, onChange, label, className = '', name }) => {
    return (
        <label className={`flex items-center cursor-pointer ${className}`}>
            {label && <span className="mr-3 text-gray-300 text-sm">{label}</span>}
            <div className="relative">
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    name={name}
                />
                <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${checked ? 'translate-x-full bg-cyan-500' : ''}`}></div>
            </div>
        </label>
    );
};

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; className?: string }> = ({ isOpen, onClose, title, children, className = '' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
            <div className={`bg-gray-800 rounded-lg shadow-xl max-w-lg w-full transform transition-all duration-300 scale-100 opacity-100 ${className}`}>
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </Button>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const LoadingSpinner: React.FC<{ message?: string; size?: 'sm' | 'md' | 'lg' }> = ({ message = 'Loading...', size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-4',
        lg: 'w-12 h-12 border-6',
    };
    return (
        <div className="flex items-center justify-center p-4 text-gray-400">
            <div className={`animate-spin rounded-full ${sizeClasses[size]} border-cyan-500 border-t-transparent mr-3`}></div>
            <p>{message}</p>
        </div>
    );
};

export const PaginationControls: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void }> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex items-center justify-center space-x-2 mt-4">
            <Button
                variant="secondary"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                Previous
            </Button>
            {pageNumbers.map(page => (
                <Button
                    key={page}
                    variant={page === currentPage ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className={page === currentPage ? 'text-white' : 'text-gray-400 hover:text-white'}
                >
                    {page}
                </Button>
            ))}
            <Button
                variant="secondary"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next
            </Button>
        </div>
    );
};

export const TabbedContainer: React.FC<{ tabs: { id: string; title: string; content: React.ReactNode }[]; activeTab: string; onTabChange: (tabId: string) => void }> = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className="w-full">
            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ease-in-out ${
                                activeTab === tab.id
                                    ? 'border-cyan-500 text-cyan-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
                            }`}
                        >
                            {tab.title}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="mt-4">
                {tabs.find((tab) => tab.id === activeTab)?.content}
            </div>
        </div>
    );
};

export const AlertMessage: React.FC<{ type: 'info' | 'success' | 'warning' | 'error'; message: string; className?: string }> = ({ type, message, className = '' }) => {
    const classes = {
        info: 'bg-blue-900/30 border-blue-600 text-blue-300',
        success: 'bg-green-900/30 border-green-600 text-green-300',
        warning: 'bg-yellow-900/30 border-yellow-600 text-yellow-300',
        error: 'bg-red-900/30 border-red-600 text-red-300',
    };
    return (
        <div className={`p-3 rounded-md border ${classes[type]} ${className}`}>
            <p className="text-sm font-medium">{message}</p>
        </div>
    );
};

// =====================================================================================================================
// END: SHARED UI COMPONENTS
// =====================================================================================================================


// =====================================================================================================================
// START: RISK PROFILE MANAGEMENT COMPONENTS
// =====================================================================================================================

export const RiskProfileEditorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    profile: RiskProfileExtended | null; // null for create, object for edit
    onSave: (profile: RiskProfileExtended) => void;
    factorConfigs: RiskFactorConfig[];
}> = ({ isOpen, onClose, profile, onSave, factorConfigs }) => {
    const [formData, setFormData] = useState<RiskProfileExtended>(profile || {
        id: generateUniqueId(),
        name: '',
        type: 'Individual',
        overallScore: 0,
        factors: {
            transaction: 0, identity: 0, behavioral: 0, network: 0,
            geographic: 0, financial: 0, compliance: 0, social: 0
        },
        lastAnalyzed: new Date().toISOString(),
        version: 1,
        status: 'active',
        tags: [],
        riskScoreHistory: [],
    });

    useEffect(() => {
        if (profile) {
            setFormData(deepClone(profile));
        } else {
            setFormData({
                id: generateUniqueId(),
                name: '',
                type: 'Individual',
                overallScore: 0,
                factors: {
                    transaction: 0, identity: 0, behavioral: 0, network: 0,
                    geographic: 0, financial: 0, compliance: 0, social: 0
                },
                lastAnalyzed: new Date().toISOString(),
                version: 1,
                status: 'active',
                tags: [],
                riskScoreHistory: [],
            });
        }
    }, [profile, isOpen]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'tags') {
            setFormData(prev => ({ ...prev, tags: value.split(',').map(tag => tag.trim()).filter(Boolean) }));
        } else if (name in (formData.factors || {})) {
            setFormData(prev => ({ ...prev, factors: { ...prev.factors, [name]: Number(value) } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    }, [formData.factors]);

    const handleFactorChange = useCallback((key: RiskFactorKey, value: number) => {
        setFormData(prev => ({
            ...prev,
            factors: { ...prev.factors, [key]: value },
        }));
    }, []);

    const handleOverallScoreChange = useCallback((value: number) => {
        setFormData(prev => ({ ...prev, overallScore: value }));
    }, []);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    }, [formData, onSave, onClose]);

    const title = profile ? `Edit Risk Profile: ${profile.name}` : 'Create New Risk Profile';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-3xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Name</label>
                        <Input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Type</label>
                        <Select name="type" value={formData.type} onChange={handleChange}>
                            <option value="Individual">Individual</option>
                            <option value="Organization">Organization</option>
                            <option value="Financial Institution">Financial Institution</option>
                            <option value="E-commerce">E-commerce</option>
                            <option value="Internal">Internal</option>
                            <option value="Other">Other</option>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Status</label>
                        <Select name="status" value={formData.status} onChange={handleChange}>
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
                            <option value="pending_review">Pending Review</option>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Tags (comma-separated)</label>
                        <Input type="text" name="tags" value={formData.tags.join(', ')} onChange={handleChange} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-gray-700 pt-4 mt-4">
                    <h4 className="col-span-full text-lg font-semibold text-cyan-300">Factor Scores (0-100)</h4>
                    {factorConfigs.map(factor => (
                        <Slider
                            key={factor.key}
                            label={factor.name}
                            value={formData.factors[factor.key] || 0}
                            onChange={(val) => handleFactorChange(factor.key, val)}
                            min={0}
                            max={100}
                        />
                    ))}
                </div>

                <div className="border-t border-gray-700 pt-4 mt-4">
                    <Slider
                        label="Overall Risk Score (manually set or adjusted by rules)"
                        value={formData.overallScore}
                        onChange={handleOverallScoreChange}
                        min={0}
                        max={100}
                        className="mt-4"
                    />
                    <p className="text-sm text-gray-500 mt-1">Note: Overall score is often derived from factors and rules, manual adjustment might be overwritten.</p>
                </div>


                <div className="flex justify-end space-x-3 mt-6">
                    <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Profile</Button>
                </div>
            </form>
        </Modal>
    );
};

export const useRiskProfilesCRUD = (initialProfiles: RiskProfileExtended[]) => {
    const [profiles, setProfiles] = useState<RiskProfileExtended[]>(initialProfiles);

    const addProfile = useCallback((newProfile: RiskProfileExtended) => {
        setProfiles(prev => {
            const profileWithHistory = { ...newProfile, riskScoreHistory: generateRandomHistoricalData(newProfile.id, 1) }; // Add initial history
            return [...prev, profileWithHistory];
        });
    }, []);

    const updateProfile = useCallback((updatedProfile: RiskProfileExtended) => {
        setProfiles(prev => prev.map(p =>
            p.id === updatedProfile.id ? { ...updatedProfile, version: p.version + 1, lastAnalyzed: new Date().toISOString() } : p
        ));
    }, []);

    const deleteProfile = useCallback((profileId: string) => {
        setProfiles(prev => prev.filter(p => p.id !== profileId));
    }, []);

    return {
        profiles,
        addProfile,
        updateProfile,
        deleteProfile,
        setProfiles // Allow external updates, e.g., from rule engine
    };
};

// =====================================================================================================================
// END: RISK PROFILE MANAGEMENT COMPONENTS
// =====================================================================================================================


// =====================================================================================================================
// START: RISK FACTOR CONFIGURATION COMPONENTS
// =====================================================================================================================

export const FactorConfigEditorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    factorConfig: RiskFactorConfig | null; // null for create, object for edit
    onSave: (config: RiskFactorConfig) => void;
}> = ({ isOpen, onClose, factorConfig, onSave }) => {
    const [formData, setFormData] = useState<RiskFactorConfig>(factorConfig || {
        key: 'newFactor' as RiskFactorKey, // Placeholder, needs user input
        name: '',
        description: '',
        weight: 50,
        minThreshold: 0,
        maxThreshold: 100,
        category: 'secondary',
        isEnabled: true,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'user',
    });

    useEffect(() => {
        if (factorConfig) {
            setFormData(deepClone(factorConfig));
        } else {
            setFormData({
                key: `custom-${generateUniqueId().slice(0, 8)}` as RiskFactorKey,
                name: '',
                description: '',
                weight: 50,
                minThreshold: 0,
                maxThreshold: 100,
                category: 'secondary',
                isEnabled: true,
                lastUpdated: new Date().toISOString(),
                updatedBy: 'user',
            });
        }
    }, [factorConfig, isOpen]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value),
        }));
    }, []);

    const handleSliderChange = useCallback((name: keyof RiskFactorConfig, value: number) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);


    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, lastUpdated: new Date().toISOString(), updatedBy: 'currentUser' }); // Simulate user update
        onClose();
    }, [formData, onSave, onClose]);

    const title = factorConfig ? `Edit Factor: ${factorConfig.name}` : 'Create New Risk Factor';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Factor Key (Unique, system ID)</label>
                    <Input type="text" name="key" value={formData.key} onChange={handleChange} required disabled={!!factorConfig} />
                    {!factorConfig && <p className="text-xs text-gray-500 mt-1">Cannot be changed after creation.</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Name</label>
                    <Input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Description</label>
                    <Textarea name="description" value={formData.description} onChange={handleChange} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Category</label>
                    <Select name="category" value={formData.category} onChange={handleChange}>
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                        <option value="environmental">Environmental</option>
                    </Select>
                </div>

                <Slider label={`Weight: ${formData.weight}%`} value={formData.weight} onChange={(val) => handleSliderChange('weight', val)} min={0} max={100} step={1} />
                <Slider label={`Min Threshold: ${formData.minThreshold}`} value={formData.minThreshold} onChange={(val) => handleSliderChange('minThreshold', val)} min={0} max={100} step={1} />
                <Slider label={`Max Threshold: ${formData.maxThreshold}`} value={formData.maxThreshold} onChange={(val) => handleSliderChange('maxThreshold', val)} min={0} max={100} step={1} />

                <ToggleSwitch label="Is Enabled" checked={formData.isEnabled} onChange={(val) => setFormData(prev => ({ ...prev, isEnabled: val }))} />

                <div className="flex justify-end space-x-3 mt-6">
                    <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Factor</Button>
                </div>
            </form>
        </Modal>
    );
};

export const FactorConfigurationPanel: React.FC<{
    factorConfigs: RiskFactorConfig[];
    onUpdateFactor: (config: RiskFactorConfig) => void;
    onAddFactor: (config: RiskFactorConfig) => void;
    onDeleteFactor: (key: RiskFactorKey) => void;
}> = ({ factorConfigs, onUpdateFactor, onAddFactor, onDeleteFactor }) => {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [selectedFactor, setSelectedFactor] = useState<RiskFactorConfig | null>(null);

    const openEditor = useCallback((factor: RiskFactorConfig | null) => {
        setSelectedFactor(factor);
        setIsEditorOpen(true);
    }, []);

    const handleSave = useCallback((config: RiskFactorConfig) => {
        if (factorConfigs.some(f => f.key === config.key)) {
            onUpdateFactor(config);
        } else {
            onAddFactor(config);
        }
    }, [factorConfigs, onAddFactor, onUpdateFactor]);

    return (
        <Card title="Risk Factor Configuration" className="mt-6">
            <div className="flex justify-end mb-4">
                <Button onClick={() => openEditor(null)}>Add New Factor</Button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Factor Name</th>
                            <th scope="col" className="px-6 py-3">Key</th>
                            <th scope="col" className="px-6 py-3">Weight</th>
                            <th scope="col" className="px-6 py-3">Thresholds</th>
                            <th scope="col" className="px-6 py-3">Enabled</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {factorConfigs.map((factor) => (
                            <tr key={factor.key} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="px-6 py-4 font-medium text-white">{factor.name}</td>
                                <td className="px-6 py-4 font-mono text-xs">{factor.key}</td>
                                <td className="px-6 py-4">{factor.weight}%</td>
                                <td className="px-6 py-4">{factor.minThreshold}-{factor.maxThreshold}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${factor.isEnabled ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'}`}>
                                        {factor.isEnabled ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 space-x-2">
                                    <Button size="sm" variant="secondary" onClick={() => openEditor(factor)}>Edit</Button>
                                    <Button size="sm" variant="danger" onClick={() => onDeleteFactor(factor.key)}>Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <FactorConfigEditorModal
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                factorConfig={selectedFactor}
                onSave={handleSave}
            />
        </Card>
    );
};

export const useFactorConfigsCRUD = (initialFactorConfigs: RiskFactorConfig[]) => {
    const [factorConfigs, setFactorConfigs] = useState<RiskFactorConfig[]>(initialFactorConfigs);

    const addFactor = useCallback((newConfig: RiskFactorConfig) => {
        setFactorConfigs(prev => [...prev, newConfig]);
    }, []);

    const updateFactor = useCallback((updatedConfig: RiskFactorConfig) => {
        setFactorConfigs(prev => prev.map(f =>
            f.key === updatedConfig.key ? updatedConfig : f
        ));
    }, []);

    const deleteFactor = useCallback((key: RiskFactorKey) => {
        setFactorConfigs(prev => prev.filter(f => f.key !== key));
    }, []);

    return { factorConfigs, addFactor, updateFactor, deleteFactor };
};

// =====================================================================================================================
// END: RISK FACTOR CONFIGURATION COMPONENTS
// =====================================================================================================================


// =====================================================================================================================
// START: RISK RULE ENGINE COMPONENTS
// =====================================================================================================================

export const RiskRuleEditorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    rule: RiskRule | null; // null for create, object for edit
    onSave: (rule: RiskRule) => void;
    availableFactors: RiskFactorConfig[];
}> = ({ isOpen, onClose, rule, onSave, availableFactors }) => {
    const [formData, setFormData] = useState<RiskRule>(rule || {
        id: generateUniqueId(),
        name: '',
        description: '',
        conditions: [{ factor: availableFactors[0]?.key || 'transaction', operator: '>', value: 50 }],
        actions: [{ type: 'adjustScore', target: 'overallScore', value: 10 }],
        priority: 50,
        isEnabled: true,
        createdBy: 'currentUser',
        createdAt: new Date().toISOString(),
        lastModifiedBy: 'currentUser',
        lastModifiedAt: new Date().toISOString(),
        version: 1,
    });

    useEffect(() => {
        if (rule) {
            setFormData(deepClone(rule));
        } else {
            setFormData({
                id: generateUniqueId(),
                name: '',
                description: '',
                conditions: [{ factor: availableFactors[0]?.key || 'transaction', operator: '>', value: 50 }],
                actions: [{ type: 'adjustScore', target: 'overallScore', value: 10 }],
                priority: 50,
                isEnabled: true,
                createdBy: 'currentUser',
                createdAt: new Date().toISOString(),
                lastModifiedBy: 'currentUser',
                lastModifiedAt: new Date().toISOString(),
                version: 1,
            });
        }
    }, [rule, isOpen, availableFactors]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value),
        }));
    }, []);

    const handleConditionChange = useCallback((index: number, field: keyof RiskRuleCondition, value: any) => {
        setFormData(prev => {
            const newConditions = [...prev.conditions];
            // @ts-ignore
            newConditions[index][field] = value;
            return { ...prev, conditions: newConditions };
        });
    }, []);

    const addCondition = useCallback(() => {
        setFormData(prev => ({
            ...prev,
            conditions: [...prev.conditions, { factor: availableFactors[0]?.key || 'transaction', operator: '>', value: 50 }],
        }));
    }, [availableFactors]);

    const removeCondition = useCallback((index: number) => {
        setFormData(prev => ({
            ...prev,
            conditions: prev.conditions.filter((_, i) => i !== index),
        }));
    }, []);

    const handleActionChange = useCallback((index: number, field: keyof RiskRuleAction, value: any) => {
        setFormData(prev => {
            const newActions = [...prev.actions];
            // @ts-ignore
            newActions[index][field] = value;
            return { ...prev, actions: newActions };
        });
    }, []);

    const addAction = useCallback(() => {
        setFormData(prev => ({
            ...prev,
            actions: [...prev.actions, { type: 'adjustScore', target: 'overallScore', value: 10 }],
        }));
    }, []);

    const removeAction = useCallback((index: number) => {
        setFormData(prev => ({
            ...prev,
            actions: prev.actions.filter((_, i) => i !== index),
        }));
    }, []);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, lastModifiedAt: new Date().toISOString(), lastModifiedBy: 'currentUser' });
        onClose();
    }, [formData, onSave, onClose]);

    const title = rule ? `Edit Risk Rule: ${rule.name}` : 'Create New Risk Rule';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-4xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Rule Name</label>
                    <Input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Description</label>
                    <Textarea name="description" value={formData.description} onChange={handleChange} required />
                </div>

                <div className="border-t border-gray-700 pt-4">
                    <h4 className="text-lg font-semibold text-cyan-300 mb-3">Conditions</h4>
                    {formData.conditions.map((condition, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2 p-2 bg-gray-900 rounded-md">
                            <Select
                                value={condition.factor}
                                onChange={(e) => handleConditionChange(index, 'factor', e.target.value as RiskFactorKey | 'overallScore')}
                                className="w-1/3"
                            >
                                {availableFactors.map(f => (
                                    <option key={f.key} value={f.key}>{f.name}</option>
                                ))}
                                <option value="overallScore">Overall Score</option>
                            </Select>
                            <Select
                                value={condition.operator}
                                onChange={(e) => handleConditionChange(index, 'operator', e.target.value as RiskRuleOperator)}
                                className="w-1/6"
                            >
                                <option value=">">&gt;</option>
                                <option value="<">&lt;</option>
                                <option value=">=">&gt;=</option>
                                <option value="<=">&lt;=</option>
                                <option value="==">==</option>
                                <option value="!=">!=</option>
                            </Select>
                            <Input
                                type="number"
                                value={condition.value}
                                onChange={(e) => handleConditionChange(index, 'value', Number(e.target.value))}
                                className="w-1/6"
                                placeholder="Value"
                                min={0} max={100}
                            />
                            <Button type="button" variant="danger" size="sm" onClick={() => removeCondition(index)}>Remove</Button>
                        </div>
                    ))}
                    <Button type="button" variant="secondary" size="sm" onClick={addCondition} className="mt-2">Add Condition</Button>
                </div>

                <div className="border-t border-gray-700 pt-4">
                    <h4 className="text-lg font-semibold text-cyan-300 mb-3">Actions</h4>
                    {formData.actions.map((action, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2 p-2 bg-gray-900 rounded-md">
                            <Select
                                value={action.type}
                                onChange={(e) => handleActionChange(index, 'type', e.target.value as RiskRuleActionType)}
                                className="w-1/4"
                            >
                                <option value="adjustScore">Adjust Score</option>
                                <option value="setFlag">Set Flag</option>
                                <option value="applyPenalty">Apply Penalty</option>
                                <option value="recommendAction">Recommend Action</option>
                            </Select>
                            <Select
                                value={action.target}
                                onChange={(e) => handleActionChange(index, 'target', e.target.value as RiskRuleTarget)}
                                className="w-1/4"
                            >
                                <option value="overallScore">Overall Score</option>
                                {availableFactors.map(f => (
                                    <option key={f.key} value={f.key}>{f.name}</option>
                                ))}
                            </Select>
                            {(action.type === 'adjustScore' || action.type === 'applyPenalty') && (
                                <Input
                                    type="number"
                                    value={action.value || ''}
                                    onChange={(e) => handleActionChange(index, 'value', Number(e.target.value))}
                                    className="w-1/6"
                                    placeholder="Value"
                                />
                            )}
                            {action.type === 'setFlag' && (
                                <Input
                                    type="text"
                                    value={action.value || ''}
                                    onChange={(e) => handleActionChange(index, 'value', e.target.value)}
                                    className="w-1/4"
                                    placeholder="Flag Name"
                                />
                            )}
                            {action.type === 'recommendAction' && (
                                <Input
                                    type="text"
                                    value={action.message || ''}
                                    onChange={(e) => handleActionChange(index, 'message', e.target.value)}
                                    className="w-1/3"
                                    placeholder="Recommendation Message"
                                />
                            )}
                            <Button type="button" variant="danger" size="sm" onClick={() => removeAction(index)}>Remove</Button>
                        </div>
                    ))}
                    <Button type="button" variant="secondary" size="sm" onClick={addAction} className="mt-2">Add Action</Button>
                </div>

                <div className="flex items-center space-x-4 border-t border-gray-700 pt-4">
                    <div className="w-1/2">
                        <label className="block text-sm font-medium text-gray-400">Priority (lower is higher)</label>
                        <Input type="number" name="priority" value={formData.priority} onChange={handleChange} min={0} max={100} />
                    </div>
                    <ToggleSwitch label="Is Enabled" checked={formData.isEnabled} onChange={(val) => setFormData(prev => ({ ...prev, isEnabled: val }))} />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Rule</Button>
                </div>
            </form>
        </Modal>
    );
};

export const RiskRuleEnginePanel: React.FC<{
    riskRules: RiskRule[];
    onUpdateRule: (rule: RiskRule) => void;
    onAddRule: (rule: RiskRule) => void;
    onDeleteRule: (id: string) => void;
    factorConfigs: RiskFactorConfig[];
    onTestRuleSimulation: (rule: RiskRule, profile: RiskProfileExtended) => void;
    selectedProfile: RiskProfileExtended | null;
}> = ({ riskRules, onUpdateRule, onAddRule, onDeleteRule, factorConfigs, onTestRuleSimulation, selectedProfile }) => {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState<RiskRule | null>(null);
    const [filterText, setFilterText] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'priority' | 'createdAt'>('priority');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const openEditor = useCallback((rule: RiskRule | null) => {
        setSelectedRule(rule);
        setIsEditorOpen(true);
    }, []);

    const handleSave = useCallback((rule: RiskRule) => {
        if (riskRules.some(r => r.id === rule.id)) {
            onUpdateRule(rule);
        } else {
            onAddRule(rule);
        }
    }, [riskRules, onAddRule, onUpdateRule]);

    const filteredAndSortedRules = useMemo(() => {
        let filtered = riskRules.filter(rule =>
            rule.name.toLowerCase().includes(filterText.toLowerCase()) ||
            rule.description.toLowerCase().includes(filterText.toLowerCase())
        );

        return filtered.sort((a, b) => {
            let valA: string | number, valB: string | number;
            if (sortBy === 'priority') {
                valA = a.priority;
                valB = b.priority;
            } else if (sortBy === 'name') {
                valA = a.name.toLowerCase();
                valB = b.name.toLowerCase();
            } else { // createdAt
                valA = new Date(a.createdAt).getTime();
                valB = new Date(b.createdAt).getTime();
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [riskRules, filterText, sortBy, sortOrder]);

    const getFactorName = useCallback((key: RiskFactorKey | 'overallScore') => {
        if (key === 'overallScore') return 'Overall Score';
        return factorConfigs.find(f => f.key === key)?.name || key;
    }, [factorConfigs]);

    const getOperatorSymbol = useCallback((op: RiskRuleOperator) => {
        switch (op) {
            case '>': return '>';
            case '<': return '<';
            case '>=': return '>=';
            case '<=': return '<=';
            case '==': return '=';
            case '!=': return '≠';
            default: return op;
        }
    }, []);


    return (
        <Card title="Risk Rule Engine" className="mt-6">
            <div className="flex justify-between items-center mb-4">
                <Input
                    type="text"
                    placeholder="Filter rules..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="max-w-xs"
                />
                <Button onClick={() => openEditor(null)}>Add New Rule</Button>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400 mb-4">
                <span>Sort by:</span>
                <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="w-auto">
                    <option value="priority">Priority</option>
                    <option value="name">Name</option>
                    <option value="createdAt">Created Date</option>
                </Select>
                <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)} className="w-auto">
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </Select>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Rule Name</th>
                            <th scope="col" className="px-6 py-3">Priority</th>
                            <th scope="col" className="px-6 py-3">Conditions</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                            <th scope="col" className="px-6 py-3">Enabled</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedRules.map((rule) => (
                            <tr key={rule.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="px-6 py-4 font-medium text-white">{rule.name}</td>
                                <td className="px-6 py-4">{rule.priority}</td>
                                <td className="px-6 py-4">
                                    <ul className="list-disc list-inside text-xs space-y-1">
                                        {rule.conditions.map((c, i) => (
                                            <li key={i}>{getFactorName(c.factor)} {getOperatorSymbol(c.operator)} {c.value}</li>
                                        ))}
                                    </ul>
                                </td>
                                <td className="px-6 py-4">
                                    <ul className="list-disc list-inside text-xs space-y-1">
                                        {rule.actions.map((a, i) => (
                                            <li key={i}>
                                                {a.type === 'adjustScore' && `Adjust ${getFactorName(a.target)} by ${a.value}`}
                                                {a.type === 'setFlag' && `Set flag "${a.value}"`}
                                                {a.type === 'applyPenalty' && `Apply penalty of ${a.value} to ${getFactorName(a.target)}`}
                                                {a.type === 'recommendAction' && `Recommend: "${a.message}"`}
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${rule.isEnabled ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'}`}>
                                        {rule.isEnabled ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 space-x-2">
                                    <Button size="sm" variant="secondary" onClick={() => openEditor(rule)}>Edit</Button>
                                    <Button size="sm" variant="danger" onClick={() => onDeleteRule(rule.id)}>Delete</Button>
                                    {selectedProfile && (
                                        <Button size="sm" variant="ghost" onClick={() => onTestRuleSimulation(rule, selectedProfile)} title="Test this rule on the currently selected profile">
                                            Test
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <RiskRuleEditorModal
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                rule={selectedRule}
                onSave={handleSave}
                availableFactors={factorConfigs}
            />
        </Card>
    );
};


export const useRiskRulesCRUD = (initialRules: RiskRule[]) => {
    const [riskRules, setRiskRules] = useState<RiskRule[]>(initialRules);

    const addRule = useCallback((newRule: RiskRule) => {
        setRiskRules(prev => [...prev, newRule]);
    }, []);

    const updateRule = useCallback((updatedRule: RiskRule) => {
        setRiskRules(prev => prev.map(r =>
            r.id === updatedRule.id ? { ...updatedRule, version: r.version + 1 } : r
        ));
    }, []);

    const deleteRule = useCallback((ruleId: string) => {
        setRiskRules(prev => prev.filter(r => r.id !== ruleId));
    }, []);

    return { riskRules, addRule, updateRule, deleteRule };
};

// =====================================================================================================================
// END: RISK RULE ENGINE COMPONENTS
// =====================================================================================================================


// =====================================================================================================================
// START: HISTORICAL TRENDS & ANALYTICS COMPONENTS
// =====================================================================================================================

export const RiskTrendChart: React.FC<{ history: HistoricalRiskRecord[]; profileName: string }> = ({ history, profileName }) => {
    const chartData = useMemo(() => {
        return history.map(record => ({
            name: new Date(record.timestamp).toLocaleDateString(),
            'Overall Score': record.overallScore,
        }));
    }, [history]);

    return (
        <Card title={`Overall Risk Trend for ${profileName}`} className="h-[350px]">
            <ResponsiveContainer width="100%" height="90%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#888888" tickFormatter={(tick) => new Date(tick).toLocaleDateString([], { month: 'short', day: 'numeric' })} />
                    <YAxis domain={[0, 100]} stroke="#888888" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} itemStyle={{ color: '#ffffff' }} />
                    <Legend />
                    <Line type="monotone" dataKey="Overall Score" stroke="#06b6d4" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </Card>
    );
};

export const FactorDistributionChart: React.FC<{ profile: RiskProfileExtended; factorConfigs: RiskFactorConfig[] }> = ({ profile, factorConfigs }) => {
    const chartData = useMemo(() => {
        return factorConfigs.filter(f => f.isEnabled).map(factor => ({
            name: factor.name,
            score: profile.factors[factor.key as RiskFactorKey] || 0,
            weight: factor.weight,
        }));
    }, [profile, factorConfigs]);

    return (
        <Card title={`Factor Score Distribution for ${profile.name}`} className="h-[350px]">
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#888888" angle={-45} textAnchor="end" height={60} interval={0} tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} stroke="#888888" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} itemStyle={{ color: '#ffffff' }} />
                    <Legend />
                    <Bar dataKey="score" fill="#a855f7" name="Score" />
                    <Bar dataKey="weight" fill="#facc15" name="Weight" />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
};

export const RiskHistoryTable: React.FC<{ history: HistoricalRiskRecord[]; profileName: string }> = ({ history, profileName }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;
    const totalPages = Math.ceil(history.length / recordsPerPage);

    const paginatedHistory = useMemo(() => {
        const startIndex = (currentPage - 1) * recordsPerPage;
        return history.slice(startIndex, startIndex + recordsPerPage);
    }, [history, currentPage, recordsPerPage]);

    return (
        <Card title={`Historical Records for ${profileName}`}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Timestamp</th>
                            <th scope="col" className="px-6 py-3">Overall Score</th>
                            <th scope="col" className="px-6 py-3">Factor Snapshot</th>
                            <th scope="col" className="px-6 py-3">Triggered Rules</th>
                            <th scope="col" className="px-6 py-3">Snapshot By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedHistory.map((record, index) => (
                            <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="px-6 py-4">{new Date(record.timestamp).toLocaleString()}</td>
                                <td className="px-6 py-4 font-mono font-bold" style={{ color: record.overallScore > 75 ? '#ef4444' : record.overallScore > 50 ? '#f59e0b' : '#10b981' }}>{record.overallScore}</td>
                                <td className="px-6 py-4 text-xs">
                                    {Object.entries(record.factorScores).map(([factor, score]) => (
                                        <div key={factor}>{factor}: {score}</div>
                                    ))}
                                </td>
                                <td className="px-6 py-4 text-xs">
                                    {record.triggeredRules.length > 0 ? (
                                        <ul className="list-disc list-inside">
                                            {record.triggeredRules.map((ruleId, i) => <li key={i}>{ruleId}</li>)}
                                        </ul>
                                    ) : 'N/A'}
                                </td>
                                <td className="px-6 py-4">{record.snapshotBy}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </Card>
    );
};

// =====================================================================================================================
// END: HISTORICAL TRENDS & ANALYTICS COMPONENTS
// =====================================================================================================================


// =====================================================================================================================
// START: RISK SIMULATION COMPONENTS
// =====================================================================================================================

export const RiskSimulationPanel: React.FC<{
    selectedProfile: RiskProfileExtended | null;
    factorConfigs: RiskFactorConfig[];
    riskRules: RiskRule[];
}> = ({ selectedProfile, factorConfigs, riskRules }) => {
    const [simulatedFactors, setSimulatedFactors] = useState<{ [key in RiskFactorKey]?: number }>({});
    const [simulatedOverallScore, setSimulatedOverallScore] = useState<number | null>(null);
    const [simulatedFlags, setSimulatedFlags] = useState<string[]>([]);
    const [simulatedRecommendations, setSimulatedRecommendations] = useState<string[]>([]);
    const [simulatedTriggeredRules, setSimulatedTriggeredRules] = useState<RiskRule[]>([]);

    useEffect(() => {
        if (selectedProfile) {
            setSimulatedFactors(deepClone(selectedProfile.factors));
            setSimulatedOverallScore(selectedProfile.overallScore);
            setSimulatedFlags([]);
            setSimulatedRecommendations([]);
            setSimulatedTriggeredRules([]);
        } else {
            setSimulatedFactors({});
            setSimulatedOverallScore(null);
        }
    }, [selectedProfile]);

    const handleFactorChange = useCallback((key: RiskFactorKey, value: number) => {
        setSimulatedFactors(prev => ({ ...prev, [key]: value }));
    }, []);

    const runSimulation = useCallback(() => {
        if (!selectedProfile) return;

        const baseProfile: RiskProfileExtended = {
            ...deepClone(selectedProfile),
            factors: simulatedFactors as { [key in RiskFactorKey]: number }, // Cast to ensure all keys are present
            overallScore: selectedProfile.overallScore, // Use original as base for rule application
        };

        const { newOverallScore, triggeredRules, flags, recommendations } = applyRiskRules(baseProfile, riskRules, factorConfigs);

        setSimulatedOverallScore(newOverallScore);
        setSimulatedTriggeredRules(triggeredRules);
        setSimulatedFlags(Array.from(flags));
        setSimulatedRecommendations(Array.from(recommendations));

    }, [selectedProfile, simulatedFactors, riskRules, factorConfigs]);

    const resetSimulation = useCallback(() => {
        if (selectedProfile) {
            setSimulatedFactors(deepClone(selectedProfile.factors));
            setSimulatedOverallScore(selectedProfile.overallScore);
            setSimulatedFlags([]);
            setSimulatedRecommendations([]);
            setSimulatedTriggeredRules([]);
        }
    }, [selectedProfile]);

    if (!selectedProfile) {
        return <Card title="Risk Simulation"><div className="p-4 text-gray-500">Select a profile to run simulations.</div></Card>;
    }

    const originalOverallScore = selectedProfile.overallScore;
    const scoreDifference = simulatedOverallScore !== null ? simulatedOverallScore - originalOverallScore : 0;

    return (
        <Card title={`Simulate Risk for ${selectedProfile.name}`} className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">Adjust Factors</h3>
                    {factorConfigs.filter(f => f.isEnabled).map(factor => (
                        <Slider
                            key={factor.key}
                            label={`${factor.name} (${factor.key})`}
                            value={simulatedFactors[factor.key] || 0}
                            onChange={(val) => handleFactorChange(factor.key, val)}
                            min={0}
                            max={100}
                        />
                    ))}
                    <div className="flex space-x-3 mt-4">
                        <Button onClick={runSimulation}>Run Simulation</Button>
                        <Button variant="secondary" onClick={resetSimulation}>Reset Factors</Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">Simulation Results</h3>
                    <div className="flex items-center space-x-4">
                        <div className="text-gray-400">Original Score: <span className="font-bold text-lg text-white">{originalOverallScore}</span></div>
                        <div className="text-gray-400">Simulated Score:
                            <span className="font-bold text-lg ml-2" style={{ color: simulatedOverallScore !== null ? (simulatedOverallScore > 75 ? '#ef4444' : simulatedOverallScore > 50 ? '#f59e0b' : '#10b981') : '#ffffff' }}>
                                {simulatedOverallScore !== null ? simulatedOverallScore : 'N/A'}
                            </span>
                            {simulatedOverallScore !== null && (
                                <span className={`ml-2 text-sm font-mono ${scoreDifference > 0 ? 'text-red-400' : scoreDifference < 0 ? 'text-green-400' : 'text-gray-400'}`}>
                                    ({scoreDifference > 0 ? '+' : ''}{scoreDifference})
                                </span>
                            )}
                        </div>
                    </div>

                    {simulatedOverallScore !== null && (
                        <>
                            <div className="mt-4">
                                <h4 className="font-semibold text-cyan-300">Triggered Rules:</h4>
                                {simulatedTriggeredRules.length > 0 ? (
                                    <ul className="list-disc list-inside text-sm text-gray-300">
                                        {simulatedTriggeredRules.map(rule => <li key={rule.id}>{rule.name} (Priority: {rule.priority})</li>)}
                                    </ul>
                                ) : <p className="text-sm text-gray-400">No rules triggered for simulated values.</p>}
                            </div>

                            <div className="mt-4">
                                <h4 className="font-semibold text-cyan-300">Flags Set:</h4>
                                {simulatedFlags.length > 0 ? (
                                    <ul className="list-disc list-inside text-sm text-gray-300">
                                        {simulatedFlags.map((flag, i) => <li key={i}>{flag}</li>)}
                                    </ul>
                                ) : <p className="text-sm text-gray-400">No new flags set.</p>}
                            </div>

                            <div className="mt-4">
                                <h4 className="font-semibold text-cyan-300">Recommendations:</h4>
                                {simulatedRecommendations.length > 0 ? (
                                    <ul className="list-disc list-inside text-sm text-gray-300">
                                        {simulatedRecommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                                    </ul>
                                ) : <p className="text-sm text-gray-400">No specific recommendations.</p>}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Card>
    );
};

// =====================================================================================================================
// END: RISK SIMULATION COMPONENTS
// =====================================================================================================================


// =====================================================================================================================
// START: ALERTS & REPORTING COMPONENTS
// =====================================================================================================================

export const AlertConfigEditorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    alertConfig: RiskAlertConfiguration | null;
    onSave: (config: RiskAlertConfiguration) => void;
    availableProfiles: RiskProfileExtended[];
    availableFactors: RiskFactorConfig[];
}> = ({ isOpen, onClose, alertConfig, onSave, availableProfiles, availableFactors }) => {
    const [formData, setFormData] = useState<RiskAlertConfiguration>(alertConfig || {
        id: generateUniqueId(),
        name: '',
        description: '',
        targetProfileIds: 'all',
        thresholdOperator: '>',
        thresholdValue: 70,
        factorTrigger: undefined,
        notificationChannels: ['dashboard'],
        recipients: ['admin@example.com'],
        isEnabled: true,
        createdAt: new Date().toISOString(),
        lastModifiedAt: new Date().toISOString(),