```typescript
/**
 * aiService.ts
 * This module provides a comprehensive suite of interfaces and API client functions
 * for interacting with the core AI system. It enables sophisticated agentic AI workflows,
 * intelligent insight generation, real-time analytics, model governance, and robust
 * system administration.
 *
 * Business Value: This service is the central nervous system for data-driven operations,
 * empowering enterprises to transform raw data into actionable intelligence at speed and scale.
 * It underpins critical decision-making processes, automates complex analytical tasks,
 * significantly reduces operational costs through predictive maintenance and anomaly detection,
 * and unlocks new revenue streams by identifying market opportunities and optimizing customer experiences.
 * The robust governance and observability features ensure regulatory compliance and maintain
 * competitive advantage through secure, transparent, and high-performing AI deployments.
 */
export type Urgency = 'low' | 'medium' | 'high' | 'critical' | 'informational';
export type InsightType = 'general' | 'predictive' | 'actionable' | 'correlation' | 'anomaly' | 'sentiment' | 'geospatial' | 'multimedia' | 'risk' | 'opportunity' | 'efficiency' | 'compliance' | 'market' | 'customer' | 'security' | 'ethical' | 'resource' | 'sustainability' | 'trend' | 'forecasting' | 'optimization' | 'recommendation' | 'reconciliation' | 'fraud_detection';
export type ActionPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ActionStatus = 'pending' | 'in-progress' | 'completed' | 'deferred' | 'failed' | 'cancelled';
export type PredictionTrend = 'up' | 'down' | 'stable' | 'volatile';
export type VisualizationType = 'chart' | 'map' | 'graph' | 'table' | 'gauge' | 'text';
export type InsightStatus = 'active' | 'archived' | 'dismissed' | 'resolved' | 'under_review' | 'false_positive';
export type ExplanationLevel = 'none' | 'basic' | 'detailed' | 'causal' | 'counterfactual';
export type AISystemStatus = 'operational' | 'degraded' | 'offline' | 'maintenance' | 'alert';
export type AgentStatus = 'active' | 'idle' | 'failed' | 'paused' | 'restarting';
export type SkillType = 'monitoring' | 'anomaly_detection' | 'remediation' | 'reconciliation' | 'decision_making' | 'reporting' | 'communication';
export type RoleType = 'admin' | 'operator' | 'analyst' | 'viewer' | 'agent_manager';
export type AuthScope = 'read' | 'write' | 'execute' | 'admin';

export interface RelatedEntity {
    type: string;
    id: string;
    name: string;
    metadata?: Record<string, any>;
}

export interface RecommendedAction {
    id: string;
    description: string;
    priority: ActionPriority;
    status: ActionStatus;
    assignedTo?: string; // User ID or Agent ID
    dueDate?: string;
    notes?: string;
    automationScriptId?: string; // Reference to an automated script for remediation
}

export interface Prediction {
    target: string;
    value: number;
    confidence: number;
    trend: PredictionTrend;
    predictionInterval?: [number, number]; // [lowerBound, upperBound]
    modelUsed?: string;
}

export interface Visualization {
    type: VisualizationType;
    data: any;
    options?: any;
    title?: string;
    description?: string;
}

export interface EthicalConsideration {
    aspect: string;
    score: number; // e.g., 0-10, 0 being no concern, 10 being critical
    details: string;
    mitigationSuggestions?: string[];
}

export interface UserFeedback {
    rating: number; // e.g., 1-5 stars
    comment: string;
    timestamp: string;
    userId?: string; // ID of the user who provided feedback
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
    impactScore?: number; // Quantifiable impact score (e.g., monetary value, risk reduction percentage)
    generatedByAgentId?: string; // ID of the agent that generated this insight
    correlationId?: string; // To link insights belonging to a larger event or workflow
    auditLogId?: string; // Reference to the audit log entry for this insight's generation
}

export interface AIInsightsPreferences {
    insightTypes: InsightType[];
    urgencyThreshold: Urgency;
    dataSources: string[];
    realtimeUpdates: boolean;
    explanationLevel: ExplanationLevel;
    modelSelection: string;
    notificationChannels?: string[]; // e.g., 'email', 'slack', 'webhook'
    preferredTimezone?: string;
}

export interface AIModel {
    id: string;
    name: string;
    version: string;
    description: string;
    status: 'active' | 'retired' | 'training' | 'error';
    deploymentDate?: string;
    accuracyMetrics?: { [key: string]: number };
    inputSchemaId?: string;
    outputSchemaId?: string;
}

export interface ModelAccuracyHistoryEntry {
    timestamp: string;
    accuracy: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    loss?: number;
}

export interface ResourceUtilization {
    cpu: number; // percentage
    memory: number; // percentage
    gpu?: number; // percentage
    network?: number; // Mbps
    diskIO?: number; // MB/s
    timestamp: string;
}

export interface AIPerformanceMetrics {
    aiSystemStatus: AISystemStatus;
    lastHeartbeat: string;
    insightGenerationRate: number; // insights per minute
    averageResponseTime: number; // ms
    dataProcessingVolume: number; // GB/hour
    modelAccuracyHistory: ModelAccuracyHistoryEntry[];
    resourceUtilization: ResourceUtilization[]; // Array to show historical utilization
    activeSessions: number;
    errorRate: number; // errors per 1000 operations
    uptimePercentage: number;
    agentCount: {
        active: number;
        idle: number;
        failed: number;
    };
    queueDepths: { [queueName: string]: number };
}

export interface InsightQueryResponse {
    query: string;
    results: string[]; // Natural language responses or summaries
    sourceModel: string;
    responseTimeMs: number;
    confidenceScore: number;
    relatedInsights?: ExtendedAIInsight[];
    suggestedActions?: RecommendedAction[];
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
    tags?: string[];
    generatedByAgentId?: string;
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
    role: string; // Maps to RBAC roles
    avatar?: string;
    isActive: boolean;
    lastLogin?: string;
    organizationId?: string;
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
        description?: string;
        isPersonallyIdentifiable?: boolean;
        encryptionRequired?: boolean;
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
        type: 'btree' | 'hash' | 'fulltext';
    }>;
    createdAt?: string;
    updatedAt?: string;
}

export interface AdvancedProcessingConfig {
    pipelineId: string;
    name: string;
    description?: string;
    steps: Array<{
        stepId: string;
        processorType: 'filter' | 'transform' | 'aggregate' | 'enrich' | 'validate' | 'ai_model_inference' | 'data_masking' | 'schema_mapping';
        parameters: { [key: string]: any };
        outputSchemaId?: string;
        errorHandlingStrategy?: 'skip' | 'retry' | 'fail' | 'dead_letter_queue';
        retryAttempts?: number;
        timeoutMs?: number;
    }>;
    eventTriggers?: Array<{
        eventType: 'data_arrival' | 'schedule_based' | 'api_call' | 'manual';
        config: object;
        enabled: boolean;
    }>;
    notifications?: Array<{
        alertType: 'email' | 'slack' | 'webhook' | 'pagerduty';
        onEvent: 'success' | 'failure' | 'completion' | 'warning';
        recipients: string[];
        templateId?: string;
    }>;
    version?: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
}

export interface DistributedTaskDefinition {
    taskId: string;
    taskType: 'data_ingestion' | 'model_training' | 'report_generation' | 'complex_query_execution' | 'agent_action_execution' | 'data_reconciliation' | 'security_scan';
    payload: object; // Task-specific data
    priority: number; // 1 (highest) to N (lowest)
    workerGroup: string; // Target worker group/pool
    maxRetries: number;
    timeoutSeconds: number;
    callbackUrl?: string; // URL to notify upon completion/failure
    dependencies?: string[]; // Other task IDs this task depends on
    scheduledCron?: string; // Cron expression for scheduled tasks
    resourceRequirements?: {
        cpuCores?: number;
        memoryGb?: number;
        gpuUnits?: number;
        estimatedDurationSeconds?: number;
    };
    securityContext?: {
        accessRoles: string[]; // Roles required to execute this task
        encryptionEnabled: boolean;
        dataClassification?: string; // e.g., 'confidential', 'public'
    };
    idempotencyKey?: string; // For ensuring tasks are executed once
    createdAt?: string;
    createdBy?: string;
}

export interface AgentSkill {
    id: string;
    name: string;
    description: string;
    type: SkillType;
    endpoint: string; // Internal API endpoint for the skill
    parametersSchema: ComplexDataSchema; // JSON schema for skill parameters
    outputSchema: ComplexDataSchema; // JSON schema for skill output
    requiredRoles?: string[]; // Roles required to execute this skill
    isEnabled: boolean;
    version?: string;
}

export interface AgentConfiguration {
    agentId: string;
    name: string;
    description: string;
    status: AgentStatus;
    assignedSkills: string[]; // List of AgentSkill IDs
    preferences: AIInsightsPreferences; // Specific preferences for this agent's insights
    communicationChannels: string[]; // e.g., 'internal_queue', 'email', 'slack'
    governancePolicies: string[]; // References to policy IDs
    resourceLimits?: ResourceUtilization;
    scheduleCron?: string; // For agents that run on a schedule
    createdBy?: string;
    createdAt?: string;
    lastModified?: string;
}

export interface AgentMessage {
    id: string;
    senderId: string; // Agent ID or System
    recipientId: string; // Agent ID or System
    messageType: 'insight' | 'action_request' | 'status_update' | 'skill_invocation' | 'error' | 'governance_alert';
    payload: any; // Content of the message
    timestamp: string;
    readStatus: 'unread' | 'read' | 'processed';
    correlationId?: string; // To link messages in a conversation or workflow
    priority?: number; // For message queue prioritization
}

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    actorId: string; // User ID or Agent ID
    actorType: 'user' | 'agent' | 'system';
    eventType: string; // e.g., 'INSIGHT_DISMISSED', 'MODEL_DEPLOYED', 'AGENT_TASK_EXECUTED'
    entityType: string; // e.g., 'Insight', 'Model', 'Agent', 'User'
    entityId: string;
    details: object; // JSON object with event-specific details
    ipAddress?: string;
    clientId?: string;
    // For tamper-evident logs
    previousHash?: string;
    currentHash?: string;
}

export interface RBACRole {
    id: string;
    name: string;
    description: string;
    permissions: Array<{
        resource: string; // e.g., 'insights', 'models', 'agents', 'users'
        actions: AuthScope[]; // e.g., ['read', 'write', 'delete']
    }>;
    inheritsRoles?: string[]; // Inherit permissions from other roles
}

export interface TokenAccount {
    accountId: string;
    ownerId: string; // User ID or Agent ID
    balance: number;
    currency: string; // e.g., 'USD_STABLE'
    createdAt: string;
    updatedAt: string;
    status: 'active' | 'suspended' | 'closed';
    ledgerEntries?: TokenLedgerEntry[]; // For detailed transaction history
}

export interface TokenLedgerEntry {
    entryId: string;
    accountId: string;
    transactionId: string;
    amount: number;
    type: 'credit' | 'debit' | 'mint' | 'burn';
    timestamp: string;
    balanceBefore: number;
    balanceAfter: number;
    notes?: string;
}

export interface TokenTransaction {
    transactionId: string;
    senderAccountId: string;
    recipientAccountId: string;
    amount: number;
    currency: string;
    timestamp: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    idempotencyKey: string;
    signature: string; // Cryptographic signature of the transaction details
    railUsed: string; // e.g., 'rail_fast', 'rail_batch'
    metadata?: object;
    settlementDetails?: {
        settlementTimestamp: string;
        networkFee: number;
        exchangeRate?: number;
    };
    rulesApplied?: string[]; // List of rule IDs from the rule engine
}

export interface RuleEnginePolicy {
    policyId: string;
    name: string;
    description: string;
    rules: Array<{
        ruleId: string;
        condition: string; // e.g., 'transaction.amount > 1000' (DSL or expression)
        action: 'allow' | 'deny' | 'flag' | 'route_to_rail' | 'invoke_agent';
        actionParams?: object;
        priority: number;
        isEnabled: boolean;
    }>;
    targetEntities: 'transactions' | 'payments' | 'agents' | 'insights';
    version: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaymentRequest {
    paymentId: string;
    senderId: string; // Originator (User/Agent)
    recipientId: string; // Target (User/Agent)
    amount: number;
    currency: string;
    requestedAt: string;
    status: 'initiated' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'pending_fraud_review';
    metadata?: object;
    idempotencyKey: string;
    callbackUrl?: string;
    priority?: 'low' | 'normal' | 'high' | 'critical';
    riskScore?: number;
    fraudFlags?: string[];
    suggestedRail?: string; // AI-suggested rail
}

const AI_API_BASE_URL: string = 'https://api.quantumsense.io/v1/ai';
const AUTH_TOKEN_STORAGE_KEY: string = 'ai_auth_token';
const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
};

/**
 * Retrieves the authorization headers from local storage.
 * This function ensures that all API calls are authenticated using a Bearer token,
 * providing a layer of security by requiring valid credentials for access to AI services.
 * @returns {Record<string, string>} An object containing the Authorization header if a token is present.
 */
const getAuthHeaders = (): Record<string, string> => {
    // In a real production environment, this token would be managed more securely,
    // potentially using HTTP-only cookies, Web Workers, or a secure token exchange mechanism.
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
};

interface ApiCallOptions {
    method?: string;
    body?: object;
    headers?: Record<string, string>;
    signal?: AbortSignal;
    retries?: number;
    backoffMs?: number;
}

/**
 * Executes a standard API call to the AI service.
 * This is the fundamental function for all client-side interactions with the AI backend,
 * handling request construction, authentication, response parsing, and error management.
 * It includes basic retry logic for transient network issues, enhancing system resilience.
 * @template T The expected type of the API response.
 * @param {string} endpoint The API endpoint path (e.g., '/insights').
 * @param {ApiCallOptions} options Configuration for the API call including method, body, headers, and signal.
 * @returns {Promise<T>} A promise that resolves with the parsed JSON response.
 * @throws {Error} If the API call fails or returns a non-OK status.
 */
async function _apiCall<T>(endpoint: string, options: ApiCallOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {}, signal, retries = 3, backoffMs = 1000 } = options;
    const url = `${AI_API_BASE_URL}${endpoint}`;

    for (let i = 0; i <= retries; i++) {
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
                // If it's a server error and not the last retry, attempt a retry
                if (response.status >= 500 && i < retries) {
                    await new Promise(resolve => setTimeout(resolve, backoffMs * (2 ** i)));
                    continue;
                }
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(`API Error: ${response.status} - ${errorData.message || 'Unknown error'} for ${url}`);
            }

            return await response.json() as T;
        } catch (error) {
            if (i < retries && (error instanceof TypeError || (error instanceof Error && (error.message.includes('Failed to fetch') || error.message.includes('Network request failed'))))) {
                // Network error, attempt retry
                await new Promise(resolve => setTimeout(resolve, backoffMs * (2 ** i)));
                continue;
            }
            console.error(`Failed to call API at ${url} after ${i + 1} attempts:`, error);
            throw error;
        }
    }
    // Should not reach here if retries > 0, but as a fallback
    throw new Error(`Failed to call API at ${url} after ${retries + 1} attempts.`);
}

/**
 * Executes a multipart API call, typically used for file uploads.
 * This function supports scenarios where data (like files) needs to be sent
 * in a `FormData` format, bypassing the default `application/json` content type.
 * @template T The expected type of the API response.
 * @param {string} endpoint The API endpoint path.
 * @param {FormData} formData The FormData object containing files and other data.
 * @param {Record<string, string>} headers Additional headers for the request.
 * @returns {Promise<T>} A promise that resolves with the parsed JSON response.
 * @throws {Error} If the API call fails or returns a non-OK status.
 */
async function _apiCallMultipart<T>(endpoint: string, formData: FormData, headers: Record<string, string> = {}): Promise<T> {
    const url = `${AI_API_BASE_URL}${endpoint}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                // Note: 'Content-Type': 'multipart/form-data' is typically set automatically by the browser
                // when a FormData object is used as the body, including the correct boundary.
                ...getAuthHeaders(),
                ...headers,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`API Error: ${response.status} - ${errorData.message || 'Unknown error'} for ${url}`);
        }
        return await response.json() as T;
    } catch (error) {
        console.error(`Failed to call multipart API at ${url}:`, error);
        throw error;
    }
}

