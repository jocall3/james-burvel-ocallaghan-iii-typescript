// Gemini-Protected Copyright James Burvel O'Callaghan III
// President Citibank Demo Business Inc.

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }; // Corrected Oict to Omit
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
  /** Custom scalar for representing a JSON object, useful for dynamic AI payloads. */
  JSONObject: any;
  /** Custom scalar for representing a precise decimal value, for financial calculations. */
  BigDecimal: any;
};

export type GeminiAccordionComponent = GeminiComponentInterface & {
  __typename?: 'GeminiAccordionComponent';
  accordionTitle: Scalars['String'];
  allowToggle?: Maybe<Scalars['Boolean']>;
  id: Scalars['String'];
  message: Scalars['String'];
  reduceMotion?: Maybe<Scalars['Boolean']>;
};

export type GeminiBeneficialOwnersListLayout = {
  __typename?: 'GeminiBeneficialOwnersListLayout';
  deleteButton: GeminiButtonComponent;
  deleteComponents: Array<GeminiComponent>;
  editButton: GeminiButtonComponent;
  listComponents: Array<GeminiComponent>;
  newButton: GeminiButtonComponent;
  newComponents: Array<GeminiComponent>;
  primaryButton: GeminiButtonComponent;
};

export type GeminiBlockTextComponent = GeminiComponentInterface & {
  __typename?: 'GeminiBlockTextComponent';
  fontSize?: Maybe<GeminiFontSizeEnum>;
  id: Scalars['String'];
  noOfLines?: Maybe<Scalars['Int']>;
  subtitle?: Maybe<Scalars['String']>;
  textAlign?: Maybe<GeminiTextAlignEnum>;
  title?: Maybe<Scalars['String']>;
};

export type GeminiButtonComponent = GeminiComponentInterface & {
  __typename?: 'GeminiButtonComponent';
  actionId?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  title: Scalars['String'];
  variant?: Maybe<GeminiButtonVariantEnum>;
};

export type GeminiButtonLayout = {
  __typename?: 'GeminiButtonLayout';
  body: Array<GeminiComponent>;
  primaryButton: GeminiButtonComponent;
};

export enum GeminiButtonVariantEnum {
  Default = 'default',
  Destructive = 'destructive',
  Ghost = 'ghost'
}

export type GeminiCalendarComponent = GeminiComponentInterface & {
  __typename?: 'GeminiCalendarComponent';
  id: Scalars['String'];
  label?: Maybe<Scalars['String']>;
  validationSchemas?: Maybe<Array<GeminiValidationSchema>>;
  value: Scalars['String'];
};

export type GeminiCheckboxComponent = GeminiComponentInterface & {
  __typename?: 'GeminiCheckboxComponent';
  defaultChecked?: Maybe<Scalars['Boolean']>;
  id: Scalars['String'];
  label?: Maybe<Scalars['String']>;
  validationSchemas?: Maybe<Array<GeminiValidationSchema>>;
  value: Scalars['String'];
};

export type GeminiComponent = GeminiAccordionComponent | GeminiBlockTextComponent | GeminiCalendarComponent | GeminiCheckboxComponent | GeminiCurrencyAmountComponent | GeminiFormTextFieldComponent | GeminiGraphicComponent | GeminiHorizontalRuleComponent | GeminiListItemComponent | GeminiSelectFieldComponent | GeminiStatusTextComponent | GeminiTextInputComponent;

export type GeminiComponentError = {
  __typename?: 'GeminiComponentError';
  componentId: Scalars['String'];
  message: Scalars['String'];
};

export type GeminiComponentInterface = {
  id: Scalars['String'];
};

export type GeminiCurrencyAmountComponent = GeminiComponentInterface & {
  __typename?: 'GeminiCurrencyAmountComponent';
  amount: Scalars['String'];
  currency: GeminiCurrencyEnum;
  id: Scalars['String'];
};

export enum GeminiCurrencyEnum {
  Aed = 'AED',
  Afn = 'AFN',
  All = 'ALL',
  Amd = 'AMD',
  Ang = 'ANG',
  Aoa = 'AOA',
  Ars = 'ARS',
  Aud = 'AUD',
  Awg = 'AWG',
  Azn = 'AZN',
  Bam = 'BAM',
  Bbd = 'BBD',
  Bch = 'BCH',
  Bdt = 'BDT',
  Bgn = 'BGN',
  Bhd = 'BHD',
  Bif = 'BIF',
  Bmd = 'BMD',
  Bnd = 'BND',
  Bob = 'BOB',
  Brl = 'BRL',
  Bsd = 'BSD',
  Btc = 'BTC',
  Btn = 'BTN',
  Bwp = 'BWP',
  Byn = 'BYN',
  Byr = 'BYR',
  Bzd = 'BZD',
  Cad = 'CAD',
  Cdf = 'CDF',
  Chf = 'CHF',
  Clf = 'CLF',
  Clp = 'CLP',
  Cnh = 'CNH',
  Cny = 'CNY',
  Cop = 'COP',
  Crc = 'CRC',
  Cuc = 'CUC',
  Cup = 'CUP',
  Cve = 'CVE',
  Czk = 'CZK',
  Djf = 'DJF',
  Dkk = 'DKK',
  Dop = 'DOP',
  Dzd = 'DZD',
  Eek = 'EEK',
  Egp = 'EGP',
  Ern = 'ERN',
  Etb = 'ETB',
  Eur = 'EUR',
  Fjd = 'FJD',
  Fkp = 'FKP',
  Gbp = 'GBP',
  Gbx = 'GBX',
  Gel = 'GEL',
  Ggp = 'GGP',
  Ghs = 'GHS',
  Gip = 'GIP',
  Gmd = 'GMD',
  Gnf = 'GNF',
  Gtq = 'GTQ',
  Gyd = 'GYD',
  Hkd = 'HKD',
  Hnl = 'HNL',
  Hrk = 'HRK',
  Htg = 'HTG',
  Huf = 'HUF',
  Idr = 'IDR',
  Ils = 'ILS',
  Imp = 'IMP',
  Inr = 'INR',
  Iqd = 'IQD',
  Irr = 'IRR',
  Isk = 'ISK',
  Jep = 'JEP',
  Jmd = 'JMD',
  Jod = 'JOD',
  Jpy = 'JPY',
  Kes = 'KES',
  Kgs = 'KGS',
  Khr = 'KHR',
  Kmf = 'KMF',
  Kpw = 'KPW',
  Krw = 'KRW',
  Kwd = 'KWD',
  Kyd = 'KYD',
  Kzt = 'KZT',
  Lak = 'LAK',
  Lbp = 'LBP',
  Lkr = 'LKR',
  Lrd = 'LRD',
  Lsl = 'LSL',
  Ltl = 'LTL',
  Lvl = 'LVL',
  Lyd = 'LYD',
  Mad = 'MAD',
  Mdl = 'MDL',
  Mga = 'MGA',
  Mkd = 'MKD',
  Mmk = 'MMK',
  Mnt = 'MNT',
  Mop = 'MOP',
  Mro = 'MRO',
  Mru = 'MRU',
  Mtl = 'MTL',
  Mur = 'MUR',
  Mvr = 'MVR',
  Mwk = 'MWK',
  Mxn = 'MXN',
  Myr = 'MYR',
  Mzn = 'MZN',
  Nad = 'NAD',
  Ngn = 'NGN',
  Nio = 'NIO',
  Nok = 'NOK',
  Npr = 'NPR',
  Nzd = 'NZD',
  Omr = 'OMR',
  Pab = 'PAB',
  Pen = 'PEN',
  Pgk = 'PGK',
  Php = 'PHP',
  Pkr = 'PKR',
  Pln = 'PLN',
  Pyg = 'PYG',
  Qar = 'QAR',
  Ron = 'RON',
  Rsd = 'RSD',
  Rub = 'RUB',
  Rwf = 'RWF',
  Sar = 'SAR',
  Sbd = 'SBD',
  Scr = 'SCR',
  Sdg = 'SDG',
  Sek = 'SEK',
  Sgd = 'SGD',
  Shp = 'SHP',
  Skk = 'SKK',
  Sll = 'SLL',
  Sos = 'SOS',
  Srd = 'SRD',
  Ssp = 'SSP',
  Std = 'STD',
  Svc = 'SVC',
  Syp = 'SYP',
  Szl = 'SZL',
  Thb = 'THB',
  Tjs = 'TJS',
  Tmm = 'TMM',
  Tmt = 'TMT',
  Tnd = 'TND',
  Top = 'TOP',
  Try = 'TRY',
  Ttd = 'TTD',
  Twd = 'TWD',
  Tzs = 'TZS',
  Uah = 'UAH',
  Ugx = 'UGX',
  Usd = 'USD',
  Uyu = 'UYU',
  Uzs = 'UZS',
  Vef = 'VEF',
  Ves = 'VES',
  Vnd = 'VND',
  Vuv = 'VUV',
  Wst = 'WST',
  Xaf = 'XAF',
  Xag = 'XAG',
  Xau = 'XAU',
  Xba = 'XBA',
  Xbb = 'XBB',
  Xbc = 'XBC',
  Xbd = 'XBD',
  Xcd = 'XCD',
  Xdr = 'XDR',
  Xfu = 'XFU',
  Xof = 'XOF',
  Xpd = 'XPD',
  Xpf = 'XPF',
  Xpt = 'XPT',
  Xts = 'XTS',
  Yer = 'YER',
  Zar = 'ZAR',
  Zmk = 'ZMK',
  Zmw = 'ZMW',
  Zwd = 'ZWD',
  Zwl = 'ZWL',
  Zwn = 'ZWN',
  Zwr = 'ZWR'
}

export type GeminiDateArgValidation = {
  __typename?: 'GeminiDateArgValidation';
  arg: Scalars['String'];
  message?: Maybe<Scalars['String']>;
  type: GeminiValidationTypeEnum;
};

export enum GeminiFontSizeEnum {
  Lg = 'lg',
  Md = 'md',
  Sm = 'sm',
  Xl = 'xl',
  Xs = 'xs'
}

export type GeminiFormTextFieldComponent = GeminiComponentInterface & {
  __typename?: 'GeminiFormTextFieldComponent';
  id: Scalars['String'];
  label?: Maybe<Scalars['String']>;
  value: Scalars['String'];
};

export type GeminiGraphicComponent = GeminiComponentInterface & {
  __typename?: 'GeminiGraphicComponent';
  graphicName: GeminiGraphicNameEnum;
  id: Scalars['String'];
};

export enum GeminiGraphicNameEnum {
  Success = 'success'
}

export type GeminiHeader = {
  __typename?: 'GeminiHeader';
  status: GeminiHeaderStatusEnum;
  title: Scalars['String'];
};

export enum GeminiHeaderStatusEnum {
  EmailSent = 'email_sent',
  Error = 'error',
  Success = 'success'
}

export type GeminiHorizontalRuleComponent = GeminiComponentInterface & {
  __typename?: 'GeminiHorizontalRuleComponent';
  id: Scalars['String'];
};

export enum GeminiIconNameEnum {
  Add = 'add',
  ArrowLargeForwardOutlined = 'arrow_large_forward_outlined',
  Flash = 'flash',
  InfoOutlined = 'info_outlined',
  Key = 'key',
  Museum = 'museum',
  Pen = 'pen',
  Star = 'star',
  User = 'user'
}

export type GeminiIntegerArgValidation = {
  __typename?: 'GeminiIntegerArgValidation';
  args: Array<Scalars['Int']>;
  message?: Maybe<Scalars['String']>;
  type: GeminiValidationTypeEnum;
};

export type GeminiListItemComponent = GeminiComponentInterface & {
  __typename?: 'GeminiListItemComponent';
  bulletIconName: GeminiIconNameEnum;
  id: Scalars['String'];
  message: Scalars['String'];
  title: Scalars['String'];
};

/** The root mutation type for the banking AI GraphQL schema. */
export type GeminiMutation = {
  __typename?: 'GeminiMutation';
  geminiNextPane?: Maybe<GeminiNextPanePayload>;
  geminiStartWorkflow?: Maybe<GeminiStartWorkflowPayload>;
  /** AI-powered mutations for banking operations. */
  aiBanking?: Maybe<AIBankingMutationResponse>;
};

export type AIBankingMutationResponse = {
  __typename?: 'AIBankingMutationResponse';
  /** Initiates a fund transfer between accounts. */
  initiateTransfer?: Maybe<Transaction>;
  /** Applies for a loan on behalf of a customer. */
  applyForLoan?: Maybe<LoanApplication>;
  /** Updates customer contact information. */
  updateCustomerContact?: Maybe<CustomerProfile>;
  /** Sends a message within an AI chat session. */
  sendAIChatMessage?: Maybe<AIChatMessage>;
  /** Starts a new AI chat session. */
  startNewAIChatSession?: Maybe<AIChatSession>;
  /** Optimizes customer spending based on AI analysis. */
  optimizeSpending?: Maybe<SpendingOptimizationReport>;
  /** Sets fraud alert preferences for a customer. */
  setFraudAlertPreference?: Maybe<CustomerProfile>;
  /** Executes an AI-recommended investment action. */
  executeInvestmentRecommendation?: Maybe<GeminiAIInvestmentActionResponse>;
  /** Adjusts a customer's budget based on AI recommendations. */
  adjustCustomerBudget?: Maybe<GeminiAIBudgetAdjustmentResult>;
  /** Flags a transaction or activity as suspicious for further review. */
  flagSuspiciousActivity?: Maybe<GeminiAISuspiciousActivityReport>;
  /** Personalizes a marketing offer for a customer. */
  personalizeMarketingOffer?: Maybe<GeminiAIMarketingOffer>;
  /** Automates a recurring bill payment based on AI analysis. */
  automateBillPayment?: Maybe<GeminiAIAutomatedBillPayment>;
  /** Initiates an AI-driven compliance audit. */
  initiateAIComplianceAudit?: Maybe<GeminiAIComplianceAudit>;
  /** Updates a customer's financial goals using AI insights. */
  updateFinancialGoal?: Maybe<GeminiAIPersonalizedFinancialGoal>;
  /** Sets up a real-time fraud monitoring alert. */
  setupRealtimeFraudAlert?: Maybe<GeminiAIRealtimeFraudAlert>;
  /** Creates a personalized financial product recommendation. */
  createProductRecommendation?: Maybe<GeminiAIFinancialProductRecommendation>;
  /** Records a voice bot interaction for analysis. */
  recordVoiceBotInteraction?: Maybe<GeminiAIVoiceBotInteraction>;
  /** Executes a smart contract via AI. */
  executeSmartContract?: Maybe<GeminiAISmartContractExecution>;
};


export type GeminiMutationGeminiNextPaneArgs = {
  input: GeminiNextPaneInput;
};


export type GeminiMutationGeminiStartWorkflowArgs = {
  input: GeminiStartWorkflowInput;
};

export type GeminiMutationAIBankingArgs = {
  input: AIBankingMutationInput;
};

/** Input for AI banking mutations. This will route to specific AI functionalities. */
export type AIBankingMutationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Input for initiating a fund transfer. */
  transferInput?: InputMaybe<TransferInput>;
  /** Input for applying for a loan. */
  loanApplicationInput?: InputMaybe<LoanApplicationInput>;
  /** Input for updating customer contact details. */
  customerContactInput?: InputMaybe<ContactDetailsInput>;
  /** Input for sending an AI chat message. */
  chatMessageInput?: InputMaybe<AIChatMessageInput>;
  /** Input for starting a new AI chat session. */
  newChatSessionInput?: InputMaybe<NewChatSessionInput>;
  /** Input for optimizing customer spending. */
  spendingOptimizationInput?: InputMaybe<SpendingOptimizationInput>;
  /** Input for setting fraud alert preferences. */
  fraudAlertPreferenceInput?: InputMaybe<FraudAlertPreferenceInput>;
  /** Input for executing an AI investment recommendation. */
  investmentActionInput?: InputMaybe<GeminiAIInvestmentActionInput>;
  /** Input for adjusting a customer's budget. */
  budgetAdjustmentInput?: InputMaybe<GeminiAIBudgetAdjustmentInput>;
  /** Input for flagging suspicious activity. */
  flagSuspiciousActivityInput?: InputMaybe<GeminiAIFlagSuspiciousActivityInput>;
  /** Input for personalizing a marketing offer. */
  personalizeMarketingOfferInput?: InputMaybe<GeminiAIPersonalizeMarketingOfferInput>;
  /** Input for automating a bill payment. */
  automateBillPaymentInput?: InputMaybe<GeminiAIAutomateBillPaymentInput>;
  /** Input for initiating an AI-driven compliance audit. */
  initiateAIComplianceAuditInput?: InputMaybe<GeminiAIComplianceAuditInput>;
  /** Input for updating a customer's financial goal. */
  updateFinancialGoalInput?: InputMaybe<GeminiAIUpdateFinancialGoalInput>;
  /** Input for setting up a real-time fraud alert. */
  setupRealtimeFraudAlertInput?: InputMaybe<GeminiAISetupRealtimeFraudAlertInput>;
  /** Input for creating a product recommendation. */
  createProductRecommendationInput?: InputMaybe<GeminiAICreateProductRecommendationInput>;
  /** Input for recording a voice bot interaction. */
  recordVoiceBotInteractionInput?: InputMaybe<GeminiAIRecordVoiceBotInteractionInput>;
  /** Input for executing a smart contract. */
  executeSmartContractInput?: InputMaybe<GeminiAIExecuteSmartContractInput>;
};

export type GeminiNavigation = {
  __typename?: 'GeminiNavigation';
  showBack: Scalars['Boolean'];
};

/** Autogenerated input type of GeminiNextPane */
export type GeminiNextPaneInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  nodeId: Scalars['String'];
  paneOutput: GeminiPaneOutput;
  selectedActionId: Scalars['String'];
  workflowSessionId: Scalars['ID'];
};

/** Autogenerated return type of GeminiNextPane. */
export type GeminiNextPanePayload = {
  __typename?: 'GeminiNextPanePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  errors?: Maybe<GeminiPaneOutputError>;
  nextPane?: Maybe<GeminiPane>;
};

export type GeminiNoArgValidation = {
  __typename?: 'GeminiNoArgValidation';
  message?: Maybe<Scalars['String']>;
  type: GeminiValidationTypeEnum;
};

export type GeminiOption = {
  __typename?: 'GeminiOption';
  icon?: Maybe<Scalars['String']>;
  label: Scalars['String'];
  value: Scalars['String'];
};

export type GeminiPane = {
  __typename?: 'GeminiPane';
  header?: Maybe<GeminiHeader>;
  layout: GeminiPaneLayout;
  navigation: GeminiNavigation;
  nodeId: Scalars['String'];
  paneOutputType: Scalars['String'];
  showLogo: Scalars['Boolean'];
};

export type GeminiPaneLayout = GeminiBeneficialOwnersListLayout | GeminiButtonLayout | GeminiPaymentMethodSelectLayout | GeminiPlainLayout;

export type GeminiPaneOutput =
  { accountCollectionPaneOutput: GeminiWorkflows__AccountCollectionPaneOutput; bankAccountCollectionPaneOutput?: never; beneficialOwnersCollectionPaneOutput?: never; emailCollectionPaneOutput?: never; emptyPaneOutput?: never; identityDetailsCollectionPaneOutput?: never; paymentDetailCollectionPaneOutput?: never; taxpayerIdentifierCollectionPaneOutput?: never; }
  |  { accountCollectionPaneOutput?: never; bankAccountCollectionPaneOutput: GeminiWorkflows__BankAccountCollectionPaneOutput; beneficialOwnersCollectionPaneOutput?: never; emailCollectionPaneOutput?: never; emptyPaneOutput?: never; identityDetailsCollectionPaneOutput?: never; paymentDetailCollectionPaneOutput?: never; taxpayerIdentifierCollectionPaneOutput?: never; }
  |  { accountCollectionPaneOutput?: never; bankAccountCollectionPaneOutput?: never; beneficialOwnersCollectionPaneOutput: GeminiWorkflows__BeneficialOwnersCollectionPaneOutput; emailCollectionPaneOutput?: never; emptyPaneOutput?: never; identityDetailsCollectionPaneOutput?: never; paymentDetailCollectionPaneOutput?: never; taxpayerIdentifierCollectionPaneOutput?: never; }
  |  { accountCollectionPaneOutput?: never; bankAccountCollectionPaneOutput?: never; beneficialOwnersCollectionPaneOutput?: never; emailCollectionPaneOutput: GeminiWorkflows__EmailCollectionPaneOutput; emptyPaneOutput?: never; identityDetailsCollectionPaneOutput?: never; paymentDetailCollectionPaneOutput?: never; taxpayerIdentifierCollectionPaneOutput?: never; }
  |  { accountCollectionPaneOutput?: never; bankAccountCollectionPaneOutput?: never; beneficialOwnersCollectionPaneOutput?: never; emailCollectionPaneOutput?: never; emptyPaneOutput: GeminiWorkflows__EmptyPaneOutput; identityDetailsCollectionPaneOutput?: never; paymentDetailCollectionPaneOutput?: never; taxpayerIdentifierCollectionPaneOutput?: never; }
  |  { accountCollectionPaneOutput?: never; bankAccountCollectionPaneOutput?: never; beneficialOwnersCollectionPaneOutput?: never; emailCollectionPaneOutput?: never; emptyPaneOutput?: never; identityDetailsCollectionPaneOutput: GeminiWorkflows__IdentityDetailsCollectionPaneOutput; paymentDetailCollectionPaneOutput?: never; taxpayerIdentifierCollectionPaneOutput?: never; }
  |  { accountCollectionPaneOutput?: never; bankAccountCollectionPaneOutput?: never; beneficialOwnersCollectionPaneOutput?: never; emailCollectionPaneOutput?: never; emptyPaneOutput?: never; identityDetailsCollectionPaneOutput?: never; paymentDetailCollectionPaneOutput: GeminiWorkflows__PaymentDetailCollectionPaneOutput; taxpayerIdentifierCollectionPaneOutput?: never; }
  |  { accountCollectionPaneOutput?: never; bankAccountCollectionPaneOutput?: never; beneficialOwnersCollectionPaneOutput?: never; emailCollectionPaneOutput?: never; emptyPaneOutput?: never; identityDetailsCollectionPaneOutput?: never; paymentDetailCollectionPaneOutput?: never; taxpayerIdentifierCollectionPaneOutput: GeminiWorkflows__TaxpayerIdentifierCollectionPaneOutput; };

export type GeminiPaneOutputError = {
  __typename?: 'GeminiPaneOutputError';
  componentErrors?: Maybe<Array<GeminiComponentError>>;
  generalErrors?: Maybe<Array<Scalars['String']>>;
  nodeId: Scalars['String'];
};

export type GeminiPaymentMethodOption = {
  __typename?: 'GeminiPaymentMethodOption';
  actionId: Scalars['String'];
  description: Scalars['String'];
  iconName: GeminiIconNameEnum;
  paymentType?: Maybe<GeminiPaymentTypeEnum>;
  title: Scalars['String'];
};

export type GeminiPaymentMethodSelectLayout = {
  __typename?: 'GeminiPaymentMethodSelectLayout';
  body: Array<GeminiComponent>;
  paymentMethodOptions: Array<GeminiPaymentMethodOption>;
};

export enum GeminiPaymentTypeEnum {
  Ach = 'ach',
  AuBecs = 'au_becs',
  Bacs = 'bacs',
  Book = 'book',
  Card = 'card',
  Chats = 'chats',
  Check = 'check',
  CrossBorder = 'cross_border',
  DkNets = 'dk_nets',
  Eft = 'eft',
  HuIcs = 'hu_ics',
  Interac = 'interac',
  Masav = 'masav',
  MxCcen = 'mx_ccen',
  Neft = 'neft',
  Nics = 'nics',
  NzBecs = 'nz_becs',
  PlElixir = 'pl_elixir',
  Provxchange = 'provxchange',
  RoSent = 'ro_sent',
  Rtp = 'rtp',
  SeBankgirot = 'se_bankgirot',
  Sen = 'sen',
  Sepa = 'sepa',
  SgGiro = 'sg_giro',
  Sic = 'sic',
  Signet = 'signet',
  Sknbi = 'sknbi',
  Wire = 'wire',
  Zengin = 'zengin'
}

export type GeminiPlainLayout = {
  __typename?: 'GeminiPlainLayout';
  body: Array<GeminiComponent>;
};

/** The root query type for the banking AI GraphQL schema. */
export type GeminiQuery = {
  __typename?: 'GeminiQuery';
  geminiTest?: Maybe<GeminiTest>;
  /** AI-powered queries for banking information. */
  aiBanking?: Maybe<AIBankingQueryResponse>;
};


export type GeminiQueryGeminiTestArgs = {
  id: Scalars['ID'];
};

export type GeminiQueryAIBankingArgs = {
  input: AIBankingQueryInput;
};

/** Input for AI banking queries, allowing specific AI functionalities to be requested. */
export type AIBankingQueryInput = {
  /** A unique identifier for the client performing the query. */
  clientQueryId?: InputMaybe<Scalars['String']>;
  /** Customer ID for operations requiring customer context. */
  customerId?: InputMaybe<Scalars['ID']>;
  /** Account ID for operations requiring account context. */
  accountId?: InputMaybe<Scalars['ID']>;
  /** Session ID for continuing an AI chat. */
  chatSessionId?: InputMaybe<Scalars['ID']>;
  /** Start date for transaction history. */
  startDate?: InputMaybe<Scalars['Date']>;
  /** End date for transaction history. */
  endDate?: InputMaybe<Scalars['Date']>;
  /** Transaction ID for fraud detection. */
  transactionId?: InputMaybe<Scalars['ID']>;
  /** Category for spending analysis. */
  category?: InputMaybe<Scalars['String']>;
  /** Sentiment analysis target (e.g., 'customer_feedback', 'market_news'). */
  sentimentTarget?: InputMaybe<Scalars['String']>;
  /** ID of a specific investment opportunity. */
  investmentOpportunityId?: InputMaybe<Scalars['ID']>;
  /** Risk assessment scope (e.g., 'CUSTOMER_CREDIT', 'PORTFOLIO_LIQUIDITY'). */
  riskAssessmentScope?: InputMaybe<Scalars['String']>;
  /** Number of periods for financial forecasting (e.g., months). */
  forecastPeriods?: InputMaybe<Scalars['Int']>;
  /** A keyword or phrase for document search. */
  documentKeyword?: InputMaybe<Scalars['String']>;
  /** Product ID for detailed recommendation insights. */
  productId?: InputMaybe<Scalars['ID']>;
};

