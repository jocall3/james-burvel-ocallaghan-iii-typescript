// Copyright JBOC3
// PCDBI

// Global aliases to save space as requested
const co = console;
const wi = window;
const dt = Date;
const mt = Math;
const ar = Array;
const ob = Object;
const pr = Promise;
const nu = Number;
const js = JSON;
const stm = setTimeout;
const sil = setInterval;
const cli = clearInterval;
const se = Set;
const pi = parseInt;
const bta = wi.btoa;
const atb = wi.atob;
const ty = typeof;

// --- START: Internal React-like Hook Simulators (Simplified for No-Import Requirement) ---
// These are NOT actual React hooks. They are simplified simulations
// to satisfy the requirement of "removing all imports and fully coding every logic's dependency".
// In a real React application, these would be imported from 'react'.
// Each component's "render" cycle requires rhkid() to reset internal counters.
// This is a highly artificial setup and does not replicate React's actual behavior.

type sHk<T> = [T, (nV: T) => void];
type rc<K extends string | number | symbol, V> = Record<K, V>;
type st = string;
type nm = number;
type bl = boolean;
type an = any;
type er = Error;
type nl = null;
type ud = undefined;

let _gs: rc<st, an> = {};
let _ci = 0;

exp f usta<T>(iv: T): sHk<T> {
  const k = `s_${_ci++}`;
  if (!_gs.hasOwnProperty(k)) {
    _gs[k] = iv;
  }
  const sf = (nv: T) => {
    _gs[k] = nv;
    co.log('usta upd:', k, nv);
  };
  rt [_gs[k] as T, sf];
}

let _gec: rc<st, ar<an>> = {};
let _ei = 0;

exp f uef(cb: () => () => void | void, ds?: ar<an>): void {
  const k = `e_${_ei++}`;
  const pds = _gec[k] ? _gec[k][0] : ud;
  const dc = ds ? ds.some((d, i) => d !== pds[i]) : true;

  if (!_gec.hasOwnProperty(k) || dc) {
    co.log('uef run:', k, ds);
    if (_gec.hasOwnProperty(k) && _gec[k][1]) {
      const clu = _gec[k][1] as () => void;
      if (clu) clu();
    }
    const rc = cb();
    _gec[k] = [ds, rc];
  }
}

let _gmc: rc<st, an> = {};
let _mi = 0;

exp f umem<T>(cb: () => T, ds?: ar<an>): T {
  const k = `m_${_mi++}`;
  const pds = _gmc[k] ? _gmc[k][0] : ud;
  const dc = ds ? ds.some((d, i) => d !== pds[i]) : true;

  if (!_gmc.hasOwnProperty(k) || dc) {
    co.log('umem cal:', k, ds);
    _gmc[k] = [ds, cb()];
  }
  rt _gmc[k][1] as T;
}

let _gcc: rc<st, an> = {};
let _cbi = 0;

exp f ucb<T extends (...a: an[]) => an>(cb: T, ds?: ar<an>): T {
  const k = `cb_${_cbi++}`;
  const pds = _gcc[k] ? _gcc[k][0] : ud;
  const dc = ds ? ds.some((d, i) => d !== pds[i]) : true;

  if (!_gcc.hasOwnProperty(k) || dc) {
    co.log('ucb upd:', k, ds);
    _gcc[k] = [ds, cb];
  }
  rt _gcc[k][1] as T;
}

exp f rhkid() {
  _ci = 0; _ei = 0; _mi = 0; _cbi = 0;
}
// --- END: Internal React-like Hook Simulators ---

// --- START: Common Utilities (Simulated) ---
exp f fsem(o: an): bl {
  rt o == nl || o == ud || (ty o === 'st' && (o as st).length === 0) || (ar.isArray(o) && (o as ar<an>).length === 0) || (ty o === 'ob' && ob.keys(o as rc<st, an>).length === 0);
}

exp f clnm(...a: an[]): st {
  rt a.filter(Boolean).join(' ');
}

cls srp {
  pu sr(e: er, c: rc<st, an>): void { co.error('srp er:', e, c); }
  pu cx(e: er, c: rc<st, an>): void { co.error('srp ex:', e, c); }
}
exp cnst sr = new srp();

