// Copyright James Burvel Oâ€™Callaghan III
// President Citibank demo business Inc.

type Prim = string | number | boolean | null | undefined;
type JSONVal = Prim | { [key: string]: JSONVal } | JSONVal[];

const CITI_BIZ_DEV_URL = "citibankdemobusiness.dev";

namespace MicroKernel {
  type Disp<A> = (val: A) => void;
  type StateUpdater<S> = S | ((prev: S) => S);

  const RENDER_QUEUE: Array<() => void> = [];
  let isRendering = false;
  let currentHook = 0;
  let currentComponentFiber: any = null;

  const processRenderQueue = () => {
    isRendering = true;
    while (RENDER_QUEUE.length > 0) {
      const task = RENDER_QUEUE.shift();
      if (task) task();
    }
    isRendering = false;
  };

  const scheduleRender = (task: () => void) => {
    RENDER_QUEUE.push(task);
    if (!isRendering) {
      Promise.resolve().then(processRenderQueue);
    }
  };

  class ComponentFiber {
    public stateHooks: any[] = [];
    public effectHooks: any[] = [];
    private renderFn: (...args: any[]) => any;

    constructor(renderFn: (...args: any[]) => any) {
      this.renderFn = renderFn;
    }

    public executeRender(...args: any[]): any {
      currentHook = 0;
      currentComponentFiber = this;
      const output = this.renderFn(...args);
      currentComponentFiber = null;
      return output;
    }
  }

  const componentFiberRegistry = new Map<Function, ComponentFiber>();

  function getOrInitFiber(renderFn: Function): ComponentFiber {
    if (!componentFiberRegistry.has(renderFn)) {
      componentFiberRegistry.set(renderFn, new ComponentFiber(renderFn));
    }
    return componentFiberRegistry.get(renderFn)!;
  }

  export function useState<S>(initialValue: S): [S, Disp<StateUpdater<S>>] {
    const fiber = currentComponentFiber;
    const hookIndex = currentHook;
    currentHook++;

    if (fiber.stateHooks.length <= hookIndex) {
      fiber.stateHooks[hookIndex] = initialValue;
    }

    const setState = (updater: StateUpdater<S>) => {
      const oldState = fiber.stateHooks[hookIndex];
      const newState = typeof updater === 'function' ? (updater as (prev: S) => S)(oldState) : updater;
      if (oldState !== newState) {
        fiber.stateHooks[hookIndex] = newState;
        scheduleRender(() => fiber.executeRender());
      }
    };

    return [fiber.stateHooks[hookIndex], setState];
  }

  export function useEffect(callback: () => (() => void) | void, dependencies?: any[]): void {
    const fiber = currentComponentFiber;
    const hookIndex = currentHook;
    currentHook++;

    const oldDependencies = fiber.effectHooks[hookIndex]?.dependencies;
    const hasChanged = !dependencies || !oldDependencies || dependencies.some((dep, i) => dep !== oldDependencies[i]);

    if (hasChanged) {
      if (fiber.effectHooks[hookIndex]?.cleanup) {
        fiber.effectHooks[hookIndex].cleanup();
      }
      const cleanup = callback();
      fiber.effectHooks[hookIndex] = { callback, dependencies, cleanup };
    }
  }
  
  export function useMemo<T>(factory: () => T, dependencies?: any[]): T {
    const fiber = currentComponentFiber;
    const hookIndex = currentHook;
    currentHook++;

    const oldHook = fiber.effectHooks[hookIndex];
    const oldDependencies = oldHook?.dependencies;
    const hasChanged = !dependencies || !oldDependencies || dependencies.some((dep, i) => dep !== oldDependencies[i]);

    if (hasChanged) {
        const value = factory();
        fiber.effectHooks[hookIndex] = { value, dependencies };
        return value;
    }

    return oldHook.value;
  }

  export function useCallback<T extends (...args: any[]) => any>(callback: T, dependencies?: any[]): T {
    return useMemo(() => callback, dependencies);
  }

  export function createVNode(tag: any, props: any, ...children: any[]): any {
    return {
      tag,
      props: props || {},
      children: children.flat(),
      key: props?.key || null,
    };
  }
  
