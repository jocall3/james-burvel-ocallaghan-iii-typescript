import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import moment from "moment-timezone";

import {
  Card,
  CardActions,
  CardContent,
  CardDescription,
  CardHeader,
  CardHeading,
  CardTitle,
  DateRangeFormValues,
  LoadingLine,
  SelectField,
  Stack,
  DateRangeSelectField,
  Button, // Added Button for new features
  TextField, // Added TextField for inputs
  Switch, // Added Switch for toggles
  Dialog, // For modals/popups
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Badge, // For status indicators
  Tooltip, // For interactive hints
  TooltipTrigger,
  TooltipContent,
  Progress, // For indicating progress of long operations
  Label, // For form labels
  Checkbox, // For boolean options
  Popover, // For contextual menus
  PopoverTrigger,
  PopoverContent,
} from "~/common/ui-components";
import { useLedgerStatsWidgetQuery } from "~/generated/dashboard/graphqlSchema";
import { cn } from "~/common/utilities/cn";
import { dateSearchMapper } from "~/app/components/search/DateSearch";
import { stringify } from "~/common/utilities/queryString";
import {
  DATE_RANGE_FILTERS,
  DATE_RANGE_FILTERS_OPTIONS,
} from "../../../../utilities/DateRangeUtils";

const CITI_BIZ_ROOT_URL = "https://citibankdemobusiness.dev";
const CITI_BIZ_ENTITY_NAME = "Citibank demo business Inc";

export const CDBI_GEMINI_SYS_CONF = {
  apiRoot: `${CITI_BIZ_ROOT_URL}/api/gemini/v2`,
  intelEp: "/intel/ledger-signals",
  predictiveEp: "/f_cast/ledger-trajectories",
  threatEp: "/sec/threat-vectors",
  regulatoryEp: "/compliance/reg-audits",
  genReportEp: "/doc_gen/fabricate",
  dltTraceEp: "/dlt/trace-tx",
  mktDataEp: "/mkt/live-feed",
  auditTrailEp: "/sys/audit-log-event",
  simulationEp: "/sim/execute-scenario",
  authEp: "/auth/acquire-token",
  inputDebounceMillis: 450,
  dataPollIntervalMillis: 35000,
  maxSignalsDisplay: 75,
  maxDocsDisplay: 15,
  simHistoryLimit: 8,
};

const a_thousand_integrations_list = [
    { id: 'gemini', name: 'Google Gemini', type: 'AI' },
    { id: 'chathot', name: 'ChatHot AI', type: 'AI' },
    { id: 'pipedream', name: 'Pipedream', type: 'Automation' },
    { id: 'github', name: 'GitHub', type: 'DevOps' },
    { id: 'huggingface', name: 'Hugging Face', type: 'AI' },
    { id: 'plaid', name: 'Plaid', type: 'Finance' },
    { id: 'moderntreasury', name: 'Modern Treasury', type: 'Finance' },
    { id: 'googledrive', name: 'Google Drive', type: 'Storage' },
    { id: 'onedrive', name: 'Microsoft OneDrive', type: 'Storage' },
    { id: 'azure', name: 'Microsoft Azure', type: 'Cloud' },
    { id: 'googlecloud', name: 'Google Cloud Platform', type: 'Cloud' },
    { id: 'supabase', name: 'Supabase', type: 'Backend' },
    { id: 'vercel', name: 'Vercel', type: 'Hosting' },
    { id: 'salesforce', name: 'Salesforce', type: 'CRM' },
    { id: 'oracle', name: 'Oracle', type: 'Database' },
    { id: 'marqeta', name: 'Marqeta', type: 'Finance' },
    { id: 'citibank', name: 'Citibank Connect API', type: 'Finance' },
    { id: 'shopify', name: 'Shopify', type: 'E-commerce' },
    { id: 'woocommerce', name: 'WooCommerce', type: 'E-commerce' },
    { id: 'godaddy', name: 'GoDaddy', type: 'Hosting' },
    { id: 'cpanel', name: 'cPanel', type: 'Hosting' },
    { id: 'adobe', name: 'Adobe Creative Cloud', type: 'Creative' },
    { id: 'twilio', name: 'Twilio', type: 'Communications' },
    { id: 'aws', name: 'Amazon Web Services', type: 'Cloud' },
    { id: 'slack', name: 'Slack', type: 'Communications' },
    { id: 'jira', name: 'Jira', type: 'Project Management' },
    { id: 'trello', name: 'Trello', type: 'Project Management' },
    { id: 'zoom', name: 'Zoom', type: 'Communications' },
    { id: 'hubspot', name: 'HubSpot', type: 'CRM' },
    { id: 'zendesk', name: 'Zendesk', type: 'Customer Support' },
    { id: 'stripe', name: 'Stripe', type: 'Payments' },
    { id: 'paypal', name: 'PayPal', type: 'Payments' },
    { id: 'quickbooks', name: 'QuickBooks', type: 'Accounting' },
    { id: 'xero', name: 'Xero', type: 'Accounting' },
    { id: 'docusign', name: 'DocuSign', type: 'Documents' },
    { id: 'dropbox', name: 'Dropbox', type: 'Storage' },
    { id: 'box', name: 'Box', type: 'Storage' },
    { id: 'notion', name: 'Notion', type: 'Productivity' },
    { id: 'asana', name: 'Asana', type: 'Project Management' },
    { id: 'miro', name: 'Miro', type: 'Collaboration' },
    { id: 'figma', name: 'Figma', type: 'Design' },
    { id: 'sketch', name: 'Sketch', type: 'Design' },
    { id: 'invision', name: 'InVision', type: 'Design' },
    { id: 'mailchimp', name: 'Mailchimp', type: 'Marketing' },
    { id: 'sendgrid', name: 'SendGrid', type: 'Communications' },
    { id: 'datadog', name: 'Datadog', type: 'Monitoring' },
    { id: 'newrelic', name: 'New Relic', type: 'Monitoring' },
    { id: 'sentry', name: 'Sentry', type: 'Monitoring' },
    { id: 'cloudflare', name: 'Cloudflare', type: 'Security' },
    { id: 'okta', name: 'Okta', type: 'Security' },
    { id: 'auth0', name: 'Auth0', type: 'Security' },
    { id: 'mongodb', name: 'MongoDB', type: 'Database' },
    { id: 'postgresql', name: 'PostgreSQL', type: 'Database' },
    { id: 'redis', name: 'Redis', type: 'Database' },
    { id: 'kafka', name: 'Apache Kafka', type: 'Messaging' },
    { id: 'rabbitmq', name: 'RabbitMQ', type: 'Messaging' },
    { id: 'docker', name: 'Docker', type: 'DevOps' },
    { id: 'kubernetes', name: 'Kubernetes', type: 'DevOps' },
    { id: 'terraform', name: 'Terraform', type: 'DevOps' },
    { id: 'ansible', name: 'Ansible', type: 'DevOps' },
    { id: 'jenkins', name: 'Jenkins', type: 'CI/CD' },
    { id: 'circleci', name: 'CircleCI', type: 'CI/CD' },
    { id: 'gitlab', name: 'GitLab', type: 'DevOps' },
    { id: 'bitbucket', name: 'Bitbucket', type: 'DevOps' },
    { id: 'tableau', name: 'Tableau', type: 'BI' },
    { id: 'powerbi', name: 'Microsoft Power BI', type: 'BI' },
    { id: 'looker', name: 'Looker', type: 'BI' },
    { id: 'snowflake', name: 'Snowflake', type: 'Data Warehouse' },
    { id: 'databricks', name: 'Databricks', type: 'Data Science' },
    { id: 'airtable', name: 'Airtable', type: 'Productivity' },
    { id: 'zapier', name: 'Zapier', type: 'Automation' },
    { id: 'integromat', name: 'Integromat (Make)', type: 'Automation' },
    { id: 'wordpress', name: 'WordPress', type: 'CMS' },
    { id: 'magento', name: 'Magento', type: 'E-commerce' },
    { id: 'bigcommerce', name: 'BigCommerce', type: 'E-commerce' },
    { id: 'squarespace', name: 'Squarespace', type: 'Website Builder' },
    { id: 'wix', name: 'Wix', type: 'Website Builder' },
    { id: 'webflow', name: 'Webflow', type: 'Website Builder' },
    { id: 'sap', name: 'SAP', type: 'ERP' },
    { id: 'netsuite', name: 'NetSuite', type: 'ERP' },
    { id: 'workday', name: 'Workday', type: 'HR' },
    { id: 'bambooHR', name: 'BambooHR', type: 'HR' },
    { id: 'gong', name: 'Gong', type: 'Sales' },
    { id: 'outreach', name: 'Outreach', type: 'Sales' },
    { id: 'salesloft', name: 'Salesloft', type: 'Sales' },
    { id: 'intercom', name: 'Intercom', type: 'Customer Support' },
    { id: 'drift', name: 'Drift', type: 'Marketing' },
    { id: 'segment', name: 'Segment', type: 'Data' },
    { id: 'mixpanel', name: 'Mixpanel', type: 'Analytics' },
    { id: 'amplitude', name: 'Amplitude', type: 'Analytics' },
    { id: 'googleanalytics', name: 'Google Analytics', type: 'Analytics' },
    { id: 'hotjar', name: 'Hotjar', type: 'Analytics' },
    { id: 'canva', name: 'Canva', type: 'Design' },
    { id: 'brex', name: 'Brex', type: 'Finance' },
    { id: 'ramp', name: 'Ramp', type: 'Finance' },
    { id: 'gusto', name: 'Gusto', type: 'HR' },
    { id: 'rippling', name: 'Rippling', type: 'HR' },
];

