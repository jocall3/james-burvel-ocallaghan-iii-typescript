import { useState, useCallback, useMemo, useEffect, useContext, useRef } from 'react';
import { DataContext } from '../../../context/DataContext'; // Adjust path as necessary

//region Copied Definitions from AIInsights.tsx for self-containment and strict adherence
// Expanded Insight Data Structure (conceptual, assumes DataContext provides this)
export interface ExtendedAIInsight {
    id: string;
    title: string;
    description: string;
    urgency: 'low' | 'medium' | 'high' | 'critical' | 'informational';
    type: 'general' | 'predictive' | 'actionable' | 'correlation' | 'anomaly' | 'sentiment' | 'geospatial' | 'multimedia' | 'risk' | 'opportunity' | 'efficiency' | 'compliance' | 'market' | 'customer' | 'security' | 'ethical' | 'resource' | 'sustainability' | 'trend' | 'forecasting' | 'optimization' | 'recommendation' | 'compliance' | 'security' | 'financial' | 'operational';
    timestamp: string; // ISO string
    source: string; // e.g., 'Sales Data', 'Marketing Analytics', 'IoT Sensors'
    dataPoints?: any[]; // Raw data points supporting the insight
    metrics?: { [key: string]: any }; // Key metrics related to the insight
    relatedEntities?: { type: string; id: string; name: string }[];
    recommendedActions?: { id: string; description: string; priority: 'low' | 'medium' | 'high'; status: 'pending' | 'in-progress' | 'completed' | 'deferred'; assignedTo?: string; deadline?: string }[];
    predictions?: { target: string; value: number; confidence: number; trend: 'up' | 'down' | 'stable' }[];
    visualizations?: { type: 'chart' | 'map' | 'graph' | 'table' | 'image'; data: any; options?: any; description?: string }[];
    explanation?: string; // Explainable AI (XAI)
    feedback?: { rating: number; comment: string; timestamp: string; userId: string; userName: string }[];
    modelVersion?: string;
    ethicalConsiderations?: { aspect: string; score: number; details: string }[]; // Ethical AI
    tags?: string[];
    status?: 'active' | 'archived' | 'dismissed' | 'resolved' | 'pending review' | 'actioned' | 'reopened';
    impactScore?: number; // Calculated impact (0-100)
    priorityScore?: number; // Calculated priority (0-100), combining urgency, impact, and custom rules
    assignedTo?: { userId: string; name: string; assignedAt: string; status: 'pending' | 'in-progress' | 'completed' }[];
    comments?: { id: string; userId: string; userName: string; timestamp: string; text: string; parentCommentId?: string }[];
    auditTrail?: { id: string; userId: string; userName: string; action: string; timestamp: string; details?: any }[];
    resolutionDetails?: { resolvedBy: string; resolvedAt: string; summary: string; actionsTaken?: string[] };
    costEstimate?: { currency: string; amount: number; modelUsed: string; calculationMethod: 'estimated' | 'actual' };
    attachments?: { id: string; fileName: string; fileType: string; url: string; uploadedBy: string; uploadedAt: string }[];
}

// Insight Type Icon Map (new)
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
    'sustainability': '🌳',
    'trend': '📊',
    'forecasting': '🗓️',
    'optimization': '🎯',
    'recommendation': '👍',
    'financial': '💰',
    'operational': '🛠️'
};

// Utility for generating unique IDs (new)
export const generateUniqueId = (): string => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Utility for debouncing functions
export const debounce = <T extends (...args: any[]) => void>(func: T, delay: number) => {
    let timeout: NodeJS.Timeout;
    return function (this: any, ...args: Parameters<T>) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
};

//endregion

// Define the structure for AI performance metrics as used in the seed
export interface AIPerformanceMetrics {
    lastHeartbeat: string;
    insightGenerationRate: number; // Insights per minute
    averageResponseTime: number; // ms
    dataProcessingVolume: number; // GB/hour
    modelAccuracyHistory: { timestamp: string; accuracy: number }[];
    resourceUtilization: { cpu: number; memory: number; gpu?: number }; // %
    errorRate: number; // %
    costPerInsight: number; // USD
}

