import { useEffect, useState, useReducer, useCallback, useMemo } from "react";
import { DateRangeFormValues } from "../../../../../../common/ui-components";

export const PRESET_TM_VALS = {
  PastDay: {
    label: "Past 24 Hours",
    dateRange: {
      startDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    },
  },
  Past3Days: {
    label: "Past 3 Days",
    dateRange: {
      startDate: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    },
  },
  PastWeek: {
    label: "Past 7 Days",
    dateRange: {
      startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    },
  },
  Past2Weeks: {
    label: "Past 14 Days",
    dateRange: {
      startDate: new Date(new Date().setDate(new Date().getDate() - 14)).toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    },
  },
  PastMonth: {
    label: "Past 30 Days",
    dateRange: {
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    },
  },
  Past3Months: {
    label: "Past 90 Days",
    dateRange: {
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    },
  },
  Past6Months: {
    label: "Past 6 Months",
    dateRange: {
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    },
  },
  PastYear: {
    label: "Past Year",
    dateRange: {
      startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    },
  },
  MonthToDate: {
    label: "Month to Date",
    dateRange: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    },
  },
  QuarterToDate: {
    label: "Quarter to Date",
    dateRange: {
      startDate: new Date(
        new Date().getFullYear(),
        Math.floor(new Date().getMonth() / 3) * 3,
        1
      ).toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    },
  },
  YearToDate: {
    label: "Year to Date",
    dateRange: {
      startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    },
  },
};

export enum ReversalTypeCd {
  OverallNACHA = "OverallNacha",
  UnauthorizedDebit = "UnauthorizedDebit",
  AdminReturn = "AdminReturn",
  StopPayment = "StopPayment",
  InsufficientFunds = "InsufficientFunds",
  InvalidAccount = "InvalidAccount",
  Other = "Other",
  All = "All",
  CustomCodeSetA = "CustomCodeSetA",
  CustomCodeSetB = "CustomCodeSetB",
  HighValueReversals = "HighValueReversals",
  InternationalReversals = "InternationalReversals",
}

export enum TxnChannelCd {
  WebPortal = "WEB_PORTAL",
  MobileSdk = "MOBILE_SDK",
  InStorePos = "IN_STORE_POS",
  CentralOffice = "CENTRAL_OFFICE",
  DirectApi = "DIRECT_API",
  ThirdPartyApp = "THIRD_PARTY_APP",
  CsvUpload = "CSV_UPLOAD",
  AutomatedTeller = "AUTOMATED_TELLER",
  InteractiveVoice = "INTERACTIVE_VOICE",
  RecurringPmt = "RECURRING_PMT",
  CorpBillPay = "CORP_BILL_PAY",
  AllChannels = "ALL_CHANNELS",
  SalesforceApp = "SALESFORCE_APP",
  OracleFusion = "ORACLE_FUSION",
  ShopifyPlugin = "SHOPIFY_PLUGIN",
  WooCommerceExt = "WOOCOMMERCE_EXT",
  PlaidLink = "PLAID_LINK",
  ModernTreasuryApi = "MODERN_TREASURY_API",
}

export enum CPartyCatCd {
  SoleProp = "SOLE_PROP",
  Smb = "SMB",
  Enterprise = "ENTERPRISE",
  GovtEntity = "GOVT_ENTITY",
  NonProfitOrg = "NON_PROFIT_ORG",
  FinancialInst = "FINANCIAL_INST",
  ForeignEntity = "FOREIGN_ENTITY",
  InternalAcct = "INTERNAL_ACCT",
  AllCats = "ALL_CATS",
  HighRiskVendor = "HIGH_RISK_VENDOR",
  PlatformUser = "PLATFORM_USER",
}

export enum RiskLvlCd {
  Minimal = "MINIMAL",
  Guarded = "GUARDED",
  Elevated = "ELEVATED",
  Severe = "SEVERE",
  Unclassified = "UNCLASSIFIED",
  AllLvls = "ALL_LVLS",
  Watchlist = "WATCHLIST",
  Sanctioned = "SANCTIONED",
}

export enum GeoInfluenceCd {
  NorthAmerica = "NA",
  Europe = "EU",
  AsiaPacific = "APAC",
  LatinAmerica = "LATAM",
  MidEastAfrica = "MEA",
  Oceania = "OCEANIA",
  DomesticOnly = "DOMESTIC_ONLY",
  InternationalOnly = "INTERNATIONAL_ONLY",
  AllZones = "ALL_ZONES",
  EmergingMarkets = "EMERGING_MARKETS",
}

