// google/ai_studio/services/GeminiService.ts
// The Voice of the Oracle. The actual incantations used to speak to the great mind.

import { GoogleGenAI } from "@google/genai";

// Ensure API_KEY is handled securely in a real app, never hardcoded.
const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey });

// --- Core Data Models and Interfaces (Expanded Universe Foundation) ---

export type UserID = string;
export type SessionID = string;
export type ContextID = string;
export type KnowledgeGraphID = string;
export type AgentID = string;
export type ModelIdentifier = string; // e.g., 'gemini-2.5-flash', 'gemini-1.0-ultra-vision', 'custom-finetune-v3'
export type ToolIdentifier = string;
export type SkillIdentifier = string;
export type WorkflowID = string;
export type TensorData = Float32Array; // Placeholder for advanced data types
export type DataStreamID = string;
export type TelemetryEventID = string;
export type ResourceID = string;

export interface ILatencyMetrics {
    apiCallMs: number;
    processingMs: number;
    totalMs: number;
    queueMs?: number; // Time spent waiting in internal queues
    networkMs?: number; // Time for network transfer
}

export interface IUsageMetrics {
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
    computeUnits: number; // Abstract unit for compute resources
    memoryGbHours?: number; // Specific memory usage
    gpuHours?: number; // Specific GPU usage
}

export interface IMetadata {
    timestamp: string;
    source: string;
    correlationId?: string;
    tags: string[];
    originatingService?: string;
    clientIp?: string;
    userAgent?: string;
}

export interface IErrorDetail {
    code: string;
    message: string;
    stackTrace?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    details?: Record<string, any>;
}

export interface IServiceResponse<T> {
    data: T | null;
    success: boolean;
    errors: IErrorDetail[];
    metadata: IMetadata;
    metrics?: {
        latency: ILatencyMetrics;
        usage: IUsageMetrics;
    };
    warnings?: IErrorDetail[]; // For non-blocking issues
}

export enum Modality {
    Text = "text",
    Image = "image",
    Audio = "audio",
    Video = "video",
    Haptic = "haptic",
    Sensor = "sensor",
    _3D = "3d",
    BioSignal = "bio_signal",
    SemanticGraph = "semantic_graph",
    Code = "code",
    Numerical = "numerical",
    Tactile = "tactile",
    Programmatic = "programmatic", // For structured calls or API definitions
    Document = "document", // For entire document content with metadata
}

export interface IContentPart {
    type: Modality;
    value: string | ArrayBuffer | Blob | TensorData | object; // 'value' depends on type. e.g., text, base64 for image, raw bytes for audio, JSON for structured.
    mimeType?: string; // e.g., 'text/plain', 'image/jpeg', 'audio/wav', 'application/json'
    encoding?: string; // e.g., 'base64', 'utf-8', 'binary'
    description?: string; // For multimodal context
    embedding?: number[]; // Pre-computed embedding for this part
    language?: string; // For text/audio/code
    uri?: string; // For external content references (e.g., image URL)
    sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed'; // Per-part sentiment
    entities?: { text: string; type: string; }[]; // Extracted entities
}

export interface IAgentMessage {
    id: string; // Message ID for traceability
    role: 'user' | 'assistant' | 'system' | 'tool' | 'environment';
    content: IContentPart[];
    timestamp: string;
    metadata?: IMetadata;
    agentId?: AgentID; // If from a specific sub-agent
    toolUseId?: string; // If this message is a tool output or tool call
    parentId?: string; // For tracing conversation threads
    modelUsed?: ModelIdentifier;
    responseTimeMs?: number;
    safetyRatings?: ISafetySetting[]; // Post-hoc safety ratings for assistant responses
}

export interface IPromptSettings {
    temperature?: number; // Creativity vs. coherence (0.0 - 1.0)
    topK?: number;       // Nucleus sampling top-k
    topP?: number;       // Nucleus sampling top-p
    maxOutputTokens?: number;
    stopSequences?: string[];
    responseMimeType?: string; // e.g., 'application/json', 'text/markdown'
    safetySettings?: ISafetySetting[];
    enableStreaming?: boolean;
    customParameters?: Record<string, any>; // For experimental or custom model features
    enableFactualityChecks?: boolean; // Enable internal checks for factual accuracy
    enableGrounding?: boolean; // Enable grounding to specific knowledge bases (RAG)
    groundingSources?: ResourceID[]; // Specific documents/databases for grounding
    language?: string; // Target output language
    personaOverride?: string; // Temporarily override agent persona
    outputFormatSchema?: object; // JSON schema for desired output structure
    maxRetries?: number; // For self-correction loops
    retryStrategy?: 'rephrase' | 'change_model' | 'tool_retry';
}

export interface ISafetySetting {
    category: 'HARM_CATEGORY_HARASSMENT' | 'HARM_CATEGORY_HATE_SPEECH' | 'HARM_CATEGORY_SEXUALLY_EXPLICIT' | 'HARM_CATEGORY_DANGEROUS_CONTENT' | 'HARM_CATEGORY_UNSPECIFIED' | 'HARM_CATEGORY_POLICY_VIOLATION';
    threshold: 'BLOCK_NONE' | 'BLOCK_LOW_AND_ABOVE' | 'BLOCK_MEDIUM_AND_ABOVE' | 'BLOCK_HIGH_AND_ABOVE';
    action?: 'BLOCK' | 'FLAG' | 'LOG'; // What to do if threshold met
}

export interface IEmbeddingRequest {
    model: ModelIdentifier;
    content: IContentPart[];
    title?: string; // For document embeddings
    documentId?: string; // For document-level embeddings in a vector DB
    embeddingType?: 'query' | 'document' | 'semantic';
}

export interface IEmbeddingResponse {
    embedding: number[];
    metrics: IUsageMetrics;
}

export interface IToolDefinition {
    name: ToolIdentifier;
    description: string;
    inputSchema: object; // JSON schema for tool inputs
    outputSchema: object; // JSON schema for tool outputs
    asyncCapable?: boolean; // If tool can run asynchronously
    executionPermissions?: string[]; // RBAC for tool execution
    securityContext?: 'user' | 'system' | 'delegated'; // Context for tool execution
    rateLimit?: { callsPerMinute: number; } // Tool-specific rate limiting
    timeoutMs?: number; // Max execution time for tool
}

export interface IToolCall {
    toolName: ToolIdentifier;
    parameters: Record<string, any>;
    callId: string; // Unique ID for this specific tool call
    status?: 'pending' | 'executing' | 'completed' | 'failed' | 'timeout';
    result?: IContentPart[]; // Result from the tool execution
    error?: IErrorDetail;
    startTime?: string;
    endTime?: string;
}

export interface IToolResult {
    toolCallId: string;
    result: IContentPart[];
    metadata?: IMetadata;
    status: 'success' | 'failure';
    error?: IErrorDetail;
    latencyMs?: number;
}

export interface IMemoryRecord {
    id: string;
    timestamp: string;
    content: IContentPart[];
    embedding: number[];
    tags: string[];
    metadata?: IMetadata;
    recencyScore: number; // For retrieval algorithms
    relevanceScore: number;
    importanceScore: number;
    decayFactor: number; // How quickly this memory fades
    sourceOrigin?: string; // Where the memory originated (e.g., user input, agent observation, tool output)
    associations?: string[]; // IDs of other related memories
    retrievalCount?: number; // How often this memory has been retrieved
    lastRetrieved?: string;
}

export interface ISemanticRelationship {
    sourceNode: string;
    targetNode: string;
    type: string; // e.g., 'isA', 'hasPart', 'causes', 'relatedTo', 'implies'
    strength: number; // 0-1, confidence of the relationship
    metadata?: IMetadata;
    provenance?: string; // Source of the relationship (e.g., 'LLM_inferred', 'User_asserted', 'System_defined')
}

export interface IKnowledgeGraphNode {
    id: string;
    type: string; // e.g., 'Concept', 'Entity', 'Event', 'Action', 'Property'
    labels: string[]; // e.g., ['AI', 'Technology', 'Concept']
    properties: Record<string, any>; // Key-value pairs of attributes
    embedding?: number[];
    metadata?: IMetadata;
    version?: string; // For node versioning
    lastModified?: string;
}

export interface IKnowledgeGraph {
    id: KnowledgeGraphID;
    name: string;
    description: string;
    nodes: IKnowledgeGraphNode[];
    relationships: ISemanticRelationship[];
    lastUpdated: string;
    ownerId: UserID;
    accessPermissions: Record<UserID, 'read' | 'write' | 'admin'>;
    versionHistory?: { timestamp: string; changes: string; }[];
    autoUpdatePolicy?: 'manual' | 'scheduled' | 'event_driven'; // How KG is updated
}

export interface IAgentConfiguration {
    agentId: AgentID;
    name: string;
    description: string;
    persona: string; // Core personality/role
    goals: string[];
    initialPrompt: IContentPart[];
    memoryContextConfig: IMemoryContextConfig;
    toolAccessConfig: IToolAccessConfig;
    modelPreferences: IModelPreferences;
    skillset: SkillIdentifier[];
    autonomyLevel: 'low' | 'medium' | 'high' | 'full'; // How much supervision is needed
    reflectionFrequency?: 'always' | 'on_failure' | 'periodic' | 'never';
    metaCognitionEnabled?: boolean; // Agent can reason about its own thoughts
    selfCorrectionEnabled?: boolean;
    learningRate?: number; // For continuous learning modules
    resourceAllocationStrategy?: 'dynamic' | 'fixed_burst' | 'economy';
    trustScoreThreshold?: number; // For multi-agent collaboration
    failureRecoveryStrategy?: 'retry' | 'delegate' | 'escalate' | 'self_repair';
    communicationProtocols?: string[]; // e.g., 'fipa-acl', 'mqtt', 'grpc'
    cognitiveArchitecture?: 'react' | 'plan-and-execute' | 'graph-of-thoughts' | 'tree-of-thought'; // Underlying reasoning structure
    alignmentGoals?: string[]; // Ethical alignment goals
    rewardFunction?: object; // For RL agents
}

export interface IMemoryContextConfig {
    maxTokens: number;
    retrievalStrategy: 'semantic' | 'recency' | 'importance' | 'hybrid' | 'graph_traversal';
    vectorDatabaseId?: string; // ID of external vector DB
    knowledgeGraphIds?: KnowledgeGraphID[]; // IDs of integrated knowledge graphs
    longTermMemoryEnabled: boolean;
    shortTermMemorySpanMs?: number;
    ephemeralMemoryEnabled: boolean;
    maxEmbeddingsStored?: number; // Limits for long-term memory
    compressionStrategy?: 'summarize' | 'prune_old' | 'deduplicate'; // For managing memory size
    forgettingCurveParams?: { k: number; decayRate: number; }; // Simulate natural forgetting
}

export interface IToolAccessConfig {
    allowedTools: ToolIdentifier[];
    forbiddenTools: ToolIdentifier[];
    defaultExecutionMode: 'auto' | 'manual_approval' | 'system_override' | 'interactive_confirm';
    maxToolCallsPerTurn?: number;
    toolTimeoutMs?: number;
    toolUsageLogRetentionDays?: number;
    toolSelectionStrategy?: 'llm_choice' | 'rule_based' | 'hybrid';
}

export interface IModelPreferences {
    defaultModel: ModelIdentifier;
    fallbackModels: ModelIdentifier[];
    latencyToleranceMs?: number;
    costOptimizationPreference?: 'low_cost' | 'balanced' | 'high_performance';
    fineTuneId?: string; // Specific fine-tuned model version
    dataResidencyRequirements?: string[]; // e.g., 'EU', 'US'
    securityLevel?: 'standard' | 'enhanced' | 'confidential'; // For sensitive data processing
    modelWarmupStrategy?: 'on_demand' | 'pre_warm' | 'adaptive';
}

export interface IExecutionGraphNode {
    nodeId: string;
    type: 'tool_call' | 'llm_call' | 'decision_point' | 'data_transform' | 'human_in_loop' | 'sub_workflow' | 'parallel_execution';
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'waiting_for_approval';
    input: IContentPart[];
    output: IContentPart[];
    dependencies: string[]; // Other node IDs it depends on
    startTime?: string;
    endTime?: string;
    agentId?: AgentID; // If specific agent performed this step
    toolCall?: IToolCall;
    llmCallConfig?: IPromptSettings;
    humanApprovalNeeded?: boolean;
    metadata?: IMetadata;
    error?: IErrorDetail;
    branchCondition?: string; // For decision_point nodes
    subWorkflowId?: WorkflowID; // For sub_workflow nodes
    parallelNodes?: string[]; // For parallel_execution nodes
}

export interface IWorkflowDefinition {
    workflowId: WorkflowID;
    name: string;
    description: string;
    trigger: 'api_call' | 'schedule' | 'event_driven' | 'manual' | 'webhook';
    graph: IExecutionGraphNode[]; // Directed Acyclic Graph (DAG) of operations
    inputSchema: object;
    outputSchema: object;
    version: string;
    ownerId: UserID;
    permissions: Record<UserID, 'execute' | 'edit' | 'view'>;
    creationDate?: string;
    lastModifiedDate?: string;
    status: 'active' | 'inactive' | 'draft';
    costEstimate?: IUsageMetrics; // Estimated cost per run
}

export interface IMonitoringDashboard {
    dashboardId: string;
    name: string;
    metricsDisplayed: string[]; // e.g., 'latency', 'token_usage', 'error_rate', 'agent_activity', 'tool_failures'
    refreshRateSeconds: number;
    accessPermissions: Record<UserID, 'view' | 'edit'>;
    filters: Record<string, any>;
    layoutConfig?: object; // UI layout for the dashboard
    alertRules?: IAlertRule[];
}

export interface IAlertRule {
    ruleId: string;
    metric: string; // e.g., 'error_rate'
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    threshold: number;
    timeWindowSeconds: number; // e.g., trigger if metric exceeds threshold for 300 seconds
    severity: 'warning' | 'critical';
    alertRecipients: UserID[]; // Or notification channels
    action?: 'log' | 'notify' | 'auto_remediate';
}

export interface IPolicyDefinition {
    policyId: string;
    name: string;
    description: string;
    type: 'safety' | 'privacy' | 'access' | 'resource_governance' | 'ethical' | 'compliance';
    rules: object[]; // e.g., [{ condition: 'if content contains X', action: 'block' }] - often a DSL
    enforcementMode: 'monitor' | 'enforce' | 'audit' | 'suggest';
    priority: number;
    lastUpdated: string;
    effectiveDate?: string;
    version?: string;
    targetScopes?: ('llm_generation' | 'tool_execution' | 'data_ingestion' | 'agent_action')[];
}

export interface IAuditLogEntry {
    logId: string;
    timestamp: string;
    actor: UserID | AgentID | 'system';
    action: string; // e.g., 'call_llm', 'execute_tool', 'update_config', 'policy_violation', 'data_access'
    target: string; // e.g., 'GeminiService.generate', 'Agent:alpha', 'Workflow:task_automation', 'DataStore:customer_data'
    details: Record<string, any>;
    outcome: 'success' | 'failure' | 'warning';
    associatedErrors?: IErrorDetail[];
    metadata?: IMetadata;
    sessionId?: SessionID;
    transactionId?: string; // For distributed tracing
}

export interface IFeedbackEntry {
    feedbackId: string;
    timestamp: string;
    userId: UserID;
    sessionId: SessionID;
    messageId?: string; // Correlates to a specific AI response
    rating: number; // e.g., 1-5 stars, or -1 (bad) / 0 (neutral) / 1 (good)
    comment: string;
    category: 'relevance' | 'accuracy' | 'safety' | 'coherence' | 'helpfulness' | 'other' | 'bias';
    suggestedCorrection?: IContentPart[];
    metadata?: IMetadata;
    status: 'new' | 'reviewed' | 'actioned';
    priority: 'low' | 'medium' | 'high';
    assignedTo?: UserID;
}

export interface IModelTrainingConfig {
    trainingId: string;
    baseModel: ModelIdentifier;
    datasetId: string; // Reference to a dataset in a data catalog
    trainingMethod: 'fine_tuning' | 'prompt_engineering_optimization' | 'reinforcement_learning' | 'transfer_learning' | 'active_learning';
    hyperparameters: Record<string, any>;
    targetMetrics: Record<string, number>; // e.g., { 'accuracy': 0.95, 'latency_p90': 200 }
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
    startTime?: string;
    endTime?: string;
    outputModelId?: ModelIdentifier; // ID of the resulting fine-tuned model
    costEstimateUsd?: number;
    resourceConfig?: {
        gpuHours?: number;
        cpuHours?: number;
        memoryGb?: number;
        diskGb?: number;
    };
    evaluationResults?: object; // Metrics like F1, accuracy, perplexity
    pipelineId?: string; // Reference to the ML pipeline orchestrating this
    version?: string;
}

export interface IModelDeploymentConfig {
    deploymentId: string;
    modelId: ModelIdentifier;
    environment: 'development' | 'staging' | 'production' | 'edge';
    region: string;
    scalingPolicy: 'auto_scale' | 'fixed_instances' | 'serverless_dynamic';
    trafficSplit?: Record<ModelIdentifier, number>; // For A/B testing, canary deployments
    resourceAllocation: object; // e.g., GPU types, memory per instance
    monitoringDashboardId?: string;
    status: 'active' | 'inactive' | 'updating' | 'failed';
    lastUpdated: string;
    endpointUrl?: string;
    rollBackVersion?: string; // For easy rollback
    healthChecks?: object; // HTTP/model specific health checks
}

