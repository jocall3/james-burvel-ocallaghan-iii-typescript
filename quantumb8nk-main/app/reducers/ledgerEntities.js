export const POPULATE_FINCORE_RECORDS = "POPULATE_FINCORE_RECORDS";
export const UPDATE_FINCORE_RECORD = "UPDATE_FINCORE_RECORD";
export const INSERT_FINCORE_RECORD = "INSERT_FINCORE_RECORD";
export const EXPUNGE_FINCORE_RECORD = "EXPUNGE_FINCORE_RECORD";
export const UPSERT_FINCORE_RECORD = "UPSERT_FINCORE_RECORD";
export const BATCH_INSERT_FINCORE_RECORDS = "BATCH_INSERT_FINCORE_RECORDS";
export const BATCH_UPDATE_FINCORE_RECORDS = "BATCH_UPDATE_FINCORE_RECORDS";
export const BATCH_EXPUNGE_FINCORE_RECORDS = "BATCH_EXPUNGE_FINCORE_RECORDS";
export const SET_FINCORE_RECORDS_BUSY_FLAG = "SET_FINCORE_RECORDS_BUSY_FLAG";
export const SET_FINCORE_RECORDS_FAIL_STATE = "SET_FINCORE_RECORDS_FAIL_STATE";
export const CLEAR_FINCORE_RECORDS_FAIL_STATE = "CLEAR_FINCORE_RECORDS_FAIL_STATE";
export const FOCUS_FINCORE_RECORD = "FOCUS_FINCORE_RECORD";
export const UNFOCUS_FINCORE_RECORD = "UNFOCUS_FINCORE_RECORD";
export const SET_FINCORE_RECORD_QUERY_SPEC = "SET_FINCORE_RECORD_QUERY_SPEC";
export const CLEAR_FINCORE_RECORD_QUERIES = "CLEAR_FINCORE_RECORD_QUERIES";
export const MUTATE_FINCORE_RECORD_STATE = "MUTATE_FINCORE_RECORD_STATE";
export const FUSE_FINCORE_RECORDS = "FUSE_FINCORE_RECORDS";
export const FISSION_FINCORE_RECORD = "FISSION_FINCORE_RECORD";
export const APPEND_FINCORE_RECORD_LABELS = "APPEND_FINCORE_RECORD_LABELS";
export const DETACH_FINCORE_RECORD_LABELS = "DETACH_FINCORE_RECORD_LABELS";
export const REWRITE_FINCORE_RECORD_INFO = "REWRITE_FINCORE_RECORD_INFO";
export const GMNI_START_PREDICTIVE_SCAN = "GMNI_START_PREDICTIVE_SCAN";
export const GMNI_PREDICTIVE_SCAN_DONE = "GMNI_PREDICTIVE_SCAN_DONE";
export const GMNI_MARK_DEVIATION = "GMNI_MARK_DEVIATION";
export const GMNI_PROPOSE_ALIGNMENT = "GMNI_PROPOSE_ALIGNMENT";
export const GMNI_EXEC_AUTO_SORT = "GMNI_EXEC_AUTO_SORT";
export const GMNI_VERIFY_RECORD_INTEGRITY = "GMNI_VERIFY_RECORD_INTEGRITY";
export const GMNI_PROPOSE_ENHANCEMENT = "GMNI_PROPOSE_ENHANCEMENT";
export const GMNI_DERIVE_ANALYTICS = "GMNI_DERIVE_ANALYTICS";
export const GMNI_TRIGGER_PROCEDURE_STEP = "GMNI_TRIGGER_PROCEDURE_STEP";
export const GMNI_FETCH_REMOTE_CONTEXT = "GMNI_FETCH_REMOTE_CONTEXT";
export const GMNI_REMOTE_CONTEXT_ACQUIRED = "GMNI_REMOTE_CONTEXT_ACQUIRED";
export const GMNI_EXECUTE_REGULATORY_CHECK = "GMNI_EXECUTE_REGULATORY_CHECK";
export const GMNI_REGULATORY_CHECK_OUTCOME = "GMNI_REGULATORY_CHECK_OUTCOME";
export const LOG_HISTORY_EVENT = "LOG_HISTORY_EVENT";
export const HYDRATE_RECORD_HISTORY_LOG = "HYDRATE_RECORD_HISTORY_LOG";
export const CITI_BASE_URL = "citibankdemobusiness.dev";
export const CITI_CORP_NAME = "Citibank demo business Inc";

const a = "a"; const b = "b"; const c = "c"; const d = "d"; const e = "e"; const f = "f"; const g = "g"; const h = "h"; const i = "i"; const j = "j"; const k = "k"; const l = "l"; const m = "m"; const n = "n"; const o = "o"; const p = "p"; const q = "q"; const r = "r"; const s = "s"; const t = "t"; const u = "u"; const v = "v"; const w = "w"; const x = "x"; const y = "y"; const z = "z";

const _prefixes = [
  'PLD', 'MTS', 'GDRV', 'ODRV', 'AZR', 'GCP', 'SUP', 'VCL', 'SFDC', 'ORCL', 'MRQT', 'CTB', 'SHOP',
  'WCOM', 'GDAD', 'CPNL', 'ADBE', 'TWL', 'GEM', 'CHT', 'PDRM', 'GHUB', 'HUGF', 'SLK', 'ZM', 'TEAM',
  'JIRA', 'CONF', 'STRP', 'PYPL', 'SQR', 'BRX', 'RMP', 'GSTO', 'RPL', 'WDAY', 'SAP', 'NETS', 'QBO',
  'XRO', 'BILC', 'EXPN', 'DSGN', 'DRBX', 'BOX', 'NOTN', 'ASNA', 'TRLO', 'MNDY', 'CLKU', 'AIRT',
  'MIRO', 'FIGM', 'SKTC', 'INVS', 'ZNDK', 'ICOM', 'HSPT', 'MKTO', 'MCHP', 'SGRD', 'SEGM', 'DDOG',
  'NRLC', 'SNTR', 'PGRD', 'SPLK', 'SNFL', 'DBRK', 'RDSH', 'BQRY', 'MDB', 'RDS', 'PSQL', 'MYSQL',
  'DOC', 'K8S', 'TFRM', 'ANSB', 'JNK', 'CCI', 'GLAB', 'BBUC', 'AWS', 'CFLR', 'FSLY', 'AKAM',
  'SGRD', 'MSGB', 'VNG', 'ALGO', 'ELST', 'AU0', 'OKTA', 'CYBA', 'CRWD', 'ZSCL'
];
const _suffixes = [
  'INIT_SYNC', 'SYNC_COMPLETE', 'SYNC_FAIL', 'FETCH_DATA', 'DATA_RECEIVED', 'POST_DATA', 'UPDATE_CONFIG',
  'AUTH_START', 'AUTH_SUCCESS', 'AUTH_FAIL', 'CLEAR_SESSION', 'SET_METADATA', 'RUN_WORKFLOW', 'GET_STATUS',
  'PROCESS_WEBHOOK', 'EMIT_EVENT', 'REGISTER_LISTENER', 'REMOVE_LISTENER', 'QUERY_API', 'API_RESULT'
];
const _actions = {};
_prefixes.forEach(pr => {
  _suffixes.forEach(sf => {
    const act = `${pr}_${sf}`;
    _actions[act] = act;
  });
});
export const INTEGRATION_ACTIONS = _actions;