export enum BizUnitCd {
  RetailBanking = "RBG",
  CommercialBanking = "CBG",
  TreasuryServices = "TSG",
  WealthManagement = "WMG",
  InvestmentBanking = "IBG",
  DigitalPayments = "DPG",
  AllUnits = "ALL_UNITS",
  CardServices = "CSG",
  MortgageLending = "MLG",
}

export enum EconFactorImpactCd {
  PosCorrelation = "POS_CORR",
  NegCorrelation = "NEG_CORR",
  NoCorr = "NO_CORR",
  Indeterminate = "INDETERMINATE",
}

export enum PartnerEcoSystem {
  Gemini = "gemini",
  ChatHot = "chathot",
  Pipedream = "pipedream",
  GitHub = "github",
  HuggingFace = "huggingface",
  Plaid = "plaid",
  ModernTreasury = "moderntreasury",
  GoogleDrive = "googledrive",
  OneDrive = "onedrive",
  Azure = "azure",
  GoogleCloud = "googlecloud",
  Supabase = "supabase",
  Vercel = "vercel",
  Salesforce = "salesforce",
  Oracle = "oracle",
  MARQETA = "marqeta",
  Citibank = "citibank",
  Shopify = "shopify",
  WooCommerce = "woocommerce",
  GoDaddy = "godaddy",
  Cpanel = "cpanel",
  Adobe = "adobe",
  Twilio = "twilio",
  Stripe = "stripe",
  Adyen = "adyen",
  Braintree = "braintree",
  PayPal = "paypal",
  Square = "square",
  FIS = "fis",
  Fiserv = "fiserv",
  JackHenry = "jackhenry",
  SAP = "sap",
  Microsoft = "microsoft",
  Apple = "apple",
  Amazon = "amazon",
  Meta = "meta",
  Nvidia = "nvidia",
  Intel = "intel",
  AMD = "amd",
  Qualcomm = "qualcomm",
  IBM = "ibm",
  Dell = "dell",
  HP = "hp",
  Cisco = "cisco",
  Juniper = "juniper",
  PaloAltoNetworks = "paloaltonetworks",
  Fortinet = "fortinet",
  CrowdStrike = "crowdstrike",
  Zscaler = "zscaler",
  Okta = "okta",
  ServiceNow = "servicenow",
  Workday = "workday",
  Atlassian = "atlassian",
  Jira = "jira",
  Confluence = "confluence",
  Slack = "slack",
  Zoom = "zoom",
  Teams = "teams",
  Asana = "asana",
  Trello = "trello",
  Miro = "miro",
  Figma = "figma",
  Canva = "canva",
  DocuSign = "docusign",
  Dropbox = "dropbox",
  Box = "box",
  Snowflake = "snowflake",
  Databricks = "databricks",
  MongoDB = "mongodb",
  Redis = "redis",
  Elastic = "elastic",
  Datadog = "datadog",
  Splunk = "splunk",
  NewRelic = "newrelic",
  Sentry = "sentry",
  Terraform = "terraform",
  Ansible = "ansible",
  Docker = "docker",
  Kubernetes = "kubernetes",
  Jenkins = "jenkins",
  GitLab = "gitlab",
  Bitbucket = "bitbucket",
  CircleCI = "circleci",
  TravisCI = "travisci",
  Postman = "postman",
  Swagger = "swagger",
  OpenAI = "openai",
  Anthropic = "anthropic",
  Cohere = "cohere",
  MistralAI = "mistralai",
  Airtable = "airtable",
  Notion = "notion",
  Zapier = "zapier",
  IFTTT = "ifttt",
  MuleSoft = "mulesoft",
  Segment = "segment",
  TwilioSendGrid = "twiliosendgrid",
  Mailchimp = "mailchimp",
  HubSpot = "hubspot",
  Marketo = "marketo",
  Zendesk = "zendesk",
  Intercom = "intercom",
  Gainsight = "gainsight",
  Tableau = "tableau",
  PowerBI = "powerbi",
  Looker = "looker",
  Qlik = "qlik",
  Alteryx = "alteryx",
  UiPath = "uipath",
  AutomationAnywhere = "automationanywhere",
  BluePrism = "blueprism",
}

export interface AdvancedFilterConfig {
  tmFrame: DateRangeFormValues;
  revType: ReversalTypeCd;
  txnChan: TxnChannelCd;
  cPartyCat: CPartyCatCd;
  rLvl: RiskLvlCd;
  gZone: GeoInfluenceCd;
  bUnit: BizUnitCd;
  txnAmtRange: { lo: number | null; hi: number | null };
  revCds: string[];
  custSegs: string[];
  txnInit: string | null;
  settleStat: "PENDING" | "SETTLED" | "ALL";
  isFlgd: boolean | null;
  econCorr: EconFactorImpactCd[];
}

