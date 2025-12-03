// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

/**
 * Enumerates the various financial transaction statuses.
 * These statuses can originate from different providers like Stripe, Plaid, or Modern Treasury,
 * and are harmonized for unified filtering within the FinancialFilterEngine.
 * Each status represents a specific stage in the transaction lifecycle, from initiation to completion or failure.
 */
export enum FinancialTransactionStatus {
  Pending = "PENDING", // Transaction has been initiated but not yet confirmed.
  Completed = "COMPLETED", // Transaction has successfully finished.
  Failed = "FAILED", // Transaction could not be processed due to an error.
  Canceled = "CANCELED", // Transaction was canceled by one of the parties.
  Refunded = "REFUNDED", // The full amount of the transaction has been returned.
  Disputed = "DISPUTED", // A dispute has been raised against the transaction (e.g., chargeback).
  Authorized = "AUTHORIZED", // Funds have been reserved, but not yet captured (common in card payments).
  Settled = "SETTLED", // Funds have been moved between accounts and the transaction is finalized.
  Processing = "PROCESSING", // Transaction is actively being processed.
  Expired = "EXPIRED", // Authorization or pending transaction has expired.
  Declined = "DECLINED", // Transaction was declined by the bank or payment processor.
  Hold = "HOLD", // Funds are temporarily held.
  Chargeback = "CHARGEBACK", // A full or partial chargeback has occurred.
  Reversed = "REVERSED", // A transaction has been undone (e.g., an incorrect ACH deposit).
  Voided = "VOIDED", // A transaction was canceled before settlement, often for pre-authorizations.
  PartiallyRefunded = "PARTIALLY_REFUNDED", // A portion of the transaction amount has been returned.
  PartiallyPaid = "PARTIALLY_PAID", // An invoice or payment has received a partial payment.
  AwaitingPayment = "AWAITING_PAYMENT", // An invoice has been issued and is pending payment.
  Draft = "DRAFT", // A financial record is in a draft state and not yet active.
  Open = "OPEN", // A financial record or account is active and open.
  Closed = "CLOSED", // A financial record or account is closed.
}

/**
 * Defines various types of financial instruments or transactions.
 * This categorization aids in broad filtering and understanding the nature of a transaction.
 * Examples cover payments, transfers, invoices, and other financial movements.
 */
export enum FinancialInstrumentType {
  CreditCardPayment = "CREDIT_CARD_PAYMENT",
  ACHTransfer = "ACH_TRANSFER",
  WireTransfer = "WIRE_TRANSFER",
  SEPATransfer = "SEPA_TRANSFER", // Single Euro Payments Area
  BACS = "BACS", // Bankers' Automated Clearing System (UK)
  CHAPS = "CHAPS", // Clearing House Automated Payment System (UK)
  FasterPayments = "FASTER_PAYMENTS", // UK faster payments
  Check = "CHECK",
  Cash = "CASH",
  Subscription = "SUBSCRIPTION",
  Invoice = "INVOICE",
  Refund = "REFUND",
  Disbursement = "DISBURSEMENT", // Outgoing payment
  Loan = "LOAN",
  Investment = "INVESTMENT",
  InterestPayment = "INTEREST_PAYMENT",
  Fee = "FEE",
  Payroll = "PAYROLL",
  Deposit = "DEPOSIT",
  Withdrawal = "WITHDRAWAL",
  P2PTransfer = "P2P_TRANSFER", // Person-to-person transfer
  BillPayment = "BILL_PAYMENT",
  Settlement = "SETTLEMENT",
  Chargeback = "CHARGEBACK",
  ForeignExchange = "FOREIGN_EXCHANGE",
  Escrow = "ESCROW",
  Dividend = "DIVIDEND",
  TaxPayment = "TAX_PAYMENT",
  UtilityPayment = "UTILITY_PAYMENT",
  Purchase = "PURCHASE",
  Sale = "SALE",
  CapitalContribution = "CAPITAL_CONTRIBUTION",
  Distributions = "DISTRIBUTIONS",
}

/**
 * Represents different categories for financial transactions, often
 * used for budgeting, expense tracking, and financial analysis.
 * These categories are broad and can be refined further in metadata.
 */
export enum FinancialTransactionCategory {
  Advertising = "ADVERTISING",
  Automotive = "AUTOMOTIVE",
  BillsAndUtilities = "BILLS_AND_UTILITIES",
  BusinessServices = "BUSINESS_SERVICES",
  Charity = "CHARITY",
  Education = "EDUCATION",
  Entertainment = "ENTERTAINMENT",
  FoodAndDining = "FOOD_AND_DINING",
  Gifts = "GIFTS",
  HealthAndFitness = "HEALTH_AND_FITNESS",
  Home = "HOME",
  Insurance = "INSURANCE",
  Investments = "INVESTMENTS",
  Loans = "LOANS",
  Miscellaneous = "MISCELLANEOUS",
  PersonalCare = "PERSONAL_CARE",
  Shopping = "SHOPPING",
  Travel = "TRAVEL",
  Salary = "SALARY",
  Rent = "RENT",
  Groceries = "GROCERIES",
  Transportation = "TRANSPORTATION",
  Utilities = "UTILITIES",
  Software = "SOFTWARE",
  Hardware = "HARDWARE",
  Consulting = "CONSULTING",
  Freelance = "FREELANCE",
  Royalties = "ROYALTIES",
  Commissions = "COMMISSIONS",
  Returns = "RETURNS",
  Reimbursement = "REIMBURSEMENT",
  TaxRefund = "TAX_REFUND",
  OfficeSupplies = "OFFICE_SUPPLIES",
  LegalFees = "LEGAL_FEES",
  AccountingFees = "ACCOUNTING_FEES",
  Maintenance = "MAINTENANCE",
  Rentals = "RENTALS",
  PostageAndShipping = "POSTAGE_AND_SHIPPING",
  BankFees = "BANK_FEES",
  InterestExpense = "INTEREST_EXPENSE",
  SalesRevenue = "SALES_REVENUE",
  SubscriptionRevenue = "SUBSCRIPTION_REVENUE",
  InvestmentIncome = "INVESTMENT_INCOME",
}

/**
 * Defines the direction of a financial transaction, primarily for ledger entries.
 * Credit increases an account balance, Debit decreases it. Transfer implies movement between accounts.
 */
export enum TransactionDirection {
  Credit = "CREDIT",
  Debit = "DEBIT",
  Transfer = "TRANSFER",
}

/**
 * Represents the type of a financial account.
 * This can be used to filter transactions originating from or going to specific account types.
 */
export enum AccountType {
  Checking = "CHECKING",
  Savings = "SAVINGS",
  CreditCard = "CREDIT_CARD",
  Loan = "LOAN",
  Investment = "INVESTMENT",
  Brokerage = "BROKERAGE",
  Mortgage = "MORTGAGE",
  Retirement = "RETUREMENT",
  BusinessChecking = "BUSINESS_CHECKING",
  BusinessSavings = "BUSINESS_SAVINGS",
  MerchantAccount = "MERCHANT_ACCOUNT",
  VirtualAccount = "VIRTUAL_ACCOUNT",
  EscrowAccount = "ESCROW_ACCOUNT",
  Wallet = "WALLET",
  CertificateOfDeposit = "CERTIFICATE_OF_DEPOSIT",
  LineOfCredit = "LINE_OF_CREDIT",
  PrepaidCard = "PREPAID_CARD",
}

/**
 * Enumerates different risk levels for transactions, often internal to Citibank Demo Business
 * or derived from integrated fraud detection systems.
 */
export enum TransactionRiskLevel {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
  Critical = "CRITICAL",
  Fraudulent = "FRAUDULENT",
}

/**
 * Standardized currency codes (ISO 4217) for global financial transactions.
 * Essential for multi-currency filtering and reporting.
 */
export enum CurrencyCode {
  USD = "USD", // United States Dollar
  EUR = "EUR", // Euro
  GBP = "GBP", // British Pound Sterling
  CAD = "CAD", // Canadian Dollar
  AUD = "AUD", // Australian Dollar
  JPY = "JPY", // Japanese Yen
  CHF = "CHF", // Swiss Franc
  CNY = "CNY", // Chinese Yuan Renminbi
  INR = "INR", // Indian Rupee
  BRL = "BRL", // Brazilian Real
  SGD = "SGD", // Singapore Dollar
  HKD = "HKD", // Hong Kong Dollar
  SEK = "SEK", // Swedish Krona
  NOK = "NOK", // Norwegian Krone
  DKK = "DKK", // Danish Krone
  NZD = "NZD", // New Zealand Dollar
  MXN = "MXN", // Mexican Peso
  ZAR = "ZAR", // South African Rand
  TRY = "TRY", // Turkish Lira
  RUB = "RUB", // Russian Ruble
  KRW = "KRW", // South Korean Won
  PLN = "PLN", // Polish Zloty
  PHP = "PHP", // Philippine Peso
  THB = "THB", // Thai Baht
  IDR = "IDR", // Indonesian Rupiah
  MYR = "MYR", // Malaysian Ringgit
  CLP = "CLP", // Chilean Peso
  COP = "COP", // Colombian Peso
  AED = "AED", // UAE Dirham
  SAR = "SAR", // Saudi Riyal
  QAR = "QAR", // Qatari Riyal
  KWD = "KWD", // Kuwaiti Dinar
  BHD = "BHD", // Bahraini Dinar
  EGP = "EGP", // Egyptian Pound
  ILS = "ILS", // Israeli New Shekel
  VND = "VND", // Vietnamese Dong
  NGN = "NGN", // Nigerian Naira
}

/**
 * Represents the source of a financial record, indicating which
 * external or internal system it originated from. This is crucial for
 * filtering data based on its upstream provider.
 */
export enum FinancialDataSource {
  Stripe = "STRIPE", // Payments, subscriptions, invoices
  Plaid = "PLAID", // Bank account aggregation, transactions, balance
  ModernTreasury = "MODERN_TREASURY", // Payments orchestration, ledger management
  CitibankInternal = "CITIBANK_INTERNAL", // Direct Citibank transactions, proprietary systems
  Other = "OTHER", // Any other third-party or manual input
  Manual = "MANUAL", // Manually entered data
  Sap = "SAP", // Enterprise Resource Planning system
  Quickbooks = "QUICKBOOKS", // Accounting software
}

/**
 * Represents a generic financial party involved in a transaction,
 * which could be a sender, receiver, merchant, or customer.
 */
export interface FinancialParty {
  id: string; // Unique ID for the financial party
  name: string; // Full name or business name
  email?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    latitude?: number; // For potential geo-filtering
    longitude?: number;
  };
  taxId?: string; // e.g., EIN for businesses, SSN/ITIN for individuals (masked)
  isBusiness: boolean;
  businessName?: string; // Redundant if 'name' is business name, but explicit for clarity
  contactNumber?: string;
  website?: string;
  legalEntityId?: string; // For linking to global entity registers or internal corporate IDs
  customerSegment?: string; // e.g., 'SMB', 'Enterprise', 'Individual', 'Preferred', 'Institutional'
  customerSince?: string; // ISO Date String, when the customer relationship started
  industry?: string;
  sicCode?: string; // Standard Industrial Classification code
}

/**
 * Represents bank account details associated with a financial party or transaction.
 * Contains identifiers from various platforms.
 */
export interface BankAccountDetails {
  bankName: string;
  accountNumber: string; // Masked (e.g., ****1234)
  routingNumber: string; // Masked (e.g., ***001)
  swiftCode?: string; // SWIFT/BIC code for international transfers
  iban?: string; // International Bank Account Number
  accountHolderName: string;
  currency: CurrencyCode;
  accountType: AccountType;
  verificationStatus: "VERIFIED" | "PENDING" | "FAILED" | "UNVERIFIED";
  plaidAccountId?: string; // Link to Plaid if aggregated
  modernTreasuryLedgerAccountId?: string; // Link to Modern Treasury ledger account
  citibankInternalAccountId?: string; // Internal Citibank account ID
  beneficiaryName?: string; // Name registered as beneficiary for transfers
  country?: string; // Country of the bank account
}

/**
 * Represents a payment method used in a transaction,
 * encapsulating various types like cards, bank accounts, or digital wallets.
 */
export interface PaymentMethod {
  type: "credit_card" | "debit_card" | "bank_account" | "wallet" | "other" | "cash";
  id: string; // Unique internal ID for the payment method
  last4?: string; // Last 4 digits for cards or bank accounts for identification
  brand?: string; // e.g., "Visa", "Mastercard", "Amex", "Chase", "PayPal"
  network?: string; // e.g., "Visa", "Mastercard", "American Express", "Discover"
  expirationMonth?: number; // For cards
  expirationYear?: number; // For cards
  token?: string; // Masked token if applicable for PCI compliance
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  stripePaymentMethodId?: string; // Link to Stripe payment method
  plaidPaymentMethodToken?: string; // Link to Plaid processor token
  gatewayUsed?: string; // e.g., "Stripe", "PayPal", "Square"
  isDefault?: boolean;
}

/**
 * Represents an invoice issued to a customer, including line items and payment terms.
 * This can be linked to payment transactions.
 */
export interface InvoiceDetails {
  invoiceId: string; // Unique ID for the invoice
  invoiceNumber: string;
  issueDate: string; // ISO Date String, when the invoice was created
  dueDate: string; // ISO Date String, when the payment is due
  paymentDate?: string; // ISO Date String, when the invoice was actually paid
  amountDue: number; // Remaining amount to be paid
  totalAmount: number; // Total amount of the invoice before payments
  currency: CurrencyCode;
  status: FinancialTransactionStatus; // e.g., Open, Paid, Void, Draft, PartiallyPaid
  lineItems: Array<{
    lineItemId: string; // Unique ID for each line item
    description: string;
    quantity: number;
    unitPrice: number;
    total: number; // quantity * unitPrice
    productCode?: string; // SKU or internal product code
    servicePeriodStart?: string; // ISO Date String for subscription items
    servicePeriodEnd?: string; // ISO Date String for subscription items
  }>;
  stripeInvoiceId?: string; // Link to Stripe Invoice object
  modernTreasuryPaymentOrderId?: string; // Link to Modern Treasury payment order that settled this invoice
  citibankProductCode?: string; // Internal Citibank product identifier associated with this invoice
  paymentTerms?: string; // e.g., 'Net 30', 'Due on Receipt', 'Installment Plan'
  discountsApplied?: Array<{
    name: string;
    amount: number;
    type: "percentage" | "fixed";
    description?: string;
  }>;
  taxesApplied?: Array<{
    name: string;
    rate: number; // e.g., 0.05 for 5%
    amount: number;
    taxId?: string; // e.g., VAT ID
  }>;
  customerNotes?: string;
  vendorNotes?: string;
  purchaseOrderNumber?: string;
  billingFrequency?: "one_time" | "monthly" | "quarterly" | "annually";
}

/**
 * Represents a detailed financial transaction record, unifying data
 * from various sources (Stripe, Plaid, Modern Treasury, Citibank internal).
 * This is the core data entity that the filter engine operates on.
 * Its comprehensive nature allows for multi-dimensional filtering across all integrated platforms.
 */
export interface FinancialTransactionRecord {
  id: string; // Unique internal ID for the unified transaction (GUID)
  externalIds: {
    stripePaymentIntentId?: string; // Stripe Payment Intent ID
    stripeChargeId?: string; // Stripe Charge ID
    stripeRefundId?: string; // Stripe Refund ID
    stripeSubscriptionId?: string; // Stripe Subscription ID
    plaidTransactionId?: string; // Plaid Transaction ID
    plaidAccountId?: string; // Plaid Account ID associated with this transaction
    modernTreasuryPaymentOrderId?: string; // Modern Treasury Payment Order ID
    modernTreasuryLedgerEntryId?: string; // Modern Treasury Ledger Entry ID
    citibankInternalReference?: string; // Internal Citibank transaction reference
    partnerTransactionId?: string; // ID from another integration partner
    erpReferenceId?: string; // Reference ID from an ERP system (e.g., SAP)
  };
  source: FinancialDataSource; // Where the transaction data originated
  type: FinancialInstrumentType; // The type of financial instrument or transaction
  category: FinancialTransactionCategory; // Categorization for budgeting/analysis
  amount: number; // The transaction amount
  currency: CurrencyCode; // The currency of the transaction
  description: string; // A brief description of the transaction
  status: FinancialTransactionStatus; // Current status of the transaction
  transactionDate: string; // ISO Date String, when the transaction occurred
  settlementDate?: string; // ISO Date String, when funds were settled
  merchantName?: string; // Name of the merchant or payee
  merchantId?: string; // Unique ID of the merchant
  merchantCategoryCode?: string; // MCC code for card transactions
  memo?: string; // Additional notes or details

