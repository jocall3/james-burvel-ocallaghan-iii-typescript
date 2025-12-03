type FCt<P = {}> = (p: P) => any;
type SttUpAcn<S> = S | ((pvS: S) => S);
type Prvd<T> = (v: T) => any;

let pR = 0;
let aS: any[] = [];
let aE: any[] = [];
let aC: any[] = [];
let aCB: any[] = [];
let pT: any = null;

function useStt<T>(iV: T): [T, (u: SttUpAcn<T>) => void] {
  let cR = pR++;
  aS[cR] = aS[cR] === undefined ? iV : aS[cR];
  let sF = (u: SttUpAcn<T>) => {
    aS[cR] = typeof u === 'function' ? (u as (pvS: T) => T)(aS[cR]) : u;
    console.log(`_stt_upd_${cR}_`);
  };
  return [aS[cR], sF];
}

function useEfct(f: () => (() => void) | void, d?: any[]) {
  let cR = pR++;
  let pD = aE[cR]?.d;
  if (!pD || d?.some((el, i) => el !== pD[i])) {
    if (aE[cR]?.cln) aE[cR].cln();
    aE[cR] = { cln: f(), d };
    console.log(`_efct_run_${cR}_`);
  }
}

function crtCntx<T>(dV: T): { Prv: FCt<{ v: T; children: any }>; Cns: FCt<{ children: (v: T) => any }> } {
  let iC = aC.length;
  aC.push(dV);
  return {
    Prv: ({ v, children }) => { pT = v; return children; },
    Cns: ({ children }) => children(aC[iC]),
  };
}

function useCntx<T>(): T {
  return pT;
}

function useCbk<T extends (...args: any[]) => any>(cb: T, d: any[]): T {
  let cR = pR++;
  let pD = aCB[cR]?.d;
  if (!pD || d?.some((el, i) => el !== pD[i])) {
    aCB[cR] = { cb, d };
  }
  return aCB[cR].cb;
}

function rstHks() { pR = 0; }
function rndr(cmp: FCt<any>, props: any) { rstHks(); return cmp(props); }

const CkUtl = new class {
  gt(k: string): string | undefined {
    if (typeof document === 'undefined') return undefined;
    const r = new RegExp(`(^|;)\\s*${k}=([^;]+)`);
    const m = document.cookie.match(r);
    return m ? decodeURIComponent(m[2]) : undefined;
  }
  st(k: string, v: string, o?: { x?: number; dm?: string; p?: string; sc?: boolean; sS?: boolean }) {
    if (typeof document === 'undefined') return;
    let s = `${k}=${encodeURIComponent(v)}`;
    if (o) {
      if (o.x) { const d = new Date(); d.setTime(d.getTime() + (o.x * 24 * 60 * 60 * 1000)); s += `; expires=${d.toUTCString()}`; }
      if (o.dm) s += `; domain=${o.dm}`;
      if (o.p) s += `; path=${o.p}`;
      if (o.sc) s += `; secure`;
      if (o.sS) s += `; samesite=lax`;
    }
    document.cookie = s;
  }
};

const UIdGn = {
  genV4: (): string => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  }),
};

const LnkHdr = () => {
  const h = useHist();
  return useCbk((l: string, e: any) => {
    e.preventDefault();
    e.stopPropagation();
    h.psh(l);
  }, [h]);
};

const HistNav = new class {
  private pS: string[] = ['/'];
  private cI: number = 0;
  private lsnrs: Set<() => void> = new Set();

  psh(p: string) {
    if (this.pS[this.cI] !== p) {
      this.pS = this.pS.slice(0, this.cI + 1);
      this.pS.push(p);
      this.cI = this.pS.length - 1;
      this.ntfy();
    }
  }

  rplc(p: string) {
    if (this.cI >= 0) {
      this.pS[this.cI] = p;
    } else {
      this.pS = [p];
      this.cI = 0;
    }
    this.ntfy();
  }

  gBk() {
    if (this.cI > 0) {
      this.cI--;
      this.ntfy();
    }
  }

  gFrwd() {
    if (this.cI < this.pS.length - 1) {
      this.cI++;
      this.ntfy();
    }
  }

  gtLoc(): { pNm: string, srch: string, hs: string } {
    if (typeof window === 'undefined') return { pNm: '/', srch: '', hs: '' };
    const u = new URL(this.pS[this.cI] || window.location.pathname, `https://citibankdemobusiness.dev`);
    return { pNm: u.pathname, srch: u.search, hs: u.hash };
  }

  lsn(clb: () => void) {
    this.lsnrs.add(clb);
    return () => this.lsnrs.delete(clb);
  }

  ntfy() { this.lsnrs.forEach(clb => clb()); }
};

const RtrCtxt = crtCntx<{
  psh: (p: string) => void;
  rplc: (p: string) => void;
  gBk: () => void;
  gFrwd: () => void;
  gtLoc: () => { pNm: string; srch: string; hs: string };
}>(({
  psh: (p: string) => HistNav.psh(p),
  rplc: (p: string) => HistNav.rplc(p),
  gBk: () => HistNav.gBk(),
  gFrwd: () => HistNav.gFrwd(),
  gtLoc: () => HistNav.gtLoc(),
}));

const RtrPrv: FCt<{ children: any }> = ({ children }) => {
  const [l, setL] = useStt(HistNav.gtLoc());
  useEfct(() => HistNav.lsn(() => setL(HistNav.gtLoc())), []);
  return RtrCtxt.Prv({ v: { psh: HistNav.psh.bind(HistNav), rplc: HistNav.rplc.bind(HistNav), gBk: HistNav.gBk.bind(HistNav), gFrwd: HistNav.gFrwd.bind(HistNav), gtLoc: l }, children });
};

const useHist = () => useCntx<typeof RtrCtxt extends { Prv: any; Cns: any } ? ReturnType<typeof RtrCtxt['Prv']>['v'] : any>();

