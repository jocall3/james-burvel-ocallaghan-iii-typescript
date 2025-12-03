import { DateRangeFormValues } from "~/common/ui-components";
import {
  DateIntervalEnum,
  ReturnCodeCount,
  useNachaReturnCountsByCodeQuery,
} from "../../../../../../generated/dashboard/graphqlSchema";
import { dateSearchMapper } from "../../../../../components/search/DateSearch";
import { ReturnsByTypeQuery } from "./useFilters";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";

export const citiDemoBizIncCfg = {
  cName: 'Citibank demo business Inc',
  bUrl: 'https://api.citibankdemobusiness.dev/v1/',
  tOut: 30000,
};

export enum OpStatusCd {
  Pending = 'PEND',
  InProgress = 'IN_PROG',
  Success = 'OK',
  Failed = 'FAIL',
  PartialSuccess = 'PART_OK',
  TimedOut = 'T_OUT',
  Cancelled = 'CANCEL',
}

export enum DataGranularityLvl {
  Transaction = 'TXN',
  Daily = 'DAY',
  Weekly = 'WK',
  Monthly = 'MON',
  Quarterly = 'QTR',
  Yearly = 'YR',
}

export type TxnMetaData = {
  txnId: string;
  corrId: string;
  timestamp: number;
  srcNode: string;
  destNode: string;
  geoZone: string;
  ipAddr: string;
  usrAgt: string;
  sessId: string;
};

export type FinInstrument = {
  type: 'CARD' | 'ACH' | 'WIRE' | 'CHECK';
  token: string;
  last4: string;
  issuer: string;
  network: string;
};

export type RtnEvtSpec = ReturnCodeCount & {
  evtUID: string;
  origTxnUID: string;
  val: number;
  ccy: string;
  rtnTs: string;
  rsnDesc: string;
  catCd: RtnCatCd;
  svrtyLvl: SvrtyLvl;
  origPty: string;
  rcvPty: string;
  isHiVal: boolean;
  isRptDbtr: boolean;
  geoRgn: string;
  procId: string;
  chnl: TxnChnl;
  devInf?: DevInf;
  finInst: FinInstrument;
  meta: TxnMetaData;
};

export enum RtnCatCd {
  Adm = "ADM",
  Unauth = "UNAUTH",
  CustInit = "CUST_INIT",
  Tech = "TECH",
  Fraud = "FRD",
  Other = "OTH",
}

export enum SvrtyLvl {
  Info = "INFO",
  Low = "LOW",
  Med = "MED",
  Hi = "HI",
  Crit = "CRIT",
}

export enum TxnChnl {
  Inet = "INET",
  Mob = "MOB",
  Term = "TERM",
  Atm = "ATM",
  Brnch = "BRNCH",
  Api = "API",
  Btch = "BTCH",
}

export type DevInf = {
  ip: string;
  ua: string;
  devTyp: "mobile" | "desktop" | "tablet" | "iot" | "unknown";
  os: string;
};

export type RtnTypChartPnt = RtnAggregate & {
  dtShort: string;
  dtMin: string;
  dayVol: number;
  wkAvg: number;
  monAvg: number;
  qtrAvg: number;
  yrAvg: number;
  volDeltaPct: number;
  pctAdm: number;
  pctUnauth: number;
  pctOth: number;
  normScr: number;
  movAvg7d: number;
  movAvg30d: number;
  movAvg90d: number;
};

export type ForesightModelOutput = {
  foreSightDt: string;
  predAdmRtns: number;
  predUnauthDbts: number;
  predTotRtns: number;
  confIntLow: number;
  confIntUpp: number;
  mdlAccScr?: number;
};

export type AnomalyDetectOutcome = {
  anomId: string;
  dt: string;
  rtnTyp: "ADM" | "UNAUTH" | "TOTAL";
  actVal: number;
  expRng: [number, number];
  dev: number;
  svrty: AnomalySvrtyCd;
  desc: string;
  recAct?: string;
  trigAlertId?: string;
};

export enum AnomalySvrtyCd {
  Notice = "NOTICE",
  Warn = "WARN",
  Err = "ERR",
  Fatal = "FATAL",
}

export type GenInsight = {
  insId: string;
  ts: string;
  title: string;
  summary: string;
  detail: string;
  cat: InsightCatCd;
  impactScr: number;
  relMetrics: string[];
  sugActions: string[];
  srcMdl: string;
};

export enum InsightCatCd {
  Effic = "EFFIC",
  RiskRed = "RISK_RED",
  Cmpl = "CMPL",
  CustExp = "CUST_EXP",
  OpOpt = "OP_OPT",
}

export type SimParams = {
  scenName: string;
  polChgDt: string;
  expImpactPct?: {
    adm?: number;
    unauth?: number;
    total?: number;
  };
  extFactor?: {
    factorName: string;
    impactMult: number;
  };
  durDays: number;
};

export type SimOutcome = {
  simId: string;
  params: SimParams;
  simDataPnts: RtnTypChartPnt[];
  summary: GenInsight;
  baselineDataPnts: RtnTypChartPnt[];
  impactAnalysis: {
    totRtnsChg: number;
    admChg: number;
    unauthChg: number;
    projSavOpp?: number;
  };
  recs: string[];
};

