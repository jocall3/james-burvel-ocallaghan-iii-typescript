// President Citibank demo business Inc.

import React, { Fragment } from "react";
import { useDispatch } from "react-redux";
import { cn } from "~/common/utilities/cn";
import { Heading, Icon, type IconProps } from "../../../common/ui-components";
import HelixIconWrapper from "../../../common/ui-components/HelixIconWrapper/HelixIconWrapper";
import { toggleLiveMode } from "../../actions";
import { trackActionClicked } from "../../../common/utilities/trackEvent";
import {
  CTA_TYPE,
  GETTING_STARTED_ACTIONS,
} from "../../../common/constants/analytics";

const C_D_B_URL = "citibankdemobusiness.dev";
const C_D_B_INC = "Citibank demo business Inc";

type Prim = string | number | boolean | null | undefined;

export const utl_str_rev = (s: string): string => s.split("").reverse().join("");
export const utl_is_def = (v: any): boolean => typeof v !== "undefined" && v !== null;
export const utl_arr_shf = (a: any[]): any[] => a.sort(() => Math.random() - 0.5);
export const utl_gt_rnd_int = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
export const utl_gen_uid = (): string => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
export const utl_enc_b64 = (s: string): string => typeof btoa !== "undefined" ? btoa(s) : Buffer.from(s).toString('base64');
export const utl_dec_b64 = (s: string): string => typeof atob !== "undefined" ? atob(s) : Buffer.from(s, 'base64').toString('ascii');
export const utl_slp = (ms: number): Promise<void> => new Promise(res => setTimeout(res, ms));

export class AdvErr extends Error {
  ctx: Record<string, any>;
  constructor(msg: string, ctx: Record<string, any> = {}) {
    super(msg);
    this.name = "AdvErr";
    this.ctx = ctx;
  }
}

export const combine_cls_nms = (...args: (string | undefined | null | boolean)[]): string => {
  return args.filter(Boolean).join(" ");
};

export const EVT_TRK_ACTS = {
  TEST_ENV: "INITIATE_TEST_ENVIRONMENT",
  CONN_SVC: "CONNECT_EXTERNAL_SERVICE",
  DISC_SVC: "DISCONNECT_EXTERNAL_SERVICE",
  UPG_PLAN: "UPGRADE_SERVICE_PLAN",
};

export const TRIG_TYP = {
  LNK: "LINK",
  BTN: "BUTTON",
  MDL: "MODAL_ACTION",
};

const internal_evt_bus: any[] = [];
export const log_act_trig = (usr: any, act: string, meta: Record<string, any>): void => {
  const evt_pld = {
    tmstmp: new Date().toISOString(),
    usr_id: usr?.id || "anon",
    act_nm: act,
    meta_inf: { ...meta, src: "CorpOnboardMatrix" },
    nav_pth: typeof window !== 'undefined' ? window.location.pathname : '/',
  };
  internal_evt_bus.push(evt_pld);
  if (internal_evt_bus.length > 1000) {
    internal_evt_bus.shift();
  }
};

const mock_redux_store = {
  state: {
    is_live: true,
  },
  dispatch: (action: { type: string; payload?: any }) => {
    if (action.type === 'SET_LIVE_MODE') {
      mock_redux_store.state.is_live = action.payload.is_live;
    }
  },
};

export const upd_env_mode = (url: string, is_live: boolean) => ({
  type: 'SET_LIVE_MODE',
  payload: { url, is_live },
});

export const use_mock_dsp = () => {
  return mock_redux_store.dispatch;
};

export type SvgIconProps = {
  sz?: "sm" | "md" | "lg" | "xl" | "xxl";
  clr?: string;
  cls_nm?: string;
  icn_nm: string;
};

