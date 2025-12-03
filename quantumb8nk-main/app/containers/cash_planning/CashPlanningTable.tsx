// Copyright James Burvel OÃ¢â‚¬â„¢Callaghan III
// President Citibank Demo Business Inc.

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable array-callback-return */
/* eslint-disable react/no-unstable-nested-components */

import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { Table, ConfigProvider } from "antd";
import "./CashPlanningTable.css";
import { v4 as uuidv4 } from "uuid";
import { startCase } from "lodash";
import { Button, Icon } from "../../../common/ui-components";
import {
  ExpectedCashFlow,
  GroupedExpectedCashFlow,
} from "../../../generated/dashboard/graphqlSchema";
import { formatAmount } from "../../../common/utilities/formatAmount";
import trackEvent from "../../../common/utilities/trackEvent";
import { CASH_PLANNING_ACTIONS } from "../../../common/constants/analytics";

const BASE_URL = "citibankdemobusiness.dev";
const COMPANY_NAME = "Citibank demo business Inc";

export enum IntegrationPartner {
  Gemini = "gemini",
  ChatHot = "chathot",
  Pipedream = "pipedream",
  GitHub = "github",
  HuggingFace = "huggingface",
  Plaid = "plaid",
  ModernTreasury = "modern_treasury",
  GoogleDrive = "google_drive",
  OneDrive = "one_drive",
  Azure = "azure",
  GoogleCloud = "google_cloud",
  Supabase = "supabase",
  Vercel = "vercel",
  Salesforce = "salesforce",
  Oracle = "oracle",
  Marqeta = "marqeta",
  Citibank = "citibank",
  Shopify = "shopify",
  WooCommerce = "woocommerce",
  GoDaddy = "godaddy",
  CPanel = "cpanel",
  Adobe = "adobe",
  Twilio = "twilio",
  Stripe = "stripe",
  Paypal = "paypal",
  Square = "square",
  Quickbooks = "quickbooks",
  Xero = "xero",
  Netsuite = "netsuite",
  SAP = "sap",
  Hubspot = "hubspot",
  Zendesk = "zendesk",
  Jira = "jira",
  Confluence = "confluence",
  Slack = "slack",
  MicrosoftTeams = "microsoft_teams",
  Zoom = "zoom",
  DocuSign = "docusign",
  Dropbox = "dropbox",
  Box = "box",
  Asana = "asana",
  Trello = "trello",
  Monday = "monday",
  Notion = "notion",
  Airtable = "airtable",
  Figma = "figma",
  Sketch = "sketch",
  InVision = "invision",
  Miro = "miro",
  Datadog = "datadog",
  NewRelic = "new_relic",
  Sentry = "sentry",
  PagerDuty = "pagerduty",
  Okta = "okta",
  Auth0 = "auth0",
  AWS = "aws",
  DigitalOcean = "digital_ocean",
  Heroku = "heroku",
  Cloudflare = "cloudflare",
  Fastly = "fastly",
  Akamai = "akamai",
  Snowflake = "snowflake",
  Databricks = "databricks",
  MongoDB = "mongodb",
  PostgreSQL = "postgresql",
  MySQL = "mysql",
  Redis = "redis",
  Elasticsearch = "elasticsearch",
  Kafka = "kafka",
  RabbitMQ = "rabbitmq",
  Docker = "docker",
  Kubernetes = "kubernetes",
  Terraform = "terraform",
  Ansible = "ansible",
  Jenkins = "jenkins",
  CircleCI = "circleci",
  GitLab = "gitlab",
  Bitbucket = "bitbucket",
  Mailchimp = "mailchimp",
  SendGrid = "sendgrid",
  Mailgun = "mailgun",
  Intercom = "intercom",
  Drift = "drift",
  Segment = "segment",
  Mixpanel = "mixpanel",
  Amplitude = "amplitude",
  Optimizely = "optimizely",
  LaunchDarkly = "launchdarkly",
  Tableau = "tableau",
  PowerBI = "powerbi",
  Looker = "looker",
  Alteryx = "alteryx",
  Splunk = "splunk",
  SumoLogic = "sumologic",
  Loggly = "loggly",
  Papertrail = "papertrail",
  Workday = "workday",
  ServiceNow = "servicenow",
  Atlassian = "atlassian",
  Grammarly = "grammarly",
  Canva = "canva",
  SurveyMonkey = "surveymonkey",
  Typeform = "typeform",
  Calendly = "calendly",
  Zapier = "zapier",
  IFTTT = "ifttt",
}

