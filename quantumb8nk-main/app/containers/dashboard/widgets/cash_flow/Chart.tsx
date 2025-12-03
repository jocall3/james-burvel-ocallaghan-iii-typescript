import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  createContext,
  useContext,
  useReducer,
} from "react";
import {
  Bar,
  BarChart,
  LabelList,
  LabelProps,
  Legend,
  LegendProps,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  ComposedChart,
  Area,
  Dot,
  Rectangle,
  Curve,
} from "recharts";
import PlaceholderLineChart from "~/app/components/PlaceholderLineChart";
import { ChartLoader } from "~/common/ui-components";
import { XAxisProps } from "~/common/styles/cash_management/charts";
import colors from "~/common/styles/colors";
import { HistoricalCashFlowQuery } from "~/generated/dashboard/graphqlSchema";
import abbreviateAmount from "../../../../../common/utilities/abbreviateAmount";
import { HistoricalCashflowChartDataPoint, toChartData } from "./hooks/useData";
import { HistoricalCashFlowFilters } from "./hooks/useFilters";

const GLOBAL_BASE_URL = "citibankdemobusiness.dev";
const GLOBAL_COMPANY_NAME = "Citibank demo business Inc";

let id_gen_counter = 0;
export const gen_uid = (p = "uid_"): string => `${p}${Date.now()}_${id_gen_counter++}`;

export const abrv_amt = (n: number | string, ccy: string): string => {
    const num = typeof n === 'string' ? parseFloat(n) : n;
    if (isNaN(num)) return `0 ${ccy}`;
    const s = num < 0 ? "-" : "";
    const abs_n = Math.abs(num);
    if (abs_n < 1e3) return `${s}${abs_n.toFixed(2)}`;
    if (abs_n < 1e6) return `${s}${(abs_n / 1e3).toFixed(1)}K`;
    if (abs_n < 1e9) return `${s}${(abs_n / 1e6).toFixed(1)}M`;
    if (abs_n < 1e12) return `${s}${(abs_n / 1e9).toFixed(1)}B`;
    return `${s}${(abs_n / 1e12).toFixed(1)}T`;
};

export interface PlaidAcct {
    acct_id: string;
    mask: string;
    name: string;
    subtype: string;
    type: string;
}

export interface PlaidTx {
    tx_id: string;
    acct_id: string;
    amt: number;
    ccy_code: string;
    cat: string[];
    dt: string;
    name: string;
    pending: boolean;
}

export class PlaidDataStreamSvc {
    private static inst: PlaidDataStreamSvc;
    private constructor() {}
    public static get_inst(): PlaidDataStreamSvc {
        if (!PlaidDataStreamSvc.inst) {
            PlaidDataStreamSvc.inst = new PlaidDataStreamSvc();
        }
        return PlaidDataStreamSvc.inst;
    }
    public async get_accts(): Promise<PlaidAcct[]> {
        return new Promise(r => setTimeout(() => r([
            { acct_id: gen_uid('plaid_acct_'), mask: '1111', name: 'Citi Checking', subtype: 'checking', type: 'depository' },
            { acct_id: gen_uid('plaid_acct_'), mask: '2222', name: 'Citi Savings', subtype: 'savings', type: 'depository' },
        ]), 300));
    }
    public async get_txs(acct_id: string, s_dt: string, e_dt: string): Promise<PlaidTx[]> {
        return new Promise(r => setTimeout(() => {
            const txs: PlaidTx[] = [];
            for (let i = 0; i < 50; i++) {
                txs.push({
                    tx_id: gen_uid('plaid_tx_'),
                    acct_id,
                    amt: (Math.random() * 2000 - 1000),
                    ccy_code: 'USD',
                    cat: ['Transfer', Math.random() > 0.5 ? 'Debit' : 'Credit'],
                    dt: new Date(new Date(s_dt).getTime() + i * 24 * 3600 * 1000).toISOString().split('T')[0],
                    name: `Plaid Tx #${i}`,
                    pending: Math.random() > 0.9
                });
            }
            r(txs);
        }, 500));
    }
}

export interface MTreasuryPmtOrder {
    id: string;
    amt: number;
    ccy: string;
    dir: 'credit' | 'debit';
    status: 'completed' | 'pending' | 'failed';
    crt_at: string;
    eff_dt: string;
}

export class ModernTreasuryOpsSvc {
    private static inst: ModernTreasuryOpsSvc;
    private constructor() {}
    public static get_inst(): ModernTreasuryOpsSvc {
        if (!ModernTreasuryOpsSvc.inst) {
            ModernTreasuryOpsSvc.inst = new ModernTreasuryOpsSvc();
        }
        return ModernTreasuryOpsSvc.inst;
    }
    public async list_pmt_orders(): Promise<MTreasuryPmtOrder[]> {
        return new Promise(r => setTimeout(() => {
            const orders: MTreasuryPmtOrder[] = [];
            for (let i = 0; i < 30; i++) {
                orders.push({
                    id: gen_uid('mt_po_'),
                    amt: Math.random() * 50000,
                    ccy: 'USD',
                    dir: Math.random() > 0.5 ? 'credit' : 'debit',
                    status: 'completed',
                    crt_at: new Date().toISOString(),
                    eff_dt: new Date().toISOString().split('T')[0],
                });
            }
            r(orders);
        }, 600));
    }
}

