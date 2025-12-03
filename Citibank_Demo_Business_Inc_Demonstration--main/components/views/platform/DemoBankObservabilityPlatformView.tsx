// components/views/platform/DemoBankObservabilityPlatformView.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext } from 'react';
import Card from '../../Card';
import { GoogleGenAI } from "@google/genai";

// --- CONSTANTS ---

export const SERVICE_NAMES = [
    'payments-api',
    'users-service',
    'fraud-detection-engine',
    'loan-processing-queue',
    'frontend-gateway',
    'auth-service',
    'database-cluster-1',
    'database-cluster-2',
    'kafka-stream-processor'
];

export const LOG_LEVELS = ['INFO', 'WARN', 'ERROR', 'DEBUG', 'FATAL'];

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];

export const HTTP_STATUS_CODES = [200, 201, 204, 400, 401, 403, 404, 500, 502, 503, 504];

export const ERROR_MESSAGES = [
    'Database connection failed',
    'Upstream provider timeout',
    'Invalid credentials provided',
    'Schema validation failed for request body',
    'User not found',
    'Payment declined by gateway',
    'Service temporarily unavailable',
    'Failed to acquire lock on resource',
    'Disk space running low',
    'Kafka message queue is full',
    'Authentication token expired'
];

export const REGIONS = ['us-east-1', 'us-west-2', 'eu-central-1', 'ap-southeast-2'];

export const MOCK_USER_EMAILS = [
    'sre-team@demobank.com',
    'devops@demobank.com',
    'platform-eng@demobank.com',
    'security@demobank.com'
];

// --- TYPES AND INTERFACES ---

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'FATAL';
export type ViewType = 'dashboard' | 'logs' | 'metrics' | 'traces' | 'alerts' | 'settings';
export type TimeRange = '5m' | '15m' | '1h' | '6h' | '1d' | '3d' | 'custom';

export interface LogEntry {
    id: string;
    timestamp: string;
    level: LogLevel;
    service: string;
    region: string;
    message: string;
    traceId?: string;
    spanId?: string;
    commit?: string;
    statusCode?: number;
    method?: string;
    path?: string;
    latencyMs?: number;
    user?: string;
}

export interface MetricDataPoint {
    timestamp: number; // Unix timestamp in seconds
    value: number;
}

export interface TimeSeries {
    metricName: string;
    tags: Record<string, string>;
    data: MetricDataPoint[];
}

export interface Span {
    id: string;
    traceId: string;
    parentId?: string;
    name: string;
    service: string;
    startTime: number; // Unix timestamp in microseconds
    endTime: number; // Unix timestamp in microseconds
    duration: number; // in microseconds
    tags: Record<string, string | number | boolean>;
    logs: { timestamp: number, fields: Record<string, any> }[];
}

export interface Trace {
    traceId: string;
    rootSpanId: string;
    spans: Span[];
    startTime: number;
    endTime: number;
    duration: number;
    services: string[];
    totalSpans: number;
}

export type WidgetType = 'timeseries' | 'stat' | 'log_list' | 'gauge';

export interface Widget {
    id: string;
    type: WidgetType;
    title: string;
    gridPos: { x: number; y: number; w: number; h: number; };
    query: string;
    options: Record<string, any>;
}

export interface Dashboard {
    id: string;
    name: string;
    widgets: Widget[];
}

export type AlertState = 'OK' | 'PENDING' | 'FIRING';

export interface AlertRule {
    id: string;
    name: string;
    query: string;
    duration: string; // e.g. '5m'
    threshold: number;
    comparison: '>' | '<' | '==' | '!=';
    severity: 'critical' | 'warning' | 'info';
    description: string;
    lastState: AlertState;
    lastEvaluated: string;
    activeSince?: string;
}

export interface UserPreferences {
    theme: 'dark' | 'light';
    defaultTimeRange: TimeRange;
    defaultDashboardId: string;
    notifications: {
        email: boolean;
        slack: boolean;
    };
}

export interface AppState {
    currentView: ViewType;
    timeRange: {
        start: Date;
        end: Date;
    };
    isLoading: boolean;
    error: string | null;
}


