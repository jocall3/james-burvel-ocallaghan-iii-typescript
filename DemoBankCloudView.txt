import React, { useState, useEffect, useCallback, useMemo, FC } from 'react';
import Card from '../../Card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';

// --- ENHANCED TYPES FOR A REAL-WORLD APPLICATION ---

export type ServiceStatus = 'Running' | 'Stopped' | 'Pending' | 'Error' | 'Available' | 'Updating';
export type CloudRegion = 'us-east-1' | 'us-west-2' | 'eu-central-1' | 'ap-southeast-2';
export type InstanceType = 't3.micro' | 'm5.large' | 'c5.2xlarge' | 'g4dn.xlarge' | 'r6g.4xlarge';
export type AlertSeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'FATAL';
export type DeploymentStatus = 'Success' | 'In Progress' | 'Failed' | 'Rolled Back';
export type UserRole = 'Admin' | 'Developer' | 'Viewer' | 'BillingManager';

export interface CloudService {
  id: string;
  name: string;
  type: 'Compute' | 'Storage' | 'Database' | 'Networking' | 'AI/ML' | 'Security';
  status: ServiceStatus;
  region: CloudRegion;
  instanceType: InstanceType;
  createdAt: Date;
  uptime: number; // in hours
  costPerHour: number;
  tags: Record<string, string>;
  publicIp?: string;
  privateIp: string;
}

export interface ServiceMetricPoint {
  timestamp: number;
  cpu_percent: number;
  memory_percent: number;
  disk_io_read: number; // kb/s
  disk_io_write: number; // kb/s
  network_in: number; // kb/s
  network_out: number; // kb/s
}

export interface ServiceLogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  serviceId: string;
}

export interface ActiveAlert {
  id: string;
  serviceId: string;
  serviceName: string;
  severity: AlertSeverity;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
}

export interface BillingInvoice {
    id: string;
    month: string;
    amount: number;
    status: 'Paid' | 'Due' | 'Overdue';
    dueDate: Date;
    pdfUrl: string;
}

export interface IaCDeployment {
    id: string;
    templateName: string;
    version: string;
    deployedBy: string;
    timestamp: Date;
    status: DeploymentStatus;
    changelog: string;
}

export interface IAMUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    lastLogin: Date;
    mfaEnabled: boolean;
}


// --- MOCK DATA GENERATION FOR A REAL-WORLD SIMULATION ---

const REGIONS: CloudRegion[] = ['us-east-1', 'us-west-2', 'eu-central-1', 'ap-southeast-2'];
const SERVICE_TYPES: CloudService['type'][] = ['Compute', 'Storage', 'Database', 'Networking', 'AI/ML', 'Security'];
const INSTANCE_TYPES: InstanceType[] = ['t3.micro', 'm5.large', 'c5.2xlarge', 'g4dn.xlarge', 'r6g.4xlarge'];
const STATUSES: ServiceStatus[] = ['Running', 'Stopped', 'Pending', 'Error', 'Available', 'Updating'];