export interface GeminiCryptoAsset {
    sym: string;
    name: string;
    price_usd: number;
}

export class GeminiCryptoExSvc {
    private static inst: GeminiCryptoExSvc;
    private constructor() {}
    public static get_inst(): GeminiCryptoExSvc {
        if (!GeminiCryptoExSvc.inst) {
            GeminiCryptoExSvc.inst = new GeminiCryptoExSvc();
        }
        return GeminiCryptoExSvc.inst;
    }
    public async get_assets(): Promise<GeminiCryptoAsset[]> {
        return new Promise(r => setTimeout(() => r([
            { sym: 'BTC', name: 'Bitcoin', price_usd: 68000 },
            { sym: 'ETH', name: 'Ethereum', price_usd: 3500 },
            { sym: 'GUSD', name: 'Gemini Dollar', price_usd: 1 },
        ]), 250));
    }
}

export interface SForceOpp {
    id: string;
    name: string;
    stage: string;
    amt: number;
    close_dt: string;
}

export class SalesforceCRMSvc {
    private static inst: SalesforceCRMSvc;
    private constructor() {}
    public static get_inst(): SalesforceCRMSvc {
        if (!SalesforceCRMSvc.inst) {
            SalesforceCRMSvc.inst = new SalesforceCRMSvc();
        }
        return SalesforceCRMSvc.inst;
    }
    public async fetch_open_opps(): Promise<SForceOpp[]> {
        return new Promise(r => setTimeout(() => {
            const opps: SForceOpp[] = [];
            for (let i = 0; i < 15; i++) {
                opps.push({
                    id: gen_uid('sf_opp_'),
                    name: `SF Opp ${i}`,
                    stage: 'Prospecting',
                    amt: Math.random() * 100000,
                    close_dt: new Date().toISOString().split('T')[0]
                });
            }
            r(opps);
        }, 800));
    }
}

export interface OracleDBRow {
    [key: string]: any;
}

export class OracleDataWarehouseSvc {
    private static inst: OracleDataWarehouseSvc;
    private constructor() {}
    public static get_inst(): OracleDataWarehouseSvc {
        if (!OracleDataWarehouseSvc.inst) {
            OracleDataWarehouseSvc.inst = new OracleDataWarehouseSvc();
        }
        return OracleDataWarehouseSvc.inst;
    }
    public async query_db(sql: string): Promise<OracleDBRow[]> {
        return new Promise(r => setTimeout(() => {
            const rows: OracleDBRow[] = [];
            for (let i = 0; i < 100; i++) {
                rows.push({ id: i, value: Math.random(), metadata: `oracle_row_${i}` });
            }
            r(rows);
        }, 1200));
    }
}

export interface MarqetaCard {
    token: string;
    pan: string;
    exp: string;
    state: 'ACTIVE' | 'SUSPENDED';
}
export class MarqetaCardIssuingSvc {
    private static inst: MarqetaCardIssuingSvc;
    private constructor() {}
    public static get_inst(): MarqetaCardIssuingSvc {
        if (!MarqetaCardIssuingSvc.inst) {
            MarqetaCardIssuingSvc.inst = new MarqetaCardIssuingSvc();
        }
        return MarqetaCardIssuingSvc.inst;
    }
    public async list_cards(): Promise<MarqetaCard[]> {
        return new Promise(r => setTimeout(() => r([{ token: gen_uid('mq_'), pan: '5555...1234', exp: '12/28', state: 'ACTIVE' }]), 400));
    }
}

export interface ShopifyOrder {
    id: number;
    total_price: string;
    created_at: string;
}

export class ShopifyEcommSvc {
    private static inst: ShopifyEcommSvc;
    private constructor() {}
    public static get_inst(): ShopifyEcommSvc {
        if (!ShopifyEcommSvc.inst) {
            ShopifyEcommSvc.inst = new ShopifyEcommSvc();
        }
        return ShopifyEcommSvc.inst;
    }
    public async get_orders(): Promise<ShopifyOrder[]> {
        return new Promise(r => setTimeout(() => {
            const orders: ShopifyOrder[] = [];
            for (let i = 0; i < 75; i++) {
                orders.push({
                    id: i,
                    total_price: (Math.random() * 500).toFixed(2),
                    created_at: new Date().toISOString()
                });
            }
            r(orders);
        }, 550));
    }
}

export interface GithubRepoCommit {
    sha: string;
    msg: string;
    author: string;
    dt: string;
}

