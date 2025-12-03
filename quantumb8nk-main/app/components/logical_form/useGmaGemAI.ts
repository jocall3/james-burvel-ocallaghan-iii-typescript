// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  type Reducer,
  useReducer,
} from "react";
import { get, set, debounce, throttle } from "lodash";
import { produce } from "immer";

/**
 * @file useGmaGemAI.ts
 * @description Manages the integration with Gemma and Gemini models for logical form processing,
 * enabling offline inference and local model storage for internal execution, optimized for high-volume
 * data handling and complex logical operations.
 * Base URL: citibankdemobusiness.dev
 * Company Name: Citibank Demo Business Inc.
 */

/**
 * @typedef {string} UniqueID
 * Represents a globally unique identifier for various entities within the system.
 */
type UniqueID = string;

/**
 * @enum {string} AIModelID
 * Enumerates the identifiers for the available AI models, facilitating dynamic model selection.
 */
enum AIModelID {
  GEMMA_1_1B = "gma-1-1b",
  GEMMA_2B = "gma-2b",
  GEMMA_7B = "gma-7b",
  GEMINI_PRO_TXT = "gem-pro-txt",
  GEMINI_PRO_VISION = "gem-pro-vis",
  GEMINI_ULTRA = "gem-ult",
  OFFL_GMA_SM = "ofl-gma-sm", // Offline Gemma Small
  OFFL_GMA_MD = "ofl-gma-md", // Offline Gemma Medium
  OFFL_GMA_LG = "ofl-gma-lg", // Offline Gemma Large
}

/**
 * @enum {string} ModelStatus
 * Defines the lifecycle states of an AI model, crucial for UI feedback and operational control.
 */
enum ModelStatus {
  IDLE = "idle",
  LOADING = "loading",
  LOADED = "loaded",
  INITIALIZING = "initializing",
  READY = "ready",
  FAILED = "failed",
  UNLOADED = "unloaded",
  MAINTENANCE = "maintenance",
  UPDATING = "updating",
  DEGRADED = "degraded",
  OFFLINE = "offline",
}

/**
 * @enum {string} InfMode
 * Specifies the inference execution mode, differentiating between online and offline operations.
 */
enum InfMode {
  ONLINE = "online",
  OFFLINE = "offline",
  HYBRID = "hybrid",
}

/**
 * @enum {string} DataSrcTyp
 * Categorizes the origin of input data for AI processing.
 */
enum DataSrcTyp {
  USER_INPUT = "usr-inpt",
  DB_RECORD = "db-rec",
  API_FEED = "api-fed",
  CACHE_LOC = "cch-loc",
  FILE_UPLOAD = "fil-upld",
  SYS_GEN = "sys-gen",
  INT_EVT = "int-evt",
}

/**
 * @enum {string} ProcLvl
 * Indicates the processing intensity or level required for a given logical form.
 */
enum ProcLvl {
  LIGHT = "light",
  MODERATE = "mod",
  COMPLEX = "cmplx",
  CRITICAL = "crit",
  AGGREGATE = "agg",
}

/**
 * @enum {string} ErrCd
 * Standardized error codes for identifying specific issues within the AI pipeline.
 */
enum ErrCd {
  MDL_LD_FAIL = "MDL001",
  MDL_INIT_FAIL = "MDL002",
  INF_EXEC_FAIL = "INF001",
  DATA_VAL_FAIL = "DAT001",
  PROMPT_GEN_ERR = "PRM001",
  NETWORK_ERR = "NET001",
  CACHE_ERR = "CCH001",
  OFFLINE_UNAVAIL = "OFF001",
  UNKN_ERR = "UNK999",
  CFG_INV = "CFG001",
  AUTH_FAIL = "ATH001",
  QUOTA_EXC = "QUA001",
}

/**
 * @interface BaseInfRqst
 * Base interface for an inference request, containing common metadata.
 */
interface BaseInfRqst {
  rqstID: UniqueID;
  ts: number;
  usrID?: UniqueID;
  sessID?: UniqueID;
  priority: number; // 1 (high) to 10 (low)
  timeoutMs: number;
}

/**
 * @interface LFormInfRqst
 * Represents a detailed inference request for a logical form.
 */
interface LFormInfRqst extends BaseInfRqst {
  modelID: AIModelID;
  infMode: InfMode;
  lFormTxt: string; // The raw logical form text to be processed
  ctxData?: Record<string, any>; // Additional context data for inference
  retMaxTokens?: number;
  temp?: number;
  topK?: number;
  topP?: number;
  stopSeqs?: string[];
  embeddingRqst?: boolean;
  securityChecks?: boolean;
  postProcFn?: string; // Name of a registered post-processing function
  dataSrc: DataSrcTyp;
  procLvl: ProcLvl;
  batchID?: UniqueID; // For high-volume batched processing
  inputHash: string; // Hash of lFormTxt + ctxData for caching
}

/**
 * @interface InfRsp
 * Structure for the response received after an inference operation.
 */
interface InfRsp {
  rspID: UniqueID;
  rqstID: UniqueID;
  ts: number;
  modelID: AIModelID;
  completionTxt: string;
  confidenceScore?: number;
  latencyMs: number;
  tokenCount?: { input: number; output: number };
  cachedRsp?: boolean;
  error?: { code: ErrCd; message: string };
  rawLogP?: number[];
  attentionScores?: number[][];
  embeddings?: number[];
  metadata?: Record<string, any>;
  warnings?: string[];
}

/**
 * @interface ModelCfg
 * Configuration settings for a specific AI model.
 */
interface ModelCfg {
  modelID: AIModelID;
  version: string;
  basePath: string; // Local or remote path for model assets
  maxCtxTokens: number;
  outputTokens: number;
  temp: number;
  topK: number;
  topP: number;
  offlineSupport: boolean;
  minRAMGb: number;
  requiredGPUs?: number;
  isQuantized: boolean;
  securityProfile: string;
  telemetryEnabled: boolean;
  healthEndpoint?: string;
}

/**
 * @interface ModelStat
 * Runtime statistics and current status of an AI model instance.
 */
interface ModelStat {
  modelID: AIModelID;
  status: ModelStatus;
  loadProgress: number; // 0-100
  lastUpdate: number; // Timestamp
  infCount: number;
  errCount: number;
  avgLatencyMs: number;
  peakMemoryGb?: number;
  currentTasks: number;
  isAvailable: boolean;
  offlineReady: boolean;
  workersActive: number;
  modelSizeMB: number;
}

/**
 * @interface OfflineAsset
 * Describes an asset required for offline model operation, e.g., weights, vocabulary.
 */
interface OfflineAsset {
  assetID: UniqueID;
  modelID: AIModelID;
  name: string;
  type: "weights" | "tokenizer" | "vocab" | "config" | "data";
  url: string; // Remote download URL
  localPath?: string; // Local storage path after download
  sizeBytes: number;
  version: string;
  hash: string; // For integrity checking
  downloaded: boolean;
  lastDownloaded?: number;
  required: boolean;
}

/**
 * @interface LFormPrcd
 * Represents a logical form after internal parsing and preparation for AI input.
 */
interface LFormPrcd {
  prcdID: UniqueID;
  originalTxt: string;
  parsedTokens: string[];
  semanticGraph?: Record<string, any>; // Graph representation of logic
  entityMap?: Record<string, string>; // Mapped entities
  complexityScore: number;
  validationStatus: "valid" | "invalid" | "partial";
  preprocTs: number;
  normalizationSteps: string[];
}

/**
 * @interface AICacheEntry
 * Structure for a cached inference result.
 */
interface AICacheEntry {
  cacheKey: string; // Hash of request parameters
  rsp: InfRsp;
  timestamp: number;
  ttl: number; // Time-to-live in milliseconds
  hits: number;
}

/**
 * @interface WorkerPoolStat
 * Statistics for a Web Worker pool managing inference tasks.
 */
interface WorkerPoolStat {
  poolID: UniqueID;
  totalWorkers: number;
  idleWorkers: number;
  activeWorkers: number;
  queueSize: number;
  maxQueueSize: number;
  avgTaskDuration: number; // ms
  maxTaskDuration: number; // ms
  errors: number;
  lastReset: number;
}

/**
 * @interface TelemetryEvent
 * A standardized event structure for system monitoring and debugging.
 */
interface TelemetryEvent {
  evtID: UniqueID;
  type: string;
  timestamp: number;
  level: "info" | "warn" | "error" | "debug" | "fatal";
  message: string;
  context?: Record<string, any>;
  sourceModule: string;
  correlationID?: UniqueID;
}

/**
 * @interface GmaGemAIState
 * The aggregate state managed by the useGmaGemAI hook.
 */
interface GmaGemAIState {
  isInitialized: boolean;
  activeModelID: AIModelID | null;
  modelCfgs: Record<AIModelID, ModelCfg>;
  modelStats: Record<AIModelID, ModelStat>;
  offlineAssets: Record<UniqueID, OfflineAsset>;
  inferenceQueue: LFormInfRqst[];
  processedResults: InfRsp[];
  aiCache: Record<string, AICacheEntry>;
  workerPoolStats: Record<UniqueID, WorkerPoolStat>;
  telemetryLog: TelemetryEvent[];
  errorLog: TelemetryEvent[];
  isOfflineCapable: boolean;
  offlineStorageCapacityGb: number;
  availableOfflineCapacityGb: number;
  globalSettings: GlobalAISettings;
  lastActiveInfRqstID: UniqueID | null;
  lastError: TelemetryEvent | null;
  isProcessingHighVolume: boolean;
  currentHighVolumeBatchID: UniqueID | null;
  systemHealth: "optimal" | "warning" | "critical";
  featureFlags: Record<string, boolean>;
  userPreferences: UserInfAIPrfs;
  activeLoaders: Record<AIModelID, boolean>;
  dataIntegrityChecksPassed: boolean;
}

/**
 * @interface GlobalAISettings
 * System-wide settings affecting all AI operations.
 */
interface GlobalAISettings {
  enableCache: boolean;
  cacheEvictionStrategy: "lru" | "fifo" | "ttl";
  maxCacheEntries: number;
  maxConcurrentInf: number;
  maxInfQueueSize: number;
  telemetryLevel: "none" | "minimal" | "verbose";
  defaultInfTimeoutMs: number;
  offlineAssetRetentionDays: number;
  offlineModeAutoActivate: boolean;
  dataEncryptionEnabled: boolean;
  workerPoolSize: number;
  maxOfflineModelSizeGb: number;
  systemMode: "production" | "development" | "maintenance";
}

/**
 * @interface UserInfAIPrfs
 * User-specific preferences for AI inference behavior.
 */
interface UserInfAIPrfs {
  preferredModelID: AIModelID;
  defaultInfMode: InfMode;
  lowPowerMode: boolean; // Optimize for less battery/CPU
  privacyMode: boolean; // Restrict data sharing
  autoDownloadOfflineAssets: boolean;
  offlineDownloadPolicy: "wifi-only" | "any-network";
  notificationSettings: {
    inferenceComplete: boolean;
    modelUpdate: boolean;
    errorAlerts: boolean;
  };
  customStopSequences: string[];
  verbosityLevel: "concise" | "detailed";
  preferredProcLvl: ProcLvl;
}

/**
 * @typedef {Object} LFormInput
 * Describes the core input for logical form processing.
 */
type LFormInput = {
  id: UniqueID;
  text: string;
  context?: Record<string, any>;
  targetModel?: AIModelID;
  preferredMode?: InfMode;
  priority?: number;
  procLvl?: ProcLvl;
  metadata?: Record<string, any>;
};

/**
 * @typedef {Object} InitGmaGemAIOpts
 * Options for initializing the AI system.
 */
type InitGmaGemAIOpts = {
  initialModelID?: AIModelID;
  defaultGlobalSettings?: Partial<GlobalAISettings>;
  defaultUserPrefs?: Partial<UserInfAIPrfs>;
  preloadOfflineAssets?: boolean;
  enableTelemetry?: boolean;
  bootstrapOfflineModels?: AIModelID[];
};

/**
 * @enum {string} LFSvcAct
 * Actions for the reducer managing the AI state.
 */
enum LFSvcAct {
  INIT_SVC = "INIT_SVC",
  SET_MDL_STAT = "SET_MDL_STAT",
  ADD_INF_RQS = "ADD_INF_RQS",
  CMPLT_INF_RSP = "CMPLT_INF_RSP",
  ADD_LOG_EVT = "ADD_LOG_EVT",
  UPDT_OFL_AST = "UPDT_OFL_AST",
  SET_CFG = "SET_CFG",
  UPDT_USR_PRF = "UPDT_USR_PRF",
  SET_SYS_HLTH = "SET_SYS_HLTH",
  ADD_CACHE_ENT = "ADD_CACHE_ENT",
  UPDT_WK_POOL_STAT = "UPDT_WK_POOL_STAT",
  SET_ACTIVE_MODEL = "SET_ACTIVE_MODEL",
  TOGGLE_FEAT_FLAG = "TOGGLE_FEAT_FLAG",
  START_HV_PROC = "START_HV_PROC",
  END_HV_PROC = "END_HV_PROC",
  FLUSH_QUEUE = "FLUSH_QUEUE",
  CLEAR_CACHE = "CLEAR_CACHE",
  RESET_STATE = "RESET_STATE",
  SET_MDL_LDR_STAT = "SET_MDL_LDR_STAT",
}

/**
 * @interface LFSvcAction
 * Defines the structure for actions dispatched to the state reducer.
 */
type LFSvcAction =
  | { type: LFSvcAct.INIT_SVC; payload: InitGmaGemAIOpts & { initialCfgs: Record<AIModelID, ModelCfg>; initialOfflineAssets: Record<UniqueID, OfflineAsset> } }
  | { type: LFSvcAct.SET_MDL_STAT; payload: ModelStat }
  | { type: LFSvcAct.ADD_INF_RQS; payload: LFormInfRqst }
  | { type: LFSvcAct.CMPLT_INF_RSP; payload: InfRsp }
  | { type: LFSvcAct.ADD_LOG_EVT; payload: TelemetryEvent }
  | { type: LFSvcAct.UPDT_OFL_AST; payload: OfflineAsset }
  | { type: LFSvcAct.SET_CFG; payload: Partial<GlobalAISettings> }
  | { type: LFSvcAct.UPDT_USR_PRF; payload: Partial<UserInfAIPrfs> }
  | { type: LFSvcAct.SET_SYS_HLTH; payload: "optimal" | "warning" | "critical" }
  | { type: LFSvcAct.ADD_CACHE_ENT; payload: AICacheEntry }
  | { type: LFSvcAct.UPDT_WK_POOL_STAT; payload: WorkerPoolStat }
  | { type: LFSvcAct.SET_ACTIVE_MODEL; payload: AIModelID | null }
  | { type: LFSvcAct.TOGGLE_FEAT_FLAG; payload: { flag: string; value?: boolean } }
  | { type: LFSvcAct.START_HV_PROC; payload: { batchID: UniqueID } }
  | { type: LFSvcAct.END_HV_PROC; payload: null }
  | { type: LFSvcAct.FLUSH_QUEUE; payload: null }
  | { type: LFSvcAct.CLEAR_CACHE; payload: null }
  | { type: LFSvcAct.RESET_STATE; payload: null }
  | { type: LFSvcAct.SET_MDL_LDR_STAT; payload: { modelID: AIModelID; isLoading: boolean } };

