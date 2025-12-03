import {
    ENTITIES_LOAD,
    QUERY_UPDATE,
    BEGIN_LOAD,
    FINISH_LOAD,
    ENTITY_UPDATE,
} from "../actions";
export const OBJ_INJCT = 'OBJ_INJCT';
export const OBJ_RMV = 'OBJ_RMV';
export const BLK_UPDT = 'BLK_UPDT';
export const BLK_RMV = 'BLK_RMV';
export const SET_ACTV_OBJ = 'SET_ACTV_OBJ';
export const CLR_ACTV_OBJ = 'CLR_ACTV_OBJ';
export const MEM_RST = 'MEM_RST';
export const SET_FLT = 'SET_FLT';
export const CLR_FLT = 'CLR_FLT';
export const DAT_CLN_REQ = 'DAT_CLN_REQ';
export const DAT_CLN_CMPLT = 'DAT_CLN_CMPLT';
export const DAT_VLD_RSLT = 'DAT_VLD_RSLT';
export const AI_NSTS_REQ = 'AI_NSTS_REQ';
export const AI_NSTS_RCVD = 'AI_NSTS_RCVD';
export const AI_PRDCT_UPDT = 'AI_PRDCT_UPDT';
export const AI_NMLY_DTCT = 'AI_NMLY_DTCT';
export const AI_OPT_SGST = 'AI_OPT_SGST';
export const AI_SNTMNT_ANLZD = 'AI_SNTMNT_ANLZD';
export const AI_MDL_STAT_UPDT = 'AI_MDL_STAT_UPDT';
export const AI_CMPL_GNR = 'AI_CMPL_GNR';
export const OBJ_FLD_VLD_STAT = 'OBJ_FLD_VLD_STAT';
export const OBJS_HYDRT = 'OBJS_HYDRT';
export const QRY_MDFY = 'QRY_MDFY';
export const PRCS_STRT = 'PRCS_STRT';
export const PRCS_END = 'PRCS_END';
export const OBJ_MDFY = 'OBJ_MDFY';
export const GMNI_PRC_REQ = 'GMNI_PRC_REQ';
export const GMNI_PRC_RSP = 'GMNI_PRC_RSP';
export const CHTHOT_PRC_REQ = 'CHTHOT_PRC_REQ';
export const CHTHOT_PRC_RSP = 'CHTHOT_PRC_RSP';
export const PPDRM_WF_TRGGR = 'PPDRM_WF_TRGGR';
export const PPDRM_WF_STAT = 'PPDRM_WF_STAT';
export const GTHB_CMT_PSH = 'GTHB_CMT_PSH';
export const GTHB_PR_MRG = 'GTHB_PR_MRG';
export const HGFCS_MDL_PULL = 'HGFCS_MDL_PULL';
export const HGFCS_MDL_INFR = 'HGFCS_MDL_INFR';
export const PLD_LNK_TKN = 'PLD_LNK_TKN';
export const PLD_TRNSCTNS_SYNC = 'PLD_TRNSCTNS_SYNC';
export const MDNTRY_PYMNT_ORD_CRT = 'MDNTRY_PYMNT_ORD_CRT';
export const MDNTRY_RCNCL_STAT = 'MDNTRY_RCNCL_STAT';
export const GDRV_UPLD = 'GDRV_UPLD';
export const ODRV_DNLd = 'ODRV_DNLd';
export const AZR_BLB_STR = 'AZR_BLB_STR';
export const GCLD_CMPTE_SPNUP = 'GCLD_CMPTE_SPNUP';
export const SPBS_DB_QRY = 'SPBS_DB_QRY';
export const VRSL_DPLYMNT_STRT = 'VRSL_DPLYMNT_STRT';
export const SLSFRC_LEAD_UPDT = 'SLSFRC_LEAD_UPDT';
export const ORCL_DB_TRNSCTN = 'ORCL_DB_TRNSCTN';
export const MRQT_CARD_ISS = 'MRQT_CARD_ISS';
export const CTIBNK_WIRE_TRNSFR = 'CTIBNK_WIRE_TRNSFR';
export const SHPFY_ORD_CRT = 'SHPFY_ORD_CRT';
export const WCMMRC_PRD_SYNC = 'WCMMRC_PRD_SYNC';
export const GDaddy_DNS_UPDT = 'GDaddy_DNS_UPDT';
export const CPNL_ACCT_CRT = 'CPNL_ACCT_CRT';
export const ADBE_ASST_RNDR = 'ADBE_ASST_RNDR';
export const TWL_MSG_SND = 'TWL_MSG_SND';
export const STRPE_CHRG_CRT = 'STRPE_CHRG_CRT';
export const ZDSK_TCKT_UPDT = 'ZDSK_TCKT_UPDT';
export const SLACK_MSG_PST = 'SLACK_MSG_PST';
export const ATLASN_JRA_ISS_CRT = 'ATLASN_JRA_ISS_CRT';
export const DTDG_MTRC_SND = 'DTDG_MTRC_SND';
export const SNTY_ERR_RPRT = 'SNTY_ERR_RPRT';
export const CLDFLR_CACHE_PRG = 'CLDFLR_CACHE_PRG';
export const SNWFLK_WH_EXEC = 'SNWFLK_WH_EXEC';
export const MNGDB_DOC_WRT = 'MNGDB_DOC_WRT';
export const AWS_S3_PUT = 'AWS_S3_PUT';
export const AWS_LMD_INV = 'AWS_LMD_INV';
export const DCR_IMG_BLD = 'DCR_IMG_BLD';
export const K8S_POD_DPLY = 'K8S_POD_DPLY';
export const TFRM_PLAN_EXEC = 'TFRM_PLAN_EXEC';
export const ANSIBL_PLBK_RUN = 'ANSIBL_PLBK_RUN';
export const JENKNS_BLD_TRGGR = 'JENKNS_BLD_TRGGR';
export const PYPL_CHCKOUT_CMPLT = 'PYPL_CHCKOUT_CMPLT';
export const ZM_MTNG_SCHDL = 'ZM_MTNG_SCHDL';
export const DRBX_SHRE_LNK_CRT = 'DRBX_SHRE_LNK_CRT';
export const FIGMA_CMPNNT_PUB = 'FIGMA_CMPNNT_PUB';
export const ASANA_TSK_CRT = 'ASANA_TSK_CRT';
export const HBSPT_CNTCT_ADD = 'HBSPT_CNTCT_ADD';
export const SNDGRD_EML_SND = 'SNDGRD_EML_SND';