export class GithubDevSvc {
    private static inst: GithubDevSvc;
    private constructor() {}
    public static get_inst(): GithubDevSvc {
        if (!GithubDevSvc.inst) {
            GithubDevSvc.inst = new GithubDevSvc();
        }
        return GithubDevSvc.inst;
    }
    public async get_commits(repo: string): Promise<GithubRepoCommit[]> {
        return new Promise(r => setTimeout(() => {
            const commits: GithubRepoCommit[] = [];
            for(let i=0; i<20; ++i) {
                commits.push({sha: gen_uid('sha_'), msg: `feat: commit ${i}`, author: 'dev', dt: new Date().toISOString()});
            }
            r(commits);
        }, 350));
    }
}


export interface HuggingFaceModelInf {
    result: any;
    compute_time: number;
}
export class HuggingFaceAISvc {
    private static inst: HuggingFaceAISvc;
    private constructor() {}
    public static get_inst(): HuggingFaceAISvc {
        if (!HuggingFaceAISvc.inst) {
            HuggingFaceAISvc.inst = new HuggingFaceAISvc();
        }
        return HuggingFaceAISvc.inst;
    }
    public async run_inference(model: string, inputs: any): Promise<HuggingFaceModelInf> {
        return new Promise(r => setTimeout(() => r({
            result: { forecast: Array.from({length: 30}, () => Math.random() * 100000) },
            compute_time: 1.23
        }), 2000));
    }
}

export class PipedreamAutomationSvc {
    private static inst: PipedreamAutomationSvc;
    private constructor() {}
    public static get_inst(): PipedreamAutomationSvc {
        if (!PipedreamAutomationSvc.inst) {
            PipedreamAutomationSvc.inst = new PipedreamAutomationSvc();
        }
        return PipedreamAutomationSvc.inst;
    }
    public async trigger_workflow(id: string, payload: any): Promise<{ success: boolean }> {
        console.log(`Pipedream workflow ${id} triggered with payload`, payload);
        return new Promise(r => setTimeout(() => r({success: true}), 150));
    }
}

export class GoogleCloudStorageSvc {
    private static inst: GoogleCloudStorageSvc;
    private constructor() {}
    public static get_inst(): GoogleCloudStorageSvc {
        if (!GoogleCloudStorageSvc.inst) {
            GoogleCloudStorageSvc.inst = new GoogleCloudStorageSvc();
        }
        return GoogleCloudStorageSvc.inst;
    }
    public async upload_file(bucket: string, name: string, data: any): Promise<{ url: string }> {
        const url = `https://storage.googleapis.com/${bucket}/${name}`;
        return new Promise(r => setTimeout(() => r({url}), 700));
    }
}

export class AzureBlobStorageSvc {
    private static inst: AzureBlobStorageSvc;
    private constructor() {}
    public static get_inst(): AzureBlobStorageSvc {
        if (!AzureBlobStorageSvc.inst) {
            AzureBlobStorageSvc.inst = new AzureBlobStorageSvc();
        }
        return AzureBlobStorageSvc.inst;
    }
    public async upload_blob(container: string, name: string, data: any): Promise<{ url: string }> {
        const url = `https://${container}.blob.core.windows.net/${name}`;
        return new Promise(r => setTimeout(() => r({url}), 750));
    }
}

export class SupabaseDbSvc {
    private static inst: SupabaseDbSvc;
    private constructor() {}
    public static get_inst(): SupabaseDbSvc {
        if (!SupabaseDbSvc.inst) {
            SupabaseDbSvc.inst = new SupabaseDbSvc();
        }
        return SupabaseDbSvc.inst;
    }
    public async insert(table: string, data: any[]): Promise<{ count: number }> {
        return new Promise(r => setTimeout(() => r({count: data.length}), 400));
    }
}

export class VercelDeploySvc {
    private static inst: VercelDeploySvc;
    private constructor() {}
    public static get_inst(): VercelDeploySvc {
        if (!VercelDeploySvc.inst) {
            VercelDeploySvc.inst = new VercelDeploySvc();
        }
        return VercelDeploySvc.inst;
    }
    public async trigger_deploy(hook: string): Promise<{ job_id: string }> {
        return new Promise(r => setTimeout(() => r({job_id: gen_uid('vercel_job_')}), 900));
    }
}

export class TwilioCommSvc {
    private static inst: TwilioCommSvc;
    private constructor() {}
    public static get_inst(): TwilioCommSvc {
        if (!TwilioCommSvc.inst) {
            TwilioCommSvc.inst = new TwilioCommSvc();
        }
        return TwilioCommSvc.inst;
    }
    public async send_sms(to: string, msg: string): Promise<{ sid: string }> {
        return new Promise(r => setTimeout(() => r({sid: gen_uid('twilio_sid_')}), 200));
    }
}

