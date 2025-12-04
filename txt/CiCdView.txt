import React from 'react';
import Card from '../../Card';

// --- TYPES AND INTERFACES ---
// Comprehensive type definitions for a real-world CI/CD system.

export type BuildStatus = 'success' | 'failed' | 'running' | 'queued' | 'cancelled' | 'pending';

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Commit {
  sha: string;
  message: string;
  author: User;
  timestamp: string;
  url: string;
}

export interface Artifact {
  id: string;
  name: string;
  size: number; // in bytes
  url: string;
  expiresAt: string;
}

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
}

export interface Job {
  id: number;
  name: string;
  status: BuildStatus;
  startedAt?: string;
  finishedAt?: string;
  logs: LogEntry[];
  artifacts: Artifact[];
}

export interface Stage {
  id: number;
  name:string;
  status: BuildStatus;
  jobs: Job[];
  startedAt?: string;
  finishedAt?: string;
}

export interface Build {
  id: number;
  buildNumber: number;
  pipelineId: string;
  status: BuildStatus;
  triggeredBy: User;
  commit: Commit;
  branch: string;
  stages: Stage[];
  startedAt: string;
  finishedAt?: string;
  duration: number; // in seconds
  artifacts: Artifact[];
}

export interface Pipeline {
  id: string;
  name: string;
  repository: string;
  description: string;
  lastBuild?: Build;
  buildHistory: Build[];
  avgDuration: number; // in seconds
  successRate: number; // 0-1
  lastTriggered: string;
  isFavorite: boolean;
}

export type SortablePipelineKeys = 'name' | 'lastTriggered' | 'avgDuration' | 'successRate';
export type SortDirection = 'asc' | 'desc';


// --- CONSTANTS ---
// Centralized constants for styling, configuration, and icons.

