export type Urgency = 'low' | 'medium' | 'high' | 'critical' | 'informational';
export type InsightType = 'general' | 'predictive' | 'actionable' | 'correlation' | 'anomaly' | 'sentiment' | 'geospatial' | 'multimedia' | 'risk' | 'opportunity' | 'efficiency' | 'compliance' | 'market' | 'customer' | 'security' | 'ethical' | 'resource' | 'sustainability' | 'trend' | 'forecasting' | 'optimization' | 'recommendation';
export type ActionPriority = 'low' | 'medium' | 'high';
export type ActionStatus = 'pending' | 'in-progress' | 'completed' | 'deferred';
export type PredictionTrend = 'up' | 'down' | 'stable';
export type VisualizationType = 'chart' | 'map' | 'graph';
export type InsightStatus = 'active' | 'archived' | 'dismissed' | 'resolved';
export type ExplanationLevel = 'none' | 'basic' | 'detailed';
export type AISystemStatus = 'operational' | 'degraded' | 'offline';

export interface RelatedEntity {
    type: string;
    id: string;
    name: string;
}

export interface RecommendedAction {
    id: string;
    description: string;
    priority: ActionPriority;
    status: ActionStatus;
}

export interface Prediction {
    target: string;
    value: number;
    confidence: number;
    trend: PredictionTrend;
}

export interface Visualization {
    type: VisualizationType;
    data: any;
    options?: any;
}

export interface EthicalConsideration {
    aspect: string;
    score: number;
    details: string;
}

export interface UserFeedback {
    rating: number;
    comment: string;
    timestamp: string;
}

export interface ExtendedAIInsight {
    id: string;
    title: string;
    description: string;
    urgency: Urgency;
    type: InsightType;
    timestamp: string;
    source: string;
    dataPoints?: any[];
    metrics?: { [key: string]: any };
    relatedEntities?: RelatedEntity[];
    recommendedActions?: RecommendedAction[];
    predictions?: Prediction[];
    visualizations?: Visualization[];
    explanation?: string;
    feedback?: UserFeedback[];
    modelVersion?: string;
    ethicalConsiderations?: EthicalConsideration[];
    tags?: string[];
    status?: InsightStatus;
    impactScore?: number;
}

export interface AIInsightsPreferences {
    insightTypes: InsightType[];
    urgencyThreshold: Urgency;
    dataSources: string[];
    realtimeUpdates: boolean;
    explanationLevel: ExplanationLevel;
    modelSelection: string;
}

export interface AIModel {
    id: string;
    name: string;
    version: string;
    description: string;
}

export interface ModelAccuracyHistoryEntry {
    timestamp: string;
    accuracy: number;
}

export interface ResourceUtilization {
    cpu: number;
    memory: number;
    gpu?: number;
    network?: number;
    diskIO?: number;
}

export interface AIPerformanceMetrics {
    aiSystemStatus: AISystemStatus;
    lastHeartbeat: string;
    insightGenerationRate: number;
    averageResponseTime: number;
    dataProcessingVolume: number;
    modelAccuracyHistory: ModelAccuracyHistoryEntry[];
    resourceUtilization: ResourceUtilization;
    activeSessions: number;
    errorRate: number;
    uptimePercentage: number;
}

export interface InsightQueryResponse {
    query: string;
    results: string[];
    sourceModel: string;
    responseTimeMs: number;
    confidenceScore: number;
}

export interface HistoricalInsightFilters {
    type?: InsightType | 'all';
    urgency?: Urgency | 'all';
    status?: InsightStatus | 'all';
    startDate?: string;
    endDate?: string;
    searchTerm?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface HistoricalInsightsResponse {
    insights: ExtendedAIInsight[];
    totalResults: number;
    currentPage: number;
    totalPages: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
}

export interface ComplexDataSchema {
    version: string;
    fields: Array<{
        name: string;
        type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
        nullable: boolean;
        defaultValue?: any;
        constraints?: {
            minLength?: number;
            maxLength?: number;
            minValue?: number;
            maxValue?: number;
            pattern?: string;
            enum?: string[];
        };
        nestedSchema?: ComplexDataSchema;
    }>;
    relationships?: Array<{
        fromField: string;
        toEntity: string;
        toField: string;
        type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
    }>;
    indices?: Array<{
        fields: string[];
        unique: boolean;
        type: 'btree' | 'hash';
    }>;
}

export interface AdvancedProcessingConfig {
    pipelineId: string;
    steps: Array<{
        stepId: string;
        processorType: 'filter' | 'transform' | 'aggregate' | 'enrich' | 'validate';
        parameters: { [key: string]: any };
        outputSchemaId?: string;
        errorHandlingStrategy?: 'skip' | 'retry' | 'fail';
    }>;
    eventTriggers?: Array<{
        eventType: 'data_arrival' | 'schedule_based' | 'api_call';
        config: object;
    }>;
    notifications?: Array<{
        alertType: 'email' | 'slack' | 'webhook';
        onEvent: 'success' | 'failure' | 'completion';
        recipients: string[];
    }>;
}

export interface DistributedTaskDefinition {
    taskId: string;
    taskType: 'data_ingestion' | 'model_training' | 'report_generation' | 'complex_query_execution';
    payload: object;
    priority: number;
    workerGroup: string;
    maxRetries: number;
    timeoutSeconds: number;
    callbackUrl?: string;
    dependencies?: string[];
    scheduledCron?: string;
    resourceRequirements?: {
        cpuCores?: number;
        memoryGb?: number;
        gpuUnits?: number;
    };
    securityContext?: {
        accessRoles: string[];
        encryptionEnabled: boolean;
    };
}

const AI_API_BASE_URL: string = 'https://api.quantumsense.io/v1/ai';
const AUTH_TOKEN_STORAGE_KEY: string = 'ai_auth_token';
const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
};

const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
};

interface ApiCallOptions {
    method?: string;
    body?: object;
    headers?: Record<string, string>;
    signal?: AbortSignal;
}

async function _apiCall<T>(endpoint: string, options: ApiCallOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {}, signal } = options;
    const url = `${AI_API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            method,
            headers: {
                ...DEFAULT_HEADERS,
                ...getAuthHeaders(),
                ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
            signal,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`API Error: ${response.status} - ${errorData.message || 'Unknown error'}`);
        }

        return await response.json() as T;
    } catch (error) {
        console.error(`Failed to call API at ${url}:`, error);
        throw error;
    }
}

async function _apiCallMultipart<T>(endpoint: string, formData: FormData, headers: Record<string, string> = {}): Promise<T> {
    const url = `${AI_API_BASE_URL}${endpoint}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                ...headers,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`API Error: ${response.status} - ${errorData.message || 'Unknown error'}`);
        }
        return await response.json() as T;
    } catch (error) {
        console.error(`Failed to call multipart API at ${url}:`, error);
        throw error;
    }
}