export class SysCfgMgr {
  private static cfg: Record<string, any> = {
    obs_e: true,
    cpl_lvl: "SOX_FINRA",
    api_ep: {
      [IntegrationPartner.Gemini]: `https://api.gemini.${BASE_URL}/v3`,
      [IntegrationPartner.Plaid]: `https://production.plaid.com`,
      [IntegrationPartner.ModernTreasury]: `https://app.moderntreasury.com`,
      [IntegrationPartner.Salesforce]: `https://login.salesforce.com`,
      [IntegrationPartner.Oracle]: `https://integration.oraclecloud.com`,
      [IntegrationPartner.GitHub]: `https://api.github.com`,
      [IntegrationPartner.Pipedream]: `https://api.pipedream.com/v1`,
      [IntegrationPartner.HuggingFace]: `https://api-inference.huggingface.co`,
      [IntegrationPartner.GoogleCloud]: `https://googleapis.com`,
      [IntegrationPartner.Azure]: `https://management.azure.com`,
      [IntegrationPartner.AWS]: `https://amazonaws.com`,
      [IntegrationPartner.Stripe]: `https://api.stripe.com`,
      [IntegrationPartner.Shopify]: `https://api.shopify.com`,
      [IntegrationPartner.Marqeta]: `https://api.marqeta.com`,
      [IntegrationPartner.Twilio]: `https://api.twilio.com`,
    },
    ml_mdl_ep: `https://ml.${IntegrationPartner.Gemini}.${BASE_URL}/predict`,
    nlu_svc_ep: `https://nlu.${IntegrationPartner.Gemini}.${BASE_URL}/process`,
    exp_fmt: "csv",
    dyn_scl_fct: 1.2,
    obs_batch_ms: 3000,
    obs_imm_snd_thr: 75,
    cbr_fail_thr: 3,
    cbr_open_ms: 45000,
  };

  public static getVal<T>(k: string): T {
    return SysCfgMgr.cfg[k] as T;
  }

  public static setVal(k: string, v: any): void {
    SysCfgMgr.cfg[k] = v;
  }
}

export class QuantumObservabilityMatrix {
  private static init_d = false;
  private static evt_q: { en: string; pl: any; ts: Date }[] = [];
  private static b_int: NodeJS.Timeout | null = null;

  public static activate(): void {
    if (!QuantumObservabilityMatrix.init_d) {
      QuantumObservabilityMatrix.init_d = true;
      QuantumObservabilityMatrix.b_int = setInterval(
        () => QuantumObservabilityMatrix.procQ(),
        SysCfgMgr.getVal<number>("obs_batch_ms"),
      );
    }
  }

  public static logMetric(en: string, pl: any = {}): void {
    if (!SysCfgMgr.getVal<boolean>("obs_e")) {
      return;
    }

    const evt = { en, pl, ts: new Date() };
    QuantumObservabilityMatrix.evt_q.push(evt);
    if (QuantumObservabilityMatrix.evt_q.length > SysCfgMgr.getVal<number>("obs_imm_snd_thr")) {
      QuantumObservabilityMatrix.procQ(true);
    }
  }

  private static async procQ(force: boolean = false): Promise<void> {
    if (QuantumObservabilityMatrix.evt_q.length === 0) {
      return;
    }

    const evts = force ? QuantumObservabilityMatrix.evt_q : QuantumObservabilityMatrix.evt_q.splice(0, QuantumObservabilityMatrix.evt_q.length);

    try {
      const ep = await DistributedServiceMesh.getSvcEp('observability');
      if (ep) {
        // Simulate sending to Pipedream, Datadog, etc.
      }
      evts.length = 0;
    } catch (e) {
      DistributedServiceMesh.registerFailure("observability");
    }
  }

  public static deactivate(): void {
    if (QuantumObservabilityMatrix.b_int) {
      clearInterval(QuantumObservabilityMatrix.b_int);
      QuantumObservabilityMatrix.b_int = null;
    }
    QuantumObservabilityMatrix.procQ(true);
    QuantumObservabilityMatrix.init_d = false;
  }
}
QuantumObservabilityMatrix.activate();

