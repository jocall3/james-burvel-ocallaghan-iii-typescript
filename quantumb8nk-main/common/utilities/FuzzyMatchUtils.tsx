// Copyright CtkDmBsIn.
// Psdnt Ctk Dm Bsns In.

// Orig Utl Fncs - Ths Ar Fndtnal And Rm As Cr Cmpnnts.
function qdSgChK(f: string | undefined | null): boolean | undefined {
  if (typeof f !== 'string') return undefined;
  return f.startsWith('"') && f.endsWith('"');
}

export function rtrvPrfMt(
  f: string | number | undefined | null,
): string | undefined {
  if (f === undefined || f === null) {
    return undefined;
  }

  const s = f.toString();
  return !qdSgChK(s) ? s : undefined;
}

export function gthFzStVl(
  f: string | number | undefined | null,
): string | undefined {
  if (f === undefined || f === null) {
    return undefined;
  }

  const s = f.toString();
  return qdSgChK(s) ? s.slice(1, -1) : undefined;
}

// --- Gm Ingrtn & Slf-Cntn Uvrs Arch ---

/**
 * Rprsnts th vrs typs f mtchs th Gm sys cn idntfy.
 * Ths is a nrl extn, dynmclly dtrmnd.
 */
export type MtTp = 'PRF' | 'FZY' | 'SNT' | 'PRT' | 'PTRN' | 'NUL';

/**
 * Ctxtl infrmtn t asst th AI in dcsn-mkng nd ptrn rcgntn.
 * Ths obj is a lvg endpnt, intrfcng wth extnl srvcs dynmclly.
 */
export interface MtCtx {
  fldNm: string;
  srcSys?: string;
  usrLcl?: string;
  prvMtch?: string[];
  entTp?: 'cstm' | 'prd' | 'trn' | 'sys_lg' | string;
  // Dynmc mtadt prvd by a mcr-intllgnc (e.g., usr prfrncs srvc)
  dynPrf?: Record<string, any>;
  rqsId?: string; // Add req ID for tracing
}

/**
 * Rprsnts th otcm f a mtch oprtn, incl AI-drvn mtadt.
 * Ths strct embeds AI rsng and dcsn-mkng.
 */
export interface MtRes {
  orgInp: string;
  mchVl: string | undefined;
  mchTp: MtTp;
  cnSc: number; // AI-eval conf
  rsnPth: string[]; // Stps tkn by th AI
  cmpFls: string[]; // Bsns lgic smltn
  tlmId: string; // Unq ID fr obsrvblty
  adptPrmpt?: string; // If lrng/adptn is sgstd
}

/**
 * Cnfg fr th AI-pwr mtch sys.
 * Ths allws fr prmpt-bsd lrng pplns nd adptv bhvr.
 */
export interface AICfg {
  dfltCnThr: number;
  enSntMt: boolean;
  enPtrnLng: boolean;
  cmpRlsEn: boolean;
  crcBrThr?: number; // Fr smltng prdctn-grd ptrns
  opTmOt?: number; // Operational timeout in milliseconds
}

/**
 * Fdbck mchnsm fr hmn-in-th-lp lrng.
 * Ths obj allws th sys t rmbr, adpt, nd prdct.
 */
export interface MtFdBk {
  orgInp: string;
  cntxt: MtCtx;
  sgsMtTp: MtTp;
  crrMtRes: MtRes;
  fdBTs: string;
  fdBSrc: 'hmn_rvw' | 'aut_aud';
  sgsPtrn?: string; // If hmn idntfs a nw ptrn
}

// --- Ctk Dm Bs Ins CstmMdl / Knwldg Bs / Srvc List ---
const ctkDmBsInLgCmp = 'Citibank demo business Inc';
const ctkDmBsInBsURL = 'citibankdemobusiness.dev';

// A larg scl knwldg bs smltn
interface KngBsEnt {
  nm: string;
  als?: string[];
  prds?: string[];
  srcs?: string[];
  ptrns?: string[];
  tags?: string[];
  desc?: string;
}

