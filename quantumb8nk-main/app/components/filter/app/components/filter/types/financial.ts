// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

/**
 * @file This file defines comprehensive TypeScript data models, enums, and utility functions
 * for financial transactions, accounts, and integration specifics from Stripe, Plaid,
 * and Modern Treasury, used throughout the Citibank Demo Business application.
 *
 * All data structures are designed to be robust and capable of representing
 * complex financial operations across various integrated platforms.
 * Utility functions provide conceptual logic for data transformation, validation,
 * and aggregation, adhering to the "no imports" constraint by operating purely
 * on defined types.
 */

// --- ENUMS ---

/**
 * Represents the status of a financial transaction or payment.
 */
enum TransactionStatus {
  Pending = "PENDING",
  Completed = "COMPLETED",
  Failed = "FAILED",
  Canceled = "CANCELED",
  Refunded = "REFUNDED",
  PartiallyRefunded = "PARTIALLY_REFUNDED",
  Authorized = "AUTHORIZED",
  Captured = "CAPTURED",
  Settling = "SETTLING",
  Chargeback = "CHARGEBACK",
  Disputed = "DISPUTED",
  Unknown = "UNKNOWN",
  Expired = "EXPIRED",
  Declined = "DECLINED",
  Voided = "VOIDED",
  Review = "REVIEW",
}

/**
 * Represents the type of a financial transaction.
 */
enum TransactionType {
  Credit = "CREDIT", // Money coming into the account
  Debit = "DEBIT",   // Money leaving the account
  Payment = "PAYMENT",
  Refund = "REFUND",
  Transfer = "TRANSFER",
  Fee = "FEE",
  Adjustment = "ADJUSTMENT",
  Interest = "INTEREST",
  Dividend = "DIVIDEND",
  Deposit = "DEPOSIT",
  Withdrawal = "WITHDRAWAL",
  Purchase = "PURCHASE",
  Sale = "SALE",
  PreAuthorization = "PRE_AUTHORIZATION",
  Reversal = "REVERSAL",
  Chargeback = "CHARGEBACK",
}

/**
 * Standardized currency codes (ISO 4217).
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
  BRL = "BRL",
  MXN = "MXN",
  ZAR = "ZAR",
  AED = "AED",
  SGD = "SGD",
  HKD = "HKD",
  NZD = "NZD",
  SEK = "SEK",
  NOK = "NOK",
  DKK = "DKK",
  KRW = "KRW",
  RUB = "RUB",
  THB = "THB",
  IDR = "IDR",
  MYR = "MYR",
  PHP = "PHP",
  CLP = "CLP",
  COP = "COP",
  PEN = "PEN",
  ARS = "ARS",
  VND = "VND",
  PLN = "PLN",
  CZK = "CZK",
  HUF = "HUF",
  ILS = "ILS",
  TRY = "TRY",
}

/**
 * Represents the type of a financial account.
 */
enum AccountType {
  Checking = "CHECKING",
  Savings = "SAVINGS",
  CreditCard = "CREDIT_CARD",
  Loan = "LOAN",
  Investment = "INVESTMENT",
  Mortgage = "MORTGAGE",
  Other = "OTHER",
  BusinessChecking = "BUSINESS_CHECKING",
  MoneyMarket = "MONEY_MARKET",
  LineOfCredit = "LINE_OF_CREDIT",
  Prepaid = "PREPAID",
  DigitalWallet = "DIGITAL_WALLET",
  Virtual = "VIRTUAL",
  External = "EXTERNAL",
  Unknown = "UNKNOWN",
}

/**
 * Specifies the method by which a payment was made or received.
 */
enum PaymentMethod {
  ACH = "ACH",
  Wire = "WIRE",
  Card = "CARD",
  Check = "CHECK",
  RTP = "RTP", // Real-Time Payment
  SEPA = "SEPA",
  SWIFT = "SWIFT",
  PayPal = "PAYPAL",
  Stripe = "STRIPE",
  Plaid = "PLAID", // For linking/authorization context
  ModernTreasury = "MODERN_TREASURY", // For internal routing context
  ApplePay = "APPLE_PAY",
  GooglePay = "GOOGLE_PAY",
  Other = "OTHER",
  Crypto = "CRYPTO",
  Cash = "CASH",
  Venmo = "VENMO",
  Zelle = "ZELLE",
  FedNow = "FEDNOW",
}

/**
 * Source of the financial record.
 */
enum RecordSource {
  Stripe = "STRIPE",
  Plaid = "PLAID",
  ModernTreasury = "MODERN_TREASURY",
  CitibankDemoBusinessInternal = "CITIBANK_DEMO_BUSINESS_INTERNAL",
  Manual = "MANUAL",
  Other = "OTHER",
}

/**
 * Plaid-specific transaction categorization types.
 */
enum PlaidCategoryType {
  ATM = "ATM",
  Transfer = "Transfer",
  FoodAndDrink = "Food and Drink",
  Travel = "Travel",
  Utilities = "Utilities",
  Rent = "Rent",
  Payroll = "Payroll",
  Service = "Service",
  Subscription = "Subscription",
  Interest = "Interest",
  Fee = "Fee",
  Payment = "Payment",
  Refund = "Refund",
  Withdrawal = "Withdrawal",
  Deposit = "Deposit",
  BankFees = "Bank Fees",
  GeneralMerchandise = "General Merchandise",
  Shops = "Shops",
  HomeImprovement = "Home Improvement",
  Automotive = "Automotive",
  HealthAndFitness = "Health and Fitness",
  Entertainment = "Entertainment",
  Education = "Education",
  Taxes = "Taxes",
  Insurance = "Insurance",
  Investment = "Investment",
  Loan = "Loan",
  Gambling = "Gambling",
  Kids = "Kids",
  PetSupplies = "Pet Supplies",
  Unknown = "Unknown",
}

/**
 * Stripe-specific event types for webhooks or logging.
 */
enum StripeEventType {
  ChargeSucceeded = "charge.succeeded",
  ChargeFailed = "charge.failed",
  PaymentIntentSucceeded = "payment_intent.succeeded",
  PaymentIntentPaymentFailed = "payment_intent.payment_failed",
  CustomerCreated = "customer.created",
  CustomerSubscriptionCreated = "customer.subscription.created",
  RefundCreated = "charge.refunded",
  BalanceAvailable = "balance.available",
  CheckoutSessionCompleted = "checkout.session.completed",
  PayoutPaid = "payout.paid",
  PayoutFailed = "payout.failed",
  AccountUpdated = "account.updated",
  InvoicePaid = "invoice.paid",
  InvoicePaymentFailed = "invoice.payment_failed",
  InvoiceCreated = "invoice.created",
  DisputeCreated = "charge.dispute.created",
  DisputeClosed = "charge.dispute.closed",
  TransferCreated = "transfer.created",
  TransferUpdated = "transfer.updated",
  CapabilityUpdated = "capability.updated",
  RadarEarlyFraudWarningCreated = "radar.early_fraud_warning.created",
  SetupIntentSucceeded = "setup_intent.succeeded",
  SetupIntentSetupFailed = "setup_intent.setup_failed",
  MandateUpdated = "mandate.updated",
  CreditNoteCreated = "credit_note.created",
  ReviewOpened = "review.opened",
  ReviewClosed = "review.closed",
  SourceChargeable = "source.chargeable",
  SourceFailed = "source.failed",
  SourceCanceled = "source.canceled",
  TopupSucceeded = "topup.succeeded",
  TopupFailed = "topup.failed",
  WebhookCalled = "webhook.called",
  Unknown = "unknown",
}

/**
 * Modern Treasury payment order status.
 */
enum ModernTreasuryPaymentOrderStatus {
  Queued = "queued",
  PendingApproval = "pending_approval",
  Approved = "approved",
  Processing = "processing",
  Complete = "complete",
  Returned = "returned",
  Canceled = "canceled",
  Denied = "denied",
  Rejected = "rejected",
  Blocked = "blocked",
  Error = "error",
  Abandoned = "abandoned",
  Expired = "expired",
}

/**
 * Modern Treasury payment type.
 */
enum ModernTreasuryPaymentType {
  ACH = "ach",
  Wire = "wire",
  RTP = "rtp",
  SEPA = "sepa",
  SWIFT = "swift",
  Book = "book", // Internal ledger movement
  Check = "check",
  DebitCard = "debit_card",
  CreditCard = "credit_card",
  InternationalWire = "international_wire",
  BACS = "bacs",
  CHAPS = "chaps",
  FPS = "fps",
  Other = "other",
}

/**
 * Modern Treasury ledger transaction status.
 */
enum ModernTreasuryLedgerTransactionStatus {
  Pending = "pending",
  Posted = "posted",
  Archived = "archived",
  Voided = "voided",
}

/**
 * Represents the lifecycle stage of a payment.
 */
enum PaymentLifecycleStage {
  Initiated = "INITIATED",
  PreAuthorized = "PRE_AUTHORIZED",
  Captured = "CAPTURED",
  Settled = "SETTLED",
  Reconciled = "RECONCILED",
  Disputed = "DISPUTED",
  ChargebackFiled = "CHARGEBACK_FILED",
  ChargebackResolved = "CHARGEBACK_RESOLVED",
  RefundRequested = "REFUND_REQUESTED",
  RefundProcessed = "REFUND_PROCESSED",
  Voided = "VOIDED",
  Failed = "FAILED",
}

// --- CORE INTERFACES ---

/**
 * Basic identifier interface for entities.
 */
interface BaseEntity {
  /** Unique identifier for the entity. */
  id: string;
  /** Timestamp when the entity was created. */
  createdAt: string;
  /** Timestamp when the entity was last updated. */
  updatedAt: string;
}

/**
 * Represents an address associated with an entity.
 */
interface Address {
  /** Street line 1. */
  line1: string;
  /** Street line 2 (optional). */
  line2?: string;
  /** City. */
  city: string;
  /** State or province. */
  state: string;
  /** Zip or postal code. */
  postalCode: string;
  /** Country (ISO 3166-1 alpha-2 code). */
  country: string;
}

/**
 * Represents a counterparty in a financial transaction (e.g., a merchant, customer, or vendor).
 */
interface Counterparty extends BaseEntity {
  /** Name of the counterparty. */
  name: string;
  /** Legal name of the counterparty, if different from name. */
  legalName?: string;
  /** Email address of the counterparty. */
  email?: string;
  /** Phone number of the counterparty. */
  phone?: string;
  /** Physical address of the counterparty. */
  address?: Address;
  /** Tax identifier (e.g., EIN, VAT ID). */
  taxId?: string;
  /** Custom metadata associated with the counterparty. */
  metadata?: Record<string, string | number | boolean | null>;
  /** External ID from an integrated system, e.g., Stripe Customer ID. */
  externalId?: {
    stripeCustomerId?: string;
    modernTreasuryCounterpartyId?: string;
  };
  /** A descriptive summary of the counterparty. */
  description?: string;
  /** URL to the counterparty's website. */
  website?: string;
  /** Type of counterparty (e.g., 'individual', 'business'). */
  type?: 'individual' | 'business';
  /** Industry of the counterparty, if applicable. */
  industry?: string;
}

/**
 * Represents a financial account within the Citibank Demo Business ecosystem.
 * This could be an internal account or an external linked account.
 */
interface Account extends BaseEntity {
  /** Display name of the account. */
  name: string;
  /** Type of the account (e.g., Checking, Savings, Credit Card). */
  accountType: AccountType;
  /** Currency of the account. */
  currency: Currency;
  /** Current balance of the account (in cents/smallest unit). */
  balance: number;
  /** Available balance (if different from current balance, e.g., considering pending transactions). */
  availableBalance?: number;
  /** Unique account number (masked for security if needed). */
  accountNumber?: string;
  /** Routing number or sort code. */
  routingNumber?: string;
  /** Bank name. */
  bankName?: string;
  /** External IDs from integrated systems. */
  externalId?: {
    plaidAccountId?: string;
    stripeConnectAccountId?: string;
    modernTreasuryAccountId?: string;
    bankLedgerAccountId?: string; // For direct bank integrations
  };
  /** Source of this account's data. */
  source: RecordSource;
  /** Flag indicating if the account is active. */
  isActive: boolean;
  /** Date when the account was opened. */
  openedDate?: string;
  /** Last reconciliation date for the account. */
  lastReconciliationDate?: string;
  /** Custom metadata associated with the account. */
  metadata?: Record<string, string | number | boolean | null>;
  /** Description for the account. */
  description?: string;
  /** Reference to the owner of the account if it's a sub-account or connected account. */
  ownerId?: string; // e.g., a Citibank Demo Business user ID
}

/**
 * Represents a detailed financial transaction. This is the canonical internal representation.
 */
