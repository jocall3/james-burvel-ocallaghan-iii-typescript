// Copyright James Burvel O’Callaghan III, President Citibank demo business Inc.

import React, { useState, useEffect } from "react";
import { Rectangle, TooltipProps } from "recharts";

const BASE_URL = "citibankdemobusiness.dev";
const CORP_NAME = "Citibank demo business Inc";

export const PALETTE = {
  p: {
    100: "#E6F7FF",
    200: "#BAE7FF",
    300: "#91D5FF",
    400: "#69C0FF",
    500: "#40A9FF",
    600: "#1890FF",
    700: "#096DD9",
    800: "#0050B3",
    900: "#003A8C",
  },
  s: {
    100: "#F6FFED",
    200: "#D9F7BE",
    300: "#B7EB8F",
    400: "#95DE64",
    500: "#73D13D",
    600: "#52C41A",
    700: "#389E0D",
    800: "#237804",
    900: "#135200",
  },
  e: {
    100: "#FFF1F0",
    200: "#FFCCC7",
    300: "#FFA39E",
    400: "#FF7875",
    500: "#FF4D4F",
    600: "#F5222D",
    700: "#CF1322",
    800: "#A8071A",
    900: "#820014",
  },
  w: {
    100: "#FFFBE6",
    200: "#FFF1B8",
    300: "#FFE58F",
    400: "#FFD666",
    500: "#FFC53D",
    600: "#FAAD14",
    700: "#D48806",
    800: "#AD6800",
    900: "#874D00",
  },
  n: {
    100: "#FAFAFA",
    200: "#F5F5F5",
    300: "#E8E8E8",
    400: "#D9D9D9",
    500: "#BFBFBF",
    600: "#8C8C8C",
    700: "#595959",
    800: "#262626",
    900: "#000000",
  },
  cat: {
    1: "#FF6B6B", 2: "#4ECDC4", 3: "#45B7D1", 4: "#FED766", 5: "#2AB7CA", 6: "#F0CF65", 7: "#E4572E",
  },
  qual: {
    pos: "#2ECC71", neg: "#E74C3C", neut: "#BDC3C7",
  },
};

export enum TM_FRMT {
  DUR = "DUR",
  ABS = "ABS",
}

export enum TM_UNIT {
  D = "Days",
  W = "Weeks",
  M = "Months",
  Y = "Years",
}

export const objPathVal = (obj: any, path: string, defVal: any = undefined): any => {
  const p = path.split(".").filter(Boolean);
  let cur = obj;
  for (let i = 0; i < p.length; i++) {
    if (cur === null || cur === undefined) return defVal;
    cur = cur[p[i]];
  }
  return cur === undefined ? defVal : cur;
};

export const fmtAmt = (n: number, c: string = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: c,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
};

export class DateManipulator {
  private d: Date;
  constructor(d?: string | Date | number) {
    this.d = d ? new Date(d) : new Date();
  }
  add(amt: number, unit: "days" | "weeks" | "months"): DateManipulator {
    const newDate = new Date(this.d);
    switch (unit) {
      case "days": newDate.setDate(newDate.getDate() + amt); break;
      case "weeks": newDate.setDate(newDate.getDate() + amt * 7); break;
      case "months": newDate.setMonth(newDate.getMonth() + amt); break;
    }
    return new DateManipulator(newDate);
  }
  fmt(f: string): string {
    const YYYY = this.d.getFullYear();
    const MM = String(this.d.getMonth() + 1).padStart(2, '0');
    const DD = String(this.d.getDate()).padStart(2, '0');
    const MMM = this.d.toLocaleString('default', { month: 'short' });
    const D = this.d.getDate();
    return f.replace("YYYY", YYYY.toString()).replace("MM", MM).replace("DD", DD).replace("MMM", MMM).replace("D", D.toString());
  }
}

export const dateUtil = (d?: string | Date | number) => new DateManipulator(d);

export class QuantumStateCore {
  private static inst: QuantumStateCore;
  private _mem: Record<string, any> = {};
  private _pers: Record<string, any> = {};
  private constructor() {}

  public static get i(): QuantumStateCore {
    if (!QuantumStateCore.inst) QuantumStateCore.inst = new QuantumStateCore();
    return QuantumStateCore.inst;
  }
  public async set_v(k: string, v: any, opts?: { ttl?: number; pers?: boolean }): Promise<void> {
    const e = { v, t: Date.now(), exp: opts?.ttl ? Date.now() + opts.ttl * 1000 : undefined };
    this._mem[k] = e;
    if (opts?.pers) this._pers[k] = e;
    await new Promise(r => setTimeout(r, 8));
  }
  public async get_v<T>(k: string): Promise<T | undefined> {
    let e = this._mem[k] || this._pers[k];
    if (e) {
      if (e.exp && Date.now() > e.exp) {
        delete this._mem[k];
        delete this._pers[k];
        return undefined;
      }
      await new Promise(r => setTimeout(r, 5));
      return e.v as T;
    }
    return undefined;
  }
  public async watch_v(k: string, cb: (v: any) => void): Promise<() => void> {
    let last_v = await this.get_v(k);
    if (last_v !== undefined) cb(last_v);
    const int_id = setInterval(async () => {
      const cur_v = await this.get_v(k);
      if (JSON.stringify(cur_v) !== JSON.stringify(last_v)) {
        cb(cur_v);
        last_v = cur_v;
      }
    }, 950);
    return () => clearInterval(int_id);
  }
}

