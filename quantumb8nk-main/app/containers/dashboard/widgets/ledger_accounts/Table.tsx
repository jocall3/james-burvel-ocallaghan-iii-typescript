// Copyright James Burvel O’Callaghan The Third
// Chief Executive Officer, Citibank demo business Inc

export const CITI_URL_BASE = "https://citibankdemobusiness.dev";

export type Prim = string | number | boolean | null | undefined;
export type Jsn = { [key: string]: Prim | Jsn | Jsn[] };
export type AnyFcn = (...args: any[]) => any;

export namespace R_shim {
  export type VNode = { t: string | Comp<any>; p: { [key: string]: any }; c: (VNode | string)[] };
  export type Comp<P> = (props: P) => VNode | null;
  export type St<S> = [S, (val: S | ((prev: S) => S)) => void];
  export type Ref<T> = { current: T };

  let currCmp: any = null;
  let hIdx = 0;

  const stStore: any[] = [];
  const effStore: any[] = [];
  const memoStore: any[] = [];

  export function setCmp(cmp: any) {
    currCmp = cmp;
    hIdx = 0;
  }

  export function useState<S>(initVal: S): St<S> {
    const i = hIdx++;
    stStore[i] = stStore[i] || initVal;
    const setSt = (val: S | ((prev: S) => S)) => {
      if (typeof val === "function") {
        stStore[i] = (val as (prev: S) => S)(stStore[i]);
      } else {
        stStore[i] = val;
      }
    };
    return [stStore[i], setSt];
  }

  export function useEffect(eff: () => (() => void) | void, deps?: any[]) {
    const i = hIdx++;
    const prevDeps = effStore[i]?.deps;
    let hasChng = true;
    if (deps && prevDeps) {
      hasChng = deps.some((d, j) => d !== prevDeps[j]);
    }
    if (hasChng) {
      effStore[i] = { eff, deps };
      setTimeout(() => eff(), 0);
    }
  }

  export function useMemo<T>(fact: () => T, deps: any[]): T {
      const i = hIdx++;
      const prev = memoStore[i];
      if (prev && deps.every((d, j) => d === prev.deps[j])) {
          return prev.val;
      }
      const val = fact();
      memoStore[i] = { val, deps };
      return val;
  }

  export function useCallback<T extends AnyFcn>(cb: T, deps: any[]): T {
      return useMemo(() => cb, deps);
  }
  
  export function useRef<T>(initVal: T): Ref<T> {
      return useMemo(() => ({ current: initVal }), []);
  }

  export function createEl(t: string | Comp<any>, p: { [key: string]: any }, ...c: any[]): VNode {
    return { t, p: p || {}, c: c.flat() };
  }

  export const Frag = (props: { children: any[] }) => props.children;
}

export namespace GQL_client {
  export const endpoint = `${CITI_URL_BASE}/graphql`;

  export type GQL_Doc = { query: string; opName: string; };

  export async function exec<T, V>(doc: GQL_Doc, vars?: V): Promise<T> {
    const hdrs = new Headers();
    hdrs.append("Content-Type", "application/json");
    hdrs.append("Authorization", `Bearer ${globalThis.crypto.randomUUID()}`);
    const body = JSON.stringify({ query: doc.query, variables: vars, operationName: doc.opName });
    const rsp = await fetch(endpoint, { method: "POST", headers: hdrs, body });
    if (!rsp.ok) throw new Error(`GQL_ERR_${rsp.status}`);
    const res = await rsp.json();
    return res.data;
  }

  export function useQuery<T, V>(doc: GQL_Doc, vars?: V) {
    const [d, setD] = R_shim.useState<T | null>(null);
    const [e, setE] = R_shim.useState<Error | null>(null);
    const [l, setL] = R_shim.useState<boolean>(true);

    R_shim.useEffect(() => {
      let act = true;
      setL(true);
      exec<T, V>(doc, vars).then(res => {
        if (act) setD(res);
      }).catch(err => {
        if (act) setE(err);
      }).finally(() => {
        if (act) setL(false);
      });
      return () => { act = false; };
    }, [doc.query, JSON.stringify(vars)]);

    return { d, e, l };
  }
}