interface Transaction extends BaseEntity {
  /** Unique identifier for the transaction. */
  id: string;
  /** Unique ID from the original source system (e.g., Stripe charge ID, Plaid transaction ID). */
  externalId?: string;
  /** The source system from which this transaction originated. */
  source: RecordSource;
  /** Type of the transaction (e.g., Credit, Debit, Refund). */
  type: TransactionType;
  /** Current status of the transaction. */
  status: TransactionStatus;
  /** Amount of the transaction (in cents/smallest unit). */
  amount: number;
  /** Currency of the transaction. */
  currency: Currency;
  /** Description of the transaction. */
  description: string;
  /** Timestamp when the transaction occurred (transaction date, not creation date). */
  transactionDate: string;
  /** Timestamp when the transaction was posted. */
  postedDate?: string;
  /** ID of the account from which money moved (if debit) or to which money moved (if credit). */
  accountId: string;
  /** Optional ID of the related counterparty. */
  counterpartyId?: string;
  /** Name of the counterparty, if available. */
  counterpartyName?: string;
  /** Category of the transaction (e.g., 'Food & Drink', 'Travel'). */
  category?: string;
  /** Subcategory of the transaction. */
  subcategory?: string;
  /** Any fees associated with the transaction. */
  fees?: number;
  /** Reference to a related payment or other transaction. */
  relatedTransactionId?: string;
  /** Custom metadata for the transaction. */
  metadata?: Record<string, string | number | boolean | null>;
  /** Reference to the payment method used. */
  paymentMethod?: PaymentMethod;
  /** Merchant details, if available. */
  merchant?: {
    name?: string;
    category?: string;
    address?: Address;
    website?: string;
  };
  /** Flag indicating if this transaction has been reconciled. */
  isReconciled: boolean;
  /** ID of the reconciliation batch this transaction belongs to. */
  reconciliationBatchId?: string;
  /** Memo or note provided by the user. */
  memo?: string;
  /** Tags associated with the transaction. */
  tags?: string[];
  /** Flag for flagging suspicious activity */
  isSuspicious?: boolean;
  /** Details about any dispute related to the transaction. */
  disputeDetails?: {
    status: 'open' | 'closed' | 'won' | 'lost';
    reason: string;
    filedDate: string;
    resolutionDate?: string;
    amountDisputed: number;
    evidenceProvided: boolean;
  };
  /** Ledger entry identifier for internal tracking. */
  ledgerEntryId?: string;
  /** The original payment order ID that created this transaction, if applicable. */
  paymentOrderId?: string;
}

/**
 * Represents a payment, which can be an outgoing disbursement or an incoming receipt.
 * This is distinct from a `Transaction` in that `Payment` often represents the *intent*
 * or *order* of money movement, while `Transaction` is the record of the actual movement.
 */
interface Payment extends BaseEntity {
  /** Unique identifier for the payment. */
  id: string;
  /** Unique ID from the original source system (e.g., Stripe PaymentIntent ID, MT PaymentOrder ID). */
  externalId?: string;
  /** The source system responsible for processing or initiating this payment. */
  source: RecordSource;
  /** Amount of the payment (in cents/smallest unit). */
  amount: number;
  /** Currency of the payment. */
  currency: Currency;
  /** Current status of the payment. */
  status: TransactionStatus; // Using general TransactionStatus for consistency
  /** Lifecycle stage of the payment. */
  lifecycleStage: PaymentLifecycleStage;
  /** Type of the payment (e.g., Debit for outgoing, Credit for incoming). */
  type: TransactionType.Credit | TransactionType.Debit;
  /** Description or purpose of the payment. */
  description: string;
  /** Date the payment was initiated. */
  initiatedDate: string;
  /** Date the payment is expected to be settled. */
  expectedSettlementDate?: string;
  /** Date the payment was actually settled. */
  settledDate?: string;
  /** ID of the sending account. */
  senderAccountId: string;
  /** ID of the receiving account or counterparty account. */
  receiverAccountId?: string;
  /** ID of the counterparty involved in the payment. */
  counterpartyId: string;
  /** Details about the payment method used. */
  paymentMethod: PaymentMethod;
  /** Reference to the related transaction(s) once settled. */
  transactionIds?: string[];
  /** Any associated fees for this payment. */
  fees?: number;
  /** Custom metadata for the payment. */
  metadata?: Record<string, string | number | boolean | null>;
  /** Invoice ID or reference if this payment is for an invoice. */
  invoiceId?: string;
  /** Recurrence details if this is a recurring payment. */
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'annually';
    nextPaymentDate: string;
    endDate?: string;
  };
  /** Payment risk score. */
  riskScore?: number;
  /** Failure reason, if applicable. */
  failureReason?: string;
  /** Approval status, if payments require internal approval. */
  approvalStatus?: 'approved' | 'pending' | 'rejected';
  /** User who approved the payment. */
  approvedBy?: string;
  /** Date of approval. */
  approvedAt?: string;
  /** Routing information for the payment. */
  routingDetails?: {
    channel?: string; // e.g., 'Fedwire', 'ACH Network'
    traceNumber?: string;
    instructions?: string;
    destinationBankName?: string;
    destinationBankIdentifier?: string; // SWIFT, ABA, etc.
  };
}


/**
 * Represents a refund, which is a reversal of a previous payment/charge.
 */
interface Refund extends BaseEntity {
  /** Unique identifier for the refund. */
  id: string;
  /** Unique ID from the original source system (e.g., Stripe Refund ID). */
  externalId?: string;
  /** The source system from which this refund originated. */
  source: RecordSource;
  /** Amount of the refund (in cents/smallest unit). */
  amount: number;
  /** Currency of the refund. */
  currency: Currency;
  /** Current status of the refund. */
  status: TransactionStatus; // e.g., Completed, Pending, Failed
  /** Description or reason for the refund. */
  reason?: string;
  /** Date the refund was initiated. */
  initiatedDate: string;
  /** Date the refund was settled. */
  settledDate?: string;
  /** ID of the original payment or transaction being refunded. */
  originalPaymentId: string;
  /** ID of the account from which the refund funds are drawn. */
  sourceAccountId: string;
  /** ID of the account to which the refund funds are sent. */
  destinationAccountId?: string;
  /** ID of the counterparty receiving the refund. */
  counterpartyId?: string;
  /** Custom metadata for the refund. */
  metadata?: Record<string, string | number | boolean | null>;
  /** Any fees associated with the refund. */
  fees?: number;
  /** Reference to the transaction(s) created by this refund. */
  transactionIds?: string[];
  /** Whether the refund was full or partial. */
  isPartial: boolean;
  /** The original amount of the payment that this refund relates to. */
  originalPaymentAmount: number;
  /** Failure reason, if the refund failed. */
  failureReason?: string;
  /** User who initiated the refund. */
  initiatedByUserId?: string;
}

/**
 * Represents a ledger entry for double-entry accounting within Citibank Demo Business.
 */
interface LedgerEntry extends BaseEntity {
  /** Unique identifier for the ledger entry. */
  id: string;
  /** Unique ID from an external ledger system (e.g., Modern Treasury Ledger Transaction ID). */
  externalId?: string;
  /** ID of the account that is debited. */
  debitAccountId: string;
  /** ID of the account that is credited. */
  creditAccountId: string;
  /** Amount of the entry (in cents/smallest unit). */
  amount: number;
  /** Currency of the entry. */
  currency: Currency;
  /** Description of the ledger entry. */
  description: string;
  /** Date the entry was created/posted. */
  entryDate: string;
  /** Status of the ledger entry. */
  status: ModernTreasuryLedgerTransactionStatus;
  /** Reference to the transaction that caused this ledger entry. */
  transactionId?: string;
  /** Reference to the payment that caused this ledger entry. */
  paymentId?: string;
  /** Custom metadata. */
  metadata?: Record<string, string | number | boolean | null>;
  /** Effect type, e.g., 'normal', 'reversal'. */
  effect?: 'normal' | 'reversal';
  /** Balance before this entry. */
  beforeBalance?: number;
  /** Balance after this entry. */
  afterBalance?: number;
  /** Associated invoice ID. */
  invoiceId?: string;
  /** Journal entry batch ID. */
  journalEntryBatchId?: string;
  /** Related to a reconciliation event. */
  reconciliationId?: string;
}

/**
 * Represents a financial instrument, such as a bank account, card, or digital wallet.
 * This can be used for both sending and receiving funds.
 */
interface FinancialInstrument extends BaseEntity {
  /** Unique identifier for the instrument. */
  id: string;
  /** Display name for the instrument (e.g., "My Checking Account", "Visa ****1234"). */
  name: string;
  /** Type of the instrument (e.g., Checking, Credit Card). */
  instrumentType: AccountType | PaymentMethod;
  /** Currency of the instrument. */
  currency: Currency;
  /** Masked identifier (e.g., last 4 digits of card number, masked account number). */
  maskedIdentifier: string;
  /** Full, unmasked identifier (should be handled securely and rarely stored). */
  fullIdentifier?: string; // For internal use only, e.g., tokenized
  /** ID of the associated account in our system. */
  accountId: string;
  /** External ID from payment processor (e.g., Stripe Payment Method ID, Plaid Account ID). */
  externalId?: {
    stripePaymentMethodId?: string;
    plaidAccountId?: string;
    modernTreasuryExternalAccountId?: string;
    tokenizedPaymentProviderId?: string; // Generic tokenized ID
  };
  /** Status of the instrument (e.g., 'active', 'inactive', 'expired'). */
  status: 'active' | 'inactive' | 'expired' | 'suspended' | 'deleted';
  /** Date the instrument was added/created. */
  addedDate: string;
  /** Expiration date for cards. */
  expirationDate?: string;
  /** Name on the card/account. */
  holderName?: string;
  /** Billing address associated with the instrument. */
  billingAddress?: Address;
  /** Issuing bank or provider. */
  issuer?: string;
  /** Custom metadata. */
  metadata?: Record<string, string | number | boolean | null>;
  /** Flag if this is the default instrument for payments. */
  isDefault?: boolean;
  /** Verification status of the instrument. */
  verificationStatus?: 'verified' | 'pending' | 'failed' | 'unverified';
  /** Tokenized representation of the instrument. */
  token?: string;
  /** For cards, the brand (e.g., 'Visa', 'Mastercard'). */
  cardBrand?: string;
  /** For bank accounts, the type (e.g., 'checking', 'savings'). */
  bankAccountType?: 'checking' | 'savings' | 'business';
}

// --- INTEGRATION-SPECIFIC INTERFACES (Stripe) ---

/**
 * Represents a Stripe Customer object.
 * @see https://stripe.com/docs/api/customers/object
 */
interface StripeCustomer {
  /** Unique identifier for the object. */
  id: string;
  /** Object type, which is always `customer`. */
  object: "customer";
  /** The customer's address. */
  address?: Address | null;
  /** Current balance, if any, being stored on the customer. If you add a negative amount to a customer's balance, that amount will be applied to the customer's next invoice. */
  balance: number;
  /** Time at which the object was created. */
  created: number;
  /** Three-letter ISO currency code, in lowercase. Must be a supported currency. */
  currency?: string | null;
  /** The customer's default payment method. */
  default_source?: string | null;
  /** An arbitrary string attached to the object. Often used to display to users. */
  description?: string | null;
  /** The customer's email address. */
  email?: string | null;
  /** The customer's full name or business name. */
  name?: string | null;
  /** The customer's phone number. */
  phone?: string | null;
  /** The customer's shipping information. */
  shipping?: {
    address?: Address;
    name?: string;
    phone?: string;
  } | null;
  /** The customer's tax exemption. */
  tax_exempt?: "none" | "exempt" | "reverse" | null;
  /** The customer's tax IDs. */
  tax_ids?: Array<{
    id: string;
    object: "tax_id";
    type: "eu_vat" | "br_cnpj" | "br_cpf" | "bg_vat" | "ch_vat" | "cl_tin" | "es_cif" | "fr_siren" | "gb_vat" | "hk_br" | "in_gst" | "jp_cn" | "kr_brn" | "li_uid" | "mx_rfc" | "my_sst" | "no_vat" | "nz_gst" | "ru_inn" | "sa_vat" | "sg_gst" | "za_vat" | "us_ein" | "unknown";
    value?: string | null;
    verification?: {
      status: "pending" | "verified" | "unverified" | "unavailable";
      verified_address?: string | null;
      verified_name?: string | null;
    };
  }>;
  /** Whether the customer is a test customer. */
  livemode: boolean;
  /** Set of key-value pairs that you can attach to an object. */
  metadata?: Record<string, string>;
  /** The customer's preferred locales (for displaying localized strings in Stripe UIs). */
  preferred_locales?: string[];
  /** The customer's date of birth. */
  birthdate?: string;
  /** The customer's industry. */
  industry?: string;
  /** The customer's website. */
  website?: string;
}

/**
 * Represents a Stripe Payment Intent object.
 * @see https://stripe.com/docs/api/payment_intents/object
 */