const generateRandomIp = () => `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;

export const generateMockServices = (count: number): CloudService[] => {
    return Array.from({ length: count }, (_, i) => {
        const type = SERVICE_TYPES[i % SERVICE_TYPES.length];
        return {
            id: `srv-${Date.now()}-${i}`,
            name: `${type.toLowerCase().replace('/','-')}-${i.toString().padStart(3,'0')}-${REGIONS[i % REGIONS.length].split('-')[0]}`,
            type,
            status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
            region: REGIONS[i % REGIONS.length],
            instanceType: INSTANCE_TYPES[Math.floor(Math.random() * INSTANCE_TYPES.length)],
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            uptime: Math.floor(Math.random() * 720),
            costPerHour: parseFloat((0.05 + Math.random() * 2).toFixed(4)),
            tags: { project: `project-${i%5}`, owner: `team-${['alpha', 'beta', 'gamma'][i%3]}` },
            publicIp: type === 'Compute' ? generateRandomIp() : undefined,
            privateIp: `10.0.${Math.floor(i/256)}.${i%256}`,
        };
    });
};

export const generateMockAlerts = (services: CloudService[]): ActiveAlert[] => {
    const alerts: ActiveAlert[] = [];
    services.forEach(service => {
        if (service.status === 'Error' || Math.random() < 0.1) {
             alerts.push({
                id: `alert-${service.id}-${Date.now()}`,
                serviceId: service.id,
                serviceName: service.name,
                severity: ['Critical', 'High', 'Medium'][Math.floor(Math.random()*3)] as AlertSeverity,
                message: service.status === 'Error' ? 'Service entered error state' : ['High CPU utilization (>95%)', 'Memory leak detected', 'Low disk space (< 1GB)'][Math.floor(Math.random()*3)],
                timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
                acknowledged: Math.random() > 0.5,
                resolved: false,
            });
        }
    });
    return alerts;
};

const LOG_MESSAGES: Record<LogLevel, string[]> = {
    INFO: ["User authentication successful", "Service started successfully", "Configuration loaded", "Data processing complete"],
    WARN: ["High latency detected on upstream service", "Disk space nearing capacity", "API rate limit approaching"],
    ERROR: ["Failed to connect to database", "Null pointer exception at processData()", "Upstream service timeout"],
    DEBUG: ["Executing query...", "Payload received", "Variable dump"],
    FATAL: ["Unrecoverable error: Corrupted data store", "System shutting down due to critical failure"]
};

export const generateMockLogs = (serviceId: string, count: number): ServiceLogEntry[] => {
    return Array.from({ length: count }, (_, i) => {
        const levels = Object.keys(LOG_MESSAGES) as LogLevel[];
        const level = levels[Math.floor(Math.pow(Math.random(), 2) * levels.length)];
        return {
            id: `log-${serviceId}-${Date.now()}-${i}`,
            timestamp: new Date(Date.now() - i * 60 * 1000 * Math.random()),
            level,
            message: LOG_MESSAGES[level][Math.floor(Math.random() * LOG_MESSAGES[level].length)],
            serviceId,
        };
    }).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const generateMockMetrics = (hours: number): ServiceMetricPoint[] => {
    const now = Date.now();
    return Array.from({ length: hours * 60 }, (_, i) => ({
        timestamp: now - (hours * 60 - i) * 60 * 1000,
        cpu_percent: Math.min(99, 20 + Math.random() * 30 + Math.sin(i / 60) * 15),
        memory_percent: 45 + Math.random() * 20,
        disk_io_read: Math.random() * 500,
        disk_io_write: Math.random() * 300,
        network_in: 1000 + Math.random() * 2000,
        network_out: 500 + Math.random() * 1000,
    }));
};

export const generateMockInvoices = (): BillingInvoice[] => {
    return Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return {
            id: `inv-${d.getFullYear()}-${d.getMonth()+1}`,
            month: d.toLocaleString('default', { month: 'long', year: 'numeric' }),
            amount: 38000 + Math.random() * 5000,
            status: i === 0 ? 'Due' : 'Paid',
            dueDate: new Date(d.getFullYear(), d.getMonth() + 1, 15),
            pdfUrl: `#`, // In a real app, this would be a link to a PDF file
        };
    });
};

export const generateMockDeployments = (): IaCDeployment[] => {
    const users = ['alice@demobank.com', 'bob@demobank.com', 'charlie@demobank.com'];
    const templates = ['vpc-prod', 'rds-main-cluster', 'k8s-platform', 'data-pipeline'];
    return Array.from({length: 20}, (_, i) => ({
        id: `deploy-${Date.now()}-${i}`,
        templateName: templates[i % templates.length],
        version: `v1.${5 - Math.floor(i/4)}.${i%4}`,
        deployedBy: users[i % users.length],
        timestamp: new Date(Date.now() - i * 6 * 60 * 60 * 1000),
        status: ['Success', 'Success', 'Success', 'Failed', 'In Progress'][Math.floor(Math.random() * 4.5)],
        changelog: `Update ${templates[i % templates.length]} to version ${`v1.${5 - Math.floor(i/4)}.${i%4}`}.`
    }));
};