export function opDebouncer<T extends (...args: any[]) => void>(
  f: T,
  d: number
): T {
  let t: ReturnType<typeof setTimeout> | null = null;
  return function (this: ThisParameterType<T>, ...a: Parameters<T>) {
    const c = this;
    if (t) {
      clearTimeout(t);
    }
    t = setTimeout(() => f.apply(c, a), d);
  } as T;
}

export function genUniqStr(p: string = "uid-"): string {
  const r =
    typeof crypto !== "undefined" && crypto.getRandomValues
      ? Array.from(crypto.getRandomValues(new Uint8Array(20)))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
      : Math.random().toString(36).substring(2, 12);
  return p + r + Date.now().toString(36);
}

export function fmtCcy(
  v: number | string | null | undefined,
  c: string = "USD",
  l: string = "en-US",
  o?: Intl.NumberFormatOptions
): string {
  if (v === null || v === undefined || isNaN(Number(v))) {
    return "ERR_NO_VAL";
  }
  return new Intl.NumberFormat(l, {
    style: "currency",
    currency: c,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...o,
  }).format(Number(v));
}

export function fmtPct(
  v: number | null | undefined,
  l: string = "en-US",
  o?: Intl.NumberFormatOptions
): string {
  if (v === null || v === undefined || isNaN(Number(v))) {
    return "ERR_NO_VAL";
  }
  return new Intl.NumberFormat(l, {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...o,
  }).format(Number(v) / 100);
}

export function fmtDt(
  d: Date | string | null | undefined,
  f: string = "YYYY-MM-DD HH:mm:ss z",
  z: string = moment.tz.guess()
): string {
  if (!d) return "ERR_NO_DATE";
  try {
    return moment.tz(d, z).format(f);
  } catch (e) {
    console.error("Date format error:", e, { d, f, z });
    return "INVALID_DATE";
  }
}

export const SysAuditSvc = {
  logEvt: async (
    evt: string,
    p: Record<string, any>,
    s: "info" | "warn" | "error" | "security" | "fatal" = "info"
  ): Promise<void> => {
    const l = {
      evt,
      p: JSON.stringify(p),
      s,
      ts: new Date().toISOString(),
      uId: "sim_usr_456",
      sId: "sim_ses_def",
      src: "AcctAnalyticsModule",
    };
    console.log(`[SYS_AUDIT:${s.toUpperCase()}]`, l);
    return Promise.resolve();
  },
};

export enum CDBI_AI_SignalType {
  AnomDetect = "ANOMALY_DETECTION",
  LiqForecast = "LIQUIDITY_FORECAST",
  RiskEval = "RISK_ASSESSMENT",
  SpendPatt = "SPENDING_PATTERN",
  TxnClassify = "TRANSACTION_CATEGORIZATION",
  SentiAnalysis = "SENTIMENT_ANALYSIS",
  RegCompliance = "REGULATORY_COMPLIANCE",
  MktCorrelation = "MARKET_CORRELATION",
  OpEfficiency = "OPERATIONAL_EFFICIENCY",
  FinHealthScore = "FINANCIAL_HEALTH_SCORE",
  SupplyChainFin = "SUPPLY_CHAIN_FINANCE",
  GeoPolImpact = "GEOPOLITICAL_IMPACT",
  CyberThreat = "CYBER_THREAT_VECTOR",
  CustChurnPredict = "CUSTOMER_CHURN_PREDICTION",
}

export interface CDBI_AI_Signal {
  uid: string;
  typ: CDBI_AI_SignalType;
  hdr: string;
  dsc: string;
  svt: "trivial" | "low" | "medium" | "high" | "critical";
  scr: number;
  ts: string;
  dtlUrl?: string;
  acctId?: string;
  txnId?: string;
  recAct?: string;
  st: "fresh" | "seen" | "actioned" | "archived";
  resNotes?: string;
  aiConf: number;
  tags: string[];
}

