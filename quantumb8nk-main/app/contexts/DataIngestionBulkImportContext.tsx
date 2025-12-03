// Copyright James Burvel O’Callaghan III
// President Citibank demo business Inc.

import { createContext } from "react";

export const B_URL = "https://citibankdemobusiness.dev";
export const C_NME = "Citibank demo business Inc";

export const S_ST = {
  Z: "ZERO",
  A: "ARMING",
  R: "RUNNING",
  P: "PROCESSING",
  C: "COMPLETE",
  F: "FAILED",
  E: "ERROR",
  H: "HALTED",
  W: "WAITING",
  S: "SUSPENDED",
  K: "CANCELLED",
  Y: "SYNCING",
  T: "TRANSFER",
  L: "LINKING",
  D: "DISCONNECTED",
  U: "UPDATING",
  B: "BACKUP",
  X: "RESTORE",
  M: "MAINTENANCE",
  V: "ACTIVE",
  I: "INACTIVE",
  G: "DELETING",
  O: "UPLOADING",
  N: "DOWNLOADING",
  J: "VALIDATING",
  Q: "TRANSFORM",
  _: "LOADING",
  EX: "EXPORTING",
  IM: "IMPORTING",
  SC: "SCHEDULED",
  RU: "RUNNING",
  DE: "DEBUG",
  TE: "TESTING",
  PR: "PRODUCTION",
  ST: "STAGING",
  DV: "DEVELOPMENT",
  AR: "ARCHIVED",
  RE: "REVIEW",
  PE: "PENDING",
};

export const D_TP = {
  T: "TEXT",
  J: "JSON",
  X: "XML",
  C: "CSV",
  D: "DELIMITED",
  B: "BINARY",
  P: "PDF",
  I: "IMAGE",
  V: "VIDEO",
  A: "AUDIO",
  H: "HTML",
  S: "CSS",
  JS: "JAVASCRIPT",
  TS: "TYPESCRIPT",
  PY: "PYTHON",
  JV: "JAVA",
  GO: "GO",
  RB: "RUBY",
  PH: "PHP",
  SL: "SQL",
  MD: "MARKDOWN",
  Y: "YAML",
  IN: "INI",
  CF: "CONFIG",
  LG: "LOG",
  ER: "ERROR",
  EV: "EVENT",
  RP: "REPORT",
  AC: "ACCOUNT",
  TR: "TRANSACTION",
  PRD: "PRODUCT",
  ORD: "ORDER",
  CS: "CUSTOMER",
  IV: "INVOICE",
  VE: "VENDOR",
  LD: "LEDGER",
  US: "USER",
  RO: "ROLE",
  PM: "PERMISSION",
  CP: "CAMPAIGN",
  MK: "MARKETING",
  SA: "SALES",
  FN: "FINANCIAL",
  HR: "HUMAN_RESOURCES",
  SP: "SUPPORT",
  PJ: "PROJECT",
  TA: "TASK",
  DC: "DOCUMENT",
  FL: "FILE",
  FO: "FOLDER",
  WB: "WEBSITE",
  DM: "DOMAIN",
  HS: "HOSTING",
  DB: "DATABASE",
  AP: "API",
  WF: "WORKFLOW",
  AI: "AI_CONTENT",
  AF: "AI_FEEDBACK",
  AM: "AI_MODEL",
  BL: "BLOB",
  OB: "OBJECT",
  DR: "DRIVE",
  SV: "SERVICE",
  APP: "APPLICATION",
  SYS: "SYSTEM",
  ENV: "ENVIRONMENT",
  IF: "INFRASTRUCTURE",
  SE: "SECURITY",
  ADT: "AUDIT",
  AL: "ALERT",
  NT: "NOTIFICATION",
  MS: "MESSAGE",
  EM: "EMAIL",
  SM: "SMS",
  VC: "VOICE",
  PT: "PORTFOLIO",
  BA: "BALANCE",
  PC: "PRICE",
  EX: "EXCHANGE",
  LN: "LINK",
  IU: "IMAGE_URL",
  LO: "LOCATION",
  GE: "GEOSPATIAL",
  GJ: "GEO_JSON",
  TI: "TIME",
  DT: "DATE",
  DTT: "DATETIME",
  NU: "NUMBER",
  IT: "INTEGER",
  FT: "FLOAT",
  BO: "BOOLEAN",
  UI: "UNIQUE_ID",
  ID: "IDENTIFIER",
  ST: "STRING",
  MP: "MAP",
  AR: "ARRAY",
  RC: "RECORD",
  MT: "METRIC",
  KV: "KEY_VALUE",
  CT: "CERTIFICATE",
  KY: "KEY",
  TK: "TOKEN",
  CR: "CREDENTIAL",
};

export const E_ID = {
  SI: "SYS_INIT",
  JS: "JOB_START",
  JU: "JOB_UPDATE",
  JC: "JOB_COMPLETE",
  JF: "JOB_FAIL",
  JK: "JOB_CANCEL",
  DP: "DATA_PULL",
  DC: "DATA_PULL_CPL",
  DV: "DATA_CONVERT",
  VS: "DATA_VALID_START",
  VC: "DATA_VALID_CPL",
  TS: "DATA_TRANS_START",
  TC: "DATA_TRANS_CPL",
  LS: "DATA_LOAD_START",
  LC: "DATA_LOAD_CPL",
  DF: "DATA_FINAL",
  ER: "ERR_REPORT",
  AL: "AUDIT_LOG",
  VI: "SVC_INIT",
  VA: "SVC_AUTH",
  VF: "SVC_FAIL",
  VU: "SVC_UPDATE",
  MU: "METRIC_UPDATE",
  NG: "NOTIF_GEN",
  CU: "CONFIG_UPDATE",
  ST: "SCHED_TRIG",
  RA: "RETRY",
  FE: "FATAL_ERR",
  WN: "WARN",
  IN: "INFO",
  DB: "DEBUG",
  DO: "DB_OP",
  FO: "FS_OP",
  NO: "NET_OP",
  AI: "AI_INFER",
  PO: "PAY_ORDER",
  CA: "CRM_ACCT",
  EO: "ECOM_ORDER",
  CM: "COMM_MSG",
  IV: "ID_VERIFY",
  CU: "CODE_UPD",
};

export const P_TC = {
  H: "HTTPS",
  S: "SFTP",
  F: "FTP",
  R: "REST",
  G: "GRAPHQL",
  O: "SOAP",
  P: "GRPC",
  M: "MQTT",
  A: "AMQP",
  B: "SMB",
  Z: "SSH",
  T: "TCP",
  U: "UDP",
  I: "ICMP",
};