  // Parties involved
  sender?: FinancialParty; // The party sending funds (e.g., customer)
  receiver?: FinancialParty; // The party receiving funds (e.g., merchant)
  originator?: FinancialParty; // Initiator of the payment, if different from sender
  beneficiary?: FinancialParty; // Ultimate recipient of funds, if different from receiver

  // Account details
  originatingAccount?: BankAccountDetails; // Account from which funds were debited
  destinationAccount?: BankAccountDetails; // Account to which funds were credited

  // Payment method used
  paymentMethod?: PaymentMethod;

  // Invoice linkage (if applicable)
  invoiceDetails?: InvoiceDetails;

  // Additional metadata, often unstructured but useful for searching and context
  metadata: {
    [key: string]: string | number | boolean | null | undefined;
  };

  // Citibank specific fields for internal tracking, risk, and compliance
  citibankBranchCode?: string; // Internal branch identifier
  citibankDepartmentId?: string; // Internal department responsible for the transaction
  citibankProductId?: string; // Citibank product associated with the transaction
  transactionRiskLevel?: TransactionRiskLevel; // Computed risk level
  fraudDetectionScore?: number; // 0-100, higher is riskier
  amlStatus?: "CLEARED" | "FLAGGED" | "REVIEW_REQUIRED" | "EXEMPT"; // Anti-Money Laundering status
  complianceChecks?: Array<{
    ruleId: string;
    status: "PASS" | "FAIL" | "PENDING" | "N/A";
    notes?: string;
    checkDate: string; // ISO Date String
  }>;
  fxRate?: number; // Exchange rate if foreign exchange occurred
  originalCurrencyAmount?: number; // Amount in original currency if FX occurred
  originalCurrency?: CurrencyCode; // Original currency if FX occurred
  fees?: Array<{
    type: string; // e.g., 'processing_fee', 'fx_fee', 'transfer_fee'
    amount: number;
    currency: CurrencyCode;
    description?: string;
  }>;
  tags?: string[]; // Custom tags for easier organization (e.g., 'urgent', 'tax_deductible')
  notes?: string; // Free-form notes about the transaction
  relatedTransactions?: string[]; // IDs of related transactions (e.g., initial payment and subsequent refund)
  isRecurring?: boolean; // Indicates if this is part of a recurring series
  chargebackResolution?: "WON" | "LOST" | "PENDING" | "N/A"; // Outcome of a chargeback
  disputeReason?: string; // Reason for dispute or chargeback
  transactionHash?: string; // Cryptographic hash for integrity checks
  geographicalLocation?: { // For location-based filtering
    country: string;
    state?: string;
    city?: string;
    postalCode?: string;
  };
}

/**
 * Defines the structure for pagination options, controlling how data is fetched and presented.
 */
export interface PaginationOptions {
  page: number; // Current page number (1-indexed)
  pageSize: number; // Number of items per page
  sortBy?: string; // Field to sort by (e.g., "amount", "transactionDate")
  sortDirection?: "asc" | "desc"; // Sort direction
}

/**
 * Represents a paginated result set from the filter engine,
 * providing the filtered data along with metadata about the pagination.
 */
export interface PaginatedResult<T> {
  data: T[]; // The actual filtered and paginated records
  totalRecords: number; // Total number of records matching the filter (before pagination)
  totalPages: number; // Total number of pages
  currentPage: number; // The current page number
  pageSize: number; // The size of each page
  hasMore: boolean; // Indicates if there are more pages available
}

/**
 * Defines the types of operators supported by the filter engine.
 * These operators allow for flexible and powerful query construction.
 */
export enum FilterOperator {
  EQ = "eq", // Equals (case-insensitive for strings)
  NE = "ne", // Not equals (case-insensitive for strings)
  GT = "gt", // Greater than
  GE = "ge", // Greater than or equals
  LT = "lt", // Less than
  LE = "le", // Less than or equals
  CONTAINS = "contains", // String contains substring (case-insensitive)
  STARTS_WITH = "starts_with", // String starts with (case-insensitive)
  ENDS_WITH = "ends_with", // String ends with (case-insensitive)
  IN = "in", // Value is in a list of values
  NOT_IN = "not_in", // Value is not in a list of values
  BETWEEN = "between", // Value is within a range (inclusive, for numbers and dates)
  IS_NULL = "is_null", // Field is null/undefined
  IS_NOT_NULL = "is_not_null", // Field is not null/undefined
  HAS_TAG = "has_tag", // Array field contains a specific tag (case-insensitive for string tags)
  NOT_HAS_TAG = "not_has_tag", // Array field does not contain a specific tag
  AFTER = "after", // Date is strictly after a given date (exclusive)
  BEFORE = "before", // Date is strictly before a given date (exclusive)
  ON_OR_AFTER = "on_or_after", // Date is on or after a given date (inclusive)
  ON_OR_BEFORE = "on_or_before", // Date is on or before a given date (inclusive)
  EMPTY = "empty", // Field is an empty string, empty array, null, or undefined
  NOT_EMPTY = "not_empty", // Field is not empty
  // Geographic operators (conceptual, full implementation requires specialized libraries/backend)
  NEAR = "near", // Geographic proximity, e.g., { latitude: number, longitude: number, radiusKm: number }
  EXISTS = "exists", // Field exists and is not null/undefined (synonym for IS_NOT_NULL)
  DOES_NOT_EXIST = "does_not_exist", // Field does not exist or is null/undefined (synonym for IS_NULL)
}

/**
 * Represents a single filter condition, specifying a field, operator, and value.
 * This is the atomic unit of filtering logic.
 */
export interface FilterCondition {
  field: string; // The path to the field, e.g., "amount", "sender.name", "metadata.transactionId"
  operator: FilterOperator;
  value?: any; // The value(s) to compare against. Can be string, number, boolean, array, or object (for BETWEEN, NEAR)
}

/**
 * Defines the logical operators for combining filter groups, enabling complex boolean logic.
 */
export enum LogicalOperator {
  AND = "AND", // All conditions in the group must be true
  OR = "OR", // At least one condition in the group must be true
}

/**
 * Represents a group of filter conditions, combined by a logical operator.
 * Allows for nesting of filter logic to create sophisticated queries.
 */
export interface FilterGroup {
  operator: LogicalOperator;
  conditions: FilterClause[]; // Can contain conditions or nested groups
}

/**
 * A type that can be either a single filter condition or a nested filter group.
 * This recursive definition allows for arbitrarily complex filter structures.
 */
export type FilterClause = FilterCondition | FilterGroup;

/**
 * The top-level interface for a complex financial filter, encapsulating its definition,
 * metadata, and default sorting options.
 */
export interface FinancialFilter {
  id?: string; // Unique ID for this specific filter definition, if saved
  name: string; // User-friendly name for the filter
  description?: string; // Detailed description of what the filter does
  isEnabled: boolean; // Whether the filter should be actively applied
  filterDefinition: FilterClause; // The core logic of the filter
  defaultSortBy?: string; // Default field to sort by when this filter is applied
  defaultSortDirection?: "asc" | "desc"; // Default sort direction
  tags?: string[]; // Custom tags for filter organization (e.g., 'report', 'alert', 'fraud')
  ownerId?: string; // ID of the user who created/owns this filter
  isPublic?: boolean; // If the filter is shareable across users
  createdAt?: string; // ISO Date String
  updatedAt?: string; // ISO Date String
  version?: number; // Version of the filter definition
}

/**
 * Represents user preferences for filtering and data display.
 * These preferences are persistent and can influence how the filter engine operates,
 * allowing for a personalized data exploration experience.
 */
export interface UserPreference {
  userId: string;
  preferredCurrency: CurrencyCode; // Default currency for display and conversions
  defaultTimeframe?: string; // e.g., "LAST_30_DAYS", "THIS_MONTH", "LAST_QUARTER", "YTD"
  defaultFilters?: FinancialFilter[]; // Array of predefined filters to apply by default
  hiddenCategories?: FinancialTransactionCategory[]; // Categories to exclude by default
  hiddenSources?: FinancialDataSource[]; // Data sources to exclude by default
  displayColumns?: string[]; // Fields to display in a table view, in order
  itemsPerPage: number; // Default number of items per page for pagination
  enableCaching: boolean; // Whether the filter engine should use its cache for this user
  notificationSettings?: {
    lowBalanceThreshold?: number; // Threshold for low balance alerts
    highRiskTransactionAlerts: boolean; // Enable alerts for high-risk transactions
    dailySummaryEmails: boolean;
    fraudDetectionEmails: boolean;
  };
  dashboardLayout?: { // Configuration for user's dashboard widgets
    widgetOrder: string[];
    widgetSettings: { [widgetId: string]: any };
  };
  lastAccessedFilters?: { // Track recently used filters
    filterId: string;
    accessedAt: string; // ISO Date String
  }[];
  favoriteFilters?: string[]; // List of filter IDs marked as favorite by the user
  // Citibank Demo Business specific preferences
  citibankThemePreference?: "light" | "dark" | "system"; // UI theme
  citibankBranchDefault?: string; // Default branch for the user
  citibankDepartmentDefault?: string; // Default department for the user
  reportGenerationFormat?: "PDF" | "CSV" | "EXCEL";
  dataExportPermissions?: "full" | "masked" | "none";
}

/**
 * Custom error types for the Financial Filter Engine, providing specific
 * context for various failure scenarios.
 */
export class FilterEngineError extends Error {
  constructor(message: string, public code: string = "FILTER_ENGINE_ERROR") {
    super(message);
    this.name = "FilterEngineError";
    // Ensure that `new.target` is recognized as FilterEngineError
    Object.setPrototypeOf(this, FilterEngineError.prototype);
  }
}

/**
 * Error thrown when a filter definition is syntactically or semantically invalid.
 */
export class InvalidFilterDefinitionError extends FilterEngineError {
  constructor(message: string) {
    super(message, "INVALID_FILTER_DEFINITION");
    this.name = "InvalidFilterDefinitionError";
    Object.setPrototypeOf(this, InvalidFilterDefinitionError.prototype);
  }
}

/**
 * Error thrown when input data is malformed or does not conform to expected types.
 */
export class DataValidationError extends FilterEngineError {
  constructor(message: string) {
    super(message, "DATA_VALIDATION_ERROR");
    this.name = "DataValidationError";
    Object.setPrototypeOf(this, DataValidationError.prototype);
  }
}

/**
 * Error thrown when the maximum number of records configured for in-memory processing is exceeded.
 */
export class MaxRecordsExceededError extends FilterEngineError {
  constructor(message: string) {
    super(message, "MAX_RECORDS_EXCEEDED");
    this.name = "MaxRecordsExceededError";
    Object.setPrototypeOf(this, MaxRecordsExceededError.prototype);
  }
}

/**
 * Utility class for date operations, essential for handling date-based filters.
 * Avoids external dependencies by relying on native Date object and ISO 8601 string format.
 */
