/**
 * This module implements a comprehensive suite of data transformation utilities and a robust DataProcessorEngine,
 * forming a critical component of the Money20/20 "build phase" architecture.
 *
 * Business value: This system is pivotal for enabling agentic AI systems, token rails, and real-time payments
 * infrastructure. It provides foundational capabilities for data governance, quality, and semantic understanding,
 * drastically reducing data integration costs and accelerating time-to-market for new financial products.
 *
 * It allows for the dynamic manipulation, validation, and enrichment of data streams, ensuring
 * data integrity and compliance across diverse financial operations. By automating complex data pipelines,
 * it eliminates manual data wrangling, boosts operational efficiency, and ensures data is consistently
 * prepared for real-time analytics, AI-driven decision-making, and immutable ledger operations.
 *
 * Key benefits include:
 * - **Accelerated Data Preparation:** Real-time data transformation for immediate insights.
 * - **Enhanced Data Quality & Governance:** Built-in validation, anonymization, and PII detection ensure regulatory compliance and data trustworthiness.
 * - **Semantic Interoperability:** Bridges raw data to business-level concepts, fostering seamless communication between human and AI agents.
 * - **Secure Data Handling:** Simulated cryptographic operations and masking policies protect sensitive information.
 * - **Observability & Auditability:** Comprehensive logging and metrics capture ensure transparency and accountability across all data flows.
 * - **Foundation for AI-Driven Automation:** Provides clean, structured data for agentic AI systems to perform anomaly detection, fraud analysis, and intelligent routing.
 *
 * This component is a revenue enabler and a cost reducer, underpinning the agility and security demanded by modern financial services.
 */
import { DataSourceConfig, DataQueryParameters, TileConfiguration } from '../DashboardTile';

export enum DataOperationStatus {
    Pending = 'pending',
    Running = 'running',
    Success = 'success',
    Failed = 'failed',
    Skipped = 'skipped',
    Aborted = 'aborted',
    Paused = 'paused',
    Queued = 'queued',
    Completed = 'completed',
    Error = 'error',
    Warning = 'warning',
    Info = 'info',
}

export enum DataStreamFormat {
    JSON = 'json',
    CSV = 'csv',
    XML = 'xml',
    Parquet = 'parquet',
    Avro = 'avro',
    Protobuf = 'protobuf',
    Feather = 'feather',
    Arrow = 'arrow',
    Text = 'text',
    Binary = 'binary',
    Yaml = 'yaml',
    Excel = 'excel',
    Sql = 'sql',
}

export enum CompressionAlgorithm {
    None = 'none',
    Gzip = 'gzip',
    Snappy = 'snappy',
    Zstd = 'zstd',
    LZ4 = 'lz4',
    Brotli = 'brotli',
    Deflate = 'deflate',
    Bzip2 = 'bzip2',
}

export enum FieldEncryptionMethod {
    AES256 = 'aes256',
    RSA_OAEP = 'rsa_oaep',
    ChaCha20 = 'chacha20',
    None = 'none',
    Hashing = 'hashing',
    Masking = 'masking',
    Tokenization = 'tokenization',
    FormatPreserving = 'format_preserving',
}

export enum AuditLogSeverity {
    Info = 'info',
    Warning = 'warning',
    Error = 'error',
    Critical = 'critical',
    Debug = 'debug',
    Trace = 'trace',
    Notice = 'notice',
}

export enum DataGovernanceDomain {
    Finance = 'finance',
    Healthcare = 'healthcare',
    Customer = 'customer',
    HR = 'hr',
    Operations = 'operations',
    Marketing = 'marketing',
    Logistics = 'logistics',
    Compliance = 'compliance',
    Security = 'security',
    Analytics = 'analytics',
}

export enum HashAlgorithm {
    SHA256 = 'sha256',
    SHA512 = 'sha512',
    MD5 = 'md5',
    BLAKE2b = 'blake2b',
    Argon2 = 'argon2',
}

export enum SignatureAlgorithm {
    RSA_PSS = 'rsa_pss',
    ECDSA = 'ecdsa',
    EdDSA = 'eddsa',
    None = 'none',
}

export enum FeatureEngineeringMethod {
    OneHotEncode = 'one_hot_encode',
    LabelEncode = 'label_encode',
    ScaleFeatures = 'scale_features',
    PolynomialFeatures = 'polynomial_features',
    TextVectorize = 'text_vectorize',
    TimeFeatures = 'time_features',
    Binning = 'binning',
    Imputation = 'imputation',
}

export enum PredictionModelType {
    Classification = 'classification',
    Regression = 'regression',
    Clustering = 'clustering',
    AnomalyDetection = 'anomaly_detection',
    Forecasting = 'forecasting',
    Recommendation = 'recommendation',
}

export enum DataDriftDetectionMethod {
    KSTest = 'ks_test',
    Chi2Test = 'chi2_test',
    EarthMoversDistance = 'earth_movers_distance',
    JensenShannonDivergence = 'jensen_shannon_divergence',
    WassersteinDistance = 'wasserstein_distance',
}

export enum FairnessMetric {
    DemographicParity = 'demographic_parity',
    EqualOpportunity = 'equal_opportunity',
    EqualAccuracy = 'equal_accuracy',
    PredictiveParity = 'predictive_parity',
}

export enum RetentionPolicyType {
    AgeBased = 'age_based',
    EventBased = 'event_based',
    RegulatoryBased = 'regulatory_based',
    Custom = 'custom',
}

export enum MetricType {
    Counter = 'counter',
    Gauge = 'gauge',
    Histogram = 'histogram',
    Summary = 'summary',
}

export enum PadDirection {
    Left = 'left',
    Right = 'right',
    Both = 'both',
}

export type DataTransformOperation =
    | 'filter'
    | 'aggregate'
    | 'join'
    | 'enrich_lookup'
    | 'pivot_table'
    | 'unpivot_table'
    | 'sort_data'
    | 'deduplicate_records'
    | 'map_field_names'
    | 'calculate_new_metric'
    | 'fill_missing_values'
    | 'normalize_data'
    | 'bin_data'
    | 'sample_data_subset'
    | 'custom_transformation_script'
    | 'regex_extract_pattern'
    | 'parse_json_field'
    | 'flatten_nested_array'
    | 'cast_field_type'
    | 'rename_data_column'
    | 'split_text_column'
    | 'merge_multiple_columns'
    | 'remove_outliers_iqr'
    | 'sentiment_analysis_ai'
    | 'entity_extraction_ai'
    | 'nlp_summarization_ai'
    | 'image_feature_extraction_ai'
    | 'time_series_decompose'
    | 'apply_window_function'
    | 'apply_predefined_schema'
    | 'encrypt_sensitive_fields'
    | 'decrypt_sensitive_fields'
    | 'anonymize_data_fields'
    | 'vectorize_text_data'
    | 'cluster_data_points'
    | 'detect_anomalies_ml'
    | 'translate_text_ai'
    | 'generate_synthetic_variations'
    | 'validate_against_profile'
    | 'apply_data_masking_policy'
    | 'apply_data_tokenization'
    | 'transpose_data'
    | 'hash_pii_data'
    | 'mask_pii_data'
    | 'replace_values'
    | 'trim_strings'
    | 'to_upper_case'
    | 'to_lower_case'
    // New operations for build phase architecture
    | 'hash_data'
    | 'sign_data'
    | 'verify_signature'
    | 'enrich_identity'
    | 'validate_credential'
    | 'apply_transaction_rules'
    | 'route_payment'
    | 'monitor_transaction_for_anomaly'
    | 'feature_engineering'
    | 'predict_with_ml_model'
    | 'explain_ai_prediction'
    | 'detect_data_drift'
    | 'assess_model_fairness'
    | 'apply_data_retention'
    | 'emit_observability_metric'
    | 'pad_string_field';

export type AggregationFunction = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'median' | 'stddev' | 'count_distinct' | 'first' | 'last' | 'variance' | 'mode';
export type JoinType = 'inner' | 'left' | 'right' | 'full' | 'cross' | 'semi' | 'anti';
export type DataType = 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'object' | 'array' | 'jsonb' | 'uuid' | 'geopoint' | 'binary' | 'any' | 'timestamp_tz';
export type ValidationSeverity = 'info' | 'warning' | 'error' | 'critical';
export type AnonymizationMethod = 'hash' | 'mask' | 'shuffle' | 'redact' | 'faker' | 'k_anonymity' | 'differential_privacy' | 'pseudonymization';
export type EnrichmentSourceType = 'internal_db' | 'external_api' | 'lookup_table' | 'ai_service' | 'cache' | 'file_system' | 'identity_service' | 'ledger';
export type NormalizationMethod = 'min_max' | 'z_score' | 'decimal_scaling' | 'log_transform' | 'unit_vector';
export type BinningStrategy = 'equal_width' | 'equal_frequency' | 'custom_bins' | 'kmeans_bins';
export type SamplingMethod = 'random' | 'stratified' | 'cluster_sampling' | 'systematic' | 'reservoir';
export type OutlierDetectionMethod = 'iqr' | 'z_score' | 'dbscan' | 'isolation_forest' | 'lof' | 'elliptic_envelope';

export interface BaseTransformationParams {
    outputField?: string;
    targetDataType?: DataType;
    description?: string;
    logLevel?: AuditLogSeverity;
    outputSchemaHint?: Record<string, DataType>;
}

export interface FilterParams extends BaseTransformationParams {
    field: string;
    operator: '>' | '<' | '=' | '>=' | '<=' | '!=' | 'contains' | 'startsWith' | 'endsWith' | 'isNull' | 'isNotNull' | 'in' | 'not_in';
    value?: string | number | boolean | null | Array<string | number | boolean>;
    logicalOperator?: 'AND' | 'OR';
    caseSensitive?: boolean;
}

export interface AggregateParams extends BaseTransformationParams {
    groupBy: string[];
    metrics: Array<{ field: string; func: AggregationFunction; as?: string; filterCondition?: FilterParams }>;
    havingCondition?: FilterParams;
}

export interface JoinParams extends BaseTransformationParams {
    rightSourceId: string;
    leftKey: string;
    rightKey: string;
    joinType: JoinType;
    fieldsToInclude?: string[];
    prefixRightFields?: string;
    suffixRightFields?: string;
}

export interface EnrichmentParams extends BaseTransformationParams {
    keyField: string;
    enrichmentSource: EnrichmentSourceType;
    sourceConfig: DataSourceConfig | { endpoint: string; credentialsRef?: string; params?: Record<string, any>; cacheDurationMinutes?: number };
    sourceKeyField: string;
    fieldsToEnrich: Array<{ sourceField: string; targetField: string; transformation?: DataTransformationStep }>;
    onNoMatch?: 'keep' | 'drop' | 'fill_null' | 'log_only';
}

export interface PivotParams extends BaseTransformationParams {
    indexFields: string[];
    columnField: string;
    valueField: string;
    aggregationFunction: AggregationFunction;
    fillValue?: any;
    columnOrder?: string[];
}

export interface UnpivotParams extends BaseTransformationParams {
    idField: string;
    valueColumns: string[];
    newKeyColumn: string;
    newValueColumn: string;
    dropOriginal?: boolean;
}

export interface SortParams extends BaseTransformationParams {
    field: string;
    direction: 'asc' | 'desc';
    secondarySort?: SortParams;
    nullsPlacement?: 'first' | 'last';
}

export interface DeduplicateParams extends BaseTransformationParams {
    onFields: string[];
    keepPolicy: 'first' | 'last' | 'earliest_timestamp' | 'latest_timestamp' | 'random';
    timestampField?: string;
}

export interface MapFieldsParams extends BaseTransformationParams {
    mapping: Record<string, string>;
    dropOriginal?: boolean;
    allowOverwriting?: boolean;
}

export interface CalculateMetricParams extends BaseTransformationParams {
    newField: string;
    expression: string;
    expressionLanguage?: 'javascript' | 'python' | 'sql';
    variables?: Record<string, any>;
}

export interface FillMissingParams extends BaseTransformationParams {
    field: string;
    strategy: 'constant' | 'mean' | 'median' | 'mode' | 'bfill' | 'ffill' | 'linear_interpolation' | 'predict_ai';
    value?: any;
    groupBy?: string[];
    limit?: number; // For ffill/bfill
}

export interface NormalizeParams extends BaseTransformationParams {
    field: string;
    method: NormalizationMethod;
    minMaxRange?: [number, number];
    skipOnError?: boolean;
}

export interface BinningParams extends BaseTransformationParams {
    field: string;
    newBinField: string;
    strategy: BinningStrategy;
    numberOfBins?: number;
    customBins?: number[];
    binLabels?: string[];
}

export interface SamplingParams extends BaseTransformationParams {
    sampleSize: number;
    method: SamplingMethod;
    stratifyByField?: string;
    seed?: number;
    replace?: boolean; // With replacement
}

export interface CustomScriptParams extends BaseTransformationParams {
    scriptCode: string;
    scriptLanguage: 'javascript' | 'python';
    dependencies?: string[];
    environmentVariables?: Record<string, string>;
}

export interface RegexExtractParams extends BaseTransformationParams {
    field: string;
    pattern: string;
    newField: string;
    extractGroup?: number;
    onNoMatch?: 'empty_string' | 'null' | 'error';
}

export interface ParseJsonParams extends BaseTransformationParams {
    field: string;
    newFieldPrefix?: string;
    errorHandling?: 'skip_record' | 'null_field' | 'fail_pipeline';
    outputSchema?: Record<string, DataType>;
}

export interface FlattenArrayParams extends BaseTransformationParams {
    field: string;
    newElementField: string;
    dropOriginal?: boolean;
    includeIndex?: boolean;
}

export interface CastTypeParams extends BaseTransformationParams {
    field: string;
    targetType: DataType;
    onError?: 'skip_record' | 'null_field' | 'original_value';
    dateFormat?: string;
}

export interface RenameColumnParams extends BaseTransformationParams {
    oldName: string;
    newName: string;
    caseSensitive?: boolean;
}

export interface SplitColumnParams extends BaseTransformationParams {
    field: string;
    delimiter: string;
    newColumns: string[];
    dropOriginal?: boolean;
    limit?: number; // Max number of splits
}

export interface MergeColumnsParams extends BaseTransformationParams {
    fieldsToMerge: string[];
    newColumn: string;
    separator?: string;
    dropOriginal?: boolean;
    defaultValue?: string;
}

export interface RemoveOutliersParams extends BaseTransformationParams {
    field: string;
    method: OutlierDetectionMethod;
    multiplier?: number;
    threshold?: number;
    groupBy?: string[];
}

export interface AISentimentParams extends BaseTransformationParams {
    textField: string;
    newSentimentField?: string;
    newScoreField?: string;
    modelConfig?: Record<string, any>;
    language?: string;
}

export interface AIEntityExtractionParams extends BaseTransformationParams {
    textField: string;
    newEntitiesField?: string;
    entityTypes?: string[];
    modelConfig?: Record<string, any>;
    language?: string;
}

export interface NLPSummarizationParams extends BaseTransformationParams {
    textField: string;
    newSummaryField?: string;
    summaryLength?: 'short' | 'medium' | 'long' | number;
    modelConfig?: Record<string, any>;
    language?: string;
}

export interface ImageFeatureExtractionParams extends BaseTransformationParams {
    imageField: string;
    newFeaturesField?: string;
    featureTypes?: 'embedding' | 'tags' | 'objects' | 'face_detection';
    modelConfig?: Record<string, any>;
}

export interface TimeSeriesDecompositionParams extends BaseTransformationParams {
    timeField: string;
    valueField: string;
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | number;
    newTrendField?: string;
    newSeasonalField?: string;
    newResidualField?: string;
    modelType?: 'additive' | 'multiplicative';
}