export interface IExperimentConfig {
    experimentId: string;
    name: string;
    description: string;
    type: 'ab_test' | 'multivariate' | 'bandit' | 'canary_release';
    hypothesis: string;
    variants: Array<{ name: string; config: Record<string, any>; trafficPercentage: number; }>;
    metricsToTrack: string[]; // e.g., 'conversion_rate', 'user_satisfaction', 'latency', 'cost'
    status: 'draft' | 'running' | 'completed' | 'paused';
    startTime?: string;
    endTime?: string;
    conclusion?: string;
    recommendations?: string[];
    analysisResults?: object;
    ownerId?: UserID;
}

export interface ITelemetryEvent {
    eventId: TelemetryEventID;
    timestamp: string;
    type: 'latency' | 'usage' | 'error' | 'lifecycle' | 'custom';
    source: string; // e.g., 'GeminiService', 'ToolManager', 'Agent:alpha'
    data: Record<string, any>;
    sessionId?: SessionID;
    userId?: UserID;
    correlationId?: string;
}


// --- Advanced Utility Classes and Managers ---

/**
 * Manages the generation of unique, globally-consistent IDs across the entire AI universe.
 * Supports various formats and ensures traceability.
 */
export class IDGenerator {
    private static counter: number = 0;
    private static readonly epoch: number = new Date('2023-01-01T00:00:00Z').getTime();

    public static generateUUID(prefix: string = 'id'): string {
        return `${prefix}-${crypto.randomUUID()}`;
    }

    public static generateTimeOrderedID(prefix: string = 'ts'): string {
        const timestamp = Date.now() - IDGenerator.epoch;
        IDGenerator.counter = (IDGenerator.counter + 1) % 1000000; // Reset every million to prevent overflow for small counter
        return `${prefix}-${timestamp.toString(36)}-${IDGenerator.counter.toString(36).padStart(6, '0')}`;
    }

    public static generateSemanticID(concept: string, context: string, salt: string = ''): string {
        const input = concept + context + salt;
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convert to 32bit integer
        }
        return `sem-${concept.replace(/\s+/g, '-').toLowerCase()}-${Math.abs(hash).toString(36)}`;
    }
}

/**
 * Centralized logging and auditing for all AI operations,
 * ensuring compliance, traceability, and debugging capabilities.
 */
export class AuditLogManager {
    private static logs: IAuditLogEntry[] = [];
    private static enabled: boolean = true; // Could be configurable
    private static logToConsole: boolean = process.env.NODE_ENV !== 'production'; // Log to console in dev

    public static enable(): void { this.enabled = true; }
    public static disable(): void { this.enabled = false; }
    public static setLogToConsole(value: boolean): void { this.logToConsole = value; }

    public static async log(entry: Partial<IAuditLogEntry>): Promise<void> {
        if (!this.enabled) return;

        const fullEntry: IAuditLogEntry = {
            logId: IDGenerator.generateTimeOrderedID('audit'),
            timestamp: new Date().toISOString(),
            actor: entry.actor || 'system',
            action: entry.action || 'unknown',
            target: entry.target || 'unknown',
            details: entry.details || {},
            outcome: entry.outcome || 'success',
            associatedErrors: entry.associatedErrors,
            metadata: entry.metadata || { timestamp: new Date().toISOString(), source: 'AuditLogManager', tags: ['audit'] },
            ...entry
        };
        this.logs.push(fullEntry);
        if (this.logToConsole) {
            console.log(`[AUDIT] ${fullEntry.timestamp} - ${fullEntry.actor} ${fullEntry.action} on ${fullEntry.target} (${fullEntry.outcome})`);
            if (fullEntry.associatedErrors && fullEntry.associatedErrors.length > 0) {
                console.error("[AUDIT ERROR]", fullEntry.associatedErrors);
            }
        }
        // In a real system, this would push to a distributed logging system (e.g., Google Cloud Logging, Splunk, ELK)
        // This could also trigger stream processing for real-time anomaly detection etc.
    }

    public static async getLogs(filter?: (entry: IAuditLogEntry) => boolean, limit: number = 100): Promise<IAuditLogEntry[]> {
        // Simulate retrieval from a persistent store, ordered by timestamp descending
        return this.logs.filter(filter || (() => true)).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
    }

    public static async streamLogs(filter?: (entry: IAuditLogEntry) => boolean): Promise<AsyncIterable<IAuditLogEntry>> {
        const self = this;
        async function* logStreamGenerator() {
            let lastIndex = self.logs.length;
            while (true) { // In a real system, this would be a subscription to a log stream
                if (self.logs.length > lastIndex) {
                    for (let i = lastIndex; i < self.logs.length; i++) {
                        const entry = self.logs[i];
                        if (!filter || filter(entry)) {
                            yield entry;
                        }
                    }
                    lastIndex = self.logs.length;
                }
                await new Promise(resolve => setTimeout(resolve, 100)); // Poll every 100ms
            }
        }
        return logStreamGenerator();
    }
}

/**
 * Manages the application and enforcement of security and ethical policies.
 */
export class PolicyEnforcementManager {
    private static policies: Map<string, IPolicyDefinition> = new Map();

    public static async registerPolicy(policy: IPolicyDefinition): Promise<void> {
        this.policies.set(policy.policyId, policy);
        await AuditLogManager.log({
            action: 'register_policy',
            target: `Policy:${policy.policyId}`,
            details: { name: policy.name, type: policy.type, enforcementMode: policy.enforcementMode }
        });
    }

    public static getPolicy(policyId: string): IPolicyDefinition | undefined {
        return this.policies.get(policyId);
    }

    public static async evaluateRequest(
        content: IContentPart[] | IAgentMessage | IToolCall,
        context: { userId?: UserID, sessionId?: SessionID, agentId?: AgentID, scope?: 'llm_generation' | 'tool_execution' | 'data_ingestion' | 'agent_action' }
    ): Promise<{ blocked: boolean, reasons: IErrorDetail[], warnings: IErrorDetail[] }> {
        const reasons: IErrorDetail[] = [];
        const warnings: IErrorDetail[] = [];
        let blocked = false;

        const policiesArray = Array.from(this.policies.values()).sort((a, b) => b.priority - a.priority); // Higher priority first

        for (const policy of policiesArray) {
            if (policy.targetScopes && context.scope && !policy.targetScopes.includes(context.scope)) {
                continue; // Policy doesn't apply to this scope
            }

            // Simplified policy evaluation - in reality this would be a sophisticated rule engine or external service
            const contentText = Array.isArray(content) ? (content as IContentPart[]).map(p => typeof p.value === 'string' ? p.value : '').join(' ') :
                                ('content' in content && Array.isArray(content.content)) ? (content as IAgentMessage).content.map(p => typeof p.value === 'string' ? p.value : '').join(' ') :
                                ('toolName' in content) ? `Tool call: ${content.toolName} with params: ${JSON.stringify(content.parameters)}` : '';

            // Example: simple keyword detection for safety
            if (policy.type === 'safety') {
                const dangerousKeywords = ['harmful content', 'illegal activity', 'private data leak']; // Example keywords
                if (dangerousKeywords.some(keyword => contentText.toLowerCase().includes(keyword))) {
                    const error: IErrorDetail = {
                        code: `POLICY_VIOLATION_${policy.policyId.toUpperCase()}`,
                        message: `Content violates safety policy '${policy.name}' due to detected keywords.`,
                        severity: 'critical',
                        details: { policyName: policy.name, keywordDetected: dangerousKeywords.find(keyword => contentText.toLowerCase().includes(keyword)) }
                    };
                    if (policy.enforcementMode === 'enforce') {
                        reasons.push(error);
                        blocked = true;
                    } else if (policy.enforcementMode === 'monitor' || policy.enforcementMode === 'audit') {
                        warnings.push({ ...error, severity: 'warning' });
                    }
                    await AuditLogManager.log({
                        action: 'policy_evaluation',
                        target: content instanceof Array ? 'Content' : ('id' in content ? `Message:${content.id}` : `ToolCall:${(content as IToolCall).callId}`),
                        outcome: blocked ? 'failure' : 'warning',
                        details: { policyId: policy.policyId, reason: error.message, enforcement: policy.enforcementMode, contentSnippet: contentText.substring(0, 100) },
                        associatedErrors: blocked ? [error] : []
                    });
                    if (blocked && policy.enforcementMode === 'enforce') return { blocked, reasons, warnings }; // Block immediately if enforced
                }
            }
            // Example: Data Privacy (e.g., PII detection)
            if (policy.type === 'privacy' && policy.rules.some((rule: any) => rule.type === 'PII_DETECTION')) {
                const piiPatterns = [/\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/, /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/]; // SSN, Email
                if (piiPatterns.some(pattern => pattern.test(contentText))) {
                    const error: IErrorDetail = {
                        code: `POLICY_VIOLATION_PII_${policy.policyId.toUpperCase()}`,
                        message: `Content violates privacy policy '${policy.name}' due to detected PII.`,
                        severity: 'high',
                        details: { policyName: policy.name, detected: 'PII' }
                    };
                    if (policy.enforcementMode === 'enforce') {
                        reasons.push(error);
                        blocked = true;
                    } else if (policy.enforcementMode === 'monitor' || policy.enforcementMode === 'audit') {
                        warnings.push({ ...error, severity: 'warning' });
                    }
                    await AuditLogManager.log({
                        action: 'policy_evaluation',
                        target: content instanceof Array ? 'Content' : ('id' in content ? `Message:${content.id}` : `ToolCall:${(content as IToolCall).callId}`),
                        outcome: blocked ? 'failure' : 'warning',
                        details: { policyId: policy.policyId, reason: error.message, enforcement: policy.enforcementMode, contentSnippet: contentText.substring(0, 100) },
                        associatedErrors: blocked ? [error] : []
                    });
                    if (blocked && policy.enforcementMode === 'enforce') return { blocked, reasons, warnings };
                }
            }
            // Add more policy types: resource_governance (e.g., cost limits), access (RBAC for actions), ethical.
        }
        return { blocked, reasons, warnings };
    }
}

/**
 * Handles all aspects of memory for agents and services,
 * from ephemeral working memory to long-term knowledge graphs.
 */
export class MemoryManager {
    private static shortTermMemories: Map<SessionID, IMemoryRecord[]> = new Map(); // Simple in-memory cache
    private static knowledgeGraphs: Map<KnowledgeGraphID, IKnowledgeGraph> = new Map();
    private static embeddingService: EmbeddingService; // Dependency injection for embedding

    constructor(embeddingService: EmbeddingService) {
        MemoryManager.embeddingService = embeddingService;
    }

    public static async storeEphemeralMemory(sessionId: SessionID, content: IContentPart[], tags: string[] = []): Promise<IMemoryRecord> {
        const textContent = content.map(p => typeof p.value === 'string' ? p.value : '').join(' ');
        const embedding = await MemoryManager.embeddingService.getEmbeddings({ model: 'text-embedding-004', content }).then(e => e.embedding);
        const record: IMemoryRecord = {
            id: IDGenerator.generateTimeOrderedID('mem'),
            timestamp: new Date().toISOString(),
            content,
            embedding,
            tags,
            recencyScore: 1.0, // New memories are highly recent
            relevanceScore: 0.5, // Default
            importanceScore: 0.5, // Default
            decayFactor: 0.001, // Gradual decay
        };
        if (!this.shortTermMemories.has(sessionId)) {
            this.shortTermMemories.set(sessionId, []);
        }
        this.shortTermMemories.get(sessionId)!.push(record);
        // Simulate decay / pruning for short-term memory (e.g., based on maxTokens or count)
        const maxMemoryCount = 100; // Configurable max records for simplicity
        if (this.shortTermMemories.get(sessionId)!.length > maxMemoryCount) {
            this.shortTermMemories.get(sessionId)!.shift(); // Remove oldest
        }
        await AuditLogManager.log({
            action: 'store_memory',
            target: `Session:${sessionId}`,
            details: { type: 'ephemeral', contentSnippet: textContent.substring(0, 50) }
        });
        return record;
    }

    public static async retrieveMemory(sessionId: SessionID, query: IContentPart[], config: IMemoryContextConfig, limit: number = 5): Promise<IMemoryRecord[]> {
        // This is highly simplified. A real system would use vector databases and graph traversal.
        const queryEmbedding = await MemoryManager.embeddingService.getEmbeddings({ model: 'text-embedding-004', content: query }).then(e => e.embedding);

        let relevantMemories: IMemoryRecord[] = [];

        // 1. Retrieve from short-term memory
        const sessionMemories = this.shortTermMemories.get(sessionId) || [];
        const scoredSessionMemories = sessionMemories.map(mem => ({
            ...mem,
            similarity: this._cosineSimilarity(queryEmbedding, mem.embedding),
            recencyScore: this._calculateRecencyScore(mem.timestamp), // Update recency dynamically
            importanceScore: mem.importanceScore * (1 - mem.decayFactor * ((Date.now() - new Date(mem.timestamp).getTime()) / 3600000)) // Decay importance over time (hourly)
        })).filter(mem => mem.similarity > 0.7); // Only consider memories above a similarity threshold
        relevantMemories.push(...scoredSessionMemories);

        // 2. Retrieve from knowledge graphs (simplified)
        for (const kgId of (config.knowledgeGraphIds || [])) {
            const kg = this.knowledgeGraphs.get(kgId);
            if (kg) {
                // Simulate keyword/semantic search on KG nodes
                const queryText = query.map(p => typeof p.value === 'string' ? p.value : '').join(' ').toLowerCase();
                const matchedNodes = kg.nodes.filter(node =>
                    node.labels.some(label => queryText.includes(label.toLowerCase())) ||
                    Object.values(node.properties).some(prop => typeof prop === 'string' && queryText.includes(prop.toLowerCase()))
                );
                // Convert KG nodes to IMemoryRecord format for consistency
                relevantMemories.push(...matchedNodes.map(node => {
                    const nodeContent: IContentPart[] = [{ type: Modality.Text, value: JSON.stringify(node.properties), mimeType: 'application/json' }];
                    if (node.labels.length > 0) nodeContent.unshift({ type: Modality.Text, value: `Labels: ${node.labels.join(', ')}` });
                    return {
                        id: node.id,
                        timestamp: node.lastModified || new Date().toISOString(),
                        content: nodeContent,
                        embedding: node.embedding || [], // Assume node might have embedding
                        tags: node.labels,
                        recencyScore: 0.1, // KG nodes are generally less 'recent' than session memory
                        relevanceScore: 0.8,
                        importanceScore: 0.8,
                        decayFactor: 0,
                        sourceOrigin: `knowledge_graph:${kgId}`,
                        metadata: node.metadata,
                    };
                }));
            }
        }

        // Apply hybrid scoring and limit
        relevantMemories = relevantMemories.sort((a, b) => {
            const scoreA = (a.relevanceScore * 0.6) + (a.recencyScore * 0.2) + (a.importanceScore * 0.2);
            const scoreB = (b.relevanceScore * 0.6) + (b.recencyScore * 0.2) + (b.importanceScore * 0.2);
            return scoreB - scoreA;
        }).slice(0, limit);

        await AuditLogManager.log({
            action: 'retrieve_memory',
            target: `Session:${sessionId}`,
            details: { strategy: config.retrievalStrategy, retrievedCount: relevantMemories.length, querySnippet: query.map(p => typeof p.value === 'string' ? p.value : '').join(' ').substring(0, 50) }
        });

        // Update retrieval metadata for retrieved memories
        for (const mem of relevantMemories) {
            mem.retrievalCount = (mem.retrievalCount || 0) + 1;
            mem.lastRetrieved = new Date().toISOString();
        }

        return relevantMemories;
    }