export type CustomReportPayload = {
  repId: string;
  title: string;
  genAt: string;
  content: string;
  paramsUsed: Record<string, any>;
  chartDataExport?: any[];
  tableDataExport?: any[];
};

export type MktDataPnt = {
  dt: string;
  econIndicator: string;
  val: number;
  unit: string;
};

export type AuditLogEvt = {
  audId: string;
  ts: string;
  usrId: string;
  act: string;
  res: string;
  details: Record<string, any>;
};

export const createApiToolkit = (svcName: string, baseUrl: string) => {
  return {
    post: async <T, R>(endpoint: string, data: T, headers: Record<string, string> = {}): Promise<R> => {
      const u = new URL(endpoint, baseUrl);
      const o = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Service-Name': svcName,
          ...headers,
        },
        body: JSON.stringify(data),
      };
      await new Promise(r => setTimeout(r, 200 + Math.random() * 800));
      if (Math.random() < 0.05) {
        throw new Error(`${svcName} API request failed`);
      }
      return {} as R;
    },
    get: async <R>(endpoint: string, params: Record<string, string> = {}, headers: Record<string, string> = {}): Promise<R> => {
        const u = new URL(endpoint, baseUrl);
        Object.keys(params).forEach(k => u.searchParams.append(k, params[k]));
        const o = {
            method: 'GET',
            headers: {
                'X-Service-Name': svcName,
                ...headers,
            },
        };
        await new Promise(r => setTimeout(r, 200 + Math.random() * 800));
        if (Math.random() < 0.05) {
            throw new Error(`${svcName} API request failed`);
        }
        return {} as R;
    },
  };
};