export const generateMockUsers = (): IAMUser[] => {
    const roles: UserRole[] = ['Admin', 'Developer', 'Viewer', 'BillingManager'];
    return [
        { id: 'usr-1', name: 'Alice Wonder', email: 'alice@demobank.com', role: 'Admin', lastLogin: new Date(Date.now() - 30 * 60 * 1000), mfaEnabled: true },
        { id: 'usr-2', name: 'Bob Builder', email: 'bob@demobank.com', role: 'Developer', lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), mfaEnabled: true },
        { id: 'usr-3', name: 'Charlie Bucket', email: 'charlie@demobank.com', role: 'Developer', lastLogin: new Date(Date.now() - 25 * 60 * 60 * 1000), mfaEnabled: false },
        { id: 'usr-4', name: 'Diana Prince', email: 'diana@demobank.com', role: 'Viewer', lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), mfaEnabled: true },
        { id: 'usr-5', name: 'Eve Moneypenny', email: 'eve@demobank.com', role: 'BillingManager', lastLogin: new Date(Date.now() - 8 * 60 * 60 * 1000), mfaEnabled: true },
    ];
};


// --- MOCK API LAYER ---

const mockApi = {
    getDashboardMetrics: async (region: CloudRegion | 'all') => {
        await new Promise(res => setTimeout(res, 500));
        const services = mockServices.filter(s => region === 'all' || s.region === region);
        const alerts = mockAlerts.filter(a => region === 'all' || services.find(s => s.id === a.serviceId)?.region === region);
        const totalCost = services.reduce((acc, s) => acc + (s.costPerHour * s.uptime), 0);
        return {
            activeServices: services.filter(s => s.status === 'Running').length,
            totalServices: services.length,
            uptime: 99.99,
            monthlyCost: totalCost,
            activeAlerts: alerts.filter(a => !a.resolved).length,
        };
    },
    getServices: async (region: CloudRegion | 'all') => {
        await new Promise(res => setTimeout(res, 800));
        return mockServices.filter(s => region === 'all' || s.region === region);
    },
    getServiceDetails: async (serviceId: string) => {
        await new Promise(res => setTimeout(res, 300));
        return mockServices.find(s => s.id === serviceId) || null;
    },
    getServiceMetrics: async (serviceId: string, timeRangeHours: number) => {
        await new Promise(res => setTimeout(res, 600));
        return generateMockMetrics(timeRangeHours);
    },
    getServiceLogs: async (serviceId: string) => {
        await new Promise(res => setTimeout(res, 700));
        return generateMockLogs(serviceId, 200);
    },
    performServiceAction: async (serviceId: string, action: 'start' | 'stop' | 'restart') => {
        await new Promise(res => setTimeout(res, 1500));
        const service = mockServices.find(s => s.id === serviceId);
        if (service) {
            if (action === 'start') service.status = 'Running';
            if (action === 'stop') service.status = 'Stopped';
            if (action === 'restart') {
                service.status = 'Pending';
                setTimeout(() => { service.status = 'Running'; }, 2000);
            }
        }
        return service;
    },
    getAlerts: async (region: CloudRegion | 'all') => {
        await new Promise(res => setTimeout(res, 400));
        const servicesInRegion = mockServices.filter(s => region === 'all' || s.region === region).map(s => s.id);
        return mockAlerts.filter(a => servicesInRegion.includes(a.serviceId));
    },
    updateAlertStatus: async (alertId: string, status: 'acknowledged' | 'resolved') => {
        await new Promise(res => setTimeout(res, 200));
        const alert = mockAlerts.find(a => a.id === alertId);
        if(alert) {
            if (status === 'acknowledged') alert.acknowledged = true;
            if (status === 'resolved') alert.resolved = true;
        }
        return alert;
    },
    getBillingData: async () => {
        await new Promise(res => setTimeout(res, 500));
        const costByCategory = mockServices.reduce((acc, s) => {
            if(!acc[s.type]) acc[s.type] = 0;
            acc[s.type] += s.costPerHour * s.uptime;
            return acc;
        }, {} as Record<string, number>);

        return {
            invoices: mockInvoices,
            costByCategory: Object.entries(costByCategory).map(([name, cost]) => ({ name, cost })),
            costForecast: Array.from({length: 30}, (_, i) => ({ day: i+1, cost: (mockServices.reduce((acc, s) => acc + s.costPerHour, 0) * 24 * (i+1)) * (1 + (Math.random() - 0.5) * 0.1) }))
        };
    },
    getDeployments: async() => {
        await new Promise(res => setTimeout(res, 650));
        return mockDeployments;
    },
    getUsers: async() => {
        await new Promise(res => setTimeout(res, 450));
        return mockUsers;
    }
};

// Initialize mock data globally so it persists across re-renders
const mockServices = generateMockServices(50);
const mockAlerts = generateMockAlerts(mockServices);
const mockInvoices = generateMockInvoices();
const mockDeployments = generateMockDeployments();
const mockUsers = generateMockUsers();

