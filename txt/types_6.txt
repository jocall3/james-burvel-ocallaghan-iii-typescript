// google/drive/types.ts
// The Laws of Knowledge. Defines the shape and form of a stored idea.

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    modifiedTime: string;
    // --- Core File Attributes (Enhanced) ---
    /** The creation time of the file. (ISO 8601) */
    createdTime: string;
    /** The last time the file was viewed by the authenticated user. (ISO 8601) */
    viewedByMeTime?: string;
    /** Whether the file is currently trashed. */
    trashed?: boolean;
    /** The time the file was trashed. (ISO 8601) */
    trashedTime?: string;
    /** The current major version number of the file. */
    version: number;
    /** The ID of the head revision of the file. */
    headRevisionId?: string;
    /** List of parents or folders containing this file. IDs of parent folders. */
    parents?: string[];
    /** Whether the file is shared publicly or with specific users/groups. */
    shared?: boolean;
    /** A short, user-provided description of the file. */
    description?: string;
    /** Size of the file in bytes. Using string for potential large numbers. */
    size?: string;
    /** MD5 hash of the file's content. Used for content integrity verification. */
    md5Checksum?: string;
    /** List of users who own the file. */
    owners?: UserReference[];
    /** The user who last modified the file. */
    lastModifyingUser?: UserReference;
    /** Capabilities of the authenticated user on this file (e.g., canEdit, canShare). */
    capabilities?: FileCapabilities;
    /** Semantic labels applied to the file (e.g., 'Starred', 'Important', 'Confidential'). */
    labels?: FileLabel[];
    /** Custom application-specific properties, visible only to the creating application. */
    appProperties?: { [key: string]: string };
    /** General custom properties, visible to all applications with access. */
    properties?: { [key: string]: string };
    /** Thumbnail image information for visual representation. */
    thumbnail?: ThumbnailInfo;
    /** URL to the file's web view (for browsing). */
    webViewLink?: string;
    /** URL to the file's web content link (for direct download). */
    webContentLink?: string;
    /** Full hierarchical path to the file within the Drive. */
    fullPath?: string;
    /** Current status in the file's lifecycle (e.g., active, archived, deleted). */
    lifecycleStatus?: FileLifecycleStatus;
    /** Retention policy currently applied to the file. */
    retentionPolicy?: RetentionPolicy;
    /** AI-driven semantic classification and content understanding metadata. */
    semanticClassification?: SemanticClassification;
    /** Security and compliance context of the file. */
    securityContext?: SecurityContext;
    /** AI-generated insights and recommendations for managing or using the file. */
    aiInsights?: AIFileInsights;
    /** Collaboration and activity metadata (comments, tasks, workflow status). */
    collaborationContext?: CollaborationContext;
    /** Detailed information about where and how the file is stored. */
    storageDetails?: StorageDetails;
    /** Historical record of significant events related to the file. */
    eventHistory?: FileEvent[];
    /** Metadata specifically for advanced search and discovery. */
    searchMetadata?: SearchMetadata;
    /** Data Loss Prevention (DLP) related attributes and scan results. */
    dlpAttributes?: DlpAttributes;
    /** Content hash information using various algorithms for integrity and deduplication. */
    contentHashes?: ContentHash[];
    /** Geographic location metadata associated with the file's content or creation. */
    geoLocation?: GeoLocation;
    /** Source or origin of the file (e.g., 'upload', 'created', 'migrated'). */
    source?: FileSource;
    /** External links or embedded references found within the file. */
    externalReferences?: ExternalReference[];
    /** Real-time metrics and operational data for the file. */
    realtimeMetrics?: RealtimeFileMetrics;
    /** Contextual details of the last access (device, network, location). */
    accessContext?: AccessContext;
    /** Blockchain-based provenance and integrity verification details. */
    blockchainProvenance?: BlockchainProvenance;
    /** User-defined scripts or macros associated with the file for automation. */
    automationScripts?: AutomationScript[];
    /** Tags or categories derived from content analysis or manual tagging. */
    contentTags?: ContentTag[];
    /** Specific content structure analysis for well-known file types. */
    contentStructure?: DocumentContentStructure | SpreadsheetContentStructure | CodeContentStructure | ImageContentStructure | AudioVideoContentStructure | null;
    /** The last actor (user, system, AI agent) to modify the file. */
    lastModifyingActor?: ActorReference;
    /** Whether the file is marked as read-only. */
    readOnly?: boolean;
    /** Unique identifier for the tenant or organization the file belongs to. */
    tenantId?: string;
    /** Cost associated with storing or accessing the file. */
    storageCost?: StorageCost;
    /** Data quality metrics for the file's content. */
    dataQuality?: DataQualityMetrics;
    /** Data lineage information, showing its origin and derivations. */
    dataLineage?: DataLineage;
    /** Scheduled actions for the file (e.g., automated deletion, archival). */
    scheduledActions?: FileScheduledAction[];
    /** Virtual mount points or symbolic links pointing to this file. */
    virtualMountPoints?: VirtualMountPoint[];
    /** File encryption details, including method and key management. */
    encryptionDetails?: EncryptionDetails;
    /** Compliance certifications applied to the file (e.g., GDPR, HIPAA). */
    complianceCertifications?: ComplianceCertification[];
    /** Detailed audit log for comprehensive historical tracking. */
    detailedAuditLog?: DetailedAuditLog[];
    /** AI-generated suggestions for next steps or improvements. */
    suggestedActions?: SuggestedFileAction[];
    /** Information about integrations with external systems. */
    integrationPoints?: IntegrationPoint[];
    /** Digital signature information for authenticity and non-repudiation. */
    digitalSignature?: DigitalSignatureInfo;
    /** Resource utilization metrics during processing or access. */
    resourceUtilization?: ResourceUtilizationMetrics;
    /** Multi-factor authentication or advanced access policies applied. */
    accessPolicies?: AccessPolicy[];
    /** Detailed data retention schedule for the file. */
    retentionSchedule?: RetentionSchedule;
}

// --- Enum and Helper Type Definitions ---

export enum FileLifecycleStatus {
    ACTIVE = 'active',
    ARCHIVED = 'archived',
    DELETED = 'deleted',
    PURGED = 'purged',
    PENDING_DELETION = 'pending_deletion',
    PENDING_ARCHIVAL = 'pending_archival',
    VERSION_DEPRECATED = 'version_deprecated',
}

export enum FileLabel {
    STARRED = 'starred',
    IMPORTANT = 'important',
    PINNED = 'pinned',
    PRIVATE = 'private',
    PUBLIC = 'public',
    INTERNAL = 'internal',
    EXTERNAL = 'external',
    DRAFT = 'draft',
    FINAL = 'final',
    NEEDS_REVIEW = 'needs_review',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    CONFIDENTIAL = 'confidential',
    RESTRICTED = 'restricted',
    TOP_SECRET = 'top_secret',
    READ_ONLY = 'read_only',
    WRITE_PROTECTED = 'write_protected',
    SYSTEM_FILE = 'system_file',
    GENERATED_CONTENT = 'generated_content',
    AUDITED = 'audited',
    COMPLIANT = 'compliant',
    NON_COMPLIANT = 'non_compliant',
    QUARANTINED = 'quarantined',
    VIRUS_DETECTED = 'virus_detected',
    PENDING_VIRUS_SCAN = 'pending_virus_scan',
    ENCRYPTED = 'encrypted',
    UNENCRYPTED = 'unencrypted',
    TEMPORARY = 'temporary',
    PERMANENT = 'permanent',
    SYSTEM_GENERATED = 'system_generated',
    USER_GENERATED = 'user_generated',
    TEMPLATE = 'template',
    LOCKED = 'locked',
    UNLOCKED = 'unlocked',
    BLOCKED = 'blocked',
    ALLOW_LISTED = 'allow_listed',
    DENY_LISTED = 'deny_listed',
    EXTERNAL_SHARE_ACTIVE = 'external_share_active',
    INTERNAL_SHARE_ACTIVE = 'internal_share_active',
    EMBEDDED = 'embedded',
    REFERENCED = 'referenced',
    DYNAMIC_CONTENT = 'dynamic_content',
    STATIC_CONTENT = 'static_content',
    ANALYTIC_READY = 'analytic_ready',
    AI_TRAINING_DATA = 'ai_training_data',
    DEIDENTIFIED = 'deidentified',
    PSEUDONYMIZED = 'pseudonymized',
    PERSONAL_DATA = 'personal_data',
    SENSITIVE_PERSONAL_DATA = 'sensitive_personal_data',
    FINANCIAL_DATA = 'financial_data',
    HEALTH_DATA = 'health_data',
    LEGAL_DATA = 'legal_data',
    HR_DATA = 'hr_data',
    CONTRACT = 'contract',
    INVOICE = 'invoice',
    REPORT = 'report',
    PRESENTATION = 'presentation',
    SPREADSHEET = 'spreadsheet',
    DOCUMENT = 'document',
    IMAGE = 'image',
    VIDEO = 'video',
    AUDIO = 'audio',
    CODE = 'code',
    EXECUTABLE = 'executable',
    ARCHIVE = 'archive',
    LOG = 'log',
    CONFIGURATION = 'configuration',
    DATABASE = 'database',
    MODEL = 'model',
    DATASET = 'dataset',
    API_SPEC = 'api_spec',
    SCHEMA = 'schema',
    WORKFLOW_DEFINITION = 'workflow_definition',
    POLICY_DEFINITION = 'policy_definition',
    AUDIT_LOG = 'audit_log',
    MONITORING_DATA = 'monitoring_data',
    BACKUP = 'backup',
    RECOVERY = 'recovery',
    SNAPSHOT = 'snapshot',
    REALTIME = 'realtime',
    BATCH = 'batch',
    STREAMING = 'streaming',
    HISTORICAL = 'historical',
    LIVE = 'live',
    TEST_DATA = 'test_data',
    PRODUCTION_DATA = 'production_data',
    DEV_DATA = 'dev_data',
    QA_DATA = 'qa_data',
    STAGING_DATA = 'staging_data',
    LEGACY = 'legacy',
    MODERN = 'modern',
    EXTERNAL_SYSTEM = 'external_system',
    INTERNAL_SYSTEM = 'internal_system',
    CLOUD = 'cloud',
    ON_PREM = 'on_prem',
    HYBRID = 'hybrid',
    MULTICLOUD = 'multicloud',
    EDGE = 'edge',
    FOG = 'fog',
    QUANTUM = 'quantum',
    NEURAL_NETWORK_ASSET = 'neural_network_asset',
    QUANTUM_COMPUTING_ALGORITHM = 'quantum_computing_algorithm',
    HOLOGRAPHIC_DATA = 'holographic_data',
    NEURO_IMPLANT_DATA = 'neuro_implant_data',
}

export enum RetentionPolicyType {
    TIME_BASED = 'time_based',
    EVENT_BASED = 'event_based',
    LEGAL_HOLD = 'legal_hold',
    IMMUTABLE = 'immutable',
    COMPLIANCE_BASED = 'compliance_based',
    CUSTOM = 'custom',
}

export enum SensitivityLevel {
    PUBLIC = 'public',
    INTERNAL_ONLY = 'internal_only',
    CONFIDENTIAL = 'confidential',
    RESTRICTED = 'restricted',
    TOP_SECRET = 'top_secret',
    UNCLASSIFIED = 'unclassified',
    FOR_OFFICIAL_USE_ONLY = 'for_official_use_only',
}

export enum FileEventType {
    CREATED = 'created',
    MODIFIED = 'modified',
    DELETED = 'deleted',
    RESTORED = 'restored',
    VIEWED = 'viewed',
    DOWNLOADED = 'downloaded',
    SHARED = 'shared',
    UNSHARED = 'unshared',
    COMMENTED = 'commented',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    MOVED = 'moved',
    COPIED = 'copied',
    RENAMED = 'renamed',
    TAGGED = 'tagged',
    LABELED = 'labeled',
    ENCRYPTED = 'encrypted',
    DECRYPTED = 'decrypted',
    VIRUS_SCANNED = 'virus_scanned',
    DLP_VIOLATION = 'dlp_violation',
    ACCESS_DENIED = 'access_denied',
    PERMISSION_CHANGE = 'permission_change',
    VERSION_CREATED = 'version_created',
    WORKFLOW_ACTION = 'workflow_action',
    ARCHIVED = 'archived',
    PURGED = 'purged',
    RETENTION_APPLIED = 'retention_applied',
    RETENTION_EXPIRED = 'retention_expired',
    LEGAL_HOLD_APPLIED = 'legal_hold_applied',
    LEGAL_HOLD_RELEASED = 'legal_hold_released',
    CONTENT_EXTRACTED = 'content_extracted',
    METADATA_UPDATED = 'metadata_updated',
    AI_ANALYZED = 'ai_analyzed',
    BLOCKCHAIN_RECORDED = 'blockchain_recorded',
    GEO_TAGGED = 'geo_tagged',
    AUTOMATION_TRIGGERED = 'automation_triggered',
    EXTERNAL_SYSTEM_SYNC = 'external_system_sync',
    RESOURCE_UTILIZATION_ALERT = 'resource_utilization_alert',
    DATA_QUALITY_ISSUE = 'data_quality_issue',
    COMPLIANCE_CHECK_FAILED = 'compliance_check_failed',
    DIGITAL_SIGNATURE_APPLIED = 'digital_signature_applied',
    CONTENT_TRANSCRIBED = 'content_transcribed',
    CONTENT_TRANSLATED = 'content_translated',
    OBJECT_DETECTION = 'object_detection',
    FACE_DETECTION = 'face_detection',
    SPEECH_TO_TEXT = 'speech_to_text',
    TEXT_TO_SPEECH = 'text_to_speech',
    EMBEDDING_GENERATED = 'embedding_generated',
    MODEL_TRAINED = 'model_trained',
    DATASET_USED = 'dataset_used',
    FEDERATED_LEARNING_CONTRIBUTION = 'federated_learning_contribution',
    QUANTUM_SIMULATION_EXECUTED = 'quantum_simulation_executed',
    NEURAL_PATTERN_DETECTED = 'neural_pattern_detected',
}

