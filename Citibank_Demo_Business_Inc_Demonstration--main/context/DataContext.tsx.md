```tsx
import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback, useMemo } from 'react';
import produce, { enableMapSet, enablePatches, applyPatches, Patch, produceWithPatches } from 'immer'; // For immutable state updates and patch management
import { nanoid } from 'nanoid'; // For unique IDs
import isEqual from 'lodash.isequal'; // For deep comparison of state changes

// Enable Immer features for Map and Set and patch generation/application
enableMapSet();
enablePatches();

// --- 0. Core Configuration & Constants (Year 10: Advanced Deployment Profiles) ---
export const AppConfig = {
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://api.realitycore.io/v1',
    DEFAULT_TENANT_ID: 'global-reality-corp',
    AUDIT_LOG_RETENTION_DAYS: 3650, // 10 years of audit logs
    MAX_REALTIME_SUBSCRIPTIONS: 500,
    OFFLINE_SYNC_INTERVAL_MS: 300000, // 5 minutes
    CACHE_EXPIRATION_MS: 3600000, // 1 hour for entity caches
    ENABLE_AI_CO_PILOT_ASSISTANCE: true,
    MAX_TRANSACTION_BATCH_SIZE: 1000,
    SCHEMA_VERSION: '10.24.7', // Current active schema version
    HISTORY_SNAPSHOT_DEPTH: 100, // Number of states to keep for undo/redo
    OPTIMISTIC_UPDATE_TIMEOUT_MS: 5000, // Max time to wait for server confirm for optimistic update
    MAX_API_RETRIES: 3,
    API_RETRY_DELAY_MS: 1000,
    I18N_DEFAULT_LOCALE: 'en-US',
    ENABLE_AB_TESTING: true,
    ENABLE_FEATURE_FLAGS: true,
    ENABLE_METRICS_REPORTING: true,
    REALTIME_WS_URL: process.env.REACT_APP_REALTIME_WS_URL || 'wss://ws.realitycore.io/v1/stream',
};

// --- 1. Foundational Type Definitions (Year 1: Core Entity Structures) ---

// Base Entity with common metadata
export interface BaseEntity {
    id: string;
    createdAt: string; // ISO 8601 string
    updatedAt: string; // ISO 8601 string
    createdBy: string; // User ID or System ID
    updatedBy: string; // User ID or System ID
    version: number; // Optimistic concurrency control (for server-side validation)
    tenantId: string;
    isArchived: boolean;
    status: 'active' | 'pending' | 'draft' | 'archived' | 'deleted' | 'error' | 'reverted';
    tags: string[];
    metadata: Record<string, any>; // Arbitrary metadata store
    accessControlList?: { userId?: string; roleId?: string; permissions: string[]; }[]; // Year 6: Inline ACL
    encryptedFields?: string[]; // Year 9: Data at rest encryption indicators
}

// User Profile Entity (Year 1: Core User Management)
export interface UserProfile extends BaseEntity {
    type: 'UserProfile';
    username: string;
    email: string;
    roles: string[]; // e.g., 'admin', 'editor', 'viewer', 'auditor', 'ai_agent'
    permissions: string[]; // Fine-grained permissions (can be aggregated from roles/groups)
    settings: {
        theme: 'dark' | 'light' | 'system';
        locale: string;
        timezone: string;
        notifications: { email: boolean; push: boolean; sms: boolean; };
        preferredAIModels: string[]; // User preference for AI models
        accessibilityOptions: { highContrast: boolean; largeText: boolean; screenReader: boolean; }; // Year 8: Accessibility
    };
    lastLogin: string | null;
    oauthProviders: { provider: string; externalId: string; }[];
    twoFactorEnabled: boolean;
    biometricKeys: string[]; // Encrypted biometric keys
    profileImageUrl: string | null;
    publicBio: string;
}

// Transaction Entity (Year 1: Core Financial/Operational Data)
export interface Transaction extends BaseEntity {
    type: 'Transaction';
    amount: number;
    currency: string;
    description: string;
    transactionType: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'refund' | 'adjustment';
    categoryId: string; // Reference to a Category entity
    accountId: string; // Reference to an Account entity
    peerId: string | null; // Reference to another UserProfile or Organization entity
    timestamp: string;
    notes: string;
    receiptUrl: string | null;
    geotag: { latitude: number; longitude: number; accuracy?: number; } | null;
    associatedEvents: string[]; // IDs of related EventLog entries
    ai_insights: string[]; // AI-generated insights/labels
    auditTrailId: string; // Link to a comprehensive audit trail entry
    sourceSystem: string; // e.g., 'API', 'Manual', 'BankSync'
}

// Covenant Entity (Year 1: Contract/Agreement Management)
export interface Covenant extends BaseEntity {
    type: 'Covenant';
    name: string;
    description: string;
    terms: string; // Markdown or rich text, potentially versioned
    parties: { entityId: string; entityType: 'UserProfile' | 'Organization' | 'Agent'; role: string; signatureDate?: string; }[];
    startDate: string;
    endDate: string | null;
    status: 'active' | 'pending' | 'fulfilled' | 'breached' | 'terminated' | 'under_review';
    legalDocumentUrl: string | null;
    reviewCycleDays: number;
    nextReviewDate: string | null;
    complianceChecks: { checkId: string; status: 'pass' | 'fail' | 'na'; lastChecked: string; findings?: string[]; }[];
    documentHash: string | null; // For verifying document integrity (Year 9)
    relatedCovenants: string[]; // Link to other covenants
}

// Objective Entity (Year 1: Goal/OKR Management)
export interface Objective extends BaseEntity {
    type: 'Objective';
    name: string;
    description: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    startDate: string;
    endDate: string;
    progress: number; // 0-100
    status: 'not_started' | 'in_progress' | 'on_track' | 'at_risk' | 'behind' | 'completed' | 'failed' | 'paused';
    priority: 'low' | 'medium' | 'high' | 'critical';
    ownerId: string; // Reference to UserProfile
    stakeholderIds: string[]; // References to UserProfiles or Organizations
    dependentObjectiveIds: string[]; // References to other Objectives
    keyResults: { id: string; description: string; target: number; current: number; unit: string; progress: number; lastUpdate: string; }[];
    strategicAlignment: string[]; // Tags or IDs indicating alignment with higher-level strategies
    milestones: { id: string; name: string; targetDate: string; isCompleted: boolean; }[];
}

// Organization Entity (Year 3: Multi-tenant and B2B support)
export interface Organization extends BaseEntity {
    type: 'Organization';
    name: string;
    legalName: string;
    domain: string;
    contactEmail: string;
    address: { street: string; city: string; state: string; zip: string; country: string; };
    parentOrgId: string | null;
    hierarchyPath: string[]; // For organizational structure visualization
    industry: string;
    employees: string[]; // UserProfile IDs
    settings: {
        dataRetentionPolicy: string; // e.g., '7-years-financial', '1-year-communications'
        securityPolicyLevel: 'low' | 'medium' | 'high' | 'strict';
        customBranding: { logoUrl: string; primaryColor: string; secondaryColor: string; fontStack: string; }; // Year 5: Advanced Branding
        featureAccess: Record<string, boolean>; // Organization-specific feature flags
    };
    integrations: { name: string; config: Record<string, any>; }[]; // Year 7: External Service Integration Config
}

// Account Entity (Year 2: Financial management expansion)
export interface Account extends BaseEntity {
    type: 'Account';
    name: string;
    accountNumber: string; // Masked or encrypted
    balance: number;
    currency: string;
    accountType: 'checking' | 'savings' | 'credit' | 'investment' | 'loan' | 'crypto' | 'virtual';
    ownerId: string; // UserProfile or Organization ID
    bankName: string | null;
    integrationDetails: { provider: string; externalId: string; syncStatus: 'idle' | 'syncing' | 'error'; lastSync: string | null; } | null; // Year 5: Sync status
    transactionLimits: { daily: number; monthly: number; } | null; // Year 6: Fraud prevention
}

// Category Entity (Year 2: Classification system)
export interface Category extends BaseEntity {
    type: 'Category';
    name: string;
    description: string;
    color: string;
    icon: string; // FontAwesome, SVG name, etc.
    parentId: string | null;
    isSystemDefined: boolean;
    rules: string[]; // Logic for auto-categorization (e.g., regex, AI-based rules)
    transactionCount: number; // Derived metric
    budgetTarget: number | null; // Year 5: Budgeting integration
}

// EventLog Entity (Year 4: Comprehensive auditing and real-time streams)
export interface EventLog extends BaseEntity {
    type: 'EventLog';
    eventName: string;
    entityType: string;
    entityId: string;
    action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'permission_change' | 'data_export' | 'system_alert' | 'ai_inference' | 'config_update' | 'policy_violation';
    userId: string | null; // User who performed the action
    changes: Patch[]; // Immer patches representing state changes (for 'update' actions)
    context: Record<string, any>; // IP address, device, session ID, tenant ID, request ID, etc.
    severity: 'info' | 'warning' | 'error' | 'critical';
    systemMessage: string;
    correlationId: string; // For linking related events across services
    traceId: string; // Year 8: Distributed tracing integration
    riskScore: number; // Year 9: Anomaly detection
}

// AITask Entity (Year 7: AI/ML Integration)
export interface AITask extends BaseEntity {
    type: 'AITask';
    modelId: string; // Which AI model was used
    taskType: 'classification' | 'summarization' | 'generation' | 'sentiment_analysis' | 'anomaly_detection' | 'prediction' | 'optimization' | 'recommendation';
    inputDataRef: { entityType: EntityType; entityId: EntityId; field?: string; } | null; // Reference to source data
    inputContent: string | null; // Raw input if not referencing an entity
    outputDataRef: { entityType: EntityType; entityId: EntityId; field?: string; } | null; // Reference to generated data
    outputContent: string | null; // Raw output if not modifying an entity
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    triggeredBy: 'user' | 'system' | 'schedule' | 'event' | 'agent';
    executionTimeMs: number | null;
    costEstimate: { currency: string; amount: number; } | null;
    feedback: { rating: number; comment: string; userId: string; timestamp: string; }[] | null; // User/system feedback
    errorDetails: string | null;
    retries: number;
    priority: 'low' | 'medium' | 'high';
}

// DataGovernancePolicy Entity (Year 9: Compliance and Data Lineage)
export interface DataGovernancePolicy extends BaseEntity {
    type: 'DataGovernancePolicy';
    name: string;
    description: string;
    appliesToEntityType: EntityType | 'All'; // e.g., 'Transaction', 'UserProfile', 'All'
    policyType: 'retention' | 'access_control' | 'masking' | 'encryption' | 'data_locality' | 'auditing';
    rules: string[]; // Policy rules in a defined DSL or natural language (e.g., "RETENTION_PERIOD=7Y FOR PII")
    effectiveDate: string;
    expirationDate: string | null;
    enforcedBy: string[]; // System modules enforcing this policy (e.g., 'API Gateway', 'DataContext', 'Scheduler')
    auditFrequencyDays: number;
    lastAuditDate: string | null;
    complianceStatus: 'compliant' | 'non-compliant' | 'pending_review';
    responsiblePartyId: string; // UserProfile or Organization ID
}

// DashboardLayout Entity (Year 5: User-customizable interfaces)
export interface DashboardLayout extends BaseEntity {
    type: 'DashboardLayout';
    userId: string | null; // Null for system-wide layouts
    tenantId: string | null; // Null for global layouts
    name: string;
    layoutConfig: {
        widgets: Array<{
            widgetId: string;
            type: string; // e.g., 'ChartWidget', 'TableWidget', 'TextWidget', 'AIInsightWidget'
            x: number; y: number; w: number; h: number;
            dataConfig: Record<string, any>; // Specific data source and transformation for the widget (e.g., query, aggregation)
            settings: Record<string, any>; // Widget-specific display settings
            isResizable: boolean;
            isDraggable: boolean;
        }>;
        responsiveBreakpoints: Record<string, number>;
        backgroundColor: string; // Year 7: Theming integration
    };
    isPublic: boolean; // Accessible to all in tenant
    sharedWith: string[]; // User or role IDs for fine-grained sharing
    previewImageUrl: string | null;
}

// Notification Entity (Year 8: Integrated Notification System)
export interface Notification extends BaseEntity {
    type: 'Notification';
    recipientId: string; // User ID or group ID
    title: string;
    message: string;
    link: string | null; // Deep link within the app
    severity: 'info' | 'warning' | 'error' | 'success';
    isRead: boolean;
    dismissedAt: string | null;
    category: 'system' | 'alert' | 'update' | 'personal' | 'ai_recommendation';
    source: string; // e.g., 'DataContext', 'AuthService', 'AI_Engine'
}

// ReportSchedule Entity (Year 9: Automated Reporting)
export interface ReportSchedule extends BaseEntity {
    type: 'ReportSchedule';
    name: string;
    description: string;
    reportType: string; // e.g., 'FinancialSummary', 'ComplianceAudit', 'OKRProgress'
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    scheduleTime: string; // e.g., "08:00 AM"
    recipientIds: string[]; // User IDs or email addresses
    lastRunDate: string | null;
    nextRunDate: string | null;
    status: 'active' | 'paused' | 'failed';
    configuration: Record<string, any>; // Specific report parameters
    outputFormat: 'PDF' | 'CSV' | 'JSON' | 'XLSX';
}

// WebhookSubscription Entity (Year 10: Extensibility and Integrations)
export interface WebhookSubscription extends BaseEntity {
    type: 'WebhookSubscription';
    name: string;
    targetUrl: string;
    eventFilters: { entityType: EntityType; action: RealityAction['type'] | 'any'; }[]; // e.g., { entityType: 'Transaction', action: 'ENTITY_UPSERT' }
    secret: string; // For signing webhooks
    lastTriggered: string | null;
    status: 'active' | 'paused' | 'failed';
    ownerId: string; // User or system ID
    deliveryAttempts: { timestamp: string; status: number; error: string | null; }[];
}

// All possible entity types
export type Entity =
    | UserProfile
    | Transaction
    | Covenant
    | Objective
    | Organization
    | Account
    | Category
    | EventLog
    | AITask
    | DataGovernancePolicy
    | DashboardLayout
    | Notification
    | ReportSchedule
    | WebhookSubscription;
export type EntityType = Entity['type'];
export type EntityId = string;
export type EntityRecord<T extends Entity> = { [id: EntityId]: T };

// The entire reality state
export interface RealityState {
    users: EntityRecord<UserProfile>;
    transactions: EntityRecord<Transaction>;
    covenants: EntityRecord<Covenant>;
    objectives: EntityRecord<Objective>;
    organizations: EntityRecord<Organization>;
    accounts: EntityRecord<Account>;
    categories: EntityRecord<Category>;
    eventLogs: EntityRecord<EventLog>;
    aiTasks: EntityRecord<AITask>;
    dataGovernancePolicies: EntityRecord<DataGovernancePolicy>;
    dashboardLayouts: EntityRecord<DashboardLayout>;
    notifications: EntityRecord<Notification>;
    reportSchedules: EntityRecord<ReportSchedule>;
    webhookSubscriptions: EntityRecord<WebhookSubscription>;
    // Year 6: Global system settings, feature flags, A/B test configurations
    systemSettings: {
        appInitialized: boolean;
        lastDataSync: string | null;
        maintenanceMode: boolean;
        globalMessage: string | null;
        activeTenantId: string;
        currentUserProfile: UserProfile | null; // More robust way to store current user in state
        i18n: { locale: string; }; // Year 8: Internationalization
        systemHealth: { status: 'operational' | 'degraded' | 'offline'; message: string; }; // Year 10: System health monitoring
        schemaVersion: string; // Store current schema version in state itself
    };
    featureFlags: Record<string, boolean>; // Runtime configurable features
    abTests: Record<string, { variant: string; activeUsers: string[]; }>; // A/B test definitions
    // Year 8: Real-time aggregated metrics, derived state
    realtimeMetrics: Record<string, any>; // e.g., activeUsers, totalTransactionsLastHour
    // Year 10: AI-driven autonomous agents' internal states
    autonomousAgentsState: Record<string, any>; // State for deployed agents
    optimisticUpdates: Record<string, { patches: Patch[]; inversePatches: Patch[]; originalVersion: number; timestamp: string; }>; // Year 5: Optimistic UI
}

// --- 2. Data Context Definition (Year 1: Foundation) ---

// Actions that can be dispatched to modify the state
export type RealityAction =
    | { type: 'ENTITY_UPSERT'; entityType: EntityType; payload: Entity; userId: string; correlationId?: string; optimisticKey?: string; }
    | { type: 'ENTITY_DELETE'; entityType: EntityType; id: EntityId; userId: string; correlationId?: string; optimisticKey?: string; }
    | { type: 'ENTITY_BATCH_UPSERT'; entityType: EntityType; payloads: Entity[]; userId: string; correlationId?: string; optimisticKey?: string; }
    | { type: 'ENTITY_BATCH_DELETE'; entityType: EntityType; ids: EntityId[]; userId: string; correlationId?: string; optimisticKey?: string; }
    | { type: 'APPLY_PATCHES'; entityType: EntityType; id: EntityId; patches: Patch[]; inversePatches: Patch[]; userId: string; correlationId?: string; optimisticKey?: string; }
    | { type: 'BULK_APPLY_PATCHES'; updates: { entityType: EntityType; id: EntityId; patches: Patch[]; inversePatches: Patch[]; }[]; userId: string; correlationId?: string; }
    | { type: 'RESET_STATE'; payload: RealityState; userId: string; correlationId?: string; }
    | { type: 'SET_CURRENT_USER'; payload: UserProfile | null; }
    | { type: 'SET_ACTIVE_TENANT'; payload: string; }
    | { type: 'UPDATE_SYSTEM_SETTING'; key: string; value: any; userId: string; correlationId?: string; } // Year 6: Dynamic config
    | { type: 'FETCH_START'; key: string; } // For loading indicators
    | { type: 'FETCH_SUCCESS'; key: string; }
    | { type: 'FETCH_ERROR'; key: string; error: any; }
    | { type: 'OPTIMISTIC_UPDATE_APPLY_LOCAL'; key: string; entityType: EntityType; id: EntityId; patches: Patch[]; inversePatches: Patch[]; originalVersion: number; } // Optimistic UI local application
    | { type: 'OPTIMISTIC_UPDATE_REVERT_LOCAL'; key: string; }
    | { type: 'OPTIMISTIC_UPDATE_CONFIRM'; key: string; actualEntity?: Entity; } // Server confirmed
    | { type: 'OPTIMISTIC_UPDATE_FAIL'; key: string; error: any; } // Server failed
    | { type: 'AI_INSIGHT_TRIGGERED'; entityType: EntityType; entityId: EntityId; insight: string; triggeredBy: string; aiTaskId: string; }
    | { type: 'SYSTEM_NOTIFICATION_ADD'; payload: Notification; } // Year 8: Notification system
    | { type: 'SYSTEM_NOTIFICATION_DISMISS'; id: string; userId: string; }
    | { type: 'UNDO'; } // Temporal state management (Year 5)
    | { type: 'REDO'; }
    | { type: 'SET_FEATURE_FLAG'; flag: string; value: boolean; userId: string; } // Year 6: Feature flag updates
    | { type: 'REPORT_METRIC'; metric: string; value: number; tags?: Record<string, string>; }; // Year 10: Telemetry

// Context for managing loading states across the app (Year 3: UX improvements)
export interface LoadingState {
    [key: string]: boolean; // key is usually an operation or resource
}

// Context for managing errors across the app (Year 3: Robust error handling)
export interface ErrorState {
    [key: string]: any; // key is usually an operation or resource
}

// Year 2: Authentication and Authorization context
export interface AuthContextType {
    currentUser: UserProfile | null;
    isAuthenticated: boolean;
    tenantId: string;
    login: (credentials: any) => Promise<UserProfile>;
    logout: () => Promise<void>;
    register: (details: any) => Promise<UserProfile>;
    hasPermission: (permission: string, entityId?: string, entityType?: EntityType) => boolean; // ABAC/RBAC
    canAccessTenant: (tenantId: string) => boolean;
    getUserRoles: () => string[];
    getUserPermissions: () => string[];
}

// Year 4: Real-time subscription context
export type SubscriptionCallback = (data: any) => void;
export interface RealtimeSubscriptionManager {
    subscribe: (query: string, callback: SubscriptionCallback) => string; // Returns subscription ID
    unsubscribe: (subscriptionId: string) => void;
    connect: () => void;
    disconnect: () => void;
    isConnected: boolean;
    getSubscriptionStatus: (subscriptionId: string) => 'active' | 'inactive' | 'error' | undefined; // Year 8: Status monitoring
}

// Year 5: Temporal State and Undo/Redo
export interface TemporalState {
    past: RealityState[];
    future: RealityState[];
    canUndo: boolean;
    canRedo: boolean;
    lastActionCorrelationId: string | null; // To group related actions
}

// Year 6: Data Governance and Compliance Module
export interface DataGovernanceModule {
    checkPolicy: (policyType: string, entity: Entity) => Promise<boolean>;
    applyPolicy: (policyType: string, entity: Entity, userId: string) => Promise<Entity>; // e.g., masking, retention
    getRelevantPolicies: (entityType: EntityType, entityId?: EntityId) => Promise<DataGovernancePolicy[]>;
    generateComplianceReport: (period: { start: string; end: string; }) => Promise<any>;
    requestDataSubjectAccess: (userId: string, dataSubjectId: string) => Promise<any>; // Year 9: GDPR/CCPA
    anonymizeData: (entityType: EntityType, entityId: EntityId, fieldsToAnonymize: string[]) => Promise<void>; // Year 9: Anonymization
}

// Year 7: AI/ML Inference and Orchestration Module
export interface AIOrchestrationModule {
    triggerInference: (taskType: AITask['taskType'], entityId: EntityId, entityType: EntityType, modelId?: string) => Promise<AITask>;
    getAITaskStatus: (taskId: string) => Promise<AITask>;
    provideFeedback: (taskId: string, rating: number, comment: string, userId: string) => Promise<AITask>;
    recommendActions: (context: Record<string, any>) => Promise<{ action: string; confidence: number; justification: string; }[]>; // Year 9: AI explainability
    deployAutonomousAgent: (config: any) => Promise<any>;
    monitorAgentActivity: (agentId: string) => Promise<any>;
    getAIAssistantResponse: (prompt: string, contextEntities: Entity[]) => Promise<{ response: string; model: string; }> // Year 10: AI Co-pilot
}


// The full Data Context API (Year 10: Comprehensive, Integrated)
export interface DataContextType {
    state: RealityState;
    dispatch: React.Dispatch<RealityAction>; // Low-level dispatch
    currentUser: UserProfile | null;
    tenantId: string;
    // Core CRUD operations
    upsertEntity: <T extends Entity>(entityType: T['type'], payload: T, optimisticKey?: string) => Promise<T>;
    deleteEntity: (entityType: EntityType, id: EntityId, optimisticKey?: string) => Promise<void>;
    batchUpsertEntities: (updates: { entityType: EntityType; payload: Entity; }[], optimisticKey?: string) => Promise<Entity[]>;
    batchDeleteEntities: (deletes: { entityType: EntityType; id: EntityId; }[], optimisticKey?: string) => Promise<void>;

    // Advanced data access & querying
    getEntity: <T extends Entity>(entityType: T['type'], id: EntityId) => T | undefined;
    getEntities: <T extends Entity>(entityType: T['type']) => T[];
    queryEntities: <T extends Entity>(entityType: T['type'], query: (entity: T) => boolean) => T[]; // Client-side filtering
    selectEntities: <T extends Entity, R>(entityType: T['type'], selector: (entities: T[]) => R) => R; // Memoized selector (Year 5)
    subscribeToQuery: <T extends Entity>(entityType: T['type'], query: (entity: T) => boolean, callback: (entities: T[]) => void) => () => void; // Year 8: Local query subscription

    // State management and temporal features
    applyPatchesToEntity: (entityType: EntityType, id: EntityId, patches: Patch[], inversePatches: Patch[], optimisticKey?: string) => Promise<void>;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    persistState: () => Promise<void>; // Offline persistence
    loadPersistedState: () => Promise<RealityState | null>;
    getOptimisticUpdateStatus: (key: string) => { status: 'pending' | 'confirmed' | 'failed'; error?: any; } | undefined; // Year 5: Optimistic UI status

    // Loading & Error states
    loading: LoadingState;
    errors: ErrorState;
    setLoading: (key: string, isLoading: boolean) => void;
    setError: (key: string, error: any | null) => void;

    // Authentication & Authorization module
    auth: AuthContextType;
    // Realtime subscriptions
    realtime: RealtimeSubscriptionManager;
    // Year 6: Data Governance
    governance: DataGovernanceModule;
    // Year 7: AI/ML Orchestration
    ai: AIOrchestrationModule;
    // Year 8: Global event bus for decoupled modules
    eventBus: {
        publish: (topic: string, data: any) => void;
        subscribe: (topic: string, callback: (data: any) => void) => () => void; // Returns unsubscribe function
    };
    // Year 9: Schema and Data Migration Tools
    schema: {
        validateEntity: (entityType: EntityType, entity: Entity) => Promise<boolean>;
        migrateEntity: (entity: Entity, targetVersion: string) => Promise<Entity>;
        getCurrentSchemaVersion: () => string;
        getAllEntityTypes: () => EntityType[];
        getEntitySchema: (entityType: EntityType) => any; // Returns a JSON schema definition
        registerSchema: (entityType: EntityType, schema: any) => void; // For dynamic schema registration
    };
    // Year 10: System-level diagnostics and performance
    diagnostics: {
        getMemoryUsage: () => { jsHeapSizeLimit: number; totalJSHeapSize: number; usedJSHeapSize: number; };
        getPerformanceMetrics: () => { dispatchCount: number; renderCount: number; avgDispatchTimeMs: number; };
        logSystemActivity: (level: 'info' | 'warn' | 'error' | 'debug', message: string, context?: Record<string, any>) => void;
        recordApiCall: (endpoint: string, method: string, durationMs: number, success: boolean, statusCode?: number) => void; // API monitoring
    };
    // Year 10: Internationalization
    i18n: {
        setLocale: (locale: string) => void;
        getLocale: () => string;
        t: (key: string, params?: Record<string, string | number>) => string; // Translation function
    };
    // Year 6: Feature flag and A/B testing
    featureFlags: {
        getFlag: (flag: string) => boolean;
        setFlag: (flag: string, value: boolean) => void;
    };
    abTesting: {
        getVariant: (testName: string, userId: string) => string;
        trackGoalCompletion: (testName: string, goal: string, userId: string) => void;
    };
    // Year 9: Search and Indexing (client-side, for small datasets)
    search: {
        indexEntity: (entity: Entity) => void;
        searchEntities: (query: string, entityTypes?: EntityType[]) => Entity[];
    };
    // Year 10: Plugin Management (Conceptual, for extending core capabilities)
    plugins: {
        registerPlugin: (pluginId: string, setupFunction: (context: DataContextType) => void) => void;
        // ... more plugin management APIs
    };
}

// Initialize with a deeply empty but structured state
const initialRealityState: RealityState = {
    users: {},
    transactions: {},
    covenants: {},
    objectives: {},
    organizations: {},
    accounts: {},
    categories: {},
    eventLogs: {},
    aiTasks: {},
    dataGovernancePolicies: {},
    dashboardLayouts: {},
    notifications: {},
    reportSchedules: {},
    webhookSubscriptions: {},
    systemSettings: {
        appInitialized: false,
        lastDataSync: null,
        maintenanceMode: false,
        globalMessage: null,
        activeTenantId: AppConfig.DEFAULT_TENANT_ID,
        currentUserProfile: null,
        i18n: { locale: AppConfig.I18N_DEFAULT_LOCALE },
        systemHealth: { status: 'operational', message: 'All systems go.' },
        schemaVersion: AppConfig.SCHEMA_VERSION,
    },
    featureFlags: {
        newDashboardLayout: true,
        aiCoPilotEnabled: AppConfig.ENABLE_AI_CO_PILOT_ASSISTANCE,
        offlineMode: true,
        advancedSearch: true,
        globalNotifications: true,
        abTestingEnabled: AppConfig.ENABLE_AB_TESTING,
        telemetryReporting: AppConfig.ENABLE_METRICS_REPORTING,
    },
    abTests: {},
    realtimeMetrics: {
        activeUsers: 0,
        dataThroughputKbps: 0,
        apiLatencyMs: 0,
    },
    autonomousAgentsState: {},
    optimisticUpdates: {},
};

// Initial temporal state
const initialTemporalState: TemporalState = {
    past: [],
    future: [],
    canUndo: false,
    canRedo: false,
    lastActionCorrelationId: null,
};

// --- 3. Reducer Logic (Year 1-10: Evolving State Management) ---

const realityReducer = (state: RealityState, action: RealityAction, userId: string | null): RealityState => {
    return produce(state, draft => {
        const now = new Date().toISOString();
        const actorId = userId || 'system';
        const entityKey = (type: EntityType) => type.toLowerCase() + 's' as keyof RealityState;

        const getBaseEntityFields = (existing?: BaseEntity): BaseEntity => ({
            id: existing?.id || nanoid(),
            createdAt: existing?.createdAt || now,
            createdBy: existing?.createdBy || actorId,
            updatedAt: now,
            updatedBy: actorId,
            version: (existing?.version || 0) + 1,
            tenantId: existing?.tenantId || draft.systemSettings.activeTenantId || AppConfig.DEFAULT_TENANT_ID,
            isArchived: existing?.isArchived ?? false,
            status: existing?.status || 'active',
            tags: existing?.tags || [],
            metadata: existing?.metadata || {},
            accessControlList: existing?.accessControlList || [],
            encryptedFields: existing?.encryptedFields || [],
        });

        switch (action.type) {
            case 'ENTITY_UPSERT': {
                const { entityType, payload, optimisticKey } = action;
                const record = (draft as any)[entityKey(entityType)];
                if (!record) {
                    console.error(`Unknown entity type for upsert: ${entityType}`);
                    return;
                }
                const existingEntity = record[payload.id];
                const newEntity: Entity = { ...getBaseEntityFields(existingEntity), ...payload };
                newEntity.status = payload.status || (existingEntity?.status || 'active'); // Preserve existing status if not overridden
                record[newEntity.id] = newEntity;

                if (optimisticKey) {
                    draft.optimisticUpdates[optimisticKey] = {
                        ...draft.optimisticUpdates[optimisticKey],
                        status: 'pending', // Mark as pending if it's an optimistic update
                    };
                }
                break;
            }
            case 'ENTITY_DELETE': {
                const { entityType, id } = action;
                const record = (draft as any)[entityKey(entityType)];
                if (record && record[id]) {
                    // Soft delete by default
                    record[id].status = 'deleted';
                    record[id].isArchived = true;
                    record[id].updatedAt = now;
                    record[id].updatedBy = actorId;
                }
                break;
            }
            case 'ENTITY_BATCH_UPSERT': {
                action.payloads.forEach(payload => {
                    const entityType = payload.type;
                    const record = (draft as any)[entityKey(entityType)];
                    if (!record) {
                        console.error(`Unknown entity type for batch upsert: ${entityType}`);
                        return;
                    }
                    const existingEntity = record[payload.id];
                    const newEntity: Entity = { ...getBaseEntityFields(existingEntity), ...payload };
                    newEntity.status = payload.status || (existingEntity?.status || 'active');
                    record[newEntity.id] = newEntity;
                });
                break;
            }
            case 'ENTITY_BATCH_DELETE': {
                action.ids.forEach(id => {
                    const { entityType } = action;
                    const record = (draft as any)[entityKey(entityType)];
                    if (record && record[id]) {
                        record[id].status = 'deleted';
                        record[id].isArchived = true;
                        record[id].updatedAt = now;
                        record[id].updatedBy = actorId;
                    }
                });
                break;
            }
            case 'APPLY_PATCHES': {
                const { entityType, id, patches, optimisticKey } = action;
                const record = (draft as any)[entityKey(entityType)];
                if (record && record[id]) {
                    record[id] = applyPatches(record[id], patches);
                    record[id].updatedAt = now;
                    record[id].updatedBy = actorId;
                    record[id].version++;
                }
                if (optimisticKey) {
                    draft.optimisticUpdates[optimisticKey] = {
                        ...draft.optimisticUpdates[optimisticKey],
                        status: 'pending',
                    };
                }
                break;
            }
            case 'BULK_APPLY_PATCHES': {
                action.updates.forEach(({ entityType, id, patches }) => {
                    const record = (draft as any)[entityKey(entityType)];
                    if (record && record[id]) {
                        record[id] = applyPatches(record[id], patches);
                        record[id].updatedAt = now;
                        record[id].updatedBy = actorId;
                        record[id].version++;
                    }
                });
                break;
            }
            case 'RESET_STATE':
                return action.payload; // Completely replace the state
            case 'SET_CURRENT_USER':
                draft.systemSettings.currentUserProfile = action.payload;
                break;
            case 'SET_ACTIVE_TENANT':
                draft.systemSettings.activeTenantId = action.payload;
                // Update current user's tenant if applicable
                if (draft.systemSettings.currentUserProfile) {
                    draft.systemSettings.currentUserProfile.tenantId = action.payload;
                }
                break;
            case 'UPDATE_SYSTEM_SETTING': {
                const { key, value } = action;
                (draft.systemSettings as any)[key] = value;
                break;
            }
            case 'FETCH_START':
            case 'FETCH_SUCCESS':
            case 'FETCH_ERROR':
                // These are usually handled by an async reducer or saga/thunk pattern outside the core reducer
                break;
            case 'OPTIMISTIC_UPDATE_APPLY_LOCAL': {
                const { key, entityType, id, patches, inversePatches, originalVersion } = action;
                const record = (draft as any)[entityKey(entityType)];
                if (record && record[id]) {
                    record[id] = applyPatches(record[id], patches);
                    record[id].updatedAt = now;
                    record[id].updatedBy = actorId;
                    record[id].version++; // Optimistic version bump
                }
                draft.optimisticUpdates[key] = {
                    patches,
                    inversePatches,
                    originalVersion,
                    timestamp: now,
                    status: 'pending',
                };
                break;
            }
            case 'OPTIMISTIC_UPDATE_REVERT_LOCAL': {
                const { key } = action;
                const update = draft.optimisticUpdates[key];
                if (update) {
                    // This action would ideally be for a specific entity, not global for 'optimisticUpdates'
                    // For simplicity, we assume the revert patches are applied by an external handler.
                    // This reducer mostly tracks the status of the optimistic update.
                    delete draft.optimisticUpdates[key]; // Remove the optimistic record
                }
                break;
            }
            case 'OPTIMISTIC_UPDATE_CONFIRM': {
                const { key, actualEntity } = action;
                if (draft.optimisticUpdates[key]) {
                    if (actualEntity) {
                        // Replace the optimistically updated entity with the confirmed server entity
                        const entityType = actualEntity.type;
                        const record = (draft as any)[entityKey(entityType)];
                        if (record && record[actualEntity.id]) {
                            record[actualEntity.id] = actualEntity;
                        }
                    }
                    draft.optimisticUpdates[key].status = 'confirmed';
                    // Clean up after a short delay or in a separate process
                    setTimeout(() => delete draft.optimisticUpdates[key], 10000); // Year 8: configurable cleanup
                }
                break;
            }
            case 'OPTIMISTIC_UPDATE_FAIL': {
                const { key, error } = action;
                if (draft.optimisticUpdates[key]) {
                    draft.optimisticUpdates[key].status = 'failed';
                    (draft.optimisticUpdates[key] as any).error = error; // Add error details
                }
                break;
            }
            case 'AI_INSIGHT_TRIGGERED': {
                const { entityType, entityId, insight, aiTaskId } = action;
                const record = (draft as any)[entityKey(entityType)];
                if (record && record[entityId] && 'ai_insights' in record[entityId]) {
                    record[entityId].ai_insights.push(insight);
                }
                // Update the AI task status if needed
                if (draft.aiTasks[aiTaskId]) {
                    draft.aiTasks[aiTaskId].status = 'completed';
                    draft.aiTasks[aiTaskId].updatedAt = now;
                    draft.aiTasks[aiTaskId].updatedBy = actorId;
                    // Add AI task metrics
                    if (AppConfig.ENABLE_METRICS_REPORTING) {
                        // (draft as any).realtimeMetrics.aiTaskCompletionRate = ...; // Example
                    }
                }
                break;
            }
            case 'SYSTEM_NOTIFICATION_ADD': {
                const { payload } = action;
                const notification: Notification = { ...getBaseEntityFields(), ...payload, id: payload.id || nanoid(), createdAt: now, updatedAt: now, isRead: false, dismissedAt: null };
                draft.notifications[notification.id] = notification;
                break;
            }
            case 'SYSTEM_NOTIFICATION_DISMISS': {
                const { id, userId: targetUserId } = action;
                if (draft.notifications[id] && draft.notifications[id].recipientId === targetUserId) {
                    draft.notifications[id].isRead = true;
                    draft.notifications[id].dismissedAt = now;
                    draft.notifications[id].updatedAt = now;
                    draft.notifications[id].updatedBy = actorId;
                }
                break;
            }
            case 'SET_FEATURE_FLAG': {
                draft.featureFlags[action.flag] = action.value;
                break;
            }
            case 'REPORT_METRIC': {
                // This would typically send to an external metrics service
                // For internal state, update derived metrics
                if (AppConfig.ENABLE_METRICS_REPORTING) {
                    console.debug(`[METRIC] ${action.metric}: ${action.value}`, action.tags);
                    if (action.metric === 'api_latency') {
                        draft.realtimeMetrics.apiLatencyMs = (draft.realtimeMetrics.apiLatencyMs * 0.9 + action.value * 0.1); // Moving average
                    }
                    // ... other metric updates
                }
                break;
            }
            case 'UNDO':
            case 'REDO':
                // Handled by the temporal state logic wrapping the reducer.
                break;
            default:
                console.warn('Unknown action type:', (action as any).type, action);
        }
    });
};

// --- 4. Temporal Reducer Wrapper (Year 5: Undo/Redo and History) ---
const temporalReducer = (
    state: { current: RealityState; temporal: TemporalState },
    action: RealityAction,
    userId: string | null
): { current: RealityState; temporal: TemporalState } => {
    switch (action.type) {
        case 'UNDO':
            if (state.temporal.canUndo) {
                const past = [...state.temporal.past];
                const newCurrent = past.pop()!; // Guaranteed to exist by canUndo
                return {
                    current: newCurrent,
                    temporal: {
                        past,
                        future: [state.current, ...state.temporal.future],
                        canUndo: past.length > 0,
                        canRedo: true,
                        lastActionCorrelationId: null, // Clear correlation on undo
                    },
                };
            }
            return state;
        case 'REDO':
            if (state.temporal.canRedo) {
                const future = [...state.temporal.future];
                const newCurrent = future.shift()!; // Guaranteed to exist by canRedo
                return {
                    current: newCurrent,
                    temporal: {
                        past: [...state.temporal.past, state.current],
                        future,
                        canUndo: true,
                        canRedo: future.length > 0,
                        lastActionCorrelationId: null, // Clear correlation on redo
                    },
                };
            }
            return state;
        case 'RESET_STATE': {
            const newState = realityReducer(state.current, action, userId);
            return {
                current: newState,
                temporal: initialTemporalState,
            };
        }
        default:
            const newCurrentState = realityReducer(state.current, action, userId);

            // Only record if state actually changed and it's not an optimistic revert/confirm
            const isStateChangingAction =
                action.type !== 'FETCH_START' &&
                action.type !== 'FETCH_SUCCESS' &&
                action.type !== 'FETCH_ERROR' &&
                action.type !== 'OPTIMISTIC_UPDATE_CONFIRM' &&
                action.type !== 'OPTIMISTIC_UPDATE_FAIL' &&
                action.type !== 'OPTIMISTIC_UPDATE_REVERT_LOCAL' &&
                action.type !== 'REPORT_METRIC';

            if (isStateChangingAction && !isEqual(newCurrentState, state.current)) { // Deep equality check for actual change
                const newPast = [...state.temporal.past, state.current];
                if (newPast.length > AppConfig.HISTORY_SNAPSHOT_DEPTH) {
                    newPast.shift(); // Remove oldest state
                }

                return {
                    current: newCurrentState,
                    temporal: {
                        past: newPast,
                        future: [], // Any new action clears the redo stack
                        canUndo: newPast.length > 0,
                        canRedo: false,
                        lastActionCorrelationId: (action as any).correlationId || nanoid(), // Keep track of last action group
                    },
                };
            }
            return state; // No change, no history update
    }
};

// --- 5. Data Persistence (Year 3: Offline Capability & Robustness) ---
const LOCAL_STORAGE_KEY = 'realityCoreState_v' + AppConfig.SCHEMA_VERSION.split('.')[0]; // Version-aware storage
export const persistStateToLocalStorage = async (state: RealityState): Promise<void> => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem(LOCAL_STORAGE_KEY, serializedState);
        console.debug("State persisted to local storage.");
    } catch (error) {
        console.error("Failed to persist state to local storage:", error);
    }
};

export const loadStateFromLocalStorage = async (): Promise<RealityState | null> => {
    try {
        const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (serializedState === null) {
            return null;
        }
        const loadedState: RealityState = JSON.parse(serializedState);
        // Year 9: Schema migration during load
        const migratedState = await migrateStateToCurrentSchema(loadedState, AppConfig.SCHEMA_VERSION);
        return migratedState;
    } catch (error) {
        console.error("Failed to load state from local storage:", error);
        return null;
    }
};

// Year 9: Schema Migration Logic
export const migrateStateToCurrentSchema = async (state: RealityState, targetVersion: string): Promise<RealityState> => {
    console.debug(`Attempting to migrate state from schema ${state.systemSettings.schemaVersion} to ${targetVersion}`);
    // This is a simplified placeholder. A real migration system would have versioned migration scripts
    // that sequentially apply transformations from one version to the next.
    let migratedState = produce(state, draft => {
        // Example migrations (apply only if needed based on `state.systemSettings.schemaVersion`)
        // if (draft.systemSettings.schemaVersion < '10.0.0') { ... apply v9->v10 migrations ... }
        // if (draft.systemSettings.schemaVersion < '10.1.0') { ... apply v10.0->v10.1 migrations ... }

        // Ensure new top-level entities are initialized if missing in older states
        if (!(draft as any).notifications) (draft as any).notifications = {};
        if (!(draft as any).reportSchedules) (draft as any).reportSchedules = {};
        if (!(draft as any).webhookSubscriptions) (draft as any).webhookSubscriptions = {};

        // Update schema version in state
        draft.systemSettings.schemaVersion = targetVersion;
    });
    return migratedState;
};

// --- 6. AuthContext Stub (Year 2: Authentication & Authorization) ---
const createAuthModule = (dispatch: React.Dispatch<RealityAction>, currentUserIdRef: React.MutableRefObject<string | null>, activeTenantIdRef: React.MutableRefObject<string>, getState: () => RealityState): AuthContextType => {
    // In a real app, this would be a separate, full-fledged context or API client.
    // It's integrated here to demonstrate deep interactions.

    const getUserProfile = (): UserProfile | null => {
        const state = getState();
        return currentUserIdRef.current ? state.users[currentUserIdRef.current] || state.systemSettings.currentUserProfile : null;
    };

    const login = async (credentials: any): Promise<UserProfile> => {
        dispatch({ type: 'FETCH_START', key: 'auth/login' });
        try {
            // Simulate API call and JWT/Session establishment
            return new Promise(resolve => {
                setTimeout(() => {
                    const user: UserProfile = {
                        id: 'user-auth-' + nanoid(),
                        type: 'UserProfile',
                        username: credentials.username,
                        email: `${credentials.username}@example.com`,
                        roles: ['user', 'editor'],
                        permissions: ['read:any', 'create:transaction', 'update:objective_self'],
                        settings: { theme: 'dark', locale: AppConfig.I18N_DEFAULT_LOCALE, timezone: 'UTC', notifications: { email: true, push: true, sms: false }, preferredAIModels: ['GPT-4'], accessibilityOptions: { highContrast: false, largeText: false, screenReader: false } },
                        lastLogin: new Date().toISOString(),
                        oauthProviders: [],
                        twoFactorEnabled: true,
                        biometricKeys: [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        createdBy: 'system',
                        updatedBy: 'system',
                        version: 1,
                        tenantId: activeTenantIdRef.current,
                        isArchived: false,
                        status: 'active',
                        tags: [],
                        metadata: {},
                        profileImageUrl: null,
                        publicBio: 'A valued member of the Reality Core.',
                    };
                    currentUserIdRef.current = user.id;
                    dispatch({ type: 'ENTITY_UPSERT', entityType: 'UserProfile', payload: user, userId: 'system-auth' });
                    dispatch({ type: 'SET_CURRENT_USER', payload: user });
                    dispatch({ type: 'FETCH_SUCCESS', key: 'auth/login' });
                    dispatch({ type: 'REPORT_METRIC', metric: 'user_login', value: 1, tags: { userId: user.id } });
                    resolve(user);
                }, 500);
            });
        } catch (error) {
            dispatch({ type: 'FETCH_ERROR', key: 'auth/login', error });
            throw error;
        }
    };

    const logout = async (): Promise<void> => {
        dispatch({ type: 'FETCH_START', key: 'auth/logout' });
        try {
            return new Promise(resolve => {
                setTimeout(() => {
                    if (currentUserIdRef.current) {
                        dispatch({ type: 'REPORT_METRIC', metric: 'user_logout', value: 1, tags: { userId: currentUserIdRef.current } });
                    }
                    currentUserIdRef.current = null;
                    dispatch({ type: 'SET_CURRENT_USER', payload: null });
                    console.log('Logged out');
                    dispatch({ type: 'FETCH_SUCCESS', key: 'auth/logout' });
                    resolve();
                }, 200);
            });
        } catch (error) {
            dispatch({ type: 'FETCH_ERROR', key: 'auth/logout', error });
            throw error;
        }
    };

    const register = async (details: any): Promise<UserProfile> => {
        dispatch({ type: 'FETCH_START', key: 'auth/register' });
        try {
            return new Promise(resolve => {
                setTimeout(() => {
                    const newUser: UserProfile = {
                        id: 'user-reg-' + nanoid(),
                        type: 'UserProfile',
                        username: details.username,
                        email: details.email,
                        roles: ['viewer'],
                        permissions: ['read:any'],
                        settings: { theme: 'system', locale: AppConfig.I18N_DEFAULT_LOCALE, timezone: 'UTC', notifications: { email: true, push: false, sms: false }, preferredAIModels: ['default'], accessibilityOptions: { highContrast: false, largeText: false, screenReader: false } },
                        lastLogin: null,
                        oauthProviders: [],
                        twoFactorEnabled: false,
                        biometricKeys: [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        createdBy: 'system',
                        updatedBy: 'system',
                        version: 1,
                        tenantId: activeTenantIdRef.current,
                        isArchived: false,
                        status: 'active',
                        tags: [],
                        metadata: {},
                        profileImageUrl: null,
                        publicBio: 'Newly registered user.',
                    };
                    dispatch({ type: 'ENTITY_UPSERT', entityType: 'UserProfile', payload: newUser, userId: 'system-auth' });
                    dispatch({ type: 'FETCH_SUCCESS', key: 'auth/register' });
                    dispatch({ type: 'REPORT_METRIC', metric: 'user_register', value: 1, tags: { userId: newUser.id } });
                    resolve(newUser);
                }, 700);
            });
        } catch (error) {
            dispatch({ type: 'FETCH_ERROR', key: 'auth/register', error });
            throw error;
        }
    };

    const hasPermission = useCallback((permission: string, entityId?: string, entityType?: EntityType): boolean => {
        const currentUser = getUserProfile();
        if (!currentUser) return false;

        // Year 6: Hierarchical role-based access control (RBAC) and Attribute-based access control (ABAC)
        if (currentUser.roles.includes('admin') || currentUser.roles.includes('global_admin')) return true;

        if (currentUser.permissions.includes(permission)) return true;

        // ABAC: Check for specific entity ownership or attributes
        if (entityId && entityType) {
            const state = getState();
            const record = (state as any)[entityType.toLowerCase() + 's'];
            const entity = record ? record[entityId] : undefined;

            if (entity) {
                // Example ABAC rule: user can update their own objectives
                if (permission === 'update:objective_self' && entityType === 'Objective' && (entity as Objective).ownerId === currentUser.id) {
                    return true;
                }
                // Example ABAC rule: user can read transactions in their own account
                if (permission === 'read:transaction_account' && entityType === 'Transaction' && (entity as Transaction).accountId) {
                    const account = state.accounts[(entity as Transaction).accountId];
                    if (account && account.ownerId === currentUser.id) {
                        return true;
                    }
                }
                // Year 9: Check inline ACLs
                if (entity.accessControlList) {
                    const hasAclPermission = entity.accessControlList.some(acl =>
                        (acl.userId === currentUser.id || currentUser.roles.includes(acl.roleId || '')) &&
                        acl.permissions.includes(permission)
                    );
                    if (hasAclPermission) return true;
                }
            }
        }
        return false;
    }, [currentUserIdRef, activeTenantIdRef, getState]);

    const canAccessTenant = useCallback((tenantId: string): boolean => {
        const currentUser = getUserProfile();
        if (!currentUser) return false;
        return currentUser.tenantId === tenantId || currentUser.roles.includes('global_admin');
    }, [currentUserIdRef, getState]);

    const getUserRoles = useCallback(() => getUserProfile()?.roles || [], [currentUserIdRef, getState]);
    const getUserPermissions = useCallback(() => getUserProfile()?.permissions || [], [currentUserIdRef, getState]);

    return {
        currentUser: getUserProfile(), // Will be updated by React state in provider
        isAuthenticated: !!currentUserIdRef.current,
        tenantId: activeTenantIdRef.current,
        login,
        logout,
        register,
        hasPermission,
        canAccessTenant,
        getUserRoles,
        getUserPermissions,
    };
};

// --- 7. Realtime Subscription Manager Stub (Year 4: Real-time Data) ---
const createRealtimeSubscriptionManager = (dispatch: React.Dispatch<RealityAction>, diagnostics: DataContextType['diagnostics']): RealtimeSubscriptionManager => {
    const subscriptions = new Map<string, SubscriptionCallback>();
    const subscriptionStatus = new Map<string, 'active' | 'inactive' | 'error'>(); // Year 8: Status tracking
    let websocket: WebSocket | null = null;
    let isConnected = false;
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;
    const RECONNECT_DELAY_MS = 5000;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connect = () => {
        if (websocket && (websocket.readyState === WebSocket.OPEN || websocket.readyState === WebSocket.CONNECTING)) {
            diagnostics.logSystemActivity('debug', 'Realtime WebSocket already connecting or open.');
            return;
        }
        diagnostics.logSystemActivity('info', 'Attempting to connect to Realtime WebSocket...');
        websocket = new WebSocket(AppConfig.REALTIME_WS_URL);

        websocket.onopen = () => {
            diagnostics.logSystemActivity('info', 'Realtime WebSocket Connected.');
            isConnected = true;
            reconnectAttempts = 0;
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            // Re-subscribe all existing subscriptions on reconnect
            subscriptions.forEach((callback, query) => {
                const subId = Array.from(subscriptions.keys()).find(k => subscriptions.get(k) === callback); // Get the original sub ID
                websocket?.send(JSON.stringify({ type: 'subscribe', query, subscriptionId: subId }));
                if (subId) subscriptionStatus.set(subId, 'active');
            });
        };

        websocket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                // diagnostics.logSystemActivity('debug', 'Received WS message', message);

                if (message.type === 'data_update' || message.type === 'patch_update') {
                    const userId = message.updatedBy || 'realtime-system';
                    const correlationId = message.correlationId || nanoid();

                    if (message.type === 'data_update') {
                        dispatch({
                            type: 'ENTITY_UPSERT',
                            entityType: message.entityType,
                            payload: message.payload,
                            userId,
                            correlationId,
                        });
                    } else if (message.type === 'patch_update') {
                        dispatch({
                            type: 'APPLY_PATCHES',
                            entityType: message.entityType,
                            id: message.entityId,
                            patches: message.patches,
                            inversePatches: message.inversePatches,
                            userId,
                            correlationId,
                        });
                    }
                    // Notify specific subscription callbacks if a subscription ID is present
                    if (message.subscriptionId && subscriptions.has(message.subscriptionId)) {
                        subscriptions.get(message.subscriptionId)?.(message.payload || message);
                    } else if (!message.subscriptionId) {
                        // For generic updates, notify all if no specific sub is matched (Year 8: Broadcast)
                        subscriptions.forEach(callback => callback(message.payload || message));
                    }
                } else if (message.type === 'control_message' && message.action === 'subscription_error') {
                    diagnostics.logSystemActivity('error', `Subscription error for ${message.subscriptionId}: ${message.error}`, message);
                    if (message.subscriptionId) subscriptionStatus.set(message.subscriptionId, 'error');
                } else if (message.topic) {
                    dispatch({ type: 'SYSTEM_NOTIFICATION_ADD', payload: { type: 'Notification', title: `Realtime Topic Event: ${message.topic}`, message: JSON.stringify(message.payload), recipientId: 'global', severity: 'info', category: 'system' } });
                }

            } catch (e) {
                diagnostics.logSystemActivity('error', 'Failed to parse websocket message:', { error: e, data: event.data });
                dispatch({ type: 'SYSTEM_NOTIFICATION_ADD', payload: { type: 'Notification', title: 'Realtime data error', message: `Failed to process WS message: ${(e as Error).message}`, recipientId: 'global', severity: 'error', category: 'system' } });
            }
        };

        websocket.onclose = (event) => {
            diagnostics.logSystemActivity('warn', `Realtime WebSocket Disconnected. Code: ${event.code}, Reason: ${event.reason}. Will attempt reconnect.`, { wasClean: event.wasClean });
            isConnected = false;
            subscriptions.forEach((_, subId) => subscriptionStatus.set(subId, 'inactive'));
            if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttempts++;
                diagnostics.logSystemActivity('info', `Attempting to reconnect in ${RECONNECT_DELAY_MS / 1000}s... (Attempt ${reconnectAttempts})`);
                reconnectTimeout = setTimeout(connect, RECONNECT_DELAY_MS);
            } else {
                diagnostics.logSystemActivity('critical', 'Max reconnect attempts reached for Realtime WebSocket. Giving up.', { attempts: MAX_RECONNECT_ATTEMPTS });
                dispatch({ type: 'SYSTEM_NOTIFICATION_ADD', payload: { type: 'Notification', title: 'Realtime connection lost', message: 'Max reconnect attempts reached for Realtime WebSocket. Data updates may be delayed.', recipientId: 'global', severity: 'critical', category: 'system' } });
            }
        };

        websocket.onerror = (error) => {
            diagnostics.logSystemActivity('error', 'Realtime WebSocket Error:', error);
            websocket?.close();
            dispatch({ type: 'SYSTEM_NOTIFICATION_ADD', payload: { type: 'Notification', title: 'Realtime connection error', message: `Realtime connection error: ${error}`, recipientId: 'global', severity: 'error', category: 'system' } });
        };
    };

    const disconnect = () => {
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        websocket?.close(1000, 'Client initiated disconnect');
        websocket = null;
        isConnected = false;
        subscriptions.forEach((_, subId) => subscriptionStatus.set(subId, 'inactive'));
        diagnostics.logSystemActivity('info', 'Realtime WebSocket explicitly disconnected.');
    };

    const subscribe = (query: string, callback: SubscriptionCallback): string => {
        const subscriptionId = nanoid();
        subscriptions.set(subscriptionId, callback);
        if (websocket?.readyState === WebSocket.OPEN) {
            websocket.send(JSON.stringify({ type: 'subscribe', query, subscriptionId }));
            subscriptionStatus.set(subscriptionId, 'active');
        } else {
            diagnostics.logSystemActivity('warn', 'WebSocket not open, subscription will be active on connect.', { query, subscriptionId });
            subscriptionStatus.set(subscriptionId, 'inactive');
        }
        return subscriptionId;
    };

    const unsubscribe = (subscriptionId: string) => {
        subscriptions.delete(subscriptionId);
        if (websocket?.readyState === WebSocket.OPEN) {
            websocket.send(JSON.stringify({ type: 'unsubscribe', subscriptionId }));
        }
        subscriptionStatus.delete(subscriptionId);
    };

    const getSubscriptionStatus = (subscriptionId: string) => subscriptionStatus.get(subscriptionId);

    return { subscribe, unsubscribe, connect, disconnect, isConnected, getSubscriptionStatus };
};

// --- 8. Data Governance Module Stub (Year 6: Compliance & Policy Enforcement) ---
const createDataGovernanceModule = (getState: () => RealityState, dispatch: React.Dispatch<RealityAction>): DataGovernanceModule => {
    const checkPolicy = async (policyType: string, entity: Entity): Promise<boolean> => {
        // diagnostics.logSystemActivity('debug', `Checking policy '${policyType}' for entity ${entity.id} (${entity.type})`);
        const state = getState();
        const policies = Object.values(state.dataGovernancePolicies)
            .filter(p => (p.appliesToEntityType === entity.type || p.appliesToEntityType === 'All') && p.policyType === policyType && new Date(p.effectiveDate) <= new Date() && (!p.expirationDate || new Date(p.expirationDate) >= new Date()));

        if (policies.length === 0) {
            return true; // No active policies mean permitted
        }

        for (const policy of policies) {
            for (const rule of policy.rules) {
                // Year 9: Advanced rule parsing and evaluation (e.g., using a rule engine or DSL interpreter)
                if (policyType === 'retention' && rule.startsWith('RETENTION_PERIOD=')) {
                    const match = rule.match(/RETENTION_PERIOD=(\d+)(Y|M|D)/);
                    if (match && entity.status !== 'deleted') { // Retention applies to active/archived data
                        const value = parseInt(match[1]);
                        const unit = match[2];
                        const cutoffDate = new Date();
                        if (unit === 'Y') cutoffDate.setFullYear(cutoffDate.getFullYear() - value);
                        if (unit === 'M') cutoffDate.setMonth(cutoffDate.getMonth() - value);
                        if (unit === 'D') cutoffDate.setDate(cutoffDate.getDate() - value);

                        if (new Date(entity.createdAt) < cutoffDate && !entity.isArchived) {
                            dispatch({ type: 'SYSTEM_NOTIFICATION_ADD', payload: { type: 'Notification', title: 'Policy Violation', message: `Entity ${entity.id} (${entity.type}) violates retention policy '${policy.name}'. Should be archived/deleted.`, recipientId: policy.responsiblePartyId || 'global', severity: 'warning', category: 'alert' } });
                            return false; // Entity should be archived/deleted
                        }
                    }
                } else if (policyType === 'access_control' && rule.startsWith('REQUIRE_ROLE=')) {
                    const requiredRole = rule.split('=')[1];
                    const currentUser = getState().systemSettings.currentUserProfile;
                    if (!currentUser || !currentUser.roles.includes(requiredRole)) {
                        dispatch({ type: 'SYSTEM_NOTIFICATION_ADD', payload: { type: 'Notification', title: 'Access Denied', message: `Access to ${entity.type}/${entity.id} denied due to policy '${policy.name}'. Role '${requiredRole}' required.`, recipientId: currentUser?.id || 'global', severity: 'error', category: 'alert' } });
                        return false; // Access denied
                    }
                }
            }
        }
        return true;
    };

    const applyPolicy = async (policyType: string, entity: Entity, userId: string): Promise<Entity> => {
        // diagnostics.logSystemActivity('debug', `Applying policy '${policyType}' to entity ${entity.id} (${entity.type})`);
        let modifiedEntity = { ...entity };
        const state = getState();
        const policies = Object.values(state.dataGovernancePolicies)
            .filter(p => (p.appliesToEntityType === entity.type || p.appliesToEntityType === 'All') && p.policyType === policyType && new Date(p.effectiveDate) <= new Date() && (!p.expirationDate || new Date(p.expirationDate) >= new Date()));

        for (const policy of policies) {
            for (const rule of policy.rules) {
                // Masking policies
                if (policyType === 'masking') {
                    if (rule.includes('MASK_FIELD=email')) {
                        if ('email' in modifiedEntity && typeof (modifiedEntity as any).email === 'string') {
                            modifiedEntity = { ...modifiedEntity, email: (modifiedEntity as any).email.replace(/(?<=.{1})[^@](?=[^@]*?\.[^@\.]+$)/g, '*') } as Entity;
                        }
                    } else if (rule.includes('MASK_FIELD=accountNumber')) {
                        if ('accountNumber' in modifiedEntity && typeof (modifiedEntity as any).accountNumber === 'string') {
                            modifiedEntity = { ...modifiedEntity, accountNumber: `****${(modifiedEntity as any).accountNumber.slice(-4)}` } as Entity;
                        }
                    }
                    // Year 9: Dynamic masking based on user roles/permissions and policy context
                }
                // Anonymization policies (for data export/processing)
                if (policyType === 'anonymization' && rule.startsWith('ANONYMIZE_FIELD=')) {
                    const field = rule.split('=')[1];
                    if (field in modifiedEntity) {
                        modifiedEntity = produce(modifiedEntity, draft => {
                            (draft as any)[field] = `[ANONYMIZED_${field.toUpperCase()}]`;
                        });
                    }
                }
            }
        }
        return modifiedEntity;
    };

    const getRelevantPolicies = async (entityType: EntityType, entityId?: EntityId): Promise<DataGovernancePolicy[]> => {
        const state = getState();
        return Object.values(state.dataGovernancePolicies)
            .filter(p => (p.appliesToEntityType === entityType || p.appliesToEntityType === 'All') && new Date(p.effectiveDate) <= new Date() && (!p.expirationDate || new Date(p.expirationDate) >= new Date()));
    };

    const generateComplianceReport = async (period: { start: string; end: string; }): Promise<any> => {
        dispatch({ type: 'FETCH_START', key: 'governance/complianceReport' });
        try {
            console.log(`Generating compliance report for period ${period.start} to ${period.end}`);
            // This would involve querying EventLogs and applying policy checks retrospectively
            // Simulate a complex report generation
            await new Promise(resolve => setTimeout(resolve, 3000));
            const state = getState();
            const violations = Object.values(state.eventLogs).filter(event => event.action === 'policy_violation' && event.createdAt >= period.start && event.createdAt <= period.end);

            dispatch({ type: 'FETCH_SUCCESS', key: 'governance/complianceReport' });
            return {
                reportId: nanoid(),
                period,
                status: 'completed',
                violationsFound: violations.length,
                details: `Generated compliance report: ${violations.length} policy violations recorded between ${period.start} and ${period.end}.`,
                generatedAt: new Date().toISOString(),
                violations: violations.map(v => ({ eventId: v.id, message: v.systemMessage, context: v.context })),
            };
        } catch (error) {
            dispatch({ type: 'FETCH_ERROR', key: 'governance/complianceReport', error });
            throw error;
        }
    };

    const requestDataSubjectAccess = async (userId: string, dataSubjectId: string): Promise<any> => {
        dispatch({ type: 'FETCH_START', key: 'governance/dsar' });
        try {
            console.log(`Processing Data Subject Access Request for ${dataSubjectId} by ${userId}`);
            await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate processing
            const state = getState();
            const userData: any = Object.values(state.users).find(u => u.id === dataSubjectId);
            const userTransactions = Object.values(state.transactions).filter(t => t.createdBy === dataSubjectId || t.peerId === dataSubjectId);
            // In a real system, this would gather all data linked to the dataSubjectId across all entities
            // and apply any required masking/anonymization before presenting.
            dispatch({ type: 'FETCH_SUCCESS', key: 'governance/dsar' });
            return {
                requestorId: userId,
                dataSubjectId,
                status: 'completed',
                generatedAt: new Date().toISOString(),
                data: {
                    userProfile: userData,
                    transactions: userTransactions,
                    // ... other linked data
                },
                message: "Data Subject Access Request processed successfully. Sensitive data has been masked as per policy."
            };
        } catch (error) {
            dispatch({ type: 'FETCH_ERROR', key: 'governance/dsar', error });
            throw error;
        }
    };

    const anonymizeData = async (entityType: EntityType, entityId: EntityId, fieldsToAnonymize: string[]): Promise<void> => {
        dispatch({ type: 'FETCH_START', key: `governance/anonymize_${entityType}_${entityId}` });
        try {
            const state = getState();
            const record = (state as any)[entityType.toLowerCase() + 's'];
            const entity = record ? record[entityId] : undefined;
            if (!entity) throw new Error(`Entity ${entityType}/${entityId} not found.`);

            const [, patches, inversePatches] = produceWithPatches(entity, draft => {
                fieldsToAnonymize.forEach(field => {
                    if (field in draft) {
                        (draft as any)[field] = `[ANONYMIZED_${field.toUpperCase()}]`;
                    }
                });
            });

            if (patches.length > 0) {
                dispatch({
                    type: 'APPLY_PATCHES',
                    entityType,
                    id: entityId,
                    patches,
                    inversePatches,
                    userId: getState().systemSettings.currentUserProfile?.id || 'system-governance',
                    correlationId: nanoid(),
                });
            }
            dispatch({ type: 'FETCH_SUCCESS', key: `governance/anonymize_${entityType}_${entityId}` });
        } catch (error) {
            dispatch({ type: 'FETCH_ERROR', key: `governance/anonymize_${entityType}_${entityId}`, error });
            throw error;
        }
    };

    return { checkPolicy, applyPolicy, getRelevantPolicies, generateComplianceReport, requestDataSubjectAccess, anonymizeData };
};

// --- 9. AI Orchestration Module Stub (Year 7: AI/ML Integration) ---
const createAIOrchestrationModule = (dispatch: React.Dispatch<RealityAction>, getState: () => RealityState): AIOrchestrationModule => {
    const triggerInference = async (taskType: AITask['taskType'], entityId: EntityId, entityType: EntityType, modelId: string = 'default-ai-model'): Promise<AITask> => {
        dispatch({ type: 'FETCH_START', key: `ai/inference/${taskType}/${entityId}` });
        try {
            const state = getState();
            const entity = (state as any)[entityType.toLowerCase() + 's'][entityId];
            if (!entity) throw new Error(`Entity ${entityType}/${entityId} not found for AI task.`);

            const now = new Date().toISOString();
            const taskId = nanoid();
            const newAITask: AITask = {
                id: taskId,
                createdAt: now,
                updatedAt: now,
                createdBy: state.systemSettings.currentUserProfile?.id || 'system-ai-trigger',
                updatedBy: state.systemSettings.currentUserProfile?.id || 'system-ai-trigger',
                version: 1,
                tenantId: state.systemSettings.activeTenantId || AppConfig.DEFAULT_TENANT_ID,
                isArchived: false,
                status: 'pending',
                tags: ['ai-triggered', `task-${taskType}`, `model-${modelId}`],
                metadata: { sourceEntityType: entityType, sourceEntityId: entityId },
                type: 'AITask',
                modelId: modelId,
                taskType: taskType,
                inputDataRef: { entityType, entityId },
                inputContent: JSON.stringify(entity), // Actual input might be pre-processed/vectorized
                outputDataRef: null,
                outputContent: null,
                triggeredBy: 'system', // Could be 'user' if initiated by UI
                executionTimeMs: null,
                costEstimate: null,
                feedback: null,
                errorDetails: null,
                retries: 0,
                priority: 'medium',
            };

            dispatch({ type: 'ENTITY_UPSERT', entityType: 'AITask', payload: newAITask, userId: newAITask.createdBy });

            // Simulate AI processing
            const simulatedExecutionTime = Math.random() * 5000 + 1000; // 1-6 seconds
            await new Promise(resolve => setTimeout(resolve, simulatedExecutionTime));

            const updatedTask: AITask = produce(getState().aiTasks[taskId] || newAITask, draft => { // Re-fetch task to ensure it's current
                draft.status = 'completed';
                draft.updatedAt = new Date().toISOString();
                draft.executionTimeMs = simulatedExecutionTime;
                // Example output based on task type
                if (taskType === 'sentiment_analysis') {
                    draft.outputContent = JSON.stringify({ sentiment: Math.random() > 0.5 ? 'positive' : 'negative', score: Math.random().toFixed(2) });
                } else if (taskType === 'summarization') {
                    draft.outputContent = `Summary of ${entityType} ${entityId}: This is a high-level AI-generated summary. The key points are A, B, and C.`;
                } else if (taskType === 'prediction') {
                    draft.outputContent = JSON.stringify({ predictedValue: Math.random() * 1000, confidence: 0.95, explanation: "Based on historical data patterns." });
                } else if (taskType === 'classification' && entityType === 'Transaction') {
                    draft.outputContent = JSON.stringify({ predictedCategory: Math.random() > 0.7 ? 'Groceries' : (Math.random() > 0.5 ? 'Utilities' : 'Entertainment'), confidence: 0.88 });
                    // Automatically update transaction category (Year 8: Autonomous action)
                    const transaction = getState().transactions[entityId];
                    if (transaction && AppConfig.ENABLE_AI_CO_PILOT_ASSISTANCE) {
                        const predictedCategoryId = Object.values(getState().categories).find(c => c.name === JSON.parse(draft.outputContent!).predictedCategory)?.id;
                        if (predictedCategoryId && transaction.categoryId !== predictedCategoryId) {
                            dispatch({
                                type: 'APPLY_PATCHES',
                                entityType: 'Transaction',
                                id: entityId,
                                patches: [{ op: 'replace', path: '/categoryId', value: predictedCategoryId }],
                                inversePatches: [{ op: 'replace', path: '/categoryId', value: transaction.categoryId }],
                                userId: 'system-ai-agent',
                                correlationId: nanoid(),
                            });
                        }
                    }
                }
            });
            dispatch({ type: 'ENTITY_UPSERT', entityType: 'AITask', payload: updatedTask, userId: updatedTask.updatedBy });

            if (updatedTask.outputContent && 'ai_insights' in entity) {
                dispatch({
                    type: 'AI_INSIGHT_TRIGGERED',
                    entityType: entityType,
                    entityId: entityId,
                    insight: `AI generated insight from ${taskType} task ${taskId}: ${updatedTask.outputContent}`,
                    triggeredBy: 'system-ai',
                    aiTaskId: taskId,
                });
            }
            dispatch({ type: 'FETCH_SUCCESS', key: `ai/inference/${taskType}/${entityId}` });
            dispatch({ type: 'REPORT_METRIC', metric: `ai_task_completed`, value: 1, tags: { taskType, modelId, status: 'completed' } });
            return updatedTask;
        } catch (error) {
            dispatch({ type: 'FETCH_ERROR', key: `ai/inference/${taskType}/${entityId}`, error });
            dispatch({ type: 'REPORT_METRIC', metric: `ai_task_completed`, value: 1, tags: { taskType, modelId, status: 'failed' } });
            throw error;
        }
    };

    const getAITaskStatus = async (taskId: string): Promise<AITask> => {
        const state = getState();
        const task = state.aiTasks[taskId];
        if (!task) throw new Error(`AI Task ${taskId} not found.`);
        return task;
    };

    const provideFeedback = async (taskId: string, rating: number, comment: string, userId: string): Promise<AITask> => {
        dispatch({ type: 'FETCH_START', key: `ai/feedback/${taskId}` });
        try {
            const state = getState();
            const task = state.aiTasks[taskId];
            if (!task) throw new Error(`AI Task ${taskId} not found.`);

            const updatedTask = produce(task, draft => {
                if (!draft.feedback) draft.feedback = [];
                draft.feedback.push({ rating, comment, userId, timestamp: new Date().toISOString() });
                draft.updatedAt = new Date().toISOString();
                draft.updatedBy = userId;
            });
            dispatch({ type: 'ENTITY_UPSERT', entityType: 'AITask', payload: updatedTask, userId: updatedTask.updatedBy });
            dispatch({ type: 'FETCH_SUCCESS', key: `ai/feedback/${taskId}` });
            dispatch({ type: 'REPORT_METRIC', metric: 'ai_feedback_provided', value: rating, tags: { taskId, modelId: task.modelId, taskType: task.taskType, userId } });
            return updatedTask;
        } catch (error) {
            dispatch({ type: 'FETCH_ERROR', key: `ai/feedback/${taskId}`, error });
            throw error;
        }
    };

    const recommendActions = async (context: Record<string, any>): Promise<{ action: string; confidence: number; justification: string; }[]> => {
        dispatch({ type: 'FETCH_START', key: 'ai/recommendations' });
        try {
            console.log('Requesting AI action recommendations:', context);
            await new Promise(resolve => setTimeout(resolve, 1500));
            dispatch({ type: 'FETCH_SUCCESS', key: 'ai/recommendations' });
            return [
                { action: 'Suggest new objective: Increase Q3 revenue by 15%', confidence: 0.85, justification: "Based on recent performance trends and market analysis." },
                { action: 'Flag unusual transaction for review', confidence: 0.92, justification: "Transaction amount is significantly higher than usual for this category and user." },
                { action: 'Propose covenant amendment for privacy policy', confidence: 0.70, justification: "New data governance regulations detected; policy requires update." },
            ];
        } catch (error) {
            dispatch({ type: 'FETCH_ERROR', key: 'ai/recommendations', error });
            throw error;
        }
    };

    const deployAutonomousAgent = async (config: any): Promise<any> => {
        dispatch({ type: 'FETCH_START', key: 'ai/deployAgent' });
        try {
            console.log('Deploying autonomous agent with config:', config);
            await new Promise(resolve => setTimeout(resolve, 3000));
            const agentId = `agent-${nanoid()}`;
            const agentState = {
                id: agentId,
                status: 'deployed',
                config,
                logs: [{ timestamp: new Date().toISOString(), message: 'Agent deployed.' }],
                metrics: { cpu: 0, memory: 0, tasksCompleted: 0 },
                lastActivity: new Date().toISOString(),
            };
            dispatch({
                type: 'APPLY_PATCHES',
                entityType: 'systemSettings' as EntityType, // A new top-level entity 'AutonomousAgents' would be better
                id: 'autonomousAgentsState', // Patching a specific part of systemSettings
                patches: [{ op: 'add', path: `/autonomousAgentsState/${agentId}`, value: agentState }],
                inversePatches: [{ op: 'remove', path: `/autonomousAgentsState/${agentId}` }],
                userId: getState().systemSettings.currentUserProfile?.id || 'system-agent-deployer',
                correlationId: nanoid(),
            });
            dispatch({ type: 'FETCH_SUCCESS', key: 'ai/deployAgent' });
            dispatch({ type: 'REPORT_METRIC', metric: 'ai_agent_deployed', value: 1, tags: { agentId, configType: config.type } });
            return agentState;
        } catch (error) {
            dispatch({ type: 'FETCH_ERROR', key: 'ai/deployAgent', error });
            throw error;
        }
    };

    const monitorAgentActivity = async (agentId: string): Promise<any> => {
        const state = getState();
        return state.autonomousAgentsState[agentId];
    };

    const getAIAssistantResponse = async (prompt: string, contextEntities: Entity[] = []): Promise<{ response: string; model: string; }> => {
        dispatch({ type: 'FETCH_START', key: 'ai/assistant' });
        try {
            console.log(`AI Co-pilot: ${prompt}`, contextEntities);
            await new Promise(resolve => setTimeout(resolve, 2000));
            const response = `Based on your prompt "${prompt}" and the provided context (e.g., ${contextEntities.length} entities), the AI co-pilot suggests: "This is a detailed and insightful response generated by a sophisticated large language model."`;
            dispatch({ type: 'FETCH_SUCCESS', key: 'ai/assistant' });
            dispatch({ type: 'REPORT_METRIC', metric: 'ai_assistant_query', value: 1, tags: { model: 'GPT-X', userId: getState().systemSettings.currentUserProfile?.id || 'anonymous' } });
            return { response, model: 'GPT-X (Year 10)' };
        } catch (error) {
            dispatch({ type: 'FETCH_ERROR', key: 'ai/assistant', error });
            throw error;
        }
    };

    return { triggerInference, getAITaskStatus, provideFeedback, recommendActions, deployAutonomousAgent, monitorAgentActivity, getAIAssistantResponse };
};

// --- 10. Global Event Bus (Year 8: Micro-frontend/Service Communication) ---
export const createEventBus = () => {
    const subscribers = new Map<string, Set<(data: any) => void>>();

    const publish = (topic: string, data: any) => {
        // console.debug(`EventBus: Publishing topic "${topic}" with data:`, data);
        if (subscribers.has(topic)) {
            subscribers.get(topic)?.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in EventBus subscriber for topic "${topic}":`, error);
                }
            });
        }
    };

    const subscribe = (topic: string, callback: (data: any) => void) => {
        if (!subscribers.has(topic)) {
            subscribers.set(topic, new Set());
        }
        subscribers.get(topic)?.add(callback);
        // console.debug(`EventBus: Subscribed to topic "${topic}"`);

        return () => {
            subscribers.get(topic)?.delete(callback);
            if (subscribers.get(topic)?.size === 0) {
                subscribers.delete(topic);
            }
            // console.debug(`EventBus: Unsubscribed from topic "${topic}"`);
        };
    };

    return { publish, subscribe };
};

