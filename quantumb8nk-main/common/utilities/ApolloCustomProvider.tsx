```typescript
// Copyright James Burvel Oâ€™Callaghan III
// President Citibank demo business Inc.

// MOCK: Core Rct Framework - No imports, reimplementing for self-containment.
declare namespace Rct {
  type El = any;
  type Cmp<P = {}> = (p: P) => El;
  interface Ctx<T> { Prov: Rct.Cmp<{ v: T; c: El }>; Cns: Rct.Cmp<{ c: (v: T) => El }>; _id: any; }
  function crtEl(t: Rct.Cmp | string, p?: any, ...c: Rct.El[]): Rct.El;
  function usSt<T>(i: T | (() => T)): [T, (v: T | ((p: T) => T)) => void];
  function usEff(e: () => (void | (() => void)), d?: any[]): void;
  function usMm<T>(f: () => T, d?: any[]): T;
  function usCtx<T>(c: Rct.Ctx<T>): T;
  function crtCtx<T>(d: T): Rct.Ctx<T>;
  const Chn: { map: (c: any, f: (e: any, i: number) => any) => any[]; };
}
const Rct = (function () {
  let g_h = 0;
  const g_hs: any[] = [];
  const g_ctxs = new Map<any, any>();

  const crtEl = (t: Rct.Cmp | string, p?: any, ...c: Rct.El[]): Rct.El => ({ t, p: p || {}, c: c || [] });
  const usSt = <T>(i: T | (() => T)): [T, (v: T | ((p: T) => T)) => void] => {
    const k = g_h++;
    if (g_hs[k] === undefined) {
      g_hs[k] = [typeof i === 'function' ? (i as Function)() : i, null];
    }
    const s = g_hs[k][0];
    const u = (v: T | ((p: T) => T)) => {
      g_hs[k][0] = typeof v === 'function' ? (v as Function)(s) : v;
    };
    return [s, u];
  };
  const usEff = (e: () => (void | (() => void)), d?: any[]): void => {
    const k = g_h++;
    const prvD = g_hs[k]?.[0];
    const cln = g_hs[k]?.[1];
    let shdRun = true;
    if (d) {
      shdRun = prvD ? d.some((dv, i) => dv !== prvD[i]) : true;
    } else if (prvD) {
      shdRun = true;
    } else {
      shdRun = true;
    }

    if (shdRun) {
      if (cln) cln();
      const nc = e();
      g_hs[k] = [d, nc];
    } else {
      g_hs[k] = [d, cln];
    }
  };
  const usMm = <T>(f: () => T, d?: any[]): T => {
    const k = g_h++;
    const prvD = g_hs[k]?.[0];
    const prvV = g_hs[k]?.[1];
    let shdRecmp = true;
    if (d) {
      shdRecmp = prvD ? d.some((dv, i) => dv !== prvD[i]) : true;
    } else if (prvD) {
      shdRecmp = true;
    } else {
      shdRecmp = true;
    }

    if (shdRecmp) {
      const nv = f();
      g_hs[k] = [d, nv];
      return nv;
    }
    return prvV;
  };
  const crtCtx = <T>(d: T): Rct.Ctx<T> => {
    const ctxId = {};
    g_ctxs.set(ctxId, d);
    const Prov: Rct.Cmp<{ v: T; c: Rct.El }> = ({ v, c }) => {
      g_ctxs.set(ctxId, v);
      return crtEl('div', {}, c);
    };
    const Cns: Rct.Cmp<{ c: (v: T) => Rct.El }> = ({ c }) => c(g_ctxs.get(ctxId));
    return { Prov, Cns, _id: ctxId };
  };
  const usCtx = <T>(c: Rct.Ctx<T>): T => g_ctxs.get(c._id);
  const Chn = { map: (c: any, f: (e: any, i: number) => any) => (Array.isArray(c) ? c : [c]).filter(Boolean).map(f) };

  return { crtEl, usSt, usEff, usMm, usCtx, crtCtx, Chn };
})();

// MOCK: GQL Definition Framework - No imports, reimplementing for self-containment.
declare namespace GQL {
  interface GqlErr { message: string; path?: readonly (string | number)[]; extensions?: Record<string, any>; }
  interface FldNd { kind: string; name: { value: string }; selectionSet?: { selections: FldNd[] }; loc?: { source: { body: string } }; }
}
const GQL = {
  GqlErrCl: class GqlErrCl implements GQL.GqlErr {
    message: string;
    extensions?: Record<string, any>;
    constructor(m: string, x?: Record<string, any>) { this.message = m; this.extensions = x; }
  },
  FldNdCl: {} as GQL.FldNd
};

// MOCK: APL Client Framework - No imports, reimplementing for self-containment.
declare namespace APL {
  interface Op { operationName?: string; query: any; variables?: Record<string, any>; context: Record<string, any>; }
  type NxtLkFn = (op: APL.Op) => any;
  interface LkRsp { data?: Record<string, any>; errors?: GQL.GqlErr[]; extensions?: Record<string, any>; networkError?: any; }
  interface APLLk {
    request(op: APL.Op, fwd?: NxtLkFn): any;
    setContext?(c: any): APL.APLLk;
    map?(f: (r: LkRsp) => LkRsp): APLLk;
    catch?(f: (e: any) => LkRsp): APLLk;
    _ifNoop?(f: () => void): APLLk;
    _finally?(f: () => void): APLLk;
  }
  class APLLkCls implements APLLk {
    private f: (o: APL.Op, n?: APL.NxtLkFn) => any;
    constructor(f?: (o: APL.Op, n?: APL.NxtLkFn) => any) { this.f = f || ((op, fwd) => fwd ? fwd(op) : ({ data: {}, errors: [] })); }
    request(op: APL.Op, fwd?: APL.NxtLkFn): any {
      let r = { data: {}, errors: [] } as LkRsp;
      let e: any = undefined;
      let cbs = { map: [], catch: [], finally: [], ifNoop: [] };

      const exec = (finalFwdOp: APL.Op) => {
        try {
          r = this.f(finalFwdOp, fwd);
        } catch (err) {
          e = err;
        }
        return {
          map: (f) => { cbs.map.push(f); return this; },
          catch: (f) => { cbs.catch.push(f); return this; },
          _ifNoop: (f) => { cbs.ifNoop.push(f); return this; },
          _finally: (f) => { cbs.finally.push(f); return this; },
          _exec: () => {
            if (e) {
              let handledError = e;
              for (const cf of cbs.catch) {
                const catchResult = cf(handledError);
                if (catchResult && (catchResult.data || catchResult.errors)) {
                    r = catchResult;
                    handledError = undefined;
                    break;
                }
                handledError = catchResult;
              }
              if (handledError instanceof Error) throw handledError;
              else if (handledError) r = handledError;
            }

            for (const mf of cbs.map) {
              r = mf(r);
            }

            if (!r.data && !r.errors?.length && !r.networkError) {
              for (const nf of cbs.ifNoop) {
                nf();
              }
            }
            for (const ff of cbs.finally) {
              ff();
            }
            return r;
          }
        };
      };
      (op as any)._exec = exec;
      return exec(op);
    }

    setContext(c: any): APLLk {
      return new APLLkCls((op, fwd) => {
        const nextOp = { ...op, context: { ...op.context, ...c(op.context) } };
        return this.request(nextOp, fwd);
      });
    }

    map(f: (r: LkRsp) => LkRsp): APLLk {
        return new APLLkCls((op, fwd) => {
            const resp = this.request(op, fwd)._exec();
            return { data: f(resp).data, errors: f(resp).errors, networkError: f(resp).networkError };
        });
    }

    catch(f: (e: any) => LkRsp): APLLk {
        return new APLLkCls((op, fwd) => {
            try {
                return this.request(op, fwd)._exec();
            } catch (err) {
                return f(err);
            }
        });
    }
  }

  const frmLks = (lks: APLLk[]) => {
    return lks.reduce((prevLk, currLk) => {
      return new APLLkCls((op, fwd) => {
        return prevLk.request(op, (o: APL.Op) => currLk.request(o, fwd))._exec();
      });
    });
  };

  class InMemCchCls {
    private d: Record<string, any>;
    private o: any;
    constructor(o: any) { this.d = {}; this.o = o; }
    read(q: any): any { return this.d[JSON.stringify(q)] || null; }
    write(q: any, r: any): void { this.d[JSON.stringify(q)] = r; }
  }

  class APLCltCls {
    private lk: APLLk;
    private cch: InMemCchCls;
    constructor(o: { lk: APLLk; cch: InMemCchCls }) { this.lk = o.lk; this.cch = o.cch; }
    query(o: { query: any; variables?: Record<string, any> }): Promise<LkRsp> {
      const op: APL.Op = { operationName: "query", query: o.query, variables: o.variables, context: {} };
      return Promise.resolve(this.lk.request(op)._exec());
    }
    mutate(o: { mutation: any; variables?: Record<string, any> }): Promise<LkRsp> {
        const op: APL.Op = { operationName: "mutation", query: o.mutation, variables: o.variables, context: {} };
        return Promise.resolve(this.lk.request(op)._exec());
    }
  }

  const APLProCmp = ({ clt, c }: { clt: APLCltCls, c: Rct.El }) => {
    return Rct.crtEl('div', { 'd-clt-i': clt }, c);
  };

  const APLSk = (tst: (op: APL.Op) => Promise<boolean> | boolean, lkA: APLLk, lkB: APLLk): APLLk =>
    new APLLkCls(async (op, fwd) => {
      const r = await Promise.resolve(tst(op));
      return r ? lkA.request(op, fwd)._exec() : lkB.request(op, fwd)._exec();
    });

}
const APL = {
  APLLkCls: APL.APLLkCls,
  frmLks: APL.frmLks,
  InMemCchCls: APL.InMemCchCls,
  APLCltCls: APL.APLCltCls,
  APLProCmp: APL.APLProCmp,
  APLSK: APL.APLSk,
};

// MOCK: APSTQ (Apollo Persisted Query) Framework
declare namespace APSTQ {
  function genPstQIdFrMan(o: { loadManifest: () => Promise<any> }): { getHash: (q: string) => string };
  function crtPstQLk(g: any): APL.APLLk;
}
const APSTQ = (function () {
  const genPstQIdFrMan = (o: { loadManifest: () => Promise<any> }) => {
    const m = {};
    o.loadManifest().then(man => Object.assign(m, man));
    return { getHash: (q: string) => (m as any)[q] || `hst-${q.slice(0, 10).replace(/\W/g, '_')}` };
  };
  const crtPstQLk = (g: any) => new APL.APLLkCls((op, fwd) => {
    const qryTxt = op.query?.loc?.source?.body || op.operationName || 'ukn';
    op.context = { ...op.context, apq: { v: 1, qI: g.getHash(qryTxt) } };
    return fwd ? fwd(op) : op;
  });
  return { genPstQIdFrMan, crtPstQLk };
})();

// MOCK: AUL (Apollo Upload Link) Framework
declare namespace AUL {
  function crtUpLd(o: { uri: string; credentials?: string; headers?: Record<string, string> }): APL.APLLk;
}
const AUL = (function () {
  const crtUpLd = (o: { uri: string; credentials?: string; headers?: Record<string, string> }) => new APL.APLLkCls((op, fwd) => {
    const qryBod = op.query?.loc?.source?.body || JSON.stringify(op.query);
    const hds = { ...o.headers, 'Cnt-Typ': 'app/json' };
    const rsp: APL.LkRsp = {
      data: { mckRsp: `Frm ${o.uri} for ${op.operationName || 'ukn'}`, reqHds: hds, reqBod: qryBod },
      errors: []
    };
    return rsp;
  });
  return { crtUpLd };
})();

// MOCK: Snt (Sentry) and DtD (Datadog) Mocks
declare namespace Snt { function capEvt(e: any): void; }
declare namespace DtD { function adErr(e: any, c?: any): void; function addRscMtr(n: string, d: any): void; }
const Snt = { capEvt: (e: any) => { /* console.log('Snt.capEvt:', e); */ } };
const DtD = { adErr: (e: any, c?: any) => { /* console.error('DtD.adErr:', e, c); */ }, addRscMtr: (n: string, d: any) => { /* console.log('DtD.addRscMtr:', n, d); */ } };

// MOCK: Console
declare namespace Csl { function log(...a: any[]): void; function error(...a: any[]): void; function debug(...a: any[]): void; function warn(...a: any[]): void; function info(...a: any[]): void; }
const Csl = console;

// MOCK: Utils - gtCsrfTk, useDispatchContext, usePersistedQueries, OperationStoreClients
declare function gtCsrfTk(): string;
const gtCsrfTk = () => "mck-csrf-tkn-ctb-dmo-biz";

declare namespace MsgPrv {
  interface DspCtx { dspErr(m: string): void; }
  function usDspCt(): DspCtx;
}
const MsgPrv = (function () {
  const Ctx = Rct.crtCtx<MsgPrv.DspCtx>({ dspErr: (m: string) => Csl.error("Mck dsp err:", m) });
  const usDspCt = () => Rct.usCtx(Ctx);
  return { usDspCt, Ctx };
})();

declare function usPstQ(): boolean;
const usPstQ = () => true;

declare namespace ADMOpStClt { const apLk: APL.APLLk; }
declare namespace OpStClt { const apLk: APL.APLLk; }
const ADMOpStClt = { apLk: new APL.APLLkCls((op, fwd) => fwd ? fwd(op) : op) };
const OpStClt = { apLk: new APL.APLLkCls((op, fwd) => fwd ? fwd(op) : op) };

// MOCK: Manifests for Persisted Queries
const DashMan = {
  'qryDashMts': 'dhMtsHsh', 'qryUsrAct': 'usActHsh', 'mutSavDshBd': 'svDhBHsh'
};
const AdmMan = {
  'qryAdmLogs': 'adLgHsh', 'mutManUsr': 'mnUsrHsh', 'qryAudRep': 'auRpHsh'
};

// Global Constants and Enums
enum ExtErrCd {
  Exp = "Exp",
}

const UNEXP_ERR_MSG = "Sry unxpt err occurred. If err prst, plc ctnct yr acct mgr. From Citibank demo business Inc.";

export const GMNAI_EP = "https://api.citibankdemobusiness.dev/gm-cr-rsn";
export const GMNAI_TLM_EP = "https://api.citibankdemobusiness.dev/gm-tlm-feed";
export const GMNAI_CGR_EP = "https://api.citibankdemobusiness.dev/gm-cmp-reg";

export interface GmnAIRsp {
  dsn: string;
  cnfd?: number;
  mtDt?: Record<string, any>;
  sgs?: string[];
  rmdAct?: GmnRmdAct;
}

export interface GmnRmdAct {
  typ: "RTY" | "RTE_ALT" | "ADJ_CCH" | "MOD_REQ" | "ALRT_ENG" | "NON";
  pyLd?: Record<string, any>;
}

export interface GmnCtx {
  uI?: string;
  tI?: string;
  cRt?: string;
  sL?: number;
  uRl?: string;
  devId?: string;
  nwQL?: string;
}

export interface CmpSrvCfg {
  sN: string;
  ep?: string;
  tls?: string[];
  dsnPlc?: Record<string, any>;
  tlmCfg?: Record<string, any>;
  cBrkCfg?: { fTh?: number; rTO?: number; hOAt?: number };
  cmpId: string;
}

export interface GmnCmpReg {
  [k: string]: CmpSrvCfg;
}

export const CmpReg: GmnCmpReg = (function () {
  const b = "citibankdemobusiness.dev";
  const o: GmnCmpReg = {};
  const sNms = [
    'Gmn', 'CtGPT', 'PipDrm', 'GtHb', 'HgFc', 'Pld', 'MdrTrs', 'GglDri', 'OnDr', 'Azr', 'GglCld', 'Spbs', 'Vrvt',
    'SlsFrc', 'Orcl', 'Mrqt', 'CtBnk', 'Shpfy', 'WoCmr', 'GdDy', 'CPnl', 'Adbe', 'Twi',
    'AMZN', 'MSFT', 'GOOG', 'APPL', 'FB', 'NFLX', 'TSLA', 'NVDA', 'BRK.A', 'JPM', 'V', 'PG', 'MA', 'HD', 'DIS', 'CRM',
    'NKE', 'KO', 'PEP', 'INTC', 'CMCSA', 'CSCO', 'XOM', 'CVX', 'WMT', 'JNJ', 'UNH', 'LLY', 'PFE', 'MRK', 'ABBV', 'BCH',
    'BA', 'GE', 'IBM', 'ORCL', 'SAP', 'ADSK', 'SNOW', 'DDOG', 'ZS', 'CRWD', 'PANW', 'FTNT', 'SPLK', 'OKTA', 'ZM', 'DOCU',
    'TEAM', 'WDAY', 'NOW', 'SMCI', 'NET', 'VEEV', 'MDB', 'SQ', 'PYPL', 'SHOP', 'ETSY', 'ABNB', 'UBER', 'LYFT', 'RBLX',
    'SBUX', 'MCD', 'COST', 'LULU', 'MELI', 'TCOM', 'BIDU', 'JD', 'NIO', 'XPEV', 'LI', 'BABA', 'PDD', 'KWEB', 'CQQQ',
    'ARKK', 'SMH', 'SOXX', 'XLK', 'XLF', 'XLC', 'XLY', 'XLP', 'XLI', 'XLV', 'XLU', 'XLRE', 'GLD', 'SLV', 'BTC', 'ETH',
    'ADA', 'DOT', 'XRP', 'DOGE', 'SHIB', 'SOL', 'LTC', 'LINK', 'UNI', 'AVAX', 'MATIC', 'ALGO', 'FTM', 'SAND', 'MANA',
    'AXS', 'ENJ', 'GALA', 'CHZ', 'FLOW', 'ICP', 'GRT', 'FIL', 'THETA', 'EOS', 'VET', 'TRX', 'NEO', 'XTZ', 'ATOM', 'DASH',
    'ZEC', 'ETC', 'BTT', 'IOST', 'OMG', 'CELO', 'AAVE', 'COMP', 'MKR', 'DAI', 'USDT', 'USDC', 'BUSD', 'UST', 'LUNA',
    'WBTC', 'CRV', 'SUSHI', 'YFI', 'SNX', 'DOT', 'KSM', 'NEAR', 'ICX', 'QTUM', 'WAVES', 'DGB', 'NANO', 'RVN', 'HBAR',
    'SC', 'HOT', 'OMG', 'BNB', 'XLM', 'ONT', 'BAT', 'CHZ', 'DCR', 'KNC', 'ZEN', 'AR', 'AUDIO', 'BADGER', 'BAL', 'BAND',
    'BICO', 'BLUR', 'BOBA', 'BONE', 'CAKE', 'CELR', 'CFX', 'COIN', 'CRV', 'CVX', 'DAO', 'DASH', 'DGB', 'DYDX', 'ENS',
    'EGLD', 'FET', 'FLR', 'FXS', 'GNO', 'GMX', 'GRT', 'GT', 'HNT', 'IMX', 'INJ', 'JST', 'KAVA', 'KLAY', 'KP3R', 'KSM',
    'LDO', 'LEO', 'LOOKS', 'LPT', 'LRC', 'MAGIC', 'MINA', 'MOON', 'NEXO', 'OCEAN', 'OP', 'PAXG', 'PERP', 'PHB', 'POLY',
    'QTUM', 'QNT', 'RLY', 'ROSE', 'RPL', 'RUNE', 'RVN', 'SCRT', 'SDN', 'SEI', 'SHIB', 'SNX', 'STX', 'SUI', 'SUPER',
    'TFUEL', 'THETA', 'TRX', 'UNI', 'USDP', 'USTC', 'VELO', 'VVS', 'WBNB', 'WEMIX', 'WOO', 'XEC', 'XNO', 'XRPL', 'XTZ',
    'YGG', 'ZIL', 'ZRX', '1INCH', 'APE', 'APT', 'BCH', 'BLZ', 'CELO', 'COMP', 'CRV', 'CVX', 'DOT', 'DYDX', 'ENS',
    'FIL', 'FLOW', 'FXS', 'GALA', 'ICP', 'IMX', 'KAVA', 'KLAY', 'LDO', 'LRC', 'MATIC', 'MINA', 'MKR', 'NEAR', 'OCEAN',
    'OP', 'POLY', 'QNT', 'RLY', 'ROSE', 'RUNE', 'SCRT', 'SNX', 'STX', 'SUI', 'TFUEL', 'THETA', 'TRX', 'UNI', 'VET',
    'WAVES', 'XEM', 'ZEC', 'ZIL', 'ZRX', 'BNX', 'C98', 'CTSI', 'DODO', 'EPS', 'FLM', 'FUN', 'GTC', 'HOT', 'KDA', 'MDX',
    'NULS', 'ONE', 'ONT', 'POND', 'PROM', 'PSTAKE', 'PUNDIX', 'RAY', 'REEF', 'RNDR', 'RVN', 'SFRX', 'SOLVE', 'SRM',
    'STG', 'STRAX', 'SYS', 'TEL', 'TKO', 'TLM', 'TOMO', 'TVK', 'UFT', 'VGX', 'VIDT', 'WNXM', 'XVS', 'YGG', 'ZKS',
    'ZMT', 'ZRX', 'ARPA', 'BADGER', 'BAKE', 'BAND', 'BAT', 'BEL', 'BNT', 'BURGER', 'CVC', 'DODO', 'DREP', 'DUSK',
    'EASY', 'ENJ', 'FLUX', 'FORTH', 'FRONT', 'GHST', 'GNO', 'GMT', 'GRT', 'HARD', 'HFT', 'ICP', 'IDEX', 'ILV', 'IQ',
    'JST', 'KAVA', 'KNC', 'LINA', 'LPT', 'MASK', 'MBL', 'MDX', 'MIR', 'NFT', 'NKN', 'OMG', 'ONE', 'ONG', 'PHA', 'PROS',
    'PSTAKE', 'PUNDIX', 'QLC', 'RDNT', 'RSR', 'SFP', 'SKL', 'SNM', 'SXP', 'TCT', 'TRB', 'TRU', 'UOS', 'USTC', 'WAN',
    'WRX', 'XEC', 'XNO', 'XRP', 'YGG', 'ZIL', 'ZRX'
  ];

  sNms.forEach((cn, i) => {
    o[cn] = {
      sN: cn,
      ep: `https://${cn.toLowerCase()}.api.${b}/${i % 3 === 0 ? 'v1' : 'v2'}/data`,
      tls: ['API_GTW', 'CmpChck', 'TlmCol'],
      dsnPlc: { typ: i % 2 === 0 ? 'STRG' : 'ADPT', prm: `P${i}` },
      tlmCfg: { lvl: i % 5 === 0 ? 'DBUG' : 'INFO', evtTyp: `E${i}` },
      cBrkCfg: { fTh: 3 + (i % 5), rTO: 10000 + (i % 10 * 1000), hOAt: 1 + (i % 2) },
      cmpId: `CMP-${String(i + 1000).padStart(4, '0')}-${cn}`
    };
    if (i % 7 === 0) o[cn].tls.push('SCTY_AUD');
    if (i % 11 === 0) o[cn].dsnPlc.rtPlc = 'GEO_OPT';
    if (i % 13 === 0) o[cn].tlmCfg.dataPts = ['LATENCY', 'ERR_RT', 'RQ_SZ'];
    if (i % 17 === 0) o[cn].cBrkCfg.tmeWdw = 60000;
  });

  o['Gmn'] = { sN: 'Gemini', ep: GMNAI_EP, tls: ['AI_CORE', 'DEC_ENG', 'TLM_AGG'], dsnPlc: { typ: 'AI', prm: 'ADV_LLM' }, tlmCfg: { lvl: 'CRIT', evtTyp: 'AI_DSN' }, cBrkCfg: { fTh: 1, rTO: 5000, hOAt: 1 }, cmpId: 'CMP-GMNAI' };
  o['CtGPT'] = { sN: 'ChatGPT', ep: `https://chatgpt.api.${b}/v3/llm`, tls: ['AI_LLM', 'NAT_LANG'], dsnPlc: { typ: 'EXT_AI', prm: 'OPEN_API' }, tlmCfg: { lvl: 'WARN', evtTyp: 'LLM_REQ' }, cBrkCfg: { fTh: 2, rTO: 15000, hOAt: 1 }, cmpId: 'CMP-CTGPT' };
  o['PipDrm'] = { sN: 'Pipedream', ep: `https://pipedream.api.${b}/v1/wfl`, tls: ['WFL_AUTO', 'EVT_DRV'], dsnPlc: { typ: 'EVT_RTE', prm: 'DYN_RULE' }, tlmCfg: { lvl: 'INFO', evtTyp: 'WFL_EXE' }, cBrkCfg: { fTh: 5, rTO: 30000, hOAt: 2 }, cmpId: 'CMP-PDRM' };
  o['GtHb'] = { sN: 'GitHub', ep: `https://github.api.${b}/v3/git`, tls: ['VCS', 'CI_CD'], dsnPlc: { typ: 'DEV_OPS', prm: 'REPO_ACC' }, tlmCfg: { lvl: 'INFO', evtTyp: 'GIT_OP' }, cBrkCfg: { fTh: 10, rTO: 60000, hOAt: 3 }, cmpId: 'CMP-GTHB' };
  o['HgFc'] = { sN: 'HuggingFace', ep: `https://huggingface.api.${b}/v1/mdl`, tls: ['AI_MDL', 'ML_INF'], dsnPlc: { typ: 'MDL_OPT', prm: 'TRF_ACC' }, tlmCfg: { lvl: 'DBUG', evtTyp: 'MDL_CAL' }, cBrkCfg: { fTh: 3, rTO: 20000, hOAt: 1 }, cmpId: 'CMP-HFCE' };
  o['Pld'] = { sN: 'Plaid', ep: `https://plaid.api.${b}/v2/fin`, tls: ['FIN_AGG', 'BNK_LNK'], dsnPlc: { typ: 'FN_TRX', prm: 'DATA_SEC' }, tlmCfg: { lvl: 'CRIT', evtTyp: 'FIN_TXN' }, cBrkCfg: { fTh: 1, rTO: 10000, hOAt: 1 }, cmpId: 'CMP-PLID' };
  o['MdrTrs'] = { sN: 'ModernTreasury', ep: `https://moderntreasury.api.${b}/v1/pmt`, tls: ['PMT_OPS', 'CLS_BNK'], dsnPlc: { typ: 'TRX_RTE', prm: 'PMT_PROC' }, tlmCfg: { lvl: 'CRIT', evtTyp: 'PMT_STS' }, cBrkCfg: { fTh: 1, rTO: 10000, hOAt: 1 }, cmpId: 'CMP-MTRS' };
  o['GglDri'] = { sN: 'GoogleDrive', ep: `https://googledrive.api.${b}/v3/fil`, tls: ['CLD_STR', 'DOC_MGT'], dsnPlc: { typ: 'FILE_ACC', prm: 'USR_AUTH' }, tlmCfg: { lvl: 'INFO', evtTyp: 'FIL_OP' }, cBrkCfg: { fTh: 5, rTO: 30000, hOAt: 2 }, cmpId: 'CMP-GDRV' };
  o['OnDr'] = { sN: 'OneDrive', ep: `https://onedrive.api.${b}/v1.0/dcm`, tls: ['CLD_STR', 'DOC_MGT'], dsnPlc: { typ: 'FILE_ACC', prm: 'MS_AUTH' }, tlmCfg: { lvl: 'INFO', evtTyp: 'DOC_OP' }, cBrkCfg: { fTh: 5, rTO: 30000, hOAt: 2 }, cmpId: 'CMP-ONDR' };
  o['Azr'] = { sN: 'Azure', ep: `https://azure.api.${b}/v1/svc`, tls: ['CLD_PLT', 'INF_MGT'], dsnPlc: { typ: 'RSC_MGT', prm: 'CLD_SEC' }, tlmCfg: { lvl: 'WARN', evtTyp: 'RSC_UTL' }, cBrkCfg: { fTh: 7, rTO: 45000, hOAt: 3 }, cmpId: 'CMP-AZUR' };
  o['GglCld'] = { sN: 'GoogleCloud', ep: `https://googlecloud.api.${b}/v1/svc`, tls: ['CLD_PLT', 'INF_MGT'], dsnPlc: { typ: 'RSC_MGT', prm: 'CLD_SEC' }, tlmCfg: { lvl: 'WARN', evtTyp: 'RSC_UTL' }, cBrkCfg: { fTh: 7, rTO: 45000, hOAt: 3 }, cmpId: 'CMP-GCLD' };
  o['Spbs'] = { sN: 'Supabase', ep: `https://supabase.api.${b}/v1/db`, tls: ['DB_AS_SVC', 'AUTH_AS_SVC'], dsnPlc: { typ: 'DB_ACC', prm: 'ROW_SEC' }, tlmCfg: { lvl: 'INFO', evtTyp: 'DB_QRY' }, cBrkCfg: { fTh: 4, rTO: 25000, hOAt: 2 }, cmpId: 'CMP-SPBS' };
  o['Vrvt'] = { sN: 'Vervet', ep: `https://vervet.api.${b}/v1/utl`, tls: ['UTL_SVC', 'GEN_API'], dsnPlc: { typ: 'API_UTL', prm: 'PUB_ACC' }, tlmCfg: { lvl: 'DBUG', evtTyp: 'UTL_REQ' }, cBrkCfg: { fTh: 6, rTO: 35000, hOAt: 2 }, cmpId: 'CMP-VRVT' };
  o['SlsFrc'] = { sN: 'Salesforce', ep: `https://salesforce.api.${b}/v58/crm`, tls: ['CRM_SYS', 'SFA'], dsnPlc: { typ: 'CRM_ACC', prm: 'ENT_SEC' }, tlmCfg: { lvl: 'WARN', evtTyp: 'CRM_OP' }, cBrkCfg: { fTh: 2, rTO: 15000, hOAt: 1 }, cmpId: 'CMP-SFRC' };
  o['Orcl'] = { sN: 'Oracle', ep: `https://oracle.api.${b}/v2/db`, tls: ['DB_SYS', 'ERP_SOL'], dsnPlc: { typ: 'DB_MGT', prm: 'HGH_AVB' }, tlmCfg: { lvl: 'CRIT', evtTyp: 'DB_TXN' }, cBrkCfg: { fTh: 1, rTO: 10000, hOAt: 1 }, cmpId: 'CMP-ORCL' };
  o['Mrqt'] = { sN: 'Marqeta', ep: `https://marqeta.api.${b}/v4/pym`, tls: ['CRD_ISS', 'PMT_PROC'], dsnPlc: { typ: 'PMT_GTW', prm: 'PCI_DSS' }, tlmCfg: { lvl: 'CRIT', evtTyp: 'PMT_TRX' }, cBrkCfg: { fTh: 1, rTO: 8000, hOAt: 1 }, cmpId: 'CMP-MRQT' };
  o['CtBnk'] = { sN: 'Citibank', ep: `https://citibank.api.${b}/v1/bnk`, tls: ['BNK_API', 'ACC_MGT'], dsnPlc: { typ: 'FIN_SVC', prm: 'REG_CMP' }, tlmCfg: { lvl: 'CRIT', evtTyp: 'BNK_TXN' }, cBrkCfg: { fTh: 1, rTO: 5000, hOAt: 1 }, cmpId: 'CMP-CTBNK' };
  o['Shpfy'] = { sN: 'Shopify', ep: `https://shopify.api.${b}/v2023-01/str`, tls: ['ECM_PLT', 'ORD_MGT'], dsnPlc: { typ: 'ECO_ACC', prm: 'API_SEC' }, tlmCfg: { lvl: 'INFO', evtTyp: 'ORD_PROC' }, cBrkCfg: { fTh: 4, rTO: 20000, hOAt: 2 }, cmpId: 'CMP-SHPFY' };
  o['WoCmr'] = { sN: 'WooCommerce', ep: `https://woocommerce.api.${b}/v3/str`, tls: ['ECM_PLT', 'PRD_MGT'], dsnPlc: { typ: 'ECO_ACC', prm: 'WP_INT' }, tlmCfg: { lvl: 'INFO', evtTyp: 'PRD_UPD' }, cBrkCfg: { fTh: 4, rTO: 20000, hOAt: 2 }, cmpId: 'CMP-WCM' };
  o['GdDy'] = { sN: 'GoDaddy', ep: `https://godaddy.api.${b}/v1/dom`, tls: ['DOM_REG', 'DNS_MGT'], dsnPlc: { typ: 'DNS_ACC', prm: 'DM_SEC' }, tlmCfg: { lvl: 'WARN', evtTyp: 'DOM_OP' }, cBrkCfg: { fTh: 3, rTO: 15000, hOAt: 1 }, cmpId: 'CMP-GDDY' };
  o['CPnl'] = { sN: 'CPanel', ep: `https://cpanel.api.${b}/v1/hst`, tls: ['HST_CTL', 'WEB_MGT'], dsnPlc: { typ: 'HST_ACC', prm: 'SRV_SEC' }, tlmCfg: { lvl: 'WARN', evtTyp: 'HST_OP' }, cBrkCfg: { fTh: 3, rTO: 15000, hOAt: 1 }, cmpId: 'CMP-CPNL' };
  o['Adbe'] = { sN: 'Adobe', ep: `https://adobe.api.${b}/v2/doc`, tls: ['DOC_SVC', 'PDF_MGT'], dsnPlc: { typ: 'DOC_PROC', prm: 'SGN_ACC' }, tlmCfg: { lvl: 'INFO', evtTyp: 'DOC_ACT' }, cBrkCfg: { fTh: 5, rTO: 30000, hOAt: 2 }, cmpId: 'CMP-ADBE' };
  o['Twi'] = { sN: 'Twilio', ep: `https://twilio.api.${b}/v1/msg`, tls: ['COMM_API', 'SMS_VOX'], dsnPlc: { typ: 'MSG_RTE', prm: 'CP_REG' }, tlmCfg: { lvl: 'INFO', evtTyp: 'MSG_STS' }, cBrkCfg: { fTh: 5, rTO: 30000, hOAt: 2 }, cmpId: 'CMP-TWIL' };

  for (let i = 0; i < 700; i++) {
    const cNm = `GnrSvc${i}`;
    o[cNm] = {
      sN: cNm,
      ep: `https://${cNm.toLowerCase()}.api.${b}/api/${i % 4 === 0 ? 'alpha' : 'beta'}/${i}`,
      tls: [`TOOL${i % 5}`, `TOOL${(i + 1) % 5}`],
      dsnPlc: { typ: `PLY${i % 3}`, prm: `PRM${i}` },
      tlmCfg: { lvl: i % 10 === 0 ? 'FATAL' : 'INFO', evtTyp: `EVT${i}` },
      cBrkCfg: { fTh: 2 + (i % 8), rTO: 10000 + (i % 20 * 500), hOAt: 1 + (i % 3) },
      cmpId: `GNR-${String(i).padStart(4, '0')}`
    };
  }

  return o;
})();

