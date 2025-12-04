// google/notebook/types.ts
// The Scholar's Grammar. Defines the structure of the notebook's components.

// Original types
export type CellType = 'code' | 'markdown';

export interface Cell {
    id: string;
    type: CellType;
    content: string;
}

// Expanded Universe begins here

// ----------------------------------------------------------------------------------------------------
// CORE STRUCTURES - FUNDAMENTAL BUILDING BLOCKS AND PRIMITIVES
// ----------------------------------------------------------------------------------------------------

/**
 * @typedef {string} UniqueIdentifier
 * Represents a globally unique identifier for any entity in the system.
 */
export type UniqueIdentifier = string;

/**
 * @typedef {string} Timestamp
 * Represents a standard ISO 8601 timestamp string (e.g., "2023-10-27T10:00:00.000Z").
 */
export type Timestamp = string;

/**
 * @interface UserProfile
 * Details about a user within the Scholar's Grammar ecosystem.
 */
export interface UserProfile {
    id: UniqueIdentifier;
    username: string;
    email: string;
    displayName?: string;
    avatarUrl?: string;
    organization?: string;
    joinedDate: Timestamp;
    lastActiveDate: Timestamp;
    preferences?: UserPreferences;
    roles: UserRole[];
    externalAuthId?: string; // e.g., Google OAuth ID
}

/**
 * @enum {string} UserRole
 * Defines various roles a user can have, impacting permissions across the platform.
 */
export type UserRole = 'admin' | 'editor' | 'viewer' | 'contributor' | 'owner' | 'guest' | 'developer' | 'auditor' | 'maintainer' | 'reviewer';

/**
 * @interface UserPreferences
 * User-specific settings and configurations for the application.
 */
export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    locale: string; // e.g., 'en-US', 'es-ES'
    timezone: string; // e.g., 'America/New_York'
    editorFontSize: number; // in px
    codeCompletionEnabled: boolean;
    autoSaveIntervalMinutes: number;
    notificationSettings: NotificationSettings;
    defaultNotebookTemplateId?: UniqueIdentifier;
    accessibilitySettings?: AccessibilitySettings;
    keyboardShortcutPreset: UniqueIdentifier; // Reference to a custom shortcut preset
    defaultWorkspaceId?: UniqueIdentifier;
    preferredKernelLanguage?: string;
}

/**
 * @interface NotificationSettings
 * Configuration for user notifications.
 */
export interface NotificationSettings {
    emailNotifications: boolean;
    inAppNotifications: boolean;
    pushNotifications: boolean;
    notifyOnComment: boolean;
    notifyOnShare: boolean;
    notifyOnExecutionError: boolean;
    notifyOnReviewRequest: boolean;
    digestFrequency: 'daily' | 'weekly' | 'never';
}

/**
 * @interface AccessibilitySettings
 * Settings to enhance accessibility.
 */
export interface AccessibilitySettings {
    highContrastMode: boolean;
    screenReaderSupport: boolean;
    reducedMotion: boolean;
    textSizeAdjustment: 'small' | 'medium' | 'large' | 'x-large';
    dyslexiaFriendlyFonts: boolean;
    customCursorEnabled: boolean;
}

/**
 * @enum {string} PermissionLevel
 * Granular access levels for resources.
 */
export type PermissionLevel = 'read' | 'write' | 'execute' | 'share' | 'admin' | 'comment' | 'export' | 'version_control' | 'deploy' | 'manage_users' | 'audit';

/**
 * @interface ResourcePermissions
 * Defines permissions for a specific user or group on a resource.
 */
export interface ResourcePermissions {
    resourceId: UniqueIdentifier;
    resourceType: 'notebook' | 'cell' | 'workspace' | 'project' | 'dataset' | 'model' | 'dashboard' | 'folder' | 'plugin' | 'secret';
    userIds: UniqueIdentifier[];
    groupIds: UniqueIdentifier[]; // Support for user groups
    level: PermissionLevel;
    grantedBy: UniqueIdentifier; // User who granted the permission
    grantedAt: Timestamp;
    expiresAt?: Timestamp; // Optional expiration for temporary access
}

/**
 * @interface SharedLinkSettings
 * Configuration for public or private shareable links.
 */
export interface SharedLinkSettings {
    linkId: UniqueIdentifier;
    accessType: 'public_read' | 'public_comment' | 'private_link' | 'organization_read' | 'organization_edit' | 'private_authenticated_user';
    isEnabled: boolean;
    passwordProtected: boolean;
    expiresAt?: Timestamp;
    allowedDomains?: string[]; // For restricting public links to certain domains
    token?: string; // Auto-generated secure token for private links
}

// ----------------------------------------------------------------------------------------------------
// NOTEBOOK CONTENT EXPANSION - CELL TYPES AND THEIR SPECIFIC ATTRIBUTES
// ----------------------------------------------------------------------------------------------------

/**
 * @enum {string} ExpandedCellType
 * An expanded set of cell types beyond basic code and markdown.
 */
export type ExpandedCellType = CellType
    | 'data'
    | 'chart'
    | 'media'
    | 'diagram'
    | 'form'
    | 'ai_prompt'
    | 'knowledge_graph'
    | 'simulation'
    | 'web_component'
    | 'link'
    | 'question'
    | 'annotation'
    | 'plugin'
    | 'output_display'
    | 'interactive_app'
    | 'live_code' // for real-time collaborative coding environments
    | 'test_case'
    | 'system_info' // for displaying environment/system diagnostics
    | 'code_snippet' // for reusable code blocks without full execution context
    | 'equation' // for LaTeX or mathematical expressions
    | 'embed_external'; // for generic external content embeds

/**
 * @enum {string} CellStatus
 * Lifecycle status of a cell within a notebook.
 */
export type CellStatus = 'idle' | 'running' | 'completed' | 'error' | 'queued' | 'paused' | 'skipped' | 'draft' | 'awaiting_input' | 'processing_output';

/**
 * @enum {string} CellVisibility
 * How the cell and its outputs are displayed.
 */
export type CellVisibility = 'visible' | 'collapsed' | 'hidden_content' | 'hidden_output_only' | 'hidden_always';

/**
 * @enum {string} CellLayout
 * Defines how the cell should be rendered in the UI (e.g., full width, side-by-side).
 */
export type CellLayout = 'full_width' | 'half_left' | 'half_right' | 'quarter_grid' | 'inline' | 'floating' | 'tabbed';

/**
 * @enum {string} CellTag
 * Categorization and metadata tags for cells.
 */
export type CellTag = 'introduction' | 'data_prep' | 'analysis' | 'model_training' | 'visualization' | 'conclusion' | 'todo' | 'important' | 'draft' | 'deprecated' | 'ai_generated' | 'template' | 'production_ready' | 'experimental' | 'bug' | 'fix' | 'security';

/**
 * @interface BaseCell
 * The foundation for all cell types, with common metadata.
 */
export interface BaseCell {
    id: UniqueIdentifier;
    parentId?: UniqueIdentifier; // For nested cells or cell groups
    type: ExpandedCellType;
    content: string; // The primary content of the cell (code, markdown, data source query, etc.)
    metadata: CellMetadata;
    status: CellStatus;
    visibility: CellVisibility;
    layout: CellLayout;
    createdAt: Timestamp;
    lastModifiedAt: Timestamp;
    createdBy: UniqueIdentifier;
    lastModifiedBy: UniqueIdentifier;
    tags: CellTag[];
    versionHistory: CellVersionMetadata[];
    comments: UniqueIdentifier[]; // References to comment threads
    annotations: UniqueIdentifier[]; // References to annotations (e.g., highlights, notes)
    aiInsights: AIInsight[]; // AI-generated insights specific to this cell
    readOnly: boolean; // Is the cell content editable?
    executionCount?: number; // How many times this cell has been executed
    dependencies: CellDependency[]; // What other cells or resources this cell depends on
    error?: ExecutionError; // Latest error if cell is in error state
    warnings?: ExecutionWarning[]; // Latest warnings
}

// The original Cell type now extends BaseCell, effectively becoming a union or a specific variant
export interface CodeCell extends BaseCell {
    type: 'code';
    language: string; // e.g., 'python', 'javascript', 'r', 'sql', 'shell', 'golang', 'rust', 'julia', 'kotlin', 'scala'
    kernelId?: UniqueIdentifier; // Specific kernel instance if applicable
    executionResults: ExecutionResult[];
    environment: CellEnvironment; // Specific env variables, packages for this cell
    codeGuardrails?: CodeGuardrailConfig[]; // AI-driven code quality and security checks
    lintingErrors?: CodeLintingError[]; // Static analysis errors
    sourceCodeHash?: string; // Hash of the code content for caching/deduplication
}

export interface MarkdownCell extends BaseCell {
    type: 'markdown';
    renderMode: 'wysiwyg' | 'raw' | 'preview'; // How the markdown is edited
    tableOfContentsGenerated: boolean;
    mermaidDiagramsEnabled: boolean; // Allows inline Mermaid syntax
    mathJaxEnabled: boolean; // Allows LaTeX math rendering
}

/**
 * @interface DataCell
 * Cell for handling structured data directly within the notebook.
 */
export interface DataCell extends BaseCell {
    type: 'data';
    dataType: 'table' | 'json' | 'csv' | 'xml' | 'yaml' | 'parquet' | 'feather' | 'hdf5' | 'spreadsheet' | 'graph_json';
    dataSchema?: DataSchema;
    dataPreviewUrl?: string; // URL to a temporary data preview endpoint
    sourceConfig?: DataSourceConfig; // How the data was loaded (e.g., API, local file, database)
    transformationHistory?: DataTransformationStep[];
    queryLanguage?: string; // e.g., 'SQL', 'GraphQL', 'jq', 'Pandas', 'Spark SQL' if data is queried
    isLiveUpdate: boolean; // Does the data auto-refresh?
    cacheDurationSeconds?: number;
    rowCount?: number;
    columnCount?: number;
}

/**
 * @interface ChartCell
 * Cell for interactive data visualizations.
 */
export interface ChartCell extends BaseCell {
    type: 'chart';
    chartType: 'bar' | 'line' | 'pie' | 'scatter' | 'histogram' | 'heatmap' | 'network' | 'geographic' | '3d' | 'custom_vega_lite' | 'sankey' | 'tree_map' | 'gauge';
    dataRefId?: UniqueIdentifier; // Reference to a DataCell or external data source
    chartConfig: ChartConfiguration;
    interactive: boolean;
    exportFormats: ChartExportFormat[];
    generatedCode?: string; // Code used to generate the chart (e.g., Python Matplotlib, R ggplot2, JavaScript D3)
    accessibilityDescription?: string; // AI-generated alt text for accessibility
    themeVariant?: 'light' | 'dark' | 'custom';
}

/**
 * @interface MediaCell
 * Cell for embedding rich media.
 */
export interface MediaCell extends BaseCell {
    type: 'media';
    mediaType: 'image' | 'video' | 'audio' | 'document' | '3d_model' | 'pdf' | 'gif' | 'web_m';
    url: string; // URL to the media asset
    altText?: string;
    caption?: string;
    thumbnailUrl?: string;
    controls: boolean; // For video/audio
    autoplay: boolean;
    loop: boolean;
    maxWidth?: string; // e.g., '100%', '500px'
}

/**
 * @interface DiagramCell
 * Cell for creating and embedding diagrams (flowcharts, UML, mind maps, etc.).
 */
export interface DiagramCell extends BaseCell {
    type: 'diagram';
    diagramFormat: 'mermaid' | 'plantuml' | 'drawio' | 'excalidraw' | 'graphviz' | 'custom_svg_editor' | 'bpmn';
    diagramData: string; // Raw diagram source (e.g., Mermaid syntax, Draw.io XML)
    interactive: boolean;
    exportFormats: DiagramExportFormat[];
    readOnlyMode: boolean; // Can user edit diagram directly or only view?
    autoLayoutEnabled: boolean;
}

/**
 * @interface FormCell
 * Cell for interactive user input forms.
 */
export interface FormCell extends BaseCell {
    type: 'form';
    formFields: FormFieldDefinition[];
    onSubmitActions: FormAction[];
    formDataSchema?: DataSchema; // Schema for the expected form data
    currentFormData?: Record<string, any>; // Last submitted or current draft data
    resetOnSubmit: boolean;
    submitButtonText?: string;
    enableAutoValidation: boolean;
}

/**
 * @interface AICell
 * Cell specifically designed for interacting with AI models.
 */
export interface AICell extends BaseCell {
    type: 'ai_prompt';
    modelId: UniqueIdentifier; // ID of the AI model being used (e.g., 'gpt-4o', 'gemini-1.5-pro')
    promptTemplateId?: UniqueIdentifier; // Reference to a reusable prompt template
    inputParameters: Record<string, any>; // Parameters for the AI model (temperature, max_tokens, etc.)
    aiPrompt: string; // The user's prompt content
    aiResponse: AIResponse[]; // Stored responses from the AI model
    responseFormat: 'text' | 'json' | 'markdown' | 'code' | 'image' | 'audio' | 'chat_dialog';
    costEstimation?: AICostEstimate;
    evaluationMetrics?: AIEvaluationMetrics;
    feedback?: AIResponseFeedback; // User feedback on the AI response
    streamingEnabled: boolean; // For real-time response generation
    attachedFiles?: UniqueIdentifier[]; // References to files for multimodal input
    toolUseEnabled: boolean; // Can the AI use external tools?
}

