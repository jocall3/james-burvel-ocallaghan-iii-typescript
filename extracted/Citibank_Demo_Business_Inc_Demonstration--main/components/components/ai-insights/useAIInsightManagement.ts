/**
 * This module, `useAIInsightManagement`, serves as the central hub for managing AI-generated insights across an enterprise.
 * It provides a sophisticated, commercial-grade interface for accessing, filtering, prioritizing, and acting upon critical business intelligence.
 *
 * Business value: This hook is worth millions by transforming raw data into actionable intelligence, driving strategic decisions, and enabling
 * automated remediation through integrated agentic AI systems. It significantly reduces operational latency, enhances risk mitigation,
 * uncovers new market opportunities, and ensures regulatory compliance by providing real-time, explainable, and accountable insights.
 * The robust management features, including advanced filtering, prioritization rules, collaboration tools, and agent orchestration,
 * empower businesses to maximize the value of their AI investments, leading to substantial cost savings, accelerated revenue growth,
 * and a sustained competitive advantage in dynamic markets. It acts as the operational front-end for a sophisticated AI decision
 * intelligence layer, directly impacting efficiency and profitability.
 */
import { useState, useCallback, useMemo, useEffect, useContext, useRef } from 'react';
import { DataContext } from '../../../context/DataContext';

//region Copied Definitions from AIInsights.tsx for self-containment and strict adherence
// Expanded Insight Data Structure (conceptual, assumes DataContext provides this)
export interface ExtendedAIInsight {
    id: string;
    title: string;
    description: string;
    urgency: 'low' | 'medium' | 'high' | 'critical' | 'informational';
    type: 'general' | 'predictive' | 'actionable' | 'correlation' | 'anomaly' | 'sentiment' | 'geospatial' | 'multimedia' | 'risk' | 'opportunity' | 'efficiency' | 'compliance' | 'market' | 'customer' | 'security' | 'ethical' | 'resource' | 'sustainability' | 'trend' | 'forecasting' | 'optimization' | 'recommendation' | 'compliance' | 'security' | 'financial' | 'operational';
    timestamp: string;
    source: string;
    dataPoints?: any[];
    metrics?: { [key: string]: any };
    relatedEntities?: { type: string; id: string; name: string }[];
    recommendedActions?: { id: string; description: string; priority: 'low' | 'medium' | 'high'; status: 'pending' | 'in-progress' | 'completed' | 'deferred'; assignedTo?: string; deadline?: string; agentInitiated?: boolean }[];
    predictions?: { target: string; value: number; confidence: number; trend: 'up' | 'down' | 'stable' }[];
    visualizations?: { type: 'chart' | 'map' | 'graph' | 'table' | 'image'; data: any; options?: any; description?: string }[];
    explanation?: string;
    feedback?: { rating: number; comment: string; timestamp: string; userId: string; userName: string }[];
    modelVersion?: string;
    ethicalConsiderations?: { aspect: string; score: number; details: string }[];
    tags?: string[];
    status?: 'active' | 'archived' | 'dismissed' | 'resolved' | 'pending review' | 'actioned' | 'reopened';
    impactScore?: number;
    priorityScore?: number;
    assignedTo?: { userId: string; name: string; assignedAt: string; status: 'pending' | 'in-progress' | 'completed' }[];
    comments?: { id: string; userId: string; userName: string; timestamp: string; text: string; parentCommentId?: string }[];
    auditTrail?: { id: string; userId: string; userName: string; action: string; timestamp: string; details?: any }[];
    resolutionDetails?: { resolvedBy: string; resolvedAt: string; summary: string; actionsTaken?: string[] };
    costEstimate?: { currency: string; amount: number; modelUsed: string; calculationMethod: 'estimated' | 'actual' };
    attachments?: { id: string; fileName: string; fileType: string; url: string; uploadedBy: string; uploadedAt: string }[];
    // Agentic AI System fields
    agentDecisionHistory?: { agentId: string; decision: string; rationale: string; timestamp: string; skillInvoked?: string; outcome?: string; }[];
    // Token Rail / Payments Infrastructure fields
    relatedTransactionIds?: string[];
    // Digital Identity & Security fields
    accessControl?: { userId: string; role: string; permission: 'view' | 'edit' | 'assign' | 'approve' }[];
}

export const InsightTypeIconMap: { [key: string]: string } = {
    'general': '💡',
    'predictive': '🔮',
    'actionable': '🚀',
    'correlation': '🔗',
    'anomaly': '🚨',
    'sentiment': '😊',
    'geospatial': '🗺️',
    'multimedia': '🖼️',
    'risk': '⚠️',
    'opportunity': '✨',
    'efficiency': '⚙️',
    'compliance': '⚖️',
    'market': '📈',
    'customer': '👤',
    'security': '🔒',
    'ethical': '⚖️',
    'resource': '📦',
    'sustainability': '🌱',
    'trend': '📊',
    'forecasting': '🗓️',
    'optimization': '🎯',
    'recommendation': '👍',
    'financial': '💰',
    'operational': '🏗️'
};

export const generateUniqueId = (): string => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export const debounce = <T extends (...args: any[]) => void>(func: T, delay: number) => {
    let timeout: NodeJS.Timeout;
    return function (this: any, ...args: Parameters<T>) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
};
//endregion

export interface AIPerformanceMetrics {
    lastHeartbeat: string;
    insightGenerationRate: number;
    averageResponseTime: number;
    dataProcessingVolume: number;
    modelAccuracyHistory: { timestamp: string; accuracy: number }[];
    resourceUtilization: { cpu: number; memory: number; gpu?: number };
    errorRate: number;
    costPerInsight: number;
    // Agent-specific metrics
    agentActivityRate?: number; // Actions per minute by agents
    agentSuccessRate?: number; // % of agent actions leading to desired outcome
    agentDecisionLatency?: number; // ms, time for agents to make a decision
}

export interface AIModel {
    id: string;
    name: string;
    version: string;
    description: string;
    status: 'active' | 'training' | 'retired' | 'error';
    deploymentDate: string;
    lastUpdated: string;
    performanceMetrics?: { accuracy: number; precision: number; recall: number; f1_score: number };
    trainingDataInfo?: { sizeGB: number; lastRefresh: string; biasDetected: boolean };
    costMultiplier?: number;
}

export interface AIPreferences {
    insightTypes: string[];
    urgencyThreshold: 'low' | 'medium' | 'high' | 'critical' | 'informational';
    dataSources: string[];
    realtimeUpdates: boolean;
    explanationLevel: 'none' | 'basic' | 'detailed' | 'verbose';
    modelSelection: string;
    notificationSettings: {
        email: boolean;
        push: boolean;
        sms: boolean;
        threshold: 'medium' | 'high' | 'critical' | 'all';
        digestFrequency: 'daily' | 'weekly' | 'none';
    };
    refreshIntervalMinutes: number;
    costOptimizationLevel: 'none' | 'moderate' | 'aggressive';
    autoArchiveDurationDays: number;
    customReportSchedule: 'daily' | 'weekly' | 'monthly' | 'none';
    preferredTimezone: string;
    language: string;
}