/**
 * Fetches current AI-generated insights, providing a real-time view of critical events and opportunities.
 * Business Value: Enables immediate operational awareness, allowing users to react swiftly to emerging situations
 * detected by the AI system, from security threats to market shifts.
 * @param {number} limit The maximum number of insights to retrieve.
 * @param {number} offset The starting offset for pagination.
 * @returns {Promise<ExtendedAIInsight[]>} A promise resolving to an array of AI insights.
 */
export async function fetchCurrentAIInsights(limit: number = 20, offset: number = 0): Promise<ExtendedAIInsight[]> {
    try {
        return await _apiCall<ExtendedAIInsight[]>(`/insights?limit=${limit}&offset=${offset}`);
    } catch (error) {
        console.error('Error fetching current insights:', error);
        throw error;
    }
}

/**
 * Dismisses a specific AI insight, indicating it's no longer relevant or has been handled.
 * Business Value: Improves the signal-to-noise ratio for human operators, ensuring they focus
 * only on actionable and unresolved insights, increasing operational efficiency.
 * @param {string} insightId The unique identifier of the insight to dismiss.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the operation.
 */
export async function dismissInsight(insightId: string): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/insights/${insightId}/dismiss`, { method: 'POST' });
    } catch (error) {
        console.error(`Error dismissing insight ${insightId}:`, error);
        throw error;
    }
}

/**
 * Marks a recommended action associated with an AI insight as completed.
 * Business Value: Provides traceability and accountability for actions taken based on AI recommendations,
 * allowing for auditing and performance measurement of the human-AI collaboration loop.
 * @param {string} insightId The unique identifier of the parent insight.
 * @param {string} actionId The unique identifier of the action to mark as completed.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the operation.
 */
export async function markInsightAsActioned(insightId: string, actionId: string): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/insights/${insightId}/actions/${actionId}/complete`, { method: 'PUT' });
    } catch (error) {
        console.error(`Error marking action ${actionId} for insight ${insightId} as actioned:`, error);
        throw error;
    }
}

/**
 * Submits user feedback for a specific AI insight.
 * Business Value: Essential for continuous improvement of AI models and insight generation.
 * User feedback directly informs model retraining and refinement, enhancing accuracy and relevance over time.
 * @param {string} insightId The unique identifier of the insight receiving feedback.
 * @param {number} rating A numerical rating (e.g., 1-5).
 * @param {string} comment A textual comment from the user.
 * @returns {Promise<{ success: boolean; feedbackId: string }>} A promise indicating the success and providing a feedback ID.
 */
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

/**
 * Submits a natural language query to the AI system for interpretation and response.
 * Business Value: Empowers users to interact with complex data through intuitive natural language,
 * significantly lowering the barrier to entry for data exploration and accelerating insight discovery.
 * @param {string} query The natural language query.
 * @param {string} [conversationId] Optional ID to maintain conversational context.
 * @returns {Promise<InsightQueryResponse>} A promise resolving to the AI's response, including results and confidence.
 */
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

/**
 * Fetches user-specific preferences for AI insights.
 * Business Value: Personalizes the AI experience for each user, ensuring they receive
 * insights tailored to their role, interests, and urgency thresholds, maximizing relevance and user engagement.
 * @param {string} userId The unique identifier of the user.
 * @returns {Promise<AIInsightsPreferences>} A promise resolving to the user's AI insight preferences.
 */
export async function fetchAIPreferences(userId: string): Promise<AIInsightsPreferences> {
    try {
        return await _apiCall<AIInsightsPreferences>(`/users/${userId}/preferences/ai`);
    } catch (error) {
        console.error(`Error fetching AI preferences for user ${userId}:`, error);
        throw error;
    }
}

/**
 * Updates user-specific preferences for AI insights.
 * Business Value: Allows users to dynamically adapt their AI feed and notification settings,
 * maintaining control and focus in a rapidly evolving data environment.
 * @param {string} userId The unique identifier of the user.
 * @param {AIInsightsPreferences} preferences The updated preferences object.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the update.
 */
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

/**
 * Fetches the list of all available insight types supported by the system.
 * Business Value: Provides transparency into the AI's capabilities and helps users
 * configure their preferences or filter insights effectively.
 * @returns {Promise<InsightType[]>} A promise resolving to an array of available insight types.
 */
export async function fetchAvailableInsightTypes(): Promise<InsightType[]> {
    try {
        return await _apiCall<InsightType[]>(`/config/insight-types`);
    } catch (error) {
        console.error('Error fetching available insight types:', error);
        throw error;
    }
}

/**
 * Fetches the list of all available data sources integrated with the AI system.
 * Business Value: Informs users about the breadth of data being analyzed by the AI,
 * facilitating data governance and trust in the insights generated.
 * @returns {Promise<string[]>} A promise resolving to an array of available data source names.
 */
export async function fetchAvailableDataSources(): Promise<string[]> {
    try {
        return await _apiCall<string[]>(`/config/data-sources`);
    } catch (error) {
        console.error('Error fetching available data sources:', error);
        throw error;
    }
}

/**
 * Fetches details of all AI models deployed in the system.
 * Business Value: Provides critical visibility into the AI model landscape,
 * essential for model governance, compliance, and understanding the intelligence
 * backing the system's decisions and insights.
 * @returns {Promise<AIModel[]>} A promise resolving to an array of AI model objects.
 */
export async function fetchAvailableAIModels(): Promise<AIModel[]> {
    try {
        return await _apiCall<AIModel[]>(`/config/ai-models`);
    } catch (error) {
        console.error('Error fetching available AI models:', error);
        throw error;
    }
}

/**
 * Fetches real-time performance metrics and operational status of the entire AI system.
 * Business Value: Offers comprehensive observability into the AI infrastructure,
 * enabling proactive monitoring, performance optimization, and rapid incident response,
 * ensuring high availability and reliability of critical AI services.
 * @returns {Promise<AIPerformanceMetrics>} A promise resolving to an object containing AI system performance metrics.
 */
export async function fetchAISystemMetrics(): Promise<AIPerformanceMetrics> {
    try {
        return await _apiCall<AIPerformanceMetrics>(`/system/metrics`);
    } catch (error) {
        console.error('Error fetching AI system metrics:', error);
        throw error;
    }
}

/**
 * Fetches the current health status of the AI system.
 * Business Value: Provides a quick, high-level indicator of system well-being,
 * crucial for immediate status checks and dashboards, ensuring the AI is operational
 * and performing as expected.
 * @returns {Promise<{ status: AISystemStatus; details: string; lastUpdate: string }>} A promise resolving to the AI system's health status.
 */
export async function fetchAIHealthStatus(): Promise<{ status: AISystemStatus; details: string; lastUpdate: string }> {
    try {
        return await _apiCall<{ status: AISystemStatus; details: string; lastUpdate: string }>(`/system/health`);
    } catch (error) {
        console.error('Error fetching AI system health status:', error);
        throw error;
    }
}

/**
 * Fetches historical AI insights based on specified filters, enabling forensic analysis and trend identification.
 * Business Value: Supports compliance, auditing, and root cause analysis by providing access to past insights.
 * It also allows for the identification of long-term trends and patterns missed in real-time.
 * @param {HistoricalInsightFilters} filters An object containing various criteria to filter historical insights.
 * @returns {Promise<HistoricalInsightsResponse>} A promise resolving to a paginated response of historical insights.
 */
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
    if (filters.tags && filters.tags.length > 0) queryParams.append('tags', filters.tags.join(','));
    if (filters.generatedByAgentId) queryParams.append('generatedByAgentId', filters.generatedByAgentId);

    try {
        return await _apiCall<HistoricalInsightsResponse>(`/insights/history?${queryParams.toString()}`);
    } catch (error) {
        console.error('Error fetching historical insights:', error);
        throw error;
    }
}

/**
 * Adds a comment to a specific AI insight, facilitating human collaboration and context enrichment.
 * Business Value: Enhances collaborative intelligence by allowing human operators to add context,
 * notes, or follow-up actions directly to insights, improving shared understanding and decision-making.
 * @param {string} insightId The unique identifier of the insight.
 * @param {string} userId The unique identifier of the user adding the comment.
 * @param {string} comment The text of the comment.
 * @returns {Promise<{ success: boolean; commentId: string }>} A promise indicating the success and providing a comment ID.
 */
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

/**
 * Assigns an AI insight to a specific user for follow-up or resolution.
 * Business Value: Streamlines workflow management by explicitly assigning responsibility
 * for insights, ensuring proper human oversight and timely action on critical AI detections.
 * @param {string} insightId The unique identifier of the insight.
 * @param {string} userId The unique identifier of the user to assign the insight to.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the assignment.
 */
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

/**
 * Fetches a list of users suitable for collaboration or assignment tasks.
 * Business Value: Facilitates seamless team collaboration and task delegation
 * within the AI-driven workflow, enabling efficient incident response and project management.
 * @param {string} [roleFilter] Optional filter to retrieve users by a specific role.
 * @returns {Promise<User[]>} A promise resolving to an array of user objects.
 */
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

