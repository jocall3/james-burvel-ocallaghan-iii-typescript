import React from "react";
import ReactTooltip from "react-tooltip";
import {
  getIn,
  Field,
  Form,
  Formik,
  FormikErrors,
  FormikTouched,
} from "formik";
import * as Yup from "yup";
import useLedgersProductActive from "~/common/utilities/useLedgersProductActive";
import { VIRTUAL_ACCOUNT_EVENTS } from "../../../common/constants/analytics";
import { Label, ConfirmModal, Tooltip } from "../../../common/ui-components";
import trackEvent from "../../../common/utilities/trackEvent";
import {
  FormikErrorMessage,
  FormikSelectField,
  FormikInputField,
  FormikLedgerAsyncSelect,
  FormikLedgerAccountAsyncSelect,
} from "../../../common/formik";
import {
  useVirtualAccountFormQuery,
  useCreateVirtualAccountMutation,
} from "../../../generated/dashboard/graphqlSchema";
import FormikKeyValueInput, {
  FieldTypeEnum,
} from "../../../common/formik/FormikKeyValueInput";
import { FormValues } from "../../constants/virtual_account_form";
import { VIRTUAL_ACCOUNT } from "../../../generated/dashboard/types/resources";
import { formatMetadata } from "./virtualAccountUtils";
import { useDispatchContext } from "../../MessageProvider";

export const CBBPS = {
  gmni: { id: 'gmni', nm: 'Google Gemini AI', st: 'ACT', url: 'https://citibankdemobusiness.dev/s/gmni/ai', apiKey: 'gmni_prm_49382', dsc: 'AI-powered insights for enhanced virtual account management. Automates pattern recognition and anomaly detection, offering predictive analytics for fraud prevention and financial forecasting. Integrates deeply with transaction streams for real-time risk assessment and intelligent alert generation.', ftr: ['txm', 'ant', 'prd'], clr: 'gr', cap: { maxVol_USD: 100000000, dailyTxn_Count: 500000, latency_Ms: 150, dataRet_Days: 365, modelUpd_Freq: 'weekly', apiReq_Limit: 10000 }, dact: false },
  ctgt: { id: 'ctgt', nm: 'OpenAI ChatGPT Integration', st: 'PND', url: 'https://citibankdemobusiness.dev/s/ctgt/api', apiKey: 'ctgt_api_93746', dsc: 'Natural language processing for customer support automation and intelligent transaction descriptions. Enables conversational AI interfaces for virtual account inquiries and simplifies data entry through semantic understanding. Supports multi-lingual operations and personalized user interactions.', ftr: ['nlp', 'cst', 'auto'], clr: 'bl', cap: { maxQueries_PerMin: 5000000, responseTime_Ms: 250, contextMem_KB: 1024, tokenLim_PerReq: 4096, langSupp_Count: 50, rateLim_RPS: 10000 }, dact: true },
  ppdm: { id: 'ppdm', nm: 'Pipedream Automation Flows', st: 'ACT', url: 'https://citibankdemobusiness.dev/s/ppdm/wbh', apiKey: 'ppdm_wbh_10293', dsc: 'Event-driven workflows for automated virtual account lifecycle events and notifications. Connects various services through serverless code and pre-built integrations, facilitating real-time data orchestration and complex business process automation. Critical for operational efficiency and compliance enforcement.', ftr: ['wfm', 'ntf', 'data'], clr: 'gd', cap: { maxWorkflows_Total: 100000, executions_PerMin: 1000000, dataVol_GB_PerDay: 500, conn_Max: 2000, trigger_Types: 50, cost_PerExec: 0.0001 }, dact: false },
  gthb: { id: 'gthb', nm: 'GitHub Version Control', st: 'INA', url: 'https://citibankdemobusiness.dev/s/gthb/vcs', apiKey: 'gthb_api_87654', dsc: 'Version control for virtual account configuration templates and audit trails. Provides a secure repository for infrastructure-as-code deployments related to virtual account provisioning and policy management. Enables collaborative development and robust change tracking.', ftr: ['vcs', 'aud', 'dev'], clr: 'sl', cap: { repo_Max: 5000, storage_GB: 1000, commits_PerMin: 500, webhooks_Max: 200, users_PerRepo: 100, branchProt_Features: 5 }, dact: true },
  hgfz: { id: 'hgfz', nm: 'Hugging Face ML Models', st: 'PND', url: 'https://citibankdemobusiness.dev/s/hgfz/ml', apiKey: 'hgfz_api_23456', dsc: 'Machine learning for fraud detection, credit scoring, and predictive analytics on virtual account activity. Access to a vast ecosystem of pre-trained models for various financial tasks, accelerating the deployment of intelligent features and enhancing decision-making processes. Supports transfer learning and fine-tuning.', ftr: ['frd', 'prc', 'ml'], clr: 'bl', cap: { models_MaxDeployed: 100, inference_TPS: 1000, trainingHrs_PerMonth: 500, modelSize_GB: 20, datasetSize_TB: 10, frameworks_Supported: 10 }, dact: false },
  plad: { id: 'plad', nm: 'Plaid Financial Data Sync', st: 'ACT', url: 'https://citibankdemobusiness.dev/s/plad/txn', apiKey: 'plad_api_78901', dsc: 'Secure linking to external bank accounts for real-time transaction synchronization and reconciliation. Facilitates direct connections to financial institutions, allowing for accurate cash flow analysis, expense categorization, and seamless account funding. Complies with industry-leading security standards.', ftr: ['dat', 'rec', 'con'], clr: 'gr', cap: { links_Max: 5000000, requests_PerSecond: 10000, dataElements_Supported: 100, institution_Coverage: 15000, refreshRate_Min: 5, fraudDet_Accuracy: 0.99 }, dact: false },
  mdty: { id: 'mdty', nm: 'Modern Treasury Platform', st: 'ACT', url: 'https://citibankdemobusiness.dev/s/mdty/pym', apiKey: 'mdty_api_34567', dsc: 'Advanced payment operations, reconciliation, and ledger management for virtual accounts. Provides a unified API for managing global payments, automating cash positioning, and ensuring real-time visibility into financial movements. Essential for modern treasury functions and financial control.', ftr: ['pay', 'ldg', 'cash'], clr: 'gr', cap: { maxTxn_Volume: 100000000, webhooks_PerSecond: 100000, bankAcc_Supported: 500, currency_Supported: 150, reconRate_Percent: 0.999, auditLog_Retention: '7years' }, dact: false },
  ggdr: { id: 'ggdr', nm: 'Google Drive Document Mgmt', st: 'PND', url: 'https://citibankdemobusiness.dev/s/ggdr/doc', apiKey: 'ggdr_key_45678', dsc: 'Storage for virtual account-related documents, agreements, and compliance records. Enables secure, cloud-based document sharing and collaboration, streamlining audit processes and ensuring easy access to critical financial records. Offers versioning and access control for enhanced security.', ftr: ['sto', 'shr', 'col'], clr: 'bl', cap: { storage_GB_Max: 1000000, upload_Rate_MBPS: 10000, concurrentUsers_Max: 100000, fileVer_Retention: 100, sharing_Options: 5, security_Scans: true }, dact: true },
  ondr: { id: 'ondr', nm: 'Microsoft OneDrive Storage', st: 'INA', url: 'https://citibankdemobusiness.dev/s/ondr/fil', apiKey: 'ondr_tkn_56789', dsc: 'Cloud storage for archival of virtual account statements and reports. Provides a reliable and scalable solution for long-term data retention, supporting regulatory compliance and historical data analysis. Integrates with Microsoft 365 ecosystem for enhanced productivity.', ftr: ['arc', 'rpt', 'clb'], clr: 'sl', cap: { maxStorage_TB: 5000, fileMaxSize_GB: 10000, sync_Rate_MBPS: 500, userAcc_Max: 5000000, sharing_Policies: 10, version_Control: true }, dact: true },
  azrc: { id: 'azrc', nm: 'Azure Cloud Infrastructure', st: 'ACT', url: 'https://citibankdemobusiness.dev/s/azrc/inf', apiKey: 'azrc_sub_67890', dsc: 'Scalable cloud resources for hosting virtual account microservices and data processing. Offers a comprehensive suite of cloud services including compute, storage, networking, and analytics, providing a robust and flexible foundation for modern financial applications. Supports hybrid cloud deployments.', ftr: ['cmp', 'str', 'net'], clr: 'gr', cap: { vmCores_Max: 100000, dbThroughput_IOPS: 1000000, bandwidth_GBPS: 500, dataCtr_Regions: 60, service_SLA: 0.9999, security_Score: 950 }, dact: false },
  ggcl: { id: 'ggcl', nm: 'Google Cloud Services', st: 'ACT', url: 'https://citibankdemobusiness.dev/s/ggcl/svc', apiKey: 'ggcl_prj_78901', dsc: 'Managed services for analytics, data warehousing, and machine learning supporting virtual accounts. Provides powerful tools like BigQuery for data analysis, AI Platform for model deployment, and Pub/Sub for real-time messaging, enabling data-driven decision-making and innovation. Focuses on open-source and serverless.', ftr: ['big', 'ml', 'fnct'], clr: 'gr', cap: { biqQueries_PerSec: 1000000, fncExec_PerMin: 100000, dataProc_TB_PerDay: 5000, storage_Cost_GB: 0.02, network_Latency_Ms: 10, security_Cert: 'ISO27001' }, dact: false },
  spbs: { id: 'spbs', nm: 'Supabase BaaS', st: 'PND', url: 'https://citibankdemobusiness.dev/s/spbs/db', apiKey: 'spbs_key_89012', dsc: 'Backend-as-a-Service for rapid development of virtual account dashboards and extensions. Offers a PostgreSQL database, authentication, instant APIs, and real-time subscriptions, accelerating the creation of interactive and data-rich user interfaces. Ideal for agile development and prototyping.', ftr: ['db', 'ath', 'api'], clr: 'bl', cap: { rowLimit_PerTable: 10000000, requests_PerSec: 100000000, storage_GB_Free: 10, maxProjects_Free: 5, realTime_Channels: 100, functions_Max: 500 }, dact: false },
  vrcl: { id: 'vrcl', nm: 'Vercel Frontend Deployment', st: 'ACT', url: 'https://citibankdemobusiness.dev/s/vrcl/dep', apiKey: 'vrcl_tkn_90123', dsc: 'Continuous deployment for virtual account user interfaces and API endpoints. Simplifies frontend and serverless function deployments with automatic scaling, global CDN, and instant rollbacks, ensuring high availability and performance for user-facing applications. Integrates with Git repositories.', ftr: ['dep', 'cdn', 'perf'], clr: 'gr', cap: { builds_PerMonth: 100000, bandwidth_TB_PerMonth: 1000, edgeFn_Invoc_PerSec: 50000, project_Limit: 5000, deploy_Time_Sec: 30, uptime_SLA: 0.9999 }, dact: false },
  sfrc: { id: 'sfrc', nm: 'Salesforce CRM Integration', st: 'ACT', url: 'https://citibankdemobusiness.dev/s/sfrc/crm', apiKey: 'sfrc_key_01234', dsc: 'Customer relationship management for virtual account holders and business partners. Synchronizes virtual account data with CRM records, enabling comprehensive customer profiles, automated lead nurturing, and personalized service delivery. Enhances sales, marketing, and support operations.', ftr: ['crm', 'spt', 'mkt'], clr: 'gr', cap: { maxAccounts_Sync: 1000000, apiCalls_PerDay: 10000000, customObj_Limit: 5000, dataStorage_GB: 500, userLicenses_Max: 100000, automation_Flows: 2000 }, dact: false },
  orcl: { id: 'orcl', nm: 'Oracle Enterprise Solutions', st: 'ACT', url: 'https://citibankdemobusiness.dev/s/orcl/erp', apiKey: 'orcl_db_12345', dsc: 'Enterprise resource planning integration for large-scale virtual account operations. Provides robust database management, financial modules, and supply chain solutions, offering a holistic view of business operations. Essential for complex multi-entity and international financial structures.', ftr: ['erp', 'dbm', 'fin'], clr: 'gr', cap: { maxDbSize_TB: 100000000, txn_PerSec_Db: 1000000, concurrentConn_Max: 50000, dataSecure_Level: 'AES256', highAvail_Percent: 0.99999, scaling_Factor: 1000 }, dact: false },
  mrqt: { id: 'mrqt', nm: 'Marqeta Card Issuing', st: 'ACT', url: 'https://citibankdemobusiness.dev/s/mrqt/crd', apiKey: 'mrqt_api_23456', dsc: 'Card issuance and management for virtual accounts, enabling spend controls. Offers programmatic card creation, funding, and authorization, supporting various card programs including virtual, physical, and tokenized cards. Crucial for embedded finance and expense management solutions.', ftr: ['crd', 'spc', 'pym'], clr: 'gr', cap: { cards_Issued_Max: 10000000, txn_PerDay_Limit: 100000000, auth_Rules_Max: 50000, fraudDetect_Rate: 0.999, currency_Support: 150, network_Coverage: 'Global' }, dact: false },
  ctbk: { id: 'ctbk', nm: 'Citibank Core Banking APIs', st: 'ACT', url: 'https://citibankdemobusiness.dev/s/ctbk/cba', apiKey: 'ctbk_tkn_34567', dsc: 'Direct integration with Citibank\'s core banking systems for real-time account services. Enables seamless access to account information, payment initiation, and balance management, providing a unified experience for virtual account operations. Ensures high security and compliance with banking regulations.', ftr: ['bka', 'fts', 'bal'], clr: 'gr', cap: { apiReq_PerSec: 10000000, balanceInq_PerSec: 1000000000, txnProc_Time_Ms: 100, accounts_Supported: 100000000, realTime_Payments: true, regulatory_Compliance: 'BaselIII' }, dact: false },
  shpf: { id: 'shpf', nm: 'Shopify E-commerce', st: 'PND', url: 'https://citibankdemobusiness.dev/s/shpf/shp', apiKey: 'shpf_key_45678', dsc: 'Integration for virtual accounts with Shopify stores for payment and order reconciliation. Automates the linkage between e-commerce transactions and virtual account ledgers, simplifying financial reporting and improving order fulfillment processes. Supports multi-store and multi-currency operations.', ftr: ['ecs', 'ord', 'pmt'], clr: 'bl', cap: { stores_Max: 100000, orders_PerDay_Max: 1000000, product_SKUs: 5000000, paymentGateways_Supported: 200, inventory_Sync_Freq: 'realtime', customer_Data_Sync: true }, dact: true },
  wmrc: { id: 'wmrc', nm: 'WooCommerce E-commerce', st: 'PND', url: 'https://citibankdemobusiness.dev/s/wmrc/sto', apiKey: 'wmrc_key_56789', dsc: 'Open-source e-commerce integration for virtual accounts and transaction processing. Provides flexible and customizable solutions for integrating online storefronts with financial operations, supporting a wide range of payment methods and order management workflows. Ideal for small to medium businesses.', ftr: ['ecs', 'pmt', 'inv'], clr: 'bl', cap: { products_Max: 1000000, orders_Total_Max: 1000000, extensions_Supported: 5000, themes_Compatibility: 1000, userRoles_Management: true, performance_Metrics: 'A' }, dact: true },
  gdyd: { id: 'gdyd', nm: 'GoDaddy Domain & Hosting', st: 'INA', url: 'https://citibankdemobusiness.dev/s/gdyd/hpt', apiKey: 'gdyd_api_67890', dsc: 'Domain and hosting management for virtual account-related micro-sites or landing pages. Offers tools for domain registration, website hosting, and email services, enabling businesses to establish an online presence for their virtual account programs or customer portals.', ftr: ['dom', 'hst', 'web'], clr: 'sl', cap: { domain_Reg_Max: 10000, hosting_Units_Max: 10000, sslCert_Types: 5, emailAcc_Max: 50000, uptime_Guarantee: 0.999, dnsMgmt_Features: true }, dact: true },
  cpnl: { id: 'cpnl', nm: 'cPanel Web Hosting', st: 'INA', url: 'https://citibankdemobusiness.dev/s/cpnl/srv', apiKey: 'cpnl_usr_78901', dsc: 'Web hosting control panel integration for managing developer portals or associated web assets. Simplifies server administration, file management, and database operations, providing a user-friendly interface for technical teams. Supports various scripting languages and web applications.', ftr: ['web', 'adm', 'fs'], clr: 'sl', cap: { accounts_Max: 10000, bandwidth_TB_PerMonth: 1000000, diskSpace_GB: 5000, email_Accounts: 100000, databases_Max: 50000, ssl_Support: true }, dact: true },
  adbe: { id: 'adbe', nm: 'Adobe Creative Cloud', st: 'INA', url: 'https://citibankdemobusiness.dev/s/adbe/cld', apiKey: 'adbe_api_89012', dsc: 'Document generation and management for compliance and reporting with virtual accounts. Utilizes Adobe Acrobat and other tools for creating, editing, and securing financial reports, statements, and legal documents. Ensures high-quality visual presentation and data integrity.', ftr: ['doc', 'des', 'pdf'], clr: 'sl', cap: { userLic_Max: 10000, fileMgmt_Cap: 100000, storage_GB: 1000, app_Integrations: 50, version_Control: true, team_Collaboration: true }, dact: true },
  twlo: { id: 'twlo', nm: 'Twilio Communications API', st: 'ACT', url: 'https://citibankdemobusiness.dev/s/twlo/sms', apiKey: 'twlo_sid_90123', dsc: 'SMS, voice, and email notifications for virtual account events and alerts. Enables real-time communication with account holders regarding transactions, balance updates, and security alerts, enhancing customer engagement and operational transparency. Supports global messaging and multi-channel delivery.', ftr: ['sms', 'vce', 'eml'], clr: 'gr', cap: { messages_Sent_PerMin: 10000000, calls_PerMin: 10000000, email_Sent_PerMin: 5000000, phoneNum_Capacity: 100000, geo_Coverage: 'Global', programmable_Features: 200 }, dact: false },
};

