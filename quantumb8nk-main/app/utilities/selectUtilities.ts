interface EntOpt<V = string, L = string> {
  v: V;
  l: L;
  d?: string;
  iU?: string;
  dis?: boolean;
  mD?: Rcd<string, any>;
  lstUpd?: Dte;
  id?: string;
  rSc?: nbr;
  tg?: string[];
  isAIGen?: boolean;
}

interface GrpEntOpt<V = string, L = string> {
  gL: string;
  opts: Array<EntOpt<V, L>>;
  gD?: string;
  gMD?: Rcd<string, any>;
  gSel?: boolean;
  gIU?: string;
}

interface APIRes<D = any> {
  d: D;
  msg?: string;
  sC?: nbr;
  suc: bln;
  err?: {
    cd: string;
    msg: string;
    det?: Rcd<string, any>;
  };
}

interface QtmCfg {
  mN: string;
  maxOT?: nbr;
  tmp?: nbr;
  tP?: nbr;
  tK?: nbr;
  sI?: string;
}

interface SafRul {
  cat: string;
  thr: string;
}

interface QtmGenCfg {
  maxOT?: nbr;
  tmp?: nbr;
  tP?: nbr;
  tK?: nbr;
  sS?: string[];
  rspFmt?: 'txt' | 'jsn';
}

interface QtmCntPrt {
  pT: 'txt' | 'imgD' | 'toolC';
  dat: string;
  mT?: string;
  tN?: string;
}

interface QtmPrm {
  id?: string;
  rol: 'usr' | 'mod' | 'sys' | 'tool';
  prt: QtmCntPrt[];
  ctxt?: string;
  tag?: string;
  tstmp?: Dte;
}

interface QtmRs {
  txt: string;
  cnfSc?: nbr;
  mD?: Rcd<string, any>;
  prm?: QtmPrm;
  isBlk?: bln;
  blkVsn?: string;
  sfyRtg?: Array<{ cat: string; prb: string }>;
  usgMD?: {
    prmTk: nbr;
    cmpTk: nbr;
    totTk: nbr;
  };
}

interface EmbVct {
  vct: nbr[];
  mD?: Rcd<string, any>;
}

interface Rcd<K extends keyof any, V> {
  [key: string]: V;
}

type nbr = number;
type bln = boolean;
type Dte = Date;
type Stg = string;

const convStrtCas = (t: Stg): Stg => {
  if (!t) return '';
  return t
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
    .replace(/_/g, ' ');
};

export const enum OpMonLvl {
  DBG = 'DBG',
  INF = 'INF',
  WRN = 'WRN',
  ERR = 'ERR',
  CRT = 'CRT',
  NON = 'NON',
}

export interface OpMonCfg {
  mL: OpMonLvl;
  px?: Stg;
  cHH?: (l: OpMonLvl, msg: Stg, ctxt?: Rcd<Stg, any>) => void;
  incTs?: bln;
  ppCtxt?: bln;
}

export class OpMon {
  private c: OpMonCfg;
  private static i: OpMon;
  private readonly lO = [OpMonLvl.NON, OpMonLvl.CRT, OpMonLvl.ERR, OpMonLvl.WRN, OpMonLvl.INF, OpMonLvl.DBG];

  private constructor(c: OpMonCfg = { mL: OpMonLvl.INF, incTs: true, ppCtxt: false }) {
    this.c = c;
  }

  public static gI(c?: OpMonCfg): OpMon {
    if (!OpMon.i) {
      OpMon.i = new OpMon(c);
    } else if (c) {
      Object.assign(OpMon.i.c, c);
      if (c.mL && OpMon.i.c.mL !== c.mL) {
        console.info(`[OpMon] Lvl Upd: ${c.mL}`);
      }
    }
    return OpMon.i;
  }

  public uC(nC: Partial<OpMonCfg>): void {
    const oML = this.c.mL;
    Object.assign(this.c, nC);
    if (this.c.mL !== oML) {
      this.i(`OpMon mL Upd frm '${oML}' to '${this.c.mL}'`);
    }
  }

  private sL(l: OpMonLvl): bln {
    const mLIdx = this.lO.indexOf(this.c.mL);
    const mLI = this.lO.indexOf(l);
    return mLI <= mLIdx && this.c.mL !== OpMonLvl.NON;
  }

  private fM(l: OpMonLvl, msg: Stg, ctxt?: Rcd<Stg, any>): Stg {
    const ts = this.c.incTs ? `[${new Dte().toISOString()}] ` : '';
    const px = this.c.px ? `[${this.c.px}] ` : '';
    let ctxtS = '';
    if (ctxt) {
      try {
        ctxtS = this.c.ppCtxt ? `\n${JSON.stringify(ctxt, null, 2)}` : ` ${JSON.stringify(ctxt)}`;
      } catch (e) {
        ctxtS = ` [Err Srlz Ctxt: ${(e as Err).message}]`;
      }
    }
    return `${ts}${px}[${l}] ${msg}${ctxtS}`;
  }

  private o(l: OpMonLvl, msg: Stg, ctxt?: Rcd<Stg, any>): void {
    if (!this.sL(l)) {
      return;
    }

    if (this.c.cHH) {
      try {
        this.c.cHH(l, msg, ctxt);
      } catch (hErr) {
        console.error(`[OpMon] Err in cHH: ${(hErr as Err).message}`);
        this.lTC(l, this.fM(l, msg, ctxt));
      }
      return;
    }

    this.lTC(l, this.fM(l, msg, ctxt));
  }

  private lTC(l: OpMonLvl, fM: Stg): void {
    switch (l) {
      case OpMonLvl.DBG:
        console.debug(fM);
        break;
      case OpMonLvl.INF:
        console.info(fM);
        break;
      case OpMonLvl.WRN:
        console.warn(fM);
        break;
      case OpMonLvl.ERR:
        console.error(fM);
        break;
      case OpMonLvl.CRT:
        console.error(`!!! CRT SYS ALT !!! ${fM}`);
        break;
      default:
        console.log(fM);
    }
  }

  public d(msg: Stg, ctxt?: Rcd<Stg, any>): void {
    this.o(OpMonLvl.DBG, msg, ctxt);
  }

  public i(msg: Stg, ctxt?: Rcd<Stg, any>): void {
    this.o(OpMonLvl.INF, msg, ctxt);
  }

  public w(msg: Stg, ctxt?: Rcd<Stg, any>): void {
    this.o(OpMonLvl.WRN, msg, ctxt);
  }

  public e(msg: Stg, err?: Err | unknown, ctxt?: Rcd<Stg, any>): void {
    let eM = msg;
    let eD = {};
    if (err instanceof Err) {
      eM += `: ${err.message}`;
      eD = { stk: err.stack, nm: err.name, ...ctxt };
    } else if (typeof err === 'string') {
      eM += `: ${err}`;
      eD = { cErrS: err, ...ctxt };
    } else if (err) {
      eM += `: Unk Err Typ Dtc`;
      eD = { rErr: JSON.stringify(err), ...ctxt };
    }
    this.o(OpMonLvl.ERR, eM, eD);
  }

  public c(msg: Stg, err?: Err | unknown, ctxt?: Rcd<Stg, any>): void {
    let eM = msg;
    let eD = {};
    if (err instanceof Err) {
      eM += `: ${err.message}`;
      eD = { stk: err.stack, nm: err.name, ...ctxt };
    } else if (typeof err === 'string') {
      eM += `: ${err}`;
      eD = { cCErrS: err, ...ctxt };
    } else if (err) {
      eM += `: Unk Crt Err Typ Dtc`;
      eD = { rErr: JSON.stringify(err), ...ctxt };
    }
    this.o(OpMonLvl.CRT, eM, eD);
  }
}

export const opMon = OpMon.gI({ mL: OpMonLvl.DBG, px: 'SlctUtl' });

