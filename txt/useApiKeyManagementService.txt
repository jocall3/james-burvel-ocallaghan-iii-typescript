import { useState, useEffect, useCallback } from 'react';
import {
    ApiKeyStatus,
    KeyScope,
    ApiKeyMeta,
    UsageMetrics,
    AuditLogEntry,
    SecurityPolicy,
    WebhookSubscription,
    UserPreferences,
    QuantumSecureVaultConfig,
    DecentralizedIdentityProfile,
    AIRecommendation,
} from '../components/ApiKeyPrompt';

// Define the interface that the hook will return, matching ApiKeyManagementContextType for external consumers
interface ApiKeyManagementServiceHookType {
    apiKeys: ApiKeyMeta[];
    currentApiKey: ApiKeyMeta | null; // Derived from `apiKeys`
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

export const useApiKeyManagementService = (): ApiKeyManagementServiceHookType => {
    const [apiKeys, setApiKeys] = useState<ApiKeyMeta[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([]);
    const [webhookSubscriptions, setWebhookSubscriptions] = useState<WebhookSubscription[]>([]);
    const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
    const [aiRecommendations, setAIRecommendations] = useState<AIRecommendation[]>([]);
    const [quantumVaultConfig, setQuantumVaultConfig] = useState<QuantumSecureVaultConfig | null>(null);
    const [decentralizedIdentity, setDecentralizedIdentity] = useState<DecentralizedIdentityProfile | null>(null);
    const [biometricEnrollmentStatus, setBiometricEnrollmentStatus] = useState<{ isEnrolled: boolean; method: string | null }>({ isEnrolled: false, method: null });

    // Mock for baseGenerateApiKey from DataContext, now internalized
    const generateRawKeyMock = useCallback(async (): Promise<string> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return `raw_key_${Math.random().toString(36).substring(2, 16)}`;
    }, []);

    const fetchApiKeys = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
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
            const rawKey = await generateRawKeyMock(); // Using the internal mock
            if (!rawKey) {
                throw new Error("Raw API key generation failed.");
            }
            const newKey: ApiKeyMeta = {
                id: `key_${Math.random().toString(36).substring(2, 11)}`,
                keyHash: `hashed_${rawKey}`,
                prefix: options?.prefix || 'dbk_',
                status: ApiKeyStatus.ACTIVE,
                createdAt: new Date().toISOString(),
                expiresAt: options?.expiresAt || null,
                lastUsedAt: null,
                createdBy: 'user_123',
                name: options?.name || 'New Generated Key',
                description: options?.description || 'Auto-generated key',
                scopes: options?.scopes || [KeyScope.READ_ONLY],
                rotationPolicyId: options?.rotationPolicyId || null,
                usageTier: options?.usageTier || 'free',
                metadata: options?.metadata || {},
            };
            await new Promise(resolve => setTimeout(resolve, 1000));
            setApiKeys(prev => [...prev, newKey]);
            console.log("Generated RAW Key (for display only):", rawKey);
            return newKey;
        } catch (err: any) {
            setError(err.message || "Failed to generate API key.");
            return undefined;
        } finally {
            setIsLoading(false);
        }
    }, [generateRawKeyMock]);


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
            return undefined;
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
            return undefined;
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
                    createdAt: new Date(Date.now() - 86400000 * 365).toISOString(), updatedAt: new Date().toISOString(),
                    rules: { maxKeysPerUser: 5, keyLifespanDays: 90, enforceMFAForActions: [KeyScope.API_KEY_MANAGE], rateLimitPolicy: 'default', geoFencing: 'whitelist', allowedRegions: ['US', 'EU'], dailyRequestLimit: 1000000 },
                },
                {
                    id: 'pol_dev_002', name: 'Developer Sandbox Policy', description: 'Lenient policy for development keys', isActive: false,
                    createdAt: new Date(Date.now() - 86400000 * 180).toISOString(), updatedAt: new Date().toISOString(),
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
            return undefined;
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
            return undefined;
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
            return undefined;
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
            // In a real scenario, this would return the actual updated object from the backend.
            // For mock, returning the current state is sufficient.
            return userPreferences;
        } catch (err: any) {
            setError(err.message || "Failed to update user preferences.");
            return undefined;
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
            // Return the updated state, or the object from a mock API call
            return quantumVaultConfig;
        } catch (err: any) {
            setError(err.message || "Failed to update Quantum Vault config.");
            return undefined;
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
            // Return the updated state, or the object from a mock API call
            return decentralizedIdentity;
        } catch (err: any) {
            setError(err.message || "Failed to link blockchain address.");
            return undefined;
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
            await new Promise(resolve => setTimeout(resolve, 1500));
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
        fetchApiKeys();
        fetchSecurityPolicies();
        fetchWebhookSubscriptions();
        fetchUserPreferences();
        fetchAIRecommendations();
        fetchQuantumVaultConfig();
        fetchDecentralizedIdentity();
        fetchBiometricEnrollmentStatus();
    }, [fetchApiKeys, fetchSecurityPolicies, fetchWebhookSubscriptions, fetchUserPreferences, fetchAIRecommendations, fetchQuantumVaultConfig, fetchDecentralizedIdentity, fetchBiometricEnrollmentStatus]);

    return {
        apiKeys,
        isLoading,
        error,
        fetchApiKeys,
        generateApiKey,
        revokeApiKey,
        updateApiKey,
        getApiKeyUsage,
        getAuditLogs,
        securityPolicies,
        fetchSecurityPolicies,
        createSecurityPolicy,
        updateSecurityPolicy,
        webhookSubscriptions,
        fetchWebhookSubscriptions,
        createWebhookSubscription,
        deleteWebhookSubscription,
        userPreferences,
        fetchUserPreferences,
        updateUserPreferences,
        aiRecommendations,
        fetchAIRecommendations,
        dismissAIRecommendation,
        quantumVaultConfig,
        fetchQuantumVaultConfig,
        updateQuantumVaultConfig,
        decentralizedIdentity,
        fetchDecentralizedIdentity,
        linkBlockchainAddress,
        biometricEnrollmentStatus,
        fetchBiometricEnrollmentStatus,
        enrollBiometrics,
        currentApiKey: apiKeys[0] || null
    };
};