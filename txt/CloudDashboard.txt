// google/cloud/components/CloudDashboard.tsx
// The Panopticon. A high-level observatory for the sovereign to survey their entire digital infrastructure.
// It is a place of pure information, reflecting the health and status of the kingdom's machinery.

import React, { createContext, useContext, useState, useEffect, useCallback, useReducer } from 'react';
import VMList from './VMList';

// --- Global State Management & Contexts (The Universe's Central Nervous System) ---

// Define types for global state
export interface AuthState {
    isAuthenticated: boolean;
    user: { id: string; name: string; roles: string[]; organization: string; tenantId: string; } | null;
    permissions: Record<string, boolean>;
}

export interface ThemeState {
    mode: 'dark' | 'light' | 'holographic' | 'quantum';
    accentColor: string;
}

export interface Notification {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success' | 'alert' | 'critical';
    message: string;
    timestamp: Date;
    read: boolean;
    actionLink?: string;
    severity: number; // 1-10
}

export interface GlobalAppState {
    auth: AuthState;
    theme: ThemeState;
    notifications: Notification[];
    activeProject: string;
    globalSearchTerm: string;
    preferredLanguage: string;
    accessibilitySettings: { highContrast: boolean; fontSize: 'small' | 'medium' | 'large'; voiceControl: boolean; };
    lastActivity: Date;
    systemStatus: 'operational' | 'degraded' | 'critical' | 'maintenance';
}

// Initial state
const initialGlobalAppState: GlobalAppState = {
    auth: {
        isAuthenticated: true,
        user: { id: 'user-alpha-001', name: 'Sovereign Administrator', roles: ['admin', 'owner', 'auditor'], organization: 'Galactic Empire Inc.', tenantId: 'main-realm-001' },
        permissions: { 'compute.manage': true, 'storage.manage': true, 'network.manage': true, 'ai.manage': true, 'quantum.manage': true, 'astrofleet.manage': true, 'security.full': true, 'billing.view': true, 'billing.manage': false },
    },
    theme: { mode: 'dark', accentColor: '#4CAF50' },
    notifications: [],
    activeProject: 'project-panopticon-alpha',
    globalSearchTerm: '',
    preferredLanguage: 'en-US',
    accessibilitySettings: { highContrast: false, fontSize: 'medium', voiceControl: false },
    lastActivity: new Date(),
    systemStatus: 'operational',
};

// Reducer for global state management
type Action =
    | { type: 'LOGIN'; payload: AuthState['user'] }
    | { type: 'LOGOUT' }
    | { type: 'SET_THEME'; payload: ThemeState }
    | { type: 'ADD_NOTIFICATION'; payload: Notification }
    | { type: 'MARK_NOTIFICATION_READ'; payload: string }
    | { type: 'SET_ACTIVE_PROJECT'; payload: string }
    | { type: 'SET_GLOBAL_SEARCH_TERM'; payload: string }
    | { type: 'UPDATE_ACCESSIBILITY_SETTINGS'; payload: Partial<GlobalAppState['accessibilitySettings']> }
    | { type: 'SET_SYSTEM_STATUS'; payload: GlobalAppState['systemStatus'] }
    | { type: 'SET_PERMISSIONS'; payload: AuthState['permissions'] };


const globalAppReducer = (state: GlobalAppState, action: Action): GlobalAppState => {
    switch (action.type) {
        case 'LOGIN':
            return { ...state, auth: { ...state.auth, isAuthenticated: true, user: action.payload } };
        case 'LOGOUT':
            return { ...state, auth: { ...state.auth, isAuthenticated: false, user: null } };
        case 'SET_THEME':
            return { ...state, theme: action.payload };
        case 'ADD_NOTIFICATION':
            return { ...state, notifications: [...state.notifications, { ...action.payload, id: Date.now().toString() }] };
        case 'MARK_NOTIFICATION_READ':
            return {
                ...state,
                notifications: state.notifications.map(n =>
                    n.id === action.payload ? { ...n, read: true } : n
                ),
            };
        case 'SET_ACTIVE_PROJECT':
            return { ...state, activeProject: action.payload };
        case 'SET_GLOBAL_SEARCH_TERM':
            return { ...state, globalSearchTerm: action.payload };
        case 'UPDATE_ACCESSIBILITY_SETTINGS':
            return { ...state, accessibilitySettings: { ...state.accessibilitySettings, ...action.payload } };
        case 'SET_SYSTEM_STATUS':
            return { ...state, systemStatus: action.payload };
        case 'SET_PERMISSIONS':
            return { ...state, auth: { ...state.auth, permissions: action.payload } };
        default:
            return state;
    }
};

export const GlobalAppContext = createContext<{
    state: GlobalAppState;
    dispatch: React.Dispatch<Action>;
}>({
    state: initialGlobalAppState,
    dispatch: () => undefined,
});

export const useGlobalAppState = () => useContext(GlobalAppContext);

export const GlobalAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(globalAppReducer, initialGlobalAppState);

    // Simulate real-time updates and notifications
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() < 0.3) { // 30% chance for a random notification
                const types: Notification['type'][] = ['info', 'warning', 'error', 'success', 'critical', 'alert'];
                const messages = [
                    'New anomaly detected in network traffic.',
                    'Compute instance scaling event initiated.',
                    'Storage bucket `galaxy-data-archive` reached 90% capacity.',
                    'Critical security patch applied to core services.',
                    'Inter-dimensional link stabilizing.',
                    'Quantum entanglement flux detected on sector 7.',
                    'New resource deployment completed.',
                    'Potential unauthorized access attempt from unknown nebula.',
                ];
                dispatch({
                    type: 'ADD_NOTIFICATION',
                    payload: {
                        id: Date.now().toString(),
                        type: types[Math.floor(Math.random() * types.length)],
                        message: messages[Math.floor(Math.random() * messages.length)],
                        timestamp: new Date(),
                        read: false,
                        severity: Math.floor(Math.random() * 10) + 1,
                    },
                });
            }
        }, 15000); // Every 15 seconds

        return () => clearInterval(interval);
    }, []);

    // Simulate system status changes
    useEffect(() => {
        const statusInterval = setInterval(() => {
            const statuses: GlobalAppState['systemStatus'][] = ['operational', 'degraded', 'critical', 'maintenance'];
            const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
            if (newStatus !== state.systemStatus && Math.random() < 0.1) { // Low chance of status change
                dispatch({ type: 'SET_SYSTEM_STATUS', payload: newStatus });
            }
        }, 60000); // Every minute
        return () => clearInterval(statusInterval);
    }, [state.systemStatus]);

    return (
        <GlobalAppContext.Provider value={{ state, dispatch }}>
            {children}
        </GlobalAppContext.Provider>
    );
};