export type AIBankingQueryResponse = {
  __typename?: 'AIBankingQueryResponse';
  /** Retrieves a specific AI chat session. */
  getAIChatSession?: Maybe<AIChatSession>;
  /** Lists all bank accounts for a given customer. */
  listCustomerAccounts?: Maybe<Array<BankAccount>>;
  /** Retrieves transaction history for a specific bank account. */
  listAccountTransactions?: Maybe<Array<Transaction>>;
  /** Retrieves the profile details for a given customer. */
  getCustomerProfile?: Maybe<CustomerProfile>;
  /** Provides insights or recommendations based on customer data. */
  getBankingInsights?: Maybe<BankingInsight>;
  /** Retrieves a financial forecast for a given customer. */
  getFinancialForecast?: Maybe<FinancialForecast>;
  /** Detects potential fraud for a given transaction. */
  detectFraud?: Maybe<FraudDetectionReport>;
  /** Provides personalized financial recommendations for a customer. */
  getPersonalizedRecommendations?: Maybe<Array<Recommendation>>;
  /** Identifies and provides investment opportunities tailored to a customer's profile. */
  getInvestmentOpportunities?: Maybe<Array<GeminiAIInvestmentOpportunity>>;
  /** Assesses various financial risks for a customer or portfolio. */
  getRiskAssessment?: Maybe<GeminiAIRiskAssessmentReport>;
  /** Analyzes customer spending patterns to identify trends and anomalies. */
  analyzeSpendingPatterns?: Maybe<GeminiAISpendingPatternAnalysis>;
  /** Predicts future transactions or financial events. */
  predictFutureTransactions?: Maybe<Array<GeminiAITransactionPrediction>>;
  /** Performs sentiment analysis on customer feedback or market data. */
  getSentimentAnalysisReport?: Maybe<GeminiAISentimentAnalysisReport>;
  /** Provides a comprehensive financial health score and its contributing factors. */
  getFinancialHealthScore?: Maybe<GeminiAIFinancialHealthScore>;
  /** Retrieves a list of personalized alerts for the customer. */
  getPersonalizedAlerts?: Maybe<Array<GeminiAIPersonalizedAlert>>;
  /** Classifies customers into segments based on AI-driven behavioral analysis. */
  getCustomerSegmentation?: Maybe<Array<GeminiAICustomerSegmentation>>;
  /** Provides a real-time fraud score for a given transaction or customer. */
  getFraudScore?: Maybe<GeminiAIFraudScore>;
  /** Analyzes market trends relevant to the customer's portfolio or interests. */
  getMarketTrendAnalysis?: Maybe<Array<GeminiAIMarketTrendAnalysis>>;
  /** Assesses a customer's eligibility for various loan products. */
  getLoanEligibilityAssessment?: Maybe<GeminiAILoanEligibilityAssessment>;
  /** Analyzes a customer's credit score and provides improvement recommendations. */
  getCreditScoreAnalysis?: Maybe<GeminiAICreditScoreAnalysis>;
  /** Analyzes uploaded documents for key information and compliance. */
  analyzeDocument?: Maybe<GeminiAIDocumentAnalysisResult>;
  /** Retrieves the status of quantum-safe encryption for accounts. */
  getQuantumSafeEncryptionStatus?: Maybe<GeminiAIQuantumSafeEncryptionStatus>;
  /** Provides insights from neuromorphic processor performance. */
  getNeuromorphicProcessorStatus?: Maybe<GeminiAINeuromorphicProcessorStatus>;
  /** Generates a digital twin financial model for advanced simulations. */
  getDigitalTwinFinancialModel?: Maybe<GeminiAIDigitalTwinFinancialModel>;
  /** Provides a comprehensive report on current cross-sell opportunities. */
  getCrossSellOpportunities?: Maybe<Array<GeminiAICrossSellOpportunity>>;
  /** Provides a comprehensive report on current up-sell opportunities. */
  getUpSellOpportunities?: Maybe<Array<GeminiAIUpSellOpportunity>>;
  /** Retrieves a list of a customer's financial goals, potentially AI-generated. */
  getFinancialGoals?: Maybe<Array<GeminiAIPersonalizedFinancialGoal>>;
};

/** Represents an AI-generated banking insight or recommendation. */
export type BankingInsight = {
  __typename?: 'BankingInsight';
  /** A unique identifier for the insight. */
  id: Scalars['ID'];
  /** The type of insight (e.g., 'SpendingAlert', 'SavingsRecommendation', 'InvestmentOpportunity'). */
  type: Scalars['String'];
  /** A summary or title for the insight. */
  title: Scalars['String'];
  /** Detailed description of the insight. */
  description: Scalars['String'];
  /** Suggested actions related to the insight. */
  suggestedActions?: Maybe<Array<BankingAction>>;
  /** Associated data in JSON format for the AI to process. */
  contextData?: Maybe<Scalars['JSONObject']>;
};

/** Represents a suggested action related to a banking insight. */
export type BankingAction = {
  __typename?: 'BankingAction';
  /** A unique identifier for the action. */
  id: Scalars['ID'];
  /** The label for the action (e.g., "Transfer Funds", "Review Budget"). */
  label: Scalars['String'];
  /** A description of what the action entails. */
  description?: Maybe<Scalars['String']>;
  /** The action type, useful for frontend mapping (e.g., 'NAVIGATE', 'MUTATE'). */
  actionType: Scalars['String'];
  /** Parameters required to execute this action. */
  parameters?: Maybe<Scalars['JSONObject']>;
};

/** Represents a message in an AI conversation with a customer. */
export type AIChatMessage = {
  __typename?: 'AIChatMessage';
  /** Unique ID of the message. */
  id: Scalars['ID'];
  /** The content of the message. */
  content: Scalars['String'];
  /** The sender of the message (e.g., 'USER', 'AI'). */
  sender: Scalars['String'];
  /** Timestamp when the message was created. */
  timestamp: Scalars['Date'];
  /** Optional context or metadata from the AI. */
  metadata?: Maybe<Scalars['JSONObject']>;
};

/** Represents an ongoing chat session with the banking AI. */
export type AIChatSession = {
  __typename?: 'AIChatSession';
  /** Unique ID of the chat session. */
  id: Scalars['ID'];
  /** The customer associated with this session. */
  customerId: Scalars['ID'];
  /** List of messages in the session, ordered chronologically. */
  messages: Array<AIChatMessage>;
  /** Current status of the session (e.g., 'ACTIVE', 'CLOSED'). */
  status: Scalars['String'];
  /** Timestamp when the session was created. */
  createdAt: Scalars['Date'];
  /** Timestamp of the last update to the session. */
  updatedAt: Scalars['Date'];
};

/** Input for sending a new message to an existing AI chat session. */
export type AIChatMessageInput = {
  /** The ID of the chat session to send the message to. */
  sessionId: Scalars['ID'];
  /** The content of the message from the user. */
  content: Scalars['String'];
  /** Optional metadata to pass to the AI. */
  metadata?: InputMaybe<Scalars['JSONObject']>;
};

/** Input for starting a new AI chat session. */
export type NewChatSessionInput = {
  /** The ID of the customer initiating the chat. */
  customerId: Scalars['ID'];
  /** An optional initial message from the user. */
  initialMessage?: InputMaybe<Scalars['String']>;
};

/** Represents a bank account with financial details. */
export type BankAccount = {
  __typename?: 'BankAccount';
  /** Unique identifier for the account. */
  id: Scalars['ID'];
  /** The account number (masked for security). */
  accountNumber: Scalars['String'];
  /** The current balance of the account. */
  balance: Scalars['Float'];
  /** The currency of the account. */
  currency: GeminiCurrencyEnum;
  /** Type of account (e.g., 'SAVINGS', 'CHECKING', 'LOAN'). */
  accountType: Scalars['String'];
  /** Name of the account holder. */
  accountHolderName: Scalars['String'];
  /** Date the account was opened. */
  openedDate: Scalars['Date'];
};

/** Represents a financial transaction. */
export type Transaction = {
  __typename?: 'Transaction';
  /** Unique identifier for the transaction. */
  id: Scalars['ID'];
  /** The bank account from which the transaction originated. */
  fromAccount?: Maybe<BankAccount>;
  /** The bank account to which the transaction was made. */
  toAccount?: Maybe<BankAccount>;
  /** The amount of the transaction. */
  amount: Scalars['Float'];
  /** The currency of the transaction. */
  currency: GeminiCurrencyEnum;
  /** Description of the transaction. */
  description: Scalars['String'];
  /** Date and time of the transaction. */
  transactionDate: Scalars['Date'];
  /** Type of transaction (e.g., 'DEBIT', 'CREDIT', 'TRANSFER', 'BILL_PAYMENT'). */
  transactionType: Scalars['String'];
  /** Status of the transaction (e.g., 'PENDING', 'COMPLETED', 'FAILED'). */
  status: Scalars['String'];
};

/** Input for initiating a fund transfer. */
export type TransferInput = {
  /** The ID of the account from which funds will be transferred. */
  fromAccountId: Scalars['ID'];
  /** The ID of the account to which funds will be transferred. */
  toAccountId: Scalars['ID'];
  /** The amount to transfer. */
  amount: Scalars['Float'];
  /** The currency of the transfer. */
  currency: GeminiCurrencyEnum;
  /** Optional description for the transfer. */
  description?: InputMaybe<Scalars['String']>;
};

/** Represents a customer's profile information. */
export type CustomerProfile = {
  __typename?: 'CustomerProfile';
  /** Unique identifier for the customer. */
  id: Scalars['ID'];
  /** First name of the customer. */
  firstName: Scalars['String'];
  /** Last name of the customer. */
  lastName: Scalars['String'];
  /** Date of birth of the customer. */
  dateOfBirth?: Maybe<Scalars['Date']>;
  /** Primary email address. */
  email: Scalars['String'];
  /** Primary phone number. */
  phoneNumber?: Maybe<Scalars['String']>;
  /** Physical address line 1. */
  addressLine1?: Maybe<Scalars['String']>;
  /** Physical address line 2. */
  addressLine2?: Maybe<Scalars['String']>;
  /** City of residence. */
  city?: Maybe<Scalars['String']>;
  /** State or province of residence. */
  state?: Maybe<Scalars['String']>;
  /** Postal code. */
  postalCode?: Maybe<Scalars['String']>;
  /** Country of residence. */
  country?: Maybe<Scalars['String']>;
  /** The AI's confidence score in the profile data. */
  aiConfidenceScore?: Maybe<Scalars['Float']>;
  /** Fraud alert preferences for the customer. */
  fraudAlertsEnabled?: Maybe<Scalars['Boolean']>;
  /** Threshold for high-value transaction alerts. */
  highValueTransactionThreshold?: Maybe<Scalars['Float']>;
};

/** Input for updating customer contact details. */
export type ContactDetailsInput = {
  /** The ID of the customer whose contact details are being updated. */
  customerId: Scalars['ID'];
  /** New email address. */
  email?: InputMaybe<Scalars['String']>;
  /** New phone number. */
  phoneNumber?: InputMaybe<Scalars['String']>;
  /** New address line 1. */
  addressLine1?: InputMaybe<Scalars['String']>;
  /** New address line 2. */
  addressLine2?: InputMaybe<Scalars['String']>;
  /** New city. */
  city?: InputMaybe<Scalars['String']>;
  /** New state or province. */
  state?: InputMaybe<Scalars['String']>;
  /** New postal code. */
  postalCode?: InputMaybe<Scalars['String']>;
  /** New country. */
  country?: InputMaybe<Scalars['String']>;
};

/** Represents a loan application. */
export type LoanApplication = {
  __typename?: 'LoanApplication';
  /** Unique identifier for the loan application. */
  id: Scalars['ID'];
  /** The customer who applied for the loan. */
  customerId: Scalars['ID'];
  /** The requested loan amount. */
  amount: Scalars['Float'];
  /** The currency of the loan. */
  currency: GeminiCurrencyEnum;
  /** Type of loan (e.g., 'PERSONAL', 'HOME', 'AUTO'). */
  loanType: Scalars['String'];
  /** Current status of the application (e.g., 'PENDING', 'APPROVED', 'REJECTED'). */
  status: Scalars['String'];
  /** Date the application was submitted. */
  applicationDate: Scalars['Date'];
  /** Optional terms of the loan. */
  terms?: Maybe<Scalars['String']>;
};

/** Input for a loan application. */
export type LoanApplicationInput = {
  /** The ID of the customer applying for the loan. */
  customerId: Scalars['ID'];
  /** The requested loan amount. */
  amount: Scalars['Float'];
  /** The currency of the loan. */
  currency: GeminiCurrencyEnum;
  /** Type of loan (e.g., 'PERSONAL', 'HOME', 'AUTO'). */
  loanType: Scalars['String'];
  /** Optional additional details for the application. */
  details?: InputMaybe<Scalars['String']>;
};

/** Represents a financial forecast for a customer. */
export type FinancialForecast = {
  __typename?: 'FinancialForecast';
  /** Unique ID for the forecast. */
  id: Scalars['ID'];
  /** The customer for whom the forecast is generated. */
  customerId: Scalars['ID'];
  /** The period the forecast covers (e.g., 'MONTHLY', 'QUARTERLY', 'ANNUAL'). */
  period: Scalars['String'];
  /** Projected income. */
  projectedIncome: Scalars['Float'];
  /** Projected expenses. */
  projectedExpenses: Scalars['Float'];
  /** Projected savings. */
  projectedSavings: Scalars['Float'];
  /** Detailed breakdown of the forecast in JSON format. */
  details?: Maybe<Scalars['JSONObject']>;
  /** Date the forecast was generated. */
  generatedDate: Scalars['Date'];
};

/** Represents a report on fraud detection for a transaction. */
export type FraudDetectionReport = {
  __typename?: 'FraudDetectionReport';
  /** Unique ID for the report. */
  id: Scalars['ID'];
  /** The transaction ID that was analyzed. */
  transactionId: Scalars['ID'];
  /** Overall fraud risk level (e.g., 'LOW', 'MEDIUM', 'HIGH'). */
  riskLevel: Scalars['String'];
  /** AI's confidence score in the fraud detection (0-1). */
  confidenceScore: Scalars['Float'];
  /** Reasons or indicators for the detected risk. */
  reasons?: Maybe<Array<Scalars['String']>>;
  /** Suggested actions to take. */
  suggestedActions?: Maybe<Array<BankingAction>>;
  /** Date the report was generated. */
  generatedDate: Scalars['Date'];
};

/** Represents a personalized financial recommendation. */
export type Recommendation = {
  __typename?: 'Recommendation';
  /** Unique ID for the recommendation. */
  id: Scalars['ID'];
  /** The customer to whom the recommendation is provided. */
  customerId: Scalars['ID'];
  /** Type of recommendation (e.g., 'SAVINGS', 'INVESTMENT', 'DEBT_REDUCTION'). */
  type: Scalars['String'];
  /** A concise title for the recommendation. */
  title: Scalars['String'];
  /** Detailed explanation of the recommendation. */
  description: Scalars['String'];
  /** Specific metrics or values associated with the recommendation (e.g., interest rate for a savings account). */
  metrics?: Maybe<Scalars['JSONObject']>;
  /** Suggested actions to implement the recommendation. */
  actions?: Maybe<Array<BankingAction>>;
  /** Date the recommendation was generated. */
  generatedDate: Scalars['Date'];
};

/** Input for optimizing customer spending. */
export type SpendingOptimizationInput = {
  /** The ID of the customer whose spending is being optimized. */
  customerId: Scalars['ID'];
  /** The spending category to optimize (e.g., 'GROCERIES', 'ENTERTAINMENT'). */
  category?: InputMaybe<Scalars['String']>;
  /** The target amount to reduce spending by in the specified category. */
  targetReductionAmount?: InputMaybe<Scalars['Float']>;
  /** The period for optimization (e.g., 'MONTHLY'). */
  period?: InputMaybe<Scalars['String']>;
};

/** Represents a report on spending optimization. */
export type SpendingOptimizationReport = {
  __typename?: 'SpendingOptimizationReport';
  /** Unique ID for the report. */
  id: Scalars['ID'];
  /** The customer whose spending was optimized. */
  customerId: Scalars['ID'];
  /** The category that was optimized. */
  category?: Maybe<Scalars['String']>;
  /** The actual amount saved or optimized. */
  actualReductionAmount: Scalars['Float'];
  /** Recommendations for further optimization. */
  recommendations?: Maybe<Array<Recommendation>>;
  /** Date the report was generated. */
  generatedDate: Scalars['Date'];
};

/** Input for setting fraud alert preferences. */
export type FraudAlertPreferenceInput = {
  /** The ID of the customer. */
  customerId: Scalars['ID'];
  /** Whether fraud alerts should be enabled. */
  enableFraudAlerts: Scalars['Boolean'];
  /** Optional: A new threshold for high-value transaction alerts. */
  newHighValueTransactionThreshold?: InputMaybe<Scalars['Float']>;
};

/** Represents an AI-identified investment opportunity. */
export type GeminiAIInvestmentOpportunity = {
  __typename?: 'GeminiAIInvestmentOpportunity';
  id: Scalars['ID'];
  /** Name or title of the investment. */
  name: Scalars['String'];
  /** Type of investment (e.g., 'STOCK', 'BOND', 'MUTUAL_FUND', 'REAL_ESTATE'). */
  type: Scalars['String'];
  /** Predicted return on investment. */
  projectedReturn: Scalars['Float'];
  /** Associated risk level (e.g., 'LOW', 'MEDIUM', 'HIGH'). */
  riskLevel: Scalars['String'];
  /** Detailed description and rationale from AI. */
  description: Scalars['String'];
  /** Date the opportunity was identified. */
  identifiedDate: Scalars['Date'];
  /** Recommended action, e.g., 'BUY', 'HOLD', 'SELL'. */
  recommendedAction: Scalars['String'];
  /** AI confidence score in the recommendation. */
  confidenceScore: Scalars['Float'];
  /** Relevant market data or news. */
  marketData?: Maybe<Scalars['JSONObject']>;
};

/** Input for executing an AI investment recommendation. */
export type GeminiAIInvestmentActionInput = {
  /** The ID of the investment opportunity to act upon. */
  opportunityId: Scalars['ID'];
  /** The type of action to take (e.g., 'BUY', 'SELL'). */
  actionType: Scalars['String'];
  /** The amount or quantity to invest/divest. */
  amount?: InputMaybe<Scalars['BigDecimal']>;
  /** Customer ID for context. */
  customerId: Scalars['ID'];
};

/** Response after attempting to execute an AI investment recommendation. */
export type GeminiAIInvestmentActionResponse = {
  __typename?: 'GeminiAIInvestmentActionResponse';
  /** Unique ID for the action taken. */
  actionId: Scalars['ID'];
  /** Status of the investment action (e.g., 'PENDING', 'COMPLETED', 'FAILED'). */
  status: Scalars['String'];
  /** Message detailing the outcome. */
  message: Scalars['String'];
  /** Timestamp of the action. */
  timestamp: Scalars['Date'];
  /** Reference to the original investment opportunity. */
  investmentOpportunity?: Maybe<GeminiAIInvestmentOpportunity>;
};

/** Represents an AI-generated risk assessment report. */
export type GeminiAIRiskAssessmentReport = {
  __typename?: 'GeminiAIRiskAssessmentReport';
  id: Scalars['ID'];
  /** The customer ID or portfolio ID for which the risk was assessed. */
  entityId: Scalars['ID'];
  /** Type of risk assessed (e.g., 'CREDIT_RISK', 'MARKET_RISK', 'LIQUIDITY_RISK'). */
  riskType: Scalars['String'];
  /** Overall risk rating (e.g., 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'). */
  overallRating: Scalars['String'];
  /** AI's confidence score in the assessment. */
  confidenceScore: Scalars['Float'];
  /** Key factors contributing to the risk assessment. */
  riskFactors: Array<Scalars['String']>;
  /** Recommended mitigation strategies. */
  mitigationStrategies?: Maybe<Array<Scalars['String']>>;
  /** Date the report was generated. */
  generatedDate: Scalars['Date'];
  /** Detailed breakdown of risks in JSON format. */
  details?: Maybe<Scalars['JSONObject']>;
};

/** Represents an AI analysis of customer spending patterns. */
export type GeminiAISpendingPatternAnalysis = {
  __typename?: 'GeminiAISpendingPatternAnalysis';
  id: Scalars['ID'];
  customerId: Scalars['ID'];
  /** Period covered by the analysis (e.g., 'LAST_MONTH', 'LAST_QUARTER'). */
  period: Scalars['String'];
  /** Dominant spending categories. */
  topCategories: Array<GeminiAISpendingCategory>;
  /** Identified spending anomalies or unusual patterns. */
  anomalies?: Maybe<Array<GeminiAISpendingAnomaly>>;
  /** Recommendations for optimizing spending. */
  recommendations?: Maybe<Array<Recommendation>>;
  /** Date the analysis was performed. */
  analysisDate: Scalars['Date'];
};

/** Represents a spending category with aggregated data. */
export type GeminiAISpendingCategory = {
  __typename?: 'GeminiAISpendingCategory';
  name: Scalars['String'];
  /** Total amount spent in this category. */
  totalAmount: Scalars['BigDecimal'];
  /** Percentage of total spending. */
  percentage: Scalars['Float'];
  /** Trend compared to previous periods (e.g., 'INCREASED', 'DECREASED', 'STABLE'). */
  trend: Scalars['String'];
};

/** Represents a detected anomaly in spending. */
export type GeminiAISpendingAnomaly = {
  __typename?: 'GeminiAISpendingAnomaly';
  id: Scalars['ID'];
  /** Description of the anomaly. */
  description: Scalars['String'];
  /** Associated transaction ID, if any. */
  transactionId?: Maybe<Scalars['ID']>;
  /** Severity of the anomaly (e.g., 'LOW', 'MEDIUM', 'HIGH'). */
  severity: Scalars['String'];
  /** AI's confidence in the anomaly detection. */
  confidenceScore: Scalars['Float'];
  /** Date the anomaly occurred. */
  date: Scalars['Date'];
};

/** Represents an AI prediction for a future transaction or event. */
export type GeminiAITransactionPrediction = {
  __typename?: 'GeminiAITransactionPrediction';
  id: Scalars['ID'];
  customerId: Scalars['ID'];
  /** Predicted transaction date. */
  predictedDate: Scalars['Date'];
  /** Predicted amount. */
  predictedAmount?: Maybe<Scalars['BigDecimal']>;
  /** Predicted currency. */
  predictedCurrency?: Maybe<GeminiCurrencyEnum>;
  /** Predicted description or type. */
  predictedType: Scalars['String'];
  /** AI's confidence score in the prediction. */
  confidenceScore: Scalars['Float'];
  /** Rationale for the prediction. */
  rationale?: Maybe<Scalars['String']>;
  /** Date the prediction was made. */
  predictionDate: Scalars['Date'];
};

/** Represents an AI sentiment analysis report. */
export type GeminiAISentimentAnalysisReport = {
  __typename?: 'GeminiAISentimentAnalysisReport';
  id: Scalars['ID'];
  /** Target of the analysis (e.g., 'CUSTOMER_FEEDBACK', 'MARKET_NEWS', 'PRODUCT_REVIEW'). */
  target: Scalars['String'];
  /** Overall sentiment (e.g., 'POSITIVE', 'NEUTRAL', 'NEGATIVE', 'MIXED'). */
  overallSentiment: Scalars['String'];
  /** Sentiment score, typically -1 to 1. */
  sentimentScore: Scalars['Float'];
  /** Key phrases or topics identified. */
  keyPhrases?: Maybe<Array<Scalars['String']>>;
  /** Source of the analyzed text. */
  source?: Maybe<Scalars['String']>;
  /** Date the analysis was performed. */
  analysisDate: Scalars['Date'];
  /** Raw text analyzed. */
  analyzedTextSample?: Maybe<Scalars['String']>;
};

/** Input for adjusting a customer's budget. */
export type GeminiAIBudgetAdjustmentInput = {
  customerId: Scalars['ID'];
  /** The category to adjust (e.g., 'GROCERIES'). */
  category: Scalars['String'];
  /** The new target amount for the budget. */
  newBudgetAmount: Scalars['BigDecimal'];
  /** The period for the budget (e.g., 'MONTHLY'). */
  period: Scalars['String'];
  /** Optional rationale for the adjustment. */
  rationale?: InputMaybe<Scalars['String']>;
};

/** Result of an AI-driven budget adjustment. */
export type GeminiAIBudgetAdjustmentResult = {
  __typename?: 'GeminiAIBudgetAdjustmentResult';
  id: Scalars['ID'];
  customerId: Scalars['ID'];
  /** The category that was adjusted. */
  category: Scalars['String'];
  /** The new budget amount. */
  newBudgetAmount: Scalars['BigDecimal'];
  /** The period of the budget. */
  period: Scalars['String'];
  /** Status of the adjustment (e.g., 'SUCCESS', 'FAILED'). */
  status: Scalars['String'];
  /** Message detailing the outcome. */
  message?: Maybe<Scalars['String']>;
  /** Date the adjustment was made. */
  adjustmentDate: Scalars['Date'];
};

/** Input for flagging suspicious activity. */
export type GeminiAIFlagSuspiciousActivityInput = {
  entityId: Scalars['ID'];
  /** Type of entity being flagged (e.g., 'TRANSACTION', 'ACCOUNT', 'CUSTOMER'). */
  entityType: Scalars['String'];
  /** Description of why the activity is suspicious. */
  reason: Scalars['String'];
  /** Severity of the suspicion (e.g., 'LOW', 'MEDIUM', 'HIGH'). */
  severity: Scalars['String'];
  /** Optional: additional context in JSON format. */
  contextData?: InputMaybe<Scalars['JSONObject']>;
};

/** Report generated when suspicious activity is flagged. */
export type GeminiAISuspiciousActivityReport = {
  __typename?: 'GeminiAISuspiciousActivityReport';
  id: Scalars['ID'];
  entityId: Scalars['ID'];
  entityType: Scalars['String'];
  reason: Scalars['String'];
  severity: Scalars['String'];
  /** Date the activity was flagged. */
  flaggedDate: Scalars['Date'];
  /** Status of the investigation (e.g., 'OPEN', 'UNDER_REVIEW', 'CLOSED'). */
  status: Scalars['String'];
  contextData?: Maybe<Scalars['JSONObject']>;
};