export class AdobeCreativeCloudSvc {
    private static inst: AdobeCreativeCloudSvc;
    private constructor() {}
    public static get_inst(): AdobeCreativeCloudSvc {
        if (!AdobeCreativeCloudSvc.inst) {
            AdobeCreativeCloudSvc.inst = new AdobeCreativeCloudSvc();
        }
        return AdobeCreativeCloudSvc.inst;
    }
    public async get_asset_list(): Promise<{ name: string, type: string }[]> {
        return new Promise(r => setTimeout(() => r([{ name: 'logo.psd', type: 'photoshop'}, { name: 'brochure.indd', type: 'indesign' }]), 600));
    }
}

export class ServiceNexus {
    public readonly plaid = PlaidDataStreamSvc.get_inst();
    public readonly mt = ModernTreasuryOpsSvc.get_inst();
    public readonly gemini = GeminiCryptoExSvc.get_inst();
    public readonly sforce = SalesforceCRMSvc.get_inst();
    public readonly oracle = OracleDataWarehouseSvc.get_inst();
    public readonly marqeta = MarqetaCardIssuingSvc.get_inst();
    public readonly shopify = ShopifyEcommSvc.get_inst();
    public readonly github = GithubDevSvc.get_inst();
    public readonly hf = HuggingFaceAISvc.get_inst();
    public readonly pipedream = PipedreamAutomationSvc.get_inst();
    public readonly gcs = GoogleCloudStorageSvc.get_inst();
    public readonly azure = AzureBlobStorageSvc.get_inst();
    public readonly supabase = SupabaseDbSvc.get_inst();
    public readonly vercel = VercelDeploySvc.get_inst();
    public readonly twilio = TwilioCommSvc.get_inst();
    public readonly adobe = AdobeCreativeCloudSvc.get_inst();

    private static inst: ServiceNexus;
    private constructor() {}
    public static get_inst(): ServiceNexus {
        if (!ServiceNexus.inst) {
            ServiceNexus.inst = new ServiceNexus();
        }
        return ServiceNexus.inst;
    }
}

export const svcs = ServiceNexus.get_inst();

export interface VisualDataPoint {
    dt_key: string;
    dt_sh: string;
    dt_lg: string;
    in_val: number;
    out_val: number;
    forecast_in?: number;
    forecast_out?: number;
    sim_in?: number;
    sim_out?: number;
    crm_val?: number;
    ecomm_val?: number;
}

export interface SimParam {
    key: string;
    lbl: string;
    type: 'num' | 'rng';
    def_val: number;
    min?: number;
    max?: number;
    step?: number;
}

export interface SimScenario {
    id: string;
    name: string;
    params: Record<string, any>;
    analysis: string;
    sim_data: VisualDataPoint[];
}

export interface AppState {
    is_loading: boolean;
    err: string | null;
    plaid_accts: PlaidAcct[];
    plaid_txs: PlaidTx[];
    mt_orders: MTreasuryPmtOrder[];
    gemini_assets: GeminiCryptoAsset[];
    sforce_opps: SForceOpp[];
    shopify_orders: ShopifyOrder[];
    q_params: { s_dt: string; e_dt: string; ccy: string; acct_id: string };
    viz_cfg: { type: 'Bar' | 'Line' | 'Composed'; show_f: boolean; show_s: boolean; agg_lvl: 'd' | 'w' | 'm' };
    sim_scenarios: SimScenario[];
    active_sim_id: string | null;
}

export enum ActionKind {
    SET_LOADING = "SET_LOADING",
    SET_ERROR = "SET_ERROR",
    SET_PLAID_DATA = "SET_PLAID_DATA",
    SET_MT_DATA = "SET_MT_DATA",
    SET_GEMINI_DATA = "SET_GEMINI_DATA",
    SET_SFORCE_DATA = "SET_SFORCE_DATA",
    SET_SHOPIFY_DATA = "SET_SHOPIFY_DATA",
    UPDATE_Q_PARAMS = "UPDATE_Q_PARAMS",
    UPDATE_VIZ_CFG = "UPDATE_VIZ_CFG",
    ADD_SIM_SCENARIO = "ADD_SIM_SCENARIO",
    SET_ACTIVE_SIM = "SET_ACTIVE_SIM",
}

export type AppAction =
  | { type: ActionKind.SET_LOADING; payload: boolean }
  | { type: ActionKind.SET_ERROR; payload: string | null }
  | { type: ActionKind.SET_PLAID_DATA; payload: { accts: PlaidAcct[]; txs: PlaidTx[] } }
  | { type: ActionKind.SET_MT_DATA; payload: MTreasuryPmtOrder[] }
  | { type: ActionKind.SET_GEMINI_DATA; payload: GeminiCryptoAsset[] }
  | { type: ActionKind.SET_SFORCE_DATA; payload: SForceOpp[] }
  | { type: ActionKind.SET_SHOPIFY_DATA; payload: ShopifyOrder[] }
  | { type: ActionKind.UPDATE_Q_PARAMS; payload: Partial<AppState['q_params']> }
  | { type: ActionKind.UPDATE_VIZ_CFG; payload: Partial<AppState['viz_cfg']> }
  | { type: ActionKind.ADD_SIM_SCENARIO; payload: SimScenario }
  | { type: ActionKind.SET_ACTIVE_SIM; payload: string | null };

