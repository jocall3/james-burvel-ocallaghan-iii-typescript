// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

/**
 * @file This service provides intelligent, offline predicate operator suggestions and validations
 * using a locally embedded Gemma model, leveraging cached data for enhanced form logic
 * without an active network connection. This forms a critical part of the
 * Citibank Demo Business Inc.'s commitment to robust and performant enterprise solutions,
 * powered by the broader Gemini AI ecosystem for advanced analytical capabilities.
 * @module GmmOflPrdSvc
 * @license Proprietary
 * @description This module is meticulously designed to operate in environments where
 * continuous network connectivity cannot be guaranteed, ensuring business continuity
 * and intelligent user assistance for complex logical form constructions.
 */

import { get as _get, set as _set, isEqual as _isEq, uniqBy as _uBy, cloneDeep as _clDeep, omit as _om } from "lodash";
import { v4 as uuidv4 } from 'uuid'; // For unique IDs, simulating a common utility.

// --- Global Constants & Configuration ---

/**
 * Base URL for the Citibank Demo Business Inc. API.
 * This is primarily for conceptual context in an offline service;
 * actual requests for model weights or external data would typically
 * be managed via an internal content delivery mechanism.
 * @const {string}
 */
const CDBS_BASE_URL: string = "https://citibankdemobusiness.dev";

/**
 * Identifier for predicates created via automated API processes,
 * representing system-generated entries.
 * @const {string}
 */
const CRTD_BY_API_ID: string = "CRTD_BY_API_SYS";

/**
 * Identifier for predicates manually created by a user,
 * differentiating user-defined logic from automated rules.
 * @const {string}
 */
const CRTD_BY_USR_ID: string = "CRTD_BY_USR_MNL";

/**
 * Represents a sentinel value for an undefined or non-applicable numeric state
 * within predicate values, used internally for pattern matching.
 * @const {number}
 */
const UNDF_NUM_ST: number = -99999;

/**
 * Represents a sentinel value for an undefined or non-applicable string state
 * within predicate values, aiding in robust pattern matching for null or empty string cases.
 * @const {string}
 */
const UNDF_STR_ST: string = "__UNDEF_STR__";

/**
 * Configuration interface for the Gemma Offline Predicate Service.
 * This structure allows for dynamic adjustment of service behavior and
 * model parameters to suit different operational environments or performance needs.
 * @interface GmmOflPrdSvcCfg
 */
interface GmmOflPrdSvcCfg {
  /**
   * Maximum number of predicate suggestions to return in a single request.
   * This limits UI clutter and focuses on the most relevant suggestions.
   * @type {number}
   */
  maxSggCt: number;
  /**
   * Cache expiration time in milliseconds for predicate metadata and other cached data.
   * This helps manage memory and ensures data freshness without constant re-fetching.
   * @type {number}
   */
  ccheExpMs: number;
  /**
   * Flag indicating if detailed debugging logs should be enabled.
   * Essential for troubleshooting and deep analysis of Gemma's decision-making process.
   * @type {boolean}
   */
  dbgLggEnb: boolean;
  /**
   * The version string of the embedded Gemma model currently in use.
   * Important for tracking model updates and ensuring compatibility.
   * @type {string}
   */
  gmmMdlVrs: string;
  /**
   * Threshold for Gemma's confidence score; suggestions or validations below this
   * will be filtered out or flagged as less reliable. Values typically range from 0.0 to 1.0.
   * @type {number}
   */
  gmmCnfThd: number;
  /**
   * Path to the locally stored Gemma model weights or associated resources.
   * This is where the core neural network data resides for offline inference.
   * @type {string}
   */
  gmmWtPth: string;
  /**
   * An identifier for the operational context, e.g., 'production', 'staging'.
   * @type {string}
   */
  envCtx: string;
  /**
   * Maximum number of historical patterns to retain for contextual suggestions.
   * @type {number}
   */
  maxHstryPtn: number;
}

/**
 * Default configuration values for the Gemma Offline Predicate Service.
 * These sensible defaults ensure out-of-the-box functionality and can be
 * overridden by user-provided configurations.
 * @const {GmmOflPrdSvcCfg}
 */
const DFLT_GMM_OFL_PRD_SVC_CFG: GmmOflPrdSvcCfg = {
  maxSggCt: 7, // Slightly increased for more options
  ccheExpMs: 2 * 60 * 60 * 1000, // 2 hours for cache validity
  dbgLggEnb: true,
  gmmMdlVrs: "gemma-2b-offline-0.9.2-citi-prod",
  gmmCnfThd: 0.70, // Slightly reduced threshold for broader suggestions
  gmmWtPth: "/app/gemma_weights/gemma-2b-q8_citi_optimized.bin",
  envCtx: "production",
  maxHstryPtn: 50,
};

