// Copyright James Burvel O’Callaghan IV
// CEO Citibank demo business Inc

type Primitive = string | number | boolean | null | undefined;
type JSONValue = Primitive | { [key: string]: JSONValue } | JSONValue[];
type JSONObject = { [key: string]: JSONValue };

const CDBI_BASE_URL = 'https://api.citibankdemobusiness.dev/v1/';

const GLOBAL_CONFIG = {
  companyName: 'Citibank demo business Inc',
  baseUrl: CDBI_BASE_URL,
  timeout: 30000,
  retries: 3,
};

export class CdbiPhone {
  private n: string;
  constructor(p: string) {
    if (!/^\+?[1-9]\d{1,14}$/.test(p)) {
      throw new Error("Invalid phone number format");
    }
    this.n = p;
  }
  getVal(): string {
    return this.n;
  }
}

export class CdbiEmail {
  private e: string;
  constructor(m: string) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m)) {
      throw new Error("Invalid email format");
    }
    this.e = m;
  }
  getVal(): string {
    return this.e;
  }
}


export namespace ReactiveMiniKernel {
    type SetStateAction<S> = S | ((prevState: S) => S);
    type Dispatch<A> = (value: A) => void;
    
    let currentlyRenderingComponent: number = 0;
    let hookIndex: number = 0;
    const componentStates: any[][] = [];

    export function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>] {
        const componentId = currentlyRenderingComponent;
        const currentHookIndex = hookIndex;
        hookIndex++;

        if (componentStates[componentId] === undefined) {
            componentStates[componentId] = [];
        }

        if (componentStates[componentId][currentHookIndex] === undefined) {
            componentStates[componentId][currentHookIndex] = typeof initialState === 'function' ? (initialState as () => S)() : initialState;
        }

        const setState = (newState: SetStateAction<S>) => {
            const oldState = componentStates[componentId][currentHookIndex];
            const resolvedState = typeof newState === 'function' ? (newState as (prevState: S) => S)(oldState) : newState;
            if (oldState !== resolvedState) {
                componentStates[componentId][currentHookIndex] = resolvedState;
                // In a real implementation, this would trigger a re-render.
                console.log(`State updated for component ${componentId}, hook ${currentHookIndex}. New state:`, resolvedState);
            }
        };

        return [componentStates[componentId][currentHookIndex], setState];
    }

    export function useEffect(effect: () => (() => void) | void, deps?: any[]) {
        const componentId = currentlyRenderingComponent;
        const currentHookIndex = hookIndex;
        hookIndex++;

        const oldDeps = componentStates[componentId]?.[currentHookIndex]?.[1];
        const hasChanged = !deps || !oldDeps || deps.some((dep, i) => dep !== oldDeps[i]);

        if (hasChanged) {
            const cleanup = componentStates[componentId]?.[currentHookIndex]?.[0];
            if (typeof cleanup === 'function') {
                cleanup();
            }
            const newCleanup = effect();
            componentStates[componentId][currentHookIndex] = [newCleanup, deps];
        }
    }

    export function createElement(tag: string | Function, props: { [key: string]: any } | null, ...children: any[]) {
        if (typeof tag === 'function') {
            currentlyRenderingComponent++;
            hookIndex = 0;
            if (componentStates[currentlyRenderingComponent] === undefined) {
              componentStates[currentlyRenderingComponent] = [];
            }
            return tag({ ...props, children: children.flat() });
        }
        return { tag, props, children: children.flat() };
    }
    
    export interface CmpntProps {
        [key: string]: any;
        children?: any;
    }
}

export namespace FormSystem {
    type FormValues = { [field: string]: any };
    type FormErrors = { [field: string]: string | undefined };
    type FormTouched = { [field: string]: boolean | undefined };

    interface FormState<V> {
        vals: V;
        errs: FormErrors;
        tchd: FormTouched;
    }

    interface FormContext<V> {
        state: FormState<V>;
        setFieldValue: (field: string, value: any) => void;
        setFieldTouched: (field: string, isTouched: boolean, shouldValidate?: boolean) => void;
        submitForm: () => Promise<void>;
    }
    
    let formCtx: FormContext<any> | null = null;

    export function useFormCtx<V>(): FormContext<V> {
        if (!formCtx) {
            throw new Error("useFormCtx must be used within a FormProvider");
        }
        return formCtx;
    }

    export function FormProvider<V extends FormValues>({
        initialValues,
        onSubmit,
        children,
    }: {
        initialValues: V;
        onSubmit: (values: V) => void | Promise<any>;
        children: (ctx: FormContext<V>) => any;
    }) {
        const [state, setState] = ReactiveMiniKernel.useState<FormState<V>>({
            vals: initialValues,
            errs: {},
            tchd: {},
        });

        const setFieldValue = (f: string, v: any) => {
            setState(s => ({
                ...s,
                vals: { ...s.vals, [f]: v },
            }));
        };
        
        const setFieldTouched = (f: string, t: boolean) => {
             setState(s => ({
                ...s,
                tchd: { ...s.tchd, [f]: t },
            }));
        };
        
        const submitForm = async () => {
            await Promise.resolve(onSubmit(state.vals));
        };
        
        const currentContext: FormContext<V> = { state, setFieldValue, setFieldTouched, submitForm };
        formCtx = currentContext;
        
        return children(currentContext);
    }