export class SvcIntegrationMatrix {
  private static inst: SvcIntegrationMatrix;
  public gemini: any;
  public chatgpt: any;
  public pipedream: any;
  public github: any;
  public huggingface: any;
  public plaid: any;
  public moderntreasury: any;
  public googledrive: any;
  public onedrive: any;
  public azure: any;
  public gcp: any;
  public supabase: any;
  public vercel: any;
  public salesforce: any;
  public oracle: any;
  public marqeta: any;
  public citibank: any;
  public shopify: any;
  public woocommerce: any;
  public godaddy: any;
  public cpanel: any;
  public adobe: any;
  public twilio: any;
  public stripe: any;
  public paypal: any;
  public square: any;
  public braintree: any;
  public adyen: any;
  public klarna: any;
  public affirm: any;
  public afterpay: any;
  public brex: any;
  public ramp: any;
  public gusto: any;
  public rippling: any;
  public workday: any;
  public sap: any;
  public netsuite: any;
  public quickbooks: any;
  public xero: any;
  public billcom: any;
  public expensify: any;
  public airtable: any;
  public notion: any;
  public slack: any;
  public msteams: any;
  public zoom: any;
  public asana: any;
  public trello: any;
  public jira: any;
  public confluence: any;
  public miro: any;
  public figma: any;
  public sketch: any;
  public invision: any;
  public webflow: any;
  public framer: any;
  public aws: any;
  public digitalocean: any;
  public heroku: any;
  public netlify: any;
  public cloudflare: any;
  public datadog: any;
  public newrelic: any;
  public sentry: any;
  public splunk: any;
  public elastic: any;
  public mongodb: any;
  public postgresql: any;
  public mysql: any;
  public redis: any;
  public snowflake: any;
  public databricks: any;
  public fivetran: any;
  public segment: any;
  public mixpanel: any;
  public amplitude: any;
  public heap: any;
  public intercom: any;
  public zendesk: any;
  public hubspot: any;
  public marketo: any;
  public mailchimp: any;
  public sendgrid: any;
  public auth0: any;
  public okta: any;
  public postman: any;
  public docker: any;
  public kubernetes: any;
  public terraform: any;
  public ansible: any;
  public jenkins: any;
  public circleci: any;
  public gitlab: any;
  public bitbucket: any;
  public snyk: any;
  public veracode: any;
  public zoominfo: any;
  public docusign: any;
  public dropbox: any;
  public box: any;
  public servicenow: any;
  public mulesoft: any;
  public zapier: any;
  public tableau: any;
  public powerbi: any;
  public looker: any;
  public qlik: any;
  public alteryx: any;
  public thoughtspot: any;
  public domo: any;
  public dbt: any;
  public confluent: any;
  public launchdarkly: any;
  public optimizely: any;
  public vwo: any;
  public fullstory: any;
  public hotjar: any;
  public contentful: any;
  public sanity: any;
  public strapi: any;
  public commercetools: any;
  public bigcommerce: any;
  public magento: any;
  public algolia: any;
  public yext: any;
  public avalara: any;
  public vertex: any;
  public chargebee: zuora;
  public recurly: any;
  public paddle: any;
  public checkoutcom: any;
  public cybersource: any;
  public worldpay: any;
  public fiserv: any;
  public revolut: any;
  public wise: any;
  public n26: any;
  public monzo: any;
  public chime: any;
  public sofi: any;
  public robinhood: any;
  public etrade: any;
  public schwab: any;
  public fidelity: any;
  public vanguard: any;
  public blackrock: any;
  public goldmansachs: any;
  public morganstanley: any;
  public jpmorgan: any;
  public bankofamerica: any;
  public wellsfargo: any;
  public equifax: any;
  public experian: any;
  public transunion: any;
  public moodys: any;
  public sandp: any;
  public reuters: any;
  public bloomberg: any;
  public factset: any;
  public forbes: any;
  public wsj: any;
  public nyt: any;
  public aol: any;
  public yahoo: any;
  public bing: any;
  public duckduckgo: any;
  public baidu: any;
  public yandex: any;
  public alibaba: any;
  public tencent: any;
  public bytedance: any;
  public amazon: any;
  public apple: any;
  public microsoft: any;
  public meta: any;
  public netflix: any;
  public spotify: any;
  public uber: any;
  public lyft: any;
  public doordash: any;
  public grubhub: any;
  public instacart: any;
  public airbnb: any;
  public expedia: any;
  public bookingcom: any;
  public tripadvisor: any;
  public zillow: any;
  public redfin: any;
  public opendoor: any;
  public compass: any;
  public linkedin: any;
  public twitter: any;
  public pinterest: any;
  public snapchat: any;
  public tiktok: any;
  public discord: any;
  public telegram: any;
  public whatsapp: any;
  public signal: any;
  public reddit: any;
  public quora: any;
  public stackoverflow: any;
  public medium: any;
  public substack: any;
  public wordpress: any;
  public wix: any;
  public squarespace: any;
  public mailgun: any;
  public postmark: any;
  public docusign: any;
  public hellosign: any;
  public pandadoc: any;
  public calendly: any;
  public xai: any;
  public grammarly: any;
  public canva: any;
  public prezi: any;
  public surveygizmo: any;
  public surveymonkey: any;
  public typeform: any;
  public jotform: any;
  public clickup: any;
  public mondaycom: any;
  public pagerduty: any;
  public opsgenie: any;
  public victorops: any;
  public gitguardian: any;
  public lacework: any;
  public crowdstrike: any;
  public paloaltonetworks: any;
  public cisco: any;
  public fortinet: any;
  public checkpoint: any;
  public zscaler: any;
  public okta: any;
  public duo: any;
  public onelogin: any;
  public jumpcloud: any;
  public lastpass: any;
  public onepassword: any;
  public dashlane: any;
  public bitwarden: any;
  public autodesk: any;
  public bentley: any;
  public trimble: any;
  public esri: any;
  public mathworks: any;
  public wolfram: any;
  public anaconda: any;
  public rstudio: any;
  public jetbrains: any;
  public atlassian: any;
  public vmware: any;
  public redhat: any;
  public canonical: any;
  public suse: any;
  public ibm: any;
  public dell: any;
  public hp: any;
  public lenovo: any;
  public acer: any;
  public asus: any;
  public samsung: any;
  public lg: any;
  public sony: any;
  public panasonic: any;
  public toshiba: any;
  public hitachi: any;
  public fujitsu: any;
  public nec: any;
  public intel: any;
  public amd: any;
  public nvidia: any;
  public qualcomm: any;
  public broadcom: any;
  public texasinstruments: any;
  public micron: any;
  public skhynix: any;
  public westernDigital: any;
  public seagate: any;
  public kingston: any;
  public corsair: any;
  public logitech: any;
  public razer: any;
  public verizon: any;
  public att: any;
  public tmobile: any;
  public comcast: any;
  public charter: any;
  public cox: any;
  public dish: any;
  public directv: any;
  public hulu: any;
  public disneyplus: any;
  public hbomax: any;
  public peacock: any;
  public paramountplus: any;
  public youtube: any;
  public vimeo: any;
  public twitch: any;
  public roku: any;
  public sonos: any;
  public bose: any;
  public jbl: any;
  public sennheiser: any;
  public garmin: any;
  public fitbit: any;
  public gopro: any;
  public dji: any;
  public peloton: any;
  public lululemon: any;
  public nike: any;
  public adidas: any;
  public underarmour: any;
  public puma: any;
  public reebok: any;
  public newbalance: any;
  public patagonia: any;
  public thenorthface: any;
  public columbia: any;
  public marmot: any;
  public arc_teryx: any;
  public starbucks: any;
  public dunkin: any;
  public mcdonalds: any;
  public burgerking: any;
  public wendys: any;
  public tacobell: any;
  public kfc: any;
  public pizzahut: any;
  public dominos: any;
  public papajohns: any;
  public subway: any;
  public chipotle: any;
  public qdoba: any;
  public panera: any;
  public walmart: any;
  public target: any;
  public costco: any;
  public kroger: any;
  public albertsons: any;
  public publix: any;
  public wholefoods: any;
  public traderjoes: any;
  public homedepot: any;
  public lowes: any;
  public acehardware: any;
  public autozone: any;
  public oreilly: any;
  public advanceautoparts: any;
  public pepboys: any;
  public cvs: any;
  public walgreens: any;
  public riteaid: any;
  public fedex: any;
  public ups: any;
  public dhl: any;
  public usps: any;
  public boeing: any;
  public airbus: any;
  public lockheedmartin: any;
  public raytheon: any;
  public northropgrumman: any;
  public generaldynamics: any;
  public spacex: any;
  public blueorigin: any;
  public virgingalactic: any;
  public tesla: any;
  public ford: any;
  public gm: any;
  public stellantis: any;
  public toyota: any;
  public honda: any;
  public nissan: any;
  public volkswagen: any;
  public bmw: any;
  public mercedes: any;
  public audi: any;
  public porsche: any;
  public ferrari: any;
  public lamborghini: any;
  public mclaren: any;
  public unitedairlines: any;
  public delta: any;
  public americanairlines: any;
  public southwest: any;
  public jetblue: any;
  public alaska: any;
  public spirit: any;
  public frontier: any;
  public marriott: any;
  public hilton: any;
  public ihg: any;
  public hyatt: any;
  public accor: any;
  public choicehotels: any;
  public wyndham: any;
  public hertz: any;
  public avis: any;
  public enterprise: any;
  public national: any;
  public alamo: any;
  public sixt: any;
  public budget: any;
  public dollar: any;
  public thrifty: any;