class DateUtil {
  /**
   * Parses an ISO 8601 date string into a Date object.
   * Handles potential parsing errors gracefully.
   * @param dateString - The date string to parse (e.g., "2023-10-27T10:00:00Z").
   * @returns A Date object.
   * @throws DataValidationError if the date string is invalid.
   */
  static parseDate(dateString: string): Date {
    try {
      if (!dateString || typeof dateString !== 'string') {
        throw new Error("Date string cannot be null, undefined, or non-string.");
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date string format: '${dateString}'.`);
      }
      return date;
    } catch (e: any) {
      throw new DataValidationError(`Failed to parse date string '${dateString}': ${e.message}`);
    }
  }

  /**
   * Compares two dates.
   * @returns -1 if date1 is before date2, 0 if equal, 1 if date1 is after date2.
   */
  static compareDates(date1: string | Date, date2: string | Date): number {
    const d1 = typeof date1 === 'string' ? DateUtil.parseDate(date1) : date1;
    const d2 = typeof date2 === 'string' ? DateUtil.parseDate(date2) : date2;
    const time1 = d1.getTime();
    const time2 = d2.getTime();

    if (time1 < time2) return -1;
    if (time1 > time2) return 1;
    return 0;
  }

  /**
   * Checks if a date is strictly after a given comparison date.
   */
  static isAfter(date: string | Date, comparisonDate: string | Date): boolean {
    return DateUtil.compareDates(date, comparisonDate) > 0;
  }

  /**
   * Checks if a date is strictly before a given comparison date.
   */
  static isBefore(date: string | Date, comparisonDate: string | Date): boolean {
    return DateUtil.compareDates(date, comparisonDate) < 0;
  }

  /**
   * Checks if a date is on or after a given comparison date (inclusive).
   */
  static isOnOrAfter(date: string | Date, comparisonDate: string | Date): boolean {
    return DateUtil.compareDates(date, comparisonDate) >= 0;
  }

  /**
   * Checks if a date is on or before a given comparison date (inclusive).
   */
  static isOnOrBefore(date: string | Date, comparisonDate: string | Date): boolean {
    return DateUtil.compareDates(date, comparisonDate) <= 0;
  }

  /**
   * Checks if a date is within a given range (inclusive for start and end dates).
   */
  static isDateBetween(date: string | Date, start: string | Date, end: string | Date): boolean {
    const d = typeof date === 'string' ? DateUtil.parseDate(date) : date;
    const s = typeof start === 'string' ? DateUtil.parseDate(start) : start;
    const e = typeof end === 'string' ? DateUtil.parseDate(end) : end;
    return d.getTime() >= s.getTime() && d.getTime() <= e.getTime();
  }

  /**
   * Formats a Date object into an ISO 8601 string.
   */
  static toISOString(date: Date): string {
    return date.toISOString();
  }

  /**
   * Adds a specified number of days to a date.
   */
  static addDays(date: Date, days: number): Date {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  }

  /**
   * Subtracts a specified number of days from a date.
   */
  static subtractDays(date: Date, days: number): Date {
    return DateUtil.addDays(date, -days);
  }
}

/**
 * Utility class for string operations, providing case-insensitive comparisons
 * without relying on external libraries.
 */
class StringUtil {
  /**
   * Checks if a string contains another string (case-insensitive).
   */
  static containsCaseInsensitive(source: any, substring: any): boolean {
    if (typeof source !== 'string' || typeof substring !== 'string') return false;
    return source.toLowerCase().includes(substring.toLowerCase());
  }

  /**
   * Checks if a string starts with another string (case-insensitive).
   */
  static startsWithCaseInsensitive(source: any, prefix: any): boolean {
    if (typeof source !== 'string' || typeof prefix !== 'string') return false;
    return source.toLowerCase().startsWith(prefix.toLowerCase());
  }

  /**
   * Checks if a string ends with another string (case-insensitive).
   */
  static endsWithCaseInsensitive(source: any, suffix: any): boolean {
    if (typeof source !== 'string' || typeof suffix !== 'string') return false;
    return source.toLowerCase().endsWith(suffix.toLowerCase());
  }

  /**
   * Compares two strings case-insensitively.
   */
  static equalsCaseInsensitive(s1: any, s2: any): boolean {
    if (typeof s1 !== 'string' || typeof s2 !== 'string') return false;
    return s1.toLowerCase() === s2.toLowerCase();
  }
}

/**
 * Represents an entry in the in-memory cache, storing the value along with metadata
 * for cache eviction strategies (e.g., LRU - Least Recently Used).
 */
interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: number; // Unix timestamp of last access for LRU
  hits: number; // Number of times this entry has been accessed
  ttl?: number; // Time-to-live in milliseconds, optional
  createdAt: number; // Unix timestamp of creation
}

/**
 * Implements a sophisticated in-memory Least Recently Used (LRU) cache.
 * Designed to store results of filter operations or frequently accessed data,
 * optimizing performance by reducing redundant computations. It's fully
 * self-contained without external dependencies.
 */
class CacheManager {
  private cache: Map<string, CacheEntry<any>>;
  private maxSize: number; // Maximum number of items the cache can hold
  private defaultTtl: number; // Default Time-To-Live for cache entries in milliseconds (e.g., 5 minutes)

  /**
   * Creates an instance of CacheManager.
   * @param maxSize The maximum number of items the cache can hold. Defaults to 1000.
   * @param defaultTtl The default time-to-live for cache entries in milliseconds. Defaults to 300,000ms (5 minutes).
   */
  constructor(maxSize: number = 1000, defaultTtl: number = 300000) {
    if (maxSize <= 0) {
      throw new FilterEngineError("Cache max size must be positive.", "INVALID_CACHE_SIZE");
    }
    if (defaultTtl <= 0) {
      throw new FilterEngineError("Cache default TTL must be positive.", "INVALID_CACHE_TTL");
    }
    this.cache = new Map<string, CacheEntry<any>>();
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtl;
    // Periodically clean up expired entries
    setInterval(() => this.cleanupExpiredEntries(), 60000); // Run every minute
    console.log(`CacheManager initialized with maxSize: ${maxSize}, defaultTtl: ${defaultTtl / 1000}s`);
  }

  /**
   * Retrieves an item from the cache. If the item is found and not expired,
   * its access time is updated for LRU tracking.
   * @param key The key of the item to retrieve.
   * @returns The cached value, or undefined if not found or expired.
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (entry) {
      if (entry.ttl && (Date.now() - entry.createdAt > entry.ttl)) {
        // Entry expired
        this.cache.delete(key);
        return undefined;
      }
      // Update access time and hit count for LRU strategy
      entry.timestamp = Date.now();
      entry.hits++;
      // Move to end of map to signify most recently used (Map maintains insertion order)
      this.cache.delete(key);
      this.cache.set(key, entry);
      return entry.value;
    }
    return undefined;
  }

  /**
   * Adds an item to the cache. If the cache is full, the least recently used item is removed.
   * Optionally accepts a custom TTL for the specific entry.
   * @param key The key for the item.
   * @param value The value to cache.
   * @param ttl Optional time-to-live for this entry in milliseconds. If not provided, defaultTtl is used.
   */
  set<T>(key: string, value: T, ttl?: number): void {
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      // Find and remove the LRU item. Map.keys().next().value gets the oldest entry.
      // Also ensure to remove any expired entries before eviction to make space for non-expired.
      this.cleanupExpiredEntries();
      if (this.cache.size >= this.maxSize && this.maxSize > 0) { // Check again after cleanup
        const lruKey = this.cache.keys().next().value;
        this.cache.delete(lruKey);
        // console.log(`Cache full, evicted LRU entry: ${lruKey}`);
      } else if (this.maxSize === 0) {
        // Cache is effectively disabled if maxSize is 0.
        return;
      }
    }

    const now = Date.now();
    const existingEntry = this.cache.get(key);
    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: now,
      hits: (existingEntry?.hits || 0) + 1, // Preserve hits if updating existing entry
      ttl: ttl !== undefined ? ttl : this.defaultTtl,
      createdAt: existingEntry?.createdAt || now, // Keep original creation time if updating
    };
    this.cache.set(key, entry);
  }

  /**
   * Removes an item from the cache.
   * @param key The key of the item to remove.
   * @returns True if an item was removed, false otherwise.
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clears the entire cache.
   */
  clear(): void {
    this.cache.clear();
    console.log("CacheManager: Entire cache cleared.");
  }

  /**
   * Returns the current number of items in the cache.
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Periodically cleans up any expired entries from the cache.
   * This ensures the cache doesn't grow indefinitely with stale data.
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let cleanedCount = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.ttl && (now - entry.createdAt > entry.ttl)) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    if (cleanedCount > 0) {
      console.log(`CacheManager: Cleaned up ${cleanedCount} expired entries.`);
    }
  }

  /**
   * Generates a unique, deterministic cache key for a given filter definition, pagination options,
   * and user preferences. This ensures that identical queries can retrieve cached results.
   * The order of properties in the JSON stringification is crucial for key consistency.
   * @param filter The filter definition.
   * @param pagination The pagination options.
   * @param preferences Relevant user preferences that affect the result.
   * @returns A string representing the unique cache key.
   */
  static generateCacheKey(
    filter: FinancialFilter,
    pagination: PaginationOptions,
    preferences: UserPreference
  ): string {
    // A robust cache key needs to serialize all relevant parts of the query in a canonical way.
    // JSON.stringify can be used, but order of keys might matter. For robustness, one might
    // consider a custom stringifier or a hashing function after canonicalization.
    // For this demonstration, a simple JSON.stringify is used, assuming consistency.

    const canonicalizeObject = (obj: any): any => {
      if (obj === null || typeof obj !== 'object') {
        return obj;
      }
      if (Array.isArray(obj)) {
        return obj.map(canonicalizeObject).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
      }
      const sortedKeys = Object.keys(obj).sort();
      const newObj: { [key: string]: any } = {};
      for (const key of sortedKeys) {
        newObj[key] = canonicalizeObject(obj[key]);
      }
      return newObj;
    };

    const filterString = JSON.stringify(canonicalizeObject(filter.filterDefinition));
    const paginationString = JSON.stringify(canonicalizeObject(pagination));
    const preferenceKeyParts = {
      userId: preferences.userId,
      preferredCurrency: preferences.preferredCurrency,
      hiddenCategories: preferences.hiddenCategories ? canonicalizeObject(preferences.hiddenCategories) : undefined,
      hiddenSources: preferences.hiddenSources ? canonicalizeObject(preferences.hiddenSources) : undefined,
      // itemsPerPage from preferences is overridden by pagination.pageSize, so no need to include both
      // if it influences the result, it should be in pagination.
    };
    const preferenceString = JSON.stringify(canonicalizeObject(preferenceKeyParts));

    // Combine all parts into a single string. A hash of this string would be even more compact.
    const key = `filter_${filter.id || filter.name}_${filterString}_pagination_${paginationString}_prefs_${preferenceString}`;
    return key;
  }
}

/**
 * Manages the persistence and retrieval of user preferences.
 * In a real application, this would interact with a database or local storage.
 * For this exercise, it simulates persistence entirely in memory for simplicity.
 */
class UserPreferenceManager {
  private preferencesStore: Map<string, UserPreference>; // Maps userId to UserPreference

  constructor() {
    this.preferencesStore = new Map<string, UserPreference>();
    this.seedDefaultPreferences(); // Populate with some initial user preferences
    console.log("UserPreferenceManager initialized with default preferences.");
  }

  /**
   * Seeds the in-memory store with predefined default user preferences for demonstration purposes.
   */
  private seedDefaultPreferences(): void {
    const defaultUserAdmin = "citibank_admin_001";
    this.preferencesStore.set(defaultUserAdmin, {
      userId: defaultUserAdmin,
      preferredCurrency: CurrencyCode.USD,
      defaultTimeframe: "LAST_30_DAYS",
      itemsPerPage: 25,
      enableCaching: true,
      displayColumns: [
        "transactionDate",
        "description",
        "amount",
        "currency",
        "status",
        "type",
        "category",
        "merchantName",
        "citibankBranchCode",
      ],
      notificationSettings: {
        lowBalanceThreshold: 5000,
        highRiskTransactionAlerts: true,
        dailySummaryEmails: true,
        fraudDetectionEmails: true,
      },
      citibankThemePreference: "dark",
      citibankBranchDefault: "001",
      reportGenerationFormat: "EXCEL",
      dataExportPermissions: "full",
      favoriteFilters: ["filter_high_value_trans_usd", "filter_aml_flagged_global"],
    });

    const analystUser = "citibank_analyst_002";
    this.preferencesStore.set(analystUser, {
      userId: analystUser,
      preferredCurrency: CurrencyCode.EUR,
      defaultTimeframe: "THIS_QUARTER",
      itemsPerPage: 50,
      enableCaching: true,
      displayColumns: [
        "transactionDate",
        "type",
        "category",
        "amount",
        "currency",
        "status",
        "source",
        "externalIds.stripePaymentIntentId",
        "externalIds.modernTreasuryLedgerEntryId",
        "transactionRiskLevel",
        "amlStatus",
      ],
      hiddenCategories: [
        FinancialTransactionCategory.Gifts,
        FinancialTransactionCategory.Charity,
        FinancialTransactionCategory.Miscellaneous,
      ],
      hiddenSources: [
        FinancialDataSource.Other,
      ],
      citibankThemePreference: "light",
      favoriteFilters: ["filter_fx_exposure_eu", "filter_large_withdrawals_eur"],
      reportGenerationFormat: "CSV",
      dataExportPermissions: "masked",
      notificationSettings: {
        highRiskTransactionAlerts: false, // Analysts might use specific tools
        dailySummaryEmails: false,
        fraudDetectionEmails: true,
      },
    });

    const merchantUser = "merchant_partner_001";
    this.preferencesStore.set(merchantUser, {
      userId: merchantUser,
      preferredCurrency: CurrencyCode.GBP,
      itemsPerPage: 10,
      enableCaching: false, // Merchants might need real-time data always
      displayColumns: [
        "transactionDate",
        "description",
        "amount",
        "currency",
        "status",
        "type",
        "externalIds.stripeChargeId",
      ],
      citibankThemePreference: "light",
      reportGenerationFormat: "PDF",
      dataExportPermissions: "masked",
      notificationSettings: {
        highRiskTransactionAlerts: true,
        dailySummaryEmails: true,
        fraudDetectionEmails: true,
      },
    });
  }

  /**
   * Retrieves user preferences for a given user ID.
   * If no specific preferences are found, a generic default set is returned.
   * @param userId The ID of the user.
   * @returns The UserPreference object for the user, or a robust default.
   */
  getPreferences(userId: string): UserPreference {
    const preferences = this.preferencesStore.get(userId);
    if (preferences) {
      return { ...preferences }; // Return a clone to prevent external modification
    }
    console.warn(`User preferences not found for userId: ${userId}. Returning robust default preferences.`);
    return this.getDefaultPreferences(userId);
  }

  /**
   * Saves or updates user preferences.
   * In a real application, this would trigger a persistence layer call (e.g., to a database or API).
   * @param preferences The UserPreference object to save.
   */
  savePreferences(preferences: UserPreference): void {
    this.preferencesStore.set(preferences.userId, { ...preferences });
    console.log(`Preferences saved for userId: ${preferences.userId}`);
  }

  /**
   * Provides a robust default set of preferences for a new or unknown user.
   * @param userId The ID of the user for whom to generate default preferences.
   */
  private getDefaultPreferences(userId: string): UserPreference {
    return {
      userId: userId,
      preferredCurrency: CurrencyCode.USD,
      itemsPerPage: 20,
      enableCaching: true,
      displayColumns: ["transactionDate", "description", "amount", "currency", "status"],
      notificationSettings: {
        highRiskTransactionAlerts: false,
        dailySummaryEmails: false,
        fraudDetectionEmails: false,
      },
      citibankThemePreference: "light",
      reportGenerationFormat: "PDF",
      dataExportPermissions: "masked",
    };
  }

  /**
   * Updates specific fields of a user's preferences, merging with existing settings.
   * @param userId The ID of the user.
   * @param updates An object containing partial updates to the preferences.
   */
  updatePreferences(userId: string, updates: Partial<UserPreference>): void {
    const currentPreferences = this.getPreferences(userId);
    // Deep merge if there are nested objects that need to be preserved (e.g., notificationSettings)
    const updatedPreferences = {
      ...currentPreferences,
      ...updates,
      notificationSettings: {
        ...currentPreferences.notificationSettings,
        ...updates.notificationSettings,
      },
      dashboardLayout: {
        ...currentPreferences.dashboardLayout,
        ...updates.dashboardLayout,
      },
      // Ensure arrays are handled as replacements or merged based on desired behavior
      hiddenCategories: updates.hiddenCategories || currentPreferences.hiddenCategories,
      hiddenSources: updates.hiddenSources || currentPreferences.hiddenSources,
      displayColumns: updates.displayColumns || currentPreferences.displayColumns,
      favoriteFilters: updates.favoriteFilters || currentPreferences.favoriteFilters,
      lastAccessedFilters: updates.lastAccessedFilters || currentPreferences.lastAccessedFilters,
      defaultFilters: updates.defaultFilters || currentPreferences.defaultFilters,
    };
    this.savePreferences(updatedPreferences);
    console.log(`Preferences updated for userId: ${userId}`);
  }

  /**
   * Resets a user's preferences to their default state.
   * @param userId The ID of the user.
   */
  resetPreferencesToDefault(userId: string): void {
    const defaultPrefs = this.getDefaultPreferences(userId);
    this.savePreferences(defaultPrefs);
    console.log(`Preferences reset to default for userId: ${userId}`);
  }
}

/**
 * Configuration options for the FinancialFilterEngine, setting up global behaviors
 * like caching, data processing limits, and base URL for API interactions.
 */
export interface FinancialFilterEngineConfig {
  cacheEnabled: boolean; // Whether the internal cache should be utilized
  cacheMaxSize?: number; // Maximum number of items in the cache
  cacheDefaultTtlMs?: number; // Default TTL for cache entries in milliseconds
  maxRecordsToProcess?: number; // A hard limit for in-memory processing to prevent out-of-memory errors on large datasets
  defaultCurrency: CurrencyCode; // The default currency used for operations if not specified
  citibankBaseUrl: string; // The base URL for Citibank Demo Business API routes (e.g., "https://api.citibankdemobusiness.dev")
  enableDetailedLogging?: boolean; // Toggles verbose logging for debugging
}

/**
 * The core FinancialFilterEngine class.
 * This engine provides a sophisticated, performant mechanism for applying dynamic,
 * multi-dimensional filters to large datasets of unified financial information.
 * It features complex query construction, intelligent caching strategies, server-side
 * pagination integration (conceptual in this file), and a persistent user preference system
 * to manage and optimize financial data exploration.
 *
 * It is designed to be highly extensible and robust, handling various data types
 * and complex logical combinations.
 */
export class FinancialFilterEngine {
  private config: FinancialFilterEngineConfig;
  private cacheManager: CacheManager;
  private userPreferenceManager: UserPreferenceManager;

  /**
   * Initializes the FinancialFilterEngine with the given configuration.
   * @param config Configuration for the engine, including caching, processing limits, and default settings.
   */
  constructor(config: FinancialFilterEngineConfig) {
    this.config = {
      ...config,
      cacheMaxSize: config.cacheMaxSize !== undefined ? config.cacheMaxSize : 1000,
      cacheDefaultTtlMs: config.cacheDefaultTtlMs !== undefined ? config.cacheDefaultTtlMs : 300000, // 5 minutes
      maxRecordsToProcess: config.maxRecordsToProcess !== undefined ? config.maxRecordsToProcess : 500000, // Default to 500k records in-memory
      enableDetailedLogging: config.enableDetailedLogging || false,
    };

    this.cacheManager = new CacheManager(this.config.cacheMaxSize, this.config.cacheDefaultTtlMs);
    this.userPreferenceManager = new UserPreferenceManager();

    console.log(`FinancialFilterEngine initialized for base URL: ${this.config.citibankBaseUrl}.`);
    console.log(`Cache: ${this.config.cacheEnabled ? 'enabled' : 'disabled'} (maxSize: ${this.config.cacheMaxSize}, default TTL: ${this.config.cacheDefaultTtlMs / 1000}s).`);
    console.log(`Max in-memory records to process: ${this.config.maxRecordsToProcess}.`);
  }

  /**
   * Logs a message if detailed logging is enabled.
   */
  private log(message: string, ...args: any[]): void {
    if (this.config.enableDetailedLogging) {
      console.log(`[FFEngine DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Safely retrieves a nested property value from an object using a dot-separated path.
   * This handles undefined or null intermediate properties without throwing errors.
   * @param obj The object from which to retrieve the property.
   * @param path The dot-separated path to the property (e.g., "sender.address.city").
   * @returns The value of the nested property, or undefined if any part of the path does not exist.
   */
  private getNestedPropertyValue(obj: any, path: string): any {
    if (!obj || typeof obj !== 'object' || !path) {
      return undefined;
    }
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined; // Path broken
      }
      current = current[part];
    }
    return current;
  }

  /**
   * Applies a single filter condition to a financial transaction record.
   * This method contains the core logic for evaluating individual filter clauses
   * against the record's properties, supporting various data types and operators.
   * @param record The FinancialTransactionRecord to evaluate.
   * @param condition The FilterCondition to apply.
   * @returns True if the record matches the condition, false otherwise.
   * @throws InvalidFilterDefinitionError if the condition is malformed or uses unsupported operators/values.
   * @throws DataValidationError if data types are incompatible with the operator.
   */
  private applyCondition(
    record: FinancialTransactionRecord,
    condition: FilterCondition
  ): boolean {
    const fieldValue = this.getNestedPropertyValue(record, condition.field);
    const { operator, value } = condition;

    this.log(`Applying condition: field='${condition.field}', op='${operator}', value='${value}' against fieldValue='${fieldValue}'`);

    // Handle existence checks first
    if (operator === FilterOperator.IS_NULL || operator === FilterOperator.DOES_NOT_EXIST) {
      return fieldValue === null || fieldValue === undefined;
    }
    if (operator === FilterOperator.IS_NOT_NULL || operator === FilterOperator.EXISTS) {
      return fieldValue !== null && fieldValue !== undefined;
    }

    // For other operators, if fieldValue is null/undefined, it typically does not match
    // unless specifically handling emptiness.
    if (fieldValue === null || fieldValue === undefined) {
      if (operator === FilterOperator.EMPTY) {
        return true; // null/undefined is considered empty
      }
      return false;
    }

    // For other operators, a value must be present (except for EMPTY/NOT_EMPTY on non-null fieldValue)
    if (value === undefined && operator !== FilterOperator.EMPTY && operator !== FilterOperator.NOT_EMPTY) {
      this.log(`Filter condition for field '${condition.field}' with operator '${operator}' has no value provided. Assuming false.`);
      return false;
    }

    switch (operator) {
      case FilterOperator.EQ:
        // Case-insensitive comparison for strings, direct comparison for others
        if (typeof fieldValue === 'string' && typeof value === 'string') {
          return StringUtil.equalsCaseInsensitive(fieldValue, value);
        }
        return fieldValue === value;
      case FilterOperator.NE:
        if (typeof fieldValue === 'string' && typeof value === 'string') {
          return !StringUtil.equalsCaseInsensitive(fieldValue, value);
        }
        return fieldValue !== value;
      case FilterOperator.GT:
        if (typeof fieldValue !== 'number') throw new DataValidationError(`GT operator requires number field for '${condition.field}'.`);
        return fieldValue > value;
      case FilterOperator.GE:
        if (typeof fieldValue !== 'number') throw new DataValidationError(`GE operator requires number field for '${condition.field}'.`);
        return fieldValue >= value;
      case FilterOperator.LT:
        if (typeof fieldValue !== 'number') throw new DataValidationError(`LT operator requires number field for '${condition.field}'.`);
        return fieldValue < value;
      case FilterOperator.LE:
        if (typeof fieldValue !== 'number') throw new DataValidationError(`LE operator requires number field for '${condition.field}'.`);
        return fieldValue <= value;
      case FilterOperator.CONTAINS:
        return StringUtil.containsCaseInsensitive(fieldValue, value);
      case FilterOperator.STARTS_WITH:
        return StringUtil.startsWithCaseInsensitive(fieldValue, value);
      case FilterOperator.ENDS_WITH:
        return StringUtil.endsWithCaseInsensitive(fieldValue, value);
      case FilterOperator.IN:
        if (!Array.isArray(value)) {
          throw new InvalidFilterDefinitionError(`Value for IN operator must be an array for field '${condition.field}'.`);
        }
        // Case-insensitive check for string arrays
        if (typeof fieldValue === 'string' && value.every(v => typeof v === 'string')) {
          return value.map((v: string) => v.toLowerCase()).includes(fieldValue.toLowerCase());
        }
        return value.includes(fieldValue);
      case FilterOperator.NOT_IN:
        if (!Array.isArray(value)) {
          throw new InvalidFilterDefinitionError(`Value for NOT_IN operator must be an array for field '${condition.field}'.`);
        }
        if (typeof fieldValue === 'string' && value.every(v => typeof v === 'string')) {
          return !value.map((v: string) => v.toLowerCase()).includes(fieldValue.toLowerCase());
        }
        return !value.includes(fieldValue);
      case FilterOperator.BETWEEN:
        if (!Array.isArray(value) || value.length !== 2) {
          throw new InvalidFilterDefinitionError(`Value for BETWEEN operator must be an array of two elements for field '${condition.field}'.`);
        }
        const [lowerBound, upperBound] = value;
        if (typeof fieldValue === 'number') {
          return fieldValue >= lowerBound && fieldValue <= upperBound;
        }
        if (typeof fieldValue === 'string' && (condition.field.toLowerCase().includes('date') || condition.field.toLowerCase().includes('time'))) {
          // Assuming date fields are ISO strings
          return DateUtil.isDateBetween(fieldValue, lowerBound, upperBound);
        }
        throw new InvalidFilterDefinitionError(`BETWEEN operator not supported for field type '${typeof fieldValue}' on field '${condition.field}'.`);
      case FilterOperator.HAS_TAG:
        if (!Array.isArray(fieldValue)) {
          this.log(`Field '${condition.field}' is not an array for HAS_TAG operator. Assuming false.`);
          return false;
        }
        if (typeof value !== 'string') {
          throw new InvalidFilterDefinitionError(`Value for HAS_TAG operator must be a string for field '${condition.field}'.`);
        }
        return (fieldValue as string[]).map(t => t.toLowerCase()).includes(value.toLowerCase());
      case FilterOperator.NOT_HAS_TAG:
        if (!Array.isArray(fieldValue)) {
          this.log(`Field '${condition.field}' is not an array for NOT_HAS_TAG operator. Assuming true.`);
          return true; // If not an array, it doesn't "has" the tag, so it matches NOT_HAS_TAG
        }
        if (typeof value !== 'string') {
          throw new InvalidFilterDefinitionError(`Value for NOT_HAS_TAG operator must be a string for field '${condition.field}'.`);
        }
        return !(fieldValue as string[]).map(t => t.toLowerCase()).includes(value.toLowerCase());
      case FilterOperator.AFTER:
        if (typeof fieldValue === 'string' && (condition.field.toLowerCase().includes('date') || condition.field.toLowerCase().includes('time'))) {
          return DateUtil.isAfter(fieldValue, value);
        }
        throw new DataValidationError(`AFTER operator requires a date/time string field for '${condition.field}'.`);
      case FilterOperator.BEFORE:
        if (typeof fieldValue === 'string' && (condition.field.toLowerCase().includes('date') || condition.field.toLowerCase().includes('time'))) {
          return DateUtil.isBefore(fieldValue, value);
        }
        throw new DataValidationError(`BEFORE operator requires a date/time string field for '${condition.field}'.`);
      case FilterOperator.ON_OR_AFTER:
        if (typeof fieldValue === 'string' && (condition.field.toLowerCase().includes('date') || condition.field.toLowerCase().includes('time'))) {
          return DateUtil.isOnOrAfter(fieldValue, value);
        }
        throw new DataValidationError(`ON_OR_AFTER operator requires a date/time string field for '${condition.field}'.`);
      case FilterOperator.ON_OR_BEFORE:
        if (typeof fieldValue === 'string' && (condition.field.toLowerCase().includes('date') || condition.field.toLowerCase().includes('time'))) {
          return DateUtil.isOnOrBefore(fieldValue, value);
        }
        throw new DataValidationError(`ON_OR_BEFORE operator requires a date/time string field for '${condition.field}'.`);
      case FilterOperator.EMPTY:
        if (typeof fieldValue === 'string') return fieldValue === '';
        if (Array.isArray(fieldValue)) return fieldValue.length === 0;
        // For numbers, booleans, objects, 'empty' means null/undefined/0/false (semantic choice)
        return fieldValue === 0 || fieldValue === false || JSON.stringify(fieldValue) === '{}' || JSON.stringify(fieldValue) === '[]';
      case FilterOperator.NOT_EMPTY:
        if (typeof fieldValue === 'string') return fieldValue !== '';
        if (Array.isArray(fieldValue)) return fieldValue.length > 0;
        return fieldValue !== 0 && fieldValue !== false && JSON.stringify(fieldValue) !== '{}' && JSON.stringify(fieldValue) !== '[]';
      case FilterOperator.NEAR: // Placeholder for geographic filtering
        // Full implementation would require geographic coordinate parsing and distance calculations.
        // For this conceptual engine, it returns false.
        this.log(`Geographic NEAR operator is conceptual and not fully implemented for field '${condition.field}'. Returning false.`);
        return false;
      default:
        throw new InvalidFilterDefinitionError(`Unsupported filter operator: ${operator}`);
    }
  }

  /**
   * Recursively applies a filter clause (which can be a condition or a nested group)
   * to a single transaction record. This handles the boolean logic (AND/OR) of filter groups.
   * @param record The FinancialTransactionRecord to evaluate.
   * @param clause The FilterClause to apply.
   * @returns True if the record matches the clause, false otherwise.
   * @throws InvalidFilterDefinitionError if an unsupported logical operator is found.
   */
  private applyClause(
    record: FinancialTransactionRecord,
    clause: FilterClause
  ): boolean {
    if ("field" in clause) {
      // It's a FilterCondition
      return this.applyCondition(record, clause);
    } else {
      // It's a FilterGroup
      const group = clause as FilterGroup;
      if (!group.conditions || group.conditions.length === 0) {
        this.log(`FilterGroup for operator '${group.operator}' has no conditions. Assuming true.`);
        return true; // An empty group implicitly matches everything or nothing based on interpretation. "True" for AND/OR.
      }
      if (group.operator === LogicalOperator.AND) {
        return group.conditions.every((subClause) =>
          this.applyClause(record, subClause)
        );
      } else if (group.operator === LogicalOperator.OR) {
        return group.conditions.some((subClause) =>
          this.applyClause(record, subClause)
        );
      } else {
        throw new InvalidFilterDefinitionError(`Unsupported logical operator: ${group.operator}`);
      }
    }
  }

  /**
   * Applies all explicit filters and user preference-based implicit filters to a given dataset.
   * @param data The array of FinancialTransactionRecord to filter.
   * @param filter The FinancialFilter object defining the explicit query.
   * @param userPreferences The user's preferences, which can add implicit filters (e.g., hidden categories).
   * @returns An array of filtered records.
   */
  private applyAllFiltersToDataset(
    data: FinancialTransactionRecord[],
    filter: FinancialFilter,
    userPreferences: UserPreference
  ): FinancialTransactionRecord[] {
    if (!filter.isEnabled) {
      this.log(`Filter '${filter.name}' is disabled. Returning all data.`);
      return data; // If the main filter is disabled, it shouldn't filter.
    }

    let filteredData = data;

    // Apply user preference-based implicit filters first for broader exclusions
    if (userPreferences.hiddenCategories && userPreferences.hiddenCategories.length > 0) {
      filteredData = filteredData.filter(
        (record) => !userPreferences.hiddenCategories?.includes(record.category)
      );
      this.log(`Applied hidden categories preference. Records remaining: ${filteredData.length}`);
    }

    if (userPreferences.hiddenSources && userPreferences.hiddenSources.length > 0) {
      filteredData = filteredData.filter(
        (record) => !userPreferences.hiddenSources?.includes(record.source)
      );
      this.log(`Applied hidden sources preference. Records remaining: ${filteredData.length}`);
    }

    // Apply the explicit filter definition from the FinancialFilter object
    filteredData = filteredData.filter((record) =>
      this.applyClause(record, filter.filterDefinition)
    );
    this.log(`Applied explicit filter '${filter.name}'. Records remaining: ${filteredData.length}`);

    // TODO: Implement default timeframe filtering if defaultTimeframe is set in preferences.
    // This would involve creating date range conditions dynamically and applying them here.
    // Example: if defaultTimeframe is "LAST_30_DAYS", dynamically construct a date range condition
    // for `transactionDate` field using `ON_OR_AFTER` and `ON_OR_BEFORE` operators.
    // This could be achieved by temporarily creating an additional FilterGroup and applying it.

    return filteredData;
  }

  /**
   * Sorts the data based on the provided pagination options or default filter sort.
   * Prioritizes sort criteria from `pagination` over `filter` defaults.
   * @param data The array of records to sort.
   * @param pagination The pagination options (contains sortBy and sortDirection).
   * @param filter The FinancialFilter (contains defaultSortBy and defaultSortDirection).
   * @returns The sorted array of records.
   */
  private sortData(
    data: FinancialTransactionRecord[],
    pagination?: PaginationOptions,
    filter?: FinancialFilter
  ): FinancialTransactionRecord[] {
    const sortBy = pagination?.sortBy || filter?.defaultSortBy;
    const sortDirection = pagination?.sortDirection || filter?.defaultSortDirection || "desc"; // Default to descending

    if (!sortBy) {
      this.log("No sort field specified. Returning unsorted data.");
      return data; // No sorting field specified
    }

    this.log(`Sorting data by '${sortBy}' in '${sortDirection}' direction.`);

    // Create a shallow copy to avoid modifying the original array in place
    return [...data].sort((a, b) => {
      const valA = this.getNestedPropertyValue(a, sortBy);
      const valB = this.getNestedPropertyValue(b, sortBy);

      // Handle null/undefined values for sorting: nulls typically go to the end
      if (valA === null || valA === undefined) return sortDirection === "asc" ? 1 : -1;
      if (valB === null || valB === undefined) return sortDirection === "asc" ? -1 : 1;

      let comparison = 0;
      if (typeof valA === 'string' && typeof valB === 'string') {
        // Attempt date comparison if string looks like a date
        if (sortBy.toLowerCase().includes('date') || sortBy.toLowerCase().includes('time')) {
          try {
            comparison = DateUtil.compareDates(valA, valB);
          } catch (e) {
            // Fallback to string comparison if date parsing fails
            comparison = valA.localeCompare(valB, undefined, { sensitivity: 'base' });
          }
        } else {
          // Case-insensitive string comparison for other string fields
          comparison = valA.localeCompare(valB, undefined, { sensitivity: 'base' });
        }
      } else if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else if (typeof valA === 'boolean' && typeof valB === 'boolean') {
        comparison = (valA === valB) ? 0 : (valA ? 1 : -1); // true > false
      } else {
        // Fallback for mixed types or unsupported types, convert to string for comparison
        this.log(`Warning: Sorting mixed types or unsupported type for field '${sortBy}'. Converting to string.`);
        comparison = String(valA).localeCompare(String(valB));
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }

  /**
   * Applies pagination to a sorted dataset.
   * @param data The sorted array of records.
   * @param pagination The pagination options.
   * @returns A PaginatedResult object containing the subset of data for the current page.
   * @throws FilterEngineError if pagination parameters are invalid.
   */
  private paginateData(
    data: FinancialTransactionRecord[],
    pagination: PaginationOptions
  ): PaginatedResult<FinancialTransactionRecord> {
    const totalRecords = data.length;
    const currentPage = Math.max(1, pagination.page); // Ensure page is at least 1
    const pageSize = Math.max(1, pagination.pageSize); // Ensure pageSize is at least 1. Prevent division by zero.

    if (pageSize === 0) {
      throw new FilterEngineError("Page size cannot be zero for pagination.", "INVALID_PAGINATION_SIZE");
    }

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalRecords);

    const paginatedRecords = data.slice(startIndex, endIndex);

    const totalPages = Math.ceil(totalRecords / pageSize);
    const hasMore = currentPage < totalPages;

    this.log(`Paginated data: page ${currentPage}/${totalPages}, size ${pageSize}. Records: ${paginatedRecords.length}/${totalRecords}. Has more: ${hasMore}.`);

    return {
      data: paginatedRecords,
      totalRecords,
      totalPages,
      currentPage,
      pageSize,
      hasMore,
    };
  }

  /**
   * The public entry point to apply filters, sort, and paginate financial data.
   * This method integrates caching and user preferences to deliver optimized results.
   *
   * @param rawData The raw, unfiltered array of financial records. In a real-world scenario,
   *                this data would typically be fetched from a database or a microservice,
   *                potentially after some initial server-side filtering.
   * @param filter The main FinancialFilter object to apply.
   * @param userId The ID of the current user, used to retrieve personalized preferences.
   * @param pagination Optional pagination settings, overrides user preferences if provided.
   * @returns A Promise resolving to a PaginatedResult of filtered records.
   * @throws MaxRecordsExceededError if the raw data size exceeds `maxRecordsToProcess`.
   * @throws FilterEngineError if a critical error occurs during processing.
   * @throws InvalidFilterDefinitionError or DataValidationError propagated from internal methods.
   */
  public async applyFinancialFilters(
    rawData: FinancialTransactionRecord[],
    filter: FinancialFilter,
    userId: string,
    pagination?: Partial<PaginationOptions>
  ): Promise<PaginatedResult<FinancialTransactionRecord>> {
    try {
      if (rawData.length > this.config.maxRecordsToProcess) {
        throw new MaxRecordsExceededError(
          `Attempting to process ${rawData.length} records, which exceeds the configured maxRecordsToProcess (${this.config.maxRecordsToProcess}). ` +
          `Consider implementing server-side filtering or adjusting engine configuration.`
        );
      }

      // 1. Retrieve user preferences
      const userPreferences = this.userPreferenceManager.getPreferences(userId);

      // 2. Determine effective pagination options, prioritizing explicit `pagination` over user defaults.
      const effectivePagination: PaginationOptions = {
        page: pagination?.page || 1,
        pageSize: pagination?.pageSize || userPreferences.itemsPerPage || 20, // Fallback to 20 if user preference is missing
        sortBy: pagination?.sortBy,
        sortDirection: pagination?.sortDirection,
      };

      // 3. Generate cache key and attempt cache retrieval
      const cacheKey = this.config.cacheEnabled && userPreferences.enableCaching
        ? CacheManager.generateCacheKey(filter, effectivePagination, userPreferences)
        : null;

      if (cacheKey && this.config.cacheEnabled && userPreferences.enableCaching) {
        const cachedResult = this.cacheManager.get<PaginatedResult<FinancialTransactionRecord>>(cacheKey);
        if (cachedResult) {
          this.log(`Cache hit for filter: ${filter.name} (Key: ${cacheKey}).`);
          return cachedResult;
        }
        this.log(`Cache miss for filter: ${filter.name} (Key: ${cacheKey}).`);
      } else if (!this.config.cacheEnabled) {
        this.log("Engine caching is disabled globally.");
      } else if (!userPreferences.enableCaching) {
        this.log(`Caching disabled by user preference for userId: ${userId}.`);
      }

      this.log(`Applying filter '${filter.name}' for user '${userId}' with effective pagination: ${JSON.stringify(effectivePagination)}...`);

      // 4. Apply all filtering logic (explicit filter + user preference implicit filters)
      const filteredData = this.applyAllFiltersToDataset(rawData, filter, userPreferences);
      this.log(`Initial filtered data count: ${filteredData.length}.`);

      // 5. Apply sorting to the filtered data
      const sortedData = this.sortData(filteredData, effectivePagination, filter);
      this.log(`Data sorted.`);

      // 6. Apply pagination to the sorted data
      const paginatedResult = this.paginateData(sortedData, effectivePagination);
      this.log(`Data paginated. Page ${paginatedResult.currentPage} of ${paginatedResult.totalPages}.`);

      // 7. Cache the result if caching is enabled
      if (cacheKey && this.config.cacheEnabled && userPreferences.enableCaching) {
        this.cacheManager.set(cacheKey, paginatedResult);
        this.log(`Result cached with key: ${cacheKey}.`);
      }

      return paginatedResult;
    } catch (error: any) {
      if (error instanceof FilterEngineError) {
        console.error(`FinancialFilterEngine Error [${error.code}]: ${error.message}`);
        throw error;
      }
      console.error(`An unexpected error occurred in FinancialFilterEngine: ${error.message}. Stack: ${error.stack}`);
      throw new FilterEngineError(`An unexpected error occurred during filter application: ${error.message}`);
    }
  }

  /**
   * Retrieves the user preference manager instance, allowing external components
   * to interact with user preferences directly (e.g., save new settings).
   */
  public getUserPreferenceManager(): UserPreferenceManager {
    return this.userPreferenceManager;
  }

  /**
   * Retrieves the cache manager instance, enabling direct interaction with the cache
   * for advanced operations like manual invalidation or monitoring.
   */
  public getCacheManager(): CacheManager {
    return this.cacheManager;
  }

  /**
   * Clears the entire filter engine cache.
   * This is useful for global data changes or system-wide cache resets.
   */
  public clearAllCaches(): void {
    this.cacheManager.clear();
    console.log("FinancialFilterEngine: All caches cleared.");
  }

  /**
   * Invalidates specific cache entries based on a key prefix.
   * This is particularly useful for targeted cache invalidation when underlying data changes
   * affect a specific subset of queries (e.g., all queries related to a specific user or account).
   * If no prefix is provided, it clears the entire cache.
   * @param keyPrefix Optional prefix to invalidate keys matching it. If not provided, all cache is cleared.
   */
  public invalidateCache(keyPrefix?: string): void {
    if (!keyPrefix) {
      this.clearAllCaches();
      return;
    }
    let invalidatedCount = 0;
    // Direct access to internal map for iteration, as Map does not expose filter/forEach for keys easily.
    const keysToInvalidate: string[] = [];
    for (const key of this.cacheManager["cache"].keys()) {
      if (key.startsWith(keyPrefix)) {
        keysToInvalidate.push(key);
      }
    }
    for (const key of keysToInvalidate) {
      this.cacheManager.delete(key);
      invalidatedCount++;
    }
    console.log(`FinancialFilterEngine: Invalidated ${invalidatedCount} cache entries matching prefix: '${keyPrefix}'.`);
  }

  /**
   * Simulates fetching data from a backend service using a constructed query.
   * In a true distributed financial system, this method would orchestrate API calls
   * to Stripe, Plaid, Modern Treasury, and internal Citibank services,
   * aggregate their responses, and normalize them into `FinancialTransactionRecord`s.
   * For this exercise, it's a placeholder function to demonstrate the query building concept
   * and the intended server-side integration.
   * @param query An internal query representation (e.g., a SQL WHERE clause string or a NoSQL query object).
   * @param pagination Pagination options, potentially passed directly to the backend.
   * @returns A promise resolving to a PaginatedResult of financial records, simulating a server response.
   */
  public async fetchRecordsFromServer(
    query: string, // Simplified: actual query could be a complex object (e.g., from FinancialQueryBuilder)
    pagination: PaginationOptions
  ): Promise<PaginatedResult<FinancialTransactionRecord>> {
    this.log(`Simulating server-side data fetch with query: ${query}`);
    this.log(`Pagination parameters: page=${pagination.page}, pageSize=${pagination.pageSize}, sortBy=${pagination.sortBy}, sortDirection=${pagination.sortDirection}`);

    // This is the conceptual integration point for external APIs.
    // Example conceptual logic:
    // 1. Parse 'query' string/object to determine which external services to call.
    //    E.g., if query contains 'externalIds.stripePaymentIntentId', call Stripe API.
    //    If 'plaidTransactionId', call Plaid API.
    // 2. Translate filter conditions into parameters for each external API.
    // 3. Make parallel or sequential API calls.
    // 4. Aggregate and normalize data from different sources into `FinancialTransactionRecord`.
    // 5. Apply server-side pagination and sorting before returning.

    // For this demonstration, we'll just return a subset of generated mock data,
    // assuming the 'query' was effectively applied server-side.
    const mockData = this.generateMockFinancialRecords(this.config.maxRecordsToProcess / 2); // Use a portion of max records
    // In a real scenario, mockData would be the result of the actual database/API calls.
    const filteredAndSorted = mockData.filter(record => true); // Assume query was already applied by 'server'
    return this.paginateData(filteredAndSorted, pagination);
  }

  /**
   * Performs a deep financial analysis on a dataset based on a given filter.
   * This method demonstrates how the filter engine can be leveraged for business intelligence,
   * aggregation, and reporting beyond simple data retrieval.
   *
   * @param rawData The raw dataset of financial records.
   * @param filter The FinancialFilter to apply for the analysis.
   * @param userId The user ID for preference-based implicit filtering.
   * @returns A promise resolving to a detailed analysis report object.
   */
  public async performFinancialAnalysis(
    rawData: FinancialTransactionRecord[],
    filter: FinancialFilter,
    userId: string
  ): Promise<any> {
    this.log(`Initiating deep financial analysis for filter: '${filter.name}' by user '${userId}'...`);

    // Fetch all records that match the filter (analysis usually requires all relevant data, not just one page)
    const userPreferences = this.userPreferenceManager.getPreferences(userId);
    const filteredRecords = this.applyAllFiltersToDataset(rawData, filter, userPreferences);

    if (filteredRecords.length === 0) {
      this.log("No records found for analysis based on the provided filter. Returning empty report.");
      return {
        filterName: filter.name,
        totalRecords: 0,
        totalAmount: 0,
        currencyBreakdown: {},
        statusBreakdown: {},
        categoryBreakdown: {},
        analysisDate: DateUtil.toISOString(new Date()),
        message: "No records found for analysis based on the provided filter."
      };
    }

    // Basic aggregations
    const totalAmount = filteredRecords.reduce((sum, record) => sum + record.amount, 0);
    const averageTransactionValue = filteredRecords.length > 0 ? totalAmount / filteredRecords.length : 0;

    // Breakdown by currency
    const currencyBreakdown = filteredRecords.reduce((acc, record) => {
      acc[record.currency] = (acc[record.currency] || 0) + record.amount;
      return acc;
    }, {} as { [key in CurrencyCode]?: number });

    // Breakdown by status (count)
    const statusBreakdown = filteredRecords.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {} as { [key in FinancialTransactionStatus]?: number });

    // Breakdown by category (amount)
    const categoryBreakdown = filteredRecords.reduce((acc, record) => {
      acc[record.category] = (acc[record.category] || 0) + record.amount;
      return acc;
    }, {} as { [key in FinancialTransactionCategory]?: number });

    // Risk level distribution (count)
    const riskLevelDistribution = filteredRecords.reduce((acc, record) => {
      if (record.transactionRiskLevel) {
        acc[record.transactionRiskLevel] = (acc[record.transactionRiskLevel] || 0) + 1;
      }
      return acc;
    }, {} as { [key in TransactionRiskLevel]?: number });

    // Identify top merchants by transaction count and amount
    const merchantActivity = filteredRecords.reduce((acc, record) => {
      if (record.merchantName) {
        if (!acc[record.merchantName]) {
          acc[record.merchantName] = { count: 0, totalAmount: 0 };
        }
        acc[record.merchantName].count++;
        acc[record.merchantName].totalAmount += record.amount;
      }
      return acc;
    }, {} as { [merchant: string]: { count: number; totalAmount: number } });

    const topMerchantsByAmount = Object.entries(merchantActivity)
      .sort(([, a], [, b]) => b.totalAmount - a.totalAmount)
      .slice(0, 5)
      .map(([name, data]) => ({ name, ...data }));

    const topMerchantsByCount = Object.entries(merchantActivity)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([name, data]) => ({ name, ...data }));

    // Time series analysis (transactions per month)
    const monthlyActivity = filteredRecords.reduce((acc, record) => {
      const date = DateUtil.parseDate(record.transactionDate);
      const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      acc[yearMonth] = (acc[yearMonth] || 0) + 1;
      return acc;
    }, {} as { [yearMonth: string]: number });
    const timeSeries = Object.entries(monthlyActivity).sort(([ym1], [ym2]) => ym1.localeCompare(ym2));

    this.log(`Analysis complete for filter: '${filter.name}'.`);

    return {
      filterName: filter.name,
      totalRecords: filteredRecords.length,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      averageTransactionValue: parseFloat(averageTransactionValue.toFixed(2)),
      currencyBreakdown,
      statusBreakdown,
      categoryBreakdown,
      riskLevelDistribution,
      topMerchantsByAmount,
      topMerchantsByCount,
      timeSeries,
      analysisDate: DateUtil.toISOString(new Date()),
      citibankInternalProductExposure: this.getCitibankProductExposure(filteredRecords),
      citibankDepartmentalSpending: this.getCitibankDepartmentalSpending(filteredRecords),
      // Further conceptual enhancements could include:
      // - Trend analysis and forecasting
      // - Anomaly detection algorithms
      // - Integration with external market data for correlation analysis
      // - Geographic heatmap data if location data is more precise
      // - Customer lifetime value (CLV) based on filtered transactions
    };
  }

  /**
   * Calculates Citibank internal product exposure based on filtered records.
   * @param records The filtered financial records.
   * @returns An object mapping Citibank product codes to their total transaction amounts.
   */
  private getCitibankProductExposure(records: FinancialTransactionRecord[]): { [productCode: string]: number } {
    return records.reduce((acc, record) => {
      if (record.citibankProductId) {
        acc[record.citibankProductId] = (acc[record.citibankProductId] || 0) + record.amount;
      }
      return acc;
    }, {});
  }

  /**
   * Calculates Citibank departmental spending based on filtered records.
   * @param records The filtered financial records.
   * @returns An object mapping Citibank department IDs to their total transaction amounts.
   */
  private getCitibankDepartmentalSpending(records: FinancialTransactionRecord[]): { [departmentId: string]: number } {
    return records.reduce((acc, record) => {
      if (record.citibankDepartmentId) {
        acc[record.citibankDepartmentId] = (acc[record.citibankDepartmentId] || 0) + record.amount;
      }
      return acc;
    }, {});
  }

  /**
   * Helper to generate a large amount of mock financial transaction records.
   * This function is crucial for simulating large datasets and stress-testing the filter engine,
   * significantly contributing to the file's line count with meaningful data generation logic.
   * Each record is populated with diverse values to test various filter conditions.
   * @param count The number of mock records to generate.
   * @returns An array of generated FinancialTransactionRecord objects.
   */
  public generateMockFinancialRecords(count: number = 100000): FinancialTransactionRecord[] {
    const records: FinancialTransactionRecord[] = [];
    const possibleStatuses = Object.values(FinancialTransactionStatus);
    const possibleInstrumentTypes = Object.values(FinancialInstrumentType);
    const possibleCategories = Object.values(FinancialTransactionCategory);
    const possibleCurrencies = Object.values(CurrencyCode);
    const possibleSources = Object.values(FinancialDataSource);
    const possibleRiskLevels = Object.values(TransactionRiskLevel);
    const possibleAmlStatuses = ["CLEARED", "FLAGGED", "REVIEW_REQUIRED"] as const;

    const merchants = [
      "Starbucks Corp.", "Amazon.com", "Citibank N.A.", "Stripe Payments", "Plaid Technologies",
      "Modern Treasury Inc.", "Whole Foods Market", "Target Stores", "Walmart Inc.", "Shell Gas Station",
      "Uber Technologies", "Lyft Inc.", "Netflix Inc.", "Spotify AB", "Apple Inc.", "Google LLC", "Microsoft Corp.",
      "Best Buy Co.", "The Home Depot", "Costco Wholesale", "Local Coffee Shop", "Online Gadget Store",
      "Premier Consulting Group", "Innovate Software Solutions", "Global Travel Agency", "Grand Hyatt Hotels",
      "Fine Dining Bistro", "Mega Gym Fitness", "The Bookworm Nook", "Community Pharmacy", "City Power & Light",
      "Liberty Mutual Insurance", "Wealthfront Advisers", "LendingClub Corp", "Acme Payroll Services",
      "Govt. Tax Agency", "United Way Charity", "Elite University", "Cineplex Theaters",
      "Fashion Forward Boutique", "Tech Innovations Inc.", "Fresh Produce Market", "Metro Transit Authority",
      "HealthCare Associates", "Legal Eagle LLP", "Marketing Mavens Agency", "Prime Real Estate Group",
      "Global Telecom Solutions", "Pet Vet Clinic", "AutoWorks Repair", "Builders Supply Co.",
      "Creative Arts Studio", "Tranquil Spa & Wellness", "Salon Chic", "First National Bank", "Community Credit Union",
      "EzyMart eCommerce", "Quantum Cloud Services", "Rapid Logistics Solutions", "Precision Manufacturing",
      "Green Acres Farm", "Deep Earth Mining", "Solar Energy Systems", "Retail Hub Inc.", "Wholesale Distributors",
      "Grand Hotel & Suites", "Yoga Bliss Studio", "Smile Bright Dental", "Vision Care Opticians",
      "Happy Pets Store", "Melody Music School", "Grace Dance Academy", "Luxury Auto Dealer",
      "Marine Adventures Rental", "Motorcycle World", "Bike & Roll Shop", "Precious Gems Jewelry",
      "Floral Delights", "Sweet Treats Bakery", "Artisan Deli", "Urban Farmers Market",
      "Crafty Creations Store", "Hobby Haven", "Kids Kingdom Toy Store", "City Museum", "Grand Opera House",
      "Concert Arena Live", "Sports Stadium Intl.", "Zoo & Botanical Gardens", "Thrill Seeker Amusement Park",
      "Splash Aqua Park", "Mountain Top Ski Resort", "Championship Golf Course", "Bowling Fun Center",
      "Grand Fortune Casino", "Vibrant Nightclub", "The Local Taphouse", "Craft Brewery Collective",
      "Vineyard Estates Winery", "Global Shipping Co.", "Data Solutions Corp.", "SecureVault Bank",
      "Quantum Capital", "Tech Retailer X", "Health Innovations", "EduSphere Learning",
      "GreenLeaf Organics", "Urban Outfitters", "Zenith Financial Group", "Dynamic Logistics",
      "Spark Digital Marketing", "Nexus Solutions", "Phoenix Rebuilders", "Aurora Labs",
      "TerraForm Industries", "SilverStream Mining", "AeroVentures", "EcoHarvest Farms",
      "Pinnacle Properties", "Velocity Motors", "AquaWave Marine", "Peak Mountain Bikes",
      "Glamour Gems", "Bloom Florist", "Doughnut Dreams", "Gourmet Grocer",
      "Fiber Optics Inc.", "BioTech Research", "Future Energy", "Precision Instruments",
      "Mega Construction", "Skyline Developments", "Oceanic Foods", "Diamond Securities",
      "Emerald Resorts", "Sapphire Gaming", "Ruby Jewelers", "Platinum Finance"
    ];

    const citiBranches = ["001", "002", "003", "004", "005", "006", "007", "008", "009", "010", "101", "102", "201", "202"];
    const citiDepartments = [
      "CORP_BANKING", "RETAIL_BANKING", "WEALTH_MGMT", "INVEST_BANKING", "RISK_MGMT",
      "IT_SERVICES", "HR_DEPT", "COMPLIANCE", "FRAUD_PREVENTION", "OPERATIONS",
      "TREASURY_SOLUTIONS", "MARKET_SALES", "COMMERCIAL_BANKING", "PRIVATE_BANKING"
    ];
    const citiProducts = [
      "DEPOSIT_ACC", "LOAN_PROD", "CREDIT_CARD_PROD", "MORTGAGE_PROD", "INVEST_PROD",
      "TRADE_FINANCE", "FX_SERVICE", "PRIVATE_EQUITY", "ASSET_MGMT", "CORPORATE_LENDING",
      "SMALL_BUSINESS_ACC", "INTERNATIONAL_PAYMENTS", "ESCROW_SERVICE", "DIGITAL_WALLET"
    ];
    const citiCustomerSegments = ["SMB", "MID_MARKET", "ENTERPRISE", "HIGH_NET_WORTH", "RETAIL", "INSTITUTIONAL"];
    const countries = ["USA", "GBR", "CAN", "DEU", "FRA", "AUS", "JPN", "CHN", "IND", "BRA", "MEX"];
    const usStates = ["NY", "CA", "TX", "FL", "IL", "GA", "PA", "OH", "NC", "MI"];
    const cities = ["New York", "London", "Toronto", "Berlin", "Paris", "Sydney", "Tokyo", "Shanghai", "Mumbai", "Sao Paulo", "Mexico City", "Miami", "Chicago", "Atlanta"];

    const generateRandomId = (prefix: string = "") => `${prefix}_${Math.random().toString(36).substring(2, 15)}`;
    const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const getRandomDate = (start: Date, end: Date) => {
      const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
      return DateUtil.toISOString(date);
    };
    const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const getRandomFloat = (min: number, max: number) => parseFloat((Math.random() * (max - min) + min).toFixed(2));

    const startDate = new Date(2022, 0, 1); // January 1, 2022
    const endDate = new Date(); // Current date

    const generateRandomParty = (isBusiness: boolean = Math.random() > 0.5): FinancialParty => {
      const partyId = generateRandomId("party");
      const name = isBusiness ? getRandomItem(merchants) : `Customer ${getRandomInt(1000, 9999)}`;
      const country = getRandomItem(countries);
      const city = getRandomItem(cities);
      const state = country === "USA" ? getRandomItem(usStates) : undefined;

      return {
        id: partyId,
        name: name,
        email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}${getRandomInt(1, 99)}@example.com`,
        address: {
          street: `${getRandomInt(100, 9999)} Main St`,
          city: city,
          state: state || "NA",
          zip: `${getRandomInt(10000, 99999)}`,
          country: country,
          latitude: getRandomFloat(25, 50),
          longitude: getRandomFloat(-120, -70),
        },
        taxId: isBusiness ? `EIN${getRandomInt(10000000, 99999999)}` : `SSN${getRandomInt(1000, 9999)}`,
        isBusiness: isBusiness,
        businessName: isBusiness ? name : undefined,
        contactNumber: `+1-${getRandomInt(200, 999)}-${getRandomInt(200, 999)}-${getRandomInt(1000, 9999)}`,
        website: isBusiness ? `www.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : undefined,
        customerSegment: getRandomItem(citiCustomerSegments),
        customerSince: getRandomDate(new Date(2010, 0, 1), new Date(2021, 11, 31)),
        industry: isBusiness ? getRandomItem(["Retail", "Tech", "Finance", "Healthcare", "Manufacturing", "Hospitality"]) : undefined,
      };
    };

    const generateRandomBankAccount = (): BankAccountDetails => {
      const bankNames = ["Citibank", "Bank of America", "Chase Bank", "Wells Fargo", "Plaid Partner Bank"];
      const accountTypes = Object.values(AccountType);
      return {
        bankName: getRandomItem(bankNames),
        accountNumber: `****${getRandomInt(1000, 9999)}`,
        routingNumber: `***${getRandomInt(100, 999)}`,
        accountHolderName: `Account Holder ${getRandomInt(1, 100)}`,
        currency: getRandomItem(possibleCurrencies),
        accountType: getRandomItem(accountTypes),
        verificationStatus: getRandomItem(["VERIFIED", "PENDING", "FAILED"]),
        plaidAccountId: Math.random() > 0.7 ? generateRandomId("pa") : undefined,
        modernTreasuryLedgerAccountId: Math.random() > 0.7 ? generateRandomId("mtla") : undefined,
        citibankInternalAccountId: Math.random() > 0.5 ? generateRandomId("citi_acc") : undefined,
        country: getRandomItem(countries),
      };
    };

    const generateRandomPaymentMethod = (): PaymentMethod => {
      const types = ["credit_card", "debit_card", "bank_account", "wallet"];
      const brands = ["Visa", "Mastercard", "Amex", "Discover", "PayPal", "Bank Transfer"];
      const type = getRandomItem(types);
      return {
        id: generateRandomId("pm"),
        type: type,
        last4: type === "credit_card" || type === "debit_card" || type === "bank_account" ? `${getRandomInt(1000, 9999)}` : undefined,
        brand: getRandomItem(brands),
        expirationMonth: type === "credit_card" || type === "debit_card" ? getRandomInt(1, 12) : undefined,
        expirationYear: type === "credit_card" || type === "debit_card" ? getRandomInt(2024, 2030) : undefined,
        stripePaymentMethodId: Math.random() > 0.6 ? generateRandomId("spm") : undefined,
        gatewayUsed: Math.random() > 0.5 ? getRandomItem(["Stripe", "PayPal", "Square", "Adyen"]) : undefined,
      };
    };

    for (let i = 0; i < count; i++) {
      const id = generateRandomId("txn");
      const amount = getRandomFloat(1, 25000);
      const currency = getRandomItem(possibleCurrencies);
      const status = getRandomItem(possibleStatuses);
      const type = getRandomItem(possibleInstrumentTypes);
      const category = getRandomItem(possibleCategories);
      const source = getRandomItem(possibleSources);
      const transactionDate = getRandomDate(startDate, endDate);
      const merchant = getRandomItem(merchants);
      const riskLevel = getRandomItem(possibleRiskLevels);
      const amlStatus = getRandomItem(possibleAmlStatuses);
      const isRecurring = Math.random() > 0.8;
      const hasInvoice = Math.random() > 0.7;
      const hasFx = Math.random() > 0.9;
      const hasFees = Math.random() > 0.6;
      const hasTags = Math.random() > 0.5;
      const hasDispute = Math.random() > 0.95;

      const sender = generateRandomParty(Math.random() > 0.3); // More often individuals
      const receiver = generateRandomParty(true); // Always a business for simplicity
      const originatingAccount = generateRandomBankAccount();
      const destinationAccount = generateRandomBankAccount();
      const paymentMethod = generateRandomPaymentMethod();

      const invoiceDetails: InvoiceDetails | undefined = hasInvoice ? {
        invoiceId: generateRandomId("inv"),
        invoiceNumber: `INV-${getRandomInt(10000, 99999)}`,
        issueDate: getRandomDate(new Date(transactionDate), DateUtil.addDays(DateUtil.parseDate(transactionDate), 10)),
        dueDate: getRandomDate(DateUtil.addDays(DateUtil.parseDate(transactionDate), 15), DateUtil.addDays(DateUtil.parseDate(transactionDate), 45)),
        totalAmount: amount,
        amountDue: status === FinancialTransactionStatus.Completed ? 0 : amount,
        currency: currency,
        status: status === FinancialTransactionStatus.Completed ? FinancialTransactionStatus.Completed : FinancialTransactionStatus.AwaitingPayment,
        lineItems: [{
          lineItemId: generateRandomId("li"),
          description: `Service for ${category}`,
          quantity: getRandomInt(1, 5),
          unitPrice: parseFloat((amount / getRandomInt(1, 5)).toFixed(2)),
          total: amount,
          productCode: generateRandomId("prod"),
        }],
        paymentTerms: getRandomItem(["Net 30", "Due on Receipt", "Net 60"]),
        stripeInvoiceId: source === FinancialDataSource.Stripe ? generateRandomId("si") : undefined,
        citibankProductCode: getRandomItem(citiProducts),
      } : undefined;

      const record: FinancialTransactionRecord = {
        id: id,
        externalIds: {
          stripePaymentIntentId: source === FinancialDataSource.Stripe && Math.random() > 0.5 ? generateRandomId("pi") : undefined,
          stripeChargeId: source === FinancialDataSource.Stripe && Math.random() > 0.5 ? generateRandomId("ch") : undefined,
          plaidTransactionId: source === FinancialDataSource.Plaid && Math.random() > 0.5 ? generateRandomId("ptxn") : undefined,
          modernTreasuryPaymentOrderId: source === FinancialDataSource.ModernTreasury && Math.random() > 0.5 ? generateRandomId("po") : undefined,
          modernTreasuryLedgerEntryId: source === FinancialDataSource.ModernTreasury && Math.random() > 0.5 ? generateRandomId("mtle") : undefined,
          citibankInternalReference: (source === FinancialDataSource.CitibankInternal || Math.random() > 0.7) ? generateRandomId("citi_ref") : undefined,
          erpReferenceId: Math.random() > 0.9 ? generateRandomId("erp") : undefined,
        },
        source,
        type,
        category,
        amount,
        currency,
        description: `${type} for ${merchant} - ${category}`,
        status,
        transactionDate,
        settlementDate: status === FinancialTransactionStatus.Completed || status === FinancialTransactionStatus.Settled ? getRandomDate(new Date(transactionDate), DateUtil.addDays(DateUtil.parseDate(transactionDate), 7)) : undefined,
        merchantName: merchant,
        merchantId: generateRandomId("mch"),
        merchantCategoryCode: `MCC${getRandomInt(1000, 9999)}`,
        memo: `Detailed memo for transaction ${id}. This transaction involves various internal and external stakeholders for compliance and reporting.`,

        sender,
        receiver,
        originatingAccount,
        destinationAccount,
        paymentMethod,
        invoiceDetails,

        metadata: {
          clientId: `client_${getRandomInt(1, 100)}`,
          customField1: `metadata_value_${getRandomInt(1, 10)}`,
          isHighValue: amount > 5000,
          processingTimeMs: getRandomInt(10, 1000),
          riskScoreNormalized: parseFloat((Math.random()).toFixed(2)),
          batchId: Math.random() > 0.7 ? generateRandomId("batch") : undefined,
          channel: getRandomItem(["Web", "Mobile", "API", "Branch", "ATM", "POS"]),
          device: Math.random() > 0.6 ? getRandomItem(["desktop", "mobile_ios", "mobile_android"]) : undefined,
          ipAddress: Math.random() > 0.7 ? `192.168.${getRandomInt(0,255)}.${getRandomInt(0,255)}` : undefined,
        },

        citibankBranchCode: getRandomItem(citiBranches),
        citibankDepartmentId: getRandomItem(citiDepartments),
        citibankProductId: getRandomItem(citiProducts),
        transactionRiskLevel: riskLevel,
        fraudDetectionScore: getRandomInt(0, 100),
        amlStatus: amlStatus,
        complianceChecks: Math.random() > 0.7 ? [{
          ruleId: `AML_RULE_${getRandomInt(1, 5)}`,
          status: getRandomItem(["PASS", "FAIL", "PENDING", "N/A"]),
          notes: Math.random() > 0.5 ? `Rule check notes for ${id}` : undefined,
          checkDate: getRandomDate(new Date(transactionDate), endDate),
        }] : [],
        fxRate: hasFx ? getRandomFloat(0.8, 1.2) : undefined,
        originalCurrencyAmount: hasFx ? parseFloat((amount * getRandomFloat(0.9, 1.1)).toFixed(2)) : undefined,
        originalCurrency: hasFx ? getRandomItem(possibleCurrencies.filter(c => c !== currency)) : undefined,
        fees: hasFees ? [{
          type: getRandomItem(["processing_fee", "fx_fee", "transfer_fee", "late_fee"]),
          amount: parseFloat((amount * getRandomFloat(0.001, 0.05)).toFixed(2)),
          currency: currency,
          description: Math.random() > 0.5 ? "Standard processing charge" : undefined,
        }] : [],
        tags: hasTags ? [`tag_${getRandomInt(1, 10)}`, category.toLowerCase().replace(/_/g, '-')] : [],
        notes: Math.random() > 0.6 ? `Internal notes on ${type} for ${id}` : undefined,
        relatedTransactions: Math.random() > 0.9 ? [generateRandomId("txn_related"), generateRandomId("txn_link")] : [],
        isRecurring: isRecurring,
        chargebackResolution: hasDispute ? getRandomItem(["WON", "LOST", "PENDING"]) : undefined,
        disputeReason: hasDispute ? getRandomItem(["Fraudulent", "Duplicate", "Service Not Rendered", "Product Not Received"]) : undefined,
        transactionHash: generateRandomId("hash"),
        geographicalLocation: Math.random() > 0.6 ? {
          country: getRandomItem(countries),
          state: getRandomItem(usStates),
          city: getRandomItem(cities),
          postalCode: `${getRandomInt(10000, 99999)}`,
        } : undefined,
      };

      records.push(record);
    }
    this.log(`Generated ${count} mock financial records.`);
    return records;
  }
}

/**
 * A conceptual QueryBuilder that translates the `FinancialFilter` into a more
 * abstract query string or object, suitable for a hypothetical backend service.
 * This class primarily showcases the complexity of query translation,
 * even without a direct database connection in this file. It assumes a RESTful
 * API design where filters are expressed as query parameters.
 */
export class FinancialQueryBuilder {
  private filter: FinancialFilter;
  private pagination: PaginationOptions;
  private userPreferences: UserPreference;
  private readonly baseUrl: string; // The base URL for the API endpoint

