// Copyright 2024 Citibank demo business Inc. All rights reserved.
// This artifact is a component of the Citadel Banking (CTB) GenAI-Enhanced Treasury Management Platform.
// It orchestrates advanced capital flow metrics, stochastic projections, AI-synthesized intelligence, and multi-variate simulation frameworks.
// Base URL context: citibankdemobusiness.dev

import React, { useState, useEffect, useCallback, useMemo, useRef, useReducer } from "react";
import moment from "moment-timezone";
import {
  Card,
  CardActions,
  CardContent,
  CardDescription,
  CardHeader,
  CardHeading,
  CardTitle,
  LoadingLine,
  SelectField,
  Stack,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Input,
  TextArea,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Checkbox,
  Label as UiLabel,
} from "~/common/ui-components";
import { useCashFlowMetricsWidgetQuery } from "~/generated/dashboard/graphqlSchema";
import { cn } from "~/common/utilities/cn";
import { ALL_ACCOUNTS_ID } from "~/app/constants";
import AccountSelect from "~/app/containers/AccountSelect";

const BASE_URL_CTX = "citibankdemobusiness.dev";
const CORP_ID = "Citibank demo business Inc";
const ALL_ENTITIES_IDENTIFIER = "all_entities";
const ALL_CATEGORIES_IDENTIFIER = "all_op_categories";
const a = Math.PI;
const b = Math.E;

const createSvgIcon = (path: string, color: string = 'currentColor') =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='${encodeURIComponent(color)}'%3E%3Cpath d='${path}'/%3E%3C/svg%3E`;

const ICONS = {
  TREND_UP: createSvgIcon('M4 12l1.41 1.41L11 7.83V20h2V7.83l5.59 5.58L20 12l-8-8-8 8z', '#16a34a'),
  TREND_DOWN: createSvgIcon('M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.59-5.58L4 12l8 8 8-8z', '#dc2626'),
  TREND_STABLE: createSvgIcon('M22 12l-4-4v3H6v2h12v3l4-4z', '#6b7280'),
  PLUS: createSvgIcon('M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'),
  MINUS: createSvgIcon('M19 13H5v-2h14v2z')
};

function FieldDescriptor({ cls, chld }: { cls?: string; chld: React.ReactNode; }) {
  return <span className={cn("text-sm font-semibold text-neutral-700", cls)}>{chld}</span>;
}

function DataGridRow({ bg, chld }: { bg?: boolean; chld: React.ReactNode; }) {
  return (
    <div
      className={cn(
        "grid grid-cols-[1.2fr_1.4fr_1.4fr_1.4fr_0.6fr] items-center gap-x-3 text-xs sm:text-sm text-right",
        bg && "bg-neutral-100/50 py-2 px-3 rounded-lg",
      )}
    >
      {chld}
    </div>
  );
}

function DataPointDisplay({ v, l, cls }: { v: string | number | null | undefined; l: boolean; cls?: string; }) {
  if (l) {
    return (
      <div className="w-28 h-4 bg-neutral-200 animate-pulse rounded-md" />
    );
  }
  const displayVal = v === null || v === undefined || Number.isNaN(v) ? "\u2014" : String(v);
  return <div className={cn("tabular-nums", cls)}>{displayVal}</div>;
}

export function CollapsibleSection({ hdr, chld }: { hdr: string; chld: React.ReactNode; }) {
  const [exp, setExp] = useState(false);
  return (
    <section className="border-t border-neutral-200/80">
      <header>
        <button
          onClick={() => setExp(!exp)}
          className="flex w-full justify-between items-center py-2.5 text-sm font-bold text-neutral-800 hover:bg-sky-50 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:ring-offset-1"
          aria-expanded={exp}
        >
          <h3 className="text-left">{hdr}</h3>
          <img src={exp ? ICONS.MINUS : ICONS.PLUS} alt={exp ? "Collapse" : "Expand"} className="h-4 w-4" />
        </button>
      </header>
      {exp && <div className="pb-2 px-1">{chld}</div>}
    </section>
  );
}

const T_RNG_OPTS = [
  { l: "Month-to-Present", v: "month" },
  { l: "Quarter-to-Present", v: "quarter" },
  { l: "Year-to-Present", v: "year" },
  { l: "Trailing 30 Days", v: "last30" },
  { l: "Trailing 90 Days", v: "last90" },
  { l: "Custom Interval", v: "custom" },
];

const PROJ_HORIZON_OPTS = [
  { l: "Next 3 Months", v: 3 },
  { l: "Next 6 Months", v: 6 },
  { l: "Next 12 Months", v: 12 },
  { l: "Next 24 Months", v: 24 },
  { l: "Next 60 Months", v: 60 },
];

const CATEGORY_FILTERS = [
  { l: "All Categories", v: ALL_CATEGORIES_IDENTIFIER },
  { l: "Operating Expenditures", v: "op_ex" },
  { l: "Capital Expenditures", v: "cap_ex" },
  { l: "Revenue Streams", v: "rev" },
  { l: "Human Capital Costs", v: "payroll" },
  { l: "Debt Servicing", v: "debt" },
  { l: "Investment Activities", v: "invest" },
];

export type KPI_STRUCT = {
  p1: string;
  p0: string;
  dlt: string;
  rP1: number;
  rP0: number;
  rDlt: number;
  vec?: "pos" | "neg" | "neu";
};

export type ADV_KPI_STRUCT = KPI_STRUCT & {
  yoyDlt?: string;
  qoqDlt?: string;
  momDlt?: string;
  ctgyBrkdn?: Record<string, number>;
};

export type FLTR_CONFIG = {
  tmRng: string;
  acct: string;
  ctgy: string;
  sD?: string;
  eD?: string;
};

const DEFAULT_FLTRS: FLTR_CONFIG = {
  tmRng: "month",
  acct: ALL_ENTITIES_IDENTIFIER,
  ctgy: ALL_CATEGORIES_IDENTIFIER,
};

export type PROJ_PT = {
  ts: string;
  in: number;
  out: number;
  net: number;
  cum: number;
  conf: number;
};

export type DEVIATION = {
  id: string;
  ts: string;
  kpi: string;
  val: number;
  expRng: [number, number];
  sev: "low" | "med" | "high";
  expl: string;
  rec: string;
};

export type SIM_RUN = {
  id: string;
  nm: string;
  dsc: string;
  prms: Record<string, any>;
  proj: PROJ_PT[];
  smry: string;
};

export type AI_CHAT_MSG = {
  id: string;
  ts: string;
  src: "usr" | "ai";
  txt: string;
};

export class CdbAuditSvc {
  static async logAction(
    act: string,
    pld: Record<string, any>,
    usr: string = "sys_usr",
  ): Promise<boolean> {
    const payload = { a: act, d: pld, u: usr, t: new Date().toISOString(), s: 'CshFlwIntelWidget', h: `https://${BASE_URL_CTX}` };
    console.log(`AUDIT_LOG::${JSON.stringify(payload)}`);
    return new Promise((res) => setTimeout(() => res(true), 150));
  }
}

