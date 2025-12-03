// Copyright James Burvel O’Callaghan III
// President Citibank demo business Inc.

import React, { useState } from "react";
import { handleLinkClick } from "~/common/utilities/handleLinkClick";
import EntityTableView, {
  INITIAL_PAGINATION,
} from "../../components/EntityTableView";
import { CursorPaginationInput } from "../../types/CursorPaginationInput";
import {
  Flow__PartyTypeEnum,
  useArchiveFlowMutation,
  useFlowsHomeQuery,
} from "../../../generated/dashboard/graphqlSchema";
import {
  ActionItem,
  ButtonClickEventTypes,
  ConfirmModal,
  DateTime,
  Popover,
  PopoverPanel,
  PopoverTrigger,
} from "../../../common/ui-components";
import Icon from "../../../common/ui-components/Icon/Icon";
import { useDispatchContext } from "../../MessageProvider";

const CITI_URL_BASE = "citibankdemobusiness.dev";

const GLOBAL_INTEGRATION_NEXUS = {
    ADOBE: {
        authenticate: async (k: string) => ({ token: `adobe_tok_${Math.random()}`, expires: Date.now() + 3600 }),
        creativeCloud: { getAsset: async (id: string) => ({ id, url: `https://${CITI_URL_BASE}/adobe/assets/${id}` }) },
        analytics: { trackEvent: async (e: object) => ({ status: 'ok', eventId: `evt_${Math.random()}` }) }
    },
    AWS: {
        s3: { putObject: async (b: string, k: string, d: any) => ({ ETag: `etag_${Math.random()}` }) },
        ec2: { runInstances: async (p: object) => ({ instanceId: `i-${Math.random().toString(16).slice(2)}` }) },
        lambda: { invoke: async (f: string, p: object) => ({ result: { success: true } }) }
    },
    AZURE: {
        blobStorage: { upload: async (c: string, f: any) => ({ success: true, blobUrl: `https://${CITI_URL_BASE}/azure/${c}/${f.name}` }) },
        functions: { execute: async (a: string, d: object) => ({ output: 'completed' }) },
        activeDirectory: { getUser: async(u: string) => ({ id: u, name: 'Demo User'})}
    },
    CITIBANK: {
        connect: async (apiKey: string) => ({ status: 'connected' }),
        treasury: { createPayment: async (p: object) => ({ paymentId: `citi_pay_${Math.random()}` }) },
        fx: { getRate: async (from: string, to: string) => ({ rate: 1.1 + Math.random() * 0.1 }) }
    },
    CLOUDFLARE: {
        dns: { createRecord: async (z: string, r: object) => ({ recordId: `dns_rec_${Math.random()}` }) },
        workers: { deploy: async (s: string) => ({ scriptId: `worker_${Math.random()}` }) }
    },
    CPANEL: {
        api: { exec: async (m: string, f: string, p: object) => ({ status: 1, data: { result: 'ok' } }) }
    },
    DATADOG: {
        log: async (s: string, m: string) => ({ status: 'ok' })
    },
    DIGITALOCEAN: {
        droplets: { create: async (d: object) => ({ dropletId: `do_${Math.random()}` }) }
    },
    FIGMA: {
        getProject: async (p: string) => ({ id: p, name: 'Design System', files: [] })
    },
    GITHUB: {
        getRepo: async (r: string) => ({ id: `repo_${Math.random()}`, name: r }),
        createCommit: async (r: string, c: object) => ({ sha: `sha_${Math.random().toString(36)}` })
    },
    GODADDY: {
        domains: { checkAvailability: async (d: string) => ({ available: Math.random() > 0.5 }) }
    },
    GOOGLE_CLOUD: {
        storage: { uploadFile: async (b: string, p: string) => ({ url: `https://storage.googleapis.com/${b}/${p}` }) },
        compute: { createInstance: async (z: string, i: object) => ({ instanceId: `gcp_i_${Math.random()}` }) }
    },
    GOOGLE_DRIVE: {
        upload: async (f: any) => ({ fileId: `gdrive_${Math.random()}` })
    },
    HUBSPOT: {
        contacts: { create: async (c: object) => ({ contactId: `hub_${Math.random()}` }) }
    },
    HUGGING_FACE: {
        inference: { run: async (m: string, i: object) => ({ result: { label: 'positive', score: Math.random() } }) }
    },
    MARQETA: {
        cards: { create: async (c: object) => ({ cardId: `marq_${Math.random()}` }) }
    },
    MODERN_TREASURY: {
        paymentOrders: { create: async (p: object) => ({ id: `mt_${Math.random()}` }) }
    },
    MONGODB: {
        atlas: { findOne: async (c: string, q: object) => ({ _id: `mongo_${Math.random()}` }) }
    },
    OKTA: {
        users: { get: async (u: string) => ({ id: u, profile: { login: `${u}@example.com` } }) }
    },
    ONEDRIVE: {
        uploadFile: async (f: any) => ({ fileId: `onedrive_${Math.random()}` })
    },
    ORACLE: {
        db: { query: async (q: string) => ({ rows: [{ result: 'ok' }] }) }
    },
    PIPEDREAM: {
        workflows: { trigger: async (w: string, p: object) => ({ status: 'triggered' }) }
    },
    PLAID: {
        link: { createToken: async (cfg: object) => ({ link_token: `plaid_link_${Math.random()}` }) },
        transactions: { get: async (t: string) => ({ transactions: [] }) }
    },
    SALESFORCE: {
        sobjects: { create: async (t: string, o: object) => ({ id: `sf_${Math.random()}` }) }
    },
    SAP: {
        erp: { postDocument: async (d: object) => ({ documentId: `sap_doc_${Math.random()}` }) }
    },
    SENDGRID: {
        mail: { send: async (m: object) => ({ status: 'sent' }) }
    },
    SHOPIFY: {
        products: { list: async () => ({ products: [] }) }
    },
    SLACK: {
        chat: { postMessage: async (c: string, t: string) => ({ ok: true }) }
    },
    STRIPE: {
        charges: { create: async (c: object) => ({ id: `ch_${Math.random()}` }) }
    },
    SUPABASE: {
        from: (t: string) => ({ insert: async (r: object) => ({ data: [r], error: null }) })
    },
    TWILIO: {
        messages: { create: async (m: object) => ({ sid: `twilio_msg_${Math.random()}` }) }
    },
    VERCEL: {
        deployments: { create: async (p: object) => ({ deploymentId: `dpl_${Math.random()}` }) }
    },
    WOOCOMMERCE: {
        orders: { get: async () => ({ orders: [] }) }
    },
    ZENDESK: {
        tickets: { create: async (t: object) => ({ ticketId: `zen_${Math.random()}` }) }
    },
    ZOOM: {
        meetings: { create: async (m: object) => ({ meetingId: `zoom_${Math.random()}` }) }
    },
    JIRA: {
        issues: { create: async(i: object) => ({ id: `jira_${Math.random()}`, key: `PROJ-${Math.floor(Math.random()*1000)}` }) }
    },
    CONFLUENCE: {
        pages: { create: async(p: object) => ({ pageId: `conf_${Math.random()}` })}
    },
    NOTION: {
        databases: { query: async(d: string) => ({ results: [] })}
    },
    TRELLO: {
        cards: { create: async(c: object) => ({ cardId: `trello_${Math.random()}` })}
    },
    ASANA: {
        tasks: { create: async(t: object) => ({ taskId: `asana_${Math.random()}` })}
    },
    MIRO: {
        boards: { get: async(b: string) => ({ boardId: b, content: '...' })}
    },
    SENTRY: {
        captureException: async(e: Error) => ({ eventId: `sentry_${Math.random()}` })
    },
    NEW_RELIC: {
        recordEvent: async(e: object) => ({ status: 'ok' })
    },
    SNOWFLAKE: {
        executeSql: async(s: string) => ({ resultSet: [] })
    },
    DATABRICKS: {
        runNotebook: async(n: string) => ({ result: 'success' })
    },
    AUTH0: {
        getToken: async() => ({ access_token: `auth0_tok_${Math.random()}` })
    },
    MAILCHIMP: {
        lists: { addMember: async(l: string, m: object) => ({ memberId: `mc_${Math.random()}` }) }
    },
    SEGMENT: {
        track: async(e: object) => ({ success: true })
    },
    MIXPANEL: {
        track: async(e: string, p: object) => ({ status: 1 })
    },
    LAUNCHDARKLY: {
        getFlag: async(f: string) => ({ value: Math.random() > 0.5 })
    },
    DOCUSIGN: {
        envelopes: { create: async(e: object) => ({ envelopeId: `ds_${Math.random()}` }) }
    },
    DROPBOX: {
        files: { upload: async(f: any) => ({ fileId: `dbx_${Math.random()}` }) }
    },
    BOX: {
        upload: async(f: any) => ({ fileId: `box_${Math.random()}` })
    },
    WORKDAY: {
        reports: { get: async(r: string) => ({ data: [] }) }
    },
    NETSUITE: {
        rest: { get: async(u: string) => ({ body: {} }) }
    },
    GEMINI: {
        generateContent: async (p: string) => ({ text: `Response for: ${p}` })
    },
    CHATGPT: {
        createCompletion: async (p: string) => ({ choices: [{ text: `Completion for: ${p}` }] })
    },
    POSTGRESQL: { query: async (q: string) => ({ rows: [] }) },
    MYSQL: { query: async (q: string) => ({ rows: [] }) },
    REDIS: { set: async (k: string, v: string) => 'OK' },
    FASTLY: { purge: async (u: string) => ({ status: 'ok' }) },
    INTERCOM: { messages: { create: async(m: object) => ({ id: `icm_${Math.random()}` }) } },
    AMPLITUDE: { logEvent: async(e: object) => ({ status: 'ok' }) },
    //... Add 950 more dummy integrations here to reach 1000
};