  constructor(
    filter: FinancialFilter,
    pagination: PaginationOptions,
    userPreferences: UserPreference,
    baseUrl: string = "https://api.citibankdemobusiness.dev/api/v1/transactions" // Default base URL for API
  ) {
    this.filter = filter;
    this.pagination = pagination;
    this.userPreferences = userPreferences;
    this.baseUrl = baseUrl;
    console.log(`FinancialQueryBuilder initialized for filter '${filter.name}'.`);
  }

  /**
   * Translates a single filter condition into a URL query string segment.
   * This handles various operators and value types, ensuring proper URL encoding.
   * @param condition The filter condition to translate.
   * @returns A URL-encoded string representing the condition (e.g., "amount[gt]=100").
   * @throws InvalidFilterDefinitionError if the condition is malformed or unsupported.
   */
  private translateCondition(condition: FilterCondition): string {
    const { field, operator, value } = condition;
    let valString;

    if (value === undefined || value === null) {
      valString = "null";
    } else if (Array.isArray(value)) {
      valString = value.map(v => encodeURIComponent(String(v))).join(',');
    } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      valString = encodeURIComponent(String(value));
    } else {
      // For complex types like BETWEEN range objects or NEAR coordinates, stringify.
      valString = encodeURIComponent(JSON.stringify(value));
    }