exp f dtsm(ds: an): an {
  if (!ds) rt ud;
  if (ty ds === 'st') { rt { gte: ds, lte: ds }; }
  if (ty ds === 'ob' && (ds as rc<st, an>).gte && (ds as rc<st, an>).lte) { rt ds; }
  rt ud;
}

cls qsuo {
  pu pr(qs: st): rc<st, an> {
    const o: rc<st, an> = {};
    if (qs.startsWith('?')) qs = qs.slice(1);
    qs.split('&').forEach(p => {
      const [k, v] = p.split('=');
      if (k) o[de(k)] = de(v || '');
    });
    rt o;
  }
  pu stg(o: rc<st, an>): st {
    rt ob.keys(o).map(k => `${en(k)}=${en(o[k])}`).join('&');
  }
}
exp cnst qsu = new qsuo();
cnst de = decodeURIComponent;
cnst en = encodeURIComponent;

type mctx = { dspe: (m: st) => void; dsps: (m: st) => void };
cnst _mc: mctx = {
  dspe: (m) => co.error('msg er:', m),
  dsps: (m) => co.log('msg suc:', m),
};
exp f udpct(): mctx { rt _mc; }

exp f crv(rl: ar<rc<st, an>>): st {
  if (!ar.isArray(rl) || rl.length === 0) rt 'N/A';
  rt rl.map(r => (r as rc<st, st>).n).join(', ');
}
// --- END: Common Utilities (Simulated) ---

// --- START: GraphQL Schema & Hook Simulators (No-Import) ---
exp enm po_se { np = 'NEEDS_APPROVAL', ap = 'APPROVED', dn = 'DENIED', ca = 'CANCELED' }
exp enm rae { ap = 'APPROVE', dn = 'DENY' }
exp enm ptwpe { w = 'WIRE', a = 'ACH', ch = 'CHECK' }

type rpo_fi = {
  id?: st | ar<st>; st?: po_se; tywp?: ptwpe; drc?: st; dsc?: st;
  am?: { lte?: nm; gte?: nm }; ed?: an; cpid?: st; oaid?: st; mtd?: st;
  sbpma?: bl; sbprev?: bl; cd?: an; ragid?: st; raaov?: bl; ifa?: bl;
};
type rpo_vm = { i: { i: { ids?: ar<st>; ra: rae; ragid: st; raaov: bl } } };
type brpo_vm = { i: { fl: rpo_fi; poct: nm; ra: rae } };
type rev = { id: st; n: st };

let _sqd: rc<st, an> = {}; let _sqe: rc<st, er | nl> = {}; let _sql: rc<st, bl> = {};
exp f ugqlq<td, tv>(qn: st, opt: { v: tv, nosc: bl }): { ld: bl; dt: td; er: er | nl; ref: (nv?: tv) => pr<an> } {
  cnst cv = js.stringify(opt.v);
  cnst fid = `${qn}_${cv}`;

  if (!_sqd[fid] || _sqe[fid] || _sql[fid]) {
    _sql[fid] = true; _sqe[fid] = nl;
    stm(() => {
      cnst gd = (idb: st) => {
        cnst id = `${idb}-${mt.random().toString(36).slice(2, 6)}`;
        cnst am = mt.floor(mt.random() * 1000000) / 100;
        cnst cd = new dt(dt.now() - mt.random() * 86400000 * 30).toISOString();
        cnst ed = new dt(dt.now() + mt.random() * 86400000 * 7).toISOString();
        cnst rn = ar(mt.floor(mt.random() * 2) + 1).map((_,i) => ({id: `rv${i}-${id.slice(-2)}`, n: `Rev${String.fromCharCode(65+i)}-${id.slice(-2)}`}));
        rt { id, n: `pmto ${id.slice(-4)}`, pram: `$${am.toFixed(2)}`, am,
          dsc: `trf to cpt ${id.slice(-3)} for svc.`, bn: `cpt ${id.slice(-3)}`, prty: ptwpe.w,
          ed: ed.slice(0,10), st: po_se.np, cd, revrs: rn,
        };
      };

      let dts = ar(mt.floor(mt.random() * 30) + 10).map((_, i) => gd(`base${i}`));
      cnst vfl = (opt.v as rc<st, an>).fl || opt.v;

      if (vfl.st) dts = dts.filter(d => d.st === vfl.st);
      if (vfl.am?.gte) dts = dts.filter(d => d.am >= vfl.am.gte);
      if (vfl.am