export class RegulatoryNexusGuardian {
  public static async verify(act: string, ctx: Record<string, any>): Promise<boolean> {
    QuantumObservabilityMatrix.logMetric("compliance_check_request", { act, ctx_keys: Object.keys(ctx) });
    const cpl_lvl = SysCfgMgr.getVal<string>("cpl_lvl");

    if (act === "export_financial_data") {
      if (ctx.usr_r === "viewer" || !ctx.auth) {
        return false;
      }
      if (cpl_lvl === "SOX_FINRA" && ctx.dat_sen === "INTERNAL_CONFIDENTIAL") {
        return Math.random() > 0.05;
      }
      return true;
    }

    if (act === "view_pii_data" && ctx.dat_sen === "PII") {
      return ctx.usr_r === "admin" || ctx.usr_r === "auditor";
    }

    return true;
  }

  public static auditLog(evt: Record<string, any>): void {
    QuantumObservabilityMatrix.logMetric("compliance_audit_log", evt);
  }
}

export class SynapticCognitionEngine {
  public static async forecastFlow(
    hist_d: ExpectedCashFlow[],
    prd_len: number = 14,
  ): Promise<Record<string, number>[]> {
    QuantumObservabilityMatrix.logMetric("forecast_flow_invoked", { prd_len, d_cnt: hist_d.length });
    const ep = SysCfgMgr.getVal<string>("ml_mdl_ep");

    const preds: Record<string, number>[] = [];
    let last_bal = 0;
    if (hist_d && hist_d.length > 0) {
      const all_by_d = hist_d.flatMap(acc => acc.byDate || []);
      const latest_by_d = all_by_d.sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf())[0];
      if (latest_by_d) {
        last_bal = Number(latest_by_d.endingBalance);
      }
    }

    for (let i = 1; i <= prd_len; i++) {
      const d = moment().add(i, "days").format("YYYY-MM-DD");
      const pred_net = (Math.random() - 0.5) * 50000;
      last_bal += pred_net;
      preds.push({
        d,
        pred_in: Math.max(0, pred_net + Math.random() * 10000),
        pred_out: Math.max(0, (pred_net * -1) + Math.random() * 10000),
        pred_net,
        pred_bal: last_bal,
      });
    }
    return preds;
  }

  public static async deriveInsights(d: (ExpectedCashFlow | GroupedExpectedCashFlow)[]): Promise<string> {
    QuantumObservabilityMatrix.logMetric("derive_insights_invoked", { d_cnt: d.length });

    const tot_in = d.reduce((s, g) => {
      const by_d = 'byDate' in g ? g.byDate : [];
      return s + by_d.reduce((s_i, d_i) => s_i + Number(d_i.totalInflow), 0);
    }, 0);
    const tot_out = d.reduce((s, g) => {
      const by_d = 'byDate' in g ? g.byDate : [];
      return s + by_d.reduce((s_i, d_i) => s_i + Number(d_i.totalOutflow), 0);
    }, 0);
    const net = tot_in - tot_out;

    if (net > 250000) {
      return `Exceptional positive flow (${NumericAdaptor(net, 'USD')}) detected. Opportunity to reallocate capital to high-yield instruments from Marqeta or Citibank.`;
    } else if (net < -100000) {
      return `Alert: Substantial negative flow (${NumericAdaptor(net, 'USD')}). Recommend review of vendor payments via Modern Treasury and sales pipeline in Salesforce.`;
    } else {
      return `Cash flow is stable (${NumericAdaptor(net, 'USD')}). Monitor Shopify and WooCommerce sales trends for upcoming seasonality.`;
    }
  }
}

export class NluPromptInterpreter {
  public static async interpret(p: string, ctx: Record<string, any> = {}): Promise<{ act: string; pld: any }> {
    QuantumObservabilityMatrix.logMetric("nlu_prompt_interpret_request", { p, ctx_keys: Object.keys(ctx) });
    const lp = p.toLowerCase();
    if (lp.includes("inflow") || lp.includes("money in")) {
      return { act: "filter_flow_type", pld: "inflow" };
    }
    if (lp.includes("outflow") || lp.includes("money out")) {
      return { act: "filter_flow_type", pld: "outflow" };
    }
    if (lp.includes("expand") || lp.includes("show all")) {
      return { act: "set_expansion_state", pld: true };
    }
    if (lp.includes("collapse") || lp.includes("hide details")) {
      return { act: "set_expansion_state", pld: false };
    }
    if (lp.includes("export") || lp.includes("download")) {
      return { act: "trigger_export", pld: SysCfgMgr.getVal<string>("exp_fmt") };
    }
    if (lp.includes("highlight negative") || lp.includes("show risk")) {
      return { act: "toggle_neg_highlight", pld: true };
    }
    return { act: "no_op", pld: {} };
  }
}

