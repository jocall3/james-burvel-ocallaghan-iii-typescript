import React, { useContext, useState, useMemo, useCallback } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { MLModel, Feature, MLAlert, ModelDeployment, ModelMetric } from '../../../../types'; // Assume these types exist or are extended
import { GoogleGenAI } from '@google/genai';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// --- Extended Types (Assumed to be in ../../../../types for real app) ---
// For the purpose of this single-file expansion, we'll define them here
// to demonstrate the data structures needed. In a real app, these would be in `types.ts`.

export interface MLModelExtended extends MLModel {
    metricsHistory: { date: string; precision: number; recall: number; f1Score: number; latency: number; throughput: number }[];
    hyperparameters: { [key: string]: string | number };
    featureImportance: { feature: string; importance: number }[];
    xaiInsights: XAIInsight[];
    deploymentStatus?: ModelDeploymentStatus;
    deploymentHistory?: ModelDeployment[];
    costHistory?: { date: string; cost: number; cpuHours: number; gpuHours: number }[];
    dataDriftHistory?: DataDriftReport[];
}

export type ModelDeploymentStatus = 'Deployed' | 'Rolling Update' | 'A/B Testing' | 'Canary' | 'Inactive';

export interface ModelDeployment {
    id: string;
    modelId: string;
    version: string;
    environment: 'staging' | 'production' | 'canary' | 'ab_test';
    status: ModelDeploymentStatus;
    deployedAt: string;
    trafficSplit?: { [modelId: string]: number }; // For A/B testing
    metrics?: ModelMetric[]; // Real-time metrics
    infrastructure: 'Kubernetes' | 'Serverless' | 'VM';
    region: string;
    monitoringEnabled: boolean;
}

export interface ModelMetric {
    timestamp: string;
    requestsPerSecond: number;
    errorRate: number;
    avgLatencyMs: number;
    cpuUtilization: number;
    memoryUtilization: number;
    predictionAccuracy?: number; // For real-time feedback systems
}

export interface DataDriftReport {
    timestamp: string;
    features: {
        name: string;
        driftScore: number; // e.g., PSI, K-L divergence
        distributionShift?: {
            baseline: { [value: string]: number };
            current: { [value: string]: number };
        };
        anomaliesDetected: number;
    }[];
    overallDriftScore: number;
    driftDetected: boolean;
}

export interface XAIInsight {
    id: string;
    type: 'LIME' | 'SHAP' | 'Counterfactual';
    description: string;
    prediction?: any;
    explanationData: any; // Raw data for visualization (e.g., SHAP values, LIME weights)
    generatedAt: string;
}

export interface HyperparameterOptimizationRun {
    id: string;
    modelId: string;
    status: 'Pending' | 'Running' | 'Completed' | 'Failed';
    startedAt: string;
    completedAt?: string;
    strategy: 'Grid Search' | 'Random Search' | 'Bayesian Optimization';
    searchSpace: { [param: string]: { type: 'categorical' | 'range' | 'float' | 'int'; values?: any[]; min?: number; max?: number; step?: number } };
    bestParameters?: { [param: string]: any };
    bestMetricValue?: number;
    trials: HPOCTrial[];
}

export interface HPOCTrial {
    id: string;
    parameters: { [param: string]: any };
    metricValue: number;
    status: 'Completed' | 'Failed' | 'Running';
    startedAt: string;
    completedAt?: string;
}

export interface FeatureStoreEntry extends Feature {
    version: number;
    source: string;
    lastUpdated: string;
    schema: { [key: string]: string }; // e.g., { "column1": "float", "column2": "string" }
    usedByModels: { modelId: string; modelName: string; version: string }[];
    lineage: string[]; // e.g., ["raw_data_table.column_A", "transformation_script_v2"]
    dataQualityMetrics: {
        missingRate: number;
        outlierCount: number;
        distinctCount: number;
    };
}

export interface MLAlertExtended extends MLAlert {
    modelId: string;
    modelName: string;
    metric: string; // e.g., "accuracy_drop", "latency_spike", "data_drift"
    threshold: number;
    currentValue: number;
    triggeredAt: string;
    status: 'Active' | 'Resolved' | 'Acknowledged';
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    assignedTo?: string;
    resolutionNotes?: string;
}

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    actor: string;
    action: string; // e.g., "model_retrained", "model_deployed", "alert_resolved"
    targetType: 'MLModel' | 'Deployment' | 'Alert' | 'Feature';
    targetId: string;
    details: { [key: string]: any };
}

// Helper for generating mock data
const generateMockPerformanceHistory = (days: number = 30) => {
    const data = [];
    let currentAccuracy = Math.random() * (95 - 80) + 80;
    let currentPrecision = Math.random() * (0.95 - 0.8) + 0.8;
    let currentRecall = Math.random() * (0.95 - 0.8) + 0.8;
    let currentF1 = Math.random() * (0.95 - 0.8) + 0.8;
    let currentLatency = Math.random() * (100 - 10) + 10;
    let currentThroughput = Math.random() * (1000 - 100) + 100;

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        currentAccuracy = Math.max(70, Math.min(99, currentAccuracy + (Math.random() - 0.5) * 2));
        currentPrecision = Math.max(0.7, Math.min(0.99, currentPrecision + (Math.random() - 0.5) * 0.05));
        currentRecall = Math.max(0.7, Math.min(0.99, currentRecall + (Math.random() - 0.5) * 0.05));
        currentF1 = Math.max(0.7, Math.min(0.99, currentF1 + (Math.random() - 0.5) * 0.05));
        currentLatency = Math.max(5, Math.min(200, currentLatency + (Math.random() - 0.5) * 10));
        currentThroughput = Math.max(50, Math.min(2000, currentThroughput + (Math.random() - 0.5) * 100));

        data.push({
            date: date.toISOString().split('T')[0],
            accuracy: parseFloat(currentAccuracy.toFixed(2)),
            precision: parseFloat(currentPrecision.toFixed(2)),
            recall: parseFloat(currentRecall.toFixed(2)),
            f1Score: parseFloat(currentF1.toFixed(2)),
            latency: parseFloat(currentLatency.toFixed(2)),
            throughput: parseFloat(currentThroughput.toFixed(2)),
        });
    }
    return data;
};

const generateMockFeatureImportance = (numFeatures: number = 10) => {
    const features = ['feature_A', 'feature_B', 'feature_C', 'feature_D', 'feature_E', 'feature_F', 'feature_G', 'feature_H', 'feature_I', 'feature_J'];
    return Array.from({ length: numFeatures }, (_, i) => ({
        feature: features[i % features.length] + (i >= features.length ? `_${Math.floor(i / features.length)}` : ''),
        importance: parseFloat((Math.random() * 0.2 + 0.01).toFixed(4)),
    })).sort((a, b) => b.importance - a.importance);
};

const generateMockXAIInsights = (): XAIInsight[] => [
    {
        id: uuidv4(),
        type: 'SHAP',
        description: 'SHAP values for a recent prediction. Feature_A contributed positively, Feature_C negatively.',
        prediction: { label: 'Class 1', probability: 0.85 },
        explanationData: {
            baseValue: 0.5,
            shapValues: { feature_A: 0.2, feature_B: 0.05, feature_C: -0.1 },
            featureValues: { feature_A: 10, feature_B: 0.5, feature_C: 200 }
        },
        generatedAt: new Date().toISOString()
    },
    {
        id: uuidv4(),
        type: 'LIME',
        description: 'LIME explanation for a misclassified instance. High values in Feature_X were critical.',
        prediction: { label: 'Class 0', probability: 0.6, actual: 'Class 1' },
        explanationData: [
            { feature: 'feature_X', weight: 0.3, value: 50 },
            { feature: 'feature_Y', weight: -0.1, value: 2 },
        ],
        generatedAt: new Date(Date.now() - 3600000).toISOString()
    }
];

const generateMockDataDriftReport = (days: number = 10): DataDriftReport[] => {
    const reports = [];
    const featureNames = ['feature_A', 'feature_B', 'feature_C', 'feature_D', 'feature_E'];
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const features = featureNames.map(name => ({
            name: name,
            driftScore: parseFloat((Math.random() * 0.5).toFixed(2)), // 0 to 0.5
            anomaliesDetected: Math.floor(Math.random() * 5),
            distributionShift: i % 3 === 0 ? { // Simulate shift every few days
                baseline: { val1: 0.3, val2: 0.7 },
                current: { val1: Math.random() * 0.4 + 0.1, val2: Math.random() * 0.4 + 0.5 }
            } : undefined
        }));
        const overallDriftScore = parseFloat(features.reduce((sum, f) => sum + f.driftScore, 0) / features.length).toFixed(2);
        reports.push({
            timestamp: date.toISOString(),
            features: features,
            overallDriftScore: parseFloat(overallDriftScore),
            driftDetected: parseFloat(overallDriftScore) > 0.25
        });
    }
    return reports;
};

const generateMockDeployments = (modelId: string): ModelDeployment[] => [
    {
        id: uuidv4(),
        modelId: modelId,
        version: '1.0',
        environment: 'production',
        status: 'Deployed',
        deployedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        infrastructure: 'Kubernetes',
        region: 'us-east-1',
        monitoringEnabled: true,
        metrics: Array.from({ length: 24 }, (_, i) => ({
            timestamp: new Date(Date.now() - (24 - i) * 3600000).toISOString(),
            requestsPerSecond: Math.floor(Math.random() * 100) + 50,
            errorRate: parseFloat((Math.random() * 0.01).toFixed(3)),
            avgLatencyMs: Math.floor(Math.random() * 50) + 20,
            cpuUtilization: parseFloat((Math.random() * 0.8).toFixed(2)),
            memoryUtilization: parseFloat((Math.random() * 0.7).toFixed(2)),
            predictionAccuracy: Math.random() * 0.1 > 0.05 ? parseFloat((Math.random() * 0.05 + 0.9).toFixed(3)) : undefined, // Optional
        }))
    },
    {
        id: uuidv4(),
        modelId: modelId,
        version: '1.1-canary',
        environment: 'canary',
        status: 'Canary',
        deployedAt: new Date(Date.now() - 86400000).toISOString(),
        trafficSplit: { [modelId]: 0.1, 'previous_model_id': 0.9 }, // Example traffic split
        infrastructure: 'Serverless',
        region: 'us-west-2',
        monitoringEnabled: true,
        metrics: Array.from({ length: 24 }, (_, i) => ({
            timestamp: new Date(Date.now() - (24 - i) * 3600000).toISOString(),
            requestsPerSecond: Math.floor(Math.random() * 10) + 5,
            errorRate: parseFloat((Math.random() * 0.02).toFixed(3)),
            avgLatencyMs: Math.floor(Math.random() * 70) + 30,
            cpuUtilization: parseFloat((Math.random() * 0.3).toFixed(2)),
            memoryUtilization: parseFloat((Math.random() * 0.2).toFixed(2)),
        }))
    }
];