/** Represents a personalized marketing offer generated by AI. */
export type GeminiAIMarketingOffer = {
  __typename?: 'GeminiAIMarketingOffer';
  id: Scalars['ID'];
  customerId: Scalars['ID'];
  /** Title of the offer. */
  title: Scalars['String'];
  /** Detailed description of the offer. */
  description: Scalars['String'];
  /** Type of offer (e.g., 'LOAN_PRODUCT', 'CREDIT_CARD', 'SAVINGS_ACCOUNT', 'INVESTMENT_PLAN'). */
  offerType: Scalars['String'];
  /** Expiry date of the offer. */
  expiryDate?: Maybe<Scalars['Date']>;
  /** AI's reasoning for generating this offer for the customer. */
  aiRationale?: Maybe<Scalars['String']>;
  /** Parameters for taking up the offer. */
  parameters?: Maybe<Scalars['JSONObject']>;
  /** Date the offer was generated. */
  generatedDate: Scalars['Date'];
};

/** Input for personalizing a marketing offer. */
export type GeminiAIPersonalizeMarketingOfferInput = {
  customerId: Scalars['ID'];
  /** Desired offer type hint (e.g., 'LOAN_PRODUCT'). AI will decide if suitable. */
  preferredOfferType?: InputMaybe<Scalars['String']>;
  /** Optional budget range for the customer for financial products. */
  budgetRange?: InputMaybe<Scalars['String']>;
};

/** Represents an automated bill payment setup by AI. */
export type GeminiAIAutomatedBillPayment = {
  __typename?: 'GeminiAIAutomatedBillPayment';
  id: Scalars['ID'];
  customerId: Scalars['ID'];
  /** Name of the biller. */
  billerName: Scalars['String'];
  /** Account from which payment will be made. */
  fromAccountId: Scalars['ID'];
  /** Predicted next payment date. */
  nextPaymentDate: Scalars['Date'];
  /** Predicted payment amount. */
  predictedAmount: Scalars['BigDecimal'];
  /** Frequency of payment (e.g., 'MONTHLY', 'QUARTERLY'). */
  frequency: Scalars['String'];
  /** Status of the automation (e.g., 'ACTIVE', 'PAUSED'). */
  status: Scalars['String'];
  /** Date the automation was set up. */
  setupDate: Scalars['Date'];
  /** AI's rationale for suggesting automation. */
  aiRationale?: Maybe<Scalars['String']>;
};

/** Input for automating a bill payment. */
export type GeminiAIAutomateBillPaymentInput = {
  customerId: Scalars['ID'];
  /** ID of the account to pay from. */
  fromAccountId: Scalars['ID'];
  /** Name of the biller. */
  billerName: Scalars['String'];
  /** Optional: desired frequency. AI will determine optimal. */
  frequency?: InputMaybe<Scalars['String']>;
  /** Optional: target amount. AI can predict if not provided. */
  targetAmount?: InputMaybe<Scalars['BigDecimal']>;
};

/** Represents a financial health score for a customer. */
export type GeminiAIFinancialHealthScore = {
  __typename?: 'GeminiAIFinancialHealthScore';
  id: Scalars['ID'];
  customerId: Scalars['ID'];
  /** The overall financial health score (e.g., 1-100). */
  score: Scalars['Int'];
  /** Rating based on the score (e.g., 'EXCELLENT', 'GOOD', 'FAIR', 'POOR'). */
  rating: Scalars['String'];
  /** Key factors influencing the score. */
  contributingFactors: Array<Scalars['String']>;
  /** Recommendations for improvement. */
  recommendations?: Maybe<Array<Recommendation>>;
  /** Date the score was calculated. */
  calculatedDate: Scalars['Date'];
  /** Detailed breakdown of score components in JSON. */
  details?: Maybe<Scalars['JSONObject']>;
};

/** Represents a personalized alert generated by AI. */
export type GeminiAIPersonalizedAlert = {
  __typename?: 'GeminiAIPersonalizedAlert';
  id: Scalars['ID'];
  customerId: Scalars['ID'];
  /** Title of the alert. */
  title: Scalars['String'];
  /** Detailed message of the alert. */
  message: Scalars['String'];
  /** Type of alert (e.g., 'SPENDING_EXCEEDED', 'LOW_BALANCE', 'FRAUD_WARNING', 'INVESTMENT_OPPORTUNITY'). */
  alertType: Scalars['String'];
  /** Severity of the alert (e.g., 'INFO', 'WARNING', 'CRITICAL'). */
  severity: Scalars['String'];
  /** Whether the alert has been read. */
  isRead: Scalars['Boolean'];
  /** Timestamp of when the alert was generated. */
  generatedDate: Scalars['Date'];
  /** Suggested actions related to the alert. */
  suggestedActions?: Maybe<Array<BankingAction>>;
};

/** Represents a customer segment identified by AI. */
export type GeminiAICustomerSegmentation = {
  __typename?: 'GeminiAICustomerSegmentation';
  id: Scalars['ID'];
  customerId: Scalars['ID'];
  /** The name of the segment the customer belongs to (e.g., 'HIGH_NET_WORTH', 'BUDGET_CONSCIOUS', 'TECH_SAVVY_INVESTOR'). */
  segmentName: Scalars['String'];
  /** AI's confidence in the segmentation. */
  confidenceScore: Scalars['Float'];
  /** Key characteristics of this segment. */
  characteristics: Array<Scalars['String']>;
  /** Date the segmentation was last updated. */
  lastUpdated: Scalars['Date'];
  /** Optional: personalized strategies for this segment. */
  segmentStrategies?: Maybe<Scalars['JSONObject']>;
};

/** Represents an AI-driven fraud score for a given entity. */
export type GeminiAIFraudScore = {
  __typename?: 'GeminiAIFraudScore';
  id: Scalars['ID'];
  /** The ID of the entity (transaction, customer, account) being scored. */
  entityId: Scalars['ID'];
  /** The type of entity being scored. */
  entityType: Scalars['String'];
  /** The fraud score (e.g., 0-100, higher is riskier). */
  score: Scalars['Int'];
  /** The fraud risk level derived from the score. */
  riskLevel: Scalars['String'];
  /** Key indicators that influenced the score. */
  indicators: Array<Scalars['String']>;
  /** Recommendations based on the fraud score. */
  recommendations?: Maybe<Array<BankingAction>>;
  /** Date the score was generated. */
  generatedDate: Scalars['Date'];
};

/** Represents an AI-driven analysis of market trends. */
export type GeminiAIMarketTrendAnalysis = {
  __typename?: 'GeminiAIMarketTrendAnalysis';
  id: Scalars['ID'];
  /** The market or sector being analyzed. */
  marketSector: Scalars['String'];
  /** Detected trend (e.g., 'BULLISH', 'BEARISH', 'STABLE', 'VOLATILE'). */
  trend: Scalars['String'];
  /** Key drivers of the current trend. */
  drivers: Array<Scalars['String']>;
  /** AI's forecast for the trend. */
  forecast?: Maybe<Scalars['String']>;
  /** Date the analysis was performed. */
  analysisDate: Scalars['Date'];
  /** Relevant financial instruments or assets. */
  relevantAssets?: Maybe<Array<Scalars['String']>>;
  /** Detailed metrics in JSON. */
  metrics?: Maybe<Scalars['JSONObject']>;
};

/** Represents an AI assessment of loan eligibility. */
export type GeminiAILoanEligibilityAssessment = {
  __typename?: 'GeminiAILoanEligibilityAssessment';
  id: Scalars['ID'];
  customerId: Scalars['ID'];
  /** The loan product being assessed for. */
  loanType: Scalars['String'];
  /** Whether the customer is eligible. */
  isEligible: Scalars['Boolean'];
  /** AI's confidence in the eligibility assessment. */
  confidenceScore: Scalars['Float'];
  /** Reasons for eligibility or ineligibility. */
  reasons: Array<Scalars['String']>;
  /** Recommended loan amount if eligible. */
  recommendedAmount?: Maybe<Scalars['BigDecimal']>;
  /** Date the assessment was made. */
  assessmentDate: Scalars['Date'];
  /** Suggested next steps for the customer. */
  nextSteps?: Maybe<Array<BankingAction>>;
};

/** Represents an AI analysis of a customer's credit score. */
export type GeminiAICreditScoreAnalysis = {
  __typename?: 'GeminiAICreditScoreAnalysis';
  id: Scalars['ID'];
  customerId: Scalars['ID'];
  /** The customer's current credit score. */
  creditScore: Scalars['Int'];
  /** Factors positively impacting the score. */
  positiveFactors: Array<Scalars['String']>;
  /** Factors negatively impacting the score. */
  negativeFactors: Array<Scalars['String']>;
  /** AI-driven recommendations for improving the credit score. */
  improvementRecommendations: Array<Recommendation>;
  /** Date the analysis was performed. */
  analysisDate: Scalars['Date'];
  /** Potential impact of recommendations. */
  potentialScoreIncrease?: Maybe<Scalars['Int']>;
};

/** Represents the result of AI document analysis. */
export type GeminiAIDocumentAnalysisResult = {
  __typename?: 'GeminiAIDocumentAnalysisResult';
  id: Scalars['ID'];
  /** Name of the analyzed document. */
  documentName: Scalars['String'];
  /** Type of document (e.g., 'INVOICE', 'CONTRACT', 'ID_PROOF'). */
  documentType: Scalars['String'];
  /** Key extracted entities from the document (e.g., 'COMPANY_NAME', 'AMOUNT', 'DATE'). */
  extractedEntities: Array<GeminiAIExtractedEntity>;
  /** Detected anomalies or discrepancies. */
  anomalies?: Maybe<Array<Scalars['String']>>;
  /** Compliance status based on document content. */
  complianceStatus: Scalars['String'];
  /** AI's confidence in the extraction and analysis. */
  confidenceScore: Scalars['Float'];
  /** Date the document was analyzed. */
  analysisDate: Scalars['Date'];
  /** A summary of the document content. */
  documentSummary?: Maybe<Scalars['String']>;
};

/** Represents an entity extracted from a document by AI. */
export type GeminiAIExtractedEntity = {
  __typename?: 'GeminiAIExtractedEntity';
  /** Name of the entity (e.g., 'CUSTOMER_ADDRESS'). */
  name: Scalars['String'];
  /** Value of the extracted entity. */
  value: Scalars['String'];
  /** Confidence score for the extraction. */
  confidence: Scalars['Float'];
};

/** Represents an AI-driven compliance audit report. */
export type GeminiAIComplianceAudit = {
  __typename?: 'GeminiAIComplianceAudit';
  id: Scalars['ID'];
  /** The scope of the audit (e.g., 'AML', 'KYC', 'GDPR'). */
  auditScope: Scalars['String'];
  /** Overall compliance status (e.g., 'COMPLIANT', 'NON_COMPLIANT', 'PARTIAL_COMPLIANCE'). */
  overallStatus: Scalars['String'];
  /** List of identified compliance gaps. */
  gapsIdentified?: Maybe<Array<Scalars['String']>>;
  /** Recommended actions to address gaps. */
  recommendedActions?: Maybe<Array<BankingAction>>;
  /** Date the audit was completed. */
  auditDate: Scalars['Date'];
  /** AI's confidence in the audit findings. */
  confidenceScore: Scalars['Float'];
  /** Detailed findings in JSON format. */
  findingsDetails?: Maybe<Scalars['JSONObject']>;
};

/** Input for initiating an AI-driven compliance audit. */
export type GeminiAIComplianceAuditInput = {
  /** The scope of the audit (e.g., 'AML', 'KYC'). */
  auditScope: Scalars['String'];
  /** Optional: specific entity ID to audit (e.g., customerId). */
  entityId?: InputMaybe<Scalars['ID']>;
  /** Optional: date range for the audit. */
  startDate?: InputMaybe<Scalars['Date']>;
  endDate?: InputMaybe<Scalars['Date']>;
};

/** Represents a personalized financial goal for a customer, potentially AI-generated or refined. */
export type GeminiAIPersonalizedFinancialGoal = {
  __typename?: 'GeminiAIPersonalizedFinancialGoal';
  id: Scalars['ID'];
  customerId: Scalars['ID'];
  /** The name of the goal (e.g., 'Retirement Savings', 'Down Payment for Home'). */
  goalName: Scalars['String'];
  /** Description of the goal. */
  description?: Maybe<Scalars['String']>;
  /** Target amount for the goal. */
  targetAmount: Scalars['BigDecimal'];
  /** Current progress towards the goal. */
  currentAmount: Scalars['BigDecimal'];
  /** Target completion date. */
  targetDate?: Maybe<Scalars['Date']>;
  /** AI's recommendations for achieving the goal. */
  aiRecommendations?: Maybe<Array<Recommendation>>;
  /** Status of the goal (e.g., 'ACTIVE', 'COMPLETED', 'ON_HOLD'). */
  status: Scalars['String'];
  /** Date the goal was created or last updated. */
  lastUpdated: Scalars['Date'];
};

/** Input for updating a customer's financial goal. */
export type GeminiAIUpdateFinancialGoalInput = {
  customerId: Scalars['ID'];
  /** ID of the goal to update, or null for a new goal. */
  goalId?: InputMaybe<Scalars['ID']>;
  /** Name of the goal. */
  goalName: Scalars['String'];
  /** Target amount for the goal. */
  targetAmount: Scalars['BigDecimal'];
  /** Optional: current amount saved. */
  currentAmount?: InputMaybe<Scalars['BigDecimal']>;
  /** Optional: target completion date. */
  targetDate?: InputMaybe<Scalars['Date']>;
  /** Optional: status of the goal. */
  status?: InputMaybe<Scalars['String']>;
  /** Optional: description of the goal. */
  description?: InputMaybe<Scalars['String']>;
};

/** Represents a real-time fraud alert. */
export type GeminiAIRealtimeFraudAlert = {
  __typename?: 'GeminiAIRealtimeFraudAlert';
  id: Scalars['ID'];
  transactionId: Scalars['ID'];
  /** The type of fraud detected (e.g., 'UNUSUAL_LOCATION', 'HIGH_VALUE_TRANSACTION', 'MULTIPLE_FAILED_ATTEMPTS'). */
  fraudType: Scalars['String'];
  /** Description of the detected fraud. */
  description: Scalars['String'];
  /** Severity of the alert (e.g., 'HIGH', 'CRITICAL'). */
  severity: Scalars['String'];
  /** Timestamp of the alert. */
  alertTimestamp: Scalars['Date'];
  /** Recommended immediate actions. */
  recommendedActions: Array<BankingAction>;
  /** AI's confidence in the fraud detection. */
  confidenceScore: Scalars['Float'];
};

/** Input for setting up a real-time fraud alert. */
export type GeminiAISetupRealtimeFraudAlertInput = {
  customerId: Scalars['ID'];
  /** Enable or disable real-time alerts. */
  enableAlerts: Scalars['Boolean'];
  /** Optional: specific types of fraud to monitor more closely. */
  monitorFraudTypes?: InputMaybe<Array<Scalars['String']>>;
  /** Optional: custom thresholds for alerts. */
  customThresholds?: InputMaybe<Scalars['JSONObject']>;
};

/** Represents an AI-generated financial product recommendation. */
export type GeminiAIFinancialProductRecommendation = {
  __typename?: 'GeminiAIFinancialProductRecommendation';
  id: Scalars['ID'];
  customerId: Scalars['ID'];
  /** Name of the recommended product. */
  productName: Scalars['String'];
  /** Type of product (e.g., 'CREDIT_CARD', 'MORTGAGE', 'INVESTMENT_FUND'). */
  productType: Scalars['String'];
  /** Detailed description of the product and benefits. */
  description: Scalars['String'];
  /** AI's rationale for the recommendation. */
  aiRationale?: Maybe<Scalars['String']>;
  /** Key features or advantages. */
  keyFeatures?: Maybe<Array<Scalars['String']>>;
  /** Relevant metrics (e.g., interest rate, fees). */
  metrics?: Maybe<Scalars['JSONObject']>;
  /** Date the recommendation was generated. */
  generatedDate: Scalars['Date'];
  /** Link to apply or learn more. */
  applicationLink?: Maybe<Scalars['String']>;
};

/** Input for creating a product recommendation. */
export type GeminiAICreateProductRecommendationInput = {
  customerId: Scalars['ID'];
  /** Optional: preferred product type hint for AI. */
  preferredProductType?: InputMaybe<Scalars['String']>;
  /** Optional: specific financial need (e.g., 'SAVINGS_GROWTH', 'DEBT_CONSOLIDATION'). */
  financialNeed?: InputMaybe<Scalars['String']>;
};

/** Represents a record of an AI voice bot interaction. */
export type GeminiAIVoiceBotInteraction = {
  __typename?: 'GeminiAIVoiceBotInteraction';
  id: Scalars['ID'];
  customerId: Scalars['ID'];
  /** Timestamp of the interaction. */
  interactionTimestamp: Scalars['Date'];
  /** Transcript of the user's input. */
  userTranscript: Scalars['String'];
  /** Transcript of the AI's response. */
  aiTranscript: Scalars['String'];
  /** Detected intent of the user. */
  detectedIntent: Scalars['String'];
  /** Overall sentiment of the interaction. */
  sentiment: Scalars['String'];
  /** Status of the interaction (e.g., 'RESOLVED', 'ESCALATED', 'ONGOING'). */
  status: Scalars['String'];
  /** Optional: link to audio recording. */
  audioLink?: Maybe<Scalars['String']>;
  /** AI's confidence in understanding the intent. */
  confidenceScore: Scalars['Float'];
};

/** Input for recording a voice bot interaction. */
export type GeminiAIRecordVoiceBotInteractionInput = {
  customerId: Scalars['ID'];
  /** User's utterance. */
  userUtterance: Scalars['String'];
  /** AI's response. */
  aiResponse: Scalars['String'];
  /** Detected intent of the user. */
  intent: Scalars['String'];
  /** Optional: sentiment of the interaction. */
  sentiment?: InputMaybe<Scalars['String']>;
  /** Optional: status of the interaction. */
  status?: InputMaybe<Scalars['String']>;
  /** Optional: metadata for the interaction. */
  metadata?: InputMaybe<Scalars['JSONObject']>;
};

/** Represents the status of quantum-safe encryption. */
export type GeminiAIQuantumSafeEncryptionStatus = {
  __typename?: 'GeminiAIQuantumSafeEncryptionStatus';
  id: Scalars['ID'];
  /** The entity (account, transaction) to which the encryption applies. */
  entityId: Scalars['ID'];
  /** The type of entity. */
  entityType: Scalars['String'];
  /** Status of quantum-safe encryption (e.g., 'ENABLED', 'PENDING', 'NOT_SUPPORTED'). */
  status: Scalars['String'];
  /** Last update timestamp. */
  lastUpdated: Scalars['Date'];
  /** Details about the encryption protocol. */
  protocolDetails?: Maybe<Scalars['String']>;
  /** Compliance with quantum-safe standards. */
  complianceRating: Scalars['String'];
};

/** Represents the operational status of neuromorphic processors. */
export type GeminiAINeuromorphicProcessorStatus = {
  __typename?: 'GeminiAINeuromorphicProcessorStatus';
  id: Scalars['ID'];
  /** Processor identifier. */
  processorId: Scalars['String'];
  /** Current operational status (e.g., 'ONLINE', 'OFFLINE', 'DEGRADED'). */
  status: Scalars['String'];
  /** Current load percentage. */
  loadPercentage: Scalars['Float'];
  /** Last reported health check. */
  lastHealthCheck: Scalars['Date'];
  /** Performance metrics in JSON format. */
  performanceMetrics?: Maybe<Scalars['JSONObject']>;
  /** Number of active AI models running. */
  activeModels: Scalars['Int'];
};

/** Represents a digital twin financial model. */
export type GeminiAIDigitalTwinFinancialModel = {
  __typename?: 'GeminiAIDigitalTwinFinancialModel';
  id: Scalars['ID'];
  customerId: Scalars['ID'];
  /** Version of the model. */
  modelVersion: Scalars['String'];
  /** Date the model was last simulated. */
  lastSimulationDate: Scalars['Date'];
  /** Key assumptions made by the model. */
  assumptions: Array<Scalars['String']>;
  /** Simulated financial outcomes (e.g., net worth, cash flow) in JSON. */
  simulatedOutcomes?: Maybe<Scalars['JSONObject']>;
  /** Recommendations based on simulations. */
  recommendations?: Maybe<Array<Recommendation>>;
  /** AI's confidence in the model's accuracy. */
  accuracyConfidence: Scalars['Float'];
};

/** Represents a cross-sell opportunity identified by AI. */
export type GeminiAICrossSellOpportunity = {
  __typename?: 'GeminiAICrossSellOpportunity';
  id: Scalars['ID'];
  customerId: Scalars['ID'];
  /** The product the customer currently has. */
  currentProduct: Scalars['String'];
  /** The recommended product to cross-sell. */
  recommendedProduct: Scalars['String'];
  /** AI's rationale for this cross-sell. */
  aiRationale: Scalars['String'];
  /** Predicted likelihood of conversion. */
  likelihood: Scalars['Float'];
  /** Suggested marketing strategy for this opportunity. */
  marketingStrategy?: Maybe<Scalars['String']>;
  /** Date the opportunity was identified. */
  identifiedDate: Scalars['Date'];
};

/** Represents an up-sell opportunity identified by AI. */
export type GeminiAIUpSellOpportunity = {
  __typename?: 'GeminiAIUpSellOpportunity';
  id: Scalars['ID'];
  customerId: Scalars['ID'];
  /** The current product/service tier the customer has. */
  currentTier: Scalars['String'];
  /** The recommended higher-tier product/service. */
  recommendedTier: Scalars['String'];
  /** AI's rationale for this up-sell. */
  aiRationale: Scalars['String'];
  /** Predicted likelihood of conversion. */
  likelihood: Scalars['Float'];
  /** Key benefits of the up-sell. */
  benefits?: Maybe<Array<Scalars['String']>>;
  /** Date the opportunity was identified. */
  identifiedDate: Scalars['Date'];
};

/** Represents the execution details of a smart contract. */
export type GeminiAISmartContractExecution = {
  __typename?: 'GeminiAISmartContractExecution';
  id: Scalars['ID'];
  /** Identifier for the smart contract. */
  contractId: Scalars['ID'];
  /** The function or method executed. */
  functionName: Scalars['String'];
  /** Input parameters provided for execution. */
  inputParameters: Scalars['JSONObject'];
  /** Output or result of the execution. */
  outputResult?: Maybe<Scalars['JSONObject']>;
  /** Status of the execution (e.g., 'SUCCESS', 'FAILED', 'PENDING'). */
  status: Scalars['String'];
  /** Timestamp of execution. */
  executionTimestamp: Scalars['Date'];
  /** Transaction hash on the blockchain, if applicable. */
  transactionHash?: Maybe<Scalars['String']>;
  /** AI's verification of the execution outcome. */
  aiVerificationStatus: Scalars['String'];
};

/** Input for executing a smart contract. */
export type GeminiAIExecuteSmartContractInput = {
  /** Identifier for the smart contract to execute. */
  contractId: Scalars['ID'];
  /** The function or method to call on the contract. */
  functionName: Scalars['String'];
  /** Input parameters for the contract function, as a JSON object. */
  inputParameters: Scalars['JSONObject'];
  /** Optional: customer ID initiating the execution. */
  customerId?: InputMaybe<Scalars['ID']>;
};


export type GeminiSelectFieldComponent = GeminiComponentInterface & {
  __typename?: 'GeminiSelectFieldComponent';
  disabled?: Maybe<Scalars['Boolean']>;
  id: Scalars['String'];
  label?: Maybe<Scalars['String']>;
  options: Array<GeminiOption>;
  placeholder?: Maybe<Scalars['String']>;
  validationSchemas?: Maybe<Array<GeminiValidationSchema>>;
  value: Scalars['String'];
};

/** Autogenerated input type of GeminiStartWorkflow */
export type GeminiStartWorkflowInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  languagePreferences?: InputMaybe<Array<Scalars['String']>>;
};

/** Autogenerated return type of GeminiStartWorkflow. */
export type GeminiStartWorkflowPayload = {
  __typename?: 'GeminiStartWorkflowPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  errors?: Maybe<Array<Scalars['String']>>;
  response?: Maybe<GeminiStartWorkflowResponse>;
};

export type GeminiStartWorkflowResponse = {
  __typename?: 'GeminiStartWorkflowResponse';
  nextPane: GeminiPane;
  workflowSessionId: Scalars['String'];
};

export type GeminiStatusTextComponent = GeminiComponentInterface & {
  __typename?: 'GeminiStatusTextComponent';
  id: Scalars['String'];
  status: Scalars['String'];
  updatedAt: Scalars['Date'];
};

export type GeminiTest = {
  __typename?: 'GeminiTest';
  geminiTestField: Scalars['String'];
};

export enum GeminiTextAlignEnum {
  Center = 'center',
  Left = 'left',
  Right = 'right'
}

export type GeminiTextInputComponent = GeminiComponentInterface & {
  __typename?: 'GeminiTextInputComponent';
  id: Scalars['String'];
  inputType?: Maybe<GeminiTextInputTypeEnum>;
  label?: Maybe<Scalars['String']>;
  validationSchemas?: Maybe<Array<GeminiValidationSchema>>;
  value: Scalars['String'];
};

export enum GeminiTextInputTypeEnum {
  Date = 'date',
  Password = 'password',
  Tel = 'tel',
  Text = 'text'
}

export type GeminiValidationSchema = GeminiDateArgValidation | GeminiIntegerArgValidation | GeminiNoArgValidation;

export enum GeminiValidationTypeEnum {
  AbaChecksum = 'abaChecksum',
  AbaRoutingNumber = 'abaRoutingNumber',
  AccountNumber = 'accountNumber',
  Clabe = 'clabe',
  DateOfBirth = 'dateOfBirth',
  Email = 'email',
  ExactLength = 'exactLength',
  MaxLength = 'maxLength',
  MinDate = 'minDate',
  MinLength = 'minLength',
  OnlyDigits = 'onlyDigits',
  Required = 'required',
  SwiftCode = 'swiftCode',
  TaxpayerIdentifier = 'taxpayerIdentifier',
  Website = 'website',
  WithinRange = 'withinRange'
}

export type GeminiWorkflows__AccountCollectionPaneOutput = {
  abaRoutingNumber?: InputMaybe<Scalars['String']>;
  accountType?: InputMaybe<Scalars['String']>;
  city?: InputMaybe<Scalars['String']>;
  clabe?: InputMaybe<Scalars['String']>;
  country?: InputMaybe<Scalars['String']>;
  domesticAccountNumber?: InputMaybe<Scalars['String']>;
  iban?: InputMaybe<Scalars['String']>;
  ibanOptional?: InputMaybe<Scalars['String']>;
  internationalAccountNumber?: InputMaybe<Scalars['String']>;
  internationalAccountNumberOptional?: InputMaybe<Scalars['String']>;
  line1?: InputMaybe<Scalars['String']>;
  line2?: InputMaybe<Scalars['String']>;
  nameOnAccount?: InputMaybe<Scalars['String']>;
  partyType?: InputMaybe<Scalars['String']>;
  postalCode?: InputMaybe<Scalars['String']>;
  state?: InputMaybe<Scalars['String']>;
  swiftCode?: InputMaybe<Scalars['String']>;
};