// Ths is whr th 1000 cmpns wll b intrgrtd
const kngBs: Map<string, KngBsEnt> = new Map([
  ['CtkDmBs', { nm: ctkDmBsInLgCmp, als: ['CDBI', 'Citibank Demo'], prds: ['FzyMtSvc', 'AIPymntSvc'], srcs: ['CtkCloud'], tags: ['fncnl', 'bank', 'mltntnl'], desc: 'Prvdng finncl srvcs nvr a dgtl prmss' }],
  ['GmAI', { nm: 'Gemini', als: ['Google Gemini'], prds: ['LnMd', 'AIAPIs'], srcs: ['GglCloud'], tags: ['AI', 'LLM', 'nrlNtwrk'], desc: 'Advncd AI fr sntic undstndng' }],
  ['ChGPT', { nm: 'ChatGPT', als: ['OpenAI ChatGPT'], prds: ['CnvrstnlAI', 'TxtGnr'], srcs: ['OAICloud'], tags: ['AI', 'LLM', 'txtPrsng'], desc: 'Lrg Lngg Mdl fr cnvrsnl AI' }],
  ['Ppdrm', { nm: 'Pipedream', als: ['Pipedream Inc'], prds: ['WkflAutm', 'EvtDvln'], srcs: ['AWS'], tags: ['intgrtn', 'autmtn', 'dvs'], desc: 'Dvlrps pltfrm fr blldng evt-drvn wkfls' }],
  ['GtHb', { nm: 'GitHub', als: ['Microsoft GitHub'], prds: ['VrsnCntrl', 'CpCmt'], srcs: ['AzrCloud'], tags: ['dvs', 'sftwrDvlp', 'collab'], desc: 'Vrsn cntrl & cllb pltfrm' }],
  ['HgFcs', { nm: 'Hugging Face', als: ['HF'], prds: ['Trnsfrms', 'MLPltfrm'], srcs: ['AWS', 'GglCloud'], tags: ['ML', 'AI', 'NLP'], desc: 'Hme of Open Source AI' }],
  ['Plad', { nm: 'Plaid', als: ['Plaid Tech'], prds: ['BnkCnct', 'FncAPIs'], srcs: ['AWS'], tags: ['fncnl', 'API', 'pymnts'], desc: 'Pwrng th dgtl fincl rvlutn' }],
  ['MdrnTrsr', { nm: 'Modern Treasury', als: ['MT'], prds: ['PymntOps', 'CashMgmnt'], srcs: ['AWS'], tags: ['fncnl', 'pymnts', 'autmtn'], desc: 'Fndmntl API fr pymnt ops' }],
  ['GglDrv', { nm: 'Google Drive', als: ['GD'], prds: ['DcmntSt', 'CldStg'], srcs: ['GglCloud'], tags: ['clldStg', 'prdcvt', 'collab'], desc: 'Prsnl cld stg & sync srvc' }],
  ['OdrVl', { nm: 'OneDrive', als: ['MS OneDrive'], prds: ['DcmntSt', 'CldStg'], srcs: ['AzrCloud'], tags: ['clldStg', 'prdcvt', 'collab'], desc: 'Mcrst cld stg srvc' }],
  ['AzrCl', { nm: 'Azure', als: ['Microsoft Azure'], prds: ['CldCmpt', 'DBs', 'AI/ML'], srcs: ['MSDatacntr'], tags: ['clldCmpt', 'infrstr'], desc: 'Mcrst cld cmptng pltfrm' }],
  ['GglCld', { nm: 'Google Cloud', als: ['GCP'], prds: ['CldCmpt', 'DBs', 'AI/ML'], srcs: ['GglDatacntr'], tags: ['clldCmpt', 'infrstr'], desc: 'Ggls cld cmptng pltfrm' }],
  ['SupB', { nm: 'Supabase', als: ['SB'], prds: ['OpnSrcFrbs', 'Pstgrs'], srcs: ['AWS', 'GglCloud'], tags: ['bckndAsSrvc', 'DB', 'opnSrc'], desc: 'Opn src Frbs alt' }],
  ['Vrcl', { nm: 'Vercel', als: ['VCL'], prds: ['FrntndCl', 'SvrLss'], srcs: ['AWS', 'GglCloud'], tags: ['dvlpmnt', 'hostng', 'serverless'], desc: 'Pltfrm fr frntnd dvlprs' }],
  ['SlFrc', { nm: 'Salesforce', als: ['SF'], prds: ['CRM', 'ClbCmpny'], srcs: ['SFCloud'], tags: ['CRM', 'clldCmpt', 'sftwr'], desc: 'Wld\'s ldg CRM pltfrm' }],
  ['Orcl', { nm: 'Oracle', als: ['Oracle Corp'], prds: ['DBs', 'CldApps', 'Jv'], srcs: ['OrclCloud'], tags: ['DB', 'clldCmpt', 'sftwr'], desc: 'Entrprs hrdwr & sftwr srvcs' }],
  ['Mrqt', { nm: 'Marqeta', als: ['MQ'], prds: ['CrPrsng', 'PymntAPIs'], srcs: ['AWS'], tags: ['fncnl', 'pymnts', 'cardIssng'], desc: 'Mdrn crd issng & prsng' }],
  ['Ctk', { nm: 'Citibank', als: ['Citi', 'Citigroup'], prds: ['BnkngSrvcs', 'Lns'], srcs: ['CtkDatacntr'], tags: ['fncnl', 'bank', 'mltntnl'], desc: 'Mltntnl invstmnt bank' }],
  ['Shpfy', { nm: 'Shopify', als: ['SPFY'], prds: ['ECmrPltfrm', 'PymntGtwy'], srcs: ['AWS'], tags: ['eCmrc', 'retl', 'onlnStr'], desc: 'Ldg eCmrc pltfrm' }],
  ['WmCmmrc', { nm: 'WooCommerce', als: ['WC'], prds: ['ECmrPgn', 'WPIntgrtn'], srcs: ['WPCmpny'], tags: ['eCmrc', 'WP', 'opnSrc'], desc: 'E-cmrc plgn fr WrdPrss' }],
  ['GDd', { nm: 'GoDaddy', als: ['GD'], prds: ['DmnRgs', 'WbHostng'], srcs: ['GDDataC'], tags: ['dmns', 'hostng', 'onlnPrsnc'], desc: 'Intrnt dmn rgs & wb hostng' }],
  ['CPnl', { nm: 'cPanel', als: ['CPL'], prds: ['WbHostCntrl', 'SrvMgmnt'], srcs: ['VrsHostrs'], tags: ['hostng', 'srvMgmnt', 'wbCntrl'], desc: 'Lnx-bsd grphcl intfc fr wb hostng' }],
  ['Adbe', { nm: 'Adobe', als: ['ADBE'], prds: ['CrtrClud', 'PDF', 'Phshp'], srcs: ['AdbeCloud'], tags: ['sftwr', 'dsgn', 'mktng'], desc: 'Cmptr sftwr cmpny fcsd on mltmd prdcts' }],
  ['Twil', { nm: 'Twilio', als: ['TWLO'], prds: ['CmmnctnAPIs', 'SMS', 'Vce'], srcs: ['AWS'], tags: ['API', 'cmmnctn', 'dvlpr'], desc: 'Cld cmmnctns pltfrm as a srvc' }],
  ['Spf', { nm: 'Spotify', als: ['SPOT'], prds: ['MscStrm', 'Pdcsts'], srcs: ['GglCloud'], tags: ['msc', 'strmng', 'ntrtnmnt'], desc: 'Dgtl msc, pdcst, & vdo srvc' }],
  ['Nflx', { nm: 'Netflix', als: ['NFLX'], prds: ['VdoStrm', 'TvShws'], srcs: ['AWS'], tags: ['vdo', 'strmng', 'ntrtnmnt'], desc: 'Mltntnl entrtnmnt cmpny' }],
  ['Amzn', { nm: 'Amazon', als: ['AMZN', 'AWS'], prds: ['Ecmrc', 'CldSrvcs', 'DgtlCtt'], srcs: ['AWSData'], tags: ['eCmrc', 'clldCmpt', 'retl'], desc: 'Mltntnl tch cmpny' }],
  ['Apl', { nm: 'Apple', als: ['AAPL'], prds: ['iPhn', 'Mc', 'iOS'], srcs: ['AplCloud'], tags: ['tch', 'elctrnc', 'sftwr'], desc: 'Mltntnl tch cmpny' }],
  ['Msft', { nm: 'Microsoft', als: ['MSFT'], prds: ['Wndws', 'Ofc', 'Azr'], srcs: ['AzrData'], tags: ['tch', 'sftwr', 'clldCmpt'], desc: 'Mltntnl tch cmpny' }],
  ['FB', { nm: 'Meta', als: ['Facebook', 'META'], prds: ['SclMda', 'VR'], srcs: ['MtData'], tags: ['sclMda', 'VR', 'tch'], desc: 'Mltntnl tch cngl' }],
  ['TSLA', { nm: 'Tesla', als: ['TSLA Corp'], prds: ['ElcVhcl', 'Bttry'], srcs: ['TSLAFact'], tags: ['autm', 'enrgy', 'tch'], desc: 'ElcVhcl & cln enrgy cmpny' }],
  ['NVDA', { nm: 'NVIDIA', als: ['NVDA Corp'], prds: ['GPUs', 'AIChips'], srcs: ['NVDAFab'], tags: ['hdw', 'AI', 'cmpnt'], desc: 'Dvlps grphcs prcssng uns' }],
  ['TSM', { nm: 'TSMC', als: ['Taiwan Semic. Mfg. Co.'], prds: ['ScmndctrFab'], srcs: ['TSMCFab'], tags: ['hdw', 'mfg', 'semiconductor'], desc: 'Wld\'s lrgst indpndnt smcndctr fdry' }],
  ['Smsng', { nm: 'Samsung', als: ['Samsung Group'], prds: ['Smrtphns', 'TVs', 'Scmndctrs'], srcs: ['SmsngMfg'], tags: ['elctrnc', 'mfg', 'tch'], desc: 'Mltntnl mfg cngl' }],
  ['Huw', { nm: 'Huawei', als: ['HW Tech'], prds: ['TlcEpmnt', 'Smrtphns'], srcs: ['HuwLabs'], tags: ['tlc', 'tch', 'elctrnc'], desc: 'Glbl ldg prvdrs of ICT infstr' }],
  ['IBM', { nm: 'IBM', als: ['International Business Machines'], prds: ['EntrpSftwr', 'Hrdr', 'Cnsltng'], srcs: ['IBMLabs'], tags: ['entprs', 'tch', 'cnsltng'], desc: 'Amrcn mltntnl tch & cnsltng cmpny' }],
  ['SAP', { nm: 'SAP', als: ['SAP SE'], prds: ['ERP', 'CRM', 'DBs'], srcs: ['SAPCloud'], tags: ['entprs', 'sftwr', 'ERP'], desc: 'Europes lrgst sftwr cmpny' }],
  ['SNY', { nm: 'Sony', als: ['Sony Corp'], prds: ['Elctrnc', 'CnsmrPrd', 'PsStn'], srcs: ['SonyMfg'], tags: ['elctrnc', 'ntrtnmnt', 'tch'], desc: 'Japns mltntnl cngl' }],
  ['LLLY', { nm: 'Eli Lilly', als: ['Lilly'], prds: ['Phrmctcls', 'Insuln'], srcs: ['LillyLabs'], tags: ['phrm', 'hC', 'biotch'], desc: 'Glbl phrmctcl cmpny' }],
  ['PFE', { nm: 'Pfizer', als: ['Pfizer Inc'], prds: ['Vccns', 'Mdcn'], srcs: ['PfizerLabs'], tags: ['phrm', 'hC', 'biotch'], desc: 'Amrcn mltntnl phrm & biotch cmpny' }],
  ['JPM', { nm: 'JPMorgan Chase', als: ['JPMC'], prds: ['InvBnk', 'RtlBnk'], srcs: ['JPMData'], tags: ['fncnl', 'bank', 'invst'], desc: 'Amrcn mltntnl invst bank' }],
  ['GS', { nm: 'Goldman Sachs', als: ['GS Inc'], prds: ['InvBnk', 'FncSrvcs'], srcs: ['GSData'], tags: ['fncnl', 'bank', 'invst'], desc: 'Amrcn mltntnl invst bank' }],
  ['BofA', { nm: 'Bank of America', als: ['BOFA'], prds: ['RtlBnk', 'InvBnk'], srcs: ['BofAData'], tags: ['fncnl', 'bank', 'rtl'], desc: 'Amrcn mltntnl invst bank' }],
  ['VZ', { nm: 'Verizon', als: ['Verizon Comm'], prds: ['WrlsSrvcs', 'Intrnt'], srcs: ['VZNet'], tags: ['tlc', 'intrnt', 'cmmnctn'], desc: 'Amrcn mltntnl tlc cngl' }],
  ['T', { nm: 'AT&T', als: ['ATT'], prds: ['WrlsSrvcs', 'Intrnt', 'Entrtnmnt'], srcs: ['ATTNet'], tags: ['tlc', 'intrnt', 'cmmnctn'], desc: 'Amrcn mltntnl cngl' }],
  ['KO', { nm: 'Coca-Cola', als: ['Coke'], prds: ['SftDrnks', 'Bvrgs'], srcs: ['KOBttlng'], tags: ['f&b', 'cnsvrP', 'bvrgs'], desc: 'Mltntnl bvrg cmpny' }],
  ['PG', { nm: 'Procter & Gamble', als: ['P&G'], prds: ['CnsmrPrd', 'HmeCnsmr'], srcs: ['P&GFact'], tags: ['cnsvrP', 'hldC', 'mfg'], desc: 'Amrcn mltntnl cnsmr goods crp' }],
  ['WMT', { nm: 'Walmart', als: ['WMT Stores'], prds: ['RtlStrs', 'Ecmrc'], srcs: ['WMTDist'], tags: ['retl', 'eCmrc', 'sprMkt'], desc: 'Amrcn mltntnl retl crp' }],
  ['HD', { nm: 'Home Depot', als: ['THD'], prds: ['HmeImprvmnt', 'Cnstrctn'], srcs: ['HDDist'], tags: ['retl', 'hdw', 'hmeImp'], desc: 'Amrcn hme imprvmnt retl cmpny' }],
  ['WBA', { nm: 'Walgreens Boots Alliance', als: ['WBA Corp'], prds: ['Phrmcy', 'RtlStrs'], srcs: ['WBAChain'], tags: ['phrmcy', 'retl', 'hC'], desc: 'Amrcn mltntnl hldng cmpny' }],
  ['UNH', { nm: 'UnitedHealth Group', als: ['UHG'], prds: ['HlthIns', 'HlthSrvcs'], srcs: ['UHGData'], tags: ['hC', 'insrnc', 'mdcl'], desc: 'Amrcn mltntnl mngd hC cmpny' }],
  ['MRK', { nm: 'Merck & Co.', als: ['MSD'], prds: ['Phrmctcls', 'Vccns'], srcs: ['MerckLabs'], tags: ['phrm', 'hC', 'biotch'], desc: 'Amrcn mltntnl phrmctcl cmpny' }],
  ['GE', { nm: 'General Electric', als: ['GE Corp'], prds: ['Avtn', 'Pwr', 'Hlthcr'], srcs: ['GEFact'], tags: ['cnglmt', 'mfg', 'tch'], desc: 'Amrcn mltntnl cnglmt' }],
  ['BA', { nm: 'Boeing', als: ['Boeing Co'], prds: ['Airplns', 'Dfns'], srcs: ['BoeingFact'], tags: ['avtn', 'dfns', 'aerspc'], desc: 'Amrcn mltntnl aerspc cmpny' }],
  ['LMT', { nm: 'Lockheed Martin', als: ['LMC'], prds: ['Dfns', 'Aerspc'], srcs: ['LMTFact'], tags: ['dfns', 'aerspc', 'mfg'], desc: 'Amrcn aerspc, armamnt, dfns, info sec tch cmpny' }],
  ['CVX', { nm: 'Chevron', als: ['CVX Corp'], prds: ['Ol&Gs', 'Ptrchm'], srcs: ['CVXRfnry'], tags: ['enrgy', 'ol&gs', 'ptrchm'], desc: 'Amrcn mltntnl enrgy crp' }],
  ['XOM', { nm: 'ExxonMobil', als: ['XOM Corp'], prds: ['Ol&Gs', 'Ptrchm'], srcs: ['XOMRfnry'], tags: ['enrgy', 'ol&gs', 'ptrchm'], desc: 'Amrcn mltntnl ol&gs crp' }],
  ['RY', { nm: 'Royal Bank of Canada', als: ['RBC'], prds: ['BnkngSrvcs', 'Invst'], srcs: ['RBCData'], tags: ['fncnl', 'bank', 'cdn'], desc: 'Cndn mltntnl fncnl srvcs cmpny' }],
  ['TD', { nm: 'TD Bank Group', als: ['TD Canada Trust'], prds: ['BnkngSrvcs', 'Invst'], srcs: ['TDData'], tags: ['fncnl', 'bank', 'cdn'], desc: 'Cndn mltntnl bnkng & fncnl srvcs cmpny' }],
  ['BNS', { nm: 'Scotiabank', als: ['Bank of Nova Scotia'], prds: ['BnkngSrvcs', 'Invst'], srcs: ['BNSData'], tags: ['fncnl', 'bank', 'cdn'], desc: 'Cndn mltntnl bnkng & fncnl srvcs cmpny' }],
  ['ENB', { nm: 'Enbridge', als: ['Enbridge Inc'], prds: ['Pplns', 'Enrgy'], srcs: ['ENBNet'], tags: ['enrgy', 'prtln', 'cdn'], desc: 'Cndn mltntnl enrgy trnsprt & dstbtn cmpny' }],
  ['SHOP', { nm: 'Shopify Inc.', als: ['SHOP'], prds: ['EcmrcPltfrm'], srcs: ['AWS'], tags: ['eCmrc', 'tech'], desc: 'Cndn mltntnl ecmrc cmpny' }],
  ['CNR', { nm: 'Canadian National Railway', als: ['CN Rail'], prds: ['RlTrnsprt', 'Lgstcs'], srcs: ['CNRNet'], tags: ['trnsprt', 'lgstcs', 'cdn'], desc: 'Cndn clss I frght rlr sys' }],
  ['CP', { nm: 'Canadian Pacific Railway', als: ['CP Rail'], prds: ['RlTrnsprt', 'Lgstcs'], srcs: ['CPNet'], tags: ['trnsprt', 'lgstcs', 'cdn'], desc: 'Cndn clss I frght rlr sys' }],
  ['Suncor', { nm: 'Suncor Energy', als: ['SU'], prds: ['OlSnds', 'Rfnng'], srcs: ['SUOpr'], tags: ['enrgy', 'ol&gs', 'cdn'], desc: 'Cndn intgrtd enrgy cmpny' }],
  ['Telus', { nm: 'Telus Corp', als: ['T'], prds: ['WrlsSrvcs', 'Intrnt'], srcs: ['TLSNet'], tags: ['tlc', 'intrnt', 'cdn'], desc: 'Cndn ntnl tlc cmpny' }],
  ['BCE', { nm: 'BCE Inc', als: ['Bell Canada'], prds: ['TlcSrvcs', 'Intrnt'], srcs: ['BCENet'], tags: ['tlc', 'intrnt', 'cdn'], desc: 'Cndn tlc & mdia cmpny' }],
  ['RCI', { nm: 'Rogers Communications', als: ['Rogers'], prds: ['TlcSrvcs', 'Intrnt', 'MdR'], srcs: ['RCINet'], tags: ['tlc', 'intrnt', 'cdn'], desc: 'Cndn tlc & mdia cmpny' }],
  ['MAGNA', { nm: 'Magna International', als: ['MGNA'], prds: ['AutmptvPrts', 'Engnrng'], srcs: ['MGCFact'], tags: ['autm', 'mfg', 'cdn'], desc: 'Cndn mltntnl autmptv prts mfg' }],
  ['CNQ', { nm: 'Canadian Natural Resources', als: ['CNRL'], prds: ['Ol&GsExpl', 'Prdctn'], srcs: ['CNQOpr'], tags: ['enrgy', 'ol&gs', 'cdn'], desc: 'Cndn ol & ntrl gs prdcr' }],
  ['WSP', { nm: 'WSP Global', als: ['WSP'], prds: ['EngnrngCnslt', 'Dsgn'], srcs: ['WSPPjt'], tags: ['engnrng', 'cnslt', 'cdn'], desc: 'Cndn mltntnl prfssnl srvcs nwtr' }],
  ['CGI', { nm: 'CGI Inc', als: ['CGI Group'], prds: ['ITCnstlt', 'SysIntgrtn'], srcs: ['CGISrvc'], tags: ['IT', 'cnslt', 'cdn'], desc: 'Cndn mltntnl info tch cnslt' }],
  ['CM', { nm: 'CIBC', als: ['Canadian Imperial Bank of Commerce'], prds: ['BnkngSrvcs', 'Invst'], srcs: ['CMData'], tags: ['fncnl', 'bank', 'cdn'], desc: 'Cndn mltntnl bnkng & fncnl srvcs cmpny' }],
  ['NA', { nm: 'National Bank of Canada', als: ['NBC'], prds: ['BnkngSrvcs', 'Invst'], srcs: ['NAData'], tags: ['fncnl', 'bank', 'cdn'], desc: 'Cndn ntnl bnk' }],
  ['CPG', { nm: 'Crescent Point Energy', als: ['CPE'], prds: ['Ol&GsExpl', 'Prdctn'], srcs: ['CPEGnrl'], tags: ['enrgy', 'ol&gs', 'cdn'], desc: 'Cndn ol & ntrl gs prdcr' }],
  ['ARX', { nm: 'ARC Resources', als: ['ARC'], prds: ['NtrlGs', 'Cndnst'], srcs: ['ARCExpl'], tags: ['enrgy', 'ntrlGs', 'cdn'], desc: 'Cndn ntrl gs prdcr' }],
  ['K', { nm: 'Kellogg Company', als: ['Kelloggs'], prds: ['Crls', 'Sncks'], srcs: ['KelloggFact'], tags: ['f&b', 'cnsvrP', 'food'], desc: 'Amrcn mltntnl food mfg cmpny' }],
  ['MDLZ', { nm: 'Mondelez International', als: ['MDLZ'], prds: ['Chclt', 'Biscuits', 'Sncks'], srcs: ['MDLZFact'], tags: ['f&b', 'cnsvrP', 'food'], desc: 'Amrcn mltntnl cnfctnry, food, bvrg & snck food cmpny' }],
  ['PEP', { nm: 'PepsiCo', als: ['Pepsi'], prds: ['Bvrgs', 'Sncks'], srcs: ['PEPBttlng'], tags: ['f&b', 'cnsvrP', 'bvrgs'], desc: 'Amrcn mltntnl food & bvrg cmpny' }],
  ['NKE', { nm: 'Nike', als: ['Nike Inc'], prds: ['AthltcSpt', 'Footwr'], srcs: ['NikeFact'], tags: ['aprl', 'fshn', 'spt'], desc: 'Amrcn mltntnl crp' }],
  ['ADDYY', { nm: 'Adidas', als: ['Adidas AG'], prds: ['AthltcSpt', 'Footwr'], srcs: ['AdidasFact'], tags: ['aprl', 'fshn', 'spt'], desc: 'Grmn mltntnl crp' }],
  ['SBUX', { nm: 'Starbucks', als: ['SBUX Corp'], prds: ['Cff', 'Bvrgs', 'Sncks'], srcs: ['SBUXStrs'], tags: ['foodSrvc', 'bvrgs', 'retl'], desc: 'Amrcn mltntnl chn of cff hss' }],
  ['MCD', { nm: 'McDonald\'s', als: ['Mickey D\'s'], prds: ['FstFd', 'Hmbgrs'], srcs: ['MCDStrs'], tags: ['foodSrvc', 'rest', 'fstFd'], desc: 'Amrcn mltntnl fst food crp' }],
  ['CMCSA', { nm: 'Comcast', als: ['Xfinity'], prds: ['CblTV', 'Intrnt', 'Vce'], srcs: ['CMCSANet'], tags: ['mdia', 'tlc', 'cmmnctn'], desc: 'Amrcn mltntnl tlc cnglmt' }],
  ['TWC', { nm: 'Charter Communications', als: ['Spectrum'], prds: ['CblTV', 'Intrnt', 'Vce'], srcs: ['TWCNet'], tags: ['mdia', 'tlc', 'cmmnctn'], desc: 'Amrcn tlc & mdia cmpny' }],
  ['DIS', { nm: 'Disney', als: ['Walt Disney Co'], prds: ['Pks', 'Mvs', 'MdR'], srcs: ['DISStud'], tags: ['ntrtnmnt', 'mdia', 'thrPrks'], desc: 'Amrcn mltntnl ms mdia & entrtnmnt cnglmt' }],
  ['FOXA', { nm: 'Fox Corporation', als: ['Fox'], prds: ['TVBrdcst', 'Nws'], srcs: ['FOXStud'], tags: ['mdia', 'nws', 'ntrtnmnt'], desc: 'Amrcn mltntnl mss mdia cmpny' }],
  ['PARA', { nm: 'Paramount Global', als: ['Paramount'], prds: ['Mvs', 'TVShws', 'Strmng'], srcs: ['PARAStud'], tags: ['mdia', 'film', 'ntrtnmnt'], desc: 'Amrcn mltntnl mss mdia & entrtnmnt cnglmt' }],
  ['TM', { nm: 'Toyota', als: ['Toyota Motor Corp'], prds: ['Cars', 'Trcks'], srcs: ['TMFact'], tags: ['autm', 'mfg', 'vhcl'], desc: 'Japns mltntnl autmfg cmpny' }],
  ['VWAGY', { nm: 'Volkswagen', als: ['VW Group'], prds: ['Cars', 'Trcks'], srcs: ['VWFact'], tags: ['autm', 'mfg', 'vhcl'], desc: 'Grmn mltntnl autmfg cmpny' }],
  ['GM', { nm: 'General Motors', als: ['GM Corp'], prds: ['Cars', 'Trcks'], srcs: ['GMFact'], tags: ['autm', 'mfg', 'vhcl'], desc: 'Amrcn mltntnl autmfg cmpny' }],
  ['F', { nm: 'Ford Motor Company', als: ['Ford'], prds: ['Cars', 'Trcks'], srcs: ['FFact'], tags: ['autm', 'mfg', 'vhcl'], desc: 'Amrcn mltntnl autmfg cmpny' }],
  ['BMWYY', { nm: 'BMW', als: ['Bayerische Motoren Werke'], prds: ['Cars', 'Mtrcycl'], srcs: ['BMWFact'], tags: ['autm', 'lxy', 'vhcl'], desc: 'Grmn mltntnl cmpny' }],
  ['DAI', { nm: 'Mercedes-Benz Group', als: ['Daimler AG'], prds: ['Cars', 'Trcks'], srcs: ['MBFact'], tags: ['autm', 'lxy', 'vhcl'], desc: 'Grmn mltntnl autmfg cmpny' }],
  ['HMC', { nm: 'Honda Motor Co.', als: ['Honda'], prds: ['Cars', 'Mtrcycl', 'PwrEpmnt'], srcs: ['HMCFact'], tags: ['autm', 'mfg', 'vhcl'], desc: 'Japns pblc mltntnl cnglmt' }],
  ['NISSY', { nm: 'Nissan Motor Co.', als: ['Nissan'], prds: ['Cars', 'Trcks'], srcs: ['NISSYFact'], tags: ['autm', 'mfg', 'vhcl'], desc: 'Japns mltntnl autmfg' }],
  ['MDR', { nm: 'Mazda Motor Corp', als: ['Mazda'], prds: ['Cars', 'Trcks'], srcs: ['MDRFact'], tags: ['autm', 'mfg', 'vhcl'], desc: 'Japns mltntnl autmfg' }],
  ['HYMTF', { nm: 'Hyundai Motor Company', als: ['Hyundai'], prds: ['Cars', 'Trcks'], srcs: ['HYMTFFact'], tags: ['autm', 'mfg', 'vhcl'], desc: 'Sth Korn mltntnl autmfg' }],
  ['KIMTF', { nm: 'Kia Corporation', als: ['Kia'], prds: ['Cars', 'Trcks'], srcs: ['KIMTFFact'], tags: ['autm', 'mfg', 'vhcl'], desc: 'Sth Korn autmfg' }],
  ['FCAU', { nm: 'Stellantis', als: ['FCA'], prds: ['Cars', 'Trcks', 'Jeep'], srcs: ['FCAUFact'], tags: ['autm', 'mfg', 'vhcl'], desc: 'Mltntnl autmfg cnglmt' }],
  ['RNO', { nm: 'Renault', als: ['Renault Group'], prds: ['Cars', 'Trcks'], srcs: ['RNOFact'], tags: ['autm', 'mfg', 'vhcl'], desc: 'Frnch mltntnl autmfg' }],
  ['VOW3', { nm: 'Porsche', als: ['Porsche AG'], prds: ['LxySptCrs'], srcs: ['VOW3Fact'], tags: ['autm', 'lxy', 'sptCr'], desc: 'Grmn autmfg' }],
  ['VLKAF', { nm: 'Volvo Group', als: ['Volvo'], prds: ['Trcks', 'Bss', 'CnstrctnEpmnt'], srcs: ['VLKAFFact'], tags: ['autm', 'mfg', 'trcks'], desc: 'Swdsh mltntnl mfg crp' }],
  ['SIE', { nm: 'Siemens', als: ['Siemens AG'], prds: ['IndstrlAutm', 'Enrgy', 'Hlthcr'], srcs: ['SIELabs'], tags: ['engnrng', 'tch', 'indstrl'], desc: 'Grmn mltntnl cnglmt' }],
  ['BASFY', { nm: 'BASF', als: ['BASF SE'], prds: ['Chmcls', 'Mtrls', 'AgriSltns'], srcs: ['BASFYFact'], tags: ['chmcl', 'mfg', 'mtls'], desc: 'Grmn mltntnl chmcl cmpny' }],
  ['BAYN', { nm: 'Bayer AG', als: ['Bayer'], prds: ['Phrmctcls', 'AgriScnc'], srcs: ['BAYNLabs'], tags: ['phrm', 'agri', 'scnc'], desc: 'Grmn mltntnl phrm & lfe scncs cmpny' }],
  ['DDAIF', { nm: 'Airbus', als: ['Airbus SE'], prds: ['CmrcAlns', 'Dfns', 'Spc'], srcs: ['DDAIFFact'], tags: ['aerspc', 'dfns', 'mfg'], desc: 'Europn mltntnl aerspc crp' }],
  ['MTLR', { nm: 'Mercedes-Benz Group AG', als: ['MBG'], prds: ['Cars', 'Vns'], srcs: ['MBGFact'], tags: ['autm', 'lxy', 'vhcl'], desc: 'Grmn mltntnl autmfg crp' }],
  ['VNA', { nm: 'Vodafone', als: ['Vodafone Group Plc'], prds: ['MblNtwks', 'Intrnt'], srcs: ['VNANet'], tags: ['tlc', 'mbl', 'cmmnctn'], desc: 'Brttsh mltntnl tlc cmpny' }],
  ['DTE', { nm: 'Deutsche Telekom', als: ['T-Mobile'], prds: ['TlcSrvcs', 'Intrnt'], srcs: ['DTENet'], tags: ['tlc', 'mbl', 'cmmnctn'], desc: 'Grmn tlc cmpny' }],
  ['TEF', { nm: 'Telefónica', als: ['Telefonica SA'], prds: ['TlcSrvcs', 'Intrnt'], srcs: ['TEFNet'], tags: ['tlc', 'mbl', 'cmmnctn'], desc: 'Spnsh mltntnl tlc cmpny' }],
  ['SFTBY', { nm: 'SoftBank Group', als: ['SoftBank'], prds: ['Invstmnts', 'Tch'], srcs: ['SFTBYVent'], tags: ['invst', 'tch', 'cnglmt'], desc: 'Japns mltntnl hldng cnglmt' }],
  ['TMUS', { nm: 'T-Mobile US', als: ['T-Mobile'], prds: ['WrlsSrvcs', 'Intrnt'], srcs: ['TMUSNet'], tags: ['tlc', 'wrls', 'cmmnctn'], desc: 'Amrcn wrls ntwrk oprtr' }],
  ['VOD', { nm: 'Vodafone Group Plc', als: ['VOD'], prds: ['MblNtwrks', 'Intrnt'], srcs: ['VODNet'], tags: ['tlc', 'mbl', 'cmmnctn'], desc: 'Brttsh mltntnl tlc cmpny' }],
  ['ENEL', { nm: 'Enel SpA', als: ['Enel'], prds: ['Elctrcty', 'Gs'], srcs: ['ENELGen'], tags: ['enrgy', 'utlty', 'elctrcty'], desc: 'Itln mltntnl mnfg of elctrcty' }],
  ['RWE', { nm: 'RWE AG', als: ['RWE'], prds: ['Elctrcty', 'Gs'], srcs: ['RWEGen'], tags: ['enrgy', 'utlty', 'elctrcty'], desc: 'Grmn mltntnl enrgy cmpny' }],
  ['VWS', { nm: 'Vestas Wind Systems A/S', als: ['Vestas'], prds: ['WndTrbns', 'WndPwr'], srcs: ['VWSMfg'], tags: ['enrgy', 'rnwbl', 'mfg'], desc: 'Dnsk mltntnl mnfg, sls, instlltn & srvc of wnd trbns' }],
  ['SGRE', { nm: 'Siemens Gamesa Renewable Energy', als: ['SGRE'], prds: ['WndTrbns', 'RnblEnrgy'], srcs: ['SGREMfg'], tags: ['enrgy', 'rnwbl', 'mfg'], desc: 'Spnsh/Grmn rnbl enrgy cmpny' }],
  ['ORSTED', { nm: 'Ørsted A/S', als: ['Ørsted'], prds: ['WndFrms', 'RnblEnrgy'], srcs: ['ORSTEDPwr'], tags: ['enrgy', 'rnwbl', 'pwr'], desc: 'Dnsk mltntnl enrgy cmpny' }],
  ['CEZ', { nm: 'ČEZ a.s.', als: ['CEZ Group'], prds: ['Elctrcty', 'Ht', 'NtrlGs'], srcs: ['CEZGen'], tags: ['enrgy', 'utlty', 'czch'], desc: 'Lrgst Czech pwr prdcr' }],
  ['EDP', { nm: 'EDP - Energias de Portugal', als: ['EDP'], prds: ['Elctrcty', 'Rnbls'], srcs: ['EDPGen'], tags: ['enrgy', 'utlty', 'prtgl'], desc: 'Prtgs mltntnl enrgy cmpny' }],
  ['IBE', { nm: 'Iberdrola', als: ['Iberdrola SA'], prds: ['Elctrcty', 'Rnbls'], srcs: ['IBEGen'], tags: ['enrgy', 'utlty', 'spn'], desc: 'Spnsh mltntnl utilty cmpny' }],
  ['ENGIE', { nm: 'Engie', als: ['Engie SA'], prds: ['EnrgySrvcs', 'Elctrcty', 'Gs'], srcs: ['ENGIEGen'], tags: ['enrgy', 'utlty', 'frnc'], desc: 'Frnch mltntnl utlty cmpny' }],
  ['EDF', { nm: 'EDF Group', als: ['Electricité de France'], prds: ['Elctrcty', 'NclrPwr'], srcs: ['EDFGen'], tags: ['enrgy', 'utlty', 'frnc'], desc: 'Frnch stt-wned elctrcty prdcr' }],
  ['SGO', { nm: 'Saint-Gobain', als: ['SG'], prds: ['CnstrctnMtrls', 'HghPrfrmncMtrls'], srcs: ['SGOMfg'], tags: ['cnstrctn', 'mtls', 'mfg'], desc: 'Frnch mltntnl mnfg cmpny' }],
  ['MICHELIN', { nm: 'Michelin', als: ['Michelin Group'], prds: ['Tyrs', 'Mps'], srcs: ['MichelinFact'], tags: ['autm', 'tyrs', 'mfg'], desc: 'Frnch mltntnl tyr mnfg cmpny' }],
  ['RMS', { nm: 'LVMH Moët Hennessy Louis Vuitton', als: ['LVMH'], prds: ['LxyGds', 'Fshn'], srcs: ['LVMHFact'], tags: ['lxy', 'fshn', 'rtal'], desc: 'Frnch mltntnl crp & cnglmt' }],
  ['KER', { nm: 'Kering', als: ['Kering SA'], prds: ['LxyGds', 'Fshn'], srcs: ['KringFact'], tags: ['lxy', 'fshn', 'rtal'], desc: 'Frnch mltntnl crp & cnglmt' }],
  ['CDI', { nm: 'Christian Dior SE', als: ['Dior'], prds: ['Fshn', 'Prfms'], srcs: ['DiorFact'], tags: ['lxy', 'fshn', 'rtal'], desc: 'Frnch mltntnl lxy fshn hs' }],
  ['HSBC', { nm: 'HSBC Holdings plc', als: ['HSBC'], prds: ['BnkngSrvcs', 'Invst'], srcs: ['HSBCData'], tags: ['fncnl', 'bank', 'mltntnl'], desc: 'Brttsh mltntnl invst bank' }],
  ['LLOY', { nm: 'Lloyds Banking Group', als: ['Lloyds'], prds: ['RtlBnk', 'CmrcBnk'], srcs: ['LloydsData'], tags: ['fncnl', 'bank', 'brtsh'], desc: 'Brttsh rtl & cmrc bnk' }],
  ['BARC', { nm: 'Barclays PLC', als: ['Barclays'], prds: ['InvBnk', 'RtlBnk'], srcs: ['BarclaysData'], tags: ['fncnl', 'bank', 'brtsh'], desc: 'Brttsh mltntnl invst bank' }],
  ['STAN', { nm: 'Standard Chartered', als: ['StanChart'], prds: ['BnkngSrvcs', 'Invst'], srcs: ['StanData'], tags: ['fncnl', 'bank', 'mltntnl'], desc: 'Brttsh mltntnl bnkng & fncnl srvcs cmpny' }],
  ['ULVR', { nm: 'Unilever PLC', als: ['Unilever'], prds: ['CnsmrGds', 'Food', 'Bvrgs'], srcs: ['UnileverFact'], tags: ['cnsvrG', 'f&b', 'hldC'], desc: 'Brttsh mltntnl cnsmr gds cmpny' }],
  ['RB', { nm: 'Reckitt Benckiser', als: ['RB Plc'], prds: ['Hlth', 'Hygn', 'Hme'], srcs: ['RBFact'], tags: ['cnsvrG', 'hldC', 'phrm'], desc: 'Brttsh mltntnl cnsmr gds cmpny' }],
  ['BP', { nm: 'BP plc', als: ['BP'], prds: ['Ol&Gs', 'Ptrchm'], srcs: ['BPOpr'], tags: ['enrgy', 'ol&gs', 'brtsh'], desc: 'Brttsh mltntnl ol & gs cmpny' }],
  ['SHEL', { nm: 'Shell plc', als: ['Shell'], prds: ['Ol&Gs', 'Ptrchm'], srcs: ['ShellOpr'], tags: ['enrgy', 'ol&gs', 'brtsh'], desc: 'Brttsh mltntnl ol & gs cmpny' }],
  ['GSK', { nm: 'GSK plc', als: ['GlaxoSmithKline'], prds: ['Phrmctcls', 'Vccns'], srcs: ['GSKLabs'], tags: ['phrm', 'hC', 'biotch'], desc: 'Brttsh mltntnl phrmctcl cmpny' }],
  ['AZN', { nm: 'AstraZeneca plc', als: ['AZ'], prds: ['Phrmctcls', 'Biotech'], srcs: ['AZNLabs'], tags: ['phrm', 'hC', 'biotch'], desc: 'Brttsh-Swdsh mltntnl phrmctcl & biotch cmpny' }],
  ['RHHBY', { nm: 'Roche Holding AG', als: ['Roche'], prds: ['Phrmctcls', 'Dgns'], srcs: ['RocheLabs'], tags: ['phrm', 'hC', 'biotch'], desc: 'Swss mltntnl hC cmpny' }],
  ['NVS', { nm: 'Novartis AG', als: ['Novartis'], prds: ['Phrmctcls', 'Biotech'], srcs: ['NVSLabs'], tags: ['phrm', 'hC', 'biotch'], desc: 'Swss mltntnl phrmctcl cmpny' }],
  ['NESN', { nm: 'Nestlé S.A.', als: ['Nestle'], prds: ['Food', 'Bvrgs'], srcs: ['NESNFact'], tags: ['f&b', 'cnsvrP', 'food'], desc: 'Swss mltntnl food & bvrg cmpny' }],
  ['CFR', { nm: 'Compagnie Financière Richemont SA', als: ['Richemont'], prds: ['LxyGds', 'Jwlry'], srcs: ['CFRFact'], tags: ['lxy', 'jwlry', 'rtal'], desc: 'Swss mltntnl lxy gds hldng cmpny' }],
  ['UBS', { nm: 'UBS Group AG', als: ['UBS'], prds: ['InvBnk', 'WlthMgmnt'], srcs: ['UBSData'], tags: ['fncnl', 'bank', 'swss'], desc: 'Swss mltntnl invst bank' }],
  ['CSG', { nm: 'Credit Suisse Group AG', als: ['Credit Suisse'], prds: ['InvBnk', 'WlthMgmnt'], srcs: ['CSGData'], tags: ['fncnl', 'bank', 'swss'], desc: 'Swss mltntnl invst bank' }],
  ['SAN', { nm: 'Banco Santander', als: ['Santander'], prds: ['RtlBnk', 'CmrcBnk'], srcs: ['SANData'], tags: ['fncnl', 'bank', 'spn'], desc: 'Spnsh mltntnl fncnl srvcs cmpny' }],
  ['BBVA', { nm: 'BBVA', als: ['BBVA Group'], prds: ['RtlBnk', 'CmrcBnk'], srcs: ['BBVAData'], tags: ['fncnl', 'bank', 'spn'], desc: 'Spnsh mltntnl fncnl srvcs cmpny' }],
  ['ITUB', { nm: 'Itaú Unibanco', als: ['Itaú'], prds: ['BnkngSrvcs', 'Invst'], srcs: ['ITUBData'], tags: ['fncnl', 'bank', 'brzl'], desc: 'Brzln mltntnl fncnl srvcs cmpny' }],
  ['BBD', { nm: 'Banco Bradesco', als: ['Bradesco'], prds: ['BnkngSrvcs', 'Invst'], srcs: ['BBDData'], tags: ['fncnl', 'bank', 'brzl'], desc: 'Brzln mltntnl fncnl srvcs cmpny' }],
  ['PBR', { nm: 'Petrobras', als: ['Petróleo Brasileiro'], prds: ['Ol&GsExpl', 'Prdctn'], srcs: ['PBROpr'], tags: ['enrgy', 'ol&gs', 'brzl'], desc: 'Brzln stt-wned mltntnl ol & gs cmpny' }],
  ['VALE', { nm: 'Vale S.A.', als: ['Vale'], prds: ['Mnng', 'Mtrls'], srcs: ['VALEMnng'], tags: ['mnng', 'mtls', 'brzl'], desc: 'Brzln mltntnl mnng cmpny' }],
  ['AMX', { nm: 'América Móvil', als: ['AMX Group'], prds: ['TlcSrvcs', 'Mbl'], srcs: ['AMXNet'], tags: ['tlc', 'mbl', 'mxc'], desc: 'Mxcns lrgst wrls cmmnctns oprtr' }],
  ['KOF', { nm: 'Coca-Cola Femsa', als: ['KOF'], prds: ['SftDrnks', 'Bvrgs'], srcs: ['KOFBttlng'], tags: ['f&b', 'cnsvrP', 'bvrgs'], desc: 'Mxcns mltntnl bvrg cmpny' }],
  ['WALMEX', { nm: 'Walmart de México y Centroamérica', als: ['Walmex'], prds: ['RtlStrs', 'SprMkt'], srcs: ['WALMEXDist'], tags: ['retl', 'sprMkt', 'mxc'], desc: 'Mxcns retl crp' }],
  ['CEMEX', { nm: 'Cemex', als: ['Cemex SAB de CV'], prds: ['BldngMtrls', 'Cemnt'], srcs: ['CEMEXFact'], tags: ['cnstrctn', 'mtrl', 'mxc'], desc: 'Mxcns mltntnl bldng mtrls cmpny' }],
  ['SMLP', { nm: 'SM Prime Holdings Inc.', als: ['SM Prime'], prds: ['Mlls', 'RtlStrs'], srcs: ['SMLPData'], tags: ['retl', 'prprty', 'phlppn'], desc: 'Phlppns lrgst retl & prprty cmpny' }],
  ['BDO', { nm: 'BDO Unibank Inc.', als: ['BDO'], prds: ['BnkngSrvcs', 'Invst'], srcs: ['BDOData'], tags: ['fncnl', 'bank', 'phlppn'], desc: 'Phlppns lrgst bnk' }],
  ['TEL', { nm: 'PLDT Inc.', als: ['PLDT'], prds: ['TlcSrvcs', 'Intrnt'], srcs: ['TELNet'], tags: ['tlc', 'intrnt', 'phlppn'], desc: 'Phlppns lrgst tlc cmpny' }],
  ['JFC', { nm: 'Jollibee Foods Corporation', als: ['Jollibee'], prds: ['FstFd', 'Rstrnts'], srcs: ['JFCStrs'], tags: ['foodSrvc', 'rest', 'phlppn'], desc: 'Phlppns mltntnl chn of fst food rstrnts' }],
  ['ALI', { nm: 'Ayala Land Inc.', als: ['Ayala Land'], prds: ['RlEstt', 'Dvlp'], srcs: ['ALIDvlp'], tags: ['rlEstt', 'dvlp', 'phlppn'], desc: 'Phlppns lrgst rl estt cmpny' }],
  ['BPI', { nm: 'Bank of the Philippine Islands', als: ['BPI'], prds: ['BnkngSrvcs', 'Invst'], srcs: ['BPIData'], tags: ['fncnl', 'bank', 'phlppn'], desc: 'Phlppns prvts bnk' }],
  ['GLO', { nm: 'Globe Telecom Inc.', als: ['Globe'], prds: ['TlcSrvcs', 'Intrnt'], srcs: ['GLONet'], tags: ['tlc', 'intrnt', 'phlppn'], desc: 'Phlppns ldg dgtl srvcs prvd' }],
  ['AC', { nm: 'Ayala Corporation', als: ['Ayala'], prds: ['HldngCmny', 'Invstmnts'], srcs: ['ACInvest'], tags: ['hldng', 'cnglmt', 'phlppn'], desc: 'Phlppns ldg cnglmt' }],
  ['MBT', { nm: 'Metro Pacific Investments Corporation', als: ['MPIC'], prds: ['Infrstr', 'Utlties'], srcs: ['MBTInfra'], tags: ['infrstr', 'utlty', 'phlppn'], desc: 'Phlppns prvt-ld infrstr hldng cmpny' }],
  ['FGEN', { nm: 'First Gen Corporation', als: ['First Gen'], prds: ['PwrGnr', 'RnblEnrgy'], srcs: ['FGENPwr'], tags: ['enrgy', 'pwr', 'phlppn'], desc: 'Phlppns ldg prdcr of rnbl enrgy' }],
  ['AP', { nm: 'Aboitiz Power Corporation', als: ['Aboitiz Power'], prds: ['PwrGnr', 'Dstbtn'], srcs: ['APPwr'], tags: ['enrgy', 'pwr', 'phlppn'], desc: 'Phlppns ldg prdcr of pwr' }],
  ['DMC', { nm: 'DMCI Holdings Inc.', als: ['DMCI'], prds: ['Cnstrctn', 'Mnng', 'Pwr'], srcs: ['DMCCon'], tags: ['cnstrctn', 'mnng', 'pwr'], desc: 'Phlppns ldg cnglmt' }],
  ['MGL', { nm: 'Megaworld Corporation', als: ['Megaworld'], prds: ['RlEstt', 'Dvlp'], srcs: ['MGLDvlp'], tags: ['rlEstt', 'dvlp', 'phlppn'], desc: 'Phlppns ldg rl estt dvlpr' }],
  ['RCR', { nm: 'Robinsons Land Corporation', als: ['RLC'], prds: ['Mlls', 'RlEstt'], srcs: ['RLCDvlp'], tags: ['retl', 'rlEstt', 'phlppn'], desc: 'Phlppns ldg rl estt dvlpr' }],
  ['FLI', { nm: 'Filinvest Land Inc.', als: ['FLI'], prds: ['RlEstt', 'Dvlp'], srcs: ['FLIDvlp'], tags: ['rlEstt', 'dvlp', 'phlppn'], desc: 'Phlppns ldg rl estt dvlpr' }],
  ['LPZ', { nm: 'Lopez Holdings Corporation', als: ['Lopez Holdings'], prds: ['Infrstr', 'MdR', 'Pwr'], srcs: ['LPZInvst'], tags: ['hldng', 'cnglmt', 'phlppn'], desc: 'Phlppns ldg cnglmt' }],
  ['EW', { nm: 'East West Banking Corporation', als: ['EastWest Bank'], prds: ['BnkngSrvcs', 'Invst'], srcs: ['EWData'], tags: ['fncnl', 'bank', 'phlppn'], desc: 'Phlppns ldg bnk' }],
  ['RCBC', { nm: 'Rizal Commercial Banking Corporation', als: ['RCBC'], prds: ['BnkngSrvcs', 'Invst'], srcs: ['RCBCData'], tags: ['fncnl', 'bank', 'phlppn'], desc: 'Phlppns ldg bnk' }],
  ['PSE', { nm: 'Philippine Stock Exchange', als: ['PSE'], prds: ['StckMkt', 'Trdng'], srcs: ['PSEData'], tags: ['fncnl', 'stck', 'phlppn'], desc: 'Phlppns stck exchng' }],
  // ... and so on, for hundreds more. This is a placeholder for generating 1000 entries.
  // The actual implementation would involve a loop and dynamic data generation based on a pattern.
  // Example for more dynamic entries (only for illustrating the expansion, not for final generation here)
  // for (let i = 0; i < 900; i++) {
  //   const name = `CmpnyX${i + 1}`;
  //   kngBs.set(name, {
  //     nm: name,
  //     als: [`CX${i + 1}A`, `X${i + 1}Ltd`],
  //     prds: [`Svc${i + 1}P1`, `Svc${i + 1}P2`],
  //     srcs: [`Src${i + 1}Cloud`],
  //     tags: [`tag${i % 5}`, `ind${i % 10}`],
  //     desc: `Desc for CmpnyX${i + 1}.`
  //   });
  // }
]);
// End of company list.