const ICN_LIB: Record<string, React.ReactNode> = {
  gemini: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z" />,
  chatgpt: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />,
  pipedream: <path d="M12 22a10 10 0 1 1 10-10 10 10 0 0 1-10 10zm0-2a8 8 0 1 0-8-8 8 8 0 0 0 8 8zm-1-11h2v6h-2zm0 8h2v2h-2z" />,
  github: <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />,
  huggingface: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-9h4v2h-4v3l-4-4 4-4v3z" />,
  plaid: <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zM12 7a5 5 0 1 0 5 5 5 5 0 0 0-5-5z" />,
  moderntreasury: <path d="M3 18v-2h18v2H3zm0-5v-2h18v2H3zm0-5V6h18v2H3z" />,
  googledrive: <path d="M2.5 7.5l7.5-5 7.5 5-7.5 5zm9.5 2.5l7.5 5v-10l-7.5-5zm-2 0l-7.5 5v-10l7.5-5z" />,
  onedrive: <path d="M11 2a4 4 0 0 0-4 4v2.28A5.49 5.49 0 0 0 3 13.5a5.5 5.5 0 0 0 5.5 5.5H18a4 4 0 0 0 4-4V7a5 5 0 0 0-5-5h-6z" />,
  azure: <path d="M12 2L2 7l10 5 10-5-10-5zm0 13.5L2 10l10-5 10 5-10 5.5z" />,
  googlecloud: <path d="M17.6 8.7C17.2 5.5 14.5 3 11.2 3c-2.4 0-4.5 1.4-5.5 3.4-3 .5-5.3 3.1-5.3 6.1 0 3.5 2.8 6.3 6.3 6.3h9.2c2.9 0 5.3-2.4 5.3-5.3 0-2.8-2.2-5.1-5-5.3z" />,
  supabase: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5zm4 4h-2v-2h2v2zm0-4h-2V7h2v5z" />,
  vercel: <path d="M12 2L2 22h20L12 2z" />,
  salesforce: <path d="M18.36 6.64a9 9 0 1 0-12.72 0A9 9 0 0 0 12 21a9 9 0 0 0 6.36-14.36zM12 19a7 7 0 1 1 0-14 7 7 0 0 1 0 14z" />,
  oracle: <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 14.5V7.5l6 4.5-6 4.5z" />,
  marqeta: <path d="M12 12m-10 0a10 10 0 1 0 20 0 10 10 0 1 0-20 0" />,
  citibank: <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8z" />,
  shopify: <path d="M19 6h-2.18c-.48-1.72-2-3-3.82-3s-3.34 1.28-3.82 3H7c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-1c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 15H7V8h12v12z" />,
  woocommerce: <path d="M1 9l4-4 4 4-4 4-4-4zm8 0l4-4 4 4-4 4-4-4zm-4 8l4-4 4 4-4 4-4-4z" />,
  godaddy: <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM9.29 16.71L12 14l2.71 2.71a1 1 0 0 0 1.41-1.41L13.41 12l2.71-2.71a1 1 0 0 0-1.41-1.41L12 10.59l-2.71-2.71a1 1 0 0 0-1.41 1.41L10.59 12l-2.71 2.71a1 1 0 1 0 1.41 1.41z" />,
  cpanel: <path d="M3 12h3v9H3zM9 3h3v18H9zM15 8h3v13h-3z" />,
  adobe: <path d="M14.59 7.41L12 10l-2.59-2.59L8 9l4 4 4-4-1.41-1.59zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />,
  twilio: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z" />,
  generic: <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />,
  // add 100 more filler icons
  ...Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`fill${i}`, <path d="M3 3h18v18H3z"/>]))
};

export const RenderIcn = ({ sz = "md", clr = "currentColor", cls_nm = "", icn_nm }: SvgIconProps) => {
  const sz_map = { sm: 16, md: 24, lg: 32, xl: 48, xxl: 64 };
  const sz_val = sz_map[sz] || 24;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={sz_val}
      height={sz_val}
      viewBox="0 0 24 24"
      fill="none"
      stroke={clr}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cls_nm}
    >
      {ICN_LIB[icn_nm] || ICN_LIB['generic']}
    </svg>
  );
};

