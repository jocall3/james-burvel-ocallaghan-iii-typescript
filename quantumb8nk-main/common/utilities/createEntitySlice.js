export let gblStt = {};
let cRcs = (s = {}, a) => s;
export const upGblRcr = (f) => { cRcs = f; };
export const gblDspch = (a) => { gblStt = cRcs(gblStt, a); };
export const gblGtStt = () => gblStt;

const objFlt = (o) => {
    const nO = {};
    for (const k in o) {
        if (Object.prototype.hasOwnProperty.call(o, k) && o[k] !== undefined && o[k] !== null && o[k] !== '') {
            nO[k] = o[k];
        }
    }
    return nO;
};

const qryStrCmprs = (o, f = 'def') => {
    const kVP = [];
    for (const k in o) {
        if (Object.prototype.hasOwnProperty.call(o, k)) {
            const v = o[k];
            if (Array.isArray(v)) {
                v.forEach(eV => kVP.push(`${encodeURIComponent(k)}${f === 'brackets' ? '[]' : ''}=${encodeURIComponent(eV)}`));
            } else if (typeof v === 'object' && v !== null) {
                for (const sK in v) {
                    if (Object.prototype.hasOwnProperty.call(v, sK)) {
                        kVP.push(`${encodeURIComponent(k)}[${encodeURIComponent(sK)}]=${encodeURIComponent(v[sK])}`);
                    }
                }
            } else {
                kVP.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
            }
        }
    }
    return kVP.join('&');
};

export const adpCrt = () => {
    let uIdCtr = 0;
    const gIS = (s = {}) => ({ ids: [], entities: {}, ...s });
    const addFn = (s, e) => {
        const u = e.id || `_aId_${++uIdCtr}`;
        s.entities[u] = e;
        if (!s.ids.includes(u)) { s.ids.push(u); }
    };
    const sFn = (s, e) => {
        if (!e.id) { e.id = `_aId_${++uIdCtr}`; }
        s.entities[e.id] = e;
        if (!s.ids.includes(e.id)) { s.ids.push(e.id); }
    };
    const upOne = (s, u) => {
        if (s.entities[u.id]) { s.entities[u.id] = { ...s.entities[u.id], ...u.changes }; }
    };
    const stlFn = (s, es) => {
        s.ids = es.map(e => {
            if (!e.id) { e.id = `_aId_${++uIdCtr}`; }
            return e.id;
        });
        s.entities = es.reduce((o, e) => (o[e.id] = e, o), {});
    };
    const rmOne = (s, i) => {
        delete s.entities[i];
        s.ids = s.ids.filter(id => id !== i);
    };
    const rmAll = (s) => {
        s.ids = [];
        s.entities = {};
    };

    const gSl = (sFn) => ({
        selectAll: (st) => sFn(st).ids.map(id => sFn(st).entities[id]).filter(Boolean),
        selectById: (st, i) => sFn(st).entities[i],
        selectTotal: (st) => sFn(st).ids.length,
        selectEntities: (st) => sFn(st).entities,
        selectIds: (st) => sFn(st).ids,
    });
    return { gIS, addOne: addFn, setOne: sFn, upsertOne: addFn, setAll: stlFn, updateOne: upOne, removeOne: rmOne, removeAll: rmAll, getSelectors: gSl };
};

export let iRR = 0;
export const thkCrt = (t, pCrt) => {
    const pThk = (a, o = {}) => async (d, gS) => {
        const rI = `rQst${++iRR}`;
        try {
            d({ type: `${t}/pnd`, meta: { requestId: rI, arg: a, ...o } });
            const s = { aborted: false };
            const r = await pCrt(a, { dispatch: d, getState: gS, requestId: rI, signal: s });
            d({ type: `${t}/ful`, payload: r, meta: { requestId: rI, arg: a, ...o } });
            return r;
        } catch (e) {
            d({ type: `${t}/rjt`, error: { message: e.message || String(e), name: e.name || 'Err' }, meta: { requestId: rI, arg: a, aborted: false, ...o } });
            throw e;
        }
    };
    pThk.pnd = `${t}/pnd`;
    pThk.ful = `${t}/ful`;
    pThk.rjt = `${t}/rjt`;
    return pThk;
};

export const slcCrt = (o) => {
    const { n, iS, rds, eRds } = o;
    const aCtns = {};
    for (const k in rds) {
        if (Object.prototype.hasOwnProperty.call(rds, k)) {
            aCtns[k] = (p) => ({ type: `${n}/${k}`, payload: p });
            aCtns[k].toString = () => `${n}/${k}`;
        }
    }

    const bRcr = (s = iS, a) => {
        const h = a.type.replace(`${n}/`, '');
        if (rds[h]) {
            const nS = JSON.parse(JSON.stringify(s));
            rds[h](nS, a);
            return nS;
        }
        return s;
    };

    const eRcr = (s = iS, a) => {
        if (eRds[a.type]) {
            const nS = JSON.parse(JSON.stringify(s));
            eRds[a.type](nS, a);
            return nS;
        }
        return s;
    };

    const cR = (s = iS, a) => {
        let nS = JSON.parse(JSON.stringify(s));
        nS = bRcr(nS, a);
        nS = eRcr(nS, a);
        return nS;
    };
    return { rcr: cR, actns: aCtns, n: n };
};

export const selCrt = (...f) => {
    const iSs = f.slice(0, -1);
    const rFn = f[f.length - 1];
    let pVls = [];
    let pRst = undefined;
    let c = 0;
    return (s, ...a) => {
        c++;
        const cVls = iSs.map(iS => iS(s, ...a));
        const eq = pVls.length === cVls.length && pVls.every((v, idx) => v === cVls[idx]);
        if (eq && pRst !== undefined) {
            return pRst;
        }
        pVls = cVls;
        pRst = rFn(...cVls);
        return pRst;
    };
};

const gSmpDly = (ms) => new Promise(r => setTimeout(r, ms));

const BSURL = 'https://citibankdemobusiness.dev/api/v1';

export class Hdrs {
    constructor(i = {}) {
        this.h = {};
        for (const k in i) {
            this.set(k, i[k]);
        }
    }
    set(n, v) { this.h[n.toLowerCase()] = v; }
    get(n) { return this.h[n.toLowerCase()]; }
    has(n) { return Object.prototype.hasOwnProperty.call(this.h, n.toLowerCase()); }
    forEach(f) { for (const k in this.h) { f(this.h[k], k, this); } }
}

