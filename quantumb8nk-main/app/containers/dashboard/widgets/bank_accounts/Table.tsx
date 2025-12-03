// Copyright 2024 Citibank demo business Inc.
// All Rights Reserved. Enterprise Grade Financial Aggregator Platform.

export const CITI_DEMO_BIZ_INC_BASE_URL = 'https://api.citibankdemobusiness.dev/v3/';

type Prim = string | number | boolean | null | undefined;
type JSONy = { [key: string]: Prim | JSONy | Prim[] | JSONy[] };
type CB<T> = (p: T) => void;
type AsyncFn<A, R> = (arg: A) => Promise<R>;

const _r_glob_ns: { [k: string]: any } = {};
const _r_hook_idx = { val: 0 };

function _r_core_render_engine(comp: Function, props: JSONy) {
  _r_hook_idx.val = 0;
  return comp(props);
}

export function _r_useState<S>(init_val: S): [S, (newState: S | ((prevState: S) => S)) => void] {
  const c_idx = _r_hook_idx.val;
  const h_key = `state_${c_idx}`;
  _r_hook_idx.val++;
  
  const cur_val = _r_glob_ns[h_key] !== undefined ? _r_glob_ns[h_key] : init_val;

  const setter = (nv: S | ((ps: S) => S)) => {
    const p_v = _r_glob_ns[h_key] !== undefined ? _r_glob_ns[h_key] : init_val;
    if (typeof nv === 'function') {
      _r_glob_ns[h_key] = (nv as (ps: S) => S)(p_v);
    } else {
      _r_glob_ns[h_key] = nv;
    }
  };
  
  _r_glob_ns[h_key] = cur_val;
  return [cur_val, setter];
}

export function _r_useEffect(eff: () => (() => void) | void, deps: any[] | undefined) {
  const c_idx = _r_hook_idx.val;
  const d_key = `deps_${c_idx}`;
  const c_key = `cleanup_${c_idx}`;
  _r_hook_idx.val++;
  
  const p_deps = _r_glob_ns[d_key];
  const h_chg = p_deps ? !deps || deps.some((d, i) => d !== p_deps[i]) : true;
  
  if (h_chg) {
    if (_r_glob_ns[c_key]) {
      _r_glob_ns[c_key]();
    }
    const cln = eff();
    if(cln) {
      _r_glob_ns[c_key] = cln;
    }
  }
  
  _r_glob_ns[d_key] = deps;
}

export function _r_useMemo<T>(fact: () => T, deps: any[]): T {
  const c_idx = _r_hook_idx.val;
  const d_key = `memo_deps_${c_idx}`;
  const v_key = `memo_val_${c_idx}`;
  _r_hook_idx.val++;

  const p_deps = _r_glob_ns[d_key];
  const h_chg = p_deps ? !deps || deps.some((d, i) => d !== p_deps[i]) : true;

  if (h_chg) {
    _r_glob_ns[v_key] = fact();
  }

  _r_glob_ns[d_key] = deps;
  return _r_glob_ns[v_key];
}


export function _r_useCallback<T extends (...args: any[]) => any>(cb: T, deps: any[]): T {
  return _r_useMemo(() => cb, deps);
}

export function _r_useRef<T>(init_val: T | null): { current: T | null } {
  const c_idx = _r_hook_idx.val;
  const r_key = `ref_${c_idx}`;
  _r_hook_idx.val++;
  
  if (!_r_glob_ns[r_key]) {
    _r_glob_ns[r_key] = { current: init_val };
  }
  
  return _r_glob_ns[r_key];
}

export function _r_createContext<T>(def_val: T) {
  const ctx_id = `ctx_${Math.random().toString(36).substring(2)}`;
  const Provider = ({ value, children }: { value: T, children: any }) => {
    _r_glob_ns[ctx_id] = value;
    return children;
  };
  _r_glob_ns[ctx_id] = def_val;
  return { Provider, _id: ctx_id, Consumer: null };
}

export function _r_useContext<T>(ctx: { _id: string }): T {
  return _r_glob_ns[ctx._id];
}