const generateMockHPORuns = (modelId: string): HyperparameterOptimizationRun[] => [
    {
        id: uuidv4(),
        modelId: modelId,
        status: 'Completed',
        startedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        completedAt: new Date(Date.now() - 86400000 * 9).toISOString(),
        strategy: 'Bayesian Optimization',
        searchSpace: {
            learningRate: { type: 'float', min: 0.0001, max: 0.1 },
            batchSize: { type: 'categorical', values: [16, 32, 64] },
            numLayers: { type: 'int', min: 2, max: 5 }
        },
        bestParameters: { learningRate: 0.01, batchSize: 32, numLayers: 3 },
        bestMetricValue: 0.925,
        trials: Array.from({ length: 20 }, (_, i) => ({
            id: uuidv4(),
            parameters: { learningRate: parseFloat((Math.random() * 0.1).toFixed(4)), batchSize: [16, 32, 64][Math.floor(Math.random() * 3)], numLayers: Math.floor(Math.random() * 4) + 2 },
            metricValue: parseFloat((0.85 + Math.random() * 0.1).toFixed(3)),
            status: 'Completed',
            startedAt: new Date(Date.now() - (20 - i) * 3600000).toISOString(),
            completedAt: new Date(Date.now() - (20 - i - 0.5) * 3600000).toISOString(),
        })).sort((a,b) => b.metricValue - a.metricValue)
    }
];

const generateMockFeatures = (): FeatureStoreEntry[] => {
    const baseFeatures = ['user_id', 'item_id', 'category', 'price', 'reviews_count', 'age_group', 'country', 'engagement_score'];
    return baseFeatures.map((name, i) => ({
        id: uuidv4(),
        name: name,
        description: `Description for ${name}`,
        type: i % 3 === 0 ? 'numeric' : 'categorical',
        version: 1,
        source: `data_pipeline_v${i % 2 === 0 ? 1 : 2}`,
        lastUpdated: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
        schema: { value: i % 3 === 0 ? 'float' : 'string' },
        usedByModels: [{ modelId: 'model-123', modelName: 'ChurnPredictor', version: '1.0' }],
        lineage: [`raw_user_data.${name}`, `processed_user_data.${name}_normalized`],
        dataQualityMetrics: {
            missingRate: parseFloat((Math.random() * 0.1).toFixed(2)),
            outlierCount: Math.floor(Math.random() * 50),
            distinctCount: Math.floor(Math.random() * 1000) + 10,
        }
    }));
};

const generateMockAlerts = (): MLAlertExtended[] => [
    {
        id: uuidv4(),
        modelId: 'model-123',
        modelName: 'ChurnPredictor',
        metric: 'accuracy_drop',
        threshold: 0.85,
        currentValue: 0.82,
        triggeredAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        status: 'Active',
        severity: 'High',
        message: 'Accuracy dropped below threshold for ChurnPredictor v1.0 in production!',
        assignedTo: 'John Doe',
    },
    {
        id: uuidv4(),
        modelId: 'model-456',
        modelName: 'RecommendationEngine',
        metric: 'latency_spike',
        threshold: 100,
        currentValue: 125,
        triggeredAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        status: 'Resolved',
        severity: 'Medium',
        message: 'Latency spike detected for RecommendationEngine v2.1. Investigating...',
        resolutionNotes: 'Scaling group adjusted, latency normalized.',
    },
    {
        id: uuidv4(),
        modelId: 'model-123',
        modelName: 'ChurnPredictor',
        metric: 'data_drift',
        threshold: 0.3,
        currentValue: 0.35,
        triggeredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        status: 'Active',
        severity: 'Critical',
        message: 'Significant data drift detected in input features for ChurnPredictor v1.0!',
        assignedTo: 'Jane Smith',
    }
];

const generateMockAuditLogs = (): AuditLogEntry[] => [
    {
        id: uuidv4(),
        timestamp: new Date(Date.now() - 86400000 * 10).toISOString(),
        actor: 'Admin User',
        action: 'model_retrained',
        targetType: 'MLModel',
        targetId: 'model-123',
        details: { modelName: 'ChurnPredictor', oldVersion: '0.9', newVersion: '1.0', accuracyImprovement: '2%' }
    },
    {
        id: uuidv4(),
        timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
        actor: 'CI/CD Pipeline',
        action: 'model_deployed',
        targetType: 'Deployment',
        targetId: 'dep-789',
        details: { modelName: 'ChurnPredictor', version: '1.0', environment: 'production', region: 'us-east-1' }
    },
    {
        id: uuidv4(),
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        actor: 'Monitoring System',
        action: 'alert_triggered',
        targetType: 'Alert',
        targetId: 'alert-101',
        details: { alertName: 'accuracy_drop', modelName: 'ChurnPredictor', severity: 'High' }
    }
];

// Extend DataContext (conceptually)
interface ExtendedDataContextType {
    mlModels: MLModelExtended[];
    retrainMlModel: (id: string) => void;
    deployMlModel: (model: MLModelExtended, environment: string) => Promise<void>;
    rollbackDeployment: (deploymentId: string) => Promise<void>;
    updateTrafficSplit: (deploymentId: string, trafficSplit: { [modelId: string]: number }) => Promise<void>;
    createHPOptionRun: (modelId: string, config: any) => Promise<void>;
    acknowledgeAlert: (alertId: string, notes: string) => Promise<void>;
    resolveAlert: (alertId: string, notes: string) => Promise<void>;
    allFeatures: FeatureStoreEntry[];
    allDeployments: ModelDeployment[];
    allAlerts: MLAlertExtended[];
    auditLogs: AuditLogEntry[];
}

// Mock Data Provider for `DataContext`
const MockDataContext: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mockModels, setMockModels] = useState<MLModelExtended[]>(() => [
        {
            id: 'model-123',
            name: 'ChurnPredictor',
            version: '1.0',
            accuracy: 92.5,
            status: 'Production',
            performanceHistory: generateMockPerformanceHistory(30).map(d => ({ date: d.date, accuracy: d.accuracy })),
            metricsHistory: generateMockPerformanceHistory(30),
            hyperparameters: { learningRate: 0.01, epochs: 100, optimizer: 'Adam' },
            featureImportance: generateMockFeatureImportance(),
            xaiInsights: generateMockXAIInsights(),
            deploymentStatus: 'Deployed',
            deploymentHistory: generateMockDeployments('model-123'),
            costHistory: generateMockPerformanceHistory(30).map(d => ({ date: d.date, cost: parseFloat((Math.random() * 500 + 100).toFixed(2)), cpuHours: parseFloat((Math.random() * 20 + 5).toFixed(2)), gpuHours: parseFloat((Math.random() * 5).toFixed(2)) })),
            dataDriftHistory: generateMockDataDriftReport(10),
        },
        {
            id: 'model-456',
            name: 'RecommendationEngine',
            version: '2.1',
            accuracy: 88.1,
            status: 'Staging',
            performanceHistory: generateMockPerformanceHistory(30).map(d => ({ date: d.date, accuracy: d.accuracy })),
            metricsHistory: generateMockPerformanceHistory(30),
            hyperparameters: { embeddingDim: 64, numLayers: 3, activation: 'ReLU' },
            featureImportance: generateMockFeatureImportance(15),
            xaiInsights: [],
            deploymentStatus: 'Inactive',
            deploymentHistory: [],
            costHistory: generateMockPerformanceHistory(30).map(d => ({ date: d.date, cost: parseFloat((Math.random() * 300 + 50).toFixed(2)), cpuHours: parseFloat((Math.random() * 15 + 3).toFixed(2)), gpuHours: parseFloat((Math.random() * 3).toFixed(2)) })),
            dataDriftHistory: generateMockDataDriftReport(10),
        },
        {
            id: 'model-789',
            name: 'FraudDetector',
            version: '0.9-beta',
            accuracy: 99.2,
            status: 'Training',
            performanceHistory: generateMockPerformanceHistory(10).map(d => ({ date: d.date, accuracy: d.accuracy })),
            metricsHistory: generateMockPerformanceHistory(10),
            hyperparameters: { treeDepth: 10, estimators: 200, learningRate: 0.05 },
            featureImportance: generateMockFeatureImportance(8),
            xaiInsights: [],
            deploymentStatus: 'Inactive',
            deploymentHistory: [],
            costHistory: generateMockPerformanceHistory(10).map(d => ({ date: d.date, cost: parseFloat((Math.random() * 100 + 20).toFixed(2)), cpuHours: parseFloat((Math.random() * 10 + 2).toFixed(2)), gpuHours: parseFloat((Math.random() * 2).toFixed(2)) })),
            dataDriftHistory: generateMockDataDriftReport(5),
        }
    ]);

    const [mockFeatures] = useState<FeatureStoreEntry[]>(generateMockFeatures());
    const [mockAlerts, setMockAlerts] = useState<MLAlertExtended[]>(generateMockAlerts());
    const [mockAuditLogs, setMockAuditLogs] = useState<AuditLogEntry[]>(generateMockAuditLogs());

    const allDeployments = useMemo(() => mockModels.flatMap(m => m.deploymentHistory || []), [mockModels]);

    const retrainMlModel = (id: string) => {
        setMockModels(prev => prev.map(model =>
            model.id === id ? { ...model, status: 'Training', accuracy: parseFloat((model.accuracy - Math.random() * 5).toFixed(2)) } : model
        ));
        setTimeout(() => {
            setMockModels(prev => prev.map(model =>
                model.id === id ? { ...model, status: 'Staging', accuracy: parseFloat((model.accuracy + Math.random() * 7).toFixed(2)), performanceHistory: generateMockPerformanceHistory(30).map(d => ({ date: d.date, accuracy: d.accuracy })) } : model
            ));
        }, 5000); // Simulate training time
    };

    const deployMlModel = async (model: MLModelExtended, environment: string) => {
        console.log(`Deploying model ${model.name} v${model.version} to ${environment}`);
        const newDeployment: ModelDeployment = {
            id: uuidv4(),
            modelId: model.id,
            version: model.version,
            environment: environment as any,
            status: 'Rolling Update',
            deployedAt: new Date().toISOString(),
            infrastructure: 'Kubernetes',
            region: 'us-east-1',
            monitoringEnabled: true,
            metrics: []
        };
        setMockModels(prev => prev.map(m =>
            m.id === model.id ? { ...m, deploymentHistory: [...(m.deploymentHistory || []), newDeployment], deploymentStatus: 'Rolling Update' } : m
        ));
        await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate deployment time
        setMockModels(prev => prev.map(m =>
            m.id === model.id ? { ...m, deploymentHistory: m.deploymentHistory?.map(d => d.id === newDeployment.id ? { ...d, status: 'Deployed' } : d), deploymentStatus: 'Deployed' } : m
        ));
        setMockAuditLogs(prev => [...prev, {
            id: uuidv4(), timestamp: new Date().toISOString(), actor: 'System', action: 'model_deployed', targetType: 'Deployment', targetId: newDeployment.id, details: { modelName: model.name, version: model.version, environment }
        }]);
    };

    const rollbackDeployment = async (deploymentId: string) => {
        console.log(`Rolling back deployment ${deploymentId}`);
        setMockModels(prev => prev.map(m => ({
            ...m,
            deploymentHistory: m.deploymentHistory?.map(d => d.id === deploymentId ? { ...d, status: 'Inactive' } : d)
        })));
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate rollback time
        setMockAuditLogs(prev => [...prev, {
            id: uuidv4(), timestamp: new Date().toISOString(), actor: 'System', action: 'deployment_rolled_back', targetType: 'Deployment', targetId: deploymentId, details: { deploymentId }
        }]);
    };

    const updateTrafficSplit = async (deploymentId: string, trafficSplit: { [modelId: string]: number }) => {
        console.log(`Updating traffic split for deployment ${deploymentId}:`, trafficSplit);
        setMockModels(prev => prev.map(m => ({
            ...m,
            deploymentHistory: m.deploymentHistory?.map(d => d.id === deploymentId ? { ...d, trafficSplit: trafficSplit } : d)
        })));
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate update time
        setMockAuditLogs(prev => [...prev, {
            id: uuidv4(), timestamp: new Date().toISOString(), actor: 'System', action: 'traffic_split_updated', targetType: 'Deployment', targetId: deploymentId, details: { deploymentId, trafficSplit }
        }]);
    };

    const createHPOptionRun = async (modelId: string, config: any) => {
        console.log(`Starting HPO run for model ${modelId} with config:`, config);
        const newRun: HyperparameterOptimizationRun = {
            id: uuidv4(),
            modelId: modelId,
            status: 'Running',
            startedAt: new Date().toISOString(),
            strategy: config.strategy,
            searchSpace: config.searchSpace,
            trials: []
        };
        // This is a simplified mock. In a real app, HPO runs would be managed separately.
        // Here we just simulate adding a run.
        setMockModels(prev => prev.map(m =>
            m.id === modelId ? { ...m, hpoRuns: [...(m as any).hpoRuns || [], newRun] } : m
        ));
        await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate starting
        setMockModels(prev => prev.map(m =>
            m.id === modelId ? { ...m, hpoRuns: (m as any).hpoRuns?.map((run: HyperparameterOptimizationRun) => run.id === newRun.id ? { ...run, status: 'Completed', completedAt: new Date().toISOString(), bestMetricValue: 0.93, bestParameters: { learningRate: 0.005, batchSize: 32 } } : run) } : m
        ));
        setMockAuditLogs(prev => [...prev, {
            id: uuidv4(), timestamp: new Date().toISOString(), actor: 'User', action: 'hpo_run_created', targetType: 'MLModel', targetId: modelId, details: { modelName: mockModels.find(m => m.id === modelId)?.name, strategy: config.strategy }
        }]);
    };

    const acknowledgeAlert = async (alertId: string, notes: string) => {
        setMockAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'Acknowledged', assignedTo: 'Current User', resolutionNotes: notes } : a));
        setMockAuditLogs(prev => [...prev, {
            id: uuidv4(), timestamp: new Date().toISOString(), actor: 'Current User', action: 'alert_acknowledged', targetType: 'Alert', targetId: alertId, details: { notes }
        }]);
    };

    const resolveAlert = async (alertId: string, notes: string) => {
        setMockAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'Resolved', resolutionNotes: notes || 'Resolved manually.' } : a));
        setMockAuditLogs(prev => [...prev, {
            id: uuidv4(), timestamp: new Date().toISOString(), actor: 'Current User', action: 'alert_resolved', targetType: 'Alert', targetId: alertId, details: { notes }
        }]);
    };


    const contextValue: ExtendedDataContextType = useMemo(() => ({
        mlModels: mockModels,
        retrainMlModel,
        deployMlModel,
        rollbackDeployment,
        updateTrafficSplit,
        createHPOptionRun,
        acknowledgeAlert,
        resolveAlert,
        allFeatures: mockFeatures,
        allDeployments: allDeployments,
        allAlerts: mockAlerts,
        auditLogs: mockAuditLogs,
    }), [mockModels, mockFeatures, allDeployments, mockAlerts, mockAuditLogs]);

    return (
        <DataContext.Provider value={contextValue as any}> {/* Cast to any for simplified type handling in mock */}
            {children}
        </DataContext.Provider>
    );
};