const UILib = new class {
  Btn: FCt<any> = ({ children, onClick, buttonType = "primary", className = "", ...rst }) => (
    <button className={`p-2 rounded ${buttonType === "primary" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"} ${className}`} onClick={onClick} {...rst}>{children}</button>
  );
  PgHdr: FCt<any> = ({ title, subtitle, right, sections, currentSection, setCurrentSection, crumbs, loading, children }) => (
    <div className="p-4 bg-white shadow">
      {crumbs?.length > 0 && <div className="text-sm text-gray-500">{crumbs.map((c: any, i: number) => <span key={i}>{c.name}{i < crumbs.length - 1 && ' > '}</span>)}</div>}
      <div className="flex justify-between items-center mt-2">
        <h1 className="text-xl font-bold">{title}</h1>
        {right && <div>{right}</div>}
      </div>
      {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      {loading && <div className="w-full h-1 bg-blue-200 animate-pulse mt-2"></div>}
      {sections && (
        <div className="flex gap-4 mt-4 border-b">
          {Object.entries(sections).map(([k, v]: [string, any]) => (
            <button key={k} className={`pb-2 ${currentSection === k ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`} onClick={() => setCurrentSection(k)}>{v}</button>
          ))}
        </div>
      )}
      <div className="mt-4">{children}</div>
    </div>
  );
  LdRgn: FCt<any> = ({ noHeight }) => (<div className={`bg-blue-200 animate-pulse ${noHeight ? '' : 'h-4'}`}></div>);
  Lyot: FCt<any> = ({ primaryContent, secondaryContent, ratio = "1/1" }) => (
    <div className={`flex flex-wrap gap-4 ${ratio === "3/3" ? 'flex-col lg:flex-row' : ''} my-4`}>
      <div className={`${ratio === "3/3" ? 'lg:w-full' : 'lg:w-1/2'} grow`}>{primaryContent}</div>
      {secondaryContent && <div className={`${ratio === "3/3" ? 'lg:w-full' : 'lg:w-1/2'} grow`}>{secondaryContent}</div>}
    </div>
  );
  Icn: FCt<any> = ({ iconName, size = "m", color = "currentColor", className = "" }) => (
    <span className={`material-icons text-${size} ${color} ${className}`}>{iconName}</span>
  );
  ClkBle: FCt<any> = ({ onClick, children, className = "" }) => (<span className={`cursor-pointer ${className}`} onClick={onClick}>{children}</span>);
  Crd: FCt<any> = ({ children, className = "" }) => (<div className={`bg-white shadow rounded-lg p-4 ${className}`}>{children}</div>);
  CrdCt: FCt<any> = ({ children, className = "" }) => (<div className={`mt-2 ${className}`}>{children}</div>);
  CrdHdr: FCt<any> = ({ children, className = "" }) => (<div className={`pb-2 border-b border-gray-100 ${className}`}>{children}</div>);
  CrdHdg: FCt<any> = ({ children, className = "" }) => (<h2 className={`font-semibold text-lg ${className}`}>{children}</h2>);
  CrdTtl: FCt<any> = ({ children, className = "" }) => (<h3 className={`font-medium text-md ${className}`}>{children}</h3>);
  LveCfgDisp: FCt<any> = ({ featureName, enabledView, disabledView }) => (
    featureName === "transfer_ingestion_wizard_enabled" ? enabledView : disabledView
  );
};

const MckDb = {
  db: {
    internalAccounts: [] as IntAcct[],
    transactions: [] as TrcMv[],
    expectedPayments: [] as ExpPymt[],
    paymentOrders: [] as PymtOrd[],
    ledgerAccounts: [] as LdgrAcct[],
    companies: [] as { id: string; nm: string; rnk: number; api: string }[],
  },
  init: () => {
    const com = COMP_RGY.map((n, i) => ({ id: UIdGn.genV4(), nm: n, rnk: i, api: `https://api.${n.toLowerCase().replace(/\s/g, '')}.citibankdemobusiness.dev/v1` }));
    MckDb.db.companies = com;
    for (let i = 0; i < 50; i++) {
      const iaid = UIdGn.genV4();
      const cn = com[i % com.length];
      const ia: IntAcct = {
        id: iaid,
        lbl: `IA_${i + 1}`,
        lngNm: `Corporate Settlement Account ${i + 1}`,
        sts: i % 2 === 0 ? 'active' : 'inactive',
        cur: i % 3 === 0 ? CurnEnm.Usd : CurnEnm.Eur,
        spcId: UIdGn.genV4(),
        cntn: {
          id: UIdGn.genV4(),
          nkNm: `${cn.nm} Cnnctn`,
          vndr: { id: UIdGn.genV4(), nm: cn.nm },
          enty: `ety_${i % 5}`,
        },
        ldgrAcct: i % 4 === 0 ? { id: UIdGn.genV4(), nm: `Ledger ${iaid.substring(0, 4)}` } : null,
        mta: { 'purpose': 'op_funds', 'category': `cat_${i % 3}` },
        cIds: [{ nm: 'SWIFT', vl: `SWIFT${i}` }],
        cblts: ['PY_O', 'DT_FL', 'RPT_G'],
        blncHst: Array.from({ length: 30 }).map((_, j) => ({
          dt: new Date(Date.now() - (29 - j) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          blnc: Math.random() * 1000000 + 100000,
        })),
      };
      MckDb.db.internalAccounts.push(ia);
      for (let j = 0; j < 100; j++) {
        MckDb.db.transactions.push({
          id: UIdGn.genV4(),
          iid: iaid,
          amt: Math.random() * 5000 - 2500,
          cur: ia.cur,
          desc: `Trans ${j} for ${ia.lbl}`,
          pstDt: new Date(Date.now() - (29 - Math.floor(j/3)) * 24 * 60 * 60 * 1000).toISOString(),
          typ: j % 2 === 0 ? 'credit' : 'debit',
        });
        MckDb.db.expectedPayments.push({
          id: UIdGn.genV4(),
          iid: iaid,
          amt: Math.random() * 1000,
          cur: ia.cur,
          desc: `Exp Pymt ${j} for ${ia.lbl}`,
          schDt: new Date(Date.now() + (j % 15) * 24 * 60 * 60 * 1000).toISOString(),
          sts: j % 3 === 0 ? 'pending' : 'completed',
        });
      }
      MckDb.db.paymentOrders.push({
        id: UIdGn.genV4(),
        oia: iaid,
        amt: Math.random() * 10000,
        cur: ia.cur,
        sts: i % 3 === 0 ? 'initiated' : 'completed',
      });
      if (ia.ldgrAcct) {
        MckDb.db.ledgerAccounts.push({
          id: ia.ldgrAcct.id,
          nm: ia.ldgrAcct.nm,
          blnc: Math.random() * 100000,
          cur: ia.cur,
          iid: iaid,
        });
      }
    }
  },
  q: <T>(col: keyof typeof MckDb.db, flt: (i: any) => boolean): T[] => MckDb.db[col].filter(flt) as T[],
  upd: (col: keyof typeof MckDb.db, id: string, pld: Partial<any>): boolean => {
    const ix = (MckDb.db[col] as any[]).findIndex(i => i.id === id);
    if (ix !== -1) {
      (MckDb.db[col] as any[])[ix] = { ...(MckDb.db[col] as any[])[ix], ...pld };
      return true;
    }
    return false;
  }
};
MckDb.init();

enum ExpObjEnm { Trc = 'Trc', ExpPymt = 'ExpPymt', PymtOrd = 'PymtOrd' }
enum CurnEnm { Usd = 'USD', Eur = 'EUR' }
interface IntAcct {
  id: string; lbl: string; lngNm: string; sts: string; cur: CurnEnm; spcId: string;
  cntn: { id: string; nkNm: string; vndr: { id: string; nm: string }; enty: string; };
  ldgrAcct: { id: string; nm: string; } | null; mta: Record<string, string>;
  cIds: { nm: string; vl: string }[]; cblts: string[];
  blncHst: { dt: string; blnc: number }[];
}
interface TrcMv { id: string; iid: string; amt: number; cur: CurnEnm; desc: string; pstDt: string; typ: string; }
interface ExpPymt { id: string; iid: string; amt: number; cur: CurnEnm; desc: string; schDt: string; sts: string; }
interface PymtOrd { id: string; oia: string; amt: number; cur: CurnEnm; sts: string; }
interface LdgrAcct { id: string; nm: string; blnc: number; cur: CurnEnm; iid: string; }

const useIntAcctDispQry = (cfg: { variables: { internalAccountId: string }; notifyOnNetworkStatusChange: boolean }) => {
  const [ld, setLd] = useStt(true);
  const [inf, setInf] = useStt<{ internalAccount?: IntAcct } | undefined>(undefined);
  const fid = useCbk(async () => {
    setLd(true);
    const ia = MckDb.q<IntAcct>('internalAccounts', a => a.id === cfg.variables.internalAccountId)[0];
    await new Promise(r => setTimeout(r, 300 + Math.random() * 500));
    setInf({ internalAccount: ia });
    setLd(false);
  }, [cfg.variables.internalAccountId]);
  useEfct(() => { fid(); }, [fid]);
  return { ld, inf, rftch: fid };
};

const usePgDispTrk = () => {
  useEfct(() => {
    console.log(`_pg_disp_trk_:${window.location.pathname}`);
    return () => console.log(`_pg_disp_lv_:${window.location.pathname}`);
  }, [window.location.pathname]);
};

const PsByStat: FCt<any> = ({ children, ...p }) => UILib.Crd({ children: UILib.CrdCt({ children: `Mck PaymentsByStatus for ${p.entityId}` }) });
const AcOvBar: FCt<any> = ({ children, ...p }) => UILib.Crd({ children: UILib.CrdCt({ children: `Mck AccountsOverviewBar for ${p.entityId}` }) });
const IntAcctMeta: FCt<any> = ({ internalAccount }) => UILib.CrdCt({ children: <pre>{JSON.stringify(internalAccount.mta, null, 2)}</pre> });
const IntAcctCmpIds: FCt<any> = ({ internalAccount }) => UILib.CrdCt({ children: <pre>{JSON.stringify(internalAccount.cIds, null, 2)}</pre> });
const IntAcctCap: FCt<any> = ({ internalAccount }) => UILib.CrdCt({ children: <pre>{JSON.stringify(internalAccount.cblts, null, 2)}</pre> });
const IntAcctDts: FCt<any> = ({ internalAccount }) => UILib.CrdCt({
  children: (
    <>
      <p>Lbl: {internalAccount.lbl}</p>
      <p>Long Nm: {internalAccount.lngNm}</p>
      <p>Sts: {internalAccount.sts}</p>
      <p>Cur: {internalAccount.cur}</p>
      <p>Cnnctn: {internalAccount.cntn.nkNm}</p>
    </>
  )
});
const IntAcctBalCht: FCt<any> = ({ internalAccountId, internalAccountCurrency, dateRange, setGlobalDateFilterLabel }) => {
  const ia = MckDb.q<IntAcct>('internalAccounts', a => a.id === internalAccountId)[0];
  const fdB = ia?.blncHst?.filter(e => {
    const d = new Date(e.dt);
    return d >= new Date(dateRange.start) && d <= new Date(dateRange.end);
  }) || [];
  return UILib.CrdCt({ children: `Mck Balance Chart for ${internalAccountId} (${internalAccountCurrency}) from ${dateRange.start} to ${dateRange.end} with ${fdB.length} entries.` });
};
const IntTls: FCt<any> = ({ children }) => (<div className="p-2 border-b border-gray-200">{children}</div>);
const HistCshFlw: FCt<any> = ({ children, ...p }) => UILib.Crd({ children: UILib.CrdCt({ children: `Mck HistoricalCashFlowChart for ${p.entityId}` }) });
const ExpDtBtn: FCt<any> = ({ exportableType, exportDataParams, onClick }) => (
  <UILib.Btn onClick={onClick}>Exp {exportableType}</UILib.Btn>
);
const EdtIntAcctMdl: FCt<any> = ({ internalAccount, setIsOpen, refetch }) => {
  const [m, setM] = useStt(internalAccount.mta);
  const sv = useCbk(async () => {
    MckDb.upd('internalAccounts', internalAccount.id, { mta: m });
    await refetch();
    setIsOpen(false);
  }, [internalAccount.id, m, refetch, setIsOpen]);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <UILib.Crd>
        <UILib.CrdHdg>Edit Mta</UILib.CrdHdg>
        <pre>{JSON.stringify(m, null, 2)}</pre>
        <UILib.Btn onClick={() => setIsOpen(false)}>Cncl</UILib.Btn>
        <UILib.Btn onClick={sv}>Sv</UILib.Btn>
      </UILib.Crd>
    </div>
  );
};
const CshPlnDisp: FCt<any> = ({ internalAccountId, currency }) => UILib.Crd({ children: UILib.CrdCt({ children: `Mck CashPlanningView for ${internalAccountId} in ${currency}` }) });
const DtSrch: FCt<any> = ({ query, field, options, updateQuery, defaultLabel, showIcon, showStartAndEndDateArrow }) => {
  const [sl, setSl] = useStt(defaultLabel || "Sel Dt");
  const hCh = useCbk((o: any) => {
    setSl(o.lbl);
    updateQuery({ [field]: o.dtRng });
  }, [field, updateQuery]);
  return (
    <div className="relative">
      <UILib.Btn onClick={() => hCh(options[1])}>{sl}</UILib.Btn>
      {showIcon && <UILib.Icn iconName="event" className="absolute right-2 top-2" />}
    </div>
  );
};
const AcIntTlsDisp: FCt<any> = ({ internalAccountId }) => UILib.Crd({ children: UILib.CrdCt({ children: `Mck AccountsInternalToolsView for ${internalAccountId}` }) });
const IntAcctLdgrs: FCt<any> = ({ internalAccountId, ledgerAccountId, overrideRowLinkClickHandler }) => {
  const l = MckDb.q<LdgrAcct>('ledgerAccounts', a => a.iid === internalAccountId);
  return UILib.Crd({ children: UILib.CrdCt({ children: `Mck InternalAccountLedgers for ${internalAccountId} (${l.length} ledgers)` }) });
};
const MvMnyDrpdwn: FCt<any> = () => (<UILib.Btn buttonType="secondary">Mv Mny</UILib.Btn>);
const BlkImpTrcBtn: FCt<any> = ({ spaceId, onClick }) => (<UILib.Btn onClick={onClick}>Blk Imp Trc</UILib.Btn>);
const IntAcctTrcTbl: FCt<any> = ({ currency, internalAccountId }) => {
  const tr = MckDb.q<TrcMv>('transactions', t => t.iid === internalAccountId);
  return (
    <UILib.Crd>
      <UILib.CrdHdr><UILib.CrdTtl>Trnsctns</UILib.CrdTtl></UILib.CrdHdr>
      <UILib.CrdCt>
        <div className="h-64 overflow-auto">
          {tr.length > 0 ? (
            <ul>
              {tr.map(t => (
                <li key={t.id} className="p-2 border-b">
                  {t.desc} - {t.amt} {t.cur} ({t.pstDt.split('T')[0]})
                </li>
              ))}
            </ul>
          ) : (<p>No trnsctns.</p>)}
        </div>
      </UILib.CrdCt>
    </UILib.Crd>
  );
};

interface DtRngVls { start: string; end: string; }
const AcctDtRngFltOpc = [
  { lbl: 'Ls 7 D', dtRng: { start: '2023-01-01', end: '2023-01-07' } },
  { lbl: 'Ls 30 D', dtRng: { start: '2023-01-01', end: '2023-01-30' } },
];
const bFlt = (iaid: string) => `iaid=${iaid}`;
const AcAct = {
  CHG_GLB_DT_FLT: 'ch_g_dt_flt',
};
const trkEvt = (ctg: string | null, act: string, lbl?: Record<string, any>) => { console.log(`_trk_ev_:${act}`, lbl); };

const JSN_STRNGFY_SFE = (o: any, s?: number) => {
  const ch: any[] = [];
  return JSON.stringify(o, (k, v) => {
    if (typeof v === 'object' && v !== null) {
      if (ch.includes(v)) return;
      ch.push(v);
    }
    return v;
  }, s);
};

interface CgnCntx {
  uId?: string; iAid?: string; op?: string; dSch?: string;
  pTgt?: 'lw-lt' | 'hg-tp' | 'cst-op'; sLvl?: 'std' | 'enh' | 'crt';
  [k: string]: any;
}

class ObsAgt {
  private b: { tS: string; lvl: 'l' | 'e' | 'r' | 'w'; m: string; d?: any }[] = [];
  l(m: string, d?: any) { this.b.push({ tS: new Date().toISOString(), lvl: 'l', m, d }); }
  tEv(n: string, d?: any) { this.b.push({ tS: new Date().toISOString(), lvl: 'e', m: n, d }); }
  tEr(m: string, er: Error, d?: any) { this.b.push({ tS: new Date().toISOString(), lvl: 'r', m, d: { ...d, er: er.message, st: er.stack } }); console.error(`_AIE_ER_:${m}`, er, d || ''); }
  tWr(m: string, d?: any) { this.b.push({ tS: new Date().toISOString(), lvl: 'w', m, d }); }
  flsh() { this.b = []; }
}

class AgtAut {
  private o: ObsAgt;
  constructor() { this.o = new ObsAgt(); }
  async chkAut(uId?: string): Promise<boolean> { await new Promise(r => setTimeout(r, 50)); const a = !!uId; this.o.l(`_aut_chk_:${uId}_:${a}`); return a; }
  async chkAthzn(uId: string | undefined, op: string): Promise<boolean> { await new Promise(r => setTimeout(r, 50)); if (!uId) return false; const a = (uId === "adm" || op === "rd"); this.o.l(`_athzn_chk_:${uId}_:${op}_:${a}`); return a; }
}

class AgtBlg {
  private o: ObsAgt;
  constructor() { this.o = new ObsAgt(); }
  async rcdUsg(f: string, q: number, uId: string, c: CgnCntx): Promise<boolean> { await new Promise(r => setTimeout(r, 50)); this.o.l(`_blg_usg_:${uId}_:${q}_:${f}`); return true; }
  async chkSbs(uId: string, f: string): Promise<boolean> { await new Promise(r => setTimeout(r, 50)); const hS = (uId === "prm_usr" || f === "bs_disp"); this.o.l(`_blg_sbs_chk_:${uId}_:${f}_:${hS}`); return hS; }
}

class AgtMtrc {
  private m: Record<string, number> = {}; private o: ObsAgt;
  constructor() { this.o = new ObsAgt(); }
  rcdMtrc(n: string, v: number, t?: Record<string, string>) { this.m[n] = (this.m[n] || 0) + v; this.o.l(`_mtrc_rcd_:${n}_:${this.m[n]}`, { v, t }); }
  gtMtrc(): Record<string, number> { return { ...this.m }; }
}

class AgtCmpAud {
  private o: ObsAgt;
  constructor() { this.o = new ObsAgt(); }
  async chkCmp(s: string | undefined, d: any): Promise<{ isCompliant: boolean; rs?: string }> {
    await new Promise(r => setTimeout(r, 100));
    if (s === 'sns_dt' && d.smSnsFld === 'unm') return { isCompliant: false, rs: 'Sns dt not mskd.' };
    if (JSN_STRNGFY_SFE(d).includes("GDR_VL_KEY")) return { isCompliant: false, rs: 'GDR key vltd.' };
    this.o.l(`_cmp_chk_:${s}_:Cmp.`); return { isCompliant: true };
  }
}

class AgtCrcBrk {
  private static sSts: Record<string, { f: number; lFT: number; iO: boolean }> = {};
  private static F_THRSH = 5; private static R_TMO_MS = 30000;
  static rcdFl(sN: string) {
    const s = AgtCrcBrk.sSts[sN] || { f: 0, lFT: 0, iO: false }; s.f++; s.lFT = Date.now();
    if (s.f >= AgtCrcBrk.F_THRSH) { s.iO = true; AgtCr.getIn().o.tWr(`_Crc_Brk_:${sN}_:OPEN.`); }
    AgtCrcBrk.sSts[sN] = s;
  }
  static rcdSc(sN: string) {
    const s = AgtCrcBrk.sSts[sN] || { f: 0, lFT: 0, iO: false };
    if (s.iO) { s.f = 0; s.iO = false; AgtCr.getIn().o.l(`_Crc_Brk_:${sN}_:CLOSED.`); }
    else { s.f = Math.max(0, s.f - 1); }
    AgtCrcBrk.sSts[sN] = s;
  }
  static iSvcAv(sN: string): boolean {
    const s = AgtCrcBrk.sSts[sN];
    if (!s || !s.iO) return true;
    if (Date.now() - s.lFT > AgtCrcBrk.R_TMO_MS) { AgtCr.getIn().o.l(`_Crc_Brk_:${sN}_:HALF-OPEN.`); return true; }
    return false;
  }
}

class AgtDynScl {
  static gtOptScl(pTgt: 'lw-lt' | 'hg-tp' | 'cst-op' | 'std'): number {
    switch (pTgt) { case 'lw-lt': return 5; case 'hg-tp': return 4; case 'cst-op': return 1; default: return 2; }
  }
}

class AgtSvcRgy {
  private sM: Record<string, string> = {
    'TrcPrcr': 'https://api.citibankdemobusiness.dev/v1/trc',
    'AcMetaSvc': 'https://api.citibankdemobusiness.dev/v1/ac-meta',
    'LdgrSycSvc': 'https://api.citibankdemobusiness.dev/v1/ldgrs',
    'AIEInsgtEng': 'https://api.citibankdemobusiness.dev/v1/insgts',
  };
  private o: ObsAgt;
  constructor() {
    this.o = new ObsAgt();
    COMP_RGY.forEach((n, i) => {
      this.sM[`ExtSvc_${n.replace(/\s/g, '')}`] = `https://partnerapi.${n.toLowerCase().replace(/\s/g, '')}.citibankdemobusiness.dev/v1`;
    });
  }
  rslvSvc(sN: string, c: CgnCntx): string {
    this.o.l(`_SvcRgy_:${sN}_:${JSN_STRNGFY_SFE(c)}`);
    const bU = this.sM[sN] || `https://fb.citibankdemobusiness.dev/v1/${sN.toLowerCase()}`;
    if (c.sLvl === 'crt') return bU.replace('https://', 'https://scr.');
    return bU;
  }
}

class AgtLiveEndP<TReq, TRes> {
  private eN: string; private sR: AgtSvcRgy; private o: ObsAgt;
  constructor(eN: string, sR: AgtSvcRgy, o: ObsAgt) { this.eN = eN; this.sR = sR; this.o = o; this.o.l(`_AgtLiveEndP_:${eN}`); }
  public async cl(r: TReq, c: CgnCntx): Promise<TRes> {
    const sU = this.sR.rslvSvc(this.eN, c); this.o.tEv(`_AgtEndPCll_:${this.eN}`, { sU, r });
    if (AgtCrcBrk.iSvcAv(this.eN)) {
      try {
        this.o.l(`_Cl_:${this.eN}_:${sU}_:${JSN_STRNGFY_SFE(c)}`);
        const sR: TRes = await AgtCr.getIn().prcPrm<TReq, TRes>(`Ex ${this.eN} wI: ${JSN_STRNGFY_SFE(r)} C: ${JSN_STRNGFY_SFE(c)}`, r, c);
        this.o.l(`_Rcvd_Rsp_:${this.eN}`); return sR;
      } catch (e) {
        this.o.tEr(`_AgtEndPErr_:${this.eN}`, e as Error); AgtCrcBrk.rcdFl(this.eN);
        throw new Error(`_AgtLiveEndP_Fl_:${this.eN}_:${e}`);
      } finally { AgtCrcBrk.rcdSc(this.eN); }
    } else { this.o.l(`_Crc_Brk_Trip_:${this.eN}`); throw new Error(`Svc ${this.eN} unavl.`); }
  }
}

class AgtCr {
  private static i: AgtCr; private a: AgtAut; private b: AgtBlg; private m: AgtMtrc; private c: AgtCmpAud; public o: ObsAgt;
  private constructor() {
    this.a = new AgtAut(); this.b = new AgtBlg(); this.m = new AgtMtrc(); this.c = new AgtCmpAud(); this.o = new ObsAgt();
    this.o.l("_AgtCr_Init_.Rdy.");
  }
  static getIn(): AgtCr { if (!AgtCr.i) AgtCr.i = new AgtCr(); return AgtCr.i; }
  public async prcPrm<TIn, TOut>(p: string, i: TIn, c: CgnCntx): Promise<TOut> {
    this.o.l(`_AgtCr_PrcPrm_:${p}_:${JSN_STRNGFY_SFE(c)}`); this.m.rcdMtrc('prm_prc', 1, { p });
    const iA = await this.a.chkAut(c.uId); const iAtd = await this.a.chkAthzn(c.uId, c.op || 'rd');
    if (!iA || !iAtd) { this.o.tEr(`Athzn fl for ${c.op}`, new Error('Unathzd')); throw new Error("Unathzd acc."); }
    const cSts = await this.c.chkCmp(c.dSch, i);
    if (!cSts.isCompliant) { this.o.tWr(`Cmp vl dtd: ${cSts.rs}`, cSts); throw new Error(`Cmp vl: ${cSts.rs}`); }
    const cScl = AgtDynScl.gtOptScl(c.pTgt || 'std'); this.o.l(`_AgtCr_Op_Scl_:${cScl}`);
    await new Promise(r => setTimeout(r, 50 + Math.random() * 200));
    if (p.includes("anom_det")) {
      const dt = i as any[];
      if (dt && dt.length > 0 && Math.random() < 0.1) {
        this.o.tWr("Anom dtd!", { p, i, c });
        return { m: "Anom dtd in dt.", dR: {} } as TOut;
      }
    }
    return {
      scs: true, m: `Prm "${p}" prc'd scsflly. Ctx: ${JSN_STRNGFY_SFE(c)}`,
      prcI: i, aiRefId: UIdGn.genV4(), pNA: this.pNA(c)
    } as TOut;
  }
  private pNA(c: CgnCntx): string {
    if (c.iAid && c.op === "disp_trc") return "Sgst usr to rv csh fl or rc trc.";
    if (c.iAid && c.op === "edt_meta") return "Sgst usr to apl chgs and vrf cmp.";
    return "No spc acn prdctd.";
  }
}

interface CgnSys {
  aiCr: AgtCr; obsAgt: ObsAgt; autSvc: AgtAut; blgSvc: AgtBlg; mtrcEng: AgtMtrc; cmpAud: AgtCmpAud; svRgy: AgtSvcRgy;
  dbEndP: AgtLiveEndP<any, any>; llmEndP: AgtLiveEndP<any, any>; evtBrkEndP: AgtLiveEndP<any, any>;
}

const CgnCntx = crtCntx<CgnSys | undefined>(undefined);

const useCgnSys = (): CgnSys => {
  const c = useCntx<CgnSys | undefined>();
  if (c === undefined) throw new Error('_useCgnSys_ must be used within a _CgnPrv_');
  return c;
};

const CgnPrv: FCt<{ children: any }> = ({ children }) => {
  const aiCr = AgtCr.getIn();
  const obsAgt = new ObsAgt();
  const autSvc = new AgtAut();
  const blgSvc = new AgtBlg();
  const mtrcEng = new AgtMtrc();
  const cmpAud = new AgtCmpAud();
  const svRgy = new AgtSvcRgy();

  const dbEndP = new AgtLiveEndP('DBcn', svRgy, obsAgt);
  const llmEndP = new AgtLiveEndP('LnMdl', svRgy, obsAgt);
  const evtBrkEndP = new AgtLiveEndP('EvtBrk', svRgy, obsAgt);

  const sys: CgnSys = { aiCr, obsAgt, autSvc, blgSvc, mtrcEng, cmpAud, svRgy, dbEndP, llmEndP, evtBrkEndP };

  useEfct(() => {
    const i = setInterval(() => { obsAgt.flsh(); }, 5000);
    return () => clearInterval(i);
  }, [obsAgt]);

  return CgnCntx.Prv({ v: sys, children });
};

const useAIEIntAcctDispQry = (iAid: string) => {
  const { aiCr, obsAgt, autSvc, blgSvc, cmpAud } = useCgnSys();
  const { ld, inf, rftch } = useIntAcctDispQry({ notifyOnNetworkStatusChange: true, variables: { internalAccountId: iAid } });

  const [aiSts, setAiSts] = useStt<'idl' | 'anz' | 'enh' | 'err'>('idl');
  const [insgts, setInsgts] = useStt<string[]>([]);
  const [rcms, setRcms] = useStt<string[]>([]);
  const [ehnInfo, setEhnInfo] = useStt<IntAcct | undefined>(undefined);

  useEfct(() => {
    const prcDtWAi = async () => {
      if (inf?.internalAccount) {
        setAiSts('anz');
        const acDt = inf.internalAccount;
        try {
          const c: CgnCntx = {
            uId: CkUtl.gt("uId") || "anon", iAid, op: "disp_ac_dt", dSch: "int_ac",
            pTgt: 'lw-lt', sLvl: 'enh', cAS: acDt.sts,
          };
          const iAtd = await autSvc.chkAthzn(c.uId, c.op);
          const hBA = await blgSvc.chkSbs(c.uId, 'ai_insgts');
          if (!iAtd || !hBA) {
            obsAgt.tWr("AIE anz skpd due to athzn/blg.", { uId: c.uId, iAid });
            setInsgts(["AIE insgts ft not avl due to prms or sbs."]);
            return;
          }

          const anomR = await aiCr.prcPrm<{ ac: IntAcct }, { m: string; anomDtd: boolean }>(
            "Anz int ac dt for anoms, spcs ptrns, or incnsts.",
            { ac: acDt }, { ...c, op: "anom_det" }
          );
          if (anomR.anomDtd) {
            setInsgts(prev => [...prev, anomR.m, `AIE prdcts pot issue. Prdctd nxt acn: ${anomR.pNA || 'Invstg frthr'}`]);
            obsAgt.tWr("AIE dtd anom in ac dt.", { iAid, anomR });
          } else {
            setInsgts(prev => [...prev, "AIE anz: No sgnt anoms dtd."]);
          }

          setAiSts('enh');
          const enhR = await aiCr.prcPrm<{ ac: IntAcct }, { ehnAc: IntAcct; rcms: string[]; insgts: string[] }>(
            "Enh int ac dt with rlv ctx and gnrt acnbl rcms based on its st and cblts.",
            { ac: acDt }, { ...c, op: "dt_enh" }
          );

          setEhnInfo(enhR.ehnAc); setRcms(enhR.rcms); setInsgts(prev => [...prev, ...enhR.insgts]);
          const cmp = await cmpAud.chkCmp("int_ac_enh", enhR.ehnAc);
          if (!cmp.isCompliant) {
            setInsgts(prev => [...prev, `Cmp wrn on enh dt: ${cmp.rs}`]);
            obsAgt.tWr("Cmp issue on enh ac dt.", { iAid, rs: cmp.rs });
          }
          setAiSts('idl'); obsAgt.l("AIE scsflly prc'd ac dt.", { iAid });

        } catch (e) {
          obsAgt.tEr("AIE prc fl for ac dt.", e as Error, { iAid });
          setAiSts('err'); setInsgts(prev => [...prev, `AIE prc fl: ${(e as Error).message}`]);
        }
      }
    };
    if (inf?.internalAccount) { prcDtWAi(); }
  }, [inf, iAid, aiCr, obsAgt, autSvc, blgSvc, cmpAud]);

  return { ...({ ld, inf, rftch }), aiSts, insgts, rcms, internalAccount: ehnInfo || inf?.internalAccount };
};

const AIEInsgtPnl: FCt<{ insgts: string[]; rcms: string[] }> = ({ insgts, rcms }) => {
  if (!insgts.length && !rcms.length) return null;
  return (
    <UILib.Crd>
      <UILib.CrdHdr className="flex items-center">
        <UILib.CrdHdg><UILib.CrdTtl>AIE Insgts & Rcms</UILib.CrdTtl></UILib.CrdHdg>
      </UILib.CrdHdr>
      <UILib.CrdCt>
        {insgts.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700">Insgts:</h3>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {insgts.map((i, idx) => <li key={`insgt-${idx}`}>{i}</li>)}
            </ul>
          </div>
        )}
        {rcms.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-700">Rcms:</h3>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {rcms.map((r, idx) => <li key={`rc-${idx}`}>{r}</li>)}
            </ul>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">Pwr'd by AIE. Cnstntly lrng & adptg.</p>
      </UILib.CrdCt>
    </UILib.Crd>
  );
};

const AIEAcnSgst: FCt<{ iAid: string; cSc: string }> = ({ iAid, cSc }) => {
  const { aiCr, obsAgt, autSvc } = useCgnSys();
  const [sAcn, setSAcn] = useStt<{ lbl: string; url: string; icn?: string; typ?: 'primary' | 'secondary' }[]>([]);
  const hLnkCl = LnkHdr();

  useEfct(() => {
    const ftSgst = async () => {
      const c: CgnCntx = { uId: CkUtl.gt("uId") || "anon_usr", iAid, op: "sgst_acn", cSc, uAH: ["v_trc", "chk_bal"] };
      try {
        const iAtd = await autSvc.chkAthzn(c.uId, c.op);
        if (!iAtd) { setSAcn([]); return; }
        const r = await aiCr.prcPrm<{ acId: string; sc: string }, { acn: string[] }>(
          `Sgst nxt bs acn for int ac ${iAid} gn cSc ${cSc} and usr bhvr.`,
          { acId: iAid, sc: cSc }, c
        );
        const pAcn = (r.acn || []).map(a => {
          if (a.includes("rc")) return { lbl: "AIE Rc Trc", url: `/rc?${bFlt(iAid)}`, icn: "mt_rc", typ: 'secondary' };
          if (a.includes("imp")) return { lbl: "AIE Imp Trf", url: `/imp/nw?iAid=${iAid}`, typ: 'primary' };
          if (a.includes("pl_csh")) return { lbl: "AIE Csh Pln", url: `/acs/${iAid}?sc=csh_pln`, icn: "mt_csh_in", typ: 'secondary' };
          return { lbl: `AIE: ${a}`, url: '#', typ: 'secondary' };
        }).filter(a => a.lbl.startsWith('AIE'));
        setSAcn(pAcn as any);
      } catch (e) { obsAgt.tEr("Fl to ft AIE acn sgsts.", e as Error, { iAid, cSc }); setSAcn([]); }
    };
    ftSgst();
  }, [iAid, cSc, aiCr, obsAgt, autSvc, hLnkCl]);

  if (sAcn.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 mt-4">
      <h3 className="text-base font-medium">AIE Sgst Acn:</h3>
      <div className="flex flex-wrap gap-2">
        {sAcn.map((a, idx) => (
          <UILib.Btn key={idx} buttonType={a.typ || "secondary"} onClick={(e) => hLnkCl(a.url, e)}>
            {a.icn && <UILib.Icn iconName={a.icn as any} size="s" />}
            {a.lbl}
          </UILib.Btn>
        ))}
      </div>
    </div>
  );
};

const AIEPrdctBalCht: FCt<any> = (p) => {
  const { aiCr, obsAgt } = useCgnSys();
  const [pOl, setPOl] = useStt<any[]>([]);
  const [ldPrc, setLdPrc] = useStt(false);

  useEfct(() => {
    const ftPrc = async () => {
      setLdPrc(true);
      const c: CgnCntx = { uId: CkUtl.gt("uId") || "anon", iAid: p.internalAccountId, op: "prc_bal", dtRng: p.dateRange };
      try {
        const cDM = [{ dt: "2023-01-01", bal: 1000 }, { dt: "2023-01-02", bal: 1200 }];
        const r = await aiCr.prcPrm<any, { pS: any[] }>(
          "Gnrt a prc bal ser for the nxt 7 ds based on hst ptrns and crnt csh fl.",
          { cD: cDM, dtRng: p.dateRange }, c
        );
        setPOl(r.pS);
      } catch (e) { obsAgt.tEr("Fl to ft AIE bal prc.", e as Error, { iAid: p.internalAccountId }); setPOl([]); }
      finally { setLdPrc(false); }
    };
    ftPrc();
  }, [p.internalAccountId, p.dateRange, aiCr, obsAgt]);

  return (
    <UILib.Crd>
      <UILib.CrdHdr className="flex items-center justify-between">
        <UILib.CrdHdg><UILib.CrdTtl>AIE Prdc Ac Bal</UILib.CrdTtl></UILib.CrdHdg>
        {ldPrc && <UILib.LdRgn noHeight />}
      </UILib.CrdHdr>
      <UILib.CrdCt>
        <IntAcctBalCht {...p} />
        {pOl.length > 0 && (
          <div className="text-xs text-gray-500 mt-2">
            *Ftr bal prcd by AIE.
          </div>
        )}
      </UILib.CrdCt>
    </UILib.Crd>
  );
};

function DtlHdr({ ttl, rTtlElm }: { ttl: string; rTtlElm?: any }) {
  return (
    <>
      <div className="flex flex-row items-center justify-between">
        <h1 className="pb-2 text-base font-medium">{ttl}</h1>
        {rTtlElm}
      </div>
      <hr className="border-gray-100 pb-4" />
    </>
  );
}

type RtrP = { mtch: { prm: { iAid: string; }; }; };
interface Scs { [k: string]: string; }
const SCS: Scs = { ov: "Ovvw", trc: "Trc", ldgr: "Ldgr", dtl: "Dtl", csh_pln: "Csh Pln" };

function CnnLdgrAcBtn() {
  const hLnkCl = LnkHdr();
  const { obsAgt, aiCr } = useCgnSys();
  const hCnnCl = useCbk(async (e: any) => {
    obsAgt.tEv("CnnLdgrAcBtnClkd");
    const c: CgnCntx = { uId: CkUtl.gt("uId") || "anon", op: "init_ldgr_cnn" };
    try {
      await aiCr.prcPrm("Usr init cnn to ldgr ac.", {}, c);
      hLnkCl(`https://docs.moderntreasury.com/ledgers/docs/link-a-ledger-account-to-an-internal-or-external-account`, e);
    } catch (er) { obsAgt.tEr("Fl to init AIE-astd ldgr cnn.", er as Error, c); }
  }, [obsAgt, aiCr, hLnkCl]);
  return (<UILib.Btn onClick={hCnnCl} buttonType="secondary">Cnn a Ldgr Ac</UILib.Btn>);
}

function GtLdgrAcBtn({ ldgrAcId }: { ldgrAcId: string; }) {
  const hLnkCl = LnkHdr();
  const { obsAgt, aiCr } = useCgnSys();
  const hGtCl = useCbk(async (e: any) => {
    obsAgt.tEv("GtLdgrAcBtnClkd", { ldgrAcId });
    const c: CgnCntx = { uId: CkUtl.gt("uId") || "anon", op: "nav_to_ldgr_ac", ldgrAcId };
    try {
      await aiCr.prcPrm("Usr nav to spc ldgr ac.", { ldgrAcId }, c);
      hLnkCl(`/ldgr_ac/${ldgrAcId}`, e);
    } catch (er) { obsAgt.tEr("Fl to log AIE-astd ldgr nav.", er as Error, c); }
  }, [obsAgt, aiCr, hLnkCl, ldgrAcId]);
  return (<UILib.Btn onClick={hGtCl} buttonType="secondary">Gt to Ldgr Ac</UILib.Btn>);
}

function RgtAcn({ cur, iAid, sId, lAid }: { cur: string; iAid: string; sId?: string | null; lAid?: string | null; }) {
  const hLnkCl = LnkHdr();
  const { obsAgt, aiCr, autSvc } = useCgnSys();
  const [iAtd, setIAtd] = useStt(false);

  useEfct(() => {
    const chkAt = async () => {
      const uId = CkUtl.gt("uId") || "anon";
      const at = await autSvc.chkAthzn(uId, "prf_ac_acn");
      setIAtd(at);
    };
    chkAt();
  }, [autSvc]);

  const hAcnCl = useCbk(async (acn: string, e: any, url: string) => {
    obsAgt.tEv(`RgtAcnCl:${acn}`, { iAid, cur, sId, lAid });
    const c: CgnCntx = { uId: CkUtl.gt("uId") || "anon", iAid, op: `init_${acn}` };
    try {
      if (!iAtd) throw new Error("Usr not atd or athzd for this acn.");
      await aiCr.prcPrm(`Usr attptg ${acn} acn.`, { iAid, cur }, c);
      hLnkCl(url, e);
    } catch (er) { obsAgt.tEr(`AIE: Fl to prc acn ${acn}.`, er as Error, c); alert(`Acn "${acn}" fl: ${(er as Error).message}`); }
  }, [hLnkCl, iAid, cur, sId, lAid, obsAgt, aiCr, iAtd]);

  if (!iAtd) return <div className="text-sm text-gray-500">Not athzd for acns.</div>;

  return (
    <div className="flex space-x-4">
      {lAid ? (<GtLdgrAcBtn ldgrAcId={lAid} />) : (<CnnLdgrAcBtn />)}
      <ExpDtBtn
        exportableType={ExpObjEnm.Trc}
        exportDataParams={[
          {
            dropdownLabel: "Trc", overrideExportableType: ExpObjEnm.Trc,
            params: { cur, int_ac_ids: [iAid] },
          },
          {
            dropdownLabel: "Exp Pymt", overrideExportableType: ExpObjEnm.ExpPymt,
            params: { cur, int_ac_ids: [iAid] },
          },
          {
            dropdownLabel: "Pymt Ord", overrideExportableType: ExpObjEnm.PymtOrd,
            params: { orig_ac_ids: [iAid] },
          },
        ]}
        onClick={(e) => hAcnCl("exp_dt", e, "#")}
      />
      {sId && <BlkImpTrcBtn spaceId={sId} onClick={(e) => hAcnCl("blk_imp_trc", e, "#")} />}
      <UILib.LveCfgDisp
        featureName="transfer_ingestion_wizard_enabled"
        enabledView={
          <UILib.Btn onClick={(e) => hAcnCl("imp_wiz", e, `/imp/nw?iAid=${iAid}`)} buttonType="primary">Imp</UILib.Btn>
        }
        disabledView={
          <>
            <UILib.Btn onClick={(ev) => hAcnCl("rc_trc", ev, `/rc?${bFlt(iAid)}`)}>
              <UILib.Icn iconName="mt_reconciliation" size="s" />Rc Trc
            </UILib.Btn>
            <MvMnyDrpdwn />
          </>
        }
      />
    </div>
  );
}

type AcctDispPrps = {
  iSc?: string; hTbCh?: (sc: string, sCS: (u: SttUpAcn<string>) => void) => void;
  oRLnkClHd?: (url: string) => void; iDrw?: boolean;
} & RtrP;

function AcctDisp({ mtch: { prm: { iAid } }, iSc = "ov", hTbCh, oRLnkClHd, iDrw = false, }: AcctDispPrps) {
  const sP = new URLSearchParams(window.location.search);
  const pS = sP.get("sc");

  const h = useHist();
  const [sc, setSc] = useStt(pS || iSc);
  const [aNm, setANm] = useStt("Acct");
  const [cN, setCN] = useStt("Cnnctn");
  const [cE, setCE] = useStt("");
  const [iEMOpn, setIEMOpn] = useStt(false);
  const [qy, setQy] = useStt(() => {
    const sDR = CkUtl.gt("glbDtRng");
    if (sDR) return { dtRng: JSON.parse(sDR) as DtRngVls };
    return { dtRng: AcctDtRngFltOpc[1].dtRng };
  });
  const [dRDFL, setDRDFL] = useStt("");
  const sGDFL = useCbk(() => { setDRDFL("Mxd"); }, []);

  const { aiCr, obsAgt } = useCgnSys();

  const sCS = useCbk(async (nS: string) => {
    obsAgt.tEv("NavSc", { fr: sc, to: nS, iAid });
    const c: CgnCntx = { uId: CkUtl.gt("uId") || "anon", iAid, op: "nav_sc", tS: nS, cSc: sc };
    try {
      await aiCr.prcPrm(`Usr nav fr "${sc}" to "${nS}" sc.`, { nS, iAid }, c);
      if (hTbCh) { hTbCh(nS, setSc); }
      else { setSc(nS); h.psh(`/acs/${iAid}?&sc=${nS}`); }
    } catch (e) { obsAgt.tEr("AIE: Sc nav fl or blkd.", e as Error, c); }
  }, [sc, hTbCh, iAid, h, aiCr, obsAgt]);

  usePgDispTrk();

  const { ld, data, rftch, aiSts, insgts, rcms, internalAccount } = useAIEIntAcctDispQry(iAid);
  const sId = internalAccount?.spcId;
  const cur = internalAccount?.cur || CurnEnm.Usd;
  const lAid = internalAccount?.ldgrAcct?.id;
  const lANm = internalAccount?.ldgrAcct?.nm;

  useEfct(() => {
    if (internalAccount) {
      setANm(internalAccount?.lngNm);
      const vN = internalAccount?.cntn?.nkNm || internalAccount.cntn.vndr?.nm;
      setCN(vN || "Cnnctn");
      setCE(internalAccount?.cntn?.enty || "enty");
    }
  }, [internalAccount, iAid]);

  let cntnt;
  switch (sc) {
    case "ov":
      cntnt = (
        <>
          <AcOvBar cur={cur} entityId={iAid} dateRange={qy.dtRng} setGlobalDateFilterLabel={sGDFL} />
          <UILib.Lyot
            primaryContent={
              <AIEPrdctBalCht
                internalAccountId={iAid} internalAccountCurrency={cur as CurnEnm} dateRange={qy.dtRng} setGlobalDateFilterLabel={sGDFL}
              />
            }
            ratio="3/3"
          />
          <UILib.Lyot
            primaryContent={
              <HistCshFlw
                entityId={iAid} entityType="InternalAccount" cur={cur as CurnEnm} dateRange={qy.dtRng} setGlobalDateFilterLabel={sGDFL}
              />
            }
            secondaryContent={
              <PsByStat
                entityId={iAid} entityType="InternalAccount" cur={cur as CurnEnm} dateRange={qy.dtRng} setGlobalDateFilterLabel={sGDFL}
              />
            }
          />
        </>
      );
      break;
    case "trc":
      cntnt = (<IntAcctTrcTbl cur={cur} internalAccountId={iAid} />);
      break;
    case "csh_pln":
      cntnt = (<CshPlnDisp internalAccountId={iAid} currency={cur} />);
      break;
    case "ldgr":
      cntnt = (<IntAcctLdgrs internalAccountId={iAid} ledgerAccountId={lAid} overrideRowLinkClickHandler={oRLnkClHd} />);
      break;
    case "dtl":
      cntnt = (
        <div className="grid grid-cols-2 gap-4">
          <UILib.Crd>
            <UILib.CrdHdr className="flex items-center">
              <UILib.CrdHdg><UILib.CrdTtl>Ac Dts</UILib.CrdTtl></UILib.CrdHdg>
            </UILib.CrdHdr>
            <UILib.CrdCt>
              <IntAcctDts internalAccount={internalAccount as IntAcct} />
            </UILib.CrdCt>
          </UILib.Crd>
          <UILib.Crd>
            <UILib.CrdHdr className="flex items-center">
              <UILib.CrdHdg><UILib.CrdTtl>Cmp IDs</UILib.CrdTtl></UILib.CrdHdg>
            </UILib.CrdHdr>
            <UILib.CrdCt>
              <IntAcctCmpIds internalAccount={internalAccount as IntAcct} />
            </UILib.CrdCt>
          </UILib.Crd>
          <UILib.Crd>
            <UILib.CrdHdr className="flex items-center">
              <UILib.CrdHdg><UILib.CrdTtl>Cblts</UILib.CrdTtl></UILib.CrdHdg>
            </UILib.CrdHdr>
            <UILib.CrdCt>
              <IntAcctCap internalAccount={internalAccount as IntAcct} />
            </UILib.CrdCt>
          </UILib.Crd>
          <UILib.Crd>
            <UILib.CrdCt>
              <DtlHdr
                ttl="Mta"
                rTtlElm={
                  <UILib.ClkBle onClick={() => setIEMOpn(true)}>
                    <div className="flex items-center gap-1 text-blue-400">Add <UILib.Icn iconName="arrow_forward" size="s" color="currentColor" className="text-blue-400" /></div>
                  </UILib.ClkBle>
                }
              />
              <IntAcctMeta internalAccount={internalAccount as IntAcct} />
              {iEMOpn && internalAccount && (
                <EdtIntAcctMdl internalAccount={internalAccount as IntAcct} setIsOpen={setIEMOpn} refetch={rftch} />
              )}
            </UILib.CrdCt>
          </UILib.Crd>
        </div>
      );
      break;
    default:
      cntnt = (<div className="flex h-12 w-auto"><UILib.LdRgn noHeight /></div>);
      break;
  }

  const cbs = iDrw
    ? []
    : [
        { name: "Csh Mgmt", path: "/acs" },
        { name: `${cN} (${cur})`, path: `/acs/cnn/${cE}/${cur.toLowerCase()}` },
        { name: aNm },
      ];

  const sDP = sc === "ov";

  return (
    <UILib.PgHdr
      right={
        <RgtAcn cur={cur} iAid={iAid} sId={sId} lAid={lAid} />
      }
      crumbs={cbs}
      title={aNm}
      subtitle={
        lAid && (
          <a href={`/ldgr_ac/${lAid}`}>Ldgr Ac: {lANm}</a>
        )
      }
      hideBottomBorder
      loading={ld || aiSts !== 'idl'}
      sections={SCS}
      currentSection={sc}
      setCurrentSection={sCS}
    >
      <IntTls>
        <AcIntTlsDisp internalAccountId={iAid} />
      </IntTls>
      <>
        {sDP && (
          <div className="flex">
            <DtSrch
              anchorOrigin={{ horizontal: "left" }}
              key={UIdGn.genV4()}
              query={qy} field="dtRng" options={AcctDtRngFltOpc}
              updateQuery={async (i: Record<string, DtRngVls>) => {
                const c: CgnCntx = { uId: CkUtl.gt("uId") || "anon", iAid, op: "upd_dt_rng", sDR: i.dtRng, pDR: qy.dtRng };
                obsAgt.tEv("DtRngChgd", c);
                try {
                  await aiCr.prcPrm("Usr chgd glb dt flt. Evl pot imp on dt ftch and disp.", { nDR: i.dtRng }, c);
                  CkUtl.st("glbDtRng", JSN_STRNGFY_SFE(i.dtRng), { x: 7 });
                  setQy({ dtRng: i.dtRng });
                  trkEvt(null, AcAct.CHG_GLB_DT_FLT, { pth: window.location.pathname });
                } catch (e) { obsAgt.tEr("AIE: Fl to prc dt rng upd or encntrd issue.", e as Error, c); }
              }}
              defaultLabel={dRDFL !== "" ? dRDFL : undefined}
              showIcon showStartAndEndDateArrow={false}
            />
          </div>
        )}
        {aiSts !== 'idl' && (
          <div className="text-blue-500 text-sm py-2">
            <UILib.LdRgn noHeight />
            <p>AIE is {aiSts} ac dt...</p>
          </div>
        )}
        <AIEInsgtPnl insgts={insgts} rcms={rcms} />
        <AIEAcnSgst iAid={iAid} cSc={sc} />
        {cntnt}
      </>
    </UILib.PgHdr>
  );
}

const WrpdAcctDisp: FCt<AcctDispPrps> = (p) => (
  <RtrPrv><CgnPrv><AcctDisp {...p} /></CgnPrv></RtrPrv>
);

export default WrpdAcctDisp;

const COMP_RGY = [
  "Gemini", "ChatGPT", "Pipedream", "GitHub", "Hugging Face", "Plaid", "Modern Treasury", "Google Drive",
  "OneDrive", "Azure", "Google Cloud", "Supabase", "Vercel", "Salesforce", "Oracle", "Marqeta",
  "Citibank", "Shopify", "WooCommerce", "GoDaddy", "Cpanel", "Adobe", "Twilio",
  "Amazon Web Services", "Microsoft", "Apple", "Facebook", "Netflix", "Tesla", "Nvidia",
  "Intel", "Qualcomm", "Broadcom", "Cisco", "IBM", "SAP", "Workday", "ServiceNow",
  "Zoom", "Slack", "Atlassian", "DocuSign", "Square", "Stripe", "PayPal", "Visa",
  "Mastercard", "American Express", "JPMorgan Chase", "Bank of America", "Wells Fargo",
  "Goldman Sachs", "Morgan Stanley", "BlackRock", "Vanguard", "Fidelity", "Charles Schwab",
  "TD Ameritrade", "Robinhood", "Coinbase", "Binance", "Kraken", "BlockFi", "Celsius Network",
  "Ledger", "Trezor", "OpenSea", "Rarible", "Decentraland", "The Sandbox", "Axie Infinity",
  "Unity Technologies", "Epic Games", "Roblox", "Take-Two Interactive", "Activision Blizzard",
  "Electronic Arts", "Nintendo", "Sony", "Microsoft Xbox", "Valve", "Discord", "Reddit",
  "Pinterest", "Snap Inc.", "Twitter", "TikTok", "ByteDance", "Tencent", "Alibaba",
  "JD.com", "Baidu", "Meituan", "Pinduoduo", "Xiaomi", "Huawei", "Samsung", "LG",
  "Hyundai", "Toyota", "Honda", "Nissan", "Ford", "General Motors", "Stellantis",
  "Volkswagen", "BMW", "Mercedes-Benz", "Audi", "Porsche", "Ferrari", "Lamborghini",
  "Rolls-Royce", "Jaguar Land Rover", "Volvo", "Geely", "BYD", "Nio", "Xpeng", "Li Auto",
  "Rivian", "Lucid Motors", "General Electric", "Siemens", "Honeywell", "3M", "DuPont",
  "BASF", "Dow Inc.", "Bayer", "Johnson & Johnson", "Pfizer", "Merck & Co.", "AbbVie",
  "Bristol Myers Squibb", "Eli Lilly", "Novartis", "Roche Holding", "Sanofi", "AstraZeneca",
  "Gilead Sciences", "Moderna", "BioNTech", "Thermo Fisher Scientific", "Danaher",
  "Abbott Laboratories", "Medtronic", "Intuitive Surgical", "Stryker", "Boston Scientific",
  "Philips", "General Dynamics", "Lockheed Martin", "Boeing", "Raytheon Technologies",
  "Northrop Grumman", "Airbus", "Safran", "Rolls-Royce Holdings", "BAE Systems", "Thales",
  "Leonardo", "General Atlantic", "KKR", "Blackstone", "Carlyle Group", "Apollo Global Management",
  "TPG Capital", "Silver Lake", "Vista Equity Partners", "Insight Partners", "Andreessen Horowitz",
  "Sequoia Capital", "Kleiner Perkins", "Benchmark", "Accel", "Lightspeed Venture Partners",
  "Founders Fund", "Y Combinator", "500 Startups", "Techstars", "Plug and Play Tech Center",
  "Station F", "Rocket Internet", "SoftBank Group", "Tencent Holdings", "Alibaba Group",
  "Prosus", "Naspers", "Reliance Industries", "Tata Group", "Adani Group", "HDFC Bank",
  "ICICI Bank", "State Bank of India", "Infosys", "Tata Consultancy Services", "Wipro",
  "HCL Technologies", "Tech Mahindra", "Cognizant Technology Solutions", "Capgemini",
  "Accenture", "Deloitte", "PricewaterhouseCoopers", "Ernst & Young", "KPMG", "McKinsey & Company",
  "Boston Consulting Group", "Bain & Company", "Oliver Wyman", "A.T. Kearney", "EY-Parthenon",
  "Mercer", "Willis Towers Watson", "Aon", "Marsh McLennan", "Chubb Limited", "Zurich Insurance Group",
  "Allianz", "AXA", "Generali", "Prudential Financial", "MetLife", "New York Life Insurance",
  "MassMutual", "Northwestern Mutual", "Lincoln Financial Group", "Principal Financial Group",
  "The Hartford", "Travelers Companies", "Progressive Corporation", "Geico", "State Farm",
  "Liberty Mutual", "Farmers Insurance", "USAA", "Nationwide Mutual Insurance", "American Family Insurance",
  "CVS Health", "UnitedHealth Group", "Elevance Health", "Humana", "Centene Corporation",
  "Kaiser Permanente", "HCA Healthcare", "Tenet Healthcare", "Community Health Systems",
  "Universal Health Services", "LabCorp", "Quest Diagnostics", "IDEXX Laboratories",
  "Align Technology", "Dentsply Sirona", "Henry Schein", "Patterson Companies", "Cardinal Health",
  "McKesson Corporation", "AmerisourceBergen", "Walgreens Boots Alliance", "Rite Aid",
  "Walmart", "Amazon", "Target", "Costco Wholesale", "Home Depot", "Lowe's", "Best Buy",
  "Starbucks", "McDonald's", "Coca-Cola", "PepsiCo", "Anheuser-Busch InBev", "Diageo",
  "Unilever", "Procter & Gamble", "Colgate-Palmolive", "Kimberly-Clark", "Estee Lauder",
  "L'Oreal", "Hermes International", "Louis Vuitton", "Chanel", "Gucci", "Prada", "Burberry",
  "Richemont", "Swatch Group", "Kering", "Moncler", "Canada Goose", "Nike", "Adidas",
  "Under Armour", "Lululemon Athletica", "Gap Inc.", "TJX Companies", "Ross Stores",
  "Nordstrom", "Macy's", "Kohl's", "J.C. Penney", "Dillard's", "American Eagle Outfitters",
  "Urban Outfitters", "PVH Corp.", "Ralph Lauren", "Levi Strauss & Co.", "VF Corporation",
  "Hanesbrands", "Gildan Activewear", "Fruit of the Loom", "Victoria's Secret", "Bath & Body Works",
  "Ulta Beauty", "Sephora", "Sally Beauty Holdings", "e.l.f. Beauty", "Kylie Cosmetics",
  "Fenty Beauty", "Rare Beauty", "Goop", "Drunk Elephant", "Glossier", "Pat McGrath Labs",
  "Huda Beauty", "Charlotte Tilbury", "Tatcha", "Summer Fridays", "Supergoop", "Ouai",
  "Sol de Janeiro", "Kiehl's", "Aesop", "Byredo", "Le Labo", "Jo Malone London", "Diptyque",
  "Baccarat", "Swarovski", "Tiffany & Co.", "Cartier", "Van Cleef & Arpels", "Bulgari",
  "Harry Winston", "Graff Diamonds", "De Beers", "Signet Jewelers", "Pandora", "Zales",
  "Kay Jewelers", "Jared The Galleria Of Jewelry", "Brilliant Earth", "Blue Nile", "James Allen",
  "Ritani", "Adiamor", "Whiteflash", "Hearts On Fire", "Forevermark", "Lazare Kaplan",
  "Scribd", "Medium", "Substack", "Patreon", "OnlyFans", "Twitch", "YouTube", "Vimeo",
  "Dailymotion", "Vevo", "Crunchyroll", "Funimation", "Netflix", "Hulu", "Disney+",
  "HBO Max", "Peacock", "Paramount+", "Apple TV+", "Amazon Prime Video", "Discovery+",
  "BritBox", "Acorn TV", "Shudder", "Mubi", "Criterion Channel", "CuriosityStream",
  "MasterClass", "Coursera", "edX", "Udemy", "LinkedIn Learning", "Pluralsight", "Skillshare",
  "Khan Academy", "Duolingo", "Babbel", "Rosetta Stone", "Memrise", "Anki", "Quizlet",
  "Chegg", "Course Hero", "Study.com", "Schoology", "Canvas", "Blackboard", "Google Classroom",
  "Microsoft Teams for Education", "Zoom for Education", "Cisco Webex Education", "GoToMeeting Education",
  "Adobe Connect", "Moodle", "WordPress", "Joomla", "Drupal", "Wix", "Squarespace",
  "Shopify Plus", "BigCommerce", "Magento", "PrestaShop", "OpenCart", "Etsy", "eBay",
  "Amazon Handmade", "Zibbet", "Artfire", "Ruby Lane", "Bonanza", "Depop", "Poshmark",
  "Grailed", "StockX", "GOAT", "The RealReal", "Fashionphile", "Vestiaire Collective",
  "Rebag", "What Goes Around Comes Around", "Bagsy", "Tradesy", "ThredUp", "Swap.com",
  "Flywheel", "Kinsta", "WP Engine", "SiteGround", "Bluehost", "HostGator", "DreamHost",
  "InMotion Hosting", "A2 Hosting", "GreenGeeks", "Cloudways", "DigitalOcean", "Linode",
  "Vultr", "Hetzner", "OVHcloud", "Rackspace Technology", "Equinix", "CoreSite", "Digital Realty",
  "QTS Realty Trust", "CyrusOne", "Switch", "Iron Mountain", "NTT Global Data Centers",
  "Flexential", "TierPoint", "Evoque Data Center Solutions", "Stream Data Centers",
  "Aligned Energy", "Vantage Data Centers", "Stack Infrastructure", "Continent 8 Technologies",
  "DE-CIX", "Equinix Metal", "PacketFabric", "Console Connect", "Megaport", "AWS Direct Connect",
  "Azure ExpressRoute", "Google Cloud Interconnect", "Oracle Cloud Infrastructure FastConnect",
  "Alibaba Cloud Express Connect", "Tencent Cloud Direct Connect", "Huawei Cloud Direct Connect",
  "Baidu AI Cloud Direct Connect", "JD Cloud Direct Connect", "NetEase Cloud Direct Connect",
  "Kingsoft Cloud Direct Connect", "UCloud Express Connect", "QingCloud Direct Connect",
  "G-Core Labs Cloud", "Yandex Cloud", "SberCloud", "Mail.ru Cloud Solutions", "T-Systems",
  "Orange Business Services", "Telefonica Tech", "Vodafone Business", "BT Global Services",
  "Deutsche Telekom", "Swisscom", "AT&T Business", "Verizon Business", "T-Mobile for Business",
  "Sprint Business", "Comcast Business", "Cox Business", "Charter Communications",
  "Frontier Communications", "Altice USA", "Cable One", "Mediacom Communications",
  "Suddenlink", "Optimum", "Spectrum Business", "Xfinity Business", "Google Fiber",
  "AT&T Fiber", "Verizon Fios", "Frontier Fios", "CenturyLink Fiber", "Cox Fiber",
  "Metronet", "Kinetic by Windstream", "Ziply Fiber", "Consolidated Communications",
  "Lumens", "Cogent Communications", "Level 3 Communications", "Telia Carrier", "NTT Communications",
  "Tata Communications", "Global Crossing", "XO Communications", "Windstream", "EarthLink",
  "RCN", "Grande Communications", "Astound Broadband", "Cincinnati Bell", "Hawaiian Telcom",
  "Alaska Communications", "GCI", "Viasat", "HughesNet", "Starlink", "OneWeb", "Iridium",
  "Globalstar", "Thuraya", "Inmarsat", "EchoStar", "Intelsat", "SES S.A.", "Eutelsat",
  "Telesat", "ViaSat", "Sky Perfect JSAT", "Arabsat", "AsiaSat", "Measat", "Thaicom",
  "Koreasat", "Optus Satellite", "NBN Co", "Dish Network", "DirecTV", "Bell Satellite TV",
  "Shaw Direct", "Sky UK", "Sky Deutschland", "Sky Italia", "Canal+", "Foxtel", "TrueVisions",
  "Astro", "StarHub TV", "Singtel TV", "NOW TV", "Sling TV", "FuboTV", "Philo", "YouTube TV",
  "Hulu + Live TV", "DirecTV Stream", "Vidgo", "Frndly TV", "LocalBTV", "antenna.tv",
  "Cozi TV", "MeTV", "Heroes & Icons", "Decades", "Start TV", "Movies!", "Rewind TV",
  "Grit TV", "Charge!", "Comet", "TBD", "Bounce TV", "Laff", "Court TV", "True Crime Network",
  "Newsy", "Stadium", "AccuWeather Network", "The Weather Channel", "WeatherNation",
  "Z Living", "QVC", "HSN", "Evine", "Jewelry Television", "ShopHQ", "Gems TV", "Ideal World",
  "TJC", "Bid Shopping", "TVSN", "Open Shop", "TV Shop", "BrandShop", "Homeshopping Network",
  "Best Direct", "Thane Direct", "Global Shop Direct", "Telebrands", "IdeaVillage",
  "Ontel Products", "Tristar Products", "MediaShop", "DRTV", "Infomercial", "Telemarketing",
  "Direct Mail Marketing", "Email Marketing", "SMS Marketing", "Social Media Marketing",
  "Content Marketing", "Search Engine Optimization (SEO)", "Search Engine Marketing (SEM)",
  "Pay-Per-Click (PPC) Advertising", "Display Advertising", "Video Advertising",
  "Native Advertising", "Influencer Marketing", "Affiliate Marketing", "Referral Marketing",
  "Event Marketing", "Guerrilla Marketing", "Experiential Marketing", "Public Relations",
  "Crisis Communications", "Internal Communications", "Investor Relations", "Government Relations",
  "Lobbying", "Advocacy", "Political Consulting", "Campaign Management", "Public Affairs",
  "Corporate Social Responsibility (CSR)", "Sustainability Consulting", "Environmental Consulting",
  "Social Impact Consulting", "Ethical Sourcing Consulting", "Diversity, Equity, and Inclusion (DEI) Consulting",
  "Change Management Consulting", "Organizational Development Consulting", "Leadership Development Consulting",
  "Talent Management Consulting", "Executive Coaching", "Career Coaching", "Life Coaching",
  "Wellness Coaching", "Financial Coaching", "Business Coaching", "Sales Coaching",
  "Marketing Coaching", "Operations Consulting", "Supply Chain Consulting", "Procurement Consulting",
  "Logistics Consulting", "Manufacturing Consulting", "Quality Management Consulting",
  "Lean Six Sigma Consulting", "Project Management Consulting", "Program Management Consulting",
  "Portfolio Management Consulting", "Risk Management Consulting", "Compliance Consulting",
  "Regulatory Consulting", "Cybersecurity Consulting", "Data Privacy Consulting",
  "Information Technology (IT) Consulting", "Digital Transformation Consulting",
  "Cloud Computing Consulting", "Artificial Intelligence (AI) Consulting",
  "Machine Learning (ML) Consulting", "Blockchain Consulting", "Internet of Things (IoT) Consulting",
  "Robotics Consulting", "Automation Consulting", "Big Data Consulting", "Data Analytics Consulting",
  "Business Intelligence (BI) Consulting", "Enterprise Resource Planning (ERP) Consulting",
  "Customer Relationship Management (CRM) Consulting", "Supply Chain Management (SCM) Consulting",
  "Human Capital Management (HCM) Consulting", "Financial Management (FM) Consulting",
  "Enterprise Performance Management (EPM) Consulting", "Governance, Risk, and Compliance (GRC) Consulting",
  "Security Operations Center (SOC) Consulting", "Managed Security Services Provider (MSSP)",
  "Managed Service Provider (MSP)", "Value Added Reseller (VAR)", "System Integrator (SI)",
  "Independent Software Vendor (ISV)", "Original Equipment Manufacturer (OEM)",
  "Original Design Manufacturer (ODM)", "Contract Manufacturer (CM)", "Electronic Manufacturing Services (EMS)",
  "Product Design and Development", "Engineering Services Outsourcing (ESO)",
  "Research and Development (R&D) Services", "Laboratory Services", "Clinical Research Organization (CRO)",
  "Contract Development and Manufacturing Organization (CDMO)", "Biopharmaceutical",
  "Pharmaceutical", "Biotechnology", "Medical Device", "Healthcare IT", "Health Information Exchange (HIE)",
  "Electronic Health Record (EHR) Systems", "Telehealth", "Remote Patient Monitoring (RPM)",
  "Digital Therapeutics (DTx)", "Personalized Medicine", "Genomics", "Proteomics",
  "Bioinformatics", "Computational Biology", "Drug Discovery and Development",
  "Clinical Trials Management", "Regulatory Affairs Consulting", "Pharmacovigilance",
  "Medical Writing", "Biostatistics", "Data Management", "Quality Assurance (QA)",
  "Quality Control (QC)", "Validation Services", "Auditing Services", "Training Services",
  "Staffing Services", "Recruitment Process Outsourcing (RPO)", "Temporary Staffing",
  "Permanent Placement", "Executive Search", "Contingent Staffing", "Contract Staffing",
  "Freelance Platforms", "Gig Economy Platforms", "Upwork", "Fiverr", "Toptal",
  "Freelancer.com", "Guru.com", "PeoplePerHour", "Dribbble", "Behance", "ArtStation",
  "DeviantArt", "Pixiv", "Flickr", "500px", "SmugMug", "Pexels", "Unsplash", "Pixabay",
  "Getty Images", "Shutterstock", "Adobe Stock", "Depositphotos", "iStock", "Alamy",
  "Dreamstime", "123RF", "VectorStock", "Freepik", "Canva", "PicMonkey", "Crello",
  "Visme", "Stencil", "Snappa", "Designbold", "Easil", "BrandCrowd", "Looka", "Logaster",
  "Tailor Brands", "Hatchful", "Adobe Express", "VistaCreate", "Fotor", "GIMP",
  "Inkscape", "Blender", "DaVinci Resolve", "Audacity", "OBS Studio", "Streamlabs OBS",
  "XSplit", "Lightworks", "Kdenlive", "Shotcut", "OpenShot Video Editor", "Flowblade",
  "VLC Media Player", "MPC-HC", "PotPlayer", "KMPlayer", "GOM Player", "MediaMonkey",
  "foobar2000", "AIMP", "Winamp", "Spotify", "Apple Music", "YouTube Music", "Amazon Music",
  "Tidal", "Deezer", "Pandora", "SoundCloud", "Bandcamp", "Mixcloud", "Beatport",
  "Traxsource", "Juno Download", "Bleep", "Boomkat", "Discogs", "RateYourMusic", "AllMusic",
  "Last.fm", "Genius", "Lyrics.com", "Songkick", "Bandsintown", "Resident Advisor",
  "Eventbrite", "Ticketmaster", "Live Nation", "AXS", "See Tickets", "StubHub",
  "SeatGeek", "Vivid Seats", "TicketSwap", "Dice", "RAVE Financial", "Finastra",
  "Temenos", "FIS", "Fiserv", "Jack Henry & Associates", "NCR Corporation",
  "Deluxe Corporation", "Bottomline Technologies", "ACI Worldwide", "Global Payments",
  "Worldpay", "Adyen", "Checkout.com", "Braintree", "Sage", "Intuit", "Xero",
  "FreshBooks", "Wave Accounting", "Zoho Books", "QuickBooks", "SAP Business One",
  "Microsoft Dynamics 365 Business Central", "Oracle NetSuite", "Acumatica", "Infor",
  "Epicor", "Unit4", "Workday Financial Management", "BlackLine", "Trintech",
  "Kyriba", "GTreasury", "Reval", "Bellin", "TreasuryXpress", "ION Treasury",
  "Finicity", "Plaid Technologies", "Yodlee", "MX", "Teller", "Akoya", "Flinks",
  "Truelayer", "Salt Edge", "Open Banking Platform", "Yapily", "Nordigen", "FinAPI",
  "Token.io", "Klarna", "Afterpay", "Affirm", "Sezzle", "Zip", "Splitit",
  "PayPal Credit", "Apple Pay Later", "Google Pay Later", "Shop Pay Installments",
  "Visa Installments", "Mastercard Installments", "American Express Plan It", "Citi Flex Pay",
  "Discover Pay Over Time", "Chase My Chase Plan", "Capital One Installments",
  "Barclays Pingit", "HSBC PayMe", "DBS PayLah!", "OCBC PayAnyone", "UOB Mighty",
  "Standard Chartered SC Pay", "Maybank MAE", "CIMB Octo", "Public Bank PB engage",
  "RHB Mobile Banking", "Hong Leong Connect", "AmBank AmOnline", "Bank Rakyat iRakyat",
  "Bank Islam GO", "BNM DuitNow", "PayNet MyDebit", "FPX", "JomPAY", "Boost", "GrabPay",
  "Touch 'n Go eWallet", "Setel", "FavePay", "Mcash", "Razer Pay", "WeChat Pay MY",
  "Alipay MY", "BigPay", "kiplePay", "ShopeePay", "MAE by Maybank2u", "GoPayz",
  "Zapp", "Mpay", "Neteller", "Skrill", "ecoPayz", "MuchBetter", "Astropay",
  "Paysafecard", "Neosurf", "Flexepin", "Vanilla Visa", "Gift Cards", "Prepaid Cards",
  "Debit Cards", "Credit Cards", "Bank Transfers", "Wire Transfers", "ACH Transfers",
  "SEPA Transfers", "SWIFT Transfers", "Faster Payments", "Pix (Brazil)", "UPI (India)",
  "PromptPay (Thailand)", "PayNow (Singapore)", "Bizum (Spain)", "Blik (Poland)",
  "MobilePay (Denmark)", "Vipps (Norway)", "Swish (Sweden)", "TWINT (Switzerland)",
  "iDEAL (Netherlands)", "Bancontact (Belgium)", "MyBank (Italy)", "Sofort (Germany)",
  "Giropay (Germany)", "EPS (Austria)", "P24 (Poland)", "Trustly", "Interac (Canada)",
  "Zelle (USA)", "Venmo (USA)", "Cash App (USA)", "Popmoney (USA)", "Apple Cash (USA)",
  "Google Pay (USA)", "Samsung Pay (USA)", "Garmin Pay", "Fitbit Pay", "Alipay (China)",
  "WeChat Pay (China)", "UnionPay (China)", "RuPay (India)", "JCB (Japan)", "Discover Card (USA)",
  "Diners Club International", "Maestro", "Electron", "VPay", "Solo", "Carte Bancaire (France)",
  "Elo (Brazil)", "NFC payments", "QR code payments", "Biometric payments", "Cryptocurrency payments",
  "Bitcoin", "Ethereum", "Ripple", "Litecoin", "Cardano", "Solana", "Polkadot", "Dogecoin",
  "Shiba Inu", "Tether", "USD Coin", "Binance Coin", "Avalanche", "Chainlink", "Uniswap",
  "Filecoin", "Stellar", "VeChain", "TRON", "Monero", "Dash", "Zcash", "Cosmos",
  "Algorand", "Hedera", "Tezos", "Near Protocol", "Elrond", "Fantom", "Terra",
  "Kusama", "IOTA", "Waves", "EOS", "Neo", "Qtum", "Ontology", "Harmony", "Zilliqa",
  "Basic Attention Token", "Compound", "Aave", "Maker", "Decentralized Finance (DeFi)",
  "Non-Fungible Tokens (NFTs)", "Web3", "Metaverse", "Decentralized Autonomous Organizations (DAOs)",
  "Smart Contracts", "Layer 2 Solutions", "Cross-Chain Bridges", "Oracles", "Zero-Knowledge Proofs",
  "Consensus Mechanisms", "Proof of Work (PoW)", "Proof of Stake (PoS)", "Delegated Proof of Stake (DPoS)",
  "Proof of History (PoH)", "Proof of Authority (PoA)", "Directed Acyclic Graph (DAG)",
  "Sidechains", "Rollups", "Sharding", "Distributed Ledger Technology (DLT)",
  "Enterprise Blockchain", "Hyperledger Fabric", "Corda", "Ethereum Enterprise Alliance",
  "ConsenSys", "Truffle Suite", "Ganache", "Remix IDE", "Hardhat", "Foundry", "OpenZeppelin",
  "Ethers.js", "Web3.js", "Infura", "Alchemy", "QuickNode", "Moralis", "The Graph",
  "Chainlink VRF", "IPFS", "Filebase", "Pinata", "Arweave", "Livepeer", "Render Network",
  "Theta Network", "Fetch.ai", "SingularityNET", "Ocean Protocol", "NuCypher", "Keep Network",
  "Secret Network", "Oasis Network", "Ankr", "Lido Finance", "Curve Finance",
  "SushiSwap", "PancakeSwap", "ApeSwap", "Balancer", "Yearn Finance", "Compound Finance",
  "Aave Protocol", "MakerDAO", "Uniswap Protocol", "Synthetix", "Terraform Labs",
  "Solana Labs", "Polkadot Ecosystem", "Cosmos Ecosystem", "Avalanche Ecosystem",
  "Binance Smart Chain Ecosystem", "Fantom Ecosystem", "Arbitrum", "Optimism",
  "Polygon", "ZkSync", "StarkWare", "Loopring", "Immutable X", "Ronin Network",
  "Flow Blockchain", "NEAR Protocol Ecosystem", "TRON Ecosystem", "EOS Ecosystem",
  "Neo Ecosystem", "Ethereum Ecosystem", "Bitcoin Ecosystem", "Litecoin Ecosystem",
  "Dogecoin Ecosystem", "Ripple Ecosystem", "Cardano Ecosystem", "Stellar Ecosystem",
  "Algorand Ecosystem", "Hedera Hashgraph Ecosystem", "Tezos Ecosystem", "IOTA Ecosystem",
  "Waves Ecosystem", "Zilliqa Ecosystem", "Harmony Ecosystem", "Elrond Ecosystem",
  "VeChain Ecosystem", "Monero Ecosystem", "Dash Ecosystem", "Zcash Ecosystem",
  "Filecoin Ecosystem", "Chainlink Ecosystem", "Uniswap Ecosystem", "Compound Ecosystem",
  "Aave Ecosystem", "Maker Ecosystem", "Basic Attention Token Ecosystem", "Chiliz",
  "The Sandbox Game", "Decentraland Game", "Axie Infinity Game", "CryptoKitties",
  "Gods Unchained", "Splinterlands", "Alien Worlds", "Upland", "Somnium Space",
  "Voxels (formerly CryptoVoxels)", "NFT Worlds", "Otherside", "Bored Ape Yacht Club",
  "CryptoPunks", "Art Blocks", "Mutant Ape Yacht Club", "Azuki", "Clone X",
  "Doodles", "Moonbirds", "Meebits", "Cool Cats", "World of Women", "VeeFriends",
  "Pudgy Penguins", "CyberKongz", "SupDucks", "OnChainMonkeys", "Nouns DAO",
  "PROOF Collective", "Yuga Labs", "Larva Labs", "OpenSea NFT Marketplace",
  "Rarible NFT Marketplace", "LooksRare NFT Marketplace", "X2Y2 NFT Marketplace",
  "Magic Eden NFT Marketplace", "Solanart NFT Marketplace", "Foundation NFT Marketplace",
  "SuperRare NFT Marketplace", "Nifty Gateway NFT Marketplace", "KnownOrigin NFT Marketplace",
  "MakersPlace NFT Marketplace", "Objkt.com NFT Marketplace", "Teia NFT Marketplace",
  "Art Blocks Curated", "Fxhash", "Generative Art", "AI Art", "Midjourney", "DALL-E",
  "Stable Diffusion", "RunwayML", "DeepMind", "OpenAI", "Anthropic", "Cohere",
  "AI21 Labs", "Hugging Face Transformers", "Google AI", "Microsoft AI", "IBM AI",
  "Amazon AI", "Apple AI", "Meta AI", "Tesla AI", "Baidu AI", "Tencent AI",
  "Alibaba AI", "Huawei AI", "Samsung AI", "LG AI", "Intel AI", "Nvidia AI",
  "Qualcomm AI", "Broadcom AI", "ARM AI", "TSMC AI", "GlobalFoundries AI", "Samsung Foundry AI",
  "Intel Foundry Services AI", "ASML", "Lam Research", "Applied Materials", "KLA Corporation",
  "Tokyo Electron", "Synopsys", "Cadence Design Systems", "Ansys", "Keysight Technologies",
  "Rohde & Schwarz", "National Instruments", "Teradyne", "Cohu", "Advantest",
  "FormFactor", "X-FAB", "Tower Semiconductor", "STMicroelectronics", "Infineon Technologies",
  "NXP Semiconductors", "Renesas Electronics", "Microchip Technology", "Texas Instruments",
  "Analog Devices", "Maxim Integrated", "Linear Technology", "Cirrus Logic", "Wolfspeed",
  "ON Semiconductor", "Skyworks Solutions", "Qorvo", "Murata Manufacturing", "TDK Corporation",
  "Kyocera Corporation", "Nichia Corporation", "OSRAM", "Lumileds", "Cree LED",
  "Samsung LED", "LG Innotek", "Signify (Philips Lighting)", "Osram Licht AG",
  "Zumtobel Group", "Fagerhult", "Glamox", "ERCO", "Louis Poulsen", "Flos",
  "Artemide", "Vibia", "Marset", "Foscarini", "Muuto", "HAY", "Menu", "Normann Copenhagen",
  "GUBI", "Carl Hansen & Søn", "Fritz Hansen", "Montana Furniture", "Vitra", "Knoll",
  "Herman Miller", "Steelcase", "Haworth", "Humanscale", "Teknion", "Koleksiyon",
  "Okamura", "Itoki", "Kokuyo", "Herman Miller Gaming", "Secretlab", "DXRacer",
  "AndaSeat", "Corsair Gaming", "Razer", "Logitech G", "SteelSeries", "HyperX",
  "Asus ROG", "MSI Gaming", "Acer Predator", "Alienware", "HP Omen", "Lenovo Legion",
  "Dell Gaming", "Origin PC", "Maingear", "Digital Storm", "Falcon Northwest", "CyberPowerPC",
  "iBUYPOWER", "NZXT", "Fractal Design", "Lian Li", "Cooler Master", "Thermaltake",
  "Be Quiet!", "Phanteks", "SilverStone", "Seasonic", "Corsair Power Supplies",
  "EVGA Power Supplies", "NZXT Power Supplies", "Thermaltake Power Supplies",
  "Gigabyte Power Supplies", "Asus ROG Power Supplies", "MSI Power Supplies",
  "Cooler Master Power Supplies", "SilverStone Power Supplies", "Be Quiet! Power Supplies",
  "Razer Peripherals", "Logitech Peripherals", "SteelSeries Peripherals", "HyperX Peripherals",
  "Corsair Peripherals", "Roccat Peripherals", "Glorious PC Gaming Race Peripherals",
  "Finalmouse Peripherals", "Zowie Peripherals", "Keychron Keyboards", "GMMK Keyboards",
  "Akko Keyboards", "Ducky Keyboards", "Varmilo Keyboards", "Leopold Keyboards",
  "Filco Keyboards", "HHKB Keyboards", "Topre Keyboards", "Cherry MX Switches",
  "Kailh Switches", "Gateron Switches", "Outemu Switches", "Razer Switches",
  "SteelSeries Switches", "Logitech Switches", "Roccat Switches", "Glorious Switches",
  "Input Club Switches", "Holy Pandas", "Zealios Switches", "Durock Switches",
  "JWK Switches", "Tecsee Switches", "Everglide Switches", "SP-Star Switches",
  "Drop Switches", "NovelKeys Switches", "CannonKeys Switches", "Kinetic Labs Switches",
  "The Key Company Switches", "Mode Designs Keyboards", "Rama Works Keyboards",
  "GMK Keycaps", " ePBT Keycaps", "Maxkey Keycaps", "SA Keycaps", "Dye-sub Keycaps",
  "Doubleshot Keycaps", "PBT Keycaps", "ABS Keycaps", "Artisan Keycaps", "Keycap Sets",
  "Custom Cables", "Desk Mats", "Wrist Rests", "Switch Pullers", "Keycap Pullers",
  "Lube Stations", "Switch Openers", "Stabilizer Kits", "Foam Mods", "Plate Materials",
  "PCB Boards", "Microcontrollers", "QMK Firmware", "VIA Firmware", "ZMK Firmware",
  "Keymap Editors", "Layout Designers", "3D Printing Services", "CNC Milling Services",
  "Laser Cutting Services", "Powder Coating Services", "Anodizing Services",
  "Cerakote Services", "Hydro Dipping Services", "Vinyl Wrapping Services",
  "Electrostatic Painting Services", "Spray Painting Services", "Airbrushing Services",
  "Custom Engraving Services", "Custom Etching Services", "Custom Sublimation Services",
  "Custom Heat Transfer Services", "Custom Screen Printing Services", "Custom Embroidery Services",
  "Custom Sewing Services", "Custom Fabrication Services", "Custom Assembly Services",
  "Custom Packaging Services", "Fulfillment Services", "Dropshipping Services",
  "Print-on-Demand Services", "Merchandise Production", "Apparel Manufacturing",
  "Accessory Manufacturing", "Footwear Manufacturing", "Headwear Manufacturing",
  "Jewelry Manufacturing", "Watch Manufacturing", "Eyewear Manufacturing",
  "Bag Manufacturing", "Wallet Manufacturing", "Belt Manufacturing", "Glove Manufacturing",
  "Scarf Manufacturing", "Tie Manufacturing", "Sock Manufacturing", "Hosiery Manufacturing",
  "Underwear Manufacturing", "Swimwear Manufacturing", "Outerwear Manufacturing",
  "Sportswear Manufacturing", "Loungewear Manufacturing", "Sleepwear Manufacturing",
  "Intimates Manufacturing", "Kids' Apparel Manufacturing", "Baby Apparel Manufacturing",
  "Pet Apparel Manufacturing", "Uniform Manufacturing", "Workwear Manufacturing",
  "Medical Apparel Manufacturing", "Safety Apparel Manufacturing", "Disposable Apparel Manufacturing",
  "Protective Apparel Manufacturing", "Cleanroom Apparel Manufacturing", "ESD Apparel Manufacturing",
  "Flame Resistant Apparel Manufacturing", "High-Visibility Apparel Manufacturing",
  "Waterproof Apparel Manufacturing", "Windproof Apparel Manufacturing", "Breathable Apparel Manufacturing",
  "Moisture-Wicking Apparel Manufacturing", "Anti-Microbial Apparel Manufacturing",
  "UV Protective Apparel Manufacturing", "Insect Repellent Apparel Manufacturing",
  "Heated Apparel Manufacturing", "Cooling Apparel Manufacturing", "Smart Apparel Manufacturing",
  "Wearable Technology Manufacturing", "IoT Device Manufacturing", "Sensor Manufacturing",
  "Microcontroller Manufacturing", "Battery Manufacturing", "Display Manufacturing",
  "Camera Module Manufacturing", "Speaker Manufacturing", "Microphone Manufacturing",
  "Connector Manufacturing", "Cable Manufacturing", "Printed Circuit Board (PCB) Manufacturing",
  "Integrated Circuit (IC) Manufacturing", "Semiconductor Manufacturing", "Wafer Fabrication",
  "Semiconductor Packaging", "Test and Assembly", "Foundry Services", "Fabless Semiconductor",
  "IDM (Integrated Device Manufacturer)", "OSAT (Outsourced Semiconductor Assembly and Test)",
  "EDA (Electronic Design Automation) Software", "CAD (Computer-Aided Design) Software",
  "CAM (Computer-Aided Manufacturing) Software", "CAE (Computer-Aided Engineering) Software",
  "PLM (Product Lifecycle Management) Software", "PDM (Product Data Management) Software",
  "ERP (Enterprise Resource Planning) Software", "CRM (Customer Relationship Management) Software",
  "SCM (Supply Chain Management) Software", "HRM (Human Resources Management) Software",
  "Finance Management Software", "Accounting Software", "Project Management Software",
  "Collaboration Software", "Communication Software", "Document Management Software",
  "Business Intelligence Software", "Data Analytics Software", "Reporting Software",
  "Visualization Software", "Data Warehousing Software", "Data Lake Software",
  "ETL (Extract, Transform, Load) Tools", "Data Integration Tools", "Master Data Management (MDM) Software",
  "Data Quality Software", "Data Governance Software", "Metadata Management Software",
  "Database Management Systems (DBMS)", "Relational Databases", "NoSQL Databases",
  "Graph Databases", "Time-Series Databases", "Vector Databases", "Cloud Databases",
  "Data Lakes", "Data Warehouses", "Data Hubs", "Data Virtualization", "Data Federation",
  "Data Replication", "Data Migration", "Data Archiving", "Data Backup and Recovery",
  "Disaster Recovery as a Service (DRaaS)", "Backup as a Service (BaaS)",
  "Storage as a Service (STaaS)", "Infrastructure as a Service (IaaS)",
  "Platform as a Service (PaaS)", "Software as a Service (SaaS)",
  "Function as a Service (FaaS)", "Container as a Service (CaaS)",
  "Desktop as a Service (DaaS)", "Anything as a Service (XaaS)",
  "Private Cloud", "Public Cloud", "Hybrid Cloud", "Multi-Cloud", "Edge Computing",
  "Fog Computing", "Distributed Computing", "Parallel Computing", "Grid Computing",
  "Quantum Computing", "High Performance Computing (HPC)", "Supercomputing",
  "Mainframe Computing", "Client-Server Architecture", "Peer-to-Peer Architecture",
  "Microservices Architecture", "Serverless Architecture", "Event-Driven Architecture",
  "Service-Oriented Architecture (SOA)", "Monolithic Architecture", "Layered Architecture",
  "Hexagonal Architecture", "Clean Architecture", "Onion Architecture", "CQRS (Command Query Responsibility Segregation)",
  "Event Sourcing", "Domain-Driven Design (DDD)", "Test-Driven Development (TDD)",
  "Behavior-Driven Development (BDD)", "Agile Development", "Scrum", "Kanban",
  "Lean Software Development", "DevOps", "Site Reliability Engineering (SRE)",
  "Continuous Integration (CI)", "Continuous Delivery (CD)", "Continuous Deployment (CD)",
  "Automated Testing", "Unit Testing", "Integration Testing", "System Testing",
  "Acceptance Testing", "Performance Testing", "Security Testing", "Usability Testing",
  "Accessibility Testing", "Regression Testing", "Mutation Testing", "Fuzz Testing",
  "Chaos Engineering", "Observability", "Monitoring", "Logging", "Tracing",
  "Alerting", "Incident Management", "Problem Management", "Change Management",
  "Release Management", "Configuration Management", "Asset Management", "Service Desk",
  "ITIL (Information Technology Infrastructure Library)", "COBIT (Control Objectives for Information and Related Technologies)",
  "NIST Cybersecurity Framework", "ISO 27001", "GDPR", "CCPA", "HIPAA", "PCI DSS",
  "SOX (Sarbanes-Oxley Act)", "GLBA (Gramm-Leach-Bliley Act)", "Basel III", "Dodd-Frank Act",
  "AML (Anti-Money Laundering)", "KYC (Know Your Customer)", "CFT (Combating the Financing of Terrorism)",
  "Sanctions Screening", "Transaction Monitoring", "Fraud Detection", "Identity Verification",
  "Biometric Authentication", "Multi-Factor Authentication (MFA)", "Single Sign-On (SSO)",
  "Role-Based Access Control (RBAC)", "Attribute-Based Access Control (ABAC)",
  "Privileged Access Management (PAM)", "Identity and Access Management (IAM)",
  "Data Loss Prevention (DLP)", "Endpoint Detection and Response (EDR)",
  "Security Information and Event Management (SIEM)", "Security Orchestration, Automation, and Response (SOAR)",
  "Threat Intelligence Platforms (TIP)", "Vulnerability Management", "Penetration Testing",
  "Security Audit", "Compliance Audit", "Risk Assessment", "Security Awareness Training",
  "Phishing Simulation", "Incident Response Playbooks", "Business Continuity Planning (BCP)",
  "Disaster Recovery Planning (DRP)", "Crisis Management Planning", "Emergency Preparedness",
  "Physical Security", "Cyber Insurance", "Legal Counsel", "Forensic Investigation",
  "eDiscovery", "Regulatory Reporting", "Tax Advisory", "Audit Services", "Assurance Services",
  "Advisory Services", "Consulting Services", "Financial Planning", "Wealth Management",
  "Investment Banking", "Commercial Banking", "Retail Banking", "Private Banking",
  "Digital Banking", "Mobile Banking", "Online Banking", "Branch Banking",
  "Relationship Management", "Customer Service", "Contact Center Solutions",
  "CRM (Customer Relationship Management) Systems", "Loyalty Programs", "Personalization Engines",
  "Recommendation Systems", "Chatbots", "Virtual Assistants", "Robotic Process Automation (RPA)",
  "Business Process Management (BPM)", "Workflow Automation", "Enterprise Content Management (ECM)",
  "Document Management Systems (DMS)", "Records Management Systems (RMS)",
  "Digital Asset Management (DAM)", "Web Content Management (WCM)",
  "Customer Communications Management (CCM)", "Output Management", "Forms Automation",
  "Electronic Signatures", "Digital Identity", "Biometric Identification",
  "Voice Recognition", "Facial Recognition", "Fingerprint Recognition", "Iris Recognition",
  "Vein Recognition", "Behavioral Biometrics", "Digital Onboarding", "Customer Lifecycle Management",
  "Know Your Business (KYB)", "Anti-Fraud Solutions", "Risk Analytics", "Credit Scoring",
  "Underwriting Automation", "Claims Processing Automation", "Policy Administration Systems",
  "Billing Systems", "Payment Processing", "Transaction Reconciliation", "Fraud Analytics",
  "Compliance Analytics", "Regulatory Technology (RegTech)", "Financial Technology (FinTech)",
  "Insurance Technology (InsurTech)", "Health Technology (HealthTech)",
  "Education Technology (EdTech)", "Agricultural Technology (AgriTech)",
  "Real Estate Technology (PropTech)", "Legal Technology (LegalTech)",
  "Marketing Technology (MarTech)", "Ad Tech (Advertising Technology)",
  "Sales Technology (SalesTech)", "HR Technology (HRTech)", "Supply Chain Technology (SupplyChainTech)",
  "Logistics Technology (LogTech)", "Manufacturing Technology (ManufacTech)",
  "Construction Technology (ConTech)", "GovTech (Government Technology)",
  "CivicTech (Civic Technology)", "Smart City Solutions", "Urban Planning Software",
  "Geographic Information Systems (GIS)", "Remote Sensing", "Satellite Imagery Analysis",
  "Drone Technology", "Augmented Reality (AR)", "Virtual Reality (VR)",
  "Mixed Reality (MR)", "Extended Reality (XR)", "Haptics", "Wearable Devices",
  "Smart Devices", "Internet of Medical Things (IoMT)", "Industrial IoT (IIoT)",
  "Consumer IoT (CIoT)", "Vehicular IoT (VIoT)", "Smart Home Devices",
  "Smart Appliances", "Smart Lighting", "Smart Locks", "Smart Thermostats",
  "Smart Security Systems", "Smart Speakers", "Smart Displays", "Smart Watches",
  "Fitness Trackers", "Smart Glasses", "Smart Clothing", "Smart Footwear",
  "Smart Jewelry", "Smart Implants", "Robotics Process Automation (RPA)",
  "Intelligent Automation", "Hyperautomation", "Digital Twins", "Predictive Maintenance",
  "Asset Tracking", "Fleet Management", "Supply Chain Visibility", "Logistics Optimization",
  "Warehouse Automation", "Inventory Management", "Demand Forecasting", "Production Planning",
  "Quality Control Systems", "Process Control Systems", "Supervisory Control and Data Acquisition (SCADA)",
  "Distributed Control Systems (DCS)", "Programmable Logic Controllers (PLC)",
  "Human-Machine Interface (HMI)", "Manufacturing Execution Systems (MES)",
  "Manufacturing Operations Management (MOM)", "Enterprise Asset Management (EAM)",
  "Field Service Management (FSM)", "Work Order Management", "Maintenance Management Systems (MMS)",
  "Geospatial Analytics", "Location Intelligence", "Route Optimization", "Navigation Systems",
  "Autonomous Vehicles", "Electric Vehicles (EVs)", "Hybrid Electric Vehicles (HEVs)",
  "Plug-in Hybrid Electric Vehicles (PHEVs)", "Fuel Cell Electric Vehicles (FCEVs)",
  "Advanced Driver-Assistance Systems (ADAS)", "Self-Driving Cars", "Connected Cars",
  "Vehicle-to-Everything (V2X) Communication", "In-Vehicle Infotainment Systems",
  "Telematics Systems", "E-mobility Services", "Charging Infrastructure", "Battery Swapping",
  "Vehicle-to-Grid (V2G)", "Vehicle-to-Home (V2H)", "Vehicle-to-Load (V2L)",
  "Micro-mobility (e-scooters, e-bikes)", "Public Transportation Technology",
  "Ride-Sharing Platforms", "Car-Sharing Platforms", "On-Demand Mobility",
  "Logistics Drones", "Delivery Robots", "Automated Guided Vehicles (AGVs)",
  "Autonomous Mobile Robots (AMRs)", "Collaborative Robots (Cobots)", "Industrial Robots",
  "Service Robots", "Humanoid Robots", "Surgical Robots", "Exoskeletons",
  "Bionics", "Prosthetics", "3D Bioprinting", "Personalized Healthcare",
  "Precision Medicine", "Gene Therapy", "CRISPR Gene Editing", "mRNA Vaccines",
  "Stem Cell Therapy", "Regenerative Medicine", "Immunotherapy", "Oncology",
  "Cardiology", "Neurology", "Gastroenterology", "Pulmonology", "Endocrinology",
  "Dermatology", "Ophthalmology", "Otolaryngology", "Urology", "Nephrology",
  "Rheumatology", "Infectious Diseases", "Geriatrics", "Pediatrics", "Obstetrics and Gynecology",
  "Psychiatry", "Anesthesiology", "Radiology", "Pathology", "Emergency Medicine",
  "Family Medicine", "Internal Medicine", "Surgery", "Orthopedics", "Plastic Surgery",
  "Neuropsychology", "Rehabilitation Medicine", "Palliative Care", "Hospice Care",
  "Public Health", "Epidemiology", "Global Health", "Environmental Health",
  "Occupational Health", "Nutritional Science", "Dietetics", "Food Science",
  "Agronomy", "Horticulture", "Forestry", "Fisheries", "Animal Science", "Veterinary Medicine",
  "Biotechnology in Agriculture", "Precision Agriculture", "Vertical Farming",
  "Hydroponics", "Aquaponics", "Aeroponics", "Controlled Environment Agriculture (CEA)",
  "Agri-Food Tech", "Food Processing", "Food Safety", "Sustainable Agriculture",
  "Organic Farming", "Biodynamic Farming", "Permaculture", "Agroecology",
  "Water Management", "Waste Management", "Renewable Energy", "Solar Power",
  "Wind Power", "Hydropower", "Geothermal Energy", "Bioenergy", "Nuclear Energy",
  "Energy Storage", "Battery Technology", "Grid Modernization", "Smart Grids",
  "Energy Efficiency", "Carbon Capture, Utilization, and Storage (CCUS)",
  "Hydrogen Economy", "Sustainable Materials", "Circular Economy", "Green Building",
  "Sustainable Transportation", "Environmental Impact Assessment (EIA)",
  "Social Impact Assessment (SIA)", "Strategic Environmental Assessment (SEA)",
  "Life Cycle Assessment (LCA)", "Corporate Sustainability Reporting", "ESG (Environmental, Social, Governance) Reporting",
  "Climate Risk Management", "Adaptation Planning", "Resilience Planning",
  "Nature-Based Solutions", "Biodiversity Conservation", "Ecosystem Restoration",
  "Wildlife Management", "Pollution Control", "Air Quality Management", "Water Quality Management",
  "Soil Remediation", "Hazardous Waste Management", "Recycling Technologies",
  "Composting Technologies", "Waste-to-Energy", "Sustainable Tourism", "Ecotourism",
  "Cultural Heritage Management", "Historical Preservation", "Archaeological Consulting",
  "Museum Curation", "Art Conservation", "Gallery Management", "Performing Arts Management",
  "Music Production", "Film Production", "Television Production", "Animation Studios",
  "Video Game Development", "Book Publishing", "Magazine Publishing", "Newspaper Publishing",
  "Digital Media Production", "Content Creation", "Journalism", "Photojournalism",
  "Documentary Filmmaking", "Broadcast Journalism", "Podcasting", "Audiobook Production",
  "Radio Production", "Voice Acting", "Sound Design", "Music Composition",
  "Songwriting", "Lyrics Writing", "Music Arrangement", "Music Mixing", "Music Mastering",
  "Audio Engineering", "Live Sound Production", "Concert Production", "Event Planning",
  "Festival Organization", "Venue Management", "Artist Management", "Talent Agency",
  "Record Labels", "Music Distribution", "Music Publishing", "Copyright Management",
  "Intellectual Property Law", "Entertainment Law", "Sports Law", "Media Law",
  "Technology Law", "Privacy Law", "Cybersecurity Law", "Environmental Law",
  "Energy Law", "Real Estate Law", "Corporate Law", "Mergers and Acquisitions (M&A) Law",
  "Securities Law", "Banking Law", "Tax Law", "Bankruptcy Law", "Litigation",
  "Arbitration", "Mediation", "Alternative Dispute Resolution (ADR)", "Criminal Law",
  "Family Law", "Immigration Law", "Employment Law", "Labor Law", "Personal Injury Law",
  "Intellectual Property Rights Management", "Patent Prosecution", "Trademark Registration",
  "Copyright Registration", "Trade Secret Protection", "Licensing Agreements",
  "Royalty Management", "IP Due Diligence", "IP Valuation", "IP Litigation",
  "IP Enforcement", "IP Strategy Consulting", "Technology Transfer", "Commercialization",
  "Startup Consulting", "Incubator Programs", "Accelerator Programs", "Venture Capital",
  "Angel Investors", "Crowdfunding Platforms", "Grant Funding", "Seed Funding",
  "Series A Funding", "Series B Funding", "Series C Funding", "Growth Equity",
  "Private Equity", "Mezzanine Financing", "Debt Financing", "Equity Financing",
  "Initial Public Offering (IPO)", "Direct Listing", "Special Purpose Acquisition Company (SPAC)",
  "Spin-off", "Carve-out", "Leveraged Buyout (LBO)", "Management Buyout (MBO)",
  "Joint Venture", "Strategic Alliance", "Partnership Development", "Merger Integration",
  "Acquisition Integration", "Post-Merger Integration (PMI)", "Divestiture",
  "Restructuring", "Turnaround Management", "Interim Management", "Fractional Executive",
  "Board Advisory", "Governance Consulting", "Shareholder Engagement", "ESG Investing",
  "Impact Investing", "Socially Responsible Investing (SRI)", "Green Bonds", "Sustainability-Linked Loans",
  "Carbon Credits Trading", "Emissions Trading Schemes (ETS)", "Renewable Energy Certificates (RECs)",
  "Voluntary Carbon Markets", "Compliance Carbon Markets", "Offset Projects",
  "Verification and Validation Services", "Carbon Accounting", "GHG Emissions Reporting",
  "Task Force on Climate-related Financial Disclosures (TCFD) Reporting",
  "Sustainability Accounting Standards Board (SASB) Standards", "Global Reporting Initiative (GRI) Standards",
  "Integrated Reporting Framework (IRF)", "Science Based Targets initiative (SBTi)",
  "Climate Action Plans", "Net-Zero Strategies", "Decarbonization Pathways",
  "Carbon Footprint Analysis", "Water Footprint Analysis", "Life Cycle Assessment (LCA) Software",
  "Environmental Data Management Software", "Sustainability Software", "ESG Data Providers",
  "ESG Ratings Agencies", "Proxy Advisors", "Shareholder Activism Advisory",
  "Corporate Communications", "Public Affairs Consulting", "Crisis & Reputation Management",
  "Media Relations", "Internal Communications", "Employee Engagement", "Change Communications",
  "Investor Relations", "Financial Communications", "Mergers & Acquisitions Communications",
  "Litigation Communications", "Digital & Social Media Communications",
  "Content Strategy & Creation", "Brand Strategy & Positioning", "Corporate Branding",
  "Product Branding", "Employer Branding", "Personal Branding", "Brand Identity Design",
  "Logo Design", "Graphic Design", "Web Design", "UI/UX Design", "Motion Graphics",
  "Illustration", "Photography", "Videography", "Copywriting", "Content Writing",
  "Technical Writing", "Ghostwriting", "Speechwriting", "Editing", "Proofreading",
  "Translation Services", "Localization Services", "Transcreation Services",
  "Subtitling Services", "Dubbing Services", "Voice-over Services", "Interpretation Services",
  "Multilingual Desktop Publishing", "Global Marketing Strategy", "International SEO",
  "Global PPC", "Cross-Cultural Marketing", "Expatriate Services", "Relocation Services",
  "Immigration Services", "Global Mobility Consulting", "International Payroll",
  "Global HR Consulting", "International Tax Planning", "Cross-Border M&A Advisory",
  "Foreign Direct Investment (FDI) Advisory", "Market Entry Strategy", "Export/Import Consulting",
  "Customs Brokerage", "Freight Forwarding", "Supply Chain Risk Management",
  "Global Logistics Management", "International Trade Compliance", "Trade Finance",
  "Export Credit Agencies", "Development Finance Institutions", "Multilateral Development Banks",
  "Export-Import Bank of the United States", "World Bank Group", "International Monetary Fund (IMF)",
  "Asian Development Bank (ADB)", "African Development Bank (AfDB)", "European Bank for Reconstruction and Development (EBRD)",
  "Inter-American Development Bank (IDB)", "Islamic Development Bank (IsDB)",
  "New Development Bank (NDB)", "Asian Infrastructure Investment Bank (AIIB)",
  "United Nations (UN)", "World Health Organization (WHO)", "World Trade Organization (WTO)",
  "International Labour Organization (ILO)", "UNESCO", "UNICEF", "World Food Programme (WFP)",
  "UN Refugee Agency (UNHCR)", "Doctors Without Borders", "Red Cross/Red Crescent",
  "Amnesty International", "Human Rights Watch", "Transparency International",
  "Oxfam", "Save the Children", "World Vision International", "Médecins Sans Frontières",
  "Greenpeace", "World Wide Fund for Nature (WWF)", "Conservation International",
  "Environmental Defense Fund", "Natural Resources Defense Council (NRDC)",
  "Sierra Club", "Audubon Society", "National Wildlife Federation", "The Nature Conservancy",
  "Rainforest Alliance", "Fair Trade International", "Global Compact", "B Lab (B Corp Certification)",
  "Forest Stewardship Council (FSC)", "Marine Stewardship Council (MSC)",
  "Roundtable on Sustainable Palm Oil (RSPO)", "Better Cotton Initiative (BCI)",
  "Responsible Jewellery Council (RJC)", "Electronics Watch", "Ethical Consumer",
  "Good On You", "Fashion Revolution", "Clean Clothes Campaign", "War on Want",
  "AFL-CIO", "International Trade Union Confederation (ITUC)", "Solidarity Center",
  "Human Rights Campaign (HRC)", "NAACP", "ACLU", "Southern Poverty Law Center (SPLC)",
  "Anti-Defamation League (ADL)", "Council on American-Islamic Relations (CAIR)",
  "National Urban League", " UnidosUS", "Asian Americans Advancing Justice (AAAJ)",
  "Native American Rights Fund (NARF)", "GLAAD", "The Trevor Project", "It Gets Better Project",
  "National Council on Disability (NCD)", "Special Olympics", "Best Buddies International",
  "Easterseals", "Goodwill Industries International", "Salvation Army", "United Way Worldwide",
  "Habitat for Humanity International", "Feeding America", "Direct Relief", "Partners In Health",
  "Project HOPE", "Americares", "MAP International", "Catholic Relief Services (CRS)",
  "Samaritan's Purse", "International Medical Corps", "Mercy Corps", "CARE",
  "Concern Worldwide", "Plan International", "Action Against Hunger", "Doctors of the World",
  "International Rescue Committee (IRC)", "Norwegian Refugee Council (NRC)",
  "Danish Refugee Council (DRC)", "Finnish Refugee Council (FRC)", "Swedish Refugee Council (SRC)",
  "Dutch Refugee Council (DRC)", "British Refugee Council (BRC)", "Australian Refugee Council (ARC)",
  "Canadian Refugee Council (CRC)", "USA for UNHCR", "UNICEF USA", "World Food Program USA",
  "UN Foundation", "Gates Foundation", "Rockefeller Foundation", "Ford Foundation",
  "MacArthur Foundation", "Open Society Foundations", "Bloomberg Philanthropies",
  "Chan Zuckerberg Initiative", "Bezos Earth Fund", "Dalio Philanthropies",
  "Michael & Susan Dell Foundation", "Bill & Melinda Gates Medical Research Institute",
  "Wellcome Trust", "Howard Hughes Medical Institute", "Max Planck Society",
  "Fraunhofer-Gesellschaft", "Helmholtz Association", "Leibniz Association",
  "CNRS (French National Centre for Scientific Research)", "INSERM (French National Institute of Health and Medical Research)",
  "CEA (French Alternative Energies and Atomic Energy Commission)", "CERN (European Organization for Nuclear Research)",
  "ESO (European Southern Observatory)", "ESA (European Space Agency)",
  "NASA (National Aeronautics and Space Administration)", "JAXA (Japan Aerospace Exploration Agency)",
  "CNSA (China National Space Administration)", "Roscosmos (Russian Space Agency)",
  "ISRO (Indian Space Research Organisation)", "Korea Aerospace Research Institute (KARI)",
  "UAE Space Agency", "UK Space Agency", "Canadian Space Agency (CSA)", "German Aerospace Center (DLR)",
  "Italian Space Agency (ASI)", "Australian Space Agency", "New Zealand Space Agency",
  "SpaceX", "Blue Origin", "Virgin Galactic", "Sierra Space", "Rocket Lab",
  "Astra", "Relativity Space", "Firefly Aerospace", "Orbital Sciences Corporation (now Northrop Grumman Innovation Systems)",
  "United Launch Alliance (ULA)", "Arianespace", "Mitsubishi Heavy Industries (MHI)",
  "Israel Aerospace Industries (IAI)", "Turkish Aerospace Industries (TAI)",
  "Embraer", "Bombardier", "Cessna", "Cirrus Aircraft", "Textron Aviation",
  "Gulfstream Aerospace", "Dassault Aviation", "Honda Aircraft Company", "Pilatus Aircraft",
  "Piper Aircraft", "Mooney International", "Diamond Aircraft Industries", "Tecnam",
  "Air Tractor", "Cargolux", "FedEx Express", "UPS Airlines", "DHL Aviation",
  "Qatar Airways Cargo", "Emirates SkyCargo", "Lufthansa Cargo", "Korean Air Cargo",
  "Cathay Pacific Cargo", "Singapore Airlines Cargo", "China Airlines Cargo",
  "EVA Air Cargo", "ANA Cargo", "JAL Cargo", "Atlas Air", "Polar Air Cargo",
  "Kalitta Air", "National Airlines", "Western Global Airlines", "Omni Air International",
  "Alaska Air Cargo", "Southwest Cargo", "Delta Cargo", "American Airlines Cargo",
  "United Cargo", "Air Canada Cargo", "WestJet Cargo", "Copa Cargo", "LATAM Cargo",
  "Avianca Cargo", "Aeromexico Cargo", "Sky Lease Cargo", "21 Air", "ATI (Air Transport International)",
  "Miami Air International", "Sun Country Airlines Cargo", "Frontier Cargo", "Spirit Cargo",
  "Allegiant Cargo", "Mesa Airlines Cargo", "Republic Airways Cargo", "Envoy Air Cargo",
  "PSA Airlines Cargo", "GoJet Airlines Cargo", "CommutAir Cargo", "Air Wisconsin Cargo",
  "Horizon Air Cargo", "SkyWest Airlines Cargo", "ExpressJet Airlines Cargo",
  "Trans States Airlines Cargo", "Compass Airlines Cargo", "Virgin Australia Cargo",
  "Qantas Freight", "Air New Zealand Cargo", "Fiji Airways Cargo", "Air Vanuatu Cargo",
  "Solomon Airlines Cargo", "Air Niugini Cargo", "PNG Air Cargo", "Air Pacific Cargo",
  "Hawaiian Airlines Cargo", "Japan Transocean Air Cargo", "Ryukyu Air Commuter Cargo",
  "Amakusa Airlines Cargo", "StarFlyer Cargo", "Solaseed Air Cargo", "Fuji Dream Airlines Cargo",
  "Ibex Airlines Cargo", "Oriental Air Bridge Cargo", "Spring Japan Cargo", "Peach Aviation Cargo",
  "Jetstar Japan Cargo", "Vanilla Air Cargo", "AirAsia Japan Cargo", "ZIPAIR Tokyo Cargo",
  "Starlux Airlines Cargo", "Tigerair Taiwan Cargo", "V Air Cargo", "TransAsia Airways Cargo",
  "Far Eastern Air Transport Cargo", "Uni Air Cargo", "Mandarin Airlines Cargo",
  "Daily Air Cargo", "EVA Air Cargo", "China Airlines Cargo", "Air China Cargo",
  "China Eastern Airlines Cargo", "China Southern Airlines Cargo", "Hainan Airlines Cargo",
  "Shenzhen Airlines Cargo", "Sichuan Airlines Cargo", "Xiamen Airlines Cargo",
  "Juneyao Airlines Cargo", "Spring Airlines Cargo", "Lucky Air Cargo", "Ruili Airlines Cargo",
  "Chengdu Airlines Cargo", "China Express Airlines Cargo", "Tianjin Airlines Cargo",
  "GX Airlines Cargo", "Capital Airlines Cargo", "Beijing Capital Airlines Cargo",
  "Hebei Airlines Cargo", "Longjiang Airlines Cargo", "Air Changan Cargo", "Donghai Airlines Cargo",
  "Joy Air Cargo", "Okay Airways Cargo", "SF Airlines Cargo", "YTO Cargo Airlines",
  "Zhongyuan Airlines Cargo", "China Postal Airlines Cargo", "Yangtze River Express Cargo",
  "Suparna Airlines Cargo", "Uni-Top Airlines Cargo", "Grandstar Cargo International Airlines",
  "Air Bridge Cargo", "Volga-Dnepr Airlines", "Antonov Airlines", "273." // Placeholder for 1000th company if needed.
];