import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import Card from '../../../Card';
import { GoogleGenAI, Type } from "@google/genai";

// --- Global Interfaces/Types ---

export interface SandboxEnvironment {
    id: string;
    name: string;
    description: string;
    status: 'Active' | 'Stopped' | 'Archived' | 'Provisioning';
    apiKeyCount: number;
    webhookCount: number;
    createdAt: string;
    lastActivity: string;
    ownerId: string;
    region: string;
    config: {
        rateLimit: number; // requests per minute
        dataRetentionDays: number;
        loggingEnabled: boolean;
        publicAccess: boolean;
    };
}

export interface APIKey {
    id: string;
    environmentId: string;
    name: string;
    key: string; // Stored obfuscated or partially revealed
    status: 'Active' | 'Revoked' | 'Expired';
    permissions: string[]; // e.g., ['read:data', 'write:data', 'manage:webhooks']
    createdAt: string;
    expiresAt?: string;
    lastUsed: string;
    rateLimitOverride?: number; // requests per minute
}

export interface WebhookConfig {
    id: string;
    environmentId: string;
    name: string;
    url: string;
    secret: string;
    events: string[]; // e.g., ['data.created', 'environment.status_change']
    status: 'Active' | 'Paused' | 'Failed';
    createdAt: string;
    lastTriggered: string;
    retriesEnabled: boolean;
    maxRetries: number;
}

export interface LogEntry {
    id: string;
    environmentId: string;
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
    source: 'API' | 'Webhook' | 'System' | 'Auth';
    message: string;
    details?: Record<string, any>;
    requestId?: string;
    statusCode?: number;
    latencyMs?: number;
}

export interface MetricData {
    timestamp: string;
    value: number;
}

export interface AlertRule {
    id: string;
    environmentId: string;
    name: string;
    metric: 'api_errors' | 'api_latency' | 'webhook_failures' | 'rate_limit_exceeded';
    threshold: number; // e.g., error rate > 5%, latency > 500ms
    operator: 'gt' | 'lt' | 'eq'; // greater than, less than, equals
    durationMinutes: number; // threshold must be met for this duration
    status: 'Active' | 'Paused';
    channels: ('email' | 'slack' | 'webhook')[];
    recipients: string[]; // e.g., email addresses, slack channel IDs, webhook URLs
    createdAt: string;
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Developer' | 'Viewer';
    lastLogin: string;
}

export interface APIEndpoint {
    id: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    description: string;
    requestSchema?: Record<string, any>;
    responseSchema?: Record<string, any>;
    tags: string[];
    isAuthenticated: boolean;
}

export interface CodeSnippetConfig {
    language: 'javascript' | 'python' | 'go' | 'curl';
    framework?: string; // e.g., 'axios', 'requests'
    action: 'get' | 'post' | 'put' | 'delete';
    endpointPath: string;
    body?: Record<string, any>;
    queryParams?: Record<string, string>;
    headers?: Record<string, string>;
}

// --- Mock Data Generators ---

const generateUUID = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
const getRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min: number, max: number) => parseFloat((Math.random() * (max - min) + min).toFixed(2));

export const MOCK_ENVIRONMENTS: SandboxEnvironment[] = [
    { id: 'env-1', name: 'Staging-WebApp-Test', description: 'Environment for testing web application features before production deployment.', status: 'Active', apiKeyCount: 5, webhookCount: 3, createdAt: '2024-07-20', lastActivity: '2024-08-01T14:30:00Z', ownerId: 'user-alpha', region: 'us-east-1', config: { rateLimit: 500, dataRetentionDays: 90, loggingEnabled: true, publicAccess: false } },
    { id: 'env-2', name: 'Mobile-iOS-Integration', description: 'Dedicated environment for mobile iOS app backend integrations and QA.', status: 'Active', apiKeyCount: 3, webhookCount: 2, createdAt: '2024-07-18', lastActivity: '2024-08-01T10:15:00Z', ownerId: 'user-beta', region: 'eu-west-1', config: { rateLimit: 1000, dataRetentionDays: 180, loggingEnabled: true, publicAccess: false } },
    { id: 'env-3', name: 'Archived-Q2-Tests', description: 'Historical environment for Q2 project testing, now stopped.', status: 'Stopped', apiKeyCount: 1, webhookCount: 0, createdAt: '2024-06-30', lastActivity: '2024-07-05T09:00:00Z', ownerId: 'user-gamma', region: 'ap-southeast-2', config: { rateLimit: 100, dataRetentionDays: 30, loggingEnabled: false, publicAccess: true } },
    { id: 'env-4', name: 'Dev-Frontend-Playground', description: 'Frontend development sandbox for rapid prototyping.', status: 'Active', apiKeyCount: 2, webhookCount: 1, createdAt: '2024-07-25', lastActivity: '2024-08-01T16:00:00Z', ownerId: 'user-alpha', region: 'us-west-2', config: { rateLimit: 750, dataRetentionDays: 90, loggingEnabled: true, publicAccess: true } },
    { id: 'env-5', name: 'Internal-Tooling-API', description: 'Sandbox for developing internal API services.', status: 'Provisioning', apiKeyCount: 0, webhookCount: 0, createdAt: '2024-07-29', lastActivity: '2024-07-29T11:00:00Z', ownerId: 'user-delta', region: 'us-east-1', config: { rateLimit: 200, dataRetentionDays: 60, loggingEnabled: true, publicAccess: false } },
    { id: 'env-6', name: 'POC-Experiment', description: 'Proof-of-concept environment for a new feature idea.', status: 'Active', apiKeyCount: 1, webhookCount: 0, createdAt: '2024-07-10', lastActivity: '2024-07-28T18:00:00Z', ownerId: 'user-epsilon', region: 'eu-central-1', config: { rateLimit: 300, dataRetentionDays: 30, loggingEnabled: true, publicAccess: true } },
    { id: 'env-7', name: 'Analytics-Reporting', description: 'Environment for integrating with third-party analytics platforms.', status: 'Stopped', apiKeyCount: 0, webhookCount: 0, createdAt: '2024-06-01', lastActivity: '2024-06-15T12:00:00Z', ownerId: 'user-zeta', region: 'us-east-1', config: { rateLimit: 100, dataRetentionDays: 180, loggingEnabled: false, publicAccess: false } },
];

export const MOCK_API_KEYS: APIKey[] = MOCK_ENVIRONMENTS.flatMap(env =>
    Array.from({ length: env.apiKeyCount }).map((_, i) => ({
        id: generateUUID(),
        environmentId: env.id,
        name: `${env.name.split('-')[0]} Key ${i + 1}`,
        key: `sk_test_${generateUUID().slice(0, 8)}...${generateUUID().slice(0, 4)}`,
        status: getRandomItem(['Active', 'Active', 'Active', 'Revoked', 'Expired']),
        permissions: getRandomItem([
            ['read:data'],
            ['read:data', 'write:data'],
            ['read:data', 'write:data', 'manage:webhooks'],
            ['admin']
        ]),
        createdAt: getRandomDate(new Date(2024, 0, 1), new Date()),
        expiresAt: Math.random() > 0.7 ? getRandomDate(new Date(), new Date(2025, 0, 1)) : undefined,
        lastUsed: getRandomDate(new Date(2024, 6, 15), new Date()),
        rateLimitOverride: Math.random() > 0.8 ? getRandomInt(50, 200) : undefined,
    }))
);

export const MOCK_WEBHOOKS: WebhookConfig[] = MOCK_ENVIRONMENTS.flatMap(env =>
    Array.from({ length: env.webhookCount }).map((_, i) => ({
        id: generateUUID(),
        environmentId: env.id,
        name: `${env.name.split('-')[0]} Webhook ${i + 1}`,
        url: `https://example.com/webhook/listener/${generateUUID().slice(0, 6)}`,
        secret: generateUUID(),
        events: getRandomItem([
            ['data.created'],
            ['data.updated', 'user.deleted'],
            ['environment.status_change', 'api_key.revoked']
        ]),
        status: getRandomItem(['Active', 'Active', 'Active', 'Paused', 'Failed']),
        createdAt: getRandomDate(new Date(2024, 0, 1), new Date()),
        lastTriggered: Math.random() > 0.2 ? getRandomDate(new Date(2024, 6, 1), new Date()) : 'Never',
        retriesEnabled: Math.random() > 0.3,
        maxRetries: getRandomInt(3, 10),
    }))
);

export const generateMockLogs = (envId: string, count: number): LogEntry[] => {
    const logs: LogEntry[] = [];
    const sources = ['API', 'Webhook', 'System', 'Auth'];
    const levels = ['INFO', 'INFO', 'INFO', 'WARN', 'ERROR', 'DEBUG'];
    const messages = {
        API: ['Request received', 'Data processed', 'Resource not found', 'Authentication failed', 'Rate limit hit'],
        Webhook: ['Delivery successful', 'Delivery failed', 'Retrying delivery', 'Webhook configured'],
        System: ['Environment started', 'Environment stopped', 'Configuration updated', 'Provisioning complete'],
        Auth: ['Login attempt', 'API key validated', 'Permission denied']
    };

    for (let i = 0; i < count; i++) {
        const source = getRandomItem(sources);
        const level = getRandomItem(levels);
        const timestamp = new Date(Date.now() - getRandomInt(0, 30) * 24 * 60 * 60 * 1000 - getRandomInt(0, 23) * 60 * 60 * 1000 - getRandomInt(0, 59) * 60 * 1000).toISOString();
        const requestId = source === 'API' ? generateUUID().slice(0, 10) : undefined;
        const statusCode = source === 'API' && level !== 'DEBUG' ? getRandomItem([200, 201, 204, 400, 401, 403, 404, 429, 500]) : undefined;
        const latencyMs = source === 'API' && statusCode && statusCode < 500 ? getRandomInt(10, 1500) : undefined;

        logs.push({
            id: generateUUID(),
            environmentId: envId,
            timestamp,
            level,
            source,
            message: getRandomItem(messages[source]),
            requestId,
            statusCode,
            latencyMs,
            details: level === 'ERROR' ? { errorType: 'Timeout', stackTrace: '...' } : undefined,
        });
    }
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Newest first
    return logs;
};

