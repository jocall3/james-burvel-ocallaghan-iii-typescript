import React, { useState, useEffect, useCallback, useMemo, FC } from 'react';
import Card from '../../Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Sector } from 'recharts';
import { ChevronUp, ChevronDown, Filter, Search, XCircle, Clock, AlertTriangle, CheckCircle, Play, FileText, Database, GitBranch, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';

const pipelineRunsData = [
    { name: 'Mon', Succeeded: 25, Failed: 2 }, { name: 'Tue', Succeeded: 28, Failed: 1 },
    { name: 'Wed', Succeeded: 24, Failed: 3 }, { name: 'Thu', Succeeded: 30, Failed: 0 },
    { name: 'Fri', Succeeded: 32, Failed: 1 }, { name: 'Sat', Succeeded: 15, Failed: 0 },
    { name: 'Sun', Succeeded: 14, Failed: 0 },
];

const dataProcessedData = [
    { name: 'CRM Sync', TB: 1.2 }, { name: 'ERP Load', TB: 5.5 },
    { name: 'Log Ingestion', TB: 12.8 }, { name: 'BI Refresh', TB: 8.1 },
];

// NOTE: This is the original simple pipeline data. The new implementation uses a much more detailed mock data source below.
const pipelines = [
    { id: 1, name: 'Hourly CRM-to-Datalake Sync', trigger: 'Schedule', lastRunStatus: 'Succeeded' },
    { id: 2, name: 'Daily ERP Data Warehouse Load', trigger: 'Schedule', lastRunStatus: 'Succeeded' },
    { id: 3, name: 'Realtime Log Ingestion', trigger: 'Event', lastRunStatus: 'Succeeded' },
    { id: 4, name: 'End-of-Month Reporting', trigger: 'Schedule', lastRunStatus: 'Failed' },
];

// =================================================================================================
// START OF NEW REAL-WORLD APPLICATION CODE
// =================================================================================================

// -------------------------------------------------------------------------------------------------
// TYPE DEFINITIONS
// -------------------------------------------------------------------------------------------------

export type PipelineStatus = 'Succeeded' | 'Failed' | 'InProgress' | 'Cancelled' | 'Queued';
export type TriggerType = 'Schedule' | 'Event' | 'Manual';
export type ActivityType = 'CopyData' | 'StoredProcedure' | 'DataFlow' | 'Validation' | 'Notification';
export type AlertSeverity = 'Critical' | 'Warning' | 'Info';

export interface Pipeline {
    id: string;
    name: string;
    description: string;
    trigger: {
        type: TriggerType;
        details: string; // e.g., 'Cron: 0 0 * * *' or 'Event: NewBlob'
    };
    lastRunStatus: PipelineStatus;
    lastRunTimestamp: string;
    avgDurationMinutes: number;
    successRate: number; // 0 to 1
    tags: string[];
    createdBy: string;
    createdAt: string;
}

export interface Activity {
    id: string;
    name: "string";
    type: ActivityType;
    status: PipelineStatus;
    startTime: string;
    endTime: string;
    durationSeconds: number;
    details: Record<string, any>;
}

export interface PipelineRun {
    id: string;
    pipelineId: string;
    pipelineName: string;
    status: PipelineStatus;
    startTimestamp: string;
    endTimestamp: string;
    durationMinutes: number;
    triggeredBy: string;
    errorMessage?: string;
    activities: Activity[];
}

export interface Alert {
    id: string;
    timestamp: string;
    severity: AlertSeverity;
    pipelineId: string;
    pipelineName: string;
    message: string;
    acknowledged: boolean;
}

export interface ResourceMetric {
    timestamp: string;
    cpuUsage: number; // percentage
    memoryUsage: number; // GB
    networkIO: number; // MB/s
    activePipelines: number;
}

// -------------------------------------------------------------------------------------------------
// MOCK API AND DATA GENERATION
// -------------------------------------------------------------------------------------------------

const MOCK_NAMES = ['CRM', 'ERP', 'Log', 'BI', 'Analytics', 'Risk', 'Compliance', 'Marketing', 'Sales', 'Customer360'];
const MOCK_ACTIONS = ['Ingestion', 'Sync', 'Warehouse Load', 'Datalake Refresh', 'Reporting', 'Transformation', 'Validation', 'Archiving'];
const MOCK_FREQUENCIES = ['Hourly', 'Daily', 'Weekly', 'Monthly', 'Realtime'];
const MOCK_USERS = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min: number, max: number): number => Math.random() * (max - min) + min;