export interface WindowFunctionParams extends BaseTransformationParams {
    partitionBy: string[];
    orderBy: { field: string; direction: 'asc' | 'desc' }[];
    newField: string;
    function: 'row_number' | 'rank' | 'dense_rank' | 'lead' | 'lag' | 'moving_average' | 'sum_over_window' | 'first_value' | 'last_value';
    functionParams?: Record<string, any>;
    windowFrame?: 'unbounded_preceding' | 'preceding' | 'following';
}

export interface ApplySchemaTemplateParams extends BaseTransformationParams {
    schemaId: string;
    enforceStrict?: boolean;
    dropMissingFields?: boolean;
    fillDefaultValues?: boolean;
}

export interface EncryptFieldsParams extends BaseTransformationParams {
    fields: string[];
    method: FieldEncryptionMethod;
    keyReference?: string;
    outputFormat?: 'base64' | 'hex';
}

export interface DecryptFieldsParams extends BaseTransformationParams {
    fields: string[];
    method: FieldEncryptionMethod;
    keyReference?: string;
    inputFormat?: 'base64' | 'hex';
}

export interface AnonymizeDataParams extends BaseTransformationParams {
    fields: string[];
    method: AnonymizationMethod;
    config?: Record<string, any>;
    replacementValues?: Record<string, any>;
}

export interface VectorizeTextDataParams extends BaseTransformationParams {
    textField: string;
    newVectorField: string;
    modelId: string;
    outputDimension?: number;
    poolingStrategy?: 'mean' | 'cls' | 'max';
}

export interface ClusterDataPointsParams extends BaseTransformationParams {
    featureFields: string[];
    newClusterIdField: string;
    method: 'kmeans' | 'dbscan' | 'hdbscan' | 'gaussian_mixture';
    k?: number;
    eps?: number;
    minSamples?: number;
}

export interface DetectAnomaliesMLParams extends BaseTransformationParams {
    fields: string[];
    newAnomalyScoreField?: string;
    newAnomalyFlagField?: string;
    modelId: string;
    threshold?: number;
    detectionStrategy?: 'outlier' | 'change_point';
}

export interface TranslateTextAIParams extends BaseTransformationParams {
    textField: string;
    newTranslatedField: string;
    targetLanguage: string;
    sourceLanguage?: string;
    modelId?: string;
    onError?: 'skip_record' | 'original_value' | 'empty_string';
}

export interface GenerateSyntheticVariationsParams extends BaseTransformationParams {
    baseRecordCount: number;
    templateFields: Record<string, any>;
    variationRules: Array<{ field: string; strategy: 'random' | 'range' | 'list' | 'pattern_based'; params: Record<string, any> }>;
    outputCount: number;
    seed?: number;
}

export interface ApplyDataMaskingPolicyParams extends BaseTransformationParams {
    field: string;
    maskingPattern: string; // e.g., 'XXXX-XXXX-XXXX-****' for credit cards, or regex
    maskingCharacter?: string; // default '*'
    preserveLength?: boolean;
}

export interface ApplyDataTokenizationParams extends BaseTransformationParams {
    field: string;
    newTokenField?: string;
    tokenizationServiceId: string; // Reference to a tokenization service
    detokenizationAllowed?: boolean;
    tokenFormat?: string; // e.g., 'UUID', 'ALPHANUMERIC'
}

export interface TransposeDataParams extends BaseTransformationParams {
    idField: string;
    columnsToTranspose: string[];
    newKeyColumn: string;
    newValueColumn: string;
}

export interface HashPiiDataParams extends BaseTransformationParams {
    field: string;
    algorithm: HashAlgorithm; // Using new enum
    salt?: string; // For cryptographic hashing
}

export interface MaskPiiDataParams extends BaseTransformationParams {
    field: string;
    pattern: string; // Regex or fixed string (e.g., 'SSN:***-**-****')
    maskChar?: string; // default '*'
}

export interface ReplaceValuesParams extends BaseTransformationParams {
    field: string;
    oldValue: any;
    newValue: any;
    isRegex?: boolean;
    globalReplace?: boolean;
}

export interface TrimStringsParams extends BaseTransformationParams {
    field: string;
    side?: 'both' | 'left' | 'right';
}

export interface ChangeCaseParams extends BaseTransformationParams {
    field: string;
}

export interface PadStringParams extends BaseTransformationParams {
    field: string;
    length: number;
    character: string;
    direction: PadDirection;
}

// New Interfaces for Build Phase Architecture
export interface HashDataParams extends BaseTransformationParams {
    field: string;
    algorithm: HashAlgorithm;
    salt?: string;
    newField?: string; // If hashing in place, otherwise overwrites
}

export interface SignDataParams extends BaseTransformationParams {
    field: string; // Field containing data to sign (e.g., transaction payload hash)
    privateKeyRef: string; // Reference to private key in keystore
    signatureAlgorithm: SignatureAlgorithm;
    newSignatureField: string;
    signatureFormat?: 'base64' | 'hex';
}

export interface VerifySignatureParams extends BaseTransformationParams {
    field: string; // Field containing original data
    signatureField: string; // Field containing the signature
    publicKeyRef: string; // Reference to public key
    signatureAlgorithm: SignatureAlgorithm;
    newVerificationResultField: string; // boolean field
    signatureFormat?: 'base64' | 'hex';
}

export interface EnrichWithIdentityParams extends BaseTransformationParams {
    identityKeyField: string; // Field like 'userId', 'accountId', 'walletAddress'
    identityServiceEndpoint: string;
    fieldsToFetch: string[]; // e.g., 'kyc_status', 'risk_score', 'linked_accounts'
    onIdentityNotFound?: 'drop' | 'fill_null' | 'log_error';
    cacheDurationMinutes?: number;
}

export interface ValidateCredentialParams extends BaseTransformationParams {
    credentialField: string; // Field containing digital credential (e.g., JWT, verifiable credential)
    validationServiceEndpoint: string;
    newValidationResultField: string; // boolean field
    policyId?: string; // Specific validation policy
}

export interface ApplyTransactionRulesParams extends BaseTransformationParams {
    ruleEngineId: string; // ID of a rule engine configuration
    transactionPayloadField: string; // Field containing transaction data
    newDecisionField: string; // e.g., 'approved', 'flagged', 'rejected'
    newRuleHitsField?: string; // Array of rules that were triggered
    auditLogContext?: Record<string, any>;
}

export interface RoutePaymentParams extends BaseTransformationParams {
    amountField: string;
    currencyField: string;
    recipientField: string;
    senderField: string;
    routingPolicyId: string; // ID of the predictive routing policy
    newRailIdField: string; // Output field for chosen rail (e.g., 'rail_fast', 'rail_batch')
    newRoutingScoreField?: string;
    transactionIdField?: string;
}

export interface MonitorTransactionForAnomalyParams extends BaseTransformationParams {
    transactionFields: string[]; // Fields to use for anomaly detection (e.g., 'amount', 'timestamp', 'sender_location')
    anomalyDetectionModelId: string;
    newAnomalyScoreField: string;
    newAnomalyFlagField: string;
    threshold?: number;
    feedbackLoopEnabled?: boolean;
}

export interface FeatureEngineeringParams extends BaseTransformationParams {
    field: string;
    method: FeatureEngineeringMethod;
    config?: Record<string, any>; // e.g., { categories: [...], n_components: 2 }
    outputPrefix?: string;
    dropOriginal?: boolean;
}

export interface PredictWithModelParams extends BaseTransformationParams {
    modelId: string;
    inputFeatureFields: string[];
    newPredictionField: string;
    modelType: PredictionModelType;
    outputProbabilityField?: string;
    predictionThreshold?: number;
}

export interface ExplainAiPredictionParams extends BaseTransformationParams {
    predictionField: string;
    featureFields: string[];
    explanationModelId: string; // e.g., LIME, SHAP, Explainable AI service
    newExplanationField: string; // e.g., feature importances, reasons
    topNFeatures?: number;
}

export interface DetectDataDriftParams extends BaseTransformationParams {
    referenceDataId: string; // Data profile/schema to compare against
    fieldsToMonitor: string[];
    detectionMethod: DataDriftDetectionMethod;
    newDriftScoreField: string;
    newDriftFlagField: string;
    threshold?: number;
}

export interface AssessModelFairnessParams extends BaseTransformationParams {
    modelId: string;
    protectedAttributeField: string; // e.g., 'gender', 'age_group'
    predictionField: string;
    groundTruthField?: string; // For metrics requiring true labels
    fairnessMetric: FairnessMetric;
    newFairnessReportField: string;
    favorableOutcomeValue?: any;
}

export interface ApplyDataRetentionParams extends BaseTransformationParams {
    retentionPolicyId: string; // Reference to a defined policy
    retentionPolicyType: RetentionPolicyType;
    dateField: string; // Field indicating date for age-based retention
    periodDays?: number; // For age-based retention
    eventField?: string; // For event-based retention
    action: 'delete' | 'archive' | 'anonymize';
    newRetentionStatusField?: string; // e.g., 'retained', 'deleted', 'flagged_for_deletion'
}

export interface EmitObservabilityMetricParams extends BaseTransformationParams {
    metricName: string;
    metricType: MetricType;
    valueField?: string; // Field whose value contributes to the metric
    labelFields?: string[]; // Fields to use as metric labels
    incrementBy?: number; // For counters
    value?: number; // For gauges
    source?: string;
    tags?: Record<string, string>;
}


export type TransformationParameters =
    | FilterParams
    | AggregateParams
    | JoinParams
    | EnrichmentParams
    | PivotParams
    | UnpivotParams
    | SortParams
    | DeduplicateParams
    | MapFieldsParams
    | CalculateMetricParams
    | FillMissingParams
    | NormalizeParams
    | BinningParams
    | SamplingParams
    | CustomScriptParams
    | RegexExtractParams
    | ParseJsonParams
    | FlattenArrayParams
    | CastTypeParams
    | RenameColumnParams
    | SplitColumnParams
    | MergeColumnsParams
    | RemoveOutliersParams
    | AISentimentParams
    | AIEntityExtractionParams
    | NLPSummarizationParams
    | ImageFeatureExtractionParams
    | TimeSeriesDecompositionParams
    | WindowFunctionParams
    | ApplySchemaTemplateParams
    | EncryptFieldsParams
    | DecryptFieldsParams
    | AnonymizeDataParams
    | VectorizeTextDataParams
    | ClusterDataPointsParams
    | DetectAnomaliesMLParams
    | TranslateTextAIParams
    | GenerateSyntheticVariationsParams
    | ApplyDataMaskingPolicyParams
    | ApplyDataTokenizationParams
    | TransposeDataParams
    | HashPiiDataParams
    | MaskPiiDataParams
    | ReplaceValuesParams
    | TrimStringsParams
    | ChangeCaseParams
    | PadStringParams
    // New parameters
    | HashDataParams
    | SignDataParams
    | VerifySignatureParams
    | EnrichWithIdentityParams
    | ValidateCredentialParams
    | ApplyTransactionRulesParams
    | RoutePaymentParams
    | MonitorTransactionForAnomalyParams
    | FeatureEngineeringParams
    | PredictWithModelParams
    | ExplainAiPredictionParams
    | DetectDataDriftParams
    | AssessModelFairnessParams
    | ApplyDataRetentionParams
    | EmitObservabilityMetricParams;


export interface DataTransformationStep {
    id: string;
    operation: DataTransformOperation;
    description?: string;
    parameters: TransformationParameters;
    isEnabled?: boolean;
    order?: number;
    inputSchemaId?: string;
    outputSchemaId?: string;
    auditLevel?: AuditLogSeverity;
    executionTimeoutMs?: number;
    retryCount?: number;
    dependencies?: string[];
    version?: string;
    ownerId?: string;
}

export interface DataTransformationPipeline {
    id: string;
    name: string;
    description?: string;
    steps: DataTransformationStep[];
    version: string;
    createdAt: string;
    lastModifiedAt: string;
    createdBy: string;
    status: 'draft' | 'active' | 'deprecated';
    tags?: string[];
    ownerTeamId?: string;
    dataGovernanceDomain?: DataGovernanceDomain;
    executionHistory?: Array<{ runId: string; timestamp: string; status: DataOperationStatus; triggeredBy: string }>;
}

export interface DataValidationRule {
    id: string;
    name: string;
    description?: string;
    severity: ValidationSeverity;
    field?: string;
    condition: string;
    errorMessage?: string;
    actionOnError?: 'log' | 'filter_out_record' | 'flag_record' | 'transform_to_default' | 'raise_alert';
    defaultTransformValue?: any;
    regexPattern?: string;
    allowedValues?: Array<string | number | boolean>;
    min?: number;
    max?: number;
    maxLength?: number;
    minLength?: number;
    isUnique?: boolean;
    dependencyFields?: string[];
    appliesToSourceId?: string;
    isActive?: boolean;
    ruleType?: 'schema_conformance' | 'business_logic' | 'referential_integrity' | 'data_format' | 'consistency';
    groupName?: string;
}

export interface DataValidationProfile {
    id: string;
    name: string;
    description?: string;
    rules: DataValidationRule[];
    version: string;
    appliesTo?: 'raw_data' | 'transformed_data' | 'final_output';
    activeFrom?: string;
    activeTo?: string;
    createdBy?: string;
    lastModifiedBy?: string;
}

export interface DataValidationReportEntry {
    ruleId: string;
    status: 'passed' | 'failed' | 'ignored';
    severity: ValidationSeverity;
    message: string;
    recordsAffected?: number;
    sampleData?: any[];
    field?: string;
    timestamp: string;
    recordIdsAffected?: string[];
}

export interface TransformationResult<T = any> {
    transformedData: T[];
    pipelineExecutionLog: Array<{ stepId: string; operation: DataTransformOperation; status: DataOperationStatus; message?: string; error?: string; timestamp: string; durationMs?: number }>;
    dataValidationReports: DataValidationReportEntry[];
    originalInputHash?: string;
    outputDataHash?: string;
    executionTimeMs?: number;
}

export type SemanticConceptType = 'dimension' | 'measure' | 'attribute' | 'entity' | 'relation' | 'time' | 'location' | 'event' | 'segment' | 'kpi' | 'property';

export interface SemanticConcept {
    id: string;
    name: string;
    type: SemanticConceptType;
    description?: string;
    dataType?: DataType;
    unit?: string;
    aggregationHint?: AggregationFunction;
    relatedConcepts?: string[];
    sourceMappings?: Array<{ dataSourceId: string; fieldName: string; transformation?: DataTransformationStep; mappingType?: 'direct' | 'computed' }>;
    synonyms?: string[];
    tags?: string[];
    version?: string;
    isKeyMetric?: boolean;
    displayFormat?: string;
    hierarchy?: string[]; // e.g., ['Region', 'Country', 'City']
}

export interface OntologyDefinition {
    id: string;
    name: string;
    version: string;
    concepts: SemanticConcept[];
    relations?: Array<{ fromConceptId: string; toConceptId: string; type: string; description?: string }>;
    glossary?: Record<string, string>;
    lastUpdated?: string;
    createdBy?: string;
    status?: 'active' | 'draft' | 'archived';
}

export interface SemanticMappingResultEntry {
    conceptId: string;
    mappedValue: any;
    sourceField: string;
    transformationApplied?: DataTransformationStep;
    confidence?: number;
    originalValue?: any;
    mappingTimestamp: string;
    semanticType: SemanticConceptType;
    derivedFrom?: string[]; // e.g., sourceField or other concepts
}