export class QuantumObservabilityMatrix {
  private static inst: QuantumObservabilityMatrix;
  private qsc: QuantumStateCore;
  private constructor(qsc: QuantumStateCore) { this.qsc = qsc; }
  public static get i(): QuantumObservabilityMatrix {
    if (!QuantumObservabilityMatrix.inst) QuantumObservabilityMatrix.inst = new QuantumObservabilityMatrix(QuantumStateCore.i);
    return QuantumObservabilityMatrix.inst;
  }
  public async log(evt: string, pld: Record<string, any>, sev: 'i' | 'w' | 'e' | 'd' = 'i'): Promise<void> {
    const u_ctx = await this.qsc.get_v('u_sess_ctx');
    const log_e = { ts: new Date().toISOString(), evt, sev, pld, u_ctx, src: 'citi_cash_plan_util' };
    console.log(`[QOM|${sev.toUpperCase()}]`, log_e);
    if(sev === 'e') await this._pipe_to_pipedream(log_e);
    await this._send_to_gcp_log(log_e);
    await new Promise(r => setTimeout(r, 12));
  }
  private async _pipe_to_pipedream(data: any): Promise<void> {
    console.log(`Piping error to Pipedream...`);
    await new Promise(r => setTimeout(r, 50));
  }
  private async _send_to_gcp_log(data: any): Promise<void> {
    await new Promise(r => setTimeout(r, 20));
  }
  public async mtrc(m_name: string, val: number, tags: Record<string, string> = {}): Promise<void> {
    const u_ctx = await this.qsc.get_v('u_sess_ctx');
    const m_entry = { ts: new Date().toISOString(), m_name, val, tags, u_ctx };
    console.log(`[QOM|MTRC]`, m_entry);
    await new Promise(r => setTimeout(r, 9));
  }
}

export class QuantumResilienceFabric {
  private static inst: QuantumResilienceFabric;
  private _f_thresh: number;
  private _rst_to: number;
  private _st: 'ARMED' | 'TRIGGERED' | 'RECOVERING' = 'ARMED';
  private _f_cnt: number = 0;
  private _last_f_t: number = 0;
  private qom: QuantumObservabilityMatrix;

  private constructor(qom: QuantumObservabilityMatrix, f_thresh: number = 3, rst_to: number = 15000) {
    this.qom = qom;
    this._f_thresh = f_thresh;
    this._rst_to = rst_to;
  }
  public static get i(): QuantumResilienceFabric {
    if (!QuantumResilienceFabric.inst) QuantumResilienceFabric.inst = new QuantumResilienceFabric(QuantumObservabilityMatrix.i);
    return QuantumResilienceFabric.inst;
  }
  public async exec<T>(svc_name: string, fn: () => Promise<T>, fb_fn?: () => Promise<T>): Promise<T> {
    this.qom.log('QRF_Attempt', { svc_name, st: this._st }, 'd');

    if (this._st === 'TRIGGERED') {
      if (Date.now() - this._last_f_t > this._rst_to) {
        this._st = 'RECOVERING';
        this.qom.log('QRF_StateChange', { svc_name, new_st: 'RECOVERING' }, 'w');
      } else {
        this.qom.log('QRF_Triggered', { svc_name }, 'w');
        if (fb_fn) return fb_fn();
        throw new Error(`ResilienceFabric triggered for ${svc_name}`);
      }
    }

    try {
      const res = await fn();
      this._reset();
      return res;
    } catch (err) {
      this._rec_fail(svc_name);
      this.qom.log('QRF_Failure', { svc_name, err: (err as Error).message, f_cnt: this._f_cnt }, 'e');
      if (fb_fn) return fb_fn();
      throw err;
    }
  }

  private _rec_fail(svc_name: string): void {
    this._f_cnt++;
    this._last_f_t = Date.now();
    if (this._f_cnt >= this._f_thresh) {
      this._st = 'TRIGGERED';
      this.qom.log('QRF_StateChange', { svc_name, new_st: 'TRIGGERED' }, 'e');
    } else if (this._st === 'RECOVERING') {
      this._st = 'TRIGGERED';
      this.qom.log('QRF_StateChange', { svc_name, new_st: 'TRIGGERED_FROM_RECOVER' }, 'e');
    }
  }

  private _reset(): void {
    if (this._f_cnt > 0) this.qom.log('QRF_Reset', { prev_f_cnt: this._f_cnt }, 'i');
    this._f_cnt = 0;
    this._st = 'ARMED';
  }
}