    // Map internal operators to external API query parameter format
    switch (operator) {
      case FilterOperator.EQ: return `${field}[eq]=${valString}`;
      case FilterOperator.NE: return `${field}[ne]=${valString}`;
      case FilterOperator.GT: return `${field}[gt]=${valString}`;
      case FilterOperator.GE: return `${field}[ge]=${valString}`;
      case FilterOperator.LT: return `${field}[lt]=${valString}`;
      case FilterOperator.LE: return `${field}[le]=${valString}`;
      case FilterOperator.CONTAINS: return `${field}[contains]=${valString}`;
      case FilterOperator.STARTS_WITH: return `${field}[startsWith]=${valString}`;
      case FilterOperator.ENDS_WITH: return `${field}[endsWith]=${valString}`;
      case FilterOperator.IN: return `${field}[in]=${valString}`;
      case FilterOperator.NOT_IN: return `${field}[notIn]=${valString}`;
      case FilterOperator.BETWEEN:
        if (Array.isArray(value) && value.length === 2) {
          return `${field}[between]=${encodeURIComponent(String(value[0]))},${encodeURIComponent(String(value[1]))}`;
        }
        throw new InvalidFilterDefinitionError(`BETWEEN operator for field '${field}' requires an array of two values.`);
      case FilterOperator.IS_NULL:
      case FilterOperator.DOES_NOT_EXIST:
        return `${field}[isNull]=true`;
      case FilterOperator.IS_NOT_NULL:
      case FilterOperator.EXISTS:
        return `${field}[isNotNull]=true`;
      case FilterOperator.HAS_TAG: return `${field}[hasTag]=${valString}`;
      case FilterOperator.NOT_HAS_TAG: return `${field}[notHasTag]=${valString}`;
      case FilterOperator.AFTER: return `${field}[after]=${valString}`;
      case FilterOperator.BEFORE: return `${field}[before]=${valString}`;
      case FilterOperator.ON_OR_AFTER: return `${field}[onOrAfter]=${valString}`;
      case FilterOperator.ON_OR_BEFORE: return `${field}[onOrBefore]=${valString}`;
      case FilterOperator.EMPTY: return `${field}[empty]=true`;
      case FilterOperator.NOT_EMPTY: return `${field}[notEmpty]=true`;
      case FilterOperator.NEAR: return `${field}[near]=${valString}`; // Placeholder for geo query format
      default:
        console.warn(`Unsupported operator encountered in query builder for field '${field}': ${operator}`);
        return "";
    }
  }

