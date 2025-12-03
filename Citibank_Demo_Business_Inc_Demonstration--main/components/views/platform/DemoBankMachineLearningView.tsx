import React, { useState, useMemo, useCallback, useEffect, useRef, FC } from 'react';
import Card from '../../Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter, ZAxis, LineChart, Line, CartesianGrid, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { v4 as uuidv4 } from 'uuid';

// --- EXISTING DATA (KEPT FOR COMPATIBILITY) ---

const trainingRunsData = [
    { name: 'Mon', runs: 5 }, { name: 'Tue', runs: 8 }, { name: 'Wed', runs: 6 },
    { name: 'Thu', runs: 12 }, { name: 'Fri', runs: 10 }, { name: 'Sat', runs: 3 }, { name: 'Sun', runs: 4 },
];

const experimentAccuracyData = [
    { experiment: 1, accuracy: 92.1, params: 1.2 },
    { experiment: 2, accuracy: 93.5, params: 1.5 },
    { experiment: 3, accuracy: 93.2, params: 1.4 },
    { experiment: 4, accuracy: 94.8, params: 2.1 },
    { experiment: 5, accuracy: 94.5, params: 2.0 },
];

const registeredModels = [
    { id: 1, name: 'fraud-detection', version: 3, stage: 'Production' },
    { id: 2, name: 'fraud-detection', version: 4, stage: 'Staging' },
    { id: 3, name: 'churn-predictor', version: 2, stage: 'Production' },
    { id: 4, name: 'product-recommender', version: 1, stage: 'Archived' },
];


// --- START OF NEW CODE ---
// --- ENHANCED TYPES AND INTERFACES FOR A REAL-WORLD APPLICATION ---

export type ModelStage = 'Production' | 'Staging' | 'Archived' | 'None';
export type RunStatus = 'Completed' | 'Failed' | 'Running';
export type DeploymentStatus = 'Online' | 'Offline' | 'Error' | 'Updating';
export type FeatureType = 'Numerical' | 'Categorical' | 'Text' | 'Timestamp';
export type AlertSeverity = 'Critical' | 'Warning' | 'Info';

export interface Artifact {
    name: string;
    path: string;
    sizeMB: number;
    type: 'model' | 'dataset' | 'image' | 'log' | 'other';
}

export interface Metric {
    key: string;
    value: number;
    step: number;
}

export interface Parameter {
    key:string;
    value: string | number | boolean;
}

export interface TrainingRun {
    id: string;
    experimentId: string;
    experimentName: string;
    startTime: Date;
    endTime?: Date;
    durationSeconds?: number;
    status: RunStatus;
    metrics: Record<string, number>;
    params: Record<string, string | number | boolean>;
    tags: Record<string, string>;
    artifacts: Artifact[];
    sourceCode: {
        gitRepoUrl: string;
        commitHash: string;
    };
}

export interface ModelVersion {
    id: string;
    name: string;
    version: number;
    description: string;
    creationTimestamp: Date;
    lastUpdatedTimestamp: Date;
    stage: ModelStage;
    runId: string;
    metrics: Record<string, number>;
    tags: Record<string, string>;
}

export interface RegisteredModel {
    name: string;
    description: string;
    creationTimestamp: Date;
    lastUpdatedTimestamp: Date;
    versions: ModelVersion[];
}

export interface Deployment {
    id: string;
    modelName: string;
    modelVersion: number;
    endpoint: string;
    status: DeploymentStatus;
    creationTimestamp: Date;
    instanceType: string;
    replicas: number;
    trafficSplit: number; // Percentage
    monitoring: {
        latencyP95: number;
        requestsPerSecond: number;
        errorRate: number;
    };
}

export interface Feature {
    id: string;
    name: string;
    description: string;
    featureType: FeatureType;
    creationTimestamp: Date;
    lastUpdatedTimestamp: Date;
    source: string;
    freshness: string; // e.g., '1h', '24h'
    version: number;
}

export interface MLOpsAlert {
    id: string;
    title: string;
    message: string;
    severity: AlertSeverity;
    timestamp: Date;
    relatedEntity: {
        type: 'Model' | 'Deployment' | 'Feature';
        id: string;
    };
    acknowledged: boolean;
}

// --- MOCK DATA GENERATION ---

const MODEL_NAMES = ['fraud-detection', 'churn-predictor', 'product-recommender', 'credit-scoring', 'loan-approval'];
const USER_NAMES = ['ml.team', 'jane.smith', 'john.doe', 'data.science', 'ops.team'];
const GIT_REPOS = [
    'https://github.com/demobank/fraud-model',
    'https://github.com/demobank/customer-analytics',
    'https://github.com/demobank/recommendation-engine'
];