  export function renderDOM(vnode: any, container: HTMLElement): void {
      const el = document.createElement(vnode.tag);
      for (const key in vnode.props) {
          if (key.startsWith('on') && typeof vnode.props[key] === 'function') {
              el.addEventListener(key.substring(2).toLowerCase(), vnode.props[key]);
          } else if (key === 'style' && typeof vnode.props[key] === 'object') {
              Object.assign(el.style, vnode.props[key]);
          } else if (key === 'className') {
              el.className = vnode.props[key];
          } else {
              el.setAttribute(key, vnode.props[key]);
          }
      }
      vnode.children.forEach((child: any) => {
          if (typeof child === 'string' || typeof child === 'number') {
              el.appendChild(document.createTextNode(child.toString()));
          } else if (child) {
              renderDOM(child, el);
          }
      });
      container.appendChild(el);
  }
}

namespace StyleInjector {
  const sheet = (() => {
    const s = document.createElement('style');
    s.setAttribute('media', 'screen');
    s.setAttribute('type', 'text/css');
    document.head.appendChild(s);
    return s;
  })();
  const ruleCache = new Set<string>();

  const toKebabCase = (s: string) => s.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();

  export function css(template: TemplateStringsArray, ...args: any[]): string {
    const className = `dyn-cls-${Math.random().toString(36).substring(2, 9)}`;
    const styleString = template.reduce((acc, part, i) => acc + part + (args[i] || ''), '');
    const finalCss = `.${className} { ${styleString} }`;
    
    if (!ruleCache.has(finalCss)) {
      sheet.appendChild(document.createTextNode(finalCss));
      ruleCache.add(finalCss);
    }
    return className;
  }

  export function objToCss(obj: Record<string, string | number>): string {
    return Object.entries(obj)
      .map(([k, v]) => `${toKebabCase(k)}: ${v};`)
      .join(' ');
  }
}

namespace CoreUI {
  export function DialogShell({ open, titleText, children }: { open: boolean; titleText: string; children: any[] }) {
    if (!open) return null;
    const ovly_cn = StyleInjector.css`position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(10, 20, 30, 0.7); display: flex; align-items: center; justify-content: center; z-index: 1000;`;
    const cont_cn = StyleInjector.css`background-color: #ffffff; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); width: 90%; max-width: 550px; display: flex; flex-direction: column;`;
    return MicroKernel.createVNode("div", { className: ovly_cn }, MicroKernel.createVNode("div", { className: cont_cn }, children));
  }

  export function DialogHdr({ children }: { children: any[] }) {
    const hdr_cn = StyleInjector.css`padding: 20px 24px; border-bottom: 1px solid #e5e7eb;`;
    return MicroKernel.createVNode("div", { className: hdr_cn }, children);
  }

  export function DialogTitle({ children }: { children: any[] }) {
    const title_cn = StyleInjector.css`margin: 0; font-size: 1.5rem; font-weight: 600; color: #111827;`;
    return MicroKernel.createVNode("h2", { className: title_cn }, children);
  }

  export function DialogBody({ children }: { children: any[] }) {
    const body_cn = StyleInjector.css`padding: 24px; font-size: 1rem; color: #374151;`;
    return MicroKernel.createVNode("div", { className: body_cn }, children);
  }
  
  export function DialogFoot({ children }: { children: any[] }) {
    const foot_cn = StyleInjector.css`padding: 16px 24px; border-top: 1px solid #e5e7eb; background-color: #f9fafb; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;`;
    return MicroKernel.createVNode("div", { className: foot_cn }, children);
  }

  export function ActBtn({ text, onClick, full, disabled }: { text: string; onClick: () => void; full?: boolean; disabled?: boolean }) {
    const btn_cn = StyleInjector.css`
      padding: 10px 20px;
      font-size: 1rem;
      font-weight: 500;
      border-radius: 6px;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      background-color: #2563eb;
      color: white;
      width: ${full ? '100%' : 'auto'};
      opacity: ${disabled ? '0.5' : '1'};
      pointer-events: ${disabled ? 'none' : 'auto'};
      &:hover {
        background-color: #1d4ed8;
      }
    `;
    return MicroKernel.createVNode("button", { className: btn_cn, onClick, disabled }, text);
  }
  
