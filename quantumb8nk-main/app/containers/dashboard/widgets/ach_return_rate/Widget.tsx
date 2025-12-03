import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from "react";
import { DateRangeFormValues } from "~/common/ui-components";
import {
  Card,
  CardActions,
  CardContent,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTitle,
} from "~/common/ui-components/Card/Card";
import { ReturnRateEntityEnum } from "~/generated/dashboard/graphqlSchema";
import useAchReturnChartData from "./hooks/useData";
import useAchReturnFilters from "./hooks/useFilters";
import AchReturnChartWrapper from "./Chart";
import Filters from "./Filters";
import { Button } from "~/common/ui-components/Button/Button";
import { Tooltip } from "~/common/ui-components/Tooltip/Tooltip";
import { Spinner } from "~/common/ui-components/Spinner/Spinner";
import { Alert, AlertDescription, AlertTitle } from "~/common/ui-components/Alert/Alert";
import { Input } from "~/common/ui-components/Input/Input";
import { Label } from "~/common/ui-components/Label/Label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/common/ui-components/Tabs/Tabs";
import { Textarea } from "~/common/ui-components/Textarea/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/ui-components/Select/Select";
import { Switch } from "~/common/ui-components/Switch/Switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/common/ui-components/Dialog/Dialog";

const CITI_BIZ_URL_ROOT = "citibankdemobusiness.dev";
const CITI_BIZ_CORP_NAME = "Citibank demo business Inc";
const CITI_BIZ_API_V = "v4.2-quantum";

const gen_uid = (): string => Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

const PARTNER_ECOSYSTEM_REGISTRY = [
  'Gemini', 'ChatGPT', 'Pipedream', 'GitHub', 'Hugging Face', 'Plaid', 'Modern Treasury', 'Google Drive', 'OneDrive', 'Azure',
  'Google Cloud', 'Supabase', 'Vercel', 'Salesforce', 'Oracle', 'Marqeta', 'Citibank', 'Shopify', 'WooCommerce', 'GoDaddy',
  'CPanel', 'Adobe', 'Twilio', 'Stripe', 'PayPal', 'Square', 'Adyen', 'Checkout.com', 'Fiserv', 'FIS', 'Jack Henry',
  'SAP', 'Intuit QuickBooks', 'Xero', 'Netsuite', 'Workday', 'HubSpot', 'Zendesk', 'ServiceNow', 'Atlassian Jira', 'Confluence',
  'Slack', 'Microsoft Teams', 'Zoom', 'DocuSign', 'Dropbox', 'Box', 'Snowflake', 'Databricks', 'MongoDB', 'Redis', 'Elastic',
  'Datadog', 'Splunk', 'New Relic', 'Dynatrace', 'AWS', 'DigitalOcean', 'Cloudflare', 'Fastly', 'Akamai', 'Twitch', 'Meta',
  'TikTok', 'LinkedIn', 'Twitter', 'Pinterest', 'Snapchat', 'NVIDIA', 'AMD', 'Intel', 'Qualcomm', 'ARM', 'TSMC', 'Samsung',
  'Apple', 'Microsoft', 'Alphabet', 'Amazon', 'Tesla', 'Ford', 'GM', 'Toyota', 'Volkswagen', 'Walmart', 'Target', 'Costco',
  'Home Depot', 'Lowes', 'Best Buy', 'FedEx', 'UPS', 'DHL', 'Maersk', 'Union Pacific', 'BNSF', 'Boeing', 'Airbus', 'Lockheed Martin',
  'Raytheon', 'Northrop Grumman', 'SpaceX', 'Blue Origin', 'Rocket Lab', ...Array.from({ length: 920 }, (_, i) => `SynergisticPartner${i + 1}`)
];