const get_def_s_dt = () => {
    const dt = new Date();
    dt.setMonth(dt.getMonth() - 3);
    return dt.toISOString().split('T')[0];
};

export const initial_app_state: AppState = {
    is_loading: true,
    err: null,
    plaid_accts: [],
    plaid_txs: [],
    mt_orders: [],
    gemini_assets: [],
    sforce_opps: [],
    shopify_orders: [],
    q_params: { s_dt: get_def_s_dt(), e_dt: new Date().toISOString().split('T')[0], ccy: 'USD', acct_id: '' },
    viz_cfg: { type: 'Composed', show_f: false, show_s: false, agg_lvl: 'd' },
    sim_scenarios: [],
    active_sim_id: null,
};

export const app_reducer = (s: AppState, a: AppAction): AppState => {
    switch (a.type) {
        case ActionKind.SET_LOADING: return { ...s, is_loading: a.payload };
        case ActionKind.SET_ERROR: return { ...s, err: a.payload, is_loading: false };
        case ActionKind.SET_PLAID_DATA: return { ...s, plaid_accts: a.payload.accts, plaid_txs: a.payload.txs, q_params: { ...s.q_params, acct_id: a.payload.accts[0]?.acct_id || '' } };
        case ActionKind.SET_MT_DATA: return { ...s, mt_orders: a.payload };
        case ActionKind.SET_GEMINI_DATA: return { ...s, gemini_assets: a.payload };
        case ActionKind.SET_SFORCE_DATA: return { ...s, sforce_opps: a.payload };
        case ActionKind.SET_SHOPIFY_DATA: return { ...s, shopify_orders: a.payload };
        case ActionKind.UPDATE_Q_PARAMS: return { ...s, q_params: { ...s.q_params, ...a.payload } };
        case ActionKind.UPDATE_VIZ_CFG: return { ...s, viz_cfg: { ...s.viz_cfg, ...a.payload } };
        case ActionKind.ADD_SIM_SCENARIO: return { ...s, sim_scenarios: [...s.sim_scenarios, a.payload] };
        case ActionKind.SET_ACTIVE_SIM: return { ...s, active_sim_id: a.payload };
        default: return s;
    }
};

export const AppCtx = createContext<{ s: AppState; dsp: React.Dispatch<AppAction>; } | undefined>(undefined);

export const use_app_ctx = () => {
    const ctx = useContext(AppCtx);
    if (!ctx) throw new Error("use_app_ctx must be used within a provider");
    return ctx;
};

export const AppCtxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [s, dsp] = useReducer(app_reducer, initial_app_state);

    useEffect(() => {
        const init_load = async () => {
            dsp({ type: ActionKind.SET_LOADING, payload: true });
            try {
                const [plaid_accts, mt_orders, gemini_assets, sforce_opps, shopify_orders] = await Promise.all([
                    svcs.plaid.get_accts(),
                    svcs.mt.list_pmt_orders(),
                    svcs.gemini.get_assets(),
                    svcs.sforce.fetch_open_opps(),
                    svcs.shopify.get_orders(),
                ]);
                const plaid_txs = plaid_accts.length > 0 ? await svcs.plaid.get_txs(plaid_accts[0].acct_id, s.q_params.s_dt, s.q_params.e_dt) : [];
                dsp({ type: ActionKind.SET_PLAID_DATA, payload: { accts: plaid_accts, txs: plaid_txs } });
                dsp({ type: ActionKind.SET_MT_DATA, payload: mt_orders });
                dsp({ type: ActionKind.SET_GEMINI_DATA, payload: gemini_assets });
                dsp({ type: ActionKind.SET_SFORCE_DATA, payload: sforce_opps });
                dsp({ type: ActionKind.SET_SHOPIFY_DATA, payload: shopify_orders });
            } catch (e: any) {
                dsp({ type: ActionKind.SET_ERROR, payload: e.message });
            } finally {
                dsp({ type: ActionKind.SET_LOADING, payload: false });
            }
        };
        init_load();
    }, []);

    useEffect(() => {
        const fetch_txs = async () => {
            if (!s.q_params.acct_id) return;
            dsp({ type: ActionKind.SET_LOADING, payload: true });
            try {
                const txs = await svcs.plaid.get_txs(s.q_params.acct_id, s.q_params.s_dt, s.q_params.e_dt);
                dsp({ type: ActionKind.SET_PLAID_DATA, payload: { accts: s.plaid_accts, txs } });
            } catch (e: any) {
                dsp({ type: ActionKind.SET_ERROR, payload: e.message });
            } finally {
                dsp({ type: ActionKind.SET_LOADING, payload: false });
            }
        };
        fetch_txs();
    }, [s.q_params.acct_id, s.q_params.s_dt, s.q_params.e_dt]);


    return <AppCtx.Provider value={{ s, dsp }}>{children}</AppCtx.Provider>;
};

