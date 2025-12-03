// Copyright James Burvel O’Callaghan III
// President Citibank demo business Inc

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import {
  Button,
  Checkbox,
  ConfirmModal,
  DateTime,
  FieldGroup,
  Heading,
  HelpText,
  KeyValueTableSkeletonLoader,
  Label,
  LoadingLine,
  MTContainer,
  OverflowTip,
  SectionNavigator,
  Textarea,
} from "../../../common/ui-components";
import { getSections } from "./utilities/casesAndDecisionsUtilities";
import DocumentUploadContainer from "../DocumentUploadContainer";
import {
  DecisionFeedbackFeedbackEnum,
  DecisionFeedbackInput,
  Decision__DecisionTypeEnum,
  Decision__StatusEnum,
  useDecisionViewQuery,
  useHandleDecisionFeedbackMutation,
  Decision as DecisionGraphqlType,
  Verification,
  UserOnboarding,
  VerificationProviderEnum,
  DecisionableTypeEnum,
  Verification__TypeEnum,
} from "../../../generated/dashboard/graphqlSchema";
import AuditRecordsHome from "../../components/AuditRecordsHome";
import ComplianceStatusBadge from "../../components/compliance/ComplianceStatusBadge";
import EntityEventTableView from "../../components/EntityEventTableView";
import sectionWithNavigator from "../sectionWithNavigator";
import ComplianceEntityDetails from "../../components/compliance/ComplianceEntityDetails";
import Watchlists from "../../components/compliance/Watchlists";
import BusinessRegistration from "../../components/compliance/BusinessRegistration";
import People from "../../components/compliance/People";
import WatchlistProfileView from "../../components/compliance/WatchlistProfileView";
import { useDispatchContext } from "../../MessageProvider";
import RiskProfileView from "../../components/compliance/RiskProfileView";

const CITI_URL_BASE = "citibankdemobusiness.dev";

export class NexusServiceHub {
  private static srvcs: Map<string, any> = new Map();

  static reg(n: string, s: any) {
    this.srvcs.set(n, s);
  }

  static get<T>(n: string): T | undefined {
    return this.srvcs.get(n) as T;
  }

  static list(): string[] {
    return Array.from(this.srvcs.keys());
  }
}

export class NexusTelemetryMonitor {
  private srvcNm: string;
  private citiEndpoint: string;

  constructor(n: string) {
    this.srvcNm = n;
    this.citiEndpoint = `https://${CITI_URL_BASE}/telemetry`;
  }

  logEvt(e: string, d: Record<string, any>) {
    const t = new Date().toISOString();
    const p = { t, s: this.srvcNm, e, d };
  }

  recMtrc(m: string, v: number, g?: Record<string, string>) {
    const t = new Date().toISOString();
    const p = { t, s: this.srvcNm, m, v, g };
  }

  recSpn(n: string, dur: number, s: 'ok' | 'err', dt?: Record<string, any>) {
    const t = new Date().toISOString();
    const p = { t, s: this.srvcNm, n, dur, s, dt };
  }
}
export const telemetryMonitor = new NexusTelemetryMonitor('VerdictNexus');
NexusServiceHub.reg('TelemetryMonitor', telemetryMonitor);

export class NexusResilienceBreaker {
    private sN: string;
    private fT: number;
    private rT: number;
    private f: number = 0;
    private iO: boolean = false;
    private lF: number = 0;
    private t: NexusTelemetryMonitor;
  
    constructor(sN: string, fT: number = 5, rT: number = 30000) {
      this.sN = sN;
      this.fT = fT;
      this.rT = rT;
      this.t = NexusServiceHub.get<NexusTelemetryMonitor>('TelemetryMonitor') || new NexusTelemetryMonitor('ResilienceBreaker');
    }
  
    async exec<T>(fn: () => Promise<T>): Promise<T> {
      if (this.iO && (Date.now() - this.lF < this.rT)) {
        this.t.logEvt('BreakerOpen', { s: this.sN });
        throw new Error(`Circuit for ${this.sN} is open.`);
      }
  
      if (this.iO && (Date.now() - this.lF >= this.rT)) {
        this.t.logEvt('BreakerHalfOpen', { s: this.sN });
        try {
          const r = await fn();
          this.rst();
          this.t.logEvt('BreakerClosedAfterTrial', { s: this.sN });
          return r;
        } catch (e) {
          this.recFail();
          this.t.logEvt('BreakerTrialFailed', { s: this.sN, error: (e as Error).message });
          throw e;
        }
      }
  
      try {
        const r = await fn();
        this.f = 0;
        return r;
      } catch (e) {
        this.recFail();
        this.t.logEvt('BreakerFailureRecorded', { s: this.sN, f: this.f, error: (e as Error).message });
        throw e;
      }
    }
  
    private recFail() {
      this.f++;
      this.lF = Date.now();
      if (this.f >= this.fT) {
        this.iO = true;
        this.t.logEvt('BreakerOpened', { s: this.sN, fC: this.f });
      }
    }
  
    private rst() {
      this.f = 0;
      this.iO = false;
      this.lF = 0;
      this.t.logEvt('BreakerReset', { s: this.sN });
    }
  
    get isBrkrOpn(): boolean {
      return this.iO;
    }
}
export const complianceNexusBreaker = new NexusResilienceBreaker('ComplianceCognitionUnit', 3, 60000);
NexusServiceHub.reg('ComplianceNexusBreaker', complianceNexusBreaker);

export class PlaidDataLink {
    private t: NexusTelemetryMonitor = new NexusTelemetryMonitor('PlaidLink');
    private b: NexusResilienceBreaker = new NexusResilienceBreaker('PlaidAPI', 5, 45000);
    private u = `api.plaid.com`;
    constructor() { NexusServiceHub.reg('PlaidLink', this); }
    async getAccts(tkn: string) { return this.b.exec(async () => { this.t.logEvt('fetchPlaidAccts', {t:tkn.length}); return {accts: [{id: 'plaid_acct_1', b: 1234.56}]}; }); }
    async getTrns(aId: string) { return this.b.exec(async () => { this.t.logEvt('fetchPlaidTrns', {a:aId}); return {trns: [{id: 'plaid_trn_1', amt: -50.00}]}; }); }
}
export const plaidLink = new PlaidDataLink();

