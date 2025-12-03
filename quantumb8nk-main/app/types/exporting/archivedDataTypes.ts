// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

/**
 * Represents the status of a financial transaction or record throughout its lifecycle.
 */
export type FinancialRecordStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELED"
  | "REFUNDED"
  | "DISPUTED"
  | "ARCHIVED"
  | "SETTLED"
  | "VOIDED"
  | "DRAFT"
  | "APPROVED"
  | "RETURNED"
  | "PARTIALLY_REFUNDED"
  | "PENDING_APPROVAL"
  | "REJECTED";

/**
 * Represents the fundamental type of a financial transaction.
 */
export type TransactionType =
  | "PAYMENT"
  | "REFUND"
  | "PAYOUT"
  | "TRANSFER"
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "FEE"
  | "ADJUSTMENT"
  | "BALANCE_CORRECTION"
  | "INTEREST"
  | "DIVIDEND"
  | "BUY"
  | "SELL"
  | "LENDING"
  | "BORROWING"
  | "SUBSCRIPTION_PAYMENT"
  | "INVOICE_PAYMENT"
  | "CREDIT"
  | "DEBIT"
  | "REVERSAL"
  | "EXCHANGE"
  | "TAX"
  | "DONATION"
  | "LOAN_REPAYMENT";

/**
 * Standardized three-letter ISO 4217 currency codes.
 */
export type Currency =
  | "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "SEK" | "NZD" | "MXN" | "SGD" | "HKD" | "NOK" | "KRW" | "TRY" | "RUB" | "INR" | "BRL" | "ZAR"
  | "DKK" | "PLN" | "HUF" | "CZK" | "ILS" | "PHP" | "THB" | "IDR" | "MYR" | "VND" | "PKR" | "EGP" | "SAR" | "AED" | "QAR" | "KWD" | "BHD" | "OMR" | "XOF" | "XAF"
  | "CLP" | "COP" | "ARS" | "PEN" | "GHS" | "NGN" | "KES" | "UGX" | "TZS" | "EGP" | "VND" | "BDT";

/**
 * Defines the possible platforms from which financial data can originate,
 * including integrated third-party services and internal systems.
 */
export type FinancialDataSourcePlatform = "ModernTreasury" | "Stripe" | "Plaid" | "CitibankDB";

/**
 * Base interface for all archival-eligible records.
 * Provides common properties necessary for tracing, management, and compliance of archived financial data.
 */
interface BaseArchivedRecord {
  /** A globally unique identifier for this specific archived record within the Citibank Demo Business system. */
  id: string;
  /** The original unique identifier from the source platform where the record was created. */
  sourceId: string;
  /** The date and time when the record was initially created in its source system (ISO 8601 string). */
  createdAt: string;
  /** The date and time when the record was last updated or modified in its source system (ISO 8601 string). */
  updatedAt: string;
  /** Indicates if the record originated from a live production environment (`true`) or a test/sandbox environment (`false`). */
  liveMode: boolean;
  /** Custom key-value pairs for additional context or metadata provided by the source system. */
  metadata?: Record<string, string>;
  /** The source platform from which this data was ingested and archived. */
  sourcePlatform: FinancialDataSourcePlatform;
  /** The timestamp when this record was formally archived into the Citibank Demo Business system (ISO 8601 string). */
  archivedAt: string;
  /** An internal version number for the archived record's schema, useful for data migration and compatibility. */
  schemaVersion: string;
  /** Optional hash of the record's content to ensure data integrity during archiving. */
  contentHash?: string;
  /** The ID of the user or process that initiated the archiving of this record. */
  archiverId?: string;
}

// --- Modern Treasury Specific Types ---

/**
 * Represents a Modern Treasury Transaction record.
 * Details financial movements associated with internal accounts, including credits and debits.
 */