/**
 * Registers a new external data source for insight generation.
 * Business Value: Expands the reach of the AI system by integrating new data streams,
 * enabling a more holistic view of operations and opening possibilities for new types of insights
 * and competitive advantages.
 * @param {string} sourceName The name of the new insight source.
 * @param {string} description A description of the source.
 * @param {object} integrationConfig Configuration details for integrating with the source.
 * @returns {Promise<{ success: boolean; sourceId: string }>} A promise indicating success and providing the new source ID.
 */
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

/**
 * Updates the configuration of an existing AI model.
 * Business Value: Provides granular control over AI model behavior, allowing administrators
 * to fine-tune parameters, improve performance, and adapt models to changing business requirements
 * or data characteristics without full redeployment.
 * @param {string} modelId The unique identifier of the model.
 * @param {object} configUpdates An object containing the configuration changes.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the update.
 */
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

/**
 * Deploys a new version of an AI model to production.
 * Business Value: Enables agile AI model lifecycle management, allowing for rapid
 * deployment of improved models and continuous delivery of enhanced AI capabilities,
 * directly impacting business performance and competitive edge.
 * @param {string} modelId The unique identifier of the model.
 * @param {string} version The new version string (e.g., '1.0.1').
 * @param {string} releaseNotes Notes detailing changes in this version.
 * @returns {Promise<{ success: boolean; deploymentId: string }>} A promise indicating success and providing a deployment ID.
 */
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

/**
 * Retrieves the audit log for a specific AI insight, detailing its lifecycle and interactions.
 * Business Value: Crucial for regulatory compliance, internal auditing, and forensic investigations.
 * It provides an immutable, chronological record of all changes and actions related to an insight.
 * @param {string} insightId The unique identifier of the insight.
 * @param {number} limit The maximum number of log entries to retrieve.
 * @param {number} offset The starting offset for pagination.
 * @returns {Promise<AuditLogEntry[]>} A promise resolving to an array of audit log entries.
 */
export async function getInsightAuditLog(insightId: string, limit: number = 10, offset: number = 0): Promise<AuditLogEntry[]> {
    try {
        return await _apiCall<AuditLogEntry[]>(`/insights/${insightId}/audit?limit=${limit}&offset=${offset}`);
    } catch (error) {
        console.error(`Error fetching audit log for insight ${insightId}:`, error);
        throw error;
    }
}

/**
 * Requests re-analysis of an existing insight with updated parameters.
 * Business Value: Allows for dynamic adaptation and refinement of insights based on new information
 * or changing business contexts, ensuring that AI-generated intelligence remains relevant and accurate.
 * @param {string} insightId The unique identifier of the insight to reanalyze.
 * @param {object} parameters New parameters to use for reanalysis.
 * @returns {Promise<{ success: boolean; taskId: string }>} A promise indicating success and providing a task ID for the reanalysis job.
 */
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

/**
 * Subscribes a user to updates for a specific AI insight.
 * Business Value: Ensures stakeholders are immediately informed of critical changes or
 * new developments related to insights they are monitoring, enabling prompt action.
 * @param {string} insightId The unique identifier of the insight.
 * @param {string} userId The unique identifier of the user to subscribe.
 * @returns {Promise<{ success: boolean; subscriptionId: string }>} A promise indicating success and providing a subscription ID.
 */
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

/**
 * Unsubscribes from updates for a specific AI insight.
 * Business Value: Provides users with control over their notification streams,
 * preventing alert fatigue and allowing them to focus on their highest-priority tasks.
 * @param {string} subscriptionId The unique identifier of the subscription.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the unsubscription.
 */
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

/**
 * Generates a comprehensive report for a selection of AI insights.
 * Business Value: Automates the creation of compliance, operational, or executive reports,
 * saving significant manual effort and ensuring consistent, data-driven reporting across the organization.
 * @param {string[]} insightIds An array of insight IDs to include in the report.
 * @param {'pdf' | 'csv' | 'json'} reportType The desired format of the report.
 * @param {string} [startDate] Optional start date for filtering insights within the report.
 * @param {string} [endDate] Optional end date for filtering insights within the report.
 * @returns {Promise<{ success: boolean; reportUrl: string; reportId: string }>} A promise resolving to a report URL and ID.
 */
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

/**
 * Fetches the data schema for a specific data source.
 * Business Value: Essential for data governance, ensuring data quality, and facilitating
 * data integration tasks. It provides a standardized view of the data structure for developers and data scientists.
 * @param {string} sourceId The unique identifier of the data source.
 * @returns {Promise<ComplexDataSchema>} A promise resolving to the data schema of the specified source.
 */
export async function fetchDataSchema(sourceId: string): Promise<ComplexDataSchema> {
    try {
        return await _apiCall<ComplexDataSchema>(`/data-sources/${sourceId}/schema`);
    } catch (error) {
        console.error(`Error fetching data schema for source ${sourceId}:`, error);
        throw error;
    }
}

/**
 * Triggers the retraining process for a specific AI model with a new dataset.
 * Business Value: Ensures AI models remain current and performant by facilitating
 * regular updates with fresh data, adapting to evolving patterns and maintaining predictive accuracy.
 * @param {string} modelId The unique identifier of the model to retrain.
 * @param {string} datasetId The unique identifier of the dataset to use for training.
 * @param {object} [hyperparameters] Optional hyperparameters to tune the training process.
 * @returns {Promise<{ success: boolean; trainingJobId: string }>} A promise indicating success and providing a training job ID.
 */
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

/**
 * Retrieves the status and progress of an ongoing model training job.
 * Business Value: Provides transparency into the AI development lifecycle, allowing
 * monitoring of training progress, resource utilization, and early detection of issues,
 * reducing development cycles and ensuring model readiness.
 * @param {string} trainingJobId The unique identifier of the training job.
 * @returns {Promise<{ status: string; progress: number; logs: string[] }>} A promise resolving to the job status, progress, and recent logs.
 */
export async function getTrainingJobStatus(trainingJobId: string): Promise<{ status: string; progress: number; logs: string[] }> {
    try {
        return await _apiCall<{ status: string; progress: number; logs: string[] }>(`/admin/training-jobs/${trainingJobId}/status`);
    } catch (error) {
        console.error(`Error getting training job status for ${trainingJobId}:`, error);
        throw error;
    }
}

/**
 * Manages access levels for a specific user to a particular AI insight.
 * Business Value: Enforces granular security and data governance by controlling
 * who can view or modify sensitive AI insights, critical for compliance and intellectual property protection.
 * @param {string} insightId The unique identifier of the insight.
 * @param {string} userId The unique identifier of the user.
 * @param {'read' | 'write' | 'none'} accessLevel The desired access level for the user.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the access management.
 */
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

/**
 * Deletes an AI insight by its unique identifier.
 * Business Value: Supports data retention policies and data privacy regulations
 * (e.g., GDPR, CCPA) by allowing for the permanent removal of insights, ensuring compliance.
 * @param {string} insightId The unique identifier of the insight to delete.
 * @param {boolean} force Optional flag to force deletion, bypassing soft-delete mechanisms.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the deletion.
 */
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

/**
 * Archives a batch of AI insights within a specified date range.
 * Business Value: Optimizes system performance and storage costs by moving
 * less frequently accessed historical insights to archive storage, while maintaining auditability.
 * @param {string} startDate The start date of the range (ISO string).
 * @param {string} endDate The end date of the range (ISO string).
 * @returns {Promise<{ success: boolean; count: number }>} A promise indicating success and the number of insights archived.
 */
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

/**
 * Fetches notification settings for a specific user.
 * Business Value: Enables personalized communication preferences for users,
 * ensuring they receive alerts and updates through their preferred channels,
 * improving responsiveness and user satisfaction.
 * @param {string} userId The unique identifier of the user.
 * @returns {Promise<any>} A promise resolving to the user's notification settings.
 */
export async function fetchNotificationSettings(userId: string): Promise<any> {
    try {
        return await _apiCall<any>(`/users/${userId}/notifications/settings`);
    } catch (error) {
        console.error(`Error fetching notification settings for user ${userId}:`, error);
        throw error;
    }
}

/**
 * Updates notification settings for a specific user.
 * Business Value: Empowers users to customize their alert preferences,
 * reducing notification fatigue and ensuring critical information is delivered effectively.
 * @param {string} userId The unique identifier of the user.
 * @param {object} settings The updated notification settings.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the update.
 */
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

/**
 * Retrieves the global system configuration.
 * Business Value: Provides administrators with a centralized view of the system's operational parameters,
 * crucial for governance, troubleshooting, and ensuring consistent behavior across the platform.
 * @returns {Promise<any>} A promise resolving to the system configuration object.
 */
export async function getSystemConfiguration(): Promise<any> {
    try {
        return await _apiCall<any>(`/system/config`);
    } catch (error) {
        console.error('Error fetching system configuration:', error);
        throw error;
    }
}

/**
 * Updates the global system configuration.
 * Business Value: Allows authorized administrators to dynamically adjust system parameters,
 * enabling responsive operational changes, performance tuning, and compliance updates without downtime.
 * @param {object} config The updated system configuration object.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the update.
 */
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

/**
 * Triggers a manual data refresh for a specific data source.
 * Business Value: Ensures data freshness for critical insights, allowing for
 * on-demand updates to reflect the latest information from integrated systems.
 * @param {string} dataSourceId The unique identifier of the data source.
 * @returns {Promise<{ success: boolean; taskId: string }>} A promise indicating success and providing a task ID for the refresh job.
 */
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

/**
 * Initiates a data integrity validation process for a specified data source.
 * Business Value: Guarantees the reliability and accuracy of data fed into the AI,
 * mitigating risks associated with erroneous inputs and ensuring the trustworthiness of AI-generated insights.
 * @param {string} dataSourceId The unique identifier of the data source.
 * @returns {Promise<{ success: boolean; issuesFound: number; validationReportUrl: string }>} A promise resolving to validation results.
 */
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

/**
 * Fetches the configuration for a specific real-time data stream.
 * Business Value: Provides insights into real-time data ingestion and processing pipelines,
 * critical for monitoring data flow, troubleshooting, and ensuring low-latency operations.
 * @param {string} streamId The unique identifier of the real-time stream.
 * @returns {Promise<any>} A promise resolving to the stream's configuration.
 */
export async function fetchRealtimeStreamConfiguration(streamId: string): Promise<any> {
    try {
        return await _apiCall<any>(`/streams/${streamId}/config`);
    } catch (error) {
        console.error(`Error fetching realtime stream configuration for ${streamId}:`, error);
        throw error;
    }
}

/**
 * Updates the configuration for a real-time data stream.
 * Business Value: Allows for dynamic adjustments to real-time data processing,
 * enabling agile responses to changing data formats, business rules, or performance requirements.
 * @param {string} streamId The unique identifier of the real-time stream.
 * @param {object} configUpdates An object containing the configuration changes.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the update.
 */
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

/**
 * Deletes a real-time data stream.
 * Business Value: Supports resource management and decommissioning of obsolete data pipelines,
 * optimizing infrastructure costs and simplifying the system architecture.
 * @param {string} streamId The unique identifier of the real-time stream.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the deletion.
 */
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

/**
 * Retrieves the layout configuration for a user's dashboard.
 * Business Value: Enables personalization of user interfaces, allowing users to arrange
 * widgets and data visualizations to suit their individual needs and preferences,
 * enhancing usability and productivity.
 * @param {string} userId The unique identifier of the user.
 * @param {string} dashboardId The unique identifier of the dashboard.
 * @returns {Promise<any>} A promise resolving to the dashboard layout configuration.
 */
export async function getDashboardLayout(userId: string, dashboardId: string): Promise<any> {
    try {
        return await _apiCall<any>(`/users/${userId}/dashboards/${dashboardId}/layout`);
    } catch (error) {
        console.error(`Error fetching dashboard layout for ${dashboardId}:`, error);
        throw error;
    }
}

/**
 * Saves the layout configuration for a user's dashboard.
 * Business Value: Allows users to persist their customized dashboard layouts,
 * ensuring a consistent and tailored analytical environment across sessions.
 * @param {string} userId The unique identifier of the user.
 * @param {string} dashboardId The unique identifier of the dashboard.
 * @param {object} layout The layout configuration object to save.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the save operation.
 */
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

/**
 * Fetches the permissions associated with a specific user.
 * Business Value: Crucial for implementing Role-Based Access Control (RBAC) and ensuring
 * that users only have access to the resources and actions authorized by their role,
 * upholding security and data integrity.
 * @param {string} userId The unique identifier of the user.
 * @returns {Promise<string[]>} A promise resolving to an array of permission strings.
 */