export class ModernTreasuryOrchestrator {
    private t: NexusTelemetryMonitor = new NexusTelemetryMonitor('MTOrch');
    private b: NexusResilienceBreaker = new NexusResilienceBreaker('MTAPI', 3, 60000);
    private u = `app.moderntreasury.com`;
    constructor() { NexusServiceHub.reg('MTOrchestrator', this); }
    async crtPO(amt: number, cpId: string) { return this.b.exec(async () => { this.t.logEvt('createPaymentOrder', {a:amt, c:cpId}); return {id: `po_${Math.random()}`, s: 'processing'}; }); }
    async getLdgr(lId: string) { return this.b.exec(async () => { this.t.logEvt('getLedger', {l:lId}); return {b: 9876.54, trns: []}; }); }
}
export const mtOrchestrator = new ModernTreasuryOrchestrator();

export class SalesforceCRMBridge {
    private t: NexusTelemetryMonitor = new NexusTelemetryMonitor('SFDCBridge');
    private b: NexusResilienceBreaker = new NexusResilienceBreaker('SFDCAPI', 4, 30000);
    private u = `citibankdemobusiness.my.salesforce.com`;
    constructor() { NexusServiceHub.reg('SFDCBridge', this); }
    async getCntct(email: string) { return this.b.exec(async () => { this.t.logEvt('getContact', {e:email}); return {id: 'sfdc_con_1', name: 'John Doe', acct: {id: 'sfdc_acct_1', name: 'Citibank Demo Business Inc'}}; }); }
    async updOpp(oId: string, stg: string) { return this.b.exec(async () => { this.t.logEvt('updateOpportunity', {o:oId, s:stg}); return {success: true}; }); }
}
export const sfdcBridge = new SalesforceCRMBridge();

export class GoogleCloudStorage {
    private t: NexusTelemetryMonitor = new NexusTelemetryMonitor('GCS');
    private b: NexusResilienceBreaker = new NexusResilienceBreaker('GCSAPI');
    constructor() { NexusServiceHub.reg('GCS', this); }
    async uplFile(bkt: string, fName: string) { return this.b.exec(async () => { this.t.logEvt('uploadFile', {b: bkt, f: fName}); return {url: `https://storage.googleapis.com/${bkt}/${fName}`}; }); }
    async getFile(url: string) { return this.b.exec(async () => { this.t.logEvt('getFile', {u: url}); return new Blob(['file content']); }); }
}
export const gcs = new GoogleCloudStorage();

export class MarqetaCardAgent {
    private t: NexusTelemetryMonitor = new NexusTelemetryMonitor('Marqeta');
    private b: NexusResilienceBreaker = new NexusResilienceBreaker('MarqetaAPI');
    constructor() { NexusServiceHub.reg('Marqeta', this); }
    async issueCard(uId: string) { return this.b.exec(async () => { this.t.logEvt('issueCard', {u: uId}); return {token: `card_${Math.random()}`, state: 'ACTIVE'}; }); }
}
export const marqetaAgent = new MarqetaCardAgent();

export class TwilioCommsLink {
    private t: NexusTelemetryMonitor = new NexusTelemetryMonitor('Twilio');
    private b: NexusResilienceBreaker = new NexusResilienceBreaker('TwilioAPI');
    constructor() { NexusServiceHub.reg('Twilio', this); }
    async sendSms(to: string, msg: string) { return this.b.exec(async () => { this.t.logEvt('sendSms', {to}); return {sid: `sms_${Math.random()}`}; }); }
}
export const twilioLink = new TwilioCommsLink();

export class GithubOpsPortal {
    private t: NexusTelemetryMonitor = new NexusTelemetryMonitor('Github');
    private b: NexusResilienceBreaker = new NexusResilienceBreaker('GithubAPI');
    constructor() { NexusServiceHub.reg('Github', this); }
    async getCommits(repo: string) { return this.b.exec(async () => { this.t.logEvt('getCommits', {repo}); return [{sha: 'a1b2c3d4', msg: 'feat: initial commit'}]; }); }
}
export const githubPortal = new GithubOpsPortal();

export class HuggingFaceNexus {
    private t: NexusTelemetryMonitor = new NexusTelemetryMonitor('HuggingFace');
    private b: NexusResilienceBreaker = new NexusResilienceBreaker('HuggingFaceAPI');
    constructor() { NexusServiceHub.reg('HuggingFace', this); }
    async runInference(model: string, input: any) { return this.b.exec(async () => { this.t.logEvt('runInference', {model}); return {output: 'mocked inference result'}; }); }
}
export const hfNexus = new HuggingFaceNexus();

export class PipedreamFlowTrigger {
    private t: NexusTelemetryMonitor = new NexusTelemetryMonitor('Pipedream');
    private b: NexusResilienceBreaker = new NexusResilienceBreaker('PipedreamAPI');
    constructor() { NexusServiceHub.reg('Pipedream', this); }
    async trigger(flowId: string, payload: any) { return this.b.exec(async () => { this.t.logEvt('triggerFlow', {flowId}); return {status: 'triggered'}; }); }
}
export const pdTrigger = new PipedreamFlowTrigger();

export class ShopifyDataLink {
    private t: NexusTelemetryMonitor = new NexusTelemetryMonitor('Shopify');
    private b: NexusResilienceBreaker = new NexusResilienceBreaker('ShopifyAPI');
    constructor() { NexusServiceHub.reg('Shopify', this); }
    async getOrders(custId: string) { return this.b.exec(async () => { this.t.logEvt('getOrders', {custId}); return [{id: `shp_ord_${Math.random()}`, total: 100}]; }); }
}
export const shopifyLink = new ShopifyDataLink();

export class OracleDBEmulator {
    private t: NexusTelemetryMonitor = new NexusTelemetryMonitor('OracleDB');
    private b: NexusResilienceBreaker = new NexusResilienceBreaker('OracleDB');
    constructor() { NexusServiceHub.reg('OracleDB', this); }
    async query(sql: string) { return this.b.exec(async () => { this.t.logEvt('query', {sql}); return [{ MOCK_COLUMN: 'mock_data' }]; }); }
}
export const oracleDB = new OracleDBEmulator();