export interface MTTransaction extends BaseArchivedRecord {
  type: "MTTransaction";
  /** The amount of the transaction in the smallest currency unit (e.g., cents for USD, yen for JPY). */
  amount: number;
  /** The currency of the transaction. */
  currency: Currency;
  /** A human-readable description of the transaction's purpose or nature. */
  description: string;
  /** The effective date of the transaction as recorded by the bank or institution (YYYY-MM-DD). */
  effectiveDate: string;
  /** The current status of the Modern Treasury transaction. */
  status: FinancialRecordStatus;
  /** The ID of the Modern Treasury internal account involved in this transaction. */
  internalAccountId: string;
  /** Optional ID of the counterparty (external entity) involved in the transaction. */
  counterpartyId?: string;
  /** The direction of the transaction relative to the `internalAccountId` ('credit' for funds coming in, 'debit' for funds going out). */
  direction: "credit" | "debit";
  /** The unique reference number provided by the financial institution for this transaction, if available. */
  bankTransactionId?: string;
  /** The ID of the related payment order that initiated this transaction, if applicable. */
  paymentOrderId?: string;
  /** Additional details from the bank statement or reconciliation process. */
  vendorDetails?: string;
  /** The ID of the expected payment that this transaction fulfills, if it's an inbound payment. */
  expectedPaymentId?: string;
  /** Unique ID or reference for the remittance information associated with the transaction. */
  remittanceInformation?: string;
  /** The ID of the external bank account associated with the transaction, if an external account was involved. */
  externalBankAccountId?: string;
  /** The category of the transaction assigned by Modern Treasury or through reconciliation rules. */
  category?: string;
  /** Details on the reconciliation process for this transaction, indicating if it's matched to an expected entry. */
  reconciliationDetails?: {
    status: "matched" | "unmatched" | "partially_matched" | "pending";
    matchedRecordIds?: string[];
    reconciledBy?: string; // ID of user/system that performed reconciliation
  };
  /** The type of transaction as classified by Modern Treasury (e.g., 'ACH', 'Wire'). */
  transactionType?: string;
  /** Balance after this transaction. */
  runningBalance?: number;
}

/**
 * Represents a Modern Treasury Payment Order record.
 * Details instructions to move money between accounts, either internally or externally.
 */
export interface MTPaymentOrder extends BaseArchivedRecord {
  type: "MTPaymentOrder";
  /** The amount of the payment order in the smallest currency unit. */
  amount: number;
  /** The currency of the payment order. */
  currency: Currency;
  /** An optional description providing context for the payment order. */
  description?: string;
  /** The current status of the Modern Treasury payment order. */
  status: "pending" | "processing" | "sent" | "completed" | "returned" | "void" | "archived" | "cancelled" | "declined" | "partially_returned";
  /** The method or type of payment instruction (e.g., ACH, Wire, SEPA, Book). */
  paymentType: "ach" | "wire" | "sepa" | "book" | "rtp" | "swift" | "check" | "card" | "echeck" | "eft";
  /** The ID of the originating internal account from which funds will be debited. */
  originatingAccountId: string;
  /** The ID of the receiving external account or counterparty account, if applicable. */
  receivingAccountId?: string;
  /** The ID of the counterparty (recipient) involved in the payment. */
  counterpartyId: string;
  /** The desired date for the payment to be made (YYYY-MM-DD), also known as the value date. */
  dueDate?: string;
  /** The actual settlement date of the payment (YYYY-MM-DD). */
  settlementDate?: string;
  /** The ID of the resulting Modern Treasury transaction in the internal account, if the payment was successful. */
  transactionId?: string;
  /** Unique identifier from the payment network for the payment, if applicable. */
  networkPaymentId?: string;
  /** Purpose code for the payment, often required for international payments (e.g., "COMM" for commercial payments). */
  purposeCode?: string;
  /** Additional details specific to the payment method or network. */
  paymentMethodDetails?: Record<string, any>;
  /** The business unit or department within Citibank Demo Business responsible for this payment. */
  businessUnit?: string;
  /** Reference number for the invoice or bill that this payment order intends to settle. */
  invoiceReference?: string;
  /** The type of direction for the payment order. */
  direction: "credit" | "debit";
  /** The ID of the user or system that created the payment order. */
  initiatorId?: string;
}

/**
 * Represents a Modern Treasury Counterparty record.
 * Details external entities (individuals or businesses) with whom financial transactions are conducted.
 */