// --- CUSTOM HOOKS ---

export const useApiData = <T,>(fetcher: () => Promise<T>, deps: any[] = []) => {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await fetcher();
            setData(result);
        } catch (e: any) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    }, deps); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, isLoading, error, refetch: fetchData };
};

export const useModal = <T,>() => {
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState<T | null>(null);
    const open = useCallback((modalData: T) => {
        setData(modalData);
        setIsOpen(true);
    }, []);
    const close = useCallback(() => {
        setData(null);
        setIsOpen(false);
    }, []);
    return { isOpen, data, open, close };
};


// --- UTILITY FUNCTIONS & HELPERS ---

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export const formatDate = (date: Date) => {
    return date.toLocaleString();
};

export const timeSince = (date: Date): string => {
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
}

export const getStatusColor = (status: ServiceStatus | DeploymentStatus) => {
    switch (status) {
        case 'Running':
        case 'Available':
        case 'Success':
            return 'text-green-400';
        case 'Stopped':
            return 'text-gray-400';
        case 'Pending':
        case 'Updating':
        case 'In Progress':
            return 'text-yellow-400';
        case 'Error':
        case 'Failed':
        case 'Rolled Back':
            return 'text-red-400';
        default:
            return 'text-white';
    }
};

export const getAlertSeverityColor = (severity: AlertSeverity) => {
    switch(severity) {
        case 'Critical': return 'bg-red-700';
        case 'High': return 'bg-red-500';
        case 'Medium': return 'bg-yellow-500';
        case 'Low': return 'bg-blue-500';
        case 'Info': return 'bg-gray-500';
    }
}

export const getLogLevelColor = (level: LogLevel) => {
    switch(level) {
        case 'FATAL':
        case 'ERROR': return 'text-red-400';
        case 'WARN': return 'text-yellow-400';
        case 'INFO': return 'text-blue-300';
        case 'DEBUG': return 'text-gray-500';
    }
}

const PIE_CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#de3163'];

// --- UI SUB-COMPONENTS ---

export const LoadingSpinner: FC = () => (
    <div className="flex justify-center items-center h-full w-full">
        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

export const ErrorDisplay: FC<{ error: Error | null }> = ({ error }) => (
    <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">
        <p className="font-bold">An error occurred:</p>
        <p className="font-mono text-sm">{error?.message || 'Unknown error'}</p>
    </div>
);

export const RegionSelector: FC<{ selectedRegion: CloudRegion | 'all', onRegionChange: (region: CloudRegion | 'all') => void }> = ({ selectedRegion, onRegionChange }) => {
    return (
        <div className="mb-4">
            <label htmlFor="region-select" className="block text-sm font-medium text-gray-400 mb-1">Region</label>
            <select
                id="region-select"
                value={selectedRegion}
                onChange={(e) => onRegionChange(e.target.value as CloudRegion | 'all')}
                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
            >
                <option value="all">All Regions</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
        </div>
    );
};

export const DashboardHeader: FC<{ region: CloudRegion | 'all' }> = ({ region }) => {
    const { data, isLoading, error } = useApiData(() => mockApi.getDashboardMetrics(region), [region]);

    if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><Card><LoadingSpinner/></Card><Card><LoadingSpinner/></Card><Card><LoadingSpinner/></Card><Card><LoadingSpinner/></Card></div>;
    if (error || !data) return <ErrorDisplay error={error}/>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
                <p className="text-3xl font-bold text-white">{data.activeServices} / {data.totalServices}</p>
                <p className="text-sm text-gray-400 mt-1">Active Services</p>
            </Card>
            <Card className="text-center">
                <p className="text-3xl font-bold text-white">{data.uptime}%</p>
                <p className="text-sm text-gray-400 mt-1">Uptime (30d)</p>
            </Card>
            <Card className="text-center">
                <p className="text-3xl font-bold text-white">{formatCurrency(data.monthlyCost / 1000)}k</p>
                <p className="text-sm text-gray-400 mt-1">Month-to-Date Cost</p>
            </Card>
            <Card className="text-center">
                <p className="text-3xl font-bold text-white">{data.activeAlerts}</p>
                <p className="text-sm text-gray-400 mt-1">Active Alerts</p>
            </Card>
        </div>
    );
};