export async function fetchCurrentAIInsights(limit: number = 20, offset: number = 0): Promise<ExtendedAIInsight[]> {
    try {
        return await _apiCall<ExtendedAIInsight[]>(`/insights?limit=${limit}&offset=${offset}`);
    } catch (error) {
        console.error('Error fetching current insights:', error);
        throw error;
    }
}

export async function dismissInsight(insightId: string): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/insights/${insightId}/dismiss`, { method: 'POST' });
    } catch (error) {
        console.error(`Error dismissing insight ${insightId}:`, error);
        throw error;
    }
}

export async function markInsightAsActioned(insightId: string, actionId: string): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/insights/${insightId}/actions/${actionId}/complete`, { method: 'PUT' });
    } catch (error) {
        console.error(`Error marking action ${actionId} for insight ${insightId} as actioned:`, error);
        throw error;
    }
}

export async function provideInsightFeedback(insightId: string, rating: number, comment: string): Promise<{ success: boolean; feedbackId: string }> {
    try {
        return await _apiCall<{ success: boolean; feedbackId: string }>(`/insights/${insightId}/feedback`, {
            method: 'POST',
            body: { rating, comment, timestamp: new Date().toISOString() },
        });
    } catch (error) {
        console.error(`Error providing feedback for insight ${insightId}:`, error);
        throw error;
    }
}

export async function submitAIQuery(query: string, conversationId?: string): Promise<InsightQueryResponse> {
    try {
        return await _apiCall<InsightQueryResponse>(`/query`, {
            method: 'POST',
            body: { query, conversationId },
        });
    } catch (error) {
        console.error(`Error submitting AI query "${query}":`, error);
        throw error;
    }
}

export async function fetchAIPreferences(userId: string): Promise<AIInsightsPreferences> {
    try {
        return await _apiCall<AIInsightsPreferences>(`/users/${userId}/preferences/ai`);
    } catch (error) {
        console.error(`Error fetching AI preferences for user ${userId}:`, error);
        throw error;
    }
}

export async function updateAIPreferences(userId: string, preferences: AIInsightsPreferences): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/users/${userId}/preferences/ai`, {
            method: 'PUT',
            body: preferences,
        });
    } catch (error) {
        console.error(`Error updating AI preferences for user ${userId}:`, error);
        throw error;
    }
}

export async function fetchAvailableInsightTypes(): Promise<InsightType[]> {
    try {
        return await _apiCall<InsightType[]>(`/config/insight-types`);
    } catch (error) {
        console.error('Error fetching available insight types:', error);
        throw error;
    }
}

export async function fetchAvailableDataSources(): Promise<string[]> {
    try {
        return await _apiCall<string[]>(`/config/data-sources`);
    } catch (error) {
        console.error('Error fetching available data sources:', error);
        throw error;
    }
}

export async function fetchAvailableAIModels(): Promise<AIModel[]> {
    try {
        return await _apiCall<AIModel[]>(`/config/ai-models`);
    } catch (error) {
        console.error('Error fetching available AI models:', error);
        throw error;
    }
}

export async function fetchAISystemMetrics(): Promise<AIPerformanceMetrics> {
    try {
        return await _apiCall<AIPerformanceMetrics>(`/system/metrics`);
    } catch (error) {
        console.error('Error fetching AI system metrics:', error);
        throw error;
    }
}

export async function fetchAIHealthStatus(): Promise<{ status: AISystemStatus; details: string; lastUpdate: string }> {
    try {
        return await _apiCall<{ status: AISystemStatus; details: string; lastUpdate: string }>(`/system/health`);
    } catch (error) {
        console.error('Error fetching AI system health status:', error);
        throw error;
    }
}

export async function fetchHistoricalInsights(filters: HistoricalInsightFilters): Promise<HistoricalInsightsResponse> {
    const queryParams = new URLSearchParams();
    if (filters.searchTerm) queryParams.append('q', filters.searchTerm);
    if (filters.type && filters.type !== 'all') queryParams.append('type', filters.type);
    if (filters.urgency && filters.urgency !== 'all') queryParams.append('urgency', filters.urgency);
    if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.page) queryParams.append('page', String(filters.page));
    if (filters.pageSize) queryParams.append('pageSize', String(filters.pageSize));
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

    try {
        return await _apiCall<HistoricalInsightsResponse>(`/insights/history?${queryParams.toString()}`);
    } catch (error) {
        console.error('Error fetching historical insights:', error);
        throw error;
    }
}

export async function addInsightComment(insightId: string, userId: string, comment: string): Promise<{ success: boolean; commentId: string }> {
    try {
        return await _apiCall<{ success: boolean; commentId: string }>(`/insights/${insightId}/comments`, {
            method: 'POST',
            body: { userId, comment, timestamp: new Date().toISOString() },
        });
    } catch (error) {
        console.error(`Error adding comment to insight ${insightId}:`, error);
        throw error;
    }
}

export async function assignInsight(insightId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/insights/${insightId}/assign`, {
            method: 'POST',
            body: { assignedToUserId: userId },
        });
    } catch (error) {
        console.error(`Error assigning insight ${insightId} to user ${userId}:`, error);
        throw error;
    }
}

export async function fetchUsersForCollaboration(roleFilter?: string): Promise<User[]> {
    const queryParams = new URLSearchParams();
    if (roleFilter) queryParams.append('role', roleFilter);
    try {
        return await _apiCall<User[]>(`/users/collaboration?${queryParams.toString()}`);
    } catch (error) {
        console.error('Error fetching users for collaboration:', error);
        throw error;
    }
}

export async function registerNewInsightSource(sourceName: string, description: string, integrationConfig: object): Promise<{ success: boolean; sourceId: string }> {
    try {
        return await _apiCall<{ success: boolean; sourceId: string }>(`/admin/insight-sources`, {
            method: 'POST',
            body: { sourceName, description, integrationConfig },
        });
    } catch (error) {
        console.error(`Error registering new insight source ${sourceName}:`, error);
        throw error;
    }
}