/**
 * @interface KnowledgeGraphCell
 * Cell to visualize and interact with knowledge graphs.
 */
export interface KnowledgeGraphCell extends BaseCell {
    type: 'knowledge_graph';
    graphData: KnowledgeGraphData; // Data in a format like RDF, Neo4j Cypher, or custom JSON
    queryLanguage?: string; // e.g., 'SPARQL', 'Cypher', 'Gremlin'
    interactive: boolean;
    layoutAlgorithm: 'force_directed' | 'hierarchical' | 'radial' | 'grid';
    dataRefId?: UniqueIdentifier; // Reference to a DataCell containing graph data
    nodeSchema?: DataSchema; // Schema for node properties
    edgeSchema?: DataSchema; // Schema for edge properties
    filterOptions?: Record<string, any>;
    searchEnabled: boolean;
}

/**
 * @interface SimulationCell
 * Cell for interactive simulations and models.
 */
export interface SimulationCell extends BaseCell {
    type: 'simulation';
    modelDefinition: string; // Code or configuration defining the simulation model
    simulationLanguage: string; // e.g., 'Python (SciPy)', 'Julia (DifferentialEquations.jl)', 'Agent-based Modeling language'
    parameters: SimulationParameter[];
    outputMetrics: SimulationMetric[];
    interactiveControls: SimulationControl[];
    simulationResults: ExecutionResult[]; // Store simulation runs as execution results
    resetOnExecution: boolean;
    maxIterations?: number;
    solverConfig?: Record<string, any>; // e.g., integration method, step size
}

/**
 * @interface WebComponentCell
 * Cell to embed custom web components or interactive JavaScript applications.
 */
export interface WebComponentCell extends BaseCell {
    type: 'web_component';
    componentUrl: string; // URL to the custom element's script or module
    tagName: string; // Custom element tag name, e.g., 'my-chart-viewer'
    attributes: Record<string, any>; // Attributes passed to the custom element
    properties: Record<string, any>; // Properties set on the custom element
    eventBindings: WebComponentEventBinding[];
    sandboxIsolation: boolean; // Run in an iframe or shadow DOM for security
    initializationScript?: string; // JS to run after component loads
    dataRefId?: UniqueIdentifier; // Optional data source for the component
}

/**
 * @interface LinkCell
 * Cell to embed or link to external resources.
 */
export interface LinkCell extends BaseCell {
    type: 'link';
    url: string;
    displayMode: 'embed' | 'iframe' | 'card' | 'link_only' | 'screenshot';
    title?: string;
    description?: string;
    thumbnailUrl?: string;
    oembedData?: Record<string, any>; // OEmbed data could be stored here
    previewGenerationEnabled: boolean;
    faviconUrl?: string;
}

/**
 * @interface QuestionCell
 * Cell for interactive quizzes, surveys, or Q&A.
 */
export interface QuestionCell extends BaseCell {
    type: 'question';
    questionType: 'multiple_choice' | 'single_choice' | 'text_input' | 'code_challenge' | 'rating' | 'true_false' | 'matching';
    questionText: string;
    options?: QuestionOption[];
    correctAnswer?: any; // For auto-grading, can be option ID, regex, etc.
    feedbackText?: string;
    userResponses: QuestionResponse[]; // Store responses from users (for collaborative/teaching notebooks)
    pointsValue?: number;
    allowRetries: boolean;
    showHintsAfterAttempts?: number;
    autoGradeEnabled: boolean;
    required: boolean;
}

/**
 * @interface AnnotationCell
 * Cell specifically for annotating other cells or regions of the notebook.
 */
export interface AnnotationCell extends BaseCell {
    type: 'annotation';
    targetCellId: UniqueIdentifier;
    targetContentRange?: { startLine: number, startChar: number, endLine: number, endChar: number }; // For code/markdown
    annotationText: string;
    annotationType: 'comment' | 'suggestion' | 'highlight' | 'warning' | 'error' | 'question' | 'todo';
    resolved: boolean;
    severity?: 'low' | 'medium' | 'high';
    dueDate?: Timestamp; // For actionable annotations
    tags?: string[]; // e.g., 'data-issue', 'code-bug'
}

/**
 * @interface PluginCell
 * A placeholder cell type for arbitrary plugin-defined content.
 */
export interface PluginCell extends BaseCell {
    type: 'plugin';
    pluginId: UniqueIdentifier; // ID of the plugin that defines this cell type
    pluginData: Record<string, any>; // Arbitrary data specific to the plugin
    pluginVersion: string;
    customRendererId?: UniqueIdentifier; // Optional: reference to a custom renderer for this plugin cell
}

/**
 * @interface OutputDisplayCell
 * A cell purely for displaying outputs generated elsewhere or aggregated.
 */
export interface OutputDisplayCell extends BaseCell {
    type: 'output_display';
    sourceCellIds: UniqueIdentifier[]; // IDs of cells whose outputs are aggregated/displayed
    displayMode: 'latest' | 'all_history' | 'custom_layout' | 'comparison';
    transformationConfig?: OutputTransformationConfig; // How to process outputs before display
    autoUpdate: boolean;
    defaultOutputFormat: string; // e.g., 'image/png', 'text/html'
}

/**
 * @interface InteractiveAppCell
 * A cell that represents a deployable interactive application based on the notebook.
 */
export interface InteractiveAppCell extends BaseCell {
    type: 'interactive_app';
    appUrl?: string; // URL if the app is already deployed
    deploymentConfig: AppDeploymentConfig;
    inputParametersSchema: DataSchema; // Schema for app inputs
    outputDisplayConfig: DashboardLayoutConfig; // How results are displayed
    lastDeploymentStatus: 'success' | 'failure' | 'pending' | 'draft';
    lastDeploymentTimestamp?: Timestamp;
    deployedBy: UniqueIdentifier;
    versionHistory: AppDeploymentVersion[];
}

/**
 * @interface LiveCodeCell
 * A special cell type for real-time collaborative code editing and execution,
 * potentially with shared cursor and simultaneous output viewing.
 */
export interface LiveCodeCell extends BaseCell {
    type: 'live_code';
    language: string;
    activeCollaborators: UniqueIdentifier[]; // IDs of users currently editing
    realtimeChannelId: UniqueIdentifier; // Channel for real-time updates
    snapshotFrequencySeconds: number; // How often to save intermediate states
    codeReviewStatus: 'pending' | 'approved' | 'rejected' | 'in_review';
    coEditingEnabled: boolean;
    sharedOutputView: boolean;
}

/**
 * @interface TestCaseCell
 * A cell specifically for defining and running automated tests.
 */
export interface TestCaseCell extends BaseCell {
    type: 'test_case';
    testFramework: 'jest' | 'pytest' | 'junit' | 'go_test' | 'custom' | 'robot_framework';
    testCode: string; // The actual test script
    targetCellIds: UniqueIdentifier[]; // Which cells or functions this test targets
    lastTestResult: TestResult;
    assertionCount: number;
    setupCode?: string; // Code to run before tests
    teardownCode?: string; // Code to run after tests
    runOnSave: boolean; // Automatically run tests when notebook is saved
    runOnCommit: boolean; // Automatically run tests before version control commit
}

/**
 * @interface SystemInfoCell
 * A cell to display real-time system or kernel information.
 */
export interface SystemInfoCell extends BaseCell {
    type: 'system_info';
    infoType: 'kernel_status' | 'resource_usage' | 'package_list' | 'environment_variables' | 'connected_users' | 'system_logs';
    refreshIntervalSeconds: number;
    displayOptions: Record<string, any>; // e.g., chart type for resource usage
}

/**
 * @interface CodeSnippetCell
 * A cell for storing and quickly inserting reusable code snippets.
 */
export interface CodeSnippetCell extends BaseCell {
    type: 'code_snippet';
    language: string;
    snippetName: string;
    parametersSchema?: DataSchema; // Define variables/placeholders within the snippet
    usageCount: number;
    // content is the snippet code itself
}

/**
 * @interface EquationCell
 * A cell dedicated to mathematical equations using LaTeX or similar syntax.
 */
export interface EquationCell extends BaseCell {
    type: 'equation';
    equationFormat: 'latex' | 'mathml' | 'asciimath';
    renderMode: 'block' | 'inline';
    // content holds the equation string
    previewImage?: string; // Rendered image of the equation
}

/**
 * @interface EmbedExternalCell
 * A generic cell for embedding arbitrary external content via URL.
 */
export interface EmbedExternalCell extends BaseCell {
    type: 'embed_external';
    embedUrl: string;
    allowScripts: boolean; // Warning: potential security risk
    sandboxAttributes?: string[]; // e.g., ['allow-scripts', 'allow-same-origin']
    width?: string;
    height?: string;
    scrollable: boolean;
}


export type AnyCell = CodeCell | MarkdownCell | DataCell | ChartCell | MediaCell | DiagramCell | FormCell | AICell | KnowledgeGraphCell | SimulationCell | WebComponentCell | LinkCell | QuestionCell | AnnotationCell | PluginCell | OutputDisplayCell | InteractiveAppCell | LiveCodeCell | TestCaseCell | SystemInfoCell | CodeSnippetCell | EquationCell | EmbedExternalCell;


// ----------------------------------------------------------------------------------------------------
// CELL METADATA & SUPPORTING INTERFACES
// ----------------------------------------------------------------------------------------------------

/**
 * @interface CellMetadata
 * General metadata for any cell.
 */
export interface CellMetadata {
    title?: string;
    description?: string;
    author?: UniqueIdentifier;
    lastEditor?: UniqueIdentifier;
    sourceNotebookId?: UniqueIdentifier; // If the cell was copied/linked from another notebook
    estimatedExecutionTimeMs?: number;
    costEstimate?: number; // Estimated cost for cloud resource usage for this cell
    customStyles?: Record<string, string>; // Inline CSS styles for rendering
    gpuEnabled?: boolean;
    resourceAllocation?: ResourceAllocationConfig;
    runConditions?: RunCondition[]; // Conditions under which the cell should execute
    secretsUsed?: string[]; // List of secret keys accessed by this cell
    inputDependenciesHash?: string; // Hash of input data/code to detect changes for caching
    outputCachingEnabled?: boolean;
    outputRetentionPolicy?: 'keep_all' | 'keep_latest' | 'keep_last_n'; // For execution results
    executionConcurrencyLimit?: number; // Max concurrent executions for this cell
    // ... potentially many more metadata fields
}

/**
 * @interface CodeLintingError
 * Represents a static analysis or linting error in a code cell.
 */
export interface CodeLintingError {
    ruleId: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
    line: number;
    column: number;
    endLine?: number;
    endColumn?: number;
    fixSuggestion?: string; // Proposed code change
    documentationUrl?: string;
}

/**
 * @interface CellEnvironment
 * Specific environment variables or package dependencies for a cell.
 */
export interface CellEnvironment {
    variables: Record<string, string>;
    packageDependencies: PackageDependency[];
    containerImage?: string; // Docker image to use for execution
    timeoutSeconds?: number;
    additionalPaths?: string[]; // e.g., PYTHONPATH
    secretsRefs?: UniqueIdentifier[]; // References to Secret objects
}

/**
 * @interface PackageDependency
 * Details of a required software package.
 */
export interface PackageDependency {
    name: string;
    version?: string; // e.g., "1.2.3" or ">=1.0,<2.0"
    manager: 'pip' | 'npm' | 'conda' | 'apt' | 'gem' | 'go_mod' | 'cargo' | 'maven' | 'nuget';
    source?: string; // e.g., git URL, private registry, specific file path
    isDevDependency: boolean;
}

/**
 * @interface ExecutionResult
 * Represents the outcome of a cell's execution.
 */
export interface ExecutionResult {
    id: UniqueIdentifier;
    executedAt: Timestamp;
    durationMs: number;
    executorId: UniqueIdentifier; // User or system that triggered execution
    status: 'success' | 'error' | 'warning' | 'cancelled';
    stdout: OutputBlock[];
    stderr: OutputBlock[];
    displayData: DisplayData[]; // Rich media, plots, tables
    error?: ExecutionError;
    warnings?: ExecutionWarning[];
    logMessages?: LogMessage[];
    resourceUsage?: ExecutionResourceUsage;
    outputHashes?: Record<string, string>; // Hashes of generated outputs for caching/diffing
    linkedArtifacts?: ArtifactReference[]; // References to external files generated
    runtimeEnvironmentSnapshot?: RuntimeEnvironmentSnapshot; // Details about the exact runtime
    generatedByAI?: boolean; // Was this result generated by an AI (e.g., code generation and execution)
    externalLink?: string; // Link to an external execution log or dashboard
}

/**
 * @interface OutputBlock
 * A single line or block of text output.
 */
export interface OutputBlock {
    line: string;
    timestamp: Timestamp;
    level?: 'info' | 'debug' | 'warn' | 'error' | 'trace';
    source?: 'kernel' | 'user_code' | 'system';
    metadata?: Record<string, any>; // Additional structured data for the log line
}

/**
 * @interface DisplayData
 * Represents rich, structured output for display.
 */
export interface DisplayData {
    mimeType: string; // e.g., 'image/png', 'application/json', 'text/html', 'text/plain', 'application/vnd.jupyter.widget-view+json'
    data: string | Record<string, any>; // Base64 encoded image, JSON object, HTML string, data URI
    metadata?: Record<string, any>; // e.g., dimensions for images, schema for JSON, plot configuration
    label?: string; // A descriptive label for the output
    componentId?: UniqueIdentifier; // If this display data is a react/vue component
    interactionHandlerId?: UniqueIdentifier; // For interactive outputs that trigger actions
    exportOptions?: ExportOption[]; // Options for exporting this specific display data
}

