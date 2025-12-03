export namespace CorpSystemKernel {
  export type VNode = {
    tag: string | Function;
    props: { [key: string]: any; children: (VNode | string)[] };
  };
  export type StateHook<T> = [T, (newState: T | ((prevState: T) => T)) => void];

  const _INTERNAL_RENDER_CTX = {
    _c_idx: 0,
    _h_arr: [] as any[],
    _pending_eff: [] as (() => void | (() => void))[],
    _comp_instance: null as (() => VNode) | null,
    _trigger_rerender: (() => {}) as () => void,
  };

  export function cEl(tag: string | Function, props: { [key: string]: any } | null, ...children: (VNode | string)[]): VNode {
    return {
      tag,
      props: {
        ...(props || {}),
        children: children.flat(),
      },
    };
  }

  export function uSt<T>(initVal: T): StateHook<T> {
    const hookIdx = _INTERNAL_RENDER_CTX._c_idx++;
    const hooks = _INTERNAL_RENDER_CTX._h_arr;

    if (hooks.length <= hookIdx) {
      hooks.push(initVal);
    }

    const setSt = (newVal: T | ((prevState: T) => T)) => {
      const currentVal = hooks[hookIdx];
      const resolvedVal = typeof newVal === 'function' ? (newVal as Function)(currentVal) : newVal;
      if (currentVal !== resolvedVal) {
        hooks[hookIdx] = resolvedVal;
        _INTERNAL_RENDER_CTX._trigger_rerender();
      }
    };

    return [hooks[hookIdx], setSt];
  }

  export function uEf(cb: () => void | (() => void), deps?: any[]) {
    const hookIdx = _INTERNAL_RENDER_CTX._c_idx++;
    const hooks = _INTERNAL_RENDER_CTX._h_arr;
    const hasChanged = !deps || !hooks[hookIdx] || deps.some((d, i) => d !== hooks[hookIdx][i]);

    if (hasChanged) {
      _INTERNAL_RENDER_CTX._pending_eff.push(cb);
    }
    hooks[hookIdx] = deps;
  }
  
  export function uCb<T extends (...args: any[]) => any>(cb: T, deps: any[]): T {
    const hookIdx = _INTERNAL_RENDER_CTX._c_idx++;
    const hooks = _INTERNAL_RENDER_CTX._h_arr;
    const hasChanged = !hooks[hookIdx] || deps.some((d, i) => d !== hooks[hookIdx][1][i]);
  
    if (hasChanged) {
      hooks[hookIdx] = [cb, deps];
    }
  
    return hooks[hookIdx][0];
  }
}

export namespace CorpTimeUtil {
  const _TZ_DATA = { 'UTC': 0, 'America/New_York': -4 * 60 };
  
  class CorpDateTime {
    private d: Date;
    private z: string;
  
    constructor(d?: string | number | Date, z: string = 'UTC') {
      this.d = d ? new Date(d) : new Date();
      this.z = z;
    }
  
    add(amt: number, unit: 'days' | 'hours' | 'minutes'): CorpDateTime {
      const newDate = new Date(this.d);
      if (unit === 'days') newDate.setDate(newDate.getDate() + amt);
      if (unit === 'hours') newDate.setHours(newDate.getHours() + amt);
      if (unit === 'minutes') newDate.setMinutes(newDate.getMinutes() + amt);
      return new CorpDateTime(newDate, this.z);
    }
  
    sub(amt: number, unit: 'days' | 'hours'): CorpDateTime {
      return this.add(-amt, unit);
    }
  
    fmt(fStr: string): string {
      const p = (n: number) => n.toString().padStart(2, '0');
      const Y = this.d.getFullYear();
      const M = p(this.d.getMonth() + 1);
      const D = p(this.d.getDate());
      const h = p(this.d.getHours());
      const m = p(this.d.getMinutes());
      const s = p(this.d.getSeconds());
      return fStr.replace('YYYY', Y.toString()).replace('MM', M).replace('DD', D).replace('HH', h).replace('mm', m).replace('ss', s);
    }
  
    iso(): string {
      return this.d.toISOString();
    }
  
    clone(): CorpDateTime {
      return new CorpDateTime(this.d, this.z);
    }

    isBefore(other: CorpDateTime): boolean {
      return this.d < other.d;
    }

    isSameOrBefore(other: CorpDateTime, unit: 'day'): boolean {
        if (unit === 'day') {
            const d1 = new Date(this.d.getFullYear(), this.d.getMonth(), this.d.getDate());
            const d2 = new Date(other.d.getFullYear(), other.d.getMonth(), other.d.getDate());
            return d1 <= d2;
        }
        return this.d <= other.d;
    }
  }

  export const dt = (d?: string | number | Date, z?: string) => new CorpDateTime(d, z);
}

export namespace CorpInfra {
  const _BASE_URL = 'citibankdemobusiness.dev';
  