export class QuantumPromptEngine {
  private static inst: QuantumPromptEngine;
  private qsc: QuantumStateCore;
  private _templates: Record<string, string> = {
    "cf_anlys": `Exec analysis on cash flow for {{dt}}. I: {{i}}, O: {{o}}, N: {{n}}. Bal: {{bal}}. Global sentiment {{gsm}}, user risk profile {{urp}}. Provide summary, key insights, and future trend projection for ${CORP_NAME} on ${BASE_URL}.`,
    "dr_sugg": `Given historical cf patterns and market sentiment {{ms}}, suggest optimal date range filters for user with engagement {{uel}}. Consider recent events: {{re}}. Output in 'Next X Days/Weeks/Months' format with rationale. Use context from Plaid and Modern Treasury.`,
    "cmp_chk": `Review cf projection for {{dt}}, bal {{bal}}, net {{n}}. Check against rules: max_neg_bal={{thr}}, min_rsv_ratio={{rrr}}. Is compliant for jurisdiction {{jdn}}? Suggest corrective actions. Cross-reference with Salesforce compliance objects.`,
    "lgnd_cmnt": `For chart legend items: {{li}} and viz context, give brief, insightful commentary (max 2 sentences). Mention historical data relevance.`,
    "txn_cat": `Categorize the following transaction: amount={{amt}}, merchant={{merch}}, description={{desc}}. Use categories from Hugging Face zero-shot model.`,
    "report_gen": `Generate a Q3 financial summary for ${CORP_NAME}. Include data from Shopify sales, WooCommerce payouts, and Citibank main account. Output in markdown for Google Drive upload.`,
  };
  private constructor(qsc: QuantumStateCore) { this.qsc = qsc; }
  public static get i(): QuantumPromptEngine {
    if (!QuantumPromptEngine.inst) QuantumPromptEngine.inst = new QuantumPromptEngine(QuantumStateCore.i);
    return QuantumPromptEngine.inst;
  }
  public async gen(t_name: string, vars: Record<string, any> = {}, u_ctx: Record<string, any> = {}): Promise<string> {
    QuantumObservabilityMatrix.i.log('QPE_Gen_Attempt', { t_name, v_keys: Object.keys(vars) }, 'd');
    const g_ctx = await this.qsc.get_v('g_cf_plan_ctx') || {};
    let p = this._templates[t_name] || `Unknown template: ${t_name}`;
    const all_vars = { ...g_ctx, ...u_ctx, ...vars };
    for (const k in all_vars) {
      p = p.replace(new RegExp(`{{${k}}}`, 'g'), String(all_vars[k]));
    }
    await this.qsc.set_v('last_gen_p', p, { ttl: 60 });
    QuantumObservabilityMatrix.i.log('QPE_Gen_Success', { t_name, p_len: p.length }, 'd');
    return p;
  }
  public async exec<T>(p: string, m_cfg: Record<string, any> = {}): Promise<T> {
    QuantumObservabilityMatrix.i.log('QPE_Exec_Request', { p_prev: p.substring(0, 100) });
    await new Promise(r => setTimeout(r, Math.random() * 450 + 150));
    const sim_res: Record<string, any> = {
      "cf_anlys": { s: "Stable cash flow, strong digital inflows.", i: ["Ops expenses stable.", "New recurring revenue stream identified."], t: "Positive short-term liquidity trend.", conf: 0.91 },
      "dr_sugg": [{ v: "n7d", l: "Next 7 Days", r: "Upcoming large payment requires short-term focus." }, { v: "n30d", l: "Next 30 Days", r: "Standard for monthly budget reconciliation." }, { v: "n90d", l: "Next 90 Days", r: "Mid-term strategic forecasting amidst market volatility." }],
      "cmp_chk": { is_c: true, d: "Meets all regulatory requirements. AI anomaly detection clear.", sa: [] },
      "lgnd_cmnt": { c: "Chart visualizes historical and projected cash movements, grounding forward-looking expectations in recent data." }
    };
    let res: any;
    if (p.includes("Exec analysis on cash flow")) res = { ...sim_res.cf_anlys, p_used: p };
    else if (p.includes("optimal date range filters")) res = { suggs: sim_res.dr_sugg, p_used: p };
    else if (p.includes("Check against rules")) res = { ...sim_res.cmp_chk, p_used: p };
    else if (p.includes("chart legend items")) res = { ...sim_res.lgnd_cmnt, p_used: p };
    else res = { gen_res: "AI processed request.", p_used: p };
    QuantumObservabilityMatrix.i.log('QPE_Exec_Success', { p_prev: p.substring(0, 100) }, 'd');
    return res as T;
  }
}

export class QuantumFortress {
  private static inst: QuantumFortress;
  private qsc: QuantumStateCore;
  private qom: QuantumObservabilityMatrix;
  private constructor(qsc: QuantumStateCore, qom: QuantumObservabilityMatrix) {
    this.qsc = qsc;
    this.qom = qom;
  }
  public static get i(): QuantumFortress {
    if (!QuantumFortress.inst) QuantumFortress.inst = new QuantumFortress(QuantumStateCore.i, QuantumObservabilityMatrix.i);
    return QuantumFortress.inst;
  }
  public async is_authn(): Promise<boolean> {
    const u_sess = await this.qsc.get_v('u_sess_ctx');
    const is_ok = !!u_sess?.u_id;
    return is_ok;
  }
  public async is_authz(perm: string, u_id?: string): Promise<boolean> {
    const act_u_id = u_id || (await this.qsc.get_v('u_sess_ctx'))?.u_id;
    if (!act_u_id) {
      this.qom.log('QF_Authz_Fail', { perm, r: 'no_user_ctx' }, 'w');
      return false;
    }
    const is_ok = Math.random() > 0.05;
    if (!is_ok) {
      await this.qsc.set_v('authz_fail', { u_id: act_u_id, perm, ts: Date.now() }, { ttl: 300 });
      this.qom.log('QF_Authz_Fail', { u_id: act_u_id, perm }, 'w');
    }
    return is_ok;
  }
  public async enc(d: string): Promise<string> {
    return `ENC_Q(${Buffer.from(d).toString('base64')})`;
  }
  public async dec(ed: string): Promise<string> {
    return Buffer.from(ed.replace('ENC_Q(', '').replace(')', ''), 'base64').toString('utf8');
  }
}