// Define the structure for AI model
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
    costMultiplier?: number; // Relative cost compared to a baseline model
}

// Define the structure for AI preferences
export interface AIPreferences {
    insightTypes: string[];
    urgencyThreshold: 'low' | 'medium' | 'high' | 'critical' | 'informational';
    dataSources: string[];
    realtimeUpdates: boolean;
    explanationLevel: 'none' | 'basic' | 'detailed' | 'verbose';
    modelSelection: string; // ID of the preferred model
    notificationSettings: {
        email: boolean;
        push: boolean;
        sms: boolean;
        threshold: 'medium' | 'high' | 'critical' | 'all';
        digestFrequency: 'daily' | 'weekly' | 'none';
    };
    refreshIntervalMinutes: number; // How often to auto-refresh insights
    costOptimizationLevel: 'none' | 'moderate' | 'aggressive'; // Prioritize cost over detail/frequency
    autoArchiveDurationDays: number; // How long to keep resolved insights visible
    customReportSchedule: 'daily' | 'weekly' | 'monthly' | 'none';
    preferredTimezone: string;
    language: string;
}

// Define the structure for a collaboration user
export interface CollaborationUser {
    id: string;
    name: string;
    avatar: string;
    role: string;
    email: string;
}

// Define an interface for custom insight prioritization rules
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
    boostFactor: number; // Multiplier for priorityScore (e.g., 1.5 for 50% boost)
    isActive: boolean;
    lastModified: string;
}

// Define an interface for a notification
export interface AINotification {
    id: string;
    userId: string;
    insightId?: string;
    type: 'new-insight' | 'assigned-insight' | 'comment-added' | 'insight-status-change' | 'system-alert' | 'preferences-update';
    message: string;
    timestamp: string;
    isRead: boolean;
    link: string;
    priority: 'low' | 'medium' | 'high';
}

// Define an interface for data source configuration
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