// --- In a real app, this data would come from a dedicated file or a live API call
const usageData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  cpu: 40 + Math.random() * 30,
  memory: 55 + Math.random() * 20,
}));

export const ResourceCharts: FC = () => {
    const { data: billingData, isLoading, error } = useApiData(mockApi.getBillingData);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Overall Resource Usage (%) - Last 30 Days">
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={usageData}>
                         <defs>
                            <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/><stop offset="95%" stopColor="#8884d8" stopOpacity={0}/></linearGradient>
                            <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/><stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/></linearGradient>
                        </defs>
                        <XAxis dataKey="day" stroke="#9ca3af" tick={{fontSize: 12}} />
                        <YAxis stroke="#9ca3af" domain={[0, 100]} unit="%" tick={{fontSize: 12}} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                        <Legend />
                        <Area type="monotone" dataKey="cpu" stroke="#8884d8" fill="url(#colorCpu)" name="CPU" />
                        <Area type="monotone" dataKey="memory" stroke="#82ca9d" fill="url(#colorMemory)" name="Memory" />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>
            <Card title="Cost Analysis by Service Type">
                 <ResponsiveContainer width="100%" height={300}>
                    {isLoading && <LoadingSpinner />}
                    {error && <ErrorDisplay error={error} />}
                    {billingData && (
                        <BarChart data={billingData.costByCategory} layout="vertical">
                            <XAxis type="number" stroke="#9ca3af" unit="$" tick={{fontSize: 12}} tickFormatter={(val) => `${val/1000}k`}/>
                            <YAxis type="category" dataKey="name" stroke="#9ca3af" width={80} tick={{fontSize: 12}} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} formatter={(value: number) => formatCurrency(value)} />
                            <Bar dataKey="cost" fill="#06b6d4" />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </Card>
        </div>
    );
};