// --- MOCK DATA GENERATION ---

const randomFrom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Generates a realistic mock log entry.
 * @returns A LogEntry object.
 */
export const generateMockLogEntry = (timestamp: Date): LogEntry => {
    const level = randomFrom(LOG_LEVELS);
    const hasError = level === 'ERROR' || level === 'FATAL';
    const traceId = Math.random().toString(36).substring(2, 18);
    return {
        id: Math.random().toString(36).substring(2, 12),
        timestamp: timestamp.toISOString(),
        level,
        service: randomFrom(SERVICE_NAMES),
        region: randomFrom(REGIONS),
        message: hasError ? `Operation failed: ${randomFrom(ERROR_MESSAGES)}` : 'Request processed successfully',
        traceId: traceId,
        spanId: Math.random().toString(36).substring(2, 18),
        commit: Math.random().toString(16).substring(2, 9),
        statusCode: hasError ? randomFrom([500, 503, 400, 401]) : randomFrom([200, 201, 204]),
        method: randomFrom(HTTP_METHODS),
        path: `/api/v1/${randomFrom(['users', 'payments', 'loans', 'transactions'])}/${randomInt(1000, 9999)}`,
        latencyMs: randomInt(10, hasError ? 5000 : 500),
        user: randomFrom(MOCK_USER_EMAILS)
    };
};

/**
 * Generates a list of mock log entries.
 * @param count - The number of logs to generate.
 * @param timeWindowSeconds - The time window in seconds to spread the logs over.
 * @returns An array of LogEntry objects.
 */