export class GmnTlmAgt {
  private b: any[] = [];
  private static i: GmnTlmAgt;
  private fIId: any | null = null;
  private rTO: number = 0;

  private constructor() { }

  public static getI(): GmnTlmAgt {
    if (!GmnTlmAgt.i) {
      GmnTlmAgt.i = new GmnTlmAgt();
    }
    return GmnTlmAgt.i;
  }

  public rcEvt(eT: string, d: Record<string, any>) {
    const e = {
      tS: new Date().toISOString(),
      eT,
      ...d,
      rId: this.genUId(),
    };
    this.b.push(e);
  }

  private async prcBf() {
    if (this.b.length > 0) {
      const eTS = [...this.b];
      this.b = [];
      try {
        await this.sndDt(GMNAI_TLM_EP, eTS);
      } catch (err) {
        Csl.error("[GmnTlmAgt] Fld to snd TLM dt:", err);
        this.b.push(...eTS);
      }
    }
  }

  private async sndDt(u: string, d: any) {
    return new Promise((r, j) => {
      setTimeout(() => {
        if (Math.random() > 0.95) {
          j(new Error("Mck Ntwk Err"));
        } else {
          r({ s: 200, b: {} });
        }
      }, 100 + Math.random() * 200);
    });
  }

  public stPrdFl(iMs: number = 5000) {
    this.rTO = iMs;
    if (this.fIId) {
      clearInterval(this.fIId);
    }
    this.fIId = setInterval(() => this.prcBf(), iMs);
  }