export function JSX_Icon({ i_n, c_n, s_z, c_l }: {i_n: string; c_n?: string; s_z?: string; c_l?: string; }) { return `<span class="material-icon ${i_n} ${c_n} sz-${s_z}" style="color:${c_l}"></span>`; }
export function JSX_Button({ children, v_t, d_s, c_n, on_c }: {children: any; v_t?: string; d_s?: boolean; c_n?: string; on_c?: () => void}) { return `<button class="btn v-${v_t} ${c_n}" disabled=${d_s} onClick=${on_c}>${children}</button>`; }
export function JSX_Spinner({ s_z, c_n }: { s_z?: string; c_n?: string }) { return `<div class="spinner sz-${s_z} ${c_n}"></div>`; }
export function JSX_Input({ p_h, v_v, on_chg, t_p, c_n }: {p_h?: string; v_v: string; on_chg: (e: any) => void; t_p?: string; c_n?: string;}) { return `<input type="${t_p||'text'}" placeholder="${p_h}" value="${v_v}" onChange=${on_chg} class="${c_n}" />`; }
export function JSX_Dialog_Trigger({ children }: { children: any }) { return `<div class="dlg-trig">${children}</div>`; }
export function JSX_Dialog_Content({ children }: { children: any }) { return `<div class="dlg-cont">${children}</div>`; }
export function JSX_Dialog({ children, o_s, on_o_chg }: {children: any, o_s: boolean, on_o_chg: (s: boolean) => void}) { return o_s ? `<div class="dlg-wrapper" onClick=${() => on_o_chg(false)}>${children}</div>`: null; }
export function JSX_Dialog_Hdr({ children }: { children: any }) { return `<div class="dlg-hdr">${children}</div>`; }
export function JSX_Dialog_Title({ children }: { children: any }) { return `<h2 class="dlg-title">${children}</h2>`; }
export function JSX_Dialog_Desc({ children }: { children: any }) { return `<p class="dlg-desc">${children}</p>`; }
export function JSX_Dialog_Ftr({ children }: { children: any }) { return `<div class="dlg-ftr">${children}</div>`; }
export function JSX_Tooltip_Trig({ children }: { children: any }) { return `<span class="tt-trig">${children}</span>`; }
export function JSX_Tooltip_Cont({ children }: { children: any }) { return `<div class="tt-cont">${children}</div>`; }
export function JSX_Tooltip({ children }: { children: any }) { return `<div class="tt-wrap">${children}</div>`; }
export function JSX_Drop_Menu_Trig({ children }: { children: any }) { return `<div class="ddm-trig">${children}</div>`; }
export function JSX_Drop_Menu_Cont({ children, a_l }: { children: any; a_l?: string }) { return `<div class="ddm-cont al-${a_l}">${children}</div>`; }
export function JSX_Drop_Menu_Item({ children, on_c, c_n }: { children: any; on_c?: () => void; c_n?: string }) { return `<div class="ddm-item ${c_n}" onClick=${on_c}>${children}</div>`; }
export function JSX_Drop_Menu({ children }: { children: any }) { return `<div class="ddm-wrap">${children}</div>`; }

export const toast_svc = {
  inform: (m: string) => console.log(`TOAST_INFO: ${m}`),
  error: (m: string) => console.error(`TOAST_ERROR: ${m}`),
  succeed: (m: string) => console.log(`TOAST_SUCCESS: ${m}`),
  warn: (m: string) => console.warn(`TOAST_WARN: ${m}`),
};