export const ServicesTable: FC<{ region: CloudRegion | 'all', onServiceSelect: (service: CloudService) => void }> = ({ region, onServiceSelect }) => {
    const { data: services, isLoading, error, refetch } = useApiData(() => mockApi.getServices(region), [region]);
    const [filter, setFilter] = useState('');

    const filteredServices = useMemo(() => {
        if (!services) return [];
        return services.filter(s => s.name.toLowerCase().includes(filter.toLowerCase()) || s.type.toLowerCase().includes(filter.toLowerCase()));
    }, [services, filter]);

    const handleAction = async (serviceId: string, action: 'start' | 'stop' | 'restart') => {
        await mockApi.performServiceAction(serviceId, action);
        refetch(); // Refresh data after action
    };

    return (
        <Card title="Active Services">
            <input
                type="text"
                placeholder="Filter by name or type..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full p-2 mb-4 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500"
            />
             <div className="overflow-x-auto">
                {isLoading && <LoadingSpinner />}
                {error && <ErrorDisplay error={error} />}
                {services && (
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">Service Name</th>
                                <th scope="col" className="px-6 py-3">Type</th>
                                <th scope="col" className="px-6 py-3">Region</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Cost/hr</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredServices.map(service => (
                                <tr key={service.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-mono text-white">{service.name}</td>
                                    <td className="px-6 py-4">{service.type}</td>
                                    <td className="px-6 py-4">{service.region}</td>
                                    <td className="px-6 py-4"><span className={`${getStatusColor(service.status)} font-semibold`}>{service.status}</span></td>
                                    <td className="px-6 py-4">{formatCurrency(service.costPerHour)}</td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button onClick={() => onServiceSelect(service)} className="text-cyan-400 hover:text-cyan-300">Details</button>
                                        <button onClick={() => handleAction(service.id, 'restart')} className="text-yellow-400 hover:text-yellow-300">Restart</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </Card>
    );
};

export const ServiceDetailModal: FC<{ service: CloudService | null, isOpen: boolean, onClose: () => void }> = ({ service, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'logs' | 'config'>('overview');
    const [timeRange, setTimeRange] = useState(1); // 1 hour
    const { data: metrics, isLoading: metricsLoading } = useApiData(
        () => service ? mockApi.getServiceMetrics(service.id, timeRange) : Promise.resolve(null),
        [service, timeRange, activeTab === 'metrics']
    );
    const { data: logs, isLoading: logsLoading } = useApiData(
        () => service ? mockApi.getServiceLogs(service.id) : Promise.resolve(null),
        [service, activeTab === 'logs']
    );

    useEffect(() => {
        if (isOpen) {
            setActiveTab('overview');
        }
    }, [isOpen]);

    if (!isOpen || !service) return null;

    const renderOverview = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong className="text-gray-400">ID:</strong> <span className="font-mono">{service.id}</span></div>
            <div><strong className="text-gray-400">Status:</strong> <span className={getStatusColor(service.status)}>{service.status}</span></div>
            <div><strong className="text-gray-400">Region:</strong> {service.region}</div>
            <div><strong className="text-gray-400">Instance Type:</strong> {service.instanceType}</div>
            <div><strong className="text-gray-400">Created:</strong> {formatDate(service.createdAt)}</div>
            <div><strong className="text-gray-400">Total Uptime:</strong> {service.uptime} hours</div>
            <div><strong className="text-gray-400">Public IP:</strong> {service.publicIp || 'N/A'}</div>
            <div><strong className="text-gray-400">Private IP:</strong> {service.privateIp}</div>
            <div><strong className="text-gray-400">Tags:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(service.tags).map(([key, value]) => (
                        <span key={key} className="bg-gray-700 text-xs px-2 py-1 rounded-full">{key}: {value}</span>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderMetrics = () => (
        <div>
             <div className="flex justify-end mb-4">
                {[1, 6, 24, 7*24].map(hours => (
                    <button key={hours} onClick={() => setTimeRange(hours)} className={`px-3 py-1 text-xs rounded-md ${timeRange === hours ? 'bg-cyan-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                        {hours < 24 ? `${hours}H` : `${hours/24}D`}
                    </button>
                ))}
             </div>
            {metricsLoading ? <LoadingSpinner /> : (
                <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-white">CPU & Memory Usage</h4>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={metrics}>
                            <XAxis dataKey="timestamp" tickFormatter={(ts) => new Date(ts).toLocaleTimeString()} stroke="#9ca3af" tick={{fontSize: 10}} />
                            <YAxis yAxisId="left" stroke="#8884d8" unit="%" domain={[0,100]} tick={{fontSize: 10}}/>
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" unit="%" domain={[0,100]} tick={{fontSize: 10}}/>
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                            <Area yAxisId="left" type="monotone" dataKey="cpu_percent" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} name="CPU" />
                            <Area yAxisId="right" type="monotone" dataKey="memory_percent" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} name="Memory" />
                        </AreaChart>
                    </ResponsiveContainer>
                    <h4 className="text-lg font-semibold text-white">Network I/O</h4>
                     <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={metrics}>
                            <XAxis dataKey="timestamp" tickFormatter={(ts) => new Date(ts).toLocaleTimeString()} stroke="#9ca3af" tick={{fontSize: 10}} />
                            <YAxis stroke="#9ca3af" unit="kb/s" tick={{fontSize: 10}} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                            <Legend />
                            <Line type="monotone" dataKey="network_in" stroke="#0ea5e9" name="Inbound" dot={false} />
                            <Line type="monotone" dataKey="network_out" stroke="#f97316" name="Outbound" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
    
    const renderLogs = () => (
        <div>
            {logsLoading ? <LoadingSpinner /> : (
                <div className="bg-gray-900 font-mono text-xs rounded-md p-4 h-96 overflow-y-auto">
                    {logs?.map(log => (
                        <div key={log.id} className="flex">
                           <span className="text-gray-500 mr-4">{log.timestamp.toISOString()}</span>
                           <span className={`${getLogLevelColor(log.level)} font-bold w-12`}>{log.level}</span>
                           <span>{log.message}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderConfig = () => (
        <div className="bg-gray-900 font-mono text-xs rounded-md p-4 h-96 overflow-y-auto">
            <pre className="text-green-300">
                {JSON.stringify({
                    serviceId: service.id,
                    instanceType: service.instanceType,
                    region: service.region,
                    network: {
                        vpcId: 'vpc-0a1b2c3d4e5f6',
                        subnetId: 'subnet-1a2b3c4d5e6f7',
                        securityGroups: ['sg-9f8e7d6c5b4a3', 'sg-f1e2d3c4b5a69'],
                    },
                    storage: {
                        rootVolumeSize: '50GB',
                        rootVolumeType: 'gp3',
                        iops: 3000,
                    },
                    tags: service.tags,
                }, null, 2)}
            </pre>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col text-white">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-xl font-bold">{service.name} Details</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="p-4 border-b border-gray-700">
                    <nav className="flex space-x-4">
                        <button onClick={() => setActiveTab('overview')} className={`px-3 py-2 rounded-md ${activeTab === 'overview' ? 'bg-cyan-600' : 'hover:bg-gray-700'}`}>Overview</button>
                        <button onClick={() => setActiveTab('metrics')} className={`px-3 py-2 rounded-md ${activeTab === 'metrics' ? 'bg-cyan-600' : 'hover:bg-gray-700'}`}>Metrics</button>
                        <button onClick={() => setActiveTab('logs')} className={`px-3 py-2 rounded-md ${activeTab === 'logs' ? 'bg-cyan-600' : 'hover:bg-gray-700'}`}>Logs</button>
                        <button onClick={() => setActiveTab('config')} className={`px-3 py-2 rounded-md ${activeTab === 'config' ? 'bg-cyan-600' : 'hover:bg-gray-700'}`}>Configuration</button>
                    </nav>
                </div>
                <div className="p-6 overflow-y-auto">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'metrics' && renderMetrics()}
                    {activeTab === 'logs' && renderLogs()}
                    {activeTab === 'config' && renderConfig()}
                </div>
            </div>
        </div>
    );
};

export const AlertsPanel: FC<{ region: CloudRegion | 'all' }> = ({ region }) => {
    const { data: alerts, isLoading, error, refetch } = useApiData(() => mockApi.getAlerts(region), [region]);

    const handleAlertAction = async (alertId: string, action: 'acknowledged' | 'resolved') => {
        await mockApi.updateAlertStatus(alertId, action);
        refetch();
    };

    const sortedAlerts = useMemo(() => {
        if (!alerts) return [];
        const severityOrder: Record<AlertSeverity, number> = { Critical: 0, High: 1, Medium: 2, Low: 3, Info: 4 };
        return [...alerts].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    }, [alerts]);

    return (
        <Card title="Active Alerts">
            <div className="max-h-96 overflow-y-auto">
                {isLoading && <LoadingSpinner />}
                {error && <ErrorDisplay error={error} />}
                {alerts && sortedAlerts.filter(a => !a.resolved).map(alert => (
                    <div key={alert.id} className="p-3 mb-2 rounded-md bg-gray-900/50 border-l-4" style={{borderColor: getAlertSeverityColor(alert.severity).replace('bg-','').replace('-500','').replace('-700','')}}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-white"><span className={`px-2 py-1 text-xs rounded-full mr-2 ${getAlertSeverityColor(alert.severity)}`}>{alert.severity}</span>{alert.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{alert.serviceName} &middot; {timeSince(alert.timestamp)}</p>
                            </div>
                            <div className="flex space-x-2 text-sm">
                                {!alert.acknowledged && <button onClick={() => handleAlertAction(alert.id, 'acknowledged')} className="text-blue-400">Ack</button>}
                                <button onClick={() => handleAlertAction(alert.id, 'resolved')} className="text-green-400">Resolve</button>
                            </div>
                        </div>
                    </div>
                ))}
                {alerts && sortedAlerts.filter(a => !a.resolved).length === 0 && <p className="text-gray-400 text-center py-4">No active alerts.</p>}
            </div>
        </Card>
    );
};

export const BillingAndCostManagement: FC = () => {
    const { data, isLoading, error } = useApiData(mockApi.getBillingData);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
                <Card title="Cost Forecast (Next 30 Days)">
                    {isLoading && <LoadingSpinner />}
                    {error && <ErrorDisplay error={error} />}
                    {data && (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data.costForecast}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                <XAxis dataKey="day" stroke="#9ca3af" label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }}/>
                                <YAxis stroke="#9ca3af" tickFormatter={(v) => formatCurrency(v)} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                <Line type="monotone" dataKey="cost" stroke="#8884d8" dot={false} name="Forecasted Cost"/>
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </Card>
            </div>
            <div className="lg:col-span-2">
                 <Card title="Invoice History">
                    <div className="max-h-80 overflow-y-auto">
                        {isLoading && <LoadingSpinner />}
                        {error && <ErrorDisplay error={error} />}
                        {data && (
                            <ul className="space-y-2">
                                {data.invoices.map(inv => (
                                    <li key={inv.id} className="flex justify-between items-center p-2 bg-gray-800/50 rounded-md">
                                        <div>
                                            <p className="text-white font-medium">{inv.month}</p>
                                            <p className="text-sm text-gray-400">{formatCurrency(inv.amount)}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs px-2 py-1 rounded-full ${inv.status === 'Paid' ? 'bg-green-800 text-green-300' : 'bg-yellow-800 text-yellow-300'}`}>{inv.status}</span>
                                            <a href={inv.pdfUrl} className="text-cyan-400 hover:underline text-sm ml-4">Download</a>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                 </Card>
            </div>
        </div>
    )
};

export const CloudViewTabs: FC<{ activeTab: string, setActiveTab: (tab: string) => void}> = ({activeTab, setActiveTab}) => {
    const tabs = ['Dashboard', 'Services', 'Alerts', 'Billing', 'Deployments', 'IAM'];
    return (
        <div className="border-b border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`${
                            activeTab === tab
                                ? 'border-cyan-500 text-cyan-400'
                                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        {tab}
                    </button>
                ))}
            </nav>
        </div>
    );
};

export const DeploymentView: FC = () => {
    const { data: deployments, isLoading, error } = useApiData(mockApi.getDeployments);
    return (
        <Card title="IaC Deployment History">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                {isLoading && <LoadingSpinner />}
                {error && <ErrorDisplay error={error} />}
                {deployments && (
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3">Timestamp</th>
                                <th scope="col" className="px-6 py-3">Template</th>
                                <th scope="col" className="px-6 py-3">Version</th>
                                <th scope="col" className="px-6 py-3">Deployed By</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800">
                            {deployments.map(d => (
                                <tr key={d.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="px-6 py-4">{formatDate(d.timestamp)}</td>
                                    <td className="px-6 py-4 font-mono text-white">{d.templateName}</td>
                                    <td className="px-6 py-4">{d.version}</td>
                                    <td className="px-6 py-4">{d.deployedBy}</td>
                                    <td className="px-6 py-4"><span className={`${getStatusColor(d.status)} font-semibold`}>{d.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </Card>
    );
};

export const IAMView: FC = () => {
    const { data: users, isLoading, error } = useApiData(mockApi.getUsers);
    return (
        <Card title="Identity & Access Management (IAM)">
            <div className="overflow-x-auto">
                {isLoading && <LoadingSpinner />}
                {error && <ErrorDisplay error={error} />}
                {users && (
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Email</th>
                                <th scope="col" className="px-6 py-3">Role</th>
                                <th scope="col" className="px-6 py-3">MFA</th>
                                <th scope="col" className="px-6 py-3">Last Login</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 text-white">{u.name}</td>
                                    <td className="px-6 py-4">{u.email}</td>
                                    <td className="px-6 py-4">{u.role}</td>
                                    <td className="px-6 py-4">{u.mfaEnabled ? <span className="text-green-400">Enabled</span> : <span className="text-yellow-400">Disabled</span>}</td>
                                    <td className="px-6 py-4">{timeSince(u.lastLogin)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </Card>
    );
};


// --- MAIN VIEW COMPONENT ---

const DemoBankCloudView: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [selectedRegion, setSelectedRegion] = useState<CloudRegion | 'all'>('all');
    const serviceModal = useModal<CloudService>();

    const renderTabContent = () => {
        switch(activeTab) {
            case 'Dashboard':
                return (
                    <div className="space-y-6">
                        <DashboardHeader region={selectedRegion} />
                        <ResourceCharts />
                        <AlertsPanel region={selectedRegion} />
                    </div>
                );
            case 'Services':
                return <ServicesTable region={selectedRegion} onServiceSelect={serviceModal.open} />;
            case 'Alerts':
                return <AlertsPanel region={selectedRegion} />;
            case 'Billing':
                return <BillingAndCostManagement />;
            case 'Deployments':
                return <DeploymentView />;
            case 'IAM':
                return <IAMView />;
            default:
                return null;
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Cloud Platform</h2>
                <div className="w-64">
                    <RegionSelector selectedRegion={selectedRegion} onRegionChange={setSelectedRegion} />
                </div>
            </div>

            <CloudViewTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {renderTabContent()}

            <ServiceDetailModal isOpen={serviceModal.isOpen} service={serviceModal.data} onClose={serviceModal.close} />
        </div>
    );
};

export default DemoBankCloudView;