export const generateMockPipeline = (id: number): Pipeline => {
    const namePart1 = getRandomElement(MOCK_FREQUENCIES);
    const namePart2 = getRandomElement(MOCK_NAMES);
    const namePart3 = getRandomElement(MOCK_ACTIONS);
    const lastRunStatus = getRandomElement<PipelineStatus>(['Succeeded', 'Failed', 'Succeeded', 'Succeeded', 'InProgress']);
    
    return {
        id: `pl-${id.toString().padStart(4, '0')}`,
        name: `${namePart1} ${namePart2} ${namePart3}`,
        description: `This pipeline handles the ${namePart1.toLowerCase()} ${namePart3.toLowerCase()} of data from the ${namePart2} system.`,
        trigger: {
            type: getRandomElement<TriggerType>(['Schedule', 'Event', 'Manual']),
            details: 'Cron: 0 */1 * * *',
        },
        lastRunStatus,
        lastRunTimestamp: new Date(Date.now() - getRandomNumber(100000, 100000000)).toISOString(),
        avgDurationMinutes: Math.round(getRandomNumber(5, 120)),
        successRate: lastRunStatus === 'Failed' ? getRandomNumber(0.7, 0.9) : getRandomNumber(0.95, 1.0),
        tags: [getRandomElement(MOCK_NAMES), getRandomElement(['High-Priority', 'PII', 'Financial', 'Internal'])],
        createdBy: getRandomElement(MOCK_USERS),
        createdAt: new Date(Date.now() - getRandomNumber(100000000, 10000000000)).toISOString(),
    };
};

export const generateMockActivity = (runId: string, index: number, overallStartTime: number): Activity => {
    const status = getRandomElement<PipelineStatus>(['Succeeded', 'Succeeded', 'Succeeded', 'Failed']);
    const startTime = overallStartTime + index * 60000 + getRandomNumber(1000, 5000);
    const durationSeconds = Math.round(getRandomNumber(30, 300));
    const endTime = startTime + durationSeconds * 1000;

    return {
        id: `act-${runId}-${index}`,
        name: `${getRandomElement(MOCK_ACTIONS)} from ${getRandomElement(MOCK_NAMES)}`,
        type: getRandomElement<ActivityType>(['CopyData', 'StoredProcedure', 'DataFlow', 'Validation', 'Notification']),
        status: status,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        durationSeconds,
        details: { 
            source: `${getRandomElement(MOCK_NAMES)}_DB`, 
            destination: 'DataLake_Raw', 
            rowsRead: Math.floor(getRandomNumber(10000, 1000000)),
            rowsWritten: Math.floor(getRandomNumber(10000, 1000000))
        }
    };
};

export const generateMockPipelineRun = (runId: number, pipeline: Pipeline): PipelineRun => {
    const status = getRandomElement<PipelineStatus>(['Succeeded', 'Failed', 'Succeeded', 'Succeeded', 'Cancelled']);
    const startTimestamp = Date.now() - runId * 3600000 - getRandomNumber(0, 1000000);
    const durationMinutes = Math.round(getRandomNumber(pipeline.avgDurationMinutes * 0.8, pipeline.avgDurationMinutes * 1.2));
    const endTimestamp = startTimestamp + durationMinutes * 60000;
    
    const activities: Activity[] = Array.from({ length: Math.floor(getRandomNumber(3, 8)) }, (_, i) => generateMockActivity(runId.toString(), i, startTimestamp));
    
    const overallStatus = activities.some(a => a.status === 'Failed') ? 'Failed' : 'Succeeded';

    return {
        id: `run-${runId.toString().padStart(6, '0')}`,
        pipelineId: pipeline.id,
        pipelineName: pipeline.name,
        status: overallStatus,
        startTimestamp: new Date(startTimestamp).toISOString(),
        endTimestamp: new Date(endTimestamp).toISOString(),
        durationMinutes,
        triggeredBy: getRandomElement(['Scheduler', ...MOCK_USERS]),
        errorMessage: overallStatus === 'Failed' ? 'Activity "Validation" failed: Data quality check threshold not met. Expected < 1% nulls, found 3.2%.' : undefined,
        activities,
    };
};

