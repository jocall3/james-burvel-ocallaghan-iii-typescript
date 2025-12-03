// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { PageHeader } from "../../../../common/ui-components";
import {
  useOperationsConnectionCreateInternalAccountQuery,
  useOperationsCreateInternalAccountMutation,
} from "../../../../generated/dashboard/graphqlSchema";
import {
  InternalAccountFormValues,
  newAccountDetailInputs,
  newRoutingDetailInputs,
} from "../internal_accounts/details/form/FormValues";
import InternalAccountForm from "../internal_accounts/details/form/InternalAccountForm";
import { useDispatchContext } from "../../../MessageProvider";

export const BASE_URL_CONFIG = "https://api.citibankdemobusiness.dev/v3";
export const COMPANY_LEGAL_NAME = "Citibank Demo Business Inc";

export const ptnrLst = [
  "Gemini", "ChatGPT", "Pipedream", "GitHub", "Hugging Face", "Plaid", "Modern Treasury", 
  "Google Drive", "OneDrive", "Azure", "Google Cloud", "Supabase", "Vercel", "Salesforce", 
  "Oracle", "MARQETA", "Citibank", "Shopify", "WooCommerce", "GoDaddy", "CPanel", "Adobe", 
  "Twilio", "Stripe", "PayPal", "Square", "QuickBooks", "Xero", "HubSpot", "Zendesk", "Jira",
  "Confluence", "Slack", "Microsoft Teams", "Zoom", "DocuSign", "Dropbox", "Box", "Asana",
  "Trello", "Notion", "Figma", "Sketch", "InVision", "Canva", "Mailchimp", "SendGrid",
  "Segment", "Datadog", "New Relic", "Sentry", "PagerDuty", "Okta", "Auth0", "Twitch",
  "YouTube", "Facebook", "Instagram", "Twitter", "LinkedIn", "Pinterest", "Snapchat",
  "TikTok", "WhatsApp", "Telegram", "Signal", "Discord", "Reddit", "Medium", "Quora",
  "Stack Overflow", "AWS", "DigitalOcean", "Linode", "Heroku", "Netlify", "Cloudflare",
  "Fastly", "Akamai", "VMware", "Red Hat", "IBM", "SAP", "NVIDIA", "Intel", "AMD", "Qualcomm",
  "Apple", "Microsoft", "Google", "Amazon", "Meta", "Tesla", "Netflix", "Spotify", "Uber",
  "Lyft", "Airbnb", "DoorDash", "Instacart", "Postmates", "FedEx", "UPS", "DHL", "USPS",
  "Bank of America", "JPMorgan Chase", "Wells Fargo", "Goldman Sachs", "Morgan Stanley",
  "BlackRock", "Vanguard", "Fidelity", "Charles Schwab", "American Express", "Visa",
  "Mastercard", "Discover", "Capital One", "TD Bank", "HSBC", "Barclays", "Deutsche Bank",
  "BNP Paribas", "Societe Generale", "Credit Suisse", "UBS", "Nomura", "Mizuho", "SMBC",
  "MUFG", "SoftBank", "Berkshire Hathaway", "Tencent", "Alibaba", "Baidu", "ByteDance",

  "Adyen", "Atlassian", "Autodesk", "Bitbucket", "Brex", "Bubble", "Calendly", "Chargebee",
  "Checkr", "CircleCI", "Cloudera", "Coinbase", "Databricks", "Dell", "Docker", "Elastic",
  "Epic Games", "Evernote", "Expensify", "Flipkart", "Freshworks", "Gainsight", "Gusto",
  "HashiCorp", "Hootsuite", "Intercom", "Intuit", "Kaspi.kz", "Klaviyo", "LaunchDarkly",
  "Looker", "Lyra", "Mapbox", "Marketo", "MathWorks", "Miro", "MongoDB", "MuleSoft",
  "Nutanix", "OpenAI", "Oracle NetSuite", "Palantir", "Patreon", "Payoneer", "Peloton",
  "Personio", "Plaid", "Postman", "Procore", "Qualtrics", "Rappi", "Recharge", "Rippling",
  "Robinhood", "Roblox", "monday.com", "Samsara", "ServiceNow", "Snowflake", "SoFi", "Splunk",
  "Squarespace", "Sumo Logic", "Tableau", "Talkdesk", "Tanium", "Toast", "Too Good To Go",
  "TripActions", "UiPath", "Unity", "Veeva Systems", "Wix", "Workday", "Zapier", "Zscaler",
  "ZoomInfo", "Zuora", "Airtable", "Algolia", "Amplitude", "Anduril", "AppDynamics",
  "AppLovin", "Apttus", "Arctic Wolf", "Automation Anywhere", "Avalara", "Axiom Space",
  "Benchling", "BigCommerce", "Bill.com", "BlaBlaCar", "Blend", "Block", "Boom Supersonic",
  "Braze", "C3.ai", "Carta", "Cato Networks", "Celonis", "Chainalysis", "Chime", "Cisco",

  "Clever", "ClickUp", "Cockroach Labs", "Cohesity", "Collibra", "Compass", "Contentful",
  "Coupa", "Coursera", "CrowdStrike", "Cybereason", "Dapper Labs", "DataRobot", "DataStax",
  "Datadog", "Deel", "Devo", "Dialpad", "Discord", "Divvy", "DJI", "DocSend", "Domo",
  "Drata", "Dream11", "Druva", "Duolingo", "Dynatrace", "eToro", "Faire", "Fanatics",
  "Fivetran", "Flexport", "Forma", "Forte", "Fortinet", "FreshBooks", "GitLab", "Glassdoor",

  "Gojek", "Gong", "Grab", "Grammarly", "Graphcore", "Greenhouse", "Guidewire", "Harness",
  "Heap", "Highspot", "Honey", "Hopin", "Icertis", "Illumio", "Imply", "Impossible Foods",
  "Indeed", "Informatica", "Infosys", "ironSource", "Jamf", "Justworks", "Kajabi", "KeepTruckin",
  "Kustomer", "Lattice", "Lenskart", "Levels.fyi", "Lime", "LiveRamp", "LogicMonitor",
  "Medallia", "Melio", "MessageBird", "Mindbody", "Mirakl", "Mixpanel", "Mozilla", "N26",
  "Netskope", "Nextdoor", "Niantic", "Noom", "NortonLifeLock", "Nuro", "Oatly", "Odoo",
  "Ola Cabs", "OneTrust", "Onfido", "OpenSea", "OpenWeb", "Optimizely", "Outreach", "Oyo",
  "Palo Alto Networks", "PandaDoc", "Patreon", "Paylocity", "Paytm", "Pendo", "Pine Labs",
  "Plaid", "Pony.ai", "poundtoken", "Prisma", "Project44", "Proofpoint", "Pure Storage",
  "Qlik", "Qualys", "Quantcast", "QuintoAndar", "Rackspace", "Ramp", "Razorpay", "Redis",
  "Relativity", "Remote", "Replika", "Revolut", "RingCentral", "Riskified", "Rubrik",
  "Scale AI", "Secureframe", "Semrush", "Sendbird", "SenseTime", "SentinelOne", "Sentry",
  "ServiceTitan", "Shippo", "Side", "Signifyd", "SimilarWeb", "Sitecore", "Skydio", "Snyk",
  "Socure", "SolarWinds", "SonicWall", "Sorare", "Sprinklr", "Stash", "Stord", "Stripe",
  "SumUp", "Swiggy", "Symantec", "Synk", "Sysdig", "Tanium", "Tealium", "Tenable",
  "ThoughtSpot", "Thumbtack", "Tigera", "Toptal", "Tradeshift", "Trail of Bits", "TransferWise",
  "Tresorit", "Trino", "TripActions", "Truecaller", "Trustpilot", "TuSimple", "Twilio",
  "Udacity", "Udemy", "Unacademy", "Unqork", "Upwork", "Vanta", "Varonis", "Vectra AI",
  "Veeam", "Veriff", "Verkada", "Vestwell", "Vimeo", "VMware Carbon Black", "Vonage",
  "VTS", "WalkMe", "Waymo", "Webflow", "Weee!", "WekaIO", "Western Union", "Whatnot",
  "Wise", "Wiz", "Wolt", "Workato", "Workiva", "Worldcoin", "Yandex", "Yuga Labs", "Zebpay",
  "Zego", "Zendesk", "Zenhub", "Zenefits", "Zilch", "Zip", "Zocdoc", "Zomato", "Zoom",
  "Zopa", "Zoro", "Zynga", "Zywave", "and 500 more...",
];