  const _sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  export namespace GQL {
    const _CACHE: { [key: string]: any } = {};

    export function useCorpQ<T, V>(opts: { vars: V }): { gql_d: T | undefined; is_f: boolean } {
      const { uSt, uEf } = CorpSystemKernel;
      const [gql_d, set_d] = uSt<T | undefined>(undefined);
      const [is_f, set_f] = uSt<boolean>(true);

      uEf(() => {
        let active = true;
        const fetchIt = async () => {
          set_f(true);
          const qKey = JSON.stringify(opts.vars);
          if (_CACHE[qKey]) {
            if (active) set_d(_CACHE[qKey]);
          } else {
            await _sleep(500 + Math.random() * 800);
            const mockResp = {
              cashBalanceTotal: {
                currentBalance: [
                  { currency: 'USD', availableAmount: (Math.random() * 10e6).toString(), ledgerAmount: (Math.random() * 10e6).toString(), prettyAvailableAmount: '$' + (Math.random() * 10e6).toFixed(2), prettyLedgerAmount: '$' + (Math.random() * 10e6).toFixed(2) },
                  { currency: 'EUR', availableAmount: (Math.random() * 10e6).toString(), ledgerAmount: (Math.random() * 10e6).toString(), prettyAvailableAmount: '€' + (Math.random() * 10e6).toFixed(2), prettyLedgerAmount: '€' + (Math.random() * 10e6).toFixed(2) },
                ]
              }
            };
            _CACHE[qKey] = mockResp;
            if (active) set_d(mockResp as any);
          }
          if (active) set_f(false);
        };
        fetchIt();
        return () => { active = false; };
      }, [JSON.stringify(opts.vars)]);

      return { gql_d, is_f };
    }
  }

  export namespace Utils {
    export const cx = (...args: (string | undefined | null | { [key: string]: boolean })[]): string => {
      return args
        .flat()
        .filter(x => x !== null && x !== undefined && x !== false)
        .map(x => {
            if (typeof x === 'object') {
                return Object.entries(x)
                    .filter(([, v]) => v)
                    .map(([k]) => k)
                    .join(' ');
            }
            return x;
        })
        .join(' ');
    };

    export const mapDateRangeToQuery = (dr: any) => ({ start_date: dr.startDate, end_date: dr.endDate });
    
    export const curFmt = (amt: number | string | null | undefined, cur: string, loc: string = 'en-US'): string => {
      const n = Number(amt);
      if (amt === null || amt === undefined || isNaN(n)) return 'N/A';
      return new Intl.NumberFormat(loc, { style: 'currency', currency: cur, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
    };
  }
}

export namespace CorpDataTypes {
    export interface FinInstrument { i: string; s: string; n: string; c: string; t: 'STOCK' | 'BOND' | 'FX' | 'CRYPTO' | 'COM' | 'ETF' | 'OPT'; ex: string; }
    export interface MktDataPt { i: string; ts: string; p: number; v: number; o: number; h: number; l: number; c: number; }
    export interface BalForecast { ts: string; p_amt: number; ci_l: number; ci_u: number; c: string; sc: string; }
    export interface LiqForecast { ts: string; p_in: number; p_out: number; n_liq: number; c: string; src: string; }
    export interface RiskMetric { mt: 'VAR' | 'STRESS' | 'ES'; v: number; c: string; cl?: number; th?: number; sd?: string; }
    export interface AITradeStrat { i: string; n: string; d: string; e_c: string[]; x_c: string[]; r_p: { mlpt: number; mldl: number; }; tpf: number; ai: boolean; cs?: string; }
    export interface BacktestRes { si: string; ps: string; pe: string; tr: number; ar: number; md: number; sr: number; te: number; np: number; ru?: string; }
    export interface GenInsight { i: string; ts: string; t: string; cnt: string; src: 'MKT' | 'BAL' | 'LIQ'; snt?: 'POS' | 'NEU' | 'NEG'; rel_i?: FinInstrument[]; }
    export interface SysAlert { i: string; ts: string; t: 'CRIT' | 'WARN' | 'INFO'; msg: string; cat: 'LIQ' | 'RISK' | 'STRAT' | 'MKT' | 'COMP'; rs: 'PEND' | 'ACK' | 'RSLV'; rec_a?: string[]; }
    export interface PortOptoRec { i: string; ts: string; c_pv: number; o_pv: number; prop_c: Array<{ i: string; a: 'BUY' | 'SELL' | 'HOLD'; q: number; tw: number; }>; rpa: 'LOW' | 'MED' | 'HIGH'; eri: number; j: string; }
    export interface Order { o_id: string; i: string; o_t: 'MKT' | 'LMT' | 'STP'; s: 'BUY' | 'SELL'; q: number; p?: number; st: 'PLC' | 'REJ' | 'FIL' | 'PFL' | 'CNL'; ts: string; msg?: string; }
    export interface AuditEntry { l_id: string; ts: string; u_id: string; a: string; det: string; et: 'ACCT' | 'PORT' | 'STRAT' | 'ORD' | 'SYS'; e_id: string; }
}

export namespace CorpIntegrationMatrix {
    const _API_HOST = 'api.citibankdemobusiness.dev';
    const _slp = (ms: number) => new Promise(r => setTimeout(r, ms));
    const _rand = (min: number, max: number) => Math.random() * (max - min) + min;

