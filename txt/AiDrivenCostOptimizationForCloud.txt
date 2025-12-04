// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect, useCallback, createContext, useContext, useMemo } from 'react';
import type { Feature } from '../../../types';

// --- External Service Integration Types (Mocked/Simulated) ---

/**
 * Represents a generic cloud provider resource.
 * This is a highly simplified representation for demonstration.
 */
export interface CloudResource {
    id: string;
    name: string;
    type: 'EC2Instance' | 'S3Bucket' | 'RDSInstance' | 'KubernetesPod' | 'LambdaFunction' | 'Disk' | 'NetworkInterface' | 'LoadBalancer' | 'NatGateway' | 'ManagedDatabase' | 'VirtualMachine' | 'StorageAccount' | 'FunctionApp' | 'ContainerInstance' | 'DataLake' | 'CDN' | 'VPN' | 'Firewall' | 'Queue' | 'Topic' | 'KeyVault' | 'Registry' | 'SearchService' | 'MachineLearningWorkspace' | 'DataFactory';
    provider: 'AWS' | 'Azure' | 'GCP' | 'OnPremise';
    region: string;
    status: 'running' | 'stopped' | 'terminated' | 'idle' | 'provisioned' | 'active' | 'inactive';
    tags: Record<string, string>;
    configuration: Record<string, any>; // e.g., instance type, storage size, CPU/memory limits
    costPerUnitPerHour?: number; // Example base rate
    unit?: string; // e.g., "hour", "GB"
    parentResourceId?: string; // For nested resources like disks on VMs
    associatedWorkloadId?: string; // Link to business workload
}

/**
 * Represents raw usage data for a cloud resource.
 * This would typically come from cloud billing reports or monitoring systems.
 */
export interface UsageData {
    resourceId: string;
    timestamp: number; // Unix timestamp
    metric: 'cpu_utilization' | 'memory_utilization' | 'network_in' | 'network_out' | 'disk_reads' | 'disk_writes' | 'requests' | 'data_processed_gb' | 'active_connections';
    value: number;
    unit: string; // e.g., "%", "GB", "count"
    aggregationPeriodHours?: number; // e.g., 1 hour, 24 hours
}

/**
 * Represents aggregated cost data for a resource or a group of resources.
 */
export interface CostData {
    resourceId: string;
    timestamp: number; // Start of the billing period
    periodDays: number; // e.g., 1 day, 7 days, 30 days
    totalCost: number;
    currency: string;
    serviceType: string; // e.g., "EC2", "S3", "Compute Engine"
    usageQuantity?: number; // Total usage quantity over the period
    unit?: string; // Unit of usage (e.g., "Hrs", "GB")
    costComponents?: { name: string; cost: number; unit?: string }[]; // Detailed breakdown
}

/**
 * Represents a potential optimization recommendation.
 */
export interface OptimizationRecommendation {
    id: string;
    resourceId: string;
    type: 'Rightsizing' | 'WasteElimination' | 'ReservedInstance' | 'SpotInstance' | 'PolicyViolation' | 'DataTransferOptimization' | 'ArchitecturalRefinement';
    severity: 'critical' | 'high' | 'medium' | 'low';
    potentialSavingsUSD: number;
    description: string;
    justification: string; // Explanation of why this recommendation is made (XAI)
    confidenceScore: number; // Aethelgard's confidence in the recommendation (0-1)
    ethicalImpactScore: number; // Aethelgard's assessment of potential ethical implications (0-1)
    estimatedPerformanceImpact: 'none' | 'low' | 'medium' | 'high';
    recommendedAction: 'terminate' | 'resize' | 'modify_configuration' | 'purchase_ri_sp' | 'migrate_to_spot' | 'refactor_architecture';
    targetConfiguration?: Record<string, any>; // e.g., new instance type, new storage size
    relatedResources?: string[]; // Other resources affected by this recommendation
    provenanceDetails?: {
        dataSources: string[];
        analysisSteps: string[];
        modelsUsed: string[];
    }; // Ethos Layer transparency
    status: 'pending' | 'approved' | 'rejected' | 'applied';
    proposedByOracle: string; // Which Agora Oracle proposed it
}

/**
 * Represents a policy rule for cost optimization.
 */
export interface OptimizationPolicy {
    id: string;
    name: string;
    description: string;
    ruleType: 'TagBasedExclusion' | 'CostThresholdAlert' | 'UtilizationThreshold' | 'AutomatedAction';
    criteria: Record<string, any>; // e.g., { tag: "Environment", value: "Production" }, { cpuAvg: 0.1, durationDays: 30 }
    action: 'alert' | 'recommend' | 'auto_stop' | 'auto_resize' | 'no_action';
    enabled: boolean;
    priority: number; // Higher priority rules take precedence
}

/**
 * Represents a detected anomaly in cloud costs or usage.
 */
export interface CostAnomaly {
    id: string;
    resourceId?: string;
    timestamp: number;
    anomalyType: 'cost_spike' | 'usage_deviation' | 'new_resource_type' | 'unexpected_data_transfer';
    severity: 'critical' | 'high' | 'medium';
    description: string;
    observedValue: number;
    expectedValue: number;
    deviationPercentage: number;
    justification: string; // Chronos Engine's causal explanation
    recommendationId?: string; // Link to a generated optimization recommendation
}

/**
 * Represents a projected future cost.
 */
export interface CostProjection {
    timestamp: number; // Start of the projection period
    projectedCostUSD: number;
    confidenceIntervalLower?: number;
    confidenceIntervalUpper?: number;
    factorsConsidered: string[];
    scenarioName?: string;
}

/**
 * General Aethelgard Insight structure for complex findings.
 */
export interface AethelgardInsight {
    id: string;
    title: string;
    description: string;
    category: 'Architecture' | 'OperationalEfficiency' | 'SecurityCompliance' | 'CostOptimization';
    relevanceScore: number;
    generatedBy: 'Lumina' | 'Chronos' | 'Agora' | 'Ethos';
    details: Record<string, any>;
    timestamp: number;
}

// --- Constants and Enums ---
export const CLOUD_PROVIDERS = ['AWS', 'Azure', 'GCP', 'OnPremise'] as const;
export type CloudProvider = (typeof CLOUD_PROVIDERS)[number];

export const RESOURCE_TYPES = ['EC2Instance', 'S3Bucket', 'RDSInstance', 'KubernetesPod', 'LambdaFunction', 'Disk', 'NetworkInterface', 'LoadBalancer', 'NatGateway', 'ManagedDatabase', 'VirtualMachine', 'StorageAccount', 'FunctionApp', 'ContainerInstance', 'DataLake', 'CDN', 'VPN', 'Firewall', 'Queue', 'Topic', 'KeyVault', 'Registry', 'SearchService', 'MachineLearningWorkspace', 'DataFactory'] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const OPTIMIZATION_TYPES = ['Rightsizing', 'WasteElimination', 'ReservedInstance', 'SpotInstance', 'PolicyViolation', 'DataTransferOptimization', 'ArchitecturalRefinement'] as const;
export type OptimizationType = (typeof OPTIMIZATION_TYPES)[number];

export const RECO_SEVERITIES = ['critical', 'high', 'medium', 'low'] as const;
export type RecoSeverity = (typeof RECO_SEVERITIES)[number];

export const ANOMALY_TYPES = ['cost_spike', 'usage_deviation', 'new_resource_type', 'unexpected_data_transfer'] as const;
export type AnomalyType = (typeof ANOMALY_TYPES)[number];

// --- Mock Data Generation Utilities ---

