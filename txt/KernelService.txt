// google/notebook/services/KernelService.ts
// The Engine of Discovery. The service that interprets and runs the scholar's incantations.

// --- Core Data Structures & Interfaces (Universe Foundation) ---

/**
 * Represents a unique identifier for any resource in the system.
 */
export type UUID = string;

/**
 * Defines various types of kernel environments available.
 */
export enum KernelEnvironmentType {
    Python3 = 'python3',
    R = 'r',
    Julia = 'julia',
    NodeJS = 'nodejs',
    Go = 'go',
    Java = 'java',
    SQL = 'sql',
    Bash = 'bash',
    AIModel = 'aimodel', // For direct interaction with AI models
    Custom = 'custom',
    Quantum = 'quantum', // For quantum computing simulators/hardware
    GPUCompute = 'gpucompute', // For dedicated GPU workloads
    TPUCompute = 'tpucompute', // For dedicated TPU workloads
    WebAssembly = 'wasm', // For client-side or server-side WebAssembly execution
}

/**
 * Status of a kernel session.
 */
export enum KernelStatus {
    Starting = 'starting',
    Running = 'running',
    Idle = 'idle',
    Busy = 'busy',
    Restarting = 'restarting',
    ShuttingDown = 'shutting_down',
    Dead = 'dead',
    Error = 'error',
    Provisioning = 'provisioning',
    Decommissioning = 'decommissioning',
}

/**
 * Represents a single output message from the kernel.
 */
export interface OutputMessage {
    type: 'stream' | 'display_data' | 'execute_result' | 'error' | 'status' | 'clear_output' | 'update_display_data' | 'log' | 'metric' | 'trace';
    content: any; // Can be string, JSON, base64 encoded data, etc.
    metadata?: Record<string, any>; // MIME types, dimensions, timing, custom rendering hints
    timestamp: Date;
    cellId?: UUID; // The cell this output belongs to
    outputId?: UUID; // Unique ID for this specific output message instance
    parentId?: UUID; // For updated_display_data, refers to the original output
}

/**
 * Details about a kernel session.
 */
export interface KernelSession {
    id: UUID;
    notebookId: UUID; // ID of the notebook this session is associated with
    userId: UUID; // User who initiated the session
    environment: KernelEnvironmentType;
    status: KernelStatus;
    connectedClients: UUID[]; // User IDs or client IDs connected to this session
    startTime: Date;
    lastActivity: Date;
    resourceUsage?: {
        cpuPercent: number;
        memoryBytes: number;
        networkBytesIn: number;
        networkBytesOut: number;
        gpuMemoryBytes?: number;
        tpuUsageUnits?: number;
    };
    kernelSpec: KernelSpec; // The specification of the kernel being used
    securityContextId?: UUID; // Reference to a security context for sandboxing
    autoShutdownConfig?: {
        idleTimeoutMinutes: number;
        shutdownSchedule?: string; // e.g., "every_night_at_2am"
    };
    environmentConfigId?: UUID; // Link to a managed environment config
}

/**
 * Defines a kernel's capabilities and configuration.
 */
export interface KernelSpec {
    name: string;
    displayName: string;
    language: string;
    environmentType: KernelEnvironmentType;
    argv: string[]; // Command line arguments for the kernel process
    resources: {
        cpuCores?: number;
        memoryGB?: number;
        gpuCount?: number;
        tpuCount?: number;
        customHardware?: Record<string, any>;
    };
    dependencies?: string[]; // E.g., Python packages, R libraries
    customEnvVars?: Record<string, string>;
    containerImage?: string; // For containerized kernels
    supportsDebugging: boolean;
    supportsInterrupt: boolean;
    richOutputMimeTypes: string[]; // List of MIME types this kernel can produce
    description?: string;
    tags?: string[];
    version?: string;
    isolationLevel?: 'none' | 'container' | 'vm';
}

/**
 * Options for executing code.
 */
export interface ExecuteOptions {
    sessionId?: UUID;
    cellId?: UUID;
    timeoutMs?: number;
    storeHistory?: boolean;
    allowInput?: boolean; // Whether the kernel can request input during execution
    richOutput?: boolean; // Request rich output formats if available
    metadata?: Record<string, any>; // Arbitrary metadata to pass to the kernel
    resourceLimits?: {
        cpuShare?: number; // E.g., 0.5 for 50% of one core
        memoryLimitMB?: number;
        wallTimeLimitSeconds?: number; // Total real-world time for execution
        maxOutputBytes?: number; // Limit the size of combined output
    };
    outputStreamHandler?: (message: OutputMessage) => void; // For real-time streamed output
    onCompletion?: (result: ExecutionResult) => void; // Callback when execution finishes
    debugMode?: boolean; // Enable debugging features if supported by kernel
    priority?: 'low' | 'medium' | 'high' | 'critical'; // Execution priority
    executionMode?: 'sync' | 'async' | 'batch'; // How the execution is scheduled
}

/**
 * Result of an execution request.
 */
export interface ExecutionResult {
    executionId: UUID;
    status: 'success' | 'error' | 'timeout' | 'interrupted' | 'cancelled' | 'pending' | 'running';
    outputs: OutputMessage[];
    durationMs: number;
    stdout?: string; // Consolidated text stdout
    stderr?: string; // Consolidated text stderr
    returnValue?: any; // The last expression's value (if captured)
    errorDetails?: {
        name: string;
        message: string;
        stacktrace: string[];
        errorCode?: string; // Custom error code
        severity?: 'error' | 'warning' | 'info';
    };
    metrics?: {
        cpuTimeMs: number;
        memoryPeakMB: number;
        networkBytesSent: number;
        networkBytesReceived: number;
        gpuTimeMs?: number;
        tpuTimeMs?: number;
        diskIOBytes?: number;
    };
    warnings?: string[];
    artifacts?: { // References to generated files/models/data
        type: 'file' | 'model' | 'dataset' | 'visualization';
        name: string;
        uri: string;
        metadata?: Record<string, any>;
    }[];
}

/**
 * Represents a saved computational graph or workflow.
 */
export interface ComputationalGraph {
    id: UUID;
    name: string;
    description?: string;
    nodes: Array<{
        id: UUID;
        type: string; // e.g., 'code_cell', 'data_source', 'model_training', 'decision_point', 'sub_graph'
        config: Record<string, any>;
        code?: string;
        kernelSpec?: KernelSpec; // For code_cell nodes
        inputMapping?: Record<string, string>; // How graph inputs map to node inputs
        outputMapping?: Record<string, string>; // How node outputs map to graph outputs
        position?: { x: number; y: number; }; // For visual layout
        status?: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'; // Runtime status
        lastRunResult?: ExecutionResult; // Result of the last execution of this node
    }>;
    edges: Array<{
        id: UUID;
        source: UUID;
        target: UUID;
        sourcePort?: string; // Name of output port on source node
        targetPort?: string; // Name of input port on target node
        condition?: string; // For conditional edges (e.g., 'if success')
    }>;
    metadata?: Record<string, any>; // Tags, author, etc.
    version: number;
    createdBy: UUID;
    createdAt: Date;
    lastModifiedBy: UUID;
    lastModifiedAt: Date;
    schedule?: { // For scheduled workflow execution
        cronTab: string;
        timezone: string;
        lastScheduledRun?: Date;
        nextScheduledRun?: Date;
    };
}

/**
 * Represents a request for AI-powered code assistance.
 */
export interface AICodeAssistanceRequest {
    type: 'generate_code' | 'refactor_code' | 'explain_code' | 'debug_code' | 'optimize_code' | 'natural_language_to_code' | 'data_insight' | 'chart_suggestion' | 'error_resolution';
    context: string; // The surrounding code, markdown, or error message
    selection?: { start: number; end: number; code: string }; // User's specific selection
    prompt?: string; // User-provided natural language prompt
    preferredLanguage?: KernelEnvironmentType;
    sessionId?: UUID; // Contextual session
    notebookId?: UUID; // Contextual notebook
    cellId?: UUID; // Contextual cell
    additionalData?: Record<string, any>; // E.g., data schema for SQL generation, previous cell outputs
    targetOutputFormat?: 'code' | 'markdown' | 'json' | 'natural_language';
}

/**
 * Represents the response from an AI code assistance request.
 */
export interface AICodeAssistanceResponse {
    id: UUID;
    status: 'pending' | 'completed' | 'failed' | 'interrupted';
    suggestedCode?: string;
    explanation?: string;
    refactoringSuggestions?: { original: string; suggested: string; reason: string; impact?: string }[];
    debugSuggestions?: { line: number; suggestion: string; severity: 'hint' | 'warning' | 'error' }[];
    optimizedCode?: string;
    dataInsights?: { insight: string; confidence: number; visualizationHint?: string; relatedData?: Record<string, any> }[];
    chartSuggestions?: { type: string; dataColumns: string[]; rationale: string; previewImage?: string }[];
    errorResolutionSteps?: { step: number; description: string; codeFix?: string }[];
    confidenceScore?: number; // How confident the AI is in its suggestion
    modelUsed?: string;
    costEstimate?: { currency: string; amount: number; unit: string };
    error?: string;
    timestamp: Date;
    rawResponse?: Record<string, any>; // For advanced debugging/inspection
}

/**
 * Represents a data source configuration.
 */
export interface DataSourceConfiguration {
    id: UUID;
    name: string;
    type: 'database' | 'file_system' | 'cloud_storage' | 'api' | 'streaming' | 'data_warehouse' | 'vector_database';
    connectionString: string; // Or base URL, path, etc.
    credentialsId?: UUID; // Reference to a secure credential store entry
    schemaMapping?: Record<string, any>; // For complex data sources, defines how raw data maps to logical schema
    accessRules?: Record<string, any>; // Permissions, policies
    readOnly?: boolean;
    description?: string;
    tags?: string[];
    healthStatus?: 'healthy' | 'unhealthy' | 'unknown';
    lastHealthCheck?: Date;
}

/**
 * Represents a data ingress/egress job.
 */
export interface DataTransferJob {
    id: UUID;
    source: { type: 'local' | 'datasource'; id?: UUID; path?: string; query?: string; format?: string; };
    destination: { type: 'local' | 'datasource'; id?: UUID; path?: string; format?: string; };
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    progress: number; // 0-100
    startTime: Date;
    endTime?: Date;
    errorMessage?: string;
    metadata?: Record<string, any>;
    transferredBytes?: number;
    estimatedTotalBytes?: number;
}

/**
 * Represents an observable metric or event.
 */
export interface TelemetryEvent {
    id: UUID;
    type: 'execution_start' | 'execution_end' | 'kernel_status_change' | 'error' | 'resource_usage' | 'user_action' | 'system_event' | 'security_alert' | 'data_transfer_status' | 'workflow_status';
    timestamp: Date;
    sessionId?: UUID;
    userId?: UUID;
    notebookId?: UUID;
    cellId?: UUID;
    data: Record<string, any>; // Event-specific data
    severity?: 'info' | 'warning' | 'error' | 'critical';
    traceId?: UUID; // For distributed tracing
}

/**
 * Configuration for a distributed compute cluster.
 */
export interface ClusterConfiguration {
    id: UUID;
    name: string;
    type: 'spark' | 'dask' | 'ray' | 'kubernetes' | 'dataflow' | 'dataproc' | 'eks' | 'gke';
    config: Record<string, any>; // Specific cluster configuration (e.g., number of workers, instance types, auto-scaling)
    status: 'provisioning' | 'running' | 'stopped' | 'failed' | 'scaling' | 'decommissioning';
    endpoint?: string;
    createdBy: UUID;
    createdAt: Date;
    lastModifiedAt: Date;
    associatedNotebooks?: UUID[]; // Notebooks currently using this cluster
    autoShutdownPolicy?: { idleTimeoutMinutes: number; };
}

/**
 * Represents a code snippet or utility managed by the user.
 */
export interface UserSnippet {
    id: UUID;
    name: string;
    description: string;
    code: string;
    language: KernelEnvironmentType;
    tags: string[];
    createdBy: UUID;
    createdAt: Date;
    lastUsed: Date;
    usageCount: number;
    visibility: 'private' | 'public' | 'shared';
    sharingPermissions?: Record<UUID, 'read' | 'write'>;
    versionHistory?: { timestamp: Date; code: string; message?: string }[];
}

/**
 * Represents a compiled or deployed application or dashboard.
 */
export interface DeployedApplication {
    id: UUID;
    name: string;
    description?: string;
    sourceNotebookId: UUID;
    type: 'dashboard' | 'api' | 'web_app' | 'scheduled_report';
    deploymentUrl: string;
    status: 'deploying' | 'deployed' | 'failed' | 'updating' | 'stopped';
    createdBy: UUID;
    createdAt: Date;
    lastUpdated: Date;
    runtimeConfig?: Record<string, any>; // E.g., required environment variables, resource limits
    accessPolicy?: 'public' | 'private' | 'shared_org';
    metrics?: {
        requestCount: number;
        errorRate: number;
        avgLatencyMs: number;
    };
}

/**
 * Represents a version control integration context.
 */
export interface VersionControlContext {
    id: UUID;
    repositoryUrl: string;
    branch: string;
    credentialsId: UUID;
    lastSyncTime: Date;
    status: 'synced' | 'diverged' | 'error';
    localPath?: string; // Path within the notebook's file system
}

// --- Managers & Sub-Services within the KernelService Universe ---

/**
 * Manages kernel lifecycle: starting, stopping, listing, and health checks.
 */