export interface MTCounterparty extends BaseArchivedRecord {
  type: "MTCounterparty";
  /** The legal name of the counterparty. */
  name: string;
  /** An optional primary email address for the counterparty. */
  email?: string;
  /** An optional legal entity identifier (e.g., LEI) for the counterparty. */
  legalEntityId?: string;
  /** The current status of the counterparty within Modern Treasury. */
  status: "active" | "archived" | "pending" | "inactive" | "suspended";
  /** Relevant business identifier, such as an Employer Identification Number (EIN) or Value Added Tax (VAT) ID. */
  taxpayerIdentifier?: string;
  /** List of associated external account IDs linked to this counterparty. */
  externalAccountIds?: string[];
  /** The name of the primary contact person for the counterparty. */
  primaryContactName?: string;
  /** Address details for the counterparty. */
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string; // ISO 3166-1 alpha-2 country code
  };
  /** The type of counterparty entity ('individual' or 'business'). */
  entityType?: "individual" | "business";
  /** Optional notes or internal comments about the counterparty. */
  notes?: string;
  /** The date of the last verification for KYC/AML purposes (YYYY-MM-DD). */
  lastVerificationDate?: string;
  /** Phone number for the counterparty. */
  phone?: string;
  /** Account type of the counterparty. */
  accountType?: string;
}

// --- Stripe Specific Types ---

/**
 * Represents a Stripe Charge object, detailing a successful or failed attempt to collect payment from a customer.
 */
export interface StripeCharge extends BaseArchivedRecord {
  type: "StripeCharge";
  /** The amount intended to be collected by this payment in the smallest currency unit. */
  amount: number;
  /** The amount in the smallest currency unit that has been refunded (can be less than the total amount due to partial refunds). */
  amountRefunded: number;
  /** Three-letter ISO currency code, in lowercase (e.g., "usd"). */
  currency: Lowercase<Currency>;
  /** Whether the charge was successfully captured. Uncaptured charges can be refunded or captured later. */
  captured: boolean;
  /** Whether the charge has been refunded (partially or fully). */
  refunded: boolean;
  /** The status of the charge. */
  status: "succeeded" | "pending" | "failed";
  /** The ID of the customer this charge is for, if one exists in Stripe. */
  customerId?: string;
  /** The ID of the Payment Method used for this charge. */
  paymentMethodId: string;
  /** Details about the card used for the charge, if applicable. Sensitive data is typically redacted or tokenized. */
  cardDetails?: {
    brand: string; // e.g., "visa", "mastercard", "amex"
    last4: string;
    expMonth: number;
    expYear: number;
    fingerprint?: string; // Unique identifier for the card across different customers/charges
    funding: "credit" | "debit" | "prepaid" | "unknown";
    country: string; // ISO 3166-1 alpha-2 country code of the card issuer
  };
  /** An email address, used to email this charge's receipt to the customer. */
  receiptEmail?: string;
  /** URL to a public-facing receipt for this charge. */
  receiptUrl?: string;
  /** A description of the charge, provided by the merchant. */
  description?: string;
  /** The ID of the invoice that generated this charge, if applicable. */
  invoiceId?: string;
  /** The ID of the Payment Intent associated with this charge. */
  paymentIntentId?: string;
  /** The ID of the transfer that occurred because of this charge to a connected account. */
  transferId?: string;
  /** If the charge was disputed, this is the ID of the dispute object. */
  disputeId?: string;
  /** Fraud details for the charge, including risk scores or user reports. */
  fraudDetails?: {
    userReported?: "safe" | "fraudulent";
    stripeReported?: "safe" | "fraudulent";
    riskScore?: number; // Stripe's fraud risk score
    riskLevel?: "normal" | "elevated" | "highest";
  };
  /** Source of the charge (e.g., 'card', 'bank_account'). */
  sourceType?: string;
  /** Billing details associated with the payment method. */
  billingDetails?: {
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    email?: string;
    name?: string;
    phone?: string;
  };
}

/**
 * Represents a Stripe Refund object, detailing a refund of a previously captured charge.
 */
export interface StripeRefund extends BaseArchivedRecord {
  type: "StripeRefund";
  /** The amount refunded in the smallest currency unit. */
  amount: number;
  /** Three-letter ISO currency code, in lowercase. */
  currency: Lowercase<Currency>;
  /** The ID of the charge that was refunded. */
  chargeId: string;
  /** The reason for the refund. */
  reason?: "duplicate" | "fraudulent" | "requested_by_customer" | "partial_refund" | "expired_uncaptured_charge" | "other";
  /** The status of the refund. */
  status: "pending" | "succeeded" | "failed" | "canceled";
  /** The ID of the balance transaction that describes the impact of this refund on your Stripe account balance. */
  balanceTransactionId?: string;
  /** Whether this refund was issued manually or automatically. */
  manual?: boolean;
  /** Optional notes or internal comments provided when creating the refund. */
  notes?: string;
  /** The ID of the Payment Intent associated with the charge that was refunded. */
  paymentIntentId?: string;
  /** Reason code provided by the processor for a failed refund. */
  failureReason?: string;
}