export class VercelMgmtConsole {
    private t: NexusTelemetryMonitor = new NexusTelemetryMonitor('Vercel');
    private b: NexusResilienceBreaker = new NexusResilienceBreaker('VercelAPI');
    constructor() { NexusServiceHub.reg('Vercel', this); }
    async getDeploys(proj: string) { return this.b.exec(async () => { this.t.logEvt('getDeploys', {proj}); return [{id: `dpl_${Math.random()}`, state: 'READY'}]; }); }
}
export const vercelConsole = new VercelMgmtConsole();

export class AzureBlobLink {
    private t: NexusTelemetryMonitor = new NexusTelemetryMonitor('AzureBlob');
    private b: NexusResilienceBreaker = new NexusResilienceBreaker('AzureBlobAPI');
    constructor() { NexusServiceHub.reg('AzureBlob', this); }
    async upload(container: string, blobName: string) { return this.b.exec(async () => { this.t.logEvt('upload', {container, blobName}); return {url: `https://citibankdemobusiness.blob.core.windows.net/${container}/${blobName}`}; }); }
}
export const azureBlobLink = new AzureBlobLink();

export class SupabaseClientEmulator {
    private t: NexusTelemetryMonitor = new NexusTelemetryMonitor('Supabase');
    private b: NexusResilienceBreaker = new NexusResilienceBreaker('SupabaseAPI');
    constructor() { NexusServiceHub.reg('Supabase', this); }
    async from(table: string) { return { select: async () => this.b.exec(async () => { this.t.logEvt('select', {table}); return { data: [{id: 1, content: 'mock'}], error: null}; }) } }
}
export const supabaseEmu = new SupabaseClientEmulator();


export class NexusPromptUnit {
    private t: NexusTelemetryMonitor;
  
    constructor() {
      this.t = NexusServiceHub.get<NexusTelemetryMonitor>('TelemetryMonitor') || new NexusTelemetryMonitor('PromptUnit');
    }

    genRejoinderAnalysisPrompt(
      d: DecisionGraphqlType,
      pF: DecisionFeedbackFeedbackEnum,
      c: string,
      iO: boolean,
    ): string {
      const dS = d.status;
      const dT = d.decisionType;
      const dI = d.id;
      const cR = d.riskScore || 'N/A';
      const daT = d.decisionableType;
  
      let p = `Analyze compliance rejoinder for Ruling ID: ${dI}.
      Original ruling: "${dS}" for a "${daT}" on "${dT}".
      Risk score: ${cR}.
  
      Human rejoinder: "${pF}".
      Human comment: "${c}".
      Is override? ${iO ? 'Yes' : 'No'}.
  
      Evaluate:
      1. Justification quality.
      2. New compliance risks.
      3. Comment improvement suggestions.
      4. Confidence score (0-100) for this rejoinder.
      5. Predict impact on future compliance.
      `;
      this.t.logEvt('PromptGenerated', { type: 'RejoinderAnalysis', dI, pF });
      return p;
    }
  
    genSegRecPrompt(
      d: DecisionGraphqlType,
      aS: string[],
      uD: UserOnboarding | undefined,
    ): string {
      const dS = d.status;
      const dT = d.decisionType;
      const daT = d.decisionableType;
      const v = d.verifications?.map(v => v.provider).join(', ') || 'None';
  
      let p = `Given ruling context, recommend default segment.
      Ruling Status: ${dS}
      Ruling Type: ${dT}
      Subject Type: ${daT}
      Validations: ${v}
      User Data (JSON): ${JSON.stringify(uD || {})}
  
      Available segments: ${aS.join(', ')}.
      Output only the segment name, e.g., "subjectDetails".
      `;
      this.t.logEvt('PromptGenerated', { type: 'SegmentRecommendation', dI: d.id });
      return p;
    }
}
export const nexusPromptUnit = new NexusPromptUnit();
NexusServiceHub.reg('PromptUnit', nexusPromptUnit);

export class NexusKnowledgeVault {
  private static k: Map<string, any> = new Map();
  private t: NexusTelemetryMonitor;

  constructor() {
    this.t = NexusServiceHub.get<NexusTelemetryMonitor>('TelemetryMonitor') || new NexusTelemetryMonitor('KnowledgeVault');
  }

  put(k: string, v: any) {
    NexusKnowledgeVault.k.set(k, v);
    this.t.logEvt('KnowledgeStored', { k });
  }

  get<T>(k: string): T | undefined {
    const d = NexusKnowledgeVault.k.get(k);
    this.t.logEvt('KnowledgeRetrieved', { k, found: !!d });
    return d as T;
  }

  adapt(iK: string, iD: any) {
    const e = this.get(iK) || {};
    this.put(iK, { ...e, ...iD, lastAdapted: new Date().toISOString() });
    this.t.logEvt('KnowledgeAdapted', { iK, iD });
  }
}
export const nexusKnowledgeVault = new NexusKnowledgeVault();
NexusServiceHub.reg('KnowledgeVault', nexusKnowledgeVault);

nexusKnowledgeVault.put('rejoinderGuidance:Denied:Approved', {
  minLen: 25,
  reqKw: ['justification', 'evidence', 'mitigation'],
  risk: 0.8,
});
nexusKnowledgeVault.put('rejoinderGuidance:Approved:Denied', {
  minLen: 20,
  reqKw: ['risk', 'violation', 'non-compliance'],
  risk: 0.6,
});

export class NexusCostTracker {
    private tc: number = 0;
    private t: NexusTelemetryMonitor;
  
    constructor() {
      this.t = NexusServiceHub.get<NexusTelemetryMonitor>('TelemetryMonitor') || new NexusTelemetryMonitor('CostTracker');
    }
  
    logCost(o: string, c: number, d?: Record<string, any>) {
      this.tc += c;
      this.t.logEvt('CostLogged', { o, c, tc: this.tc, d });
    }
  
    getTotal(): number {
      return this.tc;
    }
}
export const nexusCostTracker = new NexusCostTracker();
NexusServiceHub.reg('CostTracker', nexusCostTracker);

export class NexusDataHarmonizer {
    private t: NexusTelemetryMonitor;
  