export const STATUS_DETAILS: { [key in BuildStatus]: { color: string; bgColor: string; text: string; icon: JSX.Element } } = {
    success: { color: 'text-green-400', bgColor: 'bg-green-900/50', text: 'Success', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /> },
    failed: { color: 'text-red-400', bgColor: 'bg-red-900/50', text: 'Failed', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> },
    running: { color: 'text-blue-400', bgColor: 'bg-blue-900/50', text: 'Running', icon: <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /> }, // Placeholder, would be a spinner
    queued: { color: 'text-yellow-400', bgColor: 'bg-yellow-900/50', text: 'Queued', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    cancelled: { color: 'text-gray-400', bgColor: 'bg-gray-700/50', text: 'Cancelled', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /> },
    pending: { color: 'text-gray-500', bgColor: 'bg-gray-800/50', text: 'Pending', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
};


// --- MOCK DATA GENERATION ---
// Simulates a realistic data source for the CI/CD dashboard.

const MOCK_USERS: User[] = [
    { id: 'u1', name: 'Alice Johnson', avatarUrl: 'https://i.pravatar.cc/150?u=alice' },
    { id: 'u2', name: 'Bob Williams', avatarUrl: 'https://i.pravatar.cc/150?u=bob' },
    { id: 'u3', name: 'Charlie Brown', avatarUrl: 'https://i.pravatar.cc/150?u=charlie' },
    { id: 'u4', name: 'Diana Prince', avatarUrl: 'https://i.pravatar.cc/150?u=diana' },
];

const MOCK_COMMIT_MESSAGES = [
    'feat: Implement user authentication', 'fix: Correct layout issue on mobile', 'docs: Update README with setup instructions', 'refactor: Simplify API data fetching logic', 'chore: Upgrade dependencies to latest versions', 'test: Add unit tests for payment service', 'revert: Revert previous commit due to bug', 'style: Format code with Prettier',
];

const randomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateMockData = (pipelineCount: number = 25, buildsPerPipeline: number = 50): Pipeline[] => {
    const pipelines: Pipeline[] = [];
    for (let i = 1; i <= pipelineCount; i++) {
        const buildHistory: Build[] = [];
        let totalDuration = 0;
        let successCount = 0;

        for (let j = 1; j <= buildsPerPipeline; j++) {
            const status: BuildStatus = randomElement(['success', 'success', 'success', 'success', 'failed', 'running', 'cancelled']);
            const user = randomElement(MOCK_USERS);
            const startedAt = new Date(Date.now() - (buildsPerPipeline - j) * 86400000 - randomInt(0, 80000000)).toISOString();
            
            const stages: Stage[] = [
                { id: 1, name: 'Build', status: 'success', jobs: [{ id: 1, name: 'Compile', status: 'success', logs: [], artifacts: [] }] },
                { id: 2, name: 'Test', status: 'success', jobs: [{ id: 1, name: 'Unit Tests', status: 'success', logs: [], artifacts: [] }, { id: 2, name: 'Integration Tests', status: 'success', logs: [], artifacts: [] }] },
                { id: 3, name: 'Deploy', status: status, jobs: [{ id: 1, name: `Deploy to ${randomElement(['Staging', 'Production'])}`, status: status, logs: [], artifacts: [] }] }
            ];

            let build: Build = {
                id: (i * 1000) + j,
                buildNumber: buildsPerPipeline - j + 1,
                pipelineId: `pipeline-${i}`,
                status: j === 1 ? 'running' : status, // Make the latest one running sometimes
                triggeredBy: user,
                commit: {
                    sha: (Math.random() + 1).toString(36).substring(2, 9),
                    message: randomElement(MOCK_COMMIT_MESSAGES),
                    author: user,
                    timestamp: new Date(new Date(startedAt).getTime() - 3600000).toISOString(),
                    url: 'http://example.com/commit/sha'
                },
                branch: randomElement(['main', 'develop', 'feature/new-login-flow']),
                stages: stages,
                startedAt,
                duration: 0,
                artifacts: [],
            };
            
            if (build.status !== 'running' && build.status !== 'queued') {
                const duration = randomInt(120, 900);
                build.duration = duration;
                build.finishedAt = new Date(new Date(startedAt).getTime() + duration * 1000).toISOString();
                totalDuration += duration;
                if (build.status === 'success') successCount++;
            }
            
            buildHistory.push(build);
        }

        pipelines.push({
            id: `pipeline-${i}`,
            name: `Project ${String.fromCharCode(65 + i)} Service`,
            repository: `org/project-${String.fromCharCode(65 + i).toLowerCase()}`,
            description: `Manages the build and deployment for the Project ${String.fromCharCode(65 + i)} primary service.`,
            lastBuild: buildHistory[buildHistory.length - 1],
            buildHistory: buildHistory.reverse(), // Newest first
            avgDuration: totalDuration / (buildsPerPipeline || 1),
            successRate: successCount / (buildsPerPipeline || 1),
            lastTriggered: buildHistory[0].startedAt,
            isFavorite: Math.random() > 0.8,
        });
    }
    return pipelines;
};

const MOCK_PIPELINES = generateMockData();

// --- API SIMULATION ---
// This simulates fetching data from a backend API with artificial latency.

export const mockApi = {
    fetchPipelines: (): Promise<Pipeline[]> => {
        console.log('API: Fetching all pipelines...');
        return new Promise(resolve => setTimeout(() => resolve(MOCK_PIPELINES), 500));
    },
    fetchPipelineById: (id: string): Promise<Pipeline | undefined> => {
        console.log(`API: Fetching pipeline with id ${id}...`);
        return new Promise(resolve => setTimeout(() => resolve(MOCK_PIPELINES.find(p => p.id === id)), 300));
    },
    fetchBuildById: (pipelineId: string, buildId: number): Promise<Build | undefined> => {
        console.log(`API: Fetching build ${buildId} for pipeline ${pipelineId}...`);
        const pipeline = MOCK_PIPELINES.find(p => p.id === pipelineId);
        const build = pipeline?.buildHistory.find(b => b.id === buildId);
        return new Promise(resolve => setTimeout(() => resolve(build), 400));
    },
    fetchJobLogs: (jobId: number): Promise<LogEntry[]> => {
        console.log(`API: Fetching logs for job ${jobId}...`);
        const logs: LogEntry[] = [];
        for (let i = 0; i < 200; i++) {
            logs.push({
                timestamp: new Date(Date.now() - (200 - i) * 100).toISOString(),
                level: randomElement(['INFO', 'INFO', 'INFO', 'DEBUG', 'WARN', 'ERROR']),
                message: `Log line ${i + 1}: ${randomElement(MOCK_COMMIT_MESSAGES)}`,
            });
        }
        return new Promise(resolve => setTimeout(() => resolve(logs), 600));
    },
    triggerPipelineRun: (pipelineId: string): Promise<Build> => {
        console.log(`API: Triggering run for pipeline ${pipelineId}...`);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const pipeline = MOCK_PIPELINES.find(p => p.id === pipelineId);
                if (!pipeline) return reject(new Error('Pipeline not found'));
                
                const newBuild: Build = {
                    id: Math.floor(Math.random() * 100000),
                    buildNumber: (pipeline.lastBuild?.buildNumber || 0) + 1,
                    pipelineId: pipeline.id,
                    status: 'queued',
                    triggeredBy: MOCK_USERS[0],
                    commit: pipeline.lastBuild?.commit || { sha: 'abcdef', message: 'Manual trigger', author: MOCK_USERS[0], timestamp: new Date().toISOString(), url: '#' },
                    branch: pipeline.lastBuild?.branch || 'main',
                    stages: [],
                    startedAt: new Date().toISOString(),
                    duration: 0,
                    artifacts: []
                };
                
                pipeline.buildHistory.unshift(newBuild);
                pipeline.lastBuild = newBuild;
                
                resolve(newBuild);
            }, 700);
        });
    }
};


