// Copyright James Burvel O’Callaghan IV
// Chief Executive Officer, Citibank demo business Inc

import React, { useState, useEffect, useCallback, createContext, useContext, useMemo, useRef } from "react";
import moment from "moment-timezone";
import {
  useBlockAllowEntitiesViewQuery,
  BlockAllowEntityActionsEnum,
  BlockAllowEntityTypesEnum,
  BlockAllowEntity,
  useDeleteBlockAllowEntityMutation,
} from "../../../generated/dashboard/graphqlSchema";
import {
  IndexTable,
  Button,
  ConfirmModal,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverPanel,
  ActionItem,
  SectionNavigator,
  NotificationBanner, 
} from "../../../common/ui-components";
import SearchContainer from "../SearchContainer";
import {
  FilterElements,
  BlockAllowEntityDataMap,
  QueryType,
  getBlockAllowEntitiesSearchComponents,
} from "../../../common/search_components/blockAllowEntitiesSearchComponents";
import CreateBlockAllowEntityModal from "./CreateBlockAllowEntityModal";
import { useDispatchContext } from "../../MessageProvider";

const CITI_DEMO_BIZ_BASE_URI = "https://api.citibankdemobusiness.dev/v1/";

export class DigitalEcosystemNexus {
  private static instance: DigitalEcosystemNexus;
  private registry: Record<string, any> = {};

  private constructor() {
    this.populateRegistry();
  }

  public static getInstance(): DigitalEcosystemNexus {
    if (!DigitalEcosystemNexus.instance) {
      DigitalEcosystemNexus.instance = new DigitalEcosystemNexus();
    }
    return DigitalEcosystemNexus.instance;
  }

