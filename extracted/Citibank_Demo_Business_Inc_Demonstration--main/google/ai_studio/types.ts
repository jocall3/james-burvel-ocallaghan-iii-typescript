// google/ai_studio/types.ts
// The Language of Thought. Defines the structure of a conversation with the AI,
// expanding into a comprehensive universe for AI development, deployment, and management.

// --- Core Model Definitions ---

/**
 * Defines the type of an AI model, encompassing various modalities and capabilities.
 * This list is vastly expanded to reflect a decade of AI advancement.
 */
export type ModelType =
    | 'gemini-2.5-flash'
    | 'gemini-1.5-pro-vision-latest'
    | 'gemini-1.5-flash-extended'
    | 'imagen-4.0-generate-001'
    | 'imagen-4.1-high-res-pro'
    | 'veo-2.0-generate-001'
    | 'veo-2.1-long-form-hd'
    | 'audio-scribe-3.0-multilingual'
    | 'audio-generate-2.0-music-synthesis'
    | 'code-gemini-enterprise-2.0'
    | 'code-assist-2.1-refactor'
    | 'code-debug-3.0-static-analyzer'
    | 'robotics-actuation-1.0-sim'
    | 'robotics-perception-2.0-realtime'
    | 'med-gemini-diagnostic-expert'
    | 'legal-gemini-contract-analyzer'
    | 'finance-gemini-market-predictor'
    | '3d-gen-mesh-2.0-pbr'
    | '3d-gen-scene-3.0-interactive'
    | 'synthetic-data-tabular-2.0'
    | 'synthetic-data-multimodal-1.0'
    | 'graph-deepmind-inference-1.0'
    | 'recommendation-engine-pro-5.0'
    | 'nlp-semantic-search-4.0'
    | 'nlp-translation-adaptive-3.0'
    | 'vision-object-detection-6.0'
    | 'vision-segmentation-7.0'
    | 'speech-synthesis-human-plus'
    | 'speech-recognition-live-adaptive'
    | 'knowledge-graph-reasoning-2.0'
    | 'multimodal-reasoning-agent-3.0';

/**
 * Represents a single piece of content within a multimodal prompt or response.
 * This can be text, an image, an audio clip, a video segment, or a structured tool call.
 */
export type Part =
    | { text: string }
    | { inlineData: { mimeType: string; data: string } } // Base64 encoded data
    | { fileData: { fileUri: string; mimeType: string } }
    | { functionCall: FunctionCall }
    | { functionResponse: FunctionResponse }
    | { toolCode: ToolCode }; // For interactive code execution within the AI

/**
 * Represents a block of content, potentially containing multiple parts, structured for
 * more complex multimodal interactions.
 */
export interface ContentBlock {
    parts: Part[];
}

/**
 * Represents a message in a conversation, including the sender's role and its content.
 */
export interface Message {
    role: 'user' | 'model' | 'system' | 'tool';
    content: ContentBlock | ContentBlock[]; // Allow single or multiple blocks
    timestamp?: string; // ISO 8601
    messageId?: string; // Unique identifier for the message
    metadata?: Record<string, any>; // Additional message-specific metadata
}

/**
 * Defines the structure for making a request to an AI model.
 * Expanded to support multi-modal input, conversational context, and advanced controls.
 */
export interface PromptRequest {
    model: ModelType | string; // Allow custom/fine-tuned models by name/URI
    contents: ContentBlock[]; // Unified input for multimodal prompts
    conversationHistory?: Message[]; // Prior turns for contextual generation
    generationConfig?: GenerationConfig;
    safetySettings?: SafetySetting[];
    tools?: Tool[]; // Tools available for the model to call
    systemInstruction?: ContentBlock | ContentBlock[]; // Persistent instructions for the model
    retrievalConfig?: RetrievalConfig; // Configuration for RAG (Retrieval Augmented Generation)
    experimentId?: string; // For A/B testing or specific experiment tracking
    stream?: boolean; // Whether to stream the response
    parameters?: Record<string, any>; // Deprecated but kept for backward compatibility; prefer generationConfig
}

/**
 * Defines parameters for controlling the generation process of the AI model.
 * Greatly expanded for fine-grained control.
 */
export interface GenerationConfig {
    temperature?: number; // 0.0 - 1.0 (creativity)
    topP?: number; // 0.0 - 1.0 (nucleus sampling)
    topK?: number; // Integer (token choice)
    candidateCount?: number; // Number of response candidates to generate
    maxOutputTokens?: number; // Max length of generated output
    stopSequences?: string[]; // Sequences that will stop generation
    responseMimeType?: string; // e.g., 'application/json', 'text/plain', 'image/png'
    seed?: number; // For reproducible generation
    repetitionPenalty?: number; // Reduce repetition of common phrases
    frequencyPenalty?: number; // Reduce repetition of specific tokens
    presencePenalty?: number; // Encourage new topics
    grammarConstraint?: GrammarConstraint; // Enforce specific grammar/JSON schema
    outputFormat?: 'text' | 'json' | 'markdown' | 'xml'; // Preferred output format
    enableAttribution?: boolean; // Request source attribution where possible
    language?: string; // Target language for generation (e.g., 'en-US', 'fr-FR')
    styleGuideUri?: string; // URI to a specific style guide or tone definition
}

/**
 * Defines parameters for enforcing structured output like JSON schema.
 */
export interface GrammarConstraint {
    type: 'json_schema' | 'regex';
    schema?: Record<string, any>; // JSON schema definition
    pattern?: string; // Regular expression pattern
}

/**
 * Defines safety settings to filter potentially harmful content in AI responses.
 */
export interface SafetySetting {
    category: SafetyCategory;
    threshold: SafetyThreshold;
}

/**
 * Categories of harmful content.
 */
export type SafetyCategory =
    | 'HARM_CATEGORY_UNSPECIFIED'
    | 'HARM_CATEGORY_HARASSMENT'
    | 'HARM_CATEGORY_HATE_SPEECH'
    | 'HARM_CATEGORY_SEXUALLY_EXPLICIT'
    | 'HARM_CATEGORY_DANGEROUS_CONTENT'
    | 'HARM_CATEGORY_MEDICAL_ADVICE'
    | 'HARM_CATEGORY_LEGAL_ADVICE'
    | 'HARM_CATEGORY_FINANCIAL_ADVICE'
    | 'HARM_CATEGORY_CRITICAL_INFRASTRUCTURE'
    | 'HARM_CATEGORY_MISINFORMATION'
    | 'HARM_CATEGORY_PRIVACY_VIOLATION';

/**
 * Thresholds for safety categories.
 */
export type SafetyThreshold =
    | 'BLOCK_NONE'
    | 'BLOCK_FEW'
    | 'BLOCK_SOME'
    | 'BLOCK_MOST';

/**
 * Configuration for Retrieval Augmented Generation (RAG).
 */
export interface RetrievalConfig {
    source: 'vector_store' | 'document_collection' | 'web_search';
    vectorStoreIds?: string[]; // IDs of vector stores to query
    documentCollectionIds?: string[]; // IDs of document collections
    query?: string; // Specific query for retrieval, if different from prompt
    topK?: number; // Number of retrieval results to use
    rerankStrategy?: 'semantic' | 'keyword' | 'hybrid';
    filters?: Record<string, any>; // Metadata filters for retrieval
    customApiEndpoint?: string; // For integrating custom retrieval services
}

/**
 * Represents a tool that the model can call.
 * This includes function declarations, code interpreters, or external APIs.
 */
export interface Tool {
    functionDeclarations?: FunctionDeclaration[];
    codeInterpreter?: CodeInterpreterConfig;
    externalApiSpec?: ExternalApiSpec; // OpenAPI spec URI
    knowledgeBaseId?: string; // ID of a connected knowledge base
    customToolId?: string; // ID for a custom, pre-registered tool
}

/**
 * Describes a function that the model can invoke.
 */
export interface FunctionDeclaration {
    name: string;
    description?: string;
    parameters: Record<string, any>; // JSON Schema for function parameters
}

/**
 * Represents a call to a function by the model.
 */