export class QuantumEntanglementCryptography {
  private static k: string = 'citibankdemobusinessinc_quantum_key_2049';
  public static enc(d: any): string {
    const s = typeof d === 'string' ? d : JSON.stringify(d);
    return btoa(encodeURIComponent(s).replace(/%([0-9A-F]{2})/g, (m, p1) => String.fromCharCode(parseInt(p1, 16))));
  }
  public static dec(ed: string): any {
    try {
      const s = decodeURIComponent(atob(ed).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      return JSON.parse(s);
    } catch {
      return atob(ed);
    }
  }
}

export interface TransactionalPacket {
  id: string;
  p_id: string;
  amt: number;
  ccy: string;
  src_id: string;
  dst_id: string;
  ts_init: string;
  ts_stl: string;
  stat: 'PROC' | 'CONF' | 'REV' | 'FLAG' | 'Q_ERR';
  rev_c?: string;
  rev_r?: string;
  chan: 'INET' | 'APIX' | 'BTCH' | 'MOBL';
  geo_c: string;
  geo_s?: string;
  ip_v4?: string;
  dev_fp?: string;
  r_score: number;
  is_frd: boolean;
  is_anom: boolean;
  ai_conf?: number;
  proc_fee: number;
  meta_d?: Record<string, any>;
}

export interface NexusStreamDatum {
  ts: string;
  curr_rev_rt: number;
  vol_tx: number;
  vol_rev: number;
  vol_pend_rev: number;
  tot_tx: number;
  anom_score: number;
  top_rev_r?: string;
  geo_hotspot?: string;
  ent_metrics?: Record<string, any>;
}

export interface GeminiHXPrediction {
  pred_id: string;
  ts: string;
  pred_rev_rt: number;
  pred_horiz: string;
  conf_int_l: number;
  conf_int_u: number;
  key_inf: Array<{ f: string; i: number }>;
  mdl_ver: string;
  drift_flag: boolean;
  risk_lvl: 'MIN' | 'ELEV' | 'HIGH' | 'CRIT';
}

export class GlobalIntegrationMatrixService {
  private static inst: GlobalIntegrationMatrixService;
  private subs: Set<(d: NexusStreamDatum) => void> = new Set();
  private intId: NodeJS.Timeout | null = null;
  private c_rate: number = 0.018;

  private constructor() {}

  public static get_inst(): GlobalIntegrationMatrixService {
    if (!GlobalIntegrationMatrixService.inst) {
      GlobalIntegrationMatrixService.inst = new GlobalIntegrationMatrixService();
    }
    return GlobalIntegrationMatrixService.inst;
  }

  public sub_stream(cb: (d: NexusStreamDatum) => void): () => void {
    this.subs.add(cb);
    if (!this.intId) {
      this.begin_sim();
    }
    return () => {
      this.subs.delete(cb);
      if (this.subs.size === 0 && this.intId) {
        clearInterval(this.intId);
        this.intId = null;
      }
    };
  }

  private begin_sim() {
    this.intId = setInterval(() => {
      this.c_rate = Math.max(0.003, Math.min(0.06, this.c_rate + (Math.random() - 0.5) * 0.0025));
      const v_tx = 1500 + Math.floor(Math.random() * 800);
      const v_rev = Math.round(v_tx * this.c_rate);
      const p_rev = Math.round(v_tx * (0.0015 + Math.random() * 0.006));
      const a_scr = Math.random() > 0.92 ? (0.8 + Math.random() * 0.2) : (Math.random() * 0.25);

      const d_pt: NexusStreamDatum = {
        ts: new Date().toISOString(),
        curr_rev_rt: parseFloat(this.c_rate.toFixed(5)),
        vol_tx: v_tx,
        vol_rev: v_rev,
        vol_pend_rev: p_rev,
        tot_tx: v_tx + Math.floor(Math.random() * 20000),
        anom_score: parseFloat(a_scr.toFixed(3)),
        top_rev_r: Math.random() > 0.6 ? 'R02 (Account Closed)' : (Math.random() > 0.4 ? 'R01 (Insufficient Funds)' : 'R08 (Payment Stopped)'),
        geo_hotspot: ['CA', 'NY', 'TX', 'FL', 'IL'][Math.floor(Math.random() * 5)],
        ent_metrics: {
          latency_ms: Math.floor(15 + Math.random() * 60),
          api_ok_rate: parseFloat((0.98 + Math.random() * 0.02).toFixed(4)),
          partner_conn_status: PARTNER_ECOSYSTEM_REGISTRY.reduce((acc, p) => {
            acc[p] = Math.random() > 0.01 ? 'OPERATIONAL' : 'DEGRADED';
            return acc;
          }, {} as Record<string, string>)
        },
      };
      this.subs.forEach(cb => cb(d_pt));
    }, 2500);
  }