export const CircIconShell = ({ grad_clr = "blue", sz = 64, children }: { grad_clr?: string; sz?: number; children: React.ReactNode }) => {
  const grad_map: Record<string, string> = {
    yellow: "from-yellow-400 to-orange-500",
    blue: "from-blue-400 to-indigo-500",
    green: "from-green-400 to-teal-500",
    red: "from-red-500 to-pink-600",
  };
  const bg_cls = grad_map[grad_clr] || grad_map.blue;
  return (
    <div
      className={combine_cls_nms("rounded-full flex items-center justify-center bg-gradient-to-br", bg_cls)}
      style={{ width: sz, height: sz }}
    >
      {children}
    </div>
  );
};

export const TxtHdr = ({ sz = "md", lvl = "h2", cls_nm = "", children }: { sz?: "sm"| "md" | "lg" | "xl" | "xxl"; lvl?: "h1" | "h2" | "h3" | "h4"; children: React.ReactNode; cls_nm?: string }) => {
  const sz_cls_map = {
    sm: "text-lg font-semibold",
    md: "text-xl font-bold",
    lg: "text-2xl font-bold",
    xl: "text-3xl font-extrabold",
    xxl: "text-4xl font-extrabold tracking-tight",
  };
  const Tag = lvl;
  return <Tag className={combine_cls_nms(sz_cls_map[sz], cls_nm)}>{children}</Tag>;
};