let resourceCounter = 0;
const generateResourceId = (type: ResourceType) => `${type.substring(0, 3).toUpperCase()}-${++resourceCounter}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

export const mockCloudResource = (provider: CloudProvider, type: ResourceType, tags?: Record<string, string>, config?: Record<string, any>): CloudResource => {
    const id = generateResourceId(type);
    const name = `${type} ${id.split('-')[2]}`;
    const region = { 'AWS': 'us-east-1', 'Azure': 'eastus', 'GCP': 'us-central1', 'OnPremise': 'datacenter-1' }[provider];
    const baseCost = Math.random() * 0.5 + 0.01; // $0.01 to $0.5 per hour
    const unit = (type === 'S3Bucket' || type === 'StorageAccount' || type === 'DataLake') ? 'GB-month' : 'hour';

    return {
        id,
        name,
        type,
        provider,
        region,
        status: (Math.random() > 0.9 && type !== 'S3Bucket') ? 'stopped' : 'running',
        tags: tags || { Environment: 'Development', Project: 'AethelgardDemo' + Math.floor(Math.random() * 3) },
        configuration: config || {
            cpu: Math.floor(Math.random() * 8) + 1,
            memory: (Math.floor(Math.random() * 16) + 1) * 1024, // MB
            storageGB: Math.floor(Math.random() * 500) + 50,
        },
        costPerUnitPerHour: unit === 'hour' ? parseFloat((baseCost * Math.random() * 10).toFixed(4)) : undefined, // More diverse hourly rates
        unit: unit,
    };
};

export const mockUsageData = (resourceId: string, days: number, metric: UsageData['metric']): UsageData[] => {
    const data: UsageData[] = [];
    const now = Date.now();
    for (let i = 0; i < days * 24; i++) {
        const timestamp = now - (i * 3600 * 1000); // Hourly data
        let value = 0;
        let unit = '';

        switch (metric) {
            case 'cpu_utilization':
            case 'memory_utilization':
                value = Math.max(0, Math.min(100, Math.random() * 70 + 10 + (Math.sin(i / 24) * 20))); // 10-90% with daily pattern
                unit = '%';
                break;
            case 'network_in':
            case 'network_out':
                value = Math.random() * 1000 + 50; // MB/hr
                unit = 'MB';
                break;
            case 'disk_reads':
            case 'disk_writes':
                value = Math.random() * 500 + 10; // IOPS
                unit = 'IOPS';
                break;
            case 'requests':
                value = Math.floor(Math.random() * 50000 + 1000); // requests/hr
                unit = 'count';
                break;
            case 'data_processed_gb':
                value = parseFloat((Math.random() * 50).toFixed(2)); // GB/hr
                unit = 'GB';
                break;
            default:
                value = Math.random() * 100;
                unit = 'unit';
        }
        data.push({ resourceId, timestamp, metric, value, unit, aggregationPeriodHours: 1 });
    }
    return data.reverse(); // Chronological order
};

export const mockCostData = (resource: CloudResource, days: number): CostData[] => {
    const data: CostData[] = [];
    const now = Date.now();
    const baseCostPerHour = resource.costPerUnitPerHour || 0.05; // Default if not set
    const usageFactor = resource.type === 'S3Bucket' ? 0.01 : 1; // Storage is cheaper per unit than compute

    for (let i = 0; i < days; i++) {
        const timestamp = now - (i * 24 * 3600 * 1000); // Daily data
        const dailyUsageHours = 24 * (Math.random() * 0.8 + 0.2); // Resource might not be 100% utilized
        const dailyQuantity = resource.type === 'S3Bucket' ? (resource.configuration.storageGB || 100) * (1 + Math.random() * 0.1 - 0.05) : dailyUsageHours;
        const totalCost = parseFloat((baseCostPerHour * dailyQuantity * usageFactor).toFixed(2));

        data.push({
            resourceId: resource.id,
            timestamp,
            periodDays: 1,
            totalCost,
            currency: 'USD',
            serviceType: resource.type.includes('Instance') || resource.type === 'VirtualMachine' ? 'Compute' :
                resource.type.includes('S3') || resource.type.includes('Storage') || resource.type.includes('DataLake') ? 'Storage' :
                    resource.type.includes('Database') ? 'Database' : 'Other',
            usageQuantity: parseFloat(dailyQuantity.toFixed(2)),
            unit: resource.unit,
            costComponents: [
                { name: 'Compute', cost: totalCost * 0.7, unit: 'Hrs' },
                { name: 'Storage', cost: totalCost * 0.2, unit: 'GB' },
                { name: 'Network', cost: totalCost * 0.1, unit: 'GB' },
            ]
        });
    }
    return data.reverse();
};

export const generateMockData = (numResources: number = 100) => {
    const resources: CloudResource[] = [];
    for (let i = 0; i < numResources; i++) {
        const provider = CLOUD_PROVIDERS[Math.floor(Math.random() * CLOUD_PROVIDERS.length)];
        const type = RESOURCE_TYPES[Math.floor(Math.random() * RESOURCE_TYPES.length)];
        resources.push(mockCloudResource(provider, type));
    }

    const usageData: UsageData[] = [];
    const costData: CostData[] = [];
    resources.forEach(res => {
        usageData.push(...mockUsageData(res.id, 90, 'cpu_utilization'));
        usageData.push(...mockUsageData(res.id, 90, 'memory_utilization'));
        if (res.type.includes('S3') || res.type.includes('Storage')) {
            usageData.push(...mockUsageData(res.id, 90, 'data_processed_gb'));
        }
        costData.push(...mockCostData(res, 90));
    });

    const recommendations: OptimizationRecommendation[] = [];
    const policies: OptimizationPolicy[] = [
        { id: 'p-1', name: 'Dev Env Auto-Stop', description: 'Automatically stop development instances outside business hours.', ruleType: 'AutomatedAction', criteria: { tag: 'Environment', value: 'Development', schedule: 'daily_22:00-06:00' }, action: 'auto_stop', enabled: true, priority: 10 },
        { id: 'p-2', name: 'High Cost Alert', description: 'Alert for resources exceeding $500/month.', ruleType: 'CostThresholdAlert', criteria: { monthlyCostThreshold: 500 }, action: 'alert', enabled: true, priority: 5 },
    ];
    const anomalies: CostAnomaly[] = [];
    const insights: AethelgardInsight[] = [];

    return { resources, usageData, costData, recommendations, policies, anomalies, insights };
};

// --- Aethelgard Core Architectural Principles Implementation ---

/**
 * A. The Lumina Core: Substrate of Cognitive Illumination
 * Focuses on contextual awareness and semantic depth.
 * Ingests, normalizes, and builds a knowledge graph from disparate data sources.
 */
export class LuminaCore {
    private knowledgeGraph: Map<string, any> = new Map(); // Represents a simplified knowledge graph
    private dataSources: Map<string, any> = new Map();
    private semanticModels: Map<string, (data: any) => any> = new Map();

    constructor() {
        console.log("Lumina Core initialized: Ready for polymorphic data abstraction and adaptive relational graphing.");
        // Initialize basic semantic models
        this.semanticModels.set('cloud_resource_tags', this.processResourceTags);
        this.semanticModels.set('usage_metrics_context', this.contextualizeUsageMetrics);
        this.semanticModels.set('cost_breakdown_ontology', this.mapCostComponentsOntology);
    }

    /**
     * Polymorphic Data Abstraction: Ingests and normalizes data.
     * @param dataSourceId Unique ID for the data source.
     * @param dataType Type of data (e.g., 'CloudResource', 'UsageData', 'CostData').
     * @param rawData Array of raw data objects.
     * @returns Processed data.
     */
    public ingestData(dataSourceId: string, dataType: string, rawData: any[]): any[] {
        this.dataSources.set(dataSourceId, rawData);
        console.log(`Lumina Core: Ingesting ${rawData.length} items from ${dataSourceId} as ${dataType}.`);
        let processedData: any[] = [];

        // Apply semantic models for normalization and contextualization
        switch (dataType) {
            case 'CloudResource':
                processedData = rawData.map((resource: CloudResource) => ({
                    ...resource,
                    semanticContext: this.semanticModels.get('cloud_resource_tags')?.(resource.tags),
                    // Further abstraction, e.g., mapping instance types to a generalized compute capacity
                    generalizedComputeCapacity: this.generalizeCompute(resource.configuration),
                }));
                break;
            case 'UsageData':
                processedData = rawData.map((usage: UsageData) => ({
                    ...usage,
                    contextualMetric: this.semanticModels.get('usage_metrics_context')?.(usage),
                }));
                break;
            case 'CostData':
                processedData = rawData.map((cost: CostData) => ({
                    ...cost,
                    semanticCostComponents: cost.costComponents?.map(component =>
                        this.semanticModels.get('cost_breakdown_ontology')?.(component)
                    ),
                }));
                break;
            default:
                processedData = rawData;
        }

        this.updateKnowledgeGraph(dataType, processedData);
        console.log(`Lumina Core: Ingested and processed ${processedData.length} ${dataType} entries.`);
        return processedData;
    }

    /**
     * Adaptive Relational Graphing: Builds and continuously updates a vast knowledge graph.
     * This is a highly simplified representation of a knowledge graph.
     * @param dataType The type of data being added.
     * @param processedData The data to add to the graph.
     */
    private updateKnowledgeGraph(dataType: string, processedData: any[]) {
        processedData.forEach(item => {
            const nodeId = item.id || `${dataType}-${item.name || item.timestamp}`;
            const existingNode = this.knowledgeGraph.get(nodeId);

            if (!existingNode) {
                this.knowledgeGraph.set(nodeId, { ...item, _type: dataType, _connections: new Set() });
            } else {
                // Merge/update existing node
                Object.assign(existingNode, item);
                this.knowledgeGraph.set(nodeId, existingNode);
            }

            // Establish simple connections (e.g., resource to its usage/cost)
            if (item.resourceId && item.resourceId !== nodeId) {
                this.establishConnection(item.resourceId, nodeId, `HAS_${dataType.toUpperCase()}`);
            }
            if (item.parentResourceId && item.parentResourceId !== nodeId) {
                this.establishConnection(item.parentResourceId, nodeId, `CONTAINS_${dataType.toUpperCase()}`);
            }
            if (item.associatedWorkloadId) {
                this.establishConnection(item.associatedWorkloadId, nodeId, `UTILIZES_RESOURCE`);
            }
        });
        console.log(`Lumina Core: Knowledge graph updated with ${processedData.length} ${dataType} entries. Total nodes: ${this.knowledgeGraph.size}`);
    }

    private establishConnection(sourceId: string, targetId: string, relation: string) {
        if (!this.knowledgeGraph.has(sourceId)) {
            this.knowledgeGraph.set(sourceId, { id: sourceId, _type: 'Unknown', _connections: new Set() });
        }
        if (!this.knowledgeGraph.has(targetId)) {
            this.knowledgeGraph.set(targetId, { id: targetId, _type: 'Unknown', _connections: new Set() });
        }
        this.knowledgeGraph.get(sourceId)._connections.add({ targetId, relation });
        // Optionally, add reverse connection
        this.knowledgeGraph.get(targetId)._connections.add({ targetId: sourceId, relation: `IS_PART_OF_${relation.split('_')[0]}` });
    }

    /**
     * Semantic model for resource tags: Extracts meaningful context.
     * @param tags The tags object.
     * @returns Semantic context.
     */
    private processResourceTags(tags: Record<string, string>): Record<string, string> {
        const semanticContext: Record<string, string> = {};
        for (const key in tags) {
            const lowerKey = key.toLowerCase();
            if (lowerKey.includes('env') || lowerKey.includes('environment')) {
                semanticContext.environment = tags[key];
            } else if (lowerKey.includes('proj') || lowerKey.includes('project')) {
                semanticContext.project = tags[key];
            } else if (lowerKey.includes('owner')) {
                semanticContext.owner = tags[key];
            } else if (lowerKey.includes('critical')) {
                semanticContext.criticality = tags[key];
            }
        }
        return semanticContext;
    }

    /**
     * Contextualizes usage metrics.
     * @param usage UsageData object.
     * @returns Contextualized metric.
     */
    private contextualizeUsageMetrics(usage: UsageData): { baseMetric: string; timeOfDay: string; dayOfWeek: string; seasonalFactor: number } {
        const date = new Date(usage.timestamp);
        return {
            baseMetric: usage.metric,
            timeOfDay: date.getHours().toString(),
            dayOfWeek: date.getDay().toString(),
            seasonalFactor: (date.getMonth() < 3 || date.getMonth() > 9) ? 0.8 : 1.2, // Simple seasonal
        };
    }

    /**
     * Maps cost components to a standardized ontology.
     * @param component Cost component.
     * @returns Standardized component.
     */
    private mapCostComponentsOntology(component: { name: string; cost: number; unit?: string }): { category: string; subCategory: string; cost: number; unit?: string } {
        const nameLower = component.name.toLowerCase();
        if (nameLower.includes('compute') || nameLower.includes('instance') || nameLower.includes('cpu')) {
            return { category: 'Compute', subCategory: nameLower.includes('serverless') ? 'Serverless' : 'VirtualMachine', ...component };
        }
        if (nameLower.includes('storage') || nameLower.includes('s3') || nameLower.includes('disk') || nameLower.includes('volume')) {
            return { category: 'Storage', subCategory: nameLower.includes('block') ? 'BlockStorage' : 'ObjectStorage', ...component };
        }
        if (nameLower.includes('network') || nameLower.includes('transfer') || nameLower.includes('egress')) {
            return { category: 'Networking', subCategory: 'DataTransfer', ...component };
        }
        if (nameLower.includes('database') || nameLower.includes('rds') || nameLower.includes('sql')) {
            return { category: 'Database', subCategory: 'ManagedDB', ...component };
        }
        return { category: 'Other', subCategory: 'General', ...component };
    }

    /**
     * Generalizes compute capacity from configuration.
     * @param config Resource configuration.
     * @returns Normalized compute capacity.
     */
    private generalizeCompute(config: Record<string, any>): number {
        const cpu = config.cpu || 0;
        const memoryGB = (config.memory || 0) / 1024;
        // Simple heuristic: 1 CPU core ~ 4GB memory
        return cpu + (memoryGB / 4);
    }

    /**
     * Probabilistic Inference Engines: Hypothesizes about missing information, predicts future states, evaluates plausibility.
     * @param query The inference query.
     * @param context The context for the query (e.g., resource ID).
     * @returns A plausible inference result.
     */
    public infer(query: 'missing_tags' | 'predicted_workload' | 'cost_driver_correlation', context: string): Promise<AethelgardInsight> {
        console.log(`Lumina Core: Running probabilistic inference for '${query}' on context '${context}'.`);
        return new Promise(resolve => {
            setTimeout(() => { // Simulate complex inference time
                let insight: AethelgardInsight;
                switch (query) {
                    case 'missing_tags':
                        insight = {
                            id: generateResourceId('LambdaFunction'), // Using LambdaFunction for general ID generation
                            title: `Missing Critical Tags for ${context}`,
                            description: `Resource ${context} is missing 'Environment' and 'Owner' tags, leading to poor cost allocation visibility.`,
                            category: 'OperationalEfficiency',
                            relevanceScore: 0.85,
                            generatedBy: 'Lumina',
                            details: { resourceId: context, missingTags: ['Environment', 'Owner'], suggestedTags: { Environment: 'Unknown', Owner: 'Team-X' } },
                            timestamp: Date.now(),
                        };
                        break;
                    case 'predicted_workload':
                        insight = {
                            id: generateResourceId('LambdaFunction'),
                            title: `Predicted Workload Type for ${context}`,
                            description: `Based on usage patterns (high CPU, low memory, consistent requests), resource ${context} is likely serving a compute-intensive batch processing workload.`,
                            category: 'CostOptimization',
                            relevanceScore: 0.92,
                            generatedBy: 'Lumina',
                            details: { resourceId: context, predictedWorkload: 'BatchProcessing', confidence: 0.88, usagePatternSummary: 'High CPU, moderate I/O' },
                            timestamp: Date.now(),
                        };
                        break;
                    case 'cost_driver_correlation':
                        insight = {
                            id: generateResourceId('LambdaFunction'),
                            title: `Strong Correlation: Data Transfer & Total Cost for ${context}`,
                            description: `Analysis shows a strong positive correlation (R=0.95) between network egress (data transfer out) and the total monthly cost for resource ${context}. Optimizing data transfer patterns could yield significant savings.`,
                            category: 'CostOptimization',
                            relevanceScore: 0.95,
                            generatedBy: 'Lumina',
                            details: { resourceId: context, correlatedMetrics: ['network_out', 'total_cost'], correlationCoefficient: 0.95, potentialAction: 'Review egress patterns' },
                            timestamp: Date.now(),
                        };
                        break;
                    default:
                        insight = {
                            id: generateResourceId('LambdaFunction'),
                            title: `Generic Inference for ${context}`,
                            description: `Lumina Core performed a general inference on ${context}.`,
                            category: 'OperationalEfficiency',
                            relevanceScore: 0.7,
                            generatedBy: 'Lumina',
                            details: {},
                            timestamp: Date.now(),
                        };
                }
                resolve(insight);
            }, 1000);
        });
    }

    /**
     * Meta-Cognitive Reflexivity: Identifies areas where its understanding is nascent or ambiguous.
     * @returns List of areas needing more data or clarification.
     */
    public identifyKnowledgeGaps(): string[] {
        const gaps: string[] = [];
        // Simulate identifying resources with incomplete semantic context (e.g., missing essential tags)
        const resourcesInGraph = Array.from(this.knowledgeGraph.values()).filter(node => node._type === 'CloudResource');
        resourcesInGraph.forEach(resource => {
            if (!resource.semanticContext || !resource.semanticContext.environment || !resource.semanticContext.owner) {
                gaps.push(`Resource ${resource.id} (${resource.name}) lacks complete semantic context (e.g., environment/owner tags).`);
            }
        });
        // Simulate identifying data points with low confidence scores or inconsistent patterns
        // This would require more sophisticated tracking of data quality and model certainty within the graph.
        if (Math.random() > 0.7) { // Randomly add a generic gap
            gaps.push("Uncertainty in data transfer cost component breakdown for recent GCP billing data.");
        }
        console.log(`Lumina Core: Identified ${gaps.length} knowledge gaps.`);
        return gaps;
    }

    /**
     * Retrieve data from the knowledge graph.
     * @param query Graph traversal query or direct node ID.
     * @returns Relevant data from the graph.
     */
    public queryGraph(query: { type?: string; filter?: (node: any) => boolean; relations?: string[] }): any[] {
        let results: any[] = Array.from(this.knowledgeGraph.values());
        if (query.type) {
            results = results.filter(node => node._type === query.type);
        }
        if (query.filter) {
            results = results.filter(query.filter);
        }
        // Simplified relations traversal
        if (query.relations && query.relations.length > 0) {
            const connectedResults: any[] = [];
            results.forEach(node => {
                connectedResults.push(node); // Include the original node
                if (node._connections) {
                    Array.from(node._connections).forEach((conn: any) => {
                        if (query.relations!.includes(conn.relation)) {
                            const connectedNode = this.knowledgeGraph.get(conn.targetId);
                            if (connectedNode && !connectedResults.includes(connectedNode)) {
                                connectedResults.push(connectedNode);
                            }
                        }
                    });
                }
            });
            results = connectedResults;
        }
        console.log(`Lumina Core: Querying graph resulted in ${results.length} items.`);
        return results;
    }
}

/**
 * C. The Chronos Engine: Temporal Reasoning and Predictive Synthesis
 * Analyzes historical sequences, identifies trends, models complex dynamic systems, and projects plausible future scenarios.
 */
export class ChronosEngine {
    private historicalCostData: CostData[] = [];
    private historicalUsageData: UsageData[] = [];
    private simulationModels: Map<string, (params: Record<string, any>) => any> = new Map();

    constructor() {
        console.log("Chronos Engine initialized: Ready for temporal analysis and predictive modeling.");
        // Initialize basic simulation models (e.g., growth models, resource utilization models)
        this.simulationModels.set('linear_growth', (data: number[], forecastPeriods: number) => {
            if (data.length < 2) return [];
            const lastValue = data[data.length - 1];
            const avgGrowth = data.reduce((sum, val, i, arr) => i > 0 ? sum + (val - arr[i - 1]) : sum, 0) / (data.length - 1);
            const projections = [];
            for (let i = 1; i <= forecastPeriods; i++) {
                projections.push(lastValue + (avgGrowth * i));
            }
            return projections;
        });
    }

    /**
     * Ingests historical data for temporal analysis.
     * @param costs Cost data array.
     * @param usages Usage data array.
     */
    public ingestHistoricalData(costs: CostData[], usages: UsageData[]) {
        this.historicalCostData = costs.sort((a, b) => a.timestamp - b.timestamp);
        this.historicalUsageData = usages.sort((a, b) => a.timestamp - b.timestamp);
        console.log(`Chronos Engine: Ingested ${costs.length} cost entries and ${usages.length} usage entries.`);
    }

    /**
     * Multi-Scale Temporal Analysis: Analyzes trends across different timescales.
     * @param resourceId Optional ID to filter data.
     * @param lookbackDays Number of days to look back.
     * @returns Trends and aggregated data.
     */
    public analyzeHistoricalTrends(resourceId?: string, lookbackDays: number = 90): Promise<{ daily: CostData[]; weekly: CostData[]; monthly: CostData[]; trends: Record<string, string> }> {
        return new Promise(resolve => {
            setTimeout(() => { // Simulate analysis time
                const filteredCosts = resourceId
                    ? this.historicalCostData.filter(c => c.resourceId === resourceId)
                    : this.historicalCostData;

                const cutoff = Date.now() - (lookbackDays * 24 * 3600 * 1000);
                const relevantCosts = filteredCosts.filter(c => c.timestamp >= cutoff);

                // Aggregate to weekly and monthly
                const weekly: CostData[] = []; // Simplified aggregation
                const monthly: CostData[] = []; // Simplified aggregation

                const totalCost = relevantCosts.reduce((sum, c) => sum + c.totalCost, 0);
                const avgDailyCost = totalCost / relevantCosts.length;
                const trend = avgDailyCost > (relevantCosts[0]?.totalCost || 0) ? 'increasing' : 'decreasing';

                console.log(`Chronos Engine: Analyzed historical trends for ${resourceId || 'all resources'}. Trend: ${trend}.`);

                resolve({
                    daily: relevantCosts,
                    weekly: [], // Placeholder
                    monthly: [], // Placeholder
                    trends: {
                        overall: trend,
                        last30DaysChange: `${(relevantCosts[relevantCosts.length - 1]?.totalCost - relevantCosts[Math.max(0, relevantCosts.length - 30)]?.totalCost || 0).toFixed(2)} USD`,
                    }
                });
            }, 1500);
        });
    }

    /**
     * Causal Chain Mapping: Understands how events propagate and interact over time.
     * @param anomaly Anomaly event.
     * @returns Causal explanation.
     */
    public mapCausalChain(anomaly: CostAnomaly): Promise<string> {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(`Chronos Engine: Mapping causal chain for anomaly ${anomaly.id}.`);
                let causalExplanation = `Anomaly ${anomaly.id} (${anomaly.anomalyType} on ${anomaly.resourceId || 'unknown'}) occurred due to: \n`;

                if (anomaly.anomalyType === 'cost_spike' && anomaly.resourceId) {
                    const recentUsage = this.historicalUsageData
                        .filter(u => u.resourceId === anomaly.resourceId && u.timestamp > anomaly.timestamp - (24 * 3600 * 1000) && u.timestamp < anomaly.timestamp);

                    const highCpuUsage = recentUsage.some(u => u.metric === 'cpu_utilization' && u.value > 90);
                    const highNetworkOut = recentUsage.some(u => u.metric === 'network_out' && u.value > 10000); // 10GB/hr threshold

                    if (highCpuUsage) {
                        causalExplanation += "- Sustained high CPU utilization preceding the cost spike, indicating increased computational load.\n";
                    }
                    if (highNetworkOut) {
                        causalExplanation += "- Significant increase in network egress, suggesting higher data transfer costs.\n";
                    }
                    if (!highCpuUsage && !highNetworkOut) {
                        causalExplanation += "- No clear preceding usage spike. Investigating configuration changes or new associated services.\n";
                    }
                } else if (anomaly.anomalyType === 'new_resource_type') {
                    causalExplanation += "- Detection of a new resource type. This could be due to a new deployment or an unapproved resource launch.\n";
                } else {
                    causalExplanation += "- Further investigation needed into correlating events and resource dependencies. No direct causal link immediately identified.\n";
                }

                resolve(causalExplanation);
            }, 2000);
        });
    }

    /**
     * Dynamic Simulation Environments: Creates sophisticated simulations for "what-if" scenarios.
     * @param scenarioName Name of the scenario.
     * @param baseCostData Baseline cost data.
     * @param parameters Simulation parameters (e.g., 'resize': { resourceId, newInstanceType }, 'addWorkload': { resourceType, monthlyCost }).
     * @returns Simulated cost projections.
     */
    public runWhatIfScenario(scenarioName: string, baseCostData: CostData[], parameters: Record<string, any>): Promise<CostProjection[]> {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(`Chronos Engine: Running what-if scenario '${scenarioName}' with parameters:`, parameters);
                const projections: CostProjection[] = [];
                let currentTotalCost = baseCostData.reduce((sum, c) => sum + c.totalCost, 0) / baseCostData.length; // Average daily cost

                const now = Date.now();
                for (let i = 0; i < 30; i++) { // Project 30 days
                    let simulatedCost = currentTotalCost;

                    // Apply scenario parameters
                    if (parameters.resize && parameters.resize.resourceId) {
                        // Simulate cost change due to resize (e.g., 20% reduction for rightsizing)
                        simulatedCost *= 0.98; // Small daily adjustment
                    }
                    if (parameters.addWorkload && parameters.addWorkload.monthlyCost) {
                        simulatedCost += (parameters.addWorkload.monthlyCost / 30); // Add daily cost of new workload
                    }
                    if (parameters.eliminateWaste) {
                        simulatedCost *= 0.99; // Small daily reduction from waste
                    }

                    projections.push({
                        timestamp: now + (i * 24 * 3600 * 1000),
                        projectedCostUSD: parseFloat(simulatedCost.toFixed(2)),
                        confidenceIntervalLower: parseFloat((simulatedCost * 0.9).toFixed(2)),
                        confidenceIntervalUpper: parseFloat((simulatedCost * 1.1).toFixed(2)),
                        factorsConsidered: Object.keys(parameters),
                        scenarioName: scenarioName
                    });
                    currentTotalCost = simulatedCost; // Accumulate changes
                }
                resolve(projections);
            }, 2500);
        });
    }

    /**
     * Anomaly Detection and Event Horizon Forecasting: Identifies subtle deviations.
     * @returns Detected anomalies.
     */
    public detectAnomalies(): Promise<CostAnomaly[]> {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log("Chronos Engine: Detecting anomalies.");
                const anomalies: CostAnomaly[] = [];

                // Simple anomaly detection: sudden cost spike (e.g., > 20% increase day-over-day)
                const dailyCosts = this.historicalCostData.reduce((acc, c) => {
                    const date = new Date(c.timestamp).toISOString().split('T')[0];
                    acc[date] = (acc[date] || 0) + c.totalCost;
                    return acc;
                }, {} as Record<string, number>);

                const dates = Object.keys(dailyCosts).sort();
                for (let i = 1; i < dates.length; i++) {
                    const previousDayCost = dailyCosts[dates[i - 1]] || 0;
                    const currentDayCost = dailyCosts[dates[i]];
                    if (currentDayCost && previousDayCost > 0 && ((currentDayCost - previousDayCost) / previousDayCost) > 0.20) {
                        anomalies.push({
                            id: `anomaly-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                            timestamp: new Date(dates[i]).getTime(),
                            anomalyType: 'cost_spike',
                            severity: 'high',
                            description: `Significant cost spike detected on ${dates[i]}. Costs increased by ${(((currentDayCost - previousDayCost) / previousDayCost) * 100).toFixed(1)}%.`,
                            observedValue: currentDayCost,
                            expectedValue: previousDayCost,
                            deviationPercentage: ((currentDayCost - previousDayCost) / previousDayCost) * 100,
                            justification: 'Unusual upward deviation from recent cost patterns.',
                        });
                    }
                }

                // Simulate detection of an idle resource (low CPU utilization over extended period)
                const idleResourceChecks: Record<string, { totalCpu: number; count: number }> = {};
                this.historicalUsageData.forEach(u => {
                    if (u.metric === 'cpu_utilization' && u.value < 10) { // <10% CPU
                        idleResourceChecks[u.resourceId] = idleResourceChecks[u.resourceId] || { totalCpu: 0, count: 0 };
                        idleResourceChecks[u.resourceId].totalCpu += u.value;
                        idleResourceChecks[u.resourceId].count++;
                    }
                });

                for (const resId in idleResourceChecks) {
                    if (idleResourceChecks[resId].count > 7 * 24) { // More than 7 days of low CPU
                        if (Math.random() > 0.5) { // Add some randomness to detection
                            anomalies.push({
                                id: `anomaly-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                                resourceId: resId,
                                timestamp: Date.now(),
                                anomalyType: 'usage_deviation',
                                severity: 'medium',
                                description: `Resource ${resId} has exhibited persistently low CPU utilization (${(idleResourceChecks[resId].totalCpu / idleResourceChecks[resId].count).toFixed(1)}%) for over a week.`,
                                observedValue: idleResourceChecks[resId].totalCpu / idleResourceChecks[resId].count,
                                expectedValue: 30, // Expected average
                                deviationPercentage: -1 * ((30 - (idleResourceChecks[resId].totalCpu / idleResourceChecks[resId].count)) / 30) * 100,
                                justification: 'Resource appears idle or over-provisioned based on sustained low usage.',
                            });
                        }
                    }
                }

                console.log(`Chronos Engine: Detected ${anomalies.length} anomalies.`);
                resolve(anomalies);
            }, 2000);
        });
    }

    /**
     * Historical Recapitulation and Counterfactual Exploration: "Re-run" historical events.
     * This is a complex simulation, here simplified to evaluating a past decision.
     * @param historicalTimestamp Point in time to analyze.
     * @param intervention Hypothesis intervention (e.g., 'resizedInstance', 'purchasedRI').
     * @returns Counterfactual analysis result.
     */
    public counterfactualAnalysis(historicalTimestamp: number, intervention: { type: string; details: Record<string, any> }): Promise<AethelgardInsight> {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(`Chronos Engine: Performing counterfactual analysis for intervention '${intervention.type}' at ${new Date(historicalTimestamp).toLocaleString()}.`);
                let insight: AethelgardInsight;

                if (intervention.type === 'resizedInstance' && intervention.details.resourceId) {
                    const originalCostData = this.historicalCostData.filter(c => c.resourceId === intervention.details.resourceId && c.timestamp > historicalTimestamp - (30 * 24 * 3600 * 1000) && c.timestamp < historicalTimestamp);
                    const averageOriginalCost = originalCostData.reduce((sum, c) => sum + c.totalCost, 0) / originalCostData.length;

                    // Simulate a hypothetical saving after resizing
                    const hypotheticalSavings = averageOriginalCost * 0.3; // 30% saving
                    const hypotheticalNewCost = averageOriginalCost - hypotheticalSavings;

                    insight = {
                        id: generateResourceId('LambdaFunction'),
                        title: `Counterfactual: Impact of Resizing ${intervention.details.resourceId}`,
                        description: `If resource ${intervention.details.resourceId} had been rightsized at ${new Date(historicalTimestamp).toLocaleDateString()}, we estimate a monthly saving of $${hypotheticalSavings.toFixed(2)}.`,
                        category: 'CostOptimization',
                        relevanceScore: 0.9,
                        generatedBy: 'Chronos',
                        details: {
                            resourceId: intervention.details.resourceId,
                            interventionType: intervention.type,
                            hypotheticalSavingsUSD: hypotheticalSavings,
                            originalAverageCostUSD: averageOriginalCost,
                            hypotheticalNewAverageCostUSD: hypotheticalNewCost,
                            periodAnalyzed: '30 days prior to intervention',
                        },
                        timestamp: Date.now(),
                    };
                } else {
                    insight = {
                        id: generateResourceId('LambdaFunction'),
                        title: `Counterfactual: Analysis of unknown intervention at ${new Date(historicalTimestamp).toLocaleDateString()}`,
                        description: `Chronos performed a counterfactual analysis, but the intervention type '${intervention.type}' was not specifically modeled for this context.`,
                        category: 'OperationalEfficiency',
                        relevanceScore: 0.6,
                        generatedBy: 'Chronos',
                        details: {
                            originalTimestamp: historicalTimestamp,
                            interventionDetails: intervention.details,
                            message: 'Could not perform specific counterfactual due to unmodeled intervention type.'
                        },
                        timestamp: Date.now(),
                    };
                }
                resolve(insight);
            }, 3000);
        });
    }

    /**
     * Forecasts future costs based on historical data and optionally Lumina's inferred context.
     * @param scope 'all' | resourceId.
     * @param periodsDays Number of days to forecast.
     * @param growthFactor Optional manual adjustment for growth.
     * @returns An array of CostProjection objects.
     */
    public forecastCosts(scope: 'all' | string, periodsDays: number = 30, growthFactor: number = 1): Promise<CostProjection[]> {
        return new Promise(resolve => {
            setTimeout(() => {
                let relevantCosts = this.historicalCostData;
                if (scope !== 'all') {
                    relevantCosts = relevantCosts.filter(c => c.resourceId === scope);
                }

                const dailyAggregatedCosts: number[] = [];
                const dailyCostMap: { [date: string]: number } = {};
                relevantCosts.forEach(c => {
                    const dateStr = new Date(c.timestamp).toISOString().split('T')[0];
                    dailyCostMap[dateStr] = (dailyCostMap[dateStr] || 0) + c.totalCost;
                });
                Object.keys(dailyCostMap).sort().forEach(date => dailyAggregatedCosts.push(dailyCostMap[date]));

                const forecastValues = this.simulationModels.get('linear_growth')?.(dailyAggregatedCosts, periodsDays) || [];

                const projections: CostProjection[] = [];
                const now = Date.now();
                forecastValues.forEach((val, i) => {
                    const projectedVal = val * growthFactor;
                    projections.push({
                        timestamp: now + ((i + 1) * 24 * 3600 * 1000),
                        projectedCostUSD: parseFloat(projectedVal.toFixed(2)),
                        confidenceIntervalLower: parseFloat((projectedVal * 0.9).toFixed(2)),
                        confidenceIntervalUpper: parseFloat((projectedVal * 1.1).toFixed(2)),
                        factorsConsidered: ['historical_trend', 'linear_growth_model', `growth_factor:${growthFactor}`],
                        scenarioName: 'Baseline Forecast'
                    });
                });
                console.log(`Chronos Engine: Forecasted costs for ${scope} for ${periodsDays} days.`);
                resolve(projections);
            }, 1800);
        });
    }
}

/**
 * B. The Agora Network: Federated Intelligence and Collaborative Learning
 * A decentralized mesh of specialized cognitive modules (Oracles) contributing unique analytical capabilities.
 */
export interface Oracle {
    name: string;
    domain: string;
    analyze(resources: CloudResource[], usage: UsageData[], costs: CostData[], policies: OptimizationPolicy[], luminaCore: LuminaCore, chronosEngine: ChronosEngine): Promise<OptimizationRecommendation[]>;
}

export class ReservedInstanceOracle implements Oracle {
    name = "ReservedInstanceOracle";
    domain = "Purchasing Optimization";

    public async analyze(resources: CloudResource[], usage: UsageData[], costs: CostData[], policies: OptimizationPolicy[], luminaCore: LuminaCore, chronosEngine: ChronosEngine): Promise<OptimizationRecommendation[]> {
        console.log(`${this.name}: Analyzing potential Reserved Instance/Savings Plan opportunities.`);
        const recommendations: OptimizationRecommendation[] = [];

        const eligibleResources = resources.filter(r =>
            (r.type === 'EC2Instance' || r.type === 'RDSInstance' || r.type === 'VirtualMachine' || r.type === 'ManagedDatabase') &&
            r.status === 'running' &&
            !r.tags['Reserved'] && // Assume a tag indicates already covered
            r.provider !== 'OnPremise' // Not applicable for on-premise
        );

        for (const resource of eligibleResources) {
            const resourceCosts = costs.filter(c => c.resourceId === resource.id);
            const totalPast30DaysCost = resourceCosts
                .filter(c => c.timestamp > Date.now() - (30 * 24 * 3600 * 1000))
                .reduce((sum, c) => sum + c.totalCost, 0);

            if (totalPast30DaysCost > 100 && Math.random() > 0.3) { // If significant cost and random chance
                const savingsPercentage = parseFloat((Math.random() * 0.2 + 0.1).toFixed(2)); // 10-30% savings
                const potentialSavings = parseFloat((totalPast30DaysCost * savingsPercentage).toFixed(2));

                recommendations.push({
                    id: generateResourceId('LambdaFunction'),
                    resourceId: resource.id,
                    type: 'ReservedInstance',
                    severity: 'high',
                    potentialSavingsUSD: potentialSavings,
                    description: `Recommend purchasing Reserved Instance or Savings Plan for ${resource.name} (${resource.type}).`,
                    justification: `Consistent usage over the last 30 days suggests significant savings (${(savingsPercentage * 100).toFixed(0)}%) by committing to a Reserved Instance or Savings Plan.`,
                    confidenceScore: 0.9,
                    ethicalImpactScore: 0.95, // Generally positive impact
                    estimatedPerformanceImpact: 'none',
                    recommendedAction: 'purchase_ri_sp',
                    targetConfiguration: { commitmentPeriod: '1 Year', paymentOption: 'No Upfront' },
                    provenanceDetails: {
                        dataSources: ['Cloud Billing Data', 'Resource Configuration'],
                        analysisSteps: ['Historical Cost Analysis', 'Usage Pattern Recognition'],
                        modelsUsed: ['RI Eligibility Model']
                    },
                    status: 'pending',
                    proposedByOracle: this.name,
                });
            }
        }
        console.log(`${this.name}: Generated ${recommendations.length} recommendations.`);
        return recommendations;
    }
}

export class RightsizingOracle implements Oracle {
    name = "RightsizingOracle";
    domain = "Resource Optimization";

    public async analyze(resources: CloudResource[], usage: UsageData[], costs: CostData[], policies: OptimizationPolicy[], luminaCore: LuminaCore, chronosEngine: ChronosEngine): Promise<OptimizationRecommendation[]> {
        console.log(`${this.name}: Analyzing potential rightsizing opportunities.`);
        const recommendations: OptimizationRecommendation[] = [];

        const computeResources = resources.filter(r =>
            (r.type === 'EC2Instance' || r.type === 'VirtualMachine') &&
            r.status === 'running'
        );

        for (const resource of computeResources) {
            const cpuUsage = usage.filter(u => u.resourceId === resource.id && u.metric === 'cpu_utilization' && u.timestamp > Date.now() - (30 * 24 * 3600 * 1000));
            const avgCpu = cpuUsage.length > 0 ? cpuUsage.reduce((sum, u) => sum + u.value, 0) / cpuUsage.length : 0;
            const maxCpu = cpuUsage.length > 0 ? Math.max(...cpuUsage.map(u => u.value)) : 0;

            const memUsage = usage.filter(u => u.resourceId === resource.id && u.metric === 'memory_utilization' && u.timestamp > Date.now() - (30 * 24 * 3600 * 1000));
            const avgMem = memUsage.length > 0 ? memUsage.reduce((sum, u) => sum + u.value, 0) / memUsage.length : 0;
            const maxMem = memUsage.length > 0 ? Math.max(...memUsage.map(u => u.value)) : 0;

            const currentCpu = resource.configuration.cpu || 1;
            const currentMemGB = (resource.configuration.memory || 1024) / 1024;

            let potentialAction: 'resize' | 'terminate' = 'resize';
            let targetCpu: number | null = null;
            let targetMemGB: number | null = null;
            let savingsPercentage = 0;

            if (avgCpu < 10 && maxCpu < 20 && currentCpu > 1) { // Very low CPU
                targetCpu = Math.max(1, Math.floor(currentCpu * 0.5));
                targetMemGB = Math.max(1, Math.floor(currentMemGB * 0.5));
                savingsPercentage = 0.4; // 40% saving
            } else if (avgCpu < 25 && maxCpu < 50 && currentCpu > 1) { // Low CPU
                targetCpu = Math.max(1, Math.floor(currentCpu * 0.75));
                targetMemGB = Math.max(1, Math.floor(currentMemGB * 0.75));
                savingsPercentage = 0.2; // 20% saving
            } else if (resource.status === 'stopped' && resource.costPerUnitPerHour && resourceCosts.length > 0) {
                potentialAction = 'terminate';
                savingsPercentage = 1.0; // 100% saving for stopped instance if still incurring storage costs or associated resources
            }

            if (savingsPercentage > 0) {
                const currentMonthlyCost = costs.filter(c => c.resourceId === resource.id && c.timestamp > Date.now() - (30 * 24 * 3600 * 1000)).reduce((sum, c) => sum + c.totalCost, 0);
                const potentialSavings = parseFloat((currentMonthlyCost * savingsPercentage).toFixed(2));
                const justification = potentialAction === 'terminate'
                    ? `Resource has been stopped or idle for an extended period, still incurring costs for associated storage/IPs.`
                    : `Average CPU utilization of ${avgCpu.toFixed(1)}% (Max: ${maxCpu.toFixed(1)}%) and average memory utilization of ${avgMem.toFixed(1)}% (Max: ${maxMem.toFixed(1)}%) indicate significant over-provisioning.`;

                const semanticContext = luminaCore.queryGraph({ filter: n => n.id === resource.id })[0]?.semanticContext;
                const environment = semanticContext?.environment || 'Unknown';

                // Apply policy constraints: don't auto-resize critical prod resources
                const isProduction = environment.toLowerCase().includes('prod');
                const policyExcludes = policies.some(p => p.enabled && p.ruleType === 'TagBasedExclusion' && p.criteria.tag === 'Environment' && p.criteria.value === environment && p.action === 'no_action');

                if (isProduction && policyExcludes) {
                    console.log(`RightsizingOracle: Skipping recommendation for production resource ${resource.id} due to policy.`);
                    continue; // Skip this recommendation if policy forbids
                }

                recommendations.push({
                    id: generateResourceId('LambdaFunction'),
                    resourceId: resource.id,
                    type: 'Rightsizing',
                    severity: savingsPercentage > 0.3 ? 'high' : 'medium',
                    potentialSavingsUSD: potentialSavings,
                    description: potentialAction === 'terminate'
                        ? `Recommend terminating idle resource ${resource.name} (${resource.type}).`
                        : `Recommend rightsizing ${resource.name} (${resource.type}) from ${currentCpu}vCPU/${currentMemGB.toFixed(1)}GB to ${targetCpu || '?'}vCPU/${targetMemGB?.toFixed(1) || '?'}GB.`,
                    justification: justification + (isProduction ? ' (Manual review required for Production environment).' : ''),
                    confidenceScore: 0.85,
                    ethicalImpactScore: isProduction ? 0.7 : 0.9, // Lower for prod due to potential disruption
                    estimatedPerformanceImpact: potentialAction === 'terminate' ? 'high_if_in_use' : 'low_if_correctly_sized',
                    recommendedAction: potentialAction,
                    targetConfiguration: potentialAction === 'resize' ? { cpu: targetCpu, memoryGB: targetMemGB } : undefined,
                    provenanceDetails: {
                        dataSources: ['Cloud Usage Metrics', 'Cloud Cost Data', 'Resource Configuration'],
                        analysisSteps: ['Utilization Analysis (CPU/Memory)', 'Cost-to-Usage Correlation'],
                        modelsUsed: ['Rightsizing Heuristic Model']
                    },
                    status: 'pending',
                    proposedByOracle: this.name,
                });
            }
        }
        console.log(`${this.name}: Generated ${recommendations.length} recommendations.`);
        return recommendations;
    }
}

export class WasteDetectionOracle implements Oracle {
    name = "WasteDetectionOracle";
    domain = "Waste Elimination";

    public async analyze(resources: CloudResource[], usage: UsageData[], costs: CostData[], policies: OptimizationPolicy[], luminaCore: LuminaCore, chronosEngine: ChronosEngine): Promise<OptimizationRecommendation[]> {
        console.log(`${this.name}: Detecting unattached resources and waste.`);
        const recommendations: OptimizationRecommendation[] = [];

        // Example: Unattached Disks (EBS volumes, Azure Managed Disks, GCP Persistent Disks)
        const disks = resources.filter(r => r.type === 'Disk' || r.type === 'StorageAccount');
        for (const disk of disks) {
            // In a real system, this would involve checking cloud provider APIs for attachment status.
            // Here, we simulate by checking if parentResourceId is present for a disk type.
            const isAttached = resources.some(r => r.parentResourceId === disk.id || r.configuration.attachedDisks?.includes(disk.id));

            if (!isAttached && Math.random() > 0.4) { // Simulate unattached state
                const currentMonthlyCost = costs.filter(c => c.resourceId === disk.id && c.timestamp > Date.now() - (30 * 24 * 3600 * 1000)).reduce((sum, c) => sum + c.totalCost, 0);
                if (currentMonthlyCost > 0.1) { // Only if it actually costs something
                    recommendations.push({
                        id: generateResourceId('LambdaFunction'),
                        resourceId: disk.id,
                        type: 'WasteElimination',
                        severity: 'high',
                        potentialSavingsUSD: parseFloat(currentMonthlyCost.toFixed(2)),
                        description: `Unattached ${disk.type} ${disk.name} detected. Recommend termination.`,
                        justification: `Resource has no apparent parent or attachment, indicating it is likely orphaned or unused and incurring unnecessary storage costs.`,
                        confidenceScore: 0.98,
                        ethicalImpactScore: 0.99, // High confidence, low risk for unattached resources
                        estimatedPerformanceImpact: 'none',
                        recommendedAction: 'terminate',
                        provenanceDetails: {
                            dataSources: ['Cloud Resource Inventory'],
                            analysisSteps: ['Resource Dependency Mapping', 'Status Verification'],
                            modelsUsed: ['Orphaned Resource Detection Algorithm']
                        },
                        status: 'pending',
                        proposedByOracle: this.name,
                    });
                }
            }
        }

        // Example: Idle Load Balancers / NAT Gateways (no active connections/low traffic)
        const networkDevices = resources.filter(r => r.type === 'LoadBalancer' || r.type === 'NatGateway');
        for (const device of networkDevices) {
            const networkUsage = usage.filter(u => u.resourceId === device.id && (u.metric === 'active_connections' || u.metric === 'network_in') && u.timestamp > Date.now() - (7 * 24 * 3600 * 1000));
            const avgConnections = networkUsage.filter(u => u.metric === 'active_connections').reduce((sum, u) => sum + u.value, 0) / networkUsage.length;
            const totalNetworkIn = networkUsage.filter(u => u.metric === 'network_in').reduce((sum, u) => sum + u.value, 0);

            if (avgConnections < 1 && totalNetworkIn < 100 && Math.random() > 0.6) { // Very low traffic for a week
                const currentMonthlyCost = costs.filter(c => c.resourceId === device.id && c.timestamp > Date.now() - (30 * 24 * 3600 * 1000)).reduce((sum, c) => sum + c.totalCost, 0);
                if (currentMonthlyCost > 5) { // Only if it's costing more than minimal
                    recommendations.push({
                        id: generateResourceId('LambdaFunction'),
                        resourceId: device.id,
                        type: 'WasteElimination',
                        severity: 'medium',
                        potentialSavingsUSD: parseFloat(currentMonthlyCost.toFixed(2)),
                        description: `Idle ${device.type} ${device.name} detected. Recommend termination or consolidation.`,
                        justification: `Resource has shown negligible traffic or active connections over the last 7 days, suggesting it is no longer required.`,
                        confidenceScore: 0.9,
                        ethicalImpactScore: 0.9,
                        estimatedPerformanceImpact: 'low_if_truly_idle',
                        recommendedAction: 'terminate',
                        provenanceDetails: {
                            dataSources: ['Cloud Resource Inventory', 'Network Usage Metrics'],
                            analysisSteps: ['Traffic Volume Analysis', 'Connection Count Monitoring'],
                            modelsUsed: ['Idle Network Device Detection']
                        },
                        status: 'pending',
                        proposedByOracle: this.name,
                    });
                }
            }
        }
        console.log(`${this.name}: Generated ${recommendations.length} recommendations.`);
        return recommendations;
    }
}

export class AgoraConsensusEngine {
    private oracles: Oracle[];

    constructor(oracles: Oracle[]) {
        this.oracles = oracles;
        console.log(`Agora Consensus Engine initialized with ${oracles.length} Oracles.`);
    }

    /**
     * Gathers recommendations from all specialized Oracles and resolves conflicts.
     * @param resources All cloud resources.
     * @param usage All usage data.
     * @param costs All cost data.
     * @param policies All optimization policies.
     * @param luminaCore Lumina Core instance.
     * @param chronosEngine Chronos Engine instance.
     * @returns A consolidated list of unique and prioritized recommendations.
     */
    public async getConsolidatedRecommendations(
        resources: CloudResource[],
        usage: UsageData[],
        costs: CostData[],
        policies: OptimizationPolicy[],
        luminaCore: LuminaCore,
        chronosEngine: ChronosEngine
    ): Promise<OptimizationRecommendation[]> {
        console.log("Agora Consensus Engine: Gathering recommendations from all Oracles.");
        const allRecommendations: OptimizationRecommendation[] = [];
        const oraclePromises = this.oracles.map(oracle =>
            oracle.analyze(resources, usage, costs, policies, luminaCore, chronosEngine)
                .catch(error => {
                    console.error(`Error running Oracle ${oracle.name}:`, error);
                    return [];
                })
        );

        const results = await Promise.all(oraclePromises);
        results.forEach(recos => allRecommendations.push(...recos));

        // Consensus and Disputation Protocols: Identify duplicates, conflicting recommendations, and prioritize.
        const consolidatedMap = new Map<string, OptimizationRecommendation>(); // Key: resourceId-type-action

        for (const reco of allRecommendations) {
            const key = `${reco.resourceId}-${reco.type}-${reco.recommendedAction}`;
            if (consolidatedMap.has(key)) {
                const existingReco = consolidatedMap.get(key)!;
                // Simple conflict resolution: take the one with higher potential savings or confidence.
                if (reco.potentialSavingsUSD > existingReco.potentialSavingsUSD || reco.confidenceScore > existingReco.confidenceScore) {
                    consolidatedMap.set(key, reco);
                }
            } else {
                consolidatedMap.set(key, reco);
            }
        }

        let finalRecommendations = Array.from(consolidatedMap.values());

        // Dynamic Resource Allocation (simplified): Prioritize based on severity, potential savings, and ethical impact.
        finalRecommendations.sort((a, b) => {
            // Severity: critical > high > medium > low
            const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
            const severityDiff = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
            if (severityDiff !== 0) return severityDiff;

            // Potential savings (descending)
            const savingsDiff = b.potentialSavingsUSD - a.potentialSavingsUSD;
            if (savingsDiff !== 0) return savingsDiff;

            // Confidence (descending)
            const confidenceDiff = b.confidenceScore - a.confidenceScore;
            if (confidenceDiff !== 0) return confidenceDiff;

            // Ethical impact (descending - higher ethical score is better)
            return b.ethicalImpactScore - a.ethicalImpactScore;
        });

        console.log(`Agora Consensus Engine: Consolidated to ${finalRecommendations.length} unique recommendations.`);
        return finalRecommendations;
    }
}

/**
 * D. The Ethos Layer: Intrinsic Alignment and Ethical Guidelines
 * Ensures Aethelgard's immense capabilities are always aligned with beneficial human outcomes.
 */
export class EthosLayer {
    private ethicalConstraints: OptimizationPolicy[];
    private humanFeedbackLoop: { recommendationId: string; feedback: string; timestamp: number }[] = [];

    constructor(initialPolicies: OptimizationPolicy[] = []) {
        this.ethicalConstraints = initialPolicies.filter(p => p.ruleType === 'AutomatedAction' || p.ruleType === 'TagBasedExclusion');
        console.log(`Ethos Layer initialized with ${this.ethicalConstraints.length} ethical constraints.`);
    }

    /**
     * Constraint-Based Decision Frameworks: Filters/modifies recommendations based on ethical/business policies.
     * @param recommendations Raw recommendations from Agora.
     * @param resources All resources.
     * @returns Filtered/modified recommendations.
     */
    public applyEthicalConstraints(recommendations: OptimizationRecommendation[], resources: CloudResource[]): OptimizationRecommendation[] {
        console.log(`Ethos Layer: Applying ethical constraints to ${recommendations.length} recommendations.`);
        return recommendations.filter(reco => {
            const targetResource = resources.find(r => r.id === reco.resourceId);
            if (!targetResource) return true; // Keep if resource not found, or handle as error

            // Check TagBasedExclusion policies
            const excludedByTag = this.ethicalConstraints.some(policy => {
                if (policy.ruleType === 'TagBasedExclusion' && policy.enabled) {
                    const tagKey = policy.criteria.tag as string;
                    const tagValue = policy.criteria.value as string;
                    const resourceTagValue = targetResource.tags[tagKey];
                    return resourceTagValue === tagValue && policy.action === 'no_action';
                }
                return false;
            });

            if (excludedByTag) {
                console.log(`Ethos Layer: Excluding recommendation ${reco.id} for resource ${reco.resourceId} due to TagBasedExclusion policy.`);
                return false;
            }

            // Check AutomatedAction constraints (e.g., prevent auto-termination of prod resources)
            const preventsAutoAction = this.ethicalConstraints.some(policy => {
                if (policy.ruleType === 'AutomatedAction' && policy.enabled && reco.recommendedAction.startsWith('auto')) {
                    const resourceEnvironment = targetResource.tags['Environment']?.toLowerCase();
                    const policyEnvironment = (policy.criteria.environment as string)?.toLowerCase();
                    return resourceEnvironment === policyEnvironment && reco.recommendedAction === policy.action; // Simplified: prevents auto action if policy explicitly matches reco action
                }
                return false;
            });

            if (preventsAutoAction && (reco.recommendedAction === 'terminate' || reco.recommendedAction === 'resize')) {
                // Downgrade action or mark for manual review
                reco.description += " (AUTOMATED ACTION BLOCKED BY ETHICAL POLICY - MANUAL REVIEW REQUIRED)";
                reco.severity = 'medium'; // Lower severity for auto-blocked actions
                reco.recommendedAction = 'modify_configuration'; // Suggest review instead
                reco.ethicalImpactScore = 0.5; // Indicate a compromise/flag
                console.log(`Ethos Layer: Modified recommendation ${reco.id} for resource ${reco.resourceId} due to AutomatedAction constraint.`);
            }

            // Privacy-Preserving Architectures (simulated): Ensure no PII in descriptions/justifications
            if (reco.description.match(/\b(PII|Personal Identifiable Information)\b/i) || reco.justification.match(/\b(PII|Personal Identifiable Information)\b/i)) {
                reco.description = reco.description.replace(/\b(PII|Personal Identifiable Information)\b/gi, '[REDACTED_SENSITIVE_INFO]');
                reco.justification = reco.justification.replace(/\b(PII|Personal Identifiable Information)\b/gi, '[REDACTED_SENSITIVE_INFO]');
                reco.ethicalImpactScore -= 0.1; // Slight decrease for needing redaction
                console.warn(`Ethos Layer: Redacted potential PII from recommendation ${reco.id}.`);
            }

            return true;
        });
    }

    /**
     * Transparency and Auditability Protocols: Attaches provenance and reasoning details.
     * This is largely handled within the `OptimizationRecommendation` interface.
     * This method ensures details are present or generates placeholders if missing.
     * @param recommendation The recommendation to enrich.
     * @returns The enriched recommendation.
     */
    public enrichWithProvenance(recommendation: OptimizationRecommendation): OptimizationRecommendation {
        if (!recommendation.provenanceDetails) {
            recommendation.provenanceDetails = {
                dataSources: ['N/A (Default Ethos Layer Provenance)'],
                analysisSteps: ['N/A (Default Ethos Layer Provenance)'],
                modelsUsed: ['N/A (Default Ethos Layer Provenance)']
            };
        }
        if (!recommendation.justification) {
            recommendation.justification = 'No detailed justification provided by Oracle. This recommendation passed Ethos Layer constraints.';
        }
        return recommendation;
    }

    /**
     * Bias Detection and Mitigation Envelopes (Simulated): Checks for systemic biases.
     * @param recommendations Recommendations to check.
     * @param resources All resources (for context).
     * @returns Insights on detected biases.
     */
    public detectAndMitigateBias(recommendations: OptimizationRecommendation[], resources: CloudResource[]): AethelgardInsight[] {
        console.log(`Ethos Layer: Detecting potential biases in ${recommendations.length} recommendations.`);
        const insights: AethelgardInsight[] = [];
        const recommendationsByOwner: Record<string, number> = {};
        const recommendationsByEnvironment: Record<string, number> = {};

        recommendations.forEach(reco => {
            const resource = resources.find(r => r.id === reco.resourceId);
            if (resource) {
                const owner = resource.tags['Owner'] || 'Unknown';
                const env = resource.tags['Environment'] || 'Unknown';
                recommendationsByOwner[owner] = (recommendationsByOwner[owner] || 0) + 1;
                recommendationsByEnvironment[env] = (recommendationsByEnvironment[env] || 0) + 1;
            }
        });

        const totalRecos = recommendations.length;
        const avgRecosPerOwner = totalRecos / Object.keys(recommendationsByOwner).length;
        const avgRecosPerEnvironment = totalRecos / Object.keys(recommendationsByEnvironment).length;

        // Simple bias detection: if one owner/env has disproportionately many recommendations
        for (const owner in recommendationsByOwner) {
            if (recommendationsByOwner[owner] > avgRecosPerOwner * 2) { // More than double average
                insights.push({
                    id: generateResourceId('LambdaFunction'),
                    title: `Potential Bias: High Recommendation Count for Owner "${owner}"`,
                    description: `Owner "${owner}" has ${recommendationsByOwner[owner]} recommendations, significantly higher than average. This might indicate a bias in resource provisioning or a particular team's practices needing review.`,
                    category: 'CostOptimization',
                    relevanceScore: 0.75,
                    generatedBy: 'Ethos',
                    details: { entity: 'Owner', name: owner, count: recommendationsByOwner[owner], average: avgRecosPerOwner },
                    timestamp: Date.now(),
                });
            }
        }
        for (const env in recommendationsByEnvironment) {
            if (recommendationsByEnvironment[env] > avgRecosPerEnvironment * 2) {
                insights.push({
                    id: generateResourceId('LambdaFunction'),
                    title: `Potential Bias: High Recommendation Count for Environment "${env}"`,
                    description: `Environment "${env}" has ${recommendationsByEnvironment[env]} recommendations, significantly higher than average. This could indicate a need for specific optimization efforts or policy adjustments for this environment.`,
                    category: 'CostOptimization',
                    relevanceScore: 0.7,
                    generatedBy: 'Ethos',
                    details: { entity: 'Environment', name: env, count: recommendationsByEnvironment[env], average: avgRecosPerEnvironment },
                    timestamp: Date.now(),
                });
            }
        }

        if (insights.length > 0) {
            console.warn(`Ethos Layer: Detected ${insights.length} potential biases.`);
        }
        return insights;
    }

    /**
     * Human-Centric Feedback Loops: Records and processes human feedback.
     * @param recommendationId ID of the recommendation.
     * @param feedback The human feedback string.
     */
    public recordHumanFeedback(recommendationId: string, feedback: string) {
        this.humanFeedbackLoop.push({ recommendationId, feedback, timestamp: Date.now() });
        console.log(`Ethos Layer: Recorded feedback for recommendation ${recommendationId}: "${feedback}"`);
        // In a real system, this feedback would be used to retrain models, adjust policies, etc.
    }
}