export const generateMockLogs = (count: number, timeWindowSeconds: number): LogEntry[] => {
    const logs: LogEntry[] = [];
    const now = new Date();
    for (let i = 0; i < count; i++) {
        const timestamp = new Date(now.getTime() - randomInt(0, timeWindowSeconds * 1000));
        logs.push(generateMockLogEntry(timestamp));
    }
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

/**
 * Generates a mock time series for a metric.
 * @param metricName - The name of the metric.
 * @param tags - Tags for the time series.
 * @param startTime - The start time for the data.
 * @param endTime - The end time for the data.
 * @param stepSeconds - The interval between data points.
 * @returns A TimeSeries object.
 */
export const generateMockTimeSeries = (
    metricName: string,
    tags: Record<string, string>,
    startTime: Date,
    endTime: Date,
    stepSeconds: number
): TimeSeries => {
    const data: MetricDataPoint[] = [];
    let currentTime = Math.floor(startTime.getTime() / 1000);
    const endTimeSec = Math.floor(endTime.getTime() / 1000);

    while (currentTime <= endTimeSec) {
        let value = 0;
        if (metricName.includes('cpu')) {
            value = Math.random() * 80 + 10; // CPU usage between 10% and 90%
        } else if (metricName.includes('memory')) {
            value = Math.random() * 16 * 1024; // Memory in MB
        } else if (metricName.includes('latency')) {
            value = Math.random() * 200 + 20; // Latency in ms
        } else if (metricName.includes('error_rate')) {
            value = Math.random() * 0.05; // Error rate
        } else {
            value = Math.random() * 1000;
        }
        data.push({ timestamp: currentTime, value });
        currentTime += stepSeconds;
    }

    return { metricName, tags, data };
};


/**
 * Generates a mock distributed trace.
 * @returns A Trace object.
 */
export const generateMockTrace = (): Trace => {
    const traceId = Math.random().toString(36).substring(2, 22);
    const totalSpans = randomInt(3, 15);
    const spans: Span[] = [];
    const servicesInTrace = new Set<string>();
    const startTime = new Date().getTime() * 1000 - randomInt(1000000, 60000000); // in microseconds

    let rootSpan: Span | null = null;
    let lastSpanEndTime = startTime;

    for (let i = 0; i < totalSpans; i++) {
        const service = randomFrom(SERVICE_NAMES);
        servicesInTrace.add(service);
        const parentSpan = i > 0 ? randomFrom(spans) : undefined;
        const spanStartTime = parentSpan ? parentSpan.startTime + randomInt(1000, 50000) : startTime;
        const duration = randomInt(10000, 500000); // 10ms to 500ms
        const spanEndTime = spanStartTime + duration;
        lastSpanEndTime = Math.max(lastSpanEndTime, spanEndTime);

        const isError = Math.random() < 0.1;

        const span: Span = {
            id: Math.random().toString(36).substring(2, 18),
            traceId,
            parentId: parentSpan?.id,
            name: `${randomFrom(HTTP_METHODS)} /api/${service.split('-')[0]}`,
            service,
            startTime: spanStartTime,
            endTime: spanEndTime,
            duration,
            tags: {
                'http.method': randomFrom(HTTP_METHODS),
                'http.status_code': isError ? randomFrom([500, 503]) : 200,
                'region': randomFrom(REGIONS),
                'error': isError,
                'db.statement': isError ? '' : 'SELECT * FROM users WHERE id=?',
            },
            logs: [],
        };

        if (i === 0) {
            rootSpan = span;
        }
        spans.push(span);
    }

    return {
        traceId,
        rootSpanId: rootSpan!.id,
        spans,
        startTime,
        endTime: lastSpanEndTime,
        duration: lastSpanEndTime - startTime,
        services: Array.from(servicesInTrace),
        totalSpans,
    };
};

/**
 * Generates multiple mock traces.
 * @param count - Number of traces to generate.
 * @returns An array of Trace objects.
 */
export const generateMockTraces = (count: number): Trace[] => {
    return Array.from({ length: count }, generateMockTrace);
};


/**
 * Generates a set of mock alert rules.
 * @returns An array of AlertRule objects.
 */
export const generateMockAlertRules = (): AlertRule[] => {
    return [
        {
            id: 'alert-1',
            name: 'High CPU on payments-api',
            query: 'avg(cpu_usage{service="payments-api"}) > 80',
            duration: '5m',
            threshold: 80,
            comparison: '>',
            severity: 'critical',
            description: 'The average CPU usage for the payments-api has been over 80% for the last 5 minutes.',
            lastState: Math.random() > 0.5 ? 'FIRING' : 'OK',
            lastEvaluated: new Date().toISOString(),
            activeSince: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        },
        {
            id: 'alert-2',
            name: 'Increased P99 Latency on frontend-gateway',
            query: 'p99(latency_ms{service="frontend-gateway"}) > 500',
            duration: '10m',
            threshold: 500,
            comparison: '>',
            severity: 'warning',
            description: 'P99 request latency for the frontend-gateway is over 500ms.',
            lastState: 'OK',
            lastEvaluated: new Date().toISOString(),
        },
        {
            id: 'alert-3',
            name: 'User Service 5xx Error Rate High',
            query: 'sum(rate(http_requests_total{service="users-service", code=~"5.."}[5m])) / sum(rate(http_requests_total{service="users-service"}[5m])) > 0.05',
            duration: '5m',
            threshold: 0.05,
            comparison: '>',
            severity: 'critical',
            description: 'The 5xx error rate for the user service is over 5%.',
            lastState: 'OK',
            lastEvaluated: new Date().toISOString(),
        },
        {
            id: 'alert-4',
            name: 'Kafka Queue Approaching Capacity',
            query: 'kafka_queue_size{topic="loan-applications"} > 1000000',
            duration: '15m',
            threshold: 1000000,
            comparison: '>',
            severity: 'warning',
            description: 'The loan applications Kafka queue has over 1 million messages.',
            lastState: Math.random() > 0.8 ? 'FIRING' : 'OK',
            lastEvaluated: new Date().toISOString(),
            activeSince: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        }
    ];
};

/**
 * Generates a mock default dashboard configuration.
 * @returns A Dashboard object.
 */
export const generateMockDashboard = (): Dashboard => ({
    id: 'default-dashboard',
    name: 'Default System Overview',
    widgets: [
        {
            id: 'widget-1', type: 'timeseries', title: 'Payments API CPU Usage (%)',
            gridPos: { x: 0, y: 0, w: 6, h: 4 },
            query: 'avg(cpu_usage{service="payments-api"}) by (region)',
            options: { chartType: 'line' }
        },
        {
            id: 'widget-2', type: 'timeseries', title: 'Users Service P99 Latency (ms)',
            gridPos: { x: 6, y: 0, w: 6, h: 4 },
            query: 'p99(latency_ms{service="users-service"})',
            options: { chartType: 'area' }
        },
        {
            id: 'widget-3', type: 'stat', title: 'Total 5xx Errors (Last Hour)',
            gridPos: { x: 0, y: 4, w: 4, h: 2 },
            query: 'count(logs | level="ERROR" and statusCode >= 500)',
            options: { color: 'red' }
        },
        {
            id: 'widget-4', type: 'gauge', title: 'Database Connection Pool',
            gridPos: { x: 4, y: 4, w: 4, h: 2 },
            query: 'avg(db_connection_pool_usage)',
            options: { max: 100 }
        },
        {
            id: 'widget-5', type: 'log_list', title: 'Recent Critical Errors',
            gridPos: { x: 8, y: 4, w: 4, h: 6 },
            query: 'logs | level="FATAL" or level="ERROR"',
            options: { limit: 10 }
        },
        {
            id: 'widget-6', type: 'timeseries', title: 'Fraud Engine Decisions',
            gridPos: { x: 0, y: 6, w: 8, h: 4 },
            query: 'rate(fraud_decisions{status=~"approved|declined"}) by (status)',
            options: { chartType: 'bar', stacked: true }
        }
    ]
});


// --- MOCK API SERVICE ---

/**
 * A mock API client to simulate fetching data from a backend.
 */
export const mockObservabilityApi = {
    /**
     * Simulates fetching log data.
     */
    async fetchLogs(query: string, startTime: Date, endTime: Date): Promise<LogEntry[]> {
        console.log(`Fetching logs with query "${query}" from ${startTime.toISOString()} to ${endTime.toISOString()}`);
        await new Promise(resolve => setTimeout(resolve, randomInt(300, 1500)));
        const timeWindowSeconds = (endTime.getTime() - startTime.getTime()) / 1000;
        return generateMockLogs(randomInt(50, 500), timeWindowSeconds);
    },

    /**
     * Simulates fetching metrics data.
     */
    async fetchMetrics(query: string, startTime: Date, endTime: Date, stepSeconds: number): Promise<TimeSeries[]> {
        console.log(`Fetching metrics with query "${query}" from ${startTime.toISOString()} to ${endTime.toISOString()}`);
        await new Promise(resolve => setTimeout(resolve, randomInt(400, 2000)));
        // Super simple "parser" for demo
        const metricNameMatch = query.match(/(\w+){/);
        const metricName = metricNameMatch ? metricNameMatch[1] : 'cpu_usage';
        const serviceTagMatch = query.match(/service="([^"]+)"/);
        const serviceTag = serviceTagMatch ? serviceTagMatch[1] : 'payments-api';

        return [generateMockTimeSeries(metricName, { service: serviceTag, region: 'us-east-1' }, startTime, endTime, stepSeconds)];
    },

    /**
     * Simulates fetching trace data.
     */
    async fetchTraces(query: string, startTime: Date, endTime: Date): Promise<Trace[]> {
        console.log(`Fetching traces with query "${query}" from ${startTime.toISOString()} to ${endTime.toISOString()}`);
        await new Promise(resolve => setTimeout(resolve, randomInt(500, 2500)));
        return generateMockTraces(randomInt(10, 50));
    },

    /**
     * Simulates fetching a single trace by ID.
     */
    async fetchTraceById(traceId: string): Promise<Trace | null> {
        console.log(`Fetching trace with ID "${traceId}"`);
        await new Promise(resolve => setTimeout(resolve, randomInt(200, 800)));
        if (traceId) {
             const trace = generateMockTrace();
             trace.traceId = traceId;
             return trace;
        }
        return null;
    },
    
    /**
     * Simulates fetching alert rules.
     */
    async fetchAlertRules(): Promise<AlertRule[]> {
        console.log('Fetching alert rules');
        await new Promise(resolve => setTimeout(resolve, randomInt(200, 600)));
        return generateMockAlertRules();
    },

    /**
     * Simulates fetching dashboard configuration.
     */
    async fetchDashboard(id: string): Promise<Dashboard> {
        console.log(`Fetching dashboard with ID "${id}"`);
        await new Promise(resolve => setTimeout(resolve, randomInt(100, 400)));
        return generateMockDashboard();
    }
};

// --- UTILITY FUNCTIONS ---

/**
 * Formats a timestamp into a more readable format.
 * @param date - The Date object or ISO string.
 * @returns A formatted string.
 */
export const formatTimestamp = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
};