export async function fetchUserPermissions(userId: string): Promise<string[]> {
    try {
        return await _apiCall<string[]>(`/users/${userId}/permissions`);
    } catch (error) {
        console.error(`Error fetching permissions for user ${userId}:`, error);
        throw error;
    }
}

/**
 * Updates the permissions for a specific user.
 * Business Value: Provides administrators with the ability to manage user privileges,
 * dynamically adjusting access rights in response to organizational changes or security requirements.
 * @param {string} userId The unique identifier of the user.
 * @param {string[]} permissions An array of permission strings to assign to the user.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the update.
 */
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

/**
 * Retrieves settings specific to a given tenant (organization).
 * Business Value: Supports multi-tenant architectures by allowing each tenant
 * to have distinct configurations, ensuring customization and isolation for diverse client needs.
 * @param {string} tenantId The unique identifier of the tenant.
 * @returns {Promise<any>} A promise resolving to the tenant's settings.
 */
export async function getTenantSettings(tenantId: string): Promise<any> {
    try {
        return await _apiCall<any>(`/tenants/${tenantId}/settings`);
    } catch (error) {
        console.error(`Error fetching tenant settings for ${tenantId}:`, error);
        throw error;
    }
}

/**
 * Updates settings for a specific tenant (organization).
 * Business Value: Enables centralized management of tenant-specific configurations,
 * allowing for tailored service offerings and administrative control within a multi-tenant environment.
 * @param {string} tenantId The unique identifier of the tenant.
 * @param {object} settings The updated settings for the tenant.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the update.
 */
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

/**
 * Exports user data in a specified format.
 * Business Value: Essential for data portability and compliance with data privacy regulations
 * (e.g., "Right to Data Portability" under GDPR), allowing users to retrieve their data from the system.
 * @param {string} userId The unique identifier of the user whose data is to be exported.
 * @param {'json' | 'xml' | 'csv'} format The desired output format for the data.
 * @returns {Promise<{ success: boolean; downloadUrl: string }>} A promise resolving to a download URL for the exported data.
 */
export async function exportUserData(userId: string, format: 'json' | 'xml' | 'csv'): Promise<{ success: boolean; downloadUrl: string }> {
    try {
        return await _apiCall<{ success: boolean; downloadUrl: string }>(`/users/${userId}/export?format=${format}`);
    } catch (error) {
        console.error(`Error exporting user data for ${userId}:`, error);
        throw error;
    }
}

/**
 * Imports user data from a provided file.
 * Business Value: Facilitates data migration and bulk user provisioning,
 * enabling efficient onboarding and data management for large user bases.
 * @param {string} userId The unique identifier of the user for whom data is being imported.
 * @param {Blob} fileData The file content (e.g., from a file input).
 * @param {'json' | 'xml' | 'csv'} format The format of the imported data.
 * @returns {Promise<{ success: boolean; message: string; importedCount: number }>} A promise indicating success and the number of items imported.
 */
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

/**
 * Performs a bulk update on the status of multiple AI insights.
 * Business Value: Enhances operational efficiency by allowing administrators or agents
 * to quickly manage the lifecycle of many insights simultaneously,
 * such as mass archiving or resolving low-priority alerts.
 * @param {string[]} insightIds An array of unique identifiers for insights to update.
 * @param {InsightStatus} newStatus The new status to apply to all specified insights.
 * @returns {Promise<{ success: boolean; updatedCount: number }>} A promise indicating success and the number of insights updated.
 */
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

/**
 * Submits a batch of data points for processing according to a specified configuration.
 * Business Value: Facilitates efficient processing of large datasets, enabling scalable
 * data pipelines for analytics, model inference, or data transformation,
 * critical for handling high data volumes.
 * @param {any[]} dataPoints An array of data points to process.
 * @param {object} processingConfig Configuration for the batch processing job.
 * @returns {Promise<{ success: boolean; batchId: string; processedCount: number }>} A promise indicating success, a batch ID, and processed count.
 */
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

/**
 * Retrieves the status of a previously initiated batch processing job.
 * Business Value: Provides transparency and control over asynchronous data processing tasks,
 * allowing users to monitor progress and retrieve results upon completion.
 * @param {string} jobId The unique identifier of the processing job.
 * @returns {Promise<{ status: string; progress: number; resultsUrl?: string; errors: string[] }>} A promise resolving to the job's status, progress, and any errors.
 */
export async function getProcessingJobStatus(jobId: string): Promise<{ status: string; progress: number; resultsUrl?: string; errors: string[] }> {
    try {
        return await _apiCall<{ status: string; progress: number; resultsUrl?: string; errors: string }>(`/data/processing-jobs/${jobId}/status`); // TODO: Should return errors as array
    } catch (error) {
        console.error(`Error getting processing job status for ${jobId}:`, error);
        throw error;
    }
}

/**
 * Requests an ethical review for a specific AI insight.
 * Business Value: Integrates ethical AI governance directly into the workflow,
 * ensuring that potentially sensitive or biased insights are reviewed by human experts,
 * mitigating reputational and regulatory risks.
 * @param {string} insightId The unique identifier of the insight to review.
 * @param {string} reviewerId The unique identifier of the user or group designated as reviewer.
 * @returns {Promise<{ success: boolean; reviewId: string }>} A promise indicating success and providing a review ID.
 */
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

/**
 * Submits the details of an ethical review.
 * Business Value: Formalizes the ethical review process, providing a documented audit trail
 * of human oversight on AI decisions, which is critical for compliance and trust.
 * @param {string} reviewId The unique identifier of the ethical review.
 * @param {EthicalConsideration[]} reviewDetails An array of ethical considerations and their scores/details.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the submission.
 */
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

/**
 * Retrieves the operational status of the recommendation engine.
 * Business Value: Provides real-time visibility into the health of critical AI components,
 * ensuring that recommendation services are functioning optimally to drive personalized experiences and revenue.
 * @returns {Promise<{ status: 'running' | 'paused' | 'failed'; lastChecked: string; pendingRecommendations: number }>} A promise resolving to the engine's status.
 */
export async function getRecommendationEngineStatus(): Promise<{ status: 'running' | 'paused' | 'failed'; lastChecked: string; pendingRecommendations: number }> {
    try {
        return await _apiCall<{ status: 'running' | 'paused' | 'failed'; lastChecked: string; pendingRecommendations: number }>(`/engines/recommendation/status`);
    }

    catch (error) {
        console.error('Error getting recommendation engine status:', error);
        throw error;
    }
}

/**
 * Updates the settings for the recommendation engine.
 * Business Value: Allows dynamic tuning of recommendation algorithms and policies,
 * ensuring the engine adapts to changing business goals or user behaviors,
 * directly impacting customer engagement and conversion rates.
 * @param {object} settings The updated settings for the recommendation engine.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the update.
 */
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

/**
 * Fetches a list of all scheduled tasks within the system.
 * Business Value: Provides an overview of automated operations, enabling administrators
 * to monitor, manage, and audit recurring processes critical for system maintenance and data updates.
 * @returns {Promise<DistributedTaskDefinition[]>} A promise resolving to an array of scheduled task definitions.
 */
export async function fetchScheduledTasks(): Promise<DistributedTaskDefinition[]> {
    try {
        return await _apiCall<DistributedTaskDefinition[]>(`/admin/tasks/scheduled`);
    } catch (error) {
        console.error('Error fetching scheduled tasks:', error);
        throw error;
    }
}

/**
 * Creates a new scheduled task.
 * Business Value: Automates routine system operations, data processing, and reporting,
 * reducing manual overhead and ensuring timely execution of critical background jobs.
 * @param {object} taskDefinition The definition of the scheduled task.
 * @returns {Promise<{ success: boolean; taskId: string }>} A promise indicating success and providing the new task ID.
 */
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

/**
 * Deletes an existing scheduled task.
 * Business Value: Allows for the decommissioning of obsolete or unnecessary automated tasks,
 * optimizing resource utilization and maintaining a clean operational environment.
 * @param {string} taskId The unique identifier of the task to delete.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the deletion.
 */
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

/**
 * Retrieves system logs, filtered by level and limit.
 * Business Value: Essential for operational monitoring, troubleshooting, and auditing system behavior.
 * Provides granular visibility into the health and activities of the AI platform.
 * @param {'info' | 'warn' | 'error'} [level] Optional filter for log level.
 * @param {number} limit The maximum number of log entries to retrieve.
 * @returns {Promise<any[]>} A promise resolving to an array of log entries.
 */
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

/**
 * Exports system logs in a specified format, filtered by level and date range.
 * Business Value: Supports compliance and forensic analysis by enabling the
 * download of comprehensive log data for external review, archival, or integration with SIEM systems.
 * @param {'json' | 'txt' | 'csv'} format The desired output format for the logs.
 * @param {'info' | 'warn' | 'error'} [level] Optional filter for log level.
 * @param {string} [startDate] Optional start date for log entries (ISO string).
 * @param {string} [endDate] Optional end date for log entries (ISO string).
 * @returns {Promise<{ success: boolean; downloadUrl: string }>} A promise resolving to a download URL for the exported logs.
 */
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

/**
 * Retrieves the current status of a specific AI agent.
 * Business Value: Provides real-time visibility into the operational state of autonomous agents,
 * critical for monitoring their activity, performance, and ensuring they are effectively
 * executing their assigned tasks.
 * @param {string} agentId The unique identifier of the AI agent.
 * @returns {Promise<{ id: string; status: AgentStatus; lastSeen: string; assignedTasks: number }>} A promise resolving to the agent's status details.
 */
export async function getAIAgentStatus(agentId: string): Promise<{ id: string; status: AgentStatus; lastSeen: string; assignedTasks: number }> {
    try {
        return await _apiCall<{ id: string; status: AgentStatus; lastSeen: string; assignedTasks: number }>(`/agents/${agentId}/status`);
    } catch (error) {
        console.error(`Error fetching AI agent status for ${agentId}:`, error);
        throw error;
    }
}

/**
 * Restarts a specific AI agent.
 * Business Value: Enables rapid remediation of unresponsive or faulty agents,
 * ensuring continuous operation of automated workflows and minimizing service disruptions.
 * @param {string} agentId The unique identifier of the AI agent to restart.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the restart operation.
 */