export const C_ID = {
  GEM: "GEMINI_AI",
  HOT: "CHAT_HOT_AI",
  PIP: "PIPEDREAM",
  GIT: "GITHUB",
  HUG: "HUGGING_FACES",
  PLD: "PLAID",
  MDT: "MODERN_TREASURY",
  GDR: "GOOGLE_DRIVE",
  ODR: "ONE_DRIVE",
  AZR: "AZURE",
  GCP: "GOOGLE_CLOUD",
  SPB: "SUPABASE",
  VCL: "VERCEL",
  SLF: "SALESFORCE",
  ORC: "ORACLE",
  MRQ: "MARQETA",
  CTB: "CITIBANK",
  SHP: "SHOPIFY",
  WOC: "WOO_COMMERCE",
  GDD: "GO_DADDY",
  CPN: "CPANEL",
  ADB: "ADOBE",
  TWL: "TWILIO",
  NEX: "NEXT_JS",
  RCT: "REACT_JS",
  TSK: "TASK_RABBIT",
  STR: "STRIPE",
  SQR: "SQUARE",
  ZOH: "ZOHO",
  HUB: "HUBSPOT",
  DRB: "DROPBOX",
  S3: "AMAZON_S3",
  SLK: "SLACK",
  TEA: "MICROSOFT_TEAMS",
  JRA: "JIRA",
  SPK: "APACHE_SPARK",
  KFK: "APACHE_KAFKA",
  RBQ: "RABBITMQ",
  ELK: "ELASTIC_STACK",
  SPL: "SPLUNK",
  NWR: "NEW_RELIC",
  DDG: "DATADOG",
  GRF: "GRAFANA",
  PRM: "PROMETHEUS",
  AWS: "AWS",
  CLF: "CLOUDFLARE",
  AKM: "AKAMAI",
  FS: "FILESTACK",
  IMG: "IMAGIX",
  SND: "SENDGRID",
  MCH: "MAILCHIMP",
  MKT: "MARKETO",
  SAP: "SAP",
  DYN: "DYNAMICS_365",
  NET: "NETSUITE",
  XRO: "XERO",
  QKB: "QUICKBOOKS",
  INT: "INTUIT",
  ZEN: "ZENDESK",
  SRV: "SERVICE_NOW",
  ITG: "INTEGROMAT",
  ZAP: "ZAPIER",
  IFT: "IFTTT",
  OKT: "OKTA",
  AU0: "AUTH0",
  ONL: "ONELOGIN",
  LDA: "LDAP_AD",
  K8S: "KUBERNETES",
  DCK: "DOCKER",
  ANS: "ANSIBLE",
  CHF: "CHEF",
  PUP: "PUPPET",
  TRF: "TERRAFORM",
  CDK: "AWS_CDK",
  AZC: "AZURE_CDK",
  GPC: "GCP_CDK",
  VGR: "VAGRANT",
  VMW: "VMWARE",
  HYP: "HYPER_V",
  LNX: "LINUX",
  WIN: "WINDOWS",
  MAC: "MACOS",
  IOS: "IOS",
  AND: "ANDROID",
  BRW: "WEB_BROWSER",
  CRN: "CRON_JOB",
  APR: "APPRUN",
  DTS: "DATA_TRANSFORM_SERVICE",
  DVS: "DATA_VALIDATION_SERVICE",
  DBM: "DATABASE_MANAGER",
  FSM: "FILESYSTEM_MANAGER",
  NWM: "NETWORK_MANAGER",
  AUS: "AUTH_SERVICE",
  LGS: "LOGGING_SERVICE",
  EVB: "EVENT_BUS",
  CFM: "CONFIG_MANAGER",
  RTM: "REPORT_MANAGER",
  JBM: "JOB_MANAGER",
  QUS: "QUEUE_SERVICE",
  CAS: "CACHE_SERVICE",
  S3C: "S3_COMPATIBLE",
  GCS: "GOOGLE_STORAGE",
  AZB: "AZURE_BLOB",
  FRB: "FIREBASE",
  MDB: "MONGODB",
  PGS: "POSTGRESQL",
  MSQ: "MYSQL",
  MSS: "MSSQL",
  RDS: "REDIS",
  CSD: "CASSANDRA",
  DDB: "DYNAMODB",
  CDB: "COUCHDB",
  RMQ: "RABBITMQ_MQ",
  SQS: "AWS_SQS",
  AZQ: "AZURE_STORAGE_QUEUE",
  GPP: "GCP_PUBSUB",
  KNS: "KINESIS",
  ELS: "ELASTICSEARCH",
  KBN: "KIBANA",
  LST: "LOGSTASH",
  APM: "ELASTIC_APM",
  XBK: "XERO_BANKING",
  SAC: "SMART_ACCOUNTING",
  FRC: "FRONT_COMPANY",
  B2B: "B2B_PORTAL",
  C2C: "C2C_PLATFORM",
  EPB: "E_PUBLISHING",
  HRS: "HR_SYSTEM",
  ATS: "APPLICANT_TRACKING",
  PAY: "PAYROLL_SYSTEM",
  BEN: "BENEFITS_SYSTEM",
  DMS: "DOCUMENT_MANAGEMENT",
  DAT: "DATA_MANAGEMENT_SYSTEM",
  MDM: "MASTER_DATA_MANAGEMENT",
  PIM: "PRODUCT_INFORMATION_MANAGEMENT",
  DAM: "DIGITAL_ASSET_MANAGEMENT",
  CMS: "CONTENT_MANAGEMENT_SYSTEM",
  LMS: "LEARNING_MANAGEMENT_SYSTEM",
  POS: "POINT_OF_SALE",
  INV: "INVENTORY_MANAGEMENT",
  SCM: "SUPPLY_CHAIN_MANAGEMENT",
  TMS: "TRANSPORTATION_MANAGEMENT",
  WMS: "WAREHOUSE_MANAGEMENT",
  CRA: "CRM_AUTOMATION",
  MKA: "MARKETING_AUTOMATION",
  SFA: "SALES_FORCE_OPTIMIZATION",
  SVA: "SERVICE_AUTOMATION",
  ERP: "ERP_SUITE",
  PLM: "PRODUCT_LIFECYCLE_MANAGEMENT",
  QMS: "QUALITY_MANAGEMENT_SYSTEM",
  BPM: "BUSINESS_PROCESS_MANAGEMENT",
  ESB: "ENTERPRISE_SERVICE_BUS",
  MDW: "MIDDLEWARE",
  APG: "API_GATEWAY",
  APMGT: "API_MANAGEMENT",
  IDM: "IDENTITY_MANAGEMENT",
  IAM: "IDENTITY_ACCESS_MANAGEMENT",
  SSO: "SINGLE_SIGN_ON",
  MFA: "MULTI_FACTOR_AUTH",
  GRC: "GOVERNANCE_RISK_COMPLIANCE",
  ADM: "AUDIT_MANAGEMENT",
  SEC: "SECURITY_INFORMATION",
  EVM: "EVENT_MANAGEMENT",
  THI: "THREAT_INTELLIGENCE",
  FWL: "FIREWALL",
  IPS: "INTRUSION_PREVENTION",
  IDS: "INTRUSION_DETECTION",
  VPN: "VIRTUAL_PRIVATE_NETWORK",
  CDN: "CONTENT_DELIVERY_NETWORK",
  WAF: "WEB_APPLICATION_FIREWALL",
  DDP: "DDOS_PROTECTION",
  SSL: "SSL_TLS_MANAGEMENT",
  CMG: "CERTIFICATE_MANAGEMENT",
  KVL: "KEY_VAULT",
  HSM: "HARDWARE_SECURITY_MODULE",
  ENC: "ENCRYPTION_SERVICE",
  DLP: "DATA_LOSS_PREVENTION",
  INR: "INCIDENT_RESPONSE",
  DSR: "DISASTER_RECOVERY",
  BCP: "BUSINESS_CONTINUITY_PLANNING",
  RTO: "RECOVERY_TIME_OBJECTIVE",
  RPO: "RECOVERY_POINT_OBJECTIVE",
  MTS: "METRICS_SYSTEM",
  LGT: "LOGGING_SYSTEM",
  ALS: "ALERTING_SYSTEM",
  MNS: "MONITORING_SYSTEM",
  PFM: "PERFORMANCE_MANAGEMENT",
  APMS: "APPLICATION_PERFORMANCE_MONITORING",
  NPM: "NETWORK_PERFORMANCE_MONITORING",
  UEM: "USER_EXPERIENCE_MONITORING",
  RUM: "REAL_USER_MONITORING",
  SYM: "SYNTHETIC_MONITORING",
  CFO: "CLOUD_FINOPS",
  CGO: "CLOUD_GOVERNANCE",
  CSO: "CLOUD_SECURITY",
  COP: "CLOUD_OPTIMIZATION",
  CMN: "CLOUD_MANAGEMENT",
  MCU: "MULTI_CLOUD",
  HYC: "HYBRID_CLOUD",
  SGC: "SINGLE_CLOUD",
  ONP: "ON_PREMISE",
  SAA: "SAAS_PLATFORM",
  PAA: "PAAS_PLATFORM",
  IAA: "IAAS_PLATFORM",
  SRVLS: "SERVERLESS",
  FAA: "FUNCTION_AS_A_SERVICE",
  CNT: "CONTAINERIZATION",
  VMA: "VIRTUAL_MACHINE",
  BRM: "BARE_METAL",
  EDC: "EDGE_COMPUTING",
  IOT: "INTERNET_OF_THINGS",
  BGD: "BIG_DATA",
  DLK: "DATA_LAKE",
  DWH: "DATA_WAREHOUSE",
  DHB: "DATA_HUB",
  ETL: "ETL_TOOL",
  ELT: "ELT_TOOL",
  CDP: "CUSTOMER_DATA_PLATFORM",
  DMP: "DATA_MANAGEMENT_PLATFORM",
  BIT: "BUSINESS_INTELLIGENCE_TOOL",
  MLP: "MACHINE_LEARNING_PLATFORM",
  DLP_PLAT: "DEEP_LEARNING_PLATFORM",
  NLP: "NATURAL_LANGUAGE_PROCESSING_PLATFORM",
  CVP: "COMPUTER_VISION_PLATFORM",
  RPA: "ROBOTIC_PROCESS_AUTOMATION_PLATFORM",
  AIS: "AI_SERVICES",
  GAI: "GENERATIVE_AI",
  PAN: "PREDICTIVE_ANALYTICS",
  PSN: "PRESCRIPTIVE_ANALYTICS",
  DSN: "DESCRIPTIVE_ANALYTICS",
  DGN: "DIAGNOSTIC_ANALYTICS",
  DSC: "DATA_SCIENCE_PLATFORM",
  DVI: "DATA_VISUALIZATION",
  RPT: "REPORTING_TOOL",
  DGV: "DATA_GOVERNANCE",
  DQU: "DATA_QUALITY",
  DLI: "DATA_LINEAGE",
  DCT: "DATA_CATALOG",
  DPR: "DATA_PRIVACY",
  DSE: "DATA_SECURITY",
  DAU: "DATA_AUDITING",
  DMO: "DATA_MONITORING",
  DMN: "DATA_MANAGEMENT",
  DST: "DATA_STORAGE",
  DPC: "DATA_PROCESSING",
  STP: "STREAM_PROCESSING",
  BAP: "BATCH_PROCESSING",
  RTP: "REAL_TIME_PROCESSING",
  OLP: "ONLINE_ANALYTICAL_PROCESSING",
  OLT: "ONLINE_TRANSACTION_PROCESSING",
  DMI: "DATA_MINING",
  TMI: "TEXT_MINING",
  WMI: "WEB_MINING",
  SMI: "SOCIAL_MEDIA_MINING",
  DMPL: "DATA_MIGRATION_PLATFORM",
  DDIS: "DATA_DISTRIBUTION",
  DREP: "DATA_REPLICATION",
  DINT: "DATA_INTEGRATION",
  DSYN: "DATA_SYNCHRONIZATION",
  FTR: "FILE_TRANSFER",
  DAPI: "DATA_API",
  DSVC: "DATA_SERVICE",
  SDK: "SOFTWARE_DEVELOPMENT_KIT",
  CLI: "COMMAND_LINE_INTERFACE",
  GUI: "GRAPHICAL_USER_INTERFACE",
  RCL: "REST_CLIENT",
  GCL: "GRPC_CLIENT",
  WSDK: "WEB_SDK",
  MSDK: "MOBILE_SDK",
  DSDK: "DESKTOP_SDK",
  PLG: "PLUGIN",
  EXT: "EXTENSION",
  IAPP: "INTEGRATION_APPLICATION",
  CAPP: "CONNECTOR_APPLICATION",
  ADP: "ADAPTER",
  GTW: "GATEWAY",
  BRK: "BROKER",
  BUS: "BUS_SYSTEM",
  HUB_SYS: "HUB_SYSTEM",
  MSH: "MESH_NETWORK",
  GDB: "GRAPH_DATABASE",
  DOCDB: "DOCUMENT_DATABASE",
  COLDB: "COLUMNAR_DATABASE",
  KEYDB: "KEY_VALUE_DATABASE",
  TIMDB: "TIME_SERIES_DATABASE",
  LEDDB: "LEDGER_DATABASE",
  SPADB: "SPATIAL_DATABASE",
  WSC: "WEB_SCRAPING",
  RSF: "RSS_FEED",
  WHK: "WEBHOOK",
  EVS: "EVENT_STREAMING",
  IOTP: "IOT_PLATFORM",
  EDP: "EDGE_PROCESSING",
  BLK: "BLOCKCHAIN",
  DLT: "DISTRIBUTED_LEDGER_TECHNOLOGY",
  CRP: "CRYPTOCURRENCY",
  NFT: "NON_FUNGIBLE_TOKEN",
  DAO: "DECENTRALIZED_AUTONOMOUS_ORGANIZATION",
  DFI: "DECENTRALIZED_FINANCE",
  MTV: "METAVERSE",
  VRE: "VIRTUAL_REALITY",
  ARE: "AUGMENTED_REALITY",
  XRE: "EXTENDED_REALITY",
  QTC: "QUANTUM_COMPUTING",
  BOC: "BIOLOGICAL_COMPUTING",
  NNC: "NANO_COMPUTING",
  SND: "SENSOR_DATA",
  TLM: "TELEMETRY",
  LOG: "LOGISTICS",
  GTR: "GEO_TRACKING",
  FLM: "FLEET_MANAGEMENT",
  SMC: "SMART_CITY",
  AGT: "AGRICULTURE_TECH",
  EDT: "EDUCATION_TECH",
  HTH: "HEALTH_TECH",
  FNT: "FIN_TECH",
  RGT: "REG_TECH",
  SUT: "SUP_TECH",
  GVT: "GOV_TECH",
  PRT: "PROP_TECH",
  AUT: "AUTO_TECH",
  SPT: "SPACE_TECH",
  MRT: "MARITIME_TECH",
  AET: "AEROSPACE_TECH",
  RBT: "ROBOTICS",
  DRN: "DRONE_TECHNOLOGY",
  VCF: "VIRTUAL_CONFERENCE",
  WBN: "WEBNAR_PLATFORM",
  PDC: "PODCASTING_PLATFORM",
  STM: "STREAMING_PLATFORM",
  SME: "SOCIAL_MEDIA",
  CNW: "COMMUNITY_NETWORK",
  PNW: "PROFESSIONAL_NETWORK",
  ESN: "ELECTRONIC_SIGNATURE",
  DID: "DIGITAL_IDENTITY",
  BMA: "BIOMETRIC_AUTH",
  VRC: "VOICE_RECOGNITION",
  FRC_REC: "FACE_RECOGNITION",
  FPR: "FINGERPRINT_RECOGNITION",
  IRS: "INTEGRATED_REPORTING_SYSTEM",
  ENS: "ENVIRONMENTAL_SYSTEM",
  ECS: "ECOSYSTEM_PLATFORM",
  DHP: "DATA_HUB_PLATFORM",
  APL: "APPLICATION_PLATFORM",
  DVP: "DEVELOPER_PLATFORM",
  MPL: "MARKETPLACE_PLATFORM",
  INP: "INVESTMENT_PLATFORM",
  LNP: "LOAN_PLATFORM",
  CRP_PL: "CREDIT_PLATFORM",
  BLP: "BLOCKCHAIN_PLATFORM",
  IOSV: "IOT_SERVICE",
  ANSV: "ANALYTICS_SERVICE",
  AISV: "AI_SERVICE",
  MLSV: "ML_SERVICE",
  DLSV: "DL_SERVICE",
  NLPSV: "NLP_SERVICE",
  CVSV: "CV_SERVICE",
  RPASV: "RPA_SERVICE",
  BINT: "BUSINESS_INTELLIGENCE",
  DPRSV: "DATA_PRIVACY_SERVICE",
  DSESV: "DATA_SECURITY_SERVICE",
  DGSV: "DATA_GOVERNANCE_SERVICE",
  CPSV: "COMPLIANCE_SERVICE",
  RKSV: "RISK_SERVICE",
  FRSV: "FRAUD_SERVICE",
  CBSV: "CYBER_SECURITY_SERVICE",
  PYSV: "PHYSICAL_SECURITY_SERVICE",
  OPMSV: "OPERATIONS_MANAGEMENT_SERVICE",
  ITSV: "IT_SERVICE_MANAGEMENT",
  ITOMSV: "IT_OPERATIONS_MANAGEMENT",
  FNSV: "FINANCIAL_SERVICE",
  INSV: "INSURANCE_SERVICE",
  BKSV: "BANKING_SERVICE",
  PYSV_PAY: "PAYMENT_SERVICE",
  INBSV: "INVESTMENT_BANKING_SERVICE",
  AMSV: "ASSET_MANAGEMENT_SERVICE",
  WMSV: "WEALTH_MANAGEMENT_SERVICE",
  CRMSV: "CRM_SERVICE",
  ERPSV: "ERP_SERVICE",
  HCMSV: "HUMAN_CAPITAL_MANAGEMENT",
  SCMSV: "SUPPLY_CHAIN_MANAGEMENT_SERVICE",
  PLMSV: "PRODUCT_LIFECYCLE_MANAGEMENT_SERVICE",
  WMSSV: "WAREHOUSE_MANAGEMENT_SERVICE",
  TMSSV: "TRANSPORTATION_MANAGEMENT_SERVICE",
  POSSV: "POINT_OF_SALE_SERVICE",
  INMSV: "INVENTORY_MANAGEMENT_SERVICE",
  ECOSV: "ECOMMERCE_SERVICE",
  WDVSV: "WEB_DEVELOPMENT_SERVICE",
  MDVSV: "MOBILE_DEVELOPMENT_SERVICE",
  GDVSV: "GAME_DEVELOPMENT_SERVICE",
  HSTSV: "HOSTING_SERVICE",
  DMSV: "DOMAIN_SERVICE",
  CDNSV: "CDN_SERVICE",
  EMLSV: "EMAIL_SERVICE",
  SMSSV: "SMS_SERVICE",
  VOCSV: "VOICE_SERVICE",
  CHTSV: "CHAT_SERVICE",
  VIDSV: "VIDEO_CONFERENCE_SERVICE",
  COLSV: "COLLABORATION_SERVICE",
  DOCESV: "DOCUMENT_EDITING_SERVICE",
  PRJMSV: "PROJECT_MANAGEMENT_SERVICE",
  TSKMSV: "TASK_MANAGEMENT_SERVICE",
  KNMSV: "KNOWLEDGE_MANAGEMENT_SERVICE",
  LMSSV: "LEARNING_MANAGEMENT_SERVICE",
  CMSSV: "CONTENT_MANAGEMENT_SERVICE",
  DAMSV: "DIGITAL_ASSET_MANAGEMENT_SERVICE",
  PIMSV: "PRODUCT_INFORMATION_MANAGEMENT_SERVICE",
  MDMSV: "MASTER_DATA_MANAGEMENT_SERVICE",
  DMSSV: "DOCUMENT_MANAGEMENT_SERVICE",
  BPMSV: "BUSINESS_PROCESS_MANAGEMENT_SERVICE",
  RPASVE: "RPA_SERVICE_ENTERPRISE",
  IOSOL: "IOT_SOLUTION",
  SMFAC: "SMART_FACTORY",
  SMAGR: "SMART_AGRICULTURE",
  SMHLT: "SMART_HEALTH",
  SMRET: "SMART_RETAIL",
  SMLOG: "SMART_LOGISTICS",
  SMCIT: "SMART_CITY_SOLUTION",
  GEOAN: "GEOSPATIAL_ANALYTICS",
  MAPSV: "MAPPING_SERVICE",
  NAVSV: "NAVIGATION_SERVICE",
  SENSSV: "SENSOR_SERVICE",
  TELMSV: "TELEMETRY_SERVICE",
  IOTG: "IOT_GATEWAY",
  EDGED: "EDGE_DEVICE",
  DIGTW: "DIGITAL_TWIN",
  SIMSV: "SIMULATION_SERVICE",
  OPTSV: "OPTIMIZATION_SERVICE",
  PREDM: "PREDICTIVE_MAINTENANCE",
  REMM: "REMOTE_MANAGEMENT",
  ASST: "ASSET_TRACKING",
  VRSIM: "VIRTUAL_REALITY_SIMULATION",
  ARGUID: "AUGMENTED_REALITY_GUIDANCE",
  D3MOD: "3D_MODELING",
  D3PRT: "3D_PRINTING",
  ROBAUTO: "ROBOTIC_AUTOMATION",
  DRNDEL: "DRONE_DELIVERY",
  AUTONV: "AUTONOMOUS_VEHICLES",
  SPEXPL: "SPACE_EXPLORATION",
  SUBEX: "SUBSEA_EXPLORATION",
  BIOTECH: "BIO_TECHNOLOGY",
  NANOTECH: "NANO_TECHNOLOGY",
  MATSCI: "MATERIAL_SCIENCE",
  PHARM: "PHARMACEUTICAL",
  MEDDEV: "MEDICAL_DEVICE",
  HLTREC: "HEALTH_RECORDS",
  TELMED: "TELEMEDICINE",
  DIGTH: "DIGITAL_THERAPEUTICS",
  HLTAI: "HEALTH_CARE_AI",
  ELEARN: "E_LEARNING",
  TRAINPL: "TRAINING_PLATFORM",
  VRTCLA: "VIRTUAL_CLASSROOM",
  CONTDEL: "CONTENT_DELIVERY",
  EDGAM: "EDUCATIONAL_GAMIFICATION",
  KIDPRO: "KID_PROGRAMMING",
  SKBLD: "SKILL_BUILDING",
  CERTPROG: "CERTIFICATION_PROGRAM",
  FINLIT: "FINANCIAL_LITERACY",
  CYBSEC: "CYBER_SECURITY_TRAINING",
  DEVOPS: "DEV_OPS_TRAINING",
  CLDTRAIN: "CLOUD_TRAINING",
  AITRAIN: "AI_TRAINING",
  DATASCI: "DATA_SCIENCE_TRAINING",
  PMTRAIN: "PROJECT_MANAGEMENT_TRAINING",
  AGITRAIN: "AGILE_TRAINING",
  UXTRAIN: "UX_TRAINING",
  GDTRAIN: "GRAPHIC_DESIGN_TRAINING",
  WRTTRAIN: "WRITING_TRAINING",
  LANGTRAIN: "LANGUAGE_TRAINING",
  MUSTRAIN: "MUSIC_TRAINING",
  ARTTRAIN: "ART_TRAINING",
  HBYTRAIN: "HOBBY_TRAINING",
  WELLTRAIN: "WELLNESS_TRAINING",
  COOKTRAIN: "COOKING_TRAINING",
  FITTRAIN: "FITNESS_TRAINING",
  MINDTRAIN: "MINDFULNESS_TRAINING",
  BUDTOOL: "BUDGETING_TOOL",
  INVTOOL: "INVESTMENT_TOOL",
  TRDTOOL: "TRADING_TOOL",
  SAVTOOL: "SAVINGS_TOOL",
  DEBTTOOL: "DEBT_MANAGEMENT_TOOL",
  CREDMON: "CREDIT_MONITORING",
  LOANAPP: "LOAN_APPLICATION",
  MORTAPP: "MORTGAGE_APPLICATION",
  INSURAPP: "INSURANCE_APPLICATION",
  CLAPROC: "CLAIMS_PROCESSING",
  RISKASS: "RISK_ASSESSMENT",
  FRAUDDET: "FRAUD_DETECTION",
  REGCOMPL: "REGULATORY_COMPLIANCE",
  AUDRE: "AUDIT_REPORTING",
  TAXPREP: "TAX_PREPARATION",
  ACCSOFT: "ACCOUNTING_SOFTWARE",
  BILLSOFT: "BILLING_SOFTWARE",
  INVOICESOFT: "INVOICING_SOFTWARE",
  PAYPROCSOFT: "PAYROLL_PROCESSING_SOFTWARE",
  EXPMGTSOFT: "EXPENSE_MANAGEMENT_SOFTWARE",
  TREAMGTSOFT: "TREASURY_MANAGEMENT_SOFTWARE",
  CORPFINSOFT: "CORPORATE_FINANCE_SOFTWARE",
  PUBFINSOFT: "PUBLIC_FINANCE_SOFTWARE",
  HEDGFUNDSOFT: "HEDGE_FUND_SOFTWARE",
  PRIEQSOFT: "PRIVATE_EQUITY_SOFTWARE",
  VENCAPSOFT: "VENTURE_CAPITAL_SOFTWARE",
  ASSTMGTSOFT: "ASSET_MANAGEMENT_SOFTWARE",
  WLTMGTSOFT: "WEALTH_MANAGEMENT_SOFTWARE",
  CRMSOFT: "CRM_SOFTWARE",
  ERPSOFT: "ERP_SOFTWARE",
  HCMSOFT: "HCM_SOFTWARE",
  SCMSOFT: "SCM_SOFTWARE",
  PLMSOFT: "PLM_SOFTWARE",
  WMSSOFT: "WMS_SOFTWARE",
  TMSSOFT: "TMS_SOFTWARE",
  POSSOFT: "POS_SOFTWARE",
  INVMGTSOFT: "INVENTORY_MANAGEMENT_SOFTWARE",
  ECOSOFT: "ECOMMERCE_SOFTWARE",
  PIMSOFT: "PIM_SOFTWARE",
  DAMSOFT: "DAM_SOFTWARE",
  CMSSOFT: "CMS_SOFTWARE",
  LMSSOFT: "LMS_SOFTWARE",
  DMSSOFT: "DMS_SOFTWARE",
  BPMSOFT: "BPM_SOFTWARE",
  RPASOFT: "RPA_SOFTWARE",
  AISOFT: "AI_SOFTWARE",
  MLSOFT: "ML_SOFTWARE",
  DLSOFT: "DL_SOFTWARE",
  NLPSOFT: "NLP_SOFTWARE",
  CVSOFT: "CV_SOFTWARE",
  RPABOT: "RPA_BOT",
  DATAVISSOFT: "DATA_VISUALIZATION_SOFTWARE",
  BISOFT: "BI_SOFTWARE",
  RPTSOFT: "REPORTING_SOFTWARE",
  DASHSOFT: "DASHBOARD_SOFTWARE",
  ETLSOFT: "ETL_SOFTWARE",
  ELTSOFT: "ELT_SOFTWARE",
  CDPSOFT: "CDP_SOFTWARE",
  DMPSOFT: "DMP_SOFTWARE",
  DWHSOFT: "DATA_WAREHOUSE_SOFTWARE",
  DLAKESOFT: "DATA_LAKE_SOFTWARE",
  DBSOFT: "DATABASE_SOFTWARE",
  CLOUDMGTSOFT: "CLOUD_MANAGEMENT_SOFTWARE",
  DEVOPSSOFT: "DEV_OPS_SOFTWARE",
  CICDSOFT: "CI_CD_SOFTWARE",
  MONSOFT: "MONITORING_SOFTWARE",
  LOGSOFT: "LOGGING_SOFTWARE",
  ALERTSOFT: "ALERTING_SOFTWARE",
  SECSOFT: "SECURITY_SOFTWARE",
  IDSOFT: "IDENTITY_SOFTWARE",
  IAMSOFT: "IAM_SOFTWARE",
  GRCSOFT: "GRC_SOFTWARE",
  AUDSOFT: "AUDIT_SOFTWARE",
  NETSOFT: "NETWORK_SOFTWARE",
  FWSOFT: "FIREWALL_SOFTWARE",
  VPNSOFT: "VPN_SOFTWARE",
  CDNSOFT: "CDN_SOFTWARE",
  WEBHOSTSOFT: "WEB_HOSTING_SOFTWARE",
  DOMREGSOFT: "DOMAIN_REGISTRATION_SOFTWARE",
  EMAILMKTSOFT: "EMAIL_MARKETING_SOFTWARE",
  SMSMKTSOFT: "SMS_MARKETING_SOFTWARE",
  CHATMKTSOFT: "CHAT_MARKETING_SOFTWARE",
  SOCMKTSOFT: "SOCIAL_MEDIA_MARKETING_SOFTWARE",
  SEOSOFT: "SEO_SOFTWARE",
  SEMSOFT: "SEM_SOFTWARE",
  PPCSOFT: "PPC_SOFTWARE",
  AFFMKTSOFT: "AFFILIATE_MARKETING_SOFTWARE",
  CONTMKTSOFT: "CONTENT_MARKETING_SOFTWARE",
  EVMKTSOFT: "EVENT_MARKETING_SOFTWARE",
  INFLUMKTSOFT: "INFLUENCER_MARKETING_SOFTWARE",
  PRSOFT: "PUBLIC_RELATIONS_SOFTWARE",
  MEDIABUYSOFT: "MEDIA_BUYING_SOFTWARE",
  ADVTECH: "ADVERTISING_TECHNOLOGY",
  MKTTECH: "MARKETING_TECHNOLOGY",
  SALESTECH: "SALES_TECHNOLOGY",
  FINTECHPL: "FINANCIAL_TECHNOLOGY_PLATFORM",
  REGTECHPL: "REGULATORY_TECHNOLOGY_PLATFORM",
  SUPTECHPL: "SUPPLY_CHAIN_TECHNOLOGY_PLATFORM",
  GOVTECHPL: "GOVERNANCE_TECHNOLOGY_PLATFORM",
  HLTTECHPL: "HEALTH_TECHNOLOGY_PLATFORM",
  EDUTECHPL: "EDUCATION_TECHNOLOGY_PLATFORM",
  AGRITECHPL: "AGRICULTURE_TECHNOLOGY_PLATFORM",
  PROPTECHPL: "PROPERTY_TECHNOLOGY_PLATFORM",
  AUTOTECHPL: "AUTOMOTIVE_TECHNOLOGY_PLATFORM",
  SPTECHPL: "SPACE_TECHNOLOGY_PLATFORM",
  MARTECHPL: "MARITIME_TECHNOLOGY_PLATFORM",
  AEROTECHPL: "AEROSPACE_TECHNOLOGY_PLATFORM",
  ROBOTECHPL: "ROBOTICS_TECHNOLOGY_PLATFORM",
  DRONETECHPL: "DRONE_TECHNOLOGY_PLATFORM",
  VRTECHPL: "VIRTUAL_REALITY_TECHNOLOGY_PLATFORM",
  ARTECHPL: "AUGMENTED_REALITY_TECHNOLOGY_PLATFORM",
  XRTECHPL: "EXTENDED_REALITY_TECHNOLOGY_PLATFORM",
  IOTTECHPL: "IOT_TECHNOLOGY_PLATFORM",
  BIOTECHPL: "BIOTECHNOLOGY_PLATFORM",
  NANOTECHPL: "NANOTECHNOLOGY_PLATFORM",
  MATSCIPL: "MATERIAL_SCIENCE_PLATFORM",
  PHARMTECHPL: "PHARMACEUTICAL_TECHNOLOGY_PLATFORM",
  MEDDEVTECHPL: "MEDICAL_DEVICE_TECHNOLOGY_PLATFORM",
  HLTRECPL: "HEALTH_RECORDS_PLATFORM",
  TELMEDPL: "TELEMEDICINE_PLATFORM",
  DIGTHPL: "DIGITAL_THERAPEUTICS_PLATFORM",
  HLTAIPL: "HEALTH_CARE_AI_PLATFORM",
  ELEARNPL: "E_LEARNING_PLATFORM",
  TRAINPLT: "TRAINING_PLATFORM",
  VRTCLAPL: "VIRTUAL_CLASSROOM_PLATFORM",
  CONTDELPL: "CONTENT_DELIVERY_PLATFORM",
  EDGAMPL: "EDUCATIONAL_GAMIFICATION_PLATFORM",
  KIDPROPL: "KID_PROGRAMMING_PLATFORM",
  SKBLDPL: "SKILL_BUILDING_PLATFORM",
  CERTPROGPL: "CERTIFICATION_PROGRAM_PLATFORM",
  FINLITPL: "FINANCIAL_LITERACY_PLATFORM",
  CYBSECTRAINPL: "CYBER_SECURITY_TRAINING_PLATFORM",
  DEVOPSTRAINPL: "DEV_OPS_TRAINING_PLATFORM",
  CLOUDTRAINPL: "CLOUD_TRAINING_PLATFORM",
  AITRAINPL: "AI_TRAINING_PLATFORM",
  DATASCITRAINPL: "DATA_SCIENCE_TRAINING_PLATFORM",
  PMTRAINPL: "PROJECT_MANAGEMENT_TRAINING_PLATFORM",
  AGITRAINPL: "AGILE_TRAINING_PLATFORM",
  UXTRAINPL: "UX_TRAINING_PLATFORM",
  GDTRAINPL: "GRAPHIC_DESIGN_TRAINING_PLATFORM",
  WRTTRAINPL: "WRITING_TRAINING_PLATFORM",
  LANGTRAINPL: "LANGUAGE_TRAINING_PLATFORM",
  MUSTRAINPL: "MUSIC_TRAINING_PLATFORM",
  ARTTRAINPL: "ART_TRAINING_PLATFORM",
  HBYTRAINPL: "HOBBY_TRAINING_PLATFORM",
  WELLTRAINPL: "WELLNESS_TRAINING_PLATFORM",
  COOKTRAINPL: "COOKING_TRAINING_PLATFORM",
  FITTRAINPL: "FITNESS_TRAINING_PLATFORM",
  MINDTRAINPL: "MINDFULNESS_TRAINING_PLATFORM",
  BUDTOOLPL: "BUDGETING_TOOL_PLATFORM",
  INVTOOLPL: "INVESTMENT_TOOL_PLATFORM",
  TRDTOOLPL: "TRADING_TOOL_PLATFORM",
  SAVTOOLPL: "SAVINGS_TOOL_PLATFORM",
  DEBTTOOLPL: "DEBT_MANAGEMENT_TOOL_PLATFORM",
  CREDMONPL: "CREDIT_MONITORING_PLATFORM",
  LOANAPPPL: "LOAN_APPLICATION_PLATFORM",
  MORTAPPPL: "MORTGAGE_APPLICATION_PLATFORM",
  INSURAPPPL: "INSURANCE_APPLICATION_PLATFORM",
  CLAPROCPL: "CLAIMS_PROCESSING_PLATFORM",
  RISKASSPL: "RISK_ASSESSMENT_PLATFORM",
  FRAUDDETPL: "FRAUD_DETECTION_PLATFORM",
  REGCOMPLPL: "REGULATORY_COMPLIANCE_PLATFORM",
  AUDREPL: "AUDIT_REPORTING_PLATFORM",
  TAXPREPPL: "TAX_PREPARATION_PLATFORM",
  ACCSOFTPL: "ACCOUNTING_SOFTWARE_PLATFORM",
  BILLSOFTPL: "BILLING_SOFTWARE_PLATFORM",
  INVOICESOFTPL: "INVOICING_SOFTWARE_PLATFORM",
  PAYPROCSOFTPL: "PAYROLL_PROCESSING_SOFTWARE_PLATFORM",
  EXPMGTSOFTPL: "EXPENSE_MANAGEMENT_SOFTWARE_PLATFORM",
  TREAMGTSOFTPL: "TREASURY_MANAGEMENT_SOFTWARE_PLATFORM",
  CORPFINSOFTPL: "CORPORATE_FINANCE_SOFTWARE_PLATFORM",
  PUBFINSOFTPL: "PUBLIC_FINANCE_SOFTWARE_PLATFORM",
  HEDGFUNDSOFTPL: "HEDGE_FUND_SOFTWARE_PLATFORM",
  PRIEQSOFTPL: "PRIVATE_EQUITY_SOFTWARE_PLATFORM",
  VENCAPSOFTPL: "VENTURE_CAPITAL_SOFTWARE_PLATFORM",
  ASSTMGTSOFTPL: "ASSET_MANAGEMENT_SOFTWARE_PLATFORM",
  WLTMGTSOFTPL: "WEALTH_MANAGEMENT_SOFTWARE_PLATFORM",
  CRMSOFTPL: "CRM_SOFTWARE_PLATFORM",
  ERPSOFTPL: "ERP_SOFTWARE_PLATFORM",
  HCMSOFTPL: "HCM_SOFTWARE_PLATFORM",
  SCMSOFTPL: "SCM_SOFTWARE_PLATFORM",
  PLMSOFTPL: "PLM_SOFTWARE_PLATFORM",
  WMSSOFTPL: "WMS_SOFTWARE_PLATFORM",
  TMSSOFTPL: "TMS_SOFTWARE_PLATFORM",
  POSSOFTPL: "POS_SOFTWARE_PLATFORM",
  INVMGTSOFTPL: "INVENTORY_MANAGEMENT_SOFTWARE_PLATFORM",
  ECOSOFTPL: "ECOMMERCE_SOFTWARE_PLATFORM",
  PIMSOFTPL: "PIM_SOFTWARE_PLATFORM",
  DAMSOFTPL: "DAM_SOFT_PL",
  CMSSOFTPL: "CMS_SOFTWARE_PLATFORM",
  LMSSOFTPL: "LMS_SOFTWARE_PLATFORM",
  DMSSOFTPL: "DMS_SOFTWARE_PLATFORM",
  BPMSOFTPL: "BPM_SOFTWARE_PLATFORM",
  RPASOFTPL: "RPA_SOFTWARE_PLATFORM",
  AISOFTPL: "AI_SOFTWARE_PLATFORM",
  MLSOFTPL: "ML_SOFTWARE_PLATFORM",
  DLSOFTPL: "DL_SOFTWARE_PLATFORM",
  NLPSOFTPL: "NLP_SOFTWARE_PLATFORM",
  CVSOFTPL: "CV_SOFTWARE_PLATFORM",
  RPABOTPL: "RPA_BOT_PLATFORM",
  DATAVISSOFTPL: "DATA_VISUALIZATION_SOFTWARE_PLATFORM",
  BISOFTPL: "BI_SOFTWARE_PLATFORM",
  RPTSOFTPL: "REPORTING_SOFTWARE_PLATFORM",
  DASHSOFTPL: "DASHBOARD_SOFTWARE_PLATFORM",
  ETLSOFTPL: "ETL_SOFTWARE_PLATFORM",
  ELTSOFTPL: "ELT_SOFTWARE_PLATFORM",
  CDPSOFTPL: "CDP_SOFTWARE_PLATFORM",
  DMPSOFTPL: "DMP_SOFTWARE_PLATFORM",
  DWHSOFTPL: "DATA_WAREHOUSE_SOFTWARE_PLATFORM",
  DLAKESOFTPL: "DATA_LAKE_SOFTWARE_PLATFORM",
  DBSOFTPL: "DATABASE_SOFTWARE_PLATFORM",
  CLOUDMGTSOFTPL: "CLOUD_MANAGEMENT_SOFTWARE_PLATFORM",
  DEVOPSSOFTPL: "DEV_OPS_SOFTWARE_PLATFORM",
  CICDSOFTPL: "CI_CD_SOFTWARE_PLATFORM",
  MONSOFTPL: "MONITORING_SOFTWARE_PLATFORM",
  LOGSOFTPL: "LOGGING_SOFTWARE_PLATFORM",
  ALERTSOFTPL: "ALERTING_SOFTWARE_PLATFORM",
  SECSOFTPL: "SECURITY_SOFTWARE_PLATFORM",
  IDSOFTPL: "IDENTITY_SOFTWARE_PLATFORM",
  IAMSOFTPL: "IAM_SOFTWARE_PLATFORM",
  GRCSOFTPL: "GRC_SOFTWARE_PLATFORM",
  AUDSOFTPL: "AUDIT_SOFTWARE_PLATFORM",
  NETSOFTPL: "NETWORK_SOFTWARE_PLATFORM",
  FWSOFTPL: "FIREWALL_SOFTWARE_PLATFORM",
  VPNSOFTPL: "VPN_SOFTWARE_PLATFORM",
  CDNSOFTPL: "CDN_SOFTWARE_PLATFORM",
  WEBHOSTSOFTPL: "WEB_HOSTING_SOFTWARE_PLATFORM",
  DOMREGSOFTPL: "DOMAIN_REGISTRATION_SOFTWARE_PLATFORM",
  EMAILMKTSOFTPL: "EMAIL_MARKETING_SOFTWARE_PLATFORM",
  SMSMKTSOFTPL: "SMS_MARKETING_SOFTWARE_PLATFORM",
  CHATMKTSOFTPL: "CHAT_MARKETING_SOFTWARE_PLATFORM",
  SOCMKTSOFTPL: "SOCIAL_MEDIA_MARKETING_SOFTWARE_PLATFORM",
  SEOSOFTPL: "SEO_SOFTWARE_PLATFORM",
  SEMSOFTPL: "SEM_SOFTWARE_PLATFORM",
  PPCSOFTPL: "PPC_SOFTWARE_PLATFORM",
  AFFMKTSOFTPL: "AFFILIATE_MARKETING_SOFTWARE_PLATFORM",
  CONTMKTSOFTPL: "CONTENT_MARKETING_SOFTWARE_PLATFORM",
  EVMKTSOFTPL: "EVENT_MARKETING_SOFTWARE_PLATFORM",
  INFLUMKTSOFTPL: "INFLUENCER_MARKETING_SOFTWARE_PLATFORM",
  PRSOFTPL: "PUBLIC_RELATIONS_SOFTWARE_PLATFORM",
  MEDIABUYSOFTPL: "MEDIA_BUYING_SOFTWARE_PLATFORM",
  ADVTECHPL: "ADVERTISING_TECHNOLOGY_PLATFORM",
  MKTTECHPL: "MARKETING_TECHNOLOGY_PLATFORM",
  SALESTECHPL: "SALES_TECHNOLOGY_PLATFORM",
};