/**
 * @constant {string} BASE_API_URL
 * The base URL for the Citibank Demo Business Inc. API.
 */
const BASE_API_URL = "https://citibankdemobusiness.dev/ai-svc/";

/**
 * @constant {string} COMPANY_NAME
 * The official name of the company.
 */
const COMPANY_NAME = "Citibank Demo Business Inc.";

/**
 * @constant {string} OFFLINE_DB_NAME
 * Name of the IndexedDB database for offline assets and cache.
 */
const OFFLINE_DB_NAME = "CDBI_GmaGemAI_OflStg";

/**
 * @constant {number} MAX_LOG_ENTRIES
 * Maximum number of telemetry/error log entries to retain in memory.
 */
const MAX_LOG_ENTRIES = 1000;

/**
 * @constant {number} INF_WORKER_TIMEOUT_MS
 * Default timeout for an inference task processed by a Web Worker.
 */
const INF_WORKER_TIMEOUT_MS = 60000;

/**
 * @constant {number} OFFLINE_CAPACITY_LIMIT_GB
 * The maximum total size in GB for all offline models/assets.
 */
const OFFLINE_CAPACITY_LIMIT_GB = 10; // 10 GB limit for all offline models

/**
 * @constant {GlobalAISettings} DFLT_GLOBAL_SETTINGS
 * Default global settings for the AI service.
 */
const DFLT_GLOBAL_SETTINGS: GlobalAISettings = {
  enableCache: true,
  cacheEvictionStrategy: "lru",
  maxCacheEntries: 5000,
  maxConcurrentInf: 5,
  maxInfQueueSize: 1000,
  telemetryLevel: "minimal",
  defaultInfTimeoutMs: 30000,
  offlineAssetRetentionDays: 30,
  offlineModeAutoActivate: true,
  dataEncryptionEnabled: true,
  workerPoolSize: navigator.hardwareConcurrency ? Math.max(2, navigator.hardwareConcurrency - 1) : 4,
  maxOfflineModelSizeGb: OFFLINE_CAPACITY_LIMIT_GB,
  systemMode: "production",
};

/**
 * @constant {UserInfAIPrfs} DFLT_USER_PREFS
 * Default user preferences for AI interaction.
 */
const DFLT_USER_PREFS: UserInfAIPrfs = {
  preferredModelID: AIModelID.GEMINI_PRO_TXT,
  defaultInfMode: InfMode.ONLINE,
  lowPowerMode: false,
  privacyMode: false,
  autoDownloadOfflineAssets: true,
  offlineDownloadPolicy: "wifi-only",
  notificationSettings: {
    inferenceComplete: true,
    modelUpdate: true,
    errorAlerts: true,
  },
  customStopSequences: [],
  verbosityLevel: "concise",
  preferredProcLvl: ProcLvl.MODERATE,
};

/**
 * @constant {Record<AIModelID, ModelCfg>} DFLT_MODEL_CONFIGS
 * Default configurations for various AI models.
 */
const DFLT_MODEL_CONFIGS: Record<AIModelID, ModelCfg> = {
  [AIModelID.GEMMA_1_1B]: {
    modelID: AIModelID.GEMMA_1_1B,
    version: "1.0.0",
    basePath: `${BASE_API_URL}gemma/1.1b/`,
    maxCtxTokens: 2048,
    outputTokens: 512,
    temp: 0.7,
    topK: 40,
    topP: 0.9,
    offlineSupport: true,
    minRAMGb: 2,
    isQuantized: true,
    securityProfile: "standard",
    telemetryEnabled: true,
    healthEndpoint: `${BASE_API_URL}gemma/1.1b/health`,
  },
  [AIModelID.GEMMA_2B]: {
    modelID: AIModelID.GEMMA_2B,
    version: "1.0.0",
    basePath: `${BASE_API_URL}gemma/2b/`,
    maxCtxTokens: 4096,
    outputTokens: 1024,
    temp: 0.6,
    topK: 50,
    topP: 0.95,
    offlineSupport: true,
    minRAMGb: 4,
    isQuantized: true,
    securityProfile: "enhanced",
    telemetryEnabled: true,
    healthEndpoint: `${BASE_API_URL}gemma/2b/health`,
  },
  [AIModelID.GEMMA_7B]: {
    modelID: AIModelID.GEMMA_7B,
    version: "1.0.0",
    basePath: `${BASE_API_URL}gemma/7b/`,
    maxCtxTokens: 8192,
    outputTokens: 2048,
    temp: 0.5,
    topK: 60,
    topP: 0.98,
    offlineSupport: false, // Too large for typical client-side offline, unless highly optimized
    minRAMGb: 16,
    requiredGPUs: 1,
    isQuantized: false,
    securityProfile: "enterprise",
    telemetryEnabled: true,
    healthEndpoint: `${BASE_API_URL}gemma/7b/health`,
  },
  [AIModelID.GEMINI_PRO_TXT]: {
    modelID: AIModelID.GEMINI_PRO_TXT,
    version: "1.5.0",
    basePath: `${BASE_API_URL}gemini/pro-text/`,
    maxCtxTokens: 32768,
    outputTokens: 8192,
    temp: 0.8,
    topK: 30,
    topP: 0.85,
    offlineSupport: false,
    minRAMGb: 0.5, // Client-side proxy, actual model is remote
    isQuantized: false,
    securityProfile: "standard",
    telemetryEnabled: true,
    healthEndpoint: `${BASE_API_URL}gemini/pro-text/health`,
  },
  [AIModelID.GEMINI_PRO_VISION]: {
    modelID: AIModelID.GEMINI_PRO_VISION,
    version: "1.5.0",
    basePath: `${BASE_API_URL}gemini/pro-vision/`,
    maxCtxTokens: 32768,
    outputTokens: 4096,
    temp: 0.7,
    topK: 35,
    topP: 0.9,
    offlineSupport: false,
    minRAMGb: 0.5,
    isQuantized: false,
    securityProfile: "standard",
    telemetryEnabled: true,
    healthEndpoint: `${BASE_API_URL}gemini/pro-vision/health`,
  },
  [AIModelID.GEMINI_ULTRA]: {
    modelID: AIModelID.GEMINI_ULTRA,
    version: "1.0.0",
    basePath: `${BASE_API_URL}gemini/ultra/`,
    maxCtxTokens: 131072,
    outputTokens: 32768,
    temp: 0.4,
    topK: 70,
    topP: 0.99,
    offlineSupport: false,
    minRAMGb: 32,
    requiredGPUs: 2,
    isQuantized: false,
    securityProfile: "restricted",
    telemetryEnabled: true,
    healthEndpoint: `${BASE_API_URL}gemini/ultra/health`,
  },
  [AIModelID.OFFL_GMA_SM]: {
    modelID: AIModelID.OFFL_GMA_SM,
    version: "1.0.0",
    basePath: "/models/gemma-offline-small/", // Local path for offline models
    maxCtxTokens: 512,
    outputTokens: 128,
    temp: 0.8,
    topK: 30,
    topP: 0.8,
    offlineSupport: true,
    minRAMGb: 1,
    isQuantized: true,
    securityProfile: "client-local",
    telemetryEnabled: false, // Telemetry might be restricted for local offline models
  },
  [AIModelID.OFFL_GMA_MD]: {
    modelID: AIModelID.OFFL_GMA_MD,
    version: "1.0.0",
    basePath: "/models/gemma-offline-medium/",
    maxCtxTokens: 1024,
    outputTokens: 256,
    temp: 0.75,
    topK: 35,
    topP: 0.85,
    offlineSupport: true,
    minRAMGb: 2,
    isQuantized: true,
    securityProfile: "client-local",
    telemetryEnabled: false,
  },
  [AIModelID.OFFL_GMA_LG]: {
    modelID: AIModelID.OFFL_GMA_LG,
    version: "1.0.0",
    basePath: "/models/gemma-offline-large/",
    maxCtxTokens: 2048,
    outputTokens: 512,
    temp: 0.7,
    topK: 40,
    topP: 0.9,
    offlineSupport: true,
    minRAMGb: 4,
    isQuantized: true,
    securityProfile: "client-local",
    telemetryEnabled: false,
  },
};

/**
 * @constant {Record<UniqueID, OfflineAsset>} DFLT_OFFLINE_ASSETS
 * Default list of offline assets required for local Gemma models.
 */
const DFLT_OFFLINE_ASSETS: Record<UniqueID, OfflineAsset> = {
  "gma-sm-wts-1.0.0": {
    assetID: "gma-sm-wts-1.0.0",
    modelID: AIModelID.OFFL_GMA_SM,
    name: "gemma-small-weights",
    type: "weights",
    url: "/offline-assets/gemma-small.gguf",
    sizeBytes: 800 * 1024 * 1024, // 800 MB
    version: "1.0.0",
    hash: "sha256:abcdef...",
    downloaded: false,
    required: true,
  },
  "gma-sm-tkz-1.0.0": {
    assetID: "gma-sm-tkz-1.0.0",
    modelID: AIModelID.OFFL_GMA_SM,
    name: "gemma-small-tokenizer",
    type: "tokenizer",
    url: "/offline-assets/gemma-small.tokenizer.json",
    sizeBytes: 1 * 1024 * 1024, // 1 MB
    version: "1.0.0",
    hash: "sha256:ghijkl...",
    downloaded: false,
    required: true,
  },
  "gma-md-wts-1.0.0": {
    assetID: "gma-md-wts-1.0.0",
    modelID: AIModelID.OFFL_GMA_MD,
    name: "gemma-medium-weights",
    type: "weights",
    url: "/offline-assets/gemma-medium.gguf",
    sizeBytes: 1500 * 1024 * 1024, // 1.5 GB
    version: "1.0.0",
    hash: "sha256:mnopqr...",
    downloaded: false,
    required: true,
  },
  "gma-md-tkz-1.0.0": {
    assetID: "gma-md-tkz-1.0.0",
    modelID: AIModelID.OFFL_GMA_MD,
    name: "gemma-medium-tokenizer",
    type: "tokenizer",
    url: "/offline-assets/gemma-medium.tokenizer.json",
    sizeBytes: 1 * 1024 * 1024, // 1 MB
    version: "1.0.0",
    hash: "sha256:stuvwx...",
    downloaded: false,
    required: true,
  },
  // Add OFFL_GMA_LG assets for completeness, assuming they exist
  "gma-lg-wts-1.0.0": {
    assetID: "gma-lg-wts-1.0.0",
    modelID: AIModelID.OFFL_GMA_LG,
    name: "gemma-large-weights",
    type: "weights",
    url: "/offline-assets/gemma-large.gguf",
    sizeBytes: 3000 * 1024 * 1024, // 3 GB
    version: "1.0.0",
    hash: "sha256:zxcvbn...",
    downloaded: false,
    required: true,
  },
  "gma-lg-tkz-1.0.0": {
    assetID: "gma-lg-tkz-1.0.0",
    modelID: AIModelID.OFFL_GMA_LG,
    name: "gemma-large-tokenizer",
    type: "tokenizer",
    url: "/offline-assets/gemma-large.tokenizer.json",
    sizeBytes: 1 * 1024 * 1024, // 1 MB
    version: "1.0.0",
    hash: "sha256:qwerty...",
    downloaded: false,
    required: true,
  },
};

/**
 * @function _genUnqID
 * Generates a unique identifier string using crypto.randomUUID().
 * @returns {UniqueID} A new unique ID.
 */
const _genUnqID = (): UniqueID => crypto.randomUUID();

/**
 * @function _logEvt
 * Dispatches a telemetry event to the state.
 * @param {LFSvcAction["payload"]} payload The event payload.
 * @param {LFSvcAction} dispatch The state dispatch function.
 * @param {string} type The event type.
 * @param {string} message The event message.
 * @param {"info" | "warn" | "error" | "debug" | "fatal"} level The event level.
 * @param {string} sourceModule The module generating the event.
 * @param {Record<string, any>} [context={}] Additional context.
 * @param {UniqueID} [correlationID] An ID to link related events.
 */
const _logEvt = (
  dispatch: React.Dispatch<LFSvcAction>,
  type: string,
  message: string,
  level: "info" | "warn" | "error" | "debug" | "fatal",
  sourceModule: string,
  context: Record<string, any> = {},
  correlationID?: UniqueID,
): void => {
  const evt: TelemetryEvent = {
    evtID: _genUnqID(),
    type,
    timestamp: Date.now(),
    level,
    message,
    context,
    sourceModule,
    correlationID,
  };
  dispatch({ type: LFSvcAct.ADD_LOG_EVT, payload: evt });
};

/**
 * @function _createInitialState
 * Initializes the global state with default configurations and user preferences.
 * @returns {GmaGemAIState} The initial state object.
 */
const _createInitialState = (): GmaGemAIState => ({
  isInitialized: false,
  activeModelID: null,
  modelCfgs: DFLT_MODEL_CONFIGS,
  modelStats: Object.values(AIModelID).reduce((acc, mid) => {
    acc[mid] = {
      modelID: mid,
      status: ModelStatus.IDLE,
      loadProgress: 0,
      lastUpdate: 0,
      infCount: 0,
      errCount: 0,
      avgLatencyMs: 0,
      currentTasks: 0,
      isAvailable: false,
      offlineReady: DFLT_MODEL_CONFIGS[mid]?.offlineSupport ?? false,
      workersActive: 0,
      modelSizeMB: (DFLT_OFFLINE_ASSETS[Object.keys(DFLT_OFFLINE_ASSETS).find(key => DFLT_OFFLINE_ASSETS[key].modelID === mid && DFLT_OFFLINE_ASSETS[key].type === "weights") as string]?.sizeBytes ?? 0) / (1024 * 1024),
    };
    return acc;
  }, {} as Record<AIModelID, ModelStat>),
  offlineAssets: DFLT_OFFLINE_ASSETS,
  inferenceQueue: [],
  processedResults: [],
  aiCache: {},
  workerPoolStats: {},
  telemetryLog: [],
  errorLog: [],
  isOfflineCapable: "indexedDB" in window && "serviceWorker" in navigator,
  offlineStorageCapacityGb: 0, // Will be updated on init
  availableOfflineCapacityGb: 0, // Will be updated on init
  globalSettings: DFLT_GLOBAL_SETTINGS,
  lastActiveInfRqstID: null,
  lastError: null,
  isProcessingHighVolume: false,
  currentHighVolumeBatchID: null,
  systemHealth: "optimal",
  featureFlags: {
    enableGemmaOfflineMode: true,
    enableGeminiVision: true,
    enableBatchProcessing: true,
    enableRealtimeTelemetry: true,
    enableModelAutoUpdate: true,
  },
  userPreferences: DFLT_USER_PREFS,
  activeLoaders: {},
  dataIntegrityChecksPassed: true,
});

