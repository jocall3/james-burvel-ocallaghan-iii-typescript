const cbu = "citibankdemobusiness.dev";
const cnm = "Citibank demo business Inc";

type Vl = string | number | boolean | null | undefined | object | any[];
type Fn<T, R> = (a?: T) => R;
type EfCln = () => void;
type StUpt<T> = (p: T) => T;
type SttSet<T> = Fn<T | StUpt<T>, void>;
type SttR<T> = [T, SttSet<T>];

function stPrd<T>(i: T): SttR<T> {
  let v: T = i;
  const s: SttSet<T> = (n: T | StUpt<T>) => {
    if (typeof n === 'function') {
      v = (n as StUpt<T>)(v);
    } else {
      v = n;
    }
  };
  return [v, s];
}

function efPrc(cb: () => void | EfCln, ds?: Vl[] | null) {
  cb();
}

type Chd = Vl | { t: string; p: { [k: string]: Vl }; c?: Chd[] };
type RndEl = { t: string; p: { [k: string]: Vl }; c?: Chd[] };
type CmpMkr<P> = Fn<P, RndEl>;

function mkDiv(p?: { [k: string]: Vl }, c?: Chd[]): RndEl { return { t: "dv", p: p || {}, c: c || [] }; }
function mkSpn(p?: { [k: string]: Vl }, c?: Chd[]): RndEl { return { t: "spn", p: p || {}, c: c || [] }; }
function mkBtn(p?: { [k: string]: Vl }, c?: Chd[]): RndEl { return { t: "btn", p: p || {}, c: c || [] }; }
function mkHdr(l: number, p?: { [k: string]: Vl }, c?: Chd[]): RndEl { return { t: `h${l}`, p: p || {}, c: c || [] }; }
function mkInp(p?: { [k: string]: Vl }): RndEl { return { t: "inp", p: p || {}, c: [] }; }
function mkOpt(p?: { [k: string]: Vl }, c?: Chd[]): RndEl { return { t: "opt", p: p || {}, c: c || [] }; }
function mkSlc(p?: { [k: string]: Vl }, c?: Chd[]): RndEl { return { t: "slc", p: p || {}, c: c || [] }; }
function mkTbl(p?: { [k: string]: Vl }, c?: Chd[]): RndEl { return { t: "tbl", p: p || {}, c: c || [] }; }
function mkThd(p?: { [k: string]: Vl }, c?: Chd[]): RndEl { return { t: "thd", p: p || {}, c: c || [] }; }
function mkTrw(p?: { [k: string]: Vl }, c?: Chd[]): RndEl { return { t: "trw", p: p || {}, c: c || [] }; }
function mkTdh(p?: { [k: string]: Vl }, c?: Chd[]): RndEl { return { t: "tdh", p: p || {}, c: c || [] }; }
function mkTbd(p?: { [k: string]: Vl }, c?: Chd[]): RndEl { return { t: "tbd", p: p || {}, c: c || [] }; }

interface EntDef { i: string; n: string; d?: string; }
interface MnyVl { k: string; v: number; c: string; }
interface BnkAg { i: string; n: string; d: string; ls: MnyVl[]; ic?: { tC?: number }; p?: string; ac?: string; avB?: string; ldB?: string; gmRS?: number; }
interface PgnDtl { f?: number; a?: string; b?: string; }
interface CrnInf { v: string; l: string; }

interface SvcMdl {
    i: string;
    n: string;
    d: string;
    eP: string;
    t: "AI" | "PMT" | "CRM" | "SCM" | "ERP" | "SEC" | "DEV" | "ANL" | "DBS" | "API";
    hT: number;
    lC: number;
    fC: number;
    lsU: number;
}

const exSvcL: SvcMdl[] = [];

const aiSvs = [
    { i: "GMN", n: "Gemini AI Core", d: "Adv AI Ops", eP: "/gmn", t: "AI" },
    { i: "CHTGPT", n: "ChatGPT Logic", d: "Conv AI Ops", eP: "/chtgpt", t: "AI" },
    { i: "HGFACS", n: "Hugging Face ML", d: "ML Ppl", eP: "/hgf", t: "AI" },
];

const fnSvs = [
    { i: "PLD", n: "Plaid Conn", d: "Fnc Lnk Ops", eP: "/pld", t: "PMT" },
    { i: "MDTRSY", n: "Modern Treasury P", d: "Trsry Mg", eP: "/mdt", t: "PMT" },
    { i: "MQETA", n: "Marqeta Crd Iss", d: "Crd Ops", eP: "/mqeta", t: "PMT" },
    { i: "CTBNK", n: "Citibank Bnk Svc", d: "Bnk Ops", eP: "/ctbnk", t: "PMT" },
    { i: "ORCL", n: "Oracle Fnc Mdl", d: "ERP Fnc", eP: "/orcl", t: "ERP" },
];

const cldSvs = [
    { i: "GGLDRV", n: "Google Drive Ops", d: "File Ops", eP: "/ggldrv", t: "DBS" },
    { i: "ONEDRV", n: "OneDrive Sync", d: "File Ops", eP: "/onedrv", t: "DBS" },
    { i: "AZRE", n: "Azure Cld Infra", d: "Cld Svc", eP: "/azre", t: "API" },
    { i: "GGLCLD", n: "Google Cloud P", d: "Cld Svc", eP: "/gglcld", t: "API" },
    { i: "SPBASE", n: "Supabase DB", d: "DBS Svc", eP: "/spbase", t: "DBS" },
    { i: "VRVET", n: "Vervet Dta Rpr", d: "DBS Svc", eP: "/vrvet", t: "DBS" },
];

const crmSvs = [
    { i: "SLSFOR", n: "Salesforce CRM", d: "Cust Rel Mg", eP: "/slsfor", t: "CRM" },
];

const eCmSvs = [
    { i: "SHPIFY", n: "Shopify Str Frnt", d: "Ecm Ops", eP: "/shpify", t: "SCM" },
    { i: "WOMCR", n: "WooCommerce P", d: "Ecm Ops", eP: "/womcr", t: "SCM" },
    { i: "GODDY", n: "GoDaddy Dmn Mg", d: "Web Hst", eP: "/goddy", t: "API" },
    { i: "CPANEL", n: "CPanel Mgmt", d: "Web Hst", eP: "/cpanel", t: "API" },
];

const dEvSvs = [
    { i: "GTHB", n: "GitHub Rpo", d: "Dev Ops", eP: "/gthb", t: "DEV" },
    { i: "PPDRM", n: "Pipedream WrkF", d: "Dev Ops", eP: "/ppdrm", t: "DEV" },
    { i: "TWILIO", n: "Twilio Cmn", d: "Msg Svc", eP: "/twilio", t: "API" },
    { i: "ADOBE", n: "Adobe Crtv", d: "Crtv Sft", eP: "/adobe", t: "API" },
];

const allInitialServices = [
    ...aiSvs, ...fnSvs, ...cldSvs, ...crmSvs, ...eCmSvs, ...dEvSvs,
];

let svcCt = allInitialServices.length;
for (let i = 0; i < allInitialServices.length; i++) {
    exSvcL.push(allInitialServices[i]);
}

while (svcCt < 1000) {
    const sId = `SVC${String(svcCt).padStart(4, '0')}`;
    const sNm = `SysComp${svcCt}`;
    const sDs = `Sys Comp Desc ${svcCt}`;
    const sEp = `/sysc/${svcCt}`;
    const sTyps = ["AI", "PMT", "CRM", "SCM", "ERP", "SEC", "DEV", "ANL", "DBS", "API"];
    const sTyp = sTyps[Math.floor(Math.random() * sTyps.length)] as SvcMdl['t'];
    exSvcL.push({
        i: sId,
        n: sNm,
        d: sDs,
        eP: sEp,
        t: sTyp,
        hT: 0.8,
        lC: Math.random() * 500,
        fC: 0,
        lsU: Date.now(),
    });
    svcCt++;
}

type LgE = { eN: string; c: string; d: { [k: string]: Vl }; tS: number; };
type TlmE = { eN: string; c: string; d: { [k: string]: Vl }; tS: number; };
type CrP = boolean;
type RtD = number;
type LsF = number;
type LmE = string;