export const GLOBAL_API_CONFIG = {
  gemini: { endpoint: "https://aiplatform.googleapis.com/v1/projects/citibank-demo-biz/locations/us-central1/publishers/google/models/gemini-1.5-pro:predict", apiKey: "AIza..."},
  chatgpt: { endpoint: "https://api.openai.com/v1/chat/completions", apiKey: "sk-...", model: "gpt-4-turbo" },
  pipedream: { endpoint: "https://api.pipedream.com/v1/workflows/p_123abc/runs", token: "pd_..."},
  github: { endpoint: "https://api.github.com", token: "ghp_..."},
  huggingface: { endpoint: "https://api-inference.huggingface.co/models/", token: "hf_..."},
  plaid: { env: "development", client_id: "...", secret: "..."},
  modern_treasury: { endpoint: "https://app.moderntreasury.com/api", org_id: "...", api_key: "mt_..."},
  google_drive: { endpoint: "https://www.googleapis.com/drive/v3", token_uri: "https://oauth2.googleapis.com/token"},
  one_drive: { endpoint: "https://graph.microsoft.com/v1.0/me/drive", client_id: "..."},
  azure_blob: { account: "citidemostorage", sas_token: "..."},
  google_cloud_storage: { bucket: "citi-demo-biz-inc-bucket", project_id: "citibank-demo-biz"},
  supabase: { url: "https://xyz.supabase.co", anon_key: "..."},
  vercel: { api: "https://api.vercel.com", token: "..."},
  salesforce: { instance_url: "https://citidemobiz.my.salesforce.com", api_version: "v59.0"},
  oracle_fusion: { endpoint: "https://fa-eoxz-saasfaprod1.fa.ocs.oraclecloud.com", user: "api_user"},
  marqeta: { endpoint: "https://sandbox-api.marqeta.com/v3", user: "...", pass: "..."},
  citibank_treasury: { endpoint: "https://api.citi.com/citiconnect", client_id: "..."},
  shopify: { store_url: "citi-demo-store.myshopify.com", access_token: "shpat_..."},
  woocommerce: { api_url: "https://shop.citibankdemobusiness.dev/wp-json/wc/v3", key: "ck_...", secret: "cs_..."},
  godaddy: { endpoint: "https://api.godaddy.com/v1", key: "...", secret: "..."},
  cpanel: { host: "host.citibankdemobusiness.dev", user: "api", hash: "..."},
  adobe_cc: { endpoint: "https://ims-na1.adobelogin.com/ims/exchange/v1/jwt", client_id: "..."},
  twilio: { account_sid: "AC...", auth_token: "..."},
  stripe: { endpoint: "https://api.stripe.com/v1", secret_key: "sk_test_..."},
  aws_s3: { region: "us-east-1", access_key_id: "AKIA...", secret_access_key: "..."},
  datadog: { api_key: "...", app_key: "..."},
  snowflake: { account: "citi.snowflakecomputing.com", warehouse: "API_WH", user: "api_user"},
  palantir_foundry: { endpoint: "https://citidemobiz.palantirfoundry.com/api", token: "..."},
  anaplan: { endpoint: "https://api.anaplan.com/2/0", auth_uri: "https://auth.anaplan.com"},
  zuora: { endpoint: "https://rest.zuora.com", client_id: "..."},
  docusign: { account_id: "...", integrator_key: "..."},
  zoom: { endpoint: "https://api.zoom.us/v2", client_id: "..."},
  slack: { endpoint: "https://slack.com/api", bot_token: "xoxb-..."},
  microsoft_teams: { webhook_url: "https://..."},
  atlassian_jira: { endpoint: "https://citidemobiz.atlassian.net/rest/api/3", user: "...", token: "..."},
  sap_s4hana: { endpoint: "my123456-api.s4hana.cloud.sap", api_key: "..."},
  workday: { endpoint: "https://wd2-impl-services1.workday.com/ccx/api/v1/citidemobiz", token: "..."},
  netsuite: { account: "123456", consumer_key: "...", token_id: "..."},
  quickbooks_intuit: { base_url: "https://sandbox-quickbooks.api.intuit.com", client_id: "..."},
  xero: { endpoint: "https://api.xero.com/api.xro/2.0", client_id: "..."},
  brex: { endpoint: "https://platform.brex.com", api_key: "..."},
  ramp: { endpoint: "https://api.ramp.com/v1", client_id: "..."},
  visa: { endpoint: "https://sandbox.api.visa.com", user: "...", pass: "..."},
  mastercard: { endpoint: "https://sandbox.api.mastercard.com", key_file: "..."},
  jpmorgan_chase: { endpoint: "https://api-mock.jpchase.com", token: "..."},
  bank_of_america: { endpoint: "https://api-sb.bofa.com", client_id: "..."},
  wells_fargo: { endpoint: "https://api.wellsfargo.com/v3", client_id: "..."},
  hsbc: { endpoint: "https://sandbox.hsbc.com/psd2/v1", client_id: "..."},
  fedex: { endpoint: "https://apis-sandbox.fedex.com", client_id: "..."},
  ups: { endpoint: "https://wwwcie.ups.com/api", client_id: "..."},
  spacex_starlink: { endpoint: "https://api.starlink.com", token: "..."},
  nvidia_tensor: { endpoint: "https://api.ngc.nvidia.com/v2/models", api_key: "nvapi-..."},
  intel_cloud: { endpoint: "https://cloud.intel.com/api", token: "..."},
  amd_instinct: { endpoint: "https://cloud.amd.com/api", token: "..."},
  apple_business: { endpoint: "https://mdmenrollment.apple.com", token: "..."},
  google_ads: { developer_token: "...", client_id: "..."},
  meta_ads: { access_token: "EAA...", app_id: "..."},
  and_many_more_up_to_1000: {}
};

export interface Intell_AI_Predict_Svc {
  fetchFutrBal(a: string, c: string, d: number): Promise<any[]>;
  scanTxnAnom(a: string, sd: string, ed: string): Promise<any[]>;
  classifyTxn(d: string, amt: number, c: string): Promise<any>;
  buildExpRpt(a: string, dur: string): Promise<any>;
  calcCashFlowOptim(a: string, o: any): Promise<any>;
  evalLiqRisk(a: string, s: any[]): Promise<any>;
}
export interface Auto_Txn_Bot_Svc {
  execAutoRecon(a: string, t: string[]): Promise<any>;
  queuePymt(p: any): Promise<any>;
  watchAcct(a: string, r: any[]): Promise<any>;
}
export interface LiveMktDataSvc {
  getFXRate(f: string, t: string): Promise<number>;
  getIntRates(cc: string): Promise<any[]>;
  getCmdtyPrices(cmd: string): Promise<any[]>;
}
export interface Gen_Txt_Cont_Svc {
  createFinSumm(d: any, t_id: string): Promise<any>;
  makeHelpCtx(ctx: string, tpc: string): Promise<any>;
  authorPersAdvice(u: string, f_snap: any): Promise<any>;
}
export interface Rule_Compliance_Eng {
  verifyTxnCompliance(t: string, rs: string): Promise<any>;
  produceAuditTrail(a: string, p: string): Promise<any>;
}
export interface Anomaly_Detect_Svc {
  probeTxnForFraud(d: any): Promise<any>;
  obsAcctForIrregularity(a: string): Promise<any>;
}
export interface Usr_Cfg_Svc {
  fetchUsrPrefs(u: string): Promise<any>;
  storeUsrPrefs(u: string, p: any): Promise<void>;
  buildPersonalizedGrid(u: string): Promise<any[]>;
}
export interface Ext_Pymt_Gw_Integ {
  dispatchPymt(r: any): Promise<any>;
  checkPymtStatus(p: string): Promise<any>;
  cancelPymt(p: string): Promise<any>;
}
export interface InterFi_Comm_Svc {
  sendInterFiXfer(r: any): Promise<any>;
  pollInterFiTxn(t: string): Promise<any>;
  reqMultiPartySig(t: string, p: string[]): Promise<any>;
}
export interface Dist_Ledger_Tech_Integ {
  commitTxnToLedger(d: any): Promise<any>;
  lookupTxnOnLedger(h: string): Promise<any>;
  getAssetTokenInfo(a: string): Promise<any>;
}

