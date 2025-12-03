// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

//region Enums
/**
 * Represents the various types of financial entities managed within the system.
 */
enum FinancialEntityType {
  Customer = "CUSTOMER",
  Account = "ACCOUNT",
  Transaction = "TRANSACTION",
  Payment = "PAYMENT",
  PaymentInstrument = "PAYMENT_INSTRUMENT",
  ExpectedPayment = "EXPECTED_PAYMENT",
  Invoice = "INVOICE",
  Transfer = "TRANSFER",
  Dispute = "DISPUTE",
}

/**
 * Defines the various types of accounts.
 */
enum AccountType {
  Checking = "CHECKING",
  Savings = "SAVINGS",
  CreditCard = "CREDIT_CARD",
  Loan = "LOAN",
  Investment = "INVESTMENT",
  Wallet = "WALLET", // e.g., Stripe Connect platform account, PayPal
  ExternalBankAccount = "EXTERNAL_BANK_ACCOUNT", // Used for counterparties
  ACH = "ACH",
  Wire = "WIRE",
  Crypto = "CRYPTO",
  MoneyMarket = "MONEY_MARKET",
  Brokerage = "BROKERAGE",
  Unknown = "UNKNOWN",
}

/**
 * Represents the current status of a financial account.
 */
enum AccountStatus {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Closed = "CLOSED",
  Suspended = "SUSPENDED",
  PendingVerification = "PENDING_VERIFICATION",
  Frozen = "FROZEN",
  Blocked = "BLOCKED",
}

/**
 * Defines the different types of transactions.
 */
enum TransactionType {
  Debit = "DEBIT",
  Credit = "CREDIT",
  Transfer = "TRANSFER",
  Payment = "PAYMENT",
  Refund = "REFUND",
  Fee = "FEE",
  Adjustment = "ADJUSTMENT",
  Deposit = "DEPOSIT",
  Withdrawal = "WITHDRAWAL",
  Interest = "INTEREST",
  Purchase = "PURCHASE",
  Sale = "SALE",
  Disbursement = "DISBURSEMENT",
  AuthCapture = "AUTH_CAPTURE",
  Unknown = "UNKNOWN",
}

/**
 * Represents the processing status of a transaction.
 */
enum TransactionStatus {
  Pending = "PENDING",
  Posted = "POSTED",
  Booked = "BOOKED", // Alternative to POSTED for some systems
  Canceled = "CANCELED",
  Failed = "FAILED",
  Refunded = "REFUNDED",
  Settled = "SETTLED",
  Authorized = "AUTHORIZED",
  Declined = "DECLINED",
  Voided = "VOIDED",
  PartiallyRefunded = "PARTIALLY_REFUNDED",
}

/**
 * Represents the direction of a payment (inbound or outbound).
 */
enum PaymentDirection {
  Inbound = "INBOUND",
  Outbound = "OUTBOUND",
}

/**
 * Defines the current status of a payment.
 */
enum PaymentStatus {
  Pending = "PENDING",
  Processing = "PROCESSING",
  Completed = "COMPLETED",
  Failed = "FAILED",
  Canceled = "CANCELED",
  Refunded = "REFUNDED",
  RequiresAction = "REQUIRES_ACTION",
  PartiallyRefunded = "PARTIALLY_REFUNDED",
  Denied = "DENIED",
  Reversed = "REVERSED",
}

/**
 * Defines the various payment methods.
 */
enum PaymentMethodType {
  CreditCard = "CREDIT_CARD",
  DebitCard = "DEBIT_CARD",
  ACH = "ACH",
  Wire = "WIRE",
  Check = "CHECK",
  Wallet = "WALLET", // e.g., Apple Pay, Google Pay
  Crypto = "CRYPTO",
  SEPA = "SEPA",
  BACS = "BACS",
  Interac = "INTERAC",
  Pix = "PIX",
  FasterPayments = "FASTER_PAYMENTS",
  SWIFT = "SWIFT",
  RTP = "RTP", // Real-Time Payments
  VirtualAccount = "VIRTUAL_ACCOUNT",
  Manual = "MANUAL",
  Unknown = "UNKNOWN",
}

/**
 * Defines the KYC (Know Your Customer) status of an entity.
 */
enum KYCStatus {
  NotStarted = "NOT_STARTED",
  InProgress = "IN_PROGRESS",
  PendingReview = "PENDING_REVIEW",
  Approved = "APPROVED",
  Rejected = "REJECTED",
  Expired = "EXPIRED",
  RequiresUpdates = "REQUIRES_UPDATES",
}

/**
 * Defines the risk level associated with an entity or transaction.
 */
enum RiskLevel {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
  Critical = "CRITICAL",
  Undetermined = "UNDETERMINED",
}

/**
 * Defines the source partner from which the data originates.
 */
enum SourcePartner {
  Stripe = "STRIPE",
  Plaid = "PLAID",
  ModernTreasury = "MODERN_TREASURY",
  CitibankDemoBusiness = "CITIBANK_DEMO_BUSINESS", // Internal source
  Other = "OTHER",
}

/**
 * Standardized currency codes.
 */
enum Currency {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  CAD = "CAD",
  AUD = "AUD",
  JPY = "JPY",
  CHF = "CHF",
  CNY = "CNY",
  INR = "INR",
  MXN = "MXN",
  BRL = "BRL",
  SGD = "SGD",
  HKD = "HKD",
  NZD = "NZD",
  SEK = "SEK",
  NOK = "NOK",
  DKK = "DKK",
  ZAR = "ZAR",
  AED = "AED",
  SAR = "SAR",
  KWD = "KWD",
  QAR = "QAR",
  RUB = "RUB",
  KRW = "KRW",
  THB = "THB",
  IDR = "IDR",
  MYR = "MYR",
  PHP = "PHP",
  VND = "VND",
  CLP = "CLP",
  COP = "COP",
  PEN = "PEN",
  ARS = "ARS",
  EGP = "EGP",
  NGN = "NGN",
  GHS = "GHS",
  KES = "KES",
  UGX = "UGX",
  TZS = "TZS",
  XOF = "XOF",
  XAF = "XAF",
  XCD = "XCD",
  UNKNOWN = "UNKNOWN",
}

/**
 * Categorization for transaction types.
 */
enum TransactionCategory {
  Payments = "PAYMENTS",
  Transfers = "TRANSFERS",
  FoodAndDrink = "FOOD_AND_DRINK",
  Shopping = "SHOPPING",
  Travel = "TRAVEL",
  Utilities = "UTILITIES",
  Rent = "RENT",
  Mortgage = "MORTGAGE",
  Salary = "SALARY",
  Investments = "INVESTMENTS",
  Healthcare = "HEALTHCARE",
  Education = "EDUCATION",
  Entertainment = "ENTERTAINMENT",
  BillsAndFees = "BILLS_AND_FEES",
  BusinessExpenses = "BUSINESS_EXPENSES",
  Cash = "CASH",
  Automotive = "AUTOMOTIVE",
  Insurance = "INSURANCE",
  Donations = "DONATIONS",
  Refunds = "REFUNDS",
  Deposits = "DEPOSITS",
  Withdrawals = "WITHDRAWALS",
  Gambling = "GAMBLING",
  PersonalCare = "PERSONAL_CARE",
  HomeImprovement = "HOME_IMPROVEMENT",
  Pets = "PETS",
  Subscription = "SUBSCRIPTION",
  Freelance = "FREELANCE",
  Tax = "TAX",
  Payroll = "PAYROLL",
  Unknown = "UNKNOWN",
}

/**
 * Types of anomalies detected.
 */
enum AnomalyType {
  UnusualTransactionAmount = "UNUSUAL_TRANSACTION_AMOUNT",
  UnusualTransactionFrequency = "UNUSUAL_TRANSACTION_FREQUENCY",
  UnusualTransactionLocation = "UNUSUAL_TRANSACTION_LOCATION",
  HighValueTransaction = "HIGH_VALUE_TRANSACTION",
  MultipleFailedAttempts = "MULTIPLE_FAILED_ATTEMPTS",
  SuspiciousAccountActivity = "SUSPICIOUS_ACCOUNT_ACTIVITY",
  IdentityMismatch = "IDENTITY_MISMATCH",
  DuplicatePayment = "DUPLICATE_PAYMENT",
  CrossBorderAnomaly = "CROSS_BORDER_ANOMALY",
  NewPayeeAnomaly = "NEW_PAYEE_ANOMALY",
  RapidMovementOfFunds = "RAPID_MOVEMENT_OF_FUNDS",
  ExcessiveRefunds = "EXCESSIVE_REFUNDS",
  Unknown = "UNKNOWN",
}

/**
 * Severity of detected anomalies.
 */
enum AnomalySeverity {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
  Critical = "CRITICAL",
  Informational = "INFORMATIONAL",
}

/**
 * Types of addresses.
 */
enum AddressType {
  Billing = "BILLING",
  Shipping = "SHIPPING",
  Residential = "RESIDENTIAL",
  Business = "BUSINESS",
  Mailing = "MAILING",
  Registered = "REGISTERED",
  Correspondance = "CORRESPONDANCE",
}

/**
 * Types of email contacts.
 */
enum EmailType {
  Personal = "PERSONAL",
  Business = "BUSINESS",
  Support = "SUPPORT",
  Marketing = "MARKETING",
  Billing = "BILLING",
}

/**
 * Types of phone numbers.
 */
enum PhoneType {
  Mobile = "MOBILE",
  Landline = "LANDLINE",
  Business = "BUSINESS",
  Fax = "FAX",
  Support = "SUPPORT",
}
//endregion

//region Base Interfaces
/**
 * Represents a standardized monetary amount.
 */
interface Amount {
  value: number; // Stored as a positive integer in cents or smallest unit
  currency: Currency;
  isDebit: boolean; // True for debits, false for credits (relative to the primary account)
}

/**
 * Base interface for all financial entities, providing common metadata.
 */
interface BaseEntity {
  /** A unique identifier for the entity within the Citibank Demo Business ecosystem. */
  id: string;
  /** The timestamp when the entity was created in the source system. ISO 8601 format. */
  createdAt: string;
  /** The timestamp when the entity was last updated in the source system. ISO 8601 format. */
  updatedAt: string;
  /** The unique identifier of the organization (Citibank Demo Business) that owns this entity. */
  organizationId: string; // e.g., 'citibankdemobusiness.dev' or an internal UUID
  /** The original source system from which this entity's data was retrieved. */
  sourcePartner: SourcePartner;
  /** The unique identifier of the entity in its original source system. */
  sourceId: string;
  /** Any additional metadata from the source system that doesn't fit into the standardized schema. */
  metadata?: Record<string, any>;
}

/**
 * Represents a geographical address.
 */
interface Address {
  addressType?: AddressType;
  street1: string;
  street2?: string;
  city: string;
  state?: string; // e.g., 'NY' for US, 'London' for UK (if no specific state concept)
  postalCode: string;
  country: string; // ISO 3166-1 alpha-2 code, e.g., 'US', 'GB'
  description?: string; // e.g., "Main office address"
  isPrimary?: boolean;
}

/**
 * Represents a contact email address.
 */
interface EmailContact {
  emailType?: EmailType;
  email: string;
  isPrimary?: boolean;
  verified?: boolean;
}

/**
 * Represents a contact phone number.
 */
interface PhoneContact {
  phoneType?: PhoneType;
  phoneNumber: string;
  countryCode?: string; // e.g., "+1"
  isPrimary?: boolean;
  verified?: boolean;
}

/**
 * Generic interface for validation results.
 */
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Represents a detected anomaly.
 */
interface AnomalyReport {
  type: AnomalyType;
  severity: AnomalySeverity;
  description: string;
  detectedAt: string; // ISO 8601 timestamp
  dataPointId?: string; // ID of the entity where anomaly was detected
  additionalContext?: Record<string, any>;
}

/**
 * Represents a bank account payment instrument.
 */