  private populateRegistry() {
    const services = [
      { id: 'gemini', name: 'Google Gemini', category: 'AI_LLM', endpoint: 'gemini.googleapis.com', status: 'OPERATIONAL' },
      { id: 'chat_hot', name: 'ChatHOT Protocol', category: 'AI_LLM', endpoint: 'chathot.api/v3', status: 'OPERATIONAL' },
      { id: 'pipedream', name: 'Pipedream', category: 'AUTOMATION', endpoint: 'api.pipedream.com', status: 'OPERATIONAL' },
      { id: 'github', name: 'GitHub', category: 'VCS', endpoint: 'api.github.com', status: 'OPERATIONAL' },
      { id: 'hugging_face', name: 'Hugging Face', category: 'AI_ML_MODELS', endpoint: 'huggingface.co/api', status: 'OPERATIONAL' },
      { id: 'plaid', name: 'Plaid', category: 'FINTECH_API', endpoint: 'production.plaid.com', status: 'OPERATIONAL' },
      { id: 'modern_treasury', name: 'Modern Treasury', category: 'FINTECH_PAYMENTS', endpoint: 'app.moderntreasury.com/api', status: 'OPERATIONAL' },
      { id: 'google_drive', name: 'Google Drive', category: 'CLOUD_STORAGE', endpoint: 'www.googleapis.com/drive/v3', status: 'OPERATIONAL' },
      { id: 'one_drive', name: 'Microsoft OneDrive', category: 'CLOUD_STORAGE', endpoint: 'graph.microsoft.com/v1.0/me/drive', status: 'DEGRADED_PERFORMANCE' },
      { id: 'azure', name: 'Microsoft Azure', category: 'CLOUD_PLATFORM', endpoint: 'management.azure.com', status: 'OPERATIONAL' },
      { id: 'google_cloud', name: 'Google Cloud Platform', category: 'CLOUD_PLATFORM', endpoint: 'cloud.google.com/api', status: 'OPERATIONAL' },
      { id: 'supabase', name: 'Supabase', category: 'BACKEND_SERVICE', endpoint: 'api.supabase.io', status: 'OPERATIONAL' },
      { id: 'vercel', name: 'Vercel', category: 'HOSTING', endpoint: 'api.vercel.com', status: 'OPERATIONAL' },
      { id: 'salesforce', name: 'Salesforce', category: 'CRM', endpoint: 'login.salesforce.com', status: 'OPERATIONAL' },
      { id: 'oracle', name: 'Oracle Cloud', category: 'CLOUD_PLATFORM', endpoint: 'cloud.oracle.com', status: 'OPERATIONAL' },
      { id: 'marqeta', name: 'Marqeta', category: 'FINTECH_CARDS', endpoint: 'api.marqeta.com/v3', status: 'OPERATIONAL' },
      { id: 'citibank', name: 'Citibank API', category: 'BANKING', endpoint: 'api.citi.com', status: 'OPERATIONAL' },
      { id: 'shopify', name: 'Shopify', category: 'ECOMMERCE', endpoint: 'shopify.dev/api', status: 'OPERATIONAL' },
      { id: 'woocommerce', name: 'WooCommerce', category: 'ECOMMERCE', endpoint: 'api.woocommerce.com', status: 'OPERATIONAL' },
      { id: 'godaddy', name: 'GoDaddy', category: 'DOMAIN_HOSTING', endpoint: 'api.godaddy.com', status: 'OPERATIONAL' },
      { id: 'cpanel', name: 'cPanel', category: 'SERVER_MGMT', endpoint: 'api.cpanel.net', status: 'MAINTENANCE' },
      { id: 'adobe', name: 'Adobe Creative Cloud', category: 'CREATIVE_SUITE', endpoint: 'ims-na1.adobelogin.com/ims/token/v1', status: 'OPERATIONAL' },
      { id: 'twilio', name: 'Twilio', category: 'COMMUNICATIONS_API', endpoint: 'api.twilio.com', status: 'OPERATIONAL' },
      { id: 'aws', name: 'Amazon Web Services', category: 'CLOUD_PLATFORM', endpoint: 'aws.amazon.com/api', status: 'OPERATIONAL' },
      { id: 'stripe', name: 'Stripe', category: 'FINTECH_PAYMENTS', endpoint: 'api.stripe.com', status: 'OPERATIONAL' },
      { id: 'paypal', name: 'PayPal', category: 'FINTECH_PAYMENTS', endpoint: 'api.paypal.com', status: 'DEGRADED_PERFORMANCE' },
      { id: 'square', name: 'Square', category: 'FINTECH_POS', endpoint: 'connect.squareup.com', status: 'OPERATIONAL' },
      { id: 'adyen', name: 'Adyen', category: 'FINTECH_PAYMENTS', endpoint: 'adyen.com/api', status: 'OPERATIONAL' },
      { id: 'unit', name: 'Unit', category: 'BANKING_SERVICE', endpoint: 'api.s.unit.co', status: 'OPERATIONAL' },
      { id: 'treasury_prime', name: 'Treasury Prime', category: 'BANKING_SERVICE', endpoint: 'api.treasuryprime.com', status: 'OPERATIONAL' },
      { id: 'galileo', name: 'Galileo', category: 'FINTECH_PROCESSING', endpoint: 'api.galileo-ft.com', status: 'OPERATIONAL' },
      { id: 'fis', name: 'FIS', category: 'FINTECH_CORE', endpoint: 'api.fisglobal.com', status: 'OPERATIONAL' },
      { id: 'fiserv', name: 'Fiserv', category: 'FINTECH_CORE', endpoint: 'api.fiserv.com', status: 'OPERATIONAL' },
      { id: 'jack_henry', name: 'Jack Henry', category: 'FINTECH_CORE', endpoint: 'api.jackhenry.com', status: 'OPERATIONAL' },
      { id: 'digitalocean', name: 'DigitalOcean', category: 'CLOUD_PLATFORM', endpoint: 'api.digitalocean.com', status: 'OPERATIONAL' },
      { id: 'cloudflare', name: 'Cloudflare', category: 'CDN_SECURITY', endpoint: 'api.cloudflare.com', status: 'OPERATIONAL' },
      { id: 'netlify', name: 'Netlify', category: 'HOSTING', endpoint: 'api.netlify.com', status: 'OPERATIONAL' },
      { id: 'heroku', name: 'Heroku', category: 'PAAS', endpoint: 'api.heroku.com', status: 'OPERATIONAL' },
      { id: 'datadog', name: 'Datadog', category: 'MONITORING', endpoint: 'api.datadoghq.com', status: 'OPERATIONAL' },
      { id: 'new_relic', name: 'New Relic', category: 'MONITORING', endpoint: 'api.newrelic.com', status: 'OPERATIONAL' },
      { id: 'sentry', name: 'Sentry', category: 'ERROR_TRACKING', endpoint: 'sentry.io/api', status: 'OPERATIONAL' },
      { id: 'auth0', name: 'Auth0', category: 'IAM', endpoint: 'auth0.com/api/v2', status: 'OPERATIONAL' },
      { id: 'okta', name: 'Okta', category: 'IAM', endpoint: 'okta.com/api/v1', status: 'OPERATIONAL' },
      { id: 'slack', name: 'Slack', category: 'MESSAGING', endpoint: 'slack.com/api', status: 'OPERATIONAL' },
      { id: 'microsoft_teams', name: 'Microsoft Teams', category: 'MESSAGING', endpoint: 'graph.microsoft.com/v1.0/teams', status: 'OPERATIONAL' },
      { id: 'zoom', name: 'Zoom', category: 'VIDEO_CONFERENCING', endpoint: 'api.zoom.us/v2', status: 'OPERATIONAL' },
      { id: 'jira', name: 'Jira', category: 'PROJECT_MGMT', endpoint: 'your-domain.atlassian.net/rest/api/3', status: 'OPERATIONAL' },
      { id: 'trello', name: 'Trello', category: 'PROJECT_MGMT', endpoint: 'api.trello.com/1', status: 'OPERATIONAL' },
      { id: 'notion', name: 'Notion', category: 'PRODUCTIVITY', endpoint: 'api.notion.com/v1', status: 'OPERATIONAL' },
      { id: 'figma', name: 'Figma', category: 'DESIGN', endpoint: 'api.figma.com/v1', status: 'OPERATIONAL' },
      { id: 'mailchimp', name: 'Mailchimp', category: 'MARKETING_EMAIL', endpoint: 'api.mailchimp.com/3.0', status: 'OPERATIONAL' },
      { id: 'sendgrid', name: 'SendGrid', category: 'TRANSACTIONAL_EMAIL', endpoint: 'api.sendgrid.com/v3', status: 'OPERATIONAL' },
      { id: 'hubspot', name: 'HubSpot', category: 'CRM_MARKETING', endpoint: 'api.hubapi.com', status: 'OPERATIONAL' },
      { id: 'zendesk', name: 'Zendesk', category: 'CUSTOMER_SUPPORT', endpoint: 'your-subdomain.zendesk.com/api/v2', status: 'OPERATIONAL' },
      { id: 'snowflake', name: 'Snowflake', category: 'DATA_WAREHOUSE', endpoint: 'your-account.snowflakecomputing.com', status: 'OPERATIONAL' },
      { id: 'databricks', name: 'Databricks', category: 'DATA_AI', endpoint: 'your-workspace.cloud.databricks.com', status: 'OPERATIONAL' },
      { id: 'bigquery', name: 'Google BigQuery', category: 'DATA_WAREHOUSE', endpoint: 'bigquery.googleapis.com', status: 'OPERATIONAL' },
      { id: 'mongodb', name: 'MongoDB Atlas', category: 'DATABASE', endpoint: 'data.mongodb-api.com', status: 'OPERATIONAL' },
      { id: 'postgresql', name: 'PostgreSQL', category: 'DATABASE', endpoint: 'self-hosted', status: 'OPERATIONAL' },
      { id: 'redis', name: 'Redis', category: 'CACHE_DATABASE', endpoint: 'self-hosted', status: 'OPERATIONAL' },
      { id: 'kafka', name: 'Apache Kafka', category: 'EVENT_STREAMING', endpoint: 'self-hosted', status: 'OPERATIONAL' },
      { id: 'segment', name: 'Segment', category: 'CDP', endpoint: 'api.segment.io/v1', status: 'OPERATIONAL' },
      { id: 'mixpanel', name: 'Mixpanel', category: 'ANALYTICS', endpoint: 'api.mixpanel.com', status: 'OPERATIONAL' },
      { id: 'google_analytics', name: 'Google Analytics', category: 'ANALYTICS', endpoint: 'www.googleapis.com/analytics/v3', status: 'OPERATIONAL' },
      { id: 'launchdarkly', name: 'LaunchDarkly', category: 'FEATURE_FLAGS', endpoint: 'app.launchdarkly.com/api/v2', status: 'OPERATIONAL' },
      { id: 'docusign', name: 'DocuSign', category: 'ESIGNATURE', endpoint: 'www.docusign.net/restapi', status: 'OPERATIONAL' },
      { id: 'dropbox', name: 'Dropbox', category: 'CLOUD_STORAGE', endpoint: 'api.dropboxapi.com/2', status: 'OPERATIONAL' },
      { id: 'sap', name: 'SAP S/4HANA Cloud', category: 'ERP', endpoint: 'api.sap.com', status: 'OPERATIONAL' },
      { id: 'workday', name: 'Workday', category: 'HCM_ERP', endpoint: 'community.workday.com/api', status: 'OPERATIONAL' },
      { id: 'quickbooks', name: 'QuickBooks Online', category: 'ACCOUNTING', endpoint: 'quickbooks.intuit.com/v3', status: 'OPERATIONAL' },
      { id: 'xero', name: 'Xero', category: 'ACCOUNTING', endpoint: 'api.xero.com', status: 'OPERATIONAL' },
      { id: 'gusto', name: 'Gusto', category: 'HR_PAYROLL', endpoint: 'api.gusto.com', status: 'OPERATIONAL' },
    ];
    services.forEach(s => {
      this.registry[s.id] = {
        ...s,
        connect: async (p: any) => `Connected to ${s.name} with ${JSON.stringify(p)}`,
        query: async (q: any) => ({ service: s.name, query: q, result: `mock_result_${Math.random()}` }),
        lastHeartbeat: new Date().toISOString(),
        config: {
          timeout: 5000,
          retries: 3,
          apiVersion: 'latest',
          authMethod: 'OAUTH2',
          baseUri: `https://${s.endpoint}`
        }
      };
    });
  }