export interface PredictiveTrajectory {
  ts: string;
  predBal: number;
  minBal: number;
  maxBal: number;
  confInt: number;
  fcastPeriod: "D" | "W" | "M" | "Q" | "Y";
  trends: {
    period: "D" | "W" | "M";
    delta: number;
    deltaPct: number;
    summary: string;
  }[];
  drivers: {
    name: string;
    impact: number;
    type: "in" | "out" | "mkt" | "seasonal" | "evt";
    confidence: number;
  }[];
  modelAccScore: number;
}

export interface MktSnapshot {
  ts: string;
  pair: string;
  rate: number;
  volIdx: number;
  newsSenti: number;
  impactSum: string;
  majIdx: { n: string; v: number; c: number }[];
  commods: { n: string; v: number; u: string }[];
}

export enum ThreatLvl {
  None = "NONE",
  Low = "LOW",
  Guarded = "GUARDED",
  Elevated = "ELEVATED",
  High = "HIGH",
  Severe = "SEVERE",
}

export interface ThreatVector {
  uid: string;
  txnId: string;
  alertTyp:
    | "abnormal_val"
    | "geo_mismatch"
    | "freq_attempts"
    | "new_payee_high_val"
    | "ip_rep_low"
    | "behavioral_drift";
  riskLvl: ThreatLvl;
  dsc: string;
  ts: string;
  st: "pending" | "false_pos" | "confirmed" | "escalated";
  action?: string;
  analystId?: string;
  score: number;
  affAcctIds: string[];
}

export interface RegCheckResult {
  ruleUid: string;
  ruleName: string;
  st: "ok" | "fail" | "review";
  svt: "info" | "warning" | "violation";
  dtl: string;
  recs?: string[];
  ts: string;
  regFmwk: string;
  evdUrl?: string;
}

export interface FabricatedDoc {
  uid: string;
  title: string;
  body: string;
  ts: string;
  docTyp:
    | "ExecBrief"
    | "AnomalyDeepDive"
    | "ForecastAnalysis"
    | "ComplianceNarrative"
    | "AuditTrailSummary"
    | "LiquidityReview"
    | "RiskExposureReport"
    | "SpendOptimizationPlan";
  params: Record<string, any>;
  fmt: "txt" | "md" | "html";
  author: "CDBI Gemini AI Core";
  ver: string;
}

export interface DLT_Trace {
  txHash: string;
  st: "ok" | "pending" | "fail";
  block: number | null;
  ts: string | null;
  fromAddr: string;
  toAddr: string;
  val: number;
  asset: string;
  net: string;
  confirms: number | null;
  explorerUrl: string;
  gasUsed: number | null;
  gasPrice: number | null;
  fee: number | null;
}

export interface SimOutput {
  uid: string;
  scenario: string;
  inputs: Record<string, any>;
  simAcctId: string;
  outcome: string;
  metrics: {
    balDelta: number;
    volDelta: number;
    liqImpactPct: number;
    riskScoreDelta: number;
    profitDelta: number;
  };
  ts: string;
  st: "done" | "running" | "failed" | "stopped";
  vizUrl?: string;
  reportId?: string;
}

export const MockCDBI_Svc = {
  fetchSignals: async (
    acctId: string,
    dr: DateRangeFormValues,
    typ?: CDBI_AI_SignalType
  ): Promise<CDBI_AI_Signal[]> => {
    SysAuditSvc.logEvt("CDBI_FETCH_SIGNALS", { acctId, dr, typ });
    return new Promise((res) => {
      setTimeout(() => {
        const s: CDBI_AI_Signal[] = [
          {
            uid: genUniqStr("sig"),
            typ: CDBI_AI_SignalType.AnomDetect,
            hdr: "Atypical High-Value Disbursement",
            dsc:
              "A disbursement greatly exceeding historical norms was seen in the 'Corp Ops' ledger.",
            svt: "critical",
            scr: 0.98,
            ts: moment().subtract(3, "hours").toISOString(),
            dtlUrl: `/accounts/${genUniqStr()}/txns/${genUniqStr()}`,
            acctId: "acct_456",
            txnId: "txn_xyz_789",
            recAct: "Immediate validation required. Escalate to fraud division if anomalous.",
            st: "fresh",
            aiConf: 0.99,
            tags: ["priority", "fraud", "sec"],
          },
          {
            uid: genUniqStr("sig"),
            typ: CDBI_AI_SignalType.LiqForecast,
            hdr: "Projected Liquidity Deficit in 14 Days",
            dsc:
              "Forecast indicates outflows will surpass inflows due to upcoming large obligations and market trends.",
            svt: "high",
            scr: 0.85,
            ts: moment().subtract(2, "days").toISOString(),
            dtlUrl: "#",
            recAct: "Prepare contingency funding sources; reschedule non-critical payables.",
            st: "fresh",
            aiConf: 0.88,
            tags: ["liquidity", "forecast", "planning"],
          },
          {
            uid: genUniqStr("sig"),
            typ: CDBI_AI_SignalType.CustChurnPredict,
            hdr: "High Churn Probability for Key Client",
            dsc:
              "Interaction patterns and transaction velocity for 'Global MegaCorp' indicate a high probability of churn in the next quarter.",
            svt: "high",
            scr: 0.91,
            ts: moment().subtract(1, "day").toISOString(),
            dtlUrl: "#",
            recAct: "Engage client success manager immediately; review service level agreements and recent support tickets.",
            st: "fresh",
            aiConf: 0.93,
            tags: ["churn", "client-risk", "crm"],
          },
        ];
        res(s.slice(0, CDBI_GEMINI_SYS_CONF.maxSignalsDisplay));
      }, Math.random() * 1200 + 400);
    });
  },

  fetchTrajectory: async (
    acctId: string,
    p: "D" | "W" | "M" | "Q" | "Y"
  ): Promise<PredictiveTrajectory> => {
    SysAuditSvc.logEvt("CDBI_FETCH_TRAJECTORY", { acctId, p });
    return new Promise((res, rej) => {
      setTimeout(() => {
        if (!acctId) {
          return rej(new Error("Acct ID is mandatory for f_cast."));
        }
        const b = Math.random() * 20000000 + 10000000;
        const c = Math.random() * 1000000 * (Math.random() > 0.5 ? 1 : -1);
        const pb = b + c;
        const conf = Math.random() * 25 + 70;
        res({
          ts: new Date().toISOString(),
          predBal: pb,
          minBal: pb * (1 - (100 - conf) / 150),
          maxBal: pb * (1 + (100 - conf) / 150),
          confInt: Math.round(conf),
          fcastPeriod: p,
          trends: [
            {
              period: "W",
              delta: c / 12,
              deltaPct: (c / b) * 100,
              summary: `Projected ${c > 0 ? "growth" : "decline"} in weekly balance.`,
            },
          ],
          drivers: [
            {
                name: "Major Acct Receipts",
                impact: 500000 * (Math.random() * 0.4 + 0.8),
                type: "in",
                confidence: 0.97,
            },
            {
                name: "Payroll & OpEx",
                impact: -300000 * (Math.random() * 0.3 + 0.85),
                type: "out",
                confidence: 0.99,
            },
             {
                name: "Market Volatility Index",
                impact: -50000 * (Math.random() * 0.5 + 0.5),
                type: "mkt",
                confidence: 0.75,
            }
          ],
          modelAccScore: Math.random() * 0.1 + 0.88,
        });
      }, Math.random() * 1300 + 600);
    });
  },

  fabricateDoc: async (
    docTyp: FabricatedDoc["docTyp"],
    params: Record<string, any>
  ): Promise<FabricatedDoc> => {
    SysAuditSvc.logEvt("CDBI_FABRICATE_DOC", { docTyp, params });
    return new Promise((res) => {
      setTimeout(() => {
        const content = `### Fabricated Document: ${docTyp}\n**Timestamp:** ${fmtDt(new Date())}\n**Parameters:**\n\`\`\`json\n${JSON.stringify(params, null, 2)}\n\`\`\`\n\nThis is an auto-generated document from the ${CITI_BIZ_ENTITY_NAME} Gemini AI Core. It contains synthesized analysis based on the provided parameters. Further details would be populated here by the generative model based on real-time data analysis, integrating insights from various connected systems like Salesforce, Plaid, and internal ledgers. The system is designed to produce rich, context-aware narratives for executive decision-making.`;
        res({
          uid: genUniqStr("doc"),
          title: `${docTyp} - ${fmtDt(new Date(), "YYYY-MM-DD")}`,
          body: content,
          ts: new Date().toISOString(),
          docTyp: docTyp,
          params: params,
          fmt: "md",
          author: "CDBI Gemini AI Core",
          ver: "3.2.1",
        });
      }, Math.random() * 2500 + 1000);
    });
  },

  executeSim: async (
    s: string,
    p: Record<string, any>
  ): Promise<SimOutput> => {
    SysAuditSvc.logEvt("CDBI_EXECUTE_SIM", { s, p });
    return new Promise((res, rej) => {
      setTimeout(() => {
        const ib = p.initialBalance || 20000000;
        const tv = p.transactionVolume || 1000000;
        const ms = p.marketShift || 0.02;

        const bd = (tv * (Math.random() - 0.5) * 0.3) + (ib * ms * (Math.random() * 2 - 1));
        const li = (bd / ib) * 100 * (Math.random() * 0.6 + 0.7);
        
        res({
          uid: genUniqStr("sim"),
          scenario: s,
          inputs: p,
          simAcctId: p.acctId || "Sim-Global-Acct",
          outcome: `Simulation '${s}' is complete. The projected balance delta is ${fmtCcy(bd)} with a liquidity impact of ${fmtPct(li)}.`,
          metrics: {
            balDelta: bd,
            volDelta: tv * (Math.random() * 0.15 - 0.07),
            liqImpactPct: li,
            riskScoreDelta: (Math.random() - 0.5) * 15,
            profitDelta: ib * (p.profitabilityFactor || 0.03) * (Math.random() * 2 - 1),
          },
          ts: new Date().toISOString(),
          st: "done",
          vizUrl: `/api/sim-chart-img/${genUniqStr()}?s=${encodeURIComponent(s)}`,
          reportId: genUniqStr("doc"),
        });
      }, Math.random() * 3500 + 1500);
    });
  },
};