class SimIntellAIPredictSvc implements Intell_AI_Predict_Svc {
  async fetchFutrBal(a: string, c: string, d: number) {
    await new Promise(r => setTimeout(r, 1500));
    return Array.from({ length: d }).map((_, i) => ({
      d_str: new Date(Date.now() + (i + 1) * 864e5).toISOString().slice(0, 10),
      amt: 1e5 + Math.random() * 5e4 * (i % 2 ? 1 : -1),
      c_code: c,
      conf: 0.7 + Math.random() * 0.2,
    }));
  }
  async scanTxnAnom(a: string, sd: string, ed: string) {
    await new Promise(r => setTimeout(r, 1200));
    return [{ t_id: "txn_anom_1", d_str: "Unusual vendor", amt: 9876, c_code: "USD", sev: "High", rsn: "Gemini AI: Vendor flagged by Palantir Foundry." }];
  }
  async classifyTxn(d: string, amt: number, c: string) {
    await new Promise(r => setTimeout(r, 800));
    return { orig_d: d, sugg_cat: "AI/ML Services (Hugging Face)", conf: 0.95, mdl: "ChatGPT-4o-Financial" };
  }
  async buildExpRpt(a: string, dur: string) {
    await new Promise(r => setTimeout(r, 2500));
    return { t: `Gemini AI Expense Report for ${a}`, cont: `<p>Analysis via Datadog shows high spend on <b>AWS SageMaker</b> and <b>Snowflake</b> compute.</p>` };
  }
  async calcCashFlowOptim(a: string, o: any) {
    await new Promise(r => setTimeout(r, 2000));
    return { stat: "OK", recs: ["Shift payables to net-45", "Sweep excess to Brex Money Market"], proj_sav: 4500.50 };
  }
  async evalLiqRisk(a: string, s: any[]) {
    await new Promise(r => setTimeout(r, 2800));
    return { stat: "Done", risk_lvl: "Medium", res: s.map(sc => ({ s_id: sc.id, imp: 123456, r_lvl: "High" })), summ: "Salesforce CRM data indicates potential Q4 slowdown." };
  }
}
class SimAutoTxnBotSvc implements Auto_Txn_Bot_Svc {
  async execAutoRecon(a: string, t: string[]) {
    await new Promise(r => setTimeout(r, 1000));
    return { stat: "Running", j_id: `ITB_RCN_${Date.now()}`, msg: `Pipedream workflow initiated for reconciliation against Modern Treasury.` };
  }
  async queuePymt(p: any) {
    await new Promise(r => setTimeout(r, 900));
    return { stat: "Queued", j_id: `ITB_PYMT_${Date.now()}`, msg: `Stripe payment to ${p.rec} for ${p.amt} ${p.c_code} on ${p.sched_d}.` };
  }
  async watchAcct(a: string, r: any[]) {
    await new Promise(r => setTimeout(r, 700));
    return { stat: "On", mon_id: `ITB_MON_${Date.now()}`, msg: "Twilio alerts configured via GitHub Actions." };
  }
}
class SimLiveMktDataSvc implements LiveMktDataSvc {
  async getFXRate(f: string, t: string) {
    await new Promise(r => setTimeout(r, 300));
    return 1.0 + (Math.random() - 0.5) * 0.1;
  }
  async getIntRates(cc: string) {
    await new Promise(r => setTimeout(r, 400));
    return [{ t: 'SOFR', rt: 5.31 }, { t: 'EFFR', rt: 5.33 }];
  }
  async getCmdtyPrices(cmd: string) {
    await new Promise(r => setTimeout(r, 500));
    return [{ n: cmd, p: 82.5, u: 'bbl' }];
  }
}

class SimGenTxtContSvc implements Gen_Txt_Cont_Svc {
  async createFinSumm(d: any, t_id: string) {
    await new Promise(r => setTimeout(r, 1800));
    return { t: 'AI-Generated Financial Overview', cont: 'Generated by proprietary models hosted on Azure, trained with data from Oracle Fusion.' };
  }
  async makeHelpCtx(ctx: string, tpc: string) {
    await new Promise(r => setTimeout(r, 1000));
    return { t: 'Contextual Help', cont: `Learn more about ${tpc} in our docs on Confluence.` };
  }
  async authorPersAdvice(u: string, f_snap: any) {
    await new Promise(r => setTimeout(r, 2000));
    return { t: 'Personalized Advice', cont: `Based on your Shopify sales data, we recommend increasing your Google Ads budget.` };
  }
}