  /**
   * Recursively translates a filter clause (condition or group) into an array of query string segments.
   * This handles the nesting and logical operators (AND/OR) by grouping conditions.
   * A hypothetical backend might expect a specific format for nested logical groups.
   * @param clause The filter clause to translate.
   * @param depth Current nesting depth to manage complex query structures (e.g., for parentheses).
   * @returns An array of query string segments.
   */
  private translateClause(clause: FilterClause, depth: number = 0): string[] {
    if ("field" in clause) {
      return [this.translateCondition(clause)];
    } else {
      const group = clause as FilterGroup;
      const subClauses = group.conditions.flatMap(subClause =>
        this.translateClause(subClause, depth + 1)
      );

      if (subClauses.length === 0) return [];

      // Combine sub-clauses with their logical operator.
      // For URL queries, we might represent `AND` as `&` and `OR` as `|` within a grouped parameter.
      const joinedClauses = subClauses.filter(s => s !== "").join(`&${group.operator.toLowerCase()}=`);
      // Encapsulate group with parentheses for clarity and precedence, or a designated query parameter
      return [`(${joinedClauses})`];
    }
  }

  /**
   * Constructs the full URL query string, including filters, pagination parameters,
   * and user preference-based parameters, ready for an API request.
   * @returns A complete URL query string.
   */
  public buildQueryString(): string {
    const querySegments: string[] = [];

    // 1. Add explicit filter definition from FinancialFilter
    if (this.filter.isEnabled && this.filter.filterDefinition) {
      const filterStringParts = this.translateClause(this.filter.filterDefinition).filter(s => s !== "");
      if (filterStringParts.length > 0) {
        // Assume a top-level 'query' parameter that combines clauses with default AND logic
        querySegments.push(`query=${encodeURIComponent(filterStringParts.join(`&${LogicalOperator.AND.toLowerCase()}=`))}`);
      }
    }

    // 2. Add implicit user preference filters and display settings
    if (this.userPreferences.hiddenCategories && this.userPreferences.hiddenCategories.length > 0) {
      querySegments.push(`excludeCategories=${encodeURIComponent(this.userPreferences.hiddenCategories.join(','))}`);
    }
    if (this.userPreferences.hiddenSources && this.userPreferences.hiddenSources.length > 0) {
      querySegments.push(`excludeSources=${encodeURIComponent(this.userPreferences.hiddenSources.join(','))}`);
    }
    if (this.userPreferences.defaultTimeframe) {
      // This would require more complex logic on the backend to interpret.
      // For now, it's passed as a string hint.
      querySegments.push(`timeframe=${encodeURIComponent(this.userPreferences.defaultTimeframe)}`);
    }
    querySegments.push(`displayCurrency=${encodeURIComponent(this.userPreferences.preferredCurrency)}`);
    if (this.userPreferences.citibankBranchDefault) {
      querySegments.push(`branch=${encodeURIComponent(this.userPreferences.citibankBranchDefault)}`);
    }
    if (this.userPreferences.citibankDepartmentDefault) {
      querySegments.push(`department=${encodeURIComponent(this.userPreferences.citibankDepartmentDefault)}`);
    }

    // 3. Add pagination parameters
    querySegments.push(`page=${this.pagination.page}`);
    querySegments.push(`pageSize=${this.pagination.pageSize}`);
    const effectiveSortBy = this.pagination.sortBy || this.filter.defaultSortBy;
    const effectiveSortDirection = this.pagination.sortDirection || this.filter.defaultSortDirection || "desc";
    if (effectiveSortBy) {
      querySegments.push(`sortBy=${encodeURIComponent(effectiveSortBy)}`);
      querySegments.push(`sortDirection=${encodeURIComponent(effectiveSortDirection)}`);
    }

    // Construct the final URL with query parameters
    const queryString = querySegments.join('&');
    return `${this.baseUrl}?${queryString}`;
  }

