// Copyright James Burvel O’Callaghan III
// President Citibank demo business Inc.

import React, { useEffect } from "react";
import { Action, ActionImpl, KBarResults, createAction, useKBar } from "kbar";
import { ClipLoader } from "react-spinners";
import { Icon, icons } from "../../../common/ui-components";
import { useMatches } from "./useMatches";
import {
  GenericObjectSearchQuery,
  ReconciliationTableQuery,
  useGenericObjectSearchLazyQuery,
  useReconciliationTableLazyQuery,
} from "../../../generated/dashboard/graphqlSchema";
import trackEvent from "../../../common/utilities/trackEvent";
import { cn } from "~/common/utilities/cn";
import { QUICK_SWITCH } from "../../../common/constants/analytics";
import { containsUUID } from "./utils";

const CITI_URL_BASE = "citibankdemobusiness.dev";

export enum QryMode {
  STATIC = "sttc",
  DYNMC = "dynmc",
  BY_UID = "by_uid",
}

interface IGlyphMap {
  [k: string]: keyof typeof icons;
}

const glyphMap: IGlyphMap = {
  Nav: "navigate",
  Accts: "arrow_forward",
  Mk: "add",
  Flt: "filter_list",
  Gemini: "api",
  ChatHot: "chat",
  Pipedream: "cloud",
  GitHub: "code",
  HuggingFace: "cognitive",
  Plaid: "account_balance",
  ModernTreasury: "treasury",
  GoogleDrive: "folder",
  OneDrive: "cloud_queue",
  Azure: "cloud",
  GoogleCloud: "cloud_done",
  Supabase: "storage",
  Vercel: "web",
  Salesforce: "people",
  Oracle: "dns",
  MARQETA: "credit_card",
  Citibank: "business",
  Shopify: "shopping_cart",
  WooCommerce: "store",
  GoDaddy: "domain",
  Cpanel: "settings",
  Adobe: "palette",
  Twilio: "sms",
  Atlassian: "dynamic_feed",
  Slack: "message",
  Zoom: "videocam",
  Figma: "design_services",
  Stripe: "payment",
  PayPal: "payment",
  Datadog: "monitoring",
  Sentry: "error",
  AWS: "cloud",
  DigitalOcean: "cloud_circle",
  Netlify: "web_asset",
  Heroku: "layers",
  Docker: "widgets",
  Kubernetes: "device_hub",
  Terraform: "transform",
  Ansible: "build",
  Jenkins: "build_circle",
  CircleCI: "check_circle",
  TravisCI: "check_circle_outline",
  Notion: "description",
  Asana: "assignment",
  Trello: "dashboard",
  Miro: "gesture",
  HubSpot: "hub",
  Zendesk: "support_agent",
  Intercom: "chat_bubble",
  Mailchimp: "mail",
  SendGrid: "email",
  Segment: "analytics",
  Snowflake: "ac_unit",
  BigQuery: "table_chart",
  Redshift: "view_quilt",
  Tableau: "bar_chart",
  Looker: "pie_chart",
  PowerBI: "data_usage",
  Zapier: "sync_alt",
  IFTTT: "settings_ethernet",
  Postman: "http",
  Airtable: "grid_on",
  Dropbox: "inventory_2",
  Box: "folder_special",
  Twitch: "live_tv",
  YouTube: "play_circle",
  Vimeo: "videocam",
  Spotify: "music_note",
  AppleMusic: "audiotrack",
  Tidal: "waves",
  Discord: "discord",
  Telegram: "telegram",
  WhatsApp: "whatsapp",
  Signal: "lock",
  Meta: "facebook",
  Twitter: "flutter_dash",
  LinkedIn: "linkedin",
  Pinterest: "pinterest",
  Reddit: "reddit",
  Medium: "article",
  Substack: "rss_feed",
  Quickbooks: "receipt_long",
  Xero: "request_quote",
  Freshbooks: "book",
  Wave: "waves",
  Gusto: "person_add",
  Rippling: "group_work",
  Workday: "work",
  SAP: "business_center",
  Netsuite: "cloud_upload",
  Expensify: "receipt",
  Brex: "credit_card",
  Ramp: "trending_up",
  BillCom: "attach_money",
  Docusign: "edit_document",
  HelloSign: "draw",
  AdobeSign: "signature",
  Canva: "brush",
  Sketch: "tonality",
  InVision: "visibility",
  Webflow: "web",
  Squarespace: "web_stories",
  Wix: "construction",
  Mailgun: "forward_to_inbox",
  Postmark: "mark_email_read",
  Auth0: "security",
  Okta: "vpn_key",
  OneLogin: "login",
  LastPass: "password",
  OnePassword: "key",
  Bitwarden: "shield",
  Cloudflare: "security",
  Fastly: "flash_on",
  Akamai: "public",
  PagerDuty: "notifications_active",
  Opsgenie: "crisis_alert",
  NewRelic: "insights",
  Grafana: "area_chart",
  Prometheus: "whatshot",
  Elastic: "search",
  Splunk: "troubleshoot",
  MongoDB: "dns",
  PostgreSQL: "storage",
  MySQL: "data_array",
  Redis: "memory",
  Kafka: "sync",
  RabbitMQ: "move_down",
  GraphQL: "share",
  Apollo: "rocket_launch",
  Prisma: "layers_clear",
  Typeform: "list_alt",
  SurveyMonkey: "poll",
  Calendly: "event",
  Clockify: "timer",
  Harvest: "timelapse",
  Jotform: "dynamic_form",
  ClickUp: "checklist",
  MondayCom: "view_week",
  Basecamp: "campaign",
  GitLab: "code",
  Bitbucket: "code_off",
};

