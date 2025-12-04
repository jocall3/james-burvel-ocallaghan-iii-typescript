import React, { useState, useEffect, useCallback, useMemo, FC, useRef } from 'react';
import Card from '../../Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Sector } from 'recharts';

// --- TYPE DEFINITIONS ---

export type LogicAppStatus = 'Enabled' | 'Disabled' | 'Degraded';
export type RunStatus = 'Succeeded' | 'Failed' | 'Running' | 'Cancelled';
export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
export type ActiveDetailTab = 'overview' | 'runHistory' | 'configuration' | 'logs' | 'metrics';
export type NotificationType = 'success' | 'error' | 'info';

export interface Trigger {
    type: 'HTTP Request' | 'Recurrence' | 'Event' | 'Manual';
    details: string;
    config: Record<string, any>;
}

export interface LogicApp {
    id: string;
    name: string;
    description: string;
    trigger: Trigger;
    status: LogicAppStatus;
    createdAt: string;
    updatedAt: string;
    version: number;
    tags: string[];
    definition: Record<string, any>;
}

export interface RunInstance {
    id: string;
    logicAppId: string;
    startTime: string;
    endTime: string | null;
    durationMs: number | null;
    status: RunStatus;
    triggerOutput: Record<string, any>;
    errorDetails: string | null;
    correlationId: string;
}

export interface LogEntry {
    id: string;
    runId: string;
    logicAppId: string;
    timestamp: string;
    level: LogLevel;
    message: string;
    details?: Record<string, any>;
}

export interface Notification {
    id: number;
    message: string;
    type: NotificationType;
}

export interface LogicAppMetrics {
    executionCount: { timestamp: number; count: number }[];
    failureRate: { timestamp: number; rate: number }[];
    avgDuration: { timestamp: number; duration: number }[];
}


// --- MOCK DATA GENERATION ---

const MOCK_DESCRIPTIONS = [
    "Handles new customer onboarding, including KYC checks and account setup.",
    "Generates and distributes daily transaction summary reports to management.",
    "Monitors for high-value or suspicious transactions and sends real-time alerts.",
    "Archives records older than 90 days from the main transaction database to cold storage.",
    "Processes incoming loan applications, performs credit scoring, and routes for approval.",
    "Syncs customer data between the core banking system and the CRM platform.",
    "Automates the monthly account statement generation and delivery process.",
];

const MOCK_TAGS = ['finance', 'onboarding', 'reporting', 'compliance', 'data-sync', 'archival', 'alerts'];

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomSubset = <T,>(arr: T[]): T[] => arr.filter(() => Math.random() > 0.6);