// --- Aethelgard Orchestration Service ---

export class AethelgardCostOptimizationService {
    private luminaCore: LuminaCore;
    private chronosEngine: ChronosEngine;
    private agoraConsensusEngine: AgoraConsensusEngine;
    private ethosLayer: EthosLayer;

    constructor(
        luminaCore: LuminaCore,
        chronosEngine: ChronosEngine,
        agoraConsensusEngine: AgoraConsensusEngine,
        ethosLayer: EthosLayer
    ) {
        this.luminaCore = luminaCore;
        this.chronosEngine = chronosEngine;
        this.agoraConsensusEngine = agoraConsensusEngine;
        this.ethosLayer = ethosLayer;
        console.log("Aethelgard Cost Optimization Service initialized.");
    }

    /**
     * Orchestrates the entire cost optimization process.
     * 1. Ingests raw data via Lumina.
     * 2. Feeds processed data to Chronos for temporal analysis.
     * 3. Triggers Agora Oracles to generate recommendations.
     * 4. Filters and enriches recommendations via Ethos.
     * @param rawResources Raw cloud resource data.
     * @param rawUsage Raw usage data.
     * @param rawCosts Raw cost data.
     * @param policies Current optimization policies.
     * @returns Comprehensive optimization results.
     */
    public async analyzeAndOptimize(
        rawResources: CloudResource[],
        rawUsage: UsageData[],
        rawCosts: CostData[],
        policies: OptimizationPolicy[]
    ): Promise<{
        recommendations: OptimizationRecommendation[];
        anomalies: CostAnomaly[];
        costProjections: CostProjection[];
        systemInsights: AethelgardInsight[];
    }> {
        console.log("Aethelgard Orchestrator: Starting comprehensive analysis and optimization.");

        // Step 1: Lumina Core - Ingest and semantically enrich data
        const processedResources = this.luminaCore.ingestData('cloud-inventory', 'CloudResource', rawResources);
        const processedUsage = this.luminaCore.ingestData('cloud-metrics', 'UsageData', rawUsage);
        const processedCosts = this.luminaCore.ingestData('cloud-billing', 'CostData', rawCosts);

        // Lumina's knowledge gaps insights
        const luminaGaps = this.luminaCore.identifyKnowledgeGaps().map(gap => ({
            id: generateResourceId('LambdaFunction'),
            title: `Lumina Knowledge Gap: ${gap.substring(0, 50)}...`,
            description: gap,
            category: 'OperationalEfficiency',
            relevanceScore: 0.6,
            generatedBy: 'Lumina',
            details: { type: 'KnowledgeGap' },
            timestamp: Date.now(),
        }));

        // Step 2: Chronos Engine - Temporal analysis, anomaly detection, forecasting
        this.chronosEngine.ingestHistoricalData(processedCosts, processedUsage);
        const anomalies = await this.chronosEngine.detectAnomalies();
        const costProjections = await this.chronosEngine.forecastCosts('all', 90); // 90-day forecast

        // For each anomaly, map a causal chain and add as insight
        const anomalyCausalInsights = await Promise.all(anomalies.map(async anomaly => {
            const causalChain = await this.chronosEngine.mapCausalChain(anomaly);
            return {
                id: generateResourceId('LambdaFunction'),
                title: `Causal Analysis for Anomaly: ${anomaly.anomalyType} on ${anomaly.resourceId || 'Global'}`,
                description: `Detected anomaly ID ${anomaly.id}. Causal factors identified:\n${causalChain}`,
                category: 'OperationalEfficiency',
                relevanceScore: anomaly.severity === 'critical' ? 0.95 : anomaly.severity === 'high' ? 0.9 : 0.8,
                generatedBy: 'Chronos',
                details: { anomalyId: anomaly.id, causalChain: causalChain },
                timestamp: Date.now(),
            };
        }));

        // Step 3: Agora Network - Generate and consolidate recommendations
        let rawRecommendations = await this.agoraConsensusEngine.getConsolidatedRecommendations(processedResources, processedUsage, processedCosts, policies, this.luminaCore, this.chronosEngine);

        // Step 4: Ethos Layer - Apply constraints, ensure transparency, detect bias
        const filteredRecommendations = this.ethosLayer.applyEthicalConstraints(rawRecommendations, processedResources);
        const finalRecommendations = filteredRecommendations.map(reco => this.ethosLayer.enrichWithProvenance(reco));
        const biasInsights = this.ethosLayer.detectAndMitigateBias(finalRecommendations, processedResources);

        const systemInsights = [...luminaGaps, ...anomalyCausalInsights, ...biasInsights];

        console.log("Aethelgard Orchestrator: Analysis and optimization complete.");
        return {
            recommendations: finalRecommendations,
            anomalies,
            costProjections,
            systemInsights,
        };
    }

