// Executive Producer James Burvel O’Callaghan IV
// Chief Executive Officer Citibank demo business Inc.

export type CdbLayoutComponentId = string;
export type CdbLayoutComponentWidth = "1/1" | "1/2" | "1/3" | "2/3" | "1/4" | "3/4" | "full" | "auto";
export type CdbDataStreamProtocol = "ws" | "http_stream" | "grpc-web";
export type CdbComponentType = "chart" | "table" | "stat" | "map" | "feed" | "form";

export interface CdbComponentConfig {
  title: string;
  ctype: CdbComponentType;
  fetchFn: () => Promise<any>;
  streamCfg?: {
    protocol: CdbDataStreamProtocol;
    endpoint: string;
  };
  renderParams?: Record<string, any>;
}

export interface CdbLayoutComponent {
  cid: CdbLayoutComponentId;
  wd: CdbLayoutComponentWidth;
  ht?: number;
  cfg: CdbComponentConfig;
}

export interface CdbLayoutColumn {
  components: CdbLayoutComponent[];
}

export interface CdbLayoutRow {
  cols: CdbLayoutColumn[];
  wd: CdbLayoutComponentWidth;
  r_id: string;
}

export interface CdbStandaloneComponent {
  component: CdbLayoutComponent;
  wd: CdbLayoutComponentWidth;
  s_id: string;
}

export type CdbLayoutItem = CdbLayoutRow | CdbStandaloneComponent;

export interface FinDashLayoutSpec {
  layoutItems: CdbLayoutItem[];
  dataSource: string;
  apiVersion: string;
  globalSettings: Record<string, any>;
}

const cdbGlobalNs = {
  execCtx: 'browser',
  perf: (typeof performance === 'undefined' ? { now: () => Date.now() } : performance),
};