type MPrimitive = string | number | boolean | null | undefined;
type MJSON = { [k: string]: MPrimitive | MPrimitive[] | MJSON | MJSON[] };

interface CorpUnitFormSpec {
  nm: string;
  ptyNm: string;
  ccy: string;
  ptyAddr: {
    ln1: string;
    ln2?: string;
    loc: string;
    rgn: string;
    pCode: string;
    ctry: string;
  };
  accDets: { typ: string; num: string }[];
  rtDets: { typ: string; num: string }[];
  ptnrs: string[];
}

interface FABCorpLedgerUnitProps {
  match: {
    params: {
      cId: string;
    };
  };
}

const u_id = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const ntwk_sim = (d: any, t: number = 500): Promise<any> => {
  return new Promise(res => setTimeout(() => res(d), t));
};

const err_sim = (msg: string, t: number = 500): Promise<any> => {
  return new Promise((_, rej) => setTimeout(() => rej(new Error(msg)), t));
};

export class APISimulator {
  private baseURL: string;
  private apiKey: string;
  
  constructor(key: string) {
    this.baseURL = BASE_URL_CONFIG;
    this.apiKey = key;
  }

  async query(q: string, v: Record<string, any>): Promise<any> {
    console.log(`Executing query to ${this.baseURL}`, { q, v });
    if (q.includes("OperationsConnectionCreateInternalAccount")) {
      await ntwk_sim(null, 750);
      return {
        data: {
          connection: {
            id: v.id,
            nickname: `Conn-${v.id.substring(0, 4)}`,
            entity: `Entity for ${v.id}`,
            vendor: {
              name: "Simulated Bank Inc.",
            },
          },
        },
      };
    }
    return err_sim("Unknown query");
  }