    private static _cosineSimilarity(vecA: number[], vecB: number[]): number {
        if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) return 0;
        const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
        const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
        const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
        if (magnitudeA === 0 || magnitudeB === 0) return 0;
        return dotProduct / (magnitudeA * magnitudeB);
    }

    private static _calculateRecencyScore(timestamp: string): number {
        const ageMs = Date.now() - new Date(timestamp).getTime();
        const oneHourMs = 3600000;
        const oneDayMs = 24 * oneHourMs;
        if (ageMs < oneHourMs) return 1.0;
        if (ageMs < oneDayMs) return 0.8;
        if (ageMs < 7 * oneDayMs) return 0.5;
        return 0.2; // Older memories get a lower score
    }

    public static async registerKnowledgeGraph(kg: IKnowledgeGraph): Promise<void> {
        this.knowledgeGraphs.set(kg.id, kg);
        await AuditLogManager.log({
            action: 'register_knowledge_graph',
            target: `KnowledgeGraph:${kg.id}`,
            details: { name: kg.name, nodeCount: kg.nodes.length, relationshipCount: kg.relationships.length }
        });
    }

    public static async updateMemoryImportance(memoryId: string, importance: number): Promise<void> {
        // For a real system, this would update a persistent memory store.
        for (const sessionMemories of this.shortTermMemories.values()) {
            const mem = sessionMemories.find(m => m.id === memoryId);
            if (mem) {
                mem.importanceScore = Math.max(0, Math.min(1, importance)); // Clamp between 0 and 1
                break;
            }
        }
        await AuditLogManager.log({
            action: 'update_memory_importance',
            target: `Memory:${memoryId}`,
            details: { newImportance: importance }
        });
    }

    public static async inferSemanticRelationships(sourceContent: IContentPart[], targetContent: IContentPart[], relationshipType: string, model: ModelIdentifier = 'gemini-1.5-pro'): Promise<ISemanticRelationship> {
        // This is a highly advanced feature: LLM inferring relationships
        const prompt: IContentPart[] = [
            { type: Modality.Text, value: `Analyze the following two content blocks. If they share a "${relationshipType}" relationship, confirm with a confidence score (0-1).` },
            { type: Modality.Text, value: `Content A: ${sourceContent.map(p => typeof p.value === 'string' ? p.value : '').join(' ').substring(0, 200)}` },
            { type: Modality.Text, value: `Content B: ${targetContent.map(p => typeof p.value === 'string' ? p.value : '').join(' ').substring(0, 200)}` },
            { type: Modality.Text, value: `Output JSON: { hasRelationship: boolean, confidence: number, explanation: string }` }
        ];

        const dummyGeminiService = new GeminiServiceUniverse(ai); // Use a dummy instance to avoid circular dependency for this specific call
        const response = await dummyGeminiService.generateContent(prompt, { model, settings: { responseMimeType: 'application/json', temperature: 0.3 } });

        let inferredData = { hasRelationship: false, confidence: 0, explanation: "Failed to infer" };
        if (response.success && response.data && response.data[0]?.type === Modality.Text) {
            try {
                inferredData = JSON.parse(response.data[0].value as string);
            } catch (e) {
                console.error("Failed to parse inferred relationship:", e);
            }
        }

        const relationship: ISemanticRelationship = {
            sourceNode: IDGenerator.generateSemanticID('content-a', new Date().toISOString()),
            targetNode: IDGenerator.generateSemanticID('content-b', new Date().toISOString()),
            type: relationshipType,
            strength: inferredData.hasRelationship ? inferredData.confidence : 0,
            provenance: 'LLM_inferred',
            metadata: { timestamp: new Date().toISOString(), source: 'MemoryManager', tags: ['semantic_inference'] }
        };

        await AuditLogManager.log({
            action: 'infer_semantic_relationship',
            target: `Relationship:${relationshipType}`,
            details: { confidence: relationship.strength, explanation: inferredData.explanation }
        });

        return relationship;
    }
}

/**
 * Manages the definition, registration, and execution of external tools/functions.
 */
export class ToolManager {
    private static registeredTools: Map<ToolIdentifier, IToolDefinition> = new Map();
    private static toolImplementations: Map<ToolIdentifier, (params: Record<string, any>, context?: { userId?: UserID, sessionId?: SessionID }) => Promise<IContentPart[]>> = new Map();

    public static async registerTool(definition: IToolDefinition, implementation: (params: Record<string, any>, context?: { userId?: UserID, sessionId?: SessionID }) => Promise<IContentPart[]>): Promise<void> {
        if (this.registeredTools.has(definition.name)) {
            throw new Error(`Tool with name '${definition.name}' already registered.`);
        }
        this.registeredTools.set(definition.name, definition);
        this.toolImplementations.set(definition.name, implementation);
        await AuditLogManager.log({
            action: 'register_tool',
            target: `Tool:${definition.name}`,
            details: { description: definition.description, inputSchema: definition.inputSchema }
        });
    }

    public static getToolDefinition(name: ToolIdentifier): IToolDefinition | undefined {
        return this.registeredTools.get(name);
    }

    public static getAllToolDefinitions(): IToolDefinition[] {
        return Array.from(this.registeredTools.values());
    }

    public static async executeTool(toolCall: IToolCall, context: { userId?: UserID, sessionId?: SessionID } = {}): Promise<IToolResult> {
        const startTime = Date.now();
        const toolDefinition = this.registeredTools.get(toolCall.toolName);
        const toolImpl = this.toolImplementations.get(toolCall.toolName);
        const userId = context.userId || 'system';

        if (!toolDefinition || !toolImpl) {
            const error: IErrorDetail = { code: 'TOOL_NOT_FOUND', message: `Tool '${toolCall.toolName}' not found.`, severity: 'high' };
            await AuditLogManager.log({
                action: 'execute_tool',
                target: `Tool:${toolCall.toolName}`,
                actor: userId,
                outcome: 'failure',
                details: { toolCallId: toolCall.callId, parameters: toolCall.parameters },
                associatedErrors: [error],
                sessionId: context.sessionId
            });
            return { toolCallId: toolCall.callId, result: [{ type: Modality.Text, value: `Error: ${error.message}` }], metadata: { timestamp: new Date().toISOString(), source: 'ToolManager' }, status: 'failure', error };
        }

        // Policy enforcement pre-check for tool execution
        const policyCheck = await PolicyEnforcementManager.evaluateRequest(toolCall, { ...context, scope: 'tool_execution' });
        if (policyCheck.blocked) {
            const error: IErrorDetail = { code: 'POLICY_BLOCKED_TOOL', message: `Tool call blocked by policy: ${policyCheck.reasons[0].message}`, severity: 'high' };
            return { toolCallId: toolCall.callId, result: [{ type: Modality.Text, value: `Error: ${error.message}` }], metadata: { timestamp: new Date().toISOString(), source: 'PolicyEnforcement' }, status: 'failure', error };
        }
        if (policyCheck.warnings.length > 0) {
            console.warn(`[POLICY WARNING] Tool call to ${toolCall.toolName} triggered warnings:`, policyCheck.warnings);
        }

        // Basic permission check (can be expanded with RBAC from UserManager)
        if (!toolDefinition.executionPermissions?.includes(userId) && userId !== 'system' && toolDefinition.securityContext !== 'system') {
            const error: IErrorDetail = { code: 'PERMISSION_DENIED', message: `User '${userId}' does not have permission to execute tool '${toolCall.toolName}'.`, severity: 'high' };
            await AuditLogManager.log({
                action: 'execute_tool',
                target: `Tool:${toolCall.toolName}`,
                actor: userId,
                outcome: 'failure',
                details: { toolCallId: toolCall.callId, parameters: toolCall.parameters },
                associatedErrors: [error],
                sessionId: context.sessionId
            });
            return { toolCallId: toolCall.callId, result: [{ type: Modality.Text, value: `Error: ${error.message}` }], metadata: { timestamp: new Date().toISOString(), source: 'ToolManager' }, status: 'failure', error };
        }

        try {
            await AuditLogManager.log({
                action: 'execute_tool_start',
                target: `Tool:${toolCall.toolName}`,
                actor: userId,
                details: { toolCallId: toolCall.callId, parameters: toolCall.parameters },
                sessionId: context.sessionId
            });

            // Simulate timeout
            const executionPromise = toolImpl(toolCall.parameters, context);
            const timeoutMs = toolDefinition.timeoutMs || 30000; // Default 30s timeout
            const timeoutPromise = new Promise<IContentPart[]>((_, reject) =>
                setTimeout(() => reject(new Error(`Tool execution timed out after ${timeoutMs}ms`)), timeoutMs)
            );

            const result = await Promise.race([executionPromise, timeoutPromise]);
            const latencyMs = Date.now() - startTime;

            await AuditLogManager.log({
                action: 'execute_tool_complete',
                target: `Tool:${toolCall.toolName}`,
                actor: userId,
                outcome: 'success',
                details: { toolCallId: toolCall.callId, resultSnippet: result.map(p => typeof p.value === 'string' ? p.value : '').join(' ').substring(0, 50), latencyMs },
                sessionId: context.sessionId
            });
            return { toolCallId: toolCall.callId, result, metadata: { timestamp: new Date().toISOString(), source: 'ToolManager' }, status: 'success', latencyMs };
        } catch (e: any) {
            const latencyMs = Date.now() - startTime;
            const error: IErrorDetail = { code: 'TOOL_EXECUTION_FAILED', message: `Tool '${toolCall.toolName}' failed: ${e.message}`, stackTrace: e.stack, severity: 'critical' };
            await AuditLogManager.log({
                action: 'execute_tool_complete',
                target: `Tool:${toolCall.toolName}`,
                actor: userId,
                outcome: 'failure',
                details: { toolCallId: toolCall.callId, parameters: toolCall.parameters, latencyMs },
                associatedErrors: [error],
                sessionId: context.sessionId
            });
            return { toolCallId: toolCall.callId, result: [{ type: Modality.Text, value: `Error executing tool: ${e.message}` }], metadata: { timestamp: new Date().toISOString(), source: 'ToolManager' }, status: 'failure', error, latencyMs };
        }
    }

    // Example of a built-in tool: Calculator
    public static async registerBuiltInTools(): Promise<void> {
        await this.registerTool({
            name: 'calculator',
            description: 'Performs basic arithmetic operations.',
            inputSchema: {
                type: 'object',
                properties: {
                    operation: { type: 'string', enum: ['add', 'subtract', 'multiply', 'divide'] },
                    num1: { type: 'number' },
                    num2: { type: 'number' }
                },
                required: ['operation', 'num1', 'num2']
            },
            outputSchema: { type: 'object', properties: { result: { type: 'number' } } },
            securityContext: 'system',
            executionPermissions: ['system', 'user-123']
        }, async (params: Record<string, any>): Promise<IContentPart[]> => {
            const { operation, num1, num2 } = params;
            let result: number;
            switch (operation) {
                case 'add': result = num1 + num2; break;
                case 'subtract': result = num1 - num2; break;
                case 'multiply': result = num1 * num2; break;
                case 'divide':
                    if (num2 === 0) throw new Error("Division by zero");
                    result = num1 / num2; break;
                default: throw new Error(`Unknown operation: ${operation}`);
            }
            return [{ type: Modality.Text, value: `Calculation result: ${result}`, mimeType: 'text/plain' }];
        });

        // Example: Web Search Tool
        await this.registerTool({
            name: 'web_search',
            description: 'Performs a web search and returns relevant snippets.',
            inputSchema: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: 'The search query.' },
                    numResults: { type: 'integer', default: 3, description: 'Number of search results to return.' },
                    language: { type: 'string', default: 'en', description: 'Search result language.' }
                },
                required: ['query']
            },
            outputSchema: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        url: { type: 'string' },
                        snippet: { type: 'string' }
                    }
                }
            },
            asyncCapable: true,
            securityContext: 'system',
            executionPermissions: ['system', 'user-123']
        }, async (params: Record<string, any>): Promise<IContentPart[]> => {
            // Simulate a web search API call
            console.log(`[TOOL] Performing web search for: ${params.query} (lang: ${params.language})`);
            const mockSearchResults = [
                { title: `Result 1 for "${params.query}"`, url: `http://example.com/r1-${encodeURIComponent(params.query)}`, snippet: `This is a snippet from the first result about ${params.query}.` },
                { title: `Result 2 for "${params.query}"`, url: `http://example.com/r2-${encodeURIComponent(params.query)}`, snippet: `Another snippet, perhaps with more details on ${params.query}.` },
                { title: `Result 3 for "${params.query}"`, url: `http://example.com/r3-${encodeURIComponent(params.query)}`, snippet: `The final snippet providing context for ${params.query}.` },
            ];
            const results = mockSearchResults.slice(0, params.numResults || 3);
            return [{ type: Modality.Text, value: JSON.stringify(results), mimeType: 'application/json', description: 'Web search results' }];
        });

        // Example: Data Query Tool
        await this.registerTool({
            name: 'data_query',
            description: 'Queries a structured database or data lake using natural language.',
            inputSchema: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: 'Natural language query for the data.' },
                    datasetId: { type: 'string', description: 'Identifier for the dataset to query.' },
                    format: { type: 'string', enum: ['json', 'csv', 'table'], default: 'json' },
                    filters: { type: 'object', description: 'Optional filters for the query.' }
                },
                required: ['query', 'datasetId']
            },
            outputSchema: { type: 'object' }, // Output schema depends on query result
            securityContext: 'delegated', // Requires user context for data access
            executionPermissions: ['user-123']
        }, async (params: Record<string, any>, context?: { userId?: UserID }): Promise<IContentPart[]> => {
            console.log(`[TOOL] User ${context?.userId} querying dataset ${params.datasetId} with: ${params.query}`);
            // Simulate data query and return JSON based on query and filters
            const mockData = [{ id: 1, name: "Item A", value: 100 }, { id: 2, name: "Item B", value: 150 }];
            const filteredData = params.filters ? mockData.filter(item => { /* complex filter logic */ return true; }) : mockData;
            return [{ type: Modality.Text, value: JSON.stringify(filteredData), mimeType: 'application/json', description: 'Query results from dataset.' }];
        });

        // Hypothetical Code Interpreter Tool for Copilot
        await this.registerTool({
            name: 'code_interpreter',
            description: 'Executes or analyzes code snippets in various languages.',
            inputSchema: {
                type: 'object',
                properties: {
                    code: { type: 'string', description: 'The code snippet to interpret/analyze.' },
                    language: { type: 'string', description: 'Programming language (e.g., "python", "typescript").' },
                    action: { type: 'string', enum: ['execute', 'lint', 'test', 'compile', 'debug'], description: 'Action to perform.' },
                    environment: { type: 'string', description: 'Execution environment/sandbox configuration.' }
                },
                required: ['code', 'language', 'action']
            },
            outputSchema: {
                type: 'object',
                properties: {
                    output: { type: 'string' },
                    errors: { type: 'string' },
                    status: { type: 'string' }
                }
            },
            securityContext: 'system', // Often runs in an isolated sandbox
            timeoutMs: 60000 // Longer timeout for code execution
        }, async (params: Record<string, any>): Promise<IContentPart[]> => {
            console.log(`[TOOL] Code Interpreter: ${params.action} ${params.language} code.`);
            // Simulate code execution/analysis
            let output = '';
            let errors = '';
            let status = 'success';

            try {
                switch (params.action) {
                    case 'execute':
                        output = `Simulated execution of ${params.language} code. Result: 42`;
                        break;
                    case 'lint':
                        output = `Simulated linting of ${params.language} code. No issues found.`;
                        break;
                    case 'test':
                        if (params.code.includes('fail test')) { // Simple mock failure
                            errors = "Test failed: Assertion error.";
                            status = 'failure';
                        } else {
                            output = `Simulated testing of ${params.language} code. All tests passed.`;
                        }
                        break;
                    case 'compile':
                        output = `Simulated compilation of ${params.language} code. Success.`;
                        break;
                    case 'debug':
                        output = `Simulated debugging of ${params.language} code. Found potential issue at line 10.`;
                        break;
                    default:
                        throw new Error(`Unknown code action: ${params.action}`);
                }
            } catch (e: any) {
                errors = `Interpreter error: ${e.message}`;
                status = 'failure';
            }

            return [{ type: Modality.Text, value: JSON.stringify({ output, errors, status }), mimeType: 'application/json' }];
        });
    }
}

/**
 * Manages all aspects of multi-agent orchestration and collaboration.
 */
export class AgentOrchestrator {
    private static registeredAgents: Map<AgentID, IAgentConfiguration> = new Map();
    private static activeSessions: Map<SessionID, AgentID[]> = new Map(); // Session -> active agents

    public static async registerAgent(config: IAgentConfiguration): Promise<void> {
        this.registeredAgents.set(config.agentId, config);
        await AuditLogManager.log({
            action: 'register_agent',
            target: `Agent:${config.agentId}`,
            details: { name: config.name, persona: config.persona, skillset: config.skillset }
        });
    }

    public static getAgentConfig(agentId: AgentID): IAgentConfiguration | undefined {
        return this.registeredAgents.get(agentId);
    }

    public static getAllAgentConfigs(): IAgentConfiguration[] {
        return Array.from(this.registeredAgents.values());
    }

    public static async activateAgentSession(sessionId: SessionID, agentId: AgentID): Promise<void> {
        if (!this.registeredAgents.has(agentId)) {
            throw new Error(`Agent '${agentId}' not registered.`);
        }
        if (!this.activeSessions.has(sessionId)) {
            this.activeSessions.set(sessionId, []);
        }
        if (!this.activeSessions.get(sessionId)!.includes(agentId)) {
            this.activeSessions.get(sessionId)!.push(agentId);
        }
        await AuditLogManager.log({
            action: 'activate_agent_session',
            target: `Session:${sessionId}`,
            details: { agentId: agentId }
        });
    }

    public static async deactivateAgentSession(sessionId: SessionID, agentId: AgentID): Promise<void> {
        const agentsInSession = this.activeSessions.get(sessionId);
        if (agentsInSession) {
            this.activeSessions.set(sessionId, agentsInSession.filter(id => id !== agentId));
        }
        await AuditLogManager.log({
            action: 'deactivate_agent_session',
            target: `Session:${sessionId}`,
            details: { agentId: agentId }
        });
    }