export enum ContentTagCategory {
    TOPIC = 'topic',
    ENTITY = 'entity',
    KEYWORD = 'keyword',
    SENTIMENT = 'sentiment',
    LANGUAGE = 'language',
    STYLE = 'style',
    AUDIENCE = 'audience',
    INDUSTRY = 'industry',
    DEPARTMENT = 'department',
    PROJECT = 'project',
    COMPLIANCE = 'compliance',
    SECURITY = 'security',
    LIFECYCLE = 'lifecycle',
    SOURCE_SYSTEM = 'source_system',
    GEOGRAPHY = 'geography',
    TIME_PERIOD = 'time_period',
    DOCUMENT_TYPE = 'document_type',
    AI_GENERATED = 'ai_generated',
    USER_DEFINED = 'user_defined',
    SYSTEM_DEFINED = 'system_defined',
    CONTENT_QUALITY = 'content_quality',
    ACCESS_PATTERN = 'access_pattern',
    VALUE_SCORE = 'value_score',
    RISK_SCORE = 'risk_score',
    IMPACT_SCORE = 'impact_score',
    COMPLEXITY_SCORE = 'complexity_score',
    ANOMALY_DETECTION = 'anomaly_detection',
    ETHICAL_AI_CHECK = 'ethical_ai_check',
    BIAS_DETECTION = 'bias_detection',
    FAIRNESS_SCORE = 'fairness_score',
    EXPLAINABILITY_SCORE = 'explainability_score',
    PROVENANCE = 'provenance',
    CONFIDENCE_SCORE = 'confidence_score',
    SARCASM_DETECTION = 'sarcasm_detection',
    HUMOR_DETECTION = 'humor_detection',
    EMOTION_DETECTION = 'emotion_detection',
}

export enum StorageTier {
    HOT = 'hot',
    COOL = 'cool',
    ARCHIVE = 'archive',
    DEEP_ARCHIVE = 'deep_archive',
    INTELLIGENT = 'intelligent',
    EDGE = 'edge',
    LOCAL_CACHE = 'local_cache',
    HYBRID = 'hybrid',
    SECURE = 'secure',
    REPLICATION_ZONE_A = 'replication_zone_a',
    REPLICATION_ZONE_B = 'replication_zone_b',
}

export enum EncryptionMethod {
    AES256 = 'AES256',
    CHACHA20 = 'CHACHA20',
    PQC_KYBER = 'PQC_KYBER',
    PQC_DILITHIUM = 'PQC_DILITHIUM',
    CLIENT_SIDE = 'client_side',
    SERVER_SIDE = 'server_side',
    HYBRID = 'hybrid',
    HOMOMORPHIC = 'homomorphic',
    ZERO_KNOWLEDGE = 'zero_knowledge',
}

export enum ComplianceStandard {
    GDPR = 'GDPR',
    HIPAA = 'HIPAA',
    CCPA = 'CCPA',
    ISO27001 = 'ISO27001',
    PCI_DSS = 'PCI_DSS',
    NIST_CSF = 'NIST_CSF',
    SOX = 'SOX',
    FEDRAMP = 'FEDRAMP',
    CMMC = 'CMMC',
    SOC2 = 'SOC2',
    APRA = 'APRA',
    RBI = 'RBI',
    IRAP = 'IRAP',
    CUSTOM = 'CUSTOM',
}

export enum ThreatLevel {
    NONE = 'none',
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
}

export enum FileSource {
    UPLOAD = 'upload',
    CREATED_APP = 'created_app',
    SCANNER = 'scanner',
    EMAIL_ATTACHMENT = 'email_attachment',
    API_IMPORT = 'api_import',
    MIGRATION = 'migration',
    GENERATED = 'generated',
    SYNCHRONIZED = 'synchronized',
    EXTERNAL_SHARE = 'external_share',
    INTEGRATED_SYSTEM = 'integrated_system',
    BLOCKCHAIN_TRANSACTION = 'blockchain_transaction',
    SENSOR_DATA = 'sensor_data',
    IOT_DEVICE = 'iot_device',
    HUMAN_BRAIN_INTERFACE = 'human_brain_interface',
}

export enum RelationshipType {
    PARENT = 'parent',
    CHILD = 'child',
    RELATED_BY_CONTENT = 'related_by_content',
    REFERENCES = 'references',
    REFERENCED_BY = 'referenced_by',
    DERIVED_FROM = 'derived_from',
    DERIVED_TO = 'derived_to',
    DUPLICATE_OF = 'duplicate_of',
    VERSION_OF = 'version_of',
    TRANSFORMED_INTO = 'transformed_into',
    TRANSFORMED_FROM = 'transformed_from',
    EMBEDDED_IN = 'embedded_in',
    EMBEDS = 'embeds',
    ANNOTATES = 'annotates',
    ANNOTATED_BY = 'annotated_by',
    REVIEWED_BY = 'reviewed_by',
    APPROVED_BY = 'approved_by',
    TASK_RELATED = 'task_related',
    WORKFLOW_STEP = 'workflow_step',
    DEPENDS_ON = 'depends_on',
    DEPENDENT_OF = 'dependent_of',
    SIMILAR_TO = 'similar_to',
    COMPLEMENTS = 'complements',
    CONFIRMS = 'confirms',
    CONTRADICTS = 'contradicts',
    FORKED_FROM = 'forked_from',
    MERGED_INTO = 'merged_into',
}

export enum ActionRecommendationType {
    ARCHIVE = 'archive',
    DELETE = 'delete',
    SHARE = 'share',
    RESTRICT_ACCESS = 'restrict_access',
    ENCRYPT = 'encrypt',
    TAG = 'tag',
    MOVE_TO_PROJECT = 'move_to_project',
    REVIEW = 'review',
    APPROVE = 'approve',
    TRANSLATE = 'translate',
    SUMMARIZE = 'summarize',
    CONVERT_FORMAT = 'convert_format',
    ADD_TO_WORKFLOW = 'add_to_workflow',
    UPDATE_METADATA = 'update_metadata',
    ESCALATE_SECURITY = 'escalate_security',
    DATA_CLEANSE = 'data_cleanse',
    ANALYZE_FOR_BIAS = 'analyze_for_bias',
    GENERATE_SYNTHETIC_DATA = 'generate_synthetic_data',
    PUBLISH = 'publish',
    UNPUBLISH = 'unpublish',
    ALERT_OWNER = 'alert_owner',
    RECOMMEND_READERS = 'recommend_readers',
    RECOMMEND_COLLABORATORS = 'recommend_collaborators',
    OPTIMIZE_STORAGE = 'optimize_storage',
    REQUEST_APPROVAL = 'request_approval',
    START_CONSULTATION = 'start_consultation',
    VERSION_UPGRADE = 'version_upgrade',
    DEIDENTIFY_DATA = 'deidentify_data',
    PSEUDONYMIZE_DATA = 'pseudonymize_data',
}

export enum ActorType {
    USER = 'user',
    SYSTEM = 'system',
    APPLICATION = 'application',
    BOT = 'bot',
    AI_AGENT = 'ai_agent',
    EXTERNAL_SERVICE = 'external_service',
    API_KEY_HOLDER = 'api_key_holder',
    DEVICE = 'device',
    QUANTUM_PROCESSOR = 'quantum_processor',
    ORGANIZATION = 'organization',
    DEPARTMENT = 'department',
    TEAM = 'team',
}

export enum DataQualityDimension {
    ACCURACY = 'accuracy',
    COMPLETENESS = 'completeness',
    CONSISTENCY = 'consistency',
    TIMELINESS = 'timeliness',
    VALIDITY = 'validity',
    UNIQUENESS = 'uniqueness',
    INTEGRITY = 'integrity',
    RELEVANCE = 'relevance',
    USABILITY = 'usability',
    PRECISION = 'precision',
    RELIABILITY = 'reliability',
    CURRENCY = 'currency',
    GRANULARITY = 'granularity',
    AUDITABILITY = 'auditability',
    TRACEABILITY = 'traceability',
    SECURITY = 'security',
    PRIVACY = 'privacy',
}

// --- Detailed Interface Definitions ---

export interface UserReference {
    id: string;
    displayName?: string;
    emailAddress?: string;
    photoLink?: string;
    isSystemUser?: boolean;
    domainId?: string;
}

export interface ActorReference extends UserReference {
    actorType: ActorType;
    details?: { [key: string]: any };
}

export interface FileCapabilities {
    canView: boolean;
    canEdit: boolean;
    canComment: boolean;
    canShare: boolean;
    canDownload: boolean;
    canDelete: boolean;
    canAddChildren: boolean;
    canMoveItemIntoTeamDrive: boolean;
    canCopy: boolean;
    canChangeViewersCanCopyContent: boolean;
    canManageDrivePermissions: boolean;
    canReadRevisions: boolean;
    canAddFolderFromAnotherDrive: boolean;
    canModifyContent: boolean;
    canModifyMetadata: boolean;
    canListChildren: boolean;
    canRemoveChildren: boolean;
    canReadDrive: boolean;
    canAddMyDriveParent: boolean;
    canRemoveMyDriveParent: boolean;
    canMoveItemOutOfTeamDrive: boolean;
    canMoveItemWithinTeamDrive: boolean;
    canMoveTeamDriveItem: boolean;
    canReadTeamDrive: boolean;
    canSetStar: boolean;
    canUntrash: boolean;
    canTrash: boolean;
    canDeleteRevision: boolean;
    canPublish: boolean;
    canUnpublish: boolean;
    canApprove: boolean;
    canReject: boolean;
    canControlVersion: boolean;
    canManageRetention: boolean;
    canApplyLegalHold: boolean;
    canManageDLP: boolean;
    canManageCompliance: boolean;
    canInitiateWorkflow: boolean;
    canViewAnalytics: boolean;
    canOverrideSecurity: boolean;
    canImpersonate?: boolean;
}

export interface ThumbnailInfo {
    image: string;
    mimeType: string;
    width: number;
    height: number;
    generatedTime?: string;
    sourceFileId?: string;
}

export interface RetentionPolicy {
    type: RetentionPolicyType;
    duration?: string;
    startDate?: string;
    endDate?: string;
    legalHoldId?: string;
    complianceStandard?: ComplianceStandard;
    isImmutable?: boolean;
    policyOwner?: UserReference;
    lastUpdated?: string;
    description?: string;
    triggerEvent?: FileEventType;
    autoExtend?: boolean;
}

export interface SemanticClassification {
    topics?: ContentTag[];
    entities?: EntityRecognitionResult[];
    summaries?: ContentSummary[];
    sentiment?: SentimentAnalysisResult;
    languages?: LanguageDetectionResult[];
    keywords?: ContentTag[];
    qualityIssues?: ContentQualityIssue[];
    complexityScore?: number;
    readabilityScore?: number;
    confidenceScore?: number;
    classifiedTime?: string;
    modelVersion?: string;
    contextualRelevance?: ContextualRelevance[];
    embeddings?: EmbeddingVector[];
    namedEntities?: NamedEntity[];
    relationships?: ContentRelationship[];
    categories?: ContentTag[];
    abstract?: string;
    intent?: string;
    biasDetection?: BiasDetectionResult;
    ethicalAIReview?: EthicalAIReviewStatus;
}

export interface SecurityContext {
    sensitivityLevel: SensitivityLevel;
    encryptionStatus: EncryptionStatus;
    dlpScanStatus: DLPScanStatus;
    accessPoliciesApplied?: AccessPolicy[];
    securityLabels?: SecurityLabel[];
    lastSecurityScanTime?: string;
    securityScanResults?: SecurityScanResult[];
    threatLevel?: ThreatLevel;
    complianceStatus?: ComplianceStatus[];
    auditPolicies?: AuditPolicy[];
    dataRedactionPolicies?: DataRedactionPolicy[];
    digitalSignatureValidation?: DigitalSignatureValidationResult;
    quarantineStatus?: QuarantineStatus;
    threatIntelligenceFeed?: ThreatIntelligenceResult[];
    zeroTrustScore?: number;
    dataBreachHistory?: DataBreachHistory[];
}

export interface EncryptionStatus {
    isEncrypted: boolean;
    method?: EncryptionMethod;
    keyId?: string;
    encryptedBy?: UserReference;
    encryptionTime?: string;
    keyRotationSchedule?: string;
    kmsProvider?: string;
    kmsKeyUri?: string;
    decryptionCapabilities?: DecryptionCapability[];
    postQuantumSafe?: boolean;
}

export interface DecryptionCapability {
    actor: ActorReference;
    canDecrypt: boolean;
    method?: EncryptionMethod;
    reason?: string;
}


export interface DLPScanStatus {
    status: 'CLEAN' | 'VIOLATION_DETECTED' | 'PENDING' | 'FAILED';
    lastScanTime?: string;
    violations?: DlpViolation[];
    policyVersion?: string;
    scannedBy?: ActorReference;
    severity?: ThreatLevel;
}

export interface DlpViolation {
    policyId: string;
    ruleId: string;
    matchedContent?: string;
    infoType?: string;
    severity: ThreatLevel;
    actionTaken: 'BLOCKED' | 'WARNED' | 'REDACTED' | 'QUARANTINED' | 'LOGGED' | 'NONE';
    timestamp: string;
    riskScore: number;
    confidence: number;
    suggestedMitigation?: string;
}