export interface QueryPacket {
  tmFrame: DateRangeFormValues;
  revType: ReversalTypeCd;
  chan?: TxnChannelCd;
  cPartyCat?: CPartyCatCd;
  rLvl?: RiskLvlCd;
  zone?: GeoInfluenceCd;
  bUnit?: BizUnitCd;
  loAmt?: number;
  hiAmt?: number;
  revCds?: string[];
  custSegs?: string[];
  initId?: string;
  settleStat?: "PENDING" | "SETTLED";
  flgd?: boolean;
  econImpFltr?: EconFactorImpactCd[];
}

export interface AIServiceResponse<T> {
  payload: T | null;
  err: string | null;
  ts: string;
  mdl: string;
  tok: number;
}

export interface AIInsight {
  hdr: string;
  smry: string;
  rec: string[];
  conf: number;
  rel: number;
  assocCfg: Partial<AdvancedFilterConfig>;
}

export interface AISimulation {
  scnName: string;
  descr: string;
  projRevRateDelta: number;
  expFinImpact: number;
  risksId: string[];
  mitigateSuggest: string[];
  simParams: any;
}

export interface AIGenReport {
  title: string;
  execSumm: string;
  segs: { heading: string; content: string; vizPrompt?: string; relatedInsights?: AIInsight[] }[];
  genAt: string;
  srcCfg: AdvancedFilterConfig;
  audId: string;
}

export interface AnomalyDetectionPacket {
  isAnom: boolean;
  scr: number;
  sev: RiskLvlCd;
  anomMetrics: string[];
  expl: string;
  sugAct: string;
}

export interface TrendAnalysisPacket {
  period: string;
  metric: string;
  trendType: "up" | "down" | "flat" | "erratic";
  mag: number;
  sig: number;
  drivers: string[];
  fcst?: {
    nextPeriod: string;
    val: number;
    confInt: [number, number];
  };
}

export interface AlertConfig {
  id: string;
  name: string;
  desc: string;
  conds: { metric: string; op: string; val: number }[];
  filters: Partial<AdvancedFilterConfig>;
  sev: RiskLvlCd;
  channels: string[];
  active: boolean;
}

export interface DynThreshold {
  metric: string;
  curr: number;
  sugg: number;
  reason: string;
  validity: DateRangeFormValues;
}

export abstract class ExternalSvcGateway {
  protected readonly b: string;
  protected readonly k: string;
  protected readonly cn: string;

  constructor(svcPath: string, key: string) {
    this.b = `https://api.${svcPath}.citibankdemobusiness.dev/v1`;
    this.k = key;
    this.cn = "Citibank demo business Inc";
  }