export const MockMktDataSvc = {
  fetchMktSnapshot: async (
    pair: string = "USD/EUR"
  ): Promise<MktSnapshot> => {
    SysAuditSvc.logEvt("FETCH_MKT_SNAPSHOT", { pair });
    return new Promise((res) => {
      setTimeout(() => {
        res({
          ts: new Date().toISOString(),
          pair: pair,
          rate: Math.random() * 0.22 + 0.84,
          volIdx: Math.random() * 12 + 10,
          newsSenti: Math.random() * 2 - 1,
          impactSum: "Central bank policy hints and geopolitical tensions are driving short-term currency fluctuations.",
          majIdx: [
            { n: "DOW", v: Math.random() * 500 + 34000, c: Math.random() * 200 * (Math.random() > 0.5 ? 1 : -1) },
            { n: "FTSE 100", v: Math.random() * 200 + 7500, c: Math.random() * 80 * (Math.random() > 0.5 ? 1 : -1) },
          ],
          commods: [
            { n: "WTI Crude", v: Math.random() * 15 + 75, u: "USD/bbl" },
            { n: "Silver", v: Math.random() * 5 + 22, u: "USD/oz" },
          ],
        });
      }, Math.random() * 600 + 250);
    });
  },
};

export const MockDLT_Svc = {
  traceDltTx: async (
    h: string,
    n: string = "Ethereum"
  ): Promise<DLT_Trace> => {
    SysAuditSvc.logEvt("TRACE_DLT_TX", { h, n });
    return new Promise((res, rej) => {
      setTimeout(() => {
        if (!h.startsWith("0x") || h.length < 42) {
          return rej(new Error("Malformed transaction hash."));
        }
        const block = Math.floor(Math.random() * 20000000) + 10000000;
        const val = Math.random() * 5000 + 100;
        const gu = Math.floor(Math.random() * 150000) + 21000;
        const gp = Math.random() * 60 + 15;
        res({
          txHash: h,
          st: "ok",
          block: block,
          ts: moment().subtract(20, "minutes").toISOString(),
          fromAddr: `0x${genUniqStr("addr")}`,
          toAddr: `0x${genUniqStr("addr")}`,
          val: val,
          asset: "ETH",
          net: n,
          confirms: Math.floor(Math.random() * 30) + 5,
          explorerUrl: `https://etherscan.io/tx/${h}`,
          gasUsed: gu,
          gasPrice: gp,
          fee: (gu * gp) / 1_000_000_000,
        });
      }, Math.random() * 1100 + 600);
    });
  },
};

export function useCDBI_Signals(
  acctId: string,
  dr: DateRangeFormValues,
  sigTyp?: CDBI_AI_SignalType
) {
  const [s, setS] = useState<CDBI_AI_Signal[]>([]);
  const [l, setL] = useState(false);
  const [e, setE] = useState<string | null>(null);

  const fetchDat = useCallback(async () => {
    if (!acctId) {
      setS([]);
      return;
    }
    setL(true);
    setE(null);
    try {
      const d = await MockCDBI_Svc.fetchSignals(
        acctId,
        dr,
        sigTyp
      );
      setS(d);
    } catch (err: any) {
      setE(err.message || "Signal acquisition failed.");
      SysAuditSvc.logEvt(
        "CDBI_SIGNALS_ERR",
        { acctId, dr, sigTyp, error: err.message },
        "error"
      );
    } finally {
      setL(false);
    }
  }, [acctId, dr, sigTyp]);

  useEffect(() => {
    fetchDat();
    const i = setInterval(fetchDat, CDBI_GEMINI_SYS_CONF.dataPollIntervalMillis);
    return () => clearInterval(i);
  }, [fetchDat]);

  return { sigs: s, ld: l, err: e, rfrsh: fetchDat };
}

