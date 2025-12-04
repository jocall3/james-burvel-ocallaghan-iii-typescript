// components/views/platform/DemoBankApiManagementView.tsx
import React, { useState, useMemo, useCallback, useEffect, useReducer } from 'react';
import Card from '../../Card';
import { GoogleGenAI } from "@google/genai";

// --- START OF NEW CODE ---

// SECTION 1: TYPES AND INTERFACES
// =================================

export type ApiStatus = 'active' | 'inactive' | 'deprecated' | 'development';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export type AuthType = 'API_KEY' | 'OAUTH2' | 'JWT' | 'NONE';
export type PlanTier = 'free' | 'pro' | 'enterprise';

export interface ApiEndpoint {
    id: string;
    path: string;
    method: HttpMethod;
    summary: string;
    description: string;
    parameters: Array<{ name: string; in: 'query' | 'header' | 'path' | 'cookie'; description: string; required: boolean; schema: { type: string; }; }>;
    responses: Record<string, { description: string; content?: any }>;
}

export interface ApiVersion {
    id: string;
    version: string;
    status: 'active' | 'beta' | 'deprecated';
    releaseDate: Date;
    changelog: string;
    openapiSpec: string;
}

export interface ApiKey {
    id: string;
    key: string;
    name: string;
    createdAt: Date;
    lastUsed: Date | null;
    status: 'active' | 'revoked';
    permissions: string[];
    rateLimit: number; // requests per minute
    quota: number; // requests per month
    tier: PlanTier;
}

export interface ApiLog {
    id: string;
    timestamp: Date;
    method: HttpMethod;
    path: string;
    statusCode: number;
    responseTime: number; // in ms
    ipAddress: string;
    apiKeyId?: string;
    requestBody?: string;
    responseBody?: string;
    level: LogLevel;
}

export interface AnalyticsDataPoint {
    date: string; // YYYY-MM-DD HH:MM
    requests: number;
    errors: number;
    latency: number; // average latency in ms
}

export interface ApiResource {
    id: string;
    name:string;
    description: string;
    baseURL: string;
    status: ApiStatus;
    createdAt: Date;
    updatedAt: Date;
    ownerId: string;
    authType: AuthType;
    endpoints: ApiEndpoint[];
    versions: ApiVersion[];
    keys: ApiKey[];
    logs: ApiLog[];
    analytics: {
        last24h: AnalyticsDataPoint[];
        last7d: AnalyticsDataPoint[];
        last30d: AnalyticsDataPoint[];
    };
    rateLimiting: Record<PlanTier, { limit: number; period: 'minute' | 'hour' | 'day' }>;
    ipWhitelist: string[];
    ipBlacklist: string[];
}

// SECTION 2: UTILITY FUNCTIONS
// =================================

export const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    };
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(date);
};

export const timeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

export const truncateString = (str: string, num: number): string => {
    if (str.length <= num) {
        return str;
    }
    return str.slice(0, num) + '...';
};

export const getStatusColor = (status: ApiStatus): string => {
    switch (status) {
        case 'active': return 'bg-green-500';
        case 'inactive': return 'bg-gray-500';
        case 'deprecated': return 'bg-yellow-500';
        case 'development': return 'bg-blue-500';
        default: return 'bg-gray-500';
    }
};

export const getMethodColor = (method: HttpMethod): string => {
    switch (method) {
        case 'GET': return 'text-cyan-400';
        case 'POST': return 'text-green-400';
        case 'PUT': return 'text-yellow-400';
        case 'DELETE': return 'text-red-400';
        case 'PATCH': return 'text-orange-400';
        default: return 'text-gray-400';
    }
};

export const getStatusCodeColor = (code: number): string => {
    if (code >= 200 && code < 300) return 'text-green-400';
    if (code >= 300 && code < 400) return 'text-yellow-400';
    if (code >= 400 && code < 500) return 'text-orange-400';
    if (code >= 500) return 'text-red-400';
    return 'text-gray-400';
};

// SECTION 3: MOCK DATA GENERATION
// =================================