class GblTlmSvc {
    private static i: GblTlmSvc;
    private evB: TlmE[] = [];
    private lmEp: LmE = `https://${cbu}/api/tlm/evs`;
    private crP: CrP = false;
    private lsF: LsF = 0;
    private rtD: RtD = 5000;
    private stID: any;
    private origRcdEv: (eventName: string, details?: Object) => void;

    private constructor() {
        this.strEvSnd();
        this.origRcdEv = this.rcdEv.bind(this);
    }

    public static gtIns(): GblTlmSvc {
        if (!GblTlmSvc.i) { GblTlmSvc.i = new GblTlmSvc(); }
        return GblTlmSvc.i;
    }

    public rcdEv(eN: string, dT: { [k: string]: Vl } = {}) {
        const e: TlmE = {
            eN,
            c: "CtbAgCmp",
            d: { ...dT, uID: "AI_CST_ID_888" },
            tS: Date.now(),
        };
        this.evB.push(e);
        evPrc.prcsEv(e);
    }

    private async sEvBff() {
        if (this.evB.length === 0 || this.crP) {
            if (this.crP && Date.now() - this.lsF > this.rtD) { this.crP = false; }
            return;
        }
        const evs = [...this.evB];
        this.evB = [];

        try {
            const rsp = await fetch(this.lmEp, {
                method: "POST",
                headers: { "CttTyp": "application/json", "X-Gmn-Ath": "AI_ATH_TKN_DYN" },
                body: JSON.stringify(evs),
            });
            if (!rsp.ok) { throw new Error(`TlmSndFl: ${rsp.statusText}`); }
            this.origRcdEv("tlmBtSnt", { c: evs.length, s: "sucs" });
        } catch (r) {
            this.evB.unshift(...evs);
            this.crP = true;
            this.lsF = Date.now();
            this.origRcdEv("tlmSndFl", { e: (r as Error).message, c: evs.length });
        }
    }

    private strEvSnd() {
        if (!this.stID) {
            this.stID = setInterval(() => this.sEvBff(), 10000);
        }
    }

    public dmpStp() {
        if (this.stID) {
            clearInterval(this.stID);
            this.stID = null;
        }
    }

    public async oPfm<T>(f: () => Promise<T>, n: string): Promise<T> {
        const sT = performance.now();
        try {
            const r = await f();
            const eT = performance.now();
            this.rcdEv("opPfm", { op: n, dr: eT - sT, s: "sucs" });
            return r;
        } catch (r) {
            const eT = performance.now();
            this.rcdEv("opPfm", { op: n, dr: eT - sT, s: "fl", e: (r as Error).message });
            throw r;
        }
    }
}
export const gTlm = GblTlmSvc.gtIns();

type UsrPrf = Map<string, Vl>;
type HstQ = Array<Object>;
type PrdMd = Fn<any, Object>;

class GblDcnEgn {
    private static i: GblDcnEgn;
    private tlm: GblTlmSvc;
    private uPr: UsrPrf = new Map();
    private hQ: HstQ = [];
    private pM: PrdMd = (...a: any[]) => ({});

    private constructor() {
        this.tlm = GblTlmSvc.gtIns();
        this.ldUsrPrf();
    }

    public static gtIns(): GblDcnEgn {
        if (!GblDcnEgn.i) { GblDcnEgn.i = new GblDcnEgn(); }
        return GblDcnEgn.i;
    }

    private ldUsrPrf() {
        this.uPr.set("pPg", 20);
        this.uPr.set("aFC", true);
        this.tlm.rcdEv("gmnPrfLd");
    }

    public gtOptPg(cP: PgnDtl): PgnDtl {
        const pPg = (this.uPr.get("pPg") as number) || 10;
        this.tlm.rcdEv("gmnPgDcn", { c: cP.f, o: pPg });
        return { ...cP, f: pPg };
    }

    public prdUsrInt(cP: string, uA: Object): Object {
        const p = this.pM(cP, uA);
        this.tlm.rcdEv("gmnUsrIntPrd", { cP, uA, p });
        return p;
    }

    public evBsnLgc(lT: string, pL: Object): boolean {
        if (lT === "ath") { return usrSsnMg.hRls("admin") || usrSsnMg.hRls("editor"); }
        if (lT === "cmpDtaAcc") {
            const iS = (pL as any).hasOwnProperty('sBLI');
            if (iS) { this.tlm.rcdEv("cmpVltPtl", { lT, pL }); return false; }
            return true;
        }
        return true;
    }

    public gtPrdFltr(v: string): string[] {
        if (v === "agcV") {
            if (Math.random() > 0.6) return ["d", "gmRS"];
        }
        return [];
    }
}
export const gDcn = GblDcnEgn.gtIns();

type DtaCch = Map<string, { d: Vl, tS: number }>;
type CchTTL = number;

class GblDtaOrc {
    private static i: GblDtaOrc;
    private tlm: GblTlmSvc;
    private dcn: GblDcnEgn;
    private cch: DtaCch = new Map();
    private cTTL: CchTTL = 30000;

    private constructor() {
        this.tlm = GblTlmSvc.gtIns();
        this.dcn = GblDcnEgn.gtIns();
    }

    public static gtIns(): GblDtaOrc {
        if (!GblDtaOrc.i) { GblDtaOrc.i = new GblDtaOrc(); }
        return GblDtaOrc.i;
    }

    public async fDtaWI<T>(
        dF: Fn<any, Promise<{ d: T | null; l: boolean; e: any; rF?: Fn<any, any> }>>,
        cK: string,
        v: Object,
        rT: number = 3,
        dL: number = 1000,
    ): Promise<{ d: T | null; l: boolean; e: any; rF?: Fn<any, any> }> {
        if (this.cch.has(cK) && (Date.now() - this.cch.get(cK)!.tS < this.cTTL)) {
            this.tlm.rcdEv("dtaFtchFrmCch", { cK, v });
            return { d: this.cch.get(cK)!.d as T, l: false, e: undefined };
        }

        this.tlm.rcdEv("dtaFtchAtm", { cK, v });

        for (let x = 0; x < rT; x++) {
            try {
                const r = await this.tlm.oPfm(() => dF(v), `GQL_${cK}`);
                if (r.e) { throw new Error(r.e.m || "GQL err"); }
                this.cch.set(cK, { d: r.d, tS: Date.now() });
                this.tlm.rcdEv("dtaFtchSucs", { cK, v, rA: x });
                return r;
            } catch (r) {
                this.tlm.rcdEv("dtaFtchFl", { cK, v, rA: x, e: (r as Error).message });
                if (x < rT - 1) {
                    await new Promise(res => setTimeout(res, dL * Math.pow(2, x)));
                } else {
                    return { d: null, l: false, e: r };
                }
            }
        }
        return { d: null, l: false, e: new Error("UnkDtaFtchErrAftRtry") };
    }
}
export const gDtaO = GblDtaOrc.gtIns();

type SvcEps = Map<string, string>;

class GblExtSvcReg {
    private static i: GblExtSvcReg;
    private tlm: GblTlmSvc;
    private svEps: SvcEps = new Map();
    private allSvcMdl: SvcMdl[] = [];

    private constructor(sMs: SvcMdl[]) {
        this.tlm = GblTlmSvc.gtIns();
        this.allSvcMdl = sMs;
        this.dcrSvc();
    }

    public static gtIns(sMs: SvcMdl[] = exSvcL): GblExtSvcReg {
        if (!GblExtSvcReg.i) { GblExtSvcReg.i = new GblExtSvcReg(sMs); }
        return GblExtSvcReg.i;
    }

    private dcrSvc() {
        this.allSvcMdl.forEach(s => {
            this.svEps.set(s.i, `https://${cbu}${s.eP}`);
        });
        this.tlm.rcdEv("gmnSvcDsc", { svs: Array.from(this.svEps.keys()) });
    }