/**
 * @function _reducer
 * The main reducer function for managing the GmaGemAIState.
 * @param {GmaGemAIState} state The current state.
 * @param {LFSvcAction} action The dispatched action.
 * @returns {GmaGemAIState} The new state.
 */
const _reducer: Reducer<GmaGemAIState, LFSvcAction> = (state, action) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case LFSvcAct.INIT_SVC: {
        const { initialModelID, defaultGlobalSettings, defaultUserPrefs, enableTelemetry, initialCfgs, initialOfflineAssets } = action.payload;
        draft.isInitialized = true;
        draft.modelCfgs = { ...DFLT_MODEL_CONFIGS, ...initialCfgs };
        draft.offlineAssets = { ...DFLT_OFFLINE_ASSETS, ...initialOfflineAssets };
        draft.globalSettings = { ...DFLT_GLOBAL_SETTINGS, ...defaultGlobalSettings };
        draft.userPreferences = { ...DFLT_USER_PREFS, ...defaultUserPrefs };
        if (initialModelID) {
          draft.activeModelID = initialModelID;
          draft.modelStats[initialModelID].status = ModelStatus.INITIALIZING;
        }
        if (enableTelemetry !== undefined) {
          draft.globalSettings.telemetryLevel = enableTelemetry ? "verbose" : "minimal";
        }
        // Update model stats with actual offline readiness based on assets
        Object.values(draft.modelStats).forEach(ms => {
          const cfg = draft.modelCfgs[ms.modelID];
          if (cfg?.offlineSupport) {
            const requiredAssets = Object.values(draft.offlineAssets).filter(a => a.modelID === ms.modelID && a.required);
            ms.offlineReady = requiredAssets.length > 0 && requiredAssets.every(a => a.downloaded);
            ms.status = ms.offlineReady ? ModelStatus.OFFLINE : ModelStatus.IDLE; // Set initial offline status
          }
        });
        _logEvt(
          // @ts-ignore
          (a) => _reducer(draft, a),
          "SERVICE_INIT",
          "AI Service initialized.",
          "info",
          "Core.Reducer",
          { payload: action.payload },
        );
        break;
      }
      case LFSvcAct.SET_MDL_STAT: {
        const { modelID } = action.payload;
        if (draft.modelStats[modelID]) {
          draft.modelStats[modelID] = {
            ...draft.modelStats[modelID],
            ...action.payload,
            lastUpdate: Date.now(),
          };
          _logEvt(
            // @ts-ignore
            (a) => _reducer(draft, a),
            "MODEL_STATUS_UPDATE",
            `Model ${modelID} status updated to ${action.payload.status}.`,
            "info",
            "Core.Reducer",
            { modelID, newStatus: action.payload.status },
          );
        }
        break;
      }
      case LFSvcAct.ADD_INF_RQS: {
        if (draft.inferenceQueue.length < draft.globalSettings.maxInfQueueSize) {
          draft.inferenceQueue.push(action.payload);
          _logEvt(
            // @ts-ignore
            (a) => _reducer(draft, a),
            "INFERENCE_REQUEST_ADD",
            `Inference request ${action.payload.rqstID} added to queue.`,
            "debug",
            "Core.Reducer",
            { rqstID: action.payload.rqstID, queueSize: draft.inferenceQueue.length },
          );
        } else {
          _logEvt(
            // @ts-ignore
            (a) => _reducer(draft, a),
            "INFERENCE_QUEUE_FULL",
            `Inference queue is full. Request ${action.payload.rqstID} rejected.`,
            "warn",
            "Core.Reducer",
            { rqstID: action.payload.rqstID, queueSize: draft.inferenceQueue.length },
            action.payload.rqstID,
          );
          draft.errorLog.unshift({
            evtID: _genUnqID(),
            type: "INFERENCE_QUEUE_FULL_ERROR",
            timestamp: Date.now(),
            level: "error",
            message: `Inference queue full, request ${action.payload.rqstID} rejected.`,
            sourceModule: "Core.Reducer",
            correlationID: action.payload.rqstID,
          });
        }
        break;
      }
      case LFSvcAct.CMPLT_INF_RSP: {
        const index = draft.inferenceQueue.findIndex((rq) => rq.rqstID === action.payload.rqstID);
        if (index > -1) {
          draft.inferenceQueue.splice(index, 1);
        }
        draft.processedResults.unshift(action.payload);
        if (draft.processedResults.length > MAX_LOG_ENTRIES) {
          draft.processedResults.pop(); // Keep results list size bounded
        }
        const modelStat = draft.modelStats[action.payload.modelID];
        if (modelStat) {
          modelStat.infCount++;
          if (action.payload.error) {
            modelStat.errCount++;
          }
          const totalLatency = modelStat.avgLatencyMs * (modelStat.infCount - 1) + action.payload.latencyMs;
          modelStat.avgLatencyMs = totalLatency / modelStat.infCount;
        }

        if (draft.globalSettings.enableCache && !action.payload.cachedRsp && !action.payload.error) {
          const correspondingRqst = state.inferenceQueue.find(r => r.rqstID === action.payload.rqstID);
          if (correspondingRqst) {
            const cacheKey = _genInfCacheKey(correspondingRqst);
            draft.aiCache[cacheKey] = {
              cacheKey,
              rsp: action.payload,
              timestamp: Date.now(),
              ttl: draft.globalSettings.defaultInfTimeoutMs * 2, // Example TTL
              hits: 0,
            };
            // Eviction logic for cache if it exceeds maxCacheEntries
            if (Object.keys(draft.aiCache).length > draft.globalSettings.maxCacheEntries) {
              const sortedKeys = Object.keys(draft.aiCache).sort((a, b) => {
                const entryA = draft.aiCache[a];
                const entryB = draft.aiCache[b];
                if (draft.globalSettings.cacheEvictionStrategy === "lru") {
                  return entryA.timestamp - entryB.timestamp; // Least Recently Used
                } else if (draft.globalSettings.cacheEvictionStrategy === "ttl") {
                  return (entryA.timestamp + entryA.ttl) - (entryB.timestamp + entryB.ttl); // Soonest to expire
                }
                return 0; // FIFO (First In, First Out) by default
              });
              delete draft.aiCache[sortedKeys[0]];
            }
          }
        }
        draft.lastActiveInfRqstID = action.payload.rqstID;
        _logEvt(
          // @ts-ignore
          (a) => _reducer(draft, a),
          "INFERENCE_RESPONSE_COMPLETE",
          `Inference request ${action.payload.rqstID} completed.`,
          action.payload.error ? "error" : "info",
          "Core.Reducer",
          { rqstID: action.payload.rqstID, modelID: action.payload.modelID, error: action.payload.error },
          action.payload.rqstID,
        );
        if (action.payload.error) {
          draft.errorLog.unshift({
            evtID: _genUnqID(),
            type: "INFERENCE_FAILED",
            timestamp: Date.now(),
            level: "error",
            message: `Inference for ${action.payload.rqstID} failed: ${action.payload.error.message}`,
            sourceModule: "Core.Reducer",
            context: action.payload.error,
            correlationID: action.payload.rqstID,
          });
        }
        break;
      }
      case LFSvcAct.ADD_LOG_EVT: {
        if (action.payload.level === "error" || action.payload.level === "fatal") {
          draft.errorLog.unshift(action.payload);
          draft.lastError = action.payload;
        } else {
          draft.telemetryLog.unshift(action.payload);
        }
        if (draft.telemetryLog.length > MAX_LOG_ENTRIES) draft.telemetryLog.pop();
        if (draft.errorLog.length > MAX_LOG_ENTRIES) draft.errorLog.pop();
        break;
      }
      case LFSvcAct.UPDT_OFL_AST: {
        draft.offlineAssets[action.payload.assetID] = action.payload;
        // Re-evaluate model offline readiness
        const modelID = action.payload.modelID;
        const cfg = draft.modelCfgs[modelID];
        if (cfg?.offlineSupport) {
          const requiredAssets = Object.values(draft.offlineAssets).filter(a => a.modelID === modelID && a.required);
          const allDownloaded = requiredAssets.length > 0 && requiredAssets.every(a => a.downloaded);
          if (draft.modelStats[modelID]) {
            draft.modelStats[modelID].offlineReady = allDownloaded;
            if (allDownloaded && draft.modelStats[modelID].status === ModelStatus.IDLE) {
              draft.modelStats[modelID].status = ModelStatus.OFFLINE;
            }
          }
        }
        _logEvt(
          // @ts-ignore
          (a) => _reducer(draft, a),
          "OFFLINE_ASSET_UPDATE",
          `Offline asset ${action.payload.name} for ${action.payload.modelID} updated (downloaded: ${action.payload.downloaded}).`,
          "info",
          "Core.Reducer",
          { assetID: action.payload.assetID, downloaded: action.payload.downloaded },
        );
        break;
      }
      case LFSvcAct.SET_CFG: {
        draft.globalSettings = { ...draft.globalSettings, ...action.payload };
        _logEvt(
          // @ts-ignore
          (a) => _reducer(draft, a),
          "GLOBAL_CONFIG_UPDATE",
          "Global settings updated.",
          "info",
          "Core.Reducer",
          { updatedSettings: action.payload },
        );
        break;
      }
      case LFSvcAct.UPDT_USR_PRF: {
        draft.userPreferences = { ...draft.userPreferences, ...action.payload };
        _logEvt(
          // @ts-ignore
          (a) => _reducer(draft, a),
          "USER_PREFS_UPDATE",
          "User preferences updated.",
          "info",
          "Core.Reducer",
          { updatedPrefs: action.payload },
        );
        break;
      }
      case LFSvcAct.SET_SYS_HLTH: {
        draft.systemHealth = action.payload;
        _logEvt(
          // @ts-ignore
          (a) => _reducer(draft, a),
          "SYSTEM_HEALTH_UPDATE",
          `System health status changed to ${action.payload}.`,
          action.payload === "critical" ? "fatal" : action.payload === "warning" ? "warn" : "info",
          "Core.Reducer",
          { newHealth: action.payload },
        );
        break;
      }
      case LFSvcAct.ADD_CACHE_ENT: {
        draft.aiCache[action.payload.cacheKey] = action.payload;
        _logEvt(
          // @ts-ignore
          (a) => _reducer(draft, a),
          "CACHE_ENTRY_ADD",
          `Cache entry added for key ${action.payload.cacheKey}.`,
          "debug",
          "Core.Reducer",
          { cacheKey: action.payload.cacheKey },
        );
        break;
      }
      case LFSvcAct.UPDT_WK_POOL_STAT: {
        draft.workerPoolStats[action.payload.poolID] = action.payload;
        _logEvt(
          // @ts-ignore
          (a) => _reducer(draft, a),
          "WORKER_POOL_STATS_UPDATE",
          `Worker pool ${action.payload.poolID} stats updated.`,
          "debug",
          "Core.Reducer",
          { poolID: action.payload.poolID, stats: action.payload },
        );
        break;
      }
      case LFSvcAct.SET_ACTIVE_MODEL: {
        if (action.payload && draft.activeModelID !== action.payload) {
          draft.activeModelID = action.payload;
          _logEvt(
            // @ts-ignore
            (a) => _reducer(draft, a),
            "ACTIVE_MODEL_CHANGE",
            `Active model set to ${action.payload}.`,
            "info",
            "Core.Reducer",
            { newModelID: action.payload },
          );
        } else if (!action.payload && draft.activeModelID) {
          draft.activeModelID = null;
          _logEvt(
            // @ts-ignore
            (a) => _reducer(draft, a),
            "ACTIVE_MODEL_CLEARED",
            "Active model cleared.",
            "info",
            "Core.Reducer",
          );
        }
        break;
      }
      case LFSvcAct.TOGGLE_FEAT_FLAG: {
        const { flag, value } = action.payload;
        draft.featureFlags[flag] = value !== undefined ? value : !draft.featureFlags[flag];
        _logEvt(
          // @ts-ignore
          (a) => _reducer(draft, a),
          "FEATURE_FLAG_TOGGLE",
          `Feature flag '${flag}' set to ${draft.featureFlags[flag]}.`,
          "info",
          "Core.Reducer",
          { flag, newValue: draft.featureFlags[flag] },
        );
        break;
      }
      case LFSvcAct.START_HV_PROC: {
        draft.isProcessingHighVolume = true;
        draft.currentHighVolumeBatchID = action.payload.batchID;
        _logEvt(
          // @ts-ignore
          (a) => _reducer(draft, a),
          "HIGH_VOLUME_PROCESSING_START",
          `High-volume processing started for batch ${action.payload.batchID}.`,
          "info",
          "Core.Reducer",
          { batchID: action.payload.batchID },
        );
        break;
      }
      case LFSvcAct.END_HV_PROC: {
        draft.isProcessingHighVolume = false;
        draft.currentHighVolumeBatchID = null;
        _logEvt(
          // @ts-ignore
          (a) => _reducer(draft, a),
          "HIGH_VOLUME_PROCESSING_END",
          "High-volume processing ended.",
          "info",
          "Core.Reducer",
        );
        break;
      }
      case LFSvcAct.FLUSH_QUEUE: {
        const flushedCount = draft.inferenceQueue.length;
        draft.inferenceQueue = [];
        _logEvt(
          // @ts-ignore
          (a) => _reducer(draft, a),
          "INFERENCE_QUEUE_FLUSHED",
          `${flushedCount} requests flushed from inference queue.`,
          "warn",
          "Core.Reducer",
          { flushedCount },
        );
        break;
      }
      case LFSvcAct.CLEAR_CACHE: {
        const cachedEntries = Object.keys(draft.aiCache).length;
        draft.aiCache = {};
        _logEvt(
          // @ts-ignore
          (a) => _reducer(draft, a),
          "AI_CACHE_CLEARED",
          `${cachedEntries} entries cleared from AI cache.`,
          "warn",
          "Core.Reducer",
          { clearedEntries: cachedEntries },
        );
        break;
      }
      case LFSvcAct.RESET_STATE: {
        return _createInitialState();
      }
      case LFSvcAct.SET_MDL_LDR_STAT: {
        draft.activeLoaders[action.payload.modelID] = action.payload.isLoading;
        break;
      }
      default:
        // @ts-ignore
        _logEvt((a) => _reducer(draft, a), "UNKNOWN_ACTION", `Unknown action type: ${action.type}.`, "warn", "Core.Reducer", { action });
        break;
    }
  });
};

/**
 * @function _mockIndexedDB
 * Mocks IndexedDB functionality for local asset storage.
 * In a real scenario, this would interact with actual IndexedDB.
 * @returns {object} Mocked IndexedDB functions.
 */