export async function restartAIAgent(agentId: string): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/agents/${agentId}/restart`, { method: 'POST' });
    } catch (error) {
        console.error(`Error restarting AI agent ${agentId}:`, error);
        throw error;
    }
}

/**
 * Deploys a new AI agent with a given configuration.
 * Business Value: Facilitates the scaling and expansion of agentic AI capabilities,
 * enabling organizations to rapidly deploy new autonomous systems to address evolving
 * business needs and automate more complex tasks.
 * @param {AgentConfiguration} agentConfig The configuration object for the new AI agent.
 * @returns {Promise<{ success: boolean; agentId: string }>} A promise indicating success and providing the new agent's ID.
 */
export async function deployAIAgent(agentConfig: AgentConfiguration): Promise<{ success: boolean; agentId: string }> {
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

/**
 * Fetches the overall health status of the quantum network (if applicable, simulation).
 * Business Value: Provides crucial diagnostic information for network infrastructure,
 * identifying potential bottlenecks or failures that could impact the performance
 * and reliability of distributed AI services.
 * @returns {Promise<{ status: 'online' | 'degraded' | 'offline'; latencyMs: number; packetLoss: number; nodesActive: number }>} A promise resolving to network health metrics.
 */
export async function getQuantumNetworkHealth(): Promise<{ status: 'online' | 'degraded' | 'offline'; latencyMs: number; packetLoss: number; nodesActive: number }> {
    try {
        return await _apiCall<{ status: 'online' | 'degraded' | 'offline'; latencyMs: number; packetLoss: number; nodesActive: number }>(`/network/health`);
    } catch (error) {
        console.error('Error fetching quantum network health:', error);
        throw error;
    }
}

/**
 * Initiates a diagnostic process for a specific network node.
 * Business Value: Accelerates troubleshooting and resolution of network-related issues,
 * minimizing downtime and maintaining the performance of interconnected AI components.
 * @param {string} nodeId The unique identifier of the network node to diagnose.
 * @returns {Promise<{ success: boolean; diagnosticReport: string; issueFound: boolean }>} A promise resolving to a diagnostic report.
 */
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

/**
 * Retrieves a security audit report by its unique identifier.
 * Business Value: Supports rigorous security posture and compliance requirements by
 * providing access to detailed records of security assessments and findings.
 * @param {string} reportId The unique identifier of the security audit report.
 * @returns {Promise<any>} A promise resolving to the security audit report details.
 */
export async function getSecurityAuditReport(reportId: string): Promise<any> {
    try {
        return await _apiCall<any>(`/security/audit-reports/${reportId}`);
    } catch (error) {
        console.error(`Error fetching security audit report ${reportId}:`, error);
        throw error;
    }
}

/**
 * Triggers a security scan (vulnerability, compliance, or penetration) on a specified target.
 * Business Value: Proactively identifies security vulnerabilities and compliance gaps,
 * strengthening the platform's security defenses and reducing the risk of data breaches.
 * @param {string} target The target of the security scan (e.g., 'system', 'application', 'data_source').
 * @param {'vulnerability' | 'compliance' | 'penetration'} scanType The type of security scan to perform.
 * @returns {Promise<{ success: boolean; scanId: string }>} A promise indicating success and providing a scan ID.
 */
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

/**
 * Retrieves the status of an ongoing security scan.
 * Business Value: Provides real-time monitoring of security assessment progress,
 * enabling security teams to track findings and prioritize remediation efforts effectively.
 * @param {string} scanId The unique identifier of the security scan.
 * @returns {Promise<{ status: string; progress: number; findings: string[] }>} A promise resolving to the scan status, progress, and findings.
 */
export async function getSecurityScanStatus(scanId: string): Promise<{ status: string; progress: number; findings: string[] }> {
    try {
        return await _apiCall<{ status: string; progress: number; findings: string[] }>(`/security/scans/${scanId}/status`);
    } catch (error) {
        console.error(`Error getting security scan status for ${scanId}:`, error);
        throw error;
    }
}

/**
 * Fetches a specific compliance policy by its unique identifier.
 * Business Value: Centralizes access to regulatory and internal compliance policies,
 * ensuring all system operations and AI models adhere to necessary legal and ethical standards.
 * @param {string} policyId The unique identifier of the compliance policy.
 * @returns {Promise<any>} A promise resolving to the compliance policy document.
 */
export async function fetchCompliancePolicy(policyId: string): Promise<any> {
    try {
        return await _apiCall<any>(`/compliance/policies/${policyId}`);
    } catch (error) {
        console.error(`Error fetching compliance policy ${policyId}:`, error);
        throw error;
    }
}

/**
 * Updates an existing compliance policy.
 * Business Value: Allows for agile adaptation to evolving regulatory landscapes,
 * enabling quick updates to compliance policies across the system to maintain legal adherence.
 * @param {string} policyId The unique identifier of the compliance policy to update.
 * @param {object} policyDocument The updated policy document.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the update.
 */
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

/**
 * Retrieves current resource allocation details for a specified resource type.
 * Business Value: Provides critical operational visibility into infrastructure utilization,
 * helping optimize resource distribution, prevent bottlenecks, and manage operational costs.
 * @param {string} resourceType The type of resource (e.g., 'cpu', 'memory', 'gpu').
 * @returns {Promise<any>} A promise resolving to resource allocation details.
 */
export async function getResourceAllocation(resourceType: string): Promise<any> {
    try {
        return await _apiCall<any>(`/resources/${resourceType}/allocation`);
    } catch (error) {
        console.error(`Error fetching resource allocation for ${resourceType}:`, error);
        throw error;
    }
}

/**
 * Triggers an optimization process for resource allocation.
 * Business Value: Automates infrastructure cost savings and performance enhancements
 * by intelligently reallocating resources based on defined optimization goals,
 * ensuring efficient operation of all AI services.
 * @param {string} resourceType The type of resource to optimize.
 * @param {string} optimizationGoal The objective of the optimization (e.g., 'cost', 'performance').
 * @returns {Promise<{ success: boolean; optimizationId: string; estimatedSavings: number }>} A promise resolving to optimization results.
 */
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

/**
 * Fetches an environmental impact report by its unique identifier.
 * Business Value: Supports corporate sustainability initiatives and reporting,
 * providing data-driven insights into the environmental footprint of AI operations.
 * @param {string} reportId The unique identifier of the environmental impact report.
 * @returns {Promise<any>} A promise resolving to the environmental impact report details.
 */
export async function fetchEnvironmentalImpactReport(reportId: string): Promise<any> {
    try {
        return await _apiCall<any>(`/sustainability/reports/${reportId}`);
    } catch (error) {
        console.error(`Error fetching environmental impact report ${reportId}:`, error);
        throw error;
    }
}

/**
 * Calculates the carbon footprint for a specified scope and period.
 * Business Value: Empowers organizations to measure and manage their environmental impact,
 * contributing to sustainability goals and responsible AI deployment.
 * @param {'project' | 'organization' | 'data-center'} scope The scope of the carbon footprint calculation.
 * @param {'daily' | 'monthly' | 'yearly'} period The period for which to calculate the footprint.
 * @returns {Promise<{ success: boolean; footprintKgCO2e: number; details: object }>} A promise resolving to the carbon footprint details.
 */
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

/**
 * Retrieves market trend analysis for a given segment and forecast horizon.
 * Business Value: Provides strategic insights into market dynamics, enabling businesses
 * to make informed decisions about product development, pricing, and market entry strategies,
 * fostering competitive advantage.
 * @param {string} marketSegment The market segment to analyze.
 * @param {string} forecastHorizon The forecast period (e.g., '3_months', '1_year').
 * @returns {Promise<any>} A promise resolving to the market trend analysis data.
 */
export async function getMarketTrendAnalysis(marketSegment: string, forecastHorizon: string): Promise<any> {
    try {
        return await _apiCall<any>(`/market-intelligence/trends?segment=${marketSegment}&horizon=${forecastHorizon}`);
    } catch (error) {
        console.error(`Error fetching market trend analysis for ${marketSegment}:`, error);
        throw error;
    }
}

/**
 * Predicts the churn probability for a specific customer.
 * Business Value: Enables proactive customer retention strategies by identifying
 * at-risk customers, allowing targeted interventions to reduce churn and maximize customer lifetime value.
 * @param {string} customerId The unique identifier of the customer.
 * @returns {Promise<{ success: boolean; churnProbability: number; factors: string[] }>} A promise resolving to churn prediction details.
 */
export async function predictCustomerChurn(customerId: string): Promise<{ success: boolean; churnProbability: number; factors: string[] }> {
    try {
        return await _apiCall<{ success: boolean; churnProbability: number; factors: string[] }>(`/customer-intelligence/${customerId}/churn-prediction`);
    } catch (error) {
        console.error(`Error predicting customer churn for ${customerId}:`, error);
        throw error;
    }
}

/**
 * Fetches detailed information about a specific customer segment.
 * Business Value: Supports highly targeted marketing and product strategies by providing
 * deep insights into customer demographics, behaviors, and preferences for specific segments.
 * @param {string} segmentId The unique identifier of the customer segment.
 * @returns {Promise<any>} A promise resolving to the customer segment details.
 */
export async function fetchCustomerSegmentDetails(segmentId: string): Promise<any> {
    try {
        return await _apiCall<any>(`/customer-intelligence/segments/${segmentId}`);
    } catch (error) {
        console.error(`Error fetching customer segment details for ${segmentId}:`, error);
        throw error;
    }
}

/**
 * Generates a new training dataset based on specified parameters.
 * Business Value: Automates the data preparation phase for AI model development,
 * accelerating the creation of diverse and high-quality training data,
 * crucial for robust model performance and reducing manual data engineering effort.
 * @param {object} parameters Parameters for dataset generation (e.g., data source, transformation rules, size).
 * @returns {Promise<{ success: boolean; datasetId: string; sizeGb: number }>} A promise indicating success, dataset ID, and its size.
 */
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

/**
 * Validates the output of an AI model against expected criteria.
 * Business Value: Ensures the quality and accuracy of AI model inferences in production,
 * detecting potential biases or errors before they impact business operations,
 * and maintaining trust in AI-driven decisions.
 * @param {string} modelId The unique identifier of the model.
 * @param {object} outputData The data output from the model to be validated.
 * @returns {Promise<{ success: boolean; validationScore: number; discrepancies: object[] }>} A promise resolving to validation results.
 */
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

/**
 * Deploys an experimental feature with a specified rollout percentage.
 * Business Value: Enables safe and controlled A/B testing or canary deployments of new features,
 * allowing for real-world validation and iterative product development without impacting all users.
 * @param {string} featureName The name of the experimental feature.
 * @param {number} rolloutPercentage The percentage of users to expose the feature to (0-100).
 * @param {object} config Configuration specific to the experimental feature.
 * @returns {Promise<{ success: boolean; deploymentId: string }>} A promise indicating success and providing a deployment ID.
 */
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

/**
 * Monitors the performance of an deployed experimental feature over a given duration.
 * Business Value: Provides critical feedback on the impact of new features,
 * enabling data-driven decisions on whether to fully roll out, modify, or roll back,
 * ensuring positive user experience and business outcomes.
 * @param {string} deploymentId The unique identifier of the feature deployment.
 * @param {number} durationHours The duration in hours to monitor the feature.
 * @returns {Promise<any>} A promise resolving to performance monitoring data.
 */
export async function monitorFeaturePerformance(deploymentId: string, durationHours: number): Promise<any> {
    try {
        return await _apiCall<any>(`/features/experimental/${deploymentId}/monitor?duration=${durationHours}`);
    } catch (error) {
        console.error(`Error monitoring feature performance for ${deploymentId}:`, error);
        throw error;
    }
}

/**
 * Retrieves the capabilities and available functions of the AI engine.
 * Business Value: Provides a dynamic inventory of the AI system's current abilities,
 * crucial for developers building integrations and for agents needing to discover available skills.
 * @returns {Promise<any>} A promise resolving to an object detailing AI engine capabilities.
 */
export async function getAIEngineCapabilities(): Promise<any> {
    try {
        return await _apiCall<any>(`/engines/capabilities`);
    } catch (error) {
        console.error('Error fetching AI engine capabilities:', error);
        throw error;
    }
}

/**
 * Updates the configuration for a specific AI engine component.
 * Business Value: Allows fine-grained control over individual AI engine components,
 * enabling performance tuning, resource management, and specialized behavior adjustments
 * to optimize overall system efficiency.
 * @param {string} engineId The unique identifier of the AI engine component.
 * @param {object} config The updated configuration object.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the update.
 */
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

/**
 * Fetches the settings for a specific anomaly detection component.
 * Business Value: Provides visibility into the configuration of anomaly detection models,
 * allowing security and operations teams to understand how anomalies are identified and flagged.
 * @param {string} detectorId The unique identifier of the anomaly detector.
 * @returns {Promise<any>} A promise resolving to the anomaly detection settings.
 */
export async function fetchAnomalyDetectionSettings(detectorId: string): Promise<any> {
    try {
        return await _apiCall<any>(`/anomaly-detection/${detectorId}/settings`);
    } catch (error) {
        console.error(`Error fetching anomaly detection settings for ${detectorId}:`, error);
        throw error;
    }
}

/**
 * Updates the settings for a specific anomaly detection component.
 * Business Value: Enables dynamic adjustment of anomaly detection thresholds and models,
 * allowing the system to adapt to evolving data patterns and reduce false positives,
 * ensuring accurate and timely anomaly alerts.
 * @param {string} detectorId The unique identifier of the anomaly detector.
 * @param {object} settings The updated anomaly detection settings.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the update.
 */
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

/**
 * Generates synthetic data based on a provided schema and row count.
 * Business Value: Crucial for privacy-preserving development and testing. It allows
 * developers and data scientists to create realistic, anonymized datasets for model training,
 * system testing, and feature development without using sensitive real-world data.
 * @param {object} schema The schema defining the structure of the synthetic data.
 * @param {number} rowCount The number of rows to generate.
 * @param {object} [constraints] Optional constraints for data generation (e.g., value ranges, distributions).
 * @returns {Promise<{ success: boolean; datasetId: string; generatedRows: number }>} A promise indicating success, dataset ID, and generated row count.
 */
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

/**
 * Retrieves the status of a synthetic data generation job.
 * Business Value: Provides monitoring capabilities for long-running data generation tasks,
 * ensuring transparency and allowing users to track progress and retrieve results.
 * @param {string} jobId The unique identifier of the synthetic data generation job.
 * @returns {Promise<{ status: string; progress: number; downloadUrl?: string; errors: string[] }>} A promise resolving to the job status and download URL.
 */
export async function getSyntheticDataGenerationStatus(jobId: string): Promise<{ status: string; progress: number; downloadUrl?: string; errors: string[] }> {
    try {
        return await _apiCall<{ status: string; progress: number; downloadUrl?: string; errors: string }>(`/data/synthetic/jobs/${jobId}/status`); // TODO: should return errors as array
    } catch (error) {
        console.error(`Error getting synthetic data generation status for ${jobId}:`, error);
        throw error;
    }
}

/**
 * Retrieves raw telemetry data for a specific sensor within a time range.
 * Business Value: Provides foundational data for monitoring, diagnostics, and historical analysis
 * of connected devices and infrastructure, essential for understanding system behavior and performance.
 * @param {string} sensorId The unique identifier of the sensor.
 * @param {string} startTime The start time for data retrieval (ISO string).
 * @param {string} endTime The end time for data retrieval (ISO string).
 * @returns {Promise<any[]>} A promise resolving to an array of raw telemetry data points.
 */
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

/**
 * Processes telemetry data using a specified processing pipeline.
 * Business Value: Transforms raw sensor data into actionable insights,
 * enabling real-time analytics, anomaly detection, and predictive maintenance for IoT and operational systems.
 * @param {string} sensorId The unique identifier of the sensor.
 * @param {string} processingPipelineId The unique identifier of the processing pipeline to apply.
 * @param {object} dataWindow The time window or data segment to process.
 * @returns {Promise<{ success: boolean; processedDataId: string }>} A promise indicating success and providing an ID for the processed data.
 */
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

/**
 * Fetches user preferences for a specific category.
 * Business Value: Allows for segmented management of user preferences,
 * providing a more organized and scalable way to handle diverse personalization settings.
 * @param {string} userId The unique identifier of the user.
 * @param {string} category The category of preferences to fetch (e.g., 'dashboard', 'notifications').
 * @returns {Promise<any>} A promise resolving to the user's preferences for the specified category.
 */
export async function fetchUserPreferencesCategory(userId: string, category: string): Promise<any> {
    try {
        return await _apiCall<any>(`/users/${userId}/preferences/${category}`);
    } catch (error) {
        console.error(`Error fetching user preferences for category ${category} for user ${userId}:`, error);
        throw error;
    }
}

/**
 * Updates user preferences for a specific category.
 * Business Value: Provides granular control for users to customize various aspects
 * of their experience within the platform, enhancing usability and satisfaction.
 * @param {string} userId The unique identifier of the user.
 * @param {string} category The category of preferences to update.
 * @param {object} preferences The updated preferences object for the category.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the update.
 */
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

/**
 * Retrieves the history of configuration changes for a specific key.
 * Business Value: Essential for auditing, debugging, and maintaining system stability.
 * Provides a versioned record of configuration changes, enabling traceability and quick rollbacks.
 * @param {string} configKey The key of the configuration item (e.g., 'model_thresholds', 'agent_schedule').
 * @param {number} limit The maximum number of history entries to retrieve.
 * @returns {Promise<any[]>} A promise resolving to an array of configuration history entries.
 */
export async function getConfigurationHistory(configKey: string, limit: number = 10): Promise<any[]> {
    try {
        return await _apiCall<any[]>(`/admin/config/${configKey}/history?limit=${limit}`);
    } catch (error) {
        console.error(`Error fetching configuration history for ${configKey}:`, error);
        throw error;
    }
}

/**
 * Rolls back a configuration to a previous version.
 * Business Value: Enables rapid recovery from erroneous configuration changes,
 * minimizing downtime and ensuring business continuity by restoring known good states.
 * @param {string} configKey The key of the configuration item to rollback.
 * @param {string} versionId The ID of the specific version to roll back to.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the rollback.
 */
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

/**
 * Retrieves the status of a feature toggle.
 * Business Value: Provides real-time visibility into feature rollout status,
 * essential for managing experimental features, A/B tests, and controlled deployments.
 * @param {string} featureName The name of the feature toggle.
 * @returns {Promise<{ enabled: boolean; rolloutPercentage: number; lastUpdated: string }>} A promise resolving to the feature toggle status.
 */
export async function getFeatureToggleStatus(featureName: string): Promise<{ enabled: boolean; rolloutPercentage: number; lastUpdated: string }> {
    try {
        return await _apiCall<{ enabled: boolean; rolloutPercentage: number; lastUpdated: string }>(`/features/toggles/${featureName}/status`);
    } catch (error) {
        console.error(`Error fetching feature toggle status for ${featureName}:`, error);
        throw error;
    }
}

/**
 * Updates the status of a feature toggle, including its enabled state and rollout percentage.
 * Business Value: Enables dynamic control over feature availability, allowing for safe
 * and iterative product delivery, phased rollouts, and instant kill switches for problematic features.
 * @param {string} featureName The name of the feature toggle.
 * @param {boolean} enabled Whether the feature is enabled.
 * @param {number} rolloutPercentage The percentage of users to expose the feature to (0-100).
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the update.
 */
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

/**
 * Retrieves license information for the system.
 * Business Value: Essential for software asset management, compliance, and auditing.
 * Provides details on license validity, activated features, and usage limits.
 * @returns {Promise<{ key: string; expiryDate: string; features: string[]; status: 'active' | 'expired' | 'suspended' }>} A promise resolving to license details.
 */
export async function getLicenseInformation(): Promise<{ key: string; expiryDate: string; features: string[]; status: 'active' | 'expired' | 'suspended' }> {
    try {
        return await _apiCall<{ key: string; expiryDate: string; features: string[]; status: 'active' | 'expired' | 'suspended' }>(`/system/license`);
    } catch (error) {
        console.error('Error fetching license information:', error);
        throw error;
    }
}

/**
 * Renews the system license with a new license key.
 * Business Value: Ensures continuous operation and access to all licensed features,
 * preventing service disruptions due to expired licenses.
 * @param {string} newKey The new license key.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the renewal.
 */
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

/**
 * Retrieves billing details for a specific account.
 * Business Value: Provides transparency into service consumption and costs,
 * enabling financial monitoring and cost optimization for clients.
 * @param {string} accountId The unique identifier of the billing account.
 * @returns {Promise<any>} A promise resolving to the billing details.
 */
export async function getBillingDetails(accountId: string): Promise<any> {
    try {
        return await _apiCall<any>(`/billing/${accountId}/details`);
    } catch (error) {
        console.error(`Error fetching billing details for account ${accountId}:`, error);
        throw error;
    }
}

/**
 * Updates the payment method for a specific billing account.
 * Business Value: Facilitates seamless payment management, ensuring uninterrupted service
 * by allowing users to update their billing information securely.
 * @param {string} accountId The unique identifier of the billing account.
 * @param {string} paymentMethodToken A token representing the new payment method (e.g., from a payment gateway).
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the update.
 */
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

/**
 * Retrieves the status of a chatbot integration.
 * Business Value: Provides operational visibility into AI-driven conversational interfaces,
 * ensuring seamless customer support and interaction channels.
 * @param {string} integrationId The unique identifier of the chatbot integration.
 * @returns {Promise<{ status: 'active' | 'inactive' | 'error'; lastSync: string }>} A promise resolving to the integration status.
 */
export async function getChatbotIntegrationStatus(integrationId: string): Promise<{ status: 'active' | 'inactive' | 'error'; lastSync: string }> {
    try {
        return await _apiCall<{ status: 'active' | 'inactive' | 'error'; lastSync: string }>(`/integrations/chatbot/${integrationId}/status`);
    } catch (error) {
        console.error(`Error fetching chatbot integration status for ${integrationId}:`, error);
        throw error;
    }
}

/**
 * Deactivates a chatbot integration.
 * Business Value: Allows for controlled shutdown or maintenance of conversational AI services,
 * enabling graceful transitions or troubleshooting without impacting other system components.
 * @param {string} integrationId The unique identifier of the chatbot integration.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the deactivation.
 */
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

/**
 * Provisions a new operational environment.
 * Business Value: Automates the setup of development, testing, or production environments,
 * accelerating the software development lifecycle and ensuring consistency across deployments.
 * @param {string} environmentName The name of the new environment.
 * @param {string} configTemplateId The ID of the configuration template to use.
 * @returns {Promise<{ success: boolean; environmentId: string }>} A promise indicating success and providing the new environment ID.
 */
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

/**
 * Destroys an existing operational environment.
 * Business Value: Supports efficient resource management and cost optimization by
 * enabling the complete removal of unused environments, critical for cloud cost control.
 * @param {string} environmentId The unique identifier of the environment to destroy.
 * @param {boolean} force Optional flag to force deletion, bypassing safeguards.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the destruction.
 */
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

/**
 * Defines a new complex data schema.
 * Business Value: Centralizes data governance and standardization, ensuring consistent
 * data interpretation across all AI models and data processing pipelines,
 * reducing data quality issues and integration complexities.
 * @param {string} schemaName The name of the new data schema.
 * @param {ComplexDataSchema} schema The complete data schema definition.
 * @returns {Promise<{ success: boolean; schemaId: string }>} A promise indicating success and providing the new schema ID.
 */
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

/**
 * Updates an existing complex data schema.
 * Business Value: Allows for agile evolution of data structures, accommodating changes
 * in data sources or business requirements while maintaining version control and data integrity.
 * @param {string} schemaId The unique identifier of the schema to update.
 * @param {ComplexDataSchema} schema The updated data schema definition.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the update.
 */
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

/**
 * Deploys a new advanced data processing pipeline.
 * Business Value: Automates complex data transformations, enrichments, and validations,
 * creating robust and scalable data pipelines that feed high-quality data to AI models
 * and analytical systems.
 * @param {string} pipelineName The name of the new processing pipeline.
 * @param {AdvancedProcessingConfig} config The configuration for the processing pipeline.
 * @returns {Promise<{ success: boolean; pipelineId: string }>} A promise indicating success and providing the new pipeline ID.
 */
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

/**
 * Executes a distributed task across the system's worker infrastructure.
 * Business Value: Enables orchestration of complex, long-running, and resource-intensive tasks
 * such as large-scale data processing, model training, or multi-agent workflows, ensuring scalability and reliability.
 * @param {DistributedTaskDefinition} task The definition of the distributed task.
 * @returns {Promise<{ success: boolean; jobId: string }>} A promise indicating success and providing the job ID for the executed task.
 */
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

/**
 * Retrieves the configuration for a specific metric dashboard.
 * Business Value: Supports the management and customization of operational dashboards,
 * providing insights into system health, performance, and key business metrics.
 * @param {string} dashboardId The unique identifier of the dashboard.
 * @returns {Promise<any>} A promise resolving to the dashboard configuration.
 */
export async function getMetricDashboardConfig(dashboardId: string): Promise<any> {
    try {
        return await _apiCall<any>(`/metrics/dashboards/${dashboardId}/config`);
    } catch (error) {
        console.error(`Error fetching metric dashboard config for ${dashboardId}:`, error);
        throw error;
    }
}

/**
 * Saves the configuration for a specific metric dashboard.
 * Business Value: Allows administrators to define and persist custom monitoring views,
 * ensuring consistent and relevant observability across the organization.
 * @param {string} dashboardId The unique identifier of the dashboard.
 * @param {object} config The configuration object to save.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the save operation.
 */
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

/**
 * Fetches alert rules of a specified type.
 * Business Value: Provides a centralized view of all automated alert definitions,
 * crucial for incident management, compliance, and ensuring timely notifications for critical events.
 * @param {string} ruleType The type of alert rules to fetch (e.g., 'system_health', 'fraud_detection').
 * @returns {Promise<any[]>} A promise resolving to an array of alert rule definitions.
 */
export async function fetchAlertRules(ruleType: string): Promise<any[]> {
    try {
        return await _apiCall<any[]>(`/alerts/rules?type=${ruleType}`);
    } catch (error) {
        console.error(`Error fetching alert rules of type ${ruleType}:`, error);
        throw error;
    }
}

/**
 * Creates a new alert rule.
 * Business Value: Empowers administrators to define custom monitoring and alerting logic,
 * extending the system's ability to detect and respond to novel operational or business conditions.
 * @param {object} ruleDefinition The definition of the new alert rule.
 * @returns {Promise<{ success: boolean; ruleId: string }>} A promise indicating success and providing the new rule ID.
 */
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

/**
 * Deletes an existing alert rule.
 * Business Value: Supports the lifecycle management of alerting configurations,
 * allowing for removal of outdated rules and preventing alert fatigue.
 * @param {string} ruleId The unique identifier of the alert rule to delete.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the deletion.
 */
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

/**
 * Acknowledges a specific alert, indicating it has been seen and is being addressed.
 * Business Value: Improves incident response coordination by preventing multiple teams
 * from working on the same alert and providing clear status updates for critical issues.
 * @param {string} alertId The unique identifier of the alert.
 * @param {string} userId The unique identifier of the user acknowledging the alert.
 * @param {string} [notes] Optional notes from the user.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the acknowledgment.
 */
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

/**
 * Resolves a specific alert, indicating the underlying issue has been fixed.
 * Business Value: Formalizes the resolution of operational incidents,
 * providing a clear audit trail and enabling post-incident analysis to prevent recurrence.
 * @param {string} alertId The unique identifier of the alert.
 * @param {object} resolutionDetails Details about how the alert was resolved.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the resolution.
 */
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

/**
 * Fetches webhook configurations for a specific event type.
 * Business Value: Provides a centralized registry for external system integrations,
 * enabling real-time notification and data exchange with third-party services.
 * @param {string} eventType The type of event for which to fetch webhooks (e.g., 'insight_created', 'payment_failed').
 * @returns {Promise<any[]>} A promise resolving to an array of webhook configurations.
 */
export async function fetchWebhookConfigurations(eventType: string): Promise<any[]> {
    try {
        return await _apiCall<any[]>(`/webhooks/configs?eventType=${eventType}`);
    } catch (error) {
        console.error(`Error fetching webhook configurations for event type ${eventType}:`, error);
        throw error;
    }
}

/**
 * Creates a new webhook configuration.
 * Business Value: Extends the system's connectivity by allowing integration with
 * any external service that supports webhooks, greatly expanding automation and data flow capabilities.
 * @param {object} config The configuration object for the new webhook.
 * @returns {Promise<{ success: boolean; configId: string }>} A promise indicating success and providing the new configuration ID.
 */
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

/**
 * Updates an existing webhook configuration.
 * Business Value: Allows for dynamic adjustment of webhook settings,
 * ensuring seamless and adaptable integration with external systems as requirements change.
 * @param {string} configId The unique identifier of the webhook configuration to update.
 * @param {object} config The updated configuration object.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the update.
 */
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

/**
 * Deletes a webhook configuration.
 * Business Value: Supports secure decommissioning of integrations, preventing unintended
 * data transmission and optimizing system resource usage.
 * @param {string} configId The unique identifier of the webhook configuration to delete.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the deletion.
 */
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

/**
 * Retrieves the operational status of a specific integration.
 * Business Value: Provides real-time health checks for all external system integrations,
 * ensuring continuous data flow and service availability.
 * @param {string} integrationId The unique identifier of the integration.
 * @returns {Promise<{ status: 'connected' | 'disconnected' | 'error'; lastChecked: string; errorMessage?: string }>} A promise resolving to the integration status.
 */
export async function getIntegrationStatus(integrationId: string): Promise<{ status: 'connected' | 'disconnected' | 'error'; lastChecked: string; errorMessage?: string }> {
    try {
        return await _apiCall<{ status: 'connected' | 'disconnected' | 'error'; lastChecked: string; errorMessage?: string }>(`/integrations/${integrationId}/status`);
    } catch (error) {
        console.error(`Error fetching integration status for ${integrationId}:`, error);
        throw error;
    }
}

/**
 * Reconnects a disconnected integration.
 * Business Value: Enables rapid recovery from transient integration failures,
 * minimizing disruption to data pipelines and external service dependencies.
 * @param {string} integrationId The unique identifier of the integration to reconnect.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the reconnection.
 */
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

/**
 * Deactivates an existing integration.
 * Business Value: Allows for controlled shutdown or temporary suspension of integrations,
 * facilitating maintenance, troubleshooting, or planned deprecation.
 * @param {string} integrationId The unique identifier of the integration to deactivate.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the deactivation.
 */
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

/**
 * Provisions a new integration of a specified type.
 * Business Value: Streamlines the process of integrating new external services,
 * enabling rapid expansion of the system's capabilities and data connectivity.
 * @param {string} integrationType The type of integration to provision (e.g., 'CRM', 'ERP', 'Messaging').
 * @param {object} config Configuration details for the new integration.
 * @returns {Promise<{ success: boolean; integrationId: string }>} A promise indicating success and providing the new integration ID.
 */
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

/**
 * Retrieves the audit trail for a specific entity.
 * Business Value: Provides a comprehensive, tamper-evident record of all actions performed
 * on critical entities, essential for security, compliance, and forensic analysis.
 * @param {string} entityType The type of the entity (e.g., 'Insight', 'User', 'Model').
 * @param {string} entityId The unique identifier of the entity.
 * @param {number} limit The maximum number of audit entries to retrieve.
 * @returns {Promise<AuditLogEntry[]>} A promise resolving to an array of audit log entries.
 */
export async function getAuditTrailForEntity(entityType: string, entityId: string, limit: number = 50): Promise<AuditLogEntry[]> {
    try {
        return await _apiCall<AuditLogEntry[]>(`/audit-trail/${entityType}/${entityId}?limit=${limit}`);
    } catch (error) {
        console.error(`Error fetching audit trail for ${entityType} ${entityId}:`, error);
        throw error;
    }
}

/**
 * Retrieves usage statistics for a specific licensed feature over a given period.
 * Business Value: Offers critical insights into feature adoption and utilization,
 * informing product development, licensing models, and resource planning.
 * @param {string} featureName The name of the licensed feature.
 * @param {'daily' | 'monthly' | 'yearly'} period The period for which to retrieve usage.
 * @returns {Promise<any>} A promise resolving to the feature usage data.
 */
export async function getLicenseFeatureUsage(featureName: string, period: 'daily' | 'monthly' | 'yearly'): Promise<any> {
    try {
        return await _apiCall<any>(`/license/feature-usage/${featureName}?period=${period}`);
    } catch (error) {
        console.error(`Error fetching license feature usage for ${featureName} over ${period}:`, error);
        throw error;
    }
}

/**
 * Retrieves the Role-Based Access Control (RBAC) configuration for a specific role.
 * Business Value: Centralizes and exposes security configurations, allowing administrators
 * to review and manage the permissions granted to different user roles, ensuring secure access to resources.
 * @param {string} roleId The unique identifier of the role.
 * @returns {Promise<RBACRole>} A promise resolving to the RBAC role configuration.
 */
export async function getRoleBasedAccessConfiguration(roleId: string): Promise<RBACRole> {
    try {
        return await _apiCall<RBACRole>(`/admin/rbac/roles/${roleId}/config`);
    } catch (error) {
        console.error(`Error fetching RBAC configuration for role ${roleId}:`, error);
        throw error;
    }
}

/**
 * Updates the Role-Based Access Control (RBAC) configuration for a specific role.
 * Business Value: Enables dynamic adjustment of access policies, allowing organizations
 * to respond quickly to changing security requirements or organizational structures,
 * maintaining robust security posture.
 * @param {string} roleId The unique identifier of the role to update.
 * @param {object} config The updated RBAC configuration for the role.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the update.
 */
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

/**
 * Creates a new custom metric for monitoring purposes.
 * Business Value: Extends the observability of the system by allowing users to define
 * and track metrics specific to their business logic or operational needs, enhancing data-driven decision-making.
 * @param {object} metricDefinition The definition of the new custom metric.
 * @returns {Promise<{ success: boolean; metricId: string }>} A promise indicating success and providing the new metric ID.
 */
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

/**
 * Deletes an existing custom metric.
 * Business Value: Supports the lifecycle management of observability configurations,
 * allowing for removal of obsolete metrics and maintaining a clean monitoring environment.
 * @param {string} metricId The unique identifier of the custom metric to delete.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the deletion.
 */
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

/**
 * Retrieves real-time data for a specific dashboard within a given time range.
 * Business Value: Powers dynamic, live dashboards, providing immediate feedback on
 * critical system events and business KPIs, enabling agile operational responses.
 * @param {string} dashboardId The unique identifier of the dashboard.
 * @param {number} timeRangeSeconds The time range in seconds for which to fetch data.
 * @returns {Promise<any>} A promise resolving to the real-time dashboard data.
 */
export async function getRealtimeDashboardData(dashboardId: string, timeRangeSeconds: number): Promise<any> {
    try {
        return await _apiCall<any>(`/realtime/dashboards/${dashboardId}/data?range=${timeRangeSeconds}`);
    } catch (error) {
        console.error(`Error fetching real-time dashboard data for ${dashboardId}:`, error);
        throw error;
    }
}

/**
 * Subscribes to real-time updates for a specific dashboard via a callback mechanism.
 * Business Value: Enables external systems or clients to receive continuous updates
 * on dashboard metrics without constant polling, crucial for building reactive applications.
 * @param {string} dashboardId The unique identifier of the dashboard.
 * @param {string} callbackUrl The URL to which updates will be sent.
 * @returns {Promise<{ success: boolean; subscriptionId: string }>} A promise indicating success and providing a subscription ID.
 */
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

/**
 * Unsubscribes from real-time updates using a subscription ID.
 * Business Value: Provides control over active real-time data streams,
 * allowing for the efficient management of system resources and preventing unnecessary data transmission.
 * @param {string} subscriptionId The unique identifier of the subscription to cancel.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating the success of the unsubscription.
 */
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

/**
 * Fetches skills available to an AI agent based on its configuration.
 * Business Value: Enables dynamic agent capabilities, allowing agents to discover and utilize
 * new tools and functions as they become available, enhancing their autonomy and problem-solving abilities.
 * @param {string} agentId The ID of the agent.
 * @returns {Promise<AgentSkill[]>} A promise resolving to an array of AgentSkill objects.
 */
export async function fetchAgentSkills(agentId: string): Promise<AgentSkill[]> {
    try {
        return await _apiCall<AgentSkill[]>(`/agents/${agentId}/skills`);
    } catch (error) {
        console.error(`Error fetching skills for agent ${agentId}:`, error);
        throw error;
    }
}

/**
 * Updates the skills assigned to an AI agent.
 * Business Value: Provides flexible management of agent functionalities,
 * allowing administrators to quickly equip agents with new capabilities or revoke outdated ones,
 * adapting to evolving operational demands.
 * @param {string} agentId The ID of the agent.
 * @param {string[]} skillIds An array of skill IDs to assign.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating success.
 */
export async function updateAgentSkills(agentId: string, skillIds: string[]): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/agents/${agentId}/skills`, {
            method: 'PUT',
            body: { skillIds },
        });
    } catch (error) {
        console.error(`Error updating skills for agent ${agentId}:`, error);
        throw error;
    }
}