export interface NLPQueryIntent {
    intent: string;
    parameters: Record<string, any>;
    confidence: number;
    matchedConcepts?: SemanticConcept[];
    originalQuery: string;
    processedTimestamp: string;
    aiModelUsed?: string;
    queryHash?: string;
    suggestedVisualizations?: string[];
}

export interface DataSchemaField {
    name: string;
    type: DataType;
    isNullable?: boolean;
    description?: string;
    defaultValue?: any;
    constraints?: {
        min?: number; max?: number;
        minLength?: number; maxLength?: number;
        pattern?: string;
        enum?: Array<string | number | boolean>;
        isUnique?: boolean;
        foreignKey?: { schemaId: string; field: string };
    };
    tags?: string[];
    semanticConceptId?: string;
}

export interface DataSchema {
    id: string;
    version: string;
    name: string;
    description?: string;
    fields: DataSchemaField[];
    primaryKey?: string[];
    foreignKeys?: Array<{ field: string; references: { schemaId: string; field: string } }>;
    indexes?: string[][];
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    status?: 'active' | 'deprecated' | 'draft';
}

export interface DataQualityMetricResult {
    metricName: string;
    score: number;
    grade?: 'A' | 'B' | 'C' | 'D' | 'F';
    description?: string;
    details?: Record<string, any>;
    timestamp: string;
    field?: string;
    thresholdConfig?: { warn: number; error: number };
}

export type PIIFieldCategory = 'name' | 'email' | 'address' | 'phone' | 'ssn' | 'financial' | 'health' | 'identifier' | 'other' | 'biometric' | 'location';

export interface PIIFieldDetectionReportEntry {
    fieldName: string;
    isPII: boolean;
    category?: PIIFieldCategory;
    detectionMethod: 'heuristic' | 'regex' | 'ml';
    confidence?: number;
    sampleValues?: string[];
    timestamp: string;
    riskLevel?: 'low' | 'medium' | 'high' | 'critical';
    mitigationSuggestions?: string[];
    governancePolicyId?: string;
}

export interface DataLineageEvent {
    id: string;
    timestamp: string;
    eventType: 'fetch' | 'transform' | 'validate' | 'semantic_map' | 'enrich' | 'audit' | 'pipeline_start' | 'pipeline_end' | 'schema_applied' | 'data_published' | 'metric_emitted' | 'security_event';
    transformationId?: string;
    inputSources: string[];
    outputDestinations: string[];
    recordsAffected?: number;
    description: string;
    parametersUsed?: Record<string, any>;
    userId?: string;
    status: DataOperationStatus;
    dataHashBefore?: string;
    dataHashAfter?: string;
    durationMs?: number;
    affectedFields?: string[];
    pipelineRunId?: string;
}

export class UniversalDataLogger {
    private logs: DataLineageEvent[] = [];
    private serviceId: string;
    private userId: string;

    constructor(serviceId: string, userId: string = 'system_processor') {
        this.serviceId = serviceId;
        this.userId = userId;
    }

    log(event: Partial<DataLineageEvent>) {
        const fullEvent: DataLineageEvent = {
            id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            timestamp: new Date().toISOString(),
            inputSources: event.inputSources || [],
            outputDestinations: event.outputDestinations || [],
            description: event.description || 'No description provided.',
            status: event.status || DataOperationStatus.Info,
            userId: this.userId,
            eventType: event.eventType || 'audit',
            ...event,
        };
        this.logs.push(fullEvent);
        // console.log(`[${this.serviceId} Log] ${fullEvent.description}`); // Keep console log for immediate visibility
    }

    getLogs(): DataLineageEvent[] {
        return [...this.logs];
    }

    async persistLogs(targetEndpoint: string = '/api/data-governance/audit'): Promise<void> {
        // console.log(`[${this.serviceId} Logger] Persisting ${this.logs.length} logs to ${targetEndpoint}...`);
        // Simulate network call
        await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
        // In a real system, this would send logs to a persistent store (e.g., Kafka, S3, database)
        // For demonstration, we just clear them.
        this.logs = [];
        // console.log(`[${this.serviceId} Logger] Logs persisted successfully.`);
    }
}

class TransformationFunctionRegistry {
    private static functions: Map<DataTransformOperation, (data: any[], params: TransformationParameters) => any[] | Promise<any[]>> = new Map();

    static register(
        operation: DataTransformOperation,
        func: (data: any[], params: TransformationParameters) => any[] | Promise<any[]>
    ) {
        TransformationFunctionRegistry.functions.set(operation, func);
    }

    static get(operation: DataTransformOperation): ((data: any[], params: TransformationParameters) => any[] | Promise<any[]>) | undefined {
        return TransformationFunctionRegistry.functions.get(operation);
    }
}

// Utility for basic hashing simulation
const simpleHash = (data: string, algorithm: HashAlgorithm): string => {
    // In a real implementation, use crypto.subtle or a vendored library
    const encoder = new TextEncoder();
    const dataUint8 = encoder.encode(data);
    let hash = 0;
    for (let i = 0; i < dataUint8.length; i++) {
        const char = dataUint8[i];
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    // Simulate different algorithm outputs by varying string length/prefix
    switch (algorithm) {
        case HashAlgorithm.SHA256: return `sha256_${Math.abs(hash).toString(16).padStart(64, '0').substring(0, 64)}`;
        case HashAlgorithm.SHA512: return `sha512_${Math.abs(hash).toString(16).padStart(128, '0').substring(0, 128)}`;
        case HashAlgorithm.MD5: return `md5_${Math.abs(hash).toString(16).padStart(32, '0').substring(0, 32)}`;
        default: return `hash_${Math.abs(hash).toString(16).substring(0, 16)}`;
    }
};

// Utility for basic encryption/decryption simulation
const simulateCrypto = {
    encrypt: (data: string, method: FieldEncryptionMethod, keyRef: string, format: 'base64' | 'hex'): string => {
        const encrypted = btoa(data.split('').reverse().join('') + `_KEY:${keyRef}_M:${method}`);
        return format === 'hex' ? Array.from(encrypted).map(c => c.charCodeAt(0).toString(16)).join('') : encrypted;
    },
    decrypt: (encryptedData: string, method: FieldEncryptionMethod, keyRef: string, format: 'base64' | 'hex'): string => {
        try {
            const rawData = format === 'hex' ? String.fromCharCode(...encryptedData.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))) : encryptedData;
            const decryptedPart = atob(rawData).split(`_KEY:${keyRef}_M:${method}`)[0];
            return decryptedPart.split('').reverse().join('');
        } catch (e) {
            console.warn("Simulated decryption failed:", e);
            return '[DECRYPTION_FAILED]';
        }
    },
    sign: (data: string, privateKeyRef: string, algo: SignatureAlgorithm): string => {
        // Simple mock signature
        const hash = simpleHash(data, HashAlgorithm.SHA256);
        return `SIG_${algo}_${hash}_${privateKeyRef.slice(0, 5)}_${Math.random().toString(36).substring(2, 8)}`;
    },
    verify: (data: string, signature: string, publicKeyRef: string, algo: SignatureAlgorithm): boolean => {
        // Simple mock verification: checks if signature format is valid and matches public key ref
        // In a real scenario, this would involve complex crypto operations
        const expectedPrefix = `SIG_${algo}_${simpleHash(data, HashAlgorithm.SHA256)}_${publicKeyRef.slice(0, 5)}`;
        return signature.startsWith(expectedPrefix);
    }
};

async function simulateDataFetch(dataSource: DataSourceConfig, abortSignal?: AbortSignal): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
    if (abortSignal?.aborted) throw new Error('Data fetch aborted.');
    const mockDataGenerators = {
        'API': () => Array.from({ length: Math.floor(Math.random() * 50) + 50 }, (_, i) => ({
            recId: `api_${i}`, timestamp: new Date(Date.now() - i * 3600 * 1000).toISOString(),
            value: parseFloat((Math.random() * 1000).toFixed(2)), category: `Cat${Math.floor(Math.random() * 5) + 1}`,
            status: Math.random() > 0.7 ? 'active' : 'inactive', region: ['N', 'S', 'E', 'W'][Math.floor(Math.random() * 4)],
            source: dataSource.id, email: `user${i}@example.com`, phone: `+1-${Math.floor(Math.random() * 10000000000)}`,
            userId: `user${i}`
        })),
        'Database': () => Array.from({ length: Math.floor(Math.random() * 80) + 100 }, (_, i) => ({
            dbRecId: `db_${i}`, recordDate: new Date(Date.now() - i * 86400 * 1000).toISOString().split('T')[0],
            amount: parseFloat((Math.random() * 5000).toFixed(2)), currency: Math.random() > 0.6 ? 'USD' : 'EUR',
            department: ['Sales', 'Marketing', 'IT', 'HR'][Math.floor(Math.random() * 4)], isApproved: Math.random() > 0.5,
            notes: `Entry ${i}`, customerAddress: `${i} Oak Ave, Anytown`,
            accountId: `ACC${1000 + i}`
        })),
        'RealtimeStream': () => Array.from({ length: 10 }, (_, i) => ({
            streamEvtId: `stream_${i}_${Date.now()}`, eventTime: new Date().toISOString(),
            metricA: parseFloat((Math.random() * 200).toFixed(2)), metricB: parseFloat((Math.random() * 150).toFixed(2)),
            eventType: Math.random() > 0.8 ? 'alert' : 'info', origin: `server_${Math.floor(Math.random() * 3) + 1}`,
        })),
        'AI_Generated': () => Array.from({ length: Math.floor(Math.random() * 20) + 10 }, (_, i) => ({
            aiGenId: `ai_out_${i}`, predictionValue: parseFloat((Math.random() * 100).toFixed(2)),
            confidence: parseFloat((Math.random() * 0.2 + 0.7).toFixed(2)), modelUsed: dataSource.id,
            generatedText: `AI insight for data point ${i}. Trend is ${Math.random() > 0.5 ? 'up' : 'down'}.`,
        })),
        'default': () => []
    };
    const generator = mockDataGenerators[dataSource.type] || mockDataGenerators['default'];
    return generator();
}

const applyFilter = (data: any[], params: FilterParams): any[] => {
    return data.filter(row => {
        const { field, operator, value, caseSensitive = true } = params;
        const fieldValue = row[field];
        if (value === undefined || fieldValue === undefined || fieldValue === null) {
            // Special handling for isNull/isNotNull when value is irrelevant
            if (operator === 'isNull') return fieldValue === null || fieldValue === undefined;
            if (operator === 'isNotNull') return fieldValue !== null && fieldValue !== undefined;
            return false;
        }

        let fv = fieldValue;
        let val = value;

        if (!caseSensitive && typeof fv === 'string' && typeof val === 'string') {
            fv = fv.toLowerCase();
            val = val.toLowerCase();
        }

        switch (operator) {
            case '>': return fv > val;
            case '<': return fv < val;
            case '=': return fv == val;
            case '>=': return fv >= val;
            case '<=': return fv <= val;
            case '!=': return fv != val;
            case 'contains': return typeof fv === 'string' && fv.includes(String(val));
            case 'startsWith': return typeof fv === 'string' && fv.startsWith(String(val));
            case 'endsWith': return typeof fv === 'string' && fv.endsWith(String(val));
            case 'isNull': return fv === null || fv === undefined;
            case 'isNotNull': return fv !== null && fv !== undefined;
            case 'in': return Array.isArray(val) && val.includes(fv);
            case 'not_in': return Array.isArray(val) && !val.includes(fv);
            default: return true;
        }
    });
};
TransformationFunctionRegistry.register('filter', applyFilter);

const applyAggregate = (data: any[], params: AggregateParams): any[] => {
    const { groupBy, metrics } = params; if (!metrics || metrics.length === 0) return data;
    const grouped: Record<string, any[]> = {};
    data.forEach(row => {
        const key = groupBy.map(f => row[f]).join('_');
        if (!grouped[key]) grouped[key] = []; grouped[key].push(row);
    });
    const aggregatedResult: any[] = [];
    for (const key in grouped) {
        const group = grouped[key];
        const newRow: Record<string, any> = groupBy.reduce((acc, f) => ({ ...acc, [f]: group[0][f] }), {});
        metrics.forEach(metric => {
            let filteredGroup = group;
            if (metric.filterCondition) {
                filteredGroup = applyFilter(group, metric.filterCondition as FilterParams);
            }
            const values = filteredGroup.map(row => row[metric.field]).filter(v => typeof v === 'number');
            let aggregatedValue: number | undefined;
            switch (metric.func) {
                case 'sum': aggregatedValue = values.reduce((acc, v) => acc + v, 0); break;
                case 'avg': aggregatedValue = values.length > 0 ? values.reduce((acc, v) => acc + v, 0) / values.length : undefined; break;
                case 'min': aggregatedValue = values.length > 0 ? Math.min(...values) : undefined; break;
                case 'max': aggregatedValue = values.length > 0 ? Math.max(...values) : undefined; break;
                case 'count': aggregatedValue = filteredGroup.length; break; // Count records, not just numeric values
                case 'count_distinct': aggregatedValue = new Set(filteredGroup.map(row => row[metric.field])).size; break;
                case 'median': if (values.length === 0) { aggregatedValue = undefined; break; } const sortedValues = [...values].sort((a, b) => a - b); const mid = Math.floor(sortedValues.length / 2); aggregatedValue = sortedValues.length % 2 === 0 ? (sortedValues[mid - 1] + sortedValues[mid]) / 2 : sortedValues[mid]; break;
                case 'stddev': if (values.length < 2) { aggregatedValue = 0; break; } const mean = values.reduce((acc, v) => acc + v, 0) / values.length; const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (values.length - 1); aggregatedValue = Math.sqrt(variance); break;
                case 'first': aggregatedValue = filteredGroup.length > 0 ? filteredGroup[0][metric.field] : undefined; break;
                case 'last': aggregatedValue = filteredGroup.length > 0 ? filteredGroup[filteredGroup.length - 1][metric.field] : undefined; break;
                case 'variance': if (values.length < 2) { aggregatedValue = 0; break; } const meanVar = values.reduce((acc, v) => acc + v, 0) / values.length; aggregatedValue = values.reduce((acc, v) => acc + Math.pow(v - meanVar, 2), 0) / (values.length - 1); break;
                case 'mode': if (values.length === 0) { aggregatedValue = undefined; break; } const counts: Record<any, number> = {}; values.forEach(v => { counts[v] = (counts[v] || 0) + 1; }); aggregatedValue = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b); break;
                default: aggregatedValue = undefined;
            }
            newRow[metric.as || metric.field] = aggregatedValue;
        });
        aggregatedResult.push(newRow);
    }
    // Apply having condition if present
    if (params.havingCondition) {
        return applyFilter(aggregatedResult, params.havingCondition as FilterParams);
    }
    return aggregatedResult;
};
TransformationFunctionRegistry.register('aggregate', applyAggregate);

const applyMapFields = (data: any[], params: MapFieldsParams): any[] => {
    const { mapping, dropOriginal, allowOverwriting } = params; if (!mapping) return data;
    return data.map(row => {
        const newRow: Record<string, any> = {};
        for (const key in row) {
            if (mapping[key]) {
                if (newRow[mapping[key]] !== undefined && !allowOverwriting) {
                    console.warn(`Field ${mapping[key]} already exists and overwriting is not allowed. Skipping.`);
                    newRow[key] = row[key]; // Keep original if not overwritten
                } else {
                    newRow[mapping[key]] = row[key];
                }
            } else if (!dropOriginal) {
                newRow[key] = row[key];
            }
        }
        return newRow;
    });
};
TransformationFunctionRegistry.register('map_field_names', applyMapFields);