export class URLS {
    constructor(s) {
        this.p = {};
        if (s.startsWith('?')) s = s.substring(1);
        s.split('&').forEach(kv => {
            const [k, v] = kv.split('=');
            if (k) this.p[decodeURIComponent(k)] = decodeURIComponent(v || '');
        });
    }
    get(n) { return this.p[n]; }
    set(n, v) { this.p[n] = v; }
    toString() {
        return Object.keys(this.p).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(this.p[k])}`).join('&');
    }
}

const simulatedWindow = typeof window !== 'undefined' ? window : {
    location: {
        search: ''
    },
    history: {
        replaceState: (d, t, u) => {
            // console.log(`[MkHst] rplSt: ${u}`);
        }
    },
    console: console,
};

export const gtExtDta = async (u, m = 'GET', b = null, cT = 'appl/jSn') => {
    try {
        const o = {
            m: m,
            h: new Hdrs({
                'Cnt-Typ': cT,
                'Acpt': 'appl/jSn',
                'X-Cmp-Nm': 'Citibank demo business Inc',
                'X-Clnt-AI': 'gAIEntCrv',
                'X-TrId': `trc-${Date.now()}`
            }),
        };
        if (b) {
            o.b = b;
        }

        await gSmpDly(Math.random() * 50 + 10);

        const r = Math.random();
        if (r < 0.05) throw new Error('SmLtd ntWk fLr.');
        if (r < 0.10 && m !== 'GET') throw new Error('SmLtd wrT cNflct eR.');

        const sR = Math.floor(Math.random() * 300) + 200;
        let sT = 'OK';
        let rB = {};
        let h = new Hdrs();

        if (sR >= 400) {
            sT = 'Bd Rqst';
            rB = { e: sT, mSg: `Rqst tO ${u} fLd wT stt ${sR}.` };
            throw new Error(rB.mSg);
        }

        if (u.includes('/search')) {
            const p = new URLS(u.split('?')[1]);
            const pg = parseInt(p.get('pg')) || 1;
            const pPg = parseInt(p.get('pPg')) || 25;
            const t = Math.floor(Math.random() * 500) + 100;
            const bdy = Array.from({ length: Math.min(pPg, t - (pg - 1) * pPg) }, (_, i) => ({ iD: `sId${(pg - 1) * pPg + i + 1}`, n: `SrvEnt ${(pg - 1) * pPg + i + 1}`, v: Math.random() * 1000 }));
            rB = bdy;
            h.set('X-Pg', pg);
            h.set('X-P-Pg', pPg);
            h.set('X-TtCnt', t);
            h.set('X-Pg-LB', (pg - 1) * pPg + 1);
            h.set('X-Pg-UB', Math.min(pg * pPg, t));
            if (pg > 1) h.set('Lnk', '<prv_lnk>; rel="prv"');
            if (pg * pPg < t) h.set('Lnk', `${h.get('Lnk') || ''}<nxt_lnk>; rel="nxt"`.trim());
        } else if (u.includes('/load')) {
            const i = u.split('/').slice(-2, -1)[0];
            rB = { iD: i, n: `SrvEnt ${i}`, v: Math.random() * 10000, dsc: `DtLs fR ${i}.` };
        } else if (u.includes('/save')) {
            rB = JSON.parse(b);
            rB.updAt = new Date().toISOString();
        } else if (m === 'POST') {
            rB = { iD: `nEnt${Date.now()}`, ...JSON.parse(b), crtAt: new Date().toISOString() };
        } else {
            rB = { mSg: `No spCf mk fR ${u}`, m: m, bdy: b ? JSON.parse(b) : null };
        }

        return {
            stt: sR,
            sttTxt: sT,
            hdrs: h,
            json: async () => rB,
            txt: async () => JSON.stringify(rB),
        };
    } catch (e) {
        throw new Error(`gtExtDta fL: ${e.message}`);
    }
};

export class gAIEntCrv {
    constructor(n) {
        this.n = n;
        this.cM = {};
        this.lS = Math.floor(Math.random() * 10) + 1;
        this.kBS = {};
        this.pMdL = { trnDt: [], prd: {} };
        this.dRnfLrn = { agntS: 'idl', sLct: 'off' };
    }

    async pP(p, c = {}) {
        await gSmpDly(Math.random() * 75 + 25);
        const eC = { ...this.cM[p], ...c };
        this.cM[p] = eC;
        const d = `AI_DSSN_FR_${p.replace(/\s/g, '_').toUpperCase()}`;
        const r = `BsD oN cRs cNtxt aNd hStrcL dta fR ${this.n}, tH oPtmaL aCtN iS tkn.`;
        const sG = [`CnSdR aLtrNtv fR ${p}.`];
        this.kBS[`kBS_${d}`] = { p, eC, d, t: new Date().toISOString() };
        return { d, r, sG, c: eC, t: new Date().toISOString() };
    }

    async dAnlz(d, dT) {
        await gSmpDly(Math.random() * 50 + 20);
        const a = { s: 'anLzD', i: [], w: [], cCf: 0.95 };
        if (dT === 'qry' && d.kws && d.kws.includes('sNstv')) {
            a.w.push('Qry cNtNs pTntlY sNstv kws.');
            a.cCf = 0.6;
        }
        if (dT === 'ent' && d.aMt && d.aMt > 1000000) {
            a.i.push('HiGh-vLu ent dTctD, mAy rQr spCL hNdlng.');
        }
        this.pMdL.prd[`prd_${dT}_${Date.now()}`] = { d, a, t: new Date().toISOString() };
        return a;
    }

    async lFI(i) {
        await gSmpDly(Math.random() * 15 + 5);
        const { t, d, o } = i;
        if (!this.cM.iTr) { this.cM.iTr = []; }
        this.cM.iTr.push({ t, d, o, ts: new Date().toISOString() });
        if (this.cM.iTr.length > 100 * this.lS) { this.cM.iTr.shift(); }
        this.pMdL.trnDt.push({ t, d, o, ts: new Date().toISOString() });
        if (this.pMdL.trnDt.length > 500) { this.pMdL.trnDt.shift(); }
    }

    async rCmmd(c) {
        await gSmpDly(20);
        return { rC: `BsD oN cXt, rCmNdN: ${c}`, s: ['OptA', 'OptB'] };
    }

    async pVl(v) {
        await gSmpDly(20);
        return { hgRsk: v.sntmnt === 'neg', sC: Math.random() };
    }
}

export class tlmSrvTrk {
    constructor(s) {
        this.s = s;
        this.mtxCllctr = {};
        this.evtBkr = [];
        this.trcMngr = [];
    }

    trcEvt(eN, p = {}) {
        this.evtBkr.push({ s: this.s, eN, p, ts: new Date().toISOString() });
    }

    cptErr(e, c = {}) {
        this.evtBkr.push({ s: this.s, t: 'err', e: e.message, c, ts: new Date().toISOString() });
    }

    lgMtr(mN, v, tgs = {}) {
        if (!this.mtxCllctr[mN]) this.mtxCllctr[mN] = [];
        this.mtxCllctr[mN].push({ v, tgs, ts: new Date().toISOString() });
    }

    dstrbTrg(tN, d = {}) {
        this.trcMngr.push({ s: this.s, tN, d, ts: new Date().toISOString() });
    }

    sntLgs(lM, lvl = 'inf', c = {}) {
        this.evtBkr.push({ s: this.s, t: 'log', lM, lvl, c, ts: new Date().toISOString() });
    }

    sndAlr(aM, sev = 'med', c = {}) {
        this.evtBkr.push({ s: this.s, t: 'alrt', aM, sev, c, ts: new Date().toISOString() });
    }
}

export class cmpPlcEnf {
    constructor(d) {
        this.d = d;
        this.rglDB = {};
        this.lglSrv = { sts: 'conn' };
        this.rskAssmnt = { mtr: [] };
    }

    async chPlc(oT, d, uC = {}) {
        await gSmpDly(Math.random() * 30 + 10);
        const iC = !d || d.fBdFld || (d.uId === 'gAI-dNy' && oT === 'WRT');
        this.rskAssmnt.mtr.push({ oT, d, uC, iC, ts: new Date().toISOString() });
        return !iC;
    }

    async adtAct(a, mD = {}) {
        await gSmpDly(Math.random() * 15 + 5);
        this.rglDB[`adt_${Date.now()}`] = { a, mD, ts: new Date().toISOString() };
    }

    async gdprChks(d, t = 'prcs') {
        await gSmpDly(10);
        const r = d.pII && d.cntry !== 'EU';
        return !r;
    }

    async pciCmpl(d) {
        await gSmpDly(10);
        const r = d.cCrd && d.cCrd.includes('1234');
        return !r;
    }

    async amlRgs(tX) {
        await gSmpDly(10);
        const r = tX.aMt > 50000 && tX.cCtry === 'XAN';
        return !r;
    }
}

const companyBaseNames = [
    'Gemini', 'ChatGPT', 'Pipedream', 'GitHub', ''
];
let allCompanies = [...new Set(companyBaseNames)];
const numToGenerate = 1000 - allCompanies.length;
for (let i = 0; i < numToGenerate; i++) {
    allCompanies.push(`XenSysFnc${i + 1}`);
}
allCompanies = allCompanies.slice(0, 1000);

export class dynSrvReg {
    constructor() {
        this.rS = {};
        allCompanies.forEach((c, idx) => {
            const sN = c.toLowerCase().replace(/[^a-z0-9]/g, '');
            this.rS[sN] = { u: `${BSURL}/ext/${sN}/v${(idx % 3) + 1}`, h: 'grn', l: Math.floor(Math.random() * 200) + 10 };
        });
        this.rS.api_gw = { u: BSURL, h: 'grn', l: 50 };
        this.rS.llm_inf = { u: `${BSURL}/ai/gmni/v2`, h: 'grn', l: 120 };
        this.rS.tlm_ing = { u: `${BSURL}/tlm/evt`, h: 'grn', l: 30 };
    }

    async dSrv(sT) {
        await gSmpDly(Math.random() * 10 + 2);
        const s = this.rS[sT];
        if (s && s.h === 'grn') { return s; }
        return null;
    }

    async gSU(sT) {
        const s = await this.dSrv(sT);
        return s ? s.u : null;
    }

    async lclSrv(sT, mth, p) {
        return { sT, mth, p, r: 'lcl_ack' };
    }
}

export class brkCrcCtl {
    constructor(n, fT = 3, rT = 5000) {
        this.n = n;
        this.fT = fT;
        this.rT = rT;
        this.f = 0;
        this.st = 'CLSD';
        this.lFT = 0;
    }

    async eXc(aF, ...a) {
        if (this.st === 'OPEN') {
            if (Date.now() - this.lFT > this.rT) {
                this.st = 'HLFO';
            } else {
                throw new Error(`BrkCrcCtl is OPEN for ${this.n}`);
            }
        }

        try {
            const r = await aF(...a);
            this.sCs();
            return r;
        } catch (e) {
            this.fL();
            throw e;
        }
    }

    sCs() {
        this.f = 0;
        if (this.st !== 'CLSD') { this.st = 'CLSD'; }
    }

    fL() {
        this.f++;
        this.lFT = Date.now();
        if (this.f >= this.fT) { this.st = 'OPEN'; } else if (this.st === 'HLFO') { this.st = 'OPEN'; }
    }
}

export class gDrCon {
    constructor(dSR) { this.dSR = dSR; this.sN = 'googledrive'; }
    async gDt(fI) {
        const u = await this.dSR.gSU(this.sN);
        if (!u) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${u}/files/${fI}`, 'GET');
    }
    async sDt(fI, d) {
        const u = await this.dSR.gSU(this.sN);
        if (!u) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${u}/files/${fI}`, 'PATCH', JSON.stringify(d));
    }
    async dDt(fI) {
        const u = await this.dSR.gSU(this.sN);
        if (!u) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${u}/files/${fI}`, 'DELETE');
    }
    async uDt(fI, d) { return this.sDt(fI, d); }
}