// --- UTILITY/HELPER FUNCTIONS ---
// Common functions used across multiple components.

export function formatDuration(seconds: number): string {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
}

export function timeAgo(dateInput: string | Date): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} years ago`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} months ago`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} days ago`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} hours ago`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} minutes ago`;
    return `${Math.floor(seconds)} seconds ago`;
}

// --- UI HELPER & ATOMIC COMPONENTS ---
// Small, reusable components that form the building blocks of the UI.

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-16 h-16',
    };
    return (
        <div className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 ${sizeClasses[size]}`}></div>
    );
};

export const StatusPill: React.FC<{ status: BuildStatus; showText?: boolean }> = ({ status, showText = true }) => {
    const { color, bgColor, text, icon } = STATUS_DETAILS[status];
    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${color}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {icon}
            </svg>
            {showText && <span>{text}</span>}
        </div>
    );
};

export const ErrorMessage: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
    <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative text-center" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{message}</span>
        {onRetry && (
            <button onClick={onRetry} className="ml-4 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded">
                Retry
            </button>
        )}
    </div>
);

export const Tooltip: React.FC<{ content: React.ReactNode; children: React.ReactNode }> = ({ content, children }) => (
    <div className="relative group flex items-center">
        {children}
        <div className="absolute bottom-full mb-2 w-max px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
            {content}
            <div className="tooltip-arrow" data-popper-arrow></div>
        </div>
    </div>
);

export const Tab: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ease-in-out border-b-2
            ${isActive ? 'border-blue-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}
    >
        {label}
    </button>
);

// --- LARGER UI COMPONENTS ---
// More complex components that compose the different views of the dashboard.