    public async clSvc(sN: string, pth: string, pL: Object): Promise<any> {
        const eP = this.svEps.get(sN);
        if (!eP) {
            const r = new Error(`Svc ${sN} nt fnd in reg.`);
            adtLg.rcdAdt(usrSsnMg.gtCsr()?.i || 'anon', `SvcCl_${sN}`, { path: pth, payload: pL, error: r.message }, 'fl');
            this.tlm.rcdEv("svcClFl", { sN, pth, e: r.message });
            throw r;
        }

        adtLg.rcdAdt(usrSsnMg.gtCsr()?.i || 'anon', `SvcCl_${sN}`, { path: pth, payload: pL }, 'sucs');
        this.tlm.rcdEv("svcClAtm", { sN, pth });
        exSvcMn.rcdSvcUsg(sN);
        try {
            const rsp = await fetch(`${eP}${pth}`, {
                method: "POST",
                headers: { "CttTyp": "application/json", "X-Gmn-Ath": "DYN_SVC_ATH_TKN" },
                body: JSON.stringify(pL),
            });

            if (!rsp.ok) { throw new Error(`Svc ${sN} cl fld: ${rsp.statusText}`); }
            const d = await rsp.json();
            this.tlm.rcdEv("svcClSucs", { sN, pth });
            return d;
        } catch (r) {
            adtLg.rcdAdt(usrSsnMg.gtCsr()?.i || 'anon', `SvcCl_${sN}`, { path: pth, payload: pL, error: (r as Error).message }, 'fl');
            this.tlm.rcdEv("svcClFl", { sN, pth, e: (r as Error).message });
            throw r;
        }
    }

    public gtSvc(sN: string): SvcMdl | undefined {
        return this.allSvcMdl.find(s => s.i === sN);
    }

    public upSvcHlth(sN: string, h: number) {
        const s = this.gtSvc(sN);
        if (s) {
            s.hT = h;
            this.tlm.rcdEv("svcHlthUpd", { sN, h });
        }
    }
}
export const gExtSvc = GblExtSvcReg.gtIns(exSvcL);

export async function gnrtAgDs(n: string, c: string): Promise<string> {
    gTlm.rcdEv("llmDsgnRqst", { n, c });
    try {
        const p = `Cr a cns, prf, & cmm-grd dsc fr an acc grp nmd "${n}" prm dln in "${c}". Fcs on its prps wtn a fn cl.`;
        const r = await gExtSvc.clSvc("GMN", "/txt/gnrt", { prm: p, mxT: 100, tmP: 0.7 });
        return r.txt || `AI-gnrtd dsc fr ${n} in ${c}.`;
    } catch (r) {
        return `Dflt dsc fr ${n} in ${c}. (AI gnrt fld)`;
    }
}

export function isFtrAth(fN: string): boolean {
    const a = gDcn.evBsnLgc("ath", { ft: fN, u: usrSsnMg.gtCsr()?.i || "anon" });
    adtLg.rcdAdt(usrSsnMg.gtCsr()?.i || 'anon', `FtrAthChk_${fN}`, { authorized: a }, a ? 'sucs' : 'fl');
    gTlm.rcdEv("ftrAthChk", { fN, a });
    return a;
}

interface GmnSgt {
    i: string;
    t: 'act' | 'dta' | 'flt';
    pL: any;
    m: string;
    c: number;
}

export interface AdptLrnSys {
    prcssInpt(d: any): void;
    gRcm(uC: string): GmnSgt[];
    uPtn(p: string, o: any): void;
    getMdSts(): { [k: string]: Vl };
}

export class UsrAdptMdl implements AdptLrnSys {
    private tlm: GblTlmSvc;
    private dcn: GblDcnEgn;
    private mdlSt: Map<string, Vl> = new Map();
    private uHst: Array<Object> = [];

    constructor() {
        this.tlm = GblTlmSvc.gtIns();
        this.dcn = GblDcnEgn.gtIns();
        this.mdlSt.set("mdlVer", "1.2.0");
        this.mdlSt.set("lUpt", Date.now());
        this.tlm.rcdEv("uamInit", { ver: this.mdlSt.get("mdlVer") });
    }

    prcssInpt(d: any): void {
        this.uHst.push({ t: Date.now(), d });
        if (this.uHst.length > 100) this.uHst.shift();
        this.tlm.rcdEv("uamInptPrc", { dKeys: Object.keys(d) });
    }

    gRcm(uC: string): GmnSgt[] {
        const sgts: GmnSgt[] = [];
        const lH = this.uHst[this.uHst.length - 1] || {};

        if (uC === "agcVw") {
            if (Math.random() > 0.7 && !(lH as any).fltAct) {
                sgts.push({
                    i: 'sgFlAct',
                    t: 'flt',
                    pL: { s: 'act' },
                    m: 'AI sgs flt fr act ags bsd on rct usg ptns.',
                    c: 0.85,
                });
            }
            if (Math.random() > 0.5 && !(lH as any).crtAtm) {
                sgts.push({
                    i: 'sgCrtGrp',
                    t: 'act',
                    pL: { a: 'opCrtMdl' },
                    m: 'It sms u hv no ags. Wld u lk to crt one?',
                    c: 0.92,
                });
            }
            if (Math.random() > 0.6) {
                sgts.push({
                    i: 'sgVwPy',
                    t: 'act',
                    pL: { a: 'navPy', d: 'pymts' },
                    m: 'Usg ptns ind u mgt wnt to vw pymts.',
                    c: 0.78,
                });
            }
        }
        this.tlm.rcdEv("uamRcmGnr", { uC, sgtsC: sgts.length });
        return sgts;
    }

    uPtn(p: string, o: any): void {
        this.mdlSt.set(p, o);
        this.tlm.rcdEv("uamPtnUpd", { p, o });
    }

    getMdSts(): { [k: string]: Vl } {
        return Object.fromEntries(this.mdlSt);
    }
}
export const usrLrn = new UsrAdptMdl();

interface FchRs<T> { d: T | null; l: boolean; e: any; rF?: Fn<any, any>; }

interface AgVwRs {
    accountGroups: {
        edges: {
            node: BnkAg;
        }[];
    };
}

interface CrnTtsRs {
    balancesFeedCurrencyTotals: {
        edges: {
            node: { currency: string; totalAmount: number };
        }[];
    };
}

let mckAgC = 0;
function gnrtMckAg(idx: number): BnkAg {
    const i = `ag-${idx}-${Date.now()}`;
    const n = `AcGrp-${idx}`;
    const d = `Dsc for ${n} by ${cnm}.`;
    const c = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF"][idx % 7];
    const avB = Math.floor(Math.random() * 10000000) / 100;
    const ldB = avB + Math.floor(Math.random() * 500000) / 100 - 2500;

    return {
        i,
        n,
        d,
        ls: [
            { k: "curAv", v: avB * 100, c: c },
            { k: "curLd", v: ldB * 100, c: c },
        ],
        ic: { tC: Math.floor(Math.random() * 20) + 1 },
        p: `/stgs/acgrps/${i}`,
        ac: (Math.floor(Math.random() * 20) + 1).toString(),
        avB: `F${c} ${avB.toFixed(2)}`,
        ldB: `F${c} ${ldB.toFixed(2)}`,
        gmRS: parseFloat((Math.random() * 10).toFixed(2)),
    };
}

async function fchAgVwQry(v: PgnDtl): Promise<FchRs<AgVwRs>> {
    gTlm.rcdEv("fchAgVwQry", { v });
    const c = (v.f || 10) * 2;
    await new Promise(r => setTimeout(r, Math.random() * 1500 + 500));

    const egs = Array.from({ length: c }).map((_, i) => ({ node: gnrtMckAg(mckAgC++) }));
    return {
        d: { accountGroups: { edges: egs } },
        l: false,
        e: undefined,
        rF: fchAgVwQry
    };
}

async function fchBlsFdTtlQry(): Promise<FchRs<CrnTtsRs>> {
    gTlm.rcdEv("fchBlsFdTtlQry");
    await new Promise(r => setTimeout(r, Math.random() * 800 + 200));

    const egs = [
        { node: { currency: "USD", totalAmount: 1234567890 } },
        { node: { currency: "EUR", totalAmount: 9876543210 } },
        { node: { currency: "GBP", totalAmount: 6543210987 } },
        { node: { currency: "JPY", totalAmount: 12300000000 } },
        { node: { currency: "CAD", totalAmount: 5432109870 } },
    ];
    return { d: { balancesFeedCurrencyTotals: { edges: egs } }, l: false, e: undefined };
}