    export function DataField({ children, name }: { children: (fieldProps: any) => any; name: string }) {
        const ctx = useFormCtx();
        const fieldProps = {
            field: {
                name,
                value: ctx.state.vals[name],
                onChange: (e: any) => ctx.setFieldValue(name, e.target.value),
                onBlur: () => ctx.setFieldTouched(name, true),
            },
            form: {
                setFieldValue: ctx.setFieldValue,
            },
            meta: {
                touched: ctx.state.tchd[name],
                error: ctx.state.errs[name],
            },
        };
        return children(fieldProps);
    }
}

export const RESOURCE_CATALOG = {
  LEDGER: "LGR",
  ACCOUNT: "ACCT",
  TRANSACTION: "TXN",
  USER: "USR",
  ORGANIZATION: "ORG",
};

const deepClone = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item));
    }
    const clone = Object.create(Object.getPrototypeOf(obj));
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            clone[key] = deepClone(obj[key]);
        }
    }
    return clone;
};

const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export namespace IntegrationServices {
    const BASE_URL = GLOBAL_CONFIG.baseUrl;

    const createApiClient = (service: string, apiKey: string) => {
        const headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'X-CDBI-Service': service,
            'X-CDBI-Company': GLOBAL_CONFIG.companyName,
        };
        return {
            get: async (endpoint: string, params: object = {}) => {
                const url = new URL(`${BASE_URL}${service}/${endpoint}`);
                Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, String(v)));
                console.log(`FETCH GET: ${url.toString()}`);
                return { status: 200, data: { message: `GET response from ${service}` } };
            },
            post: async (endpoint: string, body: object) => {
                console.log(`FETCH POST: ${BASE_URL}${service}/${endpoint}`, JSON.stringify(body));
                return { status: 201, data: { id: generateUUID(), ...body } };
            },
        };
    };

    export const PlaidConnector = {
        name: 'Plaid',
        init: (apiKey: string) => {
            const client = createApiClient('plaid', apiKey);
            return {
                createLinkToken: (userId: string) => client.post('link/token/create', { user: userId }),
                exchangePublicToken: (publicToken: string) => client.post('item/public_token/exchange', { public_token: publicToken }),
                getAccounts: (accessToken: string) => client.get(`accounts/get`, { access_token: accessToken }),
                getTransactions: (accessToken: string, startDate: string, endDate: string) => client.get('transactions/get', { access_token: accessToken, start_date: startDate, end_date: endDate }),
            };
        }
    };

    export const ModernTreasuryConnector = {
        name: 'Modern Treasury',
        init: (orgId: string, apiKey: string) => {
            const client = createApiClient('modern_treasury', `${orgId}:${apiKey}`);
            return {
                createPaymentOrder: (order: object) => client.post('payment_orders', order),
                getPaymentOrder: (id: string) => client.get(`payment_orders/${id}`),
                listCounterparties: () => client.get('counterparties'),
                createCounterparty: (party: object) => client.post('counterparties', party),
            };
        }
    };
    
    export const SalesforceConnector = {
        name: 'Salesforce',
        init: (apiKey: string) => {
            const client = createApiClient('salesforce', apiKey);
            return {
                query: (soql: string) => client.get('query', { q: soql }),
                createRecord: (sobject: string, data: object) => client.post(`sobjects/${sobject}`, data),
                updateRecord: (sobject: string, id: string, data: object) => client.post(`sobjects/${sobject}/${id}`, { _method: 'PATCH', ...data }),
            };
        }
    };
    
    export const GoogleDriveConnector = {
        name: 'Google Drive',
        init: (apiKey: string) => {
            const client = createApiClient('google_drive', apiKey);
            return {
                listFiles: (folderId: string = 'root') => client.get('files', { q: `'${folderId}' in parents` }),
                uploadFile: (metadata: object, content: any) => client.post('upload/files?uploadType=multipart', { metadata, content }),
            };
        }
    };

    export const GeminiConnector = {
        name: 'Gemini',
        init: (apiKey: string) => {
            const client = createApiClient('gemini', apiKey);
            return {
                getBalances: () => client.get('balances'),
                newOrder: (symbol: string, amount: string, price: string, side: 'buy'|'sell') => client.post('order/new', { symbol, amount, price, side }),
            };
        }
    };
    
    export const OpenAiChatGptConnector = {
        name: 'ChatGPT',
        init: (apiKey: string) => {
            const client = createApiClient('openai', apiKey);
            return {
                createCompletion: (prompt: string, model: string = 'text-davinci-003') => client.post('completions', { model, prompt, max_tokens: 150 }),
            };
        }
    };

    export const PipedreamConnector = {
        name: 'Pipedream',
        init: (apiKey: string) => {
            const client = createApiClient('pipedream', apiKey);
            return {
                triggerWorkflow: (workflowId: string, payload: object) => client.post(`workflows/${workflowId}/triggers/http`, payload),
            };
        }
    };

    export const GitHubConnector = {
        name: 'GitHub',
        init: (apiKey: string) => {
            const client = createApiClient('github', apiKey);
            return {
                getRepo: (owner: string, repo: string) => client.get(`repos/${owner}/${repo}`),
                createIssue: (owner: string, repo: string, issue: object) => client.post(`repos/${owner}/${repo}/issues`, issue),
            };
        }
    };

    export const HuggingFaceConnector = {
        name: 'Hugging Face',
        init: (apiKey: string) => {
            const client = createApiClient('huggingface', apiKey);
            return {
                runInference: (model: string, inputs: any) => client.post(`inference/${model}`, { inputs }),
            };
        }
    };

    export const OneDriveConnector = {
        name: 'OneDrive',
        init: (apiKey: string) => {
            const client = createApiClient('onedrive', apiKey);
            return {
                listChildren: (itemId: string = 'root') => client.get(`me/drive/items/${itemId}/children`),
            };
        }
    };

    export const AzureConnector = {
        name: 'Azure',
        init: (apiKey: string) => {
            const client = createApiClient('azure', apiKey);
            return {
                listBlobs: (container: string) => client.get(`${container}?restype=container&comp=list`),
            };
        }
    };

    export const GoogleCloudConnector = {
        name: 'Google Cloud',
        init: (apiKey: string) => {
            const client = createApiClient('gcp', apiKey);
            return {
                listBuckets: (projectId: string) => client.get(`storage/v1/b?project=${projectId}`),
            };
        }
    };

    export const SupabaseConnector = {
        name: 'Supabase',
        init: (apiKey: string, projectUrl: string) => {
            const client = createApiClient('supabase', apiKey);
            return {
                from: (table: string) => ({
                    select: (columns: string = '*') => client.get(`${projectUrl}/rest/v1/${table}?select=${columns}`),
                    insert: (data: object) => client.post(`${projectUrl}/rest/v1/${table}`, data),
                }),
            };
        }
    };

    export const VercelConnector = {
        name: 'Vercel',
        init: (apiKey: string) => {
            const client = createApiClient('vercel', apiKey);
            return {
                listDeployments: (app: string) => client.get(`v6/deployments?app=${app}`),
            };
        }
    };

    export const OracleConnector = {
        name: 'Oracle',
        init: (apiKey: string) => {
            const client = createApiClient('oracle', apiKey);
            return {
                executeQuery: (sql: string) => client.post('database/sql', { query: sql }),
            };
        }
    };

    export const MarqetaConnector = {
        name: 'Marqeta',
        init: (apiKey: string) => {
            const client = createApiClient('marqeta', apiKey);
            return {
                createUser: (data: object) => client.post('users', data),
                createCardProduct: (data: object) => client.post('cardproducts', data),
            };
        }
    };

    export const CitibankConnector = {
        name: 'Citibank',
        init: (apiKey: string) => {
            const client = createApiClient('citibank', apiKey);
            return {
                getAccounts: () => client.get('accounts'),
                initiatePayment: (payment: object) => client.post('payments', payment),
            };
        }
    };
    
    export const ShopifyConnector = {
        name: 'Shopify',
        init: (apiKey: string, shop: string) => {
            const client = createApiClient(`shopify/${shop}`, apiKey);
            return {
                getProducts: () => client.get('products.json'),
                createOrder: (order: object) => client.post('orders.json', { order }),
            };
        }
    };

    export const WooCommerceConnector = {
        name: 'WooCommerce',
        init: (consumerKey: string, consumerSecret: string) => {
            const client = createApiClient('woocommerce', `${consumerKey}:${consumerSecret}`);
            return {
                getProducts: () => client.get('products'),
                createOrder: (order: object) => client.post('orders', order),
            };
        }
    };

    export const GoDaddyConnector = {
        name: 'GoDaddy',
        init: (apiKey: string) => {
            const client = createApiClient('godaddy', apiKey);
            return {
                listDomains: () => client.get('domains'),
            };
        }
    };

    export const CPanelConnector = {
        name: 'cPanel',
        init: (apiKey: string) => {
            const client = createApiClient('cpanel', apiKey);
            return {
                listAccounts: () => client.get('listaccts'),
            };
        }
    };
    
    export const AdobeConnector = {
        name: 'Adobe',
        init: (apiKey: string) => {
            const client = createApiClient('adobe', apiKey);
            return {
                getAnalyticsReport: (suiteId: string, report: object) => client.post(`analytics/reports/${suiteId}`, report),
            };
        }
    };

    export const TwilioConnector = {
        name: 'Twilio',
        init: (accountSid: string, authToken: string) => {
            const client = createApiClient('twilio', `${accountSid}:${authToken}`);
            return {
                sendMessage: (from: string, to: string, body: string) => client.post(`Accounts/${accountSid}/Messages.json`, { From: from, To: to, Body: body }),
            };
        }
    };

    export const StripeConnector = {
        name: 'Stripe',
        init: (apiKey: string) => {
            const client = createApiClient('stripe', apiKey);
            return {
                createCharge: (amount: number, currency: string, source: string) => client.post('charges', { amount, currency, source }),
                listCustomers: () => client.get('customers'),
            };
        }
    };
    
    export const SlackConnector = {
        name: 'Slack',
        init: (apiKey: string) => {
            const client = createApiClient('slack', apiKey);
            return {
                postMessage: (channel: string, text: string) => client.post('chat.postMessage', { channel, text }),
            };
        }
    };

    const createDummyConnector = (name: string) => ({
        name,
        init: (apiKey: string) => {
            const client = createApiClient(name.toLowerCase().replace(/\s/g, '_'), apiKey);
            return {
                get: (endpoint: string) => client.get(endpoint),
                create: (endpoint: string, data: object) => client.post(endpoint, data),
            };
        },
    });

    const additionalServices = [
      'Asana', 'Jira', 'Trello', 'Miro', 'Notion', 'Airtable', 'Dropbox', 'Box', 'Zoom', 'WebEx', 'Google Meet', 'Microsoft Teams',
      'DocuSign', 'HelloSign', 'PandaDoc', 'QuickBooks', 'Xero', 'FreshBooks', 'Wave', 'Gusto', 'Rippling', 'ADP', 'Justworks',
      'Zendesk', 'Intercom', 'HubSpot', 'Marketo', 'Pardot', 'Mailchimp', 'Constant Contact', 'SendGrid', 'Postmark', 'Segment',
      'Mixpanel', 'Amplitude', 'Heap', 'FullStory', 'Hotjar', 'Google Analytics', 'Datadog', 'New Relic', 'Sentry', 'LogRocket',
      'PagerDuty', 'Opsgenie', 'VictorOps', 'Auth0', 'Okta', 'OneLogin', 'Firebase', 'AWS Amplify', 'Netlify', 'Heroku', 'DigitalOcean',
      'Linode', 'Cloudflare', 'Fastly', 'Akamai', 'Twitch', 'YouTube', 'Vimeo', 'Wistia', 'Discord', 'Telegram', 'WhatsApp', 'Facebook Messenger',
      'Instagram', 'Twitter', 'LinkedIn', 'Pinterest', 'Snapchat', 'TikTok', 'Reddit', 'Quora', 'Medium', 'WordPress', 'Squarespace', 'Wix',
      'Webflow', 'Bubble', 'Zapier', 'Integromat', 'Workato', 'Tray.io', 'Algolia', 'Elasticsearch', 'Redis', 'MongoDB', 'PostgreSQL',
      'MySQL', 'MariaDB', 'SQLite', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Chef', 'Puppet', 'Jenkins', 'CircleCI', 'Travis CI',
      'GitLab CI', 'Bitbucket Pipelines', 'Confluence', 'monday.com', 'ClickUp', 'Smartsheet', 'SurveyMonkey', 'Typeform', 'Calendly',
      'Doodle', 'Grammarly', 'Loom', 'Canva', 'Figma', 'Sketch', 'InVision', 'Zeplin', 'MuleSoft', 'Boomi', 'Celigo', 'Jitterbit',
      'Avalara', 'TaxJar', 'ShipStation', 'Shippo', 'AfterShip', 'Chargebee', 'Recurly', 'Zuora', 'Braintree', 'Adyen', 'PayPal',
      'Square', 'Worldpay', 'Checkout.com', 'Klarna', 'Affirm', 'Afterpay', 'Carta', 'AngelList', 'Crunchbase', 'PitchBook', 'DocSend',
      'Clearbit', 'ZoomInfo', 'SalesLoft', 'Outreach', 'Gong.io', 'Chorus.ai', 'Tableau', 'Looker', 'Power BI', 'Qlik', 'Snowflake',
      'BigQuery', 'Redshift', 'Databricks', 'Fivetran', 'Stitch', 'dbt', 'Airflow', 'Luigi', 'Prefect', 'SAP', 'NetSuite', 'Workday',
      'Epic', 'Cerner', 'Athenahealth', 'LexisNexis', 'Westlaw', 'Bloomberg', 'Reuters', 'FactSet', 'Morningstar', 'S&P Global',
      'Moody\'s', 'Fitch', 'Equifax', 'Experian', 'TransUnion', 'Yodlee', 'Finicity', 'MX', 'Apex Clearing', 'DriveWealth', 'Alpaca',
      'Eventbrite', 'Meetup', 'Ticketmaster', 'StubHub', 'Patreon', 'Kickstarter', 'Indiegogo', 'GoFundMe', 'Cameo', 'Substack',
      'Ghost', 'Teachable', 'Thinkific', 'Kajabi', 'Podia', 'Udemy', 'Coursera', 'edX', 'Skillshare', 'MasterClass', 'Duolingo',
      'Rosetta Stone', 'Babbel', 'Codecademy', 'freeCodeCamp', 'LeetCode', 'HackerRank', 'Topcoder', 'Kaggle', 'GitHub Copilot',
      'Tabnine', 'Kite', 'Repl.it', 'CodeSandbox', 'Glitch', 'Postman', 'Insomnia', 'Swagger', 'Apiary', 'ReadMe', 'Stoplight',
      'Evernote', 'OneNote', 'Bear', 'Ulysses', 'Scrivener', 'Todoist', 'Things', 'OmniFocus', 'Asana', '1Password', 'LastPass',
      'Dashlane', 'Bitwarden', 'ProtonMail', 'Hey.com', 'Superhuman', 'Front', 'Help Scout', 'Drift', 'Tawk.to', 'LiveChat', 'Olark',
      'Optimizely', 'VWO', 'Google Optimize', 'LaunchDarkly', 'Split.io', 'Unbounce', 'Instapage', 'Leadpages', 'ClickFunnels',
      'Klaviyo', 'Drip', 'ActiveCampaign', 'ConvertKit', 'AWeber', 'GetResponse', 'Buffer', 'Hootsuite', 'Sprout Social', 'Later',
      'MeetEdgar', 'CoSchedule', 'Agorapulse', 'Brandwatch', 'Meltwater', 'Cision', 'SEMrush', 'Ahrefs', 'Moz', 'SpyFu', 'Screaming Frog',
      'Yoast', 'Rank Math', 'Google Search Console', 'Bing Webmaster Tools', 'Google Tag Manager', 'Tealium', 'Ensighten', 'Crazy Egg',
      'Mouseflow', 'UserTesting', 'Lookback', 'Usabilla', 'Qualtrics', 'Medallia', 'Gainsight', 'Catalyst', 'ChurnZero', 'Totango',
      'Bill.com', 'Expensify', 'Brex', 'Ramp', 'Divvy', 'TripActions', 'Coupa', 'Ariba', 'Jaggaer', 'Ivalua', 'Etsy', 'eBay', 'Amazon',
      'Walmart', 'Target', 'Best Buy', 'Home Depot', 'Lowe\'s', 'Wayfair', 'Overstock', 'Newegg', 'Zappos', 'Sephora', 'Ulta',
      'Macy\'s', 'Nordstrom', 'Kohl\'s', 'JCPenney', 'Gap', 'Old Navy', 'Banana Republic', 'Athleta', 'Lululemon', 'Nike', 'Adidas',
      'Under Armour', 'Puma', 'Reebok', 'New Balance', 'Converse', 'Vans', 'Doc Martens', 'Timbaland', 'The North Face', 'Patagonia',
      'Columbia', 'Marmot', 'Arc\'teryx', 'Canada Goose', 'Moncler', 'Prada', 'Gucci', 'Louis Vuitton', 'Chanel', 'Dior', 'Hermès',
      'Rolex', 'Patek Philippe', 'Audemars Piguet', 'Omega', 'Cartier', 'Tiffany & Co.', 'Bulgari', 'Harry Winston', 'Van Cleef & Arpels',
      'Ferrari', 'Lamborghini', 'Porsche', 'Bugatti', 'McLaren', 'Rolls-Royce', 'Bentley', 'Aston Martin', 'Maserati', 'Tesla',
      'Rivian', 'Lucid', 'Polestar', 'Nio', 'XPeng', 'BYD', 'Toyota', 'Honda', 'Nissan', 'Ford', 'Chevrolet', 'Jeep', 'BMW', 'Mercedes-Benz',
      'Audi', 'Volkswagen', 'Volvo', 'Subaru', 'Hyundai', 'Kia', 'Mazda', 'Lexus', 'Acura', 'Infiniti', 'Cadillac', 'Lincoln', 'Buick',
      'GMC', 'Ram', 'Chrysler', 'Dodge', 'Fiat', 'Alfa Romeo', 'Mini', 'Jaguar', 'Land Rover', 'Genesis', 'Mitsubishi', 'Suzuki',
      'IKEA', 'West Elm', 'Pottery Barn', 'Crate & Barrel', 'Restoration Hardware', 'Williams-Sonoma', 'Sur La Table', 'Bed Bath & Beyond',
      'Container Store', 'Costco', 'Sam\'s Club', 'BJ\'s', 'Whole Foods', 'Trader Joe\'s', 'Kroger', 'Albertsons', 'Safeway', 'Publix',
      'H-E-B', 'Wegmans', 'Aldi', 'Lidl', '7-Eleven', 'Wawa', 'Sheetz', 'QuikTrip', 'Buc-ee\'s', 'Starbucks', 'Dunkin\'', 'Peet\'s Coffee',
      'Tim Hortons', 'McDonald\'s', 'Burger King', 'Wendy\'s', 'Taco Bell', 'KFC', 'Pizza Hut', 'Domino\'s', 'Papa John\'s', 'Little Caesars',
      'Subway', 'Jimmy John\'s', 'Jersey Mike\'s', 'Firehouse Subs', 'Chipotle', 'Qdoba', 'Moe\'s', 'Panera Bread', 'Au Bon Pain',
      'Shake Shack', 'Five Guys', 'In-N-Out', 'Whataburger', 'Culver\'s', 'Chick-fil-A', 'Popeyes', 'Bojangles', 'Zaxby\'s', 'Raising Cane\'s',
      'P.F. Chang\'s', 'Cheesecake Factory', 'Olive Garden', 'Red Lobster', 'Applebee\'s', 'Chili\'s', 'TGI Fridays', 'Outback Steakhouse',
      'LongHorn Steakhouse', 'Texas Roadhouse', 'Ruth\'s Chris', 'Morton\'s', 'Capital Grille', 'Fleming\'s', 'Fogo de Chão', 'Benihana',
      'Nobu', 'Zuma', 'Four Seasons', 'Ritz-Carlton', 'St. Regis', 'Mandarin Oriental', 'Rosewood', 'Aman', 'Belmond', 'Hyatt', 'Marriott',
      'Hilton', 'IHG', 'Accor', 'Wyndham', 'Choice Hotels', 'Best Western', 'Radisson', 'Airbnb', 'Vrbo', 'Booking.com', 'Expedia',
      'Hotels.com', 'Travelocity', 'Orbitz', 'Priceline', 'Kayak', 'Google Flights', 'Skyscanner', 'Hopper', 'TripAdvisor', 'Yelp',
      'OpenTable', 'Resy', 'Tock', 'Uber', 'Lyft', 'Didi', 'Grab', 'Go-Jek', 'Ola', 'Bolt', 'Uber Eats', 'DoorDash', 'Grubhub',
      'Postmates', 'Instacart', 'Shipt', 'Gopuff', 'FreshDirect', 'Seamless', 'Caviar', 'Netflix', 'Hulu', 'Disney+', 'HBO Max',
      'Amazon Prime Video', 'Apple TV+', 'Peacock', 'Paramount+', 'YouTube TV', 'Sling TV', 'FuboTV', 'Philo', 'Spotify', 'Apple Music',
      'Amazon Music', 'YouTube Music', 'Tidal', 'Deezer', 'Pandora', 'SoundCloud', 'Bandcamp', 'SiriusXM', 'Audible', 'Libby', 'Scribd',
      'Blinkist', 'Kindle', 'Nook', 'Kobo', 'Goodreads', 'The New York Times', 'The Wall Street Journal', 'The Washington Post', 'The Guardian',
      'The Economist', 'Financial Times', 'Bloomberg News', 'Reuters News', 'Associated Press', 'BBC News', 'CNN', 'Fox News', 'MSNBC',
      'NPR', 'ESPN', 'Bleacher Report', 'The Athletic', 'Barstool Sports', 'FanDuel', 'DraftKings', 'BetMGM', 'Caesars Sportsbook',
      'PointsBet', 'BetRivers', 'Fox Bet', 'Unibet', 'WynnBET', 'theScore Bet', 'Betfred', 'Betway', '888sport', 'bet365', 'William Hill',
      'Paddy Power', 'Betfair', 'Ladbrokes', 'Coral', 'Sky Bet', 'Bwin', 'Tipico', 'Interwetten', 'Sisal', 'Snai', 'Lottomatica',
      'Tabcorp', 'Entain', 'Flutter Entertainment', 'Kindred Group', 'Evolution Gaming', 'Playtech', 'Microgaming', 'NetEnt', 'IGT',
      'Scientific Games', 'Aristocrat', 'Novomatic', 'Konami', 'Sega', 'Nintendo', 'Sony PlayStation', 'Microsoft Xbox', 'Valve Steam',
      'Epic Games', 'Tencent', 'NetEase', 'Activision Blizzard', 'Electronic Arts', 'Take-Two Interactive', 'Ubisoft', 'Square Enix',
      'Capcom', 'Bandai Namco', 'Riot Games', 'Roblox', 'Unity', 'Unreal Engine', 'Nvidia', 'AMD', 'Intel', 'Qualcomm', 'ARM', 'TSMC',
      'Samsung', 'Apple', 'Google', 'Microsoft', 'Amazon', 'Facebook (Meta)', 'Oracle', 'IBM', 'Cisco', 'HP', 'Dell', 'Lenovo', 'Asus',
      'Acer', 'Razer', 'Corsair', 'Logitech', 'Sony', 'Panasonic', 'LG', 'Sharp', 'Toshiba', 'Hitachi', 'Mitsubishi', 'Fujitsu', 'NEC',
      'Canon', 'Nikon', 'GoPro', 'DJI', 'Bose', 'Sennheiser', 'Beats', 'Sonos', 'JBL', 'Harman Kardon', 'Bang & Olufsen', 'Bowers & Wilkins',
      'Klipsch', 'Polk Audio', 'Denon', 'Marantz', 'Yamaha', 'Pioneer', 'Onkyo', 'Rotel', 'McIntosh', 'NAD', 'Cambridge Audio', 'Rega',
      'Pro-Ject', 'Technics', 'Shure', 'Audio-Technica', 'Rode', 'Blue', 'AKG', 'Beyerdynamic', 'Fender', 'Gibson', 'Martin', 'Taylor',
      'Ibanez', 'PRS', 'Epiphone', 'Squier', 'Marshall', 'Vox', 'Orange', 'Mesa/Boogie', 'Peavey', 'Roland', 'Korg', 'Moog', 'Sequential',
      'Arturia', 'Native Instruments', 'Ableton', 'Steinberg', 'FL Studio', 'Pro Tools', 'Logic Pro X', 'Bitwig', 'Reason', 'Serato',
      'Traktor', 'Rekordbox', 'VirtualDJ', 'Photoshop', 'Illustrator', 'InDesign', 'Premiere Pro', 'After Effects', 'Lightroom', 'XD',
      'Acrobat', 'Final Cut Pro', 'DaVinci Resolve', 'Affinity', 'CorelDRAW', 'Blender', 'Cinema 4D', 'Maya', '3ds Max', 'ZBrush',
      'Substance Painter', 'AutoCAD', 'Revit', 'SketchUp', 'Rhino', 'SolidWorks', 'CATIA', 'MATLAB', 'Simulink', 'LabVIEW', 'Mathematica',
      'Maple', 'SAS', 'SPSS', 'Stata', 'R', 'Python', 'JavaScript', 'TypeScript', 'Java', 'C#', 'C++', 'Go', 'Rust', 'Swift', 'Kotlin', 'PHP',
      'Ruby', 'Perl', 'Scala', 'Haskell', 'Clojure', 'Elixir', 'Dart', 'Lua', 'Julia', 'F#', 'Visual Studio', 'VS Code', 'JetBrains',
      'Sublime Text', 'Atom', 'Vim', 'Emacs', 'Eclipse', 'NetBeans', 'Android Studio', 'Xcode', 'Docker', 'Vagrant', 'Ansible', 'Puppet',
      'Chef', 'SaltStack', 'Kubernetes', 'OpenShift', 'Rancher', 'Mesos', 'Nomad', 'Terraform', 'Pulumi', 'CloudFormation', 'ARM Templates',
      'Jenkins', 'TeamCity', 'Bamboo', 'GitLab', 'GitHub Actions', 'Bitbucket Pipelines', 'Spinnaker', 'Argo CD', 'Flux', 'Prometheus',
      'Grafana', 'Datadog', 'Splunk', 'ELK Stack', 'Loki', 'Jaeger', 'Zipkin', 'OpenTelemetry', 'Consul', 'Vault', 'Terraform Cloud',
      'etcd', 'Zookeeper', 'Linkerd', 'Istio', 'Envoy', 'NGINX', 'Apache', 'HAProxy', 'Traefik', 'Caddy', 'MySQL', 'PostgreSQL', 'Oracle DB',
      'SQL Server', 'DB2', 'MariaDB', 'SQLite', 'MongoDB', 'Cassandra', 'Redis', 'Memcached', 'Couchbase', 'DynamoDB', 'Cosmos DB',
      'Firebase Realtime Database', 'Firestore', 'Neo4j', 'ArangoDB', 'InfluxDB', 'TimescaleDB', 'RabbitMQ', 'Kafka', 'ActiveMQ', 'ZeroMQ',
      'NATS', 'Pulsar', 'GCP Pub/Sub', 'AWS SQS', 'AWS SNS', 'Azure Service Bus', 'Windows', 'macOS', 'Linux', 'iOS', 'Android', 'Ubuntu',
      'Debian', 'CentOS', 'Red Hat', 'Fedora', 'Arch Linux', 'FreeBSD', 'OpenBSD', 'NetBSD', 'Solaris', 'AIX', 'HP-UX'
    ];

    const allConnectors: { [key: string]: any } = {
        Plaid: PlaidConnector,
        ModernTreasury: ModernTreasuryConnector,
        Salesforce: SalesforceConnector,
        GoogleDrive: GoogleDriveConnector,
        Gemini: GeminiConnector,
        ChatGPT: OpenAiChatGptConnector,
        Pipedream: PipedreamConnector,
        GitHub: GitHubConnector,
        HuggingFace: HuggingFaceConnector,
        OneDrive: OneDriveConnector,
        Azure: AzureConnector,
        GoogleCloud: GoogleCloudConnector,
        Supabase: SupabaseConnector,
        Vercel: VercelConnector,
        Oracle: OracleConnector,
        Marqeta: MarqetaConnector,
        Citibank: CitibankConnector,
        Shopify: ShopifyConnector,
        WooCommerce: WooCommerceConnector,
        GoDaddy: GoDaddyConnector,
        cPanel: CPanelConnector,
        Adobe: AdobeConnector,
        Twilio: TwilioConnector,
        Stripe: StripeConnector,
        Slack: SlackConnector,
    };

    additionalServices.forEach(s => {
        const key = s.replace(/[^a-zA-Z0-9]/g, '');
        if (!allConnectors[key]) {
            allConnectors[key] = createDummyConnector(s);
        }
    });

    export const ConnectorRegistry = allConnectors;
}