// --- Universal UI Components (The Panopticon's Interface Elements) ---

export interface MetricCardProps {
    title: string;
    value: string | number;
    unit?: string;
    trend?: 'up' | 'down' | 'stable';
    description?: string;
    onClick?: () => void;
    color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit, trend, description, onClick, color = 'bg-gray-700' }) => {
    const getTrendIcon = () => {
        if (trend === 'up') return <span className="text-green-400">▲</span>;
        if (trend === 'down') return <span className="text-red-400">▼</span>;
        return <span className="text-gray-400">▬</span>;
    };

    return (
        <div onClick={onClick} className={`${color} p-5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between h-40`}>
            <h3 className="text-sm text-gray-300 font-medium">{title}</h3>
            <div className="flex items-end justify-between mt-2">
                <span className="text-4xl font-extrabold text-white leading-none">
                    {value}
                    {unit && <span className="text-base text-gray-400 ml-1">{unit}</span>}
                </span>
                {trend && <div className="text-lg ml-2">{getTrendIcon()}</div>}
            </div>
            {description && <p className="text-xs text-gray-400 mt-2 truncate">{description}</p>}
        </div>
    );
};

export interface SectionHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    icon?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description, actions, icon }) => (
    <div className="flex justify-between items-center pb-4 border-b border-gray-700 mb-6">
        <div className="flex items-center">
            {icon && <span className="text-2xl text-blue-400 mr-3">{icon}</span>}
            <div>
                <h2 className="text-3xl font-extrabold text-white">{title}</h2>
                {description && <p className="text-md text-gray-400 mt-1">{description}</p>}
            </div>
        </div>
        {actions && <div className="flex space-x-3">{actions}</div>}
    </div>
);