export const MOCK_API_ENDPOINTS: APIEndpoint[] = [
    { id: 'ep-1', method: 'GET', path: '/users/{id}', description: 'Retrieve user details', tags: ['User', 'Read'], isAuthenticated: true, responseSchema: { id: 'string', name: 'string', email: 'string' } },
    { id: 'ep-2', method: 'POST', path: '/users', description: 'Create a new user', tags: ['User', 'Write'], isAuthenticated: true, requestSchema: { name: 'string', email: 'string' }, responseSchema: { id: 'string', name: 'string' } },
    { id: 'ep-3', method: 'GET', path: '/products', description: 'List all products', tags: ['Product', 'Read'], isAuthenticated: false, responseSchema: { items: [{ id: 'string', name: 'string', price: 'number' }] } },
    { id: 'ep-4', method: 'DELETE', path: '/products/{id}', description: 'Delete a product', tags: ['Product', 'Write'], isAuthenticated: true },
    { id: 'ep-5', method: 'POST', path: '/orders', description: 'Place a new order', tags: ['Order', 'Write'], isAuthenticated: true, requestSchema: { userId: 'string', productId: 'string', quantity: 'number' } },
    { id: 'ep-6', method: 'GET', path: '/status', description: 'Check API health', tags: ['System'], isAuthenticated: false, responseSchema: { status: 'string', uptime: 'string' } },
];

export const MOCK_USERS: UserProfile[] = [
    { id: 'user-alpha', name: 'Alice Smith', email: 'alice@example.com', role: 'Admin', lastLogin: '2024-08-01T15:00:00Z' },
    { id: 'user-beta', name: 'Bob Johnson', email: 'bob@example.com', role: 'Developer', lastLogin: '2024-07-31T10:00:00Z' },
    { id: 'user-gamma', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Viewer', lastLogin: '2024-07-28T09:00:00Z' },
    { id: 'user-delta', name: 'Diana Prince', email: 'diana@example.com', role: 'Developer', lastLogin: '2024-08-01T11:00:00Z' },
    { id: 'user-epsilon', name: 'Eve Adams', email: 'eve@example.com', role: 'Admin', lastLogin: '2024-07-29T16:00:00Z' },
    { id: 'user-zeta', name: 'Frank White', email: 'frank@example.com', role: 'Viewer', lastLogin: '2024-07-20T14:00:00Z' },
];

export const generateMockMetrics = (metricType: 'api_calls' | 'api_errors' | 'api_latency' | 'webhook_failures', days: number = 7): MetricData[] => {
    const data: MetricData[] = [];
    let baseValue = metricType === 'api_calls' ? 5000 : (metricType === 'api_latency' ? 100 : 0);
    const fluctuation = metricType === 'api_calls' ? 1000 : (metricType === 'api_latency' ? 50 : (metricType === 'api_errors' || metricType === 'webhook_failures' ? 2 : 0.5));
    const isErrorOrLatency = metricType === 'api_errors' || metricType === 'api_latency' || metricType === 'webhook_failures';

    for (let i = days * 24; i >= 0; i--) {
        const timestamp = new Date(Date.now() - i * 60 * 60 * 1000).toISOString(); // Hourly data
        let value = baseValue + (Math.random() - 0.5) * fluctuation * 2;
        if (isErrorOrLatency) {
            value = Math.max(0, value); // No negative errors/latency
            if (metricType === 'api_errors') value = Math.min(value, 10); // Max 10% error rate
            if (metricType === 'webhook_failures') value = Math.min(value, 5); // Max 5% webhook failures
        }
        data.push({ timestamp, value: parseFloat(value.toFixed(2)) });
        baseValue = value; // Trend slightly
    }
    return data;
};

// --- Reusable UI Components & Helpers ---

export const getStatusColor = (status: string) => {
    switch (status) {
        case 'Active': return 'bg-green-500/20 text-green-300';
        case 'Stopped': return 'bg-gray-500/20 text-gray-300';
        case 'Archived': return 'bg-purple-500/20 text-purple-300';
        case 'Provisioning': return 'bg-yellow-500/20 text-yellow-300';
        case 'Failed': return 'bg-red-500/20 text-red-300';
        case 'Paused': return 'bg-orange-500/20 text-orange-300';
        case 'Revoked': return 'bg-red-500/20 text-red-300';
        case 'Expired': return 'bg-red-500/20 text-red-300';
        default: return 'bg-gray-500/20 text-gray-300';
    }
};

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
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        '2xl': 'max-w-6xl',
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className={`bg-gray-800 rounded-lg shadow-2xl ${sizeClasses[size]} w-full border border-gray-700`} onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

interface TooltipProps {
    children: React.ReactNode;
    text: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ children, text }) => {
    return (
        <div className="relative flex items-center group">
            {children}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 rounded bg-gray-700 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                {text}
            </div>
        </div>
    );
};

interface TabProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

export const Tab: React.FC<TabProps> = ({ label, isActive, onClick }) => (
    <button
        className={`px-4 py-2 text-sm font-medium rounded-t-lg ${isActive ? 'text-white border-b-2 border-cyan-500' : 'text-gray-400 hover:text-gray-200'}`}
        onClick={onClick}
    >
        {label}
    </button>
);

// --- Context for Environment Selection ---
interface SandboxContextType {
    selectedEnvironmentId: string | null;
    setSelectedEnvironmentId: (id: string | null) => void;
    environments: SandboxEnvironment[];
    addEnvironment: (env: SandboxEnvironment) => void;
    updateEnvironment: (env: SandboxEnvironment) => void;
    deleteEnvironment: (id: string) => void;
    apiKeys: APIKey[];
    addApiKey: (key: APIKey) => void;
    updateApiKey: (key: APIKey) => void;
    deleteApiKey: (id: string) => void;
    webhooks: WebhookConfig[];
    addWebhook: (webhook: WebhookConfig) => void;
    updateWebhook: (webhook: WebhookConfig) => void;
    deleteWebhook: (id: string) => void;
    logs: LogEntry[];
    addLog: (log: LogEntry) => void;
    refreshLogs: (envId: string) => void;
}

export const SandboxContext = createContext<SandboxContextType | undefined>(undefined);

export const useSandbox = () => {
    const context = useContext(SandboxContext);
    if (!context) {
        throw new Error('useSandbox must be used within a SandboxProvider');
    }
    return context;
};

// --- Main Sandbox Provider for State Management ---
export const SandboxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [environments, setEnvironments] = useState<SandboxEnvironment[]>(MOCK_ENVIRONMENTS);
    const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | null>(null);
    const [apiKeys, setApiKeys] = useState<APIKey[]>(MOCK_API_KEYS);
    const [webhooks, setWebhooks] = useState<WebhookConfig[]>(MOCK_WEBHOOKS);
    const [logs, setLogs] = useState<LogEntry[]>(() => {
        const allLogs: LogEntry[] = [];
        MOCK_ENVIRONMENTS.forEach(env => {
            allLogs.push(...generateMockLogs(env.id, getRandomInt(50, 150)));
        });
        return allLogs;
    });

    const addEnvironment = (env: SandboxEnvironment) => setEnvironments(prev => [...prev, env]);
    const updateEnvironment = (updatedEnv: SandboxEnvironment) => setEnvironments(prev => prev.map(env => env.id === updatedEnv.id ? updatedEnv : env));
    const deleteEnvironment = (id: string) => {
        setEnvironments(prev => prev.filter(env => env.id !== id));
        setApiKeys(prev => prev.filter(key => key.environmentId !== id));
        setWebhooks(prev => prev.filter(webhook => webhook.environmentId !== id));
        setLogs(prev => prev.filter(log => log.environmentId !== id));
        if (selectedEnvironmentId === id) setSelectedEnvironmentId(null);
    };

    const addApiKey = (key: APIKey) => setApiKeys(prev => [...prev, key]);
    const updateApiKey = (updatedKey: APIKey) => setApiKeys(prev => prev.map(key => key.id === updatedKey.id ? updatedKey : key));
    const deleteApiKey = (id: string) => setApiKeys(prev => prev.filter(key => key.id !== id));

    const addWebhook = (webhook: WebhookConfig) => setWebhooks(prev => [...prev, webhook]);
    const updateWebhook = (updatedWebhook: WebhookConfig) => setWebhooks(prev => prev.map(webhook => webhook.id === updatedWebhook.id ? updatedWebhook : webhook));
    const deleteWebhook = (id: string) => setWebhooks(prev => prev.filter(webhook => webhook.id !== id));

    const addLog = (log: LogEntry) => setLogs(prev => [log, ...prev]);
    const refreshLogs = (envId: string) => {
        // Simulate fetching new logs
        const newLogs = generateMockLogs(envId, getRandomInt(5, 20));
        setLogs(prev => [...newLogs, ...prev.filter(log => log.environmentId !== envId)]);
    };

    const value = useMemo(() => ({
        selectedEnvironmentId,
        setSelectedEnvironmentId,
        environments,
        addEnvironment,
        updateEnvironment,
        deleteEnvironment,
        apiKeys,
        addApiKey,
        updateApiKey,
        deleteApiKey,
        webhooks,
        addWebhook,
        updateWebhook,
        deleteWebhook,
        logs,
        addLog,
        refreshLogs,
    }), [
        selectedEnvironmentId, environments, apiKeys, webhooks, logs,
        addEnvironment, updateEnvironment, deleteEnvironment,
        addApiKey, updateApiKey, deleteApiKey,
        addWebhook, updateWebhook, deleteWebhook,
        addLog, refreshLogs
    ]);

    return (
        <SandboxContext.Provider value={value}>
            {children}
        </SandboxContext.Provider>
    );
};


// --- Feature Components ---

// 1. AI Test Data Generator (Modal from original, enhanced)
export const AIDataGeneratorModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [prompt, setPrompt] = useState('a user with 5 recent transactions of varying amounts');
    const [generatedData, setGeneratedData] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [schemaPrompt, setSchemaPrompt] = useState('');
    const [useSchema, setUseSchema] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedData('');
        setError(null);
        try {
            // In a real app, API_KEY would be securely managed, not directly exposed or used client-side for production.
            // For a dev sandbox, this might be acceptable with appropriate ACLs.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            let fullPrompt = `Generate a realistic mock JSON object based on this request: "${prompt}". The JSON should be well-formed.`;
            if (useSchema && schemaPrompt.trim()) {
                fullPrompt += ` Adhere to the following JSON schema description: \n${schemaPrompt}`;
            }

            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt });
            const cleanedResponse = response.text.replace(/```json\n|```/g, '').trim();
            setGeneratedData(JSON.stringify(JSON.parse(cleanedResponse), null, 2));
        } catch (err) {
            console.error('AI generation error:', err);
            setError("Error: Could not generate valid JSON data. Please check your prompt and API key. (Details: " + (err as Error).message + ")");
            setGeneratedData('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="AI Test Data Generator" size="lg">
            <div className="space-y-4">
                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="data-prompt">
                    Data Description Prompt
                </label>
                <textarea
                    id="data-prompt"
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Describe the mock data you need, e.g., 'a customer object with a list of orders, each order having items and a total price'..."
                    className="w-full h-24 bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500 focus:ring-cyan-500"
                />

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="use-schema"
                        checked={useSchema}
                        onChange={e => setUseSchema(e.target.checked)}
                        className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                    />
                    <label htmlFor="use-schema" className="text-gray-300">
                        Use JSON Schema for structure guidance
                    </label>
                </div>

                {useSchema && (
                    <div className="space-y-2">
                        <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="schema-prompt">
                            JSON Schema Description (e.g., "An array of objects, each with a 'name' string and 'age' number")
                        </label>
                        <textarea
                            id="schema-prompt"
                            value={schemaPrompt}
                            onChange={e => setSchemaPrompt(e.target.value)}
                            placeholder="Describe your desired JSON schema (e.g., 'An array of objects, each with a "name" string and "age" number')"
                            className="w-full h-24 bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500 focus:ring-cyan-500"
                        />
                    </div>
                )}

                <button
                    onClick={handleGenerate}
                    disabled={isLoading || prompt.trim().length === 0 || (useSchema && schemaPrompt.trim().length === 0)}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 text-white font-medium transition-colors"
                >
                    {isLoading ? 'Generating...' : 'Generate JSON Data'}
                </button>

                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

                <Card title="Generated Data" className="mt-4">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-gray-900/50 p-4 rounded max-h-60 overflow-auto border border-gray-700">
                        {isLoading ? 'Generating...' : (generatedData || 'No data generated yet.')}
                    </pre>
                </Card>
            </div>
        </Modal>
    );
};