/**
 * Generates a list of mock training runs for experiments.
 * @param count - The number of training runs to generate.
 * @returns An array of mock TrainingRun objects.
 */
export const generateMockTrainingRuns = (count: number): TrainingRun[] => {
    const runs: TrainingRun[] = [];
    for (let i = 0; i < count; i++) {
        const startTime = new Date(Date.now() - Math.random() * 1000 * 3600 * 24 * 30);
        const duration = Math.random() * 3600;
        const endTime = new Date(startTime.getTime() + duration * 1000);
        const status: RunStatus = ['Completed', 'Failed', 'Running'][Math.floor(Math.random() * 3)];
        const experimentName = MODEL_NAMES[i % MODEL_NAMES.length];
        runs.push({
            id: `run-${uuidv4().substring(0, 8)}`,
            experimentId: `exp-${experimentName}`,
            experimentName: experimentName,
            startTime,
            endTime: status !== 'Running' ? endTime : undefined,
            durationSeconds: status !== 'Running' ? duration : undefined,
            status,
            metrics: {
                accuracy: status === 'Completed' ? Math.random() * (0.98 - 0.85) + 0.85 : 0,
                precision: status === 'Completed' ? Math.random() * (0.99 - 0.80) + 0.80 : 0,
                recall: status === 'Completed' ? Math.random() * (0.97 - 0.82) + 0.82 : 0,
                f1_score: status === 'Completed' ? Math.random() * (0.98 - 0.83) + 0.83 : 0,
                log_loss: status === 'Completed' ? Math.random() * 0.5 + 0.1 : 0,
            },
            params: {
                learning_rate: Math.random() * 0.01,
                epochs: [5, 10, 15, 20][Math.floor(Math.random() * 4)],
                batch_size: [32, 64, 128][Math.floor(Math.random() * 3)],
                optimizer: ['Adam', 'SGD', 'RMSprop'][Math.floor(Math.random() * 3)],
            },
            tags: {
                user: USER_NAMES[i % USER_NAMES.length],
                version: `v1.${Math.floor(Math.random() * 5)}`,
                priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
            },
            artifacts: [
                { name: 'model.pkl', path: `/artifacts/run-${i}/model.pkl`, sizeMB: Math.random() * 50 + 10, type: 'model' },
                { name: 'confusion_matrix.png', path: `/artifacts/run-${i}/cm.png`, sizeMB: Math.random() * 1 + 0.1, type: 'image' },
                { name: 'training_log.txt', path: `/artifacts/run-${i}/log.txt`, sizeMB: Math.random() * 0.5, type: 'log' },
            ],
            sourceCode: {
                gitRepoUrl: GIT_REPOS[i % GIT_REPOS.length],
                commitHash: uuidv4().replace(/-/g, '').substring(0, 12),
            },
        });
    }
    return runs.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
};

/**
 * Generates a list of mock registered models with multiple versions.
 * @param names - An array of model names.
 * @param runs - The pool of training runs to link model versions to.
 * @returns An array of mock RegisteredModel objects.
 */
export const generateMockRegisteredModels = (names: string[], runs: TrainingRun[]): RegisteredModel[] => {
    return names.map(name => {
        const versions: ModelVersion[] = [];
        const numVersions = Math.floor(Math.random() * 5) + 2;
        let prodVersion = Math.floor(Math.random() * numVersions) + 1;
        let stagingVersion = Math.floor(Math.random() * numVersions) + 1;
        if (prodVersion === stagingVersion) stagingVersion++;

        for (let i = 1; i <= numVersions; i++) {
            const linkedRun = runs.find(r => r.experimentName === name && r.status === 'Completed');
            if (!linkedRun) continue;

            let stage: ModelStage = 'None';
            if (i === prodVersion) stage = 'Production';
            else if (i === stagingVersion) stage = 'Staging';
            else if (i < prodVersion - 2) stage = 'Archived';

            versions.push({
                id: `mv-${name}-${i}-${uuidv4().substring(0, 4)}`,
                name: name,
                version: i,
                description: `Version ${i} of the ${name} model. Trained with ${linkedRun.params.optimizer} optimizer.`,
                creationTimestamp: new Date(linkedRun.startTime.getTime() + (linkedRun.durationSeconds || 0) * 1000 + 3600000),
                lastUpdatedTimestamp: new Date(),
                stage,
                runId: linkedRun.id,
                metrics: linkedRun.metrics,
                tags: { ...linkedRun.tags, 'registered_by': USER_NAMES[i % USER_NAMES.length] }
            });
        }

        return {
            name: name,
            description: `A model to perform ${name.replace('-', ' ')} for Demo Bank customers.`,
            creationTimestamp: new Date(Date.now() - Math.random() * 1000 * 3600 * 24 * 180),
            lastUpdatedTimestamp: new Date(),
            versions: versions.sort((a, b) => b.version - a.version),
        };
    });
};