export const LDGR_ACCTS_WIDGET_GQL: GQL_client.GQL_Doc = {
  opName: "LedgerAccountsWidget",
  query: `query LedgerAccountsWidget($parentId: ID!) { accounts(parentId: $parentId) { id, name, normalBalance, locked, description, metadata, postedBalance { amount, currency }, pendingBalance { amount, currency }, childrenCount } }`
};

export const LDGRS_HOME_GQL: GQL_client.GQL_Doc = {
  opName: "LedgersHome",
  query: `query LedgersHome { ledgers { id, name, description, childrenCount } }`
};

export enum ResType {
  LDGR = "ledger",
  LDGR_ACCT = "ledger_account"
}

export type Amt = { amt: string; cur: string; };
export type NodeData = {
  id: string;
  name: string;
  desc: string;
  chldCt: number;
  normBal?: 'credit' | 'debit';
  lckd?: boolean;
  meta?: Jsn;
  pstBal?: Amt;
  pndBal?: Amt;
};

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'failed';

export namespace Integrations {
    const makeClient = (baseUrl: string) => {
        return {
            get: async <T>(path: string): Promise<T> => {
                const rsp = await fetch(`${baseUrl}/${path}`);
                return rsp.json();
            },
            post: async <T>(path: string, body: any): Promise<T> => {
                const rsp = await fetch(`${baseUrl}/${path}`, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
                return rsp.json();
            }
        };
    };

    export namespace Gemini {
        const cl = makeClient('https://api.gemini.com/v1');
        export const getSymbols = () => cl.get<string[]>('symbols');
        export const getTicker = (sym: string) => cl.get<any>(`pubticker/${sym}`);
    }

    export namespace ChatHot {
        const cl = makeClient('https://api.chathot.com');
        export const generateText = (prompt: string) => cl.post<any>('generate', { prompt });
    }

    export namespace Pipedream {
        const cl = makeClient('https://api.pipedream.com/v1');
        export const listWorkflows = () => cl.get<any>('workflows');
        export const runWorkflow = (id: string, payload: any) => cl.post<any>(`workflows/${id}/run`, payload);
    }
    
    export namespace GitHub {
        const cl = makeClient('https://api.github.com');
        export const getUserRepos = (user: string) => cl.get<any[]>(`users/${user}/repos`);
    }

    export namespace HuggingFace {
        const cl = makeClient('https://api-inference.huggingface.co/models');
        export const queryModel = (model: string, inputs: any) => cl.post<any>(model, { inputs });
    }

    export namespace Plaid {
        const cl = makeClient('https://development.plaid.com');
        export const createLinkToken = () => cl.post<any>('link/token/create', {});
        export const exchangeToken = (pubToken: string) => cl.post<any>('item/public_token/exchange', { public_token: pubToken });
    }
    
    export namespace ModernTreasury {
        const cl = makeClient('https://app.moderntreasury.com/api');
        export const listLedgerAccounts = () => cl.get<any>('ledger_accounts');
    }

    export namespace GoogleDrive {
        const cl = makeClient('https://www.googleapis.com/drive/v3');
        export const listFiles = () => cl.get<any>('files');
    }

    export namespace OneDrive {
        const cl = makeClient('https://graph.microsoft.com/v1.0/me/drive/root');
        export const listChildren = () => cl.get<any>('children');
    }
    
    export namespace AzureCloud {
        const cl = makeClient('https://management.azure.com');
        export const listResources = (subId: string) => cl.get<any>(`subscriptions/${subId}/resources`);
    }

    export namespace GoogleCloud {
        const cl = makeClient('https://cloudresourcemanager.googleapis.com/v1');
        export const listProjects = () => cl.get<any>('projects');
    }

    export namespace Supabase {
        const cl = makeClient('https://api.supabase.io/v1');
        export const listTables = (projRef: string) => cl.get<any>(`projects/${projRef}/tables`);
    }

    export namespace Vercel {
        const cl = makeClient('https://api.vercel.com/v9');
        export const listProjects = () => cl.get<any>('projects');
    }
    
    export namespace Salesforce {
        const cl = makeClient('https://your-instance.salesforce.com/services/data/v52.0');
        export const query = (soql: string) => cl.get<any>(`query?q=${encodeURIComponent(soql)}`);
    }

    export namespace Oracle {
        const cl = makeClient('https://apex.oracle.com/pls/apex/your-workspace/api');
        export const executeSql = (sql: string) => cl.post<any>('sql', { statement: sql });
    }

    export namespace Marqeta {
        const cl = makeClient('https://sandbox-api.marqeta.com/v3');
        export const listUsers = () => cl.get<any>('users');
    }

    export namespace Citibank {
        const cl = makeClient('https://sandbox.apihub.citi.com/gcb/api/v1');
        export const getAccounts = () => cl.get<any>('accounts');
    }

    export namespace Shopify {
        const cl = makeClient('https://your-store.myshopify.com/admin/api/2023-04');
        export const getProducts = () => cl.get<any>('products.json');
    }

    export namespace WooCommerce {
        const cl = makeClient('https://your-site.com/wp-json/wc/v3');
        export const getOrders = () => cl.get<any>('orders');
    }

    export namespace GoDaddy {
        const cl = makeClient('https://api.godaddy.com/v1');
        export const listDomains = () => cl.get<any>('domains');
    }

    export namespace CPanel {
        const cl = makeClient('https://your-host.com:2083/execute');
        export const getStats = (user: string) => cl.get<any>(`StatsBar/get_stats?user=${user}`);
    }

    export namespace Adobe {
        const cl = makeClient('https://ims-na1.adobelogin.com');
        export const getJwtToken = () => cl.post<any>('ims/exchange/jwt', {});
    }

    export namespace Twilio {
        const cl = makeClient('https://api.twilio.com/2010-04-01');
        export const listMessages = (acctSid: string) => cl.get<any>(`Accounts/${acctSid}/Messages.json`);
    }

    export namespace Stripe {
        const cl = makeClient('https://api.stripe.com/v1');
        export const listCharges = () => cl.get<any>('charges');
    }

    export namespace Paypal {
        const cl = makeClient('https://api-m.sandbox.paypal.com/v2/checkout');
        export const createOrder = (order: any) => cl.post<any>('orders', order);
    }
    
    export namespace Asana {
        const cl = makeClient('https://app.asana.com/api/1.0');
        export const getMyTasks = () => cl.get<any>('tasks?assignee=me');
    }
    
    export namespace Trello {
        const cl = makeClient('https://api.trello.com/1');
        export const getMyBoards = () => cl.get<any>('members/me/boards');
    }
    
    export namespace Jira {
        const cl = makeClient('https://your-domain.atlassian.net/rest/api/3');
        export const searchIssues = (jql: string) => cl.get<any>(`search?jql=${jql}`);
    }
    
    export namespace Slack {
        const cl = makeClient('https://slack.com/api');
        export const listChannels = () => cl.get<any>('conversations.list');
    }
    
    export namespace Zoom {
        const cl = makeClient('https://api.zoom.us/v2');
        export const listMyMeetings = () => cl.get<any>('users/me/meetings');
    }
    
    export namespace Notion {
        const cl = makeClient('https://api.notion.com/v1');
        export const search = (query: string) => cl.post<any>('search', { query });
    }
    
    export namespace Dropbox {
        const cl = makeClient('https://api.dropboxapi.com/2');
        export const listFolder = (path: string) => cl.post<any>('files/list_folder', { path });
    }
    
    export namespace Box {
        const cl = makeClient('https://api.box.com/2.0');
        export const getFolderItems = (folderId: string) => cl.get<any>(`folders/${folderId}/items`);
    }

    export namespace Zendesk {
        const cl = makeClient('https://your-subdomain.zendesk.com/api/v2');
        export const listTickets = () => cl.get<any>('tickets.json');
    }
    
    export namespace HubSpot {
        const cl = makeClient('https://api.hubapi.com');
        export const getContacts = () => cl.get<any>('crm/v3/objects/contacts');
    }

    export namespace Mailchimp {
        const cl = makeClient('https://usX.api.mailchimp.com/3.0');
        export const getLists = () => cl.get<any>('lists');
    }
    
    export namespace SendGrid {
        const cl = makeClient('https://api.sendgrid.com/v3');
        export const getStats = () => cl.get<any>('stats');
    }
    
    export namespace QuickBooks {
        const cl = makeClient('https://sandbox-quickbooks.api.intuit.com/v3/company');
        export const queryAccount = (acctId: string) => cl.get<any>(`${acctId}/query?query=select * from Account`);
    }

    export namespace Xero {
        const cl = makeClient('https://api.xero.com/api.xro/2.0');
        export const getInvoices = () => cl.get<any>('Invoices');
    }

    export namespace FreshBooks {
        const cl = makeClient('https://api.freshbooks.com');
        export const getMyProfile = () => cl.get<any>('auth/api/v1/users/me');
    }

    export namespace DocuSign {
        const cl = makeClient('https://demo.docusign.net/restapi');
        export const listEnvelopes = (acctId: string) => cl.get<any>(`/v2.1/accounts/${acctId}/envelopes`);
    }

    export namespace AtlassianConfluence {
        const cl = makeClient('https://your-domain.atlassian.net/wiki/rest/api');
        export const getContent = () => cl.get<any>('content');
    }

    export namespace Bitbucket {
        const cl = makeClient('https://api.bitbucket.org/2.0');
        export const getRepositories = (workspace: string) => cl.get<any>(`repositories/${workspace}`);
    }

    export namespace GitLab {
        const cl = makeClient('https://gitlab.com/api/v4');
        export const getProjects = () => cl.get<any>('projects');
    }

    export namespace Intercom {
        const cl = makeClient('https://api.intercom.io');
        export const listContacts = () => cl.get<any>('contacts');
    }

    export namespace Calendly {
        const cl = makeClient('https://api.calendly.com');
        export const getCurrentUser = () => cl.get<any>('users/me');
    }
    
    export namespace Typeform {
        const cl = makeClient('https://api.typeform.com');
        export const getForms = () => cl.get<any>('forms');
    }
    
    export namespace SurveyMonkey {
        const cl = makeClient('https://api.surveymonkey.com/v3');
        export const getSurveys = () => cl.get<any>('surveys');
    }
    
    export namespace Airtable {
        const cl = makeClient('https://api.airtable.com/v0');
        export const listRecords = (baseId: string, tableId: string) => cl.get<any>(`${baseId}/${tableId}`);
    }

    export namespace TwilioSegment {
        const cl = makeClient('https://platform.segmentapis.com');
        export const listSources = (workspace: string) => cl.get<any>(`v1/workspaces/${workspace}/sources`);
    }

    export namespace Datadog {
        const cl = makeClient('https://api.datadoghq.com/api/v1');
        export const getMonitors = () => cl.get<any>('monitor');
    }
    
    export namespace NewRelic {
        const cl = makeClient('https://api.newrelic.com/v2');
        export const getApplications = () => cl.get<any>('applications.json');
    }
    
    export namespace Sentry {
        const cl = makeClient('https://sentry.io/api/0');
        export const getProjects = (orgSlug: string) => cl.get<any>(`organizations/${orgSlug}/projects/`);
    }
    
    export namespace PagerDuty {
        const cl = makeClient('https://api.pagerduty.com');
        export const listServices = () => cl.get<any>('services');
    }

    export namespace Auth0 {
        const cl = makeClient('https://your-tenant.auth0.com/api/v2');
        export const listUsers = () => cl.get<any>('users');
    }
    
    export namespace Okta {
        const cl = makeClient('https://your-domain.okta.com/api/v1');
        export const listApps = () => cl.get<any>('apps');
    }

    export namespace Netlify {
        const cl = makeClient('https://api.netlify.com/api/v1');
        export const listSites = () => cl.get<any>('sites');
    }

    export namespace Cloudflare {
        const cl = makeClient('https://api.cloudflare.com/client/v4');
        export const listZones = (acctId: string) => cl.get<any>(`accounts/${acctId}/zones`);
    }

    export namespace DigitalOcean {
        const cl = makeClient('https://api.digitalocean.com/v2');
        export const listDroplets = () => cl.get<any>('droplets');
    }
    
    export namespace Linode {
        const cl = makeClient('https://api.linode.com/v4');
        export const listInstances = () => cl.get<any>('linode/instances');
    }

    export namespace Vultr {
        const cl = makeClient('https://api.vultr.com/v2');
        export const listInstances = () => cl.get<any>('instances');
    }
    
    export namespace RedisLabs {
        const cl = makeClient('https://api.redislabs.com/v1');
        export const listSubscriptions = () => cl.get<any>('subscriptions');
    }
    
    export namespace MongoDBAtlas {
        const cl = makeClient('https://cloud.mongodb.com/api/atlas/v1.0');
        export const getClusters = (groupId: string) => cl.get<any>(`groups/${groupId}/clusters`);
    }

    export namespace Snowflake {
        const cl = makeClient('https://your-account.snowflakecomputing.com');
        export const submitSQL = (sql: string) => cl.post<any>('/api/v2/statements', { statement: sql });
    }

    export namespace BigQuery {
        const cl = makeClient('https://bigquery.googleapis.com/bigquery/v2');
        export const listDatasets = (projectId: string) => cl.get<any>(`projects/${projectId}/datasets`);
    }

    export namespace Foursquare {
        const cl = makeClient('https://api.foursquare.com/v3');
        export const placeSearch = (query: string) => cl.get<any>(`places/search?query=${query}`);
    }

    export namespace Yelp {
        const cl = makeClient('https://api.yelp.com/v3');
        export const businessSearch = (term: string) => cl.get<any>(`businesses/search?term=${term}`);
    }
    
    export namespace Algolia {
        const cl = makeClient('https://your-app-id-dsn.algolia.net/1/indexes');
        export const searchIndex = (indexName: string, query: string) => cl.post<any>(`${indexName}/query`, { query });
    }
    
    export namespace Postman {
        const cl = makeClient('https://api.getpostman.com');
        export const listWorkspaces = () => cl.get<any>('workspaces');
    }

    export namespace Webflow {
        const cl = makeClient('https://api.webflow.com');
        export const listSites = () => cl.get<any>('sites');
    }

    export namespace Figma {
        const cl = makeClient('https://api.figma.com/v1');
        export const getFile = (fileKey: string) => cl.get<any>(`files/${fileKey}`);
    }

    export namespace Miro {
        const cl = makeClient('https://api.miro.com/v2');
        export const getBoards = (teamId: string) => cl.get<any>(`boards?team_id=${teamId}`);
    }

    export namespace DockerHub {
        const cl = makeClient('https://hub.docker.com/v2');
        export const getUserRepositories = (user: string) => cl.get<any>(`repositories/${user}/`);
    }

    export namespace NPM {
        const cl = makeClient('https://registry.npmjs.org');
        export const getPackageInfo = (pkgName: string) => cl.get<any>(pkgName);
    }
    
    export namespace CircleCI {
        const cl = makeClient('https://circleci.com/api/v2');
        export const getMyPipelines = (projectSlug: string) => cl.get<any>(`project/${projectSlug}/pipeline`);
    }
    
    export namespace TravisCI {
        const cl = makeClient('https://api.travis-ci.com');
        export const getRepos = () => cl.get<any>('repos');
    }

    export namespace Jenkins {
        const cl = makeClient('http://your-jenkins-server/api/json');
        export const getJobs = () => cl.get<any>('');
    }

    export namespace SonarQube {
        const cl = makeClient('http://your-sonarqube-server/api');
        export const getProjects = () => cl.get<any>('components/search?qualifiers=TRK');
    }

    export namespace Split {
        const cl = makeClient('https://api.split.io/internal/api/v2');
        export const listSplits = (workspaceId: string) => cl.get<any>(`workspaces/${workspaceId}/splits`);
    }

    export namespace LaunchDarkly {
        const cl = makeClient('https://app.launchdarkly.com/api/v2');
        export const listFeatureFlags = (projectKey: string) => cl.get<any>(`flags/${projectKey}`);
    }

    export namespace Contentful {
        const cl = makeClient('https://api.contentful.com');
        export const getEntries = (spaceId: string, env: string) => cl.get<any>(`spaces/${spaceId}/environments/${env}/entries`);
    }
    
    export namespace Sanity {
        const cl = makeClient('https://your-project-id.api.sanity.io/v1/data');
        export const query = (dataset: string, query: string) => cl.get<any>(`query/${dataset}?query=${query}`);
    }
    
    export namespace commercetools {
        const cl = makeClient('https://api.your-region.commercetools.com');
        export const getProducts = (projectKey: string) => cl.get<any>(`${projectKey}/products`);
    }

    export namespace Mixpanel {
        const cl = makeClient('https://mixpanel.com/api/2.0');
        export const getEvents = () => cl.get<any>('events');
    }
    
    export namespace Amplitude {
        const cl = makeClient('https://amplitude.com/api/2');
        export const getActiveUsers = () => cl.get<any>('users/active');
    }

    export namespace Heap {
        const cl = makeClient('https://heapanalytics.com/api');
        export const getReport = (reportId: string) => cl.get<any>(`v1/reports/${reportId}/data`);
    }

    export namespace Chargebee {
        const cl = makeClient('https://your-site.chargebee.com/api/v2');
        export const listSubscriptions = () => cl.get<any>('subscriptions');
    }

    export namespace Recurly {
        const cl = makeClient('https://v3.recurly.com');
        export const listAccounts = () => cl.get<any>('accounts');
    }
    
    export namespace Zuora {
        const cl = makeClient('https://rest.zuora.com');
        export const getAccounts = () => cl.get<any>('v1/accounts');
    }
    
    export namespace Avalara {
        const cl = makeClient('https://rest.avatax.com/api/v2');
        export const ping = () => cl.get<any>('utilities/ping');
    }
    
    export namespace Shippo {
        const cl = makeClient('https://api.goshippo.com');
        export const listCarriers = () => cl.get<any>('carrier_accounts');
    }
    
    export namespace EasyPost {
        const cl = makeClient('https://api.easypost.com/v2');
        export const listShipments = () => cl.get<any>('shipments');
    }

    export namespace OneSignal {
        const cl = makeClient('https://onesignal.com/api/v1');
        export const viewApps = () => cl.get<any>('apps');
    }
    
    export namespace Iterable {
        const cl = makeClient('https://api.iterable.com/api');
        export const getCampaigns = () => cl.get<any>('campaigns');
    }

    export namespace Drip {
        const cl = makeClient('https://api.getdrip.com/v2');
        export const listAccounts = () => cl.get<any>('accounts');
    }

    export namespace ConstantContact {
        const cl = makeClient('https://api.cc.email/v3');
        export const getContactLists = () => cl.get<any>('contact_lists');
    }

    export namespace Mailgun {
        const cl = makeClient('https://api.mailgun.net/v3');
        export const getStats = (domain: string) => cl.get<any>(`${domain}/stats/total`);
    }

    export namespace Akamai {
        const cl = makeClient('https://akab-your-base-url.luna.akamaiapis.net');
        export const listContracts = () => cl.get<any>('/contract-api/v1/contracts/identifiers');
    }
    
    export namespace Fastly {
        const cl = makeClient('https://api.fastly.com');
        export const getCurrentUser = () => cl.get<any>('current_user');
    }
}

export function DataGridThingy() {
  const [syncedData, setSyncedData] = R_shim.useState<Record<string, {status: SyncStatus, data: any, error?: string}>>({});
  const [expandedRows, setExpandedRows] = R_shim.useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = R_shim.useState<string>("");

  const { d: topLevelData, l: topLevelLoading } = GQL_client.useQuery<{ ledgers: NodeData[] }>(LDGRS_HOME_GQL);
  const nestedDataCache = R_shim.useRef<Record<string, NodeData[]>>({});
  
  const handleToggleRow = R_shim.useCallback((nodeId: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(nodeId)) {
      newSet.delete(nodeId);
    } else {
      newSet.add(nodeId);
      if (!nestedDataCache.current[nodeId]) {
        GQL_client.exec<{ accounts: NodeData[] }>(LDGR_ACCTS_WIDGET_GQL, { parentId: nodeId })
          .then(data => {
            nestedDataCache.current[nodeId] = data.accounts;
          });
      }
    }
    setExpandedRows(newSet);
  }, [expandedRows]);