export const generateMockLogicApp = (id: number): LogicApp => {
    const name = ['Onboarding Workflow', 'Daily Report Generator', 'Transaction Alerting', 'Archive Old Records', 'Loan Application Processor', 'CRM Sync', 'Monthly Statements'][id % 7];
    const triggerTypes: Trigger['type'][] = ['HTTP Request', 'Recurrence', 'Event', 'Manual'];
    const triggerType = getRandomElement(triggerTypes);
    let triggerDetails: string;
    switch (triggerType) {
        case 'HTTP Request': triggerDetails = 'POST /api/v1/onboard'; break;
        case 'Recurrence': triggerDetails = `Recurrence (${Math.random() > 0.5 ? '24h' : '30d'})`; break;
        case 'Event': triggerDetails = `Event: transaction.${Math.random() > 0.5 ? 'created' : 'flagged'}`; break;
        default: triggerDetails = 'Manual Trigger';
    }

    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();

    return {
        id: `la-${id}`,
        name: `${name} ${id}`,
        description: getRandomElement(MOCK_DESCRIPTIONS),
        trigger: {
            type: triggerType,
            details: triggerDetails,
            config: { schedule: 'daily', method: 'POST', timeout: 30 },
        },
        status: Math.random() > 0.2 ? 'Enabled' : (Math.random() > 0.5 ? 'Disabled' : 'Degraded'),
        createdAt: createdAt,
        updatedAt: new Date(new Date(createdAt).getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
        version: Math.floor(Math.random() * 5) + 1,
        tags: getRandomSubset(MOCK_TAGS),
        definition: {
            "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
            "actions": { "Initialize_variable": { "type": "InitializeVariable", "inputs": { "variables": [{ "name": "customerId", "type": "string" }] } } },
            "triggers": { "manual": { "type": "Request", "kind": "Http", "inputs": { "schema": {} } } },
            "contentVersion": "1.0.0.0",
        },
    };
};

export const generateMockRunInstance = (logicAppId: string, index: number): RunInstance => {
    const startTime = new Date(Date.now() - index * 60 * 60 * 1000 - Math.random() * 60 * 60 * 1000);
    const status: RunStatus = Math.random() > 0.1 ? 'Succeeded' : (Math.random() > 0.3 ? 'Failed' : (Math.random() > 0.5 ? 'Running' : 'Cancelled'));
    const durationMs = status === 'Running' ? null : Math.floor(Math.random() * 5000) + 200;
    const endTime = status === 'Running' ? null : new Date(startTime.getTime() + durationMs!).toISOString();
    return {
        id: `run-${logicAppId}-${index}`,
        logicAppId,
        startTime: startTime.toISOString(),
        endTime,
        durationMs,
        status,
        triggerOutput: { headers: { 'x-request-id': `req-${index}` }, body: { customerId: `cust-${index}` } },
        errorDetails: status === 'Failed' ? `Action 'ProcessPayment' failed with status code 503. Details: Upstream service unavailable.` : null,
        correlationId: `corr-${logicAppId}-${Date.now()}-${index}`,
    };
};

export const generateMockLogEntry = (logicAppId: string, runId: string, index: number): LogEntry => {
    const levels: LogLevel[] = ['INFO', 'INFO', 'INFO', 'WARN', 'DEBUG', 'ERROR'];
    const level = getRandomElement(levels);
    let message = '';
    switch(level) {
        case 'INFO': message = `Action 'Step ${index}' completed successfully.`; break;
        case 'WARN': message = `Timeout detected while calling external API. Retrying (Attempt ${index % 3 + 1}/3)...`; break;
        case 'ERROR': message = `Failed to parse response JSON from downstream service.`; break;
        case 'DEBUG': message = `Variable 'customerPayload' set to: { id: 'cust-123', tier: 'gold' }`; break;
    }
    return {
        id: `log-${runId}-${index}`,
        logicAppId,
        runId,
        timestamp: new Date(Date.now() - index * 1000 - Math.random() * 1000).toISOString(),
        level,
        message,
        details: level === 'DEBUG' ? { payload: { id: 'cust-123', tier: 'gold' } } : undefined,
    };
};

export const generateMockMetrics = (): LogicAppMetrics => {
    const generateSeries = (days: number, valueFunc: (i: number) => number) => {
        return Array.from({ length: days }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (days - 1 - i));
            return { timestamp: d.getTime(), ...valueFunc(i) };
        });
    };
    return {
        executionCount: generateSeries(30, (i) => ({ count: Math.floor(Math.random() * 200) + 50 + (i * 5) })),
        failureRate: generateSeries(30, () => ({ rate: parseFloat((Math.random() * 5).toFixed(2)) })),
        avgDuration: generateSeries(30, () => ({ duration: Math.floor(Math.random() * 1500) + 500 })),
    };
};

const runHistoryData = [
    { name: 'Mon', Succeeded: 120, Failed: 5 }, { name: 'Tue', Succeeded: 135, Failed: 2 },
    { name: 'Wed', Succeeded: 110, Failed: 8 }, { name: 'Thu', Succeeded: 150, Failed: 1 },
    { name: 'Fri', Succeeded: 180, Failed: 3 }, { name: 'Sat', Succeeded: 90, Failed: 0 },
    { name: 'Sun', Succeeded: 85, Failed: 1 },
];

const initialLogicApps = Array.from({ length: 4 }).map((_, i) => ({
    id: i + 1,
    name: ['Onboarding Workflow', 'Daily Report Generator', 'Transaction Alerting', 'Archive Old Records'][i],
    trigger: ['HTTP Request', 'Recurrence (24h)', 'Event: transaction.created', 'Recurrence (30d)'][i],
    status: i === 3 ? 'Disabled' : 'Enabled',
}));

