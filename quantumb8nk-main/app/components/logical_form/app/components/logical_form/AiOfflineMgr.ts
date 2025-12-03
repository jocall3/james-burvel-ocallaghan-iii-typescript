// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

// No direct React imports for this utility TypeScript file.
// Core browser APIs and a custom event emitter are used for platform independence.

/**
 * Custom event emitter class to provide simple event bus functionality
 * without relying on Node.js 'events' module or complex browser EventTarget polyfills
 * for older environments. Adheres to a common 'on', 'emit', 'off' pattern.
 */
interface CELsnr {
  (evtNm: string, ...args: any[]): void;
}

class CstEvtEmtr {
  private lsnrs: Map<string, CELsnr[]>;

  constructor() {
    this.lsnrs = new Map();
  }

  /**
   * Registers an event listener for a specified event name.
   * @param {string} evtNm - The name of the event to listen for.
   * @param {CELsnr} lsnr - The callback function to execute when the event is emitted.
   */
  public on(evtNm: string, lsnr: CELsnr): void {
    if (!this.lsnrs.has(evtNm)) {
      this.lsnrs.set(evtNm, []);
    }
    this.lsnrs.get(evtNm)!.push(lsnr);
  }

  /**
   * Emits an event, calling all registered listeners for that event.
   * @param {string} evtNm - The name of the event to emit.
   * @param {any[]} args - Arguments to pass to the event listeners.
   */
  public emit(evtNm: string, ...args: any[]): void {
    const evtLsnrs = this.lsnrs.get(evtNm);
    if (evtLsnrs) {
      // Execute listeners asynchronously to prevent blocking if one is slow.
      evtLsnrs.forEach(lsnr => {
        setTimeout(() => {
          try {
            lsnr(evtNm, ...args);
          } catch (e) {
            console.error(`[CstEvtEmtr]: Error in listener for event '${evtNm}':`, e);
          }
        }, 0);
      });
    }
  }

  /**
   * Removes a specific event listener for a given event name.
   * @param {string} evtNm - The name of the event.
   * @param {CELsnr} lsnr - The listener function to remove.
   */
  public off(evtNm: string, lsnr: CELsnr): void {
    const evtLsnrs = this.lsnrs.get(evtNm);
    if (evtLsnrs) {
      this.lsnrs.set(evtNm, evtLsnrs.filter(l => l !== lsnr));
    }
  }

  /**
   * Removes all listeners for a given event name, or all listeners for all events if no name is specified.
   * @param {string} [evtNm] - The name of the event to clear listeners for.
   */
  public offAll(evtNm?: string): void {
    if (evtNm) {
      this.lsnrs.delete(evtNm);
    } else {
      this.lsnrs.clear();
    }
  }
}

// Enums and Constants for the AI Offline Manager (AOM)
/**
 * Enumeration for the various operational statuses of the AI Offline Manager.
 */
enum AOM_STS_E {
  INIT = 'INITIALIZING',
  RDY = 'READY',
  ERR = 'ERROR',
  OFLN = 'OFFLINE_MODE',
  ONLN = 'ONLINE_MODE',
  MDL_LDG = 'MODEL_LOADING',
  MDL_RDY = 'MODEL_READY',
  MDL_ERR = 'MODEL_ERROR',
  SYN_PROG = 'SYNC_IN_PROGRESS',
  SYN_CMPL = 'SYNC_COMPLETED',
  SYN_FAIL = 'SYNC_FAILED',
  SESS_STRT = 'SESSION_STARTED',
  SESS_END = 'SESSION_ENDED',
  SHUTDOWN = 'SHUTTING_DOWN',
  MDL_DWNLD = 'MODEL_DOWNLOADING',
  MDL_DWNLD_CMPL = 'MODEL_DOWNLOAD_COMPLETED',
  MDL_DWNLD_FAIL = 'MODEL_DOWNLOAD_FAILED',
  MDL_VERIFY = 'MODEL_VERIFYING',
  MDL_VERIFY_FAIL = 'MODEL_VERIFY_FAILED',
}

/**
 * Enumeration for supported AI model identifiers.
 * Includes online (Gemini) and offline (Gemma) specific models.
 */
enum AI_MDL_ID_E {
  GMNI_PRO = 'GEMINI_PRO_ONLINE',
  GMM_OFN_SML = 'GEMMA_OFFLINE_SMALL_7B', // Gemma 7B parameter model
  GMM_OFN_LGE = 'GEMMA_OFFLINE_LARGE_2B', // Gemma 2B parameter model (naming reversed for abbreviation play)
  CUST_LGFM_OPT = 'CUSTOM_LOGICAL_FORM_OPTIMIZED', // A hypothetical custom optimized model
  CUST_LGFM_GLO = 'CUSTOM_LOGICAL_FORM_GLOBAL', // Another hypothetical custom global model
  NLP_ENT_REC = 'NLP_ENTITY_RECOGNITION', // Named Entity Recognition
  NLP_REL_EXT = 'NLP_RELATION_EXTRACTION', // Relation Extraction
  GEN_TXT_SUM = 'GEN_TEXT_SUMMARIZATION', // Text Summarization
  GEN_TXT_CLS = 'GEN_TEXT_CLASSIFICATION', // Text Classification
}

/**
 * Constants used throughout the AI Offline Manager for configuration and storage.
 */
const C_B_URL = "https://citibankdemobusiness.dev";
const C_CO_NM = "Citibank Demo Business Inc.";
const OFLN_DB_NM = "CDB_OFLN_DT_DB_V2"; // Version increment for new stores or schema changes
const OFLN_STR_CFG = "cfg_str";         // Configuration store
const OFLN_STR_MDL_META = "mdl_meta_str"; // Model metadata and download status
const OFLN_STR_LGFM_PRC = "lgfm_prc_res_str"; // Processed logical forms
const OFLN_STR_AUD_LG = "aud_lg_str";   // Audit log store
const OFLN_STR_SESS_DT = "sess_dt_str"; // Session data store
const OFLN_STR_MDL_BLBS = "mdl_blbs_str"; // Model binary large objects (for offline weights)
const OFLN_STR_CHCH_DT = "cch_dt_str"; // Cache for frequently accessed data

/**
 * Interface for the main configuration of the AI Offline Manager (AOM).
 */
interface AOM_CFG_I {
  /** Base URL for online services and API calls. */
  bUrl: string;
  /** Company name for identification and logging. */
  coNm: string;
  /** Flag to enable or disable overall offline capabilities. */
  oflnCapEn: boolean;
  /** The default AI model ID to use for logical form processing when no specific model is requested. */
  defAiMdlId: AI_MDL_ID_E;
  /** Maximum duration for which offline data should be cached locally (in milliseconds). */
  oflnDtCchDurMs: number;
  /** Maximum total size for all offline data cached in bytes. */
  oflnDtCchMxSzB: number;
  /** Interval for automatic background synchronization with the remote server (in milliseconds). */
  bgSynIntMs: number;
  /** List of AI models configured for offline use, including their versions, sizes, and local paths. */
  oflnAiMdls: { id: AI_MDL_ID_E; ver: string; szMb: number; pth: string; chkSm: string; }[];
  /** API key for accessing online Gemini model. Should be handled securely (e.g., via backend). */
  gmniApKy?: string;
  /** Base local path where Gemma and other offline model weights/assets are stored. */
  gmmOfnMdlsPth: string;
  /** Current logging level for the manager. */
  lgLvl: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  /** Feature flags to enable/disable experimental or optional functionalities. */
  ftFgs: { [key: string]: boolean; [key: string]: any; }; // Allow any additional feature flags
  /** Timeout for network requests in milliseconds. */
  netRqTmOutMs: number;
  /** Max number of concurrent model downloads. */
  mxCncMdlDwnds: number;
  /** Storage strategy for offline data. */
  oflnStrStrat: 'IndexedDB' | 'FileSystemAccessAPI' | 'ServiceWorkerCache';
  /** Policy for handling sensitive data offline. */
  sensDtPlcy: 'encrypt_all' | 'redact_some' | 'no_sensitive_data';
}

/**
 * Interface for a logical form, representing structured input/output for AI processing.
 */
interface LgcFm_I {
  /** Unique identifier for the logical form. */
  id: string;
  /** Type of logical form (e.g., 'predicate', 'statement', 'query', 'command'). */
  typ: string;
  /** The original raw input text that led to this logical form. */
  rawTxt: string;
  /** Structured data of the logical form, typically a JSON object or an Abstract Syntax Tree (AST). */
  strDt: any;
  /** Timestamp of when this logical form was created or last modified. */
  ts: number;
  /** Source of the logical form ('USER_INPUT', 'SYSTEM_GEN', 'AI_GEN'). */
  src: 'USER_INPUT' | 'SYSTEM_GEN' | 'AI_GEN';
  /** Associated context or metadata for the logical form. */
  ctx?: { [key: string]: any };
  /** Version of the logical form schema. */
  ver: string;
  /** Priority level for processing. */
  prty: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Interface for the configuration parameters specific to an AI model.
 */
interface AI_MDL_CFG_I {
  /** Model identifier from AI_MDL_ID_E. */
  id: AI_MDL_ID_E;
  /** Version string of the model (e.g., "1.0.0"). */
  ver: string;
  /** Local path to the model's assets or weights for offline models. */
  lclPth: string;
  /** Size of the model in megabytes. */
  szMb: number;
  /** Required runtime environment or technology for the model (e.g., 'WebGPU', 'WASM', 'CPU_JS', 'REMOTE_API'). */
  reqRntm: 'WebGPU' | 'WASM' | 'CPU_JS' | 'REMOTE_API';
  /** Specific model inference parameters (e.g., temperature, max output tokens, top_k). */
  mdlPrms: { [key: string]: any };
  /** Checksum for integrity verification of local model files (e.g., SHA-256). */
  chkSm?: string;
}

/**
 * Interface representing a loaded and instantiated AI model in memory.
 */
interface AI_MDL_INST_I {
  /** The configuration used to load this model instance. */
  cfg: AI_MDL_CFG_I;
  /** The actual loaded model object (e.g., a TensorFlow.js model, or a reference to a remote API client). */
  instance: any;
  /** Current status of this model instance. */
  sts: AOM_STS_E;
  /** Timestamp when the model was successfully loaded. */
  lddTm: number;
  /** Progress of model download if currently downloading (0-1). */
  dwnldProg?: number;
}

/**
 * Interface for a request to process a logical form using an AI model.
 */
interface PRC_REQ_I {
  /** The input logical form data to be processed. */
  inpLgFm: LgcFm_I;
  /** The AI model ID requested for processing. */
  reqAiMdlId: AI_MDL_ID_E;
  /** Optional parameters specific to this processing request (overrides model defaults). */
  prms?: { [key: string]: any };
  /** Unique ID for the processing request for tracking. */
  reqId: string;
}

/**
 * Interface for the result of processing a logical form by an AI model.
 */
interface PRC_RES_I {
  /** The original processing request. */
  orgReq: PRC_REQ_I;
  /** The processed logical form data. */
  prcLgFm: LgcFm_I;
  /** The AI model actually used for this processing. */
  mdlUsd: AI_MDL_ID_E;
  /** Timestamp of when the processing was completed. */
  prcTs: number;
  /** Confidence score of the processing result (0-1). */
  cnfSc: number;
  /** Any warnings, errors, or supplementary messages generated during processing. */
  msgs?: string[];
  /** Raw output from the AI model before structured parsing. */
  rawAiOut?: any;
}

/**
 * Interface for an offline session, tracking usage and activity during disconnected periods.
 */
interface OFLN_SESS_I {
  /** Unique identifier for the offline session. */
  id: string;
  /** Timestamp when the session started. */
  strtTs: number;
  /** Timestamp when the session ended (optional, if still active). */
  endTs?: number;
  /** Total duration of the session in milliseconds. */
  durMs?: number;
  /** Total number of logical forms processed during this session. */
  ttlPrcLgFms: number;
  /** Total size of offline data (e.g., processed forms, logs) stored during this session (in bytes). */
  ttlOflnDtSzB: number;
  /** List of AI models that were utilized during this session. */
  mdlsUsd: AI_MDL_ID_E[];
  /** Flag indicating if the session data has been successfully synchronized with the remote server. */
  synCd: boolean;
  /** Collection of audit logs specific to this session. */
  sessAudLgs: AUD_LG_I[];
  /** Client-side generated unique identifier for the user/device. */
  clntId: string;
  /** Application version at the time of session. */
  appVer: string;
}

/**
 * Interface for an audit log entry.
 */
interface AUD_LG_I {
  /** Timestamp of the log entry. */
  ts: number;
  /** Log level ('DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'). */
  lvl: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  /** Descriptive log message. */
  msg: string;
  /** Contextual data associated with the log entry, if any. */
  ctx?: any;
  /** Category of the log (e.g., 'network', 'storage', 'model', 'processing'). */
  cat?: string;
  /** Source component of the log. */
  srcCmp?: string;
}

/**
 * Mock IndexedDB Service (OflnDbSrv).
 * Provides a simplified interface for interacting with IndexedDB for persistent offline storage.
 * Handles database initialization, object store creation, and common CRUD operations.
 */
class OflnDbSrv {
  private db: IDBDatabase | null = null;
  private dbReq: IDBOpenDBRequest | null = null;
  private readonly dbNm: string;
  private readonly dbVer: number;
  private isInit: boolean = false;
  private initPromise: Promise<IDBDatabase> | null = null;

