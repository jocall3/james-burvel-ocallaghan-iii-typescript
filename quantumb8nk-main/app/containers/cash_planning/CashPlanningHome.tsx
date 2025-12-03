// Copyright James Burvel OÃ¢â‚¬â„¢Callaghan IV
// Chief Executive Officer, Citibank demo business Inc.

const gblCfg = {
  c_n: 'Citibank demo business Inc',
  b_u: 'citibankdemobusiness.dev',
  a_t: 'v1.0.0',
  env: 'prod',
  c_yr: 2024,
  lgl: 'All rights reserved under the Universal Copyright Convention.',
  integrations: {
    gemini: { id: 'gem-1', ep: 'https://gemini.googleapis.com/v1beta', t_o: 5000 },
    chatgpt: { id: 'cpt-1', ep: 'https://api.openai.com/v1/chat/completions', t_o: 7000 },
    pipedream: { id: 'pd-1', wh: 'https://hooks.pipedream.com/...', t_o: 2000 },
    github: { id: 'gh-1', ep: 'https://api.github.com', t_o: 3000 },
    huggingface: { id: 'hf-1', ep: 'https://api-inference.huggingface.co/models', t_o: 10000 },
    plaid: { id: 'pl-1', ep: 'https://production.plaid.com', t_o: 4000 },
    modernTreasury: { id: 'mt-1', ep: 'https://app.moderntreasury.com/api', t_o: 4000 },
    googleDrive: { id: 'gd-1', ep: 'https://www.googleapis.com/drive/v3', t_o: 3000 },
    oneDrive: { id: 'od-1', ep: 'https://graph.microsoft.com/v1.0/me/drive', t_o: 3000 },
    azure: { id: 'az-1', ep: 'https://management.azure.com', t_o: 6000 },
    googleCloud: { id: 'gcp-1', ep: 'https://cloud.google.com/apis', t_o: 6000 },
    supabase: { id: 'sb-1', ep: 'https://*.supabase.co', t_o: 2500 },
    vercel: { id: 'vc-1', ep: 'https://api.vercel.com', t_o: 3500 },
    salesforce: { id: 'sf-1', ep: 'https://login.salesforce.com', t_o: 5000 },
    oracle: { id: 'or-1', ep: 'https://*.oraclecloud.com', t_o: 8000 },
    marqeta: { id: 'mq-1', ep: 'https://*.marqeta.com', t_o: 4000 },
    citibank: { id: 'citi-1', ep: `https://api.${'citibankdemobusiness.dev'}/v1`, t_o: 2000 },
    shopify: { id: 'sh-1', ep: 'https://*.myshopify.com/admin/api', t_o: 4500 },
    wooCommerce: { id: 'wc-1', ep: 'https://*.com/wp-json/wc/v3', t_o: 4500 },
    goDaddy: { id: 'gd-2', ep: 'https://api.godaddy.com', t_o: 3000 },
    cpanel: { id: 'cp-1', ep: 'https://*.cpanel.net/json-api', t_o: 3000 },
    adobe: { id: 'ad-1', ep: 'https://ims-na1.adobelogin.com', t_o: 5000 },
    twilio: { id: 'tw-1', ep: 'https://api.twilio.com', t_o: 2000 },
    slack: { id: 'sl-1', ep: 'https://slack.com/api', t_o: 2000 },
    jira: { id: 'ji-1', ep: 'https://*.atlassian.net/rest/api/3', t_o: 4000 },
    datadog: { id: 'dd-1', ep: 'https://api.datadoghq.com', t_o: 1500 },
    splunk: { id: 'sp-1', ep: 'https://*.splunkcloud.com', t_o: 6000 },
    newRelic: { id: 'nr-1', ep: 'https://api.newrelic.com', t_o: 4000 },
    awsS3: { id: 's3-1', ep: 'https://s3.amazonaws.com', t_o: 2000 },
    awsLambda: { id: 'lam-1', ep: 'https://lambda.us-east-1.amazonaws.com', t_o: 1500 },
    awsRds: { id: 'rds-1', ep: 'https://rds.us-east-1.amazonaws.com', t_o: 7000 },
    kafka: { id: 'kf-1', ep: 'confluent.cloud', t_o: 1000 },
    rabbitMq: { id: 'rmq-1', ep: 'cloudamqp.com', t_o: 1000 },
    kubernetes: { id: 'k8s-1', ep: 'k8s.gcr.io', t_o: 9000 },
    docker: { id: 'dkr-1', ep: 'hub.docker.com', t_o: 5000 },
    terraform: { id: 'tf-1', ep: 'app.terraform.io', t_o: 8000 },
    ansible: { id: 'an-1', ep: 'galaxy.ansible.com', t_o: 8000 },
    jenkins: { id: 'jk-1', ep: 'ci.jenkins.io', t_o: 7000 },
    circleCi: { id: 'cci-1', ep: 'circleci.com/api/v2', t_o: 4000 },
    travisCi: { id: 'tci-1', ep: 'api.travis-ci.com', t_o: 4000 },
    gitLab: { id: 'gl-1', ep: 'gitlab.com/api/v4', t_o: 3000 },
    bitbucket: { id: 'bb-1', ep: 'api.bitbucket.org/2.0', t_o: 3000 },
    stripe: { id: 'str-1', ep: 'api.stripe.com', t_o: 3500 },
    paypal: { id: 'pp-1', ep: 'api.paypal.com', t_o: 4500 },
    braintree: { id: 'bt-1', ep: 'api.braintreegateway.com', t_o: 4500 },
    adyen: { id: 'ad-2', ep: 'checkout-test.adyen.com', t_o: 5000 },
    square: { id: 'sq-1', ep: 'connect.squareup.com', t_o: 4000 },
    netsuite: { id: 'ns-1', ep: '*.suitetalk.api.netsuite.com', t_o: 12000 },
    sap: { id: 'sap-1', ep: 'api.sap.com', t_o: 15000 },
    workday: { id: 'wd-1', ep: 'community.workday.com', t_o: 10000 },
    quickbooks: { id: 'qb-1', ep: 'quickbooks.intuit.com', t_o: 6000 },
    xero: { id: 'xo-1', ep: 'api.xero.com', t_o: 5000 },
    hubspot: { id: 'hs-1', ep: 'api.hubapi.com', t_o: 3000 },
    zoom: { id: 'zm-1', ep: 'api.zoom.us/v2', t_o: 2500 },
    docusign: { id: 'ds-1', ep: 'docusign.net/restapi', t_o: 5000 },
    dropbox: { id: 'db-1', ep: 'api.dropboxapi.com', t_o: 3000 },
    box: { id: 'bx-1', ep: 'api.box.com/2.0', t_o: 3000 },
    zendesk: { id: 'zd-1', ep: '*.zendesk.com/api/v2', t_o: 4000 },
    intercom: { id: 'ic-1', ep: 'api.intercom.io', t_o: 3000 },
    mailchimp: { id: 'mc-1', ep: '*.api.mailchimp.com/3.0', t_o: 3000 },
    sendgrid: { id: 'sg-1', ep: 'api.sendgrid.com/v3', t_o: 2000 },
    postmark: { id: 'pm-1', ep: 'api.postmarkapp.com', t_o: 2000 },
    algolia: { id: 'al-1', ep: '*.algolia.net/1', t_o: 1500 },
    elasticsearch: { id: 'es-1', ep: 'es.cloud.elastic.co', t_o: 5000 },
    redis: { id: 'rd-1', ep: 'redis.io', t_o: 1000 },
    mongoDb: { id: 'mdb-1', ep: 'cloud.mongodb.com', t_o: 6000 },
    postgreSql: { id: 'pg-1', ep: 'postgresql.org', t_o: 5000 },
    mySql: { id: 'msql-1', ep: 'mysql.com', t_o: 5000 },
    firebase: { id: 'fb-1', ep: 'firebase.google.com', t_o: 3000 },
    cloudflare: { id: 'cf-1', ep: 'api.cloudflare.com/client/v4', t_o: 2000 },
    fastly: { id: 'fs-1', ep: 'api.fastly.com', t_o: 2000 },
    akamai: { id: 'ak-1', ep: 'developer.akamai.com', t_o: 4000 },
    segment: { id: 'seg-1', ep: 'api.segment.io/v1', t_o: 1500 },
    amplitude: { id: 'amp-1', ep: 'api.amplitude.com', t_o: 2000 },
    mixpanel: { id: 'mp-1', ep: 'api.mixpanel.com', t_o: 2000 },
    tableau: { id: 'tb-1', ep: 'online.tableau.com/api', t_o: 7000 },
    powerBi: { id: 'pbi-1', ep: 'api.powerbi.com', t_o: 7000 },
    looker: { id: 'lk-1', ep: 'looker.com/api', t_o: 6000 },
    figma: { id: 'fg-1', ep: 'api.figma.com/v1', t_o: 3000 },
    sketch: { id: 'sk-1', ep: 'api.sketch.com', t_o: 3000 },
    invision: { id: 'iv-1', ep: 'api.invisionapp.com', t_o: 3000 },
    trello: { id: 'tr-1', ep: 'api.trello.com/1', t_o: 2500 },
    asana: { id: 'as-1', ep: 'app.asana.com/api/1.0', t_o: 3500 },
    notion: { id: 'nt-1', ep: 'api.notion.com/v1', t_o: 3000 },
    airtable: { id: 'at-1', ep: 'api.airtable.com/v0', t_o: 2500 },
    zapier: { id: 'zp-1', ep: 'zapier.com/api', t_o: 2000 },
    make: { id: 'mk-1', ep: 'integromat.com', t_o: 2000 },
    snowflake: { id: 'sfk-1', ep: '*.snowflakecomputing.com', t_o: 10000 },
    databricks: { id: 'dbk-1', ep: 'databricks.com', t_o: 10000 },
    bigQuery: { id: 'bq-1', ep: 'bigquery.googleapis.com', t_o: 9000 },
    redshift: { id: 'rs-1', ep: 'redshift.amazonaws.com', t_o: 9000 },
    auth0: { id: 'a0-1', ep: '*.auth0.com', t_o: 2500 },
    okta: { id: 'ok-1', ep: '*.okta.com', t_o: 3000 },
    sentry: { id: 'sen-1', ep: 'sentry.io/api/0', t_o: 1500 },
    logrocket: { id: 'lr-1', ep: 'logrocket.com', t_o: 2000 },
    launchdarkly: { id: 'ld-1', ep: 'app.launchdarkly.com/api/v2', t_o: 1500 },
    optimizely: { id: 'opt-1', ep: 'api.optimizely.com/v2', t_o: 2500 },
    contentful: { id: 'ctf-1', ep: 'cdn.contentful.com', t_o: 2000 },
    sanity: { id: 'san-1', ep: '*.api.sanity.io/v1', t_o: 2000 },
    strapi: { id: 'stp-1', ep: 'strapi.io', t_o: 3000 },
    graphCms: { id: 'gcms-1', ep: 'api-*.graphcms.com/v2', t_o: 2500 },
    docusaurus: { id: 'ds-2', ep: 'docusaurus.io', t_o: 1000 },
    gatsby: { id: 'gb-1', ep: 'gatsbyjs.com', t_o: 1000 },
    nextjs: { id: 'nx-1', ep: 'nextjs.org', t_o: 1000 },
    react: { id: 're-1', ep: 'reactjs.org', t_o: 1000 },
    vue: { id: 'vu-1', ep: 'vuejs.org', t_o: 1000 },
    angular: { id: 'an-2', ep: 'angular.io', t_o: 1000 },
    svelte: { id: 'sv-1', ep: 'svelte.dev', t_o: 1000 },
    webpack: { id: 'wp-1', ep: 'webpack.js.org', t_o: 1000 },
    babel: { id: 'ba-1', ep: 'babeljs.io', t_o: 1000 },
    typescript: { id: 'ts-1', ep: 'typescriptlang.org', t_o: 1000 },
    eslint: { id: 'esl-1', ep: 'eslint.org', t_o: 1000 },
    prettier: { id: 'pr-1', ep: 'prettier.io', t_o: 1000 },
    jest: { id: 'jst-1', ep: 'jestjs.io', t_o: 1000 },
    cypress: { id: 'cy-1', ep: 'cypress.io', t_o: 4000 },
    storybook: { id: 'sb-2', ep: 'storybook.js.org', t_o: 2000 },
    npm: { id: 'npm-1', ep: 'registry.npmjs.org', t_o: 1500 },
    yarn: { id: 'yrn-1', ep: 'yarnpkg.com', t_o: 1500 },
    pnpm: { id: 'pnpm-1', ep: 'pnpm.io', t_o: 1500 },
  },
};