export const KernelManager = {
    /**
     * Stores active kernel sessions. (In a real system, this would be a persistent, distributed store).
     */
    _activeSessions: new Map<UUID, KernelSession>(),

    /**
     * Starts a new kernel session.
     * @param notebookId The ID of the notebook requesting the kernel.
     * @param userId The ID of the user initiating the request.
     * @param kernelSpec The specification of the kernel to start.
     * @param options Additional options for starting the kernel (e.g., resource allocation).
     * @returns A promise that resolves with the new kernel session details.
     */
    startKernel: async (
        notebookId: UUID,
        userId: UUID,
        kernelSpec: KernelSpec,
        options?: {
            preWarmData?: Record<string, any>; // Data to load into kernel on startup
            initialCode?: string; // Code to run immediately after kernel starts
            environmentVariables?: Record<string, string>;
            securityPolicyId?: UUID; // Custom security policy for this kernel
            idleTimeoutMinutes?: number; // Auto-shutdown after idle time
            priority?: number; // Scheduling priority (0-100)
            targetZone?: string; // e.g., 'us-central1-a'
            containerImageOverride?: string; // Override kernelSpec container image
        }
    ): Promise<KernelSession> => {
        console.log(`[KernelManager] Starting kernel for notebook ${notebookId} (user: ${userId}) with spec: ${kernelSpec.name}`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'kernel_status_change',
            timestamp: new Date(),
            userId,
            notebookId,
            data: { newStatus: KernelStatus.Starting, kernelSpec: kernelSpec.name, requestedResources: kernelSpec.resources }
        });

        // Simulate complex provisioning and startup
        const sessionId: UUID = `ksess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const session: KernelSession = {
            id: sessionId,
            notebookId,
            userId,
            environment: kernelSpec.environmentType,
            status: KernelStatus.Provisioning,
            connectedClients: [userId],
            startTime: new Date(),
            lastActivity: new Date(),
            kernelSpec,
            autoShutdownConfig: options?.idleTimeoutMinutes ? { idleTimeoutMinutes: options.idleTimeoutMinutes } : undefined,
            environmentConfigId: `env-${kernelSpec.name}-default` // Hypothetical link
        };
        KernelManager._activeSessions.set(sessionId, session);

        // Simulate async provisioning and startup
        await new Promise(resolve => setTimeout(resolve, 3000));

        session.status = KernelStatus.Idle;
        session.resourceUsage = { cpuPercent: 0, memoryBytes: 128 * 1024 * 1024, networkBytesIn: 0, networkBytesOut: 0 };
        console.log(`[KernelManager] Kernel session ${sessionId} started.`);

        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'kernel_status_change',
            timestamp: new Date(),
            sessionId: session.id,
            userId: session.userId,
            notebookId: session.notebookId,
            data: { newStatus: KernelStatus.Idle, oldStatus: KernelStatus.Provisioning, kernelSpec: kernelSpec.name }
        });

        if (options?.initialCode) {
            console.log(`[KernelManager] Executing initial code for session ${sessionId}.`);
            await KernelService.executeInSession(sessionId, options.initialCode, { sessionId, storeHistory: false });
        }
        return session;
    },

    /**
     * Stops an active kernel session.
     * @param sessionId The ID of the kernel session to stop.
     * @param force Force shutdown, bypassing graceful shutdown.
     */
    stopKernel: async (sessionId: UUID, force: boolean = false): Promise<void> => {
        console.log(`[KernelManager] Stopping kernel session: ${sessionId}, force: ${force}`);
        const session = KernelManager._activeSessions.get(sessionId);
        if (!session) {
            console.warn(`[KernelManager] Attempted to stop non-existent kernel session: ${sessionId}`);
            return;
        }

        session.status = KernelStatus.ShuttingDown;
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'kernel_status_change',
            timestamp: new Date(),
            sessionId,
            userId: session.userId,
            notebookId: session.notebookId,
            data: { newStatus: KernelStatus.ShuttingDown, oldStatus: session.status }
        });

        // Simulate shutdown logic
        await new Promise(resolve => setTimeout(resolve, force ? 500 : 2000));
        KernelManager._activeSessions.delete(sessionId);
        console.log(`[KernelManager] Kernel session ${sessionId} stopped.`);

        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'kernel_status_change',
            timestamp: new Date(),
            sessionId,
            userId: session.userId,
            notebookId: session.notebookId,
            data: { newStatus: KernelStatus.Dead, oldStatus: KernelStatus.ShuttingDown }
        });
    },

    /**
     * Restarts an active kernel session, preserving state if possible (depending on kernel).
     * @param sessionId The ID of the kernel session to restart.
     * @param clearOutput Whether to clear all associated outputs on restart.
     */
    restartKernel: async (sessionId: UUID, clearOutput: boolean = true): Promise<void> => {
        console.log(`[KernelManager] Restarting kernel session: ${sessionId}, clearOutput: ${clearOutput}`);
        const session = KernelManager._activeSessions.get(sessionId);
        if (!session) {
            console.warn(`[KernelManager] Attempted to restart non-existent kernel session: ${sessionId}`);
            throw new Error(`Session ${sessionId} not found.`);
        }

        session.status = KernelStatus.Restarting;
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'kernel_status_change',
            timestamp: new Date(),
            sessionId,
            userId: session.userId,
            notebookId: session.notebookId,
            data: { newStatus: KernelStatus.Restarting, oldStatus: session.status }
        });

        // Simulate restart logic
        await new Promise(resolve => setTimeout(resolve, 2000));
        session.status = KernelStatus.Idle;
        session.lastActivity = new Date(); // Reset activity
        console.log(`[KernelManager] Kernel session ${sessionId} restarted.`);

        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'kernel_status_change',
            timestamp: new Date(),
            sessionId,
            userId: session.userId,
            notebookId: session.notebookId,
            data: { newStatus: KernelStatus.Idle, oldStatus: KernelStatus.Restarting }
        });
        if (clearOutput) {
            // This would signal the frontend or a persistent output store to clear outputs for this session.
            console.log(`[KernelManager] Signaling output clear for session ${sessionId}.`);
        }
    },

    /**
     * Interrupts the execution of code in a specific kernel session.
     * @param sessionId The ID of the kernel session to interrupt.
     */
    interruptKernel: async (sessionId: UUID): Promise<void> => {
        console.log(`[KernelManager] Interrupting kernel session: ${sessionId}`);
        const session = KernelManager._activeSessions.get(sessionId);
        if (!session) {
            console.warn(`[KernelManager] Attempted to interrupt non-existent kernel session: ${sessionId}`);
            throw new Error(`Session ${sessionId} not found.`);
        }
        if (!session.kernelSpec.supportsInterrupt) {
            console.warn(`[KernelManager] Kernel ${session.kernelSpec.name} does not support interrupt.`);
            throw new Error(`Kernel does not support interrupt.`);
        }

        // Simulate interrupt signal
        await new Promise(resolve => setTimeout(resolve, 500));
        session.status = KernelStatus.Idle; // Assume interrupt moves it to idle
        console.log(`[KernelManager] Kernel session ${sessionId} interrupted.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'kernel_status_change',
            timestamp: new Date(),
            sessionId,
            userId: session.userId,
            notebookId: session.notebookId,
            data: { newStatus: KernelStatus.Idle, oldStatus: session.status, action: 'interrupt' }
        });
    },

    /**
     * Retrieves details for a specific kernel session.
     * @param sessionId The ID of the kernel session.
     * @returns The kernel session details, or null if not found.
     */
    getKernelSession: async (sessionId: UUID): Promise<KernelSession | null> => {
        console.log(`[KernelManager] Retrieving kernel session: ${sessionId}`);
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async fetch
        const session = KernelManager._activeSessions.get(sessionId);
        if (session) {
            // Simulate updating resource usage dynamically
            session.lastActivity = new Date();
            session.resourceUsage = {
                cpuPercent: Math.min(100, Math.floor(Math.random() * 20)),
                memoryBytes: session.resourceUsage?.memoryBytes ? session.resourceUsage.memoryBytes * (1 + Math.random() * 0.1 - 0.05) : 256 * 1024 * 1024,
                networkBytesIn: session.resourceUsage?.networkBytesIn ? session.resourceUsage.networkBytesIn + Math.floor(Math.random() * 1000) : 1000,
                networkBytesOut: session.resourceUsage?.networkBytesOut ? session.resourceUsage.networkBytesOut + Math.floor(Math.random() * 500) : 500,
            };
        }
        return session || null;
    },

    /**
     * Lists all active kernel sessions for a given user or globally.
     * @param userId Optional: Filter sessions by user ID.
     * @param notebookId Optional: Filter sessions by notebook ID.
     * @param status Optional: Filter by kernel status.
     * @returns A promise that resolves with an array of active kernel sessions.
     */
    listKernelSessions: async (userId?: UUID, notebookId?: UUID, status?: KernelStatus): Promise<KernelSession[]> => {
        console.log(`[KernelManager] Listing kernel sessions for user: ${userId || 'all'}, notebook: ${notebookId || 'all'}, status: ${status || 'all'}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        return Array.from(KernelManager._activeSessions.values()).filter(s =>
            (!userId || s.userId === userId) &&
            (!notebookId || s.notebookId === notebookId) &&
            (!status || s.status === status)
        );
    },

    /**
     * Connects a client to an existing kernel session.
     * Used for real-time collaboration or multi-client access to a single kernel.
     * @param sessionId The ID of the kernel session.
     * @param clientId The ID of the client (e.g., user ID or frontend instance ID) to connect.
     * @returns True if connection was successful, false otherwise.
     */
    connectClientToKernel: async (sessionId: UUID, clientId: UUID): Promise<boolean> => {
        console.log(`[KernelManager] Client ${clientId} attempting to connect to session ${sessionId}.`);
        const session = await KernelManager.getKernelSession(sessionId);
        if (session) {
            if (!session.connectedClients.includes(clientId)) {
                session.connectedClients.push(clientId);
                session.lastActivity = new Date();
                // In a real system, this would update a persistent store
            }
            console.log(`[KernelManager] Client ${clientId} connected to session ${sessionId}.`);
            return true;
        }
        console.warn(`[KernelManager] Session ${sessionId} not found for client ${clientId}.`);
        return false;
    },

    /**
     * Disconnects a client from a kernel session. If no clients remain, the kernel might be idled or shut down.
     * @param sessionId The ID of the kernel session.
     * @param clientId The ID of the client to disconnect.
     * @returns True if disconnection was successful, false otherwise.
     */
    disconnectClientFromKernel: async (sessionId: UUID, clientId: UUID): Promise<boolean> => {
        console.log(`[KernelManager] Client ${clientId} attempting to disconnect from session ${sessionId}.`);
        const session = await KernelManager.getKernelSession(sessionId);
        if (session) {
            const index = session.connectedClients.indexOf(clientId);
            if (index !== -1) {
                session.connectedClients.splice(index, 1);
                session.lastActivity = new Date(); // Update activity on disconnect too
                // In a real system, this would update a persistent store
                console.log(`[KernelManager] Client ${clientId} disconnected from session ${sessionId}.`);
                // Logic to shut down or idle if connectedClients becomes empty
                if (session.connectedClients.length === 0 && session.autoShutdownConfig?.idleTimeoutMinutes === 0) { // Immediate shutdown if configured
                    console.log(`[KernelManager] No clients remaining for session ${sessionId}. Triggering immediate shutdown.`);
                    KernelManager.stopKernel(sessionId, false);
                } else if (session.connectedClients.length === 0 && session.autoShutdownConfig?.idleTimeoutMinutes) {
                    console.log(`[KernelManager] No clients remaining for session ${sessionId}. Idling, will shut down in ${session.autoShutdownConfig.idleTimeoutMinutes} minutes.`);
                    // Schedule a shutdown job
                }
                return true;
            }
            return false; // Client not found in session
        }
        console.warn(`[KernelManager] Session ${sessionId} not found for client ${clientId}.`);
        return false;
    },

    /**
     * Scales kernel resources up or down for an active session.
     * @param sessionId The ID of the kernel session.
     * @param newResources The new resource configuration.
     */
    scaleKernelResources: async (sessionId: UUID, newResources: Partial<KernelSpec['resources']>): Promise<KernelSession> => {
        console.log(`[KernelManager] Scaling resources for session ${sessionId} to: ${JSON.stringify(newResources)}`);
        const session = KernelManager._activeSessions.get(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found.`);
        }
        session.status = KernelStatus.Restarting; // Scaling often requires a restart
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'kernel_status_change',
            timestamp: new Date(),
            sessionId,
            data: { newStatus: KernelStatus.Restarting, oldStatus: session.status, action: 'scale_resources' }
        });
        await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate scaling operation
        Object.assign(session.kernelSpec.resources, newResources);
        session.status = KernelStatus.Idle;
        session.lastActivity = new Date();
        console.log(`[KernelManager] Kernel session ${sessionId} scaled and restarted.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'kernel_status_change',
            timestamp: new Date(),
            sessionId,
            data: { newStatus: KernelStatus.Idle, oldStatus: KernelStatus.Restarting, newResources: newResources }
        });
        return session;
    },

    /**
     * Registers a webhook to receive kernel status updates.
     * @param url The URL to send webhook notifications.
     * @param eventTypes The types of events to subscribe to.
     * @param filterBySessionId Optional: Only send events for a specific session.
     * @returns A webhook registration ID.
     */
    registerStatusWebhook: async (url: string, eventTypes: KernelStatus[] | 'all', filterBySessionId?: UUID): Promise<UUID> => {
        console.log(`[KernelManager] Registering webhook for URL: ${url}, events: ${eventTypes}, session: ${filterBySessionId || 'all'}`);
        await new Promise(resolve => setTimeout(resolve, 200));
        const webhookId: UUID = `webhook-${Date.now()}`;
        // In a real system, this would persist the webhook configuration and trigger notifications.
        console.log(`[KernelManager] Webhook ${webhookId} registered.`);
        return webhookId;
    }
};

/**
 * Manages the available kernel specifications.
 */
export const KernelSpecManager = {
    /**
     * A collection of predefined kernel specifications. In a real system, these would be fetched dynamically.
     */
    availableSpecs: {
        python3: {
            name: 'python3',
            displayName: 'Python 3 (Global)',
            language: 'python',
            environmentType: KernelEnvironmentType.Python3,
            argv: ['python', '-m', 'ipykernel_launcher', '-f', '{connection_file}'],
            resources: { cpuCores: 2, memoryGB: 4 },
            supportsDebugging: true,
            supportsInterrupt: true,
            richOutputMimeTypes: ['text/plain', 'text/html', 'image/png', 'image/jpeg', 'application/json', 'application/vnd.jupyter.widget-view+json'],
            description: 'Standard Python 3 kernel for general-purpose data science and scripting.',
            tags: ['python', 'data-science', 'ml'],
            version: '3.9.7',
            isolationLevel: 'container'
        } as KernelSpec,
        r: {
            name: 'r',
            displayName: 'R (Data Science)',
            language: 'r',
            environmentType: KernelEnvironmentType.R,
            argv: ['R', '--slave', '-e', 'IRkernel::main()'],
            resources: { cpuCores: 2, memoryGB: 4 },
            supportsDebugging: false,
            supportsInterrupt: true,
            richOutputMimeTypes: ['text/plain', 'image/png', 'application/json', 'text/html'],
            description: 'R kernel for statistical computing and graphics.',
            tags: ['r', 'statistics', 'visualization'],
            version: '4.1.2',
            isolationLevel: 'container'
        } as KernelSpec,
        julia: {
            name: 'julia',
            displayName: 'Julia (High Performance)',
            language: 'julia',
            environmentType: KernelEnvironmentType.Julia,
            argv: ['julia', '-i', '-e', 'using IJulia; IJulia.serve()'],
            resources: { cpuCores: 4, memoryGB: 8 },
            supportsDebugging: true,
            supportsInterrupt: true,
            richOutputMimeTypes: ['text/plain', 'image/svg+xml', 'application/json'],
            description: 'Julia kernel for scientific computing and high-performance applications.',
            tags: ['julia', 'performance', 'numerical'],
            version: '1.7.1',
            isolationLevel: 'container'
        } as KernelSpec,
        spark_scala: {
            name: 'spark_scala',
            displayName: 'Apache Spark (Scala)',
            language: 'scala',
            environmentType: KernelEnvironmentType.Custom, // Or a specific Spark type
            argv: ['toree', '--profile', '{connection_file}'],
            resources: { cpuCores: 8, memoryGB: 32 },
            containerImage: 'jupyter/all-spark-notebook',
            supportsDebugging: false,
            supportsInterrupt: true,
            richOutputMimeTypes: ['text/plain', 'text/html', 'application/json'],
            description: 'Scala kernel for distributed data processing with Apache Spark.',
            tags: ['spark', 'scala', 'big-data', 'distributed'],
            version: '3.2.0',
            isolationLevel: 'container'
        } as KernelSpec,
        ai_model_gpt4: {
            name: 'ai_model_gpt4',
            displayName: 'AI Model (GPT-4)',
            language: 'natural_language',
            environmentType: KernelEnvironmentType.AIModel,
            argv: [], // No direct argv, interacts via API
            resources: { cpuCores: 0.1, memoryGB: 0.1 }, // Placeholder, actual compute is external
            supportsDebugging: false,
            supportsInterrupt: false,
            richOutputMimeTypes: ['text/plain', 'text/markdown', 'application/json'],
            description: 'Direct interaction kernel for OpenAI GPT-4 model, accepting natural language prompts.',
            tags: ['ai', 'nlp', 'generative'],
            version: '4.0',
            isolationLevel: 'none' // API access
        } as KernelSpec,
        quantum_qiskit: {
            name: 'quantum_qiskit',
            displayName: 'Quantum (Qiskit)',
            language: 'python', // Python interface to Qiskit
            environmentType: KernelEnvironmentType.Quantum,
            argv: ['python', '-m', 'ipykernel_launcher', '-f', '{connection_file}'],
            dependencies: ['qiskit', 'qiskit-aer'],
            resources: { cpuCores: 4, memoryGB: 16 }, // For simulator
            supportsDebugging: false,
            supportsInterrupt: true,
            richOutputMimeTypes: ['text/plain', 'text/html', 'image/png', 'application/json'],
            description: 'Python kernel with Qiskit for quantum computing simulations and hardware interaction.',
            tags: ['quantum', 'qiskit', 'physics', 'simulation'],
            version: '0.34.0',
            isolationLevel: 'container'
        } as KernelSpec,
        sql_bigquery: {
            name: 'sql_bigquery',
            displayName: 'SQL (BigQuery)',
            language: 'sql',
            environmentType: KernelEnvironmentType.SQL,
            argv: [], // Interacts via API
            dependencies: [], // No local dependencies, client libraries handled
            customEnvVars: { 'GOOGLE_CLOUD_PROJECT': 'your-gcp-project-id' },
            resources: { cpuCores: 0.5, memoryGB: 1 }, // Local client library execution
            supportsDebugging: false,
            supportsInterrupt: true,
            richOutputMimeTypes: ['text/plain', 'text/html', 'application/json'],
            description: 'SQL kernel for querying Google BigQuery datasets.',
            tags: ['sql', 'bigquery', 'data-warehouse', 'gcp'],
            version: '1.0',
            isolationLevel: 'none' // API access
        } as KernelSpec,
    } as Record<string, KernelSpec>,

    /**
     * Registers a new custom kernel specification.
     * @param spec The kernel specification to register.
     */
    registerKernelSpec: async (spec: KernelSpec): Promise<void> => {
        console.log(`[KernelSpecManager] Registering new kernel spec: ${spec.name}`);
        if (KernelSpecManager.availableSpecs[spec.name]) {
            console.warn(`[KernelSpecManager] Kernel spec '${spec.name}' already exists. Overwriting.`);
        }
        KernelSpecManager.availableSpecs[spec.name] = spec; // Add to in-memory store
        // In a real system, this would persist the spec to a configuration service
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log(`[KernelSpecManager] Kernel spec ${spec.name} registered.`);
    },

    /**
     * Retrieves a kernel specification by its name.
     * @param name The name of the kernel spec.
     * @returns The kernel spec, or null if not found.
     */
    getKernelSpec: async (name: string): Promise<KernelSpec | null> => {
        return KernelSpecManager.availableSpecs[name] || null;
    },

    /**
     * Lists all currently registered kernel specifications.
     * @param tags Optional: Filter by tags.
     * @param language Optional: Filter by programming language.
     * @returns An array of matching KernelSpecs.
     */
    listKernelSpecs: async (tags?: string[], language?: string): Promise<KernelSpec[]> => {
        console.log(`[KernelSpecManager] Listing kernel specs (tags: ${tags?.join(',') || 'none'}, language: ${language || 'all'}).`);
        await new Promise(resolve => setTimeout(resolve, 50));
        return Object.values(KernelSpecManager.availableSpecs).filter(spec =>
            (!tags || tags.every(tag => spec.tags?.includes(tag))) &&
            (!language || spec.language === language)
        );
    },

    /**
     * Updates an existing kernel specification.
     * @param name The name of the kernel spec to update.
     * @param updates Partial updates to the kernel spec.
     */
    updateKernelSpec: async (name: string, updates: Partial<KernelSpec>): Promise<void> => {
        const existing = await KernelSpecManager.getKernelSpec(name);
        if (!existing) {
            throw new Error(`Kernel spec ${name} not found for update.`);
        }
        Object.assign(existing, updates);
        // In a real system, this would persist the updated spec
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log(`[KernelSpecManager] Kernel spec ${name} updated.`);
    },

    /**
     * Deregisters a kernel specification.
     * @param name The name of the kernel spec to deregister.
     */
    deregisterKernelSpec: async (name: string): Promise<void> => {
        if (KernelSpecManager.availableSpecs[name]) {
            delete KernelSpecManager.availableSpecs[name];
            // In a real system, this would remove the spec from persistence
            await new Promise(resolve => setTimeout(resolve, 50));
            console.log(`[KernelSpecManager] Kernel spec ${name} deregistered.`);
        } else {
            console.warn(`[KernelSpecManager] Attempted to deregister non-existent kernel spec: ${name}`);
        }
    }
};

const AvailableKernelSpecs = KernelSpecManager.availableSpecs; // Convenience alias

/**
 * Manages environment setup and dependencies for kernels.
 * This would interact with container orchestration, package managers, etc.
 */
export const EnvironmentManager = {
    /**
     * Stores managed environment configurations.
     */
    _managedEnvironments: new Map<UUID, any>(),

    /**
     * Creates a new isolated environment (e.g., Conda, virtualenv, Docker image).
     * @param name Name of the environment.
     * @param type Type of environment (e.g., Python, R).
     * @param dependencies List of packages/libraries to install.
     * @param baseImage Optional base container image.
     * @param userId The user requesting the environment.
     * @returns A promise that resolves with the ID of the new environment.
     */
    createEnvironment: async (name: string, type: KernelEnvironmentType, dependencies: string[], baseImage?: string, userId?: UUID): Promise<UUID> => {
        console.log(`[EnvironmentManager] Creating environment '${name}' of type ${type} with dependencies: ${dependencies.join(', ')}`);
        // Simulate container/env creation
        await new Promise(resolve => setTimeout(resolve, 5000));
        const envId: UUID = `env-${Date.now()}`;
        const newEnv = { id: envId, name, type, dependencies, baseImage, status: 'ready', createdBy: userId, createdAt: new Date() };
        EnvironmentManager._managedEnvironments.set(envId, newEnv);
        console.log(`[EnvironmentManager] Environment ${envId} created.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'user_action',
            timestamp: new Date(),
            userId,
            data: { action: 'create_environment', environmentName: name, environmentType: type, dependencies }
        });
        return envId;
    },

    /**
     * Installs new dependencies into an existing environment.
     * @param envId The ID of the environment.
     * @param dependencies New packages/libraries to install.
     * @param userId The user performing the action.
     */
    installDependencies: async (envId: UUID, dependencies: string[], userId?: UUID): Promise<void> => {
        console.log(`[EnvironmentManager] Installing dependencies ${dependencies.join(', ')} into environment ${envId}`);
        const env = EnvironmentManager._managedEnvironments.get(envId);
        if (!env) throw new Error(`Environment ${envId} not found.`);
        env.status = 'updating';
        await new Promise(resolve => setTimeout(resolve, 3000));
        env.dependencies.push(...dependencies);
        env.status = 'ready';
        console.log(`[EnvironmentManager] Dependencies installed in ${envId}.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'user_action',
            timestamp: new Date(),
            userId,
            data: { action: 'install_dependencies', environmentId: envId, dependencies }
        });
    },

    /**
     * Lists all managed environments.
     * @param userId Optional: Filter by user who created the environment.
     */
    listEnvironments: async (userId?: UUID): Promise<any[]> => {
        console.log(`[EnvironmentManager] Listing environments.`);
        await new Promise(resolve => setTimeout(resolve, 500));
        const dummyEnvironments = [
            { id: 'env-python-default', name: 'Default Python 3', type: KernelEnvironmentType.Python3, dependencies: ['numpy', 'pandas', 'scikit-learn'], status: 'ready', createdBy: 'system' },
            { id: 'env-r-base', name: 'Base R Environment', type: KernelEnvironmentType.R, dependencies: ['tidyverse', 'ggplot2'], status: 'ready', createdBy: 'system' },
        ];
        dummyEnvironments.forEach(env => EnvironmentManager._managedEnvironments.set(env.id, env));

        return Array.from(EnvironmentManager._managedEnvironments.values()).filter(env =>
            (!userId || env.createdBy === userId)
        );
    },

    /**
     * Gets details of a specific environment.
     */
    getEnvironmentDetails: async (envId: UUID): Promise<any | null> => {
        console.log(`[EnvironmentManager] Getting details for environment ${envId}.`);
        await new Promise(resolve => setTimeout(resolve, 200));
        return EnvironmentManager._managedEnvironments.get(envId) || null;
    },

    /**
     * Deletes an environment.
     * @param envId The ID of the environment.
     * @param userId The user performing the action (for authorization).
     */
    deleteEnvironment: async (envId: UUID, userId?: UUID): Promise<void> => {
        console.log(`[EnvironmentManager] Deleting environment ${envId} by user ${userId}.`);
        const env = EnvironmentManager._managedEnvironments.get(envId);
        if (!env) throw new Error(`Environment ${envId} not found.`);
        // Add authorization check: if (env.createdBy !== userId && !UserAuthService.isAdmin(userId)) throw new Error('Unauthorized');
        env.status = 'deleting';
        await new Promise(resolve => setTimeout(resolve, 1000));
        EnvironmentManager._managedEnvironments.delete(envId);
        console.log(`[EnvironmentManager] Environment ${envId} deleted.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'user_action',
            timestamp: new Date(),
            userId,
            data: { action: 'delete_environment', environmentId: envId }
        });
    },

    /**
     * Publishes a custom environment as a reusable image or configuration.
     * @param envId The ID of the environment to publish.
     * @param name A name for the published image.
     * @param description A description.
     * @param visibility 'private' | 'public' | 'shared_org'
     * @returns A string representing the published artifact (e.g., Docker image tag).
     */
    publishEnvironment: async (envId: UUID, name: string, description: string, visibility: 'private' | 'public' | 'shared_org' = 'private'): Promise<string> => {
        console.log(`[EnvironmentManager] Publishing environment ${envId} as '${name}'.`);
        const env = EnvironmentManager._managedEnvironments.get(envId);
        if (!env) throw new Error(`Environment ${envId} not found.`);
        env.status = 'publishing';
        await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate image build/upload
        const publishedId = `pub-env-${Date.now()}`;
        console.log(`[EnvironmentManager] Environment ${envId} published as ${publishedId}.`);
        env.status = 'ready'; // After publishing, the source env is still ready
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'user_action',
            timestamp: new Date(),
            data: { action: 'publish_environment', environmentId: envId, publishedName: name, visibility }
        });
        return publishedId;
    }
};