/**
 * Converts a duration in microseconds to a human-readable string.
 * @param us - Duration in microseconds.
 * @returns Formatted duration string (e.g., "1.23s", "45.6ms", "789µs").
 */
export const formatDuration = (us: number): string => {
    if (us >= 1000000) {
        return `${(us / 1000000).toFixed(2)}s`;
    }
    if (us >= 1000) {
        return `${(us / 1000).toFixed(2)}ms`;
    }
    return `${us}µs`;
};

/**
 * Generates a consistent color for a service name.
 * @param serviceName - The name of the service.
 * @returns A Tailwind CSS color class string.
 */
export const getColorForService = (serviceName: string): string => {
    const colors = [
        'text-red-400', 'text-blue-400', 'text-green-400', 'text-yellow-400', 'text-purple-400',
        'text-pink-400', 'text-indigo-400', 'text-teal-400', 'text-orange-400'
    ];
    let hash = 0;
    for (let i = 0; i < serviceName.length; i++) {
        hash = serviceName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % colors.length);
    return colors[index];
};


// --- REUSABLE UI COMPONENTS ---

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };
    return (
        <div className={`animate-spin rounded-full border-t-2 border-b-2 border-cyan-500 ${sizeClasses[size]}`}></div>
    );
};

export const AppIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
    const icons: Record<string, JSX.Element> = {
        dashboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />,
        logs: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
        metrics: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
        traces: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l-5 5M21 21l-6-6" />,
        alerts: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
        settings: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
        chevronDown: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />,
        search: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
        ai: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />,
    };

    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {icons[name] || <circle cx="12" cy="12" r="10" strokeWidth="2" />}
        </svg>
    );
};