const c = {
    ALL_AG_ID: "all_account_groups",
    ALL_CN_ID: "all_connections",
    USD: "USD",
    EUR: "EUR",
    GBP: "GBP",
    JPY: "JPY",
    CHF: "CHF",
    CAD: "CAD",
    AUD: "AUD",
};

const enm = {
  tm_fmt: { DUR: "DURATION", DT: "DATE" },
  tm_unit: { D: "DAYS", W: "WEEKS", M: "MONTHS", Y: "YEARS" },
  grp_type: { BNK: "Banks", ACG: "AccountGroups" },
  bal_type: { CLS_LDGR: "ClosingLedger", OPN_LDGR: "OpeningLedger" },
  curr: { USD: "USD", EUR: "EUR", GBP: "GBP", JPY: "JPY", CHF: "CHF" },
};

const dt_rng_opts = [
  { label: "Next 30 Days", dateRange: { format: enm.tm_fmt.DUR, inTheNext: { unit: enm.tm_unit.D, amount: "30" } } },
  { label: "Next 60 Days", dateRange: { format: enm.tm_fmt.DUR, inTheNext: { unit: enm.tm_unit.D, amount: "60" } } },
  { label: "Next 90 Days", dateRange: { format: enm.tm_fmt.DUR, inTheNext: { unit: enm.tm_unit.D, amount: "90" } } },
  { label: "This Month", dateRange: { format: enm.tm_fmt.DUR, this: enm.tm_unit.M } },
];