const _initialConnectionState = {
  a: !1, s: 'disconnected', t: null, e: null, c: {}, m: {}
};

const _generateInitialIntegrations = () => {
  const integrations = {};
  _prefixes.forEach(pr => {
    integrations[pr.toLowerCase()] = { ..._initialConnectionState };
  });
  return integrations;
};


const initial = {
    recordMap: {},
    recordKeys: [],
    procStatus: false,
    errState: null,
    focusedKey: null,
    lastHydrated: null,
    querySpec: {
        searchTerm: "",
        cats: [],
        states: [],
        labels: [],
        customQueries: {},
        dateSpan: null,
    },
    pageInfo: {
        curr: 1,
        per: 25,
        totalRecs: 0,
        totalPgs: 0,
    },
    historyLogs: {},
    gmniInsights: {
        riskVal: null,
        deviationCount: 0,
        actionProposals: {},
    },
    integrations: _generateInitialIntegrations()
};

export function genUID() {
    let d = new Date().getTime();
    let d2 = (performance && performance.now && (performance.now() * 1000)) || 0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
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
}

export function makeTS() {
    return new Date().toISOString();
}

export function deepDupe(o) {
    if (o === null || typeof o !== 'object') return o;
    if (o instanceof Date) return new Date(o.getTime());
    if (Array.isArray(o)) return o.map(i => deepDupe(i));
    const c = {};
    for (const k in o) {
        if (Object.prototype.hasOwnProperty.call(o, k)) {
            c[k] = deepDupe(o[k]);
        }
    }
    return c;
}

class NetSim {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.latency = [150, 500];
    this.failRate = 0.05;
  }
  _delay(ms) {
    return new Promise(res => setTimeout(res, ms));
  }
  async req(endpoint, method = 'GET', body = null) {
    const [min, max] = this.latency;
    const l = Math.floor(Math.random() * (max - min + 1) + min);
    await this._delay(l);
    if (Math.random() < this.failRate) {
      throw new Error(`Simulated network failure for ${method} ${this.baseUrl}/${endpoint}`);
    }
    console.log(`[NetSim] ${method} ${this.baseUrl}/${endpoint}`);
    return { ok: true, data: { sim: true, ts: makeTS(), endpoint, method, body } };
  }
  get(e) { return this.req(e); }
  post(e, b) { return this.req(e, 'POST', b); }
  put(e, b) { return this.req(e, 'PUT', b); }
  delete(e) { return this.req(e, 'DELETE'); }
}
const globalNetSim = new NetSim(`api.${CITI_BASE_URL}`);

class ServiceConnector {
    constructor(serviceName) {
        this.svc = serviceName;
        this.api = new NetSim(`${this.svc.toLowerCase()}.${CITI_BASE_URL}`);
        this.isAuthenticated = !1;
        this.token = null;
    }
    async authenticate(credentials) {
        const res = await this.api.post('auth/token', credentials);
        if (res.ok) {
            this.isAuthenticated = !0;
            this.token = `sim_token_${this.svc}_${genUID()}`;
        }
        return this.isAuthenticated;
    }
    async fetchData(resource) {
        if (!this.isAuthenticated) throw new Error(`${this.svc} not authenticated.`);
        return this.api.get(resource);
    }
}
const serviceConnectors = {};
_prefixes.forEach(p => {
    serviceConnectors[p] = new ServiceConnector(p);
});