/**
 * @interface ExportOption
 * Defines an export capability for specific display data.
 */
export interface ExportOption {
    format: string; // e.g., 'PNG', 'CSV', 'JSON'
    label: string;
    iconUrl?: string;
    exportAction: FormAction; // Reuse FormAction to define export logic
}

/**
 * @interface ExecutionError
 * Details about an error during execution.
 */
export interface ExecutionError {
    errorType: string;
    message: string;
    stackTrace: string[];
    errorCode?: string;
    helpUrl?: string; // Link to documentation or troubleshooting
    aiDiagnostic?: AIInsight; // AI-powered error explanation/solution
    relevantCellId?: UniqueIdentifier; // If error originated in another cell
}

/**
 * @interface ExecutionWarning
 * Details about a warning during execution.
 */
export interface ExecutionWarning {
    warningType: string;
    message: string;
    source?: 'compiler' | 'runtime' | 'linter' | 'library';
    helpUrl?: string;
    aiSuggestion?: AIInsight; // AI-powered suggestion to address warning
}

/**
 * @interface LogMessage
 * A log entry from the execution environment.
 */
export interface LogMessage {
    timestamp: Timestamp;
    level: 'debug' | 'info' | 'warn' | 'error' | 'critical' | 'trace';
    message: string;
    source?: 'kernel' | 'plugin' | 'system' | 'user_code';
    metadata?: Record<string, any>; // Additional structured log data
}

/**
 * @interface ExecutionResourceUsage
 * Metrics on resource consumption during execution.
 */
export interface ExecutionResourceUsage {
    cpuTimeSeconds?: number;
    memoryBytes?: number;
    gpuTimeSeconds?: number;
    networkBytesSent?: number;
    networkBytesReceived?: number;
    diskIOBytesRead?: number;
    diskIOBytesWritten?: number;
    cloudCostEstimate?: number; // e.g., USD
    energyConsumptionKWh?: number;
    emissionsCO2eqKg?: number;
}

/**
 * @interface RuntimeEnvironmentSnapshot
 * Details of the exact runtime environment for reproducibility.
 */
export interface RuntimeEnvironmentSnapshot {
    kernelVersion: string;
    osInfo: string; // e.g., 'Linux Debian 11'
    pythonVersion?: string;
    nodeVersion?: string;
    rVersion?: string;
    installedPackages: PackageDependency[]; // Full list of installed packages with versions
    cpuInfo: string;
    gpuInfo?: string;
    memoryInfo: string;
    containerImageId?: string; // Hash or ID of the exact container image
    environmentVariablesSnapshot: Record<string, string>; // Values of env vars at runtime
}

/**
 * @interface CellVersionMetadata
 * Summary of a cell's version history entry.
 */
export interface CellVersionMetadata {
    versionId: UniqueIdentifier;
    timestamp: Timestamp;
    changedBy: UniqueIdentifier;
    summary: string; // "Updated code", "Fixed typo", "Added chart"
    // Reference to a full CellVersion object stored separately
}

/**
 * @interface CellVersion
 * Detailed historical version of a cell.
 */
export interface CellVersion {
    versionId: UniqueIdentifier;
    cellId: UniqueIdentifier;
    notebookId: UniqueIdentifier;
    previousVersionId?: UniqueIdentifier;
    nextVersionId?: UniqueIdentifier;
    timestamp: Timestamp;
    changedBy: UniqueIdentifier;
    contentDiff: string; // Diff format (e.g., Git diff, JSON diff)
    fullCellState: AnyCell; // Complete snapshot of the cell at this version
    reasonForChange?: string;
    parentCommitId?: UniqueIdentifier; // For Git-like versioning
}

/**
 * @interface CellDependency
 * Defines a dependency of one cell on another, or on an external resource.
 */
export interface CellDependency {
    targetId: UniqueIdentifier; // ID of the dependent cell or resource
    dependencyType: 'cell_output' | 'data_source' | 'environment_variable' | 'global_variable' | 'file_input' | 'api_call' | 'plugin_output' | 'system_resource';
    isStrongDependency: boolean; // If target must execute/exist for this cell to run
    description?: string;
    outputKeys?: string[]; // e.g., 'df_cleaned', 'model_metrics' from target cell
    inputKeys?: string[]; // e.g., 'param_a', 'param_b' for this cell
}

/**
 * @interface DataSchema
 * Describes the structure of tabular or JSON data.
 */
export interface DataSchema {
    format: 'json_schema' | 'avro_schema' | 'parquet_schema' | 'csv_header_types' | 'custom' | 'xml_schema' | 'yaml_schema';
    schemaDefinition: Record<string, any>; // Actual schema definition
    exampleData?: Record<string, any>[] | string; // Example data snippet
    description?: string;
    version?: string;
    lastUpdated?: Timestamp;
}

/**
 * @interface DataSourceConfig
 * Configuration for connecting to and loading data from external sources.
 */
export interface DataSourceConfig {
    sourceType: 'file_upload' | 'gcs_bucket' | 'bigquery' | 's3_bucket' | 'postgres' | 'mysql' | 'api_endpoint' | 'kafka_topic' | 'spreadsheet' | 'local_path' | 'mongodb' | 'snowflake' | 'salesforce' | 'redis';
    connectionId?: UniqueIdentifier; // Reference to stored DataConnector credentials
    pathOrQuery: string; // File path, SQL query, API URL, topic name
    formatOptions?: Record<string, any>; // e.g., CSV delimiter, JSON path, schema version
    authenticationRequired: boolean;
    refreshIntervalSeconds?: number;
    dataFilters?: Record<string, any>; // Initial filters to apply on load
    cacheStrategy?: 'no_cache' | 'in_memory' | 'persistent_disk';
    projectionFields?: string[]; // Only load specific fields/columns
}

/**
 * @interface DataTransformationStep
 * A step in the data processing pipeline.
 */
export interface DataTransformationStep {
    stepId: UniqueIdentifier;
    operation: string; // e.g., 'filter', 'join', 'aggregate', 'pivot', 'map', 'clean_missing', 'normalize'
    parameters: Record<string, any>;
    sourceCellId?: UniqueIdentifier; // If the transformation was defined in a code cell
    timestamp: Timestamp;
    appliedBy: UniqueIdentifier;
    description?: string;
    outputSchemaChange?: DataSchema; // If this transformation alters the schema
}

/**
 * @interface ChartConfiguration
 * Detailed settings for a chart.
 */
export interface ChartConfiguration {
    dataMapping: Record<string, string>; // e.g., { x: 'date', y: 'value', color: 'category' }
    chartOptions: Record<string, any>; // Library-specific options (e.g., Vega-Lite spec, Plotly layout, Highcharts config)
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    interactiveFeatures: ('zoom' | 'pan' | 'tooltip' | 'selection' | 'brush' | 'legend_toggle')[];
    colorPalette?: string; // e.g., 'viridis', '#FF0000,#00FF00', 'google_charts_default'
    legendEnabled: boolean;
    exportSettings?: ChartExportSettings;
    width?: string | number; // e.g., 'auto', '800px', 800
    height?: string | number;
    responsive: boolean;
    dataInterpolation?: 'linear' | 'spline' | 'step'; // For line charts
}

/**
 * @interface ChartExportSettings
 * Configuration for exporting charts.
 */
export interface ChartExportSettings {
    resolutionDpi?: number;
    transparentBackground: boolean;
    includeTitle: boolean;
    includeLegend: boolean;
    includeWatermark: boolean;
    fileNameTemplate?: string; // e.g., 'my_chart_{timestamp}'
}

/**
 * @enum {string} ChartExportFormat
 * Supported formats for exporting charts.
 */
export type ChartExportFormat = 'png' | 'svg' | 'jpeg' | 'pdf' | 'json_vega_lite' | 'html_interactive' | 'csv' | 'json';

/**
 * @enum {string} DiagramExportFormat
 * Supported formats for exporting diagrams.
 */
export type DiagramExportFormat = 'png' | 'svg' | 'jpeg' | 'pdf' | 'drawio_xml' | 'plantuml_text' | 'markdown';

/**
 * @interface FormFieldDefinition
 * Defines a single input field in a FormCell.
 */
export interface FormFieldDefinition {
    fieldId: string;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'date' | 'select' | 'textarea' | 'file_upload' | 'slider' | 'color_picker' | 'password' | 'richtext' | 'multi_select' | 'checkbox_group' | 'radio_group' | 'datetime_local';
    defaultValue?: any;
    placeholder?: string;
    required: boolean;
    options?: { value: string | number | boolean; label: string; disabled?: boolean }[]; // For select/radio/checkbox_group
    validationRegex?: string;
    errorMessage?: string;
    helperText?: string;
    min?: number;
    max?: number;
    step?: number;
    minLength?: number;
    maxLength?: number;
    isVisibleCondition?: FormFieldCondition; // Conditional visibility based on other fields
    isDisabledCondition?: FormFieldCondition; // Conditional disable based on other fields
    outputVariableName?: string; // Name of the variable to store this field's value
}

/**
 * @interface FormFieldCondition
 * A condition for form field visibility or enablement.
 */
export interface FormFieldCondition {
    fieldId: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'is_empty' | 'is_not_empty' | 'starts_with' | 'ends_with';
    value: any;
    // Combine with AND/OR
    logicOperator?: 'AND' | 'OR';
    nestedConditions?: FormFieldCondition[];
}

/**
 * @interface FormAction
 * An action to perform when a form is submitted.
 */
export interface FormAction {
    actionType: 'execute_cell' | 'update_cell_content' | 'call_api' | 'send_email' | 'trigger_workflow' | 'update_database' | 'navigate_to_url' | 'download_file';
    targetId?: UniqueIdentifier; // Cell ID, API endpoint, workflow ID, etc.
    parametersMapping: Record<string, string>; // Map form field values to action parameters (e.g., { "apiParam": "formFieldId" })
    confirmationMessage?: string;
    successMessage?: string;
    errorMessage?: string;
    redirectUrl?: string; // For 'navigate_to_url' or post-submission redirect
}

/**
 * @interface AIResponse
 * A single response from an AI model.
 */
export interface AIResponse {
    responseId: UniqueIdentifier;
    modelOutput: string | Record<string, any>; // Can be text, JSON, base64 image data, audio
    generatedAt: Timestamp;
    tokenUsage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    latencyMs: number;
    finishReason: 'stop' | 'length' | 'content_filter' | 'tool_calls' | 'function_call' | 'error';
    toolCalls?: AIToolCall[]; // If the AI called external tools
    cost?: number; // Cost of this specific response
    modelIdUsed?: UniqueIdentifier; // Explicit model ID if overridden
    safetyAttributes?: AISafetyAttributes;
    responseMetadata?: Record<string, any>; // Any additional metadata from the AI provider
}

/**
 * @interface AISafetyAttributes
 * Attributes indicating the safety and content filtering of AI responses.
 */
export interface AISafetyAttributes {
    hateSpeech: 'none' | 'low' | 'medium' | 'high';
    sexualContent: 'none' | 'low' | 'medium' | 'high';
    violence: 'none' | 'low' | 'medium' | 'high';
    harassment: 'none' | 'low' | 'medium' | 'high';
    dangerousContent: 'none' | 'low' | 'medium' | 'high';
    // More fine-grained categories can be added
    filtered: boolean; // Was the content partially or fully filtered?
    filteredReason?: string;
}

/**
 * @interface AIToolCall
 * Represents an AI model's call to an external tool or function.
 */
export interface AIToolCall {
    toolName: string;
    toolArguments: Record<string, any>;
    toolOutput: string | Record<string, any>;
    executedSuccessfully: boolean;
    executionLog?: OutputBlock[];
    errorMessage?: string; // If tool execution failed
}

/**
 * @interface AICostEstimate
 * Estimated cost breakdown for AI usage.
 */
export interface AICostEstimate {
    totalEstimateUSD: number;
    promptTokenCostUSD: number;
    completionTokenCostUSD: number;
    modelApiCalls: number;
    modelUsageDetails: Record<string, any>; // e.g., specific model tier pricing, image generation units
    currency?: string; // e.g., "USD", "EUR"
}

/**
 * @interface AIEvaluationMetrics
 * Metrics for evaluating AI model performance or response quality.
 */
export interface AIEvaluationMetrics {
    relevanceScore?: number; // 0-1
    coherenceScore?: number;
    factualityScore?: number;
    safetyScore?: number;
    latencyFeedback?: 'fast' | 'moderate' | 'slow';
    accuracyFeedback?: 'high' | 'medium' | 'low';
    humanRating?: number; // User provided rating, e.g., 1-5 stars
    modelConfident?: boolean; // If the model itself provided a confidence score
}

/**
 * @interface AIResponseFeedback
 * User feedback on an AI-generated response.
 */
export interface AIResponseFeedback {
    userId: UniqueIdentifier;
    feedbackDate: Timestamp;
    rating: 'thumbs_up' | 'thumbs_down' | 'neutral';
    comment?: string;
    isHelpful: boolean;
    suggestedCorrection?: string;
    categories?: string[]; // e.g., 'incorrect', 'irrelevant', 'unsafe', 'creative'
}

/**
 * @interface KnowledgeGraphData
 * Structure for knowledge graph data.
 */