interface PgHdrP { ttl: string; r?: RndEl; ld?: boolean; hB?: boolean; c?: Chd[]; }
const PgHdr: CmpMkr<PgHdrP> = (p) => {
    return mkDiv({ stl: "phd", ld: p.ld }, [
        mkDiv({ stl: "phd-hd" }, [
            mkHdr(1, { stl: "phd-tt" }, [p.ttl]),
            p.r ? mkDiv({ stl: "phd-ra" }, [p.r]) : null,
        ]),
        p.c,
    ].filter(Boolean) as Chd[]);
};

interface BtnP { bT?: "prm" | "scd"; clk?: () => void; sz?: "sml" | "med"; stl?: string; c?: Chd[]; }
const Btn: CmpMkr<BtnP> = (p) => {
    return mkBtn({ clk: p.clk, cls: `btn ${p.bT || "scd"} ${p.sz || "med"}`, stl: p.stl }, p.c);
};

interface EtTblVwP {
    d: BnkAg[]; l: boolean; oQACh: Fn<{ cPP: PgnDtl }, Promise<void>>; r: string; dM: { [k: string]: string }; hC?: string[];
}
const EtTblVw: CmpMkr<EtTblVwP> = (p) => {
    const clms = Object.keys(p.dM).filter(k => !(p.hC || []).includes(k));
    const hds = clms.map(k => p.dM[k]);

    const mkrw = (b: BnkAg) => {
        const c = clms.map(k => mkTdh({}, [String((b as any)[k]) || ""]));
        return mkTrw({}, c);
    };

    return mkDiv({ stl: "etv" }, [
        p.l ? mkSpn({ stl: "ld-spn" }, ["Ld..."]) : null,
        mkTbl({}, [
            mkThd({}, [mkTrw({}, hds.map(h => mkTdh({}, [h]))) as Chd]),
            mkTbd({}, p.d.map(b => mkrw(b)) as Chd[]),
        ]),
        mkDiv({ stl: "pgn-ctrs" }, [
            mkBtn({ clk: () => p.oQACh({ cPP: { f: 10, a: "prev" } }) }, ["Prev"]),
            mkBtn({ clk: () => p.oQACh({ cPP: { f: 10, a: "next" } }) }, ["Next"]),
        ]),
    ].filter(Boolean) as Chd[]);
};

interface CrtAgMdlP { iO: boolean; sCM: () => void; crns: CrnInf[]; iNS?: string; gDAI?: Fn<[string, string], Promise<string>>; }
const CrtAgMdl: CmpMkr<CrtAgMdlP> = (p) => {
    if (!p.iO) return mkDiv({});

    const [nM, setNM] = stPrd(p.iNS || "");
    const [dS, setDS] = stPrd("");
    const [cR, setCR] = stPrd(p.crns.length > 0 ? p.crns[0].v : "");
    const [lDsc, setLDsc] = stPrd(false);

    efPrc(() => {
        if (p.iNS) setNM(p.iNS);
    }, [p.iNS]);

    const gnDscHdl = async () => {
        if (!p.gDAI || !nM || !cR) return;
        setLDsc(true);
        const gD = await p.gDAI(nM, cR);
        setDS(gD);
        setLDsc(false);
    };

    const sbmHdl = () => {
        adtLg.rcdAdt(usrSsnMg.gtCsr()?.i || 'anon', 'CrtAg_Sbm', { name: nM, currency: cR, description: dS }, 'sucs');
        gTlm.rcdEv("crtAgSbm", { nM, dS, cR });
        p.sCM();
    };

    return mkDiv({ stl: "mdl-bkdp" }, [
        mkDiv({ stl: "mdl-ctnt" }, [
            mkHdr(2, {}, ["Crt New Ag"]),
            mkDiv({ stl: "frm-grp" }, [mkSpn({}, ["Nm:"]), mkInp({ val: nM, onChg: (e: any) => setNM(e.target.value) })]),
            mkDiv({ stl: "frm-grp" }, [mkSpn({}, ["Crn:"]), mkSlc({ val: cR, onChg: (e: any) => setCR(e.target.value) },
                p.crns.map(c => mkOpt({ val: c.v }, [c.l])) as Chd[]
            )]),
            mkDiv({ stl: "frm-grp" }, [
                mkSpn({}, ["Dsc:"]),
                mkInp({ val: dS, onChg: (e: any) => setDS(e.target.value) }),
                mkBtn({ clk: gnDscHdl, ld: lDsc, stl: "mgn-lft-sml" }, lDsc ? ["Ld..."] : ["Gnrt Dsc AI"]),
            ]),
            mkDiv({ stl: "mdl-ftr" }, [
                mkBtn({ clk: p.sCM }, ["Cnl"]),
                mkBtn({ bT: "prm", clk: sbmHdl, stl: "mgn-lft" }, ["Crt"]),
            ]),
        ]),
    ]);
};

interface AdtLgE { i: string; uI: string; aT: string; tS: number; dt: any; s: 'sucs' | 'fl'; }
class AdtLgSvc {
    private static i: AdtLgSvc;
    private lgs: AdtLgE[] = [];
    private mxLg: number = 500;
    private tlm: GblTlmSvc;

    private constructor() {
        this.tlm = GblTlmSvc.gtIns();
    }

    public static gtIns(): AdtLgSvc {
        if (!AdtLgSvc.i) { AdtLgSvc.i = new AdtLgSvc(); }
        return AdtLgSvc.i;
    }

    public rcdAdt(uI: string, aT: string, dt: any, s: 'sucs' | 'fl') {
        const l: AdtLgE = { i: `adt-${Date.now()}-${Math.random().toString(36).substring(7)}`, uI, aT, tS: Date.now(), dt, s };
        this.lgs.push(l);
        if (this.lgs.length > this.mxLg) { this.lgs.shift(); }
        this.tlm.rcdEv("adtLgRcd", { uI, aT, s });
    }

    public gtAdtLgs(ct?: number): AdtLgE[] {
        return this.lgs.slice(0, ct || this.mxLg);
    }
}
export const adtLg = AdtLgSvc.gtIns();

interface UsrSsn { i: string; r: string[]; lI: number; e: number; }
class UsrSsnMngr {
    private static i: UsrSsnMngr;
    private tlm: GblTlmSvc;
    private cS: UsrSsn | null = null;

    private constructor() {
        this.tlm = GblTlmSvc.gtIns();
        this.simLgn("usr_demo", ["admin", "editor"]);
    }

    public static gtIns(): UsrSsnMngr {
        if (!UsrSsnMngr.i) { UsrSsnMngr.i = new UsrSsnMngr(); }
        return UsrSsnMngr.i;
    }

    public simLgn(uI: string, rls: string[]) {
        this.cS = { i: uI, r: rls, lI: Date.now(), e: Date.now() + 3600000 };
        this.tlm.rcdEv("usrLgn", { uI, rls });
    }

    public hRls(rN: string): boolean {
        if (!this.cS) return false;
        return this.cS.r.includes(rN);
    }

    public gtCsr(): UsrSsn | null { return this.cS; }
}
export const usrSsnMg = UsrSsnMngr.gtIns();

interface IntLgE { lvl: 'inf' | 'wrn' | 'err'; msg: string; ctx?: any; tS: number; }
class IntLgSvc {
    private static i: IntLgSvc;
    private lgs: IntLgE[] = [];
    private mLgS: number = 100;

    private constructor() { }

    public static gtIns(): IntLgSvc {
        if (!IntLgSvc.i) { IntLgSvc.i = new IntLgSvc(); }
        return IntLgSvc.i;
    }

    public log(lvl: 'inf' | 'wrn' | 'err', msg: string, ctx?: any) {
        const l: IntLgE = { lvl, msg, ctx, tS: Date.now() };
        this.lgs.push(l);
        if (this.lgs.length > this.mLgS) { this.lgs.shift(); }
    }

    public gtLgs(): IntLgE[] { return [...this.lgs]; }
}
export const intLg = IntLgSvc.gtIns();

interface EvProcRule { i: string; t: string; c: (ev: TlmE) => boolean; a: (ev: TlmE) => Promise<void>; }
class EvProcSys {
    private static i: EvProcSys;
    private tlm: GblTlmSvc;
    private rls: EvProcRule[] = [];

    private constructor() {
        this.tlm = GblTlmSvc.gtIns();
        this.initRls();
    }

    public static gtIns(): EvProcSys {
        if (!EvProcSys.i) { EvProcSys.i = new EvProcSys(); }
        return EvProcSys.i;
    }