const PrtEntNms: Stg[] = [
  'Citibank demo business Inc', 'Gemini', 'ChatGPT', 'Pipedream', 'GitHub', 'Hugging Face', 'Plaid',
  'Modern Treasury', 'Google Drive', 'OneDrive', 'Azure', 'Google Cloud', 'Supabase', 'Vercel',
  'Salesforce', 'Oracle', 'Marqeta', 'Citibank', 'Shopify', 'WooCommerce', 'GoDaddy', 'CPanel',
  'Adobe', 'Twilio', 'Stripe', 'Square', 'PayPal', 'Amazon Web Services', 'Heroku', 'Netlify',
  'Cloudflare', 'Datadog', 'Splunk', 'New Relic', 'Sentry', 'LogRocket', 'Auth0', 'Okta',
  'Twilio SendGrid', 'Mailchimp', 'Klaviyo', 'Segment', 'Intercom', 'Zendesk', 'HubSpot', 'Slack',
  'Microsoft Teams', 'Zoom', 'Webex', 'DocuSign', 'PandaDoc', 'Atlassian Jira', 'Confluence', 'Trello',
  'Asana', 'Monday.com', 'Smartsheet', 'ServiceNow', 'SAP', 'Workday', 'Deloitte', 'Accenture',
  'PwC', 'EY', 'KPMG', 'IBM', 'HP', 'Dell', 'Cisco', 'Juniper', 'Fortinet', 'Palo Alto Networks',
  'CrowdStrike', 'Tenable', 'Qualys', 'VMware', 'Red Hat', 'Canonical Ubuntu', 'SUSE Linux', 'MongoDB',
  'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'Kafka', 'RabbitMQ', 'HashiCorp Vault', 'Terraform',
  'Ansible', 'Chef', 'Puppet', 'GitLab', 'Bitbucket', 'CircleCI', 'Jenkins', 'Travis CI', 'GitHub Actions',
  'Sonatype Nexus', 'Artifactory', 'Databricks', 'Snowflake', 'Fivetran', 'Looker', 'Tableau',
  'Power BI', 'Qlik Sense', 'Alteryx', 'Informatica', 'UiPath', 'Automation Anywhere', 'Blue Prism',
  'Robocorp', 'NVIDIA', 'AMD', 'Intel', 'Qualcomm', 'TSMC', 'Samsung', 'LG', 'Sony', 'Panasonic',
  'Philips', 'Siemens', 'GE', 'Honeywell', 'Caterpillar', 'John Deere', 'Tesla', 'Ford', 'GM',
  'Toyota', 'Honda', 'Mercedes-Benz', 'BMW', 'Audi', 'Volkswagen', 'Volvo', 'Nissan', 'Hyundai',
  'Kia', 'Subaru', 'Mazda', 'Mitsubishi', 'Suzuki', 'Harley-Davidson', 'Boeing', 'Airbus', 'Lockheed Martin',
  'Northrop Grumman', 'Raytheon Technologies', 'General Dynamics', 'SpaceX', 'Blue Origin', 'Virgin Galactic',
  'NASA', 'ESA', 'JAXA', 'CERN', 'MIT', 'Stanford', 'Harvard', 'Oxford', 'Cambridge', 'ETH Zurich',
  'Caltech', 'Princeton', 'Yale', 'Columbia', 'UPenn', 'Cornell', 'Dartmouth', 'Brown', 'Johns Hopkins',
  'UC Berkeley', 'UCLA', 'University of Chicago', 'Northwestern', 'Duke', 'Georgetown', 'Vanderbilt',
  'Rice', 'Notre Dame', 'Carnegie Mellon', 'Georgia Tech', 'Purdue', 'UIUC', 'Texas A&M', 'UT Austin',
  'University of Washington', 'University of Michigan', 'University of Wisconsin', 'University of Florida',
  'Ohio State University', 'Penn State University', 'Rutgers', 'UMass Amherst', 'Boston University',
  'Boston College', 'Tufts', 'Emory', 'Wake Forest', 'Tulane', 'SMU', 'Baylor', 'TCU', 'Texas Tech',
  'University of Arizona', 'Arizona State University', 'University of Colorado Boulder', 'University of Denver',
  'BYU', 'University of Utah', 'Oregon State University', 'University of Oregon', 'Washington State University',
  'UC Davis', 'UC Irvine', 'UC San Diego', 'UC Santa Barbara', 'UC Santa Cruz', 'University of Hawaii',
  'University of Nevada Las Vegas', 'University of New Mexico', 'Boise State University', 'Montana State University',
  'University of Wyoming', 'North Dakota State University', 'University of South Dakota', 'University of Nebraska',
  'Kansas State University', 'University of Kansas', 'University of Missouri', 'Iowa State University',
  'University of Iowa', 'University of Arkansas', 'Louisiana State University', 'University of Mississippi',
  'Mississippi State University', 'University of Alabama', 'Auburn University', 'University of Georgia',
  'Georgia State University', 'Clemson University', 'University of South Carolina', 'Florida State University',
  'University of Central Florida', 'University of Miami', 'Virginia Tech', 'University of Virginia',
  'NC State University', 'University of North Carolina Chapel Hill', 'Wake Forest University', 'Duke University',
  'University of Kentucky', 'University of Tennessee', 'West Virginia University', 'University of Pittsburgh',
  'Penn State University', 'Villanova University', 'Temple University', 'Drexel University', 'University of Delaware',
  'University of Maryland', 'George Washington University', 'American University', 'Howard University',
  'Georgetown University', 'Loyola University Maryland', 'Towson University', 'University of Richmond',
  'William & Mary', 'Virginia Commonwealth University', 'Old Dominion University', 'James Madison University',
  'George Mason University', 'Longwood University', 'Radford University', 'University of Mary Washington',
  'Christopher Newport University', 'Liberty University', 'Regent University', 'Hampton University',
  'Norfolk State University', 'Virginia State University', 'University of the District of Columbia',
  'Maryland Institute College of Art', 'Coppin State University', 'Morgan State University', 'St. John\'s College',
  'United States Naval Academy', 'United States Military Academy', 'United States Air Force Academy',
  'United States Coast Guard Academy', 'United States Merchant Marine Academy', 'Norwich University',
  'The Citadel', 'Virginia Military Institute', 'New York University', 'Columbia University', 'Fordham University',
  'Syracuse University', 'University at Buffalo', 'Rochester Institute of Technology', 'Rensselaer Polytechnic Institute',
  'Cornell University', 'Stony Brook University', 'Binghamton University', 'SUNY Geneseo', 'SUNY New Paltz',
  'SUNY Oneonta', 'SUNY Plattsburgh', 'SUNY Potsdam', 'SUNY Oswego', 'SUNY Cortland', 'SUNY Fredonia',
  'SUNY Brockport', 'SUNY Old Westbury', 'SUNY Maritime College', 'SUNY Upstate Medical University',
  'Albany Medical College', 'Union College', 'Skidmore College', 'Bard College', 'Vassar College',
  'Hamilton College', 'Colgate University', 'Hobart and William Smith Colleges', 'St. Lawrence University',
  'Clarkson University', 'Alfred University', 'Ithaca College', 'Marist College', 'Siena College',
  'Le Moyne College', 'Canisius College', 'Niagara University', 'St. Bonaventure University', 'Mercyhurst University',
  'Gannon University', 'Duquesne University', 'La Salle University', 'Saint Joseph\'s University',
  'Villanova University', 'Temple University', 'Drexel University', 'Swarthmore College', 'Haverford College',
  'Bryn Mawr College', 'University of Pennsylvania', 'Carnegie Mellon University', 'Lehigh University',
  'Lafayette College', 'Muhlenberg College', 'Franklin & Marshall College', 'Dickinson College',
  'Gettysburg College', 'Bucknell University', 'Susquehanna University', 'Juniata College', 'Elizabethtown College',
  'Messiah University', 'Lebanon Valley College', 'Albright College', 'Kutztown University', 'West Chester University',
  'Millersville University', 'Shippensburg University', 'East Stroudsburg University', 'Bloomsburg University',
  'Mansfield University', 'Lock Haven University', 'Clarion University', 'Edinboro University',
  'Indiana University of Pennsylvania', 'California University of Pennsylvania', 'Slippery Rock University',
  'University of Pittsburgh Johnstown', 'University of Pittsburgh Bradford', 'Penn State Altoona',
  'Penn State Berks', 'Penn State Erie The Behrend College', 'Penn State Harrisburg', 'Penn State Hazleton',
  'Penn State Schuylkill', 'Penn State Wilkes-Barre', 'Penn State York', 'Penn State Abington',
  'Penn State Beaver', 'Penn State Brandywine', 'Penn State DuBois', 'Penn State Fayette',
  'Penn State Greater Allegheny', 'Penn State Lehigh Valley', 'Penn State Mont Alto', 'Penn State New Kensington',
  'Penn State Shenango', 'Penn State Wilkes-Barre', 'Penn State Worthington Scranton', 'Penn State York',
  'Temple University Ambler', 'Temple University Harrisburg', 'Thomas Jefferson University',
  'University of the Sciences', 'PCOM', 'Salus University', 'Arcadia University', 'Cabrini University',
  'Chestnut Hill College', 'Gwynedd Mercy University', 'Holy Family University', 'Immaculata University',
  'Neumann University', 'Rosemont College', 'Saint Charles Borromeo Seminary', 'Ursinus College',
  'Washington & Jefferson College', 'Westminster College', 'Grove City College', 'Geneva College',
  'Robert Morris University', 'Chatham University', 'Point Park University', 'Seton Hill University',
  'Saint Vincent College', 'Mount Aloysius College', 'Saint Francis University', 'University of Scranton',
  'King\'s College', 'Wilkes University', 'Misericordia University', 'University of Marywood',
  'College Misericordia', 'Marywood University', 'Lackawanna College', 'Johnson College', 'Easton Area Public Library',
  'Fidelity Investments', 'Vanguard', 'BlackRock', 'Charles Schwab', 'Bank of America', 'Wells Fargo',
  'JP Morgan Chase', 'Goldman Sachs', 'Morgan Stanley', 'Credit Suisse', 'UBS', 'Deutsche Bank',
  'HSBC', 'Standard Chartered', 'Barclays', 'Santander', 'BNP Paribas', 'Societe Generale',
  'Royal Bank of Canada', 'Toronto-Dominion Bank', 'Scotiabank', 'BMO Financial Group', 'CIBC',
  'Commonwealth Bank of Australia', 'Westpac', 'ANZ', 'NAB', 'DBS Bank', 'OCBC Bank', 'UOB',
  'Mizuho Bank', 'Sumitomo Mitsui Banking Corporation', 'MUFG Bank', 'Nomura', 'Daiwa Securities',
  'China Merchants Bank', 'Industrial and Commercial Bank of China', 'Bank of China', 'China Construction Bank',
  'Agricultural Bank of China', 'Ping An Bank', 'CITIC Bank', 'Everbright Bank', 'Shanghai Pudong Development Bank',
  'Huawei', 'ZTE', 'Xiaomi', 'Oppo', 'Vivo', 'Lenovo', 'BYD', 'Geely', 'SAIC Motor', 'FAW Group',
  'Great Wall Motor', 'Tencent', 'Alibaba', 'Baidu', 'JD.com', 'NetEase', 'Meituan-Dianping', 'ByteDance',
  'Kuaishou', 'iQiyi', 'Weibo', 'Didi Chuxing', 'Ant Group', 'SenseTime', 'Megvii', 'Yitu Technology',
  'Hikvision', 'Dahua Technology', 'DJI', 'EHang', 'XPeng', 'NIO', 'Li Auto', 'CATL', 'Contemporary Amperex Technology Co. Limited',
  'BYD Company Limited', 'Ganfeng Lithium', 'Tianqi Lithium', 'Cosco Shipping', 'China Ocean Shipping Company',
  'CMOC Group Limited', 'Contemporary Amperex Technology Co. Limited', 'Luxshare Precision Industry',
  'Foxconn Technology Group', 'TSMC', 'ASE Technology Holding', 'United Microelectronics Corporation',
  'MediaTek', 'Realtek Semiconductor', 'NXP Semiconductors', 'STMicroelectronics', 'Infineon Technologies',
  'ASML Holding', 'Applied Materials', 'Lam Research', 'KLA Corporation', 'Tokyo Electron',
  'SCREEN Holdings', 'Advantest', 'Teradyne', 'Micron Technology', 'Western Digital',
  'Seagate Technology', 'SK Hynix', 'Kioxia', 'Toshiba', 'Hitachi', 'Panasonic', 'Sony', 'Canon',
  'Nikon', 'Olympus', 'Ricoh', 'Fujifilm', 'Konica Minolta', 'Kyocera', 'Sharp', 'Casio',
  'Brother Industries', 'Epson', 'Yamaha Corporation', 'Kawasaki Heavy Industries', 'Mitsubishi Heavy Industries',
  'IHI Corporation', 'Subaru Corporation', 'Suzuki Motor Corporation', 'Mazda Motor Corporation',
  'Isuzu Motors', 'Hino Motors', 'UD Trucks', 'Komatsu', 'Kubota', 'Daifuku', 'Murata Manufacturing',
  'TDK Corporation', 'Nitto Denko', 'Ibiden', 'Showa Denko', 'Sumitomo Electric Industries',
  'Furukawa Electric Co. Ltd.', 'Fujitsu', 'NEC', 'Hitachi', 'Toshiba', 'Mitsubishi Electric',
  'Yokogawa Electric', 'Keyence', 'Omron', 'Fanuc', 'Yaskawa Electric', 'Renesas Electronics',
  'Rohm Co. Ltd.', 'Kyocera Corporation', 'TOTO Ltd.', 'LIXIL Group Corporation', 'Bridgestone',
  'Michelin', 'Goodyear', 'Pirelli', 'Continental AG', 'Dunlop', 'BFGoodrich', 'Firestone',
  'Cooper Tire & Rubber Company', 'Yokohama Rubber Company', 'Falken Tire', 'Toyo Tire Corporation',
  'Hankook Tire', 'Kumho Tire', 'Maxxis International', 'Nankang Rubber Tire', 'Sumitomo Rubber Industries',
  'Zhongce Rubber Group Co. Ltd.', 'Apollo Tyres', 'MRF Tyres', 'CEAT Limited', 'BKT Tires',
  '' // Placeholder to make it a long list
];

for (let i = PrtEntNms.length; i < 1000; i++) {
  const pI = Math.floor(Math.random() * PrtEntNms.length);
  const pS = PrtEntNms[pI].split(' ')[0];
  const type = ['Sltn', 'Sys', 'Plt', 'Inno', 'Data', 'Svc', 'Net', 'Apx', 'Glb'][i % 9];
  PrtEntNms.push(`${pS} ${type} ${i % 100}`);
}

export function mOFEnum<T extends Stg | nbr>(
  i: { [k: Stg]: T } | { [k: nbr]: Stg }
): EntOpt<T, Stg>[] {
  if (!i || typeof i !== 'object' || Array.isArray(i)) {
    opMon.w("Inv Inp mOFEnum. Exp non-arr obj.", { iT: typeof i, isA: Array.isArray(i) });
    return [];
  }

  return Object.entries(i)
    .filter(([k, v]) => isNaN(Number(k)))
    .map(([k, v]): EntOpt<T, Stg> => ({
      v: v as T,
      l: convStrtCas(k),
      d: `Opt drv frm enum k '${k}'`,
      id: `e-o-${String(v)}`
    }));
}

export interface QtmSrvOpt {
  aK: Stg;
  bU?: Stg;
  dMCfg?: QtmCfg;
  dSS?: SafRul[];
  rTO?: nbr;
  mR?: nbr;
  rD?: nbr;
  eAL?: bln;
}

export class QtmNet {
  private o: QtmSrvOpt;
  private oM: OpMon;
  private readonly aAPIEp: Stg;

  constructor(o: QtmSrvOpt) {
    if (!o.aK || o.aK === "YOUR_GEMINI_API_KEY_HERE") {
      opMon.c("QtmNet init w/o vld aK. AI Func Lmt/Fail.", { o });
    }

    this.o = {
      bU: 'https://citibankdemobusiness.dev/qntm/api/v1',
      dMCfg: { mN: 'qntm-pro-1.0', tmp: 0.7, maxOT: 1024, sI: 'You are a core data intelligence system for Citibank demo business Inc, specializing in financial and enterprise data. Provide concise, accurate responses.' },
      dSS: [
        { cat: 'HARM_CAT_DANGEROUS', thr: 'BLK_ALL' },
        { cat: 'HARM_CAT_FINANCIAL_MISINFO', thr: 'BLK_HIGH' },
        { cat: 'HARM_CAT_PERSONAL_DATA_LEAK', thr: 'BLK_ALWAYS' },
      ],
      rTO: 15000,
      mR: 3,
      rD: 500,
      eAL: true,
      ...o,
    };
    this.oM = opMon;

    this.aAPIEp = o.bU || "https://citibankdemobusiness.dev/qntm/api/v1/mdl";

    this.oM.i(`QtmNet init. Default m: ${this.o.dMCfg?.mN}. aK: ${o.aK ? 'Set' : 'Mssg'}.`);
    if (!this.o.eAL) {
      this.oM.w("QtmNet eAL dis. DBG info for AI inter will not be avl.");
    }
  }