export interface KnowledgeGraphData {
    nodes: GraphNode[];
    edges: GraphEdge[];
    graphFormat: 'cytoscape_json' | 'rdf_json' | 'custom_json' | 'neo4j_json';
    ontologyRefId?: UniqueIdentifier; // Reference to an associated ontology
    schemaRefId?: UniqueIdentifier; // Reference to a schema for the graph data
    visualisationConfig?: Record<string, any>; // Layout algorithms, node/edge styling
}

/**
 * @interface GraphNode
 * A node in a knowledge graph.
 */
export interface GraphNode {
    id: UniqueIdentifier;
    label: string;
    type?: string; // e.g., 'Person', 'Organization', 'Concept'
    properties?: Record<string, any>;
    position?: { x: number; y: number }; // For layout hints
    style?: Record<string, any>; // e.g., color, size, icon
    relatedEntities?: UniqueIdentifier[]; // Other nodes frequently related
}

/**
 * @interface GraphEdge
 * An edge connecting two nodes in a knowledge graph.
 */
export interface GraphEdge {
    id: UniqueIdentifier;
    source: UniqueIdentifier; // Node ID
    target: UniqueIdentifier; // Node ID
    label: string;
    type?: string; // e.g., 'HAS_RELATION', 'WORKS_FOR', 'IS_A'
    properties?: Record<string, any>;
    style?: Record<string, any>; // e.g., color, line style, arrow type
    weight?: number; // For weighted graphs
}

/**
 * @interface SimulationParameter
 * A configurable parameter for a simulation.
 */
export interface SimulationParameter {
    name: string;
    type: 'number' | 'string' | 'boolean' | 'range' | 'enum' | 'date' | 'file';
    defaultValue: any;
    currentValue: any;
    min?: number;
    max?: number;
    step?: number;
    options?: { value: any; label: string }[]; // For 'enum' type
    description?: string;
    unit?: string;
    group?: string; // For grouping parameters in UI
    isOutput?: boolean; // Can this parameter also be an output?
}

/**
 * @interface SimulationMetric
 * A measurable output or metric from a simulation.
 */
export interface SimulationMetric {
    name: string;
    description: string;
    unit?: string;
    displayType: 'scalar' | 'time_series' | 'histogram' | 'heatmap' | 'distribution';
    outputRef?: string; // Reference to where in executionResults this metric can be found (e.g., 'outputs.final_value')
    aggregationMethod?: 'avg' | 'min' | 'max' | 'sum' | 'last'; // For multiple simulation runs
    targetValue?: number; // For comparison
    thresholds?: { warn: number; error: number; };
}

/**
 * @interface SimulationControl
 * An interactive control for manipulating a simulation.
 */
export interface SimulationControl {
    controlId: UniqueIdentifier;
    label: string;
    controlType: 'slider' | 'button' | 'dropdown' | 'toggle' | 'text_input' | 'number_input' | 'date_picker';
    targetParameter: string; // Name of the parameter it controls
    actionEvent?: 'on_change' | 'on_click' | 'on_enter';
    buttonText?: string;
    options?: { value: any; label: string }[];
    autoResetOnParamChange: boolean;
}

/**
 * @interface WebComponentEventBinding
 * Binds an event from a custom web component to an action in the notebook.
 */
export interface WebComponentEventBinding {
    eventName: string; // e.g., 'value-changed', 'clicked', 'submit-data'
    actionType: 'update_cell_content' | 'execute_cell' | 'update_variable' | 'call_api' | 'trigger_workflow' | 'set_form_field';
    targetId?: UniqueIdentifier;
    payloadMapping?: Record<string, string>; // Maps event data attributes to action parameters (e.g., { "paramA": "event.detail.value" })
    debounceMs?: number; // For frequent events like 'input'
}

/**
 * @interface QuestionOption
 * An option for multiple-choice or single-choice questions.
 */
export interface QuestionOption {
    id: UniqueIdentifier;
    text: string;
    isCorrect?: boolean; // Only for quizzes with defined correct answers
    feedback?: string; // Specific feedback for this option
    order?: number; // For display order
}

/**
 * @interface QuestionResponse
 * A user's response to a question cell.
 */
export interface QuestionResponse {
    responseId: UniqueIdentifier;
    userId: UniqueIdentifier;
    respondedAt: Timestamp;
    responseText?: string; // For text input
    selectedOptionIds?: UniqueIdentifier[]; // For multiple/single choice
    matchingPairs?: { left: string; right: string }[]; // For matching questions
    isCorrect?: boolean; // Auto-graded if possible
    score?: number; // For weighted questions
    gradingComment?: string; // For manual grading
    lastAttemptNumber: number;
}

/**
 * @interface OutputTransformationConfig
 * Configuration for transforming or aggregating outputs.
 */
export interface OutputTransformationConfig {
    transformationType: 'aggregate' | 'filter' | 'combine' | 'pivot' | 'custom_script' | 'chart_transform' | 'json_path_extract';
    parameters: Record<string, any>;
    scriptLanguage?: string; // If 'custom_script'
    scriptContent?: string;
    outputSchema?: DataSchema; // Expected schema after transformation
}

/**
 * @interface AppDeploymentConfig
 * Configuration for deploying a notebook as an interactive application.
 */
export interface AppDeploymentConfig {
    deploymentTarget: 'web_app' | 'api_endpoint' | 'container_image' | 'static_html' | 'serverless_function' | 'jupyter_dash';
    entryCellId: UniqueIdentifier; // The cell that serves as the entry point or main view
    exposedParameters: UniqueIdentifier[]; // IDs of form fields or parameters to expose as app inputs
    authStrategy: 'public' | 'private_google' | 'private_oauth' | 'token_based' | 'api_key';
    computeInstanceType?: string; // e.g., 'e2-standard-4', 'g4dn.xlarge', 'F1-micro'
    minReplicas?: number;
    maxReplicas?: number;
    autoScaleEnabled: boolean;
    domainName?: string; // Custom domain for the deployed app
    cdnEnabled: boolean;
    monitoringEnabled: boolean;
    costOptimizationStrategy?: 'always_on' | 'scale_to_zero' | 'scheduled_shutdown';
    environmentVariables?: EnvironmentVariable[]; // Specific env vars for deployment
}

/**
 * @interface AppDeploymentVersion
 * Records a specific deployment version of an interactive app.
 */
export interface AppDeploymentVersion {
    versionId: UniqueIdentifier;
    deployedAt: Timestamp;
    deployedBy: UniqueIdentifier;
    status: 'success' | 'failure' | 'rollback';
    gitCommitHash?: string; // If linked to VCS
    changelog?: string;
    rollbackTargetId?: UniqueIdentifier; // If this was a rollback
}

/**
 * @interface DashboardLayoutConfig
 * Configuration for how cells are laid out in a dashboard view.
 */
export interface DashboardLayoutConfig {
    layoutId: UniqueIdentifier;
    name: string;
    layoutType: 'grid' | 'flex' | 'absolute' | 'responsive_grid';
    cellPositions: {
        cellId: UniqueIdentifier;
        x: number;
        y: number;
        width: number;
        height: number;
        zIndex?: number;
        // Responsive breakpoints
        lg?: { x: number; y: number; width: number; height: number; };
        md?: { x: number; y: number; width: number; height: number; };
        sm?: { x: number; y: number; width: number; height: number; };
    }[];
    themeOverride?: UniqueIdentifier; // Custom dashboard theme
    interactionHandlers?: DashboardInteractionHandler[];
    defaultView: boolean;
    allowUserEdit: boolean; // Can viewers customize their own layout?
}

/**
 * @interface DashboardInteractionHandler
 * Defines how user interactions on a dashboard trigger actions.
 */
export interface DashboardInteractionHandler {
    handlerId: UniqueIdentifier;
    sourceCellId: UniqueIdentifier;
    eventType: string; // e.g., 'chart_click', 'button_press', 'slider_change', 'data_selection'
    action: FormAction; // Reuse FormAction for consistency, can update other cells, trigger APIs
    description?: string;
}

/**
 * @interface TestResult
 * The outcome of running a test case.
 */
export interface TestResult {
    testRunId: UniqueIdentifier;
    ranAt: Timestamp;
    durationMs: number;
    status: 'pass' | 'fail' | 'error' | 'skipped' | 'running';
    assertionsPassed: number;
    assertionsFailed: number;
    errorMessage?: string; // If status is 'fail' or 'error'
    stackTrace?: string[];
    logs?: OutputBlock[];
    coverageReportUrl?: string; // Link to a code coverage report
    associatedIssueId?: UniqueIdentifier; // Link to a bug tracker
    testDetails?: TestCaseDetail[]; // Individual test results within a cell
    codeCoveragePercent?: number;
}

/**
 * @interface TestCaseDetail
 * Details for individual assertions or sub-tests within a TestCaseCell.
 */
export interface TestCaseDetail {
    testName: string;
    status: 'pass' | 'fail' | 'error' | 'skipped';
    message?: string;
    durationMs: number;
    stackTrace?: string[];
}

/**
 * @interface CodeGuardrailConfig
 * Configuration for AI-driven code quality and security checks.
 */
export interface CodeGuardrailConfig {
    guardrailType: 'security_vulnerability' | 'performance_bottleneck' | 'style_guide' | 'best_practices' | 'documentation_gap' | 'licensing_compliance' | 'code_complexity' | 'data_leakage';
    severityThreshold: 'info' | 'warning' | 'error';
    enabled: boolean;
    autoFixEnabled: boolean; // Can AI automatically suggest/apply fixes?
    customRules?: string[]; // Custom regex or logic for specific checks (e.g., specific forbidden functions)
    modelId?: UniqueIdentifier; // Specific AI model for this guardrail
}

/**
 * @interface ResourceAllocationConfig
 * Configuration for compute resource allocation.
 */
export interface ResourceAllocationConfig {
    cpuUnits?: number; // e.g., '1' for 1 CPU core, '0.5' for half
    memoryGb?: number; // e.g., '4' for 4 GB RAM
    gpuCount?: number;
    gpuType?: 'nvidia_t4' | 'nvidia_v100' | 'amd_mi250' | 'tensor_core';
    diskStorageGb?: number;
    ephemeralDiskEnabled: boolean;
    persistentDiskId?: UniqueIdentifier; // For attaching pre-existing persistent storage
    priorityTier: 'low' | 'medium' | 'high' | 'spot'; // For cloud resource provisioning
    region?: string; // Cloud region for execution
    acceleratorConfig?: Record<string, any>; // Specific configs for custom accelerators
    preemptible: boolean; // Can resource be reclaimed by provider?
}

/**
 * @interface RunCondition
 * A condition that must be met for a cell to execute.
 */
export interface RunCondition {
    conditionType: 'previous_cell_success' | 'data_available' | 'variable_set' | 'time_of_day' | 'external_event' | 'user_input_ready' | 'api_response_status' | 'file_exists';
    targetId?: UniqueIdentifier; // e.g., ID of the previous cell, ID of the data source, variable name
    value?: any; // e.g., the specific variable value, expected API status code
    operator?: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'exists' | 'not_exists' | 'contains_value';
    failureAction: 'skip' | 'error' | 'wait' | 'prompt_user'; // What to do if condition not met
    timeoutSeconds?: number; // For 'wait' action
    errorMessage?: string; // Custom message if condition fails
    checkIntervalSeconds?: number; // For 'wait' action, how often to re-check
}


// ----------------------------------------------------------------------------------------------------
// NOTEBOOK, WORKSPACE, PROJECT STRUCTURES - HIGH-LEVEL ORGANIZATION
// ----------------------------------------------------------------------------------------------------

/**
 * @enum {string} NotebookStatus
 * Status of a notebook (e.g., active, archived, template).
 */
export type NotebookStatus = 'active' | 'archived' | 'template' | 'draft' | 'published' | 'deprecated' | 'in_review' | 'locked';

/**
 * @enum {string} NotebookType
 * Categorization of notebooks.
 */
export type NotebookType = 'research' | 'tutorial' | 'report' | 'dashboard' | 'application' | 'data_analysis' | 'ml_experiment' | 'documentation' | 'personal' | 'qa_testing' | 'etl_pipeline';

/**
 * @interface Notebook
 * Represents a single notebook, a collection of cells.
 */
export interface Notebook {
    id: UniqueIdentifier;
    title: string;
    description?: string;
    cells: UniqueIdentifier[]; // Ordered list of cell IDs
    tags: string[]; // General notebook tags
    status: NotebookStatus;
    type: NotebookType;
    createdAt: Timestamp;
    lastModifiedAt: Timestamp;
    createdBy: UniqueIdentifier;
    lastModifiedBy: UniqueIdentifier;
    projectId: UniqueIdentifier;
    workspaceId: UniqueIdentifier;
    sharedSettings: SharedLinkSettings;
    permissions: ResourcePermissions[];
    versionControl: NotebookVersionControl;
    kernelConfiguration: KernelConfiguration;
    environmentVariables: EnvironmentVariable[];
    dataSources: DataSourceConfig[];
    metadata: NotebookMetadata;
    scheduleConfig?: SchedulerConfig; // For automated execution
    templateId?: UniqueIdentifier; // If created from a template
    reviewProcess: NotebookReviewProcess; // For formal reviews
    aiCopilotSettings: AICopilotSettings; // AI assistance settings for the notebook
    auditLog: AuditLogEntry[]; // In-line audit log (can be a reference to external log)
    comments: UniqueIdentifier[]; // Top-level notebook comments
    dashboardLayouts: DashboardLayoutConfig[]; // Different dashboard views of the notebook
    dependencyGraphId: UniqueIdentifier; // Reference to a computed dependency graph
    folderId?: UniqueIdentifier; // The folder this notebook belongs to
    thumbnailUrl?: string; // Auto-generated thumbnail image
    lastRunStatus?: 'success' | 'failure' | 'skipped' | 'running';
    lastRunTimestamp?: Timestamp;
}