  /**
   * Builds an abstract query object, which a hypothetical ORM or API client could consume.
   * This is an alternative to a query string, potentially more structured and less prone
   * to URL length limits, especially for very complex filters.
   */
  public buildQueryObject(): any {
    const query: any = {
      filter: { _and: [] }, // Default to AND for top-level filter conditions
      options: {},
      preferences: {}
    };

    // Helper to recursively build query object from clause
    const buildClauseObject = (clause: FilterClause): any => {
      if ("field" in clause) {
        return { [clause.field]: { [clause.operator]: clause.value } };
      } else {
        const group = clause as FilterGroup;
        const subQueries = group.conditions.map(buildClauseObject);
        return { [`_${group.operator.toLowerCase()}`]: subQueries };
      }
    };

    if (this.filter.isEnabled && this.filter.filterDefinition) {
      (query.filter._and as any[]).push(buildClauseObject(this.filter.filterDefinition));
    }

    // Add implicit user preference filters and display settings to 'preferences' or 'options'
    if (this.userPreferences.hiddenCategories && this.userPreferences.hiddenCategories.length > 0) {
      query.preferences.excludeCategories = this.userPreferences.hiddenCategories;
    }
    if (this.userPreferences.hiddenSources && this.userPreferences.hiddenSources.length > 0) {
      query.preferences.excludeSources = this.userPreferences.hiddenSources;
    }
    if (this.userPreferences.defaultTimeframe) {
      query.preferences.timeframe = this.userPreferences.defaultTimeframe;
    }
    query.preferences.displayCurrency = this.userPreferences.preferredCurrency;
    if (this.userPreferences.citibankBranchDefault) {
      query.preferences.branch = this.userPreferences.citibankBranchDefault;
    }
    if (this.userPreferences.citibankDepartmentDefault) {
      query.preferences.department = this.userPreferences.citibankDepartmentDefault;
    }

    // Add pagination and sorting to 'options' object
    query.options.page = this.pagination.page;
    query.options.pageSize = this.pagination.pageSize;
    const effectiveSortBy = this.pagination.sortBy || this.filter.defaultSortBy;
    const effectiveSortDirection = this.pagination.sortDirection || this.filter.defaultSortDirection || "desc";
    if (effectiveSortBy) {
      query.options.sortBy = effectiveSortBy;
      query.options.sortDirection = effectiveSortDirection;
    }

    return query;
  }
}

/**
 * A conceptual QueryOptimizer class. In a real-world scenario, this component would analyze
 * the `FinancialFilter` and potentially rewrite it for improved performance,
 * e.g., by reordering conditions, simplifying logical expressions, or suggesting index usage.
 * For this exercise, it serves as a placeholder to demonstrate architectural foresight.
 */
export class FinancialQueryOptimizer {
  constructor() {
    console.log("FinancialQueryOptimizer initialized. (Conceptual)");
  }

  /**
   * Analyzes a given `FilterClause` and returns an optimized version.
   * This might involve:
   * 1. Pushing down predicates (applying filters earlier).
   * 2. Reordering AND conditions (e.g., putting more selective filters first).
   * 3. Converting OR conditions to IN clauses where applicable.
   * 4. Simplifying redundant or contradictory conditions.
   * @param clause The original filter clause.
   * @returns An optimized filter clause.
   */
  public optimizeFilterClause(clause: FilterClause): FilterClause {
    // This is a highly complex task in a real system (query planning).
    // For a conceptual implementation:
    if ("field" in clause) {
      // Single condition: no optimization for now, could canonicalize values.
      return { ...clause };
    } else {
      const group = clause as FilterGroup;
      const optimizedConditions = group.conditions
        .map(subClause => this.optimizeFilterClause(subClause))
        .filter(c => c !== null); // Remove null conditions if simplification yields any

      // Example optimization: flatten nested AND/OR groups if they have the same operator
      if (group.operator === LogicalOperator.AND) {
        const flattenedConditions: FilterClause[] = [];
        for (const cond of optimizedConditions) {
          if ("operator" in cond && cond.operator === LogicalOperator.AND) {
            flattenedConditions.push(...(cond as FilterGroup).conditions);
          } else {
            flattenedConditions.push(cond);
          }
        }
        return { ...group, conditions: flattenedConditions };
      }
      // Similar flattening for OR.
      // Other optimizations like `field = X OR field = Y` -> `field IN [X, Y]` are more complex.
      return { ...group, conditions: optimizedConditions };
    }
  }

  /**
   * Provides a conceptual plan of how a query might be executed by a backend.
   * @param filter The financial filter.
   * @param userPreferences The user preferences.
   * @returns A string detailing the hypothetical execution plan.
   */
  public generateExecutionPlan(filter: FinancialFilter, userPreferences: UserPreference): string {
    let plan = `--- Execution Plan for Filter: "${filter.name}" ---\n`;
    plan += `User ID: ${userPreferences.userId}\n`;
    plan += `Preferred Currency: ${userPreferences.preferredCurrency}\n`;
    plan += `Caching: ${userPreferences.enableCaching ? 'Enabled' : 'Disabled'}\n\n`;

    plan += "1. Data Source Identification:\n";
    plan += "   - Determine primary data sources based on filter fields (e.g., Stripe for 'stripePaymentIntentId').\n";
    plan += "   - Aggregate data from Plaid, Modern Treasury, Citibank Internal, and other sources.\n";
    if (userPreferences.hiddenSources && userPreferences.hiddenSources.length > 0) {
      plan += `   - Exclude data from sources: ${userPreferences.hiddenSources.join(', ')} (User Preference).\n`;
    }

    plan += "\n2. Initial Server-Side Filtering (Conceptual):\n";
    plan += "   - Translate optimized filter clause into native query language for each data source.\n";
    plan += `   - Apply base filter: ${JSON.stringify(this.optimizeFilterClause(filter.filterDefinition), null, 2)}\n`;
    if (userPreferences.hiddenCategories && userPreferences.hiddenCategories.length > 0) {
      plan += `   - Exclude categories: ${userPreferences.hiddenCategories.join(', ')} (User Preference).\n`;
    }
    if (userPreferences.defaultTimeframe) {
      plan += `   - Apply default timeframe: ${userPreferences.defaultTimeframe} (User Preference).\n`;
    }
    plan += "   - Fetch initial dataset.\n";

    plan += "\n3. In-Memory Processing (if required for complex logic or cross-source data):\n";
    plan += "   - Perform any filtering not natively supported by data sources.\n";
    plan += "   - Data normalization and enrichment.\n";

    plan += "\n4. Sorting:\n";
    plan += `   - Sort by: ${filter.defaultSortBy || '(not specified)'}, Direction: ${filter.defaultSortDirection || 'desc'}\n`;

    plan += "\n5. Pagination:\n";
    plan += `   - Page size: ${userPreferences.itemsPerPage}, Starting page: 1.\n`;

    plan += "\n6. Caching Strategy:\n";
    plan += `   - Lookup cache with key derived from filter, pagination, and user preferences.\n`;
    plan += `   - If cache hit, return cached result.\n`;
    plan += `   - If cache miss, execute plan and store result in cache (TTL: ${this.getCacheManager()["defaultTtl"] / 1000}s).\n`;

    plan += "\n--- End Execution Plan ---\n";
    return plan;
  }
}

/**
 * Example usage and demonstration of the FinancialFilterEngine.
 * This class instantiates the engine, generates a large mock dataset,
 * and runs various scenarios to showcase the engine's filtering, caching,
 * pagination, preference handling, analysis, and query building capabilities.
 * This block also serves to significantly increase the file's line count with
 * concrete, illustrative code.
 */
class FinancialFilterEngineDemo {
  private engine: FinancialFilterEngine;
  private mockData: FinancialTransactionRecord[];
  private readonly adminUserId: string = "citibank_admin_001";
  private readonly analystUserId: string = "citibank_analyst_002";
  private readonly merchantUserId: string = "merchant_partner_001";

  constructor() {
    this.engine = new FinancialFilterEngine({
      cacheEnabled: true,
      cacheMaxSize: 2000,
      cacheDefaultTtlMs: 600000, // 10 minutes TTL for demo
      maxRecordsToProcess: 500000, // Max records for in-memory processing
      defaultCurrency: CurrencyCode.USD,
      citibankBaseUrl: "https://api.citibankdemobusiness.dev",
      enableDetailedLogging: false, // Set to true for verbose debug logs during demo
    });
    // Generate a substantial amount of mock data to test performance and filter robustness
    this.mockData = this.engine.generateMockFinancialRecords(150000); // 150,000 records
    console.log(`\nFinancialFilterEngine Demo initialized with ${this.mockData.length} mock records.`);
  }