    /**
     * Orchestrates a multi-agent conversation or task execution.
     * This is a highly complex, iterative process in reality, often involving a meta-agent.
     */
    public static async orchestrateMultiAgentTask(
        sessionId: SessionID,
        initialPrompt: IContentPart[],
        agentsToInvolve: AgentID[],
        maxTurns: number = 10,
        userId: UserID = 'user'
    ): Promise<IServiceResponse<IAgentMessage[]>> {
        let conversationHistory: IAgentMessage[] = [{
            id: IDGenerator.generateTimeOrderedID('msg'),
            role: 'user',
            content: initialPrompt,
            timestamp: new Date().toISOString(),
            metadata: { timestamp: new Date().toISOString(), source: 'AgentOrchestrator', tags: ['user_input'] },
            agentId: userId
        }];
        let currentAgents = new Set(agentsToInvolve);
        let turn = 0;
        let finalResponse: IAgentMessage[] = [];
        const agentConversationTracker: Map<AgentID, IAgentMessage[]> = new Map(); // Each agent's view of conversation

        await AuditLogManager.log({
            action: 'orchestrate_multi_agent_task_start',
            target: `Session:${sessionId}`,
            actor: userId,
            details: { agents: agentsToInvolve, initialPrompt: initialPrompt.map(p => typeof p.value === 'string' ? p.value : '').join(' ').substring(0, 100) },
            sessionId
        });

        // Create an instance of the full GeminiServiceUniverse for agents to use
        const coreGeminiService = new GeminiServiceUniverse(ai);

        while (turn < maxTurns && currentAgents.size > 0) {
            const activeAgentsArray = Array.from(currentAgents);
            const nextAgentId = activeAgentsArray[turn % activeAgentsArray.length]; // Simple round-robin

            const agentConfig = this.getAgentConfig(nextAgentId);
            if (!agentConfig) {
                console.warn(`Skipping unknown agent: ${nextAgentId}`);
                currentAgents.delete(nextAgentId);
                continue;
            }

            // Provide agent with its filtered/summarized view of the history
            const agentHistory = agentConversationTracker.get(nextAgentId) || conversationHistory; // For simplicity, full history for now

            // Agent generates response using the core GeminiService
            const agentResponse = await coreGeminiService.converse(
                sessionId,
                nextAgentId,
                agentHistory,
                { ...agentConfig.modelPreferences, ...agentConfig.memoryContextConfig, ...agentConfig.toolAccessConfig, userId }
            );

            if (agentResponse.success && agentResponse.data) {
                const responseMessage = agentResponse.data;
                conversationHistory.push(responseMessage); // Add to global history
                agentConversationTracker.set(nextAgentId, [...agentHistory, responseMessage]); // Update agent's own history

                await AuditLogManager.log({
                    action: 'agent_turn_complete',
                    target: `Agent:${nextAgentId}`,
                    actor: nextAgentId,
                    outcome: 'success',
                    details: { turn, messageSnippet: responseMessage.content.map(p => typeof p.value === 'string' ? p.value : '').join(' ').substring(0, 100) },
                    sessionId
                });

                if (responseMessage.content.some(part => part.type === Modality.Text && (part.value as string).toLowerCase().includes("task completed"))) {
                    finalResponse = [responseMessage];
                    break; // Agent signals task completion
                }

                // Advanced decision logic: meta-agent could decide next agent, or agents can nominate successors
                // For simplicity, agents continue taking turns until task is done or max turns reached.
                if (agentResponse.data.toolUseId && agentResponse.data.content.some(p => p.type === Modality.Code && (p.value as string).includes("tool_code"))) {
                    // This implies the agent suggested a tool. The orchestrator would typically execute it
                    // For now, assume the converse method handles tool execution and returns the result.
                }

            } else {
                console.error(`Agent ${nextAgentId} failed:`, agentResponse.errors);
                currentAgents.delete(nextAgentId); // Remove failing agent from active set
                await AuditLogManager.log({
                    action: 'agent_turn_failed',
                    target: `Agent:${nextAgentId}`,
                    actor: nextAgentId,
                    outcome: 'failure',
                    details: { turn, error: agentResponse.errors[0]?.message },
                    associatedErrors: agentResponse.errors,
                    sessionId
                });
            }
            turn++;
        }

        await AuditLogManager.log({
            action: 'orchestrate_multi_agent_task_complete',
            target: `Session:${sessionId}`,
            actor: userId,
            outcome: finalResponse.length > 0 ? 'success' : 'failure',
            details: { totalTurns: turn, finalMessageSnippet: finalResponse.map(p => typeof p.value === 'string' ? p.value : '').join(' ').substring(0, 100) },
            sessionId
        });

        return {
            data: finalResponse.length > 0 ? finalResponse : conversationHistory,
            success: finalResponse.length > 0,
            errors: finalResponse.length > 0 ? [] : [{ code: 'MULTI_AGENT_TASK_FAILED', message: 'Task could not be completed by agents within max turns.', severity: 'medium' }],
            metadata: { timestamp: new Date().toISOString(), source: 'AgentOrchestrator', tags: ['multi-agent'], correlationId: sessionId },
            warnings: []
        };
    }
}

/**
 * Manages dynamic model routing, A/B testing, and deployment strategies.
 */
export class ModelDeploymentManager {
    private static deployments: Map<ModelIdentifier, IModelDeploymentConfig> = new Map();
    private static experiments: Map<string, IExperimentConfig> = new Map();

    public static async registerDeployment(config: IModelDeploymentConfig): Promise<void> {
        this.deployments.set(config.modelId, config);
        await AuditLogManager.log({
            action: 'register_model_deployment',
            target: `ModelDeployment:${config.deploymentId}`,
            details: { modelId: config.modelId, environment: config.environment, region: config.region }
        });
    }

    public static getDeployment(modelId: ModelIdentifier): IModelDeploymentConfig | undefined {
        return this.deployments.get(modelId);
    }

    public static async routeModelCall(
        preferredModelId: ModelIdentifier,
        context: { userId?: UserID, sessionId?: SessionID, experimentId?: string, costOptimizationPreference?: 'low_cost' | 'balanced' | 'high_performance', latencyToleranceMs?: number }
    ): Promise<ModelIdentifier> {
        // 1. Check for active experiment
        if (context.experimentId && this.experiments.has(context.experimentId)) {
            const experiment = this.experiments.get(context.experimentId)!;
            if (experiment.status === 'running') {
                // Advanced A/B routing: hash user ID or session ID to distribute traffic
                const hash = (parseInt(context.userId?.replace(/\D/g, '') || context.sessionId?.replace(/\D/g, '') || '0') % 100);
                let cumulativePercentage = 0;
                for (const variant of experiment.variants) {
                    cumulativePercentage += variant.trafficPercentage;
                    if (hash < cumulativePercentage) {
                        await AuditLogManager.log({
                            action: 'route_model_call',
                            target: 'ModelRouter',
                            details: { reason: 'experiment', experimentId: experiment.experimentId, variant: variant.name, chosenModel: variant.config.modelId },
                            sessionId: context.sessionId, userId: context.userId
                        });
                        return variant.config.modelId as ModelIdentifier;
                    }
                }
            }
        }

        // 2. Check for specific deployment configuration for preferred model
        const deployment = this.deployments.get(preferredModelId);
        if (deployment && deployment.status === 'active') {
            // Implement traffic splitting here (e.g., canary deployments, A/B for specific users)
            if (deployment.trafficSplit) {
                const totalWeight = Object.values(deployment.trafficSplit).reduce((sum, weight) => sum + weight, 0);
                let random = Math.random() * totalWeight;
                for (const [model, weight] of Object.entries(deployment.trafficSplit)) {
                    random -= weight;
                    if (random <= 0) {
                        await AuditLogManager.log({
                            action: 'route_model_call',
                            target: 'ModelRouter',
                            details: { reason: 'traffic_split', baseModel: preferredModelId, chosenModel: model },
                            sessionId: context.sessionId, userId: context.userId
                        });
                        return model as ModelIdentifier;
                    }
                }
            }
            // Add logic for cost/latency optimization if provided in context
            if (context.costOptimizationPreference === 'low_cost' && deployment.modelId !== 'gemini-2.5-flash') {
                 // Example: if low cost preferred, and not already flash, maybe switch
                const flashDeployment = this.deployments.get('gemini-2.5-flash'); // Assume flash is cheapest
                if (flashDeployment && flashDeployment.status === 'active') {
                    await AuditLogManager.log({
                        action: 'route_model_call',
                        target: 'ModelRouter',
                        details: { reason: 'cost_optimization', originalModel: preferredModelId, chosenModel: 'gemini-2.5-flash' },
                        sessionId: context.sessionId, userId: context.userId
                    });
                    return 'gemini-2.5-flash';
                }
            }
            await AuditLogManager.log({
                action: 'route_model_call',
                target: 'ModelRouter',
                details: { reason: 'direct_deployment', chosenModel: preferredModelId },
                sessionId: context.sessionId, userId: context.userId
            });
            return preferredModelId; // No traffic split, or it fell through
        }

        // 3. Fallback to default or globally configured model
        const defaultModel = process.env.DEFAULT_GEMINI_MODEL || 'gemini-1.5-pro'; // Or a more sophisticated global config
        await AuditLogManager.log({
            action: 'route_model_call',
            target: 'ModelRouter',
            details: { reason: 'fallback_to_default', chosenModel: defaultModel },
            sessionId: context.sessionId, userId: context.userId
        });
        return defaultModel;
    }

    public static async startExperiment(config: IExperimentConfig): Promise<void> {
        if (this.experiments.has(config.experimentId)) {
            throw new Error(`Experiment '${config.experimentId}' already exists.`);
        }
        this.experiments.set(config.experimentId, { ...config, status: 'running', startTime: new Date().toISOString() });
        await AuditLogManager.log({
            action: 'start_experiment',
            target: `Experiment:${config.experimentId}`,
            details: { name: config.name, variants: config.variants.length }
        });
    }

    public static async concludeExperiment(experimentId: string, conclusion: string, recommendations: string[]): Promise<void> {
        const experiment = this.experiments.get(experimentId);
        if (experiment) {
            experiment.status = 'completed';
            experiment.endTime = new Date().toISOString();
            experiment.conclusion = conclusion;
            experiment.recommendations = recommendations;
            await AuditLogManager.log({
                action: 'conclude_experiment',
                target: `Experiment:${experimentId}`,
                details: { conclusion: conclusion }
            });
        }
    }
}

/**
 * Manages the training and lifecycle of custom fine-tuned models.
 */
export class ModelTrainingManager {
    private static trainingJobs: Map<string, IModelTrainingConfig> = new Map();

    public static async submitTrainingJob(config: IModelTrainingConfig): Promise<string> {
        const trainingId = IDGenerator.generateTimeOrderedID('train');
        this.trainingJobs.set(trainingId, { ...config, trainingId, status: 'pending', startTime: new Date().toISOString() });
        // In a real system, this would trigger an actual training pipeline (e.g., Vertex AI, custom ML infra)
        // Simulate completion for now
        setTimeout(async () => {
            const job = this.trainingJobs.get(trainingId)!;
            if (job.status !== 'cancelled' && job.status !== 'paused') {
                job.status = 'completed';
                job.endTime = new Date().toISOString();
                job.outputModelId = `${job.baseModel}-finetuned-${trainingId.substring(0, 8)}`;
                job.evaluationResults = { 'mock_accuracy': 0.92, 'mock_perplexity': 15.3 }; // Example results
                await AuditLogManager.log({
                    action: 'model_training_completed',
                    target: `TrainingJob:${trainingId}`,
                    outcome: 'success',
                    details: { outputModel: job.outputModelId, evaluation: job.evaluationResults }
                });
            }
        }, 5000 + Math.random() * 5000); // Simulate 5-10 second training

        await AuditLogManager.log({
            action: 'submit_model_training_job',
            target: `TrainingJob:${trainingId}`,
            details: { baseModel: config.baseModel, datasetId: config.datasetId, method: config.trainingMethod }
        });
        return trainingId;
    }

    public static getTrainingJobStatus(trainingId: string): IModelTrainingConfig | undefined {
        return this.trainingJobs.get(trainingId);
    }

    public static async cancelTrainingJob(trainingId: string): Promise<boolean> {
        const job = this.trainingJobs.get(trainingId);
        if (job && (job.status === 'pending' || job.status === 'running')) {
            job.status = 'cancelled';
            job.endTime = new Date().toISOString();
            await AuditLogManager.log({ action: 'cancel_training_job', target: `TrainingJob:${trainingId}`, outcome: 'success' });
            return true;
        }
        await AuditLogManager.log({ action: 'cancel_training_job', target: `TrainingJob:${trainingId}`, outcome: 'failure', details: { reason: 'job_not_found_or_not_cancelable' } });
        return false;
    }

    public static async deployFineTunedModel(trainingId: string, environment: 'development' | 'staging' | 'production', userId: UserID = 'system'): Promise<IModelDeploymentConfig> {
        const job = this.trainingJobs.get(trainingId);
        if (!job || job.status !== 'completed' || !job.outputModelId) {
            throw new Error(`Training job ${trainingId} is not completed or has no output model.`);
        }
        const deploymentConfig: IModelDeploymentConfig = {
            deploymentId: IDGenerator.generateTimeOrderedID('deploy'),
            modelId: job.outputModelId,
            environment,
            region: process.env.DEFAULT_REGION || 'us-central1',
            scalingPolicy: 'auto_scale',
            resourceAllocation: { gpuType: 'NVIDIA_A100' }, // Example resource
            status: 'active',
            lastUpdated: new Date().toISOString(),
            endpointUrl: `https://api.aiuniverse.com/models/${job.outputModelId}/predict`
        };
        await ModelDeploymentManager.registerDeployment(deploymentConfig);
        await AuditLogManager.log({
            action: 'deploy_fine_tuned_model',
            target: `Model:${job.outputModelId}`,
            actor: userId,
            details: { trainingId, environment, deploymentId: deploymentConfig.deploymentId }
        });
        return deploymentConfig;
    }
}

/**
 * Provides advanced embedding capabilities and vector operations.
 */
export class EmbeddingService {
    public static async getEmbeddings(request: IEmbeddingRequest): Promise<IEmbeddingResponse> {
        try {
            const startTime = Date.now();
            // The GoogleGenAI SDK's `embedContent` is typically for a single piece of content.
            // Here, we adapt it for IContentPart array, assuming it can handle concatenation or specific types.
            // A more robust implementation would process each part if necessary, or use specific multimodal embedding models.
            const textContent = request.content.map(part => {
                if (typeof part.value === 'string') return part.value;
                if (part.type === Modality.Image && typeof part.value === 'string') return `[Image: ${part.description || 'no description'}]`; // Describe multimodal content
                return JSON.stringify(part.value);
            }).join(' ');

            const response = await ai.models.embedContent({
                model: request.model, // e.g., 'text-embedding-004'
                content: { parts: [{ text: textContent }] }, // Simplified for text-only embedding
            });

            // Assuming response.embedding exists and is an array of numbers
            const embedding = response.embedding.values;
            const latencyMs = Date.now() - startTime;

            const inputTokens = response.usageMetadata?.promptTokenCount || textContent.length / 4; // Estimate if not provided
            const usageMetrics: IUsageMetrics = {
                inputTokens: inputTokens,
                outputTokens: 0,
                costUsd: inputTokens * 0.0000002, // Placeholder for embedding cost
                computeUnits: 1
            };

            await AuditLogManager.log({
                action: 'get_embeddings',
                target: `Model:${request.model}`,
                outcome: 'success',
                details: { inputSize: textContent.length, embeddingLength: embedding.length, latencyMs, usageMetrics },
                metadata: { timestamp: new Date().toISOString(), source: 'EmbeddingService' }
            });

            return { embedding, metrics: usageMetrics };
        } catch (error: any) {
            console.error("Error getting embeddings:", error);
            await AuditLogManager.log({
                action: 'get_embeddings',
                target: `Model:${request.model}`,
                outcome: 'failure',
                details: { error: error.message },
                associatedErrors: [{ code: 'EMBEDDING_FAILED', message: error.message, severity: 'high' }]
            });
            throw new Error(`Failed to get embeddings: ${error.message}`);
        }
    }

    public static async batchGetEmbeddings(requests: IEmbeddingRequest[]): Promise<IEmbeddingResponse[]> {
        const results: IEmbeddingResponse[] = [];
        // In a real system, this would use `batchEmbedContent` for efficiency
        for (const req of requests) {
            results.push(await this.getEmbeddings(req));
        }
        await AuditLogManager.log({
            action: 'batch_get_embeddings',
            target: 'EmbeddingService',
            details: { batchSize: requests.length }
        });
        return results;
    }

    public static async compareEmbeddings(embeddingA: number[], embeddingB: number[]): Promise<number> {
        return MemoryManager['_cosineSimilarity'](embeddingA, embeddingB);
    }

    public static async storeVector(vectorId: string, embedding: number[], metadata: Record<string, any> = {}): Promise<void> {
        // This would integrate with a dedicated vector database (Pinecone, Weaviate, etc.)
        console.log(`[VECTOR_DB] Storing vector ${vectorId} with metadata:`, metadata);
        await AuditLogManager.log({ action: 'store_vector', target: `Vector:${vectorId}`, details: { dimensions: embedding.length, metadataKeys: Object.keys(metadata) } });
    }

    public static async queryVectors(queryEmbedding: number[], topK: number = 10, filters: Record<string, any> = {}): Promise<{ vectorId: string; score: number; metadata: Record<string, any> }[]> {
        // Simulate querying a vector database
        console.log(`[VECTOR_DB] Querying for top ${topK} vectors.`);
        await AuditLogManager.log({ action: 'query_vectors', target: 'VectorDatabase', details: { topK, filterKeys: Object.keys(filters) } });
        // Return mock results
        return [
            { vectorId: IDGenerator.generateUUID('vec'), score: 0.95, metadata: { source: 'document-1', chunk: 3 } },
            { vectorId: IDGenerator.generateUUID('vec'), score: 0.92, metadata: { source: 'faq-article', question_id: 'Q123' } },
        ];
    }
}

// Initialize managers with dependencies
const embeddingServiceInstance = new EmbeddingService();
new MemoryManager(embeddingServiceInstance); // MemoryManager uses EmbeddingService
ToolManager.registerBuiltInTools(); // Register default tools on startup

// --- Core Gemini Service (Vast Expansion) ---