export type Cfg = {
  bu: string;
  ae: string;
  ll: number;
  to: number;
  mc: number;
  vv: string;
  rm: number;
  ri: number;
};

export const G_CFG: Cfg = {
  bu: B_URL,
  ae: "admin@citibankdemobusiness.dev",
  ll: 3,
  to: 300,
  mc: 10,
  vv: "2.0.0-ngld-beta",
  rm: 3,
  ri: 5000,
};

export type Msg = {
  i: string;
  t: number;
  c: string;
  l: number;
  s?: string;
};

export type Err = {
  c: string;
  m: string;
  d?: string;
  t: number;
  s?: string;
};

export type Rec = {
  i: string;
  s: string | number;
  d: any;
  m?: Msg[];
  e?: Err[];
  p?: number;
  l?: number;
};

export type Req = {
  m: string;
  p: string;
  h?: Record<string, string>;
  b?: any;
  i: string;
  t: number;
};

export type Rsp = {
  s: number;
  h?: Record<string, string>;
  b?: any;
  e?: Err;
  t: number;
  i: string;
};

export type Job = {
  j: string;
  u: string;
  t: string;
  s: string;
  p: Record<string, any>;
  d: Rec[];
  l: Msg[];
  e: Err[];
  ts: number;
  te?: number;
  pr: number;
  sc: string;
  tr: string;
  rc: number;
  rl?: number;
};

