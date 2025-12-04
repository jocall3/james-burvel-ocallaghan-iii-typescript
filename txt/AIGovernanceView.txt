import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Card from '../../Card';

// --- TYPE DEFINITIONS for a REAL-WORLD AI Governance PLATFORM ---

export enum ModelStatus {
    DEVELOPMENT = 'Development',
    STAGING = 'Staging',
    PRODUCTION = 'Production',
    ARCHIVED = 'Archived',
    DECOMMISSIONED = 'Decommissioned',
}

export enum RiskLevel {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
    CRITICAL = 'Critical',
}

export enum AlertSeverity {
    INFO = 'Info',
    WARNING = 'Warning',
    CRITICAL = 'Critical',
}

export enum AlertType {
    PERFORMANCE_DEGRADATION = 'Performance Degradation',
    DATA_DRIFT = 'Data Drift',
    CONCEPT_DRIFT = 'Concept Drift',
    BIAS_VIOLATION = 'Bias Violation',
    EXPLAINABILITY_FAILURE = 'Explainability Failure',
    POLICY_VIOLATION = 'Policy Violation',
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'Model Owner' | 'Data Scientist' | 'Auditor' | 'Governance Officer' | 'Admin';
}

export interface MetricTimeseriesDataPoint {
    timestamp: string;
    value: number;
}

export interface PerformanceMetrics {
    accuracy: MetricTimeseriesDataPoint[];
    precision: MetricTimeseriesDataPoint[];
    recall: MetricTimeseriesDataPoint[];
    f1Score: MetricTimeseriesDataPoint[];
    auc: MetricTimeseriesDataPoint[];
}

export interface FairnessMetric {
    group: string;
    metricName: string; // e.g., 'Disparate Impact', 'Statistical Parity Difference'
    value: number;
    threshold: number;
    isCompliant: boolean;
}

export interface DriftMetrics {
    dataDriftScore: MetricTimeseriesDataPoint[];
    conceptDriftScore: MetricTimeseriesDataPoint[];
}

export interface SHAPFeatureImportance {
    feature: string;
    importance: number;
}

export interface LIMEExplanation {
    predictionId: string;
    featureContributions: { feature: string; contribution: number }[];
    predictedClass: string;
    probability: number;
}

export interface AuditLog {
    id: string;
    timestamp: string;
    user: User;
    action: string;
    details: string;
}

export interface ModelVersion {
    version: string;
    createdAt: string;
    deployedAt?: string;
    createdBy: User;
    description: string;
    algorithm: string;
    trainingDataset: string;
    performanceMetrics: PerformanceMetrics;
    fairnessMetrics: FairnessMetric[];
    driftMetrics: DriftMetrics;
    explainability: {
        global: SHAPFeatureImportance[];
        local: LIMEExplanation[];
    };
    gitCommitHash: string;
}

export interface GovernancePolicy {
    id: string;
    name: string;
    description: string;
    category: 'Fairness' | 'Performance' | 'Drift' | 'Security';
    metric: string;
    condition: 'gt' | 'lt' | 'eq' | 'between';
    thresholds: [number, number?];
    appliesTo: 'all' | RiskLevel[];
    isActive: boolean;
}

export interface ModelAlert {
    id: string;
    modelId: string;
    modelName: string;
    timestamp: string;
    severity: AlertSeverity;
    type: AlertType;
    description: string;
    metric: string;
    value: number;
    threshold: number;
    status: 'new' | 'investigating' | 'resolved';
    assignedTo?: User;
    resolutionNotes?: string;
}

export interface AIModel {
    id:string;
    name: string;
    description: string;
    businessUnit: string;
    owner: User;
    status: ModelStatus;
    riskLevel: RiskLevel;
    createdAt: string;
    lastUpdatedAt: string;
    versions: ModelVersion[];
    activeVersion: string;
    tags: string[];
    documentationLink: string;
    policies: string[]; // Array of policy IDs
}

// --- MOCK DATA GENERATION for a REAL-WORLD APPLICATION ---

const MOCK_USERS: User[] = [
    { id: 'u1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Model Owner' },
    { id: 'u2', name: 'Bob Williams', email: 'bob@example.com', role: 'Data Scientist' },
    { id: 'u3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Auditor' },
    { id: 'u4', name: 'Diana Prince', email: 'diana@example.com', role: 'Governance Officer' },
    { id: 'u5', name: 'Ethan Hunt', email: 'ethan@example.com', role: 'Admin' },
];