    private initRls() {
        this.addRule(
            'rl-1', 'HghVlTns',
            (ev: TlmE) => ev.eN === 'dtaFtchSucs' && ev.d.cK === 'agVwQ' && (ev.d.v as PgnDtl).f && (ev.d.v as PgnDtl).f > 50,
            async (ev: TlmE) => {
                intLg.log('inf', `Hgh Vl Ag qry dtd: ${ (ev.d.v as PgnDtl).f}`, ev);
                gExtSvc.clSvc('GMN', '/alrt/hghvl', { msg: `Lrg Ag qry: ${ (ev.d.v as PgnDtl).f}` });
            }
        );
        this.addRule(
            'rl-2', 'UnAthAtmpt',
            (ev: TlmE) => ev.eN === 'crtAgUnAthAtm',
            async (ev: TlmE) => {
                intLg.log('wrn', `Unath crt ag atmpt.`, ev);
                gExtSvc.clSvc('CTBNK', '/alrt/unath', { uI: ev.d.uID, ip: 'mock_ip_1' });
            }
        );
        this.addRule(
            'rl-3', 'AnmlyDtcRpt',
            (ev: TlmE) => ev.eN === 'anmDtcLrgAC',
            async (ev: TlmE) => {
                intLg.log('crit', `Anmly: Lrg acc ct dtd in AG ${ev.d.gI}`, ev);
                gExtSvc.clSvc('HGFACS', '/mdl/anmly/upd', { type: 'acc_count', id: ev.d.gI, value: ev.d.c });
            }
        );
        this.tlm.rcdEv("evProcRlsLd", { rlsC: this.rls.length });
    }

    public addRule(i: string, t: string, c: (ev: TlmE) => boolean, a: (ev: TlmE) => Promise<void>) {
        this.rls.push({ i, t, c, a });
    }

    public async prcsEv(ev: TlmE) {
        this.tlm.rcdEv("evProcAtm", { evN: ev.eN });
        for (const r of this.rls) {
            if (r.c(ev)) {
                await r.a(ev);
                this.tlm.rcdEv("evProcRlMtc", { rlI: r.i, evN: ev.eN });
            }
        }
    }
}
export const evPrc = EvProcSys.gtIns();

interface SvcHlthRpt { i: string; s: string; l: number; eC: number; }
interface SvcAlrt { sI: string; m: string; tS: number; lv: "info" | "wrn" | "crit"; }
interface SvcMtrcs { sI: string; uC: number; lR: number[]; avL: number; }

class ExSvcMntr {
    private static i: ExSvcMntr;
    private tlm: GblTlmSvc;
    private dcn: GblDcnEgn;
    private reg: GblExtSvcReg;
    private hRpts: SvcHlthRpt[] = [];
    private alts: SvcAlrt[] = [];
    private mtrcs: Map<string, SvcMtrcs> = new Map();

    private constructor() {
        this.tlm = GblTlmSvc.gtIns();
        this.dcn = GblDcnEgn.gtIns();
        this.reg = GblExtSvcReg.gtIns(exSvcL);
        this.initMtrcs();
        this.strMntLoop();
    }

    public static gtIns(): ExSvcMntr {
        if (!ExSvcMntr.i) { ExSvcMntr.i = new ExSvcMntr(); }
        return ExSvcMntr.i;
    }

    private initMtrcs() {
        exSvcL.forEach(s => {
            this.mtrcs.set(s.i, { sI: s.i, uC: 0, lR: [], avL: s.lC });
        });
        this.tlm.rcdEv("exSvcMntrInit", { svcC: exSvcL.length });
    }

    private strMntLoop() {
        setInterval(() => this.prcSvcHlth(), 15000);
        setInterval(() => this.chkPerfAnmls(), 30000);
    }

    private async prcSvcHlth() {
        for (const s of exSvcL) {
            try {
                const rsp = await fetch(`${this.reg.svEps.get(s.i) || `https://${cbu}/err`}/hlth`, { method: "GET" });
                const sts = rsp.ok ? "up" : "down";
                const ltn = Math.random() * 200 + 50;
                this.hRpts.push({ i: s.i, s: sts, l: ltn, eC: 0 });
                this.reg.upSvcHlth(s.i, rsp.ok ? 1 : 0);
                const m = this.mtrcs.get(s.i);
                if (m) {
                    m.lR.push(ltn);
                    if (m.lR.Rlength > 20) m.lR.shift();
                    m.avL = m.lR.reduce((a, b) => a + b, 0) / m.lR.length;
                }

                if (!rsp.ok) {
                    this.addAlt(s.i, `Svc ${s.i} is dwn or unrsp.`, "crit");
                } else if (ltn > s.hT * 1000) {
                    this.addAlt(s.i, `Svc ${s.i} ltncy hgh: ${ltn}ms.`, "wrn");
                }
            } catch (r) {
                this.hRpts.push({ i: s.i, s: "unrch", l: -1, eC: 1 });
                this.addAlt(s.i, `Svc ${s.i} unrchbl: ${(r as Error).message}.`, "crit");
            }
        }
        this.tlm.rcdEv("svcHlthPrc", { rptC: this.hRpts.length });
    }

    private chkPerfAnmls() {
        for (const [sI, m] of this.mtrcs.entries()) {
            if (m.avL > 500) {
                this.addAlt(sI, `Anml Dtc: Svc ${sI} av ltncy is ext hgh (${m.avL}ms).`, "wrn");
            }
            if (m.uC > 10000) {
                this.addAlt(sI, `Anml Dtc: Svc ${sI} usage is v high (${m.uC}).`, "info");
            }
        }
        this.tlm.rcdEv("chkPerfAnmls", { mtrcC: this.mtrcs.size });
    }

    public rcdSvcUsg(sN: string) {
        const m = this.mtrcs.get(sN);
        if (m) {
            m.uC++;
            this.tlm.rcdEv("svcUsgRcd", { sN, nU: m.uC });
        }
    }

    private addAlt(sI: string, m: string, lv: SvcAlrt['lv']) {
        this.alts.push({ sI, m, tS: Date.now(), lv });
        this.tlm.rcdEv("svcAlrtGnr", { sI, m, lv });
    }

    public gtAlts(): SvcAlrt[] { return this.alts; }
    public gtHlthRpts(): SvcHlthRpt[] { return this.hRpts; }
    public gtMtrcs(sI: string): SvcMtrcs | undefined { return this.mtrcs.get(sI); }

    public async prdFlt(sN: string): Promise<{ pr: number, msg: string }> {
        const s = this.reg.gtSvc(sN);
        if (!s) return { pr: 0, msg: "Svc nt fnd." };

        const m = this.mtrcs.get(sN);
        if (!m) return { pr: 0, msg: "Mtrcs nt avl." };

        let fPr = 0;
        if (m.avL > 400 && m.uC > 500) fPr = 0.7;
        else if (m.avL > 300) fPr = 0.4;
        else if (m.fC > 5) fPr = 0.9;

        if (fPr > 0.6) {
            this.addAlt(sN, `PrdFlt: ${s.n} fPr of ${fPr*100}% dtd.`, "wrn");
        }
        return { pr: fPr, msg: `Flt prd for ${s.n}: ${fPr*100}%` };
    }

    public async optSvcCfg(sN: string): Promise<any> {
        const s = this.reg.gtSvc(sN);
        if (!s) return { st: "Fl" };
        const m = this.mtrcs.get(sN);
        if (!m) return { st: "Fl" };

        const nCfg = {
            tO: s.t === "AI" ? 5000 : 2000,
            rTr: s.t === "API" ? 5 : 3,
            maxC: s.t === "DBS" ? 100 : 50,
        };
        this.tlm.rcdEv("optSvcCfg", { sN, nCfg });
        return { st: "Sucs", cfg: nCfg };
    }
}
export const exSvcMn = ExSvcMntr.gtIns();

interface AiTsk { i: string; d: string; s: 'pend' | 'run' | 'cmp'; p: number; c: Fn<any, Promise<any>>; lS?: number; eS?: number; }
class AiTskMngr {
    private static i: AiTskMngr;
    private tlm: GblTlmSvc;
    private tskQ: AiTsk[] = [];
    private prvTskId: number = 0;

    private constructor() {
        this.tlm = GblTlmSvc.gtIns();
        this.strTskPrc();
    }