export const CstmButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { v?: 'p' | 's' | 'd' | 'g', sz?: 'sm' | 'md' | 'lg' }> = ({ children, v = 'p', sz = 'md', className, ...p }) => {
    const base_cls = "font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2";
    const v_cls = {
        p: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        s: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
        d: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        g: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300",
    };
    const sz_cls = { sm: "text-sm px-3 py-1.5", md: "text-base px-4 py-2", lg: "text-lg px-6 py-3" };
    return <button className={`${base_cls} ${v_cls[v]} ${sz_cls[sz]} ${className || ""}`} {...p}>{children}</button>;
};

export const CstmInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { lbl?: string }> = ({ lbl, className, ...p }) => (
    <div className="flex flex-col gap-1">
        {lbl && <label className="text-sm font-medium text-gray-700">{lbl}</label>}
        <input className={`border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${className || ""}`} {...p} />
    </div>
);

export const CstmSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { lbl?: string, opts: { val: string, lbl: string }[] }> = ({ lbl, opts, className, ...p }) => (
    <div className="flex flex-col gap-1">
        {lbl && <label className="text-sm font-medium text-gray-700">{lbl}</label>}
        <select className={`border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${className || ""}`} {...p}>
            {opts.map(o => <option key={o.val} value={o.val}>{o.lbl}</option>)}
        </select>
    </div>
);

export function dt_fmt_key(n: number): "dt_lg" | "dt_sh" | "dt_key" {
  if (n < 8) return "dt_lg";
  if (n === 8) return "dt_sh";
  return "dt_key";
}

export function use_processed_data() {
    const { s } = use_app_ctx();
    return useMemo(() => {
        const agg: Record<string, { in_val: number; out_val: number; crm_val: number; ecomm_val: number }> = {};
        
        const proc_dt = (d: Date, lvl: 'd' | 'w' | 'm') => {
            if (lvl === 'd') return d.toISOString().split('T')[0];
            if (lvl === 'm') return d.toISOString().substring(0, 7);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1);
            return new Date(d.setDate(diff)).toISOString().split('T')[0];
        };

        s.plaid_txs.forEach(tx => {
            const dt = proc_dt(new Date(tx.dt), s.viz_cfg.agg_lvl);
            if (!agg[dt]) agg[dt] = { in_val: 0, out_val: 0, crm_val: 0, ecomm_val: 0 };
            if (tx.amt < 0) agg[dt].in_val += -tx.amt;
            else agg[dt].out_val -= tx.amt;
        });

        s.sforce_opps.forEach(o => {
            const dt = proc_dt(new Date(o.close_dt), s.viz_cfg.agg_lvl);
            if(agg[dt]) agg[dt].crm_val += o.amt;
        });

        s.shopify_orders.forEach(o => {
            const dt = proc_dt(new Date(o.created_at), s.viz_cfg.agg_lvl);
            if(agg[dt]) agg[dt].ecomm_val += parseFloat(o.total_price);
        });

        return Object.entries(agg)
            .sort(([dA], [dB]) => dA.localeCompare(dB))
            .map(([dt, v]): VisualDataPoint => ({
                dt_key: dt,
                dt_sh: dt,
                dt_lg: new Date(dt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
                in_val: v.in_val,
                out_val: v.out_val,
                crm_val: v.crm_val,
                ecomm_val: v.ecomm_val,
            }));
    }, [s.plaid_txs, s.sforce_opps, s.shopify_orders, s.viz_cfg.agg_lvl]);
}

export const CstmTooltipComponent = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const pld = payload[0].payload as VisualDataPoint;
    return (
      <div className="rounded-md border bg-white p-4 drop-shadow-md min-w-[250px] shadow-lg">
        <p className="font-bold text-lg text-gray-800">{pld.dt_lg}</p>
        <hr className="my-2"/>
        {payload.map(p => (
            <div key={p.name} className="flex justify-between items-center text-sm">
                <span style={{color: p.color}}>{p.name}:</span>
                <span className="font-mono">{abrv_amt(p.value || 0, 'USD')}</span>
            </div>
        ))}
      </div>
    );
  }
  return null;
};

export const CstmLegendComponent = (props: LegendProps) => {
    const { payload } = props;
    if (!payload) return null;
    return (
        <div className="flex flex-wrap justify-center items-center gap-4 mt-4">
            {payload.map((e, i) => (
                <div key={`item-${i}`} className="flex items-center gap-2 text-xs text-gray-600">
                    <div style={{ width: 12, height: 12, backgroundColor: e.color, borderRadius: 2 }} />
                    <span>{e.value}</span>
                </div>
            ))}
        </div>
    );
};