const applyCalculateMetric = (data: any[], params: CalculateMetricParams): any[] => {
    const { newField, expression, expressionLanguage = 'javascript', variables } = params;
    if (!newField || !expression) return data;

    if (expressionLanguage === 'javascript') {
        return data.map(row => {
            try {
                // Prepare context for the expression
                const context = { ...row, ...variables };
                // Use Function constructor for dynamic expression evaluation (careful with security in real apps)
                const fn = new Function('context', `with(context){ return ${expression}; }`);
                return { ...row, [newField]: fn(context) };
            } catch (e) {
                console.error(`Error evaluating expression for row: ${JSON.stringify(row)}`, e);
                return { ...row, [newField]: null };
            }
        });
    } else {
        // Placeholder for other languages, for a real system, this would invoke a runtime
        console.warn(`Unsupported expression language: ${expressionLanguage}. Skipping calculate_new_metric.`);
        return data.map(row => ({ ...row, [newField]: null }));
    }
};
TransformationFunctionRegistry.register('calculate_new_metric', applyCalculateMetric);

const applyDeduplicateRecords = (data: any[], params: DeduplicateParams): any[] => {
    const { onFields, keepPolicy = 'first', timestampField } = params; if (!onFields || onFields.length === 0) return data;
    const seenMap = new Map<string, any>();
    data.forEach(row => {
        const key = onFields.map(field => row[field]).join('|');
        if (!seenMap.has(key)) { seenMap.set(key, row); }
        else {
            const existingRow = seenMap.get(key);
            if (keepPolicy === 'latest_timestamp' && timestampField && existingRow[timestampField] && row[timestampField]) {
                if (new Date(row[timestampField]) > new Date(existingRow[timestampField])) {
                    seenMap.set(key, row);
                }
            } else if (keepPolicy === 'earliest_timestamp' && timestampField && existingRow[timestampField] && row[timestampField]) {
                if (new Date(row[timestampField]) < new Date(existingRow[timestampField])) {
                    seenMap.set(key, row);
                }
            } else if (keepPolicy === 'random') {
                if (Math.random() > 0.5) { seenMap.set(key, row); }
            }
        }
    });
    return Array.from(seenMap.values());
};
TransformationFunctionRegistry.register('deduplicate_records', applyDeduplicateRecords);

const applyAnonymizeData = (data: any[], params: AnonymizeDataParams): any[] => {
    const { fields, method = 'redact', config = {}, replacementValues = {} } = params; if (!fields || fields.length === 0) return data;
    return data.map(row => {
        const newRow = { ...row };
        fields.forEach(field => {
            const value = newRow[field];
            if (value !== undefined && value !== null) {
                const replacement = replacementValues[field];
                if (replacement !== undefined) {
                    newRow[field] = replacement;
                    return;
                }
                switch (method) {
                    case 'hash': newRow[field] = `HASH_${simpleHash(String(value), HashAlgorithm.SHA256)}`; break;
                    case 'mask': newRow[field] = typeof value === 'string' ? value.replace(/./g, '*') : '*****'; break;
                    case 'redact': newRow[field] = '[REDACTED]'; break;
                    case 'shuffle': newRow[field] = Math.random().toString(36).substring(2, 10); break; // Simple simulation of shuffling
                    case 'faker': newRow[field] = `Faker_${field}_${Math.floor(Math.random() * 1000)}`; break; // Simulates generating fake data
                    case 'k_anonymity':
                        // In a real system, this would group records and replace values within groups.
                        // For simulation, we assign a group ID.
                        const kAnonGroupSize = config.kAnonGroupSize || 5;
                        newRow[field] = `K_ANON_GROUP_${Math.floor(Math.random() * kAnonGroupSize)}`;
                        break;
                    case 'differential_privacy':
                        // Simulate adding noise (e.g., Laplace mechanism)
                        if (typeof value === 'number') {
                            const epsilon = config.epsilon || 0.1; // Privacy budget
                            const noise = (Math.random() - 0.5) * (1 / epsilon); // Very simplified noise
                            newRow[field] = parseFloat((value + noise).toFixed(2));
                        } else {
                            newRow[field] = '[DIFFERENTIAL_PRIVACY_APPLIED]';
                        }
                        break;
                    case 'pseudonymization': newRow[field] = `PSEUDO_${simpleHash(String(value), HashAlgorithm.SHA256).substring(0, 12)}`; break;
                    default: newRow[field] = '[ANONYMIZED]';
                }
            }
        });
        return newRow;
    });
};
TransformationFunctionRegistry.register('anonymize_data_fields', applyAnonymizeData);

const applyCastFieldType = (data: any[], params: CastTypeParams): any[] => {
    const { field, targetType, onError = 'null_field' } = params; if (!field || !targetType) return data;
    return data.map(row => {
        const value = row[field]; let castValue = value;
        try {
            if (value === null || value === undefined) {
                // If value is null/undefined, and target type doesn't allow it, we might handle it
                // For now, let it be null, other validation rules can catch non-nullable
                return { ...row, [field]: value };
            }
            switch (targetType) {
                case 'string': castValue = String(value); break;
                case 'number': castValue = Number(value); if (isNaN(castValue)) throw new Error('Cannot cast to number'); break;
                case 'boolean':
                    if (typeof value === 'string') castValue = value.toLowerCase() === 'true' || value === '1';
                    else if (typeof value === 'number') castValue = value === 1;
                    else if (typeof value === 'boolean') castValue = value;
                    else throw new Error('Cannot cast to boolean');
                    break;
                case 'date':
                case 'datetime':
                case 'timestamp_tz':
                    castValue = new Date(value);
                    if (isNaN(castValue.getTime())) throw new Error('Cannot cast to date/datetime');
                    if (targetType === 'date') castValue = castValue.toISOString().split('T')[0]; // Return YYYY-MM-DD
                    break;
                case 'object':
                    if (typeof value === 'string') castValue = JSON.parse(value);
                    else if (typeof value !== 'object' || Array.isArray(value)) throw new Error('Cannot cast to object');
                    break;
                case 'array':
                    if (typeof value === 'string') castValue = JSON.parse(value); // Try parsing JSON string to array
                    else if (!Array.isArray(value)) castValue = [value];
                    break;
                case 'jsonb':
                    try { castValue = JSON.parse(value); } catch { throw new Error('Cannot parse to JSONB'); }
                    break;
                case 'uuid':
                    if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(String(value))) {
                        throw new Error('Invalid UUID format');
                    }
                    castValue = String(value);
                    break;
                case 'geopoint':
                    // Assume input is string "lat,lon" or object {lat, lon}
                    if (typeof value === 'string') {
                        const parts = value.split(',').map(Number);
                        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                            castValue = { lat: parts[0], lon: parts[1] };
                        } else { throw new Error('Invalid geopoint string format'); }
                    } else if (typeof value === 'object' && value.lat !== undefined && value.lon !== undefined) {
                        castValue = value;
                    } else { throw new Error('Cannot cast to geopoint'); }
                    break;
                case 'binary':
                    // Simulate base64 encoding/decoding for binary representation
                    castValue = btoa(String(value));
                    break;
                case 'any':
                default:
                    castValue = value; // No transformation, just validate it's 'any' type.
            }
        } catch (e) {
            if (onError === 'null_field') castValue = null;
            else if (onError === 'original_value') castValue = value;
            else if (onError === 'skip_record') return undefined; // Filter out this record
            else { console.error(`Error casting field '${field}' to '${targetType}': ${e.message}`, row); throw e; } // Re-throw if fail_pipeline is desired
        }
        return { ...row, [field]: castValue };
    }).filter(row => row !== undefined);
};
TransformationFunctionRegistry.register('cast_field_type', applyCastFieldType);

const applyRenameColumn = (data: any[], params: RenameColumnParams): any[] => {
    const { oldName, newName, caseSensitive = true } = params; if (!oldName || !newName) return data;
    return data.map(row => {
        const newRow: Record<string, any> = { ...row };
        const foundKey = Object.keys(newRow).find(key => caseSensitive ? key === oldName : key.toLowerCase() === oldName.toLowerCase());
        if (foundKey && newRow[foundKey] !== undefined) {
            newRow[newName] = newRow[foundKey];
            if (foundKey !== newName) { // Avoid deleting if newName is same as foundKey (case-insensitive rename)
                delete newRow[foundKey];
            }
        }
        return newRow;
    });
};
TransformationFunctionRegistry.register('rename_data_column', applyRenameColumn);

const applySortData = (data: any[], params: SortParams): any[] => {
    const { field, direction = 'asc', secondarySort, nullsPlacement = 'last' } = params;
    if (!field) return data;

    const compare = (a: any, b: any, sortField: string, sortDirection: 'asc' | 'desc'): number => {
        const valA = a[sortField];
        const valB = b[sortField];

        // Handle nulls according to placement policy
        const isANull = valA === null || valA === undefined;
        const isBNull = valB === null || valB === undefined;

        if (isANull && isBNull) return 0;
        if (isANull) return nullsPlacement === 'first' ? -1 : 1;
        if (isBNull) return nullsPlacement === 'first' ? 1 : -1;

        if (typeof valA === 'string' && typeof valB === 'string') {
            return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
            return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        if (typeof valA === 'boolean' && typeof valB === 'boolean') {
            return sortDirection === 'asc' ? (valA === valB ? 0 : (valA ? 1 : -1)) : (valA === valB ? 0 : (valA ? -1 : 1));
        }
        if ((valA instanceof Date || typeof valA === 'string') && (valB instanceof Date || typeof valB === 'string')) {
            const dateA = new Date(valA);
            const dateB = new Date(valB);
            if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) { /* fallback, treat as strings or undefined */ }
            return sortDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        }
        return 0; // Cannot compare, maintain original order
    };

    const sortedData = [...data].sort((a, b) => {
        const primaryResult = compare(a, b, field, direction);
        if (primaryResult === 0 && secondarySort) {
            return compare(a, b, secondarySort.field, secondarySort.direction);
        }
        return primaryResult;
    });

    return sortedData;
};
TransformationFunctionRegistry.register('sort_data', applySortData);

const applyFillMissingValues = (data: any[], params: FillMissingParams): any[] => {
    const { field, strategy, value, groupBy, limit } = params; if (!field || !strategy) return data;

    if (groupBy && groupBy.length > 0) {
        // Group data and apply fill strategy within each group
        const grouped: Record<string, any[]> = {};
        data.forEach(row => {
            const key = groupBy.map(f => row[f]).join('_');
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(row);
        });

        const filledData: any[] = [];
        for (const key in grouped) {
            const group = grouped[key];
            filledData.push(...applyFillMissingValues(group, { field, strategy, value, limit })); // Recursively call without groupBy
        }
        return filledData;
    }

    const values = data.map(row => row[field]).filter(v => v !== null && v !== undefined);
    let fillValue: any = null;

    switch (strategy) {
        case 'constant': fillValue = value; break;
        case 'mean':
            if (values.every(v => typeof v === 'number') && values.length > 0) {
                fillValue = values.reduce((sum, v) => sum + v, 0) / values.length;
            }
            break;
        case 'median':
            if (values.every(v => typeof v === 'number') && values.length > 0) {
                const sorted = [...values].sort((a, b) => a - b);
                const mid = Math.floor(sorted.length / 2);
                fillValue = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
            }
            break;
        case 'mode':
            if (values.length > 0) {
                const counts: Record<any, number> = {};
                values.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
                fillValue = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
            }
            break;
        case 'bfill': // Backward fill
            for (let i = data.length - 2; i >= 0; i--) {
                if ((data[i][field] === null || data[i][field] === undefined)) {
                    let fillCandidate = null;
                    let filledCount = 0;
                    for (let j = i + 1; j < data.length; j++) {
                        if (data[j][field] !== null && data[j][field] !== undefined) {
                            fillCandidate = data[j][field];
                            break;
                        }
                        if (limit && ++filledCount >= limit) break;
                    }
                    if (fillCandidate !== null) data[i][field] = fillCandidate;
                }
            }
            return data; // Return modified array directly for bfill/ffill
        case 'ffill': // Forward fill
            for (let i = 1; i < data.length; i++) {
                if ((data[i][field] === null || data[i][field] === undefined)) {
                    let fillCandidate = null;
                    let filledCount = 0;
                    for (let j = i - 1; j >= 0; j--) {
                        if (data[j][field] !== null && data[j][field] !== undefined) {
                            fillCandidate = data[j][field];
                            break;
                        }
                        if (limit && ++filledCount >= limit) break;
                    }
                    if (fillCandidate !== null) data[i][field] = fillCandidate;
                }
            }
            return data; // Return modified array directly for bfill/ffill
        case 'linear_interpolation':
            // Simple linear interpolation simulation for numbers
            const indicesWithValues: { index: number; value: number }[] = [];
            data.forEach((row, idx) => {
                if (typeof row[field] === 'number' && row[field] !== null && row[field] !== undefined) {
                    indicesWithValues.push({ index: idx, value: row[field] });
                }
            });

            if (indicesWithValues.length < 2) {
                // Not enough points to interpolate, fall back to mean or constant
                const mean = values.every(v => typeof v === 'number') && values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : (value || 0);
                return data.map(row => ({ ...row, [field]: (row[field] === null || row[field] === undefined) ? mean : row[field] }));
            }

            const interpolatedData = [...data];
            for (let i = 0; i < interpolatedData.length; i++) {
                if (interpolatedData[i][field] === null || interpolatedData[i][field] === undefined) {
                    // Find nearest known values
                    let lower = indicesWithValues.findLast(point => point.index < i);
                    let upper = indicesWithValues.find(point => point.index > i);

                    if (lower && upper) {
                        const ratio = (i - lower.index) / (upper.index - lower.index);
                        interpolatedData[i][field] = lower.value + ratio * (upper.value - lower.value);
                    } else if (lower) {
                        interpolatedData[i][field] = lower.value; // Extrapolate using last known value
                    } else if (upper) {
                        interpolatedData[i][field] = upper.value; // Extrapolate using first known value
                    } else {
                        interpolatedData[i][field] = fillValue; // Fallback
                    }
                }
            }
            return interpolatedData;
        case 'predict_ai':
            // Simulate AI prediction for missing values
            return data.map(row => ({ ...row, [field]: (row[field] === null || row[field] === undefined) ? parseFloat((Math.random() * 100).toFixed(2)) : row[field] }));
    }
    // For constant, mean, median, mode, apply to all missing values
    return data.map(row => ({ ...row, [field]: (row[field] === null || row[field] === undefined) ? fillValue : row[field] }));
};
TransformationFunctionRegistry.register('fill_missing_values', applyFillMissingValues);

async function applySentimentAnalysisAI(data: any[], params: AISentimentParams): Promise<any[]> {
    const { textField, newSentimentField = 'sentiment', newScoreField = 'sentimentScore', language = 'en' } = params;
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200)); // Simulate AI call latency
    return data.map(row => {
        const text = row[textField]; if (typeof text === 'string') {
            const score = Math.random();
            let sentiment: string;
            if (score > 0.7) sentiment = 'positive';
            else if (score < 0.3) sentiment = 'negative';
            else sentiment = 'neutral';
            return { ...row, [newSentimentField]: sentiment, [newScoreField]: parseFloat(score.toFixed(2)) };
        } return row;
    });
}
TransformationFunctionRegistry.register('sentiment_analysis_ai', applySentimentAnalysisAI);

