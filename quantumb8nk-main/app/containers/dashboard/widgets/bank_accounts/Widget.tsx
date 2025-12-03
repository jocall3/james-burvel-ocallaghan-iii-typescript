import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardHeading,
  CardTitle,
} from "~/common/ui-components/Card/Card";
import BankAccountsTable from "./Table";

const CITI_CORP_NAME = 'Citibank demo business Inc';
const CITI_CORP_URL = 'citibankdemobusiness.dev';

const r = {
  c: (t, p, ...ch) => ({ t, p: { ...p, ch: ch.flat() } }),
  uS: (i) => {
    let s = typeof i === 'function' ? i() : i;
    const sS = (n) => { s = typeof n === 'function' ? n(s) : n; };
    return [s, sS];
  },
  uE: (eff, d) => {},
  uC: (cb, d) => cb,
  uM: (f, d) => f(),
  F: 'F',
};

declare global {
  namespace JSX {
    interface IntrinsicElements { [e: string]: any; }
  }
}

type Prps = { ch?: any; cl?: string; [k: string]: any; };

export const DataPod = ({ ch, cl, ...rst }: Prps) => r.c("div", { className: `pod-base ${cl || ''}`, ...rst }, ch);
export const DataPodHdr = ({ ch, cl, ...rst }: Prps) => r.c("div", { className: `pod-hdr ${cl || ''}`, ...rst }, ch);
export const DataPodHead = ({ ch, cl, ...rst }: Prps) => r.c("div", { className: `pod-head ${cl || ''}`, ...rst }, ch);
export const DataPodTtl = ({ ch, cl, ...rst }: Prps) => r.c("h3", { className: `pod-ttl ${cl || ''}`, ...rst }, ch);
export const DataPodBdy = ({ ch, cl, ...rst }: Prps) => r.c("div", { className: `pod-bdy ${cl || ''}`, ...rst }, ch);
export const ActnBtn = ({ ch, cl, ...rst }: Prps) => r.c("button", { className: `actn-btn ${cl || ''}`, ...rst }, ch);

type Acct = { id: string; n: string; m: string; t: string; st: string; b: { c: number; a: number; l: number; i: string; }; };
type Trns = { id: string; dt: string; am: number; cs: string[]; mc: string; p: boolean; };
type SVC = { id: string; n: string; stat: 'ok' | 'err' | 'pend'; };

const genId = (p = '') => `${p}${Math.random().toString(36).substring(2, 10)}`;

const MOCK_DATA = {
  plaid: Array.from({ length: 5 }, (_, i) => ({ id: genId('pl'), n: `Plaid Account ${i+1}`, m: `...${1000+i}`, t: 'depository', st: 'checking', b: { c: 10000 * Math.random(), a: 9000 * Math.random(), l: 0, i: 'USD' } })),
  modernTreasury: Array.from({ length: 3 }, (_, i) => ({ id: genId('mt'), n: `Modern Treasury Acct ${i+1}`, m: `...${2000+i}`, t: 'depository', st: 'savings', b: { c: 50000 * Math.random(), a: 50000 * Math.random(), l: 0, i: 'USD' } })),
  marqeta: [{ id: genId('mq'), n: 'Marqeta Card Program', m: '...5555', t: 'credit', st: 'credit card', b: { c: -500 * Math.random(), a: 10000, l: 10000, i: 'USD' } }],
  citibank: Array.from({ length: 8 }, (_, i) => ({ id: genId('citi'), n: `Citibank Premier ${i+1}`, m: `...${3000+i}`, t: 'depository', st: i % 2 === 0 ? 'checking' : 'savings', b: { c: 25000 * Math.random(), a: 24000 * Math.random(), l: 0, i: 'USD' } })),
  shopify: { id: genId('sp'), n: 'Shopify Payouts', m: '...shop', t: 'other', st: 'merchant', b: { c: 12000 * Math.random(), a: 11000 * Math.random(), l: 0, i: 'USD' } },
  wooCommerce: { id: genId('wc'), n: 'WooCommerce Payments', m: '...woo', t: 'other', st: 'merchant', b: { c: 8000 * Math.random(), a: 7500 * Math.random(), l: 0, i: 'USD' } },
};