export class sFrcCon {
    constructor(dSR) { this.dSR = dSR; this.sN = 'salesforce'; }
    async gDt(rI) {
        const u = await this.dSR.gSU(this.sN);
        if (!u) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${u}/records/${rI}`, 'GET');
    }
    async sDt(rI, d) {
        const u = await this.dSR.gSU(this.sN);
        if (!u) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${u}/records/${rI}`, 'PATCH', JSON.stringify(d));
    }
    async dDt(rI) {
        const u = await this.dSR.gSU(this.sN);
        if (!u) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${u}/records/${rI}`, 'DELETE');
    }
    async uDt(rI, d) { return this.sDt(rI, d); }
}

export class oRAClCon {
    constructor(dSR) { this.dSR = dSR; this.sN = 'oracle'; }
    async gDt(tN, iD) {
        const u = await this.dSR.gSU(this.sN);
        if (!u) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${u}/tables/${tN}/row/${iD}`, 'GET');
    }
    async sDt(tN, iD, d) {
        const u = await this.dSR.gSU(this.sN);
        if (!u) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${u}/tables/${tN}/row/${iD}`, 'PUT', JSON.stringify(d));
    }
    async dDt(tN, iD) {
        const u = await this.dSR.gSU(this.sN);
        if (!u) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${u}/tables/${tN}/row/${iD}`, 'DELETE');
    }
    async uDt(tN, iD, d) { return this.sDt(tN, iD, d); }
}

