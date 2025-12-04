import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_API_KEY_USAGE } from '../../../../data/megadashboard';

// --- New Types and Interfaces ---

/**
 * @interface ApiKey
 * @augments {id, name, key, createdAt} - Existing properties.
 * @property {string} [description] - A detailed description for the API key.
 * @property {string} environmentId - The ID of the environment (e.g., Development, Production) this key belongs to.
 * @property {string[]} assignedPolicies - A list of policy IDs applied to this key.
 * @property {string[]} scopes - A list of specific permissions (scopes) granted to this key.
 * @property {string[]} allowedIps - A list of IP addresses or CIDR blocks allowed to use this key.
 * @property {string} [expiresAt] - ISO string date when the key expires.
 * @property {'active' | 'revoked' | 'expired' | 'paused'} status - Current status of the API key.
 * @property {string} [lastUsedAt] - ISO string date of the last successful use.
 * @property {string} createdBy - The user ID or system that created the key.
 */
interface ApiKey {
    id: string;
    name: string;
    key: string;
    createdAt: string; // ISO string
    description?: string;
    environmentId?: string;
    assignedPolicies?: string[];
    scopes?: string[];
    allowedIps?: string[];
    expiresAt?: string; // ISO string
    status?: 'active' | 'revoked' | 'expired' | 'paused';
    lastUsedAt?: string; // ISO string
    createdBy?: string;
}

/**
 * @interface ApiKeyPolicy
 * Represents a set of rules and constraints that can be applied to one or more API keys.
 */
export interface ApiKeyPolicy {
    id: string;
    name: string;
    description: string;
    rules: {
        maxRequestsPerMin?: number;
        allowedIps?: string[];
        expiresAfterDays?: number;
        requiredScopes?: string[];
        rateLimitBurst?: number; // New rule: burst requests allowed
    }[];
    createdAt: string; // ISO string
    lastUpdated: string; // ISO string
    status: 'active' | 'inactive';
}

/**
 * @interface ApiKeyEnvironment
 * Defines a logical environment for API keys (e.g., Development, Staging, Production).
 */
export interface ApiKeyEnvironment {
    id: string;
    name: string; // e.g., "Development", "Staging", "Production"
    description: string;
    defaultPolicies: string[]; // IDs of default policies for this environment
}

/**
 * @interface ApiKeyUsageLog
 * Detailed log entry for each API call made using a specific API key.
 */
export interface ApiKeyUsageLog {
    id: string;
    apiKeyId: string;
    timestamp: string; // ISO string
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
    status: number;
    latencyMs: number;
    dataSizeKb: number;
    userAgent: string;
    ipAddress: string;
    requestId: string;
    region: string; // New: geographic region of the request
}

/**
 * @interface Webhook
 * Configuration for a webhook endpoint to receive notifications about key events.
 */
export interface Webhook {
    id: string;
    name: string;
    url: string;
    events: ('key.created' | 'key.revoked' | 'key.expired' | 'usage.threshold_exceeded' | 'policy.violation')[];
    secret: string; // Secret for signing webhook payloads
    isActive: boolean;
    createdAt: string; // ISO string
    lastTriggeredAt?: string; // ISO string
}

/**
 * @interface AuditEvent
 * Records significant actions or changes within the API key management system.
 */
export interface AuditEvent {
    id: string;
    timestamp: string; // ISO string
    actor: string; // User ID or system responsible for the action
    action: string; // e.g., 'API_KEY_CREATED', 'API_KEY_REVOKED', 'POLICY_UPDATED'
    targetId: string; // ID of the affected resource (API key, policy, webhook)
    targetType: 'API_KEY' | 'POLICY' | 'WEBHOOK' | 'ENVIRONMENT' | 'SYSTEM';
    details: Record<string, any>; // JSON object with additional context (e.g., old/new values)
}

/**
 * @interface ServiceHealthMetric
 * Represents a health metric for an external service dependency.
 */
export interface ServiceHealthMetric {
    serviceName: string;
    status: 'operational' | 'degraded' | 'major_outage';
    lastChecked: string;
    message: string;
    latency?: number; // ms
}

/**
 * @interface UserAccessControl
 * Defines permissions for a specific user or role within the API key management.
 */
export interface UserAccessControl {
    userId: string;
    canViewAllKeys: boolean;
    canCreateKeys: boolean;
    canRevokeOwnKeys: boolean;
    canRevokeAllKeys: boolean;
    canEditOwnKeys: boolean;
    canEditAllKeys: boolean;
    canManagePolicies: boolean;
    canManageWebhooks: boolean;
    canViewAuditLogs: boolean;
    canAccessAiSuite: boolean;
}

// --- Utility Functions ---

/**
 * Generates a unique ID with an optional prefix.
 * @param {string} [prefix='id'] - The prefix for the ID.
 * @returns {string} A unique ID string.
 */
export const generateId = (prefix: string = 'id'): string => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Formats an ISO date string into a human-readable local date and time string.
 * @param {string} isoString - The ISO date string to format.
 * @returns {string} Formatted date and time string.
 */
export const formatTimestamp = (isoString: string): string => new Date(isoString).toLocaleString();

/**
 * Retrieves an environment variable by key, with a warning if not set.
 * @param {string} key - The environment variable key.
 * @returns {string} The value of the environment variable, or an empty string if not found.
 */
export const getEnvVariable = (key: string): string => {
    const value = process.env[key] || process.env[`NEXT_PUBLIC_${key}`]; // Support NEXT_PUBLIC for client-side
    if (!value) {
        console.warn(`Environment variable ${key} is not set.`);
        return '';
    }
    return value;
};

/**
 * Generates a cryptographically secure random string suitable for API keys or secrets.
 * @param {number} length - The desired length of the string.
 * @returns {string} A random string.
 */
export const generateSecureRandomString = (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomBytes = new Uint8Array(length);
    if (typeof window !== 'undefined' && window.crypto) { // Use Web Crypto API in browser
        window.crypto.getRandomValues(randomBytes);
    } else { // Fallback for Node.js environments (simplified, should use 'crypto' module)
        for (let i = 0; i < length; i++) randomBytes[i] = Math.floor(Math.random() * 256);
    }
    for (let i = 0; i < length; i++) {
        result += chars[randomBytes[i] % chars.length];
    }
    return result;
};

// --- Mock Data Generators (Extensive for 10,000 lines) ---

/**
 * Generates a mock API key.
 * @param {number} index - Index for unique naming and variations.
 * @param {string[]} policyIds - Available policy IDs to assign.
 * @param {string[]} environmentIds - Available environment IDs.
 * @param {string[]} scopes - All available scopes.
 * @returns {ApiKey} A mock API key.
 */
const generateMockApiKey = (index: number, policyIds: string[], environmentIds: string[], scopes: string[]): ApiKey => {
    const isLive = index % 3 === 0;
    const keyType = isLive ? 'live' : 'test';
    const envId = environmentIds[Math.floor(Math.random() * environmentIds.length)];
    const numPolicies = Math.floor(Math.random() * 3); // 0 to 2 policies
    const assignedPolicies = policyIds.sort(() => 0.5 - Math.random()).slice(0, numPolicies);
    const numScopes = Math.floor(Math.random() * (scopes.length / 2)) + 1; // 1 to half total scopes
    const assignedScopes = scopes.sort(() => 0.5 - Math.random()).slice(0, numScopes);
    const hasExpiry = Math.random() < 0.6;
    const expiresAt = hasExpiry ? new Date(Date.now() + Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString() : undefined;
    const keyStatus = Math.random() < 0.05 ? 'revoked' : (expiresAt && new Date(expiresAt) < new Date() ? 'expired' : 'active');
    const hasLastUsed = Math.random() < 0.9;
    const lastUsedAt = hasLastUsed ? new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString() : undefined;
    const hasIps = Math.random() < 0.4;
    const allowedIps = hasIps ? Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}/32`) : [];

    return {
        id: generateId('key'),
        name: `Key ${index} - ${isLive ? 'Prod' : 'Dev'} Access`,
        key: `db_sk_${keyType}_${generateSecureRandomString(24)}`,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
        description: `API key for ${isLive ? 'production' : 'development'} system ${index}.`,
        environmentId: envId,
        assignedPolicies: assignedPolicies,
        scopes: assignedScopes,
        allowedIps: allowedIps,
        expiresAt: expiresAt,
        status: keyStatus,
        lastUsedAt: lastUsedAt,
        createdBy: `user_${Math.floor(Math.random() * 50) + 1}`,
    };
};

export const generateMockApiKeys = (count: number, policyIds: string[], environmentIds: string[], scopes: string[]): ApiKey[] => {
    return Array.from({ length: count }, (_, i) => generateMockApiKey(i + 1, policyIds, environmentIds, scopes));
};

/**
 * Generates mock API usage logs for a given API key.
 * @param {string} apiKeyId - The ID of the API key.
 * @param {number} days - Number of days to generate logs for.
 * @param {number} minRequests - Minimum requests per day.
 * @param {number} maxRequests - Maximum requests per day.
 * @returns {ApiKeyUsageLog[]} An array of mock usage logs.
 */
export const generateMockUsageLogs = (apiKeyId: string, days: number = 7, minRequests: number = 50, maxRequests: number = 200): ApiKeyUsageLog[] => {
    const logs: ApiKeyUsageLog[] = [];
    const now = new Date();
    const endpoints = ['/transactions', '/users', '/payments', '/reports', '/events', '/products', '/integrations'];
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    const userAgents = ['Mozilla/5.0 (Node.js)', 'Java/11 HttpClient', 'Go-http-client/1.1', 'Python/requests', 'PostmanRuntime/7.29.0'];
    const regions = ['us-east-1', 'us-west-2', 'eu-central-1', 'ap-southeast-1'];

    for (let d = 0; d < days; d++) {
        const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d);
        const numRequests = Math.floor(Math.random() * (maxRequests - minRequests + 1)) + minRequests;
        for (let i = 0; i < numRequests; i++) {
            const timestamp = new Date(dayStart.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString();
            const status = Math.random() < 0.15 ? (Math.random() < 0.6 ? 400 + Math.floor(Math.random() * 10) : 500 + Math.floor(Math.random() * 5)) : 200;
            const latencyMs = Math.floor(Math.random() * 500) + 20;
            const dataSizeKb = Math.floor(Math.random() * 1000) / 10;
            logs.push({
                id: generateId('log'),
                apiKeyId,
                timestamp,
                endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
                method: methods[Math.floor(Math.random() * methods.length)] as any,
                status,
                latencyMs,
                dataSizeKb,
                userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
                ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
                requestId: generateId('req'),
                region: regions[Math.floor(Math.random() * regions.length)],
            });
        }
    }
    return logs;
};

/**
 * Generates mock API key policies.
 * @param {number} count - Number of policies to generate.
 * @returns {ApiKeyPolicy[]} An array of mock policies.
 */
export const generateMockPolicies = (count: number = 5): ApiKeyPolicy[] => {
    const policies: ApiKeyPolicy[] = [];
    for (let i = 0; i < count; i++) {
        const status = i % 2 === 0 ? 'active' : 'inactive';
        const rules = [{
            maxRequestsPerMin: 100 + i * 50,
            allowedIps: i % 2 === 0 ? [] : [`192.168.1.${i}`, `10.0.0.${i + 1}`],
            expiresAfterDays: i % 3 === 0 ? 90 : undefined,
            requiredScopes: i % 2 === 0 ? ['read:transactions', 'read:users'] : ['read:transactions', 'write:transactions', 'read:users', 'write:payments'],
            rateLimitBurst: 20 + i * 5,
        }];
        policies.push({
            id: generateId('policy'),
            name: `Policy ${i + 1} - ${status === 'active' ? 'Standard' : 'Restricted'}`,
            description: `A sample policy for various API key constraints. This policy is ${status}.`,
            rules: rules,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
            lastUpdated: new Date().toISOString(),
            status: status,
        });
    }
    return policies;
};

/**
 * Generates mock API key environments.
 * @param {string[]} policyIds - Available policy IDs to set as defaults.
 * @returns {ApiKeyEnvironment[]} An array of mock environments.
 */
export const generateMockEnvironments = (policyIds: string[]): ApiKeyEnvironment[] => {
    return [
        { id: 'env_dev', name: 'Development', description: 'Keys for development environments', defaultPolicies: [policyIds[0]] },
        { id: 'env_stag', name: 'Staging', description: 'Keys for staging/testing environments', defaultPolicies: [policyIds[1]] },
        { id: 'env_prod', name: 'Production', description: 'Keys for live production systems', defaultPolicies: [policyIds[2], policyIds[3]] },
    ];
};

/**
 * Generates mock webhooks.
 * @param {number} count - Number of webhooks to generate.
 * @returns {Webhook[]} An array of mock webhooks.
 */
export const generateMockWebhooks = (count: number = 3): Webhook[] => {
    const webhooks: Webhook[] = [];
    const eventsOptions: Webhook['events'][] = [
        ['key.created', 'key.revoked'],
        ['usage.threshold_exceeded', 'policy.violation'],
        ['key.expired', 'usage.threshold_exceeded', 'key.created']
    ];
    for (let i = 0; i < count; i++) {
        webhooks.push({
            id: generateId('wh'),
            name: `Webhook ${i + 1}`,
            url: `https://example.com/webhook-endpoint/${generateSecureRandomString(12)}`,
            events: eventsOptions[i % eventsOptions.length],
            secret: generateSecureRandomString(32),
            isActive: i % 2 === 0,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
            lastTriggeredAt: i % 3 === 0 ? new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString() : undefined,
        });
    }
    return webhooks;
};