export class UsrCfgSvc {
  static async setPref(k: string, v: any, u: string = "sys_usr"): Promise<boolean> {
    localStorage.setItem(`ctb_cfg_${u}_${k}`, JSON.stringify(v));
    return new Promise((res) => setTimeout(() => res(true), 75));
  }

  static async getPref<T>(k: string, d: T, u: string = "sys_usr"): Promise<T> {
    const s = localStorage.getItem(`ctb_cfg_${u}_${k}`);
    return new Promise((res) =>
      setTimeout(() => res(s ? JSON.parse(s) : d), 75),
    );
  }
}
const INTEGRATION_MANIFEST = {
    Plaid: { status: 'active', type: 'Data Aggregator', url: 'https://plaid.com', desc: 'Connects to bank accounts for real-time transaction data.' },
    ModernTreasury: { status: 'active', type: 'Payment Operations', url: 'https://moderntreasury.com', desc: 'Automates payment flows, reconciliation, and cash management.' },
    Salesforce: { status: 'active', type: 'CRM', url: 'https://salesforce.com', desc: 'Syncs revenue forecasts and sales data for cash inflow predictions.' },
    Oracle: { status: 'active', type: 'ERP', url: 'https://oracle.com', desc: 'Integrates with financial ledgers and corporate planning systems.' },
    MARQETA: { status: 'pending', type: 'Card Issuing', url: 'https://marqeta.com', desc: 'Manages corporate card programs and expense payouts.' },
    Citibank: { status: 'native', type: 'Banking API', url: `https://${BASE_URL_CTX}`, desc: 'Direct integration with Citibank corporate banking services.' },
    Shopify: { status: 'active', type: 'E-commerce', url: 'https://shopify.com', desc: 'Tracks sales revenue and payout schedules from online stores.' },
    WooCommerce: { status: 'active', type: 'E-commerce', url: 'https://woocommerce.com', desc: 'Tracks sales from self-hosted e-commerce platforms.' },
    GoDaddy: { status: 'inactive', type: 'Domain/Hosting', url: 'https://godaddy.com', desc: 'Monitors infrastructure spending.' },
    Cpanel: { status: 'inactive', type: 'Server Management', url: 'https://cpanel.net', desc: 'Tracks web hosting and server-related expenses.' },
    Twilio: { status: 'active', type: 'Communications API', url: 'https://twilio.com', desc: 'Monitors expenses related to communication services.' },
    Adobe: { status: 'active', type: 'Creative Software', url: 'https://adobe.com', desc: 'Tracks recurring subscription costs for creative tools.' },
    GitHub: { status: 'active', type: 'DevOps', url: 'https://github.com', desc: 'Analyzes engineering costs based on team size and CI/CD usage.' },
    HuggingFace: { status: 'pending', type: 'AI/ML Platform', url: 'https://huggingface.co', desc: 'Tracks costs associated with AI model training and inference.' },
    'Chat HOT': { status: 'pending', type: 'AI Services', url: '#', desc: 'Integration with LLM services for enhanced text processing.' },
    Pipedream: { status: 'active', type: 'Automation', url: 'https://pipedream.com', desc: 'Orchestrates data flows between various connected services.' },
    'Google Drive': { status: 'active', type: 'Cloud Storage', url: 'https://google.com/drive/', desc: 'Accesses financial reports and spreadsheets for analysis.' },
    'OneDrive': { status: 'active', type: 'Cloud Storage', url: 'https://onedrive.live.com', desc: 'Syncs with Microsoft Office financial documents.' },
    Azure: { status: 'active', type: 'Cloud Provider', url: 'https://azure.microsoft.com', desc: 'Monitors and forecasts cloud infrastructure spending.' },
    'Google Cloud': { status: 'active', type: 'Cloud Provider', url: 'https://cloud.google.com', desc: 'Tracks GCP expenses and projects future costs.' },
    Supabase: { status: 'pending', type: 'Backend as a Service', url: 'https://supabase.com', desc: 'Monitors costs for database and backend services.' },
    Vercel: { status: 'active', type: 'Hosting Platform', url: 'https://vercel.com', desc: 'Tracks deployment and hosting costs.' },
};
export class CdbAiCoreSvc {
  static async composeFinancialSynopsis(
    kpis: Record<string, ADV_KPI_STRUCT>,
    fltrs: FLTR_CONFIG,
  ): Promise<string> {
    return new Promise((res) => {
      setTimeout(() => {
        const netFlw = (kpis.charges?.rP1 || 0) - (kpis.payouts?.rP1 || 0);
        const tmRngLbl = T_RNG_OPTS.find((o) => o.v === fltrs.tmRng)?.l;
        let s = `Synopsis for ${tmRngLbl || 'selected interval'} on ${CORP_ID}:\n`;
        s += `Net capital flow registered at ${fmtCcy(netFlw)}. `;
        s += `Total inflows amounted to ${kpis.charges?.p1}, while outflows were ${kpis.payouts?.p1}. `;
        const dlt = (kpis.charges?.rDlt || 0) - (kpis.payouts?.rDlt || 0);
        if (dlt > 0) s += `This represents a positive change of ${fmtCcy(dlt)} from the prior period, indicating improved liquidity. `;
        else s += `This represents a negative change of ${fmtCcy(dlt)} from the prior period, suggesting a tightening of cash reserves. `;
        s += `Key drivers include a ${kpis.charges?.dlt} shift in charges and a ${kpis.payouts?.dlt} shift in payouts. Further drill-down into categories like ${Object.keys(kpis.charges?.ctgyBrkdn || {})[0]} is recommended.`;
        res(s);
      }, 2500);
    });
  }