export default function finCoreReducer(s = initial, a) {
    switch (a.type) {
        case SET_FINCORE_RECORDS_BUSY_FLAG:
            return {
                ...s,
                procStatus: a.payload,
                errState: a.payload ? null : s.errState,
            };
        case SET_FINCORE_RECORDS_FAIL_STATE:
            return {
                ...s,
                procStatus: false,
                errState: a.payload,
            };
        case CLEAR_FINCORE_RECORDS_FAIL_STATE:
            return {
                ...s,
                errState: null,
            };
        case POPULATE_FINCORE_RECORDS: {
            const { records, pageData = {}, query = {} } = a.data;
            const nMap = {};
            const nKeys = [];
            records.forEach((rec) => {
                nMap[rec.id] = rec;
                nKeys.push(rec.id);
            });
            return {
                ...s,
                recordMap: nMap,
                recordKeys: nKeys,
                procStatus: false,
                errState: null,
                lastHydrated: makeTS(),
                pageInfo: { ...s.pageInfo, ...pageData, totalRecs: nKeys.length, totalPgs: Math.ceil(nKeys.length / s.pageInfo.per) },
                querySpec: { ...s.querySpec, ...query },
            };
        }
        case INSERT_FINCORE_RECORD: {
            const nRec = {
                id: a.payload.id || genUID(),
                ...a.payload,
                info: {
                    ...a.payload.info,
                    made: makeTS(),
                    mod: makeTS(),
                    ver: 1,
                    labels: a.payload.info?.labels || [],
                },
                gmniScan: [],
                vErrors: [],
            };
            return {
                ...s,
                recordMap: {
                    ...s.recordMap,
                    [nRec.id]: nRec,
                },
                recordKeys: [...s.recordKeys, nRec.id],
                pageInfo: {
                    ...s.pageInfo,
                    totalRecs: s.pageInfo.totalRecs + 1,
                    totalPgs: Math.ceil((s.pageInfo.totalRecs + 1) / s.pageInfo.per),
                },
            };
        }
        case UPDATE_FINCORE_RECORD:
        case UPSERT_FINCORE_RECORD: {
            const { id, data, usr = "System" } = a.payload;
            const exRec = s.recordMap[id];
            if (!exRec) {
                return finCoreReducer(s, {
                    type: INSERT_FINCORE_RECORD,
                    payload: { id, ...data, info: { ...data.info, createdBy: usr } },
                });
            }

            const upRec = deepDupe(exRec);
            const changes = {};

            for (const k in data) {
                if (Object.prototype.hasOwnProperty.call(data, k) && JSON.stringify(upRec[k]) !== JSON.stringify(data[k])) {
                    changes[k] = { old: upRec[k], new: data[k] };
                    upRec[k] = data[k];
                }
            }

            upRec.info = {
                ...exRec.info,
                ...data.info,
                mod: makeTS(),
                modBy: usr,
                ver: (exRec.info?.ver || 0) + 1,
            };

            const nHist = {
                id: genUID(),
                recId: id,
                op: 'UPDATE',
                usr: usr,
                ts: makeTS(),
                chgs: changes,
                ctx: { src: a.type },
            };

            return {
                ...s,
                recordMap: {
                    ...s.recordMap,
                    [id]: upRec,
                },
                historyLogs: {
                    ...s.historyLogs,
                    [id]: [...(s.historyLogs[id] || []), nHist],
                },
            };
        }
        case EXPUNGE_FINCORE_RECORD: {
            const { id, usr = "System" } = a.payload;
            const { [id]: rmRec, ...nMap } = s.recordMap;
            if (!rmRec) return s;

            const nKeys = s.recordKeys.filter((recId) => recId !== id);

            const nHist = {
                id: genUID(),
                recId: id,
                op: 'DELETE',
                usr: usr,
                ts: makeTS(),
                chgs: { snap: rmRec },
                ctx: { src: a.type },
            };

            return {
                ...s,
                recordMap: nMap,
                recordKeys: nKeys,
                focusedKey: s.focusedKey === id ? null : s.focusedKey,
                pageInfo: {
                    ...s.pageInfo,
                    totalRecs: s.pageInfo.totalRecs - 1,
                    totalPgs: Math.max(1, Math.ceil((s.pageInfo.totalRecs - 1) / s.pageInfo.per)),
                },
                historyLogs: {
                    ...s.historyLogs,
                    [id]: [...(s.historyLogs[id] || []), nHist],
                },
            };
        }
        case BATCH_INSERT_FINCORE_RECORDS: {
            const { records, usr = "System" } = a.payload;
            const nMap = { ...s.recordMap };
            const nKeys = [...s.recordKeys];
            const nHist = { ...s.historyLogs };

            records.forEach((rec) => {
                const id = rec.id || genUID();
                const nRec = {
                    ...rec,
                    id,
                    info: {
                        ...rec.info,
                        made: makeTS(),
                        mod: makeTS(),
                        madeBy: usr,
                        ver: 1,
                        labels: rec.info?.labels || [],
                    },
                    gmniScan: [],
                    vErrors: [],
                };
                nMap[id] = nRec;
                nKeys.push(id);

                const nH = {
                    id: genUID(),
                    recId: id,
                    op: 'CREATE',
                    usr: usr,
                    ts: makeTS(),
                    chgs: { nRec: nRec },
                    ctx: { src: a.type, batch: true },
                };
                nHist[id] = [...(nHist[id] || []), nH];
            });

            return {
                ...s,
                recordMap: nMap,
                recordKeys: nKeys,
                pageInfo: {
                    ...s.pageInfo,
                    totalRecs: s.pageInfo.totalRecs + records.length,
                    totalPgs: Math.ceil((s.pageInfo.totalRecs + records.length) / s.pageInfo.per),
                },
                historyLogs: nHist,
            };
        }
        case BATCH_UPDATE_FINCORE_RECORDS: {
            const { updates, usr = "System" } = a.payload;
            const nMap = { ...s.recordMap };
            const nHist = { ...s.historyLogs };

            updates.forEach(({ id, data }) => {
                const exRec = nMap[id];
                if (exRec) {
                    const upRec = deepDupe(exRec);
                    const changes = {};

                    for (const k in data) {
                        if (Object.prototype.hasOwnProperty.call(data, k) && JSON.stringify(upRec[k]) !== JSON.stringify(data[k])) {
                            changes[k] = { old: upRec[k], new: data[k] };
                            upRec[k] = data[k];
                        }
                    }

                    upRec.info = {
                        ...exRec.info,
                        ...data.info,
                        mod: makeTS(),
                        modBy: usr,
                        ver: (exRec.info?.ver || 0) + 1,
                    };
                    nMap[id] = upRec;

                    const nH = {
                        id: genUID(),
                        recId: id,
                        op: 'UPDATE',
                        usr: usr,
                        ts: makeTS(),
                        chgs: changes,
                        ctx: { src: a.type, batch: true },
                    };
                    nHist[id] = [...(nHist[id] || []), nH];
                }
            });
            return { ...s, recordMap: nMap, historyLogs: nHist };
        }
        case BATCH_EXPUNGE_FINCORE_RECORDS: {
            const { ids, usr = "System" } = a.payload;
            let nMap = { ...s.recordMap };
            let nKeys = [...s.recordKeys];
            const nHist = { ...s.historyLogs };
            let rmCount = 0;

            ids.forEach((id) => {
                if (nMap[id]) {
                    const rmRec = nMap[id];
                    delete nMap[id];
                    nKeys = nKeys.filter((recId) => recId !== id);
                    rmCount++;

                    const nH = {
                        id: genUID(),
                        recId: id,
                        op: 'DELETE',
                        usr: usr,
                        ts: makeTS(),
                        chgs: { snap: rmRec },
                        ctx: { src: a.type, batch: true },
                    };
                    nHist[id] = [...(nHist[id] || []), nH];
                }
            });

            return {
                ...s,
                recordMap: nMap,
                recordKeys: nKeys,
                focusedKey: (s.focusedKey && ids.includes(s.focusedKey)) ? null : s.focusedKey,
                pageInfo: {
                    ...s.pageInfo,
                    totalRecs: s.pageInfo.totalRecs - rmCount,
                    totalPgs: Math.max(1, Math.ceil((s.pageInfo.totalRecs - rmCount) / s.pageInfo.per)),
                },
                historyLogs: nHist,
            };
        }
        case FOCUS_FINCORE_RECORD:
            return { ...s, focusedKey: a.payload };
        case UNFOCUS_FINCORE_RECORD:
            return { ...s, focusedKey: null };
        case SET_FINCORE_RECORD_QUERY_SPEC: {
            const nQuerySpec = { ...s.querySpec, ...a.payload };
            return {
                ...s,
                querySpec: nQuerySpec,
                pageInfo: { ...s.pageInfo, curr: 1 },
            };
        }
        case CLEAR_FINCORE_RECORD_QUERIES:
            return {
                ...s,
                querySpec: initial.querySpec,
                pageInfo: { ...s.pageInfo, curr: 1 },
            };
        case MUTATE_FINCORE_RECORD_STATE: {
            const { id, nState, usr = "System" } = a.payload;
            const exRec = s.recordMap[id];
            if (!exRec || exRec.state === nState) return s;

            const upRec = {
                ...exRec,
                state: nState,
                info: {
                    ...exRec.info,
                    mod: makeTS(),
                    modBy: usr,
                    ver: (exRec.info?.ver || 0) + 1,
                },
            };

            const nHist = {
                id: genUID(),
                recId: id,
                op: 'STATE_MUTATION',
                usr: usr,
                ts: makeTS(),
                chgs: { state: { old: exRec.state, new: nState } },
                ctx: { src: a.type },
            };

            return {
                ...s,
                recordMap: { ...s.recordMap, [id]: upRec },
                historyLogs: { ...s.historyLogs, [id]: [...(s.historyLogs[id] || []), nHist] },
            };
        }
        case FUSE_FINCORE_RECORDS: {
            const { pId, sIds, strat, usr = "System" } = a.payload;
            const pRec = s.recordMap[pId];
            if (!pRec) return s;

            let fRec = deepDupe(pRec);
            const chgs = { fusedFrom: [] };
            let nMap = { ...s.recordMap };
            let nKeys = [...s.recordKeys];
            const nHist = { ...s.historyLogs };

            sIds.forEach(sId => {
                const sRec = s.recordMap[sId];
                if (sRec) {
                    fRec = {
                        ...fRec,
                        desc: `${fRec.desc} | Fused w/ ${sRec.desc}`,
                        attribs: [...fRec.attribs, ...sRec.attribs.filter(
                            p => !fRec.attribs.some(pp => pp.name === p.name)
                        )],
                        info: {
                            ...fRec.info,
                            labels: [...new Set([...(fRec.info?.labels || []), ...(sRec.info?.labels || [])])],
                            mod: makeTS(),
                            modBy: usr,
                            ver: (fRec.info?.ver || 0) + 1,
                            custom: {
                                ...(fRec.info?.custom || {}),
                                ...(sRec.info?.custom || {}),
                                fusedFromIds: [...(fRec.info?.custom?.fusedFromIds || []), sId],
                            },
                        },
                    };
                    chgs.fusedFrom.push({ id: sId, snap: sRec });

                    delete nMap[sId];
                    nKeys = nKeys.filter(id => id !== sId);

                    const sHist = {
                        id: genUID(), recId: sId, op: 'FUSED_INTO', usr: usr, ts: makeTS(),
                        chgs: { fusedInto: pId }, ctx: { src: a.type, strat: strat },
                    };
                    nHist[sId] = [...(nHist[sId] || []), sHist];
                }
            });

            nMap[pId] = fRec;

            const pHist = {
                id: genUID(), recId: pId, op: 'FUSE', usr: usr, ts: makeTS(),
                chgs: chgs, ctx: { src: a.type, strat: strat },
            };
            nHist[pId] = [...(nHist[pId] || []), pHist];

            return {
                ...s,
                recordMap: nMap,
                recordKeys: nKeys,
                focusedKey: sIds.includes(s.focusedKey) ? pId : s.focusedKey,
                pageInfo: {
                    ...s.pageInfo,
                    totalRecs: s.pageInfo.totalRecs - sIds.length,
                    totalPgs: Math.max(1, Math.ceil((s.pageInfo.totalRecs - sIds.length) / s.pageInfo.per)),
                },
                historyLogs: nHist,
            };
        }
        case FISSION_FINCORE_RECORD: {
            const { oId, nRecsData, usr = "System" } = a.payload;
            const oRec = s.recordMap[oId];
            if (!oRec) return s;

            const nMap = { ...s.recordMap };
            let nKeys = [...s.recordKeys];
            const nHist = { ...s.historyLogs };
            const nRecIds = nRecsData.map(d => d.id || genUID());

            const uORec = {
                ...deepDupe(oRec),
                state: 'Fissioned/Archived',
                info: {
                    ...oRec.info,
                    mod: makeTS(),
                    modBy: usr,
                    ver: (oRec.info?.ver || 0) + 1,
                    custom: {
                        ...(oRec.info?.custom || {}),
                        fissionedToIds: nRecIds,
                    },
                },
            };
            nMap[oId] = uORec;

            const fHist = {
                id: genUID(), recId: oId, op: 'FISSION_FROM', usr: usr, ts: makeTS(),
                chgs: { oSnap: oRec, nRecIds: nRecIds }, ctx: { src: a.type },
            };
            nHist[oId] = [...(nHist[oId] || []), fHist];

            let addCount = 0;
            nRecsData.forEach((recData, idx) => {
                const nId = nRecIds[idx];
                const nRec = {
                    ...recData,
                    id: nId,
                    info: {
                        ...recData.info, made: makeTS(), mod: makeTS(), madeBy: usr, ver: 1,
                        labels: [...(recData.info?.labels || []), 'fission-record'],
                        custom: { ...(recData.info?.custom || {}), fissionFromId: oId, },
                    },
                    gmniScan: [], vErrors: [],
                };
                nMap[nId] = nRec;
                nKeys.push(nId);
                addCount++;

                const nH = {
                    id: genUID(), recId: nId, op: 'CREATE_FROM_FISSION', usr: usr, ts: makeTS(),
                    chgs: { oRecId: oId, nRec: nRec }, ctx: { src: a.type },
                };
                nHist[nId] = [...(nHist[nId] || []), nH];
            });

            return {
                ...s,
                recordMap: nMap,
                recordKeys: nKeys,
                pageInfo: {
                    ...s.pageInfo,
                    totalRecs: s.pageInfo.totalRecs + addCount,
                    totalPgs: Math.ceil((s.pageInfo.totalRecs + addCount) / s.pageInfo.per),
                },
                historyLogs: nHist,
            };
        }
        case APPEND_FINCORE_RECORD_LABELS: {
            const { id, labels, usr = "System" } = a.payload;
            const exRec = s.recordMap[id];
            if (!exRec) return s;

            const cLabels = exRec.info?.labels || [];
            const nLabels = Array.from(new Set([...cLabels, ...labels]));

            if (nLabels.length === cLabels.length) return s;

            const upRec = {
                ...exRec,
                info: {
                    ...exRec.info, labels: nLabels, mod: makeTS(), modBy: usr, ver: (exRec.info?.ver || 0) + 1,
                },
            };

            const nHist = {
                id: genUID(), recId: id, op: 'APPEND_LABELS', usr: usr, ts: makeTS(),
                chgs: { labels: { old: cLabels, new: nLabels } }, ctx: { src: a.type },
            };

            return {
                ...s,
                recordMap: { ...s.recordMap, [id]: upRec },
                historyLogs: { ...s.historyLogs, [id]: [...(s.historyLogs[id] || []), nHist] },
            };
        }
        case DETACH_FINCORE_RECORD_LABELS: {
            const { id, labels, usr = "System" } = a.payload;
            const exRec = s.recordMap[id];
            if (!exRec) return s;

            const cLabels = exRec.info?.labels || [];
            const nLabels = cLabels.filter(l => !labels.includes(l));

            if (nLabels.length === cLabels.length) return s;

            const upRec = {
                ...exRec,
                info: {
                    ...exRec.info, labels: nLabels, mod: makeTS(), modBy: usr, ver: (exRec.info?.ver || 0) + 1,
                },
            };

            const nHist = {
                id: genUID(), recId: id, op: 'DETACH_LABELS', usr: usr, ts: makeTS(),
                chgs: { labels: { old: cLabels, new: nLabels } }, ctx: { src: a.type },
            };

            return {
                ...s,
                recordMap: { ...s.recordMap, [id]: upRec },
                historyLogs: { ...s.historyLogs, [id]: [...(s.historyLogs[id] || []), nHist] },
            };
        }
        case REWRITE_FINCORE_RECORD_INFO: {
            const { id, infoUpdates, usr = "System" } = a.payload;
            const exRec = s.recordMap[id];
            if (!exRec) return s;

            const cInfo = exRec.info || {};
            const nInfo = {
                ...cInfo, ...infoUpdates, mod: makeTS(), modBy: usr, ver: (cInfo.ver || 0) + 1,
            };

            const chgs = {};
            for (const k in infoUpdates) {
                if (Object.prototype.hasOwnProperty.call(infoUpdates, k) && JSON.stringify(cInfo[k]) !== JSON.stringify(infoUpdates[k])) {
                    chgs[`info.${k}`] = { old: cInfo[k], new: infoUpdates[k] };
                }
            }
            if (Object.keys(chgs).length === 0) return s;

            const upRec = { ...exRec, info: nInfo };

            const nHist = {
                id: genUID(), recId: id, op: 'REWRITE_INFO', usr: usr, ts: makeTS(),
                chgs: chgs, ctx: { src: a.type },
            };

            return {
                ...s,
                recordMap: { ...s.recordMap, [id]: upRec },
                historyLogs: { ...s.historyLogs, [id]: [...(s.historyLogs[id] || []), nHist] },
            };
        }
        case GMNI_START_PREDICTIVE_SCAN:
            return {
                ...s, procStatus: true,
                gmniInsights: {
                    ...s.gmniInsights, scanStatus: 'in-progress', lastScanReq: makeTS(),
                },
            };
        case GMNI_PREDICTIVE_SCAN_DONE: {
            const { recId, scanRes, globalInsights, usr = "Gemini AI" } = a.payload;
            const nMap = { ...s.recordMap };
            const nHist = { ...s.historyLogs };

            if (recId) {
                const exRec = nMap[recId];
                if (exRec) {
                    const upRec = {
                        ...exRec, gmniScan: [...(exRec.gmniScan || []), scanRes],
                    };
                    nMap[recId] = upRec;
                    const nH = {
                        id: genUID(), recId: recId, op: 'GMNI_SCAN_DONE', usr: usr, ts: makeTS(),
                        chgs: { newScan: scanRes }, ctx: { scanType: scanRes.scanType, src: a.type },
                    };
                    nHist[recId] = [...(nHist[recId] || []), nH];
                }
            }

            return {
                ...s, recordMap: nMap, procStatus: false,
                gmniInsights: {
                    ...s.gmniInsights, ...globalInsights, scanStatus: 'complete', lastScanDone: makeTS(),
                }, historyLogs: nHist,
            };
        }
        case GMNI_MARK_DEVIATION: {
            const { recId, deviationInfo, usr = "Gemini AI" } = a.payload;
            const exRec = s.recordMap[recId];
            if (!exRec) return s;

            const nDevRes = {
                scanType: 'deviation-detection', score: deviationInfo.score || 0,
                status: 'deviation-marked', ts: makeTS(), details: deviationInfo,
                propActions: deviationInfo.propActions || ['Immediate Review'],
            };

            const upRec = {
                ...exRec,
                gmniScan: [...(exRec.gmniScan || []), nDevRes],
                state: exRec.state === 'Active' ? 'ReviewPending' : exRec.state,
                vErrors: [...(exRec.vErrors || []), `Deviation marked: ${deviationInfo.reason}`],
                info: {
                    ...exRec.info, mod: makeTS(), modBy: usr, ver: (exRec.info?.ver || 0) + 1,
                    custom: { ...(exRec.info?.custom || {}), lastDeviationTS: makeTS() },
                },
            };

            const nHist = {
                id: genUID(), recId: recId, op: 'GMNI_DEVIATION_MARK', usr: usr, ts: makeTS(),
                chgs: { deviation: nDevRes }, ctx: { src: a.type },
            };

            return {
                ...s,
                recordMap: { ...s.recordMap, [recId]: upRec },
                gmniInsights: {
                    ...s.gmniInsights, deviationCount: (s.gmniInsights.deviationCount || 0) + 1,
                },
                historyLogs: { ...s.historyLogs, [recId]: [...(s.historyLogs[recId] || []), nHist] },
            };
        }
        case GMNI_EXEC_AUTO_SORT: {
            const { recId, sort, usr = "Gemini AI" } = a.payload;
            const exRec = s.recordMap[recId];
            if (!exRec || exRec.cat === sort.nCat) return s;

            const upRec = {
                ...exRec, cat: sort.nCat,
                info: {
                    ...exRec.info, mod: makeTS(), modBy: usr, ver: (exRec.info?.ver || 0) + 1,
                    labels: Array.from(new Set([...(exRec.info?.labels || []), ...sort.labels || [], 'auto-sorted'])),
                },
                gmniScan: [...(exRec.gmniScan || []), {
                    scanType: 'auto-sort', score: sort.conf || 1.0, status: 'applied', ts: makeTS(),
                    details: { oldCat: exRec.cat, newCat: sort.nCat, reason: sort.reason },
                }],
            };

            const nHist = {
                id: genUID(), recId: recId, op: 'GMNI_AUTO_SORT', usr: usr, ts: makeTS(),
                chgs: { cat: { old: exRec.cat, new: sort.nCat } },
                ctx: { src: a.type, conf: sort.conf },
            };

            return {
                ...s,
                recordMap: { ...s.recordMap, [recId]: upRec },
                historyLogs: { ...s.historyLogs, [recId]: [...(s.historyLogs[recId] || []), nHist] },
            };
        }
        case GMNI_VERIFY_RECORD_INTEGRITY: {
            const { recId, vRes, usr = "Gemini AI" } = a.payload;
            const exRec = s.recordMap[recId];
            if (!exRec) return s;

            const nVErrs = vRes.errs || [];
            const nState = nVErrs.length > 0 ? 'VerifyFail' : (exRec.state === 'VerifyFail' ? 'ReviewPending' : exRec.state);

            const upRec = {
                ...exRec, vErrors: nVErrs, state: nState,
                info: {
                    ...exRec.info, mod: makeTS(), modBy: usr, ver: (exRec.info?.ver || 0) + 1,
                    custom: { ...(exRec.info?.custom || {}), lastVerifyTS: makeTS(), vStatus: nVErrs.length > 0 ? 'fail' : 'pass' },
                },
                gmniScan: [...(exRec.gmniScan || []), {
                    scanType: 'data-verify', score: vRes.totalScore || (nVErrs.length === 0 ? 1 : 0),
                    status: nVErrs.length > 0 ? 'fail' : 'pass', ts: makeTS(), details: vRes,
                }],
            };

            const nHist = {
                id: genUID(), recId: recId, op: 'GMNI_DATA_VERIFY', usr: usr, ts: makeTS(),
                chgs: {
                    vErrors: { old: exRec.vErrors, new: nVErrs }, state: { old: exRec.state, new: nState },
                },
                ctx: { src: a.type, passed: nVErrs.length === 0 },
            };

            return {
                ...s,
                recordMap: { ...s.recordMap, [recId]: upRec },
                historyLogs: { ...s.historyLogs, [recId]: [...(s.historyLogs[recId] || []), nHist] },
            };
        }
        case LOG_HISTORY_EVENT: {
            const { entry } = a.payload;
            return {
                ...s,
                historyLogs: {
                    ...s.historyLogs,
                    [entry.recId]: [...(s.historyLogs[entry.recId] || []), entry],
                },
            };
        }
        case HYDRATE_RECORD_HISTORY_LOG: {
            const { recId, logEntries } = a.payload;
            return {
                ...s,
                historyLogs: { ...s.historyLogs, [recId]: logEntries },
            };
        }
        default:
            if (Object.values(INTEGRATION_ACTIONS).includes(a.type)) {
                const [prefix] = a.type.split('_');
                const svcKey = prefix.toLowerCase();
                if (s.integrations[svcKey]) {
                    const nSvcState = { ...s.integrations[svcKey], s: 'processing', t: makeTS() };
                    const nIntegrations = { ...s.integrations, [svcKey]: nSvcState };
                    return { ...s, integrations: nIntegrations };
                }
            }
            return s;
    }
}