/**
 * Sends a message to an AI agent (or between agents).
 * Business Value: Facilitates inter-agent communication and human-to-agent interaction,
 * forming the backbone of the agentic AI orchestration layer for complex workflows.
 * @param {AgentMessage} message The message object to send.
 * @returns {Promise<{ success: boolean; messageId: string }>} A promise indicating success and the sent message's ID.
 */
export async function sendAgentMessage(message: AgentMessage): Promise<{ success: boolean; messageId: string }> {
    try {
        return await _apiCall<{ success: boolean; messageId: string }>(`/agents/messages`, {
            method: 'POST',
            body: message,
        });
    } catch (error) {
        console.error(`Error sending message from ${message.senderId} to ${message.recipientId}:`, error);
        throw error;
    }
}

/**
 * Fetches incoming messages for a specific agent.
 * Business Value: Enables agents to receive tasks, instructions, and insights from other agents or the system,
 * forming a core part of their autonomous monitor-decide-act loop.
 * @param {string} agentId The ID of the agent to fetch messages for.
 * @param {number} limit The maximum number of messages to retrieve.
 * @returns {Promise<AgentMessage[]>} A promise resolving to an array of incoming messages.
 */
export async function fetchAgentInbox(agentId: string, limit: number = 10): Promise<AgentMessage[]> {
    try {
        return await _apiCall<AgentMessage[]>(`/agents/${agentId}/inbox?limit=${limit}`);
    } catch (error) {
        console.error(`Error fetching inbox for agent ${agentId}:`, error);
        throw error;
    }
}