export function useCDBI_Trajectory(
  acctId: string,
  p: "D" | "W" | "M" | "Q" | "Y"
) {
  const [f, setF] = useState<PredictiveTrajectory | null>(null);
  const [l, setL] = useState(false);
  const [e, setE] = useState<string | null>(null);

  const fetchDat = useCallback(async () => {
    if (!acctId) {
      setF(null);
      setE("Select an account for trajectory prediction.");
      return;
    }
    setL(true);
    setE(null);
    try {
      const d = await MockCDBI_Svc.fetchTrajectory(acctId, p);
      setF(d);
    } catch (err: any) {
      setE(err.message || "Trajectory acquisition failed.");
      SysAuditSvc.logEvt(
        "CDBI_TRAJECTORY_ERR",
        { acctId, p, error: err.message },
        "error"
      );
    } finally {
      setL(false);
    }
  }, [acctId, p]);

  useEffect(() => {
    fetchDat();
  }, [fetchDat]);

  return { traj: f, ld: l, err: e, rfrsh: fetchDat };
}

export function useMktDataStream(p: string) {
  const [d, setD] = useState<MktSnapshot | null>(null);
  const [l, setL] = useState(false);
  const [e, setE] = useState<string | null>(null);

  const fetchDat = useCallback(async () => {
    setL(true);
    setE(null);
    try {
      const dat = await MockMktDataSvc.fetchMktSnapshot(p);
      setD(dat);
    } catch (err: any) {
      setE(err.message || "Market data stream failed.");
      SysAuditSvc.logEvt(
        "MKT_DATA_ERR",
        { p, error: err.message },
        "error"
      );
    } finally {
      setL(false);
    }
  }, [p]);

  useEffect(() => {
    fetchDat();
    const i = setInterval(fetchDat, CDBI_GEMINI_SYS_CONF.dataPollIntervalMillis);
    return () => clearInterval(i);
  }, [fetchDat]);

  return { mktDat: d, ld: l, err: e, rfrsh: fetchDat };
}

export function OpButton({
  lbl,
  act,
  icn,
  cl,
  vr = "primary",
  isLd = false,
  isDs = false,
  tt,
  ...p
}: {
  lbl: string;
  act: () => void;
  icn?: React.ReactNode;
  cl?: string;
  vr?: "primary" | "secondary" | "ghost" | "destructive" | "outline" | "link";
  isLd?: boolean;
  isDs?: boolean;
  tt?: string;
  [k: string]: any;
}) {
  const btn = (
    <Button
      onClick={act}
      className={cn("gap-2", cl)}
      variant={vr}
      disabled={isLd || isDs}
      aria-label={lbl}
      {...p}
    >
      {isLd ? (
        <LoadingLine className="h-4 w-4 animate-spin" />
      ) : (
        icn && React.cloneElement(icn as React.ReactElement, { className: cn("h-4 w-4", (icn as React.ReactElement)?.props?.className) })
      )}
      {lbl}
    </Button>
  );

  return tt ? (
    <Tooltip delayDuration={250}>
      <TooltipTrigger asChild>{btn}</TooltipTrigger>
      <TooltipContent className="max-w-sm">{tt}</TooltipContent>
    </Tooltip>
  ) : (
    btn
  );
}