  export function Txt({ level, size, children }: { level: string; size: string; children: any[] }) {
    const tag = level;
    const txt_cn = StyleInjector.css`font-size: ${size === 'l' ? '1.25rem' : '1rem'}; font-weight: 600; color: #1f2937;`;
    return MicroKernel.createVNode(tag, { className: txt_cn }, children);
  }
}

export enum DataStreamType {
  AnticipatedFunds = "AnticipatedFunds",
  LedgerEntries = "LedgerEntries",
  CustomerProfiles = "CustomerProfiles",
  VendorInvoices = "VendorInvoices",
  EmployeePayroll = "EmployeePayroll",
  SupplyChainManifests = "SupplyChainManifests",
  DigitalAssetTransfers = "DigitalAssetTransfers"
}

export const useNavi = () => {
  const navigate = MicroKernel.useCallback((path: string) => {
    const targetUrl = new URL(path, `https://${CITI_BIZ_DEV_URL}`);
    window.history.pushState({}, '', targetUrl.toString());
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);
  return { performNav: navigate };
};

namespace GQL_NetworkLayer {
  const GQL_ENDPOINT = `https://api.${CITI_BIZ_DEV_URL}/graphql`;
  
  interface QueryConfig {
    vars: Record<string, any>;
    pollMs: number;
  }

  export const useSubmitCsvProgressQuery_replacement = ({ vars, pollMs }: QueryConfig) => {
    const [gql_d, set_gql_d] = MicroKernel.useState<any>(null);
    const [gql_e, set_gql_e] = MicroKernel.useState<any>(null);
    const [gql_l, set_gql_l] = MicroKernel.useState<boolean>(true);
    const poll_id_ref = MicroKernel.useMemo<{ current: NodeJS.Timeout | null }>(() => ({ current: null }), []);

    const execQuery = MicroKernel.useCallback(async () => {
      set_gql_l(true);
      try {
        const fakeApiResponse = {
          submitCsvProgress: Array.from({ length: Math.min(100, (gql_d?.submitCsvProgress?.length || 0) + Math.floor(Math.random() * 5)) }, (_, i) => ({ id: `proc_${i}` })),
        };
        await new Promise(res => setTimeout(res, 500));
        set_gql_d(fakeApiResponse);
        set_gql_e(null);
      } catch (err) {
        set_gql_e(err);
      } finally {
        set_gql_l(false);
      }
    }, [gql_d]);

    const stopPoll = MicroKernel.useCallback(() => {
      if (poll_id_ref.current) {
        clearInterval(poll_id_ref.current);
        poll_id_ref.current = null;
      }
    }, []);

    MicroKernel.useEffect(() => {
      execQuery();
      poll_id_ref.current = setInterval(execQuery, pollMs);
      return () => stopPoll();
    }, [pollMs]);

    return { gqlData: gql_d, stopPolling: stopPoll };
  };
}

const dataStreamTxt = (dt: DataStreamType) => {
  const map: Record<DataStreamType, string> = {
    [DataStreamType.AnticipatedFunds]: "anticipated fund movements",
    [DataStreamType.LedgerEntries]: "ledger entries",
    [DataStreamType.CustomerProfiles]: "customer profiles",
    [DataStreamType.VendorInvoices]: "vendor invoices",
    [DataStreamType.EmployeePayroll]: "employee payroll records",
    [DataStreamType.SupplyChainManifests]: "supply chain manifests",
    [DataStreamType.DigitalAssetTransfers]: "digital asset transfers",
  };
  return map[dt] || "data units";
};

// --- Begin Massive Infrastructure and Vendor Integration Simulation ---
namespace VendorConnectors {
    const VENDOR_API_BASE = `https://connectors.${CITI_BIZ_DEV_URL}/v1/`;
    abstract class AbstractConnector {
        protected readonly b_url: string;
        public abstract readonly v_name: string;
        constructor(protected a_k: string, protected s_k: string, private readonly e_p: string) {
            this.b_url = `${VENDOR_API_BASE}${this.e_p}`;
        }
        abstract init(): Promise<{ s: boolean; m: string; }>;
        abstract val(p: JSONVal): Promise<boolean>;
        abstract trans(d: JSONVal): Promise<JSONVal>;
        abstract sync(d: JSONVal[]): Promise<{ s_id: string; }>;
        protected async _post(p: string, b: JSONVal): Promise<any> {
            await new Promise(r => setTimeout(r, 50 + Math.random() * 200));
            console.log(`[${this.v_name}] POST to ${this.b_url}/${p} with body`, b);
            return { status: 'ok', timestamp: new Date().toISOString() };
        }
    }

    const companyList = [
        "Gemini", "ChatGPT", "Pipedream", "GitHub", "Hugging Face", "Plaid", "Modern Treasury",
        "Google Drive", "OneDrive", "Azure", "Google Cloud", "Supabase", "Vercel", "Salesforce",
        "Oracle", "MARQETA", "Citibank", "Shopify", "WooCommerce", "GoDaddy", "CPanel", "Adobe",
        "Twilio", "Stripe", "PayPal", "Braintree", "Adyen", "Square", "QuickBooks", "Xero",
        "NetSuite", "SAP", "Workday", "HubSpot", "Marketo", "Mailchimp", "SendGrid", "Intercom",
        "Zendesk", "Jira", "Confluence", "Slack", "Microsoft Teams", "Zoom", "DocuSign",
        "Dropbox", "Box", "Asana", "Trello", "Monday.com", "Notion", "Airtable", "Figma",
        "Sketch", "InVision", "Canva", "Datadog", "New Relic", "Sentry", "PagerDuty",
        "Splunk", "Elastic", "Snowflake", "Databricks", "Redshift", "BigQuery", "Tableau",
        "Looker", "Power BI", "Segment", "mParticle", "Amplitude", "Mixpanel", "Optimizely",

        // Adding more to reach a large number
        "Auth0", "Okta", "Twilio SendGrid", "Postmark", "Algolia", "Cloudflare", "Fastly", "Akamai",
        "AWS Lambda", "Google Cloud Functions", "Azure Functions", "Heroku", "DigitalOcean", "Linode",
        "Vultr", "GitLab", "Bitbucket", "Jenkins", "CircleCI", "Travis CI", "GitHub Actions",
        "Terraform", "Ansible", "Puppet", "Chef", "Kubernetes", "Docker", "Podman", "Redis",

        "PostgreSQL", "MySQL", "MongoDB", "Cassandra", "RabbitMQ", "Kafka", "Pulsar", "NATS",
        "gRPC", "GraphQL", "REST", "OpenAPI", "Swagger", "Postman", "Insomnia", "Cypress",
        "Jest", "Mocha", "Selenium", "Puppeteer", "Playwright", "Storybook", "Bit.dev",
        "Lerna", "Nx", "Webpack", "Vite", "Rollup", "Parcel", "Babel", "TypeScript", "ESLint",
        "Prettier", "WebAssembly", "Rust", "Go", "Python", "Java", "C#", "Ruby", "PHP",
        "Node.js", "Deno", "Bun", "React", "Angular", "Vue.js", "Svelte", "Next.js", "Nuxt.js",
        "Gatsby", "Remix", "SolidJS", "Qwik", "Electron", "React Native", "Flutter", "Swift",
        "Kotlin", "Objective-C", "Dart", "Xamarin", "Unity", "Unreal Engine", "Blender", "Maya",
        "3ds Max", "ZBrush", "Substance Painter", "Photoshop", "Illustrator", "Premiere Pro", "After Effects",
        "Final Cut Pro", "DaVinci Resolve", "Audition", "Logic Pro X", "Ableton Live", "FL Studio",
        "Pro Tools", "Fidelity", "Charles Schwab", "E*TRADE", "TD Ameritrade", "Robinhood", "Coinbase",
        "Binance", "Kraken", "KuCoin", "FTX", "BlockFi", "Celsius", "Nexo", "Ledger", "Trezor",
        "MetaMask", "Phantom", "Solflare", "Yoroi", "Daedalus", "Trust Wallet", "Exodus", "Stripe Atlas",
        "Clerky", "Carta", "Pulley", "AngelList", "Y Combinator", "Techstars", "500 Global",
        "Andreessen Horowitz", "Sequoia Capital", "Accel", "Lightspeed Venture Partners", "Kleiner Perkins",
        "Insight Partners", "General Catalyst", "Bessemer Venture Partners", "Index Ventures", "NEA",
        "Tiger Global", "SoftBank Vision Fund", "Goldman Sachs", "J.P. Morgan", "Morgan Stanley",
        "Bank of America", "Wells Fargo", "HSBC", "Barclays", "Deutsche Bank", "UBS", "Credit Suisse",
        "Nomura", "Mizuho", "SMBC", "MUFG", "BlackRock", "Vanguard", "State Street", "Fidelity Investments",
        "Capital Group", "T. Rowe Price", "Invesco", "PIMCO", "Bridgewater Associates", "Renaissance Technologies",
        "Citadel", "Point72", "D.E. Shaw", "Two Sigma", "Millennium Management", "Man Group",
        "AQR Capital", "Elliott Management", "Pershing Square", "Third Point", "Starboard Value",
        "Icahn Enterprises", "Berkshire Hathaway", "Visa", "Mastercard", "American Express", "Discover",
        "JCB", "UnionPay", "Diners Club", "Apple Pay", "Google Pay", "Samsung Pay", "Venmo", "Cash App",
        "Zelle", "Western Union", "MoneyGram", "Ria", "Wise", "Remitly", "WorldRemit",
        "FedEx", "UPS", "DHL", "USPS", "Maersk", "MSC", "CMA CGM", "COSCO", "Hapag-Lloyd",
        "Evergreen Marine", "ONE", "Yang Ming", "HMM", "Zim", "DB Schenker", "Kuehne + Nagel",
        "Nippon Express", "DSV", "C.H. Robinson", "Expeditors", "Uber Freight", "Convoy", "Flexport",
        "Amazon", "Alibaba", "eBay", "Walmart", "Target", "Costco", "Home Depot", "Lowe's",
        "Best Buy", "Macy's", "Nordstrom", "Kohl's", "Gap", "Nike", "Adidas", "Under Armour",
        "Lululemon", "Zara", "H&M", "Uniqlo", "Apple", "Microsoft", "Google", "Meta", "Amazon Web Services",
        "NVIDIA", "AMD", "Intel", "Qualcomm", "Broadcom", "Texas Instruments", "Micron", "TSMC",
        "Samsung Electronics", "SK Hynix", "ASML", "Applied Materials", "Lam Research", "KLA Corporation",
        "Tesla", "Ford", "General Motors", "Toyota", "Volkswagen", "Honda", "Hyundai", "BMW",
        "Mercedes-Benz", "Stellantis", "BYD", "NIO", "XPeng", "Li Auto", "Rivian", "Lucid Motors",
        "Boeing", "Airbus", "Lockheed Martin", "Raytheon", "Northrop Grumman", "General Dynamics",
        "BAE Systems", "SpaceX", "Blue Origin", "Virgin Galactic", "Rocket Lab", "Astra", "Relativity Space",
        "Pfizer", "Moderna", "Johnson & Johnson", "AstraZeneca", "Merck", "Bristol Myers Squibb",
        "AbbVie", "Novartis", "Roche", "Sanofi", "Gilead Sciences", "Amgen", "Eli Lilly", "Biogen",
        "Vertex Pharmaceuticals", "Regeneron", "Takeda", "GlaxoSmithKline", "ExxonMobil", "Chevron",
        "Shell", "BP", "TotalEnergies", "ConocoPhillips", "Saudi Aramco", "Petrobras", "Gazprom",
        "Rosneft", "Sinopec", "PetroChina", "Reliance Industries", "AT&T", "Verizon", "T-Mobile",
        "Comcast", "Charter Communications", "Deutsche Telekom", "Vodafone", "Orange", "Telefónica",
        "China Mobile", "NTT", "SoftBank", "Netflix", "Disney", "Warner Bros. Discovery", "Paramount Global",
        "NBCUniversal", "Sony", "Spotify", "Apple Music", "Amazon Music", "YouTube Music", "Tencent Music",
        "Coca-Cola", "PepsiCo", "Nestlé", "Procter & Gamble", "Unilever", "Johnson & Johnson (Consumer)",
        "L'Oréal", "Estée Lauder", "McDonald's", "Starbucks", "Yum! Brands", "Domino's Pizza",
        "Restaurant Brands International", "Chipotle", "Darden Restaurants", "Marriott", "Hilton",
        "Hyatt", "IHG Hotels & Resorts", "Accor", "Wyndham", "Choice Hotels", "Airbnb", "Vrbo",
        "Booking.com", "Expedia", "Trip.com", "Sabre", "Amadeus", "Travelport", "Delta Air Lines",
        "American Airlines", "United Airlines", "Southwest Airlines", "Lufthansa", "Air France-KLM",
        "IAG", "Emirates", "Qatar Airways", "Singapore Airlines", "Cathay Pacific", "Qantas",
        "Carnival Cruise Line", "Royal Caribbean", "Norwegian Cruise Line", "MSC Cruises", "Viking Cruises",
        "General Electric", "Siemens", "Hitachi", "Mitsubishi Heavy Industries", "Honeywell", "3M",
        "Caterpillar", "Deere & Company", "Komatsu", "Volvo Group", "Dow", "DuPont", "BASF",
        "LyondellBasell", "SABIC", "Ineos", "Cargill", "ADM", "Bunge", "Louis Dreyfus Company",
        "Tyson Foods", "JBS", "Sysco", "US Foods", "Performance Food Group", "Waste Management",
        "Republic Services", "Veolia", "Suez", "Accenture", "Deloitte", "PwC", "EY", "KPMG",
        "McKinsey & Company", "Boston Consulting Group", "Bain & Company", "Gartner", "Forrester",
        "Nielsen", "Ipsos", "Kantar", "WPP", "Omnicom Group", "Publicis Groupe", "Interpublic Group",
        "Dentsu", "Havas", "The Trade Desk", "Magnite", "PubMatic", "Criteo", "Outbrain", "Taboola",
        // ... and so on for hundreds more
    ];

    const connectorImplementations: any = {};
    companyList.forEach(name => {
        const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '');
        const endpoint = sanitizedName.toLowerCase();
        const className = `${sanitizedName}Connector`;

        const dynamicClass = class extends AbstractConnector {
            public readonly v_name: string = name;
            private c_id: string = `cid_${Math.random().toString(16).slice(2)}`;
            private session_active: boolean = false;
            
            constructor(a_k: string, s_k: string) {
                super(a_k, s_k, endpoint);
            }

            public async init(): Promise<{ s: boolean; m: string; }> {
                console.log(`Initializing ${this.v_name} with key ${this.a_k.substring(0, 4)}...`);
                try {
                    const res = await this._post('auth/init', { c_id: this.c_id });
                    this.session_active = res.status === 'ok';
                    return { s: this.session_active, m: `Session for ${this.v_name} is ${this.session_active ? 'active' : 'failed'}` };
                } catch (e: any) {
                    this.session_active = false;
                    return { s: false, m: e.message };
                }
            }

            public async val(p: JSONVal): Promise<boolean> {
                if (!this.session_active) throw new Error(`${this.v_name} session is not active.`);
                console.log(`Validating payload for ${this.v_name}`);
                const res = await this._post('validate', { payload: p });
                return res.status === 'ok' && (Math.random() > 0.05); // 5% chance of validation failure
            }

            public async trans(d: JSONVal): Promise<JSONVal> {
                if (!this.session_active) throw new Error(`${this.v_name} session is not active.`);
                console.log(`Transforming data via ${this.v_name} ruleset.`);
                const res = await this._post('transform', { data: d });
                return { transformedBy: this.v_name, original: d, transformed: res };
            }

            public async sync(d: JSONVal[]): Promise<{ s_id: string; }> {
                if (!this.session_active) throw new Error(`${this.v_name} session is not active.`);
                console.log(`Syncing batch of ${d.length} records to ${this.v_name}`);
                const syncId = `sync_${this.v_name.toLowerCase()}_${Date.now()}`;
                await this._post('sync/batch', { items: d, sync_id: syncId });
                return { s_id: syncId };
            }
        };

        connectorImplementations[className] = dynamicClass;
    });
    
    // Make them available on the namespace
    Object.assign(VendorConnectors, connectorImplementations);
}
// --- End Massive Infrastructure and Vendor Integration Simulation ---


