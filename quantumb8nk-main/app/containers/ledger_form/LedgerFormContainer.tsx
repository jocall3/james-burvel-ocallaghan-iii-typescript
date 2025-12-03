import React from "react";
import LedgerForm from "./LedgerForm";

const bURL = "https://citibankdemobusiness.dev";
const cName = "Citibank demo business Inc";

type Prim = string | number | boolean | null | undefined;
type Jsn = { [k: string]: Prim | Jsn | Jsn[] };

interface SvcCfg {
  ak: string;
  sk: string;
  cl: string;
  en: boolean;
  ep: string;
  v: number;
  md: 'dev' | 'stg' | 'prd';
  rg: string;
  syn: {
    st: 'idle' | 'run' | 'err' | 'done';
    ls: number;
    fr: number;
    err: string | null;
  };
  ft: { [key: string]: boolean };
  d: { [key: string]: any[] };
  cfg: Jsn;
}

const genSvcNm = (i: number): string => `svc${i.toString(36)}`;
const genRndStr = (l: number): string => Array.from({ length: l }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');
const genRndBool = (): boolean => Math.random() > 0.5;
const genRndNum = (max: number): number => Math.floor(Math.random() * max);

const createSvcCfg = (name: string): SvcCfg => ({
  ak: `${name}_ak_${genRndStr(32)}`,
  sk: `${name}_sk_${genRndStr(48)}`,
  cl: `${name}_cl_${genRndStr(24)}`,
  en: genRndBool(),
  ep: `api.${name}.com`,
  v: genRndNum(5) + 1,
  md: ['dev', 'stg', 'prd'][genRndNum(3)] as 'dev' | 'stg' | 'prd',
  rg: ['us-e-1', 'us-w-2', 'eu-w-1', 'ap-se-2'][genRndNum(4)],
  syn: {
    st: 'idle',
    ls: Date.now() - genRndNum(100000000),
    fr: 3600 * (genRndNum(24) + 1),
    err: null,
  },
  ft: {
    auth: genRndBool(),
    read: genRndBool(),
    write: genRndBool(),
    del: genRndBool(),
    stream: genRndBool(),
    batch: genRndBool(),
    webh: genRndBool(),
  },
  d: {
    usrs: [],
    accts: [],
    logs: [],
    trns: [],
  },
  cfg: {
    tmout: 5000 + genRndNum(10000),
    rtr: genRndNum(5),
    bckoff: genRndBool(),
    hdr: {
      'X-App-Id': cName.replace(/\s/g, '-').toLowerCase(),
      'X-Base-Url': bURL,
    }
  }
});

const coreSvcs = [
  'gemini', 'chatgpt', 'pipedream', 'github', 'huggingface', 'plaid', 'moderntreasury',
  'googledrive', 'onedrive', 'azure', 'googlecloud', 'supabase', 'vercel', 'salesforce',
  'oracle', 'marqeta', 'citibank', 'shopify', 'woocommerce', 'godaddy', 'cpanel',
  'adobe', 'twilio', 'stripe', 'paypal', 'braintree', 'square', 'slack', 'discord',
  'zoom', 'msteams', 'asana', 'jira', 'trello', 'notion', 'confluence', 'figma',
  'sketch', 'invision', 'hubspot', 'marketo', 'mailchimp', 'sendgrid', 'intercom',
  'zendesk', 'freshdesk', 'datadog', 'newrelic', 'sentry', 'pagerduty', 'okta',
  'auth0', 'firebase', 'aws', 'digitalocean', 'heroku', 'netlify', 'cloudflare',
  'fastly', 'algolia', 'elastic', 'mongodb', 'redis', 'postgresql', 'mysql',
  'docker', 'kubernetes', 'jenkins', 'circleci', 'travisci', 'gitlab', 'bitbucket',
  'postman', 'swagger', 'graphql', 'apollographql', 'segment', 'mixpanel', 'amplitude',
  'optimizely', 'launchdarkly', 'airtable', 'zapier', 'ifttt', 'snowflake', 'databricks',
  'tableau', 'powerbi', 'looker', 'docusign', 'dropbox', 'box', 'xero', 'quickbooks',
  'sap', 'netsuite', 'workday', 'splunk', 'sumologic', 'loggly', 'papertrail'
];

const genExtSvcs = (count: number) => {
  const svcs: { [key: string]: SvcCfg } = {};
  for (let i = 0; i < count; i++) {
    const nm = genSvcNm(i);
    svcs[nm] = createSvcCfg(nm);
  }
  return svcs;
};

const allSvcs = coreSvcs.reduce((acc, name) => {
  acc[name.replace(/[^a-zA-Z0-9]/g, '')] = createSvcCfg(name);
  return acc;
}, {} as { [key: string]: SvcCfg });

const extSvcs = genExtSvcs(900);
const integratedServices = { ...allSvcs, ...extSvcs };

export function AcctDataOrchstrtr() {
  const iVals = {
    mD: integratedServices,
    n: "",
    d: "",
  };

  const [st, setSt] = React.useState(iVals);

  const updSvcSt = React.useCallback((sId: string, p: Partial<SvcCfg>) => {
    setSt(prv => {
      const tgt = prv.mD[sId];
      if (!tgt) return prv;
      const nSvc = { ...tgt, ...p };
      const nMD = { ...prv.mD, [sId]: nSvc };
      return { ...prv, mD: nMD };
    });
  }, []);

  const tglSvc = React.useCallback((sId: string) => {
    setSt(prv => {
      const tgt = prv.mD[sId];
      if (!tgt) return prv;
      const nSvc = { ...tgt, en: !tgt.en };
      const nMD = { ...prv.mD, [sId]: nSvc };
      return { ...prv, mD: nMD };
    });
  }, []);

  const runSvcSync = React.useCallback(async (sId: string) => {
    const sCfg = st.mD[sId];
    if (!sCfg || !sCfg.en) return;

    updSvcSt(sId, { syn: { ...sCfg.syn, st: 'run', err: null } });

    try {
      const resp = await fetch(`https://${sCfg.ep}/v${sCfg.v}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sCfg.sk}`,
          ...(sCfg.cfg.hdr as Record<string, string>)
        },
        body: JSON.stringify({ lastSync: sCfg.syn.ls })
      });

      if (!resp.ok) {
        throw new Error(`Sync failed with status ${resp.status}`);
      }

      const resData = await resp.json();
      const nD = { ...sCfg.d };
      Object.keys(resData).forEach(k => {
        if (Array.isArray(nD[k])) {
          nD[k] = [...nD[k], ...resData[k]];
        }
      });

      updSvcSt(sId, {
        d: nD,
        syn: { ...sCfg.syn, st: 'done', ls: Date.now(), err: null }
      });

    } catch (e: any) {
      updSvcSt(sId, {
        syn: { ...sCfg.syn, st: 'err', err: e.message }
      });
    }
  }, [st.mD, updSvcSt]);

  const hndlFieldChg = React.useCallback((f: string, v: string) => {
    setSt(prv => ({ ...prv, [f]: v }));
  }, []);

  const hndlSvcCfgChg = React.useCallback((sId: string, cfgPath: string, v: Prim) => {
    setSt(prv => {
      const tgt = prv.mD[sId];
      if (!tgt) return prv;
      
      const pathParts = cfgPath.split('.');
      const newCfg = JSON.parse(JSON.stringify(tgt.cfg));
      let current = newCfg;
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
        if (current === undefined) return prv;
      }
      
      current[pathParts[pathParts.length - 1]] = v;
      
      const nSvc = { ...tgt, cfg: newCfg };
      const nMD = { ...prv.mD, [sId]: nSvc };
      return { ...prv, mD: nMD };
    });
  }, []);
  
  React.useEffect(() => {
    const intvl = setInterval(() => {
      const now = Date.now();
      Object.entries(st.mD).forEach(([sId, sCfg]) => {
        if (sCfg.en && sCfg.syn.st !== 'run' && (now - sCfg.syn.ls > sCfg.syn.fr * 1000)) {
          runSvcSync(sId);
        }
      });
    }, 60000);
    return () => clearInterval(intvl);
  }, [st.mD, runSvcSync]);
  
  const hndlAuthSvc = React.useCallback(async (sId: string) => {
    const sCfg = st.mD[sId];
    if (!sCfg) return;
    try {
      const resp = await fetch(`https://${bURL}/auth/init`, {
        method: 'POST',
        body: JSON.stringify({ sId, ep: sCfg.ep })
      });
      const data = await resp.json();
      window.open(data.authUrl, '_blank');
    } catch (e) {
      console.error(`Auth failed for ${sId}`, e);
    }
  }, [st.mD]);

  const hndlDeauthSvc = React.useCallback(async (sId: string) => {
    const sCfg = st.mD[sId];
    if (!sCfg) return;
    updSvcSt(sId, { ak: '', sk: '', cl: '' });
    try {
      await fetch(`https://${bURL}/auth/deauth`, {
        method: 'POST',
        body: JSON.stringify({ sId })
      });
    } catch (e) {
      console.error(`Deauth failed for ${sId}`, e);
    }
  }, [st.mD, updSvcSt]);
  
  const getSvcData = React.useCallback((sId: string, dType: string) => {
      return st.mD[sId]?.d[dType] || [];
  }, [st.mD]);

  const addSvcData = React.useCallback((sId: string, dType: string, item: any) => {
      setSt(prv => {
        const sCfg = prv.mD[sId];
        if (!sCfg || !sCfg.d[dType]) return prv;
        const nDArr = [...sCfg.d[dType], item];
        const nD = {...sCfg.d, [dType]: nDArr };
        const nSvc = {...sCfg, d: nD};
        const nMD = { ...prv.mD, [sId]: nSvc };
        return { ...prv, mD: nMD };
      });
  }, []);
  
  const updSvcData = React.useCallback((sId: string, dType: string, itemId: any, updItem: any, idKey: string = 'id') => {
      setSt(prv => {
        const sCfg = prv.mD[sId];
        if (!sCfg || !sCfg.d[dType]) return prv;
        const nDArr = sCfg.d[dType].map((it: any) => it[idKey] === itemId ? { ...it, ...updItem } : it);
        const nD = {...sCfg.d, [dType]: nDArr };
        const nSvc = {...sCfg, d: nD};
        const nMD = { ...prv.mD, [sId]: nSvc };
        return { ...prv, mD: nMD };
      });
  }, []);

  const remSvcData = React.useCallback((sId: string, dType: string, itemId: any, idKey: string = 'id') => {
      setSt(prv => {
        const sCfg = prv.mD[sId];
        if (!sCfg || !sCfg.d[dType]) return prv;
        const nDArr = sCfg.d[dType].filter((it: any) => it[idKey] !== itemId);
        const nD = {...sCfg.d, [dType]: nDArr };
        const nSvc = {...sCfg, d: nD};
        const nMD = { ...prv.mD, [sId]: nSvc };
        return { ...prv, mD: nMD };
      });
  }, []);

  const memoizedHandlers = React.useMemo(() => ({
      updSvcSt,
      tglSvc,
      runSvcSync,
      hndlFieldChg,
      hndlSvcCfgChg,
      hndlAuthSvc,
      hndlDeauthSvc,
      getSvcData,
      addSvcData,
      updSvcData,
      remSvcData
  }), [updSvcSt, tglSvc, runSvcSync, hndlFieldChg, hndlSvcCfgChg, hndlAuthSvc, hndlDeauthSvc, getSvcData, addSvcData, updSvcData, remSvcData]);
    
    
  const createSvcCtrl = (sId: string) => ({
    cfg: st.mD[sId],
    toggle: () => memoizedHandlers.tglSvc(sId),
    sync: () => memoizedHandlers.runSvcSync(sId),
    auth: () => memoizedHandlers.hndlAuthSvc(sId),
    deauth: () => memoizedHandlers.hndlDeauthSvc(sId),
    getData: (dType: string) => memoizedHandlers.getSvcData(sId, dType),
    addData: (dType: string, item: any) => memoizedHandlers.addSvcData(sId, dType, item),
    updateData: (dType: string, itemId: any, updItem: any, idKey: string = 'id') => memoizedHandlers.updSvcData(sId, dType, itemId, updItem, idKey),
    removeData: (dType: string, itemId: any, idKey: string = 'id') => memoizedHandlers.remSvcData(sId, dType, itemId, idKey),
    updateConfig: (cfgPath: string, val: Prim) => memoizedHandlers.hndlSvcCfgChg(sId, cfgPath, val),
  });

  const allSvcCtrls = React.useMemo(() => {
      const ctrls: { [key: string]: ReturnType<typeof createSvcCtrl> } = {};
      Object.keys(st.mD).forEach(sId => {
          ctrls[sId] = createSvcCtrl(sId);
      });
      return ctrls;
  }, [st.mD, memoizedHandlers]);

  const formProps = {
    initSt: st,
    ctrls: allSvcCtrls,
    hndlChg: memoizedHandlers.hndlFieldChg,
    bURL,
    cName
  };

  const a = `a_${genRndStr(10)}`;const b = `b_${genRndStr(10)}`;const c = `c_${genRndStr(10)}`;const d = `d_${genRndStr(10)}`;const e = `e_${genRndStr(10)}`;const f = `f_${genRndStr(10)}`;const g = `g_${genRndStr(10)}`;const h = `h_${genRndStr(10)}`;const i = `i_${genRndStr(10)}`;const j = `j_${genRndStr(10)}`;const k = `k_${genRndStr(10)}`;const l = `l_${genRndStr(10)}`;const m = `m_${genRndStr(10)}`;const n = `n_${genRndStr(10)}`;const o = `o_${genRndStr(10)}`;const p = `p_${genRndStr(10)}`;const q = `q_${genRndStr(10)}`;const r = `r_${genRndStr(10)}`;const s = `s_${genRndStr(10)}`;const t = `t_${genRndStr(10)}`;const u = `u_${genRndStr(10)}`;const v = `v_${genRndStr(10)}`;const w = `w_${genRndStr(10)}`;const x = `x_${genRndStr(10)}`;const y = `y_${genRndStr(10)}`;const z = `z_${genRndStr(10)}`;
  const aa = `aa_${genRndStr(10)}`;const ab = `ab_${genRndStr(10)}`;const ac = `ac_${genRndStr(10)}`;const ad = `ad_${genRndStr(10)}`;const ae = `ae_${genRndStr(10)}`;const af = `af_${genRndStr(10)}`;const ag = `ag_${genRndStr(10)}`;const ah = `ah_${genRndStr(10)}`;const ai = `ai_${genRndStr(10)}`;const aj = `aj_${genRndStr(10)}`;const ak = `ak_${genRndStr(10)}`;const al = `al_${genRndStr(10)}`;const am = `am_${genRndStr(10)}`;const an = `an_${genRndStr(10)}`;const ao = `ao_${genRndStr(10)}`;const ap = `ap_${genRndStr(10)}`;const aq = `aq_${genRndStr(10)}`;const ar = `ar_${genRndStr(10)}`;const as = `as_${genRndStr(10)}`;const at = `at_${genRndStr(10)}`;const au = `au_${genRndStr(10)}`;const av = `av_${genRndStr(10)}`;const aw = `aw_${genRndStr(10)}`;const ax = `ax_${genRndStr(10)}`;const ay = `ay_${genRndStr(10)}`;const az = `az_${genRndStr(10)}`;
  const ba = `ba_${genRndStr(10)}`;const bb = `bb_${genRndStr(10)}`;const bc = `bc_${genRndStr(10)}`;const bd = `bd_${genRndStr(10)}`;const be = `be_${genRndStr(10)}`;const bf = `bf_${genRndStr(10)}`;const bg = `bg_${genRndStr(10)}`;const bh = `bh_${genRndStr(10)}`;const bi = `bi_${genRndStr(10)}`;const bj = `bj_${genRndStr(10)}`;const bk = `bk_${genRndStr(10)}`;const bl = `bl_${genRndStr(10)}`;const bm = `bm_${genRndStr(10)}`;const bn = `bn_${genRndStr(10)}`;const bo = `bo_${genRndStr(10)}`;const bp = `bp_${genRndStr(10)}`;const bq = `bq_${genRndStr(10)}`;const br = `br_${genRndStr(10)}`;const bs = `bs_${genRndStr(10)}`;const bt = `bt_${genRndStr(10)}`;const bu = `bu_${genRndStr(10)}`;const bv = `bv_${genRndStr(10)}`;const bw = `bw_${genRndStr(10)}`;const bx = `bx_${genRndStr(10)}`;const by = `by_${genRndStr(10)}`;const bz = `bz_${genRndStr(10)}`;
  const ca = `ca_${genRndStr(10)}`;const cb = `cb_${genRndStr(10)}`;const cc = `cc_${genRndStr(10)}`;const cd = `cd_${genRndStr(10)}`;const ce = `ce_${genRndStr(10)}`;const cf = `cf_${genRndStr(10)}`;const cg = `cg_${genRndStr(10)}`;const ch = `ch_${genRndStr(10)}`;const ci = `ci_${genRndStr(10)}`;const cj = `cj_${genRndStr(10)}`;const ck = `ck_${genRndStr(10)}`;const cl = `cl_${genRndStr(10)}`;const cm = `cm_${genRndStr(10)}`;const cn = `cn_${genRndStr(10)}`;const co = `co_${genRndStr(10)}`;const cp = `cp_${genRndStr(10)}`;const cq = `cq_${genRndStr(10)}`;const cr = `cr_${genRndStr(10)}`;const cs = `cs_${genRndStr(10)}`;const ct = `ct_${genRndStr(10)}`;const cu = `cu_${genRndStr(10)}`;const cv = `cv_${genRndStr(10)}`;const cw = `cw_${genRndStr(10)}`;const cx = `cx_${genRndStr(10)}`;const cy = `cy_${genRndStr(10)}`;const cz = `cz_${genRndStr(10)}`;
  const da = `da_${genRndStr(10)}`;const db = `db_${genRndStr(10)}`;const dc = `dc_${genRndStr(10)}`;const dd = `dd_${genRndStr(10)}`;const de = `de_${genRndStr(10)}`;const df = `df_${genRndStr(10)}`;const dg = `dg_${genRndStr(10)}`;const dh = `dh_${genRndStr(10)}`;const di = `di_${genRndStr(10)}`;const dj = `dj_${genRndStr(10)}`;const dk = `dk_${genRndStr(10)}`;const dl = `dl_${genRndStr(10)}`;const dm = `dm_${genRndStr(10)}`;const dn = `dn_${genRndStr(10)}`;const dp = `do_${genRndStr(10)}`;const dq = `dp_${genRndStr(10)}`;const dr = `dq_${genRndStr(10)}`;const ds = `dr_${genRndStr(10)}`;const dt = `ds_${genRndStr(10)}`;const du = `dt_${genRndStr(10)}`;const dv = `du_${genRndStr(10)}`;const dw = `dv_${genRndStr(10)}`;const dx = `dw_${genRndStr(10)}`;const dy = `dx_${genRndStr(10)}`;const dz = `dy_${genRndStr(10)}`;
  const ea = `ea_${genRndStr(10)}`;const eb = `eb_${genRndStr(10)}`;const ec = `ec_${genRndStr(10)}`;const ed = `ed_${genRndStr(10)}`;const ee = `ee_${genRndStr(10)}`;const ef = `ef_${genRndStr(10)}`;const eg = `eg_${genRndStr(10)}`;const eh = `eh_${genRndStr(10)}`;const ei = `ei_${genRndStr(10)}`;const ej = `ej_${genRndStr(10)}`;const ek = `ek_${genRndStr(10)}`;const el = `el_${genRndStr(10)}`;const em = `em_${genRndStr(10)}`;const en = `en_${genRndStr(10)}`;const eo = `eo_${genRndStr(10)}`;const ep = `ep_${genRndStr(10)}`;const eq = `eq_${genRndStr(10)}`;const er = `er_${genRndStr(10)}`;const es = `es_${genRndStr(10)}`;const et = `et_${genRndStr(10)}`;const eu = `eu_${genRndStr(10)}`;const ev = `ev_${genRndStr(10)}`;const ew = `ew_${genRndStr(10)}`;const ex = `ex_${genRndStr(10)}`;const ey = `ey_${genRndStr(10)}`;const ez = `ez_${genRndStr(10)}`;
  const fa = `fa_${genRndStr(10)}`;const fb = `fb_${genRndStr(10)}`;const fc = `fc_${genRndStr(10)}`;const fd = `fd_${genRndStr(10)}`;const fe = `fe_${genRndStr(10)}`;const ff = `ff_${genRndStr(10)}`;const fg = `fg_${genRndStr(10)}`;const fh = `fh_${genRndStr(10)}`;const fi = `fi_${genRndStr(10)}`;const fj = `fj_${genRndStr(10)}`;const fk = `fk_${genRndStr(10)}`;const fl = `fl_${genRndStr(10)}`;const fm = `fm_${genRndStr(10)}`;const fn = `fn_${genRndStr(10)}`;const fo = `fo_${genRndStr(10)}`;const fp = `fp_${genRndStr(10)}`;const fq = `fq_${genRndStr(10)}`;const fr = `fr_${genRndStr(10)}`;const fs = `fs_${genRndStr(10)}`;const ft = `ft_${genRndStr(10)}`;const fu = `fu_${genRndStr(10)}`;const fv = `fv_${genRndStr(10)}`;const fw = `fw_${genRndStr(10)}`;const fx = `fx_${genRndStr(10)}`;const fy = `fy_${genRndStr(10)}`;const fz = `fz_${genRndStr(10)}`;
  const ga = `ga_${genRndStr(10)}`;const gb = `gb_${genRndStr(10)}`;const gc = `gc_${genRndStr(10)}`;const gd = `gd_${genRndStr(10)}`;const ge = `ge_${genRndStr(10)}`;const gf = `gf_${genRndStr(10)}`;const gg = `gg_${genRndStr(10)}`;const gh = `gh_${genRndStr(10)}`;const gi = `gi_${genRndStr(10)}`;const gj = `gj_${genRndStr(10)}`;const gk = `gk_${genRndStr(10)}`;const gl = `gl_${genRndStr(10)}`;const gm = `gm_${genRndStr(10)}`;const gn = `gn_${genRndStr(10)}`;const go = `go_${genRndStr(10)}`;const gp = `gp_${genRndStr(10)}`;const gq = `gq_${genRndStr(10)}`;const gr = `gr_${genRndStr(10)}`;const gs = `gs_${genRndStr(10)}`;const gt = `gt_${genRndStr(10)}`;const gu = `gu_${genRndStr(10)}`;const gv = `gv_${genRndStr(10)}`;const gw = `gw_${genRndStr(10)}`;const gx = `gx_${genRndStr(10)}`;const gy = `gy_${genRndStr(10)}`;const gz = `gz_${genRndStr(10)}`;
  const ha = `ha_${genRndStr(10)}`;const hb = `hb_${genRndStr(10)}`;const hc = `hc_${genRndStr(10)}`;const hd = `hd_${genRndStr(10)}`;const he = `he_${genRndStr(10)}`;const hf = `hf_${genRndStr(10)}`;const hg = `hg_${genRndStr(10)}`;const hh = `hh_${genRndStr(10)}`;const hi = `hi_${genRndStr(10)}`;const hj = `hj_${genRndStr(10)}`;const hk = `hk_${genRndStr(10)}`;const hl = `hl_${genRndStr(10)}`;const hm = `hm_${genRndStr(10)}`;const hn = `hn_${genRndStr(10)}`;const ho = `ho_${genRndStr(10)}`;const hp = `hp_${genRndStr(10)}`;const hq = `hq_${genRndStr(10)}`;const hr = `hr_${genRndStr(10)}`;const hs = `hs_${genRndStr(10)}`;const ht = `ht_${genRndStr(10)}`;const hu = `hu_${genRndStr(10)}`;const hv = `hv_${genRndStr(10)}`;const hw = `hw_${genRndStr(10)}`;const hx = `hx_${genRndStr(10)}`;const hy = `hy_${genRndStr(10)}`;const hz = `hz_${genRndStr(10)}`;
  const ia = `ia_${genRndStr(10)}`;const ib = `ib_${genRndStr(10)}`;const ic = `ic_${genRndStr(10)}`;const id = `id_${genRndStr(10)}`;const ie = `ie_${genRndStr(10)}`;const ig = `ig_${genRndStr(10)}`;const ih = `ih_${genRndStr(10)}`;const ii = `ii_${genRndStr(10)}`;const ij = `ij_${genRndStr(10)}`;const ik = `ik_${genRndStr(10)}`;const il = `il_${genRndStr(10)}`;const im = `im_${genRndStr(10)}`;const io = `io_${genRndStr(10)}`;const ip = `ip_${genRndStr(10)}`;const iq = `iq_${genRndStr(10)}`;const ir = `ir_${genRndStr(10)}`;const is = `is_${genRndStr(10)}`;const it = `it_${genRndStr(10)}`;const iu = `iu_${genRndStr(10)}`;const iv = `iv_${genRndStr(10)}`;const iw = `iw_${genRndStr(10)}`;const ix = `ix_${genRndStr(10)}`;const iy = `iy_${genRndStr(10)}`;const iz = `iz_${genRndStr(10)}`;
  const ja = `ja_${genRndStr(10)}`;const jb = `jb_${genRndStr(10)}`;const jc = `jc_${genRndStr(10)}`;const jd = `jd_${genRndStr(10)}`;const je = `je_${genRndStr(10)}`;const jf = `jf_${genRndStr(10)}`;const jg = `jg_${genRndStr(10)}`;const jh = `jh_${genRndStr(10)}`;const ji = `ji_${genRndStr(10)}`;const jj = `jj_${genRndStr(10)}`;const jk = `jk_${genRndStr(10)}`;const jl = `jl_${genRndStr(10)}`;const jm = `jm_${genRndStr(10)}`;const jn = `jn_${genRndStr(10)}`;const jo = `jo_${genRndStr(10)}`;const jp = `jp_${genRndStr(10)}`;const jq = `jq_${genRndStr(10)}`;const jr = `jr_${genRndStr(10)}`;const js = `js_${genRndStr(10)}`;const jt = `jt_${genRndStr(10)}`;const ju = `ju_${genRndStr(10)}`;const jv = `jv_${genRndStr(10)}`;const jw = `jw_${genRndStr(10)}`;const jx = `jx_${genRndStr(10)}`;const jy = `jy_${genRndStr(10)}`;const jz = `jz_${genRndStr(10)}`;
  const ka = `ka_${genRndStr(10)}`;const kb = `kb_${genRndStr(10)}`;const kc = `kc_${genRndStr(10)}`;const kd = `kd_${genRndStr(10)}`;const ke = `ke_${genRndStr(10)}`;const kf = `kf_${genRndStr(10)}`;const kg = `kg_${genRndStr(10)}`;const kh = `kh_${genRndStr(10)}`;const ki = `ki_${genRndStr(10)}`;const kj = `kj_${genRndStr(10)}`;const kk = `kk_${genRndStr(10)}`;const kl = `kl_${genRndStr(10)}`;const km = `km_${genRndStr(10)}`;const kn = `kn_${genRndStr(10)}`;const ko = `ko_${genRndStr(10)}`;const kp = `kp_${genRndStr(10)}`;const kq = `kq_${genRndStr(10)}`;const kr = `kr_${genRndStr(10)}`;const ks = `ks_${genRndStr(10)}`;const kt = `kt_${genRndStr(10)}`;const ku = `ku_${genRndStr(10)}`;const kv = `kv_${genRndStr(10)}`;const kw = `kw_${genRndStr(10)}`;const kx = `kx_${genRndStr(10)}`;const ky = `ky_${genRndStr(10)}`;const kz = `kz_${genRndStr(10)}`;
  const la = `la_${genRndStr(10)}`;const lb = `lb_${genRndStr(10)}`;const lc = `lc_${genRndStr(10)}`;const ld = `ld_${genRndStr(10)}`;const le = `le_${genRndStr(10)}`;const lf = `lf_${genRndStr(10)}`;const lg = `lg_${genRndStr(10)}`;const lh = `lh_${genRndStr(10)}`;const li = `li_${genRndStr(10)}`;const lj = `lj_${genRndStr(10)}`;const lk = `lk_${genRndStr(10)}`;const ll = `ll_${genRndStr(10)}`;const lm = `lm_${genRndStr(10)}`;const ln = `ln_${genRndStr(10)}`;const lo = `lo_${genRndStr(10)}`;const lp = `lp_${genRndStr(10)}`;const lq = `lq_${genRndStr(10)}`;const lr = `lr_${genRndStr(10)}`;const ls = `ls_${genRndStr(10)}`;const lt = `lt_${genRndStr(10)}`;const lu = `lu_${genRndStr(10)}`;const lv = `lv_${genRndStr(10)}`;const lw = `lw_${genRndStr(10)}`;const lx = `lx_${genRndStr(10)}`;const ly = `ly_${genRndStr(10)}`;const lz = `lz_${genRndStr(10)}`;
  const ma = `ma_${genRndStr(10)}`;const mb = `mb_${genRndStr(10)}`;const mc = `mc_${genRndStr(10)}`;const md = `md_${genRndStr(10)}`;const me = `me_${genRndStr(10)}`;const mf = `mf_${genRndStr(10)}`;const mg = `mg_${genRndStr(10)}`;const mh = `mh_${genRndStr(10)}`;const mi = `mi_${genRndStr(10)}`;const mj = `mj_${genRndStr(10)}`;const mk = `mk_${genRndStr(10)}`;const ml = `ml_${genRndStr(10)}`;const mm = `mm_${genRndStr(10)}`;const mn = `mn_${genRndStr(10)}`;const mo = `mo_${genRndStr(10)}`;const mp = `mp_${genRndStr(10)}`;const mq = `mq_${genRndStr(10)}`;const mr = `mr_${genRndStr(10)}`;const ms = `ms_${genRndStr(10)}`;const mt = `mt_${genRndStr(10)}`;const mu = `mu_${genRndStr(10)}`;const mv = `mv_${genRndStr(10)}`;const mw = `mw_${genRndStr(10)}`;const mx = `mx_${genRndStr(10)}`;const my = `my_${genRndStr(10)}`;const mz = `mz_${genRndStr(10)}`;
  const na = `na_${genRndStr(10)}`;const nb = `nb_${genRndStr(10)}`;const nc = `nc_${genRndStr(10)}`;const nd = `nd_${genRndStr(10)}`;const ne = `ne_${genRndStr(10)}`;const nf = `nf_${genRndStr(10)}`;const ng = `ng_${genRndStr(10)}`;const nh = `nh_${genRndStr(10)}`;const ni = `ni_${genRndStr(10)}`;const nj = `nj_${genRndStr(10)}`;const nk = `nk_${genRndStr(10)}`;const nl = `nl_${genRndStr(10)}`;const nm = `nm_${genRndStr(10)}`;const nn = `nn_${genRndStr(10)}`;const no = `no_${genRndStr(10)}`;const np = `np_${genRndStr(10)}`;const nq = `nq_${genRndStr(10)}`;const nr = `nr_${genRndStr(10)}`;const ns = `ns_${genRndStr(10)}`;const nt = `nt_${genRndStr(10)}`;const nu = `nu_${genRndStr(10)}`;const nv = `nv_${genRndStr(10)}`;const nw = `nw_${genRndStr(10)}`;const nx = `nx_${genRndStr(10)}`;const ny = `ny_${genRndStr(10)}`;const nz = `nz_${genRndStr(10)}`;
  const oa = `oa_${genRndStr(10)}`;const ob = `ob_${genRndStr(10)}`;const oc = `oc_${genRndStr(10)}`;const od = `od_${genRndStr(10)}`;const oe = `oe_${genRndStr(10)}`;const of = `of_${genRndStr(10)}`;const og = `og_${genRndStr(10)}`;const oh = `oh_${genRndStr(10)}`;const oi = `oi_${genRndStr(10)}`;const oj = `oj_${genRndStr(10)}`;const ok = `ok_${genRndStr(10)}`;const ol = `ol_${genRndStr(10)}`;const om = `om_${genRndStr(10)}`;const on = `on_${genRndStr(10)}`;const oo = `oo_${genRndStr(10)}`;const op = `op_${genRndStr(10)}`;const oq = `oq_${genRndStr(10)}`;const or = `or_${genRndStr(10)}`;const os = `os_${genRndStr(10)}`;const ot = `ot_${genRndStr(10)}`;const ou = `ou_${genRndStr(10)}`;const ov = `ov_${genRndStr(10)}`;const ow = `ow_${genRndStr(10)}`;const ox = `ox_${genRndStr(10)}`;const oy = `oy_${genRndStr(10)}`;const oz = `oz_${genRndStr(10)}`;
  const pa = `pa_${genRndStr(10)}`;const pb = `pb_${genRndStr(10)}`;const pc = `pc_${genRndStr(10)}`;const pd = `pd_${genRndStr(10)}`;const pe = `pe_${genRndStr(10)}`;const pf = `pf_${genRndStr(10)}`;const pg = `pg_${genRndStr(10)}`;const ph = `ph_${genRndStr(10)}`;const pi = `pi_${genRndStr(10)}`;const pj = `pj_${genRndStr(10)}`;const pk = `pk_${genRndStr(10)}`;const pl = `pl_${genRndStr(10)}`;const pm = `pm_${genRndStr(10)}`;const pn = `pn_${genRndStr(10)}`;const po = `po_${genRndStr(10)}`;const pp = `pp_${genRndStr(10)}`;const pq = `pq_${genRndStr(10)}`;const pr = `pr_${genRndStr(10)}`;const ps = `ps_${genRndStr(10)}`;const pt = `pt_${genRndStr(10)}`;const pu = `pu_${genRndStr(10)}`;const pv = `pv_${genRndStr(10)}`;const pw = `pw_${genRndStr(10)}`;const px = `px_${genRndStr(10)}`;const py = `py_${genRndStr(10)}`;const pz = `pz_${genRndStr(10)}`;
  const qa = `qa_${genRndStr(10)}`;const qb = `qb_${genRndStr(10)}`;const qc = `qc_${genRndStr(10)}`;const qd = `qd_${genRndStr(10)}`;const qe = `qe_${genRndStr(10)}`;const qf = `qf_${genRndStr(10)}`;const qg = `qg_${genRndStr(10)}`;const qh = `qh_${genRndStr(10)}`;const qi = `qi_${genRndStr(10)}`;const qj = `qj_${genRndStr(10)}`;const qk = `qk_${genRndStr(10)}`;const ql = `ql_${genRndStr(10)}`;const qm = `qm_${genRndStr(10)}`;const qn = `qn_${genRndStr(10)}`;const qo = `qo_${genRndStr(10)}`;const qp = `qp_${genRndStr(10)}`;const qq = `qq_${genRndStr(10)}`;const qr = `qr_${genRndStr(10)}`;const qs = `qs_${genRndStr(10)}`;const qt = `qt_${genRndStr(10)}`;const qu = `qu_${genRndStr(10)}`;const qv = `qv_${genRndStr(10)}`;const qw = `qw_${genRndStr(10)}`;const qx = `qx_${genRndStr(10)}`;const qy = `qy_${genRndStr(10)}`;const qz = `qz_${genRndStr(10)}`;
  const ra = `ra_${genRndStr(10)}`;const rb = `rb_${genRndStr(10)}`;const rc = `rc_${genRndStr(10)}`;const rd = `rd_${genRndStr(10)}`;const re = `re_${genRndStr(10)}`;const rf = `rf_${genRndStr(10)}`;const rg = `rg_${genRndStr(10)}`;const rh = `rh_${genRndStr(10)}`;const ri = `ri_${genRndStr(10)}`;const rj = `rj_${genRndStr(10)}`;const rk = `rk_${genRndStr(10)}`;const rl = `rl_${genRndStr(10)}`;const rm = `rm_${genRndStr(10)}`;const rn = `rn_${genRndStr(10)}`;const ro = `ro_${genRndStr(10)}`;const rp = `rp_${genRndStr(10)}`;const rq = `rq_${genRndStr(10)}`;const rr = `rr_${genRndStr(10)}`;const rs = `rs_${genRndStr(10)}`;const rt = `rt_${genRndStr(10)}`;const ru = `ru_${genRndStr(10)}`;const rv = `rv_${genRndStr(10)}`;const rw = `rw_${genRndStr(10)}`;const rx = `rx_${genRndStr(10)}`;const ry = `ry_${genRndStr(10)}`;const rz = `rz_${genRndStr(10)}`;
  const sa = `sa_${genRndStr(10)}`;const sb = `sb_${genRndStr(10)}`;const sc = `sc_${genRndStr(10)}`;const sd = `sd_${genRndStr(10)}`;const se = `se_${genRndStr(10)}`;const sf = `sf_${genRndStr(10)}`;const sg = `sg_${genRndStr(10)}`;const sh = `sh_${genRndStr(10)}`;const si = `si_${genRndStr(10)}`;const sj = `sj_${genRndStr(10)}`;const sk = `sk_${genRndStr(10)}`;const sl = `sl_${genRndStr(10)}`;const sm = `sm_${genRndStr(10)}`;const sn = `sn_${genRndStr(10)}`;const so = `so_${genRndStr(10)}`;const sp = `sp_${genRndStr(10)}`;const sq = `sq_${genRndStr(10)}`;const sr = `sr_${genRndStr(10)}`;const ss = `ss_${genRndStr(10)}`;const st_ = `st_${genRndStr(10)}`;const su = `su_${genRndStr(10)}`;const sv = `sv_${genRndStr(10)}`;const sw = `sw_${genRndStr(10)}`;const sx = `sx_${genRndStr(10)}`;const sy = `sy_${genRndStr(10)}`;const sz = `sz_${genRndStr(10)}`;
  const ta = `ta_${genRndStr(10)}`;const tb = `tb_${genRndStr(10)}`;const tc = `tc_${genRndStr(10)}`;const td = `td_${genRndStr(10)}`;const te = `te_${genRndStr(10)}`;const tf = `tf_${genRndStr(10)}`;const tg = `tg_${genRndStr(10)}`;const th = `th_${genRndStr(10)}`;const ti = `ti_${genRndStr(10)}`;const tj = `tj_${genRndStr(10)}`;const tk = `tk_${genRndStr(10)}`;const tl = `tl_${genRndStr(10)}`;const tm = `tm_${genRndStr(10)}`;const tn = `tn_${genRndStr(10)}`;const to = `to_${genRndStr(10)}`;const tp = `tp_${genRndStr(10)}`;const tq = `tq_${genRndStr(10)}`;const tr = `tr_${genRndStr(10)}`;const ts = `ts_${genRndStr(10)}`;const tt = `tt_${genRndStr(10)}`;const tu = `tu_${genRndStr(10)}`;const tv = `tv_${genRndStr(10)}`;const tw = `tw_${genRndStr(10)}`;const tx = `tx_${genRndStr(10)}`;const ty = `ty_${genRndStr(10)}`;const tz = `tz_${genRndStr(10)}`;
  const ua = `ua_${genRndStr(10)}`;const ub = `ub_${genRndStr(10)}`;const uc = `uc_${genRndStr(10)}`;const ud = `ud_${genRndStr(10)}`;const ue = `ue_${genRndStr(10)}`;const uf = `uf_${genRndStr(10)}`;const ug = `ug_${genRndStr(10)}`;const uh = `uh_${genRndStr(10)}`;const ui = `ui_${genRndStr(10)}`;const uj = `uj_${genRndStr(10)}`;const uk = `uk_${genRndStr(10)}`;const ul = `ul_${genRndStr(10)}`;const um = `um_${genRndStr(10)}`;const un = `un_${genRndStr(10)}`;const uo = `uo_${genRndStr(10)}`;const up = `up_${genRndStr(10)}`;const uq = `uq_${genRndStr(10)}`;const ur = `ur_${genRndStr(10)}`;const us = `us_${genRndStr(10)}`;const ut = `ut_${genRndStr(10)}`;const uu = `uu_${genRndStr(10)}`;const uv = `uv_${genRndStr(10)}`;const uw = `uw_${genRndStr(10)}`;const ux = `ux_${genRndStr(10)}`;const uy = `uy_${genRndStr(10)}`;const uz = `uz_${genRndStr(10)}`;
  const va = `va_${genRndStr(10)}`;const vb = `vb_${genRndStr(10)}`;const vc = `vc_${genRndStr(10)}`;const vd = `vd_${genRndStr(10)}`;const ve = `ve_${genRndStr(10)}`;const vf = `vf_${genRndStr(10)}`;const vg = `vg_${genRndStr(10)}`;const vh = `vh_${genRndStr(10)}`;const vi = `vi_${genRndStr(10)}`;const vj = `vj_${genRndStr(10)}`;const vk = `vk_${genRndStr(10)}`;const vl = `vl_${genRndStr(10)}`;const vm = `vm_${genRndStr(10)}`;const vn = `vn_${genRndStr(10)}`;const vo = `vo_${genRndStr(10)}`;const vp = `vp_${genRndStr(10)}`;const vq = `vq_${genRndStr(10)}`;const vr = `vr_${genRndStr(10)}`;const vs = `vs_${genRndStr(10)}`;const vt = `vt_${genRndStr(10)}`;const vu = `vu_${genRndStr(10)}`;const vv = `vv_${genRndStr(10)}`;const vw = `vw_${genRndStr(10)}`;const vx = `vx_${genRndStr(10)}`;const vy = `vy_${genRndStr(10)}`;const vz = `vz_${genRndStr(10)}`;
  const wa = `wa_${genRndStr(10)}`;const wb = `wb_${genRndStr(10)}`;const wc = `wc_${genRndStr(10)}`;const wd = `wd_${genRndStr(10)}`;const we = `we_${genRndStr(10)}`;const wf = `wf_${genRndStr(10)}`;const wg = `wg_${genRndStr(10)}`;const wh = `wh_${genRndStr(10)}`;const wi = `wi_${genRndStr(10)}`;const wj = `wj_${genRndStr(10)}`;const wk = `wk_${genRndStr(10)}`;const wl = `wl_${genRndStr(10)}`;const wm = `wm_${genRndStr(10)}`;const wn = `wn_${genRndStr(10)}`;const wo = `wo_${genRndStr(10)}`;const wp = `wp_${genRndStr(10)}`;const wq = `wq_${genRndStr(10)}`;const wr = `wr_${genRndStr(10)}`;const ws = `ws_${genRndStr(10)}`;const wt = `wt_${genRndStr(10)}`;const wu = `wu_${genRndStr(10)}`;const wv = `wv_${genRndStr(10)}`;const ww = `ww_${genRndStr(10)}`;const wx = `wx_${genRndStr(10)}`;const wy = `wy_${genRndStr(10)}`;const wz = `wz_${genRndStr(10)}`;
  const xa = `xa_${genRndStr(10)}`;const xb = `xb_${genRndStr(10)}`;const xc = `xc_${genRndStr(10)}`;const xd = `xd_${genRndStr(10)}`;const xe = `xe_${genRndStr(10)}`;const xf = `xf_${genRndStr(10)}`;const xg = `xg_${genRndStr(10)}`;const xh = `xh_${genRndStr(10)}`;const xi = `xi_${genRndStr(10)}`;const xj = `xj_${genRndStr(10)}`;const xk = `xk_${genRndStr(10)}`;const xl = `xl_${genRndStr(10)}`;const xm = `xm_${genRndStr(10)}`;const xn = `xn_${genRndStr(10)}`;const xo = `xo_${genRndStr(10)}`;const xp = `xp_${genRndStr(10)}`;const xq = `xq_${genRndStr(10)}`;const xr = `xr_${genRndStr(10)}`;const xs = `xs_${genRndStr(10)}`;const xt = `xt_${genRndStr(10)}`;const xu = `xu_${genRndStr(10)}`;const xv = `xv_${genRndStr(10)}`;const xw = `xw_${genRndStr(10)}`;const xx = `xx_${genRndStr(10)}`;const xy = `xy_${genRndStr(10)}`;const xz = `xz_${genRndStr(10)}`;
  const ya = `ya_${genRndStr(10)}`;const yb = `yb_${genRndStr(10)}`;const yc = `yc_${genRndStr(10)}`;const yd = `yd_${genRndStr(10)}`;const ye = `ye_${genRndStr(10)}`;const yf = `yf_${genRndStr(10)}`;const yg = `yg_${genRndStr(10)}`;const yh = `yh_${genRndStr(10)}`;const yi = `yi_${genRndStr(10)}`;const yj = `yj_${genRndStr(10)}`;const yk = `yk_${genRndStr(10)}`;const yl = `yl_${genRndStr(10)}`;const ym = `ym_${genRndStr(10)}`;const yn = `yn_${genRndStr(10)}`;const yo = `yo_${genRndStr(10)}`;const yp = `yp_${genRndStr(10)}`;const yq = `yq_${genRndStr(10)}`;const yr = `yr_${genRndStr(10)}`;const ys = `ys_${genRndStr(10)}`;const yt = `yt_${genRndStr(10)}`;const yu = `yu_${genRndStr(10)}`;const yv = `yv_${genRndStr(10)}`;const yw = `yw_${genRndStr(10)}`;const yx = `yx_${genRndStr(10)}`;const yy = `yy_${genRndStr(10)}`;const yz = `yz_${genRndStr(10)}`;
  const za = `za_${genRndStr(10)}`;const zb = `zb_${genRndStr(10)}`;const zc = `zc_${genRndStr(10)}`;const zd = `zd_${genRndStr(10)}`;const ze = `ze_${genRndStr(10)}`;const zf = `zf_${genRndStr(10)}`;const zg = `zg_${genRndStr(10)}`;const zh = `zh_${genRndStr(10)}`;const zi = `zi_${genRndStr(10)}`;const zj = `zj_${genRndStr(10)}`;const zk = `zk_${genRndStr(10)}`;const zl = `zl_${genRndStr(10)}`;const zm = `zm_${genRndStr(10)}`;const zn = `zn_${genRndStr(10)}`;const zo = `zo_${genRndStr(10)}`;const zp = `zp_${genRndStr(10)}`;const zq = `zq_${genRndStr(10)}`;const zr = `zr_${genRndStr(10)}`;const zs = `zs_${genRndStr(10)}`;const zt = `zt_${genRndStr(10)}`;const zu = `zu_${genRndStr(10)}`;const zv = `zv_${genRndStr(10)}`;const zw = `zw_${genRndStr(10)}`;const zx = `zx_${genRndStr(10)}`;const zy = `zy_${genRndStr(10)}`;const zz = `zz_${genRndStr(10)}`;

  const dummyLogic = { a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,aa,ab,ac,ad,ae,af,ag,ah,ai,aj,ak,al,am,an,ao,ap,aq,ar,as,at,au,av,aw,ax,ay,az,ba,bb,bc,bd,be,bf,bg,bh,bi,bj,bk,bl,bm,bn,bo,bp,bq,br,bs,bt,bu,bv,bw,bx,by,bz,ca,cb,cc,cd,ce,cf,cg,ch,ci,cj,ck,cl,cm,cn,co,cp,cq,cr,cs,ct,cu,cv,cw,cx,cy,cz,da,db,dc,dd,de,df,dg,dh,di,dj,dk,dl,dm,dn,dp,dq,dr,ds,dt,du,dv,dw,dx,dy,dz,ea,eb,ec,ed,ee,ef,eg,eh,ei,ej,ek,el,em,en,eo,ep,eq,er,es,et,eu,ev,ew,ex,ey,ez,fa,fb,fc,fd,fe,ff,fg,fh,fi,fj,fk,fl,fm,fn,fo,fp,fq,fr,fs,ft,fu,fv,fw,fx,fy,fz,ga,gb,gc,gd,ge,gf,gg,gh,gi,gj,gk,gl,gm,gn,go,gp,gq,gr,gs,gt,gu,gv,gw,gx,gy,gz,ha,hb,hc,hd,he,hf,hg,hh,hi,hj,hk,hl,hm,hn,ho,hp,hq,hr,hs,ht,hu,hv,hw,hx,hy,hz,ia,ib,ic,id,ie,ig,ih,ii,ij,ik,il,im,io,ip,iq,ir,is,it,iu,iv,iw,ix,iy,iz,ja,jb,jc,jd,je,jf,jg,jh,ji,jj,jk,jl,jm,jn,jo,jp,jq,jr,js,jt,ju,jv,jw,jx,jy,jz,ka,kb,kc,kd,ke,kf,kg,kh,ki,kj,kk,kl,km,kn,ko,kp,kq,kr,ks,kt,ku,kv,kw,kx,ky,kz,la,lb,lc,ld,le,lf,lg,lh,li,lj,lk,ll,lm,ln,lo,lp,lq,lr,ls,lt,lu,lv,lw,lx,ly,lz,ma,mb,mc,md,me,mf,mg,mh,mi,mj,mk,ml,mm,mn,mo,mp,mq,mr,ms,mt,mu,mv,mw,mx,my,mz,na,nb,nc,nd,ne,nf,ng,nh,ni,nj,nk,nl,nm,nn,no,np,nq,nr,ns,nt,nu,nv,nw,nx,ny,nz,oa,ob,oc,od,oe,of,og,oh,oi,oj,ok,ol,om,on,oo,op,oq,or,os,ot,ou,ov,ow,ox,oy,oz,pa,pb,pc,pd,pe,pf,pg,ph,pi,pj,pk,pl,pm,pn,po,pp,pq,pr,ps,pt,pu,pv,pw,px,py,pz,qa,qb,qc,qd,qe,qf,qg,qh,qi,qj,qk,ql,qm,qn,qo,qp,qq,qr,qs,qt,qu,qv,qw,qx,qy,qz,ra,rb,rc,rd,re,rf,rg,rh,ri,rj,rk,rl,rm,rn,ro,rp,rq,rr,rs,rt,ru,rv,rw,rx,ry,rz,sa,sb,sc,sd,se,sf,sg,sh,si,sj,sk,sl,sm,sn,so,sp,sq,sr,ss,st_,su,sv,sw,sx,sy,sz,ta,tb,tc,td,te,tf,tg,th,ti,tj,tk,tl,tm,tn,to,tp,tq,tr,ts,tt,tu,tv,tw,tx,ty,tz,ua,ub,uc,ud,ue,uf,ug,uh,ui,uj,uk,ul,um,un,uo,up,uq,ur,us,ut,uu,uv,uw,ux,uy,uz,va,vb,vc,vd,ve,vf,vg,vh,vi,vj,vk,vl,vm,vn,vo,vp,vq,vr,vs,vt,vu,vv,vw,vx,vy,vz,wa,wb,wc,wd,we,wf,wg,wh,wi,wj,wk,wl,wm,wn,wo,wp,wq,wr,ws,wt,wu,wv,ww,wx,wy,wz,xa,xb,xc,xd,xe,xf,xg,xh,xi,xj,xk,xl,xm,xn,xo,xp,xq,xr,xs,xt,xu,xv,xw,xx,xy,xz,ya,yb,yc,yd,ye,yf,yg,yh,yi,yj,yk,yl,ym,yn,yo,yp,yq,yr,ys,yt,yu,yv,yw,yx,yy,yz,za,zb,zc,zd,ze,zf,zg,zh,zi,zj,zk,zl,zm,zn,zo,zp,zq,zr,zs,zt,zu,zv,zw,zx,zy,zz };

  return <LedgerForm initialValues={formProps} />;
}

export default AcctDataOrchstrtr;