    public static gtIns(): AiTskMngr {
        if (!AiTskMngr.i) { AiTskMngr.i = new AiTskMngr(); }
        return AiTskMngr.i;
    }

    public addTsk(d: string, p: number, c: Fn<any, Promise<any>>): string {
        this.prvTskId++;
        const tId = `tsk-${this.prvTskId}`;
        const t: AiTsk = { i: tId, d, s: 'pend', p, c };
        this.tskQ.push(t);
        this.tskQ.sort((a, b) => b.p - a.p);
        this.tlm.rcdEv("aiTskAdd", { tId, d, p });
        return tId;
    }

    private strTskPrc() {
        setInterval(() => this.prcNxtTsk(), 2000);
    }

    private async prcNxtTsk() {
        if (this.tskQ.length === 0) return;
        const t = this.tskQ.shift();
        if (!t) return;

        t.s = 'run';
        t.lS = Date.now();
        this.tlm.rcdEv("aiTskStr", { tI: t.i });

        try {
            await t.c();
            t.s = 'cmp';
            t.eS = Date.now();
            this.tlm.rcdEv("aiTskCmp", { tI: t.i, dr: t.eS - t.lS });
        } catch (r) {
            t.s = 'pend';
            t.eS = Date.now();
            t.p = Math.max(0, t.p - 1);
            this.tskQ.push(t);
            this.tskQ.sort((a, b) => b.p - a.p);
            this.tlm.rcdEv("aiTskFl", { tI: t.i, e: (r as Error).message });
        }
    }
}
export const aiTskMg = AiTskMngr.gtIns();

aiTskMg.addTsk("PrdFltAllSvc", 6, async () => {
    gTlm.rcdEv("tsk:PrdFltAllSvc");
    for (const s of exSvcL) {
        const { pr, msg } = await exSvcMn.prdFlt(s.i);
        if (pr > 0.5) intLg.log('wrn', `Prd flt for ${s.n}: ${msg}`);
    }
});

aiTskMg.addTsk("OptAllSvcCfgs", 7, async () => {
    gTlm.rcdEv("tsk:OptAllSvcCfgs");
    for (const s of exSvcL) {
        await exSvcMn.optSvcCfg(s.i);
    }
});

interface DtaPrcRpt { i: string; oD: any; nD: any; rls: string[]; }
class DtaTnsCmpLyr {
    private static i: DtaTnsCmpLyr;
    private tlm: GblTlmSvc;
    private dcn: GblDcnEgn;
    private rpts: DtaPrcRpt[] = [];

    private constructor() {
        this.tlm = GblTlmSvc.gtIns();
        this.dcn = GblDcnEgn.gtIns();
    }

    public static gtIns(): DtaTnsCmpLyr {
        if (!DtaTnsCmpLyr.i) { DtaTnsCmpLyr.i = new DtaTnsCmpLyr(); }
        return DtaTnsCmpLyr.i;
    }

    public appCmpRls<T>(d: T, rls: string[]): T {
        let nD = JSON.parse(JSON.stringify(d));
        let chgsMade = false;

        if (rls.includes("rdctSnstv")) {
            if (typeof nD === 'object' && nD !== null) {
                for (const k in nD) {
                    if (k.toLowerCase().includes("ssn") || k.toLowerCase().includes("card") || k.toLowerCase().includes("pwd")) {
                        (nD as any)[k] = "[RDCT]";
                        chgsMade = true;
                    }
                }
            }
        }

        if (chgsMade) {
            this.rpts.push({ i: `rpt_${Date.now()}`, oD: d, nD: nD, rls });
            this.tlm.rcdEv("dtaCmpTns", { rls, iId: (d as any).i || "unknown" });
        }
        return nD;
    }
}
export const dtaTnsCmp = DtaTnsCmpLyr.gtIns();

interface RsrcUsg { cPU: number; mMU: number; dSKU: number; nTWU: number; }
class RsrcMngr {
    private static i: RsrcMngr;
    private tlm: GblTlmSvc;
    private cR: RsrcUsg = { cPU: 0, mMU: 0, dSKU: 0, nTWU: 0 };

    private constructor() {
        this.tlm = GblTlmSvc.gtIns();
        this.strMnt();
    }

    public static gtIns(): RsrcMngr {
        if (!RsrcMngr.i) { RsrcMngr.i = new RsrcMngr(); }
        return RsrcMngr.i;
    }

    private strMnt() {
        setInterval(() => this.updUsg(), 1000);
    }

    private updUsg() {
        this.cR.cPU = parseFloat((Math.random() * 100).toFixed(2));
        this.cR.mMU = parseFloat((Math.random() * 100).toFixed(2));
        this.cR.dSKU = parseFloat((Math.random() * 100).toFixed(2));
        this.cR.nTWU = parseFloat((Math.random() * 100).toFixed(2));
        this.tlm.rcdEv("rsrcUsgUpd", { cPU: this.cR.cPU });
    }