interface StripePaymentIntent {
  /** Unique identifier for the object. */
  id: string;
  /** Object type, which is always `payment_intent`. */
  object: "payment_intent";
  /** Amount intended to be collected by this PaymentIntent. */
  amount: number;
  /** Amount that was collected by this PaymentIntent. */
  amount_received: number;
  /** Three-letter ISO currency code, in lowercase. Must be a supported currency. */
  currency: string;
  /** The customer this PaymentIntent is for. */
  customer?: string | StripeCustomer | null;
  /** An arbitrary string attached to the object. Often used to display to users. */
  description?: string | null;
  /** The latest charge associated with this PaymentIntent. */
  latest_charge?: string | StripeCharge | null;
  /** Has the value `true` if the object exists in live mode or `false` if in test mode. */
  livemode: boolean;
  /** Set of key-value pairs that you can attach to an object. */
  metadata?: Record<string, string>;
  /** Status of the PaymentIntent. */
  status: "requires_payment_method" | "requires_confirmation" | "requires_action" | "processing" | "succeeded" | "failed" | "canceled";
  /** Capture method for the PaymentIntent. */
  capture_method: "automatic" | "manual";
  /** Confirmation method for the PaymentIntent. */
  confirmation_method: "automatic" | "manual";
  /** Time at which the object was created. */
  created: number;
  /** ID of the payment method used in this PaymentIntent. */
  payment_method?: string | null;
  /** The payment method types that this PaymentIntent is allowed to use. */
  payment_method_types: string[];
  /** For `succeeded` PaymentIntents, the ID of the review that was created. */
  review?: string | null;
  /** Shipping information for this PaymentIntent. */
  shipping?: {
    address?: Address;
    name?: string;
    phone?: string;
  } | null;
  /** The URL to send customers to in order to authenticate their payment. */
  next_action?: {
    type: string;
    redirect_to_url?: {
      return_url?: string;
      url?: string;
    };
    use_stripe_sdk?: Record<string, unknown>; // Placeholder for SDK details
    alipay_handle_redirect?: {
      native_url?: string;
      url: string;
    };
  };
  /** The amount that can be captured. */
  amount_capturable?: number;
  /** The amount that was refunded. */
  amount_refunded?: number;
  /** The ID of the invoice associated with this PaymentIntent. */
  invoice?: string | null;
  /** The `on_behalf_of` account if this PaymentIntent was created with a Stripe Connect account. */
  on_behalf_of?: string | null;
  /** Error code for failed payments. */
  last_payment_error?: {
    code?: string;
    decline_code?: string;
    doc_url?: string;
    message?: string;
    param?: string;
    type?: string;
  };
  /** Whether the PaymentIntent requires a customer. */
  setup_future_usage?: 'on_session' | 'off_session' | null;
  /** The URL to redirect your customer to after they authenticate on their bank's page or mobile app. */
  return_url?: string;
  /** The funds that this PaymentIntent is intended to transfer to a connected account. */
  transfer_data?: {
    amount?: number;
    destination: string;
  };
  /** The ID of the transfer that was created to move funds to a connected account. */
  transfer_group?: string;
  /** The ID of the source or payment method object for this payment. */
  source?: string;
  /** The ID of the application that created this PaymentIntent. */
  application?: string;
  /** The ID of the application fee (if any) paid in addition to the payment intent. */
  application_fee_amount?: number;
}

/**
 * Represents a Stripe Charge object.
 * @see https://stripe.com/docs/api/charges/object
 */
interface StripeCharge {
  /** Unique identifier for the object. */
  id: string;
  /** Object type, which is always `charge`. */
  object: "charge";
  /** Amount intended to be collected by this charge. */
  amount: number;
  /** Amount in cents (or 0 for a non-card charge) that was captured. */
  amount_captured: number;
  /** Amount of the charge that has been refunded. */
  amount_refunded: number;
  /** ID of the Connect application that created the charge. */
  application?: string | null;
  /** The application fee (if any) for the charge. */
  application_fee_amount?: number | null;
  /** ID of the balance transaction that describes the impact of this charge on your account balance. */
  balance_transaction?: string | null;
  /** Billing details associated with the payment method. */
  billing_details: {
    address?: Address | null;
    email?: string | null;
    name?: string | null;
    phone?: string | null;
  };
  /** If the charge was created without capturing funds, this field contains the amount that can be captured. */
  calculated_statement_descriptor?: string | null;
  /** Whether the charge was captured. */
  captured: boolean;
  /** Time at which the object was created. */
  created: number;
  /** Three-letter ISO currency code, in lowercase. Must be a supported currency. */
  currency: string;
  /** ID of the customer this charge is for if one exists. */
  customer?: string | StripeCustomer | null;
  /** An arbitrary string attached to the object. */
  description?: string | null;
  /** Whether this charge has been disputed. */
  disputed: boolean;
  /** Error code, if any, for the charge. */
  failure_code?: string | null;
  /** Message explaining the failure, if any. */
  failure_message?: string | null;
  /** Details about the card used to create the charge. */
  payment_method_details?: {
    card?: {
      brand?: string;
      country?: string;
      exp_month?: number;
      exp_year?: number;
      fingerprint?: string;
      funding?: string;
      last4?: string;
    };
    type: string;
    ach_credit_transfer?: {
      account_number?: string;
      routing_number?: string;
      bank_name?: string;
      swift_code?: string;
    };
    us_bank_account?: {
      account_holder_type?: 'individual' | 'company';
      account_type?: 'checking' | 'savings';
      bank_name?: string;
      fingerprint?: string;
      last4?: string;
      routing_number?: string;
      status?: 'new' | 'validated' | 'verification_failed' | 'errored';
    };
  };
  /** ID of the PaymentIntent associated with this charge, if any. */
  payment_intent?: string | StripePaymentIntent | null;
  /** ID of the refund(s) associated with this charge. */
  refunds?: Array<StripeRefund>;
  /** Status of the charge. */
  status: "succeeded" | "pending" | "failed";
  /** A string that identifies this transaction. */
  transfer_group?: string | null;
  /** Whether this charge was made in live mode or test mode. */
  livemode: boolean;
  /** Set of key-value pairs that you can attach to an object. */
  metadata?: Record<string, string>;
  /** The ID of the invoice associated with this charge, if any. */
  invoice?: string | null;
  /** The ID of the transfer to which this charge contributed. */
  transfer?: string | null;
  /** The card present details for the charge, if it was created with a card reader. */
  card_present?: {
    reader?: string;
    terminal_id?: string;
    receipt_number?: string;
  };
  /** Shipping information for the charge. */
  shipping?: {
    address?: Address;
    name?: string;
    phone?: string;
    carrier?: string;
    tracking_number?: string;
  } | null;
}

/**
 * Represents a Stripe Refund object.
 * @see https://stripe.com/docs/api/refunds/object
 */
interface StripeRefund {
  /** Unique identifier for the object. */
  id: string;
  /** Object type, which is always `refund`. */
  object: "refund";
  /** Amount refunded. */
  amount: number;
  /** ID of the charge that was refunded. */
  charge: string | StripeCharge;
  /** Time at which the object was created. */
  created: number;
  /** Three-letter ISO currency code, in lowercase. Must be a supported currency. */
  currency: string;
  /** An arbitrary string attached to the object. */
  description?: string | null;
  /** Has the value `true` if the object exists in live mode or `false` if in test mode. */
  livemode: boolean;
  /** Set of key-value pairs that you can attach to an object. */
  metadata?: Record<string, string>;
  /** Reason for the refund. */
  reason?: "duplicate" | "fraudulent" | "requested_by_customer" | null;
  /** Status of the refund. */
  status?: "pending" | "succeeded" | "failed" | null;
  /** ID of the balance transaction that describes the impact of this refund on your account balance. */
  balance_transaction?: string | null;
  /** The PaymentIntent that the charge belonged to. */
  payment_intent?: string | null;
  /** The amount of application fee that was refunded. */
  amount_application_fee?: number;
  /** Destination for the refund. */
  destination_details?: {
    ach_credit_transfer?: {
      account_number?: string;
      routing_number?: string;
      bank_name?: string;
    };
  };
  /** Failure reason for a refund. */
  failure_reason?: string;
  /** If the refund is associated with an order, this is the order ID. */
  order?: string;
  /** The transfer that this refund is associated with, if applicable. */
  transfer_reversal?: string;
}

// --- INTEGRATION-SPECIFIC INTERFACES (Plaid) ---

/**
 * Plaid transaction object.
 * @see https://plaid.com/docs/api/products/transactions/#transactions-get-response-transactions
 */
interface PlaidTransaction {
  /** The ID of the account in which this transaction occurred. */
  account_id: string;
  /** The business name of the transaction, as extracted from the raw `name` field. */
  account_owner?: string | null;
  /** The amount of the transaction. For credit card transactions, a positive value indicates a credit (e.g., a payment received), and a negative value indicates a debit (e.g., a purchase made). For bank transactions, a positive value indicates a deposit, and a negative value indicates a withdrawal. */
  amount: number;
  /** An array of string representations of the primary and secondary categories for this transaction. */
  category: string[] | null;
  /** The ID of the category to which this transaction belongs. */
  category_id: string | null;
  /** The check number of the transaction. This field is only set if the transaction is a check. */
  check_number?: string | null;
  /** The date that the transaction was authorized. */
  date: string; // YYYY-MM-DD
  /** For pending transactions, the date that the transaction is expected to post. */
  authorized_date?: string | null;
  /** The date that the transaction was posted. */
  datetime?: string | null; // ISO 8601
  /** The merchant name of the transaction, as extracted by Plaid from the raw description. */
  merchant_name?: string | null;
  /** The raw description of the transaction as returned by the financial institution. */
  name: string;
  /** The ID of the transaction. Like all Plaid identifiers, the `transaction_id` is case sensitive. */
  transaction_id: string;
  /** The unique ID of the link associated with the transaction. */
  item_id?: string;
  /** The ID of the account associated with this transaction. */
  iso_currency_code?: string | null;
  /** The ISO-4217 currency code of the transaction. */
  unofficial_currency_code?: string | null;
  /** Whether the transaction is pending or posted. */
  pending: boolean;
  /** The ID of the pending transaction. */
  pending_transaction_id?: string | null;
  /** A unique identifier for the transaction, useful for deduplication. */
  transaction_code?: string | null;
  /** The logo for the merchant. */
  logo_url?: string | null;
  /** The website for the merchant. */
  website?: string | null;
  /** Location information for the merchant. */
  location?: {
    address?: string | null;
    city?: string | null;
    region?: string | null;
    postal_code?: string | null;
    country?: string | null;
    lat?: number | null;
    lon?: number | null;
    store_number?: string | null;
  };
  /** Personal finance category information. */
  personal_finance_category?: {
    primary: string;
    detailed: string;
  };
  /** Transaction type. */
  transaction_type?: 'digital' | 'place' | 'special' | 'unresolved';
  /** Payment channel. */
  payment_channel?: 'online' | 'in store' | 'other';
  /** Payment meta data. */
  payment_meta?: {
    by_order_of?: string | null;
    payee?: string | null;
    payer?: string | null;
    payment_method?: string | null;
    payment_processor?: string | null;
    ppd_id?: string | null;
    reason?: string | null;
    reference_number?: string | null;
    transaction_id?: string | null;
  };
  /** The original transaction description. */
  original_description?: string;
}

/**
 * Plaid account object.
 * @see https://plaid.com/docs/api/accounts/#account-object
 */
interface PlaidAccount {
  /** Plaid's unique identifier for the account. */
  account_id: string;
  /** The last 2-4 alphanumeric characters of an account's official account number. */
  mask: string | null;
  /** The name of the account, either assigned by the user or by the financial institution. */
  name: string;
  /** The official name of the account as given by the financial institution. */
  official_name: string | null;
  /** The type of the account, e.g., `depository`, `credit`, `loan`, `investment`, `brokerage`. */
  type: string;
  /** The financial institution's subtype for the account, e.g., `checking`, `savings`, `credit card`, `mortgage`. */
  subtype: string | null;
  /** The current balance of the account. */
  balances: {
    available?: number | null;
    current: number;
    limit?: number | null;
    iso_currency_code: string | null;
    unofficial_currency_code: string | null;
    last_updated_datetime?: string | null; // ISO 8601
  };
  /** The date and time of the last successful balance update for the account. */
  last_sync_date?: string | null; // ISO 8601
  /** A list of numbers associated with the account, such as account number, routing number, etc. */
  numbers?: {
    ach?: Array<{
      account_id: string;
      account: string;
      routing: string;
      wire_routing: string;
    }>;
    eft?: Array<{
      account_id: string;
      account: string;
      branch: string;
      institution: string;
    }>;
    international?: Array<{
      account_id: string;
      iban: string;
      bic: string;
    }>;
    bacs?: Array<{
      account_id: string;
      account: string;
      sort_code: string;
    }>;
  };
  /** The status of the account. */
  status?: 'active' | 'inactive' | 'closed';
  /** The historical type for the account. */
  historical_type?: 'depository' | 'credit' | 'loan' | 'investment';
  /** The institution ID for the account. */
  institution_id?: string;
  /** The webhook URL for the account. */
  webhook?: string;
}

/**
 * Plaid Item object. Represents a connection to a financial institution.
 * @see https://plaid.com/docs/api/items/#item-object
 */
interface PlaidItem {
  /** The ID of the Item. */
  item_id: string;
  /** The ID of the financial institution associated with the Item. */
  institution_id: string;
  /** The Plaid-generated API `access_token`. */
  access_token: string;
  /** The date and time when the Item’s `access_token` was created. */
  created_at?: string; // ISO 8601
  /** The date and time when the Item’s `access_token` was last updated. */
  updated_at?: string; // ISO 8601
  /** The URL registered to receive webhooks for the Item. */
  webhook?: string | null;
  /** The current webhook version. */
  webhook_version?: number;
  /** The current status of the Item. */
  error?: {
    error_code: string;
    error_message: string;
    error_type: string;
    display_message: string | null;
  } | null;
  /** Indicates if the Item is in live mode or development (test) mode. */
  live_mode: boolean;
  /** A list of products that the Item is enabled for. */
  products: Array<'assets' | 'auth' | 'balance' | 'identity' | 'investments' | 'liabilities' | 'payment_initiation' | 'transactions'>;
  /** The accounts associated with the Item. */
  accounts?: PlaidAccount[];
  /** The consent expiration time for the Item. */
  consent_expiration_time?: string | null; // ISO 8601
  /** Array of products that are in a bad state (i.e. `error` field is not `null`). */
  billed_products?: Array<'assets' | 'auth' | 'balance' | 'identity' | 'investments' | 'liabilities' | 'payment_initiation' | 'transactions'>;
}