/**
 * Represents a Stripe Customer object, detailing a customer account within Stripe.
 * Aggregates information about a customer, including payment methods, subscriptions, etc.
 */
export interface StripeCustomer extends BaseArchivedRecord {
  type: "StripeCustomer";
  /** The customer's primary email address. */
  email?: string;
  /** The customer's full name or business name. */
  name?: string;
  /** The customer's primary phone number. */
  phone?: string;
  /** The customer's default shipping address. */
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string; // ISO 3166-1 alpha-2 country code
  };
  /** The customer's billing address. */
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  /** Indicates if the customer is a business. */
  isBusiness?: boolean;
  /** List of tax ID details for the customer, if provided. */
  taxIds?: Array<{
    type: string; // e.g., "eu_vat", "us_ein", "au_abn"
    value: string;
    verification?: { status: string; verifiedBy?: string };
  }>;
  /** The ID of the customer's default payment method. */
  defaultPaymentMethodId?: string;
  /** List of all payment method IDs associated with this customer. */
  paymentMethodIds?: string[];
  /** A general description for the customer record. */
  description?: string;
  /** Preferred locales for the customer, used for localized communication. */
  preferredLocales?: string[];
  /** The ID of the portal session associated with this customer for customer self-service. */
  portalSessionId?: string;
  /** Tax exemption status for the customer. */
  taxExempt?: "none" | "exempt" | "reverse";
}

// --- Plaid Specific Types ---

/**
 * Represents a Plaid Account, detailing a financial account linked through Plaid.
 * Provides a standardized view of various account types (depository, credit, investment).
 */
export interface PlaidAccount extends BaseArchivedRecord {
  type: "PlaidAccount";
  /** The Plaid unique account ID. */
  accountId: string;
  /** The user-friendly name of the account, e.g., "My Checking", "College Savings". */
  name: string;
  /** The official name of the account as given by the financial institution. */
  officialName?: string;
  /** The broad type of the account (e.g., "depository", "credit", "loan", "investment"). */
  typeCategory: "depository" | "credit" | "loan" | "investment" | "brokerage" | "other";
  /** The specific subtype of the account (e.g., "checking", "credit card", "401k", "mortgage"). */
  subtype: "checking" | "savings" | "credit card" | "mortgage" | "student loan" | "investment" | "brokerage" | "ira" | "401k" | "cd" | "money market" | "auto" | "business" | "commercial" | "paypal" | "cash management" | "prepaid" | "heloc" | "hsa" | "other";
  /** The last 2-4 alphanumeric characters of the account number, used for display purposes. */
  mask?: string;
  /** The current balance of the account in its currency. */
  currentBalance: number;
  /** The available balance of the account (may differ from current if there are pending transactions or holds). */
  availableBalance?: number;
  /** The currency of the account. */
  currency: Currency;
  /** The ID of the Plaid Item (an institution login connection) this account belongs to. */
  itemId: string;
  /** The name of the financial institution associated with the account. */
  institutionName?: string;
  /** The ID of the institution. */
  institutionId?: string;
  /** The credit limit for credit accounts, if applicable. */
  creditLimit?: number;
  /** The interest rate for loan accounts, if applicable. */
  interestRate?: number;
  /** Indicates if the account represents a liability (e.g., credit card, loan). */
  isLiability?: boolean;
  /** Date when the balance was last updated (ISO 8601 string). */
  balanceUpdatedAt?: string;
}

/**
 * Represents a Plaid Transaction, detailing a financial movement on a linked account.
 * Provides categorized and normalized transaction data.
 */
