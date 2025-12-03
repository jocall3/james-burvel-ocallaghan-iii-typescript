import React, { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext } from "react";
import { useHistory } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardHeading,
  CardTitle,
  LoadingLine,
  Button, // Assuming Button is available in common/ui-components
  TextArea, // Assuming TextArea is available
  Input, // Assuming Input is available
  Select, // Assuming Select is available
  Checkbox, // Assuming Checkbox is available
  Spinner, // Assuming Spinner is available
  Alert, // Assuming Alert is available
  Tabs, // Assuming Tabs component
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Modal, // Assuming Modal component
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge, // Assuming Badge component
} from "~/common/ui-components";
import {
  CardButton,
  CardButtonContainer,
} from "~/common/ui-components/CardButton/CardButton";
import { useComplianceCasesWidgetQuery } from "~/generated/dashboard/graphqlSchema";
import {
  BellIcon,
  BookOpenIcon,
  CalculatorIcon,
  ChatBubbleBottomCenterTextIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  Cog6ToothIcon,
  CpuChipIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  FlagIcon,
  MagnifyingGlassIcon,
  ShareIcon,
  SparklesIcon,
  SquaresPlusIcon,
  TableCellsIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

export const BASE_URL = "https://citibankdemobusiness.dev";
export const COMPANY_NAME = "Citibank demo business Inc";
export const GW_BASE = `${BASE_URL}/gw/v3`;
export const COGNIMIND_GW_EP = `${GW_BASE}/cognimind`;
export const DOCUVERSE_GW_EP = `${GW_BASE}/docuverse`;
export const CHRONOSYNC_GW_EP = `${GW_BASE}/chronosync`;
export const NOTIFEX_GW_EP = `${GW_BASE}/notifex`;
export const WORKFLOW_ORCHESTRATOR_GW_EP = `${GW_BASE}/workflow-orchestrator`;
export const DATASCAPE_GW_EP = `${GW_BASE}/datascape`;
export const USER_CONFIG_GW_EP = `${GW_BASE}/user-config`;
export const RISKMATRIX_GW_EP = `${GW_BASE}/riskmatrix`;
export const REGWATCH_GW_EP = `${GW_BASE}/regwatch`;
export const ENTITY_ID_GW_EP = `${GW_BASE}/entity-id`;

export const COGNIMIND_MDL_TXT = "cognimind-pro-text";
export const COGNIMIND_MDL_CODE = "cognimind-pro-code";
export const COGNIMIND_MDL_MM = "cognimind-pro-vision";
export const COGNIMIND_MDL_QUANTUM = "cognimind-quantum-alpha";

export const INTEGRATED_SERVICES = [
  "Gemini", "ChatHot", "Pipedream", "GitHub", "HuggingFace", "Plaid", "ModernTreasury",
  "GoogleDrive", "OneDrive", "AzureBlobStorage", "GoogleCloudPlatform", "Supabase", "Vercel",
  "Salesforce", "OracleCloud", "MARQETA", "CitibankAPI", "Shopify", "WooCommerce",
  "GoDaddy", "CPanel", "AdobeCreativeCloud", "Twilio", "Stripe", "PayPal", "QuickBooks",

  "SAP", "NetSuite", "Workday", "Jira", "Confluence", "Slack", "MicrosoftTeams", "Zoom",
  "DocuSign", "Dropbox", "Box", "Asana", "Trello", "Monday.com", "Airtable", "Notion",
  "Figma", "Sketch", "InVision", "Zendesk", "HubSpot", "Marketo", "Mailchimp", "SendGrid",
  "Datadog", "NewRelic", "Sentry", "PagerDuty", "Terraform", "Ansible", "Docker", "Kubernetes",
  "AWS", "DigitalOcean", "Linode", "Heroku", "Cloudflare", "Fastly", "Akamai", "Snowflake",
  "Databricks", "Tableau", "PowerBI", "Looker", "Segment", "Mixpanel", "Amplitude", "Intercom",
  "Drift", "Gainsight", "Auth0", "Okta", "Twitch", "Discord", "Reddit", "Twitter", "Facebook",
  "Instagram", "LinkedIn", "TikTok", "Snapchat", "Pinterest", "YouTube", "Vimeo", "Spotify",
  "AppleMusic", "Netflix", "Hulu", "DisneyPlus", "AmazonPrimeVideo", "FedEx", "UPS", "DHL",
  ...Array.from({ length: 900 }, (_, i) => `GenericEnterpriseService${i + 1}`)
];

export const GLOBAL_FEATURE_CONFIG = {
  cogniMindSynthSummaries: true,
  cogniMindRiskProjections: true,
  cogniMindActionProposals: true,
  cogniMindPolicyOracle: true,
  cogniMindDocuForge: true,
  hyperAuditLedger: true,
  dynamicFlowAutomation: true,
  predictiveOutcomesEngine: true,
  realtimeRegFeedImpact: true,
  expertQuerySystem: true,
  anomalyHypervisor: true,
  sentimentWaveAnalysis: true,
  contextualGuidanceSystem: true,
  automatedAlertingFabric: true,
  polymorphicReportingSuite: true,
  quantumLedgerIntegration: false,
  multiCloudDataReplication: true,
  blockchainTxnVerification: true,
  aiPoweredCodeGeneration: true,
  entityGraphAnalysis: true,
};

export enum RegActRecState {
  AwaitingValidation = "awaiting_validation",
  Validated = "validated",
  Rejected = "rejected",
  InProgress = "in_progress",
  Resolved = "resolved",
  Escalated = "escalated",
  UnderReview = "under_review",
  Archived = "archived",
  OnHold = "on_hold",
}

export enum RecUrgency {
  Trivial = "trivial",
  Low = "low",
  Medium = "medium",
  High = "high",
  Critical = "critical",
  Emergency = "emergency",
}

export enum AuditLogEventType {
  RecordViewed = "record_viewed",
  AISynthesisGenerated = "ai_synthesis_generated",
  RiskProjectionExecuted = "risk_projection_executed",
  ActionProposed = "action_proposed",
  DocumentForged = "document_forged",
  RecordStateModified = "record_state_modified",
  PolicyConsulted = "policy_consulted",
  UserPromptedAI = "user_prompted_ai",
  FeedbackSubmitted = "feedback_submitted",
  AnomalyFlagged = "anomaly_flagged",
  GlobalAIScanInitiated = "global_ai_scan_initiated",
  ReportMaterialized = "report_materialized",
}

export interface RegActRecDetail {
  uid: string;
  sbj: string;
  dsc: string;
  st: RegActRecState;
  urg: RecUrgency;
  recId: string;
  recTyp: string;
  crtDt: string;
  updDt: string;
  asgns: string[];
  prts: { id: string; n: string; t: string }[];
  pols: { id: string; t: string; v: string }[];
  atch: { id: string; n: string; u: string; t: string }[];
  meta: Record<string, any>;
  resNotes?: string;
}

export interface RegPolicyDoc {
  id: string;
  ttl: string;
  ver: string;
  effDt: string;
  cont: string;
  kw: string[];
  jur: string;
  revDt: string;
}

export interface CogniMindTextResp {
  genTxt: string;
  usgMeta?: {
    pTkn: number;
    cTkn: number;
    tTkn: number;
  };
  sftyAttr?: {
    blk: boolean;
    cats: string[];
    scrs: number[];
  };
}

export interface RiskProjectionOutcome {
  scn: string;
  prob: number;
  imp: "trivial" | "low" | "medium" | "high" | "critical";
  mitg: string[];
  regExp: string[];
  finImp: {
    min: number;
    max: number;
    cur: string;
  };
  confScr: number;
}

export interface ProposedAction {
  actId: string;
  desc: string;
  urg: RecUrgency;
  sugBy: "AI_CogniMind" | "Sys" | "Usr";
  rat: string;
  estEffHr: number;
  assocPolIds: string[];
  isAutoTrg: boolean;
}

export interface AuditLedgerRecord {
  id: string;
  ts: string;
  usrId: string;
  evtTyp: AuditLogEventType;
  entTyp: string;
  entId: string;
  dets: Record<string, any>;
}

interface HolisticOpsCtxType {
  selRecId: string | null;
  setSelRecId: (id: string | null) => void;
  launchRecOverlay: (id: string) => void;
  closeRecOverlay: () => void;
  isRecOverlayOpen: boolean;
  actRecData: RegActRecDetail | null;
}

const HolisticOpsCtx = createContext<HolisticOpsCtxType | undefined>(undefined);

export const useHolisticOps = () => {
  const c = useContext(HolisticOpsCtx);
  if (!c) {
    throw new Error("useHolisticOps must be within a HolisticOpsCtxProvider");
  }
  return c;
};

const emulateNetworkLatency = (ms: number = 800) =>
  new Promise((r) => setTimeout(r, ms + Math.random() * 400));

const fabricateMockRegActRec = (id: string): RegActRecDetail => {
  const sts = Object.values(RegActRecState);
  const urgs = Object.values(RecUrgency);
  const recTyps = ["Txn", "Acct", "UsrProfile", "AuthEvent"];
  const sbjs = [
    "Anomalous Fund Transfer", "High-Risk Acct Origination", "Sanction List Entity Match",
    "Insider Activity Alert", "Data Exfiltration Event", "FATCA Status Mismatch",
    "KYC Data Deficiency", "Market Manipulation Pattern", "Reg Reporting Variance", "High-Value Client Complaint"
  ];
  const dscs = [
    "Observed non-standard, high-velocity fund movements to a high-risk jurisdiction.",
    "A new corporate account exhibits characteristics matching money laundering typologies.",
    "System flagged a counterparty in a proposed transaction against OFAC sanctions list.",
    "An employee's trading activity correlates with non-public information release.",
    "Unusual volume of sensitive data accessed from a non-standard IP address.",
    "Client's self-certified tax status is inconsistent with other available data points.",
    "Incomplete beneficial ownership information for a complex legal entity.",
    "Algorithmic trading patterns suggest potential wash trading or spoofing activity.",
    "Material discrepancy identified between internal ledger and regulatory submission.",
    "A strategically important client has escalated a complaint regarding product suitability."
  ];
  const polCt = Math.floor(Math.random() * 4) + 1;
  const atchCt = Math.floor(Math.random() * 5);
  const a = Math.random().toString(36).substr(2, 9).toUpperCase();
  const b = Math.floor(Math.random() * 1000000) + 1000;
  return {
    uid: id,
    sbj: sbjs[Math.floor(Math.random() * sbjs.length)],
    dsc: dscs[Math.floor(Math.random() * dscs.length)],
    st: sts[Math.floor(Math.random() * sts.length)],
    urg: urgs[Math.floor(Math.random() * urgs.length)],
    recId: `ENT-${a}`,
    recTyp: recTyps[Math.floor(Math.random() * recTyps.length)],
    crtDt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
    updDt: new Date().toISOString(),
    asgns: [`usr-${Math.floor(Math.random() * 10) + 1}`],
    prts: [
      { id: `prty-${a.slice(0, 5)}`, n: `Entity ${Math.floor(Math.random() * 2000)}`, t: "Ext" },
      { id: `prty-${a.slice(5, 9)}`, n: `Dept ${Math.floor(Math.random() * 100)}`, t: "Int" },
    ],
    pols: Array.from({ length: polCt }).map((_, i) => ({
      id: `pol-${Math.random().toString(36).substr(2, 4)}`,
      t: `CorpPolicy ${Math.floor(Math.random() * 50) + 1}`,
      v: `${i + 1}.0`,
    })),
    atch: Array.from({ length: atchCt }).map((_, i) => ({
      id: `doc-${Math.random().toString(36).substr(2, 6)}`,
      n: `Evid_${i + 1}.dat`,
      u: `/gw/docuverse/${i + 1}`,
      t: "BIN",
    })),
    meta: {
      txnVal: b,
      txnCur: "USD",
      srcSys: "QuantumCorePlatform",
      geo: "USA",
      riskVec: (Math.random() * 100).toFixed(2),
    },
  };
};

export const fetchMockRegPolicy = async (pId: string): Promise<RegPolicyDoc | null> => {
  await emulateNetworkLatency();
  const ps: RegPolicyDoc[] = [
    {
      id: "pol-aml-v3",
      ttl: "Global AML/CTF Policy v3.0",
      ver: "3.0",
      effDt: "2024-01-01",
      cont: "This policy establishes the global framework for preventing, detecting, and reporting money laundering and terrorist financing activities. All personnel of Citibank demo business Inc are required to adhere to these protocols, which encompass enhanced due diligence (EDD), transaction monitoring, suspicious activity reporting (SAR), and record retention. Transactions exceeding a dynamic risk-based threshold must undergo automated and manual review. Politically Exposed Persons (PEPs) and entities in high-risk jurisdictions require continuous monitoring. Non-compliance will result in disciplinary action and potential legal consequences.",
      kw: ["AML", "CTF", "SAR", "EDD", "PEP"],
      jur: "Global",
      revDt: "2024-05-15",
    },
    {
      id: "pol-dpa-v5",
      ttl: "Data Privacy & Protection Act (DPA) v5.1",
      ver: "5.1",
      effDt: "2023-09-01",
      cont: "This document outlines the firm's commitment to protecting personal and sensitive data in accordance with GDPR, CCPA, and other global data privacy regulations. It governs the entire data lifecycle, from collection and processing to storage and deletion. Data Subject Access Requests (DSARs) must be handled within prescribed timelines. A robust data breach response plan is in effect. All data processing activities must have a lawful basis, and cross-border data transfers are subject to stringent controls.",
      kw: ["GDPR", "CCPA", "Privacy", "DSAR", "DataBreach"],
      jur: "Global",
      revDt: "2024-04-20",
    }
  ];
  return ps.find(p => p.id === pId) || null;
};

export class CogniMindNexus {
  private k: string;
  private u: string;
  constructor(k: string, u: string = COGNIMIND_GW_EP) {
    this.k = k;
    this.u = u;
  }
  private async invoke(m: string, p: string, cfg?: Record<string, any>): Promise<CogniMindTextResp> {
    await emulateNetworkLatency(1800);
    let g = `[CogniMind Mock Resp for: "${p.substring(0, 60)}..."]\n`;
    if (p.includes("synthesize")) {
      g = `**CogniMind Synthesis:** The regulatory action record (UID: ${
        p.match(/UID: (\S+)/)?.[1] || "N/A"
      }) concerns an anomalous fund transfer, posing a significant money laundering risk. Key vectors include high-velocity movement to a high-risk jurisdiction. Immediate action: initiate Enhanced Due Diligence (EDD) and place a temporary hold on associated assets, pending review by the Tier 2 analysis team. Urgency: Critical.`;
    } else if (p.includes("project risk") || p.includes("simulate")) {
      g = JSON.stringify({
        scn: "Regulatory Enforcement Action & Financial Penalty",
        prob: 0.82,
        imp: "critical",
        mitg: ["Engage external legal counsel immediately.", "Proactively disclose findings to relevant regulators.", "Conduct a root cause analysis to fortify internal controls."],
        regExp: ["AML", "Sanctions Evasion", "Reporting Violations"],
        finImp: { min: 750000, max: 5000000, cur: "USD" },
        confScr: 0.91,
      });
    } else if (p.includes("propose actions")) {
      g = JSON.stringify([
        {
          actId: `ACT-${Math.random().toString(16).slice(2, 10)}`,
          desc: "Isolate and quarantine involved digital assets.",
          urg: "Critical",
          rat: "To prevent further movement of potentially illicit funds and preserve the chain of custody.",
          estEffHr: 2, assocPolIds: ["pol-aml-v3"], isAutoTrg: true,
        },
        {
          actId: `ACT-${Math.random().toString(16).slice(2, 10)}`,
          desc: "Compile and dispatch a Request for Information (RFI) to involved parties.",
          urg: "High",
          rat: "Essential for gathering evidence and clarifying the nature of the transaction.",
          estEffHr: 6, assocPolIds: [], isAutoTrg: false,
        },
      ]);
    } else if (p.includes("policy oracle")) {
      g = `**CogniMind Policy Oracle Query:** The activity described in record ${
        p.match(/UID: (\S+)/)?.[1] || "N/A"
      } appears to be in direct violation of the Global AML/CTF Policy v3.0, specifically sections 4.2 (High-Risk Transaction Monitoring) and 5.1 (PEP Screening). The described fund movement aligns with recognized typologies for layering. Per policy 6.3, immediate escalation to the Financial Crimes Unit is mandatory.`;
    } else if (p.includes("forge document")) {
      g = `**FORGED DRAFT - INTERNAL ESCALATION MEMORANDUM**
      **TO:** Head of Financial Crimes Unit
      **FROM:** Automated Compliance Monitoring System (CogniMind Module)
      **SUBJECT:** URGENT: Critical Escalation of Record ID: ${p.match(/UID: (\S+)/)?.[1] || "N/A"}
      This memorandum serves as a formal escalation for the referenced record, which has been flagged by the cognitive core with a 98.7% confidence score for high-risk money laundering activity.
      **Key Details:**
      - **Activity:** Anomalous, high-velocity fund transfer.
      - **Risk Indicators:** High-risk jurisdiction, non-standard transaction pattern, potential sanctions list proximity.
      **Recommendation:** Immediate asset freeze and initiation of a formal Suspicious Activity Report (SAR) filing process.
      `;
    } else if (p.includes("expert query")) {
      g = "A Suspicious Activity Report (SAR) is a legally mandated filing with a nation's Financial Intelligence Unit (e.g., FinCEN in the US) when a financial institution suspects a transaction may be related to illicit activities. It is a critical tool for law enforcement to combat financial crime. Failure to file, or 'tipping off' a subject about a SAR, carries severe penalties.";
    }
    const sb = Math.random() < 0.005;
    return {
      genTxt: sb ? "CogniMind response suppressed due to safety protocols." : g,
      usgMeta: { pTkn: p.length / 3.5, cTkn: g.length / 3.5, tTkn: (p.length + g.length) / 3.5 },
      sftyAttr: { blk: sb, cats: sb ? ["HARM_CAT_SENSITIVE"] : [], scrs: sb ? [0.95] : [0.05] },
    };
  }

  public async generateRecSynthesis(d: RegActRecDetail): Promise<CogniMindTextResp> {
    const p = `As a Tier 3 compliance analyst, synthesize the following regulatory action record into a concise executive brief. Focus on risk, exposure, and required actions.
    UID: ${d.uid}
    Subject: ${d.sbj}
    Description: ${d.dsc}
    Urgency: ${d.urg}
    Parties: ${d.prts.map(x => x.n).join(", ")}
    Policies: ${d.pols.map(x => x.t).join(", ")}
    Metadata: ${JSON.stringify(d.meta)}`;
    return this.invoke(COGNIMIND_MDL_TXT, p);
  }

  public async projectRisk(d: RegActRecDetail, params: Record<string, any>): Promise<RiskProjectionOutcome> {
    const p = `Execute a multi-faceted risk projection for this record. Analyze regulatory, financial, and reputational impact vectors.
    UID: ${d.uid}
    Subject: ${d.sbj}
    Urgency: ${d.urg}
    Simulation Params: ${JSON.stringify(params)}
    Context: Model against current global regulatory climate and enforcement trends. Output structured JSON.`;
    const r = await this.invoke(COGNIMIND_MDL_QUANTUM, p);
    try {
      return JSON.parse(r.genTxt) as RiskProjectionOutcome;
    } catch (e) {
      return {
        scn: "Projection Model Failure", prob: 0, imp: "critical", mitg: ["Manual review required"],
        regExp: ["Unknown"], finImp: { min: 0, max: 0, cur: "USD" }, confScr: 0,
      };
    }
  }

  public async proposeActions(d: RegActRecDetail): Promise<ProposedAction[]> {
    const p = `Based on the record details, propose a list of concrete, actionable steps. Each action must have a description, urgency, rationale, and automation potential. Output as a JSON array.
    UID: ${d.uid}
    Subject: ${d.sbj}
    Description: ${d.dsc}
    Urgency: ${d.urg}`;
    const r = await this.invoke(COGNIMIND_MDL_TXT, p);
    try {
      return JSON.parse(r.genTxt) as ProposedAction[];
    } catch (e) {
      return [];
    }
  }

  public async analyzePolicy(d: RegActRecDetail, polCont: string): Promise<CogniMindTextResp> {
    const p = `Act as a policy oracle. Analyze the provided record against the policy text and identify specific violations, citing relevant clauses.
    Record: UID: ${d.uid}, Subject: ${d.sbj}, Description: ${d.dsc}
    ---
    Policy Text: ${polCont}`;
    return this.invoke(COGNIMIND_MDL_TXT, p);
  }

  public async forgeDocument(d: RegActRecDetail, docTyp: string, ctx: string): Promise<CogniMindTextResp> {
    const p = `Forge a draft of a ${docTyp} for record UID: ${d.uid}. Incorporate all critical data and adhere to a professional, urgent tone.
    Additional Context: ${ctx}`;
    return this.invoke(COGNIMIND_MDL_TXT, p);
  }

  public async answerExpertQuery(q: string, d?: RegActRecDetail): Promise<CogniMindTextResp> {
    const ctx = d ? `Context: Record UID: ${d.uid}, Subject: ${d.sbj}\n` : "";
    const p = `As a world-class compliance expert, provide a definitive answer to the following query.
    ${ctx}
    Query: ${q}`;
    return this.invoke(COGNIMIND_MDL_TXT, p);
  }
}

export const auditLedgerSvc = {
  record: async (e: Omit<AuditLedgerRecord, "id" | "ts">): Promise<AuditLedgerRecord> => {
    await emulateNetworkLatency(150);
    const n: AuditLedgerRecord = { ...e, id: `aud-${Math.random().toString(36).substr(2, 12)}`, ts: new Date().toISOString() };
    console.log("AUDIT LEDGER:", n);
    return n;
  },
};

export const notifexSvc = {
  dispatch: async (usrId: string, msg: string, t: "info" | "warn" | "err" | "succ"): Promise<void> => {
    await emulateNetworkLatency(250);
    console.log(`NOTIFEX to ${usrId} (${t}): ${msg}`);
  },
};

export const workflowOrchestratorSvc = {
  modifyRecState: async (recId: string, nSt: RegActRecState, usrId: string): Promise<boolean> => {
    await emulateNetworkLatency(600);
    console.log(`WORKFLOW: User ${usrId} modified record ${recId} state to ${nSt}`);
    await auditLedgerSvc.record({
      usrId, evtTyp: AuditLogEventType.RecordStateModified, entTyp: "RegActRec", entId: recId,
      dets: { nSt },
    });
    return true;
  },
  executeAutomatedAction: async (actId: string, recId: string, usrId: string): Promise<boolean> => {
    await emulateNetworkLatency(600);
    console.log(`WORKFLOW: User ${usrId} executed automated action ${actId} for record ${recId}`);
    await auditLedgerSvc.record({
      usrId, evtTyp: AuditLogEventType.ActionProposed, entTyp: "RegActRec", entId: recId,
      dets: { autoActExec: actId },
    });
    await notifexSvc.dispatch(usrId, `Automated action "${actId}" executed for record ${recId}.`, "info");
    return true;
  },
};

export const cogniMindSvc = new CogniMindNexus("COGNIMIND_API_KEY_PLACEHOLDER");

function LoadingPlasm() {
  return (
    <div className="grid h-8 items-center gap-4 mint-sm:grid-cols-2">
      <LoadingLine />
      <LoadingLine />
    </div>
  );
}

interface FeatureModuleProps {
  t: string;
  i: React.ElementType;
  children: React.ReactNode;
  ld?: boolean;
  e?: string | null;
  acts?: React.ReactNode;
}

const FeatureModule: React.FC<FeatureModuleProps> = ({ t, i: I, children, ld, e, acts }) => {
  return (
    <div className="border border-gray-700 bg-gray-800 rounded-lg p-4 mb-4 shadow-lg relative text-gray-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-cyan-400">
          <I className="h-6 w-6 text-cyan-400" aria-hidden="true" />
          {t}
          {ld && <Spinner size="sm" className="ml-2" />}
        </h3>
        {acts && <div className="flex gap-2">{acts}</div>}
      </div>
      {e && <Alert type="error" className="mb-3">{`Error: ${e}`}</Alert>}
      <div className="text-sm text-gray-400">{children}</div>
    </div>
  );
};

interface RecStateBadgeProps { s: RegActRecState; }
const RecStateBadge: React.FC<RecStateBadgeProps> = ({ s }) => {
  const c = {
    [RegActRecState.AwaitingValidation]: "bg-yellow-900 text-yellow-300",
    [RegActRecState.InProgress]: "bg-yellow-900 text-yellow-300",
    [RegActRecState.UnderReview]: "bg-yellow-900 text-yellow-300",
    [RegActRecState.Validated]: "bg-green-900 text-green-300",
    [RegActRecState.Resolved]: "bg-green-900 text-green-300",
    [RegActRecState.Rejected]: "bg-red-900 text-red-300",
    [RegActRecState.Escalated]: "bg-red-900 text-red-300",
    [RegActRecState.Archived]: "bg-gray-700 text-gray-300",
    [RegActRecState.OnHold]: "bg-blue-900 text-blue-300",
  }[s] || "bg-gray-700 text-gray-300";
  return <Badge className={`${c} px-2 py-1 rounded-full text-xs font-medium border border-gray-600`}>{s.replace(/_/g, " ")}</Badge>;
};

interface RecUrgencyBadgeProps { u: RecUrgency; }
const RecUrgencyBadge: React.FC<RecUrgencyBadgeProps> = ({ u }) => {
  const c = {
    [RecUrgency.Trivial]: "bg-gray-700 text-gray-300",
    [RecUrgency.Low]: "bg-blue-900 text-blue-300",
    [RecUrgency.Medium]: "bg-yellow-900 text-yellow-300",
    [RecUrgency.High]: "bg-orange-800 text-orange-300",
    [RecUrgency.Critical]: "bg-red-900 text-red-300",
    [RecUrgency.Emergency]: "bg-purple-800 text-purple-300 animate-pulse",
  }[u] || "bg-gray-700 text-gray-300";
  return <Badge className={`${c} px-2 py-1 rounded-full text-xs font-medium border border-gray-600`}>{u}</Badge>;
};

export const AISynthesisGenerator: React.FC<{ d: RegActRecDetail }> = ({ d }) => {
  const [s, setS] = useState<string | null>(null);
  const [l, setL] = useState(false);
  const [e, setE] = useState<string | null>(null);

  const genS = useCallback(async () => {
    setL(true); setE(null); setS(null);
    try {
      const r = await cogniMindSvc.generateRecSynthesis(d);
      if (r.sftyAttr?.blk) throw new Error(r.genTxt);
      setS(r.genTxt);
      await auditLedgerSvc.record({
        usrId: "sys_user", evtTyp: AuditLogEventType.AISynthesisGenerated, entTyp: "RegActRec", entId: d.uid,
        dets: { mdl: COGNIMIND_MDL_TXT, tkn: r.usgMeta?.tTkn },
      });
      await notifexSvc.dispatch("sys_user", `AI synthesis for record ${d.uid} complete.`, "succ");
    } catch (err: any) {
      setE(err.message || "Synthesis failed.");
      await notifexSvc.dispatch("sys_user", `AI synthesis for record ${d.uid} failed: ${err.message}`, "err");
    } finally {
      setL(false);
    }
  }, [d]);

  useEffect(() => {
    if (d.urg === RecUrgency.Critical && GLOBAL_FEATURE_CONFIG.cogniMindSynthSummaries) {
      genS();
    }
  }, [d, genS]);

  return (
    <FeatureModule
      t="CogniMind Executive Synthesis" i={SparklesIcon} ld={l} e={e}
      acts={
        <Button size="sm" onClick={genS} disabled={l} icon={<SparklesIcon className="h-4 w-4" />}>
          {s ? "Re-Synthesize" : "Synthesize"}
        </Button>
      }
    >
      {s ? (
        <div className="bg-gray-900 p-3 rounded border border-gray-700 whitespace-pre-wrap text-gray-200 text-sm">
          {s}
        </div>
      ) : (
        <p className="text-gray-500">Invoke cognitive core to generate a synthesized executive brief.</p>
      )}
    </FeatureModule>
  );
};

export const RiskProjectionModule: React.FC<{ d: RegActRecDetail }> = ({ d }) => {
  const [res, setRes] = useState<RiskProjectionOutcome | null>(null);
  const [l, setL] = useState(false);
  const [e, setE] = useState<string | null>(null);
  const [p, setP] = useState<Record<string, any>>({
    focus: "fin_penalty", tol: "medium", ext: "",
  });

  const runSim = useCallback(async () => {
    setL(true); setE(null); setRes(null);
    try {
      const r = await cogniMindSvc.projectRisk(d, p);
      if (r.confScr < 0.6) throw new Error("Cognitive core confidence in projection is below threshold.");
      setRes(r);
      await auditLedgerSvc.record({
        usrId: "sys_user", evtTyp: AuditLogEventType.RiskProjectionExecuted, entTyp: "RegActRec", entId: d.uid,
        dets: { p, resScn: r.scn },
      });
      await notifexSvc.dispatch("sys_user", `Risk projection for record ${d.uid} is complete.`, "info");
    } catch (err: any) {
      setE(err.message || "Risk projection failed.");
      await notifexSvc.dispatch("sys_user", `Risk projection for ${d.uid} failed: ${err.message}`, "err");
    } finally {
      setL(false);
    }
  }, [d, p]);

  if (!GLOBAL_FEATURE_CONFIG.cogniMindRiskProjections) return null;

  return (
    <FeatureModule
      t="CogniMind Risk Projection" i={CalculatorIcon} ld={l} e={e}
      acts={
        <Button size="sm" onClick={runSim} disabled={l} icon={<CpuChipIcon className="h-4 w-4" />}>
          Run Projection
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="pFocus" className="block text-sm font-medium text-gray-400">Projection Focus</label>
          <Select id="pFocus" value={p.focus} onChange={(e) => setP({ ...p, focus: e.target.value })} className="mt-1 block w-full bg-gray-700 border-gray-600 text-white"
            options={[
              { value: "fin_penalty", label: "Financial Penalty" },
              { value: "rep_dmg", label: "Reputational Damage" },
              { value: "op_disrupt", label: "Operational Disruption" },
            ]}
          />
        </div>
        <div>
          <label htmlFor="pTol" className="block text-sm font-medium text-gray-400">Risk Tolerance Profile</label>
          <Select id="pTol" value={p.tol} onChange={(e) => setP({ ...p, tol: e.target.value })} className="mt-1 block w-full bg-gray-700 border-gray-600 text-white"
            options={[{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }]}
          />
        </div>
      </div>
      {res && (
        <div className="bg-indigo-900 bg-opacity-30 p-4 rounded-md border border-indigo-700">
          <h4 className="font-semibold text-indigo-300 mb-2">Projection Outcome: {res.scn}</h4>
          <p className="text-sm mb-1 text-indigo-400">
            <strong>Probability:</strong> {(res.prob * 100).toFixed(0)}%
            <span className="ml-4"><strong>Impact:</strong> <RecUrgencyBadge u={res.imp.toUpperCase() as RecUrgency} /></span>
          </p>
          <p className="text-sm mb-2 text-indigo-400">
            <strong>Est. Financial Impact:</strong> {res.finImp.cur} {res.finImp.min.toLocaleString()} - {res.finImp.max.toLocaleString()}
          </p>
          <div className="mt-2">
            <h5 className="text-sm font-medium text-indigo-300">Mitigation Proposals:</h5>
            <ul className="list-disc list-inside text-sm text-indigo-400">{res.mitg.map((s, i) => (<li key={i}>{s}</li>))}</ul>
          </div>
        </div>
      )}
    </FeatureModule>
  );
};
export const ActionProposalEngine: React.FC<{ d: RegActRecDetail }> = ({ d }) => {
  const [recs, setRecs] = useState<ProposedAction[]>([]);
  const [l, setL] = useState(false);
  const [e, setE] = useState<string | null>(null);

  const getRecs = useCallback(async () => {
    setL(true); setE(null); setRecs([]);
    try {
      const rs = await cogniMindSvc.proposeActions(d);
      setRecs(rs);
      await auditLedgerSvc.record({
        usrId: "sys_user", evtTyp: AuditLogEventType.ActionProposed, entTyp: "RegActRec", entId: d.uid,
        dets: { count: rs.length },
      });
      await notifexSvc.dispatch("sys_user", `AI proposed ${rs.length} actions for record ${d.uid}`, "info");
    } catch (err: any) {
      setE(err.message || "Failed to get proposals.");
    } finally {
      setL(false);
    }
  }, [d]);

  const applyRec = async (act: ProposedAction) => {
    await workflowOrchestratorSvc.executeAutomatedAction(act.actId, d.uid, "sys_user");
    setRecs((prev) => prev.filter((r) => r.actId !== act.actId));
  };

  if (!GLOBAL_FEATURE_CONFIG.cogniMindActionProposals) return null;

  return (
    <FeatureModule
      t="CogniMind Action Proposal Engine" i={WrenchScrewdriverIcon} ld={l} e={e}
      acts={
        <Button size="sm" onClick={getRecs} disabled={l} icon={<ClipboardDocumentCheckIcon className="h-4 w-4" />}>
          Get Proposals
        </Button>
      }
    >
      {recs.length > 0 ? (
        <div className="space-y-3">
          {recs.map((a) => (
            <div key={a.actId} className="bg-gray-900 p-3 rounded-md border border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-gray-200">{a.desc}</p>
                <RecUrgencyBadge u={a.urg} />
              </div>
              <p className="text-sm text-gray-400 mb-2"><span className="font-semibold">Rationale:</span> {a.rat}</p>
              {a.isAutoTrg && (
                <div className="mt-2 text-right">
                  <Button size="sm" variant="secondary" onClick={() => applyRec(a)} disabled={l}>Execute Action</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Invoke cognitive core to propose next actions.</p>
      )}
    </FeatureModule>
  );
};
export const PolicyOracleModule: React.FC<{ d: RegActRecDetail }> = ({ d }) => {
  const [pId, setPId] = useState<string>("");
  const [pCont, setPCont] = useState<string | null>(null);
  const [res, setRes] = useState<string | null>(null);
  const [l, setL] = useState(false);
  const [e, setE] = useState<string | null>(null);
  const avPols = d.pols;

  const handlePolChg = useCallback(async (ev: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = ev.target.value;
    setPId(sId); setPCont(null); setRes(null); setE(null);
    if (sId) {
      setL(true);
      try {
        const pol = await fetchMockRegPolicy(sId);
        setPCont(pol ? pol.cont : null);
        if (!pol) setE("Policy content not found.");
      } catch (err: any) { setE(err.message || "Failed to load policy."); }
      finally { setL(false); }
    }
  }, []);

  const runAnalysis = useCallback(async () => {
    if (!pId || !pCont) { setE("Policy must be selected."); return; }
    setL(true); setE(null); setRes(null);
    try {
      const r = await cogniMindSvc.analyzePolicy(d, pCont);
      if (r.sftyAttr?.blk) throw new Error(r.genTxt);
      setRes(r.genTxt);
      await auditLedgerSvc.record({
        usrId: "sys_user", evtTyp: AuditLogEventType.PolicyConsulted, entTyp: "RegActRec", entId: d.uid,
        dets: { pId, mdl: COGNIMIND_MDL_TXT },
      });
    } catch (err: any) { setE(err.message || "Analysis failed."); }
    finally { setL(false); }
  }, [d, pId, pCont]);

  useEffect(() => {
    if (avPols.length > 0 && !pId) {
      setPId(avPols[0].id);
      handlePolChg({ target: { value: avPols[0].id } } as any);
    }
  }, [avPols, pId, handlePolChg]);

  if (!GLOBAL_FEATURE_CONFIG.cogniMindPolicyOracle) return null;

  return (
    <FeatureModule
      t="CogniMind Policy Oracle" i={BookOpenIcon} ld={l} e={e}
      acts={
        <Button size="sm" onClick={runAnalysis} disabled={l || !pCont} icon={<MagnifyingGlassIcon className="h-4 w-4" />}>
          Analyze
        </Button>
      }
    >
      <div className="mb-4">
        <label htmlFor="polSel" className="block text-sm font-medium text-gray-400 mb-1">Select Policy:</label>
        <Select id="polSel" value={pId} onChange={handlePolChg} className="w-full bg-gray-700 border-gray-600 text-white"
          options={[{ value: "", label: "--- Select ---" }, ...avPols.map((p) => ({ value: p.id, label: `${p.t} (v${p.v})` }))]}
        />
      </div>
      {res && (
        <div className="mt-4 bg-purple-900 bg-opacity-30 p-3 rounded-md border border-purple-700 whitespace-pre-wrap text-sm text-purple-300">
          <h4 className="font-semibold text-purple-200 mb-2">Oracle Analysis:</h4>{res}
        </div>
      )}
    </FeatureModule>
  );
};

export const DocuForgeModule: React.FC<{ d: RegActRecDetail }> = ({ d }) => {
  const [docTyp, setDocTyp] = useState<string>("internal_memo");
  const [addCtx, setAddCtx] = useState<string>("");
  const [dCont, setDCont] = useState<string | null>(null);
  const [l, setL] = useState(false);
  const [e, setE] = useState<string | null>(null);
  const genDraft = useCallback(async () => {
    if (!docTyp) { setE("Select a document type."); return; }
    setL(true); setE(null); setDCont(null);
    try {
      const r = await cogniMindSvc.forgeDocument(d, docTyp, addCtx);
      if (r.sftyAttr?.blk) throw new Error(r.genTxt);
      setDCont(r.genTxt);
      await auditLedgerSvc.record({
        usrId: "sys_user", evtTyp: AuditLogEventType.DocumentForged, entTyp: "RegActRec", entId: d.uid,
        dets: { docTyp, mdl: COGNIMIND_MDL_TXT },
      });
    } catch (err: any) { setE(err.message || "Failed to forge document."); }
    finally { setL(false); }
  }, [d, docTyp, addCtx]);
  if (!GLOBAL_FEATURE_CONFIG.cogniMindDocuForge) return null;

  return (
    <FeatureModule t="CogniMind DocuForge" i={DocumentTextIcon} ld={l} e={e}
      acts={
        <Button size="sm" onClick={genDraft} disabled={l || !docTyp} icon={<ShareIcon className="h-4 w-4" />}>
          Forge Draft
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="docTyp" className="block text-sm font-medium text-gray-400">Document Type</label>
          <Select id="docTyp" value={docTyp} onChange={(e) => setDocTyp(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 text-white"
            options={[{ value: "internal_memo", label: "Internal Memo" }, { value: "SAR_draft", label: "SAR Draft" }]}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="addCtx" className="block text-sm font-medium text-gray-400">Additional Context</label>
          <TextArea id="addCtx" value={addCtx} onChange={(e) => setAddCtx(e.target.value)} rows={3} className="mt-1 block w-full bg-gray-700 border-gray-600 text-white" />
        </div>
      </div>
      {dCont && (
        <div className="mt-4 bg-orange-900 bg-opacity-30 p-3 rounded-md border border-orange-700 text-orange-300">
          <h4 className="font-semibold text-orange-200 mb-2">Forged Draft:</h4>
          <TextArea value={dCont} rows={10} readOnly className="w-full bg-gray-900 border-gray-700 text-gray-300" />
        </div>
      )}
    </FeatureModule>
  );
};

export const InteractiveRecordOverlay: React.FC = () => {
  const { isRecOverlayOpen, closeRecOverlay, actRecData, setSelRecId } = useHolisticOps();

  useEffect(() => {
    if (actRecData) {
      auditLedgerSvc.record({
        usrId: "sys_user", evtTyp: AuditLogEventType.RecordViewed, entTyp: "RegActRec", entId: actRecData.uid,
        dets: { sbj: actRecData.sbj },
      });
    }
  }, [actRecData]);

  const hndlClose = useCallback(() => {
    closeRecOverlay();
    setSelRecId(null);
  }, [closeRecOverlay, setSelRecId]);

  if (!actRecData) return null;

  return (
    <Modal isOpen={isRecOverlayOpen} onClose={hndlClose} size="2xl">
      <ModalHeader className="bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-200 flex-grow">
            RegAction Record: {actRecData.sbj} ({actRecData.uid})
          </h2>
          <RecStateBadge s={actRecData.st} />
          <RecUrgencyBadge u={actRecData.urg} />
        </div>
      </ModalHeader>
      <ModalBody className="p-0 bg-gray-800 text-gray-300 max-h-[85vh] overflow-y-auto">
        <Tabs defaultValue="overview" className="h-full flex flex-col">
          <TabList className="flex-shrink-0 bg-gray-900 p-2">
            <Tab value="overview"><TableCellsIcon className="h-5 w-5 mr-2" />Overview</Tab>
            <Tab value="aiSynth"><SparklesIcon className="h-5 w-5 mr-2" />AI Synthesis</Tab>
            <Tab value="aiRisk"><CalculatorIcon className="h-5 w-5 mr-2" />AI Risk</Tab>
            <Tab value="aiActions"><WrenchScrewdriverIcon className="h-5 w-5 mr-2" />AI Actions</Tab>
            <Tab value="aiPolicy"><BookOpenIcon className="h-5 w-5 mr-2" />AI Policy</Tab>
            <Tab value="aiForge"><DocumentTextIcon className="h-5 w-5 mr-2" />AI Forge</Tab>
            <Tab value="settings"><Cog6ToothIcon className="h-5 w-5 mr-2" />Settings</Tab>
          </TabList>
          <TabPanels className="mt-0 p-6 flex-grow overflow-y-auto">
            <TabPanel value="overview">
              <h3 className="font-semibold text-lg mb-3 text-gray-200">Record Details</h3>
              <p><strong>Metadata:</strong> <pre className="bg-gray-900 p-2 rounded text-xs">{JSON.stringify(actRecData.meta, null, 2)}</pre></p>
            </TabPanel>
            <TabPanel value="aiSynth"><AISynthesisGenerator d={actRecData} /></TabPanel>
            <TabPanel value="aiRisk"><RiskProjectionModule d={actRecData} /></TabPanel>
            <TabPanel value="aiActions"><ActionProposalEngine d={actRecData} /></TabPanel>
            <TabPanel value="aiPolicy"><PolicyOracleModule d={actRecData} /></TabPanel>
            <TabPanel value="aiForge"><DocuForgeModule d={actRecData} /></TabPanel>
            <TabPanel value="settings"><h3 className="font-semibold text-lg text-gray-200">Settings Placeholder</h3></TabPanel>
          </TabPanels>
        </Tabs>
      </ModalBody>
      <ModalFooter className="bg-gray-800 border-t border-gray-700">
        <Button variant="secondary" onClick={hndlClose}>Dismiss</Button>
        <Button onClick={() => console.log("Persist State")}>Persist State</Button>
      </ModalFooter>
    </Modal>
  );
};

export const HolisticOpsContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isRecOverlayOpen, setIsRecOverlayOpen] = useState(false);
  const [selRecId, setSelRecId] = useState<string | null>(null);
  const [actRecData, setActRecData] = useState<RegActRecDetail | null>(null);
  const [mockRecs, setMockRecs] = useState<RegActRecDetail[]>([]);

  useEffect(() => {
    const initRecs = Array.from({ length: 50 }).map((_, i) => fabricateMockRegActRec(`REC-${String(i + 1).padStart(4, '0')}`));
    setMockRecs(initRecs);
  }, []);

  useEffect(() => {
    if (selRecId) {
      const fRec = mockRecs.find(c => c.uid === selRecId);
      if (fRec) {
        setActRecData(fRec);
        setIsRecOverlayOpen(true);
      } else {
        setSelRecId(null);
      }
    } else {
      setActRecData(null);
    }
  }, [selRecId, mockRecs]);

  const launchRecOverlay = useCallback((recId: string) => { setSelRecId(recId); }, []);
  const closeRecOverlay = useCallback(() => { setIsRecOverlayOpen(false); setSelRecId(null); }, []);

  const ctxVal = useMemo(() => ({
    selRecId, setSelRecId, launchRecOverlay, closeRecOverlay, isRecOverlayOpen, actRecData,
  }), [selRecId, launchRecOverlay, closeRecOverlay, isRecOverlayOpen, actRecData]);

  return (
    <HolisticOpsCtx.Provider value={ctxVal}>
      {children}
      <InteractiveRecordOverlay />
    </HolisticOpsCtx.Provider>
  );
};

export default function RegulatoryActionsOpsHubPortal() {
  const nav = useHistory();
  const { launchRecOverlay } = useHolisticOps();
  const { data, loading } = useComplianceCasesWidgetQuery();

  const myValCt = data?.pendingMyApproval.totalCount || 0;
  const otrValCt = data?.pendingOthersApproval.totalCount || 0;
  const totCt = data?.totalCount.totalCount || 0;

  const mockMyValCt = 11;
  const mockOtrValCt = 23;
  const mockTotCt = 87;

  const effMyVal = Math.max(myValCt, mockMyValCt);
  const effOtrVal = Math.max(otrValCt, mockOtrValCt);
  const effTot = Math.max(totCt, mockTotCt);

  const launchGlobalQuery = useCallback(() => {
    alert("Launching Global CogniMind Expert Query System.");
  }, []);

  const initGlobalScan = useCallback(() => {
    alert("Initiating Global AI-Powered Regulatory Posture Scan.");
    notifexSvc.dispatch("sys_user", "Global AI RegScan Initiated.", "info");
    auditLedgerSvc.record({
      usrId: "sys_user", evtTyp: AuditLogEventType.GlobalAIScanInitiated, entTyp: "Sys", entId: "Global",
      dets: { trigger: "Manual" },
    });
  }, []);

  return (
    <HolisticOpsContextProvider>
      <Card>
        <CardHeader>
          <CardHeading>
            <CardTitle>Open Regulatory Action Records ({effTot})</CardTitle>
          </CardHeading>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingPlasm />
          ) : (
            <>
              <CardButtonContainer>
                <CardButton count={effMyVal} text="Awaiting My Validation" onClick={() => nav.push("/reg/records?q=myval")} icon="user" />
                <CardButton count={effOtrVal} text="Awaiting Other Validation" onClick={() => nav.push("/reg/records?q=otherval")} icon="user_outlined" />
                <CardButton count={Math.floor(effTot * 0.1)} text="Escalated Records" onClick={() => nav.push("/reg/records?q=esc")} icon="flag" variant="danger" />
                <CardButton count={Math.floor(effTot * 0.25)} text="Under Review" onClick={() => nav.push("/reg/records?q=review")} icon="magnifying_glass" variant="info" />
                <CardButton count={1} text="Critical REC-0001" onClick={() => launchRecOverlay("REC-0001")} icon="bell" variant="critical" />
                <CardButton count={3} text="High Urgency Alerts" onClick={() => launchRecOverlay("REC-0002")} icon="exclamation" variant="warning" />
              </CardButtonContainer>
              <div className="mt-8">
                <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Cog6ToothIcon className="h-5 w-5 text-gray-600" />
                  CogniMind Global Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button variant="primary" onClick={launchGlobalQuery} icon={<ChatBubbleBottomCenterTextIcon className="h-5 w-5" />}>Global Expert Query</Button>
                  <Button variant="secondary" onClick={initGlobalScan} icon={<CpuChipIcon className="h-5 w-5" />}>Trigger Global AI Scan</Button>
                  <Button variant="tertiary" onClick={() => nav.push("/dashboard/risk-matrix")} icon={<CalculatorIcon className="h-5 w-5" />}>View Risk Matrix</Button>
                  <Button variant="primary" onClick={() => alert("Generating AI report...")} icon={<DocumentTextIcon className="h-5 w-5" />}>Generate AI Report</Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </HolisticOpsContextProvider>
  );
}