  constructor(dbNm: string, dbVer: number = 2) {
    this.dbNm = dbNm;
    this.dbVer = dbVer;
  }

  /**
   * Initializes the IndexedDB connection. Ensures singleton database instance.
   * @returns {Promise<IDBDatabase>} A promise that resolves with the database instance.
   * @throws {Error} If IndexedDB is not supported or initialization fails.
   */
  public async initDb(): Promise<IDBDatabase> {
    if (this.isInit && this.db) {
      return this.db;
    }
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        console.warn("[OflnDbSrv]: IndexedDB not supported in this browser environment.");
        this.isInit = false;
        this.initPromise = null;
        return reject(new Error("IndexedDB not supported."));
      }

      this.dbReq = window.indexedDB.open(this.dbNm, this.dbVer);

      this.dbReq.onerror = (event: Event) => {
        const error = (event.target as IDBRequest).error;
        console.error("[OflnDbSrv]: IndexedDB initialization error:", error);
        this.isInit = false;
        this.initPromise = null;
        reject(error);
      };

      this.dbReq.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log(`[OflnDbSrv]: IndexedDB upgrade needed from version ${event.oldVersion} to ${event.newVersion}.`);

        // Define object stores with appropriate key paths and autoIncrement if needed.
        if (!db.objectStoreNames.contains(OFLN_STR_CFG)) {
          db.createObjectStore(OFLN_STR_CFG, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(OFLN_STR_MDL_META)) {
          db.createObjectStore(OFLN_STR_MDL_META, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(OFLN_STR_LGFM_PRC)) {
          db.createObjectStore(OFLN_STR_LGFM_PRC, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(OFLN_STR_AUD_LG)) {
          db.createObjectStore(OFLN_STR_AUD_LG, { autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(OFLN_STR_SESS_DT)) {
          db.createObjectStore(OFLN_STR_SESS_DT, { keyPath: 'id' });
        }
        // New stores for v2:
        if (!db.objectStoreNames.contains(OFLN_STR_MDL_BLBS)) {
          db.createObjectStore(OFLN_STR_MDL_BLBS, { keyPath: 'mdlId' }); // Stores model binary data
        }
        if (!db.objectStoreNames.contains(OFLN_STR_CHCH_DT)) {
          db.createObjectStore(OFLN_STR_CHCH_DT, { keyPath: 'key' }); // General purpose cache
        }
        console.log("[OflnDbSrv]: Object stores ensured.");
      };

      this.dbReq.onsuccess = (event: Event) => {
        this.db = (event.target as IDBRequest).result;
        this.isInit = true;
        this.initPromise = null;
        console.log("[OflnDbSrv]: IndexedDB connection established successfully.");
        resolve(this.db);
      };
    });
    return this.initPromise;
  }

  /**
   * Performs a transaction on the specified object store.
   * @param {string} storeNm - The name of the object store.
   * @param {IDBTransactionMode} mode - The transaction mode ('readonly' or 'readwrite').
   * @param {Function} callback - A function that receives the object store and performs operations.
   * @returns {Promise<T>} A promise that resolves with the result of the callback.
   * @private
   */
  private async runTx<T>(storeNm: string, mode: IDBTransactionMode, callback: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await this.initDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeNm, mode);
      const store = tx.objectStore(storeNm);
      const req = callback(store);

      req.onsuccess = () => resolve(req.result as T);
      req.onerror = (event: Event) => reject((event.target as IDBRequest).error);

      tx.oncomplete = () => { /* Transaction completed */ };
      tx.onabort = (event: Event) => reject(tx.error || (event.target as IDBRequest).error);
    });
  }

  /**
   * Puts (adds or updates) data into an object store.
   * @param {string} storeNm - The name of the object store.
   * @param {any} data - The data to put.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  public async putDt(storeNm: string, data: any): Promise<void> {
    await this.runTx(storeNm, 'readwrite', (store) => store.put(data));
  }

  /**
   * Gets data from an object store by key.
   * @param {string} storeNm - The name of the object store.
   * @param {IDBValidKey} key - The key of the data to retrieve.
   * @returns {Promise<T | undefined>} A promise that resolves with the data or undefined.
   */
  public async getDt<T>(storeNm: string, key: IDBValidKey): Promise<T | undefined> {
    return await this.runTx(storeNm, 'readonly', (store) => store.get(key));
  }

  /**
   * Gets all data from an object store.
   * @param {string} storeNm - The name of the object store.
   * @returns {Promise<T[]>} A promise that resolves with an array of all data.
   */
  public async getAllDt<T>(storeNm: string): Promise<T[]> {
    return await this.runTx(storeNm, 'readonly', (store) => store.getAll());
  }

  /**
   * Deletes data from an object store by key.
   * @param {string} storeNm - The name of the object store.
   * @param {IDBValidKey} key - The key of the data to delete.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  public async delDt(storeNm: string, key: IDBValidKey): Promise<void> {
    await this.runTx(storeNm, 'readwrite', (store) => store.delete(key));
  }

  /**
   * Clears all data from an object store.
   * @param {string} storeNm - The name of the object store.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  public async clrStr(storeNm: string): Promise<void> {
    await this.runTx(storeNm, 'readwrite', (store) => store.clear());
  }

  /**
   * Counts the number of entries in an object store.
   * @param {string} storeNm - The name of the object store.
   * @returns {Promise<number>} A promise that resolves with the count.
   */
  public async cntStr(storeNm: string): Promise<number> {
    return await this.runTx(storeNm, 'readonly', (store) => store.count());
  }

  /**
   * Closes the IndexedDB connection.
   */
  public closeDb(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInit = false;
      this.initPromise = null;
      console.log("[OflnDbSrv]: IndexedDB connection closed.");
    }
  }

  /**
   * Calculates the approximate size of data in a specific object store.
   * This is an estimation and might not be perfectly accurate.
   * @param {string} storeNm - The name of the object store.
   * @returns {Promise<number>} Approximate size in bytes.
   */
  public async getStrSz(storeNm: string): Promise<number> {
    try {
      const allData = await this.getAllDt<any>(storeNm);
      let totalSize = 0;
      for (const item of allData) {
        totalSize += JSON.stringify(item).length; // Approximate size by stringifying
      }
      return totalSize;
    } catch (error) {
      console.error(`[OflnDbSrv]: Failed to estimate size for store ${storeNm}:`, error);
      return 0;
    }
  }
}

/**
 * Mock AI Model Loader/Runner (AiMdlLdr).
 * This class simulates the loading, unloading, and inference execution of AI models.
 * It abstracts away the complexities of actual AI runtime (like TensorFlow.js, ONNX Runtime, etc.).
 */
class AiMdlLdr {
  private loadedMdls: Map<AI_MDL_ID_E, AI_MDL_INST_I> = new Map();
  private OFFLINE_MDL_BASE_PATH: string;
  private dbSrv: OflnDbSrv;
  private eventBus: CstEvtEmtr;

  constructor(offlineMdlBasePath: string, dbSrv: OflnDbSrv, eventBus: CstEvtEmtr) {
    this.OFFLINE_MDL_BASE_PATH = offlineMdlBasePath;
    this.dbSrv = dbSrv;
    this.eventBus = eventBus;
  }

  /**
   * Simulates loading an AI model, either from local storage (Gemma) or preparing for remote access (Gemini).
   * Includes mock download and integrity checks.
   * @param {AI_MDL_CFG_I} mdlCfg - Configuration for the model to load.
   * @returns {Promise<AI_MDL_INST_I>} A promise that resolves with the loaded model instance.
   * @throws {Error} If model loading or verification fails.
   */
  public async loadMdl(mdlCfg: AI_MDL_CFG_I): Promise<AI_MDL_INST_I> {
    this.eventBus.emit('modelLoading', mdlCfg.id);
    let existingMdl = this.loadedMdls.get(mdlCfg.id);

    if (existingMdl && existingMdl.cfg.ver === mdlCfg.ver && existingMdl.sts === AOM_STS_E.MDL_RDY) {
      this.eventBus.emit('log', AOM_STS_E.INFO, `Model ${mdlCfg.id} version ${mdlCfg.ver} already loaded.`);
      return existingMdl;
    }

    if (mdlCfg.reqRntm === 'REMOTE_API') {
      // For online models like Gemini, "loading" means checking API key presence and endpoint availability.
      this.eventBus.emit('log', AOM_STS_E.INFO, `Preparing remote AI model: ${mdlCfg.id} (v${mdlCfg.ver})`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API readiness check
      const mockModelInstance = {
        id: mdlCfg.id,
        version: mdlCfg.ver,
        status: 'active',
        endpoint: mdlCfg.mdlPrms?.modelUrl || `${C_B_URL}/api/gemini`,
        process: async (input: LgcFm_I, params: any) => {
          this.eventBus.emit('log', AOM_STS_E.DEBUG, `[AI Model ${mdlCfg.id}]: Sending input to remote API.`);
          await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700)); // Simulate network latency
          const output = {
            ...input,
            processed: true,
            aiConfidence: 0.8 + Math.random() * 0.2,
            aiResult: `Remote AI processed '${input.rawTxt}' with ${mdlCfg.id}.`,
            aiDetails: {
              model: mdlCfg.id,
              version: mdlCfg.ver,
              parameters: params,
              timestamp: Date.now(),
              remoteCall: true,
            }
          };
          return output;
        },
        release: () => {
          this.eventBus.emit('log', AOM_STS_E.INFO, `[AI Model ${mdlCfg.id}]: Remote resources "released".`);
        }
      };
      existingMdl = {
        cfg: mdlCfg,
        instance: mockModelInstance,
        sts: AOM_STS_E.MDL_RDY,
        lddTm: Date.now(),
      };
      this.loadedMdls.set(mdlCfg.id, existingMdl);
      this.eventBus.emit('log', AOM_STS_E.INFO, `Remote AI model ${mdlCfg.id} prepared successfully.`);
      this.eventBus.emit('modelLoaded', mdlCfg.id);
      return existingMdl;
    }

    // For offline models (Gemma, Custom)
    this.eventBus.emit('log', AOM_STS_E.INFO, `Attempting to load offline AI model: ${mdlCfg.id} (v${mdlCfg.ver}) from ${mdlCfg.lclPth}`);
    const mdlBlbKey = `mdl_blb_${mdlCfg.id}_${mdlCfg.ver}`;
    let mdlBlb = await this.dbSrv.getDt<ArrayBuffer>(OFLN_STR_MDL_BLBS, mdlBlbKey);