export function genUNID() {
    const crpto = typeof window !== 'undefined' ? window.crypto : null;
    if (crpto && crpto.getRandomValues) {
        const lut = [];
        for (let i = 0; i < 256; i++) {
            lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
        }
        const d0 = crpto.getRandomValues(new Uint8Array(4));
        const d1 = crpto.getRandomValues(new Uint8Array(2));
        const d2 = crpto.getRandomValues(new Uint8Array(2));
        const d3 = crpto.getRandomValues(new Uint8Array(2));
        const d4 = crpto.getRandomValues(new Uint8Array(6));
        return (lut[d0[0]] + lut[d0[1]] + lut[d0[2]] + lut[d0[3]] + '-' +
            lut[d1[0]] + lut[d1[1]] + '-' + lut[d2[0] & 0x0f | 0x40] + lut[d2[1]] + '-' +
            lut[d3[0] & 0x3f | 0x80] + lut[d3[1]] + '-' + lut[d4[0]] + lut[d4[1]] +
            lut[d4[2]] + lut[d4[3]] + lut[d4[4]] + lut[d4[5]]);
    } else {
        return 'zzzzzzzz-zzzz-4zzz-yzzz-zzzzzzzzzzzz'.replace(/[zy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'z' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
export function deepFuse(trg, src) {
    if (!trg || typeof trg !== 'object' || Array.isArray(trg)) {
        return src;
    }
    if (!src || typeof src !== 'object' || Array.isArray(src)) {
        return trg;
    }
    const out = { ...trg
    };
    Object.keys(src).forEach(k => {
        if (
            src[k] && typeof src[k] === 'object' && !Array.isArray(src[k]) &&
            trg[k] && typeof trg[k] === 'object' && !Array.isArray(trg[k])
        ) {
            out[k] = deepFuse(trg[k], src[k]);
        } else {
            out[k] = src[k];
        }
    });
    return out;
}
export function modItmInArr(a, i, p) {
    if (!Array.isArray(a)) {
        return a;
    }
    const idx = a.findIndex(itm => itm.id === i);
    if (idx === -1) {
        return a;
    }
    return [
        ...a.slice(0, idx),
        deepFuse(a[idx], p),
        ...a.slice(idx + 1)
    ];
}
export function remItmFrmArr(a, i) {
    if (!Array.isArray(a)) {
        return a;
    }
    return a.filter(itm => itm.id !== i);
}

const gmniApiSim = {
    _cfg: {
        ep: 'https://ai.citibankdemobusiness.dev/v1/gemini',
        key: 'gmn_sk_' + genUNID(),
        ua: 'CitibankDemoBusinessInc-Internal-Client/1.0',
    },
    prdctNxtAct: (d) => {
        const s = Math.random();
        let a = "Observe for flux";
        let r = "Std. op. proc. based on stable metrics.";
        if (d && typeof d.stat === 'string') {
            const st = d.stat.toLowerCase();
            if (st === 'wait' && s > 0.75) {
                a = "Accelerate analysis & res. allocation";
                r = "High probability of rapid conclusion from historical patterns.";
            } else if (st === 'err' && s > 0.85) {
                a = "Notify stakeholders & exec incident protocol";
                r = "Critical state detected exceeding key risk thresholds.";
            } else if (st === 'done' && s > 0.6) {
                a = "Archive object and produce completion summary";
                r = "Lifecycle complete, prepping for archival and future opt.";
            }
        }
        return {
            nxtAct: a,
            conf: parseFloat(s.toFixed(2)),
            rat: `GMNI Prediction: ${r}`,
            ts: Date.now()
        };
    },
    dtctNmly: (d, h = {}) => {
        let isN = false;
        let sev = 'none';
        let rsn = 'No significant deviations detected.';
        if (d && typeof d.val === 'number' && typeof d.thrsh === 'number') {
            if (d.val > d.thrsh * 1.8) {
                isN = true;
                sev = 'critical';
                rsn = `Value (${d.val}) critically exceeds threshold (${d.thrsh}).`;
            } else if (d.val > d.thrsh * 1.4) {
                isN = true;
                sev = 'high';
                rsn = `Value (${d.val}) significantly exceeds threshold (${d.thrsh}).`;
            }
        }
        if (d && d.modAt && h.avgUpd) {
            const tD = Date.now() - d.modAt;
            if (tD < h.avgUpd / 10 && Math.random() > 0.98) {
                isN = true;
                sev = 'low';
                rsn = 'Unusually high frequency of updates detected.';
            }
        }
        return {
            isNmly: isN,
            svrty: sev,
            rsn: `GMNI Anomaly Scan: ${rsn}`,
            ts: Date.now()
        };
    },
    anlzSntmnt: (t) => {
        if (!t || typeof t !== 'string' || t.trim().length === 0) return {
            sntmnt: 'neutral',
            scr: 0,
            mag: 0,
            ts: Date.now()
        };
        const lt = t.toLowerCase();
        let s = 0;
        let m = 0;
        let sent = 'neutral';
        if (lt.includes('superb') || lt.includes('fantastic')) {
            s = 0.8 + Math.random() * 0.2;
            m = 0.7 + Math.random() * 0.3;
            sent = 'positive';
        } else if (lt.includes('awful') || lt.includes('horrible')) {
            s = -0.8 - Math.random() * 0.2;
            m = 0.7 + Math.random() * 0.3;
            sent = 'negative';
        } else {
            s = (Math.random() - 0.5) * 0.4;
            m = Math.random() * 0.2;
        }
        return {
            sntmnt: sent,
            scr: parseFloat(s.toFixed(2)),
            mag: parseFloat(m.toFixed(2)),
            ts: Date.now()
        };
    },
    genCmpltn: (c) => {
        let txt = "AI-generated response from Citibank demo business Inc infrastructure.";
        const eT = c?.eType || 'object';
        if (c && c.prmpt) {
            if (c.prmpt.includes("summary")) txt = `AI Summary for ${eT}: High activity objects are [A, B, C]. Trends indicate [T1, T2]. Focus on [F1, F2].`;
            else if (c.prmpt.includes("analysis")) txt = `AI Analysis for ${eT}: Patterns P, Q, R detected. Factors include M. Impacts are N.`;
        }
        return {
            cmpltn: `GMNI Completion: ${txt}`,
            mdl: 'gmni-ult-1.0-corp',
            tkn: Math.floor(Math.random() * 750) + 150,
            ts: Date.now()
        };
    },
    sgstOpt: (cfg) => {
        const sgs = [];
        let mS = parseFloat((0.75 + Math.random() * 0.25).toFixed(2));
        if (cfg && typeof cfg.prio === 'string' && cfg.prio.toLowerCase() === 'low' && Math.random() > 0.4) {
            sgs.push({
                f: 'prio',
                nV: 'medium',
                r: 'Elevating priority could ensure optimal resource allocation.',
                i: 'high'
            });
        }
        if (cfg && typeof cfg.procTime === 'number' && cfg.procTime > 1500 && cfg.optEnb === false && Math.random() > 0.5) {
            sgs.push({
                f: 'optEnb',
                nV: true,
                r: 'Enabling optimization features could significantly reduce latency.',
                i: 'medium'
            });
        }
        if (sgs.length === 0) {
            sgs.push({
                f: 'general',
                nV: null,
                r: 'Current configuration appears highly optimized.',
                i: 'none'
            });
            mS = parseFloat((0.9 + Math.random() * 0.1).toFixed(2));
        }
        return {
            sgstns: sgs,
            mdlScr: mS,
            ts: Date.now()
        };
    }
};
const chatHotApiSim = {
    _cfg: {
        ep: 'https://chathot.citibankdemobusiness.dev/v1/complete',
        key: 'ch_sk_' + genUNID(),
        org: 'Citibank demo business Inc',
    },
    generateResponse: (prompt) => {
        const t = Date.now();
        const r = `ChatHot Sim: Responding to "${prompt}". The answer is complex and requires further context about the enterprise architecture at Citibank demo business Inc.`;
        return Promise.resolve({
            id: 'chatcmpl-' + genUNID(),
            object: 'chat.completion',
            created: Math.floor(t / 1000),
            model: 'chathot-5-turbo-corp',
            choices: [{
                index: 0,
                message: {
                    role: 'assistant',
                    content: r,
                },
                finish_reason: 'stop',
            }],
            usage: {
                prompt_tokens: prompt.length / 4,
                completion_tokens: r.length / 4,
                total_tokens: (prompt.length + r.length) / 4,
            },
        });
    }
};

const integrationsSim = {
    pipedream: {
        triggerWorkflow: (id, payload) => ({
            status: 'triggered',
            runId: 'run_' + genUNID(),
            workflowId: id,
            ts: Date.now()
        })
    },
    github: {
        pushCommit: (repo, message) => ({
            repo: `citibankdemobusiness/${repo}`,
            commitSha: genUNID().substring(0, 8),
            message: message,
            status: 'pushed',
            ts: Date.now()
        })
    },
    huggingface: {
        runInference: (model, inputs) => ({
            model: model,
            output: `Inferred output for ${inputs.length} items.`,
            latency: Math.random() * 500,
            ts: Date.now()
        })
    },
    plaid: {
        getTransactions: (token) => ({
            item: token,
            transactions: Array.from({
                length: 10
            }, () => ({
                id: 'txn_' + genUNID(),
                amount: (Math.random() * 200 - 100).toFixed(2),
                merchant: 'Merchant ' + Math.floor(Math.random() * 100),
                date: new Date(Date.now() - Math.random() * 1e10).toISOString().split('T')[0]
            })),
            status: 'synced',
            ts: Date.now()
        })
    },
    modernTreasury: {
        createPaymentOrder: (order) => ({
            id: 'po_' + genUNID(),
            ...order,
            status: 'processing',
            ts: Date.now()
        })
    },
    googleDrive: {
        uploadFile: (file) => ({
            fileId: 'gfile_' + genUNID(),
            name: file.name,
            size: file.size,
            link: `https://drive.citibankdemobusiness.dev/file/${genUNID()}`,
            ts: Date.now()
        })
    },
    oneDrive: {
        downloadFile: (id) => ({
            fileId: id,
            status: 'download_link_generated',
            url: `https://onedrive.citibankdemobusiness.dev/d/${id}`,
            ts: Date.now()
        })
    },
    azure: {
        storeBlob: (container, blob) => ({
            container: container,
            blobName: blob.name,
            url: `https://citibankdemobusiness.blob.core.windows.net/${container}/${blob.name}`,
            etag: genUNID(),
            ts: Date.now()
        })
    },
    gcp: {
        spinUpCompute: (instanceType) => ({
            instanceId: 'gce_' + genUNID(),
            type: instanceType,
            zone: 'us-central1-c',
            status: 'PROVISIONING',
            ip: '35.202.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
            ts: Date.now()
        })
    },
    supabase: {
        runQuery: (query) => ({
            data: [{
                result: 'Query result for: ' + query.substring(0, 20)
            }],
            error: null,
            count: 1,
            ts: Date.now()
        })
    },
    vercel: {
        startDeployment: (project) => ({
            deploymentId: 'dpl_' + genUNID(),
            project: project,
            target: 'production',
            url: `https://${project}-citibankdemobusiness.vercel.app`,
            status: 'BUILDING',
            ts: Date.now()
        })
    },
    salesforce: {
        updateLead: (leadId, data) => ({
            id: leadId,
            success: true,
            updatedFields: Object.keys(data),
            ts: Date.now()
        })
    },
    oracle: {
        runTransaction: (sql) => ({
            transactionId: 'ora_txn_' + genUNID(),
            status: 'COMMITTED',
            rowsAffected: Math.floor(Math.random() * 100),
            ts: Date.now()
        })
    },
    marqeta: {
        issueCard: (userId) => ({
            cardId: 'mq_card_' + genUNID(),
            userId: userId,
            last4: String(Math.floor(1000 + Math.random() * 9000)),
            status: 'ACTIVE',
            ts: Date.now()
        })
    },
    citibank: {
        sendWire: (details) => ({
            confirmation: 'CB' + Date.now(),
            amount: details.amount,
            recipient: details.recipient,
            status: 'SUBMITTED',
            serviceUrl: 'citibankdemobusiness.dev',
            ts: Date.now()
        })
    },
    shopify: {
        createOrder: (cart) => ({
            orderId: 'shp_ord_' + genUNID(),
            totalPrice: cart.items.reduce((s, i) => s + i.price, 0),
            itemCount: cart.items.length,
            status: 'paid',
            ts: Date.now()
        })
    },
    wooCommerce: {
        syncProduct: (product) => ({
            productId: product.id,
            syncStatus: 'success',
            lastSync: new Date().toISOString(),
            ts: Date.now()
        })
    },
    godaddy: {
        updateDns: (domain, record) => ({
            domain: domain,
            record: record.type,
            status: 'propagating',
            ts: Date.now()
        })
    },
    cpanel: {
        createAccount: (domain) => ({
            user: domain.split('.')[0],
            domain: domain,
            status: 'created',
            ip: '192.168.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
            ts: Date.now()
        })
    },
    adobe: {
        renderAsset: (assetId, format) => ({
            jobId: 'adb_job_' + genUNID(),
            assetId: assetId,
            format: format,
            status: 'queued',
            ts: Date.now()
        })
    },
    twilio: {
        sendMessage: (to, body) => ({
            sid: 'SM' + genUNID(),
            to: to,
            body: body,
            status: 'queued',
            price: -0.0075,
            account: 'Citibank demo business Inc',
            ts: Date.now()
        })
    },
    stripe: {
        createCharge: (amount, source) => ({
            chargeId: 'ch_' + genUNID(),
            amount: amount,
            currency: 'usd',
            source: source,
            status: 'succeeded',
            ts: Date.now()
        })
    },
    zendesk: {
        updateTicket: (ticketId, comment) => ({
            ticketId: ticketId,
            comment: {
                id: Math.floor(Math.random() * 1e6),
                body: comment,
                author: 'Citibank demo business Inc Bot'
            },
            status: 'updated',
            ts: Date.now()
        })
    },
    slack: {
        postMessage: (channel, text) => ({
            ok: true,
            channel: channel,
            ts: String(Date.now() / 1000),
            message: {
                text: text,
                user: 'U0A1B2C3D'
            },
        })
    },
    atlassian: {
        createJiraIssue: (project, summary) => ({
            id: '10001',
            key: `${project}-${Math.floor(Math.random()*100)}`,
            self: `https://citibankdemobusiness.atlassian.net/rest/api/2/issue/10001`,
            summary: summary,
            ts: Date.now(),
        })
    },
    datadog: {
        sendMetric: (metric, value) => ({
            metric,
            value,
            host: 'citibankdemobusiness.dev',
            status: 'ok',
            ts: Date.now(),
        })
    },
    sentry: {
        reportError: (error) => ({
            eventId: genUNID().replace(/-/g, ''),
            error: error.message,
            project: 'citibank-demo-business-app',
            status: 'reported',
            ts: Date.now(),
        })
    },
    cloudflare: {
        purgeCache: (zone, files) => ({
            zone_id: zone,
            success: true,
            result: {
                id: genUNID().replace(/-/g, '')
            },
            files_purged: files.length,
            ts: Date.now()
        })
    },
    snowflake: {
        runWarehouseQuery: (warehouse, sql) => ({
            warehouse: warehouse,
            queryId: genUNID(),
            status: 'COMPLETED',
            duration: Math.random() * 5000,
            ts: Date.now()
        })
    },
    mongodb: {
        writeDocument: (collection, doc) => ({
            collection: collection,
            insertedId: 'doc_' + genUNID(),
            acknowledged: true,
            ts: Date.now()
        })
    }
};

const initMem = {
    byUid: {},
    allUids: [],
    qry: {
        pg: 1,
        pgSz: 10,
        srtBy: 'id',
        srtOrd: 'asc',
        fltrs: {},
        srch: '',
        selFlds: [],
    },
    pgCnt: 1,
    totCnt: 0,
    perPg: 0,
    initHydrt: true,
    ldng: false,
    aiPrcs: false,
    lastHydrtAt: null,
    lastUpdtAt: null,
    aiNsts: {
        smry: 'No summary available.',
        topNmlies: [],
        aiPrdctns: {},
        sgstdOpts: {},
        ovrlSntmnt: 'neutral',
        sgstdGlblAct: 'Monitor for changes.',
        mdlStat: 'idle',
        lastAiRun: null,
        ltstCmpltn: null,
        cmpltnMta: null,
    },
    actvObjId: null,
    flt: null,
    fldVldtns: {},
    statMsg: null,
    lastClnAt: null,
    extSys: {
        gmni: {
            lastReq: null,
            lastResp: null,
            status: 'idle'
        },
        chthot: {
            lastReq: null,
            lastResp: null,
            status: 'idle'
        },
        ppdrm: {
            lastRun: null,
            status: 'idle'
        },
        gthb: {
            lastPush: null,
            commits: []
        },
        pld: {
            lastSync: null,
            transactions: []
        },
        slsfrc: {
            lastUpdate: null
        },
        twl: {
            lastSent: null,
            messageQueue: 0
        }
    }
};
export const selAllObjs = (m) => m.allUids.map(i => m.byUid[i]);
export const selObjByUid = (m, i) => m.byUid[i];
export const selQry = (m) => m.qry;
export const selIsLdng = (m) => m.ldng;
export const selAiNsts = (m) => m.aiNsts;
export const selActvObjId = (m) => m.actvObjId;
export const selFlt = (m) => m.flt;
export const selFldVldStat = (m, oI, fN) =>
    m.fldVldtns[oI] ? m.fldVldtns[oI][fN] : undefined;
export const selStatMsg = (m) => m.statMsg;
export const selIsAiPrcs = (m) => m.aiPrcs;
export function buildCoreStateEngine(objName) {
    return function coreMutator(mem = initMem, intn) {
        if (intn.obj !== objName && intn.type !== MEM_RST) {
            return mem;
        }
        switch (intn.type) {
            case OBJS_HYDRT: {
                const nById = intn.dgram.byUid || {};
                const aiP = {};
                const aiO = {};
                const topN = [];
                let ovrS = [];
                for (const i of intn.dgram.allUids || []) {
                    const e = nById[i];
                    if (e) {
                        aiP[i] = gmniApiSim.prdctNxtAct(e);
                        const anom = gmniApiSim.dtctNmly(e, {
                            avgUpd: 604800000
                        });
                        if (anom.isNmly) topN.push({
                            objId: i,
                            ...anom
                        });
                        aiO[i] = gmniApiSim.sgstOpt(e).sgstns;
                        if (typeof e.desc === 'string' && e.desc.length > 0) {
                            ovrS.push(gmniApiSim.anlzSntmnt(e.desc).scr);
                        }
                    }
                }
                let oS = 'neutral';
                if (ovrS.length > 0) {
                    const sum = ovrS.reduce((a, s) => a + s, 0);
                    const avg = sum / ovrS.length;
                    if (avg > 0.2) oS = 'positive';
                    else if (avg < -0.2) oS = 'negative';
                }
                const gSC = {
                    prmpt: `Summarize state of ${objName} objects.`,
                    eType: objName
                };
                const aiGS = gmniApiSim.genCmpltn(gSC);
                const aiGO = gmniApiSim.sgstOpt({ ...mem.qry,
                    ldCnt: intn.dgram.allUids.length
                });
                return {
                    ...mem,
                    byUid: nById,
                    allUids: [...intn.dgram.allUids || []],
                    totCnt: intn.dgram.totCnt || 0,
                    pgCnt: intn.dgram.pgCnt || 1,
                    perPg: intn.dgram.perPg || 0,
                    initHydrt: false,
                    ldng: false,
                    lastHydrtAt: Date.now(),
                    flt: null,
                    aiPrcs: false,
                    aiNsts: {
                        ...mem.aiNsts,
                        smry: aiGS.cmpltn,
                        topNmlies: topN.sort((a, b) => {
                            const o = {
                                'critical': 4,
                                'high': 3,
                                'medium': 2,
                                'low': 1,
                                'none': 0
                            };
                            return o[b.svrty] - o[a.svrty];
                        }),
                        aiPrdctns: deepFuse(mem.aiNsts.aiPrdctns, aiP),
                        sgstdOpts: deepFuse(mem.aiNsts.sgstdOpts, aiO),
                        ovrlSntmnt: oS,
                        sgstdGlblAct: aiGO.sgstns.find(s => s.f === 'general')?.r || 'Review AI insights.',
                        mdlStat: 'idle',
                        lastAiRun: Date.now(),
                    },
                    statMsg: `Loaded ${intn.dgram.allUids.length} ${objName} objects.`,
                };
            }
            case PRCS_STRT:
                return { ...mem,
                    ldng: true,
                    flt: null,
                    statMsg: `Loading ${objName}...`
                };
            case PRCS_END:
                return { ...mem,
                    ldng: false,
                    statMsg: `Finished ${objName} load.`
                };
            case QRY_MDFY:
                return {
                    ...mem,
                    qry: deepFuse(mem.qry, intn.qryUpdts),
                    pgCnt: 1,
                    totCnt: 0,
                    statMsg: `Query updated for ${objName}.`,
                };
            case OBJ_MDFY: {
                if (!intn.id || !mem.byUid[intn.id]) return { ...mem,
                    flt: {
                        msg: `Cannot update ${objName}: ID missing or not found.`,
                        c: 400,
                        ts: Date.now()
                    }
                };
                const updObj = deepFuse(mem.byUid[intn.id], { ...intn.dgram,
                    modAt: Date.now()
                });
                const aiP = gmniApiSim.prdctNxtAct(updObj);
                const aiA = gmniApiSim.dtctNmly(updObj);
                const aiO = gmniApiSim.sgstOpt(updObj);
                return {
                    ...mem,
                    byUid: { ...mem.byUid,
                        [intn.id]: updObj
                    },
                    lastUpdtAt: Date.now(),
                    aiNsts: {
                        ...mem.aiNsts,
                        aiPrdctns: { ...mem.aiNsts.aiPrdctns,
                            [intn.id]: aiP
                        },
                        topNmlies: aiA.isNmly ?
                            [...mem.aiNsts.topNmlies.filter(a => a.objId !== intn.id), {
                                objId: intn.id,
                                ...aiA
                            }].sort((a, b) => (({
                                'critical': 4,
                                'high': 3,
                                'medium': 2,
                                'low': 1
                            })[b.svrty] || 0) - (({
                                'critical': 4,
                                'high': 3,
                                'medium': 2,
                                'low': 1
                            })[a.svrty] || 0)) :
                            mem.aiNsts.topNmlies.filter(a => a.objId !== intn.id),
                        sgstdOpts: { ...mem.aiNsts.sgstdOpts,
                            [intn.id]: aiO.sgstns
                        },
                        lastAiRun: Date.now(),
                    },
                    statMsg: `Object ${intn.id} (${objName}) updated.`,
                    flt: null,
                };
            }
            case OBJ_INJCT: {
                const nId = intn.dgram.id || genUNID();
                if (mem.byUid[nId]) return { ...mem,
                    flt: {
                        msg: `Object with ID ${nId} exists.`,
                        c: 409,
                        ts: Date.now()
                    }
                };
                const nObj = { ...intn.dgram,
                    id: nId,
                    crtAt: Date.now(),
                    modAt: Date.now()
                };
                const aiP = gmniApiSim.prdctNxtAct(nObj);
                const aiA = gmniApiSim.dtctNmly(nObj);
                const aiO = gmniApiSim.sgstOpt(nObj);
                return {
                    ...mem,
                    byUid: { ...mem.byUid,
                        [nId]: nObj
                    },
                    allUids: [...mem.allUids, nId],
                    totCnt: mem.totCnt + 1,
                    lastUpdtAt: Date.now(),
                    aiNsts: {
                        ...mem.aiNsts,
                        aiPrdctns: { ...mem.aiNsts.aiPrdctns,
                            [nId]: aiP
                        },
                        topNmlies: aiA.isNmly ?
                            [...mem.aiNsts.topNmlies, {
                                objId: nId,
                                ...aiA
                            }].sort((a, b) => (({
                                'critical': 4,
                                'high': 3
                            })[b.svrty] || 0) - (({
                                'critical': 4,
                                'high': 3
                            })[a.svrty] || 0)) :
                            mem.aiNsts.topNmlies,
                        sgstdOpts: { ...mem.aiNsts.sgstdOpts,
                            [nId]: aiO.sgstns
                        },
                        lastAiRun: Date.now(),
                    },
                    statMsg: `New ${objName} object ${nId} added.`,
                    flt: null,
                };
            }
            case OBJ_RMV: {
                if (!intn.id || !mem.byUid[intn.id]) return { ...mem,
                    flt: {
                        msg: `Cannot remove ${objName}: ID missing or not found.`,
                        c: 400,
                        ts: Date.now()
                    }
                };
                const {
                    [intn.id]: rmvdObj, ...rstById
                } = mem.byUid;
                const nAllUids = mem.allUids.filter(i => i !== intn.id);
                const nAiP = Object.fromEntries(Object.entries(mem.aiNsts.aiPrdctns).filter(([k]) => k !== intn.id));
                const nTopA = mem.aiNsts.topNmlies.filter(a => a.objId !== intn.id);
                const nSgO = Object.fromEntries(Object.entries(mem.aiNsts.sgstdOpts || {}).filter(([k]) => k !== intn.id));
                return {
                    ...mem,
                    byUid: rstById,
                    allUids: nAllUids,
                    totCnt: Math.max(0, mem.totCnt - 1),
                    lastUpdtAt: Date.now(),
                    aiNsts: {
                        ...mem.aiNsts,
                        aiPrdctns: nAiP,
                        topNmlies: nTopA,
                        sgstdOpts: nSgO,
                    },
                    statMsg: `Object ${intn.id} (${objName}) removed.`,
                    flt: null,
                };
            }
            case BLK_UPDT: {
                if (!Array.isArray(intn.dgram) || intn.dgram.length === 0) return mem;
                let uById = { ...mem.byUid
                };
                const nAiP = { ...mem.aiNsts.aiPrdctns
                };
                let nTopA = [...mem.aiNsts.topNmlies];
                const nSgO = { ...mem.aiNsts.sgstdOpts
                };
                intn.dgram.forEach(itm => {
                    if (itm.id && uById[itm.id]) {
                        const o = deepFuse(uById[itm.id], { ...itm.updts,
                            modAt: Date.now()
                        });
                        uById[itm.id] = o;
                        nAiP[itm.id] = gmniApiSim.prdctNxtAct(o);
                        const anom = gmniApiSim.dtctNmly(o);
                        nTopA = nTopA.filter(a => a.objId !== itm.id);
                        if (anom.isNmly) nTopA.push({
                            objId: itm.id,
                            ...anom
                        });
                        nSgO[itm.id] = gmniApiSim.sgstOpt(o).sgstns;
                    }
                });
                return {
                    ...mem,
                    byUid: uById,
                    lastUpdtAt: Date.now(),
                    aiNsts: {
                        ...mem.aiNsts,
                        aiPrdctns: nAiP,
                        topNmlies: nTopA.sort((a, b) => (({
                            'critical': 4,
                            'high': 3
                        })[b.svrty] || 0) - (({
                            'critical': 4,
                            'high': 3
                        })[a.svrty] || 0)),
                        sgstdOpts: nSgO,
                        lastAiRun: Date.now(),
                    },
                    statMsg: `Bulk update for ${intn.dgram.length} ${objName} objects completed.`,
                    flt: null,
                };
            }
            case BLK_RMV: {
                if (!Array.isArray(intn.dgram) || intn.dgram.length === 0) return mem;
                const idsToRmv = new Set(intn.dgram);
                const nById = Object.fromEntries(Object.entries(mem.byUid).filter(([i]) => !idsToRmv.has(i)));
                const nAllUids = mem.allUids.filter(i => !idsToRmv.has(i));
                const nAiP = Object.fromEntries(Object.entries(mem.aiNsts.aiPrdctns).filter(([k]) => !idsToRmv.has(k)));
                const nTopA = mem.aiNsts.topNmlies.filter(a => !idsToRmv.has(a.objId));
                const nSgO = Object.fromEntries(Object.entries(mem.aiNsts.sgstdOpts || {}).filter(([k]) => !idsToRmv.has(k)));
                return {
                    ...mem,
                    byUid: nById,
                    allUids: nAllUids,
                    totCnt: Math.max(0, mem.totCnt - idsToRmv.size),
                    lastUpdtAt: Date.now(),
                    aiNsts: {
                        ...mem.aiNsts,
                        aiPrdctns: nAiP,
                        topNmlies: nTopA,
                        sgstdOpts: nSgO,
                    },
                    statMsg: `Bulk removal of ${idsToRmv.size} ${objName} objects completed.`,
                    flt: null,
                };
            }
            case GTHB_CMT_PSH: {
                const res = integrationsSim.github.pushCommit(intn.dgram.repo, intn.dgram.msg);
                return {
                    ...mem,
                    extSys: {
                        ...mem.extSys,
                        gthb: {
                            ...mem.extSys.gthb,
                            lastPush: res.ts,
                            commits: [...mem.extSys.gthb.commits, res.commitSha]
                        }
                    },
                    statMsg: `Pushed commit ${res.commitSha} to repo ${res.repo}.`
                };
            }
            case PLD_TRNSCTNS_SYNC: {
                const res = integrationsSim.plaid.getTransactions(intn.dgram.token);
                return {
                    ...mem,
                    extSys: {
                        ...mem.extSys,
                        pld: {
                            ...mem.extSys.pld,
                            lastSync: res.ts,
                            transactions: [...mem.extSys.pld.transactions, ...res.transactions]
                        }
                    },
                    statMsg: `Synced ${res.transactions.length} transactions from Plaid.`
                };
            }
            case TWL_MSG_SND: {
                const res = integrationsSim.twilio.sendMessage(intn.dgram.to, intn.dgram.body);
                return {
                    ...mem,
                    extSys: {
                        ...mem.extSys,
                        twl: {
                            ...mem.extSys.twl,
                            lastSent: res.ts,
                            messageQueue: mem.extSys.twl.messageQueue + 1,
                        }
                    },
                    statMsg: `Queued message to ${res.to} via Twilio.`
                };
            }
            case SET_ACTV_OBJ:
                return { ...mem,
                    actvObjId: intn.id,
                    statMsg: intn.id ? `Object ${intn.id} (${objName}) selected.` : `No active ${objName} object.`
                };
            case CLR_ACTV_OBJ:
                return { ...mem,
                    actvObjId: null,
                    statMsg: `Active ${objName} object cleared.`
                };
            case MEM_RST:
                return { ...initMem,
                    statMsg: `Memory for ${objName} reset.`
                };
            case SET_FLT:
                return {
                    ...mem,
                    flt: {
                        msg: intn.msg,
                        c: intn.c || 500,
                        ts: Date.now(),
                        dtls: intn.dtls || null,
                    },
                    statMsg: `Error for ${objName}: ${intn.msg}`,
                };
            case CLR_FLT:
                return { ...mem,
                    flt: null,
                    statMsg: null
                };
            case DAT_CLN_REQ:
                return { ...mem,
                    statMsg: `Data cleanup requested for ${objName}...`,
                    aiPrcs: true
                };
            case DAT_CLN_CMPLT: {
                const thrsh = Date.now() - (30 * 24 * 60 * 60 * 1000);
                const toKeep = Object.entries(mem.byUid).filter(([, o]) =>
                    !(o.stat === 'archived' && o.modAt < thrsh)
                );
                const clnById = Object.fromEntries(toKeep);
                const clnAllUids = toKeep.map(([i]) => i);
                const rmvdCnt = mem.allUids.length - clnAllUids.length;
                return {
                    ...mem,
                    byUid: clnById,
                    allUids: clnAllUids,
                    totCnt: clnAllUids.length,
                    lastClnAt: Date.now(),
                    aiPrcs: false,
                    statMsg: `Cleanup for ${objName} done. Removed ${rmvdCnt} objects.`,
                };
            }
            case DAT_VLD_RSLT: {
                if (!intn.objId || !intn.fldName) return mem;
                return {
                    ...mem,
                    fldVldtns: {
                        ...mem.fldVldtns,
                        [intn.objId]: {
                            ...mem.fldVldtns[intn.objId],
                            [intn.fldName]: {
                                isVld: intn.isVld,
                                msg: intn.msg,
                                ts: Date.now(),
                            },
                        },
                    },
                };
            }
            case AI_NSTS_REQ:
                return {
                    ...mem,
                    aiPrcs: true,
                    aiNsts: { ...mem.aiNsts,
                        mdlStat: 'processing',
                        lastAiRun: Date.now()
                    },
                    statMsg: `AI insights requested for ${objName}.`,
                };
            case AI_NSTS_RCVD: {
                const {
                    smry,
                    nmlies,
                    prdctns,
                    ovrlSntmnt,
                    glblActs,
                    mdlStat,
                    ltstCmpltn,
                    cmpltnMta
                } = intn.dgram;
                return {
                    ...mem,
                    aiPrcs: false,
                    aiNsts: {
                        ...mem.aiNsts,
                        smry: smry || mem.aiNsts.smry,
                        topNmlies: (nmlies && Array.isArray(nmlies)) ? nmlies : mem.aiNsts.topNmlies,
                        aiPrdctns: prdctns ? deepFuse(mem.aiNsts.aiPrdctns, prdctns) : mem.aiNsts.aiPrdctns,
                        ovrlSntmnt: ovrlSntmnt || mem.aiNsts.ovrlSntmnt,
                        sgstdGlblAct: (glblActs && glblActs.length > 0) ? glblActs[0].r : mem.aiNsts.sgstdGlblAct,
                        mdlStat: mdlStat || 'idle',
                        lastAiRun: Date.now(),
                        ltstCmpltn: ltstCmpltn || mem.aiNsts.ltstCmpltn,
                        cmpltnMta: cmpltnMta || mem.aiNsts.cmpltnMta,
                    },
                    statMsg: `AI insights for ${objName} updated.`,
                };
            }
            case AI_MDL_STAT_UPDT: {
                if (!intn.dgram || typeof intn.dgram.stat !== 'string') return mem;
                return {
                    ...mem,
                    aiPrcs: (intn.dgram.stat === 'processing'),
                    aiNsts: {
                        ...mem.aiNsts,
                        mdlStat: intn.dgram.stat,
                        lastAiRun: Date.now(),
                    },
                    statMsg: `AI model status is now: ${intn.dgram.stat}.`,
                };
            }
            default:
                return mem;
        }
    };
}