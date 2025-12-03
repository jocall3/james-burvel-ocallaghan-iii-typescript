// Copyright James Burvel O’Callaghan III
// President Citibank demo business Inc.

import React, { useState } from "react";
import moment from "moment";
import PieChart from "../../../common/ui-components/Charts/PieChart";
import { Icon, ExpandableCard } from "../../../common/ui-components";
import DateSearch, {
  dateSearchMapper,
} from "../../components/search/DateSearch";
import SearchContainer from "../SearchContainer";
import {
  Decision__DecisionTypeEnum,
  useDecisionAnalyticsViewQuery,
  DecisionAnalytics,
  TimeUnitEnum,
  TimeFormatEnum,
  ComplianceAnalytics,
  useComplianceAnalyticsViewQuery,
} from "../../../generated/dashboard/graphqlSchema";
import { DateRangeFormValues } from "../../../common/ui-components/DateRangeSelectField/DateRangeSelectField";
import colors from "../../../common/styles/colors";
import ComplianceTransactionMonitoringWidget from "../dashboard/widgets/compliance_transaction_monitoring/Widget";
import ComplianceUserOnboardingsWidget from "../dashboard/widgets/compliance_user_onboardings/Widget";

const BASE_URL_CONFIG = "citibankdemobusiness.dev";
const CORP_LEGAL_NAME = "Citibank demo business Inc";
const DEFAULT_API_TIMEOUT = 15000;
const MAX_RETRY_ATTEMPTS = 5;
const INITIAL_BACKOFF_MS = 250;
const MAX_LOG_ENTRIES = 10000;
const MAX_METRIC_ENTRIES = 5000;

type QParams = {
  ts?: DateRangeFormValues;
};

type DoughnutChartDataSchema = {
  lbl: string;
  val: number;
  ctgry?: 'opt' | 'mon' | 'crit';
  rskPressure?: number;
  fcstNext?: number;
};

export type AIEngineMetric = { k: string; v: number; ctx?: object };
export type AIEngineLog = { lvl: 'INF' | 'WRN' | 'ERR' | 'DBG'; msg: string; ctx?: object };
export type AIEngineHealthSnapshot = ReturnType<typeof ArtificialIntelTelemetryNexus.prototype.generateSystemSnapshot>;

class ArtificialIntelTelemetryNexus {
  private static inst: ArtificialIntelTelemetryNexus;
  private mtrcs: { [k: string]: number } = {};
  private lgs: AIEngineLog[] = [];
  private perfTargets: { [k: string]: number } = { qLat: 450, errRt: 0.02 };

  private constructor() {
    this.lgs.push({ lvl: 'INF', msg: 'AITelemetryNexus Online: Self-Diagnostic Protocols Engaged.' });
  }

  public static getInst(): ArtificialIntelTelemetryNexus {
    if (!ArtificialIntelTelemetryNexus.inst) {
      ArtificialIntelTelemetryNexus.inst = new ArtificialIntelTelemetryNexus();
    }
    return ArtificialIntelTelemetryNexus.inst;
  }

  public recordMetric(k: string, v: number, ctx?: object) {
    if (Object.keys(this.mtrcs).length > MAX_METRIC_ENTRIES) {
        this.mtrcs = {};
    }
    this.mtrcs[k] = v;
    this.log('DBG', `MTRC: ${k}=${v}`, ctx);
    this.checkTargets(k, v, ctx);
  }

  public log(lvl: 'INF' | 'WRN' | 'ERR' | 'DBG', msg: string, ctx?: object) {
    if (this.lgs.length > MAX_LOG_ENTRIES) {
        this.lgs.shift();
    }
    const logEntry: AIEngineLog = { lvl, msg, ctx, ts: new Date().toISOString() };
    this.lgs.push(logEntry);
    if (lvl === 'ERR' || lvl === 'WRN') {
      console.warn(`AITelemetryNexus Alert: ${msg}`, ctx);
    }
  }

  private checkTargets(k: string, v: number, ctx?: object) {
    if (k === 'qLat' && v > this.perfTargets.qLat) {
      this.log('WRN', `Query latency exceeds target for ${ctx?.['qName'] || 'unknown'}! Latency: ${v}ms.`, ctx);
    }
  }

  public generateSystemSnapshot(): { stat: string; mtrcs: typeof this.mtrcs; lgs: AIEngineLog[] } {
    const isDegraded = Object.keys(this.perfTargets).some(k => {
      if (k === 'qLat' && this.mtrcs['qLat'] > this.perfTargets.qLat) return true;
      if (k === 'errRt' && this.mtrcs['errRt'] > this.perfTargets.errRt) return true;
      return false;
    });
    const stat = isDegraded ? 'DEGRADED' : 'OPERATIONAL';
    return { stat, mtrcs: { ...this.mtrcs }, lgs: [...this.lgs] };
  }
}

class ArtificialIntelHeuristicProcessor {
  private static inst: ArtificialIntelHeuristicProcessor;
  private telNexus: ArtificialIntelTelemetryNexus;

  private constructor() {
    this.telNexus = ArtificialIntelTelemetryNexus.getInst();
    this.telNexus.log('INF', "AIHeuristicProcessor Online: Contextual Inference Models Loaded.");
  }

