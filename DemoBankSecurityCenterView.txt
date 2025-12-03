import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Card from '../../Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area } from 'recharts';

const threatsData = [
    { name: 'Phishing', value: 35 },
    { name: 'Brute Force', value: 22 },
    { name: 'Malware', value: 12 },
    { name: 'Anomalous Activity', value: 8 },
    { name: 'DDoS Attempt', value: 5 },
    { name: 'Insider Threat', value: 3 },
];
const COLORS = ['#f97316', '#eab308', '#ef4444', '#f59e0b', '#dc2626', '#84cc16'];

const activeAlerts = [
    { id: 'AL-92842', severity: 'Critical', title: 'Potential Malware Detected on `web-prod-02`', time: '15m ago', status: 'New', assignedTo: 'soc-team-b' },
    { id: 'AL-92841', severity: 'High', title: 'Anomalous Login from Unrecognized IP (18.212.87.10)', time: '5m ago', status: 'New', assignedTo: 'soc-team-a' },
    { id: 'AL-92840', severity: 'Medium', title: 'Multiple Failed Login Attempts for `admin`', time: '1h ago', status: 'In Progress', assignedTo: 'john.doe' },
    { id: 'AL-92839', severity: 'Low', title: 'Outdated Security Patch on `db-main-01`', time: '3h ago', status: 'In Progress', assignedTo: 'jane.smith' },
];

// --- SVG ICONS (As Components) ---

export const ShieldCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.917l9 3 9-3a12.02 12.02 0 00-2.382-9.971z" />
    </svg>
);

export const BellIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

export const ServerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
);

export const BugIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m-2 4h14a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4a2 2 0 012-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m-6-8H4m16 0h-2M7.05 7.05l-1.414-1.414M18.364 18.364l-1.414-1.414M7.05 18.364l-1.414 1.414M18.364 7.05l-1.414 1.414" />
    </svg>
);

export const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 013 5.197M15 21a6 6 0 00-9-5.197" />
    </svg>
);

export const FileReportIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export const GlobeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h8a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.293l.586-.586a2 2 0 012.828 0l2 2a2 2 0 010 2.828l-.586.586M12 22V12" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const ChevronUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
);

export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

export const ExternalLinkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);


// --- TYPES & INTERFACES ---

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
export type Status = 'New' | 'In Progress' | 'Resolved' | 'Closed' | 'Dismissed';
export type AssetType = 'Server' | 'Database' | 'Application' | 'Network Device' | 'Endpoint';
export type IncidentStatus = 'Active' | 'Contained' | 'Eradicated' | 'Recovered' | 'Closed';
export type PlaybookStatus = 'Success' | 'Failed' | 'Running' | 'Pending';

export interface Alert {
    id: string;
    severity: Severity;
    title: string;
    timestamp: Date;
    status: Status;
    assignedTo: string;
    sourceIp?: string;
    destinationIp?: string;
    affectedAssets: string[];
    relatedIncidentId?: string;
}

export interface Incident {
    id: string;
    title: string;
    status: IncidentStatus;
    severity: Severity;
    createdAt: Date;
    updatedAt: Date;
    leadAnalyst: string;
    relatedAlerts: string[];
    summary: string;
    timeline: IncidentTimelineEntry[];
    iocs: IndicatorOfCompromise[];
}

export interface IncidentTimelineEntry {
    id: string;
    timestamp: Date;
    author: string;
    note: string;
}

export interface IndicatorOfCompromise {
    id: string;
    type: 'IP' | 'Domain' | 'Hash' | 'URL';
    value: string;
    firstSeen: Date;
    reputation: 'Malicious' | 'Suspicious' | 'Benign';
}

export interface Asset {
    id: string;
    hostname: string;
    ipAddress: string;
    type: AssetType;
    os: string;
    riskScore: number;
    protectionStatus: 'Protected' | 'Unprotected' | 'Partial';
    openVulnerabilities: number;
    lastSeen: Date;
}