/**
 * Generates mock audit events.
 * @param {number} count - Number of audit events to generate.
 * @param {string} [targetKeyId] - Optional API key ID to filter events by.
 * @returns {AuditEvent[]} An array of mock audit events.
 */
export const generateMockAuditEvents = (count: number = 200, targetKeyId?: string): AuditEvent[] => {
    const events: AuditEvent[] = [];
    const actions = [
        'API_KEY_CREATED', 'API_KEY_REVOKED', 'API_KEY_UPDATED_STATUS', 'API_KEY_UPDATED_SCOPES',
        'POLICY_CREATED', 'POLICY_UPDATED', 'POLICY_DELETED', 'POLICY_APPLIED_TO_KEY',
        'WEBHOOK_CREATED', 'WEBHOOK_UPDATED', 'WEBHOOK_DELETED', 'WEBHOOK_TRIGGERED',
        'USAGE_THRESHOLD_ALERT', 'ANOMALY_DETECTED', 'SYSTEM_HEALTH_CHECK'
    ];
    const targetTypes: AuditEvent['targetType'][] = ['API_KEY', 'POLICY', 'WEBHOOK', 'ENVIRONMENT', 'SYSTEM'];

    for (let i = 0; i < count; i++) {
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        const randomTargetType = targetTypes[Math.floor(Math.random() * targetTypes.length)];
        const targetId = targetKeyId && randomTargetType === 'API_KEY' ? targetKeyId : generateId('target');
        const actor = `user_${Math.floor(Math.random() * 50) + 1}` + (Math.random() < 0.1 ? ' (System)' : '');
        const timestamp = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString();

        let details: Record<string, any> = {
            ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            userAgent: `AuditClient/1.0`,
        };

        if (randomAction.includes('UPDATED')) {
            details.oldValue = randomAction.includes('STATUS') ? (Math.random() < 0.5 ? 'active' : 'paused') : ['read:users'];
            details.newValue = randomAction.includes('STATUS') ? (Math.random() < 0.5 ? 'paused' : 'active') : ['read:users', 'write:users'];
            details.reason = 'Manual update via dashboard';
        } else if (randomAction.includes('CREATED')) {
            details.createdBy = actor;
            details.initialConfig = { name: `Item ${generateSecureRandomString(5)}` };
        } else if (randomAction.includes('ALERT') || randomAction.includes('DETECTED')) {
            details.alertType = 'High Request Rate';
            details.threshold = 1000;
            details.currentValue = 1250;
        }

        events.push({
            id: generateId('audit'),
            timestamp,
            actor,
            action: randomAction,
            targetId,
            targetType: randomTargetType,
            details,
        });
    }
    return events;
};

/**
 * Generates mock service health metrics.
 * @returns {ServiceHealthMetric[]} An array of mock health metrics.
 */
export const generateMockServiceHealth = (): ServiceHealthMetric[] => {
    const services = ['Authentication Service', 'Payment Gateway', 'Data Storage', 'Analytics Engine', 'Email Service'];
    const statuses = ['operational', 'degraded', 'major_outage'];
    return services.map(service => ({
        serviceName: service,
        status: statuses[Math.floor(Math.random() * statuses.length)] as any,
        lastChecked: new Date().toISOString(),
        message: Math.random() < 0.2 ? 'Minor latency spikes detected.' : 'All systems normal.',
        latency: Math.random() < 0.5 ? Math.floor(Math.random() * 200) + 50 : undefined,
    }));
};

const ALL_AVAILABLE_SCOPES: string[] = [
    'read:transactions', 'write:transactions', 'delete:transactions',
    'read:users', 'write:users', 'delete:users',
    'read:payments', 'write:payments', 'process:payments', 'refund:payments',
    'read:reports', 'generate:reports', 'configure:reports',
    'read:events', 'write:events', 'delete:events',
    'manage:webhooks', 'read:policies', 'write:policies', 'delete:policies',
    'manage:environments', 'manage:rbac', 'monitor:health', 'audit:logs'
];

// Initial state for data
const MOCK_POLICIES_DATA: ApiKeyPolicy[] = generateMockPolicies(10);
const MOCK_POLICY_IDS: string[] = MOCK_POLICIES_DATA.map(p => p.id);
const MOCK_ENVIRONMENTS_DATA: ApiKeyEnvironment[] = generateMockEnvironments(MOCK_POLICY_IDS);
const MOCK_ENVIRONMENT_IDS: string[] = MOCK_ENVIRONMENTS_DATA.map(e => e.id);
const INITIAL_MOCK_API_KEYS: ApiKey[] = generateMockApiKeys(100, MOCK_POLICY_IDS, MOCK_ENVIRONMENT_IDS, ALL_AVAILABLE_SCOPES); // Starting with 100 keys
let ALL_MOCK_USAGE_LOGS: ApiKeyUsageLog[] = [];
INITIAL_MOCK_API_KEYS.forEach(key => {
    ALL_MOCK_USAGE_LOGS = ALL_MOCK_USAGE_LOGS.concat(generateMockUsageLogs(key.id, 90, 100, 500)); // 90 days of data, 100-500 requests per day
});
export const INITIAL_MOCK_POLICIES: ApiKeyPolicy[] = MOCK_POLICIES_DATA;
export const INITIAL_MOCK_ENVIRONMENTS: ApiKeyEnvironment[] = MOCK_ENVIRONMENTS_DATA;
export const INITIAL_MOCK_WEBHOOKS: Webhook[] = generateMockWebhooks(5);
export const INITIAL_MOCK_AUDIT_EVENTS: AuditEvent[] = generateMockAuditEvents(500); // Global audit events
export const INITIAL_SERVICE_HEALTH: ServiceHealthMetric[] = generateMockServiceHealth();

// --- Reusable UI Components ---

/**
 * Generic Modal component for displaying content in a dialog box.
 */
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
    }[size];

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]" onClick={onClose}>
            <div className={`bg-gray-800 rounded-lg shadow-2xl ${sizeClasses} w-full m-4 border border-gray-700`} onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors duration-200">&times;</button>
                </div>
                <div className="p-6 text-sm overflow-y-auto max-h-[80vh]">
                    {children}
                </div>
            </div>
        </div>
    );
};

/**
 * Simple Tooltip component for displaying hover information.
 */
interface TooltipProps {
    children: React.ReactNode;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ children, content, position = 'top' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const positionClasses = {
        top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
        bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
        left: 'right-full mr-2 top-1/2 -translate-y-1/2',
        right: 'left-full ml-2 top-1/2 -translate-y-1/2',
    }[position];

    return (
        <div className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className={`absolute z-50 px-3 py-1 bg-gray-700 text-white text-xs rounded shadow-lg ${positionClasses} whitespace-nowrap opacity-90 transition-opacity duration-200`}>
                    {content}
                </div>
            )}
        </div>
    );
};

/**
 * Custom hook for managing form state, validation, and submission.
 */
interface UseFormOptions<T> {
    initialValues: T;
    onSubmit: (values: T) => Promise<void>;
    onSuccess?: () => void;
    onError?: (error: any) => void;
    validationSchema?: (values: T) => Partial<Record<keyof T, string>>;
}