  public static getInst(): ArtificialIntelHeuristicProcessor {
    if (!ArtificialIntelHeuristicProcessor.inst) {
      ArtificialIntelHeuristicProcessor.inst = new ArtificialIntelHeuristicProcessor();
    }
    return ArtificialIntelHeuristicProcessor.inst;
  }

  public recommendDateSpan(currentQ: DateRangeFormValues, usrCtx?: object): DateRangeFormValues {
    this.telNexus.log('INF', "Generating date span recommendation via AI models.", { currentQ, usrCtx });
    if (usrCtx?.['hiRskPrd'] === 'lastFinancialQuarter') {
      return { inTheLast: { unit: TimeUnitEnum.Months, amount: 3 }, format: TimeFormatEnum.Duration };
    }
    return { inTheLast: { unit: TimeUnitEnum.Months, amount: 1 }, format: TimeFormatEnum.Duration };
  }

  public craftInsight(dat: ComplianceAnalytics, analysisType: 'usrOnboard' | 'txnMon'): string {
    this.telNexus.log('INF', `Crafting insight for ${analysisType} data.`, { dat, analysisType });
    const { accurate: acc, falsePositive: fp, falseNegative: fn, decisionAccuracy: da } = dat;
    if (da === 100 && acc > 0) return `AI engine confirms flawless accuracy in ${analysisType} decisions. All ${acc} instances processed correctly.`;
    if (fp > 0 && fn === 0) return `Alert: ${fp} false positives identified in ${analysisType}. AI recommends tuning detection thresholds to enhance precision.`;
    if (fn > 0) return `CRITICAL: ${fn} potential false negatives in ${analysisType} signals a possible breach. Immediate deep-dive analysis is required. AI has triggered an automated pattern search.`;
    if (acc === 0 && fp === 0 && fn === 0) return `Insufficient data for ${analysisType} in this period. AI suggests broadening the temporal query parameters.`;
    return `AI analysis shows a decision accuracy of ${da}% for ${analysisType}. Continuous algorithmic monitoring is active.`;
  }
}

class ArtificialIntelCognitiveStore {
  private static inst: ArtificialIntelCognitiveStore;
  private store: { [k: string]: any } = {};
  private telNexus: ArtificialIntelTelemetryNexus;

  private constructor() {
    this.telNexus = ArtificialIntelTelemetryNexus.getInst();
    this.telNexus.log('INF', "AICognitiveStore Online: Contextual Memory Matrix Activated.");
    this.hydrateState();
  }
  
  private hydrateState() {
     try {
      const persistedCtx = window.localStorage.getItem('aiComplianceCogStore');
      if (persistedCtx) {
        this.store = JSON.parse(persistedCtx);
        this.telNexus.log('INF', 'Hydrated AI cognitive state from persistent storage.', this.store);
      }
    } catch (e: any) {
      this.telNexus.log('ERR', 'Failed to hydrate AI cognitive state.', { error: e.message });
    }
  }

  public static getInst(): ArtificialIntelCognitiveStore {
    if (!ArtificialIntelCognitiveStore.inst) {
      ArtificialIntelCognitiveStore.inst = new ArtificialIntelCognitiveStore();
    }
    return ArtificialIntelCognitiveStore.inst;
  }

  public set(k: string, v: any) {
    this.store[k] = v;
    this.persistState();
    this.telNexus.log('DBG', `CognitiveStore updated: ${k}`, { v });
  }

  public get<T>(k: string, defVal?: T): T {
    const v = this.store[k] as T;
    return v === undefined && defVal !== undefined ? defVal : v;
  }

  private persistState() {
    try {
      window.localStorage.setItem('aiComplianceCogStore', JSON.stringify(this.store));
    } catch (e: any) {
      this.telNexus.log('ERR', 'Failed to persist AI cognitive state.', { error: e.message });
    }
  }
}

class ArtificialIntelAnalyticsCore {
    private static inst: ArtificialIntelAnalyticsCore;
    private telNexus: ArtificialIntelTelemetryNexus;
    private heurProc: ArtificialIntelHeuristicProcessor;
    private constructor() {
        this.telNexus = ArtificialIntelTelemetryNexus.getInst();
        this.heurProc = ArtificialIntelHeuristicProcessor.getInst();
        this.telNexus.log('INF', "AIAnalyticsCore Online: Advanced Data Synthesis Grid Primed.");
    }
    public static getInst(): ArtificialIntelAnalyticsCore {
        if (!ArtificialIntelAnalyticsCore.inst) {
            ArtificialIntelAnalyticsCore.inst = new ArtificialIntelAnalyticsCore();
        }
        return ArtificialIntelAnalyticsCore.inst;
    }

    public augmentDoughnutChartData(elem: ComplianceAnalytics): DoughnutChartDataSchema[] {
        const base = [
            { lbl: "Accurate", val: elem.accurate, ctgry: 'opt' },
            { lbl: "False Positive", val: elem.falsePositive, ctgry: 'mon' },
            { lbl: "False Negative", val: elem.falseNegative, ctgry: 'crit' },
        ];
        const total = elem.accurate + elem.falsePositive + elem.falseNegative;
        return base.map(item => ({
            ...item,
            rskPressure: total > 0 ? (item.val / total) * (item.ctgry === 'crit' ? 3 : item.ctgry === 'mon' ? 2 : 1) : 0,
            fcstNext: item.val * (1 + Math.random() * 0.1 - 0.05),
        }));
    }