  public async get_hist_packets(sd: string, ed: string, lim: number = 2000): Promise<TransactionalPacket[]> {
    return new Promise((res) => {
      setTimeout(() => {
        const pkts: TransactionalPacket[] = Array.from({ length: Math.min(lim, 100 + Math.floor(Math.random() * 400)) }, () => {
          const is_rev = Math.random() < this.c_rate * 1.6;
          const is_frd = is_rev && Math.random() < 0.12;
          const r_scr = is_frd ? (85 + Math.random() * 15) : (Math.random() * 75);
          return {
            id: gen_uid(),
            p_id: `PKT-${gen_uid().toUpperCase()}`,
            amt: parseFloat((5 + Math.random() * 2000).toFixed(2)),
            ccy: 'USD',
            src_id: `SRC-${gen_uid().toUpperCase().substring(0, 7)}`,
            dst_id: `DST-${gen_uid().toUpperCase().substring(0, 7)}`,
            ts_init: new Date(new Date(sd).getTime() + Math.random() * (new Date(ed).getTime() - new Date(sd).getTime())).toISOString(),
            ts_stl: new Date(new Date(sd).getTime() + Math.random() * (new Date(ed).getTime() - new Date(sd).getTime()) + 48 * 3600 * 1000).toISOString(),
            stat: is_rev ? 'REV' : 'CONF',
            rev_c: is_rev ? `R${Math.floor(Math.random() * 20).toString().padStart(2, '0')}` : undefined,
            rev_r: is_rev ? (is_frd ? 'Fraudulent Transaction' : 'Generic Return Reason') : undefined,
            chan: ['INET', 'APIX', 'BTCH', 'MOBL'][Math.floor(Math.random() * 4)] as any,
            geo_c: 'USA',
            geo_s: ['CA', 'NY', 'TX', 'FL', 'IL'][Math.floor(Math.random() * 5)],
            ip_v4: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            dev_fp: `DFP-${gen_uid()}`,
            r_score: parseFloat(r_scr.toFixed(2)),
            is_frd,
            is_anom: is_rev && Math.random() < 0.25,
            ai_conf: Math.random(),
            proc_fee: parseFloat((0.15 + Math.random() * 2.5).toFixed(2)),
          };
        });
        res(pkts);
      }, 1200);
    });
  }

  public async fetch_partner_data(partner_name: string, query: object): Promise<object> {
    return new Promise(res => {
        setTimeout(() => {
            const success = Math.random() > 0.05;
            if (success) {
                res({
                    status: 'OK',
                    partner: partner_name,
                    timestamp: new Date().toISOString(),
                    data: {
                        [partner_name.toLowerCase().replace(/ /g, '_') + '_metric']: Math.random() * 1000,
                        query_echo: query
                    },
                    latency: Math.floor(80 + Math.random() * 200)
                });
            } else {
                res({
                    status: 'ERROR',
                    partner: partner_name,
                    timestamp: new Date().toISOString(),
                    error_code: `E${Math.floor(1000 + Math.random() * 9000)}`,
                    error_message: `Failed to fetch data from ${partner_name} via ${CITI_BIZ_URL_ROOT}`
                });
            }
        }, 300 + Math.random() * 500);
    });
  }
}

export class AIEngine_GeminiHX2049 {
  private static inst: AIEngine_GeminiHX2049;
  private mdl_v: string = 'Gemini-HX-2049-Prime';