export async function updateModelConfiguration(modelId: string, configUpdates: object): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/models/${modelId}/config`, {
            method: 'PATCH',
            body: configUpdates,
        });
    } catch (error) {
        console.error(`Error updating model configuration for ${modelId}:`, error);
        throw error;
    }
}

export async function deployNewModelVersion(modelId: string, version: string, releaseNotes: string): Promise<{ success: boolean; deploymentId: string }> {
    try {
        return await _apiCall<{ success: boolean; deploymentId: string }>(`/admin/models/${modelId}/deploy`, {
            method: 'POST',
            body: { version, releaseNotes },
        });
    } catch (error) {
        console.error(`Error deploying new model version for ${modelId}:`, error);
        throw error;
    }
}

export async function getInsightAuditLog(insightId: string, limit: number = 10, offset: number = 0): Promise<any[]> {
    try {
        return await _apiCall<any[]>(`/insights/${insightId}/audit?limit=${limit}&offset=${offset}`);
    } catch (error) {
        console.error(`Error fetching audit log for insight ${insightId}:`, error);
        throw error;
    }
}

export async function requestInsightReanalysis(insightId: string, parameters: object): Promise<{ success: boolean; taskId: string }> {
    try {
        return await _apiCall<{ success: boolean; taskId: string }>(`/insights/${insightId}/reanalyze`, {
            method: 'POST',
            body: { parameters },
        });
    } catch (error) {
        console.error(`Error requesting reanalysis for insight ${insightId}:`, error);
        throw error;
    }
}

export async function subscribeToInsightUpdates(insightId: string, userId: string): Promise<{ success: boolean; subscriptionId: string }> {
    try {
        return await _apiCall<{ success: boolean; subscriptionId: string }>(`/insights/${insightId}/subscribe`, {
            method: 'POST',
            body: { userId },
        });
    } catch (error) {
        console.error(`Error subscribing user ${userId} to insight ${insightId} updates:`, error);
        throw error;
    }
}

export async function unsubscribeFromInsightUpdates(subscriptionId: string): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/insights/subscriptions/${subscriptionId}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error(`Error unsubscribing from insight updates with ID ${subscriptionId}:`, error);
        throw error;
    }
}

export async function generateReportForInsights(insightIds: string[], reportType: 'pdf' | 'csv' | 'json', startDate?: string, endDate?: string): Promise<{ success: boolean; reportUrl: string; reportId: string }> {
    try {
        return await _apiCall<{ success: boolean; reportUrl: string; reportId: string }>(`/reports/insights`, {
            method: 'POST',
            body: { insightIds, reportType, startDate, endDate },
        });
    } catch (error) {
        console.error('Error generating report for insights:', error);
        throw error;
    }
}

export async function fetchDataSchema(sourceId: string): Promise<any> {
    try {
        return await _apiCall<any>(`/data-sources/${sourceId}/schema`);
    } catch (error) {
        console.error(`Error fetching data schema for source ${sourceId}:`, error);
        throw error;
    }
}

export async function triggerModelRetraining(modelId: string, datasetId: string, hyperparameters?: object): Promise<{ success: boolean; trainingJobId: string }> {
    try {
        return await _apiCall<{ success: boolean; trainingJobId: string }>(`/admin/models/${modelId}/retrain`, {
            method: 'POST',
            body: { datasetId, hyperparameters },
        });
    } catch (error) {
        console.error(`Error triggering retraining for model ${modelId}:`, error);
        throw error;
    }
}

export async function getTrainingJobStatus(trainingJobId: string): Promise<{ status: string; progress: number; logs: string[] }> {
    try {
        return await _apiCall<{ status: string; progress: number; logs: string[] }>(`/admin/training-jobs/${trainingJobId}/status`);
    } catch (error) {
        console.error(`Error getting training job status for ${trainingJobId}:`, error);
        throw error;
    }
}

export async function manageUserAccessToInsights(insightId: string, userId: string, accessLevel: 'read' | 'write' | 'none'): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/insights/${insightId}/access`, {
            method: 'PUT',
            body: { userId, accessLevel },
        });
    } catch (error) {
        console.error(`Error managing access for user ${userId} to insight ${insightId}:`, error);
        throw error;
    }
}

export async function deleteInsightById(insightId: string, force: boolean = false): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/insights/${insightId}`, {
            method: 'DELETE',
            body: { force },
        });
    } catch (error) {
        console.error(`Error deleting insight ${insightId}:`, error);
        throw error;
    }
}

export async function archiveInsightsByDateRange(startDate: string, endDate: string): Promise<{ success: boolean; count: number }> {
    try {
        return await _apiCall<{ success: boolean; count: number }>(`/insights/archive/range`, {
            method: 'POST',
            body: { startDate, endDate },
        });
    } catch (error) {
        console.error(`Error archiving insights from ${startDate} to ${endDate}:`, error);
        throw error;
    }
}

export async function fetchNotificationSettings(userId: string): Promise<any> {
    try {
        return await _apiCall<any>(`/users/${userId}/notifications/settings`);
    } catch (error) {
        console.error(`Error fetching notification settings for user ${userId}:`, error);
        throw error;
    }
}

export async function updateNotificationSettings(userId: string, settings: object): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/users/${userId}/notifications/settings`, {
            method: 'PUT',
            body: settings,
        });
    } catch (error) {
        console.error(`Error updating notification settings for user ${userId}:`, error);
        throw error;
    }
}

export async function getSystemConfiguration(): Promise<any> {
    try {
        return await _apiCall<any>(`/system/config`);
    } catch (error) {
        console.error('Error fetching system configuration:', error);
        throw error;
    }
}

export async function updateSystemConfiguration(config: object): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/system/config`, {
            method: 'PUT',
            body: config,
        });
    } catch (error) {
        console.error('Error updating system configuration:', error);
        throw error;
    }
}

export async function triggerDataRefresh(dataSourceId: string): Promise<{ success: boolean; taskId: string }> {
    try {
        return await _apiCall<{ success: boolean; taskId: string }>(`/data-sources/${dataSourceId}/refresh`, {
            method: 'POST',
        });
    } catch (error) {
        console.error(`Error triggering data refresh for ${dataSourceId}:`, error);
        throw error;
    }
}

export async function validateDataIntegrity(dataSourceId: string): Promise<{ success: boolean; issuesFound: number; validationReportUrl: string }> {
    try {
        return await _apiCall<{ success: boolean; issuesFound: number; validationReportUrl: string }>(`/data-sources/${dataSourceId}/validate`, {
            method: 'POST',
        });
    } catch (error) {
        console.error(`Error validating data integrity for ${dataSourceId}:`, error);
        throw error;
    }
}

export async function fetchRealtimeStreamConfiguration(streamId: string): Promise<any> {
    try {
        return await _apiCall<any>(`/streams/${streamId}/config`);
    } catch (error) {
        console.error(`Error fetching realtime stream configuration for ${streamId}:`, error);
        throw error;
    }
}

export async function updateRealtimeStreamConfiguration(streamId: string, configUpdates: object): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/streams/${streamId}/config`, {
            method: 'PATCH',
            body: configUpdates,
        });
    } catch (error) {
        console.error(`Error updating realtime stream configuration for ${streamId}:`, error);
        throw error;
    }
}