const generateTimeseries = (days: number, startValue: number, volatility: number): MetricTimeseriesDataPoint[] => {
    const data: MetricTimeseriesDataPoint[] = [];
    let currentValue = startValue;
    for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        currentValue += (Math.random() - 0.5) * volatility;
        currentValue = Math.max(0, Math.min(1, currentValue)); // Clamp between 0 and 1
        data.push({ timestamp: date.toISOString(), value: parseFloat(currentValue.toFixed(4)) });
    }
    return data;
};

const generateMockModelVersion = (version: string, idx: number): ModelVersion => {
    const creationDate = new Date();
    creationDate.setMonth(creationDate.getMonth() - idx * 2);
    return {
        version: version,
        createdAt: creationDate.toISOString(),
        deployedAt: idx < 2 ? creationDate.toISOString() : undefined,
        createdBy: MOCK_USERS[1],
        description: `Version ${version} with improved feature engineering.`,
        algorithm: 'XGBoost',
        trainingDataset: `s3://datasets/customer_churn_v${version}.csv`,
        performanceMetrics: {
            accuracy: generateTimeseries(30, 0.92 - idx * 0.02, 0.01),
            precision: generateTimeseries(30, 0.88 - idx * 0.02, 0.02),
            recall: generateTimeseries(30, 0.85 - idx * 0.02, 0.03),
            f1Score: generateTimeseries(30, 0.86 - idx * 0.02, 0.02),
            auc: generateTimeseries(30, 0.95 - idx * 0.02, 0.01),
        },
        fairnessMetrics: [
            { group: 'Age > 60', metricName: 'Disparate Impact', value: 0.85, threshold: 0.8, isCompliant: true },
            { group: 'Gender=Female', metricName: 'Statistical Parity Difference', value: 0.08, threshold: 0.1, isCompliant: true },
            { group: 'Region=EU', metricName: 'Equal Opportunity Difference', value: -0.05, threshold: 0.08, isCompliant: true },
        ],
        driftMetrics: {
            dataDriftScore: generateTimeseries(30, 0.05 + idx * 0.01, 0.02),
            conceptDriftScore: generateTimeseries(30, 0.02 + idx * 0.01, 0.01),
        },
        explainability: {
            global: [
                { feature: 'monthly_tenure', importance: 0.45 },
                { feature: 'contract_type', importance: 0.23 },
                { feature: 'total_charges', importance: 0.18 },
                { feature: 'last_support_interaction', importance: 0.11 },
                { feature: 'device_type', importance: 0.03 },
            ],
            local: [
                {
                    predictionId: 'pred_123',
                    featureContributions: [{ feature: 'monthly_tenure', contribution: 0.3 }, { feature: 'total_charges', contribution: -0.1 }],
                    predictedClass: 'Churn',
                    probability: 0.88
                }
            ]
        },
        gitCommitHash: `a1b2c3d${idx}`,
    };
};