// 2. Sandbox Environments Table
export const EnvironmentsTable: React.FC<{ onSelectEnv: (id: string) => void; onCreateEnv: () => void; onEditEnv: (env: SandboxEnvironment) => void; onDeleteEnv: (id: string) => void }> = ({ onSelectEnv, onCreateEnv, onEditEnv, onDeleteEnv }) => {
    const { environments } = useSandbox();

    return (
        <Card title="Sandbox Environments" className="mb-6">
            <div className="flex justify-end mb-4">
                <button
                    onClick={onCreateEnv}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    + Create New Environment
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">API Keys</th>
                            <th scope="col" className="px-6 py-3">Webhooks</th>
                            <th scope="col" className="px-6 py-3">Created</th>
                            <th scope="col" className="px-6 py-3">Last Activity</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {environments.length === 0 && (
                            <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">No environments found. Create one to get started!</td></tr>
                        )}
                        {environments.map(env => (
                            <tr key={env.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">
                                    <button onClick={() => onSelectEnv(env.id)} className="text-cyan-400 hover:underline">
                                        {env.name}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(env.status)}`}>
                                        {env.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{env.apiKeyCount}</td>
                                <td className="px-6 py-4">{env.webhookCount}</td>
                                <td className="px-6 py-4">{new Date(env.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4">{new Date(env.lastActivity).toLocaleString()}</td>
                                <td className="px-6 py-4 flex gap-2">
                                    <button onClick={() => onEditEnv(env)} className="text-xs text-yellow-400 hover:underline">Edit</button>
                                    <button onClick={() => onDeleteEnv(env.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

// 3. Environment Detail View
export const EnvironmentDetail: React.FC<{ environment: SandboxEnvironment; onClose: () => void }> = ({ environment, onClose }) => {
    const { updateEnvironment, deleteEnvironment } = useSandbox();
    const [activeTab, setActiveTab] = useState('Overview');
    const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

    const handleDelete = () => {
        deleteEnvironment(environment.id);
        onClose();
    };

    const handleUpdateStatus = (newStatus: SandboxEnvironment['status']) => {
        updateEnvironment({ ...environment, status: newStatus, lastActivity: new Date().toISOString() });
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Environment: ${environment.name}`} size="2xl">
            <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                    <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(environment.status)} font-medium`}>
                            {environment.status}
                        </span>
                        <p className="text-gray-400 text-sm">Created: {new Date(environment.createdAt).toLocaleDateString()}</p>
                        <p className="text-gray-400 text-sm">Last Activity: {new Date(environment.lastActivity).toLocaleString()}</p>
                    </div>
                    <div className="flex space-x-2">
                        {environment.status === 'Active' && (
                            <button onClick={() => handleUpdateStatus('Stopped')} className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors">Stop</button>
                        )}
                        {environment.status === 'Stopped' && (
                            <button onClick={() => handleUpdateStatus('Active')} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">Start</button>
                        )}
                        <button onClick={() => setConfirmDeleteOpen(true)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors">Delete</button>
                    </div>
                </div>

                <div className="border-b border-gray-700">
                    <div className="flex -mb-px">
                        <Tab label="Overview" isActive={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')} />
                        <Tab label="API Keys" isActive={activeTab === 'API Keys'} onClick={() => setActiveTab('API Keys')} />
                        <Tab label="Webhooks" isActive={activeTab === 'Webhooks'} onClick={() => setActiveTab('Webhooks')} />
                        <Tab label="Logs" isActive={activeTab === 'Logs'} onClick={() => setActiveTab('Logs')} />
                        <Tab label="Metrics" isActive={activeTab === 'Metrics'} onClick={() => setActiveTab('Metrics')} />
                        <Tab label="Settings" isActive={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')} />
                    </div>
                </div>

                <div className="pt-4">
                    {activeTab === 'Overview' && (
                        <div className="space-y-4">
                            <h4 className="text-xl font-semibold text-white">Description</h4>
                            <p className="text-gray-300">{environment.description || 'No description provided.'}</p>
                            <div className="grid grid-cols-2 gap-4 text-gray-300">
                                <div><span className="font-semibold text-gray-200">Owner:</span> {MOCK_USERS.find(u => u.id === environment.ownerId)?.name || environment.ownerId}</div>
                                <div><span className="font-semibold text-gray-200">Region:</span> {environment.region}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-gray-300">
                                <div><span className="font-semibold text-gray-200">API Key Count:</span> {environment.apiKeyCount}</div>
                                <div><span className="font-semibold text-gray-200">Webhook Count:</span> {environment.webhookCount}</div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'API Keys' && <EnvironmentAPIKeys environmentId={environment.id} />}
                    {activeTab === 'Webhooks' && <EnvironmentWebhooks environmentId={environment.id} />}
                    {activeTab === 'Logs' && <EnvironmentLogs environmentId={environment.id} />}
                    {activeTab === 'Metrics' && <EnvironmentMetrics environment={environment} />}
                    {activeTab === 'Settings' && <EnvironmentSettings environment={environment} onUpdate={updateEnvironment} />}
                </div>
            </div>

            <Modal isOpen={isConfirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)} title="Confirm Delete Environment" size="sm">
                <div className="text-gray-300 space-y-4">
                    <p>Are you sure you want to delete environment "<span className="font-semibold text-white">{environment.name}</span>"? This action cannot be undone.</p>
                    <p className="text-sm text-red-400">All associated API keys, webhooks, and logs will also be deleted.</p>
                    <div className="flex justify-end space-x-3">
                        <button onClick={() => setConfirmDeleteOpen(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm transition-colors">Cancel</button>
                        <button onClick={handleDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm transition-colors">Delete Environment</button>
                    </div>
                </div>
            </Modal>
        </Modal>
    );
};


// 4. Create/Edit Environment Form
export const EnvironmentForm: React.FC<{ environment?: SandboxEnvironment; onClose: () => void }> = ({ environment, onClose }) => {
    const { addEnvironment, updateEnvironment } = useSandbox();
    const isEditing = !!environment;

    const [formData, setFormData] = useState<SandboxEnvironment>(
        environment || {
            id: generateUUID(),
            name: '',
            description: '',
            status: 'Active',
            apiKeyCount: 0,
            webhookCount: 0,
            createdAt: new Date().toISOString().split('T')[0],
            lastActivity: new Date().toISOString(),
            ownerId: MOCK_USERS[0].id, // Default to first mock user
            region: 'us-east-1',
            config: {
                rateLimit: 500,
                dataRetentionDays: 90,
                loggingEnabled: true,
                publicAccess: false,
            }
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        if (name.startsWith('config.')) {
            const configKey = name.split('.')[1] as keyof SandboxEnvironment['config'];
            setFormData(prev => ({
                ...prev,
                config: {
                    ...prev.config,
                    [configKey]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value, 10) : value),
                },
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value, 10) : value),
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            updateEnvironment(formData);
        } else {
            addEnvironment(formData);
        }
        onClose();
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={isEditing ? 'Edit Environment' : 'Create New Environment'} size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-gray-300 text-sm font-bold mb-2">Environment Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500"
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-gray-300 text-sm font-bold mb-2">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500"
                    />
                </div>
                <div>
                    <label htmlFor="ownerId" className="block text-gray-300 text-sm font-bold mb-2">Owner</label>
                    <select
                        id="ownerId"
                        name="ownerId"
                        value={formData.ownerId}
                        onChange={handleChange}
                        className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500"
                    >
                        {MOCK_USERS.map(user => (
                            <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="region" className="block text-gray-300 text-sm font-bold mb-2">Region</label>
                    <select
                        id="region"
                        name="region"
                        value={formData.region}
                        onChange={handleChange}
                        className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500"
                    >
                        <option value="us-east-1">US East (N. Virginia)</option>
                        <option value="us-west-2">US West (Oregon)</option>
                        <option value="eu-west-1">Europe (Ireland)</option>
                        <option value="eu-central-1">Europe (Frankfurt)</option>
                        <option value="ap-southeast-2">Asia Pacific (Sydney)</option>
                    </select>
                </div>

                <div className="border-t border-gray-700 pt-6 space-y-4">
                    <h4 className="text-lg font-semibold text-white">Configuration</h4>
                    <div>
                        <label htmlFor="config.rateLimit" className="block text-gray-300 text-sm font-bold mb-2">Rate Limit (req/min)</label>
                        <input
                            type="number"
                            id="config.rateLimit"
                            name="config.rateLimit"
                            value={formData.config.rateLimit}
                            onChange={handleChange}
                            min="1"
                            className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="config.dataRetentionDays" className="block text-gray-300 text-sm font-bold mb-2">Data Retention (days)</label>
                        <input
                            type="number"
                            id="config.dataRetentionDays"
                            name="config.dataRetentionDays"
                            value={formData.config.dataRetentionDays}
                            onChange={handleChange}
                            min="7"
                            max="365"
                            className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="config.loggingEnabled"
                            name="config.loggingEnabled"
                            checked={formData.config.loggingEnabled}
                            onChange={handleChange}
                            className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                        />
                        <label htmlFor="config.loggingEnabled" className="text-gray-300">Enable API Logging</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="config.publicAccess"
                            name="config.publicAccess"
                            checked={formData.config.publicAccess}
                            onChange={handleChange}
                            className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                        />
                        <label htmlFor="config.publicAccess" className="text-gray-300">Allow Public Access (without API Key)</label>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm font-medium transition-colors">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white text-sm font-medium transition-colors">
                        {isEditing ? 'Save Changes' : 'Create Environment'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};


// 5. Environment API Keys Management
export const EnvironmentAPIKeys: React.FC<{ environmentId: string }> = ({ environmentId }) => {
    const { apiKeys, addApiKey, updateApiKey, deleteApiKey } = useSandbox();
    const [isCreateKeyModalOpen, setCreateKeyModalOpen] = useState(false);
    const [editingKey, setEditingKey] = useState<APIKey | null>(null);

    const filteredApiKeys = useMemo(() => apiKeys.filter(key => key.environmentId === environmentId), [apiKeys, environmentId]);

    const handleCreateKey = (newKey: APIKey) => {
        addApiKey({ ...newKey, environmentId: environmentId, id: generateUUID(), key: `sk_live_${generateUUID().slice(0, 8)}...${generateUUID().slice(0, 4)}`, createdAt: new Date().toISOString() });
        setCreateKeyModalOpen(false);
    };

    const handleUpdateKey = (updatedKey: APIKey) => {
        updateApiKey(updatedKey);
        setEditingKey(null);
    };

    const handleRevokeKey = (key: APIKey) => {
        if (confirm(`Are you sure you want to revoke API Key "${key.name}"?`)) {
            updateApiKey({ ...key, status: 'Revoked', expiresAt: new Date().toISOString() });
        }
    };

    const handleGenerateNewKey = () => {
        const newKey: APIKey = {
            id: generateUUID(),
            environmentId: environmentId,
            name: `New Key ${new Date().toLocaleDateString()}`,
            key: `sk_test_${generateUUID().slice(0, 10)}...${generateUUID().slice(0, 4)}`,
            status: 'Active',
            permissions: ['read:data'],
            createdAt: new Date().toISOString(),
            lastUsed: 'Never',
        };
        addApiKey(newKey);
    };


    return (
        <Card title="API Keys" className="mb-6">
            <div className="flex justify-end mb-4">
                <button
                    onClick={handleGenerateNewKey}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    + Generate New API Key
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Key</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Permissions</th>
                            <th scope="col" className="px-6 py-3">Last Used</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredApiKeys.length === 0 && (
                            <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No API keys found for this environment.</td></tr>
                        )}
                        {filteredApiKeys.map(key => (
                            <tr key={key.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">{key.name}</td>
                                <td className="px-6 py-4 font-mono text-gray-300">{key.key} <Tooltip text="Copy to clipboard"><button onClick={() => navigator.clipboard.writeText(key.key)} className="ml-2 text-cyan-400 hover:text-cyan-200">📋</button></Tooltip></td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(key.status)}`}>{key.status}</span></td>
                                <td className="px-6 py-4 text-gray-300">{key.permissions.join(', ')}</td>
                                <td className="px-6 py-4">{key.lastUsed !== 'Never' ? new Date(key.lastUsed).toLocaleDateString() : key.lastUsed}</td>
                                <td className="px-6 py-4 flex gap-2">
                                    <button onClick={() => setEditingKey(key)} className="text-xs text-yellow-400 hover:underline">Edit</button>
                                    {key.status === 'Active' && <button onClick={() => handleRevokeKey(key)} className="text-xs text-orange-400 hover:underline">Revoke</button>}
                                    <button onClick={() => deleteApiKey(key.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {editingKey && (
                <APIKeyForm keyToEdit={editingKey} onClose={() => setEditingKey(null)} onSave={handleUpdateKey} />
            )}
        </Card>
    );
};

export const APIKeyForm: React.FC<{ keyToEdit?: APIKey | null; onClose: () => void; onSave: (key: APIKey) => void }> = ({ keyToEdit, onClose, onSave }) => {
    const isEditing = !!keyToEdit;
    const [formData, setFormData] = useState<APIKey>(
        keyToEdit || {
            id: generateUUID(),
            environmentId: '', // Placeholder, will be set by parent
            name: '',
            key: `sk_test_${generateUUID().slice(0, 8)}...${generateUUID().slice(0, 4)}`, // Mock key
            status: 'Active',
            permissions: [],
            createdAt: new Date().toISOString(),
            lastUsed: 'Never',
        }
    );

    useEffect(() => {
        if (keyToEdit) setFormData(keyToEdit);
    }, [keyToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            permissions: checked ? [...prev.permissions, value] : prev.permissions.filter(p => p !== value),
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const allPermissions = ['read:data', 'write:data', 'manage:webhooks', 'admin'];

    return (
        <Modal isOpen={true} onClose={onClose} title={isEditing ? 'Edit API Key' : 'Create New API Key'} size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-gray-300 text-sm font-bold mb-2">Key Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500"
                    />
                </div>
                {!isEditing && ( // Only show generated key on create
                    <div>
                        <label htmlFor="key" className="block text-gray-300 text-sm font-bold mb-2">Generated Key (Keep secure!)</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                id="key"
                                name="key"
                                value={formData.key}
                                readOnly
                                className="flex-grow bg-gray-700/50 p-2 rounded text-gray-400 font-mono text-sm border border-gray-600"
                            />
                            <Tooltip text="Copy to clipboard">
                                <button type="button" onClick={() => navigator.clipboard.writeText(formData.key)} className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white text-sm transition-colors">
                                    Copy
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                )}
                <div>
                    <label className="block text-gray-300 text-sm font-bold mb-2">Permissions</label>
                    <div className="grid grid-cols-2 gap-2">
                        {allPermissions.map(perm => (
                            <div key={perm} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`perm-${perm}`}
                                    value={perm}
                                    checked={formData.permissions.includes(perm)}
                                    onChange={handlePermissionChange}
                                    className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                                />
                                <label htmlFor={`perm-${perm}`} className="ml-2 text-gray-300 text-sm">{perm}</label>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor="status" className="block text-gray-300 text-sm font-bold mb-2">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500"
                    >
                        <option value="Active">Active</option>
                        <option value="Revoked">Revoked</option>
                        <option value="Expired">Expired</option>
                    </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm font-medium transition-colors">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white text-sm font-medium transition-colors">
                        {isEditing ? 'Save Changes' : 'Create Key'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};


// 6. Environment Webhooks Management
export const EnvironmentWebhooks: React.FC<{ environmentId: string }> = ({ environmentId }) => {
    const { webhooks, addWebhook, updateWebhook, deleteWebhook } = useSandbox();
    const [isWebhookModalOpen, setWebhookModalOpen] = useState(false);
    const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);

    const filteredWebhooks = useMemo(() => webhooks.filter(hook => hook.environmentId === environmentId), [webhooks, environmentId]);

    const handleSaveWebhook = (webhook: WebhookConfig) => {
        if (editingWebhook) {
            updateWebhook(webhook);
        } else {
            addWebhook({ ...webhook, environmentId: environmentId, id: generateUUID(), createdAt: new Date().toISOString(), lastTriggered: 'Never' });
        }
        setWebhookModalOpen(false);
        setEditingWebhook(null);
    };

    const handleTriggerTestWebhook = (webhook: WebhookConfig) => {
        alert(`Simulating test trigger for webhook: ${webhook.name} to ${webhook.url}`);
        // In a real app, this would make an actual request to the webhook URL.
        updateWebhook({ ...webhook, lastTriggered: new Date().toISOString() });
    };

    return (
        <Card title="Webhooks" className="mb-6">
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => { setEditingWebhook(null); setWebhookModalOpen(true); }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    + Add New Webhook
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">URL</th>
                            <th scope="col" className="px-6 py-3">Events</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Last Triggered</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredWebhooks.length === 0 && (
                            <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No webhooks configured for this environment.</td></tr>
                        )}
                        {filteredWebhooks.map(webhook => (
                            <tr key={webhook.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">{webhook.name}</td>
                                <td className="px-6 py-4 text-gray-300 font-mono truncate max-w-xs">{webhook.url}</td>
                                <td className="px-6 py-4 text-gray-300">{webhook.events.join(', ')}</td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(webhook.status)}`}>{webhook.status}</span></td>
                                <td className="px-6 py-4">{webhook.lastTriggered !== 'Never' ? new Date(webhook.lastTriggered).toLocaleString() : 'Never'}</td>
                                <td className="px-6 py-4 flex gap-2">
                                    <button onClick={() => setEditingWebhook(webhook)} className="text-xs text-yellow-400 hover:underline">Edit</button>
                                    <button onClick={() => handleTriggerTestWebhook(webhook)} className="text-xs text-cyan-400 hover:underline">Test</button>
                                    <button onClick={() => deleteWebhook(webhook.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isWebhookModalOpen && (
                <WebhookForm webhookToEdit={editingWebhook} onClose={() => { setWebhookModalOpen(false); setEditingWebhook(null); }} onSave={handleSaveWebhook} />
            )}
        </Card>
    );
};

export const WebhookForm: React.FC<{ webhookToEdit?: WebhookConfig | null; onClose: () => void; onSave: (webhook: WebhookConfig) => void }> = ({ webhookToEdit, onClose, onSave }) => {
    const isEditing = !!webhookToEdit;
    const [formData, setFormData] = useState<WebhookConfig>(
        webhookToEdit || {
            id: generateUUID(),
            environmentId: '', // Placeholder
            name: '',
            url: '',
            secret: generateUUID(),
            events: [],
            status: 'Active',
            createdAt: new Date().toISOString(),
            lastTriggered: 'Never',
            retriesEnabled: true,
            maxRetries: 5,
        }
    );

    useEffect(() => {
        if (webhookToEdit) setFormData(webhookToEdit);
    }, [webhookToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value, 10) : value),
        }));
    };

    const handleEventChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            events: checked ? [...prev.events, value] : prev.events.filter(event => event !== value),
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const allEvents = ['data.created', 'data.updated', 'data.deleted', 'user.created', 'user.updated', 'user.deleted', 'api_key.revoked', 'environment.status_change', 'payment.success', 'payment.failed'];

    return (
        <Modal isOpen={true} onClose={onClose} title={isEditing ? 'Edit Webhook' : 'Add New Webhook'} size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-gray-300 text-sm font-bold mb-2">Webhook Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500"
                    />
                </div>
                <div>
                    <label htmlFor="url" className="block text-gray-300 text-sm font-bold mb-2">Target URL</label>
                    <input
                        type="url"
                        id="url"
                        name="url"
                        value={formData.url}
                        onChange={handleChange}
                        required
                        placeholder="https://your-listener.com/webhook"
                        className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500"
                    />
                </div>
                {!isEditing && ( // Only show generated secret on create
                    <div>
                        <label htmlFor="secret" className="block text-gray-300 text-sm font-bold mb-2">Shared Secret (for verification)</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                id="secret"
                                name="secret"
                                value={formData.secret}
                                readOnly
                                className="flex-grow bg-gray-700/50 p-2 rounded text-gray-400 font-mono text-sm border border-gray-600"
                            />
                            <Tooltip text="Copy to clipboard">
                                <button type="button" onClick={() => navigator.clipboard.writeText(formData.secret)} className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white text-sm transition-colors">
                                    Copy
                                </button>
                            </Tooltip>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">This secret is used to sign webhook payloads, ensure you store it securely.</p>
                    </div>
                )}
                <div>
                    <label className="block text-gray-300 text-sm font-bold mb-2">Events to Trigger On</label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {allEvents.map(event => (
                            <div key={event} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`event-${event}`}
                                    value={event}
                                    checked={formData.events.includes(event)}
                                    onChange={handleEventChange}
                                    className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                                />
                                <label htmlFor={`event-${event}`} className="ml-2 text-gray-300 text-sm">{event}</label>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor="status" className="block text-gray-300 text-sm font-bold mb-2">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500"
                    >
                        <option value="Active">Active</option>
                        <option value="Paused">Paused</option>
                        <option value="Failed">Failed (Automatic pausing)</option>
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="retriesEnabled"
                        name="retriesEnabled"
                        checked={formData.retriesEnabled}
                        onChange={handleChange}
                        className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                    />
                    <label htmlFor="retriesEnabled" className="text-gray-300">Enable Retries on Failure</label>
                </div>
                {formData.retriesEnabled && (
                    <div>
                        <label htmlFor="maxRetries" className="block text-gray-300 text-sm font-bold mb-2">Max Retries</label>
                        <input
                            type="number"
                            id="maxRetries"
                            name="maxRetries"
                            value={formData.maxRetries}
                            onChange={handleChange}
                            min="0"
                            className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500"
                        />
                    </div>
                )}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm font-medium transition-colors">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white text-sm font-medium transition-colors">
                        {isEditing ? 'Save Changes' : 'Add Webhook'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};


// 7. Environment Logs Viewer
export const EnvironmentLogs: React.FC<{ environmentId: string }> = ({ environmentId }) => {
    const { logs, refreshLogs } = useSandbox();
    const [filterLevel, setFilterLevel] = useState<string>('ALL');
    const [filterSource, setFilterSource] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [displayCount, setDisplayCount] = useState<number>(50);

    const filteredLogs = useMemo(() => {
        const envLogs = logs.filter(log => log.environmentId === environmentId);
        return envLogs.filter(log => {
            const levelMatch = filterLevel === 'ALL' || log.level === filterLevel;
            const sourceMatch = filterSource === 'ALL' || log.source === filterSource;
            const searchMatch = searchTerm === '' ||
                log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (log.requestId?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (log.details && JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase()));
            return levelMatch && sourceMatch && searchMatch;
        }).slice(0, displayCount);
    }, [logs, environmentId, filterLevel, filterSource, searchTerm, displayCount]);

    const allLevels = ['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'];
    const allSources = ['ALL', 'API', 'Webhook', 'System', 'Auth'];

    const getLevelColor = (level: LogEntry['level']) => {
        switch (level) {
            case 'INFO': return 'text-blue-400';
            case 'WARN': return 'text-yellow-400';
            case 'ERROR': return 'text-red-400';
            case 'DEBUG': return 'text-purple-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <Card title="Logs" className="mb-6">
            <div className="flex flex-wrap gap-4 mb-4 items-center">
                <div>
                    <label htmlFor="log-level-filter" className="sr-only">Filter by Level</label>
                    <select
                        id="log-level-filter"
                        value={filterLevel}
                        onChange={e => setFilterLevel(e.target.value)}
                        className="bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500 text-sm"
                    >
                        {allLevels.map(level => <option key={level} value={level}>{level}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="log-source-filter" className="sr-only">Filter by Source</label>
                    <select
                        id="log-source-filter"
                        value={filterSource}
                        onChange={e => setFilterSource(e.target.value)}
                        className="bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500 text-sm"
                    >
                        {allSources.map(source => <option key={source} value={source}>{source}</option>)}
                    </select>
                </div>
                <div className="flex-grow">
                    <label htmlFor="log-search" className="sr-only">Search Logs</label>
                    <input
                        type="text"
                        id="log-search"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search message, request ID..."
                        className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500 text-sm"
                    />
                </div>
                <div>
                    <button
                        onClick={() => refreshLogs(environmentId)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Refresh Logs
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto max-h-96 custom-scrollbar">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">Time</th>
                            <th scope="col" className="px-6 py-3">Level</th>
                            <th scope="col" className="px-6 py-3">Source</th>
                            <th scope="col" className="px-6 py-3">Message</th>
                            <th scope="col" className="px-6 py-3">Request ID</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Latency</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.length === 0 && (
                            <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">No logs found matching criteria.</td></tr>
                        )}
                        {filteredLogs.map(log => (
                            <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-2 text-gray-500 text-xs font-mono">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                <td className="px-6 py-2">
                                    <span className={`${getLevelColor(log.level)} font-bold`}>{log.level}</span>
                                </td>
                                <td className="px-6 py-2 text-gray-400">{log.source}</td>
                                <td className="px-6 py-2 text-white max-w-sm truncate">{log.message}</td>
                                <td className="px-6 py-2 text-gray-500 font-mono">{log.requestId || 'N/A'}</td>
                                <td className="px-6 py-2 text-gray-500">{log.statusCode || 'N/A'}</td>
                                <td className="px-6 py-2 text-gray-500">{log.latencyMs ? `${log.latencyMs}ms` : 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {filteredLogs.length < logs.filter(log => log.environmentId === environmentId).length && (
                <div className="text-center mt-4">
                    <button onClick={() => setDisplayCount(prev => prev + 50)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium">Load More</button>
                </div>
            )}
        </Card>
    );
};

// 8. Environment Metrics Display (Mock Charts)
export const EnvironmentMetrics: React.FC<{ environment: SandboxEnvironment }> = ({ environment }) => {
    const [activeMetricTab, setActiveMetricTab] = useState('api_calls');
    const [timeframe, setTimeframe] = useState('24h');

    const getDaysForTimeframe = (tf: string) => {
        switch (tf) {
            case '1h': return 1/24;
            case '24h': return 1;
            case '7d': return 7;
            case '30d': return 30;
            default: return 1;
        }
    };

    // Simulate metrics
    const mockMetricData = useMemo(() => {
        const days = getDaysForTimeframe(timeframe);
        return {
            api_calls: generateMockMetrics('api_calls', days),
            api_errors: generateMockMetrics('api_errors', days),
            api_latency: generateMockMetrics('api_latency', days),
            webhook_failures: generateMockMetrics('webhook_failures', days),
        };
    }, [timeframe]);

    const currentMetricData = mockMetricData[activeMetricTab as keyof typeof mockMetricData] || [];

    const formatMetricValue = (metricType: string, value: number) => {
        switch(metricType) {
            case 'api_errors':
            case 'webhook_failures': return `${value.toFixed(2)}%`;
            case 'api_latency': return `${value.toFixed(0)}ms`;
            default: return value.toLocaleString();
        }
    };

    const MetricChartPlaceholder: React.FC<{ data: MetricData[]; label: string; unit: string; color: string }> = ({ data, label, unit, color }) => {
        // A simple text-based representation as a placeholder for a real chart
        if (data.length === 0) return <p className="text-gray-500 text-center py-8">No data available for this timeframe.</p>;

        const latestValue = data[data.length - 1]?.value;
        const trend = data.length > 1 && data[data.length - 1].value > data[0].value ? '📈' : (data.length > 1 && data[data.length - 1].value < data[0].value ? '📉' : '➖');

        return (
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 h-64 flex flex-col justify-between">
                <p className="text-gray-400 text-sm">{label}</p>
                <p className="text-white text-3xl font-bold">{latestValue ? `${latestValue.toFixed(unit === '%' ? 2 : 0)}${unit}` : 'N/A'} {trend}</p>
                <div className="w-full h-24 bg-gradient-to-r from-gray-800 to-gray-700 rounded-md overflow-hidden relative">
                    {/* Simulate a sparkline with divs for visual variety */}
                    <div className={`absolute bottom-0 left-0 h-full ${color}`} style={{ width: '100%', clipPath: `polygon(${data.map((d, i) => `${(i / (data.length - 1)) * 100}% ${100 - (d.value / Math.max(...data.map(d => d.value))) * 100}%`).join(', ')})` }}></div>
                </div>
                <p className="text-gray-500 text-xs text-right">Data points: {data.length}</p>
            </div>
        );
    };

    return (
        <Card title="Metrics Overview" className="mb-6">
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                <div>
                    <select
                        value={timeframe}
                        onChange={e => setTimeframe(e.target.value)}
                        className="bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500 text-sm"
                    >
                        <option value="1h">Last Hour</option>
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                    </select>
                </div>
                <div className="flex space-x-2">
                    <Tab label="API Calls" isActive={activeMetricTab === 'api_calls'} onClick={() => setActiveMetricTab('api_calls')} />
                    <Tab label="API Errors" isActive={activeMetricTab === 'api_errors'} onClick={() => setActiveMetricTab('api_errors')} />
                    <Tab label="Latency" isActive={activeMetricTab === 'api_latency'} onClick={() => setActiveMetricTab('api_latency')} />
                    <Tab label="Webhook Failures" isActive={activeMetricTab === 'webhook_failures'} onClick={() => setActiveMetricTab('webhook_failures')} />
                </div>
            </div>
            <div className="mt-4">
                <MetricChartPlaceholder
                    data={currentMetricData}
                    label={
                        activeMetricTab === 'api_calls' ? 'Total API Calls' :
                        activeMetricTab === 'api_errors' ? 'API Error Rate' :
                        activeMetricTab === 'api_latency' ? 'Average API Latency' :
                        'Webhook Failure Rate'
                    }
                    unit={
                        activeMetricTab === 'api_errors' || activeMetricTab === 'webhook_failures' ? '%' :
                        activeMetricTab === 'api_latency' ? 'ms' : ''
                    }
                    color={
                        activeMetricTab === 'api_errors' || activeMetricTab === 'webhook_failures' ? 'bg-red-500' :
                        activeMetricTab === 'api_latency' ? 'bg-yellow-500' : 'bg-cyan-500'
                    }
                />
            </div>
            <AlertRules environmentId={environment.id} />
        </Card>
    );
};

// 9. Environment Settings
export const EnvironmentSettings: React.FC<{ environment: SandboxEnvironment; onUpdate: (env: SandboxEnvironment) => void }> = ({ environment, onUpdate }) => {
    const [formData, setFormData] = useState(environment.config);
    const [description, setDescription] = useState(environment.description);

    useEffect(() => {
        setFormData(environment.config);
        setDescription(environment.description);
    }, [environment]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        if (name === 'description') {
            setDescription(value);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value, 10) : value),
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate({ ...environment, description: description, config: formData, lastActivity: new Date().toISOString() });
        alert('Environment settings updated!');
    };

    return (
        <Card title="Environment Settings" className="mb-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="description" className="block text-gray-300 text-sm font-bold mb-2">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500"
                    />
                </div>
                <div className="border-t border-gray-700 pt-6 space-y-4">
                    <h4 className="text-lg font-semibold text-white">Configuration Parameters</h4>
                    <div>
                        <label htmlFor="rateLimit" className="block text-gray-300 text-sm font-bold mb-2">Rate Limit (requests per minute)</label>
                        <input
                            type="number"
                            id="rateLimit"
                            name="rateLimit"
                            value={formData.rateLimit}
                            onChange={handleChange}
                            min="1"
                            className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="dataRetentionDays" className="block text-gray-300 text-sm font-bold mb-2">Data Retention (days)</label>
                        <input
                            type="number"
                            id="dataRetentionDays"
                            name="dataRetentionDays"
                            value={formData.dataRetentionDays}
                            onChange={handleChange}
                            min="7"
                            max="365"
                            className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="loggingEnabled"
                            name="loggingEnabled"
                            checked={formData.loggingEnabled}
                            onChange={handleChange}
                            className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                        />
                        <label htmlFor="loggingEnabled" className="text-gray-300">Enable Detailed API Logging</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="publicAccess"
                            name="publicAccess"
                            checked={formData.publicAccess}
                            onChange={handleChange}
                            className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                        />
                        <label htmlFor="publicAccess" className="text-gray-300">Allow Unauthenticated Access (use with caution)</label>
                    </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-700">
                    <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white text-sm font-medium transition-colors">
                        Save Environment Settings
                    </button>
                </div>
            </form>
        </Card>
    );
};

// 10. Alert Rules Management
export const AlertRules: React.FC<{ environmentId: string }> = ({ environmentId }) => {
    const [alertRules, setAlertRules] = useState<AlertRule[]>([]); // Using local state for alerts for simplicity
    const [isAlertModalOpen, setAlertModalOpen] = useState(false);
    const [editingAlert, setEditingAlert] = useState<AlertRule | null>(null);

    useEffect(() => {
        // Generate some mock alerts for the current environment
        const mockAlerts: AlertRule[] = [
            { id: generateUUID(), environmentId, name: 'High API Error Rate', metric: 'api_errors', threshold: 5, operator: 'gt', durationMinutes: 5, status: 'Active', channels: ['email', 'slack'], recipients: ['devs@example.com', '#alerts'], createdAt: getRandomDate(new Date(2024, 6, 1), new Date()) },
            { id: generateUUID(), environmentId, name: 'Increased API Latency', metric: 'api_latency', threshold: 300, operator: 'gt', durationMinutes: 10, status: 'Active', channels: ['email'], recipients: ['ops@example.com'], createdAt: getRandomDate(new Date(2024, 6, 1), new Date()) },
            { id: generateUUID(), environmentId, name: 'Webhook Failure Spike', metric: 'webhook_failures', threshold: 10, operator: 'gt', durationMinutes: 15, status: 'Paused', channels: ['slack'], recipients: ['#webhooks-dev'], createdAt: getRandomDate(new Date(2024, 6, 1), new Date()) },
        ].filter(rule => Math.random() > 0.3); // Randomly include some alerts

        setAlertRules(mockAlerts);
    }, [environmentId]);

    const handleSaveAlert = (alert: AlertRule) => {
        if (editingAlert) {
            setAlertRules(prev => prev.map(a => (a.id === alert.id ? alert : a)));
        } else {
            setAlertRules(prev => [...prev, { ...alert, id: generateUUID(), environmentId, createdAt: new Date().toISOString() }]);
        }
        setAlertModalOpen(false);
        setEditingAlert(null);
    };

    const handleDeleteAlert = (id: string) => {
        if (confirm('Are you sure you want to delete this alert rule?')) {
            setAlertRules(prev => prev.filter(alert => alert.id !== id));
        }
    };

    return (
        <Card title="Alert Rules" className="mt-6">
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => { setEditingAlert(null); setAlertModalOpen(true); }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    + Create New Alert
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Metric</th>
                            <th scope="col" className="px-6 py-3">Condition</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Channels</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alertRules.length === 0 && (
                            <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No alert rules configured for this environment.</td></tr>
                        )}
                        {alertRules.map(alert => (
                            <tr key={alert.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">{alert.name}</td>
                                <td className="px-6 py-4 text-gray-300">{alert.metric.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</td>
                                <td className="px-6 py-4 text-gray-300">{`Value ${alert.operator === 'gt' ? '>' : alert.operator === 'lt' ? '<' : '='} ${alert.threshold}${alert.metric.includes('error') || alert.metric.includes('failure') ? '%' : (alert.metric.includes('latency') ? 'ms' : '')} for ${alert.durationMinutes} min`}</td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(alert.status)}`}>{alert.status}</span></td>
                                <td className="px-6 py-4 text-gray-300">{alert.channels.join(', ')}</td>
                                <td className="px-6 py-4 flex gap-2">
                                    <button onClick={() => setEditingAlert(alert)} className="text-xs text-yellow-400 hover:underline">Edit</button>
                                    <button onClick={() => handleDeleteAlert(alert.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isAlertModalOpen && (
                <AlertRuleForm alertToEdit={editingAlert} onClose={() => { setAlertModalOpen(false); setEditingAlert(null); }} onSave={handleSaveAlert} />
            )}
        </Card>
    );
};

export const AlertRuleForm: React.FC<{ alertToEdit?: AlertRule | null; onClose: () => void; onSave: (alert: AlertRule) => void }> = ({ alertToEdit, onClose, onSave }) => {
    const isEditing = !!alertToEdit;
    const [formData, setFormData] = useState<AlertRule>(
        alertToEdit || {
            id: generateUUID(),
            environmentId: '', // Placeholder
            name: '',
            metric: 'api_errors',
            threshold: 5,
            operator: 'gt',
            durationMinutes: 5,
            status: 'Active',
            channels: ['email'],
            recipients: [],
            createdAt: new Date().toISOString(),
        }
    );

    useEffect(() => {
        if (alertToEdit) setFormData(alertToEdit);
    }, [alertToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        if (name === 'recipients') {
            setFormData(prev => ({ ...prev, [name]: value.split(',').map(s => s.trim()).filter(Boolean) }));
        } else if (name === 'channels') {
            const channel = value as 'email' | 'slack' | 'webhook';
            setFormData(prev => ({
                ...prev,
                channels: checked ? [...prev.channels, channel] : prev.channels.filter(c => c !== channel),
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value, 10) : value),
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const metricOptions = [
        { value: 'api_errors', label: 'API Error Rate (%)' },
        { value: 'api_latency', label: 'API Latency (ms)' },
        { value: 'webhook_failures', label: 'Webhook Failure Rate (%)' },
        { value: 'rate_limit_exceeded', label: 'Rate Limit Exceeded (count)' },
    ];
    const operatorOptions = [{ value: 'gt', label: 'Greater Than (>)', symbol: '>' }, { value: 'lt', label: 'Less Than (<)', symbol: '<' }, { value: 'eq', label: 'Equals (=)', symbol: '=' }];
    const channelOptions = ['email', 'slack', 'webhook'];

    return (
        <Modal isOpen={true} onClose={onClose} title={isEditing ? 'Edit Alert Rule' : 'Create New Alert Rule'} size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-gray-300 text-sm font-bold mb-2">Alert Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500"
                    />
                </div>
                <div>
                    <label htmlFor="metric" className="block text-gray-300 text-sm font-bold mb-2">Monitor Metric</label>
                    <select
                        id="metric"
                        name="metric"
                        value={formData.metric}
                        onChange={handleChange}
                        required
                        className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500"
                    >
                        {metricOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="operator" className="block text-gray-300 text-sm font-bold mb-2">Operator</label>
                        <select
                            id="operator"
                            name="operator"
                            value={formData.operator}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500"
                        >
                            {operatorOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.symbol}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="threshold" className="block text-gray-300 text-sm font-bold mb-2">Threshold</label>
                        <input
                            type="number"
                            id="threshold"
                            name="threshold"
                            value={formData.threshold}
                            onChange={handleChange}
                            required
                            min="0"
                            step={formData.metric.includes('error') || formData.metric.includes('failure') ? "0.1" : "1"}
                            className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="durationMinutes" className="block text-gray-300 text-sm font-bold mb-2">Duration (min)</label>
                        <input
                            type="number"
                            id="durationMinutes"
                            name="durationMinutes"
                            value={formData.durationMinutes}
                            onChange={handleChange}
                            required
                            min="1"
                            max="60"
                            className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-gray-300 text-sm font-bold mb-2">Notification Channels</label>
                    <div className="flex gap-4">
                        {channelOptions.map(channel => (
                            <div key={channel} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`channel-${channel}`}
                                    name="channels"
                                    value={channel}
                                    checked={formData.channels.includes(channel)}
                                    onChange={e => handleChange({ ...e, target: { ...e.target, name: 'channels', type: 'checkbox', value: channel } as HTMLInputElement })}
                                    className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                                />
                                <label htmlFor={`channel-${channel}`} className="ml-2 text-gray-300 text-sm capitalize">{channel}</label>
                            </div>
                        ))}
                    </div>
                </div>
                {formData.channels.length > 0 && (
                    <div>
                        <label htmlFor="recipients" className="block text-gray-300 text-sm font-bold mb-2">Recipients (comma-separated)</label>
                        <input
                            type="text"
                            id="recipients"
                            name="recipients"
                            value={formData.recipients.join(', ')}
                            onChange={handleChange}
                            placeholder="e.g., email@example.com, #slack-channel, https://webhook.site/..."
                            className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500"
                        />
                    </div>
                )}
                <div>
                    <label htmlFor="status" className="block text-gray-300 text-sm font-bold mb-2">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500"
                    >
                        <option value="Active">Active</option>
                        <option value="Paused">Paused</option>
                    </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm font-medium transition-colors">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm font-medium transition-colors">
                        {isEditing ? 'Save Changes' : 'Create Alert'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

// 11. API Request Tester
export const APIRequestTester: React.FC = () => {
    const { selectedEnvironmentId, environments, apiKeys } = useSandbox();
    const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET');
    const [path, setPath] = useState('/users/{id}');
    const [requestBody, setRequestBody] = useState('{}');
    const [headers, setHeaders] = useState('{"Content-Type": "application/json"}');
    const [response, setResponse] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [statusCode, setStatusCode] = useState<number | null>(null);
    const [responseTime, setResponseTime] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedAPIKeyId, setSelectedAPIKeyId] = useState<string>('');

    const currentEnv = selectedEnvironmentId ? environments.find(env => env.id === selectedEnvironmentId) : null;
    const availableKeys = useMemo(() => apiKeys.filter(key => key.environmentId === selectedEnvironmentId && key.status === 'Active'), [apiKeys, selectedEnvironmentId]);

    useEffect(() => {
        if (availableKeys.length > 0 && !selectedAPIKeyId) {
            setSelectedAPIKeyId(availableKeys[0].id);
        } else if (availableKeys.length === 0) {
            setSelectedAPIKeyId('');
        }
    }, [availableKeys, selectedAPIKeyId]);

    const handleSendRequest = async () => {
        setIsLoading(true);
        setResponse('');
        setStatusCode(null);
        setResponseTime(null);
        setError(null);

        try {
            const startTime = performance.now();
            // Simulate network request
            await new Promise(resolve => setTimeout(resolve, getRandomInt(100, 1500))); // Simulate latency

            const mockEndpoint = MOCK_API_ENDPOINTS.find(ep => ep.path === path);
            if (!mockEndpoint) {
                setStatusCode(404);
                setResponseTime(performance.now() - startTime);
                setResponse(JSON.stringify({ message: 'Mock endpoint not found', details: `Path: ${path}, Method: ${method}` }, null, 2));
                setError('Mock endpoint not found.');
                return;
            }

            if (method !== mockEndpoint.method) {
                setStatusCode(405);
                setResponseTime(performance.now() - startTime);
                setResponse(JSON.stringify({ message: 'Method Not Allowed', details: `Expected ${mockEndpoint.method}, got ${method}` }, null, 2));
                setError('Method Not Allowed.');
                return;
            }

            // Simulate API key validation
            if (mockEndpoint.isAuthenticated && selectedAPIKeyId) {
                const usedKey = apiKeys.find(k => k.id === selectedAPIKeyId);
                if (!usedKey || usedKey.status !== 'Active') {
                    setStatusCode(401);
                    setResponseTime(performance.now() - startTime);
                    setResponse(JSON.stringify({ message: 'Unauthorized', details: 'Invalid or revoked API Key' }, null, 2));
                    setError('Unauthorized: Invalid API Key.');
                    return;
                }
                // Simulate permission check (simplified)
                if (!usedKey.permissions.includes('admin') && ((method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'PATCH') && !usedKey.permissions.includes('write:data')) || (method === 'GET' && !usedKey.permissions.includes('read:data'))) {
                    setStatusCode(403);
                    setResponseTime(performance.now() - startTime);
                    setResponse(JSON.stringify({ message: 'Forbidden', details: 'API Key does not have required permissions' }, null, 2));
                    setError('Forbidden: Insufficient permissions.');
                    return;
                }
            } else if (mockEndpoint.isAuthenticated && !selectedAPIKeyId) {
                setStatusCode(401);
                setResponseTime(performance.now() - startTime);
                setResponse(JSON.stringify({ message: 'Unauthorized', details: 'API Key required' }, null, 2));
                setError('Unauthorized: API Key required.');
                return;
            }


            // Simulate different responses based on method
            let mockResponse: any = {};
            let mockStatusCode: number = 200;

            if (method === 'GET') {
                if (path.includes('{id}')) { // Specific item
                    mockResponse = { id: 'some-id-123', name: 'Mock Item', status: 'active', data: 'example' };
                } else { // List
                    mockResponse = {
                        items: Array.from({ length: getRandomInt(3, 10) }).map((_, i) => ({
                            id: `item-${i}`,
                            name: `Generated Item ${i + 1}`,
                            value: getRandomFloat(10, 1000)
                        }))
                    };
                }
            } else if (method === 'POST') {
                mockResponse = { message: 'Resource created successfully', id: generateUUID(), status: 'pending' };
                mockStatusCode = 201;
            } else if (method === 'PUT' || method === 'PATCH') {
                mockResponse = { message: 'Resource updated successfully' };
                mockStatusCode = 200;
            } else if (method === 'DELETE') {
                mockResponse = { message: 'Resource deleted successfully' };
                mockStatusCode = 204;
            }

            setStatusCode(mockStatusCode);
            setResponse(JSON.stringify(mockResponse, null, 2));
        } catch (err) {
            setError(`Request failed: ${(err as Error).message}`);
            setStatusCode(500);
            setResponse(JSON.stringify({ error: (err as Error).message }, null, 2));
        } finally {
            setResponseTime(performance.now() - startTime);
            setIsLoading(false);
        }
    };

    return (
        <Card title="API Request Tester" className="mb-6">
            <div className="space-y-6">
                <div>
                    <label className="block text-gray-300 text-sm font-bold mb-2">Target Environment</label>
                    <input
                        type="text"
                        value={currentEnv ? `${currentEnv.name} (${currentEnv.region})` : 'No environment selected'}
                        readOnly
                        className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 cursor-not-allowed"
                        disabled={true}
                    />
                    {!selectedEnvironmentId && <p className="text-sm text-red-400 mt-1">Please select an environment to use the API tester.</p>}
                </div>
                <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1">
                        <label htmlFor="method" className="block text-gray-300 text-sm font-bold mb-2">Method</label>
                        <select
                            id="method"
                            value={method}
                            onChange={e => setMethod(e.target.value as any)}
                            className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500"
                            disabled={!selectedEnvironmentId}
                        >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                            <option value="PATCH">PATCH</option>
                        </select>
                    </div>
                    <div className="col-span-3">
                        <label htmlFor="path" className="block text-gray-300 text-sm font-bold mb-2">Path</label>
                        <select
                            id="path"
                            value={path}
                            onChange={e => setPath(e.target.value)}
                            className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500"
                            disabled={!selectedEnvironmentId}
                        >
                            {MOCK_API_ENDPOINTS.map(ep => (
                                <option key={ep.id} value={ep.path}>{ep.method} {ep.path} - {ep.description}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="api-key-selector" className="block text-gray-300 text-sm font-bold mb-2">API Key (optional)</label>
                    <select
                        id="api-key-selector"
                        value={selectedAPIKeyId}
                        onChange={e => setSelectedAPIKeyId(e.target.value)}
                        className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500"
                        disabled={!selectedEnvironmentId || availableKeys.length === 0}
                    >
                        <option value="">No API Key</option>
                        {availableKeys.map(key => (
                            <option key={key.id} value={key.id}>{key.name} ({key.key.slice(0, 10)}...)</option>
                        ))}
                    </select>
                    {!availableKeys.length && selectedEnvironmentId && <p className="text-sm text-yellow-400 mt-1">No active API keys for this environment. Requests might fail if authentication is required.</p>}
                </div>

                <div>
                    <label htmlFor="headers" className="block text-gray-300 text-sm font-bold mb-2">Headers (JSON)</label>
                    <textarea
                        id="headers"
                        value={headers}
                        onChange={e => setHeaders(e.target.value)}
                        rows={3}
                        className="w-full bg-gray-700/50 p-2 rounded text-white font-mono text-sm border border-gray-600 focus:border-cyan-500"
                        disabled={!selectedEnvironmentId}
                    />
                </div>
                {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
                    <div>
                        <label htmlFor="request-body" className="block text-gray-300 text-sm font-bold mb-2">Request Body (JSON)</label>
                        <textarea
                            id="request-body"
                            value={requestBody}
                            onChange={e => setRequestBody(e.target.value)}
                            rows={5}
                            className="w-full bg-gray-700/50 p-2 rounded text-white font-mono text-sm border border-gray-600 focus:border-cyan-500"
                            disabled={!selectedEnvironmentId}
                        />
                    </div>
                )}

                <button
                    onClick={handleSendRequest}
                    disabled={isLoading || !selectedEnvironmentId}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50 text-white font-medium transition-colors"
                >
                    {isLoading ? 'Sending Request...' : 'Send Request'}
                </button>

                <Card title="API Response" className="mt-4">
                    <div className="flex items-center space-x-4 mb-2">
                        {statusCode && (
                            <span className={`font-semibold text-sm ${statusCode >= 200 && statusCode < 300 ? 'text-green-400' : (statusCode >= 400 && statusCode < 500 ? 'text-yellow-400' : 'text-red-400')}`}>
                                Status: {statusCode}
                            </span>
                        )}
                        {responseTime && (
                            <span className="font-semibold text-sm text-gray-400">
                                Latency: {responseTime.toFixed(2)}ms
                            </span>
                        )}
                        {error && (
                            <span className="font-semibold text-sm text-red-400">
                                Error: {error}
                            </span>
                        )}
                    </div>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-gray-900/50 p-4 rounded max-h-60 overflow-auto border border-gray-700">
                        {isLoading ? 'Loading response...' : (response || 'No response yet.')}
                    </pre>
                </Card>
            </div>
        </Card>
    );
};

// 12. Code Snippet Generator
export const CodeSnippetGenerator: React.FC = () => {
    const { selectedEnvironmentId, environments } = useSandbox();
    const [selectedLanguage, setSelectedLanguage] = useState<CodeSnippetConfig['language']>('javascript');
    const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(MOCK_API_ENDPOINTS[0]);
    const [customBody, setCustomBody] = useState('{}');
    const [customQueryParams, setCustomQueryParams] = useState('');
    const [customHeaders, setCustomHeaders] = useState('{"Authorization": "Bearer YOUR_API_KEY"}');
    const [generatedCode, setGeneratedCode] = useState<string>('Select an endpoint and language to generate code.');

    const currentEnv = selectedEnvironmentId ? environments.find(env => env.id === selectedEnvironmentId) : null;
    const baseApiUrl = currentEnv ? `https://${currentEnv.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.api.example.com` : 'https://your-api-domain.com';

    useEffect(() => {
        if (selectedEndpoint) {
            generateSnippet();
        }
    }, [selectedLanguage, selectedEndpoint, customBody, customQueryParams, customHeaders, baseApiUrl]);

    const generateSnippet = () => {
        if (!selectedEndpoint) {
            setGeneratedCode('Please select an API endpoint.');
            return;
        }

        const url = `${baseApiUrl}${selectedEndpoint.path}`;
        let queryParamsString = '';
        try {
            const parsedQueryParams = customQueryParams.split('&').filter(Boolean).reduce((acc, part) => {
                const [key, value] = part.split('=');
                if (key && value) acc[key] = value;
                return acc;
            }, {} as Record<string, string>);
            if (Object.keys(parsedQueryParams).length > 0) {
                queryParamsString = new URLSearchParams(parsedQueryParams).toString();
            }
        } catch (e) {
            console.warn("Invalid query params format:", e);
        }

        let finalUrl = url;
        if (queryParamsString) {
            finalUrl += `?${queryParamsString}`;
        }

        let snippet = '';
        let bodyObject = {};
        try {
            bodyObject = JSON.parse(customBody);
        } catch (e) {
            // Invalid JSON, will treat as empty object or handle below
        }

        let headersObject = {};
        try {
            headersObject = JSON.parse(customHeaders);
        } catch (e) {
            // Invalid JSON
        }

        switch (selectedLanguage) {
            case 'javascript':
                snippet = `
// JavaScript (Fetch API)
const url = '${finalUrl}';
const options = {
    method: '${selectedEndpoint.method}',
    headers: {
        'Content-Type': 'application/json',
        ...${JSON.stringify(headersObject, null, 2)}
    },
    ${(selectedEndpoint.method !== 'GET' && Object.keys(bodyObject).length > 0) ? `body: JSON.stringify(${JSON.stringify(bodyObject, null, 2)})` : ''}
};

fetch(url, options)
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
                `.trim();
                break;
            case 'python':
                snippet = `
# Python (requests library)
import requests
import json

url = '${finalUrl}'
headers = {
    'Content-Type': 'application/json',
    ${Object.entries(headersObject).map(([key, value]) => `'${key}': '${value}'`).join(',\n    ')}
}
${(selectedEndpoint.method !== 'GET' && Object.keys(bodyObject).length > 0) ? `payload = ${JSON.stringify(bodyObject, null, 2)}\n` : 'payload = {}'}

response = requests.request(
    '${selectedEndpoint.method}',
    url,
    headers=headers,
    ${(selectedEndpoint.method !== 'GET' && Object.keys(bodyObject).length > 0) ? 'json=payload' : ''}
)

print(response.status_code)
print(json.dumps(response.json(), indent=2))
                `.trim();
                break;
            case 'go':
                snippet = `
// Go
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
)

func main() {
	url := "${finalUrl}"
	method := "${selectedEndpoint.method}"

	// Headers
	req, err := http.NewRequest(method, url, nil)
	if err != nil {
		log.Fatal(err)
	}
	req.Header.Set("Content-Type", "application/json")
	${Object.entries(headersObject).map(([key, value]) => `req.Header.Set("${key}", "${value}")`).join('\n\t')}

	// Body
	${(selectedEndpoint.method !== 'GET' && Object.keys(bodyObject).length > 0) ? `
	payload := map[string]interface{}${JSON.stringify(bodyObject, null, 2)}
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		log.Fatal(err)
	}
	req.Body = ioutil.NopCloser(bytes.NewReader(jsonPayload))
	` : ''}


	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Status Code:", resp.StatusCode)
	fmt.Println("Response Body:", string(body))
}
                `.trim();
                break;
            case 'curl':
                let curlBody = '';
                if (selectedEndpoint.method !== 'GET' && Object.keys(bodyObject).length > 0) {
                    curlBody = `-d '${JSON.stringify(bodyObject)}'`;
                }
                const curlHeaders = Object.entries(headersObject).map(([key, value]) => `-H '${key}: ${value}'`).join(' ');
                snippet = `
curl -X ${selectedEndpoint.method} \\
  ${curlHeaders} \\
  ${curlBody} \\
  '${finalUrl}'
                `.trim();
                break;
            default:
                snippet = `Generation not supported for ${selectedLanguage}`;
                break;
        }
        setGeneratedCode(snippet);
    };

    return (
        <Card title="Code Snippet Generator" className="mb-6">
            <div className="space-y-6">
                <div>
                    <label className="block text-gray-300 text-sm font-bold mb-2">Target Environment</label>
                    <input
                        type="text"
                        value={currentEnv ? `${currentEnv.name} (${currentEnv.region})` : 'No environment selected'}
                        readOnly
                        className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 cursor-not-allowed"
                        disabled={true}
                    />
                    {!selectedEnvironmentId && <p className="text-sm text-yellow-400 mt-1">Select an environment to get a more accurate base URL.</p>}
                </div>
                <div>
                    <label htmlFor="endpoint-select" className="block text-gray-300 text-sm font-bold mb-2">API Endpoint</label>
                    <select
                        id="endpoint-select"
                        value={selectedEndpoint?.id || ''}
                        onChange={e => setSelectedEndpoint(MOCK_API_ENDPOINTS.find(ep => ep.id === e.target.value) || null)}
                        className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500"
                    >
                        {MOCK_API_ENDPOINTS.map(ep => (
                            <option key={ep.id} value={ep.id}>{ep.method} {ep.path} - {ep.description}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="language-select" className="block text-gray-300 text-sm font-bold mb-2">Language</label>
                    <select
                        id="language-select"
                        value={selectedLanguage}
                        onChange={e => setSelectedLanguage(e.target.value as CodeSnippetConfig['language'])}
                        className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500"
                    >
                        <option value="javascript">JavaScript (Fetch)</option>
                        <option value="python">Python (requests)</option>
                        <option value="go">Go (net/http)</option>
                        <option value="curl">cURL</option>
                    </select>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[45%]">
                        <label htmlFor="custom-headers" className="block text-gray-300 text-sm font-bold mb-2">Custom Headers (JSON)</label>
                        <textarea
                            id="custom-headers"
                            value={customHeaders}
                            onChange={e => setCustomHeaders(e.target.value)}
                            rows={4}
                            className="w-full bg-gray-700/50 p-2 rounded text-white font-mono text-sm border border-gray-600 focus:border-cyan-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Ensure Authorization header if endpoint is secured.</p>
                    </div>
                    <div className="flex-1 min-w-[45%]">
                        <label htmlFor="custom-query-params" className="block text-gray-300 text-sm font-bold mb-2">Query Parameters (URL encoded string or key=value&key2=value2)</label>
                        <textarea
                            id="custom-query-params"
                            value={customQueryParams}
                            onChange={e => setCustomQueryParams(e.target.value)}
                            rows={4}
                            placeholder="e.g., limit=10&offset=0"
                            className="w-full bg-gray-700/50 p-2 rounded text-white font-mono text-sm border border-gray-600 focus:border-cyan-500"
                        />
                    </div>
                </div>

                {(selectedEndpoint?.method === 'POST' || selectedEndpoint?.method === 'PUT' || selectedEndpoint?.method === 'PATCH') && (
                    <div>
                        <label htmlFor="custom-body" className="block text-gray-300 text-sm font-bold mb-2">Request Body (JSON)</label>
                        <textarea
                            id="custom-body"
                            value={customBody}
                            onChange={e => setCustomBody(e.target.value)}
                            rows={8}
                            className="w-full bg-gray-700/50 p-2 rounded text-white font-mono text-sm border border-gray-600 focus:border-cyan-500"
                        />
                    </div>
                )}

                <Card title="Generated Code Snippet" className="mt-4">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-gray-900/50 p-4 rounded max-h-96 overflow-auto border border-gray-700">
                        {generatedCode}
                    </pre>
                </Card>
            </div>
        </Card>
    );
};

// 13. Sandbox Overview Header (Extracted from original)
export const SandboxHeader: React.FC<{ onOpenDataGen: () => void }> = ({ onOpenDataGen }) => {
    const { environments } = useSandbox();
    const activeEnvironments = environments.filter(env => env.status === 'Active').length;

    // Simulate metrics based on total environments and mock data
    const totalApiCalls = MOCK_ENVIRONMENTS.length * getRandomInt(100000, 500000); // More realistic range
    const avgResponseTime = getRandomFloat(30, 80);
    const errorRate = getRandomFloat(0.005, 0.05);

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white tracking-wider">Developer Sandbox</h2>
                <button onClick={onOpenDataGen} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors">
                    AI Test Data Generator
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card className="text-center">
                    <p className="text-3xl font-bold text-white">{activeEnvironments}</p>
                    <p className="text-sm text-gray-400 mt-1">Active Environments</p>
                </Card>
                <Card className="text-center">
                    <p className="text-3xl font-bold text-white">{(totalApiCalls / 1_000_000).toFixed(1)}M</p>
                    <p className="text-sm text-gray-400 mt-1">API Calls (24h)</p>
                </Card>
                <Card className="text-center">
                    <p className="text-3xl font-bold text-white">{avgResponseTime.toFixed(0)}ms</p>
                    <p className="text-sm text-gray-400 mt-1">Avg. Response Time</p>
                </Card>
                <Card className="text-center">
                    <p className="text-3xl font-bold text-white">{errorRate.toFixed(2)}%</p>
                    <p className="text-sm text-gray-400 mt-1">Error Rate</p>
                </Card>
            </div>
        </>
    );
};


// --- Main Sandbox View Component ---

const SandboxView: React.FC = () => {
    const { selectedEnvironmentId, setSelectedEnvironmentId } = useSandbox();
    const { environments } = useSandbox();

    const [isDataGenOpen, setDataGenOpen] = useState(false);
    const [isCreateEnvModalOpen, setCreateEnvModalOpen] = useState(false);
    const [editingEnvironment, setEditingEnvironment] = useState<SandboxEnvironment | null>(null);

    const handleSelectEnvironment = (id: string) => {
        setSelectedEnvironmentId(id);
    };

    const handleBackToEnvironments = () => {
        setSelectedEnvironmentId(null);
    };

    const handleOpenCreateEnv = () => {
        setEditingEnvironment(null);
        setCreateEnvModalOpen(true);
    };

    const handleOpenEditEnv = (env: SandboxEnvironment) => {
        setEditingEnvironment(env);
        setCreateEnvModalOpen(true);
    };

    const currentEnvironment = useMemo(() => {
        return environments.find(env => env.id === selectedEnvironmentId);
    }, [selectedEnvironmentId, environments]);

    if (selectedEnvironmentId && currentEnvironment) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-700 mb-6">
                    <button onClick={handleBackToEnvironments} className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        <span className="text-sm font-medium">Back to Environments</span>
                    </button>
                    <h2 className="text-3xl font-bold text-white tracking-wider">{currentEnvironment.name}</h2>
                    <div className="w-fit"></div> {/* Spacer to balance flex */}
                </div>
                <EnvironmentDetail environment={currentEnvironment} onClose={handleBackToEnvironments} />
                <APIRequestTester />
                <CodeSnippetGenerator />
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                <SandboxHeader onOpenDataGen={() => setDataGenOpen(true)} />
                <EnvironmentsTable
                    onSelectEnv={handleSelectEnvironment}
                    onCreateEnv={handleOpenCreateEnv}
                    onEditEnv={handleOpenEditEnv}
                    onDeleteEnv={() => { /* Handled by EnvironmentDetail now, or implement confirm here */ }}
                />
            </div>
            {isDataGenOpen && <AIDataGeneratorModal isOpen={isDataGenOpen} onClose={() => setDataGenOpen(false)} />}
            {isCreateEnvModalOpen && <EnvironmentForm environment={editingEnvironment} onClose={() => setCreateEnvModalOpen(false)} />}
        </>
    );
};

// Wrap the main SandboxView with the provider
const WrappedSandboxView: React.FC = () => (
    <SandboxProvider>
        <SandboxView />
    </SandboxProvider>
);

export default WrappedSandboxView;