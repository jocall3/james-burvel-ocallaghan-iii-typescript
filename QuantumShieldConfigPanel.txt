import React, { useState, useEffect, useCallback } from 'react';
import { useApiKeyManagement } from '../ApiKeyPrompt';
import { LoadingSpinner } from '../ApiKeyPrompt';

// Re-importing types to ensure strict typing within this new file
import { QuantumSecureVaultConfig } from '../ApiKeyPrompt';

// #region New Type Definitions for Expanded Functionality
export type EncryptionAlgorithm = 'post_quantum_hybrid_aes' | 'post_quantum_saber' | 'quantum_resistant_falcon' | 'dilithium_pqc';
export type RecoveryMethod = 'multi_party_computation' | 'physical_hardware_token' | 'cryptographic_sharding_recovery' | 'emergency_break_glass';
export type KeyGenerationMethod = 'hardware_security_module' | 'software_generated' | 'cloud_hsm_managed';
export type KeyStrength = '256_bit_quantum_resilient' | '512_bit_quantum_resilient' | 'post_quantum_custom';
export type KeyUsagePolicy = 'data_at_rest' | 'data_in_transit' | 'both_data_types' | 'custom_policy_defined';
export type RevocationPolicy = 'automatic_on_breach_detection' | 'manual_approval_required' | 'scheduled_review_only' | 'immediate_hard_revocation';
export type AuditLogLevel = 'none' | 'minimal' | 'standard' | 'verbose_debugging' | 'security_critical_only';
export type GeographicalRegion = 'global' | 'north_america_east' | 'europe_west' | 'asia_pacific_south' | 'custom_region_policy';
export type AlertChannel = 'email' | 'slack' | 'webhook' | 'pagerduty' | 'sms_notifications';
export type SiemProvider = 'splunk' | 'sumologic' | 'azure_sentinel' | 'aws_security_hub' | 'google_chronicle';
export type AuditLogExportTarget = 's3_bucket' | 'blob_storage' | 'custom_api_endpoint' | 'gcs_bucket';

export interface SecurityPolicyRule {
    ruleId: string;
    description: string;
    condition: string; // e.g., 'dataType == "PII" AND geoRegion == "EU"'
    action: 'enforce_encryption_algorithm' | 'require_key_rotation' | 'alert_on_non_compliance' | 'deny_operation';
    param?: string; // e.g., 'post_quantum_saber' for encryption algorithm, '24' for rotation
    enabled: boolean;
}

export interface SecurityPolicy {
    policyId: string;
    name: string;
    description: string;
    rules: SecurityPolicyRule[];
    isEnabled: boolean;
    lastUpdated: string; // ISO string
}

export interface IntegrationConfig {
    siemIntegrationEnabled: boolean;
    siemProvider?: SiemProvider;
    siemEndpoint?: string;
    webhookAlertsEnabled: boolean;
    webhookUrl?: string;
    alertChannels: AlertChannel[];
    notificationEmails: string[];
    slackWebhookUrl?: string;
    pagerDutyServiceKey?: string;
}

export interface QuantumShieldAdvancedConfig extends QuantumSecureVaultConfig {
    // Advanced Key Management
    keyGenerationMethod: KeyGenerationMethod;
    keyStrength: KeyStrength;
    autoKeyRotationEnabled: boolean;
    nextRotationScheduledFor?: string; // ISO string date for next auto-rotation
    keyUsagePolicy: KeyUsagePolicy;
    revocationPolicy: RevocationPolicy;
    enforceMfaForAdvancedActions: boolean; // e.g., revocation, key destruction
    emergencyAccessPolicyEnabled: boolean;

    // Security Policies
    securityPolicies: SecurityPolicy[];
    policyEnforcementMode: 'audit' | 'enforce'; // New global policy enforcement mode

    // Audit Logging
    auditLogLevel: AuditLogLevel;
    logRetentionDays: number; // Max 3650 days (10 years)
    exportAuditLogsEnabled: boolean;
    auditLogExportTarget?: AuditLogExportTarget;
    customAuditLogApiEndpoint?: string;
    auditLogSigningEnabled: boolean; // Ensure log integrity

    // Geographical Key Residency
    geographicalKeyResidency: GeographicalRegion;
    residencyComplianceProofUrl?: string; // Link to compliance document
    geoFencingEnabled: boolean; // Restrict key usage based on geographic location

    // Integrations & Alerts
    integrations: IntegrationConfig;

    // Operational Metrics & Health (read-only, for display)
    lastHealthCheck?: string; // ISO string
    operationalStatus: 'online' | 'degraded' | 'offline';
    lastConfigChangeTimestamp?: string; // ISO string
    lastConfigChangeBy?: string; // User ID or system
}

// Default values for new properties, extending existing defaults
const DEFAULT_ADVANCED_CONFIG: QuantumShieldAdvancedConfig = {
    isEnabled: false,
    encryptionAlgorithm: 'post_quantum_hybrid_aes',
    keyRotationFrequencyHours: 24,
    recoveryMethods: 'multi_party_computation',

    keyGenerationMethod: 'cloud_hsm_managed',
    keyStrength: '256_bit_quantum_resilient',
    autoKeyRotationEnabled: true,
    keyUsagePolicy: 'both_data_types',
    revocationPolicy: 'manual_approval_required',
    enforceMfaForAdvancedActions: true,
    emergencyAccessPolicyEnabled: false,

    securityPolicies: [],
    policyEnforcementMode: 'audit',

    auditLogLevel: 'standard',
    logRetentionDays: 365,
    exportAuditLogsEnabled: false,
    auditLogSigningEnabled: true,

    geographicalKeyResidency: 'global',
    geoFencingEnabled: false,

    integrations: {
        siemIntegrationEnabled: false,
        webhookAlertsEnabled: false,
        alertChannels: ['email'],
        notificationEmails: ['security-ops@example.com'],
    },

    operationalStatus: 'offline', // Default for not yet fetched/configured
};
// #endregion