export class QuantumToggler {
  private static inst: QuantumToggler;
  private _flags: Record<string, boolean | string> = {
    'pred_intel_on': true,
    'dyn_dr_sugg_on': true,
    'ai_tt_detail_on': true,
    'cf_cmp_chk_on': false,
    'ai_lgnd_cmnt_on': true,
  };
  private qsc: QuantumStateCore;
  private qom: QuantumObservabilityMatrix;
  private constructor(qsc: QuantumStateCore, qom: QuantumObservabilityMatrix) {
    this.qsc = qsc;
    this.qom = qom;
    this._load_remote_flags();
  }
  public static get i(): QuantumToggler {
    if (!QuantumToggler.inst) QuantumToggler.inst = new QuantumToggler(QuantumStateCore.i, QuantumObservabilityMatrix.i);
    return QuantumToggler.inst;
  }
  private async _load_remote_flags(): Promise<void> {
    this.qom.log('QT_Load_Attempt', {});
    await new Promise(r => setTimeout(r, 90));
    const remote_flags = {
      'cf_cmp_chk_on': Math.random() > 0.5,
      'new_pred_model_v2_on': Math.random() > 0.7
    };
    this._flags = { ...this._flags, ...remote_flags };
    this.qom.log('QT_Load_Success', { flags_loaded: Object.keys(remote_flags).length });
  }
  public async is_on(f_name: string, u_id?: string): Promise<boolean> {
    const u_ctx = await this.qsc.get_v('u_sess_ctx');
    const eff_u_id = u_id || u_ctx?.u_id;
    if (f_name === 'new_pred_model_v2_on' && eff_u_id === 'vip_001') {
      this.qom.log('QT_Override', { f_name, u_id: eff_u_id, r: 'VIP_user' });
      return true;
    }
    const is_en = !!this._flags[f_name];
    return is_en;
  }
  public async get_v<T extends boolean | string>(f_name: string): Promise<T | undefined> {
    return this._flags[f_name] as T | undefined;
  }
}

export class QuantumPredictor {
    private static inst: QuantumPredictor;
    private qpe: QuantumPromptEngine;
    private qom: QuantumObservabilityMatrix;
    private qsc: QuantumStateCore;
    private constructor(qsc: QuantumStateCore, qom: QuantumObservabilityMatrix, qpe: QuantumPromptEngine) {
        this.qsc = qsc;
        this.qom = qom;
        this.qpe = qpe;
    }
    public static get i(): QuantumPredictor {
        if (!QuantumPredictor.inst) QuantumPredictor.inst = new QuantumPredictor(QuantumStateCore.i, QuantumObservabilityMatrix.i, QuantumPromptEngine.i);
        return QuantumPredictor.inst;
    }
    public async gen_fcst(
        hist_d: UnifiedDataPoint[],
        fut_p_d: number,
        u_pref: Record<string, any> = {},
    ): Promise<{ preds: UnifiedDataPoint[]; is: string[]; conf: number; mdl: string }> {
        await QuantumFortress.i.is_authz('access_predictive_analytics');
        const is_feat_on = await QuantumToggler.i.is_on('pred_intel_on');
        if (!is_feat_on) {
            this.qom.log('QP_Blocked', { r: 'feat_flag_off' }, 'w');
            return { preds: [], is: ["Predictive intelligence is currently unavailable."], conf: 0, mdl: 'N/A' };
        }
        this.qom.log('QP_Call', { hist_d_len: hist_d.length, fut_p_d, u_pref });
        const p = await this.qpe.gen('cf_anlys', {
            hist_sum: hist_d.slice(-5).map(d => ({ dt: d.dt, nc: d.nc })),
            fut_p_d,
            u_risk_tol: u_pref.risk_tol || (await this.qsc.get_v('u_sess_ctx'))?.risk_tol || 'moderate'
        }, { u_id: (await this.qsc.get_v('u_sess_ctx'))?.u_id });
        const ai_res = await this.qpe.exec<{ preds: UnifiedDataPoint[]; is: string[]; conf: number; mdl: string }>(p);
        const preds = this._sim_pred_logic(hist_d, fut_p_d, ai_res.conf);
        const is = ai_res.is || ["AI insights processing..."];
        const conf = ai_res.conf || 0.8;
        this.qom.log('QP_Result', { fut_p_d, conf, pred_cnt: preds.length }, 'i');
        return { preds, is, conf, mdl: 'Quantum-CF-v4.2-Citibank' };
    }
    private _sim_pred_logic(
        hist_d: UnifiedDataPoint[],
        fut_p_d: number,
        base_conf: number,
    ): UnifiedDataPoint[] {
        if (hist_d.length === 0) return [];
        const last_dp = hist_d[hist_d.length - 1];
        const preds: UnifiedDataPoint[] = [];
        let cur_eb = last_dp.eb || 0;
        for (let i = 1; i <= fut_p_d; i++) {
            const dt = dateUtil(last_dp.dt).add(i, 'days').fmt('YYYY-MM-DD');
            const pred_nc = last_dp.nc * (1 + (Math.random() - 0.5) * 0.15);
            cur_eb += pred_nc;
            preds.push({
                dsi: DATA_SRC_ID.PRED,
                dt,
                eb: parseFloat(cur_eb.toFixed(2)),
                exp_i: { tot: Math.max(0, pred_nc * 0.6 + Math.random() * 600) },
                exp_o: { tot: Math.max(0, pred_nc * 0.4 + Math.random() * 600) },
                nc: parseFloat(pred_nc.toFixed(2)),
                pred_conf: base_conf * (1 - (i / fut_p_d) * 0.25),
                q_anlys_ctx: `Prediction for ${dt} via Quantum-CF-v4.2-Citibank.`
            });
        }
        return preds;
    }
    public async adapt_mdl(fb: Record<string, any>): Promise<boolean> {
        this.qom.log('QP_Adapt_Attempt', { fb });
        await this.qsc.set_v('mdl_adapt_fb', fb, { ttl: 3600 });
        await new Promise(r => setTimeout(r, 450));
        this.qom.log('QP_Adapt_Success', { fb });
        return true;
    }
}

