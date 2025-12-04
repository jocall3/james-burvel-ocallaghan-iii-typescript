import React, { useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { 
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, 
    BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, CartesianGrid 
} from 'recharts';
import { 
    ChevronDownIcon, ChevronUpIcon, PencilIcon, TrashIcon, PlusIcon,
    MagnifyingGlassIcon, BellIcon, Cog6ToothIcon, ClockIcon, SparklesIcon,
    ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon, RocketLaunchIcon,
    CpuChipIcon, GlobeAltIcon, UserGroupIcon, ServerStackIcon, CodeBracketIcon,
    ScaleIcon, BeakerIcon, ChartBarIcon, DocumentTextIcon, CalendarDaysIcon, TagIcon
} from '@heroicons/react/24/outline'; // Adding more icons for richer UI
import { toast, Toaster } from 'react-hot-toast'; // For notifications

// --- Utility Types and Interfaces ---
interface ApiEndpoint {
    id: string;
    name: string;
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    description: string;
    owner: string;
    category: string;
    avgLatencyMs: number;
    errorRate: number;
    peakTrafficRPS: number;
    status: 'active' | 'deprecated' | 'experimental';
}

interface RateLimitPolicy {
    id: string;
    name: string;
    description: string;
    appliesTo: 'global' | 'endpoint' | 'user' | 'ip' | 'client_id';
    targetId?: string; // e.g., endpointId, userId, ipAddress
    limit: number; // requests per unit
    unit: 'second' | 'minute' | 'hour' | 'day';
    burstLimit?: number; // requests allowed over limit for short period
    windowSizeSeconds?: number; // For sliding window
    priority: number;
    status: 'active' | 'inactive' | 'pending';
    createdAt: string;
    updatedAt: string;
    isAdaptive: boolean;
    adaptiveModelId?: string;
    blockDurationSeconds?: number; // How long to block after hitting limit
    customRules?: string[]; // e.g. ["header:X-API-KEY-TYPE=premium", "body:user.tier=gold"]
}

interface ThrottlingEvent {
    id: string;
    timestamp: string;
    endpointId: string;
    clientIp: string;
    userId?: string;
    policyId: string;
    reason: string; // e.g., 'rate_limit_exceeded', 'burst_limit_exceeded', 'anomaly_detected'
    rateLimitValue: number;
    currentRPS: number;
    blocked: boolean;
    durationMs?: number; // how long the request took (if blocked later)
    tags: string[];
}

interface AnomalyDetectionConfig {
    id: string;
    name: string;
    description: string;
    target: 'global' | 'endpoint' | 'user' | 'ip';
    targetId?: string;
    modelType: 'statistical' | 'machine_learning' | 'heuristic';
    threshold: number; // e.g., standard deviations, confidence score
    alertSeverity: 'low' | 'medium' | 'high' | 'critical';
    alertChannels: string[]; // e.g., ['email', 'slack', 'pagerduty']
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

interface MlModel {
    id: string;
    name: string;
    version: string;
    type: 'regression' | 'classification' | 'clustering';
    algorithm: string;
    status: 'training' | 'deployed' | 'failed' | 'archived';
    performanceMetrics: {
        accuracy?: number;
        precision?: number;
        recall?: number;
        f1Score?: number;
        mse?: number;
        rSquared?: number;
    };
    trainingDataSize: number;
    lastTrained: string;
    deployedAt?: string;
    description: string;
    featuresUsed: string[];
    outputInterpretation: string; // How to interpret model's output (e.g., probability of abuse)
}

interface SimulationResult {
    id: string;
    name: string;
    timestamp: string;
    scenarioDescription: string;
    inputTrafficIncreasePercentage: number;
    predictedThrottledRequests: number;
    predictedLatencyIncreaseMs: number;
    impactedEndpoints: { endpointId: string; throttledIncrease: number; latencyIncrease: number }[];
    recommendations: string[];
    successRateAfterSimulation: number;
}

interface AuditLogEntry {
    id: string;
    timestamp: string;
    userId: string;
    action: string; // e.g., 'CREATE_POLICY', 'UPDATE_MODEL', 'DEACTIVATE_RULE'
    entityType: string; // e.g., 'RateLimitPolicy', 'MlModel', 'AnomalyDetectionConfig'
    entityId: string;
    oldValue: any;
    newValue: any;
    ipAddress: string;
}

interface CustomRuleSchema {
    id: string;
    name: string;
    description: string;
    language: 'javascript' | 'python' | 'lua' | 'cel'; // Common scripting languages for rule engines
    code: string;
    status: 'active' | 'inactive' | 'draft';
    createdAt: string;
    updatedAt: string;
    tags: string[];
    testCases: { input: any; expectedOutput: boolean; description: string }[];
}

// --- Mock Data Generators ---
const mockEndpoints: ApiEndpoint[] = Array.from({ length: 15 }).map((_, i) => ({
    id: `ep-${i + 1}`,
    name: `/${['users', 'products', 'orders', 'payments', 'analytics', 'auth', 'notifications', 'search', 'config', 'status', 'inventory', 'shipping', 'reviews', 'profile', 'billing'][i % 15]}${i % 3 === 0 ? '/:id' : ''}`,
    path: `/${['users', 'products', 'orders', 'payments', 'analytics', 'auth', 'notifications', 'search', 'config', 'status', 'inventory', 'shipping', 'reviews', 'profile', 'billing'][i % 15]}`,
    method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'][i % 5] as any,
    description: `API for managing ${['user', 'product', 'order', 'payment', 'analytic', 'authentication', 'notification', 'search', 'configuration', 'system status', 'inventory item', 'shipping detail', 'customer review', 'user profile', 'billing info'][i % 15]} data.`,
    owner: `team-${i % 3 + 1}`,
    category: ['core', 'data', 'utility', 'security'][i % 4],
    avgLatencyMs: Math.floor(Math.random() * 200) + 20,
    errorRate: parseFloat((Math.random() * 5).toFixed(2)),
    peakTrafficRPS: Math.floor(Math.random() * 2000) + 100,
    status: ['active', 'deprecated', 'experimental'][i % 3] as any,
}));

const mockRateLimitPolicies: RateLimitPolicy[] = Array.from({ length: 10 }).map((_, i) => ({
    id: `rlp-${i + 1}`,
    name: `Policy ${i + 1} - ${i % 3 === 0 ? 'Global' : mockEndpoints[i % mockEndpoints.length].name}`,
    description: `Rate limit policy for ${i % 3 === 0 ? 'all APIs' : mockEndpoints[i % mockEndpoints.length].name}.`,
    appliesTo: i % 3 === 0 ? 'global' : 'endpoint',
    targetId: i % 3 === 0 ? undefined : mockEndpoints[i % mockEndpoints.length].id,
    limit: (i + 1) * 100 + 50,
    unit: ['second', 'minute', 'hour'][i % 3] as any,
    burstLimit: i % 2 === 0 ? (i + 1) * 20 : undefined,
    windowSizeSeconds: i % 4 === 0 ? 60 : undefined,
    priority: i,
    status: ['active', 'inactive', 'pending'][i % 3] as any,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    isAdaptive: i % 2 === 0,
    adaptiveModelId: i % 2 === 0 ? `mlm-${i % 3 + 1}` : undefined,
    blockDurationSeconds: i % 3 === 0 ? 300 : undefined,
    customRules: i % 4 === 0 ? [`header:X-User-Tier=${['premium', 'enterprise'][i % 2]}`, `ip_range:192.168.1.${i}.0/24`] : [],
}));

const mockThrottlingEvents: ThrottlingEvent[] = Array.from({ length: 50 }).map((_, i) => ({
    id: `evt-${i + 1}`,
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    endpointId: mockEndpoints[i % mockEndpoints.length].id,
    clientIp: `192.168.${i % 255}.${i % 255}`,
    userId: i % 5 === 0 ? `user-${i % 10 + 1}` : undefined,
    policyId: mockRateLimitPolicies[i % mockRateLimitPolicies.length].id,
    reason: ['rate_limit_exceeded', 'burst_limit_exceeded', 'anomaly_detected', 'ip_blacklist'][i % 4],
    rateLimitValue: mockRateLimitPolicies[i % mockRateLimitPolicies.length].limit,
    currentRPS: mockRateLimitPolicies[i % mockRateLimitPolicies.length].limit + Math.floor(Math.random() * 50) + 1,
    blocked: true,
    durationMs: Math.floor(Math.random() * 500) + 10,
    tags: i % 3 === 0 ? ['critical', 'autoblock'] : [],
}));

const mockAnomalyConfigs: AnomalyDetectionConfig[] = Array.from({ length: 5 }).map((_, i) => ({
    id: `adcfg-${i + 1}`,
    name: `Anomaly Config ${i + 1} - ${i % 2 === 0 ? 'Global' : mockEndpoints[i % mockEndpoints.length].name}`,
    description: `Configuration for detecting anomalies.`,
    target: i % 2 === 0 ? 'global' : 'endpoint',
    targetId: i % 2 === 0 ? undefined : mockEndpoints[i % mockEndpoints.length].id,
    modelType: ['statistical', 'machine_learning', 'heuristic'][i % 3] as any,
    threshold: parseFloat((Math.random() * 3 + 1).toFixed(2)),
    alertSeverity: ['low', 'medium', 'high', 'critical'][i % 4] as any,
    alertChannels: ['email', 'slack', 'pagerduty'].slice(0, i % 3 + 1),
    status: ['active', 'inactive'][i % 2] as any,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
}));

const mockMlModels: MlModel[] = Array.from({ length: 7 }).map((_, i) => ({
    id: `mlm-${i + 1}`,
    name: `TrafficPredictor-${i % 3 + 1}`,
    version: `v1.${i}`,
    type: ['regression', 'classification'][i % 2] as any,
    algorithm: ['XGBoost', 'RandomForest', 'NeuralNetwork', 'IsolationForest'][i % 4],
    status: ['deployed', 'training', 'failed', 'archived'][i % 4] as any,
    performanceMetrics: {
        accuracy: i % 2 === 0 ? parseFloat((0.85 + Math.random() * 0.1).toFixed(2)) : undefined,
        mse: i % 2 !== 0 ? parseFloat((0.01 + Math.random() * 0.05).toFixed(3)) : undefined,
    },
    trainingDataSize: Math.floor(Math.random() * 1000000) + 50000,
    lastTrained: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    deployedAt: i % 2 === 0 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    description: `ML model for predicting API traffic patterns and identifying abusive behavior.`,
    featuresUsed: ['RPS', 'latency', 'error_rate', 'user_agent', 'geo_location', 'time_of_day'].slice(0, i % 6 + 1),
    outputInterpretation: i % 2 === 0 ? 'Probability of a request being abusive (0-1)' : 'Predicted optimal RPS limit',
}));

const mockSimulationResults: SimulationResult[] = Array.from({ length: 8 }).map((_, i) => ({
    id: `sim-${i + 1}`,
    name: `Scenario ${i + 1}`,
    timestamp: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
    scenarioDescription: `Simulated a ${i * 10 + 10}% traffic increase for 1 hour.`,
    inputTrafficIncreasePercentage: i * 10 + 10,
    predictedThrottledRequests: Math.floor(Math.random() * 10000) + 500,
    predictedLatencyIncreaseMs: Math.floor(Math.random() * 50) + 5,
    impactedEndpoints: mockEndpoints.slice(0, i % 5 + 1).map(ep => ({
        endpointId: ep.id,
        throttledIncrease: Math.floor(Math.random() * 1000) + 50,
        latencyIncrease: Math.floor(Math.random() * 20) + 2,
    })),
    recommendations: [`Adjust rate limit for ${mockEndpoints[i % mockEndpoints.length].name}`, `Scale up service capacity`, `Investigate traffic source`],
    successRateAfterSimulation: parseFloat((0.9 - Math.random() * 0.1).toFixed(2)),
}));

const mockAuditLogs: AuditLogEntry[] = Array.from({ length: 30 }).map((_, i) => ({
    id: `aud-${i + 1}`,
    timestamp: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
    userId: `admin_user_${i % 3 + 1}`,
    action: ['CREATE_POLICY', 'UPDATE_POLICY', 'DELETE_POLICY', 'DEPLOY_MODEL', 'DEACTIVATE_ANOMALY_RULE'][i % 5],
    entityType: ['RateLimitPolicy', 'MlModel', 'AnomalyDetectionConfig'][i % 3],
    entityId: `rlp-${i % mockRateLimitPolicies.length + 1}`,
    oldValue: i % 2 === 0 ? { status: 'inactive' } : null,
    newValue: i % 2 === 0 ? { status: 'active' } : { limit: (i + 1) * 100 },
    ipAddress: `192.168.1.${i % 255}`,
}));

const mockCustomRules: CustomRuleSchema[] = Array.from({ length: 5 }).map((_, i) => ({
    id: `crule-${i + 1}`,
    name: `Custom Rule ${i + 1} - ${['PremiumUserCheck', 'HighTrafficAlert', 'BotDetection', 'GeoBlocking'][i % 4]}`,
    description: `Custom rule for advanced traffic filtering or anomaly detection.`,
    language: ['javascript', 'lua', 'cel'][i % 3] as any,
    code: `
function evaluate(request) {
    if (request.headers['X-User-Tier'] === 'premium' && request.path.startsWith('/api/v1/data')) {
        return true; // Allow more requests for premium users on data endpoints
    }
    if (request.ip === '1.2.3.4') {
        return false; // Block specific IP
    }
    return true;
}
    `, // Example pseudo-code
    status: ['active', 'inactive', 'draft'][i % 3] as any,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['security', 'performance', 'custom'][i % 3],
    testCases: [
        { input: { headers: { 'X-User-Tier': 'premium' }, path: '/api/v1/data' }, expectedOutput: true, description: 'Premium user on data endpoint' },
        { input: { headers: { 'X-User-Tier': 'basic' }, path: '/api/v1/data' }, expectedOutput: false, description: 'Basic user on data endpoint' },
    ],
}));

// Mock data for live throttling events (for a real-time feed)
let liveEventCounter = 0;
const generateLiveThrottlingEvent = (): ThrottlingEvent => {
    liveEventCounter++;
    const endpoint = mockEndpoints[liveEventCounter % mockEndpoints.length];
    const policy = mockRateLimitPolicies[liveEventCounter % mockRateLimitPolicies.length];
    return {
        id: `live-evt-${Date.now()}-${liveEventCounter}`,
        timestamp: new Date().toISOString(),
        endpointId: endpoint.id,
        clientIp: `203.0.113.${liveEventCounter % 255}`,
        userId: liveEventCounter % 7 === 0 ? `live-user-${liveEventCounter % 20 + 1}` : undefined,
        policyId: policy.id,
        reason: ['rate_limit_exceeded', 'burst_limit_exceeded', 'anomaly_detected', 'ip_blacklist'][liveEventCounter % 4],
        rateLimitValue: policy.limit,
        currentRPS: policy.limit + Math.floor(Math.random() * 100) + 1,
        blocked: true,
        durationMs: Math.floor(Math.random() * 80) + 5,
        tags: liveEventCounter % 5 === 0 ? ['alert', 'high_impact'] : [],
    };
};

// --- Helper Components & Utilities (exported for modularity, but kept in one file for directive) ---

export const StatusIndicator: React.FC<{ status: string }> = ({ status }) => {
    let colorClass = '';
    let icon;
    switch (status.toLowerCase()) {
        case 'active':
        case 'deployed':
            colorClass = 'text-green-500';
            icon = <CheckCircleIcon className="h-4 w-4 inline-block mr-1" />;
            break;
        case 'inactive':
        case 'archived':
            colorClass = 'text-gray-500';
            icon = <InformationCircleIcon className="h-4 w-4 inline-block mr-1" />;
            break;
        case 'pending':
        case 'training':
        case 'experimental':
            colorClass = 'text-yellow-500';
            icon = <ExclamationTriangleIcon className="h-4 w-4 inline-block mr-1" />;
            break;
        case 'failed':
        case 'deprecated':
            colorClass = 'text-red-500';
            icon = <ExclamationTriangleIcon className="h-4 w-4 inline-block mr-1" />;
            break;
        default:
            colorClass = 'text-blue-500';
            icon = <InformationCircleIcon className="h-4 w-4 inline-block mr-1" />;
            break;
    }
    return (
        <span className={`flex items-center text-sm ${colorClass}`}>
            {icon} {status}
        </span>
    );
};

export const FilterSortPanel: React.FC<{
    filters: any;
    onFilterChange: (key: string, value: any) => void;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSortChange: (key: string) => void;
    availableFilters: { key: string; label: string; type: 'text' | 'select' | 'date-range'; options?: { value: string; label: string }[] }[];
    availableSorts: { key: string; label: string }[];
}> = ({ filters, onFilterChange, sortBy, sortOrder, onSortChange, availableFilters, availableSorts }) => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-inner mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Filter & Sort</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableFilters.map(filter => (
                    <div key={filter.key}>
                        <label htmlFor={filter.key} className="block text-sm font-medium text-gray-300 mb-1">
                            {filter.label}
                        </label>
                        {filter.type === 'text' && (
                            <input
                                type="text"
                                id={filter.key}
                                value={filters[filter.key] || ''}
                                onChange={e => onFilterChange(filter.key, e.target.value)}
                                className="block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder={`Search by ${filter.label.toLowerCase()}`}
                            />
                        )}
                        {filter.type === 'select' && (
                            <select
                                id={filter.key}
                                value={filters[filter.key] || ''}
                                onChange={e => onFilterChange(filter.key, e.target.value)}
                                className="block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                                <option value="">All {filter.label}</option>
                                {filter.options?.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        )}
                        {/* Add more filter types like date-range if needed for real application */}
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
                <h4 className="text-md font-medium text-gray-300 mb-2">Sort By</h4>
                <div className="flex flex-wrap gap-2">
                    {availableSorts.map(sort => (
                        <button
                            key={sort.key}
                            onClick={() => onSortChange(sort.key)}
                            className={`px-3 py-1 text-sm rounded-full ${sortBy === sort.key ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} transition-colors duration-200 flex items-center`}
                        >
                            {sort.label}
                            {sortBy === sort.key && (
                                sortOrder === 'asc' ? <ChevronUpIcon className="ml-1 h-4 w-4" /> : <ChevronDownIcon className="ml-1 h-4 w-4" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const PaginationControls: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
}> = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
    if (totalPages <= 1) return null;

    const pageNumbers = useMemo(() => {
        const pages = [];
        const maxPagesToShow = 5; // e.g., 1 ... 4 5 [6] 7 8 ... 10
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        if (startPage > 1) {
            pages.push(1);
            if (startPage > 2) pages.push('...');
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }

        return pages;
    }, [currentPage, totalPages]);

    return (
        <div className="flex justify-between items-center mt-6">
            <span className="text-sm text-gray-400">
                Showing {Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(totalItems, currentPage * itemsPerPage)} of {totalItems} items
            </span>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                {pageNumbers.map((page, index) =>
                    typeof page === 'string' ? (
                        <span key={index} className="relative inline-flex items-center px-4 py-2 border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400">
                            {page}
                        </span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            aria-current={page === currentPage ? 'page' : undefined}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium ${
                                page === currentPage
                                    ? 'z-10 bg-indigo-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                        >
                            {page}
                        </button>
                    )
                )}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </nav>
        </div>
    );
};

export const Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className={`relative bg-gray-800 rounded-lg shadow-xl ${sizeClasses[size]} w-full mx-auto my-8`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
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

// --- Form Components for Editing/Creating ---
export const RateLimitPolicyForm: React.FC<{
    initialData?: RateLimitPolicy;
    onSave: (policy: RateLimitPolicy) => void;
    onCancel: () => void;
    endpoints: ApiEndpoint[];
    mlModels: MlModel[];
}> = ({ initialData, onSave, onCancel, endpoints, mlModels }) => {
    const [policy, setPolicy] = useState<RateLimitPolicy>(
        initialData || {
            id: `new-rlp-${Date.now()}`,
            name: '',
            description: '',
            appliesTo: 'global',
            limit: 0,
            unit: 'minute',
            priority: 0,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isAdaptive: false,
            blockDurationSeconds: 300,
            customRules: [],
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setPolicy(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPolicy(prev => ({
            ...prev,
            [name]: value === '' ? 0 : parseInt(value, 10),
        }));
    };

    const handleCustomRulesChange = (index: number, value: string) => {
        const newRules = [...(policy.customRules || [])];
        newRules[index] = value;
        setPolicy(prev => ({ ...prev, customRules: newRules }));
    };

    const addCustomRule = () => {
        setPolicy(prev => ({ ...prev, customRules: [...(prev.customRules || []), ''] }));
    };

    const removeCustomRule = (index: number) => {
        const newRules = [...(policy.customRules || [])];
        newRules.splice(index, 1);
        setPolicy(prev => ({ ...prev, customRules: newRules }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...policy, updatedAt: new Date().toISOString() });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-gray-300">
            <div>
                <label htmlFor="name" className="block text-sm font-medium">Policy Name</label>
                <input type="text" name="name" id="name" value={policy.name} onChange={handleChange} required
                       className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium">Description</label>
                <textarea name="description" id="description" value={policy.description} onChange={handleChange} rows={3}
                          className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="appliesTo" className="block text-sm font-medium">Applies To</label>
                    <select name="appliesTo" id="appliesTo" value={policy.appliesTo} onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                        <option value="global">Global</option>
                        <option value="endpoint">Endpoint</option>
                        <option value="user">User</option>
                        <option value="ip">IP Address</option>
                        <option value="client_id">Client ID</option>
                    </select>
                </div>
                {policy.appliesTo === 'endpoint' && (
                    <div>
                        <label htmlFor="targetId" className="block text-sm font-medium">Target Endpoint</label>
                        <select name="targetId" id="targetId" value={policy.targetId || ''} onChange={handleChange} required
                                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                            <option value="">Select an endpoint</option>
                            {endpoints.map(ep => (
                                <option key={ep.id} value={ep.id}>{ep.name} ({ep.method})</option>
                            ))}
                        </select>
                    </div>
                )}
                {(policy.appliesTo === 'user' || policy.appliesTo === 'ip' || policy.appliesTo === 'client_id') && (
                    <div>
                        <label htmlFor="targetId" className="block text-sm font-medium">Target ID ({policy.appliesTo})</label>
                        <input type="text" name="targetId" id="targetId" value={policy.targetId || ''} onChange={handleChange}
                               className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                               placeholder={`Enter ${policy.appliesTo} ID/Address`} />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label htmlFor="limit" className="block text-sm font-medium">Limit (requests)</label>
                    <input type="number" name="limit" id="limit" value={policy.limit} onChange={handleNumberChange} required min="0"
                           className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="unit" className="block text-sm font-medium">Unit</label>
                    <select name="unit" id="unit" value={policy.unit} onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                        <option value="second">Second</option>
                        <option value="minute">Minute</option>
                        <option value="hour">Hour</option>
                        <option value="day">Day</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="priority" className="block text-sm font-medium">Priority (lower = higher)</label>
                    <input type="number" name="priority" id="priority" value={policy.priority} onChange={handleNumberChange} min="0"
                           className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="burstLimit" className="block text-sm font-medium">Burst Limit (optional)</label>
                    <input type="number" name="burstLimit" id="burstLimit" value={policy.burstLimit || ''} onChange={handleNumberChange} min="0"
                           className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="blockDurationSeconds" className="block text-sm font-medium">Block Duration (seconds)</label>
                    <input type="number" name="blockDurationSeconds" id="blockDurationSeconds" value={policy.blockDurationSeconds || ''} onChange={handleNumberChange} min="0"
                           className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <input type="checkbox" name="isAdaptive" id="isAdaptive" checked={policy.isAdaptive} onChange={handleChange}
                       className="rounded border-gray-600 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <label htmlFor="isAdaptive" className="text-sm font-medium">Use Adaptive Throttling</label>
            </div>
            {policy.isAdaptive && (
                <div>
                    <label htmlFor="adaptiveModelId" className="block text-sm font-medium">Adaptive ML Model</label>
                    <select name="adaptiveModelId" id="adaptiveModelId" value={policy.adaptiveModelId || ''} onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                        <option value="">Select an ML Model</option>
                        {mlModels.filter(m => m.status === 'deployed').map(model => (
                            <option key={model.id} value={model.id}>{model.name} ({model.version})</option>
                        ))}
                    </select>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-1">Custom Rules (optional)</label>
                {policy.customRules?.map((rule, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                        <input type="text" value={rule} onChange={e => handleCustomRulesChange(index, e.target.value)}
                               className="flex-grow rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                               placeholder="e.g., header:X-User-Tier=premium" />
                        <button type="button" onClick={() => removeCustomRule(index)}
                                className="p-2 text-red-400 hover:text-red-300 rounded-md hover:bg-gray-700">
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                ))}
                <button type="button" onClick={addCustomRule}
                        className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" /> Add Custom Rule
                </button>
            </div>

            <div className="pt-4 border-t border-gray-700 flex justify-end space-x-3">
                <button type="button" onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-300 rounded-md border border-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                    Cancel
                </button>
                <button type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Save Policy
                </button>
            </div>
        </form>
    );
};


export const AnomalyDetectionConfigForm: React.FC<{
    initialData?: AnomalyDetectionConfig;
    onSave: (config: AnomalyDetectionConfig) => void;
    onCancel: () => void;
    endpoints: ApiEndpoint[];
}> = ({ initialData, onSave, onCancel, endpoints }) => {
    const [config, setConfig] = useState<AnomalyDetectionConfig>(
        initialData || {
            id: `new-adcfg-${Date.now()}`,
            name: '',
            description: '',
            target: 'global',
            modelType: 'machine_learning',
            threshold: 3,
            alertSeverity: 'medium',
            alertChannels: ['email'],
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: parseFloat(value) }));
    };

    const handleAlertChannelsChange = (channel: string, checked: boolean) => {
        setConfig(prev => {
            const newChannels = checked
                ? [...new Set([...prev.alertChannels, channel])]
                : prev.alertChannels.filter(c => c !== channel);
            return { ...prev, alertChannels: newChannels };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...config, updatedAt: new Date().toISOString() });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-gray-300">
            <div>
                <label htmlFor="name" className="block text-sm font-medium">Config Name</label>
                <input type="text" name="name" id="name" value={config.name} onChange={handleChange} required
                       className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium">Description</label>
                <textarea name="description" id="description" value={config.description} onChange={handleChange} rows={2}
                          className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="target" className="block text-sm font-medium">Target Scope</label>
                    <select name="target" id="target" value={config.target} onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                        <option value="global">Global</option>
                        <option value="endpoint">Endpoint</option>
                        <option value="user">User</option>
                        <option value="ip">IP Address</option>
                    </select>
                </div>
                {config.target === 'endpoint' && (
                    <div>
                        <label htmlFor="targetId" className="block text-sm font-medium">Target Endpoint</label>
                        <select name="targetId" id="targetId" value={config.targetId || ''} onChange={handleChange} required
                                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                            <option value="">Select an endpoint</option>
                            {endpoints.map(ep => (
                                <option key={ep.id} value={ep.id}>{ep.name} ({ep.method})</option>
                            ))}
                        </select>
                    </div>
                )}
                {(config.target === 'user' || config.target === 'ip') && (
                    <div>
                        <label htmlFor="targetId" className="block text-sm font-medium">Target ID ({config.target})</label>
                        <input type="text" name="targetId" id="targetId" value={config.targetId || ''} onChange={handleChange}
                               className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                               placeholder={`Enter ${config.target} ID/Address`} />
                    </div>
                )}
            </div>
            <div>
                <label htmlFor="modelType" className="block text-sm font-medium">Model Type</label>
                <select name="modelType" id="modelType" value={config.modelType} onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    <option value="statistical">Statistical Thresholds</option>
                    <option value="machine_learning">Machine Learning</option>
                    <option value="heuristic">Heuristic Rules</option>
                </select>
            </div>
            <div>
                <label htmlFor="threshold" className="block text-sm font-medium">Threshold</label>
                <input type="number" name="threshold" id="threshold" value={config.threshold} onChange={handleNumberChange} step="0.1"
                       className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                <p className="mt-1 text-xs text-gray-400">Interpretation depends on model type (e.g., standard deviations, confidence score).</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="alertSeverity" className="block text-sm font-medium">Alert Severity</label>
                    <select name="alertSeverity" id="alertSeverity" value={config.alertSeverity} onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">Alert Channels</label>
                    <div className="mt-1 space-y-1">
                        {['email', 'slack', 'pagerduty', 'webhook'].map(channel => (
                            <div key={channel} className="flex items-center">
                                <input
                                    id={`channel-${channel}`}
                                    name="alertChannels"
                                    type="checkbox"
                                    checked={config.alertChannels.includes(channel)}
                                    onChange={e => handleAlertChannelsChange(channel, e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor={`channel-${channel}`} className="ml-2 text-sm text-gray-300 capitalize">{channel}</label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <button type="button" onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-300 rounded-md border border-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                    Cancel
                </button>
                <button type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Save Configuration
                </button>
            </div>
        </form>
    );
};

export const CustomRuleForm: React.FC<{
    initialData?: CustomRuleSchema;
    onSave: (rule: CustomRuleSchema) => void;
    onCancel: () => void;
}> = ({ initialData, onSave, onCancel }) => {
    const [rule, setRule] = useState<CustomRuleSchema>(
        initialData || {
            id: `new-crule-${Date.now()}`,
            name: '',
            description: '',
            language: 'javascript',
            code: `// Your custom rule logic here.
// 'request' object contains headers, body, ip, path, method.
// Return true to allow, false to block, or an object { allowed: boolean, reason: string }.
function evaluate(request) {
    if (request.headers['X-Api-Key'] === 'blocked-key') {
        return { allowed: false, reason: 'Blocked API Key' };
    }
    return true;
}`,
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: [],
            testCases: [],
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setRule(prev => ({ ...prev, [name]: value }));
    };

    const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setRule(prev => ({ ...prev, code: e.target.value }));
    };

    const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        setRule(prev => ({ ...prev, tags }));
    };

    const handleTestCaseChange = (index: number, field: keyof typeof rule.testCases[0], value: any) => {
        const newTestCases = [...rule.testCases];
        newTestCases[index] = { ...newTestCases[index], [field]: value };
        setRule(prev => ({ ...prev, testCases: newTestCases }));
    };

    const addTestCase = () => {
        setRule(prev => ({ ...prev, testCases: [...prev.testCases, { input: {}, expectedOutput: true, description: '' }] }));
    };

    const removeTestCase = (index: number) => {
        const newTestCases = [...rule.testCases];
        newTestCases.splice(index, 1);
        setRule(prev => ({ ...prev, testCases: newTestCases }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...rule, updatedAt: new Date().toISOString() });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-gray-300">
            <div>
                <label htmlFor="name" className="block text-sm font-medium">Rule Name</label>
                <input type="text" name="name" id="name" value={rule.name} onChange={handleChange} required
                       className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium">Description</label>
                <textarea name="description" id="description" value={rule.description} onChange={handleChange} rows={2}
                          className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="language" className="block text-sm font-medium">Language</label>
                    <select name="language" id="language" value={rule.language} onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="lua">Lua</option>
                        <option value="cel">CEL (Common Expression Language)</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium">Status</label>
                    <select name="status" id="status" value={rule.status} onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>
            </div>
            <div>
                <label htmlFor="code" className="block text-sm font-medium">Rule Code</label>
                <textarea name="code" id="code" value={rule.code} onChange={handleCodeChange} rows={10}
                          className="mt-1 block w-full font-mono text-sm rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
                <label htmlFor="tags" className="block text-sm font-medium">Tags (comma-separated)</label>
                <input type="text" name="tags" id="tags" value={rule.tags.join(', ')} onChange={handleTagsChange}
                       className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                       placeholder="e.g., security, performance, critical" />
            </div>

            <div className="pt-4 border-t border-gray-700">
                <h4 className="text-md font-medium text-gray-300 mb-2">Test Cases</h4>
                {rule.testCases.map((testCase, index) => (
                    <div key={index} className="border border-gray-700 p-3 rounded-md mb-3 space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium">Test Case #{index + 1}</label>
                            <button type="button" onClick={() => removeTestCase(index)}
                                    className="p-1 text-red-400 hover:text-red-300 rounded-md hover:bg-gray-700">
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Description</label>
                            <input type="text" value={testCase.description} onChange={e => handleTestCaseChange(index, 'description', e.target.value)}
                                   className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Input (JSON)</label>
                            <textarea value={JSON.stringify(testCase.input, null, 2)}
                                      onChange={e => {
                                          try {
                                              handleTestCaseChange(index, 'input', JSON.parse(e.target.value));
                                          } catch (err) {
                                              // console.error("Invalid JSON input", err);
                                          }
                                      }}
                                      rows={4}
                                      className="mt-1 block w-full font-mono text-sm rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Expected Output</label>
                            <select value={String(testCase.expectedOutput)} onChange={e => handleTestCaseChange(index, 'expectedOutput', e.target.value === 'true')}
                                    className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                <option value="true">True (Allowed)</option>
                                <option value="false">False (Blocked)</option>
                            </select>
                        </div>
                    </div>
                ))}
                <button type="button" onClick={addTestCase}
                        className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" /> Add Test Case
                </button>
            </div>

            <div className="pt-4 border-t border-gray-700 flex justify-end space-x-3">
                <button type="button" onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-300 rounded-md border border-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                    Cancel
                </button>
                <button type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Save Custom Rule
                </button>
            </div>
        </form>
    );
};


// --- Data Display Components ---

export const EndpointDetailsTable: React.FC<{ endpoints: ApiEndpoint[] }> = ({ endpoints }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<keyof ApiEndpoint>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const filteredAndSortedEndpoints = useMemo(() => {
        let filtered = endpoints.filter(ep =>
            ep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ep.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ep.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ep.owner.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortBy) {
            filtered = filtered.sort((a, b) => {
                const aValue = a[sortBy];
                const bValue = b[sortBy];

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
                }
                return 0;
            });
        }
        return filtered;
    }, [endpoints, searchTerm, sortBy, sortOrder]);

    const handleSort = (key: keyof ApiEndpoint) => {
        if (sortBy === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(key);
            setSortOrder('asc');
        }
    };

    const renderSortIcon = (key: keyof ApiEndpoint) => {
        if (sortBy === key) {
            return sortOrder === 'asc' ? <ChevronUpIcon className="ml-1 h-3 w-3" /> : <ChevronDownIcon className="ml-1 h-3 w-3" />;
        }
        return null;
    };

    return (
        <Card title="API Endpoint Directory" className="h-full">
            <input
                type="text"
                placeholder="Search endpoints..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="mb-4 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                                <div className="flex items-center">Endpoint {renderSortIcon('name')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('method')}>
                                <div className="flex items-center">Method {renderSortIcon('method')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('owner')}>
                                <div className="flex items-center">Owner {renderSortIcon('owner')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('avgLatencyMs')}>
                                <div className="flex items-center">Avg Latency (ms) {renderSortIcon('avgLatencyMs')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('errorRate')}>
                                <div className="flex items-center">Error Rate (%) {renderSortIcon('errorRate')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('peakTrafficRPS')}>
                                <div className="flex items-center">Peak RPS {renderSortIcon('peakTrafficRPS')}</div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {filteredAndSortedEndpoints.map(ep => (
                            <tr key={ep.id} className="hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{ep.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{ep.method}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{ep.owner}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{ep.avgLatencyMs.toFixed(1)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{ep.errorRate.toFixed(2)}%</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{ep.peakTrafficRPS}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    <StatusIndicator status={ep.status} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export const RateLimitPolicyList: React.FC<{
    policies: RateLimitPolicy[];
    endpoints: ApiEndpoint[];
    onEdit: (policy: RateLimitPolicy) => void;
    onDelete: (policyId: string) => void;
    onToggleStatus: (policy: RateLimitPolicy) => void;
}> = ({ policies, endpoints, onEdit, onDelete, onToggleStatus }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [filters, setFilters] = useState({
        name: '',
        appliesTo: '',
        status: '',
    });
    const [sortBy, setSortBy] = useState<keyof RateLimitPolicy>('priority');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const handleFilterChange = useCallback((key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1); // Reset to first page on filter change
    }, []);

    const handleSortChange = useCallback((key: keyof RateLimitPolicy) => {
        if (sortBy === key) {
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(key);
            setSortOrder('asc');
        }
    }, [sortBy]);

    const filteredAndSortedPolicies = useMemo(() => {
        let filtered = policies.filter(policy => {
            const matchesName = filters.name ? policy.name.toLowerCase().includes(filters.name.toLowerCase()) : true;
            const matchesAppliesTo = filters.appliesTo ? policy.appliesTo === filters.appliesTo : true;
            const matchesStatus = filters.status ? policy.status === filters.status : true;
            return matchesName && matchesAppliesTo && matchesStatus;
        });

        if (sortBy) {
            filtered = filtered.sort((a, b) => {
                const aValue = a[sortBy];
                const bValue = b[sortBy];

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
                }
                return 0;
            });
        }
        return filtered;
    }, [policies, filters, sortBy, sortOrder]);

    const totalPages = Math.ceil(filteredAndSortedPolicies.length / itemsPerPage);
    const paginatedPolicies = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedPolicies.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAndSortedPolicies, currentPage, itemsPerPage]);

    const getEndpointName = (id?: string) => {
        return id ? endpoints.find(ep => ep.id === id)?.name || id : 'N/A';
    };

    const availableFilters = [
        { key: 'name', label: 'Policy Name', type: 'text' as const },
        { key: 'appliesTo', label: 'Applies To', type: 'select' as const, options: [{ value: 'global', label: 'Global' }, { value: 'endpoint', label: 'Endpoint' }, { value: 'user', label: 'User' }, { value: 'ip', label: 'IP' }, { value: 'client_id', label: 'Client ID' }] },
        { key: 'status', label: 'Status', type: 'select' as const, options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'pending', label: 'Pending' }] },
    ];

    const availableSorts = [
        { key: 'name', label: 'Name' },
        { key: 'priority', label: 'Priority' },
        { key: 'updatedAt', label: 'Last Updated' },
    ];

    return (
        <Card title="Rate Limit Policies">
            <FilterSortPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                availableFilters={availableFilters}
                availableSorts={availableSorts}
            />
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Applies To</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Target</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Limit</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Priority</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Adaptive</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {paginatedPolicies.map(policy => (
                            <tr key={policy.id} className="hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{policy.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">{policy.appliesTo.replace('_', ' ')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {policy.appliesTo === 'endpoint' ? getEndpointName(policy.targetId) : policy.targetId || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{policy.limit} req/{policy.unit}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{policy.priority}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {policy.isAdaptive ? <CheckCircleIcon className="h-5 w-5 text-green-500" /> : 'No'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    <StatusIndicator status={policy.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onEdit(policy)} className="text-indigo-400 hover:text-indigo-300 mr-3">
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => onToggleStatus(policy)} className={`mr-3 ${policy.status === 'active' ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'}`}>
                                        {policy.status === 'active' ? <ExclamationTriangleIcon className="h-5 w-5" /> : <RocketLaunchIcon className="h-5 w-5" />}
                                    </button>
                                    <button onClick={() => onDelete(policy.id)} className="text-red-400 hover:text-red-300">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredAndSortedPolicies.length}
                itemsPerPage={itemsPerPage}
            />
        </Card>
    );
};

export const ThrottlingEventLog: React.FC<{ events: ThrottlingEvent[]; endpoints: ApiEndpoint[]; policies: RateLimitPolicy[] }> = ({ events, endpoints, policies }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const [filters, setFilters] = useState({
        endpointId: '',
        reason: '',
        clientIp: '',
        blocked: '',
    });
    const [sortBy, setSortBy] = useState<keyof ThrottlingEvent>('timestamp');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    const handleFilterChange = useCallback((key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    }, []);

    const handleSortChange = useCallback((key: keyof ThrottlingEvent) => {
        if (sortBy === key) {
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(key);
            setSortOrder('desc'); // Default to desc for timestamp, asc for others
        }
    }, [sortBy]);

    const filteredAndSortedEvents = useMemo(() => {
        let filtered = events.filter(event => {
            const matchesEndpoint = filters.endpointId ? event.endpointId === filters.endpointId : true;
            const matchesReason = filters.reason ? event.reason === filters.reason : true;
            const matchesIp = filters.clientIp ? event.clientIp.includes(filters.clientIp) : true;
            const matchesBlocked = filters.blocked ? (filters.blocked === 'true' ? event.blocked : !event.blocked) : true;
            return matchesEndpoint && matchesReason && matchesIp && matchesBlocked;
        });

        if (sortBy) {
            filtered = filtered.sort((a, b) => {
                const aValue = a[sortBy];
                const bValue = b[sortBy];

                if (sortBy === 'timestamp') {
                    return sortOrder === 'asc' ? new Date(aValue).getTime() - new Date(bValue).getTime() : new Date(bValue).getTime() - new Date(aValue).getTime();
                }
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
                }
                return 0;
            });
        }
        return filtered;
    }, [events, filters, sortBy, sortOrder]);

    const totalPages = Math.ceil(filteredAndSortedEvents.length / itemsPerPage);
    const paginatedEvents = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedEvents.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAndSortedEvents, currentPage, itemsPerPage]);

    const getEndpointName = (id: string) => endpoints.find(ep => ep.id === id)?.name || id;
    const getPolicyName = (id: string) => policies.find(p => p.id === id)?.name || id;

    const availableFilters = [
        { key: 'endpointId', label: 'Endpoint', type: 'select' as const, options: mockEndpoints.map(ep => ({ value: ep.id, label: ep.name })) },
        { key: 'reason', label: 'Reason', type: 'select' as const, options: [{ value: 'rate_limit_exceeded', label: 'Rate Limit Exceeded' }, { value: 'burst_limit_exceeded', label: 'Burst Limit Exceeded' }, { value: 'anomaly_detected', label: 'Anomaly Detected' }, { value: 'ip_blacklist', label: 'IP Blacklist' }] },
        { key: 'clientIp', label: 'Client IP', type: 'text' as const },
        { key: 'blocked', label: 'Blocked', type: 'select' as const, options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }] },
    ];

    const availableSorts = [
        { key: 'timestamp', label: 'Timestamp' },
        { key: 'currentRPS', label: 'Current RPS' },
        { key: 'reason', label: 'Reason' },
    ];

    return (
        <Card title="Throttling Event Log">
            <FilterSortPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                availableFilters={availableFilters}
                availableSorts={availableSorts}
            />
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('timestamp')}>
                                <div className="flex items-center">Timestamp {sortBy === 'timestamp' && (sortOrder === 'asc' ? <ChevronUpIcon className="ml-1 h-3 w-3" /> : <ChevronDownIcon className="ml-1 h-3 w-3" />)}</div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Endpoint</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Client IP</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('reason')}>
                                <div className="flex items-center">Reason {sortBy === 'reason' && (sortOrder === 'asc' ? <ChevronUpIcon className="ml-1 h-3 w-3" /> : <ChevronDownIcon className="ml-1 h-3 w-3" />)}</div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('currentRPS')}>
                                <div className="flex items-center">RPS @ Event {sortBy === 'currentRPS' && (sortOrder === 'asc' ? <ChevronUpIcon className="ml-1 h-3 w-3" /> : <ChevronDownIcon className="ml-1 h-3 w-3" />)}</div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Policy</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Blocked</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {paginatedEvents.map(event => (
                            <tr key={event.id} className="hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(event.timestamp).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{getEndpointName(event.endpointId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{event.clientIp} {event.userId && `(User: ${event.userId})`}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400 font-semibold">{event.reason.replace(/_/g, ' ')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{event.currentRPS} / {event.rateLimitValue}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getPolicyName(event.policyId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {event.blocked ? <CheckCircleIcon className="h-5 w-5 text-red-500" /> : <CheckCircleIcon className="h-5 w-5 text-green-500" />}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredAndSortedEvents.length}
                itemsPerPage={itemsPerPage}
            />
        </Card>
    );
};

export const MlModelManagement: React.FC<{ mlModels: MlModel[]; onDeploy: (id: string) => void; onRetrain: (id: string) => void }> = ({ mlModels, onDeploy, onRetrain }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredModels = useMemo(() => {
        return mlModels.filter(model =>
            model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            model.algorithm.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [mlModels, searchTerm]);

    return (
        <Card title="AI/ML Throttling Model Management">
            <input
                type="text"
                placeholder="Search models..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="mb-4 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredModels.map(model => (
                    <div key={model.id} className="bg-gray-700 p-4 rounded-lg shadow-md flex flex-col justify-between">
                        <div>
                            <h4 className="text-xl font-semibold text-white mb-2">{model.name} <span className="text-gray-400 text-sm">({model.version})</span></h4>
                            <p className="text-gray-300 text-sm mb-2">{model.description}</p>
                            <div className="flex items-center text-gray-400 text-sm mb-1">
                                <CpuChipIcon className="h-4 w-4 mr-1" /> Algorithm: {model.algorithm}
                            </div>
                            <div className="flex items-center text-gray-400 text-sm mb-1">
                                <TagIcon className="h-4 w-4 mr-1" /> Type: {model.type}
                            </div>
                            <div className="flex items-center text-gray-400 text-sm mb-1">
                                <CalendarDaysIcon className="h-4 w-4 mr-1" /> Last Trained: {new Date(model.lastTrained).toLocaleDateString()}
                            </div>
                            <div className="flex items-center text-gray-400 text-sm mb-2">
                                <ServerStackIcon className="h-4 w-4 mr-1" /> Training Data: {(model.trainingDataSize / 1000000).toFixed(1)}M samples
                            </div>
                            <div className="mb-2">
                                <h5 className="text-sm font-medium text-gray-300">Performance:</h5>
                                {model.performanceMetrics.accuracy && <p className="text-xs text-gray-400 ml-2">Accuracy: {(model.performanceMetrics.accuracy * 100).toFixed(2)}%</p>}
                                {model.performanceMetrics.mse && <p className="text-xs text-gray-400 ml-2">MSE: {model.performanceMetrics.mse.toFixed(4)}</p>}
                                {model.performanceMetrics.precision && <p className="text-xs text-gray-400 ml-2">Precision: {(model.performanceMetrics.precision * 100).toFixed(2)}%</p>}
                            </div>
                            <div className="mb-3">
                                <p className="text-xs font-medium text-gray-300">Features Used: <span className="text-gray-400">{model.featuresUsed.join(', ')}</span></p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-600">
                            <StatusIndicator status={model.status} />
                            <div className="space-x-2">
                                {model.status !== 'deployed' && (
                                    <button onClick={() => onDeploy(model.id)} className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Deploy</button>
                                )}
                                {model.status !== 'training' && (
                                    <button onClick={() => onRetrain(model.id)} className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Retrain</button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export const AnomalyDetectionConfigsList: React.FC<{
    configs: AnomalyDetectionConfig[];
    endpoints: ApiEndpoint[];
    onEdit: (config: AnomalyDetectionConfig) => void;
    onDelete: (configId: string) => void;
    onToggleStatus: (config: AnomalyDetectionConfig) => void;
}> = ({ configs, endpoints, onEdit, onDelete, onToggleStatus }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [filters, setFilters] = useState({
        name: '',
        target: '',
        status: '',
    });
    const [sortBy, setSortBy] = useState<keyof AnomalyDetectionConfig>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const handleFilterChange = useCallback((key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    }, []);

    const handleSortChange = useCallback((key: keyof AnomalyDetectionConfig) => {
        if (sortBy === key) {
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(key);
            setSortOrder('asc');
        }
    }, [sortBy]);

    const filteredAndSortedConfigs = useMemo(() => {
        let filtered = configs.filter(config => {
            const matchesName = filters.name ? config.name.toLowerCase().includes(filters.name.toLowerCase()) : true;
            const matchesTarget = filters.target ? config.target === filters.target : true;
            const matchesStatus = filters.status ? config.status === filters.status : true;
            return matchesName && matchesTarget && matchesStatus;
        });

        if (sortBy) {
            filtered = filtered.sort((a, b) => {
                const aValue = a[sortBy];
                const bValue = b[sortBy];

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
                }
                return 0;
            });
        }
        return filtered;
    }, [configs, filters, sortBy, sortOrder]);

    const totalPages = Math.ceil(filteredAndSortedConfigs.length / itemsPerPage);
    const paginatedConfigs = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedConfigs.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAndSortedConfigs, currentPage, itemsPerPage]);

    const getTargetName = (config: AnomalyDetectionConfig) => {
        if (config.target === 'endpoint' && config.targetId) {
            return endpoints.find(ep => ep.id === config.targetId)?.name || config.targetId;
        }
        return config.targetId || 'N/A';
    };

    const availableFilters = [
        { key: 'name', label: 'Config Name', type: 'text' as const },
        { key: 'target', label: 'Target Scope', type: 'select' as const, options: [{ value: 'global', label: 'Global' }, { value: 'endpoint', label: 'Endpoint' }, { value: 'user', label: 'User' }, { value: 'ip', label: 'IP' }] },
        { key: 'status', label: 'Status', type: 'select' as const, options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
    ];

    const availableSorts = [
        { key: 'name', label: 'Name' },
        { key: 'alertSeverity', label: 'Severity' },
        { key: 'updatedAt', label: 'Last Updated' },
    ];

    return (
        <Card title="Anomaly Detection Configurations">
            <FilterSortPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                availableFilters={availableFilters}
                availableSorts={availableSorts}
            />
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Target</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Model Type</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Threshold</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Severity</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {paginatedConfigs.map(config => (
                            <tr key={config.id} className="hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{config.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">{config.target} ({getTargetName(config)})</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">{config.modelType.replace('_', ' ')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{config.threshold}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">{config.alertSeverity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    <StatusIndicator status={config.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onEdit(config)} className="text-indigo-400 hover:text-indigo-300 mr-3">
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => onToggleStatus(config)} className={`mr-3 ${config.status === 'active' ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'}`}>
                                        {config.status === 'active' ? <ExclamationTriangleIcon className="h-5 w-5" /> : <RocketLaunchIcon className="h-5 w-5" />}
                                    </button>
                                    <button onClick={() => onDelete(config.id)} className="text-red-400 hover:text-red-300">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredAndSortedConfigs.length}
                itemsPerPage={itemsPerPage}
            />
        </Card>
    );
};

export const SimulationResultsList: React.FC<{ results: SimulationResult[] }> = ({ results }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<keyof SimulationResult>('timestamp');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleSortChange = (key: keyof SimulationResult) => {
        if (sortBy === key) {
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(key);
            setSortOrder('desc');
        }
    };

    const filteredAndSortedResults = useMemo(() => {
        let filtered = results.filter(result =>
            result.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.scenarioDescription.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortBy) {
            filtered = filtered.sort((a, b) => {
                const aValue = a[sortBy];
                const bValue = b[sortBy];

                if (sortBy === 'timestamp') {
                    return sortOrder === 'asc' ? new Date(aValue).getTime() - new Date(bValue).getTime() : new Date(bValue).getTime() - new Date(aValue).getTime();
                }
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
                }
                return 0;
            });