export interface FunctionCall {
    name: string;
    args: Record<string, any>;
}

/**
 * Represents the response from a function call.
 */
export interface FunctionResponse {
    name: string;
    response: Record<string, any>;
}

/**
 * Configuration for an in-model code interpreter.
 */
export interface CodeInterpreterConfig {
    enable: boolean;
    language?: 'python' | 'javascript' | 'bash'; // Supported languages
    libraries?: string[]; // Allowed libraries/packages
    environment?: Record<string, string>; // Environment variables for the interpreter
    timeoutSeconds?: number;
    accessRemoteResources?: boolean; // Whether the interpreter can access external resources (e.g., internet)
}

/**
 * Represents code snippets or commands to be executed by an internal or external tool.
 */
export interface ToolCode {
    language: 'python' | 'javascript' | 'bash' | 'sql' | 'r';
    code: string;
    executionMode?: 'interpret' | 'execute_sandbox';
}

/**
 * Represents an external API specification, e.g., an OpenAPI/Swagger URI.
 */
export interface ExternalApiSpec {
    uri: string; // URI to the OpenAPI/Swagger definition
    authentication?: ApiAuthentication;
    description?: string;
}

/**
 * Authentication details for external APIs.
 */
export type ApiAuthentication =
    | { type: 'api_key'; headerName: string; key: string }
    | { type: 'oauth2'; clientId: string; clientSecret: string; tokenUrl: string; scope: string[] }
    | { type: 'bearer_token'; token: string }
    | { type: 'none' };

/**
 * Defines the structure of a response from an AI model.
 * Expanded for streaming, multi-candidate, safety ratings, and usage metadata.
 */
export interface PromptResponse {
    candidates?: Candidate[]; // One or more generated candidates
    promptFeedback?: PromptFeedback; // Feedback on the prompt itself
    usageMetadata?: UsageMetadata; // Information about tokens, cost, etc.
    error?: ResponseError; // Detailed error information
    responseId?: string; // Unique ID for this specific response transaction
    latencyMs?: number; // Time taken to generate the response
    streamingState?: StreamingState; // For streaming responses
    debugInfo?: Record<string, any>; // Detailed debugging information
}

/**
 * Represents a single generated output from the AI model.
 */
export interface Candidate {
    content: ContentBlock[];
    finishReason?: FinishReason;
    safetyRatings?: SafetyRating[];
    citationSources?: CitationSource[];
    index?: number; // For batch or multi-candidate responses
    customMetadata?: Record<string, any>; // Model-specific output metadata
    groundingAttributions?: GroundingAttribution[]; // Specific attributions for parts of the content
}

/**
 * Reason for the model stopping generation.
 */
export type FinishReason =
    | 'FINISH_REASON_UNSPECIFIED'
    | 'STOP' // Model generated a natural stop point
    | 'MAX_TOKENS' // Reached max_output_tokens
    | 'SAFETY' // Content was flagged by safety settings
    | 'RECITATION' // Model possibly recited copyrighted material
    | 'OTHER'; // Other reasons

/**
 * Rating for a specific safety category.
 */
export interface SafetyRating {
    category: SafetyCategory;
    probability: SafetyProbability;
    blocked: boolean;
    severity?: SafetySeverity; // More granular severity
}

export type SafetyProbability =
    | 'UNSPECIFIED'
    | 'NEGLIGIBLE'
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH';

export type SafetySeverity =
    | 'SEVERITY_UNSPECIFIED'
    | 'SEVERITY_LOW'
    | 'SEVERITY_MEDIUM'
    | 'SEVERITY_HIGH'
    | 'SEVERITY_CRITICAL';

/**
 * Source of citation for generated content.
 */
export interface CitationSource {
    startIndex?: number;
    endIndex?: number;
    uri?: string;
    license?: string;
    publicationDate?: string; // ISO 8601
    title?: string;
    authors?: string[];
    retrievalSource?: RetrievalSource; // Details about the RAG source
}

/**
 * Details about a specific retrieval source for grounding.
 */
export interface RetrievalSource {
    sourceId: string; // e.g., vector store ID, document ID
    documentName?: string;
    chunkId?: string;
    relevanceScore?: number; // How relevant this chunk was to the query
    metadata?: Record<string, any>; // Any specific metadata from the retrieved chunk
}

/**
 * Attributions for specific parts of the generated content.
 */
export interface GroundingAttribution {
    startIndex: number;
    endIndex: number;
    retrievalSources: RetrievalSource[];
}

/**
 * Feedback on the prompt itself, e.g., if it violated safety policies.
 */
export interface PromptFeedback {
    blockReason?: BlockReason;
    safetyRatings?: SafetyRating[];
}

export type BlockReason =
    | 'BLOCK_REASON_UNSPECIFIED'
    | 'SAFETY'
    | 'OTHER';

/**
 * Usage metadata for a generation request.
 */
export interface UsageMetadata {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
    costUsd?: number; // Estimated cost in USD
    cachedResponseUsed?: boolean; // Whether a cached response was served
    modelId?: string; // The specific model version used (e.g., "gemini-1.5-pro-v2-001")
    billedCharacters?: number; // For character-based models
    inputImageCount?: number;
    inputAudioDurationSeconds?: number;
    outputImageCount?: number;
    outputAudioDurationSeconds?: number;
    outputVideoDurationSeconds?: number;
}

/**
 * Detailed error response.
 */
export interface ResponseError {
    code: number; // HTTP status code or custom error code
    message: string;
    details?: Record<string, any>;
    timestamp?: string; // ISO 8601
    traceId?: string; // For tracing errors through systems
}

/**
 * Represents a chunk of a streaming response.
 */
export interface StreamingResponsePart {
    candidate?: Candidate;
    usageMetadata?: UsageMetadata;
    promptFeedback?: PromptFeedback;
    responseId?: string;
    debugInfo?: Record<string, any>;
    // Indicates if this is the final part of the stream.
    isLast?: boolean;
}

/**
 * Current state of a streaming response.
 */
export type StreamingState =
    | 'STREAMING_STATE_UNSPECIFIED'
    | 'STREAMING_STATE_ACTIVE'
    | 'STREAMING_STATE_PAUSED'
    | 'STREAMING_STATE_COMPLETE'
    | 'STREAMING_STATE_ERROR';

// --- Global Configuration & Platform Management ---

/**
 * Global configuration for the AI Studio SDK/Client.
 */
export interface StudioConfig {
    apiKey: string;
    projectId: string;
    region?: string; // e.g., 'us-central1'
    endpoint?: string; // Custom API endpoint
    apiVersion?: string;
    defaultModel?: ModelType | string;
    defaultGenerationConfig?: GenerationConfig;
    defaultSafetySettings?: SafetySetting[];
    telemetryEnabled?: boolean;
    cacheEnabled?: boolean;
    requestTimeoutMs?: number;
    rateLimitConcurrency?: number;
    maxRetries?: number;
}

/**
 * Represents an organization using the AI Studio.
 */
export interface Organization {
    id: string;
    name: string;
    adminIds: string[];
    memberIds: string[];
    createdAt: string;
    updatedAt: string;
    metadata?: Record<string, any>;
    billingAccountId?: string;
}

/**
 * Represents a user within an organization.
 */
export interface UserProfile {
    id: string;
    email: string;
    displayName?: string;
    organizationId?: string;
    roles: UserRole[];
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
    preferences?: UserPreferences;
}

/**
 * Defines roles for users within the AI Studio platform.
 */
export type UserRole =
    | 'OWNER'
    | 'ADMIN'
    | 'DEVELOPER'
    | 'DATA_SCIENTIST'
    | 'EVALUATOR'
    | 'AUDITOR'
    | 'VIEWER';

/**
 * User-specific preferences.
 */
export interface UserPreferences {
    theme?: 'light' | 'dark' | 'system';
    notificationSettings?: NotificationSettings;
    defaultLanguage?: string;
    editorSettings?: EditorSettings;
}

export interface NotificationSettings {
    emailEnabled: boolean;
    inAppEnabled: boolean;
    webhookEnabled: boolean;
    subscribedEvents: string[]; // e.g., 'model.deployment.failed', 'dataset.update'
}