export interface CollaborationUser {
    id: string;
    name: string;
    avatar: string;
    role: string;
    email: string;
    permissions?: ('view_all_insights' | 'edit_all_insights' | 'assign_insights' | 'approve_insights' | 'manage_rules' | 'deploy_models')[];
}

export interface InsightPrioritizationRule {
    id: string;
    name: string;
    criteria: {
        type?: string[];
        urgency?: ('low' | 'medium' | 'high' | 'critical' | 'informational')[];
        source?: string[];
        tags?: string[];
        keywords?: string[];
        minImpactScore?: number;
    };
    boostFactor: number;
    isActive: boolean;
    lastModified: string;
}

export interface AINotification {
    id: string;
    userId: string;
    insightId?: string;
    type: 'new-insight' | 'assigned-insight' | 'comment-added' | 'insight-status-change' | 'system-alert' | 'preferences-update' | 'agent-action-complete' | 'agent-action-failed';
    message: string;
    timestamp: string;
    isRead: boolean;
    link: string;
    priority: 'low' | 'medium' | 'high';
}

export interface DataSourceConfig {
    id: string;
    name: string;
    type: 'database' | 'api' | 'file_storage' | 'stream';
    status: 'connected' | 'disconnected' | 'error' | 'pending';
    lastSync: string;
    refreshIntervalMinutes: number;
    credentialsMasked: boolean;
    healthCheckUrl?: string;
    description: string;
}

export interface AIAgent {
    id: string;
    name: string;
    role: string; // e.g., 'Anomaly Detection Agent', 'Fraud Prevention Agent', 'Reconciliation Agent'
    status: 'active' | 'idle' | 'monitoring' | 'remediating' | 'error';
    lastActivity: string;
    skills: string[]; // e.g., 'monitor_transactions', 'flag_fraud', 'initiate_payment_hold', 'reconcile_ledger'
    modelId: string; // The AI model it uses
    efficiencyScore: number; // 0-100, how well it performs its tasks
    autoAssignmentEnabled: boolean;
}