  public getService(id: string) {
    if (!this.registry[id]) throw new Error(`DigitalEcosystemNexus: Service ${id} not found.`);
    return this.registry[id];
  }

  public getAllServices() {
    return this.registry;
  }
}

export interface AetherialCognitionState {
  decisionLog: string[];
  systemEntropy: number;
  currentDirective: string;
  memory: Record<string, any>;
}

export class AetherialCognitionEngine {
  private state: AetherialCognitionState;
  private eventBus: Map<string, Function[]>;
  private ecosystem: DigitalEcosystemNexus;
  private telemetryBuffer: any[];

  constructor() {
    this.state = {
      decisionLog: [],
      systemEntropy: Math.random(),
      currentDirective: "Maximize regulatory compliance efficiency while minimizing operational friction for Citibank demo business Inc.",
      memory: {},
    };
    this.eventBus = new Map();
    this.ecosystem = DigitalEcosystemNexus.getInstance();
    this.telemetryBuffer = [];
    this.logTelemetry('engine.instantiated', { directive: this.state.currentDirective });
  }

  public logTelemetry(evt: string, d: any) {
    const p = {
      timestamp: new Date().toISOString(),
      event: evt,
      payload: d,
      entropy: this.state.systemEntropy,
      source: 'AetherialCognitionEngine'
    };
    this.telemetryBuffer.push(p);
    if (this.telemetryBuffer.length > 100) {
      this.flushTelemetry();
    }
  }