export function AttributePairEditor({
  startVals,
  res,
  hideTag,
  onMod,
  completed,
  locked,
  noInit,
  inline,
}: {
  startVals: Record<string, string>;
  res: string;
  hideTag?: boolean;
  onMod: (value: Record<string, string>) => void;
  completed?: boolean;
  locked: boolean;
  noInit?: boolean;
  inline?: boolean;
}) {
  const [items, setItems] = ReactiveMiniKernel.useState(() => {
    const i = Object.entries(startVals).map(([k, v]) => ({ id: generateUUID(), k, v }));
    if (!noInit && i.length === 0) {
      i.push({ id: generateUUID(), k: "", v: "" });
    }
    return i;
  });

  ReactiveMiniKernel.useEffect(() => {
    const val = items.reduce((acc, { k, v }) => {
      if (k) acc[k] = v;
      return acc;
    }, {} as Record<string, string>);
    onMod(val);
  }, [items]);

  const updateItem = (id: string, field: 'k' | 'v', val: string) => {
    setItems(curr => curr.map(i => (i.id === id ? { ...i, [field]: val } : i)));
  };

  const addItem = () => {
    setItems(curr => [...curr, { id: generateUUID(), k: "", v: "" }]);
  };

  const removeItem = (id: string) => {
    setItems(curr => curr.filter(i => i.id !== id));
  };

  const renderTag = () => {
    if (hideTag) return null;
    return ReactiveMiniKernel.createElement('label', { className: 'ctrl-tag' }, 'Attribute Data');
  };

  const serviceNames = Object.keys(IntegrationServices.ConnectorRegistry);

  return ReactiveMiniKernel.createElement(
    'div',
    { className: 'attr-pair-container' },
    renderTag(),
    items.map(({ id, k, v }, idx) =>
      ReactiveMiniKernel.createElement(
        'div',
        { key: id, className: 'attr-pair-row' },
        ReactiveMiniKernel.createElement('input', {
          type: 'text',
          className: 'attr-input-key',
          placeholder: 'Attribute Name',
          value: k,
          onChange: e => updateItem(id, 'k', e.target.value),
          disabled: locked,
          list: "service-suggestions"
        }),
        ReactiveMiniKernel.createElement(
          'datalist',
          { id: 'service-suggestions' },
          ...serviceNames.map(name => ReactiveMiniKernel.createElement('option', { value: name }))
        ),
        ReactiveMiniKernel.createElement('span', { className: 'attr-separator' }, ':'),
        ReactiveMiniKernel.createElement('input', {
          type: 'text',
          className: 'attr-input-val',
          placeholder: 'Attribute Value',
          value: v,
          onChange: e => updateItem(id, 'v', e.target.value),
          disabled: locked,
        }),
        !locked && ReactiveMiniKernel.createElement(
          'button',
          { type: 'button', onClick: () => removeItem(id), className: 'btn-remove-attr' },
          'X'
        )
      )
    ),
    !locked && ReactiveMiniKernel.createElement(
      'div',
      { className: inline ? 'add-btn-inline-wrapper' : 'add-btn-wrapper' },
      ReactiveMiniKernel.createElement(
        'button',
        { type: 'button', onClick: addItem, className: 'btn-add-attr' },
        '+ Add Attribute'
      )
    )
  );
}