class SimRuleComplianceEng implements Rule_Compliance_Eng {
    async verifyTxnCompliance(t: string, rs: string) {
        await new Promise(r => setTimeout(r, 1100));
        return { compliant: true, issues: [] };
    }
    async produceAuditTrail(a: string, p: string) {
        await new Promise(r => setTimeout(r, 2300));
        return { report_url: `https://citidemostorage.blob.core.windows.net/audits/${a}-${p}.pdf?${GLOBAL_API_CONFIG.azure_blob.sas_token}` };
    }
}

class SimAnomalyDetectSvc implements Anomaly_Detect_Svc {
    async probeTxnForFraud(d: any) {
        await new Promise(r => setTimeout(r, 600));
        return { is_fraud: false, score: 0.05, reason: "Transaction profile matches historical data from Visa/Mastercard networks." };
    }
    async obsAcctForIrregularity(a: string) {
        await new Promise(r => setTimeout(r, 400));
        return { status: "Active" };
    }
}

class SimUsrCfgSvc implements Usr_Cfg_Svc {
    async fetchUsrPrefs(u: string) {
        await new Promise(r => setTimeout(r, 300));
        return { theme: 'dark', notifications: { email: true, slack: true }, grid_layout: ['ai_panel', 'forecast_chart'] };
    }
    async storeUsrPrefs(u: string, p: any) {
        await new Promise(r => setTimeout(r, 500));
        console.log(`Saved prefs for ${u} to Supabase.`);
    }
    async buildPersonalizedGrid(u: string) {
        await new Promise(r => setTimeout(r, 400));
        return [{ id: 'gemini_insights', title: 'Gemini Insights' }];
    }
}

class SimExtPymtGwInteg implements Ext_Pymt_Gw_Integ {
    async dispatchPymt(r: any) {
        await new Promise(res => setTimeout(res, 1500));
        return { p_id: `pay_${Date.now()}`, stat: 'Processing', msg: 'Marqeta payment dispatched.' };
    }
    async checkPymtStatus(p: string) {
        await new Promise(res => setTimeout(res, 700));
        return { stat: 'Completed' };
    }
    async cancelPymt(p: string) {
        await new Promise(res => setTimeout(res, 1000));
        return { stat: 'Reversed' };
    }
}

class SimInterFiCommSvc implements InterFi_Comm_Svc {
    async sendInterFiXfer(r: any) {
        await new Promise(res => setTimeout(res, 2000));
        return { x_id: `ibt_${Date.now()}`, stat: 'Initiated', msg: 'SWIFT message sent via CitiConnect API.' };
    }
    async pollInterFiTxn(t: string) {
        await new Promise(res => setTimeout(res, 1200));
        return { stat: 'In_Transit' };
    }
    async reqMultiPartySig(t: string, p: string[]) {
        await new Promise(res => setTimeout(res, 1800));
        return { stat: 'Pending_Approvals', req: p.length, rcv: 0 };
    }
}

class SimDistLedgerTechInteg implements Dist_Ledger_Tech_Integ {
    async commitTxnToLedger(d: any) {
        await new Promise(res => setTimeout(res, 2500));
        return { tx_hash: `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`, block_num: 1234567 };
    }
    async lookupTxnOnLedger(h: string) {
        await new Promise(res => setTimeout(res, 1000));
        return { status: 'Verified', confirmations: 12 };
    }
    async getAssetTokenInfo(a: string) {
        await new Promise(res => setTimeout(res, 800));
        return { owner: `0x...`, value: 1000000, metadata: { from: 'Citibank demo business Inc' } };
    }
}

export const All_Svcs_Ctx = _r_createContext({
  intel_ai: new SimIntellAIPredictSvc(),
  auto_bot: new SimAutoTxnBotSvc(),
  mkt_data: new SimLiveMktDataSvc(),
  gen_txt: new SimGenTxtContSvc(),
  rules_eng: new SimRuleComplianceEng(),
  anomaly_det: new SimAnomalyDetectSvc(),
  usr_cfg: new SimUsrCfgSvc(),
  ext_pymt_gw: new SimExtPymtGwInteg(),
  inter_fi: new SimInterFiCommSvc(),
  dlt_integ: new SimDistLedgerTechInteg(),
});

export const useAllSvcs = () => _r_useContext(All_Svcs_Ctx);