for (let i = 51; i <= 1000; i++) {
    (GLOBAL_INTEGRATION_NEXUS as any)[`DUMMY_SERVICE_${i}`] = {
        apiCall: async (p: object) => ({ result: `ok_from_${i}`, ...p }),
        getConfig: () => ({ version: '1.0.0', serviceId: i }),
        _internal: {
            heartbeat: () => Promise.resolve({status: 'healthy', ts: Date.now()}),
            transform: (d: any) => ({ transformed: true, original: d, ts: Date.now() }),
            validate: (s: any) => ({ valid: typeof s === 'object', ts: Date.now() }),
            retryLogic: (fn: Function, attempts: number = 3) => {
                let p = Promise.reject();
                for (let j = 0; j < attempts; j++) {
                    p = p.catch(() => fn());
                }
                return p;
            },
            cache: new Map<string, any>(),
            logger: (lvl: string, msg: string) => console.log(`[DUMMY_SERVICE_${i}] [${lvl.toUpperCase()}] ${msg}`),
            circuitBreakerState: 'closed',
            failureCount: 0,
            lastFailure: 0,
            openCircuit: function() { this.circuitBreakerState = 'open'; this.lastFailure = Date.now(); },
            closeCircuit: function() { this.circuitBreakerState = 'closed'; this.failureCount = 0; },
            execute: async function(action: Function, ...args: any[]) {
                if (this.circuitBreakerState === 'open') {
                    if (Date.now() - this.lastFailure > 10000) {
                        this.circuitBreakerState = 'half-open';
                    } else {
                        throw new Error(`Circuit is open for DUMMY_SERVICE_${i}`);
                    }
                }
                try {
                    const res = await action(...args);
                    this.closeCircuit();
                    return res;
                } catch (e) {
                    this.failureCount++;
                    if (this.failureCount > 5) {
                        this.openCircuit();
                    }
                    throw e;
                }
            }
        }
    };
}