export interface AccessPolicy {
    policyId: string;
    name: string;
    description?: string;
    conditions: AccessCondition[];
    effects: AccessEffect[];
    isEnabled: boolean;
    priority: number;
    lastUpdatedBy?: ActorReference;
    lastUpdatedTime?: string;
    enforcementScope?: 'GLOBAL' | 'ORGANIZATION' | 'DEPARTMENT' | 'FILE_SPECIFIC' | 'USER';
    policyType?: 'MFA_REQUIRED' | 'GEO_FENCE' | 'DEVICE_COMPLIANCE' | 'IP_RESTRICTION' | 'TIME_BASED' | 'ROLE_BASED' | 'RISK_ADAPTIVE' | 'BEHAVIOR_BASED';
    auditOnlyMode?: boolean;
    exemptions?: AccessPolicyExemption[];
    version?: number;
    tags?: string[];
}

export interface AccessCondition {
    field: string;
    operator: 'EQ' | 'NEQ' | 'GT' | 'LT' | 'GTE' | 'LTE' | 'IN' | 'NOT_IN' | 'CONTAINS' | 'NOT_CONTAINS';
    value: any;
}

export interface AccessEffect {
    action: 'ALLOW' | 'DENY' | 'CHALLENGE_MFA' | 'AUDIT_ONLY' | 'REDACT_CONTENT';
    message?: string;
}

export interface SecurityLabel {
    id: string;
    name: string;
    description?: string;
    category?: 'CONFIDENTIALITY' | 'INTEGRITY' | 'AVAILABILITY';
    appliedBy?: ActorReference;
    appliedTime?: string;
    enforcementRules?: string[];
}

export interface SecurityScanResult {
    scannerId: string;
    scanTime: string;
    status: 'CLEAN' | 'INFECTED' | 'SUSPICIOUS' | 'FAILED';
    threats?: SecurityThreat[];
    malwareFamily?: string;
    engineVersion?: string;
    definitionsVersion?: string;
    scanDurationMs?: number;
    remediationAction?: string;
    signatureId?: string;
    confidenceScore?: number;
    riskScore?: number;
}

export interface SecurityThreat {
    type: 'MALWARE' | 'VIRUS' | 'SPYWARE' | 'RANSOMWARE' | 'ROOTKIT' | 'ADWARE' | 'PHISHING_LINK' | 'VULNERABILITY' | 'EXPLOIT' | 'ZERO_DAY' | 'ADVANCED_PERSISTENT_THREAT';
    name: string;
    severity: ThreatLevel;
    details?: string;
    indicatorOfCompromise?: string[];
}

export interface ComplianceStatus {
    standard: ComplianceStandard;
    status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING_REVIEW' | 'EXEMPT';
    lastCheckedTime: string;
    checkedBy?: ActorReference;
    violations?: ComplianceViolation[];
    remediationPlanId?: string;
    auditReportLink?: string;
}

export interface ComplianceViolation {
    ruleId: string;
    description: string;
    severity: ThreatLevel;
    findingDetails?: string;
    suggestedRemediation?: string;
    evidenceLinks?: string[];
    affectedDataElements?: string[];
}

export interface AuditPolicy {
    policyId: string;
    name: string;
    eventsToLog: FileEventType[];
    retentionDuration: string;
    targetSystems?: string[];
    isEnabled: boolean;
    lastUpdatedBy?: ActorReference;
    lastUpdatedTime?: string;
}

export interface DataRedactionPolicy {
    policyId: string;
    name: string;
    dataTypesToRedact: string[];
    redactionMethod: 'MASK' | 'DELETE' | 'TOKENIZE';
    isEnabled: boolean;
    lastUpdatedBy?: ActorReference;
    lastUpdatedTime?: string;
    previewRedactedContent?: string;
}

export interface DigitalSignatureValidationResult {
    isValid: boolean;
    signerIdentity?: UserReference | string;
    signingTime?: string;
    certificateChain?: string[];
    algorithm?: string;
    revocationStatus?: 'VALID' | 'REVOKED' | 'UNKNOWN';
    details?: string;
    trustScore?: number;
    validationTimestamp?: string;
    validationService?: string;
}

export interface QuarantineStatus {
    isQuarantined: boolean;
    reason?: string;
    quarantineTime?: string;
    releasedTime?: string;
    quarantinedBy?: ActorReference;
    releaseApprovalBy?: ActorReference;
    releaseConditions?: string[];
    originalLocation?: string;
    quarantineLocation?: string;
}

export interface ThreatIntelligenceResult {
    feedProvider: string;
    threatId: string;
    threatType: string;
    severity: ThreatLevel;
    confidence: number;
    detailsLink?: string;
    indicatorMatch?: string;
    lastUpdatedInFeed?: string;
}

export interface DataBreachHistory {
    breachId: string;
    incidentDate: string;
    disclosureDate?: string;
    description: string;
    impactSeverity: ThreatLevel;
    affectedSystems?: string[];
    remediationStatus?: string;
    referenceLink?: string;
}

export interface AIFileInsights {
    suggestedTags?: ContentTag[];
    keyTakeaways?: string[];
    recommendedActions?: SuggestedFileAction[];
    predictedAccessPatterns?: PredictedAccessPattern[];
    estimatedValue?: MonetaryValue;
    relatedFiles?: RelatedFileSuggestion[];
    anomalies?: AnomalyDetectionResult[];
    contentEnhancements?: ContentEnhancementSuggestion[];
    targetAudience?: string[];
    qaPairs?: QAPair[];
    confidenceScore?: number;
    analysisTime?: string;
    analysisModels?: AIModelReference[];
    ethicalAssessment?: EthicalAIReviewStatus;
    interpretabilityScores?: InterpretabilityScore[];
    syntheticDataGenerationPotential?: SyntheticDataGenerationPotential;
    autoDocumentation?: AutoDocumentation;
    translationSuggestions?: TranslationSuggestion[];
    multiPerspectiveSummaries?: MultiPerspectiveSummary[];
}

export interface ContentTag {
    name: string;
    category: ContentTagCategory;
    confidence?: number;
    source?: 'AI' | 'USER' | 'SYSTEM' | 'EXTERNAL';
    timestamp?: string;
    value?: string;
    entities?: EntityRecognitionResult[];
}

export interface EntityRecognitionResult {
    text: string;
    type: 'PERSON' | 'ORGANIZATION' | 'LOCATION' | 'DATE' | 'PRODUCT' | 'EVENT' | 'CONCEPT' | 'QUANTITY' | 'URL' | 'EMAIL' | 'PHONE_NUMBER' | 'IP_ADDRESS' | 'CUSTOM';
    confidence: number;
    mentions?: { startIndex: number; endIndex: number }[];
    entityId?: string;
    sentiment?: SentimentAnalysisResult;
    links?: ExternalReference[];
}

export interface ContentSummary {
    type: 'ABSTRACTIVE' | 'EXTRACTIVE';
    length: 'SHORT' | 'MEDIUM' | 'LONG';
    text: string;
    confidence: number;
    generatedBy?: ActorReference;
    generatedTime?: string;
    keywordsIncluded?: string[];
    isConcise?: boolean;
}

export interface SentimentAnalysisResult {
    score: number;
    magnitude: number;
    overallSentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED';
    detectedPhrases?: { text: string; score: number }[];
    confidence?: number;
}

export interface LanguageDetectionResult {
    languageCode: string;
    confidence: number;
    isPrimary?: boolean;
}

export interface ContentQualityIssue {
    type: 'GRAMMAR' | 'SPELLING' | 'STYLE' | 'CLARITY' | 'CONCISENESS' | 'CONSISTENCY' | 'BIAS' | 'TOXICITY' | 'REPETITION' | 'FACTUAL_INACCURACY' | 'BROKEN_LINK' | 'MISSING_DATA' | 'FORMATTING_ERROR';
    severity: ThreatLevel;
    description: string;
    suggestedCorrection?: string;
    location?: { startChar: number; endChar: number; line?: number; column?: number }[];
    confidence?: number;
    detectedBy?: ActorReference;
    timestamp?: string;
}

export interface ContextualRelevance {
    contextId: string;
    relevanceScore: number;
    matchingTerms?: string[];
    source?: 'AI_MATCHING' | 'USER_TAGGING' | 'SYSTEM_LINK';
}

export interface EmbeddingVector {
    vector: number[];
    modelName: string;
    version: string;
    dimensionality: number;
    generatedTime?: string;
}

export interface NamedEntity {
    text: string;
    type: 'PERSON' | 'ORG' | 'LOC' | 'GPE' | 'PRODUCT' | 'EVENT' | 'DATE' | 'TIME' | 'MONEY' | 'PERCENT' | 'FACILITY' | 'NORP' | 'WORK_OF_ART' | 'LAW' | 'LANGUAGE' | 'QUANTITY' | 'ORDINAL' | 'CARDINAL' | 'OTHER';
    startOffset: number;
    endOffset: number;
    confidence: number;
    entityId?: string;
    salience?: number;
    coreferenceChainId?: string;
    properties?: { [key: string]: string };
}

export interface ContentRelationship {
    sourceEntityId?: string;
    targetEntityId?: string;
    relationshipType: string;
    confidence: number;
    evidenceText?: string;
    negated?: boolean;
}

export interface BiasDetectionResult {
    detectedBiases: BiasType[];
    overallBiasScore: number;
    biasIndicators?: string[];
    mitigationSuggestions?: string[];
    confidence?: number;
    checkedDimensions?: string[];
}

export interface BiasType {
    category: 'GENDER' | 'RACIAL' | 'AGE' | 'RELIGIOUS' | 'SOCIOECONOMIC' | 'POLITICAL' | 'OTHER';
    type: 'IMPLICIT' | 'EXPLICIT';
    severity: ThreatLevel;
    description?: string;
}

export interface EthicalAIReviewStatus {
    status: 'PASS' | 'FAIL' | 'PENDING' | 'REVIEW_REQUIRED';
    findings?: EthicalAIReviewFinding[];
    lastReviewedBy?: ActorReference;
    reviewTime?: string;
    policyVersion?: string;
}

export interface EthicalAIReviewFinding {
    type: 'FAIRNESS_VIOLATION' | 'PRIVACY_RISK' | 'EXPLAINABILITY_GAP' | 'TRANSPARENCY_ISSUE' | 'TOXICITY_DETECTED' | 'MISINFORMATION_RISK' | 'HARMFUL_CONTENT';
    severity: ThreatLevel;
    description: string;
    mitigationSteps?: string[];
    confidence?: number;
}

export interface PredictedAccessPattern {
    timeframe: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    predictedViews: number;
    predictedDownloads: number;
    predictedShares: number;
    predictionTime: string;
    modelAccuracy?: number;
    trend?: 'UPWARD' | 'DOWNWARD' | 'STABLE';
    topPredictedUsers?: UserReference[];
}

export interface MonetaryValue {
    amount: number;
    currency: string;
    valuationMethod?: string;
    asOfDate?: string;
    confidence?: number;
}

export interface RelatedFileSuggestion {
    fileId: string;
    reason: 'SIMILAR_CONTENT' | 'SHARED_CONTEXT' | 'CO_EDITED' | 'REFERENCED_IN' | 'AI_GENERATED_ASSOCIATION';
    relevanceScore: number;
    confidence: number;
    relationshipType?: RelationshipType;
    context?: string;
}

export interface AnomalyDetectionResult {
    type: 'ACCESS_PATTERN' | 'CONTENT_CHANGE' | 'METADATA_CHANGE' | 'SHARING_CHANGE' | 'DOWNLOAD_SPIKE' | 'UPLOAD_SPIKE' | 'THREAT_BEHAVIOR';
    severity: ThreatLevel;
    description: string;
    anomalyScore: number;
    timestamp: string;
    detectedBy?: ActorReference;
    details?: { [key: string]: any };
    suggestedAction?: SuggestedFileAction;
}

export interface ContentEnhancementSuggestion {
    type: 'GRAMMAR_CORRECTION' | 'STYLE_IMPROVEMENT' | 'CONCISENESS_BOOST' | 'CLARITY_IMPROVEMENT' | 'EXPANSION' | 'SUMMARIZATION' | 'TONE_ADJUSTMENT' | 'FORMATTING_SUGGESTION' | 'KEYWORD_OPTIMIZATION';
    description: string;
    suggestedChanges: TextDiff[];
    confidence: number;
    applied?: boolean;
    appliedBy?: ActorReference;
    appliedTime?: string;
}

export interface TextDiff {
    originalText: string;
    suggestedText: string;
    startIndex: number;
    endIndex: number;
    changeType: 'ADDITION' | 'DELETION' | 'MODIFICATION';
}

export interface QAPair {
    question: string;
    answer: string;
    confidence: number;
    sourceSegments?: { startIndex: number; endIndex: number; page?: number }[];
    generatedTime?: string;
    answerSource?: 'CONTENT_EXTRACTION' | 'KNOWLEDGE_GRAPH' | 'GENERATIVE_AI';
}

export interface AIModelReference {
    modelId: string;
    name: string;
    version: string;
    provider?: string;
    type?: 'NLP' | 'VISION' | 'AUDIO' | 'GENERATIVE' | 'CLASSIFICATION' | 'REGRESSION';
    purpose?: string;
}

export interface InterpretabilityScore {
    metric: string;
    score: number;
    feature?: string;
    explanation?: string;
    confidence?: number;
}

export interface SyntheticDataGenerationPotential {
    canGenerateSynthetic: boolean;
    anonymizationLevel: 'DEIDENTIFIED' | 'PSEUDONYMIZED' | 'FULLY_SYNTHETIC';
    estimatedDataVolume?: string;
    privacyPreservationScore?: number;
    utilityScore?: number;
    sampleGenerationCommand?: string;
    risksIdentified?: string[];
}