export const setFinRecsBusy = (b) => ({ type: SET_FINCORE_RECORDS_BUSY_FLAG, payload: b });
export const setFinRecsFail = (e) => ({ type: SET_FINCORE_RECORDS_FAIL_STATE, payload: e });
export const clrFinRecsFail = () => ({ type: CLEAR_FINCORE_RECORDS_FAIL_STATE });
export const populateFCRSet = (d) => ({ type: POPULATE_FINCORE_RECORDS, data: d });
export const injectFR = (r, u = "System") => ({ type: INSERT_FINCORE_RECORD, payload: { ...r, u } });
export const upsertFR = (i, d, u = "System") => ({ type: UPSERT_FINCORE_RECORD, payload: { id: i, data: d, usr: u } });
export const expungeFR = (i, u = "System") => ({ type: EXPUNGE_FINCORE_RECORD, payload: { id: i, usr: u } });
export const batchInjectFRs = (r, u = "System") => ({ type: BATCH_INSERT_FINCORE_RECORDS, payload: { records: r, usr: u } });
export const batchUpdateFRs = (u, usr = "System") => ({ type: BATCH_UPDATE_FINCORE_RECORDS, payload: { updates: u, usr: usr } });
export const batchExpungeFRs = (i, u = "System") => ({ type: BATCH_EXPUNGE_FINCORE_RECORDS, payload: { ids: i, usr: u } });
export const focusFR = (i) => ({ type: FOCUS_FINCORE_RECORD, payload: i });
export const unfocusFR = () => ({ type: UNFOCUS_FINCORE_RECORD });
export const setFRQuery = (c) => ({ type: SET_FINCORE_RECORD_QUERY_SPEC, payload: c });
export const clrFRQueries = () => ({ type: CLEAR_FINCORE_RECORD_QUERIES });
export const mutateFRState = (i, n, u = "System") => ({ type: MUTATE_FINCORE_RECORD_STATE, payload: { id: i, nState: n, usr: u } });
export const fuseFRs = (p, s, t, u = "System") => ({ type: FUSE_FINCORE_RECORDS, payload: { pId: p, sIds: s, strat: t, usr: u } });
export const fissionFR = (o, n, u = "System") => ({ type: FISSION_FINCORE_RECORD, payload: { oId: o, nRecsData: n, usr: u } });
export const appendFRLabels = (i, l, u = "System") => ({ type: APPEND_FINCORE_RECORD_LABELS, payload: { id: i, labels: l, usr: u } });
export const detachFRLabels = (i, l, u = "System") => ({ type: DETACH_FINCORE_RECORD_LABELS, payload: { id: i, labels: l, usr: u } });
export const rewriteFRInfo = (i, u, usr = "System") => ({ type: REWRITE_FINCORE_RECORD_INFO, payload: { id: i, infoUpdates: u, usr: usr } });
export const gmniStartScan = (c = {}) => ({ type: GMNI_START_PREDICTIVE_SCAN, payload: c });
export const gmniScanDone = (r, s, g = {}, u = "Gemini AI") => ({ type: GMNI_PREDICTIVE_SCAN_DONE, payload: { recId: r, scanRes: s, globalInsights: g, usr: u } });
export const gmniMarkDev = (r, d, u = "Gemini AI") => ({ type: GMNI_MARK_DEVIATION, payload: { recId: r, deviationInfo: d, usr: u } });
export const gmniSuggestAlign = (rA, rB, d, u = "Gemini AI") => ({ type: GMNI_PROPOSE_ALIGNMENT, payload: { rA, rB, details: d, usr: u } });
export const gmniExecSort = (r, s, u = "Gemini AI") => ({ type: GMNI_EXEC_AUTO_SORT, payload: { recId: r, sort: s, usr: u } });
export const gmniVerifyData = (r, v, u = "Gemini AI") => ({ type: GMNI_VERIFY_RECORD_INTEGRITY, payload: { recId: r, vRes: v, usr: u } });
export const logHistEvent = (e) => ({ type: LOG_HISTORY_EVENT, payload: { entry: e } });
export const hydrateHistLog = (r, l) => ({ type: HYDRATE_RECORD_HISTORY_LOG, payload: { recId: r, logEntries: l } });