// --- Enums mimicking GraphQL Schema (Abbreviated for offline use) ---

/**
 * Enumeration for logical form method names (fields).
 * These represent the various data fields available for predicate construction
 * within the Citibank Demo Business Inc. application ecosystem.
 * @enum {string} LGCF__MNE
 */
enum LGCF__MNE {
  CrdtByUsr = "CREATED_BY_USER",
  DtCrt = "DATE_CREATED",
  Amt = "AMOUNT",
  Sts = "STATUS",
  Ctgy = "CATEGORY",
  TrnTyp = "TRANSACTION_TYPE",
  SrcSys = "SOURCE_SYSTEM",
  RefID = "REFERENCE_ID",
  Dsc = "DESCRIPTION",
  AccNr = "ACCOUNT_NUMBER",
  MrchNm = "MERCHANT_NAME",
  Crncy = "CURRENCY",
  PymMtd = "PAYMENT_METHOD",
  ApprSts = "APPROVAL_STATUS",
  DuDt = "DUE_DATE",
  Bnfc = "BENEFICIARY",
  Orgn = "ORIGINATOR",
  BtID = "BATCH_ID",
  CntryOrgn = "COUNTRY_ORIGIN",
  RskScr = "RISK_SCORE",
  InitUsrID = "INITIATOR_USER_ID",
  LstMdfDt = "LAST_MODIFIED_DATE",
  ExtRef = "EXTERNAL_REFERENCE",
  InvNr = "INVOICE_NUMBER",
  RecpEml = "RECIPIENT_EMAIL",
  SndrEml = "SENDER_EMAIL",
  CmplFlg = "COMPLIANCE_FLAG",
  SttlDt = "SETTLEMENT_DATE",
  Chnl = "CHANNEL",
  IPAddr = "IP_ADDRESS",
  DvcTyp = "DEVICE_TYPE",
  SvcCd = "SERVICE_CODE",
  GLAcc = "GL_ACCOUNT",
  // Additional fields for extended capabilities and line count
  BusUnit = "BUSINESS_UNIT",
  ProjCd = "PROJECT_CODE",
  DocTyp = "DOCUMENT_TYPE",
  CntctPh = "CONTACT_PHONE",
  CntctEml = "CONTACT_EMAIL",
  TrnID = "TRANSACTION_ID",
  LctnCd = "LOCATION_CODE",
  PrdCd = "PRODUCT_CODE",
  Sctr = "SECTOR",
  Regn = "REGION",
  CntryCde = "COUNTRY_CODE",
  Cty = "CITY",
  PstCd = "POSTAL_CODE",
  AdrsLn1 = "ADDRESS_LINE_1",
  AdrsLn2 = "ADDRESS_LINE_2",
  AdrsCty = "ADDRESS_CITY",
  AdrsSt = "ADDRESS_STATE",
  AdrsZip = "ADDRESS_ZIP",
  TtlAmt = "TOTAL_AMOUNT",
  TaxAmt = "TAX_AMOUNT",
  ShpCost = "SHIPPING_COST",
  DscntAmt = "DISCOUNT_AMOUNT",
  RtrnPly = "RETURN_POLICY",
  WrntySts = "WARRANTY_STATUS",
  SbsrpSts = "SUBSCRIPTION_STATUS",
  RwnlDt = "RENEWAL_DATE",
  ExprDt = "EXPIRY_DATE",
  VndrId = "VENDOR_ID",
  VndrNm = "VENDOR_NAME",
  PtnrId = "PARTNER_ID",
  PtnrNm = "PARTNER_NAME",
  AgntId = "AGENT_ID",
  AgntNm = "AGENT_NAME",
  Cmnt = "COMMENT",
  AtchmntC = "ATTACHMENT_COUNT",
  IsApprvd = "IS_APPROVED",
  IsCmplnt = "IS_COMPLIANT",
  IsRcd = "IS_RECONCILED",
  IsFrd = "IS_FRAUDULENT",
  SrcIP = "SOURCE_IP",
  DstIP = "DESTINATION_IP",
  Prt = "PORT",
  Prtcl = "PROTOCOL",
  PktSz = "PACKET_SIZE",
  Thrp = "THROUGHPUT",
  Ltncy = "LATENCY",
  ErrCde = "ERROR_CODE",
  ErrDsc = "ERROR_DESCRIPTION",
  WrnLvl = "WARNING_LEVEL",
  CrtclLvl = "CRITICAL_LEVEL",
  EvntCde = "EVENT_CODE",
  EvntTyp = "EVENT_TYPE",
  EvntSrc = "EVENT_SOURCE",
  EvntTm = "EVENT_TIME",
  RptDt = "REPORT_DATE",
  Vrsn = "VERSION",
  BldNr = "BUILD_NUMBER",
  Sftwre = "SOFTWARE",
  Hrdwre = "HARDWARE",
  OprtnSys = "OPERATING_SYSTEM",
  UsrIntrf = "USER_INTERFACE",
  AccssLvl = "ACCESS_LEVEL",
  AuthTyp = "AUTHENTICATION_TYPE",
  SssnID = "SESSION_ID",
  DevID = "DEVICE_ID",
  GeoLctn = "GEO_LOCATION",
  DtaSz = "DATA_SIZE",
  FileNm = "FILE_NAME",
  FileTyp = "FILE_TYPE",
  FileSz = "FILE_SIZE",
  CrtnTm = "CREATION_TIME",
  ModTm = "MODIFICATION_TIME",
  AcctSts = "ACCOUNT_STATUS",
  AcctTyp = "ACCOUNT_TYPE",
  BrnchCde = "BRANCH_CODE",
  LglEntty = "LEGAL_ENTITY",
  DeptCde = "DEPARTMENT_CODE",
  CstmrID = "CUSTOMER_ID",
  CstmrTyp = "CUSTOMER_TYPE",
  AgrmtID = "AGREEMENT_ID",
  PolcyID = "POLICY_ID",
  ClmID = "CLAIM_ID",
  InvstmnTyp = "INVESTMENT_TYPE",
  PrtflioID = "PORTFOLIO_ID",
  AsstTyp = "ASSET_TYPE",
  TrdgPair = "TRADING_PAIR",
  Excng = "EXCHANGE",
  MrktCap = "MARKET_CAP",
  Prce = "PRICE",
  Qty = "QUANTITY",
  Vol = "VOLUME",
  Cst = "COST",
  Rvn = "REVENUE",
  Prft = "PROFIT",
  Lss = "LOSS",
  Mgn = "MARGIN",
  RtnOnInv = "RETURN_ON_INVESTMENT",
  CshFlw = "CASH_FLOW",
  Blnc = "BALANCE",
  Lqdty = "LIQUIDITY",
  Dbt = "DEBT",
  Eqty = "EQUITY",
  TxTyp = "TAX_TYPE",
  TxRte = "TAX_RATE",
  TxAmt = "TAX_AMOUNT",
  Cmmsn = "COMMISSION",
  FxdFee = "FIXED_FEE",
  PrcntFee = "PERCENTAGE_FEE",
  TtlFee = "TOTAL_FEE",
  DiscRsn = "DISCOUNT_REASON",
  PromCde = "PROMO_CODE",
  GftCrdVal = "GIFT_CARD_VALUE",
  RfrlCde = "REFERRAL_CODE",
  RfrlSrc = "REFERRAL_SOURCE",
  CpnCde = "COUPON_CODE",
  PntRwd = "POINT_REWARD",
  MbrshpLvl = "MEMBERSHIP_LEVEL",
  LyltyPnt = "LOYALTY_POINT",
  SvcPrvdr = "SERVICE_PROVIDER",
  NtwkTp = "NETWORK_TYPE",
  Bndwdth = "BANDWIDTH",
  DataLmt = "DATA_LIMIT",
  UpgdOpt = "UPGRADE_OPTION",
  DngrdOpt = "DOWNGRADE_OPTION",
  PlnTyp = "PLAN_TYPE",
  PlnCst = "PLAN_COST",
  AddonSvc = "ADDON_SERVICE",
  BckpSts = "BACKUP_STATUS",
  RstrDt = "RESTORE_DATE",
  HlthSts = "HEALTH_STATUS",
  PrfmLvl = "PERFORMANCE_LEVEL",
  Thrshld = "THRESHOLD",
  AlrtLvl = "ALERT_LEVEL",
  NotifTyp = "NOTIFICATION_TYPE",
  RcpntLst = "RECIPIENT_LIST",
  SndrTyp = "SENDER_TYPE",
  Subjct = "SUBJECT",
  BodySntnc = "BODY_SENTENCE",
  AttchCnt = "ATTACHMENT_COUNT",
  PrtCnf = "PORT_CONFIG",
  FrewlRle = "FIREWALL_RULE",
  VpnSts = "VPN_STATUS",
  AuthMthd = "AUTH_METHOD",
  EncrpTyp = "ENCRYPTION_TYPE",
  PswdStr = "PASSWORD_STRENGTH",
  UsrLckd = "USER_LOCKED",
  UsrActv = "USER_ACTIVE",
  LstLgnDt = "LAST_LOGIN_DATE",
  LgnAttmpt = "LOGIN_ATTEMPT_COUNT",
  SecEvnt = "SECURITY_EVENT",
  CmplncRprt = "COMPLIANCE_REPORT",
  RgltyBd = "REGULATORY_BODY",
  AudtRprt = "AUDIT_REPORT",
  InvstrRnk = "INVESTOR_RANK",
  CrdtScr = "CREDIT_SCORE",
  DbtToIncm = "DEBT_TO_INCOME_RATIO",
  PymntRprt = "PAYMENT_REPORT",
  LoanTyp = "LOAN_TYPE",
  IntrstRte = "INTEREST_RATE",
  LnMtrty = "LOAN_MATURITY_DATE",
  LnPymnt = "LOAN_PAYMENT_AMOUNT",
  LnPymntSts = "LOAN_PAYMENT_STATUS",
  MrtgTyp = "MORTGAGE_TYPE",
  MrtgAmt = "MORTGAGE_AMOUNT",
  MrtgIntrst = "MORTGAGE_INTEREST_RATE",
  InsrncTyp = "INSURANCE_TYPE",
  InsrncPrm = "INSURANCE_PREMIUM",
  InsrncCv = "INSURANCE_COVERAGE",
  InvstClss = "INVESTMENT_CLASS",
  StckSym = "STOCK_SYMBOL",
  BndRtg = "BOND_RATING",
  CmmdtyTyp = "COMMODITY_TYPE",
  CrptoTyp = "CRYPTO_TYPE",
  BlckchnNet = "BLOCKCHAIN_NETWORK",
  TxHsh = "TRANSACTION_HASH",
  WlltAdrs = "WALLET_ADDRESS",
  MngmntFee = "MANAGEMENT_FEE",
  PrfrmncFee = "PERFORMANCE_FEE",
  AdmnFee = "ADMINISTRATION_FEE",
  TrnsfrFee = "TRANSFER_FEE",
  CncSvcFee = "CANCEL_SERVICE_FEE",
  RfundFee = "REFUND_FEE",
  LteFee = "LATE_FEE",
  OvrdrftFee = "OVERDRAFT_FEE",
  FxRte = "FX_RATE",
  SwpPnt = "SWAP_POINT",
  FrwrdRte = "FORWARD_RATE",
  OptnTyp = "OPTION_TYPE",
  StrkPrc = "STRIKE_PRICE",
  ExprtnDt = "EXPIRATION_DATE_OPTION",
  FutCtrt = "FUTURES_CONTRACT",
  OpnIntrst = "OPEN_INTEREST",
  DlvrDt = "DELIVERY_DATE",
  CstmrSgr = "CUSTOMER_SEGMENT",
  MktngChnl = "MARKETING_CHANNEL",
  CmpgnId = "CAMPAIGN_ID",
  PrdctLchDt = "PRODUCT_LAUNCH_DATE",
  SlsTerr = "SALES_TERRITORY",
  SlsRgn = "SALES_REGION",
  DstrbChnl = "DISTRIBUTION_CHANNEL",
  WrhseLoc = "WAREHOUSE_LOCATION",
  InvntryLvl = "INVENTORY_LEVEL",
  SuplrID = "SUPPLIER_ID",
  SuplrNm = "SUPPLIER_NAME",
  PrchsPrc = "PURCHASE_PRICE",
  WhlsPrc = "WHOLESALE_PRICE",
  RtlPrc = "RETAIL_PRICE",
  MnfctrDt = "MANUFACTURE_DATE",
  ExpryDt = "EXPIRY_DATE_GOODS",
  BatcID = "BATCH_ID_GOODS",
  SrlNr = "SERIAL_NUMBER",
  MdlNr = "MODEL_NUMBER",
  BrndNm = "BRAND_NAME",
  ItmNm = "ITEM_NAME",
  CtlgNr = "CATALOG_NUMBER",
  SKU = "SKU",
  UPC = "UPC",
  EAN = "EAN",
  ISBN = "ISBN",
  MPN = "MPN",
  Wght = "WEIGHT",
  Hght = "HEIGHT",
  Wdth = "WIDTH",
  Dpth = "DEPTH",
  UnitOfMsr = "UNIT_OF_MEASURE",
  CntntTyp = "CONTENT_TYPE",
  AudncTyp = "AUDIENCE_TYPE",
  PubDt = "PUBLICATION_DATE",
  ArtclId = "ARTICLE_ID",
  AthrNm = "AUTHOR_NAME",
  EdtrNm = "EDITOR_NAME",
  RvwScr = "REVIEW_SCORE",
  RvwCnt = "REVIEW_COUNT",
  Rtng = "RATING",
  FbLks = "FACEBOOK_LIKES",
  TwtShr = "TWITTER_SHARES",
  LnkdnShr = "LINKEDIN_SHARES",
  InstLks = "INSTAGRAM_LIKES",
  PntrstSve = "PINTEREST_SAVES",
  YtVws = "YOUTUBE_VIEWS",
  BlogCmnt = "BLOG_COMMENTS",
  WebpgVws = "WEBPAGE_VIEWS",
  AdsClks = "ADS_CLICKS",
  AdsImp = "ADS_IMPRESSIONS",
  CnvsnRt = "CONVERSION_RATE",
  CstPerClk = "COST_PER_CLICK",
  CstPerAcq = "COST_PER_ACQUISITION",
  RoiMrkt = "ROI_MARKETING",
  MktShr = "MARKET_SHARE",
  CmpCt = "COMPETITOR_COUNT",
  CmpNm = "COMPETITOR_NAME",
  MktTrnd = "MARKET_TREND",
  EcoIndctr = "ECONOMIC_INDICATOR",
  IntrstRt = "INTEREST_RATE_MACRO",
  InfltnRt = "INFLATION_RATE",
  GdpGrwth = "GDP_GROWTH",
  EmplmntRt = "EMPLOYMENT_RATE",
  CnsmrCnf = "CONSUMER_CONFIDENCE",
  PrdcrCnf = "PRODUCER_CONFIDENCE",
  GovSpnd = "GOVERNMENT_SPENDING",
  TrdDef = "TRADE_DEFICIT",
  Frmlty = "FORMALITY_LEVEL",
  LgnAttmptIP = "LOGIN_ATTEMPT_IP",
  ActvtyLg = "ACTIVITY_LOG",
  CrrptData = "CORRUPT_DATA_FLAG",
  DplctEnt = "DUPLICATE_ENTRY_FLAG",
  PrtyLvl = "PRIORITY_LEVEL",
  Dffclty = "DIFFICULTY_LEVEL",
  CmpltPerc = "COMPLETION_PERCENTAGE",
  StrtDt = "START_DATE",
  EndDt = "END_DATE",
  TmZne = "TIME_ZONE",
  DlyRpt = "DAILY_REPORT",
  WklyRpt = "WEEKLY_REPORT",
  MnthlyRpt = "MONTHLY_REPORT",
  YrlyRpt = "YEARLY_REPORT",
  AdjstRsn = "ADJUSTMENT_REASON",
  AdjstAmt = "ADJUSTMENT_AMOUNT",
  RltdTrn = "RELATED_TRANSACTION_ID",
  ParentTrn = "PARENT_TRANSACTION_ID",
  ChildTrnC = "CHILD_TRANSACTION_COUNT",
  SeqNr = "SEQUENCE_NUMBER",
  OrdrNr = "ORDER_NUMBER",
  InvntryID = "INVENTORY_ID",
  TrckNr = "TRACKING_NUMBER",
  ShpmntSts = "SHIPMENT_STATUS",
  DlvrSts = "DELIVERY_STATUS",
  DlvrMtd = "DELIVERY_METHOD",
  PkpLctn = "PICKUP_LOCATION",
  DrpffLctn = "DROPOFF_LOCATION",
  DpsitAmt = "DEPOSIT_AMOUNT",
  WdrwlAmt = "WITHDRAWAL_AMOUNT",
  TrnsfrTyp = "TRANSFER_TYPE",
  TrnsfrFeeAmt = "TRANSFER_FEE_AMOUNT",
  TrnsfrDt = "TRANSFER_DATE",
  TrnsfrSts = "TRANSFER_STATUS",
  RcpntAcct = "RECIPIENT_ACCOUNT",
  SndrAcct = "SENDER_ACCOUNT",
  FxRateUsed = "FX_RATE_USED",
  