// --- FEATURE-SPECIFIC COMPONENTS ---

export const LogLine: React.FC<{ log: LogEntry; isExpanded: boolean; onToggle: () => void; }> = React.memo(({ log, isExpanded, onToggle }) => {
    const levelColor = useMemo(() => {
        switch (log.level) {
            case 'ERROR':
            case 'FATAL':
                return 'bg-red-900/50 text-red-300';
            case 'WARN':
                return 'bg-yellow-900/50 text-yellow-300';
            default:
                return 'bg-gray-800/50 text-gray-400';
        }
    }, [log.level]);

    return (
        <div className="font-mono text-xs border-b border-gray-800 hover:bg-gray-800/30">
            <div className="flex items-center p-2 cursor-pointer" onClick={onToggle}>
                <span className="w-40 text-gray-500">{formatTimestamp(log.timestamp)}</span>
                <span className={`w-12 text-center py-0.5 rounded-sm ${levelColor}`}>{log.level}</span>
                <span className={`w-48 ml-4 font-bold ${getColorForService(log.service)}`}>{log.service}</span>
                <span className="flex-1 ml-4 text-gray-300 truncate">{log.message}</span>
            </div>
            {isExpanded && (
                <div className="bg-gray-900/70 p-4">
                    <h4 className="text-sm font-bold text-cyan-300 mb-2">Log Details</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-gray-400">
                        {Object.entries(log).map(([key, value]) => (
                             <div key={key}>
                                <strong className="text-gray-200">{key}:</strong> {String(value)}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

export const AlertCard: React.FC<{ rule: AlertRule }> = ({ rule }) => {
    const stateColor = useMemo(() => {
        if (rule.lastState === 'FIRING') {
            return rule.severity === 'critical' ? 'border-red-500' : 'border-yellow-500';
        }
        return 'border-green-500';
    }, [rule.lastState, rule.severity]);

    const severityColor = useMemo(() => {
        if (rule.severity === 'critical') return 'bg-red-600';
        if (rule.severity === 'warning') return 'bg-yellow-600';
        return 'bg-blue-600';
    }, [rule.severity]);

    return (
        <Card title={rule.name}>
             <div className={`border-l-4 ${stateColor} pl-4`}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-400 text-sm">{rule.description}</p>
                        <pre className="text-xs text-cyan-300 font-mono bg-gray-900/50 p-2 rounded mt-2">{rule.query}</pre>
                    </div>
                    <div className="flex flex-col items-end ml-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${severityColor}`}>{rule.severity.toUpperCase()}</span>
                        <span className="text-sm mt-2 text-gray-300">{rule.lastState}</span>
                    </div>
                </div>
                 <div className="text-xs text-gray-500 mt-4 pt-2 border-t border-gray-700">
                    Last evaluated: {formatTimestamp(rule.lastEvaluated)}
                </div>
             </div>
        </Card>
    );
};


// --- MAIN VIEW COMPONENTS ---

export const LogsExplorerView: React.FC<{}> = () => {
    const [prompt, setPrompt] = useState("show me all 500 errors from the payments-api in the last hour");
    const [generatedQuery, setGeneratedQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [logResults, setLogResults] = useState<LogEntry[]>([]);
    const [error, setError] = useState('');
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedQuery('');
        setLogResults([]);
        setError('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const fullPrompt = `You are an expert SRE. Translate this natural language request into a log query language syntax (like Splunk or LogQL). Request: "${prompt}". Only return the query itself, no backticks or explanations.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt });
            const query = response.text.replace(/`/g, '').trim();
            setGeneratedQuery(query);
            
            // Simulate running the query
            const now = new Date();
            const past = new Date(now.getTime() - 60 * 60 * 1000); // last hour
            const logs = await mockObservabilityApi.fetchLogs(query, past, now);
            setLogResults(logs);

        } catch (err: any) {
            setError("Error: Could not generate or execute query. " + err.message);
            setGeneratedQuery("Error: Could not generate query.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleLogExpansion = useCallback((logId: string) => {
        setExpandedLogId(prevId => (prevId === logId ? null : logId));
    }, []);

    return (
        <div className="space-y-6">
            <Card title="AI-Powered Log Explorer">
                <div className="flex items-center gap-4">
                    <AppIcon name="ai" className="w-8 h-8 text-cyan-400" />
                    <p className="text-gray-400">Describe the logs you want to find in plain English, and our AI will generate and run the query.</p>
                </div>
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    className="w-full h-24 mt-4 bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="e.g., 'show me p99 latency for the frontend-gateway grouped by region'"
                />
                <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                    {isLoading ? <><Spinner size="sm" /> Generating & Executing...</> : 'Generate & Run Query'}
                </button>
            </Card>

            {(isLoading || generatedQuery || error) && (
                <Card title="Query & Results">
                    <div className="space-y-4">
                         {error && <div className="p-3 bg-red-900/50 text-red-300 rounded">{error}</div>}
                        <div>
                            <h4 className="text-sm font-semibold text-cyan-300">Generated Query:</h4>
                            <pre className="text-sm text-gray-300 font-mono bg-gray-900/50 p-2 rounded mt-1 overflow-x-auto">{isLoading && !generatedQuery ? 'Generating...' : generatedQuery}</pre>
                        </div>
                         <div>
                            <h4 className="text-sm font-semibold text-cyan-300">Log Results ({logResults.length} lines):</h4>
                            <div className="bg-gray-900/50 rounded mt-1 max-h-[60vh] overflow-auto">
                               {isLoading && !logResults.length ? <div className="p-4 text-center text-gray-400">Executing query...</div> : 
                                logResults.length > 0 ? (
                                    logResults.map(log => (
                                        <LogLine key={log.id} log={log} isExpanded={expandedLogId === log.id} onToggle={() => toggleLogExpansion(log.id)} />
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-gray-400">No results found.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export const DashboardView: React.FC = () => {
    const [dashboard, setDashboard] = useState<Dashboard | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            setIsLoading(true);
            const dash = await mockObservabilityApi.fetchDashboard('default-dashboard');
            setDashboard(dash);
            setIsLoading(false);
        };
        loadDashboard();
    }, []);

    if (isLoading || !dashboard) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">{dashboard.name}</h3>
            <div className="grid grid-cols-12 gap-6">
                {dashboard.widgets.map(widget => (
                    <div key={widget.id} style={{ gridColumn: `span ${widget.gridPos.w}`, gridRow: `span ${widget.gridPos.h}` }}>
                        <Card title={widget.title}>
                           <div className="h-full flex items-center justify-center text-gray-500">
                                Mock Widget Content for '{widget.type}'
                                <br />
                                Query: {widget.query}
                           </div>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const MetricsExplorerView: React.FC = () => {
    return <Card title="Metrics Explorer"><p className="text-gray-400">This feature is under construction. Check back soon for interactive metric charting!</p></Card>;
};

export const TracesExplorerView: React.FC = () => {
    return <Card title="Distributed Tracing Explorer"><p className="text-gray-400">This feature is under construction. Soon you'll be able to visualize request flows across your services.</p></Card>;
};

export const AlertingView: React.FC = () => {
    const [rules, setRules] = useState<AlertRule[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadRules = async () => {
            setIsLoading(true);
            const alertRules = await mockObservabilityApi.fetchAlertRules();
            setRules(alertRules);
            setIsLoading(false);
        };
        loadRules();
    }, []);

     if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">Alerting Rules</h3>
             <div className="space-y-4">
                {rules.map(rule => <AlertCard key={rule.id} rule={rule} />)}
            </div>
        </div>
    );
};

export const SettingsView: React.FC = () => {
    return <Card title="Settings"><p className="text-gray-400">User preferences and settings will be available here in a future update.</p></Card>;
};


// --- NAVIGATION ---

export const MainNav: React.FC<{ activeView: ViewType; onViewChange: (view: ViewType) => void }> = ({ activeView, onViewChange }) => {
    const navItems: { id: ViewType; name: string; icon: string }[] = [
        { id: 'dashboard', name: 'Dashboard', icon: 'dashboard' },
        { id: 'logs', name: 'Logs', icon: 'logs' },
        { id: 'metrics', name: 'Metrics', icon: 'metrics' },
        { id: 'traces', name: 'Traces', icon: 'traces' },
        { id: 'alerts', name: 'Alerts', icon: 'alerts' },
        { id: 'settings', name: 'Settings', icon: 'settings' },
    ];

    return (
        <nav className="bg-gray-900/50 p-4 rounded-lg">
            <ul className="flex items-center justify-around">
                {navItems.map(item => (
                    <li key={item.id}>
                        <button
                            onClick={() => onViewChange(item.id)}
                            className={`flex flex-col items-center gap-1 w-24 p-2 rounded-md transition-colors ${
                                activeView === item.id ? 'bg-cyan-600/50 text-cyan-300' : 'text-gray-400 hover:bg-gray-700/50'
                            }`}
                        >
                            <AppIcon name={item.icon} className="w-6 h-6" />
                            <span className="text-xs font-medium">{item.name}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};


// --- MAIN APPLICATION COMPONENT ---

const DemoBankObservabilityPlatformView: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewType>('logs');

    const renderCurrentView = () => {
        switch (currentView) {
            case 'dashboard':
                return <DashboardView />;
            case 'logs':
                return <LogsExplorerView />;
            case 'metrics':
                return <MetricsExplorerView />;
            case 'traces':
                return <TracesExplorerView />;
            case 'alerts':
                return <AlertingView />;
            case 'settings':
                return <SettingsView />;
            default:
                return <LogsExplorerView />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Observability Platform</h2>
                {/* Placeholder for user profile / global actions */}
                <div className="text-gray-400">Welcome, SRE Team</div>
            </div>
            
            <MainNav activeView={currentView} onViewChange={setCurrentView} />

            <main className="mt-6">
                {renderCurrentView()}
            </main>
        </div>
    );
};

export default DemoBankObservabilityPlatformView;