export async function deleteRealtimeStream(streamId: string): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/streams/${streamId}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error(`Error deleting realtime stream ${streamId}:`, error);
        throw error;
    }
}

export async function getDashboardLayout(userId: string, dashboardId: string): Promise<any> {
    try {
        return await _apiCall<any>(`/users/${userId}/dashboards/${dashboardId}/layout`);
    } catch (error) {
        console.error(`Error fetching dashboard layout for ${dashboardId}:`, error);
        throw error;
    }
}

export async function saveDashboardLayout(userId: string, dashboardId: string, layout: object): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/users/${userId}/dashboards/${dashboardId}/layout`, {
            method: 'PUT',
            body: layout,
        });
    } catch (error) {
        console.error(`Error saving dashboard layout for ${dashboardId}:`, error);
        throw error;
    }
}

export async function fetchUserPermissions(userId: string): Promise<string[]> {
    try {
        return await _apiCall<string[]>(`/users/${userId}/permissions`);
    } catch (error) {
        console.error(`Error fetching permissions for user ${userId}:`, error);
        throw error;
    }
}

export async function updateUserPermissions(userId: string, permissions: string[]): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/users/${userId}/permissions`, {
            method: 'PUT',
            body: { permissions },
        });
    } catch (error) {
        console.error(`Error updating permissions for user ${userId}:`, error);
        throw error;
    }
}

export async function getTenantSettings(tenantId: string): Promise<any> {
    try {
        return await _apiCall<any>(`/tenants/${tenantId}/settings`);
    } catch (error) {
        console.error(`Error fetching tenant settings for ${tenantId}:`, error);
        throw error;
    }
}

export async function updateTenantSettings(tenantId: string, settings: object): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/tenants/${tenantId}/settings`, {
            method: 'PUT',
            body: settings,
        });
    } catch (error) {
        console.error(`Error updating tenant settings for ${tenantId}:`, error);
        throw error;
    }
}

export async function exportUserData(userId: string, format: 'json' | 'xml' | 'csv'): Promise<{ success: boolean; downloadUrl: string }> {
    try {
        return await _apiCall<{ success: boolean; downloadUrl: string }>(`/users/${userId}/export?format=${format}`);
    } catch (error) {
        console.error(`Error exporting user data for ${userId}:`, error);
        throw error;
    }
}

export async function importUserData(userId: string, fileData: Blob, format: 'json' | 'xml' | 'csv'): Promise<{ success: boolean; message: string; importedCount: number }> {
    const formData = new FormData();
    formData.append('file', fileData);
    formData.append('format', format);
    try {
        return await _apiCallMultipart<{ success: boolean; message: string; importedCount: number }>(`/users/${userId}/import`, formData);
    } catch (error) {
        console.error(`Error importing user data for ${userId}:`, error);
        throw error;
    }
}

export async function bulkUpdateInsightStatus(insightIds: string[], newStatus: InsightStatus): Promise<{ success: boolean; updatedCount: number }> {
    try {
        return await _apiCall<{ success: boolean; updatedCount: number }>(`/insights/bulk-status`, {
            method: 'PUT',
            body: { insightIds, newStatus },
        });
    } catch (error) {
        console.error('Error bulk updating insight status:', error);
        throw error;
    }
}

export async function batchProcessDataPoints(dataPoints: any[], processingConfig: object): Promise<{ success: boolean; batchId: string; processedCount: number }> {
    try {
        return await _apiCall<{ success: boolean; batchId: string; processedCount: number }>(`/data/batch-process`, {
            method: 'POST',
            body: { dataPoints, processingConfig },
        });
    } catch (error) {
        console.error('Error batch processing data points:', error);
        throw error;
    }
}

export async function getProcessingJobStatus(jobId: string): Promise<{ status: string; progress: number; resultsUrl?: string; errors: string[] }> {
    try {
        return await _apiCall<{ status: string; progress: number; resultsUrl?: string; errors: string[] }>(`/data/processing-jobs/${jobId}/status`);
    } catch (error) {
        console.error(`Error getting processing job status for ${jobId}:`, error);
        throw error;
    }
}

export async function requestEthicalReview(insightId: string, reviewerId: string): Promise<{ success: boolean; reviewId: string }> {
    try {
        return await _apiCall<{ success: boolean; reviewId: string }>(`/insights/${insightId}/ethical-review`, {
            method: 'POST',
            body: { reviewerId },
        });
    } catch (error) {
        console.error(`Error requesting ethical review for insight ${insightId}:`, error);
        throw error;
    }
}

export async function submitEthicalReview(reviewId: string, reviewDetails: EthicalConsideration[]): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/ethical-reviews/${reviewId}`, {
            method: 'PUT',
            body: { reviewDetails },
        });
    } catch (error) {
        console.error(`Error submitting ethical review for ID ${reviewId}:`, error);
        throw error;
    }
}

export async function getRecommendationEngineStatus(): Promise<{ status: 'running' | 'paused' | 'failed'; lastChecked: string; pendingRecommendations: number }> {
    try {
        return await _apiCall<{ status: 'running' | 'paused' | 'failed'; lastChecked: string; pendingRecommendations: number }>(`/engines/recommendation/status`);
    } catch (error) {
        console.error('Error getting recommendation engine status:', error);
        throw error;
    }
}