const evaluateValidationCondition = (record: Record<string, any>, rule: DataValidationRule): boolean => {
    const field = rule.field;
    const value = field ? record[field] : undefined;

    // Rule: field exists (e.g., condition: 'field_name exists')
    if (rule.condition.includes('exists')) {
        const targetField = rule.condition.split(' ')[0];
        return record[targetField] !== undefined && record[targetField] !== null;
    }

    // Rule: regex pattern match
    if (rule.regexPattern && typeof value === 'string') {
        return new RegExp(rule.regexPattern).test(value);
    }

    // Rule: value in allowed list
    if (rule.allowedValues && value !== undefined) {
        return rule.allowedValues.includes(value);
    }

    // Rule: min/max for numbers
    if (field && typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) return false;
        if (rule.max !== undefined && value > rule.max) return false;
    }

    // Rule: min/max length for strings
    if (field && typeof value === 'string') {
        if (rule.minLength !== undefined && value.length < rule.minLength) return false;
        if (rule.maxLength !== undefined && value.length > rule.maxLength) return false;
    }

    // Rule: isUnique (requires global check, handled at profile level)
    // For single record check, it always passes, unless we're checking against a pre-computed set
    // For now, assume it means "this value is unique so far" which is implicitly true here.

    // Rule: direct comparison (e.g., 'amount > 0', 'status = active')
    const parts = rule.condition.split(' ');
    if (parts.length >= 3) {
        const targetField = parts[0];
        const operator = parts[1];
        let targetValue: any = parts.slice(2).join(' '); // Handle multi-word values

        if (targetField !== field && record[targetField] === undefined) {
             // If condition refers to a field not present in current record,
             // and it's not a 'exists' rule, then it can't be evaluated.
             return false;
        }

        const recordValue = record[targetField];

        // Attempt to parse targetValue to number or boolean if applicable
        if (!isNaN(Number(targetValue)) && !isNaN(Number(recordValue))) {
            targetValue = Number(targetValue);
        } else if (targetValue.toLowerCase() === 'true' || targetValue.toLowerCase() === 'false') {
            targetValue = targetValue.toLowerCase() === 'true';
        }

        switch (operator) {
            case '>': return recordValue > targetValue;
            case '<': return recordValue < targetValue;
            case '=': return recordValue == targetValue; // Use loose equality for type coercion
            case '>=': return recordValue >= targetValue;
            case '<=': return recordValue <= targetValue;
            case '!=': return recordValue != targetValue;
            case 'contains': return typeof recordValue === 'string' && typeof targetValue === 'string' && recordValue.includes(targetValue);
            case 'startsWith': return typeof recordValue === 'string' && typeof targetValue === 'string' && recordValue.startsWith(targetValue);
            case 'endsWith': return typeof recordValue === 'string' && typeof targetValue === 'string' && recordValue.endsWith(targetValue);
            case 'in': return Array.isArray(targetValue) && targetValue.includes(recordValue);
            case 'not_in': return Array.isArray(targetValue) && !targetValue.includes(recordValue);
            case 'is_null': return recordValue === null || recordValue === undefined;
            case 'is_not_null': return recordValue !== null && recordValue !== undefined;
            default: return false;
        }
    }
    return false; // If condition format is unrecognized
};

export function validateDataAgainstProfile(data: any[], validationProfile: DataValidationProfile): DataValidationReportEntry[] {
    const reports: DataValidationReportEntry[] = [];
    const uniqueValueChecks: Record<string, Set<any>> = {};

    validationProfile.rules.forEach(rule => {
        if (!rule.isActive) { reports.push({ ruleId: rule.id, status: 'ignored', severity: 'info', message: `Rule '${rule.name}' is disabled.`, timestamp: new Date().toISOString() }); return; }

        let ruleFailed = false;
        const failedRecords: any[] = [];
        const recordsAffectedIds: string[] = [];

        // Handle unique constraint separately as it requires iterating over all data once
        if (rule.isUnique && rule.field) {
            if (!uniqueValueChecks[rule.field]) {
                uniqueValueChecks[rule.field] = new Set();
                const duplicates: any[] = [];
                data.forEach((record, index) => {
                    const value = record[rule.field!];
                    if (value !== null && value !== undefined) {
                        if (uniqueValueChecks[rule.field!].has(value)) {
                            duplicates.push({ recordIndex: index, value: value });
                            ruleFailed = true;
                        } else {
                            uniqueValueChecks[rule.field!].add(value);
                        }
                    }
                });
                if (ruleFailed) {
                    reports.push({
                        ruleId: rule.id, status: 'failed', severity: rule.severity,
                        message: rule.errorMessage || `Rule '${rule.name}' (unique) failed: ${duplicates.length} duplicate values for field '${rule.field}'.`,
                        recordsAffected: duplicates.length, sampleData: duplicates.slice(0, 5), field: rule.field, timestamp: new Date().toISOString()
                    });
                } else {
                    reports.push({ ruleId: rule.id, status: 'passed', severity: 'info', message: `Rule '${rule.name}' (unique) passed.`, timestamp: new Date().toISOString() });
                }
            }
            return; // Skip per-record iteration for unique rule if already processed
        }

        data.forEach((record, index) => {
            if (!evaluateValidationCondition(record, rule)) {
                failedRecords.push(record);
                if (record.id) recordsAffectedIds.push(record.id);
                ruleFailed = true;
            }
        });

        if (ruleFailed) {
            reports.push({
                ruleId: rule.id, status: 'failed', severity: rule.severity,
                message: rule.errorMessage || `Rule '${rule.name}' failed for ${failedRecords.length} records.`,
                recordsAffected: failedRecords.length, sampleData: failedRecords.slice(0, 5), field: rule.field, timestamp: new Date().toISOString(),
                recordIdsAffected: recordsAffectedIds.length > 0 ? recordsAffectedIds : undefined,
            });
        } else {
            reports.push({ ruleId: rule.id, status: 'passed', severity: 'info', message: `Rule '${rule.name}' passed.`, timestamp: new Date().toISOString() });
        }
    });
    return reports;
}

export function applySemanticMapping(
    data: any[], ontology: OntologyDefinition, semanticLayerConfig?: TileConfiguration['semanticLayerConfig']
): Array<Record<string, SemanticMappingResultEntry | any>> {
    if (!semanticLayerConfig?.mappingRules) return data;
    const mappedData: Array<Record<string, SemanticMappingResultEntry | any>> = [];
    data.forEach(record => {
        const newRecord: Record<string, SemanticMappingResultEntry | any> = {};
        for (const mappedConceptKey in semanticLayerConfig.mappingRules) {
            const sourceField = semanticLayerConfig.mappingRules[mappedConceptKey];
            const concept = ontology.concepts.find(c => c.id === mappedConceptKey);
            const rawValue = record[sourceField];
            if (concept) {
                newRecord[mappedConceptKey] = {
                    conceptId: concept.id, mappedValue: rawValue, sourceField: sourceField,
                    confidence: 1.0, originalValue: rawValue, mappingTimestamp: new Date().toISOString(), semanticType: concept.type
                };
            } else { newRecord[mappedConceptKey] = rawValue; } // If concept not found, just copy raw value
        }
        mappedData.push(newRecord);
    });
    return mappedData;
}

export async function enrichWithSemanticContext(
    data: any[], ontology: OntologyDefinition, semanticLayerConfig?: TileConfiguration['semanticLayerConfig']
): Promise<any[]> {
    if (!semanticLayerConfig?.ontologyId) return data;
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
    return data.map(record => {
        const enrichedRecord = { ...record };
        ontology.concepts.forEach(concept => {
            const mappedField = Object.keys(record).find(key => concept.sourceMappings?.some(sm => sm.fieldName === key));
            if (mappedField) {
                enrichedRecord[`semantic_context_${concept.id}`] = {
                    conceptName: concept.name, conceptType: concept.type, description: concept.description,
                    relatedConcepts: concept.relatedConcepts, glossaryTerm: ontology.glossary?.[concept.name.toLowerCase()]
                };
            }
        });
        // Simulate AI-driven semantic tagging based on content analysis
        if (Math.random() > 0.6) {
            enrichedRecord['ai_semantic_tags'] = ['Trend Analysis', 'Key Driver', 'Forecasting', 'Risk Indicator'];
        }
        return enrichedRecord;
    });
}

export async function naturalLanguageQueryProcessor(
    query: string, ontology: OntologyDefinition, semanticLayerConfig?: TileConfiguration['semanticLayerConfig']
): Promise<NLPQueryIntent | null> {
    if (!semanticLayerConfig?.naturalLanguageQueryEnabled) return null;
    await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 500)); // Simulate NLP model inference latency
    const lowerQuery = query.toLowerCase(); let intent: string = 'unknown'; const parameters: Record<string, any> = { originalQuery: query };
    const matchedConcepts: SemanticConcept[] = [];

    // Basic intent detection
    if (lowerQuery.includes('show me') || lowerQuery.includes('what is the') || lowerQuery.includes('get')) {
        if (lowerQuery.includes('revenue')) { intent = 'get_kpi'; parameters.kpi = 'revenue'; }
        if (lowerQuery.includes('sales trend')) { intent = 'show_trend'; parameters.metric = 'sales'; parameters.timeUnit = 'month'; }
        if (lowerQuery.includes('fraudulent transactions')) { intent = 'get_fraud_report'; }
        if (lowerQuery.includes('identity')) { intent = 'get_identity_info'; parameters.entityType = 'identity'; }
        if (lowerQuery.includes('payment status')) { intent = 'get_payment_status'; parameters.entityType = 'payment'; }
    } else if (lowerQuery.includes('compare')) {
        intent = 'compare_metrics';
        if (lowerQuery.includes('regions')) parameters.groupBy = 'region';
    } else if (lowerQuery.includes('predict')) {
        intent = 'predict_value';
        if (lowerQuery.includes('next quarter')) parameters.timeframe = 'next_quarter';
    }

    // Concept matching
    ontology.concepts.forEach(concept => {
        const matchFound = concept.synonyms?.some(syn => lowerQuery.includes(syn.toLowerCase())) || lowerQuery.includes(concept.name.toLowerCase());
        if (matchFound) {
            if (!matchedConcepts.some(mc => mc.id === concept.id)) { // Avoid duplicates
                matchedConcepts.push(concept);
                // Populate parameters based on matched concepts (simplified)
                if (concept.type === 'measure' && !parameters.metric) parameters.metric = concept.name.toLowerCase();
                if (concept.type === 'time' && !parameters.timeField) parameters.timeField = concept.name.toLowerCase();
            }
        }
    });

    return {
        intent: intent,
        parameters: parameters,
        confidence: Math.random() * 0.3 + 0.6, // Simulate confidence
        matchedConcepts: matchedConcepts.filter(Boolean),
        originalQuery: query,
        processedTimestamp: new Date().toISOString(),
        aiModelUsed: 'SimulatedNLPProcessor-v1.0',
        queryHash: simpleHash(query, HashAlgorithm.SHA256),
        suggestedVisualizations: ['bar_chart', 'line_chart', 'table'], // Example suggestions
    };
}

export function applySchemaValidation(data: any[], schema: DataSchema): DataValidationReportEntry[] {
    const reports: DataValidationReportEntry[] = []; if (!data || data.length === 0) return reports;

    const uniqueValueChecks: Record<string, Set<any>> = {}; // For isUnique constraint

    schema.fields.forEach(fieldDef => {
        const fieldName = fieldDef.name; let failedCount = 0; let sampleFailures: any[] = [];
        const isUniqueConstraint = fieldDef.constraints?.isUnique === true;

        if (isUniqueConstraint) {
            if (!uniqueValueChecks[fieldName]) { // Only process unique check once per field
                uniqueValueChecks[fieldName] = new Set();
                const currentFieldFailures: any[] = [];
                data.forEach((record, index) => {
                    const value = record[fieldName];
                    if (value !== null && value !== undefined) {
                        if (uniqueValueChecks[fieldName].has(value)) {
                            currentFieldFailures.push({ recordIndex: index, value: value, issue: 'non-unique-value' });
                        } else {
                            uniqueValueChecks[fieldName].add(value);
                        }
                    }
                });
                if (currentFieldFailures.length > 0) {
                    reports.push({
                        ruleId: `schema-field-unique-${fieldName}`, status: 'failed', severity: 'error',
                        message: `Field '${fieldName}' has ${currentFieldFailures.length} non-unique values.`,
                        recordsAffected: currentFieldFailures.length, sampleData: currentFieldFailures.slice(0, 5), field: fieldName, timestamp: new Date().toISOString(), ruleType: 'schema_conformance'
                    });
                } else {
                    reports.push({ ruleId: `schema-field-unique-${fieldName}`, status: 'passed', severity: 'info', message: `Field '${fieldName}' uniqueness confirmed.`, timestamp: new Date().toISOString(), ruleType: 'schema_conformance' });
                }
            }
        }

        data.forEach((record, index) => {
            const value = record[fieldName];
            let recordFailed = false;

            // Nullability check
            if (!fieldDef.isNullable && (value === null || value === undefined)) {
                failedCount++;
                if (sampleFailures.length < 5) sampleFailures.push({ recordIndex: index, value: value, issue: 'non-nullable-null' });
                recordFailed = true;
            }

            // Type check (if not null/undefined)
            if (!recordFailed && value !== null && value !== undefined) {
                let typeMismatch = false;
                switch (fieldDef.type) {
                    case 'string': if (typeof value !== 'string') typeMismatch = true; break;
                    case 'number': if (typeof value !== 'number' || isNaN(value)) typeMismatch = true; break;
                    case 'boolean': if (typeof value !== 'boolean') typeMismatch = true; break;
                    case 'date': case 'datetime': case 'timestamp_tz': if (isNaN(new Date(value).getTime())) typeMismatch = true; break;
                    case 'object': if (typeof value !== 'object' || Array.isArray(value)) typeMismatch = true; break;
                    case 'array': if (!Array.isArray(value)) typeMismatch = true; break;
                    case 'uuid': if (typeof value !== 'string' || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value)) typeMismatch = true; break;
                    // Add more type checks as needed for other custom types
                }
                if (typeMismatch) {
                    failedCount++;
                    if (sampleFailures.length < 5) sampleFailures.push({ recordIndex: index, value: value, issue: `type-mismatch-expected-${fieldDef.type}` });
                    recordFailed = true;
                }
            }

            // Constraints check (if not already failed and value is not null/undefined)
            if (!recordFailed && value !== null && value !== undefined && fieldDef.constraints) {
                const constraints = fieldDef.constraints;
                if (typeof value === 'number') {
                    if (constraints.min !== undefined && value < constraints.min) { failedCount++; if (sampleFailures.length < 5) sampleFailures.push({ recordIndex: index, value: value, issue: `value-below-min-${constraints.min}` }); recordFailed = true; }
                    if (constraints.max !== undefined && value > constraints.max) { failedCount++; if (sampleFailures.length < 5) sampleFailures.push({ recordIndex: index, value: value, issue: `value-above-max-${constraints.max}` }); recordFailed = true; }
                }
                if (typeof value === 'string') {
                    if (constraints.minLength !== undefined && value.length < constraints.minLength) { failedCount++; if (sampleFailures.length < 5) sampleFailures.push({ recordIndex: index, value: value, issue: `length-below-min-${constraints.minLength}` }); recordFailed = true; }
                    if (constraints.maxLength !== undefined && value.length > constraints.maxLength) { failedCount++; if (sampleFailures.length < 5) sampleFailures.push({ recordIndex: index, value: value, issue: `length-above-max-${constraints.maxLength}` }); recordFailed = true; }
                    if (constraints.pattern && !new RegExp(constraints.pattern).test(value)) { failedCount++; if (sampleFailures.length < 5) sampleFailures.push({ recordIndex: index, value: value, issue: `pattern-mismatch-${constraints.pattern}` }); recordFailed = true; }
                }
                if (constraints.enum && !constraints.enum.includes(value)) { failedCount++; if (sampleFailures.length < 5) sampleFailures.push({ recordIndex: index, value: value, issue: `not-in-enum` }); recordFailed = true; }
                // Foreign key checks would require access to other schemas/data, which is out of scope for a single record check here.
            }
        });
        if (failedCount > 0) {
            reports.push({
                ruleId: `schema-field-conformance-${fieldName}`, status: 'failed', severity: 'error',
                message: `Field '${fieldName}' has ${failedCount} conformance issues (expected type: ${fieldDef.type}, nullable: ${fieldDef.isNullable}).`,
                recordsAffected: failedCount, sampleData: sampleFailures, field: fieldName, timestamp: new Date().toISOString(), ruleType: 'schema_conformance'
            });
        } else {
            // Only report 'passed' if no unique constraint failure reported for this field, or if no unique constraint applied.
            if (!isUniqueConstraint || (isUniqueConstraint && reports.some(r => r.ruleId === `schema-field-unique-${fieldName}` && r.status === 'passed'))) {
                reports.push({ ruleId: `schema-field-conformance-${fieldName}`, status: 'passed', severity: 'info', message: `Field '${fieldName}' conforms to schema.`, timestamp: new Date().toISOString(), ruleType: 'schema_conformance' });
            }
        }
    });
    return reports;
}