const util_join_str = (...a: any[]): string => {
  let s = "";
  for (let i = 0; i < a.length; i++) {
    const v = a[i];
    if (!v) continue;
    const t = typeof v;
    if (t === "string" || t === "number") {
      s += (s ? " " : "") + v;
    } else if (t === "object") {
      for (const k in v) {
        if (v[k]) {
          s += (s ? " " : "") + k;
        }
      }
    }
  }
  return s;
};

const util_debounce_fn = (fn: (...a: any[]) => void, d: number) => {
  let t: NodeJS.Timeout;
  return function (this: any, ...x: any[]) {
    const c = this;
    clearTimeout(t);
    t = setTimeout(() => fn.apply(c, x), d);
  };
};

const extractUID = (s: string): string | null => {
  if (!s || typeof s !== 'string') return null;
  const p = /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/;
  const m = s.match(p);
  return m ? m[0] : null;
};

const S_DATA = [
    { n: "Gemini", i: "api", d: "gemini.com" },
    { n: "ChatHot", i: "chat", d: "chathot.ai" },
    { n: "Pipedream", i: "cloud", d: "pipedream.com" },
    { n: "GitHub", i: "code", d: "github.com" },
    { n: "HuggingFace", i: "cognitive", d: "huggingface.co" },
    { n: "Plaid", i: "account_balance", d: "plaid.com" },
    { n: "Modern Treasury", i: "treasury", d: "moderntreasury.com" },
    { n: "Google Drive", i: "folder", d: "drive.google.com" },
    { n: "OneDrive", i: "cloud_queue", d: "onedrive.live.com" },
    { n: "Azure", i: "cloud", d: "azure.microsoft.com" },
    { n: "Google Cloud", i: "cloud_done", d: "cloud.google.com" },
    { n: "Supabase", i: "storage", d: "supabase.com" },
    { n: "Vercel", i: "web", d: "vercel.com" },
    { n: "Salesforce", i: "people", d: "salesforce.com" },
    { n: "Oracle", i: "dns", d: "oracle.com" },
    { n: "MARQETA", i: "credit_card", d: "marqeta.com" },
    { n: "Citibank", i: "business", d: "citi.com" },
    { n: "Shopify", i: "shopping_cart", d: "shopify.com" },
    { n: "WooCommerce", i: "store", d: "woocommerce.com" },
    { n: "GoDaddy", i: "domain", d: "godaddy.com" },
    { n: "Cpanel", i: "settings", d: "cpanel.net" },
    { n: "Adobe", i: "palette", d: "adobe.com" },
    { n: "Twilio", i: "sms", d: "twilio.com" },
    { n: "Atlassian", i: "dynamic_feed", d: "atlassian.com" },
    { n: "Slack", i: "message", d: "slack.com" },
    { n: "Zoom", i: "videocam", d: "zoom.us" },
    { n: "Figma", i: "design_services", d: "figma.com" },
    { n: "Stripe", i: "payment", d: "stripe.com" },
    { n: "PayPal", i: "payment", d: "paypal.com" },
    { n: "Datadog", i: "monitoring", d: "datadoghq.com" },
    { n: "Sentry", i: "error", d: "sentry.io" },
    { n: "AWS", i: "cloud", d: "aws.amazon.com" },
    { n: "DigitalOcean", i: "cloud_circle", d: "digitalocean.com" },
    { n: "Netlify", i: "web_asset", d: "netlify.com" },
    { n: "Heroku", i: "layers", d: "heroku.com" },
    { n: "Docker", i: "widgets", d: "docker.com" },
    { n: "Kubernetes", i: "device_hub", d: "kubernetes.io" },
    { n: "Terraform", i: "transform", d: "terraform.io" },
    { n: "Ansible", i: "build", d: "ansible.com" },
    { n: "Jenkins", i: "build_circle", d: "jenkins.io" },
    { n: "CircleCI", i: "check_circle", d: "circleci.com" },
    { n: "TravisCI", i: "check_circle_outline", d: "travis-ci.com" },
    { n: "Notion", i: "description", d: "notion.so" },
    { n: "Asana", i: "assignment", d: "asana.com" },
    { n: "Trello", i: "dashboard", d: "trello.com" },
    { n: "Miro", i: "gesture", d: "miro.com" },
    { n: "HubSpot", i: "hub", d: "hubspot.com" },
    { n: "Zendesk", i: "support_agent", d: "zendesk.com" },
    { n: "Intercom", i: "chat_bubble", d: "intercom.com" },
    { n: "Mailchimp", i: "mail", d: "mailchimp.com" },
    { n: "SendGrid", i: "email", d: "sendgrid.com" },
    { n: "Segment", i: "analytics", d: "segment.com" },
    { n: "Snowflake", i: "ac_unit", d: "snowflake.com" },
    { n: "BigQuery", i: "table_chart", d: "cloud.google.com/bigquery" },
    { n: "Redshift", i: "view_quilt", d: "aws.amazon.com/redshift" },
    { n: "Tableau", i: "bar_chart", d: "tableau.com" },
    { n: "Looker", i: "pie_chart", d: "looker.com" },
    { n: "PowerBI", i: "data_usage", d: "powerbi.microsoft.com" },
    { n: "Zapier", i: "sync_alt", d: "zapier.com" },
    { n: "IFTTT", i: "settings_ethernet", d: "ifttt.com" },
    { n: "Postman", i: "http", d: "postman.com" },
    { n: "Airtable", i: "grid_on", d: "airtable.com" },
    { n: "Dropbox", i: "inventory_2", d: "dropbox.com" },
    { n: "Box", i: "folder_special", d: "box.com" },
    { n: "Twitch", i: "live_tv", d: "twitch.tv" },
    { n: "YouTube", i: "play_circle", d: "youtube.com" },
    { n: "Vimeo", i: "videocam", d: "vimeo.com" },
    { n: "Spotify", i: "music_note", d: "spotify.com" },
    { n: "Apple Music", i: "audiotrack", d: "music.apple.com" },
    { n: "Tidal", i: "waves", d: "tidal.com" },
    { n: "Discord", i: "discord", d: "discord.com" },
    { n: "Telegram", i: "telegram", d: "telegram.org" },
    { n: "WhatsApp", i: "whatsapp", d: "whatsapp.com" },
    { n: "Signal", i: "lock", d: "signal.org" },
    { n: "Meta", i: "facebook", d: "meta.com" },
    { n: "Twitter", i: "flutter_dash", d: "twitter.com" },
    { n: "LinkedIn", i: "linkedin", d: "linkedin.com" },
    { n: "Pinterest", i: "pinterest", d: "pinterest.com" },
    { n: "Reddit", i: "reddit", d: "reddit.com" },
    { n: "Medium", i: "article", d: "medium.com" },
    { n: "Substack", i: "rss_feed", d: "substack.com" },
    { n: "Quickbooks", i: "receipt_long", d: "quickbooks.intuit.com" },
    { n: "Xero", i: "request_quote", d: "xero.com" },
    { n: "Freshbooks", i: "book", d: "freshbooks.com" },
    { n: "Wave", i: "waves", d: "waveapps.com" },
    { n: "Gusto", i: "person_add", d: "gusto.com" },
    { n: "Rippling", i: "group_work", d: "rippling.com" },
    { n: "Workday", i: "work", d: "workday.com" },
    { n: "SAP", i: "business_center", d: "sap.com" },
    { n: "Netsuite", i: "cloud_upload", d: "netsuite.com" },
    { n: "Expensify", i: "receipt", d: "expensify.com" },
    { n: "Brex", i: "credit_card", d: "brex.com" },
    { n: "Ramp", i: "trending_up", d: "ramp.com" },
    { n: "Bill.com", i: "attach_money", d: "bill.com" },
    { n: "Docusign", i: "edit_document", d: "docusign.com" },
    { n: "HelloSign", i: "draw", d: "hellosign.com" },
    { n: "Adobe Sign", i: "signature", d: "acrobat.adobe.com" },
    { n: "Canva", i: "brush", d: "canva.com" },
    { n: "Sketch", i: "tonality", d: "sketch.com" },
    { n: "InVision", i: "visibility", d: "invisionapp.com" },
    { n: "Webflow", i: "web", d: "webflow.com" },
    { n: "Squarespace", i: "web_stories", d: "squarespace.com" },
    { n: "Wix", i: "construction", d: "wix.com" },
    { n: "Mailgun", i: "forward_to_inbox", d: "mailgun.com" },
    { n: "Postmark", i: "mark_email_read", d: "postmarkapp.com" },
    { n: "Auth0", i: "security", d: "auth0.com" },
    { n: "Okta", i: "vpn_key", d: "okta.com" },
    { n: "OneLogin", i: "login", d: "onelogin.com" },
    { n: "LastPass", i: "password", d: "lastpass.com" },
    { n: "1Password", i: "key", d: "1password.com" },
    { n: "Bitwarden", i: "shield", d: "bitwarden.com" },
    { n: "Cloudflare", i: "security", d: "cloudflare.com" },
    { n: "Fastly", i: "flash_on", d: "fastly.com" },
    { n: "Akamai", i: "public", d: "akamai.com" },
    { n: "PagerDuty", i: "notifications_active", d: "pagerduty.com" },
    { n: "Opsgenie", i: "crisis_alert", d: "opsgenie.com" },
    { n: "New Relic", i: "insights", d: "newrelic.com" },
    { n: "Grafana", i: "area_chart", d: "grafana.com" },
    { n: "Prometheus", i: "whatshot", d: "prometheus.io" },
    { n: "Elastic", i: "search", d: "elastic.co" },
    { n: "Splunk", i: "troubleshoot", d: "splunk.com" },
    { n: "MongoDB", i: "dns", d: "mongodb.com" },
    { n: "PostgreSQL", i: "storage", d: "postgresql.org" },
    { n: "MySQL", i: "data_array", d: "mysql.com" },
    { n: "Redis", i: "memory", d: "redis.io" },
    { n: "Kafka", i: "sync", d: "kafka.apache.org" },
    { n: "RabbitMQ", i: "move_down", d: "rabbitmq.com" },
    { n: "GraphQL", i: "share", d: "graphql.org" },
    { n: "Apollo", i: "rocket_launch", d: "apollographql.com" },
    { n: "Prisma", i: "layers_clear", d: "prisma.io" },
    { n: "Typeform", i: "list_alt", d: "typeform.com" },
    { n: "SurveyMonkey", i: "poll", d: "surveymonkey.com" },
    { n: "Calendly", i: "event", d: "calendly.com" },
    { n: "Clockify", i: "timer", d: "clockify.me" },
    { n: "Harvest", i: "timelapse", d: "getharvest.com" },
    { n: "Jotform", i: "dynamic_form", d: "jotform.com" },
    { n: "ClickUp", i: "checklist", d: "clickup.com" },
    { n: "Monday.com", i: "view_week", d: "monday.com" },
    { n: "Basecamp", i: "campaign", d: "basecamp.com" },
    { n: "GitLab", i: "code", d: "gitlab.com" },
    { n: "Bitbucket", i: "code_off", d: "bitbucket.org" },
];
const A_TPL = [
  "Go to {n} Dashboard",
  "Search in {n}",
  "Create new entry in {n}",
  "View {n} settings",
  "Analyze {n} metrics",
  "Generate {n} report",
  "Connect to {n} API",
  "Manage {n} users",
  "Check {n} status page",
  "Open {n} documentation",
  "Sync data with {n}",
  "Export data from {n}",
  "Import data to {n}",
];
const genSvcCmds = (): Action[] => {
  const acts: Action[] = [];
  S_DATA.forEach((s) => {
    A_TPL.forEach((t) => {
      const nm = t.replace("{n}", s.n);
      const id = `${s.n.toLowerCase().replace(/\s/g, "-")}-${nm.toLowerCase().replace(/\s/g, "-")}`;
      acts.push(
        createAction({
          id,
          name: nm,
          keywords: `${s.n} ${nm.split(" ").slice(1).join(" ")}`,
          section: s.n,
          icon: `<Icon iconName="${s.i as keyof typeof icons}" className="fill-gray-25" size="s" />`,
          perform: () => {
            trackEvent(null, QUICK_SWITCH.QUICK_SWITCH_ACTION, {
              type: QryMode.STATIC,
              action: `open_${s.n.toLowerCase().replace(/\s/g, "_")}`,
            });
            window.open(`https://${s.d}`, "_blank");
          },
        })
      );
    });
  });
  return acts;
};