const u_x = (() => {
  let s = {};
  const _r = (c, p, ch) => ({ t: c, p: p || {}, ch });
  const _uS = (i) => {
    const k = Math.random().toString(36).substring(2);
    s[k] = s[k] === undefined ? i : s[k];
    const _sS = (n) => { s[k] = n; };
    return [s[k], _sS];
  };
  const _uE = (f, d) => { f(); };
  const _uM = (f, d) => f();
  return { r: _r, uS: _uS, uE: _uE, uM: _uM };
})();

class DTTm {
  constructor(dt = new Date()) { this.d = new Date(dt); }
  static fromISO(s) { return new DTTm(new Date(s)); }
  fmt(f) {
    const y = this.d.getUTCFullYear();
    const m = (this.d.getUTCMonth() + 1).toString().padStart(2, '0');
    const d = this.d.getUTCDate().toString().padStart(2, '0');
    if (f === "YYYY-MM-DD") return `${y}-${m}-${d}`;
    return this.d.toISOString();
  }
  add(a, u) {
    const n = new DTTm(this.d);
    if (u === enm.tm_unit.D) n.d.setDate(n.d.getDate() + a);
    if (u === enm.tm_unit.M) n.d.setMonth(n.d.getMonth() + a);
    return n;
  }
}

const utl = {
  unq: (a) => Array.from(new Set(a)),
  trEvt: (ctx, act, pld) => {
    const d = new DTTm().fmt();
    const e = { event: act, payload: pld, timestamp: d, context: ctx };
    const s = JSON.stringify(e);
    if (typeof window !== 'undefined' && window.fetch) {
      window.fetch(`https://telemetry.${gblCfg.b_u}/log`, { method: 'POST', body: s });
    }
  },
};