export async function updateRecommendationEngineSettings(settings: object): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/engines/recommendation/settings`, {
            method: 'PUT',
            body: settings,
        });
    } catch (error) {
        console.error('Error updating recommendation engine settings:', error);
        throw error;
    }
}

export async function fetchScheduledTasks(): Promise<any[]> {
    try {
        return await _apiCall<any[]>(`/admin/tasks/scheduled`);
    } catch (error) {
        console.error('Error fetching scheduled tasks:', error);
        throw error;
    }
}

export async function createScheduledTask(taskDefinition: object): Promise<{ success: boolean; taskId: string }> {
    try {
        return await _apiCall<{ success: boolean; taskId: string }>(`/admin/tasks/scheduled`, {
            method: 'POST',
            body: taskDefinition,
        });
    } catch (error) {
        console.error('Error creating scheduled task:', error);
        throw error;
    }
}

export async function deleteScheduledTask(taskId: string): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/tasks/scheduled/${taskId}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error(`Error deleting scheduled task ${taskId}:`, error);
        throw error;
    }
}

export async function getSystemLogs(level?: 'info' | 'warn' | 'error', limit: number = 100): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (level) queryParams.append('level', level);
    queryParams.append('limit', String(limit));
    try {
        return await _apiCall<any[]>(`/system/logs?${queryParams.toString()}`);
    } catch (error) {
        console.error('Error fetching system logs:', error);
        throw error;
    }
}

export async function exportSystemLogs(format: 'json' | 'txt' | 'csv', level?: 'info' | 'warn' | 'error', startDate?: string, endDate?: string): Promise<{ success: boolean; downloadUrl: string }> {
    const queryParams = new URLSearchParams();
    queryParams.append('format', format);
    if (level) queryParams.append('level', level);
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    try {
        return await _apiCall<{ success: boolean; downloadUrl: string }>(`/system/logs/export?${queryParams.toString()}`);
    } catch (error) {
        console.error('Error exporting system logs:', error);
        throw error;
    }
}

export async function getAIAgentStatus(agentId: string): Promise<{ id: string; status: 'active' | 'idle' | 'failed'; lastSeen: string; assignedTasks: number }> {
    try {
        return await _apiCall<{ id: string; status: 'active' | 'idle' | 'failed'; lastSeen: string; assignedTasks: number }>(`/agents/${agentId}/status`);
    } catch (error) {
        console.error(`Error fetching AI agent status for ${agentId}:`, error);
        throw error;
    }
}

export async function restartAIAgent(agentId: string): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/agents/${agentId}/restart`, { method: 'POST' });
    } catch (error) {
        console.error(`Error restarting AI agent ${agentId}:`, error);
        throw error;
    }
}

export async function deployAIAgent(agentConfig: object): Promise<{ success: boolean; agentId: string }> {
    try {
        return await _apiCall<{ success: boolean; agentId: string }>(`/admin/agents/deploy`, {
            method: 'POST',
            body: agentConfig,
        });
    } catch (error) {
        console.error('Error deploying AI agent:', error);
        throw error;
    }
}

export async function getQuantumNetworkHealth(): Promise<{ status: 'online' | 'degraded' | 'offline'; latencyMs: number; packetLoss: number; nodesActive: number }> {
    try {
        return await _apiCall<{ status: 'online' | 'degraded' | 'offline'; latencyMs: number; packetLoss: number; nodesActive: number }>(`/network/health`);
    } catch (error) {
        console.error('Error fetching quantum network health:', error);
        throw error;
    }
}

export async function diagnoseNetworkIssue(nodeId: string): Promise<{ success: boolean; diagnosticReport: string; issueFound: boolean }> {
    try {
        return await _apiCall<{ success: boolean; diagnosticReport: string; issueFound: boolean }>(`/network/${nodeId}/diagnose`, {
            method: 'POST',
        });
    } catch (error) {
        console.error(`Error diagnosing network issue for node ${nodeId}:`, error);
        throw error;
    }
}

export async function getSecurityAuditReport(reportId: string): Promise<any> {
    try {
        return await _apiCall<any>(`/security/audit-reports/${reportId}`);
    } catch (error) {
        console.error(`Error fetching security audit report ${reportId}:`, error);
        throw error;
    }
}

export async function triggerSecurityScan(target: string, scanType: 'vulnerability' | 'compliance' | 'penetration'): Promise<{ success: boolean; scanId: string }> {
    try {
        return await _apiCall<{ success: boolean; scanId: string }>(`/security/scans`, {
            method: 'POST',
            body: { target, scanType },
        });
    } catch (error) {
        console.error(`Error triggering security scan for target ${target}:`, error);
        throw error;
    }
}

export async function getSecurityScanStatus(scanId: string): Promise<{ status: string; progress: number; findings: string[] }> {
    try {
        return await _apiCall<{ status: string; progress: number; findings: string[] }>(`/security/scans/${scanId}/status`);
    } catch (error) {
        console.error(`Error getting security scan status for ${scanId}:`, error);
        throw error;
    }
}

export async function fetchCompliancePolicy(policyId: string): Promise<any> {
    try {
        return await _apiCall<any>(`/compliance/policies/${policyId}`);
    } catch (error) {
        console.error(`Error fetching compliance policy ${policyId}:`, error);
        throw error;
    }
}