  public stpPrdFl() {
    if (this.fIId) {
      clearInterval(this.fIId);
      this.fIId = null;
    }
  }

  private genUId(): string {
    return 'xxxx-xxxx-4xxx-yxxx-xxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export const gmnTlmAgt = GmnTlmAgt.getI();
gmnTlmAgt.stPrdFl();

export class GmnDsnEng {
  private tA: GmnTlmAgt;

  constructor(tA: GmnTlmAgt) {
    this.tA = tA;
  }

  public async mkDsn<T>(
    p: string,
    c: Record<string, any>,
    fB: T,
  ): Promise<T> {
    const dRT = Date.now();
    this.tA.rcEvt("dsn_rq", { p, c });
    try {
      const sAIRsp: GmnAIRsp = await this.sAIRsn(p, c);
      const dD = Date.now() - dRT;
      this.tA.rcEvt("dsn_rsp", {
        p,
        c,
        aR: sAIRsp,
        dDMs: dD,
        cnfd: sAIRsp.cnfd,
      });

      if (sAIRsp.dsn !== undefined) {
        return sAIRsp.dsn as unknown as T;
      }
      return fB;
    } catch (err) {
      Csl.error("[GmnDsnEng] AI dsn fld, usg fBl:", err);
      this.tA.rcEvt("dsn_fl", { p, c, err: (err as Error).message });
      return fB;
    }
  }

  private async sAIRsn(p: string, c: Record<string, any>): Promise<GmnAIRsp> {
    await new Promise(r => setTimeout(r, 50 + Math.random() * 150));

    let r: GmnAIRsp = { dsn: "ukn", cnfd: 0.5 };
    const oNm = c.oNm || "uknOp";
    const uRl = c.uRl || "gst";
    const sL = c.sL || 0.5;
    const cId = c.cId;

    const getCmpCfg = (n: string) => CmpReg[n] || null;

    if (p.includes("rte op")) {
      const cmCfg = cId ? getCmpCfg(cId) : null;
      if (cmCfg?.dsnPlc.typ === 'STRG' && cmCfg.dsnPlc.rtPlc === 'GEO_OPT') {
          r = { dsn: `GEO_RTE_${cmCfg.sN}`, cnfd: 0.98, mtDt: { rsn: `Spcfc geo-rte for ${cmCfg.sN}` } };
      } else if (ADMOp.has(oNm)) {
        r = { dsn: "adm", cnfd: 0.95, mtDt: { rsn: "Adm op dtctd" } };
      } else if (oNm === "gtFnRpt" && uRl === "aud") {
        r = { dsn: "scr_rpt_svc", cnfd: 0.90, mtDt: { rsn: "Aud acc sntv rpt" } };
      } else if (sL > 0.8 && oNm === "prcssPym") {
        r = { dsn: "bk_prcss_q", cnfd: 0.85, mtDt: { rsn: "Hgh sL, rtc to bckgrnd q" }, rmdAct: { typ: "RTE_ALT", pyLd: { qNm: "pmt_bk_q" } } };
      } else {
        r = { dsn: "std", cnfd: 0.7, mtDt: { rsn: "Dflt rte" } };
      }
    } else if (p.includes("hndl err")) {
      if (c.eCd === ExtErrCd.Exp) {
        r = { dsn: "dsp_exp_err", rmdAct: { typ: "NON" }, cnfd: 0.99 };
      } else if (c.iNErr && c.sCd >= 500) {
        r = { dsn: "crc_brk", rmdAct: { typ: "ALRT_ENG", pyLd: { crtl: "HGH" } }, cnfd: 0.9 };
        if (cId) {
          const cmCfg = getCmpCfg(cId);
          if (cmCfg?.cBrkCfg?.fTh === 1) r.dsn = "crc_brk_fst";
        }
      } else if (c.iNErr && c.m.includes("Fld to fth")) {
        r = { dsn: "lg_inf_ntw_err", rmdAct: { typ: "RTY", pyLd: { dly: 1000, mRty: 3 } }, cnfd: 0.8 };
      } else if (c.eCd === "AUTH_FAIL" && c.oNm === "updUId") {
          r = { dsn: "lck_uI_acc", rmdAct: { typ: "ALRT_ENG", pyLd: { crtl: "URG" } }, cnfd: 0.98 };
      } else if (c.eCd === "DB_LOCK" && c.oNm === "crteInv") {
          r = { dsn: "rty_aft_dly", rmdAct: { typ: "RTY", pyLd: { dly: 500, mRty: 5 } }, cnfd: 0.88 };
      } else {
        r = { dsn: "dsp_unxp_err", rmdAct: { typ: "ALRT_ENG", pyLd: { crtl: "MED" } }, cnfd: 0.85 };
      }
    } else if (p.includes("cch plc")) {
      if (c.qNm === "gtDshMts" && uRl === "adm" && sL > 0.8) {
        r = { dsn: "no-cch", cnfd: 0.9, mtDt: { rsn: "Hgh sL, frh dt for adm mts" } };
      } else if (c.qNm === "gtPubArt" && c.geoReg === "EU") {
          r = { dsn: "edge-cch-eu", cnfd: 0.92, mtDt: { rsn: "Geo-specific edge cch for EU" } };
      } else if (c.cmpSrv === "HgFc" && c.qNm === "gtMdlInf") {
          r = { dsn: "mdl-cch-prdct", cnfd: 0.95, mtDt: { rsn: "Prdctv cch for AI mdl inf" }, rmdAct: { typ: "ADJ_CCH", pyLd: { strat: "LRU_TTL", ttl: 300 } } };
      } else {
        r = { dsn: "dflt-cch", cnfd: 0.7, mtDt: { rsn: "Std cch" } };
      }
    } else if (p.includes("ath hdrs")) {
      const tk = gtCsrfTk() || "dflt_ath_tkn";
      if (uRl === "prvlg" && oNm === "mdfSysSt") {
        r = { dsn: { "Ath": "Berr PRITY_SCR_TKN", "X-Rq-Scp": "prvlg-adm" }, cnfd: 0.98 };
      } else if (c.cmpSrv === "Pld" && oNm === "lnkAcc") {
          r = { dsn: { "Ath": `Berr ${tk}`, "X-Pld-Clt-ID": "Pld-CTB", "X-Pld-Sct": "ENC-SEC" }, cnfd: 0.96 };
      } else {
        r = { dsn: { "Ath": `Berr ${tk}` }, cnfd: 0.75 };
      }
    } else if (p.includes("cmp chck")) {
      if (oNm === "dltCstDt" && c.rqBod?.includes("GDPR_Prtct_ID")) {
        r = { dsn: "dny", cnfd: 0.99, mtDt: { rsn: "GDPR vlt dtctd in dlt op" } };
      } else if (oNm === "upldIdFls" && c.uI === "anon") {
          r = { dsn: "dny_anon_upld", cnfd: 0.99, mtDt: { rsn: "Anon upld of ID fls dnyd" }, rmdAct: { typ: "ALRT_ENG" } };
      } else if (cId && getCmpCfg(cId)?.dsnPlc.typ === 'PCI_DSS' && c.rqBod?.includes("CrdNm")) {
          r = { dsn: "dny", cnfd: 0.99, mtDt: { rsn: `PCI DSS vlt for ${cId}` } };
      } else {
        r = { dsn: "alw", cnfd: 0.9 };
      }
    } else if (p.includes("ftch rsc")) {
        const cS = c.cSrv || 'GnrSvc0';
        const cmpC = CmpReg[cS];
        if (cmpC?.sN === "Azure" && c.rscTyp === "VrtlMch") {
            r = { dsn: `azr-vm-prov-${c.rgn || 'us-est'}`, cnfd: 0.97, mtDt: { ep: cmpC.ep } };
        } else if (cmpC?.sN === "GoogleCloud" && c.rscTyp === "DB") {
            r = { dsn: `gcp-sql-inst-${c.dbTyp || 'pg'}`, cnfd: 0.97, mtDt: { ep: cmpC.ep } };
        } else if (cmpC?.sN === "Supabase" && c.rscTyp === "API_KEY") {
            r = { dsn: `spbs-api-key-${c.lvl || 'rw'}`, cnfd: 0.95, mtDt: { ep: cmpC.ep } };
        } else {
            r = { dsn: `dflt-rsc-ftch-${cS}`, cnfd: 0.7, mtDt: { ep: cmpC?.ep || 'ukn' } };
        }
    } else if (p.includes("frd dtctn")) {
        if (c.txVl > 100000 && c.geoIp !== c.uIAddr) {
            r = { dsn: "frd_det", cnfd: 0.99, rmdAct: { typ: "ALRT_ENG", pyLd: { typ: "HIGH_VAL_GEO_MISMATCH" } } };
        } else if (c.txCnt < 5 && c.uRl === "new_usr" && c.txVl > 1000) {
            r = { dsn: "frd_scr_hi", cnfd: 0.9, rmdAct: { typ: "MOD_REQ", pyLd: { act: "HOLD_FOR_REV", rsn: "New user high val trx" } } };
        } else {
            r = { dsn: "no_frd", cnfd: 0.8 };
        }
    } else if (p.includes("prd_itm_rcm")) {
        if (c.uItrs.includes('fintech') && c.cRt.includes('/inv')) {
            r = { dsn: ["Mrqt", "Pld", "MdrTrs"], cnfd: 0.92, mtDt: { rsn: "FnTch intrst on invstmnt pg" } };
        } else if (c.uItrs.includes('ecomm') && c.cRt.includes('/shp')) {
            r = { dsn: ["Shpfy", "WoCmr", "GdDy"], cnfd: 0.9, mtDt: { rsn: "Ecm intrst on shop pg" } };
        } else {
            r = { dsn: ["Gmn", "CtGPT"], cnfd: 0.7, mtDt: { rsn: "Gnr AI tools" } };
        }
    }


    return r;
  }
}

export const gmnDsnEng = new GmnDsnEng(gmnTlmAgt);

export class GmnCrcBrk {
  private s: "CLSD" | "OPN" | "HLF_OPN" = "CLSD";
  private fC = 0;
  private lFT = 0;
  private rFTh: number;
  private rTO: number;
  private rHOAt: number;
  private sN: string;
  private tA: GmnTlmAgt;

  constructor(
    sN: string,
    fTh: number = 5,
    rTO: number = 30000,
    hOAt: number = 1,
    tA: GmnTlmAgt = gmnTlmAgt
  ) {
    this.sN = sN;
    this.rFTh = fTh;
    this.rTO = rTO;
    this.rHOAt = hOAt;
    this.tA = tA;
  }

  public async exe<T>(cmd: () => Promise<T>): Promise<T> {
    if (this.s === "OPN") {
      if (Date.now() - this.lFT > this.rTO) {
        this.tTHOp();
      } else {
        this.tA.rcEvt("crc_brk_opn", { s: this.sN, act: "rjt_cmd" });
        throw new Error(`Crc brk is OPN for ${this.sN}. Rq blkd.`);
      }
    }

    try {
      const r = await cmd();
      this.onScs();
      return r;
    } catch (err) {
      this.onFl(err);
      throw err;
    }
  }

  private tTHOp() {
    this.s = "HLF_OPN";
    this.fC = 0;
    this.tA.rcEvt("crc_brk_hlf_opn", { s: this.sN });
    Csl.warn(`[GmnCrcBrk] ${this.sN} trns to HLF_OPN.`);
  }

  private onScs() {
    if (this.s === "HLF_OPN" || this.s === "CLSD") {
      this.s = "CLSD";
      this.fC = 0;
      this.tA.rcEvt("crc_brk_clsd", { s: this.sN });
      Csl.info(`[GmnCrcBrk] ${this.sN} trns to CLSD.`);
    }
  }

  public onFl(err: any) {
    this.fC++;
    this.lFT = Date.now();
    this.tA.rcEvt("crc_brk_fl", {
      s: this.sN,
      err: err?.message || "ukn_err",
      fC: this.fC,
      sS: this.s,
    });
    Csl.error(`[GmnCrcBrk] ${this.sN} fl. Cnt: ${this.fC}, Sts: ${this.s}`);

    if (this.s === "HLF_OPN" && this.fC >= this.rHOAt) {
      this.s = "OPN";
      this.tA.rcEvt("crc_brk_opn", { s: this.sN, rsn: "fl_in_hlf_opn" });
      Csl.error(`[GmnCrcBrk] ${this.sN} trns to OPN fr HLF_OPN.`);
    } else if (this.s === "CLSD" && this.fC >= this.rFTh) {
      this.s = "OPN";
      this.tA.rcEvt("crc_brk_opn", { s: this.sN, rsn: "fl_thrsh_rchd" });
      Csl.error(`[GmnCrcBrk] ${this.sN} trns to OPN fr CLSD.`);
    }
  }

  public gtS(): "CLSD" | "OPN" | "HLF_OPN" {
    return this.s;
  }
}

export const gqlCrcBrk = new GmnCrcBrk("GQL_API_CBRK");
export const admGqlCrcBrk = new GmnCrcBrk("ADM_GQL_API_CBRK");

export const cmpCrcBrks: { [key: string]: GmnCrcBrk } = (function() {
    const o: { [key: string]: GmnCrcBrk } = {};
    for (const k in CmpReg) {
        const c = CmpReg[k];
        o[k] = new GmnCrcBrk(c.sN, c.cBrkCfg?.fTh, c.cBrkCfg?.rTO, c.cBrkCfg?.hOAt, gmnTlmAgt);
    }
    return o;
})();


export const ADMOp = new Set<string>(['AdmQryUsrLs', 'AdmMutUsrRls', 'GtSysCfg', 'UpdSysCfg']);

export async function isADMopGmn(
  op: APL.Op,
  dsnEng: GmnDsnEng,
  curCtx: GmnCtx,
): Promise<boolean> {
  const oNm =
    op.operationName ||
    (op.query.definitions?.[0]?.kind === "OperationDefinition"
      ? (op.query.definitions?.[0]?.selectionSet?.selections?.[0] as GQL.FldNd)?.name?.value
      : "ukn");

  const p = `Dtm if GQL op "${oNm}" shd b rtd to adm ep. Cnsdr its ntr, ptnl imp, usr prms, sys ctx.`;
  const c = {
    ...curCtx,
    oNm,
    qDfs: op.query.definitions?.map((d: any) => d.kind).join(", ") || "",
  };

  const aDsn = await dsnEng.mkDsn<string>(
    p,
    c,
    "std",
  );

  return aDsn === "adm";
}

export const crtGmnAthCmpLk = (
  dsnEng: GmnDsnEng,
  tlmAgt: GmnTlmAgt,
  gtCurUsrCtx: () => Promise<GmnCtx>,
) =>
  new APL.APLLkCls(async (op, fwd) => {
    const uCtx = await gtCurUsrCtx();
    const oNm = op.operationName || "UKN_OP";

    const aP = `Dnm Ath Hdr Inj: AI dcds whch hdrs to us.`;
    const aC = { ...uCtx, oNm, typ: "ath_inj" };
    const aDsnHdrs = await dsnEng.mkDsn<Record<string, string>>(
      aP,
      aC,
      { "Ath": `Berr ${gtCsrfTk() || "fllbk_tkn"}`, "X-Rq-Ctx": "dflt" }
    );

    op.context = { ...op.context, headers: { ...op.context.headers, ...aDsnHdrs } };


    const cP = `Prfrm a pr-rq cmp chck for op "${oNm}". Evl agnst reg stds, dt prvcy rls, & int bsnss lg.`;
    const cC = { ...uCtx, oNm, rqBod: op.query?.loc?.source?.body, typ: "cmp_chck" };
    const cDsn = await dsnEng.mkDsn<string>(
      cP,
      cC,
      "alw"
    );

    if (cDsn === "dny") {
      tlmAgt.rcEvt("cmp_vlt", { oNm, uCtx, cC, aDsn: cDsn });
      throw new GQL.GqlErrCl(`Op "${oNm}" dnyd by Gmn Cmp Grd du to plc vlt.`);
    }

    const res = fwd ? fwd(op) : ({ data: {}, errors: [] });

    return res.map((r: APL.LkRsp) => {
      const pCP = `Prfrm a pst-rsp rvw for op "${oNm}". Idntfy & msk sntv dt, lg acc, & vldt dt intg bfr rtn to clt.`;
      const pCC = { ...uCtx, oNm, rspDt: r.data, typ: "pst_cmp_chck" };

      tlmAgt.rcEvt("op_scs", { oNm, uCtx, aDsn: cDsn, rMtdt: r.data ? Object.keys(r.data) : [] });
      return r;
    }).catch((err: any) => {
      tlmAgt.rcEvt("op_fl_via_ath_cmp_lk", { oNm, uCtx, err: err.message });
      throw err;
    });
  });

export const crtGmnMtsLk = (tlmAgt: GmnTlmAgt) =>
  new APL.APLLkCls((op, fwd) => {
    const sT = Date.now();
    const oNm = op.operationName || "UKN_OP";
    const oTyp = op.query.definitions?.[0]?.kind === "OperationDefinition" ? op.query.definitions?.[0]?.operation : "qry";

    tlmAgt.rcEvt("gql_op_srt", {
      oNm,
      oTyp,
      vbls: op.variables,
      qHsh: op.query?.loc?.source?.body,
    });

    const res = fwd ? fwd(op) : ({ data: {}, errors: [] });

    return res.map((r: APL.LkRsp) => {
      const d = Date.now() - sT;
      tlmAgt.rcEvt("gql_op_mtc", {
        oNm,
        oTyp,
        dMs: d,
        sts: "scs",
        dtSz: JSON.stringify(r.data || {}).length,
      });
      return r;
    })._ifNoop(() => {
        const d = Date.now() - sT;
        tlmAgt.rcEvt("gql_op_mtc", {
            oNm,
            oTyp,
            dMs: d,
            sts: "cncl",
        });
    })._finally(() => {
    });
  });

export const UNEXP_HTTP_STATUS_CODE_MSGS: { [key: number]: string } = {
    400: "B rqst. Plc chck inp.",
    401: "Unathrzd. Plc lg in agn.",
    403: "Fbdn. Yu dnt hv prmsn.",
    404: "Rsc nt fnd.",
    408: "Rq tm out. Plc rty.",
    429: "To mny rqs. Plc w8 & rty.",
    500: "Srv err. Plc ctnct spr.",
    502: "B gdwy. Plc rty.",
    503: "Srv unavlbl. Plc rty ltr.",
    504: "Gdwy tm out. Plc rty."
};

function CstPro({ c }: { c: Rct.El }) {
  const { dspErr } = MsgPrv.usDspCt();
  const enbPstGql = usPstQ();

  const cGmnCtx = Rct.usMm<GmnCtx>(() => {
    return {
      uI: "uI_123_ctb_dmo",
      tI: "tI_abc_ctb_dmo",
      cRt: window.location.pathname,
      sL: performance.memory ? performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize : 0.5,
      uRl: "adm_strt_biz",
      devId: "dev-mock-abc-123",
      nwQL: "hgh_bdwth",
    };
  }, []);

  const gmMtsLk = crtGmnMtsLk(gmnTlmAgt);

  const gmAthCmpLk = crtGmnAthCmpLk(
    gmnDsnEng,
    gmnTlmAgt,
    async () => cGmnCtx
  );

  const onErrLk = new APL.APLLkCls(({ networkError: nErr, errors: gQLErrs, operation: op }) => {
    const oNm = op.operationName || "UKN_OP";
    const eCtx = {
      ...cGmnCtx,
      oNm,
      iNErr: !!nErr,
      iGQLErr: !!gQLErrs,
      nErrM: nErr?.message,
      gQLErrsDt: gQLErrs ? JSON.stringify(gQLErrs) : null,
      eCd: (gQLErrs as GQL.GqlErr[])?.some(
        (e) => e.extensions?.code === ExtErrCd.Exp,
      ) ? ExtErrCd.Exp : "UKN_GQL_ERR",
      sCd: (nErr as any)?.statusCode || (nErr as any)?.response?.status || (nErr as any)?.status,
      m: nErr?.message || gQLErrs?.[0]?.message || "An err occrd.",
    };

    gmnDsnEng.mkDsn<GmnAIRsp>(
      `Anlz err for GQL op "${oNm}" & dtm optml crs of act: dsp msg, act crc brk, init rty, or alrt eng.`,
      eCtx,
      { dsn: "dsp_unxp_err", rmdAct: { typ: "ALRT_ENG", pyLd: { crtl: "MED" } } }
    ).then((aRsp) => {
      gmnTlmAgt.rcEvt("err_hndlg_dsn_md", {
        oNm,
        aRsp,
        oECtx: eCtx,
      });

      switch (aRsp.dsn) {
        case "dsp_exp_err":
          const eEM = (gQLErrs as GQL.GqlErr[])
            .filter(
              (e) => e.extensions?.code === ExtErrCd.Exp,
            )
            .map((e) => e.message)
            .join(", ");
          dspErr(eEM);
          break;
        case "crc_brk":
          Snt.capEvt({
            m: `Gmn-dtctd crit err for ${oNm}. Crc brk init.`,
            lvl: "ftl",
            xtra: { ...eCtx, aRsp },
          });
          const targetCrcBrk = ADMOp.has(oNm) ? admGqlCrcBrk : gqlCrcBrk;
          targetCrcBrk.onFl(new Error(eCtx.nErrM || "Std API crit err"));
          const cmpIdFromOp = op.context.cmpId || eCtx.cId;
          if (cmpIdFromOp && cmpCrcBrks[cmpIdFromOp]) {
              cmpCrcBrks[cmpIdFromOp].onFl(new Error(`${cmpIdFromOp} API critical error`));
          }

          dspErr(UNEXP_ERR_MSG + " (Sys slf-hlng actv. Plc try agn ltr.)");
          break;
        case "lg_inf_ntw_err":
          Snt.capEvt({
            m: nErr?.message || "Ntwk rq inf lvl err (AI clsfd)",
            lvl: "inf",
            xtra: {
              stk: nErr?.stack,
              gql_o_nm: oNm,
              aRsp,
            },
          });
          DtD.adErr(nErr, {
            gqlOp: oNm,
            nErr,
            aDsn: aRsp,
          });
          dspErr(UNEXP_ERR_MSG);
          break;
        case "lck_uI_acc":
            Snt.capEvt({
                m: `Gmn-dtctd scty vlt: Usr ${eCtx.uI} acc lckd.`,
                lvl: "crit",
                xtra: { ...eCtx, aRsp },
            });
            dspErr(`Yr acc hs bn lckd for scty rsn. Plc ctnct adm.`);
            break;
        case "rty_aft_dly":
            dspErr(`Rq fld, rtying... Plc w8.`);
            break;
        case "dsp_unxp_err":
        default:
          if (gQLErrs) {
            Snt.capEvt({
              m: "Unxp GQL err (AI fllbk to dflt hndlr)",
              lvl: "err",
              xtra: {
                e_msgs: eCtx.gQLErrsDt,
                gql_o_nm: oNm,
                aRsp,
              },
            });
          } else if (nErr) {
            Snt.capEvt({
              m: nErr?.message || "Unxp ntwk err (AI fllbk to dflt hndlr)",
              lvl: "inf",
              xtra: {
                stk: nErr?.stack,
                gql_o_nm: oNm,
                aRsp,
              },
            });
            DtD.adErr(nErr, {
              gqlOp: oNm,
              nErr,
              aDsn: aRsp,
            });
          }
          const hStsMsg = eCtx.sCd ? UNEXP_HTTP_STATUS_CODE_MSGS[eCtx.sCd] : UNEXP_ERR_MSG;
          dspErr(hStsMsg);
          break;
      }
    });
    return { data: {}, errors: gQLErrs, networkError: nErr };
  });

  const crtPrtUpLk = (u: string, sN: string, cB: GmnCrcBrk) =>
    new APL.APLLkCls((op, fwd) => {
      const execReq = () => {
        const bLk = AUL.crtUpLd({
          uri: u,
          credentials: "sm-o",
          headers: {
            "X-CSRF-Tkn": gtCsrfTk() || "",
            "X-Cmp-Id": (op.context as GmnCtx)?.tI || "glb",
          },
        });
        return bLk.request(op, fwd)._exec();
      };
      return cB.exe(async () => execReq());
    });

  const httpLk = crtPrtUpLk(`https://api.citibankdemobusiness.dev/gql`, "GQL_API_CITIBANK", gqlCrcBrk);
  const admHttpLk = crtPrtUpLk(`https://api.citibankdemobusiness.dev/adm/gql`, "ADM_GQL_API_CITIBANK", admGqlCrcBrk);

  let lks: APL.APLLk[] = [
    gmMtsLk,
    gmAthCmpLk,
    onErrLk,
    APL.APLSK(
      (op) => isADMopGmn(op, gmnDsnEng, cGmnCtx),
      admHttpLk,
      httpLk,
    ),
  ];

  if (enbPstGql) {
    const pQLk = APSTQ.crtPstQLk(
      APSTQ.genPstQIdFrMan({
        loadManifest: () =>
          Promise.resolve(DashMan),
      }),
    );

    const admPQLk = APSTQ.crtPstQLk(
      APSTQ.genPstQIdFrMan({
        loadManifest: () =>
          Promise.resolve(AdmMan),
      }),
    );

    lks = [
      APL.APLSK(
        (op) => isADMopGmn(op, gmnDsnEng, cGmnCtx),
        admPQLk,
        pQLk,
      ),
      APL.APLSK(
        (op) => isADMopGmn(op, gmnDsnEng, cGmnCtx),
        ADMOpStClt.apLk,
        OpStClt.apLk,
      ),
      ...lks,
    ];
  }

  const clt = new APL.APLCltCls({
    lk: APL.frmLks(lks),
    cch: new APL.InMemCchCls({
      posT: {
        DsnblItf: [
          "PymOrd",
          "IncPymDt",
          "UsrOnb",
          "GmnInfrDsn",
          "GmnAdptRl",
        ],
      },
      typPlcs: {
        PymOrd: {
          flds: {
            rvwrs: {
              merge(e, i: unknown, { rFld, ags }) {
                const p = `Dtm optml mrg strtgy for 'rvwrs' fld of PymOrd. Ctx inclds exstng dt, incmg dt, & ags.`;
                const mC = {
                  ...cGmnCtx,
                  fldNm: "rvwrs",
                  entI: rFld("id"),
                  eDt: e,
                  iDt: i,
                  mAs: ags,
                };
                gmnDsnEng.mkDsn<string>(p, mC, "rpl").then(dsn => {
                    gmnTlmAgt.rcEvt("cch_mrg_str_dsn", { fld: "rvwrs", dsn, mC });
                });
                return i;
              },
            },
          },
        },
        Abilts: {
          merge: true,
        },
        Qry: {
          flds: {
            rscMtdtKs: {
              merge: true,
            },
            cntrprty: {
              read(_, { ags, toRf }) {
                gmnTlmAgt.rcEvt("cch_rd_cntrprty", { i: ags?.id, c: cGmnCtx });
                return toRf({
                  __tN: "Cntrprty",
                  i: ags?.id as string,
                });
              },
            },
            rcnclRl: {
              read(_, { ags, toRf }) {
                gmnTlmAgt.rcEvt("cch_rd_rcnclRl", { i: ags?.id, c: cGmnCtx });
                return toRf({
                  __tN: "RcnclRl",
                  i: ags?.id as string,
                });
              },
            },
            cnxn: {
              read(_, { ags, toRf }) {
                gmnTlmAgt.rcEvt("cch_rd_cnxn", { i: ags?.id, c: cGmnCtx });
                return toRf({
                  __tN: "CnxnTyp",
                  i: ags?.id as string,
                });
              },
            },
            gmnSmtQry: {
                read(_, { ags, toRf }) {
                    gmnTlmAgt.rcEvt("cch_rd_gmnSmtQry", { ags, c: cGmnCtx });
                    const p = `Rslv 'gmnSmtQry' w/ ags ${JSON.stringify(ags)}. Dnmlly fth, synth, or trnsfm dt bsd on cur ctx & qry int.`;
                    gmnDsnEng.mkDsn<any>(p, { ...cGmnCtx, qAs: ags, rT: "GmnSmtDt" }, null)
                        .then(aR => {
                            if (aR) {
                                Csl.log("[GmnCchIntlg] AI-rslvd gmnSmtQry:", aR);
                            }
                        });
                    return toRf({
                        __tN: "GmnSmtDt",
                        i: ags?.id || `dnmc-${Math.random().toString(36).substring(7)}`,
                        v: `AI-gntd dt for qry ID: ${ags?.id || "dflt"}`,
                        gA: new Date().toISOString(),
                    });
                }
            },
            fthPldAccs: {
                read(_, { ags, toRf }) {
                    gmnTlmAgt.rcEvt("cch_rd_fthPldAccs", { ags, c: cGmnCtx });
                    const p = `Fth Pld accs for usr ${cGmnCtx.uI}. Cnsdr cmply & scty.`
                    gmnDsnEng.mkDsn<any>(p, { ...cGmnCtx, ags, cSrv: "Pld" }, []).then(r => {
                        Csl.log(`[PldIntg] Fetched Pld Accs:`, r);
                    });
                    return toRf({ __tN: "PldAccL", i: `pld-lst-${cGmnCtx.uI}` });
                }
            },
            fthMrqtCrd: {
                read(_, { ags, toRf }) {
                    gmnTlmAgt.rcEvt("cch_rd_fthMrqtCrd", { ags, c: cGmnCtx });
                    const p = `Fth Mrqt crd dt for usr ${cGmnCtx.uI}. Env ctxt is ${cGmnCtx.cRt}.`;
                    gmnDsnEng.mkDsn<any>(p, { ...cGmnCtx, ags, cSrv: "Mrqt" }, null).then(r => {
                        Csl.log(`[MrqtIntg] Fetched Mrqt Crd:`, r);
                    });
                    return toRf({ __tN: "MrqtCrd", i: `mrqt-crd-${ags?.id}` });
                }
            },
            prcsTwiMsg: {
                read(_, { ags, toRf }) {
                    gmnTlmAgt.rcEvt("cch_rd_prcsTwiMsg", { ags, c: cGmnCtx });
                    const p = `Prcs Twi msg via PipDrm wfl. MsgId ${ags?.msgId}.`;
                    gmnDsnEng.mkDsn<any>(p, { ...cGmnCtx, ags, cSrv: "Twi", wflSrv: "PipDrm" }, { status: 'pndg' }).then(r => {
                        Csl.log(`[TwiIntg] Prcsd Twi Msg:`, r);
                    });
                    return toRf({ __tN: "TwiMsgProc", i: `twi-msg-${ags?.msgId}` });
                }
            }
          },
        },
        DspCol: {
          kFlds: ["id", "lbl", "typ", "rsc"],
        },
        GmnSmtDt: {
            flds: {
                v: {
                    read(v, { ags }) {
                        const p = `Fmt or nrh 'v' fld of GmnSmtDt w/ ags ${JSON.stringify(ags)}.`;
                        gmnDsnEng.mkDsn<string>(p, { ...cGmnCtx, oV: v, ags }, v)
                            .then(fV => {
                                Csl.log("[GmnCchIntlg] Fmttd GmnSmtDt v by AI:", fV);
                            });
                        return v;
                    }
                }
            }
        },
        PldAccL: { kFlds: ["id"] },
        MrqtCrd: { kFlds: ["id"] },
        TwiMsgProc: { kFlds: ["id"] },
        ShpfyOrd: { kFlds: ["id"] },
        WoCmrPrd: { kFlds: ["id"] },
        SlsFrcLd: { kFlds: ["id"] },
        OrclDbTbl: { kFlds: ["id"] },
        GdDyDom: { kFlds: ["id"] },
        CPnlAcct: { kFlds: ["id"] },
        AdbeDoc: { kFlds: ["id"] },
        GglDriFl: { kFlds: ["id"] },
        OnDrFl: { kFlds: ["id"] },
        AzrRsc: { kFlds: ["id"] },
        GglCldRsc: { kFlds: ["id"] },
        SpbsTbl: { kFlds: ["id"] },
        VrvtUtl: { kFlds: ["id"] },
        GtHbRepo: { kFlds: ["id"] },
        HgFcMdl: { kFlds: ["id"] },
        GmnLLMRsp: { kFlds: ["id"] },
        CtGPTLLMRsp: { kFlds: ["id"] },
        MdrTrsPym: { kFlds: ["id"] },
        CitibankAcc: { kFlds: ["id"] },
        AIAgtDs: { kFlds: ["id"] },
        FedLrnMdl: { kFlds: ["id"] },
        SecThrDt: { kFlds: ["id"] },
        FrdAnlRp: { kFlds: ["id"] },
        DynAPICfg: { kFlds: ["id"] },
        SloOptQry: { kFlds: ["id"] },
        CmplyPol: { kFlds: ["id"] },
      },
    }),
  });

  return Rct.crtEl(APL.APLProCmp, { clt: clt }, c);
}

export default CstPro;
```