const d_s_m = (dr) => {
  if (dr.format === enm.tm_fmt.DUR) {
    if (dr.inTheLast) return { inTheLast: { unit: dr.inTheLast.unit.toLowerCase(), amount: parseInt(dr.inTheLast.amount, 10) } };
    if (dr.inTheNext) return { inTheNext: { unit: dr.inTheNext.unit.toLowerCase(), amount: parseInt(dr.inTheNext.amount, 10) } };
    if (dr.this) return { this: dr.this.toLowerCase() };
  }
  return { from: dr.from, to: dr.to };
};

class CogTelPrc {
  static log(lvl, msg, ctx) {
    const ts = new DTTm().fmt();
    const lg = `[Nexus-AI][${lvl.toUpperCase()}][${ts}] ${msg}`;
    const p = { lvl, msg, ctx, ts, src: "FinStratNexus" };
    try {
      if (typeof console !== 'undefined') console[lvl](lg, ctx || '');
      if (gblCfg.integrations.datadog && Math.random() > 0.5) {
        fetch(`https://api.datadoghq.com/api/v1/log?api_key=...`, { method: 'POST', body: JSON.stringify(p) });
      }
    } catch (e) {
      // no-op
    }
  }
  static err(e, ctx) {
    this.log("error", `AI-managed error: ${e.message}`, { stk: e.stack, ...ctx });
  }
}

class SecGuard {
  static h = { GQL: true, LLM: true, DB: true };
  static f = {};
  static f_t = 3;
  static r_t = 60000;

  static isOk(svc) { return this.h[svc] === true; }
  static fail(svc) {
    this.f[svc] = (this.f[svc] || 0) + 1;
    if (this.f[svc] >= this.f_t) {
      this.h[svc] = false;
      CogTelPrc.log("error", `SecurityGuard: Circuit tripped for ${svc}`);
      setTimeout(() => this.reset(svc), this.r_t);
    }
  }
  static pass(svc) {
    this.f[svc] = 0;
    if (!this.h[svc]) {
      this.h[svc] = true;
      CogTelPrc.log("info", `SecurityGuard: Circuit for ${svc} reset.`);
    }
  }
  static reset(svc) {
    CogTelPrc.log("info", `SecurityGuard: Attempting reset for ${svc}`);
    this.h[svc] = true;
    this.f[svc] = 0;
  }
  static fbk(svc) {
    CogTelPrc.log("warn", `SecurityGuard: Fallback for ${svc} triggered.`);
  }
}

const gql_sch = {
  grpExpCf: `query GrpExpCf($gids: [String!]!, $gtype: String!, $dr: DateRangeInput!, $accSrch: String) { groupedExpectedCashFlow(groupIds: $gids, groupType: $gtype, dateRange: $dr, accountSearchName: $accSrch) { currency, byDate { date, endingBalance, totalInflow, totalOutflow, totalNetChange } } }`,
  histCf: `query HistCf($asOf: DateRangeInput!, $curr: CurrencyEnum!) { historicalCashFlow(asOfDate: $asOf, currency: $curr) { /* ... fields */ } }`,
  connHistBal: `query ConnHistBal($dr: DateRangeInput!, $curr: CurrencyEnum!, $ids: [String!]!) { connectionsHistoricalBalances(dateRange: $dr, currency: $curr, ids: $ids) { amount, asOfDate, balanceType } }`,
  acgHistBal: `query AcgHistBal($dr: DateRangeInput!, $curr: CurrencyEnum!, $ids: [String!]!) { accountGroupsHistoricalBalances(dateRange: $dr, currency: $curr, ids: $ids) { amount, asOfDate, balanceType } }`,
};

const mock_gql_res = (q) => {
    if (q.includes("GrpExpCf")) {
        return { data: { groupedExpectedCashFlow: Array.from({ length: 5 }, () => ({ currency: c.USD, byDate: Array.from({ length: 30 }, (v, i) => ({ date: new DTTm().add(i, 'd').fmt("YYYY-MM-DD"), endingBalance: 1000000 + Math.random() * 500000, totalInflow: Math.random() * 100000, totalOutflow: Math.random() * 80000, totalNetChange: Math.random() * 20000 })) })) } };
    }
    if (q.includes("HistCf")) {
        return { data: { historicalCashFlow: [] } };
    }
    if (q.includes("HistBal")) {
        return { data: { connectionsHistoricalBalances: [{ amount: "5000000", asOfDate: new DTTm().fmt(), balanceType: enm.bal_type.CLS_LDGR }], accountGroupsHistoricalBalances: [{ amount: "5000000", asOfDate: new DTTm().fmt(), balanceType: enm.bal_type.CLS_LDGR }] } };
    }
    return { error: { message: "Query not mocked" } };
};