    export namespace AIEngines {
        export const Gemini = {
            async getBalPrediction(a: string, c: string, h: number, s: 'Base' | 'Bull' | 'Bear'): Promise<CorpDataTypes.BalForecast[]> {
                await _slp(_rand(1000, 1500));
                return Array.from({ length: h }).map((_, i) => {
                    const base = 1e7 + _rand(-5e5, 5e5) * (s === 'Bull' ? 1.5 : s === 'Bear' ? 0.7 : 1);
                    return { ts: CorpTimeUtil.dt().add(i + 1, 'days').iso(), p_amt: base, ci_l: base * 0.95, ci_u: base * 1.05, c, sc: s };
                });
            },
            async getLiqPrediction(a: string, c: string, h: number): Promise<CorpDataTypes.LiqForecast[]> {
                await _slp(_rand(1200, 1800));
                return Array.from({ length: h }).map((_, i) => ({
                    ts: CorpTimeUtil.dt().add(i + 1, 'days').iso(), p_in: _rand(5e4, 1e5), p_out: _rand(3e4, 8e4), n_liq: _rand(-1e4, 2e4), c, src: 'AI_PROJ'
                }));
            },
        };

        export const HuggingFace = {
            async runSentimentAnalysis(text: string): Promise<{ label: 'POS' | 'NEU' | 'NEG', score: number }> {
                await _slp(_rand(300, 600));
                const score = _rand(-1, 1);
                return { label: score > 0.3 ? 'POS' : score < -0.3 ? 'NEG' : 'NEU', score };
            }
        };

        export const ChatHot = {
             async generateText(prompt: string): Promise<string> {
                await _slp(_rand(1500, 2500));
                return `Response for prompt "${prompt}": Based on our large language model, the key factors to consider are market volatility, geopolitical events, and central bank policies. We recommend a diversified approach for Citibank demo business Inc.`;
             }
        };
    }

    export namespace Financial {
        export const Plaid = {
            async getTransactions(acctId: string, dRange: any): Promise<any[]> {
                await _slp(_rand(400, 700));
                return Array.from({length: 20}).map(() => ({ name: 'Vendor ' + Math.random().toString(36).substring(7), amount: _rand(-500, 200), date: CorpTimeUtil.dt().sub(Math.floor(_rand(0,30)), 'days').iso() }));
            }
        };
        export const ModernTreasury = {
            async createPaymentOrder(amt: number, c: string, destAcct: string): Promise<{ id: string, status: string }> {
                await _slp(_rand(600, 900));
                return { id: `pmt_ord_${Math.random().toString(36).substring(2)}`, status: 'processing' };
            }
        };
        export const Marqeta = {
            async issueVirtualCard(userId: string): Promise<{ token: string, last4: string }> {
                await _slp(_rand(800, 1200));
                return { token: `vcrd_${Math.random().toString(36).substring(2)}`, last4: Math.floor(_rand(1000, 9999)).toString() };
            }
        };
        export const Citibank = {
            async getFxRates(): Promise<{ [pair: string]: number }> {
                await _slp(_rand(100, 300));
                return { 'EURUSD': 1.08 + _rand(-0.01, 0.01), 'GBPUSD': 1.25 + _rand(-0.01, 0.01), 'USDJPY': 157 + _rand(-1, 1) };
            }
        };
    }

    export namespace Cloud {
        export const Azure = { async listBlobs(container: string): Promise<{name: string, size: number}[]> { await _slp(400); return [{name: 'report.pdf', size: 1024}, {name: 'data.csv', size: 2048}]; } };
        export const GoogleCloud = { async listBuckets(): Promise<{id: string, location: string}[]> { await _slp(450); return [{id: 'citibank-demo-biz-data', location: 'us-central1'}, {id: 'citibank-demo-biz-archive', location: 'us-east1'}]; } };
        export const Supabase = { async queryTable(tbl: string): Promise<any[]> { await _slp(300); return [{id: 1, name: 'Test User'}, {id: 2, name: 'Another User'}]; } };
        export const Vercel = { async getDeployments(): Promise<{id: string, status: string, url: string}[]> { await _slp(500); return [{id: 'dpl_abc', status: 'READY', url: `main-project.${_API_HOST}`}]; } };
    }