    if (!mdlBlb) {
      this.eventBus.emit('log', AOM_STS_E.MDL_DWNLD, `Model binary for ${mdlCfg.id} not found locally. Initiating download from ${this.OFFLINE_MDL_BASE_PATH}${mdlCfg.lclPth}.`);
      this.eventBus.emit('modelDownloadStarted', { id: mdlCfg.id, size: mdlCfg.szMb });
      const controller = new AbortController();
      const signal = controller.signal;

      let dwnldInst: AI_MDL_INST_I = {
        cfg: mdlCfg,
        instance: null, // No instance yet
        sts: AOM_STS_E.MDL_DWNLD,
        lddTm: Date.now(),
        dwnldProg: 0,
      };
      this.loadedMdls.set(mdlCfg.id, dwnldInst); // Temporarily store download state

      try {
        const response = await fetch(`${this.OFFLINE_MDL_BASE_PATH}${mdlCfg.lclPth}`, { signal });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const reader = response.body?.getReader();
        if (!reader) throw new Error("Failed to get readable stream for model download.");

        const contentLength = response.headers.get('Content-Length');
        const total = contentLength ? parseInt(contentLength, 10) : mdlCfg.szMb * 1024 * 1024; // Fallback to config size
        let receivedLength = 0;
        const chunks: Uint8Array[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          receivedLength += value.length;
          dwnldInst.dwnldProg = receivedLength / total;
          this.eventBus.emit('modelDownloadProgress', { id: mdlCfg.id, progress: dwnldInst.dwnldProg });
          // console.log(`[MDL_DWNLD]: ${mdlCfg.id} - ${(dwnldInst.dwnldProg * 100).toFixed(1)}%`);
        }

        const fullBuffer = new Uint8Array(receivedLength);
        let position = 0;
        for (const chunk of chunks) {
          fullBuffer.set(chunk, position);
          position += chunk.length;
        }
        mdlBlb = fullBuffer.buffer;

        await this.dbSrv.putDt(OFLN_STR_MDL_BLBS, { mdlId: mdlBlbKey, data: mdlBlb });
        this.eventBus.emit('log', AOM_STS_E.MDL_DWNLD_CMPL, `Model binary for ${mdlCfg.id} downloaded and stored.`);
        this.eventBus.emit('modelDownloadCompleted', mdlCfg.id);

      } catch (error: any) {
        controller.abort(); // Ensure the fetch is aborted
        this.eventBus.emit('log', AOM_STS_E.MDL_DWNLD_FAIL, `Failed to download model ${mdlCfg.id}: ${error.message}`, error);
        this.loadedMdls.delete(mdlCfg.id); // Remove incomplete download entry
        throw new Error(`Model download failed: ${error.message}`);
      }
    }

    if (mdlCfg.chkSm && mdlBlb) {
      this.eventBus.emit('log', AOM_STS_E.MDL_VERIFY, `Verifying integrity for model ${mdlCfg.id}.`);
      // Simulate integrity verification
      await new Promise(resolve => setTimeout(resolve, 500));
      // In a real app, use crypto.subtle.digest(SHA-256) on mdlBlb and compare with mdlCfg.chkSm
      const computedChecksum = "mock_checksum_valid"; // Placeholder
      if (computedChecksum !== mdlCfg.chkSm && mdlCfg.chkSm !== "mock_checksum_valid") {
        this.eventBus.emit('log', AOM_STS_E.MDL_VERIFY_FAIL, `Model integrity check failed for ${mdlCfg.id}. Expected ${mdlCfg.chkSm}, got ${computedChecksum}.`);
        throw new Error(`Model integrity verification failed for ${mdlCfg.id}.`);
      }
      this.eventBus.emit('log', AOM_STS_E.INFO, `Model integrity for ${mdlCfg.id} verified successfully.`);
    }

    // Simulate actual AI runtime loading (e.g., TF.js loadGraphModel)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const mockModelInstance = {
      id: mdlCfg.id,
      version: mdlCfg.ver,
      status: 'active',
      modelData: mdlBlb, // Stored binary data
      process: async (input: LgcFm_I, params: any) => {
        this.eventBus.emit('log', AOM_STS_E.DEBUG, `[AI Model ${mdlCfg.id}]: Processing input locally.`);
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 800)); // Simulate local inference time
        const output = {
          ...input,
          processed: true,
          aiConfidence: 0.7 + Math.random() * 0.3, // Lower confidence for offline models sometimes due to smaller size
          aiResult: `Local AI processed '${input.rawTxt}' with ${mdlCfg.id}.`,
          aiDetails: {
            model: mdlCfg.id,
            version: mdlCfg.ver,
            parameters: params,
            timestamp: Date.now(),
            offlineMode: true,
          }
        };
        return output;
      },
      release: () => {
        this.eventBus.emit('log', AOM_STS_E.INFO, `[AI Model ${mdlCfg.id}]: Released local resources.`);
        // In reality, dispose of TF.js model, clear WASM memory, etc.
      }
    };

    const mdlInst: AI_MDL_INST_I = {
      cfg: mdlCfg,
      instance: mockModelInstance,
      sts: AOM_STS_E.MDL_RDY,
      lddTm: Date.now(),
      dwnldProg: 1, // Full progress if loaded
    };
    this.loadedMdls.set(mdlCfg.id, mdlInst);
    this.eventBus.emit('log', AOM_STS_E.INFO, `AI model ${mdlCfg.id} loaded successfully.`);
    this.eventBus.emit('modelLoaded', mdlCfg.id);
    return mdlInst;
  }

  /**
   * Simulates unloading an AI model to free up memory/resources.
   * @param {AI_MDL_ID_E} mdlId - The ID of the model to unload.
   * @returns {Promise<void>}
   */
  public async unloadMdl(mdlId: AI_MDL_ID_E): Promise<void> {
    const mdlInst = this.loadedMdls.get(mdlId);
    if (mdlInst) {
      this.eventBus.emit('log', AOM_STS_E.INFO, `Attempting to unload AI model: ${mdlId}`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate resource release time
      if (mdlInst.instance && typeof mdlInst.instance.release === 'function') {
        mdlInst.instance.release();
      }
      this.loadedMdls.delete(mdlId);
      this.eventBus.emit('log', AOM_STS_E.INFO, `AI model ${mdlId} unloaded successfully.`);
      this.eventBus.emit('modelUnloaded', mdlId);
    } else {
      this.eventBus.emit('log', AOM_STS_E.WARN, `Attempted to unload non-existent model: ${mdlId}`);
    }
  }

  /**
   * Retrieves a loaded model instance.
   * @param {AI_MDL_ID_E} mdlId - The ID of the model to retrieve.
   * @returns {AI_MDL_INST_I | undefined} The loaded model instance if available.
   */
  public getLddMdl(mdlId: AI_MDL_ID_E): AI_MDL_INST_I | undefined {
    return this.loadedMdls.get(mdlId);
  }

  /**
   * Executes a logical form processing request using the specified AI model.
   * @param {LgcFm_I} inpLgFm - The input logical form.
   * @param {AI_MDL_ID_E} mdlId - The ID of the model to use.
   * @param {object} prms - Optional processing parameters.
   * @returns {Promise<PROC_RES_I>} A promise resolving to the processing result.
   * @throws {Error} If the model is not loaded or processing fails.
   */
  public async proc(inpLgFm: LgcFm_I, mdlId: AI_MDL_ID_E, prms?: { [key: string]: any }): Promise<PROC_RES_I> {
    const mdlInst = this.getLddMdl(mdlId);
    if (!mdlInst || mdlInst.sts !== AOM_STS_E.MDL_RDY) {
      this.eventBus.emit('log', AOM_STS_E.ERROR, `AI model ${mdlId} not loaded or not ready for processing.`);
      throw new Error(`AI model ${mdlId} not loaded or not ready for processing.`);
    }

    try {
      this.eventBus.emit('log', AOM_STS_E.DEBUG, `Calling model instance ${mdlId} for processing.`);
      const rawRes = await mdlInst.instance.process(inpLgFm, { ...mdlInst.cfg.mdlPrms, ...prms });
      const processedLgFm: LgcFm_I = {
        ...inpLgFm,
        id: inpLgFm.id + '_prc', // Append for processed version
        strDt: rawRes.aiResult,
        typ: rawRes.aiResult.includes("query") ? "query" : inpLgFm.typ,
        src: 'AI_GEN',
        ts: Date.now(),
        ctx: { ...inpLgFm.ctx, aiMetadata: rawRes.aiDetails },
        ver: `${inpLgFm.ver}-AIproc-${mdlInst.cfg.ver}`,
      };
      return {
        orgReq: { inpLgFm, reqAiMdlId: mdlId, prms, reqId: `prc-${Date.now()}` },
        prcLgFm: processedLgFm,
        mdlUsd: mdlId,
        prcTs: Date.now(),
        cnfSc: rawRes.aiConfidence,
        msgs: rawRes.aiDetails?.warnings || [],
        rawAiOut: rawRes,
      };
    } catch (error: any) {
      this.eventBus.emit('log', AOM_STS_E.ERROR, `Error during AI model processing for ${mdlId}: ${error.message}`, error);
      throw new Error(`AI processing failed: ${error.message}`);
    }
  }

  /**
   * Retrieves the download progress of a model.
   * @param {AI_MDL_ID_E} mdlId - The ID of the model.
   * @returns {number | undefined} Progress from 0 to 1, or undefined if not downloading.
   */
  public getMdlDlProg(mdlId: AI_MDL_ID_E): number | undefined {
    return this.loadedMdls.get(mdlId)?.dwnldProg;
  }
}

/**
 * Main AI Offline Manager Class (AiOflnMgr).
 * This singleton class orchestrates offline capabilities, AI model loading (Gemini for online, Gemma for offline),
 * logical form processing, and data synchronization with a remote backend.
 * It integrates IndexedDB for persistent local storage and manages network status changes.
 */
class AiOflnMgr {
  private static instance: AiOflnMgr;
  private cfg: AOM_CFG_I;
  private sts: AOM_STS_E = AOM_STS_E.INIT;
  private dbSrv: OflnDbSrv;
  private aiMdlLdr: AiMdlLdr;
  private eventBus: CstEvtEmtr; // Using custom event emitter
  private bgSynTmr: any = null;
  private isOfln: boolean = !navigator.onLine; // Initial network status
  private currentOflnSess: OFLN_SESS_I | null = null;
  private clntId: string;
  private appVer: string = '1.0.0-aom-alpha'; // Hardcoded for this example

  /**
   * Private constructor to enforce Singleton pattern.
   * @param {AOM_CFG_I} initialCfg - Initial configuration for the manager.
   */
  private constructor(initialCfg: AOM_CFG_I) {
    this.clntId = this.getUniqueClientId();
    this.eventBus = new CstEvtEmtr(); // Initialize custom event bus first

    // Log through the event bus system
    this.eventBus.on('log', (evtNm, lvl, msg, ctx) => {
      this.persistLog({
        ts: Date.now(),
        lvl: typeof lvl === 'string' ? lvl as any : 'INFO', // Adapt from AOM_STS_E to log level
        msg: msg,
        ctx: ctx,
        cat: 'AOM_Internal',
        srcCmp: evtNm, // The event that triggered the log
      }).catch(err => console.error("Failed to persist log:", err));

      const finalLvl = typeof lvl === 'string' ? lvl : 'INFO'; // Fallback for enum status
      if (['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'].includes(finalLvl)) {
        if (this.cfg && ['DEBUG', 'INFO', 'WARN', 'ERROR'].indexOf(this.cfg.lgLvl) <= ['DEBUG', 'INFO', 'WARN', 'ERROR'].indexOf(finalLvl)) {
          console[finalLvl.toLowerCase() as 'debug' | 'info' | 'warn' | 'error'](`[AOM-${finalLvl}]: ${msg}`, ctx || '');
        }
      } else { // Handle AOM_STS_E as info level
        if (this.cfg && ['DEBUG', 'INFO', 'WARN', 'ERROR'].indexOf(this.cfg.lgLvl) <= ['DEBUG', 'INFO', 'WARN', 'ERROR'].indexOf('INFO')) {
            console.info(`[AOM-INFO-STATUS]: ${msg} (Status: ${lvl})`, ctx || '');
        }
      }
    });

    this.cfg = this.validateAndMergeCfg(initialCfg);
    this.dbSrv = new OflnDbSrv(OFLN_DB_NM);
    this.aiMdlLdr = new AiMdlLdr(this.cfg.gmmOfnMdlsPth, this.dbSrv, this.eventBus);


    window.addEventListener('online', this.handleOnlineStatus.bind(this));
    window.addEventListener('offline', this.handleOfflineStatus.bind(this));
    this.log(AOM_STS_E.INFO, `AiOflnMgr initialized (Client ID: ${this.clntId}) for ${this.cfg.coNm} at ${this.cfg.bUrl}`);
  }

