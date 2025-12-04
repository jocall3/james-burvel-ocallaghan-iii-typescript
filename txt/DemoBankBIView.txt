import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Card from '../../Card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts';

// ===================================================================================
// 1. TYPE DEFINITIONS
// ===================================================================================

export type TUserRole = 'Admin' | 'Editor' | 'Viewer' | 'Guest';
export type TDataSourceStatus = 'online' | 'offline' | 'syncing' | 'error';
export type TActivityType = 'view' | 'create' | 'update' | 'delete' | 'share' | 'export';
export type TSortDirection = 'asc' | 'desc';

export interface User {
    id: string;
    name: string;
    email: string;
    role: TUserRole;
    avatarUrl: string;
    lastLogin: Date;
    department: 'Sales' | 'Marketing' | 'Product' | 'Engineering' | 'Executive' | 'HR';
}

export interface Report {
    id: string;
    name: string;
    createdAt: Date;
    lastUpdated: Date;
    dataSourceId: string;
    query: string;
}

export interface Dashboard {
    id: string;
    name: string;
    ownerId: string;
    description: string;
    views: number;
    createdAt: Date;
    lastAccessed: Date;
    tags: string[];
    isFavorite: boolean;
    relatedReports: Report[];
    accessList: { userId: string; role: 'Editor' | 'Viewer' }[];
}

export interface UserActivity {
    id: string;
    userId: string;
    activityType: TActivityType;
    targetId: string; // Dashboard or Report ID
    targetType: 'Dashboard' | 'Report';
    timestamp: Date;
    details: string;
}

export interface PerformanceMetric {
    timestamp: string; // ISO string for charting
    avgLoadTime: number; // in seconds
    queryExecutionTime: number; // in seconds
    concurrentUsers: number;
    errorRate: number; // percentage
}

export interface DataSource {
    id: string;
    name: string;
    type: 'PostgreSQL' | 'Snowflake' | 'BigQuery' | 'MySQL' | 'API';
    status: TDataSourceStatus;
    lastSync: Date;
    dataFreshness: number; // in minutes
}

export interface KpiData {
    totalDashboards: number;
    totalReports: number;
    dailyViews: number;
    avgLoadTime: number;
    dashboardTrend: number[];
    reportTrend: number[];
    viewsTrend: number[];
    loadTimeTrend: number[];
}

export interface FilterState {
    searchTerm: string;
    ownerId: string | 'all';
    tag: string | 'all';
    dateRange: '24h' | '7d' | '30d' | 'all';
}

export interface SortState {
    key: keyof Dashboard;
    direction: TSortDirection;
}


// ===================================================================================
// 2. MOCK DATA GENERATION
// ===================================================================================

const firstNames = ['Aisha', 'Ben', 'Carla', 'David', 'Eva', 'Frank', 'Grace', 'Henry', 'Isla', 'Jack'];
const lastNames = ['Williams', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez'];
const departments: User['department'][] = ['Sales', 'Marketing', 'Product', 'Engineering', 'Executive', 'HR'];
const roles: TUserRole[] = ['Admin', 'Editor', 'Viewer'];
const dashboardAdjectives = ['Executive', 'Sales', 'Marketing', 'Product', 'Financial', 'Operational', 'Customer', 'Regional'];
const dashboardNouns = ['Overview', 'Dashboard', 'Analysis', 'Report', 'KPIs', 'Metrics', 'Summary', 'Deep Dive'];
const tags = ['finance', 'q2', 'sales', 'emea', 'product-launch', 'kpi', 'daily-standup', 'confidential'];

export const generateRandomName = () => `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;

export const generateMockUsers = (count: number): User[] => {
    return Array.from({ length: count }, (_, i) => ({
        id: `user_${i + 1}`,
        name: generateRandomName(),
        email: `user${i + 1}@demobank.com`,
        role: roles[i % roles.length],
        avatarUrl: `https://i.pravatar.cc/40?u=user${i + 1}`,
        lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        department: departments[i % departments.length],
    }));
};

export const MOCK_USERS = generateMockUsers(50);

export const generateMockReports = (count: number, dataSourceId: string): Report[] => {
    return Array.from({ length: count }, (_, i) => ({
        id: `report_${dataSourceId}_${i + 1}`,
        name: `Report ${i + 1} for ${dataSourceId}`,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        lastUpdated: new Date(),
        dataSourceId: dataSourceId,
        query: `SELECT * FROM table_${i} WHERE date > '2023-01-01';`,
    }));
};

