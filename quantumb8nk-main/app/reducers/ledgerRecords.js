import {
    createBaseReducer
} from "./base";
export const BIZ_FIN_EVT_TYPES = {
    PULL_FIN_RECS_INIT: 'BIZ_FIN/PULL_RECS_INIT',
    PULL_FIN_RECS_OK: 'BIZ_FIN/PULL_RECS_OK',
    PULL_FIN_RECS_FAIL: 'BIZ_FIN/PULL_RECS_FAIL',
    PUSH_FIN_REC_INIT: 'BIZ_FIN/PUSH_REC_INIT',
    PUSH_FIN_REC_OK: 'BIZ_FIN/PUSH_REC_OK',
    PUSH_FIN_REC_FAIL: 'BIZ_FIN/PUSH_REC_FAIL',
    MOD_FIN_REC_INIT: 'BIZ_FIN/MOD_REC_INIT',
    MOD_FIN_REC_OK: 'BIZ_FIN/MOD_REC_OK',
    MOD_FIN_REC_FAIL: 'BIZ_FIN/MOD_REC_FAIL',
    DEL_FIN_REC_INIT: 'BIZ_FIN/DEL_REC_INIT',
    DEL_FIN_REC_OK: 'BIZ_FIN/DEL_REC_OK',
    DEL_FIN_REC_FAIL: 'BIZ_FIN/DEL_REC_FAIL',
    BULK_PUSH_FIN_RECS_INIT: 'BIZ_FIN/BULK_PUSH_RECS_INIT',
    BULK_PUSH_FIN_RECS_OK: 'BIZ_FIN/BULK_PUSH_RECS_OK',
    BULK_PUSH_FIN_RECS_FAIL: 'BIZ_FIN/BULK_PUSH_RECS_FAIL',
    BULK_MOD_FIN_RECS_INIT: 'BIZ_FIN/BULK_MOD_RECS_INIT',
    BULK_MOD_FIN_RECS_OK: 'BIZ_FIN/BULK_MOD_RECS_OK',
    BULK_MOD_FIN_RECS_FAIL: 'BIZ_FIN/BULK_MOD_RECS_FAIL',
    BULK_DEL_FIN_RECS_INIT: 'BIZ_FIN/BULK_DEL_RECS_INIT',
    BULK_DEL_FIN_RECS_OK: 'BIZ_FIN/BULK_DEL_RECS_OK',
    BULK_DEL_FIN_RECS_FAIL: 'BIZ_FIN/BULK_DEL_RECS_FAIL',
    APPLY_FIN_FILTERS: 'BIZ_FIN/APPLY_FILTERS',
    APPLY_FIN_SORT: 'BIZ_FIN/APPLY_SORT',
    APPLY_FIN_PAGINATION: 'BIZ_FIN/APPLY_PAGINATION',
    PICK_FIN_REC: 'BIZ_FIN/PICK_REC',
    UNPICK_FIN_REC: 'BIZ_FIN/UNPICK_REC',
    INTEL_SCAN_ABNORMAL_INIT: 'BIZ_FIN_INTEL/SCAN_ABNORMAL_INIT',
    INTEL_SCAN_ABNORMAL_OK: 'BIZ_FIN_INTEL/SCAN_ABNORMAL_OK',
    INTEL_SCAN_ABNORMAL_FAIL: 'BIZ_FIN_INTEL/SCAN_ABNORMAL_FAIL',
    INTEL_MOD_ABNORMAL_SCORE: 'BIZ_FIN_INTEL/MOD_ABNORMAL_SCORE',
    INTEL_FORECAST_TX_INIT: 'BIZ_FIN_INTEL/FORECAST_TX_INIT',
    INTEL_FORECAST_TX_OK: 'BIZ_FIN_INTEL/FORECAST_TX_OK',
    INTEL_FORECAST_TX_FAIL: 'BIZ_FIN_INTEL/FORECAST_TX_FAIL',
    INTEL_WIPE_FORECAST_TX: 'BIZ_FIN_INTEL/WIPE_FORECAST_TX',
    INTEL_MATCH_RECS_INIT: 'BIZ_FIN_INTEL/MATCH_RECS_INIT',
    INTEL_MATCH_RECS_OK: 'BIZ_FIN_INTEL/MATCH_RECS_OK',
    INTEL_MATCH_RECS_FAIL: 'BIZ_FIN_INTEL/MATCH_RECS_FAIL',
    INTEL_MOD_MATCH_STATUS: 'BIZ_FIN_INTEL/MOD_MATCH_STATUS',
    INTEL_SCAN_FRAUD_INIT: 'BIZ_FIN_INTEL/SCAN_FRAUD_INIT',
    INTEL_SCAN_FRAUD_OK: 'BIZ_FIN_INTEL/SCAN_FRAUD_OK',
    INTEL_SCAN_FRAUD_FAIL: 'BIZ_FIN_INTEL/SCAN_FRAUD_FAIL',
    INTEL_MOD_FRAUD_MARK: 'BIZ_FIN_INTEL/MOD_FRAUD_MARK',
    INTEL_BUILD_REPORT_INIT: 'BIZ_FIN_INTEL/BUILD_REPORT_INIT',
    INTEL_BUILD_REPORT_OK: 'BIZ_FIN_INTEL/BUILD_REPORT_OK',
    INTEL_BUILD_REPORT_FAIL: 'BIZ_FIN_INTEL/BUILD_REPORT_FAIL',
    INTEL_WIPE_REPORT: 'BIZ_FIN_INTEL/WIPE_REPORT',
    INTEL_TRAIN_MODEL_INIT: 'BIZ_FIN_INTEL/TRAIN_MODEL_INIT',
    INTEL_TRAIN_MODEL_OK: 'BIZ_FIN_INTEL/TRAIN_MODEL_OK',
    INTEL_TRAIN_MODEL_FAIL: 'BIZ_FIN_INTEL/TRAIN_MODEL_FAIL',
    INTEL_TEST_MODEL_INIT: 'BIZ_FIN_INTEL/TEST_MODEL_INIT',
    INTEL_TEST_MODEL_OK: 'BIZ_FIN_INTEL/TEST_MODEL_OK',

    INTEL_TEST_MODEL_FAIL: 'BIZ_FIN_INTEL/TEST_MODEL_FAIL',
    INTEL_MOD_MODEL_STATE: 'BIZ_FIN_INTEL/MOD_MODEL_STATE',
    INTEL_CHECK_TX_INIT: 'BIZ_FIN_INTEL/CHECK_TX_INIT',
    INTEL_CHECK_TX_OK: 'BIZ_FIN_INTEL/CHECK_TX_OK',
    INTEL_CHECK_TX_FAIL: 'BIZ_FIN_INTEL/CHECK_TX_FAIL',
    INTEL_MOD_TX_CHECK: 'BIZ_FIN_INTEL/MOD_TX_CHECK',
    INTEL_TAG_TX_INIT: 'BIZ_FIN_INTEL/TAG_TX_INIT',
    INTEL_TAG_TX_OK: 'BIZ_FIN_INTEL/TAG_TX_OK',
    INTEL_TAG_TX_FAIL: 'BIZ_FIN_INTEL/TAG_TX_FAIL',
    INTEL_MOD_TX_TAG: 'BIZ_FIN_INTEL/MOD_TX_TAG',
    INTEL_FORECAST_CASH_INIT: 'BIZ_FIN_INTEL/FORECAST_CASH_INIT',
    INTEL_FORECAST_CASH_OK: 'BIZ_FIN_INTEL/FORECAST_CASH_OK',
    INTEL_FORECAST_CASH_FAIL: 'BIZ_FIN_INTEL/FORECAST_CASH_FAIL',
    INTEL_WIPE_CASH_FORECAST: 'BIZ_FIN_INTEL/WIPE_CASH_FORECAST',
    INTEL_BUILD_COMPLIANCE_INIT: 'BIZ_FIN_INTEL/BUILD_COMPLIANCE_INIT',
    INTEL_BUILD_COMPLIANCE_OK: 'BIZ_FIN_INTEL/BUILD_COMPLIANCE_OK',
    INTEL_BUILD_COMPLIANCE_FAIL: 'BIZ_FIN_INTEL/BUILD_COMPLIANCE_FAIL',
    INTEL_WIPE_COMPLIANCE: 'BIZ_FIN_INTEL/WIPE_COMPLIANCE',
    INTEL_SUGGEST_JOURNAL_INIT: 'BIZ_FIN_INTEL/SUGGEST_JOURNAL_INIT',
    INTEL_SUGGEST_JOURNAL_OK: 'BIZ_FIN_INTEL/SUGGEST_JOURNAL_OK',
    INTEL_SUGGEST_JOURNAL_FAIL: 'BIZ_FIN_INTEL/SUGGEST_JOURNAL_FAIL',
    INTEL_COMMIT_JOURNAL_SUGGESTION: 'BIZ_FIN_INTEL/COMMIT_JOURNAL_SUGGESTION',
    PUSH_AUDIT_MSG: 'BIZ_FIN/PUSH_AUDIT_MSG',
    WIPE_FIN_ERROR: 'BIZ_FIN/WIPE_ERROR',
    SET_FIN_ERROR: 'BIZ_FIN/SET_ERROR',
    PLAID_CONNECT_INIT: 'EXT_PLAID/CONNECT_INIT',
    PLAID_CONNECT_OK: 'EXT_PLAID/CONNECT_OK',
    PLAID_CONNECT_FAIL: 'EXT_PLAID/CONNECT_FAIL',
    PLAID_PULL_TX_INIT: 'EXT_PLAID/PULL_TX_INIT',
    PLAID_PULL_TX_OK: 'EXT_PLAID/PULL_TX_OK',
    PLAID_PULL_TX_FAIL: 'EXT_PLAID/PULL_TX_FAIL',
    MT_CONNECT_INIT: 'EXT_MT/CONNECT_INIT',
    MT_CONNECT_OK: 'EXT_MT/CONNECT_OK',
    MT_CONNECT_FAIL: 'EXT_MT/CONNECT_FAIL',
    MT_CREATE_PAYMENT_INIT: 'EXT_MT/CREATE_PAYMENT_INIT',
    MT_CREATE_PAYMENT_OK: 'EXT_MT/CREATE_PAYMENT_OK',
    MT_CREATE_PAYMENT_FAIL: 'EXT_MT/CREATE_PAYMENT_FAIL',
    GITHUB_COMMIT_PUSH_INIT: 'EXT_GITHUB/COMMIT_PUSH_INIT',
    GITHUB_COMMIT_PUSH_OK: 'EXT_GITHUB/COMMIT_PUSH_OK',
    GITHUB_COMMIT_PUSH_FAIL: 'EXT_GITHUB/COMMIT_PUSH_FAIL',
    SALESFORCE_PULL_OPPS_INIT: 'EXT_SF/PULL_OPPS_INIT',
    SALESFORCE_PULL_OPPS_OK: 'EXT_SF/PULL_OPPS_OK',
    SALESFORCE_PULL_OPPS_FAIL: 'EXT_SF/PULL_OPPS_FAIL',
    ORACLE_QUERY_EXEC_INIT: 'EXT_ORACLE/QUERY_EXEC_INIT',
    ORACLE_QUERY_EXEC_OK: 'EXT_ORACLE/QUERY_EXEC_OK',
    ORACLE_QUERY_EXEC_FAIL: 'EXT_ORACLE/QUERY_EXEC_FAIL',
    MARQETA_ISSUE_CARD_INIT: 'EXT_MARQETA/ISSUE_CARD_INIT',
    MARQETA_ISSUE_CARD_OK: 'EXT_MARQETA/ISSUE_CARD_OK',
    MARQETA_ISSUE_CARD_FAIL: 'EXT_MARQETA/ISSUE_CARD_FAIL',
    SHOPIFY_PULL_ORDERS_INIT: 'EXT_SHOPIFY/PULL_ORDERS_INIT',
    SHOPIFY_PULL_ORDERS_OK: 'EXT_SHOPIFY/PULL_ORDERS_OK',
    SHOPIFY_PULL_ORDERS_FAIL: 'EXT_SHOPIFY/PULL_ORDERS_FAIL',
    WOOCOMMERCE_PULL_PRODUCTS_INIT: 'EXT_WOO/PULL_PRODUCTS_INIT',
    WOOCOMMERCE_PULL_PRODUCTS_OK: 'EXT_WOO/PULL_PRODUCTS_OK',
    WOOCOMMERCE_PULL_PRODUCTS_FAIL: 'EXT_WOO/PULL_PRODUCTS_FAIL',
    GODADDY_LIST_DOMAINS_INIT: 'EXT_GODADDY/LIST_DOMAINS_INIT',
    GODADDY_LIST_DOMAINS_OK: 'EXT_GODADDY/LIST_DOMAINS_OK',
    GODADDY_LIST_DOMAINS_FAIL: 'EXT_GODADDY/LIST_DOMAINS_FAIL',
    CPANEL_CREATE_ACCOUNT_INIT: 'EXT_CPANEL/CREATE_ACCOUNT_INIT',
    CPANEL_CREATE_ACCOUNT_OK: 'EXT_CPANEL/CREATE_ACCOUNT_OK',
    CPANEL_CREATE_ACCOUNT_FAIL: 'EXT_CPANEL/CREATE_ACCOUNT_FAIL',
    ADOBE_UPLOAD_ASSET_INIT: 'EXT_ADOBE/UPLOAD_ASSET_INIT',
    ADOBE_UPLOAD_ASSET_OK: 'EXT_ADOBE/UPLOAD_ASSET_OK',
    ADOBE_UPLOAD_ASSET_FAIL: 'EXT_ADOBE/UPLOAD_ASSET_FAIL',
    TWILIO_SEND_MSG_INIT: 'EXT_TWILIO/SEND_MSG_INIT',
    TWILIO_SEND_MSG_OK: 'EXT_TWILIO/SEND_MSG_OK',
    TWILIO_SEND_MSG_FAIL: 'EXT_TWILIO/SEND_MSG_FAIL',
    GDRIVE_LIST_FILES_INIT: 'EXT_GDRIVE/LIST_FILES_INIT',
    GDRIVE_LIST_FILES_OK: 'EXT_GDRIVE/LIST_FILES_OK',
    GDRIVE_LIST_FILES_FAIL: 'EXT_GDRIVE/LIST_FILES_FAIL',
    ONEDRIVE_SYNC_FOLDER_INIT: 'EXT_ONEDRIVE/SYNC_FOLDER_INIT',
    ONEDRIVE_SYNC_FOLDER_OK: 'EXT_ONEDRIVE/SYNC_FOLDER_OK',
    ONEDRIVE_SYNC_FOLDER_FAIL: 'EXT_ONEDRIVE/SYNC_FOLDER_FAIL',
    AZURE_DEPLOY_VM_INIT: 'EXT_AZURE/DEPLOY_VM_INIT',
    AZURE_DEPLOY_VM_OK: 'EXT_AZURE/DEPLOY_VM_OK',
    AZURE_DEPLOY_VM_FAIL: 'EXT_AZURE/DEPLOY_VM_FAIL',
    GCP_SPIN_UP_INSTANCE_INIT: 'EXT_GCP/SPIN_UP_INSTANCE_INIT',
    GCP_SPIN_UP_INSTANCE_OK: 'EXT_GCP/SPIN_UP_INSTANCE_OK',
    GCP_SPIN_UP_INSTANCE_FAIL: 'EXT_GCP/SPIN_UP_INSTANCE_FAIL',
    SUPABASE_FETCH_ROWS_INIT: 'EXT_SUPABASE/FETCH_ROWS_INIT',
    SUPABASE_FETCH_ROWS_OK: 'EXT_SUPABASE/FETCH_ROWS_OK',
    SUPABASE_FETCH_ROWS_FAIL: 'EXT_SUPABASE/FETCH_ROWS_FAIL',
    VERCEL_TRIGGER_DEPLOY_INIT: 'EXT_VERCEL/TRIGGER_DEPLOY_INIT',
    VERCEL_TRIGGER_DEPLOY_OK: 'EXT_VERCEL/TRIGGER_DEPLOY_OK',
    VERCEL_TRIGGER_DEPLOY_FAIL: 'EXT_VERCEL/TRIGGER_DEPLOY_FAIL',
    HFACE_INFERENCE_INIT: 'EXT_HFACE/INFERENCE_INIT',
    HFACE_INFERENCE_OK: 'EXT_HFACE/INFERENCE_OK',
    HFACE_INFERENCE_FAIL: 'EXT_HFACE/INFERENCE_FAIL',
    CHATGPT_QUERY_INIT: 'EXT_CHATGPT/QUERY_INIT',
    CHATGPT_QUERY_OK: 'EXT_CHATGPT/QUERY_OK',
    CHATGPT_QUERY_FAIL: 'EXT_CHATGPT/QUERY_FAIL',
    PIPEDREAM_EXEC_WORKFLOW_INIT: 'EXT_PIPEDREAM/EXEC_WORKFLOW_INIT',
    PIPEDREAM_EXEC_WORKFLOW_OK: 'EXT_PIPEDREAM/EXEC_WORKFLOW_OK',
    PIPEDREAM_EXEC_WORKFLOW_FAIL: 'EXT_PIPEDREAM/EXEC_WORKFLOW_FAIL',
};
const CITIBANK_URL = 'citibankdemobusiness.dev';
const CITIBANK_CORP_NAME = 'Citibank demo business Inc';
const genUniqId = () => {
    let d = new Date().getTime();
    let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;
    return 'citi-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        let r = Math.random() * 16;
        if (d > 0) {
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
};
export const deepClone = (o) => {
    if (o instanceof Date) {
        return new Date(o.getTime());
    }
    if (o instanceof Map) {
        const nm = new Map();
        for (let [k, v] of o.entries()) {
            nm.set(k, deepClone(v));
        }
        return nm;
    }
    if (Array.isArray(o)) {
        return o.map(i => deepClone(i));
    }
    if (o && typeof o === 'object') {
        const c = {};
        for (let k in o) {
            if (Object.prototype.hasOwnProperty.call(o, k)) {
                c[k] = deepClone(o[k]);
            }
        }
        return c;
    }
    return o;
};
export const addAuditMsg = (cl, uid, at, eid, ch, dt = '') => {
    const ne = {
        id: genUniqId(),
        usrId: uid || 'SYS_UNKNOWN',
        actTyp: at,
        entId: eid,
        chgs: deepClone(ch),
        ts: new Date(),
        dts: dt,
    };
    return [...cl, ne];
};
export const normFinRecs = (d) => {
    const n = new Map();
    d.forEach(e => n.set(e.id, { ...e
    }));
    return n;
};
export const applyFinSort = (d, s) => {
    if (!s || !s.k) {
        return [...d];
    }
    const sd = [...d].sort((a, b) => {
        const va = a[s.k];
        const vb = b[s.k];
        if (va === undefined || va === null) return s.d === 'asc' ? 1 : -1;
        if (vb === undefined || vb === null) return s.d === 'asc' ? -1 : 1;
        if (typeof va === 'string' && typeof vb === 'string') {
            return s.d === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
        }
        if (va instanceof Date && vb instanceof Date) {
            return s.d === 'asc' ? va.getTime() - vb.getTime() : vb.getTime() - va.getTime();
        }
        if (typeof va === 'number' && typeof vb === 'number') {
            return s.d === 'asc' ? va - vb : vb - va;
        }
        return 0;
    });
    return sd;
};
export const applyFinFltr = (d, f) => {
    if (!f || Object.keys(f).every(k => f[k] === undefined || f[k] === null || f[k] === false || (Array.isArray(f[k]) && f[k].length === 0))) {
        return [...d];
    }
    return d.filter(e => {
        if (f.acctId && e.acctId !== f.acctId) return false;
        if (f.txId && e.txId !== f.txId) return false;
        if (f.typ && e.typ !== f.typ) return false;
        if (f.stat && e.stat !== f.stat) return false;
        if (f.curr && e.curr !== f.curr) return false;
        if (f.srcSys && e.srcSys !== f.srcSys) return false;
        if (f.cat && e.cat !== f.cat) return false;
        const etxnd = e.txDt instanceof Date ? e.txDt : new Date(e.txDt);
        if (f.sDt && etxnd < f.sDt) return false;
        if (f.eDt && etxnd > f.eDt) return false;
        if (f.minAmt !== undefined && e.amt < f.minAmt) return false;
        if (f.maxAmt !== undefined && e.amt > f.maxAmt) return false;
        if (f.abnOnly && (!e.abnScr || e.abnScr < 0.7)) return false;
        if (f.frdOnly && (!e.frdFlg || e.frdFlg === 'NONE')) return false;
        if (f.matchStat && e.matchStat !== f.matchStat) return false;
        return true;
    });
};
export const initFinRecState = {
    records: new Map(),
    isWorking: false,
    isPushing: false,
    isModding: false,
    isDeling: false,
    isBulkOp: false,
    filters: {
        acctId: undefined,
        txId: undefined,
        typ: undefined,
        stat: undefined,
        curr: undefined,
        srcSys: undefined,
        cat: undefined,
        sDt: undefined,
        eDt: undefined,
        minAmt: undefined,
        maxAmt: undefined,
        abnOnly: false,
        frdOnly: false,
        matchStat: undefined,
    },
    sorting: {
        k: 'postDt',
        d: 'desc'
    },
    pagination: {
        currPg: 1,
        perPg: 50,
        totItms: 0,
        totPgs: 0,
    },
    pickedRecId: null,
    abnormalScanRes: new Map(),
    forecastedTxs: [],
    matchRecs: new Map(),
    fraudScanRes: new Map(),
    activeReport: null,
    intelMdlState: {
        mdlName: 'Gemini Finance Intel Core',
        ver: '4.0.Alpha',
        lastTrain: null,
        lastTest: null,
        perfMetric: 0.0,
        status: 'BOOTING',
        feats: ['abnormal_scan', 'fraud_scan', 'forecast', 'reporting', 'tx_check', 'tx_tagging', 'cash_forecast', 'compliance_rpt', 'journal_suggest'],
        nextTrain: null,
        health: {
            up: '99.99%',
            latency: 120,
            errRate: '0.02%'
        },
    },
    txCheckRes: new Map(),
    taggingRes: new Map(),
    cashForecasts: [],
    complianceRpts: new Map(),
    journalSuggestions: new Map(),
    log: [],
    err: null,
    lastPull: null,
    lastIntelRun: null,
    integrations: {
        plaid: {
            connected: false,
            accounts: [],
            transactions: [],
            isWorking: false,
            err: null
        },
        modernTreasury: {
            connected: false,
            paymentOrders: [],
            isWorking: false,
            err: null
        },
        github: {
            commits: [],
            isWorking: false,
            err: null
        },
        salesforce: {
            opportunities: [],
            isWorking: false,
            err: null
        },
        oracle: {
            lastResult: [],
            isWorking: false,
            err: null
        },
        marqeta: {
            issuedCards: [],
            isWorking: false,
            err: null
        },
        shopify: {
            orders: [],
            isWorking: false,
            err: null
        },
        wooCommerce: {
            products: [],
            isWorking: false,
            err: null
        },
        godaddy: {
            domains: [],
            isWorking: false,
            err: null
        },
        cpanel: {
            accounts: [],
            isWorking: false,
            err: null
        },
        adobe: {
            assets: [],
            isWorking: false,
            err: null
        },
        twilio: {
            sentMessages: [],
            isWorking: false,
            err: null
        },
        gdrive: {
            files: [],
            isWorking: false,
            err: null
        },
        onedrive: {
            syncStatus: 'idle',
            isWorking: false,
            err: null
        },
        azure: {
            vms: [],
            isWorking: false,
            err: null
        },
        gcp: {
            instances: [],
            isWorking: false,
            err: null
        },
        supabase: {
            rows: [],
            isWorking: false,
            err: null
        },
        vercel: {
            deployments: [],
            isWorking: false,
            err: null
        },
        huggingface: {
            lastInference: null,
            isWorking: false,
            err: null
        },
        chatgpt: {
            lastResponse: null,
            isWorking: false,
            err: null
        },
        pipedream: {
            lastRun: null,
            isWorking: false,
            err: null
        },
    }
};
const LONG_DELAY = 4000;
const SHORT_DELAY = 1500;
const TINY_DELAY = 500;
const a = 1,
    b = 2,
    c = 3,
    d = 4,
    e = 5,
    f = 6,
    g = 7,
    h = 8,
    i = 9,
    j = 10,
    k = 11,
    l = 12,
    m = 13,
    n = 14,
    o = 15,
    p = 16,
    q = 17,
    r = 18,
    s = 19,
    t = 20,
    u = 21,
    v = 22,
    w = 23,
    x = 24,
    y = 25,
    z = 26;
const aa = 27,
    ab = 28,
    ac = 29,
    ad = 30,
    ae = 31,
    af = 32,
    ag = 33,
    ah = 34,
    ai = 35,
    aj = 36,
    ak = 37,
    al = 38,
    am = 39,
    an = 40,
    ao = 41,
    ap = 42,
    aq = 43,
    ar = 44,
    as = 45,
    at = 46,
    au = 47,
    av = 48,
    aw = 49,
    ax = 50,
    ay = 51,
    az = 52;
export const ExtSvcSim = {
    Gemini: {
        async scanAbnormal(d, s = 0.5) {
            await new Promise(r => setTimeout(r, SHORT_DELAY + Math.random() * 1000));
            return d.map(e => (Math.random() > (1 - s)) ? {
                recId: e.id,
                scr: parseFloat((0.6 + Math.random() * 0.4).toFixed(4)),
                rsns: [`Amount variance`, `Unusual frequency`, `Contextual outlier`],
                ts: new Date(),
                conf: parseFloat((0.8 + Math.random() * 0.2).toFixed(4)),
            } : null).filter(Boolean);
        },
        async forecastTx(d, h = 60) {
            await new Promise(r => setTimeout(r, LONG_DELAY));
            const p = [];
            const nw = new Date();
            for (let i = 0; i < h / 2; i++) {
                p.push({
                    id: `pred-${genUniqId()}`,
                    desc: `Forecasted Transaction`,
                    amt: parseFloat((Math.random() * 5000).toFixed(2)),
                    curr: 'USD',
                    typ: Math.random() > 0.5 ? 'DEBIT' : 'CREDIT',
                    predDt: new Date(nw.getTime() + Math.random() * h * 24 * 60 * 60 * 1000),
                    conf: parseFloat((0.65 + Math.random() * 0.3).toFixed(4)),
                });
            }
            return p.sort((a, b) => a.predDt.getTime() - b.predDt.getTime());
        }
    },
    Plaid: {
        async connect(t) {
            await new Promise(r => setTimeout(r, SHORT_DELAY));
            if (!t) throw new Error('Invalid Plaid token');
            return {
                ok: true,
                accts: [{
                    id: 'plaid-acct-1',
                    name: 'Citibank Demo Checking',
                    balance: 10000
                }]
            };
        },
        async pullTx(a, s, e) {
            await new Promise(r => setTimeout(r, SHORT_DELAY));
            const txs = [];
            for (let i = 0; i < 20; i++) {
                txs.push({
                    id: `plaid-tx-${genUniqId()}`,
                    acct: a,
                    amt: parseFloat((Math.random() * 200).toFixed(2)),
                    name: `Plaid Merchant ${i}`,
                    date: new Date()
                })
            }
            return txs;
        }
    },
    ModernTreasury: {
        async createPayment(p) {
            await new Promise(r => setTimeout(r, SHORT_DELAY));
            return {
                id: `mt-po-${genUniqId()}`,
                status: 'pending',
                ...p
            };
        }
    },
    GitHub: {
        async pushCommit(r, m) {
            await new Promise(r => setTimeout(r, SHORT_DELAY));
            return {
                sha: genUniqId().replace(/-/g, '').substring(0, 40),
                repo: r,
                message: m,
                ts: new Date()
            };
        }
    },
    Salesforce: {
        async pullOpportunities() {
            await new Promise(r => setTimeout(r, LONG_DELAY));
            const opps = [];
            for (let i = 0; i < 15; i++) {
                opps.push({
                    id: `sf-opp-${genUniqId()}`,
                    name: `Major Deal ${i}`,
                    stage: 'Prospecting',
                    amount: Math.random() * 100000
                })
            }
            return opps;
        }
    },
    Oracle: {
        async execQuery(q) {
            await new Promise(r => setTimeout(r, LONG_DELAY));
            return [{
                query: q,
                result: `Query result for "${q}"`,
                rows: 50
            }];
        }
    },
    Marqeta: {
        async issueCard(u) {
            await new Promise(r => setTimeout(r, SHORT_DELAY));
            return {
                card_token: `mq-card-${genUniqId()}`,
                user_token: u,
                state: 'ACTIVE'
            };
        }
    },
    Shopify: {
        async getOrders() {
            await new Promise(r => setTimeout(r, SHORT_DELAY));
            const ords = [];
            for (let i = 0; i < 30; i++) ords.push({
                id: `shp-ord-${i}`,
                total: (Math.random() * 100).toFixed(2)
            });
            return ords;
        }
    },
    WooCommerce: {
        async getProducts() {
            await new Promise(r => setTimeout(r, SHORT_DELAY));
            const prods = [];
            for (let i = 0; i < 100; i++) prods.push({
                id: `woo-prod-${i}`,
                name: `Product ${i}`
            });
            return prods;
        }
    },
    GoDaddy: {
        async listDomains() {
            await new Promise(r => setTimeout(r, SHORT_DELAY));
            return [{
                name: CITIBANK_URL,
                status: 'ACTIVE'
            }];
        }
    },
    CPanel: {
        async createAcct(d) {
            await new Promise(r => setTimeout(r, LONG_DELAY));
            return {
                domain: d,
                user: d.split('.')[0],
                status: 'created'
            };
        }
    },
    Adobe: {
        async uploadAsset(n) {
            await new Promise(r => setTimeout(r, SHORT_DELAY));
            return {
                id: `adobe-asset-${genUniqId()}`,
                name: n,
                url: `https://adobe.assets.com/${n}`
            };
        }
    },
    Twilio: {
        async sendMsg(t, b) {
            await new Promise(r => setTimeout(r, TINY_DELAY));
            return {
                sid: `tw-sid-${genUniqId()}`,
                to: t,
                body: b,
                status: 'sent'
            };
        }
    },
    GoogleDrive: {
        async listFiles() {
            await new Promise(r => setTimeout(r, SHORT_DELAY));
            return [{
                id: 'gdrive-1',
                name: 'spreadsheet.xlsx'
            }];
        }
    },
    OneDrive: {
        async syncFolder() {
            await new Promise(r => setTimeout(r, LONG_DELAY));
            return {
                status: 'synced',
                ts: new Date()
            };
        }
    },
    Azure: {
        async deployVm() {
            await new Promise(r => setTimeout(r, LONG_DELAY * 2));
            return {
                id: `az-vm-${genUniqId()}`,
                status: 'RUNNING'
            };
        }
    },
    GCP: {
        async spinUpInstance() {
            await new Promise(r => setTimeout(r, LONG_DELAY * 2));
            return {
                id: `gcp-inst-${genUniqId()}`,
                status: 'PROVISIONING'
            };
        }
    },
    Supabase: {
        async fetchRows() {
            await new Promise(r => setTimeout(r, SHORT_DELAY));
            return [{
                id: 1,
                data: 'some data'
            }];
        }
    },
    Vercel: {
        async triggerDeploy() {
            await new Promise(r => setTimeout(r, SHORT_DELAY));
            return {
                id: `v-dep-${genUniqId()}`,
                status: 'BUILDING'
            };
        }
    },
    HuggingFace: {
        async runInference() {
            await new Promise(r => setTimeout(r, LONG_DELAY));
            return {
                result: [
                    [{
                        label: 'POSITIVE',
                        score: 0.99
                    }]
                ]
            };
        }
    },
    ChatGPT: {
        async query(p) {
            await new Promise(r => setTimeout(r, LONG_DELAY));
            return {
                response: `This is a simulated response to: ${p}`
            };
        }
    },
    Pipedream: {
        async execWorkflow() {
            await new Promise(r => setTimeout(r, SHORT_DELAY));
            return {
                id: `pd-run-${genUniqId()}`,
                status: 'SUCCESS'
            };
        }
    }
};

const makeBaseReducerLogic = (sliceName) => {
    return (state, action) => {
        return state;
    };
};
export const makeFinRecReducer = (sliceName = "finRecords") => {
    const baseLogic = makeBaseReducerLogic(sliceName);
    return (state = initFinRecState, action) => {
        let nextState = deepClone(state);
        const {
            payload,
            type
        } = action;
        const usr = payload?.usrId || 'SYS';
        const opId = genUniqId().substring(0, 8);
        switch (type) {
            case BIZ_FIN_EVT_TYPES.PULL_FIN_RECS_INIT:
                nextState.isWorking = true;
                nextState.err = null;
                nextState.log = addAuditMsg(nextState.log, usr, type, 'N/A', {
                    opId
                });
                break;
            case BIZ_FIN_EVT_TYPES.PULL_FIN_RECS_OK:
                nextState.isWorking = false;
                nextState.records = normFinRecs(payload.recs);
                nextState.pagination.totItms = payload.total;
                nextState.pagination.totPgs = Math.ceil(payload.total / nextState.pagination.perPg);
                nextState.lastPull = new Date();
                nextState.log = addAuditMsg(nextState.log, usr, type, 'N/A', {
                    opId,
                    cnt: payload.recs.length
                });
                break;
            case BIZ_FIN_EVT_TYPES.PULL_FIN_RECS_FAIL:
                nextState.isWorking = false;
                nextState.err = {
                    msg: payload.msg,
                    code: 'PULL_FAIL'
                };
                nextState.log = addAuditMsg(nextState.log, usr, type, 'N/A', {
                    opId,
                    err: payload.msg
                });
                break;
            case BIZ_FIN_EVT_TYPES.PUSH_FIN_REC_INIT:
                nextState.isPushing = true;
                nextState.err = null;
                break;
            case BIZ_FIN_EVT_TYPES.PUSH_FIN_REC_OK:
                nextState.isPushing = false;
                nextState.records.set(payload.rec.id, { ...payload.rec
                });
                nextState.pagination.totItms++;
                break;
            case BIZ_FIN_EVT_TYPES.PUSH_FIN_REC_FAIL:
                nextState.isPushing = false;
                nextState.err = {
                    msg: payload.msg,
                    code: 'PUSH_FAIL'
                };
                break;
            case BIZ_FIN_EVT_TYPES.MOD_FIN_REC_INIT:
                nextState.isModding = true;
                nextState.err = null;
                break;
            case BIZ_FIN_EVT_TYPES.MOD_FIN_REC_OK:
                nextState.isModding = false;
                if (nextState.records.has(payload.rec.id)) {
                    nextState.records.set(payload.rec.id, { ...payload.rec
                    });
                }
                break;
            case BIZ_FIN_EVT_TYPES.MOD_FIN_REC_FAIL:
                nextState.isModding = false;
                nextState.err = {
                    msg: payload.msg,
                    code: 'MOD_FAIL'
                };
                break;
            case BIZ_FIN_EVT_TYPES.DEL_FIN_REC_INIT:
                nextState.isDeling = true;
                nextState.err = null;
                break;
            case BIZ_FIN_EVT_TYPES.DEL_FIN_REC_OK:
                nextState.isDeling = false;
                if (nextState.records.delete(payload.recId)) {
                    nextState.pagination.totItms--;
                    nextState.abnormalScanRes.delete(payload.recId);
                    nextState.fraudScanRes.delete(payload.recId);
                }
                if (nextState.pickedRecId === payload.recId) {
                    nextState.pickedRecId = null;
                }
                break;
            case BIZ_FIN_EVT_TYPES.DEL_FIN_REC_FAIL:
                nextState.isDeling = false;
                nextState.err = {
                    msg: payload.msg,
                    code: 'DEL_FAIL'
                };
                break;
            case BIZ_FIN_EVT_TYPES.BULK_PUSH_FIN_RECS_INIT:
            case BIZ_FIN_EVT_TYPES.BULK_MOD_FIN_RECS_INIT:
            case BIZ_FIN_EVT_TYPES.BULK_DEL_FIN_RECS_INIT:
                nextState.isBulkOp = true;
                nextState.err = null;
                break;
            case BIZ_FIN_EVT_TYPES.BULK_PUSH_FIN_RECS_OK:
                nextState.isBulkOp = false;
                payload.recs.forEach(r => nextState.records.set(r.id, { ...r
                }));
                nextState.pagination.totItms += payload.recs.length;
                break;
            case BIZ_FIN_EVT_TYPES.BULK_MOD_FIN_RECS_OK:
                nextState.isBulkOp = false;
                payload.recs.forEach(r => {
                    if (nextState.records.has(r.id)) nextState.records.set(r.id, { ...r
                    });
                });
                break;
            case BIZ_FIN_EVT_TYPES.BULK_DEL_FIN_RECS_OK:
                nextState.isBulkOp = false;
                payload.recIds.forEach(id => {
                    if (nextState.records.delete(id)) nextState.pagination.totItms--;
                });
                break;
            case BIZ_FIN_EVT_TYPES.BULK_PUSH_FIN_RECS_FAIL:
            case BIZ_FIN_EVT_TYPES.BULK_MOD_FIN_RECS_FAIL:
            case BIZ_FIN_EVT_TYPES.BULK_DEL_FIN_RECS_FAIL:
                nextState.isBulkOp = false;
                nextState.err = {
                    msg: payload.msg,
                    code: 'BULK_FAIL'
                };
                break;
            case BIZ_FIN_EVT_TYPES.APPLY_FIN_FILTERS:
                nextState.filters = { ...nextState.filters,
                    ...payload.fltrs
                };
                nextState.pagination.currPg = 1;
                break;
            case BIZ_FIN_EVT_TYPES.APPLY_FIN_SORT:
                nextState.sorting = { ...payload.srt
                };
                break;
            case BIZ_FIN_EVT_TYPES.APPLY_FIN_PAGINATION:
                nextState.pagination = { ...nextState.pagination,
                    ...payload.pg
                };
                break;
            case BIZ_FIN_EVT_TYPES.PICK_FIN_REC:
                nextState.pickedRecId = payload.recId;
                break;
            case BIZ_FIN_EVT_TYPES.UNPICK_FIN_REC:
                nextState.pickedRecId = null;
                break;
            case BIZ_FIN_EVT_TYPES.INTEL_SCAN_ABNORMAL_INIT:
            case BIZ_FIN_EVT_TYPES.INTEL_FORECAST_TX_INIT:
            case BIZ_FIN_EVT_TYPES.INTEL_MATCH_RECS_INIT:
            case BIZ_FIN_EVT_TYPES.INTEL_SCAN_FRAUD_INIT:
            case BIZ_FIN_EVT_TYPES.INTEL_BUILD_REPORT_INIT:
            case BIZ_FIN_EVT_TYPES.INTEL_CHECK_TX_INIT:
            case BIZ_FIN_EVT_TYPES.INTEL_TAG_TX_INIT:
            case BIZ_FIN_EVT_TYPES.INTEL_FORECAST_CASH_INIT:
            case BIZ_FIN_EVT_TYPES.INTEL_BUILD_COMPLIANCE_INIT:
            case BIZ_FIN_EVT_TYPES.INTEL_SUGGEST_JOURNAL_INIT:
                nextState.isWorking = true;
                nextState.err = null;
                break;
            case BIZ_FIN_EVT_TYPES.INTEL_TRAIN_MODEL_INIT:
            case BIZ_FIN_EVT_TYPES.INTEL_TEST_MODEL_INIT:
                nextState.isWorking = true;
                nextState.err = null;
                nextState.intelMdlState.status = type === BIZ_FIN_EVT_TYPES.INTEL_TRAIN_MODEL_INIT ? 'TRAINING' : 'TESTING';
                break;
            case BIZ_FIN_EVT_TYPES.INTEL_SCAN_ABNORMAL_OK:
                nextState.isWorking = false;
                payload.res.forEach(r => {
                    nextState.abnormalScanRes.set(r.recId, r);
                    const rec = nextState.records.get(r.recId);
                    if (rec) nextState.records.set(r.recId, { ...rec,
                        abnScr: r.scr
                    });
                });
                nextState.lastIntelRun = new Date();
                break;
            case BIZ_FIN_EVT_TYPES.INTEL_FORECAST_TX_OK:
                nextState.isWorking = false;
                nextState.forecastedTxs = payload.preds;
                nextState.lastIntelRun = new Date();
                break;
            case BIZ_FIN_EVT_TYPES.INTEL_TRAIN_MODEL_OK:
            case BIZ_FIN_EVT_TYPES.INTEL_TEST_MODEL_OK:
                nextState.isWorking = false;
                nextState.intelMdlState = { ...payload.mdlState,
                    status: 'ONLINE'
                };
                break;
            case BIZ_FIN_EVT_TYPES.INTEL_MOD_MODEL_STATE:
                nextState.intelMdlState = { ...nextState.intelMdlState,
                    ...payload.updates
                };
                break;
            case BIZ_FIN_EVT_TYPES.WIPE_FIN_ERROR:
                nextState.err = null;
                break;
            case BIZ_FIN_EVT_TYPES.SET_FIN_ERROR:
                nextState.err = {
                    msg: payload.msg,
                    code: payload.code || 'GEN_ERR'
                };
                break;
            case BIZ_FIN_EVT_TYPES.PLAID_CONNECT_INIT:
                nextState.integrations.plaid.isWorking = true;
                nextState.integrations.plaid.err = null;
                break;
            case BIZ_FIN_EVT_TYPES.PLAID_CONNECT_OK:
                nextState.integrations.plaid.isWorking = false;
                nextState.integrations.plaid.connected = true;
                nextState.integrations.plaid.accounts = payload.accts;
                break;
            case BIZ_FIN_EVT_TYPES.PLAID_CONNECT_FAIL:
                nextState.integrations.plaid.isWorking = false;
                nextState.integrations.plaid.err = payload.err;
                break;
            case BIZ_FIN_EVT_TYPES.PLAID_PULL_TX_INIT:
                nextState.integrations.plaid.isWorking = true;
                nextState.integrations.plaid.err = null;
                break;
            case BIZ_FIN_EVT_TYPES.PLAID_PULL_TX_OK:
                nextState.integrations.plaid.isWorking = false;
                nextState.integrations.plaid.transactions = payload.txs;
                break;
            case BIZ_FIN_EVT_TYPES.PLAID_PULL_TX_FAIL:
                nextState.integrations.plaid.isWorking = false;
                nextState.integrations.plaid.err = payload.err;
                break;
            case BIZ_FIN_EVT_TYPES.MT_CREATE_PAYMENT_INIT:
                nextState.integrations.modernTreasury.isWorking = true;
                break;
            case BIZ_FIN_EVT_TYPES.MT_CREATE_PAYMENT_OK:
                nextState.integrations.modernTreasury.isWorking = false;
                nextState.integrations.modernTreasury.paymentOrders.push(payload.po);
                break;
            case BIZ_FIN_EVT_TYPES.MT_CREATE_PAYMENT_FAIL:
                nextState.integrations.modernTreasury.isWorking = false;
                nextState.integrations.modernTreasury.err = payload.err;
                break;
            case BIZ_FIN_EVT_TYPES.GITHUB_COMMIT_PUSH_INIT:
                nextState.integrations.github.isWorking = true;
                break;
            case BIZ_FIN_EVT_TYPES.GITHUB_COMMIT_PUSH_OK:
                nextState.integrations.github.isWorking = false;
                nextState.integrations.github.commits.push(payload.commit);
                break;
            case BIZ_FIN_EVT_TYPES.GITHUB_COMMIT_PUSH_FAIL:
                nextState.integrations.github.isWorking = false;
                nextState.integrations.github.err = payload.err;
                break;
            case BIZ_FIN_EVT_TYPES.SALESFORCE_PULL_OPPS_INIT:
                nextState.integrations.salesforce.isWorking = true;
                break;
            case BIZ_FIN_EVT_TYPES.SALESFORCE_PULL_OPPS_OK:
                nextState.integrations.salesforce.isWorking = false;
                nextState.integrations.salesforce.opportunities = payload.opps;
                break;
            case BIZ_FIN_EVT_TYPES.SALESFORCE_PULL_OPPS_FAIL:
                nextState.integrations.salesforce.isWorking = false;
                nextState.integrations.salesforce.err = payload.err;
                break;
            case BIZ_FIN_EVT_TYPES.INTEL_SCAN_ABNORMAL_FAIL:
            case BIZ_FIN_EVT_TYPES.INTEL_FORECAST_TX_FAIL:
            case BIZ_FIN_EVT_TYPES.INTEL_MATCH_RECS_FAIL:
            case BIZ_FIN_EVT_TYPES.INTEL_SCAN_FRAUD_FAIL:
            case BIZ_FIN_EVT_TYPES.INTEL_BUILD_REPORT_FAIL:
            case BIZ_FIN_EVT_TYPES.INTEL_TRAIN_MODEL_FAIL:
            case BIZ_FIN_EVT_TYPES.INTEL_TEST_MODEL_FAIL:
            case BIZ_FIN_EVT_TYPES.INTEL_CHECK_TX_FAIL:
            case BIZ_FIN_EVT_TYPES.INTEL_TAG_TX_FAIL:
            case BIZ_FIN_EVT_TYPES.INTEL_FORECAST_CASH_FAIL:
            case BIZ_FIN_EVT_TYPES.INTEL_BUILD_COMPLIANCE_FAIL:
            case BIZ_FIN_EVT_TYPES.INTEL_SUGGEST_JOURNAL_FAIL:
                nextState.isWorking = false;
                nextState.err = {
                    msg: `Intel Op Failed (${type}): ${payload.msg || 'Unknown Intel Svc err.'}`,
                    code: payload.code || 'INTEL_SVC_ERR'
                };
                if (type === BIZ_FIN_EVT_TYPES.INTEL_TRAIN_MODEL_FAIL || type === BIZ_FIN_EVT_TYPES.INTEL_TEST_MODEL_FAIL) {
                    nextState.intelMdlState.status = 'ERROR';
                }
                break;
            default:
                return state;
        }
        return nextState;
    };
};
export const finRecDataViews = {
    fetchAllRecs: (s) => Array.from(s.records.values()),
    fetchRecById: (s, id) => s.records.get(id),
    fetchPickedRec: (s) => s.pickedRecId ? s.records.get(s.pickedRecId) : null,
    isAnyWorking: (s) => s.isWorking || s.isPushing || s.isModding || s.isDeling || s.isBulkOp,
    fetchFilteredSortedRecs: (s) => {
        const ar = Array.from(s.records.values());
        let f = applyFinFltr(ar, s.filters);
        let st = applyFinSort(f, s.sorting);
        return st;
    },
    fetchCurrentPgRecs: (s) => {
        const fs = finRecDataViews.fetchFilteredSortedRecs(s);
        const {
            currPg,
            perPg
        } = s.pagination;
        const si = (currPg - 1) * perPg;
        const ei = si + perPg;
        return fs.slice(si, ei);
    },
    fetchPgInfo: (s) => {
        const fc = finRecDataViews.fetchFilteredSortedRecs(s).length;
        const tp = Math.ceil(fc / s.pagination.perPg);
        return { ...s.pagination,
            totItms: fc,
            totPgs: tp
        };
    },
    fetchAllAbnormalScanRes: (s) => Array.from(s.abnormalScanRes.values()),
    fetchAbnormalResForRec: (s, id) => s.abnormalScanRes.get(id),
    fetchForecastedTxs: (s) => s.forecastedTxs,
    fetchAllMatchRecs: (s) => s.matchRecs,
    fetchMatchRecsForRec: (s, id) => s.matchRecs.get(id),
    fetchAllFraudScanRes: (s) => Array.from(s.fraudScanRes.values()),
    fetchFraudResForRec: (s, id) => s.fraudScanRes.get(id),
    fetchActiveReport: (s) => s.activeReport,
    fetchIntelMdlState: (s) => s.intelMdlState,
    fetchAllTxCheckRes: (s) => Array.from(s.txCheckRes.values()),
    fetchTxCheckResForRec: (s, id) => s.txCheckRes.get(id),
    fetchAllTaggingRes: (s) => Array.from(s.taggingRes.values()),
    fetchTaggingResForRec: (s, id) => s.taggingRes.get(id),
    fetchCashForecasts: (s) => s.cashForecasts,
    fetchAllComplianceRpts: (s) => Array.from(s.complianceRpts.values()),
    fetchComplianceRptById: (s, id) => s.complianceRpts.get(id),
    fetchAllJournalSuggestions: (s) => Array.from(s.journalSuggestions.values()),
    fetchJournalSuggestionForTx: (s, id) => s.journalSuggestions.get(id),
    fetchLog: (s) => s.log,
    fetchError: (s) => s.err,
    fetchFilteredSummary: (s) => {
        const fr = finRecDataViews.fetchFilteredSortedRecs(s);
        const ta = fr.reduce((sum, e) => sum + e.amt, 0);
        const dc = fr.filter(e => e.typ === 'DEBIT').length;
        const cc = fr.filter(e => e.typ === 'CREDIT').length;
        const da = new Set(fr.map(e => e.acctId)).size;
        return {
            totRecs: fr.length,
            totAmt: parseFloat(ta.toFixed(2)),
            debCnt: dc,
            crdCnt: cc,
            distAccts: da,
            avgAmt: fr.length > 0 ? parseFloat((ta / fr.length).toFixed(2)) : 0,
        };
    },
};
const finRecords = makeFinRecReducer("finRecords");
export default finRecords;