import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { DataContext } from '../context/DataContext';
import { View, Notification } from '../types';

// --- Global Types & Interfaces (assuming these are globally available or internal to this expansive file) ---

// Represents a user in the system for collaboration and profile features
export interface UserProfile {
    id: string;
    name: string;
    avatarUrl: string;
    status: 'online' | 'away' | 'busy' | 'dnd' | 'offline';
    lastActive: string; // ISO string
    role: string;
    preferences: {
        theme: 'dark' | 'light' | 'system' | 'nebula';
        language: string;
        accessibility: {
            fontSize: 'small' | 'medium' | 'large';
            highContrast: boolean;
            voiceControl: boolean;
        };
        hapticFeedback: boolean;
        arModeDefault: boolean;
    };
    currentLocation?: {
        lat: number;
        lon: number;
        description: string;
    };
    cognitiveLoad?: number; // 0-100, AI-estimated
    sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed'; // AI-estimated
}

// Represents a system health metric
export interface SystemMetric {
    id: string;
    name: string;
    value: number | string;
    unit?: string;
    status: 'optimal' | 'warning' | 'critical' | 'info';
    lastUpdated: string;
    details?: string;
    icon?: React.ReactNode;
}

// Represents a global background task
export interface GlobalTask {
    id: string;
    name: string;
    progress: number; // 0-100
    status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
    startTime: string;
    estimatedCompletion?: string;
    userInitiated?: boolean;
    priority: 'low' | 'medium' | 'high' | 'critical';
}

// Represents a quick action or command palette entry
export interface QuickAction {
    id: string;
    label: string;
    icon: string; // SVG path or icon name
    action: (payload?: any) => void;
    keywords: string[];
    category: string;
    isFavorite?: boolean;
}

// Represents an environment (dev, prod, sandbox, specific project universe)
export interface Environment {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'restricted';
    color: string;
    icon: React.ReactNode;
}

// Represents an advanced notification type (beyond basic `Notification`)
export interface AdvancedNotification extends Notification {
    category: 'system' | 'security' | 'financial' | 'social' | 'update' | 'ai-insight';
    priority: 'low' | 'medium' | 'high' | 'critical';
    actionButtons?: { label: string; action: (id: string) => void }[];
    expiryDate?: string;
    sourceIcon?: string;
}

// Represents an advanced search result
export interface SearchResult {
    id: string;
    title: string;
    description: string;
    type: 'document' | 'transaction' | 'user' | 'asset' | 'view' | 'command';
    link: string; // Internal or external link
    relevanceScore: number;
    tags: string[];
}

// Represents a breadcrumb item
export interface BreadcrumbItem {
    label: string;
    view?: View;
    path?: string; // For deeper internal paths
}

// --- Extended DataContext (conceptual expansion, not actual modification of DataContext.ts) ---
// We assume DataContext now provides these richer data points.
interface ExtendedDataContextType {
    notifications: Notification[]; // existing
    markNotificationRead: (id: string) => void; // existing
    // New assumed fields:
    currentUser: UserProfile;
    systemMetrics: SystemMetric[];
    globalTasks: GlobalTask[];
    quickActions: QuickAction[];
    environments: Environment[];
    activeEnvironmentId: string;
    updateActiveEnvironment: (id: string) => void;
    updateUserProfile: (profile: Partial<UserProfile>) => void;
    markAdvancedNotificationRead: (id: string) => void;
    advancedNotifications: AdvancedNotification[];
    logUserActivity: (activity: string) => void;
    currentBreadcrumbs: BreadcrumbItem[];
    globalSearch: (query: string) => Promise<SearchResult[]>;
    aiAssistantActive: boolean;
    toggleAIAssistant: () => void;
    // ... many more assumed data points for 1000+ features
}

/**
 * @description Enhanced dynamic widget to show the simulated real-time status of the "Heuristic API"
 * and other critical system sub-systems. Includes performance, energy, and AI operational status.
 */