const MOCK_NAMES = ['Customer API', 'Transactions API', 'Authentication Service', 'Product Catalog', 'Internal Analytics', 'Partner Integration Gateway'];
const MOCK_DESCRIPTIONS = [
    'Manages customer data, including profiles, addresses, and contact information.',
    'Processes financial transactions, including payments, refunds, and transfers.',
    'Handles user authentication and authorization using JWTs and OAuth2.',
    'Provides access to the full product catalog, including pricing and inventory.',
    'Collects and reports on internal application metrics and user behavior.',
    'A secure gateway for third-party partner integrations.'
];
const MOCK_PATHS = ['/users', '/users/{id}', '/products', '/products/{id}/reviews', '/orders', '/orders/{id}', '/auth/token'];
const MOCK_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE'];
const MOCK_IPS = ['192.168.1.1', '10.0.0.5', '172.16.31.42', '203.0.113.195', '8.8.8.8'];

export const generateMockAnalytics = (period: '24h' | '7d' | '30d'): AnalyticsDataPoint[] => {
    const data: AnalyticsDataPoint[] = [];
    let points, interval;
    if (period === '24h') {
        points = 24;
        interval = 60 * 60 * 1000; // 1 hour
    } else if (period === '7d') {
        points = 7;
        interval = 24 * 60 * 60 * 1000; // 1 day
    } else {
        points = 30;
        interval = 24 * 60 * 60 * 1000; // 1 day
    }
    
    const now = new Date();
    for (let i = points - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * interval);
        const requests = Math.floor(Math.random() * 1000) + 50;
        const errors = Math.floor(requests * (Math.random() * 0.1));
        const latency = Math.floor(Math.random() * 200) + 50;
        data.push({
            date: date.toISOString().slice(0, 16).replace('T', ' '),
            requests,
            errors,
            latency
        });
    }
    return data;
};

export const generateMockLogs = (count: number, apiKeys: ApiKey[]): ApiLog[] => {
    const logs: ApiLog[] = [];
    const now = new Date().getTime();
    for (let i = 0; i < count; i++) {
        const method = MOCK_METHODS[Math.floor(Math.random() * MOCK_METHODS.length)];
        const statusCode = [200, 201, 400, 401, 404, 500][Math.floor(Math.random() * 6)];
        logs.push({
            id: generateUUID(),
            timestamp: new Date(now - i * (Math.random() * 60000)),
            method,
            path: MOCK_PATHS[Math.floor(Math.random() * MOCK_PATHS.length)],
            statusCode,
            responseTime: Math.floor(Math.random() * 500) + 20,
            ipAddress: MOCK_IPS[Math.floor(Math.random() * MOCK_IPS.length)],
            apiKeyId: apiKeys.length > 0 ? apiKeys[Math.floor(Math.random() * apiKeys.length)].id : undefined,
            level: statusCode >= 400 ? 'error' : 'info',
            requestBody: method === 'POST' || method === 'PUT' ? JSON.stringify({ data: 'mock' }) : undefined,
            responseBody: JSON.stringify({ result: 'success' }),
        });
    }
    return logs;
};