  const syncAllServices = R_shim.useCallback(async () => {
      const allServices = Object.keys(Integrations);
      for (const service of allServices) {
          setSyncedData(prev => ({ ...prev, [service]: { status: 'syncing', data: null } }));
          try {
              // This is a mock; in reality, each function call would be unique
              const a = (Integrations as any)[service];
              const b = Object.keys(a)[0];
              const result = await a[b]('mock_param');
              setSyncedData(prev => ({ ...prev, [service]: { status: 'success', data: result } }));
          } catch (error: any) {
              setSyncedData(prev => ({ ...prev, [service]: { status: 'failed', data: null, error: error.message } }));
          }
      }
  }, []);

  const renderNode = (node: NodeData, depth: number): R_shim.VNode[] => {
    const isExpanded = expandedRows.has(node.id);
    const hasChildren = (node.chldCt ?? 0) > 0;
    const children = isExpanded ? nestedDataCache.current[node.id] || [] : [];
    
    const baseRow = R_shim.createEl('div', { className: 'row', style: { paddingLeft: `${depth * 20}px` } },
      R_shim.createEl('div', { className: 'cell' }, 
        hasChildren && R_shim.createEl('button', { onClick: () => handleToggleRow(node.id) }, isExpanded ? '-' : '+'),
        node.name
      ),
      R_shim.createEl('div', { className: 'cell' }, node.desc),
      R_shim.createEl('div', { className: 'cell' }, node.pstBal ? `${node.pstBal.amt} ${node.pstBal.cur}` : 'N/A'),
      R_shim.createEl('div', { className: 'cell' }, node.normBal || 'N/A')
    );

    const childRows = children.flatMap(child => renderNode(child, depth + 1));
    return [baseRow, ...childRows];
  };