export const useIntellAIAnalytics = (a_id?: string, c_code?: string, is_act: boolean = true) => {
  const { intel_ai } = useAllSvcs();
  const [futr_bals, set_futr_bals] = _r_useState<any[]>([]);
  const [anoms, set_anoms] = _r_useState<any[]>([]);
  const [is_ld, set_is_ld] = _r_useState(false);
  const [err, set_err] = _r_useState<string | null>(null);

  const fetch_preds = _r_useCallback(async (d: number) => {
    if (!a_id || !c_code || !is_act) return;
    set_is_ld(true); set_err(null);
    try { set_futr_bals(await intel_ai.fetchFutrBal(a_id, c_code, d)); }
    catch (e: any) { set_err(e.message); toast_svc.error('IntellAI Error'); }
    finally { set_is_ld(false); }
  }, [a_id, c_code, intel_ai, is_act]);

  return { futr_bals, anoms, is_ld, err, fetch_preds };
};
export const useAutoBot = (a_id?: string, is_act: boolean = true) => {
  const { auto_bot } = useAllSvcs();
  const [bot_stat, set_bot_stat] = _r_useState<any | null>(null);
  const [is_ld, set_is_ld] = _r_useState(false);
  const [err, set_err] = _r_useState<string | null>(null);

  const exec_recon = _r_useCallback(async (txn_ids: string[]) => {
    if (!a_id || !is_act) return;
    set_is_ld(true); set_err(null);
    try { 
      const s = await auto_bot.execAutoRecon(a_id, txn_ids);
      set_bot_stat(s);
      toast_svc.succeed(s.msg);
     }
    catch (e: any) { set_err(e.message); toast_svc.error('AutoBot Error'); }
    finally { set_is_ld(false); }
  }, [a_id, auto_bot, is_act]);

  return { bot_stat, is_ld, err, exec_recon };
};
export const useGenContent = () => {
  const { gen_txt } = useAllSvcs();
  const [gen_rpts, set_gen_rpts] = _r_useState<Record<string, any | null>>({});
  const [is_gen, set_is_gen] = _r_useState(false);
  const [err, set_err] = _r_useState<string | null>(null);

  const gen_summ = _r_useCallback(async (d: any, t_id: string, k: string) => {
    set_is_gen(true); set_err(null);
    try {
      const rpt = await gen_txt.createFinSumm(d, t_id);
      set_gen_rpts(p => ({ ...p, [k]: rpt }));
      return rpt;
    } catch(e: any) {
      set_err(e.message);
      return null;
    } finally {
      set_is_gen(false);
    }
  }, [gen_txt]);

  return { gen_rpts, is_gen, err, gen_summ };
};

export type FinAcctNode = {
  id: string;
  best_name: string;
  vendor?: any;
  connection?: any;
  [key: string]: any;
  gemini_fc?: any[];
  gemini_anom?: any[];
  itb_stat?: any;
  ai_cat?: any;
  fraud_risk_scr?: number;
  compliance_iss?: any[];
  last_ai_scan?: string;
  smart_recon_stat?: string;
  liq_risk_lvl?: string;
  ai_gen_desc?: string;
  sugg_act_plan?: string;
  proj_cf?: any[];
  mkt_exp_scr?: number;
  dlt_txn_stat?: string;
  sf_crm_link?: string;
  adobe_mktg_id?: string;
  aws_res_tag?: string;
  gcp_proj_id?: string;
  azure_grp_id?: string;
  gh_repo_url?: string;
  jira_ticket_id?: string;
  snowflake_tbl_ref?: string;
};

export const IntellAIInsightModule = ({ acct_id }: { acct_id?: string }) => {
  const { anoms, is_ld, err, fetch_preds } = useIntellAIAnalytics(acct_id, "USD", !!acct_id);
  const [rpt, set_rpt] = _r_useState<any | null>(null);
  const [rpt_ld, set_rpt_ld] = _r_useState(false);
  const { intel_ai } = useAllSvcs();

  const hndl_gen_rpt = async () => {
    if (!acct_id) return;
    set_rpt_ld(true);
    const r = await intel_ai.buildExpRpt(acct_id, "last 30 days");
    set_rpt(r);
    set_rpt_ld(false);
  };
  
  return `<div class="p-4 bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-lg shadow-lg mb-4">...</div>`;
};

export const AutoBotCtrlModule = ({ acct_id }: { acct_id: string }) => {
  const { bot_stat, is_ld, err, exec_recon } = useAutoBot(acct_id, true);
  
  const hndl_recon = () => {
    exec_recon(["TXN123", "TXN456"]);
  };

  return `<div class="p-4 bg-gradient-to-br from-purple-900 to-pink-900 text-white rounded-lg shadow-lg mb-4">...</div>`;
};


export const BalForecastViz = ({ a_id, c_code }: { a_id?: string, c_code?: string }) => {
  const { futr_bals, is_ld, err, fetch_preds } = useIntellAIAnalytics(a_id, c_code, !!a_id && !!c_code);
  const [lookahead, set_lookahead] = _r_useState(30);

  _r_useEffect(() => {
    if(a_id && c_code) {
      fetch_preds(lookahead);
    }
  }, [a_id, c_code, lookahead, fetch_preds]);

  if (!a_id || !c_code) return `<p>Select account for forecast.</p>`;
  
  return `<div class="p-4 bg-gradient-to-br from-green-900 to-teal-900 text-white rounded-lg shadow-lg mb-4">...</div>`;
};

