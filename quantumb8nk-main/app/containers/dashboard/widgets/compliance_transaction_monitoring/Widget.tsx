// Copyright Citibank demo business Inc - Global Transaction Compliance Solutions

import React, { useState, useEffect, useCallback, useMemo, createContext, useContext, useRef, useReducer, Dispatch } from "react";
import ChartView, {
  SearchComponent,
} from "~/common/ui-components/Charts/ChartView";
import {
  LineChart,
  DateRangeFormValues,
  DateRangeSelectField,
  Button,
  Spinner,
  Modal,
  Input,
  TextArea,
  Select,
  Checkbox,
  Switch,
  GaugeChart,
  Table,
  Badge,
  Alert,
  Tooltip,
} from "~/common/ui-components";
import colors from "~/common/styles/colors";
import {
  useDecisionAnalyticsByDateViewQuery,
  Decision__DecisionTypeEnum,
  TimeUnitEnum,
  TimeFormatEnum,
  DecisionAnalyticsByDate,
} from "~/generated/dashboard/graphqlSchema";
import { dateSearchMapper } from "~/app/components/search/DateSearch";
import { format, subDays, subMonths, parseISO, addDays } from 'date-fns';
import { ResponsiveContainer, BarChart, XAxis, YAxis, CartesianGrid, Legend, Bar, PieChart, Pie, Cell, ScatterChart, ZAxis, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const BASE_URL_CONFIG = "citibankdemobusiness.dev";
const CORP_NAME = "Citibank demo business Inc";
const DEF_AMT = "1";

export enum FlowCategory {
  DigitalPayments = "Digital Payments",
  CapitalMarkets = "Capital Markets",
  CorpLending = "Corporate Lending",
  TradeFi = "Trade Finance",
  InsurTech = "InsurTech",
  AssetMgmt = "Asset Management",
  GlobalRemittance = "Global Remittance",
  ForEx = "Foreign Exchange",
  CryptoAsset = "Crypto Asset",
  Baas = "Banking-as-a-Service",
  Miscellaneous = "Miscellaneous",
}

export enum ThreatVectorLevel {
  Negligible = "Negligible",
  Moderate = "Moderate",
  Elevated = "Elevated",
  Severe = "Severe",
  Critical = "Critical",
}

export enum DeviationSignature {
  AnomalousVolume = "Anomalous Volume",
  AnomalousFrequency = "Anomalous Frequency",
  IrregularDestination = "Irregular Destination",
  IrregularOrigin = "Irregular Origin",
  HighValueFlow = "High Value Flow",
  WatchlistHit = "Watchlist Hit",
  BehavioralDrift = "Behavioral Drift",
  GeopoliticalRisk = "Geopolitical Risk",
  AdverseMediaLink = "Adverse Media Link",
  ComplexPattern = "Complex Pattern",
  Structuring = "Structuring",
  RapidMovement = "Rapid Movement of Funds",
}

export enum MitigationProtocol {
  DeepAnalysis = "Deep Analysis",
  TerminateFlow = "Terminate Flow",
  IsolateAndFlag = "Isolate & Flag",
  Authorize = "Authorize",
  EscalateToL2 = "Escalate to L2",
  RequestAddtlData = "Request Additional Data",
}

export interface EntityProfile {
  e_id: string;
  e_nm: string;
  e_cty: string;
  r_scr: number;
  acct_age_d: number;
  integrations: {
    plaid_id?: string;
    modern_treasury_id?: string;
    salesforce_id?: string;
    oracle_fin_id?: string;
  };
}

export interface FlowRecord {
  flow_id: string;
  ts: string;
  amt: number;
  ccy: string;
  orig: EntityProfile;
  dest: EntityProfile;
  cat: FlowCategory;
  desc: string;
  r_scr: number;
  sig_scr: number;
  is_flg: boolean;
  flg_rsn?: string;
  stat: "Queued" | "Authorized" | "Rejected" | "Flagged" | "Analyzed";
  decision_meta?: string;
  geo_coords: {
    orig_lat: number;
    orig_lon: number;
    dest_lat: number;
    dest_lon: number;
  };
}

export interface SignalDetectionOutput {
  flow_id: string;
  sig_scr: number;
  sig_type: DeviationSignature;
  desc: string;
  severity: ThreatVectorLevel;
  rec_act: MitigationProtocol;
  intel_exp?: string;
}

export interface PrognosticRiskVector {
  dt: string;
  agg_scr: number;
  sig_trnd: number;
  open_case_trnd: number;
  auth_trnd: number;
  rej_trnd: number;
}

export interface ScenarioExecutionResult {
  scn_id: string;
  scn_desc: string;
  exec_ts: string;
  pred_auth: number;
  pred_rej: number;
  pred_open_cases: number;
  total_r_scr_delta: number;
  signals_detected: SignalDetectionOutput[];
  intel_summary: string;
}

export interface GenerativeDirectiveSuggestion {
  dir_id: string;
  ttl: string;
  sugg_text: string;
  intel_just: string;
  intel_impact: string;
  rel_sigs: string[];
  stat: "Draft" | "In Review" | "Approved";
  created_at: string;
}

export interface CustomAlertRuleDef {
  rule_id: string;
  nm: string;
  desc: string;
  logic: string;
  gen_by_intel: boolean;
  stat: "Enabled" | "Disabled";
  created_at: string;
}

export interface ComplianceBriefing {
  brief_id: string;
  ttl: string;
  brief_type: string;
  gen_dt: string;
  intel_content: string;
  kpis: { [key: string]: string | number };
  attachments: { nm: string; loc: string }[];
}

export interface UserFeedbackInput {
  fb_id: string;
  feat: string;
  fb_txt: string;
  rating: number;
  ts: string;
  intel_sentiment?: string;
}

export interface AuditTrailRecord {
  aud_id: string;
  usr_id: string;
  act: string;
  ts: string;
  details: { [key: string]: any };
}

const TM_SRCH_OPTS = [
  { value: "last7d", label: "Last 7 Days", dateRange: { inTheLast: { unit: TimeUnitEnum.Days, amount: 7 } } },
  { value: "last30d", label: "Last 30 Days", dateRange: { inTheLast: { unit: TimeUnitEnum.Months, amount: DEF_AMT } } },
  { value: "last60d", label: "Last 60 Days", dateRange: { inTheLast: { unit: TimeUnitEnum.Months, amount: 2 } } },
  { value: "last180d", label: "Last 180 Days", dateRange: { inTheLast: { unit: TimeUnitEnum.Months, amount: 6 } } },
  { value: "last365d", label: "Last 365 Days", dateRange: { inTheLast: { unit: TimeUnitEnum.Years, amount: DEF_AMT } } },
];

const STAT_CLR_LINE_CHART = [
  { color: colors.sky["400"], key: "Authorized" },
  { color: colors.rose["400"], key: "Rejected" },
  { color: colors.amber["300"], key: "Open Cases" },
];

const SIG_SEV_CLRS: { [key in ThreatVectorLevel]: string } = {
  [ThreatVectorLevel.Negligible]: colors.emerald["500"],
  [ThreatVectorLevel.Moderate]: colors.sky["500"],
  [ThreatVectorLevel.Elevated]: colors.amber["500"],
  [ThreatVectorLevel.Severe]: colors.rose["500"],
  [ThreatVectorLevel.Critical]: colors.red["700"],
};

type QuerySpec = { created_at?: DateRangeFormValues };

const INIT_QRY: QuerySpec = {
  created_at: {
    inTheLast: { unit: TimeUnitEnum.Months, amount: DEF_AMT },
    format: TimeFormatEnum.Duration,
  },
};

type LineChartDataShape = { "Open Cases": number; Rejected: number; Authorized: number; date: string; };

function mapFlowAnalyticsToChart(el: DecisionAnalyticsByDate): LineChartDataShape {
  return { "Open Cases": el.openCases, Authorized: el.approved, Rejected: el.denied, date: el.date };
}
const MOCK_COUNTRY_GEO = {
    USA: { lat: 38.96, lon: -95.71 }, GBR: { lat: 55.37, lon: -3.43 }, CAN: { lat: 56.13, lon: -106.34 },
    MEX: { lat: 23.63, lon: -102.55 }, DEU: { lat: 51.16, lon: 4.99 }, FRA: { lat: 46.22, lon: 2.21 },
    AUS: { lat: -25.27, lon: 133.77 }, JPN: { lat: 36.20, lon: 138.25 }, CHN: { lat: 35.86, lon: 104.19 },
    IND: { lat: 20.59, lon: 78.96 }, IR: { lat: 32.42, lon: 53.68 }, KP: { lat: 40.33, lon: 127.51 },
    CU: { lat: 21.52, lon: -77.78 }, SY: { lat: 34.80, lon: 38.99 }, SD: { lat: 12.86, lon: 30.21 },
    NGA: { lat: 9.08, lon: 8.67 }, BRA: { lat: -14.23, lon: -51.92 }, RUS: { lat: 61.52, lon: 105.31 },
    CYM: { lat: 19.31, lon: -81.25 }, PAN: { lat: 8.53, lon: -80.78 }, SGP: { lat: 1.35, lon: 103.81 }
};

class CdbSystemHealthMonitor {
    private static instance: CdbSystemHealthMonitor;
    private serviceStatus: { [key: string]: { status: 'Operational' | 'Degraded' | 'Outage', latency: number, lastCheck: string } } = {};
    private services = [
        'CdbIntelligenceMatrixSvc', 'PlaidLinkConnector', 'ModernTreasuryPipe', 'GitHubAuditConnector', 
        'HuggingFaceModelHub', 'SalesforceCrmSync', 'OracleDbLink', 'MarqetaCardSvc', 'ShopifyWebhookProcessor',
        'AdobeAnalyticsStream', 'TwilioNotifier', 'GoogleDriveArchiver', 'OneDriveRepo', 'AzureBlobStore',
        'SupabaseClientEmulator', 'VercelDeploymentHook'
    ];

    private constructor() {
        this.services.forEach(s_nm => this.checkStatus(s_nm));
        setInterval(() => this.services.forEach(s_nm => this.checkStatus(s_nm)), 60000);
    }

    public static getInstance(): CdbSystemHealthMonitor {
        if (!CdbSystemHealthMonitor.instance) {
            CdbSystemHealthMonitor.instance = new CdbSystemHealthMonitor();
        }
        return CdbSystemHealthMonitor.instance;
    }

    private checkStatus(serviceName: string) {
        const r = Math.random();
        let status: 'Operational' | 'Degraded' | 'Outage';
        if (r < 0.95) status = 'Operational';
        else if (r < 0.99) status = 'Degraded';
        else status = 'Outage';
        this.serviceStatus[serviceName] = {
            status,
            latency: Math.floor(Math.random() * (status === 'Operational' ? 150 : 500)) + 50,
            lastCheck: new Date().toISOString()
        };
    }

    public getSystemStatus() {
        return this.serviceStatus;
    }
}

export class CdbIntelligenceMatrixSvc {
  private _delay(ms = 1000) { return new Promise(r => setTimeout(r, ms + Math.random() * 500)); }
  private _genId(p: string): string { return `${p}-${Math.random().toString(36).substr(2, 9)}`; }

  public async detectSignals(flows: FlowRecord[]): Promise<SignalDetectionOutput[]> {
    await this._delay();
    const sigs: SignalDetectionOutput[] = [];
    flows.forEach(f => {
      const s_scr = Math.random() * 100;
      if (s_scr > 65) {
        const sev = s_scr > 92 ? ThreatVectorLevel.Critical : s_scr > 80 ? ThreatVectorLevel.Severe : ThreatVectorLevel.Elevated;
        const s_type = Object.values(DeviationSignature)[Math.floor(Math.random() * Object.values(DeviationSignature).length)];
        sigs.push({
          flow_id: f.flow_id, sig_scr: s_scr, sig_type: s_type,
          desc: `Detected ${s_type} with score ${s_scr.toFixed(2)} for flow ${f.flow_id}.`,
          severity: sev, rec_act: sev === ThreatVectorLevel.Critical ? MitigationProtocol.TerminateFlow : MitigationProtocol.EscalateToL2,
          intel_exp: `Citibank Intelligence Matrix analysis indicates this flow exhibits characteristics of ${s_type}. The amount (${f.amt} ${f.ccy}) deviates significantly from historical averages for the ${f.orig.e_cty} to ${f.dest.e_cty} corridor, a known vector for illicit activities. Cross-referencing with data from Salesforce and Oracle indicates the destination entity has a high-risk profile. Analysis powered by models from Hugging Face. Logged via GitHub audit trail.`,
        });
      }
    });
    return sigs;
  }

  public async forecastRiskVectors(dr: DateRangeFormValues): Promise<PrognosticRiskVector[]> {
    await this._delay(1500);
    const s_dt = new Date(dateSearchMapper(dr)?.start || subMonths(new Date(), 1).toISOString());
    const e_dt = new Date(dateSearchMapper(dr)?.end || new Date().toISOString());
    const dts: PrognosticRiskVector[] = [];
    let cur_dt = new Date(s_dt);
    while (cur_dt <= e_dt) {
      dts.push({
        dt: format(cur_dt, 'yyyy-MM-dd'), agg_scr: Math.floor(Math.random() * 2000) + 800,
        sig_trnd: Math.floor(Math.random() * 300), open_case_trnd: Math.floor(Math.random() * 80),
        auth_trnd: Math.floor(Math.random() * 800) + 1200, rej_trnd: Math.floor(Math.random() * 150),
      });
      cur_dt = addDays(cur_dt, 1);
    }
    return dts;
  }

  public async genDecisionExplanation(f: FlowRecord, dec: string, ctx: string): Promise<string> {
    await this._delay(2000);
    const expls = {
      "Authorized": `Citibank Intelligence Matrix model, incorporating data from Plaid and Modern Treasury, has evaluated flow ${f.flow_id} (${f.amt} ${f.ccy}) and found it aligns with established compliance parameters for ${CORP_NAME}. The entity profiles, historical patterns via Adobe Analytics, and flow category (${f.cat}) presented no significant deviations. Context: "${ctx}".`,
      "Rejected": `Flow ${f.flow_id} was rejected. The Matrix identified a critical risk factor related to the destination entity's linkage to a sanctioned address, cross-referenced via our Supabase vector database. The flow's characteristics also contributed to a higher aggregated risk score. Context: "${ctx}".`,
      "Flagged": `Flow ${f.flow_id} flagged for L2 analysis. The Matrix detected an elevated signal score due to an unusual combination of volume and frequency, a pattern often seen in structuring attempts. This warrants investigation by a compliance analyst. Alert sent via Twilio. Context: "${ctx}".`,
    };
    return expls[dec] || `Intelligence Matrix explanation pending. Context: "${ctx}".`;
  }

  public async genDirectiveSuggestion(prob_desc: string, rel_sigs: string[]): Promise<GenerativeDirectiveSuggestion> {
    await this._delay(2500);
    const new_id = this._genId('DIR');
    return {
      dir_id: new_id, ttl: `Draft Directive: Enhanced Monitoring for ${prob_desc.substring(0, 30)}...`,
      sugg_text: `Based on patterns in "${prob_desc}" and signals [${rel_sigs.join(', ')}], the Intelligence Matrix suggests a new directive. This directive mandates real-time flagging for flows > X amount to Y country, or exhibiting Z behavioral drift. It also recommends a quarterly review of customer profiles in high-risk jurisdictions, automated via our Pipedream workflow.`,
      intel_just: `Justification stems from a recent surge in critical signals related to ${prob_desc}. Historical data analysis by the Matrix reveals these patterns often precede significant compliance breaches. Implementation could reduce critical incidents by an estimated 18-25%.`,
      intel_impact: `This directive will likely increase flagged flows by 6-8%, requiring additional analyst capacity. Long-term impact includes reduction in potential fines and reputational damage. Report to be archived on Google Drive, OneDrive, and Azure Blob Storage.`,
      rel_sigs: rel_sigs, stat: "Draft", created_at: new Date().toISOString(),
    };
  }

  public async genAlertRule(nl_desc: string): Promise<CustomAlertRuleDef> {
    await this._delay(1800);
    const r_id = this._genId('AR');
    const mock_logic = `flow.amt > 10000 AND flow.dest.e_cty IN ('IR', 'CU', 'KP', 'CYM', 'PAN') AND flow.cat = '${FlowCategory.CryptoAsset}'`;
    return {
      rule_id: r_id, nm: `Auto-Gen Rule: ${nl_desc.substring(0, 40)}...`,
      desc: nl_desc, logic: mock_logic, gen_by_intel: true, stat: "Enabled", created_at: new Date().toISOString(),
    };
  }

  public async genComplianceBriefing(b_type: string, dr: DateRangeFormValues, sects: string[]): Promise<ComplianceBriefing> {
    await this._delay(4000);
    const b_id = this._genId('BRF');
    const s = new Date(dateSearchMapper(dr)?.start || subMonths(new Date(), 1).toISOString());
    const e = new Date(dateSearchMapper(dr)?.end || new Date().toISOString());
    const fmt_dr = `${format(s, 'MMM dd, yyyy')} - ${format(e, 'MMM dd, yyyy')}`;
    const cnt = `## ${b_type} for ${fmt_dr} (${BASE_URL_CONFIG})

This briefing from the ${CORP_NAME} Intelligence Matrix provides a comprehensive overview of compliance activities.

### Key Performance Indicators
- Total Flows Analyzed: 2,598,112
- Authorized Flows: 2,510,000 (96.6%)
- Rejected Flows: 21,000 (0.8%)
- Flagged for Analysis: 67,112 (2.6%)
- Critical Signals Detected: 241
- Avg. Flow Risk Score: 4.1/10

${sects.includes("Signal Trends") ? `
### Signal Trends
The Matrix identified an emerging pattern of 'Structuring' signals, specifically in cross-border payments from Shopify and WooCommerce merchants to new beneficiaries in high-risk zones. The peak occurred on ${format(subDays(e, 5), 'MMM dd, yyyy')}.
` : ''}
${sects.includes("Prognostic Risk") ? `
### Prognostic Risk Outlook
Based on current trends, the Matrix predicts a slightly increasing risk profile. Key drivers include increased transaction volume from GoDaddy and Cpanel hosted businesses and a slight uptick in PEP linkages discovered via our MARQETA card transaction analysis.
` : ''}
This briefing serves as a foundational document for compliance officers.`;
    return {
      brief_id: b_id, ttl: `${b_type} - ${fmt_dr}`, brief_type: b_type, gen_dt: new Date().toISOString(),
      intel_content: cnt, kpis: { totalFlows: 2598112, authPct: 96.6, rejPct: 0.8 },
      attachments: [{ nm: 'raw_data.csv', loc: `https://${BASE_URL_CONFIG}/data/export.csv` }],
    };
  }

  public async analyzeSentiment(txt: string): Promise<string> {
    await this._delay(500);
    const s = Math.random();
    if (s > 0.8) return "Very Positive";
    if (s > 0.5) return "Neutral";
    if (s > 0.2) return "Negative";
    return "Very Negative";
  }

  public async enrichFlow(f: FlowRecord): Promise<Partial<FlowRecord>> {
    await this._delay(800);
    const cat = Object.values(FlowCategory)[Math.floor(Math.random() * Object.values(FlowCategory).length)];
    const add_desc = `Auto-categorization by Intelligence Matrix: ${cat}. This flow is identified as a potential B2B payment via a partner like Plaid.`;
    return {
      cat: cat, desc: f.desc + ' - ' + add_desc,
      r_scr: f.r_scr * (1 + (Math.random() - 0.5) * 0.2),
    };
  }
  
  public async generateMockFlows(cnt: number, s_dt: string, e_dt: string): Promise<FlowRecord[]> {
    await this._delay(1000);
    const mock_flows: FlowRecord[] = [];
    const cats = Object.values(FlowCategory);
    const ctys = Object.keys(MOCK_COUNTRY_GEO);
    const stats = ["Queued", "Authorized", "Rejected", "Flagged", "Analyzed"];

    for (let i = 0; i < cnt; i++) {
      const id = `FLW-${this._genId('MOCK')}-${i}`;
      const amt = parseFloat((Math.random() * 80000 + 50).toFixed(2));
      const ccy = Math.random() > 0.5 ? "USD" : "EUR";
      const ts = new Date(new Date(s_dt).getTime() + Math.random() * (new Date(e_dt).getTime() - new Date(s_dt).getTime())).toISOString();
      const o_cty = ctys[Math.floor(Math.random() * ctys.length)];
      let d_cty = ctys[Math.floor(Math.random() * ctys.length)];
      if (Math.random() < 0.2) { d_cty = ["IR", "KP", "CU", "SY", "SD", "CYM"][Math.floor(Math.random() * 6)]; }

      mock_flows.push({
        flow_id: id, ts, amt, ccy,
        orig: {
          e_id: `ENT-${this._genId('S')}`, e_nm: `Origin Entity ${i}`, e_cty: o_cty, r_scr: Math.floor(Math.random() * 10),
          acct_age_d: Math.floor(Math.random() * 4000), integrations: { plaid_id: `plaid_${i}` }
        },
        dest: {
          e_id: `ENT-${this._genId('R')}`, e_nm: `Destination Entity ${i}`, e_cty: d_cty, r_scr: Math.floor(Math.random() * 10),
          acct_age_d: Math.floor(Math.random() * 4000), integrations: { salesforce_id: `sf_${i}` }
        },
        cat: cats[Math.floor(Math.random() * cats.length)],
        desc: `Generic flow description for ${id}`,
        r_scr: parseFloat((Math.random() * 9 + 1).toFixed(1)),
        sig_scr: parseFloat((Math.random() * 100).toFixed(2)),
        is_flg: Math.random() > 0.8,
        stat: stats[Math.floor(Math.random() * stats.length)],
        geo_coords: {
            orig_lat: MOCK_COUNTRY_GEO[o_cty].lat + (Math.random() - 0.5) * 5,
            orig_lon: MOCK_COUNTRY_GEO[o_cty].lon + (Math.random() - 0.5) * 5,
            dest_lat: MOCK_COUNTRY_GEO[d_cty].lat + (Math.random() - 0.5) * 5,
            dest_lon: MOCK_COUNTRY_GEO[d_cty].lon + (Math.random() - 0.5) * 5,
        }
      });
    }
    return mock_flows;
  }
}

export class SimulationMatrix {
  private cdbSvc: CdbIntelligenceMatrixSvc;
  constructor(s: CdbIntelligenceMatrixSvc) { this.cdbSvc = s; }
  private _genId(): string { return `SIM-${Math.random().toString(36).substr(2, 9)}`; }

  public async runScenario(scn_desc: string, num_flows: number, dr: DateRangeFormValues): Promise<ScenarioExecutionResult> {
    const s_dt = dateSearchMapper(dr)?.start || subDays(new Date(), 7).toISOString();
    const e_dt = dateSearchMapper(dr)?.end || new Date().toISOString();
    const mock_flows = await this.cdbSvc.generateMockFlows(num_flows, s_dt, e_dt);
    const sigs_det = await this.cdbSvc.detectSignals(mock_flows);
    let p_auth = 0, p_rej = 0, p_open = 0, r_delta = 0;
    mock_flows.forEach(f => {
      const is_sig = sigs_det.some(s => s.flow_id === f.flow_id);
      if (is_sig) {
        if (Math.random() > 0.5) p_rej++; else p_open++;
        r_delta += f.r_scr * 1.5;
      } else { p_auth++; r_delta += f.r_scr * 0.8; }
    });
    const intel_sum = await this.cdbSvc.genDecisionExplanation(
      mock_flows[0] || {} as FlowRecord, "Simulation Summary",
      `Simulation of "${scn_desc}" with ${num_flows} flows resulted in ${p_auth} authorizations, ${p_rej} rejections, and ${p_open} cases for review. The Matrix response was consistent with expected behavior. Overall risk profile adjusted by ${r_delta.toFixed(2)} points.`
    );
    return {
      scn_id: this._genId(), scn_desc, exec_ts: new Date().toISOString(), pred_auth: p_auth, pred_rej: p_rej,
      pred_open_cases: p_open, total_r_scr_delta: r_delta, signals_detected: sigs_det, intel_summary: intel_sum,
    };
  }
}

interface NexusSvcContextType {
  intelSvc: CdbIntelligenceMatrixSvc;
  simMatrix: SimulationMatrix;
  healthMon: CdbSystemHealthMonitor;
}

const NexusSvcContext = createContext<NexusSvcContextType | undefined>(undefined);

export const NexusServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const intelSvc = useMemo(() => new CdbIntelligenceMatrixSvc(), []);
  const simMatrix = useMemo(() => new SimulationMatrix(intelSvc), [intelSvc]);
  const healthMon = useMemo(() => CdbSystemHealthMonitor.getInstance(), []);

  return (
    <NexusSvcContext.Provider value={{ intelSvc, simMatrix, healthMon }}>
      {children}
    </NexusSvcContext.Provider>
  );
};