/**
 * Retrieves the full configuration of an AI agent.
 * Business Value: Provides complete transparency and auditability for agent deployments,
 * crucial for understanding their programmed behavior, governance, and resource consumption.
 * @param {string} agentId The unique identifier of the AI agent.
 * @returns {Promise<AgentConfiguration>} A promise resolving to the agent's full configuration.
 */
export async function getAgentConfiguration(agentId: string): Promise<AgentConfiguration> {
    try {
        return await _apiCall<AgentConfiguration>(`/admin/agents/${agentId}/config`);
    } catch (error) {
        console.error(`Error fetching configuration for agent ${agentId}:`, error);
        throw error;
    }
}

/**
 * Updates the configuration of an AI agent.
 * Business Value: Allows dynamic adjustments to an agent's behavior, preferences, and policies,
 * enabling administrators to fine-tune agent performance and align with evolving business rules.
 * @param {string} agentId The unique identifier of the AI agent.
 * @param {Partial<AgentConfiguration>} configUpdates Partial object with updates.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating success.
 */
export async function updateAgentConfiguration(agentId: string, configUpdates: Partial<AgentConfiguration>): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/agents/${agentId}/config`, {
            method: 'PATCH',
            body: configUpdates,
        });
    } catch (error) {
        console.error(`Error updating configuration for agent ${agentId}:`, error);
        throw error;
    }
}

/**
 * Fetches all defined RBAC roles in the system.
 * Business Value: Provides a comprehensive overview of the digital identity and authorization
 * framework, essential for managing user and agent permissions securely and efficiently.
 * @returns {Promise<RBACRole[]>} A promise resolving to an array of RBAC roles.
 */
export async function fetchAllRBACRoles(): Promise<RBACRole[]> {
    try {
        return await _apiCall<RBACRole[]>(`/admin/rbac/roles`);
    } catch (error) {
        console.error('Error fetching all RBAC roles:', error);
        throw error;
    }
}

/**
 * Creates a new RBAC role with specified permissions.
 * Business Value: Empowers administrators to define new security roles,
 * facilitating precise access control and compliance with organizational security policies.
 * @param {RBACRole} roleDefinition The definition of the new RBAC role.
 * @returns {Promise<{ success: boolean; roleId: string }>} A promise indicating success and the new role ID.
 */
export async function createRBACRole(roleDefinition: RBACRole): Promise<{ success: boolean; roleId: string }> {
    try {
        return await _apiCall<{ success: boolean; roleId: string }>(`/admin/rbac/roles`, {
            method: 'POST',
            body: roleDefinition,
        });
    } catch (error) {
        console.error('Error creating RBAC role:', error);
        throw error;
    }
}

/**
 * Assigns an RBAC role to a user or agent.
 * Business Value: Centralizes user/agent authorization management,
 * ensuring that all entities in the system operate with appropriate privileges,
 * critical for security and governance.
 * @param {string} entityId The ID of the user or agent.
 * @param {'user' | 'agent'} entityType The type of entity.
 * @param {string} roleId The ID of the role to assign.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating success.
 */
export async function assignRoleToEntity(entityId: string, entityType: 'user' | 'agent', roleId: string): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/rbac/assignments`, {
            method: 'POST',
            body: { entityId, entityType, roleId },
        });
    } catch (error) {
        console.error(`Error assigning role ${roleId} to ${entityType} ${entityId}:`, error);
        throw error;
    }
}