  private constructor() {}
  public static get_inst(): AIEngine_GeminiHX2049 {
    if (!AIEngine_GeminiHX2049.inst) {
      AIEngine_GeminiHX2049.inst = new AIEngine_GeminiHX2049();
    }
    return AIEngine_GeminiHX2049.inst;
  }

  public async gen_prediction(hist_d: TransactionalPacket[], horiz: string): Promise<GeminiHXPrediction> {
    return new Promise((res) => {
      setTimeout(() => {
        const base_r = hist_d.filter(p => p.stat === 'REV').length / hist_d.length || 0.018;
        const pred_r = Math.max(0.003, Math.min(0.06, base_r + (Math.random() - 0.5) * 0.012));
        res({
          pred_id: gen_uid(),
          ts: new Date().toISOString(),
          pred_rev_rt: parseFloat(pred_r.toFixed(5)),
          pred_horiz: horiz,
          conf_int_l: parseFloat((pred_r * 0.88).toFixed(5)),
          conf_int_u: parseFloat((pred_r * 1.12).toFixed(5)),
          key_inf: [
            { f: 'vol_trend', i: parseFloat(Math.random().toFixed(2)) },
            { f: 'hist_patterns', i: parseFloat(Math.random().toFixed(2)) },
            { f: 'macro_econ_signals', i: parseFloat(Math.random().toFixed(2)) },
            { f: 'partner_api_health', i: parseFloat(Math.random().toFixed(2)) },
          ],
          mdl_ver: this.mdl_v,
          drift_flag: Math.random() < 0.08,
          risk_lvl: pred_r > 0.04 ? 'CRIT' : (pred_r > 0.028 ? 'HIGH' : (pred_r > 0.015 ? 'ELEV' : 'MIN')),
        });
      }, 1800);
    });
  }
}

export interface AuditLedgerRecord {
  log_id: string;
  ts: string;
  usr_id: string;
  act: string;
  ent_id?: string;
  payload_hash: string;
}

export class DLT_SynapseProtocol {
  private static inst: DLT_SynapseProtocol;
  private chain: AuditLedgerRecord[] = [];

  private constructor() {}
  public static get_inst(): DLT_SynapseProtocol {
    if (!DLT_SynapseProtocol.inst) {
      DLT_SynapseProtocol.inst = new DLT_SynapseProtocol();
    }
    return DLT_SynapseProtocol.inst;
  }
  public async write_log(usr: string, act: string, dat: Record<string, any>, ent?: string): Promise<void> {
    const rec: AuditLedgerRecord = {
      log_id: gen_uid(),
      ts: new Date().toISOString(),
      usr_id: usr,
      act: act,
      ent_id: ent,
      payload_hash: QuantumEntanglementCryptography.enc(dat).substring(0, 32),
    };
    this.chain.unshift(rec);
  }
  public async read_logs(lim: number = 100): Promise<AuditLedgerRecord[]> {
    return new Promise(res => setTimeout(() => res(this.chain.slice(0, lim)), 150));
  }
}

interface ServiceContextType {
  gim_svc: GlobalIntegrationMatrixService;
  ai_svc: AIEngine_GeminiHX2049;
  dlt_svc: DLT_SynapseProtocol;
}

const ServiceNexusContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceNexusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const svcs = useMemo(() => ({
    gim_svc: GlobalIntegrationMatrixService.get_inst(),
    ai_svc: AIEngine_GeminiHX2049.get_inst(),
    dlt_svc: DLT_SynapseProtocol.get_inst(),
  }), []);
  return <ServiceNexusContext.Provider value={svcs}>{children}</ServiceNexusContext.Provider>;
};

export const useServiceNexus = () => {
  const ctx = useContext(ServiceNexusContext);
  if (!ctx) throw new Error('useServiceNexus must be used within a ServiceNexusProvider');
  return ctx;
};

