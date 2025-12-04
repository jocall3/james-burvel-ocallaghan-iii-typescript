import React, { useState, useEffect, useMemo, useCallback, useReducer } from 'react';
import Card from '../../Card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from 'recharts';

const queryPerformanceData = [
    { name: 'Mon', duration: 2.5 }, { name: 'Tue', duration: 2.8 }, { name: 'Wed', duration: 2.3 },
    { name: 'Thu', duration: 3.1 }, { name: 'Fri', duration: 3.5 }, { name: 'Sat', duration: 1.8 },
    { name: 'Sun', duration: 1.5 },
];

const popularDatasets = [
    { id: 1, name: 'transactions_clean', size: '1.2 TB', queries: 1520 },
    { id: 2, name: 'customer_360', size: '800 GB', queries: 1250 },
    { id: 3, name: 'product_catalog', size: '50 GB', queries: 850 },
    { id: 4, name: 'web_logs_partitioned', size: '12 TB', queries: 680 },
];


// --- START OF NEW CODE ---

// =================================================================================================
// TYPE DEFINITIONS FOR A REAL-WORLD APPLICATION
// =================================================================================================

export type TimeRange = '24h' | '7d' | '30d' | '90d';

export type QueryStatus = 'SUCCESS' | 'FAILED' | 'RUNNING' | 'QUEUED';

export interface User {
  id: string;
  name: string;
  email: string;
  department: 'Finance' | 'Marketing' | 'Risk' | 'Engineering' | 'Product';
  avatarUrl: string;
}

export interface Query {
  id: string;
  user: User;
  sql: string;
  status: QueryStatus;
  submittedAt: Date;
  completedAt: Date;
  durationMs: number;
  dataScannedMb: number;
  warehouse: string;
  cost: number;
  error?: string;
}

export interface Dataset {
  id: number;
  name: string;
  size: string;
  queries: number;
  owner: string;
  lastUpdated: string;
  sensitivity: 'High' | 'Medium' | 'Low';
  description: string;
  tags: string[];
}

export interface Warehouse {
  id: string;
  name: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL';
  status: 'ONLINE' | 'OFFLINE' | 'SCALING';
  queriesRunning: number;
  queriesQueued: number;
}

export interface CostData {
  department: string;
  cost: number;
}

export interface SystemAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

export interface KpiData {
    workspaces: number;
    queriesLast24h: number;
    avgQueryDuration: number;
    dataScannedLast24h: number;
}

export interface DashboardState {
    loading: boolean;
    kpiData: KpiData | null;
    queryHistory: Query[];
    detailedDatasets: Dataset[];
    warehouseStatus: Warehouse[];
    costBreakdown: CostData[];
    systemAlerts: SystemAlert[];
    queryPerformanceHistory: any[];
    error: string | null;
}

type DashboardAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Omit<DashboardState, 'loading' | 'error'> }
  | { type: 'FETCH_ERROR'; payload: string };

// =================================================================================================
// MOCK DATA GENERATION - Simulating a real backend API
// =================================================================================================

const MOCK_USERS: User[] = [
    { id: 'u1', name: 'Alice Johnson', email: 'alice.j@demobank.com', department: 'Finance', avatarUrl: '/avatars/alice.png' },
    { id: 'u2', name: 'Bob Williams', email: 'bob.w@demobank.com', department: 'Marketing', avatarUrl: '/avatars/bob.png' },
    { id: 'u3', name: 'Charlie Brown', email: 'charlie.b@demobank.com', department: 'Risk', avatarUrl: '/avatars/charlie.png' },
    { id: 'u4', name: 'Diana Miller', email: 'diana.m@demobank.com', department: 'Engineering', avatarUrl: '/avatars/diana.png' },
    { id: 'u5', name: 'Ethan Davis', email: 'ethan.d@demobank.com', department: 'Product', avatarUrl: '/avatars/ethan.png' },
];