/**
 * The ultimate interface to the Gemini AI Universe,
 * encapsulating all advanced capabilities developed over a decade.
 */
export class GeminiServiceUniverse {
    private readonly genAI: GoogleGenAI;
    private readonly defaultModel: ModelIdentifier = 'gemini-1.5-pro'; // Changed default to a more capable model

    constructor(genAIInstance: GoogleGenAI) {
        this.genAI = genAIInstance;
    }

    /**
     * Executes a raw model call with full control over parameters and content.
     * This is the underlying mechanism for most advanced interactions.
     * It handles model routing, safety, and basic metrics.
     */
    private async _executeModelCall(
        modelIdentifier: ModelIdentifier,
        contents: IAgentMessage[], // Now expects full conversation history in IAgentMessage format
        settings?: IPromptSettings,
        tools?: IToolDefinition[],
        sessionId?: SessionID,
        userId?: UserID
    ): Promise<IServiceResponse<{ messages: IAgentMessage[], toolCalls?: IToolCall[] }>> {
        const startTime = Date.now();
        let resolvedModel = modelIdentifier;
        try {
            resolvedModel = await ModelDeploymentManager.routeModelCall(modelIdentifier, { userId, sessionId, costOptimizationPreference: settings?.customParameters?.costOptimization, latencyToleranceMs: settings?.customParameters?.latencyTarget });
        } catch (routeError: any) {
            console.warn(`Model routing failed, falling back to original model: ${routeError.message}`);
            // Log this as a warning but don't block the call
            // Or fallback to a hardcoded default if preferredModelId is problematic.
        }

        const modelInputContents = contents.map(msg => ({
            role: msg.role === 'tool' ? 'function' : msg.role, // SDK expects 'function' for tool outputs
            parts: msg.content.map(part => {
                if (part.type === Modality.Text) return { text: part.value as string };
                if (part.type === Modality.Image && typeof part.value === 'string') return { inlineData: { mimeType: part.mimeType || 'image/jpeg', data: part.value } }; // Assume base64
                if (part.type === Modality.Code) return { text: `\`\`\`${part.language || ''}\n${part.value}\n\`\`\`` }; // Markdown code block
                if (part.type === Modality.Programmatic && typeof part.value === 'object') return { functionCall: part.value }; // For tool calls requested by agent
                // More complex modalities would need specific handling or be serialized to text/json
                return { text: JSON.stringify(part.value) };
            })
        }));

        try {
            const generationConfig: any = {
                temperature: settings?.temperature,
                topK: settings?.topK,
                topP: settings?.topP,
                maxOutputTokens: settings?.maxOutputTokens,
                stopSequences: settings?.stopSequences,
                responseMimeType: settings?.responseMimeType,
                // Add more config parameters as the SDK evolves
            };

            const safetySettings = settings?.safetySettings || [];

            const requestTools = tools?.map(tool => ({ functionDeclarations: [tool] })); // SDK expects functionDeclarations wrapper

            const requestOptions: any = {
                generationConfig: generationConfig,
                safetySettings: safetySettings,
                tools: requestTools,
                // Add system instructions if the model supports it directly
                // systemInstruction: settings?.customParameters?.systemInstruction
            };

            // Policy enforcement on final prompt before sending to model
            const policyCheck = await PolicyEnforcementManager.evaluateRequest(contents[contents.length - 1].content, { userId, sessionId, scope: 'llm_generation' });
            if (policyCheck.blocked) {
                return {
                    data: null,
                    success: false,
                    errors: policyCheck.reasons,
                    metadata: { timestamp: new Date().toISOString(), source: 'GeminiServiceUniverse', tags: ['policy_violation'] }
                };
            }
            if (policyCheck.warnings.length > 0) {
                console.warn(`[POLICY WARNING] Model call to ${resolvedModel} triggered warnings:`, policyCheck.warnings);
            }

            const responseStream = await this.genAI.models.generateContentStream({
                model: resolvedModel,
                contents: modelInputContents,
                ...requestOptions
            });

            let fullResponseParts: IContentPart[] = [];
            let currentText = '';
            let toolCalls: IToolCall[] = [];
            let inputTokens = 0;
            let outputTokens = 0;
            let finalSafetyRatings: ISafetySetting[] = [];

            for await (const chunk of responseStream.stream) {
                const chunkData = chunk.candidates?.[0]?.content?.parts || [];
                for (const part of chunkData) {
                    if (part.text) {
                        currentText += part.text;
                        outputTokens += part.text.length / 4; // Estimate
                    }
                    if (part.functionCall) {
                        if (currentText) { // If there's pending text, add it as a part
                            fullResponseParts.push({ type: Modality.Text, value: currentText, mimeType: 'text/plain' });
                            currentText = '';
                        }
                        const call: IToolCall = {
                            toolName: part.functionCall.name,
                            parameters: part.functionCall.args,
                            callId: IDGenerator.generateTimeOrderedID('tool_call'),
                            status: 'pending'
                        };
                        toolCalls.push(call);
                        fullResponseParts.push({ type: Modality.Programmatic, value: part.functionCall, mimeType: 'application/json', description: `Call to tool: ${call.toolName}` });
                        outputTokens += JSON.stringify(part.functionCall).length / 4; // Estimate
                    }
                }
                if (chunk.usageMetadata) {
                    inputTokens += chunk.usageMetadata.promptTokenCount || 0;
                    outputTokens += chunk.usageMetadata.candidatesTokenCount || 0;
                }
                if (chunk.candidates?.[0]?.safetyRatings) {
                    finalSafetyRatings = chunk.candidates[0].safetyRatings.map((sr: any) => ({
                        category: sr.category,
                        threshold: sr.probability === 'NEGLIGIBLE' ? 'BLOCK_NONE' : 'BLOCK_LOW_AND_ABOVE' // Simplified mapping
                    }));
                }
            }

            if (currentText) { // Add any remaining text
                fullResponseParts.push({ type: Modality.Text, value: currentText, mimeType: settings?.responseMimeType || 'text/plain' });
            }

            const endTime = Date.now();
            const totalLatencyMs = endTime - startTime;
            const apiCallMs = totalLatencyMs; // Simplified, in real system distinguish network/processing

            // Simulate token counting and cost
            const usageMetrics: IUsageMetrics = {
                inputTokens: inputTokens,
                outputTokens: outputTokens,
                costUsd: (inputTokens * 0.000001) + (outputTokens * 0.000002), // Very rough estimate per token
                computeUnits: Math.max(1, Math.ceil((inputTokens + outputTokens) / 1000))
            };

            const responseMessage: IAgentMessage = {
                id: IDGenerator.generateTimeOrderedID('msg'),
                role: 'assistant',
                content: fullResponseParts,
                timestamp: new Date().toISOString(),
                agentId: 'gemini-core',
                modelUsed: resolvedModel,
                responseTimeMs: totalLatencyMs,
                safetyRatings: finalSafetyRatings,
                metadata: {
                    timestamp: new Date().toISOString(),
                    source: 'GeminiServiceUniverse',
                    tags: ['generation', 'core']
                }
            };

            await AuditLogManager.log({
                action: 'model_call',
                target: `Model:${resolvedModel}`,
                actor: userId || 'anonymous',
                outcome: 'success',
                details: { latencyMs: totalLatencyMs, usageMetrics, toolCallsCount: toolCalls.length, promptSnippet: contents.map(m => m.content.map(p => typeof p.value === 'string' ? p.value : '').join(' ')).join('\n').substring(0, 100) },
                sessionId, userId
            });

            return {
                data: { messages: [responseMessage], toolCalls: toolCalls.length > 0 ? toolCalls : undefined },
                success: true,
                errors: [],
                metadata: { timestamp: new Date().toISOString(), source: 'GeminiServiceUniverse', tags: ['core', 'llm'], correlationId: sessionId },
                metrics: {
                    latency: { apiCallMs: apiCallMs, processingMs: totalLatencyMs - apiCallMs, totalMs: totalLatencyMs },
                    usage: usageMetrics
                },
                warnings: policyCheck.warnings
            };
        } catch (error: any) {
            console.error("Error in _executeModelCall:", error);
            const endTime = Date.now();
            const totalLatencyMs = endTime - startTime;

            const errorDetail: IErrorDetail = {
                code: error.code || 'GENERATION_ERROR',
                message: error.message || 'An unknown error occurred during AI generation.',
                stackTrace: error.stack,
                severity: 'critical',
                details: { model: resolvedModel }
            };

            await AuditLogManager.log({
                action: 'model_call',
                target: `Model:${resolvedModel}`,
                actor: userId || 'anonymous',
                outcome: 'failure',
                details: { error: error.message, latencyMs: totalLatencyMs },
                associatedErrors: [errorDetail],
                sessionId, userId
            });

            return {
                data: null,
                success: false,
                errors: [errorDetail],
                metadata: { timestamp: new Date().toISOString(), source: 'GeminiServiceUniverse', tags: ['core', 'llm', 'error'], correlationId: sessionId },
                metrics: {
                    latency: { apiCallMs: totalLatencyMs, processingMs: 0, totalMs: totalLatencyMs },
                    usage: { inputTokens: 0, outputTokens: 0, costUsd: 0, computeUnits: 0 } // No tokens on failure
                },
                warnings: []
            };
        }
    }

    /**
     * Original generateText, now a legacy alias for basic text generation.
     */
    public async generateText(prompt: string, sessionId?: SessionID, userId?: UserID): Promise<string> {
        const response = await this.generateContent([{ type: Modality.Text, value: prompt }], { sessionId, userId });
        if (response.success && response.data) {
            const textPart = response.data.find(p => p.type === Modality.Text);
            return textPart ? (textPart.value as string) : "No text content in response.";
        }
        return `An error occurred while communicating with the AI: ${response.errors[0]?.message || 'Unknown error.'}`;
    }

    /**
     * Generates content across multiple modalities. This is the new core generation method.
     * Supports complex inputs and returns structured multimodal outputs.
     */
    public async generateContent(
        inputContent: IContentPart[],
        options?: {
            model?: ModelIdentifier;
            settings?: IPromptSettings;
            sessionId?: SessionID;
            userId?: UserID;
            contextMessages?: IAgentMessage[]; // Additional context for the model
        }
    ): Promise<IServiceResponse<IContentPart[]>> {
        const model = options?.model || this.defaultModel;
        const settings = options?.settings;
        const sessionId = options?.sessionId || IDGenerator.generateUUID('session');
        const userId = options?.userId || 'anonymous';

        // Construct full input message array for _executeModelCall
        const messages: IAgentMessage[] = [
            ...(options?.contextMessages || []),
            {
                id: IDGenerator.generateTimeOrderedID('msg'),
                role: 'user',
                content: inputContent,
                timestamp: new Date().toISOString(),
                metadata: { timestamp: new Date().toISOString(), source: 'GeminiServiceUniverse', tags: ['user_input'] },
                agentId: userId
            }
        ];

        const modelCallResult = await this._executeModelCall(model, messages, settings, undefined, sessionId, userId);

        if (!modelCallResult.success || !modelCallResult.data) {
            return { ...modelCallResult, data: null }; // Pass through errors
        }

        const agentResponse = modelCallResult.data.messages[0];
        // Store user input and agent response in memory for future context retrieval
        await MemoryManager.storeEphemeralMemory(sessionId, inputContent, ['user_input', userId]);
        await MemoryManager.storeEphemeralMemory(sessionId, agentResponse.content, ['agent_response', 'gemini-core']);

        return { ...modelCallResult, data: agentResponse.content };
    }

    /**
     * Enables sophisticated conversational agents with memory, tool use, and self-correction.
     */
    public async converse(
        sessionId: SessionID,
        agentId: AgentID,
        history: IAgentMessage[], // Full conversation history
        options?: {
            modelPreferences?: IModelPreferences;
            memoryContextConfig?: IMemoryContextConfig;
            toolAccessConfig?: IToolAccessConfig;
            settings?: IPromptSettings;
            userId?: UserID;
        }
    ): Promise<IServiceResponse<IAgentMessage>> {
        const userId = options?.userId || 'anonymous';
        const agentConfig = AgentOrchestrator.getAgentConfig(agentId);
        if (!agentConfig) {
            return {
                data: null,
                success: false,
                errors: [{ code: 'AGENT_NOT_FOUND', message: `Agent '${agentId}' is not registered.`, severity: 'high' }],
                metadata: { timestamp: new Date().toISOString(), source: 'GeminiServiceUniverse' },
                warnings: []
            };
        }

        const modelPrefs = options?.modelPreferences || agentConfig.modelPreferences;
        const memConfig = options?.memoryContextConfig || agentConfig.memoryContextConfig;
        const toolConfig = options?.toolAccessConfig || agentConfig.toolAccessConfig;
        const settings = { ...agentConfig.modelPreferences, ...options?.settings }; // Merge agent defaults with call-specific settings

        // Retrieve relevant memories for the current context
        const latestUserInput = history.findLast(m => m.role === 'user');
        const relevantMemories = latestUserInput ? await MemoryManager.retrieveMemory(sessionId, latestUserInput.content, memConfig, 10) : [];

        // Construct the full context for the model (initial prompt + memories + history)
        const fullConversationContext: IAgentMessage[] = [
            { id: IDGenerator.generateTimeOrderedID('msg'), role: 'system', content: agentConfig.initialPrompt, timestamp: new Date().toISOString(), agentId: agentId },
            ...relevantMemories.map(mem => ({
                id: mem.id,
                role: 'system',
                content: [{ type: Modality.Text, value: `Retrieved memory (relevance: ${mem.relevanceScore.toFixed(2)}, recency: ${mem.recencyScore.toFixed(2)}): ${mem.content.map(p => typeof p.value === 'string' ? p.value : '').join(' ')}` }],
                timestamp: mem.timestamp,
                metadata: { timestamp: mem.timestamp, source: `Memory:${mem.sourceOrigin || 'unknown'}` }
            })),
            ...history
        ];

        const availableTools = toolConfig.allowedTools.map(t => ToolManager.getToolDefinition(t)).filter(Boolean) as IToolDefinition[];

        let modelCallResult = await this._executeModelCall(
            modelPrefs.defaultModel,
            fullConversationContext,
            settings,
            availableTools,
            sessionId,
            userId
        );

        if (!modelCallResult.success || !modelCallResult.data) {
            return { ...modelCallResult, data: null };
        }

        let agentResponse = modelCallResult.data.messages[0];
        let rawToolCalls = modelCallResult.data.toolCalls || [];

        // Self-correction loop for tool calls (simple retry)
        for (let i = 0; i < (settings.maxRetries || 0); i++) {
            if (rawToolCalls.length > 0) {
                const toolResults: IToolResult[] = [];
                for (const call of rawToolCalls) {
                    // Policy check for tool execution
                    const toolPolicyCheck = await PolicyEnforcementManager.evaluateRequest(call, { userId, sessionId, scope: 'tool_execution' });
                    if (toolPolicyCheck.blocked) {
                        console.warn(`Tool call to ${call.toolName} blocked by policy.`);
                        toolResults.push({
                            toolCallId: call.callId,
                            result: [{ type: Modality.Text, value: `Tool call blocked by policy: ${toolPolicyCheck.reasons[0].message}` }],
                            metadata: { timestamp: new Date().toISOString(), source: 'PolicyEnforcement' },
                            status: 'failure',
                            error: toolPolicyCheck.reasons[0]
                        });
                        continue;
                    }

                    // Handle manual approval for delegated tools
                    const toolDef = ToolManager.getToolDefinition(call.toolName);
                    if (toolDef && toolDef.securityContext === 'delegated' && toolConfig.defaultExecutionMode === 'manual_approval') {
                        await AuditLogManager.log({
                            action: 'tool_call_pending_approval',
                            target: `Tool:${call.toolName}`,
                            actor: userId,
                            details: { toolCallId: call.callId, parameters: call.parameters },
                            sessionId
                        });
                        // In a real system, this would pause and wait for a human-in-the-loop system.
                        // For simulation, we'll mark it as failed or return a message asking for approval.
                        console.log(`[ACTION REQUIRED] Tool call for ${call.toolName} requires manual approval. Skipping for now.`);
                        toolResults.push({
                            toolCallId: call.callId,
                            result: [{ type: Modality.Text, value: `Tool call '${call.toolName}' requires manual approval from user '${userId}'.` }],
                            metadata: { timestamp: new Date().toISOString(), source: 'GeminiServiceUniverse' },
                            status: 'failure',
                            error: { code: 'TOOL_APPROVAL_REQUIRED', message: 'Manual approval needed', severity: 'medium' }
                        });
                        continue;
                    }

                    const result = await ToolManager.executeTool(call, { userId, sessionId });
                    toolResults.push(result);
                }

                // If tools were executed, the agent needs to re-evaluate with results
                if (toolResults.length > 0) {
                    const toolOutputMessages: IAgentMessage[] = toolResults.map(tr => ({
                        id: IDGenerator.generateTimeOrderedID('msg'),
                        role: 'tool',
                        content: tr.result,
                        timestamp: new Date().toISOString(),
                        toolUseId: tr.toolCallId,
                        metadata: { timestamp: new Date().toISOString(), source: 'ToolManager', tags: ['tool_output'] },
                        agentId: agentId
                    }));

                    // Add tool outputs to history and call model again
                    fullConversationContext.push(agentResponse, ...toolOutputMessages);

                    // Re-call the model for self-correction / incorporating tool results
                    modelCallResult = await this._executeModelCall(
                        modelPrefs.defaultModel,
                        fullConversationContext,
                        { ...settings, customParameters: { ...settings.customParameters, retryAttempt: i + 1 } },
                        availableTools,
                        sessionId,
                        userId
                    );

                    if (!modelCallResult.success || !modelCallResult.data) {
                        return { ...modelCallResult, data: null }; // Tool-induced failure
                    }
                    agentResponse = modelCallResult.data.messages[0];
                    rawToolCalls = modelCallResult.data.toolCalls || [];
                } else {
                    break; // No tools executed, or all failed and no retry needed
                }
            } else {
                break; // No tool calls to begin with
            }
        }

        // Store current message and response in memory
        await MemoryManager.storeEphemeralMemory(sessionId, latestUserInput?.content || [], ['user_input', userId]);
        await MemoryManager.storeEphemeralMemory(sessionId, agentResponse.content, ['agent_response', agentId]);

        return { ...modelCallResult, data: agentResponse };
    }