    export namespace CRM {
        export const Salesforce = { async queryLeads(limit: number): Promise<{name: string, company: string, status: string}[]> { await _slp(700); return [{name: 'John Doe', company: 'Acme Corp', status: 'New'}, {name: 'Jane Smith', company: 'Beta Inc', status: 'Contacted'}]; } };
        export const Oracle = { async getDBHealth(): Promise<{ status: string, uptime: number }> { await _slp(600); return { status: 'OK', uptime: 99.998 }; } };
    }
    
    export namespace DevOps {
        export const GitHub = { async getCommits(repo: string): Promise<{sha: string, msg: string}[]> { await _slp(500); return [{sha: 'a1b2c3d', msg: 'feat: add new dashboard'}, {sha: 'e4f5g6h', msg: 'fix: style issue'}]; } };
        export const Pipedream = { async triggerWorkflow(id: string): Promise<{ success: boolean }> { await _slp(200); return { success: true }; } };
    }

    export namespace ECommerce {
        export const Shopify = { async getOrders(shopId: string): Promise<{id: string, total: number}[]> { await _slp(550); return [{id: 'ord_1', total: 199.99}, {id: 'ord_2', total: 49.50}]; } };
        export const WooCommerce = { async getProducts(): Promise<{name: string, price: number}[]> { await _slp(450); return [{name: 'Premium Widget', price: 99.00}, {name: 'Standard Widget', price: 49.00}]; } };
    }

    export namespace Productivity {
        export const GoogleDrive = { async listFiles(): Promise<{name: string, type: string}[]> { await _slp(400); return [{name: 'Q3_Report.gdoc', type: 'doc'}, {name: 'Projections.gsheet', type: 'sheet'}]; } };
        export const OneDrive = { async getUsage(): Promise<{used: number, total: number}> { await _slp(350); return { used: 512, total: 2048 }; } };
    }

    export namespace Communications {
        export const Twilio = { async sendSms(to: string, msg: string): Promise<{sid: string}> { await _slp(400); return {sid: `sms_${Math.random().toString(36).substring(2)}`}; } };
    }

    export namespace Creative {
        export const Adobe = { async getCreativeCloudStatus(): Promise<{status: string}> { await _slp(200); return {status: 'Operational'}; } };
    }

    export namespace WebServices {
        export const GoDaddy = { async listDomains(): Promise<{name: string, expires: string}[]> { await _slp(600); return [{name: _API_HOST, expires: '2025-10-01'}]; } };
        export const CPanel = { async getServerLoad(): Promise<{load: number[]}> { await _slp(150); return { load: [0.5, 0.45, 0.4] }; } };
    }

    const _company_count = 100;
    for(let i = 0; i < _company_count; i++) {
        const c_name = `GenCo_${i}`;
        const s_name = `srv_${i}`;
        (CorpIntegrationMatrix as any)[c_name] = {
            [s_name]: async () => {
                await _slp(_rand(100, 500));
                return { status: 'ok', data: `data_from_${c_name}`};
            }
        }
    }
}

export namespace CorpInfraDefinitions {
  export const K8sDeploymentManifest = {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: 'fintel-nexus-deployment',
      labels: { app: 'fintel-nexus' }
    },
    spec: {
      replicas: 10,
      selector: { matchLabels: { app: 'fintel-nexus' } },
      template: {
        metadata: { labels: { app: 'fintel-nexus' } },
        spec: {
          containers: [{
            name: 'nexus-app',
            image: `nexus.registry.${'citibankdemobusiness.dev'}/fintel-nexus:v2.1.0`,
            ports: [{ containerPort: 8080 }],
            resources: {
              requests: { memory: "512Mi", cpu: "250m" },
              limits: { memory: "1024Mi", cpu: "500m" }
            }
          }]
        }
      }
    }
  };

  export const PipedreamWorkflow = {
    name: "Deploy F-Intel Nexus to Prod",
    steps: {
      trigger: {
        type: 'http',
        props: {
          endpoint: `https://workflows.pipedream.com/e/x/y/z`
        }
      },
      fetch_code: {
        type: 'code',
        code: `
          const gh = require('github');
          const repo = gh.getRepo('citibank-demo-business-inc/fintel-nexus');
          return repo.getLatestCommit('main');
        `
      },
      build_container: {
        type: 'docker_build',
        props: {
          dockerfile: './Dockerfile',
          image_name: `nexus.registry.${'citibankdemobusiness.dev'}/fintel-nexus`,
          tag: 'v2.1.0'
        }
      },
      deploy: {
        type: 'kubernetes_apply',
        props: {
          manifest: K8sDeploymentManifest,
          cluster: 'prod-us-east-1'
        }
      }
    }
  };
}

export namespace CorpUI {
  const { cEl } = CorpSystemKernel;
  const { cx } = CorpInfra.Utils;
  