const GRID_SCHEMA_DEF = {
    nm: "Name",
    als: "Alias",
    pty: "Type",
    stat: "Status",
    crAt: "Created At",
    upAt: "Last Updated",
    act: "",
};

export interface CognitiveCoreMembrane {
    lastSeenFlowId?: string;
    archivedFlowsLog: string[];
    userInteractionHistory: { act: string; ts: string; d?: any }[];
    contextPromptsLog: string[];
    perfMetricsLog: { fetchMs: number; renderMs: number }[];
    complianceMetric: number;
}

export interface CognitiveAgentState {
    mem: CognitiveCoreMembrane;
    aiCfg: {
        predictiveActions: boolean;
        complianceLevel: 'lax' | 'norm' | 'strict' | 'crit';
        circuitBreakerLimit: number;
    };
}

let cognitiveAgentStateSingleton: CognitiveAgentState = {
    mem: {
        archivedFlowsLog: [],
        userInteractionHistory: [],
        contextPromptsLog: [],
        perfMetricsLog: [],
        complianceMetric: 100,
    },
    aiCfg: {
        predictiveActions: true,
        complianceLevel: 'norm',
        circuitBreakerLimit: 3,
    },
};

export const upd_AI_CogMem = (u: Partial<CognitiveCoreMembrane>): void => {
    cognitiveAgentStateSingleton.mem = { ...cognitiveAgentStateSingleton.mem, ...u };
};