export class U {
  static i(): string {
    return Math.random().toString(36).substring(2, 9) + Math.random().toString(36).substring(2, 9);
  }
  static t(): number {
    return Date.now();
  }
  static e64(s: string): string {
    return typeof Buffer !== 'undefined' ? Buffer.from(s).toString('base64') : btoa(s);
  }
  static d64(s: string): string {
    return typeof Buffer !== 'undefined' ? Buffer.from(s, 'base64').toString('utf8') : atob(s);
  }
  static js(j: any): string {
    try {
      return JSON.stringify(j);
    } catch (e) {
      return `{ "e": "JSON_E", "m": "${(e as Error).message}" }`;
    }
  }
  static jp(s: string): any {
    try {
      return JSON.parse(s);
    } catch (e) {
      return { e: "JSON_P", m: (e as Error).message };
    }
  }
  static w(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }
  static r(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

export class EvtB {
  private l: Record<string, ((...a: any[]) => void)[]>;
  constructor() {
    this.l = {};
  }
  on(e: string, cb: (...a: any[]) => void): void {
    if (!this.l[e]) this.l[e] = [];
    this.l[e].push(cb);
  }
  emit(e: string, ...a: any[]): void {
    if (this.l[e]) this.l[e].forEach(cb => { try { cb(...a) } catch (err) { } });
  }
  off(e: string, cb: (...a: any[]) => void): void {
    if (this.l[e]) this.l[e] = this.l[e].filter(f => f !== cb);
  }
}

export const G_EVB = new EvtB();

export class Log {
  private c: string;
  private l: number;
  constructor(c: string, l: number = G_CFG.ll) {
    this.c = c;
    this.l = l;
  }
  snd(lvl: number, msg: string, dat?: any): void {
    if (lvl <= this.l) {
      const o: Msg = { i: U.i(), t: U.t(), c: msg + (dat ? `| ${U.js(dat)}` : ""), l: lvl, s: this.c };
      G_EVB.emit(E_ID.AL, o);
    }
  }
  e(m: string, d?: any): void {
    this.snd(0, `E:${m}`, d);
    G_EVB.emit(E_ID.ER, { c: "LOG_E", m: m, d: U.js(d), t: U.t(), s: this.c } as Err);
  }
  w(m: string, d?: any): void { this.snd(1, `W:${m}`, d) }
  i(m: string, d?: any): void { this.snd(2, `I:${m}`, d) }
  d(m: string, d?: any): void { this.snd(3, `D:${m}`, d) }
}

export class AthM {
  private l: Log;
  private t: string | null;
  constructor() {
    this.l = new Log("AthM");
    this.t = null;
  }
  async a(u: string, p: string): Promise<boolean> {
    this.l.i(`Auth attempt: ${u}`);
    await U.w(U.r(100, 300));
    if (u === "adm" && p === "pwd") {
      this.t = U.e64(`${u}:${p}:${U.t()}`);
      this.l.i(`Auth ok: ${u}`);
      return true;
    }
    this.l.e(`Auth fail: ${u}`);
    return false;
  }
  tk(): string | null { return this.t; }
  clr(): void { this.t = null; this.l.i("Token clear"); }
  isA(): boolean { return this.t !== null; }
}

export const G_ATHM = new AthM();

export class NetM {
  private l: Log;
  private b: string;
  constructor(b: string = B_URL) {
    this.l = new Log("NetM");
    this.b = b;
  }
  async rq(m: string, p: string, h?: Record<string, string>, b?: any): Promise<Rsp> {
    const i = U.i();
    this.l.d(`REQ:${m} ${this.b}${p}`, { i, h, b });
    await U.w(U.r(100, 500));
    let s = 200;
    let rb: any = { m: "ok", d: `path: ${p}` };
    let re: Err | undefined;
    if (p.includes("fail")) {
      s = U.r(400, 599);
      rb = { m: "sim fail" };
      re = { c: "NET_SIM_E", m: "net fail", t: U.t(), s: "NetM" };
    } else if (p.includes("auth") && !G_ATHM.isA()) {
      s = 401;
      rb = { m: "auth req" };
      re = { c: "NET_AUTH_E", m: "token miss", t: U.t(), s: "NetM" };
    }
    const r: Rsp = { s: s, h: { "C-Type": "app/json", "X-Req-Id": i }, b: rb, e: re, t: U.t(), i: i };
    this.l.d(`RSP:${m} ${this.b}${p}`, r);
    return r;
  }
  async g(p: string, h?: Record<string, string>): Promise<Rsp> { return this.rq("GET", p, h); }
  async p(p: string, b: any, h?: Record<string, string>): Promise<Rsp> { return this.rq("POST", p, h, b); }
  async u(p: string, b: any, h?: Record<string, string>): Promise<Rsp> { return this.rq("PUT", p, h, b); }
  async d(p: string, h?: Record<string, string>): Promise<Rsp> { return this.rq("DEL", p, h); }
}

export const G_NETM = new NetM();

export class DtsM {
  private l: Log;
  constructor() {
    this.l = new Log("DtsM");
  }
  async t(d: any, y: string, c?: Record<string, any>): Promise<any> {
    this.l.d(`Transform: ${y}`);
    await U.w(U.r(20, 150));
    let r = U.jp(U.js(d));
    switch (y) {
      case "C2J":
        if (typeof r === 'string') {
          const lns = r.split('\n').filter(Boolean);
          if (lns.length === 0) return [];
          const h = lns[0].split(',').map(x => x.trim());
          r = lns.slice(1).map(ln => {
            const v = ln.split(',');
            const o: Record<string, string> = {};
            h.forEach((x, i) => o[x] = v[i] ? v[i].trim() : "");
            return o;
          });
        }
        break;
      case "F2N":
        if (Array.isArray(r) && r.length > 0 && r[0].c_id && r[0].c_street) {
          r = r.map(x => ({
            i: x.c_id, n: x.c_name, e: x.c_email,
            a: { s: x.c_street, c: x.c_city, z: x.c_zip, o: x.c_country },
            p: x.c_phone
          }));
        }
        break;
      case "MSK":
        const flds = c?.flds || [];
        if (Array.isArray(r)) r = r.map(x => { flds.forEach((f: string) => { if (x[f]) x[f] = "***" }); return x; });
        break;
      case "MAP":
        const m = c?.map || {};
        if (Array.isArray(r)) r = r.map(x => { const n: Record<string, any> = {}; for (const o in x) { const nf = m[o] || o; n[nf] = x[o] } return n; });
        break;
      default:
        this.l.w(`Unknown transform: ${y}`);
        break;
    }
    this.l.d(`Transform '${y}' ok.`);
    return r;
  }
}

export const G_DTSM = new DtsM();

export class DvsM {
  private l: Log;
  constructor() {
    this.l = new Log("DvsM");
  }
  async v(d: any[], r: Record<string, any>): Promise<{ v: any[], i: any[], e: Err[] }> {
    this.l.d(`Validating ${d.length} recs`, r);
    await U.w(U.r(20, 100));
    const vd: any[] = [];
    const id: any[] = [];
    const ee: Err[] = [];
    for (let j = 0; j < d.length; j++) {
      const rec = d[j];
      let is_i = false;
      const msgs: string[] = [];
      if (r.req) (r.req as string[]).forEach(f => { if (!(f in rec) || rec[f] === null || rec[f] === "") { is_i = true; msgs.push(`miss:${f}`) } });
      if (r.num) (r.num as string[]).forEach(f => { if (f in rec && isNaN(Number(rec[f]))) { is_i = true; msgs.push(`not_num:${f}`) } });
      if (is_i) { id.push(rec); ee.push({ c: "REC_V_FAIL", m: `Rec ${j} invalid: ${msgs.join(";")}`, d: U.js(rec), t: U.t(), s: "DvsM" }); }
      else { vd.push(rec); }
    }
    this.l.i(`Validate ok. V: ${vd.length}, I: ${id.length}`);
    return { v: vd, i: id, e: ee };
  }
}

export const G_DVSM = new DvsM();

export class DbM {
  private l: Log;
  private d: Record<string, Record<string, any>>;
  constructor() {
    this.l = new Log("DbM");
    this.d = {};
  }
  async ct(t: string): Promise<boolean> {
    this.l.d(`Create table: ${t}`);
    if (this.d[t]) { this.l.w(`Table '${t}' exists`); return false; }
    this.d[t] = {};
    this.l.i(`Table '${t}' created`);
    await U.w(U.r(10, 50));
    return true;
  }
  async sr(t: string, r: any, f: string = "id"): Promise<boolean> {
    this.l.d(`Store rec in '${t}'`, r);
    if (!this.d[t]) { this.l.e(`Table '${t}' missing`); return false; }
    const i = r[f] || U.i();
    this.d[t][i] = { ...r, [f]: i, ct: U.t(), ut: U.t() };
    this.l.i(`Rec '${i}' stored in '${t}'`);
    await U.w(U.r(10, 30));
    return true;
  }
  async gr(t: string, i: string): Promise<any | null> {
    this.l.d(`Get rec '${i}' from '${t}'`);
    await U.w(U.r(5, 20));
    return this.d[t]?.[i] || null;
  }
  async ur(t: string, i: string, u: any): Promise<boolean> {
    this.l.d(`Update rec '${i}' in '${t}'`, u);
    if (!this.d[t]?.[i]) { this.l.w(`Rec '${i}' in '${t}' not found`); return false; }
    this.d[t][i] = { ...this.d[t][i], ...u, ut: U.t() };
    this.l.i(`Rec '${i}' updated in '${t}'`);
    await U.w(U.r(10, 25));
    return true;
  }
  async dr(t: string, i: string): Promise<boolean> {
    this.l.d(`Delete rec '${i}' from '${t}'`);
    if (!this.d[t]?.[i]) { this.l.w(`Rec '${i}' in '${t}' not found`); return false; }
    delete this.d[t][i];
    this.l.i(`Rec '${i}' deleted from '${t}'`);
    await U.w(U.r(10, 25));
    return true;
  }
  async qr(t: string, q: (r: any) => boolean): Promise<any[]> {
    this.l.d(`Query table '${t}'`);
    await U.w(U.r(20, 70));
    if (!this.d[t]) return [];
    return Object.values(this.d[t]).filter(q);
  }
}
export const G_DBM = new DbM();

export class FsM {
  private l: Log;
  private f: Record<string, { c: string, m: string, t: number, z: number }>;
  constructor() {
    this.l = new Log("FsM");
    this.f = {};
  }
  async w(p: string, c: string, m: string = "txt/pln"): Promise<boolean> {
    this.l.d(`Write file: ${p}`);
    await U.w(U.r(50, 200));
    this.f[p] = { c, m, t: U.t(), z: c.length };
    this.l.i(`File wrote: ${p} (Size: ${c.length})`);
    return true;
  }
  async r(p: string): Promise<{ c: string, m: string, t: number, z: number } | null> {
    this.l.d(`Read file: ${p}`);
    await U.w(U.r(50, 200));
    const o = this.f[p];
    if (o) { this.l.i(`File read: ${p}`); return U.jp(U.js(o)); }
    this.l.w(`File miss: ${p}`);
    return null;
  }
  async l(p: string): Promise<string[]> {
    this.l.d(`List files prefix: ${p}`);
    await U.w(U.r(30, 100));
    return Object.keys(this.f).filter(k => k.startsWith(p));
  }
  async d(p: string): Promise<boolean> {
    this.l.d(`Delete file: ${p}`);
    await U.w(U.r(40, 150));
    if (this.f[p]) { delete this.f[p]; this.l.i(`File deleted: ${p}`); return true; }
    this.l.w(`File miss for delete: ${p}`);
    return false;
  }
}
export const G_FSM = new FsM();

export class CfgM {
  private l: Log;
  private c: Record<string, any>;
  constructor() {
    this.l = new Log("CfgM");
    this.c = {};
    this.l.i("CfgM init, loading from DbM");
    G_DBM.ct("SYS_CFG").then(() => G_DBM.qr("SYS_CFG", () => true).then(x => { x.forEach(y => this.c[y.k] = y.v); this.l.i(`Loaded ${x.length} configs`) }));
  }
  async g(k: string): Promise<any | null> {
    this.l.d(`Get config: ${k}`);
    await U.w(U.r(5, 15));
    return this.c[k] || null;
  }
  async s(k: string, v: any): Promise<boolean> {
    this.l.d(`Set config: ${k}`);
    await U.w(U.r(10, 30));
    this.c[k] = v;
    await G_DBM.sr("SYS_CFG", { k, v }, "k");
    this.l.i(`Config '${k}' set`);
    G_EVB.emit(E_ID.CU, { k, v });
    return true;
  }
}
export const G_CFGM = new CfgM();

export class RptM {
  private l: Log;
  constructor() {
    this.l = new Log("RptM");
  }
  async gen(j: string): Promise<any | null> {
    this.l.i(`Gen report for Job: ${j}`);
    await U.w(U.r(100, 500));
    const d = await G_DBM.gr("JOBS", j);
    if (!d) { this.l.w(`Job ${j} miss for report`); return null; }
    const r = { j: d.j, u: d.u, t: d.t, s: d.s, sc: d.sc, tr: d.tr, ts: new Date(d.ts).toISOString(), te: d.te ? new Date(d.te).toISOString() : "N/A", prg: d.pr, ttl: d.d ? d.d.length : 0, suc: d.d ? d.d.filter((x: Rec) => x.s === S_ST.C).length : 0, fail: d.d ? d.d.filter((x: Rec) => x.s === S_ST.F).length : 0, err: d.e, log: d.l };
    this.l.i(`Report gen for Job: ${j}`);
    return r;
  }
  async exp(d: any, f: string, n: string): Promise<string | null> {
    this.l.i(`Export report '${n}' as ${f}`);
    await U.w(U.r(200, 800));
    let c: string, m: string;
    switch (f) {
      case D_TP.J: c = U.js(d); m = "app/json"; break;
      case D_TP.C:
        if (Array.isArray(d) && d.length > 0) { const h = Object.keys(d[0]).join(','); const w = d.map(r => Object.values(r).join(',')); c = [h, ...w].join('\n'); }
        else if (typeof d === 'object' && d !== null) { c = Object.keys(d).join(',') + '\n' + Object.values(d).join(','); }
        else { this.l.e(`Bad data for CSV`); return null; }
        m = "txt/csv";
        break;
      default: this.l.w(`Unsupported format ${f}, using JSON`); c = U.js(d); m = "app/json"; break;
    }
    const p = `/reports/${n}.${f.toLowerCase()}`;
    const s = await G_FSM.w(p, c, m);
    if (s) { this.l.i(`Report '${n}' exported to ${p}`); return p; }
    this.l.e(`Fail to export report '${n}'`);
    return null;
  }
}
export const G_RPTM = new RptM();

export interface ExtSvc {
  l: Log;
  n: string;
  c: Record<string, any>;
  s: string;
  init(): Promise<boolean>;
  auth(): Promise<boolean>;
  pull(p: Record<string, any>): Promise<Rec[]>;
  push(d: Rec[]): Promise<Rec[]>;
  stat(): string;
  ok(): boolean;
}

export class GmniSvc implements ExtSvc {
  l: Log; n: string = C_ID.GEM; c: Record<string, any>; s: string = S_ST.Z;
  constructor(c: Record<string, any> = {}) { this.l = new Log(this.n); this.c = { k: "g_k_mock", m: "gem-pro", ...c }; }
  async init(): Promise<boolean> { this.l.i("init"); await U.w(U.r(30, 80)); if (!this.c.k || this.c.k === "g_k_mock") { this.l.e("key miss"); this.s = S_ST.F; return false; } this.s = S_ST.A; this.l.i("init ok"); return true; }
  async auth(): Promise<boolean> { this.l.i("auth"); await U.w(U.r(50, 150)); if (this.c.k.startsWith("g_")) { this.s = S_ST.R; this.l.i("auth ok"); return true; } this.s = S_ST.F; this.l.e("auth fail"); return false; }
  async pull(p: Record<string, any>): Promise<Rec[]> {
    this.l.i(`pull: ${p.prompt}`);
    if (this.s !== S_ST.R) { this.l.e(`not ready: ${this.s}`); return []; }
    const r = await G_NETM.p("/api/gem/gen", { m: this.c.m, p: p.prompt, k: this.c.k });
    if (r.s !== 200) { this.l.e("pull fail", r.e); return []; }
    const t = r.b?.d?.txt || "mock gem output";
    return [{ i: U.i(), s: U.t(), d: { p: p.prompt, c: t } }];
  }
  async push(d: Rec[]): Promise<Rec[]> { this.l.w("push not impl"); return d.map(x => ({ ...x, s: S_ST.F })); }
  stat(): string { return this.s; }
  ok(): boolean { return this.s === S_ST.R; }
}

export class ChtHSvc implements ExtSvc {
  l: Log; n: string = C_ID.HOT; c: Record<string, any>; s: string = S_ST.Z;
  constructor(c: Record<string, any> = {}) { this.l = new Log(this.n); this.c = { k: "c_k_mock", m: "cht-pro", ...c }; }
  async init(): Promise<boolean> { this.l.i("init"); await U.w(U.r(30, 80)); if (!this.c.k || this.c.k === "c_k_mock") { this.l.e("key miss"); this.s = S_ST.F; return false; } this.s = S_ST.A; this.l.i("init ok"); return true; }
  async auth(): Promise<boolean> { this.l.i("auth"); await U.w(U.r(50, 150)); if (this.c.k.startsWith("c_")) { this.s = S_ST.R; this.l.i("auth ok"); return true; } this.s = S_ST.F; this.l.e("auth fail"); return false; }
  async pull(p: Record<string, any>): Promise<Rec[]> {
    this.l.i(`pull: ${p.q}`);
    if (this.s !== S_ST.R) { this.l.e(`not ready: ${this.s}`); return []; }
    const r = await G_NETM.p("/api/cht/ask", { q: p.q, m: this.c.m, k: this.c.k });
    if (r.s !== 200) { this.l.e("pull fail", r.e); return []; }
    const t = r.b?.d?.txt || "mock cht output";
    return [{ i: U.i(), s: U.t(), d: { q: p.q, a: t } }];
  }
  async push(d: Rec[]): Promise<Rec[]> { this.l.i(`push ${d.length} recs`); return d.map(x => ({ ...x, s: S_ST.C })); }
  stat(): string { return this.s; }
  ok(): boolean { return this.s === S_ST.R; }
}

export class PipeDSvc implements ExtSvc {
  l: Log; n: string = C_ID.PIP; c: Record<string, any>; s: string = S_ST.Z;
  constructor(c: Record<string, any> = {}) { this.l = new Log(this.n); this.c = { t: "p_t_mock", w: "w_id_mock", ...c }; }
  async init(): Promise<boolean> { this.l.i("init"); this.s = S_ST.A; this.l.i("init ok"); return true; }
  async auth(): Promise<boolean> { this.l.i("auth"); await U.w(U.r(50, 150)); if (this.c.t.startsWith("p_")) { this.s = S_ST.R; this.l.i("auth ok"); return true; } this.s = S_ST.F; this.l.e("auth fail"); return false; }
  async pull(p: Record<string, any>): Promise<Rec[]> { this.l.w("pull not impl"); return []; }
  async push(d: Rec[]): Promise<Rec[]> {
    this.l.i(`push ${d.length} recs to w: ${this.c.w}`);
    if (this.s !== S_ST.R) { this.l.e(`not ready: ${this.s}`); return []; }
    const r = await G_NETM.p(`/api/pip/${this.c.w}`, d, { "Auth": `Bearer ${this.c.t}` });
    if (r.s !== 200) { this.l.e("push fail", r.e); return d.map(x => ({ ...x, s: S_ST.F })); }
    return d.map(x => ({ ...x, s: S_ST.C }));
  }
  stat(): string { return this.s; }
  ok(): boolean { return this.s === S_ST.R; }
}

export class GthbSvc implements ExtSvc {
  l: Log; n: string = C_ID.GIT; c: Record<string, any>; s: string = S_ST.Z;
  constructor(c: Record<string, any> = {}) { this.l = new Log(this.n); this.c = { t: "gh_t_mock", r: "repo/mock", ...c }; }
  async init(): Promise<boolean> { this.l.i("init"); this.s = S_ST.A; this.l.i("init ok"); return true; }
  async auth(): Promise<boolean> { this.l.i("auth"); await U.w(U.r(50, 150)); if (this.c.t.startsWith("gh_")) { this.s = S_ST.R; this.l.i("auth ok"); return true; } this.s = S_ST.F; this.l.e("auth fail"); return false; }
  async pull(p: Record<string, any>): Promise<Rec[]> {
    this.l.i(`pull commits from: ${this.c.r}`);
    if (this.s !== S_ST.R) { this.l.e(`not ready: ${this.s}`); return []; }
    const r = await G_NETM.g(`/api/git/${this.c.r}/commits`, { "Auth": `Bearer ${this.c.t}` });
    if (r.s !== 200) { this.l.e("pull fail", r.e); return []; }
    const d = r.b?.d || [{ sha: U.i(), msg: "mock commit" }];
    return d.map((x: any) => ({ i: x.sha, s: U.t(), d: x }));
  }
  async push(d: Rec[]): Promise<Rec[]> { this.l.w("push not impl"); return d.map(x => ({ ...x, s: S_ST.F })); }
  stat(): string { return this.s; }
  ok(): boolean { return this.s === S_ST.R; }
}

export class PldSvc implements ExtSvc {
  l: Log; n: string = C_ID.PLD; c: Record<string, any>; s: string = S_ST.Z;
  constructor(c: Record<string, any> = {}) { this.l = new Log(this.n); this.c = { cid: "pld_cid_mock", sec: "pld_sec_mock", ...c }; }
  async init(): Promise<boolean> { this.l.i("init"); this.s = S_ST.A; this.l.i("init ok"); return true; }
  async auth(): Promise<boolean> { this.l.i("auth"); await U.w(U.r(50, 150)); if (this.c.cid.startsWith("pld_")) { this.s = S_ST.R; this.l.i("auth ok"); return true; } this.s = S_ST.F; this.l.e("auth fail"); return false; }
  async pull(p: Record<string, any>): Promise<Rec[]> {
    this.l.i(`pull transactions for: ${p.acct}`);
    if (this.s !== S_ST.R) { this.l.e(`not ready: ${this.s}`); return []; }
    const r = await G_NETM.p("/api/pld/trans", { acct: p.acct, cid: this.c.cid, sec: this.c.sec });
    if (r.s !== 200) { this.l.e("pull fail", r.e); return []; }
    const d = r.b?.d || [{ id: U.i(), amt: 100, n: "mock trans" }];
    return d.map((x: any) => ({ i: x.id, s: U.t(), d: x }));
  }
  async push(d: Rec[]): Promise<Rec[]> { this.l.w("push not impl"); return d.map(x => ({ ...x, s: S_ST.F })); }
  stat(): string { return this.s; }
  ok(): boolean { return this.s === S_ST.R; }
}

export class MdnTSvc implements ExtSvc {
  l: Log; n: string = C_ID.MDT; c: Record<string, any>; s: string = S_ST.Z;
  constructor(c: Record<string, any> = {}) { this.l = new Log(this.n); this.c = { k: "mdt_k_mock", oid: "mdt_oid_mock", ...c }; }
  async init(): Promise<boolean> { this.l.i("init"); this.s = S_ST.A; this.l.i("init ok"); return true; }
  async auth(): Promise<boolean> { this.l.i("auth"); await U.w(U.r(50, 150)); if (this.c.k.startsWith("mdt_")) { this.s = S_ST.R; this.l.i("auth ok"); return true; } this.s = S_ST.F; this.l.e("auth fail"); return false; }
  async pull(p: Record<string, any>): Promise<Rec[]> { this.l.w("pull not impl"); return []; }
  async push(d: Rec[]): Promise<Rec[]> {
    this.l.i(`push ${d.length} payments`);
    if (this.s !== S_ST.R) { this.l.e(`not ready: ${this.s}`); return []; }
    const res = [];
    for (const rec of d) {
      const r = await G_NETM.p("/api/mdt/pay", rec.d, { "X-Api-Key": this.c.k });
      if (r.s !== 201) { this.l.e(`push fail for ${rec.i}`, r.e); res.push({ ...rec, s: S_ST.F }); }
      else { res.push({ ...rec, s: S_ST.C }); }
    }
    return res;
  }
  stat(): string { return this.s; }
  ok(): boolean { return this.s === S_ST.R; }
}

export class GdrvSvc implements ExtSvc {
  l: Log; n: string = C_ID.GDR; c: Record<string, any>; s: string = S_ST.Z;
  constructor(c: Record<string, any> = {}) { this.l = new Log(this.n); this.c = { t: "gdr_t_mock", fid: "root", ...c }; }
  async init(): Promise<boolean> { this.l.i("init"); this.s = S_ST.A; this.l.i("init ok"); return true; }
  async auth(): Promise<boolean> { this.l.i("auth"); await U.w(U.r(50, 150)); if (this.c.t.startsWith("gdr_")) { this.s = S_ST.R; this.l.i("auth ok"); return true; } this.s = S_ST.F; this.l.e("auth fail"); return false; }
  async pull(p: Record<string, any>): Promise<Rec[]> {
    this.l.i(`pull file: ${p.f_id}`);
    const f = await G_FSM.r(`/gdrive/${p.f_id}`);
    if (!f) { this.l.e(`file miss: ${p.f_id}`); return []; }
    return [{ i: p.f_id, s: U.t(), d: f }];
  }
  async push(d: Rec[]): Promise<Rec[]> {
    this.l.i(`push ${d.length} files`);
    const res = [];
    for (const rec of d) {
      const ok = await G_FSM.w(`/gdrive/${rec.d.path}`, rec.d.content, rec.d.mime);
      res.push({ ...rec, s: ok ? S_ST.C : S_ST.F });
    }
    return res;
  }
  stat(): string { return this.s; }
  ok(): boolean { return this.s === S_ST.R; }
}

export class OneDSvc implements ExtSvc {
  l: Log; n: string = C_ID.ODR; c: Record<string, any>; s: string = S_ST.Z;
  constructor(c: Record<string, any> = {}) { this.l = new Log(this.n); this.c = { t: "odr_t_mock", ...c }; }
  async init(): Promise<boolean> { this.l.i("init"); this.s = S_ST.A; return true; }
  async auth(): Promise<boolean> { this.l.i("auth"); if (this.c.t.startsWith("odr_")) { this.s = S_ST.R; return true; } this.s = S_ST.F; return false; }
  async pull(p: Record<string, any>): Promise<Rec[]> {
    this.l.i(`pull file: ${p.f_path}`);
    const f = await G_FSM.r(`/onedrive/${p.f_path}`);
    if (!f) { this.l.e(`file miss: ${p.f_path}`); return []; }
    return [{ i: p.f_path, s: U.t(), d: f }];
  }
  async push(d: Rec[]): Promise<Rec[]> {
    this.l.i(`push ${d.length} files`);
    const res = [];
    for (const rec of d) {
      const ok = await G_FSM.w(`/onedrive/${rec.d.path}`, rec.d.content, rec.d.mime);
      res.push({ ...rec, s: ok ? S_ST.C : S_ST.F });
    }
    return res;
  }
  stat(): string { return this.s; }
  ok(): boolean { return this.s === S_ST.R; }
}

export class AzrSvc implements ExtSvc {
  l: Log; n: string = C_ID.AZR; c: Record<string, any>; s: string = S_ST.Z;
  constructor(c: Record<string, any> = {}) { this.l = new Log(this.n); this.c = { cs: "azr_cs_mock", ...c }; }
  async init(): Promise<boolean> { this.l.i("init"); this.s = S_ST.A; return true; }
  async auth(): Promise<boolean> { this.l.i("auth"); if (this.c.cs.startsWith("azr_")) { this.s = S_ST.R; return true; } this.s = S_ST.F; return false; }
  async pull(p: Record<string, any>): Promise<Rec[]> {
    this.l.i(`pull blob: ${p.b_name}`);
    const f = await G_FSM.r(`/azblob/${p.b_name}`);
    if (!f) { this.l.e(`blob miss: ${p.b_name}`); return []; }
    return [{ i: p.b_name, s: U.t(), d: f }];
  }
  async push(d: Rec[]): Promise<Rec[]> {
    this.l.i(`push ${d.length} blobs`);
    const res = [];
    for (const rec of d) {
      const ok = await G_FSM.w(`/azblob/${rec.d.path}`, rec.d.content, rec.d.mime);
      res.push({ ...rec, s: ok ? S_ST.C : S_ST.F });
    }
    return res;
  }
  stat(): string { return this.s; }
  ok(): boolean { return this.s === S_ST.R; }
}

export class GcpSvc implements ExtSvc {
  l: Log; n: string = C_ID.GCP; c: Record<string, any>; s: string = S_ST.Z;
  constructor(c: Record<string, any> = {}) { this.l = new Log(this.n); this.c = { cred: "gcp_cred_mock", ...c }; }
  async init(): Promise<boolean> { this.l.i("init"); this.s = S_ST.A; return true; }
  async auth(): Promise<boolean> { this.l.i("auth"); if (this.c.cred.startsWith("gcp_")) { this.s = S_ST.R; return true; } this.s = S_ST.F; return false; }
  async pull(p: Record<string, any>): Promise<Rec[]> {
    this.l.i(`pull object: ${p.o_name}`);
    const f = await G_FSM.r(`/gcs/${p.o_name}`);
    if (!f) { this.l.e(`object miss: ${p.o_name}`); return []; }
    return [{ i: p.o_name, s: U.t(), d: f }];
  }
  async push(d: Rec[]): Promise<Rec[]> {
    this.l.i(`push ${d.length} objects`);
    const res = [];
    for (const rec of d) {
      const ok = await G_FSM.w(`/gcs/${rec.d.path}`, rec.d.content, rec.d.mime);
      res.push({ ...rec, s: ok ? S_ST.C : S_ST.F });
    }
    return res;
  }
  stat(): string { return this.s; }
  ok(): boolean { return this.s === S_ST.R; }
}

export class SupbSvc implements ExtSvc {
  l: Log; n: string = C_ID.SPB; c: Record<string, any>; s: string = S_ST.Z;
  constructor(c: Record<string, any> = {}) { this.l = new Log(this.n); this.c = { url: "spb_url_mock", key: "spb_key_mock", ...c }; }
  async init(): Promise<boolean> { this.l.i("init"); this.s = S_ST.A; return true; }
  async auth(): Promise<boolean> { this.l.i("auth"); if (this.c.key.startsWith("spb_")) { this.s = S_ST.R; return true; } this.s = S_ST.F; return false; }
  async pull(p: Record<string, any>): Promise<Rec[]> {
    this.l.i(`pull from table: ${p.tbl}`);
    const d = await G_DBM.qr(`spb_${p.tbl}`, () => true);
    return d.map(x => ({ i: x.id, s: U.t(), d: x }));
  }
  async push(d: Rec[]): Promise<Rec[]> {
    this.l.i(`push ${d.length} rows to ${this.c.tbl}`);
    await G_DBM.ct(`spb_${this.c.tbl}`);
    const res = [];
    for (const rec of d) {
      const ok = await G_DBM.sr(`spb_${this.c.tbl}`, rec.d);
      res.push({ ...rec, s: ok ? S_ST.C : S_ST.F });
    }
    return res;
  }
  stat(): string { return this.s; }
  ok(): boolean { return this.s === S_ST.R; }
}

export class VrclSvc implements ExtSvc {
  l: Log; n: string = C_ID.VCL; c: Record<string, any>; s: string = S_ST.Z;
  constructor(c: Record<string, any> = {}) { this.l = new Log(this.n); this.c = { t: "vcl_t_mock", ...c }; }
  async init(): Promise<boolean> { this.l.i("init"); this.s = S_ST.A; return true; }
  async auth(): Promise<boolean> { this.l.i("auth"); if (this.c.t.startsWith("vcl_")) { this.s = S_ST.R; return true; } this.s = S_ST.F; return false; }
  async pull(p: Record<string, any>): Promise<Rec[]> { this.l.w("pull not impl"); return []; }
  async push(d: Rec[]): Promise<Rec[]> { this.l.w("push not impl"); return d.map(x => ({ ...x, s: S_ST.F })); }
  stat(): string { return this.s; }
  ok(): boolean { return this.s === S_ST.R; }
}

export class SlsfSvc implements ExtSvc {
  l: Log; n: string = C_ID.SLF; c: Record<string, any>; s: string = S_ST.Z;
  constructor(c: Record<string, any> = {}) { this.l = new Log(this.n); this.c = { t: "slf_t_mock", ...c }; }
  async init(): Promise<boolean> { this.l.i("init"); this.s = S_ST.A; return true; }
  async auth(): Promise<boolean> { this.l.i("auth"); if (this.c.t.startsWith("slf_")) { this.s = S_ST.R; return true; } this.s = S_ST.F; return false; }
  async pull(p: Record<string, any>): Promise<Rec[]> {
    this.l.i(`pull query: ${p.q}`);
    const d = await G_DBM.qr("slf_db", r => r.type === 'Account');
    return d.map(x => ({ i: x.id, s: U.t(), d: x }));
  }
  async push(d: Rec[]): Promise<Rec[]> {
    this.l.i(`push ${d.length} objects`);
    await G_DBM.ct("slf_db");
    const res = [];
    for (const rec of d) {
      const ok = await G_DBM.sr("slf_db", rec.d);
      res.push({ ...rec, s: ok ? S_ST.C : S_ST.F });
    }
    return res;
  }
  stat(): string { return this.s; }
  ok(): boolean { return this.s === S_ST.R; }
}

export class ShpfySvc implements ExtSvc {
  l: Log; n: string = C_ID.SHP; c: Record<string, any>; s: string = S_ST.Z;
  constructor(c: Record<string, any> = {}) { this.l = new Log(this.n); this.c = { t: "shp_t_mock", ...c }; }
  async init(): Promise<boolean> { this.l.i("init"); this.s = S_ST.A; return true; }
  async auth(): Promise<boolean> { this.l.i("auth"); if (this.c.t.startsWith("shp_")) { this.s = S_ST.R; return true; } this.s = S_ST.F; return false; }
  async pull(p: Record<string, any>): Promise<Rec[]> {
    this.l.i(`pull orders`);
    const r = await G_NETM.g(`/api/shp/orders`, { "Auth": `Bearer ${this.c.t}` });
    if (r.s !== 200) { this.l.e("pull fail", r.e); return []; }
    const d = r.b?.d || [{ id: U.i(), total: 50 }];
    return d.map((x: any) => ({ i: x.id, s: U.t(), d: x }));
  }
  async push(d: Rec[]): Promise<Rec[]> { this.l.w("push not impl"); return d.map(x => ({ ...x, s: S_ST.F })); }
  stat(): string { return this.s; }
  ok(): boolean { return this.s === S_ST.R; }
}

export class TwloSvc implements ExtSvc {
  l: Log; n: string = C_ID.TWL; c: Record<string, any>; s: string = S_ST.Z;
  constructor(c: Record<string, any> = {}) { this.l = new Log(this.n); this.c = { sid: "tw_sid_mock", tok: "tw_tok_mock", ...c }; }
  async init(): Promise<boolean> { this.l.i("init"); this.s = S_ST.A; return true; }
  async auth(): Promise<boolean> { this.l.i("auth"); if (this.c.sid.startsWith("tw_")) { this.s = S_ST.R; return true; } this.s = S_ST.F; return false; }
  async pull(p: Record<string, any>): Promise<Rec[]> { this.l.w("pull not impl"); return []; }
  async push(d: Rec[]): Promise<Rec[]> {
    this.l.i(`push ${d.length} sms`);
    const res = [];
    for (const rec of d) {
      const r = await G_NETM.p("/api/twl/sms", { to: rec.d.to, from: rec.d.from, body: rec.d.body }, { "Auth": U.e64(`${this.c.sid}:${this.c.tok}`) });
      res.push({ ...rec, s: r.s === 200 ? S_ST.C : S_ST.F });
    }
    return res;
  }
  stat(): string { return this.s; }
  ok(): boolean { return this.s === S_ST.R; }
}

export class SqrSvc implements ExtSvc {
  l: Log; n: string = C_ID.SQR; c: Record<string, any>; s: string = S_ST.Z;
  constructor(c: Record<string, any> = {}) { this.l = new Log(this.n); this.c = { t: "sqr_t_mock", ...c }; }
  async init(): Promise<boolean> { this.l.i("init"); this.s = S_ST.A; return true; }
  async auth(): Promise<boolean> { this.l.i("auth"); if (this.c.t.startsWith("sqr_")) { this.s = S_ST.R; return true; } this.s = S_ST.F; return false; }
  async pull(p: Record<string, any>): Promise<Rec[]> {
    this.l.i(`pull payments`);
    const r = await G_NETM.g(`/api/sqr/payments`, { "Auth": `Bearer ${this.c.t}` });
    if (r.s !== 200) { this.l.e("pull fail", r.e); return []; }
    const d = r.b?.d || [{ id: U.i(), amount: 2500 }];
    return d.map((x: any) => ({ i: x.id, s: U.t(), d: x }));
  }
  async push(d: Rec[]): Promise<Rec[]> { this.l.w("push not impl"); return d.map(x => ({ ...x, s: S_ST.F })); }
  stat(): string { return this.s; }
  ok(): boolean { return this.s === S_ST.R; }
}

export type CtxType = {
  g_cfg: Cfg;
  g_evb: EvtB;
  g_athm: AthM;
  g_netm: NetM;
  g_dtsm: DtsM;
  g_dvsm: DvsM;
  g_dbm: DbM;
  g_fsm: FsM;
  g_cfgm: CfgM;
  g_rptm: RptM;
  svcs: Record<string, ExtSvc>;
};

const svcs: Record<string, ExtSvc> = {
  [C_ID.GEM]: new GmniSvc(),
  [C_ID.HOT]: new ChtHSvc(),
  [C_ID.PIP]: new PipeDSvc(),
  [C_ID.GIT]: new GthbSvc(),
  [C_ID.PLD]: new PldSvc(),
  [C_ID.MDT]: new MdnTSvc(),
  [C_ID.GDR]: new GdrvSvc(),
  [C_ID.ODR]: new OneDSvc(),
  [C_ID.AZR]: new AzrSvc(),
  [C_ID.GCP]: new GcpSvc(),
  [C_ID.SPB]: new SupbSvc(),
  [C_ID.VCL]: new VrclSvc(),
  [C_ID.SLF]: new SlsfSvc(),
  [C_ID.SHP]: new ShpfySvc(),
  [C_ID.TWL]: new TwloSvc(),
  [C_ID.SQR]: new SqrSvc(),
};

export const G_CTX_VAL: CtxType = {
  g_cfg: G_CFG,
  g_evb: G_EVB,
  g_athm: G_ATHM,
  g_netm: G_NETM,
  g_dtsm: G_DTSM,
  g_dvsm: G_DVSM,
  g_dbm: G_DBM,
  g_fsm: G_FSM,
  g_cfgm: G_CFGM,
  g_rptm: G_RPTM,
  svcs,
};

export const DataIngestCtx = createContext<CtxType | null>(null);