export interface PlaidTransaction extends BaseArchivedRecord {
  type: "PlaidTransaction";
  /** The Plaid unique transaction ID. */
  transactionId: string;
  /** The Plaid account ID this transaction belongs to. */
  accountId: string;
  /** The amount of the transaction. Positive value indicates a credit, negative a debit. */
  amount: number;
  /** The ISO currency code of the transaction. */
  currency: Currency;
  /** The date of the transaction (YYYY-MM-DD), as seen by the merchant or as an authorization date. */
  date: string;
  /** The date the transaction posted (YYYY-MM-DD), which may differ from `date`. */
  authorizedDate?: string;
  /** A hierarchical array of the Plaid-categorized `category` for this transaction (e.g., ["Food and Drink", "Restaurants"]). */
  category: string[];
  /** A unique ID for the transaction, often a hash of key transaction details to help identify uniqueness across multiple data fetches. */
  transactionIdHash: string;
  /** The merchant name or a cleaned description of the transaction. */
  name: string;
  /** The original description of the transaction as it appears from the financial institution. */
  originalDescription?: string;
  /** Location data for the transaction, if available. */
  location?: {
    address?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string; // ISO 3166-1 alpha-2 country code
    lat?: number; // Latitude
    lon?: number; // Longitude
    storeNumber?: string;
  };
  /** Payment channel (e.g., "online", "in store", "bill pay", "atm"). */
  paymentChannel?: "online" | "in store" | "other" | "bill pay" | "atm" | "cash" | "check" | "digital wallet" | "external transfer" | "internal transfer" | "p2p payment" | "subscription";
  /** Status of the transaction (e.g., pending, posted, cancelled). */
  status: "pending" | "posted" | "cancelled" | "failed";
  /** The Plaid personal finance category for the transaction, providing finer granularity than `category`. */
  personalFinanceCategory?: {
    primary: string;
    detailed: string;
  };
  /** The ID of the Plaid Item this transaction belongs to. */
  itemId: string;
  /** Merchant ID associated with the transaction, if available. */
  merchantId?: string;
  /** The check number for check-based transactions. */
  checkNumber?: string;
}


// --- Citibank Demo Business Specific Types ---

/**
 * Represents a proprietary internal transaction for Citibank Demo Business.
 * This includes internal ledger entries, aggregated payments, and business-specific operational transfers not directly from external platforms.
 */
export interface CitibankDBInternalTransaction extends BaseArchivedRecord {
  type: "CitibankDBInternalTransaction";
  /** The unique internal transaction ID within Citibank Demo Business. */
  internalTransactionId: string;
  /** The specific type of internal financial movement. */
  transactionType: "deposit_internal" | "withdrawal_internal" | "transfer_in" | "transfer_out" | "fee_internal" | "adjustment_internal" | "payroll_internal" | "expense_reimbursement" | "invoice_payment_received" | "invoice_payment_sent" | "credit_memo" | "debit_memo" | "fund_allocation" | "intercompany_transfer" | "system_correction";
  /** The amount of the transaction in the smallest currency unit. */
  amount: number;
  /** The currency of the transaction. */
  currency: Currency;
  /** A detailed description of the purpose or nature of the transaction. */
  description: string;
  /** The date and time the transaction was initiated within the internal system (ISO 8601 string). */
  initiationDate: string;
  /** The date and time the transaction was completed (ISO 8601 string), if applicable. */
  completionDate?: string;
  /** The current status of the internal transaction. */
  status: FinancialRecordStatus;
  /** The ID of the internal account from which funds originated. */
  sourceInternalAccountId?: string;
  /** The ID of the internal account to which funds were directed. */
  destinationInternalAccountId?: string;
  /** Reference to an external transaction ID if this internal transaction is linked to an external payment or event. */
  externalReferenceId?: string;
  /** The associated business unit or department responsible for this transaction. */
  businessUnit?: string;
  /** Any internal compliance or audit notes pertaining to this transaction. */
  auditNotes?: string[];
  /** Identifier for the employee or automated system initiating the transaction. */
  initiatorId?: string;
  /** Identifier for the approver of the transaction, if an approval workflow is involved. */
  approverId?: string;
  /** The general ledger account affected by this transaction, for accounting purposes. */
  generalLedgerAccount?: string;
  /** Tags or labels for internal classification (e.g., "Q3-2023", "MarketingCampaign"). */
  tags?: string[];
}

/**
 * Represents a comprehensive customer profile managed by Citibank Demo Business.
 * This aggregates customer data, potentially from various integrated platforms, providing a unified view.
 */