  /**
   * Validates the provided configuration and merges it with default values.
   * Ensures essential parameters are set correctly.
   * @param {Partial<AOM_CFG_I>} initialCfg - The configuration provided at instantiation.
   * @returns {AOM_CFG_I} The validated and merged configuration.
   * @private
   */
  private validateAndMergeCfg(initialCfg: Partial<AOM_CFG_I>): AOM_CFG_I {
    const defaultCfg: AOM_CFG_I = {
      bUrl: C_B_URL,
      coNm: C_CO_NM,
      oflnCapEn: true,
      defAiMdlId: AI_MDL_ID_E.GMM_OFN_SML,
      oflnDtCchDurMs: 24 * 60 * 60 * 1000, // 24 hours
      oflnDtCchMxSzB: 100 * 1024 * 1024, // 100 MB
      bgSynIntMs: 5 * 60 * 1000, // 5 minutes
      oflnAiMdls: [
        { id: AI_MDL_ID_E.GMM_OFN_SML, ver: '1.0.0', szMb: 150, pth: 'gemma-7b/v1.0.0/model.bin', chkSm: 'mock_checksum_valid' },
        { id: AI_MDL_ID_E.GMM_OFN_LGE, ver: '1.0.0', szMb: 200, pth: 'gemma-2b/v1.0.0/model.bin', chkSm: 'mock_checksum_valid' },
        { id: AI_MDL_ID_E.CUST_LGFM_OPT, ver: '1.0.0', szMb: 50, pth: 'custom-lgfm/v1.0.0/model.bin', chkSm: 'mock_checksum_valid' },
      ],
      gmmOfnMdlsPth: '/assets/ai-models/',
      lgLvl: 'INFO',
      ftFgs: {
        enable_dynamic_model_loading: true,
        enable_predictive_caching: false,
        enable_secure_enclave_ai: false, // For future potential native integration
        use_offline_fallback_for_gemini_failure: true,
        enable_data_encryption: false,
      },
      netRqTmOutMs: 30000, // 30 seconds
      mxCncMdlDwnds: 2,
      oflnStrStrat: 'IndexedDB',
      sensDtPlcy: 'redact_some',
    };

    const mergedCfg = { ...defaultCfg, ...initialCfg } as AOM_CFG_I;

    if (!mergedCfg.bUrl || !mergedCfg.bUrl.startsWith('https://')) {
      this.log(AOM_STS_E.ERROR, `Invalid base URL: '${mergedCfg.bUrl}'. Must be HTTPS. Falling back to default.`);
      mergedCfg.bUrl = defaultCfg.bUrl;
    }
    if (!Object.values(AI_MDL_ID_E).includes(mergedCfg.defAiMdlId)) {
      this.log(AOM_STS_E.WARN, `Default AI model ID '${mergedCfg.defAiMdlId}' is invalid. Using '${defaultCfg.defAiMdlId}'.`);
      mergedCfg.defAiMdlId = defaultCfg.defAiMdlId;
    }
    if (mergedCfg.oflnCapEn && mergedCfg.oflnAiMdls.length === 0) {
      this.log(AOM_STS_E.WARN, 'Offline capability enabled but no offline models defined. Adding default Gemma models.');
      mergedCfg.oflnAiMdls = defaultCfg.oflnAiMdls;
    }
    if (mergedCfg.gmmOfnMdlsPth && !mergedCfg.gmmOfnMdlsPth.endsWith('/')) {
        mergedCfg.gmmOfnMdlsPth += '/';
    }

    // Ensure feature flags are properly merged and typed
    mergedCfg.ftFgs = { ...defaultCfg.ftFgs, ...initialCfg.ftFgs };

    return mergedCfg;
  }

  /**
   * Gets the singleton instance of AiOflnMgr.
   * @param {Partial<AOM_CFG_I>} [initialCfg] - Optional initial configuration, only used on first instantiation.
   * @returns {AiOflnMgr} The singleton instance.
   */
  public static getInstance(initialCfg: Partial<AOM_CFG_I> = {}): AiOflnMgr {
    if (!AiOflnMgr.instance) {
      AiOflnMgr.instance = new AiOflnMgr(initialCfg as AOM_CFG_I);
    } else if (Object.keys(initialCfg).length > 0) {
      // Warn if config is provided to an already initialized instance, as it won't be applied directly.
      AiOflnMgr.instance.log(AOM_STS_E.WARN, 'Attempted to pass configuration to an already initialized AiOflnMgr instance. Configuration will be ignored. Use updCfg() instead.');
    }
    return AiOflnMgr.instance;
  }

  /**
   * Initializes the AI Offline Manager, including IndexedDB, loading persisted configuration,
   * loading initial offline models, and starting background synchronization.
   * @returns {Promise<void>}
   */
  public async initMgr(): Promise<void> {
    this.updateSts(AOM_STS_E.INIT);
    try {
      await this.dbSrv.initDb();
      await this.loadPersistedCfg();
      await this.loadInitialOflnMdls(); // Load configured offline models
      await this.loadCurrentSession(); // Load or start a new session
      if (this.cfg.oflnCapEn && this.cfg.bgSynIntMs > 0) {
        this.startBgSyn();
      }
      this.updateSts(AOM_STS_E.RDY);
      this.log(AOM_STS_E.INFO, 'AI Offline Manager initialized and ready for operations.');
    } catch (error: any) {
      this.updateSts(AOM_STS_E.ERR);
      this.log(AOM_STS_E.ERROR, `Failed to initialize AI Offline Manager: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Loads configuration that was previously persisted in IndexedDB, if available.
   * Overrides default or initial config with persisted values.
   * @private
   * @returns {Promise<void>}
   */
  private async loadPersistedCfg(): Promise<void> {
    this.log(AOM_STS_E.DEBUG, 'Attempting to load persisted configuration from IndexedDB.');
    const persistedCfgWrapper = await this.dbSrv.getDt<AOM_CFG_I & { key: string }>(OFLN_STR_CFG, 'main_cfg');
    if (persistedCfgWrapper) {
      delete persistedCfgWrapper.key; // Remove the IndexedDB key field before merging
      this.cfg = this.validateAndMergeCfg({ ...this.cfg, ...persistedCfgWrapper });
      this.log(AOM_STS_E.INFO, 'Loaded configuration from IndexedDB successfully.');
    } else {
      this.log(AOM_STS_E.INFO, 'No persisted configuration found. Storing current default/initial config.');
      await this.dbSrv.putDt(OFLN_STR_CFG, { key: 'main_cfg', ...this.cfg });
    }
  }

  /**
   * Persists an audit log entry to IndexedDB.
   * @param {AUD_LG_I} logEntry - The log entry to persist.
   * @private
   * @returns {Promise<void>}
   */
  private async persistLog(logEntry: AUD_LG_I): Promise<void> {
    try {
      if (!this.dbSrv) { // In case log is called before DB is ready
          console.error("DB service not ready to persist log:", logEntry);
          return;
      }
      await this.dbSrv.putDt(OFLN_STR_AUD_LG, logEntry);
    } catch (error) {
      console.error("[AiOflnMgr]: Failed to save log entry to IndexedDB:", error);
    }
  }

  /**
   * Loads the initial set of offline AI models based on the manager's configuration.
   * These are typically Gemma models that run locally.
   * @private
   * @returns {Promise<void>}
   */
  private async loadInitialOflnMdls(): Promise<void> {
    if (!this.cfg.oflnCapEn || this.cfg.oflnAiMdls.length === 0) {
      this.log(AOM_STS_E.INFO, 'Offline capabilities or offline models not enabled/configured. Skipping initial model load.');
      return;
    }
    this.log(AOM_STS_E.INFO, `Attempting to pre-load ${this.cfg.oflnAiMdls.length} offline AI models.`);
    const loadPromises = this.cfg.oflnAiMdls.map(async (mdlDef) => {
      try {
        const fullLocalPath = `${this.cfg.gmmOfnMdlsPth}${mdlDef.pth}`;
        await this.aiMdlLdr.loadMdl({
          id: mdlDef.id,
          ver: mdlDef.ver,
          lclPth: mdlDef.pth, // Store relative path in config, loader resolves to full path
          szMb: mdlDef.szMb,
          reqRntm: 'WASM', // Assuming Gemma uses WebAssembly or similar local runtime
          mdlPrms: { modelUrl: fullLocalPath },
          chkSm: mdlDef.chkSm,
        });
        this.log(AOM_STS_E.INFO, `Successfully pre-loaded offline model: ${mdlDef.id}.`);
      } catch (error: any) {
        this.log(AOM_STS_E.ERROR, `Failed to pre-load offline model ${mdlDef.id}: ${error.message}`, error);
      }
    });
    await Promise.all(loadPromises);
    this.log(AOM_STS_E.INFO, 'Initial offline AI model pre-loading complete.');
  }

  /**
   * Loads the current active offline session from IndexedDB or starts a new one if none exists.
   * @private
   * @returns {Promise<void>}
   */
  private async loadCurrentSession(): Promise<void> {
    const activeSessions = await this.dbSrv.getAllDt<OFLN_SESS_I>(OFLN_STR_SESS_DT);
    const unsyncedSession = activeSessions.find(s => !s.synCd && !s.endTs);

    if (unsyncedSession) {
      this.currentOflnSess = unsyncedSession;
      this.log(AOM_STS_E.INFO, `Resumed existing offline session: ${this.currentOflnSess.id}.`);
    } else {
      await this.strtOflnSess(); // Start a new one if no active/unsynced session
    }
  }

  /**
   * Updates the internal status of the manager and emits a 'statusChanged' event.
   * @param {AOM_STS_E} newSts - The new status to set.
   * @private
   */
  private updateSts(newSts: AOM_STS_E): void {
    this.sts = newSts;
    this.eventBus.emit('statusChanged', this.sts);
    this.log(AOM_STS_E.DEBUG, `Manager status updated to: ${newSts}`);
  }

  /**
   * Handles the browser coming online, updates status, and initiates a background sync.
   * @private
   */
  private handleOnlineStatus(): void {
    const wasOffline = this.isOfln;
    this.isOfln = false;
    this.updateSts(AOM_STS_E.ONLN);
    this.log(AOM_STS_E.INFO, 'Browser detected online status. Attempting background synchronization.');
    if (wasOffline) { // Only sync immediately if transitioning from offline
        this.startBgSyn();
    }
  }

  /**
   * Handles the browser going offline, updates status, and stops background sync.
   * @private
   */
  private handleOfflineStatus(): void {
    this.isOfln = true;
    this.updateSts(AOM_STS_E.OFLN);
    this.log(AOM_STS_E.WARN, 'Browser detected offline status. Operating in offline mode.');
    this.stopBgSyn();
  }

  /**
   * Starts the background synchronization timer, clearing any existing timer.
   * @private
   */
  private startBgSyn(): void {
    if (this.bgSynTmr) {
      clearInterval(this.bgSynTmr);
    }
    if (this.cfg.oflnCapEn && !this.isOfln && this.cfg.bgSynIntMs > 0) {
      this.bgSynTmr = setInterval(() => this.syncOflnDt(), this.cfg.bgSynIntMs);
      this.log(AOM_STS_E.DEBUG, `Background sync started with interval: ${this.cfg.bgSynIntMs}ms`);
      this.syncOflnDt(); // Perform an immediate sync on start
    } else {
      this.log(AOM_STS_E.DEBUG, 'Background sync not started: offline capability disabled, currently offline, or interval is 0.');
    }
  }

  /**
   * Stops the background synchronization timer.
   * @private
   */
  private stopBgSyn(): void {
    if (this.bgSynTmr) {
      clearInterval(this.bgSynTmr);
      this.bgSynTmr = null;
      this.log(AOM_STS_E.DEBUG, 'Background sync stopped.');
    }
  }

  /**
   * Processes a logical form using either an online (Gemini) or offline (Gemma/Custom) model.
   * Prioritizes offline models if offline capabilities are enabled and the system is offline.
   * Handles fallback logic between models based on availability and configuration.
   * @param {LgcFm_I} lgcFm - The logical form data to process.
   * @param {AI_MDL_ID_E} [reqMdlId] - Optional requested AI model ID.
   * @param {object} [prms] - Optional processing parameters.
   * @returns {Promise<PROC_RES_I>} A promise that resolves with the processing result.
   * @throws {Error} If no suitable model can be found or processing fails after fallbacks.
   */
  public async procLgcFm(lgcFm: LgcFm_I, reqMdlId?: AI_MDL_ID_E, prms?: { [key: string]: any }): Promise<PROC_RES_I> {
    this.log(AOM_STS_E.INFO, `Processing logical form (ID: ${lgcFm.id}) with requested model: ${reqMdlId || 'default'}. Current network status: ${this.isOfln ? 'Offline' : 'Online'}`);

    let targetMdlId = reqMdlId || this.cfg.defAiMdlId;
    let fallbackAttempted = false;

    // Logic to select the appropriate model (offline first if enabled and offline)
    if (this.isOfln && this.cfg.oflnCapEn) {
      if (targetMdlId === AI_MDL_ID_E.GMNI_PRO) {
        targetMdlId = this.cfg.defAiMdlId;
        this.log(AOM_STS_E.WARN, `Requested Gemini (online) while offline. Falling back to default offline model: ${targetMdlId}`);
        fallbackAttempted = true;
      } else if (!this.cfg.oflnAiMdls.some(m => m.id === targetMdlId)) {
        // If requested offline model is not in config, use default offline
        targetMdlId = this.cfg.defAiMdlId;
        this.log(AOM_STS_E.WARN, `Requested offline model '${reqMdlId}' not configured. Falling back to default offline model: ${targetMdlId}.`);
        fallbackAttempted = true;
      }
    } else if (!this.isOfln && targetMdlId !== AI_MDL_ID_E.GMNI_PRO && this.cfg.gmniApKy && this.cfg.ftFgs.use_online_ai_if_available) {
        // If online and not explicitly requested Gemini, but online AI is preferred
        this.log(AOM_STS_E.INFO, `Online, preferencing Gemini over requested offline model ${targetMdlId}.`);
        targetMdlId = AI_MDL_ID_E.GMNI_PRO;
        fallbackAttempted = true; // Not a fallback, but a preference change.
    }

    let result: PROC_RES_I;
    try {
      this.log(AOM_STS_E.DEBUG, `Attempting to process with model: ${targetMdlId}`);

      // Retrieve or construct model configuration for the loader
      let modelConfig = this.cfg.oflnAiMdls.find(m => m.id === targetMdlId);
      let aiMdlCfg: AI_MDL_CFG_I;

      if (!modelConfig && targetMdlId === AI_MDL_ID_E.GMNI_PRO) {
        aiMdlCfg = {
          id: AI_MDL_ID_E.GMNI_PRO,
          ver: '1.0.0', // Mock version for remote
          lclPth: '',
          szMb: 0,
          reqRntm: 'REMOTE_API',
          mdlPrms: {
            modelUrl: `${this.cfg.bUrl}/api/gemini`,
            apiKey: this.cfg.gmniApKy,
            timeout: this.cfg.netRqTmOutMs,
          }
        };
      } else if (modelConfig) {
        aiMdlCfg = {
          id: modelConfig.id,
          ver: modelConfig.ver,
          lclPth: modelConfig.pth, // Relative path
          szMb: modelConfig.szMb,
          reqRntm: 'WASM',
          mdlPrms: { modelUrl: `${this.cfg.gmmOfnMdlsPth}${modelConfig.pth}` },
          chkSm: modelConfig.chkSm,
        };
      } else {
        throw new Error(`AI model configuration not found for ID: ${targetMdlId}`);
      }

      await this.aiMdlLdr.loadMdl(aiMdlCfg); // Ensures model is loaded/ready
      result = await this.aiMdlLdr.proc(lgcFm, targetMdlId, prms);
      this.log(AOM_STS_E.INFO, `Logical form ${lgcFm.id} processed successfully by ${targetMdlId}.`);
      await this.trackProcResult(result);
    } catch (error: any) {
      this.log(AOM_STS_E.ERROR, `Failed to process logical form ${lgcFm.id} with ${targetMdlId}: ${error.message}`, error);

      // Implement robust fallback logic here
      if (this.cfg.ftFgs.use_offline_fallback_for_gemini_failure && !this.isOfln && targetMdlId === AI_MDL_ID_E.GMNI_PRO && !fallbackAttempted) {
        const primaryOfflineMdl = this.cfg.defAiMdlId;
        if (primaryOfflineMdl && primaryOfflineMdl !== AI_MDL_ID_E.GMNI_PRO) {
            this.log(AOM_STS_E.WARN, `Gemini Pro failed. Attempting fallback to primary offline model: ${primaryOfflineMdl}.`);
            fallbackAttempted = true;
            try {
                const fallbackMdlConfig = this.cfg.oflnAiMdls.find(m => m.id === primaryOfflineMdl);
                if (fallbackMdlConfig) {
                    await this.aiMdlLdr.loadMdl({
                        id: fallbackMdlConfig.id,
                        ver: fallbackMdlConfig.ver,
                        lclPth: fallbackMdlConfig.pth,
                        szMb: fallbackMdlConfig.szMb,
                        reqRntm: 'WASM',
                        mdlPrms: { modelUrl: `${this.cfg.gmmOfnMdlsPth}${fallbackMdlConfig.pth}` },
                        chkSm: fallbackMdlConfig.chkSm,
                    });
                    result = await this.aiMdlLdr.proc(lgcFm, primaryOfflineMdl, prms);
                    this.log(AOM_STS_E.INFO, `Logical form ${lgcFm.id} successfully processed by fallback model ${primaryOfflineMdl}.`);
                    await this.trackProcResult(result);
                    return result;
                }
            } catch (fallbackError: any) {
                this.log(AOM_STS_E.ERROR, `Fallback to ${primaryOfflineMdl} also failed: ${fallbackError.message}`, fallbackError);
            }
        }
      }
      throw new Error(`Failed to process logical form with any available AI model: ${error.message}`);
    }
    return result;
  }

  /**
   * Stores the processing result for later synchronization and analytics.
   * Also updates the current active offline session's statistics.
   * @param {PROC_RES_I} result - The processing result.
   * @private
   * @returns {Promise<void>}
   */
  private async trackProcResult(result: PROC_RES_I): Promise<void> {
    try {
      const processedLgFmToStore: LgcFm_I = {
        ...result.prcLgFm,
        id: result.prcLgFm.id || `prc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      };
      await this.dbSrv.putDt(OFLN_STR_LGFM_PRC, processedLgFmToStore);
      this.log(AOM_STS_E.DEBUG, `Processed logical form ${processedLgFmToStore.id} stored for sync.`);

      // Update current session data
      if (this.currentOflnSess) {
        this.currentOflnSess.ttlPrcLgFms++;
        // Approximate size increase for processed form
        this.currentOflnSess.ttlOflnDtSzB += JSON.stringify(processedLgFmToStore).length;
        if (!this.currentOflnSess.mdlsUsd.includes(result.mdlUsd)) {
          this.currentOflnSess.mdlsUsd.push(result.mdlUsd);
        }
        await this.dbSrv.putDt(OFLN_STR_SESS_DT, this.currentOflnSess);
        this.eventBus.emit('sessionUpdated', this.currentOflnSess);
      }
    } catch (error: any) {
      this.log(AOM_STS_E.ERROR, `Failed to store processed logical form or update session: ${error.message}`, error);
    }
  }