    public findDecisionAnomalies(decAn: DecisionAnalytics, histCtx?: any): string[] {
        this.telNexus.log('INF', "Scanning for decision anomalies.", { decAn });
        const anom: string[] = [];
        const baseApprRate = histCtx?.baseApprRate || 80;
        if (decAn.approvalRate < baseApprRate * 0.75) {
            anom.push(`Approval rate (${decAn.approvalRate}%) is anomalously below historical baseline (${baseApprRate}%). AI suggests review of recent policy modifications.`);
        }
        if (decAn.openCases > 150 && !histCtx?.hiOpenCasesAck) {
            anom.push(`High volume of open cases (${decAn.openCases}). Potential systemic backlog or emerging threat vector detected.`);
        }
        return anom;
    }

    public forecastComplianceMetrics(curr: ComplianceAnalytics, period: string = 'nextCycle'): ComplianceAnalytics {
        this.telNexus.log('INF', `Forecasting compliance metrics for ${period}.`, { curr });
        const factor = 1 + (Math.random() - 0.5) * 0.15;
        return {
            accurate: Math.round(curr.accurate * factor),
            falsePositive: Math.round(curr.falsePositive * factor * 1.1),
            falseNegative: Math.round(curr.falseNegative * factor * 1.15),
            decisionAccuracy: parseFloat((curr.decisionAccuracy * (1 - (Math.random() * 0.03))).toFixed(2)),
            totalDecisions: Math.round(curr.totalDecisions * factor),
            totalCases: Math.round(curr.totalCases * factor),
        };
    }
}

const ALL_INTEGRATIONS = [
    'Gemini', 'Pipedream', 'GitHub', 'Hugging Face', 'Plaid', 'Modern Treasury', 
    'Google Drive', 'OneDrive', 'Azure', 'Google Cloud', 'Supabase', 'Vercel', 'Salesforce', 'Oracle', 
    'MARQETA', 'Citibank', 'Shopify', 'WooCommerce', 'GoDaddy', 'Cpanel', 'Adobe', 'Twilio', 'Stripe', 
    'PayPal', 'QuickBooks', 'Xero', 'HubSpot', 'Marketo', 'Zendesk', 'Jira', 'Confluence', 'Slack', 
    'Microsoft Teams', 'Zoom', 'DocuSign', 'Dropbox', 'Box', 'Snowflake', 'Databricks', 'Tableau', 
    'PowerBI', 'Figma', 'Sketch', 'InVision', 'Asana', 'Trello', 'Monday.com', 'Notion', 'Airtable', 
    'Zapier', 'Integromat', 'Segment', 'Mixpanel', 'Amplitude', 'Google Analytics', 'Datadog', 'New Relic', 
    'Sentry', 'Splunk', 'Okta', 'Auth0', 'CyberArk', 'CrowdStrike', 'Cloudflare', 'AWS', 'DigitalOcean', 
    'Heroku', 'Netlify', 'Contentful', 'Strapi', 'Sanity.io', 'Algolia', 'Twitch', 'Discord', 'Telegram', 
    'WhatsApp', 'Mailchimp', 'SendGrid', 'Postmark', 'Intercom', 'Drift', 'Gainsight', 'Looker', 'ThoughtSpot',
    'SAP', 'Workday', 'ServiceNow', 'Atlassian', 'GitLab', 'Bitbucket', 'Jenkins', 'CircleCI', 'Terraform',
    'Ansible', 'Puppet', 'Chef', 'Kubernetes', 'Docker', 'Postman', 'Swagger', 'GraphQL'
];

class SystemConnector {
    protected name: string;
    protected status: 'online' | 'offline' | 'degraded' = 'offline';
    protected telNexus: ArtificialIntelTelemetryNexus;
    protected lastPing: number = 0;

    constructor(name: string) {
        this.name = name;
        this.telNexus = ArtificialIntelTelemetryNexus.getInst();
    }

    public async healthCheck(): Promise<{ status: string; latency: number }> {
        const start = Date.now();
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
        const latency = Date.now() - start;
        this.lastPing = latency;
        this.status = latency > 120 ? 'degraded' : 'online';
        this.telNexus.log('DBG', `Health check for ${this.name}`, { status: this.status, latency });
        return { status: this.status, latency };
    }
    
    public getStatus() {
        return { name: this.name, status: this.status, lastPing: this.lastPing };
    }
}

class FinancialConnector extends SystemConnector {
    public async fetchTransactions(accountId: string, range: any) {
        this.telNexus.log('INF', `Fetching transactions from ${this.name}`, { accountId, range });
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
        return { count: Math.floor(Math.random() * 1000), totalValue: Math.random() * 500000 };
    }
}
class CloudInfraConnector extends SystemConnector {
    public async getComputeUsage() {
        this.telNexus.log('INF', `Getting compute usage from ${this.name}`);
        await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 200));
        return { instances: Math.floor(Math.random() * 50), cpuUtilization: Math.random() * 100 };
    }
}
class DevopsConnector extends SystemConnector {
    public async getRecentCommits(repo: string) {
        this.telNexus.log('INF', `Getting commits from ${this.name}`, { repo });
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 150));
        return { commitCount: Math.floor(Math.random() * 50) };
    }
}
class CrmConnector extends SystemConnector {
    public async getNewLeads(period: any) {
        this.telNexus.log('INF', `Getting new leads from ${this.name}`, { period });
        await new Promise(resolve => setTimeout(resolve, 180 + Math.random() * 250));
        return { leadCount: Math.floor(Math.random() * 200) };
    }
}