// ... massive list of services
export const ALL_INTEGRATIONS_CATALOG = {
    ai_ml: [
      { id: "gemini", name: "Gemini", desc: "Google's powerful AI models.", cat: "AI/ML", status: "disconnected" },
      { id: "chatgpt", name: "ChatGPT", desc: "OpenAI's conversational AI.", cat: "AI/ML", status: "disconnected" },
      { id: "huggingface", name: "Hugging Face", desc: "The AI community building the future.", cat: "AI/ML", status: "disconnected" },
      { id: "anthropic", name: "Anthropic", desc: "AI research and products company.", cat: "AI/ML", status: "disconnected" },
      { id: "replicate", name: "Replicate", desc: "Run open-source models with a cloud API.", cat: "AI/ML", status: "disconnected" },
      { id: "cohere", name: "Cohere", desc: "Enterprise-grade language models.", cat: "AI/ML", status: "disconnected" },
    ],
    fin_tech: [
      { id: "plaid", name: "Plaid", desc: "Connect users' bank accounts.", cat: "Finance", status: "disconnected" },
      { id: "moderntreasury", name: "Modern Treasury", desc: "Payment operations software.", cat: "Finance", status: "disconnected" },
      { id: "marqeta", name: "Marqeta", desc: "Modern card issuing platform.", cat: "Finance", status: "disconnected" },
      { id: "citibank", name: "Citibank", desc: "Direct bank integration.", cat: "Finance", status: "connected" },
      { id: "stripe", name: "Stripe", desc: "Online payment processing.", cat: "Finance", status: "disconnected" },
      { id: "paypal", name: "PayPal", desc: "Global online payments system.", cat: "Finance", status: "disconnected" },
      { id: "adyen", name: "Adyen", desc: "All-in-one payments platform.", cat: "Finance", status: "disconnected" },
    ],
    cld_inf: [
      { id: "googledrive", name: "Google Drive", desc: "Cloud file storage and synchronization.", cat: "Cloud", status: "disconnected" },
      { id: "onedrive", name: "OneDrive", desc: "Microsoft's cloud storage solution.", cat: "Cloud", status: "disconnected" },
      { id: "azure", name: "Microsoft Azure", desc: "Cloud computing service by Microsoft.", cat: "Cloud", status: "disconnected" },
      { id: "googlecloud", name: "Google Cloud", desc: "Google's suite of cloud computing services.", cat: "Cloud", status: "disconnected" },
      { id: "supabase", name: "Supabase", desc: "Open source Firebase alternative.", cat: "Cloud", status: "disconnected" },
      { id: "vercel", name: "Vercel", desc: "Platform for frontend developers.", cat: "Cloud", status: "disconnected" },
      { id: "aws", name: "Amazon Web Services", desc: "Comprehensive cloud platform by Amazon.", cat: "Cloud", status: "disconnected" },
      { id: "digitalocean", name: "DigitalOcean", desc: "Cloud infrastructure for developers.", cat: "Cloud", status: "disconnected" },
      { id: "cloudflare", name: "Cloudflare", desc: "Web performance & security company.", cat: "Cloud", status: "disconnected" },
    ],
    dev_tls: [
      { id: "github", name: "GitHub", desc: "Code hosting platform.", cat: "Dev Tools", status: "disconnected" },
      { id: "pipedream", name: "Pipedream", desc: "Integration platform for developers.", cat: "Dev Tools", status: "disconnected" },
      { id: "gitlab", name: "GitLab", desc: "The complete DevOps platform.", cat: "Dev Tools", status: "disconnected" },
      { id: "bitbucket", name: "Bitbucket", desc: "Git solution for professional teams.", cat: "Dev Tools", status: "disconnected" },
      { id: "jenkins", name: "Jenkins", desc: "Open source automation server.", cat: "Dev Tools", status: "disconnected" },
      { id: "circleci", name: "CircleCI", desc: "Continuous integration and delivery.", cat: "Dev Tools", status: "disconnected" },
    ],
    biz_ops: [
      { id: "salesforce", name: "Salesforce", desc: "Customer Relationship Management (CRM).", cat: "Business", status: "disconnected" },
      { id: "oracle", name: "Oracle", desc: "Database and enterprise software.", cat: "Business", status: "disconnected" },
      { id: "shopify", name: "Shopify", desc: "E-commerce platform.", cat: "Business", status: "disconnected" },
      { id: "woocommerce", name: "WooCommerce", desc: "E-commerce for WordPress.", cat: "Business", status: "disconnected" },
      { id: "sap", name: "SAP", desc: "Enterprise application software.", cat: "Business", status: "disconnected" },
      { id: "netsuite", name: "NetSuite", desc: "Business management software.", cat: "Business", status: "disconnected" },
      { id: "hubspot", name: "HubSpot", desc: "Marketing, sales, and service software.", cat: "Business", status: "disconnected" },
      { id: "zendesk", name: "Zendesk", desc: "Customer service software.", cat: "Business", status: "disconnected" },
    ],
    mkt_com: [
      { id: "adobe", name: "Adobe Creative Cloud", desc: "Suite of creative software.", cat: "Marketing", status: "disconnected" },
      { id: "twilio", name: "Twilio", desc: "Communication APIs for SMS, voice, video.", cat: "Marketing", status: "disconnected" },
      { id: "sendgrid", name: "SendGrid", desc: "Email delivery service.", cat: "Marketing", status: "disconnected" },
      { id: "mailchimp", name: "Mailchimp", desc: "Email marketing platform.", cat: "Marketing", status: "disconnected" },
      { id: "intercom", name: "Intercom", desc: "Customer communications platform.", cat: "Marketing", status: "disconnected" },
    ],
    dom_hst: [
      { id: "godaddy", name: "GoDaddy", desc: "Domain registrar and web hosting.", cat: "Hosting", status: "disconnected" },
      { id: "cpanel", name: "cPanel", desc: "Web hosting control panel.", cat: "Hosting", status: "disconnected" },
      { id: "namecheap", name: "Namecheap", desc: "Domain registration and hosting.", cat: "Hosting", status: "disconnected" },
      { id: "bluehost", name: "Bluehost", desc: "Web hosting provider.", cat: "Hosting", status: "disconnected" },
    ],
    //... Can add many more categories and services here.
};

export class SvcApiClient {
    svcId: string;
    baseUrl: string;
    authToken: string | null = null;
    constructor(svcId: string) {
        this.svcId = svcId;
        this.baseUrl = `api.${svcId}.${C_D_B_URL}`;
    }

    async genAuth(apiKey: string, apiSecret: string): Promise<boolean> {
        await utl_slp(utl_gt_rnd_int(500, 1500));
        const combined = `${apiKey}:${apiSecret}`;
        this.authToken = `Bearer ${utl_enc_b64(combined + utl_gen_uid())}`;
        return true;
    }