export const useAIInsightManagement = () => {
    // Attempt to get data and actions from DataContext. If not available, use local mocks.
    const context = useContext(DataContext);

    // region Core Insight Data & Actions from Context/Mocks
    const aiInsights = context?.aiInsights || [];
    const isInsightsLoading = context?.isInsightsLoading || false;
    const generateDashboardInsights = context?.generateDashboardInsights || (() => {
        console.warn('generateDashboardInsights not provided by DataContext. Mocking generation.');
        // Mock generation logic
        setTimeout(() => {
            console.log('Mock: Generating new insights...');
            // In a real app, this would fetch from a backend.
            // For now, let's assume DataContext would update aiInsights.
        }, 1000);
    });
    const dismissInsight = context?.dismissInsight || ((id: string) => console.log(`Mock: Dismiss insight ${id}`));
    const markInsightAsActioned = context?.markInsightAsActioned || ((insightId: string, actionId: string) => console.log(`Mock: Actioned ${actionId} for insight ${insightId}`));
    const updateInsightStatus = context?.updateInsightStatus || ((insightId: string, status: ExtendedAIInsight['status']) => console.log(`Mock: Updated insight ${insightId} status to ${status}`));
    const addInsightAttachment = context?.addInsightAttachment || ((insightId: string, file: File) => console.log(`Mock: Added attachment ${file.name} to insight ${insightId}`));
    // endregion

    // region AI Query Interface Logic
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
    // endregion

    // region Preferences Manager Logic
    const availableInsightTypes = useMemo(() => Object.keys(InsightTypeIconMap), []);
    const availableDataSources = useMemo(() => ['Sales Data', 'Marketing Analytics', 'Customer Support Logs', 'IoT Sensor Data', 'Financial Reports', 'Social Media Feeds', 'Website Analytics', 'ERP System', 'HR Data'], []);
    const availableAIModels: AIModel[] = useMemo(() => [
        { id: 'quantum-v3.2', name: 'Quantum Core', version: '3.2', description: 'Advanced general intelligence model with enhanced predictive capabilities.', status: 'active', deploymentDate: '2023-01-15T10:00:00Z', lastUpdated: '2023-11-20T14:30:00Z', performanceMetrics: { accuracy: 0.902, precision: 0.88, recall: 0.92, f1_score: 0.90 }, trainingDataInfo: { sizeGB: 1200, lastRefresh: '2023-12-01T08:00:00Z', biasDetected: false }, costMultiplier: 1.2 },
        { id: 'symphony-v1.1', name: 'Symphony-XAI', version: '1.1', description: 'Specialized model for explainable AI, providing detailed reasoning for insights.', status: 'active', deploymentDate: '2023-03-01T11:00:00Z', lastUpdated: '2023-10-05T09:15:00Z', performanceMetrics: { accuracy: 0.885, precision: 0.85, recall: 0.91, f1_score: 0.88 }, trainingDataInfo: { sizeGB: 800, lastRefresh: '2023-11-15T07:00:00Z', biasDetected: true }, costMultiplier: 1.0 },
        { id: 'chronos-v2.0', name: 'Chronos-Temporal', version: '2.0', description: 'Optimized for real-time anomaly detection and temporal forecasting.', status: 'active', deploymentDate: '2023-06-20T13:00:00Z', lastUpdated: '2023-12-10T16:00:00Z', performanceMetrics: { accuracy: 0.915, precision: 0.90, recall: 0.93, f1_score: 0.92 }, trainingDataInfo: { sizeGB: 600, lastRefresh: '2023-12-12T10:00:00Z', biasDetected: false }, costMultiplier: 1.1 },
        { id: 'atlas-v0.5-beta', name: 'Atlas-Geospatial (Beta)', version: '0.5', description: 'Experimental model for location-based insights and risk assessment.', status: 'training', deploymentDate: '2024-01-01T00:00:00Z', lastUpdated: '2024-01-20T18:00:00Z', costMultiplier: 0.8 }
    ], []);

    const initialPreferences: AIPreferences = useMemo(() => ({
        insightTypes: ['predictive', 'actionable', 'anomaly'],
        urgencyThreshold: 'medium',
        dataSources: ['Sales Data', 'Marketing Analytics'],
        realtimeUpdates: true,
        explanationLevel: 'detailed',
        modelSelection: availableAIModels[0]?.id || 'quantum-v3.2', // Ensure a fallback
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
    // endregion

    // region Insight Feedback Module Logic
    const provideInsightFeedback = context?.provideInsightFeedback || ((insightId: string, rating: number, comment: string, userId: string, userName: string) => {
        console.log(`Mock Feedback for ${insightId}: Rating=${rating}, Comment="${comment}", User=${userName}`);
        // In a real app, this would update insight data.
        // For mock, let's pretend it adds to the feedback array if possible.
        const currentInsight = aiInsights.find(i => i.id === insightId);
        if (currentInsight) {
            const newFeedback = { rating, comment, timestamp: new Date().toISOString(), userId, userName };
            const updatedInsight = {
                ...currentInsight,
                feedback: currentInsight.feedback ? [...currentInsight.feedback, newFeedback] : [newFeedback],
            };
            // In a real context, this would trigger an update in the DataContext
            // For mock, we just log.
            console.log("Mock: Updated insight with new feedback:", updatedInsight);
        }
    });
    // endregion

    // region AI System Health and Performance Monitor
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
    }, [context?.aiPerformanceMetrics]);

    const getAIModelDetails = useCallback((modelId: string): AIModel | undefined => {
        return availableAIModels.find(model => model.id === modelId);
    }, [availableAIModels]);

    const checkSystemHealth = useCallback(() => {
        if (context?.checkAISystemHealth) {
            context.checkAISystemHealth();
        } else {
            console.log("Mock: Initiating AI system health check...");
            // Simulate a check
            // For a real app, this would update aiSystemStatus and aiPerformanceMetrics in context
            setTimeout(() => {
                console.log("Mock: AI System health check completed. Status: Operational");
            }, 1000);
        }
    }, [context]);

    // endregion

    // region Historical Insight Archive Logic
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
        setHistoricalCurrentPage(1); // Reset page on filter change
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
                // Simulate API call
                setTimeout(() => {
                    const allInsights = aiInsights; // Using current insights as mock historical data
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

                    // Apply sorting
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
                }, 750); // Shorter debounce for faster mock
            }
        }, 300) // Debounce by 300ms
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
    // endregion

    // region Collaboration Hub Logic
    const [selectedCollaborationInsightId, setSelectedCollaborationInsightId] = useState<string | null>(null);
    const [newCommentText, setNewCommentText] = useState('');
    const [assignedUserForCollaboration, setAssignedUserForCollaboration] = useState<string>('');
    const [assignActionToUser, setAssignActionToUser] = useState<{ actionId: string, userId: string } | null>(null);

    const collaborationUsers: CollaborationUser[] = useMemo(() => [
        { id: 'user-123', name: 'You (AI Lead)', avatar: 'https://i.pravatar.cc/30?img=6', role: 'AI Lead', email: 'you@example.com' },
        { id: 'user-456', name: 'Dr. Evelyn Reed (Data Scientist)', avatar: 'https://i.pravatar.cc/30?img=12', role: 'Data Scientist', email: 'evelyn.reed@example.com' },
        { id: 'user-789', name: 'Mr. Alex Chen (Operations Manager)', avatar: 'https://i.pravatar.cc/30?img=22', role: 'Operations Manager', email: 'alex.chen@example.com' },
        { id: 'user-101', name: 'Ms. Sarah Miller (Marketing Analyst)', avatar: 'https://i.pravatar.cc/30?img=34', role: 'Marketing Analyst', email: 'sarah.miller@example.com' },
        { id: 'user-202', name: 'Eng. David Kim (DevOps Engineer)', avatar: 'https://i.pravatar.cc/30?img=42', role: 'DevOps Engineer', email: 'david.kim@example.com' },
    ], []);

    const currentUserId = collaborationUsers[0].id; // Mocking current user
    const currentUserName = collaborationUsers[0].name;

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
            // In a real system, this would trigger a DataContext update
            console.log("Mock: Added comment to insight", { ...targetInsight, comments: [...(targetInsight.comments || []), newComment] });
        }
    });

    const assignInsight = context?.assignInsight || ((insightId: string, userId: string, userName: string, assignmentStatus: 'pending' | 'in-progress' = 'pending') => {
        console.log(`Mock: Insight ${insightId} assigned to user ${userName}`);
        const targetInsight = aiInsights.find(i => i.id === insightId);
        if (targetInsight) {
            const newAssignment = { userId, name: userName, assignedAt: new Date().toISOString(), status: assignmentStatus };
            // In a real system, this would trigger a DataContext update
            console.log("Mock: Assigned insight", { ...targetInsight, assignedTo: [...(targetInsight.assignedTo || []), newAssignment] });
            // Potentially also add to audit trail
            const auditEntry = { id: generateUniqueId(), userId: currentUserId, userName: currentUserName, action: 'assign-insight', timestamp: new Date().toISOString(), details: { assignedTo: userName, status: assignmentStatus } };
            console.log("Mock: Added audit trail entry:", auditEntry);
        }
    });

    const assignActionToUserInInsight = context?.assignActionToUserInInsight || ((insightId: string, actionId: string, userId: string) => {
        console.log(`Mock: Action ${actionId} in insight ${insightId} assigned to user ${userId}`);
        const targetInsight = aiInsights.find(i => i.id === insightId);
        if (targetInsight && targetInsight.recommendedActions) {
            const updatedActions = targetInsight.recommendedActions.map(action =>
                action.id === actionId ? { ...action, assignedTo: userId, status: 'in-progress', deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() } : action
            );
            console.log("Mock: Assigned action within insight", { ...targetInsight, recommendedActions: updatedActions });
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
                setAssignedUserForCollaboration(''); // Clear selection after assigning
            }
        }
    }, [selectedCollaborationInsightId, assignedUserForCollaboration, assignInsight, collaborationUsers]);

    const handleAssignAction = useCallback(() => {
        if (selectedCollaborationInsightId && assignActionToUser?.actionId && assignActionToUser?.userId) {
            assignActionToUserInInsight(selectedCollaborationInsightId, assignActionToUser.actionId, assignActionToUser.userId);
            setAssignActionToUser(null);
        }
    }, [selectedCollaborationInsightId, assignActionToUser, assignActionToUserInInsight]);
    // endregion

    // region Insight Prioritization Engine
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
    }, [prioritizationRules, context]);

    const updatePrioritizationRule = useCallback((id: string, updates: Partial<InsightPrioritizationRule>) => {
        setPrioritizationRules(prev => {
            const updated = prev.map(rule =>
                rule.id === id ? { ...rule, ...updates, lastModified: new Date().toISOString() } : rule
            );
            if (context?.updatePrioritizationRules) {
                context.updatePrioritizationRules(updated);
            }
            console.log("Mock: Updated prioritization rule:", id, updates);
            return updated;
        });
    }, [prioritizationRules, context]);

    const deletePrioritizationRule = useCallback((id: string) => {
        setPrioritizationRules(prev => {
            const filtered = prev.filter(rule => rule.id !== id);
            if (context?.updatePrioritizationRules) {
                context.updatePrioritizationRules(filtered);
            }
            console.log("Mock: Deleted prioritization rule:", id);
            return filtered;
        });
    }, [prioritizationRules, context]);

    const recalculateAllInsightPriorities = useCallback(() => {
        console.log("Mock: Recalculating all insight priorities based on current rules...");
        if (context?.recalculateInsightPriorities) {
            context.recalculateInsightPriorities();
        } else {
            // Simulate recalculation for current insights
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
                return { ...insight, priorityScore: Math.round(Math.min(finalScore, 100)) }; // Cap at 100
            });
            // In a real app, this would update aiInsights in DataContext
            console.log("Mock: Insights with new priority scores:", updatedInsights.map(i => ({ id: i.id, title: i.title, priorityScore: i.priorityScore })));
            alert('Mock: Insight priorities recalculated!');
        }
    }, [aiInsights, prioritizationRules, context]);
    // endregion

    // region AI Model Management
    const [selectedAIModelForDetails, setSelectedAIModelForDetails] = useState<string | null>(null);
    const [isModelTesting, setIsModelTesting] = useState(false);
    const [modelComparisonResults, setModelComparisonResults] = useState<{ modelId: string; insightsGenerated: number; avgAccuracy: number }[]>([]);

    const deployAIModel = useCallback(async (modelId: string) => {
        if (context?.deployAIModel) {
            await context.deployAIModel(modelId);
        } else {
            console.log(`Mock: Deploying AI Model ${modelId}...`);
            // Simulate API call
            setIsModelTesting(true);
            setTimeout(() => {
                const model = availableAIModels.find(m => m.id === modelId);
                if (model) {
                    model.status = 'active'; // In a real scenario, this would update the actual model data
                    alert(`Model ${model.name} deployed successfully! (Mock)`);
                }
                setIsModelTesting(false);
            }, 3000);
        }
    }, [context, availableAIModels]);

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
            }, 4000);
        }
    }, [context, availableAIModels]);
    // endregion

    // region Notification System
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

    // Simulate new notifications arriving
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.7 && preferences.notificationSettings.realtimeUpdates) { // 30% chance for new notification
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
                if (preferences.notificationSettings.threshold === 'all' || newNotification.priority === 'high' || preferences.notificationSettings.threshold === 'medium' && newNotification.priority === 'medium') {
                    setNotifications(prev => [newNotification, ...prev]);
                    console.log("Mock: New notification generated:", newNotification);
                }
            }
        }, 15000); // Check every 15 seconds for a new notification
        return () => clearInterval(interval);
    }, [aiInsights, preferences.notificationSettings, currentUserId, collaborationUsers]);
    // endregion

    // region Data Source Management
    const [dataSourcesConfig, setDataSourcesConfig] = useState<DataSourceConfig[]>(context?.dataSourcesConfig || []);
    const [isDataSourceLoading, setIsDataSourceLoading] = useState(false);

    useEffect(() => {
        if (context?.dataSourcesConfig) {
            setDataSourcesConfig(context.dataSourcesConfig);
        } else {
            // Mock initial data sources if context doesn't provide
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
            }, 1000);
        }
    }, [context]);

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
                // This would trigger insight regeneration in a real app
                generateDashboardInsights();
            }, 2500);
        }
    }, [context, generateDashboardInsights]);
    // endregion

    // region Initial Load Effect
    useEffect(() => {
        if (aiInsights.length === 0 && !isInsightsLoading) {
            generateDashboardInsights();
        }
        // Initial fetch for historical insights when component mounts
        fetchHistoricalInsightsDebounced(
            historicalSearchTerm,
            historicalFilters,
            historicalCurrentPage,
            historicalPageSize,
            historicalSortBy,
            historicalSortOrder
        );
    }, [aiInsights.length, isInsightsLoading, generateDashboardInsights, fetchHistoricalInsightsDebounced, historicalSearchTerm, historicalFilters, historicalCurrentPage, historicalPageSize, historicalSortBy, historicalSortOrder]);
    // endregion

    return {
        // Core Insights
        aiInsights,
        isInsightsLoading,
        generateDashboardInsights,
        dismissInsight,
        markInsightAsActioned,
        updateInsightStatus,
        addInsightAttachment,

        // AI Query Interface
        queryInput,
        setQueryInput,
        queryResults,
        isQuerying,
        submitAIQuery,
        clearQueryResults,

        // Preferences Management
        preferences,
        handlePreferenceChange,
        handleSavePreferences,
        resetPreferences,
        availableInsightTypes,
        availableDataSources,
        availableAIModels,

        // Insight Feedback
        provideInsightFeedback,

        // AI System Performance
        aiSystemStatus,
        aiPerformanceMetrics,
        getAIModelDetails,
        checkSystemHealth,

        // Historical Insights
        historicalSearchTerm,
        setHistoricalSearchTerm,
        historicalFilters,
        setHistoricalFilters,
        handleHistoricalFilterChange,
        handleHistoricalSearch: fetchHistoricalInsightsDebounced, // Expose debounced version
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

        // Collaboration Hub
        selectedCollaborationInsightId,
        setSelectedCollaborationInsightId,
        newCommentText,
        setNewCommentText,
        assignedUserForCollaboration,
        setAssignedUserForCollaboration,
        assignActionToUser,
        setAssignActionToUser,
        collaborationUsers,
        handleAddComment,
        handleAssignInsight,
        assignActionToUserInInsight, // Expose this directly for recommended actions in UI

        // Insight Prioritization Engine
        prioritizationRules,
        addPrioritizationRule,
        updatePrioritizationRule,
        deletePrioritizationRule,
        recalculateAllInsightPriorities,

        // AI Model Management
        selectedAIModelForDetails,
        setSelectedAIModelForDetails,
        isModelTesting,
        deployAIModel,
        compareAIModels,
        modelComparisonResults,

        // Notification System
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        dismissNotification,

        // Data Source Management
        dataSourcesConfig,
        isDataSourceLoading,
        fetchDataSourceStatus,
        updateDataSourceConfiguration,
        triggerManualSync,
    };
};