/**
 * Generates a list of mock model deployments.
 * @param models - The pool of registered models.
 * @returns An array of mock Deployment objects.
 */
export const generateMockDeployments = (models: RegisteredModel[]): Deployment[] => {
    const deployments: Deployment[] = [];
    models.forEach(model => {
        const prodVersion = model.versions.find(v => v.stage === 'Production');
        if (prodVersion) {
            deployments.push({
                id: `deploy-prod-${model.name}`,
                modelName: model.name,
                modelVersion: prodVersion.version,
                endpoint: `https://api.demobank.com/ml/models/${model.name}/predict`,
                status: 'Online',
                creationTimestamp: new Date(prodVersion.creationTimestamp.getTime() + 7200000),
                instanceType: 'ml.m5.large',
                replicas: Math.floor(Math.random() * 3) + 2,
                trafficSplit: 100,
                monitoring: {
                    latencyP95: Math.random() * 50 + 20, // ms
                    requestsPerSecond: Math.random() * 100 + 50,
                    errorRate: Math.random() * 0.01,
                }
            });
        }
        const stagingVersion = model.versions.find(v => v.stage === 'Staging');
        if (stagingVersion) {
            deployments.push({
                id: `deploy-staging-${model.name}`,
                modelName: model.name,
                modelVersion: stagingVersion.version,
                endpoint: `https://staging-api.demobank.com/ml/models/${model.name}/predict`,
                status: ['Online', 'Updating'][Math.floor(Math.random() * 2)] as DeploymentStatus,
                creationTimestamp: new Date(stagingVersion.creationTimestamp.getTime() + 7200000),
                instanceType: 'ml.t3.medium',
                replicas: 1,
                trafficSplit: 100,
                monitoring: {
                    latencyP95: Math.random() * 80 + 40, // ms
                    requestsPerSecond: Math.random() * 10 + 1,
                    errorRate: Math.random() * 0.02,
                }
            });
        }
    });
    return deployments;
};

/**
 * Generates a list of mock features for a feature store.
 * @param count - The number of features to generate.
 * @returns An array of mock Feature objects.
 */
export const generateMockFeatures = (count: number): Feature[] => {
    const features: Feature[] = [];
    const prefixes = ['user', 'transaction', 'session', 'account', 'loan'];
    const suffixes = ['amount', 'count_7d', 'avg_balance', 'duration', 'country_code', 'device_type', 'description_embedding'];
    for (let i = 0; i < count; i++) {
        const name = `${prefixes[i % prefixes.length]}_${suffixes[i % suffixes.length]}_v${Math.floor(i / (prefixes.length * suffixes.length)) + 1}`;
        let featureType: FeatureType = 'Numerical';
        if (name.includes('country') || name.includes('device')) featureType = 'Categorical';
        if (name.includes('embedding')) featureType = 'Text';

        features.push({
            id: `feat-${uuidv4().substring(0, 8)}`,
            name,
            description: `Calculates the ${name.replace(/_/g, ' ')}. Updated daily.`,
            featureType,
            creationTimestamp: new Date(Date.now() - Math.random() * 1000 * 3600 * 24 * 365),
            lastUpdatedTimestamp: new Date(),
            source: ['Kafka Stream: transactions', 'Data Warehouse: user_profiles', 'Batch Job: daily_aggregation'][i % 3],
            freshness: ['1h', '24h', '7d'][i % 3],
            version: Math.floor(i / (prefixes.length * suffixes.length)) + 1
        });
    }
    return features;
};

/**
 * Generates a list of mock alerts.
 * @param count - The number of alerts to generate.
 * @param deployments - The pool of deployments to link alerts to.
 * @returns An array of mock MLOpsAlert objects.
 */
export const generateMockAlerts = (count: number, deployments: Deployment[]): MLOpsAlert[] => {
    const alerts: MLOpsAlert[] = [];
    const alertTypes = [
        { title: 'High Prediction Latency', severity: 'Warning' },
        { title: 'Concept Drift Detected', severity: 'Critical' },
        { title: 'High Error Rate', severity: 'Critical' },
        { title: 'Deployment Offline', severity: 'Critical' },
        { title: 'Feature Freshness Stale', severity: 'Warning' },
    ];
    for (let i = 0; i < count; i++) {
        const alertType = alertTypes[i % alertTypes.length];
        const relatedDeployment = deployments[i % deployments.length];
        alerts.push({
            id: `alert-${uuidv4().substring(0, 8)}`,
            title: `${alertType.title} on ${relatedDeployment.modelName}`,
            message: `Model ${relatedDeployment.modelName} v${relatedDeployment.modelVersion} is experiencing ${alertType.title.toLowerCase()}. Current P95 latency: 150ms. Threshold: 100ms.`,
            severity: alertType.severity as AlertSeverity,
            timestamp: new Date(Date.now() - Math.random() * 1000 * 3600 * 24 * 2),
            relatedEntity: {
                type: 'Deployment',
                id: relatedDeployment.id,
            },
            acknowledged: Math.random() > 0.5,
        });
    }
    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};