export interface Vulnerability {
    cveId: string;
    severity: Severity;
    description: string;
    cvssScore: number;
    affectedAssets: string[];
    publishedDate: Date;
    remediation: string;
    status: 'Open' | 'Patched' | 'Risk Accepted';
}

export interface ThreatIntel {
    id: string;
    source: string;
    title: string;
    published: Date;
    summary: string;
    tags: string[];
    iocs: IndicatorOfCompromise[];
}

export interface Playbook {
    id: string;
    name: string;
    description: string;
    trigger: string;
    lastRun: Date;
    lastRunStatus: PlaybookStatus;
}

export interface UserBehavior {
    userId: string;
    userName: string;
    riskScore: number;
    baselineDeviation: number;
    recentAnomalies: string[];
    lastSeen: Date;
}

export interface ComplianceControl {
    id: string;
    framework: 'PCI-DSS' | 'GDPR' | 'SOX' | 'ISO 27001';
    controlId: string;
    description: string;
    status: 'Compliant' | 'Non-Compliant' | 'In-Review';
    lastAudit: Date;
}

// --- MOCK DATA GENERATORS ---

const FAKE_IPS = ['192.168.1.10', '10.0.0.54', '172.16.31.9', '203.0.113.15', '198.51.100.22', '8.8.8.8', '1.1.1.1'];
const FAKE_HOSTNAMES = ['web-prod-01', 'db-main-01', 'api-gateway-a', 'auth-service-b', 'k8s-node-05', 'ad-controller-primary'];
const FAKE_USERS = ['john.doe', 'jane.smith', 'admin', 'soc-team-a', 'dev-team-c', 'auditor-ext'];
const FAKE_MALWARE = ['Trojan.GenericKD.3142', 'Ransom.WannaCry', 'Spy.ZeuS.Stealer', 'Backdoor.Agent.Tesla'];
const FAKE_CVE = ['CVE-2021-44228', 'CVE-2022-22965', 'CVE-2017-5638', 'CVE-2019-19781'];
const FAKE_DOMAINS = ['malicious-site.xyz', 'phishing-login.com', 'evil-cdn-network.net', 'hackers-command.ru'];

export const generateMockAssets = (count: number): Asset[] => {
    const assets: Asset[] = [];
    for (let i = 0; i < count; i++) {
        const hostname = FAKE_HOSTNAMES[i % FAKE_HOSTNAMES.length] + `-${i}`;
        assets.push({
            id: `ASSET-${1000 + i}`,
            hostname: hostname,
            ipAddress: `10.1.${Math.floor(i / 255)}.${i % 255}`,
            type: ['Server', 'Database', 'Application', 'Network Device'][i % 4] as AssetType,
            os: ['Ubuntu 22.04 LTS', 'Windows Server 2019', 'CentOS 7', 'Cisco IOS'][i % 4],
            riskScore: Math.floor(Math.random() * 100),
            protectionStatus: Math.random() > 0.1 ? 'Protected' : 'Unprotected',
            openVulnerabilities: Math.floor(Math.random() * 5),
            lastSeen: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24),
        });
    }
    return assets;
};