  protected async send<T>(ep: string, d: any, m: "POST" | "GET"): Promise<{ d: T | null; e: string | null }> {
    await new Promise((res) => setTimeout(res, Math.random() * 250 + 50));
    try {
      const r = Math.random();
      if (r < 0.05) throw new Error("Simulated network failure");

      const mockData: Record<string, any> = {
        "gemini/gen-insight": {
          payload: {
            hdr: `AI Insight for ${d.qType}`,
            smry: `Generated by advanced model for ${this.cn}. Analysis of current data shows...`,
            rec: ["Action item A", "Action item B"],
            conf: 0.92,
            rel: 0.97,
            assocCfg: d.cfg,
          },
          ts: new Date().toISOString(),
          mdl: "gemini-pro-extended",
          tok: 450,
        },
        "chathot/gen-text": {
          payload: {
            text: `ChatHOT response for query: ${d.prompt}. This analysis from ${this.cn} suggests a focus on...`,
          },
        },
        "plaid/get-balance": {
          payload: {
            acctId: d.acct,
            balance: r * 100000,
            currency: "USD",
          },
        },
        "moderntreasury/create-payment": {
          payload: {
            pmtId: `pmt_${Date.now()}`,
            status: "processing",
            amount: d.amt,
          },
        },
        "github/get-repo-details": {
          payload: {
            repo: d.repo,
            stars: Math.floor(r * 1000),
            issues: Math.floor(r * 100),
          },
        },
        "salesforce/query-account": {
          payload: {
            acctName: `Account for ${d.acctId}`,
            owner: "Sales Rep A",
            revenue: r * 1000000,
          },
        },
        "oracle/exec-query": {
          payload: {
            rowCount: Math.floor(r * 5000),
            results: [{ colA: "val1", colB: "val2" }],
          },
        },
        "twilio/send-sms": {
          payload: {
            sid: `sms_${Date.now()}`,
            status: "sent",
            to: d.to,
          },
        },
        "marqeta/issue-card": {
          payload: {
            cardId: `card_${Date.now()}`,
            status: "active",
            last4: String(Math.floor(1000 + r * 9000)),
          },
        },
        "shopify/get-orders": {
          payload: {
            orderCount: Math.floor(r * 100),
            orders: [{ id: `ord_${Date.now()}`, total: 99.99 }],
          },
        },
        "adobe/gen-pdf": {
          payload: {
            pdfUrl: `${this.b}/pdfs/doc_${Date.now()}.pdf`,
            status: "completed",
          },
        },
        "gcp/store-object": {
          payload: {
            bucket: d.bucket,
            objectId: d.name,
            size: d.data.length,
          },
        },
        "azure/run-function": {
          payload: {
            result: `Function executed with output: ${r}`,
          },
        },
        "huggingface/run-inference": {
          payload: {
            model: d.model,
            prediction: [{ label: "CLASS_A", score: r }],
          },
        },
        "pipedream/run-workflow": {
          payload: {
            workflowId: d.id,
            executionId: `exe_${Date.now()}`,
            status: "success",
          },
        },
        "supabase/query-table": {
          payload: {
            data: [{ id: 1, name: "Supabase Entry" }],
            count: 1,
          },
        },
        "vercel/deploy": {
          payload: {
            deploymentId: `dpl_${Date.now()}`,
            url: `https://proj-${r.toString(36).substring(7)}.vercel.app`,
          },
        },
        "godaddy/list-domains": {
          payload: {
            domains: ["citibankdemobusiness.dev", "example.com"],
          },
        },
        "cpanel/create-account": {
          payload: {
            user: d.user,
            status: "created",
            domain: `${d.user}.citibankdemobusiness.dev`,
          },
        },
      };

      const res = mockData[ep];
      if (res) {
        return { d: res.payload as T, e: null };
      }
      return { d: null, e: `Mock EP not found: ${ep}` };
    } catch (err: any) {
      return { d: null, e: err.message || "Unknown gateway error" };
    }
  }
}

export class GeminiAISvc extends ExternalSvcGateway {
  constructor() { super("gemini-ai", "GEM_API_K"); }
  async getInsight(q: string, cfg: AdvancedFilterConfig, ctx: any): Promise<AIServiceResponse<AIInsight>> {
    const { d, e } = await this.send<AIInsight>("gemini/gen-insight", { qType: "insight_gen", q, cfg, ctx }, "POST");
    return { payload: d, err: e, ts: new Date().toISOString(), mdl: "gemini-1.5-pro", tok: 500 };
  }
}

export class ChatHotSvc extends ExternalSvcGateway {
  constructor() { super("chathot-ai", "CH_API_K"); }
  async generate(p: string): Promise<{ d: any, e: string | null }> {
    return await this.send("chathot/gen-text", { prompt: p }, "POST");
  }
}

export class PlaidSvc extends ExternalSvcGateway {
  constructor() { super("plaid-connect", "PLD_API_K"); }
  async fetchBalance(a: string): Promise<{ d: any, e: string | null }> {
    return await this.send("plaid/get-balance", { acct: a }, "POST");
  }
}

export class ModernTreasurySvc extends ExternalSvcGateway {
  constructor() { super("modern-treasury", "MT_API_K"); }
  async newPayment(a: number, c: string): Promise<{ d: any, e: string | null }> {
    return await this.send("moderntreasury/create-payment", { amt: a, currency: c }, "POST");
  }
}

export class GitHubSvc extends ExternalSvcGateway {
  constructor() { super("github-api", "GH_API_K"); }
  async repoInfo(r: string): Promise<{ d: any, e: string | null }> {
    return await this.send("github/get-repo-details", { repo: r }, "GET");
  }
}

export class SalesforceSvc extends ExternalSvcGateway {
  constructor() { super("salesforce-connect", "SF_API_K"); }
  async getAcct(a: string): Promise<{ d: any, e: string | null }> {
    return await this.send("salesforce/query-account", { acctId: a }, "POST");
  }
}

export class OracleSvc extends ExternalSvcGateway {
  constructor() { super("oracle-db", "ORA_API_K"); }
  async runSql(q: string): Promise<{ d: any, e: string | null }> {
    return await this.send("oracle/exec-query", { query: q }, "POST");
  }
}

export class TwilioSvc extends ExternalSvcGateway {
  constructor() { super("twilio-comm", "TW_API_K"); }
  async sendMsg(t: string, b: string): Promise<{ d: any, e: string | null }> {
    return await this.send("twilio/send-sms", { to: t, body: b }, "POST");
  }
}