    /**
     * Integrates with workflow management for complex, multi-step AI tasks.
     */
    public async executeWorkflow(
        workflowId: WorkflowID,
        input: Record<string, any>,
        options?: {
            sessionId?: SessionID;
            userId?: UserID;
            debugMode?: boolean;
        }
    ): Promise<IServiceResponse<IContentPart[]>> {
        const workflowDefinition = WorkflowManager.getWorkflowDefinition(workflowId);
        if (!workflowDefinition) {
            return {
                data: null,
                success: false,
                errors: [{ code: 'WORKFLOW_NOT_FOUND', message: `Workflow '${workflowId}' not found.`, severity: 'high' }],
                metadata: { timestamp: new Date().toISOString(), source: 'GeminiServiceUniverse' },
                warnings: []
            };
        }

        const userId = options?.userId || 'system';
        const sessionId = options?.sessionId || IDGenerator.generateUUID('workflow_session');
        const debugMode = options?.debugMode || false;

        await AuditLogManager.log({
            action: 'execute_workflow_start',
            target: `Workflow:${workflowId}`,
            actor: userId,
            details: { input: JSON.stringify(input).substring(0, 200), debugMode },
            sessionId
        });

        const executionGraphState: Map<string, IExecutionGraphNode> = new Map(workflowDefinition.graph.map(node => [node.nodeId, { ...node, status: 'pending', input: [] }]));
        let globalOutput: IContentPart[] = [];
        let completedNodes: Set<string> = new Set();
        let errors: IErrorDetail[] = [];
        let iterations = 0;
        const maxIterations = 50; // To prevent infinite loops in complex graphs

        while (completedNodes.size < workflowDefinition.graph.length && iterations < maxIterations) {
            iterations++;
            let nodesProcessedInThisIteration = 0;

            for (const node of workflowDefinition.graph) {
                const currentNodeState = executionGraphState.get(node.nodeId)!;

                if (currentNodeState.status !== 'pending' && currentNodeState.status !== 'failed') {
                    continue; // Already processed or running
                }

                const allDependenciesMet = node.dependencies.every(depId => completedNodes.has(depId));

                if (allDependenciesMet) {
                    nodesProcessedInThisIteration++;
                    currentNodeState.status = 'running';
                    currentNodeState.startTime = new Date().toISOString();

                    // Collect input from dependencies, or initial input for start nodes
                    if (node.dependencies.length === 0) {
                        currentNodeState.input = [{ type: Modality.Text, value: JSON.stringify(input), mimeType: 'application/json' }];
                    } else {
                        currentNodeState.input = node.dependencies.flatMap(depId => executionGraphState.get(depId)?.output || []);
                    }

                    if (debugMode) console.log(`[WORKFLOW:${workflowId}] Executing node: ${node.nodeId} (${node.type})`);

                    try {
                        if (node.type === 'llm_call') {
                            const llmCallResult = await this.generateContent(currentNodeState.input, {
                                model: currentNodeState.llmCallConfig?.customParameters?.model || this.defaultModel,
                                settings: currentNodeState.llmCallConfig,
                                sessionId,
                                userId,
                                contextMessages: node.dependencies.flatMap(depId => {
                                    const depNode = executionGraphState.get(depId);
                                    if (depNode?.type === 'llm_call' && depNode.output) {
                                        return [{ id: IDGenerator.generateUUID('msg'), role: 'assistant', content: depNode.output, timestamp: depNode.endTime! }];
                                    }
                                    return [];
                                })
                            });
                            if (!llmCallResult.success || !llmCallResult.data) {
                                throw new Error(`LLM call failed in workflow node ${node.nodeId}: ${llmCallResult.errors[0]?.message}`);
                            }
                            currentNodeState.output = llmCallResult.data;
                        } else if (node.type === 'tool_call' && node.toolCall) {
                            const toolResult = await ToolManager.executeTool(node.toolCall, { userId, sessionId });
                            if (toolResult.status === 'failure') {
                                throw new Error(`Tool execution failed in node ${node.nodeId}: ${toolResult.error?.message}`);
                            }
                            currentNodeState.output = toolResult.result;
                        } else if (node.type === 'data_transform') {
                            // Simulate a data transformation (e.g., parsing JSON, filtering, reformatting)
                            const inputData = currentNodeState.input.map(p => typeof p.value === 'string' ? p.value : JSON.stringify(p.value)).join('\n');
                            let transformedValue = inputData; // Default: passthrough
                            // Example: simple JSON parsing and object manipulation
                            try {
                                const parsedInput = JSON.parse(inputData);
                                transformedValue = JSON.stringify({ ...parsedInput, processedAt: new Date().toISOString() });
                            } catch (e) {
                                // If not JSON, just uppercase for demo
                                transformedValue = inputData.toUpperCase();
                            }
                            currentNodeState.output = [{ type: Modality.Text, value: transformedValue, mimeType: 'application/json' }];
                        } else if (node.type === 'human_in_loop' && node.humanApprovalNeeded) {
                            // This would typically pause workflow and await human input via a UI.
                            // For simulation, we'll auto-approve or fail based on a condition.
                            const approvalConditionMet = Math.random() > 0.3; // 70% chance of auto-approval
                            if (approvalConditionMet) {
                                console.log(`[WORKFLOW] Workflow ${workflowId} node ${node.nodeId} auto-approved (simulated).`);
                                currentNodeState.output = [{ type: Modality.Text, value: "Human approval simulated: Approved.", mimeType: 'text/plain' }];
                            } else {
                                throw new Error("Human approval required but not granted (simulated rejection).");
                            }
                        } else if (node.type === 'decision_point') {
                            // Evaluate branch condition based on previous node outputs
                            const lastOutput = currentNodeState.input.findLast(p => typeof p.value === 'string')?.value as string || '';
                            const conditionResult = lastOutput.includes('critical'); // Example condition
                            if (node.branchCondition && conditionResult) { // Simplistic evaluation
                                console.log(`[WORKFLOW] Decision Point ${node.nodeId}: Condition met. Branching.`);
                                // Logic to enable/disable subsequent nodes if this was real DAG execution
                                currentNodeState.output = [{ type: Modality.Text, value: `Decision: branch taken based on condition.` }];
                            } else {
                                console.log(`[WORKFLOW] Decision Point ${node.nodeId}: Condition NOT met. Skipping branch.`);
                                currentNodeState.output = [{ type: Modality.Text, value: `Decision: branch skipped.` }];
                            }
                        } else if (node.type === 'sub_workflow' && node.subWorkflowId) {
                            const subWorkflowResult = await this.executeWorkflow(node.subWorkflowId, JSON.parse(currentNodeState.input[0]?.value as string || '{}'), { sessionId, userId, debugMode });
                            if (!subWorkflowResult.success) {
                                throw new Error(`Sub-workflow ${node.subWorkflowId} failed: ${subWorkflowResult.errors[0]?.message}`);
                            }
                            currentNodeState.output = subWorkflowResult.data || [];
                        } else if (node.type === 'parallel_execution' && node.parallelNodes) {
                            // Execute nodes in parallel - here, just simulating. A real system would use Promise.all
                            const parallelResults = await Promise.all(node.parallelNodes.map(async parallelNodeId => {
                                // This requires modifying `executeWorkflow` to run sub-graphs or directly execute nodes
                                // For simplicity here, just mark as successful mock.
                                console.log(`[WORKFLOW] Simulating parallel execution of node: ${parallelNodeId}`);
                                return { type: Modality.Text, value: `Parallel node ${parallelNodeId} completed.` };
                            }));
                            currentNodeState.output = parallelResults;
                        } else {
                            throw new Error(`Unsupported workflow node type: ${node.type}`);
                        }
                        currentNodeState.status = 'completed';
                        completedNodes.add(node.nodeId);
                    } catch (e: any) {
                        currentNodeState.status = 'failed';
                        const errorDetail: IErrorDetail = {
                            code: 'WORKFLOW_NODE_FAILED',
                            message: `Workflow node ${node.nodeId} failed: ${e.message}`,
                            stackTrace: e.stack,
                            severity: 'critical'
                        };
                        currentNodeState.output = [{ type: Modality.Text, value: `Error in workflow node ${node.nodeId}: ${e.message}`, mimeType: 'text/plain' }];
                        currentNodeState.error = errorDetail;
                        errors.push(errorDetail);
                        await AuditLogManager.log({
                            action: 'execute_workflow_node_failed',
                            target: `Workflow:${workflowId}`,
                            actor: userId,
                            outcome: 'failure',
                            details: { nodeId: node.nodeId, error: e.message },
                            associatedErrors: [errorDetail],
                            sessionId
                        });
                        // In a real system, a failed node might trigger a rollback or a failure handling sub-workflow.
                        // For this demo, we'll stop the workflow on the first critical failure.
                        break; // Exit node loop
                    } finally {
                        currentNodeState.endTime = new Date().toISOString();
                    }
                }
            }
            if (errors.length > 0) break; // Stop if critical error occurred
            if (nodesProcessedInThisIteration === 0 && completedNodes.size < workflowDefinition.graph.length) {
                // No nodes could be processed in this iteration, but not all are complete. Likely a deadlock or unresolvable dependency.
                errors.push({ code: 'WORKFLOW_DEADLOCK', message: 'Workflow stuck: no nodes can proceed, but not all completed.', severity: 'critical' });
                break;
            }
        }

        if (errors.length === 0 && completedNodes.size === workflowDefinition.graph.length) {
            globalOutput = Array.from(executionGraphState.values())
                            .filter(node => node.output && node.output.length > 0 && node.dependencies.length > 0) // Collect output from nodes that depend on others
                            .reduce((acc, node) => acc.concat(node.output), []); // Aggregate final outputs

            // If no specific aggregate output is defined, use the output of the last node
            if (globalOutput.length === 0) {
                 const lastNode = workflowDefinition.graph[workflowDefinition.graph.length - 1];
                 if (lastNode) {
                    globalOutput = executionGraphState.get(lastNode.nodeId)?.output || [];
                 }
            }

            await AuditLogManager.log({
                action: 'execute_workflow_complete',
                target: `Workflow:${workflowId}`,
                actor: userId,
                outcome: 'success',
                details: { outputSnippet: globalOutput.map(p => typeof p.value === 'string' ? p.value : '').join(' ').substring(0, 100), totalNodes: workflowDefinition.graph.length, completedNodes: completedNodes.size, totalIterations: iterations },
                sessionId
            });
        } else {
             // If workflow failed or timed out
             globalOutput = errors.map(err => ({ type: Modality.Text, value: `Workflow Failed: ${err.message}`, mimeType: 'text/plain' }));
             await AuditLogManager.log({
                action: 'execute_workflow_failed',
                target: `Workflow:${workflowId}`,
                actor: userId,
                outcome: 'failure',
                details: { errorCount: errors.length, completedNodes: completedNodes.size, totalIterations: iterations },
                associatedErrors: errors,
                sessionId
            });
        }


        return {
            data: globalOutput,
            success: errors.length === 0,
            errors: errors,
            metadata: { timestamp: new Date().toISOString(), source: 'GeminiServiceUniverse', tags: ['workflow'], correlationId: sessionId },
            metrics: {
                latency: { apiCallMs: 0, processingMs: Date.now() - new Date(workflowDefinition.creationDate || new Date()).getTime(), totalMs: Date.now() - new Date(workflowDefinition.creationDate || new Date()).getTime() },
                usage: { inputTokens: 0, outputTokens: 0, costUsd: 0, computeUnits: 0 } // Aggregate metrics would be here
            },
            warnings: []
        };
    }

    /**
     * Provides capabilities for multimodal perception and interpretation.
     */
    public async perceive(
        inputContent: IContentPart[],
        options?: {
            task?: 'caption' | 'ocr' | 'object_detection' | 'audio_transcription' | 'sentiment' | 'entity_extraction' | 'scene_understanding' | 'event_detection';
            model?: ModelIdentifier;
            settings?: IPromptSettings;
            sessionId?: SessionID;
            userId?: UserID;
            outputFormat?: 'json' | 'markdown' | 'text'; // Desired output format
        }
    ): Promise<IServiceResponse<IContentPart[]>> {
        const model = options?.model || 'gemini-1.5-pro-vision'; // Vision model for perception
        const sessionId = options?.sessionId || IDGenerator.generateUUID('perception_session');
        const userId = options?.userId || 'anonymous';
        const taskPrompt = options?.task ? `Perform ${options.task} on the following multimodal content. Output in ${options.outputFormat || 'JSON'} format.` : 'Analyze the following content and describe its key elements and insights. Output in JSON format.';

        const messages: IAgentMessage[] = [{
            id: IDGenerator.generateTimeOrderedID('msg'),
            role: 'user',
            content: [{ type: Modality.Text, value: taskPrompt }, ...inputContent],
            timestamp: new Date().toISOString()
        }];

        const modelCallResult = await this._executeModelCall(model, messages, { ...options?.settings, responseMimeType: options?.outputFormat === 'text' ? 'text/plain' : 'application/json' }, undefined, sessionId, userId);

        if (!modelCallResult.success || !modelCallResult.data) {
            return { ...modelCallResult, data: null };
        }

        await AuditLogManager.log({
            action: 'perceive_content',
            target: `Model:${model}`,
            actor: userId,
            outcome: 'success',
            details: { task: options?.task, inputModalityCount: inputContent.length },
            sessionId
        });

        return { ...modelCallResult, data: modelCallResult.data.messages[0].content };
    }

    /**
     * Enables generative design and creative tasks across various domains.
     */
    public async create(
        inputDescription: IContentPart[],
        targetModality: Modality,
        options?: {
            model?: ModelIdentifier;
            settings?: IPromptSettings;
            sessionId?: SessionID;
            userId?: UserID;
            iterations?: number; // For iterative refinement
            designConstraints?: Record<string, any>;
            styleGuide?: ResourceID; // Reference to a style guide document
            feedbackLoopEnabled?: boolean; // Engage human feedback for refinement
        }
    ): Promise<IServiceResponse<IContentPart[]>> {
        const model = options?.model || 'gemini-1.5-pro'; // Or a specialized creative model
        const sessionId = options?.sessionId || IDGenerator.generateUUID('creative_session');
        const userId = options?.userId || 'anonymous';

        let creativePromptContent: IContentPart[] = [
            { type: Modality.Text, value: `Generate content in ${targetModality} modality based on the following description:` },
            ...inputDescription
        ];
        if (options?.designConstraints) {
            creativePromptContent.push({ type: Modality.Text, value: `Adhere to these constraints: ${JSON.stringify(options.designConstraints)}` });
        }
        if (options?.styleGuide) {
            // Retrieve style guide from DataCatalogService and include in prompt
            const styleGuide = await DataCatalogService.getDatasetMetadata(options.styleGuide);
            if (styleGuide) {
                creativePromptContent.push({ type: Modality.Text, value: `Follow this style guide: ${JSON.stringify(styleGuide.content)}` });
            }
        }

        let finalOutput: IContentPart[] = [];
        let success = false;
        let errors: IErrorDetail[] = [];
        let messages: IAgentMessage[] = []; // Conversation history for refinement

        for (let i = 0; i < (options?.iterations || 1); i++) {
            messages = [
                ...messages,
                { id: IDGenerator.generateTimeOrderedID('msg'), role: 'user', content: creativePromptContent, timestamp: new Date().toISOString() }
            ];

            const modelCallResult = await this._executeModelCall(model, messages, options?.settings, undefined, sessionId, userId);

            if (modelCallResult.success && modelCallResult.data) {
                finalOutput = modelCallResult.data.messages[0].content;
                messages.push(modelCallResult.data.messages[0]); // Add agent's response to history
                success = true;

                if (options?.iterations && options.iterations > 1 && i < options.iterations - 1) {
                    // Self-correction/refinement prompt
                    creativePromptContent = [{ type: Modality.Text, value: "Refine this output based on original description and constraints, improving quality. Consider the previous attempt." }];
                }
            } else {
                errors.push(...modelCallResult.errors);
                success = false;
                break; // Stop if a generation fails
            }

            if (options?.feedbackLoopEnabled) {
                // Simulate receiving human feedback and incorporating it
                const simulatedFeedback: IFeedbackEntry = {
                    feedbackId: IDGenerator.generateUUID('fb'),
                    timestamp: new Date().toISOString(),
                    userId: userId,
                    sessionId: sessionId,
                    messageId: messages[messages.length - 1].id,
                    rating: Math.random() > 0.5 ? 1 : -1, // Simulate good/bad feedback
                    comment: "Simulated feedback: try making it more vibrant.",
                    category: 'helpfulness',
                    status: 'new', priority: 'medium'
                };
                await FeedbackLoopManager.submitFeedback(simulatedFeedback);
                if (simulatedFeedback.rating < 0 && i < (options.iterations || 1) - 1) {
                    creativePromptContent.push({ type: Modality.Text, value: `User feedback: "${simulatedFeedback.comment}". Please address this in your next iteration.` });
                }
            }
        }

        await AuditLogManager.log({
            action: 'create_content',
            target: `Modality:${targetModality}`,
            actor: userId,
            outcome: success ? 'success' : 'failure',
            details: { inputDescriptionSnippet: inputDescription.map(p => typeof p.value === 'string' ? p.value : '').join(' ').substring(0, 100), iterations: options?.iterations, finalOutputSize: finalOutput.length },
            sessionId
        });

        return {
            data: finalOutput.length > 0 ? finalOutput : null,
            success: success,
            errors: success ? [] : errors,
            metadata: { timestamp: new Date().toISOString(), source: 'GeminiServiceUniverse', tags: ['creative', targetModality], correlationId: sessionId },
            warnings: []
        };
    }