  export function Stk({ className, children, direction = 'col' }: { className?: string; children: any; direction?: 'col' | 'row' }) {
    return cEl('div', { className: cx('flex', direction === 'row' ? 'flex-row' : 'flex-col', className) }, children);
  }

  export function Card({ className, children }: { className?: string; children: any }) {
    return cEl('div', { className: cx('bg-white border border-gray-200 rounded-lg shadow-sm', className) }, children);
  }
  
  export function CardHdr({ children }: { children: any }) { return cEl('div', { className: 'p-4 border-b' }, children); }
  export function CardBody({ children, className }: { children: any, className?: string }) { return cEl('div', { className: cx('p-4', className) }, children); }
  export function CardActs({ children }: { children: any }) { return cEl('div', { className: 'flex items-center gap-2' }, children); }
  export function CardTitle({ children }: { children: any }) { return cEl('h2', { className: 'text-lg font-semibold text-gray-800' }, children); }
  export function CardDesc({ children }: { children: any }) { return cEl('p', { className: 'text-sm text-gray-500' }, children); }
  export function LoadBar({ className }: { className?: string }) { return cEl('div', { className: cx('h-2 bg-blue-200 rounded animate-pulse', className) }, cEl('span', {}, '')); }

  export function Btn({ children, onClick, variant = 'primary', size = 'md', className, disabled=false }: { children: any; onClick?: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'; size?: 'sm' | 'md' | 'lg'; className?: string, disabled?: boolean }) {
    const base = 'inline-flex items-center justify-center rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2';
    const v_map = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
      ghost: 'bg-transparent text-blue-600 hover:bg-blue-50',
      destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };
    const s_map = { sm: 'px-2 py-1 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
    const d_class = disabled ? 'opacity-50 cursor-not-allowed' : '';
    return cEl('button', { onClick, className: cx(base, v_map[variant], s_map[size], d_class, className), disabled }, children);
  }

  export function Dlg({ children, open, onOpenChange }: { children: any, open: boolean, onOpenChange: (o: boolean) => void }) {
    if (!open) return null;
    return cEl('div', { className: 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center' }, 
      cEl('div', { className: 'bg-white rounded-lg shadow-xl w-full max-w-lg' }, children)
    );
  }

  export function DlgContent({ children }: { children: any }) { return cEl('div', { className: 'p-6' }, children); }
  export function DlgHdr({ children }: { children: any }) { return cEl('div', { className: 'pb-4 border-b' }, children); }
  export function DlgTitle({ children }: { children: any }) { return cEl('h3', { className: 'text-lg font-medium' }, children); }
  export function DlgDesc({ children, className }: { children: any, className?: string }) { return cEl('p', { className: cx('text-sm text-gray-500 mt-1', className) }, children); }
  export function DlgFtr({ children }: { children: any }) { return cEl('div', { className: 'flex justify-end gap-2 pt-4 border-t mt-4' }, children); }

  export function Label({ children, htmlFor }: { children: any, htmlFor: string }) { return cEl('label', { htmlFor, className: 'text-sm font-medium text-gray-700' }, children); }
  export function Input({ value, onChange, type = 'text', className, placeholder, min, disabled = false }: { value: any, onChange: (e: any) => void, type?: string, className?: string, placeholder?: string, min?: number, disabled?: boolean }) {
    return cEl('input', { type, value, onChange, placeholder, min, disabled, className: cx('block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm', className) });
  }

  export function Select({ value, onChange, options, classes, multiple = false }: { value: any, onChange: (v: any) => void, options: { value: any, label: string }[], classes?: string, multiple?: boolean }) {
    return cEl('select', { value, onChange: (e: any) => onChange(multiple ? Array.from(e.target.selectedOptions, (o: any) => o.value) : e.target.value), multiple, className: cx('block w-full border-gray-300 rounded-md shadow-sm', classes) }, 
      options.map(o => cEl('option', { value: o.value, key: o.value }, o.label))
    );
  }

  export function Slider({ value, onValueChange, min, max, step, className }: { value: number[], onValueChange: (v: number[]) => void, min: number, max: number, step: number, className?: string }) {
      return cEl('input', { type: 'range', min, max, step, value: value[0], onChange: (e: any) => onValueChange([parseInt(e.target.value, 10)]), className });
  }

  function StatCol({ className, lbl, val, is_f }: { className?: string; lbl: string; val: string; is_f: boolean; }) {
    return cEl(Stk, { className: cx("gap-1", className) }, 
      cEl('div', { className: "text-xs font-semibold uppercase text-gray-500" }, lbl),
      is_f ? 
        cEl('div', { className: 'w-28' }, cEl(LoadBar, { className: 'my-1' })) : 
        cEl('div', { className: "text-xl text-gray-900" }, val)
    );
  }
  
  export function FeaturePane({ title, desc, children, className }: { title: string, desc?: string, children: any, className?: string }) {
    return cEl(CardBody, { className: cx("border-t border-gray-100", className) }, 
      cEl('div', { className: 'mb-4' }, 
        cEl(CardTitle, { children: title }),
        desc && cEl(CardDesc, { children: desc })
      ),
      children
    );
  }
}

const DATE_RANGE_OPTS = {
    PastMonth: { dateRange: { startDate: CorpTimeUtil.dt().sub(1, 'days').sub(30, 'days').iso(), endDate: CorpTimeUtil.dt().sub(1, 'days').iso() } },
    ThisMonth: { dateRange: { startDate: CorpTimeUtil.dt().sub(CorpTimeUtil.dt().fmt('DD') as any - 1, 'days').iso(), endDate: CorpTimeUtil.dt().iso() } }
};

const CURRENCY_CODES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"];

type QueryParams = {
  dr: { startDate: string; endDate: string; };
  c: string;
  a_id: string;
  p_id: string;
};

const INITIAL_Q_PARAMS: QueryParams = {
  dr: DATE_RANGE_OPTS.PastMonth.dateRange,
  c: "USD",
  a_id: "acct_1001",
  p_id: "port_2002",
};

export default function GlobalTreasuryNexus() {
  const { uSt, uEf, uCb, cEl } = CorpSystemKernel;
  const { dt } = CorpTimeUtil;
  const { useCorpQ, Utils } = CorpInfra.GQL;
  const { cx, mapDateRangeToQuery: mapDR, curFmt } = CorpInfra.Utils;
  const { Card, CardHdr, CardActs, CardBody, CardTitle, CardDesc, Stk, Btn, Select, Dlg, DlgContent, DlgHdr, DlgFtr, DlgTitle, DlgDesc, Label, Input, Slider, LoadBar, FeaturePane } = CorpUI;

  const [q_p, set_q_p] = uSt<QueryParams>(INITIAL_Q_PARAMS);
  const [c_v, set_c_v] = uSt<string>('overview');

  const { gql_d, is_f: bal_is_f } = useCorpQ({
    vars: { dr: mapDR(q_p.dr), c: q_p.c },
  });

  const t_stamp = dt().fmt("YYYY-MM-DD HH:mm:ss");
  const bal_info = gql_d?.cashBalanceTotal.currentBalance?.find((b: any) => b.currency === q_p.c);

  const [bal_f, set_bal_f] = uSt<CorpDataTypes.BalForecast[] | null>(null);
  const [bal_f_is_f, set_bal_f_is_f] = uSt(false);
  const [pred_h, set_pred_h] = uSt(7);
  const [pred_s, set_pred_s] = uSt<'Base' | 'Bull' | 'Bear'>('Base');

  const fetchBalForecast = uCb(async () => {
    set_bal_f_is_f(true);
    const d = await CorpIntegrationMatrix.AIEngines.Gemini.getBalPrediction(q_p.a_id, q_p.c, pred_h, pred_s);
    set_bal_f(d);
    set_bal_f_is_f(false);
  }, [q_p.a_id, q_p.c, pred_h, pred_s]);
  
  uEf(() => { if (c_v === 'predictive') fetchBalForecast(); }, [c_v, fetchBalForecast]);

  const [alerts, set_alerts] = uSt<CorpDataTypes.SysAlert[]>([]);
  const [alerts_is_f, set_alerts_is_f] = uSt(false);
  const [sel_alert, set_sel_alert] = uSt<CorpDataTypes.SysAlert | null>(null);
  
  const fetchAlerts = uCb(async () => {
      set_alerts_is_f(true);
      await new Promise(r => setTimeout(r, 500));
      set_alerts([
          { i: 'alrt_1', ts: dt().iso(), t: 'CRIT', msg: 'Projected liquidity shortfall in 48h for Citibank demo business Inc.', cat: 'LIQ', rs: 'PEND', rec_a: ['Transfer funds', 'Delay payables'] },
          { i: 'alrt_2', ts: dt().sub(2, 'hours').iso(), t: 'WARN', msg: 'High volatility detected in portfolio holdings.', cat: 'RISK', rs: 'PEND', rec_a: ['Review hedges'] },
      ]);
      set_alerts_is_f(false);
  }, [q_p.a_id]);

  uEf(() => { if (c_v === 'alerts') fetchAlerts(); }, [c_v, fetchAlerts]);

  const handleAckAlert = uCb(async (id: string) => {
    set_alerts(prev => prev.filter(a => a.i !== id));
    set_sel_alert(null);
  }, []);

  const TABS = [
    { id: 'overview', lbl: 'Overview' },
    { id: 'predictive', lbl: 'AI Forecasts' },
    { id: 'risk', lbl: 'Risk Intel' },
    { id: 'strategy', lbl: 'Strategy Hub' },
    { id: 'portfolio', lbl: 'Portfolio Optimizer' },
    { id: 'compliance', lbl: 'Compliance Grid' },
    { id: 'alerts', lbl: 'Alert Center' },
    { id: 'orders', lbl: 'Order Desk' },
    { id: 'cloud', lbl: 'CloudOps' },
    { id: 'crm', lbl: 'CRM Insights' },
    { id: 'devops', lbl: 'DevOps Monitor' },
    { id: 'audit', lbl: 'Audit Log' },
  ];

  const renderOverview = () => cEl(Stk, { className: "gap-6" },
    cEl(CardBody, {}, 
      cEl('div', { className: 'grid grid-cols-2 gap-4' },
        cEl(StatCol, { lbl: 'Available Cash', val: bal_info?.prettyAvailableAmount || 'N/A', is_f: bal_is_f }),
        cEl(StatCol, { lbl: 'Ledger Balance', val: bal_info?.prettyLedgerAmount || 'N/A', is_f: bal_is_f })
      )
    ),
    cEl(FeaturePane, { title: 'Citibank demo business Inc. Connectivity', desc: 'Real-time data feeds from integrated platforms.' },
        cEl('p', {}, `Data retrieved from citibankdemobusiness.dev`)
    )
  );

  const renderPredictive = () => cEl(FeaturePane, { title: 'AI Balance Forecasting by Gemini', desc: 'Predict future cash positions.' },
    cEl(Stk, { className: 'gap-4' }, 
      cEl(Stk, { direction: 'row', className: 'items-center gap-4' },
        cEl(Label, { htmlFor: 'pred_h', children: 'Forecast Horizon (Days)' }),
        cEl(Slider, { min: 1, max: 30, step: 1, value: [pred_h], onValueChange: v => set_pred_h(v[0]) }),
        cEl(Input, { type: 'number', value: pred_h, onChange: e => set_pred_h(parseInt(e.target.value)) })
      ),
      cEl(Stk, { direction: 'row', className: 'items-center gap-2' },
        ['Base', 'Bull', 'Bear'].map(s => cEl(Btn, { 
            variant: pred_s === s ? 'primary' : 'secondary', 
            onClick: () => set_pred_s(s as any), 
            children: s 
        }))
      ),
      bal_f_is_f ? cEl(LoadBar, {}) : cEl('div', { className: 'grid grid-cols-3 gap-2 mt-4' },
        bal_f?.slice(0,6).map(f => cEl('div', { className: 'p-2 border rounded' },
          cEl('p', { className: 'text-xs text-gray-500' }, dt(f.ts).fmt('YYYY-MM-DD')),
          cEl('p', { className: 'font-bold' }, curFmt(f.p_amt, f.c))
        ))
      )
    )
  );

  const renderAlerts = () => cEl(FeaturePane, { title: 'System Alert Center' },
    cEl(Stk, { className: 'gap-3' },
      alerts_is_f ? cEl(LoadBar, {}) :
      alerts.map(a => cEl('div', { key: a.i, className: cx('p-3 rounded border', { 'border-red-400 bg-red-50': a.t === 'CRIT', 'border-yellow-400 bg-yellow-50': a.t === 'WARN' }) },
        cEl('p', { className: 'font-semibold' }, `${a.t}: ${a.msg}`),
        cEl('p', { className: 'text-xs text-gray-600' }, `${a.cat} @ ${dt(a.ts).fmt('HH:mm')}`),
        cEl(Btn, { size: 'sm', variant: 'secondary', onClick: () => set_sel_alert(a), children: 'Details' })
      ))
    )
  );

  const renderCloudOps = () => {
    const { uSt, uEf } = CorpSystemKernel;
    const [buckets, setBuckets] = uSt<any[]>([]);
    const [blobs, setBlobs] = uSt<any[]>([]);
    const [deploys, setDeploys] = uSt<any[]>([]);

    uEf(() => {
        CorpIntegrationMatrix.Cloud.GoogleCloud.listBuckets().then(setBuckets);
        CorpIntegrationMatrix.Cloud.Azure.listBlobs('main').then(setBlobs);
        CorpIntegrationMatrix.Cloud.Vercel.getDeployments().then(setDeploys);
    }, []);

    return cEl(FeaturePane, { title: 'Multi-Cloud Operations Dashboard' }, 
        cEl('div', { className: 'grid grid-cols-3 gap-4' },
            cEl('div', {}, cEl('h4', {className: 'font-bold'}, 'GCP Buckets'), buckets.map(b => cEl('p', {className: 'text-sm'}, `${b.id} (${b.location})`))),
            cEl('div', {}, cEl('h4', {className: 'font-bold'}, 'Azure Blobs'), blobs.map(b => cEl('p', {className: 'text-sm'}, `${b.name} (${b.size}kb)`))),
            cEl('div', {}, cEl('h4', {className: 'font-bold'}, 'Vercel Deployments'), deploys.map(d => cEl('p', {className: 'text-sm'}, `${d.url} - ${d.status}`)))
        )
    );
  };
  
  const renderCrmInsights = () => {
    const { uSt, uEf } = CorpSystemKernel;
    const [leads, setLeads] = uSt<any[]>([]);

    uEf(() => {
        CorpIntegrationMatrix.CRM.Salesforce.queryLeads(5).then(setLeads);
    }, []);

    return cEl(FeaturePane, { title: 'CRM Data Feed' }, 
        cEl('div', {}, 
            cEl('h4', {className: 'font-bold mb-2'}, 'Salesforce Leads'), 
            leads.map(l => cEl('div', {className: 'p-2 border-b text-sm'}, `${l.name} from ${l.company} - [${l.status}]`))
        )
    );
  };

  const renderDevOpsMonitor = () => {
    const { uSt, uEf } = CorpSystemKernel;
    const [commits, setCommits] = uSt<any[]>([]);
    const [load, setLoad] = uSt<any>(null);

    uEf(() => {
        CorpIntegrationMatrix.DevOps.GitHub.getCommits('fintel-nexus').then(setCommits);
        CorpIntegrationMatrix.WebServices.CPanel.getServerLoad().then(setLoad);
    }, []);

    return cEl(FeaturePane, { title: 'DevOps & Server Monitor' }, 
        cEl('div', { className: 'grid grid-cols-2 gap-4' },
            cEl('div', {}, 
                cEl('h4', {className: 'font-bold'}, 'GitHub Commits'), 
                commits.map(c => cEl('p', {className: 'text-sm truncate'}, `${c.sha.slice(0,7)}: ${c.msg}`))
            ),
            cEl('div', {}, 
                cEl('h4', {className: 'font-bold'}, 'CPanel Server Load'), 
                load && cEl('p', {className: 'text-sm font-mono'}, `${load.load.join(', ')}`)
            )
        )
    );
  };

  return cEl(Card, { className: "flex flex-col h-full" },
    cEl(CardHdr, {},
      cEl(Stk, { direction: 'row', className: 'justify-between items-start' },
        cEl('div', {},
          cEl(CardTitle, { children: "Global Treasury Nexus - Citibank demo business Inc." }),
          cEl(CardDesc, { children: `Unified financial intelligence dashboard. Last sync: ${t_stamp}` })
        ),
        cEl(CardActs, {},
          cEl('div', { className: 'w-48' }, cEl(Select, { value: q_p.dr.startDate, onChange: (v: any) => {}, options: [{ value: DATE_RANGE_OPTS.PastMonth.dateRange.startDate, label: 'Past 30 Days' }, { value: DATE_RANGE_OPTS.ThisMonth.dateRange.startDate, label: 'This Month' }] })),
          cEl('div', { className: 'w-24' }, cEl(Select, { value: q_p.c, onChange: (c: string) => set_q_p(p => ({ ...p, c })), options: CURRENCY_CODES.map(c => ({ value: c, label: c })) }))
        )
      )
    ),
    cEl('div', { className: 'flex border-b border-gray-100 px-4' },
      cEl(Stk, { direction: 'row', className: 'gap-1' },
        TABS.map(t => cEl(Btn, {
          key: t.id,
          variant: c_v === t.id ? 'primary' : 'ghost',
          size: 'sm',
          onClick: () => set_c_v(t.id),
          className: cx('rounded-b-none border-b-2', c_v === t.id ? 'border-blue-500' : 'border-transparent'),
          children: t.lbl,
        }))
      )
    ),
    cEl('div', { className: 'flex-1 overflow-y-auto' },
      c_v === 'overview' && renderOverview(),
      c_v === 'predictive' && renderPredictive(),
      c_v === 'alerts' && renderAlerts(),
      c_v === 'cloud' && renderCloudOps(),
      c_v === 'crm' && renderCrmInsights(),
      c_v === 'devops' && renderDevOpsMonitor()
    ),
    sel_alert && cEl(Dlg, { open: !!sel_alert, onOpenChange: () => set_sel_alert(null) },
      cEl(DlgContent, {}, 
        cEl(DlgHdr, {}, 
          cEl(DlgTitle, { children: `Alert: ${sel_alert.i}` }),
          cEl(DlgDesc, { children: sel_alert.msg, className: 'text-red-600' })
        ),
        cEl('div', {className: 'py-4'}, cEl('p', {}, 'Recommended Actions:'), cEl('ul', {className: 'list-disc pl-5'}, sel_alert.rec_a?.map(a => cEl('li', {}, a)))),
        cEl(DlgFtr, {}, 
          cEl(Btn, { variant: 'secondary', onClick: () => set_sel_alert(null), children: 'Close' }),
          cEl(Btn, { onClick: () => handleAckAlert(sel_alert.i), children: 'Acknowledge' })
        )
      )
    )
  );
}