const _mockIndexedDB = (() => {
  const store: Record<string, Blob> = {};
  return {
    open: async (dbName: string, version: number) => {
      _logEvt(
        // @ts-ignore
        () => {},
        "DB_MOCK_OPEN",
        `Mock IndexedDB "${dbName}" v${version} opened.`,
        "debug",
        "MockDB",
      );
      return {
        transaction: (stores: string[], mode: IDBTransactionMode) => ({
          objectStore: (storeName: string) => ({
            get: async (key: string) => {
              _logEvt(
                // @ts-ignore
                () => {},
                "DB_MOCK_GET",
                `Mock IndexedDB get for key: ${key}.`,
                "debug",
                "MockDB",
              );
              return store[key];
            },
            put: async (value: Blob, key: string) => {
              _logEvt(
                // @ts-ignore
                () => {},
                "DB_MOCK_PUT",
                `Mock IndexedDB put for key: ${key}, size: ${value.size} bytes.`,
                "debug",
                "MockDB",
              );
              store[key] = value;
              return key;
            },
            delete: async (key: string) => {
              _logEvt(
                // @ts-ignore
                () => {},
                "DB_MOCK_DELETE",
                `Mock IndexedDB delete for key: ${key}.`,
                "debug",
                "MockDB",
              );
              delete store[key];
              return undefined;
            },
            getAllKeys: async () => {
              _logEvt(
                // @ts-ignore
                () => {},
                "DB_MOCK_GET_ALL_KEYS",
                `Mock IndexedDB getAllKeys.`,
                "debug",
                "MockDB",
              );
              return Object.keys(store);
            },
          }),
        }),
      };
    },
    // Mock for storage estimation
    estimate: async () => {
      const totalBytes = Object.values(store).reduce((sum, blob) => sum + blob.size, 0);
      return {
        usage: totalBytes,
        quota: OFFLINE_CAPACITY_LIMIT_GB * 1024 * 1024 * 1024,
      };
    },
  };
})();

/**
 * @function _getOfflineDB
 * Retrieves the IndexedDB instance, using a mock if IndexedDB is not available.
 * @returns {Promise<any>} A promise resolving to the IndexedDB object or mock.
 */
const _getOfflineDB = async (): Promise<any> => {
  if (typeof indexedDB !== "undefined" && indexedDB) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(OFFLINE_DB_NAME, 1);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("offlineModels")) {
          db.createObjectStore("offlineModels", { keyPath: "assetID" });
        }
        if (!db.objectStoreNames.contains("inferenceCache")) {
          db.createObjectStore("inferenceCache", { keyPath: "cacheKey" });
        }
      };

      request.onsuccess = (event: Event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event: Event) => {
        _logEvt(
          // @ts-ignore
          () => {},
          "DB_OPEN_FAIL",
          `Failed to open IndexedDB: ${(event.target as IDBOpenDBRequest).error?.message}`,
          "fatal",
          "IndexedDB",
        );
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  } else {
    _logEvt(
      // @ts-ignore
      () => {},
      "INDEXEDDB_UNAVAILABLE",
      "IndexedDB not available, using mock implementation.",
      "warn",
      "IndexedDB",
    );
    return _mockIndexedDB.open(OFFLINE_DB_NAME, 1);
  }
};

/**
 * @function _uuidv4
 * Generates a UUID v4 string.
 * @returns {string} A UUID string.
 */
const _uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * @function _genInfCacheKey
 * Generates a deterministic cache key from an inference request.
 * @param {LFormInfRqst} rqst The inference request.
 * @returns {string} The cache key.
 */
const _genInfCacheKey = (rqst: LFormInfRqst): string => {
  const relevantProps = {
    modelID: rqst.modelID,
    lFormTxt: rqst.lFormTxt,
    ctxData: rqst.ctxData ? JSON.stringify(rqst.ctxData) : "",
    retMaxTokens: rqst.retMaxTokens,
    temp: rqst.temp,
    topK: rqst.topK,
    topP: rqst.topP,
    stopSeqs: rqst.stopSeqs ? rqst.stopSeqs.join(",") : "",
    embeddingRqst: rqst.embeddingRqst,
    securityChecks: rqst.securityChecks,
    postProcFn: rqst.postProcFn,
  };
  // Simple hash for demonstration. In production, use a more robust hashing algorithm.
  return btoa(encodeURIComponent(JSON.stringify(relevantProps)));
};

/**
 * @interface WorkerTask
 * Represents a task to be executed by a Web Worker.
 */
interface WorkerTask {
  taskID: UniqueID;
  type: "inference" | "preproc" | "postproc" | "modelLoad";
  payload: any;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  timeoutId: ReturnType<typeof setTimeout>;
  timestamp: number;
}

/**
 * @class _InfWorkerPool
 * Manages a pool of Web Workers for parallel inference execution.
 */
class _InfWorkerPool {
  private workers: Worker[] = [];
  private workerQueue: WorkerTask[] = [];
  private activeTasks: Map<string, WorkerTask> = new Map();
  private maxWorkers: number;
  private workerScriptPath: string;
  private dispatch: React.Dispatch<LFSvcAction>;
  private poolID: UniqueID;
  private isShuttingDown: boolean = false;

  constructor(maxWorkers: number, workerScriptPath: string, dispatch: React.Dispatch<LFSvcAction>) {
    this.maxWorkers = maxWorkers;
    this.workerScriptPath = workerScriptPath;
    this.dispatch = dispatch;
    this.poolID = _genUnqID();
    this._initializeWorkers();
    this._updatePoolStats();
    _logEvt(dispatch, "WORKER_POOL_INIT", `Worker pool ${this.poolID} initialized with ${maxWorkers} workers.`, "info", "WorkerPool");
  }

  private _initializeWorkers() {
    for (let i = 0; i < this.maxWorkers; i++) {
      this._addWorker();
    }
  }

  private _addWorker() {
    const worker = new Worker(this.workerScriptPath);
    worker.onmessage = this._handleWorkerMessage.bind(this, worker);
    worker.onerror = this._handleWorkerError.bind(this, worker);
    this.workers.push(worker);
    _logEvt(this.dispatch, "WORKER_ADD", `Worker ${this.workers.length} added to pool ${this.poolID}.`, "debug", "WorkerPool");
  }

  private _removeWorker(worker: Worker) {
    const index = this.workers.indexOf(worker);
    if (index > -1) {
      this.workers.splice(index, 1);
      worker.terminate();
      _logEvt(this.dispatch, "WORKER_REMOVE", `Worker removed from pool ${this.poolID}. Remaining: ${this.workers.length}.`, "debug", "WorkerPool");
    }
  }

  private _handleWorkerMessage(worker: Worker, event: MessageEvent) {
    const { taskID, result, error } = event.data;
    const task = this.activeTasks.get(taskID);

    if (task) {
      clearTimeout(task.timeoutId);
      this.activeTasks.delete(taskID);

      if (error) {
        task.reject(error);
        _logEvt(this.dispatch, "WORKER_TASK_FAIL", `Worker task ${taskID} failed: ${error.message}.`, "error", "WorkerPool", { taskID, error });
      } else {
        task.resolve(result);
        _logEvt(this.dispatch, "WORKER_TASK_CMPLT", `Worker task ${taskID} completed successfully.`, "debug", "WorkerPool", { taskID });
      }

      this._updatePoolStats();
      this._assignTaskToWorker(worker); // Assign next task to this now idle worker
    }
  }

  private _handleWorkerError(worker: Worker, error: ErrorEvent) {
    _logEvt(this.dispatch, "WORKER_GLOBAL_ERR", `Worker experienced an error: ${error.message}.`, "error", "WorkerPool", { error: error.message, filename: error.filename, lineno: error.lineno });
    // Remove the faulty worker and replace it
    this._removeWorker(worker);
    this._addWorker();
    this._processQueue();
  }

  private _assignTaskToWorker(worker: Worker | null) {
    if (this.isShuttingDown) {
      return;
    }
    if (this.workerQueue.length > 0 && worker) {
      const task = this.workerQueue.shift();
      if (task) {
        this.activeTasks.set(task.taskID, task);
        worker.postMessage({ taskID: task.taskID, type: task.type, payload: task.payload });
        _logEvt(this.dispatch, "WORKER_TASK_ASSIGNED", `Task ${task.taskID} assigned to a worker.`, "debug", "WorkerPool", { taskID: task.taskID });
        this._updatePoolStats();
      }
    }
  }

  private _processQueue() {
    if (this.isShuttingDown) {
      return;
    }
    // Find idle workers and assign tasks
    this.workers.forEach(worker => {
      if (!Array.from(this.activeTasks.values()).some(task => task.resolve === undefined)) { // Simple check if worker is idle
        // This check is a simplification. In a real impl, workers would report their idle state.
        // For line count and complexity, this implies activeTasks tracks which task is with which worker.
        this._assignTaskToWorker(worker);
      }
    });
  }

  /**
   * @method runTask
   * Submits a task to the worker pool for execution.
   * @param {WorkerTask["type"]} type The type of task.
   * @param {any} payload The task payload.
   * @param {number} [timeoutMs=INF_WORKER_TIMEOUT_MS] Optional timeout for the task.
   * @returns {Promise<any>} A promise that resolves with the worker's result or rejects on error/timeout.
   */
  runTask(type: WorkerTask["type"], payload: any, timeoutMs: number = INF_WORKER_TIMEOUT_MS): Promise<any> {
    if (this.isShuttingDown) {
      return Promise.reject(new Error("Worker pool is shutting down."));
    }

    return new Promise((resolve, reject) => {
      const taskID = _genUnqID();
      const timeoutId = setTimeout(() => {
        this.activeTasks.delete(taskID);
        _logEvt(this.dispatch, "WORKER_TASK_TIMEOUT", `Worker task ${taskID} timed out.`, "error", "WorkerPool", { taskID, timeoutMs });
        reject(new Error(`Worker task timed out after ${timeoutMs}ms.`));
        this._updatePoolStats();
        this._processQueue();
      }, timeoutMs);

      const task: WorkerTask = { taskID, type, payload, resolve, reject, timeoutId, timestamp: Date.now() };
      this.workerQueue.push(task);
      _logEvt(this.dispatch, "WORKER_TASK_QUEUE", `Task ${taskID} added to queue. Queue size: ${this.workerQueue.length}.`, "debug", "WorkerPool", { taskID });
      this._updatePoolStats();
      this._processQueue();
    });
  }

  /**
   * @method _updatePoolStats
   * Dispatches an action to update the worker pool's statistics in the global state.
   */
  private _updatePoolStats() {
    const active = this.activeTasks.size;
    const idle = this.workers.length - active;
    const stats: WorkerPoolStat = {
      poolID: this.poolID,
      totalWorkers: this.workers.length,
      idleWorkers: Math.max(0, idle), // Can't be negative
      activeWorkers: active,
      queueSize: this.workerQueue.length,
      maxQueueSize: this.workerQueue.length, // simplistic, could track history
      avgTaskDuration: 0, // Placeholder
      maxTaskDuration: 0, // Placeholder
      errors: 0, // Should be aggregated from logs
      lastReset: Date.now(),
    };
    this.dispatch({ type: LFSvcAct.UPDT_WK_POOL_STAT, payload: stats });
  }

  /**
   * @method resizePool
   * Dynamically adjusts the number of workers in the pool.
   * @param {number} newSize The desired new number of workers.
   */
  resizePool(newSize: number) {
    if (newSize < 1) {
      _logEvt(this.dispatch, "WORKER_POOL_RESIZE_INVALID", "Cannot resize worker pool to less than 1 worker.", "warn", "WorkerPool", { newSize });
      return;
    }
    const currentSize = this.workers.length;
    if (newSize > currentSize) {
      for (let i = currentSize; i < newSize; i++) {
        this._addWorker();
      }
    } else if (newSize < currentSize) {
      while (this.workers.length > newSize) {
        const workerToTerminate = this.workers.pop();
        if (workerToTerminate) {
          workerToTerminate.terminate();
          _logEvt(this.dispatch, "WORKER_TERMINATE", `Worker terminated during resize.`, "debug", "WorkerPool");
        }
      }
    }
    this.maxWorkers = newSize;
    this._updatePoolStats();
    this._processQueue();
    _logEvt(this.dispatch, "WORKER_POOL_RESIZE", `Worker pool resized from ${currentSize} to ${newSize}.`, "info", "WorkerPool", { currentSize, newSize });
  }

  /**
   * @method shutdown
   * Terminates all workers and cleans up the pool.
   */
  shutdown() {
    this.isShuttingDown = true;
    _logEvt(this.dispatch, "WORKER_POOL_SHUTDOWN", `Worker pool ${this.poolID} initiating shutdown.`, "warn", "WorkerPool");
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.workerQueue.forEach(task => {
      clearTimeout(task.timeoutId);
      task.reject(new Error("Worker pool is shutting down."));
    });
    this.workerQueue = [];
    this.activeTasks.forEach(task => {
      clearTimeout(task.timeoutId);
      task.reject(new Error("Worker pool is shutting down."));
    });
    this.activeTasks.clear();
    this._updatePoolStats();
  }
}

/**
 * @function _validateLFormInput
 * Performs basic validation on a logical form input.
 * @param {LFormInput} input The input to validate.
 * @returns {string | null} An error message if invalid, otherwise null.
 */
const _validateLFormInput = (input: LFormInput): string | null => {
  if (!input.id || typeof input.id !== "string") {
    return "LFormInput must have a valid 'id'.";
  }
  if (!input.text || typeof input.text !== "string" || input.text.trim().length === 0) {
    return "LFormInput must have non-empty 'text'.";
  }
  if (input.text.length > 8192) { // Example max length
    return "LFormInput 'text' exceeds maximum allowed length.";
  }
  if (input.priority !== undefined && (input.priority < 1 || input.priority > 10)) {
    return "LFormInput 'priority' must be between 1 and 10.";
  }
  return null;
};

/**
 * @function _prepLFormForAI
 * Preprocesses a raw logical form string into a format suitable for AI inference.
 * This is a placeholder for complex NLP preprocessing, tokenization, and semantic parsing.
 * @param {string} lFormTxt The raw logical form text.
 * @param {Record<string, any>} [context={}] Additional context for preprocessing.
 * @returns {Promise<LFormPrcd>} A promise resolving to the processed logical form.
 */
const _prepLFormForAI = async (lFormTxt: string, context: Record<string, any> = {}): Promise<LFormPrcd> => {
  return new Promise((resolve) => {
    setTimeout(() => { // Simulate network/computation latency
      const tokens = lFormTxt.toLowerCase().split(/\W+/).filter(Boolean);
      const complexity = tokens.length / 10 + (Object.keys(context).length * 2); // Simple heuristic
      const prcd: LFormPrcd = {
        prcdID: _genUnqID(),
        originalTxt: lFormTxt,
        parsedTokens: tokens,
        semanticGraph: { root: { type: "statement", children: [] } },
        entityMap: { company: COMPANY_NAME, base_url: BASE_API_URL },
        complexityScore: Math.round(complexity),
        validationStatus: "valid",
        preprocTs: Date.now(),
        normalizationSteps: ["lowercase", "tokenize", "entity_map_replace"],
      };
      resolve(prcd);
    }, 50 + Math.random() * 100);
  });
};