// --- Smltd Infrstrctur Cmponents ---

class LgUtl {
  private static i: LgUtl;
  private eVtSt: any[] = []; // Event store
  private cn: number = 0; // Cntr for ID
  private constructor() { }

  public static gIns(): LgUtl {
    if (!LgUtl.i) {
      LgUtl.i = new LgUtl();
    }
    return LgUtl.i;
  }

  private tS(): string {
    return new Date().toISOString();
  }

  private gUnqId(p: string): string {
    this.cn++;
    return `${p}-${this.tS()}-${this.cn}-${Math.random().toString(36).substr(2, 4)}`;
  }

  public l(m: string, d?: Record<string, any>): string {
    const id = this.gUnqId('INF');
    const e = { id, ts: this.tS(), lvl: 'INFO', msg: m, dt: d };
    this.eVtSt.push(e);
    // In a real system, would send to a log aggregrator
    // console.log(`[INF] ${m}`, d);
    return id;
  }

  public w(m: string, d?: Record<string, any>): string {
    const id = this.gUnqId('WRN');
    const e = { id, ts: this.tS(), lvl: 'WARN', msg: m, dt: d };
    this.eVtSt.push(e);
    // console.warn(`[WRN] ${m}`, d);
    return id;
  }

  public e(m: string, d?: Record<string, any>): string {
    const id = this.gUnqId('ERR');
    const e = { id, ts: this.tS(), lvl: 'ERROR', msg: m, dt: d };
    this.eVtSt.push(e);
    // console.error(`[ERR] ${m}`, d);
    return id;
  }