const MOCK_WAREHOUSES = ['Analytics-WH', 'ETL-WH', 'BI-WH', 'DataScience-WH'];
const MOCK_TABLES = ['transactions_clean', 'customer_360', 'product_catalog', 'web_logs_partitioned', 'fraud_detection_scores', 'marketing_campaigns'];
const MOCK_SQL_PREFIXES = ['SELECT * FROM', 'SELECT COUNT(*) FROM', 'WITH revenue AS (...) SELECT * FROM revenue', 'SELECT user_id, MAX(transaction_date) FROM'];

export const generateMockQuery = (id: number): Query => {
    const user = MOCK_USERS[id % MOCK_USERS.length];
    const status: QueryStatus = Math.random() < 0.9 ? 'SUCCESS' : 'FAILED';
    const submittedAt = new Date(Date.now() - Math.random() * 72 * 3600 * 1000);
    const durationMs = Math.random() * 15000 + 500;
    const completedAt = new Date(submittedAt.getTime() + durationMs);
    const dataScannedMb = Math.random() * 20480; // Up to 20 GB
    
    return {
        id: `q_${Date.now()}_${id}`,
        user,
        sql: `${MOCK_SQL_PREFIXES[id % MOCK_SQL_PREFIXES.length]} ${MOCK_TABLES[id % MOCK_TABLES.length]} WHERE ...`,
        status,
        submittedAt,
        completedAt,
        durationMs,
        dataScannedMb,
        warehouse: MOCK_WAREHOUSES[id % MOCK_WAREHOUSES.length],
        cost: (durationMs / 1000) * 0.05 + (dataScannedMb / 1024) * 0.02, // Fictional cost formula
        error: status === 'FAILED' ? `Syntax error at line ${Math.floor(Math.random() * 10) + 1}` : undefined,
    };
};

export const generateMockQueries = (count: number): Query[] => {
    return Array.from({ length: count }, (_, i) => generateMockQuery(i));
};

export const generateDetailedDatasets = (): Dataset[] => [
    { id: 1, name: 'transactions_clean', size: '1.2 TB', queries: 1520, owner: 'Finance Team', lastUpdated: '1 hour ago', sensitivity: 'High', description: 'All customer financial transactions, cleaned and validated.', tags: ['finance', 'pii', 'core'] },
    { id: 2, name: 'customer_360', size: '800 GB', queries: 1250, owner: 'Marketing Team', lastUpdated: '6 hours ago', sensitivity: 'High', description: 'Aggregated view of customer interactions and profiles.', tags: ['marketing', 'customers', 'pii'] },
    { id: 3, name: 'product_catalog', size: '50 GB', queries: 850, owner: 'Product Team', lastUpdated: '3 days ago', sensitivity: 'Low', description: 'Details about all products offered by the bank.', tags: ['product', 'catalog'] },
    { id: 4, name: 'web_logs_partitioned', size: '12 TB', queries: 680, owner: 'Engineering Team', lastUpdated: 'streaming', sensitivity: 'Medium', description: 'Raw web server logs, partitioned by day.', tags: ['logs', 'engineering', 'web'] },
    { id: 5, name: 'fraud_detection_scores', size: '250 GB', queries: 980, owner: 'Risk Team', lastUpdated: '15 minutes ago', sensitivity: 'High', description: 'Real-time fraud scores for ongoing transactions.', tags: ['risk', 'fraud', 'ml'] },
    { id: 6, name: 'marketing_campaigns', size: '10 GB', queries: 420, owner: 'Marketing Team', lastUpdated: '1 week ago', sensitivity: 'Medium', description: 'Performance and metadata for marketing campaigns.', tags: ['marketing', 'campaigns'] },
];

export const generateWarehouseStatus = (): Warehouse[] => [
    { id: 'wh1', name: 'Analytics-WH', size: 'M', status: 'ONLINE', queriesRunning: 5, queriesQueued: 0 },
    { id: 'wh2', name: 'ETL-WH', size: 'L', status: 'ONLINE', queriesRunning: 2, queriesQueued: 0 },
    { id: 'wh3', name: 'BI-WH', size: 'S', status: 'ONLINE', queriesRunning: 12, queriesQueued: 3 },
    { id: 'wh4', name: 'DataScience-WH', size: 'XL', status: 'SCALING', queriesRunning: 1, queriesQueued: 0 },
];