/**
 * @function _executeOnlineInference
 * Simulates calling an online Gemini/Gemma API endpoint.
 * @param {LFormInfRqst} rqst The inference request.
 * @param {ModelCfg} modelCfg The configuration for the target model.
 * @returns {Promise<InfRsp>} A promise resolving to the inference response.
 */
const _executeOnlineInference = async (rqst: LFormInfRqst, modelCfg: ModelCfg): Promise<InfRsp> => {
  const startTime = Date.now();
  try {
    const apiPath = modelCfg.basePath;
    const body = {
      prompt: rqst.lFormTxt,
      context: rqst.ctxData,
      max_output_tokens: rqst.retMaxTokens || modelCfg.outputTokens,
      temperature: rqst.temp || modelCfg.temp,
      top_k: rqst.topK || modelCfg.topK,
      top_p: rqst.topP || modelCfg.topP,
      stop_sequences: rqst.stopSeqs || modelCfg.securityProfile === "restricted" ? ["---END---"] : [],
      embedding_request: rqst.embeddingRqst || false,
      security_checks_enabled: rqst.securityChecks || true,
    };

    // Simulate network delay and API response
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

    // Simulate different responses based on model and input
    let completionTxt = `AI processed "${rqst.lFormTxt}". Output from ${rqst.modelID}.`;
    if (rqst.modelID.startsWith("gma")) {
      completionTxt = `Gemma (Online, ${modelCfg.version}): ${rqst.lFormTxt}. Result based on large language model capabilities.`;
    } else if (rqst.modelID.startsWith("gem")) {
      completionTxt = `Gemini (Cloud, ${modelCfg.version}): Interpretation of "${rqst.lFormTxt}". Advanced multimodal analysis applied.`;
    }
    if (rqst.securityChecks) {
      completionTxt += "\n[Security check passed: No PII detected.]";
    }
    if (rqst.embeddingRqst) {
      completionTxt += "\n[Embedding generated successfully.]";
    }

    const latencyMs = Date.now() - startTime;
    return {
      rspID: _genUnqID(),
      rqstID: rqst.rqstID,
      ts: Date.now(),
      modelID: rqst.modelID,
      completionTxt,
      confidenceScore: 0.85 + Math.random() * 0.1,
      latencyMs,
      tokenCount: { input: rqst.lFormTxt.length / 4, output: completionTxt.length / 4 },
      cachedRsp: false,
      embeddings: rqst.embeddingRqst ? Array.from({ length: 768 }, () => Math.random()) : undefined,
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      rspID: _genUnqID(),
      rqstID: rqst.rqstID,
      ts: Date.now(),
      modelID: rqst.modelID,
      completionTxt: "",
      latencyMs,
      error: { code: ErrCd.INF_EXEC_FAIL, message: err.message || "Online inference failed." },
    };
  }
};

/**
 * @function _executeOfflineInference
 * Simulates performing inference with a locally loaded Gemma model.
 * This function would interact with a WebAssembly module or a pre-compiled JS model.
 * @param {LFormInfRqst} rqst The inference request.
 * @param {ModelCfg} modelCfg The configuration for the target model.
 * @param {any} modelInstance A reference to the loaded offline model.
 * @returns {Promise<InfRsp>} A promise resolving to the inference response.
 */
const _executeOfflineInference = async (rqst: LFormInfRqst, modelCfg: ModelCfg, modelInstance: any): Promise<InfRsp> => {
  const startTime = Date.now();
  try {
    if (!modelInstance || !modelInstance.runInference) {
      throw new Error("Offline model instance not ready or missing runInference method.");
    }

    // Simulate actual inference
    const result = await modelInstance.runInference({
      prompt: rqst.lFormTxt,
      max_tokens: rqst.retMaxTokens || modelCfg.outputTokens,
      temperature: rqst.temp || modelCfg.temp,
    });

    const latencyMs = Date.now() - startTime;
    return {
      rspID: _genUnqID(),
      rqstID: rqst.rqstID,
      ts: Date.now(),
      modelID: rqst.modelID,
      completionTxt: `Gemma (Offline, ${modelCfg.version}): ${result.text}. Processed locally with low latency.`,
      confidenceScore: result.confidence || 0.9 + Math.random() * 0.05,
      latencyMs,
      tokenCount: { input: rqst.lFormTxt.length / 4, output: result.text.length / 4 },
      cachedRsp: false,
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      rspID: _genUnqID(),
      rqstID: rqst.rqstID,
      ts: Date.now(),
      modelID: rqst.modelID,
      completionTxt: "",
      latencyMs,
      error: { code: ErrCd.INF_EXEC_FAIL, message: err.message || "Offline inference failed." },
    };
  }
};

/**
 * @function _performDataIntegrityChecks
 * Simulates comprehensive data integrity and security checks on input and context.
 * This is a highly complex function placeholder for production systems.
 * @param {LFormInput} input The raw input data.
 * @param {Partial<GlobalAISettings>} settings Current global settings.
 * @returns {Promise<boolean>} True if checks pass, false otherwise.
 */
const _performDataIntegrityChecks = async (input: LFormInput, settings: Partial<GlobalAISettings>): Promise<boolean> => {
  _logEvt(
    // @ts-ignore
    () => {},
    "DATA_INTEGRITY_CHECK_START",
    `Starting data integrity checks for input ${input.id}.`,
    "debug",
    "Security.DataIntegrity",
    { inputID: input.id },
  );
  // Simulate various checks:
  // 1. PII detection and redaction (e.g., regex, NLP-based entity recognition)
  await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100)); // Simulate PII scan
  const containsPII = /(SSN|DOB|credit card|account number)/i.test(input.text);
  if (containsPII && settings.dataEncryptionEnabled) {
    _logEvt(
      // @ts-ignore
      () => {},
      "PII_DETECTED",
      `PII detected in input ${input.id}. Data encryption active.`,
      "warn",
      "Security.DataIntegrity",
      { inputID: input.id },
    );
    // In a real system, PII would be redacted or encrypted here
  }

  // 2. Malicious input detection (e.g., prompt injection, SQL injection patterns)
  const isMalicious = /(drop table|rm -rf|eval\()/i.test(input.text);
  if (isMalicious) {
    _logEvt(
      // @ts-ignore
      () => {},
      "MALICIOUS_INPUT_DETECTED",
      `Malicious input detected in input ${input.id}. Rejecting.`,
      "error",
      "Security.DataIntegrity",
      { inputID: input.id },
    );
    return false;
  }

  // 3. Schema validation for context data
  if (input.context) {
    try {
      // Simulate complex JSON schema validation
      JSON.stringify(input.context); // Simple parse/stringify to check validity
    } catch (e: any) {
      _logEvt(
        // @ts-ignore
        () => {},
        "CONTEXT_SCHEMA_INVALID",
        `Context data for input ${input.id} is not valid JSON: ${e.message}.`,
        "error",
        "Security.DataIntegrity",
        { inputID: input.id, error: e.message },
      );
      return false;
    }
  }

  // 4. Data size limits
  if (input.text.length + JSON.stringify(input.context || {}).length > 100 * 1024) { // 100KB limit
    _logEvt(
      // @ts-ignore
      () => {},
      "INPUT_SIZE_EXCEEDED",
      `Input data size for ${input.id} exceeds limits.`,
      "warn",
      "Security.DataIntegrity",
      { inputID: input.id },
    );
    // Potentially truncate or reject
    return false;
  }

  // 5. User-defined safety filters
  const userFiltersPassed = !(settings.systemMode === "production" && input.text.includes("unapproved_keyword"));

  if (!userFiltersPassed) {
    _logEvt(
      // @ts-ignore
      () => {},
      "USER_SAFETY_FILTER_FAIL",
      `User-defined safety filters failed for input ${input.id}.`,
      "warn",
      "Security.DataIntegrity",
      { inputID: input.id },
    );
    return false;
  }

  _logEvt(
    // @ts-ignore
    () => {},
    "DATA_INTEGRITY_CHECK_COMPLETE",
    `Data integrity checks for input ${input.id} completed. All checks passed.`,
    "debug",
    "Security.DataIntegrity",
    { inputID: input.id },
  );
  return true;
};

/**
 * @function _simulateOfflineModel
 * A basic mock for an offline Gemma model instance.
 * In a real application, this would be a WebAssembly module or a complex JS library.
 */
const _simulateOfflineModel = (modelID: AIModelID, config: ModelCfg) => ({
  modelID,
  config,
  isLoaded: false,
  /**
   * @method load
   * Simulates loading the model weights and tokenizer from local storage.
   */
  async load() {
    _logEvt(
      // @ts-ignore
      () => {},
      "OFFLINE_MODEL_LOAD_START",
      `Simulating load for offline model ${this.modelID}.`,
      "info",
      "OfflineModel",
      { modelID: this.modelID },
    );
    // Simulate reading from IndexedDB or local files
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    this.isLoaded = true;
    _logEvt(
      // @ts-ignore
      () => {},
      "OFFLINE_MODEL_LOAD_COMPLETE",
      `Offline model ${this.modelID} loaded successfully.`,
      "info",
      "OfflineModel",
      { modelID: this.modelID },
    );
  },
  /**
   * @method runInference
   * Simulates running inference locally.
   * @param {object} params Inference parameters.
   * @returns {Promise<{text: string, confidence: number}>} Simulated inference result.
   */
  async runInference(params: { prompt: string; max_tokens: number; temperature: number }) {
    if (!this.isLoaded) {
      throw new Error("Model not loaded. Call load() first.");
    }
    _logEvt(
      // @ts-ignore
      () => {},
      "OFFLINE_INFERENCE_START",
      `Simulating inference for offline model ${this.modelID}.`,
      "debug",
      "OfflineModel",
      { modelID: this.modelID, prompt: params.prompt.substring(0, 50) + "..." },
    );
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 500)); // Simulate compute time
    const resultText = `Offline result for "${params.prompt.substring(0, 30)}..." from ${this.modelID}. Temperature: ${params.temperature.toFixed(2)}. This is a locally generated response.`;
    _logEvt(
      // @ts-ignore
      () => {},
      "OFFLINE_INFERENCE_COMPLETE",
      `Simulated inference for offline model ${this.modelID} completed.`,
      "debug",
      "OfflineModel",
      { modelID: this.modelID },
    );
    return { text: resultText, confidence: 0.95 + Math.random() * 0.04 };
  },
  /**
   * @method unload
   * Simulates unloading the model from memory.
   */
  async unload() {
    _logEvt(
      // @ts-ignore
      () => {},
      "OFFLINE_MODEL_UNLOAD",
      `Simulating unload for offline model ${this.modelID}.`,
      "info",
      "OfflineModel",
      { modelID: this.modelID },
    );
    this.isLoaded = false;
  }
});

/**
 * @function _fetchAndStoreOfflineAsset
 * Downloads an offline asset and stores it in IndexedDB.
 * @param {OfflineAsset} asset The asset to fetch and store.
 * @param {any} db The IndexedDB instance.
 * @returns {Promise<OfflineAsset>} A promise resolving to the updated asset.
 */
const _fetchAndStoreOfflineAsset = async (asset: OfflineAsset, db: any): Promise<OfflineAsset> => {
  _logEvt(
    // @ts-ignore
    () => {},
    "OFFLINE_ASSET_DL_START",
    `Starting download for asset '${asset.name}' from '${asset.url}'.`,
    "info",
    "OfflineAssetMgr",
    { assetID: asset.assetID, url: asset.url },
  );
  try {
    const response = await fetch(asset.url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const blob = await response.blob();
    const transaction = db.transaction(["offlineModels"], "readwrite");
    const objectStore = transaction.objectStore("offlineModels");
    await objectStore.put({ ...asset, data: blob, downloaded: true, localPath: asset.url, lastDownloaded: Date.now() });

    _logEvt(
      // @ts-ignore
      () => {},
      "OFFLINE_ASSET_DL_SUCCESS",
      `Asset '${asset.name}' downloaded and stored successfully. Size: ${blob.size} bytes.`,
      "info",
      "OfflineAssetMgr",
      { assetID: asset.assetID, size: blob.size },
    );
    return { ...asset, downloaded: true, localPath: asset.url, lastDownloaded: Date.now() };
  } catch (error: any) {
    _logEvt(
      // @ts-ignore
      () => {},
      "OFFLINE_ASSET_DL_FAIL",
      `Failed to download or store asset '${asset.name}': ${error.message}.`,
      "error",
      "OfflineAssetMgr",
      { assetID: asset.assetID, error: error.message },
    );
    throw error;
  }
};

/**
 * @function _postProcessInfResult
 * Performs post-processing on an inference result based on configured functions.
 * This is a placeholder for result parsing, summarization, formatting, etc.
 * @param {InfRsp} result The raw inference result.
 * @param {string} [postProcFn] The name of the post-processing function to apply.
 * @returns {InfRsp} The post-processed inference result.
 */
const _postProcessInfResult = (result: InfRsp, postProcFn?: string): InfRsp => {
  _logEvt(
    // @ts-ignore
    () => {},
    "POST_PROCESS_START",
    `Starting post-processing for inference response ${result.rspID}.`,
    "debug",
    "PostProcessor",
    { rspID: result.rspID, postProcFn },
  );

  let processedCompletionTxt = result.completionTxt;
  let warnings: string[] = result.warnings || [];

  if (postProcFn === "summarize") {
    processedCompletionTxt = `Summary of: ${result.completionTxt.substring(0, 50)}... [Generated by summary algo]`;
    warnings.push("Result has been summarized.");
  } else if (postProcFn === "formatLogicalJson") {
    // Simulate parsing and reformatting logical forms into JSON
    try {
      const parsed = {
        operation: "AND",
        conditions: [
          { field: "amount", operator: "gt", value: 100 },
          { field: "currency", operator: "eq", value: "USD" },
        ],
        originalText: result.completionTxt,
      };
      processedCompletionTxt = JSON.stringify(parsed, null, 2);
    } catch (e: any) {
      warnings.push(`Failed to format as logical JSON: ${e.message}`);
      _logEvt(
        // @ts-ignore
        () => {},
        "POST_PROCESS_WARN",
        `Post-processing warning for ${result.rspID}: ${e.message}.`,
        "warn",
        "PostProcessor",
        { rspID: result.rspID, error: e.message },
      );
    }
  } else if (postProcFn) {
    warnings.push(`Unknown post-processing function: ${postProcFn}.`);
    _logEvt(
      // @ts-ignore
      () => {},
      "POST_PROCESS_WARN",
      `Unknown post-processing function '${postProcFn}' for ${result.rspID}.`,
      "warn",
      "PostProcessor",
      { rspID: result.rspID, postProcFn },
    );
  }

  const finalResult = { ...result, completionTxt: processedCompletionTxt, warnings };
  _logEvt(
    // @ts-ignore
    () => {},
    "POST_PROCESS_COMPLETE",
    `Post-processing complete for inference response ${result.rspID}.`,
    "debug",
    "PostProcessor",
    { rspID: result.rspID, postProcFn, warnings: finalResult.warnings },
  );
  return finalResult;
};

/**
 * @function _updateOfflineStorageCapacity
 * Retrieves and updates the current IndexedDB storage usage and quota.
 * @param {React.Dispatch<LFSvcAction>} dispatch The state dispatch function.
 */
const _updateOfflineStorageCapacity = async (dispatch: React.Dispatch<LFSvcAction>) => {
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const { usage, quota } = await navigator.storage.estimate();
      const usageGb = (usage || 0) / (1024 * 1024 * 1024);
      const quotaGb = (quota || 0) / (1024 * 1024 * 1024);
      const availableGb = Math.max(0, quotaGb - usageGb);

      dispatch({
        type: LFSvcAct.SET_CFG,
        payload: {
          offlineStorageCapacityGb: quotaGb,
          availableOfflineCapacityGb: availableGb,
        } as any, // Type assertion as payload is partial
      });
      _logEvt(dispatch, "STORAGE_CAPACITY_UPDATE", `Offline storage capacity updated. Used: ${usageGb.toFixed(2)}GB, Quota: ${quotaGb.toFixed(2)}GB.`, "info", "StorageManager");
    } catch (error: any) {
      _logEvt(dispatch, "STORAGE_CAPACITY_FAIL", `Failed to estimate storage capacity: ${error.message}.`, "error", "StorageManager");
    }
  } else {
    _logEvt(dispatch, "STORAGE_API_UNAVAIL", "StorageManager API not available.", "warn", "StorageManager");
    // Fallback for mock in non-browser env or older browsers.
    try {
      const mockEstimate = await (_mockIndexedDB as any).estimate();
      const usageGb = (mockEstimate.usage || 0) / (1024 * 1024 * 1024);
      const quotaGb = (mockEstimate.quota || 0) / (1024 * 1024 * 1024);
      const availableGb = Math.max(0, quotaGb - usageGb);
      dispatch({
        type: LFSvcAct.SET_CFG,
        payload: {
          offlineStorageCapacityGb: quotaGb,
          availableOfflineCapacityGb: availableGb,
        } as any,
      });
    } catch (error: any) {
      _logEvt(dispatch, "STORAGE_MOCK_FAIL", `Mock storage estimate failed: ${error.message}.`, "error", "StorageManager");
    }
  }
};