class IntegrationFabric {
    private static inst: IntegrationFabric;
    public connectors: { [name: string]: SystemConnector } = {};
    private telNexus: ArtificialIntelTelemetryNexus;

    private constructor() {
        this.telNexus = ArtificialIntelTelemetryNexus.getInst();
        this.initializeConnectors();
    }
    
    public static getInst(): IntegrationFabric {
        if (!IntegrationFabric.inst) {
            IntegrationFabric.inst = new IntegrationFabric();
        }
        return IntegrationFabric.inst;
    }
    
    private initializeConnectors() {
        ALL_INTEGRATIONS.forEach(name => {
            if (['Plaid', 'Modern Treasury', 'Citibank', 'MARQETA', 'Stripe', 'PayPal'].includes(name)) {
                this.connectors[name] = new FinancialConnector(name);
            } else if (['Azure', 'Google Cloud', 'AWS', 'Supabase', 'Vercel'].includes(name)) {
                this.connectors[name] = new CloudInfraConnector(name);
            } else if (['GitHub', 'GitLab', 'Bitbucket', 'Jenkins'].includes(name)) {
                this.connectors[name] = new DevopsConnector(name);
            } else if (['Salesforce', 'Oracle', 'HubSpot', 'Zendesk'].includes(name)) {
                this.connectors[name] = new CrmConnector(name);
            } else {
                this.connectors[name] = new SystemConnector(name);
            }
        });
        this.telNexus.log('INF', `${Object.keys(this.connectors).length} system connectors initialized in IntegrationFabric.`);
    }

    public async runAllHealthChecks() {
        const results = await Promise.all(
            Object.values(this.connectors).map(c => c.healthCheck())
        );
        const summary = {
            online: results.filter(r => r.status === 'online').length,
            degraded: results.filter(r => r.status === 'degraded').length,
            offline: results.filter(r => r.status === 'offline').length,
        };
        this.telNexus.log('INF', 'Completed full integration health check.', summary);
        return summary;
    }
}


class ArtificialIntelPolicyMatrix {
    private static inst: ArtificialIntelPolicyMatrix;
    private telNexus: ArtificialIntelTelemetryNexus;
    private anltxCore: ArtificialIntelAnalyticsCore;
    private cogStore: ArtificialIntelCognitiveStore;
    private policies: any[] = [];
  
    private constructor() {
        this.telNexus = ArtificialIntelTelemetryNexus.getInst();
        this.anltxCore = ArtificialIntelAnalyticsCore.getInst();
        this.cogStore = ArtificialIntelCognitiveStore.getInst();
        this.telNexus.log('INF', "AIPolicyMatrix Online: Compliance Enforcement Protocols Loaded.");
        this.hydratePolicies();
    }
  
    public static getInst(): ArtificialIntelPolicyMatrix {
        if (!ArtificialIntelPolicyMatrix.inst) {
            ArtificialIntelPolicyMatrix.inst = new ArtificialIntelPolicyMatrix();
        }
        return ArtificialIntelPolicyMatrix.inst;
    }
  
    private hydratePolicies() {
        this.policies = [
            { id: 'AML-TXN-001A', name: 'High-Value Transaction Monitoring', status: 'ACTIVE', thresholds: { txnVal: 10000, dailyTxnCount: 5 } },
            { id: 'KYC-ONBRD-002B', name: 'Enhanced Due Diligence Onboarding', status: 'ACTIVE', verifLvl: 'HIGH' },
        ];
        this.telNexus.log('INF', `Hydrated ${this.policies.length} compliance policies.`);
    }
  
    public createProactiveSignals(anltxData: ComplianceAnalytics, decType: Decision__DecisionTypeEnum): string[] {
        this.telNexus.log('INF', `Generating proactive signals for ${decType}.`, { anltxData });
        const signals: string[] = [];
  
        if (decType === Decision__DecisionTypeEnum.TransactionMonitoring) {
            const pol = this.policies.find(p => p.id === 'AML-TXN-001A');
            if (pol && anltxData.falseNegative > 0) {
                signals.push(`CRITICAL SIGNAL (AML): ${anltxData.falseNegative} potentially unflagged high-risk transactions. Re-evaluate policy '${pol.id}' effectiveness.`);
            }
        } else if (decType === Decision__DecisionTypeEnum.UserOnboarding) {
            const pol = this.policies.find(p => p.id === 'KYC-ONBRD-002B');
            if (pol && anltxData.falseNegative > 0) {
                signals.push(`HIGH-RISK SIGNAL (KYC): ${anltxData.falseNegative} potentially fraudulent onboardings bypassed controls. Review policy '${pol.id}' immediately.`);
            }
        }
  
        const fcstMetrics = this.anltxCore.forecastComplianceMetrics(anltxData);
        if (fcstMetrics.falseNegative > anltxData.falseNegative * 1.4) {
            signals.push(`PREDICTIVE SIGNAL: AI forecasts a significant rise in false negatives for ${decType} in the next cycle. Recommend preemptive control strengthening.`);
        }
  
        return signals;
    }
}
  