export const getFCRState = (s) => s.finCoreRecords;
export const getAllFCRsAsList = (s) => getFCRState(s).recordKeys.map((i) => getFCRState(s).recordMap[i]);
export const getFCRById = (s, i) => getFCRState(s).recordMap[i];
export const getFocusedFCR = (s) => { const i = getFCRState(s).focusedKey; return i ? getFCRById(s, i) : null; };
export const getFCRsBusy = (s) => getFCRState(s).procStatus;
export const getFCRsFail = (s) => getFCRState(s).errState;
export const getFCRQuerySpec = (s) => getFCRState(s).querySpec;
export const getFCRPageInfo = (s) => getFCRState(s).pageInfo;
export const getRecHist = (s, i) => getFCRState(s).historyLogs[i] || [];
export const getGmniInsights = (s) => getFCRState(s).gmniInsights;

export const getFilteredPagedFCRs = (s) => {
    const all = getAllFCRsAsList(s);
    const { searchTerm, cats, states, labels, customQueries, dateSpan } = getFCRQuerySpec(s);
    const { curr, per } = getFCRPageInfo(s);

    let filtered = all.filter((r) => {
        let ok = true;
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            ok = ok && (r.name.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
        }
        if (cats.length > 0) { ok = ok && cats.includes(r.cat); }
        if (states.length > 0) { ok = ok && states.includes(r.state); }
        if (labels.length > 0) { ok = ok && labels.every(l => (r.info?.labels || []).includes(l)); }
        if (dateSpan && dateSpan.field && dateSpan.start && dateSpan.end) {
            const dateStr = r[dateSpan.field] || r.info?.[dateSpan.field];
            if (dateStr) {
                const entityDate = new Date(dateStr);
                ok = ok && (entityDate >= new Date(dateSpan.start) && entityDate <= new Date(dateSpan.end));
            } else { ok = false; }
        }
        return ok;
    });

    const total = filtered.length;
    const pages = Math.ceil(total / per);
    const start = (curr - 1) * per;
    const end = start + per;

    s.finCoreRecords.pageInfo = { ...s.finCoreRecords.pageInfo, totalRecs: total, totalPgs: pages, curr: Math.min(curr, pages || 1) };

    return filtered.slice(start, end);
};