/**
 * Manages connections and interactions with external data sources.
 */
export const DataIntegrationService = {
    /**
     * Stores registered data source configurations.
     */
    _dataSources: new Map<UUID, DataSourceConfiguration>(),

    /**
     * Stores active data transfer jobs.
     */
    _dataTransferJobs: new Map<UUID, DataTransferJob>(),

    /**
     * Registers a new data source configuration.
     * @param config The data source configuration.
     * @param userId The user registering the data source.
     * @returns The ID of the registered data source.
     */
    registerDataSource: async (config: Omit<DataSourceConfiguration, 'id' | 'healthStatus' | 'lastHealthCheck'>, userId: UUID): Promise<UUID> => {
        console.log(`[DataIntegrationService] Registering data source: ${config.name} by user ${userId}.`);
        await new Promise(resolve => setTimeout(resolve, 500));
        const id: UUID = `ds-${Date.now()}`;
        const newConfig: DataSourceConfiguration = { ...config, id, healthStatus: 'unknown', lastHealthCheck: new Date() };
        DataIntegrationService._dataSources.set(id, newConfig);
        console.log(`[DataIntegrationService] Data source ${id} registered.`);
        // Trigger initial health check
        DataIntegrationService.checkDataSourceHealth(id);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'user_action',
            timestamp: new Date(),
            userId,
            data: { action: 'register_data_source', dataSourceId: id, dataSourceType: config.type, name: config.name }
        });
        return id;
    },

    /**
     * Updates an existing data source configuration.
     * @param id The ID of the data source.
     * @param updates Partial updates to the configuration.
     * @param userId The user performing the update.
     */
    updateDataSource: async (id: UUID, updates: Partial<DataSourceConfiguration>, userId: UUID): Promise<void> => {
        console.log(`[DataIntegrationService] Updating data source: ${id} by user ${userId}.`);
        const existing = DataIntegrationService._dataSources.get(id);
        if (!existing) throw new Error(`Data source ${id} not found.`);
        // Add authorization check here
        Object.assign(existing, updates);
        existing.lastHealthCheck = new Date(); // Reset health check
        // Persist update
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log(`[DataIntegrationService] Data source ${id} updated.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'user_action',
            timestamp: new Date(),
            userId,
            data: { action: 'update_data_source', dataSourceId: id, updatedFields: Object.keys(updates) }
        });
        DataIntegrationService.checkDataSourceHealth(id); // Re-check health
    },

    /**
     * Retrieves a data source configuration.
     * @param id The ID of the data source.
     * @returns The data source configuration, or null if not found.
     */
    getDataSource: async (id: UUID): Promise<DataSourceConfiguration | null> => {
        console.log(`[DataIntegrationService] Getting data source: ${id}`);
        await new Promise(resolve => setTimeout(resolve, 200));
        return DataIntegrationService._dataSources.get(id) || null;
    },

    /**
     * Lists all registered data sources.
     * @param userId Optional: Filter by user (e.g., show only accessible data sources).
     * @param type Optional: Filter by data source type.
     */
    listDataSources: async (userId?: UUID, type?: DataSourceConfiguration['type']): Promise<DataSourceConfiguration[]> => {
        console.log(`[DataIntegrationService] Listing data sources (user: ${userId || 'all'}, type: ${type || 'all'}).`);
        await new Promise(resolve => setTimeout(resolve, 200));
        const dummyDataSources: DataSourceConfiguration[] = [
            { id: 'ds-1', name: 'Production Database', type: 'database', connectionString: 'jdbc:postgresql://prod_db:5432/main', healthStatus: 'healthy', lastHealthCheck: new Date(), readOnly: true },
            { id: 'ds-google-cloud-storage', name: 'Google Cloud Storage', type: 'cloud_storage', connectionString: 'gs://my-bucket/', credentialsId: 'cred-gcp-sa', healthStatus: 'healthy', lastHealthCheck: new Date() },
            { id: 'ds-api-weather', name: 'Weather API', type: 'api', connectionString: 'https://api.weather.com/', healthStatus: 'healthy', lastHealthCheck: new Date(), readOnly: true },
        ];
        dummyDataSources.forEach(ds => DataIntegrationService._dataSources.set(ds.id, ds)); // Populate for simulation

        return Array.from(DataIntegrationService._dataSources.values()).filter(ds =>
            (!type || ds.type === type) // Add user-based filtering for real system
        );
    },

    /**
     * Initiates a data transfer (ingress or egress).
     * @param jobDetails The details of the data transfer job.
     * @param userId The user initiating the job.
     * @returns The ID of the initiated job.
     */
    initiateDataTransfer: async (jobDetails: Omit<DataTransferJob, 'id' | 'status' | 'progress' | 'startTime' | 'transferredBytes'>, userId: UUID): Promise<UUID> => {
        console.log(`[DataIntegrationService] Initiating data transfer: ${JSON.stringify(jobDetails)} by user ${userId}.`);
        const jobId: UUID = `dtrans-${Date.now()}`;
        const job: DataTransferJob = {
            id: jobId,
            status: 'pending',
            progress: 0,
            startTime: new Date(),
            transferredBytes: 0,
            estimatedTotalBytes: 100 * 1024 * 1024, // 100MB example
            ...jobDetails
        };
        DataIntegrationService._dataTransferJobs.set(jobId, job);

        // Simulate background job execution with progress updates
        const simulateTransfer = async () => {
            job.status = 'running';
            TelemetryService.emitEvent({ id: `tele-${Date.now()}`, type: 'data_transfer_status', timestamp: new Date(), userId, data: { jobId, status: 'running', source: jobDetails.source, destination: jobDetails.destination } });

            for (let i = 0; i <= 100; i += 10) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                job.progress = i;
                job.transferredBytes = Math.min(job.estimatedTotalBytes || 0, (i / 100) * (job.estimatedTotalBytes || 0));
                console.log(`[DataIntegrationService] Job ${jobId} progress: ${job.progress}%`);
                TelemetryService.emitEvent({ id: `tele-${Date.now()}`, type: 'data_transfer_status', timestamp: new Date(), userId, data: { jobId, status: 'running', progress: i } });
            }

            job.status = 'completed';
            job.progress = 100;
            job.endTime = new Date();
            job.transferredBytes = job.estimatedTotalBytes;
            console.log(`[DataIntegrationService] Data transfer job ${jobId} completed.`);
            TelemetryService.emitEvent({
                id: `tele-${Date.now()}`,
                type: 'data_transfer_status',
                timestamp: new Date(),
                userId,
                data: { action: 'data_transfer_completed', jobId: jobId, source: jobDetails.source, destination: jobDetails.destination, transferredBytes: job.transferredBytes }
            });
        };
        simulateTransfer(); // Run async

        return jobId;
    },

    /**
     * Gets the status of a data transfer job.
     * @param jobId The ID of the data transfer job.
     */
    getDataTransferStatus: async (jobId: UUID): Promise<DataTransferJob | null> => {
        console.log(`[DataIntegrationService] Getting status for data transfer job: ${jobId}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        return DataIntegrationService._dataTransferJobs.get(jobId) || null;
    },

    /**
     * Cancels an ongoing data transfer job.
     * @param jobId The ID of the job to cancel.
     * @param userId The user initiating cancellation.
     */
    cancelDataTransfer: async (jobId: UUID, userId: UUID): Promise<void> => {
        console.log(`[DataIntegrationService] Cancelling data transfer job ${jobId} by user ${userId}.`);
        const job = DataIntegrationService._dataTransferJobs.get(jobId);
        if (!job) throw new Error(`Job ${jobId} not found.`);
        if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
            console.warn(`[DataIntegrationService] Job ${jobId} is already in a terminal state.`);
            return;
        }
        job.status = 'cancelled';
        job.endTime = new Date();
        // In a real system, this would send a cancellation signal to the actual transfer worker.
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`[DataIntegrationService] Data transfer job ${jobId} cancelled.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'data_transfer_status',
            timestamp: new Date(),
            userId,
            data: { action: 'data_transfer_cancelled', jobId }
        });
    },

    /**
     * Executes a query against a registered data source (e.g., SQL query, API call).
     * @param dataSourceId The ID of the data source.
     * @param query The query string or API request parameters.
     * @param options Additional query options (e.g., pagination, format, securityContext).
     * @returns A promise resolving to the query result.
     */
    executeQuery: async (dataSourceId: UUID, query: string, options?: Record<string, any>): Promise<any> => {
        console.log(`[DataIntegrationService] Executing query on data source ${dataSourceId}: ${query}`);
        const dataSource = await DataIntegrationService.getDataSource(dataSourceId);
        if (!dataSource) throw new Error(`Data source ${dataSourceId} not found.`);
        if (dataSource.readOnly && !options?.readOnlyOverride) {
            if (!query.trim().toLowerCase().startsWith('select')) { // Simple check for DML operations
                throw new Error(`Data source ${dataSourceId} is read-only. Cannot execute non-SELECT queries.`);
            }
        }
        // Potentially use SecurityService.retrieveCredential(dataSource.credentialsId)
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Simulate query execution and data fetching
        if (dataSourceId === 'ds-1' && query.includes('SELECT * FROM users')) {
            return {
                headers: ['id', 'name', 'email', 'joined_at'],
                rows: [
                    [1, 'Alice', 'alice@example.com', '2022-01-01'],
                    [2, 'Bob', 'bob@example.com', '2022-03-15'],
                    [3, 'Charlie', 'charlie@example.com', '2023-07-20'],
                ],
                metadata: { rowCount: 3, queryTimeMs: 120, dataSource: dataSource.name }
            };
        } else if (dataSourceId === 'ds-api-weather' && query.includes('temperature')) {
            return {
                city: 'San Francisco',
                temperature: 15.2, // Celsius
                unit: 'C',
                conditions: 'Partly Cloudy',
                timestamp: new Date().toISOString()
            };
        }
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'user_action',
            timestamp: new Date(),
            data: { action: 'execute_query', dataSourceId, querySnippet: query.substring(0, 100) }
        });
        return { error: 'Query failed or unsupported for this data source/query combination.' };
    },

    /**
     * Performs a health check on a specific data source.
     * @param dataSourceId The ID of the data source to check.
     * @returns The updated health status.
     */
    checkDataSourceHealth: async (dataSourceId: UUID): Promise<DataSourceConfiguration['healthStatus']> => {
        console.log(`[DataIntegrationService] Performing health check for data source: ${dataSourceId}.`);
        const ds = DataIntegrationService._dataSources.get(dataSourceId);
        if (!ds) return 'unknown';

        ds.healthStatus = 'unknown'; // Temporarily set to unknown
        ds.lastHealthCheck = new Date();
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500)); // Simulate network check
        const isHealthy = Math.random() > 0.1; // 10% chance of being unhealthy
        ds.healthStatus = isHealthy ? 'healthy' : 'unhealthy';
        console.log(`[DataIntegrationService] Health check for ${dataSourceId}: ${ds.healthStatus}.`);

        if (!isHealthy) {
            TelemetryService.emitEvent({
                id: `tele-${Date.now()}`,
                type: 'security_alert',
                timestamp: new Date(),
                severity: 'error',
                data: { alertType: 'DataSourceUnhealthy', dataSourceId, message: `Data source ${dataSourceId} is unhealthy.` }
            });
        }
        return ds.healthStatus;
    }
};

/**
 * Provides AI-powered assistance for code generation, explanation, debugging, etc.
 */
export const AICodeCompanion = {
    /**
     * Requests AI assistance based on the provided context and type.
     * @param request The AI code assistance request.
     * @returns A promise resolving to the AI's response.
     */
    requestAssistance: async (request: AICodeAssistanceRequest): Promise<AICodeAssistanceResponse> => {
        console.log(`[AICodeCompanion] Requesting AI assistance (${request.type})...`);
        const responseId: UUID = `ai-resp-${Date.now()}`;
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000)); // Simulate AI processing time

        let suggestedCode = '';
        let explanation = '';
        let debugSuggestions: any[] = [];
        let dataInsights: any[] = [];
        let chartSuggestions: any[] = [];
        let errorResolutionSteps: any[] = [];
        let status: 'pending' | 'completed' | 'failed' | 'interrupted' = 'completed';

        try {
            switch (request.type) {
                case 'generate_code':
                    suggestedCode = `// AI generated code for: ${request.prompt || request.context}\n`;
                    if (request.preferredLanguage === KernelEnvironmentType.Python3) {
                        suggestedCode += `import pandas as pd\ndf = pd.DataFrame({'id': range(10), 'value': [i*10 for i in range(10)]})\nprint(df.head())`;
                    } else if (request.preferredLanguage === KernelEnvironmentType.SQL) {
                        suggestedCode += `SELECT AVG(column_name) FROM some_table WHERE date_column > CURRENT_DATE() - INTERVAL '30 day';`;
                    } else if (request.preferredLanguage === KernelEnvironmentType.NodeJS) {
                        suggestedCode += `fetch('https://api.example.com/data').then(res => res.json()).then(data => console.log(data));`;
                    } else {
                        suggestedCode += `console.log("Hello from AI - code generation!");`;
                    }
                    explanation = "This code snippet performs a basic data operation, database query, or API call based on your request and preferred language.";
                    break;
                case 'explain_code':
                    explanation = `The provided code snippet "${request.selection?.code || request.context.substring(0, Math.min(request.context.length, 50))}..." appears to be a ${request.preferredLanguage || 'general purpose'} fragment. It is likely designed to ${Math.random() > 0.5 ? 'filter and aggregate data' : 'define a function or class'}. The key components are...`;
                    break;
                case 'debug_code':
                    debugSuggestions = [{ line: 5, suggestion: 'Review array indexing, might be off-by-one. Consider `len(list) - 1` for last element.', severity: 'warning' }];
                    explanation = "AI identified potential issues like common logic errors or unhandled edge cases based on context.";
                    break;
                case 'refactor_code':
                    suggestedCode = `// Refactored by AI for clarity and performance\nfunction processDataEfficiently(data) {\n  // ... optimized implementation ...\n  return data.map(item => item * 2);\n}`;
                    explanation = "AI applied best practices for readability, modularity, and performance, converting imperative code to functional style.";
                    break;
                case 'optimize_code':
                    suggestedCode = `// Optimized by AI using vectorization/parallel processing\n// (e.g., using Dask or Polars for large datasets or GPU-accelerated libraries)`;
                    explanation = "AI identified and applied optimizations for faster execution, potentially leveraging specialized libraries or parallelization.";
                    break;
                case 'natural_language_to_code':
                    suggestedCode = `// Natural language to code by AI: "${request.prompt}"\n`;
                    if (request.prompt?.includes('plot average sales by month')) {
                        suggestedCode += `import matplotlib.pyplot as plt\nimport pandas as pd\n# Assume 'sales_data' DataFrame is available\nsales_data['month'] = sales_data['date'].dt.month\nmonthly_avg = sales_data.groupby('month')['sales'].mean()\nplt.figure(figsize=(10,6))\nplt.bar(monthly_avg.index, monthly_avg.values)\nplt.title('Average Sales by Month')\nplt.xlabel('Month')\nplt.ylabel('Average Sales')\nplt.show()`;
                    } else {
                        suggestedCode += `print("Successfully converted natural language to code based on your prompt!")`;
                    }
                    explanation = "AI interpreted your natural language prompt and generated the corresponding code, including necessary imports and visualization logic.";
                    break;
                case 'data_insight':
                    dataInsights = [
                        { insight: "There's a strong positive correlation between 'temperature' and 'sales' in the provided dataset.", confidence: 0.92, visualizationHint: 'scatter plot' },
                        { insight: "Outliers detected in 'transaction_amount' column, suggesting potential fraud or data entry errors.", confidence: 0.85, visualizationHint: 'box plot' }
                    ];
                    explanation = "AI analyzed the data context (e.g., previous cell outputs, linked data sources) and extracted meaningful insights.";
                    break;
                case 'chart_suggestion':
                    chartSuggestions = [
                        { type: 'line', dataColumns: ['date', 'value'], rationale: 'To show trends over time.' },
                        { type: 'bar', dataColumns: ['category', 'count'], rationale: 'To compare discrete categories.' }
                    ];
                    explanation = "AI suggested suitable chart types and relevant data columns based on the data structure.";
                    break;
                case 'error_resolution':
                    errorResolutionSteps = [
                        { step: 1, description: 'Check if `my_variable` is defined before use.', codeFix: 'my_variable = 0' },
                        { step: 2, description: 'Ensure all required libraries are imported.', codeFix: 'import missing_lib' }
                    ];
                    explanation = "AI provided a step-by-step guide to resolve the detected error, including potential code fixes.";
                    break;
                default:
                    status = 'failed';
                    explanation = 'Unsupported AI assistance type.';
            }
        } catch (e: any) {
            status = 'failed';
            explanation = `An internal AI error occurred: ${e.message}`;
            console.error(`[AICodeCompanion] Error during AI assistance: ${e.message}`);
        }

        const response: AICodeAssistanceResponse = {
            id: responseId,
            status,
            suggestedCode: suggestedCode || undefined,
            explanation: explanation || undefined,
            refactoringSuggestions: debugSuggestions.length > 0 ? debugSuggestions as any : undefined, // Assuming debugSuggestions can also represent refactoring suggestions for this simulation
            debugSuggestions: debugSuggestions.length > 0 ? debugSuggestions as any : undefined,
            optimizedCode: suggestedCode || undefined, // Reusing suggestedCode for optimization
            dataInsights: dataInsights.length > 0 ? dataInsights : undefined,
            chartSuggestions: chartSuggestions.length > 0 ? chartSuggestions : undefined,
            errorResolutionSteps: errorResolutionSteps.length > 0 ? errorResolutionSteps : undefined,
            confidenceScore: status === 'completed' ? (0.75 + Math.random() * 0.2) : 0,
            modelUsed: 'DeepThinker-v7.3-Pro',
            costEstimate: { currency: 'USD', amount: 0.005 + Math.random() * 0.01, unit: 'request' },
            error: status === 'failed' ? explanation : undefined,
            timestamp: new Date(),
        };
        console.log(`[AICodeCompanion] AI assistance (${request.type}) completed.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'user_action',
            timestamp: new Date(),
            userId: request.sessionId ? (await KernelManager.getKernelSession(request.sessionId))?.userId : undefined,
            notebookId: request.notebookId,
            cellId: request.cellId,
            data: { action: 'ai_assistance_requested', requestType: request.type, modelUsed: response.modelUsed, status: response.status, cost: response.costEstimate?.amount }
        });
        return response;
    },

    /**
     * Trains a custom AI model within the notebook environment, optionally tracking with an experiment platform.
     * @param sessionId The kernel session to use for training.
     * @param modelConfig Configuration for the model training job (e.g., hyperparameters, dataset references).
     * @param trainingCode The code to execute for training.
     * @param experimentId Optional: ID of an experiment to log results to.
     * @returns A promise resolving to a training job ID.
     */
    trainModel: async (sessionId: UUID, modelConfig: Record<string, any>, trainingCode: string, experimentId?: UUID): Promise<UUID> => {
        console.log(`[AICodeCompanion] Initiating model training in session ${sessionId}.`);
        const trainingJobId: UUID = `train-${Date.now()}`;
        // This would internally call KernelService.executeInSession and monitor its outputs
        const executionResult = await KernelService.executeInSession(sessionId, trainingCode, {
            outputStreamHandler: (msg) => console.log(`[ModelTraining: ${trainingJobId}] ${msg.type}: ${JSON.stringify(msg.content)}`)
        });

        if (executionResult.status === 'error') {
            console.error(`[AICodeCompanion] Model training job ${trainingJobId} failed.`);
            throw new Error(`Model training failed: ${executionResult.stderr || executionResult.errorDetails?.message}`);
        }

        console.log(`[AICodeCompanion] Model training job ${trainingJobId} completed.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'user_action',
            timestamp: new Date(),
            sessionId,
            data: { action: 'model_training_initiated', trainingJobId, modelConfig, experimentId, status: executionResult.status }
        });
        // In a real system, would save model artifacts, training logs, metrics.
        return trainingJobId;
    },

    /**
     * Deploys a trained model for inference, potentially to a serverless endpoint or dedicated infrastructure.
     * @param modelId The ID of the trained model artifact.
     * @param deploymentConfig Configuration for the deployment (e.g., target platform, scaling, endpoint name).
     * @param userId The user initiating the deployment.
     * @returns A promise resolving to the deployed application details.
     */
    deployModel: async (modelId: UUID, deploymentConfig: Record<string, any>, userId: UUID): Promise<DeployedApplication> => {
        console.log(`[AICodeCompanion] Deploying model ${modelId} for user ${userId}.`);
        await new Promise(resolve => setTimeout(resolve, 10000)); // Simulate deployment time
        const deploymentId: UUID = `deploy-${Date.now()}`;
        const endpoint = `https://model-inference.example.com/api/${deploymentId}`;
        const deployedApp: DeployedApplication = {
            id: deploymentId,
            name: deploymentConfig.name || `Model-${modelId}-Deployment`,
            sourceNotebookId: deploymentConfig.sourceNotebookId, // Link back to notebook
            type: 'api',
            deploymentUrl: endpoint,
            status: 'deployed',
            createdBy: userId,
            createdAt: new Date(),
            lastUpdated: new Date(),
            runtimeConfig: deploymentConfig,
            accessPolicy: 'private', // Default
        };
        console.log(`[AICodeCompanion] Model ${modelId} deployed to ${endpoint}.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'user_action',
            timestamp: new Date(),
            userId,
            data: { action: 'model_deployed', modelId, deploymentId, endpoint }
        });
        return deployedApp;
    },

    /**
     * Executes an inference request against a deployed model.
     * @param endpoint The model inference endpoint URL.
     * @param inputData The input data for inference.
     * @param options Additional options (e.g., batching, request ID).
     * @returns A promise resolving to the inference result.
     */
    runInference: async (endpoint: string, inputData: Record<string, any>, options?: Record<string, any>): Promise<Record<string, any>> => {
        console.log(`[AICodeCompanion] Running inference on ${endpoint} with data: ${JSON.stringify(inputData)}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        const result = {
            prediction: Math.random() > 0.5 ? 'positive' : 'negative',
            confidence: Math.random(),
            raw_scores: { positive: Math.random(), negative: Math.random() }
        };
        console.log(`[AICodeCompanion] Inference result: ${JSON.stringify(result)}`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'system_event', // Or specific inference event
            timestamp: new Date(),
            data: { action: 'model_inference_run', endpoint, inputHash: JSON.stringify(inputData).length, outputPrediction: result.prediction }
        });
        return result;
    },

    /**
     * Manages an AI agent workflow, where agents interact with tools/kernels to achieve a goal.
     * @param agentConfig Configuration for the AI agent (e.g., persona, available tools).
     * @param goal The high-level goal for the agent (natural language).
     * @param userId The user orchestrating the agent.
     * @param notebookId Optional: Contextual notebook ID.
     * @returns A promise resolving to the agent's final report, output artifacts, and trace.
     */
    orchestrateAgent: async (agentConfig: Record<string, any>, goal: string, userId: UUID, notebookId?: UUID): Promise<{ report: string; artifacts: any[]; trace: any[] }> => {
        console.log(`[AICodeCompanion] Orchestrating AI agent with goal: "${goal}" for user ${userId}.`);
        console.log(`[AICodeCompanion] Agent will interact with kernels and tools...`);
        // Simulate agent planning and execution involving multiple steps, tool calls, and kernel executions
        const trace: any[] = [];
        trace.push({ timestamp: new Date(), event: 'Agent started', goal });
        trace.push({ timestamp: new Date(), event: 'Agent planning', plan: ['Analyze data', 'Generate code', 'Execute code'] });

        await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate planning
        trace.push({ timestamp: new Date(), event: 'Tool call: DataIntegrationService.executeQuery', query: 'SELECT * FROM metrics' });
        const data = await DataIntegrationService.executeQuery('ds-1', 'SELECT * FROM some_data LIMIT 10', {});

        await new Promise(resolve => setTimeout(resolve, 3000));
        trace.push({ timestamp: new Date(), event: 'Tool call: AICodeCompanion.requestAssistance', type: 'generate_code', prompt: 'Summarize data' });
        const codeGenResponse = await AICodeCompanion.requestAssistance({ type: 'generate_code', context: JSON.stringify(data), prompt: 'Summarize the data', preferredLanguage: KernelEnvironmentType.Python3 });

        if (codeGenResponse.suggestedCode) {
            trace.push({ timestamp: new Date(), event: 'KernelService.executeInSession', code: codeGenResponse.suggestedCode });
            // This would likely use a dedicated scratch session or the current notebook's session
            const agentSession = (await KernelManager.listKernelSessions(userId, notebookId, KernelStatus.Idle))[0]?.id || (await KernelManager.startKernel(notebookId || 'agent-notebook', userId, AvailableKernelSpecs.python3)).id;
            const execResult = await KernelService.executeInSession(agentSession, codeGenResponse.suggestedCode);
            trace.push({ timestamp: new Date(), event: 'Execution Result', status: execResult.status, output: execResult.stdout });
        }

        await new Promise(resolve => setTimeout(resolve, 7000)); // Simulate more agent activity
        const finalReport = `Agent completed goal: "${goal}". Discovered insights: X, Y, Z based on data analysis. Final artifacts saved.`;
        const artifacts = [{ type: 'report', name: 'Agent Summary', uri: '/artifacts/agent-summary.md' }];
        trace.push({ timestamp: new Date(), event: 'Agent completed', report: finalReport, artifacts });

        console.log(`[AICodeCompanion] AI agent orchestration completed. Report: ${finalReport}`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'user_action',
            timestamp: new Date(),
            userId,
            notebookId,
            data: { action: 'ai_agent_orchestrated', goal, reportLength: finalReport.length }
        });
        return { report: finalReport, artifacts, trace };
    }
};