const _genSvc = (idx, prefix) => {
  const k = `${prefix}${String(idx).padStart(4, '0')}`;
  const n = `Enterprise Global Solutions Partner ${idx}`;
  const s = idx % 3 === 0 ? 'ACT' : (idx % 3 === 1 ? 'PND' : 'INA');
  const u = `https://citibankdemobusiness.dev/s/svc/${k}/api`;
  const p = `${k}_auto_api_key_${idx * 7 + 3}`;
  const d = `This comprehensive enterprise solution for ${n} integrates diverse modules across finance, operations, and intelligence. It facilitates secure data exchange, real-time analytics, and automated decision-making processes, ensuring optimal performance and compliance within the current fiscal framework. Advanced cryptographic protocols safeguard all transactions, and multi-tier authentication layers provide robust access control. Predictive modeling capabilities forecast future trends, empowering proactive strategic adjustments. Global regulatory adherence is a core tenet, with configurable compliance frameworks for various jurisdictions. This platform is designed for scalable deployment across hybrid cloud environments, supporting both legacy systems and emerging technologies. Enhanced monitoring, AI-driven automation, and a modular architecture guarantee adaptability and resilience for future business demands.`;
  const f = [
    `core-api-${k}`, `ext-integ-${k}`, `int-data-${k}`, `sec-policy-${k}`, `autn-meth-${k}`, `audt-log-${k}`, `rptg-mod-${k}`, `anlyt-eng-${k}`,
    `fin-mgmt-${k}`, `oprtn-exec-${k}`, `mktg-auto-${k}`, `suppt-desk-${k}`, `dev-tools-${k}`, `env-mgt-${k}`, `dlvy-chain-${k}`, `maint-schdl-${k}`,
    `data-ware-${k}`, `cloud-hbrd-${k}`, `web-portl-${k}`, `mob-app-${k}`, `ml-algos-${k}`, `ai-nlp-${k}`, `blkch-dist-${k}`, `iot-sensor-${k}`,
    `api-rest-${k}`, `sdk-js-${k}`, `frmwk-react-${k}`, `utl-func-${k}`, `cntrl-dash-${k}`, `cfg-params-${k}`, `mon-alerts-${k}`, `diag-tools-${k}`,
    `prfrm-opt-${k}`, `relbl-sys-${k}`, `scalbl-arch-${k}`, `elastc-res-${k}`, `secur-hardn-${k}`, `cmply-reg-${k}`, `grn-envir-${k}`, `ethc-stand-${k}`
  ];
  const c = idx % 3 === 0 ? 'green' : (idx % 3 === 1 ? 'blue' : 'silver');
  const cap = {
    mxUsgTtl: idx * 10000000,
    tPSPrSvc: idx * 100000,
    dlyBgtLmt: idx * 100000000,
    conCurCnn: idx * 10000,
    reqLtnyMS: idx * 150,
    volCapGB: idx * 10000,
    strgDurMn: idx * 120,
    bkUpFreqHr: idx * 24,
    rstrvTmS: idx * 3600,
    encrypLvl: idx * 256,
    certExpDy: idx * 90,
    dlpPlicyV: idx * 5,
    thrttLmtC: idx * 500,
    burstSpdT: idx * 1000,
    apiRqsLim: idx * 100000,
    webhookEvt: idx * 50000,
    eventQueSz: idx * 1000000,
    logRetntDy: idx * 730,
    audtRecCnt: idx * 500000,
    compRptGen: idx * 100,
    custSrvLvl: idx * 3,
    sLAUptmPct: 99.99 + (idx % 10 / 100),
    geosRstric: idx % 4,
    dataReside: idx % 5,
    ipv6Supprt: idx % 2 === 0,
    multiTntCp: idx % 2 === 1,
    singlSgnOn: idx % 2 === 0,
    roleBsdAcc: idx % 2 === 1,
    twoFctrAth: idx % 2 === 0,
    biomtrcAth: idx % 2 === 1,
    qrCodAth: idx % 2 === 0,
    passPolStr: idx * 10,
    passRotFrq: idx * 30,
    netwIsoltn: idx % 2 === 0,
    firewallCfg: idx * 100,
    ddosProtect: idx % 2 === 1,
    wafDeployd: idx % 2 === 0,
    vulnScanFr: idx * 7,
    pentTestCnt: idx * 1,
    threatIntFl: idx * 10,
    secOpsCen: idx % 2 === 0,
    incdntResp: idx * 60,
    bussContPlan: idx % 2 === 1,
    disstrRecv: idx * 120,
    regComplian: idx % 2 === 0,
    pciDssCmp: idx % 2 === 1,
    hipaaCmpli: idx % 2 === 0,
    gdprComply: idx % 2 === 1,
    soc2Type: idx % 2 === 0,
    iso27kCert: idx % 2 === 1,
    fedRampAuth: idx % 2 === 0,
    txProcFeeRt: 0.001 + (idx % 100 / 10000),
    fxRateMark: 0.0001 + (idx % 100 / 1000000),
    paymntGrwyF: 0.01 + (idx % 100 / 10000),
    subscModTyp: idx % 3,
    upTmGuarant: 99.9 + (idx % 100 / 10000),
    respTmAvgS: 0.1 + (idx % 100 / 1000),
    cpuUtilAvg: 50 + (idx % 50),
    memUtilAvg: 60 + (idx % 40),
    diskIOPSAv: 1000 + (idx * 10),
    netInBPSAv: 1000000 + (idx * 50000),
    netOutBPSAv: 1000000 + (idx * 50000),
    loadBalConf: idx % 2 === 0,
    autoScalCfg: idx % 2 === 1,
    contRgsPus: idx * 100,
    kubrnDepCnf: idx % 2 === 0,
    serverlFnct: idx * 50,
    msgQueSize: idx * 10000,
    dataStrmRps: idx * 5000,
    apiAuthMech: idx % 4,
    sdkLangSupp: idx % 10,
    devDocVer: idx * 1.1,
    commFrymSrc: idx % 5,
    suppChnlCnt: idx % 5,
    tcktRspTmS: idx * 3600,
    resoluRateP: idx * 0.8,
    kbArtclCnt: idx * 100,
    aiChatSptFl: idx % 2 === 0,
    mlModelVer: idx * 1.05,
    predAccPrc: 0.85 + (idx % 100 / 10000),
    frdDtctSc: 0.9 + (idx % 9 / 100),
    nlgGenCap: idx % 2 === 1,
    vidAnlysFea: idx % 2 === 0,
    imgRecgMod: idx % 2 === 1,
    spchToTxtAcc: 0.9 + (idx % 9 / 100),
    txtToSpchCap: idx % 2 === 0,
    nlpSentiAna: idx % 2 === 1,
    dataVisTool: idx % 2 === 0,
    dshBrdWdgtC: idx * 50,
    cmplxRptFmt: idx * 10,
    customDash: idx % 2 === 1,
    alertThresh: idx * 0.9,
    ntfnChnlCnt: idx % 5
  };
  const dac = idx % 2 === 0;
  return { id: k, nm: n, st: s, url: u, apiKey: p, dsc: d, ftr: f, clr: c, cap: cap, dact: dac };
};

