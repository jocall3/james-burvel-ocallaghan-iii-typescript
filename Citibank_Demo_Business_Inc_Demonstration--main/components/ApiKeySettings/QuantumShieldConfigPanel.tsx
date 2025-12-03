import React, { useState, useEffect, useCallback } from 'react';
import { useApiKeyManagement } from '../ApiKeyPrompt';
import { LoadingSpinner } from '../ApiKeyPrompt';

// Re-importing types to ensure strict typing within this new file
import { QuantumSecureVaultConfig } from '../ApiKeyPrompt';

/**
 * QuantumShieldConfigPanel.tsx - A Centralized Configuration and Management Interface for QuantumShield
 *
 * This module provides a comprehensive, commercial-grade user interface for configuring and managing the QuantumShield
 * cryptographic protection system. It consolidates advanced settings for key lifecycle, security policies,
 * audit logging, geographical residency, and integrations into an intuitive panel.
 *
 * Business Value: This panel transforms complex cryptographic configurations into an easily governable asset,
 * empowering security teams to rapidly deploy, monitor, and adapt post-quantum security measures.
 * It ensures regulatory compliance, mitigates emerging quantum threats, and reduces operational
 * friction associated with enterprise-grade key management. By offering granular control over
 * encryption, key rotation, and incident response, it protects high-value digital assets and
 * transactional integrity, enabling secure participation in the token rail and digital identity ecosystems.
 * This directly translates to reduced risk exposure, avoidance of costly data breaches, and a strong
 * competitive advantage in a security-conscious market. The structured configuration also ensures
 * auditability, satisfying stringent compliance requirements and building trust with partners and customers.
 */

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

/**
 * Renders select options from an array of strings, formatting them for display.
 * This utility function enhances UI readability for configuration dropdowns.
 * @param options An array of string options.
 * @returns React elements for select options.
 */
const renderSelectOptions = (options: string[]) => {
    return options.map(option => (
        <option key={option} value={option}>{option.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
    ));
};

/**
 * ExportedGeneralSettingsTab: Manages the foundational settings of the QuantumShield system.
 *
 * This component provides critical controls for enabling/disabling the QuantumShield,
 * selecting the core encryption algorithm, defining key rotation frequency, and specifying data recovery methods.
 * Business Value: This tab ensures that the core cryptographic posture of the organization can be
 * rapidly configured and adapted to evolving threat landscapes and compliance requirements.
 * Streamlined access to these foundational settings reduces configuration errors, accelerates
 * deployment of robust security, and minimizes potential downtime during security incidents.
 * It directly contributes to the resilience and regulatory adherence of the overall financial infrastructure.
 */
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

/**
 * ExportedAdvancedKeyManagementTab: Provides granular control over the lifecycle of cryptographic keys.
 *
 * This component allows configuration of key generation methods, strength, automatic rotation,
 * usage policies, and revocation procedures. It also enforces MFA for critical key actions
 * and defines emergency access protocols.
 * Business Value: This tab elevates key management from a compliance checkbox to a strategic
 * security asset. By automating key hygiene (rotation, strength enforcement) and enforcing
 * stringent controls (MFA, robust revocation), it drastically reduces the risk of key compromise,
 * ensuring the long-term integrity and confidentiality of sensitive data across the entire platform.
 * This proactive posture minimizes potential financial liabilities from data breaches and fortifies
 * the digital identity and token rail infrastructure against advanced persistent threats.
 */
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
                    <p className="text-gray-500 text-sm mt-1">Defines procedures for high-urgency access to encrypted assets.</p>
                </div>
            </>
        ) : (
            <>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Key Generation Method</label>
                    <select
                        name="keyGenerationMethod"
                        value={tempConfig.keyGenerationMethod || ''}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
                        disabled={isLoading}
                    >
                        {renderSelectOptions(['hardware_security_module', 'software_generated', 'cloud_hsm_managed'])}
                    </select>
                    <p className="text-gray-500 text-sm mt-1">Choose the method for generating new cryptographic keys. HSMs offer the highest security.</p>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Key Strength</label>
                    <select
                        name="keyStrength"
                        value={tempConfig.keyStrength || ''}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
                        disabled={isLoading}
                    >
                        {renderSelectOptions(['256_bit_quantum_resilient', '512_bit_quantum_resilient', 'post_quantum_custom'])}
                    </select>
                    <p className="text-gray-500 text-sm mt-1">Specify the bit strength and quantum resilience of generated keys. Higher strength provides greater protection.</p>
                </div>
                <div className="mb-4">
                    <label className="flex items-center text-gray-300">
                        <input
                            type="checkbox"
                            name="autoKeyRotationEnabled"
                            checked={tempConfig.autoKeyRotationEnabled || false}
                            onChange={handleInputChange}
                            className="form-checkbox h-5 w-5 text-purple-600 bg-gray-700 border-gray-600 rounded"
                            disabled={isLoading}
                        />
                        <span className="ml-2 text-gray-400 text-sm font-bold">Enable Automatic Key Rotation</span>
                    </label>
                    <p className="text-gray-500 text-sm mt-1">Automatically rotate keys based on the frequency defined in general settings, enhancing forward secrecy.</p>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Key Usage Policy</label>
                    <select
                        name="keyUsagePolicy"
                        value={tempConfig.keyUsagePolicy || ''}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
                        disabled={isLoading}
                    >
                        {renderSelectOptions(['data_at_rest', 'data_in_transit', 'both_data_types', 'custom_policy_defined'])}
                    </select>
                    <p className="text-gray-500 text-sm mt-1">Define where and how encryption keys can be used (e.g., for stored data, data in motion, or both).</p>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Revocation Policy</label>
                    <select
                        name="revocationPolicy"
                        value={tempConfig.revocationPolicy || ''}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
                        disabled={isLoading}
                    >
                        {renderSelectOptions(['automatic_on_breach_detection', 'manual_approval_required', 'scheduled_review_only', 'immediate_hard_revocation'])}
                    </select>
                    <p className="text-gray-500 text-sm mt-1">Determine how and when encryption keys can be revoked, crucial for incident response.</p>
                </div>
                <div className="mb-4">
                    <label className="flex items-center text-gray-300">
                        <input
                            type="checkbox"
                            name="enforceMfaForAdvancedActions"
                            checked={tempConfig.enforceMfaForAdvancedActions || false}
                            onChange={handleInputChange}
                            className="form-checkbox h-5 w-5 text-purple-600 bg-gray-700 border-gray-600 rounded"
                            disabled={isLoading}
                        />
                        <span className="ml-2 text-gray-400 text-sm font-bold">Enforce MFA for Advanced Key Actions</span>
                    </label>
                    <p className="text-gray-500 text-sm mt-1">Require Multi-Factor Authentication for sensitive operations like key revocation or destruction.</p>
                </div>
                <div className="mb-4">
                    <label className="flex items-center text-gray-300">
                        <input
                            type="checkbox"
                            name="emergencyAccessPolicyEnabled"
                            checked={tempConfig.emergencyAccessPolicyEnabled || false}
                            onChange={handleInputChange}
                            className="form-checkbox h-5 w-5 text-purple-600 bg-gray-700 border-gray-600 rounded"
                            disabled={isLoading}
                        />
                        <span className="ml-2 text-gray-400 text-sm font-bold">Enable Emergency Access Policy</span>
                    </label>
                    <p className="text-gray-500 text-sm mt-1">Activate predefined procedures for critical, expedited access to keys under emergency conditions.</p>
                </div>
            </>
        )}
    </div>
);