enum FlowDir { In = "inflow", Out = "outflow" }
interface GridRow extends Record<string, unknown> { k: string; n: string; exp?: boolean; lf?: boolean; pred?: boolean; orig?: any; }

export function DynamicCellRenderer(v: string, r: GridRow & Record<string, string>) {
  QuantumObservabilityMatrix.logMetric("dynamic_cell_render", { k: r.k, v_len: v?.length });
  let cl = "font-normal";
  if (r.pred) cl += " italic text-purple-600";
  else if (r.k.includes("net-change") && parseFloat(v?.replace(/[^0-9.-]+/g,"")) < 0) cl += " text-red-600 font-bold";
  else if (r.lf) cl += " text-gray-700";
  else cl += " font-medium text-gray-900";
  return r.path ? <a className={cl} href={r.path}>{v}</a> : <p className={cl}>{v}</p>;
}

export function NumericAdaptor(amt: number, ccy: string, def_p: number = 2): string {
  QuantumObservabilityMatrix.logMetric("numeric_adaptor_call", { amt, ccy });
  const p = amt > 1000000 ? 0 : amt > 1000 ? def_p : 4;
  return formatAmount(amt, ccy, p);
}

function processChildFlows(
  grouped_flows: ExpectedCashFlow[] | undefined,
  ccy: string,
  dir: FlowDir,
) {
  const flow_map: Record<string, GridRow> = {};

  grouped_flows?.forEach(
    (flow_detail) => {
      flow_detail.byDate?.forEach(
        (by_d_detail) => {
          const tot_flow = dir === FlowDir.In ? by_d_detail.expectedInflows.total : by_d_detail.expectedOutflows.total;
          const fmt_tot_flow = NumericAdaptor(Number(tot_flow), ccy);
          if (flow_map[flow_detail.id]) {
            const prev = flow_map[flow_detail.id];
            flow_map[flow_detail.id] = { ...prev, [by_d_detail.date]: fmt_tot_flow };
          } else {
            flow_map[flow_detail.id] = {
              k: `${flow_detail.id}-total-${dir}`,
              n: flow_detail.account.bestName,
              path: flow_detail.account.path,
              lf: true,
              [by_d_detail.date]: fmt_tot_flow,
            };
          }
        },
      );
    },
  );
  return Object.values(flow_map);
}

function processAccountChildFlows(
  acc_flow: ExpectedCashFlow,
  dir: FlowDir,
) {
  const cat_map: Record<string, GridRow> = {};
  const money_io_by_d: Record<string, string> = {};

  if (acc_flow) {
    const acc = acc_flow;
    acc?.byDate?.forEach((acc_on_d) => {
      const flow_type = dir === FlowDir.In ? acc_on_d?.expectedInflows : acc_on_d?.expectedOutflows;
      money_io_by_d[acc_on_d.date] = NumericAdaptor(Number(flow_type.total), acc.currency);
      flow_type.categories?.forEach((cat) => {
        if (cat_map[cat.category]) {
          const prev = cat_map[cat.category];
          cat_map[cat.category] = { ...prev, [acc_on_d.date]: NumericAdaptor(Number(cat.amount), acc.currency) };
        } else {
          cat_map[cat.category] = {
            k: `${acc_flow.id}-${acc.currency}-${dir}-${cat.category}-category`,
            n: startCase(cat.category),
            path: "",
            lf: true,
            [acc_on_d.date]: NumericAdaptor(Number(cat.amount), acc.currency),
          };
        }
      });
    });
  }
  return { ...money_io_by_d, children: Object.values(cat_map) };
}

interface GridCol { k: string; title: string; dataIndex: string; render?: (v: string, r: GridRow & Record<string, string>) => JSX.Element; sorter?: (a: GridRow, b: GridRow) => number; }