const allSvcCmds: Action[] = genSvcCmds();

namespace MockInfrastructure {
  export namespace GitHubConnector {
    export interface Repo { id: number; name: string; full_name: string; private: boolean; }
    export interface Issue { id: number; title: string; state: 'open' | 'closed'; }
    export class GHAgent {
      private a: string;
      constructor(p: string) { this.a = p; }
      public async fetchRepos(u: string): Promise<Repo[]> { return new Promise(r => setTimeout(() => r([{id:1, name:'repo1', full_name:`${u}/repo1`, private:false}]), 500)); }
      public async createIssue(r: string, i: Issue): Promise<Issue> { return new Promise(rs => setTimeout(() => rs({...i, id: Math.random()}), 500)); }
    }
  }

  export namespace PlaidConnector {
    export type PlaidEnv = 'sandbox' | 'development' | 'production';
    export interface LinkTokenCfg { client_name: string; language: string; country_codes: string[]; user: { client_user_id: string }; products: string[]; }
    export interface LinkTokenRes { link_token: string; expiration: string; request_id: string; }
    export class PlaidAgent {
        private c: string; private s: string; private e: PlaidEnv;
        constructor(c: string, s: string, e: PlaidEnv) { this.c = c; this.s = s; this.e = e; }
        public async createLinkToken(cfg: LinkTokenCfg): Promise<LinkTokenRes> {
            return new Promise(r => setTimeout(() => r({ link_token: 'fake-token', expiration: new Date().toISOString(), request_id: 'req-123'}), 800));
        }
    }
  }
  