class ArtificialIntelDecisionFabric {
    private static inst: ArtificialIntelDecisionFabric;
    private telNexus: ArtificialIntelTelemetryNexus;
    private cogStore: ArtificialIntelCognitiveStore;

    private constructor() {
        this.telNexus = ArtificialIntelTelemetryNexus.getInst();
        this.cogStore = ArtificialIntelCognitiveStore.getInst();
        this.telNexus.log('INF', "AIDecisionFabric Online: Intelligent Action Orchestration Enabled.");
    }

    public static getInst(): ArtificialIntelDecisionFabric {
        if (!ArtificialIntelDecisionFabric.inst) {
            ArtificialIntelDecisionFabric.inst = new ArtificialIntelDecisionFabric();
        }
        return ArtificialIntelDecisionFabric.inst;
    }

    public determineOptimalQuery(initQ: QParams, err: any | null, qName: string): { q: QParams; msg?: string; act?: 'retry' | 'adjust' | 'fallback' } {
        this.telNexus.log('INF', `Optimizing query strategy for ${qName}.`, { initQ, err });

        if (err) {
            const retries = this.cogStore.get(`q_${qName}_retries`, 0);
            if (retries < MAX_RETRY_ATTEMPTS) {
                this.cogStore.set(`q_${qName}_retries`, retries + 1);
                return { q: initQ, msg: 'AI detected a transient error. Retrying operation.', act: 'retry' };
            } else {
                const adjQ: QParams = { ts: { inTheLast: { unit: TimeUnitEnum.Weeks, amount: 1 }, format: TimeFormatEnum.Duration } };
                this.cogStore.set(`q_${qName}_retries`, 0);
                return { q: adjQ, msg: 'AI adjusted query to a shorter period due to persistent failures.', act: 'adjust' };
            }
        }
        
        this.cogStore.set(`q_${qName}_retries`, 0);
        return { q: initQ };
    }

    public presentOptimalView<T>(
        dat: T | null | undefined,
        isLoading: boolean,
        err: any | undefined,
        fallbackUI: React.ReactNode,
        contentRenderer: (dat: T) => React.ReactNode,
    ): React.ReactNode {
        if (isLoading) {
            return (
                <div className="h-screenr flex items-center justify-center text-indigo-500">
                    <Icon iconName="settings" size="m" className="animate-spin mr-3" />
                    AI Core is synthesizing data streams...
                </div>
            );
        }

        if (err) {
            this.telNexus.log('ERR', 'Content presentation failed due to data error.', { err });
            return (
                <div className="h-screenr flex flex-col items-center justify-center text-red-600 bg-red-50 p-4 rounded-lg">
                    <Icon iconName="report" size="m" className="mb-2" />
                    <p className="font-semibold">AI Core detected a data synchronization error.</p>
                    <p className="text-xs text-gray-600 mt-1">Details: {err.message || 'Unknown error'}</p>
                </div>
            );
        }

        if (!dat) {
            return fallbackUI;
        }

        return contentRenderer(dat);
    }
}

const CASES_NAV_LINK = "/compliance/cases";
const DEFAULT_TIME_AMT = "1";

const DEFAULT_Q: QParams = {
  ts: {
    inTheLast: { unit: TimeUnitEnum.Months, amount: DEFAULT_TIME_AMT },
    format: TimeFormatEnum.Duration,
  },
};

const DOUGHNUT_CHART_COLORS = [
  { color: colors.sky["300"], key: "Accurate" },
  { color: colors.sky["500"], key: "False Positive" },
  { color: colors.sky["700"], key: "False Negative" },
];

const TIME_FILTER_OPTS = [
  { value: "lastWeek", label: "Past 7 Days", dateRange: { inTheLast: { unit: TimeUnitEnum.Weeks, amount: DEFAULT_TIME_AMT }}},
  { value: "lastMonth", label: "Past 30 Days", dateRange: { inTheLast: { unit: TimeUnitEnum.Months, amount: DEFAULT_TIME_AMT }}},
  { value: "lastQuarter", label: "Past Quarter", dateRange: { inTheLast: { unit: TimeUnitEnum.Months, amount: 3 }}},
];

const SEARCH_COMP_DEFS = [
  { key: "created_at", field: "created_at", label: "Timeframe", options: TIME_FILTER_OPTS, dateTimeType: true, component: DateSearch, validateRange: true, maxDate: moment().format("YYYY-MM-DD")},
];

function transformToDoughnutData(elem: ComplianceAnalytics): DoughnutChartDataSchema[] {
  return ArtificialIntelAnalyticsCore.getInst().augmentDoughnutChartData(elem);
}