export async function updateCompliancePolicy(policyId: string, policyDocument: object): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/compliance/policies/${policyId}`, {
            method: 'PUT',
            body: policyDocument,
        });
    } catch (error) {
        console.error(`Error updating compliance policy ${policyId}:`, error);
        throw error;
    }
}

export async function getResourceAllocation(resourceType: string): Promise<any> {
    try {
        return await _apiCall<any>(`/resources/${resourceType}/allocation`);
    } catch (error) {
        console.error(`Error fetching resource allocation for ${resourceType}:`, error);
        throw error;
    }
}

export async function optimizeResourceAllocation(resourceType: string, optimizationGoal: string): Promise<{ success: boolean; optimizationId: string; estimatedSavings: number }> {
    try {
        return await _apiCall<{ success: boolean; optimizationId: string; estimatedSavings: number }>(`/admin/resources/${resourceType}/optimize`, {
            method: 'POST',
            body: { optimizationGoal },
        });
    } catch (error) {
        console.error(`Error optimizing resource allocation for ${resourceType}:`, error);
        throw error;
    }
}

export async function fetchEnvironmentalImpactReport(reportId: string): Promise<any> {
    try {
        return await _apiCall<any>(`/sustainability/reports/${reportId}`);
    } catch (error) {
        console.error(`Error fetching environmental impact report ${reportId}:`, error);
        throw error;
    }
}

export async function calculateCarbonFootprint(scope: 'project' | 'organization' | 'data-center', period: 'daily' | 'monthly' | 'yearly'): Promise<{ success: boolean; footprintKgCO2e: number; details: object }> {
    try {
        return await _apiCall<{ success: boolean; footprintKgCO2e: number; details: object }>(`/sustainability/carbon-footprint`, {
            method: 'POST',
            body: { scope, period },
        });
    } catch (error) {
        console.error('Error calculating carbon footprint:', error);
        throw error;
    }
}

export async function getMarketTrendAnalysis(marketSegment: string, forecastHorizon: string): Promise<any> {
    try {
        return await _apiCall<any>(`/market-intelligence/trends?segment=${marketSegment}&horizon=${forecastHorizon}`);
    } catch (error) {
        console.error(`Error fetching market trend analysis for ${marketSegment}:`, error);
        throw error;
    }
}

export async function predictCustomerChurn(customerId: string): Promise<{ success: boolean; churnProbability: number; factors: string[] }> {
    try {
        return await _apiCall<{ success: boolean; churnProbability: number; factors: string[] }>(`/customer-intelligence/${customerId}/churn-prediction`);
    } catch (error) {
        console.error(`Error predicting customer churn for ${customerId}:`, error);
        throw error;
    }
}

export async function fetchCustomerSegmentDetails(segmentId: string): Promise<any> {
    try {
        return await _apiCall<any>(`/customer-intelligence/segments/${segmentId}`);
    } catch (error) {
        console.error(`Error fetching customer segment details for ${segmentId}:`, error);
        throw error;
    }
}

export async function generateNewTrainingDataset(parameters: object): Promise<{ success: boolean; datasetId: string; sizeGb: number }> {
    try {
        return await _apiCall<{ success: boolean; datasetId: string; sizeGb: number }>(`/admin/data/generate-dataset`, {
            method: 'POST',
            body: parameters,
        });
    } catch (error) {
        console.error('Error generating new training dataset:', error);
        throw error;
    }
}

export async function validateModelOutput(modelId: string, outputData: object): Promise<{ success: boolean; validationScore: number; discrepancies: object[] }> {
    try {
        return await _apiCall<{ success: boolean; validationScore: number; discrepancies: object[] }>(`/models/${modelId}/validate-output`, {
            method: 'POST',
            body: outputData,
        });
    } catch (error) {
        console.error(`Error validating model output for ${modelId}:`, error);
        throw error;
    }
}

export async function deployExperimentalFeature(featureName: string, rolloutPercentage: number, config: object): Promise<{ success: boolean; deploymentId: string }> {
    try {
        return await _apiCall<{ success: boolean; deploymentId: string }>(`/admin/features/experimental`, {
            method: 'POST',
            body: { featureName, rolloutPercentage, config },
        });
    } catch (error) {
        console.error(`Error deploying experimental feature ${featureName}:`, error);
        throw error;
    }
}

export async function monitorFeaturePerformance(deploymentId: string, durationHours: number): Promise<any> {
    try {
        return await _apiCall<any>(`/features/experimental/${deploymentId}/monitor?duration=${durationHours}`);
    } catch (error) {
        console.error(`Error monitoring feature performance for ${deploymentId}:`, error);
        throw error;
    }
}

export async function getAIEngineCapabilities(): Promise<any> {
    try {
        return await _apiCall<any>(`/engines/capabilities`);
    } catch (error) {
        console.error('Error fetching AI engine capabilities:', error);
        throw error;
    }
}

export async function updateAIEngineConfiguration(engineId: string, config: object): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/engines/${engineId}/config`, {
            method: 'PUT',
            body: config,
        });
    } catch (error) {
        console.error(`Error updating AI engine configuration for ${engineId}:`, error);
        throw error;
    }
}

export async function fetchAnomalyDetectionSettings(detectorId: string): Promise<any> {
    try {
        return await _apiCall<any>(`/anomaly-detection/${detectorId}/settings`);
    } catch (error) {
        console.error(`Error fetching anomaly detection settings for ${detectorId}:`, error);
        throw error;
    }
}

export async function updateAnomalyDetectionSettings(detectorId: string, settings: object): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/anomaly-detection/${detectorId}/settings`, {
            method: 'PUT',
            body: settings,
        });
    } catch (error) {
        console.error(`Error updating anomaly detection settings for ${detectorId}:`, error);
        throw error;
    }
}

export async function generateSyntheticData(schema: object, rowCount: number, constraints?: object): Promise<{ success: boolean; datasetId: string; generatedRows: number }> {
    try {
        return await _apiCall<{ success: boolean; datasetId: string; generatedRows: number }>(`/data/synthetic`, {
            method: 'POST',
            body: { schema, rowCount, constraints },
        });
    } catch (error) {
        console.error('Error generating synthetic data:', error);
        throw error;
    }
}

export async function getSyntheticDataGenerationStatus(jobId: string): Promise<{ status: string; progress: number; downloadUrl?: string; errors: string[] }> {
    try {
        return await _apiCall<{ status: string; progress: number; downloadUrl?: string; errors: string[] }>(`/data/synthetic/jobs/${jobId}/status`);
    } catch (error) {
        console.error(`Error getting synthetic data generation status for ${jobId}:`, error);
        throw error;
    }
}

export async function retrieveRawTelemetryData(sensorId: string, startTime: string, endTime: string): Promise<any[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('startTime', startTime);
    queryParams.append('endTime', endTime);
    try {
        return await _apiCall<any[]>(`/telemetry/${sensorId}/raw?${queryParams.toString()}`);
    } catch (error) {
        console.error(`Error retrieving raw telemetry data for sensor ${sensorId}:`, error);
        throw error;
    }
}

export async function processTelemetryData(sensorId: string, processingPipelineId: string, dataWindow: object): Promise<{ success: boolean; processedDataId: string }> {
    try {
        return await _apiCall<{ success: boolean; processedDataId: string }>(`/telemetry/${sensorId}/process`, {
            method: 'POST',
            body: { processingPipelineId, dataWindow },
        });
    } catch (error) {
        console.error(`Error processing telemetry data for sensor ${sensorId}:`, error);
        throw error;
    }
}

export async function fetchUserPreferencesCategory(userId: string, category: string): Promise<any> {
    try {
        return await _apiCall<any>(`/users/${userId}/preferences/${category}`);
    } catch (error) {
        console.error(`Error fetching user preferences for category ${category} for user ${userId}:`, error);
        throw error;
    }
}

export async function updateUserPreferencesCategory(userId: string, category: string, preferences: object): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/users/${userId}/preferences/${category}`, {
            method: 'PUT',
            body: preferences,
        });
    } catch (error) {
        console.error(`Error updating user preferences for category ${category} for user ${userId}:`, error);
        throw error;
    }
}