/**
 * Plaid Link Token response.
 * @see https://plaid.com/docs/api/tokens/#linktokencreate
 */
interface PlaidLinkToken {
  /** A `link_token` is a short-lived token that is used to initialize Link. */
  link_token: string;
  /** The expiration for the `link_token`, in ISO 8601 format. */
  expiration: string;
  /** A unique identifier for the request, which can be used for troubleshooting. */
  request_id: string;
  /** The token type. */
  token_type?: string;
  /** The user ID associated with the token. */
  user_id?: string;
  /** Any errors encountered during token creation. */
  error?: {
    display_message?: string;
    error_code?: string;
    error_message?: string;
    error_type?: string;
  };
}


// --- INTEGRATION-SPECIFIC INTERFACES (Modern Treasury) ---

/**
 * Modern Treasury Counterparty.
 * @see https://docs.moderntreasury.com/api-reference/api-references/counterparties/
 */
interface ModernTreasuryCounterparty {
  /** Unique identifier for the object. */
  id: string;
  /** The name of the counterparty. */
  name: string;
  /** A list of email addresses for the counterparty. */
  email?: string;
  /** A list of phone numbers for the counterparty. */
  phone_number?: string;
  /** The counterparty's legal name. */
  legal_name?: string;
  /** The counterparty's address. */
  billing_address?: Address;
  /** The counterparty's tax identifier. */
  taxpayer_identifier?: string;
  /** Any custom metadata for the counterparty. */
  metadata?: Record<string, string>;
  /** Timestamp when the counterparty was created. */
  created_at: string;
  /** Timestamp when the counterparty was last updated. */
  updated_at: string;
  /** Livemode indicator. */
  livemode: boolean;
  /** Status of the counterparty. */
  status: 'active' | 'pending' | 'inactive' | 'archived';
  /** External accounts associated with the counterparty. */
  accounts?: ModernTreasuryExternalAccount[];
  /** Description for the counterparty. */
  description?: string;
}

/**
 * Modern Treasury External Account (e.g., bank account of a counterparty).
 * @see https://docs.moderntreasury.com/api-reference/api-references/external-accounts/
 */
interface ModernTreasuryExternalAccount {
  /** Unique identifier for the object. */
  id: string;
  /** The name of the external account. */
  name: string;
  /** The type of the external account. */
  account_type: 'checking' | 'savings' | 'loan' | 'other';
  /** The account number for the external account. */
  account_number: string;
  /** The routing number for the external account. */
  routing_number?: string;
  /** The SWIFT/BIC code for international wires. */
  swift_code?: string;
  /** The IBAN for SEPA payments. */
  iban?: string;
  /** The currency of the external account. */
  currency: string;
  /** The ID of the associated counterparty. */
  counterparty_id: string;
  /** Any custom metadata for the external account. */
  metadata?: Record<string, string>;
  /** Timestamp when the external account was created. */
  created_at: string;
  /** Timestamp when the external account was last updated. */
  updated_at: string;
  /** Livemode indicator. */
  livemode: boolean;
  /** Verification status of the external account. */
  verification_status?: 'pending_verification' | 'verified' | 'failed_verification';
  /** Holder of the account. */
  account_holder_name: string;
  /** Address of the account holder. */
  account_holder_address?: Address;
  /** The ID of the ledger account associated with this external account. */
  ledger_account_id?: string;
}

/**
 * Modern Treasury Payment Order.
 * @see https://docs.moderntreasury.com/api-reference/api-references/payment-orders/
 */
interface ModernTreasuryPaymentOrder {
  /** Unique identifier for the object. */
  id: string;
  /** Amount of the payment order in cents. */
  amount: number;
  /** Currency of the payment order. */
  currency: string;
  /** Description of the payment order. */
  description?: string;
  /** The date on which the payment order is to be executed. */
  effective_date: string; // YYYY-MM-DD
  /** The ID of the originating account. */
  originating_account_id: string;
  /** The ID of the receiving counterparty. */
  receiving_account_id: string; // This is actually the External Account ID or another internal account ID
  /** The status of the payment order. */
  status: ModernTreasuryPaymentOrderStatus;
  /** The type of payment. */
  type: ModernTreasuryPaymentType;
  /** Any custom metadata for the payment order. */
  metadata?: Record<string, string>;
  /** Timestamp when the payment order was created. */
  created_at: string;
  /** Timestamp when the payment order was last updated. */
  updated_at: string;
  /** Livemode indicator. */
  livemode: boolean;
  /** Direction of the payment. */
  direction: 'credit' | 'debit';
  /** Priority of the payment order. */
  priority: 'high' | 'normal';
  /** Reference number. */
  remittance_information?: string;
  /** Internal tracking number. */
  send_remittance_advice?: boolean;
  /** Ultimate originator details. */
  ultimate_originating_account_id?: string;
  /** Ultimate receiver details. */
  ultimate_receiving_account_id?: string;
  /** The ID of the transaction that corresponds to this payment order. */
  transaction_id?: string;
  /** The ID of the ledger transaction created for this payment order. */
  ledger_transaction_id?: string;
  /** ID of the statement line item this payment order corresponds to. */
  statement_line_item_id?: string;
  /** Foreign exchange rate. */
  foreign_exchange_rate?: {
    rate: string;
    base_currency: string;
    target_currency: string;
  };
  /** Foreign exchange quote. */
  foreign_exchange_quote_id?: string;
  /** Accounting category. */
  accounting_category?: string;
  /** Accounting ledger class. */
  accounting_ledger_class?: string;
  /** Rejection reason. */
  rejection_reason?: string;
  /** Returns associated with this payment order. */
  returns?: Array<{
    id: string;
    amount: number;
    reason: string;
    status: 'pending' | 'completed' | 'failed';
    created_at: string;
  }>;
}

/**
 * Modern Treasury Transaction. Represents a bank transaction pulled from a financial institution.
 * @see https://docs.moderntreasury.com/api-reference/api-references/transactions/
 */
interface ModernTreasuryTransaction {
  /** Unique identifier for the object. */
  id: string;
  /** Amount of the transaction in cents. */
  amount: number;
  /** Currency of the transaction. */
  currency: string;
  /** Description of the transaction. */
  description: string;
  /** The date the transaction was posted to the account. */
  transaction_date: string; // YYYY-MM-DD
  /** The date the transaction was created in Modern Treasury. */
  created_at: string;
  /** The date the transaction was last updated in Modern Treasury. */
  updated_at: string;
  /** Livemode indicator. */
  livemode: boolean;
  /** The ID of the bank account this transaction belongs to. */
  bank_account_id: string;
  /** The ID of the ledger transaction associated with this bank transaction. */
  ledger_transaction_id?: string;
  /** The ID of the payment order that created this transaction, if applicable. */
  payment_order_id?: string;
  /** Unique ID from the bank. */
  vendor_id?: string;
  /** Type of the transaction (e.g., 'ACH', 'Wire', 'Card'). */
  type: string;
  /** Direction of the transaction. */
  direction: 'credit' | 'debit';
  /** Running balance of the bank account after this transaction. */
  running_balance?: number;
  /** Any custom metadata for the transaction. */
  metadata?: Record<string, string>;
  /** Relevant details specific to an ACH transaction. */
  ach?: {
    dfi_account_number?: string;
    dfi_routing_number?: string;
    trace_number?: string;
    originating_company_id?: string;
    originating_company_name?: string;
    receiving_company_name?: string;
    individual_id?: string;
    individual_name?: string;
    category?: string;
  };
  /** Relevant details specific to a wire transfer. */
  wire?: {
    bank_name?: string;
    routing_number?: string;
    swift_code?: string;
    beneficiary_name?: string;
    beneficiary_account?: string;
    originator_name?: string;
    originator_address?: string;
    originator_to_beneficiary_information?: string;
  };
  /** Relevant details specific to a check. */
  check?: {
    check_number?: string;
  };
  /** Relevant details specific to an RTP (Real-Time Payment). */
  rtp?: {
    payment_instruction_id?: string;
    sender_name?: string;
    sender_account_number?: string;
    receiver_name?: string;
    receiver_account_number?: string;
    payment_purpose_code?: string;
  };
  /** External account reference. */
  external_account_id?: string;
  /** ID of the statement line item. */
  statement_line_item_id?: string;
  /** Any fees associated with the transaction. */
  fees?: number;
}

/**
 * Modern Treasury Ledger Account.
 * @see https://docs.moderntreasury.com/api-reference/api-references/ledger-accounts/
 */
interface ModernTreasuryLedgerAccount {
  /** Unique identifier for the object. */
  id: string;
  /** The name of the ledger account. */
  name: string;
  /** The currency of the ledger account. */
  currency: string;
  /** The ID of the ledger that this account belongs to. */
  ledger_id: string;
  /** The ID of the ledger account category. */
  ledger_account_category_id?: string;
  /** The current balance of the ledger account. */
  balances: {
    pending_balance: {
      amount: number;
      credits: number;
      debits: number;
      currency: string;
    };
    posted_balance: {
      amount: number;
      credits: number;
      debits: number;
      currency: string;
    };
    opening_balance: {
      amount: number;
      credits: number;
      debits: number;
      currency: string;
    };
  };
  /** Any custom metadata for the ledger account. */
  metadata?: Record<string, string>;
  /** Timestamp when the ledger account was created. */
  created_at: string;
  /** Timestamp when the ledger account was last updated. */
  updated_at: string;
  /** Livemode indicator. */
  livemode: boolean;
  /** Normal balance type for the ledger account. */
  normal_balance_type: 'credit' | 'debit';
  /** Lock version for optimistic concurrency control. */
  lock_version?: number;
  /** The ledger ID of the parent ledger account, if this is a sub-account. */
  parent_ledger_account_id?: string;
  /** Description for the ledger account. */
  description?: string;
  /** Account number for the ledger account. */
  account_number?: string;
  /** Routing number for the ledger account. */
  routing_number?: string;
  /** External account ID linked to this ledger account. */
  external_account_id?: string;
}

// --- UTILITY FUNCTIONS ---

/**
 * Creates a unique identifier string. For production, this would use a robust UUID library.
 * This implementation is conceptual to adhere to "no imports" and "all logic".
 * @returns A pseudo-unique ID string.
 */