    /**
     * Triggers a specific what-if scenario.
     * @param scenarioName Name of the scenario.
     * @param baseCostData Baseline cost data.
     * @param parameters Simulation parameters.
     * @returns Cost projections for the scenario.
     */
    public async runWhatIf(scenarioName: string, baseCostData: CostData[], parameters: Record<string, any>): Promise<CostProjection[]> {
        return this.chronosEngine.runWhatIfScenario(scenarioName, baseCostData, parameters);
    }
}

// --- React Context for Aethelgard Data and Actions ---
export interface AethelgardContextType {
    loading: boolean;
    error: string | null;
    resources: CloudResource[];
    usageData: UsageData[];
    costData: CostData[];
    recommendations: OptimizationRecommendation[];
    anomalies: CostAnomaly[];
    costProjections: CostProjection[];
    policies: OptimizationPolicy[];
    systemInsights: AethelgardInsight[];
    totalSavingsOpportunity: number;
    currentMonthSpend: number;
    fetchOptimizationData: () => Promise<void>;
    applyRecommendation: (id: string) => Promise<void>;
    updatePolicy: (policy: OptimizationPolicy) => Promise<void>;
    addPolicy: (policy: Omit<OptimizationPolicy, 'id'>) => Promise<void>;
    deletePolicy: (id: string) => Promise<void>;
    runWhatIfScenario: (scenarioName: string, parameters: Record<string, any>) => Promise<CostProjection[]>;
    recordFeedback: (recommendationId: string, feedback: string) => void;
}