let currentSvcCount = Object.keys(CBBPS).length;
for (let i = currentSvcCount + 1; i <= 1000; i++) {
  const k = `Srv${String(i).padStart(4, '0')}`;
  CBBPS[k] = _genSvc(i, 'GEN');
}

export interface CBBFormV {
  nm: string;
  iA: string;
  cP: { value: string; label: string } | null;
  ds: string;
  mt: Array<{ k: string; v: string }>;
  ld: { value: string; label: string } | null;
  cL: { value: string; label: string } | null;
  dL: { value: string; label: string } | null;
  sI: string[];
  eD: boolean;
  pT: string;
  bC: string;
  rN: string;
  aL: number;
  ct: {
    f1: string;
    f2: boolean;
    f3: number;
  };
  sC: string;
  aud: boolean;
  geoR: string;
  prcL: string;
  srp: string;
  notC: string;
}

export const PrtVldSchm = (
  a: typeof Yup
) =>
  a.object().shape({
    nm: a.string().trim().min(3, 'N_L_MIN').max(100, 'N_L_MAX').required('N_RQ'),
    iA: a.string().required('IA_RQ').uuid('IA_FMT'),
    cP: a.object().nullable().shape({
      value: a.string().uuid('CPV_FMT').required('CPV_RQ'),
      label: a.string().required('CPL_RQ'),
    }),
    ds: a.string().max(500, 'DS_L_MAX').nullable(),
    mt: a.array()
      .of(
        a.object().shape({
          k: a.string().trim().required('MTK_RQ').min(1, 'MTK_L_MIN').max(50, 'MTK_L_MAX'),
          v: a.string().trim().required('MTV_RQ').min(1, 'MTV_L_MIN').max(200, 'MTV_L_MAX'),
        })
      )
      .min(0)
      .nullable(),
    ld: a.object().nullable().shape({
      value: a.string().uuid('LDV_FMT').required('LDV_RQ'),
      label: a.string().required('LDL_RQ'),
    }),
    cL: a.object().nullable().shape({
      value: a.string().uuid('CLAV_FMT').required('CLAV_RQ'),
      label: a.string().required('CLAL_RQ'),
    }),
    dL: a.object().nullable().shape({
      value: a.string().uuid('DLAV_FMT').required('DLAV_RQ'),
      label: a.string().required('DLAL_RQ'),
    }),
    sI: a.array().of(a.string()).min(0).nullable(),
    eD: a.boolean().required('ED_RQ'),
    pT: a.string().oneOf(['NET30', 'NET60', 'EOM', 'CUSTOM'], 'PT_INV').required('PT_RQ'),
    bC: a.string().oneOf(['FINTECH', 'ECOMM', 'SAAS', 'MEDIA', 'OTHER'], 'BC_INV').required('BC_RQ'),
    rN: a.string().matches(/^[A-Z0-9_\-]+$/, 'RN_FMT').nullable(),
    aL: a.number().min(0, 'AL_MIN').max(999999999, 'AL_MAX').required('AL_RQ'),
    ct: a.object().shape({
      f1: a.string().min(2, 'CTF1_MIN').max(50, 'CTF1_MAX').required('CTF1_RQ'),
      f2: a.boolean().required('CTF2_RQ'),
      f3: a.number().min(1, 'CTF3_MIN').required('CTF3_RQ'),
    }).required('CT_RQ'),
    sC: a.string().oneOf(['BASIC', 'ADVANCED', 'ENTERPRISE'], 'SC_INV').required('SC_RQ'),
    aud: a.boolean().required('AUD_RQ'),
    geoR: a.string().oneOf(['NONE', 'US_ONLY', 'EU_ONLY', 'GLOBAL'], 'GR_INV').required('GR_RQ'),
    prcL: a.string().oneOf(['TIERED', 'FLAT', 'VOLUME_BASED'], 'PL_INV').required('PL_RQ'),
    srp: a.string().oneOf(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY'], 'SRP_INV').required('SRP_RQ'),
    notC: a.string().oneOf(['EMAIL', 'SMS', 'WEBHOOK', 'BOTH'], 'NC_INV').required('NC_RQ'),
  });

export const GtItlFV = (): CBBFormV => ({
  nm: '',
  iA: '',
  cP: null,
  ds: '',
  mt: [],
  ld: null,
  cL: null,
  dL: null,
  sI: [],
  eD: false,
  pT: 'NET30',
  bC: 'FINTECH',
  rN: '',
  aL: 0,
  ct: { f1: 'Default Value', f2: true, f3: 100 },
  sC: 'BASIC',
  aud: true,
  geoR: 'GLOBAL',
  prcL: 'FLAT',
  srp: 'MONTHLY',
  notC: 'EMAIL',
});

export const FldInv = (
  e: FormikErrors<CBBFormV>,
  t: FormikTouched<CBBFormV>,
  f: string,
) => (getIn(e, f) && getIn(t, f)) as boolean;

export interface VfMdPr {
  sO: (a: boolean) => void;
}

export const CBBIntrnAccDat = [
  { value: 'uuid-int-acc-001', label: 'CDB Core Account A' },
  { value: 'uuid-int-acc-002', label: 'CDB Operations Ledger B' },
  { value: 'uuid-int-acc-003', label: 'CDB Treasury Pool C' },
  { value: 'uuid-int-acc-004', label: 'CDB Settlement Hub D' },
  { value: 'uuid-int-acc-005', label: 'CDB FX Clearing E' },
  { value: 'uuid-int-acc-006', label: 'CDB Payment Gateway F' },
  { value: 'uuid-int-acc-007', label: 'CDB Merchant Trust G' },
  { value: 'uuid-int-acc-008', label: 'CDB Revenue Holding H' },
  { value: 'uuid-int-acc-009', label: 'CDB Expense Clearing I' },
  { value: 'uuid-int-acc-010', label: 'CDB Capital Reserve J' },
  { value: 'uuid-int-acc-011', label: 'CDB Interco Transfer K' },
  { value: 'uuid-int-acc-012', label: 'CDB Regulatory Escrow L' },
  { value: 'uuid-int-acc-013', label: 'CDB Client Funds M' },
  { value: 'uuid-int-acc-014', label: 'CDB Suspense N' },
  { value: 'uuid-int-acc-015', label: 'CDB Payroll O' },
  { value: 'uuid-int-acc-016', label: 'CDB Supplier Payments P' },
  { value: 'uuid-int-acc-00000000-0000-0000-0000-000000000017', label: 'CDB Customer Refunds Q' },
  { value: 'uuid-int-acc-00000000-0000-0000-0000-000000000018', label: 'CDB Loan Servicing R' },
  { value: 'uuid-int-acc-00000000-0000-0000-0000-000000000019', label: 'CDB Investment Portfolio S' },
  { value: 'uuid-int-acc-00000000-0000-0000-0000-000000000020', label: 'CDB Dispute Resolution T' },
];

export const CBBPrtyDat = [
  { value: 'uuid-cpty-00000000-0000-0000-0000-000000000001', label: 'Global Dynamics Inc.', nm: 'Global Dynamics Inc.' },
  { value: 'uuid-cpty-00000000-0000-0000-0000-000000000002', label: 'Apex Innovations Corp.', nm: 'Apex Innovations Corp.' },
  { value: 'uuid-cpty-00000000-0000-0000-0000-000000000003', label: 'Quantum Leap Solutions', nm: 'Quantum Leap Solutions' },
  { value: 'uuid-cpty-00000000-0000-0000-0000-000000000004', label: 'Synergy Tech Group', nm: 'Synergy Tech Group' },
  { value: 'uuid-cpty-00000000-0000-0000-0000-000000000005', label: 'Nova Ventures LLC', nm: 'Nova Ventures LLC' },
  { value: 'uuid-cpty-00000000-0000-0000-0000-000000000006', label: 'Pioneer Capital Partners', nm: 'Pioneer Capital Partners' },
  { value: 'uuid-cpty-00000000-0000-0000-0000-000000000007', label: 'Stratosphere Holdings', nm: 'Stratosphere Holdings' },
  { value: 'uuid-cpty-00000000-0000-0000-0000-000000000008', label: 'Ascendant Financials', nm: 'Ascendant Financials' },
  { value: 'uuid-cpty-00000000-0000-0000-0000-000000000009', label: 'Epsilon Enterprises', nm: 'Epsilon Enterprises' },
  { value: 'uuid-cpty-00000000-0000-0000-0000-000000000010', label: 'Omega Development Co.', nm: 'Omega Development Co.' },
  { value: 'uuid-cpty-00000000-0000-0000-0000-000000000011', label: 'Fusion Systems Ltd.', nm: 'Fusion Systems Ltd.' },
  { value: 'uuid-cpty-00000000-0000-0000-0000-000000000012', label: 'Horizon Global Corp.', nm: 'Horizon Global Corp.' },
  { value: 'uuid-cpty-00000000-0000-0000-0000-000000000013', label: 'Infinity Ventures Group', nm: 'Infinity Ventures Group' },
  { value: 'uuid-cpty-00000000-0000-0000-0000-000000000014', label: 'Zenith Innovations Inc.', nm: 'Zenith Innovations Inc.' },
  { value: 'uuid-cpty-00000000-0000-0000-0000-000000000015', label: 'Catalyst Solutions SA', nm: 'Catalyst Solutions SA' },
  { value: 'uuid-cpty-00000000-0000-0000-0000-000000000016', label: 'Vanguard Capital Group', nm: 'Vanguard Capital Group' },
  { value: 'uuid-cpty-00000000-0000-0000-0000-000000000017', label: 'Nexus Technologies', nm: 'Nexus Technologies' },
  { value: 'uuid-cpty-00000000-0000-0000-0000-000000000018', label: 'Phoenix Holdings Corp.', nm: 'Phoenix Holdings Corp.' },
  { value: 'uuid-cpty-00000000-0000-0000-0000-000000000019', label: 'Aurora Innovations', nm: 'Aurora Innovations' },
  { value: 'uuid-cpty-00000000-0000-0000-0000-000000000020', label: 'Starlight Financials', nm: 'Starlight Financials' },
];

export const SlLdI = [
  { value: 'uuid-ledger-00000000-0000-0000-0000-000000000001', label: 'GL-Primary-USD' },
  { value: 'uuid-ledger-00000000-0000-0000-0000-000000000002', label: 'GL-Secondary-EUR' },
  { value: 'uuid-ledger-00000000-0000-0000-0000-000000000003', label: 'GL-Treasury-GBP' },
  { value: 'uuid-ledger-00000000-0000-0000-0000-000000000004', label: 'GL-Customer-CAD' },
  { value: 'uuid-ledger-00000000-0000-0000-0000-000000000005', label: 'GL-Partner-AUD' },
  { value: 'uuid-ledger-00000000-0000-0000-0000-000000000006', label: 'GL-InterCo-JPY' },
  { value: 'uuid-ledger-00000000-0000-0000-0000-000000000007', label: 'GL-Settlement-CHF' },
  { value: 'uuid-ledger-00000000-0000-0000-0000-000000000008', label: 'GL-Compliance-SEK' },
  { value: 'uuid-ledger-00000000-0000-0000-0000-000000000009', label: 'GL-Operations-NOK' },
  { value: 'uuid-ledger-00000000-0000-0000-0000-000000000010', label: 'GL-Investment-HKD' },
];

export const SlLdAcI = (a: string) => {
  if (!a) return [];
  const b = a.split('-')[1].toUpperCase();
  return [
    { value: `uuid-ldac-${b}-00000000-0000-0000-0000-000000000001`, label: `${b}-CashIn` },
    { value: `uuid-ldac-${b}-00000000-0000-0000-0000-000000000002`, label: `${b}-CashOut` },
    { value: `uuid-ldac-${b}-00000000-0000-0000-0000-000000000003`, label: `${b}-Receivables` },
    { value: `uuid-ldac-${b}-00000000-0000-0000-0000-000000000004`, label: `${b}-Payables` },
    { value: `uuid-ldac-${b}-00000000-0000-0000-0000-000000000005`, label: `${b}-Revenue` },
    { value: `uuid-ldac-${b}-00000000-0000-0000-0000-000000000006`, label: `${b}-Expense` },
    { value: `uuid-ldac-${b}-00000000-0000-0000-0000-000000000007`, label: `${b}-Liability` },
    { value: `uuid-ldac-${b}-00000000-0000-0000-0000-000000000008`, label: `${b}-Asset` },
  ];
};

export const usVAFQry = (a) => {
  const [b, c] = React.useState(true);
  const [d, e] = React.useState(null);
  const [f, g] = React.useState(null);

  React.useEffect(() => {
    let h = true;
    const i = async () => {
      await new Promise((j) => setTimeout(j, 750));
      if (!h) return;
      if (a.variables.virtualAccountsEnabledOnly) {
        e({
          internalAccountsUnpaginated: CBBIntrnAccDat,
          counterparties: { edges: CBBPrtyDat.map((k) => ({ node: k })) },
          ledgerOptions: SlLdI
        });
        c(false);
      } else {
        g(new Error('V_A_F_Q_ERR'));
        c(false);
      }
    };
    i();
    return () => {
      h = false;
    };
  }, [a.variables.virtualAccountsEnabledOnly]);

  return { data: d, loading: b, error: f };
};

export const usCrtVAMut = () => {
  const [a, b] = React.useState(false);
  const [c, d] = React.useState(null);

  const e = async (f) => {
    b(true);
    await new Promise((g) => setTimeout(g, 1200));

    let h = f.variables.input.input;
    let i = null;
    let j = null;

    if (!h.nm || !h.iA) {
      j = [{ message: 'NM_IA_RQ_ERR', path: ['createVirtualAccount', 'input', 'name'] }];
    } else if (h.nm.includes('Fail')) {
      j = [{ message: 'SIM_FL_ERR', path: ['createVirtualAccount', 'input', 'name'] }];
    } else {
      i = {
        id: `va-${Math.random().toString(36).substring(2, 15)}`,
        name: h.nm,
        internalAccountId: h.iA,
        counterpartyId: h.cP?.value || null,
        description: h.ds,
        metadata: JSON.parse(h.metadata || '{}'),
        ledgerId: h.ld?.value || null,
        creditLedgerAccountId: h.cL?.value || null,
        debitLedgerAccountId: h.dL?.value || null,
        status: 'ACTIVE',
        currency: 'USD',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    d({
      data: {
        createVirtualAccount: {
          virtualAccount: i,
          errors: j,
        },
      },
    });
    b(false);
    return { data: d?.data };
  };

  return [e, { loading: a, data: c?.data }];
};

export const EvntTrckr = () => {
  const a = 'https://citibankdemobusiness.dev/api/analytics/events';
  const b = 'Citibank demo business Inc';
  const c = 'v1.0.1';

  const d = async (e, f, g = {}) => {
    const h = {
      tm: new Date().toISOString(),
      co: b,
      apV: c,
      ev: f,
      ctx: {
        usrId: localStorage.getItem('usr_id') || 'GUEST',
        sessId: sessionStorage.getItem('sess_id') || `SESS-${Date.now()}`,
        pg: window.location.pathname,
        ref: document.referrer,
        brwsr: navigator.userAgent,
        res: `${window.screen.width}x${window.screen.height}`,
        intg: localStorage.getItem('active_integrations') || 'NONE',
        formVld: e?.isValid || 'UNKNOWN',
        formSub: e?.isSubmitting || 'UNKNOWN',
        clientIP: '127.0.0.1',
        deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
      },
      pld: g,
    };

    if (e && e.values && f.includes('FORM_SUBMITTED')) {
      h.pld = { ...h.pld,
        frmData: {
          nm: e.values.nm,
          iA: e.values.iA,
          cP: e.values.cP?.value,
          ld: e.values.ld?.value,
          sI: e.values.sI,
          eD: e.values.eD,
          bC: e.values.bC,
          aud: e.values.aud,
          prcL: e.values.prcL,
          srp: e.values.srp,
          notC: e.values.notC
        }
      };
    }

    try {
      const i = await fetch(a, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CBB-API-KEY': 'ANALYTICS_KEY_CITIDEMOBIZ_HIGHSEC',
          'X-CBB-TRACE-ID': `TRACE-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          'X-CBB-ORG-ID': 'CBB-ORG-001-PROD'
        },
        body: JSON.stringify(h),
      });

      if (!i.ok) {
        const j = await i.text();
        const k = `Error during event tracking request to ${a}. Status: ${i.status}. Message: ${j}. Timestamp: ${new Date().toISOString()}. Event Type: ${f}. Payload Size: ${JSON.stringify(h).length}. Response Headers: ${JSON.stringify(i.headers)}. Request Body Sample: ${JSON.stringify(h).substring(0, 200)}.`;
        localStorage.setItem(`EVNT_LOG_ERR_${Date.now()}`, k);
        fetch('https://citibankdemobusiness.dev/api/logs/error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ e: k, s: 'CRITICAL', c: 'AnalyticsService', t: new Date().toISOString(), tid: h.ctx.sessId })
        }).catch(() => {});
      }
    } catch (j) {
      const k = `Exception during event tracking. Error: ${j.message}. Stack: ${j.stack}. Timestamp: ${new Date().toISOString()}. Event Type: ${f}. Context: ${JSON.stringify(h.ctx)}.`;
      localStorage.setItem(`EVNT_LOG_EXCP_${Date.now()}`, k);
      fetch('https://citibankdemobusiness.dev/api/logs/exception', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ e: k, s: 'FATAL', c: 'AnalyticsService', t: new Date().toISOString(), tid: h.ctx.sessId })
      }).catch(() => {});
    }
  };
  return { tEv: d };
};

export const CBBSpcSrvcPanel = ({
  v, s, f,
}) => {
  const a = CBBPS;
  const b = Object.keys(a);

  const c = React.useCallback((d, e) => {
    s('sI', d, false);
    const h = `Integration ${e.nm} ${d.includes(e.id) ? 'enabled' : 'disabled'}.`;
    f.setFieldError('sI', undefined);
    f.setStatus({ ...f.status, message: h, type: 'info', timestamp: Date.now() });
    const i = setTimeout(() => f.setStatus({ ...f.status, message: '', type: '' }), 3000);
    return () => clearTimeout(i);
  }, [s, f]);

  return (
    <div className="mb-4 mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
      <div className="pb-3 text-lg font-semibold text-gray-900 flex items-center">
        <span>Prvdr Intgrtn Srvcs (PIS)</span>
        <Tooltip
          data-tip="Configure various partner integrations for enhanced virtual account capabilities. Each service offers unique features and compliance frameworks."
          className="ml-2 cursor-pointer text-gray-500"
        />
        <ReactTooltip id="PIS-Tooltip" data-place="right" data-type="dark" data-effect="float" data-html />
      </div>
      <p className="mb-4 text-sm text-gray-600">
        Extensive platform extensions for advanced functionalities, curated for Citibank demo business Inc:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {b.map((d, i) => {
          const e = a[d];
          const g = v.sI.includes(e.id);

          const h = `svc-chk-${e.id}`;
          const l = `${e.nm} Status: ${e.st === 'ACT' ? 'Active' : (e.st === 'PND' ? 'Pending' : 'Inactive')}`;

          const onChng = (k) => {
            const m = k.target.checked;
            let n = m
              ? [...v.sI, e.id]
              : v.sI.filter((o) => o !== e.id);
            c(n, e);
          };

          const sP = `Service Provider: ${e.nm}. Status: ${l}. API URL: ${e.url}. API Key Prefix: ${e.apiKey?.substring(0, 8) || 'N/A'}... Description: ${e.dsc}. Features: ${e.ftr.join(', ')}. Color Scheme: ${e.clr}. Key Capabilities: ${JSON.stringify(e.cap)}. Deactivated Flag: ${e.dact}. This service provides critical functionalities for modern financial operations, encompassing a wide range of analytical, transactional, and compliance tools. Its integration allows for real-time data synchronization and ensures high levels of operational efficiency and security across all virtual account activities within the Citibank Demo Business Inc. ecosystem. Comprehensive logging and audit trails are maintained for all interactions.`;

          return (
            <div key={d} className={`p-3 border rounded-md shadow-sm transition-transform duration-200 ease-in-out hover:scale-[1.01] ${g ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'} ${e.dact ? 'opacity-60 grayscale' : ''}`}>
              <div className="flex items-center justify-between">
                <label htmlFor={h} className="flex-1 cursor-pointer flex items-center">
                  <input
                    type="checkbox"
                    id={h}
                    name={h}
                    checked={g}
                    onChange={onChng}
                    disabled={e.dact === true}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className={`ml-2 text-sm font-medium ${g ? 'text-green-800' : 'text-gray-900'} ${e.dact ? 'line-through text-gray-500' : ''}`}>
                    {e.nm}
                  </span>
                  <Tooltip
                    data-tip={sP}
                    className="ml-1 cursor-pointer text-gray-400 hover:text-gray-700"
                  />
                  <ReactTooltip id={`tooltip-${d}`} data-place="top" data-type="dark" data-effect="float" data-html />
                </label>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${e.st === 'ACT' ? 'bg-green-100 text-green-800' : (e.st === 'PND' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800')}`}>
                  {e.st}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 pl-6">
                {e.dsc.substring(0, 70)}...
              </p>
              {g && (
                <div className="mt-2 pl-6 text-xs text-green-700 font-medium">
                  Configured: {e.ftr.length} features enabled.
                </div>
              )}
              {e.dact && (
                <div className="mt-2 pl-6 text-xs text-red-600 font-medium">
                  This integration is currently deactivated system-wide.
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4">
        <FormikErrorMessage name="sI" />
      </div>
    </div>
  );
};

export interface VAFrmCmpPr {
  sL: string;
}

export const VirtualAccountStructureComposer = ({
  sL,
}: VAFrmCmpPr) => {
  const { d: qD, l: qL, e: qE } = usVAFQry({
    variables: { virtualAccountsEnabledOnly: true },
  });

  const { ledgersProductActive: lPA } = useLedgersProductActive();

  const iAOp =
    qL || !qD || qE
      ? []
      : qD.internalAccountsUnpaginated.map((a) => ({
          value: a.value,
          label: a.label,
        }));

  const cPOp =
    qL || !qD || qE
      ? []
      : qD.counterparties.edges.map(({ node: a }) => ({
          ...a,
          value: a.value,
          label: a.label,
        }));

  const lOp = SlLdI;
  const lAcOp = SlLdAcI(sL);

  return (
    <Form>
      <div className="mb-3 mt-3 p-2 bg-blue-50 rounded-md border border-blue-200">
        <div className="flex flex-row justify-between pb-3 items-center">
          <Label id="nm" className="text-sm font-normal text-blue-800">
            VA_Nomencl
          </Label>
          <Tooltip
            data-tip="Unique identifier for the virtual account within Citibank Demo Business Inc. ecosystem. Max 100 characters. This name will appear on statements and internal reports."
            className="ml-1 cursor-pointer text-blue-500"
          />
          <ReactTooltip id="NameTooltip" data-place="right" data-type="dark" data-effect="float" data-html />
        </div>
        <Field
          id="nm"
          name="nm"
          placeholder="Entr_Acc_Nomencl"
          component={FormikInputField}
        />
        <FormikErrorMessage name="nm" />
      </div>
      <div className="mt-3 p-2 bg-yellow-50 rounded-md border border-yellow-200">
        <div className="pb-2 flex items-center">
          <Label
            id="iA"
            className="text-sm font-normal text-yellow-800"
          >
            Intrnl_Acnt_Sel
          </Label>
          <Tooltip
            data-tip="Link this virtual account to an existing internal ledger account for reconciliation. This is a mandatory field for ensuring accurate financial tracking and settlement. Select from available primary or operational accounts."
            className="ml-1 cursor-pointer text-yellow-500"
          />
          <ReactTooltip id="InternalAccountTooltip" data-place="right" data-type="dark" data-effect="float" data-html />
        </div>
        <Field
          id="iA"
          name="iA"
          component={FormikSelectField}
          options={iAOp}
          placeholder="Slct_An_Intrnl_Acc"
        />
        <FormikErrorMessage name="iA" />
      </div>
      <div className="mt-3 p-2 bg-purple-50 rounded-md border border-purple-200">
        <div className="flex flex-row items-center justify-between pb-2">
          <Label
            id="cP"
            className="text-sm font-normal text-purple-800"
          >
            Prtnr_Cntprty_Asgnmnt
          </Label>
          <span className="pl-2 text-xs font-normal text-purple-600">
            Optnl
          </span>
          <Tooltip
            data-tip="Associate this virtual account with a specific counterparty for clearer transaction context and streamlined reporting. This helps in categorizing financial flows and managing business relationships. Optional field."
            className="ml-1 cursor-pointer text-purple-500"
          />
          <ReactTooltip id="CounterpartyTooltip" data-place="right" data-type="dark" data-effect="float" data-html />
        </div>
        <Field
          name="cP"
          component={FormikSelectField}
          options={cPOp}
          placeholder="Slct_A_Cntprty"
        />
      </div>
      <div className="mb-3 mt-3 p-2 bg-gray-50 rounded-md border border-gray-200">
        <div className="flex flex-row items-center justify-between pb-2">
          <Label id="ds" className="text-sm font-normal text-gray-800">
            Accnt_Descrptn
          </Label>
          <span className="pl-2 text-xs font-normal text-gray-600">
            Optnl
          </span>
          <Tooltip
            data-tip="Provide a detailed description for the virtual account's purpose or specific use case. This textual explanation can be up to 500 characters and assists in internal understanding and audit processes. Optional."
            className="ml-1 cursor-pointer text-gray-500"
          />
          <ReactTooltip id="DescriptionTooltip" data-place="right" data-type="dark" data-effect="float" data-html />
        </div>
        <Field
          id="ds"
          name="ds"
          placeholder="Descrptn_Of_VA_Prps"
          component={FormikInputField}
        />
        <FormikErrorMessage name="ds" />
      </div>

      {lPA && (
        <div className="mt-6 p-4 border border-indigo-200 rounded-lg bg-indigo-50 shadow-sm">
          <div className="pb-3 text-lg font-semibold text-indigo-900 flex items-center">
            <span>Ldgr_Mngmnt_Cnfg</span>
            <Tooltip
              data-tip="Configure ledger settings for this virtual account, impacting financial reporting and reconciliation workflows. These settings are crucial for maintaining an accurate general ledger and complying with accounting standards."
              className="ml-2 cursor-pointer text-indigo-500"
            />
            <ReactTooltip id="LedgerConfigTooltip" data-place="right" data-type="dark" data-effect="float" data-html />
          </div>
          <div className="mt-3">
            <div className="flex flex-row items-center pb-2">
              <Label id="ld" className="text-sm font-normal text-indigo-800">
                Ldgr_Slctn
              </Label>
              <span className="pl-2 text-xs font-normal text-indigo-600">
                Optnl
              </span>
              <Tooltip
                data-tip="Select a ledger to set the default credit/debit ledger accounts from. If not selected, these may need manual entry or will default to system-wide settings based on the internal account currency and type."
                className="ml-1 cursor-pointer text-indigo-500"
              />
              <ReactTooltip
                data-place="top"
                data-type="dark"
                data-effect="float"
                data-html
              />
            </div>
            <Field
              name="ld"
              component={FormikSelectField}
              options={lOp}
              placeholder="Slct_A_Ldgr"
            />
            <FormikErrorMessage name="ld" />
          </div>
          {sL && (
            <div className="mt-4">
              <div className="flex flex-row items-center justify-between pb-2">
                <Label className="text-sm font-normal text-indigo-800">
                  Crdt_Ldgr_Acnt
                </Label>
                <span className="pl-2 text-xs font-normal text-indigo-600">
                  Optnl
                </span>
                <Tooltip
                  data-tip="Designated ledger account for credit entries when transactions occur on this virtual account. If a ledger is selected, available accounts are filtered based on that ledger to ensure consistency."
                  className="ml-1 cursor-pointer text-indigo-500"
                />
                <ReactTooltip id="CreditLedgerAccountTooltip" data-place="right" data-type="dark" data-effect="float" data-html />
              </div>
              <Field
                name="cL"
                component={FormikSelectField}
                options={lAcOp}
                placeholder="Slct_Crdt_Ldgr_Acnt"
              />
            </div>
          )}
          {sL && (
            <div className="mt-4">
              <div className="flex flex-row items-center justify-between pb-2">
                <Label className="text-sm font-normal text-indigo-800">
                  Dbt_Ldgr_Acnt
                </Label>
                <span className="pl-2 text-xs font-normal text-indigo-600">
                  Optnl
                </span>
                <Tooltip
                  data-tip="Designated ledger account for debit entries when transactions occur on this virtual account. If a ledger is selected, available accounts are filtered based on that ledger for accurate double-entry accounting."
                  className="ml-1 cursor-pointer text-indigo-500"
                />
                <ReactTooltip id="DebitLedgerAccountTooltip" data-place="right" data-type="dark" data-effect="float" data-html />
              </div>
              <Field
                name="dL"
                component={FormikSelectField}
                options={lAcOp}
                placeholder="Slct_Dbt_Ldgr_Acnt"
              />
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 border border-green-200 rounded-lg bg-green-50 shadow-sm">
        <div className="pb-3 text-lg font-semibold text-green-900 flex items-center">
          <span>Oprtnl_Cnfg_Paramtrs</span>
          <Tooltip
            data-tip="Essential operational configurations affecting virtual account behavior and integrations. These parameters dictate how the account interacts with various payment and data processing systems, influencing performance and compliance."
            className="ml-2 cursor-pointer text-green-500"
          />
          <ReactTooltip id="OperationalConfigTooltip" data-place="right" data-type="dark" data-effect="float" data-html />
        </div>
        <div className="mb-3 mt-3">
          <div className="flex flex-row items-center justify-between pb-2">
            <Label id="eD" className="text-sm font-normal text-green-800">
              Enbl_Dtld_Lggng
            </Label>
            <Tooltip
              data-tip="Activate granular logging for all transactions and events related to this virtual account. Recommended for debugging and advanced analytics, but may increase data storage costs and affect real-time performance slightly. Default is disabled."
              className="ml-1 cursor-pointer text-green-500"
            />
            <ReactTooltip id="DetailedLoggingTooltip" data-place="right" data-type="dark" data-effect="float" data-html />
          </div>
          <Field
            id="eD"
            name="eD"
            type="checkbox"
            className="form-checkbox h-5 w-5 text-green-600"
          />
          <FormikErrorMessage name="eD" />
        </div>

        <div className="mb-3 mt-3">
          <div className="flex flex-row items-center pb-2">
            <Label id="pT" className="text-sm font-normal text-green-800">
              Pymnt_Trms
            </Label>
            <Tooltip
              data-tip="Define standard payment terms applicable to transactions initiated or received by this virtual account. This will influence invoice due dates and settlement cycles for associated payments."
              className="ml-1 cursor-pointer text-green-500"
            />
            <ReactTooltip id="PaymentTermsTooltip" data-place="right" data-type="dark" data-effect="float" data-html />
          </div>
          <Field
            id="pT"
            name="pT"
            component={FormikSelectField}
            options={[
              { value: 'NET30', label: 'Net 30 Days' },
              { value: 'NET60', label: 'Net 60 Days' },
              { value: 'EOM', label: 'End of Month' },
              { value: 'CUSTOM', label: 'Custom Defined' },
            ]}
            placeholder="Slct_Pymnt_Trms"
          />
          <FormikErrorMessage name="pT" />
        </div>

        <div className="mb-3 mt-3">
          <div className="flex flex-row items-center pb-2">
            <Label id="bC" className="text-sm font-normal text-green-800">
              Bsnss_Ctgry
            </Label>
            <Tooltip
              data-tip="Categorize the business purpose of this virtual account for internal reporting and compliance purposes. This helps in risk assessment, service tailoring, and regulatory reporting. Choose the most appropriate category for your business model."
              className="ml-1 cursor-pointer text-green-500"
            />
            <ReactTooltip id="BusinessCategoryTooltip" data-place="right" data-type="dark" data-effect="float" data-html />
          </div>
          <Field
            id="bC"
            name="bC"
            component={FormikSelectField}
            options={[
              { value: 'FINTECH', label: 'FinTech' },
              { value: 'ECOMM', label: 'E-commerce' },
              { value: 'SAAS', label: 'SaaS Provider' },
              { value: 'MEDIA', label: 'Media & Entertainment' },
              { value: 'OTHER', label: 'Other' },
            ]}
            placeholder="Slct_Bsnss_Ctgry"
          />
          <FormikErrorMessage name="bC" />
        </div>

        <div className="mb-3 mt-3">
          <div className="flex flex-row items-center justify-between pb-2">
            <Label id="rN" className="text-sm font-normal text-green-800">
              Rfrnc_Nbr_Ptrn
            </Label>
            <span className="pl-2 text-xs font-normal text-green-600">
              Optnl
            </span>
            <Tooltip
              data-tip="Define a pattern for automatically generating or validating reference numbers associated with this virtual account. Supports alphanumeric characters, underscores, and hyphens. E.g., INV-[DATE]-[SEQ]."
              className="ml-1 cursor-pointer text-green-500"
            />
            <ReactTooltip id="ReferenceNumberPatternTooltip" data-place="right" data-type="dark" data-effect="float" data-html />
          </div>
          <Field
            id="rN"
            name="rN"
            placeholder="E.g., INV-[DATE]-[SEQ]"
            component={FormikInputField}
          />
          <FormikErrorMessage name="rN" />
        </div>

        <div className="mb-3 mt-3">
          <div className="flex flex-row items-center pb-2">
            <Label id="aL" className="text-sm font-normal text-green-800">
              Apprvl_Lmt
            </Label>
            <Tooltip
              data-tip="Set the maximum transaction approval limit for this virtual account. Transactions exceeding this limit will require additional authorization, either manual or through an automated workflow. Enter a numeric value."
              className="ml-1 cursor-pointer text-green-500"
            />
            <ReactTooltip id="ApprovalLimitTooltip" data-place="right" data-type="dark" data-effect="float" data-html />
          </div>
          <Field
            id="aL"
            name="aL"
            type="number"
            placeholder="Entr_Apprvl_Lmt"
            component={FormikInputField}
          />
          <FormikErrorMessage name="aL" />
        </div>
      </div>

      <div className="mt-6 p-4 border border-red-200 rounded-lg bg-red-50 shadow-sm">
        <div className="pb-3 text-lg font-semibold text-red-900 flex items-center">
          <span>Cstm_Attrbts</span>
          <Tooltip
            data-tip="User-defined custom attributes to extend the virtual account's data model for specific business requirements. These fields can capture additional metadata relevant to your operations and are fully configurable for reporting."
            className="ml-2 cursor-pointer text-red-500"
          />
          <ReactTooltip id="CustomAttributesTooltip" data-place="right" data-type="dark" data-effect="float" data-html />
        </div>
        <div className="mb-3 mt-3">
          <div className="flex flex-row items-center pb-2">
            <Label id="ct.f1" className="text-sm font-normal text-red-800">
              Cstm_Txt_Fld_One
            </Label>
            <Tooltip
              data-tip="A custom text field for additional string data. Can be used for internal codes, project names, or specific notes. Maximum 50 characters."
              className="ml-1 cursor-pointer text-red-500"
            />
            <ReactTooltip id="CustomTextFieldOneTooltip" data-place="right" data-type="dark" data-effect="float" data-html />
          </div>
          <Field
            id="ct.f1"
            name="ct.f1"
            placeholder="Entr_Cstm_Txt_One"
            component={FormikInputField}
          />
          <FormikErrorMessage name="ct.f1" />
        </div>

        <div className="mb-3 mt-3">
          <div className="flex flex-row items-center pb-2">
            <Label id="ct.f2" className="text-sm font-normal text-red-800">
              Cstm_Bln_Fld_Two
            </Label>
            <Tooltip
              data-tip="A custom boolean field, e.g., for indicating a special status or flag that can be toggled. Useful for quick classifications or feature flags specific to this account."
              className="ml-1 cursor-pointer text-red-500"
            />
            <ReactTooltip id="CustomBooleanFieldTwoTooltip" data-place="right" data-type="dark" data-effect="float" data-html />
          </div>
          <Field
            id="ct.f2"
            name="ct.f2"
            type="checkbox"
            className="form-checkbox h-5 w-5 text-red-600"
          />
          <FormikErrorMessage name="ct.f2" />
        </div>

        <div className="mb-3 mt-3">
          <div className="flex flex-row items-center pb-2">
            <Label id="ct.f3" className="text-sm font-normal text-red-800">
              Cstm_Nmr_Fld_Thr
            </Label>
            <Tooltip
              data-tip="A custom numeric field, e.g., for an internal weighting factor or priority score. Minimum value is 1. Can be used for quantitative classifications or operational metrics."
              className="ml-1 cursor-pointer text-red-500"
            />
            <ReactTooltip id="CustomNumberFieldThreeTooltip" data-place="right" data-type="dark" data-effect="float" data-html />
          </div>
          <Field
            id="ct.f3"
            name="ct.f3"
            type="number"
            placeholder="Entr_Cstm_Nmr_Thr"
            component={FormikInputField}
          />
          <FormikErrorMessage name="ct.f3" />
        </div>
      </div>

      <div className="mt-6 p-4 border border-orange-200 rounded-lg bg-orange-50 shadow-sm">
        <div className="pb-3 text-lg font-semibold text-orange-900 flex items-center">
          <span>Scrt_Cmpl_Cnfg</span>
          <Tooltip
            data-tip="Critical security and compliance settings for the virtual account. These configurations ensure data integrity, access control, and regulatory adherence, paramount for financial operations within Citibank Demo Business Inc."
            className="ml-2 cursor-pointer text-orange-500"
          />
          <ReactTooltip id="SecurityComplianceConfigTooltip" data-place="right" data-type="dark" data-effect="float" data-html />
        </div>
        <div className="mb-3 mt-3">
          <div className="flex flex-row items-center pb-2">
            <Label id="sC" className="text-sm font-normal text-orange-800">
              Scrt_Typ
            </Label>
            <Tooltip
              data-tip="Select the security profile for this virtual account. Basic offers standard protection, Advanced includes additional encryption and MFA, and Enterprise provides multi-factor authentication, advanced threat detection, and dedicated support."
              className="ml-1 cursor-pointer text-orange-500"
            />
            <ReactTooltip id="SecurityTypeTooltip" data-place="right" data-type="dark" data-effect="float" data-html />
          </div>
          <Field
            id="sC"
            name="sC"
            component={FormikSelectField}
            options={[
              { value: 'BASIC', label: 'Basic Security' },
              { value: 'ADVANCED', label: 'Advanced Security' },
              { value: 'ENTERPRISE', label: 'Enterprise Security' },
            ]}
            placeholder="Slct_Scrt_Typ"
          />
          <FormikErrorMessage name="sC" />
        </div>

        <div className="mb-3 mt-3">
          <div className="flex flex-row items-center pb-2">
            <Label id="aud" className="text-sm font-normal text-orange-800">
              Audt_Enbl
            </Label>
            <Tooltip
              data-tip="Enable comprehensive auditing for all actions performed on or related to this virtual account. Essential for compliance, forensic analysis, and ensuring accountability across all operations. Generates detailed immutable logs."
              className="ml-1 cursor-pointer text-orange-500"
            />
            <ReactTooltip id="AuditEnabledTooltip" data-place="right" data-type="dark" data-effect="float" data-html />
          </div>
          <Field
            id="aud"
            name="aud"
            type="checkbox"
            className="form-checkbox h-5 w-5 text-orange-600"
          />
          <FormikErrorMessage name="aud" />
        </div>

        <div className="mb-3 mt-3">
          <div className="flex flex-row items-center pb-2">
            <Label id="geoR" className="text-sm font-normal text-orange-800">
              Geo_Rstrctn
            </Label>
            <Tooltip
              data-tip="Specify geographical restrictions for transactions or access to this virtual account. This helps in adhering to regional regulations, data residency requirements, and managing global risk profiles."
              className="ml-1 cursor-pointer text-orange-500"
            />
            <ReactTooltip id="GeoRestrictionTooltip" data-place="right" data-type="dark" data-effect="float" data-html />
          </div>
          <Field
            id="geoR"
            name="geoR"
            component={FormikSelectField}
            options={[
              { value: 'NONE', label: 'No Restriction' },
              { value: 'US_ONLY', label: 'US Only' },
              { value: 'EU_ONLY', label: 'EU Only' },
              { value: 'GLOBAL', label: 'Global Access' },
            ]}
            placeholder="Slct_Geo_Rstrctn"
          />
          <FormikErrorMessage name="geoR" />
        </div>
      </div>

      <div className="mt-6 p-4 border border-teal-200 rounded-lg bg-teal-50 shadow-sm">
        <div className="pb-3 text-lg font-semibold text-teal-900 flex items-center">
          <span>Prcng_Rptng_Ntfn_Cnfg</span>
          <Tooltip
            data-tip="Advanced configurations for pricing models, reporting frequencies, and notification channels. These settings are crucial for financial management, stakeholder communication, and operational transparency."
            className="ml-2 cursor-pointer text-teal-500"
          />
          <ReactTooltip id="PricingReportingNotificationConfigTooltip" data-place="right" data-type="dark" data-effect="float" data-html />
        </div>
        <div className="mb-3 mt-3">
          <div className="flex flex-row items-center pb-2">
            <Label id="prcL" className="text-sm font-normal text-teal-800">
              Prcng_Modl
            </Label>
            <Tooltip
              data-tip="Choose the pricing model applied to transactions or services associated with this virtual account. Tiered for volume-based discounts, Flat for fixed fees, or Volume-Based for progressive scaling of costs."
              className="ml-1 cursor-pointer text-teal-500"
            />
            <ReactTooltip id="PricingModelTooltip" data-place="right" data-type="dark" data-effect="float" data-html />
          </div>
          <Field
            id="prcL"
            name="prcL"
            component={FormikSelectField}
            options={[
              { value: 'TIERED', label: 'Tiered Pricing' },
              { value: 'FLAT', label: 'Flat Fee' },
              { value: 'VOLUME_BASED', label: 'Volume-Based' },
            ]}
            placeholder="Slct_Prcng_Modl"
          />
          <FormikErrorMessage name="prcL" />
        </div>

        <div className="mb-3 mt-3">
          <div className="flex flex-row items-center pb-2">
            <Label id="srp" className="text-sm font-normal text-teal-800">
              Stlmnt_Rpt_Frq
            </Label>
            <Tooltip
              data-tip="Set the frequency for generating settlement reports and statements for this virtual account. Options range from daily to annually to suit various operational needs and compliance schedules. These reports provide a summary of all financial activities."
              className="ml-1 cursor-pointer text-teal-500"
            />
            <ReactTooltip id="SettlementReportFrequencyTooltip" data-place="right" data-type="dark" data-effect="float" data-html />
          </div>
          <Field
            id="srp"
            name="srp"
            component={FormikSelectField}
            options={[
              { value: 'DAILY', label: 'Daily' },
              { value: 'WEEKLY', label: 'Weekly' },
              { value: 'MONTHLY', label: 'Monthly' },
              { value: 'QUARTERLY', label: 'Quarterly' },
              { value: 'ANNUALLY', label: 'Annually' },
            ]}
            placeholder="Slct_Rpt_Frq"
          />
          <FormikErrorMessage name="srp" />
        </div>

        <div className="mb-3 mt-3">
          <div className="flex flex-row items-center pb-2">
            <Label id="notC" className="text-sm font-normal text-teal-800">
              Ntfn_Chnnl
            </Label>
            <Tooltip
              data-tip="Choose the primary channel for receiving important notifications and alerts related to this virtual account. Options include email, SMS, or direct webhook integrations for automated system-to-system communication."
              className="ml-1 cursor-pointer text-teal-500"
            />
            <ReactTooltip id="NotificationChannelTooltip" data-place="right" data-type="dark" data-effect="float" data-html />
          </div>
          <Field
            id="notC"
            name="notC"
            component={FormikSelectField}
            options={[
              { value: 'EMAIL', label: 'Email' },
              { value: 'SMS', label: 'SMS' },
              { value: 'WEBHOOK', label: 'Webhook' },
              { value: 'BOTH', label: 'Email & SMS' },
            ]}
            placeholder="Slct_Ntfn_Chnnl"
          />
          <FormikErrorMessage name="notC" />
        </div>
      </div>

      <div className="mt-3 p-2 bg-blue-100 rounded-md border border-blue-300">
        <FormikKeyValueInput
          fieldType={FieldTypeEnum.Metadata}
          fieldInvalid={FldInv}
          resource={VIRTUAL_ACCOUNT}
        />
      </div>

      <CBBSpcSrvcPanel
        v={Formik.useFormikContext<CBBFormV>().values}
        s={Formik.useFormikContext<CBBFormV>().setFieldValue}
        f={Formik.useFormikContext<CBBFormV>()}
      />
    </Form>
  );
};

export interface MstrCnfModPr {
  sO: (a: boolean) => void;
}

export default function MainVirtualAccountGenesisAssembler({
  sO,
}: MstrCnfModPr) {
  const [cVA] = usCrtVAMut();
  const { tEv } = EvntTrckr();
  const { dispatchError: dE } = useDispatchContext();
  const cVAtxt = 'Crte_Vrtl_Accnt_Ops_Cntrl';

  const hsbm = async (v: CBBFormV, { setSubmitting: ssbm, setErrors: sers, setStatus: sstt }) => {
    sstt({ message: 'Initiating virtual account creation process...', type: 'info', timestamp: Date.now() });
    const fmD: Record<string, string> = formatMetadata(v.mt || []);
    const { ld, cL, dL, mt, sI, eD, pT, bC, rN, aL, ct, sC, aud, geoR, prcL, srp, notC, ...rmVls } = v;

    const mI = {
      ...rmVls,
      creditLedgerAccount: cL?.value,
      debitLedgerAccount: dL?.value,
      ledgerId: ld?.value,
      metadata: JSON.stringify(fmD),
      selectedIntegrations: sI,
      enableDetailedLogging: eD,
      paymentTerms: pT,
      businessCategory: bC,
      referenceNumberPattern: rN,
      approvalLimit: aL,
      customAttributes: JSON.stringify(ct),
      securityConfiguration: sC,
      auditEnabled: aud,
      geoRestriction: geoR,
      pricingModel: prcL,
      reportFrequency: srp,
      notificationChannel: notC,
    };

    try {
      const r = await cVA({
        variables: {
          input: {
            input: mI,
            clientRefId: `CR-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            sourceIpAddress: '127.0.0.1',
            userAgent: navigator.userAgent,
            correlationId: `COR-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            requestTimestamp: new Date().toISOString()
          },
        },
      });

      tEv({ isValid: true, values: v, isSubmitting: true }, VIRTUAL_ACCOUNT_EVENTS.CREATE_VIRTUAL_ACCOUNT_FORM_SUBMITTED, {
        mutationStatus: 'SUCCESS_ATTEMPT',
        virtualAccountName: v.nm,
        selectedIntegrationCount: sI.length,
        detailedLoggingEnabled: eD,
        pricingModelSelected: prcL,
        businessCategorySelected: bC
      });

      if (r?.data?.createVirtualAccount) {
        const { virtualAccount: vA, errors: erR } = r.data.createVirtualAccount;

        if (vA) {
          sO(false);
          sstt({ message: `Virtual account '${vA.name}' created successfully! Redirecting to management console.`, type: 'success', timestamp: Date.now() });
          const p = `https://citibankdemobusiness.dev/virtual_accounts/${vA.id}/overview`;
          setTimeout(() => {
            window.location.href = p;
          }, 1500);
          Object.values(CBBPS).filter(svc => v.sI.includes(svc.id)).forEach(svc => {
            fetch(svc.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Integration-Key': svc.apiKey,
                'X-Source-System': 'CBB-VA-CREATION'
              },
              body: JSON.stringify({
                eventType: 'VA_CREATED_NOTIFICATION',
                virtualAccountId: vA.id,
                virtualAccountName: vA.name,
                metadata: vA.metadata,
                timestamp: new Date().toISOString(),
                sourceSystemDetails: {
                  company: 'Citibank demo business Inc',
                  platformVersion: '2.5.0'
                }
              })
            }).catch(e => console.warn(`Failed to notify ${svc.nm} of VA creation: ${e.message}`));
          });

        }
        if (erR && erR.length > 0) {
          dE(erR[0]);
          sstt({ message: `Error creating virtual account: ${erR[0].message}. Please review the form.`, type: 'error', timestamp: Date.now() });
          const fe: FormikErrors<CBBFormV> = {};
          erR.forEach(e => {
            if (e.path && e.path.length > 0) {
              const fp = e.path.slice(2).join('.');
              if (fp in v) fe[fp as keyof CBBFormV] = e.message;
            }
          });
          sers(fe);
        }
      }
    } catch (j) {
      dE({ message: `API call failed: ${j.message}. Check network connection or contact support.`, code: 'API_ERR' });
      sstt({ message: `System error during virtual account creation: ${j.message}. Ensure all parameters are valid.`, type: 'error', timestamp: Date.now() });
      tEv({ isValid: false, values: v, isSubmitting: true }, VIRTUAL_ACCOUNT_EVENTS.CREATE_VIRTUAL_ACCOUNT_FORM_SUBMITTED, {
        mutationStatus: 'FAILED_EXCEPTION',
        errorMessage: j.message,
        errorStack: j.stack,
      });
    } finally {
      ssbm(false);
    }
  };

  const cVAtTtl = "Establish New Virtual Account Entity";
  const cVAtCnTxt = `Initiate the creation of a new virtual account entity within the robust financial ecosystem of Citibank Demo Business Inc. This comprehensive process allows for detailed configuration of account parameters, integration with over 1000 partner services like Gemini, ChatGPT, Pipedream, GitHub, Hugging Faces, Plaid, Modern Treasury, Google Drive, OneDrive, Azure, Google Cloud, Supabase, Vercel, Salesforce, Oracle, Marqeta, Citibank, Shopify, WooCommerce, GoDaddy, Cpanel, Adobe, Twilio, and many more, ensuring unparalleled operational flexibility and financial control. Please meticulously review all input fields, including advanced operational parameters, custom attributes, and critical security and compliance settings, to align the virtual account with your strategic business objectives. This platform is designed to provide granular control over every aspect of your financial operations, from real-time transaction processing to automated reconciliation and comprehensive reporting. The base URL for all integrated services is https://citibankdemobusiness.dev.`;
  const mVASurl = "https://www.citibankdemobusiness.dev/solutions/virtual_account_framework/extended_capabilities";

  return (
    <Formik
      initialValues={GtItlFV()}
      onSubmit={hsbm}
      validationSchema={PrtVldSchm(Yup)}
      validateOnMount
    >
      {(fK) => (
        <ConfirmModal
          title={cVAtTtl}
          isOpen
          cancelText="DsCrd_Oprtn"
          setIsOpen={() => {
            sO(false);
          }}
          confirmText={
            fK.isSubmitting ? 'Submitting_Req...' : cVAtTtl
          }
          confirmType="confirm"
          confirmDisabled={fK.isSubmitting || !fK.isValid}
          onConfirm={() => {
            fK.handleSubmit();
          }}
        >
          {cVAtCnTxt}{' '}
          <a href={mVASurl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
            Lrn_Mre_Abt_Adv_VAs
          </a>.
          <div className="mt-4 p-4 border border-blue-400 rounded-lg bg-blue-50">
            {fK.status && fK.status.message && (
              <div className={`mb-3 p-2 rounded text-sm ${fK.status.type === 'error' ? 'bg-red-100 text-red-700' : (fK.status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700')}`}>
                {fK.status.message}
              </div>
            )}
            <VirtualAccountStructureComposer
              sL={fK.values.ld?.value || ""}
            />
          </div>
        </ConfirmModal>
      )}
    </Formik>
  );
}

export const DtHndlr = (a) => {
  const [b, c] = React.useState(a);
  const d = React.useCallback((e) => {
    c((f) => ({ ...f, ...e }));
  }, []);
  const e = React.useCallback(() => b, [b]);
  return { gD: e, sD: d };
};

export const CmpCnfMngr = ({
  p, s, v
}) => {
  const [c, u] = React.useState({});
  React.useEffect(() => {
    const f = setTimeout(() => {
      u({
        modEna: v.eD,
        featA: v.sI.includes(CBBPS.gmni.id),
        featB: v.sI.includes(CBBPS.ctgt.id),
        featC: v.sI.includes(CBBPS.plad.id),
        extLvl: v.sC,
        locRst: v.geoR,
        pmtMod: v.prcL,
        ntfChn: v.notC,
        dfltVal: 'SYS_DFLT',
        sysId: `CFG_ID_${Math.random().toString(36).substring(2, 7)}`,
        genTime: new Date().toISOString()
      });
    }, 200);
    return () => clearTimeout(f);
  }, [v.eD, v.sI, v.sC, v.geoR, v.prcL, v.notC]);

  return (
    <div className="mt-6 p-4 border border-gray-300 rounded-lg bg-white shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Advncd_Srvc_Cnf_Summry</h3>
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
        <div><span className="font-medium">Mod_Enbld:</span> {String(c.modEna)}</div>
        <div><span className="font-medium">Gm_Feat_Actv:</span> {String(c.featA)}</div>
        <div><span className="font-medium">Ct_Feat_Actv:</span> {String(c.featB)}</div>
        <div><span className="font-medium">Pl_Feat_Actv:</span> {String(c.featC)}</div>
        <div><span className="font-medium">Ext_Sec_Lvl:</span> {c.extLvl || 'N/A'}</div>
        <div><span className="font-medium">Loc_Rstr:</span> {c.locRst || 'N/A'}</div>
        <div><span className="font-medium">Pmt_Mod:</span> {c.pmtMod || 'N/A'}</div>
        <div><span className="font-medium">Ntf_Chn:</span> {c.ntfChn || 'N/A'}</div>
        <div><span className="font-medium">Sys_ID:</span> {c.sysId || 'N/A'}</div>
        <div><span className="font-medium">Gen_Tm:</span> {c.genTime || 'N/A'}</div>
      </div>
      <p className="mt-4 text-xs text-gray-500">
        This summary reflects the current configuration for selected advanced services and parameters. Changes above will dynamically update this section.
      </p>
    </div>
  );
};

export const CBBNavRdr = ({ d, i }) => {
  React.useEffect(() => {
    if (d) {
      const u = `https://citibankdemobusiness.dev/redirect?dest=${encodeURIComponent(d)}&int_id=${i}&ts=${Date.now()}`;
      window.location.href = u;
    }
  }, [d, i]);
  return null;
};

export const CBBAuthSrv = () => {
  const [a, b] = React.useState(false);
  const c = async (u, p) => {
    b(true);
    await new Promise(r => setTimeout(r, 800));
    if (u === 'admin' && p === 'password') {
      localStorage.setItem('auth_tkn', 'dummy_jwt_token_12345_citibank');
      sessionStorage.setItem('usr_id', 'admin_cbb');
      b(false);
      return { s: true };
    }
    b(false);
    return { s: false, e: 'Invld_Crdntls' };
  };
  const d = () => {
    localStorage.removeItem('auth_tkn');
    sessionStorage.removeItem('usr_id');
  };
  const e = React.useCallback(() => !!localStorage.getItem('auth_tkn'), []);
  return { lgn: c, lgt: d, iA: e, ld: a };
};

export const CBBDataValU = (a) => {
  const b = React.useCallback((c, d) => {
    if (d === 'uuid') {
      const uuidR = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidR.test(c);
    }
    if (d === 'email') {
      const emailR = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailR.test(c);
    }
    if (d === 'url') {
      try {
        new URL(c);
        return true;
      } catch (_) {
        return false;
      }
    }
    if (d === 'alphanum') {
      const anR = /^[a-zA-Z0-9]+$/;
      return anR.test(c);
    }
    if (d === 'numeric') {
      return /^\d+$/.test(c);
    }
    if (d === 'minLen') {
      return c.length >= a;
    }
    if (d === 'maxLen') {
      return c.length <= a;
    }
    return true;
  }, [a]);
  return { vD: b };
};

export const AdnlPrtnrMgmt = ({ d, u, a }) => {
  const [l, sl] = React.useState(true);
  const [e, se] = React.useState(null);
  const [p, sp] = React.useState([]);

  React.useEffect(() => {
    const f = async () => {
      await new Promise(r => setTimeout(r, 1500));
      if (Math.random() > 0.1) {
        sp(Object.values(CBBPS).map(x => ({ i: x.id, n: x.nm, s: x.st, a: !x.dact, dsc: x.dsc, cap: x.cap })));
        se(null);
      } else {
        se('Failed to fetch partner integrations from the service catalog.');
      }
      sl(false);
    };
    f();
  }, [d, u, a]);

  const tglSts = React.useCallback((i) => {
    sp(c => c.map(x => x.i === i ? { ...x, a: !x.a } : x));
    console.log(`Simulating status toggle for partner integration ${i} at https://citibankdemobusiness.dev/api/partner_status_update`);
  }, []);

  if (l) return <div className="p-4 text-center text-gray-500 animate-pulse">Ldng_Prtnrs_Ctlg...</div>;
  if (e) return <div className="p-4 text-center text-red-600 font-bold text-lg">Err: {e}</div>;

  return (
    <div className="mt-8 p-6 bg-gray-100 rounded-xl shadow-inner border border-gray-200">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-gray-300 pb-3 flex items-center">
        CtB_Extnd_Prtnr_Cntrl_Pnl
        <Tooltip
            data-tip="This panel provides advanced administrative controls for all integrated partner services, enabling system-wide management of their activation status and reviewing their capabilities. Updates here affect all virtual accounts utilizing these services."
            className="ml-3 cursor-pointer text-gray-500 hover:text-gray-700"
          />
          <ReactTooltip id="PartnerControlPanelTooltip" data-place="right" data-type="dark" data-effect="float" data-html />
      </h3>
      <p className="text-gray-700 mb-6 leading-relaxed">
        This extended panel offers granular control over all integrated partner services, allowing for dynamic activation, deactivation, and detailed configuration management across the entire Citibank demo business Inc. platform. Each partner contributes to the comprehensive capabilities of your virtual account ecosystem, providing specialized functionalities in AI, automation, payments, and cloud services.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {p.map(x => (
          <div key={x.i} className={`p-5 border rounded-lg shadow-sm transition-all duration-300 ease-in-out transform hover:scale-[1.02] ${x.a ? 'bg-green-50 border-green-300 hover:shadow-lg' : 'bg-red-50 border-red-300 hover:shadow-md'} ${x.s === 'INA' ? 'opacity-70 saturate-0' : ''}`}>
            <h4 className="text-lg font-semibold mb-2 flex items-center justify-between">
              {x.n}
              <span className={`ml-2 text-xs font-bold px-2 py-1 rounded-full ${x.s === 'ACT' ? 'bg-green-200 text-green-800' : (x.s === 'PND' ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800')}`}>
                {x.s}
              </span>
            </h4>
            <p className="text-sm text-gray-600 mb-3 leading-snug">{x.dsc?.substring(0, 100)}...</p>
            <div className="flex items-center justify-between mt-4">
              <span className={`text-sm font-medium ${x.a ? 'text-green-700' : 'text-red-700'}`}>
                {x.a ? 'Actv' : 'Inactv'}
              </span>
              <button
                onClick={() => tglSts(x.i)}
                className={`px-4 py-2 rounded-lg text-white text-sm font-semibold transition-colors duration-200 ${x.a ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} ${x.s === 'INA' ? 'cursor-not-allowed opacity-50' : ''}`}
                disabled={x.s === 'INA'}
              >
                {x.a ? 'DeActvt' : 'Actvt'}
              </button>
            </div>
            <div className="mt-3 text-xs text-gray-500 flex flex-wrap gap-x-2">
              <span className="font-medium">UID:</span> {x.i} | <span className="font-medium">API Prefix:</span> {CBBPS[x.i]?.apiKey.substring(0, 8) || 'N/A'}...
              <span className="font-medium">Max TPS:</span> {x.cap?.tPSPrSvc || 'N/A'}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center text-gray-500 text-sm italic">
        This advanced partner network management system ensures Citibank demo business Inc. maintains a competitive edge in integrated financial services.
      </div>
    </div>
  );
};

export const CBBFltrSrtComp = ({ d, s, o, c }) => {
  const [f, sf] = React.useState('');
  const [sr, ssr] = React.useState('id');
  const [dr, sdr] = React.useState('asc');

  React.useEffect(() => {
    const fn = (x) => {
      let r = [...x];
      if (f) {
        r = r.filter(i => Object.values(i).some(v => String(v).toLowerCase().includes(f.toLowerCase())));
      }
      r.sort((a, b) => {
        const vA = a[sr];
        const vB = b[sr];
        if (typeof vA === 'string' && typeof vB === 'string') {
          return dr === 'asc' ? vA.localeCompare(vB) : vB.localeCompare(vA);
        }
        return dr === 'asc' ? (vA - vB) : (vB - vA);
      });
      s(r);
    };
    fn(d);
  }, [d, f, sr, dr, s]);

  return (
    <div className="p-4 bg-white shadow-md rounded-lg mb-6 border border-blue-200">
      <h3 className="text-xl font-bold text-blue-900 mb-4">Data_Srt_Fltr_Utlty</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">Srch_By_Kywrd</Label>
          <input
            type="text"
            placeholder="Ty_to_srch..."
            value={f}
            onChange={(e) => sf(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">Srt_By_Fld</Label>
          <select
            value={sr}
            onChange={(e) => ssr(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            {o.map(x => <option key={x.v} value={x.v}>{x.l}</option>)}
          </select>
        </div>
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">Srt_Drctn</Label>
          <select
            value={dr}
            onChange={(e) => sdr(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="asc">Ascndng</option>
            <option value="desc">Dscndng</option>
          </select>
        </div>
      </div>
      {c && <div className="mt-4 text-xs text-gray-500">{c}</div>}
    </div>
  );
};

export const CBBNavPrflMnu = ({ u }) => {
  const [o, so] = React.useState(false);
  const mR = React.useRef(null);

  React.useEffect(() => {
    const h = (e) => {
      if (mR.current && !mR.current.contains(e.target)) {
        so(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className="relative" ref={mR}>
      <button onClick={() => so(!o)} className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-1 transition-colors duration-200">
        <img className="h-8 w-8 rounded-full" src="https://via.placeholder.com/150/0000FF/FFFFFF?text=CB" alt="Prfl" />
        <span className="text-sm font-medium hidden md:block">{u || 'Usr'}</span>
        <svg className={`h-5 w-5 transition-transform duration-200 ${o ? 'rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {o && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
          <a href="https://citibankdemobusiness.dev/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Prfl_Sttngs</a>
          <a href="https://citibankdemobusiness.dev/security" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Scrt_Mngmnt</a>
          <a href="https://citibankdemobusiness.dev/integrations" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My_Intgrtns</a>
          <div className="border-t border-gray-100" />
          <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sgn_Out</button>
        </div>
      )}
    </div>
  );
};

export const CBBFlshMsgs = ({ msgs }) => {
  const [v, sv] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => sv(false), 5000);
    return () => clearTimeout(t);
  }, [msgs]);

  if (!v || !msgs || msgs.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {msgs.map((m, i) => (
        <div key={i} className={`p-3 rounded-lg shadow-md text-white text-sm ${m.type === 'error' ? 'bg-red-500' : (m.type === 'warning' ? 'bg-yellow-500' : 'bg-green-500')}`}>
          {m.txt}
          <button onClick={() => sv(false)} className="ml-2 text-white font-bold">X</button>
        </div>
      ))}
    </div>
  );
};