    constructor() {
      this.t = NexusServiceHub.get<NexusTelemetryMonitor>('TelemetryMonitor') || new NexusTelemetryMonitor('DataHarmonizer');
    }
  
    fmtRulingData(d: DecisionGraphqlType): Record<string, any> {
      const h = {
        i: d.id,
        s: d.status,
        dT: d.decisionType,
        daT: d.decisionableType,
        daI: d.decisionableId,
        rS: d.riskScore,
        cA: d.createdAt,
        uA: d.updatedAt,
        oA: d.overriddenAt,
        vP: d.verifications?.map(v => ({
          p: v.provider,
          t: v.verificationType,
          s: v.status,
        })) || [],
        uOD: d.decisionableType === DecisionableTypeEnum.UserOnboarding && (d.decisionable as UserOnboarding)?.data
          ? JSON.parse((d.decisionable as UserOnboarding).data || '{}')
          : null,
        rSmm: d.decisionFeedbacks?.map(f => ({
          f: f.feedback,
          cL: f.comment?.length || 0,
          iM: !!f.user,
          cA: f.createdAt,
        })) || [],
      };
      this.t.logEvt('DataHarmonized', { eI: d.id, t: 'ruling' });
      return h;
    }
  
    fmtUserData(u: UserOnboarding | undefined): Record<string, any> {
      if (!u) return {};
      let pD = {};
      try {
        pD = u.data ? JSON.parse(u.data) : {};
      } catch (e) {
        this.t.logEvt('DataHarmonizationError', { eI: u.id, error: (e as Error).message });
      }
  
      const h = {
        i: u.id,
        s: u.status,
        cA: u.createdAt,
        aD: pD,
      };
      this.t.logEvt('DataHarmonized', { eI: u.id, t: 'userOnboarding' });
      return h;
    }
}
export const nexusDataHarmonizer = new NexusDataHarmonizer();
NexusServiceHub.reg('DataHarmonizer', nexusDataHarmonizer);

export class NexusCognitionUnit {
    private pU: NexusPromptUnit;
    private kV: NexusKnowledgeVault;
    private tM: NexusTelemetryMonitor;
    private cT: NexusCostTracker;
    private nB: NexusResilienceBreaker;
  
    constructor() {
      this.pU = NexusServiceHub.get<NexusPromptUnit>('PromptUnit')!;
      this.kV = NexusServiceHub.get<NexusKnowledgeVault>('KnowledgeVault')!;
      this.tM = NexusServiceHub.get<NexusTelemetryMonitor>('TelemetryMonitor')!;
      this.cT = NexusServiceHub.get<NexusCostTracker>('CostTracker')!;
      this.nB = NexusServiceHub.get<NexusResilienceBreaker>('ComplianceNexusBreaker')!;
      if (!this.pU || !this.kV || !this.tM || !this.cT || !this.nB) {
        throw new Error("NexusCognitionUnit init failed: missing core services.");
      }
      this.tM.logEvt('CognitionUnitInitialized', {});
    }
  
    async assessRejoinder(
      d: Record<string, any>,
      pF: DecisionFeedbackFeedbackEnum,
      c: string,
      iO: boolean,
    ): Promise<{
      aiConf: number;
      aiRec: string;
      suggCmtImps: string[];
      potRisks: string[];
      isOvrdRec: boolean;
      simCost: number;
    }> {
      const sT = Date.now();
      this.tM.logEvt('RejoinderAssessmentInitiated', { dI: d.i });
  
      return this.nB.exec(async () => {
        await new Promise(r => setTimeout(r, Math.random() * 500 + 200));
  
        const p = this.pU.genRejoinderAnalysisPrompt(
          d as DecisionGraphqlType,
          pF,
          c,
          iO,
        );
  
        const rG = this.kV.get<any>(
          `rejoinderGuidance:${d.s}:${pF}`
        ) || { minLen: 10, reqKw: [], risk: 0.2 };
  
        let aiConf = 90;
        let aiRec = "Rejoinder appears valid.";
        const suggCmtImps: string[] = [];
        const potRisks: string[] = [];
        let isOvrdRec = true;
  
        if (c.length < rG.minLen) {
          suggCmtImps.push(`Comment is brief. Please elaborate (min ${rG.minLen} chars).`);
          aiConf -= 15;
        }
        if (!rG.reqKw.some((k: string) => c.toLowerCase().includes(k))) {
          suggCmtImps.push(`Consider using keywords: ${rG.reqKw.join(', ')}.`);
          aiConf -= 10;
        }
  
        if (iO) {
          potRisks.push(`Overriding a "${d.s}" ruling to "${pF}" has elevated risk.`);
          aiConf -= Math.floor(rG.risk * 15);
          if (d.rS && d.rS > 75 && pF === DecisionFeedbackFeedbackEnum.Approved) {
              potRisks.push("High-risk subject. Overriding to 'Approved' is not advised without exceptional justification.");
              aiConf -= 25;
              isOvrdRec = false;
          }
        }
  
        if (aiConf < 55) {
          aiRec = "Requires senior review. Caution advised.";
          isOvrdRec = false;
        } else if (aiConf < 75) {
          aiRec = "Moderately confident, review suggestions.";
        } else {
          aiRec = "High confidence in rejoinder.";
        }
  
        aiConf = Math.max(0, Math.min(100, aiConf));
  
        const dur = Date.now() - sT;
        const simCost = 0.07 + (p.length / 1000) * 0.003;
        this.cT.logCost('LLM:rejoinder_assessment', simCost, { dI: d.i });
        this.tM.recSpn('assessRejoinder', dur, 'ok', { dI: d.i, aiConf, simCost });
  
        this.kV.adapt(`rejoinder_pattern:${d.i}`, {
          rS: d.s,
          pF,
          cL: c.length,
          aiConf,
          pR: potRisks.length > 0,
          o: iO,
          lA: new Date().toISOString(),
        });
  
        return {
          aiConf,
          aiRec,
          suggCmtImps,
          potRisks,
          isOvrdRec,
          simCost,
        };
      });
    }