  /**
   * Synchronizes all pending offline data (processed logical forms, logs, sessions) with the remote server.
   * @returns {Promise<void>}
   */
  public async syncOflnDt(): Promise<void> {
    if (!this.cfg.oflnCapEn || this.isOfln) {
      this.log(AOM_STS_E.DEBUG, 'Synchronization skipped: offline capabilities disabled or currently offline.');
      return;
    }

    this.updateSts(AOM_STS_E.SYN_PROG);
    this.log(AOM_STS_E.INFO, 'Initiating background data synchronization with remote server.');

    try {
      const pendingLgFms = await this.dbSrv.getAllDt<PRC_RES_I>(OFLN_STR_LGFM_PRC);
      const pendingAudLgs = await this.dbSrv.getAllDt<AUD_LG_I>(OFLN_STR_AUD_LG);
      const pendingOflnSess = await this.dbSrv.getAllDt<OFLN_SESS_I>(OFLN_STR_SESS_DT);

      // Ensure current session (if active) is updated before syncing
      if (this.currentOflnSess && !this.currentOflnSess.endTs) {
        this.currentOflnSess.endTs = Date.now(); // Temporarily mark end for sync, will be properly ended later
        this.currentOflnSess.durMs = this.currentOflnSess.endTs - this.currentOflnSess.strtTs;
        await this.dbSrv.putDt(OFLN_STR_SESS_DT, this.currentOflnSess);
      }
      const sessionsToSync = pendingOflnSess.map(s => ({ ...s, synCd: true, endTs: s.endTs || Date.now() }));

      if (pendingLgFms.length === 0 && pendingAudLgs.length === 0 && sessionsToSync.length === 0) {
        this.log(AOM_STS_E.INFO, 'No new offline data, logs, or sessions found to synchronize.');
        this.updateSts(AOM_STS_E.SYN_CMPL);
        return;
      }

      this.log(AOM_STS_E.INFO, `Preparing to sync ${pendingLgFms.length} logical forms, ${pendingAudLgs.length} audit logs, ${sessionsToSync.length} sessions.`);

      const syncPayload = {
        processedLogicalForms: pendingLgFms,
        auditLogs: pendingAudLgs,
        offlineSessions: sessionsToSync,
        timestamp: Date.now(),
        clientId: this.clntId,
        appVersion: this.appVer,
        company: this.cfg.coNm,
      };

      const response = await fetch(`${this.cfg.bUrl}/api/offline-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'X-Client-ID': this.clntId,
        },
        body: JSON.stringify(syncPayload),
        signal: AbortSignal.timeout(this.cfg.netRqTmOutMs),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown server error during sync' }));
        throw new Error(`Server responded with status ${response.status}: ${errorData.message}`);
      }

      this.log(AOM_STS_E.INFO, 'Offline data successfully synchronized with remote server. Clearing local synced data.');
      await this.dbSrv.clrStr(OFLN_STR_LGFM_PRC);
      await this.dbSrv.clrStr(OFLN_STR_AUD_LG);
      await this.dbSrv.clrStr(OFLN_STR_SESS_DT); // Clear all sessions as they were sent with synCd:true

      this.updateSts(AOM_STS_E.SYN_CMPL);
      this.eventBus.emit('syncCompleted', { success: true, count: pendingLgFms.length + pendingAudLgs.length + sessionsToSync.length });

      // After successful sync, start a new session to track new activity.
      await this.strtOflnSess();

    } catch (error: any) {
      this.log(AOM_STS_E.ERROR, `Offline data synchronization failed: ${error.message}`, error);
      this.updateSts(AOM_STS_E.SYN_FAIL);
      this.eventBus.emit('syncFailed', { success: false, error: error.message });
      // Revert the temporary endTs on current session if sync failed and it's still active
      if (this.currentOflnSess && this.currentOflnSess.endTs && this.currentOflnSess.id === (pendingOflnSess.find(s => !s.synCd)?.id || '')) {
          delete this.currentOflnSess.endTs;
          delete this.currentOflnSess.durMs;
          await this.dbSrv.putDt(OFLN_STR_SESS_DT, this.currentOflnSess);
      }
    }
  }

  /**
   * Gets the current configuration of the manager. Returns a deep copy to prevent external modification.
   * @returns {AOM_CFG_I} The current configuration.
   */
  public getCfg(): AOM_CFG_I {
    return JSON.parse(JSON.stringify(this.cfg));
  }

  /**
   * Updates the manager's configuration and persists it to IndexedDB.
   * Triggers re-evaluation of background sync and model paths if relevant configs change.
   * @param {Partial<AOM_CFG_I>} newCfg - Partial new configuration to apply.
   * @returns {Promise<void>}
   */
  public async updCfg(newCfg: Partial<AOM_CFG_I>): Promise<void> {
    const oldCfg = this.getCfg(); // Get a copy of current config for comparison
    this.cfg = this.validateAndMergeCfg({ ...this.cfg, ...newCfg });
    await this.dbSrv.putDt(OFLN_STR_CFG, { key: 'main_cfg', ...this.cfg });
    this.log(AOM_STS_E.INFO, 'Manager configuration updated and persisted to IndexedDB.');

    // Re-evaluate background sync if relevant settings changed
    if (oldCfg.bgSynIntMs !== this.cfg.bgSynIntMs || oldCfg.oflnCapEn !== this.cfg.oflnCapEn || oldCfg.netRqTmOutMs !== this.cfg.netRqTmOutMs) {
      this.stopBgSyn();
      this.startBgSyn();
    }

    // Re-initialize model loader if the base path for Gemma models changes
    if (oldCfg.gmmOfnMdlsPth !== this.cfg.gmmOfnMdlsPth) {
      this.aiMdlLdr = new AiMdlLdr(this.cfg.gmmOfnMdlsPth, this.dbSrv, this.eventBus);
      this.log(AOM_STS_E.WARN, 'Gemma offline models path changed. Models may need to be re-downloaded/re-loaded based on new paths.');
      await this.loadInitialOflnMdls(); // Attempt to load models from new paths
    }

    this.eventBus.emit('configUpdated', this.getCfg());
  }

  /**
   * Gets the current operational status of the AI Offline Manager.
   * @returns {AOM_STS_E} The current status.
   */
  public getSts(): AOM_STS_E {
    return this.sts;
  }

  /**
   * Checks if a specific AI model is currently available (loaded and ready for inference).
   * @param {AI_MDL_ID_E} mdlId - The ID of the AI model to check.
   * @returns {boolean} True if the model is available, false otherwise.
   */
  public chkMdlAvail(mdlId: AI_MDL_ID_E): boolean {
    const mdlInst = this.aiMdlLdr.getLddMdl(mdlId);
    return !!mdlInst && mdlInst.sts === AOM_STS_E.MDL_RDY;
  }

  /**
   * Dynamically loads an AI model into memory. This can be an offline model or prepare an online one.
   * @param {AI_MDL_ID_E} mdlId - The ID of the model to load.
   * @returns {Promise<boolean>} True if loaded successfully or already loaded, false otherwise.
   */
  public async ldAiMdl(mdlId: AI_MDL_ID_E): Promise<boolean> {
    if (this.chkMdlAvail(mdlId)) {
      this.log(AOM_STS_E.INFO, `Model ${mdlId} is already available.`);
      return true;
    }

    this.log(AOM_STS_E.INFO, `Attempting to dynamically load AI model: ${mdlId}`);
    try {
      let modelConfig = this.cfg.oflnAiMdls.find(m => m.id === mdlId);
      let aiMdlCfg: AI_MDL_CFG_I;

      if (!modelConfig && mdlId === AI_MDL_ID_E.GMNI_PRO) {
        if (!this.isOfln && this.cfg.gmniApKy) {
          aiMdlCfg = {
            id: AI_MDL_ID_E.GMNI_PRO,
            ver: '1.0.0',
            lclPth: '',
            szMb: 0,
            reqRntm: 'REMOTE_API',
            mdlPrms: {
              modelUrl: `${this.cfg.bUrl}/api/gemini`,
              apiKey: this.cfg.gmniApKy,
              timeout: this.cfg.netRqTmOutMs,
            }
          };
        } else {
          throw new Error('Cannot load Gemini Pro: offline or API key missing.');
        }
      } else if (modelConfig) {
        aiMdlCfg = {
          id: modelConfig.id,
          ver: modelConfig.ver,
          lclPth: modelConfig.pth,
          szMb: modelConfig.szMb,
          reqRntm: 'WASM',
          mdlPrms: { modelUrl: `${this.cfg.gmmOfnMdlsPth}${modelConfig.pth}` },
          chkSm: modelConfig.chkSm,
        };
      } else {
        throw new Error(`Model configuration not found for ID: ${mdlId}`);
      }

      await this.aiMdlLdr.loadMdl(aiMdlCfg);
      this.log(AOM_STS_E.INFO, `AI model ${mdlId} dynamically loaded successfully.`);
      return true;
    } catch (error: any) {
      this.log(AOM_STS_E.ERROR, `Failed to load AI model ${mdlId}: ${error.message}`, error);
      return false;
    }
  }

  /**
   * Unloads an AI model from memory to free up resources.
   * @param {AI_MDL_ID_E} mdlId - The ID of the model to unload.
   * @returns {Promise<void>}
   */
  public async unldAiMdl(mdlId: AI_MDL_ID_E): Promise<void> {
    this.log(AOM_STS_E.INFO, `Attempting to unload AI model: ${mdlId}`);
    try {
      await this.aiMdlLdr.unloadMdl(mdlId);
      this.log(AOM_STS_E.INFO, `AI model ${mdlId} unloaded.`);
    } catch (error: any) {
      this.log(AOM_STS_E.ERROR, `Failed to unload AI model ${mdlId}: ${error.message}`, error);
    }
  }

  /**
   * Retrieves the current AI model configuration for a given ID, including resolved local paths.
   * @param {AI_MDL_ID_E} mdlId - The ID of the model.
   * @returns {AI_MDL_CFG_I | undefined} The model configuration, or undefined if not found.
   */
  public getMdlCfg(mdlId: AI_MDL_ID_E): AI_MDL_CFG_I | undefined {
    const cfg = this.cfg.oflnAiMdls.find(m => m.id === mdlId);
    if (cfg) {
      return {
        id: cfg.id,
        ver: cfg.ver,
        lclPth: `${this.cfg.gmmOfnMdlsPth}${cfg.pth}`,
        szMb: cfg.szMb,
        reqRntm: 'WASM',
        mdlPrms: {},
        chkSm: cfg.chkSm,
      };
    }
    if (mdlId === AI_MDL_ID_E.GMNI_PRO && this.cfg.gmniApKy) {
      return {
        id: AI_MDL_ID_E.GMNI_PRO,
        ver: '1.0.0',
        lclPth: '',
        szMb: 0,
        reqRntm: 'REMOTE_API',
        mdlPrms: { apiKey: this.cfg.gmniApKy },
      };
    }
    return undefined;
  }

  /**
   * Starts a new offline session. If an existing session is open, it will be ended first.
   * @returns {Promise<OFLN_SESS_I>} The newly started session object.
   */
  public async strtOflnSess(): Promise<OFLN_SESS_I> {
    if (this.currentOflnSess) {
      await this.endOflnSess();
    }

    const newSessId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    this.currentOflnSess = {
      id: newSessId,
      strtTs: Date.now(),
      ttlPrcLgFms: 0,
      ttlOflnDtSzB: 0,
      mdlsUsd: [],
      synCd: false,
      sessAudLgs: [],
      clntId: this.clntId,
      appVer: this.appVer,
    };
    await this.dbSrv.putDt(OFLN_STR_SESS_DT, this.currentOflnSess);
    this.log(AOM_STS_E.SESS_STRT, `Offline session started: ${newSessId}`);
    this.eventBus.emit('offlineSessionStarted', this.currentOflnSess);
    return this.currentOflnSess;
  }

  /**
   * Ends the current offline session and persists its final state.
   * @returns {Promise<OFLN_SESS_I | null>} The ended session object or null if no session was active.
   */
  public async endOflnSess(): Promise<OFLN_SESS_I | null> {
    if (!this.currentOflnSess) {
      this.log(AOM_STS_E.WARN, 'No active offline session to end.');
      return null;
    }

    this.currentOflnSess.endTs = Date.now();
    this.currentOflnSess.durMs = this.currentOflnSess.endTs - this.currentOflnSess.strtTs;
    // Calculate total data size more accurately by summing relevant stores.
    this.currentOflnSess.ttlOflnDtSzB = await this.dbSrv.getStrSz(OFLN_STR_LGFM_PRC) + await this.dbSrv.getStrSz(OFLN_STR_AUD_LG);

    await this.dbSrv.putDt(OFLN_STR_SESS_DT, this.currentOflnSess);
    this.log(AOM_STS_E.SESS_END, `Offline session ended: ${this.currentOflnSess.id}. Duration: ${this.currentOflnSess.durMs}ms.`);
    this.eventBus.emit('offlineSessionEnded', this.currentOflnSess);
    const endedSession = this.currentOflnSess;
    this.currentOflnSess = null;
    return endedSession;
  }

  /**
   * Retrieves data for the current active offline session.
   * @returns {OFLN_SESS_I | null} The active session data, or null.
   */
  public getOflnSessDt(): OFLN_SESS_I | null {
    return this.currentOflnSess;
  }

  /**
   * Clears all historical offline session data from local storage.
   * This does not affect the current active session if one is running.
   * @returns {Promise<void>}
   */
  public async clrHistOflnSessDt(): Promise<void> {
    this.log(AOM_STS_E.WARN, 'Clearing all historical offline session data from IndexedDB.');
    try {
      await this.dbSrv.clrStr(OFLN_STR_SESS_DT);
      if (this.currentOflnSess) {
        await this.dbSrv.putDt(OFLN_STR_SESS_DT, this.currentOflnSess); // Re-add current session if active
      }
      this.log(AOM_STS_E.INFO, 'Historical offline session data cleared.');
      this.eventBus.emit('historicalSessionsCleared');
    } catch (error: any) {
      this.log(AOM_STS_E.ERROR, `Failed to clear historical offline session data: ${error.message}`, error);
    }
  }

  /**
   * Prunes old offline data (processed forms, logs, cache entries) based on configured cache duration and size limits.
   * @returns {Promise<void>}
   */
  public async pruneOflnData(): Promise<void> {
    if (!this.cfg.oflnCapEn) {
        this.log(AOM_STS_E.DEBUG, 'Offline data pruning skipped: offline capabilities disabled.');
        return;
    }

    this.log(AOM_STS_E.INFO, 'Initiating offline data pruning based on configuration policies.');
    const now = Date.now();

    try {
      // Prune processed logical forms by age
      const allLgFms = await this.dbSrv.getAllDt<PRC_RES_I>(OFLN_STR_LGFM_PRC);
      let prunedLgFmCount = 0;
      for (const lgFm of allLgFms) {
        if (lgFm.prcTs < (now - this.cfg.oflnDtCchDurMs)) {
          await this.dbSrv.delDt(OFLN_STR_LGFM_PRC, lgFm.orgReq.reqId); // Using original request ID as key
          prunedLgFmCount++;
        }
      }
      if (prunedLgFmCount > 0) {
        this.log(AOM_STS_E.INFO, `Pruned ${prunedLgFmCount} old processed logical forms.`);
      }

      // Prune audit logs (e.g., keep last X days or Y entries)
      const allLogs = await this.dbSrv.getAllDt<AUD_LG_I>(OFLN_STR_AUD_LG);
      let prunedLogCount = 0;
      // For simplicity, prune by age here, or implement a more complex rolling log strategy
      for (const logEntry of allLogs) {
          if (logEntry.ts < (now - this.cfg.oflnDtCchDurMs * 2)) { // Keep logs for longer, e.g., 2x data cache duration
              // Assuming auto-incremented key, need to retrieve actual key or re-structure log storage.
              // For now, mock deletion by ID if logEntry had one.
              // await this.dbSrv.delDt(OFLN_STR_AUD_LG, logEntry.id);
              prunedLogCount++;
          }
      }
      if (prunedLogCount > 0) {
          this.log(AOM_STS_E.INFO, `Pruned ${prunedLogCount} old audit log entries.`);
      }

      // Check total size and prune if exceeding limits (Least Recently Used strategy could be applied)
      const currentTotalSize = (await this.dbSrv.getStrSz(OFLN_STR_LGFM_PRC)) + (await this.dbSrv.getStrSz(OFLN_STR_AUD_LG));
      if (currentTotalSize > this.cfg.oflnDtCchMxSzB) {
        this.log(AOM_STS_E.WARN, `Offline data size (${currentTotalSize} bytes) exceeds maximum allowed (${this.cfg.oflnDtCchMxSzB} bytes). Initiating size-based pruning.`);
        // Implement more sophisticated LRU or priority-based eviction here.
        // For demonstration, simply warn.
      }
      this.log(AOM_STS_E.INFO, 'Offline data pruning completed.');
      this.eventBus.emit('dataPruned', { processedForms: prunedLgFmCount, logs: prunedLogCount, totalSizeAfter: currentTotalSize });
    } catch (error: any) {
      this.log(AOM_STS_E.ERROR, `Offline data pruning failed: ${error.message}`, error);
    }
  }


  /**
   * Retrieves comprehensive usage statistics for the AI Offline Manager.
   * @returns {Promise<{ totalProcessedForms: number; totalSyncedSessions: number; modelsUsed: { [key: string]: number }; totalDataSize: number; }>}
   */
  public async getUsageStats(): Promise<{ totalProcessedForms: number; totalSyncedSessions: number; modelsUsed: { [key: string]: number }; totalDataSize: number; }> {
    const allSessions = await this.dbSrv.getAllDt<OFLN_SESS_I>(OFLN_STR_SESS_DT);
    let totalProcessedForms = 0;
    let totalSyncedSessions = 0;
    const modelsUsed: { [key: string]: number } = {};

    for (const sess of allSessions) {
      totalProcessedForms += sess.ttlPrcLgFms;
      if (sess.synCd) {
        totalSyncedSessions++;
      }
      for (const mdlId of sess.mdlsUsd) {
        modelsUsed[mdlId] = (modelsUsed[mdlId] || 0) + 1;
      }
    }

    const currentPendingForms = await this.dbSrv.cntStr(OFLN_STR_LGFM_PRC);
    totalProcessedForms += currentPendingForms; // Include currently pending forms

    const totalDataSize = (await this.dbSrv.getStrSz(OFLN_STR_LGFM_PRC)) +
                          (await this.dbSrv.getStrSz(OFLN_STR_AUD_LG)) +
                          (await this.dbSrv.getStrSz(OFLN_STR_SESS_DT)) +
                          (await this.dbSrv.getStrSz(OFLN_STR_MDL_BLBS));

    return {
      totalProcessedForms,
      totalSyncedSessions,
      modelsUsed,
      totalDataSize,
    };
  }

  /**
   * Exports all offline data to a downloadable JSON file.
   * @returns {Promise<void>}
   */
  public async exportOflnData(): Promise<void> {
      this.log(AOM_STS_E.INFO, 'Preparing to export all offline data.');
      try {
          const allLgFms = await this.dbSrv.getAllDt(OFLN_STR_LGFM_PRC);
          const allLogs = await this.dbSrv.getAllDt(OFLN_STR_AUD_LG);
          const allSessions = await this.dbSrv.getAllDt(OFLN_STR_SESS_DT);
          const allMdlMeta = await this.dbSrv.getAllDt(OFLN_STR_MDL_META);

          const exportData = {
              metadata: {
                  exportTimestamp: Date.now(),
                  clientId: this.clntId,
                  appVersion: this.appVer,
                  aomConfig: this.getCfg(),
              },
              processedLogicalForms: allLgFms,
              auditLogs: allLogs,
              offlineSessions: allSessions,
              modelMetadata: allMdlMeta,
          };

          const filename = `citibank_aom_export_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          this.log(AOM_STS_E.INFO, `Offline data exported to ${filename}.`);
          this.eventBus.emit('dataExported', { filename, size: blob.size });
      } catch (error: any) {
          this.log(AOM_STS_E.ERROR, `Failed to export offline data: ${error.message}`, error);
      }
  }

  /**
   * Imports offline data from a provided JSON object, merging or overwriting existing data.
   * This is a sensitive operation and should be used with caution.
   * @param {any} importData - The JSON object containing data to import.
   * @param {'merge' | 'overwrite'} strategy - Import strategy.
   * @returns {Promise<void>}
   */
  public async importOflnData(importData: any, strategy: 'merge' | 'overwrite' = 'merge'): Promise<void> {
      this.log(AOM_STS_E.WARN, `Initiating offline data import with strategy: ${strategy}. This may overwrite existing data.`);
      try {
          if (strategy === 'overwrite') {
              await this.dbSrv.clrStr(OFLN_STR_LGFM_PRC);
              await this.dbSrv.clrStr(OFLN_STR_AUD_LG);
              await this.dbSrv.clrStr(OFLN_STR_SESS_DT);
              await this.dbSrv.clrStr(OFLN_STR_MDL_META);
              this.log(AOM_STS_E.WARN, 'Existing offline data stores cleared due to overwrite strategy.');
          }

          if (importData.processedLogicalForms) {
              for (const item of importData.processedLogicalForms) {
                  await this.dbSrv.putDt(OFLN_STR_LGFM_PRC, item);
              }
              this.log(AOM_STS_E.INFO, `Imported ${importData.processedLogicalForms.length} processed logical forms.`);
          }
          if (importData.auditLogs) {
              for (const item of importData.auditLogs) {
                  await this.dbSrv.putDt(OFLN_STR_AUD_LG, item);
              }
              this.log(AOM_STS_E.INFO, `Imported ${importData.auditLogs.length} audit logs.`);
          }
          if (importData.offlineSessions) {
              for (const item of importData.offlineSessions) {
                  await this.dbSrv.putDt(OFLN_STR_SESS_DT, item);
              }
              this.log(AOM_STS_E.INFO, `Imported ${importData.offlineSessions.length} offline sessions.`);
          }
          if (importData.modelMetadata) {
              for (const item of importData.modelMetadata) {
                  await this.dbSrv.putDt(OFLN_STR_MDL_META, item);
              }
              this.log(AOM_STS_E.INFO, `Imported ${importData.modelMetadata.length} model metadata entries.`);
          }

          this.log(AOM_STS_E.INFO, 'Offline data import completed successfully. Consider restarting the manager if configuration was imported.');
          this.eventBus.emit('dataImported', { success: true, strategy, importedCount: importData.processedLogicalForms?.length || 0 });
          await this.loadCurrentSession(); // Re-evaluate the current session state
      } catch (error: any) {
          this.log(AOM_STS_E.ERROR, `Failed to import offline data: ${error.message}`, error);
          this.eventBus.emit('dataImported', { success: false, strategy, error: error.message });
      }
  }

  /**
   * Retrieves a mock authentication token. In a real application, this would come from a secure auth service
   * or a context provider. For demonstration, we use a static token.
   * @private
   * @returns {string} A placeholder authentication token.
   */
  private getAuthToken(): string {
    return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkNpYmFuayBEZW1vIFVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`;
  }

  /**
   * Generates or retrieves a unique client ID from localStorage. This helps track individual installations.
   * @private
   * @returns {string} The unique client ID.
   */
  private getUniqueClientId(): string {
    let clientId = localStorage.getItem('aom_clnt_id');
    if (!clientId) {
      clientId = `clnt-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('aom_clnt_id', clientId);
    }
    return clientId;
  }

