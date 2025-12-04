import React, { useContext, useState, useEffect, useCallback, createContext } from 'react';
import { DataContext } from '../context/DataContext';

// --- Global Types and Interfaces for the "Universe Expansion" ---

// Security and Compliance
export enum ApiKeyStatus {
    ACTIVE = 'active',
    REVOKED = 'revoked',
    EXPIRED = 'expired',
    PENDING_ROTATION = 'pending_rotation',
    SUSPENDED = 'suspended',
}

export enum KeyScope {
    READ_ONLY = 'data:read',
    FULL_ACCESS = 'data:full_access',
    TRANSACTION_INITIATE = 'transactions:initiate',
    TRANSACTION_APPROVE = 'transactions:approve',
    USER_MANAGE = 'users:manage',
    API_KEY_MANAGE = 'api_keys:manage',
    AUDIT_READ = 'audit:read',
    WEBHOOK_MANAGE = 'webhooks:manage',
    AI_ANALYTICS_VIEW = 'ai_analytics:view',
    DECENTRALIZED_FINANCE = 'defi:interact',
    QUANTUM_SECURE_VAULT = 'qsv:access',
    BIOMETRIC_ENROLLMENT = 'biometrics:enroll',
}

export interface ApiKeyMeta {
    id: string;
    keyHash: string; // Storing hash, not raw key for security
    prefix: string;
    status: ApiKeyStatus;
    createdAt: string; // ISO 8601 date string
    expiresAt: string | null; // ISO 8601 date string
    lastUsedAt: string | null; // ISO 8601 date string
    createdBy: string; // User ID or system ID
    name: string; // User-defined name for the key
    description: string; // User-defined description
    scopes: KeyScope[];
    rotationPolicyId: string | null;
    usageTier: 'free' | 'pro' | 'enterprise';
    metadata: Record<string, any>; // Flexible metadata
}

export interface UsageMetrics {
    period: '24h' | '7d' | '30d' | 'all_time';
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    dataTransferredMB: number;
    rateLimitHits: number;
    costEstimateUSD: number;
    geolocationDistribution: Record<string, number>; // e.g., { "US": 1000, "DE": 500 }
}

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    actorId: string; // User ID or system ID
    action: string; // e.g., 'API_KEY_GENERATED', 'API_KEY_REVOKED', 'SCOPE_UPDATED'
    targetId: string; // API Key ID, User ID, etc.
    details: Record<string, any>; // JSON blob with specific event details
    ipAddress: string;
    userAgent: string;
}

export interface SecurityPolicy {
    id: string;
    name: string;
    description: string;
    rules: {
        maxKeysPerUser: number;
        keyLifespanDays: number | null; // null for indefinite
        enforceMFAForActions: KeyScope[];
        rateLimitPolicy: 'default' | 'custom' | 'none';
        geoFencing: 'none' | 'whitelist' | 'blacklist';
        allowedRegions: string[]; // e.g., ['US', 'EU']
        dailyRequestLimit: number | null;
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface WebhookSubscription {
    id: string;
    eventName: 'API_KEY_GENERATED' | 'API_KEY_REVOKED' | 'API_KEY_EXPIRED' | 'API_KEY_USAGE_ALERT';
    callbackUrl: string;
    isActive: boolean;
    secret: string; // for signature verification
    retries: number;
    lastAttempt: string | null;
    lastSuccess: string | null;
}

export interface UserPreferences {
    id: string;
    userId: string;
    notificationSettings: {
        emailAlerts: boolean;
        smsAlerts: boolean;
        inAppNotifications: boolean;
        webhookNotifications: boolean;
    };
    theme: 'dark' | 'light' | 'system';
    locale: string;
    timezone: string;
    twoFactorEnabled: boolean;
    preferredMfaMethod: 'TOTP' | 'SMS' | 'EMAIL' | 'BIOMETRIC';
}

export interface QuantumSecureVaultConfig {
    isEnabled: boolean;
    encryptionAlgorithm: 'post_quantum_hybrid_aes' | 'post_quantum_saber';
    keyRotationFrequencyHours: number;
    recoveryMethods: 'multi_party_computation' | 'physical_hardware_token';
}

// Decentralized Identity Integration
export interface DecentralizedIdentityProfile {
    did: string; // Decentralized Identifier
    linkedBlockchainAddresses: {
        ethereum: string | null;
        solana: string | null;
        other: string[] | null;
    };
    verifiedCredentials: string[]; // List of VC IDs
    trustScore: number; // AI-driven trust score based on DID activity
    kycStatus: 'none' | 'level1' | 'level2' | 'verified';
}

// AI Assistant
export interface AIRecommendation {
    id: string;
    type: 'security_alert' | 'optimization_tip' | 'compliance_suggestion' | 'feature_suggestion';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    actionableItems: string[];
    isDismissed: boolean;
    createdAt: string;
}

// --- Local State/Context for Advanced Management (simulating DataContext expansion) ---

interface ApiKeyManagementContextType {
    apiKeys: ApiKeyMeta[];
    currentApiKey: ApiKeyMeta | null;
    isLoading: boolean;
    error: string | null;
    fetchApiKeys: () => Promise<void>;
    generateApiKey: (options?: Partial<ApiKeyMeta>) => Promise<ApiKeyMeta | undefined>;
    revokeApiKey: (keyId: string) => Promise<boolean>;
    updateApiKey: (keyId: string, updates: Partial<ApiKeyMeta>) => Promise<ApiKeyMeta | undefined>;
    getApiKeyUsage: (keyId: string, period: UsageMetrics['period']) => Promise<UsageMetrics | undefined>;
    getAuditLogs: (keyId?: string, actorId?: string) => Promise<AuditLogEntry[]>;
    securityPolicies: SecurityPolicy[];
    fetchSecurityPolicies: () => Promise<void>;
    createSecurityPolicy: (policy: Omit<SecurityPolicy, 'id' | 'createdAt' | 'updatedAt'>) => Promise<SecurityPolicy | undefined>;
    updateSecurityPolicy: (policyId: string, updates: Partial<SecurityPolicy>) => Promise<SecurityPolicy | undefined>;
    webhookSubscriptions: WebhookSubscription[];
    fetchWebhookSubscriptions: () => Promise<void>;
    createWebhookSubscription: (sub: Omit<WebhookSubscription, 'id' | 'lastAttempt' | 'lastSuccess'>) => Promise<WebhookSubscription | undefined>;
    deleteWebhookSubscription: (subId: string) => Promise<boolean>;
    userPreferences: UserPreferences | null;
    fetchUserPreferences: () => Promise<void>;
    updateUserPreferences: (updates: Partial<UserPreferences>) => Promise<UserPreferences | undefined>;
    aiRecommendations: AIRecommendation[];
    fetchAIRecommendations: () => Promise<void>;
    dismissAIRecommendation: (id: string) => Promise<boolean>;
    quantumVaultConfig: QuantumSecureVaultConfig | null;
    fetchQuantumVaultConfig: () => Promise<void>;
    updateQuantumVaultConfig: (config: Partial<QuantumSecureVaultConfig>) => Promise<QuantumSecureVaultConfig | undefined>;
    decentralizedIdentity: DecentralizedIdentityProfile | null;
    fetchDecentralizedIdentity: () => Promise<void>;
    linkBlockchainAddress: (address: string, type: 'ethereum' | 'solana' | 'other') => Promise<DecentralizedIdentityProfile | undefined>;
    biometricEnrollmentStatus: { isEnrolled: boolean; method: string | null };
    fetchBiometricEnrollmentStatus: () => Promise<void>;
    enrollBiometrics: (method: 'fingerprint' | 'faceid' | 'voice') => Promise<boolean>;
}

// We'll create a mock context provider here for demonstration within this single file,
// assuming `DataContext` (or another context) would provide these in a real app.
const ApiKeyManagementContext = createContext<ApiKeyManagementContextType | undefined>(undefined);

// Mock implementation of API calls and state management
export const ApiKeyManagementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { generateApiKey: baseGenerateApiKey, error: baseError } = useContext(DataContext)!;

    const [apiKeys, setApiKeys] = useState<ApiKeyMeta[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(baseError);
    const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([]);
    const [webhookSubscriptions, setWebhookSubscriptions] = useState<WebhookSubscription[]>([]);
    const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
    const [aiRecommendations, setAIRecommendations] = useState<AIRecommendation[]>([]);
    const [quantumVaultConfig, setQuantumVaultConfig] = useState<QuantumSecureVaultConfig | null>(null);
    const [decentralizedIdentity, setDecentralizedIdentity] = useState<DecentralizedIdentityProfile | null>(null);
    const [biometricEnrollmentStatus, setBiometricEnrollmentStatus] = useState<{ isEnrolled: boolean; method: string | null }>({ isEnrolled: false, method: null });

    const fetchApiKeys = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Simulate API call
            const mockKeys: ApiKeyMeta[] = [
                {
                    id: 'key_abc123', keyHash: 'hashed_key_val_1', prefix: 'dbk_', status: ApiKeyStatus.ACTIVE,
                    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), expiresAt: null, lastUsedAt: new Date().toISOString(),
                    createdBy: 'user_123', name: 'My Primary Key', description: 'For main application access',
                    scopes: [KeyScope.FULL_ACCESS, KeyScope.API_KEY_MANAGE], rotationPolicyId: null, usageTier: 'enterprise',
                    metadata: { environment: 'production' }
                },
                {
                    id: 'key_def456', keyHash: 'hashed_key_val_2', prefix: 'dbk_', status: ApiKeyStatus.PENDING_ROTATION,
                    createdAt: new Date(Date.now() - 86400000 * 90).toISOString(), expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(), lastUsedAt: new Date().toISOString(),
                    createdBy: 'user_123', name: 'Analytics Key', description: 'Read-only access for BI tools',
                    scopes: [KeyScope.READ_ONLY, KeyScope.AI_ANALYTICS_VIEW], rotationPolicyId: 'pol_rot_monthly', usageTier: 'pro',
                    metadata: { department: 'BI' }
                }
            ];
            await new Promise(resolve => setTimeout(resolve, 500));
            setApiKeys(mockKeys);
        } catch (err: any) {
            setError(err.message || "Failed to fetch API keys.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const generateApiKey = useCallback(async (options?: Partial<ApiKeyMeta>) => {
        setIsLoading(true);
        setError(null);
        try {
            // Use the base generateApiKey for actual key generation, then decorate with mock options
            const newKeyData = await baseGenerateApiKey(); // This returns a raw key or simple ID
            if (!newKeyData) {
                throw new Error("Base API key generation failed.");
            }
            const rawKey = newKeyData; // Assume baseGenerateApiKey returns the raw key for this expanded context
            const newKey: ApiKeyMeta = {
                id: `key_${Math.random().toString(36).substring(2, 11)}`,
                keyHash: `hashed_${rawKey}`, // In real app, hash the rawKey and store only hash
                prefix: options?.prefix || 'dbk_',
                status: ApiKeyStatus.ACTIVE,
                createdAt: new Date().toISOString(),
                expiresAt: options?.expiresAt || null,
                lastUsedAt: null,
                createdBy: 'user_123', // Mock user
                name: options?.name || 'New Generated Key',
                description: options?.description || 'Auto-generated key',
                scopes: options?.scopes || [KeyScope.READ_ONLY],
                rotationPolicyId: options?.rotationPolicyId || null,
                usageTier: options?.usageTier || 'free',
                metadata: options?.metadata || {},
            };
            await new Promise(resolve => setTimeout(resolve, 1000));
            setApiKeys(prev => [...prev, newKey]);
            // In a real app, the raw key would be shown once and then discarded or never stored
            console.log("Generated RAW Key (for display only):", rawKey); // This would be the actual key string
            return newKey;
        } catch (err: any) {
            setError(err.message || "Failed to generate API key.");
        } finally {
            setIsLoading(false);
        }
    }, [baseGenerateApiKey]);