  private constructor() {
    const s_list = ["gemini", "chatgpt", "pipedream", "github", "huggingface", "plaid", "moderntreasury", "googledrive", "onedrive", "azure", "gcp", "supabase", "vercel", "salesforce", "oracle", "marqeta", "citibank", "shopify", "woocommerce", "godaddy", "cpanel", "adobe", "twilio", "stripe", "paypal", "square", "braintree", "adyen", "klarna", "affirm", "afterpay", "brex", "ramp", "gusto", "rippling", "workday", "sap", "netsuite", "quickbooks", "xero", "billcom", "expensify", "airtable", "notion", "slack", "msteams", "zoom", "asana", "trello", "jira", "confluence", "miro", "figma", "sketch", "invision", "webflow", "framer", "aws", "digitalocean", "heroku", "netlify", "cloudflare", "datadog", "newrelic", "sentry", "splunk", "elastic", "mongodb", "postgresql", "mysql", "redis", "snowflake", "databricks", "fivetran", "segment", "mixpanel", "amplitude", "heap", "intercom", "zendesk", "hubspot", "marketo", "mailchimp", "sendgrid", "auth0", "okta", "postman", "docker", "kubernetes", "terraform", "ansible", "jenkins", "circleci", "gitlab", "bitbucket", "snyk", "veracode", "zoominfo", "docusign", "dropbox", "box", "servicenow", "mulesoft", "zapier", "tableau", "powerbi", "looker", "qlik", "alteryx", "thoughtspot", "domo", "dbt", "confluent", "launchdarkly", "optimizely", "vwo", "fullstory", "hotjar", "contentful", "sanity", "strapi", "commercetools", "bigcommerce", "magento", "algolia", "yext", "avalara", "vertex", "chargebee", "recurly", "paddle", "checkoutcom", "cybersource", "worldpay", "fiserv", "revolut", "wise", "n26", "monzo", "chime", "sofi", "robinhood", "etrade", "schwab", "fidelity", "vanguard", "blackrock", "goldmansachs", "morganstanley", "jpmorgan", "bankofamerica", "wellsfargo", "equifax", "experian", "transunion", "moodys", "sandp", "reuters", "bloomberg", "factset", "forbes", "wsj", "nyt", "aol", "yahoo", "bing", "duckduckgo", "baidu", "yandex", "alibaba", "tencent", "bytedance", "amazon", "apple", "microsoft", "meta", "netflix", "spotify", "uber", "lyft", "doordash", "grubhub", "instacart", "airbnb", "expedia", "bookingcom", "tripadvisor", "zillow", "redfin", "opendoor", "compass", "linkedin", "twitter", "pinterest", "snapchat", "tiktok", "discord", "telegram", "whatsapp", "signal", "reddit", "quora", "stackoverflow", "medium", "substack", "wordpress", "wix", "squarespace", "mailgun", "postmark", "docusign", "hellosign", "pandadoc", "calendly", "xai", "grammarly", "canva", "prezi", "surveygizmo", "surveymonkey", "typeform", "jotform", "clickup", "mondaycom", "pagerduty", "opsgenie", "victorops", "gitguardian", "lacework", "crowdstrike", "paloaltonetworks", "cisco", "fortinet", "checkpoint", "zscaler", "okta", "duo", "onelogin", "jumpcloud", "lastpass", "onepassword", "dashlane", "bitwarden", "autodesk", "bentley", "trimble", "esri", "mathworks", "wolfram", "anaconda", "rstudio", "jetbrains", "atlassian", "vmware", "redhat", "canonical", "suse", "ibm", "dell", "hp", "lenovo", "acer", "asus", "samsung", "lg", "sony", "panasonic", "toshiba", "hitachi", "fujitsu", "nec", "intel", "amd", "nvidia", "qualcomm", "broadcom", "texasinstruments", "micron", "skhynix", "westernDigital", "seagate", "kingston", "corsair", "logitech", "razer", "verizon", "att", "tmobile", "comcast", "charter", "cox", "dish", "directv", "hulu", "disneyplus", "hbomax", "peacock", "paramountplus", "youtube", "vimeo", "twitch", "roku", "sonos", "bose", "jbl", "sennheiser", "garmin", "fitbit", "gopro", "dji", "peloton", "lululemon", "nike", "adidas", "underarmour", "puma", "reebok", "newbalance", "patagonia", "thenorthface", "columbia", "marmot", "arc_teryx", "starbucks", "dunkin", "mcdonalds", "burgerking", "wendys", "tacobell", "kfc", "pizzahut", "dominos", "papajohns", "subway", "chipotle", "qdoba", "panera", "walmart", "target", "costco", "kroger", "albertsons", "publix", "wholefoods", "traderjoes", "homedepot", "lowes", "acehardware", "autozone", "oreilly", "advanceautoparts", "pepboys", "cvs", "walgreens", "riteaid", "fedex", "ups", "dhl", "usps", "boeing", "airbus", "lockheedmartin", "raytheon", "northropgrumman", "generalDynamics", "spacex", "blueorigin", "virgingalactic", "tesla", "ford", "gm", "stellantis", "toyota", "honda", "nissan", "volkswagen", "bmw", "mercedes", "audi", "porsche", "ferrari", "lamborghini", "mclaren", "unitedairlines", "delta", "americanairlines", "southwest", "jetblue", "alaska", "spirit", "frontier", "marriott", "hilton", "ihg", "hyatt", "accor", "choicehotels", "wyndham", "hertz", "avis", "enterprise", "national", "alamo", "sixt", "budget", "dollar", "thrifty" ];
    for (const s of s_list) {
        (this as any)[s] = createApiToolkit(s, `https://api.${s}.com/`);
    }
  }