export interface CitibankDBCustomerProfile extends BaseArchivedRecord {
  type: "CitibankDBCustomerProfile";
  /** Unique identifier for the customer profile within Citibank Demo Business. */
  customerId: string;
  /** The legal name of the customer (individual or business entity). */
  legalName: string;
  /** A preferred display name for the customer, if different from legal name. */
  displayName?: string;
  /** The primary contact email for the customer. */
  email: string;
  /** The primary contact phone number for the customer. */
  phone?: string;
  /** The legal entity type of the customer. */
  entityType: "individual" | "sole_proprietorship" | "partnership" | "corporation" | "llc" | "non_profit" | "government" | "trust" | "educational_institution";
  /** The primary physical address of the customer. */
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string; // ISO 3166-1 alpha-2 country code
  };
  /** The current status of the customer account within Citibank Demo Business. */
  status: "active" | "suspended" | "closed" | "pending_verification" | "on_hold" | "risk_flagged" | "onboarding";
  /** A list of associated external platform customer IDs (e.g., Stripe customer ID, Modern Treasury counterparty ID). */
  externalCustomerIds?: {
    stripe?: string;
    modernTreasury?: string;
    plaid?: string;
    crm?: string;
    support?: string; // Example: could link to support system customer ID
  };
  /** The date of the last Know Your Customer (KYC) review (YYYY-MM-DD). */
  lastKycReviewDate?: string;
  /** An internal risk score assigned to the customer (e.g., 0-100), based on internal and external data. */
  riskScore?: number;
  /** Details of the primary contact person for business customers. */
  primaryContactPerson?: {
    name: string;
    email: string;
    phone?: string;
    title?: string;
  };
  /** Date the customer was onboarded (YYYY-MM-DD). */
  onboardingDate?: string;
  /** Any notes or internal comments on the customer profile. */
  internalNotes?: string;
  /** Current aggregate account balance with Citibank Demo Business across all associated internal accounts. */
  bankAccountBalance?: {
    amount: number;
    currency: Currency;
  };
  /** Preferred communication language (ISO 639-1 code). */
  preferredLanguage?: string;
  /** Industry of the business customer. */
  industry?: string;
}

/**
 * Represents an aggregated financial report generated by Citibank Demo Business.
 * These reports consolidate data from various sources for internal analysis, compliance, or external stakeholder reporting.
 */
export interface CitibankDBFinancialReport extends BaseArchivedRecord {
  type: "CitibankDBFinancialReport";
  /** Unique identifier for this specific report instance. */
  reportId: string;
  /** The specific type or purpose of the report (e.g., daily_summary, monthly_statement, compliance_audit). */
  reportType: "daily_summary" | "monthly_statement" | "quarterly_statement" | "annual_statement" | "transaction_summary" | "balance_sheet" | "income_statement" | "cash_flow_statement" | "compliance_audit" | "fraud_report" | "revenue_report" | "liquidity_report" | "pnl_statement" | "tax_report" | "budget_variance";
  /** The time period covered by the report. */
  period: {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
  };
  /** The date and time when the report was generated (ISO 8601 string). */
  generatedDate: string;
  /** The current status of the report generation and review process. */
  status: "generated" | "pending" | "failed" | "approved" | "reviewed" | "published";
  /** The URL or file path to the stored report file (e.g., S3 path to a PDF, CSV, or XLSX). */
  reportFileLocation?: string;
  /** The total aggregated value reported, if applicable (e.g., total revenue, total expenses, net income). */
  totalValue?: {
    amount: number;
    currency: Currency;
  };
  /** A summary of key metrics and figures presented in the report, structured as key-value pairs. */
  summaryMetrics?: Record<string, number | string>;
  /** Reference to the relevant business unit, department, or legal entity this report pertains to. */
  entityId?: string;
  /** The version of the report schema or template used for generation. */
  version: string;
  /** Any parameters or filters used to generate the report (e.g., specific accounts, date ranges). */
  generationParameters?: Record<string, any>;
  /** ID of the user or system who generated the report. */
  generatorId?: string;
  /** An audit trail for report generation, review, and approval actions. */
  auditTrail?: Array<{
    action: string; // e.g., "generated", "reviewed", "approved"
    timestamp: string; // ISO 8601 string
    actorId: string;
    notes?: string;
  }>;
  /** The format of the report file (e.g., "PDF", "CSV", "XLSX"). */
  fileFormat?: "PDF" | "CSV" | "XLSX" | "JSON" | "HTML";
}