// --- START: New exported components and helpers ---

export const StatusBadge: React.FC<{ status: MLModel['status'] | ModelDeploymentStatus }> = ({ status }) => {
    const colors = {
        'Production': 'bg-green-500/20 text-green-300',
        'Staging': 'bg-cyan-500/20 text-cyan-300',
        'Training': 'bg-yellow-500/20 text-yellow-300 animate-pulse',
        'Archived': 'bg-gray-500/20 text-gray-300',
        'Deployed': 'bg-green-500/20 text-green-300',
        'Rolling Update': 'bg-indigo-500/20 text-indigo-300 animate-pulse',
        'A/B Testing': 'bg-purple-500/20 text-purple-300',
        'Canary': 'bg-orange-500/20 text-orange-300',
        'Inactive': 'bg-gray-700/20 text-gray-400',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-500/20 text-gray-300'}`}>{status}</span>;
};

export const MetricDisplay: React.FC<{ label: string; value: string | number; unit?: string; tooltip?: string }> = ({ label, value, unit, tooltip }) => (
    <div className="flex flex-col p-3 bg-gray-700/50 rounded-lg" title={tooltip}>
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-xl font-bold text-white">{value}{unit}</span>
    </div>
);

export const ModelComparisonChart: React.FC<{ models: MLModelExtended[]; metric: keyof MLModelExtended['metricsHistory'][0] }> = ({ models, metric }) => {
    const data = useMemo(() => {
        if (models.length === 0) return [];
        const latestMetrics = models.map(model => ({
            name: `${model.name} v${model.version}`,
            value: model.metricsHistory?.[model.metricsHistory.length - 1]?.[metric] || 0
        }));
        return latestMetrics;
    }, [models, metric]);

    const formatMetric = (value: number) => {
        if (metric.includes('accuracy') || metric.includes('precision') || metric.includes('recall') || metric.includes('f1Score')) {
            return `${(value * 100).toFixed(2)}%`;
        }
        return value.toFixed(2);
    };

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => formatMetric(value as number)} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} formatter={(value) => formatMetric(value as number)} />
                <Legend />
                <Bar dataKey="value" name={metric} fill="#06b6d4" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export const FeatureImportanceChart: React.FC<{ data: { feature: string; importance: number }[] }> = ({ data }) => (
    <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis type="number" stroke="#9ca3af" fontSize={12} />
            <YAxis dataKey="feature" type="category" stroke="#9ca3af" fontSize={12} width={100} />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
            <Bar dataKey="importance" fill="#facc15" name="Importance" />
        </BarChart>
    </ResponsiveContainer>
);

export const HPOTrialsChart: React.FC<{ trials: HPOCTrial[]; metricKey: string }> = ({ trials, metricKey }) => {
    const data = useMemo(() => trials.map((t, i) => ({
        ...t,
        index: i + 1
    })), [trials]);

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <XAxis dataKey="index" stroke="#9ca3af" fontSize={12} label={{ value: 'Trial Number', position: 'insideBottom', offset: -5 }} />
                <YAxis stroke="#9ca3af" fontSize={12} label={{ value: metricKey, angle: -90, position: 'insideLeft', offset: 0 }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                <Legend />
                <Line type="monotone" dataKey="metricValue" stroke="#8884d8" name={metricKey} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export const DataDriftChart: React.FC<{ data: DataDriftReport[] }> = ({ data }) => {
    const chartData = useMemo(() => data.map(d => ({
        date: d.timestamp.split('T')[0],
        overallDriftScore: d.overallDriftScore
    })), [data]);

    return (
        <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" domain={[0, 1]} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                <Legend />
                <Line type="monotone" dataKey="overallDriftScore" stroke="#eab308" name="Overall Drift Score" />
            </LineChart>
        </ResponsiveContainer>
    );
};

export const ModelCostChart: React.FC<{ data: MLModelExtended['costHistory'] }> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis yAxisId="left" stroke="#9ca3af" domain={[ 'dataMin - 1', 'dataMax + 1' ]} unit="$" />
                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" domain={[ 'dataMin - 1', 'dataMax + 1' ]} unit="Hrs" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="cost" stroke="#22c55e" name="Cost ($)" />
                <Line yAxisId="right" type="monotone" dataKey="cpuHours" stroke="#f97316" name="CPU Hours" />
                <Line yAxisId="right" type="monotone" dataKey="gpuHours" stroke="#a855f7" name="GPU Hours" />
            </LineChart>
        </ResponsiveContainer>
    );
};