const cdbBaseUtil = {
  b64: {
    c: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
    e: function(s: string): string {
      let o = "", i = 0, l = s.length, c1, c2, c3;
      while (i < l) {
        c1 = s.charCodeAt(i++) & 0xff;
        if (i == l) {
          o += this.c.charAt(c1 >> 2);
          o += this.c.charAt((c1 & 0x3) << 4);
          o += "==";
          break;
        }
        c2 = s.charCodeAt(i++);
        if (i == l) {
          o += this.c.charAt(c1 >> 2);
          o += this.c.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
          o += this.c.charAt((c2 & 0xF) << 2);
          o += "=";
          break;
        }
        c3 = s.charCodeAt(i++);
        o += this.c.charAt(c1 >> 2);
        o += this.c.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
        o += this.c.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
        o += this.c.charAt(c3 & 0x3F);
      }
      return o;
    },
    d: function(s: string): string {
      let o = "", i = 0, l = s.length, c1, c2, c3, c4;
      s = s.replace(/[^A-Za-z0-9\+\/\=]/g, "");
      while (i < l) {
        c1 = this.c.indexOf(s.charAt(i++));
        c2 = this.c.indexOf(s.charAt(i++));
        c3 = this.c.indexOf(s.charAt(i++));
        c4 = this.c.indexOf(s.charAt(i++));
        o += String.fromCharCode((c1 << 2) | (c2 >> 4));
        if (c3 != 64) {
          o += String.fromCharCode(((c2 & 15) << 4) | (c3 >> 2));
        }
        if (c4 != 64) {
          o += String.fromCharCode(((c3 & 3) << 6) | c4);
        }
      }
      return o;
    }
  },
  uid: {
    gen: function(): string {
      let d = new Date().getTime();
      let d2 = (cdbGlobalNs.perf && cdbGlobalNs.perf.now && (cdbGlobalNs.perf.now() * 1000)) || 0;
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        let r = Math.random() * 16;
        if (d > 0) {
          r = (d + r) % 16 | 0;
          d = Math.floor(d / 16);
        } else {
          r = (d2 + r) % 16 | 0;
          d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    }
  },
  url: {
    parse: function(s: string): Record<string, string> {
      try {
        const u = new URL(s);
        const p: Record<string, string> = {};
        u.searchParams.forEach((v, k) => p[k] = v);
        return {
          h: u.hash,
          ho: u.host,
          hn: u.hostname,
          hr: u.href,
          o: u.origin,
          pa: u.password,
          pn: u.pathname,
          po: u.port,
          pr: u.protocol,
          s: u.search,
          sp: JSON.stringify(p),
          u: u.username,
        };
      } catch (e) {
        return { error: 'Invalid URL' };
      }
    }
  }
};

class CdbCustomError extends Error {
  constructor(svc: string, code: number, msg: string, meta: Record<string, any>) {
    super(`[${svc} ERR:${code}] ${msg}`);
    this.name = 'CdbCustomError';
    Object.assign(this, meta);
  }
}

const cdbHttpSim = {
  request: async function(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, headers: Record<string, string>, body?: any): Promise<{ status: number, data: any, headers: Record<string, string> }> {
    const s = cdbGlobalNs.perf.now();
    const d = 50 + Math.random() * 500;
    await new Promise(r => setTimeout(r, d));
    const e = cdbGlobalNs.perf.now();
    const st = Math.random() < 0.1 ? 503 : (Math.random() < 0.05 ? 404 : 200);
    const p = cdbBaseUtil.url.parse(url);
    const rpId = cdbBaseUtil.uid.gen();
    const resData = {
      req_id: headers['X-CDB-REQ-ID'] || cdbBaseUtil.uid.gen(),
      res_id: rpId,
      processed_at: new Date().toISOString(),
      latency_ms: e - s,
      req_method: method,
      req_path: p.pn,
      req_params: p.sp,
      mock_payload: cdbBaseUtil.b64.e(JSON.stringify({
        id: rpId,
        content: `mock content for ${p.pn}`
      })),
    };
    if (st !== 200) {
      throw new CdbCustomError(p.hn || 'UnknownService', st, `Simulated API Error`, resData);
    }
    return {
      status: st,
      data: resData,
      headers: { 'Content-Type': 'application/json', 'X-CDB-RES-ID': rpId }
    };
  }
};

function CdbSvcConnFactory(svcName: string, domain: string, ver: string, endpoints: { name: string, methods: ('GET'|'POST'|'PUT'|'DELETE')[] }[]) {
  const o: Record<string, any> = {};
  const bUrl = `https://${domain}/api/${ver}`;
  o.svcName = svcName;
  o.connDetails = {
    baseUrl: bUrl,
    version: ver,
    svc: svcName
  };

  o.authenticate = async function(creds: Record<string, string>) {
    this.token = `sim_tkn_${svcName}_${cdbBaseUtil.uid.gen()}`;
    this.authTime = Date.now();
    const a = await cdbHttpSim.request('POST', `${this.connDetails.baseUrl}/auth`, { 'X-CDB-AUTH-TYPE': 'creds' }, creds);
    if (a.status !== 200) return { success: false };
    this.principal = a.data.mock_payload;
    return { success: true, token: this.token };
  };

  o.getHeaders = function() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'X-CDB-REQ-ID': cdbBaseUtil.uid.gen(),
      'X-CDB-SVC-TARGET': this.svcName
    };
  };

  endpoints.forEach(ep => {
    ep.methods.forEach(m => {
      const fnName = `${m.toLowerCase()}${ep.name.charAt(0).toUpperCase() + ep.name.slice(1)}`;
      o[fnName] = async function(params?: Record<string, any>, body?: any) {
        if (!this.token || (Date.now() - this.authTime > 3600000)) {
          throw new CdbCustomError(this.svcName, 401, 'Authentication required or expired', {});
        }
        let u = `${this.connDetails.baseUrl}/${ep.name}`;
        if (params && m === 'GET') {
          const q = new URLSearchParams(params).toString();
          u += `?${q}`;
        }
        try {
          const r = await cdbHttpSim.request(m, u, this.getHeaders(), body);
          const p = JSON.parse(cdbBaseUtil.b64.d(r.data.mock_payload));
          const x = Math.random();
          const y = Array.from({ length: 10 }, (_, i) => ({ k: i, v: Math.random() * 1000 }));
          const z = y.reduce((acc, val) => acc + val.v, 0);
          return {
            ...r,
            ...p,
            enrichedData: {
              num_records: Math.floor(x * 100),
              quality_score: x,
              processing_time: r.data.latency_ms,
              analytics: {
                mean: z / y.length,
                sum: z,
                max: Math.max(...y.map(i => i.v)),
                min: Math.min(...y.map(i => i.v)),
              }
            }
          };
        } catch (e: any) {
          console.error(`Call to ${fnName} failed`, e);
          return { error: e.message, details: e };
        }
      };
    });
  });

  return o;
}