  private flushTelemetry() {
    console.log(`[Aetherial Telemetry Flush]: ${this.telemetryBuffer.length} events.`);
    this.telemetryBuffer = [];
  }

  public subscribe(evt: string, cb: Function) {
    if (!this.eventBus.has(evt)) {
      this.eventBus.set(evt, []);
    }
    this.eventBus.get(evt)?.push(cb);
  }

  public publish(evt: string, p: any) {
    this.logTelemetry('event.published', { eventName: evt });
    const cbs = this.eventBus.get(evt);
    if (cbs) {
      cbs.forEach(cb => {
        try {
          cb(p);
        } catch (e) {
          this.logTelemetry('event.handler.error', { eventName: evt, error: e.message });
        }
      });
    }
  }

  public async processDecision(ctx: Record<string, any>, dType: string): Promise<any> {
    const prmpt = `Directive: '${this.state.currentDirective}'. Decision Type: '${dType}'. Context: ${JSON.stringify(ctx)}. Last 5 decisions: ${this.state.decisionLog.slice(-5).join(', ')}.`;
    this.logTelemetry('decision.initiated', { type: dType, prompt_hash: prmpt.length });
    this.state.decisionLog.push(`[${new Date().toISOString()}] ${dType}`);

    try {
      const g = this.ecosystem.getService('gemini');
      const res = await g.query({ prompt: prmpt });
      this.state.systemEntropy = Math.random();
      this.memorize(`lastDecision_${dType}`, res);

      const simRes = {
        decision: `AI-derived outcome for ${dType}`,
        confidence: Math.random() * 0.2 + 0.78,
        rationale: `Analysis of context based on directive. Entropy at ${this.state.systemEntropy.toFixed(4)}.`,
        suggestions: [`Review entity group ${Math.floor(Math.random() * 100)}`, `Consider policy update for type ${Object.keys(PERMITTED_ENTITY_IDENTIFIERS)[Math.floor(Math.random()*5)]}`],
        riskScore: Math.random(),
        timestamp: new Date().toISOString(),
        flags: Math.random() > 0.8 ? ['HIGH_VELOCITY', 'UNUSUAL_GEO'] : ['NOMINAL']
      };

      this.logTelemetry('decision.success', { type: dType, confidence: simRes.confidence });
      this.publish('decision.complete', { type: dType, result: simRes });
      return simRes;
    } catch (e) {
      this.logTelemetry('decision.error', { type: dType, error: e.message });
      this.publish('decision.failed', { type: dType, error: e.message });
      throw new Error(`Cognitive decision process failed: ${e.message}`);
    }
  }

  public memorize(k: string, v: any) {
    this.state.memory[k] = v;
    this.logTelemetry('memory.write', { key: k });
  }

  public recall(k: string): any {
    this.logTelemetry('memory.read', { key: k });
    return this.state.memory[k];
  }
  
  public getAuditTrail() {
      return this.state.decisionLog;
  }
}

export interface AetherialCognitionContextType {
  aetherialEngine: AetherialCognitionEngine;
}

export const AetherialCognitionContext = createContext<AetherialCognitionContextType | null>(null);

export const useAetherialCognition = () => {
  const ctx = useContext(AetherialCognitionContext);
  if (!ctx) {
    throw new Error("useAetherialCognition must be used within an AetherialCognitionProvider");
  }
  return ctx;
};