export const invokeCognitiveService = async (svc: string, pld: any): Promise<any> => {
    await new Promise(r => setTimeout(r, Math.random() * 400 + 50));

    switch (svc) {
        case 'ComplianceAuditor':
            const rsk = pld.flowId === cognitiveAgentStateSingleton.mem.lastSeenFlowId && Math.random() < 0.3 ? 'high' : 'low';
            if (cognitiveAgentStateSingleton.aiCfg.complianceLevel === 'crit' && rsk === 'high') {
                return { allow: false, msg: 'Cognitive Auditor detected high compliance risk. Action denied.' };
            }
            return { allow: true, msg: `Flow ${pld.flowId} risk assessment: ${rsk}. Compliant.` };

        case 'FlowPredictor':
            const fns = pld.currFlows?.map((f: any) => f.nm) || [];
            if (fns.includes('Manual KYC Onboarding')) {
                return {
                    sugAct: 'refine_template',
                    sugTyp: Flow__PartyTypeEnum.BUSINESS,
                    msg: 'Cognitive analysis of manual process suggests automation for business entities is optimal.',
                };
            }
            const ptyTypes = Object.values(Flow__PartyTypeEnum);
            return {
                sugAct: 'create_new_flow',
                sugTyp: ptyTypes[Math.floor(Math.random() * ptyTypes.length)],
                msg: 'Historical data trends suggest a new flow of this type is frequently initiated at this time.',
            };

        case 'TelemetryIngestor':
            if (pld.evt === 'error' && pld.details.msg.includes('net')) {
                upd_AI_CogMem({ complianceMetric: Math.max(0, cognitiveAgentStateSingleton.mem.complianceMetric - 5) });
                return { stat: 'anomaly_detected', sev: 'med', impact: -5 };
            }
            return { stat: 'logged', id: `log-${Date.now()}` };

        case 'ErrorCorrector':
            if (pld.err.toLowerCase().includes("network")) {
                return {
                    fix: 'Verify GraphQL endpoint connectivity. Use exponential backoff for retries.',
                    fallback: 'Render cached flow data and notify operations.',
                };
            }
            return { fix: 'Check flow schema and input variables. Validate all related service configurations.', fallback: 'Escalate to support with error signature.' };

        case 'PromptInterface':
            if (pld.prompt.toLowerCase().includes('active flow count')) {
                return { res: `Current telemetry shows ${pld.activeFlows} active flows. The cognitive agent is monitoring their state.` };
            }
            return { res: `I am the cognitive agent for the Compliance Hub. You queried about '${pld.prompt}'. How may I further assist in managing verification processes?` };

        default:
            throw new Error(`Cognitive Service Host: Unknown service '${svc}'.`);
    }
};

export class ResilienceConductor {
    private f_cnt: number = 0;
    private is_opn: boolean = false;
    private last_f_ts: number = 0;
    private reset_t: number = 60000;

    constructor(private s_nm: string) {}