// --- 11. Schema & Migration Tools (Year 9: Data Integrity & Evolution) ---
const createSchemaModule = (getState: () => RealityState, dispatch: React.Dispatch<RealityAction>): DataContextType['schema'] => {
    // A more advanced system would load JSON schemas dynamically or from a schema registry.
    // Here, we maintain them locally.
    const registeredEntitySchemas = useRef<Record<EntityType, any>>({
        UserProfile: { /* JSON Schema definition for UserProfile */ },
        Transaction: { /* JSON Schema definition for Transaction */ },
        Covenant: { /* JSON Schema definition for Covenant */ },
        Objective: { /* JSON Schema definition for Objective */ },
        Organization: { /* JSON Schema definition for Organization */ },
        Account: { /* JSON Schema definition for Account */ },
        Category: { /* JSON Schema definition for Category */ },
        EventLog: { /* JSON Schema definition for EventLog */ },
        AITask: { /* JSON Schema definition for AITask */ },
        DataGovernancePolicy: { /* JSON Schema definition for DataGovernancePolicy */ },
        DashboardLayout: { /* JSON Schema definition for DashboardLayout */ },
        Notification: { /* JSON Schema definition for Notification */ },
        ReportSchedule: { /* JSON Schema definition for ReportSchedule */ },
        WebhookSubscription: { /* JSON Schema definition for WebhookSubscription */ },
    });

    const validateEntity = async (entityType: EntityType, entity: Entity): Promise<boolean> => {
        // For a real implementation, use a library like `ajv` to validate against JSON schema
        const schema = registeredEntitySchemas.current[entityType];
        if (!schema) {
            console.warn(`No schema found for entity type ${entityType}. Validation skipped.`);
            return true;
        }
        // const validator = new Ajv().compile(schema);
        // const isValid = validator(entity);
        // if (!isValid) {
        //     console.error(`Schema validation failed for ${entityType} ${entity.id}:`, validator.errors);
        //     dispatch({ type: 'SYSTEM_NOTIFICATION_ADD', payload: { type: 'Notification', title: 'Schema Validation Failed', message: `Entity ${entity.type}/${entity.id} failed schema validation.`, recipientId: getState().systemSettings.currentUserProfile?.id || 'global', severity: 'error', category: 'system' } });
        // }
        // return isValid;
        return true; // Placeholder for actual validation logic
    };

    const migrateEntity = async (entity: Entity, targetVersion: string): Promise<Entity> => {
        console.log(`Migrating entity ${entity.id} (${entity.type}) from ${entity.metadata.schemaVersion || 'unknown'} to ${targetVersion}`);
        // This is a placeholder; actual migration would apply specific transformations
        // based on the current and target versions of the entity's own schema.
        // For simplicity, we just update the metadata
        return produce(entity, draft => {
            draft.metadata.schemaVersion = targetVersion;
            draft.version++;
        });
    };

    const getCurrentSchemaVersion = () => AppConfig.SCHEMA_VERSION;
    const getAllEntityTypes = (): EntityType[] => Object.keys(registeredEntitySchemas.current) as EntityType[];
    const getEntitySchema = (entityType: EntityType) => registeredEntitySchemas.current[entityType];
    const registerSchema = (entityType: EntityType, schema: any) => {
        registeredEntitySchemas.current = { ...registeredEntitySchemas.current, [entityType]: schema };
        console.log(`Schema registered for entity type: ${entityType}`);
    };

    return { validateEntity, migrateEntity, getCurrentSchemaVersion, getAllEntityTypes, getEntitySchema, registerSchema };
};