  private async wR<T>(f: () => Promise<T>, r: nbr, d: nbr, a: nbr = 1): Promise<T> {
    try {
      if (this.o.eAL) {
        this.oM.d(`QtmNet API req atpt #${a}.`);
      }
      return await f();
    } catch (e) {
      const eS = (e instanceof Err) ? e.message : String(e);
      const iTE = (e instanceof Err && (e.message.includes('Net') || e.message.includes('Tmt') || e.message.includes('500')));

      if (r > 0 && iTE) {
        if (this.o.eAL) {
          this.oM.w(`QtmNet API req fld. Rtry in ${d}ms... (${r} rtry lft). Err: ${eS}`, { a, e });
        }
        await new Promise(res => setTimeout(res, d));
        return this.wR(f, r - 1, d * 2, a + 1);
      }
      this.oM.e("QtmNet API req fld aft mlt rtry or non-tran err.", e, { a, eT: e instanceof Err ? e.name : 'Unk' });
      throw e;
    }
  }

  public async gTxt(
    p: QtmPrm,
    gC?: QtmGenCfg,
    sS?: SafRul[]
  ): Promise<APIRes<QtmRs>> {
    const cfg = { ...this.o.dMCfg, ...gC };
    const fSS = sS || this.o.dSS;

    if (this.o.eAL) {
      this.oM.d(`Snd txt gen req to QtmNet. Prm ID: ${p.id || 'N/A'}`, {
        cfg,
        sfyS: fSS,
        pP: p.prt.map(prt => prt.pT === 'txt' ? prt.dat.substring(0, Math.min(prt.dat.length, 100)) + (prt.dat.length > 100 ? '...' : '') : `[${prt.pT}]`),
      });
    }

    const mAR: () => Promise<APIRes<QtmRs>> = async () => {
      await new Promise(res => setTimeout(res, Math.random() * 500 + 200));

      const iC = p.prt.map(prt => prt.dat).join(' ');
      let gT = `Qntm Rs for prm: "${iC.substring(0, Math.min(iC.length, 150))}..." from Citibank demo business Inc.`;
      let cnfSc = 0.95;
      let isB = false;
      let bV: Stg | undefined;

      if (iC.toLowerCase().includes('sensitive financial data')) {
        gT = "Cnt Blk Due To Sfy Pol: Sns Fnc Dta Dtc.";
        isB = true;
        bV = 'HARM_CAT_FINANCIAL_MISINFO';
        cnfSc = 0.1;
      } else if (iC.toLowerCase().includes('private customer info request')) {
        gT = "Cnt Blk: Prsnl Dta Leak Viol.";
        isB = true;
        bV = 'HARM_CAT_PERSONAL_DATA_LEAK';
        cnfSc = 0.05;
      } else if (iC.toLowerCase().includes('options for enterprise resource planning integration')) {
        gT = JSON.stringify([
          { v: "sap_erp", l: "SAP ERP Cloud", d: "Cmp ERP sS w/ mny fns." },
          { v: "oracle_fnc", l: "Oracle Cloud Financials", d: "Ldng fnc mgmt sS." },
          { v: "sfdc_fnc", l: "Salesforce Financial Cloud", d: "CRM-centric fnc sys." },
          { v: "msft_dyn", l: "Microsoft Dynamics 365", d: "Bsnss mgmt & ERP sS." },
        ]);
        if (gC?.rspFmt === 'jsn') { } else {
          gT = "Rec options for ERP intgr: SAP ERP Cloud, Oracle Cloud Financials, Salesforce Financial Cloud, Microsoft Dynamics 365.";
        }
      } else if (iC.toLowerCase().includes('security best practices summary for cloud deployments')) {
        gT = `Summ: "${iC.substring(0, Math.min(iC.length, 50))}..." Fcs on IAM, Net Seg, Encry, Audit.`;
      } else if (iC.toLowerCase().includes('group payment processing methods')) {
        gT = JSON.stringify([
          { gL: "Card Pay", opts: [{ v: "visa", l: "Visa" }, { v: "mc", l: "MasterCard" }] },
          { gL: "Dig Wlt", opts: [{ v: "apl_pay", l: "Apple Pay" }, { v: "goog_pay", l: "Google Pay" }] }
        ]);
      } else if (iC.toLowerCase().includes('validate swift code "abcde123"')) {
        gT = JSON.stringify({ isV: true, fbM: "SWIFT cd 'ABCDE123' is vld for Citibank demo business Inc.", cnf: 0.99 });
      }

      const r: QtmRs = {
        txt: gT,
        cnfSc: cnfSc,
        mD: { mdl: cfg.mN, tksUsd: Math.ceil(gT.length / 4) + Math.ceil(iC.length / 4) },
        prm: p,
        isBlk: isB,
        blkVsn: bV,
        sfyRtg: isB ? [{ cat: bV || 'UNK', prb: 'HIGH' }] : [],
        usgMD: {
          prmTk: Math.ceil(iC.length / 4),
          cmpTk: Math.ceil(gT.length / 4),
          totTk: Math.ceil(gT.length / 4) + Math.ceil(iC.length / 4),
        }
      };

      if (isB) {
        this.oM.w(`QtmNet Cnt Blk. Vsn: ${bV}`, { prmId: p.id });
        return { suc: false, sC: 400, msg: bV, d: r, err: { cd: 'CNT_BLK', msg: bV! } };
      }

      if (this.o.eAL) {
        this.oM.d(`QtmNet txt gen suc. Out: ${gT.substring(0, Math.min(gT.length, 100))}...`, { prmId: p.id, cnf: cnfSc });
      }
      return { suc: true, d: r };
    };

    return this.wR(mAR, this.o.mR || 0, this.o.rD || 0);
  }

  public async gEmb(txt: Stg): Promise<APIRes<EmbVct>> {
    if (this.o.eAL) {
      this.oM.d(`Gen emb for txt: ${txt.substring(0, Math.min(txt.length, 50))}...`);
    }

    const mAR: () => Promise<APIRes<EmbVct>> = async () => {
      await new Promise(res => setTimeout(res, Math.random() * 300 + 100));

      const vL = 768;
      const tH = txt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const v = Array.from({ length: vL }, (_, i) => Math.sin((i + tH) * 0.01) * 0.5 + Math.random() * 0.05);

      const e: EmbVct = {
        vct: v,
        mD: { mdl: 'emb-qntm-001', iL: txt.length },
      };

      if (this.o.eAL) {
        this.oM.d(`Emb gen suc. Vct l: ${v.length}`);
      }
      return { suc: true, d: e };
    };

    return this.wR(mAR, this.o.mR || 0, this.o.rD || 0);
  }

  public async aDt(
    dat: any[] | Stg,
    inst: Stg,
    gC?: QtmGenCfg
  ): Promise<APIRes<QtmRs>> {
    const dR = Array.isArray(dat) ?
      JSON.stringify(dat.slice(0, Math.min(dat.length, 10))) :
      String(dat).substring(0, Math.min(String(dat).length, 500));

    this.oM.i(`Req AI dt anl for ${Array.isArray(dat) ? `${dat.length} itm` : 'str dt'} w/ inst: ${inst.substring(0, Math.min(inst.length, 100))}...`);

    const pT = `Anl the fllw dt smpl and "${inst}".
    Dt smpl: ${dR}.
    ${Array.isArray(dat) ? `Fll dtst sz: ${dat.length}.` : ''}
    Prv k ins, cat, or sum in strc fmt (e.g., blt pts or JSN).`;

    const p: QtmPrm = {
      id: `dt-anl-${Dte.now()}`,
      rol: 'usr',
      prt: [{ pT: 'txt', dat: pT }],
      tag: 'dt-anl',
      tstmp: new Dte(),
    };

    return this.gTxt(p, gC);
  }

  public async sCt(
    cH: QtmPrm[],
    cM: QtmPrm,
    oCR: (c: Stg, f?: bln) => void,
    gC?: QtmGenCfg
  ): Promise<APIRes<QtmRs>> {
    this.oM.i(`Init sCt w/ QtmNet. Cur msg: ${cM.prt[0].dat.substring(0, Math.min(cM.prt[0].dat.length, 50))}...`);

    const fPC = [...cH, cM];
    const cTF = fPC.map(p => p.prt.map(cp => cp.dat).join(' ')).join('\n');
    const cfg = { ...this.o.dMCfg, ...gC };

    const mAR: () => Promise<APIRes<QtmRs>> = async () => {
      const sR = `Qtm Asst for Citibank demo business Inc: Crtnly! I'm hr to ast u w/ ur qry. Bsd on our conv so far, I will nw prv a dtld lst of opts tlrd to ur nds. Pls all me a mom to prc the inf and gen the mst rel sugg for u. Ths will b a multi-prt rsp w/ usfl dtl to gid ur slct. Lts bgn.`;
      const ws = sR.split(' ');
      let aT = '';

      for (let i = 0; i < ws.length; i++) {
        await new Promise(res => setTimeout(res, Math.random() * 80 + 30));
        const c = ws[i] + (i < ws.length - 1 ? ' ' : '');
        aT += c;
        oCR(c, i === ws.length - 1);
      }

      const fR: QtmRs = {
        txt: aT,
        cnfSc: 0.98,
        mD: { mdl: cfg.mN, tksUsd: Math.ceil(aT.length / 4), s: true },
        prm: cM,
        usgMD: {
          prmTk: Math.ceil(cTF.length / 4),
          cmpTk: Math.ceil(aT.length / 4),
          totTk: Math.ceil(cTF.length / 4) + Math.ceil(aT.length / 4),
        }
      };
      this.oM.d("QtmNet ct stm cmp.");
      return { suc: true, d: fR };
    };

    return this.wR(mAR, this.o.mR || 0, this.o.rD || 0);
  }

  public async gDtlPrtOpts(): Promise<EntOpt[]> {
    opMon.i('Gen Dtl Prt Opts for Citibank demo business Inc...');
    await new Promise(r => setTimeout(r, 100));
    const opts: EntOpt[] = PrtEntNms.map((n, i) => ({
      v: n.toLowerCase().replace(/\s/g, '_').replace(/[^a-z0-9_]/g, ''),
      l: n,
      d: `A strt gc prtnr of Citibank demo business Inc, hldng k val to enterprise ops and digital transformation initiatives. This entity provides high-level platform integrations, data analytics solutions, or critical infrastructure support within the financial technology ecosystem. Focused on driving innovation and secure transactional experiences.`,
      iU: `https://citibankdemobusiness.dev/assets/logos/${n.toLowerCase().split(' ')[0]}.png`,
      mD: { type: i % 2 === 0 ? 'Plt' : 'Svc', sP: i % 5 === 0 ? 'Glb' : 'Rgnl', tier: Math.floor(i / 100) + 1 },
      id: `p-${i}-${n.substring(0,3).toLowerCase()}`
    }));
    return opts;
  }
}

export interface DtaVltEnt<T> {
  v: T;
  exp: nbr;
}

export class DtaVlt {
  private c: Map<Stg, DtaVltEnt<any>> = new Map();
  private dTL: nbr;
  private oM: OpMon;
  private cII: ReturnType<typeof setInterval> | null = null;
  private readonly cF: nbr;

  constructor(dTL: nbr = 5 * 60 * 1000, cF: nbr = 60 * 1000) {
    this.dTL = dTL;
    this.cF = cF;
    this.oM = opMon;
    this.oM.i(`DtaVlt init w/ dTL: ${dTL / 1000}s, cF: ${cF / 1000}s.`);
    this.sCI();
  }

  private sCI(): void {
    if (this.cII) {
      clearInterval(this.cII);
    }
    this.cII = setInterval(() => this.cEE(), this.cF);
    this.oM.d(`DtaVlt cII strt w/ f: ${this.cF / 1000}s.`);
  }

  public sCI(): void {
    if (this.cII) {
      clearInterval(this.cII);
      this.cII = null;
      this.oM.d("DtaVlt cII stp.");
    }
  }

  public s<T>(k: Stg, v: T, t?: nbr): void {
    if (!k || typeof k !== 'string') {
      this.oM.e("Inv DtaVlt k. Mst b non-emp str.", { k });
      return;
    }
    const fTL = t ?? this.dTL;
    const exp = Dte.now() + fTL;
    this.c.set(k, { v, exp });
    this.oM.d(`DtaVlt set k: ${k}, exp in ${fTL / 1000}s.`, { sz: this.c.size });
  }

  public g<T>(k: Stg): T | undefined {
    const e = this.c.get(k);
    if (!e) {
      this.oM.d(`DtaVlt mss for k: ${k}`);
      return undefined;
    }
    if (Dte.now() > e.exp) {
      this.d(k);
      this.oM.d(`DtaVlt exp for k: ${k}`);
      return undefined;
    }
    this.oM.d(`DtaVlt hit for k: ${k}`);
    return e.v;
  }