// --- Operational Records (enriched for financial context) ---

/**
 * Represents an audit record, tracking specific changes or actions within the financial system.
 * Essential for compliance, security, and debugging.
 */
export interface FinancialAuditRecord extends BaseArchivedRecord {
  type: "FinancialAuditRecord";
  /** The ID of the user, API key, or automated system actor who performed the action. */
  actorId: string;
  /** The type of action performed (e.g., 'create_payment_order', 'update_customer', 'login_success', 'risk_flag_set'). */
  action: string;
  /** The primary resource type that was affected (e.g., 'PaymentOrder', 'Customer', 'Account', 'StripeCharge'). */
  resourceType: string;
  /** The ID of the specific resource instance that was affected by the action. */
  resourceId: string;
  /** Details of the change, often a diff showing before and after states of relevant properties. */
  changeDetails?: Record<string, any>;
  /** The IP address from which the action was initiated. */
  ipAddress?: string;
  /** User agent or client information of the actor (e.g., browser string, application name). */
  userAgent?: string;
  /** The outcome of the action (success/failure). */
  outcome: "success" | "failure";
  /** An error message if the action failed, providing details on the cause. */
  errorMessage?: string;
  /** The specific fields that were modified during the action, if applicable. */
  modifiedFields?: string[];
  /** Contextual information related to the action (e.g., reason for approval, specific request parameters). */
  context?: Record<string, any>;
  /** The ID of the transaction or request that triggered this audit event. */
  transactionRefId?: string;
}

/**
 * Represents a system event that occurred within the financial ecosystem.
 * These events might trigger webhooks, internal processes, or notifications across integrated systems.
 */
export interface FinancialEvent extends BaseArchivedRecord {
  type: "FinancialEvent";
  /** A unique identifier for this specific event instance. */
  eventId: string;
  /** The categorized type of event (e.g., 'payment.succeeded', 'customer.created', 'transaction.failed', 'webhook.received'). */
  eventType: string;
  /** The full payload or data associated with the event, as received or generated. */
  eventData: Record<string, any>;
  /** The ID of the primary resource associated with the event (e.g., PaymentOrder ID, Customer ID, Charge ID). */
  resourceId?: string;
  /** The specific sub-type of the resource, if further classification is needed (e.g., 'deposit_ach', 'invoice_paid_stripe'). */
  resourceSubType?: string;
  /** The internal system or external platform that emitted this event. */
  sourceSystem: FinancialDataSourcePlatform | "InternalService" | "WebhookProcessor" | "RiskEngine" | "LedgerSystem";
  /** The current processing status of this event within Citibank Demo Business. */
  processingStatus: "pending" | "processed" | "failed" | "ignored" | "retried" | "deferred";
  /** The number of times processing for this event has been retried. */
  retryCount?: number;
  /** The last error message encountered during event processing, if any. */
  lastErrorMessage?: string;
  /** The ID of any triggered webhook delivery attempt related to this event. */
  webhookDeliveryAttemptId?: string;
  /** The ID of any downstream process or job initiated by this event. */
  triggeredJobId?: string;
}

/**
 * Represents a log of an incoming API request to the Citibank Demo Business API or a webhook receiver.
 * Crucial for monitoring, security, and debugging API interactions.
 */
export interface APIRequestLog extends BaseArchivedRecord {
  type: "APIRequestLog";
  /** The unique ID for this specific API request. */
  requestId: string;
  /** The HTTP method used (e.g., GET, POST, PUT, DELETE, PATCH). */
  httpMethod: string;
  /** The full URL path of the request (e.g., "/v1/payment_orders/po_123abc"). */
  path: string;
  /** The HTTP status code of the response. */
  statusCode: number;
  /** The IP address of the client making the request. */
  clientIpAddress: string;
  /** The user agent string of the client. */
  userAgent?: string;
  /** The duration of the request processing in milliseconds. */
  durationMs: number;
  /** The ID of the authenticated user or API key that made the request. */
  authId?: string;
  /** The body of the request (potentially truncated or anonymized for security/privacy/size). */
  requestBody?: Record<string, any>;
  /** The body of the response (potentially truncated or anonymized). */
  responseBody?: Record<string, any>;
  /** Selected request headers (e.g., 'Content-Type', 'X-Request-Id', 'User-Agent'). */
  requestHeaders?: Record<string, string>;
  /** Selected response headers. */
  responseHeaders?: Record<string, string>;
  /** Any error message associated with the request/response processing. */
  errorMessage?: string;
  /** A flag indicating if the request was an external webhook received by the system. */
  isWebhook?: boolean;
  /** The external source of the webhook, if applicable (e.g., "stripe", "moderntreasury", "plaid"). */
  webhookSource?: string;
  /** The unique identifier for the specific resource that was targeted or created by the API request. */
  targetResourceId?: string;
  /** The specific API endpoint called. */
  endpoint?: string;
}