export const LogViewer: React.FC<{ jobId: number }> = ({ jobId }) => {
    const [logs, setLogs] = React.useState<LogEntry[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [searchTerm, setSearchTerm] = React.useState('');
    const logContainerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        setIsLoading(true);
        mockApi.fetchJobLogs(jobId)
            .then(data => {
                setLogs(data);
                setError(null);
            })
            .catch(() => setError("Failed to fetch logs."))
            .finally(() => setIsLoading(false));
    }, [jobId]);
    
    React.useEffect(() => {
        if(logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);
    
    const filteredLogs = logs.filter(log => log.message.toLowerCase().includes(searchTerm.toLowerCase()));

    const getLogLineColor = (level: LogEntry['level']) => {
        switch(level) {
            case 'ERROR': return 'text-red-400';
            case 'WARN': return 'text-yellow-400';
            case 'DEBUG': return 'text-gray-500';
            default: return 'text-gray-300';
        }
    };

    return (
        <div className="bg-gray-900 rounded-lg p-4 h-[600px] flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-semibold text-white">Job Logs</h4>
                <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="bg-gray-800 border border-gray-600 rounded-md px-2 py-1 text-sm text-white"
                />
            </div>
            <div ref={logContainerRef} className="flex-grow overflow-y-auto font-mono text-xs bg-black p-2 rounded">
                {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                {error && <ErrorMessage message={error} />}
                {!isLoading && !error && filteredLogs.map((log, index) => (
                    <div key={index} className="flex">
                        <span className="text-gray-600 mr-4">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className={`mr-2 font-bold ${getLogLineColor(log.level)}`}>[{log.level}]</span>
                        <span className={getLogLineColor(log.level)}>{log.message}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const BuildStagesView: React.FC<{ stages: Stage[] }> = ({ stages }) => {
    if (stages.length === 0) {
        return <div className="text-gray-400 text-center py-8">No stages have started for this build.</div>;
    }
    
    return (
        <div className="flex space-x-4 overflow-x-auto p-4">
            {stages.map((stage, index) => (
                <React.Fragment key={stage.id}>
                    <div className="flex-shrink-0 w-64">
                        <Card title={stage.name}>
                            <div className="flex flex-col space-y-2">
                                <StatusPill status={stage.status} />
                                {stage.jobs.map(job => (
                                    <div key={job.id} className="bg-gray-800 p-2 rounded-md flex justify-between items-center">
                                        <span className="text-sm">{job.name}</span>
                                        <StatusPill status={job.status} showText={false} />
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                    {index < stages.length - 1 && (
                        <div className="flex items-center">
                            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export const BuildDetailsView: React.FC<{ pipelineId: string, buildId: number, onBack: () => void }> = ({ pipelineId, buildId, onBack }) => {
    const [build, setBuild] = React.useState<Build | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [activeTab, setActiveTab] = React.useState<'stages' | 'logs' | 'artifacts'>('stages');

    React.useEffect(() => {
        setIsLoading(true);
        mockApi.fetchBuildById(pipelineId, buildId)
            .then(data => {
                if (data) {
                    setBuild(data);
                    setError(null);
                } else {
                    setError("Build not found.");
                }
            })
            .catch(() => setError("Failed to fetch build details."))
            .finally(() => setIsLoading(false));
    }, [pipelineId, buildId]);

    if (isLoading) return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
    if (error) return <ErrorMessage message={error} />;
    if (!build) return <div className="text-center p-8">Build data is unavailable.</div>;
    
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <button onClick={onBack} className="text-blue-400 hover:text-blue-300 mb-2">&larr; Back to Pipeline</button>
                    <h2 className="text-3xl font-bold text-white">Build #{build.buildNumber}</h2>
                    <p className="text-gray-400">{build.commit.message}</p>
                </div>
                <StatusPill status={build.status} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <Card title="Details">
                    <p><strong>Branch:</strong> {build.branch}</p>
                    <p><strong>Triggered By:</strong> {build.triggeredBy.name}</p>
                    <p><strong>Started:</strong> {timeAgo(build.startedAt)}</p>
                    <p><strong>Duration:</strong> {build.status === 'running' ? 'In progress...' : formatDuration(build.duration)}</p>
                </Card>
                <Card title="Commit">
                    <p><strong>SHA:</strong> <a href={build.commit.url} className="text-blue-400 hover:underline">{build.commit.sha}</a></p>
                    <p><strong>Author:</strong> {build.commit.author.name}</p>
                    <p><strong>Timestamp:</strong> {new Date(build.commit.timestamp).toLocaleString()}</p>
                </Card>
                <div className="flex flex-col space-y-2">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">Re-run Build</button>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded w-full">View Raw Logs</button>
                </div>
            </div>

            <div>
                <div className="border-b border-gray-700">
                    <nav className="-mb-px flex space-x-4">
                        <Tab label="Stages" isActive={activeTab === 'stages'} onClick={() => setActiveTab('stages')} />
                        <Tab label="Logs" isActive={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
                        <Tab label="Artifacts" isActive={activeTab === 'artifacts'} onClick={() => setActiveTab('artifacts')} />
                    </nav>
                </div>
                <div className="mt-4">
                    {activeTab === 'stages' && <BuildStagesView stages={build.stages} />}
                    {activeTab === 'logs' && <LogViewer jobId={build.stages[0]?.jobs[0]?.id || 1} />}
                    {activeTab === 'artifacts' && (
                        <Card title="Build Artifacts">
                            {build.artifacts.length > 0 ? (
                                <ul>
                                    {build.artifacts.map(art => <li key={art.id}>{art.name}</li>)}
                                </ul>
                            ) : <p className="text-gray-400">No artifacts were produced by this build.</p>}
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};


export const PipelineDetailsView: React.FC<{ pipelineId: string; onBack: () => void; onSelectBuild: (buildId: number) => void }> = ({ pipelineId, onBack, onSelectBuild }) => {
    const [pipeline, setPipeline] = React.useState<Pipeline | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [isTriggering, setIsTriggering] = React.useState(false);
    
    const fetchPipeline = React.useCallback(() => {
        setIsLoading(true);
        mockApi.fetchPipelineById(pipelineId)
            .then(data => {
                if (data) {
                    setPipeline(data);
                    setError(null);
                } else {
                    setError("Pipeline not found.");
                }
            })
            .catch(() => setError("Failed to fetch pipeline details."))
            .finally(() => setIsLoading(false));
    }, [pipelineId]);
    
    React.useEffect(() => {
        fetchPipeline();
    }, [fetchPipeline]);

    const handleTriggerRun = () => {
        setIsTriggering(true);
        mockApi.triggerPipelineRun(pipelineId)
            .then(() => {
                // In a real app, you might use websockets to get updates.
                // Here we just re-fetch after a short delay.
                setTimeout(fetchPipeline, 1000);
            })
            .catch(err => alert(`Error: ${err.message}`))
            .finally(() => setIsTriggering(false));
    };

    if (isLoading) return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
    if (error) return <ErrorMessage message={error} onRetry={fetchPipeline} />;
    if (!pipeline) return <div className="text-center p-8">Pipeline data is unavailable.</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <button onClick={onBack} className="text-blue-400 hover:text-blue-300 mb-2">&larr; All Pipelines</button>
                    <h2 className="text-3xl font-bold text-white">{pipeline.name}</h2>
                    <p className="text-gray-400">{pipeline.description}</p>
                    <a href={pipeline.repository} className="text-sm text-blue-400 hover:underline">{pipeline.repository}</a>
                </div>
                <button 
                    onClick={handleTriggerRun} 
                    disabled={isTriggering}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                >
                    {isTriggering ? <LoadingSpinner size="sm" /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>}
                    Trigger Run
                </button>
            </div>
            
            <Card title="Build History">
                <table className="w-full text-left text-sm">
                    <thead className="text-gray-400 border-b border-gray-700">
                        <tr>
                            <th className="py-2 px-4">Status</th>
                            <th className="py-2 px-4">Build</th>
                            <th className="py-2 px-4">Commit</th>
                            <th className="py-2 px-4">Branch</th>
                            <th className="py-2 px-4">Duration</th>
                            <th className="py-2 px-4">Triggered</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {pipeline.buildHistory.map(build => (
                            <tr key={build.id} onClick={() => onSelectBuild(build.id)} className="hover:bg-gray-800/50 cursor-pointer">
                                <td className="py-3 px-4"><StatusPill status={build.status} /></td>
                                <td className="py-3 px-4">
                                    <div className="font-medium text-white">#{build.buildNumber}</div>
                                    <div className="text-gray-400">by {build.triggeredBy.name}</div>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="text-white truncate max-w-xs">{build.commit.message}</div>
                                    <div className="text-gray-500 font-mono">{build.commit.sha}</div>
                                </td>
                                <td className="py-3 px-4 text-gray-300">{build.branch}</td>
                                <td className="py-3 px-4 text-gray-300">{formatDuration(build.duration)}</td>
                                <td className="py-3 px-4 text-gray-300">{timeAgo(build.startedAt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export const PipelineList: React.FC<{ pipelines: Pipeline[]; onSelectPipeline: (id: string) => void }> = ({ pipelines, onSelectPipeline }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pipelines.map(pipeline => (
                <div key={pipeline.id} onClick={() => onSelectPipeline(pipeline.id)} className="cursor-pointer">
                    <Card title={pipeline.name} isHoverable={true}>
                        <div className="space-y-3">
                            <p className="text-gray-400 text-sm h-10">{pipeline.description}</p>
                            {pipeline.lastBuild && <StatusPill status={pipeline.lastBuild.status} />}
                            <div className="text-xs text-gray-500 space-y-1">
                                <p>Last run: {timeAgo(pipeline.lastTriggered)}</p>
                                <p>Avg Duration: {formatDuration(pipeline.avgDuration)}</p>
                                <p>Success Rate: {(pipeline.successRate * 100).toFixed(1)}%</p>
                            </div>
                        </div>
                    </Card>
                </div>
            ))}
        </div>
    );
};

export const CiCdDashboardMetrics: React.FC<{ pipelines: Pipeline[] }> = ({ pipelines }) => {
    const totalBuilds = pipelines.reduce((sum, p) => sum + p.buildHistory.length, 0);
    const runningBuilds = pipelines.reduce((sum, p) => sum + (p.lastBuild?.status === 'running' ? 1 : 0), 0);
    const failedLast24h = pipelines.reduce((sum, p) => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return sum + p.buildHistory.filter(b => b.status === 'failed' && new Date(b.startedAt) > yesterday).length;
    }, 0);
    const overallSuccessRate = pipelines.reduce((sum, p) => sum + p.successRate, 0) / pipelines.length;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card title="Total Pipelines"><p className="text-3xl font-bold">{pipelines.length}</p></Card>
            <Card title="Builds Running"><p className="text-3xl font-bold text-blue-400">{runningBuilds}</p></Card>
            <Card title="Failed (24h)"><p className="text-3xl font-bold text-red-400">{failedLast24h}</p></Card>
            <Card title="Avg. Success Rate"><p className="text-3xl font-bold text-green-400">{(overallSuccessRate * 100).toFixed(1)}%</p></Card>
        </div>
    );
};


// --- MAIN VIEW COMPONENT ---
// The primary component that orchestrates the entire CI/CD view.

const CiCdView: React.FC = () => {
    const [pipelines, setPipelines] = React.useState<Pipeline[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);
    
    // View state management
    const [currentView, setCurrentView] = React.useState<'dashboard' | 'pipeline_details' | 'build_details'>('dashboard');
    const [selectedPipelineId, setSelectedPipelineId] = React.useState<string | null>(null);
    const [selectedBuildId, setSelectedBuildId] = React.useState<number | null>(null);

    // Filtering and sorting state for the dashboard
    const [searchTerm, setSearchTerm] = React.useState('');
    const [sortBy, setSortBy] = React.useState<SortablePipelineKeys>('lastTriggered');
    const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc');

    React.useEffect(() => {
        setIsLoading(true);
        mockApi.fetchPipelines()
            .then(data => {
                setPipelines(data);
                setError(null);
            })
            .catch(() => setError('Could not fetch pipeline data. Please try again later.'))
            .finally(() => setIsLoading(false));
    }, []);

    const handleSelectPipeline = (pipelineId: string) => {
        setSelectedPipelineId(pipelineId);
        setCurrentView('pipeline_details');
    };

    const handleSelectBuild = (buildId: number) => {
        setSelectedBuildId(buildId);
        setCurrentView('build_details');
    };

    const handleBackToDashboard = () => {
        setSelectedPipelineId(null);
        setSelectedBuildId(null);
        setCurrentView('dashboard');
    };
    
    const handleBackToPipeline = () => {
        setSelectedBuildId(null);
        setCurrentView('pipeline_details');
    };

    const sortedAndFilteredPipelines = React.useMemo(() => {
        return pipelines
            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.repository.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => {
                let compareA = a[sortBy];
                let compareB = b[sortBy];
                if (sortBy === 'name') {
                    return sortDirection === 'asc' ? (compareA as string).localeCompare(compareB as string) : (compareB as string).localeCompare(compareA as string);
                }
                if (sortDirection === 'asc') {
                    return (compareA as number) - (compareB as number);
                } else {
                    return (compareB as number) - (compareA as number);
                }
            });
    }, [pipelines, searchTerm, sortBy, sortDirection]);

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center p-20"><LoadingSpinner size="lg" /></div>;
        }

        if (error) {
            return <ErrorMessage message={error} />;
        }
        
        switch (currentView) {
            case 'pipeline_details':
                return selectedPipelineId && <PipelineDetailsView pipelineId={selectedPipelineId} onBack={handleBackToDashboard} onSelectBuild={handleSelectBuild} />;
            case 'build_details':
                return selectedPipelineId && selectedBuildId && <BuildDetailsView pipelineId={selectedPipelineId} buildId={selectedBuildId} onBack={handleBackToPipeline} />;
            case 'dashboard':
            default:
                return (
                    <>
                        <p className="text-gray-400 mb-6">A view for monitoring the status of all continuous integration and deployment pipelines across the organization.</p>
                        <CiCdDashboardMetrics pipelines={pipelines} />
                        <div className="mb-4 flex items-center justify-between">
                            <input
                                type="text"
                                placeholder="Filter pipelines..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
                            />
                            {/* Sorting controls could be added here */}
                        </div>
                        <PipelineList pipelines={sortedAndFilteredPipelines} onSelectPipeline={handleSelectPipeline} />
                    </>
                );
        }
    };

    return (
        <Card title="CI/CD Pipelines">
            {renderContent()}
        </Card>
    );
};

export default CiCdView;