export const generateMockAlerts = (count: number, assets: Asset[]): Alert[] => {
    const alerts: Alert[] = [];
    const titles = [
        'Anomalous Login from Unrecognized IP',
        'Potential Malware Detected',
        'Multiple Failed Login Attempts',
        'Outdated Security Patch Detected',
        'Suspicious Network Traffic to Known C2 Server',
        'SQL Injection Attempt',
        'Privilege Escalation Detected'
    ];
    for (let i = 0; i < count; i++) {
        const severity = [ 'Critical', 'High', 'Medium', 'Low'][i % 4] as Severity;
        const affectedAsset = assets[Math.floor(Math.random() * assets.length)];
        alerts.push({
            id: `AL-${92842 + i}`,
            severity,
            title: `${titles[i % titles.length]} on \`${affectedAsset.hostname}\``,
            timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 72),
            status: ['New', 'In Progress', 'Resolved'][i % 3] as Status,
            assignedTo: FAKE_USERS[i % FAKE_USERS.length],
            sourceIp: FAKE_IPS[Math.floor(Math.random() * FAKE_IPS.length)],
            destinationIp: affectedAsset.ipAddress,
            affectedAssets: [affectedAsset.id],
            relatedIncidentId: (severity === 'Critical' || severity === 'High') && Math.random() > 0.5 ? `INC-${101 + Math.floor(i / 10)}` : undefined
        });
    }
    return alerts.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const generateMockVulnerabilities = (count: number, assets: Asset[]): Vulnerability[] => {
    const vulnerabilities: Vulnerability[] = [];
    for (let i = 0; i < count; i++) {
        vulnerabilities.push({
            cveId: FAKE_CVE[i % FAKE_CVE.length],
            severity: ['Critical', 'High', 'Medium', 'Low'][i % 4] as Severity,
            description: `A remote code execution vulnerability exists in Apache Log4j2. An attacker who successfully exploited this vulnerability could take control of an affected system.`,
            cvssScore: parseFloat((Math.random() * 6 + 4).toFixed(1)),
            affectedAssets: assets.slice(i, i + 5).map(a => a.hostname),
            publishedDate: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365),
            remediation: 'Update to the latest version of the affected component.',
            status: 'Open'
        });
    }
    return vulnerabilities;
};

export const generateMockIncidents = (count: number, allAlerts: Alert[]): Incident[] => {
    const incidents: Incident[] = [];
    for (let i = 0; i < count; i++) {
        const relatedAlerts = allAlerts.filter(a => a.relatedIncidentId === `INC-${101 + i}`);
        incidents.push({
            id: `INC-${101 + i}`,
            title: `Investigation of ${relatedAlerts[0]?.title || 'Critical Security Event'}`,
            status: ['Active', 'Contained', 'Eradicated', 'Closed'][i % 4] as IncidentStatus,
            severity: ['Critical', 'High'][i % 2] as Severity,
            createdAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 10),
            updatedAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60),
            leadAnalyst: FAKE_USERS[i % 3],
            relatedAlerts: relatedAlerts.map(a => a.id),
            summary: 'Initial analysis indicates a coordinated attack targeting public-facing web servers. IOCs have been identified and containment procedures are underway.',
            timeline: [
                { id: `T-${i}-1`, timestamp: new Date(), author: 'soc-automation', note: 'Incident created from critical alert AL-92850.'},
                { id: `T-${i}-2`, timestamp: new Date(), author: FAKE_USERS[i%3], note: 'Assigned to incident. Starting initial investigation.'},
            ],
            iocs: [
                { id: `IOC-${i}-1`, type: 'IP', value: '203.0.113.15', firstSeen: new Date(), reputation: 'Malicious'},
                { id: `IOC-${i}-2`, type: 'Hash', value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', firstSeen: new Date(), reputation: 'Malicious'},
            ]
        });
    }
    return incidents;
};

// --- HELPER & UTILITY COMPONENTS ---

export const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
    const colorMap: { [key: string]: string } = {
        'Critical': 'bg-red-500/50 text-red-200 border-red-500',
        'High': 'bg-orange-500/50 text-orange-200 border-orange-500',
        'Medium': 'bg-yellow-500/50 text-yellow-200 border-yellow-500',
        'Low': 'bg-blue-500/50 text-blue-200 border-blue-500',
        'Informational': 'bg-gray-500/50 text-gray-200 border-gray-500',
    };
    return <span className={`px-2 py-1 text-xs font-bold rounded-full border whitespace-nowrap ${colorMap[severity] || ''}`}>{severity}</span>;
}