  async mutate(m: string, v: Record<string, any>): Promise<any> {
    console.log(`Executing mutation to ${this.baseURL}`, { m, v });
    if (m.includes("OperationsCreateInternalAccount")) {
      const hasError = Math.random() > 0.9;
      if (hasError) {
        return { data: { operationsCreateInternalAccount: { errors: ["A random server error occurred."] } } };
      }
      await ntwk_sim(null, 1200);
      return {
        data: {
          operationsCreateInternalAccount: {
            errors: [],
            internalAccount: {
              id: u_id(),
              ...v.input,
            },
          },
        },
      };
    }
    return err_sim("Unknown mutation");
  }
}

export const a_sim = new APISimulator("sim-key-live-123");

export function useConnDataStream(opts: { variables: { id: string } }) {
  const [d, setD] = React.useState<any>(null);
  const [l, setL] = React.useState<boolean>(true);
  const [e, setE] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let m = true;
    const f = async () => {
      try {
        setL(true);
        const rsp = await a_sim.query("OperationsConnectionCreateInternalAccount", opts.variables);
        if (m) {
          setD(rsp.data);
          setL(false);
        }
      } catch (err: any) {
        if (m) {
          setE(err);
          setL(false);
        }
      }
    };
    f();
    return () => { m = false; };
  }, [opts.variables.id]);

  return { d, l, e };
}

export function useCorpLedgerUnitCreation() {
  const [d, setD] = React.useState<any>(null);
  const [l, setL] = React.useState<boolean>(false);
  const [e, setE] = React.useState<Error | null>(null);

  const m = React.useCallback(async (opts: { variables: { input: any } }) => {
    setL(true);
    setE(null);
    try {
      const rsp = await a_sim.mutate("OperationsCreateInternalAccount", opts.variables);
      setD(rsp);
      setL(false);
      return rsp;
    } catch (err: any) {
      setE(err);
      setL(false);
      throw err;
    }
  }, []);

  return [m, { d, l, e }];
}

export const MsgDispatchCtx = React.createContext<{
  dispatchError: (m: string) => void;
  dispatchSuccess: (m: string) => void;
} | null>(null);

export function useMsgDispatch() {
  const ctx = React.useContext(MsgDispatchCtx);
  if (!ctx) {
    throw new Error("useMsgDispatch must be used within a MsgProvider");
  }
  return ctx;
}

