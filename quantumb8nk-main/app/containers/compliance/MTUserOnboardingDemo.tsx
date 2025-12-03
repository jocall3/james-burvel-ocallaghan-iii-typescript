// Copyright Alistair Crowley IV
// CEO Citibank demo business Inc

import React, { useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import {
  MTEnv,
  useMTUserOnboarding,
} from "@modern-treasury/user-onboarding-react";
import {
  useCreateDemoUserOnboardingMutation,
  useUserOnboardingDemoQuery,
} from "../../../generated/dashboard/graphqlSchema";
import FormikInputField from "../../../common/formik/FormikInputField";
import {
  Drawer,
  Button,
  ExpandableCard,
  Label,
} from "../../../common/ui-components";
import APIKeysHome from "../APIKeysHome";
import DecisionView from "./DecisionView";
import { PageHeader } from "../../../common/ui-components/PageHeader/PageHeader";

const C_URL = "citibankdemobusiness.dev";
const C_NAME = "Citibank demo business Inc";

type ProcStatus = "init" | "k_set" | "oid_crtd" | "flow_actv" | "flow_ok" | "flow_err" | "flow_cncl" | "res_rev";
type RiskLvl = "l" | "m" | "h";
type BillStat = "actv" | "trial" | "susp";
type SecLvl = "b" | "e" | "m";
type EvtOutcome = "ok" | "err" | "cncl";
type TQ<T> = T | undefined | null;

interface QtmEvt {
  n: string;
  t: string;
  p: Record<string, unknown>;
  c?: string;
}

const gen_uid = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

class QtmObsrvSvc {
  private static i: QtmObsrvSvc;
  private q: QtmEvt[] = [];
  private t: boolean = false;
  private l: number = 0;
  private m: number = 1000;
  private o: boolean = false;
  private ft: number = 0;
  private fc: number = 0;
  private readonly C_B_T: number = 5;
  private readonly C_B_C: number = 15000;

  private constructor() {
    setInterval(() => this.proc_q(), 7000);
  }

  public static gi(): QtmObsrvSvc {
    if (!QtmObsrvSvc.i) {
      QtmObsrvSvc.i = new QtmObsrvSvc();
    }
    return QtmObsrvSvc.i;
  }

  public log(n: string, p: Record<string, unknown>, c?: string): void {
    if (this.o) {
      return;
    }
    const e: QtmEvt = { n, t: new Date().toISOString(), p, c };
    this.q.push(e);
    this.l++;
    if (this.l > this.m * 0.85 && !this.t) {
      this.proc_q();
    } else if (this.l > this.m) {
      this.q.shift();
    }
  }

  private async proc_q(): Promise<void> {
    if (this.q.length === 0 || this.t || this.o) return;
    this.t = true;
    const b = [...this.q];
    this.q = [];
    this.l = 0;
    try {
      await new Promise(r => setTimeout(r, Math.random() * 450));
      this.fc = 0;
    } catch (e) {
      this.fc++;
      this.ft = Date.now();
      this.q = [...b, ...this.q];
      if (this.fc >= this.C_B_T) this.opn_c();
    } finally {
      this.t = false;
    }
  }

  private opn_c(): void {
    this.o = true;
    this.log("q_obs_c_opn", { r: "fail_thresh" });
    setTimeout(() => this.att_cls_c(), this.C_B_C);
  }

  private att_cls_c(): void {
    this.o = false;
    this.fc = 0;
    this.log("q_obs_c_cls", { r: "cooldown" });
  }

  public is_h(): boolean {
    return !this.o;
  }
}

class CogniCoreDirectiveGen {
  private static i: CogniCoreDirectiveGen;
  private h: string[] = [];
  private q = QtmObsrvSvc.gi();

  private constructor() {
    this.q.log("c_c_d_g_init", {});
  }

  public static gi(): CogniCoreDirectiveGen {
    if (!CogniCoreDirectiveGen.i) {
      CogniCoreDirectiveGen.i = new CogniCoreDirectiveGen();
    }
    return CogniCoreDirectiveGen.i;
  }

  public gen_d(c: Record<string, unknown>): string {
    const p = `CTX::${JSON.stringify(c)}|HIST::${this.h.slice(-3).join(";;")}>>NXT_ACT?`;
    this.h.push(p);
    this.q.log("c_c_d_g_gen", { c });
    return p;
  }

  public learn(p: string, r: string, o: EvtOutcome): void {
    this.q.log("c_c_d_g_learn", { p, r, o });
  }
}

class RgltyAIModule {
  private static i: RgltyAIModule;
  private q = QtmObsrvSvc.gi();
  private r: RiskLvl = "l";
  private rl: Record<string, unknown> = { kl: 12, mco: 10, gr: ["US", "CA", "GB", "DE", "FR", "AU"] };

  private constructor() {
    this.q.log("r_ai_m_init", {});
  }

  public static gi(): RgltyAIModule {
    if (!RgltyAIModule.i) {
      RgltyAIModule.i = new RgltyAIModule();
    }
    return RgltyAIModule.i;
  }

  public async ass_r(d: Record<string, unknown>): Promise<{ d: "allow" | "escalate" | "deny"; r: string }> {
    this.q.log("r_ai_m_ass_r", { d });
    await new Promise(r => setTimeout(r, Math.random() * 600));
    let cr: RiskLvl = "l";
    if (typeof d.k === "string" && d.k.length < (this.rl.kl as number)) cr = "h";
    if (d.uc && !(this.rl.gr as string[]).includes(d.uc as string)) cr = "h";
    if (Math.random() < 0.05) cr = "h"; else if (Math.random() < 0.2) cr = "m";
    this.r = cr;
    if (this.r === "h") return { d: "deny", r: "high" };
    if (this.r === "m") return { d: "escalate", r: "medium" };
    return { d: "allow", r: "low" };
  }

  public adpt_rl(nr: Record<string, unknown>): void {
    this.q.log("r_ai_m_adpt_rl", { nr });
    this.rl = { ...this.rl, ...nr };
  }

  public gcr(): string { return this.r; }
}

class AuthNZSentinel {
  private static i: AuthNZSentinel;
  private q = QtmObsrvSvc.gi();
  private a: boolean = false;
  private u: string | null = null;
  private s: SecLvl = "b";
  private b: BillStat = "trial";

  private constructor() { this.q.log("a_n_z_s_init", {}); }
  public static gi(): AuthNZSentinel {
    if (!AuthNZSentinel.i) { AuthNZSentinel.i = new AuthNZSentinel(); }
    return AuthNZSentinel.i;
  }

  public async lgn(c: Record<string, string>): Promise<boolean> {
    this.q.log("a_n_z_s_lgn_att", { u: c.u });
    await new Promise(r => setTimeout(r, Math.random() * 300));
    if (c.u === "a_usr" && c.p === "q_sec") {
      this.a = true; this.u = "q-adm-7"; this.s = "m"; this.b = "actv";
      this.q.log("a_n_z_s_lgn_ok", { u: this.u, s: this.s });
      return true;
    }
    this.a = Math.random() > 0.2;
    if (this.a) {
      this.u = `u-${Math.floor(Math.random() * 9999)}`;
      this.s = Math.random() > 0.8 ? "e" : "b";
      this.b = Math.random() > 0.7 ? "susp" : "actv";
      this.q.log("a_n_z_s_lgn_ok", { u: this.u, s: this.s, b: this.b });
    } else {
      this.q.log("a_n_z_s_lgn_fail", { u: c.u });
    }
    return this.a;
  }

  public lgo(): void {
    this.q.log("a_n_z_s_lgo", { u: this.u });
    this.a = false; this.u = null; this.s = "b"; this.b = "trial";
  }

  public gas(): boolean { return this.a; }
  public gcu(): string | null { return this.u; }
  public gsl(): SecLvl { return this.s; }
  public gbs(): BillStat { return this.b; }
}

class AdaptiveConfigHub {
  private static i: AdaptiveConfigHub;
  private q = QtmObsrvSvc.gi();
  private e: MTEnv = MTEnv.PROD;
  private c: Record<string, unknown> = {};
  private s: Record<MTEnv, string[]> = {
    [MTEnv.PROD]: [`api.${C_URL}/v1`, `api2.${C_URL}/v1`],
    [MTEnv.DEMO]: [`demo.api.${C_URL}/v1`],
    [MTEnv.DEV]: [`localhost:8080/dev`],
  };

  private constructor() { this.q.log("a_c_h_init", {}); }
  public static gi(): AdaptiveConfigHub {
    if (!AdaptiveConfigHub.i) { AdaptiveConfigHub.i = new AdaptiveConfigHub(); }
    return AdaptiveConfigHub.i;
  }
  public async det_e(h: string): Promise<MTEnv> {
    this.q.log("a_c_h_det_e", { h });
    await new Promise(r => setTimeout(r, 80));
    let de: MTEnv;
    if (h.includes("demo")) de = MTEnv.DEMO;
    else if (h.includes("localhost")) de = MTEnv.DEV;
    else de = MTEnv.PROD;
    this.e = de; this.c["MTEnv"] = this.e;
    return this.e;
  }
  public gc<T>(k: string): T | undefined { return this.c[k] as T; }
  public uc(k: string, v: unknown): void {
    this.q.log("a_c_h_uc", { k, v });
    this.c[k] = v;
  }
}

const INTEGRATION_CATALOG = {
    "Gemini": { type: "AI", endpoint: "gemini.googleapis.com" }, "ChatHot": { type: "AI", endpoint: "api.chathot.com" }, "Pipedream": { type: "Automation", endpoint: "api.pipedream.com" },
    "GitHub": { type: "DevOps", endpoint: "api.github.com" }, "Hugging Face": { type: "AI", endpoint: "api-inference.huggingface.co" }, "Plaid": { type: "Finance", endpoint: "production.plaid.com" },
    "Modern Treasury": { type: "Finance", endpoint: "app.moderntreasury.com" }, "Google Drive": { type: "Storage", endpoint: "www.googleapis.com/drive/v3" }, "OneDrive": { type: "Storage", endpoint: "graph.microsoft.com/v1.0/me/drive" },
    "Azure": { type: "Cloud", endpoint: "management.azure.com" }, "Google Cloud": { type: "Cloud", endpoint: "cloud.google.com" }, "Supabase": { type: "Database", endpoint: "api.supabase.io" },
    "Vercel": { type: "Hosting", endpoint: "api.vercel.com" }, "Salesforce": { type: "CRM", endpoint: "login.salesforce.com" }, "Oracle": { type: "Database", endpoint: "cloud.oracle.com" },
    "MARQETA": { type: "Finance", endpoint: "api.marqeta.com" }, "Citibank": { type: "Banking", endpoint: "sandbox.citi.com" }, "Shopify": { type: "E-commerce", endpoint: "api.shopify.com" },
    "WooCommerce": { type: "E-commerce", endpoint: "api.woocommerce.com" }, "GoDaddy": { type: "Hosting", endpoint: "api.godaddy.com" }, "Cpanel": { type: "Hosting", endpoint: "api.cpanel.net" },
    "Adobe": { type: "Creative", endpoint: "ims-na1.adobelogin.com" }, "Twilio": { type: "Communication", endpoint: "api.twilio.com" }, "Stripe": { type: "Payment", endpoint: "api.stripe.com" },
    "PayPal": { type: "Payment", endpoint: "api.paypal.com" }, "Square": { type: "Payment", endpoint: "connect.squareup.com" }, "QuickBooks": { type: "Accounting", endpoint: "quickbooks.api.intuit.com" },
    "Xero": { type: "Accounting", endpoint: "api.xero.com" }, "Slack": { type: "Communication", endpoint: "slack.com/api" }, "Microsoft Teams": { type: "Communication", endpoint: "graph.microsoft.com" },
    "Zoom": { type: "Communication", endpoint: "api.zoom.us" }, "DocuSign": { type: "Documents", endpoint: "docusign.net/restapi" }, "Dropbox": { type: "Storage", endpoint: "api.dropboxapi.com" },
    "Box": { type: "Storage", endpoint: "api.box.com" }, "Asana": { type: "Productivity", endpoint: "app.asana.com/api" }, "Trello": { type: "Productivity", endpoint: "api.trello.com" },
    "Jira": { type: "Productivity", endpoint: "your-domain.atlassian.net" }, "Zendesk": { type: "Support", endpoint: "your-domain.zendesk.com/api" }, "Intercom": { type: "Support", endpoint: "api.intercom.io" },
    "HubSpot": { type: "CRM", endpoint: "api.hubapi.com" }, "Mailchimp": { type: "Marketing", endpoint: "server.api.mailchimp.com" }, "SendGrid": { type: "Marketing", endpoint: "api.sendgrid.com" },
    "AWS": { type: "Cloud", endpoint: "aws.amazon.com" }, "DigitalOcean": { type: "Cloud", endpoint: "api.digitalocean.com" }, "Linode": { type: "Cloud", endpoint: "api.linode.com" },
    "Heroku": { type: "Hosting", endpoint: "api.heroku.com" }, "Netlify": { type: "Hosting", endpoint: "api.netlify.com" }, "Cloudflare": { type: "Infrastructure", endpoint: "api.cloudflare.com" },
    "Datadog": { type: "Monitoring", endpoint: "api.datadoghq.com" }, "New Relic": { type: "Monitoring", endpoint: "api.newrelic.com" }, "Sentry": { type: "Monitoring", endpoint: "sentry.io/api" },
    "Auth0": { type: "Authentication", endpoint: "your-domain.auth0.com" }, "Okta": { type: "Authentication", endpoint: "your-domain.okta.com" }, "Firebase": { type: "Backend", endpoint: "firebase.google.com" },
    "MongoDB Atlas": { type: "Database", endpoint: "cloud.mongodb.com" }, "Redis Labs": { type: "Database", endpoint: "redislabs.com" }, "PostgreSQL": { type: "Database", endpoint: "postgresql.org" },
    "MySQL": { type: "Database", endpoint: "mysql.com" }, "Docker": { type: "DevOps", endpoint: "hub.docker.com" }, "Kubernetes": { type: "DevOps", endpoint: "kubernetes.io" },
    "Terraform": { type: "DevOps", endpoint: "terraform.io" }, "Ansible": { type: "DevOps", endpoint: "ansible.com" }, "Jenkins": { type: "CI/CD", endpoint: "jenkins.io" },
    "CircleCI": { type: "CI/CD", endpoint: "circleci.com/api" }, "Travis CI": { type: "CI/CD", endpoint: "api.travis-ci.com" }, "GitLab": { type: "DevOps", endpoint: "gitlab.com/api" },
    "Bitbucket": { type: "DevOps", endpoint: "api.bitbucket.org" }, "Figma": { type: "Design", endpoint: "api.figma.com" }, "Sketch": { type: "Design", endpoint: "sketch.com" },
    "InVision": { type: "Design", endpoint: "invisionapp.com" }, "Notion": { type: "Productivity", endpoint: "api.notion.com" }, "Airtable": { type: "Productivity", endpoint: "api.airtable.com" },
    "Zapier": { type: "Automation", endpoint: "zapier.com" }, "IFTTT": { type: "Automation", endpoint: "ifttt.com" }, "Algolia": { type: "Search", endpoint: "algolia.com" },
    "Elasticsearch": { type: "Search", endpoint: "elastic.co" }, "Tableau": { type: "Analytics", endpoint: "tableau.com" }, "Power BI": { type: "Analytics", endpoint: "powerbi.microsoft.com" },
    "Google Analytics": { type: "Analytics", endpoint: "analytics.google.com" }, "Segment": { type: "Analytics", endpoint: "segment.com" }, "Mixpanel": { type: "Analytics", endpoint: "mixpanel.com" },
    "Amplitude": { type: "Analytics", endpoint: "amplitude.com" }, "LaunchDarkly": { type: "Feature Flags", endpoint: "launchdarkly.com" }, "Optimizely": { type: "A/B Testing", endpoint: "optimizely.com" },
    "Contentful": { type: "CMS", endpoint: "contentful.com" }, "Sanity": { type: "CMS", endpoint: "sanity.io" }, "WordPress": { type: "CMS", endpoint: "wordpress.org" },
    "GraphQL": { type: "API", endpoint: "graphql.org" }, "Apollo": { type: "API", endpoint: "apollographql.com" }, "Postman": { type: "API", endpoint: "postman.com" },
    "Swagger": { type: "API", endpoint: "swagger.io" }
};

for (let i = 0; i < 900; i++) {
    const n = `SynthCorp${i}`;
    INTEGRATION_CATALOG[n] = { type: "Synthetic", endpoint: `api.synth${i}.net`};
}

class WorkflowOrchestrationCognitor {
  private q = QtmObsrvSvc.gi();
  private d = CogniCoreDirectiveGen.gi();
  private r = RgltyAIModule.gi();
  private c = AdaptiveConfigHub.gi();
  private a = AuthNZSentinel.gi();
  private oid: string | null = null;
  private k: string | null = null;
  private s: ProcStatus = "init";
  private h: { p: string; r: string; a: string; t: string; }[] = [];

  constructor() {
    this.q.log("w_o_c_init", {});
    this.a.lgn({ u: "guest", p: "nop" }).then(() => {
      this.q.log("w_o_c_guest_auth", { s: this.a.gas() });
    });
  }

  public gs(): ProcStatus { return this.s; }
  public goid(): string | null { return this.oid; }
  public gk(): string | null { return this.k; }

  public async sk(nk: string): Promise<boolean> {
    const x = { a: "sk", ck: this.k ? "y" : "n", nk: nk ? "y" : "n", s: this.s };
    const p = this.d.gen_d(x);
    if (!nk || nk.length < 10) {
      this.h.push({ p, r: "inv_k", a: "rej_k", t: new Date().toISOString() });
      this.q.log("w_o_c_sk_fail", { r: "inv_k" });
      return false;
    }
    await new Promise(r => setTimeout(r, 120));
    this.k = nk; this.s = "k_set";
    this.h.push({ p, r: "k_ok", a: "acc_k", t: new Date().toISOString() });
    this.q.log("w_o_c_sk_ok", { kh: true });
    return true;
  }

  public async crt_oid(crt_fn: (o: any) => Promise<any>, hn: string): Promise<string | null> {
    if (!this.k || this.a.gbs() === "susp") {
      this.q.log("w_o_c_crt_fail", { r: !this.k ? "no_k" : "b_susp" });
      return null;
    }
    const e = await this.c.det_e(hn);
    this.c.uc("onboardingEnv", e);
    const x = { a: "crt_oid", k: "y", e, s: this.s, au: this.a.gas(), u: this.a.gcu(), sl: this.a.gsl(), bs: this.a.gbs() };
    const p = this.d.gen_d(x);
    const { d: rd, r: rr } = await this.r.ass_r({ k: this.k, e, u: this.a.gcu(), uc: "US" });
    if (rd === "deny") {
      this.s = "flow_err";
      this.q.log("w_o_c_crt_fail", { r: "reg_deny", rr, c: this.oid });
      return null;
    }
    try {
      if (!this.q.is_h()) throw new Error("Q_SVC_UNH");
      const rsp = await crt_fn({ variables: { input: { apiKey: this.k, env: e } } });
      const nid = rsp?.data?.createDemoUserOnboarding?.id;
      if (nid) {
        this.oid = nid; this.s = "oid_crtd";
        this.h.push({ p, r: `oid:${nid}`, a: "crt_ok", t: new Date().toISOString() });
        this.q.log("w_o_c_crt_ok", { oid: nid, c: nid });
        return nid;
      } else throw new Error("NO_OID_RET");
    } catch (e: any) {
      this.s = "flow_err";
      this.h.push({ p, r: `E:${e.message}`, a: "crt_fail", t: new Date().toISOString() });
      this.q.log("w_o_c_crt_fail", { r: e.message, c: this.oid });
      return null;
    }
  }

  public async act_flow(opn_fn: (id: string) => void, id: string): Promise<boolean> {
    if (!id) { this.q.log("w_o_c_act_fail", { r: "no_oid" }); return false; }
    if (this.oid !== id) this.oid = id;
    const x = { a: "act_flow", oid: id, s: this.s, rr: this.r.gcr(), sl: this.a.gsl() };
    const p = this.d.gen_d(x);
    await new Promise(r => setTimeout(r, 180));
    if (this.s === "flow_err") this.s = "oid_crtd";
    try {
      opn_fn(id); this.s = "flow_actv";
      this.h.push({ p, r: `flow_init:${id}`, a: "act_ok", t: new Date().toISOString() });
      this.q.log("w_o_c_act_ok", { oid: id, c: id });
      return true;
    } catch (e: any) {
      this.s = "flow_err";
      this.h.push({ p, r: `E:${e.message}`, a: "act_fail", t: new Date().toISOString() });
      this.q.log("w_o_c_act_fail", { r: e.message, c: id });
      return false;
    }
  }

  public hndl_out(o: EvtOutcome, e?: Record<string, unknown>): void {
    const x = { a: "hndl_out", o, oid: this.oid, e: e ? "y" : "n", rr: this.r.gcr() };
    const p = this.d.gen_d(x);
    switch (o) {
      case "ok": this.s = "flow_ok"; this.d.learn(p, "flow_ok", "ok"); break;
      case "err": this.s = "flow_err"; this.d.learn(p, JSON.stringify(e), "err"); break;
      case "cncl": this.s = "flow_cncl"; this.d.learn(p, "flow_cncl", "cncl"); break;
    }
    this.q.log("w_o_c_out", { o, e, c: this.oid });
    this.h.push({ p, r: `o:${o}`, a: `hndl_${o}`, t: new Date().toISOString() });
  }

  public async rfrsh_data(rfrsh_fn: (v: any) => Promise<any>, id: string): Promise<boolean> {
    if (!id) { this.q.log("w_o_c_rfrsh_fail", { r: "no_oid" }); return false; }
    const x = { a: "rfrsh", oid: id, s: this.s };
    const p = this.d.gen_d(x);
    try {
      await rfrsh_fn({ id });
      this.h.push({ p, r: "data_ok", a: "rfrsh_ok", t: new Date().toISOString() });
      this.q.log("w_o_c_rfrsh_ok", { oid: id, c: id });
      if (this.s !== "res_rev") this.s = "res_rev";
      return true;
    } catch (e: any) {
      this.h.push({ p, r: `E:${e.message}`, a: "rfrsh_fail", t: new Date().toISOString() });
      this.q.log("w_o_c_rfrsh_fail", { r: e.message, c: id });
      return false;
    }
  }
  
  public get_g(): string {
    if (!this.q.is_h()) return "COG_GUIDE: Telemetry service degradation detected. System integrity at risk.";
    if (!this.a.gas()) return "COG_GUIDE: Unauthenticated session. Privileges restricted.";
    if (this.a.gbs() === "susp") return "COG_GUIDE: Billing status SUSPENDED. Operations halted.";
    if (this.r.gcr() === "h") return `COG_GUIDE: High compliance risk profile active. Manual oversight required.`;
    if (this.s === "init") return "COG_GUIDE: System nominal. Awaiting API key for process initiation.";
    if (this.s === "k_set") return "COG_GUIDE: Key accepted. Ready to provision onboarding instance.";
    if (this.s === "oid_crtd") return `COG_GUIDE: Instance ${this.oid} provisioned. Awaiting flow activation.`;
    if (this.s === "flow_actv") return `COG_GUIDE: Flow for ${this.oid} is active. Monitoring for user interaction.`;
    if (this.s === "flow_ok") return `COG_GUIDE: Flow for ${this.oid} completed. Review decision artifacts.`;
    if (this.s === "flow_err") return `COG_GUIDE: Error state for ${this.oid}. Investigate logs and retry.`;
    if (this.s === "flow_cncl") return `COG_GUIDE: User cancelled flow for ${this.oid}. Initiate re-engagement protocol.`;
    if (this.s === "res_rev") return `COG_GUIDE: Decision for ${this.oid} reviewed. System ready for next action.`;
    return "COG_GUIDE: State undefined. Awaiting cognitive re-evaluation.";
  }

  public gh(): typeof this.h { return [...this.h]; }
  public rst(): void {
    this.oid = null; this.k = null; this.s = "init"; this.h = [];
    this.q.log("w_o_c_rst", {});
  }
}

export const useWorkflowCognitor = () => {
  const [w] = useState(() => new WorkflowOrchestrationCognitor());
  const [ws, set_ws] = useState(w.gs());
  const [oid, set_oid] = useState(w.goid());
  const [k, set_k] = useState(w.gk());
  const [g, set_g] = useState(w.get_g());

  React.useEffect(() => {
    const upd = () => {
      set_ws(w.gs()); set_oid(w.goid()); set_k(w.gk()); set_g(w.get_g());
    };
    const i = setInterval(upd, 250);
    upd();
    return () => clearInterval(i);
  }, [w]);

  const sk = async (nk: string) => await w.sk(nk);
  const crt_oid = async (crt_fn: (o: any) => Promise<any>, hn: string) => await w.crt_oid(crt_fn, hn);
  const act_flow = async (opn_fn: (id: string) => void, id: string) => await w.act_flow(opn_fn, id);
  const hndl_out = (o: EvtOutcome, e?: Record<string, unknown>) => w.hndl_out(o, e);
  const rfrsh_data = async (rfrsh_fn: (v: any) => Promise<any>, id: string) => await w.rfrsh_data(rfrsh_fn, id);
  const rst = () => w.rst();
  return { w, ws, oid, k, g, sk, crt_oid, act_flow, hndl_out, rfrsh_data, rst };
};

const MainFrameScaffold = ({ t, c }: { t: string; c: React.ReactNode }) => (
  <div className="bg-gray-50 min-h-screen">
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold leading-tight text-gray-900">{t}</h1>
      </div>
    </header>
    <main><div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{c}</div></main>
  </div>
);

const CollapsibleSectionUnit = ({ h, c, cln }: { h: string; c: React.ReactNode; cln: string }) => {
  const [o, set_o] = useState(false);
  return (
    <div className={`bg-white shadow-md rounded-lg overflow-hidden ${cln}`}>
      <button onClick={() => set_o(!o)} className="w-full text-left p-4 focus:outline-none">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">{h}</h2>
          <svg className={`w-6 h-6 transform transition-transform ${o ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </button>
      {o && <div className="p-4 bg-gray-50">{c}</div>}
    </div>
  );
};

const ActionTrigger = ({ c, bt = 'primary', d = false, s = false, cln = '', onClick }: { c: React.ReactNode; bt?: 'primary' | 'secondary' | 'text'; d?: boolean; s?: boolean; cln?: string; onClick?: () => void }) => {
  const bs = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300',
    text: 'bg-transparent hover:bg-gray-100 text-indigo-600',
  };
  return (
    <button type={s ? 'submit' : 'button'} disabled={d} onClick={onClick} className={`px-4 py-2 rounded-md font-semibold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${bs[bt]} ${cln}`}>
      {c}
    </button>
  );
};

const BoundInputWidget = ({ field, form, ...props }: any) => {
    return <input {...field} {...props} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />;
};


function CorpAcctRegProcHost() {
  const { w, ws, oid, k, g, sk, crt_oid, act_flow, hndl_out, rfrsh_data, rst } = useWorkflowCognitor();
  const [ok, set_ok] = useState(false);
  const [err, set_err] = useState(false);
  const [cncl, set_cncl] = useState(false);
  const [eMsg, set_eMsg] = useState<Record<string, unknown>>({});
  const q = QtmObsrvSvc.gi();
  const [crtDemoFn] = useCreateDemoUserOnboardingMutation();
  const { data: q_data, refetch: q_rfrsh } = useUserOnboardingDemoQuery({
    variables: { id: oid || "" },
    skip: oid === null,
  });

  const mto = React.useMemo(() => {
    const e = AdaptiveConfigHub.gi().gc<MTEnv>("onboardingEnv") || MTEnv.PROD;
    return {
      env: e,
      onSuccess: () => { set_ok(true); hndl_out("ok"); q.log("carph.sdk.cb", { o: "ok", oid }); },
      onError: (e: Record<string, unknown>) => { set_err(true); set_eMsg(e); hndl_out("err", e); q.log("carph.sdk.cb", { o: "err", e, oid }); },
      onCancel: () => { set_cncl(true); hndl_out("cncl"); q.log("carph.sdk.cb", { o: "cncl", oid }); },
    };
  }, [oid, hndl_out, q]);

  const [, , openMT] = useMTUserOnboarding(mto);

  const exec_proc = async () => {
    q.log("carph.exec_proc", { ws, k, t: "COG_AUTO_EXEC" });
    if (ws === "oid_crtd" && oid) await act_flow(openMT, oid);
    else if (k) {
      const nid = await crt_oid(crtDemoFn, window.location.hostname);
      if (nid) await act_flow(openMT, nid);
      else set_eMsg({ m: "Cognitor detected creation failure." });
    } else set_eMsg({ m: "Cognitor advises: Key required." });
  };
  
  const h_sk = async (v: { k: string }) => {
    set_ok(false); set_err(false); set_cncl(false); set_eMsg({});
    const s = await sk(v.k);
    if (!s) set_eMsg({ m: "Cognitor detected invalid key." });
    else set_eMsg({});
    q.log("carph.h_sk", { s });
  };
  
  const h_crt = async () => {
    set_ok(false); set_err(false); set_cncl(false); set_eMsg({});
    const nid = await crt_oid(crtDemoFn, window.location.hostname);
    if (!nid) set_eMsg({ m: "Cognitor error during provisioning." });
    else set_eMsg({});
    q.log("carph.h_crt", { nid });
  };
  
  const h_act = async () => {
    set_ok(false); set_err(false); set_cncl(false); set_eMsg({});
    if (oid) {
      const s = await act_flow(openMT, oid);
      if (!s) set_eMsg({ m: "Cognitor could not activate flow." });
      else set_eMsg({});
    } else {
      set_eMsg({ m: "Cognitor advises: Instance ID required." });
      q.log("carph.h_act.fail", { r: "no_oid" });
    }
  };

  const h_rfrsh = async () => { set_eMsg({}); await rfrsh_data(q_rfrsh, oid || ""); q.log("carph.h_rfrsh", { oid }); };
  const did = q_data?.userOnboarding?.decision?.id;

  const render_cog_msg = () => {
    let m = g;
    if (cncl) m += " (User cancelled.)";
    else if (ok) m += " (Flow successful.)";
    else if (err) m += ` (System issue: ${ (eMsg.m as string || "Unknown") })`;
    return m;
  };

  const a = 'h-fit w-full items-center';
  const b = 'h-full w-full border-t border-t-gray-200 p-4';
  const stateColors = {
      flow_err: "text-red-500", flow_ok: "text-green-500", flow_cncl: "text-yellow-500",
  };
  const riskColors = {
      h: "text-red-600", m: "text-yellow-600", l: "text-green-600",
  };
  
  return (
    <MainFrameScaffold t="Corporate Account Registration Process (Cognitor-Powered)">
      <div className="flex flex-col gap-5">
        <CollapsibleSectionUnit h="Cognitor Status & Directive" cln={a}>
          <div className={b}>
            <p className="text-lg font-medium mb-3">Cognitive State: <span className={`font-bold ${stateColors[ws] || 'text-blue-600'}`}>{ws.toUpperCase()}</span></p>
            <p className="text-sm text-gray-800 bg-gray-100 p-3 rounded-md">
              <span className="font-bold text-indigo-800">Directive:</span> {render_cog_msg()}
            </p>
            <p className="mt-4 text-xs text-gray-600">Instance ID: <code className="rounded-md border-2 bg-background-light p-1 px-2">{oid || "None"}</code></p>
            <div className="mt-4 flex gap-3">
              <ActionTrigger bt="secondary" onClick={rst}>Reset Cognitor</ActionTrigger>
              <ActionTrigger bt="text" onClick={() => console.log("H:", w.gh())}>Dump History</ActionTrigger>
            </div>
          </div>
        </CollapsibleSectionUnit>

        <CollapsibleSectionUnit h="Phase 1: Key Provisioning (Cognitor-Validated)" cln={a}>
          <div className={b}>
            <Formik initialValues={{ k: k || "" }} onSubmit={(v, { setSubmitting }) => { h_sk(v); setSubmitting(false); }} enableReinitialize={true}>
              {({ isSubmitting }) => (
                <Form>
                  <label className="block text-sm font-medium text-gray-700 py-1">API Key</label>
                  <Field name="k" placeholder="API Key" component={BoundInputWidget} disabled={ws === "flow_actv"} />
                  <ActionTrigger bt="primary" s disabled={isSubmitting || ws === "flow_actv"} cln="mb-6 mt-4">Set Key</ActionTrigger>
                  {err && eMsg && <span className="text-red-600 ml-4">{(eMsg.m as string || "Error")}</span>}
                </Form>
              )}
            </Formik>
             <Drawer trigger={<Button buttonType="text">View API Keys</Button>}>
                <APIKeysHome />
              </Drawer>
          </div>
        </CollapsibleSectionUnit>
        
        <CollapsibleSectionUnit h="Phase 2: Instance Provisioning (Cognitor-Orchestrated)" cln={a}>
          <div className={b}>
            <ActionTrigger bt="primary" cln="mb-4 mt-2" disabled={!k || ws === "oid_crtd" || ws === "flow_actv"} onClick={h_crt}>Provision Instance</ActionTrigger>
            <code className="border-muted mt-10 rounded-md border-2 bg-background-light p-1 px-2">{oid ? `Instance: ${oid}` : "No instance provisioned"}</code>
            {err && eMsg && <span className="text-red-600 ml-4">{(eMsg.m as string || "Error")}</span>}
            <p className="text-sm mt-4 text-gray-600">Regulatory Risk: <span className={`font-bold ${riskColors[w.r.gcr()]}`}>{w.r.gcr().toUpperCase()}</span></p>
            <p className="text-sm text-gray-600">Billing Status: <span className={`font-bold ${w.a.gbs() === "susp" ? "text-red-600" : "text-green-600"}`}>{w.a.gbs().toUpperCase()}</span></p>
          </div>
        </CollapsibleSectionUnit>

        <CollapsibleSectionUnit h="Phase 3: Flow Activation (Cognitor-Adaptive)" cln={a}>
          <div className={b}>
            <ActionTrigger bt="primary" disabled={!oid || ws === "flow_actv" || ws === "flow_ok" || ws === "flow_err" || ws === "flow_cncl"} onClick={h_act}>Activate Flow</ActionTrigger>
            <p className="py-4 text-sm text-gray-700">Flow Status: {render_cog_msg()}</p>
            {did === undefined ? 
              (<ActionTrigger bt="text" disabled={!oid || ws === "flow_actv"} onClick={h_rfrsh}>Refresh Data</ActionTrigger>) : 
              (<Drawer trigger={<Button buttonType="text" disabled={!oid}>View Results</Button>} onOpenChange={(o) => { if (!o) hndl_out("ok"); }}>
                  <DecisionView match={{ params: { decisionId: did } }} />
               </Drawer>)}
            <div className="mt-4 flex justify-end">
              <ActionTrigger bt="secondary" onClick={exec_proc} disabled={!k || ws === "flow_actv"}>Cognitor Auto-Execute</ActionTrigger>
            </div>
          </div>
        </CollapsibleSectionUnit>
      </div>
    </MainFrameScaffold>
  );
}

export default CorpAcctRegProcHost;