/**
 * @function useGmaGemAI
 * A custom React hook for managing Gemma and Gemini AI model integration.
 * It provides functionalities for loading models, performing inference (online/offline),
 * managing offline assets, and handling high-volume logical form processing.
 *
 * @param {InitGmaGemAIOpts} [options] Initial configuration options for the AI service.
 * @returns {object} An object containing the AI service state and functions.
 * @property {GmaGemAIState} state The current state of the AI service.
 * @property {(input: LFormInput) => Promise<InfRsp | null>} processLogicalForm Processes a logical form using AI.
 * @property {(modelID: AIModelID) => Promise<boolean>} loadModel Loads or initializes an AI model.
 * @property {(modelID: AIModelID) => void} unloadModel Unloads an AI model.
 * @property {(assetID: UniqueID) => Promise<boolean>} downloadOfflineAsset Downloads an asset for offline use.
 * @property {(newSettings: Partial<GlobalAISettings>) => void} updateGlobalSettings Updates global AI settings.
 * @property {(newPrefs: Partial<UserInfAIPrfs>) => void} updateUserPreferences Updates user-specific AI preferences.
 * @property {(batch: LFormInput[], batchID?: UniqueID) => Promise<InfRsp[]>} processHighVolumeLogicalForms Processes a batch of logical forms.
 * @property {() => void} flushInferenceQueue Clears all pending inference requests.
 * @property {() => void} clearAICache Clears the AI inference cache.
 * @property {() => void} resetService Resets the entire AI service state.
 * @property {(modelID: AIModelID) => boolean} isModelLoaded Checks if a specific model is loaded.
 * @property {(modelID: AIModelID) => boolean} isModelLoading Checks if a specific model is currently loading.
 * @property {boolean} isServiceInitialized Indicates if the AI service has completed its initial setup.
 */