// --- 12. Diagnostics Module (Year 10: Monitoring & Performance) ---
const createDiagnosticsModule = (dispatch: React.Dispatch<RealityAction>) => {
    let dispatchCounter = 0;
    let totalDispatchTime = 0;
    let renderCounter = 0;
    const apiCallMetrics: { endpoint: string; method: string; durationMs: number; success: boolean; statusCode?: number; timestamp: string; }[] = [];
    const MAX_API_METRIC_HISTORY = 1000;

    const recordDispatch = (timeMs: number) => {
        dispatchCounter++;
        totalDispatchTime += timeMs;
    };

    const recordRender = () => {
        renderCounter++;
    };

    const getMemoryUsage = () => {
        if (typeof window !== 'undefined' && (window.performance as any)?.memory) {
            const memory = (window.performance as any).memory;
            return {
                jsHeapSizeLimit: memory.jsHeapSizeLimit,
                totalJSHeapSize: memory.totalJSHeapSize,
                usedJSHeapSize: memory.usedJSHeapSize,
            };
        }
        return { jsHeapSizeLimit: 0, totalJSHeapSize: 0, usedJSHeapSize: 0 };
    };

    const getPerformanceMetrics = () => {
        return {
            dispatchCount: dispatchCounter,
            renderCount: renderCounter,
            avgDispatchTimeMs: dispatchCounter > 0 ? totalDispatchTime / dispatchCounter : 0,
        };
    };

    const logSystemActivity = (level: 'info' | 'warn' | 'error' | 'debug', message: string, context?: Record<string, any>) => {
        const timestamp = new Date().toISOString();
        // In a real application, this would send to a centralized logging service (e.g., Elastic, Splunk, DataDog)
        if (AppConfig.ENABLE_METRICS_REPORTING) {
            console[level](`[${timestamp}][DIAGNOSTICS][${level.toUpperCase()}] ${message}`, context);
            // Dispatch a metric to be handled by an external analytics system if desired
            dispatch({ type: 'REPORT_METRIC', metric: `log_${level}_count`, value: 1, tags: { message: message.substring(0, 50), ...context } });
        }
    };

    const recordApiCall = (endpoint: string, method: string, durationMs: number, success: boolean, statusCode?: number) => {
        if (AppConfig.ENABLE_METRICS_REPORTING) {
            apiCallMetrics.push({ endpoint, method, durationMs, success, statusCode, timestamp: new Date().toISOString() });
            if (apiCallMetrics.length > MAX_API_METRIC_HISTORY) {
                apiCallMetrics.shift(); // Keep history size bounded
            }
            dispatch({ type: 'REPORT_METRIC', metric: 'api_latency', value: durationMs, tags: { endpoint, method, success: String(success), statusCode: String(statusCode) } });
            dispatch({ type: 'REPORT_METRIC', metric: 'api_call_count', value: 1, tags: { endpoint, method, success: String(success), statusCode: String(statusCode) } });
        }
    };

    return { recordDispatch, recordRender, getMemoryUsage, getPerformanceMetrics, logSystemActivity, recordApiCall };
};