export interface EditorSettings {
    fontSize?: number;
    codeTheme?: string;
    indentation?: 'spaces' | 'tabs';
    tabSize?: number;
    lintingEnabled?: boolean;
    autoSaveDelayMs?: number;
}

/**
 * Represents a workspace containing multiple projects.
 */
export interface Workspace {
    id: string;
    name: string;
    organizationId: string;
    description?: string;
    memberRoles: Record<string, UserRole[]>; // userId -> roles
    createdAt: string;
    updatedAt: string;
    region?: string;
    resourceQuotas?: ResourceQuota[];
    metadata?: Record<string, any>;
}

/**
 * Represents an AI project within a workspace.
 */
export interface Project {
    id: string;
    name: string;
    workspaceId: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    status: ProjectStatus;
    tags?: string[];
    defaultEnvironment?: EnvironmentType;
    versionControlConfig?: VersionControlConfig;
}

export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'SUSPENDED';

/**
 * Defines configuration for version control integration (e.g., Git).
 */
export interface VersionControlConfig {
    provider: 'github' | 'gitlab' | 'bitbucket' | 'azure_devops' | 'internal';
    repositoryUrl: string;
    branch?: string;
    accessTokenSecretName?: string; // Secret manager name for access token
    syncMode?: 'manual' | 'auto_push' | 'auto_pull';
    codebaseRootPath?: string; // Path within the repo where project assets are
}

// --- Data Management ---

/**
 * Represents the type of data stored in a dataset.
 */
export type DataType =
    | 'TEXT'
    | 'IMAGE'
    | 'VIDEO'
    | 'AUDIO'
    | 'CODE'
    | 'TABULAR'
    | '3D_MESH'
    | 'SENSOR_DATA'
    | 'DOCUMENT'
    | 'CONVERSATION' // For chat logs
    | 'GRAPH_DATA'
    | 'MIXED_MULTIMODAL';

/**
 * Represents a single entry of data within a dataset.
 */
export interface DataEntry {
    id: string;
    dataType: DataType;
    uri: string; // URI to the actual data (e.g., GCS, S3, internal storage)
    metadata?: Record<string, any>; // e.g., image dimensions, audio duration, tags
    annotations?: Annotation[]; // Associated annotations
    createdAt: string;
    updatedAt: string;
    sourceDatasetId?: string; // If this entry originated from another dataset
    embedding?: number[]; // Pre-computed embedding for the data entry
}

/**
 * Represents a collection of data entries, often used for training or evaluation.
 */
export interface Dataset {
    id: string;
    name: string;
    projectId: string;
    description?: string;
    dataType: DataType;
    entryCount: number;
    version: number;
    schema?: Record<string, any>; // JSON schema for metadata
    tags?: string[];
    createdAt: string;
    updatedAt: string;
    status: DatasetStatus;
    sourceUris?: string[]; // Original source locations
    accessControl?: AccessControlPolicy;
    dataGovernance?: DataGovernancePolicy;
}

export type DatasetStatus = 'DRAFT' | 'PREPROCESSING' | 'READY' | 'ARCHIVED' | 'FAILED_PROCESSING';

/**
 * Represents an annotation applied to a data entry.
 */
export interface Annotation {
    id: string;
    dataEntryId: string;
    type: AnnotationType;
    label: string | Record<string, any>; // Can be a simple string or a complex JSON object
    annotatorId?: string; // User ID or automated system ID
    createdAt: string;
    updatedAt: string;
    confidence?: number; // For automated annotations
    segment?: TimeSeriesSegment | BoundingBox | Polygon | TranscriptSegment; // Specific to data type
    metadata?: Record<string, any>;
}

export type AnnotationType =
    | 'CLASSIFICATION'
    | 'OBJECT_DETECTION'
    | 'SEMANTIC_SEGMENTATION'
    | 'TRANSCRIPTION'
    | 'KEYPOINT'
    | 'EVENT'
    | 'RELATIONSHIP'
    | 'SENTIMENT'
    | 'NAMED_ENTITY_RECOGNITION'
    | 'BOUNDING_BOX_3D'
    | 'ACTION_RECOGNITION';

/**
 * Generic time-series segment for audio/video.
 */
export interface TimeSeriesSegment {
    startTimeSeconds: number;
    endTimeSeconds: number;
}

/**
 * Bounding box for object detection.
 */
export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
    unit?: 'pixel' | 'ratio';
}

/**
 * Polygon for semantic segmentation.
 */
export interface Polygon {
    points: { x: number; y: number }[];
    unit?: 'pixel' | 'ratio';
}

/**
 * Transcript segment for audio/video.
 */
export interface TranscriptSegment {
    text: string;
    speakerId?: string;
    confidence?: number;
    startTimeOffsetMs?: number;
    endTimeOffsetMs?: number;
}

/**
 * Configuration for data labeling jobs.
 */
export interface LabelingJobConfig {
    datasetId: string;
    taskType: AnnotationType;
    instructionsUri?: string; // URI to labeling guidelines
    workerPoolId?: string; // For managed human labeling services
    automatedPrelabelingModelId?: string;
    reviewConfig?: LabelingReviewConfig;
    budgetUsd?: number;
    deadline?: string; // ISO 8601
    outputDatasetId?: string; // Dataset to store labeled data
}

/**
 * Configuration for human review of labels.
 */
export interface LabelingReviewConfig {
    reviewerIds?: string[]; // Specific users
    reviewPercentage?: number; // % of data to review
    consensusThreshold?: number; // Min agreement for auto-approval
    reviewWorkflow?: ReviewWorkflow; // e.g., 'sequential', 'random_sample'
}

export type ReviewWorkflow = 'NONE' | 'SEQUENTIAL' | 'CONSENSUS' | 'ACTIVE_LEARNING_SUGGESTED';

/**
 * Represents a data augmentation strategy.
 */
export interface DataAugmentationStrategy {
    type: 'IMAGE_ROTATION' | 'TEXT_SYNONYM_REPLACEMENT' | 'AUDIO_NOISE_ADDITION' | 'VIDEO_FLIP' | 'TABULAR_SMOTE';
    parameters: Record<string, any>;
    probability: number; // Likelihood of applying this augmentation
}

// --- Model Lifecycle Management ---

/**
 * Represents a trainable or deployable AI model asset.
 */
export interface ModelAsset {
    id: string;
    name: string;
    projectId: string;
    baseModelType: ModelType | string;
    description?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
    ownerId: string;
    accessControl?: AccessControlPolicy;
    modelRegistryId?: string; // If registered in a central model registry
    modelFamily?: string; // e.g., 'Gemini', 'Imagen'
}

/**
 * Represents a specific version of a model, potentially fine-tuned.
 */
export interface ModelVersion {
    id: string;
    modelAssetId: string;
    versionNumber: number;
    description?: string;
    fineTuningJobId?: string; // If this version came from a fine-tuning job
    baseModelVersionId?: string; // Which model version it was fine-tuned from
    sourceUri?: string; // URI to the model artifacts
    trainingDatasetIds?: string[];
    evaluationMetrics?: ModelEvaluationMetrics;
    status: ModelVersionStatus;
    createdAt: string;
    updatedAt: string;
    commitHash?: string; // If linked to a version control system
    deploymentCount?: number; // How many active deployments are using this version
    license?: ModelLicense;
    provenance?: ModelProvenance;
}

export type ModelVersionStatus = 'DRAFT' | 'TRAINING' | 'TRAINED' | 'FAILED' | 'READY_FOR_DEPLOYMENT' | 'DEPRECATED';

/**
 * License information for a model.
 */
export interface ModelLicense {
    type: 'PROPRIETARY' | 'APACHE_2_0' | 'MIT' | 'COMMERCIAL_WITH_RESTRICTIONS';
    uri?: string; // URI to full license text
    attributionRequired?: boolean;
    commercialUseAllowed?: boolean;
}

/**
 * Provenance details for a model.
 */