/**
 * Handles security aspects like sandboxing, credential management, and access control.
 */
export const SecurityService = {
    /**
     * Stores security contexts.
     */
    _securityContexts: new Map<UUID, any>(),

    /**
     * Stores credentials. (Highly simplified for simulation)
     */
    _credentials: new Map<UUID, { name: string, value: string, userId: UUID }>(),

    /**
     * Configures a new security context for a kernel or environment.
     * @param name A name for the security context.
     * @param policies Specific security policies (e.g., network access, file system restrictions, allowed syscalls).
     * @param userId The user creating the context.
     * @returns The ID of the created security context.
     */
    createSecurityContext: async (name: string, policies: Record<string, any>, userId: UUID): Promise<UUID> => {
        console.log(`[SecurityService] Creating security context '${name}' with policies: ${JSON.stringify(policies)} for user ${userId}.`);
        await new Promise(resolve => setTimeout(resolve, 500));
        const contextId: UUID = `sec-ctx-${Date.now()}`;
        SecurityService._securityContexts.set(contextId, { id: contextId, name, policies, createdBy: userId, createdAt: new Date() });
        console.log(`[SecurityService] Security context ${contextId} created.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'system_event',
            timestamp: new Date(),
            userId,
            data: { action: 'create_security_context', contextId, name, policies: Object.keys(policies) }
        });
        return contextId;
    },

    /**
     * Stores sensitive credentials securely.
     * @param name A name for the credential.
     * @param value The credential value (e.g., API key, password).
     * @param userId The user ID associated with the credential.
     * @param expiration Optional: Expiration date for the credential.
     * @returns The ID of the stored credential.
     */
    storeCredential: async (name: string, value: string, userId: UUID, expiration?: Date): Promise<UUID> => {
        console.log(`[SecurityService] Storing credential '${name}' for user ${userId}.`);
        // In a real system, this would involve KMS, secrets manager, encryption, etc.
        await new Promise(resolve => setTimeout(resolve, 300));
        const credId: UUID = `cred-${Date.now()}`;
        SecurityService._credentials.set(credId, { name, value, userId });
        console.log(`[SecurityService] Credential ${credId} stored.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'system_event',
            timestamp: new Date(),
            userId,
            data: { action: 'store_credential', credName: name, credId, hasExpiration: !!expiration }
        });
        return credId;
    },

    /**
     * Retrieves a stored credential.
     * @param credId The ID of the credential.
     * @param userId The user requesting the credential (for access control).
     * @returns The credential value, or null if unauthorized/not found.
     */
    retrieveCredential: async (credId: UUID, userId: UUID): Promise<string | null> => {
        console.log(`[SecurityService] Retrieving credential ${credId} for user ${userId}.`);
        // Simulate access control and retrieval
        await new Promise(resolve => setTimeout(resolve, 200));
        const credential = SecurityService._credentials.get(credId);
        if (credential && credential.userId === userId) { // Simple ownership check
            return credential.value;
        }
        console.warn(`[SecurityService] Access denied or credential not found for ${credId} by ${userId}.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'security_alert',
            timestamp: new Date(),
            severity: 'warning',
            userId,
            data: { alertType: 'CredentialAccessDenied', credId, requestedBy: userId }
        });
        return null;
    },

    /**
     * Scans code for potential security vulnerabilities or malicious patterns.
     * @param code The code snippet to scan.
     * @param context Additional context like language, dependencies, notebookId.
     * @param userId The user submitting the code.
     * @returns A promise resolving to a list of identified issues.
     */
    scanCodeForVulnerabilities: async (code: string, context: { language: KernelEnvironmentType, notebookId?: UUID }, userId: UUID): Promise<{ severity: 'high' | 'medium' | 'low' | 'critical'; message: string; line?: number; remediationSuggestion?: string; }>[] => {
        console.log(`[SecurityService] Scanning code for vulnerabilities (language: ${context.language}) submitted by user ${userId}...`);
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
        const issues: { severity: 'high' | 'medium' | 'low' | 'critical'; message: string; line?: number; remediationSuggestion?: string; }[] = [];
        const lines = code.split('\n');

        const addIssue = (severity: any, message: string, pattern: string, remediation?: string) => {
            const lineIndex = lines.findIndex(l => l.includes(pattern));
            if (lineIndex !== -1) {
                issues.push({ severity, message, line: lineIndex + 1, remediationSuggestion: remediation });
            }
        };

        addIssue('critical', 'Potential arbitrary command execution detected (os.system/subprocess.run).', 'os.system', 'Use safer alternatives like `subprocess.run` with `shell=False` and explicit arguments, or containerized execution.');
        addIssue('critical', 'Potential arbitrary command execution detected (subprocess.run with shell=True).', 'subprocess.run(', 'Avoid `shell=True` with user-controlled input. Pass commands as lists of arguments.');
        addIssue('high', 'Use of `eval()` can lead to code injection vulnerabilities.', 'eval(', 'Refactor to use safe alternatives like `json.loads()` or explicit parsing, or use sandboxed execution.');
        addIssue('medium', 'SQL injection vulnerability suspected due to unparameterized string concatenation.', 'SELECT .* FROM .* WHERE .* = \'', 'Use parameterized queries or ORMs to prevent SQL injection.');
        addIssue('low', 'Consider verifying SSL certificates when making HTTP requests.', 'requests.get(', 'Add `verify=True` (default) and handle exceptions, or `requests.post(..., verify=path_to_cert)` for custom certs.');
        addIssue('high', 'Direct usage of hardcoded sensitive values (e.g., API keys).', 'API_KEY = "sk-', 'Store sensitive information in a secure secrets manager and retrieve it at runtime.');

        console.log(`[SecurityService] Code scan completed for ${context.notebookId || 'ad-hoc'}. Found ${issues.length} issues.`);
        if (issues.length > 0) {
            TelemetryService.emitEvent({
                id: `tele-${Date.now()}`,
                type: 'security_alert',
                timestamp: new Date(),
                severity: issues.some(i => i.severity === 'critical') ? 'critical' : issues.some(i => i.severity === 'high') ? 'error' : 'warning',
                userId,
                notebookId: context.notebookId,
                data: { alertType: 'CodeVulnerabilityScan', issueCount: issues.length, highestSeverity: issues.reduce((max, i) => i.severity === 'critical' ? 'critical' : (i.severity === 'high' && max !== 'critical' ? 'high' : (i.severity === 'medium' && max !== 'critical' && max !== 'high' ? 'medium' : max)), 'low'), issues: issues.map(i => ({ msg: i.message, sev: i.severity })) }
            });
        }
        return issues;
    },

    /**
     * Enforces access control for a given resource and action.
     * @param userId The ID of the user attempting access.
     * @param resourceType The type of resource (e.g., 'notebook', 'kernel_session', 'data_source').
     * @param resourceId The ID of the resource.
     * @param action The action being performed (e.g., 'read', 'write', 'execute', 'delete').
     * @returns A promise resolving to true if access is granted, false otherwise.
     */
    checkAccess: async (userId: UUID, resourceType: string, resourceId: UUID, action: string): Promise<boolean> => {
        console.log(`[SecurityService] Checking access for user ${userId} to ${action} ${resourceType}:${resourceId}.`);
        await new Promise(resolve => setTimeout(resolve, 100));
        // Simplified authorization logic
        const granted = Math.random() > 0.05; // 5% chance of denial
        if (!granted) {
            console.warn(`[SecurityService] Access DENIED for user ${userId} to ${action} ${resourceType}:${resourceId}.`);
            TelemetryService.emitEvent({
                id: `tele-${Date.now()}`,
                type: 'security_alert',
                timestamp: new Date(),
                severity: 'warning',
                userId,
                data: { alertType: 'AccessDenied', resourceType, resourceId, action }
            });
        }
        return granted;
    },

    /**
     * Applies a sandbox policy to a running kernel session.
     * @param sessionId The ID of the kernel session.
     * @param policyId The ID of the security context/policy to apply.
     */
    applySandboxPolicy: async (sessionId: UUID, policyId: UUID): Promise<void> => {
        console.log(`[SecurityService] Applying sandbox policy ${policyId} to kernel session ${sessionId}.`);
        const session = KernelManager._activeSessions.get(sessionId);
        const policy = SecurityService._securityContexts.get(policyId);
        if (!session || !policy) {
            throw new Error(`Session ${sessionId} or Policy ${policyId} not found.`);
        }
        // Simulate applying container/VM level restrictions
        await new Promise(resolve => setTimeout(resolve, 1000));
        session.securityContextId = policyId;
        console.log(`[SecurityService] Sandbox policy ${policyId} applied to session ${sessionId}.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'system_event',
            timestamp: new Date(),
            sessionId,
            data: { action: 'apply_sandbox_policy', policyId, policies: Object.keys(policy.policies) }
        });
    }
};