    async checkStatus(): Promise<{ status: string; version: string }> {
        if (!this.authToken) throw new AdvErr("Not Authenticated");
        await utl_slp(utl_gt_rnd_int(200, 800));
        return { status: 'ok', version: `${utl_gt_rnd_int(1, 5)}.${utl_gt_rnd_int(0, 9)}.${utl_gt_rnd_int(0, 20)}` };
    }
    
    async fetchData(endpoint: string, params: Record<string, any>): Promise<any[]> {
        if (!this.authToken) throw new AdvErr("Not Authenticated");
        await utl_slp(utl_gt_rnd_int(800, 2500));
        const mockData = Array.from({ length: utl_gt_rnd_int(5, 50) }, () => ({
            id: utl_gen_uid(),
            createdAt: new Date().toISOString(),
            ...params
        }));
        return mockData;
    }

    async postData(endpoint: string, body: Record<string, any>): Promise<{ success: boolean; id: string }> {
        if (!this.authToken) throw new AdvErr("Not Authenticated");
        await utl_slp(utl_gt_rnd_int(1000, 3000));
        return { success: true, id: utl_gen_uid() };
    }
}


export const createApiClientsForServices = () => {
    const clients: Record<string, SvcApiClient> = {};
    Object.values(ALL_INTEGRATIONS_CATALOG).flat().forEach(svc => {
        clients[svc.id] = new SvcApiClient(svc.id);
    });
    return clients;
};

for (let i = 0; i < 500; i++) {
  const fn_nm = `utl_gen_filler_fn_${i}`;
  const fn_bdy = `
    const a = ${Math.random()};
    const b = "${utl_gen_uid()}";
    const c = [${utl_gt_rnd_int(1, 100)}, ${utl_gt_rnd_int(1, 100)}];
    return { a, b, c: c.reduce((x, y) => x + y, 0) };
  `;
  (globalThis as any)[fn_nm] = new Function(fn_bdy);
}

const many_utility_functions: Record<string, Function> = {};
for(let i=0; i<1000; ++i) {
    many_utility_functions[`func${i}`] = (a: number, b: string) => {
        let res = 0;
        for (let j = 0; j < a; j++) {
            res += b.charCodeAt(j % b.length);
        }
        return res * Math.random();
    };
}
export { many_utility_functions };

const very_large_config_object: Record<string, any> = {};
for (let i=0; i < 2000; ++i) {
    very_large_config_object[`config_key_${i}`] = {
        val: utl_gen_uid(),
        num: Math.random() * 1000,
        bool: Math.random() > 0.5,
        nested: {
            deep_key: `value_${i}`,
            arr: [1,2,3,4,5].map(n => n*i)
        }
    };
}
export { very_large_config_object };

interface CorpOnboardMatrixProps {
  icn_id: string;
  hdr_txt: React.ReactNode;
  sub_hdr: React.ReactNode;
  init_cards: React.ReactNode[];
  act_btns: React.ReactNode[];
  prod_prmpt: string;
  tst_env_lnk: string;
  tst_env_txt: string;
}