export const AethelgardContext = createContext<AethelgardContextType | undefined>(undefined);

export const useAethelgard = () => {
    const context = useContext(AethelgardContext);
    if (!context) {
        throw new Error('useAethelgard must be used within an AethelgardProvider');
    }
    return context;
};

// --- Aethelgard Provider Component ---
export const AethelgardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [resources, setResources] = useState<CloudResource[]>([]);
    const [usageData, setUsageData] = useState<UsageData[]>([]);
    const [costData, setCostData] = useState<CostData[]>([]);
    const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
    const [anomalies, setAnomalies] = useState<CostAnomaly[]>([]);
    const [costProjections, setCostProjections] = useState<CostProjection[]>([]);
    const [policies, setPolicies] = useState<OptimizationPolicy[]>(generateMockData().policies);
    const [systemInsights, setSystemInsights] = useState<AethelgardInsight[]>([]);

    const luminaCore = useMemo(() => new LuminaCore(), []);
    const chronosEngine = useMemo(() => new ChronosEngine(), []);
    const oracles = useMemo(() => [
        new ReservedInstanceOracle(),
        new RightsizingOracle(),
        new WasteDetectionOracle(),
        // Add more Oracles here as the system expands
        // new SpotInstanceOracle(),
        // new ContainerCostOracle(),
        // new DataTransferCostOracle(),
        // new ArchitecturalRefinementOracle(),
    ], []);
    const agoraConsensusEngine = useMemo(() => new AgoraConsensusEngine(oracles), [oracles]);
    const ethosLayer = useMemo(() => new EthosLayer(policies), [policies]);
    const aethelgardService = useMemo(() => new AethelgardCostOptimizationService(
        luminaCore,
        chronosEngine,
        agoraConsensusEngine,
        ethosLayer
    ), [luminaCore, chronosEngine, agoraConsensusEngine, ethosLayer]);

    const fetchOptimizationData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const mockData = generateMockData(200); // Generate 200 resources for a richer demo
            setResources(mockData.resources);
            setUsageData(mockData.usageData);
            setCostData(mockData.costData);

            const { recommendations: newRecos, anomalies: newAnomalies, costProjections: newProjections, systemInsights: newInsights } =
                await aethelgardService.analyzeAndOptimize(
                    mockData.resources,
                    mockData.usageData,
                    mockData.costData,
                    policies
                );

            setRecommendations(newRecos);
            setAnomalies(newAnomalies);
            setCostProjections(newProjections);
            setSystemInsights(newInsights);
        } catch (err) {
            console.error("Failed to fetch optimization data:", err);
            setError("Failed to load optimization data. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [aethelgardService, policies]);

    useEffect(() => {
        fetchOptimizationData();
    }, [fetchOptimizationData]);

    const applyRecommendation = useCallback(async (id: string) => {
        // Simulate applying a recommendation via API (e.g., calling cloud provider API)
        console.log(`Simulating application of recommendation ${id}`);
        setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: 'applied' } : r));
        // In a real system, this would trigger actual cloud API calls and subsequent data refresh.
        ethosLayer.recordHumanFeedback(id, `Recommendation applied by user.`);
    }, [ethosLayer]);

    const updatePolicy = useCallback(async (updatedPolicy: OptimizationPolicy) => {
        console.log(`Updating policy ${updatedPolicy.id}`);
        setPolicies(prev => prev.map(p => p.id === updatedPolicy.id ? updatedPolicy : p));
        // AethelgardService would need to re-run analysis if policies change significantly.
    }, []);

    const addPolicy = useCallback(async (newPolicy: Omit<OptimizationPolicy, 'id'>) => {
        console.log('Adding new policy');
        const policyWithId: OptimizationPolicy = { ...newPolicy, id: `p-${Date.now()}` };
        setPolicies(prev => [...prev, policyWithId]);
    }, []);

    const deletePolicy = useCallback(async (id: string) => {
        console.log(`Deleting policy ${id}`);
        setPolicies(prev => prev.filter(p => p.id !== id));
    }, []);

    const recordFeedback = useCallback((recommendationId: string, feedback: string) => {
        ethosLayer.recordHumanFeedback(recommendationId, feedback);
    }, [ethosLayer]);

    const totalSavingsOpportunity = useMemo(() => {
        return recommendations
            .filter(r => r.status === 'pending')
            .reduce((sum, r) => sum + r.potentialSavingsUSD, 0);
    }, [recommendations]);

    const currentMonthSpend = useMemo(() => {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 3600 * 1000);
        return costData
            .filter(c => c.timestamp >= thirtyDaysAgo)
            .reduce((sum, c) => sum + c.totalCost, 0);
    }, [costData]);

    const runWhatIfScenario = useCallback(async (scenarioName: string, parameters: Record<string, any>): Promise<CostProjection[]> => {
        setLoading(true);
        setError(null);
        try {
            // Need to pass a baseline for the what-if, using current aggregated cost data
            const dailyAggregatedCosts: CostData[] = [];
            const dailyCostMap: { [date: string]: CostData } = {};
            costData.forEach(c => {
                const dateStr = new Date(c.timestamp).toISOString().split('T')[0];
                if (!dailyCostMap[dateStr]) {
                    dailyCostMap[dateStr] = { ...c, totalCost: 0, costComponents: [] };
                }
                dailyCostMap[dateStr].totalCost += c.totalCost;
                // Merge cost components (simplified)
            });
            Object.keys(dailyCostMap).sort().forEach(date => dailyAggregatedCosts.push(dailyCostMap[date]));

            const scenarioProjections = await aethelgardService.runWhatIf(scenarioName, dailyAggregatedCosts, parameters);
            setLoading(false);
            return scenarioProjections;
        } catch (e) {
            console.error("Error running what-if scenario:", e);
            setError("Failed to run what-if scenario.");
            setLoading(false);
            return [];
        }
    }, [aethelgardService, costData]);


    const contextValue = useMemo(() => ({
        loading,
        error,
        resources,
        usageData,
        costData,
        recommendations,
        anomalies,
        costProjections,
        policies,
        systemInsights,
        totalSavingsOpportunity,
        currentMonthSpend,
        fetchOptimizationData,
        applyRecommendation,
        updatePolicy,
        addPolicy,
        deletePolicy,
        runWhatIfScenario,
        recordFeedback,
    }), [
        loading, error, resources, usageData, costData, recommendations, anomalies, costProjections,
        policies, systemInsights, totalSavingsOpportunity, currentMonthSpend, fetchOptimizationData,
        applyRecommendation, updatePolicy, addPolicy, deletePolicy, runWhatIfScenario, recordFeedback
    ]);

    return (
        <AethelgardContext.Provider value={contextValue}>
            {children}
        </AethelgardContext.Provider>
    );
};