interface BankAccountPaymentInstrument {
  id: string; // Unique ID for this payment instrument
  paymentMethodType: PaymentMethodType.ACH | PaymentMethodType.Wire | PaymentMethodType.SEPA | PaymentMethodType.BACS | PaymentMethodType.SWIFT | PaymentMethodType.FasterPayments | PaymentMethodType.RTP | PaymentMethodType.Check | PaymentMethodType.VirtualAccount;
  bankName?: string;
  accountNumber?: string; // Masked or full, depending on context
  routingNumber?: string; // ACH routing number
  swiftCode?: string; // SWIFT/BIC code
  iban?: string; // IBAN
  branchCode?: string;
  currency: Currency;
  accountHolderName: string;
  accountHolderType?: "individual" | "company";
  country: string; // ISO 3166-1 alpha-2
  fingerprint?: string; // Unique identifier for the bank account details
  status?: AccountStatus;
  verified?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Represents a card payment instrument.
 */
interface CardPaymentInstrument {
  id: string; // Unique ID for this payment instrument
  paymentMethodType: PaymentMethodType.CreditCard | PaymentMethodType.DebitCard;
  brand: string; // e.g., "Visa", "Mastercard"
  last4: string;
  expirationMonth: number;
  expirationYear: number;
  funding?: "credit" | "debit" | "prepaid" | "unknown";
  country: string; // ISO 3166-1 alpha-2
  fingerprint?: string; // Unique identifier for the card details
  metadata?: Record<string, any>;
}

/**
 * Union type for all supported payment instruments.
 */
type UnifiedPaymentInstrument = BankAccountPaymentInstrument | CardPaymentInstrument;

/**
 * Represents a payment dispute.
 */
interface Dispute {
  id: string;
  paymentId: string; // ID of the related payment
  reason: string;
  status: "pending" | "won" | "lost" | "closed";
  amount: Amount;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

//endregion

//region Unified Financial Models
/**
 * Represents a unified customer profile across all financial systems.
 */
interface UnifiedCustomer extends BaseEntity {
  entityType: FinancialEntityType.Customer;
  firstName?: string;
  lastName?: string;
  fullName?: string; // Derived or provided
  companyName?: string;
  displayName: string; // Preferred name for display (e.g., full name or company name)
  emails: EmailContact[];
  phones: PhoneContact[];
  addresses: Address[];
  dateOfBirth?: string; // YYYY-MM-DD
  taxId?: string; // e.g., SSN, EIN, VAT ID
  kycStatus: KYCStatus;
  riskLevel: RiskLevel;
  description?: string;
  /** Internal Citibank Demo Business specific attributes */
  internalClientId?: string;
  internalAccountIds?: string[]; // References to UnifiedAccount IDs
  linkedPaymentInstrumentIds?: string[]; // References to UnifiedPaymentInstrument IDs
  internalNotes?: string;
  internalRiskScore?: number;
}

/**
 * Represents a unified financial account across all financial systems.
 */
interface UnifiedAccount extends BaseEntity {
  entityType: FinancialEntityType.Account;
  customerId: string; // ID of the associated UnifiedCustomer
  name: string; // User-friendly name, e.g., "My Checking Account"
  accountType: AccountType;
  currency: Currency;
  currentBalance: Amount; // Latest available balance
  availableBalance?: Amount; // Usable balance, considering holds/pending transactions
  pendingBalance?: Amount; // Balance of pending transactions not yet posted
  status: AccountStatus;
  mask: string; // Last 4 digits of account number, or identifier
  bankName?: string;
  routingNumber?: string;
  iban?: string;
  swiftCode?: string;
  sortCode?: string; // UK specific
  holderName?: string;
  verified: boolean;
  accountOwnershipType?: "individual" | "joint" | "business";
  country?: string; // ISO 3166-1 alpha-2
  /** Internal Citibank Demo Business specific attributes */
  internalStatementIds?: string[]; // References to internal statement documents
  internalRiskScore?: number;
  anomalyReports?: AnomalyReport[];
}

/**
 * Represents a unified financial transaction across all systems.
 */
interface UnifiedTransaction extends BaseEntity {
  entityType: FinancialEntityType.Transaction;
  accountId: string; // ID of the associated UnifiedAccount
  paymentId?: string; // Optional: ID of the associated UnifiedPayment
  description: string;
  amount: Amount; // Amount with sign indicating debit/credit
  transactionType: TransactionType;
  status: TransactionStatus;
  postedDate: string; // ISO 8601, when the transaction was officially posted
  effectiveDate?: string; // ISO 8601, when the transaction actually occurred (may differ from posted)
  authorizedDate?: string; // ISO 8601, when the transaction was authorized
  merchantName?: string;
  merchantCategory?: TransactionCategory;
  merchantId?: string; // Optional merchant identifier
  location?: Address; // Transaction location
  category: TransactionCategory; // Standardized category
  subCategory?: string;
  reconciliationId?: string; // Identifier for reconciliation purposes
  /**
   * Reference to another transaction if this is a related event (e.g., refund for a purchase, transfer leg).
   * Can be used to link debit/credit legs of an internal transfer.
   */
  relatedTransactionId?: string;
  /**
   * Identifies the counterparty involved in the transaction.
   * This could be a merchant ID, another customer ID, or a generic name.
   */
  counterparty?: {
    id?: string; // Optional: ID of the UnifiedCustomer if internal, or external identifier
    name: string;
    accountIdentifier?: string; // e.g., "john.doe@example.com", "bank_account_xxxx"
    type?: "customer" | "merchant" | "bank" | "other";
  };
  /** Internal Citibank Demo Business specific attributes */
  internalApprovalCode?: string;
  internalMemo?: string;
  fraudScore?: number;
  anomalyReports?: AnomalyReport[];
}

/**
 * Represents a unified payment event (PaymentIntent, PaymentOrder, Charge) across all systems.
 */
interface UnifiedPayment extends BaseEntity {
  entityType: FinancialEntityType.Payment;
  customerId?: string; // Optional: ID of the associated UnifiedCustomer (for inbound/outbound)
  initiatingAccountId?: string; // ID of the account from which payment is initiated
  receivingAccountId?: string; // ID of the account receiving the payment
  paymentDirection: PaymentDirection;
  amount: Amount;
  currency: Currency;
  status: PaymentStatus;
  paymentMethodType: PaymentMethodType;
  paymentMethodId?: string; // Reference to UnifiedPaymentInstrument ID, or source-specific ID
  description?: string;
  statementDescriptor?: string; // Description for customer's bank statement
  originatingIpAddress?: string;
  failureCode?: string; // e.g., "card_declined", "insufficient_funds"
  failureMessage?: string;
  returnReason?: string; // If payment was returned/reversed
  metadata?: Record<string, any>;
  /**
   * Identifies the counterparty for the payment.
   * For an inbound payment, this is the payer. For an outbound payment, this is the payee.
   */
  counterparty?: {
    id?: string; // Optional: ID of the UnifiedCustomer if internal, or external identifier
    name: string;
    accountIdentifier?: string; // e.g., "john.doe@example.com", "bank_account_xxxx"
    type?: "customer" | "merchant" | "bank" | "other";
  };
  /** Associated transaction IDs from UnifiedTransaction. */
  transactionIds?: string[];
  /** Internal Citibank Demo Business specific attributes */
  internalReferenceNumber?: string;
  internalProcessingFee?: Amount;
  internalExchangeRate?: number; // If currency conversion occurred
  internalFxRateId?: string;
  internalRegulatoryComplianceChecks?: Record<string, "pass" | "fail" | "pending">;
  internalComplianceNotes?: string[];
  anomalyReports?: AnomalyReport[];
}

//endregion

//region Raw Source Data Models (Illustrative - internal to this file for "no imports" constraint)
// These interfaces represent the simplified structure of data as it might arrive from each specific financial API.
// In a real scenario, these would be precise types based on API documentation.

interface StripeRawCustomer {
  id: string;
  email?: string;
  name?: string;
  description?: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  shipping?: {
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
    name?: string;
    phone?: string;
  };
  balance: number; // in cents
  currency: string;
  created: number; // Unix timestamp
  metadata: Record<string, any>;
  default_source?: string; // ID of card or bank account
  tax_ids?: Array<{ type: string; value: string }>;
}

interface StripeRawAccount {
  id: string; // Connected account ID
  email?: string;
  type: "standard" | "express" | "custom";
  country: string;
  capabilities?: Record<string, string>;
  business_profile?: {
    mcc?: string;
    name?: string;
    url?: string;
    support_email?: string;
    support_phone?: string;
  };
  created: number; // Unix timestamp
  payouts_enabled: boolean;
  charges_enabled: boolean;
  details_submitted: boolean;
  metadata?: Record<string, any>;
  external_accounts?: {
    data: Array<{
      id: string;
      object: "bank_account" | "card";
      account_holder_name?: string;
      account_holder_type?: "individual" | "company";
      bank_name?: string;
      country?: string;
      currency?: string;
      fingerprint?: string;
      last4?: string;
      routing_number?: string;
      status?: string;
      brand?: string;
      exp_month?: number;
      exp_year?: number;
      funding?: string;
    }>;
  };
  // Simplified for context
}

interface StripeRawTransaction {
  id: string; // charge ID, payout ID, transfer ID
  object: "charge" | "payout" | "transfer" | "refund";
  amount: number; // in cents
  currency: string;
  created: number; // Unix timestamp
  description?: string;
  status: string; // e.g., "succeeded", "pending", "failed"
  customer?: string; // Customer ID
  payment_intent?: string; // Payment Intent ID
  payment_method?: string;
  source_transfer?: string; // For platform charges
  destination_payment?: string; // For transfers
  balance_transaction?: string; // ID of the balance transaction
  type?: "charge" | "payment" | "refund" | "payout" | "transfer"; // For balance transaction types
  // Specific fields for charge
  receipt_email?: string;
  receipt_url?: string;
  billing_details?: {
    address?: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postal_code?: string;
      state?: string;
    };
    email?: string;
    name?: string;
    phone?: string;
  };
  // Specific fields for payout
  destination?: string;
  // Specific fields for refund
  charge?: string;
  reason?: string;
  metadata?: Record<string, any>;
}

interface PlaidRawCustomerIdentity {
  item_id: string;
  request_id: string;
  accounts: Array<{
    account_id: string;
    balances: {
      available: number | null;
      current: number | null;
      limit: number | null;
      iso_currency_code: string | null;
      unofficial_currency_code: string | null;
    };
    mask: string | null;
    name: string;
    official_name: string | null;
    subtype: string | null;
    type: string;
  }>;
  identity: {
    accounts: Array<{
      account_id: string;
      owners: Array<{
        addresses: Array<{
          data: {
            city: string | null;
            country: string | null;
            postal_code: string | null;
            region: string | null;
            street: string | null;
          };
          primary: boolean;
        }>;
        emails: Array<{
          data: string;
          primary: boolean;
          type: string;
        }>;
        names: string[];
        phone_numbers: Array<{
          data: string;
          primary: boolean;
          type: string;
        }>;
      }>;
    }>;
  };
  // Simplified for context
}

interface PlaidRawAccount {
  account_id: string;
  balances: {
    available: number | null;
    current: number | null;
    iso_currency_code: string | null;
  };
  mask: string | null;
  name: string;
  official_name: string | null;
  subtype: string | null;
  type: string;
  // Additional Plaid account details if available
}

interface PlaidRawTransaction {
  account_id: string;
  transaction_id: string;
  amount: number; // positive value for debit, negative for credit
  iso_currency_code: string | null;
  unofficial_currency_code: string | null;
  category: string[] | null;
  category_id: string | null;
  date: string; // YYYY-MM-DD
  datetime: string | null; // ISO 8601
  authorized_date: string | null; // YYYY-MM-DD
  authorized_datetime: string | null; // ISO 8601
  location: {
    address: string | null;
    city: string | null;
    region: string | null;
    postal_code: string | null;
    country: string | null;
    lat: number | null;
    lon: number | null;
    store_number: string | null;
  };
  merchant_name: string | null;
  name: string; // The raw transaction description
  payment_channel: string; // e.g., "online", "in store", "other"
  pending: boolean;
  pending_transaction_id: string | null;
  personal_finance_category?: {
    primary: string;
    detailed: string;
    confidence_level: "HIGH" | "MEDIUM" | "LOW";
  };
  transaction_code: string | null;
  transaction_type: "digital" | "place" | "special" | "unresolved";
  // Simplified for context
}

interface ModernTreasuryRawCounterparty {
  id: string;
  name: string;
  email?: string;
  tax_identifier?: string;
  metadata: Record<string, any>;
  accounts?: Array<{
    id: string;
    account_type: string;
    account_number: string;
    routing_number?: string;
    swift_code?: string;
    iban?: string;
    currency: string;
    name: string;
    party_type?: "individual" | "company";
    country: string;
    // Simplified for context
  }>;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

interface ModernTreasuryRawAccount {
  id: string;
  account_details: Array<{
    account_number: string;
    account_number_type: string; // e.g., "iban", "clabe", "pan"
  }>;
  account_type: string; // e.g., "checking", "savings"
  balances: {
    available_balance: {
      amount: number; // in cents
      currency: string;
    };
    current_balance: {
      amount: number; // in cents
      currency: string;
    };
    pending_credits: {
      amount: number;
      currency: string;
    };
    pending_debits: {
      amount: number;
      currency: string;
    };
  };
  bank_name: string;
  country: string;
  currency: string;
  ledger_account_id?: string;
  live_mode: boolean;
  name: string;
  parent_account_id?: string;
  party_name?: string;
  party_type?: "individual" | "company";
  routing_details: Array<{
    routing_number: string;
    routing_number_type: string; // e.g., "aba", "swift", "au_bsb"
  }>;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

interface ModernTreasuryRawPaymentOrder {
  id: string;
  type: string; // e.g., "ACH", "wire", "sepa"
  amount: number; // in cents
  currency: string;
  direction: "credit" | "debit";
  status: string; // e.g., "pending", "completed", "failed"
  description?: string;
  remittance_information?: string;
  originating_account_id: string;
  receiving_account_id: string; // Counterparty account
  counterparty_id?: string;
  created_at: string;
  updated_at: string;
  // Simplified for context
}

interface ModernTreasuryRawExpectedPayment {
  id: string;
  type: string; // e.g., "ACH", "wire", "sepa"
  amount_lower_bound: number; // in cents
  amount_upper_bound: number; // in cents
  currency: string;
  status: string; // e.g., "pending", "booked", "archived"
  description?: string;
  internal_account_id: string;
  counterparty_id?: string;
  created_at: string;
  updated_at: string;
  // Simplified for context
}
//endregion

//region Helper Utilities (No external imports)
/**
 * Generates a pseudo-random UUID v4 string.
 * This implementation is for demonstration and adheres to "no dependencies".
 * For production, a cryptographic-strength UUID generator is recommended.
 */
function generateUUIDv4(): string {
  // From https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
  // Not cryptographically secure, but sufficient for unique identifiers in a demo/local context.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0,
      v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Checks if a string is a valid email format.
 */
function isValidEmail(email: string): boolean {
  // Basic regex for email validation.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Checks if a string is a valid ISO 8601 date string.
 */
function isValidISO8601(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 10) === dateString.slice(0, 10) || date.toISOString() === dateString;
  } catch (e) {
    return false;
  }
}

/**
 * Normalizes a string by trimming whitespace and converting to a consistent case.
 */
function normalizeStringValue(value: string | null | undefined, toCase: "lower" | "upper" | "title" | "none" = "none"): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  let normalized = String(value).trim();
  if (normalized === "") {
    return undefined;
  }
  switch (toCase) {
    case "lower":
      normalized = normalized.toLowerCase();
      break;
    case "upper":
      normalized = normalized.toUpperCase();
      break;
    case "title":
      // Basic title case, not as robust as lodash startCase but adheres to "no dependencies"
      normalized = normalized.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      break;
    case "none":
    default:
      break;
  }
  return normalized;
}

/**
 * Parses various date formats into a consistent ISO 8601 string.
 */
function parseDateToISO(dateInput: string | number | Date | null | undefined): string | undefined {
  if (dateInput === null || dateInput === undefined) {
    return undefined;
  }
  let date: Date;
  if (typeof dateInput === 'string' || typeof dateInput === 'number') {
    date = new Date(dateInput);
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    return undefined;
  }
  if (isNaN(date.getTime())) {
    return undefined;
  }
  return date.toISOString();
}

/**
 * Converts a raw amount (e.g., cents) and currency into a standardized Amount object.
 * Assumes debit values are positive from source and credit values are negative for Plaid,
 * but generally positive for charges/payments in Stripe/MT where direction is explicit.
 */
function toUnifiedAmount(value: number, currency: string, isDebitOverride: boolean = false): Amount {
  const normalizedCurrency = (currency.toUpperCase() as Currency);
  // Default logic: if value is negative, it's a credit, otherwise it's a debit.
  // The isDebitOverride is for cases where source defines direction separately (e.g., Stripe charges are positive debits to customer).
  const isDebit = value > 0 ? true : (value < 0 ? false : isDebitOverride);
  return {
    value: Math.abs(value),
    currency: Object.values(Currency).includes(normalizedCurrency) ? normalizedCurrency : Currency.UNKNOWN,
    isDebit: isDebit,
  };
}

/**
 * Converts a string to a valid Currency enum.
 */
function toCurrencyEnum(currencyCode: string | null | undefined): Currency {
  if (!currencyCode) {
    return Currency.UNKNOWN;
  }
  const upperCaseCode = currencyCode.toUpperCase() as Currency;
  return Object.values(Currency).includes(upperCaseCode) ? upperCaseCode : Currency.UNKNOWN;
}

/**
 * Converts a string to a valid AccountType enum.
 */
function toAccountTypeEnum(type: string | null | undefined): AccountType {
  if (!type) {
    return AccountType.Unknown;
  }
  const normalizedType = normalizeStringValue(type, "title")?.replace(/\s/g, '');
  if (normalizedType && Object.values(AccountType).includes(normalizedType as AccountType)) {
    return normalizedType as AccountType;
  }
  // Common mappings
  if (type.toLowerCase().includes("checking")) return AccountType.Checking;
  if (type.toLowerCase().includes("savings")) return AccountType.Savings;
  if (type.toLowerCase().includes("credit")) return AccountType.CreditCard;
  if (type.toLowerCase().includes("loan")) return AccountType.Loan;
  if (type.toLowerCase().includes("investment")) return AccountType.Investment;
  if (type.toLowerCase().includes("wallet")) return AccountType.Wallet;
  if (type.toLowerCase().includes("ach") || type.toLowerCase().includes("wire")) return AccountType.ExternalBankAccount;
  return AccountType.Unknown;
}

/**
 * Converts a string to a valid AccountStatus enum.
 */
function toAccountStatusEnum(status: string | null | undefined): AccountStatus {
  if (!status) {
    return AccountStatus.Suspended; // Default to a safe status
  }
  const normalizedStatus = normalizeStringValue(status, "title")?.replace(/\s/g, '');
  if (normalizedStatus && Object.values(AccountStatus).includes(normalizedStatus as AccountStatus)) {
    return normalizedStatus as AccountStatus;
  }
  // Common mappings
  if (status.toLowerCase().includes("active")) return AccountStatus.Active;
  if (status.toLowerCase().includes("inactive")) return AccountStatus.Inactive;
  if (status.toLowerCase().includes("closed")) return AccountStatus.Closed;
  if (status.toLowerCase().includes("pending")) return AccountStatus.PendingVerification;
  return AccountStatus.Suspended;
}

/**
 * Converts a string to a valid TransactionType enum.
 */
function toTransactionTypeEnum(type: string | null | undefined, isDebit: boolean): TransactionType {
  if (type) {
    const normalizedType = normalizeStringValue(type, "title")?.replace(/\s/g, '');
    if (normalizedType && Object.values(TransactionType).includes(normalizedType as TransactionType)) {
      return normalizedType as TransactionType;
    }
  }
  return isDebit ? TransactionType.Debit : TransactionType.Credit;
}

/**
 * Converts a string to a valid TransactionStatus enum.
 */
function toTransactionStatusEnum(status: string | null | undefined): TransactionStatus {
  if (!status) {
    return TransactionStatus.Pending;
  }
  const normalizedStatus = normalizeStringValue(status, "title")?.replace(/\s/g, '');
  if (normalizedStatus && Object.values(TransactionStatus).includes(normalizedStatus as TransactionStatus)) {
    return normalizedStatus as TransactionStatus;
  }
  // Common mappings
  if (status.toLowerCase().includes("succeeded") || status.toLowerCase().includes("succeeded")) return TransactionStatus.Posted;
  if (status.toLowerCase().includes("failed") || status.toLowerCase().includes("declined")) return TransactionStatus.Failed;
  if (status.toLowerCase().includes("refunded")) return TransactionStatus.Refunded;
  if (status.toLowerCase().includes("cancelled")) return TransactionStatus.Canceled;
  if (status.toLowerCase().includes("authorized")) return TransactionStatus.Authorized;
  return TransactionStatus.Pending;
}

/**
 * Converts a string to a valid PaymentMethodType enum.
 */
function toPaymentMethodTypeEnum(type: string | null | undefined): PaymentMethodType {
  if (!type) {
    return PaymentMethodType.Unknown;
  }
  const normalizedType = normalizeStringValue(type, "title")?.replace(/\s/g, '');
  if (normalizedType && Object.values(PaymentMethodType).includes(normalizedType as PaymentMethodType)) {
    return normalizedType as PaymentMethodType;
  }
  // Handle common aliases
  if (type.toLowerCase().includes("credit card") || type.toLowerCase().includes("card")) return PaymentMethodType.CreditCard;
  if (type.toLowerCase().includes("debit card")) return PaymentMethodType.DebitCard;
  if (type.toLowerCase().includes("ach")) return PaymentMethodType.ACH;
  if (type.toLowerCase().includes("wire")) return PaymentMethodType.Wire;
  if (type.toLowerCase().includes("sepa")) return PaymentMethodType.SEPA;
  if (type.toLowerCase().includes("bacs")) return PaymentMethodType.BACS;
  if (type.toLowerCase().includes("interac")) return PaymentMethodType.Interac;
  if (type.toLowerCase().includes("pix")) return PaymentMethodType.Pix;
  if (type.toLowerCase().includes("faster payments")) return PaymentMethodType.FasterPayments;
  if (type.toLowerCase().includes("swift")) return PaymentMethodType.SWIFT;
  if (type.toLowerCase().includes("rtp")) return PaymentMethodType.RTP;
  if (type.toLowerCase().includes("check")) return PaymentMethodType.Check;
  if (type.toLowerCase().includes("wallet")) return PaymentMethodType.Wallet;
  if (type.toLowerCase().includes("crypto")) return PaymentMethodType.Crypto;

  return PaymentMethodType.Unknown;
}

/**
 * Converts a string to a valid PaymentStatus enum.
 */
function toPaymentStatusEnum(status: string | null | undefined): PaymentStatus {
  if (!status) {
    return PaymentStatus.Pending;
  }
  const normalizedStatus = normalizeStringValue(status, "title")?.replace(/\s/g, '');
  if (normalizedStatus && Object.values(PaymentStatus).includes(normalizedStatus as PaymentStatus)) {
    return normalizedStatus as PaymentStatus;
  }
  // Handle common aliases from different systems
  if (status.toLowerCase().includes("succeeded") || status.toLowerCase().includes("paid") || status.toLowerCase().includes("completed")) return PaymentStatus.Completed;
  if (status.toLowerCase().includes("failed") || status.toLowerCase().includes("declined") || status.toLowerCase().includes("denied")) return PaymentStatus.Failed;
  if (status.toLowerCase().includes("requires_action") || status.toLowerCase().includes("requires_confirmation")) return PaymentStatus.RequiresAction;
  if (status.toLowerCase().includes("canceled")) return PaymentStatus.Canceled;
  if (status.toLowerCase().includes("processing")) return PaymentStatus.Processing;
  if (status.toLowerCase().includes("refunded")) return PaymentStatus.Refunded;
  return PaymentStatus.Pending;
}

/**
 * Converts string or string array to TransactionCategory enum.
 */
function toTransactionCategoryEnum(category: string | string[] | null | undefined): TransactionCategory {
  if (!category) {
    return TransactionCategory.Unknown;
  }
  const categoryString = Array.isArray(category) ? category[0] : category;
  const normalizedCategory = normalizeStringValue(categoryString, "title")?.replace(/\s/g, '');

  // Map common terms to our categories
  const categoryMap: Record<string, TransactionCategory> = {
    "Transfer": TransactionCategory.Transfers,
    "Payment": TransactionCategory.Payments,
    "Food": TransactionCategory.FoodAndDrink,
    "Restaurant": TransactionCategory.FoodAndDrink,
    "Groceries": TransactionCategory.FoodAndDrink,
    "Shopping": TransactionCategory.Shopping,
    "Retail": TransactionCategory.Shopping,
    "Travel": TransactionCategory.Travel,
    "Airline": TransactionCategory.Travel,
    "Hotel": TransactionCategory.Travel,
    "Utilities": TransactionCategory.Utilities,
    "Rent": TransactionCategory.Rent,
    "Mortgage": TransactionCategory.Mortgage,
    "Salary": TransactionCategory.Salary,
    "Investment": TransactionCategory.Investments,
    "Healthcare": TransactionCategory.Healthcare,
    "Medical": TransactionCategory.Healthcare,
    "Education": TransactionCategory.Education,
    "Entertainment": TransactionCategory.Entertainment,
    "Subscriptions": TransactionCategory.Subscription,
    "Fees": TransactionCategory.BillsAndFees,
    "Business": TransactionCategory.BusinessExpenses,
    "CashAdvance": TransactionCategory.Cash,
    "Automotive": TransactionCategory.Automotive,
    "Car": TransactionCategory.Automotive,
    "Insurance": TransactionCategory.Insurance,
    "Donation": TransactionCategory.Donations,
    "Refund": TransactionCategory.Refunds,
    "Deposit": TransactionCategory.Deposits,
    "Withdrawal": TransactionCategory.Withdrawals,
    "Gambling": TransactionCategory.Gambling,
    "PersonalCare": TransactionCategory.PersonalCare,
    "HomeImprovement": TransactionCategory.HomeImprovement,
    "Pets": TransactionCategory.Pets,
    "Subscription": TransactionCategory.Subscription,
    "Freelance": TransactionCategory.Freelance,
    "Tax": TransactionCategory.Tax,
    "Payroll": TransactionCategory.Payroll,
  };

  return (normalizedCategory && categoryMap[normalizedCategory]) || (Object.values(TransactionCategory).includes(normalizedCategory as TransactionCategory) ? normalizedCategory as TransactionCategory : TransactionCategory.Unknown);
}

/**
 * Helper to convert various address formats to unified Address.
 */
function toUnifiedAddress(rawAddress: any, type: AddressType = AddressType.Residential): Address | undefined {
  if (!rawAddress) return undefined;

  let street1: string | undefined;
  let street2: string | undefined;
  let city: string | undefined;
  let state: string | undefined;
  let postalCode: string | undefined;
  let country: string | undefined;

  if (rawAddress.line1) { // Stripe like
    street1 = rawAddress.line1;
    street2 = rawAddress.line2;
    city = rawAddress.city;
    state = rawAddress.state;
    postalCode = rawAddress.postal_code;
    country = rawAddress.country;
  } else if (rawAddress.street) { // Plaid like
    street1 = rawAddress.street;
    city = rawAddress.city;
    state = rawAddress.region;
    postalCode = rawAddress.postal_code;
    country = rawAddress.country;
  }

  const normalizedStreet1 = normalizeStringValue(street1);
  const normalizedStreet2 = normalizeStringValue(street2);
  const normalizedCity = normalizeStringValue(city);
  const normalizedState = normalizeStringValue(state);
  const normalizedPostalCode = normalizeStringValue(postalCode);
  const normalizedCountry = normalizeStringValue(country, "upper");

  if (normalizedStreet1 && normalizedCity && normalizedPostalCode && normalizedCountry) {
    return {
      addressType: type,
      street1: normalizedStreet1,
      street2: normalizedStreet2,
      city: normalizedCity,
      state: normalizedState,
      postalCode: normalizedPostalCode,
      country: normalizedCountry,
    };
  }
  return undefined;
}
//endregion

//region Transformation Layer
const ORGANIZATION_ID = "citibankdemobusiness.dev"; // Owner base URL implies this ID

/**
 * Transforms raw customer data from Stripe, Plaid, or Modern Treasury into a UnifiedCustomer model.
 */
function toUnifiedCustomer(
  sourceData: StripeRawCustomer | PlaidRawCustomerIdentity | ModernTreasuryRawCounterparty,
  sourcePartner: SourcePartner,
): UnifiedCustomer {
  const now = parseDateToISO(new Date())!;
  const baseEntity: BaseEntity = {
    id: generateUUIDv4(), // Generate new ID for unified entity
    createdAt: now,
    updatedAt: now,
    organizationId: ORGANIZATION_ID,
    sourcePartner: sourcePartner,
    sourceId: "", // Will be filled below
    metadata: { originalSourceType: sourcePartner },
  };

  let customer: Partial<UnifiedCustomer> = {
    entityType: FinancialEntityType.Customer,
    emails: [],
    phones: [],
    addresses: [],
    kycStatus: KYCStatus.NotStarted,
    riskLevel: RiskLevel.Undetermined,
    internalRiskScore: 0,
  };

  if (sourcePartner === SourcePartner.Stripe) {
    const stripeCustomer = sourceData as StripeRawCustomer;
    baseEntity.sourceId = stripeCustomer.id;
    baseEntity.createdAt = parseDateToISO(stripeCustomer.created * 1000) || now;
    baseEntity.metadata = { ...baseEntity.metadata, ...stripeCustomer.metadata };
    baseEntity.updatedAt = baseEntity.createdAt; // Stripe customer object might not have explicit updated_at

    customer.fullName = normalizeStringValue(stripeCustomer.name);
    customer.description = normalizeStringValue(stripeCustomer.description);

    if (stripeCustomer.email && isValidEmail(stripeCustomer.email)) {
      customer.emails!.push({ email: normalizeStringValue(stripeCustomer.email)!, emailType: EmailType.Personal, isPrimary: true, verified: true });
    }
    if (stripeCustomer.phone) {
      customer.phones!.push({ phoneNumber: normalizeStringValue(stripeCustomer.phone)!, phoneType: PhoneType.Mobile, isPrimary: true });
    }
    if (stripeCustomer.address) {
      const address = toUnifiedAddress(stripeCustomer.address, AddressType.Billing);
      if (address) customer.addresses!.push({ ...address, isPrimary: true });
    }
    if (stripeCustomer.shipping?.address) {
      const shippingAddress = toUnifiedAddress(stripeCustomer.shipping.address, AddressType.Shipping);
      if (shippingAddress) customer.addresses!.push(shippingAddress);
    }
    if (stripeCustomer.tax_ids && stripeCustomer.tax_ids.length > 0) {
      customer.taxId = normalizeStringValue(stripeCustomer.tax_ids[0].value); // Assuming first is primary
    }
    customer.displayName = customer.fullName || customer.emails?.[0]?.email || stripeCustomer.id;
    customer.kycStatus = KYCStatus.InProgress; // Stripe customers usually have some basic info
    customer.riskLevel = stripeCustomer.balance > 0 ? RiskLevel.Medium : RiskLevel.Low; // Example heuristic
    customer.internalRiskScore = customer.riskLevel === RiskLevel.High ? 80 : (customer.riskLevel === RiskLevel.Medium ? 50 : 20);

  } else if (sourcePartner === SourcePartner.Plaid) {
    const plaidIdentity = sourceData as PlaidRawCustomerIdentity;
    baseEntity.sourceId = plaidIdentity.item_id; // Plaid Item ID as the source ID for identity
    // Plaid identity doesn't have explicit created/updated, so use current time
    baseEntity.metadata = { ...baseEntity.metadata, plaidRequestId: plaidIdentity.request_id };
    baseEntity.updatedAt = now;

    let primaryName = "";
    if (plaidIdentity.identity.accounts.length > 0 && plaidIdentity.identity.accounts[0].owners.length > 0) {
      const owner = plaidIdentity.identity.accounts[0].owners[0];
      if (owner.names && owner.names.length > 0) {
        primaryName = owner.names[0];
        const names = primaryName.split(' ');
        if (names.length > 1) {
          customer.firstName = normalizeStringValue(names[0]);
          customer.lastName = normalizeStringValue(names[names.length - 1]);
        } else {
          customer.firstName = normalizeStringValue(names[0]);
        }
        customer.fullName = normalizeStringValue(primaryName);
      }

      owner.emails.forEach(email => {
        if (email.data && isValidEmail(email.data)) {
          customer.emails!.push({
            email: normalizeStringValue(email.data)!,
            emailType: normalizeStringValue(email.type) as EmailType || EmailType.Personal,
            isPrimary: email.primary,
            verified: true
          });
        }
      });
      owner.phone_numbers.forEach(phone => {
        if (phone.data) {
          customer.phones!.push({
            phoneNumber: normalizeStringValue(phone.data)!,
            phoneType: normalizeStringValue(phone.type) as PhoneType || PhoneType.Mobile,
            isPrimary: phone.primary,
          });
        }
      });
      owner.addresses.forEach(address => {
        const unifiedAddress = toUnifiedAddress(address.data, AddressType.Residential);
        if (unifiedAddress) {
          customer.addresses!.push({ ...unifiedAddress, isPrimary: address.primary });
        }
      });
    }
    customer.displayName = customer.fullName || customer.firstName || customer.emails?.[0]?.email || plaidIdentity.item_id;
    customer.kycStatus = KYCStatus.Approved; // Plaid identity implies verification has occurred
    customer.riskLevel = RiskLevel.Low; // Default for Plaid identity data, adjust based on further analysis
    customer.internalRiskScore = 10;

  } else if (sourcePartner === SourcePartner.ModernTreasury) {
    const mtCounterparty = sourceData as ModernTreasuryRawCounterparty;
    baseEntity.sourceId = mtCounterparty.id;
    baseEntity.createdAt = parseDateToISO(mtCounterparty.created_at) || now;
    baseEntity.updatedAt = parseDateToISO(mtCounterparty.updated_at) || now;
    baseEntity.metadata = { ...baseEntity.metadata, ...mtCounterparty.metadata };

    customer.companyName = normalizeStringValue(mtCounterparty.name);
    customer.displayName = normalizeStringValue(mtCounterparty.name) || mtCounterparty.id;
    if (mtCounterparty.email && isValidEmail(mtCounterparty.email)) {
      customer.emails!.push({ email: normalizeStringValue(mtCounterparty.email)!, emailType: EmailType.Business, isPrimary: true, verified: true });
    }
    if (mtCounterparty.tax_identifier) {
      customer.taxId = normalizeStringValue(mtCounterparty.tax_identifier);
    }
    customer.kycStatus = KYCStatus.Approved; // Modern Treasury counterparties are usually vetted
    customer.riskLevel = RiskLevel.Medium; // Placeholder, might need more context
    customer.internalRiskScore = 40;
  }

  // Ensure displayName is set
  customer.displayName = customer.displayName || baseEntity.sourceId;

  return { ...baseEntity, ...customer } as UnifiedCustomer;
}

/**
 * Transforms raw account data from Stripe, Plaid, or Modern Treasury into a UnifiedAccount model.
 */
function toUnifiedAccount(
  sourceData: StripeRawAccount | PlaidRawAccount | ModernTreasuryRawAccount,
  sourcePartner: SourcePartner,
  customerId?: string // Optional: if already known
): UnifiedAccount {
  const now = parseDateToISO(new Date())!;
  const baseEntity: BaseEntity = {
    id: generateUUIDv4(),
    createdAt: now,
    updatedAt: now,
    organizationId: ORGANIZATION_ID,
    sourcePartner: sourcePartner,
    sourceId: "",
    metadata: { originalSourceType: sourcePartner },
  };

  let account: Partial<UnifiedAccount> = {
    entityType: FinancialEntityType.Account,
    customerId: customerId || "unknown_customer", // Placeholder if not provided
    currency: Currency.UNKNOWN,
    currentBalance: toUnifiedAmount(0, "USD"),
    status: AccountStatus.PendingVerification,
    mask: "xxxx",
    verified: false,
    internalRiskScore: 0,
  };

  if (sourcePartner === SourcePartner.Stripe) {
    const stripeAccount = sourceData as StripeRawAccount;
    baseEntity.sourceId = stripeAccount.id;
    baseEntity.createdAt = parseDateToISO(stripeAccount.created * 1000) || now;
    baseEntity.updatedAt = baseEntity.createdAt; // Stripe account objects don't always have explicit updated_at
    baseEntity.metadata = { ...baseEntity.metadata, ...stripeAccount.metadata };

    account.name = normalizeStringValue(stripeAccount.business_profile?.name || `Stripe Account ${stripeAccount.id}`)!;
    account.accountType = AccountType.Wallet; // Stripe connected accounts are like wallets
    account.currency = toCurrencyEnum(stripeAccount.country === "US" ? "USD" : "UNKNOWN"); // More complex logic needed for international Stripe accounts
    account.status = stripeAccount.charges_enabled && stripeAccount.payouts_enabled ? AccountStatus.Active : AccountStatus.Inactive;
    account.verified = stripeAccount.details_submitted;
    account.country = normalizeStringValue(stripeAccount.country, "upper");

    // Attempt to extract payment instrument info from external_accounts if available
    if (stripeAccount.external_accounts && stripeAccount.external_accounts.data.length > 0) {
      const primaryExternalAccount = stripeAccount.external_accounts.data[0]; // Take the first one
      if (primaryExternalAccount.object === "bank_account") {
        account.accountType = AccountType.ExternalBankAccount;
        account.mask = primaryExternalAccount.last4 || "xxxx";
        account.bankName = normalizeStringValue(primaryExternalAccount.bank_name);
        account.routingNumber = normalizeStringValue(primaryExternalAccount.routing_number);
        account.currency = toCurrencyEnum(primaryExternalAccount.currency);
        account.holderName = normalizeStringValue(primaryExternalAccount.account_holder_name);
        account.accountOwnershipType = primaryExternalAccount.account_holder_type;
        account.status = toAccountStatusEnum(primaryExternalAccount.status);
        account.verified = primaryExternalAccount.status === "verified";
      }
      // Card types not usually 'accounts' in this context but could be payment instruments.
    }
    account.internalRiskScore = account.status === AccountStatus.Active ? 20 : 60; // Example
  } else if (sourcePartner === SourcePartner.Plaid) {
    const plaidAccount = sourceData as PlaidRawAccount;
    baseEntity.sourceId = plaidAccount.account_id;
    // Plaid accounts don't directly have created/updated timestamps
    baseEntity.metadata = { ...baseEntity.metadata };
    baseEntity.updatedAt = now;

    account.name = normalizeStringValue(plaidAccount.official_name || plaidAccount.name)!;
    account.accountType = toAccountTypeEnum(plaidAccount.subtype || plaidAccount.type);
    account.currency = toCurrencyEnum(plaidAccount.balances.iso_currency_code);
    account.mask = plaidAccount.mask || "xxxx";
    account.status = AccountStatus.Active; // Plaid accounts are generally active when fetched
    account.verified = true; // Assumed verified by Plaid connection
    account.currentBalance = toUnifiedAmount(plaidAccount.balances.current || 0, account.currency.toString());
    account.availableBalance = toUnifiedAmount(plaidAccount.balances.available || 0, account.currency.toString());
    // Plaid doesn't typically provide routing/IBAN directly via default endpoints for security reasons
    account.internalRiskScore = 10;
  } else if (sourcePartner === SourcePartner.ModernTreasury) {
    const mtAccount = sourceData as ModernTreasuryRawAccount;
    baseEntity.sourceId = mtAccount.id;
    baseEntity.createdAt = parseDateToISO(mtAccount.created_at) || now;
    baseEntity.updatedAt = parseDateToISO(mtAccount.updated_at) || now;
    baseEntity.metadata = { ...baseEntity.metadata, liveMode: mtAccount.live_mode };

    account.name = normalizeStringValue(mtAccount.party_name || mtAccount.name)!;
    account.accountType = toAccountTypeEnum(mtAccount.account_type);
    account.currency = toCurrencyEnum(mtAccount.currency);
    account.status = AccountStatus.Active; // MT accounts are typically active if returned
    account.verified = true; // Assumed
    account.holderName = normalizeStringValue(mtAccount.party_name);
    account.accountOwnershipType = mtAccount.party_type;
    account.country = normalizeStringValue(mtAccount.country, "upper");

    // Extract account and routing details
    if (mtAccount.account_details && mtAccount.account_details.length > 0) {
      const primaryDetail = mtAccount.account_details[0];
      if (primaryDetail.account_number_type === "iban") {
        account.iban = primaryDetail.account_number;
      } else {
        account.mask = primaryDetail.account_number.slice(-4);
      }
    }
    if (mtAccount.routing_details && mtAccount.routing_details.length > 0) {
      const primaryRouting = mtAccount.routing_details[0];
      if (primaryRouting.routing_number_type === "aba") {
        account.routingNumber = primaryRouting.routing_number;
      } else if (primaryRouting.routing_number_type === "swift") {
        account.swiftCode = primaryRouting.routing_number;
      }
    }

    // Balances
    account.currentBalance = toUnifiedAmount(mtAccount.balances.current_balance.amount, mtAccount.balances.current_balance.currency);
    account.availableBalance = toUnifiedAmount(mtAccount.balances.available_balance.amount, mtAccount.balances.available_balance.currency);
    account.pendingBalance = toUnifiedAmount(mtAccount.balances.pending_debits.amount - mtAccount.balances.pending_credits.amount, mtAccount.balances.current_balance.currency);
    account.internalRiskScore = 30;
  }

  return { ...baseEntity, ...account } as UnifiedAccount;
}


/**
 * Transforms raw transaction data from Stripe, Plaid, or Modern Treasury into a UnifiedTransaction model.
 */
function toUnifiedTransaction(
  sourceData: StripeRawTransaction | PlaidRawTransaction | ModernTreasuryRawPaymentOrder,
  sourcePartner: SourcePartner,
  accountId?: string // Optional: if already known, useful for Plaid
): UnifiedTransaction {
  const now = parseDateToISO(new Date())!;
  const baseEntity: BaseEntity = {
    id: generateUUIDv4(),
    createdAt: now,
    updatedAt: now,
    organizationId: ORGANIZATION_ID,
    sourcePartner: sourcePartner,
    sourceId: "",
    metadata: { originalSourceType: sourcePartner },
  };

  let transaction: Partial<UnifiedTransaction> = {
    entityType: FinancialEntityType.Transaction,
    accountId: accountId || "unknown_account",
    description: "No description provided",
    amount: toUnifiedAmount(0, "USD"),
    transactionType: TransactionType.Unknown,
    status: TransactionStatus.Pending,
    postedDate: now,
    category: TransactionCategory.Unknown,
    fraudScore: 0,
    anomalyReports: [],
  };

  if (sourcePartner === SourcePartner.Stripe) {
    const stripeTx = sourceData as StripeRawTransaction;
    baseEntity.sourceId = stripeTx.id;
    baseEntity.createdAt = parseDateToISO(stripeTx.created * 1000) || now;
    baseEntity.updatedAt = baseEntity.createdAt; // Stripe 'created' is often the only timestamp
    baseEntity.metadata = { ...baseEntity.metadata, ...stripeTx.metadata };

    transaction.description = normalizeStringValue(stripeTx.description || stripeTx.object) || "Stripe transaction";
    transaction.amount = toUnifiedAmount(stripeTx.amount, stripeTx.currency, stripeTx.object === "charge" || stripeTx.object === "transfer");
    transaction.status = toTransactionStatusEnum(stripeTx.status);
    transaction.postedDate = baseEntity.createdAt; // Stripe 'created' is usually 'posted'
    transaction.merchantName = normalizeStringValue(stripeTx.billing_details?.name || stripeTx.receipt_email);
    transaction.paymentId = stripeTx.payment_intent || (stripeTx.object === "charge" ? stripeTx.id : undefined); // Link to payment intent/charge if available

    if (stripeTx.object === "charge") {
      transaction.transactionType = TransactionType.Purchase;
      if (stripeTx.amount < 0) transaction.transactionType = TransactionType.Refund; // Should be positive for charges, refunds are separate objects
    } else if (stripeTx.object === "payout") {
      transaction.transactionType = TransactionType.Withdrawal; // Or disbursement
    } else if (stripeTx.object === "transfer") {
      transaction.transactionType = TransactionType.Transfer;
    } else if (stripeTx.object === "refund") {
      transaction.transactionType = TransactionType.Refund;
      if (stripeTx.charge) transaction.relatedTransactionId = stripeTx.charge;
    }

    transaction.category = toTransactionCategoryEnum(transaction.description);
    transaction.counterparty = {
      name: normalizeStringValue(stripeTx.customer || stripeTx.billing_details?.name || stripeTx.receipt_email || "Unknown Customer")!,
      id: stripeTx.customer,
      type: stripeTx.customer ? "customer" : "other"
    };

    if (stripeTx.billing_details?.address) {
      transaction.location = toUnifiedAddress(stripeTx.billing_details.address);
    }

  } else if (sourcePartner === SourcePartner.Plaid) {
    const plaidTx = sourceData as PlaidRawTransaction;
    baseEntity.sourceId = plaidTx.transaction_id;
    baseEntity.createdAt = parseDateToISO(plaidTx.date) || now;
    baseEntity.updatedAt = parseDateToISO(plaidTx.datetime || plaidTx.date) || now;
    baseEntity.metadata = { ...baseEntity.metadata, plaidPendingTransactionId: plaidTx.pending_transaction_id };

    transaction.accountId = plaidTx.account_id; // Plaid transactions are account-specific
    transaction.description = normalizeStringValue(plaidTx.name)!;
    // Plaid amount is positive for debits (money spent), negative for credits (money received).
    // Our Amount.isDebit reflects this directly. Amount.value is always positive.
    transaction.amount = toUnifiedAmount(plaidTx.amount * 100, plaidTx.iso_currency_code || plaidTx.unofficial_currency_code || "USD", plaidTx.amount > 0);
    transaction.status = plaidTx.pending ? TransactionStatus.Pending : TransactionStatus.Posted;
    transaction.postedDate = parseDateToISO(plaidTx.date)!;
    transaction.effectiveDate = parseDateToISO(plaidTx.datetime);
    transaction.authorizedDate = parseDateToISO(plaidTx.authorized_date || plaidTx.authorized_datetime);
    transaction.merchantName = normalizeStringValue(plaidTx.merchant_name);
    transaction.category = toTransactionCategoryEnum(plaidTx.personal_finance_category?.primary || plaidTx.category);
    transaction.subCategory = normalizeStringValue(plaidTx.personal_finance_category?.detailed || plaidTx.category?.[1]);

    transaction.counterparty = {
      name: normalizeStringValue(plaidTx.merchant_name || plaidTx.name)!,
      type: plaidTx.merchant_name ? "merchant" : "other"
    };

    if (plaidTx.location.address || plaidTx.location.city) {
      transaction.location = toUnifiedAddress(plaidTx.location);
    }
    transaction.transactionType = transaction.amount.isDebit ? TransactionType.Debit : TransactionType.Credit;

  } else if (sourcePartner === SourcePartner.ModernTreasury) {
    const mtPaymentOrder = sourceData as ModernTreasuryRawPaymentOrder;
    baseEntity.sourceId = mtPaymentOrder.id;
    baseEntity.createdAt = parseDateToISO(mtPaymentOrder.created_at) || now;
    baseEntity.updatedAt = parseDateToISO(mtPaymentOrder.updated_at) || now;
    baseEntity.metadata = { ...baseEntity.metadata };

    transaction.accountId = mtPaymentOrder.originating_account_id; // For outbound payment orders
    // If it's an expected payment (inbound), accountId might be internal_account_id
    transaction.description = normalizeStringValue(mtPaymentOrder.description || mtPaymentOrder.remittance_information) || "Modern Treasury Payment";
    transaction.amount = toUnifiedAmount(mtPaymentOrder.amount, mtPaymentOrder.currency, mtPaymentOrder.direction === "debit");
    transaction.status = toTransactionStatusEnum(mtPaymentOrder.status);
    transaction.postedDate = baseEntity.createdAt;
    transaction.transactionType = transaction.amount.isDebit ? TransactionType.Payment : TransactionType.Deposit; // Specific to MT payment orders
    transaction.category = TransactionCategory.Payments;
    transaction.paymentId = mtPaymentOrder.id; // Link to the payment order

    transaction.counterparty = {
      name: `MT Counterparty ${mtPaymentOrder.receiving_account_id}`, // Placeholder, actual counterparty data would be fetched separately
      accountIdentifier: mtPaymentOrder.receiving_account_id,
      type: "bank"
    };
  }

  return { ...baseEntity, ...transaction } as UnifiedTransaction;
}

/**
 * Transforms raw payment data from Stripe, Modern Treasury into a UnifiedPayment model.
 * Note: Plaid provides transactions, but not specific 'payments' in the same sense as Stripe PaymentIntents or MT PaymentOrders.
 */
function toUnifiedPayment(
  sourceData: StripeRawTransaction | ModernTreasuryRawPaymentOrder | ModernTreasuryRawExpectedPayment,
  sourcePartner: SourcePartner,
  customerId?: string, // Optional
  accountId?: string // Optional
): UnifiedPayment {
  const now = parseDateToISO(new Date())!;
  const baseEntity: BaseEntity = {
    id: generateUUIDv4(),
    createdAt: now,
    updatedAt: now,
    organizationId: ORGANIZATION_ID,
    sourcePartner: sourcePartner,
    sourceId: "",
    metadata: { originalSourceType: sourcePartner },
  };

  let payment: Partial<UnifiedPayment> = {
    entityType: FinancialEntityType.Payment,
    customerId: customerId,
    paymentDirection: PaymentDirection.Outbound, // Default, will be updated
    amount: toUnifiedAmount(0, "USD"),
    currency: Currency.UNKNOWN,
    status: PaymentStatus.Pending,
    paymentMethodType: PaymentMethodType.Unknown,
    transactionIds: [],
    anomalyReports: [],
  };

  if (sourcePartner === SourcePartner.Stripe) {
    const stripeTx = sourceData as StripeRawTransaction;
    baseEntity.sourceId = stripeTx.id;
    baseEntity.createdAt = parseDateToISO(stripeTx.created * 1000) || now;
    baseEntity.updatedAt = baseEntity.createdAt;
    baseEntity.metadata = { ...baseEntity.metadata, ...stripeTx.metadata };

    payment.amount = toUnifiedAmount(stripeTx.amount, stripeTx.currency, stripeTx.object === "charge");
    payment.currency = toCurrencyEnum(stripeTx.currency);
    payment.status = toPaymentStatusEnum(stripeTx.status);
    payment.description = normalizeStringValue(stripeTx.description);
    payment.statementDescriptor = normalizeStringValue(stripeTx.description); // Stripe's description often serves as this
    payment.transactionIds = [stripeTx.id]; // Link to itself as a transaction

    if (stripeTx.object === "charge") {
      payment.paymentDirection = PaymentDirection.Inbound;
      payment.paymentMethodType = toPaymentMethodTypeEnum(stripeTx.payment_method); // Needs more detailed lookup
      payment.customerId = stripeTx.customer || payment.customerId;
      payment.counterparty = {
        id: stripeTx.customer,
        name: normalizeStringValue(stripeTx.billing_details?.name || stripeTx.receipt_email || "Stripe Payer")!,
        type: stripeTx.customer ? "customer" : "other",
      };
      // For Stripe, if customer has a default source, it's the payment method.
      // Else, the `payment_method` on the charge.
    } else if (stripeTx.object === "payout" || stripeTx.object === "transfer") {
      payment.paymentDirection = PaymentDirection.Outbound;
      payment.paymentMethodType = PaymentMethodType.ACH; // Payouts are often ACH/bank
      payment.receivingAccountId = stripeTx.destination_payment || stripeTx.destination;
      payment.counterparty = {
        name: `Stripe Payee ${stripeTx.destination || stripeTx.destination_payment}`,
        accountIdentifier: stripeTx.destination || stripeTx.destination_payment,
        type: "bank",
      };
    } else if (stripeTx.object === "refund") {
      payment.paymentDirection = PaymentDirection.Outbound; // Refund is money leaving
      payment.paymentMethodType = toPaymentMethodTypeEnum(stripeTx.charge ? "charge_refund" : "unknown");
      payment.transactionIds = [stripeTx.charge!, stripeTx.id].filter(Boolean); // Original charge and refund transaction
    }

  } else if (sourcePartner === SourcePartner.ModernTreasury) {
    const mtPayment = sourceData as ModernTreasuryRawPaymentOrder | ModernTreasuryRawExpectedPayment;
    baseEntity.sourceId = mtPayment.id;
    baseEntity.createdAt = parseDateToISO(mtPayment.created_at) || now;
    baseEntity.updatedAt = parseDateToISO(mtPayment.updated_at) || now;
    baseEntity.metadata = { ...baseEntity.metadata };

    payment.currency = toCurrencyEnum(mtPayment.currency);
    payment.status = toPaymentStatusEnum(mtPayment.status);
    payment.description = normalizeStringValue(mtPayment.description);

    if ("direction" in mtPayment) { // ModernTreasuryRawPaymentOrder
      const mtPaymentOrder = mtPayment as ModernTreasuryRawPaymentOrder;
      payment.paymentDirection = mtPaymentOrder.direction === "debit" ? PaymentDirection.Outbound : PaymentDirection.Inbound;
      payment.amount = toUnifiedAmount(mtPaymentOrder.amount, mtPaymentOrder.currency, mtPaymentOrder.direction === "debit");
      payment.initiatingAccountId = mtPaymentOrder.originating_account_id;
      payment.receivingAccountId = mtPaymentOrder.receiving_account_id;
      payment.paymentMethodType = toPaymentMethodTypeEnum(mtPaymentOrder.type);
      payment.transactionIds = [mtPaymentOrder.id]; // Link to payment order as a transaction
      payment.counterparty = {
        id: mtPaymentOrder.counterparty_id,
        name: `MT Counterparty ${mtPaymentOrder.counterparty_id || mtPaymentOrder.receiving_account_id}`,
        accountIdentifier: mtPaymentOrder.receiving_account_id,
        type: "bank",
      };
    } else { // ModernTreasuryRawExpectedPayment (inbound payment to be received)
      const mtExpectedPayment = mtPayment as ModernTreasuryRawExpectedPayment;
      payment.paymentDirection = PaymentDirection.Inbound;
      payment.amount = toUnifiedAmount(mtExpectedPayment.amount_lower_bound, mtExpectedPayment.currency); // Use lower bound for expected
      payment.receivingAccountId = mtExpectedPayment.internal_account_id;
      payment.paymentMethodType = toPaymentMethodTypeEnum(mtExpectedPayment.type);
      payment.counterparty = {
        id: mtExpectedPayment.counterparty_id,
        name: `MT Expected Payer ${mtExpectedPayment.counterparty_id}`,
        type: "bank",
      };
    }
  }

  return { ...baseEntity, ...payment } as UnifiedPayment;
}
//endregion

//region Validation Layer
/**
 * Validates a UnifiedCustomer object.
 */
function validateUnifiedCustomer(customer: UnifiedCustomer): ValidationResult {
  const errors: string[] = [];

  if (!customer.id) errors.push("Customer ID is required.");
  if (!customer.organizationId) errors.push("Organization ID is required.");
  if (!customer.sourceId) errors.push("Source ID is required.");
  if (!customer.sourcePartner || !Object.values(SourcePartner).includes(customer.sourcePartner)) errors.push("Valid source partner is required.");
  if (!customer.createdAt || !isValidISO8601(customer.createdAt)) errors.push("Invalid or missing createdAt date.");
  if (!customer.updatedAt || !isValidISO8601(customer.updatedAt)) errors.push("Invalid or missing updatedAt date.");
  if (!customer.displayName) errors.push("Display name is required.");
  if (!customer.emails || customer.emails.length === 0) {
    errors.push("At least one email contact is required.");
  } else {
    customer.emails.forEach((email, index) => {
      if (!email.email || !isValidEmail(email.email)) {
        errors.push(`Email contact ${index} has an invalid email address.`);
      }
      if (email.emailType && !Object.values(EmailType).includes(email.emailType)) {
        errors.push(`Email contact ${index} has an invalid email type.`);
      }
    });
  }
  if (!customer.addresses || customer.addresses.length === 0) {
    errors.push("At least one address is required.");
  } else {
    customer.addresses.forEach((address, index) => {
      if (!address.street1) errors.push(`Address ${index} is missing street1.`);
      if (!address.city) errors.push(`Address ${index} is missing city.`);
      if (!address.postalCode) errors.push(`Address ${index} is missing postal code.`);
      if (!address.country) errors.push(`Address ${index} is missing country.`);
      if (address.addressType && !Object.values(AddressType).includes(address.addressType)) {
        errors.push(`Address ${index} has an invalid address type.`);
      }
    });
  }
  if (!Object.values(KYCStatus).includes(customer.kycStatus)) errors.push("Invalid KYC status.");
  if (!Object.values(RiskLevel).includes(customer.riskLevel)) errors.push("Invalid risk level.");

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates a UnifiedAccount object.
 */
function validateUnifiedAccount(account: UnifiedAccount): ValidationResult {
  const errors: string[] = [];

  if (!account.id) errors.push("Account ID is required.");
  if (!account.organizationId) errors.push("Organization ID is required.");
  if (!account.sourceId) errors.push("Source ID is required.");
  if (!account.sourcePartner || !Object.values(SourcePartner).includes(account.sourcePartner)) errors.push("Valid source partner is required.");
  if (!account.createdAt || !isValidISO8601(account.createdAt)) errors.push("Invalid or missing createdAt date.");
  if (!account.updatedAt || !isValidISO8601(account.updatedAt)) errors.push("Invalid or missing updatedAt date.");
  if (!account.customerId) errors.push("Customer ID is required for account.");
  if (!account.name) errors.push("Account name is required.");
  if (!Object.values(AccountType).includes(account.accountType)) errors.push("Invalid account type.");
  if (!Object.values(Currency).includes(account.currency)) errors.push("Invalid currency code.");
  if (account.currentBalance.value < 0) errors.push("Current balance value cannot be negative.");
  if (!Object.values(AccountStatus).includes(account.status)) errors.push("Invalid account status.");
  if (!account.mask || account.mask.length !== 4) errors.push("Account mask (last 4 digits) is required and must be 4 characters.");
  if (!account.bankName) errors.push("Bank name is required.");
  if (!account.country) errors.push("Account country is required.");

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates a UnifiedTransaction object.
 */
function validateUnifiedTransaction(transaction: UnifiedTransaction): ValidationResult {
  const errors: string[] = [];

  if (!transaction.id) errors.push("Transaction ID is required.");
  if (!transaction.organizationId) errors.push("Organization ID is required.");
  if (!transaction.sourceId) errors.push("Source ID is required.");
  if (!transaction.sourcePartner || !Object.values(SourcePartner).includes(transaction.sourcePartner)) errors.push("Valid source partner is required.");
  if (!transaction.createdAt || !isValidISO8601(transaction.createdAt)) errors.push("Invalid or missing createdAt date.");
  if (!transaction.updatedAt || !isValidISO8601(transaction.updatedAt)) errors.push("Invalid or missing updatedAt date.");
  if (!transaction.accountId) errors.push("Account ID is required for transaction.");
  if (!transaction.description) errors.push("Transaction description is required.");
  if (transaction.amount.value <= 0) errors.push("Transaction amount must be positive.");
  if (!Object.values(Currency).includes(transaction.amount.currency)) errors.push("Invalid currency for transaction amount.");
  if (!Object.values(TransactionType).includes(transaction.transactionType)) errors.push("Invalid transaction type.");
  if (!Object.values(TransactionStatus).includes(transaction.status)) errors.push("Invalid transaction status.");
  if (!transaction.postedDate || !isValidISO8601(transaction.postedDate)) errors.push("Invalid or missing posted date.");
  if (!Object.values(TransactionCategory).includes(transaction.category)) errors.push("Invalid transaction category.");
  if (!transaction.counterparty?.name) errors.push("Transaction counterparty name is required.");

  if (transaction.location) {
    if (!transaction.location.street1) errors.push("Transaction location is missing street1.");
    if (!transaction.location.city) errors.push("Transaction location is missing city.");
    if (!transaction.location.country) errors.push("Transaction location is missing country.");
    if (transaction.location.addressType && !Object.values(AddressType).includes(transaction.location.addressType)) {
      errors.push(`Transaction location has an invalid address type.`);
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates a UnifiedPayment object.
 */
function validateUnifiedPayment(payment: UnifiedPayment): ValidationResult {
  const errors: string[] = [];

  if (!payment.id) errors.push("Payment ID is required.");
  if (!payment.organizationId) errors.push("Organization ID is required.");
  if (!payment.sourceId) errors.push("Source ID is required.");
  if (!payment.sourcePartner || !Object.values(SourcePartner).includes(payment.sourcePartner)) errors.push("Valid source partner is required.");
  if (!payment.createdAt || !isValidISO8601(payment.createdAt)) errors.push("Invalid or missing createdAt date.");
  if (!payment.updatedAt || !isValidISO8601(payment.updatedAt)) errors.push("Invalid or missing updatedAt date.");
  if (!Object.values(PaymentDirection).includes(payment.paymentDirection)) errors.push("Invalid payment direction.");
  if (payment.amount.value <= 0) errors.push("Payment amount must be positive.");
  if (!Object.values(Currency).includes(payment.currency)) errors.push("Invalid currency for payment.");
  if (!Object.values(PaymentStatus).includes(payment.status)) errors.push("Invalid payment status.");
  if (!Object.values(PaymentMethodType).includes(payment.paymentMethodType)) errors.push("Invalid payment method type.");
  if (!payment.counterparty?.name) errors.push("Payment counterparty name is required.");

  if (payment.paymentDirection === PaymentDirection.Outbound && !payment.initiatingAccountId) {
    errors.push("Initiating account ID is required for outbound payments.");
  }
  if (payment.paymentDirection === PaymentDirection.Inbound && !payment.receivingAccountId) {
    errors.push("Receiving account ID is required for inbound payments.");
  }

  return { isValid: errors.length === 0, errors };
}
//endregion

//region Enrichment Layer
/**
 * Enriches a UnifiedCustomer object with additional data (e.g., credit score, KYC details, derived demographics).
 */
function enrichUnifiedCustomer(customer: UnifiedCustomer, enrichmentData?: Record<string, any>): UnifiedCustomer {
  // Example enrichment: Derive full name if not present
  if (!customer.fullName && customer.firstName && customer.lastName) {
    customer.fullName = `${customer.firstName} ${customer.lastName}`;
  } else if (!customer.fullName && customer.firstName) {
    customer.fullName = customer.firstName;
  } else if (!customer.fullName && customer.companyName) {
    customer.fullName = customer.companyName;
  }

  // Example enrichment: Add a hypothetical credit score or risk factor based on internal logic
  if (enrichmentData?.creditScore !== undefined && typeof enrichmentData.creditScore === 'number') {
    customer.internalRiskScore = enrichmentData.creditScore;
    if (enrichmentData.creditScore < 600) {
      customer.riskLevel = RiskLevel.High;
    } else if (enrichmentData.creditScore < 700) {
      customer.riskLevel = RiskLevel.Medium;
    } else {
      customer.riskLevel = RiskLevel.Low;
    }
  }

  // Example enrichment: Deduplicate addresses or mark primary
  if (customer.addresses.length > 1) {
    // Simple deduplication logic based on street1+city+country
    const uniqueAddresses: Address[] = [];
    const seen = new Set<string>();
    customer.addresses.forEach(addr => {
      const key = `${addr.street1?.toLowerCase()}-${addr.city?.toLowerCase()}-${addr.country?.toLowerCase()}`;
      if (!seen.has(key)) {
        uniqueAddresses.push(addr);
        seen.add(key);
      }
    });
    customer.addresses = uniqueAddresses;
    if (!customer.addresses.some(a => a.isPrimary)) {
      if (customer.addresses.length > 0) {
        customer.addresses[0].isPrimary = true; // Set first unique address as primary
      }
    }
  }

  // Example enrichment: Add internal account IDs from a mapping service
  if (enrichmentData?.internalAccountMappings && Array.isArray(enrichmentData.internalAccountMappings)) {
    const matchedAccountIds = enrichmentData.internalAccountMappings.filter((mapping: any) =>
      (mapping.sourcePartner === customer.sourcePartner && mapping.sourceId === customer.sourceId) ||
      (mapping.email && customer.emails.some(e => e.email === mapping.email))
    ).map((mapping: any) => mapping.internalAccountId);

    if (matchedAccountIds.length > 0) {
      customer.internalAccountIds = Array.from(new Set([...(customer.internalAccountIds || []), ...matchedAccountIds]));
    }
  }

  return customer;
}

/**
 * Enriches a UnifiedTransaction object with additional data (e.g., enhanced categorization, merchant details).
 */
function enrichUnifiedTransaction(transaction: UnifiedTransaction, enrichmentData?: Record<string, any>): UnifiedTransaction {
  // Example enrichment: Enhance category using more sophisticated logic or external data
  if (transaction.category === TransactionCategory.Unknown && enrichmentData?.aiCategorization) {
    transaction.category = toTransactionCategoryEnum(enrichmentData.aiCategorization);
  }

  // Example enrichment: Add merchant details if available
  if (enrichmentData?.merchantLookup && Array.isArray(enrichmentData.merchantLookup) && !transaction.merchantId) {
    const merchant = enrichmentData.merchantLookup.find((m: any) =>
      (transaction.description && transaction.description.toLowerCase().includes(m.name.toLowerCase())) ||
      (transaction.merchantName && transaction.merchantName.toLowerCase().includes(m.name.toLowerCase()))
    );
    if (merchant) {
      transaction.merchantId = merchant.id;
      if (!transaction.merchantName) transaction.merchantName = merchant.name;
      if (!transaction.location && merchant.address) {
        transaction.location = toUnifiedAddress(merchant.address, AddressType.Business);
      }
    }
  }

  // Example: Estimate fraud score based on transaction attributes
  let fraudScore = 0;
  if (transaction.amount.value > 1000000) fraudScore += 20; // Over $10,000
  if (transaction.transactionType === TransactionType.Withdrawal && transaction.amount.value > 500000) fraudScore += 15; // Large withdrawal
  if (transaction.location && transaction.location.country && transaction.location.country !== "US") fraudScore += 10; // International transaction (basic)
  if (transaction.status === TransactionStatus.Declined || transaction.status === TransactionStatus.Failed) fraudScore += 5;

  // Simulate a random element for demo to make scores dynamic
  fraudScore += Math.floor(Math.random() * 10);
  transaction.fraudScore = Math.min(100, fraudScore); // Cap at 100

  return transaction;
}

/**
 * Enriches a UnifiedAccount object (e.g., calculates additional metrics, links statements).
 */
function enrichUnifiedAccount(account: UnifiedAccount, enrichmentData?: Record<string, any>): UnifiedAccount {
  // Example: Link internal statement IDs
  if (enrichmentData?.internalStatementMappings && Array.isArray(enrichmentData.internalStatementMappings)) {
    const matchedStatementIds = enrichmentData.internalStatementMappings
      .filter((mapping: any) => mapping.accountId === account.id)
      .map((mapping: any) => mapping.statementId);
    if (matchedStatementIds.length > 0) {
      account.internalStatementIds = Array.from(new Set([...(account.internalStatementIds || []), ...matchedStatementIds]));
    }
  }

  // Example: Calculate age of account
  if (account.createdAt) {
    const creationDate = new Date(account.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - creationDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    account.metadata = { ...account.metadata, accountAgeDays: diffDays };
  }

  return account;
}

/**
 * Enriches a UnifiedPayment object (e.g., adds processing fees, compliance checks).
 */
function enrichUnifiedPayment(payment: UnifiedPayment, enrichmentData?: Record<string, any>): UnifiedPayment {
  // Example: Add internal processing fee
  if (!payment.internalProcessingFee) {
    // Simulate a fee calculation: 0.5% + $0.30 for ACH, 2.9% + $0.30 for Card
    let feeValue = 0;
    const baseFee = 30; // 30 cents
    switch (payment.paymentMethodType) {
      case PaymentMethodType.ACH:
        feeValue = Math.round(payment.amount.value * 0.005) + baseFee;
        break;
      case PaymentMethodType.CreditCard:
      case PaymentMethodType.DebitCard:
        feeValue = Math.round(payment.amount.value * 0.029) + baseFee;
        break;
      case PaymentMethodType.Wire:
        feeValue = Math.round(payment.amount.value * 0.001) + 1500; // 0.1% + $15.00
        break;
      default:
        feeValue = baseFee;
        break;
    }
    payment.internalProcessingFee = {
      value: feeValue,
      currency: payment.currency,
      isDebit: true, // Fee is a debit to our account
    };
  }

  // Example: Simulate compliance checks
  if (!payment.internalRegulatoryComplianceChecks) {
    payment.internalRegulatoryComplianceChecks = {
      amlCheck: Math.random() > 0.1 ? "pass" : "fail", // 10% chance of failing AML
      sanctionsScreening: Math.random() > 0.05 ? "pass" : "fail", // 5% chance of failing sanctions
    };
    if (payment.internalRegulatoryComplianceChecks.amlCheck === "fail") {
      payment.internalComplianceNotes = [...(payment.internalComplianceNotes || []), "AML check failed."];
      if (payment.status !== PaymentStatus.Failed) payment.status = PaymentStatus.Denied; // Deny payment if compliance fails
    }
    if (payment.internalRegulatoryComplianceChecks.sanctionsScreening === "fail") {
      payment.internalComplianceNotes = [...(payment.internalComplianceNotes || []), "Sanctions screening failed."];
      if (payment.status !== PaymentStatus.Failed) payment.status = PaymentStatus.Denied; // Deny payment if compliance fails
    }
  }

  return payment;
}
//endregion

//region Anomaly Detection Layer
/**
 * Detects anomalies in a UnifiedCustomer profile.
 */
function detectCustomerAnomalies(customer: UnifiedCustomer, historicalData: UnifiedCustomer[] = []): AnomalyReport[] {
  const anomalies: AnomalyReport[] = [];
  const now = parseDateToISO(new Date())!;

  // Rule 1: Rapid change in primary email/phone (if historical data provides)
  const previousCustomer = historicalData.find(c => c.id === customer.id);
  if (previousCustomer) {
    const currentPrimaryEmail = customer.emails.find(e => e.isPrimary)?.email;
    const previousPrimaryEmail = previousCustomer.emails.find(e => e.isPrimary)?.email;
    if (currentPrimaryEmail && previousPrimaryEmail && currentPrimaryEmail !== previousPrimaryEmail) {
      anomalies.push({
        type: AnomalyType.IdentityMismatch,
        severity: AnomalySeverity.Medium,
        description: `Primary email address changed from '${previousPrimaryEmail}' to '${currentPrimaryEmail}'.`,
        detectedAt: now,
        dataPointId: customer.id,
      });
    }
    const currentPrimaryPhone = customer.phones.find(p => p.isPrimary)?.phoneNumber;
    const previousPrimaryPhone = previousCustomer.phones.find(p => p.isPrimary)?.phoneNumber;
    if (currentPrimaryPhone && previousPrimaryPhone && currentPrimaryPhone !== previousPrimaryPhone) {
      anomalies.push({
        type: AnomalyType.IdentityMismatch,
        severity: AnomalySeverity.Medium,
        description: `Primary phone number changed from '${previousPrimaryPhone}' to '${currentPrimaryPhone}'.`,
        detectedAt: now,
        dataPointId: customer.id,
      });
    }
  }

  // Rule 2: High risk KYC status
  if (customer.kycStatus === KYCStatus.Rejected || customer.kycStatus === KYCStatus.RequiresUpdates) {
    anomalies.push({
      type: AnomalyType.SuspiciousAccountActivity, // Or specific KYC anomaly
      severity: AnomalySeverity.High,
      description: `Customer KYC status is '${customer.kycStatus}'. Requires immediate review.`,
      detectedAt: now,
      dataPointId: customer.id,
    });
  }

  // Rule 3: High risk level
  if (customer.riskLevel === RiskLevel.High || customer.riskLevel === RiskLevel.Critical) {
    anomalies.push({
      type: AnomalyType.SuspiciousAccountActivity,
      severity: AnomalySeverity.High,
      description: `Customer has a high risk level: ${customer.riskLevel}.`,
      detectedAt: now,
      dataPointId: customer.id,
    });
  }

  // Rule 4: Suspicious tax ID pattern (illustrative)
  if (customer.taxId && customer.taxId.length < 5) { // e.g., for US SSN/EIN, this would be too short
    anomalies.push({
      type: AnomalyType.IdentityMismatch,
      severity: AnomalySeverity.Low,
      description: `Tax ID seems unusually short: ${customer.taxId}.`,
      detectedAt: now,
      dataPointId: customer.id,
    });
  }

  // Rule 5: Multiple addresses added recently (e.g., within last 24 hours - conceptual)
  // Requires more sophisticated change tracking
  if (customer.addresses.length > 3 && customer.createdAt && (new Date().getTime() - new Date(customer.createdAt).getTime()) < (24 * 60 * 60 * 1000)) {
    anomalies.push({
      type: AnomalyType.SuspiciousAccountActivity,
      severity: AnomalySeverity.Low,
      description: `Customer created with ${customer.addresses.length} addresses in a short period.`,
      detectedAt: now,
      dataPointId: customer.id,
    });
  }

  return anomalies;
}

/**
 * Detects anomalies in a UnifiedTransaction.
 */
function detectTransactionAnomalies(transaction: UnifiedTransaction, historicalTransactions: UnifiedTransaction[] = []): AnomalyReport[] {
  const anomalies: AnomalyReport[] = [];
  const now = parseDateToISO(new Date())!;

  // Rule 1: Unusually large transaction amount for category/customer
  const AVERAGE_TRANSACTION_VALUE_USD_CENTS = 10000; // $100.00
  const HIGH_TRANSACTION_THRESHOLD_USD_CENTS = 500000; // $5,000.00
  if (transaction.amount.currency === Currency.USD) {
    if (transaction.amount.value > HIGH_TRANSACTION_THRESHOLD_USD_CENTS) {
      anomalies.push({
        type: AnomalyType.UnusualTransactionAmount,
        severity: AnomalySeverity.High,
        description: `Transaction amount (${transaction.amount.value / 100} ${transaction.amount.currency}) is unusually high.`,
        detectedAt: now,
        dataPointId: transaction.id,
      });
    } else if (transaction.amount.value > (AVERAGE_TRANSACTION_VALUE_USD_CENTS * 10)) {
      anomalies.push({
        type: AnomalyType.UnusualTransactionAmount,
        severity: AnomalySeverity.Medium,
        description: `Transaction amount (${transaction.amount.value / 100} ${transaction.amount.currency}) is significantly higher than average.`,
        detectedAt: now,
        dataPointId: transaction.id,
      });
    }
  }

  // Rule 2: Transaction from an unusual location (if historical data exists for customer/account)
  if (transaction.location && historicalTransactions.length > 0) {
    const customerTransactions = historicalTransactions.filter(t => t.accountId === transaction.accountId);
    const knownCountries = new Set(customerTransactions.map(t => t.location?.country).filter(Boolean));
    if (transaction.location.country && !knownCountries.has(transaction.location.country) && knownCountries.size > 0) {
      anomalies.push({
        type: AnomalyType.UnusualTransactionLocation,
        severity: AnomalySeverity.Medium,
        description: `Transaction initiated from an unusual country: ${transaction.location.country}.`,
        detectedAt: now,
        dataPointId: transaction.id,
        additionalContext: { knownCountries: Array.from(knownCountries) },
      });
    }
  }

  // Rule 3: Multiple failed attempts (conceptual, typically tracked externally, but can be inferred from metadata)
  if (transaction.status === TransactionStatus.Failed && transaction.metadata?.retryCount && transaction.metadata.retryCount > 3) {
    anomalies.push({
      type: AnomalyType.MultipleFailedAttempts,
      severity: AnomalySeverity.High,
      description: `Transaction failed after ${transaction.metadata.retryCount} attempts.`,
      detectedAt: now,
      dataPointId: transaction.id,
    });
  }

  // Rule 4: Rapid successive transactions for same small amount (e.g., card testing)
  if (historicalTransactions.length > 0 && transaction.postedDate) {
    const thirtyMinutesAgo = new Date(new Date(transaction.postedDate).getTime() - 30 * 60 * 1000).toISOString();
    const recentSimilarTransactions = historicalTransactions.filter(t =>
      t.accountId === transaction.accountId &&
      t.amount.value === transaction.amount.value &&
      t.amount.currency === transaction.amount.currency &&
      t.transactionType === transaction.transactionType &&
      t.postedDate && t.postedDate > thirtyMinutesAgo &&
      t.id !== transaction.id // Exclude self
    );
    if (recentSimilarTransactions.length >= 3) {
      anomalies.push({
        type: AnomalyType.UnusualTransactionFrequency,
        severity: AnomalySeverity.High,
        description: `Multiple transactions of similar amount detected within 30 minutes, potentially card testing.`,
        detectedAt: now,
        dataPointId: transaction.id,
        additionalContext: { count: recentSimilarTransactions.length + 1, exampleIds: recentSimilarTransactions.map(t => t.id) },
      });
    }
  }

  // Rule 5: Transaction with 'High' fraudScore from enrichment
  if (transaction.fraudScore && transaction.fraudScore >= 70) {
    anomalies.push({
      type: AnomalyType.SuspiciousAccountActivity,
      severity: AnomalySeverity.Critical,
      description: `High fraud score detected for this transaction (${transaction.fraudScore}).`,
      detectedAt: now,
      dataPointId: transaction.id,
    });
  }

  // Rule 6: Transaction involving a high-risk category
  if (transaction.category === TransactionCategory.Gambling || transaction.category === TransactionCategory.MoneyMarket) {
    anomalies.push({
      type: AnomalyType.HighValueTransaction, // Or specific category risk
      severity: AnomalySeverity.Medium,
      description: `Transaction in a potentially high-risk category: ${transaction.category}.`,
      detectedAt: now,
      dataPointId: transaction.id,
    });
  }


  return anomalies;
}

/**
 * Detects anomalies in a UnifiedPayment.
 */
function detectPaymentAnomalies(payment: UnifiedPayment, historicalPayments: UnifiedPayment[] = []): AnomalyReport[] {
  const anomalies: AnomalyReport[] = [];
  const now = parseDateToISO(new Date())!;

  // Rule 1: High-value outbound payment to a new counterparty
  const HIGH_PAYMENT_THRESHOLD_USD_CENTS = 1000000; // $10,000.00
  if (payment.paymentDirection === PaymentDirection.Outbound &&
    payment.amount.currency === Currency.USD &&
    payment.amount.value > HIGH_PAYMENT_THRESHOLD_USD_CENTS &&
    payment.counterparty?.accountIdentifier &&
    !historicalPayments.some(p => p.counterparty?.accountIdentifier === payment.counterparty?.accountIdentifier && p.status === PaymentStatus.Completed)
  ) {
    anomalies.push({
      type: AnomalyType.NewPayeeAnomaly,
      severity: AnomalySeverity.High,
      description: `High-value outbound payment to a new, unverified counterparty.`,
      detectedAt: now,
      dataPointId: payment.id,
    });
  }

  // Rule 2: Payment failed due to compliance checks (from enrichment)
  if (payment.internalRegulatoryComplianceChecks) {
    if (payment.internalRegulatoryComplianceChecks.amlCheck === "fail") {
      anomalies.push({
        type: AnomalyType.SuspiciousAccountActivity,
        severity: AnomalySeverity.Critical,
        description: "Payment failed AML compliance check.",
        detectedAt: now,
        dataPointId: payment.id,
      });
    }
    if (payment.internalRegulatoryComplianceChecks.sanctionsScreening === "fail") {
      anomalies.push({
        type: AnomalyType.SuspiciousAccountActivity,
        severity: AnomalySeverity.Critical,
        description: "Payment failed sanctions screening.",
        detectedAt: now,
        dataPointId: payment.id,
      });
    }
  }

  // Rule 3: High volume of refunds for a specific customer or account
  if (payment.paymentDirection === PaymentDirection.Outbound &&
    (payment.status === PaymentStatus.Refunded || payment.status === PaymentStatus.PartiallyRefunded)) {
    const thirtyDaysAgo = new Date(new Date().getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString();
    const recentRefunds = historicalPayments.filter(p =>
      p.customerId === payment.customerId &&
      (p.status === PaymentStatus.Refunded || p.status === PaymentStatus.PartiallyRefunded) &&
      p.createdAt && p.createdAt > thirtyDaysAgo
    );
    if (recentRefunds.length >= 5) { // 5 or more refunds in 30 days
      anomalies.push({
        type: AnomalyType.ExcessiveRefunds,
        severity: AnomalySeverity.Medium,
        description: `Customer has initiated ${recentRefunds.length + 1} refunds in the last 30 days.`,
        detectedAt: now,
        dataPointId: payment.id,
      });
    }
  }

  // Rule 4: Payment to sanctioned country (conceptual - needs lookup)
  if (payment.counterparty?.accountIdentifier && payment.counterparty.accountIdentifier.includes("IR")) { // Placeholder for Iran
    anomalies.push({
      type: AnomalyType.CrossBorderAnomaly,
      severity: AnomalySeverity.Critical,
      description: "Payment directed to a sanctioned region.",
      detectedAt: now,
      dataPointId: payment.id,
    });
  }

  return anomalies;
}

/**
 * Detects anomalies in a UnifiedAccount.
 */
function detectAccountAnomalies(account: UnifiedAccount, historicalData: UnifiedAccount[] = []): AnomalyReport[] {
  const anomalies: AnomalyReport[] = [];
  const now = parseDateToISO(new Date())!;

  // Rule 1: Account status is 'Frozen' or 'Blocked'
  if (account.status === AccountStatus.Frozen || account.status === AccountStatus.Blocked) {
    anomalies.push({
      type: AnomalyType.SuspiciousAccountActivity,
      severity: AnomalySeverity.Critical,
      description: `Account is in a ${account.status} state. Immediate investigation required.`,
      detectedAt: now,
      dataPointId: account.id,
    });
  }

  // Rule 2: Sudden large balance drop (requires historical data)
  const previousAccount = historicalData.find(a => a.id === account.id);
  if (previousAccount && previousAccount.currentBalance.value > 0 && account.currentBalance.value < previousAccount.currentBalance.value * 0.1) {
    // If balance dropped by more than 90%
    anomalies.push({
      type: AnomalyType.RapidMovementOfFunds,
      severity: AnomalySeverity.High,
      description: `Account balance dropped by more than 90% from ${previousAccount.currentBalance.value / 100} to ${account.currentBalance.value / 100} ${account.currentBalance.currency}.`,
      detectedAt: now,
      dataPointId: account.id,
    });
  }

  // Rule 3: Account verification status is false for critical operations
  if (!account.verified && account.accountType !== AccountType.Wallet) {
    anomalies.push({
      type: AnomalyType.SuspiciousAccountActivity,
      severity: AnomalySeverity.Medium,
      description: "Account is not verified, potentially impacting transaction reliability.",
      detectedAt: now,
      dataPointId: account.id,
    });
  }

  // Rule 4: High internal risk score (from enrichment or internal calculation)
  if (account.internalRiskScore && account.internalRiskScore >= 70) {
    anomalies.push({
      type: AnomalyType.SuspiciousAccountActivity,
      severity: AnomalySeverity.High,
      description: `Account has a high internal risk score (${account.internalRiskScore}).`,
      detectedAt: now,
      dataPointId: account.id,
    });
  }

  // Rule 5: Account opened recently with high-risk customer (conceptual - requires customer context)
  if (account.createdAt && (new Date().getTime() - new Date(account.createdAt).getTime()) < (7 * 24 * 60 * 60 * 1000) && account.internalRiskScore && account.internalRiskScore > 50) {
    anomalies.push({
      type: AnomalyType.SuspiciousAccountActivity,
      severity: AnomalySeverity.High,
      description: `Newly opened account with a high internal risk score.`,
      detectedAt: now,
      dataPointId: account.id,
    });
  }


  return anomalies;
}

//endregion