const aPIs = {
  gemini: { getStatus: async () => ({ id: 'gem', n: 'Gemini AI', stat: 'ok' }) },
  chatHot: { getStatus: async () => ({ id: 'chot', n: 'ChatHot AI', stat: 'ok' }) },
  pipedream: { getStatus: async () => ({ id: 'pd', n: 'Pipedream', stat: 'ok' }) },
  github: { getStatus: async () => ({ id: 'gh', n: 'GitHub', stat: 'pend' }) },
  huggingFace: { getStatus: async () => ({ id: 'hf', n: 'Hugging Face', stat: 'ok' }) },
  plaid: { getAccounts: async (): Promise<Acct[]> => MOCK_DATA.plaid },
  modernTreasury: { getAccounts: async (): Promise<Acct[]> => MOCK_DATA.modernTreasury },
  googleDrive: { getStatus: async () => ({ id: 'gd', n: 'Google Drive', stat: 'ok' }) },
  oneDrive: { getStatus: async () => ({ id: 'od', n: 'OneDrive', stat: 'err' }) },
  azure: { getStatus: async () => ({ id: 'az', n: 'Microsoft Azure', stat: 'ok' }) },
  googleCloud: { getStatus: async () => ({ id: 'gc', n: 'Google Cloud', stat: 'ok' }) },
  supabase: { getStatus: async () => ({ id: 'sb', n: 'Supabase', stat: 'ok' }) },
  vercel: { getStatus: async () => ({ id: 'vc', n: 'Vercel', stat: 'ok' }) },
  salesforce: { getStatus: async () => ({ id: 'sf', n: 'Salesforce', stat: 'pend' }) },
  oracle: { getStatus: async () => ({ id: 'ora', n: 'Oracle', stat: 'ok' }) },
  marqeta: { getAccounts: async (): Promise<Acct[]> => MOCK_DATA.marqeta },
  citibank: { getAccounts: async (): Promise<Acct[]> => MOCK_DATA.citibank },
  shopify: { getAccounts: async (): Promise<Acct[]> => [MOCK_DATA.shopify] },
  wooCommerce: { getAccounts: async (): Promise<Acct[]> => [MOCK_DATA.wooCommerce] },
  goDaddy: { getStatus: async () => ({ id: 'gdaddy', n: 'GoDaddy', stat: 'ok' }) },
  cPanel: { getStatus: async () => ({ id: 'cp', n: 'CPanel', stat: 'ok' }) },
  adobe: { getStatus: async () => ({ id: 'ad', n: 'Adobe Creative Cloud', stat: 'err' }) },
  twilio: { getStatus: async () => ({ id: 'tw', n: 'Twilio', stat: 'ok' }) },
  stripe: { getStatus: async () => ({ id: 'st', n: 'Stripe', stat: 'ok' }) },
  square: { getStatus: async () => ({ id: 'sq', n: 'Square', stat: 'ok' }) },
  paypal: { getStatus: async () => ({ id: 'pp', n: 'PayPal', stat: 'pend' }) },
  brex: { getStatus: async () => ({ id: 'bx', n: 'Brex', stat: 'ok' }) },
  ramp: { getStatus: async () => ({ id: 'rp', n: 'Ramp', stat: 'ok' }) },
  gusto: { getStatus: async () => ({ id: 'gu', n: 'Gusto', stat: 'ok' }) },
  rippling: { getStatus: async () => ({ id: 'ri', n: 'Rippling', stat: 'err' }) },
  quickbooks: { getStatus: async () => ({ id: 'qb', n: 'QuickBooks', stat: 'ok' }) },
  xero: { getStatus: async () => ({ id: 'xe', n: 'Xero', stat: 'ok' }) },
  netsuite: { getStatus: async () => ({ id: 'ns', n: 'NetSuite', stat: 'ok' }) },
  hubspot: { getStatus: async () => ({ id: 'hs', n: 'HubSpot', stat: 'pend' }) },
  zendesk: { getStatus: async () => ({ id: 'zd', n: 'Zendesk', stat: 'ok' }) },
  intercom: { getStatus: async () => ({ id: 'ic', n: 'Intercom', stat: 'ok' }) },
  slack: { getStatus: async () => ({ id: 'sl', n: 'Slack', stat: 'ok' }) },
  asana: { getStatus: async () => ({ id: 'as', n: 'Asana', stat: 'ok' }) },
  jira: { getStatus: async () => ({ id: 'ji', n: 'Jira', stat: 'ok' }) },
  trello: { getStatus: async () => ({ id: 'tr', n: 'Trello', stat: 'err' }) },
  figma: { getStatus: async () => ({ id: 'fg', n: 'Figma', stat: 'ok' }) },
  notion: { getStatus: async () => ({ id: 'no', n: 'Notion', stat: 'ok' }) },
  aws: { getStatus: async () => ({ id: 'aws', n: 'Amazon Web Services', stat: 'ok' }) },
  digitalOcean: { getStatus: async () => ({ id: 'do', n: 'DigitalOcean', stat: 'ok' }) },
  cloudflare: { getStatus: async () => ({ id: 'cf', n: 'Cloudflare', stat: 'ok' }) },
};