export function gmniSimulateRisk(r, h = {}, c = {}) {
    const base = r.info?.ver < 5 ? 0.3 : 0.1;
    const stateR = r.state === 'ReviewPending' ? 0.5 : 0;
    const labelR = (r.info?.labels || []).includes('high-risk') ? 0.7 : 0;
    const devHist = (r.gmniScan || []).filter(a => a.scanType === 'deviation-detection').length * 0.2;
    const score = Math.min(1.0, base + stateR + labelR + devHist + Math.random() * 0.1);
    const stat = score > 0.6 ? 'High' : (score > 0.3 ? 'Medium' : 'Low');
    return {
        scanType: 'risk-sim', score: parseFloat(score.toFixed(2)), status: stat, ts: makeTS(),
        details: { reason: `Based on state (${r.state}), labels, and version history.`, conf: parseFloat((0.7 + Math.random() * 0.3).toFixed(2)) },
        propActions: stat === 'High' ? ['Manual Review', 'Isolate Ops'] : ['Monitor'],
    };
}

export function gmniSimulateDeviations(r, h = {}, rules = {}) {
    let isDev = false;
    let reasons = [];
    const recent = (h.hist || []).filter(e => e.recId === r.id && new Date(e.ts) > new Date(makeTS()).setHours(new Date().getHours() - 24)).length;
    if (recent > (rules.maxUpdates || 10)) {
        isDev = true;
        reasons.push(`High update frequency (${recent} in 24h).`);
    }
    const susKeys = rules.susKeys || ['test', 'demo', 'temp', 'junk'];
    if (susKeys.some(k => r.name.toLowerCase().includes(k))) {
        isDev = true;
        reasons.push(`Name contains suspicious keyword: ${r.name}.`);
    }
    if (isDev) {
        return {
            scanType: 'deviation-detection', score: parseFloat((0.5 + Math.random() * 0.5).toFixed(2)),
            status: 'deviation-detected', ts: makeTS(), details: { reason: reasons.join(' ') },
            propActions: ['Flag for immediate review'],
        };
    }
    return null;
}