// --- UI Components ---
// These would typically be in separate files but are here for the "single file" directive.

export const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center space-x-2 text-text-primary">
        <div className="w-4 h-4 rounded-full animate-pulse bg-purple-500"></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-purple-500 delay-75"></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-purple-500 delay-150"></div>
        <span>Loading Aethelgard Insights...</span>
    </div>
);

export const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline ml-2">{message}</span>
    </div>
);

export const OptimizationDashboard: React.FC = () => {
    const { totalSavingsOpportunity, currentMonthSpend, loading, error, costProjections } = useAethelgard();

    const formattedSavings = totalSavingsOpportunity.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    const formattedSpend = currentMonthSpend.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    const latestProjection = costProjections.length > 0 ? costProjections[costProjections.length - 1] : null;

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6 border border-gray-700">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">Aethelgard Cost Optimization Dashboard</h2>
            {loading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}
            {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DashboardMetric title="Current Monthly Spend" value={formattedSpend} />
                    <DashboardMetric title="Potential Monthly Savings" value={formattedSavings} isHighlight={true} />
                    <DashboardMetric
                        title="Projected Next Month Cost"
                        value={latestProjection?.projectedCostUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || 'N/A'}
                        trend={latestProjection && latestProjection.projectedCostUSD > currentMonthSpend ? 'up' : 'down'}
                    />
                </div>
            )}
            <div className="mt-6">
                <h3 className="text-xl font-medium text-text-primary mb-3">Cost Projections (Next 90 Days)</h3>
                <CostProjectionChart projections={costProjections} currentSpend={currentMonthSpend} />
            </div>
        </div>
    );
};

