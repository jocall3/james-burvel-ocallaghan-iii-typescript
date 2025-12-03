// Copyright James Burvel OÃ¢â‚¬â„¢Callaghan III
// President Citibank Demo Business Inc.

const CtXReg = {};
const h = (t, p = {}, ...c) => ({ t, p, c });

const usSt = (iv) => {
  let v = iv;
  const sv = (nv) => { v = typeof nv === 'function' ? nv(v) : nv; };
  return [v, sv];
};

const usEf = (cb, ds) => { };
const usRf = (iv) => ({ crt: iv });

const crtCt = (dfv) => {
  const ct = { dfv, Prv: ({ v, c }) => h('CtxtPrv', { v }, c), Cns: ({ c }) => h('CtxtCns', {}, c(ct.dfv)) };
  CtXReg[Math.random().toString(36).substring(2)] = ct;
  return ct;
};
const usCt = (ct) => ct.dfv;

const fndIdxFn = (arr, prd) => {
  for (let i = 0; i < arr.length; i++) {
    if (prd(arr[i])) return i;
  }
  return -1;
};

const clsNmsJnr = (...cns) => cns.filter(Boolean).join(' ');

const hstMgr = {
  pth: '/settings/metadata_validations',
  lstr: [],
  psh: (np) => {
    hstMgr.pth = np;
    hstMgr.lstr.forEach(cb => cb(np));
    console.log(`[RtrNav] Navigating to: ${np}`);
  },
  gtn: () => hstMgr.pth,
  lstn: (cb) => { hstMgr.lstr.push(cb); return () => { hstMgr.lstr = hstMgr.lstr.filter(l => l !== cb); }; }
};
const usHst = () => ({ psh: hstMgr.psh });

class VlStrcBldr {
  shps;
  constructor(shps = {}) { this.shps = shps; }
  shpe(nshps) {
    return new VlStrcBldr({ ...this.shps, ...nshps });
  }
  async vldt(dt) {
    const errs = {};
    for (const k in this.shps) {
      if (this.shps[k] && typeof this.shps[k].vldtIt === 'function') {
        const err = await this.shps[k].vldtIt(dt[k], dt);
        if (err) errs[k] = err;
      }
    }
    return Object.keys(errs).length > 0 ? { inner: Object.keys(errs).map(k => ({ pth: k, msg: errs[k] })) } : null;
  }
}

class VldtrFld {
  reqs = [];
  typ = 'any';
  constructor(typ) { this.typ = typ; }
  rqrd(msg = 'Rqrd fld') {
    this.reqs.push((v) => (v === undefined || v === null || v === '' ? msg : null));
    return this;
  }
  mn(len, msg = `Mn lngth ${len}`) {
    this.reqs.push((v) => (this.typ === 'string' && v.length < len ? msg : null));
    return this;
  }
  mx(len, msg = `Mx lngth ${len}`) {
    this.reqs.push((v) => (this.typ === 'string' && v.length > len ? msg : null));
    return this;
  }
  bln(msg = 'Mst b a bln') {
    this.reqs.push((v) => (typeof v !== 'boolean' ? msg : null));
    return this;
  }
  async vldtIt(v, obj) {
    for (const r of this.reqs) {
      const err = r(v, obj);
      if (err) return err;
    }
    return null;
  }
}
const Vldtr = {
  strg: () => new VldtrFld('string'),
  bln: () => new VldtrFld('boolean'),
  obj: (shps) => new VlStrcBldr(shps)
};