// --- 13. Internationalization Module (Year 8) ---
const createI18nModule = (dispatch: React.Dispatch<RealityAction>, getState: () => RealityState): DataContextType['i18n'] => {
    // In a real app, this would integrate with a full i18n library (e.g., i18next, react-intl)
    // and load translations dynamically.
    const translations: Record<string, Record<string, string>> = {
        'en-US': {
            'greeting': 'Hello, {name}!',
            'transaction.add.success': 'Transaction added successfully.',
            'error.permissionDenied': 'Permission denied for this action.',
            'system.loading': 'Loading data...',
            'notifications.new': 'You have {count} new notifications.',
            'ai.recommendation.flag': 'AI recommends flagging this item.',
            'data.compliance.violation': 'Compliance violation detected.',
        },
        'es-ES': {
            'greeting': '¡Hola, {name}!',
            'transaction.add.success': 'Transacción añadida con éxito.',
            'error.permissionDenied': 'Permiso denegado para esta acción.',
            'system.loading': 'Cargando datos...',
            'notifications.new': 'Tienes {count} nuevas notificaciones.',
            'ai.recommendation.flag': 'La IA recomienda marcar este artículo.',
            'data.compliance.violation': 'Violación de cumplimiento detectada.',
        },
    };

    const getLocale = () => getState().systemSettings.i18n.locale;

    const setLocale = (locale: string) => {
        if (translations[locale]) {
            dispatch({ type: 'UPDATE_SYSTEM_SETTING', key: 'i18n', value: { locale }, userId: getState().systemSettings.currentUserProfile?.id || 'system-i18n' });
            console.log(`Locale set to: ${locale}`);
        } else {
            console.warn(`Locale ${locale} not supported. Using default.`);
        }
    };

    const t = (key: string, params?: Record<string, string | number>): string => {
        const locale = getLocale();
        let message = translations[locale]?.[key] || translations[AppConfig.I18N_DEFAULT_LOCALE]?.[key] || key;
        if (params) {
            for (const paramKey in params) {
                message = message.replace(`{${paramKey}}`, String(params[paramKey]));
            }
        }
        return message;
    };

    return { setLocale, getLocale, t };
};