export const MOCK_PIPELINES: Pipeline[] = Array.from({ length: 50 }, (_, i) => generateMockPipeline(i + 1));
export const MOCK_PIPELINE_RUNS: Record<string, PipelineRun[]> = MOCK_PIPELINES.reduce((acc, p) => {
    acc[p.id] = Array.from({ length: 100 }, (_, i) => generateMockPipelineRun(i + 1, p));
    return acc;
}, {} as Record<string, PipelineRun[]>);

export const MOCK_ALERTS: Alert[] = Array.from({ length: 20 }, (_, i) => {
    const pipeline = getRandomElement(MOCK_PIPELINES);
    const severity = getRandomElement<AlertSeverity>(['Critical', 'Warning', 'Info']);
    return {
        id: `alert-${i}`,
        timestamp: new Date(Date.now() - getRandomNumber(10000, 86400000 * 2)).toISOString(),
        severity,
        pipelineId: pipeline.id,
        pipelineName: pipeline.name,
        message: severity === 'Critical' ? `Pipeline failed unexpectedly. See run logs for details.` : `Pipeline duration exceeded 90th percentile by ${Math.floor(getRandomNumber(10, 50))}%`,
        acknowledged: Math.random() > 0.5,
    };
}).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

export const MOCK_RESOURCE_METRICS: ResourceMetric[] = Array.from({ length: 100 }, (_, i) => ({
    timestamp: new Date(Date.now() - (100 - i) * 60000 * 5).toISOString(),
    cpuUsage: getRandomNumber(20, 85),
    memoryUsage: getRandomNumber(8, 28),
    networkIO: getRandomNumber(50, 500),
    activePipelines: Math.floor(getRandomNumber(5, 20)),
}));

export const mockApi = {
    fetchPipelines: (options: { page: number; limit: number; sortKey: keyof Pipeline; sortDir: 'asc' | 'desc'; searchTerm: string }) => {
        return new Promise<{ data: Pipeline[]; total: number }>(resolve => {
            setTimeout(() => {
                let data = [...MOCK_PIPELINES];

                if (options.searchTerm) {
                    data = data.filter(p => p.name.toLowerCase().includes(options.searchTerm.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(options.searchTerm.toLowerCase())));
                }

                data.sort((a, b) => {
                    if (a[options.sortKey] < b[options.sortKey]) return options.sortDir === 'asc' ? -1 : 1;
                    if (a[options.sortKey] > b[options.sortKey]) return options.sortDir === 'asc' ? 1 : -1;
                    return 0;
                });
                const start = (options.page - 1) * options.limit;
                const end = start + options.limit;
                resolve({ data: data.slice(start, end), total: data.length });
            }, 500 + Math.random() * 500);
        });
    },
    fetchPipelineDetails: (pipelineId: string) => {
        return new Promise<Pipeline | undefined>(resolve => {
            setTimeout(() => {
                resolve(MOCK_PIPELINES.find(p => p.id === pipelineId));
            }, 300);
        });
    },
    fetchPipelineRuns: (pipelineId: string) => {
        return new Promise<PipelineRun[]>(resolve => {
            setTimeout(() => {
                resolve(MOCK_PIPELINE_RUNS[pipelineId] || []);
            }, 700);
        });
    },
    fetchAlerts: () => {
        return new Promise<Alert[]>(resolve => {
            setTimeout(() => {
                resolve(MOCK_ALERTS);
            }, 400);
        });
    },
    fetchResourceMetrics: () => {
         return new Promise<ResourceMetric[]>(resolve => {
            setTimeout(() => {
                resolve(MOCK_RESOURCE_METRICS);
            }, 600);
        });
    },
};