export interface AutoDocumentation {
    format: 'MARKDOWN' | 'HTML' | 'JSON_SCHEMA' | 'OPENAPI_SPEC' | 'JSDOC' | 'PYTHON_DOCSTRING';
    content: string;
    generatedTime: string;
    toolUsed?: string;
    confidence?: number;
    coveragePercentage?: number;
    requiresReview?: boolean;
    language?: string;
}

export interface TranslationSuggestion {
    targetLanguageCode: string;
    suggestedText: string;
    confidence: number;
    translatedBy?: ActorReference;
    translationTime?: string;
    qualityScore?: number;
    engineUsed?: string;
    isHumanReviewed?: boolean;
}

export interface MultiPerspectiveSummary {
    summaryType: 'EXECUTIVE' | 'TECHNICAL' | 'LEGAL' | 'CUSTOMER_FACING';
    length: 'SHORT' | 'MEDIUM' | 'LONG';
    text: string;
    audience?: string;
    confidence?: number;
}

export interface CollaborationContext {
    activeUsers?: UserReference[];
    comments?: CommentThread[];
    tasks?: TaskItem[];
    reviewStatus?: ReviewStatus;
    workflowStatus?: WorkflowStatus[];
    activityStream?: ActivityEvent[];
    realtimeCursors?: UserCursor[];
    sharedWorkspaces?: WorkspaceReference[];
    versionHistory?: FileVersion[];
    changeLog?: ChangeLogEntry[];
    lockedBy?: UserReference;
    lockTime?: string;
    coEditingSessionId?: string;
    branchInfo?: BranchInfo;
    mergeRequests?: MergeRequest[];
    collaborationScore?: number;
    coAuthors?: UserReference[];
    lastCollaborativeActivity?: string;
}

export interface CommentThread {
    id: string;
    fileId: string;
    resolved?: boolean;
    comments: Comment[];
    context?: CommentContext;
    createdTime: string;
    resolvedTime?: string;
    resolvedBy?: UserReference;
    parentId?: string;
    visibility?: 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';
}

export interface Comment {
    id: string;
    author: UserReference;
    createdTime: string;
    modifiedTime: string;
    content: string;
    htmlContent?: string;
    deleted?: boolean;
    replies?: Comment[];
    mentions?: UserReference[];
    reactions?: Reaction[];
}

export interface Reaction {
    emoji: string;
    user: UserReference;
    timestamp: string;
}

export interface CommentContext {
    type: 'PAGE' | 'TEXT_SELECTION' | 'IMAGE_AREA' | 'CODE_LINE';
    page?: number;
    start?: { index: number; line?: number; char?: number };
    end?: { index: number; line?: number; char?: number };
    selectionText?: string;
    imageRegion?: { x: number; y: number; width: number; height: number };
}

export interface TaskItem {
    id: string;
    title: string;
    description?: string;
    assignedTo?: UserReference;
    dueDate?: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'CANCELLED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    createdBy: UserReference;
    createdTime: string;
    completedTime?: string;
    fileContext?: TaskFileContext;
    tags?: string[];
    comments?: Comment[];
    associatedWorkflowStepId?: string;
}

export interface TaskFileContext {
    type: 'FILE_LEVEL' | 'SECTION_LEVEL' | 'COMMENT_RELATED';
    fileId: string;
    sectionId?: string;
    commentId?: string;
    selection?: CommentContext;
}

export interface ReviewStatus {
    status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'REQUEST_CHANGES';
    reviewers?: UserReference[];
    approvers?: UserReference[];
    lastActionTime?: string;
    lastActionBy?: UserReference;
    comments?: CommentThread[];
    requiredApprovals?: number;
    currentApprovals?: number;
    reviewCycleId?: string;
    deadline?: string;
    reviewType?: 'LEGAL' | 'TECHNICAL' | 'EDITORIAL' | 'MANAGEMENT';
    versionUnderReview?: number;
}

export interface WorkflowStatus {
    workflowId: string;
    workflowName: string;
    currentStep: string;
    status: 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELED';
    assignedTo?: UserReference;
    dueDate?: string;
    startedBy: UserReference;
    startTime: string;
    completionTime?: string;
    stepDetails?: WorkflowStepDetail[];
    associatedFiles?: string[];
    triggeredByEvent?: FileEventType;
    lastUpdateTime?: string;
    workflowDefinitionId?: string;
}

export interface WorkflowStepDetail {
    stepId: string;
    name: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'FAILED';
    assignedTo?: UserReference;
    completionTime?: string;
    comments?: string;
    requiredAction?: string;
    automationTriggered?: boolean;
    dependenciesMet?: boolean;
}

export interface ActivityEvent {
    id: string;
    actor: ActorReference;
    type: FileEventType;
    timestamp: string;
    details?: { [key: string]: any };
    targetId?: string;
    context?: ActivityEventContext;
    severity?: ThreatLevel;
    undoable?: boolean;
    correlationId?: string;
    isBotAction?: boolean;
    impactScore?: number;
}

export interface ActivityEventContext {
    ipAddress?: string;
    deviceInfo?: string;
    geoLocation?: GeoLocation;
    applicationName?: string;
    sessionID?: string;
    authenticationMethod?: string;
    userAgent?: string;
    networkType?: 'LAN' | 'WIFI' | 'CELLULAR' | 'VPN';
}

export interface UserCursor {
    userId: string;
    position: { x: number; y: number; page?: number; line?: number; char?: number };
    timestamp: string;
    activityType: 'TYPING' | 'VIEWING' | 'SELECTING' | 'IDLE';
    selection?: { start: any; end: any };
    color?: string;
}

export interface WorkspaceReference {
    id: string;
    name: string;
    type: 'PROJECT' | 'TEAM' | 'DEPARTMENT' | 'EXTERNAL_COLLABORATION';
    description?: string;
    link?: string;
}

export interface FileVersion {
    id: string;
    name: string;
    mimeType: string;
    modifiedTime: string;
    size?: string;
    md5Checksum?: string;
    creator?: UserReference;
    editor?: UserReference;
    comments?: string;
    isPublished?: boolean;
    publishTime?: string;
    storageUrl?: string;
    versionNumber: number;
    labels?: FileLabel[];
    changes?: ChangeLogEntry[];
    retentionPolicyApplied?: RetentionPolicy;
    digitalSignature?: DigitalSignatureInfo;
    aiGeneratedSummary?: string;
    sourceCommitHash?: string;
}

export interface ChangeLogEntry {
    timestamp: string;
    actor: ActorReference;
    changeType: 'CONTENT_MODIFIED' | 'METADATA_MODIFIED' | 'PERMISSION_MODIFIED' | 'COMMENT_ADDED' | 'TAG_ADDED' | 'LABEL_ADDED' | 'ACCESS_GRANTED' | 'ACCESS_REVOKED' | 'CUSTOM_PROPERTY_UPDATE';
    description: string;
    details?: { [key: string]: any };
    revertable?: boolean;
}

export interface BranchInfo {
    branchName: string;
    baseVersionId?: string;
    lastCommitId?: string;
    status: 'ACTIVE' | 'MERGED' | 'ABANDONED';
    createdBy?: UserReference;
    createdTime?: string;
    description?: string;
    mergeTargetBranch?: string;
    divergenceFromMain?: number;
}

export interface MergeRequest {
    id: string;
    sourceBranch: string;
    targetBranch: string;
    status: 'OPEN' | 'MERGED' | 'CLOSED' | 'CONFLICTED';
    createdBy: UserReference;
    createdTime: string;
    reviewedBy?: UserReference[];
    approvedBy?: UserReference[];
    mergeTime?: string;
    conflictsDetected?: boolean;
    conflictDetails?: string;
    description?: string;
    reviewComments?: CommentThread[];
    associatedTasks?: TaskItem[];
}

export interface StorageDetails {
    storageProvider: string;
    bucketName?: string;
    objectKey?: string;
    region?: string;
    storageTier: StorageTier;
    replicationStatus?: ReplicationStatus[];
    dataCenterLocation?: GeoLocation;
    physicalStoragePath?: string;
    logicalStoragePath?: string;
    costOptimizationScore?: number;
    currentStorageCost?: StorageCost;
    dataIntegrityChecks?: DataIntegrityCheck[];
    dataShardingInfo?: DataShardingInfo;
    dataAvailabilityZone?: string;
    backupStatus?: BackupStatus;
    disasterRecoveryPlan?: DisasterRecoveryPlan;
    elasticStoragePoolId?: string;
    dataCompressionRatio?: number;
    encryptionAtRest?: EncryptionDetails;
}

export interface ReplicationStatus {
    zone: string;
    status: 'SYNCED' | 'OUT_OF_SYNC' | 'FAILED' | 'PENDING';
    lastSyncTime: string;
    replicationType: 'GEO_REDUNDANT' | 'ZONE_REDUNDANT' | 'SINGLE_REGION';
    provider?: string;
    replicaLocation?: GeoLocation;
    consistencyLevel?: 'EVENTUAL' | 'STRONG';
}

export interface GeoLocation {
    latitude: number;
    longitude: number;
    country?: string;
    city?: string;
    region?: string;
    timezone?: string;
    accuracyKm?: number;
    source?: 'IP_ADDRESS' | 'GPS' | 'USER_CONFIGURED' | 'SYSTEM_DEFAULT';
    description?: string;
}

export interface StorageCost {
    unit: 'PER_GB_MONTH' | 'TOTAL_MONTHLY' | 'TRANSACTION_COST';
    amount: number;
    currency: string;
    billingAccountId?: string;
    costCenter?: string;
    estimatedAnnualCost?: number;
    lastCalculatedTime?: string;
    costOptimizationSuggestions?: string[];
}

export interface DataIntegrityCheck {
    checkType: 'CHECKSUM' | 'HASH_VERIFICATION' | 'REDUNDANCY_CHECK' | 'PARITY_CHECK' | 'BLOCKCHAIN_PROOF';
    lastCheckTime: string;
    status: 'PASS' | 'FAIL' | 'PENDING';
    details?: string;
    algorithm?: string;
    expectedValue?: string;
    actualValue?: string;
    issueSeverity?: ThreatLevel;
}

export interface DataShardingInfo {
    shardId: string;
    shardKey?: string;
    totalShards: number;
    shardLocations?: string[];
    shardingStrategy?: 'HASH' | 'RANGE' | 'LIST';
    consistencyModel?: 'EVENTUAL' | 'STRONG';
    replicationFactor?: number;
}

export interface BackupStatus {
    lastBackupTime: string;
    status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS' | 'SCHEDULED';
    backupPolicyId: string;
    nextBackupTime?: string;
    recoveryPointObjective?: string;
    recoveryTimeObjective?: string;
    backupLocation?: string;
    versionIncluded?: number;
    encrypted?: boolean;
    dataRetentionDuration?: string;
}

export interface DisasterRecoveryPlan {
    planId: string;
    status: 'ACTIVE' | 'TESTED' | 'PENDING_REVIEW' | 'INACTIVE';
    lastTestDate?: string;
    recoverySiteLocations?: GeoLocation[];
    failoverStrategy?: 'AUTOMATIC' | 'MANUAL';
    recoveryPointObjective?: string;
    recoveryTimeObjective?: string;
    testedBy?: ActorReference[];
    nextTestDate?: string;
}

export interface FileEvent {
    id: string;
    type: FileEventType;
    actor: ActorReference;
    timestamp: string;
    details?: { [key: string]: any };
    sourceIp?: string;
    userAgent?: string;
    sessionID?: string;
    securityContext?: EventSecurityContext;
    relatedFiles?: string[];
    transactionId?: string;
    correlationId?: string;
    status?: 'SUCCESS' | 'FAILURE' | 'PENDING';
    errorMessage?: string;
    actionScope?: 'FILE' | 'FOLDER' | 'DRIVE' | 'SYSTEM';
    tags?: string[];
}

export interface EventSecurityContext {
    sensitivityAccessAttempted?: SensitivityLevel;
    dlpViolationsDetected?: DlpViolation[];
    accessPolicyEvaluated?: AccessPolicy[];
    threatsDetected?: SecurityThreat[];
    encryptionUsed?: EncryptionMethod;
    authenticationStrength?: 'LOW' | 'MEDIUM' | 'HIGH' | 'MFA';
}

export interface SearchMetadata {
    searchableFields?: SearchField[];
    indexedContentSummary?: string;
    lastIndexedTime?: string;
    indexingEngineVersion?: string;
    searchBoostScore?: number;
    customSearchRankings?: CustomSearchRanking[];
    searchFacets?: SearchFacet[];
    semanticSearchEnabled?: boolean;
    queryHistory?: SearchQueryRecord[];
    aiGeneratedKeywords?: string[];
    synonymMap?: { [key: string]: string[] };
    autoCompletionSuggestions?: string[];
    relevanceFeedback?: RelevanceFeedback[];
}

export interface SearchField {
    name: string;
    type: 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'ENUM' | 'GEOSPATIAL' | 'VECTOR';
    isFaceted?: boolean;
    isSearchable?: boolean;
    isSortable?: boolean;
    canBeFiltered?: boolean;
    description?: string;
    exampleValues?: string[];
    source?: 'METADATA' | 'CONTENT' | 'AI_GENERATED';
}

export interface CustomSearchRanking {
    queryPattern: string;
    rankBoost: number;
    reason?: string;
    appliedBy?: UserReference;
    appliedTime?: string;
    validityPeriod?: { start: string; end: string };
}

export interface SearchFacet {
    field: string;
    values: { value: string; count: number }[];
    type: 'TERM' | 'RANGE';
    ranges?: { from?: number | string; to?: number | string; label: string; count: number }[];
}