// --- 14. Feature Flags Module (Year 6) ---
const createFeatureFlagsModule = (dispatch: React.Dispatch<RealityAction>, getState: () => RealityState): DataContextType['featureFlags'] => {
    const getFlag = (flag: string): boolean => {
        // Evaluate system-wide, tenant-specific, and user-specific flags
        const state = getState();
        if (AppConfig.ENABLE_FEATURE_FLAGS) {
            // Priority: User > Tenant > System Default
            const userFlags = state.systemSettings.currentUserProfile?.settings?.featureFlags || {}; // Assuming user profile can override
            const orgFlags = state.organizations[state.systemSettings.activeTenantId]?.settings?.featureAccess || {};

            if (flag in userFlags) return userFlags[flag];
            if (flag in orgFlags) return orgFlags[flag];
            if (flag in state.featureFlags) return state.featureFlags[flag];
        }
        return false; // Default to false if flag not found or system disabled
    };

    const setFlag = (flag: string, value: boolean) => {
        dispatch({ type: 'SET_FEATURE_FLAG', flag, value, userId: getState().systemSettings.currentUserProfile?.id || 'system-feature-flag' });
    };

    return { getFlag, setFlag };
};

// --- 15. A/B Testing Module (Year 6) ---
const createABTestingModule = (dispatch: React.Dispatch<RealityAction>, getState: () => RealityState): DataContextType['abTesting'] => {
    // For simplicity, A/B test definitions are in state. In real-world, often configured remotely.
    const getVariant = (testName: string, userId: string): string => {
        const state = getState();
        if (!AppConfig.ENABLE_AB_TESTING || !state.featureFlags.abTestingEnabled) return 'control'; // Fallback

        const test = state.abTests[testName];
        if (!test) {
            // Assign a variant if not already assigned (simple client-side assignment)
            const variants = ['control', 'variantA', 'variantB']; // Example
            const assignedVariant = variants[Math.floor(Math.random() * variants.length)];
            dispatch({
                type: 'APPLY_PATCHES',
                entityType: 'systemSettings' as EntityType, // Using systemSettings for simplicity
                id: 'abTests',
                patches: [{ op: 'add', path: `/abTests/${testName}`, value: { variant: assignedVariant, activeUsers: [userId] } }],
                inversePatches: [], // Inverse would be complex for arrays
                userId: 'system-ab-test',
                correlationId: nanoid(),
            });
            dispatch({ type: 'REPORT_METRIC', metric: 'ab_test_assignment', value: 1, tags: { testName, variant: assignedVariant, userId } });
            return assignedVariant;
        } else if (test.activeUsers.includes(userId)) {
            return test.variant;
        } else {
            // User not yet in this test, assign to existing variant (sticky assignment)
            dispatch({
                type: 'APPLY_PATCHES',
                entityType: 'systemSettings' as EntityType,
                id: 'abTests',
                patches: [{ op: 'add', path: `/abTests/${testName}/activeUsers/-`, value: userId }],
                inversePatches: [],
                userId: 'system-ab-test',
                correlationId: nanoid(),
            });
            return test.variant;
        }
    };

    const trackGoalCompletion = (testName: string, goal: string, userId: string) => {
        if (!AppConfig.ENABLE_AB_TESTING || !getState().featureFlags.abTestingEnabled) return;
        const variant = getVariant(testName, userId); // Ensure user is tracked for this test
        dispatch({ type: 'REPORT_METRIC', metric: `ab_test_goal_${goal}_completed`, value: 1, tags: { testName, variant, userId } });
        console.log(`A/B Test: ${testName}, User ${userId} (Variant: ${variant}) completed goal: ${goal}`);
    };

    return { getVariant, trackGoalCompletion };
};