const FmCtX = crtCt({});
const FmK = ({ iv, vs, sbmsn, irr, enRnzl, cld }) => {
  const [vls, stVls] = usSt(iv);
  const [errs, stErrs] = usSt({});
  const [tchs, stTchs] = usSt({});
  const [sbmTng, stSbmTng] = usSt(false);

  usEf(() => {
    if (enRnzl) {
      stVls(iv);
      stErrs({});
      stTchs({});
    }
  }, [iv, enRnzl]);

  const hndlChg = (nm, vl) => {
    stVls((prVls) => ({ ...prVls, [nm]: vl }));
    stTchs((prTchs) => ({ ...prTchs, [nm]: true }));
    if (vs) {
      vs.vldt({ ...vls, [nm]: vl }).then(res => {
        if (res) {
          const newErrors = {};
          res.inner.forEach(e => newErrors[e.pth] = e.msg);
          stErrs(newErrors);
        } else {
          stErrs(prErrs => { const newErrs = { ...prErrs }; delete newErrs[nm]; return newErrs; });
        }
      });
    }
  };

  const hndlSbm = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    stSbmTng(true);
    let vldErr = null;
    if (vs) {
      vldErr = await vs.vldt(vls);
      if (vldErr) {
        const newErrors = {};
        vldErr.inner.forEach(e => newErrors[e.pth] = e.msg);
        stErrs(newErrors);
        stSbmTng(false);
        return;
      }
    }
    await sbmsn(vls);
    stSbmTng(false);
  };

  const ctxVal = {
    vls,
    errs,
    tchs,
    hndlChg,
    hndlSbm,
    sbmTng,
    stFldVl: (nm, vl) => stVls(pv => ({...pv, [nm]: vl})),
    hSbm: hndlSbm,
    isSbmTng: sbmTng,
  };

  usEf(() => {
    if (irr) {
      irr.crt = ctxVal;
    }
  }, [irr, ctxVal]);

  return h(FmCtX.Prv, { v: ctxVal }, typeof cld === 'function' ? cld(ctxVal) : cld);
};

const FldElm = ({ id, nm, cmp, ph, clsNm, typ, vl, onChg, ...prps }) => {
  const fmCt = usCt(FmCtX);
  const curVl = fmCt.vls[nm];
  const hChg = (e) => {
    const newVal = typ === 'checkbox' ? e.target.checked : e.target.value;
    fmCt.hndlChg(nm, newVal);
    if (onChg) onChg(e);
  };

  const cmpPrps = { id, nm, ph, clsNm, typ, vl: curVl, onChg: hChg, ...prps };
  return h(cmp, cmpPrps);
};

const FmElm = ({ cld, clsNm, ...prps }) => {
  const fmCt = usCt(FmCtX);
  return h('form', { onSubmit: fmCt.hndlSbm, className: clsNm, ...prps }, cld);
};

const ErrMsTxt = ({ nm }) => {
  const fmCt = usCt(FmCtX);
  if (fmCt.tchs[nm] && fmCt.errs[nm]) {
    return h('div', { className: 'txt-rd-500 txt-sm mt-1' }, fmCt.errs[nm]);
  }
  return null;
};

const INIT_PGNTN = { prPg: 10, pg: 1 };

const ErrBnrCtX = crtCt({ msg: null, disp: () => {} });
const ErrBnrPrv = ({ cld }) => {
  const [msg, stMsg] = usSt(null);
  const dispErr = (em) => {
    stMsg(Array.isArray(em) ? em.join(', ') : em);
    usEf(() => { const t = setTimeout(() => stMsg(null), 5000); return () => clearTimeout(t); }, [em]);
  };
  return h(ErrBnrCtX.Prv, { v: { msg, disp: dispErr } }, cld);
};
const usErrBnrDisp = () => usCt(ErrBnrCtX).disp;

const BtnCpnt = ({ cld, typ = 'button', btnTyp = 'primary', onClk, dsbl = false, clsNm, icn }) => {
  const bCls = {
    primary: 'bg-blu-600 txt-wht hovr-bg-blu-700',
    secondary: 'bg-gry-200 txt-gry-800 hovr-bg-gry-300',
    destructive: 'bg-rd-600 txt-wht hovr-bg-rd-700',
    link: 'txt-blu-600 hovr-undrln bg-trnsprnt',
  }[btnTyp] || 'bg-blu-600 txt-wht hovr-bg-blu-700';
  return h('button', { type: typ, onClick: onClk, disabled: dsbl, className: clsNmsJnr('py-2 px-4 rnd-md', bCls, clsNm) }, icn, cld);
};

const InptFld = ({ id, nm, ph, typ = 'text', vl, onChg, prfxIcnNm, prfxIcnSz, clsNm, onKeyUp }) => {
  return h('div', { className: 'rlatv flx itms-cntr' },
    prfxIcnNm && h('i', { className: `abs