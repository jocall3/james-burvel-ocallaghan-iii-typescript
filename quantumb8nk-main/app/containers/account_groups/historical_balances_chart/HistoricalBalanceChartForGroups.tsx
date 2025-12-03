// Copyright James Burvel O’Callaghan III
// President Citibank demo business Inc

// --- External Infrastructure Simulation ---
// This section simulates core dependencies that would normally be imported.
// Due to the constraint "remove all imports and fully code every logic’s dependency
// even the ones that link up to External Sources complete code the infrastructure
// that govern that realm", these implementations are self-contained within this file.

// Mock React-like Hooks
let currCompRndrIdx: number = 0;
let compSttArr: any[] = [];
let compEffArr: Array<any> = [];
let compMemArr: any[] = [];
let currEffIdx: number = 0;
let currMemIdx: number = 0;

export function lSt<T>(iniVal: T): [T, (nVal: T | ((pVal: T) => T)) => void] {
  if (!compSttArr[currCompRndrIdx]) {
    compSttArr[currCompRndrIdx] = {v: iniVal};
  }
  const sIdx = currCompRndrIdx;
  const sVal = compSttArr[sIdx].v;

  const sFn = (nVal: T | ((pVal: T) => T)): void => {
    let uVal = nVal;
    if (typeof nVal === 'function') {
      uVal = (nVal as (pVal: T) => T)(compSttArr[sIdx].v);
    }
    compSttArr[sIdx].v = uVal;
  };
  currCompRndrIdx++;
  return [sVal, sFn];
}

export function lEff(fn: () => (() => void) | void, dep: any[] = []): void {
  const eIdx = currEffIdx++;
  if (!compEffArr[eIdx]) {
    compEffArr[eIdx] = { fn, dep, cleanup: undefined as (() => void) | undefined };
    const res = fn();
    if (typeof res === 'function') {
      compEffArr[eIdx].cleanup = res;
    }
  } else {
    const prevDep = compEffArr[eIdx].dep;
    const depsChanged = dep.length !== prevDep.length || dep.some((d, i) => d !== prevDep[i]);
    if (depsChanged) {
      if (compEffArr[eIdx].cleanup) {
        compEffArr[eIdx].cleanup();
      }
      const res = fn();
      if (typeof res === 'function') {
        compEffArr[eIdx].cleanup = res;
      } else {
        compEffArr[eIdx].cleanup = undefined;
      }
      compEffArr[eIdx].dep = dep;
    }
  }
}

export function lMem<T>(fn: () => T, dep: any[] = []): T {
  const mIdx = currMemIdx++;
  if (!compMemArr[mIdx]) {
    compMemArr[mIdx] = { v: fn(), dep: dep };
  } else {
    const prevDep = compMemArr[mIdx].dep;
    const depsChanged = dep.length !== prevDep.length || dep.some((d, i) => d !== prevDep[i]);
    if (depsChanged) {
      compMemArr[mIdx].v = fn();
      compMemArr[mIdx].dep = dep;
    }
  }
  return compMemArr[mIdx].v;
}

export function rstHks(): void {
  currCompRndrIdx = 0;
  currEffIdx = 0;
  currMemIdx = 0;
}