// --- 16. Search and Indexing Module (Year 9: Client-side Search) ---
// For very large datasets, this would be an external search service (Elasticsearch, Algolia).
// For client-side, it uses a simple in-memory inverted index or libraries like `fuse.js`.
const createSearchModule = (getState: () => RealityState): DataContextType['search'] => {
    const entityIndex = new Map<EntityType, Map<EntityId, Entity>>(); // Store entities by type and ID
    const invertedIndex = new Map<string, Set<string>>(); // word -> set of "entityType:entityId"

    const indexEntity = useCallback((entity: Entity) => {
        if (!entityIndex.has(entity.type)) {
            entityIndex.set(entity.type, new Map());
        }
        entityIndex.get(entity.type)?.set(entity.id, entity);

        // Simple full-text indexing (Year 9)
        const searchableFields = ['name', 'description', 'username', 'email', 'terms', 'notes', 'message', 'title', 'publicBio'];
        const text = searchableFields.map(field => (entity as any)[field] || '').join(' ').toLowerCase();
        const words = text.split(/\s+/).filter(word => word.length > 2); // Simple tokenization

        const entityRef = `${entity.type}:${entity.id}`;
        words.forEach(word => {
            if (!invertedIndex.has(word)) {
                invertedIndex.set(word, new Set());
            }
            invertedIndex.get(word)?.add(entityRef);
        });
    }, []);

    const rebuildIndex = useCallback(() => {
        entityIndex.clear();
        invertedIndex.clear();
        const state = getState();
        Object.values(state.users).forEach(indexEntity);
        Object.values(state.transactions).forEach(indexEntity);
        Object.values(state.covenants).forEach(indexEntity);
        Object.values(state.objectives).forEach(indexEntity);
        Object.values(state.organizations).forEach(indexEntity);
        Object.values(state.accounts).forEach(indexEntity);
        Object.values(state.categories).forEach(indexEntity);
        Object.values(state.aiTasks).forEach(indexEntity);
        Object.values(state.dataGovernancePolicies).forEach(indexEntity);
        Object.values(state.dashboardLayouts).forEach(indexEntity);
        Object.values(state.notifications).forEach(indexEntity);
        Object.values(state.reportSchedules).forEach(indexEntity);
        Object.values(state.webhookSubscriptions).forEach(indexEntity);
        console.log('Search index rebuilt.');
    }, [indexEntity, getState]);

    useEffect(() => {
        rebuildIndex();
    }, [getState().version, rebuildIndex]); // Rebuild on major state changes or explicit trigger

    const searchEntities = useCallback((query: string, entityTypes?: EntityType[]): Entity[] => {
        if (!query) return [];
        const normalizedQuery = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
        if (normalizedQuery.length === 0) return [];

        let resultSet: Set<string> | null = null;

        for (const word of normalizedQuery) {
            const matches = invertedIndex.get(word);
            if (!matches) {
                return []; // No matches for this word, so no results for the query
            }
            if (!resultSet) {
                resultSet = new Set(matches);
            } else {
                resultSet = new Set([...resultSet].filter(item => matches.has(item)));
            }
        }

        if (!resultSet) return [];

        const results: Entity[] = [];
        resultSet.forEach(entityRef => {
            const [type, id] = entityRef.split(':');
            if (entityTypes && !entityTypes.includes(type as EntityType)) {
                return; // Skip if entity type not in filter
            }
            const entity = entityIndex.get(type as EntityType)?.get(id);
            if (entity) {
                results.push(entity);
            }
        });

        // Year 9: Add relevance scoring (e.g., TF-IDF or simple keyword density)
        // For now, return unsorted.
        return results;
    }, [entityIndex, invertedIndex]);

    return { indexEntity, searchEntities };
};

// --- 17. Plugin Management Module (Year 10: Extensibility) ---
const createPluginModule = (contextRef: React.MutableRefObject<DataContextType | undefined>) => {
    const registeredPlugins = useRef<Map<string, (context: DataContextType) => void>>(new Map());
    const initializedPlugins = useRef<Set<string>>(new Set());

    const registerPlugin = (pluginId: string, setupFunction: (context: DataContextType) => void) => {
        if (registeredPlugins.has(pluginId)) {
            console.warn(`Plugin '${pluginId}' already registered. Skipping.`);
            return;
        }
        registeredPlugins.current.set(pluginId, setupFunction);
        console.log(`Plugin '${pluginId}' registered.`);
        // If context is already available, initialize immediately
        if (contextRef.current && !initializedPlugins.current.has(pluginId)) {
            try {
                setupFunction(contextRef.current);
                initializedPlugins.current.add(pluginId);
                console.log(`Plugin '${pluginId}' initialized immediately.`);
            } catch (error) {
                console.error(`Error initializing plugin '${pluginId}':`, error);
            }
        }
    };

    const initializeAllPlugins = useCallback(() => {
        if (!contextRef.current) {
            console.warn('Cannot initialize plugins: DataContext not yet available.');
            return;
        }
        registeredPlugins.current.forEach((setupFunction, pluginId) => {
            if (!initializedPlugins.current.has(pluginId)) {
                try {
                    setupFunction(contextRef.current!);
                    initializedPlugins.current.add(pluginId);
                    console.log(`Plugin '${pluginId}' initialized.`);
                } catch (error) {
                    console.error(`Error initializing plugin '${pluginId}':`, error);
                }
            }
        });
    }, []);

    // Other plugin management functions like 'enablePlugin', 'disablePlugin', 'updatePlugin' could be added.

    return { registerPlugin, initializeAllPlugins };
};


// --- The Main Data Context (Year 1: Foundation, then growing) ---
export const RealityDataContext = createContext<DataContextType | undefined>(undefined);