const MOCK_MODELS: AIModel[] = [
    {
        id: 'model_1', name: 'Customer Churn Prediction', description: 'Predicts the likelihood of a customer churning in the next 30 days.',
        businessUnit: 'Marketing', owner: MOCK_USERS[0], status: ModelStatus.PRODUCTION, riskLevel: RiskLevel.HIGH,
        createdAt: new Date('2023-01-15').toISOString(), lastUpdatedAt: new Date().toISOString(),
        versions: [generateMockModelVersion('2.1.0', 0), generateMockModelVersion('2.0.0', 1), generateMockModelVersion('1.5.0', 2)],
        activeVersion: '2.1.0', tags: ['classification', 'churn', 'marketing'],
        documentationLink: 'https://internal.wiki/docs/customer-churn-v2', policies: ['p1', 'p3'],
    },
    {
        id: 'model_2', name: 'Product Recommendation Engine', description: 'Recommends products to users based on their browsing history.',
        businessUnit: 'E-commerce', owner: MOCK_USERS[0], status: ModelStatus.PRODUCTION, riskLevel: RiskLevel.MEDIUM,
        createdAt: new Date('2022-11-20').toISOString(), lastUpdatedAt: new Date().toISOString(),
        versions: [generateMockModelVersion('1.3.2', 0), generateMockModelVersion('1.3.1', 1)],
        activeVersion: '1.3.2', tags: ['recommendation', 'personalization'],
        documentationLink: 'https://internal.wiki/docs/product-reco-v1', policies: ['p2'],
    },
    {
        id: 'model_3', name: 'Credit Risk Assessment', description: 'Assesses the credit risk for loan applications.',
        businessUnit: 'Finance', owner: MOCK_USERS[0], status: ModelStatus.PRODUCTION, riskLevel: RiskLevel.CRITICAL,
        createdAt: new Date('2022-05-10').toISOString(), lastUpdatedAt: new Date().toISOString(),
        versions: [generateMockModelVersion('3.0.1', 0), generateMockModelVersion('3.0.0', 1)],
        activeVersion: '3.0.1', tags: ['finance', 'risk', 'credit'],
        documentationLink: 'https://internal.wiki/docs/credit-risk-v3', policies: ['p1', 'p2', 'p3', 'p4'],
    },
    {
        id: 'model_4', name: 'Sentiment Analysis Bot', description: 'Analyzes customer feedback for sentiment.',
        businessUnit: 'Support', owner: MOCK_USERS[1], status: ModelStatus.STAGING, riskLevel: RiskLevel.LOW,
        createdAt: new Date('2023-08-01').toISOString(), lastUpdatedAt: new Date().toISOString(),
        versions: [generateMockModelVersion('0.5.0', 0)],
        activeVersion: '0.5.0', tags: ['nlp', 'sentiment'],
        documentationLink: 'https://internal.wiki/docs/sentiment-bot-v0.5', policies: [],
    },
    {
        id: 'model_5', name: 'Legacy Fraud Detection', description: 'Old fraud detection system pending decommissioning.',
        businessUnit: 'Security', owner: MOCK_USERS[1], status: ModelStatus.DECOMMISSIONED, riskLevel: RiskLevel.HIGH,
        createdAt: new Date('2020-03-01').toISOString(), lastUpdatedAt: new Date('2023-06-01').toISOString(),
        versions: [generateMockModelVersion('4.2.0', 5)],
        activeVersion: '4.2.0', tags: ['fraud', 'legacy'],
        documentationLink: 'https://internal.wiki/docs/legacy-fraud-v4', policies: ['p1'],
    },
];

const MOCK_POLICIES: GovernancePolicy[] = [
    { id: 'p1', name: 'Minimum F1 Score', description: 'All production models must maintain an F1 score above 0.8.', category: 'Performance', metric: 'f1Score', condition: 'gt', thresholds: [0.8], appliesTo: [RiskLevel.HIGH, RiskLevel.CRITICAL], isActive: true },
    { id: 'p2', name: 'Data Drift Threshold', description: 'Data drift score must not exceed 0.2 for an extended period.', category: 'Drift', metric: 'dataDriftScore', condition: 'lt', thresholds: [0.2], appliesTo: 'all', isActive: true },
    { id: 'p3', name: 'Disparate Impact for Gender', description: 'Disparate impact ratio for gender must be between 0.8 and 1.25.', category: 'Fairness', metric: 'disparateImpact', condition: 'between', thresholds: [0.8, 1.25], appliesTo: [RiskLevel.HIGH, RiskLevel.CRITICAL], isActive: true },
    { id: 'p4', name: 'Critical Model Uptime', description: 'Critical models must have 99.9% uptime.', category: 'Performance', metric: 'uptime', condition: 'gt', thresholds: [0.999], appliesTo: [RiskLevel.CRITICAL], isActive: false },
];