export const useForm = <T extends Record<string, any>>({
    initialValues,
    onSubmit,
    onSuccess,
    onError,
    validationSchema,
}: UseFormOptions<T>) => {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setValues(prev => ({ ...prev, [name]: finalValue }));
        if (errors[name as keyof T]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name as keyof T];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setSubmitSuccess(null);

        let validationErrors: Partial<Record<keyof T, string>> = {};
        if (validationSchema) {
            validationErrors = validationSchema(values);
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                setSubmitSuccess(false);
                return;
            }
        }

        setIsSubmitting(true);
        try {
            await onSubmit(values);
            setSubmitSuccess(true);
            onSuccess && onSuccess();
        } catch (error) {
            setSubmitSuccess(false);
            onError && onError(error);
            console.error("Form submission error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setSubmitSuccess(null);
    }, [initialValues]);

    return {
        values,
        setValues,
        handleChange,
        handleSubmit,
        errors,
        isSubmitting,
        submitSuccess,
        resetForm,
    };
};

/**
 * @interface CreateApiKeyFormData
 * Form data structure for creating a new API key.
 */
interface CreateApiKeyFormData {
    name: string;
    description: string;
    environmentId: string;
    assignedPolicies: string[];
    expiresAfterDays?: number | '';
    allowedIps: string; // comma-separated string
    scopes: string[];
    generateTestKey: boolean;
    createdBy: string;
}

const initialCreateKeyValues: CreateApiKeyFormData = {
    name: '',
    description: '',
    environmentId: '',
    assignedPolicies: [],
    allowedIps: '',
    scopes: [],
    generateTestKey: false,
    createdBy: 'dashboard_user', // Default creator
};

const createKeyValidationSchema = (values: CreateApiKeyFormData) => {
    const errors: Partial<Record<keyof CreateApiKeyFormData, string>> = {};
    if (!values.name) errors.name = 'Key name is required.';
    if (values.name.length < 3) errors.name = 'Key name must be at least 3 characters.';
    if (!values.environmentId) errors.environmentId = 'Environment is required.';
    if (values.expiresAfterDays !== undefined && values.expiresAfterDays !== '' && (isNaN(Number(values.expiresAfterDays)) || Number(values.expiresAfterDays) < 1)) {
        errors.expiresAfterDays = 'Expiry days must be a positive number.';
    }
    if (values.allowedIps) {
        const invalidIps = values.allowedIps.split(',').map(ip => ip.trim()).filter(Boolean).filter(ip => !/^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(ip));
        if (invalidIps.length > 0) errors.allowedIps = 'Invalid IP address or CIDR format found.';
    }
    if (values.scopes.length === 0) errors.scopes = 'At least one scope is required.';
    return errors;
};

interface CreateApiKeyFormProps {
    isOpen: boolean;
    onClose: () => void;
    onKeyCreated: (key: ApiKey) => void;
    availablePolicies: ApiKeyPolicy[];
    availableEnvironments: ApiKeyEnvironment[];
    allAvailableScopes: string[];
}

/**
 * Form component for creating new API keys with advanced options.
 */