export const RealityDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Refs for stable access to current state and user in modules
    const currentUserId = useRef<string | null>(null);
    const activeTenantIdRef = useRef<string>(AppConfig.DEFAULT_TENANT_ID);
    const getStateRef = useRef<() => RealityState>(() => initialRealityState); // Initialized to initial state, updated by useEffect

    const contextValueRef = useRef<DataContextType | undefined>(undefined); // For plugins to access full context

    // --- Module Creation (Memoized) ---
    // Diagnostics needs to be first as it's used by other modules
    const diagnostics = useMemo(() => createDiagnosticsModule((action) => temporalDispatch({ current: getStateRef.current(), temporal: initialTemporalState }, action, currentUserId.current).current)), []);

    // Reducer for core state and temporal history
    const [stateWithTemporal, temporalDispatch] = useReducer((s: { current: RealityState; temporal: TemporalState }, a: RealityAction) => {
        const start = performance.now();
        const newState = temporalReducer(s, a, currentUserId.current);
        const end = performance.now();
        diagnostics.recordDispatch(end - start);
        return newState;
    }, { current: initialRealityState, temporal: initialTemporalState });

    const state = stateWithTemporal.current;
    const temporal = stateWithTemporal.temporal;

    const [loading, setLoadingState] = React.useState<LoadingState>({});
    const [errors, setErrorState] = React.useState<ErrorState>({});
    const [currentUser, setCurrentUser] = React.useState<UserProfile | null>(null); // Derived from state.systemSettings.currentUserProfile
    const [activeTenantId, setActiveTenantId] = React.useState<string>(AppConfig.DEFAULT_TENANT_ID); // Derived from state.systemSettings.activeTenantId

    // Update getStateRef with the latest state
    useEffect(() => {
        getStateRef.current = () => state;
    }, [state]);

    // Derived values from state that update frequently, memoized for stability
    const getFlag = useCallback((flag: string) => {
        const userFlags = state.systemSettings.currentUserProfile?.settings?.featureFlags || {};
        const orgFlags = state.organizations[state.systemSettings.activeTenantId]?.settings?.featureAccess || {};

        if (flag in userFlags) return userFlags[flag];
        if (flag in orgFlags) return orgFlags[flag];
        return state.featureFlags[flag] ?? false; // Fallback to system-wide flag, then false
    }, [state.featureFlags, state.organizations, state.systemSettings.activeTenantId, state.systemSettings.currentUserProfile]);

    const featureFlagsModule = useMemo(() => createFeatureFlagsModule(temporalDispatch, getStateRef.current), [temporalDispatch, getFlag]);
    const abTestingModule = useMemo(() => createABTestingModule(temporalDispatch, getStateRef.current), [temporalDispatch]);

    // Global event bus (singleton pattern)
    const eventBus = useMemo(createEventBus, []);

    // Module initialization that depends on other modules or state
    const authModule = useMemo(() => createAuthModule(temporalDispatch, currentUserId, activeTenantIdRef, getStateRef.current), [temporalDispatch]);
    const realtimeModule = useMemo(() => createRealtimeSubscriptionManager(temporalDispatch, diagnostics), [temporalDispatch, diagnostics]);
    const governanceModule = useMemo(() => createDataGovernanceModule(getStateRef.current, temporalDispatch), [temporalDispatch]);
    const aiModule = useMemo(() => createAIOrchestrationModule(temporalDispatch, getStateRef.current), [temporalDispatch]);
    const schemaModule = useMemo(() => createSchemaModule(getStateRef.current, temporalDispatch), [temporalDispatch]);
    const i18nModule = useMemo(() => createI18nModule(temporalDispatch, getStateRef.current), [temporalDispatch]);
    const searchModule = useMemo(() => createSearchModule(getStateRef.current), []); // Search module is updated by effect
    const pluginModule = useMemo(() => createPluginModule(contextValueRef), []);


    // Effect for initial load and persistence (Year 3)
    useEffect(() => {
        const initialize = async () => {
            diagnostics.logSystemActivity('info', 'Initializing RealityDataProvider...');
            realtimeModule.connect(); // Connect to real-time stream
            const persistedState = await loadStateFromLocalStorage();
            if (persistedState) {
                // Apply patches to initial state, instead of full reset, to keep existing hooks stable where possible
                // This is a complex operation and for full state reset, `RESET_STATE` is simpler.
                temporalDispatch({ type: 'RESET_STATE', payload: persistedState, userId: 'system-loader' });
                diagnostics.logSystemActivity('info', 'State loaded from local storage.');
            } else {
                diagnostics.logSystemActivity('info', 'No persisted state found, starting with initial state.');
            }

            // Ensure initial system user/data for demo if not loaded
            const currentStateAfterLoad = getStateRef.current();
            if (Object.keys(currentStateAfterLoad.users).length === 0) {
                 const initialAdmin: UserProfile = {
                    id: 'user-admin-1',
                    type: 'UserProfile',
                    username: 'admin',
                    email: 'admin@realitycore.io',
                    roles: ['admin', 'developer', 'auditor', 'global_admin'],
                    permissions: ['read:any', 'create:any', 'update:any', 'delete:any', 'manage:permissions', 'debug:system', 'manage:tenants', 'view:auditlogs', 'manage:policies'],
                    settings: { theme: 'dark', locale: AppConfig.I18N_DEFAULT_LOCALE, timezone: 'UTC', notifications: { email: true, push: true, sms: false }, preferredAIModels: ['all'], accessibilityOptions: { highContrast: false, largeText: false, screenReader: false } },
                    lastLogin: new Date().toISOString(),
                    oauthProviders: [],
                    twoFactorEnabled: true,
                    biometricKeys: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    createdBy: 'system',
                    updatedBy: 'system',
                    version: 1,
                    tenantId: AppConfig.DEFAULT_TENANT_ID,
                    isArchived: false,
                    status: 'active',
                    tags: ['system-user'],
                    metadata: { initialSetup: true },
                    profileImageUrl: 'https://cdn.realitycore.io/avatars/admin.png',
                    publicBio: 'Chief Administrator of Reality Core.',
                };
                temporalDispatch({ type: 'ENTITY_UPSERT', entityType: 'UserProfile', payload: initialAdmin, userId: 'system-init' });
                temporalDispatch({ type: 'SET_CURRENT_USER', payload: initialAdmin }); // Set as initial current user
                currentUserId.current = initialAdmin.id;

                const initialOrg: Organization = {
                    id: AppConfig.DEFAULT_TENANT_ID,
                    type: 'Organization',
                    name: 'Global Reality Corp',
                    legalName: 'Global Reality Corporation Inc.',
                    domain: 'realitycore.io',
                    contactEmail: 'contact@realitycore.io',
                    address: { street: '1 Reality Way', city: 'Metropolis', state: 'CA', zip: '90210', country: 'USA' },
                    parentOrgId: null,
                    hierarchyPath: [],
                    industry: 'Software & AI',
                    employees: [initialAdmin.id],
                    settings: {
                        dataRetentionPolicy: '7-years-financial',
                        securityPolicyLevel: 'strict',
                        customBranding: { logoUrl: 'https://cdn.realitycore.io/logo.png', primaryColor: '#007bff', secondaryColor: '#6c757d', fontStack: 'Roboto, sans-serif' },
                        featureAccess: { advancedAIReports: true, customWidgets: true },
                    },
                    integrations: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    createdBy: 'system',
                    updatedBy: 'system',
                    version: 1,
                    tenantId: AppConfig.DEFAULT_TENANT_ID,
                    isArchived: false,
                    status: 'active',
                    tags: ['system-org'],
                    metadata: {},
                };
                temporalDispatch({ type: 'ENTITY_UPSERT', entityType: 'Organization', payload: initialOrg, userId: 'system-init' });
                temporalDispatch({ type: 'SET_ACTIVE_TENANT', payload: initialOrg.id });
                activeTenantIdRef.current = initialOrg.id;
            }

            // Load translations (in a real app, this would be locale-specific)
            i18nModule.setLocale(AppConfig.I18N_DEFAULT_LOCALE);

            // Initialize plugins after core state is ready
            pluginModule.initializeAllPlugins();

            diagnostics.logSystemActivity('info', 'RealityDataProvider initialization complete.', { duration: performance.now() - (window as any)._initStartTime || 0 });
        };
        initialize();

        // Offline sync (Year 3: Background sync)
        const syncInterval = setInterval(() => {
            diagnostics.logSystemActivity('info', 'Attempting background offline sync...');
            persistStateToLocalStorage(getStateRef.current());
        }, AppConfig.OFFLINE_SYNC_INTERVAL_MS);


        return () => {
            realtimeModule.disconnect();
            clearInterval(syncInterval);
            diagnostics.logSystemActivity('info', 'RealityDataProvider unmounted, cleaning up.');
        };
    }, []); // Run only once on mount

    // Effect for currentUser and activeTenantId changes from state
    useEffect(() => {
        // Update local React state and refs based on global state changes
        if (!isEqual(state.systemSettings.currentUserProfile, currentUser)) { // Only update if actually different
            setCurrentUser(state.systemSettings.currentUserProfile);
            currentUserId.current = state.systemSettings.currentUserProfile?.id || null;
            diagnostics.logSystemActivity('debug', 'Current user updated.', { userId: currentUserId.current });
        }
        if (state.systemSettings.activeTenantId !== activeTenantId) {
            setActiveTenantId(state.systemSettings.activeTenantId);
            activeTenantIdRef.current = state.systemSettings.activeTenantId;
            diagnostics.logSystemActivity('debug', 'Active tenant updated.', { tenantId: activeTenantIdRef.current });
        }
    }, [state.systemSettings.currentUserProfile, state.systemSettings.activeTenantId, currentUser, activeTenantId]);

    // Rebuild search index when main entity data changes (simple trigger, could be more granular)
    useEffect(() => {
        searchModule.rebuildIndex();
    }, [
        state.users, state.transactions, state.covenants, state.objectives, state.organizations,
        state.accounts, state.categories, state.aiTasks, state.dataGovernancePolicies,
        state.dashboardLayouts, state.notifications, state.reportSchedules, state.webhookSubscriptions,
        searchModule
    ]);


    // Public dispatch wrapper for logging and side-effects (Year 4: Enhanced dispatch)
    const dispatch: React.Dispatch<RealityAction> = useCallback(action => {
        // Automatically add correlationId if not present (Year 8)
        const correlationId = (action as any).correlationId || nanoid();
        const actionWithCorrelation = { ...action, correlationId };

        // Publish to global event bus (Year 8)
        eventBus.publish(`action:${action.type}`, actionWithCorrelation);

        // Webhook trigger logic (Year 10)
        const stateNow = getStateRef.current();
        Object.values(stateNow.webhookSubscriptions).forEach(webhook => {
            const shouldTrigger = webhook.eventFilters.some(filter =>
                (filter.action === 'any' || filter.action === action.type) &&
                (filter.entityType === (action as any).entityType || !filter.entityType) // Assuming entityType for entity actions
            );
            if (shouldTrigger) {
                // Simulate sending webhook (in real app, this would be a background job/service)
                fetch(webhook.targetUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-Webhook-Signature': 'some_hmac_signature' },
                    body: JSON.stringify({ event: action.type, payload: (action as any).payload || (action as any).id, timestamp: new Date().toISOString(), correlationId }),
                }).then(response => {
                    diagnostics.logSystemActivity('info', `Webhook sent to ${webhook.targetUrl} for ${action.type}`, { status: response.status });
                    // Update webhook.deliveryAttempts
                }).catch(err => {
                    diagnostics.logSystemActivity('error', `Failed to send webhook to ${webhook.targetUrl} for ${action.type}`, { error: err.message });
                });
            }
        });

        temporalDispatch(actionWithCorrelation);
    }, [temporalDispatch, eventBus, diagnostics]);


    // --- Core Data Operations (Year 1: CRUD & Basic Query with Optimistic UI & Permissions) ---
    const upsertEntity = useCallback(async <T extends Entity>(entityType: T['type'], payload: T, optimisticKey?: string): Promise<T> => {
        const actingUserId = currentUserId.current || 'system';
        const correlationId = nanoid();
        const originalEntity = payload.id ? (state as any)[entityType.toLowerCase() + 's'][payload.id] : undefined;
        const originalVersion = originalEntity?.version || 0;

        if (!authModule.hasPermission(`create:${entityType}`, payload.id, entityType) && !authModule.hasPermission(`update:${entityType}`, payload.id, entityType)) {
            const errorMessage = i18nModule.t('error.permissionDenied');
            diagnostics.logSystemActivity('warn', errorMessage, { userId: actingUserId, entityType, entityId: payload.id, action: 'upsert' });
            throw new Error(errorMessage);
        }
        setLoading(`${entityType}/${payload.id}/upsert`, true);
        setError(`${entityType}/${payload.id}/upsert`, null);

        try {
            // Year 9: Schema Validation before upsert
            const isValid = await schemaModule.validateEntity(entityType, payload);
            if (!isValid) throw new Error(i18nModule.t('data.validation.failed', { type: entityType, id: payload.id }));

            // Year 6: Apply Data Governance policies (e.g., data masking on input, compliance checks)
            const governedPayload = await governanceModule.applyPolicy('masking', payload, actingUserId); // Example: mask sensitive fields on client input if rule exists
            const complies = await governanceModule.checkPolicy('compliance_on_save', governedPayload);
            if (!complies) throw new Error(i18nModule.t('data.compliance.violation'));

            const now = new Date().toISOString();
            const entityId = payload.id || nanoid();
            const finalPayload: T = {
                ...governedPayload,
                id: entityId,
                createdAt: originalEntity?.createdAt || now,
                createdBy: originalEntity?.createdBy || actingUserId,
                updatedAt: now,
                updatedBy: actingUserId,
                version: (originalEntity?.version || 0) + 1, // Client-side version bump
                tenantId: payload.tenantId || activeTenantIdRef.current,
                isArchived: payload.isArchived ?? false,
                status: payload.status || (originalEntity?.status || 'active'),
                tags: payload.tags || [],
                metadata: payload.metadata || {},
            };

            // Optimistic UI update (Year 5)
            if (optimisticKey) {
                const [, patches, inversePatches] = produceWithPatches(originalEntity || {} as T, draft => {
                    Object.assign(draft, finalPayload);
                });
                dispatch({ type: 'OPTIMISTIC_UPDATE_APPLY_LOCAL', key: optimisticKey, entityType, id: entityId, patches, inversePatches, originalVersion });
            }

            dispatch({ type: 'ENTITY_UPSERT', entityType, payload: finalPayload, userId: actingUserId, correlationId, optimisticKey });
            diagnostics.logSystemActivity('info', `Entity ${entityType}/${entityId} upserted.`, { userId: actingUserId, correlationId });

            // Simulate API call for remote persistence and real-time updates (Year 1-3)
            let result: T;
            let apiSuccess = false;
            let apiError: any = null;
            const apiStartTime = performance.now();

            try {
                // Real API call would go here
                await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100)); // Simulate network latency
                result = finalPayload; // For local-only demo, assume server confirms client-side state
                apiSuccess = true;
                // Trigger AI integration on certain entity types (Year 7)
                if (entityType === 'Transaction' && getFlag('aiCoPilotEnabled')) {
                    aiModule.triggerInference('classification', entityId, entityType);
                }
                if (optimisticKey) {
                    dispatch({ type: 'OPTIMISTIC_UPDATE_CONFIRM', key: optimisticKey, actualEntity: finalPayload });
                }
            } catch (err) {
                apiError = err;
                diagnostics.logSystemActivity('error', `API call failed for upsert ${entityType}/${entityId}:`, { error: err, userId: actingUserId });
                if (optimisticKey) {
                    dispatch({ type: 'OPTIMISTIC_UPDATE_FAIL', key: optimisticKey, error: err });
                }
                throw err; // Re-throw to be caught by the outer catch block
            } finally {
                diagnostics.recordApiCall(`${entityType}/upsert`, 'POST', performance.now() - apiStartTime, apiSuccess, apiSuccess ? 200 : 500);
            }
            setLoading(`${entityType}/${payload.id}/upsert`, false);
            dispatch({ type: 'SYSTEM_NOTIFICATION_ADD', payload: { type: 'Notification', title: i18nModule.t('transaction.add.success'), message: i18nModule.t('transaction.add.success.detail', { entityType, id: entityId }), recipientId: actingUserId, severity: 'success', category: 'personal' } });
            return result;
        } catch (err: any) {
            setError(`${entityType}/${payload.id}/upsert`, err);
            setLoading(`${entityType}/${payload.id}/upsert`, false);
            dispatch({ type: 'SYSTEM_NOTIFICATION_ADD', payload: { type: 'Notification', title: i18nModule.t('error.actionFailed'), message: err.message, recipientId: actingUserId, severity: 'error', category: 'alert' } });
            diagnostics.logSystemActivity('error', `Upsert operation failed for ${entityType}/${payload.id}:`, { error: err.message, userId: actingUserId, correlationId });
            throw err;
        }
    }, [dispatch, state, currentUserId, activeTenantIdRef, authModule, governanceModule, aiModule, schemaModule, setLoading, setError, diagnostics, i18nModule, getFlag]);


    const deleteEntity = useCallback(async (entityType: EntityType, id: EntityId, optimisticKey?: string): Promise<void> => {
        const actingUserId = currentUserId.current || 'system';
        const correlationId = nanoid();

        if (!authModule.hasPermission(`delete:${entityType}`, id, entityType)) {
            const errorMessage = i18nModule.t('error.permissionDenied');
            diagnostics.logSystemActivity('warn', errorMessage, { userId: actingUserId, entityType, entityId: id, action: 'delete' });
            throw new Error(errorMessage);
        }
        setLoading(`${entityType}/${id}/delete`, true);
        setError(`${entityType}/${id}/delete`, null);

        try {
            const entityToDelete = (state as any)[entityType.toLowerCase() + 's'][id];
            if (!entityToDelete) throw new Error(i18nModule.t('error.entityNotFound', { type: entityType, id }));

            // Year 6: Governance check before delete (e.g., retention policy prohibits early deletion)
            const canDelete = await governanceModule.checkPolicy('retention', entityToDelete);
            if (!canDelete) throw new Error(i18nModule.t('data.retention.policyViolation'));

            // Optimistic UI update for delete (Year 5)
            if (optimisticKey) {
                // For a delete, patches would be [{ op: 'remove', path: '' }] or marking as 'deleted'
                // Here we just mark for local deletion, actual remove might be server-side
                dispatch({
                    type: 'OPTIMISTIC_UPDATE_APPLY_LOCAL',
                    key: optimisticKey,
                    entityType,
                    id,
                    patches: [{ op: 'replace', path: '/status', value: 'deleted' }], // Local soft delete
                    inversePatches: [{ op: 'replace', path: '/status', value: entityToDelete.status }],
                    originalVersion: entityToDelete.version,
                });
            }

            dispatch({ type: 'ENTITY_DELETE', entityType, id, userId: actingUserId, correlationId, optimisticKey });
            diagnostics.logSystemActivity('info', `Entity ${entityType}/${id} deleted (soft).`, { userId: actingUserId, correlationId });

            let apiSuccess = false;
            let apiError: any = null;
            const apiStartTime = performance.now();
            try {
                await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100)); // Simulate API call
                apiSuccess = true;
                if (optimisticKey) {
                    dispatch({ type: 'OPTIMISTIC_UPDATE_CONFIRM', key: optimisticKey });
                }
            } catch (err) {
                apiError = err;
                diagnostics.logSystemActivity('error', `API call failed for delete ${entityType}/${id}:`, { error: err, userId: actingUserId });
                if (optimisticKey) {
                    dispatch({ type: 'OPTIMISTIC_UPDATE_FAIL', key: optimisticKey, error: err });
                }
                throw err;
            } finally {
                diagnostics.recordApiCall(`${entityType}/delete`, 'DELETE', performance.now() - apiStartTime, apiSuccess, apiSuccess ? 200 : 500);
            }
            setLoading(`${entityType}/${id}/delete`, false);
            dispatch({ type: 'SYSTEM_NOTIFICATION_ADD', payload: { type: 'Notification', title: i18nModule.t('data.delete.success'), message: i18nModule.t('data.delete.success.detail', { entityType, id }), recipientId: actingUserId, severity: 'success', category: 'personal' } });
        } catch (err: any) {
            setError(`${entityType}/${id}/delete`, err);
            setLoading(`${entityType}/${id}/delete`, false);
            dispatch({ type: 'SYSTEM_NOTIFICATION_ADD', payload: { type: 'Notification', title: i18nModule.t('error.actionFailed'), message: err.message, recipientId: actingUserId, severity: 'error', category: 'alert' } });
            diagnostics.logSystemActivity('error', `Delete operation failed for ${entityType}/${id}:`, { error: err.message, userId: actingUserId, correlationId });
            throw err;
        }
    }, [dispatch, state, currentUserId, authModule, governanceModule, setLoading, setError, diagnostics, i18nModule]);


    const batchUpsertEntities = useCallback(async (updates: { entityType: EntityType; payload: Entity; }[], optimisticKey?: string): Promise<Entity[]> => {
        const actingUserId = currentUserId.current || 'system';
        const correlationId = nanoid();
        setLoading(`batchUpsert`, true);
        setError(`batchUpsert`, null);

        try {
            const processedUpdates: { entityType: EntityType; payload: Entity; }[] = [];
            const now = new Date().toISOString();

            for (const { entityType, payload } of updates) {
                if (!authModule.hasPermission(`create:${entityType}`, payload.id, entityType) && !authModule.hasPermission(`update:${entityType}`, payload.id, entityType)) {
                    diagnostics.logSystemActivity('warn', i18nModule.t('error.permissionDeniedBatch', { type: entityType, id: payload.id }), { userId: actingUserId });
                    continue; // Skip unauthorized entities
                }
                const isValid = await schemaModule.validateEntity(entityType, payload);
                if (!isValid) {
                    diagnostics.logSystemActivity('warn', i18nModule.t('data.validation.failedBatch', { type: entityType, id: payload.id }), { userId: actingUserId });
                    continue; // Skip invalid entities
                }
                const existingEntity = (state as any)[entityType.toLowerCase() + 's'][payload.id];
                const governedPayload = await governanceModule.applyPolicy('masking', payload, actingUserId);

                const finalPayload: Entity = {
                    ...governedPayload,
                    id: payload.id || nanoid(),
                    createdAt: existingEntity?.createdAt || now,
                    createdBy: existingEntity?.createdBy || actingUserId,
                    updatedAt: now,
                    updatedBy: actingUserId,
                    version: (existingEntity?.version || 0) + 1,
                    tenantId: payload.tenantId || activeTenantIdRef.current,
                    isArchived: payload.isArchived ?? false,
                    status: payload.status || (existingEntity?.status || 'active'),
                    tags: payload.tags || [],
                    metadata: payload.metadata || {},
                };
                processedUpdates.push({ entityType, payload: finalPayload });
            }

            if (processedUpdates.length > 0) {
                // Optimistic UI for batch (Year 5)
                if (optimisticKey) {
                    // This would generate patches for each entity and store them
                    // For simplicity, we just mark the batch as pending
                    dispatch({
                        type: 'OPTIMISTIC_UPDATE_APPLY_LOCAL',
                        key: optimisticKey,
                        entityType: 'systemSettings' as EntityType, // Placeholder entity type for the batch status
                        id: 'batchUpsert',
                        patches: [], inversePatches: [], originalVersion: 0
                    });
                }

                // Dispatch a single batch action (assuming same entityType for simplicity)
                dispatch({
                    type: 'ENTITY_BATCH_UPSERT',
                    entityType: processedUpdates[0].entityType, // Assumes homogenous batch, extend for mixed
                    payloads: processedUpdates.map(u => u.payload),
                    userId: actingUserId,
                    correlationId,
                    optimisticKey,
                });
                diagnostics.logSystemActivity('info', `Batch upsert of ${processedUpdates.length} entities dispatched.`, { userId: actingUserId, correlationId });

                let apiSuccess = false;
                let apiError: any = null;
                const apiStartTime = performance.now();
                try {
                    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200)); // Simulate API call
                    apiSuccess = true;
                    // Trigger AI if applicable
                    if (getFlag('aiCoPilotEnabled') && processedUpdates.some(u => u.entityType === 'Transaction')) {
                        processedUpdates.filter(u => u.entityType === 'Transaction').forEach(u => aiModule.triggerInference('classification', u.payload.id, u.entityType));
                    }
                    if (optimisticKey) {
                        dispatch({ type: 'OPTIMISTIC_UPDATE_CONFIRM', key: optimisticKey });
                    }
                } catch (err) {
                    apiError = err;
                    diagnostics.logSystemActivity('error', `API call failed for batch upsert:`, { error: err, userId: actingUserId });
                    if (optimisticKey) {
                        dispatch({ type: 'OPTIMISTIC_UPDATE_FAIL', key: optimisticKey, error: err });
                    }
                    throw err;
                } finally {
                    diagnostics.recordApiCall(`batch/upsert`, 'POST', performance.now() - apiStartTime, apiSuccess, apiSuccess ? 200 : 500);
                }
            } else {
                diagnostics.logSystemActivity('warn', `No entities processed in batch upsert due to permissions or validation.`, { userId: actingUserId, correlationId });
            }
            setLoading(`batchUpsert`, false);
            dispatch({ type: 'SYSTEM_NOTIFICATION_ADD', payload: { type: 'Notification', title: i18nModule.t('data.batch.success'), message: i18nModule.t('data.batch.upsert.success.detail', { count: processedUpdates.length }), recipientId: actingUserId, severity: 'success', category: 'personal' } });
            return processedUpdates.map(u => u.payload);
        } catch (err: any) {
            setError(`batchUpsert`, err);
            setLoading(`batchUpsert`, false);
            dispatch({ type: 'SYSTEM_NOTIFICATION_ADD', payload: { type: 'Notification', title: i18nModule.t('error.actionFailed'), message: err.message, recipientId: actingUserId, severity: 'error', category: 'alert' } });
            diagnostics.logSystemActivity('error', `Batch upsert operation failed:`, { error: err.message, userId: actingUserId, correlationId });
            throw err;
        }
    }, [dispatch, state, currentUserId, activeTenantIdRef, authModule, governanceModule, aiModule, schemaModule, setLoading, setError, diagnostics, i18nModule, getFlag]);


    const batchDeleteEntities = useCallback(async (deletes: { entityType: EntityType; id: EntityId; }[], optimisticKey?: string): Promise<void> => {
        const actingUserId = currentUserId.current || 'system';
        const correlationId = nanoid();
        setLoading(`batchDelete`, true);
        setError(`batchDelete`, null);

        try {
            const allowedDeletes: { entityType: EntityType; id: EntityId; }[] = [];
            for (const { entityType, id } of deletes) {
                if (!authModule.hasPermission(`delete:${entityType}`, id, entityType)) {
                    diagnostics.logSystemActivity('warn', i18nModule.t('error.permissionDeniedBatch', { type: entityType, id }), { userId: actingUserId });
                    continue;
                }
                const entityToDelete = (state as any)[entityType.toLowerCase() + 's'][id];
                if (!entityToDelete) {
                    diagnostics.logSystemActivity('warn', i18nModule.t('error.entityNotFoundBatch', { type: entityType, id }), { userId: actingUserId });
                    continue;
                }
                const canDelete = await governanceModule.checkPolicy('retention', entityToDelete);
                if (!canDelete) {
                    diagnostics.logSystemActivity('warn', i18nModule.t('data.retention.policyViolationBatch', { type: entityType, id }), { userId: actingUserId });
                    continue;
                }
                allowedDeletes.push({ entityType, id });
            }

            if (allowedDeletes.length > 0) {
                // Optimistic UI (Year 5)
                if (optimisticKey) {
                    dispatch({
                        type: 'OPTIMISTIC_UPDATE_APPLY_LOCAL',
                        key: optimisticKey,
                        entityType: 'systemSettings' as EntityType, // Placeholder for batch status
                        id: 'batchDelete',
                        patches: [], inversePatches: [], originalVersion: 0
                    });
                }
                dispatch({
                    type: 'ENTITY_BATCH_DELETE',
                    entityType: allowedDeletes[0].entityType, // Assumes homogenous batch
                    ids: allowedDeletes.map(d => d.id),
                    userId: actingUserId,
                    correlationId,
                    optimisticKey,
                });
                diagnostics.logSystemActivity('info', `Batch delete of ${allowedDeletes.length} entities dispatched.`, { userId: actingUserId, correlationId });

                let apiSuccess = false;
                let apiError: any = null;
                const apiStartTime = performance.now();
                try {
                    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200)); // Simulate API call
                    apiSuccess = true;
                    if (optimisticKey) {
                        dispatch({ type: 'OPTIMISTIC_UPDATE_CONFIRM', key: optimisticKey });
                    }
                } catch (err) {
                    apiError = err;
                    diagnostics.logSystemActivity('error', `API call failed for batch delete:`, { error: err, userId: actingUserId });
                    if (optimisticKey) {
                        dispatch({ type: 'OPTIMISTIC_UPDATE_FAIL', key: optimisticKey, error: err });
                    }
                    throw err;
                } finally {
                    diagnostics.recordApiCall(`batch/delete`, 'DELETE', performance.now() - apiStartTime, apiSuccess, apiSuccess ? 200 : 500);
                }
            } else {
                diagnostics.logSystemActivity('warn', `No entities processed in batch delete due to permissions or validation.`, { userId: actingUserId, correlationId });
            }
            setLoading(`batchDelete`, false);
            dispatch({ type: 'SYSTEM_NOTIFICATION_ADD', payload: { type: 'Notification', title: i18nModule.t('data.batch.success'), message: i18nModule.t('data.batch.delete.success.detail', { count: allowedDeletes.length }), recipientId: actingUserId, severity: 'success', category: 'personal' } });
        } catch (err: any) {
            setError(`batchDelete`, err);
            setLoading(`batchDelete`, false);
            dispatch({ type: 'SYSTEM_NOTIFICATION_ADD', payload: { type: 'Notification', title: i18nModule.t('error.actionFailed'), message: err.message, recipientId: actingUserId, severity: 'error', category: 'alert' } });
            diagnostics.logSystemActivity('error', `Batch delete operation failed:`, { error: err.message, userId: actingUserId, correlationId });
            throw err;
        }
    }, [dispatch, state, currentUserId, authModule, governanceModule, setLoading, setError, diagnostics, i18nModule]);


    const getEntity = useCallback(<T extends Entity>(entityType: T['type'], id: EntityId): T | undefined => {
        const record = (state as any)[entityType.toLowerCase() + 's'];
        let entity = record ? record[id] : undefined;
        if (entity && authModule.hasPermission(`read:${entityType}`, id, entityType)) {
            // Year 6: Apply read-time data governance policies (e.g., data masking on read)
            entity = governanceModule.applyPolicy('masking', entity, currentUserId.current || 'system') as T;
            return entity;
        }
        return undefined;
    }, [state, authModule, governanceModule, currentUserId]);

    const getEntities = useCallback(<T extends Entity>(entityType: T['type']): T[] => {
        const entities = Object.values((state as any)[entityType.toLowerCase() + 's']) as T[];
        // Filter by permissions and apply masking
        return entities
            .filter(e => authModule.hasPermission(`read:${entityType}`, e.id, entityType))
            .map(e => governanceModule.applyPolicy('masking', e, currentUserId.current || 'system') as T);
    }, [state, authModule, governanceModule, currentUserId]);

    const queryEntities = useCallback(<T extends Entity>(entityType: T['type'], query: (entity: T) => boolean): T[] => {
        // More sophisticated queries would involve server-side filtering, GraphQL, or IndexedDB.
        // This is a client-side filter after permissions and masking.
        return getEntities(entityType).filter(query);
    }, [getEntities]);

    // Year 5: Memoized selector for performance
    const selectEntities = useCallback(<T extends Entity, R>(entityType: T['type'], selector: (entities: T[]) => R): R => {
        const entities = getEntities(entityType);
        return useMemo(() => selector(entities), [entities, selector]);
    }, [getEntities]);

    // Year 8: Local query subscription
    const localQuerySubscribers = useRef(new Map<string, Set<(entities: Entity[]) => void>>());
    const subscribeToQuery = useCallback(<T extends Entity>(entityType: T['type'], query: (entity: T) => boolean, callback: (entities: T[]) => void): () => void => {
        const key = `${entityType}-${query.toString()}`; // Simple key for the query
        if (!localQuerySubscribers.current.has(key)) {
            localQuerySubscribers.current.set(key, new Set());
        }
        localQuerySubscribers.current.get(key)?.add(callback as (entities: Entity[]) => void);

        // Immediately provide current results
        callback(queryEntities(entityType, query));

        return () => {
            localQuerySubscribers.current.get(key)?.delete(callback as (entities: Entity[]) => void);
            if (localQuerySubscribers.current.get(key)?.size === 0) {
                localQuerySubscribers.current.delete(key);
            }
        };
    }, [queryEntities]);

    // Effect to notify local query subscribers when state changes
    useEffect(() => {
        localQuerySubscribers.current.forEach((callbacks, key) => {
            const [entityType, queryString] = key.split('-');
            const query = eval(`(${queryString})`); // DANGER! In real app, serialize/deserialize functions safely
            const currentResults = queryEntities(entityType as EntityType, query);
            callbacks.forEach(callback => callback(currentResults));
        });
    }, [state, queryEntities]);


    const applyPatchesToEntity = useCallback(async (entityType: EntityType, id: EntityId, patches: Patch[], inversePatches: Patch[], optimisticKey?: string): Promise<void> => {
        const actingUserId = currentUserId.current || 'system';
        const correlationId = nanoid();

        if (!authModule.hasPermission(`update:${entityType}`, id, entityType)) {
            const errorMessage = i18nModule.t('error.permissionDenied');
            diagnostics.logSystemActivity('warn', errorMessage, { userId: actingUserId, entityType, entityId: id, action: 'patch' });
            throw new Error(errorMessage);
        }
        setLoading(`${entityType}/${id}/patch`, true);
        setError(`${entityType}/${id}/patch`, null);

        try {
            const currentEntity = getEntity(entityType, id);
            if (!currentEntity) throw new Error(i18nModule.t('error.entityNotFound', { type: entityType, id }));

            // Year 9: Validate patches against schema (pre-apply and validate)
            const patchedEntityDraft = produce(currentEntity, draft => {
                applyPatches(draft as any, patches);
            });
            const isValid = await schemaModule.validateEntity(entityType, patchedEntityDraft as Entity);
            if (!isValid) throw new Error(i18nModule.t('data.validation.failedPatch', { type: entityType, id }));

            // Optimistic UI (Year 5)
            if (optimisticKey) {
                dispatch({ type: 'OPTIMISTIC_UPDATE_APPLY_LOCAL', key: optimisticKey, entityType, id, patches, inversePatches, originalVersion: currentEntity.version });
            }

            dispatch({ type: 'APPLY_PATCHES', entityType, id, patches, inversePatches, userId: actingUserId, correlationId, optimisticKey });
            diagnostics.logSystemActivity('info', `Patches applied to entity ${entityType}/${id}.`, { userId: actingUserId, correlationId, patches });

            let apiSuccess = false;
            let apiError: any = null;
            const apiStartTime = performance.now();
            try {
                await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100)); // Simulate API call
                apiSuccess = true;
                if (optimisticKey) {
                    dispatch({ type: 'OPTIMISTIC_UPDATE_CONFIRM', key: optimisticKey });
                }
            } catch (err) {
                apiError = err;
                diagnostics.logSystemActivity('error', `API call failed for patch ${entityType}/${id}:`, { error: err, userId: actingUserId });
                if (optimisticKey) {
                    dispatch({ type: 'OPTIMISTIC_UPDATE_FAIL', key: optimisticKey, error: err });
                }
                throw err;
            } finally {
                diagnostics.recordApiCall(`${entityType}/patch`, 'PATCH', performance.now() - apiStartTime, apiSuccess, apiSuccess ? 200 : 500);
            }
            setLoading(`${entityType}/${id}/patch`, false);
            dispatch({ type: 'SYSTEM_NOTIFICATION_ADD', payload: { type: 'Notification', title: i18nModule.t('data.update.success'), message: i18nModule.t('data.patch.success.detail', { entityType, id }), recipientId: actingUserId, severity: 'success', category: 'personal' } });
        } catch (err: any) {
            setError(`${entityType}/${id}/patch`, err);
            setLoading(`${entityType}/${id}/patch`, false);
            dispatch({ type: 'SYSTEM_NOTIFICATION_ADD', payload: { type: 'Notification', title: i18nModule.t('error.actionFailed'), message: err.message, recipientId: actingUserId, severity: 'error', category: 'alert' } });
            diagnostics.logSystemActivity('error', `Patch operation failed for ${entityType}/${id}:`, { error: err.message, userId: actingUserId, correlationId });
            throw err;
        }
    }, [dispatch, currentUserId, authModule, getEntity, schemaModule, setLoading, setError, diagnostics, i18nModule]);


    // Loading and Error state management (Year 3)
    const setLoading = useCallback((key: string, isLoading: boolean) => {
        setLoadingState(prev => ({ ...prev, [key]: isLoading }));
    }, []);

    const setError = useCallback((key: string, error: any | null) => {
        setErrorState(prev => ({ ...prev, [key]: error }));
    }, []);

    const getOptimisticUpdateStatus = useCallback((key: string) => {
        const update = state.optimisticUpdates[key];
        if (!update) return undefined;
        return { status: update.status, error: (update as any).error };
    }, [state.optimisticUpdates]);

    // Persistence functions (Year 3)
    const persistState = useCallback(() => persistStateToLocalStorage(state), [state]);
    const loadPersistedState = useCallback(() => loadStateFromLocalStorage(), []);

    // Undo/Redo (Year 5)
    const undo = useCallback(() => temporalDispatch({ type: 'UNDO' }), [temporalDispatch]);
    const redo = useCallback(() => temporalDispatch({ type: 'REDO' }), [temporalDispatch]);

    // Diagnostics (Year 10)
    useEffect(() => {
        diagnostics.recordRender();
    });


    // --- Combine all modules into the context value ---
    const contextValue: DataContextType = useMemo(() => ({
        state,
        dispatch,
        currentUser: currentUser,
        tenantId: activeTenantId,
        upsertEntity,
        deleteEntity,
        batchUpsertEntities,
        batchDeleteEntities,
        getEntity,
        getEntities,
        queryEntities,
        selectEntities,
        subscribeToQuery,
        applyPatchesToEntity,
        undo,
        redo,
        canUndo: temporal.canUndo,
        canRedo: temporal.canRedo,
        persistState,
        loadPersistedState,
        getOptimisticUpdateStatus,
        loading,
        errors,
        setLoading,
        setError,
        auth: { ...authModule, currentUser, isAuthenticated: !!currentUser, tenantId: activeTenantId },
        realtime: realtimeModule,
        governance: governanceModule,
        ai: aiModule,
        eventBus: eventBus,
        schema: schemaModule,
        diagnostics: diagnostics,
        i18n: i18nModule,
        featureFlags: featureFlagsModule,
        abTesting: abTestingModule,
        search: searchModule,
        plugins: pluginModule,
    }), [
        state, dispatch, currentUser, activeTenantId,
        upsertEntity, deleteEntity, batchUpsertEntities, batchDeleteEntities,
        getEntity, getEntities, queryEntities, selectEntities, subscribeToQuery, applyPatchesToEntity,
        undo, redo, temporal.canUndo, temporal.canRedo,
        persistState, loadPersistedState, getOptimisticUpdateStatus,
        loading, errors, setLoading, setError,
        authModule, realtimeModule, governanceModule, aiModule, eventBus, schemaModule, diagnostics,
        i18nModule, featureFlagsModule, abTestingModule, searchModule, pluginModule,
    ]);

    // Update the ref for plugin access
    useEffect(() => {
        contextValueRef.current = contextValue;
    }, [contextValue]);


    return (
        <RealityDataContext.Provider value={contextValue}>
            {children}
        </RealityDataContext.Provider>
    );
};