function isComplianceDataEmpty(dat: ComplianceAnalytics): boolean {
  if (!dat) return true;
  const empty = (dat?.accurate === 0 && dat?.falseNegative === 0 && dat?.falsePositive === 0 && dat?.totalDecisions === 0);
  if (empty) ArtificialIntelTelemetryNexus.getInst().log('INF', 'Compliance data stream is empty for the specified timeframe.', { dat });
  return empty;
}

function RegulatoryIntelligenceDashboard() {
  const telNexus = ArtificialIntelTelemetryNexus.getInst();
  const heurProc = ArtificialIntelHeuristicProcessor.getInst();
  const cogStore = ArtificialIntelCognitiveStore.getInst();
  const anltxCore = ArtificialIntelAnalyticsCore.getInst();
  const polMatrix = ArtificialIntelPolicyMatrix.getInst();
  const decFabric = ArtificialIntelDecisionFabric.getInst();
  const fabric = IntegrationFabric.getInst();

  const [q, setQ] = useState<QParams>(cogStore.get<QParams>('lastRegIntelQ', DEFAULT_Q));
  const [aiSignals, setAiSignals] = useState<string[]>([]);
  const [fcstUsrMetrics, setFcstUsrMetrics] = useState<ComplianceAnalytics | null>(null);
  const [fcstTxnMetrics, setFcstTxnMetrics] = useState<ComplianceAnalytics | null>(null);
  const [integrationStatus, setIntegrationStatus] = useState<any>(null);


  const { data: decAnData, loading: decAnLoading, error: decAnError, refetch: refetchDecAn } = useDecisionAnalyticsViewQuery({
    variables: { createdAt: dateSearchMapper(q.ts) },
    onError: (err) => {
      telNexus.log('ERR', 'Decision analytics stream failed.', { error: err.message });
      const { q: optQ, act } = decFabric.determineOptimalQuery(q, err, 'DecAn');
      if (act === 'retry') refetchDecAn();
      else if (act === 'adjust') setQ(optQ);
      setAiSignals(p => [...p, `AI Signal: Data stream for Decision Analytics is unstable. ${err.message}`]);
    }
  });

  const { data: cmpAnTxnData, loading: cmpAnTxnLoading, error: cmpAnTxnError, refetch: refetchCmpAnTxn } = useComplianceAnalyticsViewQuery({
    variables: { createdAt: dateSearchMapper(q.ts), decisionType: Decision__DecisionTypeEnum.TransactionMonitoring },
    onError: (err) => {
      telNexus.log('ERR', 'Transaction compliance stream failed.', { error: err.message });
      const { q: optQ, act } = decFabric.determineOptimalQuery(q, err, 'CmpAnTxn');
      if (act === 'retry') refetchCmpAnTxn();
      else if (act === 'adjust') setQ(optQ);
      setAiSignals(p => [...p, `AI Signal: Data stream for Transaction Compliance is unstable. ${err.message}`]);
    }
  });

  const { data: cmpAnUsrData, loading: cmpAnUsrLoading, error: cmpAnUsrError, refetch: refetchCmpAnUsr } = useComplianceAnalyticsViewQuery({
    variables: { createdAt: dateSearchMapper(q.ts), decisionType: Decision__DecisionTypeEnum.UserOnboarding },
    onError: (err) => {
      telNexus.log('ERR', 'User onboarding compliance stream failed.', { error: err.message });
      const { q: optQ, act } = decFabric.determineOptimalQuery(q, err, 'CmpAnUsr');
      if (act === 'retry') refetchCmpAnUsr();
      else if (act === 'adjust') setQ(optQ);
      setAiSignals(p => [...p, `AI Signal: Data stream for User Compliance is unstable. ${err.message}`]);
    }
  });

  const decAn: DecisionAnalytics = decAnLoading || !decAnData || decAnError ? ({} as DecisionAnalytics) : decAnData.decisionAnalytics;
  const cmpAnUsrs: DoughnutChartDataSchema[] = cmpAnUsrLoading || !cmpAnUsrData || cmpAnUsrError ? [] : transformToDoughnutData(cmpAnUsrData.complianceAnalytics);
  const cmpAnTxns: DoughnutChartDataSchema[] = cmpAnTxnLoading || !cmpAnTxnData || cmpAnTxnError ? [] : transformToDoughnutData(cmpAnTxnData.complianceAnalytics);

  React.useEffect(() => {
    cogStore.set('lastRegIntelQ', q);
    telNexus.log('INF', 'Regulatory query updated and persisted in AICognitiveStore.', { q });

    let allSignals: string[] = [];

    if (cmpAnTxnData?.complianceAnalytics) {
        const signals = polMatrix.createProactiveSignals(cmpAnTxnData.complianceAnalytics, Decision__DecisionTypeEnum.TransactionMonitoring);
        allSignals = [...allSignals, ...signals];
        setFcstTxnMetrics(anltxCore.forecastComplianceMetrics(cmpAnTxnData.complianceAnalytics));
    }
    if (cmpAnUsrData?.complianceAnalytics) {
        const signals = polMatrix.createProactiveSignals(cmpAnUsrData.complianceAnalytics, Decision__DecisionTypeEnum.UserOnboarding);
        allSignals = [...allSignals, ...signals];
        setFcstUsrMetrics(anltxCore.forecastComplianceMetrics(cmpAnUsrData.complianceAnalytics));
    }
    if (decAnData?.decisionAnalytics) {
        const anomalies = anltxCore.findDecisionAnomalies(decAnData.decisionAnalytics, { baseApprRate: cogStore.get('baseApprRate', 80) });
        if (anomalies.length > 0) {
            allSignals = [...allSignals, ...anomalies.map(a => `ANOMALY DETECTED: ${a}`)];
        }
    }
    
    setAiSignals(p => [...new Set([...p.filter(s => !s.startsWith("ANOMALY") && !s.startsWith("CRITICAL") && !s.startsWith("HIGH-RISK")), ...allSignals])]);
    
    const signalClearance = setTimeout(() => {
        setAiSignals(p => p.filter(s => !s.includes("unstable")));
    }, 20000);

    return () => clearTimeout(signalClearance);

  }, [q, decAnData, cmpAnTxnData, cmpAnUsrData, telNexus, cogStore, polMatrix, anltxCore]);

  React.useEffect(() => {
    const suggested = heurProc.recommendDateSpan(DEFAULT_Q.ts || {});
    if (JSON.stringify(suggested) !== JSON.stringify(DEFAULT_Q.ts)) {
        setQ(p => ({ ...p, ts: suggested }));
    }
    fabric.runAllHealthChecks().then(setIntegrationStatus);
  }, []);

  const renderAiSignals = () => {
    if (aiSignals.length === 0) return null;
    return (
      <div className="mb-6 space-y-3">
        {aiSignals.map((sig, idx) => (
          <div key={idx} className={`flex items-start p-3 border rounded-lg shadow-md ${sig.includes('CRITICAL') ? 'bg-red-100 border-red-500 text-red-900' : sig.includes('ANOMALY') || sig.includes('HIGH-RISK') ? 'bg-amber-100 border-amber-500 text-amber-900' : 'bg-blue-100 border-blue-400 text-blue-900'}`}>
            <Icon iconName="hub" size="s" color="currentColor" className="mr-3 mt-1 flex-shrink-0" />
            <p className="text-sm font-semibold">{sig}</p>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <>
      <SearchContainer
        defaultSearchComponents={SEARCH_COMP_DEFS}
        query={q}
        updateQuery={(fUpd: QParams) => {
          setQ({ ...q, ...fUpd });
          telNexus.recordMetric('qChangeManual', 1, { newQ: fUpd });
        }}
      />

      {renderAiSignals()}

      <div className="grid grid-flow-row gap-8">
        {decAn && (
          <ExpandableCard heading="Holistic Decision Metrics" className="border-l-4 border-purple-500">
            {decFabric.presentOptimalView(
              decAnData, decAnLoading, decAnError,
              <div className="h-28 flex items-center justify-center text-gray-500">No holistic decision metrics available.</div>,
              (d) => (
                <div className="grid w-full grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 text-left">
                  <div className="text-sm font-semibold text-gray-600">Total Decisions</div>
                  <div className="text-sm font-semibold text-gray-600">Approval %</div>
                  <div className="text-sm font-semibold text-gray-600">Automation %</div>
                  <div className="text-sm font-semibold text-gray-600">Open Cases</div>
                  <div className="text-2xl font-mono">{d.decisionAnalytics.total}</div>
                  <div className="text-2xl font-mono">{d.decisionAnalytics.approvalRate}%</div>
                  <div className="text-2xl font-mono">{d.decisionAnalytics.automatedDecisionsRate}%</div>
                  <div className="text-2xl font-mono">
                    {d.decisionAnalytics.openCases}
                    <div className="mt-1 text-sm">
                      <a href={CASES_NAV_LINK} className="text-indigo-600 hover:underline" rel="noreferrer">
                        Investigate Cases <Icon iconName="launch" size="s" color="currentColor" alignment="baseline" />
                      </a>
                    </div>
                  </div>
                </div>
              )
            )}
          </ExpandableCard>
        )}
        <div className="grid grid-flow-row gap-4">
          <p className="text-lg font-bold flex items-center text-gray-800">
            <Icon iconName="group_add" size="m" color="currentColor" className="mr-2 text-purple-500" />
            Identity Verification Analytics
            {fcstUsrMetrics && (
              <span className="ml-5 text-xs text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full flex items-center font-medium">
                <Icon iconName="query_stats" size="s" className="mr-1.5" />
                AI Forecast: FN {fcstUsrMetrics.falseNegative} (Next Cycle)
              </span>
            )}
          </p>
          <div className="grid gap-4 mint-xl:grid-cols-2">
            <ComplianceUserOnboardingsWidget titleClassName="text-gray-600 text-sm font-semibold" />
            <ExpandableCard heading="" className="relative h-full px-6 py-4">
              {decFabric.presentOptimalView(
                cmpAnUsrData?.complianceAnalytics, cmpAnUsrLoading, cmpAnUsrError,
                <div className="h-screenr flex items-center justify-center text-gray-500 flex-col">
                  <p>No identity verification data for this timeframe.</p>
                  <button onClick={() => setQ(p => ({ ...p, ts: heurProc.recommendDateSpan(p.ts || {}) }))} className="mt-3 text-indigo-600 font-semibold hover:underline">
                    Apply AI Timeframe Suggestion
                  </button>
                </div>,
                (d) => (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <h1 className="text-sm font-semibold text-gray-600">Decision Accuracy</h1>
                      <div className="text-3xl font-bold">{d.decisionAccuracy}%</div>
                      <div className="grid grid-cols-2 gap-y-2 pt-8 text-sm">
                        <div className="font-medium">Accurate</div><div>{d.accurate}</div>
                        <div className="font-medium">False Positive</div><div>{d.falsePositive}</div>
                        <div className="font-medium">False Negative</div><div>{d.falseNegative}</div>
                      </div>
                      <p className="text-xs text-gray-700 mt-auto border-t pt-3 font-mono bg-gray-50 p-2 rounded">
                        {heurProc.craftInsight(d, 'usrOnboard')}
                      </p>
                    </div>
                    <div className="relative w-full text-center min-h-[200px]">
                      <PieChart data={cmpAnUsrs} nameKey="lbl" dataKey="val" dataMapping={DOUGHNUT_CHART_COLORS} innerRadius={60} outerRadius={90} />
                    </div>
                  </div>
                )
              )}
            </ExpandableCard>
          </div>
        </div>
        <div className="grid grid-flow-row gap-4">
          <p className="text-lg font-bold flex items-center text-gray-800">
            <Icon iconName="sync_alt" size="m" color="currentColor" className="mr-2 text-purple-500" />
            Transaction Flow Analytics
            {fcstTxnMetrics && (
              <span className="ml-5 text-xs text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full flex items-center font-medium">
                <Icon iconName="query_stats" size="s" className="mr-1.5" />
                AI Forecast: FN {fcstTxnMetrics.falseNegative} (Next Cycle)
              </span>
            )}
          </p>
          <div className="grid gap-4 mint-xl:grid-cols-2">
            <ComplianceTransactionMonitoringWidget titleClassName="text-gray-600 text-sm font-semibold" />
            <ExpandableCard heading="" className="relative h-full px-6 py-4">
              {decFabric.presentOptimalView(
                cmpAnTxnData?.complianceAnalytics, cmpAnTxnLoading, cmpAnTxnError,
                <div className="h-screenr flex items-center justify-center text-gray-500 flex-col">
                  <p>No transaction flow data for this timeframe.</p>
                   <button onClick={() => setQ(p => ({ ...p, ts: heurProc.recommendDateSpan(p.ts || {}) }))} className="mt-3 text-indigo-600 font-semibold hover:underline">
                    Apply AI Timeframe Suggestion
                  </button>
                </div>,
                (d) => (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <h1 className="text-sm font-semibold text-gray-600">Decision Accuracy</h1>
                      <div className="text-3xl font-bold">{d.decisionAccuracy}%</div>
                      <div className="grid grid-cols-2 gap-y-2 pt-8 text-sm">
                        <div className="font-medium">Accurate</div><div>{d.accurate}</div>
                        <div className="font-medium">False Positive</div><div>{d.falsePositive}</div>
                        <div className="font-medium">False Negative</div><div>{d.falseNegative}</div>
                      </div>
                      <p className="text-xs text-gray-700 mt-auto border-t pt-3 font-mono bg-gray-50 p-2 rounded">
                        {heurProc.craftInsight(d, 'txnMon')}
                      </p>
                    </div>
                    <div className="relative w-full text-center min-h-[200px]">
                      <PieChart data={cmpAnTxns} nameKey="lbl" dataKey="val" dataMapping={DOUGHNUT_CHART_COLORS} innerRadius={60} outerRadius={90} />
                    </div>
                  </div>
                )
              )}
            </ExpandableCard>
          </div>
        </div>
        <ExpandableCard heading="System Integration Fabric Status" initiallyExpanded={false}>
            {integrationStatus ? (
                <div className="p-4">
                    <div className="flex items-center space-x-8 mb-4">
                        <div className="flex items-center text-green-600"><Icon iconName="check_circle" className="mr-2" /> {integrationStatus.online} Online</div>
                        <div className="flex items-center text-amber-600"><Icon iconName="hourglass_top" className="mr-2" /> {integrationStatus.degraded} Degraded</div>
                        <div className="flex items-center text-red-600"><Icon iconName="cancel" className="mr-2" /> {integrationStatus.offline} Offline</div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
                        {Object.values(fabric.connectors).map((c: SystemConnector) => {
                            const { name, status, lastPing } = c.getStatus();
                            const color = status === 'online' ? 'text-green-700' : status === 'degraded' ? 'text-amber-700' : 'text-red-700';
                            return (
                                <div key={name} className={`flex items-center p-1 rounded bg-gray-50 border ${color}`}>
                                    <Icon iconName={status === 'online' ? 'link' : 'link_off'} size="s" className="mr-1.5"/>
                                    <span className="font-semibold">{name}</span>
                                    {status !== 'offline' && <span className="ml-auto text-gray-500">{lastPing}ms</span>}
                                </div>
                            )
                        })}
                    </div>
                </div>
            ) : (
                <div className="h-20 flex items-center justify-center text-gray-500">
                    <Icon iconName="sync" className="animate-spin mr-2" /> Checking integration health...
                </div>
            )}
        </ExpandableCard>
      </div>
    </>
  );
}

export default RegulatoryIntelligenceDashboard;