/**
 * Handles logging, metrics, and event tracking for system observability.
 */
export const TelemetryService = {
    /**
     * A simple in-memory store for emitted events for demonstration.
     * In a real system, this would be a high-throughput, persistent logging/metrics system.
     */
    _eventLog: [] as TelemetryEvent[],

    /**
     * Emits a telemetry event for monitoring and analytics.
     * @param event The event to emit.
     */
    emitEvent: (event: TelemetryEvent): void => {
        // In a real system, this would send data to a logging/monitoring pipeline (e.g., Stackdriver, Prometheus, OpenTelemetry)
        const eventWithDefaults = { ...event, timestamp: event.timestamp || new Date(), id: event.id || `tele-${Date.now()}-${Math.random().toString(36).substring(2, 8)}` };
        console.log(`[Telemetry] Emitting event: ${eventWithDefaults.type} (ID: ${eventWithDefaults.id}, Data: ${JSON.stringify(eventWithDefaults.data)})`);
        TelemetryService._eventLog.push(eventWithDefaults);
        // Trim log to prevent unbounded growth in simulation
        if (TelemetryService._eventLog.length > 500) {
            TelemetryService._eventLog.splice(0, TelemetryService._eventLog.length - 500);
        }
    },

    /**
     * Retrieves recent telemetry events. (For debugging/admin UIs)
     * @param type Optional: Filter by event type.
     * @param limit Maximum number of events to retrieve.
     * @param userId Optional: Filter by user ID.
     * @param notebookId Optional: Filter by notebook ID.
     */
    getRecentEvents: async (type?: TelemetryEvent['type'], limit: number = 100, userId?: UUID, notebookId?: UUID): Promise<TelemetryEvent[]> => {
        console.log(`[Telemetry] Retrieving recent events (type: ${type || 'all'}, limit: ${limit}, user: ${userId || 'all'}, notebook: ${notebookId || 'all'}).`);
        await new Promise(resolve => setTimeout(resolve, 50));
        return TelemetryService._eventLog
            .filter(e =>
                (!type || e.type === type) &&
                (!userId || e.userId === userId) &&
                (!notebookId || e.notebookId === notebookId)
            )
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) // Newest first
            .slice(0, limit);
    },

    /**
     * Creates or updates an alert for specific conditions (e.g., kernel crashing, high resource usage).
     * @param name Name of the alert.
     * @param condition A string or object describing the alert condition (e.g., "cpu_usage > 80% for 5m", { metric: 'kernel.cpu_percent', operator: 'gt', value: 80, duration: '5m' }).
     * @param recipients Email addresses or other notification endpoints.
     * @param severity The severity level of the alert.
     * @returns A promise resolving to the alert configuration ID.
     */
    createAlert: async (name: string, condition: string | Record<string, any>, recipients: string[], severity: 'info' | 'warning' | 'error' | 'critical' = 'error'): Promise<UUID> => {
        console.log(`[Telemetry] Creating alert '${name}' (severity: ${severity}) for condition: ${JSON.stringify(condition)} to recipients: ${recipients.join(', ')}.`);
        await new Promise(resolve => setTimeout(resolve, 500));
        const alertId: UUID = `alert-${Date.now()}`;
        // In a real system, this would register with an alerting service.
        console.log(`[Telemetry] Alert ${alertId} created.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'system_event',
            timestamp: new Date(),
            severity: 'info',
            data: { action: 'create_alert', alertId, name, condition: JSON.stringify(condition), recipientsCount: recipients.length }
        });
        return alertId;
    },

    /**
     * Exports a range of telemetry data for offline analysis or compliance.
     * @param startTime The start time of the export range.
     * @param endTime The end time of the export range.
     * @param format The desired export format (e.g., 'json', 'csv', 'parquet').
     * @param targetStorageId Optional: The data source ID for export (e.g., S3, GCS).
     * @returns A promise resolving to a URI of the exported data.
     */
    exportTelemetryData: async (startTime: Date, endTime: Date, format: 'json' | 'csv' | 'parquet', targetStorageId?: UUID): Promise<string> => {
        console.log(`[Telemetry] Exporting telemetry data from ${startTime.toISOString()} to ${endTime.toISOString()} in ${format} format.`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        const exportUri = targetStorageId ? `gs://${targetStorageId}/telemetry_export_${Date.now()}.${format}` : `/tmp/telemetry_export_${Date.now()}.${format}`;
        console.log(`[Telemetry] Telemetry data exported to: ${exportUri}`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'system_event',
            timestamp: new Date(),
            severity: 'info',
            data: { action: 'export_telemetry', startTime: startTime.toISOString(), endTime: endTime.toISOString(), format, exportUri }
        });
        return exportUri;
    }
};

/**
 * Manages the plugin system for extending kernel functionalities, output renderers, etc.
 */
export const PluginManager = {
    /**
     * Stores registered plugin configurations.
     */
    registeredPlugins: new Map<UUID, { name: string, type: 'kernel' | 'output_renderer' | 'data_connector' | 'ai_tool' | 'workflow_executor' | 'ui_widget' | 'security_scanner' | 'custom_command', config: Record<string, any>, loaded: boolean, entryPoint?: string, version: string }>(),

    /**
     * Registers a new plugin with the system.
     * @param pluginConfig Configuration for the plugin.
     * @param userId The user registering the plugin.
     * @returns The ID of the registered plugin.
     */
    registerPlugin: async (pluginConfig: Omit<PluginManager['registeredPlugins'] extends Map<any, infer U> ? U : never, 'loaded'>, userId: UUID): Promise<UUID> => {
        console.log(`[PluginManager] Registering plugin: ${pluginConfig.name} (${pluginConfig.type}) by user ${userId}.`);
        await new Promise(resolve => setTimeout(resolve, 500));
        const pluginId: UUID = `plugin-${Date.now()}`;
        PluginManager.registeredPlugins.set(pluginId, { ...pluginConfig, loaded: false });
        console.log(`[PluginManager] Plugin ${pluginId} registered.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'user_action',
            timestamp: new Date(),
            userId,
            data: { action: 'register_plugin', pluginId, name: pluginConfig.name, type: pluginConfig.type, version: pluginConfig.version }
        });
        return pluginId;
    },

    /**
     * Loads and activates a registered plugin.
     * @param pluginId The ID of the plugin to load.
     * @param userId The user initiating the load.
     */
    loadPlugin: async (pluginId: UUID, userId?: UUID): Promise<void> => {
        const plugin = PluginManager.registeredPlugins.get(pluginId);
        if (plugin) {
            if (plugin.loaded) {
                console.log(`[PluginManager] Plugin ${plugin.name} (${pluginId}) is already loaded.`);
                return;
            }
            console.log(`[PluginManager] Loading plugin ${plugin.name} (${pluginId})...`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async loading
            plugin.loaded = true;
            console.log(`[PluginManager] Plugin ${plugin.name} loaded.`);
            TelemetryService.emitEvent({
                id: `tele-${Date.now()}`,
                type: 'system_event',
                timestamp: new Date(),
                userId,
                data: { action: 'load_plugin', pluginId, name: plugin.name, type: plugin.type }
            });

            // Potentially trigger dynamic registration with other services
            if (plugin.type === 'kernel') {
                // Example: Assume plugin.config has a KernelSpec, register it
                // await KernelSpecManager.registerKernelSpec(plugin.config as KernelSpec);
                console.log(`[PluginManager] Plugin ${plugin.name} registered as a kernel spec.`);
            } else if (plugin.type === 'data_connector') {
                // Example: Register a new data source type handler
                console.log(`[PluginManager] Plugin ${plugin.name} registered as a data connector.`);
            }
            // Add more type-specific integration logic here
        } else {
            console.warn(`[PluginManager] Plugin ${pluginId} not found.`);
            throw new Error(`Plugin ${pluginId} not found.`);
        }
    },

    /**
     * Unloads and deactivates a plugin.
     * @param pluginId The ID of the plugin to unload.
     * @param userId The user initiating the unload.
     */
    unloadPlugin: async (pluginId: UUID, userId?: UUID): Promise<void> => {
        const plugin = PluginManager.registeredPlugins.get(pluginId);
        if (plugin && plugin.loaded) {
            console.log(`[PluginManager] Unloading plugin ${plugin.name} (${pluginId})...`);
            await new Promise(resolve => setTimeout(resolve, 500));
            plugin.loaded = false;
            console.log(`[PluginManager] Plugin ${plugin.name} unloaded.`);
            TelemetryService.emitEvent({
                id: `tele-${Date.now()}`,
                type: 'system_event',
                timestamp: new Date(),
                userId,
                data: { action: 'unload_plugin', pluginId, name: plugin.name, type: plugin.type }
            });
            // Also deregister any capabilities it added, e.g., from KernelSpecManager
        } else if (plugin) {
            console.warn(`[PluginManager] Plugin ${plugin.name} (${pluginId}) is not loaded.`);
        } else {
            console.warn(`[PluginManager] Plugin ${pluginId} not found.`);
        }
    },

    /**
     * Lists all registered plugins.
     * @param type Optional: Filter by plugin type.
     */
    listPlugins: async (type?: PluginManager['registeredPlugins'] extends Map<any, infer U> ? U['type'] : never): Promise<Array<{ id: UUID, name: string, type: string, loaded: boolean, version: string }>> => {
        console.log(`[PluginManager] Listing plugins (type: ${type || 'all'}).`);
        await new Promise(resolve => setTimeout(resolve, 100));
        return Array.from(PluginManager.registeredPlugins.entries())
            .filter(([_, p]) => !type || p.type === type)
            .map(([id, p]) => ({ id, name: p.name, type: p.type, loaded: p.loaded, version: p.version }));
    },

    /**
     * Updates a plugin's configuration or code. Requires reloading.
     * @param pluginId The ID of the plugin to update.
     * @param updates The partial updates to the plugin config.
     * @param userId The user initiating the update.
     */
    updatePlugin: async (pluginId: UUID, updates: Partial<PluginManager['registeredPlugins'] extends Map<any, infer U> ? U : never>, userId: UUID): Promise<void> => {
        console.log(`[PluginManager] Updating plugin ${pluginId} by user ${userId}.`);
        const plugin = PluginManager.registeredPlugins.get(pluginId);
        if (!plugin) throw new Error(`Plugin ${pluginId} not found.`);

        Object.assign(plugin, updates);
        plugin.loaded = false; // Force reload after update

        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`[PluginManager] Plugin ${pluginId} updated. Reload required.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'user_action',
            timestamp: new Date(),
            userId,
            data: { action: 'update_plugin', pluginId, name: plugin.name, updatedFields: Object.keys(updates) }
        });
    }
};

/**
 * Manages complex computational graphs and workflows.
 */