// --- 18. Advanced Hooks for Consumers (Year 2-10: Ergonomics & Specialization) ---

export const useReality = (): DataContextType => {
    const context = useContext(RealityDataContext);
    if (context === undefined) {
        throw new Error('useReality must be used within a RealityDataProvider');
    }
    return context;
};

// Year 2: Specialized hook for a single entity (memoized)
export const useEntity = <T extends Entity>(entityType: T['type'], id: EntityId): T | undefined => {
    const { getEntity } = useReality();
    return useMemo(() => getEntity(entityType, id), [getEntity, entityType, id]);
};

// Year 2: Specialized hook for a collection of entities (memoized)
export const useEntities = <T extends Entity>(entityType: T['type']): T[] => {
    const { getEntities } = useReality();
    return useMemo(() => getEntities(entityType), [getEntities, entityType]);
};

// Year 3: Hook for client-side queries (memoized)
export const useQuery = <T extends Entity>(entityType: T['type'], query: (entity: T) => boolean): T[] => {
    const { queryEntities } = useReality();
    return useMemo(() => queryEntities(entityType, query), [entityType, query, queryEntities]);
};

// Year 8: Hook for subscribing to a local query
export const useLiveQuery = <T extends Entity>(entityType: T['type'], query: (entity: T) => boolean): T[] => {
    const { subscribeToQuery } = useReality();
    const [results, setResults] = React.useState<T[]>([]);

    useEffect(() => {
        const unsubscribe = subscribeToQuery(entityType, query, (newResults) => {
            setResults(newResults as T[]);
        });
        return () => unsubscribe();
    }, [entityType, query, subscribeToQuery]);

    return results;
};

// Year 4: Hook for realtime subscriptions
export const useRealtimeSubscription = (query: string, callback: SubscriptionCallback): void => {
    const { realtime } = useReality();
    useEffect(() => {
        const subId = realtime.subscribe(query, callback);
        return () => realtime.unsubscribe(subId);
    }, [query, callback, realtime]); // Ensure callback is stable (e.g., wrapped in useCallback)
};

// Year 5: Hook for loading states
export const useLoading = (key: string): boolean => {
    const { loading } = useReality();
    return loading[key] || false;
};

// Year 5: Hook for error states
export const useError = (key: string): any => {
    const { errors } = useReality();
    return errors[key];
};

// Year 5: Hook for optimistic update status
export const useOptimisticUpdateStatus = (key: string) => {
    const { getOptimisticUpdateStatus } = useReality();
    return getOptimisticUpdateStatus(key);
};

// Year 6: Hook for user authentication status and details
export const useAuth = (): AuthContextType => {
    const { auth } = useReality();
    return auth;
};

// Year 6: Hook for checking user permissions
export const usePermission = (permission: string, entityId?: string, entityType?: EntityType): boolean => {
    const { auth } = useReality();
    return auth.hasPermission(permission, entityId, entityType);
};

// Year 7: Hook for interacting with AI module
export const useAI = (): AIOrchestrationModule => {
    const { ai } = useReality();
    return ai;
};

// Year 8: Hook for global event bus
export const useEventBus = () => {
    const { eventBus } = useReality();
    return eventBus;
};

// Year 9: Hook for data governance checks
export const useDataGovernance = (): DataGovernanceModule => {
    const { governance } = useReality();
    return governance;
};

// Year 10: Hook for diagnostics
export const useDiagnostics = () => {
    const { diagnostics } = useReality();
    return diagnostics;
};

// Year 10: Specific hook for temporal state (undo/redo)
export const useTemporalState = () => {
    const { undo, redo, canUndo, canRedo } = useReality();
    return { undo, redo, canUndo, canRedo };
};

// Year 10: Utility hook for entity operations with automatic loading/error handling
export const useEntityOperation = <T extends Entity, P = any, R = any>(
    entityType: T['type'],
    operation: (payload: P, optimisticKey?: string) => Promise<R>, // Operation could be upsert, delete, patch etc.
    operationName: string // e.g., 'create', 'update', 'delete'
) => {
    const { setLoading, setError, loading, errors, i18n } = useReality();
    const operationKey = `${entityType}/${operationName}`; // Unique key for this operation

    const perform = useCallback(async (payload: P, optimisticKey?: string): Promise<R | undefined> => {
        setLoading(operationKey, true);
        setError(operationKey, null);
        try {
            const result = await operation(payload, optimisticKey);
            setLoading(operationKey, false);
            return result;
        } catch (err: any) {
            setError(operationKey, err);
            setLoading(operationKey, false);
            // Translate error messages for user display
            const userMessage = i18n.t(`error.operation.${operationName}.failed`, { context: err.message });
            console.error(`Operation ${operationKey} failed:`, err);
            throw new Error(userMessage); // Re-throw a user-friendly error
        }
    }, [operation, operationKey, setLoading, setError, i18n]);

    return { perform, loading: loading[operationKey] || false, error: errors[operationKey] };
};

// Year 8: Hook for i18n translation
export const useTranslation = () => {
    const { i18n } = useReality();
    return i18n.t;
};

// Year 6: Hook for feature flags
export const useFeatureFlag = (flag: string) => {
    const { featureFlags } = useReality();
    return featureFlags.getFlag(flag);
};

// Year 6: Hook for A/B testing
export const useABTest = (testName: string) => {
    const { abTesting, currentUser } = useReality();
    const userId = currentUser?.id || 'anonymous';
    const variant = useMemo(() => abTesting.getVariant(testName, userId), [abTesting, testName, userId]);
    const trackGoal = useCallback((goal: string) => abTesting.trackGoalCompletion(testName, goal, userId), [abTesting, testName, userId]);
    return { variant, trackGoal };
};

// Year 9: Hook for client-side search
export const useSearch = () => {
    const { search } = useReality();
    return search;
};

// Year 10: Hook for the AI Co-pilot assistant
export const useAICoPilot = () => {
    const { ai, featureFlags } = useReality();
    const isEnabled = featureFlags.getFlag('aiCoPilotEnabled');
    return {
        isEnabled,
        getAssistantResponse: isEnabled ? ai.getAIAssistantResponse : async () => ({ response: "AI Co-pilot is disabled.", model: "N/A" }),
        triggerInference: isEnabled ? ai.triggerInference : async () => { throw new Error("AI Co-pilot is disabled."); },
        recommendActions: isEnabled ? ai.recommendActions : async () => [],
    };
};
```