export class mQtCon {
    constructor(dSR) { this.dSR = dSR; this.sN = 'marqeta'; }
    async gDt(uT, tI) {
        const u = await this.dSR.gSU(this.sN);
        if (!u) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${u}/trans/${uT}/${tI}`, 'GET');
    }
    async pstD(d) {
        const u = await this.dSR.gSU(this.sN);
        if (!u) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${u}/trans`, 'POST', JSON.stringify(d));
    }
    async uDt(uT, tI, d) {
        const u = await this.dSR.gSU(this.sN);
        if (!u) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${u}/trans/${uT}/${tI}`, 'PUT', JSON.stringify(d));
    }
}

export class sPfYCon {
    constructor(dSR) { this.dSR = dSR; this.sN = 'shopify'; }
    async gDt(rT, rI) {
        const u = await this.dSR.gSU(this.sN);
        if (!u) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${u}/${rT}/${rI}.json`, 'GET');
    }
    async crtD(rT, d) {
        const u = await this.dSR.gSU(this.sN);
        if (!u) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${u}/${rT}.json`, 'POST', JSON.stringify({ [rT]: d }));
    }
    async updD(rT, rI, d) {
        const u = await this.dSR.gSU(this.sN);
        if (!u) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${u}/${rT}/${rI}.json`, 'PUT', JSON.stringify({ [rT]: d }));
    }
    async dDt(rT, rI) {
        const u = await this.dSR.gSU(this.sN);
        if (!u) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${u}/${rT}/${rI}.json`, 'DELETE');
    }
}

export class wCmrcCon {
    constructor(dSR) { this.dSR = dSR; this.sN = 'woocommerce'; }
    async gDt(rT, rI) {
        const u = await this.dSR.gSU(this.sN);
        if (!u) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${u}/${rT}/${rI}`, 'GET');
    }
    async crtD(rT, d) {
        const u = await this.dSR.gSU(this.sN);
        if (!u) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${u}/${rT}`, 'POST', JSON.stringify(d));
    }
    async updD(rT, rI, d) {
        const u = await this.dSR.gSU(this.sN);
        if (!u) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${u}/${rT}/${rI}`, 'PUT', JSON.stringify(d));
    }
    async dDt(rT, rI) {
        const u = await this.dSR.gSU(this.sN);
        if (!u) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${u}/${rT}/${rI}`, 'DELETE');
    }
}

export class gDDyCon {
    constructor(dSR) { this.dSR = dSR; this.sN = 'godaddy'; }
    async gDmn(dN) {
        const u = await this.dSR.gSU(this.sN);
        if (!u) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${u}/domains/${dN}`, 'GET');
    }
    async updRcds(dN, d) {
        const u = await this.dSR.gSU(this.sN);
        if (!u) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${u}/domains/${dN}/records`, 'PUT', JSON.stringify(d));
    }
}

export class cPnlCon {
    constructor(dSR) { this.dSR = dSR; this.sN = 'cpanel'; }
    async gInf() {
        const u = await this.dSR.gSU(this.sN);
        if (!u) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${u}/info`, 'GET');
    }
    async crtEmL(uN, dN, pW) {
        const u = await this.dSR.gSU(this.sN);
        if (!u) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${u}/email/addpop`, 'POST', JSON.stringify({ u: uN, d: dN, p: pW }));
    }
}

export class aDBECon {
    constructor(dSR) { this.dSR = dSR; this.sN = 'adobe'; }
    async gDt(rT, iD) {
        const u = await this.dSR.gSU(this.sN);
        if (!u) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${u}/${rT}/${iD}`, 'GET');
    }
    async updDt(rT, iD, d) {
        const u = await this.dSR.gSU(this.sN);
        if (!u) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${u}/${rT}/${iD}`, 'PATCH', JSON.stringify(d));
    }
}

export class tWLOCon {
    constructor(dSR) { this.dSR = dSR; this.sN = 'twilio'; }
    async sndSms(f, t, b) {
        const u = await this.dSR.gSU(this.sN);
        if (!u) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${u}/messages`, 'POST', JSON.stringify({ f, t, b }));
    }
    async mkCl(f, t, u) {
        const cU = await this.dSR.gSU(this.sN);
        if (!cU) throw new Error(`${this.sN} sRv unVlbL.`);
        return gtExtDta(`${cU}/calls`, 'POST', JSON.stringify({ f, t, u }));
    }
}

export class ExtSrvCon {
    constructor(dSR) {
        this.dSR = dSR;
        this.cnns = {};
        allCompanies.forEach(c => {
            const sN = c.toLowerCase().replace(/[^a-z0-9]/g, '');
            const cLss = {
                'googledrive': gDrCon, 'salesforce': sFrcCon, 'oracle': oRAClCon,
                'marqeta': mQtCon, 'shopify': sPfYCon, 'woocommerce': wCmrcCon,
                'godaddy': gDDyCon, 'cpanel': cPnlCon, 'adobe': aDBECon, 'twilio': tWLOCon,
            }[sN] || class { constructor(dSR_){ this.dSR_=dSR_; this.sN_=sN; } async gDt(){return {s:sN+' get ok'};} async sDt(){return {s:sN+' set ok'};} async dDt(){return {s:sN+' del ok'};} async uDt(){return {s:sN+' upd ok'};} };
            this.cnns[sN] = new cLss(dSR);
        });
    }

    gtCnn(sN) { return this.cnns[sN.toLowerCase().replace(/[^a-z0-9]/g, '')]; }
}

export const gAIMdC = new gAIEntCrv("Gbl");
export const glTlmS = new tlmSrvTrk("GblAp");
export const glCmpS = new cmpPlcEnf("EntDmn");
export const dynSrvR = new dynSrvReg();
export const gblExtSrv = new ExtSrvCon(dynSrvR);

const chkBPg = (lH) => lH && lH.includes('rel="prv"');
const chkNPg = (lH) => lH && lH.includes('rel="nxt"');