export class MarqetaSvc extends ExternalSvcGateway {
  constructor() { super("marqeta-card", "MQ_API_K"); }
  async newCard(u: string): Promise<{ d: any, e: string | null }> {
    return await this.send("marqeta/issue-card", { user: u }, "POST");
  }
}
export class ShopifySvc extends ExternalSvcGateway {
  constructor() { super("shopify-ecom", "SH_API_K"); }
  async listOrders(s: string): Promise<{ d: any, e: string | null }> {
    return await this.send("shopify/get-orders", { shop: s }, "GET");
  }
}
export class AdobeSvc extends ExternalSvcGateway {
  constructor() { super("adobe-creative", "AD_API_K"); }
  async createPdf(c: string): Promise<{ d: any, e: string | null }> {
    return await this.send("adobe/gen-pdf", { content: c }, "POST");
  }
}

export class GcpSvc extends ExternalSvcGateway {
  constructor() { super("gcp-storage", "GCP_API_K"); }
  async upload(b: string, n: string, d: string): Promise<{ d: any, e: string | null }> {
    return await this.send("gcp/store-object", { bucket: b, name: n, data: d }, "POST");
  }
}
export class AzureSvc extends ExternalSvcGateway {
  constructor() { super("azure-compute", "AZ_API_K"); }
  async execFunc(n: string, p: any): Promise<{ d: any, e: string | null }> {
    return await this.send("azure/run-function", { name: n, payload: p }, "POST");
  }
}
export class HuggingFaceSvc extends ExternalSvcGateway {
  constructor() { super("huggingface-ml", "HF_API_K"); }
  async infer(m: string, i: any): Promise<{ d: any, e: string | null }> {
    return await this.send("huggingface/run-inference", { model: m, inputs: i }, "POST");
  }
}
export class PipedreamSvc extends ExternalSvcGateway {
  constructor() { super("pipedream-automation", "PD_API_K"); }
  async runFlow(id: string, p: any): Promise<{ d: any, e: string | null }> {
    return await this.send("pipedream/run-workflow", { id: id, params: p }, "POST");
  }
}
export class SupabaseSvc extends ExternalSvcGateway {
  constructor() { super("supabase-db", "SB_API_K"); }
  async query(t: string, f: string): Promise<{ d: any, e: string | null }> {
    return await this.send("supabase/query-table", { table: t, filter: f }, "GET");
  }
}
export class VercelSvc extends ExternalSvcGateway {
  constructor() { super("vercel-hosting", "VC_API_K"); }
  async newDeploy(p: string): Promise<{ d: any, e: string | null }> {
    return await this.send("vercel/deploy", { project: p }, "POST");
  }
}
export class GodaddySvc extends ExternalSvcGateway {
  constructor() { super("godaddy-domains", "GD_API_K"); }
  async getDomains(): Promise<{ d: any, e: string | null }> {
    return await this.send("godaddy/list-domains", {}, "GET");
  }
}

export class CpanelSvc extends ExternalSvcGateway {
  constructor() { super("cpanel-hosting", "CP_API_K"); }
  async addAcct(u: string, p: string): Promise<{ d: any, e: string | null }> {
    return await this.send("cpanel/create-account", { user: u, pass: p }, "POST");
  }
}

export const genAInsights = new GeminiAISvc();
export const chatHotGen = new ChatHotSvc();
export const plaidConn = new PlaidSvc();
export const mtPayments = new ModernTreasurySvc();
export const githubConn = new GitHubSvc();
export const sfConn = new SalesforceSvc();
export const oracleDB = new OracleSvc();
export const twilioComm = new TwilioSvc();
export const marqetaCards = new MarqetaSvc();
export const shopifyStore = new ShopifySvc();
export const adobeCreative = new AdobeSvc();
export const gcpInfra = new GcpSvc();
export const azureCloud = new AzureSvc();
export const hfModels = new HuggingFaceSvc();
export const pdWorkflows = new PipedreamSvc();
export const supabaseDB = new SupabaseSvc();
export const vercelDeploy = new VercelSvc();
export const godaddyDomains = new GodaddySvc();
export const cpanelHost = new CpanelSvc();

export interface MegaFilterState {
  cfg: AdvancedFilterConfig;
  aiInsights: AIInsight[];
  simResults: AISimulation[];
  genReport: AIGenReport | null;
  anomaly: AnomalyDetectionPacket | null;
  trend: TrendAnalysisPacket | null;
  fcstRev: number | null;
  alertCfgs: AlertConfig[];
  dynThres: DynThreshold[];
  load: Record<string, boolean>;
  errs: Record<string, string | null>;
  prefs: Record<string, any>;
  actInsights: AIInsight[];
}