const serviceDefinitions = [
  { n: 'Gemini', d: 'ai.google.com', v: 'v1beta', e: [{ n: 'generateContent', m: ['POST'] }, { n: 'models', m: ['GET'] }] },
  { n: 'OpenAI', d: 'api.openai.com', v: 'v1', e: [{ n: 'chat/completions', m: ['POST'] }, { n: 'embeddings', m: ['POST'] }] },
  { n: 'Pipedream', d: 'api.pipedream.com', v: 'v1', e: [{ n: 'workflows', m: ['GET', 'POST'] }, { n: 'sources', m: ['GET', 'POST', 'DELETE'] }] },
  { n: 'GitHub', d: 'api.github.com', v: 'v3', e: [{ n: 'repos', m: ['GET'] }, { n: 'users', m: ['GET'] }, { n: 'issues', m: ['POST'] }] },
  { n: 'HuggingFace', d: 'api-inference.huggingface.co', v: 'v1', e: [{ n: 'models', m: ['POST'] }, { n: 'pipelines', m: ['GET'] }] },
  { n: 'Plaid', d: 'production.plaid.com', v: '2020-09-14', e: [{ n: 'transactions/get', m: ['POST'] }, { n: 'accounts/get', m: ['POST'] }] },
  { n: 'ModernTreasury', d: 'app.moderntreasury.com', v: 'v1', e: [{ n: 'payment_orders', m: ['GET', 'POST'] }, { n: 'counterparties', m: ['GET', 'POST'] }] },
  { n: 'GoogleDrive', d: 'www.googleapis.com/drive', v: 'v3', e: [{ n: 'files', m: ['GET', 'POST'] }, { n: 'about', m: ['GET'] }] },
  { n: 'OneDrive', d: 'graph.microsoft.com', v: 'v1.0', e: [{ n: 'me/drive/root/children', m: ['GET'] }, { n: 'me/drive/items', m: ['POST'] }] },
  { n: 'Azure', d: 'management.azure.com', v: '2023-07-01', e: [{ n: 'subscriptions', m: ['GET'] }, { n: 'resourcegroups', m: ['GET', 'PUT'] }] },
  { n: 'GoogleCloud', d: 'cloud.googleapis.com', v: 'v1', e: [{ n: 'projects', m: ['GET'] }, { n: 'compute/instances', m: ['GET', 'POST'] }] },
  { n: 'Supabase', d: 'api.supabase.io', v: 'v1', e: [{ n: 'projects', m: ['GET'] }, { n: 'auth/users', m: ['GET', 'POST'] }] },
  { n: 'Vercel', d: 'api.vercel.com', v: 'v9', e: [{ n: 'projects', m: ['GET'] }, { n: 'deployments', m: ['GET', 'POST'] }] },
  { n: 'Salesforce', d: 'my.salesforce.com', v: 'v58.0', e: [{ n: 'sobjects/Account', m: ['GET', 'POST'] }, { n: 'query', m: ['GET'] }] },
  { n: 'Oracle', d: 'adb.oraclecloud.com', v: 'v1', e: [{ n: 'databases', m: ['GET'] }, { n: 'sql', m: ['POST'] }] },
  { n: 'MARQETA', d: 'services.marqeta.com', v: 'v3', e: [{ n: 'users', m: ['GET', 'POST'] }, { n:t: 'cards', m: ['GET', 'POST'] }] },
  { n: 'Citibank', d: 'sandbox.developer.citi.com', v: 'v1', e: [{ n: 'accounts', m: ['GET'] }, { n: 'payees', m: ['POST'] }] },
  { n: 'Shopify', d: 'my-shop.myshopify.com/admin/api', v: '2023-10', e: [{ n: 'products', m: ['GET', 'POST'] }, { n: 'orders', m: ['GET'] }] },
  { n: 'WooCommerce', d: 'example.com/wp-json/wc', v: 'v3', e: [{ n: 'products', m: ['GET', 'POST'] }, { n: 'customers', m: ['GET'] }] },
  { n: 'GoDaddy', d: 'api.godaddy.com', v: 'v1', e: [{ n: 'domains', m: ['GET'] }, { n: 'subscriptions', m: ['GET'] }] },
  { n: 'cPanel', d: 'hostname:2087/json-api', v: 'v2', e: [{ n: 'listaccts', m: ['GET'] }, { n: 'createacct', m: ['POST'] }] },
  { n: 'Adobe', d: 'ims-na1.adobelogin.com', v: 'v2', e: [{ n: 'acl', m: ['GET'] }, { n: 'organizations', m: ['GET'] }] },
  { n: 'Twilio', d: 'api.twilio.com', v: '2010-04-01', e: [{ n: 'Accounts', m: ['GET'] }, { n: 'Messages', m: ['POST'] }] },
  { n: 'Stripe', d: 'api.stripe.com', v: 'v1', e: [{ n: 'charges', m: ['GET', 'POST'] }, { n: 'customers', m: ['GET', 'POST'] }] },
  { n: 'Adyen', d: 'checkout-test.adyen.com', v: 'v69', e: [{ n: 'paymentMethods', m: ['POST'] }, { n: 'payments', m: ['POST'] }] },
  { n: 'Braintree', d: 'api.braintreegateway.com', v: 'v1', e: [{ n: 'customers', m: ['GET', 'POST'] }, { n: 'transactions', m: ['POST'] }] },
  { n: 'PayPal', d: 'api-m.paypal.com', v: 'v2', e: [{ n: 'checkout/orders', m: ['POST'] }, { n: 'payments/captures', m: ['GET'] }] },
  { n: 'QuickBooks', d: 'quickbooks.api.intuit.com', v: 'v3', e: [{ n: 'companyinfo', m: ['GET'] }, { n: 'invoice', m: ['GET', 'POST'] }] },
  { n: 'Xero', d: 'api.xero.com', v: '2.0', e: [{ n: 'Invoices', m: ['GET', 'PUT'] }, { n: 'Contacts', m: ['GET', 'PUT'] }] },
  { n: 'NetSuite', d: 'system.netsuite.com/services/rest', v: 'v1', e: [{ n: 'record/customer', m: ['GET', 'POST'] }, { n: 'query/v1/suiteql', m: ['POST'] }] },
  { n: 'Gusto', d: 'api.gusto.com', v: 'v1', e: [{ n: 'companies', m: ['GET'] }, { n: 'employees', m: ['GET', 'POST'] }] },
  { n: 'Rippling', d: 'api.rippling.com', v: 'v1', e: [{ n: 'employees', m: ['GET'] }, { n: 'payrolls', m: ['GET', 'POST'] }] },
  { n: 'Atlassian', d: 'api.atlassian.com/ex/jira', v: 'v3', e: [{ n: 'issue', m: ['GET', 'POST'] }, { n: 'project', m: ['GET'] }] },
  { n: 'Asana', d: 'app.asana.com/api', v: '1.0', e: [{ n: 'tasks', m: ['GET', 'POST'] }, { n: 'projects', m: ['GET'] }] },
  { n: 'Trello', d: 'api.trello.com', v: '1', e: [{ n: 'boards', m: ['GET'] }, { n: 'cards', m: ['GET', 'POST'] }] },
  { n: 'Mixpanel', d: 'api.mixpanel.com', v: 'v2', e: [{ n: 'events', m: ['POST'] }, { n: 'engage', m: ['POST'] }] },
  { n: 'Amplitude', d: 'api2.amplitude.com', v: 'v2', e: [{ n: 'httpapi', m: ['POST'] }, { n: 'chart', m: ['GET'] }] },
  { n: 'GoogleAnalytics', d: 'analyticsdata.googleapis.com', v: 'v1beta', e: [{ n: 'properties', m: ['GET'] }, { n: 'runReport', m: ['POST'] }] },
  { n: 'Okta', d: 'your-domain.okta.com/api', v: 'v1', e: [{ n: 'users', m: ['GET', 'POST'] }, { n: 'apps', m: ['GET'] }] },
  { n: 'Auth0', d: 'your-domain.auth0.com/api', v: 'v2', e: [{ n: 'users', m: ['GET', 'POST'] }, { n: 'clients', m: ['GET'] }] },
  { n: 'Cloudflare', d: 'api.cloudflare.com/client', v: 'v4', e: [{ n: 'zones', m: ['GET'] }, { n: 'dns_records', m: ['GET', 'POST'] }] },
  { n: 'MongoDB', d: 'data.mongodb-api.com/app/data/endpoint/data', v: 'v1', e: [{ n: 'action/findOne', m: ['POST'] }, { n: 'action/insertOne', m: ['POST'] }] },
  { n: 'PostgreSQL', d: 'your-postgres-api.com', v: 'v1', e: [{ n: 'query', m: ['POST'] }, { n: 'tables', m: ['GET'] }] },
  { n: 'Redis', d: 'your-redis-api.com', v: 'v1', e: [{ n: 'get', m: ['GET'] }, { n: 'set', m: ['POST'] }] },
  { n: 'Snowflake', d: 'your-account.snowflakecomputing.com/api', v: 'v2', e: [{ n: 'statements', m: ['POST'] }, { n: 'queries', m: ['GET'] }] },
  { n: 'Datadog', d: 'api.datadoghq.com', v: 'v2', e: [{ n: 'metrics', m: ['POST'] }, { n: 'logs/events', m: ['GET'] }] },
  { n: 'NewRelic', d: 'api.newrelic.com/v2', v: 'v2', e: [{ n: 'applications', m: ['GET'] }, { n: 'deployments', m: ['POST'] }] },
  { n: 'Sentry', d: 'sentry.io/api', v: '0', e: [{ n: 'projects', m: ['GET'] }, { n: 'issues', m: ['GET'] }] },
  { n: 'Slack', d: 'slack.com/api', v: 'v1', e: [{ n: 'chat.postMessage', m: ['POST'] }, { n: 'users.list', m: ['GET'] }] },
  { n: 'MicrosoftTeams', d: 'graph.microsoft.com', v: 'v1.0', e: [{ n: 'teams', m: ['GET'] }, { n: 'channels', m: ['GET', 'POST'] }] },
  { n: 'Zoom', d: 'api.zoom.us/v2', v: 'v2', e: [{ n: 'users', m: ['GET'] }, { n: 'meetings', m: ['POST'] }] },
  { n: 'DocuSign', d: 'demo.docusign.net/restapi', v: 'v2.1', e: [{ n: 'envelopes', m: ['POST'] }, { n: 'templates', m: ['GET'] }] },
  { n: 'Dropbox', d: 'api.dropboxapi.com', v: '2', e: [{ n: 'files/list_folder', m: ['POST'] }, { n: 'users/get_current_account', m: ['POST'] }] },
  { n: 'Box', d: 'api.box.com', v: '2.0', e: [{ n: 'folders/0/items', m: ['GET'] }, { n: 'users/me', m: ['GET'] }] },
  { n: 'Mailchimp', d: 'server.api.mailchimp.com', v: '3.0', e: [{ n: 'lists', m: ['GET'] }, { n: 'campaigns', m: ['POST'] }] },
  { n: 'SendGrid', d: 'api.sendgrid.com', v: 'v3', e: [{ n: 'mail/send', m: ['POST'] }, { n: 'stats', m: ['GET'] }] },
  { n: 'HubSpot', d: 'api.hubapi.com', v: 'v3', e: [{ n: 'crm/contacts', m: ['GET', 'POST'] }, { n: 'crm/deals', m: ['GET'] }] },
  { n: 'Marketo', d: 'your-id.mktorest.com/rest', v: 'v1', e: [{ n: 'leads', m: ['GET'] }, { n: 'activities', m: ['GET'] }] },
  { n: 'Zendesk', d: 'your-subdomain.zendesk.com/api', v: 'v2', e: [{ n: 'tickets', m: ['GET', 'POST'] }, { n: 'users', m: ['GET'] }] },
  { n: 'Intercom', d: 'api.intercom.io', v: '2.10', e: [{ n: 'contacts', m: ['GET', 'POST'] }, { n: 'conversations', m: ['GET'] }] },
  { n: 'Figma', d: 'api.figma.com', v: 'v1', e: [{ n: 'files', m: ['GET'] }, { n: 'comments', m: ['GET'] }] },
  { n: 'Sketch', d: 'api.sketch.com', v: 'v1', e: [{ n: 'documents', m: ['GET'] }, { n: 'user', m: ['GET'] }] },
  { n: 'InVision', d: 'api.invisionapp.com', v: 'v1', e: [{ n: 'prototypes', m: ['GET'] }, { n: 'screens', m: ['GET'] }] },
  { n: 'AWS', d: 'amazonaws.com', v: '2023-10-01', e: [{ n: 's3/listObjects', m: ['GET'] }, { n: 'ec2/describeInstances', m: ['GET'] }] },
  { n: 'DigitalOcean', d: 'api.digitalocean.com', v: 'v2', e: [{ n: 'droplets', m: ['GET', 'POST'] }, { n: 'domains', m: ['GET'] }] },
  { n: 'Heroku', d: 'api.heroku.com', v: 'v3', e: [{ n: 'apps', m: ['GET'] }, { n: 'dynos', m: ['GET', 'POST'] }] },
  { n: 'Docker', d: 'hub.docker.com/v2', v: 'v2', e: [{ n: 'repositories', m: ['GET'] }, { n: 'users', m: ['GET'] }] },
  { n: 'Kubernetes', d: 'k8s-cluster/api', v: 'v1', e: [{ n: 'pods', m: ['GET'] }, { n: 'services', m: ['GET'] }] },
  { n: 'Terraform', d: 'app.terraform.io/api', v: 'v2', e: [{ n: 'organizations', m: ['GET'] }, { n: 'workspaces', m: ['GET'] }] },
  { n: 'Ansible', d: 'your-tower/api', v: 'v2', e: [{ n: 'jobs', m: ['GET'] }, { n: 'inventories', m: ['GET'] }] },
  { n: 'Jenkins', d: 'your-jenkins/api/json', v: 'v1', e: [{ n: 'jobs', m: ['GET'] }, { n: 'build', m: ['POST'] }] },
  { n: 'CircleCI', d: 'circleci.com/api', v: 'v2', e: [{ n: 'project', m: ['GET'] }, { n: 'pipeline', m: ['POST'] }] },
  { n: 'GitLab', d: 'gitlab.com/api', v: 'v4', e: [{ n: 'projects', m: ['GET'] }, { n: 'issues', m: ['GET', 'POST'] }] },
  { n: 'Bitbucket', d: 'api.bitbucket.org', v: '2.0', e: [{ n: 'repositories', m: ['GET'] }, { n: 'pullrequests', m: ['GET'] }] },
  { n: 'Notion', d: 'api.notion.com', v: 'v1', e: [{ n: 'databases', m: ['POST'] }, { n: 'pages', m: ['GET', 'POST'] }] },
  { n: 'Confluence', d: 'your-domain.atlassian.net/wiki/rest/api', v: 'v1', e: [{ n: 'content', m: ['GET', 'POST'] }, { n: 'space', m: ['GET'] }] },
  { n: 'Miro', d: 'api.miro.com', v: 'v2', e: [{ n: 'boards', m: ['GET'] }, { n: 'items', m: ['GET'] }] },
  { n: 'Airtable', d: 'api.airtable.com', v: 'v0', e: [{ n: 'base/table', m: ['GET', 'POST'] }, { n: 'listRecords', m: ['GET'] }] },
  { n: 'SurveyMonkey', d: 'api.surveymonkey.com', v: 'v3', e: [{ n: 'surveys', m: ['GET'] }, { n: 'responses', m: ['GET'] }] },
  { n: 'Typeform', d: 'api.typeform.com', v: 'v1', e: [{ n: 'forms', m: ['GET'] }, { n: 'responses', m: ['GET'] }] },
  { n: 'Calendly', d: 'api.calendly.com', v: 'v2', e: [{ n: 'users/me', m: ['GET'] }, { n: 'scheduled_events', m: ['GET'] }] },
  { n: 'Zapier', d: 'nla.zapier.com/api', v: 'v1', e: [{ n: 'exposed', m: ['GET'] }, { n: 'execute', m: ['POST'] }] },
  { n: 'IFTTT', d: 'maker.ifttt.com/trigger', v: 'v1', e: [{ n: 'event/with/key', m: ['POST'] }] },
  { n: 'Looker', d: 'your-instance.looker.com/api', v: '4.0', e: [{ n: 'looks', m: ['GET'] }, { n: 'dashboards', m: ['GET'] }] },
  { n: 'Tableau', d: 'your-server/api', v: '3.19', e: [{ n: 'sites', m: ['GET'] }, { n: 'views', m: ['GET'] }] },
  { n: 'PowerBI', d: 'api.powerbi.com', v: 'v1.0', e: [{ n: 'myorg/groups', m: ['GET'] }, { n: 'myorg/datasets', m: ['GET'] }] },
  { n: 'Segment', d: 'api.segment.io', v: 'v1', e: [{ n: 'track', m: ['POST'] }, { n: 'identify', m: ['POST'] }] },
  { n: 'Algolia', d: 'app-id-dsn.algolia.net/1/indexes', v: '1', e: [{ n: 'query', m: ['POST'] }, { n: 'objects', m: ['POST'] }] },
  { n: 'Elastic', d: 'your-cluster.elastic-cloud.com', v: 'v1', e: [{ n: 'search', m: ['POST'] }, { n: 'index', m: ['POST'] }] },
  { n: 'Splunk', d: 'your-splunk-server:8089/services', v: 'v1', e: [{ n: 'search/jobs', m: ['POST'] }, { n: 'data/indexes', m: ['GET'] }] },
  { n: 'SAP', d: 'api.sap.com/S4HANAOD', v: 'v1', e: [{ n: 'API_BUSINESS_PARTNER', m: ['GET'] }, { n: 'API_SALES_ORDER_SRV', m: ['GET'] }] },
  { n: 'Workday', d: 'wd2-impl-services1.workday.com/ccx/service', v: 'v39.2', e: [{ n: 'Human_Resources', m: ['GET'] }, { n: 'Financial_Management', m: ['GET'] }] },
  { n: 'Carta', d: 'api.carta.com', v: 'v1', e: [{ n: 'cap_tables', m: ['GET'] }, { n: 'stakeholders', m: ['GET'] }] },
  { n: 'Brex', d: 'platform.brex.com', v: 'v1', e: [{ n: 'transactions', m: ['GET'] }, { n: 'cards', m: ['GET', 'POST'] }] },
  { n: 'Ramp', d: 'api.ramp.com', v: 'v1', e: [{ n: 'transactions', m: ['GET'] }, { n: 'receipts', m: ['POST'] }] },
  { n: 'Avalara', d: 'rest.avatax.com/api', v: 'v2', e: [{ n: 'transactions/create', m: ['POST'] }, { n: 'definitions/taxcodes', m: ['GET'] }] },
  { n: 'Bill', d: 'api.bill.com/api', v: 'v2', e: [{ n: 'Login', m: ['POST'] }, { n: 'Crud/Read/Vendor', m: ['POST'] }] },
  { n: 'Expensify', d: 'integrations.expensify.com/Integration-Server/ExpensifyIntegrations', v: 'v1', e: [{ n: 'download', m: ['POST'] }, { n: 'update', m: ['POST'] }] },
  { n: 'DocSend', d: 'api.docsend.com', v: 'v1', e: [{ n: 'links', m: ['GET'] }, { n: 'visitors', m: ['GET'] }] },
];