// -------------------------------------------------------------------------------------------------
// HELPER COMPONENTS
// -------------------------------------------------------------------------------------------------

export const LoadingSpinner: FC = () => (
    <div className="flex justify-center items-center h-full w-full p-8">
        <RefreshCw className="animate-spin h-8 w-8 text-cyan-400" />
    </div>
);

export const ErrorMessage: FC<{ message: string }> = ({ message }) => (
    <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-md flex items-center">
        <AlertTriangle className="h-5 w-5 mr-3" />
        <div>
            <p className="font-bold">An Error Occurred</p>
            <p className="text-sm">{message}</p>
        </div>
    </div>
);

export const StatusIndicator: FC<{ status: PipelineStatus }> = ({ status }) => {
    const styles = {
        Succeeded: { icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-400' },
        Failed: { icon: <XCircle className="h-4 w-4" />, color: 'text-red-400' },
        InProgress: { icon: <RefreshCw className="h-4 w-4 animate-spin" />, color: 'text-blue-400' },
        Cancelled: { icon: <AlertTriangle className="h-4 w-4" />, color: 'text-yellow-400' },
        Queued: { icon: <Clock className="h-4 w-4" />, color: 'text-gray-400' },
    };
    const { icon, color } = styles[status] || styles.Queued;
    return <span className={`flex items-center gap-2 ${color}`}>{icon} {status}</span>;
};

export const Pagination: FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void }> = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="flex justify-center items-center space-x-2 mt-4 text-gray-300">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
            >
                <ArrowLeft size={16} />
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
            >
                <ArrowRight size={16} />
            </button>
        </div>
    );
};

export type SortConfig<T> = { key: keyof T; direction: 'asc' | 'desc' } | null;