export const DashboardMetric: React.FC<{ title: string; value: string; isHighlight?: boolean; trend?: 'up' | 'down' | 'stable' }> = ({ title, value, isHighlight = false, trend }) => (
    <div className={`bg-gray-700 p-4 rounded-md shadow-sm ${isHighlight ? 'border-l-4 border-green-500' : 'border-l-4 border-blue-500'}`}>
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className={`text-2xl font-bold ${isHighlight ? 'text-green-400' : 'text-text-primary'} flex items-center`}>
            {value}
            {trend === 'up' && <span className="ml-2 text-red-400">â–²</span>}
            {trend === 'down' && <span className="ml-2 text-green-400">â–¼</span>}
        </p>
    </div>
);

export const CostProjectionChart: React.FC<{ projections: CostProjection[]; currentSpend: number }> = ({ projections, currentSpend }) => {
    if (projections.length === 0) {
        return <p className="text-center text-gray-400">No projection data available.</p>;
    }

    // Simplified chart data for demonstration, imagine a real charting library
    const labels = projections.map(p => new Date(p.timestamp).toLocaleDateString());
    const dataPoints = projections.map(p => p.projectedCostUSD);
    const minCost = Math.min(...dataPoints, currentSpend);
    const maxCost = Math.max(...dataPoints, currentSpend);
    const range = maxCost - minCost;
    const padding = range * 0.1;
    const yMin = Math.max(0, minCost - padding);
    const yMax = maxCost + padding;

    return (
        <div className="relative h-64 w-full bg-gray-900 rounded-md p-2">
            <svg className="w-full h-full" viewBox={`0 0 1000 256`} preserveAspectRatio="none">
                {/* Y-axis grid lines and labels */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = 256 - (ratio * 256);
                    const costLabel = yMin + (range + (padding * 2)) * ratio;
                    return (
                        <g key={`y-grid-${i}`}>
                            <line x1="0" y1={y} x2="1000" y2={y} stroke="#374151" strokeWidth="0.5" />
                            <text x="10" y={y - 5} fill="#9CA3AF" fontSize="10">{costLabel.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</text>
                        </g>
                    );
                })}

                {/* Current Spend Line */}
                {currentSpend && (
                    <line
                        x1="0" y1={256 - ((currentSpend - yMin) / (yMax - yMin) * 256)}
                        x2="1000" y2={256 - ((currentSpend - yMin) / (yMax - yMin) * 256)}
                        stroke="#FBBF24" strokeWidth="1" strokeDasharray="4 2"
                    />
                )}
                {currentSpend && (
                    <text x="10" y={256 - ((currentSpend - yMin) / (yMax - yMin) * 256) - 10} fill="#FBBF24" fontSize="10">
                        Current: {currentSpend.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                    </text>
                )}

                {/* Projected Cost Line */}
                {dataPoints.length > 1 && (
                    <polyline
                        fill="none"
                        stroke="#8B5CF6"
                        strokeWidth="2"
                        points={dataPoints.map((p, i) => {
                            const x = (i / (dataPoints.length - 1)) * 1000;
                            const y = 256 - ((p - yMin) / (yMax - yMin) * 256);
                            return `${x},${y}`;
                        }).join(' ')}
                    />
                )}
                {/* Confidence Interval (simplified - just a shaded area) */}
                {projections.length > 1 && (
                    <polygon
                        fill="#8B5CF6"
                        opacity="0.2"
                        points={[
                            ...projections.map((p, i) => {
                                const x = (i / (projections.length - 1)) * 1000;
                                const y = 256 - ((p.confidenceIntervalUpper || p.projectedCostUSD * 1.1) - yMin) / (yMax - yMin) * 256;
                                return `${x},${y}`;
                            }).join(' '),
                            ...projections.slice().reverse().map((p, i) => {
                                const x = ((projections.length - 1 - i) / (projections.length - 1)) * 1000;
                                const y = 256 - ((p.confidenceIntervalLower || p.projectedCostUSD * 0.9) - yMin) / (yMax - yMin) * 256;
                                return `${x},${y}`;
                            }).join(' '),
                        ].join(' ')}
                    />
                )}
            </svg>
            <div className="absolute bottom-0 left-0 right-0 h-4 flex justify-between text-xs text-gray-400 px-2">
                <span>{labels[0]}</span>
                <span>{labels[Math.floor(labels.length / 2)]}</span>
                <span>{labels[labels.length - 1]}</span>
            </div>
        </div>
    );
};