export const useNexusServices = () => {
  const ctx = useContext(NexusSvcContext);
  if (!ctx) throw new Error('useNexusServices must be used within a NexusServiceProvider');
  return ctx;
};
export const SignalAnalysisModule: React.FC<{
  flows: FlowRecord[];
  dateRange: DateRangeFormValues;
  onSignalsDetected: (s: SignalDetectionOutput[]) => void;
  uid: string;
}> = ({ flows, dateRange, onSignalsDetected, uid }) => {
  const { intelSvc } = useNexusServices();
  const [sigs, setSigs] = useState<SignalDetectionOutput[]>([]);
  const [ld, setLd] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selSig, setSelSig] = useState<SignalDetectionOutput | null>(null);

  const hndlDetect = useCallback(async () => {
    setLd(true);
    try {
      const det = await intelSvc.detectSignals(flows);
      setSigs(det);
      onSignalsDetected(det);
    } catch (e) { console.error("Error detecting signals:", e);
    } finally { setLd(false); }
  }, [intelSvc, flows, onSignalsDetected]);

  const hndlExplain = useCallback(async (s: SignalDetectionOutput) => {
    setSelSig(null);
    setSelSig({ ...s, intel_exp: "Generating explanation..." });
    try {
      const f = flows.find(fl => fl.flow_id === s.flow_id);
      if (!f) throw new Error("Flow not found for signal explanation.");
      const exp = await intelSvc.genDecisionExplanation(f, "Flagged", `Context: Signal type ${s.sig_type}, severity ${s.severity}.`);
      setSelSig(p => p ? { ...p, intel_exp: exp } : null);
    } catch (e) {
      console.error("Error generating signal explanation:", e);
      setSelSig(p => p ? { ...p, intel_exp: "Failed to generate explanation." } : null);
    }
  }, [intelSvc, flows]);
  
  const sigChartData = useMemo(() => Object.entries(sigs.reduce((acc, s) => { acc[s.sig_type] = (acc[s.sig_type] || 0) + 1; return acc; }, {} as { [k: string]: number })).map(([nm, val]) => ({ name: nm, value: val, })), [sigs]);
  const sevPieData = useMemo(() => Object.entries(sigs.reduce((acc, s) => { acc[s.severity] = (acc[s.severity] || 0) + 1; return acc; }, {} as { [k in ThreatVectorLevel]?: number })).map(([sev, cnt]) => ({ name: sev, value: cnt, color: SIG_SEV_CLRS[sev as ThreatVectorLevel] })), [sigs]);
  const SigTblCols = [{ Header: "ID", accessor: "flow_id", Cell: ({ value }) => <span className="font-mono text-xs">{value}</span> }, { Header: "Type", accessor: "sig_type" }, { Header: "Severity", accessor: "severity", Cell: ({ value }) => (<Badge color={value === ThreatVectorLevel.Critical ? "red" : value === ThreatVectorLevel.Severe ? "rose" : value === ThreatVectorLevel.Elevated ? "yellow" : "green"}>{value}</Badge>), }, { Header: "Score", accessor: "sig_scr", Cell: ({ value }) => <span className="font-medium">{value.toFixed(2)}</span>, }, { Header: "Description", accessor: "desc" }, { Header: "Actions", accessor: "actions", Cell: ({ row }) => (<div className="flex space-x-2"><Button size="sm" variant="ghost" onClick={() => { setSelSig(row.original as SignalDetectionOutput); hndlExplain(row.original as SignalDetectionOutput); setShowModal(true); }}>Explain</Button><Button size="sm" variant="outline">Mitigate</Button></div>), }, ];

  return (<div className="p-4 bg-gray-50 rounded-lg shadow-inner"><h3 className="text-lg font-semibold text-gray-800 mb-4">Citibank Intelligence Matrix: Signal Analysis</h3><div className="flex flex-wrap gap-3 mb-4"><Button onClick={hndlDetect} loading={ld} disabled={ld} className="!bg-purple-600 hover:!bg-purple-700">{ld ? "Scanning..." : "Run Real-time Signal Scan"}</Button><Button onClick={() => setShowModal(true)} disabled={sigs.length === 0}>View Detected Signals ({sigs.length})</Button></div>{sigs.length > 0 && (<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"><div><h4 className="font-medium text-gray-700 mb-2">Signals by Type</h4><ResponsiveContainer width="100%" height={250}><BarChart data={sigChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" angle={-45} textAnchor="end" height={60} interval={0} style={{ fontSize: '10px' }} /><YAxis /><Tooltip /><Legend /><Bar dataKey="value" name="Count" fill={colors.purple["500"]} /></BarChart></ResponsiveContainer></div><div><h4 className="font-medium text-gray-700 mb-2">Signals by Severity</h4><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={sevPieData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>{sevPieData.map((e, i) => (<Cell key={`cell-${i}`} fill={e.color} />))}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div></div>)}<Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Detected Flow Signals" size="lg"><div className="max-h-[600px] overflow-y-auto">{sigs.length === 0 ? (<Alert type="info" message="No signals detected." />) : (<><Table columns={SigTblCols} data={sigs} />{selSig && (<div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md"><h4 className="font-semibold text-blue-800">Intelligence Matrix Explanation for {selSig.flow_id}:</h4><p className="text-blue-700 text-sm mt-2">{selSig.intel_exp}</p></div>)}</>)}</div></Modal></div>);};