export const generateCostBreakdown = (): CostData[] => [
    { department: 'Finance', cost: 12540.50 },
    { department: 'Marketing', cost: 9870.25 },
    { department: 'Risk', cost: 21340.00 },
    { department: 'Engineering', cost: 18500.75 },
    { department: 'Product', cost: 4200.00 },
];

export const generateSystemAlerts = (): SystemAlert[] => [
    { id: 'a1', severity: 'critical', title: 'ETL-WH Overloaded', message: 'Query queue length is over 20. Consider scaling up the warehouse.', timestamp: new Date(Date.now() - 5 * 60 * 1000) },
    { id: 'a2', severity: 'warning', title: 'High Cost Query Detected', message: 'Query ID q_..._7 executed by charlie.b@demobank.com incurred a cost of $152.34.', timestamp: new Date(Date.now() - 35 * 60 * 1000) },
    { id: 'a3', severity: 'info', title: 'Schema Change', message: 'Table customer_360 had a new column "last_login_device" added by alice.j@demobank.com.', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
];

export const generateQueryPerformanceHistory = (timeRange: TimeRange): any[] => {
    let days;
    switch(timeRange) {
        case '7d': days = 7; break;
        case '30d': days = 30; break;
        case '90d': days = 90; break;
        case '24h':
        default:
            return Array.from({length: 24}, (_, i) => {
                const hour = i.toString().padStart(2, '0') + ":00";
                return { 
                    name: hour, 
                    duration: Math.random() * 4 + 1,
                    queries: Math.floor(Math.random() * 300 + 50),
                    failed: Math.floor(Math.random() * 30)
                };
            });
    }
    return Array.from({length: days}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        return {
            name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            duration: Math.random() * 4 + 1,
            queries: Math.floor(Math.random() * 5000 + 1000),
            failed: Math.floor(Math.random() * 500)
        }
    });
};

// =================================================================================================
// UTILITY FUNCTIONS
// =================================================================================================

/**
 * Formats a number of bytes into a human-readable string.
 * @param bytes - The number of bytes.
 * @param decimals - The number of decimal places to include.
 * @returns A formatted string (e.g., "1.23 KB").
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Formats a duration in milliseconds into a human-readable string.
 * @param ms - The duration in milliseconds.
 * @returns A formatted string (e.g., "1m 23.4s").
 */