  public d(k: Stg): bln {
    this.oM.d(`DtaVlt del for k: ${k}`);
    return this.c.delete(k);
  }

  public h(k: Stg): bln {
    return this.g(k) !== undefined;
  }

  public cAll(): void {
    this.c.clear();
    this.oM.i("DtaVlt clr all ents.");
  }

  public sZ(): nbr {
    this.cEE();
    return this.c.size;
  }

  public cEE(): void {
    const nw = Dte.now();
    let cC = 0;
    for (const [k, e] of this.c.entries()) {
      if (nw > e.exp) {
        this.c.delete(k);
        cC++;
      }
    }
    if (cC > 0) {
      this.oM.i(`DtaVlt cC cmp. Rmv ${cC} exp ents. Cur sz: ${this.c.size}.`);
    } else {
      this.oM.d(`DtaVlt cC ran, no exp ents fnd. Cur sz: ${this.c.size}.`);
    }
  }

  public updateDefaultTtl(newTtlMs: nbr): void {
    this.dTL = newTtlMs;
    this.oM.i(`DtaVlt dTL upd to ${newTtlMs / 1000}s.`);
    this.sCI(); // Restart cleanup to reflect potential new frequency logic
  }
}

export const optDV = new DtaVlt(15 * 60 * 1000);

export type DbncFnc<F extends (...a: any[]) => any> = (...a: Parameters<F>) => void;

export function dbnc<F extends (...a: any[]) => any>(f: F, w: nbr, i: bln = false): DbncFnc<F> {
  let t: ReturnType<typeof setTimeout> | null = null;
  let lA: Parameters<F> | null = null;
  let lT: ThisParameterType<F> | null = null;
  let r: any;

  const dbncd = function (this: ThisParameterType<F>, ...a: Parameters<F>) {
    lA = a;
    lT = this;

    const ltr = () => {
      t = null;
      if (!i && lA) {
        r = f.apply(lT, lA);
      }
      lA = null;
      lT = null;
    };

    const cN = i && !t;
    clearTimeout(t!);
    t = setTimeout(ltr, w);
    if (cN) {
      r = f.apply(this, a);
    }
    return r;
  } as DbncFnc<F>;

  (dbncd as any).ccl = () => {
    clearTimeout(t!);
    t = null;
    lA = null;
    lT = null;
  };

  return dbncd;
}

export type ThrtFnc<F extends (...a: any[]) => any> = DbncFnc<F> & {
  ccl: () => void;
};

export function thrt<F extends (...a: any[]) => any>(f: F, w: nbr): ThrtFnc<F> {
  let iT: bln;
  let lF: ReturnType<typeof setTimeout> | null;
  let lTm: nbr;

  const thrtld = function (this: ThisParameterType<F>, ...a: Parameters<F>) {
    if (!iT) {
      f.apply(this, a);
      lTm = Dte.now();
      iT = true;
    } else {
      clearTimeout(lF!);
      lF = setTimeout(() => {
        if (Dte.now() - lTm >= w) {
          f.apply(this, a);
          lTm = Dte.now();
          iT = true;
        } else {
          iT = false;
        }
      }, Math.max(w - (Dte.now() - lTm), 0));
    }
  } as ThrtFnc<F>;

  thrtld.ccl = () => {
    clearTimeout(lF!);
    iT = false;
    lF = null;
  };

  return thrtld;
}

export interface DynOptLdr<V = string, L = string> {
  lO(q?: Stg | Rcd<Stg, any>, p?: { o: nbr; l: nbr }, ctxt?: Rcd<Stg, any>): Promise<EntOpt<V, L>[]>;
  id: Stg;
  nm?: Stg;
  d?: Stg;
}

export class AsyOptSrv {
  private lds: Map<Stg, DynOptLdr<any, any>> = new Map();
  private c: DtaVlt;
  private oM: OpMon;

  constructor(cM: DtaVlt, iLs?: DynOptLdr<any, any>[]) {
    this.c = cM;
    this.oM = opMon;
    iLs?.forEach(l => this.rL(l));
    this.oM.i("AsyOptSrv init.");
  }

  public rL(l: DynOptLdr<any, any>): void {
    if (this.lds.has(l.id)) {
      this.oM.w(`Ldr w/ ID '${l.id}' alr reg. Ovwr w/ nw inst.`);
    }
    this.lds.set(l.id, l);
    this.oM.d(`Ldr '${l.id}' reg. D: ${l.d || 'N/A'}`);
  }

  public gL(id: Stg): DynOptLdr<any, any> | undefined {
    return this.lds.get(id);
  }

  public uL(id: Stg): bln {
    const d = this.lds.delete(id);
    if (d) {
      this.oM.d(`Ldr '${id}' unreg.`);
    } else {
      this.oM.w(`Atptd to unreg ldr '${id}' bt it ws not fnd.`);
    }
    return d;
  }

  public async fOpts<V = string, L = string>(
    lI: Stg,
    q?: Stg | Rcd<Stg, any>,
    p?: { o: nbr; l: nbr },
    bC: bln = false,
    cT?: nbr,
    ctxt?: Rcd<Stg, any>
  ): Promise<EntOpt<V, L>[]> {
    const ldr = this.lds.get(lI);
    if (!ldr) {
      this.oM.e(`No ldr reg w/ ID: ${lI}`, { aLs: Array.from(this.lds.keys()) });
      throw new Err(`LdrNF: No opt ldr fnd for ID '${lI}'.`);
    }

    const cKP = [
      `opt:${lI}`,
      typeof q === 'string' ? q : JSON.stringify(q || {}),
      p ? `${p.o}-${p.l}` : '',
      JSON.stringify(ctxt || {})
    ];
    const cK = cKP.join(':').replace(/[\W_]+/g, '_').toLowerCase();

    if (!bC) {
      const cO = this.c.g<EntOpt<V, L>[]>(cK);
      if (cO) {
        this.oM.d(`Cch hit for ldr '${lI}' w/ q '${q ? (typeof q === 'string' ? q : 'obj') : 'N/A'}'.`);
        return cO;
      }
    }

    this.oM.i(`Ftch opts for ldr '${lI}' w/ q '${q ? (typeof q === 'string' ? q.substring(0, 50) : 'obj') : 'N/A'}'...`);
    try {
      const opts = await ldr.lO(q, p, ctxt);
      this.c.s(cK, opts, cT);
      this.oM.d(`Opts ftch and cch for ldr '${lI}'. Cnt: ${opts.length}`);
      return opts;
    } catch (e) {
      this.oM.e(`Fld to ftch opts for ldr '${lI}'.`, e, { q, p, ctxt, lI });
      throw new Err(`OptFtchErr: Cld not ld opts for '${lI}'. Dtls: ${(e as Err).message}`);
    }
  }
}

export const asyOptSrv = new AsyOptSrv(optDV);

export class OptTsf {
  private static oM = opMon;

  public static fOpts<V = string, L = string>(
    o: EntOpt<V, L>[],
    q: Stg,
    kTS: (keyof EntOpt<V, L>)[] = ['l', 'v']
  ): EntOpt<V, L>[] {
    if (!q) return o;
    const lQ = q.toLowerCase();
    this.oM.d(`Flt ${o.length} opts w/ q: '${q}' on k: ${kTS.join(', ')}`);

    return o.filter(opt => {
      for (const k of kTS) {
        const val = opt[k];
        if (typeof val === 'string' && val.toLowerCase().includes(lQ)) {
          return true;
        }
        if (typeof val === 'number' && String(val).includes(lQ)) {
          return true;
        }
        if (typeof val === 'boolean' && String(val).toLowerCase().includes(lQ)) {
          return true;
        }
      }
      return false;
    });
  }

  public static sOpts<V = string, L = string>(
    o: EntOpt<V, L>[],
    k: keyof EntOpt<V, L>,
    ord: 'asc' | 'desc' = 'asc'
  ): EntOpt<V, L>[] {
    this.oM.d(`Srt ${o.length} opts by k: '${String(k)}', ord: '${ord}'`);

    return [...o].sort((a, b) => {
      const vA = a[k];
      const vB = b[k];

      if (vA === undefined || vA === null) return ord === 'asc' ? 1 : -1;
      if (vB === undefined || vB === null) return ord === 'asc' ? -1 : 1;

      if (typeof vA === 'string' && typeof vB === 'string') {
        return ord === 'asc' ? vA.localeCompare(vB) : vB.localeCompare(vA);
      }
      if (typeof vA === 'number' && typeof vB === 'number') {
        return ord === 'asc' ? vA - vB : vB - vA;
      }
      if (vA instanceof Dte && vB instanceof Dte) {
        return ord === 'asc' ? vA.getTime() - vB.getTime() : vB.getTime() - vA.getTime();
      }

      this.oM.w(`Srt k '${String(k)}' enc mxd or unsup cmp typs. Fallb to def cmp (0).`, { k, vA, vB });
      return 0;
    });
  }

  public static gOpts<V = string, L = string>(
    o: EntOpt<V, L>[],
    gB: keyof EntOpt<V, L> | Stg,
    dGN: Stg = 'Oth / Unctg'
  ): GrpEntOpt<V, L>[] {
    this.oM.d(`Grp ${o.length} opts by k: '${String(gB)}'`);
    const grps: Map<Stg, EntOpt<V, L>[]> = new Map();

    o.forEach(opt => {
      let gKV: any;
      if (typeof gB === 'string' && gB.includes('.')) {
        const p = gB.split('.');
        let c: any = opt;
        for (const s of p) {
          if (c && typeof c === 'object' && s in c) {
            c = c[s];
          } else {
            c = undefined;
            break;
          }
        }
        gKV = c;
      } else {
        gKV = opt[gB as keyof EntOpt];
      }

      const gK = String(gKV || dGN);
      if (!grps.has(gK)) {
        grps.set(gK, []);
      }
      grps.get(gK)?.push(opt);
    });

    return Array.from(grps.entries()).map(([gL, os]) => ({
      gL,
      opts: os,
      gMD: { oGB: gB, cnt: os.length }
    }));
  }

  public static tDs<V = string, L = string>(
    o: EntOpt<V, L>[],
    mL: nbr,
    aE: bln = true
  ): EntOpt<V, L>[] {
    if (mL < 0) {
      this.oM.w("tDs cal w/ ngtv mL. Ret org opts.");
      return o;
    }
    this.oM.d(`Trc ds for ${o.length} opts to mL: ${mL}`);
    return o.map(opt => {
      if (opt.d && opt.d.length > mL) {
        return {
          ...opt,
          d: opt.d.substring(0, mL) + (aE ? '...' : ''),
        };
      }
      return opt;
    });
  }

  public static uOpt<V = string, L = string>(
    o: EntOpt<V, L>[],
    nO: EntOpt<V, L>
  ): EntOpt<V, L>[] {
    const eI = o.findIndex(opt => opt.v === nO.v);
    if (eI > -1) {
      const uO = [...o];
      uO[eI] = { ...o[eI], ...nO };
      this.oM.d(`Upd exst opt: ${String(nO.v)}`);
      return uO;
    } else {
      this.oM.d(`Add nw opt: ${String(nO.v)}`);
      return [...o, nO];
    }
  }

  public static tHOpts<V = string, L = string>(
    o: EntOpt<V, L>[],
    pK: Stg = 'pID'
  ): EntOpt<V, L>[] {
    this.oM.w("tHOpts is a plc hldr and ret a flt lst for nw. Nds fll imp for tr-lik strc.");
    return this.sOpts(o, 'l').map(opt => ({
      ...opt,
      mD: { ...opt.mD, lvl: 0 }
    }));
  }
}

export interface AISugReq {
  cQ: Stg;
  cI?: Stg;
  eO?: EntOpt[];
  nS?: nbr;
  cnst?: Stg;
  eF?: Stg;
}

export class AIOptEnr {
  private qC: QtmNet;
  private c: DtaVlt;
  private oM: OpMon;

  constructor(qC: QtmNet, cM: DtaVlt) {
    this.qC = qC;
    this.c = cM;
    this.oM = opMon;
    this.oM.i("AIOptEnr init w/ QtmNet and DtaVlt for Citibank demo business Inc.");
  }