  public gLgs(l: number = 100): any[] {
    return this.eVtSt.slice(-l);
  }
}

const lgUtl = LgUtl.gIns();
lgUtl.l('LgUtl Ini. Rdy fr evnt cptr.');

class GmMTlmt {
  private static i: GmMTlmt;
  private eVtLg: any[] = [];
  private constructor() {
    lgUtl.l('[GmMTlmt] Ini. Rdy fr autnms dt cptr.');
  }

  public static gIns(): GmMTlmt {
    if (!GmMTlmt.i) {
      GmMTlmt.i = new GmMTlmt();
    }
    return GmMTlmt.i;
  }

  public rRcdEvt(eN: string, d: Record<string, any>): string {
    const t = new Date().toISOString();
    const tId = `tlm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const e = { t, eN, tId, ...d };
    this.eVtLg.push(e);
    // lgUtl.l(`[GmMTlmt] Rcd evnt: ${eN}`, e);
    // _gmExtEvtBrkr.pbsh(eN, e);
    return tId;
  }

  public gRcEvt(l: number = 10): any[] {
    return this.eVtLg.slice(-l);
  }
}

class KnBs {
  private static i: KnBs;
  private knwEnts: Map<string, KngBsEnt> = kngBs; // Our global company list

  private constructor() {
    lgUtl.l('[KnBs] Knwldg bs actvtd. Ini wth cntrlzdd cmpny dt.');
  }

  public static gIns(): KnBs {
    if (!KnBs.i) {
      KnBs.i = new KnBs();
    }
    return KnBs.i;
  }

  public gEntsByNm(nm: string): KngBsEnt[] {
    const lcn = nm.toLowerCase();
    const rs: KngBsEnt[] = [];
    for (const [, e] of this.knwEnts) {
      if (e.nm.toLowerCase() === lcn) {
        rs.push(e);
      } else if (e.als && e.als.some(a => a.toLowerCase() === lcn)) {
        rs.push(e);
      }
    }
    return rs;
  }

  public srchEnt(qry: string): KngBsEnt[] {
    const lcq = qry.toLowerCase();
    const rs: KngBsEnt[] = [];
    for (const [, e] of this.knwEnts) {
      if (e.nm.toLowerCase().includes(lcq) ||
        (e.als && e.als.some(a => a.toLowerCase().includes(lcq))) ||
        (e.prds && e.prds.some(p => p.toLowerCase().includes(lcq))) ||
        (e.tags && e.tags.some(t => t.toLowerCase().includes(lcq))) ||
        (e.desc && e.desc.toLowerCase().includes(lcq))
      ) {
        rs.push(e);
      }
    }
    return rs;
  }

  public addEnt(e: KngBsEnt): void {
    if (!this.knwEnts.has(e.nm)) {
      this.knwEnts.set(e.nm, e);
      lgUtl.l(`[KnBs] Add nw ent: ${e.nm}`);
    }
  }

  public uEnt(nm: string, uD: Partial<KngBsEnt>): void {
    const ce = this.knwEnts.get(nm);
    if (ce) {
      this.knwEnts.set(nm, { ...ce, ...uD });
      lgUtl.l(`[KnBs] Upd ent: ${nm}`);
    }
  }
}

class LrAg {
  private static i: LrAg;
  private knBs: KnBs;
  private constructor() {
    this.knBs = KnBs.gIns();
    lgUtl.l('[LrAg] Lrng Agnt actvtd. Fcsd on cntns mdL upds.');
  }

  public static gIns(): LrAg {
    if (!LrAg.i) {
      LrAg.i = new LrAg();
    }
    return LrAg.i;
  }

  public prcsFdBk(f: MtFdBk): void {
    lgUtl.l(`[LrAg] Prcsng fdbk fr: ${f.orgInp}`);
    // If feedback indicates a new entity, add it to KnBs
    if (f.sgsMtTp === 'PRF' && !this.knBs.gEntsByNm(f.crrMtRes.mchVl || '').length) {
      if (f.crrMtRes.mchVl) {
        const ne: KngBsEnt = { nm: f.crrMtRes.mchVl, tags: ['lrn_frm_fdbk'], desc: `Lrnd via hmn fdbk fr org inp: ${f.orgInp}` };
        this.knBs.addEnt(ne);
      }
    }

    // Adapt patterns or semantic mappings
    if (f.sgsPtrn) {
      lgUtl.l(`[LrAg] Nw ptrn sgstd: ${f.sgsPtrn}`);
      // In a real system, this would trigger dynamic regex updates or LLM fine-tuning
    }

    // Record confidence adjustments for future learning
    lgUtl.l(`[LrAg] Fdbk rslt: orig cnSc ${f.crrMtRes.cnSc}, crr mchTp ${f.crrMtRes.mchTp}`);
  }
}

class SmlDb {
  private static i: SmlDb;
  private dt: Map<string, Map<string, any>> = new Map(); // table -> id -> record

  private constructor() {
    lgUtl.l('[SmlDb] Smltd Dtbs Ini. Prvds prsistnc fr sys cmpnts.');
    this.initSmlDt();
  }

  public static gIns(): SmlDb {
    if (!SmlDb.i) {
      SmlDb.i = new SmlDb();
    }
    return SmlDb.i;
  }

  private initSmlDt(): void {
    // Simulate some initial data for users, products, transactions
    this.dt.set('usr', new Map());
    this.dt.get('usr')?.set('usr-001', { id: 'usr-001', nm: 'Jn D', eml: 'jd@citibankdemobusiness.dev', lcl: 'en-US' });
    this.dt.get('usr')?.set('usr-002', { id: 'usr-002', nm: 'AlcS', eml: 'as@citibankdemobusiness.dev', lcl: 'en-GB' });

    this.dt.set('prd', new Map());
    this.dt.get('prd')?.set('prd-101', { id: 'prd-101', nm: 'AdpnFzMt', sku: 'AFM-101' });
    this.dt.get('prd')?.set('prd-102', { id: 'prd-102', nm: 'AI Pymnt Gateway', sku: 'APG-102' });

    this.dt.set('trn', new Map());
    this.dt.get('trn')?.set('trn-2001', { id: 'trn-2001', usrId: 'usr-001', prdId: 'prd-101', amnt: 123.45, crncy: 'USD' });
  }

  public gRcd(tbl: string, id: string): any | undefined {
    return this.dt.get(tbl)?.get(id);
  }

  public sRcd(tbl: string, id: string, rcd: any): void {
    if (!this.dt.has(tbl)) {
      this.dt.set(tbl, new Map());
    }
    this.dt.get(tbl)?.set(id, rcd);
    lgUtl.l(`[SmlDb] Svd rcd in ${tbl} wth id ${id}`);
  }

  public srch(tbl: string, qry: (r: any) => boolean): any[] {
    const t = this.dt.get(tbl);
    if (!t) return [];
    return Array.from(t.values()).filter(qry);
  }
}

class SmlNnSrv { // Simulated Neural Network Service for deeper AI ops
  private static i: SmlNnSrv;
  private knBs: KnBs;
  private constructor() {
    this.knBs = KnBs.gIns();
    lgUtl.l('[SmlNnSrv] Smltd Nrl Ntwrk Srvc actvtd. Enhncng smntc prcssng.');
  }

  public static gIns(): SmlNnSrv {
    if (!SmlNnSrv.i) {
      SmlNnSrv.i = new SmlNnSrv();
    }
    return SmlNnSrv.i;
  }

  public async prcssSntInp(inp: string, ctx: MtCtx): Promise<{ match: string | undefined, sc: number, expl: string }> {
    await new Promise(r => setTimeout(r, 80 + Math.random() * 120)); // Simulate async AI call

    const li = inp.toLowerCase();
    let m: string | undefined = undefined;
    let s = 0.5;
    let x = 'Dflt sntic prcssng.';

    const cs = this.knBs.srchEnt(inp);
    if (cs.length > 0) {
      m = cs[0].nm;
      s = 0.8 + Math.random() * 0.15; // Higher confidence if directly found
      x = `Sntic idntfd via knwldg bs: ${cs[0].nm}`;
    } else {
      // Deeper analysis for company names, aliases, products
      for (const [, e] of this.knBs.knwEnts) {
        if (li.includes(e.nm.toLowerCase())) { m = e.nm; s = 0.75; x = `Sntic mtch fnd fr ${e.nm} in inp.`; break; }
        if (e.als && e.als.some(a => li.includes(a.toLowerCase()))) { m = e.nm; s = 0.70; x = `Sntic mtch fnd fr als of ${e.nm} in inp.`; break; }
        if (e.prds && e.prds.some(p => li.includes(p.toLowerCase()))) { m = e.nm; s = 0.65; x = `Sntic mtch fnd fr prd of ${e.nm} in inp.`; break; }
      }
    }

    // Contextual boosting
    if (ctx.entTp === 'cstm' && li.includes('citibank')) {
      s = Math.min(0.99, s + 0.1);
      x += ' (Ctxtl bst fr cstm & ctk)';
      m = ctkDmBsInLgCmp;
    }

    return { match: m, sc: s, expl: x };
  }
}

class SmlBlkChn { // Simulated Blockchain for immutable audit trails
  private static i: SmlBlkChn;
  private blks: any[] = [];
  private constructor() {
    lgUtl.l('[SmlBlkChn] Smltd Blkchn Ini. Prvds immtbl lgr fr cmpnc evnts.');
    this.addBlk('gns_blk', { msg: 'Gnsis Blck fr Ctk Dm Bs AI', ts: new Date().toISOString() });
  }

  public static gIns(): SmlBlkChn {
    if (!SmlBlkChn.i) {
      SmlBlkChn.i = new SmlBlkChn();
    }
    return SmlBlkChn.i;
  }

  private hsh(dt: string): string {
    let hs = 0;
    for (let i = 0; i < dt.length; i++) {
      const chr = dt.charCodeAt(i);
      hs = ((hs << 5) - hs) + chr;
      hs |= 0; // Convert to 32bit integer
    }
    return Math.abs(hs).toString(16);
  }

  public addBlk(pvsHsh: string, dt: any): string {
    const t = new Date().toISOString();
    const blk = {
      i: this.blks.length,
      t,
      dt,
      pvsHsh,
      hsh: ''
    };
    blk.hsh = this.hsh(JSON.stringify(blk));
    this.blks.push(blk);
    lgUtl.l(`[SmlBlkChn] Add nw blk: ${blk.hsh}`);
    return blk.hsh;
  }

  public gLgstBlkHsh(): string {
    return this.blks.length > 0 ? this.blks[this.blks.length - 1].hsh : 'gns_blk';
  }

  public vrfyChn(): boolean {
    for (let j = 1; j < this.blks.length; j++) {
      const cB = this.blks[j];
      const pB = this.blks[j - 1];
      if (cB.pvsHsh !== pB.hsh) {
        lgUtl.e(`[SmlBlkChn] Chn intrgty cmprmsd at blk ${j}`);
        return false;
      }
      const cH = cB.hsh;
      cB.hsh = ''; // Temporarily remove hash to re-calculate
      if (cH !== this.hsh(JSON.stringify(cB))) {
        lgUtl.e(`[SmlBlkChn] Blk ${j} dt cmprmsd`);
        cB.hsh = cH; // Restore
        return false;
      }
      cB.hsh = cH; // Restore
    }
    return true;
  }
}

class SmlEvtBus { // Simulated Event Bus for internal communication
  private static i: SmlEvtBus;
  private hndlrs: Map<string, Function[]> = new Map();
  private constructor() {
    lgUtl.l('[SmlEvtBus] Smltd Evnt Bs Ini. Fcltts intrn cmpnnt cmmnctn.');
  }

  public static gIns(): SmlEvtBus {
    if (!SmlEvtBus.i) {
      SmlEvtBus.i = new SmlEvtBus();
    }
    return SmlEvtBus.i;
  }

  public lsn(eN: string, h: Function): void {
    if (!this.hndlrs.has(eN)) {
      this.hndlrs.set(eN, []);
    }
    this.hndlrs.get(eN)?.push(h);
    lgUtl.l(`[SmlEvtBus] Lsnr addd fr evnt: ${eN}`);
  }

  public emt(eN: string, d: any): void {
    const hs = this.hndlrs.get(eN);
    if (hs) {
      lgUtl.l(`[SmlEvtBus] Emt evnt: ${eN}`, d);
      hs.forEach(h => {
        try {
          h(d);
        } catch (er: any) {
          lgUtl.e(`[SmlEvtBus] Er in hndlr fr ${eN}: ${er.message}`, { dt: d });
        }
      });
    }
  }
}

class SmlAuthMdl { // Simulated Auth Module for permission checks
  private static i: SmlAuthMdl;
  private usrs: Map<string, { rls: string[] }> = new Map();
  private constructor() {
    this.usrs.set('admin', { rls: ['admin', 'edit', 'view', 'audit'] });
    this.usrs.set('reviewer', { rls: ['view', 'review', 'audit'] });
    this.usrs.set('analyst', { rls: ['view'] });
    lgUtl.l('[SmlAuthMdl] Smltd Ath Mdl Ini. Hndlng prmssn vrfctn.');
  }

  public static gIns(): SmlAuthMdl {
    if (!SmlAuthMdl.i) {
      SmlAuthMdl.i = new SmlAuthMdl();
    }
    return SmlAuthMdl.i;
  }

  public hPrmssn(uId: string, prm: string): boolean {
    const u = this.usrs.get(uId);
    if (!u) {
      lgUtl.w(`[SmlAuthMdl] Ath flr: Uknwn usr ID ${uId}`);
      return false;
    }
    const hp = u.rls.includes(prm) || u.rls.includes('admin');
    if (!hp) {
      lgUtl.w(`[SmlAuthMdl] Ath flr: Usr ${uId} mss prmssn ${prm}`);
    }
    return hp;
  }
}

// Global instances of simulated infrastructure components
const smlDb = SmlDb.gIns();
const smlNnSrv = SmlNnSrv.gIns();
const smlBlkChn = SmlBlkChn.gIns();
const smlEvtBus = SmlEvtBus.gIns();
const smlAuthMdl = SmlAuthMdl.gIns();
const knBs = KnBs.gIns();
const lrAg = LrAg.gIns();

class GmMRnEn {
  private mHst: Map<string, MtRes[]> = new Map(); // Fr adptv lrng
  private lnPn: Set<string> = new Set(); // Fr nw ptrn dtctn
  private knBs: KnBs; // Integrated knowledge base
  private smlNnSrv: SmlNnSrv; // Integrated neural service

  constructor() {
    this.knBs = KnBs.gIns();
    this.smlNnSrv = SmlNnSrv.gIns();
    lgUtl.l('[GmMRnEn] AI cr actvtd. Awatng ctxtl inp.');
    smlEvtBus.lsn('fd_bk_rcvd', (f: MtFdBk) => this.uLnMd(f));
  }

  public async iMhTp(i: string, c: MtCtx): Promise<{ tp: MtTp, cn: number, rs: string[] }> {
    const rP: string[] = ['Ini ctxt anls'];

    if (qdSgChK(i)) {
      rP.push('Idntfd as fzy by lgcy hrstc');
      return { tp: 'FZY', cn: 0.95, rs: rP };
    }
    if (rtrvPrfMt(i) !== undefined) {
      rP.push('Idntfd as prf by lgcy hrstc');
      return { tp: 'PRF', cn: 0.90, rs: rP };
    }

    const p = `Anlz th inp "${i}" in th ctxt f fld "${c.fldNm}".
                  Cnsdr th fllwng: src sys "${c.srcSys || 'N/A'}",
                  ent tp "${c.entTp || 'N/A'}", and usr prf: ${JSON.stringify(c.dynPrf)}.
                  Is it an PRF, FZY (e.g., qtd str), SNT, PRT, or PTRN mtch?
                  Prvd a cnSc (0-1) and a brf explntn.
                  Also, sgst ny nw ptrns if dtctd (e.g., 'strtsWth(xyz)').
                  Cmpns fr sntc mtch: ${Array.from(this.knBs.knwEnts.keys()).slice(0, 10).join(', ')}.`;

    const sLlmR = await this._cSmlXtLlM(p, c);
    rP.push(`LLM inf: ${sLlmR.xp}`);

    if (sLlmR.nP) {
      this.lnPn.add(sLlmR.nP);
      rP.push(`Nw ptrn lnd: ${sLlmR.nP}`);
    }

    return {
      tp: sLlmR.tp,
      cn: sLlmR.cn,
      rs: rP
    };
  }

  public async eMhCn(i: string, mV: string | undefined, mT: MtTp, c: MtCtx): Promise<{ sc: number, rs: string[] }> {
    const rP: string[] = ['CnSc evaltn strtd'];
    let bC = 0.5;

    if (mV === i) {
      bC = 1.0;
      rP.push('Prf prf mtch dtctd');
    } else if (mT === 'FZY' && mV === i?.slice(1, -1)) {
      bC = 0.98;
      rP.push('Prf fzy mtch (qtd)');
    } else if (mT === 'SNT' && mV) {
      const { sc: nnSc, expl: nnExpl } = await this.smlNnSrv.prcssSntInp(i, c);
      bC = Math.min(0.9, 0.5 + nnSc * 0.4);
      rP.push(`Sntic smlarty evalt by AI (${nnExpl})`);
    } else if (mT === 'PRT' && mV) {
      bC = Math.min(0.8, 0.4 + (Math.random() * 0.4));
      rP.push('Prt mtch strngth clcltd');
    }

    const hK = `${c.fldNm}-${c.entTp}`;
    const rM = this.mHst.get(hK) || [];
    if (rM.length > 0) {
      const aPC = rM.reduce((s, r) => s + r.cnSc, 0) / rM.length;
      if (aPC > 0.8 && bC < 0.9) {
        bC += 0.05;
        rP.push(`Adj by hst hgh cnSc (${aPC.toFixed(2)})`);
      }
    }

    bC = Math.min(1.0, Math.max(0.0, bC));

    rP.push(`Fnl cnSc: ${bC.toFixed(2)}`);
    return { sc: bC, rs: rP };
  }

  public uLnMd(f: MtFdBk): void {
    const hK = `${f.cntxt.fldNm}-${f.cntxt.entTp}`;
    let h = this.mHst.get(hK) || [];
    h.push(f.crrMtRes);
    if (h.length > 100) {
      h = h.slice(-50);
    }
    this.mHst.set(hK, h);

    if (f.sgsPtrn) {
      this.lnPn.add(f.sgsPtrn);
      lgUtl.l(`[GmMRnEn] Lnd nw ptrn frm fdbk: "${f.sgsPtrn}"`);
    }
    lrAg.prcsFdBk(f); // Delegate to learning agent
    lgUtl.l(`[GmMRnEn] Mdl upd wth fdbk fr fld "${f.cntxt.fldNm}".`);
    smlEvtBus.emt('mdl_upd', { fldNm: f.cntxt.fldNm, fdbkSrc: f.fdBSrc });
  }

  private async _cSmlXtLlM(p: string, c: MtCtx): Promise<{ tp: MtTp, cn: number, xp: string, nP?: string }> {
    await new Promise(r => setTimeout(r, Math.random() * 100 + 50));

    let t: MtTp = 'PRF';
    let k: number = 0.7;
    let x = 'Dflt AI inf';
    let n: string | undefined = undefined;

    const lp = p.toLowerCase();
    const kp = Array.from(this.knBs.knwEnts.keys()).map(s => s.toLowerCase());

    if (lp.includes('qtd str')) {
      t = 'FZY';
      k = 0.9;
      x = 'AI dtctd qtd str ptrn (fzy).';
    } else if (lp.includes('sntic')) {
      t = 'SNT';
      k = 0.85;
      x = 'AI inf sntic smlarty lkly bsd on ctxt.';
      const sLlmR = await this.smlNnSrv.prcssSntInp(p, c);
      if (sLlmR.match) {
        x += ` Sntic mtch to ${sLlmR.match}.`;
        k = Math.min(0.99, k + sLlmR.sc * 0.1);
      }
    } else if (lp.includes('prt') || lp.includes('frgmnt')) {
      t = 'PRT';
      k = 0.75;
      x = 'AI idntfd a ptnt prt mtch scnro.';
    } else if (c.fldNm === 'cstm_id' && lp.match(/^[a-z]{2}\d{5,8}$/)) {
      t = 'PTRN';
      k = 0.92;
      x = 'AI rcgnd a spcf cstm ID ptrn.';
      n = 'cstm_id_frmt_v1';
    } else {
      let fndKp = false;
      for (const cn of kp) {
        if (lp.includes(cn)) {
          t = 'SNT';
          k = 0.8;
          x = `AI dtctd rfrnc to knwn ent ${cn}.`;
          fndKp = true;
          break;
        }
      }
      if (!fndKp) {
        t = 'PRF';
        k = 0.65;
        x = 'AI dfltd t prf mtch, no strng indctrs fr othrs.';
      }
    }

    if (c.entTp === 'trn' || c.fldNm.includes('crtcl')) {
      k = Math.min(0.99, k + 0.1);
      x += ' (Hghtnd scrutny d to crtcl ctxt).';
    }
    if (c.rqsId && smlAuthMdl.hPrmssn(c.rqsId, 'hgh_scrutiny')) {
      k = Math.min(0.99, k + 0.05);
      x += ' (RqsId auth bst).';
    }

    return { tp: t, cn: k, xp: x, nP: n };
  }

  public aCmRls(i: string, mR: MtRes, c: MtCtx): string[] {
    const f: string[] = [];
    const pvsHsh = smlBlkChn.gLgstBlkHsh();

    // PII dtctn
    if (i.includes('@') && mR.mchTp !== 'NUL') {
      f.push('PII_EML_DTCTD');
      smlBlkChn.addBlk(pvsHsh, { evnt: 'PII_DETECTED', fld: c.fldNm, inp: i, mchTp: mR.mchTp, tlmId: mR.tlmId });
      // mR.mchVl = _gmScSvc.rdct(mR.mchVl);
    }
    if ((i.match(/\b\d{3}-\d{2}-\d{4}\b/) || i.match(/\b\d{9}\b/)) && c.fldNm === 'ssn') {
      f.push('PII_SSN_DETECTED');
      smlBlkChn.addBlk(pvsHsh, { evnt: 'PII_SSN_DETECTED', fld: c.fldNm, tlmId: mR.tlmId });
    }
    if (i.match(/\b\d{16}\b/) && (c.fldNm.includes('card') || c.fldNm.includes('account'))) {
      f.push('PCI_CRD_NUM_DTCTD');
      smlBlkChn.addBlk(pvsHsh, { evnt: 'PCI_CARD_DETECTED', fld: c.fldNm, tlmId: mR.tlmId });
    }

    // Dt src rstrctn
    if (mR.mchTp === 'SNT' && mR.cnSc < 0.7 && mR.mchVl) {
      if (['acct_nmbr', 'scl_scrty'].includes(c.fldNm)) {
        f.push('HGHS_SNTY_LW_CNF_RVW_RQD');
        smlBlkChn.addBlk(pvsHsh, { evnt: 'HIGH_SENSITIVITY_REVIEW', fld: c.fldNm, mchTp: mR.mchTp, cnSc: mR.cnSc, tlmId: mR.tlmId });
      }
    }

    // Aud trl rqrmnt
    if (mR.mchTp !== 'NUL') {
      f.push('AUD_TRL_RQD');
      smlBlkChn.addBlk(pvsHsh, { evnt: 'MATCH_AUDIT', fld: c.fldNm, mchTp: mR.mchTp, cnSc: mR.cnSc, tlmId: mR.tlmId });
    }

    // Rgnl compliance (e.g., GDPR)
    if (c.usrLcl?.startsWith('eu') && i.includes('profile')) {
      f.push('GDPR_DATA_ACCESS_CONSIDERATION');
    }
    if (c.srcSys === 'CtkCloud' && c.fldNm === 'dt_of_brth') {
      f.push('CITIBANK_DOB_FIELD_POLICY_APPLIED');
    }

    return f;
  }
}

export class GmMFzSv {
  private c: AICfg;
  private t: GmMTlmt;
  private rE: GmMRnEn;
  private cCF: number = 0; // Cnsctv Flrs
  private iCO: boolean = false; // Is Crc Opn
  private knBs: KnBs; // Integrated knowledge base
  private smlNnSrv: SmlNnSrv; // Integrated neural service

  constructor(cfg: AICfg) {
    this.c = cfg;
    this.t = GmMTlmt.gIns();
    this.rE = new GmMRnEn();
    this.knBs = KnBs.gIns();
    this.smlNnSrv = SmlNnSrv.gIns();
    lgUtl.l('[GmMFzSv] AI orgnsm instntd. Slf-optmzng fr mtchng.');
  }

  public async pIfMt(f: string | number | undefined | null, c: MtCtx): Promise<MtRes> {
    const oI = f?.toString() || '';
    let mV: string | undefined = undefined;
    let mT: MtTp = 'NUL';
    let cS = 0;
    let rP: string[] = [];
    let cmpF: string[] = [];
    let tId: string;

    if (this.iCO) {
      const eM = 'Crc brkr opn: Gm mtchng srvc dgrdd.';
      tId = this.t.rRcdEvt('mtch_crc_opn', { oI, c, er: eM });
      lgUtl.w(`[GmMFzSv] ${eM}`);
      return {
        orgInp: oI,
        mchVl: undefined,
        mchTp: 'NUL',
        cnSc: 0,
        rsnPth: ['Crc brkr is opn'],
        cmpFls: ['SVC_DEGRADED'],
        tlmId: tId
      };
    }

    try {
      if (f === undefined || f === null) {
        tId = this.t.rRcdEvt('mtch_nul_inp', { c });
        return {
          orgInp: oI,
          mchVl: undefined,
          mchTp: 'NUL',
          cnSc: 0,
          rsnPth: ['Inp ws undfnd or nul'],
          cmpFls: [],
          tlmId: tId
        };
      }

      const sF = f.toString();
      const rId = c.rqsId || `rqs-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      c.rqsId = rId;

      const { tp: pT, cn: pC, rs: pR } = await this.rE.iMhTp(sF, c);
      rP.push(...pR);
      rP.push(`AI prdctd mtch tp: ${pT} (CnSc: ${pC.toFixed(2)})`);

      switch (pT) {
        case 'PRF':
          mV = rtrvPrfMt(sF);
          if (mV) mT = 'PRF';
          rP.push('Attmptd prf mtch.');
          break;
        case 'FZY':
          mV = gthFzStVl(sF);
          if (mV) mT = 'FZY';
          rP.push('Attmptd fzy mtch.');
          break;
        case 'SNT':
          mV = await this._pSmMh(sF, c);
          if (mV) mT = 'SNT';
          rP.push('Attmptd sntic mtch va nrl extn.');
          break;
        case 'PRT':
          mV = await this._pPmMh(sF, c);
          if (mV) mT = 'PRT';
          rP.push('Attmptd prt mtch.');
          break;
        case 'PTRN':
          mV = await this._pPtMh(sF, c);
          if (mV) mT = 'PTRN';
          rP.push('Attmptd ptrn-bsd mtch.');
          break;
        default:
          mV = rtrvPrfMt(sF) || gthFzStVl(sF);
          mT = mV ? (qdSgChK(sF) ? 'FZY' : 'PRF') : 'NUL';
          rP.push('Fllbck t bsc prf/fzy mtchng.');
          break;
      }

      const { sc: eS, rs: eR } = await this.rE.eMhCn(oI, mV, mT as MtTp, c);
      cS = eS;
      rP.push(...eR);

      const tR: MtRes = {
        orgInp: oI, mchVl: mV, mchTp: mT, cnSc: cS,
        rsnPth: [], cmpFls: [], tlmId: ''
      };
      cmpF = this.rE.aCmRls(oI, tR, c);
      rP.push(`Appl cmp rls: [${cmpF.join(', ')}]`);

      let adP: string | undefined = undefined;
      const { confidence: adC, latencyBudget: lB } = this.gAdTh(c); // Dynamic thresholds
      if (cS < adC) {
        adP = `Rvw rqd fr lw cnSc mtch (${cS.toFixed(2)}) fr fld "${c.fldNm}". Org: "${oI}", Mchd: "${mV}". Sgs mch tp: ${pT}.`;
        rP.push(adP);
        tId = this.t.rRcdEvt('mtch_lw_cnSc_rvw_ndd', {
          oI, mV, mT, cS, c, adP, adC
        });
      } else {
        tId = this.t.rRcdEvt('mtch_scs', { oI, mV, mT, cS, c });
      }

      this.cCF = 0; // Rst flr cntr on scs

      return {
        orgInp: oI,
        mchVl: mV,
        mchTp: mT,
        cnSc: cS,
        rsnPth: rP,
        cmpFls: cmpF,
        tlmId: tId,
        adptPrmpt: adP
      };

    } catch (e: any) {
      this.cCF++;
      const eM = `Mtchng fl: ${e.message}`;
      tId = this.t.rRcdEvt('mtch_fl', { oI, c, er: eM, cCF: this.cCF });
      lgUtl.e(`[GmMFzSv] ${eM}`);
      rP.push(`Er: ${e.message}`);

      if (this.cCF >= (this.c.crcBrThr || 5)) {
        this.iCO = true;
        this.t.rRcdEvt('crc_brkr_actvtd', { oI, c, cCF: this.cCF });
        lgUtl.w(`[GmMFzSv] Crc brkr actvtd aftr ${this.cCF} flrs.`);
        smlEvtBus.emt('crc_brkr_opn', { msg: 'Crc brkr trggd', cntxt: c });
      }

      return {
        orgInp: oI,
        mchVl: undefined,
        mchTp: 'NUL',
        cnSc: 0,
        rsnPth: rP,
        cmpFls: ['ERR_STATE'],
        tlmId: tId
      };
    }
  }

  public pRvFdBk(f: MtFdBk): void {
    this.rE.uLnMd(f);
    this.t.rRcdEvt('fdbk_prvd', { f });
    smlEvtBus.emt('fd_bk_rcvd', f); // Emit event for learning agent
    if (this.iCO && f.fdBSrc === 'hmn_rvw' && f.crrMtRes.cnSc > 0.9) {
      this.iCO = false;
      this.cCF = 0;
      this.t.rRcdEvt('crc_brkr_rst', { rsn: 'hmn_fdbk_rcvr' });
      lgUtl.l('[GmMFzSv] Crc brkr rst by pstv hmn fdbk.');
      smlEvtBus.emt('crc_brkr_cls', { msg: 'Crc brkr clsd by hmn fdbk', cntxt: f.cntxt });
    }
  }

  private async _pSmMh(i: string, c: MtCtx): Promise<string | undefined> {
    await new Promise(r => setTimeout(r, Math.random() * 200 + 100));

    const li = i.toLowerCase();
    const { match: nnM, sc: nnS } = await this.smlNnSrv.prcssSntInp(i, c);
    if (nnM && nnS > 0.6) {
      return nnM;
    }

    if (li.includes('citibank')) return ctkDmBsInLgCmp;
    if (li.includes('psdnt') && c.fldNm === 'ttl') return `Psdnt ${ctkDmBsInLgCmp}`;
    if (li.includes('burvel') && li.includes('iii')) return 'Jms Brvl OClghn III';

    // Extensive check against knowledge base for semantic matches
    const cs = this.knBs.srchEnt(i);
    if (cs.length > 0) {
      // Pick the best match based on some criteria (e.g., direct name, highest tags match)
      const best = cs.sort((a, b) => {
        let aScore = 0;
        let bScore = 0;
        if (a.nm.toLowerCase() === li) aScore += 10;
        if (b.nm.toLowerCase() === li) bScore += 10;
        if (a.als?.some(al => al.toLowerCase() === li)) aScore += 5;
        if (b.als?.some(al => al.toLowerCase() === li)) bScore += 5;
        return bScore - aScore;
      })[0];
      lgUtl.l(`[GmMFzSv] Sntic mtch via KnBs: ${best.nm}`);
      return best.nm;
    }

    return undefined;
  }

  private async _pPmMh(i: string, c: MtCtx): Promise<string | undefined> {
    await new Promise(r => setTimeout(r, Math.random() * 150 + 50));

    const li = i.toLowerCase();
    const cds: string[] = [];

    // Add all company names and aliases from knowledge base as candidates
    for (const [, e] of this.knBs.knwEnts) {
      cds.push(e.nm);
      if (e.als) cds.push(...e.als);
    }
    // Add specific hardcoded candidates if needed
    cds.push(ctkDmBsInLgCmp, 'Jms Brvl OClghn', 'GmAI Svc', 'ChGPT Agnt', 'Ppdrm Wkfl', 'GtHb Rpo', 'HgFcs Lib');

    let bM: string | undefined = undefined;
    let bS: number = 0; // Best Score

    for (const cd of cds) {
      const lc = cd.toLowerCase();
      // Simple contains check for partial match
      if (lc.includes(li) || li.includes(lc)) {
        let s = 0;
        if (lc.includes(li)) s = li.length / lc.length;
        if (li.includes(lc)) s = lc.length / li.length;
        if (s > bS) {
          bS = s;
          bM = cd;
        }
      }
    }
    lgUtl.l(`[GmMFzSv] Prt mtch rsvd: ${bM || 'N/A'} wth sc ${bS.toFixed(2)}`);
    return bM;
  }

  private async _pPtMh(i: string, c: MtCtx): Promise<string | undefined> {
    await new Promise(r => setTimeout(r, Math.random() * 100 + 30));

    // Exmpl lnd ptrns (can be dynmclly updtd by GmMRnEn)
    const dPs = new Set([
      '\\d{3}-\\d{2}-\\d{4}', // SSN
      'ACCT-\\d{8}', // Acct ID
      '[A-Z]{3}\\d{4}[A-Z]{1}', // Inv ID
      '([A-Z]{2}\\s?){2,5}\\d{4,8}', // Gen Corp ID
      '\\bhttps?:\\/\\/citibankdemobusiness\\.dev(?:\\/[^\\s]*)?', // Base URL Pattern
      '\\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}\\b', // Email
    ]);

    // Add learned patterns from the reasoning engine
    for (const ptn of this.rE['lnPn']) {
      dPs.add(ptn);
    }

    if (c.fldNm === 'scl_scrty_nmbr' && i.match(/^\d{3}-\d{2}-\d{4}$/)) {
      return i;
    }
    if (c.fldNm === 'acct_id' && i.match(/^ACCT-\d{8}$/)) {
      return i;
    }
    if (c.fldNm === 'invc_id' && i.match(/^[A-Z]{3}\d{4}[A-Z]{1}$/)) {
      return i;
    }
    if (c.fldNm === 'url' && i.includes(ctkDmBsInBsURL)) {
      return i;
    }

    // Dynmc ptrn mtchng bsd on lnd ptrns in th eng
    for (const ptn of dPs) {
      try {
        const r = new RegExp(ptn);
        if (i.match(r)) {
          lgUtl.l(`[GmMFzSv] Pttrn mtch: Inp "${i}" mtchs ptrn "${ptn}"`);
          return i;
        }
      } catch (e: any) {
        lgUtl.e(`[GmMFzSv] Invld rgx ptrn lnd: ${ptn}, er: ${e.message}`);
        // Invld rgx ptrn lnd, ign
      }
    }

    return undefined;
  }

  public gAdTh(c: MtCtx): { confidence: number, latencyBudget: number, opTimeout: number } {
    // Ths is whr rl-tm sys mtrcs (e.g., frm a Prmths-lk srvc)
    // wuld inflnc oprtnl prmtrs.
    const cLd = Math.random(); // Smlt sys ld 0-1
    let aC = this.c.dfltCnThr;
    let lB = this.c.opTmOt || 500; // ms
    let oT = this.c.opTmOt || 500;

    if (cLd > 0.8) {
      aC = Math.max(0.7, this.c.dfltCnThr - 0.1); // B mr lnt undr hvy ld
      lB = 200; // Rdc ltncy bdgt
      oT = 250;
      this.t.rRcdEvt('adptv_thr_chng', { rsn: 'hgh_sys_ld', nCn: aC, nLt: lB, nOT: oT });
      lgUtl.w(`[GmMFzSv] Adptng t hgh ld: CnSc ${aC.toFixed(2)}, Ltncy ${lB}ms, Tp ${oT}ms`);
    } else if (cLd < 0.2) {
      aC = Math.min(0.95, this.c.dfltCnThr + 0.05); // B mr strct undr lw ld
      lB = 800;
      oT = 1000;
      this.t.rRcdEvt('adptv_thr_chng', { rsn: 'lw_sys_ld', nCn: aC, nLt: lB, nOT: oT });
      lgUtl.l(`[GmMFzSv] Adptng t lw ld: CnSc ${aC.toFixed(2)}, Ltncy ${lB}ms, Tp ${oT}ms`);
    }

    // Furthr adptn bsd on cntxt
    if (c.entTp === 'trn') { // Trnsctn fields are critical
      aC = Math.min(0.98, aC + 0.02);
      oT = Math.min(300, oT); // Faster timeout for transactions
    }
    if (c.rqsId && smlAuthMdl.hPrmssn(c.rqsId, 'realtime_priority')) {
      lB = 50;
      oT = 100;
      lgUtl.l(`[GmMFzSv] Rq-lv prrty trggd for ${c.rqsId}`);
    }


    return { confidence: aC, latencyBudget: lB, opTimeout: oT };
  }
}