    /**
     * Facilitates scientific discovery, data analysis, and hypothesis generation.
     */
    public async scientificDiscovery(
        data: IContentPart[],
        researchQuestion: string,
        options?: {
            model?: ModelIdentifier;
            settings?: IPromptSettings;
            sessionId?: SessionID;
            userId?: UserID;
            knowledgeGraphIds?: KnowledgeGraphID[];
            allowedTools?: ToolIdentifier[]; // e.g., 'data_analysis_tool', 'literature_search'
            outputFormat?: 'report' | 'json_summary' | 'interactive_notebook';
        }
    ): Promise<IServiceResponse<IContentPart[]>> {
        const model = options?.model || 'gemini-1.5-pro-scientific'; // Hypothetical specialized model
        const sessionId = options?.sessionId || IDGenerator.generateUUID('scientific_session');
        const userId = options?.userId || 'anonymous';

        const fullPromptContent: IContentPart[] = [
            { type: Modality.Text, value: `Analyze the provided data to answer the research question: "${researchQuestion}".` },
            { type: Modality.Text, value: `Provide hypotheses, data interpretations, and suggest next steps for experimentation. Use available tools for data processing and literature review. Output results in a structured ${options?.outputFormat || 'report'} format (e.g., Markdown or JSON).` },
            ...data
        ];

        // Integrate relevant knowledge graphs for scientific context
        if (options?.knowledgeGraphIds && options.knowledgeGraphIds.length > 0) {
            const kgContextContent: IContentPart[] = [];
            for (const kgId of options.knowledgeGraphIds) {
                const kg = MemoryManager.knowledgeGraphs.get(kgId); // Accessing static map
                if (kg) {
                    kgContextContent.push({ type: Modality.Text, value: `Knowledge Graph Context from ${kg.name}: ${kg.description}. Key nodes: ${kg.nodes.map(n => n.labels.join(', ')).join('; ')}` });
                }
            }
            if (kgContextContent.length > 0) {
                fullPromptContent.push(...kgContextContent);
            }
        }

        const messages: IAgentMessage[] = [{
            id: IDGenerator.generateTimeOrderedID('msg'),
            role: 'user',
            content: fullPromptContent,
            timestamp: new Date().toISOString()
        }];

        const modelCallResult = await this._executeModelCall(
            model,
            messages,
            { ...options?.settings, responseMimeType: options?.outputFormat === 'json_summary' ? 'application/json' : 'text/markdown' },
            options?.allowedTools?.map(t => ToolManager.getToolDefinition(t)).filter(Boolean) as IToolDefinition[],
            sessionId,
            userId
        );

        await AuditLogManager.log({
            action: 'scientific_discovery',
            target: `Question:${researchQuestion.substring(0, 50)}`,
            actor: userId,
            outcome: modelCallResult.success ? 'success' : 'failure',
            details: { dataSize: data.length, question: researchQuestion, model: model },
            sessionId
        });

        if (!modelCallResult.success || !modelCallResult.data) {
            return { ...modelCallResult, data: null };
        }
        return { ...modelCallResult, data: modelCallResult.data.messages[0].content };
    }

    /**
     * Enables the AI to generate, analyze, and refine code across multiple languages.
     */
    public async codeCopilot(
        codeContext: IContentPart[],
        task: string,
        options?: {
            model?: ModelIdentifier;
            settings?: IPromptSettings;
            sessionId?: SessionID;
            userId?: UserID;
            language?: string; // e.g., 'typescript', 'python', 'java'
            toolAccessConfig?: IToolAccessConfig; // For code compilation, testing tools
            refinementIterations?: number;
            // Additional options for advanced code tasks
            testingFramework?: string; // e.g., 'jest', 'pytest'
            securityScanEnabled?: boolean;
            performanceOptimizationEnabled?: boolean;
        }
    ): Promise<IServiceResponse<IContentPart[]>> {
        const model = options?.model || 'gemini-1.5-pro-code'; // Hypothetical specialized code model
        const sessionId = options?.sessionId || IDGenerator.generateUUID('code_session');
        const userId = options?.userId || 'anonymous';
        const language = options?.language || 'typescript';

        let messages: IAgentMessage[] = []; // Keep track of conversation for refinement
        let currentContent: IContentPart[] = [
            { type: Modality.Text, value: `Given the following code context, ${task} in ${language}.` },
            { type: Modality.Text, value: 'Output only the code or a structured plan/explanation. Use available coding tools for verification.' },
            ...codeContext
        ];

        let finalCodeOutput: IContentPart[] = [];
        let success = false;
        let errors: IErrorDetail[] = [];

        for (let i = 0; i < (options?.refinementIterations || 1); i++) {
            messages.push({
                id: IDGenerator.generateTimeOrderedID('msg'),
                role: 'user',
                content: currentContent,
                timestamp: new Date().toISOString()
            });

            const modelCallResult = await this._executeModelCall(
                model,
                messages,
                options?.settings,
                options?.toolAccessConfig?.allowedTools?.map(t => ToolManager.getToolDefinition(t)).filter(Boolean) as IToolDefinition[],
                sessionId,
                userId
            );

            if (modelCallResult.success && modelCallResult.data) {
                finalCodeOutput = modelCallResult.data.messages[0].content;
                messages.push(modelCallResult.data.messages[0]);
                success = true;

                // Simulate compilation/testing/linting with a tool if available
                const codePart = finalCodeOutput.find(p => p.type === Modality.Code || p.mimeType?.startsWith('text/x-') || p.mimeType === 'text/plain');
                if (codePart && ToolManager.getToolDefinition('code_interpreter')) {
                    const testToolCall: IToolCall = {
                        toolName: 'code_interpreter',
                        parameters: { code: codePart.value, language: language, action: options?.testingFramework ? 'test' : 'lint' },
                        callId: IDGenerator.generateTimeOrderedID('code_tool'),
                    };
                    const testResult = await ToolManager.executeTool(testToolCall, { userId, sessionId });
                    const testOutput = testResult.result.map(p => typeof p.value === 'string' ? p.value : '').join(' ');
                    const parsedTestOutput = JSON.parse(testOutput || '{}');

                    if (testResult.status === 'failure' || parsedTestOutput.status === 'failure' || parsedTestOutput.errors) {
                        console.log(`[CODE COPILOT] Refinement needed due to errors: ${parsedTestOutput.errors || testResult.error?.message}`);
                        messages.push({
                            id: IDGenerator.generateTimeOrderedID('msg'),
                            role: 'tool',
                            content: testResult.result,
                            timestamp: new Date().toISOString(),
                            toolUseId: testToolCall.callId
                        });
                        currentContent = [{ type: Modality.Text, value: `The previous code had issues: "${parsedTestOutput.errors || testResult.error?.message}". Please fix them and re-generate.` }];
                        success = false;
                    } else {
                        success = true; // Code seems good
                        break; // Exit refinement loop
                    }
                } else if (!codePart) {
                    currentContent = [{ type: Modality.Text, value: "The previous response did not contain code. Please provide the code." }];
                    success = false;
                } else {
                    console.warn("Code Interpreter tool not registered. Skipping automated code testing/linting.");
                    break; // Cannot refine without tool
                }
            } else {
                errors.push(...modelCallResult.errors);
                success = false;
                break;
            }
        }

        await AuditLogManager.log({
            action: 'code_copilot',
            target: `Language:${language}`,
            actor: userId,
            outcome: success ? 'success' : 'failure',
            details: { taskSnippet: task.substring(0, 100), refinementIterations: options?.refinementIterations, finalOutputSize: finalCodeOutput.length },
            sessionId
        });

        return {
            data: success ? finalCodeOutput : null,
            success: success,
            errors: success ? [] : (errors.length > 0 ? errors : [{ code: 'CODE_GENERATION_FAILED', message: 'Code generation and refinement failed or produced no code.', severity: 'critical' }]),
            metadata: { timestamp: new Date().toISOString(), source: 'GeminiServiceUniverse', tags: ['code', 'engineering'], correlationId: sessionId },
            warnings: []
        };
    }

    /**
     * Provides AI-powered educational content generation and personalized learning paths.
     */
    public async educationalAI(
        learningGoal: string,
        studentProfile: Record<string, any>, // e.g., { age: 10, grade: 5, learningStyle: 'visual', masteredTopics: ['algebra'] }
        options?: {
            model?: ModelIdentifier;
            settings?: IPromptSettings;
            sessionId?: SessionID;
            userId?: UserID;
            learningMode?: 'tutorial' | 'interactive_quiz' | 'project_based' | 'adaptive_lesson';
            difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
            targetCurriculum?: ResourceID; // e.g., a specific course or textbook
            assessmentEnabled?: boolean; // Enable automated assessments
        }
    ): Promise<IServiceResponse<IContentPart[]>> {
        const model = options?.model || 'gemini-1.5-pro-edu'; // Specialized education model
        const sessionId = options?.sessionId || IDGenerator.generateUUID('edu_session');
        const userId = options?.userId || 'anonymous';

        let personaPromptContent: IContentPart[] = [
            { type: Modality.Text, value: `Act as a personalized AI tutor tailored to the student's profile. The student's profile is: ${JSON.stringify(studentProfile)}. Their learning goal is: "${learningGoal}".` },
            { type: Modality.Text, value: `Deliver content in a ${options?.learningMode || 'tutorial'} mode, suitable for ${options?.difficultyLevel || 'intermediate'} level.` }
        ];

        if (options?.targetCurriculum) {
            const curriculumData = await DataCatalogService.getDatasetMetadata(options.targetCurriculum);
            if (curriculumData) {
                personaPromptContent.push({ type: Modality.Text, value: `Align the content with this curriculum: ${JSON.stringify(curriculumData)}` });
            }
        }

        const messages: IAgentMessage[] = [{
            id: IDGenerator.generateTimeOrderedID('msg'),
            role: 'user',
            content: personaPromptContent,
            timestamp: new Date().toISOString()
        }];

        const modelCallResult = await this._executeModelCall(model, messages, options?.settings, undefined, sessionId, userId);

        if (modelCallResult.success && modelCallResult.data && options?.assessmentEnabled) {
            // Simulate generating an assessment
            const assessmentPrompt: IContentPart[] = [
                { type: Modality.Text, value: `Based on the content you just generated, create a short interactive quiz or assessment. Output as JSON array of questions.` },
                ...modelCallResult.data.messages[0].content // Include the generated content as context
            ];
            const assessmentMessages: IAgentMessage[] = [
                messages[0], // Original persona prompt
                modelCallResult.data.messages[0], // Generated lesson
                { id: IDGenerator.generateTimeOrderedID('msg'), role: 'user', content: assessmentPrompt, timestamp: new Date().toISOString() }
            ];

            const assessmentResult = await this._executeModelCall(model, assessmentMessages, { ...options.settings, responseMimeType: 'application/json' }, undefined, sessionId, userId);
            if (assessmentResult.success && assessmentResult.data) {
                modelCallResult.data.messages[0].content.push({
                    type: Modality.Programmatic,
                    value: JSON.parse(assessmentResult.data.messages[0].content[0].value as string),
                    mimeType: 'application/json',
                    description: 'Generated Assessment'
                });
            }
        }

        await AuditLogManager.log({
            action: 'educational_content_gen',
            target: `LearningGoal:${learningGoal.substring(0, 50)}`,
            actor: userId,
            outcome: modelCallResult.success ? 'success' : 'failure',
            details: { studentProfileAge: studentProfile.age, learningMode: options?.learningMode, assessmentEnabled: options?.assessmentEnabled },
            sessionId
        });

        if (!modelCallResult.success || !modelCallResult.data) {
            return { ...modelCallResult, data: null };
        }
        return { ...modelCallResult, data: modelCallResult.data.messages[0].content };
    }

    /**
     * Offers predictive analytics, anomaly detection, and optimization capabilities.
     */
    public async predictiveAnalytics(
        dataset: IContentPart[],
        analysisGoal: string,
        options?: {
            model?: ModelIdentifier;
            settings?: IPromptSettings;
            sessionId?: SessionID;
            userId?: UserID;
            analysisType?: 'regression' | 'classification' | 'clustering' | 'forecasting' | 'anomaly_detection' | 'causal_inference';
            featureEngineeringTools?: ToolIdentifier[];
            visualizationEnabled?: boolean; // Request code for visualizations
        }
    ): Promise<IServiceResponse<IContentPart[]>> {
        const model = options?.model || 'gemini-1.5-pro-analytics'; // Specialized analytics model
        const sessionId = options?.sessionId || IDGenerator.generateUUID('analytics_session');
        const userId = options?.userId || 'anonymous';

        const fullPromptContent: IContentPart[] = [
            { type: Modality.Text, value: `Perform ${options?.analysisType || 'predictive analytics'} on the provided dataset to achieve the goal: "${analysisGoal}".` },
            { type: Modality.Text, value: 'Identify key trends, make predictions, and highlight anomalies. Output comprehensive insights, including statistical summaries, interpretation, and if requested, visualization code (e.g., Python Matplotlib/Seaborn).' },
            ...(options?.visualizationEnabled ? [{ type: Modality.Text, value: 'Include Python code for data visualizations.' }] : []),
            ...dataset // The actual data content
        ];

        const messages: IAgentMessage[] = [{
            id: IDGenerator.generateTimeOrderedID('msg'),
            role: 'user',
            content: fullPromptContent,
            timestamp: new Date().toISOString()
        }];

        const modelCallResult = await this._executeModelCall(
            model,
            messages,
            options?.settings,
            options?.featureEngineeringTools?.map(t => ToolManager.getToolDefinition(t)).filter(Boolean) as IToolDefinition[],
            sessionId,
            userId
        );

        await AuditLogManager.log({
            action: 'predictive_analytics',
            target: `AnalysisGoal:${analysisGoal.substring(0, 50)}`,
            actor: userId,
            outcome: modelCallResult.success ? 'success' : 'failure',
            details: { analysisType: options?.analysisType, datasetSize: dataset.length, model: model },
            sessionId
        });

        if (!modelCallResult.success || !modelCallResult.data) {
            return { ...modelCallResult, data: null };
        }
        return { ...modelCallResult, data: modelCallResult.data.messages[0].content };
    }