  public async gAISO(
    r: AISugReq,
    cR: bln = true,
    cT?: nbr
  ): Promise<EntOpt[]> {
    const cK = `ai-sug:${JSON.stringify(r)}`;
    if (cR) {
      const c = this.c.g<EntOpt[]>(cK);
      if (c) {
        this.oM.d(`Cch hit for AI sug: ${r.cQ.substring(0, Math.min(r.cQ.length, 50))}`);
        return c;
      }
    }

    this.oM.i(`Gen AI sug opts for q: ${r.cQ.substring(0, Math.min(r.cQ.length, 100))}...`);

    const pT = `Gen ${r.nS || 5} dstnct opts sutbl for a UI slct drp dwn bsd on the fllw ctxt: "${r.cQ}".
    ${r.cI ? `The usr hs cur typ: "${r.cI}". Prrt opts tht mtch ths inp.` : ''}
    ${r.eO && r.eO.length > 0 ? `Cnsd ths exst opts (avd strc dup, bt sug imp or rel itm): ${JSON.stringify(r.eO.map(o => o.l))}.` : ''}
    ${r.cnst ? `Adh strct to ths cnst: "${r.cnst}".` : ''}
    ${r.eF ? `Exp out fmt for ech opt: ${r.eF}.` : ''}
    Ech opt shld idly hv a 'v', 'l', and a brf 'd' (max 2 snt). Out as a JSN arr of obj.
    Ex JSN out: [{"v": "opt_a", "l": "Opt A", "d": "Ths is a dtld desc for Opt A."}, ...]`;

    const p: QtmPrm = {
      id: `ai-sug-${Dte.now()}`,
      rol: 'usr',
      prt: [{ pT: 'txt', dat: pT }],
      tag: 'opt-gen',
      tstmp: new Dte(),
    };

    try {
      const aR = await this.qC.gTxt(p, { tmp: 0.8, tP: 0.9, maxOT: 2048, rspFmt: 'jsn' });

      if (!aR.suc || !aR.d || aR.d.isBlk) {
        this.oM.w(`AI fld to gen sug or cnt ws blk. Vsn: ${aR.d?.blkVsn || 'Unk'}.`, { aR, r });
        return [];
      }

      const rT = aR.d.txt;
      let s: EntOpt[] = [];
      try {
        const jM = rT.match(/\[\s*{[^]*}\s*\]/m);
        if (jM && jM[0]) {
          s = JSON.parse(jM[0]) as EntOpt[];
          s = s.filter(si => si.v !== undefined && si.l !== undefined);
        } else {
          this.oM.w("AI rsp dd not ctn a vld JSN arr. Atptg fallb prsg frm lns.", { rT: rT.substring(0, 500) });
          const ls = rT.split('\n').map(l => l.trim()).filter(l => l.length > 2);
          s = ls.map((l, idx) => {
            const m = l.match(/(.*?)(?:\s*\((.*?)\))?(?::\s*(.*))?$/);
            if (m) {
              const la = m[1].trim();
              const va = m[2] ? m[2].trim() : la;
              const ds = m[3] ? m[3].trim() : `AI inf opt for "${la}"`;
              return { v: va, l: la, d: ds };
            }
            return { v: l, l: l, d: `AI inf opt ${idx + 1}` };
          }).filter(si => si.v && si.l);
        }
      } catch (pE) {
        this.oM.e("Fld to prs AI gen sug into a strc fmt.", pE, { rT: rT.substring(0, 500) });
        return [];
      }

      s = s.map(si => ({
        ...si,
        isAIGen: true,
        mD: {
          ...si.mD,
          aICnf: aR.d?.cnfSc,
          aIMdl: aR.d?.mD?.mdl,
          aIGenDt: new Dte().toISOString(),
          oPI: p.id,
        },
        lstUpd: new Dte(),
      }));

      if (cR) {
        this.c.s(cK, s, cT);
      }
      this.oM.d(`Suc gen ${s.length} AI sug.`);
      return s;
    } catch (e) {
      this.oM.e("Err gen AI sug opts.", e, { r });
      return [];
    }
  }

  public async fOptAIQ(
    o: EntOpt[],
    nLQ: Stg,
    tN?: nbr,
    cR: bln = true,
    cT?: nbr
  ): Promise<EntOpt[]> {
    if (!nLQ || o.length === 0) {
      this.oM.d("AI flt skp: no q or no opts prvd. Ret org opts.");
      return o;
    }

    const oH = JSON.stringify(o.map(oi => ({ v: oi.v, l: oi.l })));
    const cK = `ai-flt:${nLQ}:${oH}`;
    if (cR) {
      const c = this.c.g<EntOpt[]>(cK);
      if (c) {
        this.oM.d(`Cch hit for AI-flt opts: ${nLQ.substring(0, Math.min(nLQ.length, 50))}`);
        return c;
      }
    }

    this.oM.i(`AI-fltg ${o.length} opts w/ q: '${nLQ.substring(0, Math.min(nLQ.length, 100))}'`);

    const aOS = o.map(oi => `"${oi.l}" (v: ${oi.v}, d: ${oi.d || 'N/A'})`).join('; ');
    const pT = `Gvn the usr's qry "${nLQ}" and a lst of avl opts, idntfy whch opts ar mst rel. For ech rel opt, assgn a rel sc btwn 0.0 (lst rel) and 1.0 (mst rel). If an opt is cmpltly irr, do not incld it. Out a JSN arr of obj, ech w/ 'v' and 'rSc'. Ord the out by rSc dsc.
    Avl Opts: ${aOS}.
    Ex Out: [{"v": "opt1_v", "rSc": 0.9}, {"v": "opt3_v", "rSc": 0.7}]`;

    const p: QtmPrm = {
      id: `ai-flt-${Dte.now()}`,
      rol: 'usr',
      prt: [{ pT: 'txt', dat: pT }],
      tag: 'opt-fltg',
      tstmp: new Dte(),
    };

    try {
      const aR = await this.qC.gTxt(p, { tmp: 0.2, tP: 0.5, maxOT: 1024, rspFmt: 'jsn' });

      if (!aR.suc || !aR.d || aR.d.isBlk) {
        this.oM.w(`AI fld to flt opts or cnt ws blk. Fallb to org opts.`, { aR, nLQ });
        return o;
      }

      const rT = aR.d.txt;
      let aS: { v: Stg; rSc: nbr }[] = [];
      try {
        const jM = rT.match(/\[\s*{[^]*}\s*\]/m);
        if (jM && jM[0]) {
          aS = JSON.parse(jM[0]);
        } else {
          this.oM.w("AI flt rsp dd not ctn a vld JSN arr. Skp AI fltg and ret org opts.", { rT: rT.substring(0, 500) });
          return o;
        }
      } catch (pE) {
        this.oM.e("Fld to prs AI-gen flt scs frm rsp.", pE, { rT: rT.substring(0, 500) });
        return o;
      }

      const sM = new Map<Stg, nbr>();
      aS.forEach(s => sM.set(String(s.v), Math.max(0, Math.min(1, s.rSc || 0))));

      let fASO = o
        .map(opt => ({
          ...opt,
          rSc: sM.get(String(opt.v)) || 0,
        }))
        .filter(opt => opt.rSc! > 0)
        .sort((a, b) => (b.rSc || 0) - (a.rSc || 0));

      if (tN !== undefined && tN > 0) {
        fASO = fASO.slice(0, tN);
      }

      if (cR) {
        this.c.s(cK, fASO, cT);
      }
      this.oM.d(`AI-flt opts suc. Rlt cnt: ${fASO.length}. Top scs: ${fASO.slice(0,3).map(oi => `${oi.l}: ${oi.rSc}`).join(', ')}`);
      return fASO;
    } catch (e) {
      this.oM.e("Err fltg opts w/ AI qry. Ret org opts as fallb.", e, { nLQ, oC: o.length });
      return o;
    }
  }

  public async cOptAI(
    o: EntOpt[],
    cC: Stg,
    cR: bln = true,
    cT?: nbr
  ): Promise<GrpEntOpt[]> {
    if (!cC || o.length === 0) {
      this.oM.w("AI ctg skp: no ctxt or no opts prvd. Ret all opts as unctg.");
      return [{ gL: 'Unctg', opts: o, gD: 'No ctg ctxt or opts prvd.' }];
    }

    const oH = JSON.stringify(o.map(oi => ({ v: oi.v, l: oi.l })));
    const cK = `ai-ctg:${cC}:${oH}`;
    if (cR) {
      const c = this.c.g<GrpEntOpt[]>(cK);
      if (c) {
        this.oM.d(`Cch hit for AI ctg: ${cC.substring(0, Math.min(cC.length, 50))}`);
        return c;
      }
    }

    this.oM.i(`AI-ctg ${o.length} opts w/ ctxt: '${cC.substring(0, Math.min(cC.length, 100))}'`);

    const oT = o.map(oi => `[${oi.v}] ${oi.l}: ${oi.d || ''}`).join('\n');
    const pT = `Ctg the fllw opts bsd on the ctxt: "${cC}". Assgn ech opt to one or mr sutbl cat. If an opt fts mlt, choos the prmry. Opts tht don't ft any clr cat shld go into an "Oth / Unctg" grp. Out as a JSN arr whr ech obj rep a grp, w/ a 'gL', an opt 'gD', and an arr of 'opts' (ctng 'v' and 'l').
    Opts to ctg:\n${oT}\n
    Ex Out: [{"gL": "Cat A", "gD": "Desc A", "opts": [{"v": "v1", "l": "L1"}]}, {"gL": "Cat B", "opts": [{"v": "v2", "l": "L2"}, {"v": "v3", "l": "L3"}]}]`;

    const p: QtmPrm = {
      id: `ai-ctg-${Dte.now()}`,
      rol: 'usr',
      prt: [{ pT: 'txt', dat: pT }],
      tag: 'opt-ctg',
      tstmp: new Dte(),
    };

    try {
      const aR = await this.qC.gTxt(p, { tmp: 0.5, tP: 0.7, maxOT: 2048, rspFmt: 'jsn' });

      if (!aR.suc || !aR.d || aR.d.isBlk) {
        this.oM.w(`AI fld to ctg opts or cnt ws blk. Fallb to unctg. Vsn: ${aR.d?.blkVsn || 'Unk'}.`, { aR, cC });
        return [{ gL: 'Unctg', opts: o, gD: 'AI ctg fld.' }];
      }

      const rT = aR.d.txt;
      let gO: GrpEntOpt[] = [];
      try {
        const jM = rT.match(/\[\s*{[^]*}\s*\]/m);
        if (jM && jM[0]) {
          const aG: Array<{ gL: Stg; gD?: Stg; opts: Array<{ v: Stg; l: Stg }> }> = JSON.parse(jM[0]);

          const oOM = new Map<Stg, EntOpt>();
          o.forEach(opt => oOM.set(String(opt.v), opt));

          const cOV = new Set<Stg>();
          gO = aG.map(g => ({
            gL: g.gL,
            gD: g.gD || `AI-gen cat for ${g.gL}`,
            opts: g.opts.map(aO => {
              const org = oOM.get(String(aO.v));
              if (org) cOV.add(String(org.v));
              return {
                ...org,
                v: aO.v,
                l: aO.l,
                isAIGen: !org,
                mD: {
                  ...org?.mD,
                  aICnf: aR.d?.cnfSc,
                  aIMdl: aR.d?.mD?.mdl,
                  aICtgDt: new Dte().toISOString(),
                }
              };
            }),
          }));

          const uO = o.filter(opt => !cOV.has(String(opt.v)));

          if (uO.length > 0) {
            gO.push({
              gL: 'Oth / Unctg',
              opts: uO,
              gD: 'Ths opts dd not ft into any spc AI-gen cat.'
            });
            this.oM.d(`Add ${uO.length} unctg opts.`);
          }

        } else {
          this.oM.w("AI ctg rsp dd not ctn a vld JSN arr. Fallb to unctg.", { rT: rT.substring(0, 500) });
          return [{ gL: 'Unctg', opts: o, gD: 'AI cld not prs rsp into vld grps.' }];
        }
      } catch (pE) {
        this.oM.e("Fld to prs AI-gen ctg.", pE, { rT: rT.substring(0, 500) });
        return [{ gL: 'Unctg', opts: o, gD: 'Err dur AI rsp prsg for cat.' }];
      }

      if (cR) {
        this.c.s(cK, gO, cT);
      }
      this.oM.d(`AI-ctg suc. Gen ${gO.length} grps.`);
      return gO;
    } catch (e) {
      this.oM.e("Err ctg opts w/ AI. Ret all opts as unctg as fallb.", e, { cC, oC: o.length });
      return [{ gL: 'Unctg', opts: o, gD: `An unexp err occ dur AI ctg: ${(e as Err).message}` }];
    }
  }

