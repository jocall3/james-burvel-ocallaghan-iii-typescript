import React, { useState, useEffect, useCallback, useMemo, FC, ReactNode } from 'react';
import Card from '../../Card';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

// --- START: UTILITY & HELPER COMPONENTS ---

// A set of simple SVG icons to be used throughout the component.
// In a real app, these would likely come from a library like heroicons.

export const IconPlus: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
);
export const IconChevronDown: FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
);
export const IconChevronUp: FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" /></svg>
);
export const IconPlay: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.648c1.295.742 1.295 2.545 0 3.286L8.029 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653Z" /></svg>
);
export const IconTrash: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
);
export const IconPencil: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
);
export const IconArrowLeft: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
);
export const IconSpinner: FC<{ className?: string }> = ({ className }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// --- END: UTILITY & HELPER COMPONENTS ---


// --- START: TYPES & INTERFACES ---

export type FunctionRuntime = 'Node.js 18' | 'Python 3.9' | 'Go 1.19' | 'Java 17' | 'Ruby 3.1';
export type FunctionMemory = '128MB' | '256MB' | '512MB' | '1024MB' | '2048MB';
export type FunctionStatus = 'Active' | 'Inactive' | 'Building' | 'Error';

export interface FunctionTrigger {
  id: string;
  type: 'HTTP' | 'Cron' | 'Queue';
  details: string;
  enabled: boolean;
}

export interface EnvironmentVariable {
  key: string;
  value: string;
  isSecret: boolean;
}

export interface Deployment {
  version: string;
  timestamp: string;
  status: 'Success' | 'Failed' | 'InProgress';
  author: string;
  commitHash: string;
}

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
}

export interface FunctionSummary {
  id: string;
  name: string;
  runtime: FunctionRuntime;
  memory: FunctionMemory;
  status: FunctionStatus;
  lastModified: string;
  invocations30d: number;
  errorRate30d: number;
  avgDurationMs: number;
}

export interface FunctionDetails extends FunctionSummary {
  code: string;
  triggers: FunctionTrigger[];
  environmentVariables: EnvironmentVariable[];
  deployments: Deployment[];
  timeoutSeconds: number;
  monthlyInvocationData: { name: string; invocations: number; errors: number }[];
  memoryUsageData: { time: string; usage: number }[];
  latestLogs: LogEntry[];
}

export type ToastMessage = {
    id: number;
    type: 'success' | 'error' | 'info';
    message: string;
};

// --- END: TYPES & INTERFACES ---


// --- START: MOCK DATA GENERATION ---

const RUNTIMES: FunctionRuntime[] = ['Node.js 18', 'Python 3.9', 'Go 1.19', 'Java 17', 'Ruby 3.1'];
const MEMORY_SIZES: FunctionMemory[] = ['128MB', '256MB', '512MB', '1024MB', '2048MB'];
const STATUSES: FunctionStatus[] = ['Active', 'Inactive', 'Building', 'Error'];
const LOG_LEVELS: LogLevel[] = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
const AUTHORS = ['j.doe', 'a.smith', 'p.jones', 's.williams', 'm.brown'];
const COMMIT_CHARS = '0123456789abcdef';
const FUNCTION_NAME_PREFIXES = ['process', 'generate', 'handle', 'sync', 'update', 'validate', 'notify'];
const FUNCTION_NAME_SUFFIXES = ['transaction', 'report', 'user-event', 'data-pipeline', 'cache', 'auth-request', 'security-alert'];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const generateId = (): string => Math.random().toString(36).substring(2, 10);
const generateCommitHash = (): string => Array.from({ length: 8 }, () => getRandomElement(COMMIT_CHARS.split(''))).join('');