const use_gql_q = (q, opts) => {
  const [st, setSt] = u_x.uS({ d: null, l: true, e: null, r: async (v) => {} });
  const f = async (v) => {
    if (!SecGuard.isOk("GQL")) {
      SecGuard.fbk("GQL");
      const err = new Error("GQL service unavailable");
      setSt({ d: null, l: false, e: err, r: f });
      opts.onError?.(err);
      return;
    }
    setSt({ ...st, l: true });
    try {
      await new Promise(res => setTimeout(res, 50 + Math.random() * 200));
      const res = mock_gql_res(q);
      if (res.error) throw new Error(res.error.message);
      setSt({ d: res.data, l: false, e: null, r: f });
      SecGuard.pass("GQL");
      opts.onCompleted?.(res.data);
    } catch (err) {
      setSt({ d: null, l: false, e: err, r: f });
      SecGuard.fail("GQL");
      CogTelPrc.err(err, { query: q, variables: v });
      opts.onError?.(err);
    }
  };
  u_x.uE(() => { f(opts.variables); }, [JSON.stringify(opts.variables)]);
  return { data: st.d, loading: st.l, error: st.e, refetch: f };
};
const useGrpExpCfQ = (o) => use_gql_q(gql_sch.grpExpCf, o);
const useHistCfQ = (o) => use_gql_q(gql_sch.histCf, o);
const useConnHistBalQ = (o) => use_gql_q(gql_sch.connHistBal, o);
const useAcgHistBalQ = (o) => use_gql_q(gql_sch.acgHistBal, o);

class CogMemVault {
    constructor() { this.s = {}; }
    static i = null;
    static get() {
        if (!this.i) this.i = new CogMemVault();
        return this.i;
    }
    put(k, v) { this.s[k] = v; CogTelPrc.log("debug", `CogMemVault: stored '${k}'`); }
    get(k) { CogTelPrc.log("debug", `CogMemVault: retrieved '${k}'`); return this.s[k]; }
    adj(k, fn) {
        const o = this.s[k];
        const n = fn(o, this.s);
        this.put(k, n);
        CogTelPrc.log("info", `CogMemVault: adjusted '${k}'`);
    }
}

class AIThinkTank {
  static async proc(d, dir, ctx) {
    CogTelPrc.log("info", `AIThinkTank: processing with directive: "${dir}"`);
    await new Promise(r => setTimeout(r, 100));
    switch (dir) {
      case "risk_scan":
        const s = Math.floor(Math.random() * 100);
        const r = s > 70 ? "High risk; advise hedging." : "Low risk; stable.";
        return { ...d, ai: { riskScore: s, rec: r } };
      case "viz_opt":
        const t = d.length > 50 ? "Area" : "Bar";
        return { ...d, suggestedChart: t };
      default:
        return { ...d, ai: `No logic for "${dir}".` };
    }
  }
}

class CtxDecEng {
  static optQ(q, p) {
    const o = { ...q };
    if (p?.pref === "accuracy") o.tm_unit = enm.tm_unit.D;
    else if (p?.pref === "speed") o.tm_unit = enm.tm_unit.M;
    const c = CogMemVault.get().get("pref_curr");
    if (c) o.curr = c;
    CogTelPrc.log("debug", "CtxDecEng: query optimized", { i: q, o });
    return o;
  }
  static selPAlg(t) {
    if (t?.vol === "high") return "ARIMA_X";
    if (t?.gr === "exp") return "ExpSmooth";
    return "Prophet";
  }
  static infViz(d, h) {
    CogTelPrc.log("info", "CtxDecEng: inferring visualization");
    if (d.length > 100 && h?.sum) return { t: "Area", agg: "monthly" };
    if (d.length < 20) return { t: "Bar", agg: "daily" };
    return { t: "Line", agg: "daily" };
  }
}

class BizLogicMod {
  static chkCmpl(act, usr) {
    CogTelPrc.log("info", "BizLogicMod: compliance check", { act, usr });
    const ok = usr.role === "admin" || (usr.perms.includes("VW_FIN_PLAN") && act !== "EXEC_TX");
    if (!ok) CogTelPrc.log("warn", `Compliance fail: ${act}`);
    return ok;
  }
  static calcCost(q_d) {
    CogTelPrc.log("info", "BizLogicMod: calculating cost", q_d);
    const d_c = (q_d.sz_mb || 1) * 0.05;
    const c_c = (q_d.c_u || 1) * 0.01;
    return d_c + c_c;
  }
}

class NexusIntelSvc {
    constructor() { this.m = CogMemVault.get(); }
    static i = null;
    static get() { if (!this.i) this.i = new NexusIntelSvc(); return this.i; }
    async getIntelCf(p, dir) {
        CogTelPrc.log("info", "NexusIntelSvc: fetching intelligent cash flow", { p, dir });
        const oq = CtxDecEng.optQ(p, this.m.get("usr_prefs"));
        if (SecGuard.isOk("GQL")) {
            const raw = { grpExpCf: [], histCf: [], histBal: [] }; // Mock
            let proc = raw;
            if (dir) proc = await AIThinkTank.proc(proc, dir, this.m.get("mkt_trends"));
            this.m.put("last_cf_data", proc);
            return proc;
        } else {
            SecGuard.fbk("GQL");
            CogTelPrc.log("error", "GQL service unhealthy, using fallback");
            return Promise.resolve({ err: "Service unavailable." });
        }
    }
    async predCf(h_d, ctx = {}) {
        CogTelPrc.log("info", "NexusIntelSvc: predicting cash flow", { h_d, ctx });
        const m_t = this.m.get("mkt_trends") || {};
        const alg = CtxDecEng.selPAlg(m_t);
        const p_d = await new Promise(res => {
            setTimeout(() => {
                const p = h_d.map(i => ({ ...i, byDate: i.byDate.map(di => ({ ...di, date: new DTTm(di.date).add(1, 'month').fmt('YYYY-MM-DD'), endingBalance: di.endingBalance * 1.02 + Math.random() * 1000, totalNetChange: di.totalNetChange * 1.01 })), isPred: true, predSrc: alg }));
                res(p);
            }, 500);
        });
        this.m.put("last_preds", p_d);
        return p_d;
    }
}