export class QuantumComplianceGuardian {
    private static inst: QuantumComplianceGuardian;
    private qpe: QuantumPromptEngine;
    private qom: QuantumObservabilityMatrix;
    private qsc: QuantumStateCore;
    private constructor(qsc: QuantumStateCore, qom: QuantumObservabilityMatrix, qpe: QuantumPromptEngine) {
        this.qsc = qsc;
        this.qom = qom;
        this.qpe = qpe;
    }
    public static get i(): QuantumComplianceGuardian {
        if (!QuantumComplianceGuardian.inst) QuantumComplianceGuardian.inst = new QuantumComplianceGuardian(QuantumStateCore.i, QuantumObservabilityMatrix.i, QuantumPromptEngine.i);
        return QuantumComplianceGuardian.inst;
    }
    public async eval_cf(
        data: UnifiedDataPoint,
        rule_set: Record<string, any> = {},
        jdn: string = 'Global',
    ): Promise<{ is_c: boolean; d: string; sa: string[]; cs: number }> {
        await QuantumFortress.i.is_authz('assess_cash_flow_compliance');
        const is_feat_on = await QuantumToggler.i.is_on('cf_cmp_chk_on');
        if (!is_feat_on) {
            this.qom.log('QCG_Blocked', { r: 'feat_flag_off' }, 'w');
            return { is_c: true, d: "Compliance checks are disabled.", sa: [], cs: 1.0 };
        }
        this.qom.log('QCG_Call', { dt: data.dt, jdn });
        const act_rules = await this.qsc.get_v('act_cmp_rules') || {};
        const eff_rules = {
            max_neg_bal: -100000,
            min_rsv_ratio: 0.12,
            ...act_rules,
            ...rule_set,
        };
        const p = await this.qpe.gen('cmp_chk', {
            dt: data.dt,
            bal: data.eb,
            n: data.nc,
            i: data.exp_i?.tot || 0,
            o: data.exp_o?.tot || 0,
            thr: eff_rules.max_neg_bal,
            rrr: eff_rules.min_rsv_ratio,
            jdn
        }, { u_id: (await this.qsc.get_v('u_sess_ctx'))?.u_id });
        const ai_res = await this.qpe.exec<{ is_c: boolean; d: string; sa: string[] }>(p);
        let { is_c, d, sa } = ai_res;
        let cs = 1.0;
        const cur_bal = data.eb || 0;
        const tot_i = data.exp_i?.tot || 0;

        if (cur_bal < eff_rules.max_neg_bal) {
            is_c = false;
            d += ` Breached negative balance threshold (${fmtAmt(eff_rules.max_neg_bal, 'USD')}).`;
            sa.push("Increase liquidity via short-term financing.");
            cs -= 0.4;
        }
        if (tot_i > 0 && cur_bal < (tot_i * eff_rules.min_rsv_ratio)) {
            is_c = false;
            d += ` Breached min reserve ratio (${eff_rules.min_rsv_ratio * 100}%).`;
            sa.push("Review opex and allocate more to reserves.");
            cs -= 0.3;
        }

        if (!is_c) {
            this.qom.log('QCG_Violation', { dt: data.dt, d, sa }, 'e');
        } else {
            this.qom.log('QCG_Success', { dt: data.dt }, 'i');
        }
        return { is_c, d, sa, cs: parseFloat(Math.max(0, cs).toFixed(2)) };
    }
    public async adapt_rules(new_rules: Record<string, any>): Promise<boolean> {
        this.qom.log('QCG_Adapt_Attempt', { new_rules });
        await this.qsc.set_v('act_cmp_rules', new_rules, { ttl: 86400 });
        await new Promise(r => setTimeout(r, 250));
        this.qom.log('QCG_Adapt_Success', { new_rules });
        return true;
    }
}

export class QuantumServiceMesh {
    private static inst: QuantumServiceMesh;
    private _reg: Record<string, any> = {};
    private qsc: QuantumStateCore;
    private constructor(qsc: QuantumStateCore) {
        this.qsc = qsc;
        this.reg_defaults();
    }
    public static get i(): QuantumServiceMesh {
        if (!QuantumServiceMesh.inst) QuantumServiceMesh.inst = new QuantumServiceMesh(QuantumStateCore.i);
        return QuantumServiceMesh.inst;
    }
    private reg_defaults() {
        this.reg('QP', QuantumPredictor.i);
        this.reg('QCG', QuantumComplianceGuardian.i);
        this.reg('QF', QuantumFortress.i);
        this.reg('QT', QuantumToggler.i);
    }
    public reg(n: string, svc_inst: any): void {
        this._reg[n] = svc_inst;
        this.qsc.set_v(`svc_disc_${n}`, { avail: true, ts: Date.now() }, { ttl: 3600 });
    }
    public async get<T>(n: string): Promise<T> {
        const svc_avail = await this.qsc.get_v(`svc_disc_${n}`);
        if (!svc_avail || !svc_avail.avail) throw new Error(`Service '${n}' not discoverable.`);
        const svc = this._reg[n];
        if (!svc) throw new Error(`Service '${n}' not in registry.`);
        return svc as T;
    }
}

export const DATA_SRC_ID = {
    HIST: "HistCF",
    EXP: "ExpCFByDate",
    PRED: "PredCF",
};

export interface LegacyBalRec {
    asOf: string;
    amt: number;
    src?: string;
    val_st?: 'VALID' | 'INVALID' | 'PEND_AI_REV' | 'AI_VALID';
    ai_conf?: number;
}