const generateMockLogs = (count: number): LogEntry[] => {
    return Array.from({ length: count }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 1000 * getRandomInt(1, 60)).toISOString(),
        level: getRandomElement(LOG_LEVELS),
        message: `Log message ${i}: Task completed with result ${Math.random().toFixed(3)}`,
        requestId: `req-${generateId()}`
    })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const generateMockDeployments = (count: number): Deployment[] => {
    return Array.from({ length: count }, (_, i) => ({
        version: `v1.${count - i - 1}.${getRandomInt(0, 5)}`,
        timestamp: new Date(Date.now() - i * 1000 * 60 * 60 * 24 * getRandomInt(1, 7)).toISOString(),
        status: i === 0 ? 'Success' : getRandomElement(['Success', 'Success', 'Success', 'Failed']),
        author: getRandomElement(AUTHORS),
        commitHash: generateCommitHash(),
    }));
};

const mockFunctionCode: Record<FunctionRuntime, string> = {
    'Node.js 18': `// Example Node.js function
exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Demo Bank! Your request was received.'),
    };
    return response;
};`,
    'Python 3.9': `# Example Python function
import json

def handler(event, context):
    print('Received event: ' + json.dumps(event))
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Demo Bank! Your request was received.')
    }`,
    'Go 1.19': `// Example Go function
package main

import (
	"fmt"
	"github.com/aws/aws-lambda-go/lambda"
)

type MyEvent struct {
	Name string \`json:"name" \`
}

func HandleRequest(event MyEvent) (string, error) {
	return fmt.Sprintf("Hello %s from Demo Bank!", event.Name), nil
}

func main() {
	lambda.Start(HandleRequest)
}`,
    'Java 17': `// Example Java function
package com.demobank;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;

public class Handler implements RequestHandler<Object, String> {
    @Override
    public String handleRequest(Object input, Context context) {
        context.getLogger().log("Input: " + input);
        return "Hello from Demo Bank - ";
    }
}`,
    'Ruby 3.1': `# Example Ruby function
require 'json'

def handler(event:, context:)
    puts "Received event: \#{event.to_json}"
    {
        statusCode: 200,
        body: {
            message: "Hello from Demo Bank!"
        }.to_json
    }
end`
};

export let MOCK_FUNCTIONS_DB: FunctionDetails[] = Array.from({ length: 42 }, (_, i) => {
    const runtime = getRandomElement(RUNTIMES);
    const name = `${getRandomElement(FUNCTION_NAME_PREFIXES)}-${getRandomElement(FUNCTION_NAME_SUFFIXES)}-${i}`;
    return {
        id: generateId(),
        name: name,
        runtime: runtime,
        memory: getRandomElement(MEMORY_SIZES),
        status: getRandomElement(STATUSES),
        lastModified: new Date(Date.now() - i * 1000 * 60 * 60 * 8).toISOString(),
        invocations30d: getRandomInt(1000, 500000),
        errorRate30d: Math.random() * 0.05,
        avgDurationMs: getRandomInt(20, 800),
        code: mockFunctionCode[runtime],
        triggers: [
            { id: generateId(), type: 'HTTP', details: `/api/v1/${name}`, enabled: true },
            { id: generateId(), type: 'Cron', details: `0 ${getRandomInt(0, 5)} * * *`, enabled: Math.random() > 0.5 },
        ],
        environmentVariables: [
            { key: 'DATABASE_URL', value: 'secret-db-connection-string', isSecret: true },
            { key: 'LOG_LEVEL', value: 'info', isSecret: false },
            { key: 'API_KEY', value: generateId(), isSecret: true },
        ],
        deployments: generateMockDeployments(5),
        timeoutSeconds: getRandomInt(3, 30),
        monthlyInvocationData: Array.from({ length: 12 }, (_, j) => ({
            name: new Date(2023, j, 1).toLocaleString('default', { month: 'short' }),
            invocations: getRandomInt(80000, 120000),
            errors: getRandomInt(100, 1000)
        })),
        memoryUsageData: Array.from({ length: 30 }, (_, j) => ({
            time: `T-${30 - j}`,
            usage: getRandomInt(40, 100)
        })),
        latestLogs: generateMockLogs(50),
    };
});