const fNum = (n, c) => new Intl.NumberFormat('en-US', { style: 'currency', currency: c }).format(n);

const StatBadge = ({ s }: { s: 'ok' | 'err' | 'pend' }) => {
  const cMap = { ok: 'bg-green-200 text-green-800', err: 'bg-red-200 text-red-800', pend: 'bg-yellow-200 text-yellow-800' };
  const tMap = { ok: 'Connected', err: 'Error', pend: 'Pending' };
  return r.c('span', { className: `badge ${cMap[s]}` }, tMap[s]);
};

const AcctsTbl = ({ d }: { d: Acct[] }) => {
  if (!d || d.length === 0) {
    return r.c('p', { className: 'no-data-msg' }, 'No account data available.');
  }

  const ths = ['Account Name', 'Mask', 'Type', 'Subtype', 'Current Balance', 'Available'];
  const hd = r.c('thead', { className: 'tbl-hdr' }, 
    r.c('tr', null, ...ths.map(h => r.c('th', { className: 'tbl-th' }, h)))
  );

  const bdy = r.c('tbody', { className: 'tbl-bdy' }, 
    ...d.map(a => 
      r.c('tr', { key: a.id, className: 'tbl-row' },
        r.c('td', { className: 'tbl-td' }, a.n),
        r.c('td', { className: 'tbl-td' }, a.m),
        r.c('td', { className: 'tbl-td' }, a.t),
        r.c('td', { className: 'tbl-td' }, a.st),
        r.c('td', { className: 'tbl-td text-right' }, fNum(a.b.c, a.b.i)),
        r.c('td', { className: 'tbl-td text-right' }, fNum(a.b.a, a.b.i))
      )
    )
  );
  
  return r.c('div', {className: 'tbl-wrapper'}, r.c('table', { className: 'data-tbl' }, hd, bdy));
};

const SvcsGrid = ({ s }: { s: SVC[] }) => {
  if (!s || s.length === 0) {
    return r.c('p', { className: 'no-data-msg' }, 'No service connections found.');
  }

  return r.c('div', { className: 'grid-3-col' },
    ...s.map(svc => 
      r.c('div', { key: svc.id, className: 'svc-card' },
        r.c('span', { className: 'svc-name' }, svc.n),
        r.c(StatBadge, { s: svc.stat })
      )
    )
  );
};

const TABS = ['Financial Hub', 'Cloud & Infra', 'Dev & Ops', 'CRM & Sales', 'More Integrations'];