// --- UTILITY & HELPER FUNCTIONS ---

/**
 * Formats a date object into a readable string.
 * @param date - The date to format.
 * @returns A formatted string e.g., "2023-10-27 14:30".
 */
export const formatDate = (date?: Date): string => {
    if (!date) return 'N/A';
    return date.toLocaleString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '');
};

/**
 * Formats a number to a fixed number of decimal places.
 * @param num - The number to format.
 * @param places - The number of decimal places.
 * @returns A formatted number string.
 */
export const formatNumber = (num?: number, places: number = 4): string => {
    if (num === undefined || num === null) return 'N/A';
    return num.toFixed(places);
};

/**
 * Returns a color based on the model stage.
 * @param stage - The model stage.
 * @returns A Tailwind CSS class string.
 */
export const getStageColor = (stage: ModelStage): string => {
    switch (stage) {
        case 'Production': return 'bg-green-500/20 text-green-300';
        case 'Staging': return 'bg-cyan-500/20 text-cyan-300';
        case 'Archived': return 'bg-gray-500/20 text-gray-300';
        default: return 'bg-yellow-500/20 text-yellow-300';
    }
};

/**
 * Returns a color based on the run status.
 * @param status - The run status.
 * @returns A Tailwind CSS class string.
 */
export const getStatusColor = (status: RunStatus | DeploymentStatus): string => {
    switch (status) {
        case 'Completed':
        case 'Online':
            return 'text-green-400';
        case 'Running':
        case 'Updating':
            return 'text-cyan-400 animate-pulse';
        case 'Failed':
        case 'Error':
            return 'text-red-400';
        case 'Offline':
            return 'text-gray-400';
        default:
            return 'text-white';
    }
};


// --- CUSTOM UI COMPONENTS ---

/**
 * A generic, reusable modal component.
 */
export const Modal: FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-600">
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div>{children}</div>
                <div className="flex justify-end pt-4 mt-4 border-t border-gray-600">
                    <button onClick={onClose} className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700">Close</button>
                </div>
            </div>
        </div>
    );
};

/**
 * A custom tooltip for Recharts charts.
 */