// --- END: MOCK DATA GENERATION ---


// --- START: MOCK API SERVICE ---

// Simulate network latency
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
    async getFunctions(): Promise<FunctionSummary[]> {
        await sleep(500);
        return MOCK_FUNCTIONS_DB.map(({ id, name, runtime, memory, status, lastModified, invocations30d, errorRate30d, avgDurationMs }) => ({
            id, name, runtime, memory, status, lastModified, invocations30d, errorRate30d, avgDurationMs
        }));
    },
    async getFunctionDetails(id: string): Promise<FunctionDetails | null> {
        await sleep(750);
        const func = MOCK_FUNCTIONS_DB.find(f => f.id === id);
        return func ? { ...func, latestLogs: generateMockLogs(50) } : null; // Refresh logs on fetch
    },
    async updateFunction(id: string, updates: Partial<FunctionDetails>): Promise<FunctionDetails> {
        await sleep(1000);
        let func = MOCK_FUNCTIONS_DB.find(f => f.id === id);
        if (!func) throw new Error("Function not found");
        func = { ...func, ...updates, lastModified: new Date().toISOString() };
        MOCK_FUNCTIONS_DB = MOCK_FUNCTIONS_DB.map(f => f.id === id ? func! : f);
        return func;
    },
    async invokeFunction(id: string, payload: object): Promise<{ statusCode: number; body: string; logs: LogEntry[] }> {
        await sleep(getRandomInt(50, 500));
        console.log(`Invoking function ${id} with payload:`, payload);
        const success = Math.random() > 0.1; // 10% chance of failure
        const logs = generateMockLogs(5);
        if (success) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Invocation successful", receivedPayload: payload }),
                logs
            };
        } else {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Invocation failed: Internal server error" }),
                logs
            };
        }
    },
    async getFunctionLogs(id: string, page: number = 1): Promise<LogEntry[]> {
        await sleep(400);
        // just generate new logs for simulation
        return generateMockLogs(50);
    },
     async createFunction(data: Omit<FunctionDetails, 'id' | 'lastModified' | 'deployments' | 'monthlyInvocationData' | 'memoryUsageData' | 'latestLogs'>): Promise<FunctionDetails> {
        await sleep(1200);
        const newFunc: FunctionDetails = {
            ...data,
            id: generateId(),
            status: 'Building',
            lastModified: new Date().toISOString(),
            invocations30d: 0,
            errorRate30d: 0,
            avgDurationMs: 0,
            deployments: [],
            monthlyInvocationData: [],
            memoryUsageData: [],
            latestLogs: [],
        };
        MOCK_FUNCTIONS_DB.unshift(newFunc);

        // Simulate build process
        setTimeout(() => {
            this.updateFunction(newFunc.id, { status: 'Active' });
        }, 5000);

        return newFunc;
    },
    async deleteFunction(id: string): Promise<{ success: boolean }> {
        await sleep(800);
        const initialLength = MOCK_FUNCTIONS_DB.length;
        MOCK_FUNCTIONS_DB = MOCK_FUNCTIONS_DB.filter(f => f.id !== id);
        return { success: MOCK_FUNCTIONS_DB.length < initialLength };
    }
};

// --- END: MOCK API SERVICE ---


// --- START: HELPER FUNCTIONS & HOOKS ---
export const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
};

export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
};

export const useToasts = () => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const addToast = (message: string, type: ToastMessage['type'] = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    };
    return { toasts, addToast };
};
// --- END: HELPER FUNCTIONS & HOOKS ---


// --- START: UI COMPONENTS ---

