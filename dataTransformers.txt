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
    | 'to_lower_case';

export type AggregationFunction = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'median' | 'stddev' | 'count_distinct' | 'first' | 'last' | 'variance' | 'mode';
export type JoinType = 'inner' | 'left' | 'right' | 'full' | 'cross' | 'semi' | 'anti';
export type DataType = 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'object' | 'array' | 'jsonb' | 'uuid' | 'geopoint' | 'binary' | 'any' | 'timestamp_tz';
export type ValidationSeverity = 'info' | 'warning' | 'error' | 'critical';
export type AnonymizationMethod = 'hash' | 'mask' | 'shuffle' | 'redact' | 'faker' | 'k_anonymity' | 'differential_privacy' | 'pseudonymization';
export type EnrichmentSourceType = 'internal_db' | 'external_api' | 'lookup_table' | 'ai_service' | 'cache' | 'file_system';
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
    maskingPattern: string;
    maskingCharacter?: string;
    preserveLength?: boolean;
}

export interface ApplyDataTokenizationParams extends BaseTransformationParams {
    field: string;
    newTokenField?: string;
    tokenizationServiceId: string;
    detokenizationAllowed?: boolean;
    tokenFormat?: string;
}

export interface TransposeDataParams extends BaseTransformationParams {
    idField: string;
    columnsToTranspose: string[];
    newKeyColumn: string;
    newValueColumn: string;
}

export interface HashPiiDataParams extends BaseTransformationParams {
    field: string;
    algorithm: 'SHA256' | 'MD5' | 'bcrypt';
    salt?: string;
}