export const ConfigNexusPanel = () => {
    const { s, dsp } = use_app_ctx();
    const handle_update = useCallback((f: keyof AppState['q_params'], v: string) => {
        dsp({ type: ActionKind.UPDATE_Q_PARAMS, payload: { [f]: v } });
    }, [dsp]);
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Stream Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <CstmSelect lbl="Account" value={s.q_params.acct_id} onChange={(e) => handle_update('acct_id', e.target.value)} opts={s.plaid_accts.map(a => ({ val: a.acct_id, lbl: `${a.name} (...${a.mask})` }))} />
                <CstmInput lbl="Start Date" type="date" value={s.q_params.s_dt} onChange={e => handle_update('s_dt', e.target.value)} />
                <CstmInput lbl="End Date" type="date" value={s.q_params.e_dt} onChange={e => handle_update('e_dt', e.target.value)} />
                <CstmSelect lbl="Currency" value={s.q_params.ccy} onChange={e => handle_update('ccy', e.target.value)} opts={s.gemini_assets.map(a => ({val: a.sym, lbl: a.name}))} />
            </div>
        </div>
    );
};


export const VizControlPanel = () => {
    const { s, dsp } = use_app_ctx();

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Visualization Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <CstmSelect lbl="Chart Type" value={s.viz_cfg.type} onChange={e => dsp({ type: ActionKind.UPDATE_VIZ_CFG, payload: { type: e.target.value as any } })} opts={[{ val: 'Bar', lbl: 'Bar'}, { val: 'Line', lbl: 'Line' }, { val: 'Composed', lbl: 'Composed' }]} />
                <CstmSelect lbl="Aggregation" value={s.viz_cfg.agg_lvl} onChange={e => dsp({ type: ActionKind.UPDATE_VIZ_CFG, payload: { agg_lvl: e.target.value as any } })} opts={[{ val: 'd', lbl: 'Daily'}, { val: 'w', lbl: 'Weekly' }, { val: 'm', lbl: 'Monthly' }]} />
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <input id="show_f" type="checkbox" checked={s.viz_cfg.show_f} onChange={e => dsp({ type: ActionKind.UPDATE_VIZ_CFG, payload: { show_f: e.target.checked } })} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"/>
                        <label htmlFor="show_f" className="text-sm font-medium text-gray-700">Show Forecast</label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input id="show_s" type="checkbox" checked={s.viz_cfg.show_s} onChange={e => dsp({ type: ActionKind.UPDATE_VIZ_CFG, payload: { show_s: e.target.checked } })} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"/>
                        <label htmlFor="show_s" className="text-sm font-medium text-gray-700">Show Simulation</label>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const SimulationEngineUI = ({ base_data }: { base_data: VisualDataPoint[] }) => {
    const { s, dsp } = use_app_ctx();
    const [name, setName] = useState('');
    const [params, setParams] = useState({ in_mult: 1, out_mult: 1, crm_mult: 1, ecomm_mult: 1 });

    const handle_create_sim = async () => {
        const sim_data = base_data.map(d => ({
            ...d,
            sim_in: d.in_val * params.in_mult,
            sim_out: d.out_val * params.out_mult
        }));

        const hf_res = await svcs.hf.run_inference('text-generation', { 
            prompt: `Analyze this financial simulation: Inflows multiplied by ${params.in_mult}, Outflows by ${params.out_mult}.`
        });
        
        const new_sim: SimScenario = {
            id: gen_uid('sim_'),
            name,
            params,
            sim_data,
            analysis: `AI Analysis: Based on your parameters, a significant shift in net flow is projected. Compute time: ${hf_res.compute_time}s.`
        };

        dsp({ type: ActionKind.ADD_SIM_SCENARIO, payload: new_sim });
        dsp({ type: ActionKind.SET_ACTIVE_SIM, payload: new_sim.id });
        await svcs.pipedream.trigger_workflow('wf_sim_created', new_sim);
    };
    
    const active_sim = useMemo(() => s.sim_scenarios.find(sc => sc.id === s.active_sim_id), [s.sim_scenarios, s.active_sim_id]);

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Simulation Engine</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-gray-50 p-4 rounded-md border">
                    <h4 className="font-medium mb-3">Create Scenario</h4>
                    <CstmInput lbl="Scenario Name" value={name} onChange={e => setName(e.target.value)} className="mb-2" />
                    <CstmInput lbl="Inflow Multiplier" type="number" step="0.1" value={params.in_mult} onChange={e => setParams(p => ({...p, in_mult: parseFloat(e.target.value)}))} className="mb-2"/>
                    <CstmInput lbl="Outflow Multiplier" type="number" step="0.1" value={params.out_mult} onChange={e => setParams(p => ({...p, out_mult: parseFloat(e.target.value)}))} className="mb-2"/>
                    <CstmButton onClick={handle_create_sim} className="w-full mt-2">Generate & Activate</CstmButton>
                </div>
                <div className="md:col-span-2 bg-gray-50 p-4 rounded-md border">
                     <h4 className="font-medium mb-3">Manage Scenarios</h4>
                     <CstmSelect lbl="Active Scenario" value={s.active_sim_id || 'none'} onChange={e => dsp({type: ActionKind.SET_ACTIVE_SIM, payload: e.target.value === 'none' ? null : e.target.value })} opts={[{ val: 'none', lbl: 'None' }, ...s.sim_scenarios.map(sc => ({ val: sc.id, lbl: sc.name }))]}/>
                     {active_sim && (
                         <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-800">
                             <p className="font-bold">{active_sim.name}</p>
                             <p className="text-sm italic mt-2">{active_sim.analysis}</p>
                         </div>
                     )}
                </div>
            </div>
        </div>
    );
};