export interface ModelProvenance {
    parentModelIds?: string[]; // IDs of models it was derived from
    researchPaperUris?: string[];
    contributorIds?: string[];
    releaseNotesUri?: string;
}

/**
 * Configuration for a model fine-tuning job.
 */
export interface FineTuningJobConfig {
    id: string;
    modelAssetId: string;
    trainingDatasetId: string;
    validationDatasetId?: string;
    hyperparameters: Hyperparameters;
    learningRateScheduler?: LearningRateScheduler;
    optimizationStrategy?: OptimizationStrategy;
    acceleratorType?: AcceleratorType;
    budgetUsd?: number;
    maxDurationSeconds?: number;
    earlyStoppingConfig?: EarlyStoppingConfig;
    outputModelVersionId?: string; // ID of the model version created by this job
    status: TrainingJobStatus;
    createdAt: string;
    updatedAt: string;
    environmentVariables?: Record<string, string>; // For custom training scripts
    customTrainingScriptUri?: string;
    monitoringConfig?: FineTuningMonitoringConfig;
}

export type AcceleratorType = 'NVIDIA_A100' | 'NVIDIA_H100' | 'TPU_V4' | 'CPU' | 'GPU_GENERIC';

export type TrainingJobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

/**
 * Hyperparameters for model training.
 */
export interface Hyperparameters {
    epochs?: number;
    batchSize?: number;
    learningRate?: number;
    optimizer?: 'ADAM' | 'SGD' | 'ADAMW' | 'RMSPROP';
    warmupSteps?: number;
    weightDecay?: number;
    dropoutRate?: number;
    loraConfig?: LoRAConfig; // Low-Rank Adaptation
    quantizationConfig?: QuantizationConfig;
    adapterConfig?: AdapterConfig; // For adapter-based fine-tuning
    customParameters?: Record<string, any>;
}

export interface LoRAConfig {
    r: number; // Rank of update matrices
    loraAlpha: number; // Scaling factor
    loraDropout?: number;
    targetModules?: string[]; // Which model layers to apply LoRA to
}

export interface QuantizationConfig {
    type: 'INT8' | 'FP16' | 'BFLOAT16';
    method?: 'post_training' | 'quantization_aware';
}

export interface AdapterConfig {
    adapterType: 'bottleneck' | 'prefix_tuning' | 'prompt_tuning';
    bottleneckDim?: number;
    numVirtualTokens?: number;
}

/**
 * Learning rate scheduler configuration.
 */
export interface LearningRateScheduler {
    type: 'COSINE' | 'LINEAR_WARMUP' | 'STEP';
    initialLearningRate?: number;
    decaySteps?: number;
    decayRate?: number;
    warmupSteps?: number;
}

/**
 * Optimization strategy for fine-tuning.
 */
export interface OptimizationStrategy {
    type: 'DISTRIBUTED_TRAINING' | 'FEDERATED_LEARNING' | 'MIXED_PRECISION' | 'GRADIENT_ACCUMULATION';
    parameters?: Record<string, any>;
}

/**
 * Early stopping configuration to prevent overfitting.
 */
export interface EarlyStoppingConfig {
    metric: EvaluationMetricType;
    patience: number; // Number of epochs to wait for improvement
    minDelta: number; // Minimum change to qualify as an improvement
    mode: 'min' | 'max'; // Whether to minimize or maximize the metric
}

/**
 * Monitoring configuration during fine-tuning.
 */
export interface FineTuningMonitoringConfig {
    logFrequencySeconds?: number;
    dashboardEnabled?: boolean;
    alertingConfig?: AlertingConfig;
    metricCollectors?: MetricCollector[]; // Custom metric collectors
}

/**
 * Represents a deployed instance of a model.
 */
export interface ModelDeployment {
    id: string;
    modelAssetId: string;
    modelVersionId: string;
    projectId: string;
    endpointUri: string; // The URL/URI to access the deployed model
    deploymentConfig: DeploymentConfig;
    status: DeploymentStatus;
    createdAt: string;
    updatedAt: string;
    deployedBy: string; // User ID
    tags?: string[];
    monitoringJobId?: string; // Link to associated monitoring job
    healthChecks?: HealthCheckResult[];
    trafficSplit?: Record<string, number>; // model_version_id -> traffic percentage
    rollbackConfiguration?: RollbackConfiguration;
}

export type DeploymentStatus = 'PROVISIONING' | 'RUNNING' | 'UPDATING' | 'FAILED' | 'STOPPED' | 'SCALING';

/**
 * Configuration for model deployment.
 */
export interface DeploymentConfig {
    instanceType: ComputeInstanceType;
    minReplicas: number;
    maxReplicas: number;
    scalingStrategy: ScalingStrategy;
    environmentType: EnvironmentType;
    region?: string;
    containerImageUri?: string; // Custom Docker image for deployment
    machineAccelerators?: AcceleratorType[];
    trafficWeight?: number; // For A/B testing or gradual rollout
    vpcNetworkConfig?: VpcNetworkConfig;
    resourceAllocation?: ResourceAllocation;
    autoscalingPolicy?: AutoscalingPolicy;
    metadata?: Record<string, any>;
    secretMounts?: SecretMount[]; // Secrets to mount in the deployment environment
}

export type ComputeInstanceType = 'CPU_SMALL' | 'CPU_MEDIUM' | 'CPU_LARGE' | 'GPU_SMALL' | 'GPU_MEDIUM' | 'GPU_LARGE' | 'TPU_POD';

export type ScalingStrategy = 'AUTO_SCALE' | 'MANUAL_SCALE' | 'ZERO_TO_ONE_SCALE';

export type EnvironmentType = 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION' | 'SANDBOX';

/**
 * VPC network configuration for secure deployments.
 */
export interface VpcNetworkConfig {
    networkId: string;
    subnetworkId: string;
    enablePrivateIp?: boolean;
    firewallRules?: string[]; // Specific firewall rule IDs
}

/**
 * Resource allocation for a deployment instance.
 */
export interface ResourceAllocation {
    cpuCores: number;
    memoryGb: number;
    gpuCount?: number;
    storageGb?: number;
}

/**
 * Advanced autoscaling policy.
 */
export interface AutoscalingPolicy {
    metric: 'CPU_UTILIZATION' | 'GPU_UTILIZATION' | 'QPS' | 'LATENCY_P99';
    targetUtilization: number; // e.g., 0.7 for 70% CPU utilization
    cooldownPeriodSeconds?: number;
    scaleInThreshold?: number;
    scaleOutThreshold?: number;
}

/**
 * Configuration for mounting secrets (e.g., API keys, database credentials).
 */
export interface SecretMount {
    secretId: string; // Identifier in a secret manager
    mountPath: string; // Path within the container
    version?: string; // Specific secret version
}

/**
 * Result of a health check on a deployed model.
 */
export interface HealthCheckResult {
    timestamp: string; // ISO 8601
    status: 'HEALTHY' | 'UNHEALTHY' | 'UNKNOWN';
    details?: string;
    latencyMs?: number;
    errorCount?: number;
}

/**
 * Configuration for automatic rollback in case of deployment failure.
 */
export interface RollbackConfiguration {
    enabled: boolean;
    targetModelVersionId?: string; // Version to rollback to
    triggerMetrics?: RollbackTriggerMetric[];
    rollbackDelaySeconds?: number;
}

export interface RollbackTriggerMetric {
    metricName: string; // e.g., 'error_rate', 'latency_p99', 'model_quality_score'
    threshold: number;
    operator: 'GREATER_THAN' | 'LESS_THAN' | 'EQUALS';
    timeWindowSeconds: number;
}

// --- Evaluation & Monitoring ---

/**
 * Represents the configuration for a model evaluation job.
 */
export interface EvaluationJobConfig {
    id: string;
    projectId: string;
    targetModelVersionId: string; // Model to be evaluated
    evaluationDatasetId: string; // Dataset for evaluation
    metrics: EvaluationMetricConfig[];
    comparisonModelVersionId?: string; // Optional: for A/B testing
    humanInTheLoopConfig?: HumanInTheLoopConfig;
    createdAt: string;
    updatedAt: string;
    status: EvaluationJobStatus;
    resultOutputUri?: string; // URI where detailed results are stored
    schedule?: ScheduleConfig; // For recurring evaluations
    alertingConfig?: AlertingConfig;
}