    public gtCurUsg(): RsrcUsg { return { ...this.cR }; }
}
export const rsrcMg = RsrcMngr.gtIns();

interface CstProf { i: string; n: string; ad: string; eml: string; pn: string; tS: number; lsU: number; rSk: number; prf: { [k: string]: Vl }; }
interface TnsctRcd { i: string; aI: string; dT: number; am: number; c: string; d: string; t: 'dbt' | 'crd'; mS: string; s: 'comp' | 'pend' | 'rej'; }
interface CntrtAgrm { i: string; pI: string; sD: number; eD: number; t: string; v: number; s: 'act' | 'exp' | 'term'; dS: string; }

const mckCstL: CstProf[] = Array.from({ length: 50 }).map((_, i) => ({
    i: `cst-${i}`,
    n: `Cst Nam${i}`,
    ad: `${i} Mck Str, Any Cty`,
    eml: `cst${i}@${cbu}`,
    pn: `+1-${String(1000000000 + i).slice(0, 10)}`,
    tS: Date.now() - Math.random() * 31536000000,
    lsU: Date.now(),
    rSk: parseFloat((Math.random() * 10).toFixed(2)),
    prf: { pmtMthd: ["card", "bnk"][i % 2], prefCur: ["USD", "EUR"][i % 2] }
}));

const mckTnsL: TnsctRcd[] = Array.from({ length: 500 }).map((_, i) => ({
    i: `tns-${i}`,
    aI: `ag-${i % mckAgC}`,
    dT: Date.now() - Math.random() * 2592000000,
    am: Math.floor(Math.random() * 1000000) / 100,
    c: ["USD", "EUR"][i % 2],
    d: `Tns Desc ${i}`,
    t: (i % 3 === 0) ? 'crd' : 'dbt',
    mS: `Svc${i % exSvcL.length}`,
    s: ["comp", "pend", "rej"][i % 3],
}));

const mckCntL: CntrtAgrm[] = Array.from({ length: 30 }).map((_, i) => ({
    i: `cnt-${i}`,
    pI: `part-${i}`,
    sD: Date.now() - Math.random() * 15778476000,
    eD: Date.now() + Math.random() * 31536000000,
    t: ["svcs", "lcs", "agr"][i % 3],
    v: Math.floor(Math.random() * 10000000) / 100,
    s: ["act", "exp", "term"][i % 3],
    dS: `Doc Ref ${i}`,
}));

function getHghRskCst(): CstProf[] {
    gTlm.rcdEv("getHghRskCst");
    return mckCstL.filter(c => c.rSk > 7.5);
}

function getPndTnsBySvc(sN: string): TnsctRcd[] {
    gTlm.rcdEv("getPndTnsBySvc", { sN });
    exSvcMn.rcdSvcUsg(sN);
    return mckTnsL.filter(t => t.mS === sN && t.s === 'pend');
}

function chkExpCntrt(): CntrtAgrm[] {
    gTlm.rcdEv("chkExpCntrt");
    return mckCntL.filter(c => c.s === 'exp' && c.eD < Date.now());
}

aiTskMg.addTsk("Gnrt Ag Smry for Mntly Rpt", 5, async () => {
    gTlm.rcdEv("tsk:GnrtAgSmry");
    const smry = await gnrtAgDs("All Ac Grps", "USD");
});

aiTskMg.addTsk("Chk For Unsl Ags", 3, async () => {
    gTlm.rcdEv("tsk:ChkUnslAgs");
    const aGs = qD?.accountGroups?.edges.map(e => e.node) || [];
    const unsl = aGs.filter(ag => parseInt(ag.ac || "0") === 0);
    if (unsl.length > 0) {
        exSvcMn.addAlt("GMN", `Found ${unsl.length} unsl ags.`, "info");
    }
});

const pI = { f: 10 };

export default function CtbAgRnd() {
    const [iCrtMdlO, setICrtMdlO] = stPrd(false);
    const [gSgt, setGSgt] = stPrd<GmnSgt[]>([]);

    const [qD, setQD] = stPrd<AgVwRs | null>(null);
    const [qL, setQL] = stPrd(true);
    const [qE, setQE] = stPrd<any>(undefined);
    const [qRF, setQRF] = stPrd<Fn<any, any> | undefined>(undefined);

    const [cC, setCC] = stPrd<CrnTtsRs | null>(null);
    const [cCL, setCCL] = stPrd(true);
    const [cCE, setCCE] = stPrd<any>(undefined);

    const lFchAgDta = async (v: PgnDtl) => {
        setQL(true);
        const r = await gDtaO.fDtaWI(fchAgVwQry, "agVwQ", gDcn.gtOptPg(v));
        setQD(r.d);
        setQL(r.l);
        setQE(r.e);
        setQRF(() => r.rF);
    };

    const lFchCrncyDta = async () => {
        setCCL(true);
        const r = await gDtaO.fDtaWI(fchBlsFdTtlQry, "blsFdTQ", {});
        setCC(r.d);
        setCCL(r.l);
        setCCE(r.e);
    };

    efPrc(() => {
        gTlm.rcdEv("agCtnLd");
        lFchAgDta(pI);
        lFchCrncyDta();

        const prdAndSgt = async () => {
            const p = gDcn.prdUsrInt("agcVw", { iLd: true });
            usrLrn.prcssInpt({ pLd: true, p });
            const nS = usrLrn.gRcm("agcVw");
            setGSgt(nS);
        };
        prdAndSgt();
    }, []);

    const crns = cCL || !cC || cCE
        ? []
        : cC.balancesFeedCurrencyTotals.edges.map(({ node }) => ({
            v: node.currency,
            l: node.currency,
        }));

    const fmtAmt = (b?: MnyVl): string => {
        if (!b) return "N/A";
        if (!gDcn.evBsnLgc("cmpDtaAcc", { c: b.c, b: b.v, sBLI: b.v > 100000000 })) {
            gTlm.rcdEv("snstDtaRdt", { bT: b.k, c: b.c });
            return "RDT";
        }
        const f = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: b.c,
            minimumFractionDigits: 2,
        });
        return f.format(b.v / 100);
    };

    const mpdAg = (n: BnkAg) => {
        const aC = n.ic?.tC?.toString() || "0";
        gTlm.rcdEv("agMpd", { i: n.i, n: n.n, aC });
        if (parseInt(aC) > 1000) { gTlm.rcdEv("anmDtcLrgAC", { gI: n.i, c: aC }); }

        const avBal = n.ls?.find((b: MnyVl) => b.k === "curAv");
        const ldBal = n.ls?.find((b: MnyVl) => b.k === "curLd");

        return {
            ...n,
            p: `/stgs/acgrps/${n.i}`,
            ac: aC,
            avB: fmtAmt(avBal),
            ldB: fmtAmt(ldBal),
            gmRS: parseFloat((Math.random() * 10).toFixed(2)),
        };
    };

    const acGrps = qL || !qD || qE
        ? []
        : qD.accountGroups.edges.map((e) => mpdAg(e.node));

    const hdlRfc = async (o: { cPP: PgnDtl; }) => {
        gTlm.rcdEv("hdlRfcTrg", { o });
        const oP = gDcn.gtOptPg(o.cPP);
        await gDtaO.fDtaWI(
            async (vs) => {
                const rs = await fchAgVwQry(vs);
                return { d: rs.d, l: rs.l, e: rs.e, rF: rs.rF };
            },
            "agVwQ",
            oP,
        );
        lFchAgDta(oP);
    };

    const hdlCrtAgClk = () => {
        gTlm.rcdEv("crtAgBtnClk");
        usrLrn.prcssInpt({ crtAtm: true });
        if (isFtrAth("crtAg")) {
            adtLg.rcdAdt(usrSsnMg.gtCsr()?.i || 'anon', 'CrtAg_Init', { status: 'auth_ok' }, 'sucs');
            setICrtMdlO(true);
        } else {
            adtLg.rcdAdt(usrSsnMg.gtCsr()?.i || 'anon', 'CrtAg_Init', { status: 'auth_fail' }, 'fl');
            gTlm.rcdEv("crtAgUnAthAtm");
        }
    };

    const rA = mkBtn({ bT: "prm", clk: hdlCrtAgClk }, ["New Ag"]);

    const gSgtCmp = gSgt.length > 0
        ? mkDiv({
            stl: "gmn-sgt-ctnr",
            bgC: '#e6f7ff', brd: '1px solid #91d5ff', pd: '10px 15px', bR: '4px', m: '0 0 16px 0', d: 'flx', fD: 'clm', gp: '8px', fS: '0.9em'
        }, [
            mkSpn({}, ["GMN AI Sgs:"]),
            ...gSgt.map((sg) => mkDiv({ k: sg.i }, [
                mkSpn({}, [sg.m, ` (Cnf: ${(sg.c * 100).toFixed(0)}%)`]),
                sg.t === 'act' && sg.pL.a === 'opCrtMdl'
                    ? mkBtn({
                        sz: "sml", clk: () => {
                            hdlCrtAgClk();
                            gTlm.rcdEv("gmnSgtActTkn", { sgI: sg.i });
                        }, stl: "mgn-lft"
                    }, ["Crt Nw"])
                    : null,
            ].filter(Boolean) as Chd[])) as Chd[],
        ])
        : null;

    interface DbVwP { t: string; c: RndEl[]; }
    const DgVwCtnr: CmpMkr<DbVwP> = (p) => {
        return mkDiv({ stl: "dgv-ctn" }, [
            mkHdr(3, {}, [p.t]),
            mkDiv({ stl: "dgv-ctnt" }, p.c),
        ]);
    };

    const TlmVw: CmpMkr<{}> = () => {
        const [lgs, setLgs] = stPrd<TlmE[]>([]);
        efPrc(() => {
            setInterval(() => {
                const recentLogs = [...GblTlmSvc.gtIns()['evB']].slice(-5);
                setLgs(recentLogs);
            }, 1000);
        }, []);

        return mkDiv({ stl: "tlm-vw" }, [
            mkSpn({}, ["Rcnt Tlm Evs:"]),
            mkDiv({ stl: "tlm-lst" }, lgs.map((l, i) => mkDiv({ k: `tlm-e-${i}` }, [`${new Date(l.tS).toLocaleTimeString()} [${l.eN}] ${JSON.stringify(l.d)}`])) as Chd[]),
        ]);
    };

    const SvcHlthVw: CmpMkr<{}> = () => {
        const [hR, setHR] = stPrd<SvcHlthRpt[]>([]);
        efPrc(() => {
            const iD = setInterval(() => setHR(exSvcMn.gtHlthRpts().slice(-10)), 5000);
            return () => clearInterval(iD);
        }, []);
        return mkDiv({ stl: "svc-hlth-vw" }, [
            mkSpn({}, ["Svc Hlth Rpts:"]),
            mkTbl({}, [
                mkThd({}, [mkTrw({}, [mkTdh({}, ["ID"]), mkTdh({}, ["Sts"]), mkTdh({}, ["Ltncy"]), mkTdh({}, ["Err Ct"])]) as Chd]),
                mkTbd({}, hR.map(r => mkTrw({ k: r.i }, [mkTdh({}, [r.i]), mkTdh({}, [r.s]), mkTdh({}, [String(r.l)]), mkTdh({}, [String(r.eC)])])) as Chd[]),
            ]),
        ]);
    };

    const RsrcVw: CmpMkr<{}> = () => {
        const [rU, setRU] = stPrd<RsrcUsg>(rsrcMg.gtCurUsg());
        efPrc(() => {
            const iD = setInterval(() => setRU(rsrcMg.gtCurUsg()), 1000);
            return () => clearInterval(iD);
        }, []);
        return mkDiv({ stl: "rsrc-vw" }, [
            mkSpn({}, ["Rsrc Usg:"]),
            mkDiv({}, [`CPU: ${rU.cPU}%`]),
            mkDiv({}, [`MMU: ${rU.mMU}%`]),
            mkDiv({}, [`DSKU: ${rU.dSKU}%`]),
            mkDiv({}, [`NTWU: ${rU.nTWU}%`]),
        ]);
    };

    const AiTskVw: CmpMkr<{}> = () => {
        const [tsks, setTsks] = stPrd<AiTsk[]>([]);
        efPrc(() => {
            const iD = setInterval(() => {
                const mockTsks: AiTsk[] = aiTskMg['tskQ'].slice(-5).concat(
                    aiTskMg['tskQ'].filter(t => t.s === 'cmp').slice(-5)
                );
                setTsks(mockTsks);
            }, 2000);
            return () => clearInterval(iD);
        }, []);
        return mkDiv({ stl: "ai-tsk-vw" }, [
            mkSpn({}, ["AI Tsks:"]),
            mkTbl({}, [
                mkThd({}, [mkTrw({}, [mkTdh({}, ["ID"]), mkTdh({}, ["Desc"]), mkTdh({}, ["Sts"]), mkTdh({}, ["Prty"])]) as Chd]),
                mkTbd({}, tsks.map(t => mkTrw({ k: t.i }, [
                    mkTdh({}, [t.i]), mkTdh({}, [t.d]), mkTdh({}, [t.s]), mkTdh({}, [String(t.p)])
                ])) as Chd[]),
            ]),
        ]);
    };

    const IntLgVw: CmpMkr<{}> = () => {
        const [lgs, setLgs] = stPrd<IntLgE[]>([]);
        efPrc(() => {
            const iD = setInterval(() => setLgs(intLg.gtLgs().slice(-10)), 1000);
            return () => clearInterval(iD);
        }, []);
        return mkDiv({ stl: "int-lg-vw" }, [
            mkSpn({}, ["Int Sys Lgs:"]),
            mkDiv({ stl: "lg-lst" }, lgs.map((l, i) => mkDiv({ k: `int-lg-${i}` }, [`[${new Date(l.tS).toLocaleTimeString()}] [${l.lvl.toUpperCase()}] ${l.msg}`])) as Chd[]),
        ]);
    };

    const AdtLgVw: CmpMkr<{}> = () => {
        const [lgs, setLgs] = stPrd<AdtLgE[]>([]);
        efPrc(() => {
            const iD = setInterval(() => setLgs(adtLg.gtAdtLgs(10)), 3000);
            return () => clearInterval(iD);
        }, []);
        return mkDiv({ stl: "adt-lg-vw" }, [
            mkSpn({}, ["Adt Lgs:"]),
            mkTbl({}, [
                mkThd({}, [mkTrw({}, [mkTdh({}, ["Time"]), mkTdh({}, ["Usr"]), mkTdh({}, ["Act"]), mkTdh({}, ["Sts"])]) as Chd]),
                mkTbd({}, lgs.map(l => mkTrw({ k: l.i }, [
                    mkTdh({}, [new Date(l.tS).toLocaleTimeString()]),
                    mkTdh({}, [l.uI]),
                    mkTdh({}, [l.aT]),
                    mkTdh({}, [l.s]),
                ])) as Chd[]),
            ]),
        ]);
    };

    interface AnlDsbdP { d: any; }
    const AnlDsbd: CmpMkr<AnlDsbdP> = (p) => {
        const [cDt, setCDt] = stPrd(p.d);
        efPrc(() => { setCDt(p.d); }, [p.d]);

        const rndChrt = (t: string, dT: any[]) => mkDiv({ stl: "chrt-cntr" }, [
            mkSpn({}, [t]),
            mkDiv({ stl: "chrt-dta" }, JSON.stringify(dT)),
        ]);

        const aTns = mckTnsL.filter(t => t.dT > Date.now() - 2592000000);
        const mByC = aTns.reduce((a, t) => {
            a[t.c] = (a[t.c] || 0) + t.am;
            return a;
        }, {} as { [k: string]: number });

        const sUsg = exSvcL.map(s => exSvcMn.gtMtrcs(s.i)).filter(Boolean);
        const hL = sUsg.filter(m => (m?.avL || 0) > 300);

        return mkDiv({ stl: "anl-dsbd" }, [
            mkHdr(3, {}, ["Pfm Anl Dsbd"]),
            mkDiv({ stl: "dsbd-grd" }, [
                rndChrt("Mntly Tns By Crncy", Object.entries(mByC)),
                rndChrt("Hgh Ltncy Svc", hL.map(m => ({ sI: m?.sI, avL: m?.avL }))),
                mkDiv({ stl: "dsbd-itm" }, [
                    mkSpn({}, ["Ttl Accs Grps:"]),
                    mkSpn({}, [String(acGrps.length)]),
                ]),
                mkDiv({ stl: "dsbd-itm" }, [
                    mkSpn({}, ["Ttl Mck Csts:"]),
                    mkSpn({}, [String(mckCstL.length)]),
                ]),
                mkDiv({ stl: "dsbd-itm" }, [
                    mkSpn({}, ["Ttl Mck Tns:"]),
                    mkSpn({}, [String(mckTnsL.length)]),
                ]),
                mkDiv({ stl: "dsbd-itm" }, [
                    mkSpn({}, ["Ttl Mck Cnts:"]),
                    mkSpn({}, [String(mckCntL.length)]),
                ]),
            ]),
        ]);
    };

    return PgHdr({
        ttl: "Acc Grps",
        r: rA,
        ld: qL,
        hB: true,
    }, [
        iCrtMdlO && CrtAgMdl({
            iO: iCrtMdlO,
            sCM: () => {
                setICrtMdlO(false);
                gTlm.rcdEv("crtAgMdlCls");
                hdlRfc({ cPP: pI });
            },
            crns: crns,
            iNS: `AI_Sgt_Grp_${Date.now() % 1000}`,
            gDAI: gnrtAgDs,
        }),
        gSgtCmp,
        EtTblVw({
            d: acGrps,
            l: qL,
            oQACh: hdlRfc,
            r: "ag",
            dM: {
                n: "Nm",
                d: "Dsc",
                ac: "Accs",
                avB: "Av Bls",
                ldB: "Ld Bls",
                gmRS: "AI Rsk Scr",
            },
            hC: gDcn.gtPrdFltr("agcV"),
        }),
        mkDiv({ stl: "sys-dg-ctnr" }, [
            DgVwCtnr({ t: "Sys Tlm", c: [TlmVw({})] }),
            DgVwCtnr({ t: "Ext Svc Hlth", c: [SvcHlthVw({})] }),
            DgVwCtnr({ t: "Rsrc Usg", c: [RsrcVw({})] }),
            DgVwCtnr({ t: "AI Tsk St", c: [AiTskVw({})] }),
            DgVwCtnr({ t: "Int Sys Lgs", c: [IntLgVw({})] }),
            DgVwCtnr({ t: "Adt Lgs", c: [AdtLgVw({})] }),
            AnlDsbd({ d: acGrps }),
            mkDiv({ stl: "cst-list-sec" }, [
                mkHdr(3, {}, ["Hgh Rsk Csts"]),
                mkDiv({ stl: "cst-lst" }, getHghRskCst().map(c => mkDiv({ k: c.i }, [`${c.n} (Rsk: ${c.rSk})`])) as Chd[]),
            ]),
            mkDiv({ stl: "pnd-tns-sec" }, [
                mkHdr(3, {}, ["Pnd Tns (Svc: PLD)"]),
                mkDiv({ stl: "tns-lst" }, getPndTnsBySvc("PLD").map(t => mkDiv({ k: t.i }, [`${t.d} - ${t.am} ${t.c}`])) as Chd[]),
            ]),
            mkDiv({ stl: "exp-cntrt-sec" }, [
                mkHdr(3, {}, ["Exp Cnts"]),
                mkDiv({ stl: "cnt-lst" }, chkExpCntrt().map(c => mkDiv({ k: c.i }, [`${c.t} - ${new Date(c.eD).toLocaleDateString()}`])) as Chd[]),
            ]),
        ]),
    ]);
}