export interface MaskPiiDataParams extends BaseTransformationParams {
    field: string;
    pattern: string; // Regex or fixed string (e.g., 'SSN:***-**-****')
    maskChar?: string;
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
    | ChangeCaseParams;


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
    eventType: 'fetch' | 'transform' | 'validate' | 'semantic_map' | 'enrich' | 'audit' | 'pipeline_start' | 'pipeline_end' | 'schema_applied' | 'data_published';
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
        console.log(`[${this.serviceId} Log] ${fullEvent.description}`);
    }

    getLogs(): DataLineageEvent[] {
        return [...this.logs];
    }

    async persistLogs(targetEndpoint: string = '/api/data-governance/audit'): Promise<void> {
        console.log(`[${this.serviceId} Logger] Persisting ${this.logs.length} logs to ${targetEndpoint}...`);
        await new Promise(resolve => setTimeout(resolve, 500));
        this.logs = [];
        console.log(`[${this.serviceId} Logger] Logs persisted successfully.`);
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

async function simulateDataFetch(dataSource: DataSourceConfig, abortSignal?: AbortSignal): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
    if (abortSignal?.aborted) throw new Error('Data fetch aborted.');
    const mockDataGenerators = {
        'API': () => Array.from({ length: Math.floor(Math.random() * 50) + 50 }, (_, i) => ({
            recId: `api_${i}`, timestamp: new Date(Date.now() - i * 3600 * 1000).toISOString(),
            value: parseFloat((Math.random() * 1000).toFixed(2)), category: `Cat${Math.floor(Math.random() * 5) + 1}`,
            status: Math.random() > 0.7 ? 'active' : 'inactive', region: ['N', 'S', 'E', 'W'][Math.floor(Math.random() * 4)],
            source: dataSource.id, email: `user${i}@example.com`, phone: `+1-${Math.floor(Math.random()*10000000000)}`
        })),
        'Database': () => Array.from({ length: Math.floor(Math.random() * 80) + 100 }, (_, i) => ({
            dbRecId: `db_${i}`, recordDate: new Date(Date.now() - i * 86400 * 1000).toISOString().split('T')[0],
            amount: parseFloat((Math.random() * 5000).toFixed(2)), currency: Math.random() > 0.6 ? 'USD' : 'EUR',
            department: ['Sales', 'Marketing', 'IT', 'HR'][Math.floor(Math.random() * 4)], isApproved: Math.random() > 0.5,
            notes: `Entry ${i}`, customerAddress: `${i} Oak Ave, Anytown`
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
        const { field, operator, value } = params;
        const fieldValue = row[field];
        if (value === undefined || fieldValue === undefined || fieldValue === null) return false;
        switch (operator) {
            case '>': return fieldValue > value; case '<': return fieldValue < value; case '=': return fieldValue == value;
            case '>=': return fieldValue >= value; case '<=': return fieldValue <= value; case '!=': return fieldValue != value;
            case 'contains': return typeof fieldValue === 'string' && fieldValue.includes(String(value));
            case 'startsWith': return typeof fieldValue === 'string' && fieldValue.startsWith(String(value));
            case 'endsWith': return typeof fieldValue === 'string' && fieldValue.endsWith(String(value));
            case 'isNull': return fieldValue === null || fieldValue === undefined;
            case 'isNotNull': return fieldValue !== null && fieldValue !== undefined;
            case 'in': return Array.isArray(value) && value.includes(fieldValue);
            case 'not_in': return Array.isArray(value) && !value.includes(fieldValue);
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
            const values = group.map(row => row[metric.field]).filter(v => typeof v === 'number');
            let aggregatedValue: number | undefined;
            switch (metric.func) {
                case 'sum': aggregatedValue = values.reduce((acc, v) => acc + v, 0); break;
                case 'avg': aggregatedValue = values.length > 0 ? values.reduce((acc, v) => acc + v, 0) / values.length : undefined; break;
                case 'min': aggregatedValue = Math.min(...values); break;
                case 'max': aggregatedValue = Math.max(...values); break;
                case 'count': aggregatedValue = values.length; break;
                case 'count_distinct': aggregatedValue = new Set(values).size; break;
                case 'median': if (values.length === 0) { aggregatedValue = undefined; break; } const sortedValues = [...values].sort((a, b) => a - b); const mid = Math.floor(sortedValues.length / 2); aggregatedValue = sortedValues.length % 2 === 0 ? (sortedValues[mid - 1] + sortedValues[mid]) / 2 : sortedValues[mid]; break;
                case 'stddev': if (values.length < 2) { aggregatedValue = 0; break; } const mean = values.reduce((acc, v) => acc + v, 0) / values.length; const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (values.length - 1); aggregatedValue = Math.sqrt(variance); break;
                case 'first': aggregatedValue = values[0]; break;
                case 'last': aggregatedValue = values[values.length - 1]; break;
                case 'variance': if (values.length < 2) { aggregatedValue = 0; break; } const meanVar = values.reduce((acc, v) => acc + v, 0) / values.length; aggregatedValue = values.reduce((acc, v) => acc + Math.pow(v - meanVar, 2), 0) / (values.length - 1); break;
                case 'mode': if (values.length === 0) { aggregatedValue = undefined; break; } const counts: Record<any, number> = {}; values.forEach(v => { counts[v] = (counts[v] || 0) + 1; }); aggregatedValue = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b); break;
                default: aggregatedValue = undefined;
            }
            newRow[metric.as || metric.field] = aggregatedValue;
        });
        aggregatedResult.push(newRow);
    }
    return aggregatedResult;
};
TransformationFunctionRegistry.register('aggregate', applyAggregate);

const applyMapFields = (data: any[], params: MapFieldsParams): any[] => {
    const { mapping, dropOriginal } = params; if (!mapping) return data;
    return data.map(row => {
        const newRow: Record<string, any> = {};
        for (const key in row) {
            if (mapping[key]) { newRow[mapping[key]] = row[key]; }
            else if (!dropOriginal) { newRow[key] = row[key]; }
        }
        return newRow;
    });
};
TransformationFunctionRegistry.register('map_field_names', applyMapFields);

const applyCalculateMetric = (data: any[], params: CalculateMetricParams): any[] => {
    const { newField, expression } = params; if (!newField || !expression) return data;
    return data.map(row => {
        try { const fn = new Function('row', `with(row){ return ${expression}; }`); return { ...row, [newField]: fn(row) }; }
        catch (e) { console.error('Error evaluating expression:', e); return { ...row, [newField]: null }; }
    });
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
    const { fields, method = 'redact' } = params; if (!fields || fields.length === 0) return data;
    return data.map(row => {
        const newRow = { ...row };
        fields.forEach(field => {
            const value = newRow[field];
            if (value !== undefined && value !== null) {
                switch (method) {
                    case 'hash': newRow[field] = `HASH_${String(value).length}_${Math.random().toString(36).substring(2, 8)}`; break;
                    case 'mask': newRow[field] = typeof value === 'string' ? value.replace(/./g, '*') : '*****'; break;
                    case 'redact': newRow[field] = '[REDACTED]'; break;
                    case 'shuffle': newRow[field] = Math.random().toString(36).substring(2, 10); break;
                    case 'faker': newRow[field] = `Faker_${field}_${Math.floor(Math.random() * 1000)}`; break;
                    case 'k_anonymity': newRow[field] = `K_ANON_GROUP_${Math.floor(Math.random() * 5)}`; break;
                    case 'differential_privacy': newRow[field] = parseFloat((Number(value) + (Math.random() - 0.5) * 0.1).toFixed(2)); break;
                    case 'pseudonymization': newRow[field] = `PSEUDO_${Math.random().toString(36).substring(2,12)}`; break;
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
            switch (targetType) {
                case 'string': castValue = String(value); break;
                case 'number': castValue = Number(value); if (isNaN(castValue)) castValue = null; break;
                case 'boolean': castValue = (value === 'true' || value === 1 || value === true); break;
                case 'date': castValue = new Date(value); if (isNaN(castValue.getTime())) castValue = null; break;
                case 'datetime': castValue = new Date(value); if (isNaN(castValue.getTime())) castValue = null; break;
                case 'object': if (typeof value !== 'object' || Array.isArray(value)) castValue = JSON.parse(value); break;
                case 'array': if (!Array.isArray(value)) castValue = [value]; break;
                case 'jsonb': try { castValue = JSON.parse(value); } catch { castValue = null; } break;
                default: castValue = value;
            }
        } catch (e) {
            if (onError === 'null_field') castValue = null;
            else if (onError === 'original_value') castValue = value;
            else if (onError === 'skip_record') return row;
        }
        return { ...row, [field]: castValue };
    });
};
TransformationFunctionRegistry.register('cast_field_type', applyCastFieldType);

const applyRenameColumn = (data: any[], params: RenameColumnParams): any[] => {
    const { oldName, newName } = params; if (!oldName || !newName) return data;
    return data.map(row => {
        const newRow: Record<string, any> = { ...row };
        if (newRow[oldName] !== undefined) { newRow[newName] = newRow[oldName]; delete newRow[oldName]; }
        return newRow;
    });
};
TransformationFunctionRegistry.register('rename_data_column', applyRenameColumn);

const applySortData = (data: any[], params: SortParams): any[] => {
    const { field, direction = 'asc' } = params; if (!field) return data;
    return [...data].sort((a, b) => {
        const valA = a[field]; const valB = b[field];
        if (typeof valA === 'string' && typeof valB === 'string') return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        if (typeof valA === 'number' && typeof valB === 'number') return direction === 'asc' ? valA - valB : valB - valA;
        return 0;
    });
};
TransformationFunctionRegistry.register('sort_data', applySortData);

const applyFillMissingValues = (data: any[], params: FillMissingParams): any[] => {
    const { field, strategy, value } = params; if (!field || !strategy) return data;
    const values = data.map(row => row[field]).filter(v => v !== null && v !== undefined);
    let fillValue: any = null;
    switch (strategy) {
        case 'constant': fillValue = value; break;
        case 'mean': if (values.every(v => typeof v === 'number') && values.length > 0) fillValue = values.reduce((sum, v) => sum + v, 0) / values.length; break;
        case 'median': if (values.every(v => typeof v === 'number') && values.length > 0) { const sorted = [...values].sort((a, b) => a - b); const mid = Math.floor(sorted.length / 2); fillValue = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]; } break;
        case 'mode': if (values.length > 0) { const counts: Record<any, number> = {}; values.forEach(v => { counts[v] = (counts[v] || 0) + 1; }); fillValue = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b); } break;
        case 'bfill':
            for (let i = data.length - 2; i >= 0; i--) { if ((data[i][field] === null || data[i][field] === undefined) && data[i + 1][field] !== null && data[i + 1][field] !== undefined) data[i][field] = data[i + 1][field]; }
            break;
        case 'ffill':
            for (let i = 1; i < data.length; i++) { if ((data[i][field] === null || data[i][field] === undefined) && data[i - 1][field] !== null && data[i - 1][field] !== undefined) data[i][field] = data[i - 1][field]; }
            break;
        case 'linear_interpolation':
            // Placeholder for actual interpolation logic
            data.forEach(row => { if (row[field] === null || row[field] === undefined) row[field] = parseFloat((Math.random() * 100).toFixed(2)); });
            break;
        case 'predict_ai':
            // Placeholder for AI prediction
            data.forEach(row => { if (row[field] === null || row[field] === undefined) row[field] = parseFloat((Math.random() * 100).toFixed(2)); });
            break;
    }
    return data.map(row => ({ ...row, [field]: (row[field] === null || row[field] === undefined) ? fillValue : row[field] }));
};
TransformationFunctionRegistry.register('fill_missing_values', applyFillMissingValues);

async function applySentimentAnalysisAI(data: any[], params: AISentimentParams): Promise<any[]> {
    const { textField, newSentimentField = 'sentiment', newScoreField = 'sentimentScore' } = params;
    await new Promise(resolve => setTimeout(resolve, 500));
    return data.map(row => {
        const text = row[textField]; if (typeof text === 'string') {
            const score = Math.random(); const sentiment = score > 0.7 ? 'positive' : (score < 0.3 ? 'negative' : 'neutral');
            return { ...row, [newSentimentField]: sentiment, [newScoreField]: parseFloat(score.toFixed(2)) };
        } return row;
    });
}
TransformationFunctionRegistry.register('sentiment_analysis_ai', applySentimentAnalysisAI);

const evaluateValidationCondition = (record: Record<string, any>, rule: DataValidationRule): boolean => {
    const field = rule.field; const value = field ? record[field] : undefined;
    if (rule.condition.includes('exists')) { const targetField = rule.condition.split(' ')[0]; return record[targetField] !== undefined && record[targetField] !== null; }
    if (rule.regexPattern && typeof value === 'string') return new RegExp(rule.regexPattern).test(value);
    if (rule.allowedValues && value !== undefined) return rule.allowedValues.includes(value);
    if (field && value !== undefined) {
        if (rule.min !== undefined && typeof value === 'number') return value >= rule.min;
        if (rule.max !== undefined && typeof value === 'number') return value <= rule.max;
        if (rule.maxLength !== undefined && typeof value === 'string') return value.length <= rule.maxLength;
        if (rule.minLength !== undefined && typeof value === 'string') return value.length >= rule.minLength;
        if (rule.isUnique && value !== undefined) return true;
    }
    const parts = rule.condition.split(' ');
    if (parts.length === 3) {
        const targetField = parts[0]; const operator = parts[1]; let targetValue: any = parts[2];
        try { targetValue = JSON.parse(targetValue); } catch { /* not JSON */ }
        const recordValue = record[targetField];
        switch (operator) {
            case '>': return recordValue > targetValue; case '<': return recordValue < targetValue; case '=': return recordValue == targetValue;
            case '>=': return recordValue >= targetValue; case '<=': return recordValue <= targetValue; case '!=': return recordValue != targetValue;
            default: return false;
        }
    }
    return false;
};

export function validateDataAgainstProfile(data: any[], validationProfile: DataValidationProfile): DataValidationReportEntry[] {
    const reports: DataValidationReportEntry[] = [];
    validationProfile.rules.forEach(rule => {
        if (!rule.isActive) { reports.push({ ruleId: rule.id, status: 'ignored', severity: 'info', message: `Rule '${rule.name}' is disabled.`, timestamp: new Date().toISOString() }); return; }
        const failedRecords: any[] = [];
        data.forEach(record => { if (!evaluateValidationCondition(record, rule)) { failedRecords.push(record); } });
        if (failedRecords.length > 0) {
            reports.push({
                ruleId: rule.id, status: 'failed', severity: rule.severity,
                message: rule.errorMessage || `Rule '${rule.name}' failed for ${failedRecords.length} records.`,
                recordsAffected: failedRecords.length, sampleData: failedRecords.slice(0, 5), field: rule.field, timestamp: new Date().toISOString()
            });
        } else { reports.push({ ruleId: rule.id, status: 'passed', severity: 'info', message: `Rule '${rule.name}' passed.`, timestamp: new Date().toISOString() }); }
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
            } else { newRecord[mappedConceptKey] = rawValue; }
        }
        mappedData.push(newRecord);
    });
    return mappedData;
}