/**
 * Fetches token account details for a specific owner.
 * Business Value: Provides transparency and auditability for digital asset holdings,
 * essential for financial reconciliation and compliance within token rail operations.
 * @param {string} ownerId The ID of the account owner (User or Agent).
 * @returns {Promise<TokenAccount[]>} A promise resolving to an array of token accounts.
 */
export async function fetchTokenAccountsForOwner(ownerId: string): Promise<TokenAccount[]> {
    try {
        return await _apiCall<TokenAccount[]>(`/tokens/accounts?ownerId=${ownerId}`);
    } catch (error) {
        console.error(`Error fetching token accounts for owner ${ownerId}:`, error);
        throw error;
    }
}

/**
 * Initiates a token transaction between two accounts.
 * Business Value: Enables real-time value movement across the token rail,
 * forming the core of the payment infrastructure with guarantees for atomicity and idempotency.
 * @param {TokenTransaction} transactionDetails The details of the token transaction.
 * @returns {Promise<{ success: boolean; transactionId: string }>} A promise indicating success and the transaction ID.
 */
export async function initiateTokenTransaction(transactionDetails: TokenTransaction): Promise<{ success: boolean; transactionId: string }> {
    try {
        return await _apiCall<{ success: boolean; transactionId: string }>(`/tokens/transactions`, {
            method: 'POST',
            body: transactionDetails,
        });
    } catch (error) {
        console.error(`Error initiating token transaction:`, error);
        throw error;
    }
}

/**
 * Retrieves the status of a token transaction.
 * Business Value: Provides real-time tracking of payment settlement,
 * critical for financial operations, customer service, and reconciliation.
 * @param {string} transactionId The unique identifier of the transaction.
 * @returns {Promise<TokenTransaction>} A promise resolving to the transaction details.
 */
export async function getTokenTransactionStatus(transactionId: string): Promise<TokenTransaction> {
    try {
        return await _apiCall<TokenTransaction>(`/tokens/transactions/${transactionId}/status`);
    } catch (error) {
        console.error(`Error getting token transaction status for ${transactionId}:`, error);
        throw error;
    }
}

/**
 * Mints new tokens into a specified account.
 * Business Value: Controls the supply of stablecoin-style tokens,
 * enabling the digital asset economy and supporting liquidity management.
 * (Note: Should be highly restricted in a production system).
 * @param {string} accountId The account to mint tokens into.
 * @param {number} amount The amount of tokens to mint.
 * @param {string} currency The currency type.
 * @param {string} auditNotes Notes for the audit log.
 * @returns {Promise<{ success: boolean; newBalance: number }>} A promise indicating success and the new account balance.
 */
export async function mintTokens(accountId: string, amount: number, currency: string, auditNotes: string): Promise<{ success: boolean; newBalance: number }> {
    try {
        return await _apiCall<{ success: boolean; newBalance: number }>(`/admin/tokens/mint`, {
            method: 'POST',
            body: { accountId, amount, currency, auditNotes },
        });
    } catch (error) {
        console.error(`Error minting tokens for account ${accountId}:`, error);
        throw error;
    }
}

/**
 * Burns tokens from a specified account.
 * Business Value: Manages the supply of digital assets, allowing for controlled
 * reduction of tokens from circulation, typically used for regulatory or balancing purposes.
 * (Note: Should be highly restricted in a production system).
 * @param {string} accountId The account to burn tokens from.
 * @param {number} amount The amount of tokens to burn.
 * @param {string} currency The currency type.
 * @param {string} auditNotes Notes for the audit log.
 * @returns {Promise<{ success: boolean; newBalance: number }>} A promise indicating success and the new account balance.
 */
export async function burnTokens(accountId: string, amount: number, currency: string, auditNotes: string): Promise<{ success: boolean; newBalance: number }> {
    try {
        return await _apiCall<{ success: boolean; newBalance: number }>(`/admin/tokens/burn`, {
            method: 'POST',
            body: { accountId, amount, currency, auditNotes },
        });
    } catch (error) {
        console.error(`Error burning tokens from account ${accountId}:`, error);
        throw error;
    }
}

/**
 * Creates a new rule engine policy.
 * Business Value: Provides a flexible and powerful mechanism for defining dynamic
 * business logic for transaction processing, fraud detection, and multi-rail routing,
 * enabling agile adaptation to market conditions and regulatory changes.
 * @param {RuleEnginePolicy} policyDefinition The definition of the new policy.
 * @returns {Promise<{ success: boolean; policyId: string }>} A promise indicating success and the new policy ID.
 */
export async function createRuleEnginePolicy(policyDefinition: RuleEnginePolicy): Promise<{ success: boolean; policyId: string }> {
    try {
        return await _apiCall<{ success: boolean; policyId: string }>(`/admin/rule-engine/policies`, {
            method: 'POST',
            body: policyDefinition,
        });
    } catch (error) {
        console.error('Error creating rule engine policy:', error);
        throw error;
    }
}

/**
 * Updates an existing rule engine policy.
 * Business Value: Allows real-time modification of settlement rules, fraud detection logic,
 * or routing policies, critical for adapting to evolving threats or optimizing transaction flows.
 * @param {string} policyId The ID of the policy to update.
 * @param {Partial<RuleEnginePolicy>} policyUpdates Partial object with updates to the policy.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating success.
 */
export async function updateRuleEnginePolicy(policyId: string, policyUpdates: Partial<RuleEnginePolicy>): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/rule-engine/policies/${policyId}`, {
            method: 'PATCH',
            body: policyUpdates,
        });
    } catch (error) {
        console.error(`Error updating rule engine policy ${policyId}:`, error);
        throw error;
    }
}

/**
 * Submits a new payment request to the real-time settlement engine.
 * Business Value: Initiates the core function of the payments infrastructure,
 * orchestrating value movement across digital rails with speed and reliability.
 * @param {PaymentRequest} request The payment request details.
 * @returns {Promise<{ success: boolean; paymentId: string; transactionId?: string; status: string }>} A promise indicating success and relevant IDs.
 */
export async function submitPaymentRequest(request: PaymentRequest): Promise<{ success: boolean; paymentId: string; transactionId?: string; status: string }> {
    try {
        return await _apiCall<{ success: boolean; paymentId: string; transactionId?: string; status: string }>(`/payments/requests`, {
            method: 'POST',
            body: request,
        });
    } catch (error) {
        console.error(`Error submitting payment request ${request.paymentId}:`, error);
        throw error;
    }
}

/**
 * Retrieves the status of a payment request.
 * Business Value: Provides end-to-end visibility into the payment lifecycle,
 * from initiation through settlement, enabling effective tracking and customer communication.
 * @param {string} paymentId The unique identifier of the payment request.
 * @returns {Promise<PaymentRequest>} A promise resolving to the payment request status.
 */
export async function getPaymentRequestStatus(paymentId: string): Promise<PaymentRequest> {
    try {
        return await _apiCall<PaymentRequest>(`/payments/requests/${paymentId}/status`);
    } catch (error) {
        console.error(`Error fetching payment request status for ${paymentId}:`, error);
        throw error;
    }
}

/**
 * Fetches historical payment routing decisions and metrics for predictive routing.
 * Business Value: Fuels the AI-enhanced payment router by providing data for machine learning,
 * continuously optimizing rail selection for lowest cost, fastest settlement, or other policies.
 * @param {string} railType Optional filter for specific rails.
 * @param {number} limit The number of historical entries.
 * @returns {Promise<any[]>} A promise resolving to historical routing data.
 */
export async function fetchHistoricalRoutingData(railType?: string, limit: number = 50): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (railType) queryParams.append('railType', railType);
    queryParams.append('limit', String(limit));
    try {
        return await _apiCall<any[]>(`/payments/routing/history?${queryParams.toString()}`);
    } catch (error) {
        console.error('Error fetching historical routing data:', error);
        throw error;
    }
}

/**
 * Updates predictive routing parameters or policies.
 * Business Value: Allows administrators and AI models to continuously refine and improve
 * payment routing decisions, ensuring optimal performance and cost-efficiency of the payment rails.
 * @param {object} routingConfig Updates to the routing configuration.
 * @returns {Promise<{ success: boolean; message: string }>} A promise indicating success.
 */
export async function updatePredictiveRoutingConfig(routingConfig: object): Promise<{ success: boolean; message: string }> {
    try {
        return await _apiCall<{ success: boolean; message: string }>(`/admin/payments/routing/config`, {
            method: 'PUT',
            body: routingConfig,
        });
    } catch (error) {
        console.error('Error updating predictive routing configuration:', error);
        throw error;
    }
}

/**
 * Initiates a fraud detection analysis for a payment or transaction.
 * Business Value: Protects financial assets and complies with anti-fraud regulations by
 * leveraging AI to identify and flag suspicious transactions in real-time,
 * significantly reducing financial losses.
 * @param {string} entityId The ID of the payment or transaction.
 * @param {'payment' | 'transaction'} entityType The type of entity.
 * @param {object} context Additional context for fraud scoring.
 * @returns {Promise<{ success: boolean; fraudScore: number; flags: string[]; action: 'block' | 'flag' | 'allow' }>} A promise resolving to fraud detection results.
 */
export async function triggerFraudDetection(entityId: string, entityType: 'payment' | 'transaction', context: object): Promise<{ success: boolean; fraudScore: number; flags: string[]; action: 'block' | 'flag' | 'allow' }> {
    try {
        return await _apiCall<{ success: boolean; fraudScore: number; flags: string[]; action: 'block' | 'flag' | 'allow' }>(`/payments/fraud-detection`, {
            method: 'POST',
            body: { entityId, entityType, context },
        });
    } catch (error) {
        console.error(`Error triggering fraud detection for ${entityType} ${entityId}:`, error);
        throw error;
    }
}

/**
 * Fetches recent fraud alerts for review.
 * Business Value: Provides a dedicated workflow for security teams to review,
 * investigate, and resolve potentially fraudulent activities detected by the AI.
 * @param {number} limit The number of alerts to fetch.
 * @returns {Promise<ExtendedAIInsight[]>} A promise resolving to an array of fraud insights/alerts.
 */
export async function fetchRecentFraudAlerts(limit: number = 20): Promise<ExtendedAIInsight[]> {
    try {
        return await _apiCall<ExtendedAIInsight[]>(`/insights?type=fraud_detection&status=active&limit=${limit}`);
    } catch (error) {
        console.error('Error fetching recent fraud alerts:', error);
        throw error;
    }
}
```