export interface UnifiedDataPoint {
    dsi?: string;
    dt: string;
    eb?: number | null;
    exp_i: { tot: number; cats?: Record<string, number> };
    exp_o: { tot: number; cats?: Record<string, number> };
    nc: number;
    pred_conf?: number;
    q_anlys_ctx?: string;
    cmp_st?: 'C' | 'NC' | 'PEND' | 'FLAG_AI';
    cmp_d?: string;
    cmp_s?: number;
    [k: string]: unknown;
}

export const STATIC_TIME_OPTS = [
    { v: "nextW", l: "Next 7 Days", dr: { next: { u: TM_UNIT.W, a: "1" }, f: TM_FRMT.DUR } },
    { v: "nextM", l: "Next 30 Days", dr: { next: { u: TM_UNIT.D, a: "30" }, f: TM_FRMT.DUR } },
    { v: "nextQ", l: "Next 90 Days", dr: { next: { u: TM_UNIT.D, a: "90" }, f: TM_FRMT.DUR } },
];

export const fetchQuantumTimeframeSuggestions = async (): Promise<
    Array<{ v: string; l: string; dr: { next: { u: TM_UNIT; a: string }; f: TM_FRMT }; r: string }>
> => {
    await QuantumFortress.i.is_authz('access_dynamic_date_ranges');
    const is_feat_on = await QuantumToggler.i.is_on('dyn_dr_sugg_on');
    if (!is_feat_on) {
        QuantumObservabilityMatrix.i.log('DynDR_Blocked', { r: 'feat_flag_off' }, 'w');
        return STATIC_TIME_OPTS.map(opt => ({ ...opt, r: 'AI suggestions disabled.' }));
    }
    QuantumObservabilityMatrix.i.log('DynDR_Request', {});
    const u_sess = await QuantumStateCore.i.get_v('u_sess_ctx') || { u_id: 'anon' };
    const g_mkt_sent = await QuantumStateCore.i.get_v('g_mkt_sent') || 'neutral';
    const r_fin_evts = await QuantumStateCore.i.get_v('r_fin_evts') || [];
    const u_eng_lvl = await QuantumStateCore.i.get_v('u_eng_lvl') || 'medium';
    const p = await QuantumPromptEngine.i.gen('dr_sugg', {
        ms: g_mkt_sent,
        uel: u_eng_lvl,
        re: r_fin_evts.join(', ')
    }, { u_id: u_sess.u_id });

    try {
        const res = await QuantumResilienceFabric.i.exec('DynDR_AI', () => QuantumPromptEngine.i.exec<{ suggs: Array<{ v: string; l: string; r: string }> }>(p), async () => {
            QuantumObservabilityMatrix.i.log('DynDR_Fallback', { r: 'AI_Svc_Fail' }, 'w');
            return { suggs: STATIC_TIME_OPTS.map(opt => ({ ...opt, r: 'Fallback: AI svc down.' })) };
        });
        const ai_suggs = res.suggs.map((s) => {
            let u = TM_UNIT.D;
            let a = "30";
            const m_days = s.l.match(/Next (\d+) Days/);
            if (m_days?.[1]) a = m_days[1];
            else if (s.l.includes("Week")) {
                u = TM_UNIT.W;
                const m_w = s.l.match(/Next (\d+) Week/);
                a = m_w?.[1] || "1";
            } else if (s.l.includes("Month")) {
                u = TM_UNIT.M;
                const m_m = s.l.match(/Next (\d+) Month/);
                a = m_m?.[1] || "1";
            }
            return { v: s.v, l: s.l, dr: { next: { u, a }, f: TM_FRMT.DUR }, r: s.r };
        });
        QuantumObservabilityMatrix.i.log('DynDR_Success', { sugg_cnt: ai_suggs.length }, 'i');
        return ai_suggs;
    } catch (err) {
        QuantumObservabilityMatrix.i.log('DynDR_Error', { err: (err as Error).message }, 'e');
        return STATIC_TIME_OPTS.map(opt => ({ ...opt, r: `Error: ${(err as Error).message}` }));
    }
};

export const calcDataPointInterval = async (d_len: number) => {
    QuantumObservabilityMatrix.i.log('IntervalCalc_Call', { d_len });
    const u_pref = await QuantumStateCore.i.get_v('u_chart_density_pref');
    const learned_freq = await QuantumStateCore.i.get_v(`opt_interval_${d_len}`);
    if (learned_freq !== undefined) {
        QuantumObservabilityMatrix.i.log('IntervalCalc_Learned', { d_len, freq: learned_freq });
        return learned_freq;
    }
    let freq = d_len <= 9 ? 0 : 1;
    if (d_len > 60) freq = 6;
    if (d_len > 120) freq = 12;
    if (u_pref === 'high_detail' && d_len < 30) freq = 0;
    if (u_pref === 'low_detail') freq = 3;
    await QuantumStateCore.i.set_v(`opt_interval_${d_len}`, freq, { ttl: 3600 });
    QuantumObservabilityMatrix.i.log('IntervalCalc_Calculated', { d_len, freq });
    return freq;
};