// --- API SIMULATION ---

const SIMULATED_LATENCY = 800;

export const api = {
    getLogicApps: async (page: number, limit: number, filters: Record<string, string>): Promise<{ apps: LogicApp[], total: number }> => {
        console.log("Fetching logic apps...", { page, limit, filters });
        return new Promise(resolve => {
            setTimeout(() => {
                const allApps = Array.from({ length: 53 }, (_, i) => generateMockLogicApp(i + 1));
                let filteredApps = allApps;

                if (filters.name) {
                    filteredApps = filteredApps.filter(app => app.name.toLowerCase().includes(filters.name.toLowerCase()));
                }
                if (filters.status) {
                    filteredApps = filteredApps.filter(app => app.status === filters.status);
                }
                if (filters.trigger) {
                    filteredApps = filteredApps.filter(app => app.trigger.type === filters.trigger);
                }

                const paginatedApps = filteredApps.slice((page - 1) * limit, page * limit);
                resolve({ apps: paginatedApps, total: filteredApps.length });
            }, SIMULATED_LATENCY);
        });
    },
    getLogicAppDetails: async (appId: string): Promise<LogicApp> => {
        console.log(`Fetching details for ${appId}...`);
        return new Promise(resolve => setTimeout(() => resolve(generateMockLogicApp(parseInt(appId.split('-')[1]))), SIMULATED_LATENCY / 2));
    },
    getRunHistory: async (appId: string): Promise<RunInstance[]> => {
        console.log(`Fetching run history for ${appId}...`);
        return new Promise(resolve => setTimeout(() => resolve(Array.from({ length: 50 }, (_, i) => generateMockRunInstance(appId, i))), SIMULATED_LATENCY));
    },
    getLogs: async (appId: string): Promise<LogEntry[]> => {
        console.log(`Fetching logs for ${appId}...`);
        return new Promise(resolve => setTimeout(() => {
            const runs = Array.from({ length: 10 }, (_, i) => generateMockRunInstance(appId, i));
            const logs = runs.flatMap(run => Array.from({ length: 15 }, (_, i) => generateMockLogEntry(appId, run.id, i)));
            resolve(logs);
        }, SIMULATED_LATENCY + 200));
    },
    getMetrics: async (appId: string): Promise<LogicAppMetrics> => {
        console.log(`Fetching metrics for ${appId}...`);
        return new Promise(resolve => setTimeout(() => resolve(generateMockMetrics()), SIMULATED_LATENCY));
    },
    updateLogicApp: async (app: LogicApp): Promise<LogicApp> => {
        console.log(`Updating logic app ${app.id}...`);
        return new Promise(resolve => setTimeout(() => resolve({ ...app, version: app.version + 1, updatedAt: new Date().toISOString() }), SIMULATED_LATENCY / 2));
    },
    deleteLogicApp: async (appId: string): Promise<{ success: boolean }> => {
        console.log(`Deleting logic app ${appId}...`);
        return new Promise(resolve => setTimeout(() => resolve({ success: true }), SIMULATED_LATENCY));
    },
    runLogicApp: async (appId: string): Promise<{ runId: string }> => {
        console.log(`Manually running logic app ${appId}...`);
        return new Promise(resolve => setTimeout(() => resolve({ runId: `manual-run-${Date.now()}` }), SIMULATED_LATENCY / 2));
    },
};

// --- HELPER FUNCTIONS & HOOKS ---

export const formatDate = (isoString: string | null): string => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString();
};

export const formatDuration = (ms: number | null): string => {
    if (ms === null || ms === undefined) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
};

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const addNotification = useCallback((message: string, type: NotificationType = 'info') => {
        const newNotification = { id: Date.now(), message, type };
        setNotifications(current => [...current, newNotification]);
        setTimeout(() => {
            setNotifications(current => current.filter(n => n.id !== newNotification.id));
        }, 5000);
    }, []);
    return { notifications, addNotification };
};

// --- UI COMPONENTS ---

export const Spinner: FC = () => (
    <div className="flex justify-center items-center h-full w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
    </div>
);

export const ErrorDisplay: FC<{ message: string }> = ({ message }) => (
    <div className="p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg">
        <p className="font-bold">An Error Occurred</p>
        <p>{message}</p>
    </div>
);