const MOCK_ALERTS: ModelAlert[] = [
    { id: 'a1', modelId: 'model_1', modelName: 'Customer Churn Prediction', timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), severity: AlertSeverity.WARNING, type: AlertType.PERFORMANCE_DEGRADATION, description: "F1 score dropped below policy threshold.", metric: 'f1Score', value: 0.79, threshold: 0.8, status: 'new' },
    { id: 'a2', modelId: 'model_3', modelName: 'Credit Risk Assessment', timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), severity: AlertSeverity.CRITICAL, type: AlertType.BIAS_VIOLATION, description: "Disparate impact for 'Age > 65' is 0.75, violating policy.", metric: 'disparateImpact', value: 0.75, threshold: 0.8, status: 'investigating', assignedTo: MOCK_USERS[3] },
    { id: 'a3', modelId: 'model_2', modelName: 'Product Recommendation Engine', timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), severity: AlertSeverity.INFO, type: AlertType.DATA_DRIFT, description: "Slight data drift detected in user feature 'avg_session_length'.", metric: 'dataDriftScore', value: 0.22, threshold: 0.2, status: 'resolved', assignedTo: MOCK_USERS[1], resolutionNotes: 'Drift was temporary due to marketing campaign. Model performance is stable.' },
    { id: 'a4', modelId: 'model_1', modelName: 'Customer Churn Prediction', timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(), severity: AlertSeverity.INFO, type: AlertType.CONCEPT_DRIFT, description: "Concept drift score slightly elevated.", metric: 'conceptDriftScore', value: 0.15, threshold: 0.15, status: 'resolved', resolutionNotes: 'Monitored, no impact on performance.' },
];

// --- UTILITY & HELPER FUNCTIONS ---

export const formatDate = (isoString: string): string => {
    return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

export const getStatusColor = (status: ModelStatus) => {
    switch (status) {
        case ModelStatus.PRODUCTION: return 'bg-green-500';
        case ModelStatus.STAGING: return 'bg-yellow-500';
        case ModelStatus.DEVELOPMENT: return 'bg-blue-500';
        case ModelStatus.ARCHIVED: return 'bg-gray-500';
        case ModelStatus.DECOMMISSIONED: return 'bg-red-700';
        default: return 'bg-gray-400';
    }
};

export const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
        case RiskLevel.CRITICAL: return 'border-red-500 text-red-400';
        case RiskLevel.HIGH: return 'border-orange-500 text-orange-400';
        case RiskLevel.MEDIUM: return 'border-yellow-500 text-yellow-400';
        case RiskLevel.LOW: return 'border-green-500 text-green-400';
        default: return 'border-gray-400 text-gray-400';
    }
};

export const getAlertSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
        case AlertSeverity.CRITICAL: return 'bg-red-500/20 text-red-400';
        case AlertSeverity.WARNING: return 'bg-yellow-500/20 text-yellow-400';
        case AlertSeverity.INFO: return 'bg-blue-500/20 text-blue-400';
        default: return 'bg-gray-500/20 text-gray-400';
    }
};


// --- REUSABLE UI COMPONENTS ---

export const Icon: React.FC<{ path: string; className?: string }> = ({ path, className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d={path} clipRule="evenodd" />
    </svg>
);

export const ChartPlaceholder: React.FC<{title: string}> = ({ title }) => (
    <div className="w-full h-64 bg-gray-700/50 rounded-lg flex items-center justify-center border border-dashed border-gray-600">
        <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 4v.01M28 8L12 24m16-16L12 24m16-16v12A4 4 0 0128 24h-4m4-4h4m-4 4v4m-4-4H12m8 12h12m-12 0a4 4 0 01-4-4V12m16 20a4 4 0 004-4V12a4 4 0 00-4-4H12a4 4 0 00-4 4v20a4 4 0 004 4h16z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-2 text-sm font-medium text-gray-400">{title}</p>
            <p className="text-xs text-gray-500">Chart data would be rendered here.</p>
        </div>
    </div>
);

export const KpiCard: React.FC<{ title: string; value: string; change?: string; changeType?: 'increase' | 'decrease' }> = ({ title, value, change, changeType }) => {
    const changeColor = changeType === 'increase' ? 'text-green-400' : 'text-red-400';
    const changeIcon = changeType === 'increase' ? '▲' : '▼';
    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400">{title}</h3>
            <p className="mt-1 text-3xl font-semibold text-gray-100">{value}</p>
            {change && (
                <p className={`mt-1 text-sm ${changeColor}`}>
                    {changeIcon} {change} vs last week
                </p>
            )}
        </div>
    );
};

// --- VIEWS / SECTIONS of the GOVERNANCE DASHBOARD ---

