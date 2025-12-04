import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import { APIStatus } from '../../../types';
import {
    ResponsiveContainer, AreaChart, Area, Tooltip as RechartsTooltip, YAxis, XAxis,
    LineChart, Line, BarChart, Bar, CartesianGrid, Legend, PieChart, Pie, Cell
} from 'recharts';

// --- Start of new types and utility functions (exported for modularity, even within this file) ---

// Define extended types for more detailed API monitoring
export type HistoricalMetricData = {
    timestamp: number;
    value: number;
    // Potentially more dimensions like region, endpoint, etc.
    region?: string;
    endpoint?: string;
};

export type APIProviderMetrics = {
    provider: string;
    latency: HistoricalMetricData[];
    errorRate: HistoricalMetricData[]; // Percentage
    throughput: HistoricalMetricData[]; // Requests per second
    availability: HistoricalMetricData[]; // Percentage
};

export type Incident = {
    id: string;
    apiProvider: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    status: 'open' | 'resolved' | 'acknowledged';
    description: string;
    openedAt: string;
    resolvedAt?: string;
    acknowledgedBy?: string;
    impactedEndpoints?: string[];
    rootCause?: string;
    resolutionSteps?: string;
    relatedAlertIds?: string[];
};

export type AlertRule = {
    id: string;
    name: string;
    apiProvider: string;
    metric: 'latency' | 'errorRate' | 'throughput' | 'availability';
    threshold: number;
    operator: 'gt' | 'lt'; // greater than, less than
    unit: 'ms' | '%' | 'req/s';
    channels: ('email' | 'slack' | 'pagerduty' | 'webhook')[];
    enabled: boolean;
    lastTriggered?: string;
    timeWindowSeconds?: number; // e.g., average over 60 seconds
    evaluationFrequencySeconds?: number; // how often to check
};

export type SLO = {
    id: string;
    name: string;
    apiProvider: string;
    objective: 'availability' | 'latency' | 'errorRate';
    target: number; // e.g., 0.999 for availability, 200 for latency (ms), 0.01 for error rate (decimal)
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    unit: '%' | 'ms' | 'decimal'; // 'decimal' for error rate/availability
    currentAchieved?: number; // Actual performance
    breachCount?: number;
    lastReported?: string;
};

export type SystemResource = {
    id: string;
    name: string; // e.g., 'Monitoring Server 1', 'Database Cluster'
    type: 'server' | 'database' | 'network_device';
    cpuUsage: number; // percentage
    memoryUsage: number; // percentage
    diskUsage: number; // percentage
    networkInMbps: number; // Mbps
    networkOutMbps: number; // Mbps
    status: 'healthy' | 'warning' | 'critical';
    lastUpdated: string;
};

export type EventLog = {
    id: string;
    timestamp: string;
    type: 'alert' | 'status_change' | 'config_update' | 'system_event' | 'user_action';
    description: string;
    apiProvider?: string;
    severity?: 'info' | 'warning' | 'error' | 'success';
    details?: Record<string, any>;
};

export type UserActivity = {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    targetId?: string; // ID of the resource affected (e.g., incident ID, alert rule ID)
    details: string; // e.g., "Updated alert rule 'High Latency Plaid'", "Resolved incident INC-123"
};

export type MaintenanceEvent = {
    id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    impactedServices: string[];
    severityOfImpact: 'none' | 'minor' | 'major' | 'outage';
    responsibleTeam: string;
    ticketId?: string;
};

export type AnomalyDetectionSetting = {
    id: string;
    metric: 'latency' | 'errorRate' | 'throughput';
    apiProvider: string;
    detectionMethod: 'std_dev' | 'moving_average_deviation';
    thresholdMultiplier: number; // e.g., 2 for 2 standard deviations
    timeWindowMinutes: number; // For moving average or STD dev calculation
    enabled: boolean;
};

export type ReportGenerationRequest = {
    id: string;
    reportType: 'daily_summary' | 'weekly_performance' | 'monthly_slo' | 'custom_metrics';
    status: 'pending' | 'generating' | 'completed' | 'failed';
    requestedBy: string;
    requestedAt: string;
    completedAt?: string;
    downloadUrl?: string;
    parameters?: Record<string, any>; // e.g., { startDate, endDate, apiProvider }
};

export type WebhookConfiguration = {
    id: string;
    name: string;
    url: string;
    eventType: 'alert_trigger' | 'incident_update' | 'maintenance_start' | 'all';
    headers?: Record<string, string>;
    bodyTemplate?: string; // e.g., JSON string template
    enabled: boolean;
    lastSentStatus?: 'success' | 'failed';
    lastSentTime?: string;
};

// --- Mock Data Generation Utilities ---

const currentTimestamp = Date.now();
const generateMockHistoricalData = (length: number, base: number, fluctuation: number, isPercent = false): HistoricalMetricData[] => {
    return Array.from({ length }, (_, i) => ({
        timestamp: currentTimestamp - (length - 1 - i) * 5 * 60 * 1000, // 5 minute intervals
        value: Math.max(isPercent ? 0 : 1, Math.min(isPercent ? 100 : base * 2, base + (Math.random() - 0.5) * fluctuation * 2))
    }));
};

const generateMockAPIProviderMetrics = (provider: string): APIProviderMetrics => {
    return {
        provider,
        latency: generateMockHistoricalData(120, 150, 75), // 10 hours of 5-min data
        errorRate: generateMockHistoricalData(120, 0.5, 1.5, true), // 0-5% error rate
        throughput: generateMockHistoricalData(120, 200, 150),
        availability: generateMockHistoricalData(120, 99.99, 0.01, true) // 99.99% availability
    };
};

export const MOCK_API_METRICS: APIProviderMetrics[] = [
    generateMockAPIProviderMetrics('Plaid'),
    generateMockAPIProviderMetrics('Stripe'),
    generateMockAPIProviderMetrics('Gemini'),
];