export const RecommendationsList: React.FC = () => {
    const { recommendations, applyRecommendation, loading, error, recordFeedback, resources } = useAethelgard();
    const [filterSeverity, setFilterSeverity] = useState<RecoSeverity | 'all'>('all');
    const [filterType, setFilterType] = useState<OptimizationType | 'all'>('all');

    const filteredRecommendations = useMemo(() => {
        return recommendations.filter(reco => {
            const matchesSeverity = filterSeverity === 'all' || reco.severity === filterSeverity;
            const matchesType = filterType === 'all' || reco.type === filterType;
            return matchesSeverity && matchesType;
        });
    }, [recommendations, filterSeverity, filterType]);

    const getSeverityColor = (severity: RecoSeverity) => {
        switch (severity) {
            case 'critical': return 'text-red-500';
            case 'high': return 'text-orange-400';
            case 'medium': return 'text-yellow-400';
            case 'low': return 'text-green-500';
        }
    };

    const getEthicalScoreColor = (score: number) => {
        if (score < 0.5) return 'text-red-500';
        if (score < 0.75) return 'text-yellow-400';
        return 'text-green-500';
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6 border border-gray-700">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">Optimization Recommendations</h2>
            {loading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}
            {!loading && !error && (
                <>
                    <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex-grow">
                            <label htmlFor="filterSeverity" className="block text-sm font-medium text-gray-400">Severity:</label>
                            <select
                                id="filterSeverity"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md bg-gray-700 text-text-primary"
                                value={filterSeverity}
                                onChange={(e) => setFilterSeverity(e.target.value as RecoSeverity | 'all')}
                            >
                                <option value="all">All Severities</option>
                                {RECO_SEVERITIES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                        </div>
                        <div className="flex-grow">
                            <label htmlFor="filterType" className="block text-sm font-medium text-gray-400">Type:</label>
                            <select
                                id="filterType"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md bg-gray-700 text-text-primary"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as OptimizationType | 'all')}
                            >
                                <option value="all">All Types</option>
                                {OPTIMIZATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredRecommendations.length === 0 ? (
                            <p className="text-center text-gray-400">No recommendations found matching your criteria.</p>
                        ) : (
                            filteredRecommendations.map((reco) => {
                                const resource = resources.find(r => r.id === reco.resourceId);
                                return (
                                    <div key={reco.id} className="bg-gray-700 p-4 rounded-md border border-gray-600">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-lg font-medium text-text-primary">{reco.description}</h3>
                                                <p className="text-sm text-gray-400">Resource: <span className="font-mono">{resource?.name || reco.resourceId}</span> (<span className="text-purple-400">{resource?.provider} - {resource?.type}</span>)</p>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className={`text-xl font-bold ${getSeverityColor(reco.severity)}`}>
                                                    ${reco.potentialSavingsUSD.toLocaleString()} <span className="text-sm text-gray-400">/month</span>
                                                </span>
                                                <span className={`text-xs ${getSeverityColor(reco.severity)}`}>{reco.severity.toUpperCase()}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-300 mb-2">{reco.justification}</p>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-2">
                                            <span>Type: <span className="text-blue-400">{reco.type}</span></span>
                                            <span> | Proposed by: <span className="text-cyan-400">{reco.proposedByOracle}</span></span>
                                            <span> | Confidence: <span className="font-semibold text-green-400">{(reco.confidenceScore * 100).toFixed(0)}%</span></span>
                                            <span> | Ethical Score: <span className={`font-semibold ${getEthicalScoreColor(reco.ethicalImpactScore)}`}>{(reco.ethicalImpactScore * 100).toFixed(0)}%</span></span>
                                            <span> | Status: <span className="font-semibold text-orange-300">{reco.status.toUpperCase()}</span></span>
                                        </div>

                                        {reco.status === 'pending' && (
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={() => applyRecommendation(reco.id)}
                                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded text-sm transition duration-300"
                                                >
                                                    Apply Recommendation
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const feedback = prompt("Why are you rejecting this recommendation?");
                                                        if (feedback) recordFeedback(reco.id, `Rejected: ${feedback}`);
                                                        else recordFeedback(reco.id, `Recommendation rejected by user.`);
                                                        setRecommendations(prev => prev.map(r => r.id === reco.id ? { ...r, status: 'rejected' } : r));
                                                    }}
                                                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded text-sm transition duration-300"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                        {reco.provenanceDetails && (
                                            <details className="text-sm text-gray-400 mt-2">
                                                <summary className="cursor-pointer hover:text-text-primary">Provenance Details (Aethelgard Transparency)</summary>
                                                <ul className="list-disc list-inside mt-1 ml-2">
                                                    <li><strong>Data Sources:</strong> {reco.provenanceDetails.dataSources.join(', ')}</li>
                                                    <li><strong>Analysis Steps:</strong> {reco.provenanceDetails.analysisSteps.join(', ')}</li>
                                                    <li><strong>Models Used:</strong> {reco.provenanceDetails.modelsUsed.join(', ')}</li>
                                                </ul>
                                            </details>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export const AnomalyAlerts: React.FC = () => {
    const { anomalies, loading, error } = useAethelgard();

    const getAnomalySeverityColor = (severity: AnomalyType['severity']) => {
        switch (severity) {
            case 'critical': return 'border-red-500';
            case 'high': return 'border-orange-400';
            case 'medium': return 'border-yellow-400';
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6 border border-gray-700">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">Detected Anomalies</h2>
            {loading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}
            {!loading && !error && (
                <div className="space-y-4">
                    {anomalies.length === 0 ? (
                        <p className="text-center text-gray-400">No significant anomalies detected.</p>
                    ) : (
                        anomalies.map(anomaly => (
                            <div key={anomaly.id} className={`bg-gray-700 p-4 rounded-md border-l-4 ${getAnomalySeverityColor(anomaly.severity)}`}>
                                <h3 className="text-lg font-medium text-text-primary flex items-center justify-between">
                                    {anomaly.description}
                                    <span className={`text-sm font-bold text-${getAnomalySeverityColor(anomaly.severity).replace('border-', '')}`}>{anomaly.severity.toUpperCase()}</span>
                                </h3>
                                <p className="text-sm text-gray-400">
                                    Type: <span className="text-blue-400">{anomaly.anomalyType}</span>
                                    {anomaly.resourceId && ` | Resource: ${anomaly.resourceId}`}
                                    {` | Detected: ${new Date(anomaly.timestamp).toLocaleString()}`}
                                </p>
                                <p className="text-sm text-gray-300 mt-1">
                                    <span className="font-semibold">Observed:</span> ${anomaly.observedValue.toFixed(2)} |
                                    <span className="font-semibold"> Expected:</span> ${anomaly.expectedValue.toFixed(2)} |
                                    <span className="font-semibold"> Deviation:</span> {anomaly.deviationPercentage.toFixed(1)}%
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Justification: {anomaly.justification}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export const SystemInsightsPanel: React.FC = () => {
    const { systemInsights, loading, error } = useAethelgard();

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6 border border-gray-700">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">Aethelgard System Insights</h2>
            {loading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}
            {!loading && !error && (
                <div className="space-y-4">
                    {systemInsights.length === 0 ? (
                        <p className="text-center text-gray-400">No new system insights available.</p>
                    ) : (
                        systemInsights.map(insight => (
                            <div key={insight.id} className="bg-gray-700 p-4 rounded-md border-l-4 border-purple-500">
                                <h3 className="text-lg font-medium text-text-primary">{insight.title}</h3>
                                <p className="text-sm text-gray-400">
                                    Category: <span className="text-blue-400">{insight.category}</span>
                                    {` | Generated by: ${insight.generatedBy}`}
                                    {` | Relevance: ${(insight.relevanceScore * 100).toFixed(0)}%`}
                                </p>
                                <p className="text-sm text-gray-300 mt-1">{insight.description}</p>
                                <details className="text-xs text-gray-500 mt-1">
                                    <summary className="cursor-pointer hover:text-text-primary">Details</summary>
                                    <pre className="mt-1 p-2 bg-gray-800 rounded text-xs text-gray-400 overflow-auto">{JSON.stringify(insight.details, null, 2)}</pre>
                                </details>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export const PolicyManagement: React.FC = () => {
    const { policies, updatePolicy, addPolicy, deletePolicy, loading, error } = useAethelgard();
    const [isAdding, setIsAdding] = useState(false);
    const [newPolicyData, setNewPolicyData] = useState<Omit<OptimizationPolicy, 'id'>>({
        name: '',
        description: '',
        ruleType: 'TagBasedExclusion',
        criteria: {},
        action: 'alert',
        enabled: true,
        priority: 5,
    });

    const handleNewPolicyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setNewPolicyData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else if (name === 'priority') {
            setNewPolicyData(prev => ({ ...prev, [name]: parseInt(value, 10) }));
        } else {
            setNewPolicyData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCriteriaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        try {
            // Attempt to parse criteria as JSON, otherwise keep as string
            setNewPolicyData(prev => ({ ...prev, criteria: { ...prev.criteria, [name]: JSON.parse(value) } }));
        } catch {
            setNewPolicyData(prev => ({ ...prev, criteria: { ...prev.criteria, [name]: value } }));
        }
    };

    const handleAddNewPolicy = async () => {
        await addPolicy(newPolicyData);
        setIsAdding(false);
        setNewPolicyData({
            name: '', description: '', ruleType: 'TagBasedExclusion', criteria: {}, action: 'alert', enabled: true, priority: 5,
        });
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6 border border-gray-700">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">Optimization Policies</h2>
            {loading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}
            {!loading && !error && (
                <>
                    <button onClick={() => setIsAdding(!isAdding)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 mb-4">
                        {isAdding ? 'Cancel Add Policy' : 'Add New Policy'}
                    </button>

                    {isAdding && (
                        <div className="bg-gray-700 p-4 rounded-md mb-4 border border-gray-600">
                            <h3 className="text-xl text-text-primary mb-3">New Policy Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <PolicyInputField label="Policy Name" name="name" value={newPolicyData.name} onChange={handleNewPolicyChange} />
                                <PolicyInputField label="Description" name="description" value={newPolicyData.description} onChange={handleNewPolicyChange} isTextArea />
                                <div>
                                    <label htmlFor="newPolicyRuleType" className="block text-sm font-medium text-gray-400">Rule Type:</label>
                                    <select
                                        id="newPolicyRuleType"
                                        name="ruleType"
                                        value={newPolicyData.ruleType}
                                        onChange={handleNewPolicyChange}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md bg-gray-700 text-text-primary"
                                    >
                                        <option value="TagBasedExclusion">Tag Based Exclusion</option>
                                        <option value="CostThresholdAlert">Cost Threshold Alert</option>
                                        <option value="UtilizationThreshold">Utilization Threshold</option>
                                        <option value="AutomatedAction">Automated Action</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="newPolicyAction" className="block text-sm font-medium text-gray-400">Action:</label>
                                    <select
                                        id="newPolicyAction"
                                        name="action"
                                        value={newPolicyData.action}
                                        onChange={handleNewPolicyChange}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md bg-gray-700 text-text-primary"
                                    >
                                        <option value="alert">Alert</option>
                                        <option value="recommend">Recommend</option>
                                        <option value="auto_stop">Auto Stop</option>
                                        <option value="auto_resize">Auto Resize</option>
                                        <option value="no_action">No Action</option>
                                    </select>
                                </div>
                                <PolicyInputField label="Priority" name="priority" type="number" value={newPolicyData.priority.toString()} onChange={handleNewPolicyChange} />
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-400">Criteria (JSON for complex, simple key-value for basic):</label>
                                    <PolicyInputField label="Criteria Key" name="key" value={Object.keys(newPolicyData.criteria)[0] || ''} onChange={handleCriteriaChange} />
                                    <PolicyInputField label="Criteria Value" name="value" value={Object.values(newPolicyData.criteria)[0]?.toString() || ''} onChange={handleCriteriaChange} />
                                </div>
                                <div className="flex items-center mt-2">
                                    <input
                                        id="newPolicyEnabled"
                                        name="enabled"
                                        type="checkbox"
                                        checked={newPolicyData.enabled}
                                        onChange={handleNewPolicyChange}
                                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="newPolicyEnabled" className="ml-2 block text-sm text-gray-300">Enabled</label>
                                </div>
                            </div>
                            <button onClick={handleAddNewPolicy} className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300">
                                Create Policy
                            </button>
                        </div>
                    )}

                    <div className="space-y-4">
                        {policies.length === 0 ? (
                            <p className="text-center text-gray-400">No policies defined.</p>
                        ) : (
                            policies.map(policy => (
                                <div key={policy.id} className="bg-gray-700 p-4 rounded-md border border-gray-600">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-lg font-medium text-text-primary">{policy.name}</h3>
                                            <p className="text-sm text-gray-300">{policy.description}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => updatePolicy({ ...policy, enabled: !policy.enabled })}
                                                className={`py-1 px-3 rounded text-sm transition duration-300 ${policy.enabled ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                                            >
                                                {policy.enabled ? 'Disable' : 'Enable'}
                                            </button>
                                            <button
                                                onClick={() => deletePolicy(policy.id)}
                                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm transition duration-300"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-2">
                                        <span>Type: <span className="text-blue-400">{policy.ruleType}</span></span>
                                        <span> | Action: <span className="text-cyan-400">{policy.action.replace('_', ' ').toUpperCase()}</span></span>
                                        <span> | Priority: <span className="font-semibold text-purple-400">{policy.priority}</span></span>
                                        <span> | Status: <span className={`font-semibold ${policy.enabled ? 'text-green-500' : 'text-red-500'}`}>{policy.enabled ? 'Enabled' : 'Disabled'}</span></span>
                                    </div>
                                    <details className="text-sm text-gray-400 mt-2">
                                        <summary className="cursor-pointer hover:text-text-primary">Criteria Details</summary>
                                        <pre className="mt-1 p-2 bg-gray-800 rounded text-xs text-gray-400 overflow-auto">{JSON.stringify(policy.criteria, null, 2)}</pre>
                                    </details>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export const PolicyInputField: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    type?: string;
    isTextArea?: boolean;
}> = ({ label, name, value, onChange, type = 'text', isTextArea = false }) => (
    <div>
        <label htmlFor={`policy-${name}`} className="block text-sm font-medium text-gray-400">{label}:</label>
        {isTextArea ? (
            <textarea
                id={`policy-${name}`}
                name={name}
                value={value}
                onChange={onChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-gray-700 text-text-primary"
            ></textarea>
        ) : (
            <input
                id={`policy-${name}`}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-gray-700 text-text-primary"
            />
        )}
    </div>
);

export const WhatIfScenarioSimulator: React.FC = () => {
    const { runWhatIfScenario, loading, error, costProjections } = useAethelgard();
    const [scenarioName, setScenarioName] = useState('');
    const [scenarioParameters, setScenarioParameters] = useState<Record<string, any>>({});
    const [scenarioProjections, setScenarioProjections] = useState<CostProjection[]>([]);
    const [showComparison, setShowComparison] = useState(false);

    const handleParameterChange = (key: string, value: string) => {
        setScenarioParameters(prev => {
            try {
                // Attempt to parse if it's JSON, otherwise keep as string/number
                return { ...prev, [key]: JSON.parse(value) };
            } catch (e) {
                // If parsing fails, try to convert to number if applicable, otherwise keep as string
                const numValue = parseFloat(value);
                return { ...prev, [key]: isNaN(numValue) ? value : numValue };
            }
        });
    };

    const handleRunScenario = async () => {
        const results = await runWhatIfScenario(scenarioName, scenarioParameters);
        setScenarioProjections(results);
        setShowComparison(true);
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6 border border-gray-700">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">What-If Scenario Simulator (Chronos Engine)</h2>
            {loading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}
            <div className="space-y-4">
                <div>
                    <label htmlFor="scenarioName" className="block text-sm font-medium text-gray-400">Scenario Name:</label>
                    <input
                        id="scenarioName"
                        type="text"
                        value={scenarioName}
                        onChange={(e) => setScenarioName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-gray-700 text-text-primary"
                        placeholder="e.g., 'Rightsizing All Dev Instances'"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Parameters (JSON format for complex objects):</label>
                    <p className="text-xs text-gray-500 mb-1">
                        Examples: <code className="bg-gray-700 px-1 rounded">{"{ \"resize\": { \"resourceType\": \"EC2Instance\", \"targetCpu\": 0.5 } }"}</code> or <code className="bg-gray-700 px-1 rounded">{"{ \"addWorkload\": { \"monthlyCost\": 1000, \"region\": \"us-east-1\" } }"}</code>
                    </p>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            placeholder="Parameter Key (e.g., 'resize', 'addWorkload')"
                            className="mt-1 block flex-1 px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-gray-700 text-text-primary"
                            onBlur={(e) => handleParameterChange(e.target.value, JSON.stringify({}))}
                        />
                        <textarea
                            rows={3}
                            placeholder="Parameter Value (JSON or simple value)"
                            className="mt-1 block flex-1 px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-gray-700 text-text-primary"
                            onBlur={(e) => {
                                const key = (e.target.previousSibling as HTMLInputElement)?.value;
                                if (key) handleParameterChange(key, e.target.value);
                            }}
                        ></textarea>
                    </div>
                    {Object.keys(scenarioParameters).length > 0 && (
                        <div className="bg-gray-700 p-3 rounded-md mt-2 text-xs text-gray-300">
                            <strong>Current Parameters:</strong>
                            <pre className="mt-1">{JSON.stringify(scenarioParameters, null, 2)}</pre>
                        </div>
                    )}
                </div>
                <button
                    onClick={handleRunScenario}
                    disabled={loading || !scenarioName}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Run Scenario
                </button>
            </div>

            {showComparison && !loading && !error && scenarioProjections.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-xl font-medium text-text-primary mb-3">Scenario Projection: {scenarioName}</h3>
                    <CostProjectionChart projections={scenarioProjections} currentSpend={costProjections.length > 0 ? costProjections[0].projectedCostUSD : 0} />
                    <p className="text-sm text-gray-400 mt-2">
                        This chart shows the projected costs under your specified "What-If" scenario. Compare it with the baseline projection on the dashboard.
                    </p>
                </div>
            )}
        </div>
    );
};


// --- Main Feature Component ---

export const AiDrivenCostOptimizationForCloud: React.FC<{ feature?: Feature }> = ({ feature }) => {
    return (
        <AethelgardProvider>
            <div className="h-full flex flex-col items-center justify-start text-center p-8 text-text-primary overflow-auto">
                <div className="text-6xl mb-4" aria-hidden="true">
                    ðŸš€
                </div>
                <h1 className="text-4xl font-extrabold mb-4 text-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                    Aethelgard: AI-Driven Cloud Cost Optimization
                </h1>
                <p className="text-xl text-text-secondary max-w-2xl mb-8">
                    {feature?.description || `Unlocking Tomorrow's Horizon: Aethelgard brings collaborative intelligence to cloud spend, synthesizing knowledge to discover hidden savings and optimize your infrastructure with precision and foresight.`}
                </p>

                <div className="w-full max-w-5xl space-y-8">
                    <OptimizationDashboard />
                    <RecommendationsList />
                    <AnomalyAlerts />
                    <WhatIfScenarioSimulator />
                    <PolicyManagement />
                    <SystemInsightsPanel />
                </div>

                <footer className="mt-12 text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} Aethelgard Project. All rights reserved.
                </footer>
            </div>
        </AethelgardProvider>
    );
};