/**
 * @interface NotebookMetadata
 * General metadata for a notebook.
 */
export interface NotebookMetadata {
    keywords?: string[];
    license?: string; // e.g., 'MIT', 'Apache-2.0', 'Proprietary'
    language?: string; // Primary language of the notebook, e.g., 'Python', 'R', 'TypeScript'
    targetAudience?: string; // e.g., 'data scientists', 'business analysts', 'developers'
    estimatedCost?: number; // Overall estimated cost for running the notebook
    estimatedDurationMinutes?: number;
    externalLinks?: { title: string; url: string; }[];
    references?: Citation[];
    documentationStatus?: 'complete' | 'partial' | 'none';
    confidentialityLevel?: 'public' | 'internal' | 'restricted' | 'secret';
    ownerContact?: string; // Email or user ID for contact
    // ... many more project/domain specific metadata
}

/**
 * @interface Citation
 * Represents a citation or reference within the notebook.
 */
export interface Citation {
    id: UniqueIdentifier;
    text: string; // e.g., APA, MLA format
    url?: string;
    doi?: string;
    authors?: string[];
    year?: number;
    title?: string;
    journalOrPublisher?: string;
    type?: 'article' | 'book' | 'website' | 'report' | 'software';
    // ... more bibliographic fields
}

/**
 * @interface NotebookVersionControl
 * Configuration and history for notebook versioning.
 */
export interface NotebookVersionControl {
    isEnabled: boolean;
    commitMessageStrategy: 'manual' | 'auto_snapshot' | 'ai_generated_summary' | 'git_commit_link';
    autoSnapshotIntervalMinutes?: number;
    currentVersionId: UniqueIdentifier; // The latest committed version
    history: NotebookVersionMetadata[]; // Summaries of past versions
    branchName: string; // Current active branch (e.g., 'main', 'feature/refactor-model')
    mergeRequests: UniqueIdentifier[]; // References to open merge requests (if integrated with external VCS)
    lastSyncedCommitHash?: string; // For external VCS integration
    lockOnEdit: boolean; // Prevent multiple users from editing simultaneously
}

/**
 * @interface NotebookVersionMetadata
 * Summary of a notebook's version history entry.
 */
export interface NotebookVersionMetadata {
    versionId: UniqueIdentifier;
    timestamp: Timestamp;
    changedBy: UniqueIdentifier;
    commitMessage: string;
    snapshotSizeKb: number;
    changesSummary: string; // AI-generated summary of changes
    parentVersionId?: UniqueIdentifier;
    diffUrl?: string; // URL to a visual diff
    tags?: string[]; // e.g., 'major-release', 'bug-fix'
}

/**
 * @interface NotebookVersion
 * A detailed snapshot of a notebook at a specific version.
 */
export interface NotebookVersion {
    versionId: UniqueIdentifier;
    notebookId: UniqueIdentifier;
    timestamp: Timestamp;
    changedBy: UniqueIdentifier;
    commitMessage: string;
    fullNotebookState: Notebook; // Complete snapshot of the notebook object
    diffAgainstParent: string; // Diff format for easier review (e.g., JSON Patch)
    parentVersionId?: UniqueIdentifier;
    storagePath?: string; // Path to where the full snapshot is stored
}

/**
 * @interface KernelConfiguration
 * Details about the computational kernel environment for a notebook.
 */
export interface KernelConfiguration {
    defaultLanguage: string;
    availableLanguages: string[];
    defaultComputeProfile: ComputeProfile;
    availableComputeProfiles: ComputeProfile[];
    packageManagement: 'pip' | 'conda' | 'npm' | 'system' | 'custom_script' | 'maven' | 'go_mod';
    globalDependencies: PackageDependency[];
    startupScript?: string; // Script to run when kernel starts
    shutdownScript?: string; // Script to run when kernel shuts down
    maxIdleTimeMinutes: number;
    autoRestartOnError: boolean;
    sharedKernelPoolId?: UniqueIdentifier; // For multi-notebook shared kernels
    customDockerImage?: string; // Custom Docker image for the kernel
    networkAccessRestrictions?: NetworkAccessRule[]; // Firewall rules for the kernel
    preWarmEnabled: boolean; // Keep kernel warm even if idle
    isolatedEnvironment: boolean; // Run in a fully isolated container
}

/**
 * @interface NetworkAccessRule
 * Defines network access rules for a kernel.
 */
export interface NetworkAccessRule {
    protocol: 'tcp' | 'udp' | 'icmp' | 'all';
    portRange?: string; // e.g., "80", "8080-8088"
    ipAddressRange?: string; // e.g., "0.0.0.0/0", "192.168.1.1/24"
    action: 'allow' | 'deny';
    direction: 'ingress' | 'egress';
}


/**
 * @interface ComputeProfile
 * Defines a specific computational resource profile.
 */
export interface ComputeProfile {
    id: UniqueIdentifier;
    name: string;
    description: string;
    cpuUnits: number;
    memoryGb: number;
    gpuCount: number;
    gpuType?: string; // e.g., 'NVIDIA_TESLA_T4'
    diskStorageGb: number;
    cloudProvider?: 'gcp' | 'aws' | 'azure' | 'on_premise' | 'kubernetes';
    region?: string;
    costPerHourEstimate?: number; // USD
    isDefault: boolean;
    availableToUsers: UniqueIdentifier[]; // User IDs
    availableToRoles: UserRole[]; // Roles
    autoShutdownEnabled: boolean; // Auto-shutdown after idle period
    machineType?: string; // e.g., 'n1-standard-4', 'm5.large'
}

/**
 * @interface EnvironmentVariable
 * A key-value pair for environment settings.
 */
export interface EnvironmentVariable {
    name: string;
    value: string; // Potentially encrypted if sensitive
    isSensitive: boolean; // Indicates if this variable should be treated as a secret
    scope: 'notebook' | 'project' | 'workspace' | 'global';
    description?: string;
    encryptedUsing?: 'kms' | 'vault'; // Encryption mechanism
}

/**
 * @interface SchedulerConfig
 * Configuration for automated execution of a notebook.
 */
export interface SchedulerConfig {
    isEnabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom_cron' | 'on_data_arrival' | 'on_external_event';
    cronExpression?: string; // For custom_cron
    startTime: Timestamp; // Initial run time or daily time
    timeZone: string;
    onSuccessActions: ScheduledAction[];
    onFailureActions: ScheduledAction[];
    lastRunStatus: 'success' | 'failure' | 'running' | 'scheduled' | 'skipped' | 'cancelled';
    lastRunTimestamp?: Timestamp;
    nextRunTimestamp?: Timestamp;
    notificationRecipients: UniqueIdentifier[]; // Users or groups to notify
    maxConcurrentRuns: number;
    retryPolicy: RetryPolicy;
    executionLogRetentionDays: number;
}

/**
 * @interface RetryPolicy
 * Defines how scheduled actions or executions should be retried on failure.
 */
export interface RetryPolicy {
    enabled: boolean;
    maxRetries: number;
    delaySeconds: number; // Initial delay
    delayMultiplier?: number; // e.g., 2 for exponential backoff
    maxDelaySeconds?: number;
    retryOnErrors?: string[]; // Specific error types to retry on
}

/**
 * @interface ScheduledAction
 * An action to be taken after a scheduled notebook run.
 */
export interface ScheduledAction {
    actionType: 'send_email' | 'trigger_webhook' | 'export_results' | 'update_dashboard' | 'publish_notebook' | 'start_other_notebook' | 'send_slack_message' | 'create_jira_issue';
    parameters: Record<string, any>; // e.g., email address, webhook URL, export format, notebook ID to start
    condition?: 'always' | 'on_success' | 'on_failure';
}

/**
 * @interface NotebookReviewProcess
 * Configuration and state for formal review workflows.
 */
export interface NotebookReviewProcess {
    isEnabled: boolean;
    requiredReviewers: UniqueIdentifier[]; // User IDs who must approve
    currentReviewStatus: 'draft' | 'pending_review' | 'in_review' | 'approved' | 'revisions_requested' | 'rejected';
    reviewersComments: UniqueIdentifier[]; // References to specific review comments
    approvalHistory: ApprovalRecord[];
    deadline?: Timestamp;
    autoAssignReviewers: boolean;
    reviewPolicy: 'all_required' | 'any_one_required' | 'majority_required';
    integrationWithExternalTools?: 'jira' | 'github_pr';
}

/**
 * @interface ApprovalRecord
 * A single approval action in a review process.
 */
export interface ApprovalRecord {
    reviewerId: UniqueIdentifier;
    timestamp: Timestamp;
    status: 'approved' | 'rejected' | 'requested_revisions';
    comment?: string;
    reviewVersionId?: UniqueIdentifier; // The specific notebook version reviewed
}

/**
 * @interface AICopilotSettings
 * Configuration for AI assistance features within a notebook.
 */
export interface AICopilotSettings {
    isEnabled: boolean;
    defaultModel: UniqueIdentifier; // Default AI model for this notebook
    autoSuggestCode: boolean;
    autoFixErrors: boolean;
    summarizeOutputs: boolean;
    generateDocumentation: boolean;
    codeRefactoringEnabled: boolean;
    sentimentAnalysisComments: boolean;
    dataInsightGeneration: boolean;
    customPromptTemplates: UniqueIdentifier[]; // IDs of custom prompt templates
    contentModerationEnabled: boolean;
    costThresholdWarning?: number; // Warn if AI usage exceeds this amount (USD)
    personalizedSuggestions: boolean; // Use user's history for better suggestions
}

/**
 * @interface AIInsight
 * An AI-generated piece of information or suggestion.
 */
export interface AIInsight {
    insightId: UniqueIdentifier;
    type: AISuggestionType;
    sourceCellId?: UniqueIdentifier; // If linked to a specific cell
    timestamp: Timestamp;
    generatedByModel: UniqueIdentifier;
    severity: 'info' | 'warning' | 'error' | 'suggestion' | 'critical';
    message: string;
    solution?: string; // Proposed solution or action
    confidenceScore?: number; // AI's confidence in the insight (0-1)
    relatedCodeRange?: { startLine: number; endLine: number; startChar?: number; endChar?: number; }; // For code-related insights
    actionableItems?: AIActionableItem[]; // AI-suggested actions
    isDismissed: boolean;
    dismissedBy?: UniqueIdentifier;
    dismissedAt?: Timestamp;
    rationale?: string; // Why the AI made this suggestion
    exampleDiff?: string; // Example of a code change
}

/**
 * @enum {string} AISuggestionType
 * Categories of AI-generated insights.
 */
export type AISuggestionType = 'code_completion' | 'error_explanation' | 'refactoring_suggestion' | 'documentation_generation' | 'data_summary' | 'visualization_suggestion' | 'security_vulnerability' | 'performance_bottleneck' | 'alternative_approach' | 'ethical_bias_detection' | 'code_review_comment' | 'cost_optimization' | 'best_practice_violation' | 'data_type_mismatch';

/**
 * @interface AIActionableItem
 * A suggested action that can be performed based on an AI insight.
 */
export interface AIActionableItem {
    actionLabel: string; // e.g., "Apply fix", "Generate explanation", "Refactor function"
    actionType: 'apply_patch' | 'insert_text' | 'replace_text' | 'execute_command' | 'open_dialog' | 'navigate_to_url' | 'generate_cell' | 'delete_cell' | 'update_cell_metadata';
    payload: Record<string, any>; // e.g., { patch: "...", targetCellId: "...", startLine: 10 }
    requiresConfirmation: boolean;
    isApplied: boolean;
    appliedBy?: UniqueIdentifier;
    appliedAt?: Timestamp;
}

/**
 * @interface AuditLogEntry
 * A record of significant actions performed in the notebook.
 */
export interface AuditLogEntry {
    logId: UniqueIdentifier;
    timestamp: Timestamp;
    userId: UniqueIdentifier;
    action: 'created' | 'modified' | 'deleted' | 'shared' | 'executed' | 'published' | 'accessed' | 'permission_changed' | 'reverted_version' | 'commented' | 'approved_review' | 'deployed_app' | 'started_workflow' | 'modified_setting' | 'login' | 'logout';
    targetType: 'notebook' | 'cell' | 'comment' | 'permission' | 'version' | 'project' | 'workspace' | 'user' | 'plugin' | 'secret' | 'workflow' | 'app_deployment';
    targetId: UniqueIdentifier;
    details: Record<string, any>; // JSON blob with action-specific details (e.g., old_value, new_value for modifications)
    ipAddress?: string;
    userAgent?: string;
    isSystemAction: boolean; // Was the action performed by the system (e.g., scheduled execution)
}

/**
 * @interface DiscussionThread
 * A collection of comments related to a specific item.
 */
export interface DiscussionThread {
    id: UniqueIdentifier;
    targetId: UniqueIdentifier; // Cell ID, Notebook ID, Version ID, Output ID
    targetType: 'notebook' | 'cell' | 'version' | 'project' | 'workspace' | 'output_block' | 'notebook_header' | 'code_line';
    comments: UniqueIdentifier[]; // Ordered list of comment IDs
    createdAt: Timestamp;
    createdBy: UniqueIdentifier;
    resolved: boolean;
    resolvedBy?: UniqueIdentifier;
    resolvedAt?: Timestamp;
    latestCommentAt: Timestamp;
    participantIds: UniqueIdentifier[];
    // Can link to a specific range of code or text
    contextSnippet?: string; // The text or code snippet being discussed
}