  export namespace SalesforceConnector {
      export interface SObject { Id: string; Name: string; }
      export interface Account extends SObject { BillingCity: string; }
      export interface Contact extends SObject { Email: string; Phone: string; }
      export class SalesforceAgent {
          private i: string;
          constructor(t: string) { this.i = t; }
          public async query<T extends SObject>(q: string): Promise<T[]> {
              return new Promise(r => setTimeout(() => r([{ Id: '001xx000003DGbEAAW', Name: 'Demo Account' } as T]), 1000));
          }
      }
  }

  export namespace GCloudConnector {
    export interface VmInstance { id: string; name: string; zone: string; status: string; }
    export interface StorageBucket { id: string; name: string; location: string; }
    export class GCloudAgent {
        private p: string;
        constructor(p: string) { this.p = p; }
        public async listVMs(z: string): Promise<VmInstance[]> {
            return new Promise(r => setTimeout(() => r([{id:'1', name:'vm-1', zone: z, status:'RUNNING'}]), 600));
        }
        public async listBuckets(): Promise<StorageBucket[]> {
            return new Promise(r => setTimeout(() => r([{id:'b-1', name:'my-bucket', location:'US-CENTRAL1'}]), 400));
        }
    }
  }
}

for(let i = 0; i < 2000; i++){
    const svcIdx = Math.floor(Math.random() * S_DATA.length);
    const actIdx = Math.floor(Math.random() * A_TPL.length);
    const s = S_DATA[svcIdx];
    const t = A_TPL[actIdx];
    const nm = `Extra action ${i}: ${t.replace("{n}", s.n)}`;
    const id = `extra-${i}-${s.n.toLowerCase().replace(/\s/g, "-")}`;
    allSvcCmds.push(createAction({
        id, name: nm, keywords: `extra ${s.n}`, section: `${s.n} Extras`,
        perform: () => window.open(`https://${CITI_URL_BASE}/portal/${s.d}`),
    }));
}