export const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    const seconds = ms / 1000;
    if (seconds < 60) return `${seconds.toFixed(2)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
}

/**
 * Returns a relative time string (e.g., "5 minutes ago").
 * @param date - The date to compare against now.
 * @returns A relative time string.
 */
export const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
}

// =================================================================================================
// STATE MANAGEMENT (Reducer)
// =================================================================================================

export const dashboardReducer = (state: DashboardState, action: DashboardAction): DashboardState => {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, loading: true, error: null };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, ...action.payload };
        case 'FETCH_ERROR':
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

const initialDashboardState: DashboardState = {
    loading: true,
    kpiData: null,
    queryHistory: [],
    detailedDatasets: [],
    warehouseStatus: [],
    costBreakdown: [],
    systemAlerts: [],
    queryPerformanceHistory: [],
    error: null,
};


// =================================================================================================
// CUSTOM HOOKS
// =================================================================================================

/**
 * Custom hook to simulate fetching dashboard data.
 * @param timeRange - The time range for which to fetch data.
 */
export const useDashboardData = (timeRange: TimeRange) => {
    const [state, dispatch] = useReducer(dashboardReducer, initialDashboardState);

    useEffect(() => {
        const fetchData = async () => {
            dispatch({ type: 'FETCH_START' });
            try {
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const queries = generateMockQueries(500);
                const kpiQueries = queries.filter(q => (Date.now() - q.submittedAt.getTime()) < 24 * 3600 * 1000);

                const data: Omit<DashboardState, 'loading' | 'error'> = {
                    kpiData: {
                        workspaces: 5,
                        queriesLast24h: kpiQueries.length,
                        avgQueryDuration: kpiQueries.reduce((acc, q) => acc + q.durationMs, 0) / kpiQueries.length,
                        dataScannedLast24h: kpiQueries.reduce((acc, q) => acc + q.dataScannedMb, 0),
                    },
                    queryHistory: queries.slice(0, 100), // Only show latest 100
                    detailedDatasets: generateDetailedDatasets(),
                    warehouseStatus: generateWarehouseStatus(),
                    costBreakdown: generateCostBreakdown(),
                    systemAlerts: generateSystemAlerts(),
                    queryPerformanceHistory: generateQueryPerformanceHistory(timeRange),
                };

                dispatch({ type: 'FETCH_SUCCESS', payload: data });

            } catch (err: any) {
                dispatch({ type: 'FETCH_ERROR', payload: err.message || 'Failed to fetch dashboard data' });
            }
        };

        fetchData();
    }, [timeRange]);

    return state;
};


// =================================================================================================
// SUB-COMPONENTS for the Dashboard
// =================================================================================================

/**
 * A single Key Performance Indicator card.
 */
export const KpiCard: React.FC<{ title: string; value: string; description: string; isLoading: boolean }> = ({ title, value, description, isLoading }) => (
    <Card className="text-center">
        {isLoading ? (
            <div className="animate-pulse">
                <div className="h-9 bg-gray-700 rounded w-1/2 mx-auto"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto mt-2"></div>
            </div>
        ) : (
            <>
                <p className="text-3xl font-bold text-white">{value}</p>
                <p className="text-sm text-gray-400 mt-1">{description}</p>
            </>
        )}
    </Card>
);

/**
 * A selector for changing the time range of the dashboard.
 */
export const TimeRangeSelector: React.FC<{ selected: TimeRange; onSelect: (range: TimeRange) => void }> = ({ selected, onSelect }) => {
    const ranges: TimeRange[] = ['24h', '7d', '30d', '90d'];
    return (
        <div className="flex justify-end">
            <div className="flex items-center bg-gray-900/50 border border-gray-700 rounded-md p-1">
                {ranges.map(range => (
                    <button
                        key={range}
                        onClick={() => onSelect(range)}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                            selected === range 
                                ? 'bg-indigo-600 text-white' 
                                : 'text-gray-300 hover:bg-gray-700'
                        }`}
                    >
                        {range.toUpperCase()}
                    </button>
                ))}
            </div>
        </div>
    );
};

/**
 * Advanced query performance chart with multiple metrics.
 */
export const QueryPerformanceChart: React.FC<{ data: any[], isLoading: boolean }> = ({ data, isLoading }) => (
    <Card title="Query Performance">
        {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
                 <p className="text-gray-400">Loading chart data...</p>
            </div>
        ) : (
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis yAxisId="left" stroke="#f59e0b" unit="s" label={{ value: 'Avg Duration (s)', angle: -90, position: 'insideLeft', fill: '#f59e0b' }}/>
                    <YAxis yAxisId="right" orientation="right" stroke="#8884d8" label={{ value: 'Queries', angle: -90, position: 'insideRight', fill: '#8884d8' }}/>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="duration" stroke="#f59e0b" fill="url(#colorDuration)" name="Avg Duration" />
                    <Area yAxisId="right" type="monotone" dataKey="queries" stroke="#8884d8" fill="url(#colorQueries)" name="Total Queries" />
                </AreaChart>
            </ResponsiveContainer>
        )}
    </Card>
);

/**
 * Chart showing cost breakdown by department.
 */