    const revokeApiKey = useCallback(async (keyId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setApiKeys(prev => prev.map(key => key.id === keyId ? { ...key, status: ApiKeyStatus.REVOKED } : key));
            return true;
        } catch (err: any) {
            setError(err.message || "Failed to revoke API key.");
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateApiKey = useCallback(async (keyId: string, updates: Partial<ApiKeyMeta>) => {
        setIsLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            let updatedKey: ApiKeyMeta | undefined;
            setApiKeys(prev => prev.map(key => {
                if (key.id === keyId) {
                    updatedKey = { ...key, ...updates };
                    return updatedKey;
                }
                return key;
            }));
            return updatedKey;
        } catch (err: any) {
            setError(err.message || "Failed to update API key.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getApiKeyUsage = useCallback(async (keyId: string, period: UsageMetrics['period']) => {
        setIsLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const mockUsage: UsageMetrics = {
                period,
                totalRequests: Math.floor(Math.random() * 100000),
                successfulRequests: Math.floor(Math.random() * 95000),
                failedRequests: Math.floor(Math.random() * 5000),
                dataTransferredMB: parseFloat((Math.random() * 1024).toFixed(2)),
                rateLimitHits: Math.floor(Math.random() * 100),
                costEstimateUSD: parseFloat((Math.random() * 50).toFixed(2)),
                geolocationDistribution: { "US": 0.5, "EU": 0.3, "AS": 0.2 },
            };
            return mockUsage;
        } catch (err: any) {
            setError(err.message || "Failed to fetch API key usage.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getAuditLogs = useCallback(async (keyId?: string, actorId?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const mockLogs: AuditLogEntry[] = [
                { id: 'log_001', timestamp: new Date(Date.now() - 3600000).toISOString(), actorId: 'user_123', action: 'API_KEY_GENERATED', targetId: keyId || 'key_abc123', details: { name: 'My Primary Key' }, ipAddress: '192.168.1.1', userAgent: 'Chrome' },
                { id: 'log_002', timestamp: new Date(Date.now() - 7200000).toISOString(), actorId: 'system', action: 'API_KEY_USAGE', targetId: keyId || 'key_abc123', details: { endpoint: '/data/balance', status: 200 }, ipAddress: '1.2.3.4', userAgent: 'WebApp' },
                { id: 'log_003', timestamp: new Date(Date.now() - 10800000).toISOString(), actorId: 'admin_456', action: 'SCOPE_UPDATED', targetId: keyId || 'key_def456', details: { oldScopes: [KeyScope.READ_ONLY], newScopes: [KeyScope.READ_ONLY, KeyScope.AI_ANALYTICS_VIEW] }, ipAddress: '203.0.113.45', userAgent: 'AdminTool' },
            ];
            return mockLogs;
        } catch (err: any) {
            setError(err.message || "Failed to fetch audit logs.");
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchSecurityPolicies = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const mockPolicies: SecurityPolicy[] = [
                {
                    id: 'pol_def_001', name: 'Default Enterprise Policy', description: 'Standard security for enterprise keys', isActive: true,
                    createdAt: new Date(Date.now() - 86400000 * 365).toISOString(), updatedDate: new Date().toISOString(),
                    rules: { maxKeysPerUser: 5, keyLifespanDays: 90, enforceMFAForActions: [KeyScope.API_KEY_MANAGE], rateLimitPolicy: 'default', geoFencing: 'whitelist', allowedRegions: ['US', 'EU'], dailyRequestLimit: 1000000 },
                },
                {
                    id: 'pol_dev_002', name: 'Developer Sandbox Policy', description: 'Lenient policy for development keys', isActive: false,
                    createdAt: new Date(Date.now() - 86400000 * 180).toISOString(), updatedDate: new Date().toISOString(),
                    rules: { maxKeysPerUser: 10, keyLifespanDays: null, enforceMFAForActions: [], rateLimitPolicy: 'none', geoFencing: 'none', allowedRegions: [], dailyRequestLimit: null },
                }
            ];
            setSecurityPolicies(mockPolicies);
        } catch (err: any) {
            setError(err.message || "Failed to fetch security policies.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createSecurityPolicy = useCallback(async (policy: Omit<SecurityPolicy, 'id' | 'createdAt' | 'updatedAt'>) => {
        setIsLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const newPolicy: SecurityPolicy = {
                ...policy,
                id: `pol_${Math.random().toString(36).substring(2, 11)}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            setSecurityPolicies(prev => [...prev, newPolicy]);
            return newPolicy;
        } catch (err: any) {
            setError(err.message || "Failed to create security policy.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateSecurityPolicy = useCallback(async (policyId: string, updates: Partial<SecurityPolicy>) => {
        setIsLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            let updatedPolicy: SecurityPolicy | undefined;
            setSecurityPolicies(prev => prev.map(p => {
                if (p.id === policyId) {
                    updatedPolicy = { ...p, ...updates, updatedAt: new Date().toISOString() };
                    return updatedPolicy;
                }
                return p;
            }));
            return updatedPolicy;
        } catch (err: any) {
            setError(err.message || "Failed to update security policy.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchWebhookSubscriptions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const mockSubscriptions: WebhookSubscription[] = [
                { id: 'wh_001', eventName: 'API_KEY_GENERATED', callbackUrl: 'https://example.com/webhook', isActive: true, secret: 'shh_secret_1', retries: 3, lastAttempt: new Date().toISOString(), lastSuccess: new Date().toISOString() },
                { id: 'wh_002', eventName: 'API_KEY_USAGE_ALERT', callbackUrl: 'https://alerts.internal/hook', isActive: true, secret: 'shh_secret_2', retries: 0, lastAttempt: null, lastSuccess: null },
            ];
            setWebhookSubscriptions(mockSubscriptions);
        } catch (err: any) {
            setError(err.message || "Failed to fetch webhook subscriptions.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createWebhookSubscription = useCallback(async (sub: Omit<WebhookSubscription, 'id' | 'lastAttempt' | 'lastSuccess'>) => {
        setIsLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const newSub: WebhookSubscription = {
                ...sub,
                id: `wh_${Math.random().toString(36).substring(2, 11)}`,
                lastAttempt: null,
                lastSuccess: null,
            };
            setWebhookSubscriptions(prev => [...prev, newSub]);
            return newSub;
        } catch (err: any) {
            setError(err.message || "Failed to create webhook subscription.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteWebhookSubscription = useCallback(async (subId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setWebhookSubscriptions(prev => prev.filter(s => s.id !== subId));
            return true;
        } catch (err: any) {
            setError(err.message || "Failed to delete webhook subscription.");
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchUserPreferences = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const mockPrefs: UserPreferences = {
                id: 'pref_user_123', userId: 'user_123',
                notificationSettings: { emailAlerts: true, smsAlerts: false, inAppNotifications: true, webhookNotifications: true },
                theme: 'dark', locale: 'en-US', timezone: 'America/New_York', twoFactorEnabled: true, preferredMfaMethod: 'TOTP',
            };
            setUserPreferences(mockPrefs);
        } catch (err: any) {
            setError(err.message || "Failed to fetch user preferences.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateUserPreferences = useCallback(async (updates: Partial<UserPreferences>) => {
        setIsLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setUserPreferences(prev => prev ? { ...prev, ...updates } : null);
            return userPreferences; // Return the updated state
        } catch (err: any) {
            setError(err.message || "Failed to update user preferences.");
        } finally {
            setIsLoading(false);
        }
    }, [userPreferences]);

    const fetchAIRecommendations = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const mockRecommendations: AIRecommendation[] = [
                { id: 'ai_rec_001', type: 'security_alert', severity: 'high', message: 'API Key "Analytics Key" has unusual usage patterns from new geographic region. Consider geo-fencing or rotation.', actionableItems: ['Review audit logs', 'Rotate key', 'Set geo-fencing policy'], isDismissed: false, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
                { id: 'ai_rec_002', type: 'optimization_tip', severity: 'low', message: 'Several keys are configured with full access but only utilize read-only scopes. Consider narrowing permissions for enhanced security.', actionableItems: ['Review key scopes', 'Update keys'], isDismissed: false, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
            ];
            setAIRecommendations(mockRecommendations);
        } catch (err: any) {
            setError(err.message || "Failed to fetch AI recommendations.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const dismissAIRecommendation = useCallback(async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setAIRecommendations(prev => prev.map(rec => rec.id === id ? { ...rec, isDismissed: true } : rec));
            return true;
        } catch (err: any) {
            setError(err.message || "Failed to dismiss AI recommendation.");
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchQuantumVaultConfig = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const mockConfig: QuantumSecureVaultConfig = {
                isEnabled: true,
                encryptionAlgorithm: 'post_quantum_hybrid_aes',
                keyRotationFrequencyHours: 24,
                recoveryMethods: 'multi_party_computation',
            };
            setQuantumVaultConfig(mockConfig);
        } catch (err: any) {
            setError(err.message || "Failed to fetch Quantum Vault config.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateQuantumVaultConfig = useCallback(async (config: Partial<QuantumSecureVaultConfig>) => {
        setIsLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setQuantumVaultConfig(prev => prev ? { ...prev, ...config } : null);
            return quantumVaultConfig;
        } catch (err: any) {
            setError(err.message || "Failed to update Quantum Vault config.");
        } finally {
            setIsLoading(false);
        }
    }, [quantumVaultConfig]);

    const fetchDecentralizedIdentity = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const mockDID: DecentralizedIdentityProfile = {
                did: 'did:example:123456789abcdefghi',
                linkedBlockchainAddresses: { ethereum: '0xabc...', solana: 'sol123...', other: [] },
                verifiedCredentials: ['vc:kyc:level2', 'vc:employment:demobank'],
                trustScore: 8.5,
                kycStatus: 'verified',
            };
            setDecentralizedIdentity(mockDID);
        } catch (err: any) {
            setError(err.message || "Failed to fetch Decentralized Identity.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const linkBlockchainAddress = useCallback(async (address: string, type: 'ethereum' | 'solana' | 'other') => {
        setIsLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setDecentralizedIdentity(prev => {
                if (!prev) return null;
                const newLinkedAddresses = { ...prev.linkedBlockchainAddresses };
                if (type === 'other') {
                    newLinkedAddresses.other = [...(newLinkedAddresses.other || []), address];
                } else {
                    (newLinkedAddresses as any)[type] = address;
                }
                return { ...prev, linkedBlockchainAddresses: newLinkedAddresses };
            });
            return decentralizedIdentity;
        } catch (err: any) {
            setError(err.message || "Failed to link blockchain address.");
        } finally {
            setIsLoading(false);
        }
    }, [decentralizedIdentity]);

    const fetchBiometricEnrollmentStatus = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const mockStatus = { isEnrolled: true, method: 'fingerprint' };
            setBiometricEnrollmentStatus(mockStatus);
        } catch (err: any) {
            setError(err.message || "Failed to fetch biometric enrollment status.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const enrollBiometrics = useCallback(async (method: 'fingerprint' | 'faceid' | 'voice') => {
        setIsLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate biometric scan
            setBiometricEnrollmentStatus({ isEnrolled: true, method });
            return true;
        } catch (err: any) {
            setError(err.message || "Failed to enroll biometrics.");
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Initial fetches
        fetchApiKeys();
        fetchSecurityPolicies();
        fetchWebhookSubscriptions();
        fetchUserPreferences();
        fetchAIRecommendations();
        fetchQuantumVaultConfig();
        fetchDecentralizedIdentity();
        fetchBiometricEnrollmentStatus();
    }, [fetchApiKeys, fetchSecurityPolicies, fetchWebhookSubscriptions, fetchUserPreferences, fetchAIRecommendations, fetchQuantumVaultConfig, fetchDecentralizedIdentity, fetchBiometricEnrollmentStatus]);


    return (
        <ApiKeyManagementContext.Provider
            value={{
                apiKeys, isLoading, error, fetchApiKeys, generateApiKey, revokeApiKey, updateApiKey, getApiKeyUsage, getAuditLogs,
                securityPolicies, fetchSecurityPolicies, createSecurityPolicy, updateSecurityPolicy,
                webhookSubscriptions, fetchWebhookSubscriptions, createWebhookSubscription, deleteWebhookSubscription,
                userPreferences, fetchUserPreferences, updateUserPreferences,
                aiRecommendations, fetchAIRecommendations, dismissAIRecommendation,
                quantumVaultConfig, fetchQuantumVaultConfig, updateQuantumVaultConfig,
                decentralizedIdentity, fetchDecentralizedIdentity, linkBlockchainAddress,
                biometricEnrollmentStatus, fetchBiometricEnrollmentStatus, enrollBiometrics,
                currentApiKey: apiKeys[0] || null // For simplification, assume first key is "current"
            }}
        >
            {children}
        </ApiKeyManagementContext.Provider>
    );
};

export const useApiKeyManagement = () => {
    const context = useContext(ApiKeyManagementContext);
    if (!context) {
        throw new Error("useApiKeyManagement must be used within an ApiKeyManagementProvider");
    }
    return context;
};

// --- Core UI Components ---

const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// The original ApiKeyPrompt, now as a step in a larger flow
export const InitialApiKeyPrompt: React.FC<{ onKeyGenerated: () => void }> = ({ onKeyGenerated }) => {
    const { generateApiKey, isLoading, error } = useApiKeyManagement();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        const newKey = await generateApiKey();
        setIsGenerating(false);
        if (newKey) {
            onKeyGenerated();
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-950 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 max-w-lg text-center shadow-2xl animate-fade-in">
                <h1 className="text-3xl font-bold text-white mb-4">Welcome to OmniBank Global</h1>
                <p className="text-gray-400 mb-6">
                    To unleash the full potential of your financial universe, generate your first secure API key.
                    This key is your gateway to advanced financial management, AI-driven insights, and decentralized services.
                </p>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || isGenerating}
                    className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                    {(isLoading || isGenerating) && <LoadingSpinner />}
                    {(isLoading || isGenerating) ? 'Generating Planetary Key...' : 'Generate Quantum-Secured API Key'}
                </button>
                {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
                <p className="text-gray-600 text-xs mt-4">
                    By generating this key, you agree to our interstellar terms of service and galactic privacy policy.
                </p>
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

// --- Advanced Feature Components ---

export const ApiKeyCard: React.FC<{ apiKey: ApiKeyMeta; onManage: (key: ApiKeyMeta) => void }> = ({ apiKey, onManage }) => (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200">
        <h3 className="text-xl font-semibold text-white truncate">{apiKey.name} ({apiKey.prefix}{apiKey.id.substring(apiKey.id.length - 4)})</h3>
        <p className="text-sm text-gray-400 mb-2">{apiKey.description}</p>
        <div className="flex items-center text-sm text-gray-500 mb-1">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                apiKey.status === ApiKeyStatus.ACTIVE ? 'bg-green-800 text-green-200' :
                apiKey.status === ApiKeyStatus.REVOKED ? 'bg-red-800 text-red-200' :
                apiKey.status === ApiKeyStatus.PENDING_ROTATION ? 'bg-yellow-800 text-yellow-200' :
                'bg-gray-700 text-gray-300'
            }`}>{apiKey.status.replace('_', ' ')}</span>
            {apiKey.expiresAt && <span className="ml-2">Expires: {new Date(apiKey.expiresAt).toLocaleDateString()}</span>}
        </div>
        <p className="text-xs text-gray-600">Scopes: {apiKey.scopes.length > 3 ? `${apiKey.scopes.slice(0, 3).join(', ')}...` : apiKey.scopes.join(', ')}</p>
        <button onClick={() => onManage(apiKey)} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors">
            Manage Key
        </button>
    </div>
);

export const ApiKeyDetailsPanel: React.FC<{ apiKey: ApiKeyMeta; onClose: () => void }> = ({ apiKey, onClose }) => {
    const { revokeApiKey, updateApiKey, getApiKeyUsage, getAuditLogs, isLoading, error } = useApiKeyManagement();
    const [isRevoking, setIsRevoking] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editedName, setEditedName] = useState(apiKey.name);
    const [editedDescription, setEditedDescription] = useState(apiKey.description);
    const [selectedScopes, setSelectedScopes] = useState<KeyScope[]>(apiKey.scopes);
    const [usageMetrics, setUsageMetrics] = useState<UsageMetrics | null>(null);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [activeTab, setActiveTab] = useState<'details' | 'usage' | 'audit' | 'security'>('details');

    useEffect(() => {
        if (activeTab === 'usage' && apiKey.id) {
            getApiKeyUsage(apiKey.id, '30d').then(setUsageMetrics);
        }
        if (activeTab === 'audit' && apiKey.id) {
            getAuditLogs(apiKey.id).then(setAuditLogs);
        }
    }, [activeTab, apiKey.id, getApiKeyUsage, getAuditLogs]);

    const handleRevoke = async () => {
        if (window.confirm(`Are you sure you want to revoke key "${apiKey.name}"? This action cannot be undone.`)) {
            setIsRevoking(true);
            const success = await revokeApiKey(apiKey.id);
            setIsRevoking(false);
            if (success) onClose(); // Close panel after successful revocation
        }
    };

    const handleUpdate = async () => {
        const updates: Partial<ApiKeyMeta> = {
            name: editedName,
            description: editedDescription,
            scopes: selectedScopes,
        };
        const updated = await updateApiKey(apiKey.id, updates);
        if (updated) {
            setEditMode(false);
            // Optionally, refresh parent list or update local state
        }
    };

    return (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-95 z-40 p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">API Key: {apiKey.name}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="flex border-b border-gray-700 mb-6">
                <button onClick={() => setActiveTab('details')} className={`py-2 px-4 ${activeTab === 'details' ? 'border-b-2 border-cyan-500 text-white' : 'text-gray-400 hover:text-gray-200'}`}>Details</button>
                <button onClick={() => setActiveTab('usage')} className={`py-2 px-4 ${activeTab === 'usage' ? 'border-b-2 border-cyan-500 text-white' : 'text-gray-400 hover:text-gray-200'}`}>Usage Analytics</button>
                <button onClick={() => setActiveTab('audit')} className={`py-2 px-4 ${activeTab === 'audit' ? 'border-b-2 border-cyan-500 text-white' : 'text-gray-400 hover:text-gray-200'}`}>Audit Logs</button>
                <button onClick={() => setActiveTab('security')} className={`py-2 px-4 ${activeTab === 'security' ? 'border-b-2 border-cyan-500 text-white' : 'text-gray-400 hover:text-gray-200'}`}>Security Policies</button>
            </div>

            {error && <p className="text-red-400 mb-4">{error}</p>}

            {activeTab === 'details' && (
                <div className="bg-gray-800 p-6 rounded-lg shadow-inner">
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2">Key ID</label>
                        <p className="text-white bg-gray-700 p-2 rounded">{apiKey.id}</p>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2">Name</label>
                        {editMode ? (
                            <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)}
                                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none" />
                        ) : (
                            <p className="text-white bg-gray-700 p-2 rounded">{apiKey.name}</p>
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2">Description</label>
                        {editMode ? (
                            <textarea value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)}
                                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none" rows={3}></textarea>
                        ) : (
                            <p className="text-white bg-gray-700 p-2 rounded">{apiKey.description}</p>
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2">Status</label>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                            apiKey.status === ApiKeyStatus.ACTIVE ? 'bg-green-800 text-green-200' :
                            apiKey.status === ApiKeyStatus.REVOKED ? 'bg-red-800 text-red-200' :
                            apiKey.status === ApiKeyStatus.PENDING_ROTATION ? 'bg-yellow-800 text-yellow-200' :
                            'bg-gray-700 text-gray-300'
                        }`}>{apiKey.status.replace('_', ' ')}</span>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2">Scopes</label>
                        {editMode ? (
                             <div className="grid grid-cols-2 gap-2 text-white">
                                 {Object.values(KeyScope).map(scope => (
                                     <label key={scope} className="inline-flex items-center">
                                         <input
                                             type="checkbox"
                                             className="form-checkbox h-5 w-5 text-cyan-600 bg-gray-700 border-gray-600 rounded"
                                             checked={selectedScopes.includes(scope)}
                                             onChange={() => {
                                                 setSelectedScopes(prev =>
                                                     prev.includes(scope)
                                                         ? prev.filter(s => s !== scope)
                                                         : [...prev, scope]
                                                 );
                                             }}
                                         />
                                         <span className="ml-2 text-sm text-gray-300">{scope}</span>
                                     </label>
                                 ))}
                             </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {apiKey.scopes.map(scope => (
                                    <span key={scope} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">{scope}</span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2">Created At</label>
                        <p className="text-white">{new Date(apiKey.createdAt).toLocaleString()}</p>
                    </div>
                    {apiKey.expiresAt && (
                        <div className="mb-4">
                            <label className="block text-gray-400 text-sm font-bold mb-2">Expires At</label>
                            <p className="text-white">{new Date(apiKey.expiresAt).toLocaleString()}</p>
                        </div>
                    )}
                    {apiKey.lastUsedAt && (
                        <div className="mb-4">
                            <label className="block text-gray-400 text-sm font-bold mb-2">Last Used At</label>
                            <p className="text-white">{new Date(apiKey.lastUsedAt).toLocaleString()}</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 mt-6">
                        {editMode ? (
                            <>
                                <button onClick={() => setEditMode(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors">Cancel</button>
                                <button onClick={handleUpdate} disabled={isLoading} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center">
                                    {isLoading && <LoadingSpinner />} Save Changes
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">Edit</button>
                        )}
                        <button onClick={handleRevoke} disabled={isRevoking || apiKey.status === ApiKeyStatus.REVOKED || isLoading}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-50 transition-colors flex items-center">
                            {isRevoking && <LoadingSpinner />} {apiKey.status === ApiKeyStatus.REVOKED ? 'Revoked' : 'Revoke Key'}
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'usage' && (
                <div className="bg-gray-800 p-6 rounded-lg shadow-inner">
                    <h3 className="text-xl font-bold text-white mb-4">API Usage Statistics (Last 30 Days)</h3>
                    {isLoading ? <LoadingSpinner /> : (
                        usageMetrics ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-300">
                                <div className="p-3 bg-gray-700 rounded-md"><strong>Total Requests:</strong> {usageMetrics.totalRequests}</div>
                                <div className="p-3 bg-gray-700 rounded-md"><strong>Successful:</strong> {usageMetrics.successfulRequests}</div>
                                <div className="p-3 bg-gray-700 rounded-md"><strong>Failed:</strong> {usageMetrics.failedRequests}</div>
                                <div className="p-3 bg-gray-700 rounded-md"><strong>Data Transferred:</strong> {usageMetrics.dataTransferredMB} MB</div>
                                <div className="p-3 bg-gray-700 rounded-md"><strong>Rate Limit Hits:</strong> {usageMetrics.rateLimitHits}</div>
                                <div className="p-3 bg-gray-700 rounded-md"><strong>Estimated Cost:</strong> ${usageMetrics.costEstimateUSD}</div>
                                <div className="col-span-full p-3 bg-gray-700 rounded-md">
                                    <strong>Geo Distribution:</strong> {Object.entries(usageMetrics.geolocationDistribution).map(([geo, val]) => `${geo}: ${(val * 100).toFixed(0)}%`).join(', ')}
                                </div>
                                <div className="col-span-full mt-4 text-gray-500 text-sm">
                                    <p>Detailed historical data and real-time graphs are available in the full analytics dashboard (requires "AI_ANALYTICS_VIEW" scope).</p>
                                </div>
                            </div>
                        ) : <p className="text-gray-400">No usage data available for this key.</p>
                    )}
                </div>
            )}

            {activeTab === 'audit' && (
                <div className="bg-gray-800 p-6 rounded-lg shadow-inner">
                    <h3 className="text-xl font-bold text-white mb-4">Recent Audit Logs for {apiKey.name}</h3>
                    {isLoading ? <LoadingSpinner /> : (
                        auditLogs.length > 0 ? (
                            <div className="space-y-4">
                                {auditLogs.map(log => (
                                    <div key={log.id} className="bg-gray-700 p-3 rounded-md border border-gray-600">
                                        <p className="text-sm text-gray-300"><strong>Timestamp:</strong> {new Date(log.timestamp).toLocaleString()}</p>
                                        <p className="text-sm text-gray-300"><strong>Actor:</strong> {log.actorId}</p>
                                        <p className="text-sm text-gray-300"><strong>Action:</strong> {log.action}</p>
                                        <p className="text-xs text-gray-500">IP: {log.ipAddress}, User Agent: {log.userAgent}</p>
                                        {Object.keys(log.details).length > 0 && (
                                            <p className="text-xs text-gray-500">Details: {JSON.stringify(log.details)}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-gray-400">No audit logs found for this key.</p>
                    )}
                </div>
            )}

            {activeTab === 'security' && (
                <div className="bg-gray-800 p-6 rounded-lg shadow-inner">
                    <h3 className="text-xl font-bold text-white mb-4">Applied Security Policies</h3>
                    {/* In a real app, this would show policies specifically applied to this key or inherited */}
                    <p className="text-gray-400">Policies for this key are derived from your organization's global settings.</p>
                    <button className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors">
                        View Organization Security Policies
                    </button>
                    <div className="mt-6 text-gray-500 text-sm">
                        <p>Advanced feature: AI-driven policy recommendations based on key usage patterns are available in the Security Ops Center.</p>
                        <p>Quantum-resistant key protocols and multi-party computation vaults can be configured in the 'Quantum Shield' module.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export const MultiFactorAuthEnrollment: React.FC = () => {
    const { userPreferences, updateUserPreferences, enrollBiometrics, fetchBiometricEnrollmentStatus, biometricEnrollmentStatus, isLoading, error } = useApiKeyManagement();
    const [selectedMethod, setSelectedMethod] = useState<'TOTP' | 'SMS' | 'EMAIL' | 'BIOMETRIC'>(userPreferences?.preferredMfaMethod || 'TOTP');

    useEffect(() => {
        if (userPreferences?.preferredMfaMethod) {
            setSelectedMethod(userPreferences.preferredMfaMethod);
        }
        fetchBiometricEnrollmentStatus();
    }, [userPreferences, fetchBiometricEnrollmentStatus]);

    const handleUpdateMfaPreference = async () => {
        if (userPreferences) {
            await updateUserPreferences({ preferredMfaMethod: selectedMethod });
        }
    };

    const handleBiometricEnrollment = async (method: 'fingerprint' | 'faceid' | 'voice') => {
        await enrollBiometrics(method);
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-inner mb-6">
            <h3 className="text-xl font-bold text-white mb-4">Multi-Factor Authentication (MFA)</h3>
            <p className="text-gray-400 mb-4">
                Strengthen your account security and protect critical API key actions with MFA.
            </p>
            {error && <p className="text-red-400 mb-4">{error}</p>}

            <div className="mb-4">
                <label className="block text-gray-400 text-sm font-bold mb-2">Preferred MFA Method</label>
                <select value={selectedMethod} onChange={(e) => setSelectedMethod(e.target.value as any)}
                        className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none">
                    <option value="TOTP">Authenticator App (TOTP)</option>
                    <option value="SMS">SMS</option>
                    <option value="EMAIL">Email</option>
                    <option value="BIOMETRIC">Biometric (Fingerprint/Face ID)</option>
                </select>
                <button onClick={handleUpdateMfaPreference} disabled={isLoading} className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors flex items-center">
                    {isLoading && <LoadingSpinner />} Update Preference
                </button>
            </div>

            {selectedMethod === 'BIOMETRIC' && (
                <div className="mt-6 p-4 bg-gray-700 rounded-md">
                    <h4 className="text-lg font-semibold text-white mb-3">Biometric Enrollment</h4>
                    {biometricEnrollmentStatus.isEnrolled ? (
                        <p className="text-green-400">Enrolled with {biometricEnrollmentStatus.method}.</p>
                    ) : (
                        <div>
                            <p className="text-gray-300 mb-3">Enroll your biometric data for seamless and secure key management.</p>
                            <div className="flex gap-2">
                                <button onClick={() => handleBiometricEnrollment('fingerprint')} disabled={isLoading} className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-md flex items-center">
                                    {isLoading && <LoadingSpinner />} Enroll Fingerprint
                                </button>
                                <button onClick={() => handleBiometricEnrollment('faceid')} disabled={isLoading} className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-md flex items-center">
                                    {isLoading && <LoadingSpinner />} Enroll Face ID
                                </button>
                            </div>
                        </div>
                    )}
                    <p className="text-gray-500 text-xs mt-3">
                        Biometric data is securely stored on your device and never transmitted to OmniBank Global servers.
                        This feature leverages advanced device-level security protocols.
                    </p>
                </div>
            )}
        </div>
    );
};

export const SecurityPolicyManager: React.FC = () => {
    const { securityPolicies, fetchSecurityPolicies, createSecurityPolicy, updateSecurityPolicy, isLoading, error } = useApiKeyManagement();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newPolicy, setNewPolicy] = useState<Omit<SecurityPolicy, 'id' | 'createdAt' | 'updatedAt'>>({
        name: '', description: '', isActive: true,
        rules: { maxKeysPerUser: 5, keyLifespanDays: 90, enforceMFAForActions: [], rateLimitPolicy: 'default', geoFencing: 'none', allowedRegions: [], dailyRequestLimit: null }
    });

    const handleCreatePolicy = async () => {
        const created = await createSecurityPolicy(newPolicy);
        if (created) {
            setShowCreateForm(false);
            setNewPolicy({ name: '', description: '', isActive: true, rules: { maxKeysPerUser: 5, keyLifespanDays: 90, enforceMFAForActions: [], rateLimitPolicy: 'default', geoFencing: 'none', allowedRegions: [], dailyRequestLimit: null } });
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-inner mb-6">
            <h3 className="text-xl font-bold text-white mb-4">Security Policy Management</h3>
            <p className="text-gray-400 mb-4">Define and enforce granular security policies for API key usage across your organization.</p>
            {error && <p className="text-red-400 mb-4">{error}</p>}

            <button onClick={() => setShowCreateForm(!showCreateForm)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors mb-4">
                {showCreateForm ? 'Cancel' : 'Create New Policy'}
            </button>

            {showCreateForm && (
                <div className="bg-gray-700 p-4 rounded-md mb-4">
                    <h4 className="text-lg font-semibold text-white mb-3">New Policy Details</h4>
                    <input type="text" placeholder="Policy Name" value={newPolicy.name} onChange={e => setNewPolicy({...newPolicy, name: e.target.value})} className="w-full bg-gray-600 text-white p-2 rounded mb-2" />
                    <textarea placeholder="Description" value={newPolicy.description} onChange={e => setNewPolicy({...newPolicy, description: e.target.value})} className="w-full bg-gray-600 text-white p-2 rounded mb-2" rows={2} />
                    <label className="flex items-center text-gray-300 mb-3">
                        <input type="checkbox" checked={newPolicy.isActive} onChange={e => setNewPolicy({...newPolicy, isActive: e.target.checked})} className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-600 border-gray-500 rounded" />
                        <span className="ml-2">Active</span>
                    </label>
                    <button onClick={handleCreatePolicy} disabled={isLoading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md flex items-center">
                        {isLoading && <LoadingSpinner />} Save Policy
                    </button>
                </div>
            )}

            <div className="space-y-4">
                {securityPolicies.map(policy => (
                    <div key={policy.id} className="bg-gray-700 p-4 rounded-md border border-gray-600">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-lg font-semibold text-white">{policy.name}</h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${policy.isActive ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>
                                {policy.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{policy.description}</p>
                        <ul className="list-disc list-inside text-gray-500 text-sm">
                            <li>Max Keys per User: {policy.rules.maxKeysPerUser}</li>
                            <li>Key Lifespan: {policy.rules.keyLifespanDays ? `${policy.rules.keyLifespanDays} days` : 'Unlimited'}</li>
                            <li>MFA for Actions: {policy.rules.enforceMFAForActions.length > 0 ? policy.rules.enforceMFAForActions.join(', ') : 'None'}</li>
                            <li>Geo-fencing: {policy.rules.geoFencing} ({policy.rules.allowedRegions.join(', ')})</li>
                        </ul>
                        <button onClick={() => updateSecurityPolicy(policy.id, { isActive: !policy.isActive })}
                                disabled={isLoading} className="mt-3 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded-md flex items-center">
                            {isLoading && <LoadingSpinner />} Toggle Active
                        </button>
                    </div>
                ))}
            </div>
            <p className="text-gray-500 text-xs mt-4">
                For predictive policy enforcement and automated compliance checks, enable the "AI Governance Engine" in Enterprise Settings.
            </p>
        </div>
    );
};

export const AIRecommendationsPanel: React.FC = () => {
    const { aiRecommendations, dismissAIRecommendation, isLoading, error } = useApiKeyManagement();

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-inner mb-6">
            <h3 className="text-xl font-bold text-white mb-4">AI Security & Optimization Assistant</h3>
            <p className="text-gray-400 mb-4">
                Leverage OmniBank's advanced AI to proactively identify security risks, optimize key usage, and ensure compliance.
            </p>
            {error && <p className="text-red-400 mb-4">{error}</p>}

            <div className="space-y-4">
                {aiRecommendations.filter(rec => !rec.isDismissed).length === 0 && (
                    <p className="text-gray-500">No active AI recommendations at this time. All systems nominal!</p>
                )}
                {aiRecommendations.filter(rec => !rec.isDismissed).map(rec => (
                    <div key={rec.id} className={`p-4 rounded-md border ${
                        rec.severity === 'critical' ? 'bg-red-900/30 border-red-700' :
                        rec.severity === 'high' ? 'bg-orange-900/30 border-orange-700' :
                        rec.severity === 'medium' ? 'bg-yellow-900/30 border-yellow-700' :
                        'bg-blue-900/30 border-blue-700'
                    }`}>
                        <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-white">
                                <span className={`mr-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                                    rec.severity === 'critical' ? 'bg-red-700' :
                                    rec.severity === 'high' ? 'bg-orange-700' :
                                    rec.severity === 'medium' ? 'bg-yellow-700' :
                                    'bg-blue-700'
                                }`}>{rec.severity.toUpperCase()}</span>
                                {rec.type.replace('_', ' ')}
                            </h4>
                            <button onClick={() => dismissAIRecommendation(rec.id)} disabled={isLoading} className="text-gray-400 hover:text-white transition-colors text-sm flex items-center">
                                {isLoading && <LoadingSpinner />} Dismiss
                            </button>
                        </div>
                        <p className="text-gray-300 mt-2">{rec.message}</p>
                        {rec.actionableItems.length > 0 && (
                            <div className="mt-3">
                                <p className="text-gray-400 text-sm font-medium mb-1">Actionable Items:</p>
                                <ul className="list-disc list-inside text-gray-500 text-sm">
                                    {rec.actionableItems.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        )}
                        <p className="text-xs text-gray-600 mt-2">Generated: {new Date(rec.createdAt).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>
            <p className="text-gray-500 text-xs mt-4">
                AI recommendations are powered by our advanced "Sentient Threat Intelligence (STI)" engine, which constantly monitors billions of global data points.
            </p>
        </div>
    );
};

export const DecentralizedIdentityManager: React.FC = () => {
    const { decentralizedIdentity, fetchDecentralizedIdentity, linkBlockchainAddress, isLoading, error } = useApiKeyManagement();
    const [newAddress, setNewAddress] = useState('');
    const [addressType, setAddressType] = useState<'ethereum' | 'solana' | 'other'>('ethereum');

    const handleLinkAddress = async () => {
        if (newAddress) {
            await linkBlockchainAddress(newAddress, addressType);
            setNewAddress('');
        }
    };

    if (isLoading && !decentralizedIdentity) return <LoadingSpinner />;

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-inner mb-6">
            <h3 className="text-xl font-bold text-white mb-4">Decentralized Identity (DID) & Web3 Integration</h3>
            <p className="text-gray-400 mb-4">
                Link your Self-Sovereign Identity to OmniBank Global for enhanced privacy, verifiable credentials, and seamless Web3 interactions.
            </p>
            {error && <p className="text-red-400 mb-4">{error}</p>}

            {decentralizedIdentity ? (
                <>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2">Your Decentralized Identifier (DID)</label>
                        <p className="text-white bg-gray-700 p-2 rounded break-all">{decentralizedIdentity.did}</p>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2">Linked Blockchain Addresses</label>
                        <ul className="list-disc list-inside text-gray-300">
                            {decentralizedIdentity.linkedBlockchainAddresses.ethereum && <li>Ethereum: <span className="break-all">{decentralizedIdentity.linkedBlockchainAddresses.ethereum}</span></li>}
                            {decentralizedIdentity.linkedBlockchainAddresses.solana && <li>Solana: <span className="break-all">{decentralizedIdentity.linkedBlockchainAddresses.solana}</span></li>}
                            {decentralizedIdentity.linkedBlockchainAddresses.other?.map((addr, i) => <li key={i}>Other: <span className="break-all">{addr}</span></li>)}
                        </ul>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2">Verified Credentials (VCs)</label>
                        <div className="flex flex-wrap gap-2">
                            {decentralizedIdentity.verifiedCredentials.map(vc => (
                                <span key={vc} className="px-2 py-1 bg-purple-700 text-purple-100 rounded text-xs">{vc}</span>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2">AI Trust Score</label>
                        <p className="text-white bg-gray-700 p-2 rounded">{decentralizedIdentity.trustScore.toFixed(1)} <span className="text-xs text-gray-500">(Out of 10)</span></p>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2">KYC Status</label>
                        <p className="text-white bg-gray-700 p-2 rounded">{decentralizedIdentity.kycStatus.toUpperCase()}</p>
                    </div>
                </>
            ) : (
                <p className="text-gray-500">No Decentralized Identity linked. Start your Web3 journey with OmniBank Global!</p>
            )}

            <div className="mt-6 p-4 bg-gray-700 rounded-md">
                <h4 className="text-lg font-semibold text-white mb-3">Link New Blockchain Address</h4>
                <div className="flex gap-2 mb-3">
                    <input type="text" placeholder="Blockchain Address" value={newAddress} onChange={e => setNewAddress(e.target.value)}
                           className="flex-grow bg-gray-600 text-white p-2 rounded border border-gray-500 focus:border-cyan-500 focus:outline-none" />
                    <select value={addressType} onChange={e => setAddressType(e.target.value as any)}
                            className="bg-gray-600 text-white p-2 rounded border border-gray-500 focus:border-cyan-500 focus:outline-none">
                        <option value="ethereum">Ethereum</option>
                        <option value="solana">Solana</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <button onClick={handleLinkAddress} disabled={isLoading || !newAddress} className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md flex items-center justify-center">
                    {isLoading && <LoadingSpinner />} Link Address
                </button>
            </div>
            <p className="text-gray-500 text-xs mt-4">
                OmniBank Global's Web3 integration allows your API keys to interact directly with decentralized applications and smart contracts,
                secured by your verified DID and quantum-resistant key material.
            </p>
        </div>
    );
};

// --- Main Dashboard Component ---

export const ApiKeyManagementDashboard: React.FC = () => {
    const { apiKeys, isLoading, error, fetchApiKeys, generateApiKey } = useApiKeyManagement();
    const [selectedApiKey, setSelectedApiKey] = useState<ApiKeyMeta | null>(null);
    const [showKeyGenerator, setShowKeyGenerator] = useState(false);

    useEffect(() => {
        fetchApiKeys();
    }, [fetchApiKeys]);

    const handleGenerateNewKey = async () => {
        const newKey = await generateApiKey({ name: "Custom Generated Key", description: "Generated from dashboard" });
        if (newKey) {
            setShowKeyGenerator(false); // Hide generator after successful generation
            setSelectedApiKey(newKey); // Show details of the new key
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8 relative">
            <h1 className="text-4xl font-extrabold text-white mb-8 flex items-center">
                <span className="text-cyan-500 mr-4">OmniBank Global</span> API Key Nexus
                <span className="ml-4 text-xs bg-purple-600 px-3 py-1 rounded-full">Universe Edition v10.0</span>
            </h1>

            {error && <p className="bg-red-900/30 border border-red-700 text-red-300 p-3 rounded-md mb-6">{error}</p>}
            {isLoading && <div className="flex items-center text-gray-400 mb-4"><LoadingSpinner /> Fetching universe data...</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-white">Your API Key Portfolio ({apiKeys.length} keys)</h2>
                            <button onClick={() => setShowKeyGenerator(!showKeyGenerator)}
                                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors flex items-center">
                                {showKeyGenerator ? 'Cancel' : 'New Planetary Key'}
                            </button>
                        </div>
                        {showKeyGenerator && (
                            <div className="bg-gray-800 p-6 rounded-lg shadow-inner mb-6">
                                <h3 className="text-xl font-bold text-white mb-4">Advanced Key Generator</h3>
                                <p className="text-gray-400 mb-4">Configure custom parameters for your next API key. Options include expiration, specific scopes, rotation policies, and quantum-resistant algorithms.</p>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-gray-400 text-sm font-bold mb-2">Key Name</label>
                                        <input type="text" placeholder="e.g., Data Analytics Key" className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-sm font-bold mb-2">Description</label>
                                        <textarea placeholder="Purpose of this key" className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600" rows={2}></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-sm font-bold mb-2">Expiration Date (Optional)</label>
                                        <input type="date" className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-sm font-bold mb-2">Select Scopes</label>
                                        <div className="grid grid-cols-2 gap-2 text-white bg-gray-700 p-3 rounded">
                                            {Object.values(KeyScope).map(scope => (
                                                <label key={scope} className="inline-flex items-center">
                                                    <input type="checkbox" className="form-checkbox h-5 w-5 text-cyan-600 bg-gray-600 border-gray-500 rounded" />
                                                    <span className="ml-2 text-sm text-gray-300">{scope}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-sm font-bold mb-2">Rotation Policy</label>
                                        <select className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600">
                                            <option>No Automatic Rotation</option>
                                            <option>Every 30 Days</option>
                                            <option>Every 90 Days</option>
                                            <option>Custom...</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center text-gray-300">
                                        <input type="checkbox" className="form-checkbox h-5 w-5 text-purple-600 bg-gray-700 border-gray-600 rounded" />
                                        <span className="ml-2">Enable Quantum-Resistant Encryption (Beta)</span>
                                    </div>
                                </div>
                                <button onClick={handleGenerateNewKey} disabled={isLoading} className="mt-6 w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center">
                                    {isLoading && <LoadingSpinner />} Generate Custom Key
                                </button>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {apiKeys.map(key => (
                                <ApiKeyCard key={key.id} apiKey={key} onManage={setSelectedApiKey} />
                            ))}
                            {apiKeys.length === 0 && !isLoading && (
                                <p className="col-span-full text-gray-400">No API keys found. Generate your first key to start!</p>
                            )}
                        </div>
                    </div>

                    <MultiFactorAuthEnrollment />
                    <SecurityPolicyManager />
                    <DecentralizedIdentityManager />
                </div>

                <div className="lg:col-span-1">
                    <AIRecommendationsPanel />
                    <div className="bg-gray-800 p-6 rounded-lg shadow-inner mb-6">
                        <h3 className="text-xl font-bold text-white mb-4">Quantum Shield & Secure Vault</h3>
                        <p className="text-gray-400 mb-4">
                            Future-proof your data with quantum-resistant cryptography and multi-party computation vaults.
                        </p>
                        {isLoading ? <LoadingSpinner /> : (
                            useApiKeyManagement().quantumVaultConfig ? (
                                <div className="space-y-2 text-gray-300">
                                    <p><strong>Status:</strong> <span className={useApiKeyManagement().quantumVaultConfig?.isEnabled ? 'text-green-400' : 'text-red-400'}>{useApiKeyManagement().quantumVaultConfig?.isEnabled ? 'Enabled' : 'Disabled'}</span></p>
                                    <p><strong>Algorithm:</strong> {useApiKeyManagement().quantumVaultConfig?.encryptionAlgorithm}</p>
                                    <p><strong>Key Rotation:</strong> {useApiKeyManagement().quantumVaultConfig?.keyRotationFrequencyHours} hours</p>
                                    <p><strong>Recovery:</strong> {useApiKeyManagement().quantumVaultConfig?.recoveryMethods}</p>
                                </div>
                            ) : <p className="text-gray-500">Quantum Shield not configured.</p>
                        )}
                        <button className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors">
                            Configure Quantum Shield
                        </button>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg shadow-inner mb-6">
                        <h3 className="text-xl font-bold text-white mb-4">Developer Webhooks</h3>
                        <p className="text-gray-400 mb-4">
                            Subscribe to critical API key lifecycle events and usage alerts.
                        </p>
                        {isLoading ? <LoadingSpinner /> : (
                            useApiKeyManagement().webhookSubscriptions.length > 0 ? (
                                <ul className="space-y-2">
                                    {useApiKeyManagement().webhookSubscriptions.map(sub => (
                                        <li key={sub.id} className="text-gray-300 text-sm">
                                            <span className="font-semibold">{sub.eventName}</span> to <span className="text-cyan-400 truncate">{sub.callbackUrl}</span>
                                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${sub.isActive ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>{sub.isActive ? 'Active' : 'Inactive'}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-gray-500">No webhooks configured.</p>
                        )}
                        <button className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-md transition-colors">
                            Manage Webhooks
                        </button>
                        <p className="text-gray-500 text-xs mt-3">
                            Event-driven architecture with guaranteed delivery, powered by OmniBank's global event mesh.
                        </p>
                    </div>
                </div>
            </div>

            {selectedApiKey && (
                <ApiKeyDetailsPanel apiKey={selectedApiKey} onClose={() => setSelectedApiKey(null)} />
            )}

            <p className="text-gray-600 text-xs text-center mt-12">
                OmniBank Global &copy; {new Date().getFullYear()} - Powering the financial multiverse for generations.
            </p>
        </div>
    );
};

// The top-level component that orchestrates the initial prompt and the dashboard
const ApiKeyPortal: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("Must be used within DataProvider");

    // We assume that if `apiKey` is present in DataContext, the initial generation is complete.
    // In the expanded universe, this `apiKey` from DataContext would typically be an ID or a session token,
    // not the raw key itself, which would be handled by the ApiKeyManagementProvider.
    const hasInitialApiKey = !!context.apiKey;

    const [hasUserGeneratedKey, setHasUserGeneratedKey] = useState(hasInitialApiKey);

    // Synchronize initial state with DataContext
    useEffect(() => {
        if (context.apiKey && !hasUserGeneratedKey) {
            setHasUserGeneratedKey(true);
        }
    }, [context.apiKey, hasUserGeneratedKey]);

    if (!hasUserGeneratedKey) {
        return <InitialApiKeyPrompt onKeyGenerated={() => setHasUserGeneratedKey(true)} />;
    }

    return (
        <ApiKeyManagementProvider>
            <ApiKeyManagementDashboard />
        </ApiKeyManagementProvider>
    );
};

export default ApiKeyPortal;