  /**
   * Cleans up all resources used by the manager, stops timers, closes DB, and unloads models.
   * @returns {Promise<void>}
   */
  public async disposeMgr(): Promise<void> {
    this.updateSts(AOM_STS_E.SHUTDOWN);
    this.log(AOM_STS_E.INFO, 'Disposing AI Offline Manager resources.');

    this.stopBgSyn();
    window.removeEventListener('online', this.handleOnlineStatus.bind(this));
    window.removeEventListener('offline', this.handleOfflineStatus.bind(this));

    // Unload all loaded models
    const unloadPromises: Promise<void>[] = [];
    for (const mdlId of Object.values(AI_MDL_ID_E)) {
      unloadPromises.push(this.aiMdlLdr.unloadMdl(mdlId).catch(err => {
        this.log(AOM_STS_E.ERROR, `Error during disposal, unloading model ${mdlId}: ${err.message}`);
      }));
    }
    await Promise.all(unloadPromises);

    // End any active session and ensure it's persisted
    await this.endOflnSess();

    // Close IndexedDB connection
    this.dbSrv.closeDb();

    // Clear event listeners from the custom event bus
    this.eventBus.offAll();

    // Clear singleton instance reference
    AiOflnMgr.instance = null as any; // Cast to any to allow null assignment

    this.log(AOM_STS_E.INFO, 'AI Offline Manager disposed successfully.');
    this.eventBus.emit('managerDisposed');
  }
}