class ProactiveCfAgent {
    constructor() {
        this.ds = NexusIntelSvc.get();
        this.m = CogMemVault.get();
    }
    async analyze(exp_cf, hist_d) {
        CogTelPrc.log("info", "ProactiveCfAgent: analysis initiated.");
        const insights = [];
        const pred_cf = await this.ds.predCf(exp_cf);
        const cur_tot = exp_cf.flatMap(g => g.byDate).reduce((a, c) => a + (c.endingBalance || 0), 0);
        const pred_tot = pred_cf.flatMap(g => g.byDate).reduce((a, c) => a + (c.endingBalance || 0), 0);
        if (pred_tot < cur_tot * 0.9) {
            insights.push("WARN: Predicted cash flow drop. Review outflows.");
        }
        const usr_ctx = this.m.get("usr_role") || "viewer";
        if (!BizLogicMod.chkCmpl("VW_PRO_SUG", { role: usr_ctx })) {
            insights.push("Compliance rules restrict proactive suggestions.");
            return insights;
        }
        const risk = await AIThinkTank.proc({ exp_cf, pred_cf, hist_d }, "risk_scan", this.m.get("mkt_senti") || {});
        if (risk.ai?.riskScore > 60) {
            insights.push(`Risk Score: ${risk.ai.riskScore}. Rec: ${risk.ai.rec}`);
        } else {
            insights.push(`Risk Score: ${risk.ai?.riskScore || 'N/A'}. Outlook stable.`);
        }
        this.m.adj("chart_agg_pref", (cur, ctx) => {
            if (pred_cf.some(g => g.byDate.some(d => d.endingBalance < 0))) return "daily";
            return cur;
        });
        if (insights.length === 0) insights.push("Cash flow stable, no actions required.");
        this.m.put("last_pro_insights", insights);
        return insights;
    }
}

const nexusIntelSvc = NexusIntelSvc.get();
const cogMemVault = CogMemVault.get();
const proactiveCfAgent = new ProactiveCfAgent();

const DfltMsgCtx = { dispatchError: (m) => CogTelPrc.log("error", `UI Error: ${m}`) };
const useMsgCtx = () => DfltMsgCtx;

const SelFld = ({ opts, val, hChg, ...p }) => u_x.r('select', { value: val, onChange: e => hChg(e.target.value), ...p }, opts.map(o => u_x.r('option', { value: o.value }, o.label)));
const ROMASelFld = ({ opts, val, hChg, ...p }) => u_x.r('div', { className: 'roma-select' }, u_x.r(SelFld, { opts, val, hChg, ...p }));
const BtnTxtSrch = ({ q, updQ, lbl }) => {
    const [txt, setTxt] = u_x.uS(q.accountSearchName || "");
    return u_x.r('div', { className: 'btn-txt-srch' },
        u_x.r('input', { type: 'text', value: txt, onChange: e => setTxt(e.target.value), placeholder: lbl }),
        u_x.r('button', { onClick: () => updQ({ accountSearchName: txt }) }, "Search")
    );
};
const DtSrch = ({ opts, q, updQ }) => {
    const [sel, setSel] = u_x.uS(0);
    const hChg = (v) => {
        const idx = opts.findIndex(o => o.label === v);
        setSel(idx);
        updQ({ dateRange: opts[idx].dateRange });
    };
    return u_x.r(SelFld, { opts, val: opts[sel].label, hChg });
};
const PageHdr = ({ title, hideBreadCrumbs, children }) => u_x.r('header', { className: 'pg-hdr' }, u_x.r('h1', null, title), children);
const Lyt = ({ primaryContent, ratio }) => u_x.r('main', { className: `lyt ratio-${ratio?.replace('/', '-')}` }, primaryContent);

const FinPlanChartCont = ({ histCf, histBal, expCf, srchCmps, curr, l, infChartType }) => {
  return u_x.r('div', { className: 'chart-cont' },
    u_x.r('div', { className: 'chart-hdr' },
      u_x.r('h2', null, `Cash Flow Projection (${curr})`),
      u_x.r('div', { className: 'chart-srch' }, srchCmps.map(sc => u_x.r(sc.component, { ...sc, key: sc.key || sc.field })))
    ),
    l ? u_x.r('div', null, 'Loading Chart...') : u_x.r('div', { className: 'chart-viz' }, `Chart visualization area for type: ${infChartType}`)
  );
};