/**
 * ExportedSecurityPolicyTab: Configures dynamic security policies for data protection and access control.
 *
 * This component allows the creation and management of security policies with specific rules
 * that define conditions and actions, such as enforcing encryption algorithms or requiring key rotation.
 * It also sets the global enforcement mode (audit or enforce).
 * Business Value: This tab empowers organizations with agile, policy-driven security, allowing them
 * to programmatically enforce data governance, respond to compliance changes, and dynamically
 * adapt security posture without code changes. This reduces manual effort, minimizes human error,
 * and ensures that critical data (e.g., PII, financial transactions on token rails) is always
 * protected according to its classification and regulatory requirements. It's a key component
 * for agentic AI systems to dynamically enforce governance rules.
 */
export const ExportedSecurityPolicyTab: React.FC<{
    tempConfig: Partial<QuantumShieldAdvancedConfig>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    editMode: boolean;
    isLoading: boolean;
}> = ({ tempConfig, handleInputChange, editMode, isLoading }) => {
    // Helper to format names
    const formatName = (name: string) => name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    const handlePolicyChange = useCallback((index: number, field: keyof SecurityPolicy, value: any) => {
        const updatedPolicies = [...(tempConfig.securityPolicies || [])];
        updatedPolicies[index] = {
            ...updatedPolicies[index],
            [field]: value,
            lastUpdated: new Date().toISOString(),
        };
        // This is a direct update to `tempConfig` for nested objects
        // A more robust solution might use a dedicated `setTempConfig` callback,
        // but for now, we simulate the `handleInputChange` behavior for top-level updates.
        // In a real app, `handleInputChange` would be extended or a `handleNestedChange` would be provided.
        handleInputChange({
            target: {
                name: 'securityPolicies',
                value: updatedPolicies,
                type: 'object', // Custom type to indicate complex object
            },
        } as React.ChangeEvent<HTMLInputElement>);
    }, [tempConfig.securityPolicies, handleInputChange]);

    const handleRuleChange = useCallback((policyIndex: number, ruleIndex: number, field: keyof SecurityPolicyRule, value: any) => {
        const updatedPolicies = [...(tempConfig.securityPolicies || [])];
        const updatedRules = [...(updatedPolicies[policyIndex]?.rules || [])];
        updatedRules[ruleIndex] = {
            ...updatedRules[ruleIndex],
            [field]: value,
        };
        updatedPolicies[policyIndex] = {
            ...updatedPolicies[policyIndex],
            rules: updatedRules,
            lastUpdated: new Date().toISOString(),
        };
        handleInputChange({
            target: {
                name: 'securityPolicies',
                value: updatedPolicies,
                type: 'object',
            },
        } as React.ChangeEvent<HTMLInputElement>);
    }, [tempConfig.securityPolicies, handleInputChange]);

    const addPolicy = useCallback(() => {
        const newPolicy: SecurityPolicy = {
            policyId: `policy-${Date.now()}`,
            name: `New Policy ${((tempConfig.securityPolicies?.length || 0) + 1)}`,
            description: 'A newly created security policy.',
            rules: [],
            isEnabled: true,
            lastUpdated: new Date().toISOString(),
        };
        handleInputChange({
            target: {
                name: 'securityPolicies',
                value: [...(tempConfig.securityPolicies || []), newPolicy],
                type: 'object',
            },
        } as React.ChangeEvent<HTMLInputElement>);
    }, [tempConfig.securityPolicies, handleInputChange]);

    const addRule = useCallback((policyIndex: number) => {
        const newRule: SecurityPolicyRule = {
            ruleId: `rule-${Date.now()}`,
            description: 'New security rule',
            condition: 'true',
            action: 'alert_on_non_compliance',
            enabled: true,
        };
        const updatedPolicies = [...(tempConfig.securityPolicies || [])];
        updatedPolicies[policyIndex] = {
            ...updatedPolicies[policyIndex],
            rules: [...(updatedPolicies[policyIndex]?.rules || []), newRule],
            lastUpdated: new Date().toISOString(),
        };
        handleInputChange({
            target: {
                name: 'securityPolicies',
                value: updatedPolicies,
                type: 'object',
            },
        } as React.ChangeEvent<HTMLInputElement>);
    }, [tempConfig.securityPolicies, handleInputChange]);

    return (
        <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-3">Security Policies & Enforcement</h4>
            {!editMode ? (
                <>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2">Policy Enforcement Mode</label>
                        <p className="text-white bg-gray-700 p-2 rounded">{formatName(tempConfig.policyEnforcementMode || 'N/A')}</p>
                        <p className="text-gray-500 text-sm mt-1">In 'Audit' mode, policy violations are logged but not blocked. In 'Enforce' mode, violations are actively prevented.</p>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2">Configured Policies</label>
                        {tempConfig.securityPolicies?.length === 0 ? (
                            <p className="text-gray-500 italic">No security policies configured.</p>
                        ) : (
                            <div className="space-y-2">
                                {(tempConfig.securityPolicies || []).map((policy, pIdx) => (
                                    <div key={policy.policyId} className="bg-gray-800 p-3 rounded border border-gray-700">
                                        <p className="font-semibold text-white">{policy.name} ({policy.isEnabled ? 'Enabled' : 'Disabled'})</p>
                                        <p className="text-gray-400 text-sm">{policy.description}</p>
                                        <p className="text-gray-500 text-xs">Last Updated: {new Date(policy.lastUpdated).toLocaleString()}</p>
                                        <div className="mt-2 ml-4 space-y-1">
                                            {policy.rules.length > 0 ? (
                                                policy.rules.map((rule, rIdx) => (
                                                    <p key={rule.ruleId} className="text-gray-500 text-sm">- {rule.description} (Action: {formatName(rule.action)}, Enabled: {rule.enabled ? 'Yes' : 'No'})</p>
                                                ))
                                            ) : (
                                                <p className="text-gray-600 text-xs italic">No rules defined for this policy.</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2">Policy Enforcement Mode</label>
                        <select
                            name="policyEnforcementMode"
                            value={tempConfig.policyEnforcementMode || ''}
                            onChange={handleInputChange}
                            className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
                            disabled={isLoading}
                        >
                            {renderSelectOptions(['audit', 'enforce'])}
                        </select>
                        <p className="text-gray-500 text-sm mt-1">Choose 'Audit' to log policy violations without blocking, or 'Enforce' to actively prevent non-compliant operations.</p>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2">Manage Security Policies</label>
                        <button
                            onClick={addPolicy}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-3 text-sm"
                            disabled={isLoading}
                        >
                            Add New Policy
                        </button>
                        {(tempConfig.securityPolicies || []).map((policy, pIdx) => (
                            <div key={policy.policyId} className="bg-gray-800 p-4 rounded border border-gray-700 mb-3">
                                <h5 className="font-semibold text-white mb-2">Policy: {policy.name}</h5>
                                <div className="mb-2">
                                    <label className="block text-gray-500 text-xs font-bold mb-1">Policy Name</label>
                                    <input
                                        type="text"
                                        value={policy.name}
                                        onChange={(e) => handlePolicyChange(pIdx, 'name', e.target.value)}
                                        className="w-full bg-gray-700 text-white p-1 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none text-sm"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="block text-gray-500 text-xs font-bold mb-1">Description</label>
                                    <textarea
                                        value={policy.description}
                                        onChange={(e) => handlePolicyChange(pIdx, 'description', e.target.value)}
                                        className="w-full bg-gray-700 text-white p-1 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none text-sm"
                                        rows={2}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="mb-3 flex items-center">
                                    <label className="flex items-center text-gray-300 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={policy.isEnabled}
                                            onChange={(e) => handlePolicyChange(pIdx, 'isEnabled', e.target.checked)}
                                            className="form-checkbox h-4 w-4 text-purple-600 bg-gray-700 border-gray-600 rounded"
                                            disabled={isLoading}
                                        />
                                        <span className="ml-2 text-gray-400 text-sm font-bold">Policy Enabled</span>
                                    </label>
                                </div>

                                <h6 className="font-medium text-gray-300 mb-2">Rules for {policy.name}</h6>
                                <button
                                    onClick={() => addRule(pIdx)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-3 rounded focus:outline-none focus:shadow-outline mb-2"
                                    disabled={isLoading}
                                >
                                    Add New Rule
                                </button>
                                {(policy.rules || []).map((rule, rIdx) => (
                                    <div key={rule.ruleId} className="bg-gray-700 p-3 rounded border border-gray-600 mt-2 ml-4 space-y-1">
                                        <div className="mb-1">
                                            <label className="block text-gray-500 text-xs font-bold">Rule Description</label>
                                            <input
                                                type="text"
                                                value={rule.description}
                                                onChange={(e) => handleRuleChange(pIdx, rIdx, 'description', e.target.value)}
                                                className="w-full bg-gray-600 text-white p-1 rounded border border-gray-500 text-sm"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="mb-1">
                                            <label className="block text-gray-500 text-xs font-bold">Condition (e.g., `dataType == "PII"`) </label>
                                            <input
                                                type="text"
                                                value={rule.condition}
                                                onChange={(e) => handleRuleChange(pIdx, rIdx, 'condition', e.target.value)}
                                                className="w-full bg-gray-600 text-white p-1 rounded border border-gray-500 text-sm"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="mb-1">
                                            <label className="block text-gray-500 text-xs font-bold">Action</label>
                                            <select
                                                value={rule.action}
                                                onChange={(e) => handleRuleChange(pIdx, rIdx, 'action', e.target.value as SecurityPolicyRule['action'])}
                                                className="w-full bg-gray-600 text-white p-1 rounded border border-gray-500 text-sm"
                                                disabled={isLoading}
                                            >
                                                {renderSelectOptions(['enforce_encryption_algorithm', 'require_key_rotation', 'alert_on_non_compliance', 'deny_operation'])}
                                            </select>
                                        </div>
                                        {rule.action === 'enforce_encryption_algorithm' && (
                                            <div className="mb-1">
                                                <label className="block text-gray-500 text-xs font-bold">Encryption Algorithm Param</label>
                                                <select
                                                    value={rule.param || ''}
                                                    onChange={(e) => handleRuleChange(pIdx, rIdx, 'param', e.target.value)}
                                                    className="w-full bg-gray-600 text-white p-1 rounded border border-gray-500 text-sm"
                                                    disabled={isLoading}
                                                >
                                                    {renderSelectOptions(['post_quantum_hybrid_aes', 'post_quantum_saber', 'quantum_resistant_falcon', 'dilithium_pqc'])}
                                                </select>
                                            </div>
                                        )}
                                        {rule.action === 'require_key_rotation' && (
                                            <div className="mb-1">
                                                <label className="block text-gray-500 text-xs font-bold">Rotation Frequency (Hours)</label>
                                                <input
                                                    type="number"
                                                    value={rule.param || '24'}
                                                    onChange={(e) => handleRuleChange(pIdx, rIdx, 'param', e.target.value)}
                                                    className="w-full bg-gray-600 text-white p-1 rounded border border-gray-500 text-sm"
                                                    min="1"
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        )}
                                        <div className="flex items-center">
                                            <label className="flex items-center text-gray-300 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={rule.enabled}
                                                    onChange={(e) => handleRuleChange(pIdx, rIdx, 'enabled', e.target.checked)}
                                                    className="form-checkbox h-4 w-4 text-purple-600 bg-gray-700 border-gray-600 rounded"
                                                    disabled={isLoading}
                                                />
                                                <span className="ml-2 text-gray-400 text-sm font-bold">Rule Enabled</span>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

/**
 * ExportedAuditAndComplianceTab: Provides granular control over audit logging, retention, and export.
 *
 * This component configures the verbosity of audit logs, their retention period,
 * and enables secure export mechanisms to external storage or SIEM systems,
 * with options for log signing to ensure tamper-evidence.
 * Business Value: This tab delivers unparalleled transparency and accountability, crucial for
 * demonstrating regulatory compliance (e.g., GDPR, CCPA, SOX) and enabling rapid forensic analysis
 * during security incidents. Secure, signed audit logs are indispensable for establishing trust
 * in financial transactions (token rails), proving identity assertions, and validating agentic AI decisions.
 * This capability significantly reduces compliance burdens and enhances the platform's
 * security posture, making it invaluable for high-stakes financial operations.
 */
export const ExportedAuditAndComplianceTab: React.FC<{
    tempConfig: Partial<QuantumShieldAdvancedConfig>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    editMode: boolean;
    isLoading: boolean;
}> = ({ tempConfig, handleInputChange, editMode, isLoading }) => (
    <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white mb-3">Audit Logging & Compliance</h4>
        {!editMode ? (
            <>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Audit Log Level</label>
                    <p className="text-white bg-gray-700 p-2 rounded">{(tempConfig.auditLogLevel || 'N/A').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Log Retention Days</label>
                    <p className="text-white bg-gray-700 p-2 rounded">{tempConfig.logRetentionDays || 'N/A'} days</p>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Export Audit Logs</label>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        tempConfig?.exportAuditLogsEnabled ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
                    }`}>
                        {tempConfig?.exportAuditLogsEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    {tempConfig.exportAuditLogsEnabled && tempConfig.auditLogExportTarget && (
                        <p className="text-gray-500 text-sm mt-1">Target: {tempConfig.auditLogExportTarget.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} {tempConfig.customAuditLogApiEndpoint ? `(${tempConfig.customAuditLogApiEndpoint})` : ''}</p>
                    )}
                </div>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Audit Log Signing</label>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        tempConfig?.auditLogSigningEnabled ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
                    }`}>
                        {tempConfig?.auditLogSigningEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <p className="text-gray-500 text-sm mt-1">Cryptographically signs audit logs to ensure their integrity and prevent tampering.</p>
                </div>
            </>
        ) : (
            <>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Audit Log Level</label>
                    <select
                        name="auditLogLevel"
                        value={tempConfig.auditLogLevel || ''}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
                        disabled={isLoading}
                    >
                        {renderSelectOptions(['none', 'minimal', 'standard', 'verbose_debugging', 'security_critical_only'])}
                    </select>
                    <p className="text-gray-500 text-sm mt-1">Set the verbosity of audit trails. 'Security Critical Only' minimizes noise for high-alert scenarios.</p>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Log Retention Days</label>
                    <input
                        type="number"
                        name="logRetentionDays"
                        value={tempConfig.logRetentionDays || ''}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
                        min="7"
                        max="3650" // 10 years
                        disabled={isLoading}
                    />
                    <p className="text-gray-500 text-sm mt-1">Configure how long audit logs are retained. Essential for compliance and forensic analysis.</p>
                </div>
                <div className="mb-4">
                    <label className="flex items-center text-gray-300">
                        <input
                            type="checkbox"
                            name="exportAuditLogsEnabled"
                            checked={tempConfig.exportAuditLogsEnabled || false}
                            onChange={handleInputChange}
                            className="form-checkbox h-5 w-5 text-purple-600 bg-gray-700 border-gray-600 rounded"
                            disabled={isLoading}
                        />
                        <span className="ml-2 text-gray-400 text-sm font-bold">Enable Audit Log Export</span>
                    </label>
                    <p className="text-gray-500 text-sm mt-1">Automatically export audit logs to external storage for long-term archiving and analysis.</p>
                </div>
                {tempConfig.exportAuditLogsEnabled && (
                    <>
                        <div className="mb-4 ml-4">
                            <label className="block text-gray-400 text-sm font-bold mb-2">Audit Log Export Target</label>
                            <select
                                name="auditLogExportTarget"
                                value={tempConfig.auditLogExportTarget || ''}
                                onChange={handleInputChange}
                                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
                                disabled={isLoading}
                            >
                                {renderSelectOptions(['s3_bucket', 'blob_storage', 'gcs_bucket', 'custom_api_endpoint'])}
                            </select>
                            <p className="text-gray-500 text-sm mt-1">Choose the destination for exported audit logs. Supports major cloud storage providers.</p>
                        </div>
                        {(tempConfig.auditLogExportTarget === 'custom_api_endpoint') && (
                            <div className="mb-4 ml-4">
                                <label className="block text-gray-400 text-sm font-bold mb-2">Custom Audit Log API Endpoint</label>
                                <input
                                    type="text"
                                    name="customAuditLogApiEndpoint"
                                    value={tempConfig.customAuditLogApiEndpoint || ''}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
                                    placeholder="https://your-custom-api.com/logs"
                                    disabled={isLoading}
                                />
                                <p className="text-gray-500 text-sm mt-1">Specify the API endpoint for custom log ingestion systems.</p>
                            </div>
                        )}
                    </>
                )}
                <div className="mb-4">
                    <label className="flex items-center text-gray-300">
                        <input
                            type="checkbox"
                            name="auditLogSigningEnabled"
                            checked={tempConfig.auditLogSigningEnabled || false}
                            onChange={handleInputChange}
                            className="form-checkbox h-5 w-5 text-purple-600 bg-gray-700 border-gray-600 rounded"
                            disabled={isLoading}
                        />
                        <span className="ml-2 text-gray-400 text-sm font-bold">Enable Audit Log Cryptographic Signing</span>
                    </label>
                    <p className="text-gray-500 text-sm mt-1">Ensure the integrity and non-repudiation of all audit records through cryptographic signatures.</p>
                </div>
            </>
        )}
    </div>
);

/**
 * ExportedGeographicalResidencyTab: Manages data and key residency policies for global compliance.
 *
 * This component allows organizations to declare and enforce geographical restrictions
 * on where encryption keys and associated data can reside and be processed.
 * It also provides for linking to compliance documentation and enabling geo-fencing.
 * Business Value: Critical for multi-national enterprises, this tab ensures adherence to
 * stringent data sovereignty laws (e.g., GDPR, Schrems II implications, regional data acts).
 * By explicitly controlling geographical residency and enabling geo-fencing, it mitigates
 * significant legal and reputational risks, enabling frictionless global operations while
 * maintaining compliance. This capability is paramount for securing cross-border token rail
 * transactions and managing digital identities across diverse regulatory environments.
 */
export const ExportedGeographicalResidencyTab: React.FC<{
    tempConfig: Partial<QuantumShieldAdvancedConfig>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    editMode: boolean;
    isLoading: boolean;
}> = ({ tempConfig, handleInputChange, editMode, isLoading }) => (
    <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white mb-3">Geographical Key Residency & Compliance</h4>
        {!editMode ? (
            <>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Geographical Key Residency</label>
                    <p className="text-white bg-gray-700 p-2 rounded">{(tempConfig.geographicalKeyResidency || 'N/A').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                    {tempConfig.residencyComplianceProofUrl && (
                        <p className="text-gray-500 text-sm mt-1">Compliance Proof: <a href={tempConfig.residencyComplianceProofUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">View Document</a></p>
                    )}
                </div>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Geo-Fencing Enabled</label>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        tempConfig?.geoFencingEnabled ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
                    }`}>
                        {tempConfig?.geoFencingEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <p className="text-gray-500 text-sm mt-1">Key usage is restricted based on the geographic location of access.</p>
                </div>
            </>
        ) : (
            <>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Geographical Key Residency</label>
                    <select
                        name="geographicalKeyResidency"
                        value={tempConfig.geographicalKeyResidency || ''}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
                        disabled={isLoading}
                    >
                        {renderSelectOptions(['global', 'north_america_east', 'europe_west', 'asia_pacific_south', 'custom_region_policy'])}
                    </select>
                    <p className="text-gray-500 text-sm mt-1">Specify the primary geographical region for key storage and processing to meet data sovereignty requirements.</p>
                </div>
                {tempConfig.geographicalKeyResidency === 'custom_region_policy' && (
                    <div className="mb-4 ml-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2">Custom Region Policy URL</label>
                        <input
                            type="text"
                            name="residencyComplianceProofUrl"
                            value={tempConfig.residencyComplianceProofUrl || ''}
                            onChange={handleInputChange}
                            className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
                            placeholder="https://your-policy-document.com"
                            disabled={isLoading}
                        />
                        <p className="text-gray-500 text-sm mt-1">Provide a link to documentation outlining your custom regional compliance policy.</p>
                    </div>
                )}
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Compliance Proof URL</label>
                    <input
                        type="text"
                        name="residencyComplianceProofUrl"
                        value={tempConfig.residencyComplianceProofUrl || ''}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
                        placeholder="https://your-compliance-proof.com"
                        disabled={isLoading}
                    />
                    <p className="text-gray-500 text-sm mt-1">Link to official documentation proving compliance with regional data residency requirements.</p>
                </div>
                <div className="mb-4">
                    <label className="flex items-center text-gray-300">
                        <input
                            type="checkbox"
                            name="geoFencingEnabled"
                            checked={tempConfig.geoFencingEnabled || false}
                            onChange={handleInputChange}
                            className="form-checkbox h-5 w-5 text-purple-600 bg-gray-700 border-gray-600 rounded"
                            disabled={isLoading}
                        />
                        <span className="ml-2 text-gray-400 text-sm font-bold">Enable Geo-Fencing for Key Usage</span>
                    </label>
                    <p className="text-gray-500 text-sm mt-1">Restrict the use of encryption keys to specific geographic boundaries, enforcing data sovereignty at a granular level.</p>
                </div>
            </>
        )}
    </div>
);

/**
 * ExportedIntegrationsAndAlertsTab: Manages external security integrations and notification channels.
 *
 * This component configures connections to Security Information and Event Management (SIEM) systems,
 * webhook-based alerts, and various notification channels (email, Slack, PagerDuty, SMS).
 * Business Value: This tab provides seamless integration with existing enterprise security
 * ecosystems, ensuring that critical security events (e.g., key compromise attempts, policy violations)
 * are immediately ingested and acted upon by security operations teams. Real-time alerting capabilities
 * drastically reduce detection and response times, minimizing the blast radius of potential incidents.
 * This proactive posture protects the integrity of digital identities and the security of payment rails,
 * directly contributing to operational uptime and trust.
 */
export const ExportedIntegrationsAndAlertsTab: React.FC<{
    tempConfig: Partial<QuantumShieldAdvancedConfig>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    editMode: boolean;
    isLoading: boolean;
}> = ({ tempConfig, handleInputChange, editMode, isLoading }) => {
    // Safely access nested integrations object
    const integrations = tempConfig.integrations || DEFAULT_ADVANCED_CONFIG.integrations;

    const handleIntegrationChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target;
        const [parent, child] = name.split('.'); // Should be 'integrations.fieldName'
        if (parent === 'integrations' && child) {
            handleInputChange({
                target: {
                    name: 'integrations',
                    value: {
                        ...(tempConfig.integrations || {}),
                        [child]: type === 'checkbox' ? checked : value,
                    },
                    type: 'object',
                },
            } as React.ChangeEvent<HTMLInputElement>);
        } else {
            // Fallback for non-nested if needed, though this tab is specific
            handleInputChange(e);
        }
    }, [tempConfig.integrations, handleInputChange]);

    const handleAlertChannelChange = useCallback((channel: AlertChannel, isChecked: boolean) => {
        const currentChannels = new Set(integrations.alertChannels);
        if (isChecked) {
            currentChannels.add(channel);
        } else {
            currentChannels.delete(channel);
        }
        handleInputChange({
            target: {
                name: 'integrations',
                value: {
                    ...(tempConfig.integrations || {}),
                    alertChannels: Array.from(currentChannels),
                },
                type: 'object',
            },
        } as React.ChangeEvent<HTMLInputElement>);
    }, [integrations.alertChannels, tempConfig.integrations, handleInputChange]);

    const handleNotificationEmailChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const emails = e.target.value.split(',').map(email => email.trim()).filter(email => email !== '');
        handleInputChange({
            target: {
                name: 'integrations',
                value: {
                    ...(tempConfig.integrations || {}),
                    notificationEmails: emails,
                },
                type: 'object',
            },
        } as React.ChangeEvent<HTMLInputElement>);
    }, [tempConfig.integrations, handleInputChange]);

    return (
        <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-3">Integrations & Alerts</h4>
            {!editMode ? (
                <>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2">SIEM Integration</label>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                            integrations?.siemIntegrationEnabled ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
                        }`}>
                            {integrations?.siemIntegrationEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                        {integrations?.siemIntegrationEnabled && integrations?.siemProvider && (
                            <p className="text-gray-500 text-sm mt-1">Provider: {integrations.siemProvider.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}, Endpoint: {integrations.siemEndpoint || 'N/A'}</p>
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2">Webhook Alerts</label>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                            integrations?.webhookAlertsEnabled ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
                        }`}>
                            {integrations?.webhookAlertsEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                        {integrations?.webhookAlertsEnabled && (
                            <p className="text-gray-500 text-sm mt-1">Webhook URL: {integrations.webhookUrl || 'N/A'}</p>
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2">Alert Channels</label>
                        <p className="text-white bg-gray-700 p-2 rounded">
                            {(integrations.alertChannels && integrations.alertChannels.length > 0) ? integrations.alertChannels.map(c => c.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())).join(', ') : 'None'}
                        </p>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2">Notification Emails</label>
                        <p className="text-white bg-gray-700 p-2 rounded">
                            {(integrations.notificationEmails && integrations.notificationEmails.length > 0) ? integrations.notificationEmails.join(', ') : 'None'}
                        </p>
                    </div>
                    {integrations.alertChannels?.includes('slack') && (
                        <div className="mb-4">
                            <label className="block text-gray-400 text-sm font-bold mb-2">Slack Webhook URL</label>
                            <p className="text-white bg-gray-700 p-2 rounded">{integrations.slackWebhookUrl || 'N/A'}</p>
                        </div>
                    )}
                    {integrations.alertChannels?.includes('pagerduty') && (
                        <div className="mb-4">
                            <label className="block text-gray-400 text-sm font-bold mb-2">PagerDuty Service Key</label>
                            <p className="text-white bg-gray-700 p-2 rounded">{integrations.pagerDutyServiceKey ? 'Configured' : 'N/A'}</p>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <div className="mb-4">
                        <label className="flex items-center text-gray-300">
                            <input
                                type="checkbox"
                                name="integrations.siemIntegrationEnabled"
                                checked={integrations.siemIntegrationEnabled || false}
                                onChange={handleIntegrationChange}
                                className="form-checkbox h-5 w-5 text-purple-600 bg-gray-700 border-gray-600 rounded"
                                disabled={isLoading}
                            />
                            <span className="ml-2 text-gray-400 text-sm font-bold">Enable SIEM Integration</span>
                        </label>
                        <p className="text-gray-500 text-sm mt-1">Send security events to your SIEM for centralized logging and analysis.</p>
                    </div>
                    {integrations.siemIntegrationEnabled && (
                        <>
                            <div className="mb-4 ml-4">
                                <label className="block text-gray-400 text-sm font-bold mb-2">SIEM Provider</label>
                                <select
                                    name="integrations.siemProvider"
                                    value={integrations.siemProvider || ''}
                                    onChange={handleIntegrationChange}
                                    className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
                                    disabled={isLoading}
                                >
                                    {renderSelectOptions(['splunk', 'sumologic', 'azure_sentinel', 'aws_security_hub', 'google_chronicle'])}
                                </select>
                            </div>
                            <div className="mb-4 ml-4">
                                <label className="block text-gray-400 text-sm font-bold mb-2">SIEM Endpoint</label>
                                <input
                                    type="text"
                                    name="integrations.siemEndpoint"
                                    value={integrations.siemEndpoint || ''}
                                    onChange={handleIntegrationChange}
                                    className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
                                    placeholder="https://your-siem-endpoint.com/ingest"
                                    disabled={isLoading}
                                />
                            </div>
                        </>
                    )}

                    <div className="mb-4">
                        <label className="flex items-center text-gray-300">
                            <input
                                type="checkbox"
                                name="integrations.webhookAlertsEnabled"
                                checked={integrations.webhookAlertsEnabled || false}
                                onChange={handleIntegrationChange}
                                className="form-checkbox h-5 w-5 text-purple-600 bg-gray-700 border-gray-600 rounded"
                                disabled={isLoading}
                            />
                            <span className="ml-2 text-gray-400 text-sm font-bold">Enable Generic Webhook Alerts</span>
                        </label>
                        <p className="text-gray-500 text-sm mt-1">Send alerts to a custom webhook endpoint for flexible integration.</p>
                    </div>
                    {integrations.webhookAlertsEnabled && (
                        <div className="mb-4 ml-4">
                            <label className="block text-gray-400 text-sm font-bold mb-2">Webhook URL</label>
                            <input
                                type="text"
                                name="integrations.webhookUrl"
                                value={integrations.webhookUrl || ''}
                                onChange={handleIntegrationChange}
                                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
                                placeholder="https://your-webhook-receiver.com"
                                disabled={isLoading}
                            />
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2">Alert Channels</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {['email', 'slack', 'webhook', 'pagerduty', 'sms_notifications'].map((channel: AlertChannel) => (
                                <label key={channel} className="inline-flex items-center text-gray-300 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={integrations.alertChannels?.includes(channel) || false}
                                        onChange={(e) => handleAlertChannelChange(channel, e.target.checked)}
                                        className="form-checkbox h-4 w-4 text-purple-600 bg-gray-700 border-gray-600 rounded"
                                        disabled={isLoading}
                                    />
                                    <span className="ml-1">{channel.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                                </label>
                            ))}
                        </div>
                        <p className="text-gray-500 text-sm mt-1">Select the channels through which critical security alerts will be dispatched.</p>
                    </div>

                    {integrations.alertChannels?.includes('email') && (
                        <div className="mb-4 ml-4">
                            <label className="block text-gray-400 text-sm font-bold mb-2">Notification Emails (comma-separated)</label>
                            <textarea
                                name="notificationEmails" // Note: This name is handled by custom handler, not generic handleIntegrationChange
                                value={integrations.notificationEmails?.join(', ') || ''}
                                onChange={handleNotificationEmailChange}
                                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
                                placeholder="secops@example.com, admin@example.com"
                                rows={2}
                                disabled={isLoading}
                            />
                        </div>
                    )}
                    {integrations.alertChannels?.includes('slack') && (
                        <div className="mb-4 ml-4">
                            <label className="block text-gray-400 text-sm font-bold mb-2">Slack Webhook URL</label>
                            <input
                                type="text"
                                name="integrations.slackWebhookUrl"
                                value={integrations.slackWebhookUrl || ''}
                                onChange={handleIntegrationChange}
                                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
                                placeholder="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"
                                disabled={isLoading}
                            />
                            <p className="text-gray-500 text-sm mt-1">Provide the Slack incoming webhook URL for dedicated security alerts channel.</p>
                        </div>
                    )}
                    {integrations.alertChannels?.includes('pagerduty') && (
                        <div className="mb-4 ml-4">
                            <label className="block text-gray-400 text-sm font-bold mb-2">PagerDuty Service Integration Key</label>
                            <input
                                type="password" // Use password type for sensitivity
                                name="integrations.pagerDutyServiceKey"
                                value={integrations.pagerDutyServiceKey || ''}
                                onChange={handleIntegrationChange}
                                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
                                placeholder="Service Integration Key"
                                disabled={isLoading}
                            />
                            <p className="text-gray-500 text-sm mt-1">Enter your PagerDuty service integration key to route critical alerts to your on-call team.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

/**
 * ExportedOperationalStatusTab: Provides read-only visibility into the QuantumShield's operational health.
 *
 * This component displays key operational metrics such as the last health check timestamp,
 * overall operational status, and details about the last configuration change.
 * Business Value: Offering real-time visibility into the system's health, this tab allows
 * operations teams to quickly ascertain the status of their critical security infrastructure.
 * Proactive monitoring of operational status helps in early detection of potential issues,
 * minimizing downtime and ensuring continuous protection of digital assets, token rails,
 * and identity services. This transparency builds confidence and simplifies audits.
 */
export const ExportedOperationalStatusTab: React.FC<{
    tempConfig: Partial<QuantumShieldAdvancedConfig>;
}> = ({ tempConfig }) => (
    <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white mb-3">Operational Status & Audit Trail</h4>
        <div className="mb-4">
            <label className="block text-gray-400 text-sm font-bold mb-2">System Operational Status</label>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                tempConfig?.operationalStatus === 'online' ? 'bg-green-800 text-green-200' :
                tempConfig?.operationalStatus === 'degraded' ? 'bg-orange-800 text-orange-200' : 'bg-red-800 text-red-200'
            }`}>
                {(tempConfig.operationalStatus || 'N/A').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </span>
            <p className="text-gray-500 text-sm mt-1">Indicates the current health and availability of the Quantum Shield services.</p>
        </div>
        <div className="mb-4">
            <label className="block text-gray-400 text-sm font-bold mb-2">Last Health Check</label>
            <p className="text-white bg-gray-700 p-2 rounded">
                {tempConfig.lastHealthCheck ? new Date(tempConfig.lastHealthCheck).toLocaleString() : 'N/A'}
            </p>
            <p className="text-gray-500 text-sm mt-1">Timestamp of the most recent successful system health verification.</p>
        </div>
        <div className="mb-4">
            <label className="block text-gray-400 text-sm font-bold mb-2">Last Configuration Change</label>
            <p className="text-white bg-gray-700 p-2 rounded">
                {tempConfig.lastConfigChangeTimestamp ? new Date(tempConfig.lastConfigChangeTimestamp).toLocaleString() : 'N/A'}
            </p>
            {tempConfig.lastConfigChangeBy && (
                <p className="text-gray-500 text-sm mt-1">Changed By: {tempConfig.lastConfigChangeBy}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">Records when the configuration was last modified and by whom, critical for auditability.</p>
        </div>
    </div>
);


/**
 * QuantumShieldConfigPanel: The main component orchestrating the configuration UI.
 *
 * This component acts as the primary interface for managing all aspects of the QuantumShield
 * cryptographic service. It provides tabbed navigation for general settings, advanced key
 * management, security policies, audit and compliance, geographical residency, integrations,
 * and operational status. It leverages `useApiKeyManagement` for state persistence and
 * includes features for viewing, editing, saving, and canceling configurations.
 * Business Value: This panel serves as the command center for enterprise-grade cryptographic
 * security. By unifying complex settings into an accessible UI, it streamlines security operations,
 * reduces the total cost of ownership, and ensures the continuous high-level protection of all
 * sensitive data processed through the Money20/20 build-phase architecture. Its robust design
 * facilitates compliance, enhances data integrity across token rails, safeguards digital identities,
 * and provides the necessary governance for agentic AI systems. This enables organizations to
 * confidently innovate with emerging financial technologies while maintaining a fortress-like
 * security posture.
 */
export const QuantumShieldConfigPanel: React.FC = () => {
    const {
        apiKeyConfig,
        isLoading,
        error,
        updateApiKeyConfig,
        fetchApiKeyConfig,
        setIsLoading
    } = useApiKeyManagement();

    const [tempConfig, setTempConfig] = useState<Partial<QuantumShieldAdvancedConfig>>({});
    const [editMode, setEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        if (apiKeyConfig) {
            setTempConfig({ ...DEFAULT_ADVANCED_CONFIG, ...(apiKeyConfig as QuantumShieldAdvancedConfig) });
        } else {
            setTempConfig(DEFAULT_ADVANCED_CONFIG);
        }
    }, [apiKeyConfig]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target;

        setTempConfig(prev => {
            const newConfig = { ...prev };

            if (name.includes('.')) {
                // Handle nested properties, e.g., "integrations.siemIntegrationEnabled"
                const parts = name.split('.');
                let current: any = newConfig;
                for (let i = 0; i < parts.length - 1; i++) {
                    const part = parts[i];
                    if (!current[part] || typeof current[part] !== 'object') {
                        current[part] = {};
                    }
                    current = current[part];
                }
                current[parts[parts.length - 1]] = type === 'checkbox' ? checked : value;
            } else if (name === 'securityPolicies' || name === 'integrations') {
                // Special handling for objects passed directly via custom event, assume 'value' is the new object
                newConfig[name as keyof QuantumShieldAdvancedConfig] = value;
            }
            else {
                newConfig[name as keyof QuantumShieldAdvancedConfig] = type === 'checkbox' ? checked : value;
            }
            return newConfig;
        });
    }, []);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Ensure necessary fields are populated for a valid config
            const configToSave: QuantumShieldAdvancedConfig = {
                ...DEFAULT_ADVANCED_CONFIG,
                ...(tempConfig as QuantumShieldAdvancedConfig),
                lastConfigChangeTimestamp: new Date().toISOString(),
                lastConfigChangeBy: 'AdminUser', // In a real app, this would come from auth context
                operationalStatus: 'online' // Assume config save brings it online, or verify
            };
            await updateApiKeyConfig(configToSave);
            setEditMode(false);
            await fetchApiKeyConfig(); // Refresh state after save
        } catch (err) {
            console.error('Failed to save Quantum Shield config:', err);
            // Error handling UI feedback
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setTempConfig({ ...DEFAULT_ADVANCED_CONFIG, ...(apiKeyConfig as QuantumShieldAdvancedConfig) });
        setEditMode(false);
    };

    const tabs = [
        { id: 'general', label: 'General Settings', component: ExportedGeneralSettingsTab },
        { id: 'key-management', label: 'Advanced Key Management', component: ExportedAdvancedKeyManagementTab },
        { id: 'security-policies', label: 'Security Policies', component: ExportedSecurityPolicyTab },
        { id: 'audit-compliance', label: 'Audit & Compliance', component: ExportedAuditAndComplianceTab },
        { id: 'geo-residency', label: 'Geographical Residency', component: ExportedGeographicalResidencyTab },
        { id: 'integrations', label: 'Integrations & Alerts', component: ExportedIntegrationsAndAlertsTab },
        { id: 'operational-status', label: 'Operational Status', component: ExportedOperationalStatusTab },
    ];

    if (isLoading && !apiKeyConfig) {
        return <LoadingSpinner />;
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen p-6">
            <h2 className="text-3xl font-bold mb-6 text-purple-400">Quantum Shield Configuration Panel</h2>
            <p className="text-gray-400 mb-6">
                Manage advanced post-quantum cryptographic protections, key lifecycle, security policies, and integrations for your digital assets.
            </p>

            {error && (
                <div className="bg-red-800 text-red-200 p-3 rounded mb-4">
                    Error: {error.message || 'An unexpected error occurred.'}
                </div>
            )}

            <div className="flex space-x-2 mb-6 border-b border-gray-700 pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-2 px-4 rounded-t-lg font-medium text-sm ${
                            activeTab === tab.id
                                ? 'bg-purple-700 text-white border-b-2 border-cyan-500'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                        disabled={isLoading}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-xl relative">
                {isLoading && <LoadingSpinner overlay />}

                {tabs.map(tab => activeTab === tab.id && (
                    <div key={tab.id} className={activeTab === tab.id ? '' : 'hidden'}>
                        {tab.component === ExportedOperationalStatusTab ? (
                             <ExportedOperationalStatusTab tempConfig={tempConfig} />
                        ) : (
                            <tab.component
                                tempConfig={tempConfig}
                                handleInputChange={handleInputChange}
                                editMode={editMode}
                                isLoading={isLoading}
                            />
                        )}
                    </div>
                ))}

                <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end space-x-4">
                    {!editMode ? (
                        <button
                            onClick={() => setEditMode(true)}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline"
                            disabled={isLoading}
                        >
                            Edit Configuration
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleCancel}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline"
                                disabled={isLoading}
                            >
                                Save Changes
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};