/**
 * @interface Comment
 * A single comment made by a user.
 */
export interface Comment {
    id: UniqueIdentifier;
    threadId: UniqueIdentifier;
    userId: UniqueIdentifier;
    parentId?: UniqueIdentifier; // For threaded replies
    timestamp: Timestamp;
    content: string; // Markdown supported
    reactions: CommentReaction[];
    mentions: UniqueIdentifier[]; // User IDs mentioned
    isEdited: boolean;
    editedAt?: Timestamp;
    deleted: boolean;
    // Potentially attach to a specific code line/range for cells
    lineStart?: number;
    lineEnd?: number;
    charStart?: number;
    charEnd?: number;
    hasAiSummary?: boolean; // If AI has summarized this comment
}

/**
 * @interface CommentReaction
 * A user's reaction to a comment.
 */
export interface CommentReaction {
    emoji: string; // e.g., '👍', '❤️', '✅'
    userIds: UniqueIdentifier[];
}

/**
 * @interface LiveUserPresence
 * Represents a user's real-time presence in a notebook.
 */
export interface LiveUserPresence {
    userId: UniqueIdentifier;
    notebookId: UniqueIdentifier;
    activeCellId?: UniqueIdentifier; // Which cell they are currently viewing/editing
    cursorPosition?: { line: number; ch: number; }; // For code/markdown cells
    selectionRange?: { start: { line: number; ch: number; }; end: { line: number; ch: number; }; };
    lastHeartbeat: Timestamp;
    isEditing: boolean;
    viewMode: 'editing' | 'viewing' | 'presenting' | 'reviewing';
    // For collaborative editing, can include ghost text/changes
    pendingChanges?: string;
    colorHex?: string; // Unique color for user's cursor/selection
}

/**
 * @interface ActivityLogEntry
 * High-level activity log, possibly real-time for live feeds.
 */
export interface ActivityLogEntry {
    activityId: UniqueIdentifier;
    timestamp: Timestamp;
    userId: UniqueIdentifier;
    action: 'edited_cell' | 'executed_cell' | 'added_comment' | 'shared_notebook' | 'created_notebook' | 'viewed_notebook' | 'forked_notebook' | 'deployed_app' | 'merged_version';
    notebookId: UniqueIdentifier;
    cellId?: UniqueIdentifier;
    summary: string; // "John Doe executed cell 'Data Prep'"
    detailsUrl?: string; // Link to the specific change or resource
    metadata?: Record<string, any>; // Additional context for the activity
}

/**
 * @interface DependencyGraph
 * Represents the computed dependency graph of a notebook.
 */
export interface DependencyGraph {
    id: UniqueIdentifier;
    notebookId: UniqueIdentifier;
    lastComputedAt: Timestamp;
    nodes: GraphNode[]; // Each node represents a cell or external resource
    edges: GraphEdge[]; // Edges represent dependencies (e.g., cell A uses output of cell B)
    cycleDetected: boolean;
    criticalPath?: UniqueIdentifier[]; // IDs of cells forming the critical execution path
    versionHash?: string; // Hash of the notebook's content when this graph was generated
    stale: boolean; // If notebook content has changed since last graph generation
}

/**
 * @interface PluginManifest
 * Defines a notebook extension or plugin.
 */
export interface PluginManifest {
    id: UniqueIdentifier;
    name: string;
    version: string;
    author: string;
    description: string;
    homepageUrl: string;
    repositoryUrl?: string;
    iconUrl?: string;
    entryPointUrl: string; // URL to the main script/module of the plugin
    supportedCellTypes?: ExpandedCellType[]; // Cell types added or enhanced by this plugin
    permissionsRequired: PluginPermission[]; // Access rights required by the plugin
    configurationSchema?: Record<string, any>; // JSON schema for plugin-specific settings
    isSystemPlugin: boolean;
    installedBy: UniqueIdentifier; // User or system ID
    installedAt: Timestamp;
    isEnabled: boolean;
    targetVersionRange: string; // e.g., '^1.0.0' for host app version
    manifestVersion: string; // Version of the plugin manifest format
    sandboxPolicy?: 'strict' | 'permissive'; // How strictly sandboxed the plugin runs
    dependencies?: { pluginId: UniqueIdentifier; minVersion: string; }[]; // Other plugins it depends on
}

/**
 * @enum {string} PluginPermission
 * Permissions a plugin might request.
 */
export type PluginPermission =
    | 'read_all_notebooks'
    | 'write_all_notebooks'
    | 'execute_code'
    | 'access_user_data'
    | 'make_network_requests'
    | 'create_new_cells'
    | 'delete_cells'
    | 'modify_notebook_settings'
    | 'access_system_secrets'
    | 'access_gcp_resources'
    | 'access_aws_resources'
    | 'access_azure_resources'
    | 'modify_user_preferences'
    | 'send_notifications'
    | 'read_system_logs'
    | 'interact_with_ai_models';

/**
 * @interface PluginConfiguration
 * User or notebook-specific configuration for an installed plugin.
 */
export interface PluginConfiguration {
    pluginId: UniqueIdentifier;
    notebookId?: UniqueIdentifier; // If configured at notebook level
    userId?: UniqueIdentifier; // If configured at user level
    workspaceId?: UniqueIdentifier; // If configured at workspace level
    projectId?: UniqueIdentifier; // If configured at project level
    isEnabled: boolean;
    settings: Record<string, any>; // Key-value pairs matching pluginManifest.configurationSchema
    activatedAt: Timestamp;
    activatedBy: UniqueIdentifier;
}

/**
 * @interface CustomRenderer
 * Allows defining custom rendering logic for specific data types or cell outputs.
 */
export interface CustomRenderer {
    id: UniqueIdentifier;
    name: string;
    mimeType: string; // The MIME type this renderer handles, e.g., 'application/vnd.my-custom-data+json', 'text/csv'
    rendererCode: string; // JavaScript/TypeScript code for rendering (e.g., React component)
    rendererLanguage: 'javascript' | 'typescript' | 'web_component_html';
    stylesheet?: string; // Optional CSS for the renderer
    isEnabled: boolean;
    isDefault: boolean; // If this renderer should be preferred for the mimeType
    createdBy: UniqueIdentifier;
    createdAt: Timestamp;
    visibility: 'private' | 'workspace' | 'public' | 'project';
    exampleData?: DisplayData; // Example data to showcase the renderer
}

/**
 * @interface Workspace
 * A high-level organizational unit, containing projects and notebooks.
 */
export interface Workspace {
    id: UniqueIdentifier;
    name: string;
    description?: string;
    ownerId: UniqueIdentifier;
    members: UniqueIdentifier[]; // User IDs
    projects: UniqueIdentifier[]; // Project IDs within this workspace
    createdAt: Timestamp;
    lastModifiedAt: Timestamp;
    defaultPermissions: ResourcePermissions[]; // Default permissions for new items
    billingAccountId?: UniqueIdentifier; // For associating with cloud billing
    securityPolicyId?: UniqueIdentifier; // Reference to workspace-level security policies
    customThemes: UniqueIdentifier[]; // Custom UI themes
    plugins: UniqueIdentifier[]; // Plugins installed at workspace level
    sharedDataConnectors: UniqueIdentifier[]; // Reusable data connection configurations
    storageQuotaGb?: number; // Storage limit for the workspace
    currentStorageUsageGb?: number;
    labels?: Record<string, string>; // For organizational labeling
    auditLogRetentionDays?: number;
    complianceRegulations?: string[]; // e.g., 'HIPAA', 'GDPR'
    // ... many more workspace-level settings
}

/**
 * @interface Folder
 * An organizational unit within a Project or Workspace for notebooks.
 */
export interface Folder {
    id: UniqueIdentifier;
    name: string;
    description?: string;
    parentId?: UniqueIdentifier; // For nested folders
    workspaceId: UniqueIdentifier;
    projectId?: UniqueIdentifier; // If within a project
    ownerId: UniqueIdentifier;
    notebooks: UniqueIdentifier[]; // IDs of notebooks in this folder
    subfolders: UniqueIdentifier[]; // IDs of subfolders
    createdAt: Timestamp;
    lastModifiedAt: Timestamp;
    permissions: ResourcePermissions[]; // Can override parent permissions
    tags: string[];
}

/**
 * @interface Project
 * An organizational unit within a workspace, grouping related notebooks and resources.
 */
export interface Project {
    id: UniqueIdentifier;
    name: string;
    description?: string;
    workspaceId: UniqueIdentifier;
    ownerId: UniqueIdentifier;
    members: UniqueIdentifier[]; // User IDs who have access
    notebooks: UniqueIdentifier[]; // Notebook IDs belonging to this project
    datasets: UniqueIdentifier[]; // References to external dataset resources
    models: UniqueIdentifier[]; // References to machine learning model resources
    dashboards: UniqueIdentifier[]; // References to aggregate dashboards
    createdAt: Timestamp;
    lastModifiedAt: Timestamp;
    defaultKernelConfigId?: UniqueIdentifier; // Default kernel for new notebooks in project
    defaultEnvironmentConfig: EnvironmentVariable[]; // Default env vars for project
    projectTemplates: UniqueIdentifier[]; // Notebook templates specific to this project
    versionControlIntegration?: VCSIntegrationConfig; // Integration with Git/other VCS
    ciCdPipelines?: UniqueIdentifier[]; // References to CI/CD pipeline definitions
    dataGovernancePolicyId?: UniqueIdentifier; // Reference to data policies
    billingTag?: string; // Tag for cost allocation in cloud billing
    notificationsEnabled: boolean;
    // ... more project-specific settings
}

/**
 * @interface VCSIntegrationConfig
 * Configuration for integrating with external Version Control Systems (VCS).
 */
export interface VCSIntegrationConfig {
    vcsType: 'git' | 'svn' | 'perforce';
    repositoryUrl: string;
    branchName: string;
    authenticationMethod: 'ssh_key' | 'pat_token' | 'oauth_app' | 'none';
    lastSyncTimestamp?: Timestamp;
    autoSyncEnabled: boolean; // Automatically push/pull changes
    ignorePatterns?: string[]; // .gitignore style patterns
    status: 'connected' | 'disconnected' | 'syncing' | 'error';
    syncErrors?: string[];
    syncFrequencyMinutes?: number;
    twoWaySync: boolean; // If changes in VCS also reflect in notebook platform
    webhookSecret?: string; // For incoming webhooks
}

/**
 * @interface AICapability
 * Represents a specific AI model or capability available in the system.
 */
export interface AICapability {
    id: UniqueIdentifier;
    name: string;
    provider: 'google_gemini' | 'openai_gpt' | 'anthropic_claude' | 'huggingface' | 'custom_local' | 'aws_bedrock' | 'azure_openai';
    modelId: string; // e.g., 'gemini-1.5-pro', 'gpt-4o', 'claude-3-opus-20240229'
    description: string;
    capabilities: ('text_generation' | 'code_generation' | 'image_analysis' | 'data_analysis' | 'translation' | 'summarization' | 'embeddings' | 'function_calling' | 'speech_to_text' | 'text_to_speech' | 'video_analysis')[];
    inputCostPerToken?: number; // USD
    outputCostPerToken?: number; // USD
    maxInputTokens: number;
    maxOutputTokens: number;
    isDefault: boolean;
    temperatureRange: [number, number]; // e.g., [0.0, 1.0]
    topKRange?: [number, number];
    topPRange?: [number, number];
    accessControl: 'public' | 'organization' | 'private' | 'project_scoped';
    requiresBilling: boolean;
    status: 'active' | 'deprecated' | 'coming_soon' | 'restricted';
    supportedLanguages?: string[]; // Programming languages for code models
    fineTuningEnabled: boolean; // Can this model be fine-tuned?
    fineTuningCostPerHour?: number;
}

/**
 * @interface PromptTemplate
 * A reusable template for AI prompts.
 */
export interface PromptTemplate {
    id: UniqueIdentifier;
    name: string;
    description: string;
    template: string; // The actual prompt string with placeholders, e.g., "Summarize this: {text}"
    variables: PromptTemplateVariable[];
    createdBy: UniqueIdentifier;
    createdAt: Timestamp;
    lastModifiedAt: Timestamp;
    tags: string[];
    visibility: 'private' | 'project' | 'workspace' | 'public';
    outputFormatHint: 'text' | 'json' | 'markdown' | 'code' | 'image' | 'audio';
    defaultModelId?: UniqueIdentifier; // Suggests a default model for this template
    exampleUsage?: { input: Record<string, any>; output: string; }[];
    version: number;
    revisionHistory?: PromptTemplateRevision[];
}

/**
 * @interface PromptTemplateRevision
 * A historical revision of a prompt template.
 */
export interface PromptTemplateRevision {
    revisionId: UniqueIdentifier;
    version: number;
    template: string;
    variables: PromptTemplateVariable[];
    changedBy: UniqueIdentifier;
    timestamp: Timestamp;
    reasonForChange?: string;
}

/**
 * @interface PromptTemplateVariable
 * Defines a placeholder variable within a prompt template.
 */