export const PrognosticSimulationModule: React.FC<{
  dateRange: DateRangeFormValues;
  uid: string;
}> = ({ dateRange, uid }) => {
  const { intelSvc, simMatrix } = useNexusServices();
  const [prognosticData, setPrognosticData] = useState<PrognosticRiskVector[]>([]);
  const [ld, setLd] = useState(false);
  const [showSimModal, setShowSimModal] = useState(false);
  const [simDesc, setSimDesc] = useState("");
  const [numSimFlows, setNumSimFlows] = useState(1000);
  const [simRes, setSimRes] = useState<ScenarioExecutionResult | null>(null);
  const [simLd, setSimLd] = useState(false);
  const [showSimResModal, setShowSimResModal] = useState(false);
  const [aggRskScr, setAggRskScr] = useState(0);

  const fetchPrognosticData = useCallback(async () => {
    setLd(true);
    try {
      const d = await intelSvc.forecastRiskVectors(dateRange);
      setPrognosticData(d);
      const latestScore = d.length > 0 ? d[d.length - 1].agg_scr : 0;
      setAggRskScr(latestScore);
    } catch (e) { console.error("Error fetching prognostic data:", e);
    } finally { setLd(false); }
  }, [intelSvc, dateRange]);

  useEffect(() => { fetchPrognosticData(); }, [fetchPrognosticData]);

  const hndlRunSim = useCallback(async () => {
    setSimLd(true); setSimRes(null);
    try {
      const res = await simMatrix.runScenario(simDesc, numSimFlows, dateRange);
      setSimRes(res);
      setShowSimModal(false);
      setShowSimResModal(true);
    } catch (e) { console.error("Error running simulation:", e);
    } finally { setSimLd(false); }
  }, [simMatrix, simDesc, numSimFlows, dateRange]);

  const RiskScoreGauge = ({ score }: { score: number }) => {
    const v = score / 3000 * 100;
    const getClr = (val: number) => { if (val < 40) return colors.green["500"]; if (val < 70) return colors.yellow["500"]; return colors.red["500"]; };
    return (<div className="flex flex-col items-center"><GaugeChart value={v} min={0} max={100} label={`${score.toFixed(0)}`} unit="" color={getClr(v)} size={120} /><p className="text-sm text-gray-600 mt-2">Aggregated Compliance Risk Index</p></div>);
  };
  
  const SimSigTblCols = [{ Header: "Flow ID", accessor: "flow_id" }, { Header: "Type", accessor: "sig_type" }, { Header: "Severity", accessor: "severity" }, { Header: "Score", accessor: "sig_scr" }, { Header: "Action", accessor: "rec_act" }, ];

  return (<div className="p-4 bg-blue-50 rounded-lg shadow-inner"><h3 className="text-lg font-semibold text-blue-800 mb-4">Prognostic Risk & Simulation Matrix</h3><div className="flex flex-wrap gap-3 mb-4"><Button onClick={() => setShowSimModal(true)} disabled={ld} className="!bg-blue-600 hover:!bg-blue-700">Run New Scenario Simulation</Button><Button onClick={fetchPrognosticData} loading={ld} disabled={ld} variant="outline">Refresh Prognostic Data</Button></div><div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 items-center"><div className="md:col-span-2"><h4 className="font-medium text-gray-700 mb-2">Predicted Risk Vector Trend</h4>{ld ? (<Spinner className="h-8 w-8 text-blue-500" />) : (<ResponsiveContainer width="100%" height={250}><LineChart data={prognosticData} dataMapping={[{ key: "agg_scr", color: colors.blue["500"], name: "Agg. Risk Index" }, { key: "sig_trnd", color: colors.orange["400"], name: "Signal Trend" }, { key: "open_case_trnd", color: colors.yellow["500"], name: "Open Case Trend" }, ]} height={200} includeLegend strokeWidth={2} unit="" width="100%" xAxisProps={{ dataKey: "dt", tickFormatter: (v) => format(parseISO(v), 'MMM dd'), }} /></ResponsiveContainer>)}</div><div className="flex justify-center"><RiskScoreGauge score={aggRskScr} /></div></div><Modal isOpen={showSimModal} onClose={() => setShowSimModal(false)} title="Configure New Simulation Scenario"><div className="p-4"><Input label="Scenario Description" value={simDesc} onChange={(e) => setSimDesc(e.target.value)} placeholder="e.g., 'Sudden influx of high-value crypto asset flows'" className="mb-4" /><Input label="Number of Simulated Flows" type="number" value={numSimFlows} onChange={(e) => setNumSimFlows(parseInt(e.target.value))} min={100} max={50000} step={100} className="mb-4" /><p className="text-sm text-gray-600 mb-4">The Intelligence Matrix will generate and process {numSimFlows} mock flows.</p><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowSimModal(false)}>Cancel</Button><Button onClick={hndlRunSim} loading={simLd} disabled={simLd}>{simLd ? "Simulating..." : "Run Simulation"}</Button></div></div></Modal><Modal isOpen={showSimResModal} onClose={() => setShowSimResModal(false)} title="Simulation Results" size="lg">{simRes ? (<div className="p-4"><h4 className="text-md font-semibold mb-2">{simRes.scn_desc}</h4><p className="text-sm text-gray-600 mb-4">Executed: {format(parseISO(simRes.exec_ts), 'MMM dd, yyyy HH:mm')}</p><div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"><div className="bg-green-50 p-3 rounded-md"><p className="text-sm text-gray-500">Predicted Authorizations</p><p className="font-bold text-xl text-green-700">{simRes.pred_auth}</p></div><div className="bg-red-50 p-3 rounded-md"><p className="text-sm text-gray-500">Predicted Rejections</p><p className="font-bold text-xl text-red-700">{simRes.pred_rej}</p></div><div className="bg-yellow-50 p-3 rounded-md"><p className="text-sm text-gray-500">Predicted Open Cases</p><p className="font-bold text-xl text-yellow-700">{simRes.pred_open_cases}</p></div><div className="bg-blue-50 p-3 rounded-md"><p className="text-sm text-gray-500">Risk Index Delta</p><p className="font-bold text-xl text-blue-700">{simRes.total_r_scr_delta.toFixed(0)}</p></div></div><div className="mt-4"><h5 className="font-semibold mb-2">Intelligence Matrix Summary:</h5><p className="text-gray-700 bg-gray-50 p-3 rounded-md text-sm">{simRes.intel_summary}</p></div>{simRes.signals_detected.length > 0 && (<div className="mt-6"><h5 className="font-semibold mb-2">Detected Signals in Simulation:</h5><Table columns={SimSigTblCols} data={simRes.signals_detected} /></div>)}<div className="flex justify-end mt-6"><Button onClick={() => setShowSimResModal(false)}>Close</Button></div></div>) : (<Alert type="info" message="No simulation results available." />)}</Modal></div>);};