export class DataProcessorEngine {
    private logger: UniversalDataLogger;
    // Simple in-memory metric store for demonstration
    private metrics: Map<string, { type: MetricType; value: number; labels: Record<string, string>; history?: number[]; lastUpdate: string }> = new Map();

    constructor(userId?: string) {
        this.logger = new UniversalDataLogger('DataProcessorEngine', userId);
    }

    async executeTransformationStep(data: any[], step: DataTransformationStep): Promise<any[]> {
        const handler = TransformationFunctionRegistry.get(step.operation);
        if (!handler) {
            this.logger.log({ eventType: 'transform', transformationId: step.id, description: `Unknown operation: ${step.operation}`, status: DataOperationStatus.Error, error: `Unknown operation: ${step.operation}` });
            throw new Error(`Unknown transformation operation: ${step.operation}`);
        }
        const result = await Promise.resolve(handler(data, step.parameters));
        return result;
    }

    async processDataSource(
        dataSource: DataSourceConfig, pipelineConfig: DataTransformationPipeline,
        validationProfile: DataValidationProfile, semanticLayerConfig?: TileConfiguration['semanticLayerConfig'],
        schema?: DataSchema, abortSignal?: AbortSignal
    ): Promise<{
        finalData: any[]; transformationResult: TransformationResult;
        semanticMappedData?: Array<Record<string, SemanticMappingResultEntry | any>>;
        enrichedData?: any[]; validationReports: DataValidationReportEntry[];
        schemaValidationReports: DataValidationReportEntry[]; dataQualityMetrics: DataQualityMetricResult[];
        piiReports: PIIFieldDetectionReportEntry[];
    }> {
        const pipelineRunId = `run-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        this.logger.log({ eventType: 'pipeline_start', transformationId: pipelineConfig.id, description: `Starting pipeline '${pipelineConfig.name}'.`, inputSources: [dataSource.id], outputDestinations: [], pipelineRunId: pipelineRunId, status: DataOperationStatus.Running });
        let rawData: any[] = [];
        let processedData: any[] = [];
        const pipelineExecutionLog: TransformationResult['pipelineExecutionLog'] = [];
        let validationReports: DataValidationReportEntry[] = [];
        let schemaValidationReports: DataValidationReportEntry[] = [];
        let semanticMappedData: Array<Record<string, SemanticMappingResultEntry | any>> | undefined;
        let enrichedData: any[] | undefined;
        let dataQualityMetrics: DataQualityMetricResult[] = [];
        let piiReports: PIIFieldDetectionReportEntry[] = [];

        try {
            rawData = await simulateDataFetch(dataSource, abortSignal);
            this.logger.log({ eventType: 'fetch', transformationId: 'simulate_fetch', description: `Fetched ${rawData.length} records.`, inputSources: [dataSource.id], outputDestinations: ['raw_data_buffer'], recordsAffected: rawData.length, status: DataOperationStatus.Success, pipelineRunId: pipelineRunId });

            if (schema) {
                schemaValidationReports = applySchemaValidation(rawData, schema);
                this.logger.log({ eventType: 'validate', transformationId: 'schema_validation', description: 'Raw data schema validated.', inputSources: ['raw_data_buffer'], outputDestinations: ['schema_report'], recordsAffected: rawData.length, status: DataOperationStatus.Success, pipelineRunId: pipelineRunId });
            }

            processedData = [...rawData];
            for (const step of pipelineConfig.steps.sort((a, b) => (a.order || 0) - (b.order || 0))) {
                if (abortSignal?.aborted) {
                    pipelineExecutionLog.push({ stepId: step.id, operation: step.operation, status: DataOperationStatus.Aborted, message: 'Pipeline aborted.', timestamp: new Date().toISOString() });
                    this.logger.log({ eventType: 'pipeline_end', transformationId: pipelineConfig.id, description: `Pipeline aborted during step '${step.operation}'.`, status: DataOperationStatus.Aborted, pipelineRunId: pipelineRunId });
                    break;
                }
                if (!step.isEnabled) {
                    pipelineExecutionLog.push({ stepId: step.id, operation: step.operation, status: DataOperationStatus.Skipped, message: 'Step is disabled.', timestamp: new Date().toISOString() });
                    this.logger.log({ eventType: 'transform', transformationId: step.id, description: `Step ${step.operation} skipped.`, status: DataOperationStatus.Skipped, pipelineRunId: pipelineRunId, parametersUsed: step.parameters });
                    continue;
                }
                const startTime = Date.now();
                try {
                    const stepResult = await this.executeTransformationStep(processedData, step);
                    processedData = stepResult;
                    const durationMs = Date.now() - startTime;
                    pipelineExecutionLog.push({ stepId: step.id, operation: step.operation, status: DataOperationStatus.Success, message: `Applied ${step.operation}.`, timestamp: new Date().toISOString(), durationMs: durationMs });
                    this.logger.log({ eventType: 'transform', transformationId: step.id, description: `Step ${step.operation} executed.`, inputSources: ['previous_step_output'], outputDestinations: ['current_step_output'], recordsAffected: processedData.length, status: DataOperationStatus.Success, parametersUsed: step.parameters, durationMs: durationMs, pipelineRunId: pipelineRunId });
                } catch (error: any) {
                    const durationMs = Date.now() - startTime;
                    pipelineExecutionLog.push({ stepId: step.id, operation: step.operation, status: DataOperationStatus.Failed, message: `Error in ${step.operation}.`, error: error.message, timestamp: new Date().toISOString(), durationMs: durationMs });
                    this.logger.log({ eventType: 'transform', transformationId: step.id, description: `Step ${step.operation} failed.`, inputSources: ['previous_step_output'], outputDestinations: ['error_log'], recordsAffected: processedData.length, status: DataOperationStatus.Failed, parametersUsed: step.parameters, error: error.message, durationMs: durationMs, pipelineRunId: pipelineRunId });
                    throw error;
                }
            }

            validationReports = validateDataAgainstProfile(processedData, validationProfile);
            this.logger.log({ eventType: 'validate', transformationId: validationProfile.id, description: 'Processed data validated.', inputSources: ['pipeline_output'], outputDestinations: ['validation_report'], recordsAffected: processedData.length, status: DataOperationStatus.Success, pipelineRunId: pipelineRunId });

            if (semanticLayerConfig?.ontologyId) {
                // Mock Ontology for demonstration purposes
                const mockOntology: OntologyDefinition = {
                    id: semanticLayerConfig.ontologyId, name: 'Universal Business Ontology', version: '1.0',
                    concepts: [
                        { id: 'revenue', name: 'Revenue', type: 'measure', dataType: 'number', unit: 'USD', aggregationHint: 'sum', sourceMappings: [{ dataSourceId: dataSource.id, fieldName: 'value' }], synonyms: ['income', 'sales'] },
                        { id: 'customer_email', name: 'Customer Email', type: 'attribute', dataType: 'string', sourceMappings: [{ dataSourceId: dataSource.id, fieldName: 'email' }], tags: ['PII'] },
                        { id: 'transaction_amount', name: 'Transaction Amount', type: 'measure', dataType: 'number', unit: 'USD', sourceMappings: [{ dataSourceId: dataSource.id, fieldName: 'amount' }] },
                        { id: 'transaction_date', name: 'Transaction Date', type: 'time', dataType: 'date', sourceMappings: [{ dataSourceId: dataSource.id, fieldName: 'recordDate' }] },
                        { id: 'customer_address', name: 'Customer Address', type: 'attribute', dataType: 'string', sourceMappings: [{ dataSourceId: dataSource.id, fieldName: 'customerAddress' }], tags: ['PII'] },
                        { id: 'user_identifier', name: 'User Identifier', type: 'entity', dataType: 'string', sourceMappings: [{ dataSourceId: dataSource.id, fieldName: 'userId' }, { dataSourceId: dataSource.id, fieldName: 'accountId' }], tags: ['Identity', 'PII'] },
                        { id: 'payment_status', name: 'Payment Status', type: 'attribute', dataType: 'string', sourceMappings: [{ dataSourceId: dataSource.id, fieldName: 'isApproved' }] },
                    ],
                    relations: [
                        { fromConceptId: 'user_identifier', toConceptId: 'customer_email', type: 'has' },
                        { fromConceptId: 'user_identifier', toConceptId: 'transaction_amount', type: 'transacted' },
                    ],
                    glossary: { 'revenue': 'Total income from sales.', 'kpi': 'Key performance indicator.', 'pii': 'Personally Identifiable Information.' }
                };
                semanticMappedData = applySemanticMapping(processedData, mockOntology, semanticLayerConfig);
                this.logger.log({ eventType: 'semantic_map', transformationId: 'semantic_mapping', description: 'Data mapped to semantic concepts.', inputSources: ['pipeline_output'], outputDestinations: ['semantic_mapped_data'], recordsAffected: semanticMappedData.length, status: DataOperationStatus.Success, pipelineRunId: pipelineRunId });

                enrichedData = await enrichWithSemanticContext(semanticMappedData, mockOntology, semanticLayerConfig);
                // For this example, we overwrite processedData with enrichedData if semantic enrichment occurs
                processedData = enrichedData;
                this.logger.log({ eventType: 'enrich', transformationId: 'semantic_enrichment', description: 'Data enriched with semantic context.', inputSources: ['semantic_mapped_data'], outputDestinations: ['enriched_output'], recordsAffected: enrichedData.length, status: DataOperationStatus.Success, pipelineRunId: pipelineRunId });
            }

            dataQualityMetrics = this.assessDataQuality(processedData, schema || { id: 'default', version: '1.0', name: 'default_schema', fields: [] }, validationReports);
            this.logger.log({ eventType: 'audit', transformationId: 'data_quality_assessment', description: 'Data quality assessed.', inputSources: ['final_data'], outputDestinations: ['quality_report'], status: DataOperationStatus.Success, pipelineRunId: pipelineRunId });

            piiReports = this.detectPIIFields(processedData);
            this.logger.log({ eventType: 'audit', transformationId: 'pii_detection', description: 'PII fields detected.', inputSources: ['final_data'], outputDestinations: ['pii_report'], status: DataOperationStatus.Success, pipelineRunId: pipelineRunId });

            this.logger.log({ eventType: 'pipeline_end', transformationId: pipelineConfig.id, description: 'Pipeline completed successfully.', inputSources: [], outputDestinations: ['final_output'], status: DataOperationStatus.Success, pipelineRunId: pipelineRunId });
            await this.logger.persistLogs();

            return {
                finalData: processedData, transformationResult: { transformedData: processedData, pipelineExecutionLog, dataValidationReports: validationReports },
                semanticMappedData, enrichedData, validationReports, schemaValidationReports, dataQualityMetrics, piiReports,
            };

        } catch (error: any) {
            this.logger.log({ eventType: 'pipeline_end', transformationId: pipelineConfig.id, description: `Pipeline failed: ${error.message}`, inputSources: [], outputDestinations: ['error_channel'], status: DataOperationStatus.Failed, error: error.message, pipelineRunId: pipelineRunId });
            await this.logger.persistLogs();
            throw error;
        }
    }

    private assessDataQuality(data: any[], schema: DataSchema, validationReports: DataValidationReportEntry[]): DataQualityMetricResult[] {
        const metrics: DataQualityMetricResult[] = [];
        if (data.length === 0) return metrics;

        // Completeness
        let totalExpectedValues = data.length * schema.fields.length; let totalPresentValues = 0;
        data.forEach(record => { schema.fields.forEach(fieldDef => { if (record[fieldDef.name] !== null && record[fieldDef.name] !== undefined) { totalPresentValues++; } }); });
        const completenessScore = totalExpectedValues > 0 ? (totalPresentValues / totalExpectedValues) * 100 : 100;
        metrics.push({ metricName: 'completeness', score: parseFloat(completenessScore.toFixed(2)), description: `Overall completeness.`, details: { present: totalPresentValues, expected: totalExpectedValues, records: data.length, fields: schema.fields.length }, timestamp: new Date().toISOString(), grade: completenessScore > 95 ? 'A' : completenessScore > 80 ? 'B' : 'C' });

        // Validity
        const failedRulesCount = validationReports.filter(r => r.status === 'failed' && r.severity === 'error').length;
        const totalRulesCount = validationReports.filter(r => r.status !== 'ignored').length;
        const validityScore = totalRulesCount > 0 ? ((totalRulesCount - failedRulesCount) / totalRulesCount) * 100 : 100;
        metrics.push({ metricName: 'validity', score: parseFloat(validityScore.toFixed(2)), description: `Passed error-severity validation rules.`, details: { passedRules: totalRulesCount - failedRulesCount, totalRules: totalRulesCount }, timestamp: new Date().toISOString(), grade: validityScore > 90 ? 'A' : validityScore > 70 ? 'B' : 'C' });

        // Uniqueness (simple check for fields marked as unique in schema)
        schema.fields.filter(f => f.constraints?.isUnique).forEach(fieldDef => {
            const values = data.map(record => record[fieldDef.name]).filter(v => v !== null && v !== undefined);
            const uniqueValues = new Set(values);
            const uniquenessScore = values.length > 0 ? (uniqueValues.size / values.length) * 100 : 100;
            metrics.push({ metricName: `uniqueness_${fieldDef.name}`, score: parseFloat(uniquenessScore.toFixed(2)), description: `Uniqueness for field '${fieldDef.name}'.`, details: { unique: uniqueValues.size, total: values.length }, timestamp: new Date().toISOString(), field: fieldDef.name, grade: uniquenessScore === 100 ? 'A' : uniquenessScore > 90 ? 'B' : 'C' });
        });

        // Consistency (very basic simulation, e.g., values across linked fields)
        // This would typically involve more complex logic, possibly cross-dataset checks
        // For simulation, check if 'isApproved' is consistent with 'amount' for a simple rule
        const inconsistentRecords = data.filter(r => r.isApproved === false && r.amount > 1000).length; // Example inconsistency
        const consistencyScore = data.length > 0 ? ((data.length - inconsistentRecords) / data.length) * 100 : 100;
        metrics.push({ metricName: 'consistency', score: parseFloat(consistencyScore.toFixed(2)), description: `Internal consistency check.`, details: { inconsistent: inconsistentRecords }, timestamp: new Date().toISOString(), grade: consistencyScore > 95 ? 'A' : 'C' });

        // Timeliness (simple check for recent data based on a 'timestamp' field)
        const timestampField = schema.fields.find(f => f.type === 'datetime' || f.type === 'timestamp_tz' || f.name.toLowerCase().includes('date') || f.name.toLowerCase().includes('time'))?.name;
        if (timestampField) {
            const now = new Date();
            const staleThresholdDays = 7;
            const staleRecords = data.filter(record => {
                const recordTime = new Date(record[timestampField]);
                return (now.getTime() - recordTime.getTime()) / (1000 * 60 * 60 * 24) > staleThresholdDays;
            }).length;
            const timelinessScore = data.length > 0 ? ((data.length - staleRecords) / data.length) * 100 : 100;
            metrics.push({ metricName: 'timeliness', score: parseFloat(timelinessScore.toFixed(2)), description: `Timeliness (records older than ${staleThresholdDays} days).`, details: { staleRecords: staleRecords }, timestamp: new Date().toISOString(), grade: timelinessScore > 90 ? 'A' : 'C' });
        }

        return metrics;
    }

    private detectPIIFields(data: any[], sampleSize: number = 100): PIIFieldDetectionReportEntry[] {
        const piiReports: PIIFieldDetectionReportEntry[] = []; if (data.length === 0) return piiReports;
        const sampleData = data.slice(0, Math.min(data.length, sampleSize));
        const allFields = data.reduce((acc, row) => new Set([...acc, ...Object.keys(row)]), new Set<string>());
        allFields.forEach(fieldName => {
            let isPII = false; let category: PIIFieldCategory | undefined; let detectionMethod: PIIFieldDetectionReportEntry['detectionMethod'] = 'heuristic'; let confidence = 0;
            const fieldValues = sampleData.map(row => String(row[fieldName] || '')).filter(Boolean);
            const lowerFieldName = fieldName.toLowerCase();

            // Heuristic/Regex-based detection
            if (lowerFieldName.includes('email') || fieldValues.some(v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))) { isPII = true; category = 'email'; detectionMethod = 'regex'; confidence = Math.max(confidence, 0.9); }
            else if (lowerFieldName.includes('name') && fieldValues.some(v => v.split(' ').length > 1 && v.length > 5)) { isPII = true; category = 'name'; confidence = Math.max(confidence, 0.7); }
            else if (lowerFieldName.includes('address') || fieldValues.some(v => /\d+\s\w+\s(street|avenue|road|st|ave|rd|blvd)/i.test(v))) { isPII = true; category = 'address'; detectionMethod = 'regex'; confidence = Math.max(confidence, 0.8); }
            else if (lowerFieldName.includes('phone') || fieldValues.some(v => /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(v))) { isPII = true; category = 'phone'; detectionMethod = 'regex'; confidence = Math.max(confidence, 0.8); }
            else if (lowerFieldName.includes('ssn') || fieldValues.some(v => /^\d{3}-\d{2}-\d{4}$/.test(v))) { isPII = true; category = 'ssn'; detectionMethod = 'regex'; confidence = Math.max(confidence, 0.95); }
            else if (lowerFieldName.includes('iban') || fieldValues.some(v => /^[A-Z]{2}[0-9]{2}(?:[ ]?[0-9]{4}){4}(?:[ ]?[0-9]{1,2})?$/.test(v))) { isPII = true; category = 'financial'; detectionMethod = 'regex'; confidence = Math.max(confidence, 0.9); }
            else if (lowerFieldName.includes('creditcard') || lowerFieldName.includes('cardnumber') || fieldValues.some(v => /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9]{2})[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/.test(v.replace(/[\s-]/g, '')))) { isPII = true; category = 'financial'; detectionMethod = 'regex'; confidence = Math.max(confidence, 0.95); }
            else if (lowerFieldName.includes('dob') || lowerFieldName.includes('dateofbirth') || fieldValues.some(v => /^\d{4}-\d{2}-\d{2}$/.test(v))) { isPII = true; category = 'identifier'; confidence = Math.max(confidence, 0.75); }
            else if (lowerFieldName.includes('passport') || lowerFieldName.includes('driverlicense')) { isPII = true; category = 'identifier'; confidence = Math.max(confidence, 0.85); }
            else if (lowerFieldName.includes('userid') || lowerFieldName.includes('accountid') || lowerFieldName.includes('customerid')) { isPII = true; category = 'identifier'; confidence = Math.max(confidence, 0.6); }

            // Simulate ML-based detection (if confidence is still low or ambiguous)
            if (isPII && confidence < 0.8 && Math.random() > 0.5) { // 50% chance to simulate ML refining score
                detectionMethod = 'ml';
                confidence = Math.min(1.0, confidence + (Math.random() * 0.1 + 0.1)); // Boost confidence slightly
            }

            if (isPII) {
                piiReports.push({
                    fieldName, isPII, category, detectionMethod, confidence: parseFloat(confidence.toFixed(2)),
                    sampleValues: fieldValues.slice(0, 3), timestamp: new Date().toISOString(), riskLevel: confidence > 0.85 ? 'high' : confidence > 0.7 ? 'medium' : 'low',
                    mitigationSuggestions: ['Anonymize field', 'Mask data', 'Tokenize data', 'Encrypt field', 'Restrict access', 'Apply retention policy']
                });
            }
        });
        return piiReports;
    }

    // New methods for build phase architecture (examples for integration with internal metrics)
    private recordMetric(params: EmitObservabilityMetricParams, value: number) {
        const key = `${params.metricName}:${JSON.stringify(params.labelFields || {})}`;
        if (!this.metrics.has(key)) {
            this.metrics.set(key, { type: params.metricType, value: 0, labels: params.tags || {}, history: [], lastUpdate: new Date().toISOString() });
        }
        const metric = this.metrics.get(key)!;
        switch (params.metricType) {
            case MetricType.Counter:
                metric.value += params.incrementBy || value || 1;
                break;
            case MetricType.Gauge:
                metric.value = params.value || value;
                break;
            case MetricType.Histogram:
            case MetricType.Summary:
                metric.history!.push(value);
                // For a real histogram, you'd calculate buckets or percentiles
                metric.value = value; // Store last observed for simplicity
                break;
        }
        metric.lastUpdate = new Date().toISOString();
        this.logger.log({
            eventType: 'metric_emitted',
            description: `Metric '${params.metricName}' updated. Type: ${params.metricType}, Value: ${metric.value}`,
            parametersUsed: params,
            status: DataOperationStatus.Info,
            affectedFields: params.valueField ? [params.valueField] : undefined,
        });
    }

    getMetricsReport(): Array<{ name: string; type: MetricType; value: number | number[]; labels: Record<string, string>; lastUpdate: string }> {
        const report: Array<{ name: string; type: MetricType; value: number | number[]; labels: Record<string, string>; lastUpdate: string }> = [];
        this.metrics.forEach((metric, key) => {
            const [name] = key.split(':');
            report.push({
                name: name,
                type: metric.type,
                value: metric.type === MetricType.Histogram || metric.type === MetricType.Summary ? metric.history! : metric.value,
                labels: metric.labels,
                lastUpdate: metric.lastUpdate,
            });
        });
        return report;
    }
}

// Concrete Implementations for new operations

const applyHashData = (data: any[], params: HashDataParams): any[] => {
    const { field, algorithm, salt, newField } = params;
    return data.map(row => {
        const value = row[field];
        if (value === undefined || value === null) return row;
        const stringValue = String(value);
        const saltedValue = salt ? stringValue + salt : stringValue;
        const hashedValue = simpleHash(saltedValue, algorithm);
        return { ...row, [newField || field]: hashedValue };
    });
};
TransformationFunctionRegistry.register('hash_data', applyHashData);
TransformationFunctionRegistry.register('hash_pii_data', (data, params) => applyHashData(data, params as HashDataParams)); // Alias for PII hashing

const applySignData = async (data: any[], params: SignDataParams): Promise<any[]> => {
    const { field, privateKeyRef, signatureAlgorithm, newSignatureField, signatureFormat = 'base64' } = params;
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50)); // Simulate crypto operation latency
    return data.map(row => {
        const valueToSign = String(row[field]); // Assume field content is the data to sign
        const signature = simulateCrypto.sign(valueToSign, privateKeyRef, signatureAlgorithm);
        return { ...row, [newSignatureField]: signature };
    });
};
TransformationFunctionRegistry.register('sign_data', applySignData);

const applyVerifySignature = async (data: any[], params: VerifySignatureParams): Promise<any[]> => {
    const { field, signatureField, publicKeyRef, signatureAlgorithm, newVerificationResultField } = params;
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50)); // Simulate crypto operation latency
    return data.map(row => {
        const originalValue = String(row[field]);
        const signature = String(row[signatureField]);
        const isValid = simulateCrypto.verify(originalValue, signature, publicKeyRef, signatureAlgorithm);
        return { ...row, [newVerificationResultField]: isValid };
    });
};
TransformationFunctionRegistry.register('verify_signature', applyVerifySignature);

const applyEnrichWithIdentity = async (data: any[], params: EnrichWithIdentityParams): Promise<any[]> => {
    const { identityKeyField, identityServiceEndpoint, fieldsToFetch, onIdentityNotFound = 'fill_null' } = params;
    await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 100)); // Simulate identity service call
    return data.map(row => {
        const identityKey = row[identityKeyField];
        if (!identityKey) return row; // No key, cannot enrich
        // Simulate fetching identity details
        const identityDetails: Record<string, any> = {};
        if (Math.random() < 0.9) { // 90% chance to find identity
            fieldsToFetch.forEach(field => {
                if (field === 'kyc_status') identityDetails[field] = Math.random() > 0.5 ? 'verified' : 'pending';
                else if (field === 'risk_score') identityDetails[field] = parseFloat((Math.random() * 100).toFixed(2));
                else identityDetails[field] = `sim_value_for_${field}_${identityKey}`;
            });
            return { ...row, ...identityDetails };
        } else {
            if (onIdentityNotFound === 'drop') return undefined; // Drop record
            if (onIdentityNotFound === 'fill_null') {
                fieldsToFetch.forEach(field => identityDetails[field] = null);
                return { ...row, ...identityDetails };
            }
            // 'log_error' or default, just return original row
            return row;
        }
    }).filter(Boolean); // Remove dropped records
};
TransformationFunctionRegistry.register('enrich_identity', applyEnrichWithIdentity);

const applyValidateCredential = async (data: any[], params: ValidateCredentialParams): Promise<any[]> => {
    const { credentialField, validationServiceEndpoint, newValidationResultField, policyId } = params;
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100)); // Simulate validation service call
    return data.map(row => {
        const credential = row[credentialField];
        let isValid = false;
        if (typeof credential === 'string' && credential.length > 10) { // Simple length check as mock
            isValid = Math.random() > 0.2; // 80% valid
        }
        return { ...row, [newValidationResultField]: isValid };
    });
};
TransformationFunctionRegistry.register('validate_credential', applyValidateCredential);

const applyApplyTransactionRules = async (data: any[], params: ApplyTransactionRulesParams): Promise<any[]> => {
    const { ruleEngineId, transactionPayloadField, newDecisionField, newRuleHitsField } = params;
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50)); // Simulate rule engine latency
    return data.map(row => {
        const payload = row[transactionPayloadField];
        let decision = 'approved';
        const ruleHits: string[] = [];

        if (typeof payload === 'object' && payload !== null) {
            if (payload.amount > 10000 && Math.random() > 0.5) {
                decision = 'flagged';
                ruleHits.push('HighValueTransaction');
            }
            if (payload.recipient === 'known_fraud_account' && Math.random() > 0.3) {
                decision = 'rejected';
                ruleHits.push('KnownFraudRecipient');
            }
            if (payload.currency === 'XBT' && Math.random() > 0.7) {
                decision = 'pending_review';
                ruleHits.push('CryptoTransaction');
            }
        }
        const newRow = { ...row, [newDecisionField]: decision };
        if (newRuleHitsField) {
            newRow[newRuleHitsField] = ruleHits;
        }
        return newRow;
    });
};
TransformationFunctionRegistry.register('apply_transaction_rules', applyApplyTransactionRules);

const applyRoutePayment = async (data: any[], params: RoutePaymentParams): Promise<any[]> => {
    const { amountField, currencyField, recipientField, senderField, routingPolicyId, newRailIdField, newRoutingScoreField } = params;
    await new Promise(resolve => setTimeout(resolve, Math.random() * 150 + 50)); // Simulate routing engine latency
    return data.map(row => {
        const amount = row[amountField];
        const currency = row[currencyField];
        const recipient = row[recipientField];
        const sender = row[senderField];

        let chosenRail = 'rail_fast'; // Default
        let routingScore = Math.random();

        // Simple routing logic simulation
        if (amount > 50000 || currency === 'EUR') {
            chosenRail = 'rail_batch';
            routingScore = 0.3 + Math.random() * 0.2; // Lower score for batch
        } else if (recipient && recipient.startsWith('urgent_')) {
            chosenRail = 'rail_express';
            routingScore = 0.8 + Math.random() * 0.2; // Higher score for express
        } else {
            chosenRail = 'rail_fast';
            routingScore = 0.5 + Math.random() * 0.3;
        }
        const newRow = { ...row, [newRailIdField]: chosenRail };
        if (newRoutingScoreField) {
            newRow[newRoutingScoreField] = parseFloat(routingScore.toFixed(2));
        }
        return newRow;
    });
};
TransformationFunctionRegistry.register('route_payment', applyRoutePayment);

const applyMonitorTransactionForAnomaly = async (data: any[], params: MonitorTransactionForAnomalyParams): Promise<any[]> => {
    const { transactionFields, anomalyDetectionModelId, newAnomalyScoreField, newAnomalyFlagField, threshold = 0.7 } = params;
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100)); // Simulate ML model inference
    return data.map(row => {
        const featureVector = transactionFields.map(f => row[f] || 0); // Simplified feature extraction
        const anomalyScore = Math.random(); // Simulate a score between 0 and 1
        const isAnomaly = anomalyScore > threshold;
        return { ...row, [newAnomalyScoreField]: parseFloat(anomalyScore.toFixed(2)), [newAnomalyFlagField]: isAnomaly };
    });
};
TransformationFunctionRegistry.register('monitor_transaction_for_anomaly', applyMonitorTransactionForAnomaly);

const applyFeatureEngineering = async (data: any[], params: FeatureEngineeringParams): Promise<any[]> => {
    const { field, method, config = {}, outputPrefix, dropOriginal } = params;
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50)); // Simulate processing time
    return data.map(row => {
        const value = row[field];
        const newRow = { ...row };
        const prefix = outputPrefix || `${field}_${method}`;

        if (value === undefined || value === null) return newRow;

        switch (method) {
            case FeatureEngineeringMethod.OneHotEncode:
                // Simulate one-hot encoding for categorical string fields
                const categories = config.categories || ['Cat1', 'Cat2', 'Cat3'];
                categories.forEach(cat => {
                    newRow[`${prefix}_${cat}`] = (String(value) === String(cat)) ? 1 : 0;
                });
                break;
            case FeatureEngineeringMethod.LabelEncode:
                // Simulate label encoding
                if (typeof value === 'string') {
                    const labelMap = config.labelMap || { 'low': 0, 'medium': 1, 'high': 2 };
                    newRow[`${prefix}_label`] = labelMap[value.toLowerCase()] || -1;
                }
                break;
            case FeatureEngineeringMethod.ScaleFeatures:
                // Simulate min-max scaling for numeric fields
                if (typeof value === 'number') {
                    const min = config.min || 0;
                    const max = config.max || 1000;
                    newRow[`${prefix}_scaled`] = (value - min) / (max - min);
                }
                break;
            case FeatureEngineeringMethod.PolynomialFeatures:
                // Simulate squaring a numeric feature
                if (typeof value === 'number') {
                    newRow[`${prefix}_sq`] = value * value;
                }
                break;
            case FeatureEngineeringMethod.TextVectorize:
                // Simulate generating a vector embedding for text
                if (typeof value === 'string') {
                    newRow[`${prefix}_vector`] = Array.from({ length: config.dimension || 10 }, () => parseFloat(Math.random().toFixed(4)));
                }
                break;
            case FeatureEngineeringMethod.TimeFeatures:
                // Simulate extracting year, month, day from a date field
                if (value instanceof Date || typeof value === 'string') {
                    try {
                        const date = new Date(value);
                        if (!isNaN(date.getTime())) {
                            newRow[`${prefix}_year`] = date.getFullYear();
                            newRow[`${prefix}_month`] = date.getMonth() + 1;
                            newRow[`${prefix}_day`] = date.getDate();
                            newRow[`${prefix}_hour`] = date.getHours();
                        }
                    } catch { /* ignore invalid dates */ }
                }
                break;
            case FeatureEngineeringMethod.Binning:
                // Simulate simple binning
                if (typeof value === 'number') {
                    const bins = config.bins || [0, 100, 200, 500];
                    let binLabel = 'Unknown';
                    for (let i = 0; i < bins.length; i++) {
                        if (value < bins[i]) {
                            binLabel = `<${bins[i]}`;
                            break;
                        } else if (i === bins.length - 1) {
                            binLabel = `>=${bins[i]}`;
                        }
                    }
                    newRow[`${prefix}_bin`] = binLabel;
                }
                break;
            case FeatureEngineeringMethod.Imputation:
                // Placeholder, typically done by fill_missing_values, but could be a specific FE step
                break;
        }

        if (dropOriginal && field !== (outputPrefix || field)) { // Ensure we don't drop if output name is same as original
            delete newRow[field];
        }
        return newRow;
    });
};
TransformationFunctionRegistry.register('feature_engineering', applyFeatureEngineering);

const applyPredictWithMlModel = async (data: any[], params: PredictWithModelParams): Promise<any[]> => {
    const { modelId, inputFeatureFields, newPredictionField, modelType, outputProbabilityField, predictionThreshold } = params;
    await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 100)); // Simulate ML model inference
    return data.map(row => {
        const features = inputFeatureFields.map(f => row[f]); // Simplified feature collection
        let prediction: any;
        let probability: number | undefined;

        switch (modelType) {
            case PredictionModelType.Classification:
                probability = Math.random();
                prediction = probability > (predictionThreshold || 0.5) ? 'positive' : 'negative';
                break;
            case PredictionModelType.Regression:
                prediction = parseFloat((Math.random() * 1000).toFixed(2));
                break;
            case PredictionModelType.AnomalyDetection:
                probability = Math.random(); // Anomaly score (higher means more anomalous)
                prediction = probability > (predictionThreshold || 0.8) ? 'anomaly' : 'normal';
                break;
            case PredictionModelType.Clustering:
                prediction = `cluster_${Math.floor(Math.random() * 5)}`;
                break;
            case PredictionModelType.Forecasting:
                prediction = parseFloat((Math.random() * 500 + 100).toFixed(2)); // Example for future value
                break;
            case PredictionModelType.Recommendation:
                prediction = [`item_${Math.floor(Math.random() * 10)}`, `item_${Math.floor(Math.random() * 10)}`];
                break;
            default:
                prediction = 'unknown_prediction';
        }

        const newRow = { ...row, [newPredictionField]: prediction };
        if (outputProbabilityField && probability !== undefined) {
            newRow[outputProbabilityField] = parseFloat(probability.toFixed(4));
        }
        return newRow;
    });
};
TransformationFunctionRegistry.register('predict_with_ml_model', applyPredictWithMlModel);

const applyExplainAiPrediction = async (data: any[], params: ExplainAiPredictionParams): Promise<any[]> => {
    const { predictionField, featureFields, explanationModelId, newExplanationField, topNFeatures = 3 } = params;
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200)); // Simulate XAI service call
    return data.map(row => {
        const prediction = row[predictionField];
        const explanations: { feature: string; importance: number; value: any }[] = [];
        featureFields.forEach(f => {
            explanations.push({ feature: f, importance: parseFloat(Math.random().toFixed(4)), value: row[f] });
        });
        explanations.sort((a, b) => b.importance - a.importance); // Sort by importance
        return { ...row, [newExplanationField]: { prediction: prediction, topFeatures: explanations.slice(0, topNFeatures) } };
    });
};
TransformationFunctionRegistry.register('explain_ai_prediction', applyExplainAiPrediction);

const applyDetectDataDrift = async (data: any[], params: DetectDataDriftParams): Promise<any[]> => {
    const { referenceDataId, fieldsToMonitor, detectionMethod, newDriftScoreField, newDriftFlagField, threshold = 0.6 } = params;
    await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 150)); // Simulate drift detection service
    return data.map(row => {
        const fieldScores: Record<string, number> = {};
        let maxDriftScore = 0;
        fieldsToMonitor.forEach(f => {
            const score = Math.random(); // Simulate a drift score for each field
            fieldScores[f] = parseFloat(score.toFixed(4));
            maxDriftScore = Math.max(maxDriftScore, score);
        });
        const overallDriftScore = maxDriftScore; // Or an average, or a weighted sum
        const hasDrift = overallDriftScore > threshold;
        return { ...row, [newDriftScoreField]: parseFloat(overallDriftScore.toFixed(4)), [newDriftFlagField]: hasDrift, [`${newDriftScoreField}_details`]: fieldScores };
    });
};
TransformationFunctionRegistry.register('detect_data_drift', applyDetectDataDrift);

const applyAssessModelFairness = async (data: any[], params: AssessModelFairnessParams): Promise<any[]> => {
    const { modelId, protectedAttributeField, predictionField, groundTruthField, fairnessMetric, newFairnessReportField, favorableOutcomeValue } = params;
    await new Promise(resolve => setTimeout(resolve, Math.random() * 600 + 200)); // Simulate fairness assessment
    const fairnessReport: Record<string, any> = {};

    const protectedGroups: Record<string, any[]> = {};
    data.forEach(row => {
        const group = row[protectedAttributeField];
        if (!protectedGroups[group]) protectedGroups[group] = [];
        protectedGroups[group].push(row);
    });

    // Simulate metrics per group
    for (const group in protectedGroups) {
        const groupData = protectedGroups[group];
        const predictedFavorable = groupData.filter(r => r[predictionField] == favorableOutcomeValue).length;
        const total = groupData.length;
        const rate = total > 0 ? predictedFavorable / total : 0;
        fairnessReport[group] = {
            count: total,
            predictedFavorableRate: parseFloat(rate.toFixed(4)),
            metricValue: parseFloat(Math.random().toFixed(4)), // Placeholder for actual fairness metric value
        };
    }

    // Overall fairness score/disparity
    const groups = Object.keys(protectedGroups);
    if (groups.length > 1) {
        const rates = groups.map(g => fairnessReport[g].predictedFavorableRate);
        const maxRate = Math.max(...rates);
        const minRate = Math.min(...rates);
        fairnessReport.overallDisparity = parseFloat((maxRate - minRate).toFixed(4));
        fairnessReport.isFair = fairnessReport.overallDisparity < 0.1; // Example threshold
    }

    return data.map(row => ({ ...row, [newFairnessReportField]: fairnessReport }));
};
TransformationFunctionRegistry.register('assess_model_fairness', applyAssessModelFairness);

const applyApplyDataRetention = async (data: any[], params: ApplyDataRetentionParams): Promise<any[]> => {
    const { retentionPolicyId, retentionPolicyType, dateField, periodDays, action, newRetentionStatusField } = params;
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100)); // Simulate policy application
    const retainedData: any[] = [];
    data.forEach(row => {
        let status = 'retained';
        let shouldRemove = false;
        if (retentionPolicyType === RetentionPolicyType.AgeBased && dateField && periodDays !== undefined) {
            const recordDate = new Date(row[dateField]);
            const ageDays = (Date.now() - recordDate.getTime()) / (1000 * 60 * 60 * 24);
            if (ageDays > periodDays) {
                shouldRemove = true;
                status = `actioned_${action}`;
            }
        }
        // Other policy types would have their own logic

        if (!shouldRemove) {
            retainedData.push({ ...row, [newRetentionStatusField || 'data_retention_status']: status });
        } else {
            // Simulate action
            if (action === 'anonymize') {
                const anonymizedRow = applyAnonymizeData([row], { fields: Object.keys(row), method: 'redact' })[0];
                retainedData.push({ ...anonymizedRow, [newRetentionStatusField || 'data_retention_status']: status });
            }
            // For 'delete' or 'archive', the record is simply not added to retainedData.
        }
    });
    return retainedData;
};
TransformationFunctionRegistry.register('apply_data_retention', applyApplyDataRetention);

// This operation would typically be handled by the DataProcessorEngine itself, but can be configured as a step
const applyEmitObservabilityMetric = (data: any[], params: EmitObservabilityMetricParams): any[] => {
    // This is a special operation, the DataProcessorEngine needs to hook into it
    // For now, we'll return data as is, and the engine will handle the metric logic
    return data;
};
TransformationFunctionRegistry.register('emit_observability_metric', applyEmitObservabilityMetric);

const applyPadString = (data: any[], params: PadStringParams): any[] => {
    const { field, length, character, direction } = params;
    return data.map(row => {
        const value = row[field];
        if (typeof value !== 'string') return row;
        let paddedValue = String(value);
        if (paddedValue.length >= length) return row; // No need to pad if already long enough
        const padNeeded = length - paddedValue.length;
        const padChar = character.charAt(0) || ' '; // Use first char or space
        const padString = padChar.repeat(padNeeded);

        switch (direction) {
            case PadDirection.Left:
                paddedValue = padString + paddedValue;
                break;
            case PadDirection.Right:
                paddedValue = paddedValue + padString;
                break;
            case PadDirection.Both:
                const leftPad = Math.floor(padNeeded / 2);
                const rightPad = padNeeded - leftPad;
                paddedValue = padChar.repeat(leftPad) + paddedValue + padChar.repeat(rightPad);
                break;
        }
        return { ...row, [field]: paddedValue };
    });
};
TransformationFunctionRegistry.register('pad_string_field', applyPadString);

const applyTrimStrings = (data: any[], params: TrimStringsParams): any[] => {
    const { field, side = 'both' } = params;
    return data.map(row => {
        const value = row[field];
        if (typeof value !== 'string') return row;
        let trimmedValue = value;
        switch (side) {
            case 'left': trimmedValue = trimmedValue.trimStart(); break;
            case 'right': trimmedValue = trimmedValue.trimEnd(); break;
            case 'both':
            default: trimmedValue = trimmedValue.trim(); break;
        }
        return { ...row, [field]: trimmedValue };
    });
};
TransformationFunctionRegistry.register('trim_strings', applyTrimStrings);

const applyToUpper = (data: any[], params: ChangeCaseParams): any[] => {
    const { field } = params;
    return data.map(row => {
        const value = row[field];
        if (typeof value !== 'string') return row;
        return { ...row, [field]: value.toUpperCase() };
    });
};
TransformationFunctionRegistry.register('to_upper_case', applyToUpper);

const applyToLower = (data: any[], params: ChangeCaseParams): any[] => {
    const { field } = params;
    return data.map(row => {
        const value = row[field];
        if (typeof value !== 'string') return row;
        return { ...row, [field]: value.toLowerCase() };
    });
};
TransformationFunctionRegistry.register('to_lower_case', applyToLower);

const applyReplaceValues = (data: any[], params: ReplaceValuesParams): any[] => {
    const { field, oldValue, newValue, isRegex = false, globalReplace = true } = params;
    return data.map(row => {
        const value = row[field];
        if (typeof value !== 'string' || value === null || value === undefined) return row;

        let modifiedValue = String(value);
        if (isRegex) {
            const flags = globalReplace ? 'g' : '';
            modifiedValue = modifiedValue.replace(new RegExp(String(oldValue), flags), String(newValue));
        } else {
            if (globalReplace) {
                modifiedValue = modifiedValue.split(String(oldValue)).join(String(newValue));
            } else {
                modifiedValue = modifiedValue.replace(String(oldValue), String(newValue));
            }
        }
        return { ...row, [field]: modifiedValue };
    });
};
TransformationFunctionRegistry.register('replace_values', applyReplaceValues);


const applyMaskPiiData = (data: any[], params: MaskPiiDataParams): any[] => {
    const { field, pattern, maskChar = '*' } = params;
    return data.map(row => {
        const value = row[field];
        if (typeof value !== 'string' || value === null || value === undefined) return row;
        try {
            const regex = new RegExp(pattern, 'g'); // Always global for masking
            const maskedValue = value.replace(regex, (match) => maskChar.repeat(match.length));
            return { ...row, [field]: maskedValue };
        } catch (e) {
            console.error(`Error applying mask pattern '${pattern}' to field '${field}':`, e);
            return { ...row, [field]: '[MASKING_ERROR]' };
        }
    });
};
TransformationFunctionRegistry.register('mask_pii_data', applyMaskPiiData);


const applyApplyDataMaskingPolicy = (data: any[], params: ApplyDataMaskingPolicyParams): any[] => {
    const { field, maskingPattern, maskingCharacter = '*', preserveLength = true } = params;
    return data.map(row => {
        const value = row[field];
        if (typeof value !== 'string' || value === null || value === undefined) return row;

        let maskedValue = '';
        if (preserveLength) {
            let patternIndex = 0;
            for (let i = 0; i < value.length; i++) {
                if (patternIndex < maskingPattern.length) {
                    const patternChar = maskingPattern[patternIndex];
                    if (patternChar === '*') {
                        maskedValue += maskingCharacter;
                    } else {
                        maskedValue += value[i]; // Preserve original character
                    }
                    patternIndex++;
                } else {
                    // Pattern shorter than value, mask remaining or copy original? Let's mask
                    maskedValue += maskingCharacter;
                }
            }
        } else {
            // Simplified: apply a fixed pattern or full mask
            maskedValue = maskingPattern.replace(/\*/g, maskingCharacter);
        }
        return { ...row, [field]: maskedValue };
    });
};
TransformationFunctionRegistry.register('apply_data_masking_policy', applyApplyDataMaskingPolicy);


const applyApplyDataTokenization = async (data: any[], params: ApplyDataTokenizationParams): Promise<any[]> => {
    const { field, newTokenField, tokenizationServiceId, detokenizationAllowed = false, tokenFormat = 'UUID' } = params;
    await new Promise(resolve => setTimeout(resolve, Math.random() * 250 + 100)); // Simulate tokenization service call
    return data.map(row => {
        const value = row[field];
        if (value === null || value === undefined) return row;

        let token = '';
        if (tokenFormat === 'UUID') {
            token = `uuid_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
        } else {
            token = `token_${String(value).length}_${Math.random().toString(36).substring(2, 10)}`;
        }

        return { ...row, [newTokenField || `${field}_token`]: token, [`${newTokenField || `${field}_token`}_detokenize_allowed`]: detokenizationAllowed };
    });
};
TransformationFunctionRegistry.register('apply_data_tokenization', applyApplyDataTokenization);


const applyTransposeData = (data: any[], params: TransposeDataParams): any[] => {
    const { idField, columnsToTranspose, newKeyColumn, newValueColumn } = params;
    if (!idField || !columnsToTranspose || columnsToTranspose.length === 0 || !newKeyColumn || !newValueColumn) return data;

    const transposedData: any[] = [];
    data.forEach(row => {
        const idValue = row[idField];
        columnsToTranspose.forEach(col => {
            transposedData.push({
                [idField]: idValue,
                [newKeyColumn]: col,
                [newValueColumn]: row[col]
            });
        });
    });
    return transposedData;
};
TransformationFunctionRegistry.register('transpose_data', applyTransposeData);