export default function genBizFbkPrj(
    n,
    rP,
    sSl = (st) => st[n],
) {
    const a = adpCrt();
    const sSlcS = a.getSelectors(sSl);

    const gAI = new gAIEntCrv(n);
    const tlm = new tlmSrvTrk(`${n}Slc`);
    const cmp = new cmpPlcEnf(`${n}Plc`);
    const aCkBkr = new brkCrcCtl(`${n}ApCl`);
    const extSrv = new ExtSrvCon(dynSrvR);

    const qryStrSlc = selCrt(
        (st) => sSl(st).q,
        (q) => qryStrCmprs(objFlt(q), "brackets"),
    );

    const fQryStrSlc = selCrt(
        (st) => sSl(st).q,
        (st) => sSl(st).pgN,
        (q, pgN) =>
        qryStrCmprs({
                ...objFlt(q),
                ...{
                    pg: pgN.pg,
                    pPg: pgN.pPg
                },
            },
            "brackets",
        ),
    );

    const slcR = selCrt(
        (st) => sSl(st).ld,
        (st) => sSl(st).pgN,
        sSlcS.selectAll,
        (st) => sSl(st).q,
        qryStrSlc,
        (st) => sSl(st).gC,
        (ld, pgN, d, q, qS, gC) => ({
            ld,
            pgN,
            d,
            q,
            qS,
            gC,
        }),
    );

    const dspEnt = thkCrt(`${n}/dspEnt`, async (eI, {
        d,
        gS
    }) => {
        tlm.trcEvt('sh_ent_rqst', {
            eI,
            slc: n
        });
        const uC = {
            uI: 'gmni-uSr-123',
            rLs: ['adMn']
        };

        const pPR = await gAI.pP(`vLdt eI fR sh oPrT`, {
            eI,
            uC
        });
        await tlm.lgMtr('gmni_pP_tM', pPR.t);

        if (!await cmp.chPlc('RD', {
                eI
            }, uC)) {
            tlm.cptErr(new Error('Cmp vLtN fR sh oPrT'), {
                eI,
                uC
            });
            throw new Error("Acc dNd dT tO cmp pLcy.");
        }

        let r;
        try {
            const aGw = await dynSrvR.gSU('api_gw');
            if (!aGw) { throw new Error("ApGw sRv nOt aVlbL."); }
            r = await aCkBkr.eXc(gtExtDta, `${aGw}${rP}/${eI}/load`);
            tlm.trcEvt('sh_ent_sCs', {
                eI,
                slc: n
            });
            await cmp.adtAct(`Rd ent ${eI}`, {
                slc: n,
                uC
            });
        } catch (e) {
            tlm.cptErr(e, {
                eI,
                slc: n,
                o: 'sh'
            });
            await gAI.lFI({
                t: 'sh_fLr',
                d: {
                    eI
                },
                o: 'eR',
                e: e.message
            });
            throw e;
        }

        const dta = await r.json();
        const pSR = await gAI.dAnlz(dta, 'ent_rsp');
        await gAI.lFI({
            t: 'sh_sCs',
            d: {
                eI
            },
            o: 'sCs',
            a: pSR
        });
        d(slc.actns.gAICntxtUpd({
            lSA: pSR
        }));
        return dta;
    });

    const dfSrhPrm = {
        rSt: true,
        aIOpt: true,
    };

    const fndEnts = thkCrt(
        `${n}/fndEnts`,
        async (a = {}, {
            gS,
            rI,
            d
        }) => {
            const st = gS();
            const {
                ld: cLd,
                cRI: cRqstI,
                q: cQ
            } = sSl(st);
            const uC = {
                uI: 'gmni-uSr-123',
                rLs: ['adMn']
            };

            tlm.trcEvt('srh_ent_rqst', {
                a,
                slc: n
            });

            const o = { ...dfSrhPrm,
                ...a
            };

            if (!cLd || rI !== cRqstI) {
                tlm.lgMtr('srh_skpd_rdndt', 1, {
                    slc: n
                });
                return null;
            }

            let eQ = cQ;
            if (o.aIOpt) {
                const qAn = await gAI.dAnlz(eQ, 'qry');
                const aD = await gAI.pP(`Opt sRh qRy fR ${n}`, {
                    q: eQ,
                    a: qAn
                });
                if (aD.d === 'AI_DSSN_FR_OPT_SRH_QRY') {
                    eQ = { ...eQ,
                        aI_bSt: true,
                        ...(aD.sG ? {
                            sgsT_flt: aD.sG[0]
                        } : {})
                    };
                    d(slc.actns.gAICntxtUpd({
                        lQOpt: aD
                    }));
                }
            }

            if (!await cmp.chPlc('RD_SRH', eQ, uC)) {
                tlm.cptErr(new Error('Cmp vLtN fR sRh oPrT'), {
                    q: eQ,
                    uC
                });
                throw new Error("Srh dNd dT tO cmp pLcy.");
            }

            const qS = `?${qryStrCmprs({ ...objFlt(eQ), ...sSl(st).pgN}, "brackets")}`;

            if (o.rSt) {
                if (typeof simulatedWindow !== 'undefined' && simulatedWindow.history) {
                    simulatedWindow.history.replaceState(null, '', qS);
                }
            }

            let r;
            try {
                const aGw = await dynSrvR.gSU('api_gw');
                if (!aGw) { throw new Error("ApGw sRv nOt aVlbL fR sRh."); }
                r = await aCkBkr.eXc(gtExtDta, `${aGw}${rP}/search${qS}`);
                tlm.trcEvt('srh_ent_sCs', {
                    q: eQ,
                    slc: n
                });
                await cmp.adtAct(`SrchD ents`, {
                    q: eQ,
                    slc: n,
                    uC
                });
            } catch (e) {
                tlm.cptErr(e, {
                    q: eQ,
                    slc: n,
                    o: 'sRh'
                });
                await gAI.lFI({
                    t: 'srh_fLr',
                    d: {
                        q: eQ
                    },
                    o: 'eR',
                    e: e.message
                });
                const aED = await gAI.pP('HndL sRh eR grCfLlY', {
                    e: e.message,
                    q: eQ
                });
                d(slc.actns.gAICntxtUpd({
                    lSEH: aED
                }));
                throw e;
            }

            const b = await r.json();
            const pgN = {
                pg: parseInt(r.hdrs.get("X-Pg"), 10) || 1,
                pPg: parseInt(r.hdrs.get("X-P-Pg"), 10) || 25,
                t: parseInt(r.hdrs.get("X-TtCnt"), 10) || 0,
                pgLB: parseInt(r.hdrs.get("X-Pg-LB"), 10) || 0,
                pgUB: parseInt(r.hdrs.get("X-Pg-UB"), 10) || 0,
                hBPg: chkBPg(r.hdrs.get("Lnk")),
                hNPg: chkNPg(r.hdrs.get("Lnk")),
            };

            await gAI.lFI({
                t: 'srh_sCs',
                d: {
                    q: eQ,
                    pgN
                },
                o: 'sCs',
                rC: b.length
            });
            d(slc.actns.gAICntxtUpd({
                lSC: {
                    q: eQ,
                    pgN
                }
            }));

            return {
                b,
                pgN
            };
        },
    );

    const strEnt = thkCrt(
        `${n}/strEnt`,
        async ({
            eI,
            dta
        }, {
            gS,
            rI,
            d
        }) => {
            const st = gS();
            const {
                ld: cLd,
                cRI: cRqstI
            } = sSl(st);
            const uC = {
                uI: 'gmni-uSr-123',
                rLs: ['adMn']
            };

            tlm.trcEvt('sv_ent_rqst', {
                eI,
                slc: n,
                dKs: Object.keys(dta)
            });

            if (!cLd || rI !== cRqstI) {
                tlm.lgMtr('sv_skpd_rdndt', 1, {
                    slc: n
                });
                return null;
            }

            const vR = await gAI.dAnlz(dta, 'ent_pLd');
            if (vR.w.length > 0) {
                // console.warn(`[gAI - ${n}] Dta vLdtN wRngS fR sv:`, vR.w);
            }
            d(slc.actns.gAICntxtUpd({
                lSV: vR
            }));

            if (!await cmp.chPlc('WRT', dta, uC)) {
                tlm.cptErr(new Error('Cmp vLtN fR sv oPrT'), {
                    eI,
                    dta,
                    uC
                });
                throw new Error("Sv dNd dT tO cmp pLcy.");
            }

            const bdy = JSON.stringify(dta);
            let r;
            try {
                const aGw = await dynSrvR.gSU('api_gw');
                if (!aGw) { throw new Error("ApGw sRv nOt aVlbL fR sv."); }
                r = await aCkBkr.eXc(
                    gtExtDta,
                    `${aGw}${rP}/${eI}`,
                    "PATCH",
                    bdy,
                    "appl/jSn",
                );
                tlm.trcEvt('sv_ent_sCs', {
                    eI,
                    slc: n
                });
                await cmp.adtAct(`SvD ent ${eI}`, {
                    dKs: Object.keys(dta),
                    slc: n,
                    uC
                });
            } catch (e) {
                tlm.cptErr(e, {
                    eI,
                    slc: n,
                    o: 'sv'
                });
                await gAI.lFI({
                    t: 'sv_fLr',
                    d: {
                        eI,
                        dta
                    },
                    o: 'eR',
                    e: e.message
                });
                throw e;
            }

            const sD = await r.json();
            await gAI.lFI({
                t: 'sv_sCs',
                d: {
                    eI,
                    sD
                },
                o: 'sCs'
            });
            return sD;
        },
    );

    const crtEnt = thkCrt(
        `${n}/crtEnt`,
        async (dta, {
            gS,
            rI,
            d
        }) => {
            const st = gS();
            const {
                ld: cLd,
                cRI: cRqstI
            } = sSl(st);
            const uC = {
                uI: 'gmni-uSr-123',
                rLs: ['adMn']
            };

            tlm.trcEvt('crt_ent_rqst', {
                slc: n,
                dKs: Object.keys(dta)
            });

            if (!cLd || rI !== cRqstI) {
                tlm.lgMtr('crt_skpd_rdndt', 1, {
                    slc: n
                });
                return null;
            }

            const vR = await gAI.dAnlz(dta, 'ent_crt_pLd');
            d(slc.actns.gAICntxtUpd({
                lCV: vR
            }));

            if (!await cmp.chPlc('CRT', dta, uC)) {
                tlm.cptErr(new Error('Cmp vLtN fR crt oPrT'), {
                    dta,
                    uC
                });
                throw new Error("Crt dNd dT tO cmp pLcy.");
            }

            const bdy = JSON.stringify(dta);
            let r;
            try {
                const aGw = await dynSrvR.gSU('api_gw');
                if (!aGw) { throw new Error("ApGw sRv nOt aVlbL fR crt."); }
                r = await aCkBkr.eXc(gtExtDta, `${aGw}${rP}`, "POST", bdy, "appl/jSn");
                tlm.trcEvt('crt_ent_sCs', {
                    slc: n
                });
                await cmp.adtAct(`CrtD ent`, {
                    dKs: Object.keys(dta),
                    slc: n,
                    uC
                });
            } catch (e) {
                tlm.cptErr(e, {
                    slc: n,
                    o: 'crt'
                });
                await gAI.lFI({
                    t: 'crt_fLr',
                    d: {
                        dta
                    },
                    o: 'eR',
                    e: e.message
                });
                throw e;
            }
            const cD = await r.json();
            await gAI.lFI({
                t: 'crt_sCs',
                d: {
                    cD
                },
                o: 'sCs'
            });
            return cD;
        }
    );

    const rmvEnt = thkCrt(
        `${n}/rmvEnt`,
        async (eI, {
            gS,
            rI,
            d
        }) => {
            const st = gS();
            const {
                ld: cLd,
                cRI: cRqstI
            } = sSl(st);
            const uC = {
                uI: 'gmni-uSr-123',
                rLs: ['adMn']
            };

            tlm.trcEvt('rmv_ent_rqst', {
                eI,
                slc: n
            });

            if (!cLd || rI !== cRqstI) {
                tlm.lgMtr('rmv_skpd_rdndt', 1, {
                    slc: n
                });
                return null;
            }

            if (!await cmp.chPlc('DLT', {
                    eI
                }, uC)) {
                tlm.cptErr(new Error('Cmp vLtN fR rmv oPrT'), {
                    eI,
                    uC
                });
                throw new Error("Rmv dNd dT tO cmp pLcy.");
            }

            try {
                const aGw = await dynSrvR.gSU('api_gw');
                if (!aGw) { throw new Error("ApGw sRv nOt aVlbL fR rmv."); }
                await aCkBkr.eXc(gtExtDta, `${aGw}${rP}/${eI}`, "DELETE");
                tlm.trcEvt('rmv_ent_sCs', {
                    eI,
                    slc: n
                });
                await cmp.adtAct(`RmvD ent ${eI}`, {
                    slc: n,
                    uC
                });
            } catch (e) {
                tlm.cptErr(e, {
                    eI,
                    slc: n,
                    o: 'rmv'
                });
                await gAI.lFI({
                    t: 'rmv_fLr',
                    d: {
                        eI
                    },
                    o: 'eR',
                    e: e.message
                });
                throw e;
            }
            await gAI.lFI({
                t: 'rmv_sCs',
                d: {
                    eI
                },
                o: 'sCs'
            });
            return eI;
        }
    );

    const bchUpd = thkCrt(
        `${n}/bchUpd`,
        async (ds, {
            gS,
            rI,
            d
        }) => {
            const st = gS();
            const {
                ld: cLd,
                cRI: cRqstI
            } = sSl(st);
            const uC = {
                uI: 'gmni-uSr-123',
                rLs: ['adMn']
            };

            tlm.trcEvt('bch_upd_rqst', {
                slc: n,
                cnt: ds.length
            });

            if (!cLd || rI !== cRqstI) {
                tlm.lgMtr('bch_upd_skpd_rdndt', 1, {
                    slc: n
                });
                return null;
            }

            const vRs = await Promise.all(ds.map(e => gAI.dAnlz(e, 'bch_ent_pLd')));
            d(slc.actns.gAICntxtUpd({
                lBUV: vRs
            }));

            if (!await cmp.chPlc('WRT_BCH', ds, uC)) {
                tlm.cptErr(new Error('Cmp vLtN fR bch upd oPrT'), {
                    ds,
                    uC
                });
                throw new Error("Bch upd dNd dT tO cmp pLcy.");
            }

            const bdy = JSON.stringify(ds);
            let r;
            try {
                const aGw = await dynSrvR.gSU('api_gw');
                if (!aGw) { throw new Error("ApGw sRv nOt aVlbL fR bch upd."); }
                r = await aCkBkr.eXc(
                    gtExtDta,
                    `${aGw}${rP}/batch`,
                    "PUT",
                    bdy,
                    "appl/jSn",
                );
                tlm.trcEvt('bch_upd_sCs', {
                    slc: n,
                    cnt: ds.length
                });
                await cmp.adtAct(`Bch UpdD ents`, {
                    cnt: ds.length,
                    slc: n,
                    uC
                });
            } catch (e) {
                tlm.cptErr(e, {
                    slc: n,
                    o: 'bchUpd'
                });
                await gAI.lFI({
                    t: 'bchUpd_fLr',
                    d: {
                        ds
                    },
                    o: 'eR',
                    e: e.message
                });
                throw e;
            }

            const uD = await r.json();
            await gAI.lFI({
                t: 'bchUpd_sCs',
                d: {
                    uD
                },
                o: 'sCs'
            });
            return uD;
        }
    );

    const iSt = {
        q: {},
        pgN: {
            t: 0,
            pg: 1,
            pPg: 25,
        },
        ld: false,
        cRI: null,
        gC: {},
        rI: 0
    };

    const slc = slcCrt({
        n,
        iS: a.gIS(iSt),
        rds: {
            sngSet: (st, aCt) => {
                const {
                    p
                } = aCt;
                const mD = gAI.pP('Dcd oN sNgSet mRg strtGy', {
                    crnt: st.entities[p.id],
                    inC: p
                }).d;
                if (mD === 'AI_DSSN_FR_OPT_MRG') {
                    st.entities[p.id] = { ...st.entities[p.id],
                        ...p,
                        _aIMrgD: true
                    };
                } else {
                    st.entities[p.id] = p;
                }
            },
            totSet: a.setAll,
            sngUpd: a.updateOne,
            qryUpd: (st, aCt) => {
                st.q = { ...st.q,
                    ...aCt.p
                };
                tlm.trcEvt('qry_upd', {
                    slc: n,
                    nQry: aCt.p
                });
            },
            pgUpd: (st, aCt) => {
                st.pgN = { ...st.pgN,
                    ...aCt.p
                };
                tlm.trcEvt('pgN_upd', {
                    slc: n,
                    nPgN: aCt.p
                });
            },
            gAICntxtUpd: (st, aCt) => {
                st.gC = { ...st.gC,
                    ...aCt.p,
                    lUpd: new Date().toISOString()
                };
            },
        },
        eRds: {
            [strEnt.pnd]: (st, aCt) => {
                if (!st.ld) {
                    st.ld = true;
                    st.cRI = aCt.meta.requestId;
                    tlm.lgMtr('sv_pnd', 1, {
                        slc: n
                    });
                    st.gC.lA = {
                        t: 'sv',
                        s: 'pnd',
                        rI: aCt.meta.requestId
                    };
                }
            },
            [strEnt.ful]: (st, aCt) => {
                if (st.ld && st.cRI === aCt.meta.requestId) {
                    const {
                        eI
                    } = aCt.meta.arg;
                    a.upsertOne(st, aCt.payload);
                    st.ld = false;
                    st.cRI = null;
                    tlm.lgMtr('sv_ful', 1, {
                        slc: n
                    });
                    st.gC.lA = {
                        t: 'sv',
                        s: 'ful',
                        eI: aCt.payload.id || eI,
                        ts: new Date().toISOString()
                    };
                }
            },
            [strEnt.rjt]: (st, aCt) => {
                if (st.ld && st.cRI === aCt.meta.requestId) {
                    st.ld = false;
                    st.cRI = null;
                    tlm.lgMtr('sv_rjt', 1, {
                        slc: n,
                        e: aCt.error.message
                    });
                    st.gC.lA = {
                        t: 'sv',
                        s: 'rjt',
                        e: aCt.error.message,
                        ts: new Date().toISOString()
                    };
                    st.gC.eH = [
                        ...(st.gC.eH || []), {
                            a: 'sv',
                            e: aCt.error.message,
                            ts: new Date().toISOString()
                        }
                    ];
                }
            },
            [crtEnt.pnd]: (st, aCt) => {
                if (!st.ld) {
                    st.ld = true;
                    st.cRI = aCt.meta.requestId;
                    tlm.lgMtr('crt_pnd', 1, {
                        slc: n
                    });
                    st.gC.lA = {
                        t: 'crt',
                        s: 'pnd',
                        rI: aCt.meta.requestId
                    };
                }
            },
            [crtEnt.ful]: (st, aCt) => {
                if (st.ld && st.cRI === aCt.meta.requestId) {
                    a.addOne(st, aCt.payload);
                    st.ld = false;
                    st.cRI = null;
                    tlm.lgMtr('crt_ful', 1, {
                        slc: n
                    });
                    st.gC.lA = {
                        t: 'crt',
                        s: 'ful',
                        eI: aCt.payload.id,
                        ts: new Date().toISOString()
                    };
                }
            },
            [crtEnt.rjt]: (st, aCt) => {
                if (st.ld && st.cRI === aCt.meta.requestId) {
                    st.ld = false;
                    st.cRI = null;
                    tlm.lgMtr('crt_rjt', 1, {
                        slc: n,
                        e: aCt.error.message
                    });
                    st.gC.lA = {
                        t: 'crt',
                        s: 'rjt',
                        e: aCt.error.message,
                        ts: new Date().toISOString()
                    };
                    st.gC.eH = [
                        ...(st.gC.eH || []), {
                            a: 'crt',
                            e: aCt.error.message,
                            ts: new Date().toISOString()
                        }
                    ];
                }
            },
            [rmvEnt.pnd]: (st, aCt) => {
                if (!st.ld) {
                    st.ld = true;
                    st.cRI = aCt.meta.requestId;
                    tlm.lgMtr('rmv_pnd', 1, {
                        slc: n
                    });
                    st.gC.lA = {
                        t: 'rmv',
                        s: 'pnd',
                        rI: aCt.meta.requestId
                    };
                }
            },
            [rmvEnt.ful]: (st, aCt) => {
                if (st.ld && st.cRI === aCt.meta.requestId) {
                    a.removeOne(st, aCt.payload);
                    st.ld = false;
                    st.cRI = null;
                    tlm.lgMtr('rmv_ful', 1, {
                        slc: n
                    });
                    st.gC.lA = {
                        t: 'rmv',
                        s: 'ful',
                        eI: aCt.payload,
                        ts: new Date().toISOString()
                    };
                }
            },
            [rmvEnt.rjt]: (st, aCt) => {
                if (st.ld && st.cRI === aCt.meta.requestId) {
                    st.ld = false;
                    st.cRI = null;
                    tlm.lgMtr('rmv_rjt', 1, {
                        slc: n,
                        e: aCt.error.message
                    });
                    st.gC.lA = {
                        t: 'rmv',
                        s: 'rjt',
                        e: aCt.error.message,
                        ts: new Date().toISOString()
                    };
                    st.gC.eH = [
                        ...(st.gC.eH || []), {
                            a: 'rmv',
                            e: aCt.error.message,
                            ts: new Date().toISOString()
                        }
                    ];
                }
            },
            [bchUpd.pnd]: (st, aCt) => {
                if (!st.ld) {
                    st.ld = true;
                    st.cRI = aCt.meta.requestId;
                    tlm.lgMtr('bch_upd_pnd', 1, {
                        slc: n
                    });
                    st.gC.lA = {
                        t: 'bchUpd',
                        s: 'pnd',
                        rI: aCt.meta.requestId
                    };
                }
            },
            [bchUpd.ful]: (st, aCt) => {
                if (st.ld && st.cRI === aCt.meta.requestId) {
                    aCt.payload.forEach(uE => a.upsertOne(st, uE));
                    st.ld = false;
                    st.cRI = null;
                    tlm.lgMtr('bch_upd_ful', 1, {
                        slc: n,
                        cnt: aCt.payload.length
                    });
                    st.gC.lA = {
                        t: 'bchUpd',
                        s: 'ful',
                        uECnt: aCt.payload.length,
                        ts: new Date().toISOString()
                    };
                }
            },
            [bchUpd.rjt]: (st, aCt) => {
                if (st.ld && st.cRI === aCt.meta.requestId) {
                    st.ld = false;
                    st.cRI = null;
                    tlm.lgMtr('bch_upd_rjt', 1, {
                        slc: n,
                        e: aCt.error.message
                    });
                    st.gC.lA = {
                        t: 'bchUpd',
                        s: 'rjt',
                        e: aCt.error.message,
                        ts: new Date().toISOString()
                    };
                    st.gC.eH = [
                        ...(st.gC.eH || []), {
                            a: 'bchUpd',
                            e: aCt.error.message,
                            ts: new Date().toISOString()
                        }
                    ];
                }
            },
            [fndEnts.pnd]: (st, aCt) => {
                if (!st.ld) {
                    st.ld = true;
                    st.cRI = aCt.meta.requestId;
                    tlm.lgMtr('srh_pnd', 1, {
                        slc: n
                    });
                    st.gC.lA = {
                        t: 'srh',
                        s: 'pnd',
                        rI: aCt.meta.requestId
                    };
                }
            },
            [fndEnts.ful]: (st, aCt) => {
                if (st.ld && st.cRI === aCt.meta.requestId) {
                    a.setAll(st, aCt.payload.b);

                    st.ld = false;
                    st.cRI = null;
                    st.pgN = aCt.payload.pgN;
                    tlm.lgMtr('srh_ful', 1, {
                        slc: n,
                        cnt: aCt.payload.b.length
                    });
                    st.gC.lA = {
                        t: 'srh',
                        s: 'ful',
                        rC: aCt.payload.b.length,
                        ts: new Date().toISOString()
                    };
                }
            },
            [fndEnts.rjt]: (st, aCt) => {
                if (st.ld && st.cRI === aCt.meta.requestId) {
                    st.ld = false;
                    st.cRI = null;
                    tlm.lgMtr('srh_rjt', 1, {
                        slc: n,
                        e: aCt.error.message
                    });
                    st.gC.lA = {
                        t: 'srh',
                        s: 'rjt',
                        e: aCt.error.message,
                        ts: new Date().toISOString()
                    };
                    st.gC.eH = [
                        ...(st.gC.eH || []), {
                            a: 'srh',
                            e: aCt.error.message,
                            ts: new Date().toISOString()
                        }
                    ];
                }
            },
            [dspEnt.pnd]: (st, aCt) => {
                if (!st.ld) {
                    st.ld = true;
                    st.cRI = aCt.meta.requestId;
                    tlm.lgMtr('sh_pnd', 1, {
                        slc: n
                    });
                    st.gC.lA = {
                        t: 'sh',
                        s: 'pnd',
                        rI: aCt.meta.requestId
                    };
                }
            },
            [dspEnt.ful]: (st, aCt) => {
                if (st.ld && st.cRI === aCt.meta.requestId) {
                    a.upsertOne(st, aCt.payload);
                    st.ld = false;
                    st.cRI = null;
                    tlm.lgMtr('sh_ful', 1, {
                        slc: n
                    });
                    st.gC.lA = {
                        t: 'sh',
                        s: 'ful',
                        eI: aCt.payload.id,
                        ts: new Date().toISOString()
                    };
                }
            },
            [dspEnt.rjt]: (st, aCt) => {
                if (st.ld && st.cRI === aCt.meta.requestId) {
                    st.ld = false;
                    st.cRI = null;
                    tlm.lgMtr('sh_rjt', 1, {
                        slc: n,
                        e: aCt.error.message
                    });
                    st.gC.lA = {
                        t: 'sh',
                        s: 'rjt',
                        e: aCt.error.message,
                        ts: new Date().toISOString()
                    };
                    st.gC.eH = [
                        ...(st.gC.eH || []), {
                            a: 'sh',
                            e: aCt.error.message,
                            ts: new Date().toISOString()
                        }
                    ];
                }
            },
        },
    });

    slc.actns.fndEnts = fndEnts;
    slc.actns.dspEnt = dspEnt;
    slc.actns.strEnt = strEnt;
    slc.actns.crtEnt = crtEnt;
    slc.actns.rmvEnt = rmvEnt;
    slc.actns.bchUpd = bchUpd;

    const oCR = cRcs;
    cRcs = (st = {}, a) => {
        const nSt = oCR(st, a);
        if (a.type.startsWith(n)) {
            nSt[n] = slc.rcr(nSt[n], a);
        } else if (!nSt[n]) {
            nSt[n] = slc.rcr(undefined, { type: '@@INIT' });
        }
        return nSt;
    };
    upGblRcr(cRcs);


    return {
        slc,
        a,
        slcR,
        gAI,
        tlm,
        cmp,
        aCkBkr,
        extSrv,
        glD: gblDspch,
        glGS: gblGtStt,
    };
}