export function SignalDisplayCard({
  sig,
  onAck,
  onAct,
}: {
  sig: CDBI_AI_Signal;
  onAck: (uid: string) => void;
  onAct: (uid: string) => void;
}) {
  const sevCls = {
    trivial: "bg-gray-100 text-gray-800 border-gray-300",
    low: "bg-green-100 text-green-800 border-green-300",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
    high: "bg-orange-100 text-orange-800 border-orange-300",
    critical: "bg-red-100 text-red-800 border-red-300",
  };
  const stCls = {
    fresh: "bg-blue-100 text-blue-800",
    seen: "bg-gray-200 text-gray-800",
    actioned: "bg-green-100 text-green-800",
    archived: "bg-purple-100 text-purple-800",
  };

  const getSvtLbl = (s: CDBI_AI_Signal["svt"]) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <Card
      className={cn(
        "shadow-md border-l-8",
        sevCls[sig.svt],
        "hover:shadow-xl transition-all duration-250 ease-in-out"
      )}
    >
      <CardHeader>
        <CardHeading>
          <CardTitle className="flex flex-wrap items-center gap-3 text-xl">
            <Badge className={cn(sevCls[sig.svt])}>{getSvtLbl(sig.svt)}</Badge>
            <Badge className={cn(stCls[sig.st])}>{sig.st.replace(/_/g, " ")}</Badge>
            <span>{sig.hdr}</span>
          </CardTitle>
          <CardDescription className="text-gray-700 text-xs mt-2">
            {fmtDt(sig.ts, "MMM D, YYYY, HH:mm")} | Score: {fmtPct(sig.scr * 100)} | Confidence: {fmtPct(sig.aiConf * 100)}
          </CardDescription>
        </CardHeading>
      </CardHeader>
      <CardContent className="text-base border-t border-gray-200 pt-4">
        <p className="mb-3 text-gray-800 leading-relaxed">{sig.dsc}</p>
        {sig.recAct && (
            <div className="flex items-start gap-2 text-blue-800 text-sm font-semibold p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="i-lucide-lightbulb mt-1" />
                <p><strong>Recommended Action:</strong> {sig.recAct}</p>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        {sig.st === "fresh" && <OpButton lbl="Acknowledge" act={() => onAck(sig.uid)} vr="secondary" />}
        {sig.st !== "actioned" && <OpButton lbl="Take Action" act={() => onAct(sig.uid)} vr="primary" />}
      </CardFooter>
    </Card>
  );
}

export function FabricatedDocViewer({ doc }: { doc: FabricatedDoc }) {
    const fakeMarkdownParser = (txt: string) => {
        let h = txt.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        h = h.replace(/### (.*)/g, "<h3>$1</h3>");
        h = h.replace(/\n/g, "<br/>");
        h = h.replace(/`{3}json([\s\S]*?)`{3}/g, '<pre style="background-color:#f0f0f0; padding:10px; border-radius:5px;"><code>$1</code></pre>');
        return h;
    };

    return (
        <Card className="shadow-lg border-l-8 border-cyan-500">
            <CardHeader>
                <CardHeading>
                    <CardTitle className="text-2xl">{doc.title}</CardTitle>
                    <CardDescription className="text-gray-600 text-sm mt-1">
                        Type: {doc.docTyp} | Generated: {fmtDt(doc.ts)} | Ver: {doc.ver}
                    </CardDescription>
                </CardHeading>
                <CardActions>
                    <OpButton lbl="Download" icn={<span className="i-lucide-download" />} act={() => {}} vr="outline" />
                </CardActions>
            </CardHeader>
            <CardContent className="text-base border-t border-gray-200 pt-4">
                <div dangerouslySetInnerHTML={{ __html: fakeMarkdownParser(doc.body) }} />
            </CardContent>
        </Card>
    );
}

export function TrajectoryDisplay({
  traj, ld, err, ccy = "USD",
}: {
  traj: PredictiveTrajectory | null; ld: boolean; err: string | null; ccy?: string;
}) {
  if (ld) return <Card className="p-5 h-52 flex items-center justify-center"><LoadingLine /></Card>;
  if (err) return <Card className="p-5 h-52 flex items-center justify-center bg-red-100 border-l-8 border-red-600 text-red-800">{err}</Card>;
  if (!traj) return <Card className="p-5 h-52 flex items-center justify-center bg-gray-100 text-gray-600">No trajectory data available.</Card>;

  return (
    <Card className="shadow-lg border-l-8 border-purple-500 hover:shadow-2xl transition-shadow">
      <CardHeader>
        <CardTitle className="text-2xl">
          Trajectory Forecast ({traj.fcastPeriod}) - As of {fmtDt(traj.ts, "MMM D, YYYY")}
        </CardTitle>
        <CardDescription>
          Confidence: {traj.confInt}% | Model Accuracy: {fmtPct(traj.modelAccScore * 100)}
        </CardDescription>
      </CardHeader>
      <CardContent className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
              <Label className="text-sm uppercase text-gray-500">Predicted Balance</Label>
              <div className="text-5xl font-bold text-purple-800 mt-2">{fmtCcy(traj.predBal, ccy)}</div>
              <p className="text-base text-gray-700 mt-2">
                  Range: {fmtCcy(traj.minBal, ccy)} to {fmtCcy(traj.maxBal, ccy)}
              </p>
          </div>
          <div>
              <Label className="text-sm uppercase text-gray-500">Primary Drivers</Label>
              <ul className="list-disc list-inside text-base text-gray-800 mt-2 space-y-2">
                  {traj.drivers.map((d, i) => (
                      <li key={i}>
                          {d.name}: <span className="font-semibold">{fmtCcy(d.impact, ccy, "en-US", { signDisplay: "always" })}</span> ({d.type}, Conf: {fmtPct(d.confidence * 100)})
                      </li>
                  ))}
              </ul>
          </div>
      </CardContent>
    </Card>
  );
}

export function SimConfigModule({
  onExec, isLd, acctId,
}: {
  onExec: (s: string, p: Record<string, any>) => void; isLd: boolean; acctId: string;
}) {
  const [s, setS] = useState("Standard Market Fluctuation");
  const [ib, setIb] = useState("25000000");
  const [tv, setTv] = useState("2000000");
  const [ms, setMs] = useState("0.03");
  const [adv, setAdv] = useState(false);

  const doSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acctId) {
        alert("Account must be selected for simulation.");
        return;
    }
    const p = {
        acctId,
        initialBalance: parseFloat(ib),
        transactionVolume: parseFloat(tv),
        marketShift: parseFloat(ms),
    };
    SysAuditSvc.logEvt("SIM_EXEC_INIT", p, "security");
    onExec(s, p);
  };

  return (
    <Card className="shadow-lg border-l-8 border-teal-500">
        <CardHeader>
            <CardTitle className="text-2xl">New Scenario Simulation</CardTitle>
            <CardDescription>Define parameters for a what-if analysis using the CDBI Gemini Simulation Engine.</CardDescription>
        </CardHeader>
        <CardContent className="border-t border-gray-200 pt-4">
            <form onSubmit={doSubmit} className="space-y-5">
                <TextField label="Scenario Name" value={s} onChange={(e) => setS(e.target.value)} required />
                <TextField label="Initial Account Balance" type="number" value={ib} onChange={(e) => setIb(e.target.value)} required />
                <TextField label="Estimated Transaction Volume" type="number" value={tv} onChange={(e) => setTv(e.target.value)} required />
                <div className="flex items-center gap-3 mt-5">
                    <Label htmlFor="adv-sim-toggle" className="cursor-pointer">Advanced Options</Label>
                    <Switch id="adv-sim-toggle" checked={adv} onCheckedChange={setAdv} />
                </div>
                {adv && (
                    <div className="space-y-5 p-4 border-l-4 border-teal-200 bg-teal-50 rounded-r-lg">
                        <TextField label="Market Shift Multiplier (e.g., -0.1 for -10%)" type="number" step="0.01" value={ms} onChange={(e) => setMs(e.target.value)} />
                    </div>
                )}
                <OpButton lbl="Execute Simulation" icn={<span className="i-lucide-play-circle" />} act={doSubmit} isLd={isLd} isDs={!acctId || isLd} type="submit" className="w-full mt-6" />
            </form>
        </CardContent>
    </Card>
  );
}

export function SimResultDisplay({
  res, isLd, err,
}: {
  res: SimOutput | null; isLd: boolean; err: string | null;
}) {
    if (isLd) return <Card className="p-5 h-64 flex flex-col items-center justify-center"><Progress value={Math.random() * 100} className="w-full my-4" /><p>Executing simulation...</p></Card>;
    if (err) return <Card className="p-5 h-64 flex items-center justify-center bg-red-100 border-l-8 border-red-600 text-red-800">{err}</Card>;
    if (!res) return null;

    return (
        <Card className="shadow-xl border-l-8 border-blue-500">
            <CardHeader>
                <CardTitle className="text-2xl">Simulation Result: {res.scenario}</CardTitle>
                <CardDescription>Generated: {fmtDt(res.ts)} | Status: <Badge className={res.st === "done" ? "bg-green-200" : "bg-yellow-200"}>{res.st}</Badge></CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 border-t border-gray-200 pt-4">
                <p className="text-lg text-gray-800">{res.outcome}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-100 rounded-lg">
                        <Label className="text-sm uppercase text-gray-600">Balance Delta</Label>
                        <div className="text-3xl font-bold mt-1">{fmtCcy(res.metrics.balDelta, "USD", "en-US", { signDisplay: "always" })}</div>
                    </div>
                    <div className="p-4 bg-gray-100 rounded-lg">
                        <Label className="text-sm uppercase text-gray-600">Liquidity Impact</Label>
                        <div className={cn("text-3xl font-bold mt-1", res.metrics.liqImpactPct < 0 ? "text-red-700" : "text-green-700")}>{fmtPct(res.metrics.liqImpactPct)}</div>
                    </div>
                     <div className="p-4 bg-gray-100 rounded-lg">
                        <Label className="text-sm uppercase text-gray-600">Risk Score Delta</Label>
                        <div className={cn("text-3xl font-bold mt-1", res.metrics.riskScoreDelta > 0 ? "text-red-700" : "text-green-700")}>{res.metrics.riskScoreDelta > 0 ? "+" : ""}{res.metrics.riskScoreDelta.toFixed(2)} pts</div>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                 <OpButton lbl="Generate Full Analysis Doc" act={() => alert(`Generating doc for sim ${res.uid}`)} vr="secondary" />
            </CardFooter>
        </Card>
    );
}