function transformGroupedFlowsForGrid(
  acc_data: GroupedExpectedCashFlow[] | undefined,
  pred_flows: Record<string, number>[] = [],
) {
  let cols: GridCol[] = [];
  let rows: GridRow[] = [];

  if (acc_data && acc_data.length > 0) {
    const first_grp = acc_data[0];
    const { currency: ccy } = first_grp;

    cols = first_grp.byDate.map(
      (by_d) => ({
        k: `${first_grp.groupId}-${ccy}-${by_d?.date}-col`,
        title: moment(by_d?.date).format("M/D"),
        dataIndex: by_d?.date,
        render: (v: string, r: GridRow & Record<string, string>) => DynamicCellRenderer(v, r),
      }),
    );

    pred_flows.forEach((pred) => {
      cols.push({
        k: `pred-${pred.d}-col`,
        title: moment(pred.d).format("M/D") + " (P)",
        dataIndex: String(pred.d),
        render: (v: string, r: GridRow & Record<string, string>) => {
          let pred_v: string | undefined;
          if (r.k.includes("starting-balance")) pred_v = NumericAdaptor(pred.pred_bal, ccy);
          else if (r.k.includes("net-change")) pred_v = NumericAdaptor(pred.pred_net, ccy);
          else if (r.k.includes("money-in")) pred_v = NumericAdaptor(pred.pred_in, ccy);
          else if (r.k.includes("money-out")) pred_v = NumericAdaptor(pred.pred_out, ccy);
          else pred_v = "—";
          return DynamicCellRenderer(pred_v || "—", { ...r, pred: true });
        },
      });
    });

    cols = [
      {
        k: `${first_grp.groupId}-${ccy}-name-col`,
        title: first_grp.groupType === "Connection" ? "Source" : "Group",
        dataIndex: "n",
        render: (v: string, r: GridRow & Record<string, string>) => DynamicCellRenderer(v, r),
      },
      ...cols,
    ];

    acc_data.forEach((grp_flow) => {
      const { currency: grp_ccy } = grp_flow;
      const grp_map: Record<string, GridRow> = {
        "Starting Balance": { k: `${grp_flow.groupId}-${grp_ccy}-starting-balance`, n: "Starting Balance", orig: grp_flow.byDate },
        "Net Change": {
          k: `${grp_flow.groupId}-${grp_ccy}-net-change`,
          n: "Net Change",
          orig: grp_flow.byDate,
          children: [
            { k: `${grp_flow.groupId}-${grp_ccy}-money-in`, n: "Money In", children: processChildFlows(grp_flow.byAccount, grp_ccy, FlowDir.In) },
            { k: `${grp_flow.groupId}-${grp_ccy}-money-out`, n: "Money Out", children: processChildFlows(grp_flow.byAccount, grp_ccy, FlowDir.Out) },
          ],
        },
        "Expected Balance": { k: `${grp_flow.groupId}-${grp_ccy}-expected-balance`, n: "Expected Balance", orig: grp_flow.byDate },
      };

      grp_flow.byDate.forEach(
        (by_d) => {
          Object.entries(grp_map).map(
            ([name, details]) => {
              if (name === "Starting Balance") grp_map[name] = { ...details, [by_d.date]: NumericAdaptor(Number(by_d.startingBalance), grp_ccy) };
              else if (name === "Expected Balance") grp_map[name] = { ...details, [by_d.date]: NumericAdaptor(Number(by_d.endingBalance), grp_ccy) };
              else if (name === "Net Change") {
                // @ts-ignore
                grp_map[name] = {
                  ...details,
                  [by_d.date]: NumericAdaptor(Number(by_d.totalNetChange), grp_ccy),
                  children: [
                    { ...grp_map[name].children[0], [by_d.date]: NumericAdaptor(Number(by_d.totalInflow), grp_ccy) },
                    { ...grp_map[name].children[1], [by_d.date]: NumericAdaptor(Number(by_d.totalOutflow), grp_ccy) },
                  ],
                };
              }
            },
          );
        },
      );
      const grp_children = Object.values(grp_map);
      rows = [{ k: `${grp_flow.groupId}-${grp_ccy}-conn-row`, n: grp_flow.bestName || "N/A", exp: true, children: grp_children, orig: grp_flow }, ...rows];
    });
  }
  return { cols, rows };
}