export const CostBreakdownChart: React.FC<{ data: CostData[], isLoading: boolean }> = ({ data, isLoading }) => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];
    const totalCost = useMemo(() => data.reduce((sum, item) => sum + item.cost, 0), [data]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
          const percent = ((payload[0].value / totalCost) * 100).toFixed(2);
          return (
            <div className="p-2 bg-gray-800 border border-gray-600 rounded-md text-white">
              <p>{`${payload[0].name}: $${payload[0].value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}</p>
              <p className="text-sm text-gray-400">{`${percent}% of total cost`}</p>
            </div>
          );
        }
        return null;
      };

    return (
        <Card title="Compute Cost by Department">
            {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                    <p className="text-gray-400">Loading chart data...</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="cost"
                            nameKey="department"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </Card>
    );
};

/**
 * A detailed, paginated, and sortable table for recent query history.
 */
export const RecentQueriesTable: React.FC<{ queries: Query[], isLoading: boolean }> = ({ queries, isLoading }) => {
    const [page, setPage] = useState(0);
    const [sort, setSort] = useState<{ key: keyof Query, dir: 'asc' | 'desc' }>({ key: 'submittedAt', dir: 'desc' });
    const ROWS_PER_PAGE = 10;

    const sortedQueries = useMemo(() => {
        return [...queries].sort((a, b) => {
            const valA = a[sort.key];
            const valB = b[sort.key];
            if (valA < valB) return sort.dir === 'asc' ? -1 : 1;
            if (valA > valB) return sort.dir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [queries, sort]);
    
    const paginatedQueries = useMemo(() => {
        const start = page * ROWS_PER_PAGE;
        return sortedQueries.slice(start, start + ROWS_PER_PAGE);
    }, [sortedQueries, page]);
    
    const totalPages = Math.ceil(queries.length / ROWS_PER_PAGE);

    const handleSort = (key: keyof Query) => {
        setSort(prev => ({
            key,
            dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc'
        }));
    };

    const SortableHeader: React.FC<{ columnKey: keyof Query; children: React.ReactNode }> = ({ columnKey, children }) => (
        <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => handleSort(columnKey)}>
            <div className="flex items-center">
                {children}
                {sort.key === columnKey && (
                    <span className="ml-1">{sort.dir === 'desc' ? '▼' : '▲'}</span>
                )}
            </div>
        </th>
    );

    return (
        <Card title="Recent Queries">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <SortableHeader columnKey="status">Status</SortableHeader>
                            <th scope="col" className="px-4 py-3">User</th>
                            <th scope="col" className="px-4 py-3">SQL Snippet</th>
                            <SortableHeader columnKey="durationMs">Duration</SortableHeader>
                            <SortableHeader columnKey="dataScannedMb">Data Scanned</SortableHeader>
                            <SortableHeader columnKey="cost">Cost</SortableHeader>
                            <SortableHeader columnKey="submittedAt">Submitted</SortableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({length: ROWS_PER_PAGE}).map((_, i) => (
                                <tr key={i} className="border-b border-gray-800 animate-pulse">
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-700 rounded w-16"></div></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-700 rounded w-24"></div></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-700 rounded w-48"></div></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-700 rounded w-12"></div></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-700 rounded w-16"></div></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-700 rounded w-10"></div></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-700 rounded w-20"></div></td>
                                </tr>
                            ))
                        ) : (
                            paginatedQueries.map(q => (
                                <tr key={q.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-4 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            q.status === 'SUCCESS' ? 'bg-green-900 text-green-300' :
                                            q.status === 'FAILED' ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'
                                        }`}>
                                            {q.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-white">{q.user.name}</td>
                                    <td className="px-4 py-4 font-mono text-gray-300">{q.sql.substring(0, 40)}...</td>
                                    <td className="px-4 py-4">{formatDuration(q.durationMs)}</td>
                                    <td className="px-4 py-4">{formatBytes(q.dataScannedMb * 1024 * 1024)}</td>
                                    <td className="px-4 py-4">${q.cost.toFixed(2)}</td>
                                    <td className="px-4 py-4">{getRelativeTime(q.submittedAt)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-between items-center pt-4">
                <span className="text-sm text-gray-400">
                    Showing {page * ROWS_PER_PAGE + 1} - {Math.min((page + 1) * ROWS_PER_PAGE, queries.length)} of {queries.length}
                </span>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                    <span className="text-sm text-white">Page {page + 1} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                </div>
            </div>
        </Card>
    );
};

/**
 * A component to display the current status of compute warehouses.
 */
export const WarehouseStatusView: React.FC<{ warehouses: Warehouse[], isLoading: boolean }> = ({ warehouses, isLoading }) => {
    const getStatusColor = (status: Warehouse['status']) => {
        switch (status) {
            case 'ONLINE': return 'bg-green-500';
            case 'SCALING': return 'bg-blue-500';
            case 'OFFLINE': return 'bg-gray-500';
            default: return 'bg-yellow-500';
        }
    };

    return (
        <Card title="Warehouse Status">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading ? (
                Array.from({length: 4}).map((_, i) => (
                    <div key={i} className="bg-gray-900/50 p-4 rounded-lg animate-pulse">
                         <div className="h-5 bg-gray-700 rounded w-3/4 mb-3"></div>
                         <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                         <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                    </div>
                ))
            ) : (
                warehouses.map(wh => (
                    <div key={wh.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-white">{wh.name}</h4>
                            <span className={`w-3 h-3 rounded-full ${getStatusColor(wh.status)}`}></span>
                        </div>
                        <p className="text-sm text-gray-400">Size: <span className="font-mono text-gray-200">{wh.size}</span></p>
                        <p className="text-sm text-gray-400">Status: <span className="font-semibold text-gray-200">{wh.status}</span></p>
                        <p className="text-sm text-gray-400">Running: <span className="font-mono text-gray-200">{wh.queriesRunning}</span></p>
                        <p className="text-sm text-gray-400">Queued: <span className="font-mono text-gray-200">{wh.queriesQueued}</span></p>
                    </div>
                ))
            )}
            </div>
        </Card>
    );
};

// --- END OF NEW CODE ---


const DemoBankAnalyticsView: React.FC = () => {
    // --- START OF MODIFIED/ENHANCED CODE ---
    const [timeRange, setTimeRange] = useState<TimeRange>('24h');
    const { loading, kpiData, queryHistory, costBreakdown, warehouseStatus, queryPerformanceHistory, error } = useDashboardData(timeRange);

    const formattedKpis = useMemo(() => {
        return {
            workspaces: kpiData?.workspaces.toString() || '0',
            queries: kpiData?.queriesLast24h.toLocaleString() || '0',
            duration: kpiData ? (kpiData.avgQueryDuration / 1000).toFixed(1) + 's' : '0s',
            scanned: kpiData ? formatBytes(kpiData.dataScannedLast24h * 1024 * 1024) : '0 MB',
        };
    }, [kpiData]);
    // --- END OF MODIFIED/ENHANCED CODE ---

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Analytics</h2>
                <TimeRangeSelector selected={timeRange} onSelect={setTimeRange} />
            </div>

            {error && <Card className="bg-red-900/50 border-red-500 text-red-200"><p><strong>Error:</strong> {error}</p></Card>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* --- MODIFIED: Use new KpiCard component --- */}
                <KpiCard title="Workspaces" value={formattedKpis.workspaces} description="Analytics Workspaces" isLoading={loading} />
                <KpiCard title="Queries" value={formattedKpis.queries} description={`Queries Run (${timeRange.toUpperCase()})`} isLoading={loading} />
                <KpiCard title="Avg Duration" value={formattedKpis.duration} description="Avg. Query Duration" isLoading={loading} />
                <KpiCard title="Data Scanned" value={formattedKpis.scanned} description={`Data Scanned (${timeRange.toUpperCase()})`} isLoading={loading} />
            </div>

            {/* --- MODIFIED: Use new enhanced chart component --- */}
            <QueryPerformanceChart data={queryPerformanceHistory} isLoading={loading} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CostBreakdownChart data={costBreakdown} isLoading={loading} />
                <WarehouseStatusView warehouses={warehouseStatus} isLoading={loading} />
            </div>
            
            {/* --- MODIFIED: Using new detailed queries table --- */}
            <RecentQueriesTable queries={queryHistory} isLoading={loading} />

            <Card title="Popular Datasets">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">Dataset Name</th>
                                <th scope="col" className="px-6 py-3">Size</th>
                                <th scope="col" className="px-6 py-3">Queries (24h)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {popularDatasets.map(d => (
                                <tr key={d.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-mono text-white">{d.name}</td>
                                    <td className="px-6 py-4">{d.size}</td>
                                    <td className="px-6 py-4">{d.queries.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DemoBankAnalyticsView;