export interface SearchQueryRecord {
    queryText: string;
    timestamp: string;
    userId?: string;
    resultsCount?: number;
    clickedFileIds?: string[];
    relevanceScore?: number;
    sessionId?: string;
    geoLocation?: GeoLocation;
    deviceInfo?: string;
}

export interface RelevanceFeedback {
    queryId: string;
    fileId: string;
    isRelevant: boolean;
    feedbackTime: string;
    userId?: string;
    context?: string;
}

export interface DlpAttributes {
    sensitiveDataDetected: boolean;
    sensitiveDataTypes?: string[];
    dlpPolicyViolations?: DlpViolation[];
    lastDlpScanTime?: string;
    recommendedMitigation?: string;
    redactionApplied?: boolean;
    encryptionRecommended?: boolean;
    dataMaskingPolicyApplied?: string;
    classificationConfidence?: number;
    riskScore?: number;
}

export interface ContentHash {
    algorithm: string;
    value: string;
    purpose?: 'CONTENT_INTEGRITY' | 'DUPLICATE_DETECTION' | 'THREAT_IDENTIFICATION' | 'PROOF_OF_EXISTENCE';
    generatedTime?: string;
}

export interface ExternalReference {
    url: string;
    title?: string;
    description?: string;
    mimeType?: string;
    lastCheckedTime?: string;
    status?: 'ACTIVE' | 'BROKEN' | 'PENDING';
    sourceFileId?: string;
    context?: string;
    relationshipType?: RelationshipType;
    confidence?: number;
}

export interface RealtimeFileMetrics {
    activeViewers: number;
    activeEditors: number;
    last5MinViews: number;
    last5MinDownloads: number;
    averageLatencyMs?: number;
    currentThroughputBps?: number;
    lastPingTime?: string;
    storageNodeHealth?: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
    dataStreamErrors?: number;
    processingQueueLength?: number;
    predictedPeakUsageTime?: string;
    currentAccessLocations?: GeoLocation[];
    accessSourceDistribution?: { [source: string]: number };
    securityAlertsLastHour?: number;
    performanceScore?: number;
    resourceUsageMetrics?: ResourceUtilizationMetrics;
}

export interface AccessContext {
    deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET' | 'IOT' | 'SERVER' | 'VIRTUAL_MACHINE' | 'QUANTUM_COMPUTER';
    os: string;
    browser?: string;
    ipAddress: string;
    geoLocation: GeoLocation;
    networkType: 'PUBLIC' | 'PRIVATE' | 'VPN' | 'CELLULAR';
    authenticationMethod: string;
    sessionId?: string;
    timestamp: string;
    deviceComplianceStatus?: 'COMPLIANT' | 'NON_COMPLIANT' | 'UNKNOWN';
    userRiskScore?: number;
    accessChannel?: 'WEB_UI' | 'API' | 'MOBILE_APP' | 'DESKTOP_CLIENT' | 'CLI';
    trustScore?: number;
}

export interface BlockchainProvenance {
    transactionId: string;
    blockHash: string;
    blockNumber: number;
    timestamp: string;
    contractAddress?: string;
    ledgerIdentifier: string;
    eventDetails?: { [key: string]: any };
    proofOfIntegrity?: string;
    verifiedBy?: string[];
    transactionCost?: MonetaryValue;
    smartContractLogic?: string;
}

export interface AutomationScript {
    scriptId: string;
    name: string;
    description?: string;
    triggerEvents: FileEventType[];
    language: 'JAVASCRIPT' | 'PYTHON' | 'GAS' | 'SHELL' | 'GO';
    codeSnippet?: string;
    externalScriptUrl?: string;
    createdBy: UserReference;
    createdTime: string;
    lastModifiedTime: string;
    status: 'ACTIVE' | 'INACTIVE' | 'FAILED';
    lastExecutionTime?: string;
    lastExecutionStatus?: 'SUCCESS' | 'FAILURE';
    executionLogs?: string[];
    permissionsRequired?: string[];
    associatedWorkflows?: string[];
    isAICapable?: boolean;
    version?: number;
    parameters?: { name: string; type: string; defaultValue?: any }[];
    errorHandlingStrategy?: 'RETRY' | 'NOTIFY' | 'ROLLBACK';
}

export interface DocumentContentStructure {
    headings?: DocumentHeading[];
    sections?: DocumentSection[];
    tableOfContents?: TableOfContentsEntry[];
    wordCount?: number;
    characterCount?: number;
    pageCount?: number;
    readingTimeMinutes?: number;
    detectedLanguage?: string;
    figuresCount?: number;
    tablesCount?: number;
    citations?: Citation[];
    documentType?: 'REPORT' | 'ESSAY' | 'MEMO' | 'ARTICLE' | 'BOOK' | 'PRESENTATION' | 'LEGAL_BRIEF' | 'CONTRACT' | 'WHITE_PAPER' | 'MANUAL' | 'POLICY';
    isTemplate?: boolean;
    metadataSchemaVersion?: string;
    authorshipAnalysis?: AuthorshipAnalysis;
    readabilityMetrics?: ReadabilityMetrics;
    sentimentDistribution?: SentimentDistribution[];
    referencesToOtherFiles?: InternalFileReference[];
}

export interface DocumentHeading {
    level: number;
    text: string;
    startIndex: number;
    endIndex: number;
    id: string;
    children?: DocumentHeading[];
}

export interface DocumentSection {
    id: string;
    title: string;
    startIndex: number;
    endIndex: number;
    summary?: string;
    keywords?: string[];
    entities?: EntityRecognitionResult[];
    sentiment?: SentimentAnalysisResult;
    hasContentWarnings?: boolean;
    suggestedTags?: ContentTag[];
    relatedSections?: string[];
    accessRestrictions?: AccessPolicy[];
}

export interface TableOfContentsEntry {
    text: string;
    headingId: string;
    pageNumber?: number;
    level: number;
}

export interface Citation {
    text: string;
    targetUrl?: string;
    targetFileId?: string;
    citationStyle?: string;
    confidence?: number;
    type?: 'REFERENCE' | 'FOOTNOTE' | 'ENDNOTE';
}

export interface AuthorshipAnalysis {
    authorIdentificationConfidence?: number;
    predictedAuthors?: UserReference[];
    authorshipStyleMetrics?: { [metric: string]: number };
    plagiarismScore?: number;
    originalityScore?: number;
    detectedCollaborationPatterns?: { userIds: string[]; pattern: string; score: number }[];
}

export interface ReadabilityMetrics {
    fleschReadingEase?: number;
    fleschKincaidGradeLevel?: number;
    gunningFogIndex?: number;
    smogIndex?: number;
    daleChallReadabilityScore?: number;
    automatedReadabilityIndex?: number;
    colemanLiauIndex?: number;
    readabilityLevel?: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
    targetAudienceCompatibility?: { audience: string; score: number }[];
}

export interface SentimentDistribution {
    segment: string;
    sentiment: SentimentAnalysisResult;
    startIndex: number;
    endIndex: number;
}

export interface InternalFileReference {
    targetFileId: string;
    targetFileName?: string;
    targetSectionId?: string;
    type: 'HYPERLINK' | 'EMBED' | 'CROSS_REFERENCE';
    context?: string;
    isBroken?: boolean;
    lastCheckedTime?: string;
}

export interface SpreadsheetContentStructure {
    sheetNames?: string[];
    rowCount?: number;
    columnCount?: number;
    dataRanges?: DataRange[];
    pivotTablesDetected?: PivotTableInfo[];
    chartsDetected?: ChartInfo[];
    formulasUsed?: FormulaInfo[];
    dataValidationRules?: DataValidationRule[];
    externalDataSources?: ExternalDataSource[];
    dataQualityIssues?: DataQualityIssue[];
    semanticColumnTypes?: SemanticColumnType[];
    macrosDetected?: MacroInfo[];
    accessControlPerCell?: CellAccessControl[];
    dataLineageMap?: DataLineageMap;
    anomaliesDetected?: DataAnomaly[];
    dataClassificationPerColumn?: ColumnDataClassification[];
    recommendedVisualizations?: VisualizationRecommendation[];
}

export interface DataRange {
    sheetName: string;
    startCell: string;
    endCell: string;
    description?: string;
    containsHeader?: boolean;
    dataType?: 'NUMERIC' | 'TEXT' | 'DATE' | 'MIXED';
    dataIntegrityScore?: number;
    primaryKeyColumns?: string[];
    semanticTags?: ContentTag[];
}

export interface PivotTableInfo {
    sheetName: string;
    name: string;
    sourceRange: DataRange;
    rows?: string[];
    columns?: string[];
    values?: string[];
    filters?: string[];
    generatedTime?: string;
    lastUpdated?: string;
}

export interface ChartInfo {
    sheetName: string;
    name: string;
    chartType: 'BAR' | 'LINE' | 'PIE' | 'SCATTER' | 'AREA' | 'BUBBLE' | 'RADAR' | 'GAUGE' | 'TREEMAP';
    sourceRange: DataRange;
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    isInteractive?: boolean;
    imagePreviewUrl?: string;
    generatedTime?: string;
}

export interface FormulaInfo {
    sheetName: string;
    cell: string;
    formula: string;
    dependencies?: string[];
    dependents?: string[];
    resultType?: 'NUMBER' | 'TEXT' | 'BOOLEAN' | 'ERROR';
    calculatedValuePreview?: any;
    isVolatile?: boolean;
}

export interface DataValidationRule {
    sheetName: string;
    range: string;
    type: 'LIST' | 'NUMBER_RANGE' | 'DATE_RANGE' | 'TEXT_LENGTH' | 'CUSTOM_FORMULA';
    criteria?: { [key: string]: any };
    inputMessage?: string;
    errorMessage?: string;
    strictness?: 'WARNING' | 'STOP' | 'NONE';
}

export interface ExternalDataSource {
    name: string;
    type: 'DATABASE' | 'API' | 'OTHER_SPREADSHEET' | 'FILE_UPLOAD' | 'WEB_SCRAPE';
    connectionString?: string;
    lastRefreshTime?: string;
    refreshSchedule?: string;
    status?: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
    dataPrivacyPolicyId?: string;
    credentialsManagerId?: string;
}

export interface DataQualityIssue {
    sheetName: string;
    cell?: string;
    range?: string;
    issueType: DataQualityDimension;
    severity: ThreatLevel;
    description: string;
    suggestedCorrection?: string;
    detectedTime: string;
    detectedBy?: ActorReference;
    dataPointValue?: string;
    resolutionStatus?: 'OPEN' | 'RESOLVED' | 'IGNORED';
    resolutionComments?: string;
}

export interface SemanticColumnType {
    sheetName: string;
    columnName: string;
    detectedType: 'EMAIL' | 'PHONE_NUMBER' | 'CREDIT_CARD' | 'DATE' | 'CURRENCY' | 'PERSON_NAME' | 'ADDRESS' | 'ZIP_CODE' | 'PRODUCT_ID' | 'URL' | 'IP_ADDRESS' | 'GEOLOCATION' | 'CUSTOM_ENUM' | 'OTHER';
    confidence: number;
    formatPattern?: string;
    possibleValues?: string[];
    sampleValues?: string[];
    isSensitive?: boolean;
    dlpInfoTypes?: string[];
}

export interface MacroInfo {
    sheetName: string;
    name: string;
    language: 'VBA' | 'JAVASCRIPT' | 'PYTHON';
    description?: string;
    lastModifiedTime?: string;
    createdBy?: UserReference;
    isExecutable?: boolean;
    securityWarning?: string;
    associatedAutomationScriptId?: string;
    requiredPermissions?: string[];
}

export interface CellAccessControl {
    sheetName: string;
    range: string;
    readOnlyUsers?: UserReference[];
    editableUsers?: UserReference[];
    hiddenFromUsers?: UserReference[];
    conditionalAccessPolicyId?: string;
}

export interface DataLineageMap {
    sources: DataLineageSource[];
    transformations: DataTransformation[];
    destinations: DataLineageDestination[];
    generatedTime?: string;
    lastUpdated?: string;
    completenessScore?: number;
}

export interface DataLineageSource {
    id: string;
    name: string;
    type: 'FILE' | 'DATABASE' | 'API' | 'STREAM';
    location?: string;
    description?: string;
    schema?: string;
}

export interface DataTransformation {
    id: string;
    name: string;
    type: 'FILTER' | 'AGGREGATION' | 'JOIN' | 'CLEANSING' | 'PIVOT' | 'SCRIPT' | 'AI_GENERATED';
    inputSources: string[];
    outputDestinations: string[];
    logic?: string;
    transformedColumns?: string[];
    transformedBy?: ActorReference;
    transformationTime?: string;
}

export interface DataLineageDestination {
    id: string;
    name: string;
    type: 'FILE' | 'DATABASE' | 'REPORT' | 'DASHBOARD' | 'ML_MODEL' | 'EXTERNAL_SYSTEM';
    location?: string;
    description?: string;
    consumerApplication?: string;
}

export interface DataAnomaly {
    type: 'OUTLIER' | 'MISSING_DATA' | 'DUPLICATE_RECORDS' | 'DATA_DRIFT' | 'SCHEMA_DEVIATION';
    severity: ThreatLevel;
    description: string;
    location?: { sheetName?: string; cell?: string; range?: string; column?: string };
    detectedTime: string;
    anomalyScore: number;
    suggestedAction?: SuggestedFileAction;
    dataPointValue?: any;
    baselineValue?: any;
}

export interface ColumnDataClassification {
    sheetName: string;
    columnName: string;
    sensitivityLevel: SensitivityLevel;
    complianceStandards?: ComplianceStandard[];
    dataRedactionPolicyId?: string;
    isPII?: boolean;
    isPHI?: boolean;
    isPCI?: boolean;
    classificationMethod?: 'MANUAL' | 'AUTOMATIC' | 'HYBRID';
    classificationConfidence?: number;
}