export const StatusPill: React.FC<{ status: string }> = ({ status }) => {
    const colorMap: { [key: string]: string } = {
        'New': 'bg-blue-500/50 text-blue-200',
        'In Progress': 'bg-yellow-500/50 text-yellow-200',
        'Active': 'bg-yellow-500/50 text-yellow-200',
        'Resolved': 'bg-green-500/50 text-green-200',
        'Closed': 'bg-gray-500/50 text-gray-200',
        'Dismissed': 'bg-gray-600/50 text-gray-300',
        'Contained': 'bg-purple-500/50 text-purple-200',
        'Eradicated': 'bg-indigo-500/50 text-indigo-200',
        'Compliant': 'bg-green-500/50 text-green-200',
        'Non-Compliant': 'bg-red-500/50 text-red-200'
    };
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colorMap[status] || 'bg-gray-400/50 text-gray-100'}`}>{status}</span>;
}

export const Tab: React.FC<{ label: string, icon?: React.ReactNode, active: boolean, onClick: () => void }> = ({ label, icon, active, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
                active 
                ? 'bg-gray-800/60 border-b-2 border-blue-400 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
            }`}
        >
            {icon}
            {label}
        </button>
    );
};

export const Sparkline: React.FC<{ data: number[], color: string }> = ({ data, color }) => {
    const chartData = data.map((value, index) => ({ name: index, value }));
    return (
        <div className="w-full h-12">
            <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={`color-${color}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={color} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#color-${color})`} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

// --- DATA TABLE COMPONENTS & HOOKS ---

export type SortDirection = 'ascending' | 'descending';

export interface Column<T> {
    accessor: keyof T;
    header: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
}

export interface SortConfig<T> {
    key: keyof T;
    direction: SortDirection;
}

export const useSortableData = <T,>(items: T[], config: SortConfig<T> | null = null) => {
    const [sortConfig, setSortConfig] = useState(config);

    const sortedItems = useMemo(() => {
        if (!items) return [];
        let sortableItems = [...items];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [items, sortConfig]);

    const requestSort = (key: keyof T) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return { items: sortedItems, requestSort, sortConfig };
};

export const usePagination = <T,>(data: T[], itemsPerPage: number = 10) => {
    const [currentPage, setCurrentPage] = useState(1);
    const maxPage = Math.ceil(data.length / itemsPerPage);

    const currentData = useMemo(() => {
        const begin = (currentPage - 1) * itemsPerPage;
        const end = begin + itemsPerPage;
        return data.slice(begin, end);
    }, [data, currentPage, itemsPerPage]);

    const next = () => setCurrentPage(currentPage => Math.min(currentPage + 1, maxPage));
    const prev = () => setCurrentPage(currentPage => Math.max(currentPage - 1, 1));
    const jump = (page: number) => {
        const pageNumber = Math.max(1, page);
        setCurrentPage(() => Math.min(pageNumber, maxPage));
    };
    
    return { next, prev, jump, currentData, currentPage, maxPage };
};

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    initialSort?: SortConfig<T>;
    onRowClick?: (item: T) => void;
}

export function DataTable<T extends { id: any }>({ data, columns, initialSort, onRowClick }: DataTableProps<T>) {
    const [filterText, setFilterText] = useState('');
    
    const filteredData = useMemo(() => 
        data.filter(item => 
            Object.values(item).some(val => 
                String(val).toLowerCase().includes(filterText.toLowerCase())
            )
        ), [data, filterText]);

    const { items, requestSort, sortConfig } = useSortableData(filteredData, initialSort);
    const { next, prev, jump, currentData, currentPage, maxPage } = usePagination(items, 15);

    const getSortIcon = (key: keyof T) => {
        if (!sortConfig || sortConfig.key !== key) {
            return null;
        }
        if (sortConfig.direction === 'ascending') {
            return <ChevronUpIcon className="w-4 h-4" />;
        }
        return <ChevronDownIcon className="w-4 h-4" />;
    };

    return (
        <div className="w-full">
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Filter table..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="w-full md:w-1/3 p-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="overflow-x-auto bg-gray-900/50 rounded-lg border border-gray-800">
                <table className="min-w-full text-sm text-left text-gray-300">
                    <thead className="bg-gray-900/70 text-xs uppercase text-gray-400">
                        <tr>
                            {columns.map((col) => (
                                <th key={String(col.accessor)} scope="col" className="px-6 py-3">
                                    <div 
                                        className={`flex items-center gap-1 ${col.sortable ? 'cursor-pointer' : ''}`}
                                        onClick={() => col.sortable && requestSort(col.accessor)}
                                    >
                                        {col.header}
                                        {col.sortable && getSortIcon(col.accessor)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((item) => (
                            <tr 
                                key={item.id} 
                                className={`border-b border-gray-800 hover:bg-gray-800/50 ${onRowClick ? 'cursor-pointer' : ''}`}
                                onClick={() => onRowClick && onRowClick(item)}
                            >
                                {columns.map((col) => (
                                    <td key={`${item.id}-${String(col.accessor)}`} className="px-6 py-4">
                                        {col.render ? col.render(item) : String(item[col.accessor])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
                <span>
                    Page {currentPage} of {maxPage}
                </span>
                <div className="flex items-center gap-2">
                    <button onClick={prev} disabled={currentPage === 1} className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50">Prev</button>
                    <button onClick={next} disabled={currentPage === maxPage} className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50">Next</button>
                </div>
            </div>
        </div>
    );
}


// --- FEATURE VIEWS ---

export const DashboardView: React.FC = () => {
    const events24h = useMemo(() => Array.from({length: 24}, () => Math.floor(Math.random() * 20 + 5)), []);
    const protectedHistory = useMemo(() => Array.from({length: 24}, (_, i) => 98 - Math.random() + (i / 24)), []);

    const eventsLastHourData = [
        { name: '50m', events: 12 }, { name: '40m', events: 19 }, { name: '30m', events: 10 },
        { name: '20m', events: 25 }, { name: '10m', events: 15 }, { name: 'Now', events: 21 },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-400">Active Alerts</p>
                        <BellIcon className="w-5 h-5 text-red-400" />
                    </div>
                    <p className="text-4xl font-bold text-red-400 mt-2">4</p>
                    <Sparkline data={[2,3,3,4,3,4,4]} color="#f87171" />
                </Card>
                <Card>
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-400">Events (24h)</p>
                        <FileReportIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-4xl font-bold text-white mt-2">1,832</p>
                    <Sparkline data={events24h} color="#60a5fa" />
                </Card>
                <Card>
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-400">Resources Protected</p>
                        <ShieldCheckIcon className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-4xl font-bold text-white mt-2">98.3%</p>
                    <Sparkline data={protectedHistory} color="#4ade80" />
                </Card>
                <Card>
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-400">Compliance Score</p>
                        <UsersIcon className="w-5 h-5 text-yellow-400" />
                    </div>
                    <p className="text-4xl font-bold text-white mt-2">A+</p>
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-300 h-2.5 rounded-full" style={{width: '95%'}}></div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card title="Threats by Type (Last 24h)" className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={300}>
                         <PieChart>
                            <Pie data={threatsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false}>
                                {threatsData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
                 <Card title="Active Alerts" className="lg:col-span-3">
                     <div className="space-y-3">
                        {activeAlerts.map(alert => (
                            <div key={alert.id} className="p-3 bg-gray-900/50 rounded-lg flex items-center justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <SeverityBadge severity={alert.severity} />
                                    <div>
                                        <p className="text-sm text-white">{alert.title}</p>
                                        <p className="text-xs text-gray-400">{alert.time}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                     <StatusPill status={alert.status} />
                                     <p className="text-xs text-gray-500 mt-1">@{alert.assignedTo}</p>
                                </div>
                            </div>
                        ))}
                     </div>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Events (Last Hour)">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={eventsLastHourData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                            <YAxis stroke="#9ca3af" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Bar dataKey="events" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Security Automation - Playbook Executions">
                     <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 rounded bg-gray-800/50">
                            <span className="text-sm font-mono">playbook:isolate-host</span>
                            <span className="text-xs text-green-400 font-bold">SUCCESS</span>
                            <span className="text-xs text-gray-400">1m ago</span>
                        </div>
                         <div className="flex items-center justify-between p-2 rounded bg-gray-800/50">
                            <span className="text-sm font-mono">playbook:block-ip</span>
                            <span className="text-xs text-green-400 font-bold">SUCCESS</span>
                            <span className="text-xs text-gray-400">5m ago</span>
                        </div>
                         <div className="flex items-center justify-between p-2 rounded bg-gray-800/50">
                            <span className="text-sm font-mono">playbook:scan-endpoint</span>
                            <span className="text-xs text-yellow-400 font-bold">RUNNING</span>
                            <span className="text-xs text-gray-400">10m ago</span>
                        </div>
                         <div className="flex items-center justify-between p-2 rounded bg-gray-800/50">
                            <span className="text-sm font-mono">playbook:disable-user</span>
                            <span className="text-xs text-red-400 font-bold">FAILED</span>
                            <span className="text-xs text-gray-400">12m ago</span>
                        </div>
                     </div>
                </Card>
            </div>
        </div>
    );
};

export const AlertsView: React.FC<{alerts: Alert[], onAlertClick: (alert: Alert) => void}> = ({alerts, onAlertClick}) => {
    const columns: Column<Alert>[] = [
        { accessor: 'id', header: 'ID', sortable: true },
        { 
            accessor: 'severity', 
            header: 'Severity', 
            sortable: true,
            render: (item) => <SeverityBadge severity={item.severity} />
        },
        { accessor: 'title', header: 'Title', sortable: true, render: (item) => <p className="max-w-md truncate">{item.title}</p>},
        { 
            accessor: 'timestamp', 
            header: 'Timestamp', 
            sortable: true, 
            render: (item) => <span>{item.timestamp.toLocaleString()}</span> 
        },
        { 
            accessor: 'status', 
            header: 'Status', 
            sortable: true,
            render: (item) => <StatusPill status={item.status} />
        },
        { accessor: 'assignedTo', header: 'Assigned To', sortable: true, render: (item) => <span>@{item.assignedTo}</span> },
    ];
    
    return (
        <Card title="All Security Alerts">
            <DataTable 
                data={alerts} 
                columns={columns}
                initialSort={{ key: 'timestamp', direction: 'descending'}}
                onRowClick={onAlertClick}
            />
        </Card>
    );
};

export const IncidentDetailPanel: React.FC<{incident: Incident}> = ({ incident }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card title={`Incident Details: ${incident.id}`}>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <h3 className="text-xl font-bold text-white">{incident.title}</h3>
                            <SeverityBadge severity={incident.severity} />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                           <div><p className="text-gray-400">Status</p><StatusPill status={incident.status} /></div>
                           <div><p className="text-gray-400">Lead Analyst</p><p>@{incident.leadAnalyst}</p></div>
                           <div><p className="text-gray-400">Created</p><p>{incident.createdAt.toLocaleString()}</p></div>
                           <div><p className="text-gray-400">Updated</p><p>{incident.updatedAt.toLocaleString()}</p></div>
                        </div>
                        <div>
                             <p className="text-gray-400">Summary</p>
                             <p className="mt-1 text-gray-300">{incident.summary}</p>
                        </div>
                         <div>
                             <p className="text-gray-400 mb-2">Related Alerts</p>
                             <div className="space-y-1">
                                {incident.relatedAlerts.map(id => <p key={id} className="font-mono text-xs p-1 bg-gray-900 rounded inline-block mr-2">{id}</p>)}
                            </div>
                        </div>
                    </div>
                </Card>
                 <Card title="Timeline & Notes">
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {incident.timeline.map(entry => (
                             <div key={entry.id} className="relative pl-8">
                                <div className="absolute left-0 top-1 h-full border-l-2 border-gray-700">
                                    <div className="absolute -left-[9px] w-4 h-4 bg-blue-500 rounded-full border-2 border-gray-800"></div>
                                </div>
                                <p className="text-xs text-gray-400">{entry.timestamp.toLocaleString()} by @{entry.author}</p>
                                <p className="text-sm text-gray-200">{entry.note}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
                 <Card title="Indicators of Compromise (IOCs)">
                    <div className="space-y-2">
                        {incident.iocs.map(ioc => (
                             <div key={ioc.id} className="p-2 bg-gray-900 rounded">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-mono text-cyan-300">{ioc.value}</span>
                                    <span className="text-xs px-1.5 py-0.5 bg-red-800 rounded">{ioc.reputation}</span>
                                </div>
                                <p className="text-xs text-gray-500">{ioc.type} - Seen {ioc.firstSeen.toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card title="Actions">
                    <div className="flex flex-col space-y-2">
                        <button className="w-full text-left p-2 bg-blue-600/50 hover:bg-blue-600/80 rounded">Assign to Analyst...</button>
                        <button className="w-full text-left p-2 bg-yellow-600/50 hover:bg-yellow-600/80 rounded">Change Status...</button>
                        <button className="w-full text-left p-2 bg-purple-600/50 hover:bg-purple-600/80 rounded">Run Playbook...</button>
                        <button className="w-full text-left p-2 bg-gray-600/50 hover:bg-gray-600/80 rounded">Add Note</button>
                        <button className="w-full text-left p-2 bg-green-600/50 hover:bg-green-600/80 rounded">Resolve Incident</button>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export const IncidentsView: React.FC<{incidents: Incident[]}> = ({ incidents }) => {
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    
    const columns: Column<Incident>[] = [
        { accessor: 'id', header: 'ID', sortable: true },
        { 
            accessor: 'severity', 
            header: 'Severity', 
            sortable: true,
            render: (item) => <SeverityBadge severity={item.severity} />
        },
        { accessor: 'title', header: 'Title', sortable: true, render: (item) => <p className="max-w-md truncate">{item.title}</p>},
        { 
            accessor: 'status', 
            header: 'Status', 
            sortable: true,
            render: (item) => <StatusPill status={item.status} />
        },
         { 
            accessor: 'updatedAt', 
            header: 'Last Updated', 
            sortable: true, 
            render: (item) => <span>{item.updatedAt.toLocaleString()}</span> 
        },
        { accessor: 'leadAnalyst', header: 'Lead Analyst', sortable: true, render: (item) => <span>@{item.leadAnalyst}</span> },
    ];
    
    if (selectedIncident) {
        return (
            <div>
                 <button onClick={() => setSelectedIncident(null)} className="mb-4 px-3 py-1 text-sm bg-gray-700 rounded hover:bg-gray-600">
                    &larr; Back to All Incidents
                </button>
                <IncidentDetailPanel incident={selectedIncident} />
            </div>
        )
    }
    
    return (
        <Card title="Incident Management">
            <DataTable 
                data={incidents} 
                columns={columns}
                initialSort={{ key: 'updatedAt', direction: 'descending'}}
                onRowClick={(incident) => setSelectedIncident(incident)}
            />
        </Card>
    );
};

export const AssetManagementView: React.FC<{assets: Asset[]}> = ({assets}) => {
    const columns: Column<Asset>[] = [
        { accessor: 'hostname', header: 'Hostname', sortable: true },
        { accessor: 'ipAddress', header: 'IP Address', sortable: true },
        { accessor: 'type', header: 'Type', sortable: true },
        { accessor: 'os', header: 'Operating System', sortable: true },
        { accessor: 'riskScore', header: 'Risk Score', sortable: true, render: (item) => 
            <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-700 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{width: `${item.riskScore}%`}}></div>
                </div>
                <span>{item.riskScore}</span>
            </div>
        },
        { accessor: 'protectionStatus', header: 'Protection', sortable: true, render: (item) => <StatusPill status={item.protectionStatus} /> },
        { accessor: 'openVulnerabilities', header: 'Vulns', sortable: true },
    ];
    
    return (
        <Card title="Asset Inventory">
            <DataTable 
                data={assets} 
                columns={columns}
                initialSort={{ key: 'riskScore', direction: 'descending'}}
            />
        </Card>
    );
};

export const VulnerabilityCenterView: React.FC<{vulnerabilities: Vulnerability[]}> = ({vulnerabilities}) => {
     const columns: Column<Vulnerability>[] = [
        { accessor: 'cveId', header: 'CVE ID', sortable: true, render: (item) => 
            <a href="#" className="text-blue-400 hover:underline flex items-center gap-1">
                {item.cveId} <ExternalLinkIcon className="w-3 h-3"/>
            </a>
        },
        { 
            accessor: 'severity', 
            header: 'Severity', 
            sortable: true,
            render: (item) => <SeverityBadge severity={item.severity} />
        },
         { accessor: 'cvssScore', header: 'CVSS', sortable: true},
        { accessor: 'description', header: 'Description', sortable: false, render: (item) => <p className="max-w-lg truncate">{item.description}</p>},
        { 
            accessor: 'affectedAssets', 
            header: 'Affected', 
            sortable: true, 
            render: (item) => <span>{item.affectedAssets.length} assets</span> 
        },
    ];

    return (
        <Card title="Vulnerability Management">
            <DataTable 
                data={vulnerabilities} 
                columns={columns}
                initialSort={{ key: 'cvssScore', direction: 'descending'}}
            />
        </Card>
    );
}

// --- MAIN COMPONENT ---
type View = 'dashboard' | 'alerts' | 'incidents' | 'assets' | 'vulnerabilities';

const DemoBankSecurityCenterView: React.FC = () => {
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [allAssets, setAllAssets] = useState<Asset[]>([]);
    const [allAlerts, setAllAlerts] = useState<Alert[]>([]);
    const [allIncidents, setAllIncidents] = useState<Incident[]>([]);
    const [allVulnerabilities, setAllVulnerabilities] = useState<Vulnerability[]>([]);

    useEffect(() => {
        // Simulate fetching data from an API on component mount
        const assets = generateMockAssets(250);
        const alerts = generateMockAlerts(500, assets);
        const incidents = generateMockIncidents(20, alerts);
        const vulnerabilities = generateMockVulnerabilities(50, assets);

        setAllAssets(assets);
        setAllAlerts(alerts);
        setAllIncidents(incidents);
        setAllVulnerabilities(vulnerabilities);
    }, []);

    const renderView = () => {
        switch(activeView) {
            case 'dashboard':
                return <DashboardView />;
            case 'alerts':
                return <AlertsView alerts={allAlerts} onAlertClick={(alert) => {
                    if (alert.relatedIncidentId) {
                        // For this demo, we are just switching views. A real app would navigate to the specific incident.
                        setActiveView('incidents');
                    }
                }} />;
            case 'incidents':
                return <IncidentsView incidents={allIncidents} />;
            case 'assets':
                return <AssetManagementView assets={allAssets} />;
            case 'vulnerabilities':
                return <VulnerabilityCenterView vulnerabilities={allVulnerabilities} />;
            default:
                return <DashboardView />;
        }
    }

    const tabs: {id: View, label: string, icon: React.ReactNode}[] = [
        {id: 'dashboard', label: 'Dashboard', icon: <FileReportIcon className="w-5 h-5"/>},
        {id: 'alerts', label: 'Alerts', icon: <BellIcon className="w-5 h-5"/>},
        {id: 'incidents', label: 'Incidents', icon: <ShieldCheckIcon className="w-5 h-5"/>},
        {id: 'assets', label: 'Assets', icon: <ServerIcon className="w-5 h-5"/>},
        {id: 'vulnerabilities', label: 'Vulnerabilities', icon: <BugIcon className="w-5 h-5"/>},
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center">
                <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Security Center</h2>
                <div className="text-sm text-gray-400 mt-2 md:mt-0">Last updated: {new Date().toLocaleTimeString()}</div>
            </div>
            
            <div className="border-b border-gray-700">
                <div className="flex flex-wrap -mb-px">
                    {tabs.map(tab => (
                        <Tab 
                            key={tab.id} 
                            label={tab.label}
                            icon={tab.icon}
                            active={activeView === tab.id}
                            onClick={() => setActiveView(tab.id)}
                        />
                    ))}
                </div>
            </div>

            <div className="mt-6">
                {renderView()}
            </div>
        </div>
    );
};

export default DemoBankSecurityCenterView;