function generateUniqueId(): string {
  // A simple, non-cryptographic pseudo-UUID generation for demonstration purposes.
  // In a real application, consider `crypto.randomUUID()` or a dedicated UUID library.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Converts an amount from cents (or smallest currency unit) to a major currency unit.
 * @param amountInCents The amount in the smallest currency unit (e.g., cents for USD).
 * @param currency The currency code.
 * @returns The amount in major currency units.
 */
function convertCentsToMajorUnit(amountInCents: number, currency: Currency): number {
  // Most currencies have 2 decimal places. Handle exceptions if known.
  // For simplicity, assuming 100 smallest units per major unit.
  // JPY is an exception where 1 JPY is the smallest unit.
  if (currency === Currency.JPY) {
    return amountInCents;
  }
  return amountInCents / 100;
}

/**
 * Converts an amount from a major currency unit to cents (or smallest currency unit).
 * @param amountInMajorUnit The amount in major currency units.
 * @param currency The currency code.
 * @returns The amount in the smallest currency unit.
 */
function convertMajorUnitToCents(amountInMajorUnit: number, currency: Currency): number {
  if (currency === Currency.JPY) {
    return amountInMajorUnit;
  }
  return Math.round(amountInMajorUnit * 100);
}

/**
 * Formats a currency amount for display.
 * This is a basic implementation. For full internationalization, `Intl.NumberFormat` would be used.
 * @param amount The amount to format (in major units).
 * @param currency The currency code.
 * @param locale The locale string (e.g., 'en-US'). Defaults to 'en-US'.
 * @returns The formatted currency string.
 */
function formatCurrency(amount: number, currency: Currency, locale: string = 'en-US'): string {
  // Adhering to "no imports", so a simple string formatting.
  // In a real app: return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
  const symbolMap: { [key in Currency]?: string } = {
    [Currency.USD]: '$',
    [Currency.EUR]: '€',
    [Currency.GBP]: '£',
    [Currency.JPY]: '¥',
    [Currency.CAD]: 'C$',
    [Currency.AUD]: 'A$',
    [Currency.CNY]: '¥',
    [Currency.INR]: '₹',
    [Currency.BRL]: 'R$',
    [Currency.MXN]: 'Mex$',
    [Currency.ZAR]: 'R',
    [Currency.AED]: 'د.إ',
    [Currency.SGD]: 'S$',
    [Currency.HKD]: 'HK$',
    [Currency.NZD]: 'NZ$',
    [Currency.SEK]: 'kr',
    [Currency.NOK]: 'kr',
    [Currency.DKK]: 'kr',
    [Currency.KRW]: '₩',
    [Currency.RUB]: '₽',
    [Currency.THB]: '฿',
    [Currency.IDR]: 'Rp',
    [Currency.MYR]: 'RM',
    [Currency.PHP]: '₱',
    [Currency.CLP]: '$',
    [Currency.COP]: '$',
    [Currency.PEN]: 'S/',
    [Currency.ARS]: '$',
    [Currency.VND]: '₫',
    [Currency.PLN]: 'zł',
    [Currency.CZK]: 'Kč',
    [Currency.HUF]: 'Ft',
    [Currency.ILS]: '₪',
    [Currency.TRY]: '₺',
  };
  const symbol = symbolMap[currency] || currency;
  const decimalPlaces = currency === Currency.JPY ? 0 : 2;
  return `${symbol}${amount.toFixed(decimalPlaces)}`;
}

/**
 * Maps a Stripe PaymentIntent or Charge to the internal `Transaction` model.
 * This utility provides a conceptual data transformation logic.
 * @param stripeData The Stripe PaymentIntent or Charge object.
 * @param accountId The internal account ID associated with this transaction.
 * @param counterpartyId Optional internal counterparty ID.
 * @returns A `Transaction` object.
 */
function mapStripeToInternalTransaction(
  stripeData: StripePaymentIntent | StripeCharge,
  accountId: string,
  counterpartyId?: string,
): Transaction {
  const isPaymentIntent = (data: StripePaymentIntent | StripeCharge): data is StripePaymentIntent =>
    (data as StripePaymentIntent).object === "payment_intent";

  const id = generateUniqueId();
  const now = new Date().toISOString();
  const createdTimestamp = isPaymentIntent(stripeData) ? stripeData.created : stripeData.created;
  const transactionDate = new Date(createdTimestamp * 1000).toISOString(); // Stripe timestamps are in seconds

  let status: TransactionStatus;
  let type: TransactionType;
  let amount = stripeData.amount;
  let description = stripeData.description || "Stripe transaction";
  let externalId = stripeData.id;
  let metadata: Record<string, string | number | boolean | null> | undefined;
  if (stripeData.metadata) {
    metadata = Object.fromEntries(Object.entries(stripeData.metadata).map(([k, v]) => [k, v as string | number | boolean | null]));
  }

  if (isPaymentIntent(stripeData)) {
    switch (stripeData.status) {
      case "succeeded":
        status = TransactionStatus.Completed;
        type = TransactionType.Payment;
        amount = stripeData.amount_received; // Use received amount for accuracy
        break;
      case "failed":
        status = TransactionStatus.Failed;
        type = TransactionType.Payment;
        description += ` (Failed: ${stripeData.last_payment_error?.message || stripeData.last_payment_error?.code || 'unknown reason'})`;
        break;
      case "canceled":
        status = TransactionStatus.Canceled;
        type = TransactionType.Payment;
        break;
      case "processing":
        status = TransactionStatus.Processing;
        type = TransactionType.Payment;
        break;
      case "requires_action":
      case "requires_confirmation":
      case "requires_payment_method":
      default:
        status = TransactionStatus.Pending;
        type = TransactionType.Payment;
        break;
    }
    // Assume incoming payment to the business
    type = TransactionType.Credit; // Default for PaymentIntent that is 'succeeded'
    if (stripeData.transfer_data) {
      // If it has transfer_data, it implies funds are being sent out to a connected account
      type = TransactionType.Debit;
      amount = stripeData.transfer_data.amount || stripeData.amount;
    }
  } else { // StripeCharge
    switch (stripeData.status) {
      case "succeeded":
        status = TransactionStatus.Completed;
        type = TransactionType.Credit; // Usually a successful charge means funds received by us
        amount = stripeData.amount_captured;
        if (stripeData.amount_refunded > 0) {
          status = TransactionStatus.PartiallyRefunded;
        }
        break;
      case "pending":
        status = TransactionStatus.Pending;
        type = TransactionType.Credit;
        break;
      case "failed":
        status = TransactionStatus.Failed;
        type = TransactionType.Credit;
        description += ` (Failed: ${stripeData.failure_message || stripeData.failure_code || 'unknown reason'})`;
        break;
      default:
        status = TransactionStatus.Unknown;
        type = TransactionType.Credit;
        break;
    }
    if (stripeData.disputed) {
      status = TransactionStatus.Disputed;
    }
    if (stripeData.refunds && stripeData.refunds.length > 0 && stripeData.amount_refunded === stripeData.amount) {
      status = TransactionStatus.Refunded;
    }
  }

  // Determine counterparty name and potentially merchant details
  let counterpartyName: string | undefined;
  let merchantDetails: Transaction['merchant'] | undefined;
  if (isPaymentIntent(stripeData) && typeof stripeData.customer === 'object' && stripeData.customer !== null) {
    counterpartyName = stripeData.customer.name || stripeData.customer.email || `Stripe Customer ${stripeData.customer.id}`;
  } else if (!isPaymentIntent(stripeData)) {
    // For charges, often the merchant is *us*, and the counterparty is the customer.
    // Stripe charges are usually "payments received by us".
    // The 'merchant' field here would represent the payer/customer if we were processing their payment.
    // However, for Citibank Demo Business, we are the merchant.
    // Let's assume the `description` often contains merchant info if it's an expense *we* made.
    // Or, if this charge is related to *our* customer, the counterparty is that customer.
    counterpartyName = stripeData.description?.split(' for ')[0]; // Heuristic for example
    merchantDetails = {
      name: counterpartyName, // This is a bit ambiguous, but to populate the field
      address: stripeData.shipping?.address || stripeData.billing_details?.address || undefined,
    };
  }

  return {
    id,
    createdAt: now,
    updatedAt: now,
    externalId: externalId,
    source: RecordSource.Stripe,
    type: type,
    status: status,
    amount: amount,
    currency: stripeData.currency.toUpperCase() as Currency,
    description: description,
    transactionDate: transactionDate,
    postedDate: isPaymentIntent(stripeData) ? (stripeData.latest_charge && typeof stripeData.latest_charge === 'object' ? new Date(stripeData.latest_charge.created * 1000).toISOString() : undefined) : new Date(stripeData.created * 1000).toISOString(),
    accountId: accountId, // This should be the internal Citibank Demo Business account
    counterpartyId: counterpartyId,
    counterpartyName: counterpartyName,
    category: undefined, // Stripe does not provide a direct category field comparable to Plaid
    fees: (isPaymentIntent(stripeData) ? stripeData.application_fee_amount : stripeData.application_fee_amount) || undefined,
    isReconciled: false,
    paymentMethod: isPaymentIntent(stripeData) ? (stripeData.payment_method_types.includes('card') ? PaymentMethod.Card : PaymentMethod.Other) : (stripeData.payment_method_details?.type === 'card' ? PaymentMethod.Card : PaymentMethod.Other),
    merchant: merchantDetails,
    metadata: metadata,
  };
}

/**
 * Maps a Plaid Transaction to the internal `Transaction` model.
 * @param plaidTransaction The Plaid Transaction object.
 * @param accountId The internal account ID associated with this transaction.
 * @param counterpartyId Optional internal counterparty ID.
 * @returns A `Transaction` object.
 */
function mapPlaidToInternalTransaction(
  plaidTransaction: PlaidTransaction,
  accountId: string,
  counterpartyId?: string,
): Transaction {
  const id = generateUniqueId();
  const now = new Date().toISOString();
  const transactionDate = plaidTransaction.authorized_date || plaidTransaction.date;
  const postedDate = plaidTransaction.date;

  let type: TransactionType;
  let status: TransactionStatus = TransactionStatus.Completed; // Plaid usually gives posted transactions
  let description = plaidTransaction.name;
  let amount = Math.abs(plaidTransaction.amount); // Plaid amount can be positive/negative

  if (plaidTransaction.pending) {
    status = TransactionStatus.Pending;
  }

  if (plaidTransaction.amount < 0) {
    type = TransactionType.Debit; // Money leaving the account
  } else {
    type = TransactionType.Credit; // Money entering the account
  }

  // Refine transaction type based on Plaid category if available
  if (plaidTransaction.personal_finance_category?.primary) {
    switch (plaidTransaction.personal_finance_category.primary) {
      case "TRANSFER":
        type = TransactionType.Transfer;
        break;
      case "LOAN PAYMENTS":
      case "CREDIT CARD PAYMENTS":
        type = TransactionType.Payment;
        break;
      case "BANK FEES":
        type = TransactionType.Fee;
        break;
      case "INCOME":
        type = TransactionType.Credit;
        break;
      case "WITHDRAWAL":
        type = TransactionType.Withdrawal;
        break;
      case "DEPOSIT":
        type = TransactionType.Deposit;
        break;
      case "SERVICE":
      case "SHOPS":
      case "FOOD_AND_DRINK":
      case "TRAVEL":
      case "GENERAL MERCHANDISE":
        type = TransactionType.Purchase; // General purchase
        break;
      default:
        // Keep derived type
        break;
    }
  } else if (plaidTransaction.category && plaidTransaction.category.length > 0) {
    if (plaidTransaction.category[0].includes('Payment')) type = TransactionType.Payment;
    if (plaidTransaction.category[0].includes('Transfer')) type = TransactionType.Transfer;
    if (plaidTransaction.category[0].includes('Fee')) type = TransactionType.Fee;
    if (plaidTransaction.category[0].includes('Refund')) type = TransactionType.Refund;
    if (plaidTransaction.category[0].includes('Deposit')) type = TransactionType.Deposit;
    if (plaidTransaction.category[0].includes('Withdrawal')) type = TransactionType.Withdrawal;
  }

  let paymentMethod: PaymentMethod = PaymentMethod.Other;
  if (plaidTransaction.payment_channel === 'in store' || plaidTransaction.payment_channel === 'online') {
    if (description.toLowerCase().includes('card')) {
      paymentMethod = PaymentMethod.Card;
    }
  }

  return {
    id,
    createdAt: now,
    updatedAt: now,
    externalId: plaidTransaction.transaction_id,
    source: RecordSource.Plaid,
    type: type,
    status: status,
    amount: convertMajorUnitToCents(amount, plaidTransaction.iso_currency_code?.toUpperCase() as Currency || Currency.USD),
    currency: plaidTransaction.iso_currency_code?.toUpperCase() as Currency || Currency.USD,
    description: plaidTransaction.name,
    transactionDate: transactionDate,
    postedDate: postedDate,
    accountId: accountId,
    counterpartyId: counterpartyId,
    counterpartyName: plaidTransaction.merchant_name || plaidTransaction.name,
    category: plaidTransaction.personal_finance_category?.primary || plaidTransaction.category?.[0],
    subcategory: plaidTransaction.personal_finance_category?.detailed || plaidTransaction.category?.[1],
    isReconciled: false,
    paymentMethod: paymentMethod,
    merchant: {
      name: plaidTransaction.merchant_name || plaidTransaction.name,
      address: plaidTransaction.location ? {
        line1: plaidTransaction.location.address || '',
        city: plaidTransaction.location.city || '',
        state: plaidTransaction.location.region || '',
        postalCode: plaidTransaction.location.postal_code || '',
        country: plaidTransaction.location.country || '',
      } : undefined,
      website: plaidTransaction.website,
    },
    metadata: {
      plaidOriginalDescription: plaidTransaction.original_description,
      plaidCategoryType: plaidTransaction.category_id,
      plaidTransactionCode: plaidTransaction.transaction_code,
    },
  };
}

/**
 * Maps a Modern Treasury Transaction to the internal `Transaction` model.
 * @param mtTransaction The Modern Treasury Transaction object.
 * @param accountId The internal account ID associated with this transaction.
 * @param counterpartyId Optional internal counterparty ID.
 * @returns A `Transaction` object.
 */
function mapModernTreasuryToInternalTransaction(
  mtTransaction: ModernTreasuryTransaction,
  accountId: string,
  counterpartyId?: string,
): Transaction {
  const id = generateUniqueId();
  const now = new Date().toISOString();

  let type: TransactionType;
  if (mtTransaction.direction === 'credit') {
    type = TransactionType.Credit;
  } else {
    type = TransactionType.Debit;
  }

  let status: TransactionStatus = TransactionStatus.Completed; // MT transactions are usually posted
  if (mtTransaction.type === 'ACH' && mtTransaction.ach && !mtTransaction.ach.trace_number) {
    // ACH transactions often have a pending period
    status = TransactionStatus.Pending; // Heuristic
  }

  let paymentMethod: PaymentMethod = PaymentMethod.Other;
  switch (mtTransaction.type) {
    case 'ACH': paymentMethod = PaymentMethod.ACH; break;
    case 'Wire': paymentMethod = PaymentMethod.Wire; break;
    case 'RTP': paymentMethod = PaymentMethod.RTP; break;
    case 'SEPA': paymentMethod = PaymentMethod.SEPA; break;
    case 'SWIFT': paymentMethod = PaymentMethod.SWIFT; break;
    case 'Check': paymentMethod = PaymentMethod.Check; break;
    case 'Card':
    case 'DebitCard':
    case 'CreditCard':
      paymentMethod = PaymentMethod.Card;
      break;
  }

  let counterpartyName: string | undefined;
  if (mtTransaction.ach?.receiving_company_name) {
    counterpartyName = mtTransaction.ach.receiving_company_name;
  } else if (mtTransaction.ach?.originating_company_name) {
    counterpartyName = mtTransaction.ach.originating_company_name;
  } else if (mtTransaction.wire?.beneficiary_name) {
    counterpartyName = mtTransaction.wire.beneficiary_name;
  } else if (mtTransaction.wire?.originator_name) {
    counterpartyName = mtTransaction.wire.originator_name;
  } else if (mtTransaction.rtp?.sender_name) {
    counterpartyName = mtTransaction.rtp.sender_name;
  } else if (mtTransaction.rtp?.receiver_name) {
    counterpartyName = mtTransaction.rtp.receiver_name;
  } else if (mtTransaction.description) {
    // Attempt to parse description for a counterparty name.
    const parts = mtTransaction.description.split(' - ');
    if (parts.length > 1) {
      counterpartyName = parts[0].trim();
    } else {
      counterpartyName = mtTransaction.description.trim();
    }
  }

  return {
    id,
    createdAt: now,
    updatedAt: now,
    externalId: mtTransaction.id,
    source: RecordSource.ModernTreasury,
    type: type,
    status: status,
    amount: mtTransaction.amount,
    currency: mtTransaction.currency.toUpperCase() as Currency,
    description: mtTransaction.description,
    transactionDate: mtTransaction.transaction_date,
    postedDate: mtTransaction.transaction_date, // MT provides a single transaction_date for posting
    accountId: accountId,
    counterpartyId: counterpartyId,
    counterpartyName: counterpartyName,
    category: mtTransaction.ach?.category, // ACH category can be useful
    fees: mtTransaction.fees,
    isReconciled: false,
    paymentMethod: paymentMethod,
    metadata: {
      mtVendorId: mtTransaction.vendor_id,
      mtStatementLineItemId: mtTransaction.statement_line_item_id,
      ...mtTransaction.metadata, // Spread any existing metadata
    },
  };
}

/**
 * Validates a transaction against a set of business rules.
 * This is a conceptual function and can be expanded with real validation logic.
 * @param transaction The transaction to validate.
 * @returns True if the transaction is valid, false otherwise, along with a list of errors.
 */
function validateTransaction(transaction: Transaction): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!transaction.id || transaction.id.trim() === '') {
    errors.push("Transaction ID is required.");
  }
  if (!transaction.accountId || transaction.accountId.trim() === '') {
    errors.push("Account ID is required.");
  }
  if (transaction.amount <= 0) {
    errors.push("Transaction amount must be positive.");
  }
  if (!Object.values(Currency).includes(transaction.currency)) {
    errors.push(`Invalid currency: ${transaction.currency}.`);
  }
  if (!Object.values(TransactionType).includes(transaction.type)) {
    errors.push(`Invalid transaction type: ${transaction.type}.`);
  }
  if (!Object.values(TransactionStatus).includes(transaction.status)) {
    errors.push(`Invalid transaction status: ${transaction.status}.`);
  }
  if (new Date(transaction.transactionDate).toString() === 'Invalid Date') {
    errors.push("Invalid transaction date format.");
  }
  if (transaction.postedDate && new Date(transaction.postedDate).toString() === 'Invalid Date') {
    errors.push("Invalid posted date format.");
  }
  if (transaction.postedDate && new Date(transaction.postedDate) < new Date(transaction.transactionDate)) {
    errors.push("Posted date cannot be before transaction date.");
  }

  // Example of a specific business rule:
  // All transactions from a certain source must have a description.
  if (transaction.source === RecordSource.Stripe && (!transaction.description || transaction.description.trim() === '')) {
    errors.push("Stripe transactions must have a description.");
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Generates a payload for creating a Payment Order in Modern Treasury.
 * This function encapsulates the structure required by MT, assuming `ModernTreasuryPaymentOrder`
 * represents the desired input structure.
 * @param payment The internal `Payment` object.
 * @param originatingMtAccountId The Modern Treasury Bank Account ID for the originating account.
 * @param receivingMtExternalAccountId The Modern Treasury External Account ID for the recipient.
 * @returns A partial `ModernTreasuryPaymentOrder` suitable for creation.
 */
function generatePaymentOrderPayload(
  payment: Payment,
  originatingMtAccountId: string,
  receivingMtExternalAccountId: string,
): Omit<ModernTreasuryPaymentOrder, 'id' | 'created_at' | 'updated_at' | 'livemode' | 'status'> {
  // Map internal types to MT types
  let mtPaymentType: ModernTreasuryPaymentType;
  switch (payment.paymentMethod) {
    case PaymentMethod.ACH: mtPaymentType = ModernTreasuryPaymentType.ACH; break;
    case PaymentMethod.Wire: mtPaymentType = ModernTreasuryPaymentType.Wire; break;
    case PaymentMethod.RTP: mtPaymentType = ModernTreasuryPaymentType.RTP; break;
    case PaymentMethod.SEPA: mtPaymentType = ModernTreasuryPaymentType.SEPA; break;
    case PaymentMethod.SWIFT: mtPaymentType = ModernTreasuryPaymentType.SWIFT; break;
    case PaymentMethod.Check: mtPaymentType = ModernTreasuryPaymentType.Check; break;
    case PaymentMethod.Card: mtPaymentType = ModernTreasuryPaymentType.CreditCard; break; // Assuming payment is via card
    default: mtPaymentType = ModernTreasuryPaymentType.Other; break;
  }

  const effectiveDate = payment.expectedSettlementDate || payment.initiatedDate;

  return {
    amount: payment.amount,
    currency: payment.currency.toLowerCase(),
    description: payment.description,
    effective_date: effectiveDate.split('T')[0], // Extract YYYY-MM-DD
    originating_account_id: originatingMtAccountId,
    receiving_account_id: receivingMtExternalAccountId,
    type: mtPaymentType,
    direction: payment.type === TransactionType.Debit ? 'debit' : 'credit',
    priority: 'normal', // Default to normal
    remittance_information: payment.invoiceId || payment.description,
    send_remittance_advice: true,
    metadata: {
      internalPaymentId: payment.id,
      internalSenderAccountId: payment.senderAccountId,
      internalReceiverAccountId: payment.receiverAccountId || 'N/A',
      internalCounterpartyId: payment.counterpartyId,
      ...payment.metadata, // Include any custom metadata from the internal payment
      'citibankdemobusiness.dev-ref': `payment:${payment.id}`, // Custom marker
    },
  };
}

/**
 * Calculates the current balance of an account based on a list of transactions.
 * This is a simplified calculation and would need more sophisticated ledger-style
 * logic for high-accuracy financial reporting.
 * @param account The base account.
 * @param transactions A list of transactions related to the account.
 * @returns The calculated current balance.
 */
function calculateAccountBalance(account: Account, transactions: Transaction[]): number {
  let balance = account.balance; // Start with the last known balance

  // Assuming transactions are ordered chronologically and reflect changes since `account.balance` was last updated.
  // For simplicity, this function will re-calculate based on all provided transactions.
  balance = 0; // Reset to 0 and re-sum for demonstration robustness

  transactions.forEach(tx => {
    if (tx.accountId === account.id) {
      if (tx.type === TransactionType.Credit) {
        balance += tx.amount;
      } else if (tx.type === TransactionType.Debit) {
        balance -= tx.amount;
      }
    }
  });

  return balance;
}

/**
 * Checks if a transaction is considered "high-value" based on a configurable threshold.
 * @param transaction The transaction to check.
 * @param threshold The amount (in smallest currency units) above which a transaction is considered high-value.
 * @returns True if the transaction amount exceeds the threshold, false otherwise.
 */
function isHighValueTransaction(transaction: Transaction, threshold: number = 1000000): boolean { // Default to $10,000.00
  return transaction.amount >= threshold;
}

/**
 * Creates an authentication header string for Citibank Demo Business API requests.
 * This is a conceptual utility, as actual auth logic depends on the chosen auth scheme (e.g., OAuth, API keys).
 * The base URL `citibankdemobusiness.dev` is explicitly referenced here.
 * @param token The authentication token (e.g., JWT, API key).
 * @param type The type of token (e.g., 'Bearer', 'ApiKey').
 * @returns The formatted authorization header string.
 */
function constructAuthHeaderForCitibankDemoBusiness(token: string, type: 'Bearer' | 'ApiKey' = 'Bearer'): string {
  // In a real application, this would involve more complex logic, potentially
  // interacting with an internal auth service hosted at citibankdemobusiness.dev/auth.
  if (!token || token.trim() === '') {
    console.warn("Attempted to construct auth header with an empty token for citibankdemobusiness.dev.");
    return '';
  }
  return `${type} ${token}`;
}

/**
 * Performs reconciliation for a given list of internal transactions and their external counterparts.
 * This function simulates matching transactions based on amount, date, and descriptions.
 * It's a highly simplified version; real reconciliation is very complex.
 * @param internalTransactions An array of internal `Transaction` objects.
 * @param externalTransactions An array of external transaction data (can be mixed Stripe, Plaid, MT).
 * @param internalAccounts Map of internal account IDs to `Account` objects.
 * @param counterparties Map of counterparty IDs to `Counterparty` objects.
 * @returns An object containing reconciled and unreconciled transactions.
 */
function performReconciliation(
  internalTransactions: Transaction[],
  externalTransactions: (StripeCharge | StripePaymentIntent | PlaidTransaction | ModernTreasuryTransaction)[],
  internalAccounts: Map<string, Account>,
  counterparties: Map<string, Counterparty>,
): {
  reconciled: Array<{ internal: Transaction; external: Transaction; }>;
  unreconciledInternal: Transaction[];
  unreconciledExternal: (StripeCharge | StripePaymentIntent | PlaidTransaction | ModernTreasuryTransaction)[];
} {
  const reconciled: Array<{ internal: Transaction; external: Transaction; }> = [];
  const unreconciledInternal = [...internalTransactions];
  const unreconciledExternal = [...externalTransactions];

  // A very basic matching strategy: amount, date (within a day), and description similarity.
  // In a real system, this would involve robust matching algorithms, machine learning,
  // and user-driven matching rules.

  for (let i = 0; i < unreconciledInternal.length; i++) {
    const internalTx = unreconciledInternal[i];
    let matchedIndex = -1;

    for (let j = 0; j < unreconciledExternal.length; j++) {
      const externalRawTx = unreconciledExternal[j];
      let externalMappedTx: Transaction | null = null;
      let externalSource: RecordSource | undefined;

      // Map external raw data to our internal Transaction type for comparison
      if ('object' in externalRawTx && (externalRawTx as StripeCharge).object === 'charge' || (externalRawTx as StripePaymentIntent).object === 'payment_intent') {
        const relatedAccount = internalAccounts.get(internalTx.accountId);
        if (relatedAccount && relatedAccount.externalId?.stripeConnectAccountId) {
          externalMappedTx = mapStripeToInternalTransaction(externalRawTx as StripeCharge | StripePaymentIntent, internalTx.accountId, internalTx.counterpartyId);
          externalSource = RecordSource.Stripe;
        }
      } else if ('transaction_id' in externalRawTx && (externalRawTx as PlaidTransaction).transaction_id) {
        const relatedAccount = internalAccounts.get(internalTx.accountId);
        if (relatedAccount && relatedAccount.externalId?.plaidAccountId === (externalRawTx as PlaidTransaction).account_id) {
          externalMappedTx = mapPlaidToInternalTransaction(externalRawTx as PlaidTransaction, internalTx.accountId, internalTx.counterpartyId);
          externalSource = RecordSource.Plaid;
        }
      } else if ('bank_account_id' in externalRawTx && (externalRawTx as ModernTreasuryTransaction).bank_account_id) {
        const relatedAccount = internalAccounts.get(internalTx.accountId);
        if (relatedAccount && relatedAccount.externalId?.modernTreasuryAccountId === (externalRawTx as ModernTreasuryTransaction).bank_account_id) {
          externalMappedTx = mapModernTreasuryToInternalTransaction(externalRawTx as ModernTreasuryTransaction, internalTx.accountId, internalTx.counterpartyId);
          externalSource = RecordSource.ModernTreasury;
        }
      }

      if (!externalMappedTx || externalMappedTx.source !== internalTx.source) {
        continue;
      }

      const amountMatch = internalTx.amount === externalMappedTx.amount;
      const dateMatch = Math.abs(new Date(internalTx.transactionDate).getTime() - new Date(externalMappedTx.transactionDate).getTime()) <= (24 * 60 * 60 * 1000); // within 24 hours
      const descriptionSimilarity = internalTx.description.includes(externalMappedTx.description) || externalMappedTx.description.includes(internalTx.description); // simple substring match

      if (amountMatch && dateMatch && descriptionSimilarity) {
        reconciled.push({ internal: internalTx, external: externalMappedTx });
        matchedIndex = j;
        break; // Found a match for this internal transaction
      }
    }

    if (matchedIndex !== -1) {
      unreconciledInternal.splice(i, 1); // Remove from internal list
      unreconciledExternal.splice(matchedIndex, 1); // Remove from external list
      i--; // Adjust index due to splice
    }
  }

  // Any remaining items in unreconciledInternal or unreconciledExternal indicate discrepancies.
  // For external transactions that didn't match, we might want to create new internal transactions.
  const newInternalTransactionsFromUnreconciledExternal: Transaction[] = [];
  unreconciledExternal.forEach(extTx => {
    let mappedTx: Transaction | null = null;
    let targetAccountId: string | undefined;

    // Determine which internal account this external transaction belongs to
    if ('account_id' in extTx && (extTx as PlaidTransaction).account_id) {
      for (const [internalAccId, internalAcc] of internalAccounts.entries()) {
        if (internalAcc.externalId?.plaidAccountId === (extTx as PlaidTransaction).account_id) {
          targetAccountId = internalAccId;
          break;
        }
      }
      if (targetAccountId) {
        mappedTx = mapPlaidToInternalTransaction(extTx as PlaidTransaction, targetAccountId);
      }
    } else if ('bank_account_id' in extTx && (extTx as ModernTreasuryTransaction).bank_account_id) {
      for (const [internalAccId, internalAcc] of internalAccounts.entries()) {
        if (internalAcc.externalId?.modernTreasuryAccountId === (extTx as ModernTreasuryTransaction).bank_account_id) {
          targetAccountId = internalAccId;
          break;
        }
      }
      if (targetAccountId) {
        mappedTx = mapModernTreasuryToInternalTransaction(extTx as ModernTreasuryTransaction, targetAccountId);
      }
    } else if ('object' in extTx && ((extTx as StripeCharge).object === 'charge' || (extTx as StripePaymentIntent).object === 'payment_intent')) {
      // Stripe mapping can be more complex, as a single Stripe charge/payment intent might not directly map to a single bank_account_id
      // but rather to a platform account in our system. This would require more context.
      // For simplicity here, let's assume if it's external, we need to map it to an existing internal account.
      // This part would ideally need more context about which internal account is linked to the Stripe platform.
      for (const [internalAccId, internalAcc] of internalAccounts.entries()) {
        if (internalAcc.externalId?.stripeConnectAccountId) { // If a general Stripe account is linked
          // A more robust check might involve matching currency and direction
          mappedTx = mapStripeToInternalTransaction(extTx as StripeCharge | StripePaymentIntent, internalAccId);
          break;
        }
      }
    }

    if (mappedTx) {
      newInternalTransactionsFromUnreconciledExternal.push({ ...mappedTx, isReconciled: true, reconciliationBatchId: generateUniqueId() });
    }
  });

  // For the purpose of this function's return, we'll keep the raw external objects in unreconciledExternal,
  // but note that in a real system, they might be processed into new internal transactions.

  return {
    reconciled,
    unreconciledInternal,
    unreconciledExternal,
    // For a real system, you'd probably return newInternalTransactionsFromUnreconciledExternal as a separate output
    // and let the caller decide how to persist them.
  };
}


/**
 * Processes a webhook event from an external financial service.
 * This is a conceptual function that would handle incoming data from Stripe, Plaid, or Modern Treasury.
 * @param eventData The raw payload of the webhook event.
 * @param eventSource The source of the webhook (e.g., 'stripe', 'plaid', 'moderntreasury').
 * @param signature Optional cryptographic signature for verification.
 * @returns A string indicating the result of the processing.
 */
function processWebhookEvent(
  eventData: Record<string, any>,
  eventSource: RecordSource,
  signature?: string,
): string {
  // In a real application, webhook processing involves:
  // 1. Signature verification (crucial for security)
  // 2. Parsing and validating the event data against expected schemas
  // 3. Updating internal database records based on event type
  // 4. Triggering follow-up actions (e.g., send notifications, update ledger)

  // For this "no imports" context, we'll simulate the logic.

  let verificationStatus = "N/A (Conceptual)";
  if (signature) {
    // Conceptual verification logic.
    // In reality, this would use a cryptographic library.
    const expectedSignature = `hmac_sha256(${JSON.stringify(eventData)}, 'YOUR_WEBHOOK_SECRET')`;
    if (signature === expectedSignature) { // This is a placeholder comparison
      verificationStatus = "Verified";
    } else {
      verificationStatus = "Verification Failed";
      // Log an error and potentially reject the event
      return `Webhook processing failed: ${eventSource} signature verification failed.`;
    }
  }

  try {
    switch (eventSource) {
      case RecordSource.Stripe:
        if (eventData.type === StripeEventType.PaymentIntentSucceeded) {
          const paymentIntent = eventData.data.object as StripePaymentIntent;
          // Simulate finding a matching internal account/counterparty
          const exampleInternalAccountId = 'acc_citibank_123'; // Placeholder
          const exampleInternalCounterpartyId = paymentIntent.customer && typeof paymentIntent.customer === 'string' ? paymentIntent.customer : 'cp_unknown'; // Placeholder
          const internalTx = mapStripeToInternalTransaction(paymentIntent, exampleInternalAccountId, exampleInternalCounterpartyId);
          // console.log(`[Citibank Demo Business] Processed Stripe PaymentIntent Succeeded: ${internalTx.id}`);
          return `Processed Stripe PaymentIntent ${paymentIntent.id} (Status: ${internalTx.status}, Verification: ${verificationStatus})`;
        } else if (eventData.type === StripeEventType.ChargeRefunded) {
          const refund = eventData.data.object as StripeRefund;
          // Simulate refund processing
          return `Processed Stripe Refund ${refund.id} (Verification: ${verificationStatus})`;
        }
        return `Processed Stripe Event Type: ${eventData.type} (Verification: ${verificationStatus})`;

      case RecordSource.Plaid:
        if (eventData.webhook_type === 'TRANSACTIONS' && eventData.webhook_code === 'TRANSACTIONS_POSTED') {
          // Simulate fetching new transactions and updating internal records
          const transactions = eventData.transactions as PlaidTransaction[];
          const item_id = eventData.item_id;
          // Find internal account linked to this Plaid Item
          const exampleInternalAccountId = 'acc_citibank_plaid_456'; // Placeholder
          transactions.forEach(plaidTx => {
            const internalTx = mapPlaidToInternalTransaction(plaidTx, exampleInternalAccountId);
            // console.log(`[Citibank Demo Business] Processed Plaid Transaction: ${internalTx.id}`);
          });
          return `Processed Plaid Transactions webhook for Item ${item_id} (New transactions: ${transactions.length}, Verification: ${verificationStatus})`;
        } else if (eventData.webhook_type === 'ITEM' && eventData.webhook_code === 'ERROR') {
          // Handle Plaid item errors (e.g., login required)
          return `Processed Plaid Item Error for Item ${eventData.item_id} (Error: ${eventData.error.error_message}, Verification: ${verificationStatus})`;
        }
        return `Processed Plaid Webhook (Type: ${eventData.webhook_type}, Code: ${eventData.webhook_code}, Verification: ${verificationStatus})`;

      case RecordSource.ModernTreasury:
        if (eventData.event_type === 'payment_order_created' || eventData.event_type === 'payment_order_completed') {
          const paymentOrder = eventData.data.object as ModernTreasuryPaymentOrder;
          // Update internal payment status based on MT payment order lifecycle
          return `Processed Modern Treasury Payment Order ${paymentOrder.id} (${paymentOrder.status}, Verification: ${verificationStatus})`;
        } else if (eventData.event_type === 'transaction_created') {
          const mtTransaction = eventData.data.object as ModernTreasuryTransaction;
          // Create or update internal transaction from MT bank transaction
          const exampleInternalAccountId = 'acc_citibank_mt_789'; // Placeholder
          const internalTx = mapModernTreasuryToInternalTransaction(mtTransaction, exampleInternalAccountId);
          return `Processed Modern Treasury Transaction ${mtTransaction.id} (Status: ${internalTx.status}, Verification: ${verificationStatus})`;
        }
        return `Processed Modern Treasury Webhook (Type: ${eventData.event_type}, Verification: ${verificationStatus})`;

      case RecordSource.CitibankDemoBusinessInternal:
        return `Internal system event processed (Verification: ${verificationStatus})`; // Should not be via webhook
      case RecordSource.Manual:
        return `Manual event processed (Verification: ${verificationStatus})`; // Should not be via webhook
      case RecordSource.Other:
      default:
        return `Unknown Webhook Source: ${eventSource} (Verification: ${verificationStatus})`;
    }
  } catch (error: any) {
    return `Webhook processing failed for ${eventSource}: ${error.message} (Verification: ${verificationStatus})`;
  }
}

/**
 * Retrieves a conceptual list of active financial instruments for a given account.
 * This is a placeholder for actual database/API calls.
 * @param accountId The ID of the internal account.
 * @returns A promise resolving to an array of `FinancialInstrument` objects.
 */
function getAccountFinancialInstruments(accountId: string): FinancialInstrument[] {
  // In a real application, this would fetch from a database.
  // For "no imports" and "all logic", we return mock data based on types.
  const instruments: FinancialInstrument[] = [];
  const now = new Date().toISOString();

  if (accountId === 'acc_citibank_123') { // Example for a Stripe-linked account
    instruments.push({
      id: generateUniqueId(),
      createdAt: now,
      updatedAt: now,
      name: "Citi Business Visa ****4242",
      instrumentType: PaymentMethod.Card,
      currency: Currency.USD,
      maskedIdentifier: "****4242",
      accountId: accountId,
      externalId: {
        stripePaymentMethodId: 'pm_card_visa',
        tokenizedPaymentProviderId: 'tok_visa',
      },
      status: 'active',
      addedDate: now,
      expirationDate: '2025-12-31',
      holderName: 'James B. O’Callaghan III',
      cardBrand: 'Visa',
      isDefault: true,
      verificationStatus: 'verified',
    }, {
      id: generateUniqueId(),
      createdAt: now,
      updatedAt: now,
      name: "Citi Business Checking ACH",
      instrumentType: AccountType.Checking,
      currency: Currency.USD,
      maskedIdentifier: "ACH ****1001",
      accountId: accountId,
      externalId: {
        modernTreasuryExternalAccountId: 'ea_citibank_ach',
      },
      status: 'active',
      addedDate: now,
      bankAccountType: 'business',
      verificationStatus: 'verified',
    });
  } else if (accountId === 'acc_citibank_plaid_456') { // Example for a Plaid-linked account
    instruments.push({
      id: generateUniqueId(),
      createdAt: now,
      updatedAt: now,
      name: "Plaid Connected Checking",
      instrumentType: AccountType.Checking,
      currency: Currency.USD,
      maskedIdentifier: "****5678",
      accountId: accountId,
      externalId: {
        plaidAccountId: 'plaid_acc_abc',
      },
      status: 'active',
      addedDate: now,
      holderName: 'James B. O’Callaghan III',
      bankAccountType: 'checking',
      verificationStatus: 'verified',
    });
  }

  return instruments;
}


/**
 * Orchestrates a payment flow through Modern Treasury.
 * This function is a conceptual wrapper for initiating a payment.
 * @param paymentDetails The internal payment details.
 * @param originatingAccount The internal account from which funds will be sent.
 * @param recipientCounterparty The internal counterparty who will receive funds.
 * @param recipientExternalAccount The Modern Treasury External Account ID for the recipient.
 * @returns A promise resolving to the created `Payment` object (updated with external details) or null if failed.
 */
async function initiateModernTreasuryPayment(
  paymentDetails: Payment,
  originatingAccount: Account,
  recipientCounterparty: Counterparty,
  recipientExternalAccount: ModernTreasuryExternalAccount,
): Promise<Payment | null> {
  // Simulates an asynchronous operation (e.g., API call to Modern Treasury).
  // Due to "no imports," we can't use `fetch` or `axios`.
  // We simulate a delay and success/failure.

  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

  if (!originatingAccount.externalId?.modernTreasuryAccountId) {
    console.error(`[citibankdemobusiness.dev] Originating account ${originatingAccount.id} is not linked to Modern Treasury.`);
    return null;
  }

  try {
    const paymentOrderPayload = generatePaymentOrderPayload(
      paymentDetails,
      originatingAccount.externalId.modernTreasuryAccountId,
      recipientExternalAccount.id
    );

    // Simulate sending to Modern Treasury and getting a response
    const mockModernTreasuryResponse: ModernTreasuryPaymentOrder = {
      ...paymentOrderPayload,
      id: `po_${generateUniqueId()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      livemode: true,
      status: ModernTreasuryPaymentOrderStatus.Processing, // Assume it goes into processing
      description: paymentOrderPayload.description || 'Payment initiated via Citibank Demo Business',
      originating_account_id: paymentOrderPayload.originating_account_id,
      receiving_account_id: paymentOrderPayload.receiving_account_id,
      amount: paymentOrderPayload.amount,
      currency: paymentOrderPayload.currency,
      effective_date: paymentOrderPayload.effective_date,
      type: paymentOrderPayload.type,
      direction: paymentOrderPayload.direction,
      priority: paymentOrderPayload.priority,
    };

    const updatedPayment: Payment = {
      ...paymentDetails,
      status: TransactionStatus.Processing,
      lifecycleStage: PaymentLifecycleStage.Initiated,
      externalId: mockModernTreasuryResponse.id,
      // Any other fields updated by MT
      metadata: {
        ...paymentDetails.metadata,
        modernTreasuryPaymentOrderId: mockModernTreasuryResponse.id,
        mtPaymentOrderPayload: JSON.stringify(paymentOrderPayload), // Store the payload for debug
      },
    };

    console.log(`[citibankdemobusiness.dev] Successfully initiated payment order ${mockModernTreasuryResponse.id} via Modern Treasury.`);
    return updatedPayment;

  } catch (error: any) {
    console.error(`[citibankdemobusiness.dev] Failed to initiate Modern Treasury payment for ${paymentDetails.id}: ${error.message}`);
    return null;
  }
}

/**
 * Retrieves the details of a specific internal transaction.
 * This function simulates fetching transaction data from a conceptual internal store.
 * @param transactionId The ID of the transaction to retrieve.
 * @returns A promise resolving to the `Transaction` object or null if not found.
 */
async function getTransactionDetails(transactionId: string): Promise<Transaction | null> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async fetch

  // In a real application, this would query a database.
  // Here, we return a mock based on the ID.
  if (transactionId.startsWith('tx_')) {
    return {
      id: transactionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: RecordSource.CitibankDemoBusinessInternal,
      type: TransactionType.Credit,
      status: TransactionStatus.Completed,
      amount: 500000, // $5000.00
      currency: Currency.USD,
      description: "Mock Internal Transaction for Demo",
      transactionDate: "2023-10-26T10:00:00Z",
      accountId: "acc_citibank_123",
      counterpartyId: "cp_demo_vendor",
      counterpartyName: "Demo Vendor Inc.",
      category: "Software",
      isReconciled: true,
    };
  }
  return null;
}

/**
 * Updates the status of an internal transaction.
 * This simulates a persistence layer interaction.
 * @param transactionId The ID of the transaction to update.
 * @param newStatus The new status to set.
 * @param metadataUpdates Optional additional metadata to update.
 * @returns A promise resolving to the updated `Transaction` object or null if not found.
 */
async function updateTransactionStatus(
  transactionId: string,
  newStatus: TransactionStatus,
  metadataUpdates?: Record<string, string | number | boolean | null>,
): Promise<Transaction | null> {
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async update

  const existingTx = await getTransactionDetails(transactionId); // Fetch existing mock
  if (existingTx) {
    const updatedTx = {
      ...existingTx,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      metadata: { ...existingTx.metadata, ...metadataUpdates },
    };
    console.log(`[citibankdemobusiness.dev] Transaction ${transactionId} status updated to ${newStatus}.`);
    return updatedTx;
  }
  return null;
}

/**
 * Audits a transaction for compliance and risk flags.
 * This is a highly conceptual function that would integrate with various compliance engines.
 * @param transaction The transaction to audit.
 * @returns An audit result object.
 */
function auditTransaction(transaction: Transaction): {
  isCompliant: boolean;
  riskScore: number;
  complianceChecks: Array<{ rule: string; passed: boolean; details?: string; }>;
  flaggedForReview: boolean;
  notes?: string;
} {
  const complianceChecks: Array<{ rule: string; passed: boolean; details?: string; }> = [];
  let riskScore = 0;
  let flaggedForReview = false;
  let notes: string[] = [];

  // Rule 1: High value transaction check
  const highValueThreshold = 5000000; // $50,000
  if (isHighValueTransaction(transaction, highValueThreshold)) {
    complianceChecks.push({ rule: "High Value Transaction", passed: false, details: `Amount (${formatCurrency(convertCentsToMajorUnit(transaction.amount, transaction.currency), transaction.currency)}) exceeds threshold (${formatCurrency(convertCentsToMajorUnit(highValueThreshold, transaction.currency), transaction.currency)}).` });
    riskScore += 50;
    flaggedForReview = true;
    notes.push("Transaction flagged due to high value.");
  } else {
    complianceChecks.push({ rule: "High Value Transaction", passed: true });
  }

  // Rule 2: Transaction from unknown or suspicious counterparty
  if (transaction.isSuspicious) {
    complianceChecks.push({ rule: "Suspicious Counterparty Flag", passed: false, details: "Transaction is from a flagged suspicious counterparty." });
    riskScore += 100;
    flaggedForReview = true;
    notes.push("Transaction linked to suspicious activity flag.");
  } else if (!transaction.counterpartyId) {
    complianceChecks.push({ rule: "Known Counterparty Check", passed: false, details: "Counterparty not identified." });
    riskScore += 20;
    notes.push("Counterparty unknown for this transaction, increasing risk.");
  } else {
    complianceChecks.push({ rule: "Known Counterparty Check", passed: true });
  }

  // Rule 3: International transaction for specific types
  const isInternational = transaction.metadata?.isInternational === true;
  if (isInternational && transaction.type === TransactionType.Wire) {
    complianceChecks.push({ rule: "International Wire Review", passed: false, details: "International wire transfers require additional scrutiny." });
    riskScore += 30;
    flaggedForReview = true;
    notes.push("International wire transfer flagged for review.");
  } else {
    complianceChecks.push({ rule: "International Wire Review", passed: true });
  }

  // Rule 4: AML (Anti-Money Laundering) pattern detection - conceptual
  // This would typically involve external services or complex internal logic
  const descriptionKeywords = transaction.description.toLowerCase();
  const amlKeywords = ['crypto', 'dark web', 'sanctioned', 'shell company'];
  const hasAmlKeyword = amlKeywords.some(keyword => descriptionKeywords.includes(keyword));
  if (hasAmlKeyword) {
    complianceChecks.push({ rule: "AML Keyword Detection", passed: false, details: "Transaction description contains potential AML keywords." });
    riskScore += 200;
    flaggedForReview = true;
    notes.push("Potential AML risk detected based on description.");
  } else {
    complianceChecks.push({ rule: "AML Keyword Detection", passed: true });
  }

  // Final compliance status based on all checks
  const isCompliant = complianceChecks.every(check => check.passed);

  return {
    isCompliant,
    riskScore,
    complianceChecks,
    flaggedForReview,
    notes: notes.length > 0 ? notes.join(" ") : undefined,
  };
}

/**
 * Creates a new internal Counterparty record from provided details.
 * This simulates saving a new counterparty to the internal system.
 * @param name The name of the counterparty.
 * @param email Optional email address.
 * @param legalName Optional legal name.
 * @param address Optional address.
 * @param externalId Optional external IDs.
 * @returns The newly created `Counterparty` object.
 */
function createCounterparty(
  name: string,
  email?: string,
  legalName?: string,
  address?: Address,
  externalId?: Counterparty['externalId'],
  description?: string,
  type: 'individual' | 'business' = 'business',
): Counterparty {
  const now = new Date().toISOString();
  return {
    id: `cp_${generateUniqueId()}`,
    createdAt: now,
    updatedAt: now,
    name,
    legalName,
    email,
    address,
    externalId,
    description,
    type,
    // Add more fields for complexity
    taxId: 'US' + Math.floor(100000000 + Math.random() * 900000000).toString(), // Example
    phone: '+1' + Math.floor(1000000000 + Math.random() * 9000000000).toString(), // Example
    metadata: {
      'createdViaSystem': 'citibankdemobusiness.dev-internal',
    },
  };
}

/**
 * Retrieves a conceptual list of all available internal accounts.
 * @returns An array of mock `Account` objects.
 */
function getAllInternalAccounts(): Account[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'acc_citibank_123',
      createdAt: now,
      updatedAt: now,
      name: "Citibank Business Operating Account",
      accountType: AccountType.BusinessChecking,
      currency: Currency.USD,
      balance: 150000000, // $1.5M
      availableBalance: 145000000,
      accountNumber: "****8765",
      routingNumber: "123456789",
      bankName: "Citibank",
      externalId: {
        stripeConnectAccountId: 'acct_stripe_internal',
        modernTreasuryAccountId: 'ba_mt_operating',
      },
      source: RecordSource.CitibankDemoBusinessInternal,
      isActive: true,
      openedDate: "2020-01-01T00:00:00Z",
      description: "Main operating account for Citibank Demo Business Inc.",
      ownerId: 'org_citibankdemobusiness',
      metadata: {
        'managedBy': 'citibankdemobusiness.dev',
      }
    },
    {
      id: 'acc_citibank_plaid_456',
      createdAt: now,
      updatedAt: now,
      name: "Plaid-Linked External Account",
      accountType: AccountType.Checking,
      currency: Currency.USD,
      balance: 7500000, // $75,000
      availableBalance: 7000000,
      accountNumber: "****1234",
      routingNumber: "987654321",
      bankName: "Chase",
      externalId: {
        plaidAccountId: 'plaid_acc_abc',
      },
      source: RecordSource.Plaid,
      isActive: true,
      openedDate: "2021-03-15T00:00:00Z",
      description: "External account linked via Plaid for transaction fetching.",
    },
    {
      id: 'acc_citibank_mt_789',
      createdAt: now,
      updatedAt: now,
      name: "Modern Treasury Sub-Ledger Account",
      accountType: AccountType.Virtual,
      currency: Currency.USD,
      balance: 5000000, // $50,000
      availableBalance: 5000000,
      accountNumber: "VIRTUAL-001",
      routingNumber: "MT-VIRTUAL",
      bankName: "Modern Treasury",
      externalId: {
        modernTreasuryAccountId: 'ba_mt_virtual_001',
        bankLedgerAccountId: 'la_mt_revenue_sub',
      },
      source: RecordSource.ModernTreasury,
      isActive: true,
      openedDate: "2022-06-01T00:00:00Z",
      description: "Virtual account for categorizing specific revenue streams.",
    },
    {
      id: 'acc_citibank_eur_101',
      createdAt: now,
      updatedAt: now,
      name: "Euro Business Account",
      accountType: AccountType.BusinessChecking,
      currency: Currency.EUR,
      balance: 25000000, // €250,000
      availableBalance: 24500000,
      accountNumber: "IBANXXXXXX",
      routingNumber: "BICXXXXX",
      bankName: "Deutsche Bank",
      externalId: {
        modernTreasuryAccountId: 'ba_mt_eur_op',
      },
      source: RecordSource.CitibankDemoBusinessInternal,
      isActive: true,
      openedDate: "2021-11-01T00:00:00Z",
      description: "Operating account for EUR transactions.",
    },
    {
      id: 'acc_citibank_loan_202',
      createdAt: now,
      updatedAt: now,
      name: "Business Loan Account",
      accountType: AccountType.Loan,
      currency: Currency.USD,
      balance: -100000000, // -$1M (liability)
      availableBalance: -100000000,
      accountNumber: "LOAN-789",
      bankName: "Citibank",
      source: RecordSource.CitibankDemoBusinessInternal,
      isActive: true,
      openedDate: "2023-01-01T00:00:00Z",
      description: "Business loan for capital expenditures.",
      ownerId: 'org_citibankdemobusiness',
      metadata: {
        'loanTermMonths': 60,
        'interestRate': 0.05,
      }
    },
    {
      id: 'acc_citibank_savings_303',
      createdAt: now,
      updatedAt: now,
      name: "Business Savings Reserve",
      accountType: AccountType.Savings,
      currency: Currency.USD,
      balance: 50000000, // $500,000
      availableBalance: 50000000,
      accountNumber: "****3333",
      routingNumber: "123456789",
      bankName: "Citibank",
      source: RecordSource.CitibankDemoBusinessInternal,
      isActive: true,
      openedDate: "2022-07-01T00:00:00Z",
      description: "Reserve fund for business contingencies.",
      ownerId: 'org_citibankdemobusiness',
    },
    {
      id: 'acc_citibank_inv_404',
      createdAt: now,
      updatedAt: now,
      name: "Investment Portfolio",
      accountType: AccountType.Investment,
      currency: Currency.USD,
      balance: 250000000, // $2.5M
      availableBalance: 250000000,
      accountNumber: "INV-555",
      bankName: "Citibank Investments",
      source: RecordSource.CitibankDemoBusinessInternal,
      isActive: true,
      openedDate: "2019-05-20T00:00:00Z",
      description: "Long-term investment portfolio.",
      ownerId: 'org_citibankdemobusiness',
      metadata: {
        'brokerageFirm': 'Citi Wealth Management',
        'portfolioType': 'growth_equity',
      }
    },
    {
      id: 'acc_citibank_payouts_505',
      createdAt: now,
      updatedAt: now,
      name: "Stripe Payouts Account",
      accountType: AccountType.BusinessChecking,
      currency: Currency.USD,
      balance: 10000000, // $100,000
      availableBalance: 9800000,
      accountNumber: "****9999",
      routingNumber: "123456789",
      bankName: "Citibank",
      externalId: {
        stripeConnectAccountId: 'acct_stripe_payouts',
        modernTreasuryAccountId: 'ba_mt_stripe_payout',
      },
      source: RecordSource.Stripe,
      isActive: true,
      openedDate: "2023-09-01T00:00:00Z",
      description: "Dedicated account for receiving Stripe payouts.",
      ownerId: 'org_citibankdemobusiness',
    },
    {
      id: 'acc_citibank_receivables_606',
      createdAt: now,
      updatedAt: now,
      name: "Accounts Receivable Ledger",
      accountType: AccountType.Virtual,
      currency: Currency.USD,
      balance: 75000000, // $750,000
      availableBalance: 75000000,
      accountNumber: "AR-VIRTUAL",
      bankName: "Citibank", // Conceptual, ledger account
      externalId: {
        modernTreasuryAccountId: 'la_mt_ar',
      },
      source: RecordSource.ModernTreasury,
      isActive: true,
      openedDate: "2020-03-01T00:00:00Z",
      description: "Virtual ledger account for tracking accounts receivable.",
      ownerId: 'org_citibankdemobusiness',
    },
    {
      id: 'acc_citibank_payables_707',
      createdAt: now,
      updatedAt: now,
      name: "Accounts Payable Ledger",
      accountType: AccountType.Virtual,
      currency: Currency.USD,
      balance: -40000000, // -$400,000 (liability)
      availableBalance: -40000000,
      accountNumber: "AP-VIRTUAL",
      bankName: "Citibank", // Conceptual, ledger account
      externalId: {
        modernTreasuryAccountId: 'la_mt_ap',
      },
      source: RecordSource.ModernTreasury,
      isActive: true,
      openedDate: "2020-03-01T00:00:00Z",
      description: "Virtual ledger account for tracking accounts payable.",
      ownerId: 'org_citibankdemobusiness',
    },
  ];
}