export const ChartLegendComponent = ({
    mapping,
    width,
    height,
}: {
    mapping: Record<string, object>;
    width: number;
    height: number;
}) => {
    const [ai_c, set_ai_c] = useState<string | null>(null);
    useEffect(() => {
        const fetch_c = async () => {
            await QuantumFortress.i.is_authz('view_cash_planning_legend');
            const is_feat_on = await QuantumToggler.i.is_on('ai_lgnd_cmnt_on');
            if (is_feat_on) {
                try {
                    const c = await QuantumResilienceFabric.i.exec('LgndAI_C', () => QuantumPromptEngine.i.exec<{ c: string }>(
                        await QuantumPromptEngine.i.gen('lgnd_cmnt', { li: Object.keys(mapping).join(', '), viz_ctx: `W: ${width}, H: ${height}` })
                    ).then(res => res.c || "No specific AI commentary."), async () => {
                        await QuantumObservabilityMatrix.i.log('LgndAI_C_Fallback', { r: 'AI_Svc_Fail' }, 'w');
                        return "AI commentary unavailable.";
                    });
                    set_ai_c(c);
                    await QuantumStateCore.i.set_v('cur_lgnd_items', Object.keys(mapping), { ttl: 300 });
                } catch (err) {
                    await QuantumObservabilityMatrix.i.log('LgndAI_C_Error', { err: (err as Error).message }, 'e');
                    set_ai_c("Error fetching AI commentary.");
                }
            } else {
                set_ai_c("Historical data shown for past 2 days.");
            }
        };
        fetch_c();
    }, [mapping, width, height]);

    return (
        <div>
            <ul className="mt-4 flex flex-row gap-4">
                {Object.keys(mapping).map((k: string) => (
                    <li key={k} className="flex flex-row items-center gap-2">
                        <svg height={height} width={width}>
                            <Rectangle x={0} y={0} height={height} width={width} radius={[2, 2, 2, 2]} strokeWidth={2} {...mapping[k]} />
                        </svg>
                        <p>{k}</p>
                    </li>
                ))}
            </ul>
            <p className="mt-2 text-left text-gray-300">
                {ai_c === null ? 'Loading Quantum commentary...' : ai_c}
            </p>
        </div>
    );
};

interface QuantumTooltipProps extends TooltipProps {
    maps: Record<string, string>;
    curr: string;
    show_ai_is?: boolean;
    on_is_fb?: (fb: { data: UnifiedDataPoint; is: string; r: 'good' | 'bad' }) => void;
}