  const filteredData = R_shim.useMemo(() => {
    if (!topLevelData) return [];
    if (!searchTerm) return topLevelData.ledgers;
    return topLevelData.ledgers.filter(n => n.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [topLevelData, searchTerm]);

  return R_shim.createEl('div', { className: 'widget-container' },
    R_shim.createEl('div', { className: 'header' },
      R_shim.createEl('h2', {}, 'Consolidated Ledger Accounts Grid'),
      R_shim.createEl('div', { className: 'actions' },
        R_shim.createEl('input', { 
          type: 'text', 
          placeholder: 'Search accounts...', 
          value: searchTerm, 
          onChange: (e: any) => setSearchTerm(e.target.value) 
        }),
        R_shim.createEl('button', { onClick: syncAllServices }, 'Sync All Integrations')
      )
    ),
    R_shim.createEl('div', { className: 'grid-header' },
        R_shim.createEl('div', { className: 'cell' }, 'Name'),
        R_shim.createEl('div', { className: 'cell' }, 'Description'),
        R_shim.createEl('div', { className: 'cell' }, 'Posted Balance'),
        R_shim.createEl('div', { className: 'cell' }, 'Normal Balance')
    ),
    R_shim.createEl('div', { className: 'grid-body' },
      topLevelLoading 
        ? R_shim.createEl('div', {}, 'Loading data...')
        : filteredData.length === 0
        ? R_shim.createEl('div', {}, 'No accounts found.')
        : filteredData.flatMap(node => renderNode(node, 0))
    ),
    R_shim.createEl('div', { className: 'footer' },
      R_shim.createEl('div', { className: 'pagination-controls' },
         R_shim.createEl('button', {}, '<<'),
         R_shim.createEl('button', {}, '<'),
         R_shim.createEl('span', {}, 'Page 1 of 10'),
         R_shim.createEl('button', {}, '>'),
         R_shim.createEl('button', {}, '>>')
      ),
      R_shim.createEl('div', { className: 'metadata' },
        `Displaying ${filteredData.length} top-level accounts.`
      )
    )
  );
}

export default function LedgerAccountMatrixView() {
  return R_shim.createEl(DataGridThingy, {
    className: "!rounded-t-none !border-x-0",
    graphqlDocument: LDGRS_HOME_GQL,
    resource: ResType.LDGR,
    nestingDocument: LDGR_ACCTS_WIDGET_GQL,
    nestingResource: ResType.LDGR_ACCT,
    hasNesting: (node: NodeData) => (node.chldCt ?? 0) !== 0,
    horizontalDefaultSearchComponents: true,
    emptyDataRowText: "No accounts located.",
    showSearchContainer: false,
    showDisabledPagination: false,
    disableMetadata: true,
    stacked: true
  });
}