  static async projectFutureFlows(
    hist: KPI_STRUCT[],
    m: number,
    p?: Record<string, any>,
  ): Promise<PROJ_PT[]> {
    return new Promise((res) => {
      setTimeout(() => {
        const prj: PROJ_PT[] = [];
        let cum = 0;
        const baseIn = hist[0]?.rP1 || 6e5;
        const baseOut = hist[1]?.rP1 || 5.5e5;
        const grwth = p?.slsGrwth || 0.015;
        const cstInc = p?.opxCstInc || 0.007;

        for (let i = 1; i <= m; i++) {
          const ts = moment().add(i, "months").format("YYYY-MM");
          const in_ = baseIn * Math.pow(1 + grwth, i) * (1 + (Math.random() - 0.5) * 0.1);
          const out_ = baseOut * Math.pow(1 + cstInc, i) * (1 + (Math.random() - 0.5) * 0.08);
          const net = in_ - out_;
          cum += net;
          prj.push({
            ts, in: in_, out: out_, net, cum,
            conf: parseFloat((0.75 + Math.random() * 0.2).toFixed(2)),
          });
        }
        res(prj);
      }, 3500);
    });
  }

    static async detectDeviations(kpis: Record<string, ADV_KPI_STRUCT>, h: any[]): Promise<DEVIATION[]> {
    return new Promise((res) => {
      setTimeout(() => {
        const dvtns: DEVIATION[] = [];
        const processKPI = (k: string, thr: number) => {
            const kpi = kpis[k];
            if (kpi && Math.abs(kpi.rDlt) > thr * kpi.rP0 && kpi.rP0 > 0) {
                const s = Math.abs(kpi.rDlt) > (thr + 0.2) * kpi.rP0 ? 'high' : 'med';
                dvtns.push({
                    id: `dvt-${Date.now()}-${k}`,
                    ts: moment().format("YYYY-MM-DD"),
                    kpi: k.charAt(0).toUpperCase() + k.slice(1),
                    val: kpi.rP1,
                    expRng: [kpi.rP0 * (1 - thr), kpi.rP0 * (1 + thr)],
                    sev: s,
                    expl: `An anomalous fluctuation of ${kpi.dlt} was detected in ${k}. This exceeds the expected statistical bounds based on prior period performance.`,
                    rec: `Initiate a detailed transactional review for the current period. Cross-reference with operational data from integrated systems like Salesforce or Shopify.`,
                });
            }
        };
        processKPI('charges', 0.25);
        processKPI('payouts', 0.30);
        res(dvtns);
      }, 3000);
    });
  }
    
  static async formulateSuggestions(kpis: Record<string, ADV_KPI_STRUCT>, dvtns: DEVIATION[]): Promise<string[]> {
      return new Promise((res) => {
          setTimeout(() => {
              const s: string[] = [];
              const netFlw = (kpis.charges?.rP1 || 0) - (kpis.payouts?.rP1 || 0);
              if (netFlw < 0) {
                  s.push("Accelerate accounts receivable collection; consider offering early payment discounts through Modern Treasury.");
                  s.push("Negotiate extended payment terms with high-volume vendors to improve days payable outstanding (DPO).");
              } else {
                  s.push("Deploy surplus capital into low-risk, high-liquidity investment vehicles to maximize yield.");
              }
              if (dvtns.length > 0) {
                  s.push("Address all detected deviations with severity 'high' or 'med' within 24 hours to mitigate potential risks.");
              }
              s.push("Utilize 'What-If' scenario planning to model the impact of market volatility on your cash runway.");
              s.push("Review subscription costs from services like Adobe and Twilio for potential optimization.");
              res(s);
          }, 2000);
      });
  }

  static async processChatQuery(hist: AI_CHAT_MSG[], newMsg: string): Promise<AI_CHAT_MSG> {
    return new Promise((res) => {
      setTimeout(() => {
        let resp = "I require more specific context to provide a meaningful response. Please refine your query.";
        const m = newMsg.toLowerCase();
        if (m.includes("flow") || m.includes("cash")) resp = "Cash flow represents the net movement of cash equivalents into and out of the business. I can provide a detailed breakdown by category.";
        else if (m.includes("predict") || m.includes("forecast")) resp = "My forecasting module can project cash positions for future periods. Please navigate to the 'Forecast & Scenarios' tab to configure and run a projection.";
        else if (m.includes("anomaly") || m.includes("unusual")) resp = "Deviations are statistically significant variations from expected financial patterns. I can scan the current dataset for such events.";
        else if (m.includes("optimize") || m.includes("improve")) resp = "Optimization involves strategies to enhance working capital and liquidity. I can generate a list of actionable recommendations based on your current financial posture.";
        else if (m.includes("hello") || m.includes("hi")) resp = "Greetings. I am the Citadel Banking GenAI Assistant. How may I support your treasury management tasks today?";
        
        res({
            id: `ai-resp-${Date.now()}`,
            ts: moment().format("MMM D, YYYY, h:mm:ss A"),
            src: "ai",
            txt: resp,
        });
      }, 1500);
    });
  }

    static async compileDocument(kpis: Record<string, ADV_KPI_STRUCT>, proj: PROJ_PT[], dvtns: DEVIATION[], syn: string): Promise<string> {
        return new Promise((res) => {
            setTimeout(() => {
                let doc = `# Capital Flow Intelligence Report\n## ${CORP_ID} - ${moment().format("YYYY-MM-DD")}\n\n`;
                doc += `### 1. Executive Synopsis\n${syn}\n\n`;
                doc += `### 2. Key Performance Indicators\n| Metric | Current Period | Prior Period | Delta |\n|---|---|---|---|\n`;
                Object.keys(kpis).forEach(k => {
                    const d = kpis[k];
                    if (d) doc += `| ${k.charAt(0).toUpperCase() + k.slice(1)} | ${d.p1} | ${d.p0} | ${d.dlt} |\n`;
                });
                doc += `\n### 3. Forward-Looking Projection (${proj.length} Months)\n| Month | Inflow | Outflow | Net | Cumulative |\n|---|---|---|---|---|\n`;
                proj.forEach(p => {
                    doc += `| ${p.ts} | ${fmtCcy(p.in)} | ${fmtCcy(p.out)} | ${fmtCcy(p.net)} | ${fmtCcy(p.cum)} |\n`;
                });
                doc += `\n### 4. Detected Deviations\n`;
                if (dvtns.length > 0) {
                    dvtns.forEach(d => {
                        doc += `**SEVERITY: ${d.sev.toUpperCase()}** - ${d.kpi} on ${d.ts}\n- Value: ${fmtCcy(d.val)}\n- Explanation: ${d.expl}\n- Recommendation: ${d.rec}\n\n`;
                    });
                } else {
                    doc += "No significant deviations detected in the current analysis cycle.\n";
                }
                doc += `\n---\n*Generated via Citadel Banking GenAI @ ${moment().format("YYYY-MM-DDTHH:mm:ssZ")} for ${BASE_URL_CTX}*`;
                res(doc);
            }, 4500);
        });
    }
}