type QueryParams = {
  tsRange: DateRangeFormValues;
  acctId: string;
};

const DEFAULT_Q_PARAMS: QueryParams = {
  tsRange: DATE_RANGE_FILTERS.PastMonth.dateRange,
  acctId: "",
};

export default function AcctAnalyticsModule() {
  const [q, setQ] = useState<QueryParams>(DEFAULT_Q_PARAMS);
  const [tab, setTab] = useState<string>("main");

  const { data, loading, error } = useLedgerStatsWidgetQuery({
    variables: {
      createdAt: dateSearchMapper(q.tsRange),
      ledgerId: q.acctId,
    },
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  const { sigs, ld: sigLd, err: sigErr, rfrsh: sigRfrsh } = useCDBI_Signals(q.acctId, q.tsRange);
  const { traj, ld: trajLd, err: trajErr, rfrsh: trajRfrsh } = useCDBI_Trajectory(q.acctId, "M");
  const { mktDat, ld: mktLd, err: mktErr, rfrsh: mktRfrsh } = useMktDataStream("USD/EUR");
  
  const [fabDocLd, setFabDocLd] = useState(false);
  const [fabDocErr, setFabDocErr] = useState<string|null>(null);
  const [fabDocs, setFabDocs] = useState<FabricatedDoc[]>([]);

  const [simRes, setSimRes] = useState<SimOutput | null>(null);
  const [simLd, setSimLd] = useState(false);
  const [simErr, setSimErr] = useState<string | null>(null);

  const [dltTraceLd, setDltTraceLd] = useState(false);
  const [dltTraceErr, setDltTraceErr] = useState<string | null>(null);
  const [dltTraceRes, setDltTraceRes] = useState<DLT_Trace | null>(null);
  const [dltHash, setDltHash] = useState("");

  const acctOpts = useMemo(
    () =>
      loading || !data || error
        ? []
        : data.ledgers.edges.map(({ node }) => ({
            label: node.name,
            value: node.id,
          })),
    [data, loading, error]
  );
  
  const ts = moment().format("MMM D, YYYY, HH:mm:ss");

  const handleAckSignal = useCallback((uid: string) => {
    // a real implementation would patch the backend
    SysAuditSvc.logEvt("SIGNAL_ACKNOWLEDGED", { signalUid: uid });
  }, []);
  
  const handleActSignal = useCallback((uid: string) => {
    // a real implementation would patch the backend
    SysAuditSvc.logEvt("SIGNAL_ACTIONED", { signalUid: uid });
  }, []);

  const handleFabDoc = useCallback(
    async (
      docTyp: FabricatedDoc["docTyp"],
      p: Record<string, any>
    ) => {
      setFabDocLd(true);
      setFabDocErr(null);
      try {
        const d = await MockCDBI_Svc.fabricateDoc(docTyp, p);
        setFabDocs((prev) => [d, ...prev].slice(0, CDBI_GEMINI_SYS_CONF.maxDocsDisplay));
      } catch (err: any) {
        setFabDocErr(err.message || `Failed to fabricate ${docTyp}`);
      } finally {
        setFabDocLd(false);
      }
    },
    []
  );

  const handleExecSim = useCallback(
    async (s: string, p: Record<string, any>) => {
      setSimLd(true);
      setSimErr(null);
      setSimRes(null);
      try {
        const r = await MockCDBI_Svc.executeSim(s, p);
        setSimRes(r);
      } catch (err: any) {
        setSimErr(err.message || "Simulation execution failed.");
      } finally {
        setSimLd(false);
      }
    },
    []
  );

  const handleDltTrace = useCallback(async () => {
    if (!dltHash) {
      setDltTraceErr("A transaction hash is required.");
      return;
    }
    setDltTraceLd(true);
    setDltTraceErr(null);
    setDltTraceRes(null);
    try {
      const r = await MockDLT_Svc.traceDltTx(dltHash);
      setDltTraceRes(r);
    } catch (err: any) {
      setDltTraceErr(err.message || "DLT trace failed.");
    } finally {
      setDltTraceLd(false);
    }
  }, [dltHash]);

  const TABS_CONFIG = useMemo(() => ([
    { id: "main", lbl: "Primary Dashboard" },
    { id: "signals", lbl: "CDBI Gemini Signals" },
    { id: "f_cast", lbl: "Predictive Trajectory" },
    { id: "sim_lab", lbl: "Simulation Laboratory" },
    { id: "doc_gen", lbl: "Document Fabricator" },
    { id: "dlt_trace", lbl: "DLT Tracer" },
    { id: "mkt_pulse", lbl: "Market Pulse" },
  ]), []);

  const a_plethora_of_buttons = Array.from({length: 2987}).map((_, i) => ({
    lbl: `Automated Workflow ${i + 1}`,
    act: () => alert(`Triggering workflow #${i + 1}`),
    icn: <span className="i-lucide-zap" />,
    tt: `This action triggers a pre-configured automation workflow (ID: ${i + 1}) via Pipedream or Zapier.`,
    isDs: !q.acctId,
  }));

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="p-5 border-b border-gray-300">
        <CardHeading>
          <CardTitle className="text-4xl font-black text-gray-800">
            {CITI_BIZ_ENTITY_NAME} Intelligence Hub
          </CardTitle>
          <CardDescription className="text-gray-700 mt-3 text-base">
            Integrated Financial Analytics powered by the CDBI Gemini AI Core.
            <br />
            Data current as of: <time dateTime={moment().toISOString()}>{ts}</time>
          </CardDescription>
        </CardHeading>
        <CardActions className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0 items-end">
          <SelectField
            placeholder="Global View"
            selectValue={q.acctId}
            handleChange={(acctId: string) => {
              setQ({ ...q, acctId });
              SysAuditSvc.logEvt("ACCT_FILTER_MOD", { newAcctId: acctId });
            }}
            options={[{ label: "Global View (All Accounts)", value: "" }, ...acctOpts]}
          />
          <DateRangeSelectField
            initialSelected={DATE_RANGE_FILTERS.PastMonth.label}
            onChange={(v) => {
              setQ({ ...q, tsRange: v });
              SysAuditSvc.logEvt("DATERANGE_FILTER_MOD", { newRange: v });
            }}
            options={DATE_RANGE_FILTERS_OPTIONS}
          />
        </CardActions>
      </CardHeader>

      <div className="border-b border-gray-300 px-5 bg-gray-100 sticky top-0 z-10">
        <nav className="-mb-px flex flex-wrap gap-x-8" aria-label="Module Tabs">
          {TABS_CONFIG.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "whitespace-nowrap py-4 px-1 border-b-4 font-semibold text-base transition-colors",
                t.id === tab ? "border-blue-700 text-blue-800" : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-400"
              )}
              aria-current={t.id === tab ? "page" : undefined}
            >
              {t.lbl}
            </button>
          ))}
        </nav>
      </div>

      <CardContent className="flex-grow p-5 overflow-y-auto bg-gray-50">
        {tab === "main" && (
            <Stack className="gap-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card><CardHeader><CardTitle>Total Linked Accounts</CardTitle></CardHeader><CardContent className="text-4xl font-bold">{loading ? <LoadingLine/> : data?.ledgerAccounts.totalCount ?? "N/A"}</CardContent></Card>
                    <Card><CardHeader><CardTitle>Total Transactions</CardTitle></CardHeader><CardContent className="text-4xl font-bold">{loading ? <LoadingLine/> : data?.ledgerTransactionCount.count ?? "N/A"}</CardContent></Card>
                    <Card><CardHeader><CardTitle>Fresh AI Signals</CardTitle></CardHeader><CardContent className="text-4xl font-bold">{sigLd ? <LoadingLine/> : sigs.filter(s => s.st === "fresh").length}</CardContent></Card>
                    <Card><CardHeader><CardTitle>Active Simulations</CardTitle></CardHeader><CardContent className="text-4xl font-bold">{simLd ? <LoadingLine/> : (simRes && simRes.st === 'running' ? 1 : 0)}</CardContent></Card>
                </div>
                <h3 className="text-3xl font-bold mt-8 mb-4 text-gray-900 border-b-2 pb-4 border-gray-300">
                    High-Impact Operations
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                    {a_plethora_of_buttons.slice(0, 10).map((b, i) => <OpButton key={`op-btn-${i}`} {...b} vr="secondary" className="h-24"/>)}
                </div>
            </Stack>
        )}
        {tab === "signals" && (
            <Stack className="gap-8">
                <h2 className="text-4xl font-bold text-gray-900">CDBI Gemini AI Signals Feed</h2>
                {sigLd && <LoadingLine className="h-10"/>}
                {sigErr && <div className="text-red-700 p-5 bg-red-100 border border-red-300 rounded-lg">Error: {sigErr}</div>}
                {!sigLd && !sigErr && sigs.length === 0 && <div className="text-gray-600 p-5 bg-gray-100 border rounded-lg">No signals match the current criteria.</div>}
                <Stack className="gap-6">
                    {sigs.map((s) => <SignalDisplayCard key={s.uid} sig={s} onAck={handleAckSignal} onAct={handleActSignal} />)}
                </Stack>
            </Stack>
        )}
        {tab === "f_cast" && (
            <Stack className="gap-8">
                <h2 className="text-4xl font-bold text-gray-900">Predictive Financial Trajectory</h2>
                <TrajectoryDisplay traj={traj} ld={trajLd} err={trajErr} />
                <OpButton lbl="Recalculate Trajectory" act={trajRfrsh} isLd={trajLd} isDs={!q.acctId} vr="outline" />
            </Stack>
        )}
        {tab === "sim_lab" && (
            <Stack className="gap-8">
                <h2 className="text-4xl font-bold text-gray-900">Simulation Laboratory</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <SimConfigModule onExec={handleExecSim} isLd={simLd} acctId={q.acctId} />
                    <SimResultDisplay res={simRes} isLd={simLd} err={simErr} />
                </div>
            </Stack>
        )}
        {tab === "doc_gen" && (
            <Stack className="gap-8">
                <h2 className="text-4xl font-bold text-gray-900">Generative Document Fabricator</h2>
                <Card className="p-5">
                    <CardTitle className="text-2xl mb-4">Fabricate New Document</CardTitle>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <OpButton lbl="Exec Brief" act={() => handleFabDoc("ExecBrief", {acctId: q.acctId, range: q.tsRange})} isLd={fabDocLd} vr="primary" />
                        <OpButton lbl="Risk Report" act={() => handleFabDoc("RiskExposureReport", {acctId: q.acctId, level: "high"})} isLd={fabDocLd} vr="primary" />
                        <OpButton lbl="Liquidity Doc" act={() => handleFabDoc("LiquidityReview", {acctId: q.acctId})} isLd={fabDocLd} vr="primary" />
                        <OpButton lbl="Spend Plan" act={() => handleFabDoc("SpendOptimizationPlan", {acctId: q.acctId})} isLd={fabDocLd} vr="primary" />
                    </div>
                </Card>
                <h3 className="text-3xl font-bold mt-8 text-gray-900">Fabricated Documents Archive</h3>
                <Stack className="gap-6">
                    {fabDocs.map(d => <FabricatedDocViewer key={d.uid} doc={d} />)}
                </Stack>
            </Stack>
        )}
        {tab === "dlt_trace" && (
            <Stack className="gap-8">
                <h2 className="text-4xl font-bold text-gray-900">Distributed Ledger Transaction Tracer</h2>
                <Card className="p-5">
                     <TextField label="Transaction Hash" value={dltHash} onChange={(e) => setDltHash(e.target.value)} placeholder="0x..." />
                     <OpButton lbl="Trace on DLT" act={handleDltTrace} isLd={dltTraceLd} className="mt-4" />
                </Card>
                {dltTraceLd && <LoadingLine/>}
                {dltTraceErr && <div className="text-red-700 p-5 bg-red-100">{dltTraceErr}</div>}
                {dltTraceRes && <Card className="p-5"><pre>{JSON.stringify(dltTraceRes, null, 2)}</pre></Card>}
            </Stack>
        )}
        {tab === "mkt_pulse" && (
             <Stack className="gap-8">
                <h2 className="text-4xl font-bold text-gray-900">Real-Time Market Pulse</h2>
                {mktLd && <LoadingLine/>}
                {mktErr && <div className="text-red-700 p-5 bg-red-100">{mktErr}</div>}
                {mktDat && <Card className="p-5"><pre>{JSON.stringify(mktDat, null, 2)}</pre></Card>}
                <OpButton lbl="Refresh Market Data" act={mktRfrsh} isLd={mktLd}/>
            </Stack>
        )}
        <div style={{ paddingTop: '50px' }}>
          <h3 className="text-3xl font-bold mt-8 mb-4 text-gray-900 border-b-2 pb-4 border-gray-300">
              Extended Workflow Automation Library
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {a_plethora_of_buttons.slice(10, 2987).map((b, i) => <OpButton key={`op-btn-ext-${i}`} {...b} vr="outline" className="h-20"/>)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}