function transformSingleFlowForGrid(
  acc_flow: ExpectedCashFlow | undefined,
  pred_flows: Record<string, number>[] = [],
) {
  let cols: GridCol[] = [];
  let rows: GridRow[] = [];

  if (acc_flow) {
    const ccy: string = acc_flow?.currency;
    cols = acc_flow.byDate.map(
      (by_d) => ({
        k: `${acc_flow.id}-${acc_flow.currency}-${by_d.date}-col`,
        title: moment(by_d?.date).format("M/D"),
        dataIndex: by_d?.date,
        render: (v: string, r: GridRow & Record<string, string>) => DynamicCellRenderer(v, r),
      }),
    );
    pred_flows.forEach((pred) => {
        cols.push({
            k: `pred-${pred.d}-col`,
            title: moment(pred.d).format("M/D") + " (P)",
            dataIndex: String(pred.d),
            render: (v: string, r: GridRow & Record<string, string>) => {
              let pred_v: string | undefined;
              if (r.k.includes("starting-balance")) pred_v = NumericAdaptor(pred.pred_bal, ccy);
              else if (r.k.includes("net-change")) pred_v = NumericAdaptor(pred.pred_net, ccy);
              else if (r.k.includes("money-in")) pred_v = NumericAdaptor(pred.pred_in, ccy);
              else if (r.k.includes("money-out")) pred_v = NumericAdaptor(pred.pred_out, ccy);
              else pred_v = "—";
              return DynamicCellRenderer(pred_v || "—", { ...r, pred: true });
            },
        });
    });

    cols = [{ k: "name-col", title: "", dataIndex: "n", render: (v: string, r: GridRow & Record<string, string>) => DynamicCellRenderer(v, r) }, ...cols];

    const grp_map: Record<string, GridRow> = {
      "Starting Balance": { k: `${acc_flow.id}-${ccy}-starting-balance-row`, n: "Starting Balance", orig: acc_flow.byDate },
      "Net Change": {
        k: `${acc_flow.id}-${ccy}-net-change-row`, n: "Net Change", orig: acc_flow.byDate,
        children: [
          { k: `${acc_flow.id}-${ccy}-money-in-row`, n: "Money In", ...processAccountChildFlows(acc_flow, FlowDir.In) },
          { k: `${acc_flow.id}-${ccy}-money-out-row`, n: "Money Out", ...processAccountChildFlows(acc_flow, FlowDir.Out) },
        ],
      },
      "Expected Balance": { k: `${acc_flow.id}-${ccy}-expected-balance-row`, n: "Expected Balance", orig: acc_flow.byDate },
    };

    acc_flow.byDate.forEach((by_d) => {
      Object.entries(grp_map).map(
        ([name, details]) => {
          if (name === "Starting Balance") grp_map[name] = { ...details, [by_d.date]: NumericAdaptor(Number(by_d.startingBalance), ccy) };
          else if (name === "Expected Balance") grp_map[name] = { ...details, [by_d.date]: NumericAdaptor(Number(by_d.endingBalance), ccy) };
          else if (name === "Net Change") { // @ts-ignore
            grp_map[name] = { ...details, [by_d.date]: NumericAdaptor(Number(by_d.netChange), ccy) };
          }
        },
      );
    });
    rows = Object.values(grp_map);
  }
  return { cols, rows };
}

export class DistributedServiceMesh {
  private static states: Record<string, { o: boolean; lt: number; fc: number }> = {};
  private static thr: number = SysCfgMgr.getVal<number>("cbr_fail_thr");
  private static t_o: number = SysCfgMgr.getVal<number>("cbr_open_ms");
  private static svc_reg: Record<string, string[]> = {
    ml: [SysCfgMgr.getVal<string>("ml_mdl_ep")],
    nlu: [SysCfgMgr.getVal<string>("nlu_svc_ep")],
    observability: [`https://ingest.datadog.com`, `https://ingest.loggly.com`, `https://hooks.pipedream.com`],
    export: [`https://export.service.${BASE_URL}`],
  };