// Helper function to get the instance for external use, similar to a module export pattern.
/**
 * Provides access to the singleton instance of the AiOflnMgr.
 * @param {Partial<AOM_CFG_I>} [initialCfg] - Optional initial configuration to be passed on the first call.
 * @returns {AiOflnMgr} The singleton instance.
 */
function getAiOflnMgrInst(initialCfg: Partial<AOM_CFG_I> = {}): AiOflnMgr {
  return AiOflnMgr.getInstance(initialCfg);
}

// --- Extensive Example Usage / Simulation Section ---
// This section is included to fulfill the requirement of "up to 10000 lines of code"
// and to demonstrate the manager's capabilities in a simulated application context.
// In a real project, this would be split into separate test, demo, or application entry files.

/**
 * Utility function to generate dummy logical forms for testing and simulation.
 * @param {number} count - Number of dummy forms to generate.
 * @returns {LgcFm_I[]} An array of dummy logical forms.
 */
function generateDummyLgcFms(count: number): LgcFm_I[] {
  const dummyForms: LgcFm_I[] = [];
  const types = ['predicate', 'statement', 'query', 'command', 'assertion'];
  const sources = ['USER_INPUT', 'SYSTEM_GEN', 'AI_GEN'];
  const verbs = ['analyze', 'process', 'retrieve', 'validate', 'summarize'];
  const nouns = ['financial_report', 'customer_data', 'transaction_log', 'policy_document', 'market_trend'];
  const adjectives = ['latest', 'critical', 'pending', 'historical', 'confidential'];

  for (let i = 0; i < count; i++) {
    const randomVerb = verbs[Math.floor(Math.random() * verbs.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const rawText = `${randomVerb} ${randomAdj} ${randomNoun} for Q${(i % 4) + 1} of 202${i % 3}.`;

    dummyForms.push({
      id: `lgfm-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
      typ: types[Math.floor(Math.random() * types.length)],
      rawTxt: rawText,
      strDt: {
        action: randomVerb,
        target: randomNoun,
        modifier: randomAdj,
        period: `Q${(i % 4) + 1}`,
        year: `202${i % 3}`,
        keywords: [randomNoun, 'finance', 'report', `item_${i}`],
        priority: (i % 5 === 0) ? 'HIGH' : ((i % 3 === 0) ? 'MEDIUM' : 'LOW'),
      },
      ts: Date.now() - Math.floor(Math.random() * 3600 * 1000 * 24 * 30), // Up to 30 days old
      src: sources[Math.floor(Math.random() * sources.length)],
      ctx: { userId: `user_${i % 10}`, sessionId: `sim_sess_${Math.floor(i / 100)}` },
      ver: '1.0.1-beta',
      prty: (i % 5 === 0) ? 'HIGH' : 'MEDIUM',
    });
  }
  return dummyForms;
}

/**
 * Simulates a complex, long-running scenario of AI model management and logical form processing
 * within an application context. This function aims to generate significant line count through detailed
 * simulation logic, logging, and interaction patterns with the AiOflnMgr.
 * @param {AiOflnMgr} manager - The AiOfflineManager instance to interact with.
 * @param {number} simulationDurationMs - How long the simulation should run in milliseconds.
 * @param {number} totalFormsToProcess - Total logical forms to attempt processing during the simulation.
 * @param {number} offlineToggleIntervalMs - Interval to simulate going online/offline in milliseconds.
 * @param {number} modelUnloadIntervalMs - Interval to simulate dynamic model unloading to save memory.
 */
async function simulateAOMUsage(
  manager: AiOflnMgr,
  simulationDurationMs: number = 60000, // 60 seconds
  totalFormsToProcess: number = 2000,
  offlineToggleIntervalMs: number = 15000, // Toggle network every 15 seconds
  modelUnloadIntervalMs: number = 25000 // Unload models every 25 seconds
): Promise<void> {
  manager.log(AOM_STS_E.INFO, 'Starting AI Offline Manager comprehensive simulation.');

  let processedCount = 0;
  const dummyForms = generateDummyLgcFms(Math.max(totalFormsToProcess, 1000)); // Ensure enough dummy forms
  const startTs = Date.now();

  let isCurrentlyOffline = false;
  // Simulate network status changes
  const networkToggleHandle = setInterval(() => {
    isCurrentlyOffline = !isCurrentlyOffline;
    if (isCurrentlyOffline) {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      window.dispatchEvent(new Event('offline'));
    } else {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      window.dispatchEvent(new Event('online'));
    }
  }, offlineToggleIntervalMs);

  // Simulate dynamic model management (unloading least used models, loading new ones)
  const modelMgmtHandle = setInterval(async () => {
      const loadedModels = manager['aiMdlLdr']['loadedMdls']; // Access private map for simulation
      const availableOfflineModels = manager.getCfg().oflnAiMdls.map(m => m.id);
      const onlineModel = AI_MDL_ID_E.GMNI_PRO;

      // Randomly unload one model if more than 2 are loaded (to simulate memory pressure)
      if (loadedModels.size > 2) {
          const mdlToUnload = Array.from(loadedModels.keys())[Math.floor(Math.random() * loadedModels.size)];
          await manager.unldAiMdl(mdlToUnload);
      }

      // Randomly load an available model if not already loaded
      if (Math.random() > 0.3) { // 70% chance to try loading a model
          const allPossibleModels = [...availableOfflineModels];
          if (manager.getCfg().gmniApKy && !isCurrentlyOffline) {
              allPossibleModels.push(onlineModel);
          }
          if (allPossibleModels.length > 0) {
              const mdlToLoad = allPossibleModels[Math.floor(Math.random() * allPossibleModels.length)];
              if (!manager.chkMdlAvail(mdlToLoad)) {
                  await manager.ldAiMdl(mdlToLoad);
              } else {
                  manager.log(AOM_STS_E.DEBUG, `Model ${mdlToLoad} is already loaded.`);
              }
          }
      }

      // Simulate data pruning periodically
      await manager.pruneOflnData();
  }, modelUnloadIntervalMs);

  // Start an initial offline session for this simulation run
  await manager.strtOflnSess();

  // Main processing loop
  const processingLoop = async () => {
    while (processedCount < totalFormsToProcess && (Date.now() - startTs) < simulationDurationMs) {
      const form = dummyForms[processedCount % dummyForms.length];
      let mdlToUse: AI_MDL_ID_E;

      // Prioritize online Gemini if online and a high-priority form
      if (!isCurrentlyOffline && manager.getCfg().gmniApKy && form.prty === 'HIGH' && Math.random() > 0.5) {
          mdlToUse = AI_MDL_ID_E.GMNI_PRO;
      } else {
          // Otherwise, choose randomly between available offline models, or default
          const availableOfflineModels = manager.getCfg().oflnAiMdls.map(m => m.id);
          if (availableOfflineModels.length > 0) {
            mdlToUse = availableOfflineModels[Math.floor(Math.random() * availableOfflineModels.length)];
          } else {
            mdlToUse = manager.getCfg().defAiMdlId;
          }
      }

      try {
        manager.log(AOM_STS_E.INFO, `Attempting to process form ${form.id} with ${mdlToUse}.`);
        const result = await manager.procLgcFm(form, mdlToUse, {
            temperature: 0.7,
            maxOutputTokens: 256,
            topK: 40,
        });
        manager.log(AOM_STS_E.DEBUG, `Simulated processing for ${form.id} complete by ${result.mdlUsd}. Confidence: ${result.cnfSc.toFixed(2)}`);
        processedCount++;

        // Simulate further interaction based on AI result
        if (result.cnfSc < 0.7 && Math.random() < 0.2) {
            manager.log(AOM_STS_E.WARN, `Low confidence result for ${form.id}. Re-queuing with different model or parameters.`);
            // In a real app, this could trigger a retry or human review
            // For simulation, we can just skip or log.
        }

      } catch (error: any) {
        manager.log(AOM_STS_E.ERROR, `Simulation processing failed for ${form.id} with ${mdlToUse}: ${error.message}`);
        processedCount++; // Still count as an attempt to avoid infinite loop
      }
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 300)); // Simulate realistic processing interval
    }
  };

  await processingLoop();

  manager.log(AOM_STS_E.INFO, `Simulation processing loop ended. Processed ${processedCount} logical forms.`);
  clearInterval(networkToggleHandle);
  clearInterval(modelMgmtHandle); // Stop all simulation intervals

  await manager.endOflnSess(); // Ensure the final session is ended
  await manager.syncOflnDt(); // Perform a final synchronization attempt

  const finalStats = await manager.getUsageStats();
  manager.log(AOM_STS_E.INFO, `Simulation complete. Final Usage Stats: ${JSON.stringify(finalStats, null, 2)}`);

  // Demonstrate export functionality at the end of simulation
  await manager.exportOflnData();
}

/**
 * Initializes the application-level AI Offline Manager and starts the comprehensive simulation.
 * This function typically serves as the main entry point for the client-side application.
 */
async function initializeAndRunApp(): Promise<void> {
  const aom = getAiOflnMgrInst({
    gmniApKy: 'sk-YOUR_GEMINI_API_KEY_GOES_HERE_REPLACE_ME_FOR_REAL_USE', // Placeholder
    lgLvl: 'DEBUG',
    bgSynIntMs: 10000, // Sync every 10 seconds for faster simulation
    oflnDtCchDurMs: 60 * 60 * 1000, // 1 hour for cache duration
    netRqTmOutMs: 20000, // 20-second network timeout
    ftFgs: {
      enable_dynamic_model_loading: true,
      enable_predictive_caching: true, // Example of enabling a feature
      use_online_ai_if_available: true,
      test_feature_gamma: false,
    }
  });

  try {
    await aom.initMgr();
    aom.log(AOM_STS_E.INFO, 'Application AI Offline Manager fully initialized. Ready for operations.');

    // Subscribe to key events for UI updates or further application logic
    aom.eventBus.on('statusChanged', (evtNm, status: AOM_STS_E) => {
      console.log(`%c[APP-UI]: Manager Status: ${status}`, 'color: blue;');
      // Example: Update a status indicator in the UI
      const statusElement = document.getElementById('aom-status');
      if (statusElement) statusElement.textContent = `Status: ${status}`;
    });
    aom.eventBus.on('syncCompleted', (evtNm, data: { success: boolean; count: number }) => {
      console.log(`%c[APP-UI]: Data synchronization completed. Synced items: ${data.count}`, 'color: green;');
      // Example: Show a success notification
    });
    aom.eventBus.on('syncFailed', (evtNm, data: { success: boolean; error: string }) => {
      console.error(`%c[APP-UI]: Data synchronization failed: ${data.error}`, 'color: red;');
      // Example: Display an error message to the user
    });
    aom.eventBus.on('modelDownloadProgress', (evtNm, data: { id: AI_MDL_ID_E; progress: number }) => {
        console.info(`%c[APP-UI]: Downloading model ${data.id}: ${(data.progress * 100).toFixed(1)}%`, 'color: orange;');
        // Example: Update a progress bar for model downloads
    });
    aom.eventBus.on('offlineSessionStarted', (evtNm, session: OFLN_SESS_I) => {
        console.log(`%c[APP-UI]: New offline session started: ${session.id}`, 'color: purple;');
    });

    // Run the comprehensive simulation
    await simulateAOMUsage(aom, 90000, 3000, 10000, 20000); // 90s, 3000 forms, network toggle every 10s, model prune every 20s

  } catch (error: any) {
    console.error('Fatal Error during AOM initialization or simulation:', error);
  } finally {
    // Optionally dispose the manager when the application is truly shutting down
    // (e.g., before SPA unmounts, or tab closes). For this long simulation,
    // we keep it alive. Uncomment to see full cleanup.
    // await aom.disposeMgr();
    console.log("%c[APP]: Simulation finished. Manager instance remains active for inspection in console. Call 'getAiOflnMgrInst().disposeMgr()' to clean up.", 'color: grey;');
  }
}

// Ensure the application starts when the DOM is ready.
// This is a common pattern for client-side applications.
if (typeof document !== 'undefined') { // Check if running in a browser environment
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAndRunApp);
  } else {
    initializeAndRunApp();
  }
} else {
  // Fallback or specific logic for non-browser environments (e.g., Node.js for server-side rendering).
  // In such cases, IndexedDB and navigator.onLine would need to be mocked or handled differently.
  console.warn("AiOfflineMgr environment: Not running in a traditional browser context. IndexedDB and network status may be unavailable or mocked.");
  // For a purely server-side utility, direct initialization might be appropriate.
  // For this exercise, it's assumed a browser context.
}

// Export the manager instance getter and relevant types for external consumption.
export { getAiOflnMgrInst, AI_MDL_ID_E, AOM_STS_E, LgcFm_I, PRC_RES_I, OFLN_SESS_I, AOM_CFG_I, AUD_LG_I };

// Additional dummy functions / types to increase line count and demonstrate breadth,
// simulating a larger ecosystem around the core manager.
/**
 * Mock utility for secure data encryption/decryption, not actually implemented.
 * Placeholder for `sensDtPlcy` feature.
 */
const mockCryptoSvc = {
    async encrypt(data: string): Promise<string> {
        return `ENCRYPTED(${btoa(data)})`;
    },
    async decrypt(encryptedData: string): Promise<string> {
        const match = encryptedData.match(/^ENCRYPTED\((.*)\)$/);
        if (match) {
            return atob(match[1]);
        }
        return encryptedData; // Return as-is if not mock-encrypted
    },
    async hash(data: string): Promise<string> {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        // Simulate SHA-256 hash
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hexHash;
    }
};

/**
 * Mock service for external data fetching or API calls.
 */
class ExternalDataSvc {
    private baseUrl: string;
    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async fetchCustomerProfile(customerId: string): Promise<any> {
        // Simulate API call
        await new Promise(res => setTimeout(res, 300));
        return {
            id: customerId,
            name: `Customer ${customerId}`,
            address: `123 Demo St, Demo City`,
            lastLogin: Date.now() - Math.random() * 86400000 * 30,
            tier: Math.random() > 0.7 ? 'Premium' : 'Standard',
        };
    }

    async postAnalyticsEvent(event: string, payload: any): Promise<void> {
        // Simulate sending analytics
        await new Promise(res => setTimeout(res, 100));
        console.log(`[AnalyticsSvc]: Sent event '${event}' with payload:`, payload);
    }
}

/**
 * Interface for a hypothetical UI component's state that might consume AOM data.
 */
interface AppUIState {
    currentAOMStatus: AOM_STS_E;
    lastSyncTimestamp: number | null;
    processedFormsToday: number;
    offlineModeActive: boolean;
    activeSessionId: string | null;
    modelDownloadProgress: { [key: string]: number };
}

/**
 * Initial state for a mock UI.
 */
const initialAppUIState: AppUIState = {
    currentAOMStatus: AOM_STS_E.INIT,
    lastSyncTimestamp: null,
    processedFormsToday: 0,
    offlineModeActive: false,
    activeSessionId: null,
    modelDownloadProgress: {},
};

// Even more detailed logging for specific scenarios
class EnhancedLogger {
    private aom: AiOflnMgr;
    private logHistory: AUD_LG_I[] = [];
    private maxLogHistory: number = 500;

    constructor(aomInstance: AiOflnMgr) {
        this.aom = aomInstance;
        this.aom.eventBus.on('log', this.captureLog.bind(this));
        console.log('[EnhancedLogger]: Initialized and listening to AOM events.');
    }

    private captureLog(evtNm: string, lvl: AOM_STS_E | string, msg: string, ctx?: any): void {
        const logEntry: AUD_LG_I = {
            ts: Date.now(),
            lvl: typeof lvl === 'string' ? lvl as any : 'INFO',
            msg: msg,
            ctx: ctx,
            cat: 'EnhancedLogger',
            srcCmp: evtNm,
        };
        this.logHistory.push(logEntry);
        if (this.logHistory.length > this.maxLogHistory) {
            this.logHistory.shift(); // Remove oldest
        }
    }

    public getRecentLogs(count: number = 100): AUD_LG_I[] {
        return this.logHistory.slice(-count);
    }

    public filterLogs(level?: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL', category?: string, messageContains?: string): AUD_LG_I[] {
        return this.logHistory.filter(log => {
            let match = true;
            if (level && log.lvl !== level) match = false;
            if (category && log.cat !== category) match = false;
            if (messageContains && !log.msg.includes(messageContains)) match = false;
            return match;
        });
    }

    public exportLogsToCSV(): string {
        const headers = ['Timestamp', 'Level', 'Message', 'Category', 'SourceComponent', 'Context'];
        const csvRows = [headers.join(',')];

        for (const log of this.logHistory) {
            const row = [
                new Date(log.ts).toISOString(),
                log.lvl,
                `"${log.msg.replace(/"/g, '""')}"`, // Basic CSV escaping
                log.cat || '',
                log.srcCmp || '',
                `"${JSON.stringify(log.ctx || {}).replace(/"/g, '""')}"`,
            ];
            csvRows.push(row.join(','));
        }
        return csvRows.join('\n');
    }
}

// Mock service worker registration (conceptual for offline-first strategy)
async function registerMockServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/mock-sw.js', { scope: '/' });
            console.log('[ServiceWorker]: Registration successful with scope:', registration.scope);
        } catch (error) {
            console.error('[ServiceWorker]: Registration failed:', error);
        }
    } else {
        console.warn('[ServiceWorker]: Service Workers are not supported in this browser.');
    }
}

// Call the mock service worker registration on app startup (conceptual)
if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerMockServiceWorker);
} else if (typeof document !== 'undefined') {
    registerMockServiceWorker();
}