export const HeuristicAPIStatus: React.FC = () => {
    const messages = [
        "Heuristic Core: Actively analyzing portfolio metrics...",
        "Quantum Ledger: Synchronizing real-time market data...",
        "Neural Net Cluster: Identified 3 potential arbitrage opportunities (High Confidence)...",
        "Heuristic API: All systems nominal. Processing stream 0-99...",
        "Predictive Engine: Cross-referencing spending patterns for Q3 projections...",
        "Cognitive Insight Module: Compiling weekly personalized financial insights...",
        "Security Guardian: Threat level LOW. All protocols engaged...",
        "Eco-Footprint Modeler: Calculating carbon offset recommendations...",
        "Decentralized Oracle: Verifying external data feeds. Consensus 98.7%...",
        "System Integrity: Hyper-threading at 92%. Temperature 38°C. Optimal.",
        "Resource Allocator: Rebalancing compute load. Energy consumption -0.5%...",
        "User Experience AI: Monitoring sentiment, optimizing interface for clarity...",
    ];

    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [statusColor, setStatusColor] = useState<'cyan' | 'green' | 'yellow' | 'red'>('cyan');
    const [performanceMetric, setPerformanceMetric] = useState(90); // 0-100
    const [energyUsage, setEnergyUsage] = useState(0.8); // GWh

    useEffect(() => {
        const messageInterval = setInterval(() => {
            setCurrentMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
        }, 6000); // Slower interval for more detailed messages

        const metricInterval = setInterval(() => {
            // Simulate dynamic metrics and status changes
            const newPerf = 80 + Math.floor(Math.random() * 20); // 80-99
            const newEnergy = (0.7 + Math.random() * 0.3).toFixed(1); // 0.7-1.0 GWh
            setPerformanceMetric(newPerf);
            setEnergyUsage(parseFloat(newEnergy));

            if (newPerf < 85) setStatusColor('yellow');
            else if (newPerf < 70) setStatusColor('red');
            else setStatusColor('cyan');
        }, 8000); // Update metrics every 8 seconds

        return () => {
            clearInterval(messageInterval);
            clearInterval(metricInterval);
        };
    }, []);

    const getColorClass = (color: typeof statusColor) => {
        switch (color) {
            case 'cyan': return 'bg-cyan-400';
            case 'green': return 'bg-green-400';
            case 'yellow': return 'bg-yellow-400';
            case 'red': return 'bg-red-400';
        }
    };

    return (
        <div className="hidden lg:flex flex-col items-start p-2 rounded-lg bg-gray-900/40 border border-cyan-500/10 transition-all duration-500 min-w-[300px] text-xs">
            <div className="flex items-center space-x-2 w-full">
                <div className="flex space-x-0.5 items-end h-4 flex-shrink-0">
                    <span className={`w-1 h-1 ${getColorClass(statusColor)} rounded-full animate-pulse [animation-delay:-0.3s]`}></span>
                    <span className={`w-1 h-2 ${getColorClass(statusColor)} rounded-full animate-pulse [animation-delay:-0.15s]`}></span>
                    <span className={`w-1 h-3 ${getColorClass(statusColor)} rounded-full animate-pulse`}></span>
                    <span className={`w-1 h-2 ${getColorClass(statusColor)} rounded-full animate-pulse [animation-delay:-0.15s]`}></span>
                    <span className={`w-1 h-1 ${getColorClass(statusColor)} rounded-full animate-pulse [animation-delay:-0.3s]`}></span>
                </div>
                <span className={`font-mono text-white/90 truncate ${statusColor === 'yellow' ? 'text-yellow-300' : statusColor === 'red' ? 'text-red-400' : 'text-cyan-300/80'}`}>{messages[currentMessageIndex]}</span>
                <span className="ml-auto text-gray-500 hover:text-white cursor-pointer" title="View detailed system metrics">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125l4.724-4.725A4.5 4.5 0 0112 5.25h1.5m-1.5 6L10.5 14.25m0 0l-4.724 4.725H3.75m0-4.5h7.5m-7.5 0l-1 1m6.75-9l-1 1M12 21.75l-4.724-4.725H3.75m0 0v-4.5m4.5-1.5l1 1m-1-9l-1 1m9.75-1.5l.38.234A7.5 7.5 0 0012 21.75m9-9l-.693 1.852-1.137-1.137M21 12v3.75m0 0h-3.75m-4.5-1.5l1 1m2.25-4.5l-1 1M12 12l-1 1m3-2.25l-.38-.234A7.5 7.5 0 0021 3.75v-.75" />
                    </svg>
                </span>
            </div>
            <div className="flex items-center justify-between w-full mt-1 pt-1 border-t border-gray-700/30">
                <span className="text-gray-500 flex items-center space-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3 text-cyan-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                    </svg>
                    <span>Perf: <span className="text-white">{performanceMetric}%</span></span>
                </span>
                <span className="text-gray-500 flex items-center space-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3 text-green-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.15-.175-2.317-.375-3.483-.6A11.954 11.954 0 015.75 18.25c-1.188-.43-2.317-.92-3.39-1.488a.75.75 0 00-.738 1.125A13.955 13.955 0 005.25 21c.907.375 1.838.697 2.802.956C9.531 22.42 10.702 22.5 12 22.5c1.298 0 2.47-.08 3.948-.418a16.276 16.276 0 002.802-.956c.907-.375 1.838-.697 2.802-.956A13.955 13.955 0 0021.75 17.613a.75.75 0 00-.738-1.125c-1.073.568-2.202 1.058-3.39 1.488-.936.34-1.92.6-2.932.783A11.954 11.954 0 0112 20.25z" />
                    </svg>
                    <span>Energy: <span className="text-white">{energyUsage} GWh</span></span>
                </span>
            </div>
        </div>
    );
};

/**
 * @description Provides a global, AI-powered search and command palette functionality.
 * Supports natural language queries, quick actions, and deep links.
 */