export async function getConfigurationHistory(configKey: string, limit: number = 10): Promise<any[]> {
    try {
        return await _apiCall<any[]>(`/admin/config/${configKey}/history?limit=${limit}`);
    } catch (error) {
        console.error(`Error fetching configuration history for ${configKey}:`, error);
        throw error;
    }
}

export async function rollbackConfiguration(configKey: string, versionId: string): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/config/${configKey}/rollback`, {
            method: 'POST',
            body: { versionId },
        });
    } catch (error) {
        console.error(`Error rolling back configuration for ${configKey} to version ${versionId}:`, error);
        throw error;
    }
}

export async function getFeatureToggleStatus(featureName: string): Promise<{ enabled: boolean; rolloutPercentage: number; lastUpdated: string }> {
    try {
        return await _apiCall<{ enabled: boolean; rolloutPercentage: number; lastUpdated: string }>(`/features/toggles/${featureName}/status`);
    } catch (error) {
        console.error(`Error fetching feature toggle status for ${featureName}:`, error);
        throw error;
    }
}

export async function updateFeatureToggle(featureName: string, enabled: boolean, rolloutPercentage: number): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/features/toggles/${featureName}`, {
            method: 'PUT',
            body: { enabled, rolloutPercentage },
        });
    } catch (error) {
        console.error(`Error updating feature toggle for ${featureName}:`, error);
        throw error;
    }
}

export async function getLicenseInformation(): Promise<{ key: string; expiryDate: string; features: string[]; status: 'active' | 'expired' | 'suspended' }> {
    try {
        return await _apiCall<{ key: string; expiryDate: string; features: string[]; status: 'active' | 'expired' | 'suspended' }>(`/system/license`);
    } catch (error) {
        console.error('Error fetching license information:', error);
        throw error;
    }
}

export async function renewLicense(newKey: string): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/system/license/renew`, {
            method: 'POST',
            body: { newKey },
        });
    } catch (error) {
        console.error('Error renewing license:', error);
        throw error;
    }
}

export async function getBillingDetails(accountId: string): Promise<any> {
    try {
        return await _apiCall<any>(`/billing/${accountId}/details`);
    } catch (error) {
        console.error(`Error fetching billing details for account ${accountId}:`, error);
        throw error;
    }
}

export async function updateBillingMethod(accountId: string, paymentMethodToken: string): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/billing/${accountId}/payment-method`, {
            method: 'PUT',
            body: { paymentMethodToken },
        });
    } catch (error) {
        console.error(`Error updating billing method for account ${accountId}:`, error);
        throw error;
    }
}

export async function getChatbotIntegrationStatus(integrationId: string): Promise<{ status: 'active' | 'inactive' | 'error'; lastSync: string }> {
    try {
        return await _apiCall<{ status: 'active' | 'inactive' | 'error'; lastSync: string }>(`/integrations/chatbot/${integrationId}/status`);
    } catch (error) {
        console.error(`Error fetching chatbot integration status for ${integrationId}:`, error);
        throw error;
    }
}

export async function deactivateChatbotIntegration(integrationId: string): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/integrations/chatbot/${integrationId}/deactivate`, {
            method: 'POST',
        });
    } catch (error) {
        console.error(`Error deactivating chatbot integration ${integrationId}:`, error);
        throw error;
    }
}

export async function provisionNewEnvironment(environmentName: string, configTemplateId: string): Promise<{ success: boolean; environmentId: string }> {
    try {
        return await _apiCall<{ success: boolean; environmentId: string }>(`/admin/environments/provision`, {
            method: 'POST',
            body: { environmentName, configTemplateId },
        });
    } catch (error) {
        console.error(`Error provisioning new environment ${environmentName}:`, error);
        throw error;
    }
}

export async function destroyEnvironment(environmentId: string, force: boolean = false): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/environments/${environmentId}/destroy`, {
            method: 'POST',
            body: { force },
        });
    } catch (error) {
    console.error(`Error destroying environment ${environmentId}:`, error);
        throw error;
    }
}

export async function defineDataSchema(schemaName: string, schema: ComplexDataSchema): Promise<{ success: boolean; schemaId: string }> {
    try {
        return await _apiCall<{ success: boolean; schemaId: string }>(`/admin/data-schemas`, {
            method: 'POST',
            body: { schemaName, schema },
        });
    } catch (error) {
        console.error(`Error defining data schema ${schemaName}:`, error);
        throw error;
    }
}

export async function updateDataSchema(schemaId: string, schema: ComplexDataSchema): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/data-schemas/${schemaId}`, {
            method: 'PUT',
            body: schema,
        });
    } catch (error) {
        console.error(`Error updating data schema ${schemaId}:`, error);
        throw error;
    }
}

export async function deployProcessingPipeline(pipelineName: string, config: AdvancedProcessingConfig): Promise<{ success: boolean; pipelineId: string }> {
    try {
        return await _apiCall<{ success: boolean; pipelineId: string }>(`/admin/processing-pipelines`, {
            method: 'POST',
            body: { pipelineName, config },
        });
    } catch (error) {
        console.error(`Error deploying processing pipeline ${pipelineName}:`, error);
        throw error;
    }
}

export async function executeDistributedTask(task: DistributedTaskDefinition): Promise<{ success: boolean; jobId: string }> {
    try {
        return await _apiCall<{ success: boolean; jobId: string }>(`/admin/tasks/execute-distributed`, {
            method: 'POST',
            body: task,
        });
    } catch (error) {
        console.error(`Error executing distributed task ${task.taskId}:`, error);
        throw error;
    }
}

export async function getMetricDashboardConfig(dashboardId: string): Promise<any> {
    try {
        return await _apiCall<any>(`/metrics/dashboards/${dashboardId}/config`);
    } catch (error) {
        console.error(`Error fetching metric dashboard config for ${dashboardId}:`, error);
        throw error;
    }
}

export async function saveMetricDashboardConfig(dashboardId: string, config: object): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/metrics/dashboards/${dashboardId}/config`, {
            method: 'PUT',
            body: config,
        });
    } catch (error) {
        console.error(`Error saving metric dashboard config for ${dashboardId}:`, error);
        throw error;
    }
}

export async function fetchAlertRules(ruleType: string): Promise<any[]> {
    try {
        return await _apiCall<any[]>(`/alerts/rules?type=${ruleType}`);
    } catch (error) {
        console.error(`Error fetching alert rules of type ${ruleType}:`, error);
        throw error;
    }
}