export type GeminiWorkflows__BankAccountCollectionPaneOutput = {
  abaRoutingNumber?: InputMaybe<Scalars['String']>;
  accountType?: InputMaybe<Scalars['String']>;
  domesticAccountNumber?: InputMaybe<Scalars['String']>;
};

export type GeminiWorkflows__BeneficialOwner = {
  city?: InputMaybe<Scalars['String']>;
  dateOfBirth?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  firstName?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
  line1?: InputMaybe<Scalars['String']>;
  line2?: InputMaybe<Scalars['String']>;
  phoneNumber?: InputMaybe<Scalars['String']>;
  postalCode?: InputMaybe<Scalars['String']>;
  relationship?: InputMaybe<Scalars['String']>;
  state?: InputMaybe<Scalars['String']>;
  taxpayerIdentifier?: InputMaybe<Scalars['String']>;
};

export type GeminiWorkflows__BeneficialOwnersCollectionPaneOutput = {
  beneficialOwners?: InputMaybe<Array<GeminiWorkflows__BeneficialOwner>>;
};

export type GeminiWorkflows__EmailCollectionPaneOutput = {
  email?: InputMaybe<Scalars['String']>;
};

export type GeminiWorkflows__EmptyPaneOutput = {
  unused?: InputMaybe<Scalars['String']>;
};

export type GeminiWorkflows__IdentityDetailsCollectionPaneOutput = {
  city?: InputMaybe<Scalars['String']>;
  companyName?: InputMaybe<Scalars['String']>;
  dateOfBirth?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  firstName?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
  line1?: InputMaybe<Scalars['String']>;
  line2?: InputMaybe<Scalars['String']>;
  phoneNumber?: InputMaybe<Scalars['String']>;
  postalCode?: InputMaybe<Scalars['String']>;
  state?: InputMaybe<Scalars['String']>;
  website?: InputMaybe<Scalars['String']>;
};

export type GeminiWorkflows__PaymentDetailCollectionPaneOutput = {
  abaRoutingNumber?: InputMaybe<Scalars['String']>;
  accountType?: InputMaybe<Scalars['String']>;
  domesticAccountNumber?: InputMaybe<Scalars['String']>;
  nameOnAccount?: InputMaybe<Scalars['String']>;
  partyType?: InputMaybe<Scalars['String']>;
  reuseNewPaymentMethod?: InputMaybe<Scalars['Boolean']>;
  selectedEffectiveDate?: InputMaybe<Scalars['String']>;
  selectedExternalAccount?: InputMaybe<Scalars['String']>;
};

export type GeminiWorkflows__TaxpayerIdentifierCollectionPaneOutput = {
  taxpayerIdentifier?: InputMaybe<Scalars['String']>;
};

type GeminiComponent_GeminiAccordionComponent_Fragment = { __typename: 'GeminiAccordionComponent', id: string, accordionTitle: string, message: string, allowToggle?: boolean | null, reduceMotion?: boolean | null };

type GeminiComponent_GeminiBlockTextComponent_Fragment = { __typename: 'GeminiBlockTextComponent', id: string, subtitle?: string | null, fontSize?: GeminiFontSizeEnum | null, noOfLines?: number | null, textAlign?: GeminiTextAlignEnum | null, nullableTitle?: string | null };

type GeminiComponent_GeminiCalendarComponent_Fragment = { __typename: 'GeminiCalendarComponent', id: string, label?: string | null, value: string, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null };

type GeminiComponent_GeminiCheckboxComponent_Fragment = { __typename: 'GeminiCheckboxComponent', id: string, value: string, label?: string | null, defaultChecked?: boolean | null, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null };

type GeminiComponent_GeminiCurrencyAmountComponent_Fragment = { __typename: 'GeminiCurrencyAmountComponent', id: string, amount: string, currency: GeminiCurrencyEnum };

type GeminiComponent_GeminiFormTextFieldComponent_Fragment = { __typename: 'GeminiFormTextFieldComponent', id: string, label?: string | null, value: string };

type GeminiComponent_GeminiGraphicComponent_Fragment = { __typename: 'GeminiGraphicComponent', id: string, graphicName: GeminiGraphicNameEnum };

type GeminiComponent_GeminiHorizontalRuleComponent_Fragment = { __typename: 'GeminiHorizontalRuleComponent', id: string };

type GeminiComponent_GeminiListItemComponent_Fragment = { __typename: 'GeminiListItemComponent', id: string, title: string, message: string, bulletIconName: GeminiIconNameEnum };

type GeminiComponent_GeminiSelectFieldComponent_Fragment = { __typename: 'GeminiSelectFieldComponent', id: string, label?: string | null, placeholder?: string | null, disabled?: boolean | null, value: string, options: Array<{ __typename?: 'GeminiOption', label: string, value: string, icon?: string | null }>, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null };

type GeminiComponent_GeminiStatusTextComponent_Fragment = { __typename: 'GeminiStatusTextComponent', id: string, status: string, updatedAt: any };

type GeminiComponent_GeminiTextInputComponent_Fragment = { __typename: 'GeminiTextInputComponent', id: string, value: string, label?: string | null, type?: GeminiTextInputTypeEnum | null, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null };

export type GeminiComponentFragment = GeminiComponent_GeminiAccordionComponent_Fragment | GeminiComponent_GeminiBlockTextComponent_Fragment | GeminiComponent_GeminiCalendarComponent_Fragment | GeminiComponent_GeminiCheckboxComponent_Fragment | GeminiComponent_GeminiCurrencyAmountComponent_Fragment | GeminiComponent_GeminiFormTextFieldComponent_Fragment | GeminiComponent_GeminiGraphicComponent_Fragment | GeminiComponent_GeminiHorizontalRuleComponent_Fragment | GeminiComponent_GeminiListItemComponent_Fragment | GeminiComponent_GeminiSelectFieldComponent_Fragment | GeminiComponent_GeminiStatusTextComponent_Fragment | GeminiComponent_GeminiTextInputComponent_Fragment;

export type GeminiPaneFragment = { __typename?: 'GeminiPane', nodeId: string, paneOutputType: string, showLogo: boolean, navigation: { __typename?: 'GeminiNavigation', showBack: boolean }, header?: { __typename?: 'GeminiHeader', status: GeminiHeaderStatusEnum, title: string } | null, layout: { __typename: 'GeminiBeneficialOwnersListLayout', listComponents: Array<{ __typename: 'GeminiAccordionComponent', id: string, accordionTitle: string, message: string, allowToggle?: boolean | null, reduceMotion?: boolean | null } | { __typename: 'GeminiBlockTextComponent', id: string, subtitle?: string | null, fontSize?: GeminiFontSizeEnum | null, noOfLines?: number | null, textAlign?: GeminiTextAlignEnum | null, nullableTitle?: string | null } | { __typename: 'GeminiCalendarComponent', id: string, label?: string | null, value: string, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiCheckboxComponent', id: string, value: string, label?: string | null, defaultChecked?: boolean | null, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiCurrencyAmountComponent', id: string, amount: string, currency: GeminiCurrencyEnum } | { __typename: 'GeminiFormTextFieldComponent', id: string, label?: string | null, value: string } | { __typename: 'GeminiGraphicComponent', id: string, graphicName: GeminiGraphicNameEnum } | { __typename: 'GeminiHorizontalRuleComponent', id: string } | { __typename: 'GeminiListItemComponent', id: string, title: string, message: string, bulletIconName: GeminiIconNameEnum } | { __typename: 'GeminiSelectFieldComponent', id: string, label?: string | null, placeholder?: string | null, disabled?: boolean | null, value: string, options: Array<{ __typename?: 'GeminiOption', label: string, value: string, icon?: string | null }>, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiStatusTextComponent', id: string, status: string, updatedAt: any } | { __typename: 'GeminiTextInputComponent', id: string, value: string, label?: string | null, type?: GeminiTextInputTypeEnum | null, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null }>, newComponents: Array<{ __typename: 'GeminiAccordionComponent', id: string, accordionTitle: string, message: string, allowToggle?: boolean | null, reduceMotion?: boolean | null } | { __typename: 'GeminiBlockTextComponent', id: string, subtitle?: string | null, fontSize?: GeminiFontSizeEnum | null, noOfLines?: number | null, textAlign?: GeminiTextAlignEnum | null, nullableTitle?: string | null } | { __typename: 'GeminiCalendarComponent', id: string, label?: string | null, value: string, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiCheckboxComponent', id: string, value: string, label?: string | null, defaultChecked?: boolean | null, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiCurrencyAmountComponent', id: string, amount: string, currency: GeminiCurrencyEnum } | { __typename: 'GeminiFormTextFieldComponent', id: string, label?: string | null, value: string } | { __typename: 'GeminiGraphicComponent', id: string, graphicName: GeminiGraphicNameEnum } | { __typename: 'GeminiHorizontalRuleComponent', id: string } | { __typename: 'GeminiListItemComponent', id: string, title: string, message: string, bulletIconName: GeminiIconNameEnum } | { __typename: 'GeminiSelectFieldComponent', id: string, label?: string | null, placeholder?: string | null, disabled?: boolean | null, value: string, options: Array<{ __typename?: 'GeminiOption', label: string, value: string, icon?: string | null }>, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiStatusTextComponent', id: string, status: string, updatedAt: any } | { __typename: 'GeminiTextInputComponent', id: string, value: string, label?: string | null, type?: GeminiTextInputTypeEnum | null, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null }>, deleteComponents: Array<{ __typename: 'GeminiAccordionComponent', id: string, accordionTitle: string, message: string, allowToggle?: boolean | null, reduceMotion?: boolean | null } | { __typename: 'GeminiBlockTextComponent', id: string, subtitle?: string | null, fontSize?: GeminiFontSizeEnum | null, noOfLines?: number | null, textAlign?: GeminiTextAlignEnum | null, nullableTitle?: string | null } | { __typename: 'GeminiCalendarComponent', id: string, label?: string | null, value: string, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiCheckboxComponent', id: string, value: string, label?: string | null, defaultChecked?: boolean | null, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiCurrencyAmountComponent', id: string, amount: string, currency: GeminiCurrencyEnum } | { __typename: 'GeminiFormTextFieldComponent', id: string, label?: string | null, value: string } | { __typename: 'GeminiGraphicComponent', id: string, graphicName: GeminiGraphicNameEnum } | { __typename: 'GeminiHorizontalRuleComponent', id: string } | { __typename: 'GeminiListItemComponent', id: string, title: string, message: string, bulletIconName: GeminiIconNameEnum } | { __typename: 'GeminiSelectFieldComponent', id: string, label?: string | null, placeholder?: string | null, disabled?: boolean | null, value: string, options: Array<{ __typename?: 'GeminiOption', label: string, value: string, icon?: string | null }>, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiStatusTextComponent', id: string, status: string, updatedAt: any } | { __typename: 'GeminiTextInputComponent', id: string, value: string, label?: string | null, type?: GeminiTextInputTypeEnum | null, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null }>, primaryButton: { __typename?: 'GeminiButtonComponent', id: string, title: string, actionId?: string | null }, newButton: { __typename?: 'GeminiButtonComponent', id: string, title: string }, deleteButton: { __typename?: 'GeminiButtonComponent', id: string, title: string, variant?: GeminiButtonVariantEnum | null }, editButton: { __typename?: 'GeminiButtonComponent', id: string, title: string } } | { __typename: 'GeminiButtonLayout', body: Array<{ __typename: 'GeminiAccordionComponent', id: string, accordionTitle: string, message: string, allowToggle?: boolean | null, reduceMotion?: boolean | null } | { __typename: 'GeminiBlockTextComponent', id: string, subtitle?: string | null, fontSize?: GeminiFontSizeEnum | null, noOfLines?: number | null, textAlign?: GeminiTextAlignEnum | null, nullableTitle?: string | null } | { __typename: 'GeminiCalendarComponent', id: string, label?: string | null, value: string, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiCheckboxComponent', id: string, value: string, label?: string | null, defaultChecked?: boolean | null, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiCurrencyAmountComponent', id: string, amount: string, currency: GeminiCurrencyEnum } | { __typename: 'GeminiFormTextFieldComponent', id: string, label?: string | null, value: string } | { __typename: 'GeminiGraphicComponent', id: string, graphicName: GeminiGraphicNameEnum } | { __typename: 'GeminiHorizontalRuleComponent', id: string } | { __typename: 'GeminiListItemComponent', id: string, title: string, message: string, bulletIconName: GeminiIconNameEnum } | { __typename: 'GeminiSelectFieldComponent', id: string, label?: string | null, placeholder?: string | null, disabled?: boolean | null, value: string, options: Array<{ __typename?: 'GeminiOption', label: string, value: string, icon?: string | null }>, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiStatusTextComponent', id: string, status: string, updatedAt: any } | { __typename: 'GeminiTextInputComponent', id: string, value: string, label?: string | null, type?: GeminiTextInputTypeEnum | null, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null }>, primaryButton: { __typename?: 'GeminiButtonComponent', id: string, title: string, actionId?: string | null } } | { __typename: 'GeminiPaymentMethodSelectLayout', body: Array<{ __typename: 'GeminiAccordionComponent', id: string, accordionTitle: string, message: string, allowToggle?: boolean | null, reduceMotion?: boolean | null } | { __typename: 'GeminiBlockTextComponent', id: string, subtitle?: string | null, fontSize?: GeminiFontSizeEnum | null, noOfLines?: number | null, textAlign?: GeminiTextAlignEnum | null, nullableTitle?: string | null } | { __typename: 'GeminiCalendarComponent', id: string, label?: string | null, value: string, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiCheckboxComponent', id: string, value: string, label?: string | null, defaultChecked?: boolean | null, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiCurrencyAmountComponent', id: string, amount: string, currency: GeminiCurrencyEnum } | { __typename: 'GeminiFormTextFieldComponent', id: string, label?: string | null, value: string } | { __typename: 'GeminiGraphicComponent', id: string, graphicName: GeminiGraphicNameEnum } | { __typename: 'GeminiHorizontalRuleComponent', id: string } | { __typename: 'GeminiListItemComponent', id: string, title: string, message: string, bulletIconName: GeminiIconNameEnum } | { __typename: 'GeminiSelectFieldComponent', id: string, label?: string | null, placeholder?: string | null, disabled?: boolean | null, value: string, options: Array<{ __typename?: 'GeminiOption', label: string, value: string, icon?: string | null }>, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiStatusTextComponent', id: string, status: string, updatedAt: any } | { __typename: 'GeminiTextInputComponent', id: string, value: string, label?: string | null, type?: GeminiTextInputTypeEnum | null, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null }>, paymentMethodOptions: Array<{ __typename?: 'GeminiPaymentMethodOption', title: string, iconName: GeminiIconNameEnum, paymentType?: GeminiPaymentTypeEnum | null, description: string, actionId: string }> } | { __typename: 'GeminiPlainLayout', body: Array<{ __typename: 'GeminiAccordionComponent', id: string, accordionTitle: string, message: string, allowToggle?: boolean | null, reduceMotion?: boolean | null } | { __typename: 'GeminiBlockTextComponent', id: string, subtitle?: string | null, fontSize?: GeminiFontSizeEnum | null, noOfLines?: number | null, textAlign?: GeminiTextAlignEnum | null, nullableTitle?: string | null } | { __typename: 'GeminiCalendarComponent', id: string, label?: string | null, value: string, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiCheckboxComponent', id: string, value: string, label?: string | null, defaultChecked?: boolean | null, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiCurrencyAmountComponent', id: string, amount: string, currency: GeminiCurrencyEnum } | { __typename: 'GeminiFormTextFieldComponent', id: string, label?: string | null, value: string } | { __typename: 'GeminiGraphicComponent', id: string, graphicName: GeminiGraphicNameEnum } | { __typename: 'GeminiHorizontalRuleComponent', id: string } | { __typename: 'GeminiListItemComponent', id: string, title: string, message: string, bulletIconName: GeminiIconNameEnum } | { __typename: 'GeminiSelectFieldComponent', id: string, label?: string | null, placeholder?: string | null, disabled?: boolean | null, value: string, options: Array<{ __typename?: 'GeminiOption', label: string, value: string, icon?: string | null }>, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiStatusTextComponent', id: string, status: string, updatedAt: any } | { __typename: 'GeminiTextInputComponent', id: string, value: string, label?: string | null, type?: GeminiTextInputTypeEnum | null, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null }> } } };

type GeminiValidationSchema_GeminiDateArgValidation_Fragment = { __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null };

type GeminiValidationSchema_GeminiIntegerArgValidation_Fragment = { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null };

type GeminiValidationSchema_GeminiNoArgValidation_Fragment = { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null };

export type GeminiValidationSchemaFragment = GeminiValidationSchema_GeminiDateArgValidation_Fragment | GeminiValidationSchema_GeminiIntegerArgValidation_Fragment | GeminiValidationSchema_GeminiNoArgValidation_Fragment;

export type GeminiNextPaneMutationVariables = Exact<{
  input: GeminiNextPaneInput;
}>;