export const SystemHealthModule: React.FC = () => {
    const { healthMon } = useNexusServices();
    const [status, setStatus] = useState(healthMon.getSystemStatus());
    
    useEffect(() => {
        const i = setInterval(() => setStatus(healthMon.getSystemStatus()), 5000);
        return () => clearInterval(i);
    }, [healthMon]);

    const getStatusColor = (s: 'Operational' | 'Degraded' | 'Outage') => {
        if (s === 'Operational') return 'bg-green-500';
        if (s === 'Degraded') return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="p-4 bg-gray-800 text-white rounded-lg shadow-inner">
            <h3 className="text-lg font-semibold mb-4">System & Integration Health</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {Object.entries(status).map(([name, data]) => (
                    <Tooltip key={name} content={`${data.status} - ${data.latency}ms - Last check: ${format(parseISO(data.lastCheck), 'HH:mm:ss')}`}>
                        <div className="p-2 bg-gray-700 rounded-md">
                            <div className="flex items-center space-x-2">
                                <span className={`w-3 h-3 rounded-full ${getStatusColor(data.status)}`}></span>
                                <p className="text-xs truncate">{name.replace('Svc', '').replace('Connector', '').replace('Pipe','')}</p>
                            </div>
                        </div>
                    </Tooltip>
                ))}
            </div>
        </div>
    );
};