export const useAIInsightManagement = () => {
    const context = useContext(DataContext);

    const aiInsights = context?.aiInsights || [];
    const isInsightsLoading = context?.isInsightsLoading || false;
    const generateDashboardInsights = context?.generateDashboardInsights || (() => {
        console.warn('generateDashboardInsights not provided by DataContext. Mocking generation.');
        setTimeout(() => {
            console.log('Mock: Generating new insights...');
        }, 1000);
    });
    const dismissInsight = context?.dismissInsight || ((id: string) => console.log(`Mock: Dismiss insight ${id}`));
    const markInsightAsActioned = context?.markInsightAsActioned || ((insightId: string, actionId: string) => console.log(`Mock: Actioned ${actionId} for insight ${insightId}`));
    const updateInsightStatus = context?.updateInsightStatus || ((insightId: string, status: ExtendedAIInsight['status']) => console.log(`Mock: Updated insight ${insightId} status to ${status}`));
    const addInsightAttachment = context?.addInsightAttachment || ((insightId: string, file: File) => console.log(`Mock: Added attachment ${file.name} to insight ${insightId}`));

    const [queryInput, setQueryInput] = useState('');
    const [queryResults, setQueryResults] = useState<string[]>(context?.aiQueryResults || []);
    const [isQuerying, setIsQuerying] = useState(context?.isQueryingAI || false);

    const submitAIQuery = useCallback(async (query: string) => {
        if (context?.submitAIQuery) {
            context.submitAIQuery(query);
        } else {
            setIsQuerying(true);
            setQueryResults([]);
            setTimeout(() => {
                const mockResponse = `Based on your query "${query}", the AI suggests: Key trends indicate a 15% growth in Q3. Consider reallocating resources to high-performing regions. (Mocked)`;
                setQueryResults([mockResponse]);
                setIsQuerying(false);
            }, 2000);
        }
    }, [context]);

    const clearQueryResults = useCallback(() => setQueryResults([]), []);

    const availableInsightTypes = useMemo(() => Object.keys(InsightTypeIconMap), []);
    const availableDataSources = useMemo(() => ['Sales Data', 'Marketing Analytics', 'Customer Support Logs', 'IoT Sensor Data', 'Financial Reports', 'Social Media Feeds', 'Website Analytics', 'ERP System', 'HR Data'], []);
    const availableAIModels: AIModel[] = useMemo(() => [
        { id: 'quantum-v3.2', name: 'Quantum Core', version: '3.2', description: 'Advanced general intelligence model with enhanced predictive capabilities.', status: 'active', deploymentDate: '2023-01-15T10:00:00Z', lastUpdated: '2023-11-20T14:30:00Z', performanceMetrics: { accuracy: 0.902, precision: 0.88, recall: 0.92, f1_score: 0.90 }, trainingDataInfo: { sizeGB: 1200, lastRefresh: '2023-12-01T08:00:00Z', biasDetected: false }, costMultiplier: 1.2 },
        { id: 'symphony-xai-1.1', name: 'Symphony-XAI', version: '1.1', description: 'Specialized model for explainable AI, providing detailed reasoning for insights.', status: 'active', deploymentDate: '2023-03-01T11:00:00Z', lastUpdated: '2023-10-05T09:15:00Z', performanceMetrics: { accuracy: 0.885, precision: 0.85, recall: 0.91, f1_score: 0.88 }, trainingDataInfo: { sizeGB: 800, lastRefresh: '2023-11-15T07:00:00Z', biasDetected: true }, costMultiplier: 1.0 },
        { id: 'chronos-temporal-2.0', name: 'Chronos-Temporal', version: '2.0', description: 'Optimized for real-time anomaly detection and temporal forecasting.', status: 'active', deploymentDate: '2023-06-20T13:00:00Z', lastUpdated: '2023-12-10T16:00:00Z', performanceMetrics: { accuracy: 0.915, precision: 0.90, recall: 0.93, f1_score: 0.92 }, trainingDataInfo: { sizeGB: 600, lastRefresh: '2023-12-12T10:00:00Z', biasDetected: false }, costMultiplier: 1.1 },
        { id: 'atlas-geospatial-0.5', name: 'Atlas-Geospatial (Beta)', version: '0.5', description: 'Experimental model for location-based insights and risk assessment.', status: 'training', deploymentDate: '2024-01-01T00:00:00Z', lastUpdated: '2024-01-20T18:00:00Z', costMultiplier: 0.8 }
    ], []);

    const initialPreferences: AIPreferences = useMemo(() => ({
        insightTypes: ['predictive', 'actionable', 'anomaly'],
        urgencyThreshold: 'medium',
        dataSources: ['Sales Data', 'Marketing Analytics'],
        realtimeUpdates: true,
        explanationLevel: 'detailed',
        modelSelection: availableAIModels[0]?.id || 'quantum-v3.2',
        notificationSettings: {
            email: true,
            push: true,
            sms: false,
            threshold: 'high',
            digestFrequency: 'daily',
        },
        refreshIntervalMinutes: 30,
        costOptimizationLevel: 'moderate',
        autoArchiveDurationDays: 90,
        customReportSchedule: 'weekly',
        preferredTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: 'en-US',
    }), [availableAIModels]);

    const [preferences, setPreferences] = useState<AIPreferences>(context?.aiPreferences || initialPreferences);

    useEffect(() => {
        if (context?.aiPreferences) {
            setPreferences(context.aiPreferences);
        }
    }, [context?.aiPreferences]);

    const handlePreferenceChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;

        setPreferences(prev => {
            if (name === 'insightTypes' || name === 'dataSources') {
                const valArray = Array.from((e.target as HTMLSelectElement).options)
                    .filter(option => option.selected)
                    .map(option => option.value);
                return { ...prev, [name]: valArray };
            } else if (name.startsWith('notificationSettings.')) {
                const settingName = name.split('.')[1] as keyof AIPreferences['notificationSettings'];
                return {
                    ...prev,
                    notificationSettings: {
                        ...prev.notificationSettings,
                        [settingName]: type === 'checkbox' ? checked : value,
                    },
                };
            } else {
                return {
                    ...prev,
                    [name]: type === 'checkbox' ? checked : value,
                };
            }
        });
    }, []);

    const handleSavePreferences = useCallback(async () => {
        if (context?.updateAIPreferences) {
            await context.updateAIPreferences(preferences);
        } else {
            console.log("Mock: Saving new AI preferences:", preferences);
            alert('AI Preferences updated successfully! (Mock)');
        }
    }, [preferences, context]);

    const resetPreferences = useCallback(() => {
        setPreferences(initialPreferences);
        alert('AI Preferences reset to defaults! (Mock)');
    }, [initialPreferences]);

    const provideInsightFeedback = context?.provideInsightFeedback || ((insightId: string, rating: number, comment: string, userId: string, userName: string) => {
        console.log(`Mock Feedback for ${insightId}: Rating=${rating}, Comment="${comment}", User=${userName}`);
        const currentInsight = aiInsights.find(i => i.id === insightId);
        if (currentInsight) {
            const newFeedback = { rating, comment, timestamp: new Date().toISOString(), userId, userName };
            const updatedInsight = {
                ...currentInsight,
                feedback: currentInsight.feedback ? [...currentInsight.feedback, newFeedback] : [newFeedback],
            };
            console.log("Mock: Updated insight with new feedback:", updatedInsight);
            // In a real DataContext, this would update the central state
        }
    });

    const aiSystemStatus = context?.aiSystemStatus || 'operational';
    const aiPerformanceMetrics: AIPerformanceMetrics = useMemo(() => context?.aiPerformanceMetrics || {
        lastHeartbeat: new Date().toISOString(),
        insightGenerationRate: 15.3,
        averageResponseTime: 120,
        dataProcessingVolume: 5.8,
        modelAccuracyHistory: [
            { timestamp: new Date(Date.now() - 3600000).toISOString(), accuracy: 88.5 },
            { timestamp: new Date(Date.now() - 1800000).toISOString(), accuracy: 89.1 },
            { timestamp: new Date().toISOString(), accuracy: 90.2 },
        ],
        resourceUtilization: { cpu: 75.2, memory: 45.1, gpu: 88.9 },
        errorRate: 0.1,
        costPerInsight: 0.05,
        agentActivityRate: 5.2,
        agentSuccessRate: 98.5,
        agentDecisionLatency: 80,
    }, [context?.aiPerformanceMetrics]);

    const getAIModelDetails = useCallback((modelId: string): AIModel | undefined => {
        return availableAIModels.find(model => model.id === modelId);
    }, [availableAIModels]);

    const checkSystemHealth = useCallback(() => {
        if (context?.checkAISystemHealth) {
            context.checkAISystemHealth();
        } else {
            console.log("Mock: Initiating AI system health check...");
            setTimeout(() => {
                console.log("Mock: AI System health check completed. Status: Operational");
            }, 1000);
        }
    }, [context]);

    const [historicalSearchTerm, setHistoricalSearchTerm] = useState('');
    const [historicalFilters, setHistoricalFilters] = useState({
        type: 'all', urgency: 'all', status: 'all',
        startDate: '', endDate: '',
        source: 'all', assignedTo: 'all'
    });
    const [historicalSearchResults, setHistoricalSearchResults] = useState<ExtendedAIInsight[]>(context?.historicalInsights || []);
    const [isHistoricalLoading, setIsHistoricalLoading] = useState(context?.isHistoricalInsightsLoading || false);
    const [historicalTotalResults, setHistoricalTotalResults] = useState(context?.historicalInsightTotal || 0);
    const [historicalCurrentPage, setHistoricalCurrentPage] = useState(1);
    const [historicalPageSize, setHistoricalPageSize] = useState(10);
    const [historicalSortBy, setHistoricalSortBy] = useState<'timestamp' | 'urgency' | 'impactScore' | 'priorityScore'>('timestamp');
    const [historicalSortOrder, setHistoricalSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        if (context?.historicalInsights) {
            setHistoricalSearchResults(context.historicalInsights);
            setHistoricalTotalResults(context.historicalInsightTotal || 0);
        }
        if (typeof context?.isHistoricalInsightsLoading === 'boolean') {
            setIsHistoricalLoading(context.isHistoricalInsightsLoading);
        }
    }, [context?.historicalInsights, context?.isHistoricalInsightsLoading, context?.historicalInsightTotal]);

    const handleHistoricalFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setHistoricalFilters(prev => ({ ...prev, [name]: value }));
        setHistoricalCurrentPage(1);
    }, []);

    const handleHistoricalSortChange = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
        setHistoricalSortBy(sortBy as any);
        setHistoricalSortOrder(sortOrder);
    }, []);

    const fetchHistoricalInsightsDebounced = useRef(
        debounce(async (query: string, filters: any, page: number, pageSize: number, sortBy: string, sortOrder: 'asc' | 'desc') => {
            if (context?.fetchHistoricalInsights) {
                await context.fetchHistoricalInsights(query, filters, page, pageSize, sortBy, sortOrder);
            } else {
                setIsHistoricalLoading(true);
                setTimeout(() => {
                    const allInsights = aiInsights;
                    let filtered = allInsights.filter(insight => {
                        const matchesSearch = !query ||
                            insight.title.toLowerCase().includes(query.toLowerCase()) ||
                            insight.description.toLowerCase().includes(query.toLowerCase()) ||
                            (insight.explanation?.toLowerCase().includes(query.toLowerCase())) ||
                            (insight.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))) ||
                            (insight.metrics && Object.values(insight.metrics).some(m => String(m).toLowerCase().includes(query.toLowerCase())));

                        const matchesType = filters.type === 'all' || insight.type === filters.type;
                        const matchesUrgency = filters.urgency === 'all' || insight.urgency === filters.urgency;
                        const matchesStatus = filters.status === 'all' || insight.status === filters.status;
                        const matchesSource = filters.source === 'all' || insight.source === filters.source;
                        const matchesAssignedTo = filters.assignedTo === 'all' || (insight.assignedTo && insight.assignedTo.some(a => a.userId === filters.assignedTo));

                        const insightDate = new Date(insight.timestamp).getTime();
                        const startDate = filters.startDate ? new Date(filters.startDate).getTime() : 0;
                        const endDate = filters.endDate ? new Date(filters.endDate).getTime() : Infinity;
                        const matchesDate = insightDate >= startDate && insightDate <= endDate;

                        return matchesSearch && matchesType && matchesUrgency && matchesStatus && matchesSource && matchesAssignedTo && matchesDate;
                    });

                    filtered.sort((a, b) => {
                        let valA: any, valB: any;
                        if (sortBy === 'timestamp') {
                            valA = new Date(a.timestamp).getTime();
                            valB = new Date(b.timestamp).getTime();
                        } else if (sortBy === 'urgency') {
                            const urgencyOrder = { 'informational': 0, 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
                            valA = urgencyOrder[a.urgency];
                            valB = urgencyOrder[b.urgency];
                        } else if (sortBy === 'impactScore') {
                            valA = a.impactScore || 0;
                            valB = b.impactScore || 0;
                        } else if (sortBy === 'priorityScore') {
                            valA = a.priorityScore || 0;
                            valB = b.priorityScore || 0;
                        } else {
                            valA = String((a as any)[sortBy]);
                            valB = String((b as any)[sortBy]);
                        }

                        if (typeof valA === 'string' && typeof valB === 'string') {
                            return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                        }
                        return sortOrder === 'asc' ? (valA - valB) : (valB - valA);
                    });

                    const startIndex = (page - 1) * pageSize;
                    const endIndex = startIndex + pageSize;
                    const paginatedResults = filtered.slice(startIndex, endIndex);

                    setHistoricalSearchResults(paginatedResults);
                    setHistoricalTotalResults(filtered.length);
                    setIsHistoricalLoading(false);
                }, 750);
            }
        }, 300)
    ).current;

    useEffect(() => {
        fetchHistoricalInsightsDebounced(
            historicalSearchTerm,
            historicalFilters,
            historicalCurrentPage,
            historicalPageSize,
            historicalSortBy,
            historicalSortOrder
        );
    }, [historicalSearchTerm, historicalFilters, historicalCurrentPage, historicalPageSize, historicalSortBy, historicalSortOrder, fetchHistoricalInsightsDebounced, aiInsights]);

    const [selectedCollaborationInsightId, setSelectedCollaborationInsightId] = useState<string | null>(null);
    const [newCommentText, setNewCommentText] = useState('');
    const [assignedUserForCollaboration, setAssignedUserForCollaboration] = useState<string>('');
    const [assignActionToUser, setAssignActionToUser] = useState<{ actionId: string, userId: string } | null>(null);

    const collaborationUsers: CollaborationUser[] = useMemo(() => [
        { id: 'user-123', name: 'You (AI Lead)', avatar: 'https://i.pravatar.cc/30?img=6', role: 'AI Lead', email: 'you@example.com', permissions: ['view_all_insights', 'edit_all_insights', 'assign_insights', 'approve_insights', 'manage_rules', 'deploy_models'] },
        { id: 'user-456', name: 'Dr. Evelyn Reed (Data Scientist)', avatar: 'https://i.pravatar.cc/30?img=12', role: 'Data Scientist', email: 'evelyn.reed@example.com', permissions: ['view_all_insights', 'edit_all_insights'] },
        { id: 'user-789', name: 'Mr. Alex Chen (Operations Manager)', avatar: 'https://i.pravatar.cc/30?img=22', role: 'Operations Manager', email: 'alex.chen@example.com', permissions: ['view_all_insights', 'assign_insights'] },
        { id: 'user-101', name: 'Ms. Sarah Miller (Marketing Analyst)', avatar: 'https://i.pravatar.cc/30?img=34', role: 'Marketing Analyst', email: 'sarah.miller@example.com', permissions: ['view_all_insights'] },
        { id: 'user-202', name: 'Eng. David Kim (DevOps Engineer)', avatar: 'https://i.pravatar.cc/30?img=42', role: 'DevOps Engineer', email: 'david.kim@example.com', permissions: ['view_all_insights'] },
    ], []);

    const currentUserId = collaborationUsers[0].id;
    const currentUserName = collaborationUsers[0].name;
    const currentUserRole = collaborationUsers[0].role;
    const currentUserPermissions = collaborationUsers[0].permissions || [];

    const hasPermission = useCallback((permission: CollaborationUser['permissions'][0]) => {
        return currentUserPermissions.includes(permission);
    }, [currentUserPermissions]);

    const addInsightAuditEntry = useCallback((insightId: string, action: string, details?: any) => {
        const targetInsight = aiInsights.find(i => i.id === insightId);
        if (targetInsight) {
            const newAuditEntry = {
                id: generateUniqueId(),
                userId: currentUserId,
                userName: currentUserName,
                action,
                timestamp: new Date().toISOString(),
                details,
            };
            // In a real DataContext, this would update the central state
            console.log("Mock: Added audit trail entry:", newAuditEntry);
        }
    }, [aiInsights, currentUserId, currentUserName]);

    const addInsightComment = context?.addInsightComment || ((insightId: string, userId: string, userName: string, comment: string, parentCommentId?: string) => {
        console.log(`Mock: User ${userName} commented on ${insightId}: "${comment}" (Parent: ${parentCommentId})`);
        const targetInsight = aiInsights.find(i => i.id === insightId);
        if (targetInsight) {
            const newComment = {
                id: generateUniqueId(),
                userId,
                userName,
                timestamp: new Date().toISOString(),
                text: comment,
                parentCommentId
            };
            console.log("Mock: Added comment to insight", { ...targetInsight, comments: [...(targetInsight.comments || []), newComment] });
            addInsightAuditEntry(insightId, 'added-comment', { commentId: newComment.id, text: comment.substring(0, 50) + '...' });
        }
    });

    const assignInsight = context?.assignInsight || ((insightId: string, userId: string, userName: string, assignmentStatus: 'pending' | 'in-progress' = 'pending') => {
        if (!hasPermission('assign_insights')) {
            console.warn('Permission denied: User cannot assign insights.');
            alert('Permission denied to assign insights.');
            return;
        }
        console.log(`Mock: Insight ${insightId} assigned to user ${userName}`);
        const targetInsight = aiInsights.find(i => i.id === insightId);
        if (targetInsight) {
            const newAssignment = { userId, name: userName, assignedAt: new Date().toISOString(), status: assignmentStatus };
            console.log("Mock: Assigned insight", { ...targetInsight, assignedTo: [...(targetInsight.assignedTo || []), newAssignment] });
            addInsightAuditEntry(insightId, 'assign-insight', { assignedTo: userName, status: assignmentStatus });
        }
    });

    const assignActionToUserInInsight = context?.assignActionToUserInInsight || ((insightId: string, actionId: string, userId: string) => {
        if (!hasPermission('assign_insights')) {
            console.warn('Permission denied: User cannot assign actions.');
            alert('Permission denied to assign actions.');
            return;
        }
        console.log(`Mock: Action ${actionId} in insight ${insightId} assigned to user ${userId}`);
        const targetInsight = aiInsights.find(i => i.id === insightId);
        if (targetInsight && targetInsight.recommendedActions) {
            const updatedActions = targetInsight.recommendedActions.map(action =>
                action.id === actionId ? { ...action, assignedTo: userId, status: 'in-progress', deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() } : action
            );
            console.log("Mock: Assigned action within insight", { ...targetInsight, recommendedActions: updatedActions });
            addInsightAuditEntry(insightId, 'assign-action', { actionId, assignedTo: userId });
        }
    });

    const handleAddComment = useCallback(() => {
        if (selectedCollaborationInsightId && newCommentText.trim()) {
            addInsightComment(selectedCollaborationInsightId, currentUserId, currentUserName, newCommentText.trim());
            setNewCommentText('');
        }
    }, [selectedCollaborationInsightId, newCommentText, addInsightComment, currentUserId, currentUserName]);

    const handleAssignInsight = useCallback(() => {
        if (selectedCollaborationInsightId && assignedUserForCollaboration) {
            const user = collaborationUsers.find(u => u.id === assignedUserForCollaboration);
            if (user) {
                assignInsight(selectedCollaborationInsightId, user.id, user.name);
                setAssignedUserForCollaboration('');
            }
        }
    }, [selectedCollaborationInsightId, assignedUserForCollaboration, assignInsight, collaborationUsers]);

    const handleAssignAction = useCallback(() => {
        if (selectedCollaborationInsightId && assignActionToUser?.actionId && assignActionToUser?.userId) {
            assignActionToUserInInsight(selectedCollaborationInsightId, assignActionToUser.actionId, assignActionToUser.userId);
            setAssignActionToUser(null);
        }
    }, [selectedCollaborationInsightId, assignActionToUser, assignActionToUserInInsight]);

    const [prioritizationRules, setPrioritizationRules] = useState<InsightPrioritizationRule[]>(context?.prioritizationRules || []);

    const defaultPrioritizationRules: InsightPrioritizationRule[] = useMemo(() => [
        { id: generateUniqueId(), name: 'Critical Risk Alert', isActive: true, boostFactor: 2.0, lastModified: new Date().toISOString(), criteria: { urgency: ['critical'], type: ['risk', 'security'] } },
        { id: generateUniqueId(), name: 'High Impact Opportunity', isActive: true, boostFactor: 1.5, lastModified: new Date().toISOString(), criteria: { type: ['opportunity', 'market'], minImpactScore: 75 } },
        { id: generateUniqueId(), name: 'Compliance Issue', isActive: true, boostFactor: 1.8, lastModified: new Date().toISOString(), criteria: { type: ['compliance'] } },
    ], []);

    useEffect(() => {
        if (!context?.prioritizationRules || context.prioritizationRules.length === 0) {
            setPrioritizationRules(defaultPrioritizationRules);
        }
    }, [context?.prioritizationRules, defaultPrioritizationRules]);

    const addPrioritizationRule = useCallback((rule: Omit<InsightPrioritizationRule, 'id' | 'lastModified'>) => {
        if (!hasPermission('manage_rules')) {
            console.warn('Permission denied: User cannot add prioritization rules.');
            alert('Permission denied to add prioritization rules.');
            return;
        }
        const newRule: InsightPrioritizationRule = {
            id: generateUniqueId(),
            ...rule,
            lastModified: new Date().toISOString()
        };
        setPrioritizationRules(prev => [...prev, newRule]);
        if (context?.updatePrioritizationRules) {
            context.updatePrioritizationRules([...prioritizationRules, newRule]);
        }
        console.log("Mock: Added new prioritization rule:", newRule);
        addInsightAuditEntry('system', 'added-prioritization-rule', { ruleId: newRule.id, ruleName: newRule.name });
    }, [prioritizationRules, context, hasPermission, addInsightAuditEntry]);

    const updatePrioritizationRule = useCallback((id: string, updates: Partial<InsightPrioritizationRule>) => {
        if (!hasPermission('manage_rules')) {
            console.warn('Permission denied: User cannot update prioritization rules.');
            alert('Permission denied to update prioritization rules.');
            return;
        }
        setPrioritizationRules(prev => {
            const updated = prev.map(rule =>
                rule.id === id ? { ...rule, ...updates, lastModified: new Date().toISOString() } : rule
            );
            if (context?.updatePrioritizationRules) {
                context.updatePrioritizationRules(updated);
            }
            console.log("Mock: Updated prioritization rule:", id, updates);
            addInsightAuditEntry('system', 'updated-prioritization-rule', { ruleId: id, updates });
            return updated;
        });
    }, [prioritizationRules, context, hasPermission, addInsightAuditEntry]);

    const deletePrioritizationRule = useCallback((id: string) => {
        if (!hasPermission('manage_rules')) {
            console.warn('Permission denied: User cannot delete prioritization rules.');
            alert('Permission denied to delete prioritization rules.');
            return;
        }
        setPrioritizationRules(prev => {
            const filtered = prev.filter(rule => rule.id !== id);
            if (context?.updatePrioritizationRules) {
                context.updatePrioritizationRules(filtered);
            }
            console.log("Mock: Deleted prioritization rule:", id);
            addInsightAuditEntry('system', 'deleted-prioritization-rule', { ruleId: id });
            return filtered;
        });
    }, [prioritizationRules, context, hasPermission, addInsightAuditEntry]);

    const recalculateAllInsightPriorities = useCallback(() => {
        console.log("Mock: Recalculating all insight priorities based on current rules...");
        if (context?.recalculateInsightPriorities) {
            context.recalculateInsightPriorities();
        } else {
            const updatedInsights = aiInsights.map(insight => {
                let baseScore = (insight.impactScore || 0) + (insight.urgency === 'critical' ? 40 : insight.urgency === 'high' ? 30 : insight.urgency === 'medium' ? 20 : insight.urgency === 'low' ? 10 : 0);
                let finalScore = baseScore;

                prioritizationRules.filter(r => r.isActive).forEach(rule => {
                    let matches = true;
                    if (rule.criteria.urgency && !rule.criteria.urgency.includes(insight.urgency)) matches = false;
                    if (rule.criteria.type && !rule.criteria.type.includes(insight.type)) matches = false;
                    if (rule.criteria.source && !rule.criteria.source.includes(insight.source)) matches = false;
                    if (rule.criteria.tags && !rule.criteria.tags.some(tag => insight.tags?.includes(tag))) matches = false;
                    if (rule.criteria.keywords) {
                        const insightText = `${insight.title} ${insight.description} ${insight.explanation || ''}`.toLowerCase();
                        if (!rule.criteria.keywords.some(kw => insightText.includes(kw.toLowerCase()))) matches = false;
                    }
                    if (rule.criteria.minImpactScore && (insight.impactScore || 0) < rule.criteria.minImpactScore) matches = false;

                    if (matches) {
                        finalScore *= rule.boostFactor;
                    }
                });
                return { ...insight, priorityScore: Math.round(Math.min(finalScore, 100)) };
            });
            console.log("Mock: Insights with new priority scores:", updatedInsights.map(i => ({ id: i.id, title: i.title, priorityScore: i.priorityScore })));
            alert('Mock: Insight priorities recalculated!');
            addInsightAuditEntry('system', 'recalculated-priorities');
        }
    }, [aiInsights, prioritizationRules, context, addInsightAuditEntry]);

    const [selectedAIModelForDetails, setSelectedAIModelForDetails] = useState<string | null>(null);
    const [isModelTesting, setIsModelTesting] = useState(false);
    const [modelComparisonResults, setModelComparisonResults] = useState<{ modelId: string; insightsGenerated: number; avgAccuracy: number }[]>([]);

    const deployAIModel = useCallback(async (modelId: string) => {
        if (!hasPermission('deploy_models')) {
            console.warn('Permission denied: User cannot deploy AI models.');
            alert('Permission denied to deploy AI models.');
            return;
        }
        if (context?.deployAIModel) {
            await context.deployAIModel(modelId);
        } else {
            console.log(`Mock: Deploying AI Model ${modelId}...`);
            setIsModelTesting(true);
            setTimeout(() => {
                const model = availableAIModels.find(m => m.id === modelId);
                if (model) {
                    model.status = 'active';
                    alert(`Model ${model.name} deployed successfully! (Mock)`);
                }
                setIsModelTesting(false);
                addInsightAuditEntry('system', 'deployed-ai-model', { modelId });
            }, 3000);
        }
    }, [context, availableAIModels, hasPermission, addInsightAuditEntry]);

    const compareAIModels = useCallback(async (modelIds: string[]) => {
        if (context?.compareAIModels) {
            await context.compareAIModels(modelIds);
        } else {
            console.log(`Mock: Comparing AI Models: ${modelIds.join(', ')}...`);
            setIsModelTesting(true);
            setModelComparisonResults([]);
            setTimeout(() => {
                const mockResults = modelIds.map(id => ({
                    modelId: id,
                    insightsGenerated: Math.floor(Math.random() * 500) + 100,
                    avgAccuracy: parseFloat((Math.random() * 0.05 + (availableAIModels.find(m => m.id === id)?.performanceMetrics?.accuracy || 0.85)).toFixed(3)),
                }));
                setModelComparisonResults(mockResults);
                setIsModelTesting(false);
                alert('Model comparison completed! (Mock)');
                addInsightAuditEntry('system', 'compared-ai-models', { modelIds });
            }, 4000);
        }
    }, [context, availableAIModels, addInsightAuditEntry]);

    const [notifications, setNotifications] = useState<AINotification[]>(context?.notifications || []);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

    useEffect(() => {
        if (context?.notifications) {
            setNotifications(context.notifications);
        }
    }, [context?.notifications]);

    useEffect(() => {
        setUnreadNotificationCount(notifications.filter(n => !n.isRead && n.userId === currentUserId).length);
    }, [notifications, currentUserId]);

    const markNotificationAsRead = useCallback((notificationId: string) => {
        if (context?.markNotificationAsRead) {
            context.markNotificationAsRead(notificationId);
        } else {
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
            console.log(`Mock: Notification ${notificationId} marked as read.`);
        }
    }, [context]);

    const markAllNotificationsAsRead = useCallback(() => {
        if (context?.markAllNotificationsAsRead) {
            context.markAllNotificationsAsRead();
        } else {
            setNotifications(prev => prev.map(n => n.userId === currentUserId ? { ...n, isRead: true } : n));
            console.log(`Mock: All notifications marked as read for user ${currentUserId}.`);
        }
    }, [context, currentUserId]);

    const dismissNotification = useCallback((notificationId: string) => {
        if (context?.dismissNotification) {
            context.dismissNotification(notificationId);
        } else {
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            console.log(`Mock: Notification ${notificationId} dismissed.`);
        }
    }, [context]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.7 && preferences.notificationSettings.realtimeUpdates) {
                const mockInsight = aiInsights[Math.floor(Math.random() * aiInsights.length)];
                if (!mockInsight) return;

                const newNotification: AINotification = {
                    id: generateUniqueId(),
                    userId: currentUserId,
                    insightId: mockInsight.id,
                    type: Math.random() > 0.5 ? 'new-insight' : 'comment-added',
                    message: Math.random() > 0.5
                        ? `New insight detected: "${mockInsight.title}"!`
                        : `New comment on insight "${mockInsight.title}" from ${collaborationUsers[1].name}.`,
                    timestamp: new Date().toISOString(),
                    isRead: false,
                    link: `/insights/${mockInsight.id}`,
                    priority: mockInsight.urgency === 'critical' ? 'high' : 'medium',
                };
                if (preferences.notificationSettings.threshold === 'all' || newNotification.priority === 'high' || (preferences.notificationSettings.threshold === 'medium' && newNotification.priority === 'medium')) {
                    setNotifications(prev => [newNotification, ...prev]);
                    console.log("Mock: New notification generated:", newNotification);
                }
            }
        }, 15000);
        return () => clearInterval(interval);
    }, [aiInsights, preferences.notificationSettings, currentUserId, collaborationUsers]);

    const [dataSourcesConfig, setDataSourcesConfig] = useState<DataSourceConfig[]>(context?.dataSourcesConfig || []);
    const [isDataSourceLoading, setIsDataSourceLoading] = useState(false);

    useEffect(() => {
        if (context?.dataSourcesConfig) {
            setDataSourcesConfig(context.dataSourcesConfig);
        } else {
            setDataSourcesConfig([
                { id: 'ds-sales', name: 'CRM Sales Data', type: 'database', status: 'connected', lastSync: new Date(Date.now() - 600000).toISOString(), refreshIntervalMinutes: 60, credentialsMasked: true, healthCheckUrl: '/api/ds/sales/health', description: 'Primary sales transaction and customer data.' },
                { id: 'ds-marketing', name: 'Marketing Analytics', type: 'api', status: 'connected', lastSync: new Date(Date.now() - 3600000).toISOString(), refreshIntervalMinutes: 240, credentialsMasked: true, healthCheckUrl: '/api/ds/marketing/health', description: 'Website traffic, campaign performance, and social media metrics.' },
                { id: 'ds-iot', name: 'IoT Sensor Stream', type: 'stream', status: 'connected', lastSync: new Date(Date.now() - 10000).toISOString(), refreshIntervalMinutes: 1, credentialsMasked: true, healthCheckUrl: '/api/ds/iot/health', description: 'Real-time data from various connected devices.' },
                { id: 'ds-finance', name: 'ERP Financials', type: 'database', status: 'disconnected', lastSync: 'N/A', refreshIntervalMinutes: 1440, credentialsMasked: true, healthCheckUrl: '/api/ds/finance/health', description: 'Financial reports, budgeting, and accounting data. Requires manual re-connection.' },
            ]);
        }
    }, [context?.dataSourcesConfig]);

    const fetchDataSourceStatus = useCallback(async (dataSourceId: string) => {
        if (context?.fetchDataSourceStatus) {
            return await context.fetchDataSourceStatus(dataSourceId);
        } else {
            setIsDataSourceLoading(true);
            console.log(`Mock: Fetching status for data source ${dataSourceId}...`);
            return new Promise(resolve => {
                setTimeout(() => {
                    const status = Math.random() > 0.8 ? 'error' : 'connected';
                    const lastSync = new Date().toISOString();
                    setDataSourcesConfig(prev => prev.map(ds =>
                        ds.id === dataSourceId ? { ...ds, status, lastSync: status === 'connected' ? lastSync : ds.lastSync } : ds
                    ));
                    setIsDataSourceLoading(false);
                    console.log(`Mock: Data source ${dataSourceId} status: ${status}`);
                    resolve(status);
                }, 1500);
            });
        }
    }, [context]);

    const updateDataSourceConfiguration = useCallback(async (dataSourceId: string, updates: Partial<DataSourceConfig>) => {
        if (context?.updateDataSourceConfiguration) {
            await context.updateDataSourceConfiguration(dataSourceId, updates);
        } else {
            setIsDataSourceLoading(true);
            console.log(`Mock: Updating configuration for data source ${dataSourceId}`, updates);
            setTimeout(() => {
                setDataSourcesConfig(prev => prev.map(ds =>
                    ds.id === dataSourceId ? { ...ds, ...updates, lastSync: new Date().toISOString() } : ds
                ));
                setIsDataSourceLoading(false);
                alert(`Data source ${dataSourceId} configuration updated! (Mock)`);
                addInsightAuditEntry('system', 'updated-data-source-config', { dataSourceId, updates: Object.keys(updates) });
            }, 1000);
        }
    }, [context, addInsightAuditEntry]);

    const triggerManualSync = useCallback(async (dataSourceId: string) => {
        if (context?.triggerManualSync) {
            await context.triggerManualSync(dataSourceId);
        } else {
            setIsDataSourceLoading(true);
            console.log(`Mock: Triggering manual sync for data source ${dataSourceId}...`);
            setTimeout(() => {
                setDataSourcesConfig(prev => prev.map(ds =>
                    ds.id === dataSourceId ? { ...ds, lastSync: new Date().toISOString(), status: 'connected' } : ds
                ));
                setIsDataSourceLoading(false);
                alert(`Data source ${dataSourceId} manually synced! (Mock)`);
                generateDashboardInsights();
                addInsightAuditEntry('system', 'manual-data-source-sync', { dataSourceId });
            }, 2500);
        }
    }, [context, generateDashboardInsights, addInsightAuditEntry]);

    // Agentic AI System Management
    const availableAIAgents: AIAgent[] = useMemo(() => [
        { id: 'agent-fraud-001', name: 'Fraud Prevention Agent', role: 'Security', status: 'active', lastActivity: new Date().toISOString(), skills: ['monitor_transactions', 'flag_fraud', 'initiate_payment_hold'], modelId: 'chronos-temporal-2.0', efficiencyScore: 95, autoAssignmentEnabled: true },
        { id: 'agent-recon-002', name: 'Reconciliation Agent', role: 'Finance', status: 'active', lastActivity: new Date().toISOString(), skills: ['monitor_ledgers', 'identify_discrepancies', 'initiate_reconciliation'], modelId: 'symphony-xai-1.1', efficiencyScore: 92, autoAssignmentEnabled: true },
        { id: 'agent-opt-003', name: 'Resource Optimization Agent', role: 'Operations', status: 'idle', lastActivity: new Date(Date.now() - 3600000).toISOString(), skills: ['analyze_resource_usage', 'recommend_adjustments'], modelId: 'quantum-v3.2', efficiencyScore: 88, autoAssignmentEnabled: false },
    ], []);

    const [agentActivityLog, setAgentActivityLog] = useState<{ agentId: string; insightId?: string; action: string; timestamp: string; outcome?: string }[]>([]);

    const assignInsightToAgent = useCallback(async (insightId: string, agentId: string) => {
        if (!hasPermission('assign_insights')) {
            console.warn('Permission denied: User cannot assign insights to agents.');
            alert('Permission denied to assign insights to agents.');
            return;
        }
        if (context?.assignInsightToAgent) {
            await context.assignInsightToAgent(insightId, agentId);
        } else {
            console.log(`Mock: Assigning insight ${insightId} to agent ${agentId} for automated processing.`);
            setAgentActivityLog(prev => [...prev, { agentId, insightId, action: 'assignment_received', timestamp: new Date().toISOString() }]);
            // Simulate agent processing
            setTimeout(() => {
                const outcome = Math.random() > 0.2 ? 'completed' : 'failed';
                setAgentActivityLog(prev => [...prev, { agentId, insightId, action: 'processing_complete', timestamp: new Date().toISOString(), outcome }]);

                // Update the insight's agent decision history
                const updatedInsights = aiInsights.map(insight =>
                    insight.id === insightId ? {
                        ...insight,
                        agentDecisionHistory: [...(insight.agentDecisionHistory || []), {
                            agentId,
                            decision: 'Automated remediation initiated',
                            rationale: `Agent ${agentId} processed the insight.`,
                            timestamp: new Date().toISOString(),
                            skillInvoked: 'remediate',
                            outcome: outcome
                        }],
                        status: outcome === 'completed' ? 'actioned' : 'pending review',
                    } : insight
                );
                // In a real context, this would trigger an update in the DataContext
                console.log(`Mock: Agent ${agentId} finished processing insight ${insightId} with outcome: ${outcome}.`);
                addInsightAuditEntry(insightId, 'agent-assigned', { agentId, outcome });
                if (outcome === 'completed') {
                    // Simulate notification for success
                    setNotifications(prev => [...prev, {
                        id: generateUniqueId(), userId: currentUserId, insightId, type: 'agent-action-complete',
                        message: `Agent ${availableAIAgents.find(a => a.id === agentId)?.name} successfully acted on insight "${aiInsights.find(i => i.id === insightId)?.title}".`,
                        timestamp: new Date().toISOString(), isRead: false, link: `/insights/${insightId}`, priority: 'medium'
                    }]);
                } else {
                    // Simulate notification for failure
                    setNotifications(prev => [...prev, {
                        id: generateUniqueId(), userId: currentUserId, insightId, type: 'agent-action-failed',
                        message: `Agent ${availableAIAgents.find(a => a.id === agentId)?.name} failed to act on insight "${aiInsights.find(i => i.id === insightId)?.title}". Manual intervention required.`,
                        timestamp: new Date().toISOString(), isRead: false, link: `/insights/${insightId}`, priority: 'high'
                    }]);
                }

            }, 5000);
        }
    }, [context, hasPermission, availableAIAgents, aiInsights, currentUserId, addInsightAuditEntry, setNotifications]);

    const triggerAgentActionForInsight = useCallback(async (insightId: string, agentId: string, actionDescription: string, skill: string) => {
        if (!hasPermission('assign_insights')) {
            console.warn('Permission denied: User cannot trigger agent actions.');
            alert('Permission denied to trigger agent actions.');
            return;
        }
        if (context?.triggerAgentActionForInsight) {
            await context.triggerAgentActionForInsight(insightId, agentId, actionDescription, skill);
        } else {
            console.log(`Mock: Triggering agent ${agentId} for action "${actionDescription}" on insight ${insightId}. Skill: ${skill}`);
            setAgentActivityLog(prev => [...prev, { agentId, insightId, action: `triggered_skill:${skill}`, timestamp: new Date().toISOString() }]);
            // Simulate agent processing
            setTimeout(() => {
                const outcome = Math.random() > 0.3 ? 'completed' : 'failed';
                setAgentActivityLog(prev => [...prev, { agentId, insightId, action: `skill_execution_complete`, timestamp: new Date().toISOString(), outcome }]);

                // Update the insight's agent decision history
                const updatedInsights = aiInsights.map(insight =>
                    insight.id === insightId ? {
                        ...insight,
                        agentDecisionHistory: [...(insight.agentDecisionHistory || []), {
                            agentId,
                            decision: `User-triggered agent action: ${actionDescription}`,
                            rationale: `Agent ${agentId} invoked skill ${skill}.`,
                            timestamp: new Date().toISOString(),
                            skillInvoked: skill,
                            outcome: outcome
                        }],
                        status: outcome === 'completed' ? 'actioned' : 'pending review',
                    } : insight
                );
                console.log(`Mock: Agent ${agentId} executed skill ${skill} for insight ${insightId} with outcome: ${outcome}.`);
                addInsightAuditEntry(insightId, 'agent-action-triggered', { agentId, actionDescription, skill, outcome });

                if (outcome === 'completed') {
                    setNotifications(prev => [...prev, {
                        id: generateUniqueId(), userId: currentUserId, insightId, type: 'agent-action-complete',
                        message: `Agent ${availableAIAgents.find(a => a.id === agentId)?.name} successfully completed action "${actionDescription}" for insight "${aiInsights.find(i => i.id === insightId)?.title}".`,
                        timestamp: new Date().toISOString(), isRead: false, link: `/insights/${insightId}`, priority: 'medium'
                    }]);
                } else {
                    setNotifications(prev => [...prev, {
                        id: generateUniqueId(), userId: currentUserId, insightId, type: 'agent-action-failed',
                        message: `Agent ${availableAIAgents.find(a => a.id === agentId)?.name} failed to complete action "${actionDescription}" for insight "${aiInsights.find(i => i.id === insightId)?.title}".`,
                        timestamp: new Date().toISOString(), isRead: false, link: `/insights/${insightId}`, priority: 'high'
                    }]);
                }
            }, 4000);
        }
    }, [context, hasPermission, availableAIAgents, aiInsights, currentUserId, addInsightAuditEntry, setNotifications]);

    const getInsightAccessPermissions = useCallback((insightId: string, userId: string): ('view' | 'edit' | 'assign' | 'approve')[] => {
        const insight = aiInsights.find(i => i.id === insightId);
        if (!insight || !insight.accessControl) {
            // Default permissions if no specific ACL
            if (currentUserRole === 'AI Lead') return ['view', 'edit', 'assign', 'approve'];
            if (currentUserRole === 'Data Scientist' || currentUserRole === 'Operations Manager') return ['view', 'edit', 'assign'];
            return ['view'];
        }
        const userAccess = insight.accessControl.find(ac => ac.userId === userId);
        if (userAccess) {
            return [userAccess.permission]; // Assuming one permission per user in this mock
        }
        // Fallback to general role-based if no direct ACL entry
        return getInsightAccessPermissions(insightId, currentUserId); // Recursively check current user's role
    }, [aiInsights, currentUserRole, currentUserId]);


    const flagRelatedTransaction = useCallback(async (insightId: string, transactionId: string, reason: string) => {
        if (context?.flagRelatedTransaction) {
            await context.flagRelatedTransaction(insightId, transactionId, reason);
        } else {
            console.log(`Mock: Flagging transaction ${transactionId} related to insight ${insightId} for review. Reason: ${reason}`);
            // Simulate API call to payments infrastructure
            setTimeout(() => {
                const status = Math.random() > 0.1 ? 'flagged_for_review' : 'flagging_failed';
                console.log(`Mock: Transaction ${transactionId} status: ${status}`);
                alert(`Transaction ${transactionId} flagged: ${status}. (Mock)`);
                addInsightAuditEntry(insightId, 'flagged-transaction', { transactionId, reason, status });
                setNotifications(prev => [...prev, {
                    id: generateUniqueId(), userId: currentUserId, insightId, type: 'system-alert',
                    message: `Transaction ${transactionId} flagged from insight "${aiInsights.find(i => i.id === insightId)?.title}" with status: ${status}.`,
                    timestamp: new Date().toISOString(), isRead: false, link: `/transactions/${transactionId}`, priority: status === 'flagging_failed' ? 'high' : 'medium'
                }]);
            }, 2000);
        }
    }, [context, aiInsights, currentUserId, addInsightAuditEntry, setNotifications]);

    useEffect(() => {
        if (aiInsights.length === 0 && !isInsightsLoading) {
            generateDashboardInsights();
        }
        fetchHistoricalInsightsDebounced(
            historicalSearchTerm,
            historicalFilters,
            historicalCurrentPage,
            historicalPageSize,
            historicalSortBy,
            historicalSortOrder
        );
    }, [aiInsights.length, isInsightsLoading, generateDashboardInsights, fetchHistoricalInsightsDebounced, historicalSearchTerm, historicalFilters, historicalCurrentPage, historicalPageSize, historicalSortBy, historicalSortOrder]);

    return {
        aiInsights,
        isInsightsLoading,
        generateDashboardInsights,
        dismissInsight,
        markInsightAsActioned,
        updateInsightStatus,
        addInsightAttachment,

        queryInput,
        setQueryInput,
        queryResults,
        isQuerying,
        submitAIQuery,
        clearQueryResults,

        preferences,
        handlePreferenceChange,
        handleSavePreferences,
        resetPreferences,
        availableInsightTypes,
        availableDataSources,
        availableAIModels,

        provideInsightFeedback,

        aiSystemStatus,
        aiPerformanceMetrics,
        getAIModelDetails,
        checkSystemHealth,

        historicalSearchTerm,
        setHistoricalSearchTerm,
        historicalFilters,
        setHistoricalFilters,
        handleHistoricalFilterChange,
        handleHistoricalSearch: fetchHistoricalInsightsDebounced,
        historicalSearchResults,
        isHistoricalLoading,
        historicalTotalResults,
        historicalCurrentPage,
        setHistoricalCurrentPage,
        historicalPageSize,
        setHistoricalPageSize,
        historicalSortBy,
        historicalSortOrder,
        handleHistoricalSortChange,

        selectedCollaborationInsightId,
        setSelectedCollaborationInsightId,
        newCommentText,
        setNewCommentText,
        assignedUserForCollaboration,
        setAssignedUserForCollaboration,
        assignActionToUser,
        setAssignActionToUser,
        collaborationUsers,
        currentUserId,
        currentUserName,
        handleAddComment,
        handleAssignInsight,
        assignActionToUserInInsight,
        hasPermission, // Expose permission check

        prioritizationRules,
        addPrioritizationRule,
        updatePrioritizationRule,
        deletePrioritizationRule,
        recalculateAllInsightPriorities,

        selectedAIModelForDetails,
        setSelectedAIModelForDetails,
        isModelTesting,
        deployAIModel,
        compareAIModels,
        modelComparisonResults,

        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        dismissNotification,

        dataSourcesConfig,
        isDataSourceLoading,
        fetchDataSourceStatus,
        updateDataSourceConfiguration,
        triggerManualSync,

        // New Agentic AI Management
        availableAIAgents,
        agentActivityLog,
        assignInsightToAgent,
        triggerAgentActionForInsight,
        getInsightAccessPermissions,
        addInsightAuditEntry, // Expose audit entry helper

        // New Payments Infrastructure Integration
        flagRelatedTransaction,
    };
};