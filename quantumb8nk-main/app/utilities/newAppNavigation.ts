type qryPrm = Record<string, string | string[]>;
type cnsLgrLvl = "dbg" | "inf" | "wrn" | "err";
interface lgrI {
  dbg(m: string, c?: object): void;
  inf(m: string, c?: object): void;
  wrn(m: string, c?: object): void;
  err(m: string, e?: Error | unknown, c?: object): void;
}
class cnsLgr implements lgrI {
  private pfx = "[appNvg]";
  private enb = true;
  constructor(e: boolean = true) {
    this.enb = e;
  }
  private l(l: cnsLgrLvl, m: string, c?: object, e?: Error | unknown) {
    if (!this.enb) return;
    const t = new Date().toISOString();
    const fM = `${t} ${this.pfx} [${l.toUpperCase()}] ${m}`;
    const lA: any[] = [fM];
    if (c) {
      lA.push(c);
    }
    if (e) {
      lA.push(e);
    }
    switch (l) {
      case "dbg":
        console.debug(...lA);
        break;
      case "inf":
        console.info(...lA);
        break;
      case "wrn":
        console.warn(...lA);
        break;
      case "err":
        console.error(...lA);
        break;
      default:
        console.log(...lA);
    }
  }
  dbg(m: string, c?: object): void {
    this.l("dbg", m, c);
  }
  inf(m: string, c?: object): void {
    this.l("inf", m, c);
  }
  wrn(m: string, c?: object): void {
    this.l("wrn", m, c);
  }
  err(m: string, e?: Error | unknown, c?: object): void {
    this.l("err", m, e, c);
  }
}
export const appNvgLgr: lgrI = new cnsLgr(
  typeof process !== 'undefined' && (process.env.NODE_ENV !== "production" || process.env.APP_NAV_DBG_ENB === "true")
);
export class appNvgErr extends Error {
  constructor(m: string, c: string = "NVG_GNR", oE?: Error | unknown) {
    super(m);
    this.name = "appNvgErr";
    appNvgLgr.err(`appNvgErr [${c}]: ${m}`, oE, { c });
  }
}
enum nvgTgtT {
  iRte = "i_rte",
  eUrl = "e_url",
  mO = "m_o",
  aTrg = "a_trg",
  dCmp = "d_cmp",
  fRpt = "f_rpt",
  pGth = "p_gth",
  sAdm = "s_adm",
  uPfl = "u_pfl",
  aAnl = "a_anl",
  bTrd = "b_trd",
  cPrm = "c_prm",
  dSup = "d_sup",
  eDoc = "e_doc",
  fMgr = "f_mgr",
  gSts = "g_sts",
  hMnt = "h_mnt",
  iAud = "i_aud",
  jPmt = "j_pmt",
  kCst = "k_cst",
  lLgn = "l_lgn",
  mMkt = "m_mkt",
  nOrd = "n_ord",
  oPrd = "o_prd",
  qTsk = "q_tsk",
  rSls = "r_sls",
  tTnx = "t_tnx",
  vInv = "v_inv",
  xRsk = "x_rsk",
  yFnc = "y_fnc",
  zCmp = "z_cmp",
  aaSc = "aa_sc",
  abRgn = "ab_rgn",
  acEnv = "ac_env",
  adPrj = "ad_prj",
  aeAcc = "ae_acc",
  afSet = "af_set",
  agNtf = "ag_ntf",
  ahEvt = "ah_evt",
  aiUsr = "ai_usr",
  ajGrp = "aj_grp",
  akApp = "ak_app",
  alPln = "al_pln",
  amRpr = "am_rpr",
  anCfg = "an_cfg",
  aoLyc = "ao_lyc",
  apTst = "ap_tst",
  aqDpl = "aq_dpl",
  arPck = "ar_pck",
  asDlvr = "as_dlvr",
  atSrv = "at_srv",
  auCnt = "au_cnt",
  avMdl = "av_mdl",
  awAgt = "aw_agt",
  axCns = "ax_cns",
  ayOps = "ay_ops",
  azQlty = "az_qlty",
  baPrtl = "ba_prtl",
  bbWkg = "bb_wkg",
  bcPrcs = "bc_prcs",
  bdSrm = "bd_srm",
  beDts = "be_dts",
  bfEcm = "bf_ecm",
  bgHrm = "bg_hrm",
  bhLgl = "bh_lgl",
  biMng = "bi_mng",
  bjNtw = "bj_ntw",
  bkOpr = "bk_opr",
  blRsv = "bl_rsv",
  bmSptr = "bm_sptr",
  bnTnt = "bn_tnt",
  boVdr = "bo_vdr",
  bpWbst = "bp_wbst",
  bqXchg = "bq_xchg",
  brYld = "br_yld",
  bsZne = "bs_zne",
  btCmpn = "bt_cmpn",
  buBdg = "bu_bdg",
  bvCrd = "bv_crd",
  bwDsh = "bw_dsh",
  bxEnrl = "bx_enrl",
  byFltr = "by_fltr",
  bzGrnt = "bz_grnt",
  caHghl = "ca_hghl",
  cbIntr = "cb_intr",
  cdJb = "cd_jb",
  ceKey = "ce_key",
  cfLdr = "cf_ldr",
  cgMnPge = "cg_mnPge",
  chNxtStp = "ch_nxtStp",
  ciOptns = "ci_optns",
  cjPgLd = "cj_pgLd",
  ckQckVw = "ck_qckVw",
  clRcnct = "cl_rcnct",
  cmSgnl = "cm_sgnl",
  cnTkn = "cn_tkn",
  coUpld = "co_upld",
  cpVrfy = "cp_vrfy",
  cqWtch = "cq_wtch",
  crXplor = "cr_xplor",
  csYeld = "cs_yeld",
  ctZmLvl = "ct_zmLvl",
}
interface nvgItm {
  iD: string;
  lbl: string;
  pth?: string;
  icn?: string;
  tgtT: nvgTgtT;
  athRqd?: boolean;
  ftrFlg?: string;
  chd?: nvgItm[];
  mDt?: {
    [k: string]: any;
    aIRnk?: number;
    tgs?: string[];
  };
  prmK?: string;
  rlK?: string;
  cmpID?: string;
}
interface appNvgCnf {
  dfltLndRte: string;
  errRte: string;
  ntFndRte: string;
  aISrvEP?: string;
  ftrFlgEP?: string;
  bseNvgStr: nvgItm[];
  cchDurMs: number;
  enbAIPsnlz: boolean;
  enbAIFtrDcs: boolean;
  bseURL: string;
  cmpNm: string;
  prtnrLnkEP?: string;
  extCmpDtaEP?: string;
  authSrvEP?: string;
  tlmySrvEP?: string;
  aiModMgrEP?: string;
  sctyCnfEP?: string;
}
const coNmAr: string[] = [
  "Gemini", "ChatGPT", "Pipedream", "GitHub", "Hugging Faces", "Plaid", "Modern Treasury", "Google Drive", "OneDrive", "Azure",
  "Google Cloud", "Supabase", "Vercel", "Salesforce", "Oracle", "Marqeta", "Citibank", "Shopify", "WooCommerce", "GoDaddy",
  "Cpanel", "Adobe", "Twilio", "Amazon Web Services", "Microsoft", "Apple", "IBM", "SAP", "Workday", "Zoom", "Slack",
  "HubSpot", "Zendesk", "DocuSign", "Stripe", "PayPal", "Square", "Intuit", "Xero", "FreshBooks", "Kabbage", "Brex",
  "Rippling", "Gusto", "ADP", "QuickBooks", "NetSuite", "ServiceNow", "Atlassian", "Jira", "Confluence", "Trello", "Asana",
  "Monday.com", "Smartsheet", "Wrike", "Basecamp", "Airtable", "ClickUp", "Figma", "Canva", "Sketch", "InVision", "Marvel",
  "Miro", "Lucidchart", "Webflow", "Stripe", "Adyen", "Braintree", "Klarna", "Affirm", "Afterpay", "Sezzle", "Coinbase",
  "Binance", "Kraken", "Revolut", "Wise", "N26", "Chime", "SoFi", "Ally Bank", "Capital One", "JPMorgan Chase", "Bank of America",
  "Wells Fargo", "Goldman Sachs", "Morgan Stanley", "Fidelity", "Charles Schwab", "Vanguard", "BlackRock", "SoftBank",
  "Temasek", "Baidu", "Alibaba", "Tencent", "ByteDance", "JD.com", "Meituan", "Pinduoduo", "Xiaomi", "Huawei", "Samsung",
  "LG", "Hyundai", "Toyota", "Honda", "Nissan", "BMW", "Mercedes-Benz", "Volkswagen", "Audi", "Porsche", "Ford", "General Motors",
  "Tesla", "SpaceX", "Boeing", "Airbus", "Lockheed Martin", "Northrop Grumman", "Raytheon", "General Electric", "Siemens",
  "Schneider Electric", "Honeywell", "3M", "Caterpillar", "John Deere", "Deere & Company", "Coca-Cola", "PepsiCo", "Nestlé",
  "Unilever", "Procter & Gamble", "Johnson & Johnson", "Pfizer", "Merck", "Roche", "Novartis", "Sanofi", "AstraZeneca",
  "Eli Lilly", "Bristol Myers Squibb", "Gilead Sciences", "Moderna", "BioNTech", "Sarepta Therapeutics", "Vertex Pharmaceuticals",
  "Amgen", "Genentech", "Biogen", "Regeneron", "AbbVie", "Takeda", "GlaxoSmithKline", "Novavax", "CureVac", "BioMarin",
  "Alexion Pharmaceuticals", "Zoetis", "IDEXX Laboratories", "Thermo Fisher Scientific", "Danaher Corporation", "Agilent Technologies",
  "PerkinElmer", "Waters Corporation", "Sartorius", "Illumina", "Roche Diagnostics", "Quest Diagnostics", "LabCorp",
  "Eurofins Scientific", "Charles River Laboratories", "Covance", "ICON plc", "PAREXEL", "Wuxi AppTec", "Lonza",
  "Catalent", "Cambrex", "Albemarle", "Linde", "Air Products and Chemicals", "DuPont", "Dow", "BASF", "Bayer",
  "Syngenta", "Corteva Agriscience", "Nutrien", "Mosaic Company", "CF Industries", "Ecolab", "Waste Management", "Republic Services",
  "Veolia Environnement", "Suez", "Xylem", "Pentair", "Emerson Electric", "Rockwell Automation", "ABB", "Siemens Healthineers",
  "Philips", "GE Healthcare", "Medtronic", "Johnson & Johnson MedTech", "Stryker", "Zimmer Biomet", "Boston Scientific",
  "Edwards Lifesciences", "Intuitive Surgical", "ResMed", "Align Technology", "Dentsply Sirona", "Henry Schein", "Patterson Companies",
  "CVS Health", "Walgreens Boots Alliance", "UnitedHealth Group", "Elevance Health", "Centene", "Humana", "Aetna (CVS)",
  "Kaiser Permanente", "HCA Healthcare", "Tenet Healthcare", "Community Health Systems", "Universal Health Services",
  "DaVita Kidney Care", "Fresenius Medical Care", "Guardant Health", "Exact Sciences", "Invitae", "Natera", "Foundation Medicine",
  "23andMe", "Ancestry.com", "MyHeritage", "Color Genomics", "Verily Life Sciences", "Calico", "DeepMind Health", "Tempus",
  "Insitro", "Recursion Pharmaceuticals", "BenevolentAI", "Ginkgo Bioworks", "Synthego", "CRISPR Therapeutics", "Editas Medicine",
  "Intellia Therapeutics", "Beam Therapeutics", "Verve Therapeutics", "Precision Biosciences", "Caribou Biosciences",
  "Arcellx", "CRISPR Therapeutics", "Poseida Therapeutics", "Alnylam Pharmaceuticals", "Ionis Pharmaceuticals", "Moderna Therapeutics",
  "BioMarin Pharmaceutical", "Sarepta Therapeutics", "Neurocrine Biosciences", "Acadia Pharmaceuticals", "GW Pharmaceuticals",
  "Jazz Pharmaceuticals", "Catalyst Pharmaceuticals", "Mallinckrodt", "Teva Pharmaceutical", "Mylan (Viatris)", "Amneal Pharmaceuticals",
  "Endo International", "Hikma Pharmaceuticals", "Dr. Reddy's Laboratories", "Sun Pharmaceutical", "Lupin Limited", "Cipla",
  "Zydus Cadila", "Glenmark Pharmaceuticals", "Torrent Pharmaceuticals", "Biocon", "Aurobindo Pharma", "Divi's Laboratories",
  "Laurus Labs", "Granules India", "Strides Pharma Science", "Jubilant Life Sciences", "Piramal Enterprises", "Gland Pharma",
  "Eris Lifesciences", "Metropolis Healthcare", "Thyrocare Technologies", "Dr Lal PathLabs", "Apollo Hospitals", "Fortis Healthcare",
  "Max Healthcare", "Aster DM Healthcare", "Manipal Hospitals", "Narayana Hrudayalaya", "Rainbow Children's Medicare",
  "Kims Hospitals", "Healthcare Global Enterprises", "Biocon Biologics", "Bharat Biotech", "Serum Institute of India",
  "Panacea Biotec", "Wockhardt", "Alembic Pharmaceuticals", "Ipca Laboratories", "Ajanta Pharma", "Indoco Remedies", "Marksans Pharma",
  "Sequent Scientific", "J.B. Chemicals & Pharmaceuticals", "Fermenta Biotech", "Syngene International", "Reliance Life Sciences",
  "Strides Pharma", "Suven Pharmaceuticals", "Venus Remedies", "Vivimed Labs", "Wintac Limited", "Adani Group", "Reliance Industries",
  "Tata Group", "Mahindra Group", "Wipro", "Infosys", "TCS", "HCL Technologies", "Tech Mahindra", "L&T Infotech", "Mindtree",
  "Persistent Systems", "Mphasis", "Coforge", "Hexaware Technologies", "Capgemini India", "Accenture India", "Cognizant India",
  "Infosys BPM", "Wipro GE Healthcare", "Crompton Greaves Consumer Electricals", "Havells India", "Voltas", "Blue Star",
  "Dixon Technologies", "Amber Enterprises India", "Symphony Limited", "Bajaj Electricals", "Finolex Cables", "Polycab India",
  "KEI Industries", "Sterlite Technologies", "Himachal Futuristic Communications", "Tejas Networks", "ITI Limited", "Bharti Airtel",
  "Vodafone Idea", "Reliance Jio", "Tata Communications", "Indus Towers", "Sterlite Power Transmission", "Adani Transmission",
  "Power Grid Corporation of India", "NTPC Limited", "NHPC Limited", "JSW Energy", "Tata Power", "Adani Green Energy",
  "Renew Power", "Azure Power Global", "ReNew Energy Global", "Suzlon Energy", "Inox Wind", "Borosil Renewables", "Waaree Energies",
  "Vikram Solar", "Adani Solar", "Tata Power Solar", "Emmvee", "Goldi Solar", "Premier Energies", "Saatvik Green Energy",
  "Cosmic PV Power", "RenewSys India", "Servotech Power Systems", "Solar Industries India", "Bharat Forge", "Apollo Tyres",
  "MRF Limited", "Ceat Limited", "JK Tyre & Industries", "Balkrishna Industries", "TVS Srichakra", "Rajratan Global Wire",
  "Goodyear India", "Continental India", "Michelin India", "Bridgestone India", "Pirelli India", "Apollo Tyres Vredestein BV",
  "JK Tornel", "Mahindra & Mahindra", "Tata Motors", "Maruti Suzuki India", "Hyundai Motor India", "Kia India", "Honda Cars India",
  "Toyota Kirloskar Motor", "Renault India", "Nissan India", "MG Motor India", "Skoda Auto Volkswagen India", "Force Motors",
  "Ashok Leyland", "Volvo Eicher Commercial Vehicles", "Tata Motors Commercial Vehicles", "Mahindra Last Mile Mobility",
  "Ola Electric", "Ather Energy", "Hero Electric", "Bajaj Auto", "TVS Motor Company", "Royal Enfield", "Suzuki Motorcycle India",
  "Honda Motorcycle and Scooter India", "Yamaha Motor India", "Harley-Davidson India", "Kawasaki Motors India", "KTM India",
  "Piaggio Vehicles India", "Greaves Electric Mobility", "Okaya EV", "Ampere Vehicles", "Joy E-bike", "Hero Cycles",
  "TI Cycles of India", "Avon Cycles", "Atlas Cycles", "Lectro E-mobility", "Firefox Bikes", "Scott Sports India",
  "Specialized India", "Giant Bicycles India", "Trek Bicycle India", "Merida India", "Cannondale India", "Bianchi India",
  "GoPro", "DJI", "Garmin", "Peloton", "Fitbit", "Whoop", "Oura Ring", "Apple Watch", "Samsung Galaxy Watch", "Google Pixel Watch",
  "OnePlus Watch", "Xiaomi Watch", "Amazfit", "TicWatch", "Fossil Smartwatches", "Casio G-Shock", "Suunto", "Polar", "Coros",
  "Wahoo", "Hammerhead", "Stages Cycling", "SRM", "Quarq", "Shimano", "SRAM", "Campagnolo", "FSA", "Easton Cycling",
  "Zipp", "Reynolds Cycling", "ENVE Composites", "DT Swiss", "Mavic", "Roval Components", "Fulcrum Wheels", "Vision",
  "3T Cycling", "Specialized Components", "Bontrager", "Pro Bikegear", "Ritchey", "Thomson Bike Parts", "Crankbrothers",
  "Look Cycle", "Speedplay", "Time Sport", "Assioma", "Garmin Vector", "Wahoo PowrLink Zero", "Stages Power Meter",
  "SRM Origin Power Meter", "Quarq DZero", "Shimano Dura-Ace", "SRAM Red eTap AXS", "Campagnolo Super Record EPS",
  "Kask", "POC", "Giro", "Bell Helmets", "Specialized Helmets", "Lazer Sport", "Met Helmets", "Uvex Sports", "Sweet Protection",
  "Troy Lee Designs", "Fox Racing", "100%", "Oakley", "Smith Optics", "POC Sports", "Rudy Project", "Julbo", "Ethen",
  "Scicon Sports", "Bolle", "Adidas Eyewear", "Nike Eyewear", "Mizuno", "ASICS", "New Balance", "Under Armour", "Puma",
  "Reebok", "Brooks Running", "Hoka One One", "Saucony", "Altra Running", "Topo Athletic", "Salomon", "Merrell", "Columbia Sportswear",
  "The North Face", "Patagonia", "Arc'teryx", "Mammut", "Black Diamond", "Petzl", "Osprey Packs", "Deuter", "Gregory Packs",
  "Thule", "Yakima", "Kuat", "RockyMounts", "Saris", "Curt Manufacturing", "Draw-Tite", "Reese Towpower", "U-Haul",
  "Enterprise Rent-A-Car", "Hertz", "Avis", "Budget", "National Car Rental", "Alamo Rent A Car", "Sixt", "Europcar",
  "Dollar Thrifty", "Zipcar", "Car2Go", "Share Now", "Getaround", "Turo", "Waymo", "Cruise Automation", "Argo AI",
  "Aurora Innovation", "Motional", "Zoox", "Nuro", "Gatik", "Plus.ai", "TuSimple", "Embark Trucks", "Kodiak Robotics",
  "Roblox", "Epic Games", "Unity Technologies", "Unreal Engine", "Valve Corporation", "Activision Blizzard", "Electronic Arts",
  "Take-Two Interactive", "Nintendo", "Sony Interactive Entertainment", "Microsoft Xbox", "Ubisoft", "Capcom", "Square Enix",
  "Bandai Namco", "Sega", "Konami", "CD Projekt Red", "Bungie", "FromSoftware", "Rockstar Games", "Naughty Dog",
  "Insomniac Games", "Santa Monica Studio", "Guerrilla Games", "Sucker Punch Productions", "Housemarque", "Media Molecule",
  "Bluepoint Games", "Remedy Entertainment", "Arkane Studios", "id Software", "Bethesda Game Studios", "Infinity Ward",
  "Treyarch", "Sledgehammer Games", "Raven Software", "Blizzard Entertainment", "BioWare", "Respawn Entertainment",
  "DICE", "Criterion Games", "Insomniac Games", "Obsidian Entertainment", "Larian Studios", "CD Projekt", "Digital Extremes",
  "Grinding Gear Games", "Valve Software", "Mojang Studios", "Mediatonic", "Fall Guys", "Psyonix", "Rocket League",
  "House Party", "Innersloth", "Among Us", "Re-Logic", "Terraria", "ConcernedApe", "Stardew Valley", "Hello Games",
  "No Man's Sky", "Facepunch Studios", "Rust", "Studio Wildcard", "Ark: Survival Evolved", "Frontier Developments",
  "Elite Dangerous", "Planet Coaster", "Jagex", "Runescape", "CCP Games", "EVE Online", "Paradox Interactive", "Crusader Kings",
  "Cities: Skylines", "Team17", "Worms", "Ghost Ship Games", "Deep Rock Galactic", "Klei Entertainment", "Don't Starve",
  "Coffee Stain Studios", "Satisfactory", "Deep Silver", "Volition", "Saints Row", "IO Interactive", "Hitman",
  "Frontier Foundry", "Asobo Studio", "A Plague Tale", "Owlcat Games", "Pathfinder", "Focus Home Interactive", "Deck13",
  "The Surge", "Ubisoft Montreal", "Assassin's Creed", "Far Cry", "Ubisoft Quebec", "Immortals Fenyx Rising",
  "Ubisoft San Francisco", "South Park: The Fractured But Whole", "Ubisoft Toronto", "Splinter Cell", "Watch Dogs",
  "Ubisoft Massive", "The Division", "Ubisoft Annecy", "Steep", "Ubisoft Chengdu", "Mario + Rabbids Sparks of Hope",
  "Ubisoft Barcelona", "Riders Republic", "Ubisoft Bucharest", "The Crew", "Ubisoft Sofia", "Assassin's Creed Rogue",
  "Ubisoft Milan", "Mario + Rabbids Kingdom Battle", "Ubisoft Montpellier", "Beyond Good & Evil 2", "Ubisoft Paris",
  "Ghost Recon Breakpoint", "Ubisoft Singapore", "Skull & Bones", "Ubisoft Berlin", "The Settlers", "Ubisoft Bordeaux",
  "Beyond Good & Evil 2", "Ubisoft Da Nang", "Anno 1800", "Ubisoft Pune", "Just Dance", "Ubisoft Casablanca",
  "Rainbow Six Siege", "Ubisoft Kyiv", "For Honor", "Ubisoft Abu Dhabi", "Brawlhalla", "Ubisoft Halifax",
  "The Mighty Quest for Epic Loot", "Ubisoft Osaka", "Rayman Mini", "Ubisoft Winnipeg", "Far Cry 6",
  "Ubisoft Saguenay", "Hyperscape", "Ubisoft Sherbrooke", "Roller Champions", "Ubisoft Ivory Tower", "The Crew 2",
  "Ubisoft Düsseldorf", "Anno 1800", "Ubisoft Mainz", "Anno 1800", "Ubisoft Blue Byte", "The Settlers",
  "Ubisoft Reflections", "Driver", "Ubisoft Leamington", "Watch Dogs Legion", "Ubisoft Belgrade",
  "Ghost Recon Breakpoint", "Ubisoft Stockholm", "Star Wars Outlaws", "Ubisoft Singapore", "Skull and Bones",
  "Ubisoft Chengdu", "Mario + Rabbids Sparks of Hope", "Ubisoft Sherbrooke", "Roller Champions", "Ubisoft Saguenay",
  "Hyperscape", "Ubisoft Winnipeg", "Far Cry 6", "Ubisoft Abu Dhabi", "Brawlhalla", "Ubisoft Kyiv",
  "For Honor", "Ubisoft Casablanca", "Rainbow Six Siege", "Ubisoft Pune", "Just Dance", "Ubisoft Da Nang",
  "Anno 1800", "Ubisoft Bordeaux", "Beyond Good & Evil 2", "Ubisoft Berlin", "The Settlers",
  "Ubisoft Montpellier", "Beyond Good & Evil 2", "Ubisoft Milan", "Mario + Rabbids Kingdom Battle",
  "Ubisoft Sofia", "Assassin's Creed Rogue", "Ubisoft Bucharest", "The Crew", "Ubisoft Annecy", "Steep",
  "Ubisoft Massive", "The Division", "Ubisoft Toronto", "Splinter Cell", "Watch Dogs", "Ubisoft San Francisco",
  "South Park: The Fractured But Whole", "Ubisoft Quebec", "Immortals Fenyx Rising", "Ubisoft Montreal",
  "Assassin's Creed", "Far Cry", "Ubisoft Ivory Tower", "The Crew 2", "Ubisoft Düsseldorf", "Anno 1800",
  "Ubisoft Mainz", "Anno 1800", "Ubisoft Blue Byte", "The Settlers", "Ubisoft Reflections", "Driver",
  "Ubisoft Leamington", "Watch Dogs Legion", "Ubisoft Belgrade", "Ghost Recon Breakpoint",
  "Ubisoft Stockholm", "Star Wars Outlaws", "Atypical Consulting", "Quantum Innovations", "Synergy Solutions Group",
  "Nebula Systems", "Apex Dynamics Inc.", "Pinnacle Tech Ventures", "Fusion Global Services", "Horizon Digital Labs",
  "Vortex Analytics", "Summit Innovations Co.", "Cascade Data Solutions", "Element X Tech", "Gateway Networks Ltd.",
  "Infinity Systems Corp.", "Kinetic Software Group", "Luminous Edge Technologies", "Magna Core Solutions",
  "NovaStream Data", "OptiLink Systems", "Pulse Innovations Group", "Quasar Tech Co.", "Radiant Software Solutions",
  "Stellar Dynamics", "TerraNova Tech", "Unison Global Systems", "Vertex Solutions Inc.", "Wavefront Innovations",
  "Xenon Digital Labs", "YottaByte Technologies", "Zenith Systems Group", "Alpha Omega Corp.", "Beta Prime Solutions",
  "Gamma Delta Innovations", "Epsilon Systems Group", "Zeta Sigma Tech", "Eta Theta Ventures", "Iota Kappa Labs",
  "Lambda Mu Solutions", "Nu Xi Innovations", "Omicron Pi Systems", "Rho Sigma Tech", "Tau Upsilon Ventures",
  "Phi Chi Labs", "Psi Omega Solutions", "Delta Alpha Corp.", "Theta Beta Solutions", "Kappa Gamma Innovations",
  "Mu Delta Systems", "Xi Epsilon Tech", "Pi Zeta Ventures", "Sigma Eta Labs", "Upsilon Theta Solutions",
  "Chi Iota Innovations", "Omega Lambda Systems", "Aethelred Software", "Beowulf Solutions", "Cnut Innovations",
  "Dunstan Digital", "Eadwig Systems", "Folcwald Tech", "Guthred Global", "Harthacnut Labs", "Ingram Innovations",
  "Jarlath Ventures", "Kenelm Software", "Leofric Solutions", "Mildred Digital", "Nigel Systems", "Osric Tech",
  "Penda Global", "Quenburh Labs", "Ragnar Innovations", "Sigebert Ventures", "Thorkel Software", "Ulfric Solutions",
  "Valdemar Digital", "Wulfstan Systems", "Xerxes Tech", "Yngling Global", "Zoltan Labs", "Alaric Innovations",
  "Brendan Ventures", "Cerdic Software", "Dagmar Solutions", "Ethelred Digital", "Freya Systems", "Gareth Tech",
  "Hakon Global", "Ivar Labs", "Jocelyn Innovations", "Kathryn Ventures", "Leif Software", "Morwen Solutions",
  "Niall Digital", "Olaf Systems", "Piers Tech", "Quintin Global", "Rosamund Labs", "Sweyn Innovations",
  "Tigernach Ventures", "Uhtred Software", "Viggo Solutions", "Willa Digital", "Xenia Systems", "Yrsa Tech",
  "Zoe Labs", "Adalric Innovations", "Berenice Ventures", "Caspian Software", "Dagobert Solutions", "Eadric Digital",
  "Florian Systems", "Godric Tech", "Hildegard Global", "Ignatius Labs", "Jacinta Innovations", "Kaelen Ventures",
  "Leopold Software", "Marcella Solutions", "Nigel Digital", "Octavia Systems", "Pascal Tech", "Quincie Global",
  "Raphael Labs", "Sabina Innovations", "Theobald Ventures", "Ursula Software", "Valerian Solutions", "Wilhelmina Digital",
  "Xavier Systems", "Yvette Tech", "Zoltan Labs", "Agathon Innovations", "Blanche Ventures", "Cassian Software",
  "Desmond Solutions", "Elara Digital", "Fabian Systems", "Gideon Tech", "Honora Global", "Irene Labs",
  "Jethro Innovations", "Kian Ventures", "Lorcan Software", "Maia Solutions", "Noel Digital", "Ophelia Systems",
  "Peregrine Tech", "Quorra Global", "Rowan Labs", "Seraphina Innovations", "Thaddeus Ventures", "Una Software",
  "Valentine Solutions", "Willow Digital", "Xylia Systems", "Yves Tech", "Zephyr Labs", "Aerion Innovations",
  "Bronte Ventures", "Callista Software", "Darian Solutions", "Elias Digital", "Fiona Systems", "Gavin Tech",
  "Helena Global", "Indigo Labs", "Jasmine Innovations", "Kai Ventures", "Lara Software", "Marius Solutions",
  "Nola Digital", "Orion Systems", "Phoebe Tech", "Quinn Global", "Rhea Labs", "Silas Innovations",
  "Tamsin Ventures", "Una Software", "Valen Solutions", "Wren Digital", "Xenia Systems", "Yara Tech",
  "Zola Labs", "Aidan Innovations", "Briar Ventures", "Caelan Software", "Delaney Solutions", "Eamon Digital",
  "Faelan Systems", "Gemma Tech", "Hayden Global", "Ira Labs", "Juno Innovations", "Kieran Ventures",
  "Lila Software", "Mina Solutions", "Niamh Digital", "Owen Systems", "Piper Tech", "Quinlan Global",
  "Rory Labs", "Sasha Innovations", "Tiernan Ventures", "Ula Software", "Vivian Solutions", "Wyatt Digital",
  "Xanti Systems", "Yael Tech", "Zyla Labs", "Alden Innovations", "Brenna Ventures", "Cora Software",
  "Declan Solutions", "Erin Digital", "Fionn Systems", "Gwen Tech", "Hugh Labs", "Idris Innovations",
  "Jasper Ventures", "Kira Software", "Lochlan Solutions", "Maeve Digital", "Nolan Systems", "Orla Tech",
  "Phelan Global", "Quillan Labs", "Rhys Innovations", "Siobhan Ventures", "Taryn Software", "Uriel Solutions",
  "Vance Digital", "Willow Systems", "Xylon Tech", "Ysabel Global", "Zane Labs", "Adrian Innovations",
  "Brooke Ventures", "Caleb Software", "Dana Solutions", "Eve Digital", "Flynn Systems", "Grace Tech",
  "Holly Global", "Ivan Labs", "Jade Innovations", "Kyle Ventures", "Leia Software", "Milo Solutions",
  "Nina Digital", "Oscar Systems", "Paige Tech", "Quincy Global", "Ryan Labs", "Sage Innovations",
  "Theo Ventures", "Uma Software", "Valerie Solutions", "Wendy Digital", "Xanthe Systems", "Yuna Tech",
  "Zia Labs"
];
export const dfltAppNvgCnf: appNvgCnf = {
  dfltLndRte: "/dshbd",
  errRte: "/err",
  ntFndRte: "/404",
  aISrvEP: "https://citibankdemobusiness.dev/api/gmnNvgAI",
  ftrFlgEP: "https://citibankdemobusiness.dev/api/ftrFlgs",
  prtnrLnkEP: "https://citibankdemobusiness.dev/api/prtnrs",
  extCmpDtaEP: "https://citibankdemobusiness.dev/api/extcmp",
  authSrvEP: "https://citibankdemobusiness.dev/api/ath",
  tlmySrvEP: "https://citibankdemobusiness.dev/api/tlmy",
  aiModMgrEP: "https://citibankdemobusiness.dev/api/aimdl",
  sctyCnfEP: "https://citibankdemobusiness.dev/api/sctycnf",
  bseNvgStr: [
    {
      iD: "dshbd", lbl: "Dshbd", pth: "/dshbd", icn: "bw_dsh", tgtT: nvgTgtT.iRte, athRqd: true,
    },
    {
      iD: "anltc", lbl: "Anltc", pth: "/anltc", icn: "a_anl", tgtT: nvgTgtT.iRte, athRqd: true, ftrFlg: "FEAT_ANL_V2",
      chd: [
        {
          iD: "rpts", lbl: "Rpts", pth: "/anltc/rpts", icn: "f_rpt", tgtT: nvgTgtT.iRte, athRqd: true,
        },
        {
          iD: "trds", lbl: "Trds", pth: "/anltc/trds", icn: "b_trd", tgtT: nvgTgtT.iRte, athRqd: true, ftrFlg: "FEAT_AI_TRDS",
        },
      ],
    },
    {
      iD: "sttngs", lbl: "Sttngs", pth: "/sttngs", icn: "af_set", tgtT: nvgTgtT.iRte, athRqd: true,
      chd: [
        {
          iD: "prfl", lbl: "Prfl", pth: "/sttngs/prfl", icn: "uPfl", tgtT: nvgTgtT.iRte, athRqd: true,
        },
        {
          iD: "prfrncs", lbl: "Prfrncs", pth: "/sttngs/prfrncs", icn: "cPrm", tgtT: nvgTgtT.iRte, athRqd: true, ftrFlg: "FEAT_USR_PRFS",
        },
      ],
    },
    {
      iD: "hlp", lbl: "Hlp & Spt", pth: "https://citibankdemobusiness.dev/spt", icn: "dSup", tgtT: nvgTgtT.eUrl, mDt: { nwTb: true },
    },
    {
      iD: "nwFtrShwCse", lbl: "Xplr Nw Ftrs", tgtT: nvgTgtT.mO, icn: "ca_hghl", ftrFlg: "FEAT_ONBD_MDL", mDt: { mdID: "nw-ftr-onbd" },
    },
    {
      iD: "prtnrs", lbl: "Prtnrs", pth: "/prtnrs", icn: "pGth", tgtT: nvgTgtT.iRte, athRqd: true, ftrFlg: "FEAT_PRTNR_ITG",
    },
    {
      iD: "admPnl", lbl: "Adm Pnl", pth: "/adm", icn: "sAdm", tgtT: nvgTgtT.iRte, athRqd: true, rlK: "ADMN", ftrFlg: "FEAT_ADMN_V2",
    },
  ],
  cchDurMs: 5 * 60 * 1000,
  enbAIPsnlz: true,
  enbAIFtrDcs: true,
  bseURL: "citibankdemobusiness.dev",
  cmpNm: "Citibank demo business Inc",
};
function prQry(q: string): qryPrm {
  const p: qryPrm = {};
  if (q.length === 0 || q === "?") {
    return p;
  }
  const s = q.startsWith("?") ? q.substring(1) : q;
  const kVP = s.split("&");
  for (const kv of kVP) {
    const d = kv.indexOf("=");
    let k: string, v: string;
    if (d === -1) {
      k = decodeURIComponent(kv);
      v = "";
    } else {
      k = decodeURIComponent(kv.substring(0, d));
      v = decodeURIComponent(kv.substring(d + 1));
    }
    if (p[k]) {
      if (Array.isArray(p[k])) {
        (p[k] as string[]).push(v);
      } else {
        p[k] = [p[k] as string, v];
      }
    } else {
      p[k] = v;
    }
  }
  return p;
}
interface usrSsnCtx {
  uID: string;
  isAtc: boolean;
  rls: string[];
  prm: string[];
  prfs: { [k: string]: any };
  lAT: number;
  sST: number;
}
class usrCtxSrv {
  private static i: usrCtxSrv;
  private cU: usrSsnCtx | null = null;
  private lsnrs: Set<(u: usrSsnCtx | null) => void> = new Set();
  private constructor() {
    this.fCU().then((u) => {
      this.sCU(u);
    });
  }
  public static gI(): usrCtxSrv {
    if (!usrCtxSrv.i) {
      usrCtxSrv.i = new usrCtxSrv();
    }
    return usrCtxSrv.i;
  }
  private async fCU(): Promise<usrSsnCtx | null> {
    appNvgLgr.dbg("Attmpt fCU...");
    return new Promise((r) => {
      setTimeout(() => {
        const sU = typeof localStorage !== 'undefined' ? localStorage.getItem("app_usr_ssn") : null;
        if (sU) {
          const u = JSON.parse(sU);
          appNvgLgr.inf("Usr ctx ld fm ls.", { uID: u.uID });
          r(u);
        } else {
          appNvgLgr.inf("No act usr ssn fnd, rtn anm ctx.");
          r({
            uID: "anm",
            isAtc: false,
            rls: ["GST"],
            prm: ["PBL_RD"],
            prfs: {},
            lAT: Date.now(),
            sST: Date.now(),
          });
        }
      }, 100);
    });
  }
  public gCU(): usrSsnCtx | null {
    return this.cU;
  }
  public sCU(u: usrSsnCtx | null): void {
    if (u) {
      if (typeof localStorage !== 'undefined') localStorage.setItem("app_usr_ssn", JSON.stringify(u));
    } else {
      if (typeof localStorage !== 'undefined') localStorage.removeItem("app_usr_ssn");
    }
    this.cU = u;
    appNvgLgr.inf("Usr ctx upd.", { uID: u?.uID || "null" });
    this.lsnrs.forEach((l) => l(this.cU));
  }
  public aCL(l: (u: usrSsnCtx | null) => void): () => void {
    this.lsnrs.add(l);
    return () => this.lsnrs.delete(l);
  }
  public isAtc(): boolean {
    return this.cU?.isAtc === true;
  }
  public hP(p: string): boolean {
    return this.cU?.prm.includes(p) === true;
  }
  public hR(r: string): boolean {
    return this.cU?.rls.includes(r) === true;
  }
}
export const usrCtxSrvI = usrCtxSrv.gI();
enum ftrFlgS {
  enb = "ENB",
  dsb = "DSB",
  cnd = "CND",
  rlo = "RLO",
  exp = "EXP",
  arc = "ARC",
}
interface ftrDfn {
  nm: string;
  s: ftrFlgS;
  dsc?: string;
  rloP?: number;
  tgtAud?: string[];
  actStr?: "AI_RCM" | "MNL" | "A_B_TST";
  mDt?: {
    [k: string]: any;
    aICnf?: number;
  };
  xpDt?: number;
  grpID?: string;
  vrs?: string;
  prmK?: string;
}
class ftrFlgSrv {
  private static i: ftrFlgSrv;
  private flgs: Map<string, ftrDfn> = new Map();
  private cnf: appNvgCnf = dfltAppNvgCnf;
  private lFT: number = 0;
  private fP: Promise<void> | null = null;
  private constructor() {
    this.fFF().catch((e) =>
      appNvgLgr.err("Init fF fFld", e)
    );
  }
  public static gI(): ftrFlgSrv {
    if (!ftrFlgSrv.i) {
      ftrFlgSrv.i = new ftrFlgSrv();
    }
    return ftrFlgSrv.i;
  }
  public cnfS(c: appNvgCnf): void {
    this.cnf = c;
    appNvgLgr.dbg("ftrFlgSrv cnf.", { c });
  }
  public async fFF(fR: boolean = false): Promise<void> {
    const n = Date.now();
    if (this.fP) {
      return this.fP;
    }
    if (!fR && n - this.lFT < this.cnf.cchDurMs && this.flgs.size > 0) {
      appNvgLgr.dbg("fF frsh, skp fF.");
      return Promise.resolve();
    }
    appNvgLgr.inf("Ftch lst fF...", { fR });
    this.fP = (async () => {
      try {
        const fF: ftrDfn[] = await new Promise((r) => {
          setTimeout(() => {
            const u = usrCtxSrvI.gCU();
            const aIDcsEnb = this.cnf.enbAIFtrDcs;
            const bF: ftrDfn[] = [
              { nm: "FEAT_ANL_V2", s: ftrFlgS.enb, dsc: "Nw anltc dshbd" },
              { nm: "FEAT_AI_TRDS", s: ftrFlgS.dsb, dsc: "AI-pwr trnd prdctns", actStr: "AI_RCM" },
              { nm: "FEAT_USR_PRFS", s: ftrFlgS.rlo, rloP: 50, dsc: "Usr prfrncs pnl" },
              { nm: "FEAT_ONBD_MDL", s: ftrFlgS.cnd, dsc: "Nw ftr onbd mdl", tgtAud: ["NW_USRS"] },
              { nm: "FEAT_ADMN_V2", s: ftrFlgS.dsb, dsc: "Adm dshbd acc", prmK: "ADMN_ACC" },
              { nm: "FEAT_PRTNR_ITG", s: ftrFlgS.dsb, dsc: "Prtnr itg ftr", tgtAud: ["ENT_CLIENTS"] },
              { nm: "FEAT_CMP_DLG", s: ftrFlgS.exp, dsc: "Exp. cmp dshbd lg", xpDt: Date.now() + 86400000 },
              { nm: "FEAT_MULTI_LANG", s: ftrFlgS.enb, dsc: "Multi-lang support" },
              { nm: "FEAT_WHT_LBL", s: ftrFlgS.cnd, dsc: "Wht lbl thmng", grpID: "WHTLBL_GRP" },
              { nm: "FEAT_NFT_MKP", s: ftrFlgS.dsb, dsc: "NFT mktplc itg", actStr: "AI_RCM" },
              { nm: "FEAT_AUDIT_LOG", s: ftrFlgS.enb, dsc: "Audit log system" },
              { nm: "FEAT_SCTY_ENH", s: ftrFlgS.enb, dsc: "Scty enhnc" },
            ];
            const pF = bF.map((f) => {
              let fS = f.s;
              if (aIDcsEnb && f.actStr === "AI_RCM") {
                const aO = this.sAIFD(f, u);
                fS = aO.s;
                f.mDt = { ...f.mDt, aICnf: aO.aICnf };
              }
              if (fS === ftrFlgS.rlo && f.rloP !== undefined) {
                const uH = u?.uID ? this.hS(u.uID) : Math.random();
                if ((uH % 100) > f.rloP) {
                  fS = ftrFlgS.dsb;
                }
              }
              if (fS === ftrFlgS.cnd && f.tgtAud && u) {
                const isT = f.tgtAud.some(a => {
                  if (a === "NW_USRS" && u.sST && (Date.now() - u.sST < 24 * 60 * 60 * 1000)) {
                    return true;
                  }
                  if (u.rls.includes(a)) {
                    return true;
                  }
                  return false;
                });
                if (!isT) {
                  fS = ftrFlgS.dsb;
                }
              }
              if (f.nm === "FEAT_ADMN_V2" && u && u.rls.includes("ADMN")) {
                fS = ftrFlgS.enb;
              }
              if (f.nm === "FEAT_CMP_DLG" && f.xpDt && f.xpDt < Date.now()) {
                fS = ftrFlgS.arc;
              }
              if (f.prmK && u && !u.prm.includes(f.prmK)) {
                fS = ftrFlgS.dsb;
              }
              if (f.grpID === "WHTLBL_GRP" && u?.prfs["whtlbl_enb"]) {
                fS = ftrFlgS.enb;
              }
              return { ...f, s: fS };
            });
            r(pF);
          }, 200);
        });
        this.flgs.clear();
        fF.forEach((f) => this.flgs.set(f.nm, f));
        this.lFT = n;
        appNvgLgr.inf(`Scs fF ${this.flgs.size} fF.`);
      } catch (e) {
        appNvgLgr.err("Fld to fF fF.", e);
        throw new appNvgErr("Fld to fF fF", "FF_FTC_ERR", e);
      } finally {
        this.fP = null;
      }
    })();
    return this.fP;
  }
  private sAIFD(f: ftrDfn, u: usrSsnCtx | null): { s: ftrFlgS; aICnf: number } {
    appNvgLgr.dbg(`AI smlt dcs fr f: ${f.nm}`, { u: u?.uID });
    let s = f.s;
    let c = 0.7;
    if (u && Object.keys(u.prfs).length > 5 && f.nm === "FEAT_AI_TRDS") {
      s = ftrFlgS.enb;
      c = 0.9;
      appNvgLgr.dbg(`AI rcms enb ${f.nm} fr pwr usr.`);
    } else if (u?.rls.includes("TSTR") && f.nm === "FEAT_USR_PRFS") {
      s = ftrFlgS.enb;
      c = 0.95;
      appNvgLgr.dbg(`AI rcms enb ${f.nm} fr TSTR rl.`);
    } else if (u?.isAtc === false && f.nm === "FEAT_USR_PRFS") {
      s = ftrFlgS.dsb;
      c = 0.8;
      appNvgLgr.dbg(`AI rcms dsb ${f.nm} fr anm usr.`);
    } else if (u?.rls.includes("ADMN") && f.nm === "FEAT_NFT_MKP") {
      s = ftrFlgS.enb;
      c = 0.85;
      appNvgLgr.dbg(`AI rcms enb ${f.nm} for ADMN.`);
    }
    return { s, aICnf: c };
  }
  private hS(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      h = (h << 5) - h + c;
      h |= 0;
    }
    return Math.abs(h) % 100;
  }
  public async isFtrFlgEnb(fN: string): Promise<boolean> {
    await this.fFF();
    const f = this.flgs.get(fN);
    if (!f) {
      appNvgLgr.wrn(`fF '${fN}' nt fnd. Dflt to dsb.`, { fN });
      return false;
    }
    const u = usrCtxSrvI.gCU();
    let isE = f.s === ftrFlgS.enb;
    if (f.s === ftrFlgS.rlo) {
      const rP = f.rloP ?? 0;
      const uI = u?.uID || "anm";
      const uH = this.hS(uI);
      isE = uH < rP;
    } else if (f.s === ftrFlgS.cnd) {
      isE = false;
      appNvgLgr.wrn(`fF '${fN}' is cnd and dyn cnd nt met or nt expl dfnd.`, { fS: f.s });
    } else if (f.s === ftrFlgS.exp) {
      isE = f.xpDt ? f.xpDt > Date.now() : false;
      if (!isE) appNvgLgr.inf(`fF '${fN}' exp.`, { f.xpDt });
    } else if (f.s === ftrFlgS.arc) {
      isE = false;
    }
    if (f.prmK && u && !u.prm.includes(f.prmK)) {
      isE = false;
    }
    appNvgLgr.dbg(`Ftr '${fN}' sts: ${isE}`, { fS: f.s, uI: u?.uID });
    return isE;
  }
  public async gFD(fN: string): Promise<ftrDfn | null> {
    await this.fFF();
    return this.flgs.get(fN) || null;
  }
}
export const ftrFlgSrvI = ftrFlgSrv.gI();
interface gmnNvgAI {
  pOP(uI: string, cP: string, c: object): Promise<{ rP: string; c: number; j: string }>;
  pNI(uI: string, cI: nvgItm[], uP: object): Promise<nvgItm[]>;
  aNP(m: nvgMtc[]): Promise<AIMtcAn>;
  sCN(uI: string, nI: nvgItm, c: object): Promise<{ sT: string; sI: string; r: string }>;
  eA(nLS: string, uS: string): Promise<{ s: number; rcm: string[]; c: number }>;
  pCmpD(uI: string, cmpL: string[], c: object): Promise<string[]>;
  gAIRele(uI: string, q: string, c: object): Promise<{ rQ: string, rI: nvgItm[], c: number }>;
}
interface nvgMtc {
  uI: string;
  tS: number;
  p: string;
  dM: number;
  e: string[];
  rfr?: string;
}
interface AIMtcAn {
  oS: number;
  aD: string[];
  pB: Array<{ p: string; i: string; iM: string }>;
  uFI: string[];
  rcm: string[];
}
class gmnNvgAISrv implements gmnNvgAI {
  private static i: gmnNvgAISrv;
  private cnf: appNvgCnf = dfltAppNvgCnf;
  private constructor() { }
  public static gI(): gmnNvgAISrv {
    if (!gmnNvgAISrv.i) {
      gmnNvgAISrv.i = new gmnNvgAISrv();
    }
    return gmnNvgAISrv.i;
  }
  public cnfS(c: appNvgCnf): void {
    this.cnf = c;
    appNvgLgr.dbg("gmnNvgAISrv cnf.", { c });
  }
  public async pOP(uI: string, cP: string, c: object = {}): Promise<{ rP: string; c: number; j: string }> {
    if (!this.cnf.enbAIPsnlz) {
      appNvgLgr.wrn("AI psnlz is dsb. Rtn dflt pP.");
      return Promise.resolve({
        rP: this.cnf.dfltLndRte,
        c: 0,
        j: "AI psnlz dsb.",
      });
    }
    appNvgLgr.inf("Gmn AI: Prdct opt p...", { uI, cP, c });
    return new Promise((r) => {
      setTimeout(() => {
        let rP = this.cnf.dfltLndRte;
        let cnf = 0.6;
        let j = "Bsd on gnl usr flw pttrns.";
        if (cP.includes("sttngs")) {
          rP = "/sttngs/prfl";
          cnf = 0.75;
          j = "Usrs oft chk thr prfl aft vsg sttngs.";
        } else if (cP.includes("dshbd") && uI === "pwr_usr_123") {
          rP = "/anltc/trds";
          cnf = 0.9;
          j = "Idnt as pwr usr, proct gding to adv anltc.";
        } else if (Object.keys(c).includes("hgh_pry_tsk")) {
          rP = "/q_tsk/pry";
          cnf = 0.85;
          j = "Dtc hgh pry tsk in usr ctx, sggstng rlvnt sctn.";
        } else if (cP === "/") {
          const u = usrCtxSrvI.gCU();
          if (u && u.lAT) {
            rP = "/dshbd";
            j = "Gding to dshbd bsd on typcl ent pt.";
          }
        } else if (cP.includes("prtnrs") && uI === "partner_manager_01") {
          rP = "/prtnrs/new_integration";
          cnf = 0.92;
          j = "Prtnr mgr, sggstng nw itg wrkflw.";
        } else if (cP.includes("oPrd")) {
          rP = "/oPrd/lst";
          cnf = 0.8;
          j = "Prd mgrs typclly vw prd lsts.";
        }
        appNvgLgr.dbg("Gmn AI: Opt p prdct cmplt.", { rP, cnf });
        r({ rP, c: cnf, j });
      }, 300);
    });
  }
  public async pNI(uI: string, cI: nvgItm[], uP: object = {}): Promise<nvgItm[]> {
    if (!this.cnf.enbAIPsnlz) {
      appNvgLgr.wrn("AI psnlz is dsb. Rtn un-psnlz nvg itms.");
      return Promise.resolve([...cI]);
    }
    appNvgLgr.inf("Gmn AI: Psnlz nvg itms...", { uI, uP });
    return new Promise((r) => {
      setTimeout(() => {
        let pI = JSON.parse(JSON.stringify(cI)) as nvgItm[];
        if (uI === "pwr_usr_123" || (uP as any).frequentAnalyticsUser) {
          const aI = pI.findIndex((i) => i.iD === "anltc");
          if (aI > -1) {
            const aItm = pI.splice(aI, 1)[0];
            pI.unshift(aItm);
            aItm.mDt = { ...aItm.mDt, aIRnk: 0.95, hghlt: true };
          }
          appNvgLgr.dbg("Gmn AI: Pri Anltc fr pwr usr.");
        }
        if (uI === "new_usr_456") {
          pI = pI.filter(
            (i) => i.iD !== "anltc" || i.ftrFlg === "FEAT_ONBD_MDL"
          );
          const o = pI.find(i => i.ftrFlg === "FEAT_ONBD_MDL");
          if (o) {
            o.mDt = { ...o.mDt, hghlt: true, aIRnk: 0.8 };
          }
          appNvgLgr.dbg("Gmn AI: Smpl nvg fr nw usr, hghlt onbd.");
        }
        pI.forEach((i) => {
          if (!i.mDt?.aIRnk) {
            i.mDt = { ...i.mDt, aIRnk: Math.random() * 0.5 + 0.4 };
          }
        });
        pI.sort((a, b) => (b.mDt?.aIRnk || 0) - (a.mDt?.aIRnk || 0));
        appNvgLgr.dbg("Gmn AI: Nvg psnlz cmplt.");
        r(pI);
      }, 400);
    });
  }
  public async aNP(m: nvgMtc[]): Promise<AIMtcAn> {
    appNvgLgr.inf("Gmn AI: Anlz nvg prm...", { n: m.length });
    return new Promise((r) => {
      setTimeout(() => {
        const oS = Math.floor(Math.random() * 30) + 70;
        const a = m.filter((_m) => _m.dM > 10000 && _m.p === "/slw-pg");
        const uFI = ["Usrs frq drp off aft /sttngs/prfl", "Hgh engmnt on /dshbd w nw usrs."];
        const rcm = ["Optm img lding on /slw-pg", "Sggst 'Anltc' erlr in flw fr pwr usrs."];
        const res: AIMtcAn = {
          oS,
          aD: a.map(_a => `Lng dur on ${_a.p} fr usr ${_a.uI}`),
          pB: [{ p: "/slw-pg", i: "Hgh TTI", iM: "Incrs bnc rt" }],
          uFI,
          rcm,
        };
        appNvgLgr.dbg("Gmn AI: Nvg prm anls cmplt.", { s: oS });
        r(res);
      }, 600);
    });
  }
  public async sCN(uI: string, nI: nvgItm, c: object = {}): Promise<{ sT: string; sI: string; r: string }> {
    if (!this.cnf.enbAIPsnlz) {
      appNvgLgr.wrn("AI psnlz is dsb. Rtn orig nvg cnt.");
      return Promise.resolve({
        sT: nI.lbl,
        sI: nI.icn || "",
        r: "AI psnlz dsb.",
      });
    }
    appNvgLgr.inf("Gmn AI: Sggst cnt fr nvg itm...", { uI, nIID: nI.iD });
    return new Promise((r) => {
      setTimeout(() => {
        let sT = nI.lbl;
        let sI = nI.icn || "info";
        let rat = "Dflt cnt bsd on itm cnf.";
        if (nI.iD === "dshbd" && (c as any).isHldySsn) {
          sT = "Hldy Insghts";
          sI = "redeem";
          rat = "Optm fr hldy ssn engmnt, hghlt fst cnt.";
        } else if (nI.iD === "anltc" && (usrCtxSrvI.gCU()?.prfs as any)?.focusOnSales) {
          sT = "Sls Anltc";
          sI = "trending_up";
          rat = "Psnlz fr usr's sls fcs.";
        } else if (nI.iD === "sttngs" && uI === "anm") {
          sT = "Lgn/Rgs";
          sI = "lgn";
          rat = "Prmpt anm usrs to sgn in via sttngs mn.";
        }
        appNvgLgr.dbg("Gmn AI: Cnt sggst cmplt.", { sT, sI });
        r({ sT, sI, r: rat });
      }, 350);
    });
  }
  public async eA(nLS: string, uS: string): Promise<{ s: number; rcm: string[]; c: number }> {
    if (!this.cnf.enbAIPsnlz) {
      appNvgLgr.wrn("AI psnlz is dsb. Skp aest evl.");
      return Promise.resolve({
        s: 0,
        rcm: ["AI evl is dsb."],
        c: 0,
      });
    }
    appNvgLgr.inf("Gmn AI: Evl nvg aest...", { uS });
    return new Promise((r) => {
      setTimeout(() => {
        let s = Math.floor(Math.random() * 20) + 70;
        const rcm: string[] = [];
        let c = 0.8;
        if (nLS.includes("too-many-items")) {
          s -= 10;
          rcm.push("Cnsdr cnsldt mn itms or intr sub-mns.");
        }
        if (uS === "nw_b" && nLS.includes("cmplx-trmnlgy")) {
          s -= 5;
          rcm.push("Smpl lbls fr 'nw_b' usrs.");
        }
        if (!nLS.includes("srch-icn")) {
          rcm.push("Add a prmnt srch icn fr btr dscvrblty.");
        }
        appNvgLgr.dbg("Gmn AI: Aest evl cmplt.", { s, rcm });
        r({ s, rcm, c });
      }, 500);
    });
  }
  public async pCmpD(uI: string, cmpL: string[], c: object): Promise<string[]> {
    appNvgLgr.inf("Gmn AI: Prdctng cmpny intgrtns...", { uI, cmpL: cmpL.length });
    return new Promise((r) => {
      setTimeout(() => {
        let rCL: string[] = [];
        if (uI === "finance_lead_42") {
          rCL = cmpL.filter(cn => ["Plaid", "Stripe", "Marqeta", "Modern Treasury", "Citibank"].includes(cn)).slice(0, 5);
        } else if (uI === "dev_ops_guru") {
          rCL = cmpL.filter(cn => ["GitHub", "Vercel", "Azure", "Google Cloud", "Supabase", "Pipedream", "AWS"].includes(cn)).slice(0, 5);
        } else if (uI === "sales_pro_78") {
          rCL = cmpL.filter(cn => ["Salesforce", "HubSpot", "Zendesk"].includes(cn)).slice(0, 3);
        } else {
          rCL = [...cmpL].sort(() => 0.5 - Math.random()).slice(0, 5);
        }
        appNvgLgr.dbg("Gmn AI: Cmpny prdct cmplt.", { rCL });
        r(rCL);
      }, 450);
    });
  }
  public async gAIRele(uI: string, q: string, c: object): Promise<{ rQ: string, rI: nvgItm[], c: number }> {
    appNvgLgr.inf("Gmn AI: Gnrting AI-rlvnt qry.", { uI, q });
    return new Promise((r) => {
      setTimeout(() => {
        let rQ = q;
        let rI: nvgItm[] = [];
        let cnf = 0.7;
        if (q.includes("analytic")) {
          rQ = "Adv Anltc Rpts for " + uI;
          rI = [
            { iD: "trds", lbl: "AI Trd Anltc", pth: "/anltc/trds", icn: "b_trd", tgtT: nvgTgtT.iRte },
            { iD: "rpts", lbl: "Sls Rpts", pth: "/anltc/rpts", icn: "f_rpt", tgtT: nvgTgtT.iRte }
          ];
          cnf = 0.85;
        } else if (q.includes("setting")) {
          rQ = "My Prfl & Acc Ssttngs";
          rI = [
            { iD: "prfl", lbl: "My Prfl", pth: "/sttngs/prfl", icn: "uPfl", tgtT: nvgTgtT.iRte },
            { iD: "prfrncs", lbl: "My Prfrncs", pth: "/sttngs/prfrncs", icn: "cPrm", tgtT: nvgTgtT.iRte }
          ];
          cnf = 0.8;
        } else if (q.includes("help")) {
          rQ = "Spt Cntr & Docmntn";
          rI = [
            { iD: "hlp", lbl: "Ext Spt Prtl", pth: "https://citibankdemobusiness.dev/spt", icn: "dSup", tgtT: nvgTgtT.eUrl },
            { iD: "eDoc", lbl: "Docmnttn", pth: "/eDoc", icn: "eDoc", tgtT: nvgTgtT.iRte }
          ];
          cnf = 0.75;
        }
        appNvgLgr.dbg("Gmn AI: Rlvnt qry gnrtd.", { rQ, n: rI.length });
        r({ rQ, rI, c: cnf });
      }, 400);
    });
  }
}
export const gmnNvgAISrvI = gmnNvgAISrv.gI();
class prtnrItgSrv {
  private static i: prtnrItgSrv;
  private cnf: appNvgCnf = dfltAppNvgCnf;
  private prtnrs: string[] = coNmAr;
  private constructor() { }
  public static gI(): prtnrItgSrv {
    if (!prtnrItgSrv.i) {
      prtnrItgSrv.i = new prtnrItgSrv();
    }
    return prtnrItgSrv.i;
  }
  public cnfS(c: appNvgCnf): void {
    this.cnf = c;
    appNvgLgr.dbg("PrtnrItgSrv cnf.", { c });
  }
  public async gPrtnrs(uI: string, q?: string): Promise<string[]> {
    appNvgLgr.inf("Gtting prtnr lst.", { uI, q });
    return new Promise((r) => {
      setTimeout(async () => {
        let fltP = this.prtnrs;
        if (q) {
          fltP = this.prtnrs.filter(p => p.toLowerCase().includes(q.toLowerCase()));
        }
        if (this.cnf.enbAIPsnlz) {
          fltP = await gmnNvgAISrvI.pCmpD(uI, fltP, { qry: q, ctx: "prtnr_sggstn" });
        }
        r(fltP);
      }, 250);
    });
  }
}
export const prtnrItgSrvI = prtnrItgSrv.gI();
class tlmtySrv {
  private static i: tlmtySrv;
  private cnf: appNvgCnf = dfltAppNvgCnf;
  private mtcs: nvgMtc[] = [];
  private constructor() { }
  public static gI(): tlmtySrv {
    if (!tlmtySrv.i) {
      tlmtySrv.i = new tlmtySrv();
    }
    return tlmtySrv.i;
  }
  public cnfS(c: appNvgCnf): void {
    this.cnf = c;
    appNvgLgr.dbg("TlmtySrv cnf.", { c });
  }
  public async rNM(m: nvgMtc): Promise<void> {
    appNvgLgr.dbg("Rcrding nvg mtc.", m);
    this.mtcs.push(m);
    if (this.cnf.enbAIPsnlz) {
      setTimeout(async () => {
        try {
          const a = await gmnNvgAISrvI.aNP([m]);
          if (a.aD.length > 0) {
            appNvgLgr.wrn("AI dtc anm in rcnt nvg!", { anm: a.aD });
          }
        } catch (e) {
          appNvgLgr.err("AI fld to anlz nvg mtc.", e);
        }
      }, 1000);
    }
    return Promise.resolve();
  }
  public async gAllM(): Promise<nvgMtc[]> {
    return Promise.resolve([...this.mtcs]);
  }
}
export const tlmtySrvI = tlmtySrv.gI();
class sctyCnfSrv {
  private static i: sctyCnfSrv;
  private cnf: appNvgCnf = dfltAppNvgCnf;
  private prmRls: Map<string, string[]> = new Map();
  private constructor() {
    this.lPrmRls();
  }
  public static gI(): sctyCnfSrv {
    if (!sctyCnfSrv.i) {
      sctyCnfSrv.i = new sctyCnfSrv();
    }
    return sctyCnfSrv.i;
  }
  public cnfS(c: appNvgCnf): void {
    this.cnf = c;
    appNvgLgr.dbg("SctyCnfSrv cnf.", { c });
  }
  private async lPrmRls(): Promise<void> {
    appNvgLgr.inf("Lding prm-rl mp...");
    return new Promise(r => {
      setTimeout(() => {
        this.prmRls.set("ADMN_ACC", ["ADMN", "S_ADMN"]);
        this.prmRls.set("USR_MNG", ["ADMN"]);
        this.prmRls.set("FIN_VW", ["ADMN", "FN_MGR"]);
        this.prmRls.set("VIEW_REPORTS", ["ADMN", "MGR", "USER"]);
        this.prmRls.set("ACCESS_ANALYTICS", ["ADMN", "MGR", "DATA_ANALYST"]);
        this.prmRls.set("CREATE_TASKS", ["USER", "MGR"]);
        r();
      }, 50);
    });
  }
  public async hPrm(p: string): Promise<boolean> {
    const u = usrCtxSrvI.gCU();
    if (!u || !u.isAtc) {
      return false;
    }
    if (u.prm.includes("ALL_ACC")) {
      return true;
    }
    if (u.prm.includes(p)) {
      return true;
    }
    const rlsRqd = this.prmRls.get(p);
    if (rlsRqd) {
      return rlsRqd.some(r => u.rls.includes(r));
    }
    return false;
  }
}
export const sctyCnfSrvI = sctyCnfSrv.gI();
class appNvgMgr {
  private static i: appNvgMgr;
  public cnf: appNvgCnf = dfltAppNvgCnf;
  private cNT: nvgItm[] = [];
  private cRQP: qryPrm | null = null;
  private nLsnrs: Set<(nI: nvgItm[]) => void> = new Set();
  private lUT: number = 0;
  private uP: Promise<void> | null = null;
  private constructor() {
    this.init();
  }
  public static gI(): appNvgMgr {
    if (!appNvgMgr.i) {
      appNvgMgr.i = new appNvgMgr();
    }
    return appNvgMgr.i;
  }
  private async init(): Promise<void> {
    appNvgLgr.inf("Init appNvgMgr...");
    ftrFlgSrvI.cnfS(this.cnf);
    gmnNvgAISrvI.cnfS(this.cnf);
    prtnrItgSrvI.cnfS(this.cnf);
    tlmtySrvI.cnfS(this.cnf);
    sctyCnfSrvI.cnfS(this.cnf);
    usrCtxSrvI.aCL(() => this.uNT(true));
    await this.uNT(true);
    appNvgLgr.inf("appNvgMgr init scs.");
  }
  public cnfS(c: Partial<appNvgCnf>): void {
    this.cnf = { ...dfltAppNvgCnf, ...c };
    ftrFlgSrvI.cnfS(this.cnf);
    gmnNvgAISrvI.cnfS(this.cnf);
    prtnrItgSrvI.cnfS(this.cnf);
    tlmtySrvI.cnfS(this.cnf);
    sctyCnfSrvI.cnfS(this.cnf);
    appNvgLgr.inf("appNvgMgr re-cnf.", { c: this.cnf });
    this.uNT(true);
  }
  public async gNT(fR: boolean = false): Promise<nvgItm[]> {
    await this.uNT(fR);
    return this.cNT;
  }
  public async uNT(fR: boolean = false): Promise<void> {
    const n = Date.now();
    if (this.uP) {
      return this.uP;
    }
    if (!fR && n - this.lUT < this.cnf.cchDurMs && this.cNT.length > 0) {
      appNvgLgr.dbg("Nvg tr frsh, skp upd.");
      return Promise.resolve();
    }
    this.uP = (async () => {
      appNvgLgr.inf("Upd nvg tr...", { fR });
      try {
        await ftrFlgSrvI.fFF(fR);
        const u = usrCtxSrvI.gCU();
        if (!u) {
          throw new appNvgErr("Usr ctx nt avl fr nvg tr upd.");
        }
        let bI = JSON.parse(JSON.stringify(this.cnf.bseNvgStr)) as nvgItm[];
        const fI = async (i: nvgItm[]): Promise<nvgItm[]> => {
          const f: nvgItm[] = [];
          for (const it of i) {
            if (it.athRqd && !u.isAtc) {
              appNvgLgr.dbg(`Itm '${it.iD}' skp: ath rqd, usr nt atc.`);
              continue;
            }
            if (it.rlK && !u.rls.includes(it.rlK)) {
              appNvgLgr.dbg(`Itm '${it.iD}' skp: rl '${it.rlK}' nt fnd.`);
              continue;
            }
            if (it.prmK && !(await sctyCnfSrvI.hPrm(it.prmK))) {
              appNvgLgr.dbg(`Itm '${it.iD}' skp: prm '${it.prmK}' nt grntd.`);
              continue;
            }
            if (it.ftrFlg && !(await ftrFlgSrvI.isFtrFlgEnb(it.ftrFlg))) {
              appNvgLgr.dbg(`Itm '${it.iD}' skp: fF '${it.ftrFlg}' dsb.`);
              continue;
            }
            const pI: nvgItm = { ...it };
            if (it.chd && it.chd.length > 0) {
              pI.chd = await fI(it.chd);
              if (pI.chd.length === 0 && !pI.pth && pI.tgtT !== nvgTgtT.mO && pI.tgtT !== nvgTgtT.aTrg) {
                appNvgLgr.dbg(`Itm '${it.iD}' skp: no acc chd and no dir pth.`);
                continue;
              }
            }
            f.push(pI);
          }
          return f;
        };
        let pI = await fI(bI);
        if (this.cnf.enbAIPsnlz) {
          pI = await gmnNvgAISrvI.pNI(u.uID, pI, u.prfs);
          for (const it of pI) {
            if (it.tgtT === nvgTgtT.iRte || it.tgtT === nvgTgtT.eUrl) {
              const aC = await gmnNvgAISrvI.sCN(u.uID, it, {
                cP: typeof window !== 'undefined' ? window.location.pathname : "/",
                bL: typeof navigator !== 'undefined' ? navigator.language : "en-US",
              });
              if (aC.sT && aC.sT !== it.lbl) {
                it.lbl = aC.sT;
                it.mDt = { ...it.mDt, aIST: true, aITR: aC.r };
                appNvgLgr.dbg(`AI sggst nw tl fr '${it.iD}': ${it.lbl}`);
              }
              if (aC.sI && aC.sI !== it.icn) {
                it.icn = aC.sI;
                it.mDt = { ...it.mDt, aISI: true, aIIR: aC.r };
                appNvgLgr.dbg(`AI sggst nw ic fr '${it.iD}': ${it.icn}`);
              }
            }
          }
        }
        this.cNT = pI;
        this.lUT = n;
        appNvgLgr.inf(`Nvg tr upd w ${this.cNT.length} tp-lvl itms.`);
        this.nL();
      } catch (e) {
        appNvgLgr.err("Fld to upd nvg tr.", e);
        throw new appNvgErr("Fld to upd nvg tr", "NVG_UPD_FLD", e);
      } finally {
        this.uP = null;
      }
    })();
    return this.uP;
  }
  public aNCL(l: (nI: nvgItm[]) => void): () => void {
    this.nLsnrs.add(l);
    return () => this.nLsnrs.delete(l);
  }
  private nL(): void {
    appNvgLgr.dbg(`Ntfy ${this.nLsnrs.size} nvg chg lsnrs.`);
    this.nLsnrs.forEach((l) => {
      try {
        l(this.cNT);
      } catch (e) {
        appNvgLgr.err("Err ntfy nvg lsnr.", e);
      }
    });
  }
  public fNIByID(iD: string): nvgItm | null {
    const s = (i: nvgItm[]): nvgItm | null => {
      for (const it of i) {
        if (it.iD === iD) {
          return it;
        }
        if (it.chd) {
          const fC = s(it.chd);
          if (fC) {
            return fC;
          }
        }
      }
      return null;
    };
    return s(this.cNT);
  }
  public async gBC(cP: string): Promise<nvgItm[]> {
    await this.gNT();
    const bC: nvgItm[] = [];
    let fnd = false;
    const fP = (i: nvgItm[], pS: string[], cC: nvgItm[]) => {
      for (const it of i) {
        if (it.pth && it.pth === cP) {
          bC.push(...cC, it);
          fnd = true;
          return;
        }
        if (it.pth && cP.startsWith(it.pth + "/")) {
          cC.push(it);
          if (it.chd) {
            fP(it.chd, pS, cC);
            if (fnd) return;
          }
          cC.pop();
        } else if (it.chd) {
          fP(it.chd, pS, cC);
          if (fnd) return;
        }
      }
    };
    const pS = cP.split("/").filter(Boolean);
    fP(this.cNT, pS, []);
    if (!fnd && this.cnf.enbAIPsnlz) {
      appNvgLgr.dbg("Pth nt dir fnd in nvg tr, attmpt AI ctx lkup.");
      const aP = await gmnNvgAISrvI.pOP(
        usrCtxSrvI.gCU()?.uID || "anm",
        cP,
        { a: "inf_bC" }
      );
      if (aP.c > 0.7 && aP.rP !== cP) {
        bC.push({
          iD: "ai-ctx",
          lbl: `AI inf: ${cP.split("/").pop()}`,
          pth: cP,
          tgtT: nvgTgtT.iRte,
          icn: "auto_awesome",
          mDt: { aIJ: aP.j },
        });
        appNvgLgr.inf(`AI prvd ctx bC fr pth: ${cP}`);
      }
    }
    return bC;
  }
  public async nvg(p: string, s?: object): Promise<void> {
    appNvgLgr.inf(`Attmpt to nvg to: ${p}`, { s });
    const it = this.fNIByP(p);
    if (it && it.tgtT === nvgTgtT.eUrl) {
      if (typeof window !== 'undefined') window.open(it.pth, it.mDt?.nwTb ? "_blank" : "_self");
      appNvgLgr.inf(`Nvg to ext URL: ${p}`);
      return;
    }
    if (it?.athRqd && !usrCtxSrvI.isAtc()) {
      throw new appNvgErr(`Nvg to '${p}' blck: ath rqd.`, "NVG_ATH_RQD");
    }
    return new Promise((r, j) => {
      setTimeout(() => {
        try {
          if (typeof window !== 'undefined') window.history.pushState(s, "", p);
          appNvgLgr.inf(`Scs nvg to: ${p}`);
          tlmtySrvI.rNM({
            uI: usrCtxSrvI.gCU()?.uID || "anm",
            tS: Date.now(),
            p: p,
            dM: 0,
            e: ["nvg_to"],
          });
          r();
        } catch (e) {
          appNvgLgr.err(`Fld to nvg to: ${p}`, e);
          j(new appNvgErr(`Fld to nvg to '${p}'`, "NVG_RTR_ERR", e));
        }
      }, 50);
    });
  }
  public fNIByP(p: string, i?: nvgItm[]): nvgItm | null {
    const sI = i || this.cNT;
    for (const it of sI) {
      if (it.pth === p) {
        return it;
      }
      if (it.chd) {
        const f = this.fNIByP(p, it.chd);
        if (f) {
          return f;
        }
      }
    }
    return null;
  }
  public isNwAppNvg(qP?: qryPrm): boolean {
    const rP = qP ?? prQry(typeof window !== 'undefined' ? window.location.search : "");
    this.cRQP = rP;
    const isNNP = Object.keys(rP)
      .map((p) => p.toLowerCase())
      .some((p) => p === "nwnvg");
    appNvgLgr.dbg(`Chck fr 'nwnvg' qP: ${isNNP}`);
    if (isNNP && this.cnf.enbAIFtrDcs) {
      const u = usrCtxSrvI.gCU();
      if (u) {
        const aD = this.sAIBNN(u.uID, rP);
        if (!aD) {
          appNvgLgr.wrn(`AI dcs AGNST actvt 'nwnvg' fr usr ${u.uID} dsp pP prsnc.`);
          return false;
        }
      }
    }
    return isNNP;
  }
  private sAIBNN(uI: string, qP: qryPrm): boolean {
    appNvgLgr.dbg(`AI evl 'nwnvg' actvt fr usr ${uI}.`, { qP });
    if (qP.nwnvg === "dbg") {
      return true;
    }
    if (uI.startsWith("tst_grp_A")) {
      return true;
    }
    if (uI === "cnsrvtv_usr_123") {
      appNvgLgr.dbg("AI dtm usr is cnsrvtv, sggst old nvg.");
      return false;
    }
    return true;
  }
  public async gAIMdlCnf(modID: string, uI: string, c: object): Promise<object> {
    appNvgLgr.inf("Ftchg AI mdl cnf.", { modID, uI });
    return new Promise(r => {
      setTimeout(() => {
        if (modID === "path_predictor") {
          r({ maxDepth: 5, confidenceThreshold: 0.7, userHistoryWeight: 0.6 });
        } else if (modID === "content_personalizer") {
          r({ iconSet: "material_v2", labelLengthMax: 20, segmentWeight: 0.8 });
        } else {
          r({});
        }
      }, 150);
    });
  }
  public async getExtCmpDta(cmpNm: string): Promise<object> {
    appNvgLgr.inf("Ftchg ext cmp dta.", { cmpNm });
    return new Promise(r => {
      setTimeout(() => {
        const d = {
          "Citibank": { revenue: "$75B", employees: 200000, headquarters: "NYC" },
          "Salesforce": { revenue: "$30B", employees: 79000, headquarters: "SF" },
          "GitHub": { revenue: "$1B", employees: 2000, headquarters: "SF" },
          "Gemini": { revenue: "$500M", employees: 1000, headquarters: "NYC" },
          "Shopify": { revenue: "$6B", employees: 10000, headquarters: "OTT" },
          "Oracle": { revenue: "$50B", employees: 160000, headquarters: "AUS" },
          "Adobe": { revenue: "$18B", employees: 29000, headquarters: "SJC" },
          "Twilio": { revenue: "$4B", employees: 8000, headquarters: "SF" },
          "Google Cloud": { revenue: "$32B", employees: 100000, headquarters: "MTN VW" },
          "Microsoft": { revenue: "$230B", employees: 220000, headquarters: "RED" },
          "Amazon Web Services": { revenue: "$90B", employees: 100000, headquarters: "STL" },
          "IBM": { revenue: "$60B", employees: 280000, headquarters: "ARMK" },
          "SAP": { revenue: "$30B", employees: 110000, headquarters: "WALDORF" },
          "Workday": { revenue: "$7B", employees: 18000, headquarters: "PLSTN" },
          "Zoom": { revenue: "$4B", employees: 7000, headquarters: "SJC" },
          "Slack": { revenue: "$1.5B", employees: 3000, headquarters: "SF" },
          "HubSpot": { revenue: "$2B", employees: 8000, headquarters: "CAMB" },
          "Zendesk": { revenue: "$1.6B", employees: 6000, headquarters: "SF" },
          "DocuSign": { revenue: "$2.5B", employees: 7500, headquarters: "SF" },
          "Stripe": { revenue: "$14B", employees: 8000, headquarters: "SF" },
          "PayPal": { revenue: "$29B", employees: 29000, headquarters: "SJC" },
          "Square": { revenue: "$17B", employees: 13000, headquarters: "SF" },
          "Intuit": { revenue: "$15B", employees: 18000, headquarters: "MTN VW" },
          "Xero": { revenue: "$1.5B", employees: 5000, headquarters: "WLGTN" },
          "FreshBooks": { revenue: "$100M", employees: 500, headquarters: "TRNTO" },
          "Kabbage": { revenue: "$100M", employees: 300, headquarters: "ATL" },
          "Brex": { revenue: "$400M", employees: 1000, headquarters: "SF" },
          "Rippling": { revenue: "$200M", employees: 2500, headquarters: "SF" },
          "Gusto": { revenue: "$500M", employees: 3000, headquarters: "SF" },
          "ADP": { revenue: "$18B", employees: 60000, headquarters: "RSLND" },
          "QuickBooks": { revenue: "$7B", employees: 10000, headquarters: "MTN VW" },
          "NetSuite": { revenue: "$2.5B", employees: 10000, headquarters: "AUS" },
          "ServiceNow": { revenue: "$9B", employees: 22000, headquarters: "SCLRA" },
          "Atlassian": { revenue: "$3.5B", employees: 10000, headquarters: "SYD" },
          "Jira": { revenue: "$1.5B", employees: 5000, headquarters: "SYD" },
          "Confluence": { revenue: "$1B", employees: 4000, headquarters: "SYD" },
          "Trello": { revenue: "$100M", employees: 200, headquarters: "NY" },
          "Asana": { revenue: "$600M", employees: 2500, headquarters: "SF" },
          "Monday.com": { revenue: "$500M", employees: 1600, headquarters: "TLV" },
          "Smartsheet": { revenue: "$800M", employees: 2800, headquarters: "BELLEVUE" },
          "Wrike": { revenue: "$200M", employees: 1000, headquarters: "SJC" },
          "Basecamp": { revenue: "$20M", employees: 50, headquarters: "CHI" },
          "Airtable": { revenue: "$300M", employees: 1500, headquarters: "SF" },
          "ClickUp": { revenue: "$100M", employees: 800, headquarters: "SD" },
          "Figma": { revenue: "$400M", employees: 1200, headquarters: "SF" },
          "Canva": { revenue: "$1.5B", employees: 4000, headquarters: "SYD" },
          "Sketch": { revenue: "$50M", employees: 100, headquarters: "AMS" },
          "InVision": { revenue: "$100M", employees: 700, headquarters: "NYC" },
          "Marvel": { revenue: "$20M", employees: 50, headquarters: "LON" },
          "Miro": { revenue: "$200M", employees: 1700, headquarters: "SF" },
          "Lucidchart": { revenue: "$150M", employees: 800, headquarters: "SLC" },
          "Webflow": { revenue: "$200M", employees: 800, headquarters: "SF" },
          "Adyen": { revenue: "$1.5B", employees: 3000, headquarters: "AMS" },
          "Braintree": { revenue: "$300M", employees: 500, headquarters: "CHI" },
          "Klarna": { revenue: "$1.5B", employees: 5000, headquarters: "STKHM" },
          "Affirm": { revenue: "$1.6B", employees: 2000, headquarters: "SF" },
          "Afterpay": { revenue: "$600M", employees: 1300, headquarters: "SYD" },
          "Sezzle": { revenue: "$100M", employees: 300, headquarters: "MNPLS" },
          "Coinbase": { revenue: "$3B", employees: 5000, headquarters: "SF" },
          "Binance": { revenue: "$12B", employees: 8000, headquarters: "KYMN IS" },
          "Kraken": { revenue: "$500M", employees: 2000, headquarters: "SF" },
          "Revolut": { revenue: "$1B", employees: 8000, headquarters: "LON" },
          "Wise": { revenue: "$1B", employees: 5000, headquarters: "LON" },
          "N26": { revenue: "$300M", employees: 1500, headquarters: "BER" },
          "Chime": { revenue: "$500M", employees: 1000, headquarters: "SF" },
          "SoFi": { revenue: "$2B", employees: 4000, headquarters: "SF" },
          "Ally Bank": { revenue: "$8B", employees: 11000, headquarters: "DET" },
          "Capital One": { revenue: "$36B", employees: 50000, headquarters: "MCLEAN" },
          "JPMorgan Chase": { revenue: "$150B", employees: 300000, headquarters: "NYC" },
          "Bank of America": { revenue: "$100B", employees: 215000, headquarters: "CRLTTE" },
          "Wells Fargo": { revenue: "$80B", employees: 230000, headquarters: "SF" },
          "Goldman Sachs": { revenue: "$45B", employees: 45000, headquarters: "NYC" },
          "Morgan Stanley": { revenue: "$60B", employees: 80000, headquarters: "NYC" },
          "Fidelity": { revenue: "$25B", employees: 70000, headquarters: "BOS" },
          "Charles Schwab": { revenue: "$20B", employees: 35000, headquarters: "DFW" },
          "Vanguard": { revenue: "$7B", employees: 20000, headquarters: "VL FGE" },
          "BlackRock": { revenue: "$18B", employees: 20000, headquarters: "NYC" },
          "SoftBank": { revenue: "$50B", employees: 60000, headquarters: "TKYO" },
          "Temasek": { revenue: "$30B", employees: 700, headquarters: "SGP" },
          "Baidu": { revenue: "$18B", employees: 100000, headquarters: "BEIJ" },
          "Alibaba": { revenue: "$130B", employees: 240000, headquarters: "HZH" },
          "Tencent": { revenue: "$90B", employees: 110000, headquarters: "SHNZN" },
          "ByteDance": { revenue: "$80B", employees: 150000, headquarters: "BEIJ" },
          "JD.com": { revenue: "$150B", employees: 500000, headquarters: "BEIJ" },
          "Meituan": { revenue: "$25B", employees: 100000, headquarters: "BEIJ" },
          "Pinduoduo": { revenue: "$18B", employees: 15000, headquarters: "SHNGHI" },
          "Xiaomi": { revenue: "$35B", employees: 35000, headquarters: "BEIJ" },
          "Huawei": { revenue: "$100B", employees: 200000, headquarters: "SHNZN" },
          "Samsung": { revenue: "$230B", employees: 270000, headquarters: "SWN" },
          "LG": { revenue: "$60B", employees: 75000, headquarters: "SEOUL" },
        }[cmpNm] || { status: "Dta nt fnd" };
        r(d);
      }, 200);
    });
  }
}
export const appNvgMgrI = appNvgMgr.gI();
export default function isNwAppNvg(qP?: qryPrm): boolean {
  return appNvgMgrI.isNwAppNvg(qP);
}
export function initAppNvg(c: Partial<appNvgCnf>): void {
  appNvgMgrI.cnfS(c);
  appNvgLgr.inf("App nvg sys init w cstm cnf.");
}
export async function getDynAppNvgT(fR: boolean = false): Promise<nvgItm[]> {
  return appNvgMgrI.gNT(fR);
}
export function subNvgChg(l: (nI: nvgItm[]) => void): () => void {
  return appNvgMgrI.aNCL(l);
}
export async function nvgTo(p: string, s?: object): Promise<void> {
  return appNvgMgrI.nvg(p, s);
}
export async function isFtrFlgEnb(fN: string): Promise<boolean> {
  return ftrFlgSrvI.isFtrFlgEnb(fN);
}
export async function getAIRcmNdPth(cP: string, c?: object): Promise<string> {
  const u = usrCtxSrvI.gCU();
  if (!u) {
    appNvgLgr.wrn("Cnt get AI rcm pth wthout usr ctx. Rtn dflt.");
    return appNvgMgrI.cnf.dfltLndRte;
  }
  try {
    const { rP } = await gmnNvgAISrvI.pOP(u.uID, cP, c || {});
    return rP;
  } catch (e) {
    appNvgLgr.err("Fld to get AI rcm nxt pth.", e);
    return appNvgMgrI.cnf.dfltLndRte;
  }
}
export async function getAIPsnlzRawNvg(bI: nvgItm[], uP?: object): Promise<nvgItm[]> {
  const u = usrCtxSrvI.gCU();
  if (!u) {
    appNvgLgr.wrn("Cnt get AI psnlz nvg wthout usr ctx. Rtn bse itms.");
    return [...bI];
  }
  return gmnNvgAISrvI.pNI(u.uID, bI, uP || u.prfs);
}
export async function gCmpPrtnrs(uI: string, q?: string): Promise<string[]> {
  return prtnrItgSrvI.gPrtnrs(uI, q);
}
export async function gCmpDta(cN: string): Promise<object> {
  return appNvgMgrI.getExtCmpDta(cN);
}
export async function aNvgMtc(m: nvgMtc): Promise<void> {
  return tlmtySrvI.rNM(m);
}
export async function getAIEstEvl(nLS: string, uS: string): Promise<{ s: number; rcm: string[]; c: number }> {
  return gmnNvgAISrvI.eA(nLS, uS);
}
export async function sctyHP(p: string): Promise<boolean> {
  return sctyCnfSrvI.hPrm(p);
}
export async function getAIReleItms(q: string, c?: object): Promise<{ rQ: string, rI: nvgItm[], c: number }> {
  const u = usrCtxSrvI.gCU();
  if (!u) {
    appNvgLgr.wrn("No usr ctx for AI rlvnc.", { q });
    return { rQ: q, rI: [], c: 0 };
  }
  return gmnNvgAISrvI.gAIRele(u.uID, q, c || {});
}