export type EvaluationJobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

/**
 * Configuration for a specific evaluation metric.
 */
export interface EvaluationMetricConfig {
    metricType: EvaluationMetricType;
    parameters?: Record<string, any>; // e.g., 'k' for Top-K accuracy
    groundTruthColumn?: string; // Column in dataset for ground truth
    predictionColumn?: string; // Column for model predictions
    threshold?: number; // For pass/fail criteria
    comparisonMetricType?: EvaluationMetricType; // For custom comparison logic
}

/**
 * Type of evaluation metric.
 */
export type EvaluationMetricType =
    | 'ACCURACY'
    | 'PRECISION'
    | 'RECALL'
    | 'F1_SCORE'
    | 'BLEU' // Text generation
    | 'ROUGE' // Text summarization
    | 'PERPLEXITY' // Language models
    | 'MSE' // Regression
    | 'RMSE'
    | 'MAE'
    | 'AUC_ROC' // Classification
    | 'AUC_PR'
    | 'IMAGE_FID' // Image generation
    | 'IMAGE_CLIP_SCORE'
    | 'AUDIO_WER' // Speech recognition
    | 'AUDIO_PESQ' // Speech synthesis
    | 'LATENCY_P90' // Performance
    | 'THROUGHPUT_QPS'
    | 'CARBON_FOOTPRINT_KGCO2E'
    | 'FAIRNESS_DEMOGRAPHIC_PARITY'
    | 'ROBUSTNESS_ADVERSARIAL_ATTACK'
    | 'TRUST_HUMAN_RATING'
    | 'RAG_CONTEXT_RELEVANCE'
    | 'RAG_FAITHFULNESS'
    | 'AGENT_TASK_SUCCESS_RATE'
    | 'AGENT_STEP_COUNT'
    | 'CUSTOM_SCRIPT_METRIC';

/**
 * Configuration for Human-in-the-Loop (HITL) evaluation.
 */
export interface HumanInTheLoopConfig {
    reviewerPoolId: string; // ID of a group of human reviewers
    sampleRate: number; // Percentage of examples to send for human review
    reviewTaskInstructionsUri?: string;
    consensusRequired?: boolean;
    goldenSetReviewProbability?: number; // Probability of sending golden set examples
    outputDatasetId?: string; // Dataset to store human feedback annotations
}

/**
 * Represents the results of a model evaluation job.
 */
export interface EvaluationResult {
    id: string;
    evaluationJobId: string;
    modelVersionId: string;
    datasetId: string;
    metrics: MetricValue[];
    comparisonMetrics?: MetricValue[]; // If comparing against another model
    artifactsUri?: string; // URI to detailed reports, plots, etc.
    createdAt: string;
    completedAt: string;
    overallStatus: 'PASS' | 'FAIL' | 'IN_PROGRESS';
    feedbackCount?: number; // Number of human feedback entries collected
    analysisSummary?: string; // High-level summary of findings
    biasReport?: BiasReport; // Link to detailed bias report
    explainabilityReport?: ExplainabilityReport; // Link to XAI report
}

/**
 * A single metric value with its type.
 */
export interface MetricValue {
    metricType: EvaluationMetricType;
    value: number;
    unit?: string;
    thresholdMet?: boolean;
    confidenceInterval?: { lower: number; upper: number };
    baselineValue?: number; // If compared against a baseline
    segmentation?: Record<string, MetricValue>; // Metrics segmented by categories (e.g., gender, age)
}

/**
 * Configuration for ongoing model monitoring in production.
 */
export interface MonitoringConfig {
    id: string;
    projectId: string;
    modelDeploymentId: string;
    schedule: ScheduleConfig;
    metricsToMonitor: MonitoringMetricConfig[];
    alertingConfig: AlertingConfig;
    dataCaptureConfig?: DataCaptureConfig; // Configuration for capturing production data
    driftDetectionConfig?: DriftDetectionConfig;
    anomalyDetectionConfig?: AnomalyDetectionConfig;
    createdAt: string;
    updatedAt: string;
    status: MonitoringJobStatus;
    dashboardUri?: string;
}

export type MonitoringJobStatus = 'ACTIVE' | 'PAUSED' | 'ERROR' | 'STOPPED';

/**
 * Configuration for a specific monitoring metric.
 */
export interface MonitoringMetricConfig {
    metricType: MonitoringMetricType;
    threshold: number;
    operator: 'GREATER_THAN' | 'LESS_THAN' | 'PERCENTAGE_CHANGE';
    timeWindowSeconds: number;
    baselineSource?: 'TRAINING_DATA' | 'PREVIOUS_PERIOD' | 'CUSTOM_DATASET';
    baselineDatasetId?: string; // If 'CUSTOM_DATASET'
}

export type MonitoringMetricType =
    | 'PREDICTION_LATENCY_P99'
    | 'ERROR_RATE'
    | 'QPS'
    | 'CPU_UTILIZATION'
    | 'MEMORY_UTILIZATION'
    | 'GPU_UTILIZATION'
    | 'DATA_INPUT_DRIFT' // Change in input data distribution
    | 'MODEL_PREDICTION_DRIFT' // Change in model output distribution
    | 'FEATURE_ATTRIBUTION_DRIFT' // Change in feature importance
    | 'ETHICAL_BIAS_DRIFT' // Change in fairness metrics over time
    | 'COST_PER_INFERENCE'
    | 'MODEL_QUALITY_DEGRADATION' // Based on evaluation metrics
    | 'SECURITY_VULNERABILITY_SCAN';

/**
 * Configuration for data capture in production.
 */
export interface DataCaptureConfig {
    inputCaptureEnabled: boolean;
    outputCaptureEnabled: boolean;
    sampleRate: number; // Percentage of requests to capture
    destinationUri: string; // Storage location for captured data
    redactionConfig?: DataRedactionConfig; // For privacy
}

/**
 * Configuration for data redaction to protect sensitive information.
 */
export interface DataRedactionConfig {
    mode: 'NONE' | 'ANONYMIZE' | 'PSEUDONYMIZE' | 'REDACT_ALL_PII';
    piiDetectionModelId?: string; // Model used for PII detection
    customRedactionRules?: RedactionRule[];
}

export interface RedactionRule {
    pattern: string; // Regex pattern for sensitive data
    replacement: string; // Replacement string
    targetFields?: string[]; // Specific fields to apply rule
}

/**
 * Configuration for detecting data or model drift.
 */