export const WorkflowEngine = {
    /**
     * Stores defined computational graphs.
     */
    _definedGraphs: new Map<UUID, ComputationalGraph>(),

    /**
     * Stores active graph execution instances.
     */
    _activeGraphExecutions: new Map<UUID, { graphId: UUID, status: string, progress: number, logs: string[] }>(),

    /**
     * Defines a new computational graph or workflow.
     * @param graph The computational graph definition.
     * @param userId The user defining the graph.
     * @returns The ID of the saved graph.
     */
    defineGraph: async (graph: Omit<ComputationalGraph, 'id' | 'version' | 'createdAt' | 'lastModifiedAt' | 'lastModifiedBy'>, userId: UUID): Promise<UUID> => {
        console.log(`[WorkflowEngine] Defining new graph: ${graph.name} by user ${userId}.`);
        await new Promise(resolve => setTimeout(resolve, 500));
        const graphId: UUID = `graph-${Date.now()}`;
        const newGraph: ComputationalGraph = {
            ...graph,
            id: graphId,
            version: 1,
            createdBy: userId,
            createdAt: new Date(),
            lastModifiedAt: new Date(),
            lastModifiedBy: userId,
            nodes: graph.nodes.map(node => ({ ...node, id: node.id || `node-${Math.random().toString(36).substring(2, 9)}`, status: 'pending' })),
            edges: graph.edges.map(edge => ({ ...edge, id: edge.id || `edge-${Math.random().toString(36).substring(2, 9)}` }))
        };
        WorkflowEngine._definedGraphs.set(graphId, newGraph);
        console.log(`[WorkflowEngine] Graph ${graphId} defined.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'user_action',
            timestamp: new Date(),
            userId,
            data: { action: 'define_graph', graphId, name: graph.name, nodeCount: newGraph.nodes.length }
        });
        return graphId;
    },

    /**
     * Executes a defined computational graph.
     * @param graphId The ID of the graph to execute.
     * @param inputData Optional input data for the graph's entry nodes.
     * @param executionOptions Options like parallelization strategy, error handling.
     * @param userId The user initiating execution.
     * @param notebookId Optional: Contextual notebook ID.
     * @returns A promise resolving to the execution result and output artifacts.
     */
    executeGraph: async (graphId: UUID, inputData?: Record<string, any>, executionOptions?: { parallel?: boolean; stopOnError?: boolean; }, userId?: UUID, notebookId?: UUID): Promise<Record<string, any>> => {
        console.log(`[WorkflowEngine] Executing graph ${graphId} with options: ${JSON.stringify(executionOptions)} by user ${userId}.`);
        const graph = WorkflowEngine._definedGraphs.get(graphId);
        if (!graph) throw new Error(`Graph ${graphId} not found.`);

        const executionInstanceId: UUID = `exec-graph-${Date.now()}`;
        WorkflowEngine._activeGraphExecutions.set(executionInstanceId, { graphId, status: 'running', progress: 0, logs: [] });
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'workflow_status',
            timestamp: new Date(),
            userId,
            notebookId,
            data: { action: 'graph_execution_started', graphId, executionInstanceId, inputData: JSON.stringify(inputData).length }
        });

        // Simulate graph traversal, node execution (via KernelService.executeInSession or other services)
        // This would involve complex scheduling, dependency management, and potentially distributed computing.
        const logs: string[] = [];
        let totalNodes = graph.nodes.length;
        let completedNodes = 0;
        let finalStatus = 'success';
        const nodeOutputs: Record<UUID, any> = {}; // Store outputs for downstream nodes

        for (const node of graph.nodes) {
            if (node.status === 'failed' && executionOptions?.stopOnError) {
                finalStatus = 'failed';
                logs.push(`[${node.name}] Skipped due to previous error and stopOnError policy.`);
                break;
            }
            console.log(`[WorkflowEngine] Executing node: ${node.name} (${node.type}) in graph ${graphId}.`);
            logs.push(`[${new Date().toISOString()}] Executing node: ${node.name}`);
            node.status = 'running';
            // Placeholder: In a real system, would dynamically select execution method
            // E.g., if node.type === 'code_cell', call KernelService.executeInSession
            // if node.type === 'data_source', call DataIntegrationService.executeQuery
            // if node.type === 'model_training', call AICodeCompanion.trainModel
            await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000)); // Simulate node execution time

            const success = Math.random() > 0.1; // 10% chance of node failure
            if (success) {
                node.status = 'completed';
                nodeOutputs[node.id] = { simulated_output: `Node ${node.name} processed successfully.` };
                logs.push(`[${new Date().toISOString()}] Node ${node.name} completed.`);
            } else {
                node.status = 'failed';
                node.lastRunResult = { executionId: `node-exec-${Date.now()}`, status: 'error', outputs: [], durationMs: 2000, errorDetails: { name: 'NodeFailure', message: `Simulated failure for node ${node.name}.`, stacktrace: [] } };
                finalStatus = 'failed';
                logs.push(`[${new Date().toISOString()}] Node ${node.name} FAILED.`);
                if (executionOptions?.stopOnError) {
                    break;
                }
            }
            completedNodes++;
            WorkflowEngine._activeGraphExecutions.get(executionInstanceId)!.progress = Math.floor((completedNodes / totalNodes) * 100);
            WorkflowEngine._activeGraphExecutions.get(executionInstanceId)!.logs = [...logs];
        }

        WorkflowEngine._activeGraphExecutions.get(executionInstanceId)!.status = finalStatus;
        WorkflowEngine._activeGraphExecutions.get(executionInstanceId)!.progress = 100;
        console.log(`[WorkflowEngine] Graph ${graphId} execution completed with status: ${finalStatus}.`);

        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'workflow_status',
            timestamp: new Date(),
            userId,
            notebookId,
            data: { action: 'graph_execution_completed', graphId, executionInstanceId, status: finalStatus, completedNodes, totalNodes }
        });
        return {
            status: finalStatus,
            outputs: nodeOutputs,
            logs: logs.join('\n'),
            metrics: { totalDurationMs: (completedNodes * 2000), nodesExecuted: completedNodes, failedNodes: (totalNodes - completedNodes) },
            artifacts: [{ type: 'report', name: 'Workflow Execution Summary', uri: `/workflow_artifacts/${executionInstanceId}/summary.json` }]
        };
    },

    /**
     * Gets the status of an ongoing graph execution.
     * @param executionId The ID of the graph execution instance.
     */
    getGraphExecutionStatus: async (executionId: UUID): Promise<any> => {
        console.log(`[WorkflowEngine] Getting status for graph execution ${executionId}.`);
        await new Promise(resolve => setTimeout(resolve, 100));
        return WorkflowEngine._activeGraphExecutions.get(executionId) || { executionId, status: 'unknown', progress: 0, logs: [] };
    },

    /**
     * Lists all defined computational graphs.
     * @param userId Optional: Filter by user.
     * @param tags Optional: Filter by tags.
     */
    listGraphs: async (userId?: UUID, tags?: string[]): Promise<ComputationalGraph[]> => {
        console.log(`[WorkflowEngine] Listing graphs for user ${userId || 'all'} (tags: ${tags?.join(',') || 'none'}).`);
        await new Promise(resolve => setTimeout(resolve, 300));
        const dummyGraphs: ComputationalGraph[] = [
            { id: 'graph-etl-1', name: 'Daily ETL Pipeline', description: 'Loads data, cleans, and stores.', nodes: [], edges: [], createdBy: 'user-abc', createdAt: new Date(), lastModifiedAt: new Date(), lastModifiedBy: 'user-abc', version: 1, tags: ['etl', 'daily', 'data-pipeline'], schedule: { cronTab: '0 2 * * *', timezone: 'UTC' } },
            { id: 'graph-ml-train', name: 'ML Model Retraining Workflow', description: 'Fetches data, trains model, evaluates, deploys.', nodes: [], edges: [], createdBy: 'user-xyz', createdAt: new Date(), lastModifiedAt: new Date(), lastModifiedBy: 'user-xyz', version: 2, tags: ['ml', 'training', 'deployment'] },
        ];
        dummyGraphs.forEach(g => WorkflowEngine._definedGraphs.set(g.id, g)); // Populate for simulation

        return Array.from(WorkflowEngine._definedGraphs.values()).filter(g =>
            (!userId || g.createdBy === userId) &&
            (!tags || tags.every(tag => g.tags?.includes(tag)))
        );
    },

    /**
     * Visualizes the current state or definition of a computational graph.
     * Returns a representation suitable for a frontend rendering engine.
     */
    getGraphVisualization: async (graphId: UUID): Promise<Record<string, any>> => {
        console.log(`[WorkflowEngine] Generating visualization for graph ${graphId}.`);
        const graph = WorkflowEngine._definedGraphs.get(graphId);
        if (!graph) throw new Error(`Graph ${graphId} not found.`);

        await new Promise(resolve => setTimeout(resolve, 700));
        return {
            type: 'dagre_layout',
            nodes: graph.nodes.map(n => ({ id: n.id, label: n.name || n.type, type: n.type, status: n.status, position: n.position, metadata: { ...n.config, codeSnippet: n.code?.substring(0, 50) + '...' } })),
            edges: graph.edges.map(e => ({ id: e.id, source: e.source, target: e.target, label: e.condition }))
        };
    },

    /**
     * Schedules a graph for recurring execution.
     * @param graphId The ID of the graph.
     * @param scheduleConfig The scheduling configuration (e.g., cron string).
     * @param userId The user setting the schedule.
     */
    scheduleGraph: async (graphId: UUID, scheduleConfig: { cronTab: string; timezone: string }, userId: UUID): Promise<void> => {
        console.log(`[WorkflowEngine] Scheduling graph ${graphId} with cron: ${scheduleConfig.cronTab}.`);
        const graph = WorkflowEngine._definedGraphs.get(graphId);
        if (!graph) throw new Error(`Graph ${graphId} not found.`);

        graph.schedule = { ...scheduleConfig, lastScheduledRun: undefined, nextScheduledRun: new Date(Date.now() + 3600000) }; // Simulate next run 1hr later
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log(`[WorkflowEngine] Graph ${graphId} scheduled.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'user_action',
            timestamp: new Date(),
            userId,
            data: { action: 'schedule_graph', graphId, cronTab: scheduleConfig.cronTab }
        });
    },

    /**
     * Unschedules a graph from recurring execution.
     * @param graphId The ID of the graph.
     * @param userId The user unscheduling.
     */
    unscheduleGraph: async (graphId: UUID, userId: UUID): Promise<void> => {
        console.log(`[WorkflowEngine] Unscheduling graph ${graphId}.`);
        const graph = WorkflowEngine._definedGraphs.get(graphId);
        if (!graph) throw new Error(`Graph ${graphId} not found.`);
        if (!graph.schedule) {
            console.warn(`[WorkflowEngine] Graph ${graphId} is not currently scheduled.`);
            return;
        }

        delete graph.schedule;
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log(`[WorkflowEngine] Graph ${graphId} unscheduled.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'user_action',
            timestamp: new Date(),
            userId,
            data: { action: 'unschedule_graph', graphId }
        });
    }
};

/**
 * Manages user-defined code snippets and reusable utilities.
 */
export const SnippetManager = {
    /**
     * Stores user snippets.
     */
    _userSnippets: new Map<UUID, UserSnippet>(),

    /**
     * Saves a new user code snippet.
     * @param snippet The snippet details.
     * @param userId The user creating the snippet.
     * @returns The ID of the saved snippet.
     */
    saveSnippet: async (snippet: Omit<UserSnippet, 'id' | 'createdAt' | 'lastUsed' | 'usageCount' | 'versionHistory'>, userId: UUID): Promise<UUID> => {
        console.log(`[SnippetManager] Saving new snippet: ${snippet.name} for user ${userId}.`);
        await new Promise(resolve => setTimeout(resolve, 300));
        const id: UUID = `snippet-${Date.now()}`;
        const newSnippet: UserSnippet = {
            ...snippet,
            id,
            createdBy: userId,
            createdAt: new Date(),
            lastUsed: new Date(),
            usageCount: 0,
            versionHistory: [{ timestamp: new Date(), code: snippet.code, message: 'Initial version' }]
        };
        SnippetManager._userSnippets.set(id, newSnippet);
        console.log(`[SnippetManager] Snippet ${id} saved.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'user_action',
            timestamp: new Date(),
            userId,
            data: { action: 'save_snippet', snippetId: id, name: snippet.name, language: snippet.language }
        });
        return id;
    },

    /**
     * Retrieves a user snippet by ID. Increments usage count.
     * @param snippetId The ID of the snippet.
     * @param userId The user requesting the snippet (for access control and usage tracking).
     * @returns The user snippet, or null if not found/unauthorized.
     */
    getSnippet: async (snippetId: UUID, userId?: UUID): Promise<UserSnippet | null> => {
        console.log(`[SnippetManager] Retrieving snippet ${snippetId} for user ${userId || 'unknown'}.`);
        await new Promise(resolve => setTimeout(resolve, 200));
        const snippet = SnippetManager._userSnippets.get(snippetId);
        if (snippet) {
            // Basic access control
            if (snippet.visibility === 'private' && snippet.createdBy !== userId) {
                console.warn(`[SnippetManager] Access denied for snippet ${snippetId} to user ${userId}.`);
                return null;
            }
            // Simulate incrementing usage count (in real system, would be atomic update)
            snippet.usageCount++;
            snippet.lastUsed = new Date();
        }
        return snippet || null;
    },

    /**
     * Lists all snippets for a user, with optional filters.
     * @param userId The ID of the user.
     * @param tags Optional: Filter by tags.
     * @param language Optional: Filter by language.
     * @param visibility Optional: Filter by visibility.
     */
    listSnippets: async (userId: UUID, tags?: string[], language?: KernelEnvironmentType, visibility?: UserSnippet['visibility']): Promise<UserSnippet[]> => {
        console.log(`[SnippetManager] Listing snippets for user ${userId}.`);
        await new Promise(resolve => setTimeout(resolve, 400));
        const dummySnippets: UserSnippet[] = [
            {
                id: 'snippet-example-python',
                name: 'Dataframe Head',
                description: 'Display the first N rows of a pandas DataFrame.',
                code: 'import pandas as pd\ndf.head(10)',
                language: KernelEnvironmentType.Python3,
                tags: ['pandas', 'data-exploration'],
                createdBy: userId,
                createdAt: new Date(),
                lastUsed: new Date(),
                usageCount: 15,
                visibility: 'public',
                versionHistory: [{ timestamp: new Date(), code: 'import pandas as pd\ndf.head()' }]
            },
            {
                id: 'snippet-example-sql',
                name: 'Count Records in Table',
                description: 'Count total records in a table.',
                code: 'SELECT COUNT(*) FROM my_table;',
                language: KernelEnvironmentType.SQL,
                tags: ['sql', 'database'],
                createdBy: userId,
                createdAt: new Date(),
                lastUsed: new Date(),
                usageCount: 8,
                visibility: 'private',
                versionHistory: [{ timestamp: new Date(), code: 'SELECT COUNT(*) FROM my_table;' }]
            }
        ];
        dummySnippets.forEach(s => SnippetManager._userSnippets.set(s.id, s));

        return Array.from(SnippetManager._userSnippets.values()).filter(s =>
            (s.createdBy === userId || s.visibility === 'public' || (s.visibility === 'shared' && s.sharingPermissions?.[userId])) &&
            (!tags || tags.every(tag => s.tags.includes(tag))) &&
            (!language || s.language === language) &&
            (!visibility || s.visibility === visibility)
        );
    },

    /**
     * Updates an existing snippet.
     * @param snippetId The ID of the snippet.
     * @param updates The partial updates to the snippet.
     * @param userId The user performing the update.
     */
    updateSnippet: async (snippetId: UUID, updates: Partial<Omit<UserSnippet, 'id' | 'createdBy' | 'createdAt' | 'usageCount' | 'versionHistory'>>, userId: UUID): Promise<void> => {
        console.log(`[SnippetManager] Updating snippet ${snippetId} by user ${userId}.`);
        const snippet = SnippetManager._userSnippets.get(snippetId);
        if (!snippet) throw new Error(`Snippet ${snippetId} not found.`);
        if (snippet.createdBy !== userId) { // Basic ownership check
            throw new Error('Unauthorized to update this snippet.');
        }

        // Add to version history if code changes
        if (updates.code && updates.code !== snippet.code) {
            snippet.versionHistory?.push({ timestamp: new Date(), code: updates.code, message: updates.description ? `Updated: ${updates.description}` : 'Code updated.' });
            if (snippet.versionHistory && snippet.versionHistory.length > 20) { // Limit history size
                snippet.versionHistory.shift();
            }
        }

        Object.assign(snippet, updates);
        snippet.lastUsed = new Date(); // Treat update as usage
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log(`[SnippetManager] Snippet ${snippetId} updated.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'user_action',
            timestamp: new Date(),
            userId,
            data: { action: 'update_snippet', snippetId, name: snippet.name, updatedFields: Object.keys(updates) }
        });
    },

    /**
     * Deletes a snippet.
     * @param snippetId The ID of the snippet.
     * @param userId The user performing the deletion.
     */
    deleteSnippet: async (snippetId: UUID, userId: UUID): Promise<void> => {
        console.log(`[SnippetManager] Deleting snippet ${snippetId} by user ${userId}.`);
        const snippet = SnippetManager._userSnippets.get(snippetId);
        if (!snippet) throw new Error(`Snippet ${snippetId} not found.`);
        if (snippet.createdBy !== userId) { // Basic ownership check
            throw new Error('Unauthorized to delete this snippet.');
        }

        SnippetManager._userSnippets.delete(snippetId);
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log(`[SnippetManager] Snippet ${snippetId} deleted.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'user_action',
            timestamp: new Date(),
            userId,
            data: { action: 'delete_snippet', snippetId }
        });
    },

    /**
     * Inserts a snippet into the active notebook/editor.
     * (This would typically be handled by a frontend service, but the kernel service might provide the snippet content).
     * @param snippetId The ID of the snippet to insert.
     * @param userId The user inserting the snippet.
     * @returns The code of the snippet.
     */
    insertSnippet: async (snippetId: UUID, userId: UUID): Promise<string | null> => {
        console.log(`[SnippetManager] Preparing snippet ${snippetId} for insertion for user ${userId}.`);
        const snippet = await SnippetManager.getSnippet(snippetId, userId); // getSnippet handles access control and usage count
        if (snippet) {
            console.log(`[SnippetManager] Snippet ${snippetId} retrieved for insertion.`);
            return snippet.code;
        }
        return null;
    }
};