export const CustomTooltip: FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-gray-900/80 border border-gray-700 rounded-md shadow-lg">
        <p className="label text-gray-300">{`${label}`}</p>
        {payload.map((pld: any, index: number) => (
            <p key={index} style={{ color: pld.color }} className="text-sm">
                {`${pld.name}: ${formatNumber(pld.value, 4)}`}
            </p>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * Pill component for displaying tags or status.
 */
export const Pill: FC<{ text: string; colorClass: string; }> = ({ text, colorClass }) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>{text}</span>
);

/**
 * A generic table component with sorting capabilities.
 */
export const SortableTable: FC<{ columns: any[]; data: any[] }> = ({ columns, data }) => {
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);

    const sortedData = useMemo(() => {
        let sortableData = [...data];
        if (sortConfig !== null) {
            sortableData.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableData;
    }, [data, sortConfig]);

    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                    <tr>
                        {columns.map(col => (
                            <th key={col.key} scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort(col.key)}>
                                {col.header}
                                {sortConfig?.key === col.key && (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼')}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((item, index) => (
                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                            {columns.map(col => (
                                <td key={col.key} className="px-6 py-4">
                                    {col.render ? col.render(item) : item[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


// --- SVG ICONS ---

export const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

export const CodeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);

export const CubeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

export const ChartBarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

export const ServerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
);

export const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);


// --- DETAILED VIEW COMPONENTS ---

/**
 * A detailed view for a single Training Run.
 */
export const RunDetailView: FC<{ run: TrainingRun | null }> = ({ run }) => {
    if (!run) return <div className="text-gray-400">Select a run to see details.</div>;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-white mb-2">Run Details ({run.id})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-gray-900/50 p-3 rounded-md">
                        <p className="text-gray-400">Status</p>
                        <p className={`font-bold ${getStatusColor(run.status)}`}>{run.status}</p>
                    </div>
                    <div className="bg-gray-900/50 p-3 rounded-md">
                        <p className="text-gray-400">Start Time</p>
                        <p className="text-white">{formatDate(run.startTime)}</p>
                    </div>
                    <div className="bg-gray-900/50 p-3 rounded-md">
                        <p className="text-gray-400">Duration</p>
                        <p className="text-white">{run.durationSeconds ? `${run.durationSeconds.toFixed(2)}s` : 'N/A'}</p>
                    </div>
                    <div className="bg-gray-900/50 p-3 rounded-md">
                        <p className="text-gray-400">User</p>
                        <p className="text-white font-mono">{run.tags.user}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Metrics">
                    <ul>
                        {Object.entries(run.metrics).map(([key, value]) => (
                            <li key={key} className="flex justify-between py-1 border-b border-gray-800/50">
                                <span className="text-gray-400 font-mono">{key}</span>
                                <span className="text-white font-bold">{formatNumber(value)}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
                <Card title="Parameters">
                    <ul>
                        {Object.entries(run.params).map(([key, value]) => (
                            <li key={key} className="flex justify-between py-1 border-b border-gray-800/50">
                                <span className="text-gray-400 font-mono">{key}</span>
                                <span className="text-white font-bold">{value.toString()}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>

            <Card title="Source Code & Artifacts">
                <div className="space-y-4">
                    <div>
                        <p className="text-gray-400 text-sm mb-1">Git Repository</p>
                        <a href={run.sourceCode.gitRepoUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline font-mono">{run.sourceCode.gitRepoUrl}</a>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm mb-1">Commit Hash</p>
                        <p className="text-white font-mono">{run.sourceCode.commitHash}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm mb-1">Artifacts</p>
                        <ul className="divide-y divide-gray-800">
                           {run.artifacts.map(art => (
                                <li key={art.name} className="flex justify-between items-center py-2">
                                    <span className="text-white font-mono">{art.name} ({art.type})</span>
                                    <span className="text-gray-400">{art.sizeMB.toFixed(2)} MB</span>
                                </li>
                           ))}
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
};

/**
 * A detailed view for a single Registered Model.
 */
export const ModelDetailView: FC<{ model: RegisteredModel | null; onPromote: (modelName: string, version: number, stage: ModelStage) => void; }> = ({ model, onPromote }) => {
    if (!model) return <div className="text-gray-400">Select a model to see details.</div>;

    const versionsColumns = [
        { key: 'version', header: 'Version', render: (item: ModelVersion) => <span className="font-bold text-white">{`v${item.version}`}</span> },
        { key: 'stage', header: 'Stage', render: (item: ModelVersion) => <Pill text={item.stage} colorClass={getStageColor(item.stage)} /> },
        { key: 'accuracy', header: 'Accuracy', render: (item: ModelVersion) => formatNumber(item.metrics.accuracy) },
        { key: 'f1_score', header: 'F1 Score', render: (item: ModelVersion) => formatNumber(item.metrics.f1_score) },
        { key: 'creationTimestamp', header: 'Created At', render: (item: ModelVersion) => formatDate(item.creationTimestamp) },
        { key: 'actions', header: 'Actions', render: (item: ModelVersion) => (
            <div className="space-x-2">
                {item.stage !== 'Production' && (
                    <button onClick={() => onPromote(item.name, item.version, 'Production')} className="text-xs px-2 py-1 bg-green-600/50 text-green-200 rounded hover:bg-green-600/80">
                        Promote to Prod
                    </button>
                )}
                {item.stage !== 'Staging' && (
                     <button onClick={() => onPromote(item.name, item.version, 'Staging')} className="text-xs px-2 py-1 bg-cyan-600/50 text-cyan-200 rounded hover:bg-cyan-600/80">
                        Promote to Staging
                    </button>
                )}
            </div>
        )},
    ];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-white mb-2">{model.name}</h3>
                <p className="text-gray-400 max-w-2xl">{model.description}</p>
            </div>
            <Card title="Model Versions">
                <SortableTable columns={versionsColumns} data={model.versions} />
            </Card>
        </div>
    );
}

// --- TABBED VIEWS ---

/**
 * The main dashboard view with summary statistics and charts.
 */
export const DashboardView: FC<{
    stats: any;
    runs: TrainingRun[];
    models: RegisteredModel[];
    deployments: Deployment[];
}> = ({ stats, runs, models, deployments }) => {
    
    const productionModels = models.flatMap(m => m.versions).filter(v => v.stage === 'Production');
    const modelStageData = [
        { name: 'Production', value: productionModels.length },
        { name: 'Staging', value: models.flatMap(m => m.versions).filter(v => v.stage === 'Staging').length },
        { name: 'Archived', value: models.flatMap(m => m.versions).filter(v => v.stage === 'Archived').length },
    ];
    const COLORS = ['#10b981', '#06b6d4', '#6b7280'];

    const deploymentMonitoringData = deployments
        .filter(d => d.status === 'Online' && d.modelName.includes('fraud-detection'))
        .map(d => ({
            name: `v${d.modelVersion}`,
            latency: d.monitoring.latencyP95,
            rps: d.monitoring.requestsPerSecond,
            errors: d.monitoring.errorRate * 100,
        }));
    
    const recentRunMetrics = runs.slice(0, 20).map(r => ({
        name: r.id.substring(0, 8),
        accuracy: r.metrics.accuracy,
        loss: r.metrics.log_loss,
    })).reverse();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">{stats.activeExperiments}</p><p className="text-sm text-gray-400 mt-1">Active Experiments</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">{stats.totalRuns}</p><p className="text-sm text-gray-400 mt-1">Total Training Runs</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">{stats.registeredModels}</p><p className="text-sm text-gray-400 mt-1">Registered Models</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">{stats.modelsInProduction}</p><p className="text-sm text-gray-400 mt-1">Models in Production</p></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Recent Run Metrics (Accuracy vs Loss)">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={recentRunMetrics}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis yAxisId="left" stroke="#8884d8" label={{ value: 'Accuracy', angle: -90, position: 'insideLeft', fill: '#8884d8' }}/>
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Loss', angle: 90, position: 'insideRight', fill: '#82ca9d' }}/>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Area yAxisId="left" type="monotone" dataKey="accuracy" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                            <Area yAxisId="right" type="monotone" dataKey="loss" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Model Stages Distribution">
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                           <Pie data={modelStageData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                {modelStageData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>
            
            <Card title="Production Monitoring (Fraud Detection Models)">
                <ResponsiveContainer width="100%" height={300}>
                     <BarChart data={deploymentMonitoringData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis yAxisId="left" orientation="left" stroke="#06b6d4" label={{ value: 'Latency (ms) / RPS', angle: -90, position: 'insideLeft', fill: '#06b6d4' }}/>
                        <YAxis yAxisId="right" orientation="right" stroke="#ef4444" label={{ value: 'Error Rate (%)', angle: 90, position: 'insideRight', fill: '#ef4444' }}/>
                        <Tooltip content={<CustomTooltip />}/>
                        <Legend />
                        <Bar yAxisId="left" dataKey="latency" fill="#06b6d4" name="P95 Latency (ms)" />
                        <Bar yAxisId="left" dataKey="rps" fill="#8884d8" name="Requests/sec" />
                        <Line yAxisId="right" type="monotone" dataKey="errors" stroke="#ef4444" name="Error Rate (%)" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </div>
    )
}

/**
 * A view for browsing and comparing experiment runs.
 */
export const ExperimentTrackingView: FC<{ runs: TrainingRun[]; }> = ({ runs }) => {
    const [selectedRun, setSelectedRun] = useState<TrainingRun | null>(null);

    const columns = [
        { key: 'status', header: 'Status', render: (item: TrainingRun) => <Pill text={item.status} colorClass={getStatusColor(item.status) + ' font-bold'} /> },
        { key: 'id', header: 'Run ID', render: (item: TrainingRun) => <span className="font-mono text-white">{item.id}</span> },
        { key: 'experimentName', header: 'Experiment', render: (item: TrainingRun) => <span className="font-mono">{item.experimentName}</span> },
        { key: 'accuracy', header: 'Accuracy', render: (item: TrainingRun) => formatNumber(item.metrics.accuracy) },
        { key: 'f1_score', header: 'F1 Score', render: (item: TrainingRun) => formatNumber(item.metrics.f1_score) },
        { key: 'startTime', header: 'Start Time', render: (item: TrainingRun) => formatDate(item.startTime) },
        { key: 'actions', header: '', render: (item: TrainingRun) => (
            <button onClick={() => setSelectedRun(item)} className="text-cyan-400 hover:underline">Details</button>
        )}
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card title="All Training Runs">
                    <SortableTable columns={columns} data={runs} />
                </Card>
            </div>
            <div>
                 <Card title="Run Details">
                    <RunDetailView run={selectedRun} />
                 </Card>
            </div>
        </div>
    );
};

/**
 * A view for browsing and managing registered models.
 */
export const ModelRegistryView: FC<{ models: RegisteredModel[]; onPromote: (modelName: string, version: number, stage: ModelStage) => void }> = ({ models, onPromote }) => {
    const [selectedModel, setSelectedModel] = useState<RegisteredModel | null>(models[0] || null);
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
                <Card title="Models">
                    <ul className="space-y-2">
                        {models.map(model => (
                            <li key={model.name}>
                                <button
                                    onClick={() => setSelectedModel(model)}
                                    className={`w-full text-left p-3 rounded-md font-mono ${selectedModel?.name === model.name ? 'bg-cyan-600/30 text-white' : 'hover:bg-gray-800/50 text-gray-300'}`}
                                >
                                    {model.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
            <div className="lg:col-span-3">
                 <Card title="Model Details">
                    <ModelDetailView model={selectedModel} onPromote={onPromote} />
                 </Card>
            </div>
        </div>
    );
}

/**
 * A view for browsing the feature store.
 */
export const FeatureStoreView: FC<{ features: Feature[] }> = ({ features }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredFeatures = useMemo(() => {
        return features.filter(f => 
            f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            f.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [features, searchTerm]);
    
    const columns = [
        { key: 'name', header: 'Feature Name', render: (f: Feature) => <span className="font-mono text-white">{f.name}</span> },
        { key: 'featureType', header: 'Type', render: (f: Feature) => <Pill text={f.featureType} colorClass="bg-purple-500/20 text-purple-300" /> },
        { key: 'source', header: 'Source' },
        { key: 'freshness', header: 'Freshness' },
        { key: 'creationTimestamp', header: 'Created At', render: (f: Feature) => formatDate(f.creationTimestamp) },
    ];
    
    return (
        <Card title="Feature Store">
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search features..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500"
                />
            </div>
            <SortableTable columns={columns} data={filteredFeatures} />
        </Card>
    );
};

/**
 * A view for monitoring model deployments.
 */
export const DeploymentsView: FC<{ deployments: Deployment[]; alerts: MLOpsAlert[]; }> = ({ deployments, alerts }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card title="Model Deployments">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr>
                                    <th className="px-4 py-3">Model</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Endpoint</th>
                                    <th className="px-4 py-3 text-right">RPS</th>
                                    <th className="px-4 py-3 text-right">P95 Latency (ms)</th>
                                    <th className="px-4 py-3 text-right">Error Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deployments.map(d => (
                                    <tr key={d.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-4 py-4 font-mono text-white">{d.modelName} (v{d.modelVersion})</td>
                                        <td className="px-4 py-4"><span className={`font-bold ${getStatusColor(d.status)}`}>{d.status}</span></td>
                                        <td className="px-4 py-4 font-mono text-cyan-400">{d.endpoint}</td>
                                        <td className="px-4 py-4 text-right font-mono text-white">{d.monitoring.requestsPerSecond.toFixed(2)}</td>
                                        <td className="px-4 py-4 text-right font-mono text-white">{d.monitoring.latencyP95.toFixed(2)}</td>
                                        <td className="px-4 py-4 text-right font-mono text-white">{(d.monitoring.errorRate * 100).toFixed(3)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            <div className="lg:col-span-1">
                <Card title="Active Alerts">
                    <ul className="space-y-3">
                        {alerts.filter(a => !a.acknowledged).slice(0, 5).map(alert => (
                            <li key={alert.id} className={`p-3 rounded-md border-l-4 ${alert.severity === 'Critical' ? 'border-red-500 bg-red-500/10' : 'border-yellow-500 bg-yellow-500/10'}`}>
                                <p className="font-bold text-white">{alert.title}</p>
                                <p className="text-sm text-gray-300">{alert.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{formatDate(alert.timestamp)}</p>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    );
};

// --- MAIN APPLICATION COMPONENT ---

const DemoBankMachineLearningView: React.FC = () => {
    const [activeView, setActiveView] = useState('Dashboard');
    const [isLoading, setIsLoading] = useState(true);

    // Simulate a real-world application state management
    const [mlData, setMlData] = useState<{
        runs: TrainingRun[];
        models: RegisteredModel[];
        deployments: Deployment[];
        features: Feature[];
        alerts: MLOpsAlert[];
    }>({
        runs: [],
        models: [],
        deployments: [],
        features: [],
        alerts: [],
    });

    useEffect(() => {
        // Simulate fetching data from an API
        const fetchData = () => {
            setIsLoading(true);
            setTimeout(() => {
                const runs = generateMockTrainingRuns(150);
                const models = generateMockRegisteredModels(MODEL_NAMES, runs);
                const deployments = generateMockDeployments(models);
                const features = generateMockFeatures(50);
                const alerts = generateMockAlerts(15, deployments);
                setMlData({ runs, models, deployments, features, alerts });
                setIsLoading(false);
            }, 1000); // 1 second delay
        };
        fetchData();
    }, []);
    
    const handlePromoteModel = useCallback((modelName: string, version: number, newStage: ModelStage) => {
        setMlData(prevData => {
            const newModels = prevData.models.map(m => {
                if (m.name === modelName) {
                    // If promoting to Production or Staging, demote any existing model in that stage
                    const updatedVersions = m.versions.map(v => {
                        if (v.stage === newStage) {
                            return { ...v, stage: 'None' as ModelStage };
                        }
                        if (v.version === version) {
                            return { ...v, stage: newStage };
                        }
                        return v;
                    });
                    return { ...m, versions: updatedVersions };
                }
                return m;
            });
            return { ...prevData, models: newModels };
        });
    }, []);

    const dashboardStats = useMemo(() => {
        const productionModels = mlData.models.flatMap(m => m.versions).filter(v => v.stage === 'Production');
        return {
            activeExperiments: new Set(mlData.runs.map(r => r.experimentId)).size,
            totalRuns: mlData.runs.length,
            registeredModels: mlData.models.length,
            modelsInProduction: productionModels.length,
        };
    }, [mlData]);

    const navItems = [
        { name: 'Dashboard', icon: <ChartBarIcon /> },
        { name: 'Experiments', icon: <CodeIcon /> },
        { name: 'Model Registry', icon: <CubeIcon /> },
        { name: 'Deployments', icon: <ServerIcon /> },
        { name: 'Feature Store', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M4 7v5c0 2.21 3.582 4 8 4s8-1.79 8-4V7" /></svg> },
    ];

    const renderActiveView = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
                </div>
            );
        }
        switch (activeView) {
            case 'Dashboard':
                return <DashboardView stats={dashboardStats} runs={mlData.runs} models={mlData.models} deployments={mlData.deployments} />;
            case 'Experiments':
                return <ExperimentTrackingView runs={mlData.runs} />;
            case 'Model Registry':
                return <ModelRegistryView models={mlData.models} onPromote={handlePromoteModel}/>;
            case 'Deployments':
                return <DeploymentsView deployments={mlData.deployments} alerts={mlData.alerts} />;
            case 'Feature Store':
                return <FeatureStoreView features={mlData.features} />;
            default:
                return <div>View not found</div>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank MLOps Platform</h2>
                <div className="relative">
                    <BellIcon />
                    {mlData.alerts.filter(a => !a.acknowledged).length > 0 &&
                        <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                            {mlData.alerts.filter(a => !a.acknowledged).length}
                        </span>
                    }
                </div>
            </div>

            <nav className="flex space-x-2 border-b border-gray-700">
                {navItems.map(item => (
                    <button
                        key={item.name}
                        onClick={() => setActiveView(item.name)}
                        className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                            activeView === item.name
                                ? 'border-cyan-500 text-white'
                                : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
                        }`}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </button>
                ))}
            </nav>

            <div className="mt-6">
                {renderActiveView()}
            </div>
            
            {/* The original view's components are kept below for posterity or quick reference, but are superseded by the tabbed interface. */}
            <div className="hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="text-center"><p className="text-3xl font-bold text-white">12</p><p className="text-sm text-gray-400 mt-1">Active Experiments</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">48</p><p className="text-sm text-gray-400 mt-1">Training Runs (7d)</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">4</p><p className="text-sm text-gray-400 mt-1">Registered Models</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">2</p><p className="text-sm text-gray-400 mt-1">Models in Production</p></Card>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Training Runs (Last 7 Days)">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={trainingRunsData}>
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                                <Bar dataKey="runs" fill="#06b6d4" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                    <Card title="Experiment Results (Accuracy vs. Params)">
                         <ResponsiveContainer width="100%" height={300}>
                            <ScatterChart>
                                <XAxis type="number" dataKey="params" name="Parameters (M)" unit="M" stroke="#9ca3af" />
                                <YAxis type="number" dataKey="accuracy" name="Accuracy" unit="%" stroke="#9ca3af" domain={[90, 100]} />
                                <ZAxis dataKey="experiment" range={[100, 101]} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                                <Scatter name="Experiments" data={experimentAccuracyData} fill="#8884d8"/>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
                <Card title="Registered Models">
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Model Name</th>
                                    <th scope="col" className="px-6 py-3">Version</th>
                                    <th scope="col" className="px-6 py-3">Stage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registeredModels.map(model => (
                                    <tr key={model.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-6 py-4 font-mono text-white">{model.name}</td>
                                        <td className="px-6 py-4">{`v${model.version}`}</td>
                                        <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${model.stage === 'Production' ? 'bg-green-500/20 text-green-300' : model.stage === 'Staging' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-gray-500/20 text-gray-300'}`}>{model.stage}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DemoBankMachineLearningView;