export const MultiLayeredFinancialChart = () => {
    const { s } = use_app_ctx();
    const chart_ref = useRef(null);
    const base_data = use_processed_data();
    
    const combined_data = useMemo(() => {
        const active_sim = s.sim_scenarios.find(sc => sc.id === s.active_sim_id);
        if (!s.viz_cfg.show_s || !active_sim) return base_data;
        
        return base_data.map((d, i) => ({
            ...d,
            sim_in: active_sim.sim_data[i]?.sim_in,
            sim_out: active_sim.sim_data[i]?.sim_out,
        }));
    }, [base_data, s.viz_cfg.show_s, s.active_sim_id, s.sim_scenarios]);

    if (s.is_loading && combined_data.length === 0) {
        return <div style={{height: 400}}><ChartLoader/></div>;
    }
    if (s.err) {
        return <div className="text-red-500">Error: {s.err}</div>;
    }
    if (combined_data.length === 0) {
        return <div style={{height: 400}}><PlaceholderLineChart /></div>
    }

    return (
        <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={combined_data} stackOffset="sign" ref={chart_ref} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.gray["100"]} />
                <XAxis dataKey={dt_fmt_key(combined_data.length)} {...XAxisProps} angle={-45} textAnchor="end" />
                <YAxis yAxisId="left" orientation="left" stroke={colors.categorical["7"]} />
                <YAxis yAxisId="right" orientation="right" stroke={colors.orange["500"]} />
                <Tooltip content={<CstmTooltipComponent />} />
                <Legend content={<CstmLegendComponent />} verticalAlign="bottom" wrapperStyle={{paddingTop: 40}} />
                <ReferenceLine y={0} stroke="#000" yAxisId="left" />

                <Bar yAxisId="left" dataKey="in_val" name="Inflow" fill={colors.categorical["7"]} stackId="a" />
                <Bar yAxisId="left" dataKey="out_val" name="Outflow" fill={colors.qualitative.neutral} stackId="a" />

                {s.viz_cfg.show_s && <Line yAxisId="left" type="monotone" dataKey="sim_in" name="Simulated Inflow" stroke={colors.blue["500"]} strokeDasharray="5 5" dot={false} />}
                {s.viz_cfg.show_s && <Line yAxisId="left" type="monotone" dataKey="sim_out" name="Simulated Outflow" stroke={colors.red["500"]} strokeDasharray="5 5" dot={false} />}

                <Area yAxisId="right" type="monotone" dataKey="crm_val" name="CRM Pipeline" fill={colors.orange["200"]} stroke={colors.orange["500"]} />
                <Area yAxisId="right" type="monotone" dataKey="ecomm_val" name="E-commerce Sales" fill={colors.green["200"]} stroke={colors.green["500"]} />

            </ComposedChart>
        </ResponsiveContainer>
    );
};


export const EnterpriseCashflowNexus = () => {
    return (
        <AppCtxProvider>
            <NexusDashboard />
        </AppCtxProvider>
    )
}

export const NexusDashboard = () => {
    const { s } = use_app_ctx();
    const base_data = use_processed_data();
    
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800">{GLOBAL_COMPANY_NAME}</h1>
                <p className="text-lg text-gray-600">Unified Financial Command Center</p>
                <p className="text-xs text-gray-400">Powered by {GLOBAL_BASE_URL}</p>
            </header>
            
            <ConfigNexusPanel />
            <VizControlPanel />
            <SimulationEngineUI base_data={base_data} />

            <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Multi-Dimensional Cash Flow Analysis</h2>
                <MultiLayeredFinancialChart />
            </div>
            
            <footer className="mt-12 text-center text-xs text-gray-400">
                Integrations: Gemini, Plaid, Modern Treasury, Github, Hugging Face, Pipedream, Google Cloud, Azure, Supabase, Vercel, Salesforce, Oracle, MARQETA, Citibank, Shopify, Woo Commerce, GoDaddy, Cpanel, Adobe, Twilio and more.
            </footer>
        </div>
    );
};

export default EnterpriseCashflowNexus;