export const generateMockDashboards = (count: number, users: User[]): Dashboard[] => {
    return Array.from({ length: count }, (_, i) => {
        const owner = users[Math.floor(Math.random() * users.length)];
        const numReports = Math.floor(Math.random() * 5) + 1;
        return {
            id: `dash_${i + 1}`,
            name: `${dashboardAdjectives[i % dashboardAdjectives.length]} ${dashboardNouns[i % dashboardNouns.length]}`,
            ownerId: owner.id,
            description: `A detailed dashboard focusing on ${dashboardAdjectives[i % dashboardAdjectives.length].toLowerCase()} metrics. Maintained by the ${owner.department} department.`,
            views: Math.floor(Math.random() * 5000) + 100,
            createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
            lastAccessed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            tags: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => tags[Math.floor(Math.random() * tags.length)]),
            isFavorite: Math.random() > 0.8,
            relatedReports: generateMockReports(numReports, `ds_${i % 5}`),
            accessList: Array.from({ length: Math.floor(Math.random() * 10) + 2 }, () => ({
                userId: users[Math.floor(Math.random() * users.length)].id,
                role: Math.random() > 0.3 ? 'Viewer' : 'Editor',
            })),
        };
    });
};

export const MOCK_DASHBOARDS = generateMockDashboards(42, MOCK_USERS);

export const generateMockUserActivity = (count: number, users: User[], dashboards: Dashboard[]): UserActivity[] => {
    const activityTypes: TActivityType[] = ['view', 'create', 'update', 'delete', 'share', 'export'];
    return Array.from({ length: count }, (_, i) => {
        const user = users[Math.floor(Math.random() * users.length)];
        const dashboard = dashboards[Math.floor(Math.random() * dashboards.length)];
        const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        return {
            id: `activity_${i + 1}`,
            userId: user.id,
            activityType,
            targetId: dashboard.id,
            targetType: 'Dashboard',
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            details: `User ${user.name} performed '${activityType}' on dashboard '${dashboard.name}'`,
        };
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const MOCK_ACTIVITIES = generateMockUserActivity(200, MOCK_USERS, MOCK_DASHBOARDS);

export const generatePerformanceData = (days: number): PerformanceMetric[] => {
    return Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        return {
            timestamp: date.toISOString().split('T')[0],
            avgLoadTime: 2.5 + Math.sin(i / 5) + Math.random(),
            queryExecutionTime: 1.2 + Math.sin(i / 6) * 0.5 + Math.random() * 0.5,
            concurrentUsers: 150 + Math.floor(Math.sin(i / 10) * 50) + Math.floor(Math.random() * 20),
            errorRate: Math.max(0, 0.5 + Math.sin(i / 3) * 0.5 + (Math.random() - 0.5) * 0.2),
        };
    });
};

export const MOCK_PERFORMANCE_DATA = generatePerformanceData(30);

export const MOCK_DATA_SOURCES: DataSource[] = [
    { id: 'ds_1', name: 'Primary Transaction DB', type: 'PostgreSQL', status: 'online', lastSync: new Date(), dataFreshness: 5 },
    { id: 'ds_2', name: 'Data Warehouse', type: 'Snowflake', status: 'syncing', lastSync: new Date(Date.now() - 60 * 60 * 1000), dataFreshness: 60 },
    { id: 'ds_3', name: 'Marketing Analytics', type: 'BigQuery', status: 'online', lastSync: new Date(), dataFreshness: 15 },
    { id: 'ds_4', name: 'Legacy CRM', type: 'MySQL', status: 'error', lastSync: new Date(Date.now() - 3 * 60 * 60 * 1000), dataFreshness: 180 },
    { id: 'ds_5', name: 'External Partner API', type: 'API', status: 'offline', lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000), dataFreshness: 1440 },
];

export const MOCK_KPI_DATA: KpiData = {
    totalDashboards: 42,
    totalReports: 120,
    dailyViews: 2845,
    avgLoadTime: 3.1,
    dashboardTrend: Array.from({ length: 10 }, () => Math.random() * 10 + 40),
    reportTrend: Array.from({ length: 10 }, () => Math.random() * 20 + 110),
    viewsTrend: Array.from({ length: 10 }, () => Math.random() * 500 + 2500),
    loadTimeTrend: Array.from({ length: 10 }, () => Math.random() * 0.5 + 2.9),
};

const reportLoadTimeData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    'Load Time (s)': 2.5 + Math.random(),
}));

const popularDashboards = MOCK_DASHBOARDS.slice(0, 4).map(d => ({
    id: d.id,
    name: d.name,
    views: d.views,
    owner: MOCK_USERS.find(u => u.id === d.ownerId)?.name || 'Unknown',
}));

// ===================================================================================
// 3. MOCK API SERVICE
// ===================================================================================

const networkDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const api = {
    fetchKpiData: async (): Promise<KpiData> => {
        await networkDelay(500);
        console.log("API: Fetched KPI data");
        return MOCK_KPI_DATA;
    },
    fetchDashboards: async (filters: FilterState): Promise<{ dashboards: Dashboard[], total: number }> => {
        await networkDelay(800);
        console.log("API: Fetching dashboards with filters", filters);
        let filtered = MOCK_DASHBOARDS;

        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(d =>
                d.name.toLowerCase().includes(term) ||
                d.description.toLowerCase().includes(term) ||
                d.tags.some(t => t.toLowerCase().includes(term))
            );
        }

        if (filters.ownerId !== 'all') {
            filtered = filtered.filter(d => d.ownerId === filters.ownerId);
        }

        if (filters.tag !== 'all') {
            filtered = filtered.filter(d => d.tags.includes(filters.tag));
        }

        if (filters.dateRange !== 'all') {
            const now = Date.now();
            const days = { '24h': 1, '7d': 7, '30d': 30 }[filters.dateRange];
            const cutoff = now - days * 24 * 60 * 60 * 1000;
            filtered = filtered.filter(d => d.lastAccessed.getTime() >= cutoff);
        }
        
        console.log(`API: Found ${filtered.length} dashboards`);
        return { dashboards: filtered, total: filtered.length };
    },
    fetchPerformanceMetrics: async (): Promise<PerformanceMetric[]> => {
        await networkDelay(1200);
        console.log("API: Fetched performance metrics");
        return MOCK_PERFORMANCE_DATA;
    },
    fetchUserActivity: async (): Promise<UserActivity[]> => {
        await networkDelay(700);
        console.log("API: Fetched user activity");
        return MOCK_ACTIVITIES.slice(0, 50); // Return most recent 50
    },
    fetchDataSources: async (): Promise<DataSource[]> => {
        await networkDelay(400);
        console.log("API: Fetched data sources");
        return MOCK_DATA_SOURCES;
    },
    fetchDashboardDetails: async (id: string): Promise<Dashboard | undefined> => {
        await networkDelay(300);
        console.log(`API: Fetched details for dashboard ${id}`);
        return MOCK_DASHBOARDS.find(d => d.id === id);
    }
};

// ===================================================================================
// 4. UTILITY & HELPER FUNCTIONS
// ===================================================================================

export const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric', month: 'short', day: 'numeric',
    };
    return new Intl.DateTimeFormat('en-US', options || defaultOptions).format(date);
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

export const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
};

export const getStatusColor = (status: TDataSourceStatus) => {
    switch (status) {
        case 'online': return 'bg-green-500';
        case 'syncing': return 'bg-blue-500';
        case 'error': return 'bg-red-500';
        case 'offline': return 'bg-gray-500';
    }
};

// ===================================================================================
// 5. ICONS (Inline SVG Components)
// ===================================================================================

export const SortIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9M3 12h9m-9 4h13m0-4l-3 3m0 0l-3-3m3 3V4" /></svg>
);

export const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

export const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
);

// ===================================================================================
// 6. UI SUB-COMPONENTS
// ===================================================================================

/**
 * Custom Tooltip for Recharts
 */
export const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-lg">
                <p className="label font-bold">{`${label}`}</p>
                {payload.map((pld: any, index: number) => (
                    <p key={index} style={{ color: pld.color }}>
                        {`${pld.name}: ${pld.value.toFixed(2)}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

/**
 * KPI Card with a small sparkline chart
 */
export const KPICard: React.FC<{ title: string; value: string; trendData: number[]; color: string }> = React.memo(({ title, value, trendData, color }) => {
    const data = trendData.map((v, i) => ({ name: i, value: v }));
    return (
        <Card>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-400">{title}</p>
                    <p className="text-3xl font-bold text-white">{value}</p>
                </div>
                <div className="w-24 h-12">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    );
});

/**
 * Filter panel for searching, sorting, and filtering dashboards
 */
export const FilterPanel: React.FC<{
    filters: FilterState;
    onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
    allUsers: User[];
    allTags: string[];
}> = React.memo(({ filters, onFilterChange, allUsers, allTags }) => {
    return (
        <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div className="col-span-1 md:col-span-2 lg:col-span-1">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-1">Search</label>
                    <input
                        type="text"
                        id="search"
                        placeholder="Search dashboards..."
                        className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={filters.searchTerm}
                        onChange={(e) => onFilterChange('searchTerm', e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="owner" className="block text-sm font-medium text-gray-300 mb-1">Owner</label>
                    <select
                        id="owner"
                        className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={filters.ownerId}
                        onChange={(e) => onFilterChange('ownerId', e.target.value)}
                    >
                        <option value="all">All Owners</option>
                        {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="tag" className="block text-sm font-medium text-gray-300 mb-1">Tag</label>
                    <select
                        id="tag"
                        className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={filters.tag}
                        onChange={(e) => onFilterChange('tag', e.target.value)}
                    >
                        <option value="all">All Tags</option>
                        {allTags.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="dateRange" className="block text-sm font-medium text-gray-300 mb-1">Last Accessed</label>
                    <select
                        id="dateRange"
                        className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={filters.dateRange}
                        onChange={(e) => onFilterChange('dateRange', e.target.value as FilterState['dateRange'])}
                    >
                        <option value="all">Any time</option>
                        <option value="24h">Past 24 hours</option>
                        <option value="7d">Past 7 days</option>
                        <option value="30d">Past 30 days</option>
                    </select>
                </div>
            </div>
        </Card>
    );
});

/**
 * Pagination controls
 */
export const Pagination: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}> = React.memo(({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="flex justify-center items-center space-x-2 mt-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-800 text-white rounded-md