interface DataProcModalProps {
  ingestionJobIdentifier: string;
  totalRecordCount: number;
  dataSourceType: DataStreamType;
  onProcessingFinished: () => void;
}

export function DataIngestionProgressDialog({
  ingestionJobIdentifier: b_i_id,
  totalRecordCount: r_ct,
  dataSourceType: d_typ,
  onProcessingFinished: on_fin,
}: DataProcModalProps) {
  const nav_handler = useNavi();
  const { gqlData: gql_d, stopPolling: stop_poll } = GQL_NetworkLayer.useSubmitCsvProgressQuery_replacement({
    vars: { ingestionJobIdentifier: b_i_id },
    pollMs: 1000,
  });

  const complete_ct = gql_d?.submitCsvProgress.length || 0;
  const is_proc_done = complete_ct >= r_ct;

  MicroKernel.useEffect(() => {
    if (is_proc_done) {
      stop_poll();
      on_fin();
    }
  }, [is_proc_done]);

  const prog_bar_wrapper_cn = StyleInjector.css`margin-bottom: 8px; height: 10px; width: 100%; border-radius: 5px; background-color: #e5e7eb;`;
  const prog_bar_inner_cn = StyleInjector.css`height: 10px; border-radius: 5px; background-color: #3b82f6; transition: width 100ms ease-out;`;
  const prog_text_cn = StyleInjector.css`font-size: 0.875rem; color: #4b5563;`;
  const footer_grid_cn = StyleInjector.css`display: grid; width: 100%; gap: 8px;`;

  return MicroKernel.createVNode(
    CoreUI.DialogShell,
    { open: true, titleText: "Data Stream Assimilation" },
    MicroKernel.createVNode(
      CoreUI.DialogHdr,
      {},
      MicroKernel.createVNode(
        CoreUI.DialogTitle,
        {},
        MicroKernel.createVNode(
          CoreUI.Txt,
          { level: "h3", size: "l" },
          `Fabricating ${dataStreamTxt(d_typ)}`
        )
      )
    ),
    MicroKernel.createVNode(
      CoreUI.DialogBody,
      {},
      MicroKernel.createVNode(
        "div",
        { className: StyleInjector.css`padding-top: 8px; padding-bottom: 8px;` },
        is_proc_done
          ? MicroKernel.createVNode(
              "span",
              {},
              `All ${complete_ct} ${dataStreamTxt(d_typ)} have been assimilated.`
            )
          : MicroKernel.createVNode(
              MicroKernel.createVNode,
              {},
              MicroKernel.createVNode(
                "div",
                { className: prog_bar_wrapper_cn },
                MicroKernel.createVNode("div", {
                  className: prog_bar_inner_cn,
                  style: {
                    width: `${(complete_ct / r_ct) * 100}%`,
                  },
                })
              ),
              MicroKernel.createVNode(
                "span",
                { className: prog_text_cn },
                `${complete_ct} of ${r_ct} ${dataStreamTxt(d_typ)} assimilated`
              )
            )
      )
    ),
    MicroKernel.createVNode(
      CoreUI.DialogFoot,
      {},
      MicroKernel.createVNode(
        "div",
        { className: footer_grid_cn },
        MicroKernel.createVNode(CoreUI.ActBtn, {
          disabled: !is_proc_done,
          full: true,
          onClick: () => {
            nav_handler.performNav(`/ingestion-jobs/${b_i_id}`);
          },
          text: "Scrutinize Ingestion Job",
        }),
        MicroKernel.createVNode(CoreUI.ActBtn, {
          disabled: !is_proc_done,
          full: true,
          onClick: () => {
            window.location.href = "/ingestion-jobs/initiate";
          },
          text: "Initiate Another Data Stream",
        })
      )
    )
  );
}
export default DataIngestionProgressDialog;