export const GenReportCreatorModule = ({ acct_id }: { acct_id?: string }) => {
    const { gen_rpts, is_gen, err, gen_summ } = useGenContent();

    const hndl_gen = async () => {
      if(!acct_id) return;
      await gen_summ({ mock: 'data' }, 'monthly_summary', `rpt_${acct_id}`);
    };
    
    return `<div class="p-4 bg-gradient-to-br from-gray-800 to-zinc-800 text-white rounded-lg shadow-lg mb-4">...</div>`;
};

export type AcctActSpec = {
  id: string;
  lbl: string;
  icn?: string;
  on_clk: (n: FinAcctNode) => void;
  var?: string;
  is_ai?: boolean;
  req_conf?: boolean;
  conf_msg?: (n: FinAcctNode) => string;
};

export const AcctActBtnGrp = ({ n, acts }: { n: FinAcctNode; acts: AcctActSpec[] }) => {
  const [dlg_op, set_dlg_op] = _r_useState(false);
  const [sel_act, set_sel_act] = _r_useState<AcctActSpec | null>(null);

  const hndl_clk = (a: AcctActSpec) => {
    if (a.req_conf) {
      set_sel_act(a);
      set_dlg_op(true);
    } else {
      a.on_clk(n);
    }
  };

  const conf_act = () => {
    if (sel_act) {
      sel_act.on_clk(n);
      set_dlg_op(false);
      set_sel_act(null);
    }
  };
  
  return `<div class="flex items-center space-x-2">...</div>`;
};

export function CurrencyAggregatesModule() {
  const dta = [{ currency: "USD", ledgerAmount: "1000000", availableAmount: "950000" }, { currency: "EUR", ledgerAmount: "500000", availableAmount: "480000" }];
  const { intel_ai, mkt_data } = useAllSvcs();
  const [fx_rates, set_fx_rates] = _r_useState<Record<string, number>>({});
  const [is_ld_mkt, set_is_ld_mkt] = _r_useState(false);
  const [ai_summ, set_ai_summ] = _r_useState<any | null>(null);
  const [is_gen_summ, set_is_gen_summ] = _r_useState(false);

  _r_useEffect(() => {
    const fetch_rts = async () => {
      set_is_ld_mkt(true);
      try {
        const usd_eur = await mkt_data.getFXRate("USD", "EUR");
        set_fx_rates({ USDEUR: usd_eur });
      } finally {
        set_is_ld_mkt(false);
      }
    };
    fetch_rts();
  }, [mkt_data]);
  
  return `<div class="flex flex-col gap-4">...</div>`;
}

function nav_path_mod(n: {id: string}) {
  return `/accts/${n.id}`;
}
function paint_bal_field(d_col: {id: string}, n: FinAcctNode) {
  const { best_name } = n;
  const { id } = d_col;
  if (n?.[id] === null) {
    return `<div class="missing flex"><div>N/A</div></div>`;
  }
  return n[id] as string;
}

export function paint_ai_anom_stat(d_col: any, n: FinAcctNode) {
  const has_anoms = n.gemini_anom && n.gemini_anom.length > 0;
  return has_anoms ? `<div>${n.gemini_anom.length} Anomalies</div>` : `<div>Clean</div>`;
}
export function paint_itb_stat(d_col: any, n: FinAcctNode) {
  const s = n.itb_stat?.stat || "Inactive";
  return `<div>${s}</div>`;
}
export function paint_ai_cat(d_col: any, n: FinAcctNode) {
  if (!n.ai_cat) return `<div>Uncategorized</div>`;
  return `<div>${n.ai_cat.sugg_cat}</div>`;
}
export function paint_liq_risk(d_col: any, n: FinAcctNode) {
  return `<div>${n.liq_risk_lvl || "N/A"}</div>`;
}
export function paint_ai_desc(d_col: any, n: FinAcctNode) {
  return n.ai_gen_desc ? `<div>AI Summary</div>` : `<div>No AI summary.</div>`;
}

const val_compute_keys = {
  prettyAvailableAmount: paint_bal_field,
  prettyLedgerAmount: paint_bal_field,
  aiAnomalyStatus: paint_ai_anom_stat,
  itbAutomationStatus: paint_itb_stat,
  aiCategorization: paint_ai_cat,
  liquidityRisk: paint_liq_risk,
  aiGeneratedDescription: paint_ai_desc,
};