export async function enrichWithSemanticContext(
    data: any[], ontology: OntologyDefinition, semanticLayerConfig?: TileConfiguration['semanticLayerConfig']
): Promise<any[]> {
    if (!semanticLayerConfig?.ontologyId) return data;
    await new Promise(resolve => setTimeout(resolve, 700));
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
        if (Math.random() > 0.6) { enrichedRecord['ai_semantic_tags'] = ['Trend Analysis', 'Key Driver', 'Forecasting']; }
        return enrichedRecord;
    });
}

export async function naturalLanguageQueryProcessor(
    query: string, ontology: OntologyDefinition, semanticLayerConfig?: TileConfiguration['semanticLayerConfig']
): Promise<NLPQueryIntent | null> {
    if (!semanticLayerConfig?.naturalLanguageQueryEnabled) return null;
    await new Promise(resolve => setTimeout(resolve, 1000));
    const lowerQuery = query.toLowerCase(); let intent: string = 'unknown'; const parameters: Record<string, any> = { originalQuery: query };
    const matchedConcepts: SemanticConcept[] = [];
    if (lowerQuery.includes('show me') || lowerQuery.includes('what is the')) {
        if (lowerQuery.includes('revenue')) { intent = 'get_kpi'; parameters.kpi = 'revenue'; matchedConcepts.push(ontology.concepts.find(c => c.name.toLowerCase() === 'revenue') || {} as SemanticConcept); }
        if (lowerQuery.includes('sales trend')) { intent = 'show_trend'; parameters.metric = 'sales'; parameters.timeUnit = 'month'; matchedConcepts.push(ontology.concepts.find(c => c.name.toLowerCase() === 'sales') || {} as SemanticConcept); }
    }
    ontology.concepts.forEach(concept => {
        const matchFound = concept.synonyms?.some(syn => lowerQuery.includes(syn.toLowerCase())) || lowerQuery.includes(concept.name.toLowerCase());
        if (matchFound && !matchedConcepts.includes(concept)) { matchedConcepts.push(concept); }
    });
    return {
        intent: intent, parameters: parameters, confidence: Math.random() * 0.3 + 0.6,
        matchedConcepts: matchedConcepts.filter(Boolean), originalQuery: query, processedTimestamp: new Date().toISOString(),
    };
}