export const useSortableData = <T,>(items: T[], config: SortConfig<T> = null) => {
    const [sortConfig, setSortConfig] = useState(config);

    const sortedItems = useMemo(() => {
        let sortableItems = [...items];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [items, sortConfig]);

    const requestSort = (key: keyof T) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return { items: sortedItems, requestSort, sortConfig };
};

export const PipelineTable: FC<{ pipelines: Pipeline[]; onPipelineSelect: (id: string) => void }> = ({ pipelines, onPipelineSelect }) => {
    
    const { items, requestSort, sortConfig } = useSortableData(pipelines);

    const getSortIcon = (key: keyof Pipeline) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ChevronDown className="h-3 w-3 opacity-30" />;
        }
        return sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
    };
    
    const renderHeader = (key: keyof Pipeline, title: string) => (
         <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort(key)}>
            <div className="flex items-center gap-1">
                {title} {getSortIcon(key)}
            </div>
        </th>
    );

    return (
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                    <tr>
                        {renderHeader('name', 'Pipeline Name')}
                        {renderHeader('lastRunStatus', 'Last Run Status')}
                        {renderHeader('lastRunTimestamp', 'Last Run Time')}
                        {renderHeader('avgDurationMinutes', 'Avg. Duration (min)')}
                        {renderHeader('successRate', 'Success Rate')}
                    </tr>
                </thead>
                <tbody>
                    {items.map(p => (
                        <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer" onClick={() => onPipelineSelect(p.id)}>
                            <td className="px-6 py-4 font-medium text-white">{p.name}</td>
                            <td className="px-6 py-4"><StatusIndicator status={p.lastRunStatus} /></td>
                            <td className="px-6 py-4">{new Date(p.lastRunTimestamp).toLocaleString()}</td>
                            <td className="px-6 py-4">{p.avgDurationMinutes}</td>
                            <td className="px-6 py-4 text-white">{(p.successRate * 100).toFixed(1)}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const ResourceUtilizationChart: FC<{ data: ResourceMetric[] }> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                <XAxis dataKey="timestamp" stroke="#9ca3af" tickFormatter={(ts) => new Date(ts).toLocaleTimeString()} />
                <YAxis yAxisId="left" stroke="#82ca9d" label={{ value: 'Usage (%)', angle: -90, position: 'insideLeft', fill: '#82ca9d' }}/>
                <YAxis yAxisId="right" orientation="right" stroke="#8884d8" label={{ value: 'Count', angle: 90, position: 'insideRight', fill: '#8884d8' }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="cpuUsage" stroke="#82ca9d" name="CPU Usage (%)" dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="activePipelines" stroke="#8884d8" name="Active Pipelines" dot={false} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export const AlertsPanel: FC<{ alerts: Alert[] }> = ({ alerts }) => {
    const severityStyles = {
        Critical: 'border-l-4 border-red-500 bg-red-900/20',
        Warning: 'border-l-4 border-yellow-500 bg-yellow-900/20',
        Info: 'border-l-4 border-blue-500 bg-blue-900/20',
    };
    return (
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {alerts.length === 0 && <p className="text-gray-500">No recent alerts.</p>}
            {alerts.map(alert => (
                <div key={alert.id} className={`p-3 rounded-r-md ${severityStyles[alert.severity]}`}>
                    <div className="flex justify-between items-start">
                        <div className="flex-grow">
                            <p className="font-bold text-white">{alert.pipelineName}</p>
                            <p className="text-sm text-gray-300">{alert.message}</p>
                        </div>
                        <p className="text-xs text-gray-500 flex-shrink-0 ml-4">{new Date(alert.timestamp).toLocaleString()}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const PipelineRunHistory: FC<{ runs: PipelineRun[], onRunSelect: (run: PipelineRun) => void }> = ({ runs, onRunSelect }) => {
    return (
        <div className="max-h-[400px] overflow-y-auto">
             <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-300 uppercase bg-gray-900/30 sticky top-0">
                    <tr>
                        <th scope="col" className="px-4 py-2">Run ID</th>
                        <th scope="col" className="px-4 py-2">Status</th>
                        <th scope="col" className="px-4 py-2">Start Time</th>
                        <th scope="col" className="px-4 py-2">Duration (min)</th>
                        <th scope="col" className="px-4 py-2">Triggered By</th>
                    </tr>
                </thead>
                <tbody>
                    {runs.slice(0, 20).map(run => (
                        <tr key={run.id} className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer" onClick={() => onRunSelect(run)}>
                            <td className="px-4 py-2 font-mono text-xs text-white">{run.id}</td>
                            <td className="px-4 py-2"><StatusIndicator status={run.status} /></td>
                            <td className="px-4 py-2">{new Date(run.startTimestamp).toLocaleString()}</td>
                            <td className="px-4 py-2">{run.durationMinutes}</td>
                            <td className="px-4 py-2">{run.triggeredBy}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const RunDetailModal: FC<{ run: PipelineRun | null, onClose: () => void }> = ({ run, onClose }) => {
    if (!run) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white">Run Details: {run.id}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XCircle /></button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h4 className="font-bold text-gray-300 mb-2">Summary</h4>
                            <p><strong>Pipeline:</strong> {run.pipelineName}</p>
                            <p><strong>Status:</strong> <StatusIndicator status={run.status} /></p>
                            <p><strong>Started:</strong> {new Date(run.startTimestamp).toLocaleString()}</p>
                            <p><strong>Ended:</strong> {new Date(run.endTimestamp).toLocaleString()}</p>
                            <p><strong>Duration:</strong> {run.durationMinutes} minutes</p>
                            <p><strong>Triggered By:</strong> {run.triggeredBy}</p>
                        </div>
                        {run.errorMessage && (
                            <div className="bg-red-900/30 p-4 rounded-md">
                                <h4 className="font-bold text-red-300 mb-2">Error Message</h4>
                                <pre className="text-sm text-red-200 whitespace-pre-wrap font-mono">{run.errorMessage}</pre>
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <h4 className="font-bold text-gray-300 mb-2">Activities</h4>
                        <div className="space-y-2">
                            {run.activities.map(act => (
                                <div key={act.id} className="bg-gray-900/50 p-3 rounded-md">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <StatusIndicator status={act.status}/>
                                            <span className="font-bold text-white">{act.name}</span>
                                            <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">{act.type}</span>
                                        </div>
                                        <span className="text-sm text-gray-400">{act.durationSeconds}s</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2 font-mono">
                                        <p>Start: {new Date(act.startTime).toLocaleTimeString()}</p>
                                        <p>Rows Read: {act.details.rowsRead?.toLocaleString()}</p>
                                        <p>Rows Written: {act.details.rowsWritten?.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// -------------------------------------------------------------------------------------------------
// DETAILED VIEW COMPONENT
// -------------------------------------------------------------------------------------------------

export const PipelineDetailView: FC<{ pipelineId: string, onBack: () => void }> = ({ pipelineId, onBack }) => {
    const [pipeline, setPipeline] = useState<Pipeline | null>(null);
    const [runs, setRuns] = useState<PipelineRun[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRun, setSelectedRun] = useState<PipelineRun | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [p, r] = await Promise.all([
                    mockApi.fetchPipelineDetails(pipelineId),
                    mockApi.fetchPipelineRuns(pipelineId)
                ]);
                if (!p) throw new Error("Pipeline not found");
                setPipeline(p);
                setRuns(r);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [pipelineId]);

    const runStatusDistribution = useMemo(() => {
        const counts = runs.reduce((acc, run) => {
            acc[run.status] = (acc[run.status] || 0) + 1;
            return acc;
        }, {} as Record<PipelineStatus, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [runs]);

    const durationOverTime = useMemo(() => {
        return runs
            .slice()
            .sort((a,b) => new Date(a.startTimestamp).getTime() - new Date(b.startTimestamp).getTime())
            .map(run => ({
                time: new Date(run.startTimestamp).toLocaleDateString(),
                duration: run.durationMinutes,
                avg: pipeline?.avgDurationMinutes
            }));
    }, [runs, pipeline]);

    const PIE_COLORS = { Succeeded: '#82ca9d', Failed: '#ef4444', InProgress: '#3b82f6', Cancelled: '#f59e0b', Queued: '#9ca3af' };
    
    if (loading) return <Card><LoadingSpinner /></Card>;
    if (error) return <Card><ErrorMessage message={error} /></Card>;
    if (!pipeline) return null;

    return (
        <div className="space-y-6">
             <RunDetailModal run={selectedRun} onClose={() => setSelectedRun(null)} />
             <div className="flex justify-between items-center">
                <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-700 text-gray-300">
                    <ArrowLeft size={16} /> Back to Overview
                </button>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white">
                        <Play size={16} /> Trigger Run
                    </button>
                </div>
             </div>
            
            <Card>
                <h2 className="text-3xl font-bold text-white tracking-wider">{pipeline.name}</h2>
                <p className="text-gray-400 mt-2">{pipeline.description}</p>
                 <div className="mt-4 flex flex-wrap gap-2">
                    {pipeline.tags.map(tag => <span key={tag} className="bg-gray-700 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full text-gray-300">{tag}</span>)}
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">
                    <StatusIndicator status={pipeline.lastRunStatus} />
                </p><p className="text-sm text-gray-400 mt-1">Last Run Status</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">{pipeline.avgDurationMinutes} min</p><p className="text-sm text-gray-400 mt-1">Avg. Duration</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">{ (pipeline.successRate * 100).toFixed(1) }%</p><p className="text-sm text-gray-400 mt-1">Success Rate</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">{pipeline.trigger.type}</p><p className="text-sm text-gray-400 mt-1">Trigger Type</p></Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <Card title="Run Duration Over Time (minutes)">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={durationOverTime}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                <XAxis dataKey="time" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                                <Legend />
                                <Line type="monotone" dataKey="duration" stroke="#8884d8" name="Run Duration" />
                                <Line type="monotone" dataKey="avg" stroke="#ca8282" name="Avg. Duration" strokeDasharray="5 5" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card title="Run Status Distribution">
                         <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={runStatusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {runStatusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name as PipelineStatus]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
            </div>

            <Card title="Recent Runs">
                <PipelineRunHistory runs={runs} onRunSelect={setSelectedRun} />
            </Card>

        </div>
    );
};

// =================================================================================================
// MAIN COMPONENT REFACTORED FOR REAL-WORLD APPLICATION
// =================================================================================================

const DemoBankDataFactoryView: React.FC = () => {
    const [view, setView] = useState<'overview' | 'detail'>('overview');
    const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);

    const [pipelines, setPipelines] = useState<Pipeline[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [resourceMetrics, setResourceMetrics] = useState<ResourceMetric[]>([]);
    const [loading, setLoading] = useState<Record<string, boolean>>({ pipelines: true, alerts: true, metrics: true });
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    
    const ITEMS_PER_PAGE = 10;
    
    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1); // Reset to first page on new search
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    const loadPipelines = useCallback(async () => {
        try {
            setLoading(prev => ({ ...prev, pipelines: true }));
            const { data, total } = await mockApi.fetchPipelines({ 
                page: currentPage, 
                limit: ITEMS_PER_PAGE, 
                sortKey: 'lastRunTimestamp', 
                sortDir: 'desc',
                searchTerm: debouncedSearchTerm,
            });
            setPipelines(data);
            setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));
        } catch (e: any) {
            setError("Failed to load pipelines.");
        } finally {
            setLoading(prev => ({ ...prev, pipelines: false }));
        }
    }, [currentPage, debouncedSearchTerm]);

    useEffect(() => {
        loadPipelines();
    }, [loadPipelines]);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(prev => ({ ...prev, alerts: true, metrics: true }));
                const [alertsData, metricsData] = await Promise.all([
                    mockApi.fetchAlerts(),
                    mockApi.fetchResourceMetrics()
                ]);
                setAlerts(alertsData);
                setResourceMetrics(metricsData);
            } catch(e) {
                 setError("Failed to load dashboard widgets.");
            } finally {
                 setLoading(prev => ({ ...prev, alerts: false, metrics: false }));
            }
        };
        loadDashboardData();
    }, []);

    const handlePipelineSelect = (id: string) => {
        setSelectedPipelineId(id);
        setView('detail');
    };

    const handleBackToOverview = () => {
        setSelectedPipelineId(null);
        setView('overview');
    };
    
    const kpiData = useMemo(() => {
        const totalRuns = pipelineRunsData.reduce((acc, d) => acc + d.Succeeded + d.Failed, 0);
        const totalFailed = pipelineRunsData.reduce((acc, d) => acc + d.Failed, 0);
        return {
            totalPipelines: MOCK_PIPELINES.length,
            runs7d: totalRuns,
            failureRate: totalRuns > 0 ? ((totalFailed / totalRuns) * 100).toFixed(1) + '%' : '0%',
            dataProcessed24h: dataProcessedData.reduce((acc, d) => acc + d.TB, 0).toFixed(1) + ' TB',
        };
    }, []);

    if (view === 'detail' && selectedPipelineId) {
        return <PipelineDetailView pipelineId={selectedPipelineId} onBack={handleBackToOverview} />;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Data Factory</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">{kpiData.totalPipelines}</p><p className="text-sm text-gray-400 mt-1">Pipelines</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">{kpiData.runs7d}</p><p className="text-sm text-gray-400 mt-1">Runs (7d)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">{kpiData.failureRate}</p><p className="text-sm text-gray-400 mt-1">Failure Rate</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">{kpiData.dataProcessed24h}</p><p className="text-sm text-gray-400 mt-1">Data Processed (24h)</p></Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Pipeline Runs (Last 7 Days)">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={pipelineRunsData}>
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
                <Card title="Resource Utilization">
                    {loading.metrics ? <LoadingSpinner /> : <ResourceUtilizationChart data={resourceMetrics} />}
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <Card title="All Pipelines">
                         <div className="mb-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by name or tag..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-gray-900 border border-gray-700 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full pl-10 p-2.5"
                                />
                            </div>
                        </div>
                        {loading.pipelines && <LoadingSpinner />}
                        {!loading.pipelines && error && <ErrorMessage message={error} />}
                        {!loading.pipelines && !error && (
                            <>
                                <PipelineTable pipelines={pipelines} onPipelineSelect={handlePipelineSelect} />
                                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                            </>
                        )}
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card title="Recent Alerts">
                        {loading.alerts ? <LoadingSpinner /> : <AlertsPanel alerts={alerts} />}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DemoBankDataFactoryView;