export interface DriftDetectionConfig {
    enabled: boolean;
    featureColumns: string[]; // Columns to monitor for drift
    method: 'KS_TEST' | 'CHI_SQUARE' | 'JENSEN_SHANNON_DIVERGENCE' | 'ADVERSARIAL_VALIDATION';
    threshold: number;
    baselineDatasetId: string;
    alertOnSeverity?: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Configuration for anomaly detection in monitoring metrics.
 */
export interface AnomalyDetectionConfig {
    enabled: boolean;
    algorithm: 'ISOLATION_FOREST' | 'ONE_CLASS_SVM' | 'Z_SCORE_THRESHOLD';
    sensitivity: number; // 0-1, higher for more anomalies
    lookbackPeriodHours: number;
    alertOnSeverity?: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Configuration for sending alerts based on monitoring or evaluation.
 */
export interface AlertingConfig {
    enabled: boolean;
    alertChannels: AlertChannel[];
    severityThreshold: AlertSeverity;
    coolDownPeriodMinutes: number;
    escalationPolicy?: EscalationPolicy;
}

export interface AlertChannel {
    type: 'EMAIL' | 'SLACK' | 'PAGERDUTY' | 'WEBHOOK';
    target: string; // Email address, Slack channel ID, webhook URL
    format?: 'TEXT' | 'JSON' | 'MARKDOWN';
}

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'EMERGENCY';

export interface EscalationPolicy {
    steps: EscalationStep[];
    maxRetries?: number;
}

export interface EscalationStep {
    delayMinutes: number;
    action: 'NOTIFY_ADDITIONAL_CHANNEL' | 'OPEN_INCIDENT_TICKET' | 'TRIGGER_AUTOMATION';
    target?: string; // e.g., 'level2_support_slack', 'jira_webhook'
}

/**
 * Represents a piece of user feedback on a model's generation.
 */
export interface FeedbackEntry {
    id: string;
    userId: string;
    modelVersionId: string;
    deploymentId?: string;
    requestId?: string; // Original request ID
    feedbackType: FeedbackType;
    rating?: number; // e.g., 1-5 stars
    comment?: string;
    problematicParts?: ContentBlock[]; // Specific parts of content that were bad
    suggestedCorrection?: ContentBlock[];
    createdAt: string;
    metadata?: Record<string, any>; // e.g., 'reason_for_bad_response'
}

export type FeedbackType =
    | 'THUMBS_UP'
    | 'THUMBS_DOWN'
    | 'INCORRECT'
    | 'IRRELEVANT'
    | 'HARMFUL'
    | 'INCOMPLETE'
    | 'HALLUCINATION'
    | 'BIAS'
    | 'POOR_STYLE'
    | 'CORRECT_BUT_SUBOPTIMAL'
    | 'OTHER';

/**
 * Configuration for scheduling recurring jobs (e.g., evaluations, monitoring).
 */
export interface ScheduleConfig {
    type: 'CRON' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    cronExpression?: string; // For CRON type
    timezone?: string;
    startDateTime?: string; // ISO 8601
    endDateTime?: string; // ISO 8601
}

// --- Ethical AI & Governance ---

/**
 * Report on detected biases in a model or dataset.
 */
export interface BiasReport {
    id: string;
    entityId: string; // ModelVersionId or DatasetId
    entityType: 'MODEL_VERSION' | 'DATASET';
    metrics: MetricValue[]; // Fairness metrics
    slicesAnalyzed: string[]; // e.g., 'gender', 'age_group'
    findingsSummary: string;
    mitigationRecommendations: string[];
    createdAt: string;
    reportUri?: string; // URI to full detailed report
    generatedByTool?: string; // Which bias detection tool was used
}

/**
 * Explainability report for a model's predictions.
 */
export interface ExplainabilityReport {
    id: string;
    modelVersionId: string;
    predictionId: string; // Specific prediction ID
    explanationMethod: 'LIME' | 'SHAP' | 'INTEGRATED_GRADIENTS' | 'FEATURE_ATTRIBUTION';
    featureAttributions?: FeatureAttribution[];
    visualizationsUri?: string[]; // URIs to explanatory visualizations
    summary: string;
    createdAt: string;
    metadata?: Record<string, any>;
}

export interface FeatureAttribution {
    featureName: string;
    attributionScore: number;
    impactDirection?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    exampleValue?: string | number;
    baselineValue?: string | number;
}

/**
 * Data governance policy applied to a dataset.
 */
export interface DataGovernancePolicy {
    dataRetentionPolicy: DataRetentionPolicy;
    encryptionPolicy: EncryptionPolicy;
    complianceStandards: ComplianceStandard[];
    dataAccessRestrictions?: DataAccessRestriction[];
    piiHandlingPolicy?: PiiHandlingPolicy;
    dataOriginRegion?: string; // Geographic region of data origin
}

export interface DataRetentionPolicy {
    durationDays: number;
    action: 'DELETE' | 'ARCHIVE' | 'ANONYMIZE';
    appliesToBackups?: boolean;
}

export interface EncryptionPolicy {
    enabled: boolean;
    keyManagementService?: 'GOOGLE_KMS' | 'AWS_KMS' | 'AZURE_KEYVAULT' | 'CUSTOMER_MANAGED';
    encryptionKeyId?: string; // ID of the encryption key
    atRestEnabled?: boolean;
    inTransitEnabled?: boolean;
}

export type ComplianceStandard =
    | 'GDPR'
    | 'HIPAA'
    | 'CCPA'
    | 'ISO_27001'
    | 'NIST_800_53'
    | 'SOC2_TYPE_II';

export interface DataAccessRestriction {
    userIds?: string[];
    roles?: UserRole[];
    groups?: string[];
    geographicRestrictions?: string[]; // e.g., 'EU', 'US'
    justificationRequired?: boolean; // If access requires a justification
}

export interface PiiHandlingPolicy {
    piiDetectionEnabled: boolean;
    piiRedactionEnabled: boolean;
    piiDataCategoryExclusions?: string[]; // e.g., 'EMAIL_ADDRESS', 'PHONE_NUMBER'
    dataMinimizationApplied?: boolean; // Only collect necessary PII
}

/**
 * Access control policy for any resource (datasets, models, projects).
 */
export interface AccessControlPolicy {
    resourceId: string;
    resourceType: 'PROJECT' | 'WORKSPACE' | 'DATASET' | 'MODEL_ASSET' | 'MODEL_VERSION' | 'DEPLOYMENT' | 'USER_PROFILE';
    grants: AccessGrant[];
    defaultAccessRole?: UserRole;
    inheritedFrom?: string; // ID of parent resource from which policy is inherited
}

export interface AccessGrant {
    principalType: 'USER' | 'GROUP' | 'SERVICE_ACCOUNT';
    principalId: string;
    roles: UserRole[];
    conditions?: AccessCondition[]; // e.g., 'time_based', 'ip_address'
}

export interface AccessCondition {
    type: 'TIME_BASED' | 'IP_ADDRESS' | 'GEOGRAPHIC';
    parameters: Record<string, any>; // e.g., { startTime: '...', endTime: '...' }
}

// --- Collaboration & Integrations ---

/**
 * Represents a comment on a resource (e.g., dataset entry, model version).
 */
export interface Comment {
    id: string;
    resourceId: string;
    resourceType: 'DATA_ENTRY' | 'MODEL_VERSION' | 'DEPLOYMENT' | 'PROMPT_TEMPLATE' | 'WORKFLOW';
    authorId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    parentId?: string; // For threaded comments
    resolvedById?: string;
    resolvedAt?: string;
    tags?: string[];
    mentions?: string[]; // User IDs mentioned
}

/**
 * Represents a formal review or approval request.
 */
export interface Review {
    id: string;
    resourceId: string;
    resourceType: 'MODEL_VERSION' | 'DATASET' | 'PROMPT_TEMPLATE' | 'WORKFLOW';
    reviewerIds: string[];
    status: ReviewStatus;
    submittedBy: string;
    submittedAt: string;
    approvedBy?: string;
    approvedAt?: string;
    comments?: Comment[];
    deadline?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';

/**
 * Configuration for webhooks to send events to external systems.
 */
export interface WebhookConfig {
    id: string;
    projectId: string;
    name: string;
    eventTypes: WebhookEventType[];
    targetUrl: string;
    secret?: string; // For signature verification
    isEnabled: boolean;
    createdAt: string;
    updatedAt: string;
    lastTriggeredAt?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'FAILED';
}

export type WebhookEventType =
    | 'model.deployed'
    | 'model.finetuned'
    | 'dataset.updated'
    | 'evaluation.completed'
    | 'monitoring.alert'
    | 'feedback.received'
    | 'project.updated'
    | 'prompt_template.published'
    | 'workflow.executed'
    | 'user.activity'
    | 'quota.exceeded';

/**
 * Represents a single webhook event payload.
 */
export interface WebhookEvent {
    eventId: string;
    eventType: WebhookEventType;
    timestamp: string; // ISO 8601
    resourceType: string;
    resourceId: string;
    payload: Record<string, any>; // Event-specific data
    projectId: string;
    signature?: string; // For verification by the receiver
}

/**
 * Configuration for integrating with external systems.
 */
export interface IntegrationConfig {
    id: string;
    projectId: string;
    type: IntegrationType;
    name: string;
    parameters: Record<string, any>; // Specific configuration for the integration
    status: IntegrationStatus;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
    credentialId?: string; // Reference to a secret holding credentials
}

export type IntegrationType =
    | 'GITHUB'
    | 'GITLAB'
    | 'SLACK'
    | 'JIRA'
    | 'DATADOG'
    | 'PROMETHEUS'
    | 'GCS'
    | 'S3'
    | 'AZURE_BLOB_STORAGE'
    | 'MLFLOW'
    | 'WANDB'
    | 'SNOWFLAKE'
    | 'BIGQUERY'
    | 'CUSTOM_API';

export type IntegrationStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'PENDING';

// --- Advanced AI Workflows & Agents ---

/**
 * Represents a structured prompt template with variables.
 */
export interface PromptTemplate {
    id: string;
    projectId: string;
    name: string;
    version: number;
    template: ContentBlock[]; // Template with placeholders
    variables: PromptTemplateVariable[];
    description?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
    authorId: string;
    visibility: 'PRIVATE' | 'PROJECT' | 'ORGANIZATION' | 'PUBLIC';
    testCases?: PromptTemplateTestCase[];
    evaluationJobIds?: string[]; // Linked evaluations
}

export interface PromptTemplateVariable {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'enum' | 'text_long' | 'image_base64' | 'file_uri';
    defaultValue?: string | number | boolean;
    description?: string;
    required: boolean;
    enumValues?: string[]; // For 'enum' type
}

export interface PromptTemplateTestCase {
    name: string;
    inputs: Record<string, any>; // Variable values
    expectedOutputs?: ContentBlock[];
    expectedMetrics?: Record<string, number>; // e.g., expected latency, token count
}

/**
 * Represents a complex, multi-step AI workflow or agentic process.
 * This allows chaining models, tools, and custom logic.
 */
export interface Workflow {
    id: string;
    projectId: string;
    name: string;
    description?: string;
    graph: WorkflowGraph;
    version: number;
    status: WorkflowStatus;
    createdAt: string;
    updatedAt: string;
    authorId: string;
    parameters?: WorkflowParameter[];
    triggers?: WorkflowTrigger[]; // How the workflow can be initiated
    outputSchema?: Record<string, any>; // JSON schema for workflow output
    versionControlId?: string; // Link to version control system
}

export type WorkflowStatus = 'DRAFT' | 'PUBLISHED' | 'DEPRECATED' | 'ARCHIVED';

/**
 * Defines a parameter for the workflow, acting as an input or configuration.
 */
export interface WorkflowParameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'json' | 'image_uri' | 'file_uri' | 'multi_modal_content';
    description?: string;
    required: boolean;
    defaultValue?: any;
    examples?: any[];
}

/**
 * Defines how a workflow can be triggered.
 */
export interface WorkflowTrigger {
    type: 'API_CALL' | 'SCHEDULED' | 'WEBHOOK_EVENT' | 'DATASET_UPDATE' | 'MODEL_DEPLOYMENT';
    parameters?: Record<string, any>; // e.g., cron_expression, webhook_config_id
}

/**
 * Represents the directed acyclic graph (DAG) structure of a workflow.
 */
export interface WorkflowGraph {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    startNodeId: string;
}

/**
 * A single node within a workflow graph, representing an operation.
 */
export interface WorkflowNode {
    id: string;
    type: WorkflowNodeType;
    name: string;
    description?: string;
    config: ModelNodeConfig | ToolNodeConfig | LogicNodeConfig | DataNodeConfig | CustomCodeNodeConfig;
    inputMapping?: Record<string, string>; // Maps workflow/previous node output to node input
    outputMapping?: Record<string, string>; // Maps node output to workflow/next node input
    errorHandling?: ErrorHandlingConfig;
    timeoutSeconds?: number;
}

export type WorkflowNodeType =
    | 'MODEL_INFERENCE'
    | 'TOOL_EXECUTION'
    | 'DATA_TRANSFORMATION'
    | 'CONDITIONAL_LOGIC'
    | 'FOR_EACH_LOOP'
    | 'MERGE_JOIN'
    | 'CUSTOM_CODE'
    | 'RAG_RETRIEVAL'
    | 'HUMAN_REVIEW_TASK'
    | 'EXTERNAL_API_CALL'
    | 'START'
    | 'END';

/**
 * Configuration for a model inference node.
 */
export interface ModelNodeConfig {
    model: ModelType | string;
    generationConfig?: GenerationConfig;
    safetySettings?: SafetySetting[];
    stream?: boolean;
    outputSchema?: Record<string, any>; // Expected output schema
    promptTemplateId?: string; // Reference to a prompt template
    dynamicPromptFields?: Record<string, string>; // Maps workflow context to template fields
}

/**
 * Configuration for a tool execution node.
 */
export interface ToolNodeConfig {
    toolName: string; // The registered tool name
    parameters: Record<string, any>; // Parameters for the tool call
    waitForCompletion?: boolean;
    asyncCallbackUri?: string; // For async tool executions
}

/**
 * Configuration for a logic node (e.g., conditional, loop).
 */
export interface LogicNodeConfig {
    logicType: 'IF_ELSE' | 'FOR_EACH';
    condition?: string; // e.g., 'input.sentiment == "POSITIVE"'
    iteratorVariable?: string; // For FOR_EACH
    loopInputList?: string; // Path to the input list
    maxIterations?: number;
}

/**
 * Configuration for a data manipulation node.
 */
export interface DataNodeConfig {
    operation: 'FILTER' | 'MAP' | 'AGGREGATE' | 'JOIN' | 'TRANSFORM' | 'STORE_TO_DATASET';
    datasetId?: string; // For store/load operations
    transformationScriptUri?: string; // URI to a custom script
    query?: string; // SQL-like query for filtering/joining
    outputSchema?: Record<string, any>;
}

/**
 * Configuration for a custom code execution node.
 */
export interface CustomCodeNodeConfig {
    language: 'python' | 'javascript' | 'go';
    codeUri: string; // URI to the custom code file
    entrypointFunction: string;
    dependencies?: string[]; // e.g., 'numpy==1.22.0'
    runtimeEnvironment?: RuntimeEnvironment;
    inputSchema?: Record<string, any>;
    outputSchema?: Record<string, any>;
}

export interface RuntimeEnvironment {
    baseImage: string; // Docker image
    cpuLimit: string;
    memoryLimit: string;
    gpuLimit?: number;
    environmentVariables?: Record<string, string>;
}

/**
 * Configuration for error handling on a node.
 */
export interface ErrorHandlingConfig {
    strategy: 'RETRY' | 'FALLBACK_NODE' | 'ALERT_AND_FAIL' | 'IGNORE';
    maxRetries?: number;
    retryDelaySeconds?: number;
    fallbackNodeId?: string; // Node to execute on error
    alertingConfig?: AlertingConfig;
}

/**
 * An edge connecting two nodes in a workflow graph.
 */
export interface WorkflowEdge {
    sourceNodeId: string;
    targetNodeId: string;
    label?: string; // e.g., 'on_success', 'on_failure', 'condition_true'
    condition?: string; // More specific condition for the edge to be traversed
}

/**
 * Represents a single execution instance of a workflow.
 */
export interface WorkflowExecution {
    id: string;
    workflowId: string;
    projectId: string;
    startedAt: string;
    completedAt?: string;
    status: WorkflowExecutionStatus;
    inputParameters: Record<string, any>;
    outputResult?: Record<string, any>;
    logsUri?: string; // URI to detailed execution logs
    error?: ResponseError;
    durationMs?: number;
    costUsd?: number;
    triggeredBy?: string; // User ID or system event
    traceId?: string; // For distributed tracing
    nodeExecutions?: NodeExecutionDetail[]; // Details of individual node runs
}

export type WorkflowExecutionStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'PAUSED';

/**
 * Details for a single node execution within a workflow.
 */
export interface NodeExecutionDetail {
    nodeId: string;
    nodeName: string;
    status: WorkflowExecutionStatus;
    startedAt: string;
    completedAt?: string;
    inputs: Record<string, any>;
    outputs?: Record<string, any>;
    error?: ResponseError;
    durationMs?: number;
    retryCount?: number;
    logsUri?: string;
}

/**
 * Represents an AI Agent's state and capabilities.
 */
export interface AIAgent {
    id: string;
    projectId: string;
    name: string;
    description?: string;
    version: number;
    initialPrompt: ContentBlock[]; // The agent's core directive
    memoryConfig?: MemoryConfig;
    toolIds?: string[]; // Tools the agent has access to
    modelConfig: AgentModelConfig; // Models the agent uses for different tasks
    reasoningEngineConfig?: ReasoningEngineConfig;
    status: AIAgentStatus;
    createdAt: string;
    updatedAt: string;
    deploymentId?: string; // If the agent is actively deployed
    capabilities?: AgentCapability[]; // What the agent can do
    safetyLimits?: AgentSafetyLimits;
    goalTrackingConfig?: GoalTrackingConfig;
    selfImprovementConfig?: SelfImprovementConfig;
}

export type AIAgentStatus = 'DRAFT' | 'TRAINING' | 'ACTIVE' | 'PAUSED' | 'DEPRECATED';

/**
 * Configuration for an agent's memory system.
 */
export interface MemoryConfig {
    type: 'SHORT_TERM' | 'LONG_TERM_SEMANTIC' | 'EPISODIC';
    vectorStoreId?: string; // For long-term semantic memory
    maxConversationTurns?: number; // For short-term memory
    recallStrategy?: 'KEYWORD' | 'EMBEDDING_SIMILARITY' | 'HYBRID';
    retentionPolicy?: DataRetentionPolicy;
    privacyFilters?: DataRedactionConfig;
}

/**
 * Configuration for models used by the agent (e.g., one for planning, one for generation).
 */
export interface AgentModelConfig {
    defaultModel: ModelType | string;
    planningModel?: ModelType | string; // Model for high-level planning
    toolUseModel?: ModelType | string; // Model specifically for deciding which tool to use
    reflectionModel?: ModelType | string; // Model for self-reflection/correction
    creativeModel?: ModelType | string; // For more creative tasks
}

/**
 * Configuration for the agent's reasoning capabilities.
 */
export interface ReasoningEngineConfig {
    type: 'LOGICAL_PROLOG' | 'BAYESIAN_NETWORK' | 'GRAPH_TRAVERSAL' | 'STATE_MACHINE' | 'CUSTOM_SCRIPTED';
    parameters?: Record<string, any>;
    knowledgeGraphId?: string; // If using a knowledge graph for reasoning
    ruleSetUri?: string; // URI to a set of logical rules
}

/**
 * Defines a capability of the AI agent.
 */
export interface AgentCapability {
    name: string;
    description: string;
    inputSchema?: Record<string, any>;
    outputSchema?: Record<string, any>;
    isComposable?: boolean; // Can this capability be combined with others?
    executionWorkflowId?: string; // If this capability is backed by a workflow
    apiGatewayEndpoint?: string; // If capability is an API
}

/**
 * Safety limits and guardrails for an AI agent.
 */
export interface AgentSafetyLimits {
    maxExecutionTimeSeconds?: number;
    maxToolCallsPerTurn?: number;
    allowedToolIds?: string[]; // Whitelist of tools
    disallowedDomains?: string[]; // For web access
    costLimitUsd?: number;
    outputModerationConfig?: SafetySetting[]; // Apply moderation to agent's final outputs
    humanInterventionPolicy?: HumanInterventionPolicy;
}

export interface HumanInterventionPolicy {
    triggerConditions: string[]; // e.g., 'cost_exceeded', 'safety_flagged', 'loop_detected'
    escalationAction: 'PAUSE_AND_NOTIFY' | 'SEEK_APPROVAL' | 'FALLBACK_TO_HUMAN';
    approverGroupIds?: string[];
}

/**
 * Configuration for an agent to track and manage its goals.
 */
export interface GoalTrackingConfig {
    enabled: boolean;
    goalDefinitionSchema?: Record<string, any>; // Schema for defining goals
    progressTrackingMetrics?: EvaluationMetricType[];
    failureDetectionCriteria?: string[]; // e.g., 'max_retries_exceeded', 'cost_limit_hit'
    replanStrategy?: 'REGENERATE_PLAN' | 'REQUEST_CLARIFICATION';
}

/**
 * Configuration for the agent's self-improvement mechanisms.
 */
export interface SelfImprovementConfig {
    enabled: boolean;
    feedbackLoopDatasetId?: string; // Dataset to store self-generated feedback
    fineTuneModelOnFeedback?: boolean;
    reflectionFrequency?: 'AFTER_FAILURE' | 'PERIODIC' | 'ALWAYS';
    experimentationBudgetUsd?: number;
    learnFromHumanFeedback?: boolean; // Incorporate HITL feedback
}

// --- SDK/Client-specific Interfaces ---

/**
 * Represents the context of a client request, including authentication and tracing.
 */
export interface RequestContext {
    authHeader?: string;
    traceId?: string;
    spanId?: string;
    sessionId?: string;
    userId?: string;
    clientIp?: string;
    userAgent?: string;
    customHeaders?: Record<string, string>;
}

/**
 * Generic response for operations that primarily return a status.
 */
export interface OperationResponse {
    success: boolean;
    message?: string;
    details?: Record<string, any>;
    operationId?: string; // ID of the background operation if async
}

// --- Billing & Quotas ---

/**
 * Defines a resource quota for a project or workspace.
 */
export interface ResourceQuota {
    resourceType: QuotaResourceType;
    limit: number;
    unit: string; // e.g., 'TOKENS', 'REQUESTS', 'GB_HOURS', 'USD'
    period: 'HOURLY' | 'DAILY' | 'MONTHLY' | 'TOTAL';
    currentUsage?: number;
    alertThreshold?: number; // Percentage to trigger an alert
}

export type QuotaResourceType =
    | 'MODEL_INFERENCE_TOKENS'
    | 'MODEL_INFERENCE_REQUESTS'
    | 'MODEL_TRAINING_GPU_HOURS'
    | 'DATA_STORAGE_GB'
    | 'DATA_TRANSFER_GB'
    | 'API_CALLS_TOTAL'
    | 'FINE_TUNING_JOBS_COUNT'
    | 'AGENT_STEPS_COUNT'
    | 'WORKFLOW_EXECUTIONS_COUNT'
    | 'LABELING_JOB_UNITS'
    | 'MONITORING_METRIC_SAMPLES'
    | 'CUSTOM_MODEL_DEPLOYMENT_HOURS'
    | 'TOTAL_SPEND_USD';

/**
 * Represents a billing account linked to an organization.
 */
export interface BillingAccount {
    id: string;
    organizationId: string;
    provider: 'GOOGLE_CLOUD_BILLING' | 'AWS_BILLING' | 'AZURE_BILLING' | 'STRIPE' | 'CUSTOM';
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    currency: string;
    paymentMethodType?: string; // e.g., 'CREDIT_CARD', 'BANK_TRANSFER'
    currentBalanceUsd?: number;
    lastInvoiceDate?: string;
    nextInvoiceDate?: string;
    spendingLimits?: SpendingLimit[];
}

/**
 * Defines spending limits for a billing account.
 */
export interface SpendingLimit {
    amount: number;
    currency: string;
    period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    action: 'ALERT' | 'SOFT_STOP' | 'HARD_STOP';
    alertThresholdPercentage?: number;
}

/**
 * Represents a record of usage for billing.
 */
export interface UsageRecord {
    id: string;
    billingAccountId: string;
    projectId: string;
    resourceType: QuotaResourceType;
    quantity: number;
    unit: string;
    costUsd: number;
    timestamp: string; // ISO 8601
    modelId?: string;
    workflowId?: string;
    dataEntryId?: string;
    metadata?: Record<string, any>;
}

/**
 * Defines different pricing tiers or plans.
 */
export interface BillingTier {
    id: string;
    name: string;
    description: string;
    features: string[]; // e.g., 'unlimited_projects', 'priority_support'
    pricePerMonthUsd: number;
    freeCreditsUsd?: number;
    quotaOverrides?: ResourceQuota[]; // Custom quotas for this tier
    includedModelTypes?: ModelType[];
    dataRetentionDays?: number;
    supportLevel?: 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
}