export interface PromptTemplateVariable {
    name: string;
    description: string;
    type: 'string' | 'number' | 'boolean' | 'code' | 'markdown' | 'json' | 'list' | 'enum' | 'file_upload';
    defaultValue?: any;
    required: boolean;
    exampleValue?: string;
    maxLength?: number;
    sourceCellIdHint?: UniqueIdentifier; // Suggests linking to a specific cell's output
    options?: { value: any; label: string }[]; // For enum type
}

/**
 * @interface DataConnector
 * Defines a reusable connection to an external data source.
 */
export interface DataConnector {
    id: UniqueIdentifier;
    name: string;
    type: 'bigquery' | 'gcs' | 's3' | 'postgres' | 'mysql' | 'snowflake' | 'redshift' | 'api' | 'mongodb' | 'salesforce' | 'azure_blob' | 'dynamodb' | 'elastic_search' | 'databricks';
    connectionConfig: Record<string, any>; // e.g., host, port, database, credentialsId, region
    description?: string;
    createdBy: UniqueIdentifier;
    createdAt: Timestamp;
    lastModifiedAt: Timestamp;
    sharedWithProjects: UniqueIdentifier[];
    sharedWithWorkspaces: UniqueIdentifier[];
    isEncrypted: boolean; // Indicates if sensitive parts of config are encrypted
    status: 'connected' | 'disconnected' | 'error' | 'pending';
    lastConnectionTestResult?: { timestamp: Timestamp; success: boolean; errorMessage?: string; };
    schemaDiscoveryEnabled: boolean; // Can it automatically discover schemas?
    credentialManagementId?: UniqueIdentifier; // Reference to a Secret management entry
}

/**
 * @interface Secret
 * Represents a sensitive piece of information stored securely.
 */
export interface Secret {
    id: UniqueIdentifier;
    name: string;
    value: string; // Encrypted string, usually stored in a secure vault service
    type: 'api_key' | 'database_credential' | 'oauth_token' | 'ssh_key' | 'password' | 'client_secret' | 'jwt_token';
    createdBy: UniqueIdentifier;
    createdAt: Timestamp;
    lastModifiedAt: Timestamp;
    ownerId: UniqueIdentifier; // User or Service Account ID
    accessControl: ResourcePermissions[]; // Who can access this secret
    expiresAt?: Timestamp;
    description?: string;
    tags: string[];
    vaultServiceId?: string; // Reference to an external vault service (e.g., GCP Secret Manager, HashiCorp Vault)
    version?: number; // For secret versioning
}

/**
 * @interface SystemHealthMetrics
 * Global system health and performance indicators.
 */
export interface SystemHealthMetrics {
    timestamp: Timestamp;
    cpuLoadAverage: number[]; // e.g., [1min, 5min, 15min]
    memoryUsageGb: { total: number; used: number; free: number; };
    diskUsageGb: { total: number; used: number; free: number; };
    networkIOKbps: { received: number; sent: number; };
    activeUsers: number;
    activeNotebooks: number;
    runningKernels: number;
    queuedExecutions: number;
    apiLatencyMs: number;
    errorRatePercent: number;
    workerNodeCount: number;
    containerCount: number;
    // ... more detailed metrics for different services
}

/**
 * @interface FeatureFlag
 * Configuration for enabling/disabling features dynamically.
 */
export interface FeatureFlag {
    id: UniqueIdentifier;
    name: string;
    description: string;
    isEnabled: boolean; // Global ON/OFF switch
    targetingRules?: FeatureFlagTargetingRule[]; // For conditional enablement
    rolloutPercentage: number; // For gradual rollout (0-100)
    variant?: string; // For A/B testing
    createdBy: UniqueIdentifier;
    createdAt: Timestamp;
    lastModifiedAt: Timestamp;
    defaultValue: boolean | string; // Default value if no rules match
    environmentScope: 'development' | 'staging' | 'production'; // For environment-specific flags
}

/**
 * @interface FeatureFlagTargetingRule
 * Rule to determine if a feature flag is enabled for a specific user/group/context.
 */
export interface FeatureFlagTargetingRule {
    targetType: 'user_id' | 'user_role' | 'organization_id' | 'project_id' | 'workspace_id' | 'geo_location' | 'browser_type' | 'random_percentage' | 'ip_address' | 'feature_flag_status';
    operator: 'in' | 'not_in' | 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'regex_match';
    value: string[] | string | number | boolean;
    // Logical operators for complex rules
    logicOperator?: 'AND' | 'OR';
    nestedRules?: FeatureFlagTargetingRule[];
}

/**
 * @interface ThemeDefinition
 * Defines a custom UI theme for the application.
 */
export interface ThemeDefinition {
    id: UniqueIdentifier;
    name: string;
    type: 'light' | 'dark' | 'hybrid'; // Hybrid for themes with mixed light/dark elements
    colors: Record<string, string>; // CSS variable names to color values, e.g., { '--primary-color': '#4285F4' }
    fonts: Record<string, string>; // Font family definitions (e.g., { 'body-font': 'Roboto, sans-serif' })
    typographyScale: Record<string, string>; // e.g., { 'h1-size': '2.5rem', 'p-line-height': '1.5' }
    componentStyles?: Record<string, any>; // Specific styles for components (e.g., button primary background)
    isDefault: boolean;
    createdBy: UniqueIdentifier;
    createdAt: Timestamp;
    visibility: 'private' | 'workspace' | 'public' | 'project';
    stylesheetUrl?: string; // URL to an external CSS file for the theme
}

/**
 * @interface KeyboardShortcutPreset
 * Defines a collection of custom keyboard shortcuts.
 */
export interface KeyboardShortcutPreset {
    id: UniqueIdentifier;
    name: string;
    description: string;
    shortcuts: KeyboardShortcut[];
    isDefault: boolean;
    createdBy: UniqueIdentifier;
    createdAt: Timestamp;
    visibility: 'private' | 'workspace' | 'public' | 'project';
    basePresetId?: UniqueIdentifier; // Can extend a default or another custom preset
}

/**
 * @interface KeyboardShortcut
 * A single keyboard shortcut definition.
 */
export interface KeyboardShortcut {
    actionId: string; // Internal ID of the action, e.g., 'cell.execute', 'notebook.save', 'ai.generate_code'
    keys: string[]; // e.g., ['Control', 'Enter'], ['Shift', 'Alt', 'S']. Use canonical names.
    description: string;
    context: 'global' | 'editor' | 'viewer' | 'terminal' | 'modal' | 'markdown_preview'; // Context where shortcut is active
    preventDefault: boolean; // Prevent browser default action
}

/**
 * @interface DataCatalogEntry
 * An entry in a centralized data catalog, describing available datasets.
 */
export interface DataCatalogEntry {
    id: UniqueIdentifier;
    name: string;
    description: string;
    ownerId: UniqueIdentifier;
    sourceConfig: DataSourceConfig; // How to access this dataset
    schema: DataSchema;
    tags: string[];
    accessPolicy: ResourcePermissions[];
    lastUpdated: Timestamp;
    updateFrequency: 'daily' | 'hourly' | 'weekly' | 'manual' | 'realtime';
    sampleDataUrl?: string;
    documentationUrl?: string;
    qualityMetrics?: DataQualityMetrics;
    costEstimatePerQuery?: number; // For billable datasets
    dataStewardId?: UniqueIdentifier; // Person responsible for the data
    privacyLevel: 'public' | 'confidential' | 'restricted' | 'pii_sensitive';
    glossaryTerms?: string[]; // Links to business glossary terms
    lineageGraphId?: UniqueIdentifier; // Reference to data lineage graph
}

/**
 * @interface DataQualityMetrics
 * Metrics describing the quality of a dataset.
 */
export interface DataQualityMetrics {
    completenessScore: number; // 0-1
    accuracyScore: number;
    freshnessLastUpdated: Timestamp;
    consistencyScore: number;
    rowCounts: number;
    columnCounts: number;
    nullValueRatioPerColumn: Record<string, number>;
    duplicatesDetected: boolean;
    outliersDetected: boolean;
    profileReportUrl?: string; // Link to a detailed data profile report
    lastRunTimestamp: Timestamp;
    status: 'pass' | 'fail' | 'warning';
    // ... more detailed metrics
}

/**
 * @interface AIModelCatalogEntry
 * An entry in a centralized AI model catalog.
 */
export interface AIModelCatalogEntry {
    id: UniqueIdentifier;
    name: string;
    description: string;
    ownerId: UniqueIdentifier; // User or team that deployed the model
    modelVersion: string;
    framework: 'tensorflow' | 'pytorch' | 'scikit-learn' | 'jax' | 'huggingface' | 'openai' | 'gemini' | 'mlflow' | 'onnx';
    modelType: 'llm' | 'computer_vision' | 'nlp' | 'tabular' | 'time_series' | 'reinforcement_learning' | 'graph_neural_network';
    inputSchema: DataSchema;
    outputSchema: DataSchema;
    performanceMetrics: ModelPerformanceMetrics;
    trainingDataMetadata?: DataSourceConfig; // Reference to training data
    deploymentEndpoint: string; // URL to the deployed model API
    accessPolicy: ResourcePermissions[];
    costPerPrediction?: number;
    license?: string; // e.g., 'MIT', 'Apache-2.0', 'Proprietary'
    tags: string[];
    documentationUrl?: string;
    exampleUsage?: string; // Code snippet for how to use
    lastUpdated: Timestamp;
    status: 'production' | 'staging' | 'experimental' | 'deprecated';
    biasDetectionMetrics?: AIBiasMetrics;
    explainabilityReports?: string[]; // URLs to explainability reports (e.g., SHAP, LIME)
}

/**
 * @interface ModelPerformanceMetrics
 * Metrics describing the performance of an AI/ML model.
 */
export interface ModelPerformanceMetrics {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    rocAuc?: number;
    rmse?: number; // For regression models
    mae?: number; // For regression models
    latencyMs?: number; // Average inference latency
    throughputQps?: number; // Queries per second
    cpuUsagePercent?: number;
    gpuUsagePercent?: number;
    memoryUsageGb?: number;
    evaluationDatasetId?: UniqueIdentifier; // Which dataset was used for evaluation
    lastEvaluatedAt: Timestamp;
    metricTimestamp: Timestamp; // When these metrics were captured
    modelSizeMb?: number;
}

/**
 * @interface AIBiasMetrics
 * Metrics specifically for evaluating fairness and bias in AI models.
 */
export interface AIBiasMetrics {
    demographicParity?: Record<string, number>; // e.g., accuracy differences across demographic groups
    equalOpportunity?: Record<string, number>;
    disparateImpactRatio?: Record<string, number>;
    fairnessReportUrl?: string; // Link to a detailed fairness report
    sensitiveAttributesUsed?: string[]; // Attributes identified as sensitive
}

/**
 * @interface Experiment
 * Represents an ML experiment tracking run.
 */
export interface Experiment {
    id: UniqueIdentifier;
    name: string;
    description?: string;
    projectId: UniqueIdentifier;
    createdBy: UniqueIdentifier;
    createdAt: Timestamp;
    runs: UniqueIdentifier[]; // References to ExperimentRun objects
    tags: string[];
    status: 'active' | 'archived' | 'completed' | 'paused';
    metricsGoal: 'maximize' | 'minimize'; // e.g., maximize 'accuracy', minimize 'loss'
    primaryMetric: string; // e.g., 'validation_accuracy', 'test_f1_score'
    parametersSchema?: DataSchema; // Schema for experiment parameters
    objective?: string; // High-level objective of the experiment
}

/**
 * @interface ExperimentRun
 * A single execution of an ML experiment.
 */
export interface ExperimentRun {
    id: UniqueIdentifier;
    experimentId: UniqueIdentifier;
    notebookId: UniqueIdentifier; // The notebook that ran this experiment
    startedAt: Timestamp;
    finishedAt?: Timestamp;
    createdBy: UniqueIdentifier;
    parameters: Record<string, any>; // Hyperparameters used
    metrics: Record<string, number>; // Results like accuracy, loss, F1 score
    artifacts: ArtifactReference[]; // References to saved models, plots, logs
    status: 'running' | 'completed' | 'failed' | 'cancelled' | 'queued';
    durationSeconds: number;
    gitCommitHash?: string; // Git commit if integrated with VCS
    containerImageUsed?: string;
    resourceConsumption?: ExecutionResourceUsage;
    parentRunId?: UniqueIdentifier; // For nested runs (e.g., hyperparameter tuning sweeps)
    childRunIds?: UniqueIdentifier[];
    modelId?: UniqueIdentifier; // Reference to the trained model artifact
    codeSnapshotId?: UniqueIdentifier; // Reference to a snapshot of the code used
    notes?: string;
}

/**
 * @interface ArtifactReference
 * A reference to an output file or artifact generated during a run.
 */
export interface ArtifactReference {
    id: UniqueIdentifier;
    name: string;
    type: 'model' | 'plot' | 'data' | 'log' | 'report' | 'checkpoint' | 'tensorboard_log' | 'other';
    url: string; // URL to storage location (GCS, S3, etc.)
    mimeType?: string;
    sizeBytes?: number;
    checksum?: string; // For integrity verification (e.g., MD5, SHA256)
    generatedByCellId?: UniqueIdentifier; // Which cell generated it
    generatedByRunId?: UniqueIdentifier; // Which experiment run generated it
    createdAt: Timestamp;
    createdBy: UniqueIdentifier;
    version?: string; // For model artifacts
    metadata?: Record<string, any>; // Additional artifact-specific metadata
}

/**
 * @interface Workflow
 * Defines a sequence of notebook executions or other actions.
 */