export const StatusBadge: FC<{ status: LogicAppStatus | RunStatus }> = ({ status }) => {
    const styles: Record<string, string> = {
        Enabled: 'bg-green-500/20 text-green-300',
        Disabled: 'bg-gray-500/20 text-gray-400',
        Degraded: 'bg-yellow-500/20 text-yellow-300',
        Succeeded: 'bg-green-500/20 text-green-300',
        Failed: 'bg-red-500/20 text-red-300',
        Running: 'bg-blue-500/20 text-blue-300 animate-pulse',
        Cancelled: 'bg-yellow-500/20 text-yellow-300',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-700'}`}>{status}</span>;
};

export const NotificationToast: FC<{ notification: Notification }> = ({ notification }) => {
    const baseStyle = 'w-80 p-4 rounded-lg shadow-lg text-white mb-2';
    const typeStyles: Record<NotificationType, string> = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-blue-600',
    };
    return <div className={`${baseStyle} ${typeStyles[notification.type]}`}>{notification.message}</div>;
};

export const NotificationContainer: FC<{ notifications: Notification[] }> = ({ notifications }) => (
    <div className="fixed top-5 right-5 z-50">
        {notifications.map(n => <NotificationToast key={n.id} notification={n} />)}
    </div>
);

export const ConfirmationModal: FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
                <p className="text-gray-300 mb-6">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="btn btn-ghost">Cancel</button>
                    <button onClick={onConfirm} className="btn btn-error">Confirm</button>
                </div>
            </div>
        </div>
    );
};

export const PaginationControls: FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="flex justify-center items-center space-x-2 mt-4">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="btn btn-sm btn-outline">«</button>
            <span className="text-gray-300">Page {currentPage} of {totalPages}</span>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="btn btn-sm btn-outline">»</button>
        </div>
    );
};

export const FilterControls: FC<{
    filters: Record<string, string>;
    onFilterChange: (key: string, value: string) => void;
    onClear: () => void;
}> = ({ filters, onFilterChange, onClear }) => {
    return (
        <div className="flex flex-wrap gap-4 items-center mb-4 p-4 bg-gray-900/30 rounded-lg">
            <input
                type="text"
                placeholder="Filter by name..."
                value={filters.name || ''}
                onChange={e => onFilterChange('name', e.target.value)}
                className="input input-bordered input-sm w-full max-w-xs bg-gray-800"
            />
            <select
                value={filters.status || ''}
                onChange={e => onFilterChange('status', e.target.value)}
                className="select select-bordered select-sm w-full max-w-xs bg-gray-800"
            >
                <option value="">All Statuses</option>
                <option value="Enabled">Enabled</option>
                <option value="Disabled">Disabled</option>
                <option value="Degraded">Degraded</option>
            </select>
            <select
                value={filters.trigger || ''}
                onChange={e => onFilterChange('trigger', e.target.value)}
                className="select select-bordered select-sm w-full max-w-xs bg-gray-800"
            >
                <option value="">All Trigger Types</option>
                <option value="HTTP Request">HTTP Request</option>
                <option value="Recurrence">Recurrence</option>
                <option value="Event">Event</option>
                <option value="Manual">Manual</option>
            </select>
            <button onClick={onClear} className="btn btn-sm btn-ghost">Clear Filters</button>
        </div>
    );
};

export const CodeEditor: FC<{ value: string; onChange: (value: string) => void; readOnly?: boolean }> = ({ value, onChange, readOnly }) => {
    return (
        <div className="font-mono text-sm bg-gray-900 rounded-lg p-4 border border-gray-700">
            <textarea
                className="w-full h-96 bg-transparent text-cyan-300 resize-none focus:outline-none"
                value={value}
                onChange={e => onChange(e.target.value)}
                readOnly={readOnly}
                spellCheck={false}
            />
        </div>
    );
};