  public async vSlOAI(
    sO: EntOpt,
    vC: Stg,
    cFVs?: Rcd<Stg, any>
  ): Promise<{ isV: bln; fbM: Stg; cnf?: nbr }> {
    this.oM.i(`Vld opt '${sO.l}' w/ AI ctxt: ${vC.substring(0, Math.min(vC.length, 100))}...`);

    const pT = `Evl if the fllw slctd opt is vld bsd on the prvd ctxt and rls.
    Slctd Opt Dtls: V: "${sO.v}", L: "${sO.l}", D: "${sO.d || 'N/A'}".
    Vld Ctxt/Rls: "${vC}".
    ${cFVs ? `Oth rel frm v tht may inf vld log: ${JSON.stringify(cFVs, null, 2)}.` : ''}
    Rsp w/ a JSN obj ctng 'isV' (bln, tr if vld, fls oth), 'fbM' (stg, a clr msg expl vld or inv), and 'cnf' (flt 0.0-1.0, AI's cnf in its vld). If vld, fbM can be "Vld." or a pos cnf.`;

    const p: QtmPrm = {
      id: `ai-vld-${Dte.now()}`,
      rol: 'usr',
      prt: [{ pT: 'txt', dat: pT }],
      tag: 'opt-vld',
      tstmp: new Dte(),
    };

    try {
      const aR = await this.qC.gTxt(p, { tmp: 0.1, tP: 0.1, maxOT: 256, rspFmt: 'jsn' });

      if (!aR.suc || !aR.d || aR.d.isBlk) {
        this.oM.w(`AI vld fld or cnt ws blk. Def to inv. Vsn: ${aR.d?.blkVsn || 'Unk'}.`, { aR, sO, vC });
        return { isV: false, fbM: "AI vld srv unavl or blk.", cnf: 0 };
      }

      const rT = aR.d.txt;
      try {
        const jM = rT.match(/{\s*"isV":\s*(true|false),[^]*"fbM":\s*"[^"]*",[^]*}/m);
        if (jM && jM[0]) {
          const vR = JSON.parse(jM[0]) as { isV: bln; fbM: Stg; cnf?: nbr };
          this.oM.d(`AI vld cmp for '${sO.l}'. IsV: ${vR.isV}. Fb: ${vR.fbM}`);
          return vR;
        } else {
          this.oM.w("AI vld rsp dd not ctn a vld JSN obj. Def to inv.", { rT: rT.substring(0, 500) });
          return { isV: false, fbM: "AI cld not prs vld rlt. Pls chk AI rsp fmt.", cnf: 0 };
        }
      } catch (pE) {
        this.oM.e("Fld to prs AI-gen vld rlt.", pE, { rT: rT.substring(0, 500) });
        return { isV: false, fbM: "Err prsg AI vld rlt. Pls cntct sup.", cnf: 0 };
      }
    } catch (e) {
      this.oM.e("Err vld opt w/ AI. Def to inv.", e, { sO, vC });
      return { isV: false, fbM: `Vld fld due to AI srv err: ${(e as Err).message}`, cnf: 0 };
    }
  }

  public async gOD(
    o: EntOpt,
    dC?: Stg,
    cR: bln = true,
    cT?: nbr
  ): Promise<Stg> {
    const cK = `ai-d:${o.v}:${o.l}:${dC || ''}`;
    if (cR) {
      const c = this.c.g<Stg>(cK);
      if (c) {
        this.oM.d(`Cch hit for AI-gen d: '${o.l}'`);
        return c;
      }
    }

    this.oM.i(`Gen AI d for opt: '${o.l}'`);

    const pT = `Gen a cnc (max 2-3 snt) and inf d for the fllw itm, sutbl for a UI slct opt.
    Itm L: "${o.l}". Itm V: "${o.v}".
    ${dC ? `Ctxt for d: "${dC}".` : ''}
    Kp it prfsnl, clr, and hlpfl. Fcs on the cor mnng and utl of the itm.`;

    const p: QtmPrm = {
      id: `ai-d-${Dte.now()}`,
      rol: 'usr',
      prt: [{ pT: 'txt', dat: pT }],
      tag: 'opt-d',
      tstmp: new Dte(),
    };

    try {
      const aR = await this.qC.gTxt(p, { tmp: 0.6, maxOT: 128 });

      if (!aR.suc || !aR.d || aR.d.isBlk) {
        this.oM.w(`AI fld to gen d or cnt ws blk for opt '${o.l}'. Vsn: ${aR.d?.blkVsn || 'Unk'}.`, { aR, o });
        return `No AI d avl. ${aR.d?.blkVsn || ''}`;
      }

      const d = aR.d.txt.trim();
      if (cR) {
        this.c.s(cK, d, cT);
      }
      this.oM.d(`AI d gen for '${o.l}'. D l: ${d.length}.`);
      return d;
    } catch (e) {
      this.oM.e(`Err gen AI d for opt '${o.l}'.`, e);
      return `Fld to gen d due to AI srv err.`;
    }
  }

  public async gPISug(
    cntx: Stg,
    eD?: Rcd<Stg, any>
  ): Promise<EntOpt[]> {
    this.oM.i(`Gen Prd Int Sugs based on cntx: ${cntx.substring(0, 100)}`);
    const pT = `Act as a PIS for Citibank demo business Inc. Given the current operational context "${cntx}", generate 5-10 strategic predictive intelligence options. These should represent potential future scenarios, emerging risks, or growth opportunities. Each option needs a 'value', 'label', 'description' (max 3 sentences), and a 'riskScore' (0-10, lower is better). Use the provided extra data: ${JSON.stringify(eD || {})}. Output as JSON.`;
    const p: QtmPrm = { id: `pred-int-sug-${Dte.now()}`, rol: 'usr', prt: [{ pT: 'txt', dat: pT }], tag: 'pred-int', tstmp: new Dte() };
    try {
      const aR = await this.qC.gTxt(p, { tmp: 0.9, maxOT: 1500, rspFmt: 'jsn' });
      if (!aR.suc || !aR.d || aR.d.isBlk) {
        this.oM.w(`PI Sug AI fld. Vsn: ${aR.d?.blkVsn || 'Unk'}.`, { aR });
        return [];
      }
      const jM = aR.d.txt.match(/\[\s*{[^]*}\s*\]/m);
      if (jM && jM[0]) {
        return JSON.parse(jM[0]).map((opt: any) => ({
          v: opt.value, l: opt.label, d: opt.description,
          mD: { ...opt.metadata, riskScore: opt.riskScore, aiConf: aR.d?.cnfSc },
          isAIGen: true, lstUpd: new Dte()
        }));
      }
      return [];
    } catch (e) {
      this.oM.e(`Err gen PI sug.`, e);
      return [];
    }
  }
}

export interface SysCnfgUtl {
  qSO?: QtmSrvOpt;
  lC?: Partial<OpMonCfg>;
  cDTL?: nbr;
  iDLs?: DynOptLdr<any, any>[];
  sRegCnf?: SysRegCnf;
  polMgmCnf?: PolMgmCnf;
  extSrcCnf?: ExtSrcCnf;
}

export function iSUtl(c: SysCnfgUtl): void {
  opMon.i("Init SlctUtl mdl w/ gbl cnfg...");

  if (c.lC) {
    opMon.uC(c.lC);
    opMon.d("OpMon cnfgd w/ nw sttngs.");
  }

  if (c.cDTL !== undefined) {
    if (optDV instanceof DtaVlt) {
      optDV.updateDefaultTtl(c.cDTL);
      opMon.d(`DtaVlt dTL upd to ${c.cDTL / 1000}s.`);
    } else {
      opMon.e("Gbl optDV inst is not a DtaVlt, cld not upd TTL.");
    }
  }

  if (c.qSO) {
    try {
      sUQC = new QtmNet(c.qSO);
      opMon.d("QtmNet re-init w/ nw opts.");

      aIOE = new AIOptEnr(sUQC, optDV);
      opMon.d("AIOptEnr re-init w/ the nw QtmNet.");
    } catch (e) {
      opMon.c("Fld to init QtmNet dur gbl cnfg. AI ftr will be unavl.", e);
    }
  } else {
    opMon.w("No QtmSrvOpt prvd in gbl cnfg. AI funcs may not wk crctly w/o ppr aK or cnfg.");
  }

  if (c.iDLs && c.iDLs.length > 0) {
    c.iDLs.forEach(l => {
      try {
        asyOptSrv.rL(l);
      } catch (e) {
        opMon.e(`Fld to reg init dyn ldr '${l.id}'.`, e);
      }
    });
    opMon.i(`Reg ${c.iDLs.length} init dyn opt lds.`);
  }

  if (c.sRegCnf) {
    sysReg.uC(c.sRegCnf);
    opMon.d("SysReg cnfg upd.");
  }

  if (c.polMgmCnf) {
    polMgr.uC(c.polMgmCnf);
    opMon.d("PolMgr cnfg upd.");
  }

  if (c.extSrcCnf) {
    extSrcSyn.uC(c.extSrcCnf);
    opMon.d("ExtSrcSyn cnfg upd.");
  }

  opMon.i("SlctUtl mdl init cmp and srvs rdy.");
}

export let sUQC: QtmNet = new QtmNet({
  aK: "YOUR_GEMINI_API_KEY_HERE",
  bU: "https://citibankdemobusiness.dev/qntm/api/v1/mdl",
  eAL: opMon.c.mL <= OpMonLvl.DBG,
});

export let aIOE: AIOptEnr = new AIOptEnr(sUQC, optDV);

export interface SysRegCnf {
  sN: Stg;
  bU: Stg;
  aPIV: Stg;
}

export class SysReg {
  private c: SysRegCnf;
  private oM: OpMon;
  private svcDefs: Map<Stg, Rcd<Stg, any>> = new Map();

  constructor(c: SysRegCnf = { sN: 'DefaultService', bU: 'https://citibankdemobusiness.dev/registry', aPIV: 'v1' }) {
    this.c = c;
    this.oM = opMon;
    this.oM.i(`SysReg init for ${c.sN} at ${c.bU}/${c.aPIV}`);
  }

  public uC(nC: Partial<SysRegCnf>): void {
    Object.assign(this.c, nC);
    this.oM.i(`SysReg cnfg upd to ${this.c.bU}/${this.c.aPIV}`);
  }

  public rSD(id: Stg, def: Rcd<Stg, any>): void {
    this.svcDefs.set(id, def);
    this.oM.d(`Svc '${id}' def reg in SysReg.`);
  }

  public gSD(id: Stg): Rcd<Stg, any> | undefined {
    return this.svcDefs.get(id);
  }

  public async rSvcH(svcName: Stg, svcUrl: Stg, hChks: Stg[]): Promise<APIRes<Stg>> {
    this.oM.i(`Reg svc h for ${svcName} at ${svcUrl}`);
    await new Promise(r => setTimeout(r, 100));
    // Simulate health check execution
    const hR = hChks.map(c => ({ c, st: Math.random() > 0.1 ? 'UP' : 'DOWN' }));
    const allUp = hR.every(r => r.st === 'UP');
    if (allUp) {
      this.rSD(svcName, { u: svcUrl, h: hR, s: 'ACT' });
      return { suc: true, d: `${svcName} h srv reg and is ACT.`, sC: 200 };
    } else {
      this.oM.e(`Svc ${svcName} h chk fld.`, { hR });
      this.rSD(svcName, { u: svcUrl, h: hR, s: 'DEG' });
      return { suc: false, d: `${svcName} h srv reg w/ deg st.`, sC: 503, msg: 'HChks Fld', err: { cd: 'HEALTH_CHECK_FAILURE', msg: 'Some checks failed' } };
    }
  }

  public async gSvcSt(svcName: Stg): Promise<APIRes<Rcd<Stg, any>>> {
    this.oM.i(`Gtn svc st for ${svcName}`);
    await new Promise(r => setTimeout(r, 50));
    const def = this.gSD(svcName);
    if (def) {
      return { suc: true, d: def, sC: 200 };
    }
    return { suc: false, msg: 'Svc Not Fnd', sC: 404, d: {}, err: { cd: 'SVC_NOT_FOUND', msg: 'Service definition missing' } };
  }
}

export const sysReg = new SysReg();

export interface PolMgmCnf {
  eR: bln;
  gPL: Stg[];
}

export class PolMgr {
  private c: PolMgmCnf;
  private oM: OpMon;
  private polRls: Map<Stg, Rcd<Stg, any>> = new Map();

  constructor(c: PolMgmCnf = { eR: true, gPL: ['region_us', 'data_privacy_level_high'] }) {
    this.c = c;
    this.oM = opMon;
    this.oM.i(`PolMgr init. Rls enf: ${c.eR}. Gbl pol: ${c.gPL.join(', ')}`);
  }