export interface Workflow {
    id: UniqueIdentifier;
    name: string;
    description?: string;
    projectId: UniqueIdentifier;
    createdBy: UniqueIdentifier;
    createdAt: Timestamp;
    lastModifiedAt: Timestamp;
    trigger: WorkflowTrigger; // How the workflow starts
    steps: WorkflowStep[];
    status: 'active' | 'inactive' | 'draft' | 'suspended';
    lastRunStatus?: 'success' | 'failure' | 'running' | 'cancelled';
    lastRunTimestamp?: Timestamp;
    notificationRecipients: UniqueIdentifier[];
    maxConcurrentRuns: number;
    retryPolicy: RetryPolicy;
    executionHistory: UniqueIdentifier[]; // References to WorkflowRun objects
    diagramUrl?: string; // URL to a visual representation of the workflow
}

/**
 * @interface WorkflowTrigger
 * Defines how a workflow is initiated.
 */
export interface WorkflowTrigger {
    type: 'manual' | 'schedule' | 'webhook' | 'data_event' | 'git_commit' | 'api_call' | 'file_upload';
    config: Record<string, any>; // e.g., cron expression, webhook URL, GCS bucket event, API endpoint path
    isEnabled: boolean;
    description?: string;
}

/**
 * @interface WorkflowStep
 * A single step in a workflow.
 */
export interface WorkflowStep {
    id: UniqueIdentifier;
    name: string;
    description?: string;
    stepType: 'execute_notebook' | 'call_api' | 'run_script' | 'send_notification' | 'wait_for_event' | 'conditional_branch' | 'update_dataset' | 'deploy_model' | 'run_container_job' | 'execute_sql';
    config: Record<string, any>; // e.g., notebookId, API endpoint, script content, container image, SQL query
    dependsOn?: UniqueIdentifier[]; // Other step IDs this step depends on (for DAGs)
    onFailureAction: 'continue' | 'fail_workflow' | 'retry' | 'run_fallback_step';
    maxRetries?: number;
    timeoutSeconds?: number;
    outputMapping?: Record<string, string>; // Map step outputs to workflow variables
    inputMapping?: Record<string, string>; // Map workflow variables to step inputs
    fallbackStepId?: UniqueIdentifier; // Step to run on failure if 'run_fallback_step'
}

/**
 * @interface WorkflowRun
 * An instance of a workflow execution.
 */
export interface WorkflowRun {
    id: UniqueIdentifier;
    workflowId: UniqueIdentifier;
    startedAt: Timestamp;
    finishedAt?: Timestamp;
    triggeredBy: UniqueIdentifier; // User or system
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    stepRuns: WorkflowStepRun[]; // Details for each step
    logsUrl?: string; // Link to aggregated logs
    durationSeconds: number;
    errorMessage?: string; // If workflow failed
    outputValues?: Record<string, any>; // Final output values of the workflow
}

/**
 * @interface WorkflowStepRun
 * An instance of a single step within a workflow run.
 */
export interface WorkflowStepRun {
    id: UniqueIdentifier;
    workflowRunId: UniqueIdentifier;
    stepId: UniqueIdentifier; // Reference to the WorkflowStep definition
    startedAt: Timestamp;
    finishedAt?: Timestamp;
    status: 'running' | 'completed' | 'failed' | 'skipped' | 'retrying';
    logs?: OutputBlock[];
    errorMessage?: string;
    output?: Record<string, any>; // Outputs produced by this step
    retriesAttempted: number;
    linkedExecutionId?: UniqueIdentifier; // e.g., notebook execution ID, container job ID
}

/**
 * @interface SystemDashboard
 * A high-level dashboard displaying aggregated metrics and status.
 */
export interface SystemDashboard {
    id: UniqueIdentifier;
    name: string;
    description?: string;
    panels: DashboardPanel[];
    layoutConfig: DashboardLayoutConfig; // Reuse for general layout
    accessPolicy: ResourcePermissions[];
    refreshIntervalSeconds: number;
    ownerId: UniqueIdentifier;
    createdAt: Timestamp;
    lastModifiedAt: Timestamp;
    tags: string[];
    isPublic: boolean;
}

/**
 * @interface DashboardPanel
 * A single widget or display component within a system dashboard.
 */
export interface DashboardPanel {
    id: UniqueIdentifier;
    title: string;
    panelType: 'metric_chart' | 'table' | 'text' | 'image' | 'notebook_embed' | 'ai_summary' | 'status_indicator' | 'activity_feed' | 'markdown_renderer' | 'custom_widget' | 'html_embed';
    sourceConfig: DashboardPanelSourceConfig;
    displayConfig: Record<string, any>; // Chart type, table columns, text editor, image URL, markdown content
    refreshIntervalSeconds?: number;
    description?: string;
    linkedAction?: FormAction; // Action triggered by clicking on the panel
    colorPalette?: string;
    filterOptions?: Record<string, any>; // Filters applied to data source
}

/**
 * @interface DashboardPanelSourceConfig
 * Configuration for where a dashboard panel gets its data.
 */
export interface DashboardPanelSourceConfig {
    sourceType: 'notebook_output' | 'data_connector' | 'metric_service_api' | 'ai_model_metrics' | 'system_health' | 'workflow_run_metrics' | 'static_content' | 'external_url';
    targetId?: UniqueIdentifier; // Notebook ID, DataConnector ID, Metric service endpoint
    query?: string; // e.g., SQL query, GraphQL query, specific metric name, API path
    dataTransformation?: OutputTransformationConfig;
    parameters?: Record<string, any>; // Parameters for the query/API call
}

// ----------------------------------------------------------------------------------------------------
// AI-SPECIFIC CORE TYPES
// ----------------------------------------------------------------------------------------------------

/**
 * @interface AIModel
 * Represents a configured AI model that can be called by cells.
 */
export interface AIModel {
    id: UniqueIdentifier;
    name: string;
    provider: 'google' | 'openai' | 'anthropic' | 'huggingface' | 'custom' | 'aws' | 'azure';
    modelName: string; // e.g., 'gemini-1.5-pro', 'gpt-4o', 'claude-3-opus'
    description: string;
    apiVersion: string;
    endpoint: string; // API endpoint URL
    authentication: 'api_key' | 'oauth' | 'none' | 'gcp_service_account' | 'aws_iam_role';
    credentialsId?: UniqueIdentifier; // Reference to a Secret
    parameters: AIModelParameters;
    capabilities: ('text_generation' | 'code_generation' | 'image_analysis' | 'embedding' | 'function_calling' | 'multimodal' | 'speech_to_text' | 'text_to_speech' | 'video_analysis')[];
    inputSchema?: DataSchema;
    outputSchema?: DataSchema;
    rateLimitPerMinute?: number;
    costPerTokenInput?: number; // USD
    costPerTokenOutput?: number; // USD
    lastCheckedStatus: 'active' | 'inactive' | 'error' | 'throttled';
    lastCheckedTimestamp: Timestamp;
    tags: string[];
    supportedTools?: AIToolDefinition[]; // Tools this model can call
    safetySettings?: AISafetySetting[]; // Default safety settings for the model
    latencySLA?: number; // Expected average latency in ms
    privacyPolicyUrl?: string;
    fineTuneOptions?: Record<string, any>; // Configuration options for fine-tuning
}

/**
 * @interface AIModelParameters
 * Default and configurable parameters for an AI model.
 */
export interface AIModelParameters {
    temperature: number; // 0.0 to 1.0
    maxOutputTokens: number;
    topP?: number;
    topK?: number;
    stopSequences?: string[];
    seed?: number; // For reproducible outputs
    presencePenalty?: number;
    frequencyPenalty?: number;
    customParameters?: Record<string, any>; // Provider-specific parameters
    responseFormat?: 'text' | 'json'; // Explicitly request JSON mode
    toolChoice?: 'auto' | 'none' | 'required' | { type: 'function'; function: { name: string; }; }; // How the model should use tools
}

/**
 * @interface AISafetySetting
 * Specific safety configuration for AI models.
 */
export interface AISafetySetting {
    category: 'HARM_CATEGORY_HATE_SPEECH' | 'HARM_CATEGORY_SEXUALLY_EXPLICIT' | 'HARM_CATEGORY_HARASSMENT' | 'HARM_CATEGORY_DANGEROUS_CONTENT' | 'HARM_CATEGORY_MEDICAL_ADVICE' | 'HARM_CATEGORY_FINANCIAL_ADVICE';
    threshold: 'BLOCK_NONE' | 'BLOCK_LOW_AND_ABOVE' | 'BLOCK_MEDIUM_AND_ABOVE' | 'BLOCK_HIGH_AND_ABOVE';
}

/**
 * @interface AIToolDefinition
 * Defines a function or API that an AI model can call.
 */
export interface AIToolDefinition {
    id: UniqueIdentifier;
    name: string; // Function name as called by the model
    displayName: string; // User-friendly name
    description: string;
    parametersSchema: DataSchema; // JSON Schema for the function's input parameters
    codeImplementation?: string; // If the tool is a notebook function/cell, the actual code
    endpointUrl?: string; // If the tool is an external API
    authenticationRequired: boolean;
    secretId?: UniqueIdentifier; // Reference to API key or credentials
    visibility: 'private' | 'project' | 'workspace' | 'public';
    createdBy: UniqueIdentifier;
    createdAt: Timestamp;
    lastModifiedAt: Timestamp;
    language?: string; // e.g., 'python', 'javascript' for codeImplementation
    timeoutSeconds?: number;
    rateLimitPerMinute?: number; // Rate limit for calling this tool
}

// ----------------------------------------------------------------------------------------------------
// Global Export Type Union
// ----------------------------------------------------------------------------------------------------

/**
 * @type {AnyNotebookComponent}
 * A union type representing any major component or configuration type in the Scholar's Grammar system.
 * This is useful for generic handlers, storage, or APIs.
 */
export type AnyNotebookComponent =
    AnyCell
    | Notebook
    | UserProfile
    | UserPreferences
    | NotificationSettings
    | AccessibilitySettings
    | ResourcePermissions
    | SharedLinkSettings
    | BaseCell
    | CodeCell
    | MarkdownCell
    | DataCell
    | ChartCell
    | MediaCell
    | DiagramCell
    | FormCell
    | AICell
    | KnowledgeGraphCell
    | SimulationCell
    | WebComponentCell
    | LinkCell
    | QuestionCell
    | AnnotationCell
    | PluginCell
    | OutputDisplayCell
    | InteractiveAppCell
    | LiveCodeCell
    | TestCaseCell
    | SystemInfoCell
    | CodeSnippetCell
    | EquationCell
    | EmbedExternalCell
    | CellMetadata
    | CodeLintingError
    | CellEnvironment
    | PackageDependency
    | ExecutionResult
    | OutputBlock
    | DisplayData
    | ExportOption
    | ExecutionError
    | ExecutionWarning
    | LogMessage
    | ExecutionResourceUsage
    | RuntimeEnvironmentSnapshot
    | CellVersionMetadata
    | CellVersion
    | CellDependency
    | DataSchema
    | DataSourceConfig
    | DataTransformationStep
    | ChartConfiguration
    | ChartExportSettings
    | FormFieldDefinition
    | FormFieldCondition
    | FormAction
    | AIResponse
    | AISafetyAttributes
    | AIToolCall
    | AICostEstimate
    | AIEvaluationMetrics
    | AIResponseFeedback
    | KnowledgeGraphData
    | GraphNode
    | GraphEdge
    | SimulationParameter
    | SimulationMetric
    | SimulationControl
    | WebComponentEventBinding
    | QuestionOption
    | QuestionResponse
    | OutputTransformationConfig
    | AppDeploymentConfig
    | AppDeploymentVersion
    | DashboardLayoutConfig
    | DashboardInteractionHandler
    | TestResult
    | TestCaseDetail
    | CodeGuardrailConfig
    | ResourceAllocationConfig
    | RunCondition
    | NotebookMetadata
    | Citation
    | NotebookVersionControl
    | NotebookVersionMetadata
    | KernelConfiguration
    | NetworkAccessRule
    | ComputeProfile
    | EnvironmentVariable
    | SchedulerConfig
    | RetryPolicy
    | ScheduledAction
    | NotebookReviewProcess
    | ApprovalRecord
    | AICopilotSettings
    | AIInsight
    | AIActionableItem
    | AuditLogEntry
    | DiscussionThread
    | Comment
    | CommentReaction
    | LiveUserPresence
    | ActivityLogEntry
    | DependencyGraph
    | PluginManifest
    | PluginConfiguration
    | CustomRenderer
    | Workspace
    | Folder
    | Project
    | VCSIntegrationConfig
    | AICapability
    | PromptTemplate
    | PromptTemplateRevision
    | PromptTemplateVariable
    | DataConnector
    | Secret
    | SystemHealthMetrics
    | FeatureFlag
    | FeatureFlagTargetingRule
    | ThemeDefinition
    | KeyboardShortcutPreset
    | KeyboardShortcut
    | DataCatalogEntry
    | DataQualityMetrics
    | AIModelCatalogEntry
    | ModelPerformanceMetrics
    | AIBiasMetrics
    | Experiment
    | ExperimentRun
    | ArtifactReference
    | Workflow
    | WorkflowTrigger
    | WorkflowStep
    | WorkflowRun
    | WorkflowStepRun
    | SystemDashboard
    | DashboardPanel
    | DashboardPanelSourceConfig
    | AIModel
    | AIModelParameters
    | AISafetySetting
    | AIToolDefinition;