export const DashboardOverview: React.FC<{ onViewModel: (id: string) => void }> = ({ onViewModel }) => {
    const totalModels = MOCK_MODELS.length;
    const productionModels = MOCK_MODELS.filter(m => m.status === ModelStatus.PRODUCTION).length;
    const criticalAlerts = MOCK_ALERTS.filter(a => a.severity === AlertSeverity.CRITICAL && a.status === 'new').length;
    const policiesInForce = MOCK_POLICIES.filter(p => p.isActive).length;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Total Models" value={totalModels.toString()} change="+2" changeType="increase" />
                <KpiCard title="Models in Production" value={productionModels.toString()} />
                <KpiCard title="Active Critical Alerts" value={criticalAlerts.toString()} change="+1" changeType='increase' />
                <KpiCard title="Active Policies" value={policiesInForce.toString()} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Recent Alerts">
                    <ul className="divide-y divide-gray-700">
                        {MOCK_ALERTS.slice(0, 4).map(alert => (
                            <li key={alert.id} className="py-3 px-2 hover:bg-gray-800/50 rounded-md">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-1 rounded-full ${getAlertSeverityColor(alert.severity)}`}>
                                        <Icon path="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM11.5 15.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-200">{alert.modelName}: {alert.type}</p>
                                        <p className="text-xs text-gray-400">{alert.description}</p>
                                    </div>
                                    <span className="text-xs text-gray-500">{formatDate(alert.timestamp)}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card title="High Risk Models">
                     <ul className="divide-y divide-gray-700">
                        {MOCK_MODELS.filter(m => m.riskLevel === RiskLevel.CRITICAL || m.riskLevel === RiskLevel.HIGH).slice(0,4).map(model => (
                            <li key={model.id} className="py-3 px-2 hover:bg-gray-800/50 rounded-md cursor-pointer" onClick={() => onViewModel(model.id)}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-200">{model.name}</p>
                                        <p className="text-xs text-gray-400">{model.businessUnit}</p>
                                    </div>
                                    <div className={`text-xs font-semibold px-2 py-1 border rounded-full ${getRiskColor(model.riskLevel)}`}>
                                        {model.riskLevel}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    );
};

export const ModelInventoryView: React.FC<{ onViewModel: (id: string) => void }> = ({ onViewModel }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<{ status: string[]; risk: string[] }>({ status: [], risk: [] });

    const filteredModels = useMemo(() => {
        return MOCK_MODELS.filter(model => {
            const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                model.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesStatus = filters.status.length === 0 || filters.status.includes(model.status);
            const matchesRisk = filters.risk.length === 0 || filters.risk.includes(model.riskLevel);
            return matchesSearch && matchesStatus && matchesRisk;
        });
    }, [searchTerm, filters]);

    const toggleFilter = (category: 'status' | 'risk', value: string) => {
        setFilters(prev => {
            const current = prev[category];
            const newValues = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
            return { ...prev, [category]: newValues };
        });
    };

    return (
        <Card title="Model Inventory">
            <div className="p-4 space-y-4">
                <input
                    type="text"
                    placeholder="Search models by name, tag, or description..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex gap-8">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-2">Status</h4>
                        <div className="flex flex-wrap gap-2">
                            {Object.values(ModelStatus).map(s => (
                                <button key={s} onClick={() => toggleFilter('status', s)} className={`px-2 py-1 text-xs rounded ${filters.status.includes(s) ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{s}</button>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-2">Risk Level</h4>
                        <div className="flex flex-wrap gap-2">
                            {Object.values(RiskLevel).map(r => (
                                <button key={r} onClick={() => toggleFilter('risk', r)} className={`px-2 py-1 text-xs rounded ${filters.risk.includes(r) ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{r}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Risk Level</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Owner</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Updated</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                        {filteredModels.map(model => (
                            <tr key={model.id} className="hover:bg-gray-800/50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-100">{model.name}</div>
                                    <div className="text-xs text-gray-400">{model.businessUnit}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}>
                                        <span className={`h-2 w-2 mr-2 rounded-full ${getStatusColor(model.status)}`}></span>
                                        {model.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getRiskColor(model.riskLevel)}`}>
                                        {model.riskLevel}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{model.owner.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{formatDate(model.lastUpdatedAt)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onViewModel(model.id)} className="text-indigo-400 hover:text-indigo-300">View Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export const ModelDetailView: React.FC<{ modelId: string; onBack: () => void }> = ({ modelId, onBack }) => {
    const [model, setModel] = useState<AIModel | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    
    useEffect(() => {
        // API call simulation
        const foundModel = MOCK_MODELS.find(m => m.id === modelId);
        setModel(foundModel || null);
    }, [modelId]);

    if (!model) {
        return <div className="text-gray-400">Loading model details...</div>;
    }

    const activeVersionData = model.versions.find(v => v.version === model.activeVersion);

    const TABS = [
        { id: 'overview', label: 'Overview' },
        { id: 'performance', label: 'Performance' },
        { id: 'fairness', label: 'Fairness & Bias' },
        { id: 'explainability', label: 'Explainability' },
        { id: 'drift', label: 'Data Drift' },
        { id: 'audit', label: 'Audit Trail' },
        { id: 'versions', label: 'Versions' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview': return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        <p className="text-gray-300">{model.description}</p>
                        <div className="flex flex-wrap gap-2">
                           {model.tags.map(tag => <span key={tag} className="bg-gray-700 text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded-full">{tag}</span>)}
                        </div>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg space-y-2 text-sm">
                        <h3 className="font-semibold text-gray-200 mb-2">Metadata</h3>
                        <p><strong className="text-gray-400">Owner:</strong> {model.owner.name}</p>
                        <p><strong className="text-gray-400">Business Unit:</strong> {model.businessUnit}</p>
                        <p><strong className="text-gray-400">Risk Level:</strong> {model.riskLevel}</p>
                        <p><strong className="text-gray-400">Status:</strong> {model.status}</p>
                        <p><strong className="text-gray-400">Active Version:</strong> {model.activeVersion}</p>
                        <a href={model.documentationLink} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">View Documentation</a>
                    </div>
                </div>
            );
            case 'performance': return (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-200">Live Performance Metrics (v{model.activeVersion})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ChartPlaceholder title="Accuracy Over Time" />
                        <ChartPlaceholder title="F1 Score Over Time" />
                        <ChartPlaceholder title="Precision vs Recall Over Time" />
                        <ChartPlaceholder title="AUC ROC Curve" />
                    </div>
                </div>
            );
            case 'fairness': return (
                 <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-200">Fairness Analysis (v{model.activeVersion})</h3>
                    <p className="text-gray-400">Monitoring for fairness across protected attributes to ensure equitable outcomes.</p>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                        <table className="min-w-full divide-y divide-gray-700">
                             <thead className="bg-gray-800">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Protected Group</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Metric</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Value</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Threshold</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                                </tr>
                             </thead>
                             <tbody>
                                {activeVersionData?.fairnessMetrics.map((metric, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-3 text-sm text-gray-300">{metric.group}</td>
                                        <td className="px-4 py-3 text-sm text-gray-300">{metric.metricName}</td>
                                        <td className="px-4 py-3 text-sm text-gray-300">{metric.value.toFixed(3)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-400">{metric.threshold}</td>
                                        <td className="px-4 py-3 text-sm">
                                            {metric.isCompliant 
                                                ? <span className="text-green-400">Compliant</span> 
                                                : <span className="text-red-400">Violation</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                             </tbody>
                        </table>
                    </div>
                </div>
            );
            case 'explainability': return (
                 <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-200">Model Explainability (XAI) (v{model.activeVersion})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card title="Global Feature Importance (SHAP)">
                            <ul className="space-y-2">
                               {activeVersionData?.explainability.global.map(f => (
                                   <li key={f.feature}>
                                       <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-300">{f.feature}</span>
                                            <span className="text-gray-400">{f.importance}</span>
                                       </div>
                                       <div className="w-full bg-gray-700 rounded-full h-2.5">
                                           <div className="bg-indigo-500 h-2.5 rounded-full" style={{width: `${f.importance * 100}%`}}></div>
                                       </div>
                                   </li>
                               ))}
                            </ul>
                        </Card>
                         <Card title="Local Explanation Example (LIME)">
                            <div className="text-sm space-y-2">
                               <p>Prediction for ID <code className="bg-gray-700 p-1 rounded">pred_123</code></p>
                               <p>Outcome: <strong className="text-indigo-400">{activeVersionData?.explainability.local[0].predictedClass}</strong> with {activeVersionData?.explainability.local[0].probability * 100}% probability.</p>
                               <h4 className="font-semibold pt-2">Feature Contributions:</h4>
                               <ul className="list-disc list-inside text-gray-400">
                                {activeVersionData?.explainability.local[0].featureContributions.map(c => (
                                    <li key={c.feature}>
                                        {c.feature}: <span className={c.contribution > 0 ? 'text-green-400' : 'text-red-400'}>{c.contribution > 0 ? '+' : ''}{c.contribution}</span>
                                    </li>
                                ))}
                               </ul>
                            </div>
                        </Card>
                    </div>
                </div>
            );
            case 'drift': return (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-200">Drift Monitoring (v{model.activeVersion})</h3>
                    <p className="text-gray-400">Tracking changes in data distributions and model predictions over time.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ChartPlaceholder title="Input Data Drift Over Time" />
                        <ChartPlaceholder title="Concept (Prediction) Drift Over Time" />
                    </div>
                </div>
            );
            default: return <p>This tab is under construction.</p>;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <button onClick={onBack} className="flex items-center text-sm text-indigo-400 hover:text-indigo-300 mb-4">
                    <Icon path="M15.75 19.5L8.25 12l7.5-7.5" className="h-4 w-4 mr-1" />
                    Back to Inventory
                </button>
                <div className="md:flex md:items-center md:justify-between">
                    <div className="flex-1 min-w-0">
                         <h2 className="text-2xl font-bold leading-7 text-white sm:text-3xl sm:truncate">{model.name}</h2>
                    </div>
                     <div className="mt-4 flex md:mt-0 md:ml-4">
                        <button type="button" className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700">
                           Request Audit
                        </button>
                         <button type="button" className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                           Retrain Model
                        </button>
                    </div>
                </div>
            </div>

            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${
                                activeTab === tab.id
                                    ? 'border-indigo-500 text-indigo-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="mt-6">
                {renderTabContent()}
            </div>
        </div>
    );
};


// --- MAIN VIEW COMPONENT ---

const AIGovernanceView: React.FC = () => {
    const [currentView, setCurrentView] = useState<'dashboard' | 'inventory' | 'model_detail' | 'policies' | 'alerts'>('dashboard');
    const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

    const handleViewModel = useCallback((modelId: string) => {
        setSelectedModelId(modelId);
        setCurrentView('model_detail');
    }, []);

    const navigateToInventory = () => setCurrentView('inventory');
    const navigateToDashboard = () => setCurrentView('dashboard');
    
    const renderCurrentView = () => {
        switch (currentView) {
            case 'dashboard':
                return <DashboardOverview onViewModel={handleViewModel} />;
            case 'inventory':
                return <ModelInventoryView onViewModel={handleViewModel} />;
            case 'model_detail':
                return selectedModelId ? <ModelDetailView modelId={selectedModelId} onBack={navigateToInventory} /> : <p>No model selected.</p>;
            case 'policies':
                return <Card title="Policy Management"><p className="text-gray-400">Policy management UI is under construction.</p></Card>;
            case 'alerts':
                return <Card title="Alerts Dashboard"><p className="text-gray-400">Alerts dashboard UI is under construction.</p></Card>;
            default:
                return <DashboardOverview onViewModel={handleViewModel} />;
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">AI Governance Dashboard</h1>
                    <p className="mt-1 text-gray-400">A central hub for managing AI model lifecycles, monitoring for bias, and ensuring ethical compliance.</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-2">
                    <button className="px-3 py-2 text-sm bg-gray-700/50 hover:bg-gray-700 rounded-md text-gray-300">
                        Generate Report
                    </button>
                     <button className="px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-semibold">
                        Register New Model
                    </button>
                </div>
            </header>

            <nav className="flex space-x-4 border-b border-gray-700 pb-2">
                 <button onClick={() => setCurrentView('dashboard')} className={`px-3 py-2 rounded-md text-sm font-medium ${currentView === 'dashboard' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}>
                    Overview
                 </button>
                 <button onClick={() => setCurrentView('inventory')} className={`px-3 py-2 rounded-md text-sm font-medium ${currentView === 'inventory' || currentView === 'model_detail' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}>
                    Model Inventory
                 </button>
                 <button onClick={() => setCurrentView('policies')} className={`px-3 py-2 rounded-md text-sm font-medium ${currentView === 'policies' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}>
                    Policy Management
                 </button>
                 <button onClick={() => setCurrentView('alerts')} className={`px-3 py-2 rounded-md text-sm font-medium ${currentView === 'alerts' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}>
                    Alerts <span className="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">{MOCK_ALERTS.filter(a => a.status === 'new').length}</span>
                 </button>
            </nav>

            <main>
                {renderCurrentView()}
            </main>
        </div>
    );
};

export default AIGovernanceView;