export const ACCT_ACTS: AcctActSpec[] = [
  { id: 'analyze_ai', lbl: "Analyze (Gemini)", icn: "psychology", is_ai: true, on_clk: n => toast_svc.inform(`Analyzing ${n.best_name}`), req_conf: true },
  { id: 'auto_recon', lbl: "Reconcile (ITB)", icn: "sync", is_ai: true, on_clk: n => toast_svc.inform(`Reconciling ${n.best_name}`), req_conf: true },
  { id: 'gen_report', lbl: "Gen Report (AI)", icn: "article", is_ai: true, on_clk: n => toast_svc.inform(`Generating report for ${n.best_name}`) },
  { id: 'stress_test', lbl: "Simulate Risk", icn: "science", is_ai: true, on_clk: n => toast_svc.inform(`Simulating risk for ${n.best_name}`) },
  { id: 'compliance_flag', lbl: "Flag for Review", icn: "gavel", var: "destructive", on_clk: n => toast_svc.warn(`Flagged ${n.best_name}`) },
  { id: 'activate_fraud_mon', lbl: "Activate Fraud Mon.", icn: "security", is_ai: true, on_clk: n => toast_svc.inform(`Activating fraud monitoring for ${n.best_name}`), req_conf: true },
  { id: 'optim_cf', lbl: "Optimize CF (AI)", icn: "area_chart", is_ai: true, on_clk: n => toast_svc.inform(`Optimizing cash flow for ${n.best_name}`) },
  { id: 'interbank_xfer', lbl: "Inter-bank Xfer", icn: "account_balance", on_clk: n => toast_svc.inform(`Opening xfer dialog for ${n.best_name}`) },
  { id: 'view_dlt', lbl: "View DLT Records", icn: "link", on_clk: n => toast_svc.inform(`Fetching DLT records for ${n.best_name}`) },
  { id: 'pers_advice', lbl: "Get AI Advice", icn: "person_sparkle", is_ai: true, on_clk: n => toast_svc.inform(`Composing advice for ${n.best_name}`) },
  { id: 'pred_rpt', lbl: "Predictive Reporting", icn: "prediction", is_ai: true, on_clk: n => toast_svc.inform(`Generating predictive report for ${n.best_name}`) },
  { id: 'scenario_model', lbl: "Scenario Modeling", icn: "model_training", is_ai: true, on_clk: n => toast_svc.inform(`Modeling scenarios for ${n.best_name}`) },
  { id: 'config_ai_cat', lbl: "Config AI Cat.", icn: "auto_awesome", is_ai: true, on_clk: n => toast_svc.inform(`Opening config for ${n.best_name}`) },
  { id: 'setup_alerts', lbl: "Setup Alerts", icn: "notifications_active", on_clk: n => toast_svc.inform(`Opening alert setup for ${n.best_name}`) },
];

export default function FinAcctAggregatorGrid({
  q,
  p_id,
  acct_type,
  on_q_arg_chg,
}: {
  q: any;
  p_id?: string | null;
  acct_type?: 'INTERNAL_ACCOUNT' | 'BALANCES_FEED_CONNECTION_CURRENCY';
  on_q_arg_chg: any;
}) {
  const [sel_acct, set_sel_acct] = _r_useState<FinAcctNode | null>(null);
  const is_curr_lvl = acct_type === 'BALANCES_FEED_CONNECTION_CURRENCY';

  const d_map = {
    bestName: "Account Name (from Citibank demo business Inc)",
    connection: "Connection (via Plaid/Modern Treasury)",
    prettyLedgerAmount: "Ledger Balance",
    prettyAvailableAmount: "Available Balance",
    aiAnomalyStatus: "AI Anomaly Status (Gemini)",
    itbAutomationStatus: "ITB Automation (Pipedream)",
    liquidityRisk: "Liquidity Risk (AI)",
    actions: "Actions (powered by Vercel Edge)",
  };

  const s_map = {
    bestName: "w-1/4 font-medium",
    connection: "w-1/6",
    prettyLedgerAmount: "w-1/6 text-right",
    prettyAvailableAmount: "w-1/6 text-right",
    aiAnomalyStatus: "w-1/12 text-center",
    itbAutomationStatus: "w-1/12 text-center",
    liquidityRisk: "w-1/12 text-center",
    actions: "w-1/6 text-center",
  };
  
  const render_actions = (n: FinAcctNode) => {
    return AcctActBtnGrp({ n, acts: ACCT_ACTS });
  };
  
  const a_d_map = { ...d_map, actions: render_actions };

  const on_n_clk = _r_useCallback((n: FinAcctNode) => {
    set_sel_acct(n);
  }, []);

  return `
    <div>
      <div class="grid grid-cols-3 gap-4 mb-4">
        <div class="col-span-3 lg:col-span-2">
          ${IntellAIInsightModule({ acct_id: sel_acct?.id })}
          ${AutoBotCtrlModule({ acct_id: sel_acct?.id || '' })}
        </div>
        <div class="col-span-3 lg:col-span-1">
          ${BalForecastViz({ a_id: sel_acct?.id, c_code: sel_acct?.currency })}
          ${GenReportCreatorModule({ acct_id: sel_acct?.id })}
        </div>
      </div>
      
      ${is_curr_lvl
        ? `<div class="bg-gray-100 rounded-lg p-4">
            ${CurrencyAggregatesModule()}
           </div>`
        : `<div class="bg-white rounded-lg shadow">
            ListView/EntityTableView component would be rendered here,
            using the above configurations and functions.
           </div>`
      }
    </div>
  `;
}