export const CreateApiKeyForm: React.FC<CreateApiKeyFormProps> = ({ isOpen, onClose, onKeyCreated, availablePolicies, availableEnvironments, allAvailableScopes }) => {
    const { values, handleChange, handleSubmit, errors, isSubmitting, submitSuccess, setValues, resetForm } = useForm<CreateApiKeyFormData>({
        initialValues: initialCreateKeyValues,
        onSubmit: async (formData) => {
            await new Promise(res => setTimeout(res, 1500)); // Simulate API call
            const prefix = formData.generateTestKey ? 'db_sk_test' : 'db_sk_live';
            const expiresAt = formData.expiresAfterDays ? new Date(Date.now() + Number(formData.expiresAfterDays) * 24 * 60 * 60 * 1000).toISOString() : undefined;
            const newKey: ApiKey = {
                id: generateId('key'),
                name: formData.name,
                key: `${prefix}_${generateSecureRandomString(24)}`,
                createdAt: new Date().toISOString(),
                description: formData.description,
                environmentId: formData.environmentId,
                assignedPolicies: formData.assignedPolicies,
                scopes: formData.scopes,
                allowedIps: formData.allowedIps.split(',').map(ip => ip.trim()).filter(Boolean),
                expiresAt: expiresAt,
                status: 'active',
                createdBy: formData.createdBy,
            };
            onKeyCreated(newKey);
            resetForm(); // Reset after successful submission
            onClose();
        },
        validationSchema: createKeyValidationSchema,
    });

    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen, resetForm]);

    const handleIpChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValues(prev => ({ ...prev, allowedIps: e.target.value }));
    };

    const handleScopeChange = (scope: string, isChecked: boolean) => {
        setValues(prev => {
            const currentScopes = new Set(prev.scopes);
            if (isChecked) {
                currentScopes.add(scope);
            } else {
                currentScopes.delete(scope);
            }
            return { ...prev, scopes: Array.from(currentScopes) };
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New API Key" size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">Key Name</label>
                    <input type="text" id="name" name="name" value={values.name} onChange={handleChange}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500" />
                    {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
                    <textarea id="description" name="description" value={values.description} onChange={handleChange} rows={2}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                </div>
                <div>
                    <label htmlFor="environmentId" className="block text-sm font-medium text-gray-300">Environment</label>
                    <select id="environmentId" name="environmentId" value={values.environmentId} onChange={handleChange}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500">
                        <option value="">Select an environment</option>
                        {availableEnvironments.map(env => (
                            <option key={env.id} value={env.id}>{env.name}</option>
                        ))}
                    </select>
                    {errors.environmentId && <p className="mt-1 text-xs text-red-400">{errors.environmentId}</p>}
                </div>
                <div>
                    <label htmlFor="assignedPolicies" className="block text-sm font-medium text-gray-300">Assigned Policies</label>
                    <div className="mt-1 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-700 rounded-md border border-gray-600">
                        {availablePolicies.map(policy => (
                            <label key={policy.id} className="inline-flex items-center text-white text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="assignedPolicies"
                                    value={policy.id}
                                    checked={values.assignedPolicies.includes(policy.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setValues(prev => ({ ...prev, assignedPolicies: [...prev.assignedPolicies, policy.id] }));
                                        } else {
                                            setValues(prev => ({ ...prev, assignedPolicies: prev.assignedPolicies.filter(id => id !== policy.id) }));
                                        }
                                    }}
                                    className="form-checkbox h-4 w-4 text-cyan-600 transition duration-150 ease-in-out bg-gray-800 border-gray-600 rounded"
                                />
                                <span className="ml-2">{policy.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor="scopes" className="block text-sm font-medium text-gray-300">API Scopes/Permissions</label>
                    <div className="mt-1 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-700 rounded-md border border-gray-600">
                        {allAvailableScopes.map(scope => (
                            <label key={scope} className="inline-flex items-center text-white text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={values.scopes.includes(scope)}
                                    onChange={(e) => handleScopeChange(scope, e.target.checked)}
                                    className="form-checkbox h-4 w-4 text-cyan-600 transition duration-150 ease-in-out bg-gray-800 border-gray-600 rounded"
                                />
                                <span className="ml-2">{scope}</span>
                            </label>
                        ))}
                    </div>
                    {errors.scopes && <p className="mt-1 text-xs text-red-400">{errors.scopes}</p>}
                </div>
                <div>
                    <label htmlFor="expiresAfterDays" className="block text-sm font-medium text-gray-300">Expires After (Days)</label>
                    <input type="number" id="expiresAfterDays" name="expiresAfterDays" value={values.expiresAfterDays} onChange={handleChange}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
                        min="1" placeholder="Optional" />
                    {errors.expiresAfterDays && <p className="mt-1 text-xs text-red-400">{errors.expiresAfterDays}</p>}
                </div>
                <div>
                    <label htmlFor="allowedIps" className="block text-sm font-medium text-gray-300">Allowed IP Addresses (comma-separated)</label>
                    <textarea id="allowedIps" name="allowedIps" value={values.allowedIps} onChange={handleIpChange} rows={2}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder="e.g., 192.168.1.1, 10.0.0.0/24"></textarea>
                    {errors.allowedIps && <p className="mt-1 text-xs text-red-400">{errors.allowedIps}</p>}
                </div>
                <div className="flex items-center">
                    <input type="checkbox" id="generateTestKey" name="generateTestKey" checked={values.generateTestKey} onChange={handleChange}
                        className="form-checkbox h-4 w-4 text-cyan-600 transition duration-150 ease-in-out bg-gray-800 border-gray-600 rounded" />
                    <label htmlFor="generateTestKey" className="ml-2 block text-sm text-gray-300">Generate Test Key (vs. Live Key)</label>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 rounded-md border border-gray-600 hover:bg-gray-700 transition duration-200">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md text-sm font-medium text-white disabled:opacity-50 transition duration-200">
                        {isSubmitting ? 'Creating...' : 'Create API Key'}
                    </button>
                </div>
                {submitSuccess === true && <p className="mt-2 text-sm text-green-400">API Key created successfully!</p>}
                {submitSuccess === false && <p className="mt-2 text-sm text-red-400">Failed to create API Key. Please check your inputs.</p>}
            </form>
        </Modal>
    );
};

/**
 * StatusBadge component for displaying API key status with appropriate colors.
 */
const StatusBadge: React.FC<{ status: ApiKey['status'] }> = ({ status }) => {
    const colorClass = {
        'active': 'bg-green-600',
        'revoked': 'bg-red-600',
        'expired': 'bg-yellow-600',
        'paused': 'bg-blue-600',
    }[status || 'active'] || 'bg-gray-500';
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} text-white`}>{status?.toUpperCase() || 'UNKNOWN'}</span>;
};

/**
 * Detailed modal view for a single API Key, showing its attributes, usage, settings, and audit log.
 */
interface ApiKeyDetailModalProps {
    apiKey: ApiKey;
    isOpen: boolean;
    onClose: () => void;
    onRevoke: (keyId: string) => void;
    onUpdateKey: (updatedKey: ApiKey) => void; // New prop for updating key
    keyUsageLogs: ApiKeyUsageLog[];
    availablePolicies: ApiKeyPolicy[];
    availableEnvironments: ApiKeyEnvironment[];
    allAvailableScopes: string[];
}

export const ApiKeyDetailModal: React.FC<ApiKeyDetailModalProps> = ({
    apiKey,
    isOpen,
    onClose,
    onRevoke,
    onUpdateKey,
    keyUsageLogs,
    availablePolicies,
    availableEnvironments,
    allAvailableScopes
}) => {
    const [activeTab, setActiveTab] = useState<'details' | 'usage' | 'settings' | 'audit'>('details');
    const [isRevokeConfirmOpen, setRevokeConfirmOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);

    // Derive or mock additional key details consistently
    const extendedKeyDetails = useMemo(() => {
        const env = availableEnvironments.find(e => e.id === apiKey.environmentId) || availableEnvironments[0] || { id: 'unknown_env', name: 'Unknown', description: 'N/A', defaultPolicies: [] };
        const assignedPolicies = availablePolicies.filter(p => apiKey.assignedPolicies?.includes(p.id)) || [];
        const status = apiKey.status || (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date() ? 'expired' : 'active');
        const scopes = apiKey.scopes || [];
        const allowedIps = apiKey.allowedIps || [];

        return {
            env,
            assignedPolicies,
            status,
            scopes,
            allowedIps
        };
    }, [apiKey, availableEnvironments, availablePolicies]);

    // Form state for editing key settings
    const [editValues, setEditValues] = useState<{
        name: string;
        description: string;
        status: ApiKey['status'];
        expiresAfterDays?: number | '';
        allowedIps: string;
        scopes: string[];
        assignedPolicies: string[];
    }>({
        name: apiKey.name,
        description: apiKey.description || '',
        status: extendedKeyDetails.status,
        expiresAfterDays: apiKey.expiresAt ? Math.ceil((new Date(apiKey.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : '',
        allowedIps: extendedKeyDetails.allowedIps.join(', '),
        scopes: extendedKeyDetails.scopes,
        assignedPolicies: extendedKeyDetails.assignedPolicies.map(p => p.id),
    });

    useEffect(() => {
        // Reset edit values when opening a new key or switching to view mode
        if (isOpen && !editMode) {
            setEditValues({
                name: apiKey.name,
                description: apiKey.description || '',
                status: extendedKeyDetails.status,
                expiresAfterDays: apiKey.expiresAt ? Math.ceil((new Date(apiKey.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : '',
                allowedIps: extendedKeyDetails.allowedIps.join(', '),
                scopes: extendedKeyDetails.scopes,
                assignedPolicies: extendedKeyDetails.assignedPolicies.map(p => p.id),
            });
        }
    }, [isOpen, editMode, apiKey, extendedKeyDetails]);

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // Handle number input specifically for expiresAfterDays
        if (name === 'expiresAfterDays') {
            setEditValues(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
        } else {
            setEditValues(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleEditIpChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditValues(prev => ({ ...prev, allowedIps: e.target.value }));
    };

    const handleEditScopeChange = (scope: string, isChecked: boolean) => {
        setEditValues(prev => {
            const currentScopes = new Set(prev.scopes);
            if (isChecked) {
                currentScopes.add(scope);
            } else {
                currentScopes.delete(scope);
            }
            return { ...prev, scopes: Array.from(currentScopes) };
        });
    };

    const handleEditPolicyChange = (policyId: string, isChecked: boolean) => {
        setEditValues(prev => {
            const currentPolicies = new Set(prev.assignedPolicies);
            if (isChecked) {
                currentPolicies.add(policyId);
            } else {
                currentPolicies.delete(policyId);
            }
            return { ...prev, assignedPolicies: Array.from(currentPolicies) };
        });
    };

    const handleSaveSettings = async () => {
        // Basic validation for edit settings
        if (!editValues.name || editValues.name.length < 3) {
            alert("Key name must be at least 3 characters.");
            return;
        }
        if (editValues.expiresAfterDays !== undefined && editValues.expiresAfterDays !== '' && (isNaN(Number(editValues.expiresAfterDays)) || Number(editValues.expiresAfterDays) < 1)) {
            alert("Expiry days must be a positive number.");
            return;
        }
        if (editValues.allowedIps) {
            const invalidIps = editValues.allowedIps.split(',').map(ip => ip.trim()).filter(Boolean).filter(ip => !/^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(ip));
            if (invalidIps.length > 0) {
                alert('Invalid IP address or CIDR format found in Allowed IP Addresses.');
                return;
            }
        }
        if (editValues.scopes.length === 0) {
            alert("At least one scope is required.");
            return;
        }

        // Simulate API call to update key settings
        console.log("Saving key settings:", editValues);
        await new Promise(res => setTimeout(res, 1000));

        const updatedKey: ApiKey = {
            ...apiKey,
            name: editValues.name,
            description: editValues.description,
            status: editValues.status,
            expiresAt: editValues.expiresAfterDays ? new Date(Date.now() + Number(editValues.expiresAfterDays) * 24 * 60 * 60 * 1000).toISOString() : undefined,
            allowedIps: editValues.allowedIps.split(',').map(ip => ip.trim()).filter(Boolean),
            scopes: editValues.scopes,
            assignedPolicies: editValues.assignedPolicies,
        };
        onUpdateKey(updatedKey); // Call the prop function to update the parent state
        setEditMode(false);
    };

    const handleRevoke = async () => {
        await new Promise(res => setTimeout(res, 500));
        onRevoke(apiKey.id);
        setRevokeConfirmOpen(false);
        onClose();
    };

    // Filter usage logs specific to this key, and prepare for charts
    const currentKeyUsage = useMemo(() => {
        const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return keyUsageLogs
            .filter(log => log.apiKeyId === apiKey.id && new Date(log.timestamp) > last7Days)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [apiKey.id, keyUsageLogs]);

    const latencyData = useMemo(() => {
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return currentKeyUsage
            .filter(u => new Date(u.timestamp) > last24Hours)
            .map(u => ({ name: new Date(u.timestamp).toLocaleTimeString(), latency: u.latencyMs }))
            .slice(-50); // Limit data points for chart readability
    }, [currentKeyUsage]);

    const errorData = useMemo(() => {
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const errorCountsByEndpoint: { [key: string]: { name: string; errors: number } } = {};
        currentKeyUsage.filter(u => new Date(u.timestamp) > last24Hours).forEach(u => {
            if (u.status >= 400) {
                if (!errorCountsByEndpoint[u.endpoint]) {
                    errorCountsByEndpoint[u.endpoint] = { name: u.endpoint.split('/').pop() || 'Other', errors: 0 };
                }
                errorCountsByEndpoint[u.endpoint].errors++;
            }
        });
        return Object.values(errorCountsByEndpoint);
    }, [currentKeyUsage]);


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`API Key: ${apiKey.name}`} size="2xl">
            <div className="flex border-b border-gray-700 -mx-6 px-6">
                <button
                    onClick={() => setActiveTab('details')}
                    className={`py-2 px-4 text-sm font-medium ${activeTab === 'details' ? 'border-b-2 border-cyan-500 text-cyan-400' : 'text-gray-400 hover:text-white'} transition duration-200`}
                >Details</button>
                <button
                    onClick={() => setActiveTab('usage')}
                    className={`py-2 px-4 text-sm font-medium ${activeTab === 'usage' ? 'border-b-2 border-cyan-500 text-cyan-400' : 'text-gray-400 hover:text-white'} transition duration-200`}
                >Usage</button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`py-2 px-4 text-sm font-medium ${activeTab === 'settings' ? 'border-b-2 border-cyan-500 text-cyan-400' : 'text-gray-400 hover:text-white'} transition duration-200`}
                >Settings</button>
                 <button
                    onClick={() => setActiveTab('audit')}
                    className={`py-2 px-4 text-sm font-medium ${activeTab === 'audit' ? 'border-b-2 border-cyan-500 text-cyan-400' : 'text-gray-400 hover:text-white'} transition duration-200`}
                >Audit Log</button>
            </div>

            <div className="mt-4 p-4 space-y-4 -mx-6">
                {activeTab === 'details' && (
                    <div className="space-y-4 px-6">
                        <h4 className="text-lg font-semibold text-white">General Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><p className="text-gray-400">Key ID:</p><p className="font-mono text-white break-all">{apiKey.id}</p></div>
                            <div><p className="text-gray-400">Key Name:</p><p className="text-white break-words">{apiKey.name}</p></div>
                            <div><p className="text-gray-400">Key Secret:</p>
                                <div className="flex items-center gap-2">
                                    <p className="font-mono text-cyan-300 break-all">{apiKey.key.substring(0, 8)}...<span className="text-gray-500">(hidden)</span></p>
                                    <Tooltip content="Copy to clipboard">
                                        <button onClick={() => navigator.clipboard.writeText(apiKey.key)} className="text-sm px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white">Copy</button>
                                    </Tooltip>
                                </div>
                            </div>
                            <div><p className="text-gray-400">Created At:</p><p className="text-white">{formatTimestamp(apiKey.createdAt)}</p></div>
                            <div><p className="text-gray-400">Status:</p><StatusBadge status={extendedKeyDetails.status} /></div>
                            <div><p className="text-gray-400">Environment:</p><p className="text-white">{extendedKeyDetails.env.name}</p></div>
                            {apiKey.expiresAt && <div><p className="text-gray-400">Expires On:</p><p className="text-white">{formatTimestamp(apiKey.expiresAt)}</p></div>}
                            {apiKey.lastUsedAt && <div><p className="text-gray-400">Last Used:</p><p className="text-white">{formatTimestamp(apiKey.lastUsedAt)}</p></div>}
                             <div><p className="text-gray-400">Created By:</p><p className="text-white">{apiKey.createdBy}</p></div>
                        </div>
                        <div className="mt-4">
                            <p className="text-gray-400">Description:</p>
                            <p className="text-white italic">{apiKey.description || 'No description provided.'}</p>
                        </div>
                        <h4 className="text-lg font-semibold text-white mt-6">Permissions & Policies</h4>
                        <div>
                            <p className="text-gray-400">Allowed Scopes:</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {extendedKeyDetails.scopes.map(scope => (
                                    <span key={scope} className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-700 text-white">{scope}</span>
                                ))}
                                {extendedKeyDetails.scopes.length === 0 && <span className="text-gray-500 italic">No specific scopes assigned.</span>}
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-gray-400">Applied Policies:</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {extendedKeyDetails.assignedPolicies.map(policy => (
                                    <span key={policy.id} className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-700 text-white">{policy.name}</span>
                                ))}
                                {extendedKeyDetails.assignedPolicies.length === 0 && <span className="text-gray-500 italic">No policies assigned.</span>}
                            </div>
                        </div>
                        {extendedKeyDetails.allowedIps.length > 0 && (
                            <div className="mt-4">
                                <p className="text-gray-400">IP Whitelist:</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {extendedKeyDetails.allowedIps.map(ip => (
                                        <span key={ip} className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-700 text-white">{ip}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setRevokeConfirmOpen(true)} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium text-white transition duration-200">Revoke Key</button>
                        </div>
                    </div>
                )}

                {activeTab === 'usage' && (
                    <div className="space-y-4 px-6">
                        <h4 className="text-lg font-semibold text-white">Recent Usage Metrics (Last 24 Hours)</h4>
                        {currentKeyUsage.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card title="Latency (Last Day)" className="!p-4">
                                    <ResponsiveContainer width="100%" height={180}>
                                        <LineChart data={latencyData}>
                                            <XAxis dataKey="name" fontSize={10} stroke="#9ca3af" />
                                            <YAxis stroke="#9ca3af" />
                                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none', borderRadius: '4px' }} itemStyle={{ color: '#fff' }} labelStyle={{ color: '#9ca3af' }} />
                                            <Line type="monotone" dataKey="latency" name="Latency (ms)" stroke="#8884d8" dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Card>
                                <Card title="Errors by Endpoint (Last Day)" className="!p-4">
                                    <ResponsiveContainer width="100%" height={180}>
                                        <BarChart data={errorData}>
                                            <XAxis dataKey="name" fontSize={10} stroke="#9ca3af" />
                                            <YAxis stroke="#9ca3af" />
                                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none', borderRadius: '4px' }} itemStyle={{ color: '#fff' }} labelStyle={{ color: '#9ca3af' }} />
                                            <Bar dataKey="errors" fill="#ef4444" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No recent usage data available for this key.</p>
                        )}
                        <h4 className="text-lg font-semibold text-white mt-6">Detailed Usage Logs (Last 7 Days)</h4>
                        <div className="max-h-96 overflow-y-auto border border-gray-700 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-700 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Timestamp</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Method</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Endpoint</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Latency (ms)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">IP Address</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Region</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-800 divide-y divide-gray-700">
                                    {currentKeyUsage.length > 0 ? (
                                        currentKeyUsage.map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-700 transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatTimestamp(log.timestamp)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{log.method}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{log.endpoint}</td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${log.status >= 400 ? 'text-red-400' : 'text-green-400'}`}>{log.status}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{log.latencyMs}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{log.ipAddress}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{log.region}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={7} className="text-center py-4 text-gray-500">No detailed logs for this key in the last 7 days.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-4 px-6">
                        <h4 className="text-lg font-semibold text-white">Key Configuration</h4>
                        {editMode ? (
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="edit_name" className="block text-sm font-medium text-gray-300">Key Name</label>
                                    <input type="text" id="edit_name" name="name" value={editValues.name} onChange={handleEditChange}
                                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500" />
                                </div>
                                <div>
                                    <label htmlFor="edit_description" className="block text-sm font-medium text-gray-300">Description</label>
                                    <textarea id="edit_description" name="description" value={editValues.description} onChange={handleEditChange} rows={2}
                                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                                </div>
                                <div>
                                    <label htmlFor="edit_status" className="block text-sm font-medium text-gray-300">Status</label>
                                    <select id="edit_status" name="status" value={editValues.status} onChange={handleEditChange}
                                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500">
                                        <option value="active">Active</option>
                                        <option value="paused">Paused</option>
                                        <option value="revoked">Revoked</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="edit_expiresAfterDays" className="block text-sm font-medium text-gray-300">Expires After (Days, leave empty for no expiry)</label>
                                    <input type="number" id="edit_expiresAfterDays" name="expiresAfterDays" value={editValues.expiresAfterDays} onChange={handleEditChange}
                                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
                                        min="1" placeholder="Optional" />
                                </div>
                                <div>
                                    <label htmlFor="edit_allowedIps" className="block text-sm font-medium text-gray-300">Allowed IP Addresses (comma-separated)</label>
                                    <textarea id="edit_allowedIps" name="allowedIps" value={editValues.allowedIps} onChange={handleEditIpChange} rows={2}
                                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
                                        placeholder="e.g., 192.168.1.1, 10.0.0.0/24"></textarea>
                                </div>
                                <div>
                                    <p className="block text-sm font-medium text-gray-300">API Scopes/Permissions</p>
                                    <div className="mt-1 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-700 rounded-md border border-gray-600">
                                        {allAvailableScopes.map(scope => (
                                            <label key={scope} className="inline-flex items-center text-white text-sm cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={editValues.scopes.includes(scope)}
                                                    onChange={(e) => handleEditScopeChange(scope, e.target.checked)}
                                                    className="form-checkbox h-4 w-4 text-cyan-600 transition duration-150 ease-in-out bg-gray-800 border-gray-600 rounded"
                                                />
                                                <span className="ml-2">{scope}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="block text-sm font-medium text-gray-300">Assigned Policies</p>
                                    <div className="mt-1 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-700 rounded-md border border-gray-600">
                                        {availablePolicies.map(policy => (
                                            <label key={policy.id} className="inline-flex items-center text-white text-sm cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={editValues.assignedPolicies.includes(policy.id)}
                                                    onChange={(e) => handleEditPolicyChange(policy.id, e.target.checked)}
                                                    className="form-checkbox h-4 w-4 text-cyan-600 transition duration-150 ease-in-out bg-gray-800 border-gray-600 rounded"
                                                />
                                                <span className="ml-2">{policy.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                                    <button type="button" onClick={() => setEditMode(false)} className="px-4 py-2 text-sm font-medium text-gray-300 rounded-md border border-gray-600 hover:bg-gray-700 transition duration-200">Cancel</button>
                                    <button type="button" onClick={handleSaveSettings} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium text-white transition duration-200">Save Changes</button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><p className="text-gray-400">Name:</p><p className="text-white">{apiKey.name}</p></div>
                                    <div><p className="text-gray-400">Status:</p><StatusBadge status={extendedKeyDetails.status} /></div>
                                    <div><p className="text-gray-400">Description:</p><p className="text-white italic">{apiKey.description || 'No description provided.'}</p></div>
                                    <div><p className="text-gray-400">Expiry:</p><p className="text-white">{apiKey.expiresAt ? `Expires on ${formatTimestamp(apiKey.expiresAt)}` : 'No expiry'}</p></div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-gray-400">IP Whitelist:</p>
                                    <p className="text-white">{extendedKeyDetails.allowedIps.length > 0 ? extendedKeyDetails.allowedIps.join(', ') : 'None'}</p>
                                </div>
                                <div className="mt-4">
                                    <p className="text-gray-400">Active Scopes:</p>
                                    <p className="text-white">{extendedKeyDetails.scopes.length > 0 ? extendedKeyDetails.scopes.join(', ') : 'None'}</p>
                                </div>
                                <div className="mt-4">
                                    <p className="text-gray-400">Applied Policies:</p>
                                    <p className="text-white">{extendedKeyDetails.assignedPolicies.map(p => p.name).join(', ') || 'None'}</p>
                                </div>
                                <div className="flex justify-end">
                                    <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium text-white transition duration-200">Edit Settings</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'audit' && (
                    <div className="px-6">
                         <ApiKeyAuditLog keyId={apiKey.id} isModal={true} />
                    </div>
                )}
            </div>

            <Modal isOpen={isRevokeConfirmOpen} onClose={() => setRevokeConfirmOpen(false)} title="Confirm Revocation" size="sm">
                <p className="text-red-300 mb-4">Are you sure you want to revoke API Key: <span className="font-bold">{apiKey.name}</span>?</p>
                <p className="text-sm text-gray-400">This action cannot be undone and will immediately disable the key, preventing any further API calls.</p>
                <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={() => setRevokeConfirmOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-300 rounded-md border border-gray-600 hover:bg-gray-700 transition duration-200">Cancel</button>
                    <button type="button" onClick={handleRevoke} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium text-white transition duration-200">Revoke Key</button>
                </div>
            </Modal>
        </Modal>
    );
};

/**
 * Table component for displaying and managing API Key Policies.
 */
interface ApiKeyPoliciesTableProps {
    policies: ApiKeyPolicy[];
    onEditPolicy: (policy: ApiKeyPolicy) => void;
    onDeletePolicy: (policyId: string) => void;
    onCreateNewPolicy: () => void;
}

export const ApiKeyPoliciesTable: React.FC<ApiKeyPoliciesTableProps> = ({ policies, onEditPolicy, onDeletePolicy, onCreateNewPolicy }) => {
    const [filterText, setFilterText] = useState('');
    const [sortKey, setSortKey] = useState<keyof ApiKeyPolicy>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const filteredAndSortedPolicies = useMemo(() => {
        let filtered = policies.filter(policy =>
            policy.name.toLowerCase().includes(filterText.toLowerCase()) ||
            policy.description.toLowerCase().includes(filterText.toLowerCase()) ||
            policy.id.toLowerCase().includes(filterText.toLowerCase())
        );

        return filtered.sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }
            // For complex types like 'rules' or 'createdAt' (string comparison)
            if (sortKey === 'createdAt' || sortKey === 'lastUpdated') {
                 return sortDirection === 'asc' ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return 0;
        });
    }, [policies, filterText, sortKey, sortDirection]);

    const handleSort = (key: keyof ApiKeyPolicy) => {
        if (sortKey === key) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const SortIcon: React.FC<{ active: boolean; direction: 'asc' | 'desc' }> = ({ active, direction }) => {
        if (!active) return <span className="ml-1 text-gray-500">↕</span>;
        return direction === 'asc' ? <span className="ml-1">▲</span> : <span className="ml-1">▼</span>;
    };

    return (
        <Card title="API Key Policies">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <input
                    type="text"
                    placeholder="Search policies..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="flex-grow max-w-sm px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
                />
                <button onClick={onCreateNewPolicy} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md text-sm font-medium text-white transition duration-200">
                    Create New Policy
                </button>
            </div>
            <div className="overflow-x-auto border border-gray-700 rounded-lg">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                                Name <SortIcon active={sortKey === 'name'} direction={sortDirection} />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>
                                Status <SortIcon active={sortKey === 'status'} direction={sortDirection} />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Rules
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {filteredAndSortedPolicies.length > 0 ? (
                            filteredAndSortedPolicies.map((policy) => (
                                <tr key={policy.id} className="hover:bg-gray-700 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{policy.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate" title={policy.description}>{policy.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${policy.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {policy.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        <ul className="list-disc list-inside space-y-1">
                                            {policy.rules.map((rule, idx) => (
                                                <li key={idx}>
                                                    {rule.maxRequestsPerMin && <Tooltip content={`Max ${rule.maxRequestsPerMin} req/min`}><span>Rate Limit</span></Tooltip>}
                                                    {rule.rateLimitBurst && ` (+${rule.rateLimitBurst} burst)`}
                                                    {rule.allowedIps && rule.allowedIps.length > 0 && ` | IPs: ${rule.allowedIps.join(', ')}`}
                                                    {rule.expiresAfterDays && ` | Expires: ${rule.expiresAfterDays} days`}
                                                    {rule.requiredScopes && rule.requiredScopes.length > 0 && ` | Scopes: ${rule.requiredScopes.join(', ')}`}
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => onEditPolicy(policy)} className="text-cyan-400 hover:text-cyan-300 mr-4 transition duration-200">Edit</button>
                                        <button onClick={() => onDeletePolicy(policy.id)} className="text-red-400 hover:text-red-300 transition duration-200">Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No policies found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

/**
 * Form data for creating or editing an API Key Policy.
 */
interface PolicyFormData {
    name: string;
    description: string;
    status: 'active' | 'inactive';
    maxRequestsPerMin: number | '';
    allowedIps: string; // comma-separated string
    expiresAfterDays: number | '';
    requiredScopes: string[]; // array of scopes
    rateLimitBurst: number | '';
}

const initialPolicyFormData: PolicyFormData = {
    name: '',
    description: '',
    status: 'active',
    maxRequestsPerMin: '',
    allowedIps: '',
    expiresAfterDays: '',
    requiredScopes: [],
    rateLimitBurst: '',
};

const policyValidationSchema = (values: PolicyFormData) => {
    const errors: Partial<Record<keyof PolicyFormData, string>> = {};
    if (!values.name) errors.name = 'Policy name is required.';
    if (values.name.length < 3) errors.name = 'Policy name must be at least 3 characters.';
    if (values.maxRequestsPerMin !== '' && (isNaN(Number(values.maxRequestsPerMin)) || Number(values.maxRequestsPerMin) <= 0)) errors.maxRequestsPerMin = 'Max Requests Per Minute must be a positive number.';
    if (values.rateLimitBurst !== '' && (isNaN(Number(values.rateLimitBurst)) || Number(values.rateLimitBurst) < 0)) errors.rateLimitBurst = 'Rate Limit Burst must be a non-negative number.';
    if (values.expiresAfterDays !== '' && (isNaN(Number(values.expiresAfterDays)) || Number(values.expiresAfterDays) <= 0)) errors.expiresAfterDays = 'Expiry days must be a positive number.';
    if (values.allowedIps) {
        const invalidIps = values.allowedIps.split(',').map(ip => ip.trim()).filter(Boolean).filter(ip => !/^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(ip));
        if (invalidIps.length > 0) errors.allowedIps = 'Invalid IP address or CIDR format found.';
    }
    // No explicit error for scopes, as a policy could theoretically have no scopes defined.
    return errors;
};

interface ManagePolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    policyToEdit?: ApiKeyPolicy;
    onSave: (policy: ApiKeyPolicy) => void;
    allAvailableScopes: string[];
}

/**
 * Modal form for creating or editing an API Key Policy.
 */
export const ManagePolicyModal: React.FC<ManagePolicyModalProps> = ({ isOpen, onClose, policyToEdit, onSave, allAvailableScopes }) => {
    const initialValues = useMemo(() => {
        if (policyToEdit) {
            const rule = policyToEdit.rules[0] || {}; // Assuming one rule for simplicity
            return {
                name: policyToEdit.name,
                description: policyToEdit.description,
                status: policyToEdit.status,
                maxRequestsPerMin: rule.maxRequestsPerMin || '',
                allowedIps: rule.allowedIps?.join(', ') || '',
                expiresAfterDays: rule.expiresAfterDays || '',
                requiredScopes: rule.requiredScopes || [],
                rateLimitBurst: rule.rateLimitBurst || '',
            };
        }
        return initialPolicyFormData;
    }, [policyToEdit]);

    const { values, handleChange, handleSubmit, errors, isSubmitting, submitSuccess, setValues, resetForm } = useForm<PolicyFormData>({
        initialValues,
        onSubmit: async (formData) => {
            await new Promise(res => setTimeout(res, 1000)); // Simulate API call
            const newPolicy: ApiKeyPolicy = {
                id: policyToEdit?.id || generateId('policy'),
                name: formData.name,
                description: formData.description,
                status: formData.status,
                rules: [{
                    maxRequestsPerMin: formData.maxRequestsPerMin !== '' ? Number(formData.maxRequestsPerMin) : undefined,
                    allowedIps: formData.allowedIps ? formData.allowedIps.split(',').map(ip => ip.trim()).filter(Boolean) : undefined,
                    expiresAfterDays: formData.expiresAfterDays !== '' ? Number(formData.expiresAfterDays) : undefined,
                    requiredScopes: formData.requiredScopes.length > 0 ? formData.requiredScopes : undefined,
                    rateLimitBurst: formData.rateLimitBurst !== '' ? Number(formData.rateLimitBurst) : undefined,
                }],
                createdAt: policyToEdit?.createdAt || new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
            };
            onSave(newPolicy);
            onClose(); // Close modal on success
        },
        validationSchema: policyValidationSchema,
        onSuccess: () => console.log("Policy saved successfully."),
        onError: (err) => console.error("Error saving policy:", err),
    });

    useEffect(() => {
        if (!isOpen) resetForm();
        else setValues(initialValues);
    }, [isOpen, initialValues, resetForm, setValues]);

    const handleScopeChange = (scope: string, isChecked: boolean) => {
        setValues(prev => {
            const currentScopes = new Set(prev.requiredScopes);
            if (isChecked) {
                currentScopes.add(scope);
            } else {
                currentScopes.delete(scope);
            }
            return { ...prev, requiredScopes: Array.from(currentScopes) };
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={policyToEdit ? 'Edit API Key Policy' : 'Create New API Key Policy'} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="policyName" className="block text-sm font-medium text-gray-300">Policy Name</label>
                    <input type="text" id="policyName" name="name" value={values.name} onChange={handleChange}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500" />
                    {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                </div>
                <div>
                    <label htmlFor="policyDescription" className="block text-sm font-medium text-gray-300">Description</label>
                    <textarea id="policyDescription" name="description" value={values.description} onChange={handleChange} rows={2}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                </div>
                <div>
                    <label htmlFor="policyStatus" className="block text-sm font-medium text-gray-300">Status</label>
                    <select id="policyStatus" name="status" value={values.status} onChange={handleChange}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <fieldset className="p-4 border border-gray-700 rounded-md space-y-3">
                    <legend className="text-md font-semibold text-white px-2">Policy Rules</legend>
                    <div>
                        <label htmlFor="maxRequestsPerMin" className="block text-sm font-medium text-gray-300">Max Requests Per Minute (Rate Limit)</label>
                        <input type="number" id="maxRequestsPerMin" name="maxRequestsPerMin" value={values.maxRequestsPerMin} onChange={handleChange}
                            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="e.g., 1000" min="1" />
                        {errors.maxRequestsPerMin && <p className="mt-1 text-xs text-red-400">{errors.maxRequestsPerMin}</p>}
                    </div>
                    <div>
                        <label htmlFor="rateLimitBurst" className="block text-sm font-medium text-gray-300">Rate Limit Burst (requests allowed above limit momentarily)</label>
                        <input type="number" id="rateLimitBurst" name="rateLimitBurst" value={values.rateLimitBurst} onChange={handleChange}
                            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="e.g., 200" min="0" />
                        {errors.rateLimitBurst && <p className="mt-1 text-xs text-red-400">{errors.rateLimitBurst}</p>}
                    </div>
                    <div>
                        <label htmlFor="allowedIps" className="block text-sm font-medium text-gray-300">Allowed IP Addresses (comma-separated)</label>
                        <textarea id="allowedIps" name="allowedIps" value={values.allowedIps} onChange={handleChange} rows={2}
                            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="e.g., 192.168.1.1, 10.0.0.0/24"></textarea>
                        {errors.allowedIps && <p className="mt-1 text-xs text-red-400">{errors.allowedIps}</p>}
                    </div>
                    <div>
                        <label htmlFor="expiresAfterDays" className="block text-sm font-medium text-gray-300">Expires After (Days, leave empty for no expiry)</label>
                        <input type="number" id="expiresAfterDays" name="expiresAfterDays" value={values.expiresAfterDays} onChange={handleChange}
                            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="e.g., 90" min="1" />
                        {errors.expiresAfterDays && <p className="mt-1 text-xs text-red-400">{errors.expiresAfterDays}</p>}
                    </div>
                    <div>
                        <p className="block text-sm font-medium text-gray-300">Required API Scopes</p>
                        <div className="mt-1 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-700 rounded-md border border-gray-600">
                            {allAvailableScopes.map(scope => (
                                <label key={scope} className="inline-flex items-center text-white text-sm cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={values.requiredScopes.includes(scope)}
                                        onChange={(e) => handleScopeChange(scope, e.target.checked)}
                                        className="form-checkbox h-4 w-4 text-cyan-600 transition duration-150 ease-in-out bg-gray-800 border-gray-600 rounded"
                                    />
                                    <span className="ml-2">{scope}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </fieldset>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 rounded-md border border-gray-600 hover:bg-gray-700 transition duration-200">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md text-sm font-medium text-white disabled:opacity-50 transition duration-200">
                        {isSubmitting ? 'Saving...' : 'Save Policy'}
                    </button>
                </div>
                {submitSuccess === true && <p className="mt-2 text-sm text-green-400">Policy saved successfully!</p>}
                {submitSuccess === false && <p className="mt-2 text-sm text-red-400">Failed to save policy. Please check your inputs.</p>}
            </form>
        </Modal>
    );
};

/**
 * Form for configuring a single Webhook.
 */
interface WebhookConfigurationFormProps {
    webhook?: Webhook;
    onSave: (webhook: Webhook) => void;
    onCancel: () => void;
    onDelete?: (id: string) => void;
}

interface WebhookFormData {
    name: string;
    url: string;
    events: Webhook['events'];
    isActive: boolean;
    secret: string;
}

const initialWebhookFormData: WebhookFormData = {
    name: '',
    url: '',
    events: ['key.created'],
    isActive: true,
    secret: generateSecureRandomString(32),
};

const webhookValidationSchema = (values: WebhookFormData) => {
    const errors: Partial<Record<keyof WebhookFormData, string>> = {};
    if (!values.name) errors.name = 'Webhook name is required.';
    if (!values.url || !/^https?:\/\/.+\..+/.test(values.url)) errors.url = 'Valid URL (starting with http/https) is required.';
    if (values.events.length === 0) errors.events = 'At least one event must be selected.';
    return errors;
};

export const WebhookConfigurationForm: React.FC<WebhookConfigurationFormProps> = ({ webhook, onSave, onCancel, onDelete }) => {
    const initialValues = useMemo(() => {
        if (webhook) {
            return {
                name: webhook.name,
                url: webhook.url,
                events: webhook.events,
                isActive: webhook.isActive,
                secret: webhook.secret,
            };
        }
        return initialWebhookFormData;
    }, [webhook]);

    const { values, handleChange, handleSubmit, errors, isSubmitting, submitSuccess, setValues, resetForm } = useForm<WebhookFormData>({
        initialValues,
        onSubmit: async (formData) => {
            await new Promise(res => setTimeout(res, 1000)); // Simulate API call
            const savedWebhook: Webhook = {
                id: webhook?.id || generateId('wh'),
                name: formData.name,
                url: formData.url,
                events: formData.events,
                secret: webhook?.secret || formData.secret,
                isActive: formData.isActive,
                createdAt: webhook?.createdAt || new Date().toISOString(),
                lastTriggeredAt: webhook?.lastTriggeredAt,
            };
            onSave(savedWebhook);
        },
        validationSchema: webhookValidationSchema,
        onSuccess: () => console.log("Webhook saved successfully."),
        onError: (err) => console.error("Error saving webhook:", err),
    });

    useEffect(() => {
        if (!webhook) {
            resetForm();
            setValues(prev => ({ ...prev, secret: generateSecureRandomString(32) }));
        } else {
            setValues(initialValues);
        }
    }, [webhook, initialValues, resetForm, setValues]);


    const allWebhookEvents: Webhook['events'][number][] = [
        'key.created',
        'key.revoked',
        'key.expired',
        'usage.threshold_exceeded',
        'policy.violation',
    ];

    const handleEventChange = (event: Webhook['events'][number], isChecked: boolean) => {
        setValues(prev => {
            const currentEvents = new Set(prev.events);
            if (isChecked) {
                currentEvents.add(event);
            } else {
                currentEvents.delete(event);
            }
            return { ...prev, events: Array.from(currentEvents) };
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="webhookName" className="block text-sm font-medium text-gray-300">Webhook Name</label>
                <input type="text" id="webhookName" name="name" value={values.name} onChange={handleChange}
                    className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500" />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
            </div>
            <div>
                <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-300">Target URL</label>
                <input type="url" id="webhookUrl" name="url" value={values.url} onChange={handleChange}
                    className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="https://your-app.com/webhook-endpoint" />
                {errors.url && <p className="mt-1 text-xs text-red-400">{errors.url}</p>}
            </div>
            <div>
                <p className="block text-sm font-medium text-gray-300">Events to Trigger On</p>
                <div className="mt-1 grid grid-cols-2 gap-2 p-2 bg-gray-700 rounded-md border border-gray-600">
                    {allWebhookEvents.map(event => (
                        <label key={event} className="inline-flex items-center text-white text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                checked={values.events.includes(event)}
                                onChange={(e) => handleEventChange(event, e.target.checked)}
                                className="form-checkbox h-4 w-4 text-cyan-600 transition duration-150 ease-in-out bg-gray-800 border-gray-600 rounded"
                            />
                            <span className="ml-2">{event}</span>
                        </label>
                    ))}
                </div>
                {errors.events && <p className="mt-1 text-xs text-red-400">{errors.events}</p>}
            </div>
            <div>
                <label htmlFor="webhookSecret" className="block text-sm font-medium text-gray-300">Webhook Secret</label>
                <div className="flex items-center gap-2 mt-1">
                    <input type="text" id="webhookSecret" name="secret" value={values.secret} readOnly
                        className="flex-grow bg-gray-900 border-gray-700 rounded-md shadow-sm text-cyan-300 font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500" />
                    <Tooltip content="Copy to clipboard">
                        <button type="button" onClick={() => navigator.clipboard.writeText(values.secret)} className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs text-white transition duration-200">Copy</button>
                    </Tooltip>
                    {!webhook && ( // Only show regenerate for new webhook or an explicit regenerate button for existing
                        <Tooltip content="Regenerate new secret">
                            <button type="button" onClick={() => setValues(prev => ({ ...prev, secret: generateSecureRandomString(32) }))} className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs text-white transition duration-200">Regenerate</button>
                        </Tooltip>
                    )}
                </div>
                <p className="mt-1 text-xs text-gray-400">Use this secret to verify webhook payloads. It will be signed using HMAC-SHA256.</p>
            </div>
            <div className="flex items-center">
                <input type="checkbox" id="webhookIsActive" name="isActive" checked={values.isActive} onChange={handleChange}
                    className="form-checkbox h-4 w-4 text-cyan-600 transition duration-150 ease-in-out bg-gray-800 border-gray-600 rounded" />
                <label htmlFor="webhookIsActive" className="ml-2 block text-sm text-gray-300">Active</label>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                {webhook && onDelete && (
                    <button type="button" onClick={() => onDelete(webhook.id)} className="px-4 py-2 text-sm font-medium text-red-400 rounded-md border border-red-600 hover:bg-red-700 transition duration-200">Delete Webhook</button>
                )}
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-300 rounded-md border border-gray-600 hover:bg-gray-700 transition duration-200">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md text-sm font-medium text-white disabled:opacity-50 transition duration-200">
                    {isSubmitting ? 'Saving...' : 'Save Webhook'}
                </button>
            </div>
            {submitSuccess === true && <p className="mt-2 text-sm text-green-400">Webhook saved successfully!</p>}
            {submitSuccess === false && <p className="mt-2 text-sm text-red-400">Failed to save webhook. Please check your inputs.</p>}
        </form>
    );
};

/**
 * Component for listing and managing Webhook Endpoints.
 */
interface WebhookListProps {
    webhooks: Webhook[];
    onEdit: (webhook: Webhook) => void;
    onDelete: (id: string) => void;
    onCreateNew: () => void;
}

export const WebhookList: React.FC<WebhookListProps> = ({ webhooks, onEdit, onDelete, onCreateNew }) => {
    return (
        <Card title="Webhook Endpoints">
            <div className="flex justify-end mb-4">
                <button onClick={onCreateNew} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md text-sm font-medium text-white transition duration-200">
                    Create New Webhook
                </button>
            </div>
            <div className="overflow-x-auto border border-gray-700 rounded-lg">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">URL</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Events</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Triggered</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {webhooks.length > 0 ? (
                            webhooks.map((webhook) => (
                                <tr key={webhook.id} className="hover:bg-gray-700 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{webhook.name}</td>
                                    <td className="px-6 py-4 text-sm text-cyan-400 truncate max-w-xs"><a href={webhook.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{webhook.url}</a></td>
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        <div className="flex flex-wrap gap-1">
                                            {webhook.events.map(event => (
                                                <span key={event} className="px-2 py-0.5 rounded-full text-xs bg-gray-600 text-gray-200">{event.split('.')[0] === 'usage' ? 'Usage' : event.split('.')[1]}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${webhook.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {webhook.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatTimestamp(webhook.createdAt)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{webhook.lastTriggeredAt ? formatTimestamp(webhook.lastTriggeredAt) : 'Never'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => onEdit(webhook)} className="text-cyan-400 hover:text-cyan-300 mr-4 transition duration-200">Edit</button>
                                        <button onClick={() => onDelete(webhook.id)} className="text-red-400 hover:text-red-300 transition duration-200">Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">No webhooks configured.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

/**
 * Component for displaying Audit logs, with optional filtering by API key.
 */
interface ApiKeyAuditLogProps {
    keyId?: string; // Optional: if provided, filter logs for this key
    isModal?: boolean; // If true, adjusts title/display for modal context
}

export const ApiKeyAuditLog: React.FC<ApiKeyAuditLogProps> = ({ keyId, isModal = false }) => {
    const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [filterActor, setFilterActor] = useState('');
    const [filterAction, setFilterAction] = useState('');

    useEffect(() => {
        setLoading(true);
        const fetchLogs = async () => {
            await new Promise(res => setTimeout(res, 500)); // Simulate API call delay
            let allLogs = INITIAL_MOCK_AUDIT_EVENTS;

            let filteredLogs = allLogs.filter(log => {
                let matches = true;
                if (keyId) {
                    matches = matches && log.targetId === keyId && log.targetType === 'API_KEY';
                }
                if (filterActor) {
                    matches = matches && log.actor.toLowerCase().includes(filterActor.toLowerCase());
                }
                if (filterAction) {
                    matches = matches && log.action.toLowerCase().includes(filterAction.toLowerCase());
                }
                return matches;
            });

            // Sort by timestamp descending
            filteredLogs = filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            const start = (page - 1) * pageSize;
            const end = start + pageSize;
            setAuditLogs(filteredLogs.slice(start, end));
            setTotalPages(Math.ceil(filteredLogs.length / pageSize));
            setLoading(false);
        };
        fetchLogs();
    }, [keyId, page, pageSize, filterActor, filterAction]);

    const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
        setter(value);
        setPage(1); // Reset to first page on filter change
    };

    return (
        <Card title={isModal ? `Audit Log for this Key` : "Global Audit Log"}>
            <div className="flex gap-4 mb-4 flex-wrap">
                <input
                    type="text"
                    placeholder="Filter by actor..."
                    value={filterActor}
                    onChange={(e) => handleFilterChange(setFilterActor, e.target.value)}
                    className="flex-1 min-w-[150px] px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
                />
                <input
                    type="text"
                    placeholder="Filter by action..."
                    value={filterAction}
                    onChange={(e) => handleFilterChange(setFilterAction, e.target.value)}
                    className="flex-1 min-w-[150px] px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
                />
            </div>
            <div className="max-h-96 overflow-y-auto border border-gray-700 rounded-lg">
                {loading ? (
                    <p className="text-gray-500 text-center py-8">Loading audit logs...</p>
                ) : (
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Target</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {auditLogs.length > 0 ? (
                                auditLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-700 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatTimestamp(log.timestamp)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{log.actor}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan-400">{log.action}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{log.targetType} ({log.targetId.substring(0, 8)}...)</td>
                                        <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">
                                            <Tooltip content={<pre className="text-xs">{JSON.stringify(log.details, null, 2)}</pre>} position="bottom">
                                                {JSON.stringify(log.details)}
                                            </Tooltip>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-4 text-gray-500">No audit events found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1 || loading}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white disabled:opacity-50 transition duration-200"
                >
                    Previous
                </button>
                <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
                <button
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages || loading}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white disabled:opacity-50 transition duration-200"
                >
                    Next
                </button>
            </div>
        </Card>
    );
};

/**
 * Component for displaying the health status of various services.
 */
export const ServiceHealthMonitor: React.FC = () => {
    const [healthMetrics, setHealthMetrics] = useState<ServiceHealthMetric[]>(INITIAL_SERVICE_HEALTH);
    const [loading, setLoading] = useState(false);

    const fetchHealth = async () => {
        setLoading(true);
        await new Promise(res => setTimeout(res, 1500)); // Simulate API call
        setHealthMetrics(generateMockServiceHealth()); // Regenerate mock data
        setLoading(false);
    };

    useEffect(() => {
        fetchHealth(); // Initial fetch
        const interval = setInterval(fetchHealth, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: ServiceHealthMetric['status']) => {
        switch (status) {
            case 'operational': return 'text-green-500';
            case 'degraded': return 'text-yellow-500';
            case 'major_outage': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const getStatusIcon = (status: ServiceHealthMetric['status']) => {
        switch (status) {
            case 'operational': return '✓';
            case 'degraded': return '!';
            case 'major_outage': return '✕';
            default: return '?';
        }
    };

    return (
        <Card title="Service Health Monitor">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {healthMetrics.map(metric => (
                    <div key={metric.serviceName} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center">
                            <span className={`text-xl font-bold mr-3 ${getStatusColor(metric.status)}`}>{getStatusIcon(metric.status)}</span>
                            <div>
                                <p className="font-semibold text-white">{metric.serviceName}</p>
                                <p className={`text-xs ${getStatusColor(metric.status)}`}>{metric.status.replace('_', ' ').toUpperCase()}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400">Last Checked: {formatTimestamp(metric.lastChecked)}</p>
                            {metric.latency && <p className="text-xs text-gray-400">Latency: {metric.latency}ms</p>}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 text-center text-gray-500 text-xs">
                {loading ? 'Updating...' : `Last updated: ${new Date().toLocaleTimeString()}`}
            </div>
        </Card>
    );
};


/**
 * Expanded AI Security Suite with more features and descriptions.
 */
export const AiSecuritySuiteExpanded: React.FC<{ handleAiFeature: (type: string) => void }> = ({ handleAiFeature }) => {
    return (
        <Card title="AI Security Suite - Advanced Tools">
            <p className="text-gray-400 mb-4 text-sm">Leverage AI to enhance the security and management of your API keys. Select a tool below:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button onClick={() => handleAiFeature('audit')} className="p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-left transition duration-200">
                    <h4 className="font-semibold text-white">Usage Log Auditor <span className="text-cyan-400 text-xs">(Enhanced)</span></h4>
                    <p className="text-xs text-gray-400 mt-1">Scan extensive usage logs for suspicious access patterns, sudden spikes, or unusual geographic activity.</p>
                </button>
                <button onClick={() => handleAiFeature('scope')} className="p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-left transition duration-200">
                    <h4 className="font-semibold text-white">Permission Scoper <span className="text-cyan-400 text-xs">(Dynamic)</span></h4>
                    <p className="text-xs text-gray-400 mt-1">Generate least-privilege API key permissions based on a detailed natural language description of its intended use or actual observed usage.</p>
                </button>
                <button onClick={() => handleAiFeature('codegen')} className="p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-left transition duration-200">
                    <h4 className="font-semibold text-white">Secure Code Generator <span className="text-cyan-400 text-xs">(Multi-Language)</span></h4>
                    <p className="text-xs text-gray-400 mt-1">Generate secure code snippets in Python, Node.js, Go, or Java for interacting with your API using best practices for key management.</p>
                </button>
                <button onClick={() => handleAiFeature('leak')} className="p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-left transition duration-200">
                    <h4 className="font-semibold text-white">Public Leak Detector <span className="text-cyan-400 text-xs">(Proactive)</span></h4>
                    <p className="text-xs text-gray-400 mt-1">Simulate real-time monitoring of public code repositories and pastebins for exposed API keys or key patterns. Receive alerts on potential breaches.</p>
                </button>
                <button onClick={() => handleAiFeature('policySuggest')} className="p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-left transition duration-200">
                    <h4 className="font-semibold text-white">Policy Suggester <span className="text-cyan-400 text-xs">(Automated)</span></h4>
                    <p className="text-xs text-gray-400 mt-1">Analyze usage patterns and compliance requirements to suggest new API key policies or improvements to existing ones.</p>
                </button>
                <button onClick={() => handleAiFeature('vulnerabilityScan')} className="p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-left transition duration-200">
                    <h4 className="font-semibold text-white">Configuration Vulnerability Scan <span className="text-cyan-400 text-xs">(Deep Dive)</span></h4>
                    <p className="text-xs text-gray-400 mt-1">Identify misconfigurations or security weaknesses in your API key setup (e.g., overly broad permissions, missing expiry dates, weak policies).</p>
                </button>
                <button onClick={() => handleAiFeature('threatIntel')} className="p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-left transition duration-200">
                    <h4 className="font-semibold text-white">Threat Intelligence Feed <span className="text-cyan-400 text-xs">(Real-time)</span></h4>
                    <p className="text-xs text-gray-400 mt-1">Integrate with external threat intelligence to assess the risk of certain IP addresses or user agents associated with key usage.</p>
                </button>
                <button onClick={() => handleAiFeature('remediationSuggest')} className="p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-left transition duration-200">
                    <h4 className="font-semibold text-white">Remediation Assistant <span className="text-cyan-400 text-xs">(Actionable)</span></h4>
                    <p className="text-xs text-gray-400 mt-1">Provide step-by-step guidance and automated actions to address identified security issues and improve key hygiene.</p>
                </button>
            </div>
        </Card>
    );
};

// --- Main ApiKeysView component (expanded) ---

export const ApiKeysView: React.FC = () => {
    const [keys, setKeys] = useState<ApiKey[]>(INITIAL_MOCK_API_KEYS);
    const [allUsageLogs] = useState<ApiKeyUsageLog[]>(ALL_MOCK_USAGE_LOGS);
    const [policies, setPolicies] = useState<ApiKeyPolicy[]>(INITIAL_MOCK_POLICIES);
    const [environments] = useState<ApiKeyEnvironment[]>(INITIAL_MOCK_ENVIRONMENTS);
    const [webhooks, setWebhooks] = useState<Webhook[]>(INITIAL_MOCK_WEBHOOKS);
    const [auditEvents] = useState<AuditEvent[]>(INITIAL_MOCK_AUDIT_EVENTS);

    const [newKey, setNewKey] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    const [isAiModalOpen, setAiModalOpen] = useState(false);
    const [aiResult, setAiResult] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [selectedAiFeature, setSelectedAiFeature] = useState<string>('');

    const [isCreateKeyModalOpen, setCreateKeyModalOpen] = useState(false);
    const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);
    const [isPolicyModalOpen, setPolicyModalOpen] = useState(false);
    const [policyToEdit, setPolicyToEdit] = useState<ApiKeyPolicy | undefined>(undefined);
    const [isWebhookFormOpen, setWebhookFormOpen] = useState(false);
    const [webhookToEdit, setWebhookToEdit] = useState<Webhook | undefined>(undefined);

    const handleCreateKeySubmit = (newlyCreatedKey: ApiKey) => {
        setKeys(prev => [...prev, newlyCreatedKey]);
        setNewKey(newlyCreatedKey.key);
        setCreateKeyModalOpen(false);
        // Add audit event for key creation
        const audit = generateMockAuditEvent();
        audit.action = 'API_KEY_CREATED';
        audit.targetId = newlyCreatedKey.id;
        audit.targetType = 'API_KEY';
        audit.details = { name: newlyCreatedKey.name, environmentId: newlyCreatedKey.environmentId, createdBy: newlyCreatedKey.createdBy };
        auditEvents.push(audit); // Directly push to mock for simplicity
    };

    const handleGenerateClick = async () => {
        setIsGenerating(true);
        setCopySuccess('');
        await new Promise(res => setTimeout(res, 1000));
        const generated = `db_sk_live_${generateSecureRandomString(24)}`;
        const newQuickKey: ApiKey = {
            id: generateId('key'),
            name: 'Quick Generated Key',
            key: generated,
            createdAt: new Date().toISOString(),
            status: 'active',
            createdBy: 'dashboard_user (quick generate)',
            environmentId: 'env_dev',
            scopes: ['read:transactions', 'read:users'],
        };
        setNewKey(generated);
        setKeys(prev => [...prev, newQuickKey]);
        setIsGenerating(false);
         const audit = generateMockAuditEvent();
        audit.action = 'API_KEY_CREATED_QUICK';
        audit.targetId = newQuickKey.id;
        audit.targetType = 'API_KEY';
        audit.details = { name: newQuickKey.name, createdBy: newQuickKey.createdBy };
        auditEvents.push(audit);
    };

    const handleCopy = (key: string) => {
        navigator.clipboard.writeText(key).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    const handleRevokeKey = (keyId: string) => {
        setKeys(prev => prev.map(key => key.id === keyId ? { ...key, status: 'revoked', lastUsedAt: undefined } : key));
        setSelectedApiKey(null);
        const audit = generateMockAuditEvent();
        audit.action = 'API_KEY_REVOKED';
        audit.targetId = keyId;
        audit.targetType = 'API_KEY';
        audit.details = { revokedBy: 'dashboard_user' };
        auditEvents.push(audit);
    };

    const handleUpdateKey = (updatedKey: ApiKey) => {
        setKeys(prev => prev.map(key => key.id === updatedKey.id ? updatedKey : key));
        // Add audit event for key update
        const audit = generateMockAuditEvent();
        audit.action = 'API_KEY_UPDATED';
        audit.targetId = updated