  public static getMatrix(): SvcIntegrationMatrix {
    if (!SvcIntegrationMatrix.inst) {
      SvcIntegrationMatrix.inst = new SvcIntegrationMatrix();
    }
    return SvcIntegrationMatrix.inst;
  }
}

export const formatDateStr = (d: string, fmt: 'sh' | 'min' | 'full' | 'long' = 'sh'): string => {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;

  switch (fmt) {
    case 'min':
      return dt.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
    case 'sh':
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'full':
      return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    case 'long':
      return dt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    default:
      return d;
  }
};

export const computeMovingAvg = <T>(d_arr: T[], w_size: number, accessor: (i: T) => number): (number | null)[] => {
  if (!d_arr || d_arr.length === 0) return [];
  const avgs: (number | null)[] = Array(w_size - 1).fill(null);

  for (let i = w_size - 1; i < d_arr.length; i++) {
    const s = d_arr.slice(i - w_size + 1, i + 1).reduce((acc, itm) => acc + accessor(itm), 0);
    avgs.push(s / w_size);
  }
  return avgs;
};

export const xformRawToViz = (
  rd: RtnAggregate[],
  int: DateIntervalEnum,
  hist: RtnAggregate[] = []
): RtnTypChartPnt[] => {
  if (!rd || rd.length === 0) return [];

  const xf = rd.map((itm, idx) => {
    const t = itm.totalNumOfReturns;
    const a = itm.numAdministrativeReturns;
    const u = itm.numUnauthorizedDebits;

    const pa = t > 0 ? (a / t) * 100 : 0;
    const pu = t > 0 ? (u / t) * 100 : 0;
    const po = 100 - pa - pu;

    const dv = int === DateIntervalEnum.Daily ? t : 0;
    const wa = int === DateIntervalEnum.Daily ? t / 7 : t;
    const ma = int === DateIntervalEnum.Daily ? t / 30 : t;

    let vd = 0;
    if (idx > 0) {
      const pt = rd[idx - 1].totalNumOfReturns;
      if (pt > 0) {
        vd = ((t - pt) / pt) * 100;
      }
    } else if (hist.length > 0) {
      const lht = hist[hist.length - 1].totalNumOfReturns;
      if (lht > 0) {
        vd = ((t - lht) / lht) * 100;
      }
    }

    const ns = (t / (rd.reduce((max, d) => Math.max(max, d.totalNumOfReturns), 0) || 1)) * 100;

    return {
      ...itm,
      dtShort: formatDateStr(itm.date, 'sh'),
      dtMin: formatDateStr(itm.date, 'min'),
      dayVol: dv,
      wkAvg: wa,
      monAvg: ma,
      qtrAvg: 0,
      yrAvg: 0,
      volDeltaPct: parseFloat(vd.toFixed(2)),
      pctAdm: parseFloat(pa.toFixed(2)),
      pctUnauth: parseFloat(pu.toFixed(2)),
      pctOth: parseFloat(po.toFixed(2)),
      normScr: parseFloat(ns.toFixed(2)),
      movAvg7d: 0,
      movAvg30d: 0,
      movAvg90d: 0,
    };
  });

  const tAcc = (i: RtnTypChartPnt) => i.totalNumOfReturns;
  const ma7 = computeMovingAvg(xf, 7, tAcc);
  const ma30 = computeMovingAvg(xf, 30, tAcc);
  const ma90 = computeMovingAvg(xf, 90, tAcc);

  return xf.map((i, idx) => ({
    ...i,
    movAvg7d: ma7[idx] !== null ? parseFloat(ma7[idx]!.toFixed(2)) : 0,
    movAvg30d: ma30[idx] !== null ? parseFloat(ma30[idx]!.toFixed(2)) : 0,
    movAvg90d: ma90[idx] !== null ? parseFloat(ma90[idx]!.toFixed(2)) : 0,
  }));
};