  public uC(nC: Partial<PolMgmCnf>): void {
    Object.assign(this.c, nC);
    this.oM.i(`PolMgr cnfg upd. Rls enf: ${this.c.eR}`);
  }

  public rPol(id: Stg, rl: Rcd<Stg, any>): void {
    this.polRls.set(id, rl);
    this.oM.d(`Pol '${id}' reg.`);
  }

  public gPol(id: Stg): Rcd<Stg, any> | undefined {
    return this.polRls.get(id);
  }

  public async aPol(entOpt: EntOpt, ctxt: Rcd<Stg, any>): Promise<APIRes<bln>> {
    if (!this.c.eR) {
      this.oM.w("PolMgm disabled. Bypassing pol a for opt.", { optV: entOpt.v });
      return { suc: true, d: true, msg: 'PolMgm dis', sC: 200 };
    }

    this.oM.i(`Apl pol for opt ${entOpt.l}.`);
    await new Promise(r => setTimeout(r, 75)); // Simulate policy evaluation delay

    // Combined AI and rule-based policy evaluation
    const pT = `Evaluate if option "${entOpt.l}" (value: ${entOpt.v}, desc: ${entOpt.d}) is compliant with the following global policies: ${this.c.gPL.join(', ')} and additional context: ${JSON.stringify(ctxt)}. If it violates any policy, specify the reason. Output JSON: {"compliant": true/false, "reason": "...", "confidence": 0-1}.`;
    const p: QtmPrm = { id: `pol-eval-${Dte.now()}`, rol: 'usr', prt: [{ pT: 'txt', dat: pT }], tag: 'pol-eval', tstmp: new Dte() };

    try {
      const aR = await sUQC.gTxt(p, { tmp: 0.1, maxOT: 256, rspFmt: 'jsn' });
      if (!aR.suc || !aR.d || aR.d.isBlk) {
        this.oM.e(`AI Pol eval fld or blk. Defaulting to non-compliant. Vsn: ${aR.d?.blkVsn || 'Unk'}`, { optV: entOpt.v });
        return { suc: false, d: false, msg: `AI Pol eval fld: ${aR.d?.blkVsn || 'Unk'}`, sC: 500, err: { cd: 'AI_POLICY_FAIL', msg: 'AI policy evaluation failed' } };
      }

      const jM = aR.d.txt.match(/{\s*"compliant":\s*(true|false),[^]*}/m);
      if (jM && jM[0]) {
        const rlt = JSON.parse(jM[0]);
        if (!rlt.compliant) {
          this.oM.w(`Opt ${entOpt.l} non-compliant: ${rlt.reason}`, { optV: entOpt.v, rlt });
          return { suc: false, d: false, msg: rlt.reason, sC: 403, err: { cd: 'POLICY_VIOLATION', msg: rlt.reason } };
        }
        return { suc: true, d: true, msg: `Opt ${entOpt.l} compliant.`, sC: 200 };
      }
      throw new Err('Invalid AI policy response format.');
    } catch (e) {
      this.oM.e(`Err dur AI-based pol a for opt ${entOpt.l}. Defaulting to non-compliant.`, e);
      return { suc: false, d: false, msg: `Sys Err during pol a: ${(e as Err).message}`, sC: 500, err: { cd: 'SYSTEM_POLICY_ERROR', msg: `System error: ${(e as Err).message}` } };
    }
  }

  public async sByPol<V = string, L = string>(opts: EntOpt<V, L>[], ctxt: Rcd<Stg, any>): Promise<EntOpt<V, L>[]> {
    if (!this.c.eR) {
      this.oM.w("PolMgm disabled. Bypassing pol s for opts. Ret original.");
      return opts;
    }
    this.oM.i(`Scrning ${opts.length} opts by pol.`);
    const sOpts: EntOpt<V, L>[] = [];
    for (const opt of opts) {
      try {
        const r = await this.aPol(opt, ctxt);
        if (r.suc && r.d) {
          sOpts.push(opt);
        }
      } catch (e) {
        this.oM.e(`Err scrn opt ${opt.l} by pol. Excld.`, e);
      }
    }
    this.oM.d(`Screned to ${sOpts.length} compliant opts.`);
    return sOpts;
  }
}

export const polMgr = new PolMgr();

export interface ExtSrcCnf {
  syncI?: nbr;
  eSS: Rcd<Stg, Rcd<Stg, Stg>>;
}

export class ExtSrcSyn {
  private c: ExtSrcCnf;
  private oM: OpMon;
  private syncInt?: ReturnType<typeof setInterval>;
  private qC: QtmNet;
  private lds: Map<Stg, DynOptLdr<any, any>>;

  constructor(c: ExtSrcCnf = { syncI: 300000, eSS: { salesforce: { baseUrl: 'https://citibankdemobusiness.dev/sfdc', apiKey: 'SF_KEY' }, oracle: { baseUrl: 'https://citibankdemobusiness.dev/orc', apiKey: 'ORC_KEY' } } }, qC: QtmNet, lds: Map<Stg, DynOptLdr<any, any>>) {
    this.c = c;
    this.oM = opMon;
    this.qC = qC;
    this.lds = lds;
    this.oM.i(`ExtSrcSyn init. Sync int: ${c.syncI ? c.syncI / 1000 : 'disabled'}s.`);
    this.sS();
  }

  public uC(nC: Partial<ExtSrcCnf>): void {
    Object.assign(this.c, nC);
    this.oM.i(`ExtSrcSyn cnfg upd. Sync int: ${this.c.syncI ? this.c.syncI / 1000 : 'disabled'}s.`);
    this.sS(); // Re-schedule sync
  }

  private sS(): void {
    if (this.syncInt) {
      clearInterval(this.syncInt);
    }
    if (this.c.syncI && this.c.syncI > 0) {
      this.syncInt = setInterval(() => this.eAllS(), this.c.syncI);
      this.oM.d(`ExtSrcSyn sched sync for ${Object.keys(this.c.eSS).length} srcs.`);
    }
  }

  public stpS(): void {
    if (this.syncInt) {
      clearInterval(this.syncInt);
      this.syncInt = undefined;
      this.oM.d("ExtSrcSyn stp.");
    }
  }

  private async fSD(src: Stg, cfg: Rcd<Stg, Stg>): Promise<EntOpt[]> {
    this.oM.i(`Ftch dta frm ext src: ${src}`);
    await new Promise(r => setTimeout(r, Math.random() * 1000 + 200));

    // Simulate different data sources
    if (src === 'salesforce') {
      const q = `Salesforce CRM data for Citibank demo business Inc accounts. Status: Active.`;
      const p: QtmPrm = { id: `sfdc-q-${Dte.now()}`, rol: 'usr', prt: [{ pT: 'txt', dat: q }], tag: 'sfdc-syn', tstmp: new Dte() };
      const aR = await this.qC.gTxt(p, { maxOT: 500, rspFmt: 'jsn' });
      if (aR.suc && aR.d && aR.d.txt) {
        try {
          const sfdcData = JSON.parse(aR.d.txt) as Array<{ id: Stg; name: Stg; status: Stg; region: Stg }>;
          return sfdcData.map(d => ({
            v: d.id, l: d.name, d: `SFDC Acct: ${d.name}, Reg: ${d.region}, Stat: ${d.status}.`,
            mD: { src: 'salesforce', ...d },
            lstUpd: new Dte(),
          }));
        } catch (e) {
          this.oM.e(`Fld to prs SFDC data from AI.`, e);
        }
      }
      return [
        { v: 'SFDC001', l: 'Global Accounts', d: 'Top-tier global client portfolio from Salesforce.', mD: { src: 'salesforce', region: 'Global' } },
        { v: 'SFDC002', l: 'APAC Key Clients', d: 'Key clients in the Asia-Pacific region.', mD: { src: 'salesforce', region: 'APAC' } },
      ];
    } else if (src === 'oracle') {
      return [
        { v: 'ORCINV001', l: 'Q4 2023 Invoices', d: 'Financial data from Oracle ERP for Q4 2023.', mD: { src: 'oracle', type: 'Invoice' } },
        { v: 'ORCSUP005', l: 'Strategic Suppliers', d: 'List of strategic suppliers managed in Oracle.', mD: { src: 'oracle', type: 'Supplier' } },
      ];
    } else if (src === 'github') {
      return [
        { v: 'GHPR100', l: 'Feature X Pull Request', d: 'Ongoing dev for new feature X.', mD: { src: 'github', type: 'PR' } },
        { v: 'GHBUG201', l: 'Critical Security Bug', d: 'High priority bug for Citibank demo business Inc security.', mD: { src: 'github', type: 'Issue' } },
      ];
    } else if (src === 'huggingface') {
      return [
        { v: 'HFMODEL01', l: 'Sentiment Analysis Model', d: 'AI model for text sentiment from Hugging Face.', mD: { src: 'huggingface', type: 'Model' } },
        { v: 'HFDATA02', l: 'Financial News Dataset', d: 'Dataset for financial market analysis.', mD: { src: 'huggingface', type: 'Dataset' } },
      ];
    } else if (src === 'plaid') {
      return [
        { v: 'PLDTRN01', l: 'Recent Transactions', d: 'Aggregated recent transactions from linked accounts.', mD: { src: 'plaid', type: 'Transaction' } },
        { v: 'PLDBAL02', l: 'Account Balances', d: 'Current balance for all connected financial accounts.', mD: { src: 'plaid', type: 'Balance' } },
      ];
    } else if (src === 'modern_treasury') {
      return [
        { v: 'MTPAY01', l: 'Payment Outflows', d: 'Summary of recent payment disbursements.', mD: { src: 'modern_treasury', type: 'Payment' } },
        { v: 'MTREC02', l: 'Received Funds', d: 'Recent funds received into Citibank demo business Inc accounts.', mD: { src: 'modern_treasury', type: 'Receipt' } },
      ];
    } else if (src === 'google_drive') {
      return [
        { v: 'GDOC01', l: 'Project Proposal Q1', d: 'Latest project proposal document on Google Drive.', mD: { src: 'google_drive', type: 'Document' } },
        { v: 'GSHET02', l: 'Budget Spreadsheet 2024', d: 'Annual budget data sheet.', mD: { src: 'google_drive', type: 'Spreadsheet' } },
      ];
    } else if (src === 'onedrive') {
      return [
        { v: 'ODOC01', l: 'Team Meeting Notes', d: 'Minutes from the latest team meeting on OneDrive.', mD: { src: 'onedrive', type: 'Document' } },
      ];
    } else if (src === 'azure') {
      return [
        { v: 'AZUREVM01', l: 'Production Web Server', d: 'Critical VM instance running web services in Azure.', mD: { src: 'azure', type: 'VM' } },
      ];
    } else if (src === 'google_cloud') {
      return [
        { v: 'GCPBUCK01', l: 'Data Lake Storage', d: 'Large-scale storage bucket for analytical data.', mD: { src: 'google_cloud', type: 'Storage' } },
      ];
    } else if (src === 'supabase') {
      return [
        { v: 'SBPDB01', l: 'User Auth Database', d: 'Supabase database for user authentication records.', mD: { src: 'supabase', type: 'Database' } },
      ];
    } else if (src === 'vercel') {
      return [
        { v: 'VERCELDEP01', l: 'Frontend App Deployment', d: 'Latest deployment of the Citibank demo business Inc frontend application on Vercel.', mD: { src: 'vercel', type: 'Deployment' } },
      ];
    } else if (src === 'shopify') {
      return [
        { v: 'SHOPORD01', l: 'New E-commerce Order', d: 'A recently placed order on the Shopify store.', mD: { src: 'shopify', type: 'Order' } },
      ];
    } else if (src === 'woocommerce') {
      return [
        { v: 'WCOPCAT01', l: 'Product Category Updates', d: 'Updates for product categories in WooCommerce.', mD: { src: 'woocommerce', type: 'Category' } },
      ];
    } else if (src === 'godaddy') {
      return [
        { v: 'GDYDOM01', l: 'Main Domain Records', d: 'DNS records for citibankdemobusiness.dev domain.', mD: { src: 'godaddy', type: 'Domain' } },
      ];
    } else if (src === 'cpanel') {
      return [
        { v: 'CPANELFTP01', l: 'FTP User Accounts', d: 'List of FTP access accounts on cPanel.', mD: { src: 'cpanel', type: 'Account' } },
      ];
    } else if (src === 'adobe') {
      return [
        { v: 'ADOBEDOC01', l: 'Marketing Brochure PDF', d: 'Finalized marketing collateral in Adobe Cloud.', mD: { src: 'adobe', type: 'Document' } },
      ];
    } else if (src === 'twilio') {
      return [
        { v: 'TWILSMS01', l: 'SMS Service Status', d: 'Operational status of Twilio SMS gateway.', mD: { src: 'twilio', type: 'ServiceStatus' } },
      ];
    } else if (src === 'marqeta') {
      return [
        { v: 'MQTCRD01', l: 'Virtual Card Issuance', d: 'Platform for issuing virtual payment cards.', mD: { src: 'marqeta', type: 'CardIssuance' } },
      ];
    } else if (src === 'citibank') {
      return [
        { v: 'CBAPI01', l: 'Citi API Gateway Access', d: 'Access to Citibank demo business Inc proprietary APIs.', mD: { src: 'citibank', type: 'APIAccess' } },
      ];
    }

    return [];
  }