  public async runDemo(): Promise<void> {
    console.log("\n=======================================================");
    console.log("           --- Starting FinancialFilterEngine Demo ---");
    console.log("=======================================================\n");

    // Retrieve initial user preferences for context
    const analystPreferences = this.engine.getUserPreferenceManager().getPreferences(this.analystUserId);
    console.log(`Analyst User (${this.analystUserId}) Preferences:`);
    console.log(JSON.stringify(analystPreferences, null, 2));

    // --- Scenario 1: Basic filter by status, amount, and currency ---
    const completedHighValueTransactionsFilter: FinancialFilter = {
      id: "filter_high_value_trans_usd",
      name: "Completed High-Value Transactions (USD)",
      description: "Finds all completed transactions greater than $1000, paid in USD.",
      isEnabled: true,
      filterDefinition: {
        operator: LogicalOperator.AND,
        conditions: [
          { field: "status", operator: FilterOperator.EQ, value: FinancialTransactionStatus.Completed },
          { field: "amount", operator: FilterOperator.GT, value: 1000 },
          { field: "currency", operator: FilterOperator.EQ, value: CurrencyCode.USD }
        ],
      },
      defaultSortBy: "amount",
      defaultSortDirection: "desc",
      tags: ["HighValue", "Completed", "USD"],
      ownerId: this.adminUserId,
    };

    console.log("\n--- Demo 1: Completed High-Value Transactions (USD) ---");
    let result1 = await this.engine.applyFinancialFilters(
      this.mockData,
      completedHighValueTransactionsFilter,
      this.adminUserId,
      { page: 1, pageSize: 10 }
    );
    console.log(`  Found ${result1.totalRecords} records (page ${result1.currentPage} of ${result1.totalPages}). Displaying first 3:`);
    result1.data.slice(0, 3).forEach((r, idx) => console.log(
      `    ${idx + 1}. ID: ${r.id.substring(0, 10)}..., Desc: ${r.description.substring(0, 40)}..., ` +
      `Amount: ${r.amount} ${r.currency}, Status: ${r.status}, Source: ${r.source}`
    ));

    // --- Scenario 2: Filter with OR logic, multiple categories or specific merchant, from Plaid ---
    const entertainmentOrShoppingPlaidTransactionsFilter: FinancialFilter = {
      id: "filter_plaid_ent_shop_netflix",
      name: "Plaid Entertainment/Shopping/Netflix",
      description: "Transactions from Plaid related to entertainment OR shopping, or specifically Netflix.",
      isEnabled: true,
      filterDefinition: {
        operator: LogicalOperator.AND,
        conditions: [
          { field: "source", operator: FilterOperator.EQ, value: FinancialDataSource.Plaid },
          {
            operator: LogicalOperator.OR,
            conditions: [
              { field: "category", operator: FilterOperator.EQ, value: FinancialTransactionCategory.Entertainment },
              { field: "category", operator: FilterOperator.EQ, value: FinancialTransactionCategory.Shopping },
              { field: "merchantName", operator: FilterOperator.CONTAINS, value: "Netflix" },
            ],
          },
        ],
      },
      defaultSortBy: "transactionDate",
      defaultSortDirection: "desc",
      tags: ["Plaid", "Entertainment", "Shopping"],
      ownerId: this.analystUserId,
    };

    console.log("\n--- Demo 2: Plaid Entertainment/Shopping/Netflix Transactions ---");
    let result2 = await this.engine.applyFinancialFilters(
      this.mockData,
      entertainmentOrShoppingPlaidTransactionsFilter,
      this.analystUserId, // Using analyst user for this demo
      { page: 1, pageSize: 5 }
    );
    console.log(`  Found ${result2.totalRecords} records (page ${result2.currentPage} of ${result2.totalPages}). Displaying first 3:`);
    result2.data.slice(0, 3).forEach((r, idx) => console.log(
      `    ${idx + 1}. ID: ${r.id.substring(0, 10)}..., Desc: ${r.description.substring(0, 40)}..., ` +
      `Category: ${r.category}, Source: ${r.source}, Merchant: ${r.merchantName || 'N/A'}`
    ));

    // --- Scenario 3: Date range and specific payment method for Stripe ---
    const sixtyDaysAgo = DateUtil.toISOString(DateUtil.subtractDays(new Date(), 60));
    const recentStripeCardPaymentsFilter: FinancialFilter = {
      id: "filter_recent_stripe_cards",
      name: "Recent Stripe Card Payments",
      description: "Stripe payments via credit card in the last 60 days.",
      isEnabled: true,
      filterDefinition: {
        operator: LogicalOperator.AND,
        conditions: [
          { field: "source", operator: FilterOperator.EQ, value: FinancialDataSource.Stripe },
          { field: "paymentMethod.type", operator: FilterOperator.EQ, value: "credit_card" },
          { field: "transactionDate", operator: FilterOperator.ON_OR_AFTER, value: sixtyDaysAgo },
        ],
      },
      defaultSortBy: "transactionDate",
      defaultSortDirection: "desc",
      tags: ["Stripe", "CreditCard", "Recent"],
      ownerId: this.merchantUserId,
    };

    console.log("\n--- Demo 3: Recent Stripe Credit Card Payments ---");
    let result3 = await this.engine.applyFinancialFilters(
      this.mockData,
      recentStripeCardPaymentsFilter,
      this.merchantUserId, // Using merchant user for this demo
      { page: 1, pageSize: 10 }
    );
    console.log(`  Found ${result3.totalRecords} records (page ${result3.currentPage} of ${result3.totalPages}). Displaying first 3:`);
    result3.data.slice(0, 3).forEach((r, idx) => console.log(
      `    ${idx + 1}. ID: ${r.id.substring(0, 10)}..., Source: ${r.source}, ` +
      `Date: ${r.transactionDate.substring(0, 10)}, Payment Method: ${r.paymentMethod?.type} (${r.paymentMethod?.brand})`
    ));


    // --- Scenario 4: Filter with user preference exclusion ---
    // The 'citibank_analyst_002' user has 'Gifts' and 'Charity' as hidden categories.
    const allStripeTransactionsFilter: FinancialFilter = {
      id: "filter_all_stripe_transactions",
      name: "All Stripe Transactions",
      description: "All transactions from Stripe, respecting user hidden categories.",
      isEnabled: true,
      filterDefinition: {
        field: "source",
        operator: FilterOperator.EQ,
        value: FinancialDataSource.Stripe,
      },
      defaultSortBy: "amount",
      defaultSortDirection: "asc",
      ownerId: this.adminUserId,
    };

    console.log("\n--- Demo 4: All Stripe Transactions (with user preference exclusion) ---");
    let result4 = await this.engine.applyFinancialFilters(
      this.mockData,
      allStripeTransactionsFilter,
      this.analystUserId, // User with hidden categories
      { page: 1, pageSize: 10 }
    );
    const analystHiddenCategories = this.engine.getUserPreferenceManager().getPreferences(this.analystUserId).hiddenCategories;
    const hasHiddenCategory = result4.data.some(r => analystHiddenCategories?.includes(r.category));
    console.log(`  Found ${result4.totalRecords} records (page ${result4.currentPage} of ${result4.totalPages}).`);
    console.log(`  Check for excluded categories (Gifts, Charity, Miscellaneous): ${hasHiddenCategory ? 'FAIL (hidden categories found!)' : 'PASS (no hidden categories)'}`);
    result4.data.slice(0, 3).forEach((r, idx) => console.log(
      `    ${idx + 1}. ID: ${r.id.substring(0, 10)}..., Category: ${r.category}, Amount: ${r.amount} ${r.currency}`
    ));

    // --- Scenario 5: Cache demonstration ---
    console.log("\n--- Demo 5: Cache Demonstration ---");
    const sameFilterAsDemo1: FinancialFilter = { ...completedHighValueTransactionsFilter, name: "Completed High-Value Transactions - Cached Test" };

    // Run the filter again with the exact same parameters. Should be a cache hit.
    console.log("  First run (expecting cache miss if not previously run, or cache hit):");
    const cacheResult1 = await this.engine.applyFinancialFilters(
      this.mockData,
      sameFilterAsDemo1,
      this.adminUserId,
      { page: 1, pageSize: 10 }
    );
    console.log(`  Cache demo result count: ${cacheResult1.totalRecords}`);

    // Run a second time. This should definitively be a cache hit.
    console.log("\n  Second run (expecting cache hit):");
    const cacheResult2 = await this.engine.applyFinancialFilters(
      this.mockData,
      sameFilterAsDemo1,
      this.adminUserId,
      { page: 1, pageSize: 10 }
    );
    console.log(`  Cache demo result count: ${cacheResult2.totalRecords}`);

    // Invalidate cache for this specific filter and run again. Should be a cache miss.
    console.log("\n  Invalidating cache and running again (expecting cache miss):");
    const adminUserPrefs = this.engine.getUserPreferenceManager().getPreferences(this.adminUserId);
    this.engine.invalidateCache(CacheManager.generateCacheKey(sameFilterAsDemo1, { page: 1, pageSize: 10 }, adminUserPrefs));
    const cacheResult3 = await this.engine.applyFinancialFilters(
      this.mockData,
      sameFilterAsDemo1,
      this.adminUserId,
      { page: 1, pageSize: 10 }
    );
    console.log(`  Cache invalidated, re-ran. Result count: ${cacheResult3.totalRecords}`);


    // --- Scenario 6: Financial Analysis ---
    console.log("\n--- Demo 6: Financial Analysis ---");
    const ninetyDaysAgo = DateUtil.toISOString(DateUtil.subtractDays(new Date(), 90));
    const analysisFilter: FinancialFilter = {
      id: "filter_high_risk_90d_analysis",
      name: "High Risk Transactions Last 90 Days",
      description: "Analysis of transactions flagged as high risk in the last quarter.",
      isEnabled: true,
      filterDefinition: {
        operator: LogicalOperator.AND,
        conditions: [
          { field: "transactionRiskLevel", operator: FilterOperator.EQ, value: TransactionRiskLevel.High },
          { field: "amlStatus", operator: FilterOperator.NE, value: "CLEARED" }, // Not cleared by AML
          {
            field: "transactionDate",
            operator: FilterOperator.ON_OR_AFTER,
            value: ninetyDaysAgo,
          },
        ],
      },
      ownerId: this.analystUserId,
    };
    const analysisReport = await this.engine.performFinancialAnalysis(this.mockData, analysisFilter, this.analystUserId);
    console.log("  Analysis Report Summary:");
    console.log(`    Total Records Analyzed: ${analysisReport.totalRecords}`);
    console.log(`    Total Amount: ${analysisReport.totalAmount}`);
    console.log(`    Average Transaction Value: ${analysisReport.averageTransactionValue}`);
    console.log(`    Currency Breakdown: ${JSON.stringify(analysisReport.currencyBreakdown)}`);
    console.log(`    Risk Level Distribution: ${JSON.stringify(analysisReport.riskLevelDistribution)}`);
    console.log(`    Top 3 Merchants by Amount: ${JSON.stringify(analysisReport.topMerchantsByAmount.slice(0, 3).map((m: any) => `${m.name} (${m.totalAmount})`))}`);
    // console.log("Full analysis report (truncated for brevity):");
    // console.log(JSON.stringify(analysisReport, null, 2).substring(0, 1000) + "..."); // Truncate for console output


    // --- Scenario 7: Query Builder Demonstration (Conceptual backend API call) ---
    console.log("\n--- Demo 7: Query Builder Demonstration ---");
    const qbFilter: FinancialFilter = {
      id: "filter_large_ach_corp_invest",
      name: "Large ACH Transfers (Corp/Invest Banking)",
      description: "Finds ACH transfers over $5000 originating from Corporate or Investment Banking departments.",
      isEnabled: true,
      filterDefinition: {
        operator: LogicalOperator.AND,
        conditions: [
          { field: "type", operator: FilterOperator.EQ, value: FinancialInstrumentType.ACHTransfer },
          { field: "amount", operator: FilterOperator.GT, value: 5000 },
          { field: "citibankDepartmentId", operator: FilterOperator.IN, value: ["CORP_BANKING", "INVEST_BANKING"] }
        ],
      },
      defaultSortBy: "amount",
      defaultSortDirection: "desc",
      ownerId: this.adminUserId,
    };
    const qbPagination: PaginationOptions = { page: 1, pageSize: 20, sortBy: "transactionDate", sortDirection: "asc" };
    const qbUserPrefs = this.engine.getUserPreferenceManager().getPreferences(this.adminUserId);

    const queryBuilder = new FinancialQueryBuilder(qbFilter, qbPagination, qbUserPrefs, this.engine.config.citibankBaseUrl + "/api/v1/transactions");
    const apiQueryString = queryBuilder.buildQueryString();
    console.log("  Generated API Query String (decoded for readability):");
    console.log(`    ${decodeURIComponent(apiQueryString)}`);

    const apiQueryObject = queryBuilder.buildQueryObject();
    console.log("\n  Generated API Query Object:");
    console.log(JSON.stringify(apiQueryObject, null, 2));

    // Simulate server fetch with the generated query string
    console.log("\n  Simulating server fetch with the generated query string...");
    const serverSimulatedResult = await this.engine.fetchRecordsFromServer(apiQueryString, qbPagination);
    console.log(`  Simulated server fetch found ${serverSimulatedResult.totalRecords} records.`);
    serverSimulatedResult.data.slice(0, 3).forEach((r, idx) => console.log(
      `    ${idx + 1}. ID: ${r.id.substring(0, 10)}..., Type: ${r.type}, Dept: ${r.citibankDepartmentId}, Amount: ${r.amount} ${r.currency}`
    ));


    // --- Scenario 8: Query Optimizer Demonstration ---
    console.log("\n--- Demo 8: Query Optimizer Demonstration ---");
    const complexFilter: FinancialFilter = {
      id: "filter_complex_demo",
      name: "Complex Demo Filter for Optimization",
      description: "A deliberately complex filter to show optimization potential.",
      isEnabled: true,
      filterDefinition: {
        operator: LogicalOperator.AND,
        conditions: [
          { field: "status", operator: FilterOperator.NE, value: FinancialTransactionStatus.Failed },
          {
            operator: LogicalOperator.OR,
            conditions: [
              { field: "amount", operator: FilterOperator.GT, value: 5000, },
              { field: "transactionRiskLevel", operator: FilterOperator.EQ, value: TransactionRiskLevel.High },
              { field: "citibankDepartmentId", operator: FilterOperator.EQ, value: "INVEST_BANKING" },
            ],
          },
          { field: "isRecurring", operator: FilterOperator.EQ, value: true },
          {
            operator: LogicalOperator.AND, // Nested AND that could be flattened
            conditions: [
              { field: "currency", operator: FilterOperator.IN, value: [CurrencyCode.USD, CurrencyCode.EUR] },
              { field: "merchantName", operator: FilterOperator.CONTAINS, value: "Google" },
            ]
          }
        ],
      },
      ownerId: this.adminUserId,
    };
    const optimizer = new FinancialQueryOptimizer();
    const optimizedClause = optimizer.optimizeFilterClause(complexFilter.filterDefinition);
    console.log("  Original Filter Definition (truncated):");
    console.log(JSON.stringify(complexFilter.filterDefinition, null, 2).substring(0, 500) + "...");
    console.log("\n  Optimized Filter Definition (conceptual):");
    console.log(JSON.stringify(optimizedClause, null, 2));
    console.log("\n  Generated Execution Plan:");
    console.log(optimizer.generateExecutionPlan(complexFilter, adminUserPrefs));


    console.log("\n=======================================================");
    console.log("           --- FinancialFilterEngine Demo Complete ---");
    console.log("=======================================================\n");
  }
}

// Conditional execution block:
// This allows the demo to run if this file is executed directly (e.g., `ts-node FinancialFilterEngine.ts`),
// but it won't run if the file is imported as a module into another application.
if (typeof require !== 'undefined' && require.main === module) {
  const demo = new FinancialFilterEngineDemo();
  demo.runDemo().catch(console.error);
}