// --- Union Type for all exportable archived data ---

/**
 * A comprehensive union type representing any financial data entity that can be archived and exported
 * from the integrated financial ecosystem of Citibank Demo Business. This serves as a single source
 * of truth for all structured archived data.
 */
export type ArchivedFinancialData =
  | MTTransaction
  | MTPaymentOrder
  | MTCounterparty
  | StripeCharge
  | StripeRefund
  | StripeCustomer
  | PlaidAccount
  | PlaidTransaction
  | CitibankDBInternalTransaction
  | CitibankDBCustomerProfile
  | CitibankDBFinancialReport
  | FinancialAuditRecord
  | FinancialEvent
  | APIRequestLog;

/**
 * Defines the distinct categories (types) of financial data that can be exported.
 * This type is automatically derived from the `type` property of all `ArchivedFinancialData` interfaces,
 * ensuring consistency. It can be used in UI components or API filters for data selection.
 */
export type ExportableFinancialDataType = ArchivedFinancialData['type'];

/**
 * A mapping from each `ExportableFinancialDataType` to a human-readable string.
 * This constant is useful for displaying descriptive names in user interfaces, reports, or logs.
 */
export const EXPORTABLE_FINANCIAL_DATA_TYPE_TO_TEXT: Record<ExportableFinancialDataType, string> = {
  MTTransaction: "Modern Treasury Transactions",
  MTPaymentOrder: "Modern Treasury Payment Orders",
  MTCounterparty: "Modern Treasury Counterparties",
  StripeCharge: "Stripe Charges",
  StripeRefund: "Stripe Refunds",
  StripeCustomer: "Stripe Customers",
  PlaidAccount: "Plaid Accounts",
  PlaidTransaction: "Plaid Transactions",
  CitibankDBInternalTransaction: "Citibank Demo Business Internal Transactions",
  CitibankDBCustomerProfile: "Citibank Demo Business Customer Profiles",
  CitibankDBFinancialReport: "Citibank Demo Business Financial Reports",
  FinancialAuditRecord: "Financial Audit Records",
  FinancialEvent: "Financial Events",
  APIRequestLog: "API Request Logs",
};

/**
 * Utility type to extract a specific archived data interface from the `ArchivedFinancialData` union
 * based on its `type` property. This allows for type-safe manipulation of specific data shapes.
 * @template T - The `type` literal string to filter by (e.g., "StripeCharge", "MTTransaction").
 */
export type ExtractArchivedData<T extends ExportableFinancialDataType> = Extract<ArchivedFinancialData, { type: T }>;

// Further categorization of `ExportableFinancialDataType` into logical groups for application-level filtering or display.

/**
 * A type representing operational data records, typically for auditing, system events, or API request logging.
 * These records track system activity rather than direct financial transactions.
 */
export type OperationalArchivedResourceType =
  | "FinancialAuditRecord"
  | "FinancialEvent"
  | "APIRequestLog";

/**
 * A type representing transactional data records, detailing actual money movements or financial instructions.
 */
export type TransactionalArchivedResourceType =
  | "MTTransaction"
  | "MTPaymentOrder"
  | "StripeCharge"
  | "StripeRefund"
  | "PlaidTransaction"
  | "CitibankDBInternalTransaction";

/**
 * A type representing master data or core entity records, such as customers, accounts, or counterparties.
 * These records typically define entities that participate in transactions.
 */
export type MasterDataArchivedResourceType =
  | "MTCounterparty"
  | "StripeCustomer"
  | "PlaidAccount"
  | "CitibankDBCustomerProfile";

/**
 * A type representing aggregated or generated financial reports that summarize or analyze financial data.
 */
export type ReportingArchivedResourceType =
  | "CitibankDBFinancialReport";