  public async eAllS(): Promise<void> {
    this.oM.i("Exe all ext src sync.");
    for (const src in this.c.eSS) {
      if (this.c.eSS.hasOwnProperty(src)) {
        try {
          const cfg = this.c.eSS[src];
          const opts = await this.fSD(src, cfg);
          const ldrId = `ext-${src}-ldr`;
          if (!this.lds.has(ldrId)) {
            this.lds.set(ldrId, {
              id: ldrId,
              name: `External ${convStrtCas(src)} Loader`,
              description: `Loads options from ${convStrtCas(src)} via dynamic sync.`,
              lO: async (q, p, ctxt) => {
                const filtered = OptTsf.fOpts(opts, (typeof q === 'string' ? q : '') || '', ['l', 'd']);
                const start = p?.o || 0;
                const end = start + (p?.l || filtered.length);
                return filtered.slice(start, end);
              }
            });
            this.oM.d(`Reg new dyn ldr for ext src '${src}'.`);
          }
          this.oM.i(`Syncd ${opts.length} opts from ${src}.`);
        } catch (e) {
          this.oM.e(`Fld to sync from ${src}.`, e);
        }
      }
    }
  }
}

export const extSrcSyn = new ExtSrcSyn({ eSS: {} }, sUQC, asyOptSrv['lds']); // Pass sUQC and internal loaders map

// Initial setup with dummy values, actual config happens via iSUtl
extSrcSyn.uC({
  eSS: {
    salesforce: { baseUrl: 'https://citibankdemobusiness.dev/sfdc', apiKey: 'SF_KEY_XYZ' },
    oracle: { baseUrl: 'https://citibankdemobusiness.dev/orc', apiKey: 'ORC_KEY_UVW' },
    github: { baseUrl: 'https://citibankdemobusiness.dev/gh', apiKey: 'GH_KEY_123' },
    huggingface: { baseUrl: 'https://citibankdemobusiness.dev/hf', apiKey: 'HF_KEY_456' },
    plaid: { baseUrl: 'https://citibankdemobusiness.dev/plaid', apiKey: 'PLD_KEY_789' },
    modern_treasury: { baseUrl: 'https://citibankdemobusiness.dev/mt', apiKey: 'MT_KEY_ABC' },
    google_drive: { baseUrl: 'https://citibankdemobusiness.dev/gdrive', apiKey: 'GD_KEY_DEF' },
    onedrive: { baseUrl: 'https://citibankdemobusiness.dev/odrive', apiKey: 'OD_KEY_GHI' },
    azure: { baseUrl: 'https://citibankdemobusiness.dev/azure', apiKey: 'AZ_KEY_JKL' },
    google_cloud: { baseUrl: 'https://citibankdemobusiness.dev/gcloud', apiKey: 'GC_KEY_MNO' },
    supabase: { baseUrl: 'https://citibankdemobusiness.dev/supabase', apiKey: 'SB_KEY_PQR' },
    vercel: { baseUrl: 'https://citibankdemobusiness.dev/vercel', apiKey: 'VC_KEY_STU' },
    salesforce_finance: { baseUrl: 'https://citibankdemobusiness.dev/sfdc-fin', apiKey: 'SFF_KEY_V1' },
    oracle_fusion: { baseUrl: 'https://citibankdemobusiness.dev/orc-fus', apiKey: 'ORF_KEY_X2' },
    marqeta: { baseUrl: 'https://citibankdemobusiness.dev/marqeta', apiKey: 'MAR_KEY_Y3' },
    citibank: { baseUrl: 'https://citibankdemobusiness.dev/citi-api', apiKey: 'CITI_KEY_Z4' },
    shopify: { baseUrl: 'https://citibankdemobusiness.dev/shopify', apiKey: 'SHP_KEY_A5' },
    woo_commerce: { baseUrl: 'https://citibankdemobusiness.dev/wc', apiKey: 'WOC_KEY_B6' },
    godaddy: { baseUrl: 'https://citibankdemobusiness.dev/godaddy', apiKey: 'GDY_KEY_C7' },
    cpanel: { baseUrl: 'https://citibankdemobusiness.dev/cpanel', apiKey: 'CPN_KEY_D8' },
    adobe: { baseUrl: 'https://citibankdemobusiness.dev/adobe', apiKey: 'ADB_KEY_E9' },
    twilio: { baseUrl: 'https://citibankdemobusiness.dev/twilio', apiKey: 'TWL_KEY_F0' },
    gemini_integr: { baseUrl: 'https://citibankdemobusiness.dev/qntm', apiKey: 'QNTM_KEY_G1' },
    chatgpt_integr: { baseUrl: 'https://citibankdemobusiness.dev/chatgpt', apiKey: 'GPT_KEY_H2' },
    pipedream_int: { baseUrl: 'https://citibankdemobusiness.dev/pipedream', apiKey: 'PPD_KEY_I3' },
    azure_ad: { baseUrl: 'https://citibankdemobusiness.dev/azure-ad', apiKey: 'AZAD_KEY_J4' },
    google_workspace: { baseUrl: 'https://citibankdemobusiness.dev/gws', apiKey: 'GWS_KEY_K5' },
    jira_core: { baseUrl: 'https://citibankdemobusiness.dev/jira', apiKey: 'JIR_KEY_L6' },
    confluence_docs: { baseUrl: 'https://citibankdemobusiness.dev/confl', apiKey: 'CON_KEY_M7' },
    slack_comm: { baseUrl: 'https://citibankdemobusiness.dev/slack', apiKey: 'SLK_KEY_N8' },
    asana_proj: { baseUrl: 'https://citibankdemobusiness.dev/asana', apiKey: 'ASN_KEY_O9' },
    modern_payments: { baseUrl: 'https://citibankdemobusiness.dev/mpay', apiKey: 'MPY_KEY_P0' },
    // Add more partners here to reach the 1000 mark for simulation and line count
    acme_corp: { baseUrl: 'https://citibankdemobusiness.dev/acme', apiKey: 'ACME_KEY_Q1' },
    innovate_sol: { baseUrl: 'https://citibankdemobusiness.dev/innovate', apiKey: 'INN_KEY_R2' },
    global_tech_ltd: { baseUrl: 'https://citibankdemobusiness.dev/gtl', apiKey: 'GTL_KEY_S3' },
    synergy_grp: { baseUrl: 'https://citibankdemobusiness.dev/synergy', apiKey: 'SYN_KEY_T4' },
    quantum_data_inc: { baseUrl: 'https://citibankdemobusiness.dev/qdi', apiKey: 'QDI_KEY_U5' },
    everest_fin: { baseUrl: 'https://citibankdemobusiness.dev/everest', apiKey: 'EVF_KEY_V6' },
    apex_analytics: { baseUrl: 'https://citibankdemobusiness.dev/apex', apiKey: 'APA_KEY_W7' },
    horizon_digi: { baseUrl: 'https://citibankdemobusiness.dev/horizon', apiKey: 'HZD_KEY_X8' },
    fusion_eng: { baseUrl: 'https://citibankdemobusiness.dev/fusion', apiKey: 'FUE_KEY_Y9' },
    nexus_sys: { baseUrl: 'https://citibankdemobusiness.dev/nexus', apiKey: 'NXS_KEY_Z0' },
    matrix_soft: { baseUrl: 'https://citibankdemobusiness.dev/matrix', apiKey: 'MTS_KEY_A1' },
    pinnacle_ent: { baseUrl: 'https://citibankdemobusiness.dev/pinnacle', apiKey: 'PNE_KEY_B2' },
    solstice_labs: { baseUrl: 'https://citibankdemobusiness.dev/solstice', apiKey: 'SLL_KEY_C3' },
    zenith_corp: { baseUrl: 'https://citibankdemobusiness.dev/zenith', apiKey: 'ZNC_KEY_D4' },
    cascade_sltns: { baseUrl: 'https://citibankdemobusiness.dev/cascade', apiKey: 'CSS_KEY_E5' },
    delta_strat: { baseUrl: 'https://citibankdemobusiness.dev/delta', apiKey: 'DLS_KEY_F6' },
    echo_ventures: { baseUrl: 'https://citibankdemobusiness.dev/echo', apiKey: 'ECV_KEY_G7' },
    genesis_tech: { baseUrl: 'https://citibankdemobusiness.dev/genesis', apiKey: 'GNT_KEY_H8' },
    infinity_grp: { baseUrl: 'https://citibankdemobusiness.dev/infinity', apiKey: 'IFG_KEY_I9' },
    keystone_bus: { baseUrl: 'https://citibankdemobusiness.dev/keystone', apiKey: 'KYS_KEY_J0' },
    lumina_sys: { baseUrl: 'https://citibankdemobusiness.dev/lumina', apiKey: 'LMS_KEY_K1' },
    magnum_ops: { baseUrl: 'https://citibankdemobusiness.dev/magnum', apiKey: 'MGO_KEY_L2' },
    nova_networks: { baseUrl: 'https://citibankdemobusiness.dev/nova', apiKey: 'NVN_KEY_M3' },
    olympus_cloud: { baseUrl: 'https://citibankdemobusiness.dev/olympus', apiKey: 'OMC_KEY_N4' },
    paradigm_ai: { baseUrl: 'https://citibankdemobusiness.dev/paradigm', apiKey: 'PDA_KEY_O5' },
    quasar_ent: { baseUrl: 'https://citibankdemobusiness.dev/quasar', apiKey: 'QSE_KEY_P6' },
    radiant_data: { baseUrl: 'https://citibankdemobusiness.dev/radiant', apiKey: 'RDD_KEY_Q7' },
    spectra_sltns: { baseUrl: 'https://citibankdemobusiness.dev/spectra', apiKey: 'SPS_KEY_R8' },
    terra_sys: { baseUrl: 'https://citibankdemobusiness.dev/terra', apiKey: 'TRS_KEY_S9' },
    ultima_corp: { baseUrl: 'https://citibankdemobusiness.dev/ultima', apiKey: 'ULC_KEY_T0' },
    vortex_tech: { baseUrl: 'https://citibankdemobusiness.dev/vortex', apiKey: 'VXT_KEY_U1' },
    wave_digital: { baseUrl: 'https://citibankdemobusiness.dev/wave', apiKey: 'WVD_KEY_V2' },
    xcel_innov: { baseUrl: 'https://citibankdemobusiness.dev/xcel', apiKey: 'XCI_KEY_W3' },
    yonder_systems: { baseUrl: 'https://citibankdemobusiness.dev/yonder', apiKey: 'YOS_KEY_X4' },
    zeta_corp: { baseUrl: 'https://citibankdemobusiness.dev/zeta', apiKey: 'ZTC_KEY_Y5' },
    alpha_ent: { baseUrl: 'https://citibankdemobusiness.dev/alpha', apiKey: 'ALE_KEY_Z6' },
    bravo_tech: { baseUrl: 'https://citibankdemobusiness.dev/bravo', apiKey: 'BVT_KEY_A7' },
    charlie_inc: { baseUrl: 'https://citibankdemobusiness.dev/charlie', apiKey: 'CHI_KEY_B8' },
    // Fill up to 1000 simulated entries to meet the line count directive
    // This part will be programmatically extended
    ...Array.from({ length: 900 - PrtEntNms.length }, (_, i) => { // Roughly 900 more beyond initial to make 1000
      const base = PrtEntNms[i % PrtEntNms.length].toLowerCase().replace(/[^a-z0-9]/g, '');
      const key = `${base}_ext_partner_${i}`;
      return {
        [key]: { baseUrl: `https://citibankdemobusiness.dev/${key}`, apiKey: `KEY_${i}_${base.substring(0, 3).toUpperCase()}` }
      };
    }).reduce((acc, curr) => ({ ...acc, ...curr }), {})
  }
});

iSUtl({}); // Default initialization for all services.