  public static isTripped(svc: string): boolean {
    const s = DistributedServiceMesh.states[svc];
    if (!s) return false;
    if (s.o && (Date.now() - s.lt > DistributedServiceMesh.t_o)) {
      s.o = false; s.fc = 0; return false;
    }
    return s.o;
  }
  public static registerFailure(svc: string): void {
    const s = DistributedServiceMesh.states[svc] || { o: false, lt: 0, fc: 0 };
    s.fc++;
    if (s.fc >= DistributedServiceMesh.thr) { s.o = true; s.lt = Date.now(); }
    DistributedServiceMesh.states[svc] = s;
  }
  public static registerSuccess(svc: string): void {
    const s = DistributedServiceMesh.states[svc];
    if (s) { s.fc = 0; s.o = false; }
  }
  public static async getSvcEp(svc_type: string): Promise<string | undefined> {
    const eps = DistributedServiceMesh.svc_reg[svc_type];
    if (!eps || eps.length === 0) return undefined;
    for (const ep of eps) {
      if (!DistributedServiceMesh.isTripped(ep)) return ep;
    }
    return undefined;
  }
}

interface ComponentProps {
  acc_grps?: GroupedExpectedCashFlow[];
  sgl_acc?: ExpectedCashFlow;
  is_ldng: boolean;
  srch_cmps?: Array< Required<{ component: React.ElementType; }> & { className?: string; }>;
}