export const Button: FC<{
    children: ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    className?: string;
    disabled?: boolean;
}> = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
    const baseClasses = 'px-4 py-2 rounded-md font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200';
    const variantClasses = {
        primary: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        secondary: 'bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500',
        danger: 'bg-red-800 text-red-100 hover:bg-red-900 focus:ring-red-700',
    };
    const disabledClasses = 'disabled:opacity-50 disabled:cursor-not-allowed';

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
        >
            {children}
        </button>
    );
};

export const Modal: FC<{ isOpen: boolean; onClose: () => void; title: string; children: ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

export const ToastContainer: FC<{ toasts: ToastMessage[] }> = ({ toasts }) => (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
            <div key={toast.id} className={`p-4 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
                {toast.message}
            </div>
        ))}
    </div>
);


export const FunctionMetricsDashboard: FC<{ stats: {
    totalFunctions: number;
    totalExecutions: number;
    errorRate: number;
    avgDuration: number;
} }> = ({ stats }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center">
            <p className="text-3xl font-bold text-white">{stats.totalFunctions}</p>
            <p className="text-sm text-gray-400 mt-1">Functions</p>
        </Card>
        <Card className="text-center">
            <p className="text-3xl font-bold text-white">{formatNumber(stats.totalExecutions)}</p>
            <p className="text-sm text-gray-400 mt-1">Executions (30d)</p>
        </Card>
        <Card className="text-center">
            <p className="text-3xl font-bold text-white">{(stats.errorRate * 100).toFixed(2)}%</p>
            <p className="text-sm text-gray-400 mt-1">Error Rate</p>
        </Card>
        <Card className="text-center">
            <p className="text-3xl font-bold text-white">{stats.avgDuration.toFixed(0)}ms</p>
            <p className="text-sm text-gray-400 mt-1">Avg. Duration</p>
        </Card>
    </div>
);

export const ExecutionPerformanceCharts: FC = () => {
    const executionDurationData = [
        { name: 'Mon', duration: 120, invocations: 350000 }, { name: 'Tue', duration: 125, invocations: 375000 }, { name: 'Wed', duration: 110, invocations: 320000 },
        { name: 'Thu', duration: 135, invocations: 410000 }, { name: 'Fri', duration: 140, invocations: 450000 }, { name: 'Sat', duration: 100, invocations: 280000 },
        { name: 'Sun', duration: 95, invocations: 250000 },
    ];
    
    const runtimeDistributionData = useMemo(() => {
        const counts = MOCK_FUNCTIONS_DB.reduce((acc, func) => {
            acc[func.runtime] = (acc[func.runtime] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, []);

    const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card title="Average Execution Duration (ms)" className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={executionDurationData}>
                        <defs><linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient></defs>
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                        <Area type="monotone" dataKey="duration" stroke="#ef4444" fill="url(#colorDuration)" name="Duration (ms)" />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>
            <Card title="Runtime Distribution">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={runtimeDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8">
                            {runtimeDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};

const getStatusColor = (status: FunctionStatus) => {
    switch (status) {
        case 'Active': return 'text-green-400';
        case 'Inactive': return 'text-gray-500';
        case 'Building': return 'text-blue-400';
        case 'Error': return 'text-red-500';
        default: return 'text-gray-400';
    }
};

export const FunctionList: FC<{ 
    functions: FunctionSummary[]; 
    onSelectFunction: (id: string) => void; 
}> = ({ functions, onSelectFunction }) => {
    const [filter, setFilter] = useState('');
    const [sortKey, setSortKey] = useState<keyof FunctionSummary>('lastModified');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredFunctions = useMemo(() => {
        return functions.filter(f => f.name.toLowerCase().includes(filter.toLowerCase()));
    }, [functions, filter]);

    const sortedFunctions = useMemo(() => {
        return [...filteredFunctions].sort((a, b) => {
            const valA = a[sortKey];
            const valB = b[sortKey];
            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredFunctions, sortKey, sortOrder]);
    
    const paginatedFunctions = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedFunctions.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedFunctions, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(sortedFunctions.length / itemsPerPage);

    const handleSort = (key: keyof FunctionSummary) => {
        if (sortKey === key) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };
    
    const SortIcon = ({ columnKey }: { columnKey: keyof FunctionSummary }) => {
        if (sortKey !== columnKey) return null;
        return sortOrder === 'asc' ? <IconChevronUp className="w-4 h-4 inline-block ml-1" /> : <IconChevronDown className="w-4 h-4 inline-block ml-1" />;
    };
    
    const renderPagination = () => (
        <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1}-
                {Math.min(currentPage * itemsPerPage, sortedFunctions.length)} of {sortedFunctions.length}
            </span>
            <div className="flex gap-2">
                <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} variant="secondary">Previous</Button>
                <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} variant="secondary">Next</Button>
            </div>
        </div>
    );

    const columns: { key: keyof FunctionSummary; label: string; sortable: boolean }[] = [
        { key: 'name', label: 'Function Name', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'runtime', label: 'Runtime', sortable: true },
        { key: 'memory', label: 'Memory', sortable: true },
        { key: 'invocations30d', label: 'Invocations (30d)', sortable: true },
        { key: 'errorRate30d', label: 'Error Rate', sortable: true },
        { key: 'avgDurationMs', label: 'Avg. Duration', sortable: true },
        { key: 'lastModified', label: 'Last Modified', sortable: true },
    ];
    
    return (
        <Card title="Functions">
            <input
                type="text"
                placeholder="Filter by name..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="w-full p-2 mb-4 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            {columns.map(col => (
                                <th key={col.key} scope="col" className="px-6 py-3 cursor-pointer" onClick={() => col.sortable && handleSort(col.key)}>
                                    {col.label} {col.sortable && <SortIcon columnKey={col.key} />}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedFunctions.map(func => (
                            <tr key={func.id} className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer" onClick={() => onSelectFunction(func.id)}>
                                <td className="px-6 py-4 font-mono text-white">{func.name}</td>
                                <td className="px-6 py-4"><span className={`${getStatusColor(func.status)}`}>{func.status}</span></td>
                                <td className="px-6 py-4">{func.runtime}</td>
                                <td className="px-6 py-4">{func.memory}</td>
                                <td className="px-6 py-4 text-right">{formatNumber(func.invocations30d)}</td>
                                <td className="px-6 py-4 text-right">{(func.errorRate30d * 100).toFixed(3)}%</td>
                                <td className="px-6 py-4 text-right">{func.avgDurationMs}ms</td>
                                <td className="px-6 py-4">{formatDate(func.lastModified)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {paginatedFunctions.length === 0 && <p className="text-center py-8 text-gray-500">No functions match your filter.</p>}
            {renderPagination()}
        </Card>
    );
};

// ... More components for the FunctionDetailView
export const FunctionDetailOverview: FC<{func: FunctionDetails}> = ({ func }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Invocations vs Errors (Last 12 Months)">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={func.monthlyInvocationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                    <Legend />
                    <Bar dataKey="invocations" fill="#3b82f6" name="Invocations" />
                    <Bar dataKey="errors" fill="#ef4444" name="Errors" />
                </BarChart>
            </ResponsiveContainer>
        </Card>
        <Card title="Memory Usage (%)">
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={func.memoryUsageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                    <XAxis dataKey="time" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                    <Line type="monotone" dataKey="usage" stroke="#22c55e" strokeWidth={2} dot={false} name="Memory Usage"/>
                </LineChart>
            </ResponsiveContainer>
        </Card>
    </div>
);


export const FunctionLogsViewer: FC<{funcId: string; initialLogs: LogEntry[]}> = ({ funcId, initialLogs }) => {
    const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
    const [isLoading, setIsLoading] = useState(false);
    const [logLevelFilter, setLogLevelFilter] = useState<LogLevel | 'ALL'>('ALL');

    const filteredLogs = useMemo(() => {
        if (logLevelFilter === 'ALL') return logs;
        return logs.filter(log => log.level === logLevelFilter);
    }, [logs, logLevelFilter]);

    const getLogLevelColor = (level: LogLevel) => {
        switch (level) {
            case 'INFO': return 'text-blue-400';
            case 'WARN': return 'text-yellow-400';
            case 'ERROR': return 'text-red-500';
            case 'DEBUG': return 'text-gray-500';
        }
    };
    
    return (
        <Card title="Logs">
            {/* Log controls would go here */}
            <div className="bg-gray-900 rounded-md p-4 font-mono text-sm text-gray-300 h-96 overflow-y-auto">
                {filteredLogs.map((log, index) => (
                    <div key={index} className="flex">
                        <span className="text-gray-500 mr-4">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className={`w-12 mr-4 font-bold ${getLogLevelColor(log.level)}`}>[{log.level}]</span>
                        <span>{log.message}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export const FunctionCodeEditor: FC<{ code: string; runtime: FunctionRuntime; onSave: (newCode: string) => void }> = ({ code, runtime, onSave }) => {
    const [currentCode, setCurrentCode] = useState(code);

    return (
        <Card title={`Code (${runtime})`}>
            <div className="relative">
                <textarea
                    value={currentCode}
                    onChange={(e) => setCurrentCode(e.target.value)}
                    className="w-full h-96 bg-gray-900 rounded-md p-4 font-mono text-sm text-green-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    spellCheck="false"
                />
            </div>
            <div className="mt-4 flex justify-end">
                <Button onClick={() => onSave(currentCode)}>Save and Deploy</Button>
            </div>
        </Card>
    );
};


export const DeploymentHistory: FC<{ deployments: Deployment[] }> = ({ deployments }) => (
    <Card title="Deployment History">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                    <tr>
                        <th className="px-6 py-3">Version</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Timestamp</th>
                        <th className="px-6 py-3">Author</th>
                        <th className="px-6 py-3">Commit</th>
                    </tr>
                </thead>
                <tbody>
                    {deployments.map(dep => (
                        <tr key={dep.version} className="border-b border-gray-800">
                            <td className="px-6 py-4 text-white">{dep.version}</td>
                            <td className="px-6 py-4"><span className={dep.status === 'Success' ? 'text-green-400' : 'text-red-500'}>{dep.status}</span></td>
                            <td className="px-6 py-4">{formatDate(dep.timestamp)}</td>
                            <td className="px-6 py-4">{dep.author}</td>
                            <td className="px-6 py-4 font-mono text-yellow-400">{dep.commitHash}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </Card>
);


export const FunctionDetailView: FC<{ 
    functionId: string; 
    onBack: () => void; 
    addToast: (message: string, type?: ToastMessage['type']) => void;
}> = ({ functionId, onBack, addToast }) => {
    const [func, setFunc] = useState<FunctionDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    
    useEffect(() => {
        setIsLoading(true);
        api.getFunctionDetails(functionId)
            .then(data => {
                if (data) {
                    setFunc(data);
                } else {
                    setError('Function not found.');
                }
            })
            .catch(err => setError('Failed to fetch function details.'))
            .finally(() => setIsLoading(false));
    }, [functionId]);

    const handleSaveCode = async (newCode: string) => {
        if (!func) return;
        addToast('Starting new deployment...', 'info');
        await api.updateFunction(func.id, { code: newCode });
        addToast('Deployment successful!', 'success');
        // In a real app, you'd refresh the deployment history
    };

    if (isLoading) return <div className="flex justify-center items-center h-64"><IconSpinner className="w-12 h-12 text-red-500" /></div>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (!func) return null;
    
    const tabs = ['overview', 'logs', 'code', 'deployments', 'triggers', 'settings'];

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white">
                <IconArrowLeft className="w-5 h-5" /> Back to Functions
            </button>
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-wider font-mono">{func.name}</h2>
                    <p className="text-gray-400">ID: {func.id}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary"><IconPlay className="w-4 h-4 inline-block mr-2" /> Invoke</Button>
                    <Button variant="danger"><IconTrash className="w-4 h-4 inline-block mr-2" /> Delete</Button>
                </div>
            </div>
            
            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab ? 'border-red-500 text-red-500' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="mt-6">
                {activeTab === 'overview' && <FunctionDetailOverview func={func} />}
                {activeTab === 'logs' && <FunctionLogsViewer funcId={func.id} initialLogs={func.latestLogs} />}
                {activeTab === 'code' && <FunctionCodeEditor code={func.code} runtime={func.runtime} onSave={handleSaveCode}/>}
                {activeTab === 'deployments' && <DeploymentHistory deployments={func.deployments} />}
                {activeTab === 'triggers' && <Card title="Triggers"><p className="text-gray-500">Trigger management UI coming soon.</p></Card>}
                {activeTab === 'settings' && <Card title="Settings"><p className="text-gray-500">Settings management UI coming soon.</p></Card>}
            </div>
        </div>
    );
};
// --- END: UI COMPONENTS ---


// --- START: MAIN VIEW COMPONENT ---

const DemoBankFunctionsView: React.FC = () => {
    const [view, setView] = useState<'list' | 'detail'>('list');
    const [selectedFunctionId, setSelectedFunctionId] = useState<string | null>(null);
    const [functions, setFunctions] = useState<FunctionSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toasts, addToast } = useToasts();

    useEffect(() => {
        setIsLoading(true);
        api.getFunctions()
            .then(setFunctions)
            .catch(() => setError('Failed to load functions. Please try again later.'))
            .finally(() => setIsLoading(false));
    }, []);

    const handleSelectFunction = (id: string) => {
        setSelectedFunctionId(id);
        setView('detail');
    };

    const handleBackToList = () => {
        setSelectedFunctionId(null);
        setView('list');
    };

    const dashboardStats = useMemo(() => {
        return functions.reduce((acc, func) => {
            acc.totalFunctions += 1;
            acc.totalExecutions += func.invocations30d;
            acc.totalWeightedErrorRate += func.errorRate30d * func.invocations30d;
            acc.totalWeightedDuration += func.avgDurationMs * func.invocations30d;
            return acc;
        }, { 
            totalFunctions: 0, 
            totalExecutions: 0, 
            totalWeightedErrorRate: 0,
            totalWeightedDuration: 0,
        });
    }, [functions]);
    
    const overallStats = {
        totalFunctions: dashboardStats.totalFunctions,
        totalExecutions: dashboardStats.totalExecutions,
        errorRate: dashboardStats.totalExecutions > 0 ? dashboardStats.totalWeightedErrorRate / dashboardStats.totalExecutions : 0,
        avgDuration: dashboardStats.totalExecutions > 0 ? dashboardStats.totalWeightedDuration / dashboardStats.totalExecutions : 0,
    };
    
    const renderListView = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Functions</h2>
                <Button><IconPlus className="w-5 h-5 inline-block mr-2" />Create Function</Button>
            </div>
            
            {isLoading ? (
                <div className="flex justify-center items-center h-64"><IconSpinner className="w-12 h-12 text-red-500" /></div>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : (
                <>
                    <FunctionMetricsDashboard stats={overallStats} />
                    <ExecutionPerformanceCharts />
                    <FunctionList functions={functions} onSelectFunction={handleSelectFunction} />
                </>
            )}
        </div>
    );
    
    return (
        <>
            <ToastContainer toasts={toasts} />
            {view === 'list' ? renderListView() :
                selectedFunctionId ? <FunctionDetailView functionId={selectedFunctionId} onBack={handleBackToList} addToast={addToast} /> :
                renderListView() /* Fallback */
            }
        </>
    );
};

export default DemoBankFunctionsView;