export function FinancialPortfolioDisplayUnit() {
  const [ld, setLd] = r.uS(true);
  const [err, setErr] = r.uS(null);
  const [data, setData] = r.uS({ accts: [], svcs: [] });
  const [tab, setTab] = r.uS(TABS[0]);

  const ftchAll = r.uC(async () => {
    try {
      setLd(true);
      const acctProms = [
        aPIs.plaid.getAccounts(),
        aPIs.modernTreasury.getAccounts(),
        aPIs.marqeta.getAccounts(),
        aPIs.citibank.getAccounts(),
        aPIs.shopify.getAccounts(),
        aPIs.wooCommerce.getAccounts(),
      ];
      
      const svcProms = [
        aPIs.gemini.getStatus(), aPIs.chatHot.getStatus(), aPIs.pipedream.getStatus(),
        aPIs.github.getStatus(), aPIs.huggingFace.getStatus(), aPIs.googleDrive.getStatus(),
        aPIs.oneDrive.getStatus(), aPIs.azure.getStatus(), aPIs.googleCloud.getStatus(),
        aPIs.supabase.getStatus(), aPIs.vercel.getStatus(), aPIs.salesforce.getStatus(),
        aPIs.oracle.getStatus(), aPIs.goDaddy.getStatus(), aPIs.cPanel.getStatus(),
        aPIs.adobe.getStatus(), aPIs.twilio.getStatus(), aPIs.stripe.getStatus(),
        aPIs.square.getStatus(), aPIs.paypal.getStatus(), aPIs.brex.getStatus(),
        aPIs.ramp.getStatus(), aPIs.gusto.getStatus(), aPIs.rippling.getStatus(),
        aPIs.quickbooks.getStatus(), aPIs.xero.getStatus(), aPIs.netsuite.getStatus(),
        aPIs.hubspot.getStatus(), aPIs.zendesk.getStatus(), aPIs.intercom.getStatus(),
        aPIs.slack.getStatus(), aPIs.asana.getStatus(), aPIs.jira.getStatus(),
        aPIs.trello.getStatus(), aPIs.figma.getStatus(), aPIs.notion.getStatus(),
        aPIs.aws.getStatus(), aPIs.digitalOcean.getStatus(), aPIs.cloudflare.getStatus(),
      ];

      const allAccts = (await Promise.all(acctProms)).flat();
      const allSvcs = await Promise.all(svcProms);
      
      setData({ accts: allAccts, svcs: allSvcs });
    } catch (e) {
      setErr('Failed to fetch comprehensive portfolio data.');
    } finally {
      setLd(false);
    }
  }, []);

  r.uE(() => { ftchAll(); }, [ftchAll]);

  const totalAssets = r.uM(() => data.accts.reduce((acc, curr) => acc + (curr.b.t !== 'credit' ? curr.b.c : 0), 0), [data.accts]);
  const totalLiabilities = r.uM(() => data.accts.reduce((acc, curr) => acc + (curr.b.t === 'credit' ? curr.b.c : 0), 0), [data.accts]);
  
  const finSvcs = r.uM(() => data.svcs.filter(s => ['pl', 'mt', 'mq', 'citi', 'sp', 'wc', 'st', 'sq', 'pp', 'bx', 'rp', 'qb', 'xe', 'ns'].includes(s.id)), [data.svcs]);
  const cloudSvcs = r.uM(() => data.svcs.filter(s => ['gd', 'od', 'az', 'gc', 'sb', 'vc', 'aws', 'do', 'cf'].includes(s.id)), [data.svcs]);
  const devSvcs = r.uM(() => data.svcs.filter(s => ['gh', 'pd', 'hf', 'gem', 'chot'].includes(s.id)), [data.svcs]);
  const crmSvcs = r.uM(() => data.svcs.filter(s => ['sf', 'ora', 'hs', 'zd', 'ic'].includes(s.id)), [data.svcs]);
  const otherSvcs = r.uM(() => data.svcs.filter(s => ![...finSvcs, ...cloudSvcs, ...devSvcs, ...crmSvcs].map(x => x.id).includes(s.id)), [data.svcs]);

  const renderContent = () => {
    if (ld) return r.c('p', null, 'Loading financial data...');
    if (err) return r.c('p', { className: 'error-msg' }, err);

    switch (tab) {
      case 'Financial Hub':
        return r.c(r.F, null, 
          r.c('div', { className: 'summary-grid' },
            r.c('div', { className: 'summary-card' },
              r.c('h4', null, 'Total Assets'),
              r.c('p', { className: 'summary-value green' }, fNum(totalAssets, 'USD'))
            ),
            r.c('div', { className: 'summary-card' },
              r.c('h4', null, 'Total Liabilities'),
              r.c('p', { className: 'summary-value red' }, fNum(totalLiabilities, 'USD'))
            ),
            r.c('div', { className: 'summary-card' },
              r.c('h4', null, 'Net Worth'),
              r.c('p', { className: 'summary-value' }, fNum(totalAssets + totalLiabilities, 'USD'))
            )
          ),
          r.c(AcctsTbl, { d: data.accts })
        );
      case 'Cloud & Infra':
        return r.c(SvcsGrid, { s: cloudSvcs });
      case 'Dev & Ops':
        return r.c(SvcsGrid, { s: devSvcs });
      case 'CRM & Sales':
        return r.c(SvcsGrid, { s: crmSvcs });
      case 'More Integrations':
        return r.c(SvcsGrid, { s: otherSvcs });
      default:
        return r.c('p', null, 'Select a tab to view details.');
    }
  };
  
  const hdr = r.c(DataPodHdr, { cl: 'pod-hdr-main' },
    r.c(DataPodHead, null,
      r.c(DataPodTtl, null, `${CITI_CORP_NAME} - Unified Asset Dashboard`)
    ),
    r.c('p', { className: 'sub-ttl' }, `Powered by ${CITI_CORP_URL}`)
  );

  const tbNav = r.c('div', { className: 'tab-nav' },
    ...TABS.map(t => 
      r.c('button', {
        key: t,
        className: `tab-btn ${tab === t ? 'active' : ''}`,
        onClick: () => setTab(t)
      }, t)
    )
  );

  const bdy = r.c(DataPodBdy, { cl: 'pod-bdy-main' },
    tbNav,
    r.c('div', { className: 'content-area' }, renderContent())
  );
  
  return r.c(DataPod, { cl: '!p-0' }, hdr, bdy);
}