const CdbServiceRegistry: Record<string, any> = {};
serviceDefinitions.forEach(def => {
    CdbServiceRegistry[def.n] = CdbSvcConnFactory(def.n, def.d, def.v, def.e as any);
});

function generateComponent(svcKey: string, endpoint: any, method: string, ctype: CdbComponentType): CdbLayoutComponent {
  const fnName = `${method.toLowerCase()}${endpoint.name.charAt(0).toUpperCase() + endpoint.name.replace(/[^a-zA-Z0-9]/g, '_').slice(1)}`;
  return {
    cid: `${svcKey}_${endpoint.name}_${method}_${ctype}_${cdbBaseUtil.uid.gen()}`,
    wd: (['1/3', '1/2', '1/4'] as CdbLayoutComponentWidth[])[Math.floor(Math.random() * 3)],
    cfg: {
      title: `${svcKey} ${endpoint.name} (${method})`,
      ctype: ctype,
      fetchFn: CdbServiceRegistry[svcKey][fnName] || (() => Promise.resolve({ error: 'method not found' })),
      renderParams: {
        colorScheme: `scheme${Math.ceil(Math.random() * 8)}`,
        showGrid: Math.random() > 0.5,
      }
    }
  };
}

let allGeneratedComponents: CdbLayoutComponent[] = [];
serviceDefinitions.forEach(svc => {
  svc.e.forEach(ep => {
    (ep.m as string[]).forEach(m => {
      const ctype = m === 'GET' ? 'table' : 'stat';
      allGeneratedComponents.push(generateComponent(svc.n, ep, m, ctype));
      if (m === 'GET') {
        allGeneratedComponents.push(generateComponent(svc.n, ep, m, 'chart'));
      }
    });
  });
});

function createLayoutItems(components: CdbLayoutComponent[], componentsPerRow: number): CdbLayoutItem[] {
  const items: CdbLayoutItem[] = [];
  let currentComponents: CdbLayoutComponent[] = [];
  for (let i = 0; i < components.length; i++) {
    currentComponents.push(components[i]);
    if (currentComponents.length === componentsPerRow || i === components.length - 1) {
      items.push({
        r_id: `row_${cdbBaseUtil.uid.gen()}`,
        wd: 'full',
        cols: [{ components: currentComponents }]
      });
      currentComponents = [];
    }
  }
  return items;
}

const finalLayoutItems = createLayoutItems(allGeneratedComponents, 3);

export const citiDemoFinLayoutCfg: FinDashLayoutSpec = {
  apiVersion: "v4.2.1-alpha",
  dataSource: "citibankdemobusiness.dev",
  globalSettings: {
    theme: 'dark_mode',
    refreshIntervalSeconds: 60,
    company: 'Citibank demo business Inc'
  },
  layoutItems: finalLayoutItems,
};