export function applySchemaValidation(data: any[], schema: DataSchema): DataValidationReportEntry[] {
    const reports: DataValidationReportEntry[] = []; if (!data || data.length === 0) return reports;
    schema.fields.forEach(fieldDef => {
        const fieldName = fieldDef.name; let failedCount = 0; let sampleFailures: any[] = [];
        data.forEach((record, index) => {
            const value = record[fieldName];
            if (!fieldDef.isNullable && (value === null || value === undefined)) { failedCount++; if (sampleFailures.length < 5) sampleFailures.push({ recordIndex: index, value: value, issue: 'non-nullable-null' }); return; }
            if (value !== null && value !== undefined) {
                let typeMismatch = false;
                switch (fieldDef.type) {
                    case 'string': if (typeof value !== 'string') typeMismatch = true; break;
                    case 'number': if (typeof value !== 'number') typeMismatch = true; break;
                    case 'boolean': if (typeof value !== 'boolean') typeMismatch = true; break;
                    case 'date': case 'datetime': if (isNaN(new Date(value).getTime())) typeMismatch = true; break;
                    case 'object': if (typeof value !== 'object' || Array.isArray(value)) typeMismatch = true; break;
                    case 'array': if (!Array.isArray(value)) typeMismatch = true; break;
                }
                if (typeMismatch) { failedCount++; if (sampleFailures.length < 5) sampleFailures.push({ recordIndex: index, value: value, issue: `type-mismatch-${fieldDef.type}` }); }
            }
        });
        if (failedCount > 0) {
            reports.push({
                ruleId: `schema-field-type-${fieldName}`, status: 'failed', severity: 'error',
                message: `Field '${fieldName}' has ${failedCount} type/nullability mismatches (expected: ${fieldDef.type}, nullable: ${fieldDef.isNullable}).`,
                recordsAffected: failedCount, sampleData: sampleFailures, field: fieldName, timestamp: new Date().toISOString()
            });
        } else { reports.push({ ruleId: `schema-field-type-${fieldName}`, status: 'passed', severity: 'info', message: `Field '${fieldName}' conforms to schema.`, timestamp: new Date().toISOString() }); }
    });
    return reports;
}