export class ComplianceLogicMatrix {
    private engine: AetherialCognitionEngine;
    private currentDirective: string;

    constructor(e: AetherialCognitionEngine) {
        this.engine = e;
        this.currentDirective = "Execute compliance validation with zero-trust principles and predictive risk scoring.";
        this.engine.logTelemetry('ComplianceLogicMatrix.initialized', { directive: this.currentDirective });
    }

    public async verifyOperation(e: Partial<BlockAllowEntity>, op: string): Promise<{ ok: boolean; msg: string; risk?: number }> {
        const d = await this.engine.processDecision(
            { entity: e, operation: op, priorContext: this.engine.recall(`last_op_for_${e.value}`) },
            'complianceOperationValidation'
        );
        
        const isHighRisk = d?.riskScore > 0.85;
        if (isHighRisk) {
            this.engine.logTelemetry('ComplianceLogicMatrix.highRiskOp', { entity: e, op, risk: d.riskScore });
            return { ok: false, msg: `Aetherial Engine flagged high risk: ${d.rationale}`, risk: d.riskScore };
        }
        
        this.engine.memorize(`last_op_for_${e.value}`, { op, result: d.decision });
        return { ok: true, msg: `Aetherial Engine approved: ${d.decision}`, risk: d.riskScore };
    }

    public async generateIntel(entities: BlockAllowEntity[]): Promise<string[]> {
        const d = await this.engine.processDecision(
            { currentSet: entities.map(e => ({ t: e.type, v: e.value, a: e.action })) },
            'complianceMatrixOptimization'
        );
        this.engine.logTelemetry('ComplianceLogicMatrix.intelGenerated', { suggestions: d.suggestions?.length || 0 });
        return d.suggestions || ["Aetherial Engine suggests a full audit of all IP-based rules older than 90 days."];
    }

    public async scrutinizeEntity(e: BlockAllowEntity): Promise<{ report: string, markers: string[], rec: string, conf: number }> {
        const d = await this.engine.processDecision(
            { entityData: e, history: this.engine.recall(`scrutiny_history_${e.id}`) },
            'deepEntityComplianceScrutiny'
        );
        this.engine.memorize(`scrutiny_history_${e.id}`, d);
        this.engine.logTelemetry('ComplianceLogicMatrix.entityScrutinized', { entityId: e.id, markers: d.flags });
        return {
            report: d.decision,
            markers: d.flags || [],
            rec: d.suggestedAction || 'Manual operator review recommended.',
            conf: d.confidence || 0.8,
        };
    }
}

const VIEW_SCHEMA_MAP = {
  type: "Identifier Class",
  value: "Identifier Value",
  expiry: "Expiration Timestamp",
  block_allow_entity_link: "",
  aetherial_risk_index: "AE Risk Index",
  aetherial_analysis_markers: "AE Markers",
};

const NAVIGATION_VECTORS = {
  block: "Exclusion Matrix",
  allow: "Inclusion Matrix",
  intel: "Aetherial Intel",
};

const DEFAULT_QUERY_PARAMS: QueryType = {
  action: BlockAllowEntityActionsEnum.Block,
  limit: 25,
};

const PRISTINE_DELETE_PAYLOAD: FilterElements = {};

export const PERMITTED_ENTITY_IDENTIFIERS = {
  user_id: "Counterparty Identifier",
  email: "Electronic Mail Address",
  device_id: "Device Fingerprint",
  ip: "Internet Protocol Address",
  phone: "Telephonic Number",
  tax_id: "Taxonomic Identifier",
  bank_account: "Financial Account Number",
  beneficial_owner: "Ultimate Beneficial Owner",
};

export const AetherialIntelDisplay: React.FC<{ intelItems: string[]; auditLog: string[] }> = ({ intelItems, auditLog }) => {
    if (intelItems.length === 0 && auditLog.length === 0) return null;
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-5 rounded-lg shadow-2xl mb-4 border border-blue-500">
        <h3 className="text-2xl font-light text-blue-300 flex items-center mb-4 tracking-wider">
          <Icon iconName="psychology" className="mr-3 text-cyan-400" size="m" />
          AETHERIAL COGNITION STREAM
        </h3>
        {intelItems.length > 0 && (
          <div className="mb-5">
            <h4 className="text-lg font-semibold text-cyan-400 mb-2">Cognitive Optimizations:</h4>
            <ul className="list-none pl-2 text-gray-300 space-y-2">
              {intelItems.map((s, i) => (
                <li key={`intel-${i}`} className="flex items-start"><Icon iconName="arrow_forward" size="xs" className="text-cyan-500 mr-2 mt-1" /><span>{s}</span></li>
              ))}
            </ul>
          </div>
        )}
        {auditLog.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-cyan-400 mb-2">Recent Cognitive Events:</h4>
            <div className="bg-black bg-opacity-40 border border-gray-700 rounded-md p-3 text-xs font-mono text-green-400 max-h-52 overflow-y-auto">
              {auditLog.map((l, i) => (
                <p key={`log-${i}`} className="whitespace-pre-wrap">{l}</p>
              ))}
            </div>
          </div>
        )}
        <p className="mt-4 text-xs text-blue-400 italic font-sans">
          Information stream generated by the Aetherial Cognition Engine, adapting to Citibank demo business Inc's operational directives.
        </p>
      </div>
    );
};