export type GeminiNextPaneMutation = { __typename?: 'GeminiMutation', geminiNextPane?: { __typename?: 'GeminiNextPanePayload', nextPane?: { __typename?: 'GeminiPane', nodeId: string, paneOutputType: string, showLogo: boolean, navigation: { __typename?: 'GeminiNavigation', showBack: boolean }, header?: { __typename?: 'GeminiHeader', status: GeminiHeaderStatusEnum, title: string } | null, layout: { __typename: 'GeminiBeneficialOwnersListLayout', listComponents: Array<{ __typename: 'GeminiAccordionComponent', id: string, accordionTitle: string, message: string, allowToggle?: boolean | null, reduceMotion?: boolean | null } | { __typename: 'GeminiBlockTextComponent', id: string, subtitle?: string | null, fontSize?: GeminiFontSizeEnum | null, noOfLines?: number | null, textAlign?: GeminiTextAlignEnum | null, nullableTitle?: string | null } | { __typename: 'GeminiCalendarComponent', id: string, label?: string | null, value: string, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiCheckboxComponent', id: string, value: string, label?: string | null, defaultChecked?: boolean | null, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiCurrencyAmountComponent', id: string, amount: string, currency: GeminiCurrencyEnum } | { __typename: 'GeminiFormTextFieldComponent', id: string, label?: string | null, value: string } | { __typename: 'GeminiGraphicComponent', id: string, graphicName: GeminiGraphicNameEnum } | { __typename: 'GeminiHorizontalRuleComponent', id: string } | { __typename: 'GeminiListItemComponent', id: string, title: string, message: string, bulletIconName: GeminiIconNameEnum } | { __typename: 'GeminiSelectFieldComponent', id: string, label?: string | null, placeholder?: string | null, disabled?: boolean | null, value: string, options: Array<{ __typename?: 'GeminiOption', label: string, value: string, icon?: string | null }>, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiStatusTextComponent', id: string, status: string, updatedAt: any } | { __typename: 'GeminiTextInputComponent', id: string, value: string, label?: string | null, type?: GeminiTextInputTypeEnum | null, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null }>, newComponents: Array<{ __typename: 'GeminiAccordionComponent', id: string, accordionTitle: string, message: string, allowToggle?: boolean | null, reduceMotion?: boolean | null } | { __typename: 'GeminiBlockTextComponent', id: string, subtitle?: string | null, fontSize?: GeminiFontSizeEnum | null, noOfLines?: number | null, textAlign?: GeminiTextAlignEnum | null, nullableTitle?: string | null } | { __typename: 'GeminiCalendarComponent', id: string, label?: string | null, value: string, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiCheckboxComponent', id: string, value: string, label?: string | null, defaultChecked?: boolean | null, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiCurrencyAmountComponent', id: string, amount: string, currency: GeminiCurrencyEnum } | { __typename: 'GeminiFormTextFieldComponent', id: string, label?: string | null, value: string } | { __typename: 'GeminiGraphicComponent', id: string, graphicName: GeminiGraphicNameEnum } | { __typename: 'GeminiHorizontalRuleComponent', id: string } | { __typename: 'GeminiListItemComponent', id: string, title: string, message: string, bulletIconName: GeminiIconNameEnum } | { __typename: 'GeminiSelectFieldComponent', id: string, label?: string | null, placeholder?: string | null, disabled?: boolean | null, value: string, options: Array<{ __typename?: 'GeminiOption', label: string, value: string, icon?: string | null }>, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiStatusTextComponent', id: string, status: string, updatedAt: any } | { __typename: 'GeminiTextInputComponent', id: string, value: string, label?: string | null, type?: GeminiTextInputTypeEnum | null, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null }>, deleteComponents: Array<{ __typename: 'GeminiAccordionComponent', id: string, accordionTitle: string, message: string, allowToggle?: boolean | null, reduceMotion?: boolean | null } | { __typename: 'GeminiBlockTextComponent', id: string, subtitle?: string | null, fontSize?: GeminiFontSizeEnum | null, noOfLines?: number | null, textAlign?: GeminiTextAlignEnum | null, nullableTitle?: string | null } | { __typename: 'GeminiCalendarComponent', id: string, label?: string | null, value: string, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiCheckboxComponent', id: string, value: string, label?: string | null, defaultChecked?: boolean | null, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiCurrencyAmountComponent', id: string, amount: string, currency: GeminiCurrencyEnum } | { __typename: 'GeminiFormTextFieldComponent', id: string, label?: string | null, value: string } | { __typename: 'GeminiGraphicComponent', id: string, graphicName: GeminiGraphicNameEnum } | { __typename: 'GeminiHorizontalRuleComponent', id: string } | { __typename: 'GeminiListItemComponent', id: string, title: string, message: string, bulletIconName: GeminiIconNameEnum } | { __typename: 'GeminiSelectFieldComponent', id: string, label?: string | null, placeholder?: string | null, disabled?: boolean | null, value: string, options: Array<{ __typename?: 'GeminiOption', label: string, value: string, icon?: string | null }>, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiStatusTextComponent', id: string, status: string, updatedAt: any } | { __typename: 'GeminiTextInputComponent', id: string, value: string, label?: string | null, type?: GeminiTextInputTypeEnum | null, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null }>, primaryButton: { __typename?: 'GeminiButtonComponent', id: string, title: string, actionId?: string | null }, newButton: { __typename?: 'GeminiButtonComponent', id: string, title: string }, deleteButton: { __typename?: 'GeminiButtonComponent', id: string, title: string, variant?: GeminiButtonVariantEnum | null }, editButton: { __typename?: 'GeminiButtonComponent', id: string, title: string } } | { __typename: 'GeminiButtonLayout', body: Array<{ __typename: 'GeminiAccordionComponent', id: string, accordionTitle: string, message: string, allowToggle?: boolean | null, reduceMotion?: boolean | null } | { __typename: 'GeminiBlockTextComponent', id: string, subtitle?: string | null, fontSize?: GeminiFontSizeEnum | null, noOfLines?: number | null, textAlign?: GeminiTextAlignEnum | null, nullableTitle?: string | null } | { __typename: 'GeminiCalendarComponent', id: string, label?: string | null, value: string, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiCheckboxComponent', id: string, value: string, label?: string | null, defaultChecked?: boolean | null, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiCurrencyAmountComponent', id: string, amount: string, currency: GeminiCurrencyEnum } | { __typename: 'GeminiFormTextFieldComponent', id: string, label?: string | null, value: string } | { __typename: 'GeminiGraphicComponent', id: string, graphicName: GeminiGraphicNameEnum } | { __typename: 'GeminiHorizontalRuleComponent', id: string } | { __typename: 'GeminiListItemComponent', id: string, title: string, message: string, bulletIconName: GeminiIconNameEnum } | { __typename: 'GeminiSelectFieldComponent', id: string, label?: string | null, placeholder?: string | null, disabled?: boolean | null, value: string, options: Array<{ __typename?: 'GeminiOption', label: string, value: string, icon?: string | null }>, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiStatusTextComponent', id: string, status: string, updatedAt: any } | { __typename: 'GeminiTextInputComponent', id: string, value: string, label?: string | null, type?: GeminiTextInputTypeEnum | null, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null }>, primaryButton: { __typename?: 'GeminiButtonComponent', id: string, title: string, actionId?: string | null } } | { __typename: 'GeminiPaymentMethodSelectLayout', body: Array<{ __typename: 'GeminiAccordionComponent', id: string, accordionTitle: string, message: string, allowToggle?: boolean | null, reduceMotion?: boolean | null } | { __typename: 'GeminiBlockTextComponent', id: string, subtitle?: string | null, fontSize?: GeminiFontSizeEnum | null, noOfLines?: number | null, textAlign?: GeminiTextAlignEnum | null, nullableTitle?: string | null } | { __typename: 'GeminiCalendarComponent', id: string, label?: string | null, value: string, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiCheckboxComponent', id: string, value: string, label?: string | null, defaultChecked?: boolean | null, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiCurrencyAmountComponent', id: string, amount: string, currency: GeminiCurrencyEnum } | { __typename: 'GeminiFormTextFieldComponent', id: string, label?: string | null, value: string } | { __typename: 'GeminiGraphicComponent', id: string, graphicName: GeminiGraphicNameEnum } | { __typename: 'GeminiHorizontalRuleComponent', id: string } | { __typename: 'GeminiListItemComponent', id: string, title: string, message: string, bulletIconName: GeminiIconNameEnum } | { __typename: 'GeminiSelectFieldComponent', id: string, label?: string | null, placeholder?: string | null, disabled?: boolean | null, value: string, options: Array<{ __typename?: 'GeminiOption', label: string, value: string, icon?: string | null }>, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiStatusTextComponent', id: string, status: string, updatedAt: any } | { __typename: 'GeminiTextInputComponent', id: string, value: string, label?: string | null, type?: GeminiTextInputTypeEnum | null, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null }>, paymentMethodOptions: Array<{ __typename?: 'GeminiPaymentMethodOption', title: string, iconName: GeminiIconNameEnum, paymentType?: GeminiPaymentTypeEnum | null, description: string, actionId: string }> } | { __typename: 'GeminiPlainLayout', body: Array<{ __typename: 'GeminiAccordionComponent', id: string, accordionTitle: string, message: string, allowToggle?: boolean | null, reduceMotion?: boolean | null } | { __typename: 'GeminiBlockTextComponent', id: string, subtitle?: string | null, fontSize?: GeminiFontSizeEnum | null, noOfLines?: number | null, textAlign?: GeminiTextAlignEnum | null, nullableTitle?: string | null } | { __typename: 'GeminiCalendarComponent', id: string, label?: string | null, value: string, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiCheckboxComponent', id: string, value: string, label?: string | null, defaultChecked?: boolean | null, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiCurrencyAmountComponent', id: string, amount: string, currency: GeminiCurrencyEnum } | { __typename: 'GeminiFormTextFieldComponent', id: string, label?: string | null, value: string } | { __typename: 'GeminiGraphicComponent', id: string, graphicName: GeminiGraphicNameEnum } | { __typename: 'GeminiHorizontalRuleComponent', id: string } | { __typename: 'GeminiListItemComponent', id: string, title: string, message: string, bulletIconName: GeminiIconNameEnum } | { __typename: 'GeminiSelectFieldComponent', id: string, label?: string | null, placeholder?: string | null, disabled?: boolean | null, value: string, options: Array<{ __typename?: 'GeminiOption', label: string, value: string, icon?: string | null }>, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null } | { __typename: 'GeminiStatusTextComponent', id: string, status: string, updatedAt: any } | { __typename: 'GeminiTextInputComponent', id: string, value: string, label?: string | null, type?: GeminiTextInputTypeEnum | null, validationSchemas?: Array<{ __typename: 'GeminiDateArgValidation', type: GeminiValidationTypeEnum, arg: string, message?: string | null } | { __typename: 'GeminiIntegerArgValidation', type: GeminiValidationTypeEnum, args: Array<number>, message?: string | null } | { __typename: 'GeminiNoArgValidation', type: GeminiValidationTypeEnum, message?: string | null }> | null }> } } } };

export const GeminiValidationSchemaFragmentDoc = gql`
    fragment geminiValidationSchema on GeminiValidationSchema {
  __typename
  ... on GeminiNoArgValidation {
    type
    message
  }
  ... on GeminiIntegerArgValidation {
    type
    args
    message
  }
  ... on GeminiDateArgValidation {
    type
    arg
    message
  }
}
    `;
export const GeminiComponentFragmentDoc = gql`
    fragment geminiComponent on GeminiComponent {
  __typename
  ... on GeminiTextInputComponent {
    id
    value
    label
    type: inputType
    validationSchemas {
      ...geminiValidationSchema
    }
  }
  ... on GeminiSelectFieldComponent {
    id
    label
    placeholder
    options {
      label
      value
      icon
    }
    disabled
    value
    validationSchemas {
      ...geminiValidationSchema
    }
  }
  ... on GeminiBlockTextComponent {
    id
    nullableTitle: title
    subtitle
    fontSize
    noOfLines
    textAlign
  }
  ... on GeminiCurrencyAmountComponent {
    id
    amount
    currency
  }
  ... on GeminiFormTextFieldComponent {
    id
    label
    value
  }
  ... on GeminiCheckboxComponent {
    id
    value
    label
    defaultChecked
    validationSchemas {
      ...geminiValidationSchema
    }
  }
  ... on GeminiAccordionComponent {
    id
    accordionTitle
    message
    allowToggle
    reduceMotion
  }
  ... on GeminiGraphicComponent {
    id
    graphicName
  }
  ... on GeminiListItemComponent {
    id
    title
    message
    bulletIconName
  }
  ... on GeminiHorizontalRuleComponent {
    id
  }
  ... on GeminiStatusTextComponent {
    id
    status
    updatedAt
  }
  ... on GeminiCalendarComponent {
    id
    label
    value
    validationSchemas {
      ...geminiValidationSchema
    }
  }
}
    ${GeminiValidationSchemaFragmentDoc}`;
export const GeminiPaneFragmentDoc = gql`
    fragment geminiPane on GeminiPane {
  nodeId
  paneOutputType
  navigation {
    showBack
  }
  header {
    status
    title
  }
  layout {
    __typename
    ... on GeminiButtonLayout {
      body {
        ...geminiComponent
      }
      primaryButton {
        id
        title
        actionId
      }
    }
    ... on GeminiPaymentMethodSelectLayout {
      body {
        ...geminiComponent
      }
      paymentMethodOptions {
        title
        iconName
        paymentType
        description
        actionId
      }
    }
    ... on GeminiBeneficialOwnersListLayout {
      listComponents {
        ...geminiComponent
      }
      newComponents {
        ...geminiComponent
      }
      deleteComponents {
        ...geminiComponent
      }
      primaryButton {
        id
        title
        actionId
      }
      newButton {
        id
        title
      }
      deleteButton {
        id
        title
        variant
      }
      editButton {
        id
        title
      }
    }
    ... on GeminiPlainLayout {
      body {
        ...geminiComponent
      }
    }
  }
  showLogo
}
    ${GeminiComponentFragmentDoc}`;
export const GeminiNextPaneDocument = gql`
    mutation GeminiNextPane($input: GeminiNextPaneInput!) {
  geminiNextPane(input: $input) {
    nextPane {
      ...geminiPane
    }
    errors {
      nodeId
      generalErrors
      componentErrors {
        componentId
        message
      }
    }
  }
}
    ${GeminiPaneFragmentDoc}`;
export type GeminiNextPaneMutationFn = Apollo.MutationFunction<GeminiNextPaneMutation, GeminiNextPaneMutationVariables>;

/**
 * __useGeminiNextPaneMutation__
 *
 * To run a mutation, you first call `useGeminiNextPaneMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGeminiNextPaneMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [geminiNextPaneMutation, { data, loading, error }] = useGeminiNextPaneMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGeminiNextPaneMutation(baseOptions?: Apollo.MutationHookOptions<GeminiNextPaneMutation, GeminiNextPaneMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GeminiNextPaneMutation, GeminiNextPaneMutationVariables>(GeminiNextPaneDocument, options);
      }
export type GeminiNextPaneMutationHookResult = ReturnType<typeof useGeminiNextPaneMutation>;
export type GeminiNextPaneMutationResult = Apollo.MutationResult<GeminiNextPaneMutation>;
export type GeminiNextPaneMutationOptions = Apollo.BaseMutationOptions<GeminiNextPaneMutation, GeminiNextPaneMutationVariables>;
export const GeminiStartWorkflowDocument = gql`
    mutation GeminiStartWorkflow($input: GeminiStartWorkflowInput!) {
  geminiStartWorkflow(input: $input) {
    response {
      nextPane {
        ...geminiPane
      }
      workflowSessionId
    }
    errors
  }
}
    ${GeminiPaneFragmentDoc}`;
export type GeminiStartWorkflowMutationFn = Apollo.MutationFunction<GeminiStartWorkflowMutation, GeminiStartWorkflowMutationVariables>;

/**
 * __useGeminiStartWorkflowMutation__
 *
 * To run a mutation, you first call `useGeminiStartWorkflowMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGeminiStartWorkflowMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [geminiStartWorkflowMutation, { data, loading, error }] = useGeminiStartWorkflowMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGeminiStartWorkflowMutation(baseOptions?: Apollo.MutationHookOptions<GeminiStartWorkflowMutation, GeminiStartWorkflowMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GeminiStartWorkflowMutation, GeminiStartWorkflowMutationVariables>(GeminiStartWorkflowDocument, options);
      }
export type GeminiStartWorkflowMutationHookResult = ReturnType<typeof useGeminiStartWorkflowMutation>;
export type GeminiStartWorkflowMutationResult = Apollo.MutationResult<GeminiStartWorkflowMutation>;
export type GeminiStartWorkflowMutationOptions = Apollo.BaseMutationOptions<GeminiStartWorkflowMutation, GeminiStartWorkflowInput>;

//
// New Banking AI related types and hooks
//

/**
 * Fragment for a complete AI chat message.
 */
export const AiChatMessageFragmentDoc = gql`
  fragment AiChatMessage on AIChatMessage {
    id
    content
    sender
    timestamp
    metadata
  }
`;

/**
 * Fragment for a complete AI chat session, including messages.
 */
export const AiChatSessionFragmentDoc = gql`
  fragment AiChatSession on AIChatSession {
    id
    customerId
    messages {
      ...AiChatMessage
    }
    status
    createdAt
    updatedAt
  }
  ${AiChatMessageFragmentDoc}
`;

/**
 * Fragment for basic bank account details.
 */
export const BankAccountFragmentDoc = gql`
  fragment BankAccount on BankAccount {
    id
    accountNumber
    balance
    currency
    accountType
    accountHolderName
    openedDate
  }
`;

/**
 * Fragment for a transaction.
 */
export const TransactionFragmentDoc = gql`
  fragment Transaction on Transaction {
    id
    amount
    currency
    description
    transactionDate
    transactionType
    status
    fromAccount {
      id
      accountNumber
    }
    toAccount {
      id
      accountNumber
    }
  }
`;

/**
 * Fragment for customer profile details.
 */
export const CustomerProfileFragmentDoc = gql`
  fragment CustomerProfile on CustomerProfile {
    id
    firstName
    lastName
    dateOfBirth
    email
    phoneNumber
    addressLine1
    addressLine2
    city
    state
    postalCode
    country
    aiConfidenceScore
    fraudAlertsEnabled
    highValueTransactionThreshold
  }
`;

/**
 * Fragment for loan application details.
 */
export const LoanApplicationFragmentDoc = gql`
  fragment LoanApplication on LoanApplication {
    id
    customerId
    amount
    currency
    loanType
    status
    applicationDate
    terms
  }
`;

/**
 * Fragment for banking insight details.
 */
export const BankingInsightFragmentDoc = gql`
  fragment BankingInsight on BankingInsight {
    id
    type
    title
    description
    suggestedActions {
      id
      label
      description
      actionType
      parameters
    }
    contextData
  }
`;

/**
 * Fragment for financial forecast details.
 */
export const FinancialForecastFragmentDoc = gql`
  fragment FinancialForecast on FinancialForecast {
    id
    customerId
    period
    projectedIncome
    projectedExpenses
    projectedSavings
    details
    generatedDate
  }
`;

/**
 * Fragment for fraud detection report details.
 */
export const FraudDetectionReportFragmentDoc = gql`
  fragment FraudDetectionReport on FraudDetectionReport {
    id
    transactionId
    riskLevel
    confidenceScore
    reasons
    suggestedActions {
      id
      label
      description
      actionType
      parameters
    }
    generatedDate
  }
`;

/**
 * Fragment for personalized recommendation details.
 */
export const RecommendationFragmentDoc = gql`
  fragment Recommendation on Recommendation {
    id
    customerId
    type
    title
    description
    metrics
    actions {
      id
      label
      description
      actionType
      parameters
    }
    generatedDate
  }
`;

/**
 * Fragment for spending optimization report details.
 */
export const SpendingOptimizationReportFragmentDoc = gql`
  fragment SpendingOptimizationReport on SpendingOptimizationReport {
    id
    customerId
    category
    actualReductionAmount
    recommendations {
      ...Recommendation
    }
    generatedDate
  }
  ${RecommendationFragmentDoc}
`;

/**
 * Fragment for AI Investment Opportunity.
 */
export const GeminiAIInvestmentOpportunityFragmentDoc = gql`
  fragment GeminiAIInvestmentOpportunity on GeminiAIInvestmentOpportunity {
    id
    name
    type
    projectedReturn
    riskLevel
    description
    identifiedDate
    recommendedAction
    confidenceScore
    marketData
  }
`;

/**
 * Fragment for AI Investment Action Response.
 */
export const GeminiAIInvestmentActionResponseFragmentDoc = gql`
  fragment GeminiAIInvestmentActionResponse on GeminiAIInvestmentActionResponse {
    actionId
    status
    message
    timestamp
    investmentOpportunity {
      id
      name
    }
  }
`;

/**
 * Fragment for AI Risk Assessment Report.
 */
export const GeminiAIRiskAssessmentReportFragmentDoc = gql`
  fragment GeminiAIRiskAssessmentReport on GeminiAIRiskAssessmentReport {
    id
    entityId
    riskType
    overallRating
    confidenceScore
    riskFactors
    mitigationStrategies
    generatedDate
    details
  }
`;

/**
 * Fragment for AI Spending Category.
 */
export const GeminiAISpendingCategoryFragmentDoc = gql`
  fragment GeminiAISpendingCategory on GeminiAISpendingCategory {
    name
    totalAmount
    percentage
    trend
  }
`;

/**
 * Fragment for AI Spending Anomaly.
 */
export const GeminiAISpendingAnomalyFragmentDoc = gql`
  fragment GeminiAISpendingAnomaly on GeminiAISpendingAnomaly {
    id
    description
    transactionId
    severity
    confidenceScore
    date
  }
`;

/**
 * Fragment for AI Spending Pattern Analysis.
 */
export const GeminiAISpendingPatternAnalysisFragmentDoc = gql`
  fragment GeminiAISpendingPatternAnalysis on GeminiAISpendingPatternAnalysis {
    id
    customerId
    period
    topCategories {
      ...GeminiAISpendingCategory
    }
    anomalies {
      ...GeminiAISpendingAnomaly
    }
    recommendations {
      ...Recommendation
    }
    analysisDate
  }
  ${GeminiAISpendingCategoryFragmentDoc}
  ${GeminiAISpendingAnomalyFragmentDoc}
  ${RecommendationFragmentDoc}
`;

/**
 * Fragment for AI Transaction Prediction.
 */
export const GeminiAITransactionPredictionFragmentDoc = gql`
  fragment GeminiAITransactionPrediction on GeminiAITransactionPrediction {
    id
    customerId
    predictedDate
    predictedAmount
    predictedCurrency
    predictedType
    confidenceScore
    rationale
    predictionDate
  }
`;

/**
 * Fragment for AI Sentiment Analysis Report.
 */
export const GeminiAISentimentAnalysisReportFragmentDoc = gql`
  fragment GeminiAISentimentAnalysisReport on GeminiAISentimentAnalysisReport {
    id
    target
    overallSentiment
    sentimentScore
    keyPhrases
    source
    analysisDate
    analyzedTextSample
  }
`;

/**
 * Fragment for AI Budget Adjustment Result.
 */
export const GeminiAIBudgetAdjustmentResultFragmentDoc = gql`
  fragment GeminiAIBudgetAdjustmentResult on GeminiAIBudgetAdjustmentResult {
    id
    customerId
    category
    newBudgetAmount
    period
    status
    message
    adjustmentDate
  }
`;

/**
 * Fragment for AI Suspicious Activity Report.
 */
export const GeminiAISuspiciousActivityReportFragmentDoc = gql`
  fragment GeminiAISuspiciousActivityReport on GeminiAISuspiciousActivityReport {
    id
    entityId
    entityType
    reason
    severity
    flaggedDate
    status
    contextData
  }
`;

/**
 * Fragment for AI Marketing Offer.
 */
export const GeminiAIMarketingOfferFragmentDoc = gql`
  fragment GeminiAIMarketingOffer on GeminiAIMarketingOffer {
    id
    customerId
    title
    description
    offerType
    expiryDate
    aiRationale
    parameters
    generatedDate
  }
`;

/**
 * Fragment for AI Automated Bill Payment.
 */
export const GeminiAIAutomatedBillPaymentFragmentDoc = gql`
  fragment GeminiAIAutomatedBillPayment on GeminiAIAutomatedBillPayment {
    id
    customerId
    billerName
    fromAccountId
    nextPaymentDate
    predictedAmount
    frequency
    status
    setupDate
    aiRationale
  }
`;

/**
 * Fragment for AI Financial Health Score.
 */
export const GeminiAIFinancialHealthScoreFragmentDoc = gql`
  fragment GeminiAIFinancialHealthScore on GeminiAIFinancialHealthScore {
    id
    customerId
    score
    rating
    contributingFactors
    recommendations {
      ...Recommendation
    }
    calculatedDate
    details
  }
  ${RecommendationFragmentDoc}
`;

/**
 * Fragment for AI Personalized Alert.
 */
export const GeminiAIPersonalizedAlertFragmentDoc = gql`
  fragment GeminiAIPersonalizedAlert on GeminiAIPersonalizedAlert {
    id
    customerId
    title
    message
    alertType
    severity
    isRead
    generatedDate
    suggestedActions {
      id
      label
      description
    }
  }
`;

/**
 * Fragment for AI Customer Segmentation.
 */
export const GeminiAICustomerSegmentationFragmentDoc = gql`
  fragment GeminiAICustomerSegmentation on GeminiAICustomerSegmentation {
    id
    customerId
    segmentName
    confidenceScore
    characteristics
    lastUpdated
    segmentStrategies
  }
`;

/**
 * Fragment for AI Fraud Score.
 */
export const GeminiAIFraudScoreFragmentDoc = gql`
  fragment GeminiAIFraudScore on GeminiAIFraudScore {
    id
    entityId
    entityType
    score
    riskLevel
    indicators
    recommendations {
      id
      label
    }
    generatedDate
  }
`;

/**
 * Fragment for AI Market Trend Analysis.
 */
export const GeminiAIMarketTrendAnalysisFragmentDoc = gql`
  fragment GeminiAIMarketTrendAnalysis on GeminiAIMarketTrendAnalysis {
    id
    marketSector
    trend
    drivers
    forecast
    analysisDate
    relevantAssets
    metrics
  }
`;

/**
 * Fragment for AI Loan Eligibility Assessment.
 */
export const GeminiAILoanEligibilityAssessmentFragmentDoc = gql`
  fragment GeminiAILoanEligibilityAssessment on GeminiAILoanEligibilityAssessment {
    id
    customerId
    loanType
    isEligible
    confidenceScore
    reasons
    recommendedAmount
    assessmentDate
    nextSteps {
      id
      label
    }
  }
`;

/**
 * Fragment for AI Credit Score Analysis.
 */
export const GeminiAICreditScoreAnalysisFragmentDoc = gql`
  fragment GeminiAICreditScoreAnalysis on GeminiAICreditScoreAnalysis {
    id
    customerId
    creditScore
    positiveFactors
    negativeFactors
    improvementRecommendations {
      ...Recommendation
    }
    analysisDate
    potentialScoreIncrease
  }
  ${RecommendationFragmentDoc}
`;

/**
 * Fragment for AI Extracted Entity.
 */
export const GeminiAIExtractedEntityFragmentDoc = gql`
  fragment GeminiAIExtractedEntity on GeminiAIExtractedEntity {
    name
    value
    confidence
  }
`;

/**
 * Fragment for AI Document Analysis Result.
 */
export const GeminiAIDocumentAnalysisResultFragmentDoc = gql`
  fragment GeminiAIDocumentAnalysisResult on GeminiAIDocumentAnalysisResult {
    id
    documentName
    documentType
    extractedEntities {
      ...GeminiAIExtractedEntity
    }
    anomalies
    complianceStatus
    confidenceScore
    analysisDate
    documentSummary
  }
  ${GeminiAIExtractedEntityFragmentDoc}
`;

/**
 * Fragment for AI Compliance Audit.
 */
export const GeminiAIComplianceAuditFragmentDoc = gql`
  fragment GeminiAIComplianceAudit on GeminiAIComplianceAudit {
    id
    auditScope
    overallStatus
    gapsIdentified
    recommendedActions {
      id
      label
    }
    auditDate
    confidenceScore
    findingsDetails
  }
`;

/**
 * Fragment for AI Personalized Financial Goal.
 */
export const GeminiAIPersonalizedFinancialGoalFragmentDoc = gql`
  fragment GeminiAIPersonalizedFinancialGoal on GeminiAIPersonalizedFinancialGoal {
    id
    customerId
    goalName
    description
    targetAmount
    currentAmount
    targetDate
    aiRecommendations {
      ...Recommendation
    }
    status
    lastUpdated
  }
  ${RecommendationFragmentDoc}
`;

/**
 * Fragment for AI Realtime Fraud Alert.
 */
export const GeminiAIRealtimeFraudAlertFragmentDoc = gql`
  fragment GeminiAIRealtimeFraudAlert on GeminiAIRealtimeFraudAlert {
    id
    transactionId
    fraudType
    description
    severity
    alertTimestamp
    recommendedActions {
      id
      label
    }
    confidenceScore
  }
`;

/**
 * Fragment for AI Financial Product Recommendation.
 */
export const GeminiAIFinancialProductRecommendationFragmentDoc = gql`
  fragment GeminiAIFinancialProductRecommendation on GeminiAIFinancialProductRecommendation {
    id
    customerId
    productName
    productType
    description
    aiRationale
    keyFeatures
    metrics
    generatedDate
    applicationLink
  }
`;

/**
 * Fragment for AI Voice Bot Interaction.
 */
export const GeminiAIVoiceBotInteractionFragmentDoc = gql`
  fragment GeminiAIVoiceBotInteraction on GeminiAIVoiceBotInteraction {
    id
    customerId
    interactionTimestamp
    userTranscript
    aiTranscript
    detectedIntent
    sentiment
    status
    audioLink
    confidenceScore
  }
`;

/**
 * Fragment for AI Quantum Safe Encryption Status.
 */
export const GeminiAIQuantumSafeEncryptionStatusFragmentDoc = gql`
  fragment GeminiAIQuantumSafeEncryptionStatus on GeminiAIQuantumSafeEncryptionStatus {
    id
    entityId
    entityType
    status
    lastUpdated
    protocolDetails
    complianceRating
  }
`;

/**
 * Fragment for AI Neuromorphic Processor Status.
 */
export const GeminiAINeuromorphicProcessorStatusFragmentDoc = gql`
  fragment GeminiAINeuromorphicProcessorStatus on GeminiAINeuromorphicProcessorStatus {
    id
    processorId
    status
    loadPercentage
    lastHealthCheck
    performanceMetrics
    activeModels
  }
`;

/**
 * Fragment for AI Digital Twin Financial Model.
 */
export const GeminiAIDigitalTwinFinancialModelFragmentDoc = gql`
  fragment GeminiAIDigitalTwinFinancialModel on GeminiAIDigitalTwinFinancialModel {
    id
    customerId
    modelVersion
    lastSimulationDate
    assumptions
    simulatedOutcomes
    recommendations {
      ...Recommendation
    }
    accuracyConfidence
  }
  ${RecommendationFragmentDoc}
`;

/**
 * Fragment for AI Cross-Sell Opportunity.
 */
export const GeminiAICrossSellOpportunityFragmentDoc = gql`
  fragment GeminiAICrossSellOpportunity on GeminiAICrossSellOpportunity {
    id
    customerId
    currentProduct
    recommendedProduct
    aiRationale
    likelihood
    marketingStrategy
    identifiedDate
  }
`;

/**
 * Fragment for AI Up-Sell Opportunity.
 */
export const GeminiAIUpSellOpportunityFragmentDoc = gql`
  fragment GeminiAIUpSellOpportunity on GeminiAIUpSellOpportunity {
    id
    customerId
    currentTier
    recommendedTier
    aiRationale
    likelihood
    benefits
    identifiedDate
  }
`;

/**
 * Fragment for AI Smart Contract Execution.
 */
export const GeminiAISmartContractExecutionFragmentDoc = gql`
  fragment GeminiAISmartContractExecution on GeminiAISmartContractExecution {
    id
    contractId
    functionName
    inputParameters
    outputResult
    status
    executionTimestamp
    transactionHash
    aiVerificationStatus
  }
`;


/**
 * Query to get an AI chat session.
 */
export const GetAiChatSessionDocument = gql`
    query GetAIChatSession($input: AIBankingQueryInput!) {
      aiBanking(input: $input) {
        getAIChatSession {
          ...AiChatSession
        }
      }
    }
    ${AiChatSessionFragmentDoc}
`;
export type GetAIChatSessionQueryVariables = Exact<{
  input: AIBankingQueryInput;
}>;
export type GetAIChatSessionQuery = { __typename?: 'GeminiQuery', aiBanking?: { __typename?: 'AIBankingQueryResponse', getAIChatSession?: { __typename?: 'AIChatSession', id: string, customerId: string, status: string, createdAt: any, updatedAt: any, messages: Array<{ __typename?: 'AIChatMessage', id: string, content: string, sender: string, timestamp: any, metadata?: any | null }> } | null } | null };

/**
 * __useGetAIChatSessionQuery__
 *
 * To run a query within a React component, call `useGetAIChatSessionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAIChatSessionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAIChatSessionQuery({
 *   variables: {
 *      input: { chatSessionId: "chat123" }
 *   },
 * });
 */
export function useGetAIChatSessionQuery(baseOptions: Apollo.QueryHookOptions<GetAIChatSessionQuery, GetAIChatSessionQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetAIChatSessionQuery, GetAIChatSessionQueryVariables>(GetAiChatSessionDocument, options);
}
export type GetAIChatSessionQueryHookResult = ReturnType<typeof useGetAIChatSessionQuery>;
export type GetAIChatSessionQueryResult = Apollo.QueryResult<GetAIChatSessionQuery, GetAIChatSessionQueryVariables>;

/**
 * Query to list all bank accounts for a given customer.
 */
export const ListCustomerAccountsDocument = gql`
    query ListCustomerAccounts($input: AIBankingQueryInput!) {
      aiBanking(input: $input) {
        listCustomerAccounts {
          ...BankAccount
        }
      }
    }
    ${BankAccountFragmentDoc}
`;
export type ListCustomerAccountsQueryVariables = Exact<{
  input: AIBankingQueryInput;
}>;
export type ListCustomerAccountsQuery = { __typename?: 'GeminiQuery', aiBanking?: { __typename?: 'AIBankingQueryResponse', listCustomerAccounts?: Array<{ __typename?: 'BankAccount', id: string, accountNumber: string, balance: number, currency: GeminiCurrencyEnum, accountType: string, accountHolderName: string, openedDate: any }> | null } | null };

/**
 * __useListCustomerAccountsQuery__
 *
 * To run a query within a React component, call `useListCustomerAccountsQuery` and pass it any options that fit your needs.
 *
 * @param baseOptions options that will be passed into the query.
 *
 * @example
 * const { data, loading, error } = useListCustomerAccountsQuery({
 *   variables: {
 *      input: { customerId: "cust123" }
 *   },
 * });
 */
export function useListCustomerAccountsQuery(baseOptions: Apollo.QueryHookOptions<ListCustomerAccountsQuery, ListCustomerAccountsQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ListCustomerAccountsQuery, ListCustomerAccountsQueryVariables>(ListCustomerAccountsDocument, options);
}
export type ListCustomerAccountsQueryHookResult = ReturnType<typeof useListCustomerAccountsQuery>;
export type ListCustomerAccountsQueryResult = Apollo.QueryResult<ListCustomerAccountsQuery, ListCustomerAccountsQueryVariables>;

/**
 * Query to retrieve transaction history for a specific bank account.
 */
export const ListAccountTransactionsDocument = gql`
    query ListAccountTransactions($input: AIBankingQueryInput!) {
      aiBanking(input: $input) {
        listAccountTransactions {
          ...Transaction
        }
      }
    }
    ${TransactionFragmentDoc}
`;
export type ListAccountTransactionsQueryVariables = Exact<{
  input: AIBankingQueryInput;
}>;
export type ListAccountTransactionsQuery = { __typename?: 'GeminiQuery', aiBanking?: { __typename?: 'AIBankingQueryResponse', listAccountTransactions?: Array<{ __typename?: 'Transaction', id: string, amount: number, currency: GeminiCurrencyEnum, description: string, transactionDate: any, transactionType: string, status: string, fromAccount?: ({ __typename?: 'BankAccount', id: string, accountNumber: string }) | null, toAccount?: ({ __typename?: 'BankAccount', id: string, accountNumber: string }) | null }> | null } | null };

/**
 * __useListAccountTransactionsQuery__
 *
 * To run a query within a React component, call `useListAccountTransactionsQuery` and pass it any options that fit your needs.
 *
 * @param baseOptions options that will be passed into the query.
 *
 * @example
 * const { data, loading, error } = useListAccountTransactionsQuery({
 *   variables: {
 *      input: { accountId: "acc456", startDate: "2023-01-01", endDate: "2023-12-31" }
 *   },
 * });
 */
export function useListAccountTransactionsQuery(baseOptions: Apollo.QueryHookOptions<ListAccountTransactionsQuery, ListAccountTransactionsQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ListAccountTransactionsQuery, ListAccountTransactionsQueryVariables>(ListAccountTransactionsDocument, options);
}
export type ListAccountTransactionsQueryHookResult = ReturnType<typeof useListAccountTransactionsQuery>;
export type ListAccountTransactionsQueryResult = Apollo.QueryResult<ListAccountTransactionsQuery, ListAccountTransactionsQueryVariables>;

/**
 * Query to retrieve the profile details for a given customer.
 */
export const GetCustomerProfileDocument = gql`
    query GetCustomerProfile($input: AIBankingQueryInput!) {
      aiBanking(input: $input) {
        getCustomerProfile {
          ...CustomerProfile
        }
      }
    }
    ${CustomerProfileFragmentDoc}
`;
export type GetCustomerProfileQueryVariables = Exact<{
  input: AIBankingQueryInput;
}>;
export type GetCustomerProfileQuery = { __typename?: 'GeminiQuery', aiBanking?: { __typename?: 'AIBankingQueryResponse', getCustomerProfile?: { __typename?: 'CustomerProfile', id: string, firstName: string, lastName: string, email: string, dateOfBirth?: any | null, phoneNumber?: string | null, addressLine1?: string | null, addressLine2?: string | null, city?: string | null, state?: string | null, postalCode?: string | null, country?: string | null, aiConfidenceScore?: number | null, fraudAlertsEnabled?: boolean | null, highValueTransactionThreshold?: number | null } | null } | null };

/**
 * __useGetCustomerProfileQuery__
 *
 * To run a query within a React component, call `useGetCustomerProfileQuery` and pass it any options that fit your needs.
 *
 * @param baseOptions options that will be passed into the query.
 *
 * @example
 * const { data, loading, error } = useGetCustomerProfileQuery({
 *   variables: {
 *      input: { customerId: "cust123" }
 *   },
 * });
 */
export function useGetCustomerProfileQuery(baseOptions: Apollo.QueryHookOptions<GetCustomerProfileQuery, GetCustomerProfileQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetCustomerProfileQuery, GetCustomerProfileQueryVariables>(GetCustomerProfileDocument, options);
}
export type GetCustomerProfileQueryHookResult = ReturnType<typeof useGetCustomerProfileQuery>;
export type GetCustomerProfileQueryResult = Apollo.QueryResult<GetCustomerProfileQuery, GetCustomerProfileQueryVariables>;

/**
 * Query to provide banking insights and recommendations.
 */
export const GetBankingInsightsDocument = gql`
    query GetBankingInsights($input: AIBankingQueryInput!) {
        aiBanking(input: $input) {
            getBankingInsights {
                ...BankingInsight
            }
        }
    }
    ${BankingInsightFragmentDoc}
`;
export type GetBankingInsightsQueryVariables = Exact<{
  input: AIBankingQueryInput;
}>;
export type GetBankingInsightsQuery = { __typename?: 'GeminiQuery', aiBanking?: { __typename?: 'AIBankingQueryResponse', getBankingInsights?: { __typename?: 'BankingInsight', id: string, type: string, title: string, description: string, contextData?: any | null, suggestedActions?: Array<{ __typename?: 'BankingAction', id: string, label: string, description?: string | null, actionType: string, parameters?: any | null }> | null } | null } | null };

/**
 * __useGetBankingInsightsQuery__
 *
 * To run a query within a React component, call `useGetBankingInsightsQuery` and pass it any options that fit your needs.
 *
 * @param baseOptions options that will be passed into the query.
 *
 * @example
 * const { data, loading, error } = useGetBankingInsightsQuery({
 *   variables: {
 *      input: { customerId: "cust123" }
 *   },
 * });
 */
export function useGetBankingInsightsQuery(baseOptions: Apollo.QueryHookOptions<GetBankingInsightsQuery, GetBankingInsightsQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetBankingInsightsQuery, GetBankingInsightsQueryVariables>(GetBankingInsightsDocument, options);
}
export type GetBankingInsightsQueryHookResult = ReturnType<typeof useGetBankingInsightsQuery>;
export type GetBankingInsightsQueryResult = Apollo.QueryResult<GetBankingInsightsQuery, AIBankingQueryInput>;

/**
 * Query to retrieve a financial forecast for a given customer.
 */
export const GetFinancialForecastDocument = gql`
    query GetFinancialForecast($input: AIBankingQueryInput!) {
      aiBanking(input: $input) {
        getFinancialForecast {
          ...FinancialForecast
        }
      }
    }
    ${FinancialForecastFragmentDoc}
`;
export type GetFinancialForecastQueryVariables = Exact<{
  input: AIBankingQueryInput;
}>;
export type GetFinancialForecastQuery = { __typename?: 'GeminiQuery', aiBanking?: { __typename?: 'AIBankingQueryResponse', getFinancialForecast?: { __typename?: 'FinancialForecast', id: string, customerId: string, period: string, projectedIncome: number, projectedExpenses: number, projectedSavings: number, details?: any | null, generatedDate: any } | null } | null };

/**
 * __useGetFinancialForecastQuery__
 *
 * To run a query within a React component, call `useGetFinancialForecastQuery` and pass it any options that fit your needs.
 *
 * @param baseOptions options that will be passed into the query.
 *
 * @example
 * const { data, loading, error } = useGetFinancialForecastQuery({
 *   variables: {
 *      input: { customerId: "cust123" }
 *   },
 * });
 */
export function useGetFinancialForecastQuery(baseOptions: Apollo.QueryHookOptions<GetFinancialForecastQuery, GetFinancialForecastQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetFinancialForecastQuery, GetFinancialForecastQueryVariables>(GetFinancialForecastDocument, options);
}
export type GetFinancialForecastQueryHookResult = ReturnType<typeof useGetFinancialForecastQuery>;
export type GetFinancialForecastQueryResult = Apollo.QueryResult<GetFinancialForecastQuery, GetFinancialForecastQueryVariables>;

/**
 * Query to detect potential fraud for a given transaction.
 */
export const DetectFraudDocument = gql`
    query DetectFraud($input: AIBankingQueryInput!) {
      aiBanking(input: $input) {
        detectFraud {
          ...FraudDetectionReport
        }
      }
    }
    ${FraudDetectionReportFragmentDoc}
`;
export type DetectFraudQueryVariables = Exact<{
  input: AIBankingQueryInput;
}>;
export type DetectFraudQuery = { __typename?: 'GeminiQuery', aiBanking?: { __typename?: 'AIBankingQueryResponse', detectFraud?: { __typename?: 'FraudDetectionReport', id: string, transactionId: string, riskLevel: string, confidenceScore: number, reasons?: Array<string> | null, generatedDate: any, suggestedActions?: Array<{ __typename?: 'BankingAction', id: string, label: string, description?: string | null, actionType: string, parameters?: any | null }> | null } | null } | null };

/**
 * __useDetectFraudQuery__
 *
 * To run a query within a React component, call `useDetectFraudQuery` and pass it any options that fit your needs.
 *
 * @param baseOptions options that will be passed into the query.
 *
 * @example
 * const { data, loading, error } = useDetectFraudQuery({
 *   variables: {
 *      input: { transactionId: "txn789" }
 *   },
 * });
 */
export function useDetectFraudQuery(baseOptions: Apollo.QueryHookOptions<DetectFraudQuery, DetectFraudQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<DetectFraudQuery, DetectFraudQueryVariables>(DetectFraudDocument, options);
}
export type DetectFraudQueryHookResult = ReturnType<typeof useDetectFraudQuery>;
export type DetectFraudQueryResult = Apollo.QueryResult<DetectFraudQuery, DetectFraudQueryVariables>;

/**
 * Query to provide personalized financial recommendations for a customer.
 */
export const GetPersonalizedRecommendationsDocument = gql`
    query GetPersonalizedRecommendations($input: AIBankingQueryInput!) {
      aiBanking(input: $input) {
        getPersonalizedRecommendations {
          ...Recommendation
        }
      }
    }
    ${RecommendationFragmentDoc}
`;
export type GetPersonalizedRecommendationsQueryVariables = Exact<{
  input: AIBankingQueryInput;
}>;
export type GetPersonalizedRecommendationsQuery = { __typename?: 'GeminiQuery', aiBanking?: { __typename?: 'AIBankingQueryResponse', getPersonalizedRecommendations?: Array<{ __typename?: 'Recommendation', id: string, customerId: string, type: string, title: string, description: string, generatedDate: any, metrics?: any | null, actions?: Array<{ __typename?: 'BankingAction', id: string, label: string, description?: string | null, actionType: string, parameters?: any | null }> | null }> | null } | null };

/**
 * __useGetPersonalizedRecommendationsQuery__
 *
 * To run a query within a React component, call `useGetPersonalizedRecommendationsQuery` and pass it any options that fit your needs.
 *
 * @param baseOptions options that will be passed into the query.
 *
 * @example
 * const { data, loading, error } = useGetPersonalizedRecommendationsQuery({
 *   variables: {
 *      input: { customerId: "cust123" }
 *   },
 * });
 */
export function useGetPersonalizedRecommendationsQuery(baseOptions: Apollo.QueryHookOptions<GetPersonalizedRecommendationsQuery, GetPersonalizedRecommendationsQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetPersonalizedRecommendationsQuery, GetPersonalizedRecommendationsQueryVariables>(GetPersonalizedRecommendationsDocument, options);
}
export type GetPersonalizedRecommendationsQueryHookResult = ReturnType<typeof useGetPersonalizedRecommendationsQuery>;
export type GetPersonalizedRecommendationsQueryResult = Apollo.QueryResult<GetPersonalizedRecommendationsQuery, GetPersonalizedRecommendationsQueryVariables>;

/**
 * Query to get AI Investment Opportunities.
 */
export const GetInvestmentOpportunitiesDocument = gql`
  query GetInvestmentOpportunities($input: AIBankingQueryInput!) {
    aiBanking(input: $input) {
      getInvestmentOpportunities {
        ...GeminiAIInvestmentOpportunity
      }
    }
  }
  ${GeminiAIInvestmentOpportunityFragmentDoc}
`;
export type GetInvestmentOpportunitiesQueryVariables = Exact<{
  input: AIBankingQueryInput;
}>;
export type GetInvestmentOpportunitiesQuery = { __typename?: 'GeminiQuery', aiBanking?: { __typename?: 'AIBankingQueryResponse', getInvestmentOpportunities?: Array<{ __typename?: 'GeminiAIInvestmentOpportunity', id: string, name: string, type: string, projectedReturn: number, riskLevel: string, description: string, identifiedDate: any, recommendedAction: string, confidenceScore: number, marketData?: any | null }> | null } | null };

/**
 * __useGetInvestmentOpportunitiesQuery__
 *
 * @param baseOptions options that will be passed into the query.
 */
export function useGetInvestmentOpportunitiesQuery(baseOptions: Apollo.QueryHookOptions<GetInvestmentOpportunitiesQuery, GetInvestmentOpportunitiesQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetInvestmentOpportunitiesQuery, GetInvestmentOpportunitiesQueryVariables>(GetInvestmentOpportunitiesDocument, options);
}
export type GetInvestmentOpportunitiesQueryHookResult = ReturnType<typeof useGetInvestmentOpportunitiesQuery>;
export type GetInvestmentOpportunitiesQueryResult = Apollo.QueryResult<GetInvestmentOpportunitiesQuery, GetInvestmentOpportunitiesQueryVariables>;

/**
 * Query to get AI Risk Assessment.
 */
export const GetRiskAssessmentDocument = gql`
  query GetRiskAssessment($input: AIBankingQueryInput!) {
    aiBanking(input: $input) {
      getRiskAssessment {
        ...GeminiAIRiskAssessmentReport
      }
    }
  }
  ${GeminiAIRiskAssessmentReportFragmentDoc}
`;
export type GetRiskAssessmentQueryVariables = Exact<{
  input: AIBankingQueryInput;
}>;
export type GetRiskAssessmentQuery = { __typename?: 'GeminiQuery', aiBanking?: { __typename?: 'AIBankingQueryResponse', getRiskAssessment?: { __typename?: 'GeminiAIRiskAssessmentReport', id: string, entityId: string, riskType: string, overallRating: string, confidenceScore: number, riskFactors: Array<string>, mitigationStrategies?: Array<string> | null, generatedDate: any, details?: any | null } | null } | null };

/**
 * __useGetRiskAssessmentQuery__
 *
 * @param baseOptions options that will be passed into the query.
 */
export function useGetRiskAssessmentQuery(baseOptions: Apollo.QueryHookOptions<GetRiskAssessmentQuery, GetRiskAssessmentQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetRiskAssessmentQuery, GetRiskAssessmentQueryVariables>(GetRiskAssessmentDocument, options);
}
export type GetRiskAssessmentQueryHookResult = ReturnType<typeof useGetRiskAssessmentQuery>;
export type GetRiskAssessmentQueryResult = Apollo.QueryResult<GetRiskAssessmentQuery, GetRiskAssessmentQueryVariables>;

/**
 * Query to analyze spending patterns.
 */
export const AnalyzeSpendingPatternsDocument = gql`
  query AnalyzeSpendingPatterns($input: AIBankingQueryInput!) {
    aiBanking(input: $input) {
      analyzeSpendingPatterns {
        ...GeminiAISpendingPatternAnalysis
      }
    }
  }
  ${GeminiAISpendingPatternAnalysisFragmentDoc}
`;
export type AnalyzeSpendingPatternsQueryVariables = Exact<{
  input: AIBankingQueryInput;
}>;
export type AnalyzeSpendingPatternsQuery = { __typename?: 'GeminiQuery', aiBanking?: { __typename?: 'AIBankingQueryResponse', analyzeSpendingPatterns?: { __typename?: 'GeminiAISpendingPatternAnalysis', id: string, customerId: string, period: string, analysisDate: any, topCategories: Array<{ __typename?: 'GeminiAISpendingCategory', name: string, totalAmount: any, percentage: number, trend: string }>, anomalies?: Array<{ __typename?: 'GeminiAISpendingAnomaly', id: string, description: string, transactionId?: string | null, severity: string, confidenceScore: number, date: any }> | null, recommendations?: Array<{ __typename?: 'Recommendation', id: string, customerId: string, type: string, title: string, description: string, generatedDate: any, metrics?: any | null, actions?: Array<{ __typename?: 'BankingAction', id: string, label: string, description?: string | null, actionType: string, parameters?: any | null }> | null }> | null } | null } | null };

/**
 * __useAnalyzeSpendingPatternsQuery__
 *
 * @param baseOptions options that will be passed into the query.
 */
export function useAnalyzeSpendingPatternsQuery(baseOptions: Apollo.QueryHookOptions<AnalyzeSpendingPatternsQuery, AnalyzeSpendingPatternsQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<AnalyzeSpendingPatternsQuery, AnalyzeSpendingPatternsQueryVariables>(AnalyzeSpendingPatternsDocument, options);
}
export type AnalyzeSpendingPatternsQueryHookResult = ReturnType<typeof useAnalyzeSpendingPatternsQuery>;
export type AnalyzeSpendingPatternsQueryResult = Apollo.QueryResult<AnalyzeSpendingPatternsQuery, AnalyzeSpendingPatternsQueryVariables>;

/**
 * Query to predict future transactions.
 */
export const PredictFutureTransactionsDocument = gql`
  query PredictFutureTransactions($input: AIBankingQueryInput!) {
    aiBanking(input: $input) {
      predictFutureTransactions {
        ...GeminiAITransactionPrediction
      }
    }
  }
  ${GeminiAITransactionPredictionFragmentDoc}
`;
export type PredictFutureTransactionsQueryVariables = Exact<{
  input: AIBankingQueryInput;
}>;
export type PredictFutureTransactionsQuery = { __typename?: 'GeminiQuery', aiBanking?: { __typename?: 'AIBankingQueryResponse', predictFutureTransactions?: Array<{ __typename?: 'GeminiAITransactionPrediction', id: string, customerId: string, predictedDate: any, predictedAmount?: any | null, predictedCurrency?: GeminiCurrencyEnum | null, predictedType: string, confidenceScore: number, rationale?: string | null, predictionDate: any }> | null } | null };

/**
 * __usePredictFutureTransactionsQuery__
 *
 * @param baseOptions options that will be passed into the query.
 */
export function usePredictFutureTransactionsQuery(baseOptions: Apollo.QueryHookOptions<PredictFutureTransactionsQuery, PredictFutureTransactionsQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<PredictFutureTransactionsQuery, PredictFutureTransactionsQueryVariables>(PredictFutureTransactionsDocument, options);
}
export type PredictFutureTransactionsQueryHookResult = ReturnType<typeof usePredictFutureTransactionsQuery>;
export type PredictFutureTransactionsQueryResult = Apollo.QueryResult<PredictFutureTransactionsQuery, PredictFutureTransactionsQueryVariables>;

/**
 * Query to get sentiment analysis report.
 */
export const GetSentimentAnalysisReportDocument = gql`
  query GetSentimentAnalysisReport($input: AIBankingQueryInput!) {
    aiBanking(input: $input) {
      getSentimentAnalysisReport {
        ...GeminiAISentimentAnalysisReport
      }
    }
  }
  ${GeminiAISentimentAnalysisReportFragmentDoc}
`;
export type GetSentimentAnalysisReportQueryVariables = Exact<{
  input: AIBankingQueryInput;
}>;
export type GetSentimentAnalysisReportQuery = { __typename?: 'GeminiQuery', aiBanking?: { __typename?: 'AIBankingQueryResponse', getSentimentAnalysisReport?: { __typename?: 'GeminiAISentimentAnalysisReport', id: string, target: string, overallSentiment: string, sentimentScore: number, keyPhrases?: Array<string> | null, source?: string | null, analysisDate: any, analyzedTextSample?: string | null } | null } | null };

/**
 * __useGetSentimentAnalysisReportQuery__
 *
 * @param baseOptions options that will be passed into the query.
 */
export function useGetSentimentAnalysisReportQuery(baseOptions: Apollo.QueryHookOptions<GetSentimentAnalysisReportQuery, GetSentimentAnalysisReportQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetSentimentAnalysisReportQuery, GetSentimentAnalysisReportQueryVariables>(GetSentimentAnalysisReportDocument, options);
}
export type GetSentimentAnalysisReportQueryHookResult = ReturnType<typeof useGetSentimentAnalysisReportQuery>;
export type GetSentimentAnalysisReportQueryResult = Apollo.QueryResult<GetSentimentAnalysisReportQuery, GetSentimentAnalysisReportQueryVariables>;

/**
 * Query to get Financial Health Score.
 */
export const GetFinancialHealthScoreDocument = gql`
  query GetFinancialHealthScore($input: AIBankingQueryInput!) {
    aiBanking(input: $input) {
      getFinancialHealthScore {
        ...GeminiAIFinancialHealthScore
      }
    }
  }
  ${GeminiAIFinancialHealthScoreFragmentDoc}
`;
export type GetFinancialHealthScoreQueryVariables = Exact<{
  input: AIBankingQueryInput;
}>;
export type GetFinancialHealthScoreQuery = { __typename?: 'GeminiQuery', aiBanking?: { __typename?: 'AIBankingQueryResponse', getFinancialHealthScore?: { __typename?: 'GeminiAIFinancialHealthScore', id: string, customerId: string, score: number, rating: string, contributingFactors: Array<string>, calculatedDate: any, details?: any | null, recommendations?: Array<{ __typename?: 'Recommendation', id: string, customerId: string, type: string, title: string, description: string, generatedDate: any, metrics?: any | null, actions?: Array<{ __typename?: 'BankingAction', id: string, label: string, description?: string | null, actionType: string, parameters?: any | null }> | null }> | null } | null } | null };

/**
 * __useGetFinancialHealthScoreQuery__
 *
 * @param baseOptions options that will be passed into the query.
 */
export function useGetFinancialHealthScoreQuery(baseOptions: Apollo.QueryHookOptions<GetFinancialHealthScoreQuery, GetFinancialHealthScoreQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetFinancialHealthScoreQuery, GetFinancialHealthScoreQueryVariables>(GetFinancialHealthScoreDocument, options);
}
export type GetFinancialHealthScoreQueryHookResult = ReturnType<typeof useGetFinancialHealthScoreQuery>;
export type GetFinancialHealthScoreQueryResult = Apollo.QueryResult<GetFinancialHealthScoreQuery, GetFinancialHealthScoreQueryVariables>;

/**
 * Query to get Personalized Alerts.
 */
export const GetPersonalizedAlertsDocument = gql`
  query GetPersonalizedAlerts($input: AIBankingQueryInput!) {
    aiBanking(input: $input) {
      getPersonalizedAlerts {
        ...GeminiAIPersonalizedAlert
      }
    }
  }
  ${GeminiAIPersonalizedAlertFragmentDoc}
`;
export type GetPersonalizedAlertsQueryVariables = Exact<{
  input: AIBankingQueryInput;
}>;
export type GetPersonalizedAlertsQuery = { __typename?: 'GeminiQuery', aiBanking?: { __typename?: 'AIBankingQueryResponse', getPersonalizedAlerts?: Array<{ __typename?: 'GeminiAIPersonalizedAlert', id: string, customerId: string, title: string, message: string, alertType: string, severity: string, isRead: boolean, generatedDate: any, suggestedActions?: Array<{ __typename?: 'BankingAction', id: string, label: string, description?: string | null }> | null }> | null } | null };

/**
 * __useGetPersonalizedAlertsQuery__
 *
 * @param baseOptions options that will be passed into the query.
 */
export function useGetPersonalizedAlertsQuery(baseOptions: Apollo.QueryHookOptions<GetPersonalizedAlertsQuery, GetPersonalizedAlertsQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetPersonalizedAlertsQuery, GetPersonalizedAlertsQueryVariables>(GetPersonalizedAlertsDocument, options);
}
export type GetPersonalizedAlertsQueryHookResult = ReturnType<typeof useGetPersonalizedAlertsQuery>;
export type GetPersonalizedAlertsQueryResult = Apollo.QueryResult<GetPersonalizedAlertsQuery, GetPersonalizedAlertsQueryVariables>;

/**
 * Query to get Customer Segmentation.
 */
export const GetCustomerSegmentationDocument = gql`
  query GetCustomerSegmentation($input: AIBankingQueryInput!) {
    aiBanking(input: $input) {
      getCustomerSegmentation {
        ...GeminiAICustomerSegmentation
      }
    }
  }
  ${GeminiAICustomerSegmentationFragmentDoc}
`;
export type GetCustomerSegmentationQueryVariables = Exact<{
  input: AIBankingQueryInput;
}>;
export type GetCustomerSegmentationQuery = { __typename?: 'GeminiQuery', aiBanking?: { __typename?: 'AIBankingQueryResponse', getCustomerSegmentation?: Array<{ __typename?: 'GeminiAICustomerSegmentation', id: string, customerId: string, segmentName: string, confidenceScore: number, characteristics: Array<string>, lastUpdated: any, segmentStrategies?: any | null }> | null } | null };

/**
 * __useGetCustomerSegmentationQuery__
 *
 * @param baseOptions options that will be passed into the query.
 */
export function useGetCustomerSegmentationQuery(baseOptions: Apollo.QueryHookOptions<GetCustomerSegmentationQuery, GetCustomerSegmentationQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetCustomerSegmentationQuery, GetCustomerSegmentationQueryVariables>(GetCustomerSegmentationDocument, options);
}
export type GetCustomerSegmentationQueryHookResult = ReturnType<typeof useGetCustomerSegmentationQuery>;
export type GetCustomerSegmentationQueryResult = Apollo.QueryResult<GetCustomerSegmentationQuery, GetCustomerSegmentationQueryVariables>;

/**
 * Query to get Fraud Score.
 */
export const GetFraudScoreDocument = gql`
  query GetFraudScore($input: AIBankingQueryInput!) {
    aiBanking(input: $input) {
      getFraudScore {
        ...GeminiAIFraudScore
      }
    }
  }
  ${GeminiAIFraudScoreFragmentDoc}
`;
export type GetFraudScoreQueryVariables = Exact<{
  input: AIBankingQueryInput;
}>;
export type GetFraudScoreQuery = { __typename?: 'GeminiQuery', aiBanking?: { __typename?: 'AIBankingQueryResponse', getFraudScore?: { __typename?: 'GeminiAIFraudScore', id: string, entityId: string, entityType: string, score: number, riskLevel: string, indicators: Array<string>, generatedDate: any, recommendations?: Array<{ __typename?: 'BankingAction', id: string, label: string }> | null } | null } | null };

/**
 * __useGetFraudScoreQuery__
 *
 * @param baseOptions options that will be passed into the query.
 */
export function useGetFraudScoreQuery(baseOptions: Apollo.QueryHookOptions<GetFraudScoreQuery, GetFraudScoreQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetFraudScoreQuery, GetFraudScoreQueryVariables>(GetFraudScoreDocument, options);
}
export type GetFraudScoreQueryHookResult = ReturnType<typeof useGetFraudScoreQuery>;
export type GetFraudScoreQueryResult = Apollo.QueryResult<GetFraudScoreQuery, GetFraudScoreQueryVariables>;

/**
 * Query to get Market Trend Analysis.
 */
export const GetMarketTrendAnalysisDocument = gql`
  query GetMarketTrendAnalysis($input: AIBankingQueryInput!) {
    aiBanking(input: $input) {
      getMarketTrendAnalysis {
        ...GeminiAIMarketTrendAnalysis
      }
    }
  }
  ${GeminiAIMarketTrendAnalysisFragmentDoc}
`;
export type GetMarketTrendAnalysisQueryVariables = Exact<{
  input: AIBankingQueryInput;
}>;
export type GetMarketTrendAnalysisQuery = { __typename?: 'GeminiQuery', aiBanking?: { __typename?: 'AIBankingQueryResponse', getMarketTrendAnalysis?: Array<{ __typename?: 'GeminiAIMarketTrendAnalysis', id: string, marketSector: string, trend: string, drivers: Array<string>, forecast?: string | null, analysisDate: any, relevantAssets?: Array<string> | null, metrics?: any | null }> | null } | null };

/**
 * __useGetMarketTrendAnalysisQuery__
 *
 * @param baseOptions options that will be passed into the query.
 */
export function useGetMarketTrendAnalysisQuery(baseOptions: Apollo.QueryHookOptions<GetMarketTrendAnalysisQuery, GetMarketTrendAnalysisQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetMarketTrendAnalysisQuery, GetMarketTrendAnalysisQueryVariables>(GetMarketTrendAnalysisDocument, options);
}
export type GetMarketTrendAnalysisQueryHookResult = ReturnType<typeof useGetMarketTrendAnalysisQuery>;
export type GetMarketTrendAnalysisQueryResult = Apollo.QueryResult<GetMarketTrendAnalysisQuery, GetMarketTrendAnalysisQueryVariables>;

/**
 * Query to get Loan Eligibility Assessment.
 */
export const GetLoanEligibilityAssessmentDocument = gql`
  query GetLoanEligibilityAssessment($input: AIBankingQueryInput!) {
    aiBanking(input: $input) {
      getLoanEligibilityAssessment {
        ...GeminiAILoanEligibilityAssessment
      }
    }
  }
  ${GeminiAILoanEligibilityAssessmentFragmentDoc}
`;
export type GetLoanEligibilityAssessmentQueryVariables = Exact<{
  input: AIBankingQueryInput;
}>;
export type GetLoanEligibilityAssessmentQuery = { __typename?: 'GeminiQuery', aiBanking?: { __typename?: 'AIBankingQueryResponse', getLoanEligibilityAssessment?: { __typename?: 'GeminiAILoanEligibilityAssessment', id: string, customerId: string, loanType: string, isEligible: boolean, confidenceScore: number, reasons: Array<string>, recommendedAmount?: any | null, assessmentDate: any, nextSteps?: Array<{ __typename?: 'BankingAction', id: string, label: string }> | null } | null } | null };

/**
 * __useGetLoanEligibilityAssessmentQuery__
 *
 * @param baseOptions options that will be passed into the query.
 */
export function useGetLoanEligibilityAssessmentQuery(baseOptions: Apollo.QueryHookOptions<GetLoanEligibilityAssessmentQuery, GetLoanEligibilityAssessmentQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetLoanEligibilityAssessmentQuery, GetLoanEligibilityAssessmentQueryVariables>(GetLoanEligibilityAssessmentDocument, options);
}
export type GetLoanEligibilityAssessmentQueryHookResult = ReturnType<typeof useGetLoanEligibilityAssessmentQuery>;
export type GetLoanEligibilityAssessmentQueryResult = Apollo.QueryResult<GetLoanEligibilityAssessmentQuery, GetLoanEligibilityAssessmentQueryVariables>;

/**
 * Query to get Credit Score Analysis.
 */
export const GetCreditScoreAnalysisDocument = gql`
  query GetCreditScoreAnalysis($input: AIBankingQueryInput!) {
    aiBanking(input: $input) {
      getCreditScoreAnalysis {
        ...GeminiAICreditScoreAnalysis
      }
    }
  }
  ${GeminiAICreditScoreAnalysisFragmentDoc}
`;
export type GetCreditScoreAnalysisQueryVariables = Exact<{
  input: AIBankingQueryInput;
}>;
export type GetCreditScoreAnalysisQuery = { __typename?: 'GeminiQuery', aiBanking?: { __typename?: 'AIBankingQueryResponse', getCreditScoreAnalysis?: { __typename?: 'GeminiAICreditScoreAnalysis', id: string, customerId: string, creditScore: number, positiveFactors: Array<string>, negativeFactors: Array<string>, analysisDate: any, potentialScoreIncrease?: number | null, improvementRecommendations?: Array<{ __typename?: 'Recommendation', id: string, customerId: string, type: string, title: string, description: string, generatedDate: any, metrics?: any | null, actions?: Array<{ __typename?: 'BankingAction', id: string, label: string, description?: string | null, actionType: string, parameters?: any | null }> | null }> | null } | null } | null };

/**
 * __useGetCreditScoreAnalysisQuery__
 *
 * @param baseOptions options that will be passed into the query.
 */
export function useGetCreditScoreAnalysisQuery(baseOptions: Apollo.QueryHookOptions<GetCreditScoreAnalysisQuery, GetCreditScoreAnalysisQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetCreditScoreAnalysisQuery, GetCreditScoreAnalysisQueryVariables>(GetCreditScoreAnalysisDocument, options);
}
export type GetCreditScoreAnalysisQueryHookResult = ReturnType<typeof useGetCreditScoreAnalysisQuery>;
export type GetCreditScoreAnalysisQueryResult = Apollo.QueryResult<GetCreditScoreAnalysisQuery, GetCreditScoreAnalysisQueryVariables>;

/**
 * Query to analyze a document.
 */
export const AnalyzeDocumentDocument = gql`
  query AnalyzeDocument($input: AIBankingQueryInput!) {
    aiBanking(input: $input) {
      analyzeDocument {
        ...GeminiAIDocumentAnalysisResult
      }
    }
  }
  ${GeminiAIDocumentAnalysisResultFragmentDoc}
`;
export type AnalyzeDocumentQueryVariables = Exact<{
  input: AIBankingQueryInput;
}>;
export type AnalyzeDocumentQuery = { __typename?: 'GeminiQuery', aiBanking?: { __typename?: 'AIBankingQueryResponse', analyzeDocument?: { __typename?: 'GeminiAIDocumentAnalysisResult', id: string, documentName: string, documentType: string, anomalies?: Array<string> | null, complianceStatus: string, confidenceScore: number, analysisDate: any, documentSummary?: string | null, extractedEntities: Array<{ __typename?: 'GeminiAIExtractedEntity', name: string, value: string, confidence: number }> } | null } | null };

/**
 * __useAnalyzeDocumentQuery__
 *
 * @param baseOptions options that will be passed into the query.
 */
export function useAnalyzeDocumentQuery(baseOptions: Apollo.QueryHookOptions<AnalyzeDocumentQuery, AnalyzeDocumentQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<AnalyzeDocumentQuery, AnalyzeDocumentQueryVariables>(AnalyzeDocumentDocument, options);
}
export type AnalyzeDocumentQueryHookResult = ReturnType<typeof useAnalyzeDocumentQuery>;
export type AnalyzeDocumentQueryResult = Apollo.QueryResult<AnalyzeDocumentQuery, AnalyzeDocumentQueryVariables>;

/**
 * Query to get Quantum Safe Encryption Status.
 */
export const GetQuantumSafeEncryptionStatusDocument = gql`
  query GetQuantumSafeEncryptionStatus($input: AIBankingQueryInput!) {
    aiBanking(input: $input) {
      getQuantumSafeEncryptionStatus {
        ...GeminiAIQuantumSafeEncryptionStatus
      }
    }
  }
  ${GeminiAIQuantumSafeEncryptionStatusFragmentDoc}
`;
export type GetQuantumSafeEncryptionStatusQueryVariables = Exact<{
  input: AIBankingQueryInput;
}>;
export type GetQuantumSafeEncryptionStatusQuery = { __typename?: 'GeminiQuery', aiBanking?: { __typename?: 'AIBankingQueryResponse', getQuantumSafeEncryptionStatus?: { __typename?: 'GeminiAIQuantumSafeEncryptionStatus', id: string, entityId: string, entityType: string, status: string, lastUpdated: any, protocolDetails?: string | null, complianceRating: string } | null } | null };

/**
 * __useGetQuantumSafeEncryptionStatusQuery__
 *
 * @param baseOptions options that will be passed into the query.
 */
export function useGetQuantumSafeEncryptionStatusQuery(baseOptions: Apollo.QueryHookOptions<GetQuantumSafeEncryptionStatusQuery, GetQuantumSafeEncryptionStatusQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetQuantumSafeEncryptionStatusQuery, GetQuantumSafeEncryptionStatusQueryVariables>(GetQuantumSafeEncryptionStatusDocument, options);
}
export type GetQuantumSafeEncryptionStatusQueryHookResult = ReturnType<typeof useGetQuantumSafeEncryptionStatusQuery>;
export type GetQuantumSafeEncryptionStatusQueryResult = Apollo.QueryResult<GetQuantumSafeEncryptionStatusQuery, GetQuantumSafeEncryptionStatusQueryVariables>;

/**
 * Query to get Neuromorphic Processor Status.
 */
export const GetNeuromorphicProcessorStatusDocument = gql`
  query GetNeuromorphicProcessorStatus($input: AIBankingQueryInput!) {
    aiBanking(input: $input) {
      getNeuromorphicProcessorStatus {
        ...GeminiAINeuromorphicProcessorStatus
      }
    }
  }
  ${GeminiAINeuromorphicProcessorStatusFragmentDoc}
`;
export type GetNeuromorphicProcessorStatusQueryVariables = Exact<{
  input: AIBankingQueryInput;
}>;
export type GetNeuromorphicProcessorStatusQuery = { __typename?: 'GeminiQuery', aiBanking?: { __typename?: 'AIBankingQueryResponse', getNeuromorphicProcessorStatus?: { __typename?: 'GeminiAINeuromorphicProcessorStatus', id: string, processorId: string, status: string, loadPercentage: number, lastHealthCheck: any, performanceMetrics?: any | null, activeModels: number } | null } | null };

/**
 * __useGetNeuromorphicProcessorStatusQuery__
 *
 * @param baseOptions options that will be passed into the query.
 */
export function useGetNeuromorphicProcessorStatusQuery(baseOptions: Apollo.QueryHookOptions<GetNeuromorphicProcessorStatusQuery, GetNeuromorphicProcessorStatusQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetNeuromorphicProcessorStatusQuery, GetNeuromorphicProcessorStatusQueryVariables>(GetNeuromorphicProcessorStatusDocument, options);
}
export type GetNeuromorphicProcessorStatusQueryHookResult = ReturnType<typeof useGetNeuromorphicProcessorStatusQuery>;
export type GetNeuromorphicProcessorStatusQueryResult = Apollo.QueryResult<GetNeuromorphicProcessorStatusQuery, GetNeuromorphicProcessorStatusQueryVariables>;

/**
 * Query to get Digital Twin Financial Model.
 */
export const GetDigitalTwinFinancialModelDocument = gql`
  query GetDigitalTwinFinancialModel($input: AIBankingQueryInput!) {
    aiBanking(input: $input) {
      getDigitalTwinFinancialModel {
        ...GeminiAIDigitalTwinFinancialModel
      }
    }
  }
  ${GeminiAIDigitalTwinFinancialModelFragmentDoc}
`;
export type GetDigitalTwinFinancialModelQueryVariables = Exact<{
  input: AIBankingQueryInput;
}>;
export type GetDigitalTwinFinancialModelQuery = { __typename?: 'GeminiQuery', aiBanking?: { __typename?: 'AIBankingQueryResponse', getDigitalTwinFinancialModel?: { __typename?: 'GeminiAIDigitalTwinFinancialModel', id: string, customerId: string, modelVersion: string, lastSimulationDate: any, assumptions: Array<string>, simulatedOutcomes?: any | null, accuracyConfidence: number, recommendations?: Array<{ __typename?: 'Recommendation', id: string, customerId: string, type: string, title: string, description: string, generatedDate: any, metrics?: any | null, actions?: Array<{ __typename?: 'BankingAction', id: string, label: string, description?: string | null, actionType: string, parameters?: any | null }> | null }> | null } | null } | null };

/**
 * __useGetDigitalTwinFinancialModelQuery__
 *
 * @param baseOptions options that will be passed into the query.
 */
export function useGetDigitalTwinFinancialModelQuery(baseOptions: Apollo.QueryHookOptions<GetDigitalTwinFinancialModelQuery, GetDigitalTwinFinancialModelQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetDigitalTwinFinancialModelQuery, GetDigitalTwinFinancialModelQueryVariables>(GetDigitalTwinFinancialModelDocument, options);
}
export type GetDigitalTwinFinancialModelQueryHookResult = ReturnType<typeof useGetDigitalTwinFinancialModelQuery>;
export type GetDigitalTwinFinancialModelQueryResult = Apollo.QueryResult<GetDigitalTwinFinancialModelQuery, GetDigitalTwinFinancialModelQueryVariables>;

/**
 * Query to get Cross-Sell Opportunities.
 */
export const GetCrossSellOpportunitiesDocument = gql`
  query GetCrossSellOpportunities($input: AIBankingQueryInput!) {
    aiBanking(input: $input) {
      getCrossSellOpportunities {
        ...GeminiAICrossSellOpportunity
      }
    }
  }
  ${GeminiAICrossSellOpportunityFragmentDoc}
`;
export type GetCrossSellOpportunitiesQueryVariables = Exact<{
  input: AIBankingQueryInput;
}>;
export type GetCrossSellOpportunitiesQuery = { __typename?: 'GeminiQuery', aiBanking?: { __typename?: 'AIBankingQueryResponse', getCrossSellOpportunities?: Array<{ __typename?: 'GeminiAICrossSellOpportunity', id: string, customerId: string, currentProduct: string, recommendedProduct: string, aiRationale: string, likelihood: number, marketingStrategy?: string | null, identifiedDate: any }> | null } | null };

/**
 * __useGetCrossSellOpportunitiesQuery__
 *
 * @param baseOptions options that will be passed into the query.
 */
export function useGetCrossSellOpportunitiesQuery(baseOptions: Apollo.QueryHookOptions<GetCrossSellOpportunitiesQuery, GetCrossSellOpportunitiesQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetCrossSellOpportunitiesQuery, GetCrossSellOpportunitiesQueryVariables>(GetCrossSellOpportunitiesDocument, options);
}
export type GetCrossSellOpportunitiesQueryHookResult = ReturnType<typeof useGetCrossSellOpportunitiesQuery>;
export type GetCrossSellOpportunitiesQueryResult = Apollo.QueryResult<GetCrossSellOpportunitiesQuery, GetCrossSellOpportunitiesQueryVariables>;

/**
 * Query to get Up-Sell Opportunities.
 */
export const GetUpSellOpportunitiesDocument = gql`
  query GetUpSellOpportunities($input: AIBankingQueryInput!) {
    aiBanking(input: $input) {
      getUpSellOpportunities {
        ...GeminiAIUpSellOpportunity
      }
    }
  }
  ${GeminiAIUpSellOpportunityFragmentDoc}
`;
export type GetUpSellOpportunitiesQueryVariables = Exact<{
  input: AIBankingQueryInput;
}>;
export type GetUpSellOpportunitiesQuery = { __typename?: 'GeminiQuery', aiBanking?: { __typename?: 'AIBankingQueryResponse', getUpSellOpportunities?: Array<{ __typename?: 'GeminiAIUpSellOpportunity', id: string, customerId: string, currentTier: string, recommendedTier: string, aiRationale: string, likelihood: number, benefits?: Array<string> | null, identifiedDate: any }> | null } | null };

/**
 * __useGetUpSellOpportunitiesQuery__
 *
 * @param baseOptions options that will be passed into the query.
 */
export function useGetUpSellOpportunitiesQuery(baseOptions: Apollo.QueryHookOptions<GetUpSellOpportunitiesQuery, GetUpSellOpportunitiesQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetUpSellOpportunitiesQuery, GetUpSellOpportunitiesQueryVariables>(GetUpSellOpportunitiesDocument, options);
}
export type GetUpSellOpportunitiesQueryHookResult = ReturnType<typeof useGetUpSellOpportunitiesQuery>;
export type GetUpSellOpportunitiesQueryResult = Apollo.QueryResult<GetUpSellOpportunitiesQuery, GetUpSellOpportunitiesQueryVariables>;

/**
 * Query to get Financial Goals.
 */
export const GetFinancialGoalsDocument = gql`
  query GetFinancialGoals($input: AIBankingQueryInput!) {
    aiBanking(input: $input) {
      getFinancialGoals {
        ...GeminiAIPersonalizedFinancialGoal
      }
    }
  }
  ${GeminiAIPersonalizedFinancialGoalFragmentDoc}
`;
export type GetFinancialGoalsQueryVariables = Exact<{
  input: AIBankingQueryInput;
}>;
export type GetFinancialGoalsQuery = { __typename?: 'GeminiQuery', aiBanking?: { __typename?: 'AIBankingQueryResponse', getFinancialGoals?: Array<{ __typename?: 'GeminiAIPersonalizedFinancialGoal', id: string, customerId: string, goalName: string, description?: string | null, targetAmount: any, currentAmount: any, targetDate?: any | null, status: string, lastUpdated: any, aiRecommendations?: Array<{ __typename?: 'Recommendation', id: string, customerId: string, type: string, title: string, description: string, generatedDate: any, metrics?: any | null, actions?: Array<{ __typename?: 'BankingAction', id: string, label: string, description?: string | null, actionType: string, parameters?: any | null }> | null }> | null }> | null } | null };

/**
 * __useGetFinancialGoalsQuery__
 *
 * @param baseOptions options that will be passed into the query.
 */
export function useGetFinancialGoalsQuery(baseOptions: Apollo.QueryHookOptions<GetFinancialGoalsQuery, GetFinancialGoalsQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetFinancialGoalsQuery, GetFinancialGoalsQueryVariables>(GetFinancialGoalsDocument, options);
}
export type GetFinancialGoalsQueryHookResult = ReturnType<typeof useGetFinancialGoalsQuery>;
export type GetFinancialGoalsQueryResult = Apollo.QueryResult<GetFinancialGoalsQuery, GetFinancialGoalsQueryVariables>;


/**
 * Mutation to send a message within an AI chat session.
 */
export const SendAiChatMessageDocument = gql`
    mutation SendAIChatMessage($input: AIBankingMutationInput!) {
      aiBanking(input: $input) {
        sendAIChatMessage {
          ...AiChatMessage
        }
      }
    }
    ${AiChatMessageFragmentDoc}
`;
export type SendAIChatMessageMutationVariables = Exact<{
  input: AIBankingMutationInput;
}>;
export type SendAIChatMessageMutation = { __typename?: 'GeminiMutation', aiBanking?: { __typename?: 'AIBankingMutationResponse', sendAIChatMessage?: { __typename?: 'AIChatMessage', id: string, content: string, sender: string, timestamp: any, metadata?: any | null }> | null } | null };

/**
 * __useSendAIChatMessageMutation__
 *
 * To run a mutation, you first call `useSendAIChatMessageMutation` within a React component and pass it any options that fit your needs.
 *
 * @param baseOptions options that will be passed into the mutation.
 *
 * @example
 * const [sendAIChatMessageMutation, { data, loading, error }] = useSendAIChatMessageMutation({
 *   variables: {
 *      input: { chatMessageInput: { sessionId: "chat123", content: "Hi AI, what's my balance?" } }
 *   },
 * });
 */
export function useSendAIChatMessageMutation(baseOptions?: Apollo.MutationHookOptions<SendAIChatMessageMutation, SendAIChatMessageMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SendAIChatMessageMutation, SendAIChatMessageMutationVariables>(SendAiChatMessageDocument, options);
}
export type SendAIChatMessageMutationHookResult = ReturnType<typeof useSendAIChatMessageMutation>;
export type SendAIChatMessageMutationResult = Apollo.MutationResult<SendAIChatMessageMutation>;
export type SendAIChatMessageMutationOptions = Apollo.BaseMutationOptions<SendAIChatMessageMutation, AIBankingMutationInput>;

/**
 * Mutation to start a new AI chat session.
 */
export const StartNewAiChatSessionDocument = gql`
    mutation StartNewAIChatSession($input: AIBankingMutationInput!) {
      aiBanking(input: $input) {
        startNewAIChatSession {
          ...AiChatSession
        }
      }
    }
    ${AiChatSessionFragmentDoc}
`;
export type StartNewAIChatSessionMutationVariables = Exact<{
  input: AIBankingMutationInput;
}>;
export type StartNewAIChatSessionMutation = { __typename?: 'GeminiMutation', aiBanking?: { __typename?: 'AIBankingMutationResponse', startNewAIChatSession?: { __typename?: 'AIChatSession', id: string, customerId: string, status: string, createdAt: any, updatedAt: any, messages: Array<{ __typename?: 'AIChatMessage', id: string, content: string, sender: string, timestamp: any, metadata?: any | null }> } | null } | null };

/**
 * __useStartNewAIChatSessionMutation__
 *
 * To run a mutation, you first call `useStartNewAIChatSessionMutation` within a React component and pass it any options that fit your needs.
 *
 * @param baseOptions options that will be passed into the mutation.
 *
 * @example
 * const [startNewAIChatSessionMutation, { data, loading, error }] = useStartNewAIChatSessionMutation({
 *   variables: {
 *      input: { newChatSessionInput: { customerId: "cust123", initialMessage: "I need help with my finances." } }
 *   },
 * });
 */
export function useStartNewAIChatSessionMutation(baseOptions?: Apollo.MutationHookOptions<StartNewAIChatSessionMutation, StartNewAIChatSessionMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<StartNewAIChatSessionMutation, StartNewAIChatSessionMutationVariables>(StartNewAiChatSessionDocument, options);
}
export type StartNewAIChatSessionMutationHookResult = ReturnType<typeof useStartNewAIChatSessionMutation>;
export type StartNewAIChatSessionMutationResult = Apollo.MutationResult<StartNewAIChatSessionMutation>;
export type StartNewAIChatSessionMutationOptions = Apollo.BaseMutationOptions<StartNewAIChatSessionMutation, AIBankingMutationInput>;

/**
 * Mutation to initiate a fund transfer between accounts.
 */
export const InitiateTransferDocument = gql`
    mutation InitiateTransfer($input: AIBankingMutationInput!) {
      aiBanking(input: $input) {
        initiateTransfer {
          ...Transaction
        }
      }
    }
    ${TransactionFragmentDoc}
`;
export type InitiateTransferMutationVariables = Exact<{
  input: AIBankingMutationInput;
}>;
export type InitiateTransferMutation = { __typename?: 'GeminiMutation', aiBanking?: { __typename?: 'AIBankingMutationResponse', initiateTransfer?: { __typename?: 'Transaction', id: string, amount: number, currency: GeminiCurrencyEnum, description: string, transactionDate: any, transactionType: string, status: string, fromAccount?: ({ __typename?: 'BankAccount', id: string, accountNumber: string }) | null, toAccount?: ({ __typename?: 'BankAccount', id: string, accountNumber: string }) | null }> | null } | null };

/**
 * __useInitiateTransferMutation__
 *
 * To run a mutation, you first call `useInitiateTransferMutation` within a React component and pass it any options that fit your needs.
 *
 * @param baseOptions options that will be passed into the mutation.
 *
 * @example
 * const [initiateTransferMutation, { data, loading, error }] = useInitiateTransferMutation({
 *   variables: {
 *      input: { transferInput: { fromAccountId: "acc1", toAccountId: "acc2", amount: 100.00, currency: GeminiCurrencyEnum.Usd } }
 *   },
 * });
 */
export function useInitiateTransferMutation(baseOptions?: Apollo.MutationHookOptions<InitiateTransferMutation, InitiateTransferMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<InitiateTransferMutation, InitiateTransferMutationVariables>(InitiateTransferDocument, options);
}
export type InitiateTransferMutationHookResult = ReturnType<typeof useInitiateTransferMutation>;
export type InitiateTransferMutationResult = Apollo.MutationResult<InitiateTransferMutation>;
export type InitiateTransferMutationOptions = Apollo.BaseMutationOptions<InitiateTransferMutation, AIBankingMutationInput>;

/**
 * Mutation to apply for a loan on behalf of a customer.
 */
export const ApplyForLoanDocument = gql`
    mutation ApplyForLoan($input: AIBankingMutationInput!) {
      aiBanking(input: $input) {
        applyForLoan {
          ...LoanApplication
        }
      }
    }
    ${LoanApplicationFragmentDoc}
`;
export type ApplyForLoanMutationVariables = Exact<{
  input: AIBankingMutationInput;
}>;
export type ApplyForLoanMutation = { __typename?: 'GeminiMutation', aiBanking?: { __typename?: 'AIBankingMutationResponse', applyForLoan?: { __typename?: 'LoanApplication', id: string, customerId: string, amount: number, currency: GeminiCurrencyEnum, loanType: string, status: string, applicationDate: any, terms?: string | null }> | null } | null };

/**
 * __useApplyForLoanMutation__
 *
 * To run a mutation, you first call `useApplyForLoanMutation` within a React component and pass it any options that fit your needs.
 *
 * @param baseOptions options that will be passed into the mutation.
 *
 * @example
 * const [applyForLoanMutation, { data, loading, error }] = useApplyForLoanMutation({
 *   variables: {
 *      input: { loanApplicationInput: { customerId: "cust123", amount: 5000.00, currency: GeminiCurrencyEnum.Usd, loanType: "PERSONAL" } }
 *   },
 * });
 */
export function useApplyForLoanMutation(baseOptions?: Apollo.MutationHookOptions<ApplyForLoanMutation, ApplyForLoanMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<ApplyForLoanMutation, ApplyForLoanMutationVariables>(ApplyForLoanDocument, options);
}
export type ApplyForLoanMutationHookResult = ReturnType<typeof useApplyForLoanMutation>;
export type ApplyForLoanMutationResult = Apollo.MutationResult<ApplyForLoanMutation>;
export type ApplyForLoanMutationOptions = Apollo.BaseMutationOptions<ApplyForLoanMutation, AIBankingMutationInput>;

/**
 * Mutation to update customer contact information.
 */
export const UpdateCustomerContactDocument = gql`
    mutation UpdateCustomerContact($input: AIBankingMutationInput!) {
      aiBanking(input: $input) {
        updateCustomerContact {
          ...CustomerProfile
        }
      }
    }
    ${CustomerProfileFragmentDoc}
`;
export type UpdateCustomerContactMutationVariables = Exact<{
  input: AIBankingMutationInput;
}>;
export type UpdateCustomerContactMutation = { __typename?: 'GeminiMutation', aiBanking?: { __typename?: 'AIBankingMutationResponse', updateCustomerContact?: { __typename?: 'CustomerProfile', id: string, firstName: string, lastName: string, email: string, dateOfBirth?: any | null, phoneNumber?: string | null, addressLine1?: string | null, addressLine2?: string | null, city?: string | null, state?: string | null, postalCode?: string | null, country?: string | null, aiConfidenceScore?: number | null, fraudAlertsEnabled?: boolean | null, highValueTransactionThreshold?: number | null }> | null } | null };

/**
 * __useUpdateCustomerContactMutation__
 *
 * To run a mutation, you first call `useUpdateCustomerContactMutation` within a React component and pass it any options that fit your needs.
 *
 * @param baseOptions options that will be passed into the mutation.
 *
 * @example
 * const [updateCustomerContactMutation, { data, loading, error }] = useUpdateCustomerContactMutation({
 *   variables: {
 *      input: { customerContactInput: { customerId: "cust123", email: "new@example.com", phoneNumber: "+15551234567" } }
 *   },
 * });
 */
export function useUpdateCustomerContactMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCustomerContactMutation, UpdateCustomerContactMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateCustomerContactMutation, UpdateCustomerContactMutationVariables>(UpdateCustomerContactDocument, options);
}
export type UpdateCustomerContactMutationHookResult = ReturnType<typeof useUpdateCustomerContactMutation>;
export type UpdateCustomerContactMutationResult = Apollo.MutationResult<UpdateCustomerContactMutation>;
export type UpdateCustomerContactMutationOptions = Apollo.BaseMutationOptions<UpdateCustomerContactMutation, AIBankingMutationInput>;

/**
 * Mutation to optimize customer spending based on AI analysis.
 */
export const OptimizeSpendingDocument = gql`
    mutation OptimizeSpending($input: AIBankingMutationInput!) {
      aiBanking(input: $input) {
        optimizeSpending {
          ...SpendingOptimizationReport
        }
      }
    }
    ${SpendingOptimizationReportFragmentDoc}
`;
export type OptimizeSpendingMutationVariables = Exact<{
  input: AIBankingMutationInput;
}>;
export type OptimizeSpendingMutation = { __typename?: 'GeminiMutation', aiBanking?: { __typename?: 'AIBankingMutationResponse', optimizeSpending?: { __typename?: 'SpendingOptimizationReport', id: string, customerId: string, actualReductionAmount: number, generatedDate: any, category?: string | null, recommendations?: Array<{ __typename?: 'Recommendation', id: string, customerId: string, type: string, title: string, description: string, generatedDate: any, metrics?: any | null, actions?: Array<{ __typename?: 'BankingAction', id: string, label: string, description?: string | null, actionType: string, parameters?: any | null }> | null }> | null }> | null } | null };

/**
 * __useOptimizeSpendingMutation__
 *
 * To run a mutation, you first call `useOptimizeSpendingMutation` within a React component and pass it any options that fit your needs.
 *
 * @param baseOptions options that will be passed into the mutation.
 *
 * @example
 * const [optimizeSpendingMutation, { data, loading, error }] = useOptimizeSpendingMutation({
 *   variables: {
 *      input: { spendingOptimizationInput: { customerId: "cust123", category: "GROCERIES", targetReductionAmount: 50.00 } }
 *   },
 * });
 */
export function useOptimizeSpendingMutation(baseOptions?: Apollo.MutationHookOptions<OptimizeSpendingMutation, OptimizeSpendingMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<OptimizeSpendingMutation, OptimizeSpendingMutationVariables>(OptimizeSpendingDocument, options);
}
export type OptimizeSpendingMutationHookResult = ReturnType<typeof useOptimizeSpendingMutation>;
export type OptimizeSpendingMutationResult = Apollo.MutationResult<OptimizeSpendingMutation>;
export type OptimizeSpendingMutationOptions = Apollo.BaseMutationOptions<OptimizeSpendingMutation, AIBankingMutationInput>;

/**
 * Mutation to set fraud alert preferences for a customer.
 */
export const SetFraudAlertPreferenceDocument = gql`
    mutation SetFraudAlertPreference($input: AIBankingMutationInput!) {
      aiBanking(input: $input) {
        setFraudAlertPreference {
          ...CustomerProfile
        }
      }
    }
    ${CustomerProfileFragmentDoc}
`;
export type SetFraudAlertPreferenceMutationVariables = Exact<{
  input: AIBankingMutationInput;
}>;
export type SetFraudAlertPreferenceMutation = { __typename?: 'GeminiMutation', aiBanking?: { __typename?: 'AIBankingMutationResponse', setFraudAlertPreference?: { __typename?: 'CustomerProfile', id: string, firstName: string, lastName: string, email: string, dateOfBirth?: any | null, phoneNumber?: string | null, addressLine1?: string | null, addressLine2?: string | null, city?: string | null, state?: string | null, postalCode?: string | null, country?: string | null, aiConfidenceScore?: number | null, fraudAlertsEnabled?: boolean | null, highValueTransactionThreshold?: number | null }> | null } | null };

/**
 * __useSetFraudAlertPreferenceMutation__
 *
 * To run a mutation, you first call `useSetFraudAlertPreferenceMutation` within a React component and pass it any options that fit your needs.
 *
 * @param baseOptions options that will be passed into the mutation.
 *
 * @example
 * const [setFraudAlertPreferenceMutation, { data, loading, error }] = useSetFraudAlertPreferenceMutation({
 *   variables: {
 *      input: { fraudAlertPreferenceInput: { customerId: "cust123", enableFraudAlerts: true, newHighValueTransactionThreshold: 10000.00 } }
 *   },
 * });
 */
export function useSetFraudAlertPreferenceMutation(baseOptions?: Apollo.MutationHookOptions<SetFraudAlertPreferenceMutation, SetFraudAlertPreferenceMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SetFraudAlertPreferenceMutation, SetFraudAlertPreferenceMutationVariables>(SetFraudAlertPreferenceDocument, options);
}
export type SetFraudAlertPreferenceMutationHookResult = ReturnType<typeof useSetFraudAlertPreferenceMutation>;
export type SetFraudAlertPreferenceMutationResult = Apollo.MutationResult<SetFraudAlertPreferenceMutation>;
export type SetFraudAlertPreferenceMutationOptions = Apollo.BaseMutationOptions<SetFraudAlertPreferenceMutation, AIBankingMutationInput>;

/**
 * Mutation to execute an AI-recommended investment action.
 */
export const ExecuteInvestmentRecommendationDocument = gql`
  mutation ExecuteInvestmentRecommendation($input: AIBankingMutationInput!) {
    aiBanking(input: $input) {
      executeInvestmentRecommendation {
        ...GeminiAIInvestmentActionResponse
      }
    }
  }
  ${GeminiAIInvestmentActionResponseFragmentDoc}
`;
export type ExecuteInvestmentRecommendationMutationVariables = Exact<{
  input: AIBankingMutationInput;
}>;
export type ExecuteInvestmentRecommendationMutation = { __typename?: 'GeminiMutation', aiBanking?: { __typename?: 'AIBankingMutationResponse', executeInvestmentRecommendation?: { __typename?: 'GeminiAIInvestmentActionResponse', actionId: string, status: string, message: string, timestamp: any, investmentOpportunity?: { __typename?: 'GeminiAIInvestmentOpportunity', id: string, name: string } | null } | null } | null };

/**
 * __useExecuteInvestmentRecommendationMutation__
 *
 * @param baseOptions options that will be passed into the mutation.
 */
export function useExecuteInvestmentRecommendationMutation(baseOptions?: Apollo.MutationHookOptions<ExecuteInvestmentRecommendationMutation, ExecuteInvestmentRecommendationMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<ExecuteInvestmentRecommendationMutation, ExecuteInvestmentRecommendationMutationVariables>(ExecuteInvestmentRecommendationDocument, options);
}
export type ExecuteInvestmentRecommendationMutationHookResult = ReturnType<typeof useExecuteInvestmentRecommendationMutation>;
export type ExecuteInvestmentRecommendationMutationResult = Apollo.MutationResult<ExecuteInvestmentRecommendationMutation>;
export type ExecuteInvestmentRecommendationMutationOptions = Apollo.BaseMutationOptions<ExecuteInvestmentRecommendationMutation, AIBankingMutationInput>;

/**
 * Mutation to adjust customer budget.
 */
export const AdjustCustomerBudgetDocument = gql`
  mutation AdjustCustomerBudget($input: AIBankingMutationInput!) {
    aiBanking(input: $input) {
      adjustCustomerBudget {
        ...GeminiAIBudgetAdjustmentResult
      }
    }
  }
  ${GeminiAIBudgetAdjustmentResultFragmentDoc}
`;
export type AdjustCustomerBudgetMutationVariables = Exact<{
  input: AIBankingMutationInput;
}>;
export type AdjustCustomerBudgetMutation = { __typename?: 'GeminiMutation', aiBanking?: { __typename?: 'AIBankingMutationResponse', adjustCustomerBudget?: { __typename?: 'GeminiAIBudgetAdjustmentResult', id: string, customerId: string, category: string, newBudgetAmount: any, period: string, status: string, message?: string | null, adjustmentDate: any }> | null } | null };

/**
 * __useAdjustCustomerBudgetMutation__
 *
 * @param baseOptions options that will be passed into the mutation.
 */
export function useAdjustCustomerBudgetMutation(baseOptions?: Apollo.MutationHookOptions<AdjustCustomerBudgetMutation, AdjustCustomerBudgetMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<AdjustCustomerBudgetMutation, AdjustCustomerBudgetMutationVariables>(AdjustCustomerBudgetDocument, options);
}
export type AdjustCustomerBudgetMutationHookResult = ReturnType<typeof useAdjustCustomerBudgetMutation>;
export type AdjustCustomerBudgetMutationResult = Apollo.MutationResult<AdjustCustomerBudgetMutation>;
export type AdjustCustomerBudgetMutationOptions = Apollo.BaseMutationOptions<AdjustCustomerBudgetMutation, AIBankingMutationInput>;

/**
 * Mutation to flag suspicious activity.
 */
export const FlagSuspiciousActivityDocument = gql`
  mutation FlagSuspiciousActivity($input: AIBankingMutationInput!) {
    aiBanking(input: $input) {
      flagSuspiciousActivity {
        ...GeminiAISuspiciousActivityReport
      }
    }
  }
  ${GeminiAISuspiciousActivityReportFragmentDoc}
`;
export type FlagSuspiciousActivityMutationVariables = Exact<{
  input: AIBankingMutationInput;
}>;
export type FlagSuspiciousActivityMutation = { __typename?: 'GeminiMutation', aiBanking?: { __typename?: 'AIBankingMutationResponse', flagSuspiciousActivity?: { __typename?: 'GeminiAISuspiciousActivityReport', id: string, entityId: string, entityType: string, reason: string, severity: string, flaggedDate: any, status: string, contextData?: any | null }> | null } | null };

/**
 * __useFlagSuspiciousActivityMutation__
 *
 * @param baseOptions options that will be passed into the mutation.
 */
export function useFlagSuspiciousActivityMutation(baseOptions?: Apollo.MutationHookOptions<FlagSuspiciousActivityMutation, FlagSuspiciousActivityMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<FlagSuspiciousActivityMutation, FlagSuspiciousActivityMutationVariables>(FlagSuspiciousActivityDocument, options);
}
export type FlagSuspiciousActivityMutationHookResult = ReturnType<typeof useFlagSuspiciousActivityMutation>;
export type FlagSuspiciousActivityMutationResult = Apollo.MutationResult<FlagSuspiciousActivityMutation>;
export type FlagSuspiciousActivityMutationOptions = Apollo.BaseMutationOptions<FlagSuspiciousActivityMutation, AIBankingMutationInput>;

/**
 * Mutation to personalize marketing offer.
 */
export const PersonalizeMarketingOfferDocument = gql`
  mutation PersonalizeMarketingOffer($input: AIBankingMutationInput!) {
    aiBanking(input: $input) {
      personalizeMarketingOffer {
        ...GeminiAIMarketingOffer
      }
    }
  }
  ${GeminiAIMarketingOfferFragmentDoc}
`;
export type PersonalizeMarketingOfferMutationVariables = Exact<{
  input: AIBankingMutationInput;
}>;
export type PersonalizeMarketingOfferMutation = { __typename?: 'GeminiMutation', aiBanking?: { __typename?: 'AIBankingMutationResponse', personalizeMarketingOffer?: { __typename?: 'GeminiAIMarketingOffer', id: string, customerId: string, title: string, description: string, offerType: string, expiryDate?: any | null, aiRationale?: string | null, parameters?: any | null, generatedDate: any }> | null } | null };

/**
 * __usePersonalizeMarketingOfferMutation__
 *
 * @param baseOptions options that will be passed into the mutation.
 */
export function usePersonalizeMarketingOfferMutation(baseOptions?: Apollo.MutationHookOptions<PersonalizeMarketingOfferMutation, PersonalizeMarketingOfferMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<PersonalizeMarketingOfferMutation, PersonalizeMarketingOfferMutationVariables>(PersonalizeMarketingOfferDocument, options);
}
export type PersonalizeMarketingOfferMutationHookResult = ReturnType<typeof usePersonalizeMarketingOfferMutation>;
export type PersonalizeMarketingOfferMutationResult = Apollo.MutationResult<PersonalizeMarketingOfferMutation>;
export type PersonalizeMarketingOfferMutationOptions = Apollo.BaseMutationOptions<PersonalizeMarketingOfferMutation, AIBankingMutationInput>;

/**
 * Mutation to automate bill payment.
 */
export const AutomateBillPaymentDocument = gql`
  mutation AutomateBillPayment($input: AIBankingMutationInput!) {
    aiBanking(input: $input) {
      automateBillPayment {
        ...GeminiAIAutomatedBillPayment
      }
    }
  }
  ${GeminiAIAutomatedBillPaymentFragmentDoc}
`;
export type AutomateBillPaymentMutationVariables = Exact<{
  input: AIBankingMutationInput;
}>;
export type AutomateBillPaymentMutation = { __typename?: 'GeminiMutation', aiBanking?: { __typename?: 'AIBankingMutationResponse', automateBillPayment?: { __typename?: 'GeminiAIAutomatedBillPayment', id: string, customerId: string, billerName: string, fromAccountId: string, nextPaymentDate: any, predictedAmount: any, frequency: string, status: string, setupDate: any, aiRationale?: string | null }> | null } | null };

/**
 * __useAutomateBillPaymentMutation__
 *
 * @param baseOptions options that will be passed into the mutation.
 */
export function useAutomateBillPaymentMutation(baseOptions?: Apollo.MutationHookOptions<AutomateBillPaymentMutation, AutomateBillPaymentMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<AutomateBillPaymentMutation, AutomateBillPaymentMutationVariables>(AutomateBillPaymentDocument, options);
}
export type AutomateBillPaymentMutationHookResult = ReturnType<typeof useAutomateBillPaymentMutation>;
export type AutomateBillPaymentMutationResult = Apollo.MutationResult<AutomateBillPaymentMutation>;
export type AutomateBillPaymentMutationOptions = Apollo.BaseMutationOptions<AutomateBillPaymentMutation, AIBankingMutationInput>;

/**
 * Mutation to initiate an AI-driven compliance audit.
 */
export const InitiateAiComplianceAuditDocument = gql`
  mutation InitiateAIComplianceAudit($input: AIBankingMutationInput!) {
    aiBanking(input: $input) {
      initiateAIComplianceAudit {
        ...GeminiAIComplianceAudit
      }
    }
  }
  ${GeminiAIComplianceAuditFragmentDoc}
`;
export type InitiateAIComplianceAuditMutationVariables = Exact<{
  input: AIBankingMutationInput;
}>;
export type InitiateAIComplianceAuditMutation = { __typename?: 'GeminiMutation', aiBanking?: { __typename?: 'AIBankingMutationResponse', initiateAIComplianceAudit?: { __typename?: 'GeminiAIComplianceAudit', id: string, auditScope: string, overallStatus: string, gapsIdentified?: Array<string> | null, auditDate: any, confidenceScore: number, findingsDetails?: any | null, recommendedActions?: Array<{ __typename?: 'BankingAction', id: string, label: string }> | null }> | null } | null };

/**
 * __useInitiateAIComplianceAuditMutation__
 *
 * @param baseOptions options that will be passed into the mutation.
 */
export function useInitiateAIComplianceAuditMutation(baseOptions?: Apollo.MutationHookOptions<InitiateAIComplianceAuditMutation, InitiateAIComplianceAuditMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<InitiateAIComplianceAuditMutation, InitiateAIComplianceAuditMutationVariables>(InitiateAiComplianceAuditDocument, options);
}
export type InitiateAIComplianceAuditMutationHookResult = ReturnType<typeof useInitiateAIComplianceAuditMutation>;
export type InitiateAIComplianceAuditMutationResult = Apollo.MutationResult<InitiateAIComplianceAuditMutation>;
export type InitiateAIComplianceAuditMutationOptions = Apollo.BaseMutationOptions<InitiateAIComplianceAuditMutation, AIBankingMutationInput>;

/**
 * Mutation to update customer financial goal.
 */
export const UpdateFinancialGoalDocument = gql`
  mutation UpdateFinancialGoal($input: AIBankingMutationInput!) {
    aiBanking(input: $input) {
      updateFinancialGoal {
        ...GeminiAIPersonalizedFinancialGoal
      }
    }
  }
  ${GeminiAIPersonalizedFinancialGoalFragmentDoc}
`;
export type UpdateFinancialGoalMutationVariables = Exact<{
  input: AIBankingMutationInput;
}>;
export type UpdateFinancialGoalMutation = { __typename?: 'GeminiMutation', aiBanking?: { __typename?: 'AIBankingMutationResponse', updateFinancialGoal?: { __typename?: 'GeminiAIPersonalizedFinancialGoal', id: string, customerId: string, goalName: string, description?: string | null, targetAmount: any, currentAmount: any, targetDate?: any | null, status: string, lastUpdated: any, aiRecommendations?: Array<{ __typename?: 'Recommendation', id: string, customerId: string, type: string, title: string, description: string, generatedDate: any, metrics?: any | null, actions?: Array<{ __typename?: 'BankingAction', id: string, label: string, description?: string | null, actionType: string, parameters?: any | null }> | null }> | null }> | null } | null };

/**
 * __useUpdateFinancialGoalMutation__
 *
 * @param baseOptions options that will be passed into the mutation.
 */
export function useUpdateFinancialGoalMutation(baseOptions?: Apollo.MutationHookOptions<UpdateFinancialGoalMutation, UpdateFinancialGoalMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateFinancialGoalMutation, UpdateFinancialGoalMutationVariables>(UpdateFinancialGoalDocument, options);
}
export type UpdateFinancialGoalMutationHookResult = ReturnType<typeof useUpdateFinancialGoalMutation>;
export type UpdateFinancialGoalMutationResult = Apollo.MutationResult<UpdateFinancialGoalMutation>;
export type UpdateFinancialGoalMutationOptions = Apollo.BaseMutationOptions<UpdateFinancialGoalMutation, AIBankingMutationInput>;

/**
 * Mutation to set up real-time fraud alert.
 */
export const SetupRealtimeFraudAlertDocument = gql`
  mutation SetupRealtimeFraudAlert($input: AIBankingMutationInput!) {
    aiBanking(input: $input) {
      setupRealtimeFraudAlert {
        ...CustomerProfile
      }
    }
  }
  ${CustomerProfileFragmentDoc}
`;
export type SetupRealtimeFraudAlertMutationVariables = Exact<{
  input: AIBankingMutationInput;
}>;
export type SetupRealtimeFraudAlertMutation = { __typename?: 'GeminiMutation', aiBanking?: { __typename?: 'AIBankingMutationResponse', setupRealtimeFraudAlert?: { __typename?: 'CustomerProfile', id: string, firstName: string, lastName: string, email: string, dateOfBirth?: any | null, phoneNumber?: string | null, addressLine1?: string | null, addressLine2?: string | null, city?: string | null, state?: string | null, postalCode?: string | null, country?: string | null, aiConfidenceScore?: number | null, fraudAlertsEnabled?: boolean | null, highValueTransactionThreshold?: number | null }> | null } | null };

/**
 * __useSetupRealtimeFraudAlertMutation__
 *
 * @param baseOptions options that will be passed into the mutation.
 */
export function useSetupRealtimeFraudAlertMutation(baseOptions?: Apollo.MutationHookOptions<SetupRealtimeFraudAlertMutation, SetupRealtimeFraudAlertMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SetupRealtimeFraudAlertMutation, SetupRealtimeFraudAlertMutationVariables>(SetupRealtimeFraudAlertDocument, options);
}
export type SetupRealtimeFraudAlertMutationHookResult = ReturnType<typeof useSetupRealtimeFraudAlertMutation>;
export type SetupRealtimeFraudAlertMutationResult = Apollo.MutationResult<SetupRealtimeFraudAlertMutation>;
export type SetupRealtimeFraudAlertMutationOptions = Apollo.BaseMutationOptions<SetupRealtimeFraudAlertMutation, AIBankingMutationInput>;

/**
 * Mutation to create product recommendation.
 */
export const CreateProductRecommendationDocument = gql`
  mutation CreateProductRecommendation($input: AIBankingMutationInput!) {
    aiBanking(input: $input) {
      createProductRecommendation {
        ...GeminiAIFinancialProductRecommendation
      }
    }
  }
  ${GeminiAIFinancialProductRecommendationFragmentDoc}
`;
export type CreateProductRecommendationMutationVariables = Exact<{
  input: AIBankingMutationInput;
}>;
export type CreateProductRecommendationMutation = { __typename?: 'GeminiMutation', aiBanking?: { __typename?: 'AIBankingMutationResponse', createProductRecommendation?: { __typename?: 'GeminiAIFinancialProductRecommendation', id: string, customerId: string, productName: string, productType: string, description: string, aiRationale?: string | null, keyFeatures?: Array<string> | null, metrics?: any | null, generatedDate: any, applicationLink?: string | null }> | null } | null };

/**
 * __useCreateProductRecommendationMutation__
 *
 * @param baseOptions options that will be passed into the mutation.
 */
export function useCreateProductRecommendationMutation(baseOptions?: Apollo.MutationHookOptions<CreateProductRecommendationMutation, CreateProductRecommendationMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateProductRecommendationMutation, CreateProductRecommendationMutationVariables>(CreateProductRecommendationDocument, options);
}
export type CreateProductRecommendationMutationHookResult = ReturnType<typeof useCreateProductRecommendationMutation>;
export type CreateProductRecommendationMutationResult = Apollo.MutationResult<CreateProductRecommendationMutation>;
export type CreateProductRecommendationMutationOptions = Apollo.BaseMutationOptions<CreateProductRecommendationMutation, AIBankingMutationInput>;

/**
 * Mutation to record voice bot interaction.
 */
export const RecordVoiceBotInteractionDocument = gql`
  mutation RecordVoiceBotInteraction($input: AIBankingMutationInput!) {
    aiBanking(input: $input) {
      recordVoiceBotInteraction {
        ...GeminiAIVoiceBotInteraction
      }
    }
  }
  ${GeminiAIVoiceBotInteractionFragmentDoc}
`;
export type RecordVoiceBotInteractionMutationVariables = Exact<{
  input: AIBankingMutationInput;
}>;
export type RecordVoiceBotInteractionMutation = { __typename?: 'GeminiMutation', aiBanking?: { __typename?: 'AIBankingMutationResponse', recordVoiceBotInteraction?: { __typename?: 'GeminiAIVoiceBotInteraction', id: string, customerId: string, interactionTimestamp: any, userTranscript: string, aiTranscript: string, detectedIntent: string, sentiment: string, status: string, audioLink?: string | null, confidenceScore: number }> | null } | null };

/**
 * __useRecordVoiceBotInteractionMutation__
 *
 * @param baseOptions options that will be passed into the mutation.
 */
export function useRecordVoiceBotInteractionMutation(baseOptions?: Apollo.MutationHookOptions<RecordVoiceBotInteractionMutation, RecordVoiceBotInteractionMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<RecordVoiceBotInteractionMutation, RecordVoiceBotInteractionMutationVariables>(RecordVoiceBotInteractionDocument, options);
}
export type RecordVoiceBotInteractionMutationHookResult = ReturnType<typeof useRecordVoiceBotInteractionMutation>;
export type RecordVoiceBotInteractionMutationResult = Apollo.MutationResult<RecordVoiceBotInteractionMutation>;
export type RecordVoiceBotInteractionMutationOptions = Apollo.BaseMutationOptions<RecordVoiceBotInteractionMutation, AIBankingMutationInput>;

/**
 * Mutation to execute a smart contract.
 */
export const ExecuteSmartContractDocument = gql`
  mutation ExecuteSmartContract($input: AIBankingMutationInput!) {
    aiBanking(input: $input) {
      executeSmartContract {
        ...GeminiAISmartContractExecution
      }
    }
  }
  ${GeminiAISmartContractExecutionFragmentDoc}
`;
export type ExecuteSmartContractMutationVariables = Exact<{
  input: AIBankingMutationInput;
}>;
export type ExecuteSmartContractMutation = { __typename?: 'GeminiMutation', aiBanking?: { __typename?: 'AIBankingMutationResponse', executeSmartContract?: { __typename?: 'GeminiAISmartContractExecution', id: string, contractId: string, functionName: string, inputParameters: any, outputResult?: any | null, status: string, executionTimestamp: any, transactionHash?: string | null, aiVerificationStatus: string }> | null } | null };

/**
 * __useExecuteSmartContractMutation__
 *
 * @param baseOptions options that will be passed into the mutation.
 */
export function useExecuteSmartContractMutation(baseOptions?: Apollo.MutationHookOptions<ExecuteSmartContractMutation, ExecuteSmartContractMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<ExecuteSmartContractMutation, ExecuteSmartContractMutationVariables>(ExecuteSmartContractDocument, options);
}
export type ExecuteSmartContractMutationHookResult = ReturnType<typeof useExecuteSmartContractMutation>;
export type ExecuteSmartContractMutationResult = Apollo.MutationResult<ExecuteSmartContractMutation>;
export type ExecuteSmartContractMutationOptions = Apollo.BaseMutationOptions<ExecuteSmartContractMutation, AIBankingMutationInput>;