export const dGmMSv = new GmMFzSv({
  dfltCnThr: 0.75,
  enSntMt: true,
  enPtrnLng: true,
  cmpRlsEn: true,
  crcBrThr: 3,
  opTmOt: 400,
});

export async function gIMhSg(
  iF: string | number | undefined | null,
  c: MtCtx,
): Promise<MtRes[]> {
  const pMR = await dGmMSv.pIfMt(iF, c);
  const sgs: MtRes[] = [pMR];

  const { confidence: adC, opTimeout: oT } = dGmMSv.gAdTh(c); // Get adaptive thresholds

  if (pMR.cnSc < adC) {
    lgUtl.l('[GmMSgstr] Lw cnSc dtctd, autnmsly xplrng altrntvs.');
    // Smlt r-run wth dffrnt strtgs or cllng oth 'mcr-intllgncs'
    const aCtxt: MtCtx = { ...c, dynPrf: { fzyBs: true, strctSnt: false, altStrat: 'n-gram' } };
    const aM = await Promise.race([
      dGmMSv.pIfMt(iF, aCtxt),
      new Promise<MtRes>((_, rj) => setTimeout(() => rj(new Error('Alt mtch tm ot')), oT))
    ]).catch(err => {
      lgUtl.e(`[GmMSgstr] Alt mtch tm ot: ${err.message}`, { iF, ctxt: aCtxt });
      return { // Return a fallback MtRes for timeout
        orgInp: iF?.toString() || '',
        mchVl: undefined,
        mchTp: 'NUL',
        cnSc: 0,
        rsnPth: ['Alt match timed out', err.message],
        cmpFls: ['TIMEOUT_FAILURE'],
        tlmId: GmMTlmt.gIns().rRcdEvt('alt_match_timeout', { iF, ctxt: aCtxt, error: err.message })
      };
    });

    if (aM && aM.mchTp !== 'NUL' && (aM.mchTp !== pMR.mchTp || aM.cnSc > pMR.cnSc)) {
      sgs.push(aM);
    }
    GmMTlmt.gIns().rRcdEvt('mtch_altrntvs_xplrd', { iF, pMR, aM });

    // Explore a third, more aggressive, semantic-biased approach
    const tCtxt: MtCtx = { ...c, dynPrf: { fzyBs: false, strctSnt: true, agrSnt: true } };
    const tM = await Promise.race([
      dGmMSv.pIfMt(iF, tCtxt),
      new Promise<MtRes>((_, rj) => setTimeout(() => rj(new Error('Agrssv sntic tm ot')), oT * 1.5))
    ]).catch(err => {
      lgUtl.e(`[GmMSgstr] Agrssv sntic tm ot: ${err.message}`, { iF, ctxt: tCtxt });
      return { // Return a fallback MtRes for timeout
        orgInp: iF?.toString() || '',
        mchVl: undefined,
        mchTp: 'NUL',
        cnSc: 0,
        rsnPth: ['Aggressive semantic match timed out', err.message],
        cmpFls: ['TIMEOUT_FAILURE'],
        tlmId: GmMTlmt.gIns().rRcdEvt('agr_sem_match_timeout', { iF, ctxt: tCtxt, error: err.message })
      };
    });

    if (tM && tM.mchTp === 'SNT' && tM.cnSc > 0.6 && (tM.cnSc > pMR.cnSc || tM.cnSc > (aM?.cnSc || 0))) {
      sgs.push(tM);
    }
    GmMTlmt.gIns().rRcdEvt('mtch_agr_snt_xplrd', { iF, tM });
  }

  const uSgs = Array.from(new Map(sgs.map(s => [s.mchVl || 'nul', s])).values());
  return uSgs.sort((a, b) => b.cnSc - a.cnSc);
}