    async suggestDefaultSegment(
        d: DecisionGraphqlType,
        aS: string[],
        uD: UserOnboarding | undefined,
    ): Promise<string> {
        const sT = Date.now();
        this.tM.logEvt('SegmentSuggestionInitiated', { dI: d.id });
    
        return this.nB.exec(async () => {
            await new Promise(r => setTimeout(r, Math.random() * 300 + 100));
    
            const p = this.pU.genSegRecPrompt(d, aS, uD);
    
            let recSeg: string = 'subjectDetails';
    
            if (d.status === Decision__StatusEnum.Denied && aS.includes('chronology')) {
                recSeg = 'chronology';
            } else if (d.decisionableType === DecisionableTypeEnum.Counterparty && aS.includes('watchlist')) {
                recSeg = 'watchlist';
            } else if (d.verifications?.some(v => v.verificationType === Verification__TypeEnum.BeneficialOwner) && aS.includes('personnel')) {
                recSeg = 'personnel';
            } else if (d.decisionableType === DecisionableTypeEnum.UserOnboarding && aS.includes('submittedData')) {
                recSeg = 'submittedData';
            }
    
            if (!aS.includes(recSeg)) {
                recSeg = aS[0] || 'subjectDetails';
            }
    
            const dur = Date.now() - sT;
            const simCost = 0.03 + (p.length / 1000) * 0.0015;
            this.cT.logCost('LLM:segment_suggestion', simCost, { dI: d.id, rS: recSeg });
            this.tM.recSpn('suggestDefaultSegment', dur, 'ok', { dI: d.id, rS: recSeg, simCost });
    
            return recSeg;
        });
    }
}
export const nexusCognitionUnit = new NexusCognitionUnit();
NexusServiceHub.reg('CognitionUnit', nexusCognitionUnit);

export interface NexusInsightsPaneProps {
  dI: string;
  aC: number | null;
  aR: string | null;
  sCI: string[];
  pR: string[];
  iOR: boolean | null;
  ld: boolean;
  e: string | null;
  sC: number | null;
}