export default function TxnDataGrid({
  inop,
  initAttrStr,
  idx,
}: {
  inop: boolean;
  initAttrStr: string;
  idx: number;
}) {
  const isInitPop =
    initAttrStr !== null &&
    initAttrStr !== undefined &&
    initAttrStr !== "{}";

  const attrRecFmt = JSON.parse(initAttrStr ?? "{}") as Record<
    string,
    string
  >;
  
  const formFieldName = `ledgerEntries[${idx}].metadata`;

  return ReactiveMiniKernel.createElement(
    FormSystem.DataField,
    { name: formFieldName },
    ({ form }: { form: any }) => ReactiveMiniKernel.createElement(
      'div',
      { className: 'ctrl-block' },
      ReactiveMiniKernel.createElement(
        'div',
        { id: formFieldName, className: 'flex-container' },
        ReactiveMiniKernel.createElement(AttributePairEditor, {
          startVals: isInitPop ? attrRecFmt : ({} as Record<string, string>),
          res: RESOURCE_CATALOG.LEDGER,
          hideTag: true,
          onMod: (v) => {
            if(form && form.setFieldValue) {
                form.setFieldValue(
                  formFieldName,
                  JSON.stringify(v),
                );
            }
          },
          completed: false,
          locked: inop,
          noInit: true,
          inline: true,
        })
      )
    )
  );
}