/**
 * Provides an interface to interact with distributed computing resources.
 */
export const DistributedComputeService = {
    /**
     * Stores provisioned cluster configurations.
     */
    _clusters: new Map<UUID, ClusterConfiguration>(),

    /**
     * Stores active distributed jobs.
     */
    _distributedJobs: new Map<UUID, any>(),

    /**
     * Provisions a new distributed compute cluster.
     * @param config The configuration for the cluster.
     * @param userId The user requesting the cluster.
     * @param notebookId Optional: Notebook context for cluster association.
     * @returns The ID of the provisioned cluster.
     */
    provisionCluster: async (config: Omit<ClusterConfiguration, 'id' | 'status' | 'createdBy' | 'createdAt' | 'lastModifiedAt'>, userId: UUID, notebookId?: UUID): Promise<UUID> => {
        console.log(`[DistributedComputeService] Provisioning new cluster: ${config.name} (type: ${config.type}) by user ${userId}.`);
        await new Promise(resolve => setTimeout(resolve, 15000)); // Simulate long provisioning time
        const clusterId: UUID = `cluster-${Date.now()}`;
        const newCluster: ClusterConfiguration = {
            ...config,
            id: clusterId,
            status: 'running',
            createdBy: userId,
            createdAt: new Date(),
            lastModifiedAt: new Date(),
            associatedNotebooks: notebookId ? [notebookId] : []
        };
        DistributedComputeService._clusters.set(clusterId, newCluster);
        console.log(`[DistributedComputeService] Cluster ${clusterId} provisioned and running.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'system_event',
            timestamp: new Date(),
            userId,
            notebookId,
            data: { action: 'provision_cluster', clusterId, type: config.type, name: config.name, resources: config.config }
        });
        return clusterId;
    },

    /**
     * Decommissions an existing distributed compute cluster.
     * @param clusterId The ID of the cluster to decommission.
     * @param userId The user requesting decommissioning.
     */
    decommissionCluster: async (clusterId: UUID, userId: UUID): Promise<void> => {
        console.log(`[DistributedComputeService] Decommissioning cluster ${clusterId} by user ${userId}.`);
        const cluster = DistributedComputeService._clusters.get(clusterId);
        if (!cluster) throw new Error(`Cluster ${clusterId} not found.`);

        cluster.status = 'decommissioning';
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'system_event',
            timestamp: new Date(),
            userId,
            data: { action: 'decommission_cluster', clusterId, status: 'decommissioning' }
        });
        await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate decommissioning time
        DistributedComputeService._clusters.delete(clusterId);
        console.log(`[DistributedComputeService] Cluster ${clusterId} decommissioned.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'system_event',
            timestamp: new Date(),
            userId,
            data: { action: 'decommission_cluster', clusterId, status: 'completed' }
        });
    },

    /**
     * Gets the status of a distributed compute cluster.
     */
    getClusterStatus: async (clusterId: UUID): Promise<ClusterConfiguration | null> => {
        console.log(`[DistributedComputeService] Getting status for cluster ${clusterId}.`);
        await new Promise(resolve => setTimeout(resolve, 500));
        const cluster = DistributedComputeService._clusters.get(clusterId);
        if (cluster) {
            // Simulate dynamic status/metrics update
            if (cluster.status === 'running') {
                cluster.status = Math.random() < 0.05 ? 'scaling' : 'running'; // Small chance of scaling
            }
            cluster.lastModifiedAt = new Date();
        }
        return cluster || null;
    },

    /**
     * Lists all provisioned distributed compute clusters.
     * @param userId Optional: Filter by user.
     * @param type Optional: Filter by cluster type.
     */
    listClusters: async (userId?: UUID, type?: ClusterConfiguration['type']): Promise<ClusterConfiguration[]> => {
        console.log(`[DistributedComputeService] Listing clusters for user ${userId || 'all'} (type: ${type || 'all'}).`);
        await new Promise(resolve => setTimeout(resolve, 300));
        return Array.from(DistributedComputeService._clusters.values()).filter(c =>
            (!userId || c.createdBy === userId) &&
            (!type || c.type === type)
        );
    },

    /**
     * Submits a job to a distributed compute cluster.
     * @param clusterId The ID of the cluster.
     * @param jobCode The code to execute on the cluster (e.g., Spark job, Dask graph).
     * @param language The language of the job code.
     * @param jobConfig Specific configuration for the job (e.g., number of executors, entry point).
     * @param userId The user submitting the job.
     * @returns The ID of the submitted job.
     */
    submitJob: async (clusterId: UUID, jobCode: string, language: KernelEnvironmentType, jobConfig?: Record<string, any>, userId?: UUID): Promise<UUID> => {
        console.log(`[DistributedComputeService] Submitting ${language} job to cluster ${clusterId} by user ${userId}.`);
        const cluster = DistributedComputeService._clusters.get(clusterId);
        if (!cluster || cluster.status !== 'running') {
            throw new Error(`Cluster ${clusterId} not found or not in running state.`);
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
        const jobId: UUID = `dist-job-${Date.now()}`;
        const newJob = {
            id: jobId,
            clusterId,
            language,
            status: 'running',
            progress: 0,
            startTime: new Date(),
            createdBy: userId,
            config: jobConfig,
            logs: []
        };
        DistributedComputeService._distributedJobs.set(jobId, newJob);
        console.log(`[DistributedComputeService] Job ${jobId} submitted to cluster ${clusterId}.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'system_event',
            timestamp: new Date(),
            userId,
            data: { action: 'submit_distributed_job', jobId, clusterId, language, codeLength: jobCode.length }
        });

        // Simulate job execution and updates
        setTimeout(async () => {
            newJob.logs.push(`[${new Date().toISOString()}] Job ${jobId} started on cluster ${clusterId}.`);
            for (let i = 0; i <= 100; i += 20) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                newJob.progress = i;
                newJob.logs.push(`[${new Date().toISOString()}] Progress: ${i}%`);
                TelemetryService.emitEvent({
                    id: `tele-${Date.now()}`,
                    type: 'workflow_status',
                    timestamp: new Date(),
                    userId,
                    data: { action: 'distributed_job_progress', jobId, clusterId, progress: i }
                });
            }
            newJob.status = 'completed';
            newJob.progress = 100;
            newJob.endTime = new Date();
            newJob.logs.push(`[${new Date().toISOString()}] Job ${jobId} completed.`);
            TelemetryService.emitEvent({
                id: `tele-${Date.now()}`,
                type: 'workflow_status',
                timestamp: new Date(),
                userId,
                data: { action: 'distributed_job_completed', jobId, clusterId, status: 'completed' }
            });
        }, 100);

        return jobId;
    },

    /**
     * Gets the status and logs of a submitted distributed job.
     */
    getJobStatus: async (jobId: UUID): Promise<any> => {
        console.log(`[DistributedComputeService] Getting status for job ${jobId}.`);
        await new Promise(resolve => setTimeout(resolve, 100));
        return DistributedComputeService._distributedJobs.get(jobId) || null;
    },

    /**
     * Cancels an ongoing distributed job.
     */
    cancelJob: async (jobId: UUID, userId: UUID): Promise<void> => {
        console.log(`[DistributedComputeService] Cancelling distributed job ${jobId} by user ${userId}.`);
        const job = DistributedComputeService._distributedJobs.get(jobId);
        if (!job) throw new Error(`Job ${jobId} not found.`);
        if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
            console.warn(`[DistributedComputeService] Job ${jobId} is already in a terminal state.`);
            return;
        }
        job.status = 'cancelled';
        job.endTime = new Date();
        job.logs.push(`[${new Date().toISOString()}] Job ${jobId} cancelled by user ${userId}.`);
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`[DistributedComputeService] Distributed job ${jobId} cancelled.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'workflow_status',
            timestamp: new Date(),
            userId,
            data: { action: 'distributed_job_cancelled', jobId }
        });
    }
};


// --- The Expanded KernelService (Central Hub) ---