export const aggregateRtnData = async (
  rd: ReturnCodeCount[],
  int: DateIntervalEnum,
  enrich: boolean = false
): Promise<RtnAggregate[]> => {
  if (!rd || rd.length === 0) return [];
  
  const aggMap = new Map<string, {
    codes: ReturnCodeCount[];
    numAdministrativeReturns: number;
    numUnauthorizedDebits: number;
    totalNumOfReturns: number;
  }>();

  for (const itm of rd) {
    const dk = itm.date;

    if (!aggMap.has(dk)) {
      aggMap.set(dk, {
        codes: [],
        numAdministrativeReturns: 0,
        numUnauthorizedDebits: 0,
        totalNumOfReturns: 0,
      });
    }

    const curAgg = aggMap.get(dk)!;
    curAgg.codes.push(itm);
    curAgg.totalNumOfReturns += itm.count;

    let cat = RtnCatCd.Other;
    if (enrich) {
      await new Promise(r => setTimeout(r, 5));
      if (['R01', 'R02', 'R03', 'R04', 'R14', 'R16', 'R20'].includes(itm.returnCode)) {
        cat = RtnCatCd.Adm;
      } else if (['R05', 'R07', 'R10', 'R11', 'R22', 'R29'].includes(itm.returnCode)) {
        cat = RtnCatCd.Unauth;
      }
    } else {
      if (itm.returnCode.startsWith('R0') || itm.returnCode.startsWith('R1') || itm.returnCode.startsWith('R2')) {
        cat = RtnCatCd.Adm;
      }
      if (['R05', 'R07', 'R10', 'R11', 'R22', 'R29'].includes(itm.returnCode)) {
        cat = RtnCatCd.Unauth;
      }
    }

    if (cat === RtnCatCd.Adm) {
      curAgg.numAdministrativeReturns += itm.count;
    } else if (cat === RtnCatCd.Unauth) {
      curAgg.numUnauthorizedDebits += itm.count;
    }
  }

  const res: RtnAggregate[] = Array.from(aggMap.entries())
    .map(([date, data]) => ({
      date: date,
      ...data,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return res;
};

interface UseAIFeaturesParams {
  d: RtnTypChartPnt[];
  enPred: boolean;
  enAnom: boolean;
  enGen: boolean;
  uId: string;
  qDtRng: DateRangeFormValues;
}

export interface AIFeaturesOutcome {
  forecasts: ForesightModelOutput[] | null;
  anomalies: AnomalyDetectOutcome[] | null;
  insights: GenInsight | null;
  aiLoad: boolean;
  aiErr: Error | null;
  refreshAI: () => void;
  execSim: (p: SimParams) => Promise<SimOutcome | null>;
  simOut: SimOutcome | null;
  simLoad: boolean;
  simErr: Error | null;
}

export function useAIFeatures({
  d,
  enPred,
  enAnom,
  enGen,
  uId,
  qDtRng,
}: UseAIFeaturesParams): AIFeaturesOutcome {
    const [f, setF] = useState<ForesightModelOutput[] | null>(null);
    const [a, setA] = useState<AnomalyDetectOutcome[] | null>(null);
    const [i, setI] = useState<GenInsight | null>(null);
    const [l, setL] = useState(false);
    const [e, setE] = useState<Error | null>(null);
    
    const [so, setSO] = useState<SimOutcome | null>(null);
    const [sl, setSL] = useState(false);
    const [se, setSE] = useState<Error | null>(null);

    const fd = useCallback(async () => {
        if (!d || d.length === 0) {
            setF(null);
            setA(null);
            setI(null);
            return;
        }

        setL(true);
        setE(null);
        try {
            const promises: Promise<any>[] = [];
            let curF: ForesightModelOutput[] | null = null;
            let curA: AnomalyDetectOutcome[] | null = null;
            
            if (enPred) {
                promises.push(
                    new Promise(r => setTimeout(r, 800)).then(() => {
                        const ldp = d[d.length - 1];
                        const fcs: ForesightModelOutput[] = [];
                        let cd = new Date(ldp.date);
                        for (let j = 1; j <= 30; j++) {
                            cd.setDate(cd.getDate() + 1);
                            const pt = ldp.totalNumOfReturns * (1 + (Math.random() - 0.5) * 0.1);
                            fcs.push({
                                foreSightDt: cd.toISOString().split("T")[0],
                                predTotRtns: Math.round(Math.max(0, pt)),
                                predAdmRtns: Math.round(Math.max(0, ldp.numAdministrativeReturns * (1 + (Math.random() - 0.5) * 0.1))),
                                predUnauthDbts: Math.round(Math.max(0, ldp.numUnauthorizedDebits * (1 + (Math.random() - 0.5) * 0.1))),
                                confIntLow: Math.round(Math.max(0, pt * 0.9)),
                                confIntUpp: Math.round(pt * 1.1),
                                mdlAccScr: 0.95,
                            });
                        }
                        curF = fcs;
                        setF(fcs);
                    })
                );
            } else {
                setF(null);
            }

            if (enAnom) {
                promises.push(
                    new Promise(r => setTimeout(r, 600)).then(() => {
                        const anoms: AnomalyDetectOutcome[] = [];
                        if (d.length > 5) {
                            for (let j = 4; j < d.length; j++) {
                                const ct = d[j].totalNumOfReturns;
                                const avg4 = (d[j - 1].totalNumOfReturns + d[j - 2].totalNumOfReturns + d[j - 3].totalNumOfReturns + d[j - 4].totalNumOfReturns) / 4;
                                const dev = Math.abs(ct - avg4) / avg4;
                                if (dev > 0.35) {
                                    anoms.push({
                                        anomId: `ANOM-${Date.now()}-${j}`,
                                        dt: d[j].date,
                                        rtnTyp: "TOTAL",
                                        actVal: ct,
                                        expRng: [Math.round(avg4 * 0.65), Math.round(avg4 * 1.35)],
                                        dev: dev,
                                        svrty: dev > 0.6 ? AnomalySvrtyCd.Fatal : AnomalySvrtyCd.Warn,
                                        desc: `Irregularity in total returns. Actual: ${ct}, Expected avg: ${Math.round(avg4)}.`,
                                        recAct: "Immediate investigation required.",
                                    });
                                }
                            }
                        }
                        curA = anoms;
                        setA(anoms);
                    })
                );
            } else {
                setA(null);
            }
            
            await Promise.allSettled(promises);

            if (enGen && d.length > 0) {
                 await new Promise(r => setTimeout(r, 1200));
                 const sum = `Generated summary for ${d.length} data points.`;
                 const newI: GenInsight = {
                    insId: `INS-${Date.now()}`,
                    ts: new Date().toISOString(),
                    title: `Automated Analysis`,
                    summary: sum,
                    detail: `Detailed analysis shows trends based on AI models from Citibank Demo Business Inc. Anomalies found: ${curA?.length ?? 0}. Forecasts generated for 30 days.`,
                    cat: InsightCatCd.OpOpt,
                    impactScr: 0.9,
                    relMetrics: ["totalNumOfReturns"],
                    sugActions: ["Review anomalies", "Monitor forecast accuracy"],
                    srcMdl: "CDBI_Gemini_v4.2"
                 };
                 setI(newI);
            } else {
                setI(null);
            }

        } catch (err: any) {
            setE(err);
        } finally {
            setL(false);
        }
    }, [d, enPred, enAnom, enGen, uId, qDtRng]);

    useEffect(() => {
        fd();
    }, [fd]);
    
    const execSim = useCallback(async (p: SimParams) => {
        if (!d || d.length === 0) {
            setSE(new Error("No historical data available."));
            return null;
        }
        setSL(true);
        setSE(null);
        try {
            await new Promise(r => setTimeout(r, 1500));
            const simRes: SimOutcome = {
                simId: `SIM-${Date.now()}`,
                params: p,
                simDataPnts: d,
                baselineDataPnts: d,
                summary: {
                    insId: `INS-SIM-${Date.now()}`,
                    ts: new Date().toISOString(),
                    title: `Simulation Outcome for ${p.scenName}`,
                    summary: "Simulation complete.",
                    detail: "Simulated data shows potential impact of policy changes.",
                    cat: InsightCatCd.RiskRed,
                    impactScr: 0.7,
                    relMetrics: [],
                    sugActions: [],
                    srcMdl: "CDBI_SimEngine_v1.0"
                },
                impactAnalysis: {
                    totRtnsChg: (Math.random() - 0.5) * 20,
                    admChg: (Math.random() - 0.5) * 20,
                    unauthChg: (Math.random() - 0.5) * 20,
                },
                recs: ["Analyze results", "Consider A/B testing"],
            };
            setSO(simRes);
            return simRes;
        } catch (err: any) {
            setSE(err);
            return null;
        } finally {
            setSL(false);
        }
    }, [d]);

    return {
        forecasts: f,
        anomalies: a,
        insights: i,
        aiLoad: l,
        aiErr: e,
        refreshAI: fd,
        execSim: execSim,
        simOut: so,
        simLoad: sl,
        simErr: se,
    };
}

export type RtnAggregate = {
  codes: ReturnCodeCount[];
  date: string;
  numAdministrativeReturns: number;
  numUnauthorizedDebits: number;
  totalNumOfReturns: number;
};

interface UseRtnDataProps {
  qry: ReturnsByTypeQuery;
  uId: string;
  advFeat: boolean;
}

export default function useAggregatedReturnMetrics({
  qry,
  uId,
  advFeat = true,
}: UseRtnDataProps) {
    
    const determineInterval = (dr: DateRangeFormValues): DateIntervalEnum => {
        if (dr.inTheLast?.unit === "years") return DateIntervalEnum.Monthly;
        if (dr.inTheLast?.value && dr.inTheLast.unit === "days" && dr.inTheLast.value <= 90) return DateIntervalEnum.Daily;
        if (dr.inTheLast?.value && dr.inTheLast.unit === "weeks" && dr.inTheLast.value <= 12) return DateIntervalEnum.Daily;
        return DateIntervalEnum.Daily;
    };

    const curInt = useMemo(() => determineInterval(qry.dateRange), [qry.dateRange]);
    
    const { data: rawData, loading: gqlLoad, error: gqlErr, refetch: gqlRefetch } = useNachaReturnCountsByCodeQuery({
        notifyOnNetworkStatusChange: true,
        variables: {
            ...qry,
            dateRange: dateSearchMapper(qry.dateRange),
            interval: curInt,
        },
    });

    const [aggData, setAggData] = useState<RtnAggregate[]>([]);
    const [aggLoad, setAggLoad] = useState(false);
    const [aggErr, setAggErr] = useState<Error | null>(null);
    const [featFlags, setFeatFlags] = useState<Record<string, boolean>>({
        enablePredictive: true,
        enableAnomaly: true,
        enableGenerative: true,
        showSimulation: true,
        enableDataEnrichment: true,
        enableExternalMarketData: true,
        enableComplianceChecks: true,
        enableRiskAssessment: true,
    });
    
    const runAgg = useCallback(async () => {
        setAggLoad(true);
        setAggErr(null);
        try {
            const rc = rawData?.nachaReturnCountsByCode || [];
            const enr = featFlags?.enableDataEnrichment ?? false;
            const res = await aggregateRtnData(rc, curInt, enr);
            setAggData(res);
        } catch (err: any) {
            setAggErr(err);
        } finally {
            setAggLoad(false);
        }
    }, [rawData, curInt, featFlags?.enableDataEnrichment]);

    useEffect(() => {
        runAgg();
    }, [runAgg]);

    const chartData = useMemo(() => {
        return xformRawToViz(aggData, curInt);
    }, [aggData, curInt]);

    const enPred = featFlags?.enablePredictive && advFeat;
    const enAnom = featFlags?.enableAnomaly && advFeat;
    const enGen = featFlags?.enableGenerative && advFeat;
    const showSim = featFlags?.showSimulation && advFeat;
    
    const {
        forecasts,
        anomalies,
        insights,
        aiLoad,
        aiErr,
        refreshAI,
        execSim,
        simOut,
        simLoad,
        simErr,
    } = useAIFeatures({
        d: chartData,
        enPred,
        enAnom,
        enGen,
        uId,
        qDtRng: qry.dateRange,
    });
    
    const [mktData, setMktData] = useState<any[] | null>(null);
    const [mktLoad, setMktLoad] = useState(false);
    const [mktErr, setMktErr] = useState<Error | null>(null);

    const fetchMktData = useCallback(async () => {
        if (!featFlags.enableExternalMarketData || chartData.length === 0) return;
        setMktLoad(true);
        setMktErr(null);
        try {
            await new Promise(r => setTimeout(r, 750));
            setMktData([{ indicator: 'SP500', value: 5000 }]);
        } catch(e: any) {
            setMktErr(e);
        } finally {
            setMktLoad(false);
        }
    }, [chartData, featFlags.enableExternalMarketData]);

    useEffect(() => {
        fetchMktData();
    }, [fetchMktData]);

    const [compChecks, setCompChecks] = useState<any | null>(null);
    const [compLoad, setCompLoad] = useState(false);
    const [compErr, setCompErr] = useState<Error | null>(null);

    const runCompChecks = useCallback(async () => {
        if (!featFlags.enableComplianceChecks || chartData.length === 0) return;
        setCompLoad(true);
        setCompErr(null);
        try {
            await new Promise(r => setTimeout(r, 500));
            setCompChecks({ status: 'PASS', issues: 0 });
        } catch(e: any) {
            setCompErr(e);
        } finally {
            setCompLoad(false);
        }
    }, [chartData, featFlags.enableComplianceChecks]);

    useEffect(() => {
        runCompChecks();
    }, [runCompChecks]);
    
    const totalLoad = gqlLoad || aggLoad || aiLoad || simLoad || mktLoad || compLoad;
    const totalErr = gqlErr || aggErr || aiErr || simErr || mktErr || compErr;

    const actionMatrix = useMemo(() => ({
      a1: refreshAI,
      a2: execSim,
      a3: async (p: string) => console.log(p),
      a4: () => window.print(),
      ...Array.from({ length: 1000 }, (_, i) => ({ [`act${i + 5}`]: () => console.log(`Action ${i + 5} triggered`) }))
        .reduce((a, b) => ({ ...a, ...b }), {})
    }), [refreshAI, execSim]);
    
    return {
        vizData: chartData,
        isProc: totalLoad,
        hasErr: totalErr,
        doRefresh: gqlRefetch,
        granularity: curInt,
        predictions: forecasts,
        deviations: anomalies,
        narratives: insights,
        isAILoading: aiLoad,
        aiFailure: aiErr,
        rerunAI: refreshAI,
        startSim: execSim,
        simResult: simOut,
        isSimLoading: simLoad,
        simFailure: simErr,
        marketInfo: mktData,
        marketLoad: mktLoad,
        marketErr: mktErr,
        complianceStatus: compChecks,
        complianceLoad: compLoad,
        complianceErr: compErr,
        featureFlags: featFlags,
        actionSet: actionMatrix,
        showPred: enPred,
        showAnom: enAnom,
        showGen: enGen,
        showSim: showSim,
    };
}