export const LogicAppFormModal: FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (app: LogicApp) => void;
    appData: LogicApp | null;
}> = ({ isOpen, onClose, onSave, appData }) => {
    const [app, setApp] = useState<LogicApp | null>(null);

    useEffect(() => {
        if (appData) {
            setApp(JSON.parse(JSON.stringify(appData))); // Deep copy
        } else {
            // Default for new app
            setApp({
                id: `la-${Date.now()}`,
                name: '',
                description: '',
                trigger: { type: 'Manual', details: 'Manual Trigger', config: {} },
                status: 'Disabled',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                tags: [],
                definition: {},
            });
        }
    }, [appData, isOpen]);

    const handleSave = () => {
        if (app) {
            onSave(app);
            onClose();
        }
    };

    if (!isOpen || !app) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-3xl border border-gray-700 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-white mb-4">{appData ? 'Edit Logic App' : 'Create New Logic App'}</h3>
                <div className="space-y-4">
                    <div>
                        <label className="label"><span className="label-text text-gray-300">Name</span></label>
                        <input
                            type="text"
                            value={app.name}
                            onChange={e => setApp({ ...app, name: e.target.value })}
                            className="input input-bordered w-full bg-gray-700"
                        />
                    </div>
                    <div>
                        <label className="label"><span className="label-text text-gray-300">Description</span></label>
                        <textarea
                            value={app.description}
                            onChange={e => setApp({ ...app, description: e.target.value })}
                            className="textarea textarea-bordered w-full bg-gray-700"
                        />
                    </div>
                    {/* Simplified fields for brevity. A real form would be more complex. */}
                    <div>
                        <label className="label"><span className="label-text text-gray-300">Definition (JSON)</span></label>
                        <CodeEditor value={JSON.stringify(app.definition, null, 2)} onChange={(v) => {
                            try {
                                setApp({ ...app, definition: JSON.parse(v) });
                            } catch (e) {
                                // Handle JSON parse error, maybe show a message
                            }
                        }} />
                    </div>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="btn btn-ghost">Cancel</button>
                    <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export const RunHistoryTable: FC<{ runs: RunInstance[], onSelectRun: (run: RunInstance) => void }> = ({ runs, onSelectRun }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                    <tr>
                        <th scope="col" className="px-6 py-3">Run ID</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Start Time</th>
                        <th scope="col" className="px-6 py-3">Duration</th>
                        <th scope="col" className="px-6 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {runs.map(run => (
                        <tr key={run.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                            <td className="px-6 py-4 font-mono text-cyan-400">{run.id}</td>
                            <td className="px-6 py-4"><StatusBadge status={run.status} /></td>
                            <td className="px-6 py-4">{formatDate(run.startTime)}</td>
                            <td className="px-6 py-4">{formatDuration(run.durationMs)}</td>
                            <td className="px-6 py-4">
                                <button className="btn btn-xs btn-ghost" onClick={() => onSelectRun(run)}>View Details</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const LogViewer: FC<{ logs: LogEntry[], isLoading: boolean }> = ({ logs, isLoading }) => {
    const [logLevelFilter, setLogLevelFilter] = useState<LogLevel | ''>('');
    const [searchTerm, setSearchTerm] = useState('');
    const logContainerRef = useRef<HTMLDivElement>(null);

    const filteredLogs = useMemo(() => {
        return logs
            .filter(log => !logLevelFilter || log.level === logLevelFilter)
            .filter(log => !searchTerm || log.message.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [logs, logLevelFilter, searchTerm]);

    useEffect(() => {
        logContainerRef.current?.scrollTo(0, logContainerRef.current.scrollHeight);
    }, [filteredLogs]);

    const getLevelColor = (level: LogLevel) => ({
        'INFO': 'text-gray-300', 'WARN': 'text-yellow-400', 'ERROR': 'text-red-400', 'DEBUG': 'text-purple-400'
    })[level];

    return (
        <div>
            <div className="flex flex-wrap gap-4 items-center mb-4 p-2 bg-gray-900/30 rounded-lg">
                <select value={logLevelFilter} onChange={e => setLogLevelFilter(e.target.value as LogLevel | '')} className="select select-bordered select-sm bg-gray-800">
                    <option value="">All Levels</option>
                    <option value="DEBUG">DEBUG</option>
                    <option value="INFO">INFO</option>
                    <option value="WARN">WARN</option>
                    <option value="ERROR">ERROR</option>
                </select>
                <input type="text" placeholder="Search logs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input input-bordered input-sm bg-gray-800" />
            </div>
            <div ref={logContainerRef} className="bg-black font-mono text-sm p-4 rounded-lg h-96 overflow-y-auto border border-gray-700">
                {isLoading ? <Spinner /> : filteredLogs.map(log => (
                    <div key={log.id} className="flex">
                        <span className="text-gray-500 mr-4">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className={`font-bold w-16 ${getLevelColor(log.level)}`}>{`[${log.level}]`}</span>
                        <span className="flex-1 whitespace-pre-wrap">{log.message}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const CustomPieChartLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${name} ${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export const LogicAppDetailView: FC<{
    app: LogicApp;
    onBack: () => void;
    onUpdate: (app: LogicApp) => void;
    addNotification: (message: string, type: NotificationType) => void;
}> = ({ app, onBack, onUpdate, addNotification }) => {
    const [activeTab, setActiveTab] = useState<ActiveDetailTab>('overview');
    const [runHistory, setRunHistory] = useState<RunInstance[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [metrics, setMetrics] = useState<LogicAppMetrics | null>(null);
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({ history: false, logs: false, metrics: false });
    const [error, setError] = useState<string | null>(null);

    const fetchDataForTab = useCallback(async (tab: ActiveDetailTab) => {
        setIsLoading(prev => ({ ...prev, [tab]: true }));
        setError(null);
        try {
            if (tab === 'runHistory' && runHistory.length === 0) {
                const data = await api.getRunHistory(app.id);
                setRunHistory(data);
            } else if (tab === 'logs' && logs.length === 0) {
                const data = await api.getLogs(app.id);
                setLogs(data);
            } else if (tab === 'metrics' && !metrics) {
                const data = await api.getMetrics(app.id);
                setMetrics(data);
            }
        } catch (e) {
            setError(`Failed to load data for ${tab}.`);
            addNotification(`Failed to load data for ${tab}.`, 'error');
        } finally {
            setIsLoading(prev => ({ ...prev, [tab]: false }));
        }
    }, [app.id, runHistory.length, logs.length, metrics, addNotification]);

    useEffect(() => {
        fetchDataForTab(activeTab);
    }, [activeTab, fetchDataForTab]);

    const handleRunNow = async () => {
        addNotification(`Triggering a manual run for ${app.name}...`, 'info');
        try {
            const result = await api.runLogicApp(app.id);
            addNotification(`Successfully started run ${result.runId}`, 'success');
            // Refresh run history
            if (activeTab === 'runHistory') {
                const data = await api.getRunHistory(app.id);
                setRunHistory(data);
            }
        } catch (e) {
            addNotification('Failed to trigger manual run.', 'error');
        }
    };

    const statusMetrics = useMemo(() => {
        if (!runHistory || runHistory.length === 0) return [];
        const counts = runHistory.reduce((acc, run) => {
            acc[run.status] = (acc[run.status] || 0) + 1;
            return acc;
        }, {} as Record<RunStatus, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [runHistory]);

    const PIE_COLORS = { 'Succeeded': '#82ca9d', 'Failed': '#ef4444', 'Running': '#8884d8', 'Cancelled': '#ffc658' };

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="btn btn-ghost mb-4">
                &larr; Back to Dashboard
            </button>

            <Card>
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-wider">{app.name}</h2>
                        <div className="flex items-center space-x-4 mt-2">
                            <StatusBadge status={app.status} />
                            <p className="text-sm text-gray-400">Version: {app.version}</p>
                            <p className="text-sm text-gray-400">Last updated: {formatDate(app.updatedAt)}</p>
                        </div>
                        <p className="text-gray-300 mt-2 max-w-2xl">{app.description}</p>
                        <div className="mt-2 space-x-1">
                            {app.tags.map(tag => <span key={tag} className="badge badge-outline badge-info">{tag}</span>)}
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button className="btn btn-sm btn-primary" onClick={handleRunNow}>Run Now</button>
                        <button className="btn btn-sm btn-outline" onClick={() => onUpdate({ ...app, status: app.status === 'Enabled' ? 'Disabled' : 'Enabled' })}>
                            {app.status === 'Enabled' ? 'Disable' : 'Enable'}
                        </button>
                    </div>
                </div>
            </Card>

            <div className="tabs">
                {(['overview', 'runHistory', 'configuration', 'logs', 'metrics'] as ActiveDetailTab[]).map(tab => (
                    <a key={tab} className={`tab tab-lifted ${activeTab === tab ? 'tab-active' : ''}`} onClick={() => setActiveTab(tab)}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </a>
                ))}
            </div>
            
            <Card>
                {error && <ErrorDisplay message={error} />}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-bold text-lg mb-2 text-white">Trigger Details</h4>
                            <p className="font-mono text-cyan-400">{app.trigger.type}: {app.trigger.details}</p>
                            <pre className="bg-gray-900 p-2 rounded-md mt-2 text-xs text-gray-300 overflow-x-auto">{JSON.stringify(app.trigger.config, null, 2)}</pre>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-2 text-white">Run Status (Last 50)</h4>
                            {isLoading.history ? <Spinner/> : (
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie data={statusMetrics} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={CustomPieChartLabel}>
                                            {statusMetrics.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name as RunStatus]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'runHistory' && (
                    isLoading.history ? <Spinner /> : <RunHistoryTable runs={runHistory} onSelectRun={(run) => alert(`Viewing details for run ${run.id}`)} />
                )}
                {activeTab === 'configuration' && (
                    <div>
                        <h4 className="font-bold text-lg mb-2 text-white">Workflow Definition</h4>
                        <CodeEditor value={JSON.stringify(app.definition, null, 2)} onChange={() => {}} readOnly />
                    </div>
                )}
                {activeTab === 'logs' && <LogViewer logs={logs} isLoading={isLoading.logs} />}
                {activeTab === 'metrics' && (
                    isLoading.metrics ? <Spinner /> : metrics && (
                        <div className="space-y-8">
                            <div>
                                <h4 className="font-bold text-lg mb-4 text-white">Execution Count (30d)</h4>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={metrics.executionCount}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                        <XAxis dataKey="timestamp" stroke="#9ca3af" tickFormatter={(ts) => new Date(ts).toLocaleDateString()} />
                                        <YAxis stroke="#9ca3af" />
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                        <Line type="monotone" dataKey="count" stroke="#8884d8" name="Executions" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-4 text-white">Average Duration (30d)</h4>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={metrics.avgDuration}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                        <XAxis dataKey="timestamp" stroke="#9ca3af" tickFormatter={(ts) => new Date(ts).toLocaleDateString()} />
                                        <YAxis stroke="#9ca3af" unit="ms" />
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                        <Line type="monotone" dataKey="duration" stroke="#82ca9d" name="Avg. Duration (ms)" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )
                )}
            </Card>
        </div>
    );
};


// --- MAIN VIEW COMPONENT ---

const DemoBankLogicAppsView: React.FC = () => {
    const [view, setView] = useState<'dashboard' | 'detail'>('dashboard');
    const [selectedApp, setSelectedApp] = useState<LogicApp | null>(null);
    const [logicApps, setLogicApps] = useState<LogicApp[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // State for enriched dashboard experience
    const { notifications, addNotification } = useNotifications();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [appToEdit, setAppToEdit] = useState<LogicApp | null>(null);
    const [appToDelete, setAppToDelete] = useState<LogicApp | null>(null);

    // Pagination and Filtering
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const APPS_PER_PAGE = 10;

    const fetchLogicApps = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { apps, total } = await api.getLogicApps(currentPage, APPS_PER_PAGE, filters);
            setLogicApps(apps);
            setTotalPages(Math.ceil(total / APPS_PER_PAGE));
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
            setError(errorMessage);
            addNotification(`Failed to load Logic Apps: ${errorMessage}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, filters, addNotification]);

    useEffect(() => {
        if (view === 'dashboard') {
            fetchLogicApps();
        }
    }, [view, fetchLogicApps]);
    
    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({...prev, [key]: value }));
        setCurrentPage(1); // Reset to first page on filter change
    };
    
    const handleClearFilters = () => {
        setFilters({});
        setCurrentPage(1);
    };

    const handleViewDetails = (app: LogicApp) => {
        setSelectedApp(app);
        setView('detail');
    };

    const handleBackToDashboard = () => {
        setSelectedApp(null);
        setView('dashboard');
    };

    const handleUpdateApp = async (app: LogicApp) => {
        try {
            const updatedApp = await api.updateLogicApp(app);
            addNotification(`Successfully updated ${app.name}`, 'success');
            if (view === 'detail') {
                setSelectedApp(updatedApp);
            }
            fetchLogicApps(); // Refresh the list
        } catch (e) {
            addNotification(`Failed to update ${app.name}`, 'error');
        }
    };
    
    const handleSaveFromModal = async (app: LogicApp) => {
        if (appToEdit) { // Editing existing app
            await handleUpdateApp(app);
        } else { // Creating new app
            addNotification(`Creating ${app.name}...`, 'info');
            // This is a mock, just add to the list locally
            setLogicApps(prev => [app, ...prev]);
            addNotification(`Successfully created ${app.name}`, 'success');
        }
        setAppToEdit(null);
    };

    const handleDelete = async () => {
        if (!appToDelete) return;
        try {
            await api.deleteLogicApp(appToDelete.id);
            addNotification(`Successfully deleted ${appToDelete.name}`, 'success');
            setAppToDelete(null);
            fetchLogicApps(); // Refresh
        } catch (e) {
            addNotification(`Failed to delete ${appToDelete.name}`, 'error');
        }
    };

    if (view === 'detail' && selectedApp) {
        return <LogicAppDetailView app={selectedApp} onBack={handleBackToDashboard} onUpdate={handleUpdateApp} addNotification={addNotification} />;
    }

    return (
        <div className="space-y-6">
            <NotificationContainer notifications={notifications} />
            <ConfirmationModal
                isOpen={!!appToDelete}
                onClose={() => setAppToDelete(null)}
                onConfirm={handleDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the Logic App "${appToDelete?.name}"? This action cannot be undone.`}
            />
            <LogicAppFormModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setAppToEdit(null); }}
                onSave={handleSaveFromModal}
                appData={appToEdit}
            />
            
            <div className="flex justify-between items-center">
                 <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Logic Apps</h2>
                 <button className="btn btn-primary" onClick={() => { setAppToEdit(null); setIsModalOpen(true); }}>Create New Logic App</button>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">53</p><p className="text-sm text-gray-400 mt-1">Logic Apps</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">870</p><p className="text-sm text-gray-400 mt-1">Runs (7d)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">2.3%</p><p className="text-sm text-gray-400 mt-1">Failure Rate</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">1.2s</p><p className="text-sm text-gray-400 mt-1">Avg. Duration</p></Card>
            </div>
            
            <Card title="Run History (Last 7 Days)">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={runHistoryData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                        <Legend />
                        <Bar dataKey="Succeeded" stackId="a" fill="#82ca9d" />
                        <Bar dataKey="Failed" stackId="a" fill="#ef4444" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            <Card title="All Logic Apps">
                <FilterControls filters={filters} onFilterChange={handleFilterChange} onClear={handleClearFilters} />
                <div className="overflow-x-auto">
                    {isLoading ? <div className="h-64"><Spinner /></div> : error ? <ErrorDisplay message={error} /> : (
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Name</th>
                                    <th scope="col" className="px-6 py-3">Trigger</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3">Last Updated</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logicApps.map(app => (
                                    <tr key={app.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-6 py-4 font-medium text-white">{app.name}</td>
                                        <td className="px-6 py-4 font-mono text-sm">{app.trigger.type}</td>
                                        <td className="px-6 py-4"><StatusBadge status={app.status} /></td>
                                        <td className="px-6 py-4">{formatDate(app.updatedAt)}</td>
                                        <td className="px-6 py-4 flex items-center space-x-2">
                                            <button className="btn btn-xs btn-outline" onClick={() => handleViewDetails(app)}>View</button>
                                            <button className="btn btn-xs btn-outline" onClick={() => { setAppToEdit(app); setIsModalOpen(true); }}>Edit</button>
                                            <button className="btn btn-xs btn-outline btn-error" onClick={() => setAppToDelete(app)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                {!isLoading && !error && <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
            </Card>
        </div>
    );
};

export default DemoBankLogicAppsView;