// Helper for rendering select options
const renderSelectOptions = (options: string[]) => {
    return options.map(option => (
        <option key={option} value={option}>{option.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
    ));
};

// #region Exported Sub-Components for Tabbed Navigation

export const ExportedGeneralSettingsTab: React.FC<{
    tempConfig: Partial<QuantumShieldAdvancedConfig>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    editMode: boolean;
    isLoading: boolean;
}> = ({ tempConfig, handleInputChange, editMode, isLoading }) => (
    <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white mb-3">General Security Settings</h4>
        {!editMode ? (
            <>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Status</label>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        tempConfig?.isEnabled ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
                    }`}>
                        {tempConfig?.isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Encryption Algorithm</label>
                    <p className="text-white bg-gray-700 p-2 rounded">{(tempConfig?.encryptionAlgorithm || 'N/A').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Key Rotation Frequency</label>
                    <p className="text-white bg-gray-700 p-2 rounded">{tempConfig?.keyRotationFrequencyHours} hours</p>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Recovery Method</label>
                    <p className="text-white bg-gray-700 p-2 rounded">{(tempConfig?.recoveryMethods || 'N/A').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                </div>
            </>
        ) : (
            <>
                <div className="mb-4">
                    <label className="flex items-center text-gray-300">
                        <input
                            type="checkbox"
                            name="isEnabled"
                            checked={tempConfig.isEnabled || false}
                            onChange={handleInputChange}
                            className="form-checkbox h-5 w-5 text-purple-600 bg-gray-700 border-gray-600 rounded"
                            disabled={isLoading}
                        />
                        <span className="ml-2 text-gray-400 text-sm font-bold">Enable Quantum Shield</span>
                    </label>
                    <p className="text-gray-500 text-sm mt-1">Activate robust post-quantum cryptographic protections for your data.</p>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Encryption Algorithm</label>
                    <select
                        name="encryptionAlgorithm"
                        value={tempConfig.encryptionAlgorithm || ''}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
                        disabled={isLoading}
                    >
                        {renderSelectOptions(['post_quantum_hybrid_aes', 'post_quantum_saber', 'quantum_resistant_falcon', 'dilithium_pqc'])}
                    </select>
                    <p className="text-gray-500 text-sm mt-1">Select the primary cryptographic algorithm. Falcon and Dilithium offer enhanced security profiles.</p>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Key Rotation Frequency (Hours)</label>
                    <input
                        type="number"
                        name="keyRotationFrequencyHours"
                        value={tempConfig.keyRotationFrequencyHours || ''}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
                        min="1"
                        max="720" // Max 30 days
                        disabled={isLoading}
                    />
                    <p className="text-gray-500 text-sm mt-1">Defines how often your encryption keys are automatically rotated. Shorter periods enhance security but increase operational overhead.</p>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Recovery Method</label>
                    <select
                        name="recoveryMethods"
                        value={tempConfig.recoveryMethods || ''}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
                        disabled={isLoading}
                    >
                        {renderSelectOptions(['multi_party_computation', 'physical_hardware_token', 'cryptographic_sharding_recovery', 'emergency_break_glass'])}
                    </select>
                    <p className="text-gray-500 text-sm mt-1">Choose how encrypted data can be recovered in emergency situations. Multi-party computation offers distributed trust.</p>
                </div>
            </>
        )}
    </div>
);

export const ExportedAdvancedKeyManagementTab: React.FC<{
    tempConfig: Partial<QuantumShieldAdvancedConfig>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    editMode: boolean;
    isLoading: boolean;
}> = ({ tempConfig, handleInputChange, editMode, isLoading }) => (
    <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white mb-3">Advanced Key Lifecycle Management</h4>
        {!editMode ? (
            <>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Key Generation Method</label>
                    <p className="text-white bg-gray-700 p-2 rounded">{(tempConfig.keyGenerationMethod || 'N/A').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Key Strength</label>
                    <p className="text-white bg-gray-700 p-2 rounded">{(tempConfig.keyStrength || 'N/A').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Auto Key Rotation</label>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        tempConfig?.autoKeyRotationEnabled ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
                    }`}>
                        {tempConfig?.autoKeyRotationEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    {tempConfig.nextRotationScheduledFor && <p className="text-gray-500 text-sm mt-1">Next rotation: {new Date(tempConfig.nextRotationScheduledFor).toLocaleString()}</p>}
                </div>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Key Usage Policy</label>
                    <p className="text-white bg-gray-700 p-2 rounded">{(tempConfig.keyUsagePolicy || 'N/A').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Revocation Policy</label>
                    <p className="text-white bg-gray-700 p-2 rounded">{(tempConfig.revocationPolicy || 'N/A').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">MFA for Advanced Actions</label>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        tempConfig?.enforceMfaForAdvancedActions ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
                    }`}>
                        {tempConfig?.enforceMfaForAdvancedActions ? 'Enforced' : 'Not Enforced'}
                    </span>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Emergency Access Policy</label>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        tempConfig?.emergencyAccessPolicyEnabled ? 'bg-orange-800 text-orange-200' : 'bg-gray-800 text-gray-200'
                    }`}>
                        {tempConfig?.emergencyAccessPolicyEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <p className="text-gray-500 text-sm mt-1">Defines procedures