export const MOCK_INCIDENTS: Incident[] = Array.from({ length: 25 }, (_, i) => {
    const providers = ['Plaid', 'Stripe', 'Gemini', 'Global'];
    const severities = ['critical', 'high', 'medium', 'low'];
    const statuses = ['open', 'resolved', 'acknowledged'];
    const descriptions = [
        'High latency spike detected', 'Service unavailable in APAC region', 'Partial outage: Authentication failures',
        'API endpoint /v1/transactions returning 5xx errors', 'Degraded performance on payment processing',
        'Increased error rates on webhook delivery', 'Data synchronization delays', 'CDN performance degradation'
    ];
    const openedAt = new Date(currentTimestamp - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const resolvedAt = status === 'resolved' ? new Date(currentTimestamp - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined;
    const acknowledgedBy = status === 'acknowledged' ? 'Incident Manager' : undefined;

    return {
        id: `INC-${1000 + i}`,
        apiProvider: providers[Math.floor(Math.random() * providers.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        status: status as Incident['status'],
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        openedAt,
        resolvedAt,
        acknowledgedBy,
        impactedEndpoints: Math.random() > 0.5 ? ['/v1/payments', '/v1/users'] : undefined,
        rootCause: status === 'resolved' ? 'Database connection pool exhaustion' : undefined,
        resolutionSteps: status === 'resolved' ? 'Increased database connection limit, restarted affected services.' : undefined,
        relatedAlertIds: Math.random() > 0.7 ? [`ALRT-${Math.floor(Math.random() * 5)}`, `ALRT-${Math.floor(Math.random() * 5) + 5}`] : undefined,
    };
});

export const MOCK_ALERT_RULES: AlertRule[] = Array.from({ length: 15 }, (_, i) => {
    const providers = ['Plaid', 'Stripe', 'Gemini', 'Global'];
    const metrics: AlertRule['metric'][] = ['latency', 'errorRate', 'throughput', 'availability'];
    const operators: AlertRule['operator'][] = ['gt', 'lt'];
    const units = {
        latency: 'ms',
        errorRate: '%',
        throughput: 'req/s',
        availability: '%'
    };
    const channels: AlertRule['channels'][number][] = ['email', 'slack', 'pagerduty', 'webhook'];

    const metric = metrics[Math.floor(Math.random() * metrics.length)];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    const unit = units[metric];
    let threshold: number;
    if (metric === 'latency') threshold = Math.round(50 + Math.random() * 200);
    else if (metric === 'errorRate') threshold = parseFloat((1 + Math.random() * 9).toFixed(1));
    else if (metric === 'throughput') threshold = Math.round(100 + Math.random() * 500);
    else threshold = parseFloat((95 + Math.random() * 4.9).toFixed(2)); // Availability 95-99.9%

    return {
        id: `ALRT-${100 + i}`,
        name: `${metric.charAt(0).toUpperCase() + metric.slice(1)} ${operator === 'gt' ? '>' : '<'} ${threshold}${unit} on ${providers[Math.floor(Math.random() * providers.length)]}`,
        apiProvider: providers[Math.floor(Math.random() * providers.length)],
        metric,
        threshold,
        operator,
        unit,
        channels: Array.from({ length: Math.ceil(Math.random() * 3) }, () => channels[Math.floor(Math.random() * channels.length)]),
        enabled: Math.random() > 0.2,
        lastTriggered: Math.random() > 0.5 ? new Date(currentTimestamp - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        timeWindowSeconds: Math.random() > 0.5 ? 60 : 300,
        evaluationFrequencySeconds: Math.random() > 0.5 ? 30 : 60,
    };
});

export const MOCK_SLOS: SLO[] = Array.from({ length: 10 }, (_, i) => {
    const providers = ['Plaid', 'Stripe', 'Gemini', 'Global'];
    const objectives: SLO['objective'][] = ['availability', 'latency', 'errorRate'];
    const periods: SLO['period'][] = ['daily', 'weekly', 'monthly'];

    const objective = objectives[Math.floor(Math.random() * objectives.length)];
    const period = periods[Math.floor(Math.random() * periods.length)];
    let target: number;
    let unit: SLO['unit'];
    if (objective === 'availability') { target = parseFloat((0.999 + Math.random() * 0.0009).toFixed(4)); unit = '%'; }
    else if (objective === 'latency') { target = Math.round(100 + Math.random() * 150); unit = 'ms'; }
    else { target = parseFloat((0.001 + Math.random() * 0.005).toFixed(3)); unit = 'decimal'; } // Error rate

    const currentAchieved = target + (Math.random() - 0.5) * (objective === 'latency' ? 50 : 0.001); // Simulate slight deviation
    const breachCount = Math.floor(Math.random() * 5);

    return {
        id: `SLO-${200 + i}`,
        name: `${objective.charAt(0).toUpperCase() + objective.slice(1)} Target for ${providers[Math.floor(Math.random() * providers.length)]}`,
        apiProvider: providers[Math.floor(Math.random() * providers.length)],
        objective,
        target,
        period,
        unit,
        currentAchieved: parseFloat(currentAchieved.toFixed(objective === 'latency' ? 0 : 4)),
        breachCount: breachCount,
        lastReported: new Date(currentTimestamp - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
});

export const MOCK_SYSTEM_RESOURCES: SystemResource[] = Array.from({ length: 5 }, (_, i) => {
    const names = ['App Server 1', 'App Server 2', 'DB Replica 1', 'Load Balancer 1', 'Monitoring Agent'];
    const types: SystemResource['type'][] = ['server', 'server', 'database', 'network_device', 'server'];
    const statusOptions: SystemResource['status'][] = ['healthy', 'warning', 'critical'];
    const status = i === 0 ? 'healthy' : statusOptions[Math.floor(Math.random() * statusOptions.length)];

    return {
        id: `SYS-${i + 1}`,
        name: names[i],
        type: types[i],
        cpuUsage: status === 'critical' ? 90 + Math.random() * 10 : Math.round(10 + Math.random() * 50),
        memoryUsage: status === 'critical' ? 85 + Math.random() * 15 : Math.round(20 + Math.random() * 40),
        diskUsage: Math.round(30 + Math.random() * 60),
        networkInMbps: Math.round(10 + Math.random() * 200),
        networkOutMbps: Math.round(10 + Math.random() * 200),
        status,
        lastUpdated: new Date(currentTimestamp - Math.random() * 60 * 1000).toISOString(),
    };
});

export const MOCK_EVENT_LOGS: EventLog[] = Array.from({ length: 50 }, (_, i) => {
    const types: EventLog['type'][] = ['alert', 'status_change', 'config_update', 'system_event', 'user_action'];
    const severities: EventLog['severity'][] = ['info', 'warning', 'error', 'success'];
    const descriptions = [
        'Alert triggered: High Latency Plaid', 'Stripe API status changed to Degraded Performance',
        'Plaid API configuration updated by Admin', 'Monitoring service restarted', 'User ' + (i % 2 === 0 ? 'Alice' : 'Bob') + ' updated alert rule ALRT-105',
        'Gemini throughput decreased by 20%', 'New incident INC-1015 created', 'System backup initiated',
        'New SLO SLO-203 created', 'Webhook WHK-301 delivery failed'
    ];
    const apiProviders = ['Plaid', 'Stripe', 'Gemini'];

    return {
        id: `EVT-${3000 + i}`,
        timestamp: new Date(currentTimestamp - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
        type: types[Math.floor(Math.random() * types.length)],
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        apiProvider: Math.random() > 0.5 ? apiProviders[Math.floor(Math.random() * apiProviders.length)] : undefined,
        severity: severities[Math.floor(Math.random() * severities.length)],
        details: { relatedId: `ID-${Math.floor(Math.random() * 1000)}` },
    };
});

export const MOCK_MAINTENANCE_EVENTS: MaintenanceEvent[] = Array.from({ length: 10 }, (_, i) => {
    const titles = ['Database Upgrade', 'Network Infrastructure Update', 'API Gateway Maintenance', 'Security Patching'];
    const impactedServices = [['Plaid', 'Stripe'], ['Global'], ['Gemini'], ['All APIs']];
    const statuses: MaintenanceEvent['status'][] = ['scheduled', 'in_progress', 'completed', 'cancelled'];
    const impactSeverities: MaintenanceEvent['severityOfImpact'][] = ['none', 'minor', 'major', 'outage'];
    const teams = ['DevOps', 'Infrastructure', 'Security'];

    const startTime = new Date(currentTimestamp + (i - 5) * 24 * 60 * 60 * 1000).toISOString(); // Some past, some future
    const endTime = new Date(new Date(startTime).getTime() + (1 + Math.random()) * 4 * 60 * 60 * 1000).toISOString();

    return {
        id: `MNT-${i + 1}`,
        title: titles[Math.floor(Math.random() * titles.length)],
        description: `Scheduled maintenance for ${titles[Math.floor(Math.random() * titles.length)]}`,
        startTime,
        endTime,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        impactedServices: impactedServices[Math.floor(Math.random() * impactedServices.length)],
        severityOfImpact: impactSeverities[Math.floor(Math.random() * impactSeverities.length)],
        responsibleTeam: teams[Math.floor(Math.random() * teams.length)],
        ticketId: `MTNT-${500 + i}`,
    };
});

export const MOCK_ANOMALY_SETTINGS: AnomalyDetectionSetting[] = Array.from({ length: 6 }, (_, i) => {
    const metrics: AnomalyDetectionSetting['metric'][] = ['latency', 'errorRate', 'throughput'];
    const providers = ['Plaid', 'Stripe', 'Gemini'];
    const methods: AnomalyDetectionSetting['detectionMethod'][] = ['std_dev', 'moving_average_deviation'];

    return {
        id: `ANOM-${i + 1}`,
        apiProvider: providers[Math.floor(Math.random() * providers.length)],
        metric: metrics[Math.floor(Math.random() * metrics.length)],
        detectionMethod: methods[Math.floor(Math.random() * methods.length)],
        thresholdMultiplier: parseFloat((1.5 + Math.random() * 2).toFixed(1)),
        timeWindowMinutes: Math.random() > 0.5 ? 5 : 15,
        enabled: Math.random() > 0.1,
    };
});

export const MOCK_WEBHOOK_CONFIGS: WebhookConfiguration[] = Array.from({ length: 5 }, (_, i) => {
    const eventTypes: WebhookConfiguration['eventType'][] = ['alert_trigger', 'incident_update', 'maintenance_start', 'all'];
    const urls = [
        'https://example.com/webhook/alerts',
        'https://my.slack.com/hooks/xyz',
        'https://pageduty.com/events/abc',
        'https://another.service/event'
    ];
    return {
        id: `WHK-${300 + i}`,
        name: `Webhook ${i + 1}`,
        url: urls[Math.floor(Math.random() * urls.length)],
        eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        enabled: Math.random() > 0.1,
        lastSentStatus: Math.random() > 0.2 ? 'success' : 'failed',
        lastSentTime: new Date(currentTimestamp - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    };
});


// --- Reusable UI Components (exported) ---

export const ExportedStatusIndicator: React.FC<{ status: APIStatus['status']; detailed?: boolean }> = ({ status, detailed = false }) => {
    const colors = {
        'Operational': { bg: 'bg-green-500/20', text: 'text-green-300', dot: 'bg-green-400' },
        'Degraded Performance': { bg: 'bg-yellow-500/20', text: 'text-yellow-300', dot: 'bg-yellow-400' },
        'Partial Outage': { bg: 'bg-orange-500/20', text: 'text-orange-300', dot: 'bg-orange-400' },
        'Major Outage': { bg: 'bg-red-500/20', text: 'text-red-300', dot: 'bg-red-400' },
    };
    const style = colors[status];
    return (
        <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} ${detailed ? 'min-w-[120px] justify-center' : ''}`}>
            <div className={`w-2 h-2 rounded-full ${style.dot}`}></div>
            {status}
        </div>
    );
};

export const ExportedLoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const spinnerSize = {
        sm: 'w-4 h-4 border-2',
        md: 'w-6 h-6 border-3',
        lg: 'w-8 h-8 border-4',
    }[size];
    return (
        <div className="flex items-center justify-center p-4">
            <div className={`animate-spin rounded-full ${spinnerSize} border-t-transparent border-blue-500`}></div>
            <span className="sr-only">Loading...</span>
        </div>
    );
};

export const ExportedPagination: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = useMemo(() => {
        const pages: (number | '...')[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            if (currentPage > 2 && currentPage < totalPages - 1) pages.push(currentPage - 1);
            if (currentPage > 1 && currentPage < totalPages) pages.push(currentPage);
            if (currentPage < totalPages - 1 && currentPage > 0) pages.push(currentPage + 1);
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return Array.from(new Set(pages)).filter(p => p !== '...').map(p => typeof p === 'number' ? p : '...');
    }, [currentPage, totalPages]);

    return (
        <div className="flex items-center justify-between text-sm text-gray-400 pt-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>
            <div className="flex gap-2">
                {pageNumbers.map((page, index) =>
                    page === '...' ? (
                        <span key={index} className="px-3 py-1">...</span>
                    ) : (
                        <button
                            key={index}
                            onClick={() => onPageChange(page as number)}
                            className={`px-3 py-1 rounded-md ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                        >
                            {page}
                        </button>
                    )
                )}
            </div>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </div>
    );
};

export const ExportedSearchFilter: React.FC<{
    searchTerm: string;
    onSearchChange: (term: string) => void;
    placeholder?: string;
    className?: string;
}> = ({ searchTerm, onSearchChange, placeholder = 'Search...', className = '' }) => (
    <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className={`w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white ${className}`}
    />
);

export const ExportedTimeRangeSelector: React.FC<{
    selectedRange: string;
    onRangeChange: (range: string) => void;
    className?: string;
}> = ({ selectedRange, onRangeChange, className = '' }) => {
    const ranges = [
        { label: 'Last 1 Hour', value: '1h' },
        { label: 'Last 6 Hours', value: '6h' },
        { label: 'Last 24 Hours', value: '24h' },
        { label: 'Last 7 Days', value: '7d' },
        { label: 'Last 30 Days', value: '30d' },
    ];
    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {ranges.map(range => (
                <button
                    key={range.value}
                    onClick={() => onRangeChange(range.value)}
                    className={`px-3 py-1 text-xs rounded-md ${selectedRange === range.value ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                >
                    {range.label}
                </button>
            ))}
        </div>
    );
};


// --- Chart Components (exported) ---

export const ExportedHistoricalLineChart: React.FC<{
    data: HistoricalMetricData[];
    dataKey: string;
    name: string;
    color: string;
    unit?: string;
    title: string;
    height?: number;
}> = ({ data, dataKey, name, color, unit = '', title, height = 180 }) => {
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-800/80 p-2 rounded-md border border-gray-600 text-sm text-white">
                    <p className="font-semibold">{new Date(label).toLocaleString()}</p>
                    <p style={{ color: payload[0].color }}>{`${payload[0].name}: ${payload[0].value.toFixed(2)}${unit}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-2">
            <h5 className="text-md font-semibold text-gray-300">{title}</h5>
            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                    <XAxis
                        dataKey="timestamp"
                        type="number"
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={(unixTime) => new Date(unixTime).toLocaleTimeString()}
                        stroke="#9ca3af"
                        fontSize={12}
                        interval="preserveStartEnd"
                        minTickGap={20}
                    />
                    <YAxis stroke="#9ca3af" fontSize={12} unit={unit} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey={dataKey} stroke={color} name={name} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export const ExportedAPIChartsPanel: React.FC<{ apiProvider: APIProviderMetrics }> = ({ apiProvider }) => {
    const [timeRange, setTimeRange] = useState('24h'); // Default time range for charts

    const filterDataByTimeRange = (data: HistoricalMetricData[]) => {
        const now = currentTimestamp;
        let startTime = now;
        switch (timeRange) {
            case '1h': startTime = now - 60 * 60 * 1000; break;
            case '6h': startTime = now - 6 * 60 * 60 * 1000; break;
            case '24h': startTime = now - 24 * 60 * 60 * 1000; break;
            case '7d': startTime = now - 7 * 24 * 60 * 60 * 1000; break;
            case '30d': startTime = now - 30 * 24 * 60 * 60 * 1000; break;
        }
        return data.filter(d => d.timestamp >= startTime);
    };

    const filteredLatency = useMemo(() => filterDataByTimeRange(apiProvider.latency), [apiProvider.latency, timeRange]);
    const filteredErrorRate = useMemo(() => filterDataByTimeRange(apiProvider.errorRate), [apiProvider.errorRate, timeRange]);
    const filteredThroughput = useMemo(() => filterDataByTimeRange(apiProvider.throughput), [apiProvider.throughput, timeRange]);
    const filteredAvailability = useMemo(() => filterDataByTimeRange(apiProvider.availability), [apiProvider.availability, timeRange]);

    return (
        <Card title={`${apiProvider.provider} Detailed Metrics`}>
            <div className="mb-4">
                <ExportedTimeRangeSelector selectedRange={timeRange} onRangeChange={setTimeRange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                <ExportedHistoricalLineChart
                    data={filteredLatency}
                    dataKey="value"
                    name="Latency"
                    color="#8884d8"
                    unit="ms"
                    title="Latency (ms)"
                />
                <ExportedHistoricalLineChart
                    data={filteredErrorRate}
                    dataKey="value"
                    name="Error Rate"
                    color="#f87171"
                    unit="%"
                    title="Error Rate (%)"
                />
                <ExportedHistoricalLineChart
                    data={filteredThroughput}
                    dataKey="value"
                    name="Throughput"
                    color="#82ca9d"
                    unit="req/s"
                    title="Throughput (Requests/sec)"
                />
                <ExportedHistoricalLineChart
                    data={filteredAvailability}
                    dataKey="value"
                    name="Availability"
                    color="#a78bfa"
                    unit="%"
                    title="Availability (%)"
                />
            </div>
        </Card>
    );
};


// --- Dashboard Sections / Feature Components (exported) ---

export const ExportedGlobalStatusOverview: React.FC<{ apiStatus: APIStatus[] }> = ({ apiStatus }) => {
    const overallStatus = useMemo(() => {
        if (apiStatus.some(api => api.status === 'Major Outage')) return 'Major Outage';
        if (apiStatus.some(api => api.status === 'Partial Outage')) return 'Partial Outage';
        if (apiStatus.some(api => api.status === 'Degraded Performance')) return 'Degraded Performance';
        return 'Operational';
    }, [apiStatus]);

    const statusCounts = useMemo(() => {
        return apiStatus.reduce((acc, api) => {
            acc[api.status] = (acc[api.status] || 0) + 1;
            return acc;
        }, {} as Record<APIStatus['status'], number>);
    }, [apiStatus]);

    const PIE_COLORS = {
        'Operational': '#82ca9d', // green
        'Degraded Performance': '#f8c057', // yellow
        'Partial Outage': '#f5a623', // orange
        'Major Outage': '#f87171', // red
    };

    const pieData = Object.entries(statusCounts).map(([status, count]) => ({
        name: status,
        value: count,
        color: PIE_COLORS[status as APIStatus['status']] || '#ccc',
    }));

    return (
        <Card title="Overall System Health">
            <div className="flex flex-col lg:flex-row items-center justify-between p-4">
                <div className="flex flex-col items-center lg:items-start mb-4 lg:mb-0">
                    <h3 className="text-xl font-bold text-gray-200">Current System Status:</h3>
                    <ExportedStatusIndicator status={overallStatus} detailed={true} />
                </div>
                <div className="flex-1 min-w-0 h-48 lg:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                            <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    );
};

export const ExportedIncidentLogTable: React.FC = () => {
    const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterSeverity, setFilterSeverity] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const incidentsPerPage = 10;

    const filteredIncidents = useMemo(() => {
        let filtered = incidents;
        if (searchTerm) {
            filtered = filtered.filter(inc =>
                inc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inc.apiProvider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inc.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (filterStatus !== 'all') {
            filtered = filtered.filter(inc => inc.status === filterStatus);
        }
        if (filterSeverity !== 'all') {
            filtered = filtered.filter(inc => inc.severity === filterSeverity);
        }
        return filtered;
    }, [incidents, searchTerm, filterStatus, filterSeverity]);

    const totalPages = Math.ceil(filteredIncidents.length / incidentsPerPage);
    const currentIncidents = useMemo(() => {
        const startIndex = (currentPage - 1) * incidentsPerPage;
        return filteredIncidents.slice(startIndex, startIndex + incidentsPerPage);
    }, [filteredIncidents, currentPage, incidentsPerPage]);

    const handleAcknowledge = (id: string) => {
        setIncidents(prev => prev.map(inc => inc.id === id && inc.status === 'open' ? { ...inc, status: 'acknowledged', acknowledgedBy: 'Current User' } : inc));
        // Simulate API call and success notification
        console.log(`Incident ${id} acknowledged.`);
    };

    const handleResolve = (id: string) => {
        setIncidents(prev => prev.map(inc => inc.id === id && inc.status !== 'resolved' ? { ...inc, status: 'resolved', resolvedAt: new Date().toISOString(), rootCause: 'Manually resolved by user' } : inc));
        // Simulate API call and success notification
        console.log(`Incident ${id} resolved.`);
    };

    const getSeverityClass = (severity: Incident['severity']) => {
        switch (severity) {
            case 'critical': return 'text-red-400 font-bold';
            case 'high': return 'text-orange-400 font-semibold';
            case 'medium': return 'text-yellow-400';
            case 'low': return 'text-gray-400';
            default: return 'text-gray-400';
        }
    };

    const getStatusClass = (status: Incident['status']) => {
        switch (status) {
            case 'open': return 'bg-red-500/20 text-red-300';
            case 'acknowledged': return 'bg-yellow-500/20 text-yellow-300';
            case 'resolved': return 'bg-green-500/20 text-green-300';
            default: return 'bg-gray-500/20 text-gray-300';
        }
    };


    return (
        <Card title="Incident Log">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <ExportedSearchFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Search incidents..." className="flex-1" />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                    <option value="all">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="resolved">Resolved</option>
                </select>
                <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Provider
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Description
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Severity
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Opened At
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                        {currentIncidents.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-4 text-center text-gray-400">No incidents found.</td>
                            </tr>
                        ) : (
                            currentIncidents.map((incident) => (
                                <tr key={incident.id} className="hover:bg-gray-800">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400">{incident.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{incident.apiProvider}</td>
                                    <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">{incident.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={getSeverityClass(incident.severity)}>{incident.severity}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(incident.status)}`}>
                                            {incident.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {new Date(incident.openedAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {incident.status === 'open' && (
                                            <button
                                                onClick={() => handleAcknowledge(incident.id)}
                                                className="text-yellow-500 hover:text-yellow-400 mr-3"
                                            >
                                                Acknowledge
                                            </button>
                                        )}
                                        {incident.status !== 'resolved' && (
                                            <button
                                                onClick={() => handleResolve(incident.id)}
                                                className="text-green-500 hover:text-green-400"
                                            >
                                                Resolve
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <ExportedPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </Card>
    );
};

export const ExportedAlertConfigurationPanel: React.FC = () => {
    const [alertRules, setAlertRules] = useState<AlertRule[]>(MOCK_ALERT_RULES);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProvider, setFilterProvider] = useState('all');
    const [filterEnabled, setFilterEnabled] = useState('all');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newRule, setNewRule] = useState<Partial<AlertRule>>({ enabled: true, channels: ['email'] });

    const filteredRules = useMemo(() => {
        let filtered = alertRules;
        if (searchTerm) {
            filtered = filtered.filter(rule =>
                rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rule.apiProvider.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (filterProvider !== 'all') {
            filtered = filtered.filter(rule => rule.apiProvider === filterProvider);
        }
        if (filterEnabled !== 'all') {
            filtered = filtered.filter(rule => rule.enabled === (filterEnabled === 'enabled'));
        }
        return filtered;
    }, [alertRules, searchTerm, filterProvider, filterEnabled]);

    const handleNewRuleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (name === 'channels') {
            const options = (e.target as HTMLSelectElement).options;
            const selectedChannels: AlertRule['channels'] = [];
            for (let i = 0, l = options.length; i < l; i++) {
                if (options[i].selected) {
                    selectedChannels.push(options[i].value as AlertRule['channels'][number]);
                }
            }
            setNewRule(prev => ({ ...prev, channels: selectedChannels }));
        } else if (type === 'checkbox') {
            setNewRule(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setNewRule(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
            setNewRule(prev => ({ ...prev, threshold: value }));
        }
    };

    const handleCreateRule = () => {
        if (!newRule.name || !newRule.apiProvider || !newRule.metric || newRule.threshold === undefined || !newRule.operator || !newRule.unit || newRule.channels?.length === 0) {
            alert('Please fill all required fields for the alert rule.');
            return;
        }

        const ruleToAdd: AlertRule = {
            ...newRule,
            id: `ALRT-${alertRules.length + 101}`,
            enabled: newRule.enabled ?? true,
            channels: newRule.channels || ['email'],
            apiProvider: newRule.apiProvider, // Ensure these are set, even if partial allows undefined
            metric: newRule.metric,
            operator: newRule.operator,
            threshold: newRule.threshold,
            unit: newRule.unit,
        };
        setAlertRules(prev => [...prev, ruleToAdd]);
        setIsAddingNew(false);
        setNewRule({ enabled: true, channels: ['email'] }); // Reset form
        console.log('New alert rule created:', ruleToAdd);
    };

    const handleToggleRule = (id: string) => {
        setAlertRules(prev => prev.map(rule => rule.id === id ? { ...rule, enabled: !rule.enabled } : rule));
        console.log(`Toggled alert rule ${id}`);
    };

    const handleDeleteRule = (id: string) => {
        if (window.confirm('Are you sure you want to delete this alert rule?')) {
            setAlertRules(prev => prev.filter(rule => rule.id !== id));
            console.log(`Deleted alert rule ${id}`);
        }
    };

    return (
        <Card title="Alert Rule Configuration">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <ExportedSearchFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Search alert rules..." className="flex-1" />
                <select
                    value={filterProvider}
                    onChange={(e) => setFilterProvider(e.target.value)}
                    className="p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                    <option value="all">All Providers</option>
                    {['Plaid', 'Stripe', 'Gemini', 'Global'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select
                    value={filterEnabled}
                    onChange={(e) => setFilterEnabled(e.target.value)}
                    className="p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                    <option value="all">All Statuses</option>
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                </select>
                <button
                    onClick={() => setIsAddingNew(!isAddingNew)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium"
                >
                    {isAddingNew ? 'Cancel Add' : 'Add New Rule'}
                </button>
            </div>

            {isAddingNew && (
                <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-lg">
                    <h4 className="text-xl font-semibold text-white mb-4">Add New Alert Rule</h4>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Rule Name:</label>
                            <input
                                type="text"
                                name="name"
                                value={newRule.name || ''}
                                onChange={handleNewRuleChange}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">API Provider:</label>
                            <select
                                name="apiProvider"
                                value={newRule.apiProvider || ''}
                                onChange={handleNewRuleChange}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                required
                            >
                                <option value="">Select Provider</option>
                                {['Plaid', 'Stripe', 'Gemini', 'Global'].map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Metric:</label>
                            <select
                                name="metric"
                                value={newRule.metric || ''}
                                onChange={handleNewRuleChange}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                required
                            >
                                <option value="">Select Metric</option>
                                <option value="latency">Latency</option>
                                <option value="errorRate">Error Rate</option>
                                <option value="throughput">Throughput</option>
                                <option value="availability">Availability</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Operator:</label>
                            <select
                                name="operator"
                                value={newRule.operator || ''}
                                onChange={handleNewRuleChange}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                required
                            >
                                <option value="">Select Operator</option>
                                <option value="gt">Greater Than ( &gt; )</option>
                                <option value="lt">Less Than ( &lt; )</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Threshold:</label>
                            <input
                                type="number"
                                name="threshold"
                                value={newRule.threshold || ''}
                                onChange={handleThresholdChange}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Unit:</label>
                            <select
                                name="unit"
                                value={newRule.unit || ''}
                                onChange={handleNewRuleChange}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                required
                            >
                                <option value="">Select Unit</option>
                                <option value="ms">ms</option>
                                <option value="%">%</option>
                                <option value="req/s">req/s</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-gray-400 text-sm font-bold mb-2">Notification Channels:</label>
                            <select
                                name="channels"
                                multiple
                                value={newRule.channels || []}
                                onChange={handleNewRuleChange}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white h-24"
                                required
                            >
                                <option value="email">Email</option>
                                <option value="slack">Slack</option>
                                <option value="pagerduty">PagerDuty</option>
                                <option value="webhook">Webhook</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 flex items-center">
                            <input
                                type="checkbox"
                                name="enabled"
                                checked={newRule.enabled ?? true}
                                onChange={handleNewRuleChange}
                                className="mr-2 h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                            />
                            <label className="text-gray-400 text-sm">Enabled</label>
                        </div>
                    </form>
                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={() => setIsAddingNew(false)}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleCreateRule}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
                        >
                            Create Rule
                        </button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Provider
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Metric
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Threshold
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Channels
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Enabled
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Last Triggered
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                        {filteredRules.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-4 text-center text-gray-400">No alert rules found.</td>
                            </tr>
                        ) : (
                            filteredRules.map((rule) => (
                                <tr key={rule.id} className="hover:bg-gray-800">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{rule.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{rule.apiProvider}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{rule.metric}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {rule.operator === 'gt' ? '>' : '<'} {rule.threshold}{rule.unit}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        {rule.channels.join(', ')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${rule.enabled ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                            {rule.enabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {rule.lastTriggered ? new Date(rule.lastTriggered).toLocaleString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleToggleRule(rule.id)}
                                            className={`${rule.enabled ? 'text-orange-500' : 'text-green-500'} hover:${rule.enabled ? 'text-orange-400' : 'text-green-400'} mr-3`}
                                        >
                                            {rule.enabled ? 'Disable' : 'Enable'}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRule(rule.id)}
                                            className="text-red-500 hover:text-red-400"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};


export const ExportedSLOManagementPanel: React.FC = () => {
    const [slos, setSlos] = useState<SLO[]>(MOCK_SLOS);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProvider, setFilterProvider] = useState('all');
    const [filterObjective, setFilterObjective] = useState('all');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newSLO, setNewSLO] = useState<Partial<SLO>>({});

    const filteredSLOs = useMemo(() => {
        let filtered = slos;
        if (searchTerm) {
            filtered = filtered.filter(slo =>
                slo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                slo.apiProvider.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (filterProvider !== 'all') {
            filtered = filtered.filter(slo => slo.apiProvider === filterProvider);
        }
        if (filterObjective !== 'all') {
            filtered = filtered.filter(slo => slo.objective === filterObjective);
        }
        return filtered;
    }, [slos, searchTerm, filterProvider, filterObjective]);

    const handleNewSLOChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'number') {
            setNewSLO(prev => ({ ...prev, [name]: parseFloat(value) }));
        } else {
            setNewSLO(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCreateSLO = () => {
        if (!newSLO.name || !newSLO.apiProvider || !newSLO.objective || newSLO.target === undefined || !newSLO.period || !newSLO.unit) {
            alert('Please fill all required fields for the SLO.');
            return;
        }

        const sloToAdd: SLO = {
            ...newSLO,
            id: `SLO-${slos.length + 201}`,
            apiProvider: newSLO.apiProvider,
            objective: newSLO.objective,
            target: newSLO.target,
            period: newSLO.period,
            unit: newSLO.unit,
            currentAchieved: newSLO.currentAchieved ?? newSLO.target * (0.95 + Math.random() * 0.1), // Simulate initial value
            breachCount: 0,
            lastReported: new Date().toISOString(),
        };
        setSlos(prev => [...prev, sloToAdd]);
        setIsAddingNew(false);
        setNewSLO({}); // Reset form
        console.log('New SLO created:', sloToAdd);
    };

    const handleDeleteSLO = (id: string) => {
        if (window.confirm('Are you sure you want to delete this SLO?')) {
            setSlos(prev => prev.filter(slo => slo.id !== id));
            console.log(`Deleted SLO ${id}`);
        }
    };

    const getSLOStatus = (slo: SLO) => {
        if (slo.currentAchieved === undefined || slo.target === undefined) return 'N/A';
        const isBreached = slo.objective === 'latency' ? slo.currentAchieved > slo.target : slo.currentAchieved < slo.target;
        return isBreached ? 'Breached' : 'Met';
    };

    return (
        <Card title="Service Level Objectives (SLOs)">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <ExportedSearchFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Search SLOs..." className="flex-1" />
                <select
                    value={filterProvider}
                    onChange={(e) => setFilterProvider(e.target.value)}
                    className="p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                    <option value="all">All Providers</option>
                    {['Plaid', 'Stripe', 'Gemini', 'Global'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select
                    value={filterObjective}
                    onChange={(e) => setFilterObjective(e.target.value)}
                    className="p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                    <option value="all">All Objectives</option>
                    <option value="availability">Availability</option>
                    <option value="latency">Latency</option>
                    <option value="errorRate">Error Rate</option>
                </select>
                <button
                    onClick={() => setIsAddingNew(!isAddingNew)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium"
                >
                    {isAddingNew ? 'Cancel Add' : 'Add New SLO'}
                </button>
            </div>

            {isAddingNew && (
                <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-lg">
                    <h4 className="text-xl font-semibold text-white mb-4">Add New SLO</h4>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">SLO Name:</label>
                            <input
                                type="text"
                                name="name"
                                value={newSLO.name || ''}
                                onChange={handleNewSLOChange}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">API Provider:</label>
                            <select
                                name="apiProvider"
                                value={newSLO.apiProvider || ''}
                                onChange={handleNewSLOChange}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                required
                            >
                                <option value="">Select Provider</option>
                                {['Plaid', 'Stripe', 'Gemini', 'Global'].map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Objective:</label>
                            <select
                                name="objective"
                                value={newSLO.objective || ''}
                                onChange={handleNewSLOChange}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                required
                            >
                                <option value="">Select Objective</option>
                                <option value="availability">Availability</option>
                                <option value="latency">Latency</option>
                                <option value="errorRate">Error Rate</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Target Value:</label>
                            <input
                                type="number"
                                name="target"
                                value={newSLO.target || ''}
                                onChange={handleNewSLOChange}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                step={newSLO.objective === 'latency' ? '1' : '0.001'}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Period:</label>
                            <select
                                name="period"
                                value={newSLO.period || ''}
                                onChange={handleNewSLOChange}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                required
                            >
                                <option value="">Select Period</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Unit:</label>
                            <select
                                name="unit"
                                value={newSLO.unit || ''}
                                onChange={handleNewSLOChange}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                required
                            >
                                <option value="">Select Unit</option>
                                <option value="%">%</option>
                                <option value="ms">ms</option>
                                <option value="decimal">Decimal</option>
                            </select>
                        </div>
                    </form>
                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={() => setIsAddingNew(false)}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleCreateSLO}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
                        >
                            Create SLO
                        </button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Provider
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Objective
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Target
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Current
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Period
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Breaches
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                        {filteredSLOs.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-6 py-4 text-center text-gray-400">No SLOs found.</td>
                            </tr>
                        ) : (
                            filteredSLOs.map((slo) => (
                                <tr key={slo.id} className="hover:bg-gray-800">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{slo.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{slo.apiProvider}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{slo.objective}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {slo.target}{slo.unit}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {slo.currentAchieved}{slo.unit}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {slo.period}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSLOStatus(slo) === 'Met' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                            {getSLOStatus(slo)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-300">
                                        {slo.breachCount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleDeleteSLO(slo.id)}
                                            className="text-red-500 hover:text-red-400"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export const ExportedSystemResourceMonitor: React.FC = () => {
    const [resources, setResources] = useState<SystemResource[]>(MOCK_SYSTEM_RESOURCES);

    useEffect(() => {
        const interval = setInterval(() => {
            setResources(prev => prev.map(res => ({
                ...res,
                cpuUsage: Math.max(0, Math.min(100, res.cpuUsage + (Math.random() - 0.5) * 10)),
                memoryUsage: Math.max(0, Math.min(100, res.memoryUsage + (Math.random() - 0.5) * 8)),
                networkInMbps: Math.max(0, res.networkInMbps + (Math.random() - 0.5) * 50),
                networkOutMbps: Math.max(0, res.networkOutMbps + (Math.random() - 0.5) * 50),
                status: res.cpuUsage > 80 || res.memoryUsage > 80 ? 'critical' : res.cpuUsage > 60 || res.memoryUsage > 60 ? 'warning' : 'healthy',
                lastUpdated: new Date().toISOString(),
            })));
        }, 5000); // Update every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const getStatusIndicatorClass = (status: SystemResource['status']) => {
        switch (status) {
            case 'healthy': return 'bg-green-500/20 text-green-300';
            case 'warning': return 'bg-yellow-500/20 text-yellow-300';
            case 'critical': return 'bg-red-500/20 text-red-300';
            default: return 'bg-gray-500/20 text-gray-300';
        }
    };

    return (
        <Card title="System Resource Monitoring">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Resource
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                CPU Usage
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Memory Usage
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Disk Usage
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Network In/Out
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Last Updated
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                        {resources.map((res) => (
                            <tr key={res.id} className="hover:bg-gray-800">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{res.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">{res.type.replace('_', ' ')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{res.cpuUsage.toFixed(1)}%</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{res.memoryUsage.toFixed(1)}%</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{res.diskUsage.toFixed(1)}%</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{res.networkInMbps.toFixed(0)} / {res.networkOutMbps.toFixed(0)} Mbps</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusIndicatorClass(res.status)}`}>
                                        {res.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                    {new Date(res.lastUpdated).toLocaleTimeString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export const ExportedRealtimeEventStream: React.FC = () => {
    const [events, setEvents] = useState<EventLog[]>(() => MOCK_EVENT_LOGS.slice(0, 10).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    const [totalEventsCount, setTotalEventsCount] = useState(MOCK_EVENT_LOGS.length);
    const [newEventsCount, setNewEventsCount] = useState(0);

    const getSeverityIcon = (severity: EventLog['severity']) => {
        switch (severity) {
            case 'info': return <span className="text-blue-400">i</span>;
            case 'warning': return <span className="text-yellow-400">!</span>;
            case 'error': return <span className="text-red-400">✕</span>;
            case 'success': return <span className="text-green-400">✓</span>;
            default: return null;
        }
    };

    const getSeverityColorClass = (severity: EventLog['severity']) => {
        switch (severity) {
            case 'info': return 'border-blue-500';
            case 'warning': return 'border-yellow-500';
            case 'error': return 'border-red-500';
            case 'success': return 'border-green-500';
            default: return 'border-gray-500';
        }
    };

    useEffect(() => {
        let lastEventIndex = 10;
        const interval = setInterval(() => {
            if (lastEventIndex < MOCK_EVENT_LOGS.length) {
                const newEvent = MOCK_EVENT_LOGS[lastEventIndex];
                setEvents(prev => {
                    const updatedEvents = [newEvent, ...prev.slice(0, 9)]; // Keep latest 10
                    return updatedEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                });
                setNewEventsCount(prev => prev + 1);
                lastEventIndex++;
            } else {
                // Loop back or stop
                lastEventIndex = 0; // For continuous simulation
            }
        }, 3000); // Add a new event every 3 seconds

        return () => clearInterval(interval);
    }, []);

    const handleClearNewEvents = () => {
        setNewEventsCount(0);
    };

    return (
        <Card title="Real-time Event Stream">
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-400">
                    Showing latest 10 events. Total events processed: {totalEventsCount}
                </p>
                {newEventsCount > 0 && (
                    <button onClick={handleClearNewEvents} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md">
                        Clear {newEventsCount} new events
                    </button>
                )}
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {events.map((event) => (
                    <div key={event.id} className={`flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg border-l-4 ${getSeverityColorClass(event.severity)}`}>
                        <div className="flex-shrink-0 mt-1">
                            {getSeverityIcon(event.severity)}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400">{new Date(event.timestamp).toLocaleString()}</span>
                                <span className="text-xs font-semibold text-blue-400 uppercase">{event.type.replace('_', ' ')}</span>
                            </div>
                            <p className="text-sm text-white mt-1">{event.description}</p>
                            {event.apiProvider && <p className="text-xs text-gray-500 mt-0.5">API: {event.apiProvider}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export const ExportedScheduledMaintenanceViewer: React.FC = () => {
    const [maintenanceEvents, setMaintenanceEvents] = useState<MaintenanceEvent[]>(MOCK_MAINTENANCE_EVENTS);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEvents = useMemo(() => {
        let filtered = maintenanceEvents;
        if (searchTerm) {
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.impactedServices.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        if (filterStatus !== 'all') {
            filtered = filtered.filter(event => event.status === filterStatus);
        }
        return filtered.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }, [maintenanceEvents, searchTerm, filterStatus]);

    const getStatusClass = (status: MaintenanceEvent['status']) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-500/20 text-blue-300';
            case 'in_progress': return 'bg-orange-500/20 text-orange-300';
            case 'completed': return 'bg-green-500/20 text-green-300';
            case 'cancelled': return 'bg-red-500/20 text-red-300';
            default: return 'bg-gray-500/20 text-gray-300';
        }
    };

    return (
        <Card title="Scheduled Maintenance">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <ExportedSearchFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Search maintenance events..." className="flex-1" />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                    <option value="all">All Statuses</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Title
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Start Time
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                End Time
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Impacted Services
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Impact
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                        {filteredEvents.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-gray-400">No maintenance events found.</td>
                            </tr>
                        ) : (
                            filteredEvents.map((event) => (
                                <tr key={event.id} className="hover:bg-gray-800">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{event.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(event.startTime).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(event.endTime).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(event.status)}`}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        {event.impactedServices.join(', ')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">
                                        {event.severityOfImpact.replace('_', ' ')}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export const ExportedAnomalyDetectionSettings: React.FC = () => {
    const [settings, setSettings] = useState<AnomalyDetectionSetting[]>(MOCK_ANOMALY_SETTINGS);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProvider, setFilterProvider] = useState('all');

    const filteredSettings = useMemo(() => {
        let filtered = settings;
        if (searchTerm) {
            filtered = filtered.filter(s =>
                s.apiProvider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.metric.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (filterProvider !== 'all') {
            filtered = filtered.filter(s => s.apiProvider === filterProvider);
        }
        return filtered;
    }, [settings, searchTerm, filterProvider]);

    const handleToggleSetting = (id: string) => {
        setSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
        console.log(`Toggled anomaly detection setting ${id}`);
    };

    return (
        <Card title="Anomaly Detection Settings">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <ExportedSearchFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Search settings..." className="flex-1" />
                <select
                    value={filterProvider}
                    onChange={(e) => setFilterProvider(e.target.value)}
                    className="p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                    <option value="all">All Providers</option>
                    {['Plaid', 'Stripe', 'Gemini'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Provider
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Metric
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Method
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Threshold
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Time Window
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Enabled
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                        {filteredSettings.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-4 text-center text-gray-400">No anomaly detection settings found.</td>
                            </tr>
                        ) : (
                            filteredSettings.map((setting) => (
                                <tr key={setting.id} className="hover:bg-gray-800">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{setting.apiProvider}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{setting.metric}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">{setting.detectionMethod.replace('_', ' ')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{setting.thresholdMultiplier}x Deviation</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{setting.timeWindowMinutes} min</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${setting.enabled ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                            {setting.enabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleToggleSetting(setting.id)}
                                            className={`${setting.enabled ? 'text-orange-500' : 'text-green-500'} hover:${setting.enabled ? 'text-orange-400' : 'text-green-400'}`}
                                        >
                                            {setting.enabled ? 'Disable' : 'Enable'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export const ExportedWebhooksIntegrationPanel: React.FC = () => {
    const [webhooks, setWebhooks] = useState<WebhookConfiguration[]>(MOCK_WEBHOOK_CONFIGS);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'enabled', 'disabled'
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newWebhook, setNewWebhook] = useState<Partial<WebhookConfiguration>>({ enabled: true, eventType: 'alert_trigger' });

    const filteredWebhooks = useMemo(() => {
        let filtered = webhooks;
        if (searchTerm) {
            filtered = filtered.filter(wh =>
                wh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                wh.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                wh.eventType.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (filterStatus !== 'all') {
            filtered = filtered.filter(wh => wh.enabled === (filterStatus === 'enabled'));
        }
        return filtered;
    }, [webhooks, searchTerm, filterStatus]);

    const handleNewWebhookChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target;
        setNewWebhook(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleCreateWebhook = () => {
        if (!newWebhook.name || !newWebhook.url || !newWebhook.eventType) {
            alert('Please fill all required fields for the webhook.');
            return;
        }

        const webhookToAdd: WebhookConfiguration = {
            ...newWebhook,
            id: `WHK-${webhooks.length + 301}`,
            enabled: newWebhook.enabled ?? true,
            name: newWebhook.name,
            url: newWebhook.url,
            eventType: newWebhook.eventType,
            headers: newWebhook.headers || {},
            bodyTemplate: newWebhook.bodyTemplate || '',
        };
        setWebhooks(prev => [...prev, webhookToAdd]);
        setIsAddingNew(false);
        setNewWebhook({ enabled: true, eventType: 'alert_trigger' });
        console.log('New webhook created:', webhookToAdd);
    };

    const handleToggleWebhook = (id: string) => {
        setWebhooks(prev => prev.map(wh => wh.id === id ? { ...wh, enabled: !wh.enabled } : wh));
        console.log(`Toggled webhook ${id}`);
    };

    const handleDeleteWebhook = (id: string) => {
        if (window.confirm('Are you sure you want to delete this webhook?')) {
            setWebhooks(prev => prev.filter(wh => wh.id !== id));
            console.log(`Deleted webhook ${id}`);
        }
    };

    return (
        <Card title="Webhooks Integration">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <ExportedSearchFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Search webhooks..." className="flex-1" />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                    <option value="all">All Statuses</option>
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                </select>
                <button
                    onClick={() => setIsAddingNew(!isAddingNew)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium"
                >
                    {isAddingNew ? 'Cancel Add' : 'Add New Webhook'}
                </button>
            </div>

            {isAddingNew && (
                <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-lg">
                    <h4 className="text-xl font-semibold text-white mb-4">Add New Webhook</h4>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Webhook Name:</label>
                            <input type="text" name="name" value={newWebhook.name || ''} onChange={handleNewWebhookChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" required />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">URL:</label>
                            <input type="url" name="url" value={newWebhook.url || ''} onChange={handleNewWebhookChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" required />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Event Type:</label>
                            <select name="eventType" value={newWebhook.eventType || ''} onChange={handleNewWebhookChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white" required>
                                <option value="alert_trigger">Alert Trigger</option>
                                <option value="incident_update">Incident Update</option>
                                <option value="maintenance_start">Maintenance Start</option>
                                <option value="all">All Events</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-gray-400 text-sm font-bold mb-2">Custom Headers (JSON):</label>
                            <textarea name="headers" value={JSON.stringify(newWebhook.headers || {}, null, 2)} onChange={e => {
                                try {
                                    setNewWebhook(prev => ({ ...prev, headers: JSON.parse(e.target.value) }));
                                } catch (error) {
                                    // Invalid JSON, handle error or show message
                                }
                            }} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white font-mono h-24"></textarea>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-gray-400 text-sm font-bold mb-2">Custom Body Template (JSON):</label>
                            <textarea name="bodyTemplate" value={newWebhook.bodyTemplate || ''} onChange={handleNewWebhookChange} placeholder='{"event": "{{eventType}}", "data": {{payload}}}' className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white font-mono h-32"></textarea>
                        </div>
                        <div className="md:col-span-2 flex items-center">
                            <input type="checkbox" name="enabled" checked={newWebhook.enabled ?? true} onChange={handleNewWebhookChange} className="mr-2 h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500" />
                            <label className="text-gray-400 text-sm">Enabled</label>
                        </div>
                    </form>
                    <div className="flex justify-end gap-3 mt-4">
                        <button type="button" onClick={() => setIsAddingNew(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white">Cancel</button>
                        <button type="button" onClick={handleCreateWebhook} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white">Create Webhook</button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                URL
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Event Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Enabled
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Last Sent
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                        {filteredWebhooks.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-gray-400">No webhooks configured.</td>
                            </tr>
                        ) : (
                            filteredWebhooks.map((webhook) => (
                                <tr key={webhook.id} className="hover:bg-gray-800">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{webhook.name}</td>
                                    <td className="px-6 py-4 text-sm text-blue-400 truncate max-w-xs">{webhook.url}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">{webhook.eventType.replace('_', ' ')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${webhook.enabled ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                            {webhook.enabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {webhook.lastSentTime ? new Date(webhook.lastSentTime).toLocaleString() : 'N/A'} ({webhook.lastSentStatus || 'N/A'})
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleToggleWebhook(webhook.id)}
                                            className={`${webhook.enabled ? 'text-orange-500' : 'text-green-500'} hover:${webhook.enabled ? 'text-orange-400' : 'text-green-400'} mr-3`}
                                        >
                                            {webhook.enabled ? 'Disable' : 'Enable'}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteWebhook(webhook.id)}
                                            className="text-red-500 hover:text-red-400"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};


// --- The main APIStatusView component, now acting as a dashboard orchestrator ---

const APIStatusView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("APIStatusView must be within a DataProvider.");
    const { apiStatus } = context;

    // Original StatusIndicator (kept for compatibility with original render, though ExportedStatusIndicator is preferred)
    const StatusIndicator: React.FC<{ status: APIStatus['status'] }> = ({ status }) => {
        const colors = {
            'Operational': { bg: 'bg-green-500/20', text: 'text-green-300', dot: 'bg-green-400' },
            'Degraded Performance': { bg: 'bg-yellow-500/20', text: 'text-yellow-300', dot: 'bg-yellow-400' },
            'Partial Outage': { bg: 'bg-orange-500/20', text: 'text-orange-300', dot: 'bg-orange-400' },
            'Major Outage': { bg: 'bg-red-500/20', text: 'text-red-300', dot: 'bg-red-400' },
        };
        const style = colors[status];
        return (
            <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                <div className={`w-2 h-2 rounded-full ${style.dot}`}></div>
                {status}
            </div>
        );
    };

    // Original live traffic data - simulate continuous updates for more realism
    const [liveTrafficData, setLiveTrafficData] = useState(() =>
        Array.from({ length: 40 }, (_, i) => ({
            name: i,
            plaid: 80 + Math.random() * 40,
            stripe: 60 + Math.random() * 30,
            gemini: 20 + Math.random() * 50
        }))
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setLiveTrafficData(prevData => {
                const newDataPoint = {
                    name: prevData[prevData.length - 1].name + 1,
                    plaid: Math.max(50, 80 + Math.sin(Date.now() / 60000) * 30 + Math.random() * 20),
                    stripe: Math.max(30, 60 + Math.cos(Date.now() / 50000) * 20 + Math.random() * 15),
                    gemini: Math.max(10, 20 + Math.sin(Date.now() / 70000) * 25 + Math.random() * 25)
                };
                return [...prevData.slice(1), newDataPoint]; // Shift left, add new data point
            });
        }, 2000); // Update every 2 seconds for a 'live' feel

        return () => clearInterval(interval);
    }, []);

    // Tab management for different sections of the dashboard
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'detailedMetrics', label: 'Detailed Metrics' },
        { id: 'incidents', label: 'Incidents' },
        { id: 'alerts', label: 'Alerts' },
        { id: 'slos', label: 'SLOs' },
        { id: 'systemResources', label: 'System Resources' },
        { id: 'events', label: 'Events' },
        { id: 'maintenance', label: 'Maintenance' },
        { id: 'anomalyDetection', label: 'Anomaly Detection' },
        { id: 'webhooks', label: 'Webhooks' },
        // Add more tabs as needed for features
    ];

    const renderContent = useCallback(() => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ExportedGlobalStatusOverview apiStatus={apiStatus} />
                        <Card title="Simulated Live API Traffic (Requests/sec)">
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={liveTrafficData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id="colorPlaid" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} /><stop offset="95%" stopColor="#8884d8" stopOpacity={0} /></linearGradient>
                                            <linearGradient id="colorStripe" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} /><stop offset="95%" stopColor="#82ca9d" stopOpacity={0} /></linearGradient>
                                            <linearGradient id="colorGemini" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} /><stop offset="95%" stopColor="#06b6d4" stopOpacity={0} /></linearGradient>
                                        </defs>
                                        <YAxis stroke="#9ca3af" fontSize={12} />
                                        <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                        <Area type="monotone" dataKey="plaid" stroke="#8884d8" fill="url(#colorPlaid)" name="Plaid" />
                                        <Area type="monotone" dataKey="stripe" stroke="#82ca9d" fill="url(#colorStripe)" name="Stripe" />
                                        <Area type="monotone" dataKey="gemini" stroke="#06b6d4" fill="url(#colorGemini)" name="Gemini" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card>
                            <div className="space-y-3">
                                {apiStatus.map(api => (
                                    <div key={api.provider} className="flex flex-col sm:flex-row justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                                        <h4 className="font-semibold text-lg text-white mb-2 sm:mb-0">{api.provider}</h4>
                                        <div className="flex items-center gap-4">
                                            <p className="text-sm text-gray-400 font-mono">{api.responseTime}ms</p>
                                            <StatusIndicator status={api.status} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                        {/* More quick overview cards can go here */}
                    </div>
                );
            case 'detailedMetrics':
                return (
                    <div className="space-y-6">
                        {MOCK_API_METRICS.map(api => (
                            <ExportedAPIChartsPanel key={api.provider} apiProvider={api} />
                        ))}
                    </div>
                );
            case 'incidents':
                return <ExportedIncidentLogTable />;
            case 'alerts':
                return <ExportedAlertConfigurationPanel />;
            case 'slos':
                return <ExportedSLOManagementPanel />;
            case 'systemResources':
                return <ExportedSystemResourceMonitor />;
            case 'events':
                return <ExportedRealtimeEventStream />;
            case 'maintenance':
                return <ExportedScheduledMaintenanceViewer />;
            case 'anomalyDetection':
                return <ExportedAnomalyDetectionSettings />;
            case 'webhooks':
                return <ExportedWebhooksIntegrationPanel />;
            default:
                return <div className="text-gray-400 p-8 text-center">Select a tab to view content.</div>;
        }
    }, [activeTab, apiStatus, liveTrafficData]);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">System & API Status Dashboard</h2>

            <nav className="flex space-x-2 border-b border-gray-700 pb-2 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200
                            ${activeTab === tab.id
                                ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default APIStatusView;