export const generateMockApiKeys = (count: number): ApiKey[] => {
    const keys: ApiKey[] = [];
    const tiers: PlanTier[] = ['free', 'pro', 'enterprise'];
    for (let i = 0; i < count; i++) {
        const tier = tiers[i % tiers.length];
        let rateLimit, quota;
        if (tier === 'free') { rateLimit = 60; quota = 10000; }
        else if (tier === 'pro') { rateLimit = 600; quota = 100000; }
        else { rateLimit = 6000; quota = 1000000; }

        keys.push({
            id: generateUUID(),
            key: `sk_live_${generateUUID().replace(/-/g, '')}`,
            name: `Key ${i + 1} (${tier})`,
            createdAt: new Date(new Date().getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            lastUsed: Math.random() > 0.2 ? new Date(new Date().getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
            status: Math.random() > 0.1 ? 'active' : 'revoked',
            permissions: ['read:users', 'write:orders'],
            rateLimit,
            quota,
            tier
        });
    }
    return keys;
};

export const generateMockEndpoints = (count: number): ApiEndpoint[] => {
    const endpoints: ApiEndpoint[] = [];
    for (let i = 0; i < count; i++) {
        endpoints.push({
            id: generateUUID(),
            path: MOCK_PATHS[i % MOCK_PATHS.length],
            method: MOCK_METHODS[i % MOCK_METHODS.length],
            summary: `Endpoint ${i + 1} summary`,
            description: `A more detailed description for endpoint ${i + 1}.`,
            parameters: [{ name: 'id', in: 'path', description: 'Resource ID', required: true, schema: { type: 'string' } }],
            responses: {
                '200': { description: 'Success' },
                '404': { description: 'Not Found' }
            }
        });
    }
    return endpoints;
};

export const generateMockApiData = (count: number): ApiResource[] => {
    const data: ApiResource[] = [];
    const statuses: ApiStatus[] = ['active', 'inactive', 'deprecated', 'development'];
    for (let i = 0; i < count; i++) {
        const keys = generateMockApiKeys(Math.floor(Math.random() * 10) + 2);
        data.push({
            id: generateUUID(),
            name: MOCK_NAMES[i % MOCK_NAMES.length],
            description: MOCK_DESCRIPTIONS[i % MOCK_DESCRIPTIONS.length],
            baseURL: `https://api.demobank.com/v${i + 1}`,
            status: statuses[i % statuses.length],
            createdAt: new Date(new Date().getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
            ownerId: `user-${i}`,
            authType: 'API_KEY',
            endpoints: generateMockEndpoints(Math.floor(Math.random() * 5) + 3),
            versions: [
                { id: generateUUID(), version: '1.0.0', status: 'active', releaseDate: new Date(), changelog: 'Initial release', openapiSpec: 'openapi: 3.0.0\ninfo:\n  title: Sample API\n  version: 1.0.0\npaths:\n  /users:\n    get:\n      summary: Get all users\n      responses:\n        \'200\':\n          description: A list of users.' }
            ],
            keys,
            logs: generateMockLogs(100, keys),
            analytics: {
                last24h: generateMockAnalytics('24h'),
                last7d: generateMockAnalytics('7d'),
                last30d: generateMockAnalytics('30d'),
            },
            rateLimiting: {
                free: { limit: 60, period: 'minute' },
                pro: { limit: 600, period: 'minute' },
                enterprise: { limit: 6000, period: 'minute' },
            },
            ipWhitelist: ['203.0.113.0/24'],
            ipBlacklist: ['198.51.100.10'],
        });
    }
    return data;
};


// SECTION 4: HELPER & UI COMPONENTS
// =================================

// Note: In a real-world application, these would be in separate files.
// For this exercise, they are included here.

export const StatCard: React.FC<{ title: string; value: string | number; change?: string; changeType?: 'increase' | 'decrease' }> = ({ title, value, change, changeType }) => {
    const changeColor = changeType === 'increase' ? 'text-green-400' : 'text-red-400';
    return (
        <div className="bg-gray-800/50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-400">{title}</h3>
            <p className="text-2xl font-semibold text-white mt-1">{value}</p>
            {change && (
                <p className={`text-xs mt-1 ${changeColor}`}>
                    {changeType === 'increase' ? '▲' : '▼'} {change} vs last period
                </p>
            )}
        </div>
    );
};

// A very basic chart component placeholder. A real app would use a library like Recharts or Chart.js.
export const SimpleLineChart: React.FC<{ data: AnalyticsDataPoint[]; dataKey: 'requests' | 'errors' | 'latency'; title: string }> = ({ data, dataKey, title }) => {
    const maxValue = useMemo(() => Math.max(...data.map(p => p[dataKey])), [data, dataKey]);
    const points = useMemo(() => data.map((p, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (p[dataKey] / maxValue) * 100;
        return `${x},${y}`;
    }).join(' '), [data, dataKey, maxValue]);

    return (
        <Card title={title}>
            <div className="h-64 w-full">
                <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                    <polyline
                        fill="none"
                        stroke="currentColor"
                        className="text-cyan-400"
                        strokeWidth="1"
                        points={points}
                    />
                </svg>
            </div>
        </Card>
    );
};


export const ApiTable: React.FC<{ apis: ApiResource[]; onSelectApi: (api: ApiResource) => void; }> = ({ apis, onSelectApi }) => {
    return (
        <Card title="Managed APIs">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Base URL</th>
                            <th scope="col" className="px-6 py-3">Endpoints</th>
                            <th scope="col" className="px-6 py-3">Last Updated</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {apis.map(api => (
                            <tr key={api.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                                <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{api.name}</th>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(api.status)}`}>
                                        {api.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono">{truncateString(api.baseURL, 30)}</td>
                                <td className="px-6 py-4">{api.endpoints.length}</td>
                                <td className="px-6 py-4">{timeAgo(api.updatedAt)}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => onSelectApi(api)} className="font-medium text-cyan-500 hover:underline">Manage</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export const LogViewer: React.FC<{ logs: ApiLog[] }> = ({ logs }) => {
    const [filter, setFilter] = useState('');
    const filteredLogs = useMemo(() => logs.filter(log => 
        log.path.includes(filter) || 
        log.statusCode.toString().includes(filter) ||
        log.ipAddress.includes(filter)
    ), [logs, filter]);

    return (
        <div className="space-y-4">
            <input
                type="text"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="Filter logs by path, status code, or IP..."
                className="w-full bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
            />
            <div className="font-mono text-xs text-gray-300 bg-gray-900/50 p-4 rounded max-h-[600px] overflow-auto">
                {filteredLogs.map(log => (
                    <div key={log.id} className="flex items-center space-x-4 py-1 border-b border-gray-700/50 last:border-b-0">
                        <span className="text-gray-500">{formatDate(log.timestamp, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        <span className={`font-bold w-16 ${getMethodColor(log.method)}`}>{log.method}</span>
                        <span className={`font-bold w-12 ${getStatusCodeColor(log.statusCode)}`}>{log.statusCode}</span>
                        <span className="flex-1 text-white">{log.path}</span>
                        <span className="w-24 text-gray-400">{log.ipAddress}</span>
                        <span className="w-20 text-right">{log.responseTime}ms</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const ApiKeyManager: React.FC<{ keys: ApiKey[]; onGenerate: (name: string, tier: PlanTier) => void; onRevoke: (id: string) => void; }> = ({ keys, onGenerate, onRevoke }) => {
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyTier, setNewKeyTier] = useState<PlanTier>('free');

    const handleGenerateClick = () => {
        if (newKeyName.trim()) {
            onGenerate(newKeyName.trim(), newKeyTier);
            setNewKeyName('');
        }
    };
    
    return (
        <div className="space-y-6">
            <Card title="Generate New API Key">
                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        value={newKeyName}
                        onChange={e => setNewKeyName(e.target.value)}
                        placeholder="Key Name (e.g., 'My Web App')"
                        className="flex-grow bg-gray-700/50 p-3 rounded text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                    />
                    <select
                        value={newKeyTier}
                        onChange={e => setNewKeyTier(e.target.value as PlanTier)}
                        className="bg-gray-700/50 p-3 rounded text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                    >
                        <option value="free">Free Tier</option>
                        <option value="pro">Pro Tier</option>
                        <option value="enterprise">Enterprise Tier</option>
                    </select>
                    <button onClick={handleGenerateClick} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors">
                        Generate Key
                    </button>
                </div>
            </Card>
            <Card title="Active API Keys">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Key (prefix)</th>
                                <th scope="col" className="px-6 py-3">Tier</th>
                                <th scope="col" className="px-6 py-3">Created</th>
                                <th scope="col" className="px-6 py-3">Last Used</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {keys.map(key => (
                                <tr key={key.id} className="border-b border-gray-700">
                                    <td className="px-6 py-4 text-white">{key.name}</td>
                                    <td className="px-6 py-4 font-mono">{key.key.substring(0, 12)}...</td>
                                    <td className="px-6 py-4">{key.tier}</td>
                                    <td className="px-6 py-4">{formatDate(key.createdAt, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                    <td className="px-6 py-4">{key.lastUsed ? timeAgo(key.lastUsed) : 'Never'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${key.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}>
                                            {key.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {key.status === 'active' && (
                                            <button onClick={() => onRevoke(key.id)} className="font-medium text-red-500 hover:underline">Revoke</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};


// SECTION 5: API DETAIL VIEW & TABS
// ===================================
type ApiDetailTab = 'overview' | 'endpoints' | 'analytics' | 'logs' | 'keys' | 'settings';

export const ApiDetailView: React.FC<{ api: ApiResource; onBack: () => void; onUpdateApi: (updatedApi: ApiResource) => void; }> = ({ api, onBack, onUpdateApi }) => {
    const [activeTab, setActiveTab] = useState<ApiDetailTab>('overview');

    const handleGenerateKey = (name: string, tier: PlanTier) => {
        let rateLimit, quota;
        if (tier === 'free') { rateLimit = 60; quota = 10000; }
        else if (tier === 'pro') { rateLimit = 600; quota = 100000; }
        else { rateLimit = 6000; quota = 1000000; }

        const newKey: ApiKey = {
            id: generateUUID(),
            key: `sk_live_${generateUUID().replace(/-/g, '')}`,
            name,
            createdAt: new Date(),
            lastUsed: null,
            status: 'active',
            permissions: ['read:*', 'write:*'],
            rateLimit,
            quota,
            tier,
        };
        const updatedApi = { ...api, keys: [...api.keys, newKey] };
        onUpdateApi(updatedApi);
    };

    const handleRevokeKey = (id: string) => {
        const updatedApi = {
            ...api,
            keys: api.keys.map(k => k.id === id ? { ...k, status: 'revoked' } : k),
        };
        onUpdateApi(updatedApi);
    };
    
    const tabs: { id: ApiDetailTab; label: string }[] = [
        { id: 'overview', label: 'Overview' },
        { id: 'endpoints', label: 'Endpoints' },
        { id: 'analytics', label: 'Analytics' },
        { id: 'logs', label: 'Logs' },
        { id: 'keys', label: 'API Keys' },
        { id: 'settings', label: 'Settings' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <button onClick={onBack} className="text-cyan-400 hover:text-cyan-300 mb-4">&larr; Back to All APIs</button>
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">{api.name}</h2>
                    <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(api.status)}`}>
                            {api.status}
                        </span>
                    </div>
                </div>
                <p className="text-gray-400 mt-2">{api.description}</p>
            </div>
            
            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${
                                activeTab === tab.id
                                    ? 'border-cyan-500 text-cyan-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="mt-6">
                {activeTab === 'overview' && <ApiOverviewTab api={api} />}
                {activeTab === 'endpoints' && <ApiEndpointsTab api={api} />}
                {activeTab === 'analytics' && <ApiAnalyticsTab api={api} />}
                {activeTab === 'logs' && <LogViewer logs={api.logs} />}
                {activeTab === 'keys' && <ApiKeyManager keys={api.keys} onGenerate={handleGenerateKey} onRevoke={handleRevokeKey} />}
                {activeTab === 'settings' && <ApiSettingsTab api={api} onUpdateApi={onUpdateApi}/>}
            </div>
        </div>
    );
};

export const ApiOverviewTab: React.FC<{ api: ApiResource }> = ({ api }) => {
    const totalRequests = useMemo(() => api.analytics.last30d.reduce((sum, p) => sum + p.requests, 0), [api.analytics]);
    const errorRate = useMemo(() => {
        const totalErrors = api.analytics.last30d.reduce((sum, p) => sum + p.errors, 0);
        return totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) + '%' : '0%';
    }, [api.analytics, totalRequests]);
    const avgLatency = useMemo(() => {
        const totalLatency = api.analytics.last30d.reduce((sum, p) => sum + p.latency * p.requests, 0);
        return totalRequests > 0 ? (totalLatency / totalRequests).toFixed(0) + 'ms' : '0ms';
    }, [api.analytics, totalRequests]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Requests (30d)" value={totalRequests.toLocaleString()} />
            <StatCard title="Error Rate (30d)" value={errorRate} />
            <StatCard title="Avg Latency (30d)" value={avgLatency} />
            <StatCard title="Active Keys" value={api.keys.filter(k => k.status === 'active').length} />
            <div className="lg:col-span-4">
                <SimpleLineChart data={api.analytics.last7d} dataKey="requests" title="Requests (Last 7 Days)" />
            </div>
        </div>
    );
};

export const ApiEndpointsTab: React.FC<{ api: ApiResource }> = ({ api }) => {
    return (
        <Card title="API Endpoints">
            <div className="space-y-4">
                {api.endpoints.map(endpoint => (
                    <div key={endpoint.id} className="p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center space-x-4">
                            <span className={`text-sm font-bold w-16 text-center py-1 rounded ${getMethodColor(endpoint.method).replace('text', 'bg').replace('-400', '-600')}`}>{endpoint.method}</span>
                            <span className="font-mono text-white">{endpoint.path}</span>
                        </div>
                        <p className="text-gray-400 text-sm mt-2 ml-20">{endpoint.summary}</p>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export const ApiAnalyticsTab: React.FC<{ api: ApiResource }> = ({ api }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SimpleLineChart data={api.analytics.last24h} dataKey="requests" title="Requests (Last 24 Hours)" />
            <SimpleLineChart data={api.analytics.last24h} dataKey="errors" title="Errors (Last 24 Hours)" />
            <SimpleLineChart data={api.analytics.last7d} dataKey="latency" title="Average Latency (Last 7 Days)" />
            <SimpleLineChart data={api.analytics.last30d} dataKey="requests" title="Requests (Last 30 Days)" />
        </div>
    );
};

export const ApiSettingsTab: React.FC<{ api: ApiResource; onUpdateApi: (updatedApi: ApiResource) => void; }> = ({ api, onUpdateApi }) => {
    const [name, setName] = useState(api.name);
    const [description, setDescription] = useState(api.description);
    const [baseURL, setBaseURL] = useState(api.baseURL);
    const [status, setStatus] = useState(api.status);
    
    const handleSave = () => {
        onUpdateApi({
            ...api,
            name,
            description,
            baseURL,
            status,
            updatedAt: new Date()
        });
        // In a real app, you would probably show a success toast here.
    };

    return (
        <div className="space-y-8">
            <Card title="General Settings">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">API Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-700/50 p-2 rounded text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-gray-700/50 p-2 rounded text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Base URL</label>
                        <input type="text" value={baseURL} onChange={e => setBaseURL(e.target.value)} className="w-full bg-gray-700/50 p-2 rounded text-white font-mono" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value as ApiStatus)} className="w-full bg-gray-700/50 p-2 rounded text-white">
                            <option value="active">Active</option>
                            <option value="development">Development</option>
                            <option value="inactive">Inactive</option>
                            <option value="deprecated">Deprecated</option>
                        </select>
                    </div>
                    <div className="pt-2">
                        <button onClick={handleSave} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg">Save Changes</button>
                    </div>
                </div>
            </Card>
            <Card title="Danger Zone">
                <div className="p-4 border border-red-500/50 rounded-lg space-y-4">
                    <div>
                        <h4 className="text-red-400 font-semibold">Delete this API</h4>
                        <p className="text-gray-400 text-sm mt-1">Once you delete an API, there is no going back. Please be certain.</p>
                    </div>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg">Delete API</button>
                </div>
            </Card>
        </div>
    );
};

// SECTION 6: MAIN APPLICATION STATE AND REDUCER
// ===============================================

type AppState = {
    view: 'dashboard' | 'api_detail';
    apis: ApiResource[];
    selectedApiId: string | null;
    isLoading: boolean;
    error: string | null;
};

type AppAction =
    | { type: 'SET_VIEW'; payload: 'dashboard' | 'api_detail' }
    | { type: 'SET_APIS'; payload: ApiResource[] }
    | { type: 'SELECT_API'; payload: string | null }
    | { type: 'UPDATE_API'; payload: ApiResource }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null };

export const appReducer = (state: AppState, action: AppAction): AppState => {
    switch (action.type) {
        case 'SET_VIEW':
            return { ...state, view: action.payload };
        case 'SET_APIS':
            return { ...state, apis: action.payload };
        case 'SELECT_API':
            return { ...state, selectedApiId: action.payload, view: action.payload ? 'api_detail' : 'dashboard' };
        case 'UPDATE_API':
            return {
                ...state,
                apis: state.apis.map(api => api.id === action.payload.id ? action.payload : api)
            };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        default:
            return state;
    }
};

// --- END OF NEW CODE ---


const DemoBankApiManagementView: React.FC = () => {
    const [prompt, setPrompt] = useState("a GET endpoint at /users/{id} that returns a user object with id, name, and email fields");
    const [generatedSpec, setGeneratedSpec] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // --- START OF NEW/MODIFIED CODE ---
    const initialState: AppState = {
        view: 'dashboard',
        apis: [],
        selectedApiId: null,
        isLoading: true,
        error: null
    };

    const [state, dispatch] = useReducer(appReducer, initialState);

    useEffect(() => {
        // Simulate fetching initial data
        dispatch({ type: 'SET_LOADING', payload: true });
        setTimeout(() => {
            dispatch({ type: 'SET_APIS', payload: generateMockApiData(5) });
            dispatch({ type: 'SET_LOADING', payload: false });
        }, 1500);
    }, []);

    const handleSelectApi = useCallback((api: ApiResource) => {
        dispatch({ type: 'SELECT_API', payload: api.id });
    }, []);

    const handleBackToDashboard = useCallback(() => {
        dispatch({ type: 'SELECT_API', payload: null });
    }, []);
    
    const handleUpdateApi = useCallback((updatedApi: ApiResource) => {
        dispatch({ type: 'UPDATE_API', payload: updatedApi });
    }, []);

    const selectedApi = useMemo(() => {
        return state.apis.find(api => api.id === state.selectedApiId) || null;
    }, [state.apis, state.selectedApiId]);
    
    const dashboardStats = useMemo(() => {
        const totalApis = state.apis.length;
        const activeApis = state.apis.filter(api => api.status === 'active').length;
        const totalRequests = state.apis.reduce((sum, api) => sum + api.analytics.last24h.reduce((s, p) => s + p.requests, 0), 0);
        const totalErrors = state.apis.reduce((sum, api) => sum + api.analytics.last24h.reduce((s, p) => s + p.errors, 0), 0);
        const errorRate = totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) + '%' : '0%';
        return { totalApis, activeApis, totalRequests, errorRate };
    }, [state.apis]);
    
    // --- END OF NEW/MODIFIED CODE ---

    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        setGeneratedSpec('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const fullPrompt = `Generate a simple OpenAPI 3.0 specification in YAML format for the following API endpoint: "${prompt}". Include a basic schema for the response. Do not include markdown fences.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt });
            setGeneratedSpec(response.text);
        } catch (error) {
            setError("Error: Could not generate OpenAPI spec. Please try a different prompt.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (state.isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <p className="text-white text-lg">Loading API Management Dashboard...</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank API Management</h2>
            
            {state.view === 'dashboard' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Total APIs" value={dashboardStats.totalApis} />
                        <StatCard title="Active APIs" value={dashboardStats.activeApis} />
                        <StatCard title="Total Requests (24h)" value={dashboardStats.totalRequests.toLocaleString()} />
                        <StatCard title="Overall Error Rate (24h)" value={dashboardStats.errorRate} />
                    </div>

                    <ApiTable apis={state.apis} onSelectApi={handleSelectApi} />

                    <Card title="AI OpenAPI Spec Generator">
                        <p className="text-gray-400 mb-4">Describe the API endpoint you want to create, and our AI will generate the OpenAPI 3.0 specification for it.</p>
                        <textarea
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            className="w-full h-24 bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="e.g., a POST endpoint at /login that takes a username and password and returns a JWT token"
                        />
                        <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors">
                            {isLoading ? 'Generating Spec...' : 'Generate Spec'}
                        </button>
                    </Card>

                    {(isLoading || generatedSpec || error) && (
                        <Card title="Generated OpenAPI Spec (YAML)">
                            {error && <p className="text-red-400">{error}</p>}
                            <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-gray-900/50 p-4 rounded max-h-96 overflow-auto">
                                {isLoading ? 'Generating...' : generatedSpec}
                            </pre>
                            {generatedSpec && !error && (
                                <div className="mt-4 flex space-x-4">
                                    <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg">Copy to Clipboard</button>
                                    <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg">Create New API from Spec</button>
                                </div>
                            )}
                        </Card>
                    )}
                </div>
            )}
            
            {state.view === 'api_detail' && selectedApi && (
                <ApiDetailView api={selectedApi} onBack={handleBackToDashboard} onUpdateApi={handleUpdateApi} />
            )}
        </div>
    );
};

export default DemoBankApiManagementView;