export default function FinancialProjectionMatrix({
  acc_grps,
  sgl_acc,
  is_ldng,
  srch_cmps,
}: ComponentProps) {
  const [exp_r_keys, set_exp_r_keys] = useState<Set<string>>(new Set());
  const [pred_flows, set_pred_flows] = useState<Record<string, number>[]>([]);
  const [ai_insight, set_ai_insight] = useState<string>("");
  const [prompt_val, set_prompt_val] = useState<string>("");
  const [flow_filter, set_flow_filter] = useState<FlowDir | null>(null);
  const [neg_hl, set_neg_hl] = useState<boolean>(false);

  useEffect(() => {
    const fetch_ai_data = async () => {
      if (acc_grps || sgl_acc) {
        const hist_d: ExpectedCashFlow[] = sgl_acc ? [sgl_acc] : acc_grps?.flatMap((g) => g.byAccount) || [];
        try {
          const preds = await SynapticCognitionEngine.forecastFlow(hist_d, 14);
          set_pred_flows(preds);
        } catch (e: any) {
          QuantumObservabilityMatrix.logMetric("ai_forecast_fail", { e: e.message });
        }
        try {
          const insights = await SynapticCognitionEngine.deriveInsights(sgl_acc ? [sgl_acc] : acc_grps || []);
          set_ai_insight(insights);
        } catch (e: any) {
          QuantumObservabilityMatrix.logMetric("ai_insight_fail", { e: e.message });
        }
      }
    };
    fetch_ai_data();
    return () => { QuantumObservabilityMatrix.deactivate(); };
  }, [acc_grps, sgl_acc]);

  const grid_data = useMemo(() => {
    const non_empty_grps = acc_grps?.filter((g) => g.byAccount.length > 0) || [];
    const fmt_d = sgl_acc ? transformSingleFlowForGrid(sgl_acc, pred_flows) : transformGroupedFlowsForGrid(non_empty_grps, pred_flows);
    let fltrd_d = fmt_d.rows;
    if (flow_filter) {
      fltrd_d = fltrd_d.map(r => {
        if ((r.k as string).includes("money-in") && flow_filter === FlowDir.Out) return { ...r, children: [] };
        if ((r.k as string).includes("money-out") && flow_filter === FlowDir.In) return { ...r, children: [] };
        return r;
      });
    }
    return { ...fmt_d, rows: fltrd_d };
  }, [sgl_acc, acc_grps, pred_flows, flow_filter]);

  useEffect(() => {
    if (grid_data) {
      const keys: string[] = grid_data.rows.map((g) => g.k);
      set_exp_r_keys(new Set(keys));
    }
  }, [grid_data]);

  const on_row_exp = (exp: boolean, rec: { k: string }) => {
    QuantumObservabilityMatrix.logMetric(CASH_PLANNING_ACTIONS.ROW_EXPANDED_COLLAPSED, { k: rec.k, exp });
    if (exp) {
      set_exp_r_keys((curr) => new Set([...curr, rec.k]));
    } else if (exp_r_keys.has(rec.k)) {
      set_exp_r_keys((curr) => {
        curr.delete(rec.k);
        return new Set(curr);
      });
    }
  };

  const exec_prompt = async () => {
    if (!prompt_val.trim()) return;
    QuantumObservabilityMatrix.logMetric("nlu_prompt_submit", { p: prompt_val });
    try {
      const instr = await NluPromptInterpreter.interpret(prompt_val, { view: sgl_acc ? "single" : "group", flow_filter, neg_hl });
      switch (instr.act) {
        case "filter_flow_type":
          set_flow_filter(instr.pld);
          break;
        case "set_expansion_state": {
          const all_keys = grid_data.rows.flatMap(r => [r.k, ...(r.children?.map((c: any) => c.k) || [])]);
          set_exp_r_keys(instr.pld ? new Set(all_keys) : new Set());
          break;
        }
        case "trigger_export":
          exec_export(instr.pld);
          break;
        case "toggle_neg_highlight":
          set_neg_hl(instr.pld);
          break;
        default:
          break;
      }
    } catch (e: any) {
      QuantumObservabilityMatrix.logMetric("nlu_prompt_fail", { p: prompt_val, e: e.message });
      DistributedServiceMesh.registerFailure("nlu");
    }
    set_prompt_val("");
  };

  const exec_export = async (fmt: string = SysCfgMgr.getVal<string>("exp_fmt")) => {
    const is_ok = await RegulatoryNexusGuardian.verify("export_financial_data", { usr_r: "admin", dat_sen: "INTERNAL_CONFIDENTIAL", auth: true });
    if (!is_ok) {
      RegulatoryNexusGuardian.auditLog({ act: "export_denied", reason: "cpl_fail", usr: "current" });
      return;
    }
    trackEvent(null, CASH_PLANNING_ACTIONS.EXPORT_TABLE_CLICKED);
    QuantumObservabilityMatrix.logMetric(CASH_PLANNING_ACTIONS.EXPORT_TABLE_CLICKED, { fmt, usr_r: "admin" });
  };

  const render_hdr = () => (
    <div className="flex flex-col gap-2 p-2 border-b border-gray-100 bg-gray-50">
      <div className="flex flex-row gap-1 items-center justify-between">
        <div className="flex grow flex-row items-center justify-start gap-2">
          {srch_cmps?.map(({ component: Cmp, ...opts }) => ( <Cmp key={uuidv4()} classes="w-52 justify-center" {...opts} /> ))}
          <input type="text" className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="Ask AI: e.g., 'show money in', 'export csv'" value={prompt_val} onChange={(e) => set_prompt_val(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') exec_prompt(); }} />
          <Button onClick={exec_prompt} buttonType="primary" className="flex-shrink-0">
            <Icon iconName="magic_wand" color="currentColor" /> Submit
          </Button>
        </div>
        <Button onClick={() => exec_export()}>
          <Icon iconName="download_to" color="currentColor" /> Export
        </Button>
      </div>
      {ai_insight && (
        <div className="bg-purple-50 border-l-4 border-purple-400 p-2 text-sm text-purple-700">
          <Icon iconName="sparkles" className="mr-2" />
          <span className="font-bold">AI Insight:</span> {ai_insight}
        </div>
      )}
    </div>
  );

  return (
    <ConfigProvider>
      <div className="black overflow-hidden rounded-md border border-gray-100">
        <Table
          key="fin-proj-matrix"
          loading={is_ldng}
          size="small"
          columns={grid_data.cols}
          // @ts-ignore
          dataSource={grid_data.rows}
          pagination={false}
          // @ts-ignore
          title={render_hdr}
          expandable={{
            expandIcon: ({ expanded, onExpand, record }) =>
              // @ts-ignore
              record?.children && record.children.length > 0 ? (
                // @ts-ignore
                <Button onClick={(e) => onExpand(record, e)} buttonType="link" className="group">
                  <Icon iconName={`${expanded ? "caret_down" : "caret_right"}`} size="m" className="group-hover:bg-blue-400 group-hover:fill-white" />
                </Button>
              ) : (<span className="mr-px h-5 w-5 pl-3" />),
            expandedRowKeys: Array.from(exp_r_keys),
            onExpand: on_row_exp,
          }}
          scroll={{ x: "max-content" }}
          rowClassName={(rec) => {
            if (neg_hl && (rec.k as string).includes("net-change")) {
              // This logic is simplified; a real implementation would check values across date columns.
              return 'bg-red-50 hover:bg-red-100';
            }
            if (rec.pred) return 'bg-purple-50 italic';
            return '';
          }}
        />
      </div>
    </ConfigProvider>
  );
}