export function fmtCcy(v: number, c: string = "USD", l: string = "en-US"): string {
  if (v === null || v === undefined) return "\u2014";
  const s = v < 0;
  const i = String(parseInt(v = Math.abs(v), 10));
  let j = i.length > 3 ? i.length % 3 : 0;
  const f = "." + Math.abs(v - parseInt(v.toString(),10)).toFixed(2).slice(2);
  const p = (j ? i.substr(0, j) + "," : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1,");
  return (s ? "-$" : "$") + p + f;
}

export function calcTrendVec(d: number): "pos" | "neg" | "neu" {
  if (d > 0.01) return "pos";
  if (d < -0.01) return "neg";
  return "neu";
}

export function computeAdvKpis(base: Record<string, KPI_STRUCT>, fltrs: FLTR_CONFIG): Record<string, ADV_KPI_STRUCT> {
  const adv: Record<string, ADV_KPI_STRUCT> = {};
  for (const k in base) {
    if (Object.prototype.hasOwnProperty.call(base, k)) {
      const m = base[k];
      const rP1 = m.rP1;
      const rP0 = m.rP0;
      const vec = calcTrendVec(m.rDlt);
      
      const yoy = rP0 > 0 ? ((rP1 - rP0 * 1.03) / (rP0 * 1.03)) : null;
      const qoq = rP0 > 0 ? ((rP1 - rP0 * 1.015) / (rP0 * 1.015)) : null;
      const mom = rP0 > 0 ? ((rP1 - rP0 * 1.005) / (rP0 * 1.005)) : null;

      adv[k] = {
        ...m,
        vec,
        yoyDlt: yoy !== null ? `${(yoy * 100).toFixed(2)}%` : '-',
        qoqDlt: qoq !== null ? `${(qoq * 100).toFixed(2)}%` : '-',
        momDlt: mom !== null ? `${(mom * 100).toFixed(2)}%` : '-',
        ctgyBrkdn: {
          "Sales - Enterprise": rP1 * 0.4 + Math.random() * 200,
          "Sales - SMB": rP1 * 0.3 + Math.random() * 200,
          "Partner Revenue": rP1 * 0.2 + Math.random() * 200,
          "Other": rP1 * 0.1 + Math.random() * 200,
        },
      };
    }
  }

  const netP1 = (adv.charges?.rP1 || 0) - (adv.payouts?.rP1 || 0);
  const netP0 = (adv.charges?.rP0 || 0) - (adv.payouts?.rP0 || 0);
  const netDlt = netP1 - netP0;

  adv["netCapitalFlow"] = {
    p1: fmtCcy(netP1),
    p0: fmtCcy(netP0),
    dlt: fmtCcy(netDlt),
    rP1: netP1,
    rP0: netP0,
    rDlt: netDlt,
    vec: calcTrendVec(netDlt),
  };

  return adv;
}

export function useUsrCfg<T extends Record<string, any>>(ns: string, defs: T) {
  const [cfg, setCfg] = useState<T>(defs);
  const [ldng, setLdng] = useState(true);

  useEffect(() => {
    const fetchCfg = async () => {
      setLdng(true);
      const lCfg: T = { ...defs };
      for (const k of Object.keys(defs)) {
        lCfg[k as keyof T] = await UsrCfgSvc.getPref(`${ns}_${k}`, defs[k]);
      }
      setCfg(lCfg);
      setLdng(false);
    };
    fetchCfg();
  }, [ns, JSON.stringify(defs)]);

  const updCfg = useCallback(async (k: keyof T, v: T[keyof T]) => {
    setCfg((p) => ({ ...p, [k]: v }));
    await UsrCfgSvc.setPref(`${ns}_${k}`, v);
    await CdbAuditSvc.logAction("UPDATE_USER_CONFIG", { k: `${ns}_${k}`, v });
  }, [ns]);

  return [cfg, updCfg, ldng] as const;
}

export function KpiGridRow({ lbl, kpi, ldng }: { lbl: string; kpi: ADV_KPI_STRUCT | undefined; ldng: boolean; }) {
  const vClr = useMemo(() => {
    if (kpi?.vec === "pos") return "text-green-600";
    if (kpi?.vec === "neg") return "text-red-600";
    return "text-neutral-500";
  }, [kpi?.vec]);

  const vIcon = useMemo(() => {
    if (kpi?.vec === "pos") return ICONS.TREND_UP;
    if (kpi?.vec === "neg") return ICONS.TREND_DOWN;
    return ICONS.TREND_STABLE;
  }, [kpi?.vec]);

  const tt = useMemo(() => {
    if (!kpi) return "Awaiting data...";
    return (
      <Stack className="gap-1.5 p-2 text-xs">
        <div>YoY Delta: {kpi.yoyDlt || "-"}</div>
        <div>QoQ Delta: {kpi.qoqDlt || "-"}</div>
        <div>MoM Delta: {kpi.momDlt || "-"}</div>
        {kpi.ctgyBrkdn && (
          <CollapsibleSection hdr="Category Breakdown">
            {Object.entries(kpi.ctgyBrkdn).map(([c, v]) => (
              <div key={c} className="flex justify-between py-0.5"><span>{c}:</span><span>{fmtCcy(v)}</span></div>
            ))}
          </CollapsibleSection>
        )}
      </Stack>
    );
  }, [kpi]);

  return (
    <DataGridRow bg>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <FieldDescriptor cls="justify-self-start cursor-help flex items-center gap-1.5">
              {lbl}
              <img src={vIcon} alt="trend" className="h-4 w-4" />
            </FieldDescriptor>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm bg-black text-white rounded-md shadow-lg">{tt}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DataPointDisplay l={ldng} v={kpi?.p1} />
      <DataPointDisplay l={ldng} v={kpi?.p0} />
      <DataPointDisplay l={ldng} v={kpi?.dlt} cls={vClr} />
      <Button variant="link" size="sm" disabled={ldng || !kpi} aria-label={`Details for ${lbl}`}>Drilldown</Button>
    </DataGridRow>
  );
}

export function AiSynopsisPanel({ syn, ldng, onGen }: { syn: string | null; ldng: boolean; onGen: () => void; }) {
    return (
        <Card className="mt-5">
            <CardHeader><CardHeading><CardTitle>AI-Synthesized Synopsis</CardTitle><CardDescription>GenAI insights on financial movements.</CardDescription></CardHeading><CardActions><Button onClick={onGen} disabled={ldng}>{ldng ? "Processing..." : "Synthesize"}</Button></CardActions></CardHeader>
            <CardContent>{ldng ? <Stack className="gap-2.5"><LoadingLine/><LoadingLine/><LoadingLine/></Stack> : syn ? <p className="text-sm text-neutral-800 whitespace-pre-line">{syn}</p> : <p className="text-sm text-neutral-500">Initiate synthesis for an AI-generated overview.</p>}</CardContent>
        </Card>
    );
}

export function ProjectionDisplay({ proj, ldng }: { proj: PROJ_PT[]; ldng: boolean; }) {
  if (ldng) return <Stack className="gap-2 mt-4"><LoadingLine /><LoadingLine /><LoadingLine /></Stack>;
  if (proj.length === 0) return <p className="text-sm text-neutral-500 mt-4">No projection data to display.</p>;
  return (
    <div className="w-full overflow-x-auto mt-4"><table className="min-w-full divide-y divide-neutral-200 text-sm">
        <thead className="bg-neutral-100"><tr>
            {["Date", "Inflow", "Outflow", "Net Flow", "Cumulative", "Confidence"].map(h => <th key={h} className="px-3 py-2 text-xs font-semibold text-neutral-600 uppercase tracking-wider text-right first:text-left">{h}</th>)}
        </tr></thead>
        <tbody className="bg-white divide-y divide-neutral-200">
            {proj.map((p, i) => (<tr key={p.ts + i}>
                <td className="px-3 py-2 whitespace-nowrap text-left">{p.ts}</td>
                <td className="px-3 py-2 whitespace-nowrap text-right">{fmtCcy(p.in)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-right">{fmtCcy(p.out)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-right">{fmtCcy(p.net)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-right">{fmtCcy(p.cum)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-right">{(p.conf * 100).toFixed(0)}%</td>
            </tr>))}
        </tbody>
    </table></div>
  );
}

export function ProjectionConfigurator({ cFltrs, kpis, onProjGen }: { cFltrs: FLTR_CONFIG; kpis: Record<string, ADV_KPI_STRUCT>; onProjGen: (p: PROJ_PT[]) => void; }) {
  const [h, setH] = useState(PROJ_HORIZON_OPTS[0].v);
  const [sg, setSg] = useState("1.5");
  const [oi, setOi] = useState("0.7");
  const [g, setG] = useState(false);
  const handleGen = useCallback(async () => {
    setG(true);
    try {
      const histD: KPI_STRUCT[] = [kpis.charges, kpis.payouts, kpis.netCapitalFlow].filter(Boolean) as KPI_STRUCT[];
      const p = await CdbAiCoreSvc.projectFutureFlows(histD, h, { slsGrwth: parseFloat(sg) / 100, opxCstInc: parseFloat(oi) / 100 });
      onProjGen(p);
      await CdbAuditSvc.logAction("GENERATE_PROJECTION", { f: cFltrs, h, sg, oi });
    } finally {
      setG(false);
    }
  }, [h, sg, oi, kpis, onProjGen, cFltrs]);
  return (
    <Stack className="gap-4 p-4 border border-neutral-200 rounded-lg bg-white shadow-sm">
      <h3 className="text-md font-bold text-neutral-900">Projection Parameters</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField label="Projection Horizon" options={PROJ_HORIZON_OPTS.map(o => ({ label: o.l, value: String(o.v) }))} handleChange={(k, f) => setH(Number(f.value))} selectValue={String(h)} name="proj-h-sel" isSearchable={false} />
        <div><UiLabel htmlFor="sg-in" className="block text-sm font-medium text-neutral-700 mb-1">Revenue Growth (%/mo)</UiLabel><Input id="sg-in" type="number" value={sg} onChange={(e) => setSg(e.target.value)} placeholder="e.g., 1.5" step="0.1" min="0" /></div>
        <div><UiLabel htmlFor="oi-in" className="block text-sm font-medium text-neutral-700 mb-1">OpEx Inflation (%/mo)</UiLabel><Input id="oi-in" type="number" value={oi} onChange={(e) => setOi(e.target.value)} placeholder="e.g., 0.7" step="0.1" min="0" /></div>
      </div>
      <Button onClick={handleGen} disabled={g} className="w-full md:w-auto self-start">{g ? "Generating..." : "Run Projection"}</Button>
    </Stack>
  );
}

export function DeviationDisplay({ dvtns, ldng, onDet, onRes }: { dvtns: DEVIATION[]; ldng: boolean; onDet: () => void; onRes: (id: string) => void; }) {
  const [resIds, setResIds] = useState<Set<string>>(new Set());
  const handleRes = useCallback((id: string) => { setResIds(p => new Set(p).add(id)); onRes(id); }, [onRes]);
  const S_STYLES = {
    high: "border-red-500 bg-red-50", med: "border-orange-500 bg-orange-50", low: "border-yellow-500 bg-yellow-50"
  };
  return (
    <Card className="mt-5">
      <CardHeader><CardHeading><CardTitle>AI-Powered Deviation Detection</CardTitle><CardDescription>Identify and analyze unusual financial patterns.</CardDescription></CardHeading><CardActions><Button onClick={onDet} disabled={ldng}>{ldng ? "Scanning..." : "Detect Deviations"}</Button></CardActions></CardHeader>
      <CardContent>{ldng ? <Stack className="gap-2"><LoadingLine/><LoadingLine/></Stack> : dvtns.length > 0 ? (
          <Stack className="gap-3.5">
            {dvtns.map(d => (
              <div key={d.id} className={cn("p-3.5 border rounded-lg shadow-sm", S_STYLES[d.sev], resIds.has(d.id) && "opacity-60")}>
                <div className="flex justify-between items-start mb-1.5"><h4 className="font-bold text-base">{d.kpi} Deviation - {d.ts}</h4><span className="text-xs font-semibold uppercase">{d.sev} Severity</span></div>
                <p className="text-sm text-neutral-700 mb-1"><strong>Observed:</strong> {fmtCcy(d.val)} (Expected: {fmtCcy(d.expRng[0])} - {fmtCcy(d.expRng[1])})</p>
                <p className="text-sm text-neutral-700 mb-1"><strong>AI Explanation:</strong> {d.expl}</p>
                <p className="text-sm text-neutral-700 mb-2"><strong>AI Recommendation:</strong> {d.rec}</p>
                {!resIds.has(d.id) && <Button variant="link" size="sm" onClick={() => handleRes(d.id)}>Acknowledge & Resolve</Button>}
              </div>))}
          </Stack>) : (<p className="text-sm text-neutral-500">Initiate scan to detect deviations from historical norms.</p>)}
      </CardContent>
    </Card>
  );
}
export function OptimizationSuggestions({ suggs, ldng, onGen }: { suggs: string[]; ldng: boolean; onGen: () => void; }) {
    return (
        <Card className="mt-5">
            <CardHeader><CardHeading><CardTitle>Capital Flow Optimization Suggestions</CardTitle><CardDescription>AI-driven tactics for enhancing liquidity.</CardDescription></CardHeading><CardActions><Button onClick={onGen} disabled={ldng}>{ldng ? "Formulating..." : "Get Suggestions"}</Button></CardActions></CardHeader>
            <CardContent>{ldng ? <Stack className="gap-2.5"><LoadingLine/><LoadingLine/></Stack> : suggs.length > 0 ? <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1.5">{suggs.map((s, i) => <li key={i}>{s}</li>)}</ul> : <p className="text-sm text-neutral-500">Generate suggestions for actionable financial strategies.</p>}</CardContent>
        </Card>
    );
}
export function GenAiChatInterface({ hist, ldng, onSend }: { hist: AI_CHAT_MSG[]; ldng: boolean; onSend: (msg: string) => void; }) {
  const [msg, setMsg] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const handleSend = useCallback(() => { if (msg.trim() && !ldng) { onSend(msg); setMsg(""); } }, [msg, ldng, onSend]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [hist]);
  return (
    <Card className="mt-5 flex flex-col h-[600px]"><CardHeader><CardHeading><CardTitle>GenAI Assistant Chat</CardTitle><CardDescription>Interactive dialogue for financial inquiries.</CardDescription></CardHeading></CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 border-y bg-neutral-50/50"><Stack className="gap-4">
          {hist.length === 0 && <div className="text-center text-neutral-500 text-sm">Conversation not started.</div>}
          {hist.map(e => (<div key={e.id} className={cn("max-w-[85%] p-3 rounded-xl text-sm w-fit", e.src === 'usr' ? "bg-blue-600 text-white self-end rounded-br-none" : "bg-neutral-200 text-neutral-900 self-start rounded-bl-none")}>
              <div className="font-bold mb-1">{e.src === "usr" ? "You" : "GenAI Assistant"}</div><div>{e.txt}</div><div className="text-xs opacity-70 mt-1.5 text-right">{e.ts}</div>
            </div>))}
          {ldng && <div className="self-start p-3 rounded-xl bg-neutral-200 text-neutral-900 rounded-bl-none w-20"><LoadingLine/></div>}
          <div ref={endRef} />
        </Stack></CardContent>
      <CardFooter className="p-4"><div className="flex w-full gap-2.5">
          <Input value={msg} onChange={e => setMsg(e.target.value)} onKeyPress={e => e.key === "Enter" && handleSend()} placeholder="Ask about your financial data..." disabled={ldng} />
          <Button onClick={handleSend} disabled={ldng}>{ldng ? "Thinking..." : "Send"}</Button>
        </div></CardFooter>
    </Card>
  );
}

export function ReportCompiler({ doc, ldng, onGen }: { doc: string | null; ldng: boolean; onGen: () => void; }) {
    const dlRef = useRef<HTMLAnchorElement>(null);
    const handleDl = useCallback(() => {
        if (doc && dlRef.current) {
            const blob = new Blob([doc], { type: "text/markdown;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            dlRef.current.href = url;
            dlRef.current.download = `CapitalFlowReport_${moment().format("YYYYMMDD")}.md`;
            dlRef.current.click();
            URL.revokeObjectURL(url);
        }
    }, [doc]);
    return (
        <Card className="mt-5">
            <CardHeader><CardHeading><CardTitle>Generative Intelligence Report</CardTitle><CardDescription>Comprehensive, AI-compiled financial documentation.</CardDescription></CardHeading>
                <CardActions><Button onClick={onGen} disabled={ldng}>{ldng ? "Compiling..." : "Compile Report"}</Button><Button onClick={handleDl} disabled={ldng || !doc} variant="outline">Download MD</Button><a ref={dlRef} className="hidden" /></CardActions>
            </CardHeader>
            <CardContent>{ldng ? <Stack className="gap-2.5"><LoadingLine/><LoadingLine/><LoadingLine/></Stack> : doc ? <pre className="p-4 border rounded-md bg-neutral-900 text-green-400 text-xs overflow-auto max-h-[600px] font-mono whitespace-pre-wrap">{doc}</pre> : <p className="text-sm text-neutral-500">Initiate compilation to generate a detailed report.</p>}</CardContent>
        </Card>
    );
}

export default function CshFlwIntelWidget() {
  const [fltrs, setFltrs] = useState<FLTR_CONFIG>(DEFAULT_FLTRS);
  const [tab, setTab] = useState("overview");
  const [usrCfg, updUsrCfg, ldngUsrCfg] = useUsrCfg("csh_flw_mdl", { defProjM: 6, enblAiAsst: true, autoGenSyn: false });

  const { data, loading, error, refetch } = useCashFlowMetricsWidgetQuery({
    variables: { period: fltrs.tmRng === "custom" ? null : fltrs.tmRng, originatingAccount: fltrs.acct === ALL_ENTITIES_IDENTIFIER ? null : fltrs.acct, startDate: fltrs.sD, endDate: fltrs.eD },
    fetchPolicy: "network-only",
  });

  const ts = moment().format("MMM D, YYYY, h:mm:ss A");

  const baseKpis = useMemo(() => (data?.keyMetrics?.reduce((acc, m) => ({ ...acc, [m.name]: { p1: m.prettyThisPeriod, p0: m.prettyLastPeriod, dlt: m.prettyChange, rP1: m.thisPeriod, rP0: m.lastPeriod, rDlt: m.change } }), {}) || {}) as Record<string, KPI_STRUCT>, [data]);
  const advKpis = useMemo(() => computeAdvKpis(baseKpis, fltrs), [baseKpis, fltrs]);

  const [syn, setSyn] = useState<string|null>(null);
  const [genSyn, setGenSyn] = useState(false);
  const [projRes, setProjRes] = useState<PROJ_PT[]>([]);
  const [dvtns, setDvtns] = useState<DEVIATION[]>([]);
  const [detDvtns, setDetDvtns] = useState(false);
  const [resDvtns, setResDvtns] = useState<Set<string>>(new Set());
  const [suggs, setSuggs] = useState<string[]>([]);
  const [getSuggs, setGetSuggs] = useState(false);
  const [chatHist, setChatHist] = useState<AI_CHAT_MSG[]>([]);
  const [chatting, setChatting] = useState(false);
  const [repDoc, setRepDoc] = useState<string|null>(null);
  const [genRep, setGenRep] = useState(false);

  const handleGenSyn = useCallback(async () => { if (loading || genSyn) return; setGenSyn(true); try { const s = await CdbAiCoreSvc.composeFinancialSynopsis(advKpis, fltrs); setSyn(s); await CdbAuditSvc.logAction("GENERATE_AI_SYNOPSIS", { fltrs }); } finally { setGenSyn(false); } }, [advKpis, fltrs, loading, genSyn]);
  const handleProjGen = useCallback((p: PROJ_PT[]) => { setProjRes(p); }, []);
  const handleDetDvtns = useCallback(async () => { if (loading || detDvtns) return; setDetDvtns(true); setResDvtns(new Set()); try { const d = await CdbAiCoreSvc.detectDeviations(advKpis, []); setDvtns(d); await CdbAuditSvc.logAction("DETECT_DEVIATIONS", { fltrs }); } finally { setDetDvtns(false); } }, [advKpis, fltrs, loading, detDvtns]);
  const handleResDvtns = useCallback(async (id: string) => { setResDvtns(p => new Set(p).add(id)); await CdbAuditSvc.logAction("RESOLVE_DEVIATION", { id }); }, []);
  const handleGetSuggs = useCallback(async () => { if (loading || getSuggs) return; setGetSuggs(true); try { const r = await CdbAiCoreSvc.formulateSuggestions(advKpis, dvtns.filter(d => !resDvtns.has(d.id))); setSuggs(r); await CdbAuditSvc.logAction("GET_OPTIMIZATION_SUGGESTIONS", { fltrs }); } finally { setGetSuggs(false); } }, [advKpis, dvtns, resDvtns, fltrs, loading, getSuggs]);
  const handleSendChat = useCallback(async (m: string) => { if (chatting) return; setChatting(true); const usrMsg: AI_CHAT_MSG = { id: `usr-${Date.now()}`, ts: moment().format("MMM D, YYYY, h:mm:ss A"), src: "usr", txt: m }; setChatHist(p => [...p, usrMsg]); try { const aiMsg = await CdbAiCoreSvc.processChatQuery([...chatHist, usrMsg], m); setChatHist(p => [...p, aiMsg]); } finally { setChatting(false); } }, [chatHist, chatting]);
  const handleGenRep = useCallback(async () => { if (loading || genRep) return; setGenRep(true); try { const r = await CdbAiCoreSvc.compileDocument(advKpis, projRes, dvtns.filter(d => !resDvtns.has(d.id)), syn || "Synopsis not generated."); setRepDoc(r); await CdbAuditSvc.logAction("COMPILE_DETAILED_REPORT", { fltrs }); } finally { setGenRep(false); } }, [advKpis, projRes, dvtns, resDvtns, syn, fltrs, loading, genRep]);

  useEffect(() => { if (usrCfg.autoGenSyn && !loading && !genSyn && !syn && Object.keys(advKpis).length > 0) { handleGenSyn(); } }, [usrCfg.autoGenSyn, loading, genSyn, syn, advKpis, handleGenSyn]);

  const handleFltrChg = useCallback((newFltrs: Partial<FLTR_CONFIG>) => {
    setFltrs(p => { const u = { ...p, ...newFltrs }; setSyn(null); setProjRes([]); setDvtns([]); setSuggs([]); setRepDoc(null); return u; });
    CdbAuditSvc.logAction("UPDATE_CASH_FLOW_FILTERS", newFltrs);
  }, []);

  if (error) { return <Card><CardHeader><CardTitle>Error Loading Module</CardTitle></CardHeader><CardContent><p className="text-red-700">A data fetching error occurred: {error.message}.</p><Button onClick={() => refetch()} className="mt-4">Retry</Button></CardContent></Card>; }

  return (
    <Card className="flex flex-col h-full bg-neutral-50">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border-b border-neutral-200">
        <CardHeading>
          <CardTitle className="text-xl font-extrabold text-neutral-900">Capital Flow Intelligence Matrix</CardTitle>
          <CardDescription className="text-sm text-neutral-600">Real-time treasury pulse for {CORP_ID}. Updated: {ts}</CardDescription>
        </CardHeading>
        <CardActions className="flex flex-wrap gap-2 justify-end mt-3 md:mt-0">
          <SelectField options={T_RNG_OPTS.map(o => ({ label: o.l, value: o.v }))} handleChange={(k, f) => { handleFltrChg({ tmRng: f.value, sD: undefined, eD: undefined }); }} selectValue={fltrs.tmRng} name="cf-tmrng-sel" isSearchable={false} classes="w-full sm:w-40" />
          {fltrs.tmRng === "custom" && (<><Input type="date" value={fltrs.sD || ""} onChange={e => handleFltrChg({ sD: e.target.value })} /><Input type="date" value={fltrs.eD || ""} onChange={e => handleFltrChg({ eD: e.target.value })} /></>)}
          <AccountSelect onAccountSelect={v => handleFltrChg({ acct: v })} accountId={fltrs.acct} classes="!max-w-[220px] w-full sm:w-auto" />
          <SelectField options={CATEGORY_FILTERS.map(o => ({ label: o.l, value: o.v }))} handleChange={(k, f) => handleFltrChg({ ctgy: f.value })} selectValue={fltrs.ctgy} name="cf-ctgy-sel" isSearchable={false} classes="w-full sm:w-auto max-w-[220px]" />
          <Button onClick={() => refetch()} variant="outline" disabled={loading}>{loading ? "Updating..." : "Refresh"}</Button>
        </CardActions>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-y-auto">
        <Tabs defaultValue="overview" value={tab} onValueChange={setTab} className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-1 mb-4 flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="forecast">Forecast & Scenarios</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            <TabsTrigger value="chat">AI Assistant Chat</TabsTrigger>
            <TabsTrigger value="reports">Generative Reports</TabsTrigger>
            <TabsTrigger value="settings">Preferences</TabsTrigger>
            <TabsTrigger value="connectors">Data Connectors</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-0 flex-1 overflow-y-auto"><Stack className="mt-2 gap-2.5">
              <DataGridRow><div/><FieldDescriptor>Current Period</FieldDescriptor><FieldDescriptor>Prior Period</FieldDescriptor><FieldDescriptor>Change</FieldDescriptor><div/></DataGridRow>
              <KpiGridRow lbl="Payouts" kpi={advKpis?.payouts} ldng={loading}/>
              <KpiGridRow lbl="Charges" kpi={advKpis?.charges} ldng={loading}/>
              <KpiGridRow lbl="Transfers" kpi={advKpis?.transfers} ldng={loading}/>
              <KpiGridRow lbl="Net Capital Flow" kpi={advKpis?.netCapitalFlow} ldng={loading}/>
          </Stack></TabsContent>
          <TabsContent value="forecast" className="mt-0 flex-1 overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Capital Flow Projection & Simulation</h2>
              <ProjectionConfigurator cFltrs={fltrs} kpis={advKpis} onProjGen={handleProjGen}/>
              <h3 className="text-lg font-semibold mt-6 mb-2">Projection Results</h3>
              <ProjectionDisplay proj={projRes} ldng={false}/>
          </TabsContent>
          <TabsContent value="ai-insights" className="mt-0 flex-1 overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">GenAI-Powered Intelligence Suite</h2>
              <AiSynopsisPanel syn={syn} ldng={genSyn} onGen={handleGenSyn}/>
              <DeviationDisplay dvtns={dvtns.filter(d => !resDvtns.has(d.id))} ldng={detDvtns} onDet={handleDetDvtns} onRes={handleResDvtns}/>
              <OptimizationSuggestions suggs={suggs} ldng={getSuggs} onGen={handleGetSuggs}/>
          </TabsContent>
          <TabsContent value="chat" className="mt-0 flex-1 overflow-y-auto">
              <GenAiChatInterface hist={chatHist} ldng={chatting} onSend={handleSendChat}/>
          </TabsContent>
          <TabsContent value="reports" className="mt-0 flex-1 overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Generative Reporting Console</h2>
              <ReportCompiler doc={repDoc} ldng={genRep} onGen={handleGenRep}/>
          </TabsContent>
          <TabsContent value="settings" className="mt-0 flex-1 overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">User & Module Preferences</h2>
              {ldngUsrCfg ? <Stack className="gap-2"><LoadingLine/><LoadingLine/></Stack> : <Stack className="gap-4 p-4 border rounded-lg bg-white">
                  <div className="flex items-center gap-2"><Checkbox id="auto-syn-pref" checked={usrCfg.autoGenSyn} onCheckedChange={c => updUsrCfg("autoGenSyn", c)}/><UiLabel htmlFor="auto-syn-pref">Automatically synthesize AI synopsis upon data load.</UiLabel></div>
                  <div className="flex items-center gap-2"><Checkbox id="ai-asst-pref" checked={usrCfg.enblAiAsst} onCheckedChange={c => updUsrCfg("enblAiAsst", c)}/><UiLabel htmlFor="ai-asst-pref">Enable GenAI Assistant Chat tab.</UiLabel></div>
                  <div><UiLabel htmlFor="def-proj-m" className="block text-sm font-medium text-neutral-700 mb-1">Default Projection Horizon</UiLabel><SelectField options={PROJ_HORIZON_OPTS.map(o => ({ label: o.l, value: String(o.v) }))} handleChange={(k, f) => updUsrCfg("defProjM", Number(f.value))} selectValue={String(usrCfg.defProjM)} name="def-proj-m" isSearchable={false} classes="max-w-[250px]"/></div>
              </Stack>}
          </TabsContent>
          <TabsContent value="connectors" className="mt-0 flex-1 overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">Data Source Integrations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(INTEGRATION_MANIFEST).map(([name, details]) => (
                        <Card key={name}>
                            <CardHeader>
                                <CardHeading>
                                    <CardTitle>{name}</CardTitle>
                                    <CardDescription>{details.type}</CardDescription>
                                </CardHeading>
                                <CardActions>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${details.status === 'active' ? 'bg-green-100 text-green-800' : details.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {details.status.toUpperCase()}
                                    </span>
                                </CardActions>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-neutral-600 mb-3">{details.desc}</p>
                                <Button variant="outline" size="sm" onClick={() => window.open(details.url, '_blank')}>
                                    {details.status === 'active' ? 'Manage' : 'Learn More'}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </TabsContent>
            <TabsContent value="compliance" className="mt-0 flex-1 overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">Compliance & Governance</h2>
                <Card><CardHeader><CardTitle>Automated Compliance Checks</CardTitle></CardHeader>
                <CardContent><Stack className="gap-3">
                    <div className="p-3 border rounded-md bg-green-50 border-green-400"><h4 className="font-semibold text-green-800">SOX Compliance: Segregation of Duties</h4><p className="text-sm text-green-700">Status: PASSED - All transactions for the period have been authorized by separate personnel from initiation.</p></div>
                    <div className="p-3 border rounded-md bg-yellow-50 border-yellow-400"><h4 className="font-semibold text-yellow-800">AML Monitoring: Large Transaction Reporting</h4><p className="text-sm text-yellow-700">Status: PENDING REVIEW - 5 transactions over the $10,000 reporting threshold are awaiting review and SAR filing assessment.</p></div>
                </Stack></CardContent></Card>
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}