export const KernelService = {
    /**
     * The original execute method, now potentially routing to a session.
     * For backward compatibility or ad-hoc, non-session-bound execution.
     * @param code The code string to execute.
     * @param userId Optional: The user executing the code.
     * @param notebookId Optional: The notebook context.
     * @returns A promise that resolves with the primary output string.
     */
    execute: async (code: string, userId?: UUID, notebookId?: UUID): Promise<string> => {
        console.log(`[KernelService] Legacy execute call: ${code}`);
        // This is a simplified fallback/legacy path.
        // In a full system, even this would likely acquire a temporary kernel session or use a default one.
        let sessionId: UUID | undefined;
        try {
            // Attempt to find or start a default session for the user/notebook
            const existingSessions = await KernelManager.listKernelSessions(userId, notebookId, KernelStatus.Idle);
            if (existingSessions.length > 0) {
                sessionId = existingSessions[0].id;
            } else {
                const defaultKernelSpec = AvailableKernelSpecs.python3; // Assume Python3 as default for ad-hoc
                const session = await KernelManager.startKernel(notebookId || 'ad-hoc-notebook', userId || 'anonymous', defaultKernelSpec);
                sessionId = session.id;
            }

            const result = await KernelService.executeInSession(sessionId, code, {
                sessionId,
                timeoutMs: 5000, // Short timeout for ad-hoc
                storeHistory: false,
                richOutput: false,
            });

            if (result.status === 'success') {
                // Prioritize text/plain from execute_result, then stdout, then any output
                const primaryOutput = result.outputs.find(o => o.type === 'execute_result' && o.content['text/plain'])?.content['text/plain'] || result.stdout || result.outputs[0]?.content?.text || `Execution finished with status: ${result.status}.`;
                return primaryOutput;
            } else {
                return `Execution finished with status: ${result.status}. ${result.stderr || result.errorDetails?.message || ''}`;
            }

        } catch (e: any) {
            console.error(`[KernelService] Error during legacy execute: ${e.message}`);
            TelemetryService.emitEvent({
                id: `tele-${Date.now()}`,
                type: 'error',
                timestamp: new Date(),
                userId,
                notebookId,
                data: { error: 'LegacyExecutionFailed', message: e.message, codeSnippet: code.substring(0, 100) },
                severity: 'error'
            });
            return `Execution failed: ${e.message}`;
        }
    },

    /**
     * Executes code within a specific active kernel session, providing richer output and control.
     * This is the primary execution method for the "universe".
     * @param sessionId The ID of the kernel session to use.
     * @param code The code string to execute.
     * @param options Execution options (timeout, streaming handler, etc.).
     * @returns A promise that resolves with the detailed execution result.
     */
    executeInSession: async (sessionId: UUID, code: string, options?: ExecuteOptions): Promise<ExecutionResult> => {
        console.log(`[KernelService] Executing code in session ${sessionId}: ${code.substring(0, 100)}...`);
        const session = await KernelManager.getKernelSession(sessionId);
        if (!session) {
            const errorResult: ExecutionResult = {
                executionId: `exec-${Date.now()}`,
                status: 'error',
                outputs: [{ type: 'error', content: { name: 'KernelNotFound', message: `Session ${sessionId} not found.` }, timestamp: new Date() }],
                durationMs: 0,
                stderr: `Error: Session ${sessionId} not found.`,
                errorDetails: { name: 'KernelNotFound', message: `Session ${sessionId} not found.`, stacktrace: [] }
            };
            TelemetryService.emitEvent({
                id: `tele-${Date.now()}`,
                type: 'execution_end',
                timestamp: new Date(),
                sessionId,
                cellId: options?.cellId,
                data: { status: 'error', durationMs: 0, error: 'KernelNotFound' },
                severity: 'error'
            });
            return errorResult;
        }

        // Pre-execution security scan
        const securityIssues = await SecurityService.scanCodeForVulnerabilities(code, { language: session.environment, notebookId: session.notebookId }, session.userId);
        if (securityIssues.some(issue => issue.severity === 'critical' || issue.severity === 'high')) {
            const criticalIssue = securityIssues.find(issue => issue.severity === 'critical' || issue.severity === 'high');
            const errorResult: ExecutionResult = {
                executionId: `exec-${Date.now()}`,
                status: 'error',
                outputs: [{ type: 'error', content: { name: 'SecurityViolation', message: `Execution blocked due to critical security vulnerability: ${criticalIssue?.message}` }, timestamp: new Date() }],
                durationMs: 0,
                stderr: `Error: Execution blocked due to critical security vulnerability detected in code.`,
                errorDetails: { name: 'SecurityViolation', message: `Critical security vulnerability detected: ${criticalIssue?.message}`, stacktrace: securityIssues.map(i => `[${i.severity}] L${i.line}: ${i.message}`) }
            };
            TelemetryService.emitEvent({
                id: `tele-${Date.now()}`,
                type: 'execution_end',
                timestamp: new Date(),
                sessionId,
                cellId: options?.cellId,
                data: { status: 'error', durationMs: 0, error: 'SecurityViolation', securityIssues: securityIssues.length },
                severity: 'critical'
            });
            return errorResult;
        }

        const executionId: UUID = `exec-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const startTime = Date.now();
        const outputMessages: OutputMessage[] = [];
        const traceId = `trace-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`; // For distributed tracing

        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'execution_start',
            timestamp: new Date(),
            sessionId,
            userId: session.userId,
            notebookId: session.notebookId,
            cellId: options?.cellId,
            traceId,
            data: { codeLength: code.length, timeout: options?.timeoutMs, priority: options?.priority }
        });

        // Simulate kernel busy status
        session.status = KernelStatus.Busy;
        options?.outputStreamHandler?.({ type: 'status', content: { executionId, status: 'busy' }, timestamp: new Date(), traceId });

        let finalStatus: ExecutionResult['status'] = 'success';
        let stdoutBuffer: string[] = [];
        let stderrBuffer: string[] = [];
        let errorDetails: ExecutionResult['errorDetails'];
        let returnValue: any;
        let warnings: string[] = securityIssues.filter(i => i.severity === 'low' || i.severity === 'medium').map(i => `[Code Warning: ${i.severity}] L${i.line}: ${i.message}`);

        const simulatedExecution = new Promise<void>(async (resolve, reject) => {
            const timeout = options?.timeoutMs || 60000; // Default 60 seconds
            let timer: NodeJS.Timeout | undefined;

            const interruptListener = () => {
                clearTimeout(timer);
                finalStatus = 'interrupted';
                reject(new Error('Execution interrupted by user.'));
            };

            // This is a placeholder for actual kernel interrupt listener registration
            // process.on('SIGINT', interruptListener); // Not suitable for browser context

            timer = setTimeout(() => {
                finalStatus = 'timeout';
                reject(new Error('Execution timed out.'));
            }, timeout);

            try {
                // Simulate various output types and processing logic
                await new Promise(innerResolve => setTimeout(innerResolve, 500)); // Initial processing
                const initialLogMessage: OutputMessage = { type: 'stream', content: { name: 'stdout', text: `Running code for kernel ${session.environment} (Execution ID: ${executionId})...\n` }, timestamp: new Date(), outputId: `out-${Date.now()}-1`, traceId };
                options?.outputStreamHandler?.(initialLogMessage);
                outputMessages.push(initialLogMessage);
                stdoutBuffer.push(initialLogMessage.content.text);

                if (code.includes('import matplotlib.pyplot as plt') || code.includes('generate_plot()')) {
                    await new Promise(innerResolve => setTimeout(innerResolve, 1000));
                    const plotOutput: OutputMessage = { type: 'display_data', content: { 'image/png': 'base64_encoded_plot_image_data_simulated', 'text/plain': '<Figure size 640x480 with 1 Axes>' }, metadata: { width: 640, height: 480 }, timestamp: new Date(), outputId: `out-${Date.now()}-2`, traceId };
                    options?.outputStreamHandler?.(plotOutput);
                    outputMessages.push(plotOutput);
                }

                if (code.includes('update_display_data')) {
                    await new Promise(innerResolve => setTimeout(innerResolve, 1000));
                    const initialUpdateOutput: OutputMessage = { type: 'display_data', content: { 'text/html': '<div>Initial interactive output</div>' }, outputId: `interactive-output-${options?.cellId || Date.now()}`, timestamp: new Date(), traceId };
                    options?.outputStreamHandler?.(initialUpdateOutput);
                    outputMessages.push(initialUpdateOutput);

                    await new Promise(innerResolve => setTimeout(innerResolve, 1500));
                    const updatedOutput: OutputMessage = { type: 'update_display_data', content: { 'text/html': '<div>Updated interactive output after computation!</div>' }, parentId: initialUpdateOutput.outputId, timestamp: new Date(), outputId: `interactive-output-${options?.cellId || Date.now()}-update`, traceId };
                    options?.outputStreamHandler?.(updatedOutput);
                    outputMessages.push(updatedOutput); // Store the update too, for history
                }

                if (code.includes('raise Exception("Simulated error")') || code.includes('error_occurred')) {
                    finalStatus = 'error';
                    errorDetails = { name: 'SimulatedExecutionError', message: 'An intentional error occurred during execution.', stacktrace: ['  File "<stdin>", line 1, in <module>', 'Exception: Simulated error'], errorCode: 'ERR-001' };
                    const errorOutput: OutputMessage = { type: 'error', content: errorDetails, timestamp: new Date(), outputId: `out-${Date.now()}-3`, traceId };
                    options?.outputStreamHandler?.(errorOutput);
                    stderrBuffer.push(`SimulatedExecutionError: An intentional error occurred during execution.\n`);
                    outputMessages.push(errorOutput);
                    throw new Error('Simulated error.'); // Re-throw to exit promise
                }

                if (code.includes('input("Enter something: ")') && options?.allowInput) {
                    const inputPrompt: OutputMessage = { type: 'stream', content: { name: 'stdout', text: 'Kernel is requesting input. Please provide input in the UI. (Simulated prompt)\n' }, timestamp: new Date(), traceId };
                    options?.outputStreamHandler?.(inputPrompt);
                    stdoutBuffer.push(inputPrompt.content.text);

                    // In a real system, this would block and wait for user input from the frontend.
                    // For this simulation, we'll just provide a dummy input after a delay.
                    await new Promise(innerResolve => setTimeout(innerResolve, 2000));
                    const inputReceived: OutputMessage = { type: 'stream', content: { name: 'stdin', text: 'dummy input received\n' }, timestamp: new Date(), traceId };
                    options?.outputStreamHandler?.(inputReceived);
                    stdoutBuffer.push('User entered: "dummy input"\n');
                } else if (code.includes('input("Enter something: ")') && !options?.allowInput) {
                    throw new Error('Kernel requested input but `allowInput` was set to false or not provided.');
                }

                // Simulate execution time remaining after initial steps
                const remainingTime = timeout - (Date.now() - startTime) - 500; // Leave 500ms for finalization
                if (remainingTime > 0) {
                    await new Promise(innerResolve => setTimeout(innerResolve, remainingTime));
                }

                if (finalStatus !== 'timeout' && finalStatus !== 'error' && finalStatus !== 'interrupted') {
                    const outputValue = code.includes('return') ? code.match(/return\s+(.*)/)?.[1] || 'Simulated return value.' :
                                       code.includes('print(') ? code.match(/print\("([^"]*)"\)/)?.[1] || 'Simulated print output.' :
                                       'Final result of computation.';
                    const executeResult: OutputMessage = { type: 'execute_result', content: { 'text/plain': outputValue, 'application/json': { value: outputValue, type: 'string' } }, metadata: {}, timestamp: new Date(), outputId: `out-${Date.now()}-4`, traceId };
                    options?.outputStreamHandler?.(executeResult);
                    stdoutBuffer.push(outputValue + '\n');
                    outputMessages.push(executeResult);
                    returnValue = outputValue;
                }

                clearTimeout(timer);
                resolve();

            } catch (err: any) {
                clearTimeout(timer);
                finalStatus = finalStatus === 'timeout' ? 'timeout' : (finalStatus === 'interrupted' ? 'interrupted' : 'error');
                errorDetails = errorDetails || { name: err.name || 'ExecutionError', message: err.message || 'An unexpected error occurred.', stacktrace: (err.stack || '').split('\n') };
                stderrBuffer.push(`Error: ${err.message}\n`);
                const finalErrorOutput: OutputMessage = { type: 'error', content: errorDetails, timestamp: new Date(), outputId: `out-${Date.now()}-final-error`, traceId };
                options?.outputStreamHandler?.(finalErrorOutput);
                outputMessages.push(finalErrorOutput);
                reject(err);
            } finally {
                // process.off('SIGINT', interruptListener);
            }
        });

        try {
            await simulatedExecution;
        } catch (e) {
            // Error already handled within simulatedExecution to set finalStatus and errorDetails
        } finally {
            const durationMs = Date.now() - startTime;
            // Simulate kernel idle status, unless it was dead or in error state
            if (session.status !== KernelStatus.Dead && finalStatus !== 'error' && finalStatus !== 'interrupted') {
                 session.status = KernelStatus.Idle;
            }
            session.lastActivity = new Date();
            options?.outputStreamHandler?.({ type: 'status', content: { executionId, status: session.status }, timestamp: new Date(), traceId });

            const result: ExecutionResult = {
                executionId,
                status: finalStatus,
                outputs: outputMessages,
                durationMs,
                stdout: stdoutBuffer.join(''),
                stderr: stderrBuffer.join(''),
                returnValue: returnValue,
                errorDetails: errorDetails,
                metrics: {
                    cpuTimeMs: Math.random() * durationMs * 0.8, // 80% of wall time
                    memoryPeakMB: Math.random() * session.kernelSpec.resources.memoryGB! * 1024 * 0.5 + 128,
                    networkBytesSent: Math.random() * 50000,
                    networkBytesReceived: Math.random() * 100000,
                },
                warnings: warnings.length > 0 ? warnings : undefined,
                artifacts: code.includes('save_model') ? [{ type: 'model', name: 'my_model', uri: `/models/${executionId}/model.pkl` }] : undefined,
            };

            TelemetryService.emitEvent({
                id: `tele-${Date.now()}`,
                type: 'execution_end',
                timestamp: new Date(),
                sessionId,
                userId: session.userId,
                notebookId: session.notebookId,
                cellId: options?.cellId,
                traceId,
                data: { status: finalStatus, durationMs, codeLength: code.length, error: errorDetails?.name },
                severity: finalStatus === 'error' ? 'error' : (warnings.length > 0 ? 'warning' : 'info')
            });

            options?.onCompletion?.(result); // Call external completion handler
            return result;
        }
    },

    /**
     * The `KernelManager` sub-service.
     * Manages kernel lifecycle: starting, stopping, listing, and health checks.
     */
    KernelManager: KernelManager,

    /**
     * The `KernelSpecManager` sub-service.
     * Manages the registration and retrieval of kernel specifications.
     */
    KernelSpecManager: KernelSpecManager,

    /**
     * The `EnvironmentManager` sub-service.
     * Manages environment setup and dependencies for kernels.
     */
    EnvironmentManager: EnvironmentManager,

    /**
     * The `DataIntegrationService` sub-service.
     * Manages connections and interactions with external data sources.
     */
    DataIntegrationService: DataIntegrationService,

    /**
     * The `AICodeCompanion` sub-service.
     * Provides AI-powered assistance for code generation, explanation, debugging, etc.
     */
    AICodeCompanion: AICodeCompanion,

    /**
     * The `SecurityService` sub-service.
     * Handles security aspects like sandboxing, credential management, and access control.
     */
    SecurityService: SecurityService,

    /**
     * The `TelemetryService` sub-service.
     * Handles logging, metrics, and event tracking for system observability.
     */
    TelemetryService: TelemetryService,

    /**
     * The `PluginManager` sub-service.
     * Manages the plugin system for extending kernel functionalities.
     */
    PluginManager: PluginManager,

    /**
     * The `WorkflowEngine` sub-service.
     * Manages complex computational graphs and workflows.
     */
    WorkflowEngine: WorkflowEngine,

    /**
     * The `SnippetManager` sub-service.
     * Manages user-defined code snippets and reusable utilities.
     */
    SnippetManager: SnippetManager,

    /**
     * The `DistributedComputeService` sub-service.
     * Provides an interface to interact with distributed computing resources.
     */
    DistributedComputeService: DistributedComputeService,

    // --- Additional high-level APIs for a complete "universe" ---

    /**
     * Sets up a real-time collaborative session for a notebook.
     * This would involve WebSocket connections and state synchronization with a CollaborationService.
     * @param notebookId The ID of the notebook.
     * @param userId The ID of the user initiating collaboration.
     * @param permissions Optional: specific user permissions for the session.
     * @returns A promise resolving to a collaboration session ID.
     */
    startCollaborationSession: async (notebookId: UUID, userId: UUID, permissions?: Record<UUID, 'read' | 'write' | 'execute'>): Promise<UUID> => {
        console.log(`[KernelService] Starting collaboration session for notebook ${notebookId} by user ${userId}.`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        const collabId: UUID = `collab-${Date.now()}`;
        // In a real system, this would register with a central collaboration service,
        // which then informs frontends to open WebSocket connections.
        console.log(`[KernelService] Collaboration session ${collabId} started.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'user_action',
            timestamp: new Date(),
            userId,
            notebookId,
            data: { action: 'start_collaboration_session', collabId, initialPermissions: permissions ? Object.keys(permissions).length : 'default' }
        });
        return collabId;
    },

    /**
     * Allows a user to join an existing collaborative session.
     * @param collabSessionId The ID of the collaboration session.
     * @param userId The ID of the joining user.
     * @returns True if joined successfully.
     */
    joinCollaborationSession: async (collabSessionId: UUID, userId: UUID): Promise<boolean> => {
        console.log(`[KernelService] User ${userId} attempting to join collaboration session ${collabSessionId}.`);
        // In a real system, this would involve access checks via SecurityService
        const accessGranted = await SecurityService.checkAccess(userId, 'collaboration_session', collabSessionId, 'join');
        if (!accessGranted) {
            console.warn(`[KernelService] User ${userId} denied access to join session ${collabSessionId}.`);
            return false;
        }

        await new Promise(resolve => setTimeout(resolve, 800));
        // Simulate adding user to session's connected clients (at a CollaborationService level, not kernel level)
        console.log(`[KernelService] User ${userId} joined session ${collabSessionId}.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'user_action',
            timestamp: new Date(),
            userId,
            data: { action: 'join_collaboration_session', collabId: collabSessionId }
        });
        return true;
    },

    /**
     * Generates a unique, short-lived sharing link for a notebook or specific output.
     * @param resourceId The ID of the notebook, cell, or output to share.
     * @param userId The user generating the link.
     * @param expirationMinutes How long the link is valid.
     * @param accessPermissions Optional: specific permissions for the link.
     * @returns A promise resolving to the sharing URL.
     */
    generateShareLink: async (resourceId: UUID, userId: UUID, expirationMinutes: number = 60, accessPermissions?: { readOnly?: boolean; allowExecution?: boolean; }): Promise<string> => {
        console.log(`[KernelService] Generating share link for ${resourceId} (user: ${userId}) valid for ${expirationMinutes} mins.`);
        // Integrate with a dedicated SharingService
        await new Promise(resolve => setTimeout(resolve, 700));
        const shareToken = `share-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const shareUrl = `https://notebook.google.com/share/${shareToken}?resource=${resourceId}`;
        console.log(`[KernelService] Share link generated: ${shareUrl}`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'user_action',
            timestamp: new Date(),
            userId,
            data: { action: 'generate_share_link', resourceId, expirationMinutes, permissions: accessPermissions }
        });
        return shareUrl;
    },

    /**
     * Deploys a notebook as an interactive application (e.g., dashboard, API endpoint, scheduled report).
     * @param notebookId The ID of the notebook to deploy.
     * @param deploymentConfig Configuration for the deployment (e.g., type, resources, endpoint name).
     * @param userId The user initiating the deployment.
     * @returns A promise resolving to the deployed application details.
     */
    deployNotebookAsApplication: async (notebookId: UUID, deploymentConfig: Omit<DeployedApplication, 'id' | 'sourceNotebookId' | 'status' | 'createdBy' | 'createdAt' | 'lastUpdated' | 'deploymentUrl'>, userId: UUID): Promise<DeployedApplication> => {
        console.log(`[KernelService] Deploying notebook ${notebookId} as application '${deploymentConfig.name}' by user ${userId}.`);
        // This is a complex operation that would orchestrate container builds, serverless deployments, etc.
        await new Promise(resolve => setTimeout(resolve, 20000)); // Simulate long deployment time

        const deploymentId: UUID = `app-${Date.now()}`;
        const deploymentUrl = deploymentConfig.type === 'api' ? `https://api.notebook.google.com/${deploymentId}` : `https://dashboard.notebook.google.com/${deploymentId}`;
        const deployedApp: DeployedApplication = {
            id: deploymentId,
            sourceNotebookId: notebookId,
            deploymentUrl,
            status: 'deployed',
            createdBy: userId,
            createdAt: new Date(),
            lastUpdated: new Date(),
            ...deploymentConfig,
        };
        // In a real system, this would store the deployed app config and status in a dedicated service
        console.log(`[KernelService] Notebook ${notebookId} deployed as application '${deploymentConfig.name}' to ${deploymentUrl}.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'user_action',
            timestamp: new Date(),
            userId,
            notebookId,
            data: { action: 'deploy_application', deploymentId, name: deploymentConfig.name, type: deploymentConfig.type, url: deploymentUrl }
        });
        return deployedApp;
    },

    /**
     * Manages version control integration for notebooks (e.g., Git).
     * @param notebookId The ID of the notebook.
     * @param action The VCS action to perform ('clone', 'push', 'pull', 'commit', 'status').
     * @param config Optional: VCS specific configuration (e.g., commit message, branch).
     * @param userId The user performing the action.
     * @returns A promise resolving to the result of the VCS operation.
     */
    performVersionControlAction: async (notebookId: UUID, action: 'clone' | 'push' | 'pull' | 'commit' | 'status' | 'init', config?: Record<string, any>, userId?: UUID): Promise<any> => {
        console.log(`[KernelService] User ${userId} performing VCS action '${action}' on notebook ${notebookId}.`);
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000)); // Simulate network/git ops
        const vcsContext: VersionControlContext = {
            id: `vcs-ctx-${notebookId}`,
            repositoryUrl: config?.repositoryUrl || 'https://github.com/user/notebooks.git',
            branch: config?.branch || 'main',
            credentialsId: 'user-git-cred', // Hypothetical credential
            lastSyncTime: new Date(),
            status: 'synced',
            localPath: `/workspace/${notebookId}`
        };

        let result: any = { status: 'success', message: `${action} completed.` };

        switch (action) {
            case 'clone':
                result.message = `Repository cloned to ${vcsContext.localPath}.`;
                break;
            case 'commit':
                result.message = `Changes committed with message: "${config?.message || 'Auto-commit'}".`;
                break;
            case 'push':
                result.message = `Changes pushed to ${vcsContext.repositoryUrl}/${vcsContext.branch}.`;
                break;
            case 'pull':
                result.message = `Changes pulled from remote.`;
                break;
            case 'status':
                result.status = Math.random() > 0.8 ? 'diverged' : 'synced';
                result.changes = Math.random() > 0.5 ? ['notebook.ipynb (modified)', 'data.csv (added)'] : [];
                break;
            case 'init':
                result.message = `New Git repository initialized for notebook.`;
                break;
        }

        console.log(`[KernelService] VCS action '${action}' on notebook ${notebookId} completed: ${result.message}`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'user_action',
            timestamp: new Date(),
            userId,
            notebookId,
            data: { action: `vcs_${action}`, status: result.status, repo: vcsContext.repositoryUrl, branch: vcsContext.branch }
        });
        return result;
    },

    /**
     * Initializes the entire Kernel Service universe, loading plugins, configurations, etc.
     * This method would be called once on application startup.
     */
    initializeUniverse: async (): Promise<void> => {
        console.log(`[KernelService] Initializing the Engine of Discovery universe...`);
        // Simulate loading critical components, configurations, and default plugins
        await Promise.allSettled([
            KernelSpecManager.listKernelSpecs(), // Pre-load specs
            EnvironmentManager.listEnvironments(), // Pre-load environments
            DataIntegrationService.listDataSources(), // Pre-load data sources
            DistributedComputeService.listClusters(), // Pre-load clusters
            WorkflowEngine.listGraphs(), // Pre-load workflows
            SnippetManager.listSnippets('system_user'), // Pre-load global snippets
            PluginManager.registerPlugin({ name: 'DefaultOutputRenderer', type: 'output_renderer', config: {}, version: '1.0' }, 'system'),
            PluginManager.registerPlugin({ name: 'AICoreExtension', type: 'ai_tool', config: { model: 'DeepThinker-v7.3-Pro' }, version: '1.2', entryPoint: 'ai-core.js' }, 'system'),
            PluginManager.registerPlugin({ name: 'GCPStorageConnector', type: 'data_connector', config: { service: 'GCS' }, version: '1.0' }, 'system'),
            PluginManager.loadPlugin('plugin-default-output-renderer', 'system').catch(e => console.warn(`Failed to load default renderer plugin: ${e.message}`)),
            PluginManager.loadPlugin('plugin-ai-core').catch(e => console.warn(`Failed to load AI core plugin: ${e.message}`)),
        ]);
        console.log(`[KernelService] Engine of Discovery universe initialized and ready for incantations.`);
        TelemetryService.emitEvent({
            id: `tele-${Date.now()}`,
            type: 'system_event',
            timestamp: new Date(),
            data: { action: 'universe_initialized', version: '10.0-Titan' }
        });
    }
};