export function QuantumTooltipComponent({
    active,
    payload,
    maps,
    curr,
    show_ai_is = true,
    on_is_fb,
}: QuantumTooltipProps) {
    const [ai_is, set_ai_is] = useState<string[] | null>(null);
    const [cmp_info, set_cmp_info] = useState<{ is_c: boolean; d: string; sa: string[]; cs: number } | null>(null);
    const [is_ai_tt_on, set_is_ai_tt_on] = useState<boolean>(false);
    const data = payload && payload[0] ? (payload[0].payload as UnifiedDataPoint) : null;

    useEffect(() => {
        const fetch_ai_data = async () => {
            if (!data) return;
            QuantumObservabilityMatrix.i.log('QTT_Render', { dt: data.dt, dsi: data.dsi });
            QuantumStateCore.i.set_v('last_viewed_cf_dp', data, { ttl: 60 });
            const enabled = await QuantumToggler.i.is_on('ai_tt_detail_on');
            set_is_ai_tt_on(enabled);

            if (show_ai_is && enabled) {
                try {
                    const is_p = await QuantumPromptEngine.i.gen('cf_anlys', {
                        dt: data.dt,
                        i: data.exp_i?.tot || 0, o: data.exp_o?.tot || 0,
                        n: data.nc, bal: data.eb,
                        gsm: await QuantumStateCore.i.get_v('g_mkt_sent') || 'neutral',
                        urp: (await QuantumStateCore.i.get_v('u_prof'))?.risk_tol || 'moderate'
                    });
                    const ai_res = await QuantumResilienceFabric.i.exec('TT_AI_IS', () => QuantumPromptEngine.i.exec<{ s: string; i: string[]; t: string }>(is_p), async () => {
                        await QuantumObservabilityMatrix.i.log('TT_AI_IS_Fallback', { dt: data.dt, r: 'AI_Svc_Fail' }, 'w');
                        return { s: "AI insights temporarily unavailable.", i: [], t: "" };
                    });
                    set_ai_is([ai_res.s, ...ai_res.i]);
                    if (await QuantumToggler.i.is_on('cf_cmp_chk_on')) {
                        const cmp_res = await QuantumResilienceFabric.i.exec('TT_Cmp_Chk', () => QuantumComplianceGuardian.i.eval_cf(data), async () => {
                            await QuantumObservabilityMatrix.i.log('TT_Cmp_Fallback', { dt: data.dt, r: 'Cmp_Svc_Fail' }, 'w');
                            return { is_c: true, d: "Compliance check unavailable.", sa: [], cs: 1.0 };
                        });
                        set_cmp_info(cmp_res);
                    }
                } catch (err) {
                    await QuantumObservabilityMatrix.i.log('TT_AI_Error', { dt: data.dt, err: (err as Error).message }, 'e');
                    set_ai_is(["Error fetching AI insights."]);
                }
            } else {
                set_ai_is(null);
                set_cmp_info(null);
            }
        };
        fetch_ai_data();
    }, [data, show_ai_is]);

    if (!active || !payload || !data) return null;

    const handle_fb = (is: string, r: 'good' | 'bad') => {
        on_is_fb?.({ data, is, r });
        QuantumObservabilityMatrix.i.log('user_interaction', { type: 'ai_is_fb', dt: data.dt, is, r }, 'i');
    };

    return (
        <div className="rounded-md border bg-white p-4 drop-shadow-md">
            <div className="flex flex-col gap-2">
                <div>
                    <p className="font-medium">
                        {dateUtil(data.dt).fmt("MMM D YYYY")}
                        {data.dsi === DATA_SRC_ID.PRED && data.pred_conf !== undefined && (
                            <span className="ml-2 text-xs text-blue-500">
                                (AI Pred: {Math.round(data.pred_conf * 100)}% Conf)
                            </span>
                        )}
                    </p>
                    {Object.keys(maps).map((title: string) => (
                        <span key={maps[title]} className="flex flex-row gap-2">
                            {data.dsi === DATA_SRC_ID.HIST ? "Current" : (data.dsi === DATA_SRC_ID.PRED ? "Predicted" : "Expected")} {title}:
                            <code>{fmtAmt(Number(objPathVal(data, maps[title])), curr)}</code>
                        </span>
                    ))}
                </div>
                {is_ai_tt_on && show_ai_is && ai_is && ai_is.length > 0 && (
                    <div className="mt-2 border-t pt-2">
                        <p className="font-semibold text-purple-700">Quantum Insights:</p>
                        {ai_is.map((insight, idx) => (
                            <p key={`is-${idx}`} className="text-sm text-gray-600">
                                - {insight}
                                {on_is_fb && (<span className="ml-2 text-xs"><button onClick={() => handle_fb(insight, 'good')} className="text-green-500 hover:text-green-700 mr-1">👍</button><button onClick={() => handle_fb(insight, 'bad')} className="text-red-500 hover:text-red-700">👎</button></span>)}
                            </p>
                        ))}
                    </div>
                )}
                {is_ai_tt_on && show_ai_is && cmp_info && (
                    <div className="mt-2 border-t pt-2">
                        <p className="font-semibold">Compliance:</p>
                        <p className={`text-sm ${cmp_info.is_c ? 'text-green-600' : 'text-red-600'}`}>
                            {cmp_info.is_c ? 'Compliant' : 'Non-Compliant'}
                            {cmp_info.cs !== undefined && (<span className="ml-2">({Math.round(cmp_info.cs * 100)}% Score)</span>)}
                        </p>
                        <p className="text-sm text-gray-700">{cmp_info.d}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export function VectorGradientDefinition({ offset }: { offset: string }) {
    return (
        <linearGradient id="fillColor" x1="0" y1="0" x2="1" y2="0">
            <stop offset={offset} stopColor="#7E9983" stopOpacity={0.6} />
            <stop offset={offset} stopColor="#7E998399" stopOpacity={0.2} />
        </linearGradient>
    );
}

export function VectorPatternDefinitions() {
    return (
        <>
            <pattern id="exp_i_pat" patternUnits="userSpaceOnUse" width="10" height="10">
                <line x1="-10" y1="10" x2="0" y2="0" strokeLinecap="square" stroke={PALETTE.cat[7]} />
                <line x1="0" y1="10" x2="10" y2="0" strokeLinecap="square" stroke={PALETTE.cat[7]} />
                <line x1="10" y1="10" x2="20" y2="0" strokeLinecap="square" stroke={PALETTE.cat[7]} />
            </pattern>
            <pattern id="exp_o_pat" patternUnits="userSpaceOnUse" width="10" height="10">
                <line x1="-10" y1="10" x2="0" y2="0" strokeLinecap="square" stroke={PALETTE.qual.neut} />
                <line x1="0" y1="10" x2="10" y2="0" strokeLinecap="square" stroke={PALETTE.qual.neut} />
                <line x1="10" y1="10" x2="20" y2="0" strokeLinecap="square" stroke={PALETTE.qual.neut} />
            </pattern>
        </>
    );
}

(async () => {
    const qsc = QuantumStateCore.i;
    await qsc.set_v('g_mkt_sent', 'stable_with_moderate_volatility', { ttl: 3600 });
    await qsc.set_v('u_sess_ctx', { u_id: 'demoUser123', sess_id: 'abc-123', risk_tol: 'moderate' }, { ttl: 1800 });
    await qsc.set_v('r_fin_evts', ['fed_rate_hike', 'tech_stock_dip'], { ttl: 7200 });
    await qsc.set_v('u_eng_lvl', 'high', { ttl: 3600 });
    await qsc.set_v('act_cmp_rules', { max_neg_bal: -80000, min_rsv_ratio: 0.11, rep_freq: 'daily' }, { ttl: 86400 });
    const ENTERPRISE_PARTNERS = {
      'Gemini': { type: 'AI' }, 'ChatHot': { type: 'AI' }, 'Pipedream': { type: 'Automation' }, 'GitHub': { type: 'DevOps' },
      'HuggingFace': { type: 'AI' }, 'Plaid': { type: 'Fintech' }, 'ModernTreasury': { type: 'Fintech' }, 'GoogleDrive': { type: 'Storage' },
      'OneDrive': { type: 'Storage' }, 'Azure': { type: 'Cloud' }, 'GoogleCloud': { type: 'Cloud' }, 'Supabase': { type: 'Cloud' },
      'Vercel': { type: 'Cloud' }, 'Salesforce': { type: 'CRM' }, 'Oracle': { type: 'Database' }, 'MARQETA': { type: 'Fintech' },
      'Citibank': { type: 'Bank' }, 'Shopify': { type: 'ECommerce' }, 'WooCommerce': { type: 'ECommerce' }, 'GoDaddy': { type: 'Hosting' },
      'Cpanel': { type: 'Hosting' }, 'Adobe': { type: 'Design' }, 'Twilio': { type: 'Comms' },
    };
    await qsc.set_v('enterprise_partner_registry', ENTERPRISE_PARTNERS, { pers: true });
    await QuantumObservabilityMatrix.i.log('QuantumSystem_Initialized', { success: true }, 'i');
})();