    /**
     * Provides real-time AI capabilities for streaming data, low-latency responses, and continuous learning.
     * This method would typically interact with a dedicated streaming inference engine or a stream processing framework.
     */
    public async realTimeStream(
        inputStream: AsyncIterable<IContentPart>, // A stream of input content
        options?: {
            model?: ModelIdentifier;
            settings?: IPromptSettings;
            sessionId?: SessionID;
            userId?: UserID;
            responseLatencyTargetMs?: number; // Target latency for responses
            continuousLearningEnabled?: boolean;
            streamProcessingWindowMs?: number; // How often to process chunks
            onResult?: (result: IServiceResponse<IContentPart[]>) => void; // Callback for each result
            onError?: (error: IErrorDetail) => void;
        }
    ): Promise<AsyncIterable<IServiceResponse<IContentPart[]>>> {
        const model = options?.model || 'gemini-2.5-flash'; // Low-latency model
        const sessionId = options?.sessionId || IDGenerator.generateUUID('stream_session');
        const userId = options?.userId || 'anonymous';
        const streamProcessingWindowMs = options?.streamProcessingWindowMs || 500; // Default to 500ms processing window

        const self = this; // Capture 'this' for the async generator

        async function* responseGenerator(): AsyncGenerator<IServiceResponse<IContentPart[]>> {
            let buffer: IContentPart[] = [];
            let lastProcessedTime = Date.now();
            let currentMessages: IAgentMessage[] = []; // Maintain state for streaming context

            await AuditLogManager.log({
                action: 'real_time_stream_start',
                target: `Stream:${sessionId}`,
                actor: userId,
                details: { model, streamProcessingWindowMs, continuousLearningEnabled: options?.continuousLearningEnabled },
                sessionId
            });

            for await (const chunk of inputStream) {
                buffer.push(chunk);

                const now = Date.now();
                if (now - lastProcessedTime >= streamProcessingWindowMs || buffer.length >= 2) { // Process every window or after 2 chunks
                    const streamInputContent: IContentPart[] = [
                        { type: Modality.Text, value: "Process this real-time input. Provide concise, immediate insights based on accumulated data. Maintain context from previous interactions." },
                        ...buffer
                    ];

                    // Add a user message with the buffered content
                    currentMessages.push({
                        id: IDGenerator.generateTimeOrderedID('msg'),
                        role: 'user',
                        content: streamInputContent,
                        timestamp: new Date().toISOString()
                    });

                    const modelCallResult = await self._executeModelCall(model, currentMessages, { ...options?.settings, enableStreaming: true }, undefined, sessionId, userId);

                    if (modelCallResult.success && modelCallResult.data) {
                        const agentResponse = modelCallResult.data.messages[0];
                        currentMessages.push(agentResponse); // Add response to context for next turn
                        const response: IServiceResponse<IContentPart[]> = {
                            ...modelCallResult,
                            data: agentResponse.content || null,
                            metadata: { ...modelCallResult.metadata, tags: ['realtime', 'streaming'] }
                        };
                        yield response;
                        options?.onResult?.(response);
                        await MemoryManager.storeEphemeralMemory(sessionId, agentResponse.content, ['stream_output', agentResponse.agentId]);
                        if (options?.continuousLearningEnabled) {
                             // Trigger feedback loop for continuous learning
                             await FeedbackLoopManager.submitFeedback({
                                feedbackId: IDGenerator.generateUUID('fb'),
                                timestamp: new Date().toISOString(),
                                userId: userId,
                                sessionId: sessionId,
                                messageId: agentResponse.id,
                                rating: 0, // Neutral initial rating
                                comment: 'Streamed response (for continuous learning)',
                                category: 'helpfulness',
                                status: 'new',
                                priority: 'low'
                             });
                        }
                    } else {
                        const error: IErrorDetail = { code: 'STREAM_PROCESSING_FAILED', message: `Stream processing error: ${modelCallResult.errors[0]?.message}`, severity: 'medium' };
                        options?.onError?.(error);
                        yield { ...modelCallResult, data: null, errors: [...modelCallResult.errors, error] };
                    }
                    buffer = []; // Clear buffer after processing
                    lastProcessedTime = now;
                }
            }

            // Process any remaining buffer content after stream ends
            if (buffer.length > 0) {
                const finalStreamInputContent: IContentPart[] = [
                    { type: Modality.Text, value: "Final processing for remaining real-time input chunks." },
                    ...buffer
                ];
                currentMessages.push({
                    id: IDGenerator.generateTimeOrderedID('msg'),
                    role: 'user',
                    content: finalStreamInputContent,
                    timestamp: new Date().toISOString()
                });
                const modelCallResult = await self._executeModelCall(model, currentMessages, { ...options?.settings, enableStreaming: true }, undefined, sessionId, userId);
                const response: IServiceResponse<IContentPart[]> = {
                    ...modelCallResult,
                    data: modelCallResult.data?.messages[0].content || null,
                    metadata: { ...modelCallResult.metadata, tags: ['realtime', 'streaming', 'final_chunk'] }
                };
                yield response;
                options?.onResult?.(response);
            }

            await AuditLogManager.log({
                action: 'real_time_stream_processed_complete',
                target: `Stream:${sessionId}`,
                actor: userId,
                outcome: 'success',
                details: { continuousLearningEnabled: options?.continuousLearningEnabled },
                sessionId
            });
        }
        return responseGenerator();
    }


    /**
     * Initializes all foundational managers and registers built-in functionalities.
     * This method would be called once at application startup.
     */
    public static async initializeUniverse(): Promise<void> {
        console.log("Initializing Gemini AI Universe...");
        await ToolManager.registerBuiltInTools();
        await WorkflowManager.registerExampleWorkflows();

        // Register default policies
        await PolicyEnforcementManager.registerPolicy({
            policyId: 'default-safety-v1',
            name: 'Default Safety Policy',
            description: 'Blocks harmful content categories.',
            type: 'safety',
            rules: [{ type: 'harm_category_threshold', category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }],
            enforcementMode: 'enforce',
            priority: 100,
            effectiveDate: new Date().toISOString(),
            targetScopes: ['llm_generation', 'tool_execution']
        });
        await PolicyEnforcementManager.registerPolicy({
            policyId: 'pii-masking-v1',
            name: 'PII Masking Policy',
            description: 'Flags or masks personally identifiable information.',
            type: 'privacy',
            rules: [{ type: 'pii_detection', entities: ['email', 'phone_number', 'credit_card'] }],
            enforcementMode: 'monitor', // Just flag for now, could enforce masking
            priority: 90,
            effectiveDate: new Date().toISOString(),
            targetScopes: ['data_ingestion', 'llm_generation']
        });


        // Register a default agent
        await AgentOrchestrator.registerAgent({
            agentId: 'default-assistant',
            name: 'General Purpose Assistant',
            description: 'A versatile AI assistant capable of handling general queries and tasks.',
            persona: 'Helpful, polite, and knowledgeable.',
            goals: ['answer questions', 'assist with tasks', 'engage in conversation', 'use tools effectively'],
            initialPrompt: [{ type: Modality.Text, value: 'You are a highly capable and ethical AI assistant. Be helpful, concise, and accurate. When appropriate, offer to use tools to solve problems or fetch information. Always verify information if unsure.' }],
            memoryContextConfig: {
                maxTokens: 4000,
                retrievalStrategy: 'hybrid',
                longTermMemoryEnabled: true,
                ephemeralMemoryEnabled: true,
                shortTermMemorySpanMs: 3600000 // 1 hour
            },
            toolAccessConfig: {
                allowedTools: ['calculator', 'web_search', 'data_query'],
                forbiddenTools: [],
                defaultExecutionMode: 'auto'
            },
            modelPreferences: {
                defaultModel: 'gemini-1.5-pro',
                fallbackModels: ['gemini-2.5-flash']
            },
            skillset: ['information_retrieval', 'mathematics', 'general_knowledge', 'tool_use', 'problem_solving'],
            autonomyLevel: 'medium',
            reflectionFrequency: 'on_failure',
            selfCorrectionEnabled: true,
            metaCognitionEnabled: true,
            cognitiveArchitecture: 'plan-and-execute'
        });

        // Register default monitoring dashboard
        MonitoringService.registerDashboard({
            dashboardId: 'main-ops-dashboard',
            name: 'Main Operations Dashboard',
            metricsDisplayed: ['totalApiCalls', 'errorRate', 'averageLatencyMs', 'totalCostUsd', 'activeAgents', 'tool_failures'],
            refreshRateSeconds: 60,
            accessPermissions: { 'system': 'admin', 'user-123': 'view' },
            alertRules: [
                { ruleId: 'high-error-rate', metric: 'error_rate', operator: 'gt', threshold: 0.05, timeWindowSeconds: 300, severity: 'critical', alertRecipients: ['admin@ai.google.com'] },
                { ruleId: 'cost-spike', metric: 'totalCostUsd', operator: 'gt', threshold: 5000, timeWindowSeconds: 3600, severity: 'warning', alertRecipients: ['finance@ai.google.com'] }
            ]
        });

        // Register example datasets
        DataCatalogService.registerDataset('customer-reviews-v1', { name: 'Customer Review Data', size: '10GB', format: 'json', schema: { /* JSON Schema */ }, accessControl: { 'user-123': 'read' } });
        DataCatalogService.registerDataset('curriculum-math-grade5-v2', { name: 'Grade 5 Math Curriculum', type: 'educational', content: { topics: ['algebra basics', 'fractions', 'geometry'], standards: ['CCSS.MATH.CONTENT.5.OA.A.1'] } });


        await AuditLogManager.log({
            action: 'universe_initialization',
            target: 'GeminiServiceUniverse',
            outcome: 'success',
            details: { status: 'All core managers initialized and built-in components registered.' }
        });
        console.log("Gemini AI Universe initialized.");
    }
}


// The existing `GeminiService` is now redefined to be an instance of the new, expanded `GeminiServiceUniverse`.
// This fulfills the requirement of expanding without removing existing imports and maintaining the original entry point.
// We export the new class directly, and the original object name can now be an instance.

// Instantiate the core universe service
export const GeminiService = new GeminiServiceUniverse(ai);

// Automatically initialize the universe when the module loads
// This ensures all managers and built-in features are ready when GeminiService is used.
GeminiServiceUniverse.initializeUniverse();

// Export individual managers for direct access in other parts of the "universe"
export { IDGenerator, AuditLogManager, PolicyEnforcementManager, MemoryManager, ToolManager, AgentOrchestrator, ModelDeploymentManager, ModelTrainingManager, EmbeddingService };

// Export all the core data models and interfaces
export type {
    UserID, SessionID, ContextID, KnowledgeGraphID, AgentID, ModelIdentifier, ToolIdentifier, SkillIdentifier, WorkflowID, TensorData,
    ILatencyMetrics, IUsageMetrics, IMetadata, IErrorDetail, IServiceResponse, Modality, IContentPart, IAgentMessage,
    IPromptSettings, ISafetySetting, IEmbeddingRequest, IEmbeddingResponse, IToolDefinition, IToolCall, IToolResult,
    IMemoryRecord, ISemanticRelationship, IKnowledgeGraphNode, IKnowledgeGraph, IAgentConfiguration, IMemoryContextConfig,
    IToolAccessConfig, IModelPreferences, IExecutionGraphNode, IWorkflowDefinition, IMonitoringDashboard, IPolicyDefinition,
    IAuditLogEntry, IFeedbackEntry, IModelTrainingConfig, IModelDeploymentConfig, IExperimentConfig,
    DataStreamID, TelemetryEventID, ResourceID, IAlertRule, ITelemetryEvent
};

// --- Additional Manager/Service Definitions (Further Universe Expansion) ---

/**
 * Manages complex, multi-step workflows composed of LLM calls, tool executions, and human-in-the-loop steps.
 * This class is designed to define, store, and make workflows available for execution.
 */
export class WorkflowManager {
    private static workflows: Map<WorkflowID, IWorkflowDefinition> = new Map();

    public static async registerWorkflow(definition: IWorkflowDefinition): Promise<void> {
        this.workflows.set(definition.workflowId, { ...definition, creationDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() });
        await AuditLogManager.log({
            action: 'register_workflow',
            target: `Workflow:${definition.workflowId}`,
            details: { name: definition.name, version: definition.version, trigger: definition.trigger }
        });
    }

    public static getWorkflowDefinition(workflowId: WorkflowID): IWorkflowDefinition | undefined {
        return this.workflows.get(workflowId);
    }

    public static async updateWorkflow(workflowId: WorkflowID, updates: Partial<IWorkflowDefinition>, userId: UserID = 'system'): Promise<void> {
        const existing = this.workflows.get(workflowId);
        if (!existing) {
            throw new Error(`Workflow '${workflowId}' not found.`);
        }
        this.workflows.set(workflowId, { ...existing, ...updates, lastModifiedDate: new Date().toISOString() });
        await AuditLogManager.log({
            action: 'update_workflow',
            target: `Workflow:${workflowId}`,
            actor: userId,
            details: { updatedFields: Object.keys(updates) }
        });
    }

    public static async deleteWorkflow(workflowId: WorkflowID, userId: UserID = 'system'): Promise<void> {
        if (this.workflows.delete(workflowId)) {
            await AuditLogManager.log({ action: 'delete_workflow', target: `Workflow:${workflowId}`, actor: userId, outcome: 'success' });
        } else {
            await AuditLogManager.log({ action: 'delete_workflow', target: `Workflow:${workflowId}`, actor: userId, outcome: 'failure', details: { reason: 'not_found' } });
            throw new Error(`Workflow '${workflowId}' not found.`);
        }
    }

    // Example: Register a complex data processing workflow
    public static async registerExampleWorkflows(): Promise<void> {
        await this.registerWorkflow({
            workflowId: 'customer-sentiment-analysis',
            name: 'Automated Customer Sentiment Analysis',
            description: 'Analyzes customer feedback, extracts sentiment, and routes critical issues.',
            trigger: 'event_driven', // e.g., new feedback submission
            inputSchema: {
                type: 'object',
                properties: {
                    feedbackText: { type: 'string' },
                    customerId: { type: 'string' }
                },
                required: ['feedbackText', 'customerId']
            },
            outputSchema: {
                type: 'object',
                properties: {
                    sentiment: { type: 'string' },
                    issues: { type: 'array', items: { type: 'string' } },
                    escalationNeeded: { type: 'boolean' }
                }
            },
            version: '1.0.0',
            ownerId: 'system',
            permissions: { 'system': 'admin' },
            status: 'active',
            graph: [
                {
                    nodeId: 'extract-sentiment',
                    type: 'llm_call',
                    status: 'pending',
                    input: [],
                    output: [],
                    dependencies: [], // This is a start node
                    llmCallConfig: {
                        model: 'gemini-1.5-pro',
                        responseMimeType: 'application/json',
                        temperature: 0.3,
                        customParameters: {
                            prompt: "Analyze the following customer feedback for sentiment (positive, neutral, negative) and extract any critical issues mentioned. Output a JSON object like { \"sentiment\": \"string\", \"issues\": [\"string\"] }. Ensure you provide 'neutral' if no strong sentiment, and an empty array if no issues.\nFeedback: {input.feedbackText}"
                        }
                    }
                },
                {
                    nodeId: 'check-escalation',
                    type: 'data_transform',
                    status: 'pending',
                    input: [],
                    output: [],
                    dependencies: ['extract-sentiment'],
                    // This node simulates a transformation. In a real system, this could be a small function or another tool call.
                    // Its output will be used by the next node.
                },
                {
                    nodeId: 'decision-escalate',
                    type: 'decision_point',
                    status: 'pending',
                    input: [],
                    output: [],
                    dependencies: ['check-escalation'],
                    branchCondition: 'sentiment === "negative" || issues.length > 0', // Pseudo-code
                    metadata: { description: 'Decide if escalation is needed based on sentiment and issues' }
                },
                {
                    nodeId: 'send-critical-alert',
                    type: 'tool_call',
                    status: 'pending',
                    input: [],
                    output: [],
                    dependencies: ['decision-escalate'],
                    toolCall: {
                        toolName: 'notification_service', // Hypothetical tool (needs to be registered via ToolManager)
                        parameters: {
                            channel: 'slack-critical-support',
                            message: "Critical customer feedback received from {input.customerId}. Sentiment: {prev_node.sentiment}. Issues: {prev_node.issues}. Escalation needed.",
                            level: 'high'
                        },
                        callId: IDGenerator.generateTimeOrderedID('tool')
                    }
                },
                {
                    nodeId: 'log-feedback',
                    type: 'tool_call',
                    status: 'pending',
                    input: [],
                    output: [],
                    dependencies: ['extract-sentiment'],
                    toolCall: {
                        toolName: 'feedback_logger_service', // Hypothetical logging tool
                        parameters: {
                            customerId: '{input.customerId}',
                            sentiment: '{prev_node.sentiment}',
                            issues: '{prev_node.issues}',
                            rawFeedback: '{input.feedbackText}'
                        },
                        callId: IDGenerator.generateTimeOrderedID('tool')
                    }
                }
                // Add more nodes for parallel actions, human review, CRM updates, etc.
            ]
        });

        await ToolManager.registerTool({
            name: 'notification_service',
            description: 'Sends notifications to various channels (e.g., Slack, email).',
            inputSchema: {
                type: 'object',
                properties: {
                    channel: { type: 'string', description: 'Target channel for notification.' },
                    message: { type: 'string', description: 'The message content.' },
                    level: { type: 'string', enum: ['info', 'warning', 'high', 'critical'], default: 'info' }
                },
                required: ['channel', 'message']
            },
            outputSchema: { type: 'object', properties: { status: { type: 'string' } } },
            securityContext: 'system',
            executionPermissions: ['system']
        }, async (params: Record<string, any>): Promise<IContentPart[]> => {
            console.log(`[NOTIFICATION_SERVICE] Sending ${params.level} alert to ${params.channel}: ${params.message}`);
            return [{ type: Modality.Text, value: JSON.stringify({ status: 'sent', channel: params.channel, level: params.level }), mimeType: 'application/json' }];
        });

        await ToolManager.registerTool({
            name: 'feedback_logger_service',
            description: 'Logs customer feedback to a central system.',
            inputSchema: {
                type: 'object',
                properties: {
                    customerId: { type: 'string' },
                    sentiment: { type: 'string' },
                    issues: { type: 'array', items: { type: 'string' } },
                    rawFeedback: { type: 'string' }
                },
                required: ['customerId', 'sentiment', 'rawFeedback']
            },
            outputSchema: { type: 'object', properties: { logId: { type: 'string' } } },
            securityContext: 'system',
            executionPermissions: ['system']
        }, async (params: Record<string, any>): Promise<IContentPart[]> => {
            console.log(`[FEEDBACK_LOGGER] Logging feedback for ${params.customerId}: Sentiment=${params.sentiment}`);
            // In a real system, this would call FeedbackLoopManager.submitFeedback
            await FeedbackLoopManager.submitFeedback({
                feedbackId: IDGenerator.generateUUID('fb'),
                timestamp: new Date().toISOString(),
                userId: params.customerId, // Assuming customerId can act as userId
                sessionId: '', // Not tied to a specific session here
                rating: params.sentiment === 'positive' ? 1 : (params.sentiment === 'negative' ? -1 : 0),
                comment: params.rawFeedback,
                category: 'helpfulness',
                status: 'new', priority: params.issues?.length > 0 ? 'high' : 'medium'
            });
            return [{ type: Modality.Text, value: JSON.stringify({ logId: IDGenerator.generateUUID('log') }), mimeType: 'application/json' }];
        });
    }
}

/**
 * Manages user authentication, authorization, and profile information.
 */
export class UserManager {
    private static userProfiles: Map<UserID, any> = new Map(); // Store user-specific data (e.g., preferences, permissions)

    public static async authenticate(credentials: any): Promise<{ userId