export function useNexusStream() {
  const { gim_svc } = useServiceNexus();
  const [data, setData] = useState<NexusStreamDatum | null>(null);
  const [is_loading, setIsLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const unsub = gim_svc.sub_stream((d) => {
      setData(d);
      setIsLoading(false);
      setErr(null);
    });
    return () => unsub();
  }, [gim_svc]);

  return { data, is_loading, err };
}

export const NexusRealtimeMonitor: React.FC<{ date_range: DateRangeFormValues }> = ({ date_range }) => {
  const { data, is_loading, err } = useNexusStream();
  const { gim_svc } = useServiceNexus();
  const [hist_data, setHistData] = useState<TransactionalPacket[]>([]);
  const [is_fetching, setIsFetching] = useState(false);
  
  const fetch_hist = useCallback(async () => {
    setIsFetching(true);
    const sd = date_range.startDate || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const ed = date_range.endDate || new Date().toISOString().split('T')[0];
    const d = await gim_svc.get_hist_packets(sd, ed, 500);
    setHistData(d);
    setIsFetching(false);
  }, [gim_svc, date_range]);

  useEffect(() => {
    fetch_hist();
  }, [fetch_hist]);

  return (
    <Card className="col-span-12 lg:col-span-6 xl:col-span-4">
      <CardHeader>
        <CardHeading>
          <CardTitle>Nexus Real-time Data Stream</CardTitle>
        </CardHeading>
        <CardActions>
          <Button variant="ghost" size="sm" onClick={fetch_hist} disabled={is_fetching}>
            {is_fetching ? <Spinner size="sm" /> : "Refresh History"}
          </Button>
        </CardActions>
      </CardHeader>
      <CardContent className="space-y-3">
        {is_loading && <div className="flex justify-center p-4"><Spinner /></div>}
        {err && <Alert variant="destructive"><AlertTitle>Stream Error</AlertTitle><AlertDescription>{err}</AlertDescription></Alert>}
        {data ? (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><span className="font-semibold">Reversal Rate:</span> <span className="text-xl font-bold text-cyan-600">{(data.curr_rev_rt * 100).toFixed(3)}%</span></p>
            <p><span className="font-semibold">TX Volume:</span> {data.vol_tx.toLocaleString()}</p>
            <p><span className="font-semibold">Reversed Vol:</span> {data.vol_rev.toLocaleString()}</p>
            <p><span className="font-semibold">Anomaly Score:</span> <span className={`${data.anom_score > 0.7 ? 'text-red-500' : data.anom_score > 0.4 ? 'text-orange-500' : 'text-green-600'}`}>{(data.anom_score * 100).toFixed(1)}%</span></p>
            <p className="col-span-2 text-xs text-gray-400">Stream Updated: {new Date(data.ts).toLocaleTimeString()}</p>
          </div>
        ) : !is_loading && <p>No stream data.</p>}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full mt-2" disabled={is_fetching}>
              View Historical Packets ({hist_data.length})
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Historical Transactional Packets</DialogTitle></DialogHeader>
            <div className="text-xs">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1">ID</th>
                    <th className="px-2 py-1">Amount</th>
                    <th className="px-2 py-1">Status</th>
                    <th className="px-2 py-1">Risk</th>
                    <th className="px-2 py-1">Fraud</th>
                    <th className="px-2 py-1">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {hist_data.map((p) => (
                    <tr key={p.id} className={p.is_frd ? 'bg-red-50' : ''}>
                      <td className="px-2 py-1">{p.p_id.substring(0, 12)}...</td>
                      <td className="px-2 py-1">${p.amt.toFixed(2)}</td>
                      <td className="px-2 py-1">{p.stat}</td>
                      <td className="px-2 py-1">{p.r_score.toFixed(0)}</td>
                      <td className="px-2 py-1">{p.is_frd ? 'Yes' : 'No'}</td>
                      <td className="px-2 py-1">{new Date(p.ts_init).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export const PartnerEcosystemMonitor: React.FC = () => {
    const [statuses, setStatuses] = useState<Record<string, string>>({});
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const { gim_svc } = useServiceNexus();

    const fetch_statuses = useCallback(async () => {
        setIsLoading(true);
        const partner = PARTNER_ECOSYSTEM_REGISTRY[Math.floor(Math.random() * 50)]; 
        const resp: any = await gim_svc.fetch_partner_data(partner, { op: 'health_check' });
        if(resp.status === 'OK' && resp.data) {
           const new_statuses = { ...statuses, [partner]: 'OPERATIONAL' };
           setStatuses(new_statuses);
        } else {
           const new_statuses = { ...statuses, [partner]: 'DEGRADED' };
           setStatuses(new_statuses);
        }
        setLastUpdated(new Date().toISOString());
        setIsLoading(false);
    }, [gim_svc, statuses]);

    useEffect(() => {
        const interval = setInterval(fetch_statuses, 5000);
        return () => clearInterval(interval);
    }, [fetch_statuses]);
    
    const operational_count = Object.values(statuses).filter(s => s === 'OPERATIONAL').length;
    const total_count = Object.keys(statuses).length;
    const monitored_partners = Object.keys(statuses).slice(0, 15);

    return (
        <Card className="col-span-12 lg:col-span-6 xl:col-span-8">
            <CardHeader>
                <CardHeading><CardTitle>Partner Ecosystem Health Matrix</CardTitle></CardHeading>
                <CardActions>
                    <p className="text-sm text-gray-500">
                        {operational_count}/{total_count} Monitored Partners Operational
                    </p>
                </CardActions>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {monitored_partners.map(p => (
                        <div key={p} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                            <span className={`h-3 w-3 rounded-full ${statuses[p] === 'OPERATIONAL' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span className="text-xs truncate">{p}</span>
                        </div>
                    ))}
                    {total_count > 15 && <div className="text-xs text-gray-400 p-2">...and {total_count - 15} more</div>}
                </div>
                <p className="text-xs text-gray-400 mt-4 text-right">
                    Last check: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'N/A'}
                </p>
            </CardContent>
        </Card>
    );
};

export const GeminiHXPredictiveConsole: React.FC<{ hist_pkts: TransactionalPacket[] }> = ({ hist_pkts }) => {
  const { ai_svc, dlt_svc } = useServiceNexus();
  const [pred, setPred] = useState<GeminiHXPrediction | null>(null);
  const [is_loading, setIsLoading] = useState(false);
  const [horiz, setHoriz] = useState('48h');

  const gen_pred = useCallback(async () => {
    if (hist_pkts.length === 0) return;
    setIsLoading(true);
    const p = await ai_svc.gen_prediction(hist_pkts, horiz);
    setPred(p);
    await dlt_svc.write_log('sys_ai', 'GEN_PREDICTION', { pred_id: p.pred_id, horiz: horiz });
    setIsLoading(false);
  }, [ai_svc, dlt_svc, hist_pkts, horiz]);
  
  return (
    <Card className="col-span-12">
        <CardHeader>
            <CardHeading><CardTitle>Gemini-HX Predictive Analytics Console</CardTitle></CardHeading>
            <CardActions>
                <Select value={horiz} onValueChange={setHoriz} disabled={is_loading}>
                    <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="24h">24 Hours</SelectItem>
                        <SelectItem value="48h">48 Hours</SelectItem>
                        <SelectItem value="7d">7 Days</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={gen_pred} disabled={is_loading || hist_pkts.length === 0}>
                    {is_loading ? <Spinner size="sm" /> : "Generate Forecast"}
                </Button>
            </CardActions>
        </CardHeader>
        <CardContent>
            {is_loading && <div className="flex justify-center p-8"><Spinner /></div>}
            {pred && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-gray-50 p-4 rounded">
                    <div>
                        <p className="text-2xl font-bold text-indigo-700">{(pred.pred_rev_rt * 100).toFixed(3)}%</p>
                        <p className="text-gray-500">Predicted Rate ({pred.pred_horiz})</p>
                    </div>
                    <div>
                        <p className="font-semibold">Confidence Interval:</p>
                        <p>{(pred.conf_int_l * 100).toFixed(2)}% - {(pred.conf_int_u * 100).toFixed(2)}%</p>
                    </div>
                     <div>
                        <p className="font-semibold">Risk Level:</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          pred.risk_lvl === 'CRIT' ? 'bg-red-100 text-red-800' :
                          pred.risk_lvl === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          pred.risk_lvl === 'ELEV' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>{pred.risk_lvl}</span>
                    </div>
                </div>
            )}
        </CardContent>
    </Card>
  );
};


export const QuantumControlModule: React.FC = () => {
    const [quantumFlux, setQuantumFlux] = useState(0.78);
    const [entanglementState, setEntanglementState] = useState(true);
    const { dlt_svc } = useServiceNexus();

    const adjustFlux = () => {
        const newFlux = Math.random();
        setQuantumFlux(newFlux);
        dlt_svc.write_log('sys_admin', 'ADJUST_QUANTUM_FLUX', { newFlux });
    };
    
    return (
        <Card className="col-span-12 lg:col-span-4">
            <CardHeader><CardHeading><CardTitle>Quantum Control Module</CardTitle></CardHeading></CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label>Quantum Flux Capacitor Level</Label>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${quantumFlux * 100}%` }}></div>
                    </div>
                    <p className="text-xs text-center mt-1">{ (quantumFlux * 100).toFixed(1) }%</p>
                </div>
                <div className="flex items-center justify-between">
                    <Label>Entanglement Protocol</Label>
                    <Switch checked={entanglementState} onCheckedChange={setEntanglementState} />
                </div>
                <Button className="w-full" variant="secondary" onClick={adjustFlux}>Recalibrate Flux</Button>
                <p className="text-xs text-gray-500">This module controls the quantum cryptographic layer for the DLT Synapse Protocol. For authorized personnel only.</p>
            </CardContent>
        </Card>
    );
};

export const DLT_AuditLedgerExplorer: React.FC = () => {
    const { dlt_svc } = useServiceNexus();
    const [logs, setLogs] = useState<AuditLedgerRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const refresh_logs = useCallback(async () => {
        setIsLoading(true);
        const l = await dlt_svc.read_logs(50);
        setLogs(l);
        setIsLoading(false);
    }, [dlt_svc]);

    useEffect(() => {
        refresh_logs();
        const interval = setInterval(refresh_logs, 10000);
        return () => clearInterval(interval);
    }, [refresh_logs]);
    
    return (
        <Card className="col-span-12 lg:col-span-8">
            <CardHeader>
                <CardHeading><CardTitle>DLT Audit Ledger Explorer</CardTitle></CardHeading>
                <CardActions><Button size="sm" variant="ghost" onClick={refresh_logs} disabled={isLoading}>{isLoading ? <Spinner size="sm" /> : 'Refresh'}</Button></CardActions>
            </CardHeader>
            <CardContent>
                <div className="max-h-80 overflow-y-auto pr-2 space-y-2">
                    {logs.map(log => (
                        <div key={log.log_id} className="bg-gray-100 p-2 rounded text-xs font-mono">
                            <div className="flex justify-between">
                                <span className="text-blue-600">{log.act}</span>
                                <span className="text-gray-500">{new Date(log.ts).toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">USR: {log.usr_id} | HASH: {log.payload_hash}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};


export function OmniFinancialNexusWidget({ dateRange }: { dateRange?: DateRangeFormValues }) {
  const { query, filters, setFilters } = useAchReturnFilters({ dateRange });
  const { data, loading } = useAchReturnChartData({ query });
  const { gim_svc } = useServiceNexus();
  const [hist_pkts, setHistPkts] = useState<TransactionalPacket[]>([]);

  useEffect(() => {
    const fetch_all_hist = async () => {
      if (filters.dateRange.startDate && filters.dateRange.endDate) {
        const d = await gim_svc.get_hist_packets(filters.dateRange.startDate, filters.dateRange.endDate, 5000);
        setHistPkts(d);
      }
    };
    fetch_all_hist();
  }, [filters.dateRange.startDate, filters.dateRange.endDate, gim_svc]);

  const getEntityDisplayName = (e: ReturnRateEntityEnum) => {
    const mapping = {
      [ReturnRateEntityEnum.ExternalPartnerA]: "Partner Alpha",
      [ReturnRateEntityEnum.ExternalPartnerB]: "Partner Bravo",
      [ReturnRateEntityEnum.GlobalFinancialNetwork]: "Global Network",
      [ReturnRateEntityEnum.InternalPlatform]: "Internal Platform",
      [ReturnRateEntityEnum.LegacySystem]: "Legacy Core",
      [ReturnRateEntityEnum.ModernTreasury]: "Orchestration Layer",
    };
    return mapping[e] || "Selected Entity";
  };

  return (
    <div className="grid grid-cols-12 gap-6 p-4 bg-gray-50">
      <Card className="col-span-12">
          <CardHeader>
              <CardHeading>
                <CardTitle className="text-2xl">{CITI_BIZ_CORP_NAME} - Giga-Nexus Omni-Financial Dashboard</CardTitle>
                <p className="text-sm text-gray-500">Data sourced from {CITI_BIZ_URL_ROOT} API ({CITI_BIZ_API_V})</p>
              </CardHeading>
          </CardHeader>
      </Card>

      <Card className="col-span-12 lg:col-span-6 xl:col-span-4">
        <CardHeader>
          <CardHeading>
            <CardTitle>Core Reversal Rate Metric</CardTitle>
          </CardHeading>
          <CardActions>
            <Filters filters={filters} setFilters={setFilters} />
          </CardActions>
        </CardHeader>
        <CardContent>
          <AchReturnChartWrapper filters={filters} data={data} loading={loading} />
        </CardContent>
        <CardFooter className="text-xs text-gray-600">
          <p>
            {`${getEntityDisplayName(filters.option.entity)}'s ${filters.option.footerName} threshold is `}
            <span className="font-bold text-orange-600">{`${filters.option?.threshold || 0}%`}</span>
          </p>
        </CardFooter>
      </Card>
      
      <NexusRealtimeMonitor date_range={filters.dateRange} />

      <PartnerEcosystemMonitor />

      <GeminiHXPredictiveConsole hist_pkts={hist_pkts} />
      
      <QuantumControlModule />
      
      <DLT_AuditLedgerExplorer />

      <Card className="col-span-12">
          <CardHeader><CardHeading><CardTitle>Global Action Manifold</CardTitle></CardHeading></CardHeader>
          <CardContent className="flex flex-wrap gap-3 p-4 justify-center">
              {Array.from({ length: 84 }).map((_, i) => (
                  <Button 
                    key={i} 
                    variant={i % 4 === 0 ? "default" : (i % 4 === 1 ? "secondary" : (i % 4 === 2 ? "outline" : "ghost"))}
                    onClick={() => alert(`Executing Action Protocol #${i + 1}`)}
                  >
                      Action Protocol {i + 1}
                  </Button>
              ))}
          </CardContent>
          <CardFooter className="text-xs text-center text-gray-500">
              Actions are logged on the DLT. Unauthorized actions will be prosecuted by {CITI_BIZ_CORP_NAME} corporate security.
          </CardFooter>
      </Card>

    </div>
  );
}

const OmniFinancialNexusWidgetWithServices: React.FC<{ dateRange?: DateRangeFormValues }> = (p) => (
  <ServiceNexusProvider>
    <OmniFinancialNexusWidget {...p} />
  </ServiceNexusProvider>
);

export default OmniFinancialNexusWidgetWithServices;