export const GlobalSearch: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const context = useContext(DataContext) as ExtendedDataContextType; // Assume extended context

    const handleSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }
        setIsLoading(true);
        // Simulate API call for results
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockResults: SearchResult[] = [
            { id: '1', title: 'Transaction History', description: 'View all past transactions', type: 'view', link: 'View.Transactions', relevanceScore: 0.9, tags: ['finance', 'history'] },
            { id: '2', title: 'User Profile Settings', description: 'Edit your personal information', type: 'view', link: 'View.Settings', relevanceScore: 0.85, tags: ['settings', 'profile'] },
            { id: '3', title: 'Generate Q4 Financial Report', description: 'Run the quarterly financial report', type: 'command', link: 'command:generateReport', relevanceScore: 0.7, tags: ['report', 'finance', 'command'] },
            { id: '4', title: `Data for "${searchQuery}"`, description: `Conceptual deep dive into ${searchQuery}`, type: 'document', link: `/data/${searchQuery}`, relevanceScore: 0.95, tags: ['data', 'analytics'] },
            { id: '5', title: 'AI Assistant: "What is my net worth?"', description: 'Ask the AI companion a question', type: 'command', link: 'command:ai_query', relevanceScore: 0.8, tags: ['ai', 'ask'] },
        ].filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.toLowerCase()));

        setResults(mockResults);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        const handler = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => {
            document.removeEventListener('mousedown', handler);
        };
    }, []);

    const handleSelectResult = (result: SearchResult) => {
        if (result.type === 'view') {
            context.logUserActivity(`Navigated to ${result.title} via search.`);
            context.setActiveView(result.link as View); // Assume View enum can handle this
        } else if (result.type === 'command') {
            alert(`Executing command: ${result.link}`); // Simulate command execution
            context.logUserActivity(`Executed command: ${result.link} via search.`);
        } else {
            alert(`Navigating to: ${result.link}`); // Simulate navigation
            context.logUserActivity(`Accessed ${result.title} via search.`);
        }
        setIsOpen(false);
        setQuery('');
        setResults([]);
    };

    return (
        <div className="relative flex-grow flex items-center mx-4" ref={searchRef}>
            <button
                onClick={() => setIsOpen(true)}
                className="hidden md:flex items-center space-x-2 text-gray-400 hover:text-white px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-sm">Search or Command...</span>
                <span className="ml-auto text-gray-500 text-xs px-1.5 py-0.5 border border-gray-600 rounded-md">/</span>
            </button>
            {isOpen && (
                <div className="absolute top-0 left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 w-full md:max-w-md md:left-1/2 md:-translate-x-1/2">
                    <div className="p-3 border-b border-gray-700 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            className="flex-grow bg-transparent text-white placeholder-gray-500 focus:outline-none text-base"
                            placeholder="Type to search or execute a command..."
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); handleSearch(e.target.value); }}
                            autoFocus
                        />
                        <button className="ml-2 text-gray-400 hover:text-white" onClick={() => setQuery('')}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    {isLoading && <div className="p-3 text-center text-cyan-400">Searching the multi-verse...</div>}
                    {!isLoading && results.length === 0 && query.length > 0 && (
                        <div className="p-3 text-center text-gray-500">No results found. Try a different query.</div>
                    )}
                    {!isLoading && results.length > 0 && (
                        <div className="max-h-60 overflow-y-auto">
                            {results.map((result) => (
                                <div key={result.id} onClick={() => handleSelectResult(result)} className="p-3 text-sm flex items-center hover:bg-gray-700 cursor-pointer border-b border-gray-700/50 last:border-b-0">
                                    <span className="text-cyan-400 mr-2">
                                        {result.type === 'view' && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125h9.75a1.125 1.125 0 001.125-1.125V9.75M3.75 6.25l-.25 1.5h-.25A.75.75 0 002.5 8v-.25A.75.75 0 013.25 7h.25v-.75a.75.75 0 01.75-.75h.25v-.25a.75.75 0 00-.75-.75h-.25a.75.75 0 00-.75.75v.25M7.5 12h-.75V8.25a.75.75 0 011.5 0V12h-.75z" /></svg>}
                                        {result.type === 'command' && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V15.75c0 .621-.504 1.125-1.125 1.125H12m0-12.75h-.375c-.621 0-1.125.504-1.125 1.125v12.75c0 .621.504 1.125 1.125 1.125H12M12 7.5h-1.5m0 3h-1.5m7.5-3h-.375c-.621 0-1.125.504-1.125 1.125V15.75c0 .621.504 1.125 1.125 1.125h.375" /></svg>}
                                        {result.type === 'document' && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.234 7.182L15 14.25m0 0l2.651 2.905m-2.651-2.905A9 9 0 1121.75 10.5M10.5 7.5v9m-4.5 3h8.25m-4.5-6h7.5m-7.5-6h7.5" /></svg>}
                                        {result.type === 'user' && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                                        {result.type === 'transaction' && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.104c.75.181 1.459-.715 1.459-1.478V9.303m-8.584 1.183c.78-.521 1.743-1.002 2.766-1.002h.75a.75.75 0 01.75.75v1.5c0 .72-.329 1.446-.953 1.956m-4.65-1.956C12.195 9.755 12 9 12 9c0-.667.4-1.25.962-1.25S13.923 8.333 13.923 9c0 .667-.4 1.25-.962 1.25h-.75m-4.65 1.956C8.805 13.755 8 13 8 13c0-.667.4-1.25.962-1.25s.961.583.961 1.25h-.75" /></svg>}
                                    </span>
                                    <div>
                                        <p className="text-white font-medium">{result.title}</p>
                                        <p className="text-gray-400 text-xs">{result.description}</p>
                                    </div>
                                    <span className="ml-auto text-gray-500 text-xs uppercase bg-gray-700 px-1.5 py-0.5 rounded-md">{result.type}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/**
 * @description Displays and manages the user's presence, activity, and provides quick actions for profile.
 * Integrates AI-estimated cognitive load and sentiment.
 */
export const UserPresenceStatus: React.FC<{ user: UserProfile, onUpdateStatus: (status: UserProfile['status']) => void }> = ({ user, onUpdateStatus }) => {
    const [statusMenuOpen, setStatusMenuOpen] = useState(false);
    const context = useContext(DataContext) as ExtendedDataContextType;

    const getStatusColor = (status: UserProfile['status']) => {
        switch (status) {
            case 'online': return 'bg-green-500';
            case 'away': return 'bg-yellow-500';
            case 'busy': return 'bg-red-500';
            case 'dnd': return 'bg-indigo-500';
            case 'offline': return 'bg-gray-500';
        }
    };

    const getCognitiveLoadColor = (load: number) => {
        if (load > 75) return 'bg-red-500';
        if (load > 50) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getSentimentIcon = (sentiment?: UserProfile['sentiment']) => {
        switch (sentiment) {
            case 'positive': return '😊';
            case 'neutral': return '😐';
            case 'negative': return '😠';
            case 'mixed': return '😬';
            default: return ' ';
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <div className="relative">
                <button onClick={() => setStatusMenuOpen(prev => !prev)} className="flex items-center space-x-1 focus:outline-none">
                    <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(user.status)} ring-1 ring-offset-2 ring-offset-gray-900 ${user.status === 'online' ? 'animate-pulse' : ''}`}></span>
                    <span className="text-sm font-medium text-gray-400 hover:text-white capitalize hidden sm:block">{user.status}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>
                {statusMenuOpen && (
                    <div className="absolute right-0 mt-2 w-32 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                        {['online', 'away', 'busy', 'dnd', 'offline'].map(s => (
                            <a
                                key={s}
                                href="#"
                                onClick={(e) => { e.preventDefault(); onUpdateStatus(s as UserProfile['status']); setStatusMenuOpen(false); context.logUserActivity(`Set status to ${s}.`); }}
                                className={`block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 capitalize ${user.status === s ? 'font-bold text-cyan-400' : ''}`}
                            >
                                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getStatusColor(s as UserProfile['status'])}`}></span> {s}
                            </a>
                        ))}
                    </div>
                )}
            </div>
            {user.cognitiveLoad !== undefined && (
                <div className="relative group flex items-center">
                    <span className={`w-2 h-2 rounded-full ${getCognitiveLoadColor(user.cognitiveLoad)} ring-1 ring-offset-2 ring-offset-gray-900`}></span>
                    <span className="ml-1 text-xs text-gray-400 hidden sm:block">Load: {user.cognitiveLoad}%</span>
                    <div className="absolute top-full right-0 mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md shadow-md text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                        AI Estimated Cognitive Load: {user.cognitiveLoad}%
                    </div>
                </div>
            )}
            {user.sentiment && (
                <div className="relative group flex items-center">
                    <span className="text-lg leading-none">{getSentimentIcon(user.sentiment)}</span>
                    <div className="absolute top-full right-0 mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md shadow-md text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                        AI Estimated Sentiment: {user.sentiment}
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * @description Displays ambient information like current time, weather, and active location.
 */
export const AmbientInfoDisplay: React.FC<{ userLocation?: UserProfile['currentLocation'] }> = ({ userLocation }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [weather, setWeather] = useState<{ temp: number, conditions: string, icon: string } | null>(null);

    useEffect(() => {
        const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
        // Simulate weather API call
        const fetchWeather = async () => {
            await new Promise(resolve => setTimeout(resolve, 5000));
            const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Snowy'];
            setWeather({
                temp: 20 + Math.floor(Math.random() * 10 - 5), // Simulate temp between 15-25 C
                conditions: conditions[Math.floor(Math.random() * conditions.length)],
                icon: '☀️' // For simplicity, just a sun icon or similar
            });
        };
        fetchWeather();
        const weatherInterval = setInterval(fetchWeather, 300000); // Update every 5 minutes

        return () => {
            clearInterval(timeInterval);
            clearInterval(weatherInterval);
        };
    }, []);

    return (
        <div className="hidden xl:flex items-center space-x-3 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {weather && (
                <div className="flex items-center space-x-1">
                    <span className="text-lg leading-none">{weather.icon}</span>
                    <span>{weather.temp}°C {weather.conditions}</span>
                </div>
            )}
            {userLocation && (
                <div className="flex items-center space-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <span>{userLocation.description}</span>
                </div>
            )}
        </div>
    );
};

/**
 * @description Allows switching between different system environments (e.g., Development, Production, Sandbox).
 * Provides a visual indicator of the active environment.
 */
export const EnvironmentSwitcher: React.FC = () => {
    const context = useContext(DataContext) as ExtendedDataContextType; // Assume extended context
    const [isOpen, setIsOpen] = useState(false);
    const envRef = useRef<HTMLDivElement>(null);

    const activeEnv = context.environments.find(env => env.id === context.activeEnvironmentId) || context.environments[0];

    useEffect(() => {
        const handler = (event: MouseEvent) => {
            if (envRef.current && !envRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => {
            document.removeEventListener('mousedown', handler);
        };
    }, []);

    if (!activeEnv) return null;

    return (
        <div className="relative hidden md:flex" ref={envRef}>
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium focus:outline-none transition-colors duration-200
                           ${activeEnv.color === 'red' ? 'bg-red-900/30 text-red-300 border border-red-500/30' :
                             activeEnv.color === 'green' ? 'bg-green-900/30 text-green-300 border border-green-500/30' :
                             'bg-gray-800/50 text-gray-300 border border-gray-700/50'}`}
                title={`Active Environment: ${activeEnv.name}`}
            >
                {activeEnv.icon || (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                    </svg>
                )}
                <span>{activeEnv.name}</span>
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="p-3 font-semibold text-white border-b border-gray-700">Environments</div>
                    {context.environments.map(env => (
                        <a
                            key={env.id}
                            href="#"
                            onClick={(e) => { e.preventDefault(); context.updateActiveEnvironment(env.id); setIsOpen(false); context.logUserActivity(`Switched to environment: ${env.name}.`); }}
                            className={`block px-4 py-2 text-sm flex items-center space-x-2 hover:bg-gray-700 ${env.id === activeEnv.id ? 'font-bold text-cyan-400' : 'text-gray-300'}`}
                        >
                            {env.icon || (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                                </svg>
                            )}
                            <span>{env.name}</span>
                            {env.id === activeEnv.id && <span className="ml-auto text-cyan-500">✓</span>}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

/**
 * @description Displays the current active path or context using breadcrumbs.
 * Supports navigation history and predictive paths.
 */
export const DynamicBreadcrumbs: React.FC<{ breadcrumbs: BreadcrumbItem[], onNavigate: (view: View) => void }> = ({ breadcrumbs, onNavigate }) => {
    if (breadcrumbs.length <= 1) return null;

    return (
        <nav className="hidden md:flex items-center space-x-2 text-sm text-gray-400 mr-4">
            {breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    )}
                    {item.view && index < breadcrumbs.length - 1 ? (
                        <button
                            onClick={() => onNavigate(item.view!)}
                            className="hover:text-white hover:underline focus:outline-none"
                        >
                            {item.label}
                        </button>
                    ) : (
                        <span className="text-white">{item.label}</span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

/**
 * @description Provides a toggle for an AI co-pilot/assistant and shows its status.
 */
export const AICoPilotToggle: React.FC<{ isActive: boolean, onToggle: () => void }> = ({ isActive, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2
                        ${isActive ? 'bg-cyan-900/30 text-cyan-300 border border-cyan-500/30 ring-cyan-500/50' : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 ring-gray-700/50 hover:bg-gray-700/50'}`}
            title={isActive ? "AI Co-pilot Active" : "Activate AI Co-pilot"}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.035-.259a3.375 3.375 0 002.456-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            <span className="text-sm">AI Co-pilot</span>
            {isActive && <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-1"></span>}
        </button>
    );
};

/**
 * @description Displays a compact list of active global background tasks with their progress.
 */
export const GlobalTaskProgress: React.FC<{ tasks: GlobalTask[] }> = ({ tasks }) => {
    const [isOpen, setIsOpen] = useState(false);
    const taskRef = useRef<HTMLDivElement>(null);
    const context = useContext(DataContext) as ExtendedDataContextType; // Assume extended context

    const activeTasks = tasks.filter(task => task.status === 'running' || task.status === 'pending');
    if (activeTasks.length === 0) return null;

    useEffect(() => {
        const handler = (event: MouseEvent) => {
            if (taskRef.current && !taskRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => {
            document.removeEventListener('mousedown', handler);
        };
    }, []);

    const getStatusColor = (status: GlobalTask['status']) => {
        switch (status) {
            case 'running': return 'bg-cyan-500';
            case 'pending': return 'bg-yellow-500';
            case 'completed': return 'bg-green-500';
            case 'failed': return 'bg-red-500';
            case 'paused': return 'bg-gray-500';
        }
    };

    return (
        <div className="relative hidden lg:block" ref={taskRef}>
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-gray-900/40 text-gray-400 border border-gray-700/50 hover:text-white focus:outline-none"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-cyan-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 18.75h16.5M3.75 8.25h16.5M9.75 21l-4.5-4.5m0 0L2.25 12h6.25c.66 0 1.2.54 1.2 1.2v2.55c0 .66-.54 1.2-1.2 1.2H2.25" />
                </svg>
                <span className="text-xs font-medium">{activeTasks.length} Active Tasks</span>
                {activeTasks.length > 0 && (
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="p-3 font-semibold text-white border-b border-gray-700">Active Background Tasks</div>
                    <div className="max-h-60 overflow-y-auto">
                        {activeTasks.map(task => (
                            <div key={task.id} className="p-3 text-sm border-b border-gray-700/50 last:border-b-0">
                                <div className="flex justify-between items-center text-white">
                                    <span className="font-medium">{task.name}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getStatusColor(task.status)}/20 text-${getStatusColor(task.status).split('-')[1]}-300`}>{task.status}</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                                    <div className={`h-1.5 rounded-full ${getStatusColor(task.status)}`} style={{ width: `${task.progress}%` }}></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>{task.progress}% Complete</span>
                                    {task.estimatedCompletion && <span>ETA: {task.estimatedCompletion}</span>}
                                </div>
                                <button
                                    onClick={() => { alert(`Task details for ${task.name}`); context.logUserActivity(`Viewed details for task: ${task.name}.`); }}
                                    className="mt-2 text-cyan-400 hover:text-cyan-300 text-xs"
                                >
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


/**
 * @description Provides a highly advanced notification center with categories, filters, and rich actions.
 * Goes beyond simple list to a full-fledged alert system.
 */
export const AdvancedNotificationCenter: React.FC<{
    notifications: AdvancedNotification[];
    onMarkRead: (id: string) => void;
    onViewDetail: (notification: AdvancedNotification) => void;
    onAction: (id: string, actionName: string) => void;
}> = ({ notifications, onMarkRead, onViewDetail, onAction }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [showUnreadOnly, setShowUnreadOnly] = useState(true);
    const notifRef = useRef<HTMLDivElement>(null);

    const context = useContext(DataContext) as ExtendedDataContextType;
    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handler = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => {
            document.removeEventListener('mousedown', handler);
        };
    }, []);

    const filteredNotifications = notifications.filter(n =>
        (filterCategory === 'all' || n.category === filterCategory) &&
        (!showUnreadOnly || !n.read)
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Sort newest first

    const categories = ['all', ...Array.from(new Set(notifications.map(n => n.category)))];

    const getPriorityColor = (priority: AdvancedNotification['priority']) => {
        switch (priority) {
            case 'critical': return 'text-red-400 bg-red-900/20 border-red-500/30';
            case 'high': return 'text-orange-400 bg-orange-900/20 border-orange-500/30';
            case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
            case 'low': return 'text-gray-400 bg-gray-700/20 border-gray-500/30';
            default: return 'text-gray-400 bg-gray-700/20 border-gray-500/30';
        }
    };

    return (
        <div className="relative" ref={notifRef}>
            <button onClick={() => setIsOpen(prev => !prev)} className="text-gray-400 hover:text-white focus:outline-none relative group" title="Advanced Notifications">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 block px-2 py-0.5 text-xs font-bold text-white bg-cyan-500 rounded-full ring-2 ring-gray-900">{unreadCount}</span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 transform origin-top-right scale-95 animate-scaleIn">
                    <div className="p-3 font-semibold text-white border-b border-gray-700 flex justify-between items-center">
                        <span>Notifications ({unreadCount} unread)</span>
                        <button onClick={() => setShowUnreadOnly(prev => !prev)} className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-gray-700/50">
                            {showUnreadOnly ? 'Show All' : 'Show Unread'}
                        </button>
                    </div>
                    <div className="p-3 border-b border-gray-700 flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-3 py-1 text-xs rounded-full capitalize ${filterCategory === cat ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {filteredNotifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">No notifications matching criteria.</div>
                        ) : (
                            filteredNotifications.map(notification => (
                                <div key={notification.id} className={`p-3 text-sm flex flex-col border-b border-gray-700/50 ${!notification.read ? 'bg-cyan-500/10' : 'opacity-80'}`}>
                                    <div className="flex items-start">
                                        {!notification.read && <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0 mr-2"></div>}
                                        <div className="flex-grow">
                                            <p className="text-gray-200 font-medium">{notification.message}</p>
                                            <div className="flex flex-wrap items-center mt-1 text-xs text-gray-400 space-x-2">
                                                <span>{new Date(notification.timestamp).toLocaleString()}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${getPriorityColor(notification.priority)}`}>{notification.priority}</span>
                                                <span className="capitalize">{notification.category.replace('-', ' ')}</span>
                                            </div>
                                            {notification.details && (
                                                <p className="text-gray-400 mt-2 text-xs">{notification.details}</p>
                                            )}
                                        </div>
                                        <div className="flex-shrink-0 ml-3 flex flex-col items-end space-y-1">
                                            {!notification.read && (
                                                <button onClick={() => { onMarkRead(notification.id); context.logUserActivity(`Marked notification ${notification.id} as read.`); }} className="text-cyan-400 hover:text-cyan-300 text-xs px-2 py-1 rounded-full bg-gray-700/50">
                                                    Mark Read
                                                </button>
                                            )}
                                            {notification.view && (
                                                <button onClick={() => { onViewDetail(notification); context.logUserActivity(`Viewed notification ${notification.id} detail.`); }} className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded-full bg-gray-700/50">
                                                    View
                                                </button>
                                            )}
                                            {notification.actionButtons && notification.actionButtons.map(btn => (
                                                <button key={btn.label} onClick={() => { btn.action(notification.id); context.logUserActivity(`Performed action "${btn.label}" on notification ${notification.id}.`); }} className="text-indigo-400 hover:text-indigo-300 text-xs px-2 py-1 rounded-full bg-gray-700/50">
                                                    {btn.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-3 border-t border-gray-700 text-center">
                        <button onClick={() => { alert('View All Notifications Page'); setIsOpen(false); context.logUserActivity('Navigated to all notifications page.'); }} className="text-cyan-400 hover:text-cyan-300 text-sm">
                            View All Notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Assuming the HeaderProps is also expanded to handle more global events
interface HeaderProps {
    setActiveView: (view: View) => void;
    onMenuClick: () => void;
    // Potentially add more global handlers here
}

/**
 * @description The central header component, expanded into a command center for the entire application.
 * Incorporates real-time system status, advanced search, personalized user controls,
 * ambient information, environment switching, and an advanced notification hub.
 * This is the ultimate control panel, a universe within a header.
 */
const Header: React.FC<HeaderProps> = ({ setActiveView, onMenuClick }) => {
    // Explicitly cast context to ExtendedDataContextType
    const context = useContext(DataContext) as ExtendedDataContextType;

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    // Default/Mock data for new context fields if they are not yet fully implemented in DataContext.
    // In a real "universe-scale" app, these would come from DataContext.
    const mockCurrentUser: UserProfile = context.currentUser || {
        id: 'thevisionary',
        name: 'The Visionary',
        avatarUrl: 'https://via.placeholder.com/150/00bcd4/ffffff?text=V',
        status: 'online',
        lastActive: new Date().toISOString(),
        role: 'Chief Architect',
        preferences: {
            theme: 'dark',
            language: 'en-US',
            accessibility: { fontSize: 'medium', highContrast: false, voiceControl: false },
            hapticFeedback: true,
            arModeDefault: false,
        },
        currentLocation: { lat: 34.0522, lon: -118.2437, description: 'Los Angeles, Earth Prime' },
        cognitiveLoad: 45,
        sentiment: 'positive',
    };

    const mockSystemMetrics: SystemMetric[] = context.systemMetrics || [
        { id: 'cpu', name: 'CPU Usage', value: 35, unit: '%', status: 'optimal', lastUpdated: new Date().toISOString() },
        { id: 'mem', name: 'Memory', value: 68, unit: '%', status: 'warning', lastUpdated: new Date().toISOString() },
        { id: 'net', name: 'Network Latency', value: 12, unit: 'ms', status: 'optimal', lastUpdated: new Date().toISOString() },
        { id: 'db', name: 'DB Sync', value: 'OK', status: 'optimal', lastUpdated: new Date().toISOString() },
        { id: 'ai_core', name: 'AI Core Latency', value: 5, unit: 'ms', status: 'optimal', lastUpdated: new Date().toISOString() },
        { id: 'quantum_comp', name: 'Quantum Core', value: 'Idle', status: 'info', lastUpdated: new Date().toISOString() },
    ];

    const mockGlobalTasks: GlobalTask[] = context.globalTasks || [
        { id: 'task-1', name: 'Universal Data Sync', progress: 75, status: 'running', startTime: new Date(Date.now() - 3600000).toISOString(), estimatedCompletion: '1 hour', priority: 'high' },
        { id: 'task-2', name: 'AI Model Retraining', progress: 10, status: 'pending', startTime: new Date().toISOString(), estimatedCompletion: '8 hours', priority: 'medium' },
    ];

    const mockEnvironments: Environment[] = context.environments || [
        { id: 'prod', name: 'Production Nexus', description: 'Live global deployment', status: 'active', color: 'green', icon: (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>) },
        { id: 'dev', name: 'Dev Sphere Alpha', description: 'Isolated development environment', status: 'active', color: 'cyan', icon: (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0l3-2.25-3-2.25M15 1.5l.34.225A7.5 7.5 0 0121 7.5v9a7.5 7.5 0 01-1.66 4.775l-.34.225m0-19.5l-.34-.225A7.5 7.5 0 003 7.5v9a7.5 7.5 0 001.66 4.775l.34.225" /></svg>) },
        { id: 'test', name: 'Simulation Grid', description: 'Testing & A/B experimental features', status: 'active', color: 'yellow', icon: (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.15-.175-2.317-.375-3.483-.6A11.954 11.954 0 015.75 18.25c-1.188-.43-2.317-.92-3.39-1.488a.75.75 0 00-.738 1.125A13.955 13.955 0 005.25 21c.907.375 1.838.697 2.802.956C9.531 22.42 10.702 22.5 12 22.5c1.298 0 2.47-.08 3.948-.418a16.276 16.276 0 002.802-.956c.907-.375 1.838-.697 2.802-.956A13.955 13.955 0 0021.75 17.613a.75.75 0 00-.738-1.125c-1.073.568-2.202 1.058-3.39 1.488-.936.34-1.92.6-2.932.783A11.954 11.954 0 0112 20.25z" /></svg>) },
    ];
    const mockActiveEnvironmentId = context.activeEnvironmentId || 'prod';

    const mockAdvancedNotifications: AdvancedNotification[] = context.advancedNotifications || [
        { id: 'adv-1', message: 'High value transaction alert!', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), read: false, view: View.Transactions, category: 'financial', priority: 'critical', actionButtons: [{ label: 'Review', action: (id) => alert(`Reviewing transaction ${id}`) }] },
        { id: 'adv-2', message: 'System update available for quantum core.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), read: false, view: View.Settings, category: 'system', priority: 'high', actionButtons: [{ label: 'Install Now', action: (id) => alert(`Installing updates for ${id}`) }] },
        { id: 'adv-3', message: 'AI detected unusual login attempt from unrecognized device.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), read: true, category: 'security', priority: 'critical', details: 'IP: 192.168.1.1, Device: Unknown Android. Blocked automatically.' },
        { id: 'adv-4', message: 'New AI insight: Your spending on "Quantum Computing Stocks" is up 15% this month.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), read: false, category: 'ai-insight', priority: 'medium', view: View.Insights },
        { id: 'adv-5', message: 'Welcome to the new header universe!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), read: false, category: 'update', priority: 'low' },
    ];

    const mockBreadcrumbs: BreadcrumbItem[] = context.currentBreadcrumbs || [
        { label: 'Home', view: View.Dashboard },
        { label: 'Finances', view: View.Transactions },
        { label: 'Detailed View' },
    ];

    const handleAdvancedNotificationClick = (notification: AdvancedNotification) => {
        if (notification.view) {
            setActiveView(notification.view);
        }
        // Assuming DataContext has markAdvancedNotificationRead
        context.markAdvancedNotificationRead(notification.id);
    };

    const handleNotificationAction = (notificationId: string, actionName: string) => {
        alert(`Action "${actionName}" for notification ${notificationId} executed.`);
        context.markAdvancedNotificationRead(notificationId);
    };

    const handleUpdateUserStatus = (status: UserProfile['status']) => {
        context.updateUserProfile({ status }); // Assuming DataContext has updateUserProfile
    };

    const handleToggleAIAssistant = () => {
        context.toggleAIAssistant(); // Assuming DataContext has toggleAIAssistant
    };

    useEffect(() => {
        const handler = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => {
            document.removeEventListener('mousedown', handler);
        };
    }, []);

    if (!context) {
        throw new Error("Header must be used within a DataProvider");
    }

    const { notifications, markNotificationRead } = context; // Keep existing for compatibility
    const unreadCount = notifications.filter(n => !n.read).length + mockAdvancedNotifications.filter(n => !n.read).length;

    return (
        <header className="py-4 px-6 bg-gray-900/30 backdrop-blur-xl border-b border-gray-700/50 flex justify-between items-center z-50 shadow-lg relative min-h-[70px]">
            <div className="flex items-center space-x-4">
                <button onClick={onMenuClick} className="lg:hidden mr-4 text-gray-400 hover:text-white transition-colors duration-200" aria-label="Open navigation menu">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                {/* Dynamic Branding / Holographic Logo */}
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-wider uppercase flex items-center bg-gradient-to-r from-cyan-400 to-indigo-600 text-transparent bg-clip-text animate-pulseSlow">
                    <span className="relative mr-2">
                        <svg className="h-7 w-7 text-cyan-400 animate-spinSlow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2"></circle>
                            <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4Z" fill="url(#gradient-logo)"></path>
                            <path d="M12 2V6M12 18V22M2 12H6M18 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path>
                            <defs>
                                <linearGradient id="gradient-logo" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="var(--tw-gradient-from)"></stop>
                                    <stop offset="100%" stopColor="var(--tw-gradient-to)"></stop>
                                </linearGradient>
                            </defs>
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white leading-none">AI</span>
                    </span>
                    SYNAPSE-BANK
                </h1>
                <DynamicBreadcrumbs breadcrumbs={mockBreadcrumbs} onNavigate={setActiveView} />
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
                <AmbientInfoDisplay userLocation={mockCurrentUser.currentLocation} />
                <EnvironmentSwitcher />
                <AICoPilotToggle isActive={context.aiAssistantActive} onToggle={handleToggleAIAssistant} />
                <GlobalTaskProgress tasks={mockGlobalTasks} />
                <HeuristicAPIStatus />
                <GlobalSearch />
                
                <AdvancedNotificationCenter
                    notifications={mockAdvancedNotifications}
                    onMarkRead={(id) => context.markAdvancedNotificationRead(id)}
                    onViewDetail={handleAdvancedNotificationClick}
                    onAction={handleNotificationAction}
                />

                <div className="relative" ref={profileRef}>
                    <button onClick={() => setIsProfileOpen(prev => !prev)} className="flex items-center space-x-3 group relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center border-2 border-cyan-400 group-hover:scale-105 transition-transform duration-200">
                            <img src={mockCurrentUser.avatarUrl} alt={mockCurrentUser.name} className="w-full h-full rounded-full object-cover" onError={(e) => { e.currentTarget.src = mockCurrentUser.avatarUrl; }} />
                            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${mockCurrentUser.status === 'online' ? 'bg-green-500 animate-ping-slow' : mockCurrentUser.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'} border-2 border-gray-900`}></span>
                        </div>
                        <span className="hidden sm:block font-medium text-white group-hover:text-cyan-300 transition-colors duration-200">{mockCurrentUser.name}</span>
                    </button>
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 animate-scaleIn">
                            <div className="p-4 border-b border-gray-700 flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center border-2 border-cyan-400">
                                    <img src={mockCurrentUser.avatarUrl} alt={mockCurrentUser.name} className="w-full h-full rounded-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-white font-semibold">{mockCurrentUser.name}</p>
                                    <p className="text-xs text-gray-400">{mockCurrentUser.role}</p>
                                    <UserPresenceStatus user={mockCurrentUser} onUpdateStatus={handleUpdateUserStatus} />
                                </div>
                            </div>
                            <div className="p-2 border-b border-gray-700">
                                <a href="#" onClick={(e) => { e.preventDefault(); setActiveView(View.Profile); setIsProfileOpen(false); context.logUserActivity('Navigated to user profile.'); }} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md transition-colors duration-150">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 inline-block mr-2">
                                        <path strokeLinecap="round" strokeLineJoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    My Profile
                                </a>
                                <a href="#" onClick={(e) => { e.preventDefault(); setActiveView(View.Settings); setIsProfileOpen(false); context.logUserActivity('Navigated to settings.'); }} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md transition-colors duration-150">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 inline-block mr-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                                    </svg>
                                    Settings & Preferences
                                </a>
                                <a href="#" onClick={(e) => { e.preventDefault(); alert('Help/Support portal activated.'); setIsProfileOpen(false); context.logUserActivity('Activated help/support.'); }} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md transition-colors duration-150">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 inline-block mr-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                    </svg>
                                    Help & Support
                                </a>
                                <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-700 mt-2 pt-2">
                                    Last Login: {new Date(mockCurrentUser.lastActive).toLocaleString()}
                                    <p className="flex items-center mt-1">
                                        <span>Current Theme: <span className="text-white capitalize">{mockCurrentUser.preferences.theme}</span></span>
                                        <span className="ml-auto text-cyan-400 cursor-pointer hover:underline" onClick={() => { alert('Theme switcher opened!'); setIsProfileOpen(false); context.logUserActivity('Opened theme switcher.'); }}>Change</span>
                                    </p>
                                    <p className="flex items-center">
                                        <span>Voice Control: <span className="text-white">{mockCurrentUser.preferences.accessibility.voiceControl ? 'On' : 'Off'}</span></span>
                                        <span className="ml-auto text-cyan-400 cursor-pointer hover:underline" onClick={() => { alert('Voice control toggle!'); setIsProfileOpen(false); context.updateUserProfile({ preferences: { ...mockCurrentUser.preferences, accessibility: { ...mockCurrentUser.preferences.accessibility, voiceControl: !mockCurrentUser.preferences.accessibility.voiceControl } } }); }}>Toggle</span>
                                    </p>
                                </div>
                            </div>
                            <a href="#" onClick={(e) => { e.preventDefault(); alert('Initiating secure system logout. Your session will be terminated across all connected realities.'); setIsProfileOpen(false); context.logUserActivity('Logged out.'); }} className="block px-4 py-3 text-sm text-red-400 hover:bg-gray-700 rounded-b-lg transition-colors duration-150">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 inline-block mr-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                                </svg>
                                Logout from all Quantum Nodes
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;