const CatHdr = React.forwardRef<HTMLDivElement, { t: string }>(
  ({ t }, r) => (
    <div
      ref={r}
      className="flex flex-row items-center gap-2 px-4 pb-3 pt-5 text-sm font-medium text-gray-25"
    >
      {glyphMap[t] && (
        <Icon
          iconName={glyphMap[t]}
          className="fill-gray-25"
          color="currentColor"
          size="s"
        />
      )}
      {t}
    </div>
  ),
);

interface ActnItmProps {
  a: ActionImpl;
}

const ActnItm = React.forwardRef(
  ({ a }: ActnItmProps, r: React.Ref<HTMLDivElement>) => (
    <div
      ref={r}
      className="font-regular ml-6 items-center px-4 py-3 text-sm text-gray-25"
    >
      {a.name}
    </div>
  ),
);

export function fmtAcctSrchCmds(
  d: ReconciliationTableQuery | undefined,
): (string | Action)[] {
  const cmds: (string | Action)[] = ["Accts"];

  if (d) {
    const es = d?.balancesFeedInternalAccountsRoma?.edges;
    es.forEach(({ node: n }) => {
      const { bestName: bn, path: p } = n;
      const cmd = createAction({
        name: bn,
        section: "Accts",
        perform: () => {
          window.location.pathname = p;
          trackEvent(null, QUICK_SWITCH.QUICK_SWITCH_SEARCHED, {
            type: QryMode.STATIC,
            action: `nav_acct_view`,
          });
        },
      });
      cmds.push(cmd);
    });
  }

  return cmds;
}