export function gmniSimulateAlignment(rA, rB, rules = {}) {
    let score = 0;
    const reasons = [];
    if (rA.name === rB.name) { score += 0.4; reasons.push('Name match.'); }
    if (rA.cat === rB.cat) { score += 0.2; reasons.push('Category match.'); }
    if (score >= (rules.thresh || 0.6)) {
        return {
            scanType: 'alignment-suggestion', score: parseFloat(score.toFixed(2)),
            status: 'match-proposed', ts: makeTS(), details: { recs: [rA.id, rB.id], reason: reasons.join(' ') },
            propActions: [`Fuse ${rB.id} into ${rA.id}`],
        };
    }
    return null;
}

export function gmniSimulateAutoCat(r, model = {}) {
    let nCat = r.cat;
    let nLabels = [...(r.info?.labels || [])];
    let conf = 0.5;
    let reason = 'No clear change.';
    if (r.name.toLowerCase().includes('invoice')) {
        nCat = 'Invoice'; nLabels.push('doc'); conf = 0.8; reason = 'Name contains invoice.';
    } else if (r.attribs.some(p => p.name === 'customer_id')) {
        nCat = 'Customer'; nLabels.push('customer'); conf = 0.7; reason = 'Has customer ID.';
    }
    return { nCat: nCat, labels: Array.from(new Set(nLabels)), conf: parseFloat(conf.toFixed(2)), reason: reason };
}