export interface VisualizationRecommendation {
    chartType: 'BAR' | 'LINE' | 'PIE' | 'SCATTER' | 'AREA' | 'BUBBLE' | 'RADAR' | 'GAUGE' | 'TREEMAP' | 'GEOSPATIAL' | 'NETWORK';
    dataColumns: string[];
    reason: 'TREND_DETECTION' | 'COMPARISON' | 'DISTRIBUTION_ANALYSIS' | 'RELATIONSHIP_VISUALIZATION' | 'GEOSPATIAL_ANALYSIS' | 'RECOMMENDED_BY_AI';
    confidence: number;
    suggestedTitle?: string;
    generatedImageUrl?: string;
    interactiveViewerUrl?: string;
    filtersApplied?: { column: string; value: any }[];
}


export interface CodeContentStructure {
    language: string;
    linesOfCode?: number;
    commentLinesOfCode?: number;
    functionCount?: number;
    classCount?: number;
    importStatements?: string[];
    dependencies?: CodeDependency[];
    testCoveragePercentage?: number;
    codeQualityScore?: number;
    securityVulnerabilities?: CodeVulnerability[];
    complexityMetrics?: CodeComplexityMetrics;
    documentationStatus?: DocumentationStatus;
    ciCdIntegrationStatus?: CiCdIntegrationStatus;
    gitRepositoryInfo?: GitRepositoryInfo;
    apiEndpointsDetected?: ApiEndpointInfo[];
    dataSchemasDetected?: DataSchemaInfo[];
    containerizationConfig?: ContainerConfig;
    serverlessFunctionInfo?: ServerlessFunctionInfo;
    licenseInfo?: LicenseInfo;
    codeOwnership?: CodeOwnership;
    performanceMetrics?: CodePerformanceMetrics;
    costMetrics?: CodeCostMetrics;
    changeAnalysis?: CodeChangeAnalysis;
    aiGeneratedCodeSuggestions?: CodeSuggestion[];
    staticAnalysisFindings?: StaticAnalysisFinding[];
    dynamicAnalysisFindings?: DynamicAnalysisFinding[];
    securityHardeningRecommendations?: SecurityRecommendation[];
    refactoringSuggestions?: RefactoringSuggestion[];
    codeExplainability?: CodeExplainability;
    ethicalAIReview?: EthicalAIReviewStatus;
}

export interface CodeDependency {
    name: string;
    version?: string;
    type: 'EXTERNAL_LIBRARY' | 'INTERNAL_MODULE' | 'FRAMEWORK' | 'API';
    sourceRepository?: string;
    license?: string;
    securityVulnerabilities?: CodeVulnerability[];
    isTransitive?: boolean;
    lastUpdated?: string;
    riskScore?: number;
}

export interface CodeVulnerability {
    id: string;
    cveId?: string;
    severity: ThreatLevel;
    description: string;
    location?: { file: string; line: number; column?: number };
    fixRecommendation?: string;
    exploitabilityScore?: number;
    impactScore?: number;
    detectedBy?: ActorReference;
    detectionTime?: string;
    status?: 'OPEN' | 'FIXED' | 'FALSE_POSITIVE' | 'IGNORED';
    links?: ExternalReference[];
    confidence?: number;
}

export interface CodeComplexityMetrics {
    cyclomaticComplexity?: number;
    halsteadComplexity?: number;
    maintainabilityIndex?: number;
    cognitiveComplexity?: number;
    nestingDepth?: number;
    couplingMetrics?: { afferent: number; efferent: number };
    fanInFanOut?: { function: string; fanIn: number; fanOut: number }[];
}

export interface DocumentationStatus {
    hasReadme: boolean;
    hasApiDocs: boolean;
    docCoveragePercentage?: number;
    lastDocUpdate?: string;
    docStyleGuideCompliance?: boolean;
    missingDocSections?: string[];
    aiGeneratedDocSuggestions?: ContentEnhancementSuggestion[];
}

export interface CiCdIntegrationStatus {
    lastBuildStatus: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'PENDING';
    lastBuildTime: string;
    lastDeployStatus?: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'PENDING';
    lastDeployTime?: string;
    pipelineName?: string;
    buildLogUrl?: string;
    deployEnvironment?: string;
    testReportUrl?: string;
    securityScanStatus?: SecurityScanResult[];
}

export interface GitRepositoryInfo {
    repositoryUrl: string;
    branchName: string;
    lastCommitHash: string;
    lastCommitMessage: string;
    lastCommitAuthor: UserReference;
    lastCommitTime: string;
    pullRequestsOpen?: number;
    issuesOpen?: number;
    codeOwners?: UserReference[];
    stars?: number;
    forks?: number;
    lastSyncTime?: string;
    remoteHealthStatus?: 'HEALTHY' | 'UNREACHABLE' | 'DEGRADED';
}

export interface ApiEndpointInfo {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
    description?: string;
    parameters?: ApiParameter[];
    responseSchemaId?: string;
    authenticationRequired?: boolean;
    authorizationRoles?: string[];
    rateLimitPolicy?: string;
    isPublic?: boolean;
    tags?: string[];
    latencyMetrics?: { p50ms: number; p99ms: number };
    errorRatePercentage?: number;
    associatedDocumentationId?: string;
}

export interface ApiParameter {
    name: string;
    type: string;
    in: 'QUERY' | 'HEADER' | 'PATH' | 'BODY' | 'COOKIE';
    required: boolean;
    description?: string;
    example?: any;
    schemaId?: string;
}

export interface DataSchemaInfo {
    id: string;
    name: string;
    format: 'JSON_SCHEMA' | 'AVRO' | 'PROTOBUF' | 'SQL_DDL' | 'XML_SCHEMA';
    schemaContent?: string;
    version?: string;
    description?: string;
    fields?: SchemaField[];
    exampleData?: string;
    references?: InternalFileReference[];
}

export interface SchemaField {
    name: string;
    type: string;
    description?: string;
    isRequired: boolean;
    isArray?: boolean;
    enum?: string[];
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    minimum?: number;
    maximum?: number;
    isPII?: boolean;
    isPHI?: boolean;
    isSensitive?: boolean;
    defaultValue?: any;
}

export interface ContainerConfig {
    containerType: 'DOCKER' | 'KUBERNETES' | 'OCI';
    imageName: string;
    imageTag?: string;
    dockerfileContent?: string;
    kubernetesManifests?: string[];
    portsExposed?: number[];
    environmentVariables?: { [key: string]: string };
    buildInstructions?: string;
    securityScanResults?: SecurityScanResult[];
    resourceLimits?: { cpu: string; memory: string };
    registryUrl?: string;
    lastBuildTime?: string;
    buildBy?: ActorReference;
}

export interface ServerlessFunctionInfo {
    provider: 'AWS_LAMBDA' | 'AZURE_FUNCTIONS' | 'GOOGLE_CLOUD_FUNCTIONS';
    functionName: string;
    runtime: string;
    handler: string;
    entryPoint?: string;
    memorySizeMb: number;
    timeoutSeconds: number;
    triggers?: FunctionTrigger[];
    environmentVariables?: { [key: string]: string };
    deploymentPackageUrl?: string;
    lastDeploymentTime?: string;
    deployedBy?: ActorReference;
    invocationsLastDay?: number;
    errorRateLastDay?: number;
    costPerInvocation?: MonetaryValue;
}

export interface FunctionTrigger {
    type: 'HTTP' | 'STORAGE_EVENT' | 'MESSAGE_QUEUE' | 'DATABASE_EVENT' | 'CRON_SCHEDULE';
    details?: { [key: string]: any };
}

export interface LicenseInfo {
    type: string;
    text?: string;
    complianceStatus?: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING_REVIEW';
    expirationDate?: string;
    licensor?: string;
    licenseUrl?: string;
    approvedForUse?: boolean;
    openSource?: boolean;
}

export interface CodeOwnership {
    ownerTeamId?: string;
    ownerUserId?: string;
    reviewers?: UserReference[];
    approvers?: UserReference[];
    escalationContact?: UserReference;
    lastReviewDate?: string;
    ownershipScore?: number;
    responsibilityMatrixUrl?: string;
}

export interface CodePerformanceMetrics {
    averageExecutionTimeMs?: number;
    peakMemoryUsageMb?: number;
    cpuUtilizationPercentage?: number;
    concurrencySupport?: number;
    scalabilityScore?: number;
    bottlenecksDetected?: PerformanceBottleneck[];
    benchmarks?: CodeBenchmark[];
    energyConsumptionJoules?: number;
    carbonFootprintKgCO2e?: number;
}

export interface PerformanceBottleneck {
    location: string;
    type: 'CPU_BOUND' | 'IO_BOUND' | 'MEMORY_LEAK' | 'DATABASE_QUERY';
    severity: ThreatLevel;
    description: string;
    fixRecommendation?: string;
    detectedTime?: string;
    profileDataUrl?: string;
}

export interface CodeBenchmark {
    name: string;
    metric: string;
    value: number;
    unit: string;
    threshold?: number;
    status: 'PASS' | 'FAIL' | 'IMPROVED' | 'REGRESSED';
    runTime: string;
    environment?: string;
    runner?: ActorReference;
    referenceVersion?: string;
}

export interface CodeCostMetrics {
    estimatedComputeCost?: MonetaryValue;
    estimatedStorageCost?: MonetaryValue;
    estimatedNetworkCost?: MonetaryValue;
    totalEstimatedCost?: MonetaryValue;
    costOptimizationRecommendations?: string[];
    actualCostLastMonth?: MonetaryValue;
    costCenter?: string;
}

export interface CodeChangeAnalysis {
    lastSignificantChange?: string;
    impactAssessmentScore?: number;
    breakingChangesDetected?: boolean;
    regressionRiskScore?: number;
    affectedSystems?: string[];
    reviewerCommentsSummary?: string;
    codeChurnRate?: number;
    refactorEfficiencyScore?: number;
}

export interface CodeSuggestion {
    type: 'BUG_FIX' | 'FEATURE_ADDITION' | 'PERFORMANCE_OPTIMIZATION' | 'SECURITY_FIX' | 'CODE_STYLE' | 'REFACTORING' | 'DOCUMENTATION';
    description: string;
    codeDiff: TextDiff[];
    confidence: number;
    suggestedBy?: ActorReference;
    suggestedTime?: string;
    requiresReview?: boolean;
    estimatedEffortHours?: number;
    automatedTestsPassed?: boolean;
}

export interface StaticAnalysisFinding {
    ruleId: string;
    tool: string;
    severity: ThreatLevel;
    description: string;
    location: { filePath: string; line: number; column?: number };
    codeSnippet?: string;
    fixSuggestion?: string;
    confidence: number;
    status?: 'OPEN' | 'FIXED' | 'FALSE_POSITIVE' | 'IGNORED';
    detectedTime?: string;
}

export interface DynamicAnalysisFinding {
    tool: string;
    type: 'RUNTIME_ERROR' | 'MEMORY_LEAK' | 'CONCURRENCY_ISSUE' | 'VULNERABILITY';
    severity: ThreatLevel;
    description: string;
    executionPath?: string[];
    inputData?: string;
    reproductionSteps?: string[];
    detectedTime?: string;
    confidence: number;
    status?: 'OPEN' | 'FIXED' | 'FALSE_POSITIVE' | 'IGNORED';
}

export interface SecurityRecommendation {
    recommendationType: 'INPUT_VALIDATION' | 'AUTHENTICATION' | 'AUTHORIZATION' | 'ENCRYPTION' | 'SECURE_CONFIGURATION' | 'DEPENDENCY_MANAGEMENT' | 'LOGGING_MONITORING';
    description: string;
    severity: ThreatLevel;
    impact: string;
    effortToImplement: 'LOW' | 'MEDIUM' | 'HIGH';
    codeExampleFix?: string;
    referenceLink?: string;
    confidence?: number;
}

export interface RefactoringSuggestion {
    type: 'EXTRACT_METHOD' | 'EXTRACT_CLASS' | 'RENAME' | 'INLINE_METHOD' | 'MOVE_METHOD' | 'INTRODUCE_PARAMETER_OBJECT' | 'REPLACE_CONDITIONAL_WITH_POLYMORPHISM';
    description: string;
    targetLocation?: { filePath: string; line: number; column?: number };
    impactAnalysis?: string;
    estimatedBenefit?: string;
    confidence: number;
    automatedFixAvailable?: boolean;
}

export interface CodeExplainability {
    explanationMethod: 'LIME' | 'SHAP' | 'COUNTERFACTUAL' | 'ATTENTION_MAPS' | 'FEATURE_IMPORTANCE';
    explanationOutput?: string;
    confidence: number;
    generatedTime?: string;
    targetCodeSegment?: string;
    metricsExplained?: string[];
}

export interface ImageContentStructure {
    width: number;
    height: number;
    channels?: number;
    colorProfile?: string;
    fileFormat: string;
    resolutionDpi?: number;
    exifData?: { [key: string]: string };
    imageFeatures?: ImageFeature[];
    objectDetectionResults?: ObjectDetectionResult[];
    faceDetectionResults?: FaceDetectionResult[];
    ocrResults?: OCRResult[];
    imageCaption?: string;
    dominantColors?: DominantColor[];
    semanticSceneDescription?: string;
    aestheticsScore?: number;
    copyrightInfo?: CopyrightInfo;
    imageManipulationHistory?: ImageManipulationEvent[];
    watermarkInfo?: WatermarkInfo;
    depthMapUrl?: string;
    neuralNetworkFeatureVectors?: EmbeddingVector[];
    segmentationMasks?: SegmentationMaskInfo[];
    poseEstimationResults?: PoseEstimationResult[];
    generativeAIProvenance?: GenerativeAIProvenance;
    accessibilityDescription?: string;
}