export function fmtGenObjSrchCmds(
  d: GenericObjectSearchQuery | undefined,
): (string | Action)[] {
  const cmds: (string | Action)[] = ["Nav"];

  if (d && d?.genericObjectSearch && d?.genericObjectSearch?.path) {
    const gos = d?.genericObjectSearch;
    const { title: t, path: p, objectClass: oc } = gos;
    const oid = p?.split("/").pop();
    const cmdName = `${oc ?? ""}: ${t ?? ""}`;

    const evtAct = `nav_${oc?.toLowerCase() ?? ""}_from_id_search`;

    const cmd = createAction({
      name: cmdName,
      subtitle: oid,
      section: "Nav",
      perform: () => {
        window.location.pathname = p ?? "";
        trackEvent(null, QUICK_SWITCH.QUICK_SWITCH_SEARCHED, {
          type: QryMode.BY_UID,
          action: evtAct,
        });
      },
    });
    cmds.push(cmd);
  }

  return cmds;
}

function NullResState() {
  return (
    <div className="flex h-48 w-full flex-col items-center justify-center gap-2">
      <span className="text-gray-25">No results found for your query.</span>
      <span className="button-background-primary hover:button-background-primary-hover font-bold">
        <a href={`mailto:support@${CITI_URL_BASE}?subject=OmniSwitch Suggestion!`}>
          Suggest a new command
        </a>
      </span>
    </div>
  );
}