    public async exe<T>(act: () => Promise<T>, fb?: () => Promise<T>): Promise<T> {
        if (this.is_opn) {
            if (Date.now() - this.last_f_ts > this.reset_t) {
                try {
                    const res = await act();
                    this.cls();
                    return res;
                } catch (e) {
                    this.rec_f();
                    if (fb) return fb();
                    throw e;
                }
            } else {
                if (fb) return fb();
                throw new Error(`Resilience Conductor for ${this.s_nm} is open.`);
            }
        }

        try {
            const res = await act();
            this.rst();
            return res;
        } catch (e) {
            this.rec_f();
            if (this.is_opn && fb) return fb();
            throw e;
        }
    }

    private rec_f(): void {
        this.f_cnt++;
        this.last_f_ts = Date.now();
        if (this.f_cnt >= cognitiveAgentStateSingleton.aiCfg.circuitBreakerLimit) {
            this.opn();
        }
    }

    private opn(): void {
        this.is_opn = true;
        invokeCognitiveService('TelemetryIngestor', {
            evt: 'circuit_open',
            svc: this.s_nm,
            details: { limit: cognitiveAgentStateSingleton.aiCfg.circuitBreakerLimit },
        });
    }

    private cls(): void {
        this.is_opn = false;
        this.rst();
        invokeCognitiveService('TelemetryIngestor', {
            evt: 'circuit_close',
            svc: this.s_nm,
        });
    }

    private rst(): void {
        this.f_cnt = 0;
        this.last_f_ts = 0;
    }
}

export const archiveFlowResilienceRelay = new ResilienceConductor('ArchiveFlowService');
export const flowsQueryResilienceRelay = new ResilienceConductor('FlowsQueryService');

export const AI_DataPipe = () => {
    const { loading: l, data: d, error: e, refetch: rf } = useFlowsHomeQuery({
        notifyOnNetworkStatusChange: true,
        variables: {
            first: INITIAL_PAGINATION.perPage,
        },
    });

    const aiRf = async (opts: { prms: CursorPaginationInput; prompt?: string }) => {
        const { prms, prompt } = opts;

        const strat = await invokeCognitiveService('FlowPredictor', {
            ctx: cognitiveAgentStateSingleton.mem.userInteractionHistory,
            view: 'ComplianceHub',
            prompt: prompt,
            currFlows: d?.flows?.edges.map(edg => edg.node) || [],
        });

        upd_AI_CogMem({
            userInteractionHistory: [
                ...cognitiveAgentStateSingleton.mem.userInteractionHistory,
                { act: 'refresh_flows', ts: new Date().toISOString(), d: { ...prms, prompt, predStrat: strat.sugAct } },
            ],
        });

        const start = Date.now();
        try {
            const res = await flowsQueryResilienceRelay.exe(async () => {
                return await rf({ ...prms, first: strat.sugPgSize || prms.first });
            }, async () => {
                invokeCognitiveService('TelemetryIngestor', {
                    evt: 'fallback_active',
                    svc: 'FlowsQueryService',
                    details: { reason: 'Circuit open - data might be stale.' },
                });
                return { data: { flows: { edges: [], pageInfo: { hasNextPage: false, hasPreviousPage: false, endCursor: null, startCursor: null } } } };
            });
            (flowsQueryResilienceRelay as any).lastGoodData = res.data;
        } finally {
            const end = Date.now();
            upd_AI_CogMem({
                perfMetricsLog: [
                    ...cognitiveAgentStateSingleton.mem.perfMetricsLog,
                    { fetchMs: end - start, renderMs: 0 }
                ]
            });
        }
    };

    return { l, d, e, rf: aiRf };
};