export type MegaFilterAction =
  | { t: "SET_CFG_PROP"; p: { k: keyof AdvancedFilterConfig; v: any } }
  | { t: "RESET_CFG" }
  | { t: "APPLY_BULK_CFG"; p: Partial<AdvancedFilterConfig> }
  | { t: "SET_LOADING"; p: { f: string; s: boolean } }
  | { t: "SET_ERROR"; p: { f: string; e: string | null } }
  | { t: "ADD_AI_INSIGHT"; p: AIInsight }
  | { t: "ADD_SIM_RESULT"; p: AISimulation }
  | { t: "SET_GEN_REPORT"; p: AIGenReport | null }
  | { t: "SET_ANOMALY"; p: AnomalyDetectionPacket | null }
  | { t: "SET_TREND"; p: TrendAnalysisPacket | null }
  | { t: "SET_FCST_REV"; p: number | null }
  | { t: "ADD_ALERT_CFG"; p: AlertConfig }
  | { t: "UPD_ALERT_CFG"; p: AlertConfig }
  | { t: "REM_ALERT_CFG"; p: string }
  | { t: "SET_DYN_THRES"; p: DynThreshold[] }
  | { t: "ADD_ACT_INSIGHT"; p: AIInsight };

export const initMegaFilterState: MegaFilterState = {
  cfg: {
    tmFrame: PRESET_TM_VALS.PastMonth.dateRange,
    revType: ReversalTypeCd.OverallNACHA,
    txnChan: TxnChannelCd.AllChannels,
    cPartyCat: CPartyCatCd.AllCats,
    rLvl: RiskLvlCd.AllLvls,
    gZone: GeoInfluenceCd.AllZones,
    bUnit: BizUnitCd.AllUnits,
    txnAmtRange: { lo: null, hi: null },
    revCds: [],
    custSegs: [],
    txnInit: null,
    settleStat: "ALL",
    isFlgd: null,
    econCorr: [],
  },
  aiInsights: [],
  simResults: [],
  genReport: null,
  anomaly: null,
  trend: null,
  fcstRev: null,
  alertCfgs: [],
  dynThres: [],
  load: {},
  errs: {},
  prefs: {},
  actInsights: [],
};

export function megaFilterReducer(s: MegaFilterState, a: MegaFilterAction): MegaFilterState {
  switch (a.t) {
    case "SET_CFG_PROP": return { ...s, cfg: { ...s.cfg, [a.p.k]: a.p.v } };
    case "RESET_CFG": return { ...s, cfg: initMegaFilterState.cfg };
    case "APPLY_BULK_CFG": return { ...s, cfg: { ...s.cfg, ...a.p } };
    case "SET_LOADING": return { ...s, load: { ...s.load, [a.p.f]: a.p.s } };
    case "SET_ERROR": return { ...s, errs: { ...s.errs, [a.p.f]: a.p.e } };
    case "ADD_AI_INSIGHT": return { ...s, aiInsights: [...s.aiInsights, a.p] };
    case "ADD_SIM_RESULT": return { ...s, simResults: [...s.simResults, a.p] };
    case "SET_GEN_REPORT": return { ...s, genReport: a.p };
    case "SET_ANOMALY": return { ...s, anomaly: a.p };
    case "SET_TREND": return { ...s, trend: a.p };
    case "SET_FCST_REV": return { ...s, fcstRev: a.p };
    case "ADD_ALERT_CFG": return { ...s, alertCfgs: [...s.alertCfgs, a.p] };
    case "UPD_ALERT_CFG": return { ...s, alertCfgs: s.alertCfgs.map((c) => (c.id === a.p.id ? a.p : c)) };
    case "REM_ALERT_CFG": return { ...s, alertCfgs: s.alertCfgs.filter((c) => c.id !== a.p) };
    case "SET_DYN_THRES": return { ...s, dynThres: a.p };
    case "ADD_ACT_INSIGHT": return { ...s, actInsights: [...s.actInsights, a.p] };
    default: return s;
  }
}

interface UseAdvCfgMechanismProps {
  initTmFrame?: DateRangeFormValues;
}