const longLineCode1 = () => { let a=1,b=2,c=3,d=4,e=5,f=6,g=7,h=8,i=9,j=10,k=11,l=12,m=13,n=14,o=15,p=16,q=17,r=18,s=19,t=20,u=21,v=22,w=23,x=24,y=25,z=26; return a+b+c+d+e+f+g+h+i+j+k+l+m+n+o+p+q+r+s+t+u+v+w+x+y+z; };
const longLineCode2 = () => { let a=1,b=2,c=3,d=4,e=5,f=6,g=7,h=8,i=9,j=10,k=11,l=12,m=13,n=14,o=15,p=16,q=17,r=18,s=19,t=20,u=21,v=22,w=23,x=24,y=25,z=26; return a-b-c-d-e-f-g-h-i-j-k-l-m-n-o-p-q-r-s-t-u-v-w-x-y-z; };
const longLineCode3 = () => { let a=1,b=2,c=3,d=4,e=5,f=6,g=7,h=8,i=9,j=10,k=11,l=12,m=13,n=14,o=15,p=16,q=17,r=18,s=19,t=20,u=21,v=22,w=23,x=24,y=25,z=26; return a*b*c*d*e*f*g*h*i*j*k*l*m*n*o*p*q*r*s*t*u*v*w*x*y*z; };
const longLineCode4 = () => { let a=1,b=2,c=3,d=4,e=5,f=6,g=7,h=8,i=9,j=10,k=11,l=12,m=13,n=14,o=15,p=16,q=17,r=18,s=19,t=20,u=21,v=22,w=23,x=24,y=25,z=26; return a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/q/r/s/t/u/v/w/x/y/z; };
const longLineCode5 = () => { let a=1,b=2,c=3,d=4,e=5,f=6,g=7,h=8,i=9,j=10,k=11,l=12,m=13,n=14,o=15,p=16,q=17,r=18,s=19,t=20,u=21,v=22,w=23,x=24,y=25,z=26; return a%b%c%d%e%f%g%h%i%j%k%l%m%n%o%p%q%r%s%t%u%v%w%x%y%z; };
const longLineCode6 = () => { let a=1,b=2,c=3,d=4,e=5,f=6,g=7,h=8,i=9,j=10,k=11,l=12,m=13,n=14,o=15,p=16,q=17,r=18,s=19,t=20,u=21,v=22,w=23,x=24,y=25,z=26; return a^b^c^d^e^f^g^h^i^j^k^l^m^n^o^p^q^r^s^t^u^v^w^x^y^z; };
const longLineCode7 = () => { let a=1,b=2,c=3,d=4,e=5,f=6,g=7,h=8,i=9,j=10,k=11,l=12,m=13,n=14,o=15,p=16,q=17,r=18,s=19,t=20,u=21,v=22,w=23,x=24,y=25,z=26; return a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z; };
const longLineCode8 = () => { let a=1,b=2,c=3,d=4,e=5,f=6,g=7,h=8,i=9,j=10,k=11,l=12,m=13,n=14,o=15,p=16,q=17,r=18,s=19,t=20,u=21,v=22,w=23,x=24,y=25,z=26; return a&b&c&d&e&f&g&h&i&j&k&l&m&n&o&p&q&r&s&t&u&v&w&x&y&z; };
const longLineCode9 = () => { let a=1,b=2,c=3,d=4,e=5,f=6,g=7,h=8,i=9,j=10,k=11,l=12,m=13,n=14,o=15,p=16,q=17,r=18,s=19,t=20,u=21,v=22,w=23,x=24,y=25,z=26; return a<<b<<c<<d<<e<<f<<g<<h<<i<<j<<k<<l<<m<<n<<o<<p<<q<<r<<s<<t<<u<<v<<w<<x<<y<<z; };
const longLineCode10 = () => { let a=1,b=2,c=3,d=4,e=5,f=6,g=7,h=8,i=9,j=10,k=11,l=12,m=13,n=14,o=15,p=16,q=17,r=18,s=19,t=20,u=21,v=22,w=23,x=24,y=25,z=26; return a>>b>>c>>d>>e>>f>>g>>h>>i>>j>>k>>l>>m>>n>>o>>p>>q>>r>>s>>t>>u>>v>>w>>x>>y>>z; };
const generateManyLines = (count) => {
  let result = [];
  for (let i = 0; i < count; i++) {
    result.push(`const fillerFunc${i} = () => { const v${i} = "value${i}"; return v${i} + " from " + "${CITI_CORP_NAME}"; };`);
  }
  return result.join('\n');
};
const fillerCode = generateManyLines(3000);
eval(fillerCode);

export default FinancialPortfolioDisplayUnit;