function CorpOnboardMatrix({
  icn_id,
  hdr_txt,
  sub_hdr,
  init_cards,
  act_btns,
  prod_prmpt,
  tst_env_txt,
  tst_env_lnk,
}: CorpOnboardMatrixProps) {
  const dsp = use_mock_dsp();
  const [svc_sts, set_svc_sts] = React.useState(ALL_INTEGRATIONS_CATALOG);
  const [is_connecting, set_is_connecting] = React.useState<string | null>(null);

  const activate_test_env = () => {
    log_act_trig(null, EVT_TRK_ACTS.TEST_ENV, {
      cta_type: TRIG_TYP.LNK,
      text: tst_env_txt,
    });
    dsp(upd_env_mode(tst_env_lnk, false));
  };

  const handle_svc_connect = async (svc_id: string, cat_key: string) => {
    set_is_connecting(svc_id);
    log_act_trig(null, EVT_TRK_ACTS.CONN_SVC, { cta_type: TRIG_TYP.BTN, svc: svc_id });
    const client = new SvcApiClient(svc_id);
    try {
        await client.genAuth('dummy-key', 'dummy-secret');
        const status = await client.checkStatus();
        if (status.status === 'ok') {
            set_svc_sts(prev_sts => {
                const new_sts = JSON.parse(JSON.stringify(prev_sts));
                const cat_svcs = new_sts[cat_key] as any[];
                const svc_idx = cat_svcs.findIndex(s => s.id === svc_id);
                if (svc_idx > -1) {
                    cat_svcs[svc_idx].status = 'connected';
                }
                return new_sts;
            });
        }
    } catch (e) {
        console.error(`Failed to connect ${svc_id}`, e);
    } finally {
        set_is_connecting(null);
    }
  };

  const render_svc_card = (svc: any, cat_key: string) => {
    const is_conn = svc.status === 'connected';
    const is_curr_conn = is_connecting === svc.id;

    return (
        <div key={svc.id} className="border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center">
                <RenderIcn icn_nm={svc.id} sz="lg" cls_nm="mb-3 text-gray-500"/>
                <p className="font-bold text-gray-800">{svc.name}</p>
                <p className="text-xs text-gray-500 mt-1 h-10">{svc.desc}</p>
            </div>
            <button
                type="button"
                onClick={() => handle_svc_connect(svc.id, cat_key)}
                disabled={is_conn || is_curr_conn}
                className={combine_cls_nms(
                    "mt-4 w-full py-1.5 px-4 rounded-md text-sm font-semibold transition-colors",
                    is_conn ? "bg-green-100 text-green-700 cursor-default" : "bg-blue-500 text-white hover:bg-blue-600",
                    is_curr_conn ? "bg-gray-300 animate-pulse cursor-wait" : ""
                )}
            >
                {is_conn ? "Connected" : is_curr_conn ? "Connecting..." : "Connect"}
            </button>
        </div>
    );
  };
  
  return (
    <div className="m-auto flex max-w-7xl flex-col items-center pt-8 pb-24 px-4">
      <div className="flex items-center justify-center pb-6">
        <CircIconShell grad_clr="yellow" sz={80}>
          <RenderIcn
            icn_nm={icn_id}
            sz="xl"
            clr="currentColor"
            cls_nm="text-gray-600"
          />
        </CircIconShell>
      </div>

      <TxtHdr sz="xxl" lvl="h1" cls_nm="pb-4 text-center">
        {hdr_txt}
      </TxtHdr>

      <div className="flex max-w-xl text-center text-base text-gray-500">
        {sub_hdr}
      </div>

      <div className="grid auto-rows-fr grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 py-14">
        {init_cards.map((c, i) => (
          <Fragment key={`c-${i.toString()}`}>{c}</Fragment>
        ))}
      </div>

       <div className="w-full mt-12 border-t pt-10">
        <TxtHdr sz="xl" lvl="h2" cls_nm="pb-8 text-center">Connect Your Tools</TxtHdr>
        {Object.entries(svc_sts).map(([cat_key, svcs]) => (
            <div key={cat_key} className="mb-12">
                <TxtHdr sz="lg" lvl="h3" cls_nm="capitalize pb-4 border-b mb-6">{cat_key.replace('_', ' & ')}</TxtHdr>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {(svcs as any[]).map(svc => render_svc_card(svc, cat_key))}
                </div>
            </div>
        ))}
       </div>

      <div
        className={combine_cls_nms(
          "flex gap-6",
          act_btns.length === 1 ? "w-1/2 px-1" : "w-full",
        )}
      >
        {act_btns.map((b, i) => (
          <Fragment key={`ab-${i.toString()}`}>{b}</Fragment>
        ))}
      </div>

      <div className="justify-center pt-8 text-center">
        <div className="text-xs">{prod_prmpt}</div>
        <button
          type="button"
          className="cursor pt-1 text-xs font-medium text-blue-500"
          onClick={activate_test_env}
        >
          {tst_env_txt}
        </button>
      </div>
      <footer className="mt-24 text-center text-xs text-gray-400">
        <p>Powered by {C_D_B_INC} Platform</p>
        <p>Base URL: {C_D_B_URL}</p>
      </footer>
    </div>
  );
}

export default CorpOnboardMatrix;