export default function useAdvCfgMechanism({ initTmFrame }: UseAdvCfgMechanismProps) {
  const [st, disp] = useReducer(megaFilterReducer, {
    ...initMegaFilterState,
    cfg: {
      ...initMegaFilterState.cfg,
      tmFrame: initTmFrame || PRESET_TM_VALS.PastMonth.dateRange,
    },
  });

  const qryPkt = useMemo<QueryPacket>(() => {
    const q: QueryPacket = { tmFrame: st.cfg.tmFrame, revType: st.cfg.revType };
    if (st.cfg.txnChan !== TxnChannelCd.AllChannels) q.chan = st.cfg.txnChan;
    if (st.cfg.cPartyCat !== CPartyCatCd.AllCats) q.cPartyCat = st.cfg.cPartyCat;
    if (st.cfg.rLvl !== RiskLvlCd.AllLvls) q.rLvl = st.cfg.rLvl;
    if (st.cfg.gZone !== GeoInfluenceCd.AllZones) q.zone = st.cfg.gZone;
    if (st.cfg.bUnit !== BizUnitCd.AllUnits) q.bUnit = st.cfg.bUnit;
    if (st.cfg.txnAmtRange.lo !== null) q.loAmt = st.cfg.txnAmtRange.lo;
    if (st.cfg.txnAmtRange.hi !== null) q.hiAmt = st.cfg.txnAmtRange.hi;
    if (st.cfg.revCds.length > 0) q.revCds = st.cfg.revCds;
    if (st.cfg.custSegs.length > 0) q.custSegs = st.cfg.custSegs;
    if (st.cfg.txnInit !== null) q.initId = st.cfg.txnInit;
    if (st.cfg.settleStat !== "ALL") q.settleStat = st.cfg.settleStat;
    if (st.cfg.isFlgd !== null) q.flgd = st.cfg.isFlgd;
    if (st.cfg.econCorr.length > 0) q.econImpFltr = st.cfg.econCorr;
    return q;
  }, [st.cfg]);

  const setCfgProp = useCallback((k: keyof AdvancedFilterConfig, v: any) => disp({ t: "SET_CFG_PROP", p: { k, v } }), []);
  const resetCfg = useCallback(() => disp({ t: "RESET_CFG" }), []);
  const applyBulkCfg = useCallback((p: Partial<AdvancedFilterConfig>) => disp({ t: "APPLY_BULK_CFG", p }), []);

  const createApiAction = <P, R>(
    featureName: string,
    apiCall: (params: P) => Promise<AIServiceResponse<R> | { d: R | null; e: string | null }>,
    onSuccess: (result: R) => void
  ) => {
    return useCallback(async (params: P) => {
      disp({ t: "SET_LOADING", p: { f: featureName, s: true } });
      disp({ t: "SET_ERROR", p: { f: featureName, e: null } });
      try {
        const response = await apiCall(params);
        const data = 'payload' in response ? response.payload : response.d;
        const error = 'err' in response ? response.err : response.e;
        if (data) {
          onSuccess(data);
        } else if (error) {
          disp({ t: "SET_ERROR", p: { f: featureName, e: error } });
        }
      } catch (e: any) {
        disp({ t: "SET_ERROR", p: { f: featureName, e: e.message } });
      } finally {
        disp({ t: "SET_LOADING", p: { f: featureName, s: false } });
      }
    }, [st.cfg]);
  };
  
  const genAIInsight = createApiAction<{ q: string; ctx: any }, AIInsight>(
    "aiInsight",
    (p) => genAInsights.getInsight(p.q, st.cfg, p.ctx),
    (r) => {
      disp({ t: "ADD_AI_INSIGHT", p: r });
      if (r.rec.length > 0) disp({ t: "ADD_ACT_INSIGHT", p: r });
    }
  );

  const execPlaidBalance = createApiAction<string, any>("plaidBalance", (p) => plaidConn.fetchBalance(p), (r) => console.log('Plaid Balance:', r));
  const execMtPayment = createApiAction<{ a: number; c: string }, any>("mtPayment", (p) => mtPayments.newPayment(p.a, p.c), (r) => console.log('MT Payment:', r));
  const fetchGhRepo = createApiAction<string, any>("ghRepo", (p) => githubConn.repoInfo(p), (r) => console.log('GH Repo:', r));
  const fetchSfAccount = createApiAction<string, any>("sfAccount", (p) => sfConn.getAcct(p), (r) => console.log('SF Account:', r));
  const runOracleQuery = createApiAction<string, any>("oraQuery", (p) => oracleDB.runSql(p), (r) => console.log('Oracle Result:', r));
  const dispatchTwilioSms = createApiAction<{ t: string; b: string }, any>("twilioSms", (p) => twilioComm.sendMsg(p.t, p.b), (r) => console.log('Twilio SMS:', r));
  const issueMarqetaCard = createApiAction<string, any>("marqetaCard", (p) => marqetaCards.newCard(p), (r) => console.log('Marqeta Card:', r));
  const fetchShopifyOrders = createApiAction<string, any>("shopifyOrders", (p) => shopifyStore.listOrders(p), (r) => console.log('Shopify Orders:', r));
  const renderAdobePdf = createApiAction<string, any>("adobePdf", (p) => adobeCreative.createPdf(p), (r) => console.log('Adobe PDF:', r));
  const storeGcpObject = createApiAction<{ b: string; n: string; d: string }, any>("gcpObject", (p) => gcpInfra.upload(p.b, p.n, p.d), (r) => console.log('GCP Object:', r));
  const triggerAzureFunc = createApiAction<{ n: string; p: any }, any>("azureFunc", (p) => azureCloud.execFunc(p.n, p.p), (r) => console.log('Azure Func:', r));
  const runHfInference = createApiAction<{ m: string; i: any }, any>("hfInference", (p) => hfModels.infer(p.m, p.i), (r) => console.log('HF Inference:', r));
  const triggerPdWorkflow = createApiAction<{ id: string; p: any }, any>("pdWorkflow", (p) => pdWorkflows.runFlow(p.id, p.p), (r) => console.log('PD Workflow:', r));
  const querySupabase = createApiAction<{ t: string; f: string }, any>("supabaseQuery", (p) => supabaseDB.query(p.t, p.f), (r) => console.log('Supabase Query:', r));
  const triggerVercelDeploy = createApiAction<string, any>("vercelDeploy", (p) => vercelDeploy.newDeploy(p), (r) => console.log('Vercel Deploy:', r));
  const listGodaddyDomains = createApiAction<void, any>("godaddyDomains", () => godaddyDomains.getDomains(), (r) => console.log('GoDaddy Domains:', r));
  const createCpanelAccount = createApiAction<{ u: string; p: string }, any>("cpanelAccount", (p) => cpanelHost.addAcct(p.u, p.p), (r) => console.log('cPanel Account:', r));
  
  const moreActions: Record<string, Function> = {};
  for (let i = 0; i < 200; i++) {
    moreActions[`dynamicAction${i}`] = useCallback(() => {
        const svc = Object.values(PartnerEcoSystem)[i % Object.keys(PartnerEcoSystem).length];
        console.log(`Executing dynamic action ${i} for service: ${svc}`);
        disp({t: 'SET_LOADING', p: {f: `dynAct${i}`, s: true}});
        setTimeout(() => {
            disp({t: 'SET_LOADING', p: {f: `dynAct${i}`, s: false}});
        }, 500);
    }, []);
  }

  const hundredMoreActions: Record<string, Function> = {};
  for(let j=0; j<100; j++) {
      hundredMoreActions[`customFeature_${j}`] = useCallback(async (p: any) => {
          const featureKey = `custom_feat_${j}`;
          disp({t: "SET_LOADING", p: {f: featureKey, s: true}});
          await new Promise(res => setTimeout(res, 100 + Math.random()*200));
          if(Math.random() > 0.2) {
              console.log(`Custom feature ${j} succeeded with params`, p);
          } else {
              disp({t: "SET_ERROR", p: {f: featureKey, e: `Simulated failure for feature ${j}`}});
          }
          disp({t: "SET_LOADING", p: {f: featureKey, s: false}});
      }, []);
  }

  const anotherHundredActions: Record<string, Function> = {};
  for(let k=0; k<100; k++) {
      anotherHundredActions[`integrationPoint_${k}`] = useCallback(async (cfg: any) => {
          const integrationKey = `integ_pt_${k}`;
          disp({t: "SET_LOADING", p: {f: integrationKey, s: true}});
          await new Promise(res => setTimeout(res, 150));
          console.log(`Integration point ${k} triggered with config:`, cfg);
          disp({t: "SET_LOADING", p: {f: integrationKey, s: false}});
      }, []);
  }

  return {
    qryPkt,
    st,
    disp,
    cfgOps: {
      set: setCfgProp,
      reset: resetCfg,
      applyBulk: applyBulkCfg,
    },
    actions: {
      genAIInsight,
      execPlaidBalance,
      execMtPayment,
      fetchGhRepo,
      fetchSfAccount,
      runOracleQuery,
      dispatchTwilioSms,
      issueMarqetaCard,
      fetchShopifyOrders,
      renderAdobePdf,
      storeGcpObject,
      triggerAzureFunc,
      runHfInference,
      triggerPdWorkflow,
      querySupabase,
      triggerVercelDeploy,
      listGodaddyDomains,
      createCpanelAccount,
      ...moreActions,
      ...hundredMoreActions,
      ...anotherHundredActions,
    },
  };
}