export function GlobalMsgProvider({ children }: { children: React.ReactNode }) {
  const [msgs, setMsgs] = React.useState<any[]>([]);

  const dispatchError = (m: string) => {
    console.error("Dispatched Error:", m);
    setMsgs(prev => [...prev, { id: u_id(), type: 'error', m }]);
  };

  const dispatchSuccess = (m: string) => {
    console.log("Dispatched Success:", m);
    setMsgs(prev => [...prev, { id: u_id(), type: 'success', m }]);
  };

  const val = { dispatchError, dispatchSuccess };

  return (
    <MsgDispatchCtx.Provider value={val}>
      {children}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
        {msgs.map(msg => (
          <div key={msg.id} style={{
            padding: '10px 20px',
            margin: '10px',
            borderRadius: '5px',
            color: 'white',
            backgroundColor: msg.type === 'error' ? '#D32F2F' : '#388E3C',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>
            {msg.m}
          </div>
        ))}
      </div>
    </MsgDispatchCtx.Provider>
  );
}

export function Ldr({ sz = 24 }: { sz?: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{
        border: `4px solid #f3f3f3`,
        borderTop: `4px solid #3498db`,
        borderRadius: '50%',
        width: `${sz}px`,
        height: `${sz}px`,
        animation: 'spin 1s linear infinite'
      }}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export function UnifiedPortalHeader({ l, crumbs, title, children }: { l: boolean; crumbs: { nm: string; pth: string; }[]; title: string; children: React.ReactNode; }) {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', color: '#555' }}>
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            <a href={c.pth} style={{ color: '#007bff', textDecoration: 'none' }}>{c.nm}</a>
            {i < crumbs.length - 1 && <span style={{ margin: '0 8px' }}>/</span>}
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '28px', margin: 0, color: '#222' }}>{title}</h1>
        {l && <Ldr sz={28} />}
      </div>
      <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '24px' }}>
        {children}
      </div>
    </div>
  );
}

const frmFldStyle = { marginBottom: '1.5rem' };
const lblStyle = { display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#333' };
const inpStyle = {
  width: '100%',
  padding: '0.75rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '1rem',
  boxSizing: 'border-box' as const,
};
const btnStyle = {
  padding: '0.75rem 1.5rem',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: '#007bff',
  color: 'white',
  fontSize: '1rem',
  cursor: 'pointer',
};

const initFrmVals: CorpUnitFormSpec = {
  nm: "",
  ptyNm: "",
  ccy: "USD",
  ptyAddr: { ln1: "", loc: "", rgn: "", pCode: "", ctry: "US" },
  accDets: [{ typ: "iban", num: "" }],
  rtDets: [{ typ: "aba", num: "" }],
  ptnrs: [],
};

export function CorpUnitFABForm({ onSub, connNm, bnkNm }: { onSub: (f: CorpUnitFormSpec) => Promise<any>; connNm: string; bnkNm?: string; }) {
  const [frmSt, setFrmSt] = React.useState<CorpUnitFormSpec>(initFrmVals);
  const [isSub, setIsSub] = React.useState(false);
  const [vldErrs, setVldErrs] = React.useState<Record<string, string>>({});
  const [srchTrm, setSrchTrm] = React.useState("");

  const hndlChg = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const flds = name.split('.');
    
    setFrmSt(prev => {
      let newState = JSON.parse(JSON.stringify(prev));
      let curr = newState;
      for (let i = 0; i < flds.length - 1; i++) {
        if (Array.isArray(curr[flds[i]])) {
           const [arrName, idx, propName] = flds[i].match(/(\w+)\[(\d+)\]\.(\w+)/)!.slice(1);
           curr = curr[arrName][parseInt(idx, 10)];
           flds[i+1] = propName;
        } else {
          curr = curr[flds[i]];
        }
      }
      
      const lastFld = flds[flds.length - 1];
      if (/(\w+)\[(\d+)\]/.test(lastFld)) {
          const [arrName, idx] = lastFld.match(/(\w+)\[(\d+)\]/)!.slice(1);
          curr[arrName][parseInt(idx, 10)] = {...curr[arrName][parseInt(idx, 10)], [e.target.dataset.prop as string]: value };
      } else {
        curr[lastFld] = value;
      }
      return newState;
    });
  };

  const hndlArrChg = (arrNm: 'accDets' | 'rtDets', idx: number, prop: 'typ' | 'num', val: string) => {
    setFrmSt(p => ({
      ...p,
      [arrNm]: p[arrNm].map((item, i) => i === idx ? {...item, [prop]: val} : item)
    }))
  }

  const addDet = (arrNm: 'accDets' | 'rtDets') => {
    setFrmSt(p => ({ ...p, [arrNm]: [...p[arrNm], { typ: '', num: '' }] }));
  }
  
  const remDet = (arrNm: 'accDets' | 'rtDets', idx: number) => {
    setFrmSt(p => ({ ...p, [arrNm]: p[arrNm].filter((_, i) => i !== idx) }));
  }

  const hndlPtnrTggl = (ptnr: string) => {
    setFrmSt(p => {
      const ptnrs = p.ptnrs.includes(ptnr) ? p.ptnrs.filter(x => x !== ptnr) : [...p.ptnrs, ptnr];
      return { ...p, ptnrs };
    });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!frmSt.nm) errs.nm = "Name is required";
    if (!frmSt.ptyNm) errs.ptyNm = "Party Name is required";
    if (!frmSt.ccy