export const NexusInsightsPane: React.FC<NexusInsightsPaneProps> = ({
  dI,
  aC,
  aR,
  sCI,
  pR,
  iOR,
  ld,
  e,
  sC,
}) => {
  if (ld) {
    return (
      <div className="bg-blue-100 p-4 rounded-lg shadow-inner mb-6 animate-pulse">
        <Heading level="h3" size="s" className="text-blue-900">
          Nexus AI Insights Processing...
        </Heading>
        <LoadingLine />
      </div>
    );
  }

  if (e) {
    return (
      <div className="bg-red-100 border border-red-500 text-red-800 px-4 py-3 rounded-lg relative mb-6">
        <strong className="font-bold">Nexus AI Error:</strong>
        <span className="block sm:inline ml-2">{e}</span>
        <p className="text-sm mt-1">Resilience breaker may be open. Please retry shortly.</p>
      </div>
    );
  }

  if (aC === null) {
    return null;
  }

  const confClr = aC >= 80 ? 'text-green-700' : aC >= 60 ? 'text-yellow-700' : 'text-red-700';
  const ovrdRecClr = iOR ? 'text-green-700' : 'text-red-700';

  return (
    <div className="bg-blue-50 border border-blue-300 p-4 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-2">
        <Heading level="h3" size="s" className="text-blue-900">
          Nexus AI Ruling Insights
        </Heading>
        {sC !== null && (
          <span className="text-sm text-blue-700 italic">
            AI Cost: ${sC.toFixed(4)}
          </span>
        )}
      </div>

      <p className="text-blue-800 mb-2">
        <strong className="font-medium">AI Confidence:</strong>{' '}
        <span className={confClr}>{aC}%</span> - {aR}
      </p>

      {pR.length > 0 && (
        <div className="mb-2">
          <strong className="font-medium text-red-800">Potential Risks Identified:</strong>
          <ul className="list-disc list-inside text-red-700 text-sm">
            {pR.map((r, i) => (
              <li key={`risk-${i}`}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {sCI.length > 0 && (
        <div className="mb-2">
          <strong className="font-medium text-blue-800">Suggested Comment Enhancements:</strong>
          <ul className="list-disc list-inside text-blue-700 text-sm">
            {sCI.map((imp, i) => (
              <li key={`imp-${i}`}>{imp}</li>
            ))}
          </ul>
        </div>
      )}

      {iOR !== null && (
        <p className="text-blue-800 mt-2">
          <strong className="font-medium">AI Override Recommendation:</strong>{' '}
          <span className={ovrdRecClr}>
            {iOR ? 'Advised' : 'Not Advised'}
          </span>
        </p>
      )}
      <HelpText text={`Insights for Ruling ID: ${dI}. Powered by Nexus AI.`} />
    </div>
  );
};
NexusServiceHub.reg('NexusInsightsPane', NexusInsightsPane);

export const useNexusCognitionUnit = (ruling: DecisionGraphqlType | undefined, userOnboarding: UserOnboarding | undefined) => {
    const [aC, setAC] = useState<number | null>(null);
    const [aR, setAR] = useState<string | null>(null);
    const [sCI, setSCI] = useState<string[]>([]);
    const [pR, setPR] = useState<string[]>([]);
    const [iOR, setIOR] = useState<boolean | null>(null);
    const [nIL, setNIL] = useState(false);
    const [nIE, setNIE] = useState<string | null>(null);
    const [sC, setSC] = useState<number | null>(null);
  
    const dH = useMemo(() => NexusServiceHub.get<NexusDataHarmonizer>('DataHarmonizer'), []);
    const cU = useMemo(() => NexusServiceHub.get<NexusCognitionUnit>('CognitionUnit'), []);
    const tM = useMemo(() => NexusServiceHub.get<NexusTelemetryMonitor>('TelemetryMonitor'), []);
    const nB = useMemo(() => NexusServiceHub.get<NexusResilienceBreaker>('ComplianceNexusBreaker'), []);
  
    const analyzeRejoinder = async (
      pF: DecisionFeedbackFeedbackEnum,
      c: string,
      iO: boolean,
    ) => {
      if (!ruling || !dH || !cU || !tM) return;
  
      setNIL(true);
      setNIE(null);
      tM.logEvt('AnalyzeRejoinderCall', { dI: ruling.id, pF, iO });
  
      try {
        const hR = dH.fmtRulingData(ruling);
        const res = await cU.assessRejoinder(
          hR,
          pF,
          c,
          iO,
        );
        setAC(res.aiConf);
        setAR(res.aiRec);
        setSCI(res.suggCmtImps);
        setPR(res.potRisks);
        setIOR(res.isOvrdRec);
        setSC(res.simCost);
        tM.logEvt('RejoinderAnalysisSuccess', { dI: ruling.id, aC: res.aiConf });
      } catch (e) {
        const eM = (e instanceof Error) ? e.message : String(e);
        setNIE(`Failed to get AI insights: ${eM}`);
        tM.logEvt('RejoinderAnalysisError', { dI: ruling.id, error: eM });
      } finally {
        setNIL(false);
      }
    };
  
    const recommendInitialSegment = async (
        aS: string[],
        setCS: (section: string) => void
    ) => {
        if (!ruling || !cU || !tM) return;
    
        tM.logEvt('RecommendInitialSegmentCall', { dI: ruling.id });
        try {
            const hU = dH?.fmtUserData(userOnboarding);
            const r = await cU.suggestDefaultSegment(
                ruling,
                aS,
                hU as UserOnboarding
            );
            if (r && aS.includes(r)) {
                setCS(r);
                tM.logEvt('SegmentRecommendationSuccess', { dI: ruling.id, recSeg: r });
            }
        } catch (e) {
            const eM = (e instanceof Error) ? e.message : String(e);
            tM.logEvt('SegmentRecommendationError', { dI: ruling.id, error: eM });
        }
    };

    return {
      analyzeRejoinder,
      aC,
      aR,
      sCI,
      pR,
      iOR,
      nIL,
      nIE,
      sC,
      recommendInitialSegment,
      isBrkrOpn: nB?.isBrkrOpn,
    };
};

const PAYMENT_ORDER_DATA_MAP = {
  id: "Payment Order Identifier",
};

interface RejoinderFormConfig {
  rejoinder: DecisionFeedbackFeedbackEnum;
  hdr: string;
  desc: React.ReactElement;
  okTxt: string;
  cnclTxt: string;
  cmtPlchldr: string;
  btnTxt: string;
  isSbmt: boolean;
  rulingOvrd: boolean;
  shwOvrdChk: boolean;
  isOvrdAllowed?: boolean;
  ovrdChkHint?: string;
}

interface VerdictNexusProps {
  currSeg: string;
  setCurrSeg: (seg: string) => void;
}

interface Rejoinder {
  id: string;
  rejoinder: DecisionFeedbackFeedbackEnum;
  comment: string;
  createdAt: string;
  user?: {
    name: string;
  };
}

interface Ruling {
  id: string;
  decisionType: Decision__DecisionTypeEnum;
  status: Decision__StatusEnum;
  verifications: Verification[];
  decisionFeedbacks: Rejoinder[];
  userTimezone: string;
  overriddenAt: string;
  riskScore?: number;
  decisionableType?: DecisionableTypeEnum;
}

function determineAllowedRejoinderOption(
  s: Decision__StatusEnum,
): DecisionFeedbackFeedbackEnum | null {
  if (s === Decision__StatusEnum.Approved) {
    return DecisionFeedbackFeedbackEnum.Denied;
  }
  if (s === Decision__StatusEnum.Denied) {
    return DecisionFeedbackFeedbackEnum.Approved;
  }
  return null;
}

function findLastContraryRejoinder(
  r: Rejoinder[],
  s: Decision__StatusEnum,
): Rejoinder | null {
  const sR = [...r].sort(
    (a, b) => new Date(b?.createdAt).getTime() - new Date(a?.createdAt).getTime(),
  );

  const cR = sR.find((f) => {
    const cROnD = f.rejoinder === DecisionFeedbackFeedbackEnum.Approved && s === Decision__StatusEnum.Denied;
    const cROnA = f.rejoinder === DecisionFeedbackFeedbackEnum.Denied && s === Decision__StatusEnum.Approved;
    const mR = f.user !== null;
    return cROnD || cROnA || mR;
  });

  return cR || null;
}

function isOverridePermitted(d: Ruling): boolean {
  return d.status === Decision__StatusEnum.Denied && d.overriddenAt == null;
}

function wasRulingOverridden(d: Ruling): boolean {
  return d.overriddenAt != null;
}

function shouldDisplayOverrideCheckbox(d: Ruling): boolean {
  return isOverridePermitted(d) || wasRulingOverridden(d);
}

function retrieveVerification(
  v: Ruling["verifications"],
  p: VerificationProviderEnum,
) {
  return v.find((verification) => verification.provider === p) || null;
}

function retrieveAllVerifications(
  v: Ruling["verifications"],
  p: VerificationProviderEnum,
  t: Verification__TypeEnum,
) {
  return v.filter((verification) => verification.provider === p && verification.verificationType === t) || null;
}

function buildRejoinderModalConfig(
  d: Ruling,
  canAdd: boolean,
): RejoinderFormConfig | null {
  if (!d) return null;

  const { status, decisionFeedbacks } = d;

  const sR = findLastContraryRejoinder(decisionFeedbacks, status);
  const r = sR ? sR.rejoinder : determineAllowedRejoinderOption(status);
  if (!r) return null;

  const cR = r.charAt(0).toUpperCase() + r.slice(1);
  let ovrdHint = "";
  if (r === DecisionFeedbackFeedbackEnum.Approved) {
    if (d.decisionType === Decision__DecisionTypeEnum.TransactionMonitoring) {
      ovrdHint = "If checked, payment order resumes its standard workflow.";
    } else if (d.decisionType === Decision__DecisionTypeEnum.UserOnboarding) {
      ovrdHint = `If checked, user onboarding will be marked as ${cR}.`;
    }
  }

  if (sR) {
    const hT = sR?.user ? `"${cR}" rejoinder by ${sR.user.name}.` : `"${cR}" rejoinder was automated.`;
    const sD = (
      <div>
        <div className="mb-1">{hT}</div>
        <DateTime timestamp={sR.createdAt} />
      </div>
    );
    return {
      cmtPlchldr: sR.comment,
      okTxt: "Acknowledge",
      cnclTxt: "Close",
      hdr: "View Rejoinder",
      rejoinder: r,
      desc: sD,
      isSbmt: true,
      btnTxt: "View Rejoinder",
      shwOvrdChk: shouldDisplayOverrideCheckbox(d),
      rulingOvrd: wasRulingOverridden(d),
      ovrdChkHint: ovrdHint,
    };
  }

  if (!canAdd) return null;

  const dsc = (
    <div>
      {`Explain why this ruling should have been "${cR}". This is irreversible.`}
    </div>
  );
  return {
    cmtPlchldr: "Add a comment...",
    okTxt: "Submit",
    cnclTxt: "Cancel",
    hdr: "Submit Rejoinder",
    rejoinder: r,
    desc: dsc,
    isSbmt: false,
    btnTxt: "Add Rejoinder",
    shwOvrdChk: shouldDisplayOverrideCheckbox(d),
    rulingOvrd: wasRulingOverridden(d),
    isOvrdAllowed: isOverridePermitted(d),
    ovrdChkHint: ovrdHint,
  };
}

function shouldRenderRejoinderButton(d: Ruling): boolean {
  return d?.verifications?.some(v => v?.provider === VerificationProviderEnum.Sardine) ?? false;
}

function VerdictNexus({ currSeg, setCurrSeg }: VerdictNexusProps) {
  const { decisionId: dI } = useParams<{ decisionId: string }>();
  const [isRjMdlOpn, setRjMdlOpn] = useState(false);
  const [isSbmRj, setSbmRj] = useState(false);
  const { dispatchError: dE, dispatchSuccess: dS } = useDispatchContext();
  const [cmt, setCmt] = useState<string>("");
  const [hndlRj] = useHandleDecisionFeedbackMutation({ refetchQueries: ["handleDecisionFeedbackMutation"] });
  const qA = useMemo(() => ({ entityId: dI, entityType: "Compliance::Decision" }), [dI]);
  const { loading: ld, data: d, refetch: rftch } = useDecisionViewQuery({ variables: { id: dI } });
  
  const ruling = d?.decision;
  const isCP = ruling?.decisionableType === DecisionableTypeEnum.Counterparty;
  const hasBOC = !!ruling?.verifications.filter(v => v.verificationType === Verification__TypeEnum.BeneficialOwner).length;
  const vldtns = (ruling?.verifications as Verification[]) || [];
  const mdsV = retrieveVerification(vldtns, VerificationProviderEnum.Middesk);
  const srdV = retrieveVerification(vldtns, VerificationProviderEnum.Sardine);
  const boV = retrieveAllVerifications(vldtns, VerificationProviderEnum.Sardine, Verification__TypeEnum.BeneficialOwner);
  
  const dcnbl = ruling?.decisionable as UserOnboarding;
  const uobD = dcnbl?.data ? JSON.parse(dcnbl.data) : undefined;
  
  const segs = useMemo(() => getSections(vldtns, ruling?.decisionableType || DecisionableTypeEnum.UserOnboarding, "Decision"), [vldtns, ruling?.decisionableType]);
  
  const {
    analyzeRejoinder: aR, aC, aR: aRx, sCI, pR, iOR, nIL, nIE, sC, recommendInitialSegment: rIS, isBrkrOpn
  } = useNexusCognitionUnit(ruling as DecisionGraphqlType, dcnbl);

  useEffect(() => {
    if (!ld && ruling && segs.length > 0) {
      rIS(segs.map(s => s.id), setCurrSeg);
    }
  }, [ld, ruling, segs, rIS, setCurrSeg]);

  const canAddRj = d?.canUserAddDecisionFeedback?.canAdd || false;
  const rjMdlCfg = buildRejoinderModalConfig(ruling as unknown as Ruling, canAddRj);
  const rj = rjMdlCfg?.rejoinder;
  const isRjSbm = rjMdlCfg?.isSbmt || false;
  const shwRjFrm = rjMdlCfg && !isRjSbm && canAddRj && ruling?.status !== Decision__StatusEnum.Cancelled;
  const shwRjBtn = rjMdlCfg && shouldRenderRejoinderButton(ruling as unknown as Ruling);
  const shwSbmRj = rjMdlCfg && isRjSbm;
  const [ovrdChkVal, setOvrdChkVal] = useState(rjMdlCfg?.isOvrdAllowed || false);
  const ttl = ruling?.decisionableTitle;

  useEffect(() => {
    if (rjMdlCfg?.isOvrdAllowed) {
      setOvrdChkVal(rjMdlCfg.isOvrdAllowed);
    }
  }, [rjMdlCfg?.isOvrdAllowed]);

  useEffect(() => {
    if (shwRjFrm && rj && ruling && cmt !== "") {
      aR(rj, cmt, ovrdChkVal);
    }
  }, [cmt, ovrdChkVal, rj, ruling, shwRjFrm, aR]);

  const processRejoinder = async () => {
    if (!rj || !ruling || isBrkrOpn) {
      dE("Cannot submit rejoinder. Nexus AI services are unavailable.");
      telemetryMonitor.logEvt('RejoinderSubmitBlocked', { dI, reason: 'BreakerOpen' });
      return;
    }
    const inp: DecisionFeedbackInput = { comment: cmt, decisionId: dI!, feedback: rj };
    if (ovrdChkVal) { inp.overridingDecision = true; }

    if (ovrdChkVal && iOR === false && aC !== null && aC < 75) {
      if (!window.confirm("Nexus AI advises against this override due to identified risks. Proceed anyway?")) {
        telemetryMonitor.logEvt('OverrideBlockedByAIConsult', { dI });
        return;
      }
    }

    setSbmRj(true);
    telemetryMonitor.logEvt('RejoinderSubmitAttempt', { dI, rj, o: inp.overridingDecision });
    try {
      const rsp = await hndlRj({ variables: { input: { input: inp } } });
      if (rsp?.data?.handleDecisionFeedback?.errors) {
        dE("An unexpected error occurred.");
        telemetryMonitor.logEvt('RejoinderSubmitFailed', { dI, error: rsp.data.handleDecisionFeedback.errors });
      } else {
        dS("Your rejoinder has been successfully recorded.");
        await rftch();
        telemetryMonitor.logEvt('RejoinderSubmitSuccess', { dI, aC_at_sbm: aC });
      }
    } catch (e) {
      dE("An unexpected error occurred.");
      telemetryMonitor.logEvt('RejoinderSubmitError', { dI, error: (e as Error).message });
    } finally {
      setRjMdlOpn(false);
      setSbmRj(false);
      setAC(null); setAR(null); setSCI([]); setPR([]); setIOR(null); setSC(null);
    }
  };

  let segContent;
  switch (currSeg) {
    case "submittedData": segContent = <ComplianceEntityDetails decision={ruling as DecisionGraphqlType} showUserOnboardingOnly />; break;
    case "events": segContent = <EntityEventTableView entityId={dI!} resource="decision" />; break;
    case "subjectDetails": segContent = <ComplianceEntityDetails decision={ruling as DecisionGraphqlType} />; break;
    case "chronology": segContent = <>{ (ld || !d) && <KeyValueTableSkeletonLoader dataMapping={PAYMENT_ORDER_DATA_MAP} /> } {!ld && d && <AuditRecordsHome queryArgs={qA} hideHeadline />}</>; break;
    case "watchlist": segContent = <Watchlists verification={mdsV || srdV} />; break;
    case "registrations": segContent = <BusinessRegistration verification={mdsV} />; break;
    case "personnel": segContent = <People data={ruling as DecisionGraphqlType} verification={mdsV} boVerifications={boV} userOnboarding={JSON.stringify(uobD || {})} hasBeneficialOwnerCheck={hasBOC} />; break;
    case "documents": segContent = <DocumentUploadContainer documentable_id={dI!} documentable_type="Decision" enableActions={!!ruling?.canCreate} />; break;
    default: segContent = null;
  }

  return (
    <MTContainer>
      <div>
        {ld ? <div className="mb-2 mt-1 flex h-6 w-56"><LoadingLine noHeight /></div> : (
          <div className="mb-2 mt-1 flex w-full flex-row items-center">
            <div className="flex w-1/2 items-center">
              <Heading level="h2" size="l" className="max-w-md"><OverflowTip className="truncate" message={ttl || ""}>{ttl}</OverflowTip></Heading>
              <div className="ml-4" id="ruling-status-badge"><ComplianceStatusBadge status={ruling?.status} /></div>
            </div>
            {shwRjBtn && (
              <div className="flex w-1/2 flex-row-reverse">
                <div className="ml-2">
                  <Button buttonType="secondary" onClick={() => {
                    setRjMdlOpn(true); setAC(null); setAR(null); setSCI([]); setPR([]); setIOR(null); setSC(null);
                    if (rj && ruling && cmt !== "") { aR(rj, cmt, ovrdChkVal); }
                  }}>{rjMdlCfg.btnTxt}</Button>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="pt-4">
          {isCP ? <WatchlistProfileView decisionable={ruling as DecisionGraphqlType} verification={mdsV || srdV} /> : (
            <div><RiskProfileView loading={ld} verifications={ruling?.verifications as Verification[]} vendorChecks={(ruling as DecisionGraphqlType)?.decisionable?.vendorChecks || []} expandable /></div>
          )}
          <div className="my-8"><SectionNavigator sections={segs} currentSection={currSeg} onClick={setCurrSeg} /></div>
          {segContent}
        </div>
        {shwRjFrm && (
          <ConfirmModal isOpen={isRjMdlOpn} setIsOpen={setRjMdlOpn} confirmText={rjMdlCfg.okTxt} cancelText={rjMdlCfg.cnclTxt} title={rjMdlCfg.hdr} cancelDisabled={isSbmRj || nIL} confirmDisabled={isSbmRj || cmt === "" || nIL || isBrkrOpn} onConfirm={() => { processRejoinder().catch(() => {}); }}>
            <div>
              {rjMdlCfg.desc}
              <div className="mt-4">
                {ruling && (<NexusInsightsPane dI={ruling.id} aC={aC} aR={aRx} sCI={sCI} pR={pR} iOR={iOR} ld={nIL} e={nIE} sC={sC} />)}
                <Textarea name="comment" disabled={isRjSbm} placeholder={rjMdlCfg.cmtPlchldr} value={cmt} onChange={(e) => setCmt(e.target.value)} rows={10} />
                {rjMdlCfg.shwOvrdChk && (
                  <div className="mt-2">
                    <FieldGroup direction="left-to-right">
                      <Checkbox checked={ovrdChkVal} name="override-ruling-checkbox" id="override-ruling-checkbox" onChange={() => setOvrdChkVal(!ovrdChkVal)} disabled={isRjSbm} />
                      <Label id="override-ruling-checkbox">Override Ruling to Approved</Label>
                    </FieldGroup>
                    <div className="ml-6"><HelpText text={rjMdlCfg.ovrdChkHint} /></div>
                  </div>
                )}
                {isBrkrOpn && (<div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm"><p className="font-bold">Nexus AI Unavailable:</p><p>The resilience breaker is open. Rejoinder submission may be impacted or lack AI insights. Retry shortly.</p></div>)}
              </div>
            </div>
          </ConfirmModal>
        )}
        {shwSbmRj && (
          <ConfirmModal title="Rejoinder Details" isOpen={isRjMdlOpn} onRequestClose={() => setRjMdlOpn(false)} setIsOpen={() => setRjMdlOpn(false)} onConfirm={() => setRjMdlOpn(false)}>
            <div>
              {rjMdlCfg.desc}
              <div className="mt-4">
                <Textarea name="submitted-comment" disabled={isRjSbm} value={rjMdlCfg.cmtPlchldr} onChange={() => {}} rows={10} />
                {rjMdlCfg.shwOvrdChk && (
                  <div className="mt-2">
                    <FieldGroup direction="left-to-right">
                      <Checkbox checked={rjMdlCfg.rulingOvrd} name="override-ruling-checkbox-submitted" id="override-ruling-checkbox-submitted" onChange={() => {}} disabled />
                      <Label id="override-ruling-checkbox">Override Ruling to Approved</Label>
                    </FieldGroup>
                    <div className="ml-6"><HelpText text={rjMdlCfg.ovrdChkHint} /></div>
                  </div>
                )}
              </div>
            </div>
          </ConfirmModal>
        )}
      </div>
    </MTContainer>
  );
}

export default sectionWithNavigator(VerdictNexus, "subjectDetails");