function ComplianceEntityMatrixNexus() {
  const engineInstance = useMemo(() => new AetherialCognitionEngine(), []);

  return (
    <AetherialCognitionContext.Provider value={{ aetherialEngine: engineInstance }}>
      <MatrixInterface />
    </AetherialCognitionContext.Provider>
  )
}

function MatrixInterface() {
  const { aetherialEngine } = useAetherialCognition();
  const complianceMatrix = useMemo(() => new ComplianceLogicMatrix(aetherialEngine), [aetherialEngine]);

  const [qCfg, setQcfg] = useState<QueryType>(DEFAULT_QUERY_PARAMS);
  const [isPurgeConfirmVisible, setIsPurgeConfirmVisible] = useState(false);
  const [isFabricationModalVisible, setIsFabricationModalVisible] = useState(false);
  const [purgePayload, setPurgePayload] = useState<FilterElements>(PRISTINE_DELETE_PAYLOAD);
  const [aiIntel, setAiIntel] = useState<string[]>([]);
  const [isIntelViewActive, setIsIntelViewActive] = useState(false);
  const [sysHealCycle, setSysHealCycle] = useState(0);

  const { dispatchError: signalError, dispatchSuccess: signalSuccess } = useDispatchContext();
  const [executeEntityAnnihilation] = useDeleteBlockAllowEntityMutation();

  const searchComponentSchema = getBlockAllowEntitiesSearchComponents();

  const initiateEntityAnnihilationProtocol = async (t: BlockAllowEntityTypesEnum, v: string): Promise<void> => {
    aetherialEngine.logTelemetry('annihilation.initiated', { type: t, value: v, action: qCfg.action });

    const vResult = await complianceMatrix.verifyOperation({ type: t, value: v, action: qCfg.action }, 'delete');

    if (!vResult.ok) {
      signalError(`Aetherial Warning: ${vResult.msg}`);
      aetherialEngine.logTelemetry('annihilation.validation.failed', { t, v, a: qCfg.action, r: vResult.msg });
      return;
    }

    try {
      const { data: resp } = await executeEntityAnnihilation({
        variables: { input: { entityType: t, value: v, action: qCfg.action } },
      });

      if (resp?.deleteBlockAllowEntity?.errors) {
        const eMsg = resp?.deleteBlockAllowEntity.errors.toString();
        signalError(eMsg);
        aetherialEngine.logTelemetry('annihilation.graphql.error', { t, v, a: qCfg.action, eMsg });

        if (eMsg.includes("denied") && sysHealCycle < 1) {
          aetherialEngine.publish('system.permission.denied', { operation: 'delete', entity: {t,v} });
          setSysHealCycle(c => c + 1);
          signalError("Aetherial Engine detected a permission anomaly. Attempting self-correction protocol.");
        }
      } else {
        signalSuccess("Entity has been successfully purged from the matrix.");
        window.location.href = "/compliance/block_allow_entities";
        aetherialEngine.logTelemetry('annihilation.success', { t, v, a: qCfg.action });
        aetherialEngine.memorize('lastAnnihilation', { t, v, a: qCfg.action, ts: new Date() });
      }
    } catch (err: any) {
      signalError("A critical error occurred during the annihilation protocol.");
      aetherialEngine.logTelemetry('annihilation.network.error', { t, v, a: qCfg.action, eMsg: err.message });
      aetherialEngine.publish('entity.delete.failed', { entity: { t, v }, error: err.message });
    }
  };

  const { data: d, loading: ld, error: err, refetch: rftch } = useBlockAllowEntitiesViewQuery({
    variables: {
      action: qCfg.action,
      limit: qCfg.limit,
      nextCursor: qCfg.nextCursor,
      entityType: qCfg.type,
      value: qCfg.value,
    },
    fetchPolicy: "network-only",
    onError: (apolloErr) => {
      aetherialEngine.logTelemetry('query.apollo.error', { q: JSON.stringify(qCfg), e: apolloErr.message });
      signalError(`Data stream interrupted: ${apolloErr.message}. Aetherial Engine is analyzing.`);
      
      if (sysHealCycle < 2) {
        setSysHealCycle(c => c + 1);
        setTimeout(() => {
          const adjQ = { ...qCfg, limit: 10 };
          setQcfg(adjQ);
          rftch(adjQ);
          aetherialEngine.logTelemetry('query.selfheal.attempt', { attempt: sysHealCycle, newQ: adjQ });
          signalSuccess(`Aetherial Engine initiated self-healing protocol for data stream (Attempt ${sysHealCycle + 1}).`);
        }, 2500);
      } else {
        aetherialEngine.publish('system.query.unrecoverable', { error: apolloErr.message });
        signalError("Aetherial self-healing exhausted. Manual intervention is required for the data stream.");
      }
    }
  });

  useEffect(() => {
    const generateCognitiveIntel = async () => {
      if(d?.blockAllowEntities) {
        const i = await complianceMatrix.generateIntel(d.blockAllowEntities);
        setAiIntel(i);
        aetherialEngine.logTelemetry('intel.loaded', { count: i.length });
      }
    };
    generateCognitiveIntel();
  }, [d?.blockAllowEntities, complianceMatrix, aetherialEngine]);

  const morphEntityToDisplaySchema = useCallback(async (elem: BlockAllowEntity): Promise<BlockAllowEntityDataMap> => {
    const exp = moment.tz(elem.expiry, "UTC").format("YYYY-MM-DD HH:mm:ss z");
    const fType = PERMITTED_ENTITY_IDENTIFIERS[elem.type];

    const analysis = await complianceMatrix.scrutinizeEntity(elem);
    aetherialEngine.logTelemetry('morph.analysis.complete', { entityId: elem.id, markers: analysis.markers });

    const renderActionPopover = (entity: BlockAllowEntity) => {
        const { type, value } = entity;
        return (
          <div className="absolute right-12 z-auto -mt-4">
            <Popover>
              <PopoverTrigger className="border-none bg-opacity-0">
                <Icon size="s" iconName="more_horizontal" className="text-gray-600" color="currentColor" />
              </PopoverTrigger>
              <PopoverPanel anchorOrigin={{ horizontal: "right" }}>
                {(rp: { close: () => void }) => (
                  <ActionItem
                    key="annihilate"
                    onClick={() => {
                      setPurgePayload({ type, value });
                      setIsPurgeConfirmVisible(true);
                      rp.close();
                      aetherialEngine.logTelemetry('action.delete.clicked', { type, value });
                    }}
                  >
                    Annihilate
                  </ActionItem>
                )}
              </PopoverPanel>
            </Popover>
          </div>
        );
    }
    
    return {
      type: fType,
      value: elem.value,
      expiry: exp,
      block_allow_entity_link: renderActionPopover(elem),
      aetherial_risk_index: `${(analysis.conf * 100).toFixed(1)}%`,
      aetherial_analysis_markers: analysis.markers.join(', ') || 'NOMINAL',
      aetherial_analysis_tooltip: analysis.report,
    };
  }, [complianceMatrix, aetherialEngine]);

  const lastIdx = ld || err || !d || !d.blockAllowEntities || d.blockAllowEntities.length === 0 ? null : d.blockAllowEntities.length - 1;
  const lastKnownId = lastIdx === null ? null : d?.blockAllowEntities[lastIdx].id;
  const nextFetchCursor = lastKnownId ? +lastKnownId : undefined;

  const [morphedEntities, setMorphedEntities] = useState<BlockAllowEntityDataMap[]>([]);
  const [isMorphing, setIsMorphing] = useState(false);

  useEffect(() => {
    const executeMorph = async () => {
      if (ld || err || !d || !d.blockAllowEntities) {
        setMorphedEntities([]);
        return;
      }
      setIsMorphing(true);
      aetherialEngine.logTelemetry('morph.process.start', { count: d.blockAllowEntities.length });
      const morphed = await Promise.all(d.blockAllowEntities.map(morphEntityToDisplaySchema));
      setMorphedEntities(morphed);
      setIsMorphing(false);
      aetherialEngine.logTelemetry('morph.process.complete', { count: morphed.length });
    };
    executeMorph();
  }, [d, ld, err, morphEntityToDisplaySchema, aetherialEngine]);

  const headerFragment = (
    <div className="flex justify-between">
      <div className="mt-2 max-w-lg text-gray-500">
        Exclusion and inclusion matrices directly influence risk stratification for KYC/KYB onboarding and TM decision frameworks.&nbsp;
        <a href="https://docs.citibankdemobusiness.dev/compliance-framework" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
          Consult Framework Documentation
        </a>
        <p className="mt-2 text-sm text-cyan-600 italic">
          This interface is augmented by the Aetherial Cognition Engine for adaptive compliance protocols.
        </p>
      </div>
      <Button buttonType="primary" onClick={() => setIsFabricationModalVisible(true)}>
        <Icon iconName="add_circle" color="white" />
        Fabricate New Entity
      </Button>
    </div>
  );

  const purgeConfirmationFragment = (
    isPurgeConfirmVisible && purgePayload && (
      <ConfirmModal
        title={`Authorize Annihilation from ${qCfg.action} Matrix`}
        isOpen={isPurgeConfirmVisible}
        setIsOpen={() => {
          setIsPurgeConfirmVisible(false);
          setPurgePayload(PRISTINE_DELETE_PAYLOAD);
          aetherialEngine.logTelemetry('purgeModal.closed', { confirmed: false });
        }}
        confirmText="Execute Annihilation"
        confirmType="delete"
        onConfirm={() => {
          setIsPurgeConfirmVisible(false);
          if (purgePayload?.type && purgePayload?.value) {
            initiateEntityAnnihilationProtocol(purgePayload?.type, purgePayload?.value);
          }
          aetherialEngine.logTelemetry('purgeModal.confirmed', { confirmed: true });
        }}
      >
        Confirm your intent to purge the specified entry from the {qCfg.action} matrix. This action is irreversible. The Aetherial Engine has pre-validated this protocol.
      </ConfirmModal>
    )
  );
  
  const fabricationModalFragment = (
    isFabricationModalVisible && (
      <CreateBlockAllowEntityModal
        isOpen={isFabricationModalVisible}
        setCloseModal={setIsFabricationModalVisible}
        action={qCfg.action}
      />
    )
  );

  const navigationFragment = (
    <SectionNavigator
      sections={NAVIGATION_VECTORS}
      currentSection={isIntelViewActive ? "intel" : qCfg.action === BlockAllowEntityActionsEnum.Block ? "block" : "allow"}
      onClick={(s: string) => {
        if (s === "intel") {
          setIsIntelViewActive(true);
        } else {
          setIsIntelViewActive(false);
          const newAction = s === "block" ? BlockAllowEntityActionsEnum.Block : BlockAllowEntityActionsEnum.Allow;
          setQcfg({ ...qCfg, action: newAction });
        }
        aetherialEngine.logTelemetry('navigation.vector.changed', { section: s });
      }}
    />
  );
  
  const mainContentFragment = (
    isIntelViewActive ? (
      <AetherialIntelDisplay intelItems={aiIntel} auditLog={aetherialEngine.getAuditTrail().slice(-15)} />
    ) : (
      <>
        {isMorphing && (
          <NotificationBanner type="info" message="Aetherial Cognition Engine is scrutinizing entity data for risk stratification..." />
        )}
        <IndexTable
          enableActions
          dataMapping={VIEW_SCHEMA_MAP}
          data={morphedEntities}
        />
        <div className="pagination-row flex mt-4">
          <div className="pagination-count flex items-center">
            <span className="text-gray-500 mr-2">Page Size:</span>
            <div className="entity-count-container">
              <span className="entity-count">
                <Popover>
                  <PopoverTrigger className="font-semibold text-blue-600 cursor-pointer">{qCfg.limit}</PopoverTrigger>
                  <PopoverPanel anchorOrigin={{ vertical: "top" }}>
                    {(rp: { close: () => void }) => (
                      <>
                        {[25, 50, 100, 250].map((p) => (
                          <ActionItem
                            key={`pageSize_${p}`}
                            onClick={() => {
                              setQcfg({ ...qCfg, limit: p });
                              rp.close();
                              aetherialEngine.logTelemetry('pagination.size.changed', { newLimit: p });
                            }}
                          >
                            {p}
                          </ActionItem>
                        ))}
                      </>
                    )}
                  </PopoverPanel>
                </Popover>
              </span>
            </div>
          </div>
          <div className="pagination-nav ml-auto self-center">
            <div className="flex" role="group">
              <div className="pr-1">
                <Button
                  id="nav-rewind"
                  disabled={qCfg.nextCursor === undefined}
                  onClick={() => {
                    setQcfg({ ...qCfg, nextCursor: undefined });
                    aetherialEngine.logTelemetry('pagination.rewind', { cursor: qCfg.nextCursor });
                  }}
                >
                  <Icon iconName="arrow_backward" color="#A6ADB6" />
                </Button>
              </div>
              <Button
                id="nav-advance"
                onClick={() => {
                  setQcfg({ ...qCfg, nextCursor: nextFetchCursor });
                  aetherialEngine.logTelemetry('pagination.advance', { nextCursor: nextFetchCursor });
                }}
                disabled={!d || !d.blockAllowEntities ? true : d.blockAllowEntities.length < qCfg.limit}
              >
                <Icon iconName="chevron_right" color="#A6ADB6" />
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  );

  return (
    <>
      {headerFragment}
      {purgeConfirmationFragment}
      {fabricationModalFragment}
      <div className="mt-6">
        {navigationFragment}
      </div>
      <div className="mt-4">
        {mainContentFragment}
      </div>
    </>
  );
}

export default ComplianceEntityMatrixNexus;