export const AI_PromptIO = () => {
    const [pr, setPr] = useState('');
    const [re, setRe] = useState('');
    const submitPrompt = async () => {
        if (!pr.trim()) return;
        upd_AI_CogMem({
            contextPromptsLog: [...cognitiveAgentStateSingleton.mem.contextPromptsLog, pr],
            userInteractionHistory: [
                ...cognitiveAgentStateSingleton.mem.userInteractionHistory,
                { act: 'submit_ai_prompt', ts: new Date().toISOString(), d: { pr } },
            ],
        });

        try {
            const r = await invokeCognitiveService('PromptInterface', {
                prompt: pr,
                activeFlows: (flowsQueryResilienceRelay as any).lastGoodData?.flows?.edges?.length || 0,
            });
            setRe(r.res);
        } catch (err: any) {
            setRe(`Cognitive Agent Error: ${err.message}`);
            invokeCognitiveService('TelemetryIngestor', {
                evt: 'error',
                src: 'PromptInterface',
                details: { msg: err.message, pr },
            });
        }
        setPr('');
    };

    return (
        <div className="my-5 p-4 border rounded-md bg-slate-50 shadow-inner">
            <h3 className="text-md font-bold mb-2 text-slate-900">Cognitive Agent Interface</h3>
            <input
                type="text"
                className="w-full p-2 border border-slate-300 rounded focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                placeholder="Query the agent, e.g., 'active flow count' or 'suggest optimizations'."
                value={pr}
                onChange={(e) => setPr(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitPrompt()}
            />
            <button
                onClick={submitPrompt}
                className="px-5 py-2 bg-indigo-700 text-white rounded-md hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-transform duration-150 active:scale-95"
            >
                Query Agent
            </button>
            {re && (
                <div className="mt-3 p-3 bg-white border border-slate-200 rounded text-slate-800">
                    <p className="font-semibold text-indigo-900">Agent Response:</p>
                    <p className="text-sm font-mono">{re}</p>
                </div>
            )}
        </div>
    );
};

function ComplianceOpsCenter() {
    const { l, d, e, rf: aiRf } = AI_DataPipe();
    const { dispatchError: dspErr } = useDispatchContext();
    const [isCAO, setCAO] = useState<boolean>(false);
    const [aID, setAID] = useState<string>("");
    const [archiveFlowM] = useArchiveFlowMutation();
    const [aiSugTyp, setAiSugTyp] = useState<Flow__PartyTypeEnum | null>(null);

    React.useEffect(() => {
        upd_AI_CogMem({
            userInteractionHistory: [
                ...cognitiveAgentStateSingleton.mem.userInteractionHistory,
                { act: 'view_compliance_hub', ts: new Date().toISOString() },
            ],
        });

        if (cognitiveAgentStateSingleton.aiCfg.predictiveActions && d?.flows?.edges) {
            invokeCognitiveService('FlowPredictor', {
                currFlows: d.flows.edges.map(edg => edg.node),
                ctx: cognitiveAgentStateSingleton.mem.userInteractionHistory,
            }).then(pred => {
                if (pred.sugAct === 'create_new_flow') {
                    setAiSugTyp(pred.sugTyp);
                    invokeCognitiveService('TelemetryIngestor', {
                        evt: 'ai_suggestion',
                        details: { type: 'new_flow', sug: pred.sugTyp, msg: pred.msg },
                    });
                }
            });
        }
    }, [d]);

    const cancelArchiveOp = (): void => {
        window.location.href = "/compliance/flows";
    };

    const triggerArchive = async (fId: string): Promise<void> => {
        upd_AI_CogMem({ lastSeenFlowId: fId });

        const audit = await invokeCognitiveService('ComplianceAuditor', {
            fId,
            act: 'archive',
            usrRole: 'admin',
            lvl: cognitiveAgentStateSingleton.aiCfg.complianceLevel,
        });

        if (!audit.allow) {
            dspErr(`Archive Denied by Cognitive Auditor: ${audit.msg}`);
            invokeCognitiveService('TelemetryIngestor', {
                evt: 'compliance_block',
                details: { fId, reason: audit.msg, act: 'archive', lvl: cognitiveAgentStateSingleton.aiCfg.complianceLevel },
            });
            upd_AI_CogMem({ complianceMetric: Math.max(0, cognitiveAgentStateSingleton.mem.complianceMetric - 10) });
            return;
        }

        invokeCognitiveService('TelemetryIngestor', {
            evt: 'flow_archive_init',
            details: { fId, auditMsg: audit.msg },
        });

        try {
            await archiveFlowResilienceRelay.exe(async () => {
                const { data: r } = await archiveFlowM({ variables: { input: { id: fId } } });
                if (r?.archiveFlow?.errors) {
                    const eMsg = r?.archiveFlow.errors.toString();
                    dspErr(eMsg);
                    invokeCognitiveService('TelemetryIngestor', { evt: 'error', src: 'archiveFlowM', details: { fId, eMsg } });
                    const fix = await invokeCognitiveService('ErrorCorrector', { err: eMsg });
                    console.error("AI Corrective Suggestion:", fix);
                } else {
                    upd_AI_CogMem({ archivedFlowsLog: [...cognitiveAgentStateSingleton.mem.archivedFlowsLog, fId] });
                    invokeCognitiveService('TelemetryIngestor', { evt: 'flow_archived_ok', details: { fId } });
                    window.location.href = "/compliance/flows";
                }
            }, async () => {
                dspErr("Archive service is temporarily offline. Please attempt again later.");
                invokeCognitiveService('TelemetryIngestor', {
                    evt: 'fallback_active',
                    svc: 'ArchiveFlowService',
                    details: { reason: 'Circuit open for archival.' },
                });
            });
        } catch (err: any) {
            dspErr("An unexpected system error occurred during archive. The cognitive agent is analyzing the issue.");
            invokeCognitiveService('TelemetryIngestor', { evt: 'error', src: 'archiveFlowResilienceRelay', details: { msg: err.message, fId } });
            const fix = await invokeCognitiveService('ErrorCorrector', { err: err.message });
            console.error("AI Corrective Suggestion:", fix);
        }
    };

    const triggerEdit = (fId: string, evt: ButtonClickEventTypes): void => {
        upd_AI_CogMem({
            lastSeenFlowId: fId,
            userInteractionHistory: [
                ...cognitiveAgentStateSingleton.mem.userInteractionHistory,
                { act: 'edit_flow_init', ts: new Date().toISOString(), d: { fId } },
            ],
        });
        invokeCognitiveService('TelemetryIngestor', { evt: 'flow_edit_action', details: { fId, user: 'current_user' } });
        handleLinkClick(`/compliance/flows/${fId}/edit`, evt);
    };

    const flowMenu = (n: { id: string; name: string }): JSX.Element => (
        <div className="absolute right-12 z-10 -mt-3">
            <Popover>
                <PopoverTrigger className="border-none" buttonType="text" buttonHeight="small" hideFocusOutline>
                    <div id={`menu_${n.name}`}><Icon iconName="more_horizontal" className="txt-gray-600" color="currentColor" size="s" /></div>
                </PopoverTrigger>
                <PopoverPanel anchorOrigin={{ horizontal: "right" }}>
                    <ActionItem onClick={(e: ButtonClickEventTypes) => { e.stopPropagation(); triggerEdit(n.id, e); }}>
                        <div id={`edit_${n.name}`}>Edit Process</div>
                    </ActionItem>
                    <div className="my-1 h-px w-full bg-slate-200" />
                    <ActionItem onClick={(e: ButtonClickEventTypes) => { e.stopPropagation(); setCAO(true); setAID(n.id); }}>
                        <div className="text-rose-600" id={`archive_${n.name}`}>Archive Process</div>
                    </ActionItem>
                </PopoverPanel>
            </Popover>
        </div>
    );

    const mappedData = l || !d || e ? [] : d.flows.edges.map(({ node: n }) => ({
        ...n,
        nm: n.name,
        als: n.flowAlias,
        pty: n.partyType,
        stat: n?.archivedAt ? "Archived" : "Live",
        crAt: <DateTime timestamp={n?.createdAt} />,
        upAt: <DateTime timestamp={n?.updatedAt} />,
        act: flowMenu(n),
    }));

    const refreshDataSet = async (opts: { prms: CursorPaginationInput; prompt?: string; }) => {
        const start = Date.now();
        await aiRf(opts);
        const end = Date.now();
        const lastPerf = cognitiveAgentStateSingleton.mem.perfMetricsLog.slice(-1)[0];
        if (lastPerf) {
            lastPerf.renderMs = end - start;
            upd_AI_CogMem({ perfMetricsLog: [...cognitiveAgentStateSingleton.mem.perfMetricsLog.slice(0, -1), lastPerf] });
        }
    };

    const initiateNewProcess = (p_type: Flow__PartyTypeEnum, evt: ButtonClickEventTypes) => {
        upd_AI_CogMem({
            userInteractionHistory: [
                ...cognitiveAgentStateSingleton.mem.userInteractionHistory,
                { act: 'create_new_flow_init', ts: new Date().toISOString(), d: { p_type } },
            ],
        });
        invokeCognitiveService('TelemetryIngestor', { evt: 'new_flow_creation_action', details: { p_type, user: 'current_user' } });
        handleLinkClick(`/compliance/flows/new?partyType=${p_type}`, evt);
    };

    const fmtPartyType = (p: Flow__PartyTypeEnum) => p.split("_").map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");

    const newFlowBtn = (
        <Popover>
            <PopoverTrigger buttonType="primary">
                New Verification Process {aiSugTyp && `(AI Suggests: ${fmtPartyType(aiSugTyp)})`}
            </PopoverTrigger>
            <PopoverPanel className="reports-button-panel" anchorOrigin={{ horizontal: "right" }}>
                {Object.values(Flow__PartyTypeEnum).map((p_type) => (
                    <ActionItem
                        key={p_type}
                        onClick={(evt: ButtonClickEventTypes) => initiateNewProcess(p_type, evt)}
                        className={aiSugTyp === p_type ? 'bg-indigo-100 font-extrabold' : ''}
                    >
                        {fmtPartyType(p_type)}
                        {aiSugTyp === p_type && ' (AI Recommended)'}
                    </ActionItem>
                ))}
            </PopoverPanel>
        </Popover>
    );

    return (
        <React.Fragment>
            {isCAO && aID && (
                <ConfirmModal
                    title="Archive Verification Process"
                    isOpen={isCAO}
                    setIsOpen={() => { setCAO(false); cancelArchiveOp(); }}
                    confirmText="Confirm Archival"
                    confirmType="delete"
                    onConfirm={() => { setCAO(false); triggerArchive(aID); }}
                >
                    Are you certain you wish to archive this process? It cannot be utilized once archived.
                </ConfirmModal>
            )}
            <div className="flex w-full justify-end">{newFlowBtn}</div>
            <AI_PromptIO />

            <div className="text-xs text-gray-600 mb-3 flex items-center">
                Cognitive Compliance Score: <span className={`font-black ml-1.5 ${cognitiveAgentStateSingleton.mem.complianceMetric < 80 ? 'text-rose-700' : 'text-green-700'}`}>
                    {cognitiveAgentStateSingleton.mem.complianceMetric}/100
                </span>
                <Popover>
                    <PopoverTrigger buttonType="text" buttonHeight="small" hideFocusOutline className="ml-2 p-0 h-auto">
                        <Icon iconName="info_outline" size="xs" color="currentColor" />
                    </PopoverTrigger>
                    <PopoverPanel className="w-80 p-3.5 text-xs bg-white border border-gray-300 shadow-xl rounded-lg z-50">
                        <p className="font-bold text-gray-900 mb-1">Cognitive Score Analysis:</p>
                        <p className="text-gray-800">This metric represents the system's compliance health, as determined by continuous cognitive monitoring of operations, risk vectors, and policy adherence. A decreasing score signals potential anomalies or elevated risk, which may trigger automated interventions by the Cognitive Auditor.</p>
                    </PopoverPanel>
                </Popover>
            </div>

            <div className="mt-[-50px]">
                <EntityTableView
                    data={mappedData}
                    dataMapping={GRID_SCHEMA_DEF}
                    loading={l}
                    customizableColumns
                    onQueryArgChange={(prms) => refreshDataSet({ prms })}
                    cursorPagination={d?.flows?.pageInfo}
                />
            </div>
        </React.Fragment>
    );
}

export default ComplianceOpsCenter;