export interface ImageFeature {
    type: 'EDGE_DETECTION' | 'CORNER_DETECTION' | 'TEXTURE_ANALYSIS' | 'COLOR_HISTOGRAM' | 'FEATURE_POINTS' | 'FACE_LANDMARKS' | 'TEXT_REGION';
    description?: string;
    confidence?: number;
    dataUrl?: string;
}

export interface ObjectDetectionResult {
    objectName: string;
    boundingBox: { x: number; y: number; width: number; height: number };
    confidence: number;
    classId?: string;
    instanceId?: string;
    timestamp?: string;
    attributes?: { [key: string]: string };
    semanticTags?: ContentTag[];
}

export interface FaceDetectionResult {
    boundingBox: { x: number; y: number; width: number; height: number };
    confidence: number;
    faceId?: string;
    emotions?: { [emotion: string]: number };
    ageEstimate?: { min: number; max: number; confidence: number };
    genderEstimate?: { gender: 'MALE' | 'FEMALE' | 'UNKNOWN'; confidence: number };
    pose?: { pitch: number; yaw: number; roll: number };
    landmarks?: { type: string; x: number; y: number }[];
    occlusionStatus?: { eye: boolean; mouth: boolean };
    glasses?: boolean;
    beard?: boolean;
    expression?: string;
    celebrityRecognition?: CelebrityInfo[];
    identity?: UserReference;
    blurAmount?: number;
}

export interface CelebrityInfo {
    name: string;
    confidence: number;
    wikipediaUrl?: string;
    bio?: string;
}

export interface OCRResult {
    language: string;
    fullText: string;
    pages?: OCRPageResult[];
    confidence?: number;
    textRegions?: TextRegion[];
    extractedEntities?: EntityRecognitionResult[];
    tableDetectionResults?: TableDetectionResult[];
    handwritingDetectionConfidence?: number;
    documentStructurePrediction?: DocumentContentStructure;
}

export interface OCRPageResult {
    pageNumber: number;
    text: string;
    lines?: OCRLineResult[];
}

export interface OCRLineResult {
    text: string;
    boundingBox: { x: number; y: number; width: number; height: number };
    confidence: number;
    words?: OCRWordResult[];
}

export interface OCRWordResult {
    text: string;
    boundingBox: { x: number; y: number; width: number; height: number };
    confidence: number;
    characters?: OCRCharResult[];
}

export interface OCRCharResult {
    text: string;
    boundingBox: { x: number; y: number; width: number; height: number };
    confidence: number;
}

export interface TextRegion {
    text: string;
    boundingBox: { x: number; y: number; width: number; height: number };
    confidence: number;
    type: 'PARAGRAPH' | 'LINE' | 'WORD' | 'HEADING' | 'CAPTION' | 'TABLE_CELL';
    language?: string;
}

export interface TableDetectionResult {
    boundingBox: { x: number; y: number; width: number; height: number };
    rows: number;
    columns: number;
    cells: TableCell[];
    confidence: number;
    extractedDataCsv?: string;
    extractedDataJson?: string;
    tableCaption?: string;
}

export interface TableCell {
    text: string;
    rowIndex: number;
    columnIndex: number;
    rowSpan?: number;
    colSpan?: number;
    boundingBox: { x: number; y: number; width: number; height: number };
    confidence?: number;
}

export interface DominantColor {
    hex: string;
    percentage: number;
    rgb: { r: number; g: number; b: number };
    name?: string;
}

export interface CopyrightInfo {
    holder: string;
    year: number;
    registrationNumber?: string;
    licenseTerms?: string;
    isWatermarked?: boolean;
    digitalFingerprint?: string;
    usageRights?: UsageRights;
}

export interface UsageRights {
    canDistribute: boolean;
    canModify: boolean;
    canUseCommercially: boolean;
    canSublicense: boolean;
    attributedTo?: string;
    restrictions?: string[];
    expirationDate?: string;
}

export interface ImageManipulationEvent {
    timestamp: string;
    actor: ActorReference;
    type: 'ROTATED' | 'CROPPED' | 'RESIZED' | 'FILTER_APPLIED' | 'COLOR_ADJUSTED' | 'LAYER_ADDED' | 'TEXT_OVERLAY' | 'RETOUCHED' | 'WATERMARK_ADDED' | 'AI_GENERATED_EDIT';
    details?: { [key: string]: any };
    previousVersionId?: string;
    undoable?: boolean;
    softwareUsed?: string;
    parametersUsed?: { [key: string]: any };
}

export interface WatermarkInfo {
    text?: string;
    imageOverlayUrl?: string;
    position?: 'TOP_LEFT' | 'CENTER' | 'BOTTOM_RIGHT' | 'TILE';
    opacity?: number;
    color?: string;
    appliedBy?: ActorReference;
    appliedTime?: string;
    isRemovable?: boolean;
    removableBy?: UserReference[];
}

export interface SegmentationMaskInfo {
    maskType: 'OBJECT' | 'SEMANTIC_REGION' | 'INSTANCE';
    label: string;
    maskDataUrl?: string;
    confidence?: number;
    classId?: string;
    instanceId?: string;
}

export interface PoseEstimationResult {
    personId: string;
    keypoints: Keypoint[];
    confidence: number;
    boundingBox?: { x: number; y: number; width: number; height: number };
    detectedTimestamp?: string;
}

export interface Keypoint {
    name: string;
    x: number;
    y: number;
    score: number;
}

export interface GenerativeAIProvenance {
    generatedByAI: boolean;
    modelUsed?: AIModelReference;
    generationParameters?: { [key: string]: any };
    sourcePrompts?: string[];
    trainingDataSource?: string[];
    ethicalAIReview?: EthicalAIReviewStatus;
    humanInterventionPoints?: HumanIntervention[];
    originalityScore?: number;
    styleTransferSourceId?: string;
    versionHistory?: GenerativeAIHistoryEntry[];
}

export interface HumanIntervention {
    actor: ActorReference;
    timestamp: string;
    description: string;
    interventionType: 'EDIT' | 'GUIDE' | 'CURATE' | 'SELECT';
}

export interface GenerativeAIHistoryEntry {
    version: number;
    generatedTime: string;
    modelUsed: AIModelReference;
    parametersUsed: { [key: string]: any };
    editedByHumans: boolean;
    editor?: ActorReference;
    diffFromPrevious?: string;
}

export interface AudioVideoContentStructure {
    durationSeconds: number;
    bitrateKbps?: number;
    codec: string;
    fileFormat: string;
    resolution?: { width: number; height: number };
    framerateFps?: number;
    channels?: number;
    sampleRateHz?: number;
    transcript?: TranscriptInfo;
    speakerDiarization?: SpeakerDiarizationInfo;
    sceneDetectionResults?: SceneDetectionResult[];
    contentSummaries?: ContentSummary[];
    sentimentAnalysis?: SentimentAnalysisResult[];
    objectDetectionTracks?: ObjectDetectionTrack[];
    faceDetectionTracks?: FaceDetectionTrack[];
    audioEventsDetected?: AudioEventDetectionResult[];
    soundEventsDetected?: SoundEventDetectionResult[];
    speechToTextConfidence?: number;
    videoMotionAnalysis?: VideoMotionAnalysis;
    mediaChapters?: MediaChapter[];
    mediaMarkers?: MediaMarker[];
    mediaSegments?: MediaSegment[];
    digitalRightsManagement?: DRMInfo;
    metadataTracks?: MetadataTrack[];
    captionTracks?: CaptionTrack[];
    audioLoudnessInfo?: AudioLoudnessInfo;
    videoColorimetry?: VideoColorimetry;
    aiGeneratedHighlights?: HighlightEvent[];
    translationTracks?: TranslationTrack[];
    speakerIdentification?: SpeakerIdentificationResult[];
    contentModerationFlags?: ContentModerationFlag[];
    deepfakeDetectionScore?: number;
    audioFingerprint?: string;
    videoFingerprint?: string;
    visualSummaries?: VideoVisualSummary[];
}

export interface TranscriptInfo {
    languageCode: string;
    fullText: string;
    segments?: TranscriptSegment[];
    confidence?: number;
    speakerIdsIncluded?: boolean;
    editedByHumans?: boolean;
    editor?: UserReference;
    lastEditTime?: string;
    generatedTime?: string;
    source?: 'AUTOMATIC' | 'HUMAN_TRANSCRIBED' | 'HYBRID';
}

export interface TranscriptSegment {
    id: string;
    startTimeSeconds: number;
    endTimeSeconds: number;
    text: string;
    speakerId?: string;
    confidence?: number;
    sentiment?: SentimentAnalysisResult;
    keywords?: ContentTag[];
}

export interface SpeakerDiarizationInfo {
    speakers?: SpeakerInfo[];
    segments?: SpeakerDiarizationSegment[];
    confidence?: number;
    modelUsed?: AIModelReference;
}

export interface SpeakerInfo {
    id: string;
    genderEstimate?: { gender: 'MALE' | 'FEMALE' | 'UNKNOWN'; confidence: number };
    ageEstimate?: { min: number; max: number; confidence: number };
    displayName?: string;
    voiceCharacteristics?: { pitchMean: number; speechRateWordsPerMin: number };
    voiceEmbedding?: number[];
}

export interface SpeakerDiarizationSegment {
    startTimeSeconds: number;
    endTimeSeconds: number;
    speakerId: string;
    confidence: number;
}

export interface SceneDetectionResult {
    startTimeSeconds: number;
    endTimeSeconds: number;
    description: string;
    shotType?: 'CLOSE_UP' | 'MEDIUM_SHOT' | 'LONG_SHOT' | 'PAN' | 'TILT' | 'ZOOM';
    cameraMotion?: 'STATIC' | 'MOVING';
    confidence?: number;
    keyframeImageUrl?: string;
    summaries?: ContentSummary[];
    semanticTags?: ContentTag[];
}

export interface ObjectDetectionTrack {
    objectId: string;
    objectName: string;
    classId?: string;
    frames: ObjectDetectionFrame[];
    confidence?: number;
    semanticTags?: ContentTag[];
    overallSentiment?: SentimentAnalysisResult;
    lifetimeSeconds?: number;
    trackingAlgorithm?: string;
}

export interface ObjectDetectionFrame {
    timeSeconds: number;
    boundingBox: { x: number; y: number; width: number; height: number };
    confidence: number;
    attributes?: { [key: string]: string };
}

export interface FaceDetectionTrack {
    faceId: string;
    frames: FaceDetectionFrame[];
    identity?: UserReference;
    overallSentiment?: SentimentAnalysisResult;
    overallEmotion?: string;
    lifetimeSeconds?: number;
}

export interface FaceDetectionFrame {
    timeSeconds: number;
    boundingBox: { x: number; y: number; width: number; height: number };
    confidence: number;
    emotions?: { [emotion: string]: number };
    ageEstimate?: { min: number; max: number; confidence: number };
    genderEstimate?: { gender: 'MALE' | 'FEMALE' | 'UNKNOWN'; confidence: number };
    pose?: { pitch: number; yaw: number; roll: number };
    landmarks?: { type: string; x: number; y: number }[];
    expression?: string;
}

export interface AudioEventDetectionResult {
    startTimeSeconds: number;
    endTimeSeconds: number;
    eventType: 'SPEECH' | 'MUSIC' | 'SILENCE' | 'NOISE' | 'APPLAUSE' | 'LAUGHTER' | 'BEEP' | 'ALARM' | 'BACKGROUND_CONVERSATION';
    confidence: number;
    description?: string;
    speakerId?: string;
}

export interface SoundEventDetectionResult {
    startTimeSeconds: number;
    endTimeSeconds: number;
    soundType: string;
    confidence: number;
    description?: string;
}

export interface VideoMotionAnalysis {
    overallMotionScore?: number;
    motionSegments?: MotionSegment[];
    cameraStabilityScore?: number;
    stabilizationRecommended?: boolean;
    dominantMotionDirection?: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN' | 'ZOOM_IN' | 'ZOOM_OUT' | 'NONE';
    motionVectorsAnalyzed?: boolean;
}

export interface MotionSegment {
    startTimeSeconds: number;
    endTimeSeconds: number;
    motionIntensity: number;
    dominantMovement?: string;
}

export interface MediaChapter {
    id: string;
    startTimeSeconds: number;
    endTimeSeconds?: number;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    semanticTags?: ContentTag[];
    autoGenerated?: boolean;
}

export interface MediaMarker {
    id: string;
    timeSeconds: number;
    title: string;
    description?: string;
    type: 'HIGHLIGHT' | 'ANNOTATION' | 'KEY_EVENT' | 'ERROR_POINT';
    createdBy?: ActorReference;
    createdTime?: string;
    thumbnailUrl?: string;
    sentiment?: SentimentAnalysisResult;
    tags?: string[];
    linkedCommentThreadId?: string;
}

export interface MediaSegment {
    id: string;
    startTimeSeconds: number;
    endTimeSeconds: number;
    type: 'AD_BREAK' | 'CONTENT' | 'SPONSOR_SEGMENT' | 'INTRO' | 'OUTRO' | 'RECAP';
    label?: string;
    confidence?: number;
    action?: 'SKIP' | 'HIGHLIGHT' | 'MONETIZE';
    audienceRating?: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';
    sensitiveContentDetected?: boolean;
    dlpViolationsDetected?: DlpViolation[];
}