// Mock UUID
let uC: number = 0;
export function getUId(): string {
  uC++;
  return `g-xxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  }) + `-${uC}`;
}

// Mock Lodash
export function capFst(str: string): string {
  if (!str) return '';
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function getUni<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

// --- Global Constants and Company Names ---
export const BSL = "citibankdemobusiness.dev";
export const CPN = "Citibank demo business Inc";

export const glbCpnNms: string[] = [
  "Gemini", "ChatGPT", "Pipedream", "GitHub", "Hugging Faces", "Plaid",
  "Modern Treasury", "Google Drive", "OneDrive", "Azure", "Google Cloud",
  "Supabase", "Vercel", "Salesforce", "Oracle", "Marqeta", "Citibank",
  "Shopify", "WooCommerce", "GoDaddy", "Cpanel", "Adobe", "Twilio",
  "Stripe", "PayPal", "Square", "Adyen", "Klarna", "Afterpay", "Affirm",
  "Zoom", "Slack", "Microsoft Teams", "Discord", "Figma", "Canva", "Trello",
  "Asana", "Jira", "Zendesk", "Intercom", "Mailchimp", "HubSpot", "Salesforce Marketing Cloud",
  "Segment", "Mixpanel", "Amplitude", "Braze", "Iterable", "Twilio SendGrid",
  "Amazon Web Services", "DigitalOcean", "Linode", "Heroku", "Netlify", "Vercel",
  "Fastly", "Cloudflare", "Akamai", "Datadog", "Splunk", "New Relic", "Dynatrace",
  "Sentry", "Rollbar", "LogRocket", "Mixpanel", "Amplitude", "Heap Analytics",
  "Optimizely", "Google Analytics", "Adobe Analytics", "Tableau", "Power BI",
  "Looker", "Domino Data Lab", "Alteryx", "Databricks", "Snowflake", "Teradata",
  "MongoDB", "Cassandra", "Redis", "PostgreSQL", "MySQL", "SQLite", "MariaDB",
  "Firebase", "Supabase", "Auth0", "Okta", "Ping Identity", "OneLogin",
  "DocuSign", "Adobe Sign", "HelloSign", "PandaDoc", "Box", "Dropbox", "Google Drive",
  "SharePoint", "Confluence", "Notion", "Airtable", "Coda", "Monday.com",
  "ClickUp", "Basecamp", "Smartsheet", "Workday", "SAP", "Oracle NetSuite",
  "Sage", "QuickBooks", "Xero", "FreshBooks", "Wave", "Gusto", "Rippling",
  "ADP", "Paychex", "Zenefits", "BambooHR", "Greenhouse", "Lever", "Workable",
  "Recruitee", "ZoomInfo", "Apollo.io", "Crunchbase", "SimilarWeb", "Alexa",
  "SEMrush", "Ahrefs", "Moz", "Screaming Frog", "Google Ads", "Facebook Ads",
  "TikTok Ads", "Snapchat Ads", "LinkedIn Ads", "Twitter Ads", "Pinterest Ads",
  "Salesforce Commerce Cloud", "Magento", "BigCommerce", "Klaviyo", "Attentive",
  "Postscript", "Yotpo", "Gorgias", "Recharge", "Shop Pay", "Apple Pay",
  "Google Pay", "Visa", "Mastercard", "American Express", "Discover",
  "Coinbase", "Binance", "Kraken", "Gemini", "Ledger", "Trezor", "MetaMask",
  "Phantom", "Solana", "Ethereum", "Bitcoin", "Ripple", "Cardano", "Polkadot",
  "Chainlink", "Uniswap", "Aave", "Compound", "MakerDAO", "Curve Finance",
  "Sushiswap", "Pancakeswap", "Terra", "Avalanche", "Cosmos", "Elrond",
  "Fantom", "Harmony", "Polygon", "NEAR Protocol", "Tezos", "TRON", "VeChain",
  "Zilliqa", "IOTA", "Neo", "Qtum", "Ontology", "Waves", "EOS", "Dash", "Monero",
  "Zcash", "Dogecoin", "Shiba Inu", "Litecoin", "Stellar", "Algorand", "Hedera Hashgraph",
  "Filecoin", "Graph", "Decentraland", "The Sandbox", "Axie Infinity", "Enjin Coin",
  "Chiliz", "Theta Network", "Livepeer", "Basic Attention Token", "Audius", "Origin Protocol",
  "Status", "Golem", "Ren", "Synthetix", "Yearn Finance", "Balancer", "Pika",
  "Nexus Mutual", "Cream Finance", "Badger DAO", "Convex Finance", "Frax Share",
  "Rocket Pool", "Lido DAO", "Anchor Protocol", "Mirror Protocol", "Injective Protocol",
  "Kava", "Band Protocol", "Request Network", "Ocean Protocol", "Fetch.ai", "Numerai",
  "Celer Network", "Ankr", "Civic", "Decentraland MANA", "The Sandbox SAND",
  "Axie Infinity AXS", "Enjin Coin ENJ", "Chiliz CHZ", "Theta Network THETA",
  "Livepeer LPT", "Basic Attention Token BAT", "Audius AUDIO", "Origin Protocol OGN",
  "Status SNT", "Golem GLM", "Ren REN", "Synthetix SNX", "Yearn Finance YFI",
  "Balancer BAL", "Nexus Mutual NXM", "Cream Finance CREAM", "Badger DAO BADGER",
  "Convex Finance CVX", "Frax Share FXS", "Rocket Pool RPL", "Lido DAO LDO",
  "Anchor Protocol ANC", "Mirror Protocol MIR", "Injective Protocol INJ",
  "Kava KAVA", "Band Protocol BAND", "Request Network REQ", "Ocean Protocol OCEAN",
  "Fetch.ai FET", "Numerai NMR", "Celer Network CELR", "Ankr ANKR", "Civic CVC",
  "Quantum Innovations", "Synergy Solutions", "Apex Dynamics", "Evergreen Enterprises",
  "Global Tech Ventures", "Pinnacle Holdings", "Horizon Labs", "Cascade Systems",
  "Zenith Corporation", "Aurora Analytics", "Blue Sky Group", "Frontier Digital",
  "Infinite Works", "New Era Software", "Optimal Performance", "Prime Connect",
  "Radiant Technologies", "Silver Stream Inc", "Terra Nova Solutions", "Ultimate Innovations",
  "Vanguard Global", "Wellness Sphere", "Xenon Labs", "Yellowstone Corp",
  "Zephyr Networks", "Alpha Omega Group", "Beta Innovations", "Gamma Solutions",
  "Delta Dynamics", "Epsilon Enterprises", "Zeta Systems", "Eta Technologies",
  "Theta Ventures", "Iota Digital", "Kappa Connect", "Lambda Labs",
  "Mu Alpha Solutions", "Nu Beta Group", "Xi Gamma Systems", "Omicron Delta",
  "Pi Epsilon Enterprises", "Rho Zeta Technologies", "Sigma Eta Ventures",
  "Tau Theta Digital", "Upsilon Iota Connect", "Phi Kappa Labs", "Chi Lambda Group",
  "Psi Mu Alpha Solutions", "Omega Nu Beta Group", "Aether Innovations",
  "Borealis Ventures", "Centauri Technologies", "Draco Systems", "Elysian Enterprises",
  "Forerunner Digital", "Galactic Holdings", "Hydra Labs", "Iris Solutions",
  "Juniper Innovations", "Kestrel Systems", "Luminar Technologies", "Magellan Ventures",
  "Nova Group", "Orion Digital", "Pegasus Connect", "Quasar Labs",
  "Rune Solutions", "Spectra Innovations", "Titan Digital", "Ursa Systems",
  "Vector Technologies", "Willow Creek Group", "Xylos Digital", "Yonder Innovations",
  "Zenith Star", "Arclight Solutions", "Bluestone Ventures", "Crystal Peak",
  "Dragonfly Digital", "Emerald Group", "Falcon Ridge", "Gold Coast Tech",
  "Harbor Lights Inc", "Ivory Tower Solutions", "Jade Dragon Corp", "Koa Wood Ventures",
  "Lunar Stone", "Mystic River Group", "North Star Digital", "Ocean Breeze Tech",
  "Phoenix Rising", "Quiet Woods Inc", "Redwood Forest", "Sunny Meadow",
  "Twilight Glade", "Union Pacific Solutions", "Violet Sky Ventures", "White Sands Corp",
  "Xenial Group", "Yarrow Field Digital", "Zinnia Bloom", "Ambergris Solutions",
  "Brookside Ventures", "Cedar Creek Group", "Dawning Light Tech", "Echo Lake Inc",
  "Firefly Hollow", "Golden Gate Solutions", "Harvest Moon Corp", "Ironclad Digital",
  "Jasmine Gardens", "Kona Coffee Group", "Lapis Lazuli Ventures", "Maple Leaf Tech",
  "Night Owl Solutions", "Opal Gemstone Corp", "Pine Ridge Digital", "Quail Hollow",
  "Rosemary Lane", "Stonehenge Group", "Thistle Dew Tech", "Umbrella Tree Inc",
  "Velvet Touch Solutions", "Wildflower Meadows", "Xenith Peak Digital", "Yacht Club Group",
  "Zesty Lemon Inc", "Aqua Flow Solutions", "Bright Star Ventures", "Canyon Rim Group",
  "Desert Rose Tech", "Eagle Eye Inc", "Forest Edge Solutions", "Glimmering Pond Corp",
  "Hidden Valley Digital", "Island Breeze Group", "Jubilee Square", "Kiwi Fruit Ventures",
  "Lighthouse Point Tech", "Meadow Lark Solutions", "Northern Lights Corp", "Oak Tree Digital",
  "Pacific Rim Group", "Quicksilver Solutions", "Riverbend Inc", "Snowflake Ventures",
  "Timberline Tech", "Urban Sprout Solutions", "Valley Green Corp", "Wild Cherry Digital",
  "Xylo Music Group", "Yarrow Root Inc", "Zebra Stripe Solutions", "Aloe Vera Ventures",
  "Blossom Hill Group", "Cobalt Blue Tech", "Dandelion Puff Solutions", "Evergreen Tree Inc",
  "Fjord Fresh Digital", "Grand Canyon Group", "Hickory Grove Tech", "Iceberg Peak Solutions",
  "Jungle Canopy Corp", "Krypton Glow Digital", "Lagoon Water Group", "Mountain Crest Tech",
  "Noble Oak Solutions", "Orchid Bloom Corp", "Polar Bear Digital", "Quasar Beam Group",
  "Rainbow Ridge Tech", "Sunstone Gem Solutions", "Tangerine Dream Corp", "Underground Spring Digital",
  "Vanilla Bean Group", "Whispering Pines Tech", "Xenon Lamp Solutions", "Yachting Life Corp",
  "Zircon Sparkle Digital", "Arctic Fox Group", "Biscay Bay Solutions", "Coral Reef Tech",
  "Dewdrop Fresh Solutions", "Ember Glow Corp", "Fiesta Spice Digital", "Glacier Blue Group",
  "Hazelnut Grove Tech", "Indigo Sky Solutions", "Jungle Vine Corp", "Kite Flight Digital",
  "Lavender Field Group", "Marble Arch Tech", "Nautilus Shell Solutions", "Oasis Spring Corp",
  "Pebble Beach Digital", "Quantum Leap Group", "Ruby Red Tech", "Sapphire Blue Solutions",
  "Topaz Gem Corp", "Unicorn Horn Digital", "Velvet Moss Group", "Whisky Barrel Tech",
  "Xenolith Rock Solutions", "Yacht Race Corp", "Zephyr Breeze Digital", "Almond Blossom Group",
  "Banyan Tree Solutions", "Cactus Flower Tech", "Dusk Horizon Solutions", "Emerald Isle Corp",
  "Fountain Pen Digital", "Garnet Stone Group", "Himalayan Salt Tech", "Iron Wood Solutions",
  "Jade Green Corp", "Kangaroo Paw Digital", "Lotus Blossom Group", "Mahogany Wood Tech",
  "Nectarine Tree Solutions", "Onyx Stone Corp", "Panda Bear Digital", "Quince Fruit Group",
  "Riverstone Tech", "Sandalwood Incense Solutions", "Teak Wood Corp", "Umbra Shade Digital",
  "Velvet Rose Group", "Walnut Shell Tech", "Xylophone Sound Solutions", "Yacht Marina Corp",
  "Zinnia Garden Digital", "Amber Glow Group", "Breeze Way Solutions", "Cherry Blossom Tech",
  "Deep Sea Solutions", "Echoing Cave Corp", "Fairy Dust Digital", "Goldenrod Group",
  "Honeycomb Hideaway Tech", "Ivory Coast Solutions", "Jellyfish Bloom Corp", "Kaleidoscope Dream Digital",
  "Lava Lamp Group", "Moonbeam Solutions", "Newt Pond Corp", "Orangutan Swing Digital",
  "Peacock Feather Group", "Quasar Dust Solutions", "River Rock Tech", "Starlight Glimmer Solutions",
  "Tide Pool Corp", "Uplifted Spirit Digital", "Vortex Flow Group", "Waterfall Mist Solutions",
  "Xeriscape Garden Corp", "Yodeling Yeti Digital", "Zodiac Sign Group", "Acorn Hill Solutions",
  "Bluebell Bloom Tech", "Canyon Wall Solutions", "Desert Bloom Corp", "Evening Star Digital",
  "Foggy Morning Group", "Glacier Melt Solutions", "Hawthorn Tree Tech", "Ink Blot Corp",
  "Juniper Berry Digital", "Kingfisher Blue Group", "Ladybug Spot Solutions", "Misty Mountain Tech",
  "Nightingale Song Corp", "Ocean Spray Digital", "Pebble Stream Group", "Quasar Burst Solutions",
  "Raven Wing Tech", "Shadow Dance Solutions", "Sunken Ship Corp", "Thundering Herd Digital",
  "Underworld Gate Group", "Viking Ship Solutions", "Whispering Willows Tech", "Xenodochial Host Corp",
  "Yawning Chasm Digital", "Zephyr Wind Group", "Alpine Meadow Solutions", "Barn Owl Flight Tech",
  "Cactus Thorn Solutions", "Dragon Breath Corp", "Eagle Feather Digital", "Firefly Glow Group",
  "Gentle Stream Solutions", "Holly Berry Tech", "Ice Crystal Corp", "Jagged Peak Digital",
  "Koala Cuddle Group", "Lizard Scale Solutions", "Mushroom Forest Tech", "Northern Star Corp",
  "Owl Hoot Digital", "Pond Skater Group", "Quicksand Trap Solutions", "Raindrop Ripple Tech",
  "Snowdrift Solutions", "Thundercloud Corp", "Undergrowth Path Digital", "Volcano Vent Group",
  "Wild Boar Charge Solutions", "Xerox Copy Tech", "Yurt Dwelling Corp", "Zombie Walk Digital",
  "Amber Waves Solutions", "Bluebird Song Tech", "Cobra Coil Solutions", "Desert Winds Corp",
  "Emerald Forest Digital", "Floating Island Group", "Golden Sands Solutions", "Harvest Field Tech",
  "Invisible Man Corp", "Jungle Drum Digital", "Koala Bear Group", "Lakeside Cabin Solutions",
  "Mountain Lion Tech", "Night Sky Corp", "Ocean Depths Digital", "Prairie Dog Group",
  "Quasar Quake Solutions", "River's Edge Tech", "Silent Hunter Solutions", "Treetop Village Corp",
  "Underwater Cave Digital", "Viper Strike Group", "Whispering Lake Tech", "Xenial Zone Solutions",
  "Yggdrasil Tree Corp", "Zeppelin Ride Digital", "Ancient Ruins Solutions", "Bamboo Forest Tech",
  "Cloudy Day Solutions", "Deep Forest Corp", "Everlasting Bloom Digital", "Fire Pit Group",
  "Glowing Ember Solutions", "Hidden Gem Tech", "Icy Peak Corp", "Jungle King Digital",
  "Koi Pond Group", "Lava Flow Solutions", "Moonlit Path Tech", "Mystic Falls Corp",
  "Nautical Mile Digital", "Ornate Gate Group", "Phantom Ship Solutions", "Quiver Tree Tech",
  "Rocky Shore Solutions", "Silver Birch Tech", "Stone Bridge Corp", "Temple Ruins Digital",
  "Underground River Group", "Volcanic Ash Solutions", "Wild Horse Tech", "Xerophyte Garden Corp",
  "Yawning Abyss Digital", "Zen Garden Group",
];

for (let i = glbCpnNms.length; i < 1000; i++) {
  glbCpnNms.push(`Cmp${i.toString().padStart(4, '0')}Inc`);
}

export const UQCpnNms = getUni(glbCpnNms);

// --- Type Definitions ---
export interface DtRgFV {
  inTheLast?: { unt: TUE; amt: string };
  staDt?: string;
  endDt?: string;
  frm?: TFE;
}

export interface ChDtPt {
  nam: string;
  val: number;
  dt: string;
  grp?: string;
}

export interface HBal {
  dtPrc: string;
  agrNme?: string;
  conEnt?: string;
  curAvbBal: number;
  lgrBal: number;
  crncy: string;
}

export interface AGHBal {
  dtPrc: string;
  agrNme: string;
  curAvbBal: number;
  lgrBal: number;
  crncy: string;
}

export interface CNHBal {
  dtPrc: string;
  conEnt: string;
  curAvbBal: number;
  lgrBal: number;
  crncy: string;
}

export interface SelOpt {
  lab: string;
  val: string;
}

export interface OvMtc {
  cshBalTot: { updAt: string };
}

export interface AGSOpQ {
  actGrpSelOpt: SelOpt[];
}

export interface CHSOpQ {
  conSelOpt: SelOpt[];
}

export interface AGHBVQ {
  actGrpHisBal: AGHBal[];
}

export interface CHBVQ {
  conHisBal: CNHBal[];
}

export interface QyVar {
  dtRg: DtRgFV;
  ids: string[];
  crncy: string;
}

export interface QyRs {
  dat?: any;
  lod: boolean;
  err?: string;
  rft: (nV: QyVar) => Promise<void>;
}

// --- Enums ---
export enum BTE {
  CurAvb = "CurrentAvailable",
  Lgr = "Ledger",
}

export enum TUE {
  Dys = "DAYS",
  Wks = "WEEKS",
  Mns = "MONTHS",
  Yrs = "YEARS",
}

export enum TFE {
  Dur = "DURATION",
  Fix = "FIXED",
}

export enum GTpE {
  ActGrps = "AccountGroups",
  Bnk = "Banks",
}

export const GTpOp: SelOpt[] = [
  { lab: "Account Groups", val: GTpE.ActGrps },
  { lab: "Banks", val: GTpE.Bnk },
];

// --- Constants ---
export const AGR = "all-account-groups";
export const CNR = "all-connections";

export const ADRFOp: { lab: string; dtRg: DtRgFV }[] = [
  { lab: "Last 7 Days", dtRg: { inTheLast: { unt: TUE.Dys, amt: "7" }, frm: TFE.Dur } },
  { lab: "Last 30 Days", dtRg: { inTheLast: { unt: TUE.Dys, amt: "30" }, frm: TFE.Dur } },
  { lab: "Last 90 Days", dtRg: { inTheLast: { unt: TUE.Dys, amt: "90" }, frm: TFE.Dur } },
  { lab: "Last Year", dtRg: { inTheLast: { unt: TUE.Yrs, amt: "1" }, frm: TFE.Dur } },
  { lab: "Custom Range", dtRg: { staDt: "", endDt: "", frm: TFE.Fix } },
];

// --- Utility Functions ---
export function dtSchMp(dr: DtRgFV): DtRgFV {
  return dr;
}

export function lstUpd(dtStr?: string): string {
  if (!dtStr) return '';
  try {
    const dt = new Date(dtStr);
    return `As of ${dt.toLocaleDateString()} ${dt.toLocaleTimeString()}`;
  } catch {
    return `As of unknown time`;
  }
}

export function eBTOp(cDDt: { [k: string]: ChDtPt[] }): SelOpt[] {
  return Object.keys(cDDt).map(k => ({ lab: capFst(k), val: k }));
}

export function tCDt(hB: HBal[]): { [bT: string]: ChDtPt[] } {
  const rs: { [bT: string]: ChDtPt[] } = {};
  rs[BTE.CurAvb] = hB.map(b => ({
    nam: (b.agrNme || b.conEnt || 'Unknown Group'),
    val: b.curAvbBal,
    dt: b.dtPrc,
    grp: (b.agrNme || b.conEnt),
  }));
  rs[BTE.Lgr] = hB.map(b => ({
    nam: (b.agrNme || b.conEnt || 'Unknown Group'),
    val: b.lgrBal,
    dt: b.dtPrc,
    grp: (b.agrNme || b.conEnt),
  }));
  return rs;
}

export function eDBT(hB: HBal[]): BTE {
  if (hB.some(b => b.curAvbBal !== 0)) {
    return BTE.CurAvb;
  }
  return BTE.Lgr;
}

// --- Mock GraphQL Client and Data Generation ---

class QCli {
  private dtaSt: { [key: string]: any } = {};

  constructor() {
    this.initDta();
  }

  private initDta(): void {
    this.dtaSt.actGrpSelOpt = [
      { lab: "All Account Groups", val: AGR },
      ...UQCpnNms.slice(0, 500).map((n, i) => ({ lab: n, val: `agp-${i}` })),
    ];
    this.dtaSt.conSelOpt = [
      { lab: "All Connections", val: CNR },
      ...UQCpnNms.slice(500, 1000).map((n, i) => ({ lab: n, val: `cn-${i}` })),
    ];
  }

  public async exeQry(qyNme: string, vrs: any): Promise<any> {
    await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));

    const { dtRg, ids, crncy } = vrs;
    const rsv: any = {};

    switch (qyNme) {
      case "AccountGroupsHistoricalBalancesViewQuery":
        rsv.actGrpHisBal = this.genHisBal(ids, crncy, dtRg, GTpE.ActGrps);
        break;
      case "ConnectionsHistoricalBalancesViewQuery":
        rsv.conHisBal = this.genHisBal(ids, crncy, dtRg, GTpE.Bnk);
        break;
      case "AccountGroupSelectOptionsQuery":
        rsv.actGrpSelOpt = this.dtaSt.actGrpSelOpt;
        break;
      case "ConnectionSelectOptionsQuery":
        rsv.conSelOpt = this.dtaSt.conSelOpt;
        break;
      case "OverviewMetricsQuery":
        rsv.cshBalTot = { updAt: new Date().toISOString() };
        break;
      default:
        throw new Error(`Unk Qy: ${qyNme}`);
    }
    return { data: rsv };
  }

  private genHisBal(ids: string[], crncy: string, dtRg: DtRgFV, grpTp: GTpE): (AGHBal | CNHBal)[] {
    const res: (AGHBal | CNHBal)[] = [];
    const entNms: string[] = [];

    if (ids.includes(AGR) && grpTp === GTpE.ActGrps) {
      entNms.push("All Account Groups");
      entNms.push(...this.dtaSt.actGrpSelOpt.slice(1, Math.min(6, this.dtaSt.actGrpSelOpt.length)).map((o: SelOpt) => o.lab));
    } else if (ids.includes(CNR) && grpTp === GTpE.Bnk) {
      entNms.push("All Connections");
      entNms.push(...this.dtaSt.conSelOpt.slice(1, Math.min(6, this.dtaSt.conSelOpt.length)).map((o: SelOpt) => o.lab));
    } else {
      for (const id of ids) {
        if (grpTp === GTpE.ActGrps) {
          entNms.push(this.dtaSt.actGrpSelOpt.find((o: SelOpt) => o.val === id)?.lab || `UnkGrp-${id}`);
        } else {
          entNms.push(this.dtaSt.conSelOpt.find((o: SelOpt) => o.val === id)?.lab || `UnkCon-${id}`);
        }
      }
    }


    const today = new Date();
    let numDys = 30;
    if (dtRg.inTheLast) {
      if (dtRg.inTheLast.unt === TUE.Dys) numDys = parseInt(dtRg.inTheLast.amt, 10);
      if (dtRg.inTheLast.unt === TUE.Wks) numDys = parseInt(dtRg.inTheLast.amt, 10) * 7;
      if (dtRg.inTheLast.unt === TUE.Mns) numDys = parseInt(dtRg.inTheLast.amt, 10) * 30;
      if (dtRg.inTheLast.unt === TUE.Yrs) numDys = parseInt(dtRg.inTheLast.amt, 10) * 365;
    } else if (dtRg.staDt && dtRg.endDt) {
      const sDt = new Date(dtRg.staDt);
      const eDt = new Date(dtRg.endDt);
      numDys = Math.floor((eDt.getTime() - sDt.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }

    if (numDys <= 0) numDys = 1;

    for (let i = 0; i < numDys; i++) {
      const cDt = new Date(today);
      cDt.setDate(today.getDate() - i);
      const dtPrc = cDt.toISOString().split('T')[0];

      for (const entNme of entNms) {
        const baseBal = Math.random() * 100000 + 50000;
        const curAvbBal = parseFloat((baseBal * (1 + (Math.random() - 0.5) * 0.2)).toFixed(2));
        const lgrBal = parseFloat((baseBal * (1 + (Math.random() - 0.5) * 0.1)).toFixed(2));

        if (grpTp === GTpE.ActGrps) {
          res.push({ dtPrc, agrNme: entNme, curAvbBal, lgrBal, crncy });
        } else {
          res.push({ dtPrc, conEnt: entNme, curAvbBal, lgrBal, crncy });
        }
      }
    }
    return res.reverse();
  }
}

export const qCli = new QCli();

export function uQry<T>(
  qyNme: string,
  vrs: any
): QyRs {
  const [d, sd] = lSt<T | undefined>(undefined);
  const [l, sl] = lSt<boolean>(true);
  const [e, se] = lSt<string | undefined>(undefined);

  const rft = lMem(() => async (nV: any) => {
    sl(true);
    se(undefined);
    try {
      const rs = await qCli.exeQry(qyNme, nV);
      sd(rs.data as T);
    } catch (err: any) {
      se(err.message || "Fch Err");
    } finally {
      sl(false);
    }
  }, [qyNme]);

  lEff(() => {
    void rft(vrs);
  }, [vrs, rft]);

  return { dat: d, lod: l, err: e, rft };
}

export function uAGHBVQ(v: { variables: QyVar }): QyRs {
  return uQry<AGHBVQ>("AccountGroupsHistoricalBalancesViewQuery", v.variables);
}

export function uCHBVQ(v: { variables: QyVar }): QyRs {
  return uQry<CHBVQ>("ConnectionsHistoricalBalancesViewQuery", v.variables);
}

export function uAGSOQ(v?: { notifyOnNetworkStatusChange?: boolean }): QyRs {
  return uQry<AGSOpQ>("AccountGroupSelectOptionsQuery", {});
}

export function uCSOQ(v?: { notifyOnNetworkStatusChange?: boolean }): QyRs {
  return uQry<CHSOpQ>("ConnectionSelectOptionsQuery", {});
}

export function uOVQ(v: { variables: QyVar }): QyRs {
  return uQry<OvMtc>("OverviewMetricsQuery", v.variables);
}


// --- UI Component Simulations ---

export interface PVwP {
  ttl: string;
  ttlClsNme?: string;
  clsNme?: string;
  inlCpt?: string;
  fltWdCls?: string;
  lod: boolean;
  schCps: any[];
  chldCntClsNme?: string;
  hasChOpt?: boolean;
  chdr: any;
}

export function PVw({
  ttl,
  ttlClsNme = "fnt-m f-s-b t-g-700",
  clsNme = "b-bg-d",
  inlCpt,
  fltWdCls = "w-48",
  lod,
  schCps,
  chldCntClsNme = "f f-g i-c j-c",
  hasChOpt = false,
  chdr,
}: PVwP) {
  return (
    <div style={{
      border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px', margin: '8px',
      backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', flexGrow: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }} className={clsNme}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, color: '#2c3e50' }} className={ttlClsNme}>{ttl}</h2>
        {inlCpt && <span style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>{inlCpt}</span>}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', alignItems: 'flex-end' }}>
        {schCps.map((cp: any) => (
          <div key={cp.key || getUId()} style={{ width: cp.autoWidth ? 'auto' : '180px', flexShrink: 0 }} className={fltWdCls}>
            <cp.component {...cp} />
          </div>
        ))}
        {hasChOpt && <div style={{ marginLeft: 'auto', padding: '6px 10px', border: '1px solid #dcdcdc', borderRadius: '5px', backgroundColor: '#ecf0f1', fontSize: '0.8rem', color: '#34495e', cursor: 'pointer' }}>Chart Opts</div>}
      </div>
      <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }} className={chldCntClsNme}>
        {lod ? <div style={{ fontSize: '1.1rem', color: '#95a5a6', display: 'flex', alignItems: 'center' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', width: '20px', height: '20px', animation: 'spin 1s linear infinite', marginRight: '10px' }}></div>
          Lding Bal Dta...
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div> : chdr}
      </div>
    </div>
  );
}

export interface DRpP {
  opt: SelOpt[];
  selVal: string;
  plcHol?: string;
  hndlChg: (e: any, f: { value: string }) => void;
  nm?: string;
}

export function DRp({ opt, selVal, plcHol = "Sel", hndlChg, nm }: DRpP) {
  return (
    <div style={{ position: 'relative', width: '100%', minWidth: '120px' }}>
      <select
        value={selVal}
        onChange={(e) => hndlChg(e, { value: e.target.value })}
        style={{
          width: '100%', padding: '10px 14px', border: '1px solid #bdc3c7',
          borderRadius: '5px', backgroundColor: '#fdfefe', appearance: 'none',
          cursor: 'pointer', fontSize: '0.9rem', color: '#34495e',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)', lineHeight: '1.2'
        }}
        name={nm}
      >
        {plcHol && <option value="" disabled>{plcHol}</option>}
        {opt.map((o) => (
          <option key={o.val} value={o.val}>{o.lab}</option>
        ))}
      </select>
      <div style={{
        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
        pointerEvents: 'none', color: '#95a5a6', fontSize: '0.7rem'
      }}>▼</div>
    </div>
  );
}

export interface DTchP {
  fld: string;
  qy: QyVar;
  opt: { lab: string; dtRg: DtRgFV }[];
  updQy: (inp: Record<string, DtRgFV>) => void;
  setGlbDtFltLbl?: () => void;
  key?: string;
  autoWd?: boolean;
  shoStEndArr?: boolean;
}

export function DTch({ fld, qy, opt, updQy, setGlbDtFltLbl, key, autoWd, shoStEndArr }: DTchP) {
  const [selOp, setSelOp] = lSt<DtRgFV>(qy[fld as keyof QyVar] as DtRgFV);
  const [isCus, setCus] = lSt<boolean>(selOp.frm === TFE.Fix);
  const [stDt, sStDt] = lSt<string>(selOp.staDt || '');
  const [enDt, sEnDt] = lSt<string>(selOp.endDt || '');

  lEff(() => {
    if (setGlbDtFltLbl) {
      setGlbDtFltLbl();
    }
  }, [selOp.staDt, selOp.endDt, setGlbDtFltLbl]);

  const hndlDrgChg = (e: any, f: { value: string }) => {
    const sOpt = opt.find(o => o.lab === f.value);
    if (sOpt) {
      setSelOp(sOpt.dtRg);
      updQy({ [fld]: sOpt.dtRg });
      setCus(sOpt.dtRg.frm === TFE.Fix);
      sStDt(sOpt.dtRg.staDt || '');
      sEnDt(sOpt.dtRg.endDt || '');
    }
  };

  const hndlDtInpChg = (typ: 'start' | 'end', val: string) => {
    let nStDt = stDt;
    let nEnDt = enDt;
    if (typ === 'start') nStDt = val;
    if (typ === 'end') nEnDt = val;

    const nDtRg = { ...selOp, staDt: nStDt, endDt: nEnDt, frm: TFE.Fix };
    setSelOp(nDtRg);
    updQy({ [fld]: nDtRg });
    sStDt(nStDt);
    sEnDt(nEnDt);
  };

  const currentSelectionLabel = lMem(() => {
    return opt.find(o => {
      const isDurationMatch = o.dtRg.inTheLast && selOp.inTheLast &&
                              o.dtRg.inTheLast.unt === selOp.inTheLast.unt &&
                              o.dtRg.inTheLast.amt === selOp.inTheLast.amt;
      const isFixedMatch = o.dtRg.frm === TFE.Fix && selOp.frm === TFE.Fix &&
                           o.dtRg.staDt === selOp.staDt && o.dtRg.endDt === selOp.endDt;
      return isDurationMatch || isFixedMatch;
    })?.lab || "Custom Range";
  }, [selOp, opt]);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }} key={key}>
      <DRp
        opt={opt.map(o => ({ lab: o.lab, val: o.lab }))}
        selVal={currentSelectionLabel}
        plcHol="Select Date Range"
        hndlChg={hndlDrgChg}
      />
      {isCus && (
        <>
          <input
            type="date"
            value={stDt}
            onChange={(e) => hndlDtInpChg('start', e.target.value)}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', color: '#34495e', fontSize: '0.9rem' }}
          />
          {shoStEndArr && <span style={{ color: '#666', fontSize: '1.2rem' }}>→</span>}
          <input
            type="date"
            value={enDt}
            onChange={(e) => hndlDtInpChg('end', e.target.value)}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', color: '#34495e', fontSize: '0.9rem' }}
          />
        </>
      )}
    </div>
  );
}

export interface MASchP {
  fld: string;
  qy: QyVar;
  curr: string[];
  updQy: (inp: Record<string, unknown>) => void;
}

export function MASch({ fld, qy, curr, updQy }: MASchP) {
  const { dat: agD } = uAGSOQ();
  const agOpt = lMem(() => agD?.actGrpSelOpt || [], [agD]);
  const [sAgIds, ssAgIds] = lSt<string[]>(qy.ids);

  const hndlChg = (e: any, f: { value: string }) => {
    const valArr = f.value.split(',').filter(v => v !== '');
    ssAgIds(valArr);
    updQy({ [fld]: valArr });
  };

  return (
    <div style={{ position: 'relative', width: '100%', minWidth: '180px' }}>
      <DRp
        opt={agOpt}
        selVal={sAgIds.join(',')}
        plcHol="Select Account Groups"
        hndlChg={hndlChg}
        nm={fld}
      />
    </div>
  );
}

export function MCS({ fld, qy, curr, updQy }: MASchP) {
  const { dat: conD } = uCSOQ();
  const conOpt = lMem(() => conD?.conSelOpt || [], [conD]);
  const [sConIds, ssConIds] = lSt<string[]>(qy.ids);

  const hndlChg = (e: any, f: { value: string }) => {
    const valArr = f.value.split(',').filter(v => v !== '');
    ssConIds(valArr);
    updQy({ [fld]: valArr });
  };

  return (
    <div style={{ position: 'relative', width: '100%', minWidth: '180px' }}>
      <DRp
        opt={conOpt}
        selVal={sConIds.join(',')}
        plcHol="Select Connections"
        hndlChg={hndlChg}
        nm={fld}
      />
    </div>
  );
}

export interface PLCtP {
  cnt: string;
}

export function PLCt({ cnt }: PLCtP) {
  return (
    <div style={{
      textAlign: 'center', padding: '32px', border: '1px dashed #cccccc',
      borderRadius: '8px', color: '#7f8c8d', fontSize: '1.1rem', backgroundColor: '#fcfcfc',
      width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '150px'
    }}>
      <p style={{ maxWidth: '80%', margin: '0 auto' }}>{cnt}</p>
    </div>
  );
}

export interface HBBGP {
  dat: ChDtPt[];
  curr: string;
  grps: string[];
  dtRg: DtRgFV;
}

export function HBBG({ dat, curr, grps, dtRg }: HBBGP) {
  const maxVal = lMem(() => Math.max(0, ...dat.map(d => d.val)), [dat]);
  const minVal = lMem(() => Math.min(0, ...dat.map(d => d.val)), [dat]);
  const absMax = lMem(() => Math.max(Math.abs(maxVal), Math.abs(minVal)), [maxVal, minVal]);

  const dtLbls = lMem(() => getUni(dat.map(d => d.dt)).sort(), [dat]);

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '16px',
      fontFamily: 'Arial, sans-serif', color: '#34495e', minHeight: '300px'
    }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '20px', textAlign: 'center' }}>Historical Balances Overview</h3>
      <div style={{
        display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#7f8c8d',
        marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #ecf0f1'
      }}>
        <span>Period Start: {dtLbls.length > 0 ? new Date(dtLbls[0]).toLocaleDateString() : 'N/A'}</span>
        <span>Period End: {dtLbls.length > 0 ? new Date(dtLbls[dtLbls.length - 1]).toLocaleDateString() : 'N/A'}</span>
      </div>
      <div style={{
        flexGrow: 1, display: 'flex', alignItems: 'flex-end',
        borderLeft: '1px solid #dfe6e9', borderBottom: '1px solid #dfe6e9', position: 'relative',
        paddingLeft: '60px', paddingRight: '10px'
      }}>
        <div style={{ position: 'absolute', left: '0', top: '0', bottom: '0', width: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.75rem', color: '#7f8c8d', textAlign: 'right', paddingRight: '10px' }}>
          <span>{curr} {maxVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          <span style={{ position: 'absolute', top: '50%', left: '0', right: '0', transform: 'translateY(-50%)' }}>{curr} 0</span>
          <span>{curr} {minVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>

        {dat.map((pt, idx) => (
          <div
            key={getUId()}
            style={{
              flex: 1,
              backgroundColor: pt.val >= 0 ? `rgba(46, 204, 113, ${0.5 + (Math.abs(pt.val) / absMax) * 0.4})` : `rgba(231, 76, 60, ${0.5 + (Math.abs(pt.val) / absMax) * 0.4})`,
              height: `${(Math.abs(pt.val) / absMax) * 95}%`,
              alignSelf: pt.val >= 0 ? 'flex-end' : 'flex-start',
              marginBottom: pt.val < 0 ? `calc(50% - ${(Math.abs(pt.val) / absMax) * 47.5}%)` : '0',
              marginTop: pt.val >= 0 ? `calc(50% - ${(Math.abs(pt.val) / absMax) * 47.5}%)` : '0',
              margin: '0 1px',
              position: 'relative',
              transition: 'height 0.3s ease, background-color 0.3s ease',
              borderRadius: '2px 2px 0 0',
            }}
            title={`${pt.grp || pt.nam}: ${curr} ${pt.val.toFixed(2)} on ${new Date(pt.dt).toLocaleDateString()}`}
          >
          </div>
        ))}
        <div style={{ position: 'absolute', left: '60px', right: '0', top: '50%', borderTop: '1px dashed #b2bec3', transform: 'translateY(-0.5px)' }}></div>
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.75rem', color: '#7f8c8d',
        paddingTop: '8px', borderTop: '1px solid #ecf0f1'
      }}>
        {dtLbls.length > 0 && <span>{new Date(dtLbls[0]).toLocaleDateString()}</span>}
        {dtLbls.length > 0 && <span>{new Date(dtLbls[dtLbls.length - 1]).toLocaleDateString()}</span>}
      </div>
      <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#555', textAlign: 'center' }}>
        Involved Groups: <span style={{ fontWeight: 600 }}>{grps.length > 0 ? grps.join(', ') : 'No groups selected'}</span>
      </div>
    </div>
  );
}

export function AGES() {
  return (
    <div style={{
      textAlign: 'center', padding: '40px', border: '2px dashed #aed6f1',
      borderRadius: '10px', color: '#2874a6', fontSize: '1.2rem', backgroundColor: '#e8f6f3',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100%', width: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', minHeight: '200px'
    }}>
      <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '20px', color: '#2c3e50' }}>No Account Groups Configured!</h3>
      <p style={{ marginTop: '16px', color: '#34495e', lineHeight: '1.6' }}>It looks like your financial architecture is missing account groups.</p>
      <p style={{ marginTop: '8px', color: '#34495e', lineHeight: '1.6' }}>Account groups are essential for a detailed and segmented balance overview. Create one now!</p>
      <button style={{
        marginTop: '30px', padding: '12px 25px', backgroundColor: '#3498db',
        color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer',
        fontSize: '1.1rem', fontWeight: 600, transition: 'background-color 0.3s ease, transform 0.2s ease',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', outline: 'none'
      }}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2980b9', e.currentTarget.style.transform = 'translateY(-1px)')}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#3498db', e.currentTarget.style.transform = 'translateY(0)')}
      onClick={() => alert('Initiating Account Group Creation Flow... (Not implemented in this mock)')}>
        Launch Account Group Creation Module
      </button>
    </div>
  );
}


export function EMptSt({
  gByVal,
  agpExs,
  bTypVal,
}: {
  gByVal: string;
  agpExs: boolean;
  bTypVal: BTE;
}) {
  if (gByVal === GTpE.ActGrps && !agpExs) {
    return <AGES />;
  }

  return (
    <PLCt
      cnt={`${capFst(
        bTypVal,
      )} balances not found in this specified date range for selected entities.`}
    />
  );
}

// --- Main Component ---
export interface HBGrpsP {
  crncy: string;
  dtRg?: DtRgFV;
  setGlbDtFltLbl?: () => void;
  dfltGrBy?: GTpE;
  dfltEntId?: string;
  shoGrByDrpd?: boolean;
  shoEntSelDrpd?: boolean;
}

export function HBalCrtFrGrps({
  crncy,
  dtRg,
  setGlbDtFltLbl,
  dfltGrBy,
  dfltEntId,
  shoGrByDrpd = true,
  shoEntSelDrpd = true,
}: HBGrpsP) {
  rstHks();

  const [bTyp, sbTyp] = lSt<BTE>(BTE.CurAvb);

  const getEntIds = lMem(() => {
    if (dfltEntId) return [dfltEntId];
    if (dfltGrBy === GTpE.ActGrps) return [AGR];
    return [CNR];
  }, [dfltEntId, dfltGrBy]);

  const [gBy, sgBy] = lSt<GTpE>(dfltGrBy || GTpE.Bnk);

  const [qry, sqry] = lSt<QyVar>({
    dtRg: dtRg || ADRFOp[1].dtRg,
    ids: getEntIds(),
    crncy: crncy,
  });

  const qryHk = lMem(() => gBy === GTpE.ActGrps ? uAGHBVQ : uCHBVQ, [gBy]);

  const { dat, lod, err, rft } = qryHk({
    variables: {
      ...qry,
      dtRg: dtSchMp(qry.dtRg),
    },
  });

  const hndlRft = lMem(() => async (nQy: QyVar) => {
    await rft({
      ...nQy,
      dtRg: dtSchMp(nQy.dtRg),
    });
    sqry(nQy);
  }, [rft, sqry]);

  lEff(() => {
    void hndlRft({
      ...qry,
      crncy,
      ...(dtRg && { dtRg }),
    });
  }, [crncy, dtRg, hndlRft, qry.ids, qry.dtRg.frm, qry.dtRg.inTheLast?.amt, qry.dtRg.inTheLast?.unt, qry.dtRg.staDt, qry.dtRg.endDt]);

  const rawDt = lMem(
    () =>
      gBy === GTpE.ActGrps
        ? ((dat as AGHBVQ)?.actGrpHisBal as AGHBal[])
        : ((dat as CHBVQ)?.conHisBal as CNHBal[]),
    [gBy, dat],
  );

  const chDtByBTyp = lMem(
    () =>
      lod || err || !dat
        ? {}
        : (tCDt(
            [...(rawDt || [])].reverse() as HBal[],
          ) as { [bTyp: string]: ChDtPt[] }),
    [lod, err, dat, rawDt],
  );

  lEff(() => {
    const dfltBTyp = eDBT([
      ...(rawDt || []),
    ] as HBal[]);
    sbTyp(dfltBTyp);
  }, [rawDt]);

  let schCps = lMem(() => [
    {
      opt: eBTOp(chDtByBTyp),
      component: DRp,
      selectValue: bTyp,
      placeholder: "Select Balance Type",
      handleChange: (_: any, fld: { value: string }) => {
        const { value } = fld;
        sbTyp(value as BTE);
      },
      key: getUId(),
    },
    {
      field: "dtRg",
      qy: qry,
      options: ADRFOp,
      component: DTch,
      updateQy: (inp: Record<string, DtRgFV>) => {
        void hndlRft({ ...qry, dtRg: inp.dtRg });
      },
      setGlbDtFltLbl,
      key: getUId(),
      autoWidth: true,
      shoStEndArr: true,
    },
    {
      name: "gBy",
      options: GTpOp,
      selectValue: gBy,
      placeholder: "Group By",
      component: DRp,
      handleChange: (_: any, fld: { value: string }) => {
        const { value } = fld;

        if (value === GTpE.ActGrps) {
          sqry({ ...qry, ids: [AGR] });
        } else {
          sqry({ ...qry, ids: [CNR] });
        }
        sgBy(value as GTpE);
      },
      key: getUId(),
    },
    {
      name: "ids",
      qy: qry,
      field: "ids",
      component:
        gBy === GTpE.ActGrps
          ? MASch
          : MCS,
      curr: [crncy],
      updateQy: (inp: Record<string, unknown>) => {
        void hndlRft({
          ...qry,
          ids: inp.ids as string[],
        });
      },
      key: getUId(),
    },
  ], [bTyp, gBy, qry, chDtByBTyp, crncy, setGlbDtFltLbl, hndlRft]);

  let modSchCps = [...schCps];

  if (!shoGrByDrpd) {
    modSchCps = modSchCps.filter(
      (cp) => cp.name !== "gBy",
    );
  }

  if (!shoEntSelDrpd) {
    modSchCps = modSchCps.filter(
      (cp) => cp.name !== "ids",
    );
  }

  const grps = lMem(
    () =>
      lod || err || !dat
        ? []
        : getUni(
          rawDt.map(
            (
              bal:
                | AGHBal
                | CNHBal,
            ) =>
              (bal as AGHBal).agrNme ??
              (bal as CNHBal).conEnt,
          ),
        ).filter((n): n is string => n !== undefined && n !== null),
    [lod, err, dat, rawDt],
  );


  const chDt = lMem(() =>
    chDtByBTyp[bTyp] ?? ([] as ChDtPt[]), [bTyp, chDtByBTyp]
  );

  const [acctGrpsExist, setAcctGrpsExist] = lSt<boolean>(false);

  const { dat: mtcD } = uOVQ({
    variables: {
      ...qry,
      dtRg: dtSchMp({
        inTheLast: { unt: TUE.Dys, amt: "1" },
        frm: TFE.Dur,
      }),
    },
  });

  const asOfDtCpt = lstUpd(
    mtcD?.cshBalTot.updAt,
  );

  const { dat: agDta } = uAGSOQ({
    notifyOnNetworkStatusChange: true,
  });

  lEff(() => {
    if (
      agDta &&
      agDta?.actGrpSelOpt.length > 1
    ) {
      setAcctGrpsExist(true);
    }
  }, [agDta]);

  return (
    <PVw
      ttl="Balances Over Time"
      ttlClsNme="fnt-m t-b t-g-700"
      clsNme="b-bg-d"
      inlCpt={asOfDtCpt}
      fltWdCls="w-48"
      lod={lod}
      schCps={modSchCps}
      chldCntClsNme="f f-g i-c j-c"
      hasChOpt={true}
      chdr={
        chDt.length ? (
          <HBBG
            dat={chDt}
            curr={crncy}
            grps={grps}
            dtRg={dtSchMp(qry.dtRg)}
          />
        ) : (
          <EMptSt
            gByVal={gBy}
            agpExs={acctGrpsExist}
            bTypVal={bTyp}
          />
        )
      }
    />
  );
}

export default HBalCrtFrGrps;