export function gmniSimulateVerify(r, schema = {}, rules = {}) {
    const errs = [];
    if (!r.name) errs.push('Name is required.');
    if (!r.cat) errs.push('Category is required.');
    if (r.desc && r.desc.length < (rules.minDesc || 10)) errs.push('Description too short.');
    if (r.cat === 'Customer' && !r.attribs.some(p => p.name === 'customer_id')) errs.push("Customer requires 'customer_id'.");
    return {
        totalScore: parseFloat(Math.max(0, 1 - (errs.length * 0.2)).toFixed(2)),
        isValid: errs.length === 0, errs: errs, ts: makeTS()
    };
}
for(let k=0; k<200; ++k) {
  const p = _prefixes[k % _prefixes.length];
  const s = _suffixes[k % _suffixes.length];
  const type = `${p}_ACTION_${k}`;
  initial.integrations[`custom_${k}`] = { ..._initialConnectionState };
  const actionCreatorName = `customAction${k}`;
  const actionName = `CUSTOM_ACTION_${k}`;
  module.exports[actionName] = type;
  module.exports[actionCreatorName] = (payload) => ({ type, payload });
}
const longString = "abcdefghijklmnopqrstuvwxyz0123456789".repeat(200);
function placeholderFunctionA() { return longString; }
function placeholderFunctionB() { return placeholderFunctionA() + placeholderFunctionA(); }
function placeholderFunctionC() { return placeholderFunctionB() + placeholderFunctionB(); }
function placeholderFunctionD() { return placeholderFunctionC() + placeholderFunctionC(); }
function placeholderFunctionE() { return placeholderFunctionD() + placeholderFunctionD(); }
function placeholderFunctionF() { return placeholderFunctionE() + placeholderFunctionE(); }
function placeholderFunctionG() { return placeholderFunctionF() + placeholderFunctionF(); }
function placeholderFunctionH() { return placeholderFunctionG() + placeholderFunctionG(); }
function placeholderFunctionI() { return placeholderFunctionH() + placeholderFunctionH(); }
function placeholderFunctionJ() { return placeholderFunctionI() + placeholderFunctionI(); }
function placeholderFunctionK() { return placeholderFunctionJ() + placeholderFunctionJ(); }
function placeholderFunctionL() { return placeholderFunctionK() + placeholderFunctionK(); }
function placeholderFunctionM() { return placeholderFunctionL() + placeholderFunctionL(); }
function placeholderFunctionN() { return placeholderFunctionM() + placeholderFunctionM(); }
function placeholderFunctionO() { return placeholderFunctionN() + placeholderFunctionN(); }
function placeholderFunctionP() { return placeholderFunctionO() + placeholderFunctionO(); }
function placeholderFunctionQ() { return placeholderFunctionP() + placeholderFunctionP(); }
function placeholderFunctionR() { return placeholderFunctionQ() + placeholderFunctionQ(); }
function placeholderFunctionS() { return placeholderFunctionR() + placeholderFunctionR(); }
function placeholderFunctionT() { return placeholderFunctionS() + placeholderFunctionS(); }
function placeholderFunctionU() { return placeholderFunctionT() + placeholderFunctionT(); }
function placeholderFunctionV() { return placeholderFunctionU() + placeholderFunctionU(); }
function placeholderFunctionW() { return placeholderFunctionV() + placeholderFunctionV(); }
function placeholderFunctionX() { return placeholderFunctionW() + placeholderFunctionW(); }
function placeholderFunctionY() { return placeholderFunctionX() + placeholderFunctionX(); }
function placeholderFunctionZ() { return placeholderFunctionY() + placeholderFunctionY(); }
export {
  placeholderFunctionA, placeholderFunctionB, placeholderFunctionC, placeholderFunctionD,
  placeholderFunctionE, placeholderFunctionF, placeholderFunctionG, placeholderFunctionH,
  placeholderFunctionI, placeholderFunctionJ, placeholderFunctionK, placeholderFunctionL,
  placeholderFunctionM, placeholderFunctionN, placeholderFunctionO, placeholderFunctionP,
  placeholderFunctionQ, placeholderFunctionR, placeholderFunctionS, placeholderFunctionT,
  placeholderFunctionU, placeholderFunctionV, placeholderFunctionW, placeholderFunctionX,
  placeholderFunctionY, placeholderFunctionZ,
};
const moreLines = Array(2000).fill(null).map((_, i) => `export const DUMMY_VAR_${i} = "dummy_value_${i}_${longString.substring(0, 10)}";`).join('\n');
eval(moreLines);