export class DataProcessorEngine {
    private logger: UniversalDataLogger;

    constructor(userId?: string) {
        this.logger = new UniversalDataLogger('DataProcessorEngine', userId);
    }

    async executeTransformationStep(data: any[], step: DataTransformationStep): Promise<any[]> {
        const handler = TransformationFunctionRegistry.get(step.operation);
        if (!handler) { throw new Error(`Unknown transformation operation: ${step.operation}`); }
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
        this.logger.log({ eventType: 'pipeline_start', transformationId: pipelineConfig.id, description: `Starting pipeline '${pipelineConfig.name}'.`, inputSources: [dataSource.id], outputDestinations: [], pipelineRunId: `run-${Date.now()}` });
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
            this.logger.log({ eventType: 'fetch', transformationId: 'simulate_fetch', description: `Fetched ${rawData.length} records.`, inputSources: [dataSource.id], outputDestinations: ['raw_data_buffer'], recordsAffected: rawData.length, status: DataOperationStatus.Success });

            if (schema) {
                schemaValidationReports = applySchemaValidation(rawData, schema);
                this.logger.log({ eventType: 'validate', transformationId: 'schema_validation', description: 'Raw data schema validated.', inputSources: ['raw_data_buffer'], outputDestinations: ['schema_report'], recordsAffected: rawData.length, status: DataOperationStatus.Success });
            }

            processedData = [...rawData];
            for (const step of pipelineConfig.steps.sort((a, b) => (a.order || 0) - (b.order || 0))) {
                if (abortSignal?.aborted) { pipelineExecutionLog.push({ stepId: step.id, operation: step.operation, status: DataOperationStatus.Aborted, message: 'Pipeline aborted.', timestamp: new Date().toISOString() }); break; }
                if (!step.isEnabled) { pipelineExecutionLog.push({ stepId: step.id, operation: step.operation, status: DataOperationStatus.Skipped, message: 'Step is disabled.', timestamp: new Date().toISOString() }); continue; }
                const startTime = Date.now();
                try {
                    const stepResult = await this.executeTransformationStep(processedData, step);
                    processedData = stepResult;
                    pipelineExecutionLog.push({ stepId: step.id, operation: step.operation, status: DataOperationStatus.Success, message: `Applied ${step.operation}.`, timestamp: new Date().toISOString(), durationMs: Date.now() - startTime });
                    this.logger.log({ eventType: 'transform', transformationId: step.id, description: `Step ${step.operation} executed.`, inputSources: ['previous_step_output'], outputDestinations: ['current_step_output'], recordsAffected: processedData.length, status: DataOperationStatus.Success, parametersUsed: step.parameters });
                } catch (error: any) {
                    pipelineExecutionLog.push({ stepId: step.id, operation: step.operation, status: DataOperationStatus.Failed, message: `Error in ${step.operation}.`, error: error.message, timestamp: new Date().toISOString(), durationMs: Date.now() - startTime });
                    this.logger.log({ eventType: 'transform', transformationId: step.id, description: `Step ${step.operation} failed.`, inputSources: ['previous_step_output'], outputDestinations: ['error_log'], recordsAffected: processedData.length, status: DataOperationStatus.Failed, parametersUsed: step.parameters, error: error.message });
                    throw error;
                }
            }

            validationReports = validateDataAgainstProfile(processedData, validationProfile);
            this.logger.log({ eventType: 'validate', transformationId: validationProfile.id, description: 'Processed data validated.', inputSources: ['pipeline_output'], outputDestinations: ['validation_report'], recordsAffected: processedData.length, status: DataOperationStatus.Success });

            if (semanticLayerConfig?.ontologyId) {
                const mockOntology: OntologyDefinition = {
                    id: semanticLayerConfig.ontologyId, name: 'Universal Business Ontology', version: '1.0',
                    concepts: [
                        { id: 'revenue', name: 'Revenue', type: 'measure', dataType: 'number', unit: 'USD', aggregationHint: 'sum', sourceMappings: [{ dataSourceId: dataSource.id, fieldName: 'value' }], synonyms: ['income', 'sales'] },
                        { id: 'customer_email', name: 'Customer Email', type: 'attribute', dataType: 'string', sourceMappings: [{ dataSourceId: dataSource.id, fieldName: 'email' }], tags: ['PII'] },
                        { id: 'transaction_amount', name: 'Transaction Amount', type: 'measure', dataType: 'number', unit: 'USD', sourceMappings: [{ dataSourceId: dataSource.id, fieldName: 'amount' }] },
                        { id: 'transaction_date', name: 'Transaction Date', type: 'time', dataType: 'date', sourceMappings: [{ dataSourceId: dataSource.id, fieldName: 'recordDate' }] },
                        { id: 'customer_address', name: 'Customer Address', type: 'attribute', dataType: 'string', sourceMappings: [{ dataSourceId: dataSource.id, fieldName: 'customerAddress' }], tags: ['PII'] },
                    ],
                    glossary: { 'revenue': 'Total income from sales.', 'kpi': 'Key performance indicator.' }
                };
                semanticMappedData = applySemanticMapping(processedData, mockOntology, semanticLayerConfig);
                this.logger.log({ eventType: 'semantic_map', transformationId: 'semantic_mapping', description: 'Data mapped to semantic concepts.', inputSources: ['pipeline_output'], outputDestinations: ['semantic_mapped_data'], recordsAffected: semanticMappedData.length, status: DataOperationStatus.Success });

                enrichedData = await enrichWithSemanticContext(semanticMappedData, mockOntology, semanticLayerConfig);
                processedData = enrichedData;
                this.logger.log({ eventType: 'enrich', transformationId: 'semantic_enrichment', description: 'Data enriched with semantic context.', inputSources: ['semantic_mapped_data'], outputDestinations: ['enriched_output'], recordsAffected: enrichedData.length, status: DataOperationStatus.Success });
            }

            dataQualityMetrics = this.assessDataQuality(processedData, schema || { id: 'default', version: '1.0', name: 'default_schema', fields: [] }, validationReports);
            this.logger.log({ eventType: 'audit', transformationId: 'data_quality_assessment', description: 'Data quality assessed.', inputSources: ['final_data'], outputDestinations: ['quality_report'], status: DataOperationStatus.Success });

            piiReports = this.detectPIIFields(processedData);
            this.logger.log({ eventType: 'audit', transformationId: 'pii_detection', description: 'PII fields detected.', inputSources: ['final_data'], outputDestinations: ['pii_report'], status: DataOperationStatus.Success });

            this.logger.log({ eventType: 'pipeline_end', transformationId: pipelineConfig.id, description: 'Pipeline completed successfully.', inputSources: [], outputDestinations: ['final_output'], status: DataOperationStatus.Success });
            await this.logger.persistLogs();

            return {
                finalData: processedData, transformationResult: { transformedData: processedData, pipelineExecutionLog, dataValidationReports: validationReports },
                semanticMappedData, enrichedData, validationReports, schemaValidationReports, dataQualityMetrics, piiReports,
            };

        } catch (error: any) {
            this.logger.log({ eventType: 'pipeline_end', transformationId: pipelineConfig.id, description: `Pipeline failed: ${error.message}`, inputSources: [], outputDestinations: ['error_channel'], status: DataOperationStatus.Failed, error: error.message });
            await this.logger.persistLogs();
            throw error;
        }
    }

    private assessDataQuality(data: any[], schema: DataSchema, validationReports: DataValidationReportEntry[]): DataQualityMetricResult[] {
        const metrics: DataQualityMetricResult[] = [];
        if (data.length === 0) return metrics;

        let totalExpectedValues = data.length * schema.fields.length; let totalPresentValues = 0;
        data.forEach(record => { schema.fields.forEach(fieldDef => { if (record[fieldDef.name] !== null && record[fieldDef.name] !== undefined) { totalPresentValues++; } }); });
        const completenessScore = totalExpectedValues > 0 ? (totalPresentValues / totalExpectedValues) * 100 : 100;
        metrics.push({ metricName: 'completeness', score: parseFloat(completenessScore.toFixed(2)), description: `Overall completeness.`, details: { present: totalPresentValues, expected: totalExpectedValues }, timestamp: new Date().toISOString(), grade: completenessScore > 95 ? 'A' : completenessScore > 80 ? 'B' : 'C' });

        const failedRulesCount = validationReports.filter(r => r.status === 'failed' && r.severity === 'error').length;
        const totalRulesCount = validationReports.filter(r => r.status !== 'ignored').length;
        const validityScore = totalRulesCount > 0 ? ((totalRulesCount - failedRulesCount) / totalRulesCount) * 100 : 100;
        metrics.push({ metricName: 'validity', score: parseFloat(validityScore.toFixed(2)), description: `Passed error-severity validation rules.`, details: { passedRules: totalRulesCount - failedRulesCount, totalRules: totalRulesCount }, timestamp: new Date().toISOString(), grade: validityScore > 90 ? 'A' : validityScore > 70 ? 'B' : 'C' });

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
            if (lowerFieldName.includes('email') || fieldValues.some(v => v.includes('@') && v.includes('.'))) { isPII = true; category = 'email'; detectionMethod = 'regex'; confidence = 0.9; }
            else if (lowerFieldName.includes('name') && fieldValues.some(v => v.split(' ').length > 1)) { isPII = true; category = 'name'; confidence = 0.7; }
            else if (lowerFieldName.includes('address') || fieldValues.some(v => /\d+\s\w+\s(street|avenue|road|st|ave|rd)/i.test(v))) { isPII = true; category = 'address'; detectionMethod = 'regex'; confidence = 0.8; }
            else if (lowerFieldName.includes('phone') || fieldValues.some(v => /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(v))) { isPII = true; category = 'phone'; detectionMethod = 'regex'; confidence = 0.8; }
            else if (lowerFieldName.includes('ssn') || fieldValues.some(v => /^\d{3}-\d{2}-\d{4}$/.test(v))) { isPII = true; category = 'ssn'; detectionMethod = 'regex'; confidence = 0.95; }
            else if (lowerFieldName.includes('id') && !lowerFieldName.includes('productid') && !lowerFieldName.includes('orderid')) { isPII = true; category = 'identifier'; confidence = 0.6; }
            if (isPII) {
                piiReports.push({
                    fieldName, isPII, category, detectionMethod, confidence: parseFloat(confidence.toFixed(2)),
                    sampleValues: fieldValues.slice(0, 3), timestamp: new Date().toISOString(), riskLevel: confidence > 0.8 ? 'high' : 'medium',
                    mitigationSuggestions: ['Anonymize field', 'Mask data', 'Restrict access']
                });
            }
        });
        return piiReports;
    }
}