export async function createAlertRule(ruleDefinition: object): Promise<{ success: boolean; ruleId: string }> {
    try {
        return await _apiCall<{ success: boolean; ruleId: string }>(`/admin/alerts/rules`, {
            method: 'POST',
            body: ruleDefinition,
        });
    } catch (error) {
        console.error('Error creating alert rule:', error);
        throw error;
    }
}

export async function deleteAlertRule(ruleId: string): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/alerts/rules/${ruleId}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error(`Error deleting alert rule ${ruleId}:`, error);
        throw error;
    }
}

export async function acknowledgeAlert(alertId: string, userId: string, notes?: string): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/alerts/${alertId}/acknowledge`, {
            method: 'POST',
            body: { userId, notes },
        });
    } catch (error) {
        console.error(`Error acknowledging alert ${alertId}:`, error);
        throw error;
    }
}

export async function resolveAlert(alertId: string, resolutionDetails: object): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/alerts/${alertId}/resolve`, {
            method: 'POST',
            body: resolutionDetails,
        });
    } catch (error) {
        console.error(`Error resolving alert ${alertId}:`, error);
        throw error;
    }
}

export async function fetchWebhookConfigurations(eventType: string): Promise<any[]> {
    try {
        return await _apiCall<any[]>(`/webhooks/configs?eventType=${eventType}`);
    } catch (error) {
        console.error(`Error fetching webhook configurations for event type ${eventType}:`, error);
        throw error;
    }
}

export async function createWebhookConfiguration(config: object): Promise<{ success: boolean; configId: string }> {
    try {
        return await _apiCall<{ success: boolean; configId: string }>(`/admin/webhooks/configs`, {
            method: 'POST',
            body: config,
        });
    } catch (error) {
        console.error('Error creating webhook configuration:', error);
        throw error;
    }
}

export async function updateWebhookConfiguration(configId: string, config: object): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/webhooks/configs/${configId}`, {
            method: 'PUT',
            body: config,
        });
    } catch (error) {
        console.error(`Error updating webhook configuration ${configId}:`, error);
        throw error;
    }
}

export async function deleteWebhookConfiguration(configId: string): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/webhooks/configs/${configId}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error(`Error deleting webhook configuration ${configId}:`, error);
        throw error;
    }
}

export async function getIntegrationStatus(integrationId: string): Promise<{ status: 'connected' | 'disconnected' | 'error'; lastChecked: string; errorMessage?: string }> {
    try {
        return await _apiCall<{ status: 'connected' | 'disconnected' | 'error'; lastChecked: string; errorMessage?: string }>(`/integrations/${integrationId}/status`);
    } catch (error) {
        console.error(`Error fetching integration status for ${integrationId}:`, error);
        throw error;
    }
}

export async function reconnectIntegration(integrationId: string): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/integrations/${integrationId}/reconnect`, {
            method: 'POST',
        });
    } catch (error) {
        console.error(`Error reconnecting integration ${integrationId}:`, error);
        throw error;
    }
}

export async function deactivateIntegration(integrationId: string): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/integrations/${integrationId}/deactivate`, {
            method: 'POST',
        });
    } catch (error) {
        console.error(`Error deactivating integration ${integrationId}:`, error);
        throw error;
    }
}

export async function provisionNewIntegration(integrationType: string, config: object): Promise<{ success: boolean; integrationId: string }> {
    try {
        return await _apiCall<{ success: boolean; integrationId: string }>(`/admin/integrations/provision`, {
            method: 'POST',
            body: { integrationType, config },
        });
    } catch (error) {
        console.error(`Error provisioning new integration of type ${integrationType}:`, error);
        throw error;
    }
}

export async function getAuditTrailForEntity(entityType: string, entityId: string, limit: number = 50): Promise<any[]> {
    try {
        return await _apiCall<any[]>(`/audit-trail/${entityType}/${entityId}?limit=${limit}`);
    } catch (error) {
        console.error(`Error fetching audit trail for ${entityType} ${entityId}:`, error);
        throw error;
    }
}

export async function getLicenseFeatureUsage(featureName: string, period: 'daily' | 'monthly' | 'yearly'): Promise<any> {
    try {
        return await _apiCall<any>(`/license/feature-usage/${featureName}?period=${period}`);
    } catch (error) {
        console.error(`Error fetching license feature usage for ${featureName} over ${period}:`, error);
        throw error;
    }
}

export async function getRoleBasedAccessConfiguration(roleId: string): Promise<any> {
    try {
        return await _apiCall<any>(`/admin/rbac/roles/${roleId}/config`);
    } catch (error) {
        console.error(`Error fetching RBAC configuration for role ${roleId}:`, error);
        throw error;
    }
}

export async function updateRoleBasedAccessConfiguration(roleId: string, config: object): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/rbac/roles/${roleId}/config`, {
            method: 'PUT',
            body: config,
        });
    } catch (error) {
        console.error(`Error updating RBAC configuration for role ${roleId}:`, error);
        throw error;
    }
}

export async function createCustomMetric(metricDefinition: object): Promise<{ success: boolean; metricId: string }> {
    try {
        return await _apiCall<{ success: boolean; metricId: string }>(`/admin/metrics/custom`, {
            method: 'POST',
            body: metricDefinition,
        });
    } catch (error) {
        console.error('Error creating custom metric:', error);
        throw error;
    }
}

export async function deleteCustomMetric(metricId: string): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/metrics/custom/${metricId}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error(`Error deleting custom metric ${metricId}:`, error);
        throw error;
    }
}

export async function getRealtimeDashboardData(dashboardId: string, timeRangeSeconds: number): Promise<any> {
    try {
        return await _apiCall<any>(`/realtime/dashboards/${dashboardId}/data?range=${timeRangeSeconds}`);
    } catch (error) {
        console.error(`Error fetching real-time dashboard data for ${dashboardId}:`, error);
        throw error;
    }
}

export async function subscribeToRealtimeUpdates(dashboardId: string, callbackUrl: string): Promise<{ success: boolean; subscriptionId: string }> {
    try {
        return await _apiCall<{ success: boolean; subscriptionId: string }>(`/realtime/dashboards/${dashboardId}/subscribe`, {
            method: 'POST',
            body: { callbackUrl },
        });
    } catch (error) {
        console.error(`Error subscribing to real-time updates for dashboard ${dashboardId}:`, error);
        throw error;
    }
}

export async function unsubscribeFromRealtimeUpdates(subscriptionId: string): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/realtime/subscriptions/${subscriptionId}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error(`Error unsubscribing from real-time updates with ID ${subscriptionId}:`, error);
        throw error;
    }
}