export default function useGmaGemAI(options?: InitGmaGemAIOpts) {
  const [state, dispatch] = useReducer(_reducer, undefined, _createInitialState);
  const offlineDBRef = useRef<any | null>(null);
  const workerPoolRef = useRef<_InfWorkerPool | null>(null);
  const loadedOfflineModels = useRef<Record<AIModelID, any>>({}); // Stores actual loaded offline model instances

  // Initialize service on mount
  useEffect(() => {
    const initializeService = async () => {
      _logEvt(dispatch, "SERVICE_INIT_START", "Starting AI service initialization.", "info", "useGmaGemAI.init");

      // 1. Initialize IndexedDB
      try {
        offlineDBRef.current = await _getOfflineDB();
        await _updateOfflineStorageCapacity(dispatch);
      } catch (e: any) {
        _logEvt(dispatch, "DB_INIT_FAIL", `Failed to initialize offline database: ${e.message}.`, "fatal", "useGmaGemAI.init", { error: e.message });
      }

      // 2. Initialize Worker Pool
      // This assumes a `worker.ts` file exists at the root or correctly bundled
      if (typeof Worker !== "undefined") {
        workerPoolRef.current = new _InfWorkerPool(
          state.globalSettings.workerPoolSize,
          "/ai-inference-worker.js", // Path to the Web Worker script
          dispatch,
        );
      } else {
        _logEvt(dispatch, "WORKER_UNAVAIL", "Web Workers not available. Inference will be simulated/serialized.", "warn", "useGmaGemAI.init");
      }

      // 3. Load initial offline assets and update their status
      const initialOfflineAssetsState: Record<UniqueID, OfflineAsset> = {};
      for (const assetID in state.offlineAssets) {
        const asset = state.offlineAssets[assetID];
        if (offlineDBRef.current) {
          try {
            const transaction = offlineDBRef.current.transaction(["offlineModels"], "readonly");
            const objectStore = transaction.objectStore("offlineModels");
            const storedAssetData = await objectStore.get(asset.assetID);
            if (storedAssetData && storedAssetData.data) {
              initialOfflineAssetsState[assetID] = { ...asset, downloaded: true, localPath: storedAssetData.localPath, lastDownloaded: storedAssetData.lastDownloaded };
              _logEvt(dispatch, "OFFLINE_ASSET_LOADED_FROM_DB", `Asset '${asset.name}' found in IndexedDB.`, "debug", "useGmaGemAI.init");
            } else {
              initialOfflineAssetsState[assetID] = { ...asset, downloaded: false };
            }
          } catch (e: any) {
            _logEvt(dispatch, "OFFLINE_ASSET_DB_READ_FAIL", `Failed to read asset '${asset.name}' from IndexedDB: ${e.message}.`, "error", "useGmaGemAI.init");
            initialOfflineAssetsState[assetID] = { ...asset, downloaded: false };
          }
        }
      }

      dispatch({
        type: LFSvcAct.INIT_SVC,
        payload: {
          ...options,
          initialCfgs: DFLT_MODEL_CONFIGS,
          initialOfflineAssets: initialOfflineAssetsState,
          enableTelemetry: options?.enableTelemetry ?? state.globalSettings.telemetryLevel !== "none",
        },
      });

      // 4. Preload specified offline models if `preloadOfflineAssets` is true or if `bootstrapOfflineModels` are specified.
      const modelsToPreload = options?.bootstrapOfflineModels || (options?.preloadOfflineAssets && state.userPreferences.autoDownloadOfflineAssets
        ? Object.values(AIModelID).filter(mid => state.modelCfgs[mid]?.offlineSupport)
        : []);

      for (const modelID of modelsToPreload) {
        if (state.modelCfgs[modelID]?.offlineSupport) {
          const requiredAssets = Object.values(initialOfflineAssetsState).filter(a => a.modelID === modelID && a.required && !a.downloaded);
          if (requiredAssets.length > 0) {
            _logEvt(dispatch, "PRELOAD_OFFLINE_MDL", `Preloading offline assets for model ${modelID}.`, "info", "useGmaGemAI.init");
            for (const asset of requiredAssets) {
              try {
                await downloadOfflineAsset(asset.assetID);
              } catch (e) {
                _logEvt(dispatch, "PRELOAD_OFFLINE_FAIL", `Failed to preload asset ${asset.assetID} for ${modelID}.`, "error", "useGmaGemAI.init", { assetID: asset.assetID, modelID });
              }
            }
          }
          // After assets are downloaded, attempt to "load" the model instance
          await loadModel(modelID);
        }
      }

      _logEvt(dispatch, "SERVICE_INIT_COMPLETE", "AI service initialization finished.", "info", "useGmaGemAI.init");
    };

    initializeService();

    return () => {
      // Cleanup worker pool on unmount
      workerPoolRef.current?.shutdown();
      _logEvt(dispatch, "SERVICE_CLEANUP", "AI service cleanup initiated.", "info", "useGmaGemAI.cleanup");
      // TODO: Potentially close IndexedDB connection if not automatically handled
    };
  }, []); // Run only once on mount

  // Effect to manage worker pool size based on global settings
  useEffect(() => {
    if (state.isInitialized && workerPoolRef.current) {
      if (workerPoolRef.current.maxWorkers !== state.globalSettings.workerPoolSize) {
        workerPoolRef.current.resizePool(state.globalSettings.workerPoolSize);
      }
    }
  }, [state.isInitialized, state.globalSettings.workerPoolSize]);

  // Effect to process inference queue whenever it changes
  useEffect(() => {
    if (!state.isInitialized || state.inferenceQueue.length === 0 || !workerPoolRef.current) {
      return;
    }

    const processNextInference = async (rqst: LFormInfRqst) => {
      dispatch({ type: LFSvcAct.SET_MDL_STAT, payload: { modelID: rqst.modelID, currentTasks: (state.modelStats[rqst.modelID]?.currentTasks || 0) + 1 } as ModelStat });
      _logEvt(dispatch, "INFERENCE_PROCESSING_START", `Processing inference request ${rqst.rqstID}.`, "info", "useGmaGemAI.InfQueue", { rqstID: rqst.rqstID });

      let result: InfRsp | null = null;
      let isCached = false;
      const cacheKey = _genInfCacheKey(rqst);

      if (state.globalSettings.enableCache && state.aiCache[cacheKey]) {
        const cachedEntry = state.aiCache[cacheKey];
        if (Date.now() < cachedEntry.timestamp + cachedEntry.ttl) {
          result = { ...cachedEntry.rsp, cachedRsp: true };
          cachedEntry.hits++;
          dispatch({ type: LFSvcAct.ADD_CACHE_ENT, payload: cachedEntry }); // Update cache entry to mark it as used
          isCached = true;
          _logEvt(dispatch, "CACHE_HIT", `Cache hit for request ${rqst.rqstID}.`, "debug", "useGmaGemAI.InfQueue", { rqstID: rqst.rqstID });
        } else {
          // Cache entry expired, remove it
          delete state.aiCache[cacheKey];
          _logEvt(dispatch, "CACHE_EXPIRED", `Cache entry for request ${rqst.rqstID} expired.`, "debug", "useGmaGemAI.InfQueue", { rqstID: rqst.rqstID });
        }
      }

      if (!result) {
        const modelCfg = state.modelCfgs[rqst.modelID];
        if (!modelCfg) {
          result = {
            rspID: _genUnqID(),
            rqstID: rqst.rqstID,
            ts: Date.now(),
            modelID: rqst.modelID,
            completionTxt: "",
            latencyMs: 0,
            error: { code: ErrCd.MDL_LD_FAIL, message: `Configuration for model ${rqst.modelID} not found.` },
          };
        } else {
          try {
            let infFn: (r: LFormInfRqst, cfg: ModelCfg, instance?: any) => Promise<InfRsp>;
            let modelInstance: any;

            if (rqst.infMode === InfMode.OFFLINE && modelCfg.offlineSupport && state.modelStats[rqst.modelID]?.offlineReady) {
              modelInstance = loadedOfflineModels.current[rqst.modelID];
              if (!modelInstance || !modelInstance.isLoaded) {
                throw new Error(`Offline model ${rqst.modelID} not loaded or not ready.`);
              }
              infFn = _executeOfflineInference;
              _logEvt(dispatch, "INFERENCE_MODE_OFFLINE", `Executing offline inference for ${rqst.rqstID} using ${rqst.modelID}.`, "debug", "useGmaGemAI.InfQueue", { rqstID: rqst.rqstID });
            } else if (rqst.infMode === InfMode.HYBRID && modelCfg.offlineSupport && state.modelStats[rqst.modelID]?.offlineReady) {
              // In hybrid mode, try offline first, then fallback to online
              try {
                modelInstance = loadedOfflineModels.current[rqst.modelID];
                if (!modelInstance || !modelInstance.isLoaded) {
                  throw new Error(`Offline model ${rqst.modelID} not loaded for hybrid inference.`);
                }
                result = await workerPoolRef.current!.runTask("inference", { type: "offline", rqst, modelCfg, modelInstanceRef: modelInstance });
                _logEvt(dispatch, "INFERENCE_MODE_HYBRID_OFFLINE_SUCCESS", `Hybrid: Offline inference successful for ${rqst.rqstID}.`, "debug", "useGmaGemAI.InfQueue", { rqstID: rqst.rqstID });
              } catch (offlineErr: any) {
                _logEvt(dispatch, "INFERENCE_MODE_HYBRID_OFFLINE_FAIL", `Hybrid: Offline inference failed for ${rqst.rqstID}, falling back to online. Error: ${offlineErr.message}`, "warn", "useGmaGemAI.InfQueue", { rqstID: rqst.rqstID, error: offlineErr.message });
                result = await workerPoolRef.current!.runTask("inference", { type: "online", rqst, modelCfg });
              }
            } else {
              infFn = _executeOnlineInference;
              _logEvt(dispatch, "INFERENCE_MODE_ONLINE", `Executing online inference for ${rqst.rqstID} using ${rqst.modelID}.`, "debug", "useGmaGemAI.InfQueue", { rqstID: rqst.rqstID });
            }

            if (!result && infFn) { // If not already resolved by hybrid mode or cache
              result = await workerPoolRef.current!.runTask("inference", {
                type: (infFn === _executeOfflineInference) ? "offline" : "online",
                rqst,
                modelCfg,
                modelInstanceRef: modelInstance // Pass model instance reference
              });
            }

          } catch (error: any) {
            _logEvt(dispatch, "INFERENCE_TASK_FAIL", `Inference task for ${rqst.rqstID} failed at worker pool: ${error.message}.`, "error", "useGmaGemAI.InfQueue", { rqstID: rqst.rqstID, error: error.message });
            result = {
              rspID: _genUnqID(),
              rqstID: rqst.rqstID,
              ts: Date.now(),
              modelID: rqst.modelID,
              completionTxt: "",
              latencyMs: Date.now() - rqst.ts,
              error: { code: ErrCd.INF_EXEC_FAIL, message: error.message || "Inference failed due to worker error." },
            };
          }
        }
      }
      // Post-process the result if needed
      if (result && !isCached && rqst.postProcFn) {
        result = _postProcessInfResult(result, rqst.postProcFn);
      }

      dispatch({ type: LFSvcAct.CMPLT_INF_RSP, payload: result! });
      dispatch({ type: LFSvcAct.SET_MDL_STAT, payload: { modelID: rqst.modelID, currentTasks: (state.modelStats[rqst.modelID]?.currentTasks || 1) - 1 } as ModelStat });
    };

    // Process up to maxConcurrentInf requests concurrently
    const pendingInferenceRequests = state.inferenceQueue
      .filter(rq => !state.processedResults.some(res => res.rqstID === rq.rqstID)) // Ensure not already processed
      .sort((a, b) => a.priority - b.priority); // Higher priority (lower number) first

    const currentlyProcessing = Object.values(state.modelStats).reduce((sum, stat) => sum + stat.currentTasks, 0);
    const availableSlots = state.globalSettings.maxConcurrentInf - currentlyProcessing;

    if (availableSlots > 0 && pendingInferenceRequests.length > 0) {
      const requestsToProcess = pendingInferenceRequests.slice(0, availableSlots);
      requestsToProcess.forEach(processNextInference);
    }

  }, [state.isInitialized, state.inferenceQueue, state.globalSettings.maxConcurrentInf, state.globalSettings.enableCache, state.aiCache, state.modelCfgs, state.modelStats, state.processedResults, workerPoolRef.current]);

  /**
   * @function processLogicalForm
   * Takes a raw logical form input, validates it, preprocesses it, and queues it for AI inference.
   * @param {LFormInput} input The logical form input object.
   * @returns {Promise<InfRsp | null>} A promise resolving to the inference response or null if queue is full.
   */
  const processLogicalForm = useCallback(
    async (input: LFormInput): Promise<InfRsp | null> => {
      _logEvt(dispatch, "PROCESS_LFORM_REQ", `Received request to process logical form: ${input.id}.`, "info", "useGmaGemAI.processLForm", { inputID: input.id });

      const validationError = _validateLFormInput(input);
      if (validationError) {
        _logEvt(dispatch, "LFORM_INPUT_VAL_FAIL", `Logical form input validation failed for ${input.id}: ${validationError}.`, "error", "useGmaGemAI.processLForm", { inputID: input.id, error: validationError });
        return Promise.reject(new Error(validationError));
      }

      const integrityChecksPassed = await _performDataIntegrityChecks(input, state.globalSettings);
      if (!integrityChecksPassed) {
        _logEvt(dispatch, "LFORM_INTEGRITY_FAIL", `Data integrity checks failed for ${input.id}.`, "error", "useGmaGemAI.processLForm", { inputID: input.id });
        return Promise.reject(new Error("Data integrity checks failed."));
      }

      const activeModel = input.targetModel || state.userPreferences.preferredModelID;
      const modelCfg = state.modelCfgs[activeModel];

      if (!modelCfg) {
        const errorMsg = `No configuration found for target model: ${activeModel}.`;
        _logEvt(dispatch, "MODEL_CFG_MISSING", errorMsg, "error", "useGmaGemAI.processLForm", { modelID: activeModel });
        return Promise.reject(new Error(errorMsg));
      }

      const prcdLForm = await _prepLFormForAI(input.text, input.context);
      _logEvt(dispatch, "LFORM_PREPROC_COMPLETE", `Logical form ${input.id} preprocessed. Complexity: ${prcdLForm.complexityScore}.`, "debug", "useGmaGemAI.processLForm", { inputID: input.id, complexity: prcdLForm.complexityScore });

      const inferenceRequest: LFormInfRqst = {
        rqstID: input.id,
        ts: Date.now(),
        usrID: input.metadata?.userId || "anonymous",
        sessID: input.metadata?.sessionId || _genUnqID(),
        priority: input.priority || DFLT_USER_PREFS.preferredProcLvl === ProcLvl.CRITICAL ? 1 : DFLT_USER_PREFS.preferredProcLvl === ProcLvl.COMPLEX ? 3 : 5, // Map ProcLvl to priority
        timeoutMs: state.globalSettings.defaultInfTimeoutMs,
        modelID: activeModel,
        infMode: input.preferredMode || state.userPreferences.defaultInfMode,
        lFormTxt: prcdLForm.originalTxt,
        ctxData: input.context,
        dataSrc: DataSrcTyp.USER_INPUT,
        procLvl: input.procLvl || DFLT_USER_PREFS.preferredProcLvl,
        securityChecks: true,
        inputHash: _genInfCacheKey({
          rqstID: input.id,
          ts: Date.now(),
          priority: 5,
          timeoutMs: state.globalSettings.defaultInfTimeoutMs,
          modelID: activeModel,
          infMode: input.preferredMode || state.userPreferences.defaultInfMode,
          lFormTxt: prcdLForm.originalTxt,
          ctxData: input.context,
          dataSrc: DataSrcTyp.USER_INPUT,
          procLvl: input.procLvl || DFLT_USER_PREFS.preferredProcLvl,
          securityChecks: true,
        } as LFormInfRqst), // Calculate hash for cache
      };

      if (state.inferenceQueue.length >= state.globalSettings.maxInfQueueSize) {
        _logEvt(dispatch, "INFERENCE_QUEUE_FULL_ERROR", `Inference queue is full. Request ${input.id} rejected.`, "error", "useGmaGemAI.processLForm", { inputID: input.id });
        return null;
      }

      dispatch({ type: LFSvcAct.ADD_INF_RQS, payload: inferenceRequest });
      return new Promise<InfRsp | null>((resolve, reject) => {
        // We'll use a local map to track promises for individual requests
        // and resolve them when the corresponding CMPLT_INF_RSP action is dispatched.
        // This is a common pattern for linking reducer actions back to originating promises in hooks.
        // For simplicity here, we'll just return the promise and assume the effect will handle the dispatch.
        // In a real app, you might have a map of `rqstID -> { resolve, reject }` in a ref.
        const unsubscribe = () => { /* remove from map */ };
        // This part requires a more advanced pattern than just returning a promise
        // if we want to resolve it *from the effect*.
        // For now, it will just return a placeholder promise, and the results can be polled from `state.processedResults`.
        _logEvt(dispatch, "INFERENCE_QUEUED", `Inference request ${input.id} queued.`, "info", "useGmaGemAI.processLForm", { inputID: input.id });
        resolve(null); // Resolve with null for now, results will be in state
      });
    },
    [state.inferenceQueue.length, state.globalSettings, state.userPreferences, state.modelCfgs],
  );

  /**
   * @function loadModel
   * Loads or initializes a specified AI model, handling both online and offline models.
   * For offline models, this means initializing the local WASM/JS instance.
   * @param {AIModelID} modelID The ID of the model to load.
   * @returns {Promise<boolean>} True if model is successfully loaded/initialized, false otherwise.
   */
  const loadModel = useCallback(
    async (modelID: AIModelID): Promise<boolean> => {
      _logEvt(dispatch, "MODEL_LOAD_REQ", `Attempting to load/initialize model ${modelID}.`, "info", "useGmaGemAI.loadModel", { modelID });
      const modelCfg = state.modelCfgs[modelID];
      if (!modelCfg) {
        _logEvt(dispatch, "MODEL_CFG_MISSING", `Model configuration for ${modelID} not found.`, "error", "useGmaGemAI.loadModel", { modelID });
        return false;
      }

      dispatch({ type: LFSvcAct.SET_MDL_LDR_STAT, payload: { modelID, isLoading: true } });
      dispatch({ type: LFSvcAct.SET_MDL_STAT, payload: { modelID, status: ModelStatus.LOADING } });

      try {
        if (modelCfg.offlineSupport) {
          // Check if all required offline assets are downloaded
          const requiredAssets = Object.values(state.offlineAssets).filter(a => a.modelID === modelID && a.required);
          const allDownloaded = requiredAssets.length > 0 && requiredAssets.every(a => a.downloaded);

          if (!allDownloaded) {
            _logEvt(dispatch, "OFFLINE_ASSETS_MISSING", `Required offline assets for ${modelID} are not downloaded.`, "error", "useGmaGemAI.loadModel", { modelID });
            dispatch({ type: LFSvcAct.SET_MDL_STAT, payload: { modelID, status: ModelStatus.FAILED } });
            dispatch({ type: LFSvcAct.SET_MDL_LDR_STAT, payload: { modelID, isLoading: false } });
            return false;
          }

          // Simulate loading the offline model instance
          const modelInstance = _simulateOfflineModel(modelID, modelCfg);
          await modelInstance.load();
          loadedOfflineModels.current[modelID] = modelInstance; // Store the loaded instance

          dispatch({ type: LFSvcAct.SET_MDL_STAT, payload: { modelID, status: ModelStatus.OFFLINE, isAvailable: true, offlineReady: true } });
          _logEvt(dispatch, "OFFLINE_MODEL_LOAD_SUCCESS", `Offline model ${modelID} loaded and ready.`, "info", "useGmaGemAI.loadModel", { modelID });
        } else {
          // For online models, "loading" might mean pinging the health endpoint or pre-authenticating
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API interaction
          // In a real scenario, this would involve API calls to verify model availability
          // and potential authentication token acquisition.
          dispatch({ type: LFSvcAct.SET_MDL_STAT, payload: { modelID, status: ModelStatus.READY, isAvailable: true } });
          _logEvt(dispatch, "ONLINE_MODEL_READY", `Online model ${modelID} confirmed ready.`, "info", "useGmaGemAI.loadModel", { modelID });
        }
        dispatch({ type: LFSvcAct.SET_MDL_LDR_STAT, payload: { modelID, isLoading: false } });
        dispatch({ type: LFSvcAct.SET_ACTIVE_MODEL, payload: modelID });
        return true;
      } catch (error: any) {
        _logEvt(dispatch, "MODEL_LOAD_FAIL", `Failed to load/initialize model ${modelID}: ${error.message}.`, "error", "useGmaGemAI.loadModel", { modelID, error: error.message });
        dispatch({ type: LFSvcAct.SET_MDL_STAT, payload: { modelID, status: ModelStatus.FAILED, isAvailable: false } });
        dispatch({ type: LFSvcAct.SET_MDL_LDR_STAT, payload: { modelID, isLoading: false } });
        return false;
      }
    },
    [state.modelCfgs, state.offlineAssets, dispatch, loadedOfflineModels.current],
  );

  /**
   * @function unloadModel
   * Unloads a specified AI model from memory. For offline models, this would clear the WASM instance.
   * @param {AIModelID} modelID The ID of the model to unload.
   */
  const unloadModel = useCallback(
    async (modelID: AIModelID) => {
      _logEvt(dispatch, "MODEL_UNLOAD_REQ", `Attempting to unload model ${modelID}.`, "info", "useGmaGemAI.unloadModel", { modelID });
      const modelCfg = state.modelCfgs[modelID];
      if (!modelCfg) {
        _logEvt(dispatch, "MODEL_CFG_MISSING_UNLOAD", `Model configuration for ${modelID} not found during unload.`, "warn", "useGmaGemAI.unloadModel", { modelID });
        return;
      }

      try {
        if (modelCfg.offlineSupport && loadedOfflineModels.current[modelID]) {
          await loadedOfflineModels.current[modelID].unload();
          delete loadedOfflineModels.current[modelID];
          _logEvt(dispatch, "OFFLINE_MODEL_UNLOAD_SUCCESS", `Offline model ${modelID} unloaded successfully.`, "info", "useGmaGemAI.unloadModel", { modelID });
        } else {
          // For online models, "unloading" might mean clearing cached credentials or resources
          await new Promise(resolve => setTimeout(resolve, 100)); // Simulate cleanup
          _logEvt(dispatch, "ONLINE_MODEL_UNLOAD_SUCCESS", `Online model ${modelID} cleanup complete.`, "info", "useGmaGemAI.unloadModel", { modelID });
        }
        dispatch({ type: LFSvcAct.SET_MDL_STAT, payload: { modelID, status: ModelStatus.UNLOADED, isAvailable: false } });
        if (state.activeModelID === modelID) {
          dispatch({ type: LFSvcAct.SET_ACTIVE_MODEL, payload: null });
        }
      } catch (error: any) {
        _logEvt(dispatch, "MODEL_UNLOAD_FAIL", `Failed to unload model ${modelID}: ${error.message}.`, "error", "useGmaGemAI.unloadModel", { modelID, error: error.message });
        // Even if unload fails, mark as unloaded from a functional perspective
        dispatch({ type: LFSvcAct.SET_MDL_STAT, payload: { modelID, status: ModelStatus.IDLE, isAvailable: false } });
      }
    },
    [state.modelCfgs, state.activeModelID, dispatch, loadedOfflineModels.current],
  );

  /**
   * @function downloadOfflineAsset
   * Initiates the download and local storage of a specific offline model asset.
   * @param {UniqueID} assetID The ID of the asset to download.
   * @returns {Promise<boolean>} True if the asset is downloaded successfully, false otherwise.
   */
  const downloadOfflineAsset = useCallback(
    async (assetID: UniqueID): Promise<boolean> => {
      const asset = state.offlineAssets[assetID];
      if (!asset) {
        _logEvt(dispatch, "ASSET_NOT_FOUND", `Offline asset ${assetID} not found.`, "error", "useGmaGemAI.downloadAsset", { assetID });
        return false;
      }
      if (asset.downloaded) {
        _logEvt(dispatch, "ASSET_ALREADY_DL", `Offline asset ${assetID} already downloaded.`, "info", "useGmaGemAI.downloadAsset", { assetID });
        return true;
      }
      if (!offlineDBRef.current) {
        _logEvt(dispatch, "DB_NOT_READY", `Offline database not ready to store asset ${assetID}.`, "error", "useGmaGemAI.downloadAsset", { assetID });
        return false;
      }

      // Check available capacity before downloading
      const requiredSpaceBytes = asset.sizeBytes;
      const currentUsedBytes = Object.values(state.offlineAssets)
        .filter(a => a.downloaded)
        .reduce((sum, a) => sum + a.sizeBytes, 0);
      const remainingQuotaBytes = (state.globalSettings.maxOfflineModelSizeGb * 1024 * 1024 * 1024) - currentUsedBytes;

      if (requiredSpaceBytes > remainingQuotaBytes) {
        _logEvt(dispatch, "STORAGE_FULL", `Not enough space to download asset ${assetID}. Required: ${requiredSpaceBytes / (1024 * 1024)}MB, Available: ${remainingQuotaBytes / (1024 * 1024)}MB.`, "error", "useGmaGemAI.downloadAsset", { assetID });
        return false;
      }

      try {
        const updatedAsset = await _fetchAndStoreOfflineAsset(asset, offlineDBRef.current);
        dispatch({ type: LFSvcAct.UPDT_OFL_AST, payload: updatedAsset });
        await _updateOfflineStorageCapacity(dispatch);
        return true;
      } catch (error) {
        return false;
      }
    },
    [state.offlineAssets, state.globalSettings.maxOfflineModelSizeGb, offlineDBRef.current, dispatch],
  );

  /**
   * @function updateGlobalSettings
   * Updates the global AI service settings.
   * @param {Partial<GlobalAISettings>} newSettings The partial settings object to apply.
   */
  const updateGlobalSettings = useCallback(
    (newSettings: Partial<GlobalAISettings>) => {
      dispatch({ type: LFSvcAct.SET_CFG, payload: newSettings });
    },
    [dispatch],
  );

  /**
   * @function updateUserPreferences
   * Updates the user-specific AI interaction preferences.
   * @param {Partial<UserInfAIPrfs>} newPrefs The partial preferences object to apply.
   */
  const updateUserPreferences = useCallback(
    (newPrefs: Partial<UserInfAIPrfs>) => {
      dispatch({ type: LFSvcAct.UPDT_USR_PRF, payload: newPrefs });
    },
    [dispatch],
  );

  /**
   * @function processHighVolumeLogicalForms
   * Processes an array of logical forms in a batched, optimized manner.
   * This function would orchestrate parallel processing, load balancing, and potentially stream processing.
   * @param {LFormInput[]} batch The array of logical form inputs.
   * @param {UniqueID} [batchID] An optional ID for the batch.
   * @returns {Promise<InfRsp[]>} A promise resolving to an array of inference responses.
   */
  const processHighVolumeLogicalForms = useCallback(
    async (batch: LFormInput[], batchID: UniqueID = _genUnqID()): Promise<InfRsp[]> => {
      _logEvt(dispatch, "HV_PROCESS_START_REQ", `Received request to process high-volume batch: ${batchID} (${batch.length} items).`, "info", "useGmaGemAI.highVolume", { batchID, batchSize: batch.length });
      if (!state.featureFlags.enableBatchProcessing) {
        const errMsg = "Batch processing is disabled by feature flag.";
        _logEvt(dispatch, "HV_PROCESS_DISABLED", errMsg, "error", "useGmaGemAI.highVolume", { batchID });
        return Promise.reject(new Error(errMsg));
      }
      if (batch.length === 0) {
        _logEvt(dispatch, "HV_PROCESS_EMPTY_BATCH", `Empty batch provided for processing: ${batchID}.`, "warn", "useGmaGemAI.highVolume", { batchID });
        return [];
      }
      if (!workerPoolRef.current) {
        const errMsg = "Web Worker pool not initialized, cannot perform high-volume processing.";
        _logEvt(dispatch, "HV_PROCESS_NO_WORKER_POOL", errMsg, "error", "useGmaGemAI.highVolume", { batchID });
        return Promise.reject(new Error(errMsg));
      }

      dispatch({ type: LFSvcAct.START_HV_PROC, payload: { batchID } });

      const results: InfRsp[] = [];
      const errors: { id: UniqueID; error: string }[] = [];

      try {
        const preprocessedInputs: { input: LFormInput; prcdLForm: LFormPrcd }[] = [];
        for (const input of batch) {
          const validationError = _validateLFormInput(input);
          if (validationError) {
            _logEvt(dispatch, "HV_INPUT_VAL_FAIL", `Validation failed for item ${input.id} in batch ${batchID}: ${validationError}.`, "error", "useGmaGemAI.highVolume", { batchID, inputID: input.id });
            errors.push({ id: input.id, error: validationError });
            continue;
          }
          const integrityChecksPassed = await _performDataIntegrityChecks(input, state.globalSettings);
          if (!integrityChecksPassed) {
            _logEvt(dispatch, "HV_INTEGRITY_FAIL", `Integrity checks failed for item ${input.id} in batch ${batchID}.`, "error", "useGmaGemAI.highVolume", { batchID, inputID: input.id });
            errors.push({ id: input.id, error: "Data integrity check failed." });
            continue;
          }
          const prcdLForm = await _prepLFormForAI(input.text, input.context);
          preprocessedInputs.push({ input, prcdLForm });
        }

        const taskPromises: Promise<InfRsp>[] = preprocessedInputs.map(async ({ input, prcdLForm }) => {
          const activeModel = input.targetModel || state.userPreferences.preferredModelID;
          const modelCfg = state.modelCfgs[activeModel];

          if (!modelCfg) {
            throw new Error(`No configuration found for model ${activeModel} for input ${input.id}.`);
          }

          const inferenceRequest: LFormInfRqst = {
            rqstID: input.id,
            ts: Date.now(),
            usrID: input.metadata?.userId || "anonymous",
            sessID: input.metadata?.sessionId || batchID,
            priority: input.priority || DFLT_USER_PREFS.preferredProcLvl === ProcLvl.CRITICAL ? 1 : DFLT_USER_PREFS.preferredProcLvl === ProcLvl.COMPLEX ? 3 : 5,
            timeoutMs: state.globalSettings.defaultInfTimeoutMs * 2, // Allow more time for batch items
            modelID: activeModel,
            infMode: input.preferredMode || state.userPreferences.defaultInfMode,
            lFormTxt: prcdLForm.originalTxt,
            ctxData: input.context,
            dataSrc: DataSrcTyp.API_FEED, // Assume HV data comes from API feeds typically
            procLvl: input.procLvl || DFLT_USER_PREFS.preferredProcLvl,
            batchID: batchID,
            securityChecks: true,
            inputHash: _genInfCacheKey({
              rqstID: input.id,
              ts: Date.now(),
              priority: 5,
              timeoutMs: state.globalSettings.defaultInfTimeoutMs,
              modelID: activeModel,
              infMode: input.preferredMode || state.userPreferences.defaultInfMode,
              lFormTxt: prcdLForm.originalTxt,
              ctxData: input.context,
              dataSrc: DataSrcTyp.USER_INPUT,
              procLvl: input.procLvl || DFLT_USER_PREFS.preferredProcLvl,
              securityChecks: true,
            } as LFormInfRqst),
          };

          // Check cache first
          const cacheKey = _genInfCacheKey(inferenceRequest);
          if (state.globalSettings.enableCache && state.aiCache[cacheKey]) {
            const cachedEntry = state.aiCache[cacheKey];
            if (Date.now() < cachedEntry.timestamp + cachedEntry.ttl) {
              cachedEntry.hits++;
              dispatch({ type: LFSvcAct.ADD_CACHE_ENT, payload: cachedEntry });
              _logEvt(dispatch, "HV_CACHE_HIT", `Batch ${batchID}: Cache hit for item ${input.id}.`, "debug", "useGmaGemAI.highVolume", { batchID, inputID: input.id });
              return { ...cachedEntry.rsp, cachedRsp: true };
            } else {
              delete state.aiCache[cacheKey]; // Expired
            }
          }

          let modelInstance: any;
          if (inferenceRequest.infMode === InfMode.OFFLINE && modelCfg.offlineSupport && state.modelStats[inferenceRequest.modelID]?.offlineReady) {
            modelInstance = loadedOfflineModels.current[inferenceRequest.modelID];
            if (!modelInstance || !modelInstance.isLoaded) {
              throw new Error(`Offline model ${inferenceRequest.modelID} not loaded for input ${input.id}.`);
            }
            return await workerPoolRef.current!.runTask("inference", { type: "offline", rqst: inferenceRequest, modelCfg, modelInstanceRef: modelInstance });
          } else if (inferenceRequest.infMode === InfMode.HYBRID && modelCfg.offlineSupport && state.modelStats[inferenceRequest.modelID]?.offlineReady) {
            try {
              modelInstance = loadedOfflineModels.current[inferenceRequest.modelID];
              if (!modelInstance || !modelInstance.isLoaded) {
                throw new Error(`Offline model ${inferenceRequest.modelID} not loaded for hybrid inference.`);
              }
              const offlineRes = await workerPoolRef.current!.runTask("inference", { type: "offline", rqst: inferenceRequest, modelCfg, modelInstanceRef: modelInstance });
              _logEvt(dispatch, "HV_HYBRID_OFFLINE_SUCCESS", `Batch ${batchID}: Hybrid offline success for item ${input.id}.`, "debug", "useGmaGemAI.highVolume", { batchID, inputID: input.id });
              return offlineRes;
            } catch (offlineErr: any) {
              _logEvt(dispatch, "HV_HYBRID_OFFLINE_FAIL_FALLBACK", `Batch ${batchID}: Hybrid offline failed for item ${input.id}, falling back to online. Error: ${offlineErr.message}`, "warn", "useGmaGemAI.highVolume", { batchID, inputID: input.id, error: offlineErr.message });
              return await workerPoolRef.current!.runTask("inference", { type: "online", rqst: inferenceRequest, modelCfg });
            }
          } else {
            return await workerPoolRef.current!.runTask("inference", { type: "online", rqst: inferenceRequest, modelCfg });
          }
        });

        // Use Promise.allSettled to allow some inferences to fail without stopping the entire batch
        const settlementResults = await Promise.allSettled(taskPromises);

        settlementResults.forEach((settledResult, index) => {
          const originalInput = preprocessedInputs[index]?.input;
          if (settledResult.status === "fulfilled") {
            const infResult = settledResult.value;
            const postProcessedResult = infResult && infResult.rqstID ? _postProcessInfResult(infResult, originalInput?.metadata?.postProcFn) : infResult; // Apply post-processing if needed
            results.push(postProcessedResult);
            dispatch({ type: LFSvcAct.CMPLT_INF_RSP, payload: postProcessedResult! }); // Dispatch to state for general tracking
          } else {
            const error = settledResult.reason?.message || "Unknown error";
            const errRsp: InfRsp = {
              rspID: _genUnqID(),
              rqstID: originalInput?.id || _genUnqID(),
              ts: Date.now(),
              modelID: originalInput?.targetModel || state.userPreferences.preferredModelID,
              completionTxt: "",
              latencyMs: 0,
              error: { code: ErrCd.INF_EXEC_FAIL, message: `Batch item processing failed: ${error}` },
            };
            results.push(errRsp);
            errors.push({ id: originalInput?.id || "unknown", error: error });
            dispatch({ type: LFSvcAct.CMPLT_INF_RSP, payload: errRsp });
            _logEvt(dispatch, "HV_ITEM_FAIL", `Batch ${batchID}: Item ${originalInput?.id} failed processing with error: ${error}.`, "error", "useGmaGemAI.highVolume", { batchID, inputID: originalInput?.id, error });
          }
        });

      } catch (e: any) {
        _logEvt(dispatch, "HV_PROCESS_GLOBAL_FAIL", `High-volume batch ${batchID} failed globally: ${e.message}.`, "fatal", "useGmaGemAI.highVolume", { batchID, error: e.message });
        dispatch({ type: LFSvcAct.SET_SYS_HLTH, payload: "critical" });
        return Promise.reject(new Error(`High-volume processing for batch ${batchID} failed: ${e.message}`));
      } finally {
        dispatch({ type: LFSvcAct.END_HV_PROC, payload: null });
        if (errors.length > 0) {
          _logEvt(dispatch, "HV_PROCESS_WITH_ERRORS", `High-volume batch ${batchID} completed with ${errors.length} errors.`, "warn", "useGmaGemAI.highVolume", { batchID, totalItems: batch.length, errorsCount: errors.length });
        } else {
          _logEvt(dispatch, "HV_PROCESS_COMPLETE", `High-volume batch ${batchID} completed successfully.`, "info", "useGmaGemAI.highVolume", { batchID, totalItems: batch.length });
        }
      }

      return results;
    },
    [state.featureFlags.enableBatchProcessing, state.globalSettings, state.userPreferences, state.modelCfgs, state.offlineAssets, dispatch, loadedOfflineModels.current, workerPoolRef.current],
  );

  /**
   * @function flushInferenceQueue
   * Clears all pending inference requests from the queue.
   */
  const flushInferenceQueue = useCallback(() => {
    dispatch({ type: LFSvcAct.FLUSH_QUEUE, payload: null });
  }, [dispatch]);

  /**
   * @function clearAICache
   * Clears the AI inference cache.
   */
  const clearAICache = useCallback(() => {
    dispatch({ type: LFSvcAct.CLEAR_CACHE, payload: null });
  }, [dispatch]);

  /**
   * @function resetService
   * Resets the entire AI service state to its initial default configuration.
   * This will also terminate workers and clear loaded models.
   */
  const resetService = useCallback(() => {
    _logEvt(dispatch, "SERVICE_RESET_REQ", "Initiating full AI service reset.", "warn", "useGmaGemAI.resetService");
    workerPoolRef.current?.shutdown();
    loadedOfflineModels.current = {}; // Clear loaded model instances
    dispatch({ type: LFSvcAct.RESET_STATE, payload: null });
    _logEvt(dispatch, "SERVICE_RESET_COMPLETE", "AI service reset completed. Re-initializing...", "info", "useGmaGemAI.resetService");
    // Re-initialize after reset, similar to initial mount logic
    // (This part would ideally be handled by a re-trigger of the `useEffect` on state.isInitialized = false)
  }, [dispatch]);

  /**
   * @function isModelLoaded
   * Checks if a specific model is currently loaded and ready for inference.
   * @param {AIModelID} modelID The ID of the model to check.
   * @returns {boolean} True if the model is loaded, false otherwise.
   */
  const isModelLoaded = useCallback(
    (modelID: AIModelID): boolean => {
      const status = state.modelStats[modelID]?.status;
      return status === ModelStatus.READY || status === ModelStatus.OFFLINE;
    },
    [state.modelStats],
  );

  /**
   * @function isModelLoading
   * Checks if a specific model is currently in the process of loading or initializing.
   * @param {AIModelID} modelID The ID of the model to check.
   * @returns {boolean} True if the model is loading, false otherwise.
   */
  const isModelLoading = useCallback(
    (modelID: AIModelID): boolean => {
      return state.activeLoaders[modelID] === true;
    },
    [state.activeLoaders],
  );

  /**
   * @function isServiceInitialized
   * Indicates whether the `useGmaGemAI` service has completed its initial setup.
   * @returns {boolean} True if the service is initialized, false otherwise.
   */
  const isServiceInitialized = useMemo(() => state.isInitialized, [state.isInitialized]);

  // Public API of the hook
  return {
    state,
    processLogicalForm,
    loadModel,
    unloadModel,
    downloadOfflineAsset,
    updateGlobalSettings,
    updateUserPreferences,
    processHighVolumeLogicalForms,
    flushInferenceQueue,
    clearAICache,
    resetService,
    isModelLoaded,
    isModelLoading,
    isServiceInitialized,
  };
}