export interface DRMInfo {
    isEnabled: boolean;
    provider?: string;
    licenseServerUrl?: string;
    contentProtectionPolicyId?: string;
    licenseExpirationSeconds?: number;
    supportedDevices?: string[];
    keyId?: string;
    isOfflineEnabled?: boolean;
}

export interface MetadataTrack {
    trackId: string;
    format: 'JSON' | 'XML' | 'SRT' | 'VTT' | 'IMSC1';
    languageCode?: string;
    contentUrl?: string;
    type: 'CAPTION' | 'SUBTITLE' | 'TIMED_TEXT' | 'CUSTOM_DATA';
    isDefault?: boolean;
    label?: string;
    confidence?: number;
    autoGenerated?: boolean;
}

export interface CaptionTrack extends MetadataTrack {
    type: 'CAPTION' | 'SUBTITLE';
    isForced?: boolean;
    isEasyRead?: boolean;
    translationSourceLanguage?: string;
}

export interface AudioLoudnessInfo {
    integratedLoudnessLUFS?: number;
    loudnessRangeLU?: number;
    peakLoudnessdBFS?: number;
    truePeakdBTP?: number;
    gatingMethod?: string;
    loudnessNormalizationApplied?: boolean;
}

export interface VideoColorimetry {
    colorPrimaries: 'BT.709' | 'BT.2020' | 'BT.2100';
    transferCharacteristics: 'BT.709' | 'PQ' | 'HLG' | 'LINEAR';
    matrixCoefficients: 'BT.709' | 'BT.2020_NCL' | 'BT.2020_CL';
    fullRange?: boolean;
    dynamicRange?: 'SDR' | 'HDR10' | 'DOLBY_VISION' | 'HDR10+';
    bitDepth?: number;
    hdrMetadata?: HDRMetadata;
}

export interface HDRMetadata {
    maxDisplayLuminanceNits?: number;
    minDisplayLuminanceNits?: number;
    maxContentLightLevelNits?: number;
    maxFrameAverageLightLevelNits?: number;
    colorVolume?: { x: number; y: number }[];
}

export interface HighlightEvent {
    startTimeSeconds: number;
    endTimeSeconds: number;
    title: string;
    description?: string;
    type: 'KEY_MOMENT' | 'TOPIC_CHANGE' | 'EMOTIONAL_PEAK' | 'USER_INTERACTION_PEAK' | 'AI_GENERATED';
    confidence?: number;
    thumbnailUrl?: string;
    sentiment?: SentimentAnalysisResult;
    associatedEntities?: EntityRecognitionResult[];
}

export interface TranslationTrack extends MetadataTrack {
    type: 'TRANSLATION';
    sourceLanguageCode: string;
    targetLanguageCode: string;
    translationEngine?: string;
    confidence?: number;
    isHumanVerified?: boolean;
}

export interface SpeakerIdentificationResult {
    startTimeSeconds: number;
    endTimeSeconds: number;
    speakerIdentity: UserReference | string;
    confidence: number;
    isRecognizedUser?: boolean;
    biometricMatchScore?: number;
    identifiedBy?: ActorReference;
}

export interface ContentModerationFlag {
    type: 'VIOLENCE' | 'HATE_SPEECH' | 'SEXUAL_CONTENT' | 'SELF_HARM' | 'HARASSMENT' | 'SPAM' | 'GRAPHIC_CONTENT' | 'ILLEGAL_DRUGS' | 'FIREARMS' | 'MISINFORMATION';
    severity: ThreatLevel;
    confidence: number;
    startTimeSeconds?: number;
    endTimeSeconds?: number;
    imageUrl?: string;
    textSnippet?: string;
    reasoning?: string;
    actionTaken?: 'BLOCKED' | 'WARNED' | 'REDACTED' | 'REVIEW_REQUIRED' | 'FLAGGED_FOR_HUMAN_REVIEW';
    detectedBy?: ActorReference;
    detectedTime?: string;
    manualReviewStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
    reviewedBy?: ActorReference;
    reviewTime?: string;
}

export interface DataQualityMetrics {
    overallScore?: number;
    dimensions?: DataQualityDimensionMetric[];
    lastEvaluatedTime?: string;
    evaluationPolicyId?: string;
    issuesDetectedCount?: number;
    severityBreakdown?: { [severity: string]: number };
    recommendations?: string[];
    auditedBy?: ActorReference;
    complianceScore?: number;
}

export interface DataQualityDimensionMetric {
    dimension: DataQualityDimension;
    score: number;
    details?: string;
    issuesCount?: number;
    thresholdExceeded?: boolean;
}

export interface DataLineage {
    sourceFiles?: InternalFileReference[];
    derivedFiles?: InternalFileReference[];
    transformationHistory?: DataTransformationHistoryEntry[];
    provenanceGraphUrl?: string;
    confidenceScore?: number;
    lastUpdated?: string;
    validationStatus?: 'VERIFIED' | 'UNVERIFIED' | 'CONFLICT';
    dataSteward?: UserReference;
}

export interface DataTransformationHistoryEntry {
    transformationId: string;
    transformationName?: string;
    actor: ActorReference;
    timestamp: string;
    description: string;
    inputFiles?: InternalFileReference[];
    outputFiles?: InternalFileReference[];
    parametersUsed?: { [key: string]: any };
    softwareUsed?: string;
    version?: string;
    sourceCodeLink?: string;
    validationStatus?: 'SUCCESS' | 'FAILURE' | 'PENDING';
    errorMessage?: string;
}

export interface FileScheduledAction {
    actionId: string;
    actionType: ActionRecommendationType;
    scheduledTime: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    createdBy: ActorReference;
    createdTime: string;
    lastExecutionTime?: string;
    recurrence?: string;
    parameters?: { [key: string]: any };
    executionLogs?: string[];
    errorMessage?: string;
    approvalRequired?: boolean;
    approvedBy?: UserReference;
    approvalTime?: string;
}

export interface VirtualMountPoint {
    id: string;
    name: string;
    targetPath: string;
    mountType: 'SYMLINK' | 'PROJECT_VIEW' | 'EXTERNAL_INTEGRATION' | 'PERSONAL_FOLDER_PROJECTION';
    createdBy: ActorReference;
    createdTime: string;
    permissions?: FilePermission[]; // Assuming a FilePermission interface exists elsewhere
    description?: string;
    sourceFileId?: string;
    lastAccessedTime?: string;
    isValid?: boolean;
}

export interface FilePermission {
    id: string;
    type: 'USER' | 'GROUP' | 'DOMAIN' | 'PUBLIC' | 'APP';
    role: 'OWNER' | 'ORGANIZER' | 'FILE_ORGANIZER' | 'WRITER' | 'COMMENTER' | 'READER';
    emailAddress?: string;
    domain?: string;
    expirationTime?: string;
    allowDiscovery?: boolean;
    grantedBy?: UserReference;
    grantedTime?: string;
    inheritanceType?: 'INHERITED' | 'DIRECT' | 'OVERRIDDEN';
    isInherited?: boolean;
    inheritingFrom?: string; // ID of the parent from which permissions are inherited
    isRestricted?: boolean; // e.g., view only for download option
    effectiveRoles?: string[]; // Actual roles after policy evaluation
    conditionalAccessPolicyApplied?: string; // ID of policy that granted/denied access
}

export interface EncryptionDetails {
    encryptionType: 'AT_REST' | 'IN_TRANSIT' | 'CLIENT_SIDE' | 'HOMOMORPHIC' | 'QUANTUM_SAFE';
    method: EncryptionMethod;
    keyManagementSystem?: string;
    keyId?: string;
    encryptedBy?: ActorReference;
    encryptionTime?: string;
    keyRotationSchedule?: string;
    complianceStandard?: ComplianceStandard[];
    auditLogId?: string;
    decryptionRequirements?: DecryptionRequirement[];
    certificateDetails?: CertificateDetails;
    threatProtectionUsed?: boolean;
}

export interface DecryptionRequirement {
    role: string;
    mfaRequired: boolean;
    justificationRequired?: boolean;
    policyId?: string;
}

export interface CertificateDetails {
    fingerprint: string;
    subject: string;
    issuer: string;
    validFrom: string;
    validTo: string;
    serialNumber: string;
    algorithm: string;
    status: 'VALID' | 'REVOKED' | 'EXPIRED';
    revocationReason?: string;
}

export interface ComplianceCertification {
    certificationBody: string;
    standard: ComplianceStandard;
    certificationDate: string;
    expirationDate: string;
    certificateNumber?: string;
    auditorReportLink?: string;
    scope?: string[];
    status: 'CERTIFIED' | 'PENDING_RENEWAL' | 'EXPIRED' | 'REVOKED';
}

export interface DetailedAuditLog {
    auditLogId: string;
    events: ActivityEvent[];
    startTime: string;
    endTime: string;
    generatedBy: ActorReference;
    isTamperProof?: boolean;
    retentionPolicy?: RetentionPolicy;
    accessControlPolicy?: AccessPolicy[];
    exportFormats?: string[];
    externalIntegrations?: string[];
    summarizedEvents?: ActivityEventSummary[];
    anomalyDetectionResults?: AnomalyDetectionResult[];
}

export interface ActivityEventSummary {
    eventType: FileEventType;
    count: number;
    actorCount?: number;
    uniqueActors?: UserReference[];
    summaryPeriod: string;
    topActors?: UserReference[];
    topLocations?: GeoLocation[];
    topDevices?: string[];
}

export interface SuggestedFileAction {
    actionType: ActionRecommendationType;
    reason: string;
    confidence: number;
    suggestedBy?: ActorReference;
    suggestionTime?: string;
    targetId?: string;
    parameters?: { [key: string]: any };
    justificationExplanation?: string;
    impactPrediction?: { positive: string[]; negative: string[] };
    associatedTasks?: TaskItem[];
    undoable?: boolean;
    requiredApprovals?: UserReference[];
}

export interface IntegrationPoint {
    integrationName: string;
    type: 'CRM' | 'ERP' | 'DMS' | 'BI' | 'CMS' | 'EXTERNAL_STORAGE' | 'CUSTOM_API';
    status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
    lastSyncTime?: string;
    configurationLink?: string;
    dataMappings?: DataMapping[];
    apiCallMetrics?: ApiCallMetrics;
    authenticationMethod?: string;
    createdBy?: ActorReference;
    allowedOperations?: string[];
    dataVolumeTransferedLastDay?: string;
    errorLogs?: string[];
}

export interface DataMapping {
    sourceField: string;
    targetField: string;
    transformationLogic?: string;
    dataTypeConversion?: string;
    confidence?: number;
    isRequired?: boolean;
    sensitiveDataMapped?: boolean;
}

export interface ApiCallMetrics {
    last24hCalls: number;
    errorRate: number;
    averageLatencyMs: number;
    peakLatencyMs: number;
    throttledCalls: number;
    billingCostLastDay?: MonetaryValue;
}

export interface DigitalSignatureInfo {
    signatureId: string;
    signer: UserReference;
    timestamp: string;
    algorithm: string;
    certificateUrl?: string;
    validityStatus?: 'VALID' | 'INVALID' | 'EXPIRED' | 'REVOKED' | 'PENDING_VERIFICATION';
    verifiedBy?: ActorReference;
    verificationTime?: string;
    proofOfIntegrity?: string;
    isTamperEvident?: boolean;
    hashOfSignedContent?: string;
}

export interface ResourceUtilizationMetrics {
    cpuCyclesUsed?: number;
    memoryAllocatedMb?: number;
    gpuCyclesUsed?: number;
    networkTrafficBytes?: number;
    storageReadOps?: number;
    storageWriteOps?: number;
    energyConsumptionJoules?: number;
    estimatedCost?: MonetaryValue;
    timestamp?: string;
    measurementIntervalSeconds?: number;
    carbonFootprintKgCO2e?: number;
    waterConsumptionLiters?: number;
}

export interface AccessPolicyExemption {
    entityId: string;
    entityType: 'USER' | 'GROUP' | 'APPLICATION' | 'SERVICE_ACCOUNT';
    reason: string;
    approvedBy?: UserReference;
    approvedTime?: string;
    expirationDate?: string;
    scope?: 'TEMPORARY' | 'PERMANENT';
}

export interface RetentionSchedule {
    scheduleId: string;
    name: string;
    description?: string;
    rules: RetentionRule[];
    createdBy: ActorReference;
    createdTime: string;
    lastModifiedTime?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
    scope?: 'GLOBAL' | 'ORGANIZATION' | 'FOLDER' | 'FILE_TYPE';
    targetMimeTypes?: string[];
    targetFileLabels?: FileLabel[];
    policyOverlapResolution?: 'MOST_RESTRICTIVE' | 'LEAST_RESTRICTIVE' | 'CUSTOM';
    auditLogRetentionPeriod?: string;
}

export interface RetentionRule {
    ruleId: string;
    type: RetentionPolicyType;
    duration?: string;
    eventTrigger?: FileEventType;
    condition?: string;
    action: 'RETAIN' | 'ARCHIVE' | 'DELETE' | 'PURGE' | 'LEGAL_HOLD';
    targetFileLabels?: FileLabel[];
    complianceStandard?: ComplianceStandard[];
    priority: number;
    isEnabled: boolean;
    justificationRequiredForOverride?: boolean;
}

export interface VideoVisualSummary {
    type: 'MONTAGE' | 'HIGHLIGHT_REEL' | 'KEYFRAMES_GRID' | 'MOTION_TRAILS' | 'OBJECT_FOCUS';
    description: string;
    mediaUrl: string; // URL to the generated visual summary
    generatedTime: string;
    durationSeconds?: number;
    keyframesUsed?: string[]; // List of keyframe image URLs
    aiModelUsed?: AIModelReference;
    confidence?: number;
    targetAudience?: string;
    associatedAudioTrackId?: string; // If summary includes background audio
}