export const DeploymentMetricsChart: React.FC<{ metrics: ModelMetric[] }> = ({ metrics }) => {
    const data = useMemo(() => metrics.map(m => ({
        time: new Date(m.timestamp).toLocaleTimeString(),
        requests: m.requestsPerSecond,
        errors: m.errorRate * 100, // percentage
        latency: m.avgLatencyMs,
        cpu: m.cpuUtilization * 100,
        memory: m.memoryUtilization * 100,
        accuracy: m.predictionAccuracy ? m.predictionAccuracy * 100 : undefined
    })), [metrics]);

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} label={{ value: 'Req/s | Latency (ms)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} label={{ value: '% | Error %', angle: 90, position: 'insideRight' }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="requests" stroke="#8884d8" name="Requests/s" />
                <Line yAxisId="left" type="monotone" dataKey="latency" stroke="#82ca9d" name="Avg Latency (ms)" />
                <Line yAxisId="right" type="monotone" dataKey="errors" stroke="#ffc658" name="Error Rate (%)" />
                <Line yAxisId="right" type="monotone" dataKey="cpu" stroke="#ff7300" name="CPU Util (%)" />
                <Line yAxisId="right" type="monotone" dataKey="memory" stroke="#00c49f" name="Mem Util (%)" />
                {data.some(d => d.accuracy !== undefined) && <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#ff4d4d" name="Accuracy (%)" />}
            </LineChart>
        </ResponsiveContainer>
    );
};

export const FeatureDistributionChart: React.FC<{ data: { baseline: { [value: string]: number }; current: { [value: string]: number } } }> = ({ data }) => {
    const chartData = useMemo(() => {
        const allKeys = new Set([...Object.keys(data.baseline), ...Object.keys(data.current)]);
        return Array.from(allKeys).map(key => ({
            name: key,
            baseline: data.baseline[key] || 0,
            current: data.current[key] || 0,
        }));
    }, [data]);

    return (
        <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                <Legend />
                <Bar dataKey="baseline" fill="#06b6d4" name="Baseline" />
                <Bar dataKey="current" fill="#facc15" name="Current" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export const ModelRadarChart: React.FC<{ models: MLModelExtended[]; metrics: string[] }> = ({ models, metrics }) => {
    const data = useMemo(() => {
        if (models.length === 0) return [];
        const maxValues: { [key: string]: number } = {};
        metrics.forEach(m => {
            maxValues[m] = Math.max(...models.map(model => (model.metricsHistory?.[model.metricsHistory.length - 1]?.[m as keyof MLModelExtended['metricsHistory'][0]] || 0) as number));
        });

        return models.map(model => {
            const latestMetrics = model.metricsHistory?.[model.metricsHistory.length - 1] || {};
            const item: { [key: string]: string | number } = { model: model.name };
            metrics.forEach(m => {
                const value = (latestMetrics[m as keyof MLModelExtended['metricsHistory'][0]] || 0) as number;
                item[m] = value;
                item[`${m}_normalized`] = maxValues[m] > 0 ? value / maxValues[m] : 0;
            });
            return item;
        });
    }, [models, metrics]);

    const radarMetrics = metrics.map(m => ({
        name: m,
        fullMark: 1, // Normalized
        unit: m.includes('accuracy') || m.includes('precision') || m.includes('recall') || m.includes('f1Score') ? '%' : ''
    }));

    const formatTick = (value: number) => {
        if (value === 0) return '0';
        return (value * 100).toFixed(0);
    };

    return (
        <ResponsiveContainer width="100%" height={350}>
            <RadarChart outerRadius={90} data={data}>
                <PolarGrid stroke="#4b5563" />
                <PolarAngleAxis dataKey="model" stroke="#9ca3af" fontSize={12} />
                <PolarRadiusAxis angle={90} domain={[0, 1]} stroke="#9ca3af" fontSize={10} tickFormatter={formatTick} />
                {models.map((model, index) => (
                    <Radar key={model.id} name={`${model.name} v${model.version}`} dataKey={metrics.map(m => `${m}_normalized`)} stroke={`hsl(${index * 137}, 70%, 50%)`} fill={`hsl(${index * 137}, 70%, 50%)`} fillOpacity={0.6} />
                ))}
                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                <Legend />
            </RadarChart>
        </ResponsiveContainer>
    );
};


export const HPOConfigForm: React.FC<{ onRun: (config: any) => void; isLoading: boolean; onGenerate: (prompt: string) => Promise<string | null> }> = ({ onRun, isLoading, onGenerate }) => {
    const [strategy, setStrategy] = useState('Bayesian Optimization');
    const [learningRateMin, setLearningRateMin] = useState('0.0001');
    const [learningRateMax, setLearningRateMax] = useState('0.1');
    const [batchSizes, setBatchSizes] = useState('16,32,64');
    const [numLayersMin, setNumLayersMin] = useState('2');
    const [numLayersMax, setNumLayersMax] = useState('5');
    const [aiSuggestions, setAiSuggestions] = useState('');
    const [isAiGenerating, setIsAiGenerating] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const config = {
            strategy,
            searchSpace: {
                learningRate: { type: 'float', min: parseFloat(learningRateMin), max: parseFloat(learningRateMax) },
                batchSize: { type: 'categorical', values: batchSizes.split(',').map(Number) },
                numLayers: { type: 'int', min: parseInt(numLayersMin), max: parseInt(numLayersMax) }
            }
        };
        onRun(config);
    };

    const handleGenerateAISuggestions = async () => {
        setIsAiGenerating(true);
        const prompt = `Generate hyperparameter optimization suggestions for a typical classification model. Suggest reasonable ranges for learningRate (float), batchSize (categorical list), and number of layers (integer range). Explain why these ranges are good. Format as a brief professional paragraph.`;
        const response = await onGenerate(prompt);
        setAiSuggestions(response || "Could not generate AI suggestions.");
        setIsAiGenerating(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300">Strategy</label>
                <select value={strategy} onChange={(e) => setStrategy(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500 text-white">
                    <option value="Bayesian Optimization">Bayesian Optimization</option>
                    <option value="Grid Search">Grid Search</option>
                    <option value="Random Search">Random Search</option>
                </select>
            </div>
            <fieldset className="border border-gray-600 p-4 rounded-md space-y-3">
                <legend className="text-sm font-medium text-gray-300 px-2">Search Space</legend>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Learning Rate (min)</label>
                    <input type="number" step="0.0001" value={learningRateMin} onChange={(e) => setLearningRateMin(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Learning Rate (max)</label>
                    <input type="number" step="0.0001" value={learningRateMax} onChange={(e) => setLearningRateMax(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Batch Sizes (comma-separated)</label>
                    <input type="text" value={batchSizes} onChange={(e) => setBatchSizes(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" placeholder="e.g., 16,32,64" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Num Layers (min)</label>
                    <input type="number" step="1" value={numLayersMin} onChange={(e) => setNumLayersMin(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Num Layers (max)</label>
                    <input type="number" step="1" value={numLayersMax} onChange={(e) => setNumLayersMax(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
            </fieldset>
            <div className="flex gap-2">
                <button type="submit" disabled={isLoading} className="flex-grow px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white disabled:opacity-50">
                    {isLoading ? 'Running HPO...' : 'Start HPO Run'}
                </button>
                <button type="button" onClick={handleGenerateAISuggestions} disabled={isAiGenerating} className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white disabled:opacity-50">
                    {isAiGenerating ? 'Generating...' : 'AI Suggest'}
                </button>
            </div>
            {aiSuggestions && (
                <div className="mt-4 p-3 bg-gray-800 rounded-lg text-sm text-gray-300">
                    <p className="font-semibold text-white">AI Suggestions:</p>
                    <p className="whitespace-pre-line">{aiSuggestions}</p>
                </div>
            )}
        </form>
    );
};

export const DeploymentConfigurationForm: React.FC<{
    model: MLModelExtended;
    onDeploy: (environment: string, trafficSplit?: { [modelId: string]: number }) => void;
    onGenerateAISuggestions: (prompt: string) => Promise<string | null>;
    isLoading: boolean;
}> = ({ model, onDeploy, onGenerateAISuggestions, isLoading }) => {
    const [environment, setEnvironment] = useState('production');
    const [trafficSplitConfig, setTrafficSplitConfig] = useState('100'); // 100 for single, 10 for canary, etc.
    const [partnerModelId, setPartnerModelId] = useState('');
    const [aiSuggestions, setAiSuggestions] = useState('');
    const [isAiGenerating, setIsAiGenerating] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let split: { [modelId: string]: number } | undefined = undefined;
        if (environment === 'canary' || environment === 'ab_test') {
            const currentModelShare = parseFloat(trafficSplitConfig) / 100;
            split = { [model.id]: currentModelShare };
            if (partnerModelId && currentModelShare < 1) {
                split[partnerModelId] = 1 - currentModelShare;
            } else if (currentModelShare < 1) {
                // If no partner model, assume remaining traffic goes to current production model (not this new one)
                split['current_production'] = 1 - currentModelShare;
            }
        }
        onDeploy(environment, split);
    };

    const handleGenerateAISuggestions = async () => {
        setIsAiGenerating(true);
        const prompt = `Given model "${model.name} v${model.version}" with accuracy ${model.accuracy}%, suggest appropriate deployment strategies (e.g., direct, canary, A/B) for staging and production environments. Include considerations for traffic splitting, rollback plans, and monitoring.`;
        const response = await onGenerateAISuggestions(prompt);
        setAiSuggestions(response || "Could not generate AI deployment suggestions.");
        setIsAiGenerating(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold text-white">Deploy {model.name} v{model.version}</h3>
            <div>
                <label className="block text-sm font-medium text-gray-300">Environment</label>
                <select value={environment} onChange={(e) => setEnvironment(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                    <option value="canary">Canary Release</option>
                    <option value="ab_test">A/B Test</option>
                </select>
            </div>
            {(environment === 'canary' || environment === 'ab_test') && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Traffic Split for this Model (%)</label>
                        <input type="number" min="0" max="100" value={trafficSplitConfig} onChange={(e) => setTrafficSplitConfig(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Compare with Model ID (optional, e.g., current production model)</label>
                        <input type="text" value={partnerModelId} onChange={(e) => setPartnerModelId(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" placeholder="e.g., model-XYZ" />
                    </div>
                </>
            )}
            <div className="flex gap-2">
                <button type="submit" disabled={isLoading} className="flex-grow px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white disabled:opacity-50">
                    {isLoading ? 'Deploying...' : 'Deploy Model'}
                </button>
                <button type="button" onClick={handleGenerateAISuggestions} disabled={isAiGenerating} className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white disabled:opacity-50">
                    {isAiGenerating ? 'Generating...' : 'AI Advise'}
                </button>
            </div>
            {aiSuggestions && (
                <div className="mt-4 p-3 bg-gray-700 rounded-lg text-sm text-gray-300">
                    <p className="font-semibold text-white">AI Deployment Advice:</p>
                    <p className="whitespace-pre-line">{aiSuggestions}</p>
                </div>
            )}
        </form>
    );
};

export const AlertConfigurationForm: React.FC<{
    modelId: string;
    onSave: (alert: MLAlertExtended) => void;
    onGenerateAISuggestions: (prompt: string) => Promise<string | null>;
    isLoading: boolean;
}> = ({ modelId, onSave, onGenerateAISuggestions, isLoading }) => {
    const [metric, setMetric] = useState('accuracy_drop');
    const [threshold, setThreshold] = useState('0.05');
    const [severity, setSeverity] = useState<MLAlertExtended['severity']>('High');
    const [aiSuggestions, setAiSuggestions] = useState('');
    const [isAiGenerating, setIsAiGenerating] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newAlert: MLAlertExtended = {
            id: uuidv4(),
            modelId: modelId,
            modelName: `Model ${modelId}`, // Placeholder, would fetch from context
            metric,
            threshold: parseFloat(threshold),
            currentValue: 0, // Will be updated by monitoring system
            triggeredAt: new Date().toISOString(),
            status: 'Active',
            severity,
            message: `Alert configured for ${metric} on model ${modelId}. Threshold: ${threshold}.`
        };
        onSave(newAlert);
    };

    const handleGenerateAISuggestions = async () => {
        setIsAiGenerating(true);
        const prompt = `Suggest key performance indicators (KPIs) and reasonable thresholds for setting up alerts on a machine learning model. Consider accuracy, latency, error rate, and data drift. Provide a brief, professional summary.`;
        const response = await onGenerateAISuggestions(prompt);
        setAiSuggestions(response || "Could not generate AI alert suggestions.");
        setIsAiGenerating(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold text-white">Configure New Alert</h3>
            <div>
                <label className="block text-sm font-medium text-gray-300">Metric</label>
                <select value={metric} onChange={(e) => setMetric(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                    <option value="accuracy_drop">Accuracy Drop</option>
                    <option value="latency_spike">Latency Spike (ms)</option>
                    <option value="error_rate_increase">Error Rate Increase (%)</option>
                    <option value="data_drift">Data Drift Score</option>
                    <option value="feature_value_anomaly">Feature Value Anomaly</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300">Threshold</label>
                <input type="number" step="0.01" value={threshold} onChange={(e) => setThreshold(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300">Severity</label>
                <select value={severity} onChange={(e) => setSeverity(e.target.value as MLAlertExtended['severity'])} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                </select>
            </div>
            <div className="flex gap-2">
                <button type="submit" disabled={isLoading} className="flex-grow px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white disabled:opacity-50">
                    {isLoading ? 'Saving...' : 'Create Alert'}
                </button>
                <button type="button" onClick={handleGenerateAISuggestions} disabled={isAiGenerating} className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white disabled:opacity-50">
                    {isAiGenerating ? 'Generating...' : 'AI Tips'}
                </button>
            </div>
            {aiSuggestions && (
                <div className="mt-4 p-3 bg-gray-700 rounded-lg text-sm text-gray-300">
                    <p className="font-semibold text-white">AI Alerting Tips:</p>
                    <p className="whitespace-pre-line">{aiSuggestions}</p>
                </div>
            )}
        </form>
    );
};


export const GovernanceAuditLog: React.FC<{ logs: AuditLogEntry[] }> = ({ logs }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Timestamp</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actor</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Target</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Details</th>
                    </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {logs.map(log => (
                        <tr key={log.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{log.actor}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan-400">{log.action.replace(/_/g, ' ')}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{log.targetType} ({log.targetId.substring(0, 8)})</td>
                            <td className="px-6 py-4 text-sm text-gray-400">
                                {Object.entries(log.details).map(([key, value]) => (
                                    <div key={key} className="flex gap-1">
                                        <span className="font-semibold text-gray-300">{key}:</span>
                                        <span className="text-gray-400">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                                    </div>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const FairnessBiasReport: React.FC<{ model: MLModelExtended; onGenerate: (prompt: string) => Promise<string | null> }> = ({ model, onGenerate }) => {
    const [report, setReport] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const generateFairnessReport = async () => {
        setIsLoading(true);
        setReport('');
        try {
            const prompt = `Generate a fairness and bias assessment report for an ML model. Model details: Name=${model.name}, Version=${model.version}, Accuracy=${model.accuracy}%. Assume it processes data with demographic attributes. Discuss potential sources of bias (e.g., data, algorithm), methods for detection (e.g., disparate impact, equal opportunity), and mitigation strategies.`;
            const aiReport = await onGenerate(prompt);
            setReport(aiReport || "Could not generate fairness and bias report.");
        } catch (error) {
            setReport("Error generating report: " + error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Fairness and Bias Assessment for {model.name} v{model.version}</h3>
            <button onClick={generateFairnessReport} disabled={isLoading} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white disabled:opacity-50">
                {isLoading ? 'Generating Report...' : 'Generate Fairness Report (AI)'}
            </button>
            {report && (
                <div className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300 whitespace-pre-line">
                    {report}
                </div>
            )}
            {!report && !isLoading && (
                <p className="text-gray-500">Click "Generate Fairness Report" to get an AI-powered assessment of potential fairness and bias issues.</p>
            )}
        </div>
    );
};


// --- END: New exported components and helpers ---


const PredictiveModelsView: React.FC = () => {
    const context = useContext(DataContext) as ExtendedDataContextType;
    if (!context) throw new Error("PredictiveModelsView must be within a DataProvider");

    const { mlModels, retrainMlModel, deployMlModel, rollbackDeployment, updateTrafficSplit, createHPOptionRun, allFeatures, allDeployments, allAlerts, acknowledgeAlert, resolveAlert, auditLogs } = context;
    const [selectedModel, setSelectedModel] = useState<MLModelExtended | null>(mlModels[0] || null);
    const [aiDocs, setAiDocs] = useState('');
    const [isDocsLoading, setIsDocsLoading] = useState(false);
    const [selectedComparisonModels, setSelectedComparisonModels] = useState<MLModelExtended[]>([]);
    const [selectedMetricForComparison, setSelectedMetricForComparison] = useState<keyof MLModelExtended['metricsHistory'][0]>('accuracy');
    const [hpoFormLoading, setHpoFormLoading] = useState(false);
    const [selectedXAIInsight, setSelectedXAIInsight] = useState<XAIInsight | null>(null);
    const [activeDeploymentTab, setActiveDeploymentTab] = useState<'monitor' | 'deploy' | 'history'>('monitor');
    const [activeDriftTab, setActiveDriftTab] = useState<'overview' | 'features'>('overview');
    const [selectedDriftFeature, setSelectedDriftFeature] = useState<string | null>(null);
    const [activeFeatureStoreTab, setActiveFeatureStoreTab] = useState<'browse' | 'create' | 'settings'>('browse');
    const [activeAlertTab, setActiveAlertTab] = useState<'active' | 'resolved' | 'configure'>('active');
    const [alertConfigLoading, setAlertConfigLoading] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState<MLAlertExtended | null>(null);
    const [aiChatInput, setAiChatInput] = useState('');
    const [aiChatHistory, setAiChatHistory] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
    const [isAiChatLoading, setIsAiChatLoading] = useState(false);

    const googleGenAI = useMemo(() => new GoogleGenAI({apiKey: process.env.NEXT_PUBLIC_API_KEY as string}), []);


    const generateDocs = async (model: MLModelExtended) => {
        setAiDocs('');
        setIsDocsLoading(true);
        try {
            const prompt = `Generate a brief, professional documentation entry for this machine learning model. Include a short description, its primary use case, key features, and a summary of its current performance and recent deployments. Model details: Name=${model.name}, Version=${model.version}, Accuracy=${model.accuracy}%, Status=${model.status}, Deployments=${model.deploymentHistory?.length || 0}.`;
            const response = await googleGenAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' }).generateContent(prompt);
            setAiDocs(response.response.text());
        } catch(err) {
            setAiDocs("Could not generate documentation. Error: " + (err as Error).message);
        } finally {
            setIsDocsLoading(false);
        }
    };

    const generateAiContent = async (prompt: string): Promise<string | null> => {
        try {
            const response = await googleGenAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' }).generateContent(prompt);
            return response.response.text();
        } catch (err) {
            console.error("AI content generation failed:", err);
            return null;
        }
    };

    const handleAIChatSubmit = async () => {
        if (!aiChatInput.trim()) return;
        const currentInput = aiChatInput;
        setAiChatInput('');
        setAiChatHistory(prev => [...prev, { role: 'user', text: currentInput }]);
        setIsAiChatLoading(true);

        try {
            const history = aiChatHistory.map(entry => ({ role: entry.role === 'user' ? 'user' : 'model', parts: [{ text: entry.text }] }));
            const model = googleGenAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
            const chat = model.startChat({ history: history as any }); // Cast to any because the actual type is a bit more complex.
            const result = await chat.sendMessage(currentInput);
            const responseText = result.response.text();
            setAiChatHistory(prev => [...prev, { role: 'ai', text: responseText }]);
        } catch (err) {
            setAiChatHistory(prev => [...prev, { role: 'ai', text: "Sorry, I couldn't process that. Please try again. Error: " + (err as Error).message }]);
        } finally {
            setIsAiChatLoading(false);
        }
    };

    const handleModelComparisonSelection = (model: MLModelExtended) => {
        setSelectedComparisonModels(prev =>
            prev.includes(model) ? prev.filter(m => m.id !== model.id) : [...prev, model]
        );
    };

    const handleDeploy = async (environment: string, trafficSplit?: { [modelId: string]: number }) => {
        if (selectedModel) {
            await deployMlModel(selectedModel, environment);
            // After deployment, you might want to switch to monitoring tab
            setActiveDeploymentTab('monitor');
            setSelectedModel(mlModels.find(m => m.id === selectedModel.id) || null); // Refresh selected model
        }
    };

    const handleSaveAlert = async (alert: MLAlertExtended) => {
        setAlertConfigLoading(true);
        // In a real app, this would call an API to save the alert rule.
        // For this mock, we'll just log and assume success.
        console.log("Saving new alert:", alert);
        // Add to context mock alerts if it were available to update
        // setMockAlerts(prev => [...prev, alert]);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setAlertConfigLoading(false);
        setActiveAlertTab('active');
    };

    const getModelDeploymentCurrentMetrics = (deployment: ModelDeployment) => {
        if (!deployment.metrics || deployment.metrics.length === 0) return null;
        return deployment.metrics[deployment.metrics.length - 1];
    };

    const selectedDriftReport = useMemo(() => {
        if (!selectedModel || !selectedModel.dataDriftHistory) return null;
        return selectedModel.dataDriftHistory[selectedModel.dataDriftHistory.length - 1];
    }, [selectedModel]);

    const filteredAlerts = useMemo(() => {
        if (!selectedModel) return { active: [], resolved: [] };
        const modelAlerts = allAlerts.filter(a => a.modelId === selectedModel.id);
        return {
            active: modelAlerts.filter(a => a.status === 'Active' || a.status === 'Acknowledged'),
            resolved: modelAlerts.filter(a => a.status === 'Resolved'),
        };
    }, [allAlerts, selectedModel]);


    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Predictive Models Hub (MLOps)</h2>

            {/* AI Assistant Chat */}
            <Card title="AI MLOps Assistant">
                <div className="flex flex-col h-80">
                    <div className="flex-grow overflow-y-auto p-2 space-y-2 bg-gray-800 rounded-md">
                        {aiChatHistory.length === 0 && (
                            <p className="text-gray-500 text-center py-4">Start a conversation with your AI MLOps assistant. Ask about model performance, deployment strategies, or debugging.</p>
                        )}
                        {aiChatHistory.map((entry, index) => (
                            <div key={index} className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs px-4 py-2 rounded-lg ${entry.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                                    {entry.text}
                                </div>
                            </div>
                        ))}
                        {isAiChatLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-xs px-4 py-2 rounded-lg bg-gray-700 text-gray-200 animate-pulse">
                                    Typing...
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="mt-2 flex">
                        <input
                            type="text"
                            value={aiChatInput}
                            onChange={(e) => setAiChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAIChatSubmit()}
                            className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-l-md text-white focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="Ask the AI about your models..."
                            disabled={isAiChatLoading}
                        />
                        <button
                            onClick={handleAIChatSubmit}
                            disabled={isAiChatLoading || !aiChatInput.trim()}
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-r-md text-white disabled:opacity-50"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </Card>


            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                    <Card title="Model Registry">
                         <div className="space-y-2 max-h-96 overflow-y-auto">
                            {mlModels.map(model => (
                                <button key={model.id} onClick={() => setSelectedModel(model)} className={`w-full text-left p-3 rounded-lg border-l-4 transition-colors ${selectedModel?.id === model.id ? 'bg-cyan-500/20 border-cyan-400' : 'bg-gray-800/50 border-transparent hover:bg-gray-700/50'}`}>
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-white">{model.name} <span className="font-mono text-sm text-gray-400">v{model.version}</span></p>
                                        <StatusBadge status={model.status} />
                                    </div>
                                    <p className="text-xs text-gray-400">Accuracy: {model.accuracy}%</p>
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-3">
                    <Card title={selectedModel ? `Performance: ${selectedModel.name} v${selectedModel.version}` : 'Select a Model'}>
                        {selectedModel ? (
                            <>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={selectedModel.performanceHistory}>
                                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                                    <YAxis stroke="#9ca3af" domain={[ 'dataMin - 1', 'dataMax + 1' ]} unit="%" />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                    <Line type="monotone" dataKey="accuracy" stroke="#06b6d4" name="Accuracy" />
                                </LineChart>
                            </ResponsiveContainer>
                            <div className="flex justify-end gap-2 mt-4">
                                <button onClick={() => generateDocs(selectedModel)} disabled={isDocsLoading} className="text-xs px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-lg text-white">AI Docs</button>
                                <button onClick={() => retrainMlModel(selectedModel.id)} disabled={selectedModel.status === 'Training'} className="text-xs px-3 py-1 bg-cyan-600 hover:bg-cyan-700 rounded-lg disabled:opacity-50 text-white">{selectedModel.status === 'Training' ? 'Training...' : 'Retrain'}</button>
                            </div>
                            </>
                        ) : (
                            <div className="h-80 flex items-center justify-center text-gray-500">Select a model to see its details.</div>
                        )}
                    </Card>
                </div>
            </div>

            {(isDocsLoading || aiDocs) && (
                <Card title="AI-Generated Documentation">
                    {isDocsLoading ? <p className="text-gray-400">Generating...</p> : <p className="text-sm text-gray-300 whitespace-pre-line">{aiDocs}</p>}
                </Card>
            )}

            {/* New Section: Model Comparison */}
            <Card title="Model Comparison">
                <div className="mb-4">
                    <p className="text-gray-300 mb-2">Select models to compare:</p>
                    <div className="flex flex-wrap gap-2">
                        {mlModels.map(model => (
                            <button
                                key={`comp-${model.id}`}
                                onClick={() => handleModelComparisonSelection(model)}
                                className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedComparisonModels.includes(model) ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                            >
                                {model.name} v{model.version}
                            </button>
                        ))}
                    </div>
                </div>

                {selectedComparisonModels.length > 0 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <MetricDisplay label="Models Selected" value={selectedComparisonModels.length} />
                            <MetricDisplay label="Avg Accuracy" value={parseFloat((selectedComparisonModels.reduce((sum, m) => sum + m.accuracy, 0) / selectedComparisonModels.length).toFixed(2))} unit="%" />
                            <MetricDisplay label="Best Model" value={selectedComparisonModels.reduce((best, m) => m.accuracy > best.accuracy ? m : best, selectedComparisonModels[0]).name} tooltip="Based on Accuracy" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Key Metrics Comparison</h3>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Select Metric:</label>
                                    <select
                                        value={selectedMetricForComparison}
                                        onChange={(e) => setSelectedMetricForComparison(e.target.value as keyof MLModelExtended['metricsHistory'][0])}
                                        className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500 text-white text-sm"
                                    >
                                        <option value="accuracy">Accuracy</option>
                                        <option value="precision">Precision</option>
                                        <option value="recall">Recall</option>
                                        <option value="f1Score">F1 Score</option>
                                        <option value="latency">Latency (ms)</option>
                                        <option value="throughput">Throughput (req/s)</option>
                                    </select>
                                </div>
                                <ModelComparisonChart models={selectedComparisonModels} metric={selectedMetricForComparison} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Normalized Performance Radar</h3>
                                <ModelRadarChart models={selectedComparisonModels} metrics={['accuracy', 'precision', 'recall', 'f1Score', 'latency', 'throughput']} />
                            </div>
                        </div>

                        <button
                            onClick={async () => {
                                const prompt = `Analyze the comparison results of the following models based on their latest metrics: ${selectedComparisonModels.map(m => `${m.name} v${m.version} (Accuracy: ${m.accuracy}%, Precision: ${m.metricsHistory?.[m.metricsHistory.length - 1]?.precision?.toFixed(2)}, Latency: ${m.metricsHistory?.[m.metricsHistory.length - 1]?.latency?.toFixed(2)}ms)`).join('; ')}. Highlight strengths and weaknesses of each model and recommend which one might be best for low-latency, high-accuracy production use.`;
                                const aiReport = await generateAiContent(prompt);
                                setAiDocs(aiReport || "Could not generate AI comparison analysis.");
                                setIsDocsLoading(false); // Assume generateAiContent manages its own loading, or set a separate one
                            }}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white text-sm"
                        >
                            AI Comparison Analysis
                        </button>
                    </div>
                )}
                {selectedComparisonModels.length === 0 && (
                    <div className="h-40 flex items-center justify-center text-gray-500">Select at least one model for comparison.</div>
                )}
            </Card>

            {/* New Section: Model Deployment & Monitoring */}
            {selectedModel && (
                <Card title={`Deployment & Monitoring: ${selectedModel.name} v${selectedModel.version}`}>
                    <div className="mb-4 border-b border-gray-700">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button
                                onClick={() => setActiveDeploymentTab('monitor')}
                                className={`${activeDeploymentTab === 'monitor' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                            >
                                Live Monitoring
                            </button>
                            <button
                                onClick={() => setActiveDeploymentTab('deploy')}
                                className={`${activeDeploymentTab === 'deploy' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                            >
                                Deploy New Version
                            </button>
                            <button
                                onClick={() => setActiveDeploymentTab('history')}
                                className={`${activeDeploymentTab === 'history' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                            >
                                Deployment History
                            </button>
                        </nav>
                    </div>

                    {activeDeploymentTab === 'monitor' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-white">Active Deployments</h3>
                            {(selectedModel.deploymentHistory?.filter(d => d.status !== 'Inactive') || []).length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedModel.deploymentHistory?.filter(d => d.status !== 'Inactive').map(deployment => {
                                        const latestMetrics = getModelDeploymentCurrentMetrics(deployment);
                                        return (
                                            <div key={deployment.id} className="bg-gray-800 p-4 rounded-lg space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <p className="font-semibold text-white">Env: <span className="capitalize">{deployment.environment}</span> ({deployment.version})</p>
                                                    <StatusBadge status={deployment.status} />
                                                </div>
                                                <p className="text-sm text-gray-400">Deployed: {new Date(deployment.deployedAt).toLocaleString()}</p>
                                                {deployment.trafficSplit && (
                                                    <p className="text-sm text-gray-400">Traffic: {Object.entries(deployment.trafficSplit).map(([id, share]) => `${mlModels.find(m => m.id === id)?.name || id.substring(0,8)}: ${(share * 100).toFixed(0)}%`).join(', ')}</p>
                                                )}
                                                {latestMetrics ? (
                                                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                                                        <p>Req/s: {latestMetrics.requestsPerSecond.toFixed(0)}</p>
                                                        <p>Latency: {latestMetrics.avgLatencyMs.toFixed(1)}ms</p>
                                                        <p>Errors: {(latestMetrics.errorRate * 100).toFixed(2)}%</p>
                                                        <p>CPU: {(latestMetrics.cpuUtilization * 100).toFixed(1)}%</p>
                                                    </div>
                                                ) : <p className="text-sm text-gray-500">No live metrics available.</p>}
                                                <DeploymentMetricsChart metrics={deployment.metrics || []} />
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => rollbackDeployment(deployment.id)} className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 rounded-lg text-white">Rollback</button>
                                                    {deployment.environment === 'canary' && (
                                                        <button onClick={() => updateTrafficSplit(deployment.id, {[selectedModel.id]: 1})} className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded-lg text-white">Promote to 100%</button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-500">No active deployments for this model.</p>
                            )}
                        </div>
                    )}

                    {activeDeploymentTab === 'deploy' && (
                        <DeploymentConfigurationForm
                            model={selectedModel}
                            onDeploy={(env, split) => handleDeploy(env, split)}
                            onGenerateAISuggestions={generateAiContent}
                            isLoading={false} // Would link to deployment state
                        />
                    )}

                    {activeDeploymentTab === 'history' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white">Past Deployments</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-700">
                                    <thead className="bg-gray-700">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Version</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Environment</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Deployed At</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Infra</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                                        {(selectedModel.deploymentHistory || []).map(dep => (
                                            <tr key={dep.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{dep.version}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">{dep.environment}</td>
                                                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={dep.status} /></td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(dep.deployedAt).toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{dep.infrastructure}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </Card>
            )}

            {/* New Section: Data Drift & Anomaly Detection */}
            {selectedModel && selectedDriftReport && (
                <Card title={`Data Drift Detection: ${selectedModel.name} v${selectedModel.version}`}>
                     <div className="mb-4 border-b border-gray-700">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button
                                onClick={() => setActiveDriftTab('overview')}
                                className={`${activeDriftTab === 'overview' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveDriftTab('features')}
                                className={`${activeDriftTab === 'features' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                            >
                                Feature-Level Analysis
                            </button>
                        </nav>
                    </div>

                    {activeDriftTab === 'overview' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <MetricDisplay label="Last Check" value={new Date(selectedDriftReport.timestamp).toLocaleString()} />
                                <MetricDisplay label="Overall Drift Score" value={selectedDriftReport.overallDriftScore.toFixed(2)} tooltip="Higher score indicates more drift" />
                                <MetricDisplay label="Drift Detected" value={selectedDriftReport.driftDetected ? 'YES' : 'No'} unit="" tooltip="Based on overall drift threshold" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">Overall Drift Score History</h3>
                            <DataDriftChart data={selectedModel.dataDriftHistory || []} />
                            <button
                                onClick={async () => {
                                    const prompt = `Analyze the current data drift report for model ${selectedModel.name} v${selectedModel.version}. Overall drift score: ${selectedDriftReport.overallDriftScore}. Features with significant drift: ${selectedDriftReport.features.filter(f => f.driftScore > 0.25).map(f => `${f.name} (score: ${f.driftScore.toFixed(2)})`).join(', ')}. Provide an AI-powered summary of the potential impact on model performance and suggest remediation steps.`;
                                    const aiReport = await generateAiContent(prompt);
                                    setAiDocs(aiReport || "Could not generate AI drift analysis.");
                                    setIsDocsLoading(false);
                                }}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white text-sm"
                            >
                                AI Drift Analysis
                            </button>
                        </div>
                    )}

                    {activeDriftTab === 'features' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white mb-2">Individual Feature Drift</h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {selectedDriftReport.features.map(f => (
                                    <button
                                        key={f.name}
                                        onClick={() => setSelectedDriftFeature(f.name)}
                                        className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedDriftFeature === f.name ? 'bg-orange-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                                    >
                                        {f.name} (Score: {f.driftScore.toFixed(2)})
                                    </button>
                                ))}
                            </div>

                            {selectedDriftFeature && (
                                <div className="bg-gray-800 p-4 rounded-lg space-y-3">
                                    <h4 className="text-md font-semibold text-white">Feature: {selectedDriftFeature}</h4>
                                    {selectedDriftReport.features.find(f => f.name === selectedDriftFeature)?.distributionShift ? (
                                        <>
                                            <p className="text-sm text-gray-400">Distribution Shift Detected</p>
                                            <FeatureDistributionChart data={selectedDriftReport.features.find(f => f.name === selectedDriftFeature)!.distributionShift!} />
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-500">No significant distribution shift detected for this feature currently.</p>
                                    )}
                                    <p className="text-sm text-gray-400">Drift Score: {selectedDriftReport.features.find(f => f.name === selectedDriftFeature)?.driftScore.toFixed(2)}</p>
                                    <p className="text-sm text-gray-400">Anomalies Detected: {selectedDriftReport.features.find(f => f.name === selectedDriftFeature)?.anomaliesDetected}</p>
                                </div>
                            )}
                            {!selectedDriftFeature && <p className="text-gray-500">Select a feature to view its detailed drift analysis.</p>}
                        </div>
                    )}
                </Card>
            )}

            {/* New Section: Explainable AI (XAI) */}
            {selectedModel && selectedModel.xaiInsights && selectedModel.xaiInsights.length > 0 && (
                <Card title={`Explainable AI (XAI): ${selectedModel.name} v${selectedModel.version}`}>
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Global Feature Importance</h3>
                        <FeatureImportanceChart data={selectedModel.featureImportance} />

                        <h3 className="text-lg font-semibold text-white">Local Explanations</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {selectedModel.xaiInsights.map(insight => (
                                <button
                                    key={insight.id}
                                    onClick={() => setSelectedXAIInsight(insight)}
                                    className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedXAIInsight?.id === insight.id ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                                >
                                    {insight.type} ({new Date(insight.generatedAt).toLocaleDateString()})
                                </button>
                            ))}
                        </div>

                        {selectedXAIInsight && (
                            <div className="bg-gray-800 p-4 rounded-lg space-y-3">
                                <h4 className="text-md font-semibold text-white">{selectedXAIInsight.type} Explanation</h4>
                                <p className="text-sm text-gray-300">{selectedXAIInsight.description}</p>
                                {selectedXAIInsight.prediction && (
                                    <p className="text-sm text-gray-400">Predicted: {selectedXAIInsight.prediction.label} (Prob: {(selectedXAIInsight.prediction.probability * 100).toFixed(1)}%)</p>
                                )}
                                <div className="mt-2 text-sm text-gray-400">
                                    <p className="font-semibold text-white">Explanation Data:</p>
                                    <pre className="whitespace-pre-wrap bg-gray-900 p-2 rounded-md overflow-x-auto">
                                        {JSON.stringify(selectedXAIInsight.explanationData, null, 2)}
                                    </pre>
                                </div>
                                <button
                                    onClick={async () => {
                                        const prompt = `Explain the following XAI insight in a simple, non-technical way, suitable for a business stakeholder. Focus on what features drove the prediction and what it means. Insight details: Type=${selectedXAIInsight.type}, Description=${selectedXAIInsight.description}, Prediction=${JSON.stringify(selectedXAIInsight.prediction)}, ExplanationData=${JSON.stringify(selectedXAIInsight.explanationData)}.`;
                                        const aiReport = await generateAiContent(prompt);
                                        setAiDocs(aiReport || "Could not generate AI XAI explanation.");
                                        setIsDocsLoading(false);
                                    }}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white text-sm"
                                >
                                    AI Explain Insight
                                </button>
                            </div>
                        )}
                        {!selectedXAIInsight && selectedModel.xaiInsights.length > 0 && (
                            <p className="text-gray-500">Select an insight to view its details.</p>
                        )}
                        {selectedModel.xaiInsights.length === 0 && (
                             <p className="text-gray-500">No XAI insights available for this model.</p>
                        )}
                    </div>
                </Card>
            )}

            {/* New Section: Hyperparameter Optimization (HPO) */}
            {selectedModel && (
                <Card title={`Hyperparameter Optimization (HPO): ${selectedModel.name} v${selectedModel.version}`}>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Configure New HPO Run</h3>
                                <HPOConfigForm onRun={async (config) => {
                                    setHpoFormLoading(true);
                                    await createHPOptionRun(selectedModel.id, config);
                                    setHpoFormLoading(false);
                                    setSelectedModel(mlModels.find(m => m.id === selectedModel.id) || null); // Refresh model data
                                }} isLoading={hpoFormLoading} onGenerate={generateAiContent} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Previous HPO Runs</h3>
                                {((selectedModel as any).hpoRuns || []).length > 0 ? (
                                    <div className="space-y-4">
                                        {((selectedModel as any).hpoRuns || []).map((run: HyperparameterOptimizationRun) => (
                                            <div key={run.id} className="bg-gray-800 p-4 rounded-lg space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <p className="font-semibold text-white">Strategy: {run.strategy}</p>
                                                    <StatusBadge status={run.status === 'Completed' ? 'Deployed' : run.status === 'Running' ? 'Training' : 'Archived'} />
                                                </div>
                                                <p className="text-sm text-gray-400">Started: {new Date(run.startedAt).toLocaleString()}</p>
                                                {run.bestMetricValue && <p className="text-sm text-gray-400">Best Metric: {run.bestMetricValue.toFixed(4)}</p>}
                                                {run.bestParameters && (
                                                    <div className="text-sm text-gray-400">
                                                        <p className="font-semibold text-white">Best Params:</p>
                                                        <pre className="bg-gray-900 p-2 rounded-md overflow-x-auto">{JSON.stringify(run.bestParameters, null, 2)}</pre>
                                                    </div>
                                                )}
                                                {run.trials.length > 0 && (
                                                    <HPOTrialsChart trials={run.trials} metricKey="Metric Value" />
                                                )}
                                                <button
                                                    onClick={async () => {
                                                        const prompt = `Analyze the results of this HPO run for model ${selectedModel.name} v${selectedModel.version}. Strategy: ${run.strategy}, Best Metric: ${run.bestMetricValue}, Best Parameters: ${JSON.stringify(run.bestParameters)}. Explain why these parameters might be optimal and suggest next steps for further optimization.`;
                                                        const aiReport = await generateAiContent(prompt);
                                                        setAiDocs(aiReport || "Could not generate AI HPO analysis.");
                                                        setIsDocsLoading(false);
                                                    }}
                                                    className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 rounded-lg text-white"
                                                >
                                                    AI Analyze Run
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No HPO runs recorded for this model.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* New Section: Feature Store Management */}
            <Card title="Feature Store">
                <div className="mb-4 border-b border-gray-700">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveFeatureStoreTab('browse')}
                            className={`${activeFeatureStoreTab === 'browse' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            Browse Features
                        </button>
                        <button
                            onClick={() => setActiveFeatureStoreTab('create')}
                            className={`${activeFeatureStoreTab === 'create' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            Create New Feature
                        </button>
                        <button
                            onClick={() => setActiveFeatureStoreTab('settings')}
                            className={`${activeFeatureStoreTab === 'settings' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            Feature Settings
                        </button>
                    </nav>
                </div>

                {activeFeatureStoreTab === 'browse' && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Version</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Updated</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Used By</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Quality</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                {allFeatures.map(feature => (
                                    <tr key={feature.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{feature.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">{feature.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{feature.version}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(feature.lastUpdated).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan-400">
                                            {feature.usedByModels.map(m => m.modelName).join(', ')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            Missing: {(feature.dataQualityMetrics.missingRate * 100).toFixed(1)}%<br/>
                                            Outliers: {feature.dataQualityMetrics.outlierCount}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button
                            onClick={async () => {
                                const prompt = `Analyze the current feature store and suggest new features that could be engineered from existing raw data to improve model performance, or identify redundant/low-quality features. Current features: ${allFeatures.map(f => f.name).join(', ')}.`;
                                const aiReport = await generateAiContent(prompt);
                                setAiDocs(aiReport || "Could not generate AI feature engineering suggestions.");
                                setIsDocsLoading(false);
                            }}
                            className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white text-sm"
                        >
                            AI Feature Engineering Ideas
                        </button>
                    </div>
                )}
                 {activeFeatureStoreTab === 'create' && (
                    <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
                        <h3 className="text-lg font-semibold text-white">Define New Feature</h3>
                        <p className="text-gray-400">This section would allow defining new features, their transformations, sources, and expected schemas. For a real app, this would involve a complex form and integration with data pipelines.</p>
                        <form className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Feature Name</label>
                                <input type="text" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" placeholder="e.g., customer_lifetime_value" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Description</label>
                                <textarea className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" rows={3} placeholder="A short description of the feature..."></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Source SQL/Transformation Logic</label>
                                <textarea className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white font-mono" rows={5} placeholder="SELECT ..., TRANSFORM(...) FROM ..."></textarea>
                            </div>
                            <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white">Save Feature Definition</button>
                        </form>
                    </div>
                )}
                 {activeFeatureStoreTab === 'settings' && (
                    <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
                        <h3 className="text-lg font-semibold text-white">Feature Store Configuration</h3>
                        <p className="text-gray-400">This section would manage global feature store settings, such as data retention policies, access controls, and integration with data warehouses.</p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>Data retention policy: 5 years for historical features.</li>
                            <li>Access control: Role-based access for feature definitions and values.</li>
                            <li>Data source integration: Connected to Snowflake and Google BigQuery.</li>
                            <li>Data freshness: Features updated daily, some real-time.</li>
                        </ul>
                        <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white">Edit Global Settings</button>
                    </div>
                )}
            </Card>

            {/* New Section: Incident Management & Alerting */}
            {selectedModel && (
                <Card title={`Alerts & Incidents: ${selectedModel.name} v${selectedModel.version}`}>
                    <div className="mb-4 border-b border-gray-700">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button
                                onClick={() => setActiveAlertTab('active')}
                                className={`${activeAlertTab === 'active' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                            >
                                Active Alerts ({filteredAlerts.active.length})
                            </button>
                            <button
                                onClick={() => setActiveAlertTab('resolved')}
                                className={`${activeAlertTab === 'resolved' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                            >
                                Resolved Alerts ({filteredAlerts.resolved.length})
                            </button>
                            <button
                                onClick={() => setActiveAlertTab('configure')}
                                className={`${activeAlertTab === 'configure' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                            >
                                Configure Alert
                            </button>
                        </nav>
                    </div>

                    {activeAlertTab === 'active' && (
                        <div className="space-y-4">
                            {filteredAlerts.active.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredAlerts.active.map(alert => (
                                        <div key={alert.id} className="bg-gray-800 p-4 rounded-lg space-y-2">
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold text-white">{alert.metric.replace(/_/g, ' ')}</p>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${alert.severity === 'Critical' ? 'bg-red-500/20 text-red-300' : alert.severity === 'High' ? 'bg-orange-500/20 text-orange-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{alert.severity}</span>
                                            </div>
                                            <p className="text-sm text-gray-400">{alert.message}</p>
                                            <p className="text-xs text-gray-500">Triggered at: {new Date(alert.triggeredAt).toLocaleString()}</p>
                                            <p className="text-xs text-gray-500">Threshold: {alert.threshold}, Current: {alert.currentValue}</p>
                                            {alert.assignedTo && <p className="text-xs text-gray-500">Assigned To: {alert.assignedTo}</p>}
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setSelectedAlert(alert)} className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 rounded-lg text-white">View Details</button>
                                                <button onClick={() => acknowledgeAlert(alert.id, 'Acknowledged from UI')} className="px-3 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white">Acknowledge</button>
                                                <button onClick={() => resolveAlert(alert.id, 'Resolved manually from UI')} className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 rounded-lg text-white">Resolve</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No active alerts for this model.</p>
                            )}
                        </div>
                    )}

                    {activeAlertTab === 'resolved' && (
                         <div className="space-y-4">
                            {filteredAlerts.resolved.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredAlerts.resolved.map(alert => (
                                        <div key={alert.id} className="bg-gray-800 p-4 rounded-lg space-y-2">
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold text-white">{alert.metric.replace(/_/g, ' ')}</p>
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-300">Resolved</span>
                                            </div>
                                            <p className="text-sm text-gray-400">{alert.message}</p>
                                            <p className="text-xs text-gray-500">Triggered at: {new Date(alert.triggeredAt).toLocaleString()}</p>
                                            <p className="text-xs text-gray-500">Resolution Notes: {alert.resolutionNotes || 'N/A'}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No resolved alerts for this model.</p>
                            )}
                         </div>
                    )}

                    {activeAlertTab === 'configure' && (
                        <AlertConfigurationForm
                            modelId={selectedModel.id}
                            onSave={handleSaveAlert}
                            onGenerateAISuggestions={generateAiContent}
                            isLoading={alertConfigLoading}
                        />
                    )}

                    {/* Alert Details Modal/Card */}
                    {selectedAlert && (
                        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                            <Card title={`Alert Details: ${selectedAlert.metric.replace(/_/g, ' ')}`} className="max-w-xl w-full">
                                <div className="space-y-3 text-sm text-gray-300">
                                    <p><span className="font-semibold text-white">Model:</span> {selectedAlert.modelName} v{selectedModel.version}</p>
                                    <p><span className="font-semibold text-white">Severity:</span> <span className={`font-medium ${selectedAlert.severity === 'Critical' ? 'text-red-400' : selectedAlert.severity === 'High' ? 'text-orange-400' : 'text-yellow-400'}`}>{selectedAlert.severity}</span></p>
                                    <p><span className="font-semibold text-white">Status:</span> <span className="capitalize">{selectedAlert.status}</span></p>
                                    <p><span className="font-semibold text-white">Message:</span> {selectedAlert.message}</p>
                                    <p><span className="font-semibold text-white">Triggered At:</span> {new Date(selectedAlert.triggeredAt).toLocaleString()}</p>
                                    <p><span className="font-semibold text-white">Threshold:</span> {selectedAlert.threshold}, <span className="font-semibold text-white">Current Value:</span> {selectedAlert.currentValue}</p>
                                    <p><span className="font-semibold text-white">Assigned To:</span> {selectedAlert.assignedTo || 'Unassigned'}</p>
                                    {selectedAlert.resolutionNotes && <p><span className="font-semibold text-white">Resolution Notes:</span> {selectedAlert.resolutionNotes}</p>}

                                    <div className="flex justify-end gap-2 mt-4">
                                        <button onClick={() => setSelectedAlert(null)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white">Close</button>
                                        {selectedAlert.status !== 'Resolved' && (
                                            <>
                                                <button onClick={() => { acknowledgeAlert(selectedAlert.id, 'Acknowledged via detail view'); setSelectedAlert(null); }} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white">Acknowledge</button>
                                                <button onClick={() => { resolveAlert(selectedAlert.id, 'Resolved via detail view'); setSelectedAlert(null); }} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white">Resolve</button>
                                            </>
                                        )}
                                        <button
                                            onClick={async () => {
                                                const prompt = `Provide an AI-powered root cause analysis for the following alert: Model=${selectedAlert.modelName} v${selectedModel.version}, Metric=${selectedAlert.metric}, Threshold=${selectedAlert.threshold}, Current Value=${selectedAlert.currentValue}, Message=${selectedAlert.message}. Suggest immediate and long-term actions.`;
                                                const aiReport = await generateAiContent(prompt);
                                                setAiDocs(aiReport || "Could not generate AI root cause analysis.");
                                                setIsDocsLoading(false);
                                                setSelectedAlert(null); // Close modal after generating docs
                                            }}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
                                        >
                                            AI RCA
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                </Card>
            )}

            {/* New Section: Model Cost & Resource Management */}
            {selectedModel && selectedModel.costHistory && (
                <Card title={`Cost & Resource Management: ${selectedModel.name} v${selectedModel.version}`}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <MetricDisplay label="Total Cost (30 Days)" value={`$${selectedModel.costHistory.reduce((sum, h) => sum + h.cost, 0).toFixed(2)}`} />
                            <MetricDisplay label="Avg CPU Hours/Day" value={(selectedModel.costHistory.reduce((sum, h) => sum + h.cpuHours, 0) / selectedModel.costHistory.length).toFixed(1)} unit="h" />
                            <MetricDisplay label="Avg GPU Hours/Day" value={(selectedModel.costHistory.reduce((sum, h) => sum + h.gpuHours, 0) / selectedModel.costHistory.length).toFixed(1)} unit="h" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Cost & Resource Usage Over Time</h3>
                        <ModelCostChart data={selectedModel.costHistory} />
                        <button
                            onClick={async () => {
                                const prompt = `Analyze the cost and resource usage data for model ${selectedModel.name} v${selectedModel.version}. Recent costs: ${selectedModel.costHistory?.slice(-3).map(h => `$${h.cost} (CPU: ${h.cpuHours}h, GPU: ${h.gpuHours}h)`).join(', ')}. Provide AI-powered recommendations for cost optimization, including infrastructure changes, autoscaling suggestions, or model efficiency improvements.`;
                                const aiReport = await generateAiContent(prompt);
                                setAiDocs(aiReport || "Could not generate AI cost optimization suggestions.");
                                setIsDocsLoading(false);
                            }}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white text-sm"
                        >
                            AI Cost Optimization
                        </button>
                    </div>
                </Card>
            )}

            {/* New Section: Governance & Compliance */}
            <Card title="Governance & Compliance">
                <div className="mb-4 border-b border-gray-700">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => { /* no-op for now, just a placeholder */ }}
                            className={`border-cyan-500 text-cyan-400 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Audit Log
                        </button>
                        <button
                            onClick={() => { /* no-op for now, just a placeholder */ }}
                            className={`border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Bias & Fairness Reports
                        </button>
                        <button
                            onClick={() => { /* no-op for now, just a placeholder */ }}
                            className={`border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Regulatory Reports
                        </button>
                    </nav>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">Recent Audit Log</h3>
                <GovernanceAuditLog logs={auditLogs} />

                {selectedModel && (
                    <div className="mt-6">
                        <FairnessBiasReport model={selectedModel} onGenerate={generateAiContent} />
                    </div>
                )}

                 <div className="mt-6 space-y-4 p-4 bg-gray-800 rounded-lg">
                    <h3 className="text-lg font-semibold text-white">Regulatory Report Generation</h3>
                    <p className="text-gray-400">Generate compliance reports for various regulatory standards (e.g., GDPR, HIPAA, industry-specific).</p>
                    <div className="flex gap-2">
                        <select className="flex-grow bg-gray-700 border-gray-600 rounded-md shadow-sm text-white text-sm">
                            <option>Select Standard...</option>
                            <option>GDPR Compliance</option>
                            <option>HIPAA Compliance</option>
                            <option>Financial Sector Regulations</option>
                        </select>
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white">Generate Report</button>
                        <button
                            onClick={async () => {
                                const prompt = `Explain the key requirements for GDPR compliance regarding machine learning models and data usage. What specific aspects should be audited?`;
                                const aiReport = await generateAiContent(prompt);
                                setAiDocs(aiReport || "Could not generate AI compliance explanation.");
                                setIsDocsLoading(false);
                            }}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white text-sm"
                        >
                            AI Explain Standards
                        </button>
                    </div>
                </div>
            </Card>

            {/* Placeholder for Advanced Model Builder/Workflow Editor */}
            <Card title="Advanced ML Workflow Builder">
                <div className="h-96 flex items-center justify-center bg-gray-800 rounded-lg border-2 border-dashed border-gray-700 text-gray-500">
                    <div className="text-center space-y-2">
                        <p className="text-xl font-semibold">Drag & Drop ML Pipeline Construction</p>
                        <p className="text-sm">Visually design and orchestrate complex ML workflows, from data ingestion to model serving.</p>
                        <button className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 rounded-lg text-white">Launch Workflow Editor</button>
                    </div>
                </div>
                <div className="mt-4 p-4 bg-gray-800 rounded-lg space-y-3">
                    <h3 className="text-lg font-semibold text-white">Pre-defined Workflow Templates</h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                        <li>Classification Pipeline (Data Prep & Training)</li>
                        <li>Real-time Inference Microservice</li>
                        <li>Batch Prediction Job</li>
                        <li>A/B Testing Experiment Setup</li>
                    </ul>
                    <button
                        onClick={async () => {
                            const prompt = `Suggest advanced ML workflow patterns for robust MLOps, including stages for continuous integration, continuous delivery, monitoring, and automated retraining.`;
                            const aiReport = await generateAiContent(prompt);
                            setAiDocs(aiReport || "Could not generate AI workflow suggestions.");
                            setIsDocsLoading(false);
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white text-sm"
                    >
                        AI Workflow Best Practices
                    </button>
                </div>
            </Card>


        </div>
    );
};

// Export the main component wrapped with the mock data provider if not already
// This allows testing the component in isolation, assuming DataProvider context is external.
// For the purpose of *adding* lines, we'll keep the MockDataContext local and the main export as is.
// If this were the entry point, it would be:
// export default () => <MockDataContext><PredictiveModelsView /></MockDataContext>;

export default PredictiveModelsView;