function GlobalIDLocator({ uid }: { uid: string }) {
  const { results: r } = useMatches();
  const { query: q } = useKBar();
  const { queryValue: v } = useKBar((s) => ({
    queryValue: s.searchQuery,
  }));

  const [findObj, { data: d, loading: l }] = useGenericObjectSearchLazyQuery();

  const srch = util_debounce_fn(async (st: string) => {
    await findObj({
      variables: {
        query: st,
      },
    });
  }, 400);

  useEffect(() => {
    void srch(uid);
    return () => srch.cancel();
  }, [uid, srch, v]);

  useEffect(() => {
    const fmtCmds = fmtGenObjSrchCmds(d);
    q.registerActions(fmtCmds as Action[]);
  }, [q, d]);

  if (l || !d) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <ClipLoader color="white" />
      </div>
    );
  }

  if (!l && !d?.genericObjectSearch) {
    return <NullResState />;
  }

  return (
    <KBarResults
      items={r}
      onRender={({ item: i, active: a }) =>
        typeof i === "string" ? (
          <CatHdr t={i} />
        ) : (
          <div
            className={util_join_str(
              `flex w-full cursor-pointer hover:bg-gray-700`,
              a && "bg-gray-700",
            )}
          >
            <ActnItm a={i} />
          </div>
        )
      }
    />
  );
}

function FinanceLedgerLocator() {
  const { results: r } = useMatches();
  const { query: q } = useKBar();
  const { queryValue: v } = useKBar((s) => ({
    queryValue: s.searchQuery,
  }));

  const [fetchAccts, { data: d, loading: l }] = useReconciliationTableLazyQuery();

  const srch = util_debounce_fn(async (st: string) => {
    await fetchAccts({
      variables: {
        accountSearchName: st,
      },
    });
  }, 400);

  useEffect(() => {
    void srch(v);

    if (Number.isNaN(Number(v))) {
      trackEvent(null, QUICK_SWITCH.QUICK_SWITCH_SEARCHED, {
        type: QryMode.DYNMC,
        action: v,
      });
    }

    return () => srch.cancel();
  }, [srch, v]);

  useEffect(() => {
    const fmtCmds = fmtAcctSrchCmds(d);
    q.registerActions(fmtCmds as Action[]);
  }, [q, d]);

  if (l || !d) {
    return (
      <div className="flex h-48 w-full items-center justify-center text-gray-25">
        <ClipLoader color="currentColor" />
      </div>
    );
  }

  if (!l && r.length === 0) {
    return <NullResState />;
  }
  
  return (
    <KBarResults
      items={r}
      onRender={({ item: i, active: a }) =>
        typeof i === "string" ? (
          <CatHdr t={i} />
        ) : (
          <div
            className={util_join_str(
              `flex w-full cursor-pointer hover:bg-gray-700`,
              a && "bg-gray-700",
            )}
          >
            <ActnItm a={i} />
          </div>
        )
      }
    />
  );
}

export default function OmniSwitch() {
  const { results: r } = useMatches();
  const { query: q } = useKBar();
  const { queryValue: v } = useKBar((s) => ({
    queryValue: s.searchQuery,
  }));

  useEffect(() => {
    q.registerActions(allSvcCmds);
  },[q]);
  
  if (!v.trim() || r.length > 0) {
      return (
        <KBarResults
          items={r}
          maxHeight={400}
          onRender={({ item: i, active: a }) =>
            typeof i === "string" ? (
              <CatHdr t={i} />
            ) : (
              <div
                className={util_join_str(
                  `flex w-full cursor-pointer`,
                  a && "bg-gray-700",
                )}
              >
                <ActnItm a={i} />
              </div>
            )
          }
        />
      );
  }
  
  const u = extractUID(v);
  if (u) {
    return <GlobalIDLocator uid={u} />;
  }

  return <FinanceLedgerLocator />;
}