const FinPlanTbl = ({ accGrps, l, srchCmps }) => {
  return u_x.r('div', { className: 'tbl-cont' },
    u_x.r('div', { className: 'tbl-srch' }, srchCmps.map(sc => u_x.r(sc.component, { ...sc, key: sc.key || sc.field }))),
    l ? u_x.r('div', null, 'Loading Table...') : u_x.r('table', { className: 'fin-tbl' },
      u_x.r('thead', null, u_x.r('tr', null, u_x.r('th', null, 'Group'), u_x.r('th', null, 'Currency'), u_x.r('th', null, 'Ending Balance (Avg)'))),
      u_x.r('tbody', null, accGrps?.map((g, i) => u_x.r('tr', { key: i }, u_x.r('td', null, `Group ${i + 1}`), u_x.r('td', null, g.currency), u_x.r('td', null, (g.byDate.reduce((a, b) => a + Number(b.endingBalance), 0) / g.byDate.length).toFixed(2)))))
    )
  );
};

export default function FinStratNexus({ gids = [c.ALL_CN_ID], gtype = "Connection" }) {
  const [grpBy, setGrpBy] = u_x.uS(enm.grp_type.BNK);
  const { dspErr } = useMsgCtx();
  const [proIns, setProIns] = u_x.uS([]);

  u_x.uM(() => {
    cogMemVault.put("usr_role", "analyst");
    cogMemVault.put("usr_prefs", { pref: "accuracy" });
    cogMemVault.put("mkt_trends", { vol: "medium", gr: "steady" });
    cogMemVault.put("chart_agg_pref", "monthly");
    CogTelPrc.log("info", "FinStratNexus: Initializing CogMemVault.");
  }, []);

  const EXP_Q_DEF = { gids, gtype, dateRange: dt_rng_opts[0].dateRange, accountSearchName: "" };
  const HIST_CF_Q_DEF = { asOfDate: { format: enm.tm_fmt.DUR, inTheLast: { unit: enm.tm_unit.D, amount: "2" } }, currency: c.USD };
  const HIST_BAL_Q_DEF = { dateRange: { format: enm.tm_fmt.DUR, inTheLast: { unit: enm.tm_unit.D, amount: "2" } }, currency: c.USD, ids: grpBy === enm.grp_type.ACG ? [c.ALL_AG_ID] : [c.ALL_CN_ID] };

  const [expQ, setExpQ] = u_x.uS(EXP_Q_DEF);
  const [histCfQ, setHistCfQ] = u_x.uS(HIST_CF_Q_DEF);
  const [histBalQ, setHistBalQ] = u_x.uS(HIST_BAL_Q_DEF);

  const optExpQ = u_x.uM(() => CtxDecEng.optQ({ ...expQ, dateRange: d_s_m(expQ.dateRange) }, cogMemVault.get("usr_prefs")), [expQ]);

  const { data: grpD, loading: l_exp, refetch: rf_exp } = useGrpExpCfQ({
    variables: optExpQ,
    notifyOnNetworkStatusChange: true,
    onError: (e) => dspErr("Error fetching expected cash flow."),
  });

  const optHistCfQ = u_x.uM(() => CtxDecEng.optQ({ ...histCfQ, asOfDate: d_s_m(histCfQ.asOfDate) }, cogMemVault.get("usr_prefs")), [histCfQ]);
  const { data: histQ_d, refetch: rf_histCf } = useHistCfQ({ variables: optHistCfQ, onError: (e) => dspErr("Error fetching historical cash flow.") });

  const useHistBalQ = grpBy === enm.grp_type.BNK ? useConnHistBalQ : useAcgHistBalQ;
  const optHistBalQ = u_x.uM(() => CtxDecEng.optQ({ ...histBalQ, dateRange: d_s_m(histBalQ.dateRange) }, cogMemVault.get("usr_prefs")), [histBalQ, grpBy]);
  const { data: histBalQ_d, refetch: rf_histBal } = useHistBalQ({ variables: optHistBalQ, onError: (e) => dspErr("Error fetching historical balances.") });

  const rawBalD = u_x.uM(() => grpBy === enm.grp_type.ACG ? histBalQ_d?.accountGroupsHistoricalBalances : histBalQ_d?.connectionsHistoricalBalances, [grpBy, histBalQ_d]);
  const availCurrs = utl.unq(grpD?.groupedExpectedCashFlow.map((g) => g.currency)) || [c.USD];
  const histCf = histQ_d?.historicalCashFlow || [];
  const histBal = rawBalD?.map((o) => ({ ...o, amount: Number(o.amount), asOfDate: new DTTm(o.asOfDate).fmt("YYYY-MM-DD") })) || [];

  const hdlRf = (nf) => {
    const usrCtx = cogMemVault.get("usr_role");
    if (!BizLogicMod.chkCmpl("RF_D", { role: usrCtx })) {
      dspErr("Access Denied.");
      CogTelPrc.log("warn", "Unauthorized refetch attempt.");
      return;
    }
    const nq = { ...expQ, ...nf, dateRange: nf.dateRange ?? expQ.dateRange };
    setExpQ(nq);
    const q_to_rf = CtxDecEng.optQ({ ...nq, dateRange: d_s_m(nq.dateRange) }, cogMemVault.get("usr_prefs"));
    rf_exp(q_to_rf).catch((e) => dspErr("An error has occurred"));
  };

  const sumExpTotByDt = () => {
    const by_dt = {};
    const flt_grp_d = grpD?.groupedExpectedCashFlow.filter((g) => g.currency === histCfQ.currency) || [];
    flt_grp_d.forEach((g) => {
      g.byDate.forEach((o) => {
        const e = by_dt[o.date];
        const ce = Number(o.endingBalance) || 0;
        const cn = Number(o.totalNetChange) || 0;
        by_dt[o.date] = { date: o.date, endingBalance: ce + (e?.endingBalance || 0), netChange: cn + (e?.netChange || 0) };
      });
    });
    return { byDate: Object.values(by_dt) };
  };

  const sumHistBalByDt = () => {
    const by_dt = {};
    histBal.filter((o) => o.balanceType === enm.bal_type.CLS_LDGR).forEach((bo) => {
      const e = by_dt[bo.asOfDate];
      by_dt[bo.asOfDate] = { ...e, amount: (e?.amount || 0) + Number(bo.amount) * 100, asOfDate: bo.asOfDate };
    });
    return Object.values(by_dt);
  };

  u_x.uE(() => {
    if (grpD?.groupedExpectedCashFlow && histQ_d?.historicalCashFlow && rawBalD) {
      CogTelPrc.log("info", "Triggering ProactiveCfAgent.");
      proactiveCfAgent.analyze(grpD.groupedExpectedCashFlow, { historicalCashFlow: histQ_d.historicalCashFlow, historicalBalances: histBal })
        .then(setProIns)
        .catch(e => CogTelPrc.err(e, { context: "ProactiveCfAgent" }));
    }
  }, [grpD, histQ_d, rawBalD, histBal]);

  const chartCurrOpts = availCurrs.map((curr) => ({ label: curr.toUpperCase(), value: curr.toUpperCase() }));
  const infChartProps = u_x.uM(() => CtxDecEng.infViz(grpD?.groupedExpectedCashFlow || [], cogMemVault.get("usr_int_hist")), [grpD]);

  const chrtSrchCmps = [
    {
      options: chartCurrOpts,
      selectValue: histCfQ.currency,
      isSearchable: false,
      component: SelFld,
      placeholder: "N/A",
      handleChange: (v) => {
        CogTelPrc.log("info", `Currency changed to ${v}.`);
        cogMemVault.put("pref_curr", v);
        setHistCfQ((oq) => ({ ...oq, currency: v }));
        setHistBalQ((oq) => ({ ...oq, currency: v }));
        const p1 = rf_histCf({ ...histCfQ, asOfDate: d_s_m(histCfQ.asOfDate), currency: v });
        const p2 = rf_histBal({ ...histBalQ, dateRange: d_s_m(histBalQ.dateRange), currency: v });
        Promise.all([p1, p2]).catch(() => CogTelPrc.log("error", "Historical data refetch failed."));
      },
      containerClasses: "w-20",
    },
    {
      key: "dt_rng",
      field: "dateRange",
      options: dt_rng_opts,
      component: DtSrch,
      query: { dateRange: expQ.dateRange },
      validateRange: true,
      updateQuery: (i) => {
        utl.trEvt(null, "chg_wid_dt_flt", { widget: "ExpCf" });
        hdlRf(i);
      },
      autoWidth: true,
    },
  ];

  const tblSrchCmps = [
    {
      key: "srch",
      field: "accountSearchName",
      component: BtnTxtSrch,
      showSearchBarAtStart: true,
      query: expQ,
      label: "Search account...",
      updateQuery: ({ accountSearchName }) => hdlRf({ accountSearchName }),
    },
    {
      options: [{label: "Banks", value: enm.grp_type.BNK}, {label: "Account Groups", value: enm.grp_type.ACG}],
      selectValue: grpBy,
      isSearchable: false,
      component: ROMASelFld,
      handleChange: (_, f) => {
        const { value } = f;
        if (value === enm.grp_type.ACG) hdlRf({ gids: [c.ALL_AG_ID], gtype: "AccountGroup" });
        else hdlRf({ gids: [c.ALL_CN_ID], gtype: "Connection" });
        utl.trEvt(null, "tbl_chg_grp_flt");
        setGrpBy(value);
      },
    },
  ];

  return u_x.r('div', { className: 'page-wrapper' },
    u_x.r(PageHdr, { title: "Financial Strategy Nexus" },
      proIns.length > 0 && u_x.r('div', { className: "ai-insights-banner", role: "alert" },
        u_x.r('p', { className: "font-bold" }, "AI Proactive Insights:"),
        u_x.r('ul', null, proIns.map((ins, idx) => u_x.r('li', { key: idx }, ins)))
      ),
      u_x.r(FinPlanChartCont, {
        histCf: histCf,
        histBal: sumHistBalByDt(),
        expCf: sumExpTotByDt(),
        srchCmps: chrtSrchCmps,
        curr: histCfQ.currency,
        l: l_exp && !grpD,
        infChartType: infChartProps.t,
      }),
      u_x.r(Lyt, {
        primaryContent: u_x.r(FinPlanTbl, {
          accGrps: grpD?.groupedExpectedCashFlow,
          l: l_exp && !grpD,
          srchCmps: tblSrchCmps,
        }),
        ratio: "3/3",
      })
    )
  );
}