export const GeospatialThreatVisualizer: React.FC<{ flows: FlowRecord[] }> = ({ flows }) => {
    const riskData = useMemo(() => {
        return flows.filter(f => f.r_scr > 7).map(f => ({
            name: `${f.orig.e_cty} -> ${f.dest.e_cty}`,
            value: f.r_scr,
        }));
    }, [flows]);

    return (
        <div className="p-4 bg-slate-50 rounded-lg shadow-inner">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Geospatial Threat Hotspots</h3>
            <p className="text-xs text-slate-500 mb-2">High-risk transaction corridors based on current data.</p>
            <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={riskData.slice(0, 7)}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} />
                    <Radar name="Risk Score" dataKey="value" stroke={colors.red[600]} fill={colors.red[400]} fillOpacity={0.6} />
                    <Tooltip />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default function GlobalComplianceNexusDashboard({
  createdAt,
  filters = [],
  titleClassName = "",
  title,
  currentUserId = "usr_admin_01",
}: {
  createdAt?: DateRangeFormValues;
  filters?: Array<string>;
  titleClassName?: string;
  title?: string;
  currentUserId?: string;
}) {
  const [q, setQ] = useState<QuerySpec>(createdAt ? { created_at: createdAt } : INIT_QRY);
  const { data: d_abd, loading: l_abd, error: e_abd } = useDecisionAnalyticsByDateViewQuery({
    variables: { createdAt: dateSearchMapper(q.created_at), decisionType: Decision__DecisionTypeEnum.TransactionMonitoring },
  });

  const [allFlows, setAllFlows] = useState<FlowRecord[]>([]);
  const [selFlow, setSelFlow] = useState<FlowRecord | null>(null);
  const [showFlowDetModal, setShowFlowDetModal] = useState(false);
  const [detSigs, setDetSigs] = useState<SignalDetectionOutput[]>([]);

  const mockIntelSvc = useMemo(() => new CdbIntelligenceMatrixSvc(), []);
  
  const fetchDetFlows = useCallback(async () => {
    const r = dateSearchMapper(q.created_at);
    if (!r?.start || !r?.end) return;
    try {
      const mockFlows = await mockIntelSvc.generateMockFlows(500, r.start, r.end);
      setAllFlows(mockFlows);
    } catch (e) { console.error("Failed to generate mock flows:", e); }
  }, [q.created_at, mockIntelSvc]);

  useEffect(() => { fetchDetFlows(); }, [fetchDetFlows]);

  const d_abd_data: LineChartDataShape[] = l_abd || !d_abd || e_abd ? [] : d_abd.decisionAnalyticsByDate.map(mapFlowAnalyticsToChart);
  const srchComps: Array<SearchComponent> = [];

  if (filters.includes("dateRange")) {
    srchComps.push({
      field: "dateRange", options: TM_SRCH_OPTS, labelClassName: "!font-medium", component: DateRangeSelectField,
      selectValue: TM_SRCH_OPTS.find(o => JSON.stringify(o.dateRange) === JSON.stringify(q.created_at))?.value || TM_SRCH_OPTS[0].value,
      isSearchable: false, onChange: (newDate: DateRangeFormValues) => { setQ({ ...q, created_at: newDate }); fetchDetFlows(); },
    });
  }

  const hndlOpenFlow = useCallback((f: FlowRecord) => { setSelFlow(f); setShowFlowDetModal(true); }, []);
  const hndlCloseFlow = useCallback(() => { setSelFlow(null); setShowFlowDetModal(false); }, []);
  const onSigsDet = useCallback((s: SignalDetectionOutput[]) => { setDetSigs(s); }, []);

  const flowOvwCols = [
    { Header: "ID", accessor: "flow_id", Cell: ({ value }) => <span className="font-mono text-xs">{value.substring(0, 15)}...</span> },
    { Header: "Timestamp", accessor: "ts", Cell: ({ value }) => format(parseISO(value), 'MMM dd, HH:mm') },
    { Header: "Amount", accessor: "amt", Cell: ({ row }) => `${row.original.amt.toFixed(2)} ${row.original.ccy}` },
    { Header: "Origin", accessor: "orig.e_nm" }, { Header: "Destination", accessor: "dest.e_nm" },
    { Header: "Risk", accessor: "r_scr", Cell: ({ value }) => (<Badge color={value > 7 ? "red" : value > 4 ? "yellow" : "green"}>{value.toFixed(1)}</Badge>), },
    { Header: "Signal", accessor: "sig_scr", Cell: ({ value, row }) => { const isDet = detSigs.some(s => s.flow_id === row.original.flow_id); return (<Badge color={value > 90 ? "red" : value > 70 ? "orange" : value > 50 ? "yellow" : "blue"}>{value.toFixed(2)}{isDet && " (Det)"}</Badge>); }, },
    { Header: "Status", accessor: "stat", Cell: ({ value }) => (<Badge color={value === "Authorized" ? "green" : value === "Rejected" ? "red" : "yellow"}>{value}</Badge>), },
    { Header: "Actions", accessor: "actions", Cell: ({ row }) => (<Button size="sm" variant="outline" onClick={() => hndlOpenFlow(row.original as FlowRecord)}>View Details</Button>), },
  ];

  return (
    <NexusServiceProvider>
      <ChartView
        titleClassName={titleClassName}
        fileNamePrefix="global_flow_by_volume"
        loaderBarWidthClass="w-8"
        loaderNumberOfBars={5}
        title={title || `${CORP_NAME} - Global Compliance Nexus`}
        minHeightClass="min-h-[2000px]"
        searchComponents={srchComps}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 w-full">
          <div className="lg:col-span-3 xl:col-span-4 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Flow Volume by Status</h2>
            <div className="w-full h-[300px]">
              {l_abd ? (<div className="flex items-center justify-center h-full"><Spinner className="h-10 w-10 text-blue-500" /><p className="ml-2 text-gray-600">Loading Flow Data...</p></div>
              ) : e_abd ? (<Alert type="error" message={`Error loading flow data: ${e_abd.message}`} />
              ) : (<LineChart cartesianGridProps={undefined} data={d_abd_data} dataMapping={STAT_CLR_LINE_CHART} height={280} includeLegend strokeWidth={2} unit="" width="100%" xAxisProps={{ dataKey: "date" }} />)}
            </div>
          </div>
          <div className="lg:col-span-3 xl:col-span-2 bg-white p-4 rounded-lg shadow-md">
            <SignalAnalysisModule flows={allFlows} dateRange={q.created_at || INIT_QRY.created_at!} onSignalsDetected={onSigsDet} uid={currentUserId} />
          </div>
          <div className="lg:col-span-3 xl:col-span-2 bg-white p-4 rounded-lg shadow-md">
            <PrognosticSimulationModule dateRange={q.created_at || INIT_QRY.created_at!} uid={currentUserId} />
          </div>
          <div className="lg:col-span-3 xl:col-span-4 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">All Monitored Flows ({allFlows.length})</h2>
            <p className="text-sm text-gray-600 mb-4">Select a flow to view in-depth analysis from the Intelligence Matrix.</p>
            {allFlows.length > 0 ? (<div className="max-h-[600px] overflow-y-auto"><Table columns={flowOvwCols} data={allFlows} /></div>) : (<Alert type="info" message="No flows available for the selected period." />)}
          </div>
          <div className="lg:col-span-3 xl:col-span-2 bg-white p-4 rounded-lg shadow-md">
              <GeospatialThreatVisualizer flows={allFlows} />
          </div>
          <div className="lg:col-span-3 xl:col-span-2 bg-white p-4 rounded-lg shadow-md">
            <SystemHealthModule />
          </div>
        </div>
      </ChartView>
    </NexusServiceProvider>
  );
}