export const GlobalCommandPalette: React.FC = () => {
    const { state, dispatch } = useGlobalAppState();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');

    const commands = [
        { name: 'Go to Compute Instances', action: () => console.log('Navigating to Compute') },
        { name: 'View Storage Buckets', action: () => console.log('Navigating to Storage') },
        { name: 'Open IAM Policies', action: () => console.log('Navigating to IAM') },
        { name: 'Search Logs', action: () => console.log('Navigating to Logs Search') },
        { name: 'Deploy New Serverless Function', action: () => console.log('Opening serverless deployment wizard') },
        { name: 'Check System Health', action: () => console.log('Displaying system health dashboard') },
        { name: 'Initiate Quantum Reconfiguration', action: () => console.log('Quantum reconfig engaged.') },
        { name: 'Adjust Theme: Light Mode', action: () => dispatch({ type: 'SET_THEME', payload: { ...state.theme, mode: 'light' } }) },
        { name: 'Adjust Theme: Dark Mode', action: () => dispatch({ type: 'SET_THEME', payload: { ...state.theme, mode: 'dark' } }) },
        { name: 'Adjust Theme: Holographic', action: () => dispatch({ type: 'SET_THEME', payload: { ...state.theme, mode: 'holographic' } }) },
        { name: 'Report Anomaly', action: () => console.log('Opening anomaly report form') },
        { name: 'Access Predictive Analytics', action: () => console.log('Loading predictive analytics module') },
        { name: 'View AstroFleet Status', action: () => console.log('Displaying AstroFleet overview') },
    ];

    const filteredCommands = query
        ? commands.filter(cmd => cmd.name.toLowerCase().includes(query.toLowerCase()))
        : commands;

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
            event.preventDefault();
            setIsOpen(prev => !prev);
            setQuery('');
        } else if (event.key === 'Escape') {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center p-8 z-50 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl mt-20">
                <input
                    type="text"
                    className="w-full p-4 bg-gray-700 text-white border-b border-gray-600 rounded-t-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search or run command (Ctrl/Cmd+K)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                />
                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {filteredCommands.length > 0 ? (
                        filteredCommands.map((cmd, index) => (
                            <div
                                key={index}
                                className="p-3 text-white hover:bg-blue-600 cursor-pointer border-b border-gray-700 last:border-b-0"
                                onClick={() => {
                                    cmd.action();
                                    setIsOpen(false);
                                    setQuery('');
                                }}
                            >
                                {cmd.name}
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-gray-400 text-center">No commands found.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const NotificationCenter: React.FC = () => {
    const { state, dispatch } = useGlobalAppState();
    const [isOpen, setIsOpen] = useState(false);

    const unreadNotifications = state.notifications.filter(n => !n.read);

    const getSeverityColor = (severity: number) => {
        if (severity >= 8) return 'text-red-500';
        if (severity >= 5) return 'text-orange-400';
        return 'text-blue-400';
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 relative rounded-full hover:bg-gray-700 transition-colors duration-200"
            >
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                {unreadNotifications.length > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                        {unreadNotifications.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-gray-800 rounded-xl shadow-2xl p-4 z-40 max-h-96 overflow-y-auto custom-scrollbar">
                    <h3 className="text-lg font-semibold text-white mb-3">Notifications</h3>
                    {state.notifications.length === 0 ? (
                        <p className="text-gray-400">No new notifications.</p>
                    ) : (
                        state.notifications.map(n => (
                            <div key={n.id} className={`p-3 mb-2 rounded-lg ${n.read ? 'bg-gray-700' : 'bg-gray-700 border-l-4 border-blue-500'} hover:bg-gray-600 transition-colors duration-200`}>
                                <div className="flex justify-between items-center">
                                    <span className={`text-sm font-semibold ${getSeverityColor(n.severity)}`}>
                                        {n.type.toUpperCase()} - {n.severity}/10
                                    </span>
                                    {!n.read && (
                                        <button
                                            onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id })}
                                            className="text-xs text-blue-400 hover:text-blue-300"
                                        >
                                            Mark as Read
                                        </button>
                                    )}
                                </div>
                                <p className="text-gray-200 text-sm mt-1">{n.message}</p>
                                <p className="text-gray-500 text-xs mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

// --- Infrastructure Manager (The Digital Kingdom's Foundation) ---

export interface ResourceInfo {
    id: string;
    name: string;
    status: 'Running' | 'Stopped' | 'Pending' | 'Error' | 'Scaling';
    region: string;
    type: string; // e.g., 'VM', 'Container', 'Serverless', 'Quantum Core'
    costPerHour: number;
    metrics: Record<string, any>;
    tags: string[];
}

export const ComputeManager: React.FC = () => {
    const [computeResources, setComputeResources] = useState<ResourceInfo[]>([
        { id: 'vm-prod-01', name: 'Web Server Prod', status: 'Running', region: 'us-central1', type: 'VM', costPerHour: 0.15, metrics: { cpu: '70%', ram: '60%' }, tags: ['prod', 'web'] },
        { id: 'k8s-cluster-01', name: 'API Cluster', status: 'Running', region: 'eu-west3', type: 'Kubernetes', costPerHour: 1.20, metrics: { nodes: 5, cpu: '45%' }, tags: ['api', 'container'] },
        { id: 'serverless-func-payments', name: 'Payment Processor', status: 'Running', region: 'us-east1', type: 'Serverless Function', costPerHour: 0.001, metrics: { invocations: '1.2M', errors: '0.01%' }, tags: ['serverless', 'billing'] },
        { id: 'quantum-core-zeta', name: 'Quantum AI Core', status: 'Scaling', region: 'quantum-realm-007', type: 'Quantum Compute', costPerHour: 15.00, metrics: { qbits: '128', entanglementStability: '98%' }, tags: ['experimental', 'ai', 'quantum'] },
        { id: 'edge-node-alpha', name: 'Mars Colony Edge', status: 'Running', region: 'mars-colony-alpha', type: 'Edge Device', costPerHour: 0.05, metrics: { connectivity: 'excellent', dataLatency: '200ms' }, tags: ['iot', 'edge', 'space'] },
    ]);

    return (
        <section className="space-y-6">
            <SectionHeader title="Compute Systems Manager" icon={<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zm2 3v8h12V8H6zm6 2a2 2 0 100 4 2 2 0 000-4z"></path></svg>}
                description="Comprehensive oversight of all compute resources, from terrestrial VMs to quantum cores and inter-planetary edge nodes."
                actions={<button className="btn-primary">Provision New Compute</button>} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {computeResources.map(res => (
                    <div key={res.id} className="bg-gray-800 p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-xl font-semibold text-blue-400">{res.name}</h4>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${res.status === 'Running' ? 'bg-green-600 text-white' : res.status === 'Error' ? 'bg-red-600 text-white' : 'bg-yellow-600 text-white'}`}>
                                {res.status}
                            </span>
                        </div>
                        <p className="text-gray-300 text-sm">Type: <span className="text-white">{res.type}</span></p>
                        <p className="text-gray-300 text-sm">Region: <span className="text-white">{res.region}</span></p>
                        <p className="text-gray-300 text-sm">Cost: <span className="text-white">${res.costPerHour.toFixed(2)}/hr</span></p>
                        <div className="mt-3 space-x-2">
                            {res.tags.map(tag => <span key={tag} className="inline-block bg-gray-600 text-gray-200 text-xs px-2 py-1 rounded-full">{tag}</span>)}
                        </div>
                        <div className="mt-4 flex justify-between text-sm text-gray-400">
                            {Object.entries(res.metrics).map(([key, value]) => (
                                <span key={key} className="flex items-center">
                                    <span className="capitalize mr-1">{key}:</span> <span className="font-medium text-white">{value}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <VMList /> {/* Existing component */}
        </section>
    );
};

export const StorageBrowser: React.FC = () => {
    const [storageItems, setStorageItems] = useState<ResourceInfo[]>([
        { id: 'bucket-galaxy-data', name: 'Galaxy Data Archive', status: 'Running', region: 'global', type: 'Object Storage', costPerHour: 0.005, metrics: { size: '150TB', objects: '1.2M' }, tags: ['archive', 'data-lake'] },
        { id: 'db-users-prod', name: 'User Database (Postgres)', status: 'Running', region: 'us-central1', type: 'Managed SQL', costPerHour: 0.80, metrics: { size: '2TB', connections: '500' }, tags: ['prod', 'database'] },
        { id: 'block-storage-ai', name: 'AI Model Drive', status: 'Running', region: 'eu-west1', type: 'Block Storage', costPerHour: 0.25, metrics: { size: '10TB', iops: '50K' }, tags: ['ai', 'high-perf'] },
        { id: 'filesystem-colony-logs', name: 'Mars Colony Logs FS', status: 'Running', region: 'mars-colony-alpha', type: 'Distributed File System', costPerHour: 0.08, metrics: { size: '5TB', writeRate: '100MB/s' }, tags: ['edge', 'logs'] },
        { id: 'data-warehouse-reporting', name: 'Analytics Data Warehouse', status: 'Running', region: 'global', type: 'Data Warehouse', costPerHour: 2.50, metrics: { datasets: 30, queryLatency: '500ms' }, tags: ['analytics', 'bi'] },
    ]);

    return (
        <section className="space-y-6">
            <SectionHeader title="Storage & Data Lakes" icon={<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 20a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v14zM8 11h8v2H8v-2zm0 4h8v2H8v-2zm0-8h8v2H8V7z"></path></svg>}
                description="Manage all your data assets, from raw archives to high-performance databases, across the entire digital and physical cosmos."
                actions={<button className="btn-primary">Create New Storage</button>} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {storageItems.map(item => (
                    <div key={item.id} className="bg-gray-800 p-5 rounded-xl shadow-md">
                        <h4 className="text-xl font-semibold text-blue-400 mb-2">{item.name}</h4>
                        <p className="text-gray-300 text-sm">Type: <span className="text-white">{item.type}</span></p>
                        <p className="text-gray-300 text-sm">Status: <span className={`font-semibold ${item.status === 'Running' ? 'text-green-400' : 'text-yellow-400'}`}>{item.status}</span></p>
                        <p className="text-gray-300 text-sm">Region: <span className="text-white">{item.region}</span></p>
                        <div className="mt-3 space-x-2">
                            {item.tags.map(tag => <span key={tag} className="inline-block bg-gray-600 text-gray-200 text-xs px-2 py-1 rounded-full">{tag}</span>)}
                        </div>
                        <div className="mt-4 flex justify-between text-sm text-gray-400">
                            {Object.entries(item.metrics).map(([key, value]) => (
                                <span key={key} className="flex items-center">
                                    <span className="capitalize mr-1">{key}:</span> <span className="font-medium text-white">{value}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export const NetworkTopology: React.FC = () => {
    const [networks, setNetworks] = useState<any[]>([
        { id: 'vpc-main-prod', name: 'Production VPC', status: 'Active', region: 'us-central1', type: 'Virtual Private Cloud', subnets: 12, firewalls: 8, loadBalancers: 3, traffic: '1.2 Tbps' },
        { id: 'vpn-global-hq', name: 'Global HQ VPN', status: 'Active', region: 'global', type: 'VPN Gateway', tunnels: 5, encryption: 'AES-256', latency: '50ms' },
        { id: 'cdn-static-assets', name: 'CDN for Galactic Assets', status: 'Active', region: 'global', type: 'Content Delivery Network', edgeLocations: 250, cacheHitRatio: '98%' },
        { id: 'quantum-entanglement-link-01', name: 'QE Link Alpha Centauri', status: 'Stable', region: 'inter-dimensional', type: 'Quantum Entanglement Link', pairedTo: 'alpha-centauri-node-01', dataThroughput: 'Instantaneous (quantum)' },
    ]);

    return (
        <section className="space-y-6">
            <SectionHeader title="Network Fabric & Interconnects" icon={<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7l10 5 10-5-10-5zm0 14.5l-8-4v-5l8-4 8 4v5l-8 4z"></path></svg>}
                description="Visualize and manage your entire network infrastructure, from global VPCs to quantum entanglement links spanning star systems."
                actions={<button className="btn-primary">Design New Network</button>} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {networks.map(net => (
                    <div key={net.id} className="bg-gray-800 p-5 rounded-xl shadow-md">
                        <h4 className="text-xl font-semibold text-blue-400 mb-2">{net.name}</h4>
                        <p className="text-gray-300 text-sm">Type: <span className="text-white">{net.type}</span></p>
                        <p className="text-gray-300 text-sm">Status: <span className={`font-semibold ${net.status === 'Active' || net.status === 'Stable' ? 'text-green-400' : 'text-yellow-400'}`}>{net.status}</span></p>
                        <p className="text-gray-300 text-sm">Region: <span className="text-white">{net.region}</span></p>
                        <ul className="mt-3 text-sm text-gray-400 space-y-1">
                            {Object.entries(net).filter(([key]) => !['id', 'name', 'status', 'region', 'type'].includes(key)).map(([key, value]) => (
                                <li key={key} className="flex justify-between">
                                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                    <span className="font-medium text-white">{value as any}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
};

export const SecurityOperationsCenter: React.FC = () => {
    const [securityAlerts, setSecurityAlerts] = useState<Notification[]>([
        { id: 'sec-alert-001', type: 'critical', message: 'Unauthorized access attempt from IP 203.0.113.42 on IAM policy.', timestamp: new Date(), read: false, severity: 10, actionLink: '#' },
        { id: 'sec-alert-002', type: 'warning', message: 'Database vulnerability scan detected outdated patch level.', timestamp: new Date(), read: false, severity: 7, actionLink: '#' },
        { id: 'sec-alert-003', type: 'alert', message: 'Anomalous quantum data transfer pattern detected.', timestamp: new Date(), read: true, severity: 8, actionLink: '#' },
        { id: 'sec-alert-004', type: 'info', message: 'New security baseline deployed successfully.', timestamp: new Date(), read: true, severity: 3, actionLink: '#' },
    ]);
    const { dispatch } = useGlobalAppState();

    const markAsResolved = (id: string) => {
        setSecurityAlerts(prev => prev.filter(alert => alert.id !== id));
        dispatch({ type: 'ADD_NOTIFICATION', payload: { id: `res-${id}`, type: 'success', message: `Security alert ${id} resolved.`, timestamp: new Date(), read: false, severity: 2 } });
    };

    return (
        <section className="space-y-6">
            <SectionHeader title="Security & Compliance" icon={<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.22l5.5 2.45-5.5 2.44-5.5-2.44L12 3.22zm-1 7.08v5.5H8v-5.5h3zm0-7v5.5H8v-5.5h3zm0-7v5.5H8v-5.5h3zm0-7v5.5H8v-5.5h3z"></path></svg>}
                description="The unblinking eye over your digital perimeter. Real-time threat detection, IAM policy enforcement, and compliance reporting across all dimensions."
                actions={<button className="btn-primary bg-red-600 hover:bg-red-700">Incident Response</button>} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-5 rounded-xl shadow-md">
                    <h3 className="text-xl font-semibold text-white mb-4">Active Security Alerts ({securityAlerts.filter(a => !a.read).length})</h3>
                    {securityAlerts.filter(a => !a.read).map(alert => (
                        <div key={alert.id} className={`p-4 mb-3 rounded-lg border-l-4 ${alert.type === 'critical' ? 'border-red-500 bg-red-900 bg-opacity-30' : 'border-orange-500 bg-orange-900 bg-opacity-30'}`}>
                            <h5 className="font-semibold text-lg text-white">{alert.type.toUpperCase()} - Severity {alert.severity}</h5>
                            <p className="text-gray-300 text-sm mt-1">{alert.message}</p>
                            <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
                                <span>{new Date(alert.timestamp).toLocaleString()}</span>
                                <div className="space-x-2">
                                    {alert.actionLink && <a href={alert.actionLink} className="text-blue-400 hover:underline">View Details</a>}
                                    <button onClick={() => markAsResolved(alert.id)} className="text-green-400 hover:underline">Resolve</button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {securityAlerts.filter(a => !a.read).length === 0 && <p className="text-gray-400">No unread security alerts.</p>}
                </div>
                <div className="bg-gray-800 p-5 rounded-xl shadow-md">
                    <h3 className="text-xl font-semibold text-white mb-4">IAM & Access Management</h3>
                    <p className="text-gray-300 mb-2">Total Roles: <span className="text-white font-semibold">150</span></p>
                    <p className="text-gray-300 mb-2">Service Accounts: <span className="text-white font-semibold">85</span></p>
                    <p className="text-gray-300 mb-2">Policy Violations Detected (Last 24h): <span className="text-red-400 font-semibold">3</span></p>
                    <button className="btn-secondary mt-4">Manage IAM Policies</button>
                    <button className="btn-secondary mt-4 ml-3">Review Audit Logs</button>
                </div>
            </div>
        </section>
    );
};

export const OperationsDashboard: React.FC = () => {
    const [systemMetrics, setSystemMetrics] = useState<any>({
        cpuUsage: '65%',
        memoryUsage: '45%',
        networkThroughput: '8.2 Gbps',
        diskIops: '120K',
        activeAlerts: 7,
        logVolume: '500GB/hr',
        costProjection: '$15,500 / month',
        uptime: '99.99%',
    });

    const [optimizationRecommendations, setOptimizationRecommendations] = useState<string[]>([
        'Right-size 5 underutilized VMs to save 15% on compute.',
        'Implement cold storage tier for `galaxy-data-archive` to reduce costs by 20%.',
        'Review network firewall rules for potential traffic bottlenecks.',
        'Optimize quantum algorithm for better qbit stability.',
        'Automate resource scaling for seasonal load spikes.',
    ]);

    return (
        <section className="space-y-6">
            <SectionHeader title="Operations & AI-Ops Center" icon={<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"></path></svg>}
                description="The nerve center for system health, performance, and cost management. Leveraging AI for proactive insights and autonomous operations."
                actions={<button className="btn-primary">View Full Monitoring</button>} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(systemMetrics).map(([key, value]) => (
                    <MetricCard key={key} title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} value={value as string | number} description={`Current ${key} status.`} />
                ))}
            </div>
            <div className="bg-gray-800 p-5 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-white mb-4">AI-Driven Optimization & Recommendations</h3>
                <ul className="space-y-3">
                    {optimizationRecommendations.map((rec, index) => (
                        <li key={index} className="flex items-start text-gray-300">
                            <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                            <span>{rec}</span>
                            <button className="ml-auto text-blue-400 hover:underline text-sm">Implement</button>
                        </li>
                    ))}
                </ul>
                <button className="btn-secondary mt-5">Generate New Recommendations</button>
            </div>
            <div className="bg-gray-800 p-5 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-white mb-4">Cost Management & Predictive Billing</h3>
                <p className="text-gray-300">Current Month Estimated Cost: <span className="text-green-400 font-semibold text-lg">$1,250,345</span></p>
                <p className="text-gray-300 mt-2">Projection for Next Month: <span className="text-orange-400 font-semibold text-lg">$1,300,500</span> (<span className="text-red-400">+4%</span>)</p>
                <div className="mt-4 flex space-x-4">
                    <button className="btn-secondary">View Detailed Bill</button>
                    <button className="btn-secondary">Set Budget Alerts</button>
                    <button className="btn-secondary">Cost Anomaly Detection</button>
                </div>
            </div>
        </section>
    );
};


// --- Advanced & Future-State Services (The Frontier of the Universe) ---

export const AIMLStudio: React.FC = () => {
    const [models, setModels] = useState<any[]>([
        { id: 'nlp-sentiment-v3', name: 'Galactic Sentiment Analyzer v3', status: 'Deployed', type: 'NLP', deployedEndpoints: 3, latency: '20ms', accuracy: '92%', cost: 500 },
        { id: 'image-rec-planet-scan', name: 'Planet Surface Reconnaissance', status: 'Training', type: 'Computer Vision', dataProgress: '75%', epochs: 120, estCompletion: '2 days', cost: 1200 },
        { id: 'anomaly-det-quantum', name: 'Quantum Anomaly Detector', status: 'Deployed', type: 'Anomaly Detection', deployedEndpoints: 1, latency: '1ms', accuracy: '99.5%', cost: 800 },
    ]);

    return (
        <section className="space-y-6">
            <SectionHeader title="AI & Machine Learning Studio" icon={<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 4c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zm0 14c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6zm-1-9h2v4h-2zm0 5h2v2h-2z"></path></svg>}
                description="Develop, deploy, and manage your intelligent agents and autonomous systems. From neural networks to advanced predictive algorithms, on any scale."
                actions={<button className="btn-primary">Create New Model</button>} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {models.map(model => (
                    <div key={model.id} className="bg-gray-800 p-5 rounded-xl shadow-md">
                        <h4 className="text-xl font-semibold text-blue-400 mb-2">{model.name}</h4>
                        <p className="text-gray-300 text-sm">Type: <span className="text-white">{model.type}</span></p>
                        <p className="text-gray-300 text-sm">Status: <span className={`font-semibold ${model.status === 'Deployed' ? 'text-green-400' : 'text-yellow-400'}`}>{model.status}</span></p>
                        <ul className="mt-3 text-sm text-gray-400 space-y-1">
                            {Object.entries(model).filter(([key]) => !['id', 'name', 'status', 'type'].includes(key)).map(([key, value]) => (
                                <li key={key} className="flex justify-between">
                                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                    <span className="font-medium text-white">{value as any}</span>
                                </li>
                            ))}
                        </ul>
                        <button className="btn-secondary mt-4">Manage</button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export const QuantumSupervisionModule: React.FC = () => {
    const [quantumCircuits, setQuantumCircuits] = useState<any[]>([
        { id: 'q-sim-teleport-01', name: 'Quantum Teleportation Simulator', status: 'Running', qbits: 12, coherenceTime: '100μs', errorRate: '0.05%', purpose: 'Research' },
        { id: 'q-opt-fleet-routing', name: 'AstroFleet Route Optimizer', status: 'Idle', qbits: 64, coherenceTime: '2ms', errorRate: '0.01%', purpose: 'Logistics' },
        { id: 'q-crypto-securecomms', name: 'Quantum Cryptography Enclave', status: 'Active', qbits: 256, coherenceTime: '50ms', errorRate: '0.001%', purpose: 'Security' },
    ]);

    const [quantumSensors, setQuantumSensors] = useState<any[]>([
        { id: 'q-sensor-gravity-01', name: 'Gravitational Anomaly Detector', status: 'Online', location: 'Orion Sector', readings: 'Stable', lastChecked: new Date() },
        { id: 'q-sensor-darkmatter-01', name: 'Dark Matter Flux Monitor', status: 'Online', location: 'Deep Space Array', readings: 'Normal', lastChecked: new Date() },
    ]);

    return (
        <section className="space-y-6">
            <SectionHeader title="Quantum Supervision Module" icon={<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"></path></svg>}
                description="Harness and monitor the quantum fabric of reality. Manage entangled Qbits, quantum circuits, and advanced quantum sensors across all dimensions of your infrastructure."
                actions={<button className="btn-primary">Design Quantum Circuit</button>} />

            <h3 className="text-2xl font-semibold text-white mt-8 mb-4">Quantum Compute Circuits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quantumCircuits.map(circuit => (
                    <div key={circuit.id} className="bg-gray-800 p-5 rounded-xl shadow-md">
                        <h4 className="text-xl font-semibold text-purple-400 mb-2">{circuit.name}</h4>
                        <p className="text-gray-300 text-sm">Status: <span className={`font-semibold ${circuit.status === 'Running' || circuit.status === 'Active' ? 'text-green-400' : 'text-yellow-400'}`}>{circuit.status}</span></p>
                        <ul className="mt-3 text-sm text-gray-400 space-y-1">
                            {Object.entries(circuit).filter(([key]) => !['id', 'name', 'status'].includes(key)).map(([key, value]) => (
                                <li key={key} className="flex justify-between">
                                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                    <span className="font-medium text-white">{value as any}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <h3 className="text-2xl font-semibold text-white mt-8 mb-4">Quantum Sensor Network</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quantumSensors.map(sensor => (
                    <div key={sensor.id} className="bg-gray-800 p-5 rounded-xl shadow-md">
                        <h4 className="text-xl font-semibold text-indigo-400 mb-2">{sensor.name}</h4>
                        <p className="text-gray-300 text-sm">Status: <span className={`font-semibold ${sensor.status === 'Online' ? 'text-green-400' : 'text-red-400'}`}>{sensor.status}</span></p>
                        <ul className="mt-3 text-sm text-gray-400 space-y-1">
                            {Object.entries(sensor).filter(([key]) => !['id', 'name', 'status'].includes(key)).map(([key, value]) => (
                                <li key={key} className="flex justify-between">
                                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                    <span className="font-medium text-white">{value as any}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
};


export const AstroFleetManagement: React.FC = () => {
    const [fleetAssets, setFleetAssets] = useState<any[]>([
        { id: 'ship-explorer-01', name: 'Explorer-class Deep Space Probe', status: 'En Route', location: 'Alpha Centauri System', fuel: '85%', health: '99%', mission: 'Exoplanet Scan' },
        { id: 'station-mars-01', name: 'Mars Orbital Station Alpha', status: 'Operational', location: 'Mars Orbit', crew: 120, modules: 25, power: 'Solar (100%)' },
        { id: 'rover-titan-03', name: 'Titan Surface Rover "Goliath"', status: 'Exploring', location: 'Titan Surface', battery: '60%', speed: '5km/h', mission: 'Resource Extraction' },
        { id: 'drone-cargo-luna-05', name: 'Lunar Cargo Drone 05', status: 'Docked', location: 'Lunar Base Gamma', payload: '500kg', range: 'Local', lastMission: 'Supply Drop' },
    ]);

    return (
        <section className="space-y-6">
            <SectionHeader title="AstroFleet & Planetary Infrastructure" icon={<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93V12h2v7.93c-1.3-.18-2.6-.18-3.9-.02zM18.36 17.3c-.67-.78-1.42-1.54-2.22-2.24l-1.42 1.42a10.02 10.02 0 00-4.44 0l-1.42-1.42c-.8.7-1.55 1.46-2.22 2.24A8.01 8.01 0 0112 4.07c2.19 0 4.16.89 5.54 2.36l-1.42 1.42c-.8-.7-1.55-1.46-2.22-2.24A8.01 8.01 0 0112 4.07c2.19 0 4.16.89 5.54 2.36z"></path></svg>}
                description="Command and monitor your entire inter-planetary and deep-space infrastructure. From orbital stations to planetary rovers and deep-space probes."
                actions={<button className="btn-primary">Deploy New Asset</button>} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fleetAssets.map(asset => (
                    <div key={asset.id} className="bg-gray-800 p-5 rounded-xl shadow-md">
                        <h4 className="text-xl font-semibold text-teal-400 mb-2">{asset.name}</h4>
                        <p className="text-gray-300 text-sm">Status: <span className={`font-semibold ${asset.status.includes('Operational') || asset.status.includes('Running') || asset.status.includes('Exploring') ? 'text-green-400' : 'text-yellow-400'}`}>{asset.status}</span></p>
                        <p className="text-gray-300 text-sm">Location: <span className="text-white">{asset.location}</span></p>
                        <ul className="mt-3 text-sm text-gray-400 space-y-1">
                            {Object.entries(asset).filter(([key]) => !['id', 'name', 'status', 'location'].includes(key)).map(([key, value]) => (
                                <li key={key} className="flex justify-between">
                                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                    <span className="font-medium text-white">{value as any}</span>
                                </li>
                            ))}
                        </ul>
                        <button className="btn-secondary mt-4">Command Asset</button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export const GlobalInfrastructureMap: React.FC = () => {
    const [mapData, setMapData] = useState<any>({
        terrestrialRegions: 25,
        orbitalStations: 15,
        lunarBases: 3,
        marsColonies: 2,
        deepSpaceProbes: 8,
        quantumRealms: 3,
        interdimensionalGates: 1, // Experimental
    });

    return (
        <section className="space-y-6">
            <SectionHeader title="Global & Inter-Planetary Infrastructure Map" icon={<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93V12h2v7.93c-1.3-.18-2.6-.18-3.9-.02zM18.36 17.3c-.67-.78-1.42-1.54-2.22-2.24l-1.42 1.42a10.02 10.02 0 00-4.44 0l-1.42-1.42c-.8.7-1.55 1.46-2.22 2.24A8.01 8.01 0 0112 4.07c2.19 0 4.16.89 5.54 2.36l-1.42 1.42c-.8-.7-1.55-1.46-2.22 2.24A8.01 8.01 0 0112 4.07c2.19 0 4.16.89 5.54 2.36z"></path></svg>}
                description="A real-time, interactive visualization of your entire digital and physical footprint, spanning multiple planets, solar systems, and even experimental inter-dimensional links."
                actions={<button className="btn-primary">Launch 3D Holographic View</button>} />
            <div className="bg-gray-800 p-5 rounded-xl shadow-md h-96 flex items-center justify-center text-gray-400 text-2xl font-bold">
                {/* Placeholder for an advanced interactive 3D map component */}
                <p>Interactive Universal Infrastructure Map - Visualizing <span className="text-blue-400">Solar Systems</span>, <span className="text-green-400">Planetary Bases</span>, and <span className="text-purple-400">Quantum Realms</span></p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(mapData).map(([key, value]) => (
                    <MetricCard key={key} title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} value={value as number} />
                ))}
            </div>
        </section>
    );
};

export const SustainabilityReport: React.FC = () => {
    const [carbonFootprint, setCarbonFootprint] = useState<any>({
        totalEmissions: '1.2M Tons CO2e/year',
        renewableEnergyMix: '75%',
        efficiencyScore: 'A-',
        lastAudit: '2024-03-15',
    });

    const [greenOpsRecommendations, setGreenOpsRecommendations] = useState<string[]>([
        'Migrate legacy compute to sustainable regions for 10% reduction.',
        'Optimize data transfer paths to reduce network energy consumption.',
        'Implement power-aware scheduling for batch processing jobs.',
        'Invest in localized renewable energy for Mars colony operations.',
    ]);

    return (
        <section className="space-y-6">
            <SectionHeader title="Sustainability & GreenOps" icon={<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93V12h2v7.93c-1.3-.18-2.6-.18-3.9-.02zM18.36 17.3c-.67-.78-1.42-1.54-2.22-2.24l-1.42 1.42a10.02 10.02 0 00-4.44 0l-1.42-1.42c-.8.7-1.55 1.46-2.22 2.24A8.01 8.01 0 0112 4.07c2.19 0 4.16.89 5.54 2.36l-1.42 1.42c-.8-.7-1.55-1.46-2.22 2.24A8.01 8.01 0 0112 4.07c2.19 0 4.16.89 5.54 2.36z"></path></svg>}
                description="Monitor your environmental impact, track carbon footprints across your entire infrastructure, and implement AI-driven GreenOps strategies for a sustainable digital future."
                actions={<button className="btn-primary">Generate Detailed Report</button>} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(carbonFootprint).map(([key, value]) => (
                    <MetricCard key={key} title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} value={value as string | number} />
                ))}
            </div>
            <div className="bg-gray-800 p-5 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-white mb-4">GreenOps Recommendations</h3>
                <ul className="space-y-3">
                    {greenOpsRecommendations.map((rec, index) => (
                        <li key={index} className="flex items-start text-gray-300">
                            <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                            <span>{rec}</span>
                            <button className="ml-auto text-blue-400 hover:underline text-sm">Implement</button>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};

export const ExecutiveSummary: React.FC = () => {
    const { state } = useGlobalAppState();

    const kpis = [
        { title: 'Compute Instances', value: 5432, unit: '', trend: 'up', description: 'Total active compute instances, including VMs, containers, and serverless functions.' },
        { title: 'Storage Buckets', value: 1245, unit: '', trend: 'up', description: 'Total active storage buckets across all regions and data tiers.' },
        { title: 'Databases', value: 367, unit: '', trend: 'stable', description: 'Managed database instances, including SQL, NoSQL, and graph databases.' },
        { title: 'Monthly Cost', value: '$1,250,345', unit: '', trend: 'up', description: 'Estimated monthly expenditure based on current resource utilization.' },
        { title: 'Security Alerts', value: state.notifications.filter(n => !n.read && n.type !== 'info' && n.type !== 'success').length, unit: '', trend: 'down', description: 'Critical and warning security alerts requiring immediate attention.' },
        { title: 'AI Model Deployments', value: 25, unit: '', trend: 'up', description: 'Total active machine learning model prediction endpoints.' },
        { title: 'Quantum Circuits', value: 3, unit: '', trend: 'stable', description: 'Active experimental quantum computing circuits.' },
        { title: 'AstroFleet Assets', value: 4, unit: '', trend: 'up', description: 'Operational inter-planetary and deep-space assets.' },
    ];

    return (
        <section className="space-y-6">
            <SectionHeader title="Executive Global Overview" icon={<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>}
                description="A high-level synthesis of your entire digital and physical infrastructure, providing critical KPIs and an immediate pulse of the empire." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, index) => (
                    <MetricCard key={index} {...kpi} />
                ))}
            </div>
            <div className="bg-gray-800 p-5 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-white mb-4">System Status: <span className={`font-bold ${state.systemStatus === 'operational' ? 'text-green-400' : state.systemStatus === 'degraded' ? 'text-yellow-400' : 'text-red-400'}`}>{state.systemStatus.toUpperCase()}</span></h3>
                <p className="text-gray-300">Last updated: {state.lastActivity.toLocaleString()}</p>
                {state.systemStatus !== 'operational' && (
                    <p className="text-red-300 mt-2">Immediate action required: review system health logs for anomalies.</p>
                )}
            </div>
        </section>
    );
};


// --- Main CloudDashboard Component (The Sovereign's Throne Room) ---
const CloudDashboard: React.FC = () => {
    const { state, dispatch } = useGlobalAppState();

    const baseClasses = "bg-gray-900 text-white min-h-screen font-sans transition-colors duration-500";
    const holographicClasses = "bg-gradient-to-br from-blue-900 via-purple-900 to-black text-cyan-300 min-h-screen font-sans shadow-inner-xl animate-pulse-subtle";
    const quantumClasses = "bg-gradient-to-br from-black via-gray-950 to-indigo-950 text-emerald-300 min-h-screen font-sans shadow-inner-xl animate-spin-subtle-hue"; // Placeholder for more complex animation

    let currentThemeClasses = baseClasses;
    if (state.theme.mode === 'holographic') {
        currentThemeClasses = holographicClasses;
    } else if (state.theme.mode === 'quantum') {
        currentThemeClasses = quantumClasses;
    }

    // Dynamic styling for holographic mode
    const holographicStyle = state.theme.mode === 'holographic' ? {
        textShadow: '0 0 5px rgba(0,255,255,0.7), 0 0 10px rgba(0,255,255,0.5)',
        boxShadow: 'inset 0 0 20px rgba(0,255,255,0.2), 0 0 15px rgba(0,255,255,0.1)',
        border: '1px solid rgba(0,255,255,0.3)',
    } : {};

    return (
        <div className={currentThemeClasses}>
            <header className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center z-50 sticky top-0" style={state.theme.mode === 'holographic' ? holographicStyle : {}}>
                <div className="flex items-center space-x-4">
                    <h1 className="text-3xl font-bold" style={state.theme.mode === 'holographic' ? holographicStyle : {}}>Cloud Command Panopticon</h1>
                    <span className="text-sm text-gray-400 border-l pl-4 border-gray-600 hidden md:block">Active Project: <span className="text-blue-400 font-medium">{state.activeProject}</span></span>
                </div>
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Global Search..."
                        className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        value={state.globalSearchTerm}
                        onChange={(e) => dispatch({ type: 'SET_GLOBAL_SEARCH_TERM', payload: e.target.value })}
                    />
                    <NotificationCenter />
                    <button onClick={() => dispatch({ type: 'SET_THEME', payload: { ...state.theme, mode: state.theme.mode === 'dark' ? 'light' : state.theme.mode === 'light' ? 'holographic' : state.theme.mode === 'holographic' ? 'quantum' : 'dark' } })} className="p-2 rounded-full hover:bg-gray-700 text-gray-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343h7.07a2 2 0 011.414 2.414l-1.414 4.072m-7.07 0l5.657 2.828a2 2 0 002.828-2.828l-2.828-5.657m-5.657 2.828H9"></path></svg>
                    </button>
                    <div className="relative group">
                        <span className="cursor-pointer text-gray-300 hover:text-white">Hi, {state.auth.user?.name.split(' ')[0]}</span>
                        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg hidden group-hover:block z-50">
                            <ul className="text-sm text-gray-200">
                                <li className="p-2 hover:bg-gray-700 rounded-t-lg cursor-pointer">Profile</li>
                                <li className="p-2 hover:bg-gray-700 cursor-pointer">Settings</li>
                                <li className="p-2 hover:bg-gray-700 rounded-b-lg cursor-pointer" onClick={() => dispatch({ type: 'LOGOUT' })}>Logout</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </header>
            <main className="p-6 space-y-12"> {/* Increased spacing for more distinct sections */}
                <ExecutiveSummary />
                <ComputeManager />
                <StorageBrowser />
                <NetworkTopology />
                <SecurityOperationsCenter />
                <OperationsDashboard />
                <AIMLStudio />
                <QuantumSupervisionModule />
                <AstroFleetManagement />
                <GlobalInfrastructureMap />
                <SustainabilityReport />
                {/* Add more components here as the universe expands */}
                <GlobalCommandPalette />
            </main>
            <footer className="p-4 bg-gray-800 text-gray-500 text-center text-sm border-t border-gray-700" style={state.theme.mode === 'holographic' ? holographicStyle : {}}>
                © {new Date().getFullYear()} Google Cloud Panopticon. All rights reserved. Sovereign Command Build v10.7.3. Quantum-Entanglement enabled.
            </footer>
        </div>
    );
};

export default CloudDashboard;

// Basic CSS for the custom-scrollbar and subtle animations (could be in a separate CSS file for a real project)
const styleTag = document.createElement('style');
styleTag.innerHTML = `
.btn-primary {
    @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200;
}
.btn-secondary {
    @apply bg-gray-700 text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200;
}
.custom-scrollbar::-webkit-scrollbar {
    width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: #333;
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #555;
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #777;
}

/* Holographic mode specific animations and effects */
.animate-pulse-subtle {
    animation: pulse-subtle 30s infinite alternate;
}
@keyframes pulse-subtle {
    0% { filter: hue-rotate(0deg); background-position: 0% 50%; }
    50% { filter: hue-rotate(10deg); background-position: 100% 50%; }
    100% { filter: hue-rotate(0deg); background-position: 0% 50%; }
}

.animate-spin-subtle-hue {
    animation: spin-subtle-hue 60s linear infinite;
}
@keyframes spin-subtle-hue {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
}

`;
document.head.appendChild(styleTag);
`;