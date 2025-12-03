// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

// This file defines the FinancialDataOrchestrator, coordinating end-to-end
// financial data lifecycle from fetching and aggregation to sophisticated filtering
// and insight generation. It interacts with abstract backend routes exposed by
// citibankdemobusiness.dev to integrate data from Stripe, Plaid, and Modern Treasury.

/**
 * =============================================================================
 *  SECTION 1: Core Enumerations and Basic Types
 * =============================================================================
 */

/**
 * Represents the various financial institutions or data sources integrated.
 */
enum FinancialSource {
  Stripe = "Stripe",
  Plaid = "Plaid",
  ModernTreasury = "ModernTreasury",
  CitibankInternal = "CitibankInternal",
  Other = "Other",
}

/**
 * Common currency codes used across financial transactions.
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
  SEK = "SEK",
  NZD = "NZD",
  MXN = "MXN",
  SGD = "SGD",
  HKD = "HKD",
  NOK = "NOK",
  KRW = "KRW",
  TRY = "TRY",
  INR = "INR",
  BRL = "BRL",
  ZAR = "ZAR",
}

/**
 * Common transaction statuses.
 */
enum TransactionStatus {
  Pending = "Pending",
  Completed = "Completed",
  Failed = "Failed",
  Canceled = "Canceled",
  Refunded = "Refunded",
  Disputed = "Disputed",
  Voided = "Voided",
  Processing = "Processing",
  Settled = "Settled",
  Booked = "Booked",
}

/**
 * Common transaction types.
 */
enum TransactionType {
  Payment = "Payment",
  Refund = "Refund",
  Transfer = "Transfer",
  Withdrawal = "Withdrawal",
  Deposit = "Deposit",
  Chargeback = "Chargeback",
  Fee = "Fee",
  Adjustment = "Adjustment",
  Invoice = "Invoice",
  Payout = "Payout",
  Debit = "Debit",
  Credit = "Credit",
}

/**
 * Represents a generic date range.
 */
interface DateRange {
  startDate?: string; // ISO 8601 string (YYYY-MM-DD)
  endDate?: string; // ISO 8601 string (YYYY-MM-DD)
}

/**
 * Pagination parameters for data fetching.
 */
interface PaginationParams {
  limit?: number;
  offset?: number;
  afterCursor?: string;
  beforeCursor?: string;
}

/**
 * Generic metadata type.
 */
type Metadata = {
  [key: string]: string | number | boolean | null | undefined;
};

/**
 * =============================================================================
 *  SECTION 2: Source-Specific Data Models (Abstracted)
 * =============================================================================
 */

// --- Stripe Models ---
interface StripeCharge {
  id: string;
  amount: number; // in cents
  amount_captured: number; // in cents
  amount_refunded: number; // in cents
  currency: Currency;
  created: number; // Unix timestamp
  status: "succeeded" | "pending" | "failed";
  description: string | null;
  customer: string | null; // Customer ID
  payment_intent: string | null;
  refunds: StripeRefund[];
  dispute: StripeDispute | null;
  metadata: Metadata;
  receipt_url: string | null;
  card_brand?: string;
  card_last4?: string;
  statement_descriptor?: string;
}

interface StripeRefund {
  id: string;
  amount: number; // in cents
  currency: Currency;
  created: number; // Unix timestamp
  status: "succeeded" | "pending" | "failed" | "canceled";
  reason: string | null;
  charge: string; // Charge ID
  metadata: Metadata;
}

interface StripeDispute {
  id: string;
  amount: number; // in cents
  currency: Currency;
  created: number; // Unix timestamp
  status: "won" | "lost" | "needs_response" | "under_review";
  reason: string;
  charge: string; // Charge ID
  metadata: Metadata;
}

interface StripeBalanceTransaction {
  id: string;
  amount: number; // Amount in cents
  currency: Currency;
  created: number; // Unix timestamp
  description: string | null;
  fee: number; // in cents
  net: number; // in cents
  type: string; // e.g., 'charge', 'payment_refund', 'payout'
  reporting_category: string;
  status: "pending" | "available";
}

interface StripePayout {
  id: string;
  amount: number; // in cents
  currency: Currency;
  arrival_date: number; // Unix timestamp
  created: number; // Unix timestamp
  description: string | null;
  status: "paid" | "pending" | "in_transit" | "canceled" | "failed";
  type: "bank_account" | "card";
}

// --- Plaid Models ---
enum PlaidAccountType {
  Depository = "depository",
  Credit = "credit",
  Loan = "loan",
  Investment = "investment",
  Other = "other",
}

enum PlaidTransactionType {
  DigitalPayment = "digital payment",
  BillPayment = "bill payment",
  RecurringPayment = "recurring payment",
  Cash = "cash",
  Check = "check",
  Fee = "fee",
  Transfer = "transfer",
  Interest = "interest",
  Payroll = "payroll",
  Other = "other",
}

interface PlaidAccount {
  account_id: string;
  balances: {
    available: number | null; // in major units
    current: number | null; // in major units
    iso_currency_code: Currency | null;
    unofficial_currency_code: string | null;
  };
  mask: string | null; // Last 4 digits of account number
  name: string;
  official_name: string | null;
  subtype: string | null; // e.g., 'checking', 'savings'
  type: PlaidAccountType;
  persistent_account_id: string | null;
}

interface PlaidTransaction {
  transaction_id: string;
  account_id: string;
  amount: number; // Positive for inflow, negative for outflow (in major units)
  iso_currency_code: Currency | null;
  unofficial_currency_code: string | null;
  date: string; // YYYY-MM-DD
  authorized_date: string | null; // YYYY-MM-DD
  name: string;
  merchant_name: string | null;
  pending: boolean;
  category: string[] | null;
  category_id: string | null;
  check_number: string | null;
  original_description: string | null;
  payment_channel: string; // e.g., 'online', 'in store', 'other'
  transaction_type: PlaidTransactionType;
  personal_finance_category?: {
    primary: string;
    detailed: string;
  };
}

interface PlaidBalance {
  account_id: string;
  available: number | null; // in major units
  current: number; // in major units
  limit: number | null; // in major units
  iso_currency_code: Currency | null;
  last_updated_datetime: string; // ISO 8601
}

// --- Modern Treasury Models ---
enum ModernTreasuryTransactionType {
  Incoming = "incoming",
  Outgoing = "outgoing",
}

enum ModernTreasuryTransactionStatus {
  Pending = "pending",
  Posted = "posted",
  Void = "void",
  Returned = "returned",
}

interface ModernTreasuryAccount {
  id: string;
  name: string;
  account_number: string;
  currency: Currency;
  account_type: "checking" | "savings" | "loan" | "credit";
  created_at: string; // ISO 8601
  bank_name: string;
  iban?: string;
  routing_number?: string;
}

interface ModernTreasuryTransaction {
  id: string;
  amount: number; // in cents
  currency: Currency;
  type: ModernTreasuryTransactionType;
  status: ModernTreasuryTransactionStatus;
  description: string;
  vendor_buyer_id: string | null;
  posted_at: string; // ISO 8601
  expected_at: string; // ISO 8601
  internal_account_id: string;
  live_mode: boolean;
  metadata: Metadata;
  source: string; // e.g., 'ACH', 'Wire'
  direction: "credit" | "debit";
  effective_date: string; // ISO 8601
}

interface ModernTreasuryPaymentOrder {
  id: string;
  amount: number; // in cents
  currency: Currency;
  direction: "credit" | "debit";
  status: "pending" | "approved" | "completed" | "returned" | "canceled";
  type: "ach" | "wire" | "book" | "sepa" | "rtp";
  originating_account_id: string;
  receiving_account_id: string; // External account ID or internal
  description: string;
  metadata: Metadata;
  created_at: string; // ISO 8601
  processed_at: string | null; // ISO 8601
  reference_number: string | null;
}

// --- Citibank Internal Models ---
interface CitibankInternalCustomer {
  customerId: string;
  name: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  phone: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

interface CitibankInternalAccount {
  accountId: string;
  customerId: string;
  accountNumber: string;
  accountName: string;
  currency: Currency;
  balance: number; // Current balance (in major units)
  availableBalance: number; // (in major units)
  type: "checking" | "savings" | "loan" | "investment" | "credit_card";
  status: "active" | "inactive" | "closed" | "suspended";
  openedAt: string; // ISO 8601
}

interface CitibankInternalTransaction {
  transactionId: string;
  accountId: string;
  customerId: string;
  amount: number; // in major units
  currency: Currency;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  transactionDate: string; // ISO 8601
  postedDate: string; // ISO 8601
  referenceId: string | null; // e.g., external Stripe/Plaid/MT ID
  metadata: Metadata;
}

/**
 * =============================================================================
 *  SECTION 3: Unified Financial Data Models (Canonical Representation)
 * =============================================================================
 */

/**
 * Represents a unified financial account.
 */
interface UnifiedAccount {
  id: string; // Unique ID, can be derived if needed
  sourceId: string; // Original ID from the source system
  source: FinancialSource;
  accountName: string;
  accountNumberMasked?: string; // Masked number for display
  currency: Currency;
  currentBalance: number; // in major units
  availableBalance?: number; // in major units
  type: PlaidAccountType | "credit_card" | "loan" | "investment" | "internal_checking" | "internal_savings";
  status: "active" | "inactive" | "closed" | "suspended" | "pending";
  metadata: Metadata;
  lastUpdated: string; // ISO 8601
}

/**
 * Represents a unified financial transaction.
 */
interface UnifiedTransaction {
  id: string; // Unique ID, derived
  sourceId: string; // Original ID from the source system
  source: FinancialSource;
  accountId: string; // Unified account ID
  customerId?: string; // Unified customer ID, if applicable
  amount: number; // Always absolute value (in major units)
  currency: Currency;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  transactionDate: string; // ISO 8601
  postedDate: string; // ISO 8601
  direction: "credit" | "debit"; // Inflow/Outflow relative to the account
  merchantName?: string;
  category?: string[];
  referenceId?: string | null; // Cross-reference ID (e.g., payment order ID)
  metadata: Metadata;
}

/**
 * Represents a unified payment.
 */
interface UnifiedPayment {
  id: string;
  sourceId: string;
  source: FinancialSource;
  amount: number; // in major units
  currency: Currency;
  status: TransactionStatus; // e.g., Completed, Pending, Failed, Refunded
  type: "payment_in" | "payment_out" | "refund_in" | "refund_out";
  createdAt: string; // ISO 8601
  processedAt?: string; // ISO 8601
  description?: string;
  customerId?: string;
  payerName?: string;
  payeeName?: string;
  reference?: string;
  metadata: Metadata;
}

/**
 * Represents a unified customer.
 */
interface UnifiedCustomer {
  id: string;
  sourceId: string;
  source: FinancialSource;
  name: string;
  email?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  createdAt: string;
  metadata: Metadata;
}

/**
 * Represents a unified dispute.
 */
interface UnifiedDispute {
  id: string;
  sourceId: string;
  source: FinancialSource;
  transactionId: string; // Unified transaction ID
  amount: number; // in major units
  currency: Currency;
  reason: string;
  status: "pending" | "won" | "lost" | "needs_response" | "under_review";
  createdAt: string; // ISO 8601
  resolvedAt?: string; // ISO 8601
  metadata: Metadata;
}

/**
 * =============================================================================
 *  SECTION 4: Abstract API Route Definitions (citibankdemobusiness.dev base)
 * =============================================================================
 */

const API_BASE_URL = "https://api.citibankdemobusiness.dev";

/**
 * Defines the structure for request parameters for various data types.
 */
interface FinancialDataRequestParams extends PaginationParams, DateRange {
  customerId?: string;
  accountId?: string;
  transactionType?: TransactionType;
  transactionStatus?: TransactionStatus;
  currency?: Currency;
  source?: FinancialSource;
  merchantName?: string;
  category?: string; // For filtering transactions by category
  minAmount?: number; // in major units
  maxAmount?: number; // in major units
  includeDisputed?: boolean;
}

interface FetchAccountsParams extends PaginationParams {
  customerId?: string;
  source?: FinancialSource;
  type?: UnifiedAccount["type"];
  status?: UnifiedAccount["status"];
  currency?: Currency;
}

interface FetchCustomersParams extends PaginationParams {
  email?: string;
  nameSearch?: string;
  source?: FinancialSource;
}

interface FetchPaymentsParams extends PaginationParams, DateRange {
  customerId?: string;
  source?: FinancialSource;
  status?: TransactionStatus;
  type?: UnifiedPayment["type"];
  minAmount?: number; // in major units
  maxAmount?: number; // in major units
}

interface FetchDisputesParams extends PaginationParams, DateRange {
  customerId?: string;
  source?: FinancialSource;
  status?: UnifiedDispute["status"];
}

/**
 * Generic API response structure.
 * @template T The type of data items in the response.
 */
interface APIResponse<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * Abstract API paths. The actual HTTP calls would be handled by a backend service
 * at citibankdemobusiness.dev which then calls Stripe/Plaid/MT APIs.
 */
const API_ROUTES = {
  // Unified Data Endpoints
  fetchUnifiedTransactions: `${API_BASE_URL}/financial-data/v1/transactions`,
  fetchUnifiedAccounts: `${API_BASE_URL}/financial-data/v1/accounts`,
  fetchUnifiedCustomers: `${API_BASE_URL}/financial-data/v1/customers`,
  fetchUnifiedPayments: `${API_BASE_URL}/financial-data/v1/payments`,
  fetchUnifiedDisputes: `${API_BASE_URL}/financial-data/v1/disputes`,

  // Source-Specific Proxied Endpoints (for raw data if needed)
  fetchStripeCharges: `${API_BASE_URL}/integrations/stripe/v1/charges`,
  fetchStripeRefunds: `${API_BASE_URL}/integrations/stripe/v1/refunds`,
  fetchStripeDisputes: `${API_BASE_URL}/integrations/stripe/v1/disputes`,
  fetchPlaidTransactions: `${API_BASE_URL}/integrations/plaid/v1/transactions`,
  fetchPlaidAccounts: `${API_BASE_URL}/integrations/plaid/v1/accounts`,
  fetchModernTreasuryTransactions: `${API_BASE_URL}/integrations/moderntreasury/v1/transactions`,
  fetchModernTreasuryAccounts: `${API_BASE_URL}/integrations/moderntreasury/v1/accounts`,
  fetchModernTreasuryPaymentOrders: `${API_BASE_URL}/integrations/moderntreasury/v1/payment_orders`,
  fetchCitibankTransactions: `${API_BASE_URL}/internal/citibank/v1/transactions`,
  fetchCitibankAccounts: `${API_BASE_URL}/internal/citibank/v1/accounts`,
  fetchCitibankCustomers: `${API_BASE_URL}/internal/citibank/v1/customers`,
};

/**
 * =============================================================================
 *  SECTION 5: Utility Functions
 * =============================================================================
 */

/**
 * Converts a Unix timestamp (in seconds) to an ISO 8601 date string.
 * @param timestamp Unix timestamp in seconds.
 * @returns ISO 8601 date string (YYYY-MM-DDTHH:mm:ss.sssZ).
 */
function convertUnixToISO(timestamp: number): string {
  if (isNaN(timestamp) || timestamp < 0) {
    return "";
  }
  return new Date(timestamp * 1000).toISOString();
}

/**
 * Converts ISO 8601 date string to Unix timestamp in seconds.
 * @param isoString ISO 8601 date string.
 * @returns Unix timestamp in seconds. Returns 0 for invalid dates.
 */
function convertISOToUnix(isoString: string): number {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return 0; // Invalid date
    }
    return Math.floor(date.getTime() / 1000);
  } catch (e) {
    return 0; // Invalid date string
  }
}

/**
 * Generates a unique ID (UUID v4 style, simplified).
 * This is a client-side friendly pseudo-UUID generator, not cryptographically secure.
 * @returns A pseudo-UUID string.
 */
function generateUUID(): string {
  let dt = new Date().getTime();
  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

/**
 * Formats a monetary amount to a fixed number of decimal places based on currency.
 * For "no imports" constraint, a simple fixed-decimal formatting is used.
 * @param amount The numerical amount (in major units).
 * @param currency The currency.
 * @returns Formatted string.
 */
function formatAmount(amount: number, currency: Currency): string {
  const precision = (currency === Currency.JPY) ? 0 : 2;
  return amount.toFixed(precision);
}

/**
 * Converts amount from cents (or smallest unit) to major unit.
 * @param amountInSmallestUnit Amount in cents.
 * @param currency The currency.
 * @returns Amount in major unit (e.g., dollars).
 */
function toMajorUnit(amountInSmallestUnit: number, currency: Currency): number {
  if (currency === Currency.JPY) {
    return amountInSmallestUnit; // JPY has no fractional units
  }
  return amountInSmallestUnit / 100;
}

/**
 * Converts amount from major unit to cents (or smallest unit).
 * @param amountInMajorUnit Amount in major unit (e.g., dollars).
 * @param currency The currency.
 * @returns Amount in smallest unit (e.g., cents).
 */
function toSmallestUnit(amountInMajorUnit: number, currency: Currency): number {
  if (currency === Currency.JPY) {
    return amountInMajorUnit;
  }
  return Math.round(amountInMajorUnit * 100);
}

/**
 * Validates if a date string is in YYYY-MM-DD format and represents a valid date.
 * @param dateString The date string to validate.
 * @returns True if valid, false otherwise.
 */
function isValidYYYYMMDD(dateString: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString) && !isNaN(new Date(dateString).getTime());
}

/**
 * Safely parses a string to a number, returning a default value on failure.
 * @param value String, number, or null/undefined value.
 * @param defaultValue Default value if parsing fails.
 * @returns Parsed number or default.
 */
function safeParseNumber(value: string | number | null | undefined, defaultValue: number = 0): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

/**
 * =============================================================================
 *  SECTION 6: Data Transformation Functions (from Source to Unified)
 * =============================================================================
 */

/**
 * Transforms a Stripe Charge object into a UnifiedTransaction.
 * @param charge The Stripe Charge object.
 * @param customerId Optional unified customer ID to link.
 * @returns A UnifiedTransaction object.
 */
function transformStripeChargeToUnifiedTransaction(charge: StripeCharge, customerId?: string): UnifiedTransaction {
  const amount = toMajorUnit(charge.amount, charge.currency);
  // Stripe charge is an incoming payment for the business, thus a credit to the business's (conceptual) account
  const isCreditToBusinessAccount = true;
  return {
    id: generateUUID(),
    sourceId: charge.id,
    source: FinancialSource.Stripe,
    accountId: "STRIPE_BALANCE_ACCOUNT", // A conceptual unified account representing the Stripe balance
    customerId: customerId || charge.customer || undefined,
    amount: Math.abs(amount),
    currency: charge.currency,
    type: charge.amount_refunded > 0 ? TransactionType.Refund : TransactionType.Payment,
    status: (charge.status === "succeeded" && charge.refunds.length === 0)
      ? TransactionStatus.Completed
      : charge.status === "pending"
        ? TransactionStatus.Pending
        : TransactionStatus.Failed, // Consider refunds as a separate transaction for status logic
    description: charge.description || `Stripe Charge ${charge.id}`,
    transactionDate: convertUnixToISO(charge.created).split('T')[0], // Use YYYY-MM-DD format for consistency
    postedDate: convertUnixToISO(charge.created).split('T')[0], // Stripe charges are usually posted immediately
    direction: isCreditToBusinessAccount ? "credit" : "debit",
    merchantName: charge.statement_descriptor || "Stripe Payment", // Re-purpose statement_descriptor as merchant
    category: ["Sales", "Payment"],
    metadata: charge.metadata,
  };
}

/**
 * Transforms a Stripe Refund object into a UnifiedTransaction.
 * @param refund The Stripe Refund object.
 * @param charge The associated Stripe Charge object (for context).
 * @returns A UnifiedTransaction object.
 */
function transformStripeRefundToUnifiedTransaction(refund: StripeRefund, charge: StripeCharge): UnifiedTransaction {
  const amount = toMajorUnit(refund.amount, refund.currency);
  return {
    id: generateUUID(),
    sourceId: refund.id,
    source: FinancialSource.Stripe,
    accountId: "STRIPE_BALANCE_ACCOUNT",
    customerId: charge.customer || undefined,
    amount: Math.abs(amount),
    currency: refund.currency,
    type: TransactionType.Refund,
    status: refund.status === "succeeded" ? TransactionStatus.Completed : TransactionStatus.Pending,
    description: `Stripe Refund ${refund.id} for charge ${refund.charge}`,
    transactionDate: convertUnixToISO(refund.created).split('T')[0],
    postedDate: convertUnixToISO(refund.created).split('T')[0],
    direction: "debit", // Refund is an outflow from the business account
    merchantName: charge.statement_descriptor || "Stripe Refund",
    category: ["Sales", "Refund"],
    metadata: refund.metadata,
  };
}

/**
 * Maps a Plaid transaction type to a UnifiedTransactionType.
 * @param plaidType The PlaidTransactionType.
 * @returns The corresponding UnifiedTransactionType.
 */
function mapPlaidTxTypeToUnified(plaidType: PlaidTransactionType): TransactionType {
  switch (plaidType) {
    case PlaidTransactionType.DigitalPayment:
    case PlaidTransactionType.BillPayment:
    case PlaidTransactionType.RecurringPayment:
      return TransactionType.Payment;
    case PlaidTransactionType.Cash:
      // This could be Withdrawal or Deposit depending on amount direction
      return TransactionType.Adjustment;
    case PlaidTransactionType.Check:
      // Could be Debit or Credit
      return TransactionType.Adjustment;
    case PlaidTransactionType.Fee:
      return TransactionType.Fee;
    case PlaidTransactionType.Transfer:
      return TransactionType.Transfer;
    case PlaidTransactionType.Interest:
      return TransactionType.Deposit;
    case PlaidTransactionType.Payroll:
      return TransactionType.Deposit;
    default:
      return TransactionType.Adjustment;
  }
}

/**
 * Transforms a Plaid Transaction object into a UnifiedTransaction.
 * @param plaidTx The Plaid Transaction object.
 * @param unifiedAccountId The ID of the unified account this transaction belongs to.
 * @param unifiedCustomerId Optional unified customer ID to link.
 * @returns A UnifiedTransaction object.
 */
function transformPlaidTransactionToUnifiedTransaction(
  plaidTx: PlaidTransaction,
  unifiedAccountId: string,
  unifiedCustomerId?: string,
): UnifiedTransaction {
  const amount = plaidTx.amount; // Plaid amounts are already in major units
  const direction = amount > 0 ? "credit" : "debit"; // Plaid: positive is inflow, negative is outflow
  return {
    id: generateUUID(),
    sourceId: plaidTx.transaction_id,
    source: FinancialSource.Plaid,
    accountId: unifiedAccountId,
    customerId: unifiedCustomerId,
    amount: Math.abs(amount),
    currency: plaidTx.iso_currency_code || Currency.USD,
    type: mapPlaidTxTypeToUnified(plaidTx.transaction_type),
    status: plaidTx.pending ? TransactionStatus.Pending : TransactionStatus.Completed,
    description: plaidTx.name,
    transactionDate: plaidTx.date,
    postedDate: plaidTx.date,
    direction: direction,
    merchantName: plaidTx.merchant_name || plaidTx.name,
    category: plaidTx.category || (plaidTx.personal_finance_category ? [plaidTx.personal_finance_category.primary, plaidTx.personal_finance_category.detailed] : []),
    metadata: {
      original_description: plaidTx.original_description,
      payment_channel: plaidTx.payment_channel,
    },
  };
}

/**
 * Transforms a Plaid Account object into a UnifiedAccount.
 * @param plaidAccount The Plaid Account object.
 * @returns A UnifiedAccount object.
 */
function transformPlaidAccountToUnifiedAccount(plaidAccount: PlaidAccount): UnifiedAccount {
  return {
    id: generateUUID(),
    sourceId: plaidAccount.account_id,
    source: FinancialSource.Plaid,
    accountName: plaidAccount.name,
    accountNumberMasked: plaidAccount.mask || undefined,
    currency: plaidAccount.balances.iso_currency_code || Currency.USD,
    currentBalance: plaidAccount.balances.current || 0,
    availableBalance: plaidAccount.balances.available || undefined,
    type: plaidAccount.type,
    status: "active", // Plaid accounts are generally active unless explicitly closed/deleted
    metadata: {
      official_name: plaidAccount.official_name,
      subtype: plaidAccount.subtype,
      persistent_account_id: plaidAccount.persistent_account_id,
    },
    lastUpdated: new Date().toISOString(), // This would ideally come from the latest balance update timestamp
  };
}

/**
 * Maps a Modern Treasury transaction status to a UnifiedTransactionStatus.
 * @param mtStatus The ModernTreasuryTransactionStatus.
 * @returns The corresponding UnifiedTransactionStatus.
 */
function mapModernTreasuryTxStatusToUnified(mtStatus: ModernTreasuryTransactionStatus): TransactionStatus {
  switch (mtStatus) {
    case ModernTreasuryTransactionStatus.Pending:
      return TransactionStatus.Pending;
    case ModernTreasuryTransactionStatus.Posted:
      return TransactionStatus.Completed;
    case ModernTreasuryTransactionStatus.Void:
      return TransactionStatus.Voided;
    case ModernTreasuryTransactionStatus.Returned:
      return TransactionStatus.Failed; // Returned often implies failure
    default:
      return TransactionStatus.Processing;
  }
}

/**
 * Transforms a Modern Treasury Transaction object into a UnifiedTransaction.
 * @param mtTx The Modern Treasury Transaction object.
 * @param unifiedAccountId The ID of the unified account this transaction belongs to.
 * @param unifiedCustomerId Optional unified customer ID to link.
 * @returns A UnifiedTransaction object.
 */
function transformModernTreasuryTransactionToUnifiedTransaction(
  mtTx: ModernTreasuryTransaction,
  unifiedAccountId: string,
  unifiedCustomerId?: string,
): UnifiedTransaction {
  const amount = toMajorUnit(mtTx.amount, mtTx.currency);
  const direction = mtTx.direction;
  return {
    id: generateUUID(),
    sourceId: mtTx.id,
    source: FinancialSource.ModernTreasury,
    accountId: unifiedAccountId,
    customerId: unifiedCustomerId,
    amount: Math.abs(amount),
    currency: mtTx.currency,
    type: direction === "credit" ? TransactionType.Deposit : TransactionType.Withdrawal,
    status: mapModernTreasuryTxStatusToUnified(mtTx.status),
    description: mtTx.description,
    transactionDate: (mtTx.effective_date || mtTx.posted_at).split('T')[0],
    postedDate: mtTx.posted_at.split('T')[0],
    direction: direction,
    merchantName: mtTx.vendor_buyer_id || undefined, // Re-purpose vendor_buyer_id for merchant
    category: ["Treasury", mtTx.source],
    metadata: mtTx.metadata,
  };
}

/**
 * Transforms a Modern Treasury Account object into a UnifiedAccount.
 * @param mtAccount The Modern Treasury Account object.
 * @returns A UnifiedAccount object.
 */
function transformModernTreasuryAccountToUnifiedAccount(mtAccount: ModernTreasuryAccount): UnifiedAccount {
  return {
    id: generateUUID(),
    sourceId: mtAccount.id,
    source: FinancialSource.ModernTreasury,
    accountName: mtAccount.name,
    accountNumberMasked: mtAccount.account_number.slice(-4), // Mask last 4
    currency: mtAccount.currency,
    currentBalance: 0, // Modern Treasury account object itself doesn't typically carry a live balance
    availableBalance: undefined,
    type: mtAccount.account_type === "checking" ? "depository" : mtAccount.account_type,
    status: "active",
    metadata: {
      bank_name: mtAccount.bank_name,
      iban: mtAccount.iban,
      routing_number: mtAccount.routing_number,
    },
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Transforms a Citibank Internal Transaction object into a UnifiedTransaction.
 * @param citibankTx The Citibank Internal Transaction object.
 * @param unifiedAccountId The ID of the unified account this transaction belongs to.
 * @param unifiedCustomerId The ID of the unified customer this transaction belongs to.
 * @returns A UnifiedTransaction object.
 */
function transformCitibankInternalTransactionToUnified(
  citibankTx: CitibankInternalTransaction,
  unifiedAccountId: string,
  unifiedCustomerId: string,
): UnifiedTransaction {
  const amount = citibankTx.amount; // Already in major units
  const direction = amount >= 0 ? "credit" : "debit";
  return {
    id: generateUUID(),
    sourceId: citibankTx.transactionId,
    source: FinancialSource.CitibankInternal,
    accountId: unifiedAccountId,
    customerId: unifiedCustomerId,
    amount: Math.abs(amount),
    currency: citibankTx.currency,
    type: citibankTx.type,
    status: citibankTx.status,
    description: citibankTx.description,
    transactionDate: citibankTx.transactionDate.split('T')[0],
    postedDate: citibankTx.postedDate.split('T')[0],
    direction: direction,
    metadata: citibankTx.metadata,
  };
}

/**
 * Transforms a Citibank Internal Account object into a UnifiedAccount.
 * @param citibankAccount The Citibank Internal Account object.
 * @returns A UnifiedAccount object.
 */
function transformCitibankInternalAccountToUnified(citibankAccount: CitibankInternalAccount): UnifiedAccount {
  return {
    id: generateUUID(),
    sourceId: citibankAccount.accountId,
    source: FinancialSource.CitibankInternal,
    accountName: citibankAccount.accountName,
    accountNumberMasked: citibankAccount.accountNumber.slice(-4),
    currency: citibankAccount.currency,
    currentBalance: citibankAccount.balance,
    availableBalance: citibankAccount.availableBalance,
    type: citibankAccount.type === "checking" ? "internal_checking" : citibankAccount.type === "savings" ? "internal_savings" : citibankAccount.type,
    status: citibankAccount.status,
    metadata: {},
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Transforms a Citibank Internal Customer object into a UnifiedCustomer.
 * @param citibankCustomer The Citibank Internal Customer object.
 * @returns A UnifiedCustomer object.
 */
function transformCitibankInternalCustomerToUnified(citibankCustomer: CitibankInternalCustomer): UnifiedCustomer {
  return {
    id: generateUUID(),
    sourceId: citibankCustomer.customerId,
    source: FinancialSource.CitibankInternal,
    name: citibankCustomer.name,
    email: citibankCustomer.email,
    phone: citibankCustomer.phone,
    address: citibankCustomer.address,
    createdAt: citibankCustomer.createdAt,
    metadata: {},
  };
}

/**
 * =============================================================================
 *  SECTION 7: Financial Data Filtering Logic
 * =============================================================================
 */

/**
 * Generic filter predicate for unified data types.
 * @template T The type of the item being filtered.
 */
type FilterPredicate<T> = (item: T) => boolean;

/**
 * Builds a predicate function based on FinancialDataRequestParams for UnifiedTransaction.
 * @param params Request parameters.
 * @returns A filter predicate function.
 */
function buildUnifiedTransactionFilterPredicate(params: FinancialDataRequestParams): FilterPredicate<UnifiedTransaction> {
  return (tx: UnifiedTransaction): boolean => {
    // Date range filter (transactionDate, YYYY-MM-DD format comparison)
    if (params.startDate && tx.transactionDate < params.startDate) return false;
    if (params.endDate && tx.transactionDate > params.endDate) return false;

    // Customer ID filter
    if (params.customerId && tx.customerId !== params.customerId) return false;

    // Account ID filter
    if (params.accountId && tx.accountId !== params.accountId) return false;

    // Transaction Type filter
    if (params.transactionType && tx.type !== params.transactionType) return false;

    // Transaction Status filter
    if (params.transactionStatus && tx.status !== params.transactionStatus) return false;

    // Currency filter
    if (params.currency && tx.currency !== params.currency) return false;

    // Source filter
    if (params.source && tx.source !== params.source) return false;

    // Merchant Name filter (case-insensitive partial match)
    if (params.merchantName && (!tx.merchantName || !tx.merchantName.toLowerCase().includes(params.merchantName.toLowerCase()))) return false;

    // Category filter (case-insensitive partial match any in array)
    if (params.category && (!tx.category || !tx.category.some(cat => cat.toLowerCase().includes(params.category!.toLowerCase())))) return false;

    // Amount range filter (absolute value)
    const absoluteAmount = Math.abs(tx.amount);
    if (params.minAmount !== undefined && absoluteAmount < params.minAmount) return false;
    if (params.maxAmount !== undefined && absoluteAmount > params.maxAmount) return false;

    // Dispute inclusion filter (if true, only show disputed items; if false, exclude disputed items)
    if (params.includeDisputed !== undefined) {
      const isDisputed = tx.status === TransactionStatus.Disputed || (tx.metadata && tx.metadata.isDisputed === true);
      if (params.includeDisputed && !isDisputed) return false;
      if (!params.includeDisputed && isDisputed) return false;
    }

    return true;
  };
}

/**
 * Builds a predicate function for UnifiedAccount filtering.
 * @param params FetchAccountsParams for filtering.
 * @returns A filter predicate function.
 */
function buildUnifiedAccountFilterPredicate(params: FetchAccountsParams): FilterPredicate<UnifiedAccount> {
  return (account: UnifiedAccount): boolean => {
    // Assuming customerId is stored in metadata or directly on UnifiedAccount for filtering
    if (params.customerId && (account.metadata.customerId !== params.customerId && account.sourceId !== params.customerId)) return false;
    if (params.source && account.source !== params.source) return false;
    if (params.type && account.type !== params.type) return false;
    if (params.status && account.status !== params.status) return false;
    if (params.currency && account.currency !== params.currency) return false;
    return true;
  };
}

/**
 * Builds a predicate function for UnifiedCustomer filtering.
 * @param params FetchCustomersParams for filtering.
 * @returns A filter predicate function.
 */
function buildUnifiedCustomerFilterPredicate(params: FetchCustomersParams): FilterPredicate<UnifiedCustomer> {
  return (customer: UnifiedCustomer): boolean => {
    if (params.email && (!customer.email || customer.email.toLowerCase() !== params.email.toLowerCase())) return false;
    if (params.nameSearch && (!customer.name || !customer.name.toLowerCase().includes(params.nameSearch.toLowerCase()))) return false;
    if (params.source && customer.source !== params.source) return false;
    return true;
  };
}

/**
 * =============================================================================
 *  SECTION 8: Financial Data Aggregation & Insight Generation
 * =============================================================================
 */

/**
 * Summarizes transactions for a given period.
 */
interface TransactionSummary {
  totalCredit: number; // in major units
  totalDebit: number; // in major units
  netChange: number; // in major units
  transactionCount: number;
  currency: Currency;
  periodStart?: string;
  periodEnd?: string;
}

/**
 * Generates a summary from a list of unified transactions.
 * @param transactions List of unified transactions.
 * @param currency The currency to summarize in.
 * @param periodStart Optional start date for summary (ISO 8601 YYYY-MM-DD).
 * @param periodEnd Optional end date for summary (ISO 8601 YYYY-MM-DD).
 * @returns TransactionSummary object.
 */
function generateTransactionSummary(
  transactions: UnifiedTransaction[],
  currency: Currency,
  periodStart?: string,
  periodEnd?: string,
): TransactionSummary {
  let totalCredit = 0;
  let totalDebit = 0;
  let transactionCount = 0;

  for (const tx of transactions) {
    if (tx.currency === currency) {
      transactionCount++;
      if (tx.direction === "credit") {
        totalCredit += tx.amount;
      } else {
        totalDebit += tx.amount;
      }
    }
  }

  return {
    totalCredit: totalCredit,
    totalDebit: totalDebit,
    netChange: totalCredit - totalDebit,
    transactionCount: transactionCount,
    currency: currency,
    periodStart: periodStart,
    periodEnd: periodEnd,
  };
}

/**
 * Calculates the total balance across multiple unified accounts for a given currency.
 * @param accounts List of unified accounts.
 * @param currency The currency to calculate balance for.
 * @returns Total balance (in major units).
 */
function calculateTotalBalance(accounts: UnifiedAccount[], currency: Currency): number {
  return accounts.reduce((sum, account) => {
    if (account.currency === currency) {
      return sum + account.currentBalance;
    }
    return sum;
  }, 0);
}

/**
 * =============================================================================
 *  SECTION 9: Error Handling and Orchestration Events
 * =============================================================================
 */

enum OrchestratorErrorCode {
  NetworkError = "NETWORK_ERROR",
  DataTransformationError = "DATA_TRANSFORMATION_ERROR",
  FilterApplicationError = "FILTER_APPLICATION_ERROR",
  InvalidParameters = "INVALID_PARAMETERS",
  DataSourceError = "DATA_SOURCE_ERROR",
  AggregationError = "AGGREGATION_ERROR",
  UnknownError = "UNKNOWN_ERROR",
}

class OrchestratorError extends Error {
  public code: OrchestratorErrorCode;
  public details?: Metadata;

  constructor(code: OrchestratorErrorCode, message: string, details?: Metadata) {
    super(message);
    this.name = "OrchestratorError";
    this.code = code;
    this.details = details;
    // Restore prototype chain
    Object.setPrototypeOf(this, OrchestratorError.prototype);
  }
}

/**
 * A simple logging mechanism. In a real app, this would integrate with a logging framework.
 * For the "no imports" constraint, console.log is used directly, but its calls are commented
 * out to prevent unexpected output if this file were integrated without a full environment.
 */
const OrchestratorLogger = {
  log: (message: string, level: "info" | "warn" | "error" = "info", context?: Metadata) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] Orchestrator: ${message}`;
    // Uncomment for actual console logging in a dev environment:
    // if (context) {
    //   console.log(logMessage, context);
    // } else {
    //   console.log(logMessage);
    // }
  },
  info: (message: string, context?: Metadata) => OrchestratorLogger.log(message, "info", context),
  warn: (message: string, context?: Metadata) => OrchestratorLogger.log(message, "warn", context),
  error: (message: string, error?: Error | OrchestratorError, context?: Metadata) => {
    OrchestratorLogger.log(
      message + (error ? ` Error: ${error.message}` : ""),
      "error",
      { ...context, errorName: error?.name, errorCode: (error instanceof OrchestratorError) ? error.code : undefined }
    );
  },
};

/**
 * =============================================================================
 *  SECTION 10: FinancialDataOrchestrator Core
 * =============================================================================
 */

/**
 * Represents a simulated backend API client.
 * In a real scenario, this would use `fetch` or a dedicated HTTP client to
 * interact with `citibankdemobusiness.dev` backend.
 * For the "no imports" constraint, this simulates API calls by returning
 * predefined or mocked data that conforms to the expected APIResponse interface.
 */
class SimulatedBackendApiClient {
  private simulateDelay: number = 50; // Milliseconds for simulated network latency

  // Mock data stores
  private mockData = {
    transactions: [] as UnifiedTransaction[],
    accounts: [] as UnifiedAccount[],
    customers: [] as UnifiedCustomer[],
    payments: [] as UnifiedPayment[],
    disputes: [] as UnifiedDispute[],
    stripeCharges: [] as StripeCharge[],
    stripeRefunds: [] as StripeRefund[],
    stripeDisputes: [] as StripeDispute[],
    plaidTransactions: [] as PlaidTransaction[],
    plaidAccounts: [] as PlaidAccount[],
    modernTreasuryTransactions: [] as ModernTreasuryTransaction[],
    modernTreasuryAccounts: [] as ModernTreasuryAccount[],
    modernTreasuryPaymentOrders: [] as ModernTreasuryPaymentOrder[],
    citibankTransactions: [] as CitibankInternalTransaction[],
    citibankAccounts: [] as CitibankInternalAccount[],
    citibankCustomers: [] as CitibankInternalCustomer[],
  };

  constructor() {
    this.initializeMockData();
  }

  /**
   * Populates the internal mock data stores with sample financial data.
   * This mimics the initial data available from various integrated sources.
   */
  private initializeMockData() {
    // Populate with some initial mock data for demonstration purposes
    // In a real system, this would be empty or loaded dynamically from a database.

    // 1. Citibank Customers
    const customer1: CitibankInternalCustomer = {
      customerId: "cbcust_001", name: "John Doe Corp", email: "john.doe@corp.com",
      address: { street: "100 Corporate Dr", city: "Metropolis", state: "NY", zip: "10001", country: "USA" },
      phone: "212-555-0100", createdAt: "2023-01-01T00:00:00Z", updatedAt: "2023-01-01T00:00:00Z",
    };
    const customer2: CitibankInternalCustomer = {
      customerId: "cbcust_002", name: "Acme Innovations Ltd", email: "info@acme.io",
      address: { street: "789 Innovation Way", city: "Tech City", state: "CA", zip: "90210", country: "USA" },
      phone: "650-555-0200", createdAt: "2023-02-15T00:00:00Z", updatedAt: "2023-02-15T00:00:00Z",
    };
    this.mockData.citibankCustomers.push(customer1, customer2);
    this.mockData.customers.push(
      transformCitibankInternalCustomerToUnified(customer1),
      transformCitibankInternalCustomerToUnified(customer2)
    );
    const unifiedCustomer1 = this.mockData.customers[0];

    // 2. Citibank Accounts
    const cbAccount1: CitibankInternalAccount = {
      accountId: "cbacc_001", customerId: customer1.customerId, accountNumber: "*********1234", accountName: "Business Checking",
      currency: Currency.USD, balance: 150000.50, availableBalance: 149000.50, type: "checking", status: "active", openedAt: "2023-01-01T00:00:00Z"
    };
    const cbAccount2: CitibankInternalAccount = {
      accountId: "cbacc_002", customerId: customer1.customerId, accountNumber: "*********5678", accountName: "Business Savings",
      currency: Currency.USD, balance: 250000.00, availableBalance: 250000.00, type: "savings", status: "active", openedAt: "2023-01-01T00:00:00Z"
    };
    this.mockData.citibankAccounts.push(cbAccount1, cbAccount2);
    this.mockData.accounts.push(
      transformCitibankInternalAccountToUnified(cbAccount1),
      transformCitibankInternalAccountToUnified(cbAccount2)
    );
    const unifiedCbAccount1 = this.mockData.accounts[0];

    // 3. Plaid Accounts & Transactions
    const plaidAccount1: PlaidAccount = {
      account_id: "plaid_acc_abc", balances: { available: 12000.75, current: 12500.20, iso_currency_code: Currency.USD, unofficial_currency_code: null },
      mask: "0001", name: "Plaid Connected Biz Checking", official_name: "FinTech Bank Checking", subtype: "checking", type: PlaidAccountType.Depository, persistent_account_id: null
    };
    this.mockData.plaidAccounts.push(plaidAccount1);
    this.mockData.accounts.push(transformPlaidAccountToUnifiedAccount(plaidAccount1));
    const unifiedPlaidAccount1 = this.mockData.accounts[2]; // Assuming unifiedCbAccount1,2 are first two

    const plaidTx1: PlaidTransaction = {
      transaction_id: "tx_plaid_1", account_id: plaidAccount1.account_id, amount: -50.00, iso_currency_code: Currency.USD, unofficial_currency_code: null,
      date: "2024-02-01", authorized_date: "2024-01-31", name: "Office Supplies", merchant_name: "Staples", pending: false, category: ["Business Services", "Office Supplies"],
      category_id: "13005000", check_number: null, original_description: "STAPLES #5678", payment_channel: "in store", transaction_type: PlaidTransactionType.DigitalPayment
    };
    const plaidTx2: PlaidTransaction = {
      transaction_id: "tx_plaid_2", account_id: plaidAccount1.account_id, amount: 1500.00, iso_currency_code: Currency.USD, unofficial_currency_code: null,
      date: "2024-02-05", authorized_date: "2024-02-04", name: "Client Payment", merchant_name: "Global Clients LLC", pending: false, category: ["Income", "Client Services"],
      category_id: "13005000", check_number: null, original_description: "GLOBAL CLIENTS INV #2024-001", payment_channel: "online", transaction_type: PlaidTransactionType.DigitalPayment
    };
    this.mockData.plaidTransactions.push(plaidTx1, plaidTx2);

    // 4. Stripe Charges & Refunds
    const stripeCharge1: StripeCharge = {
      id: "ch_123abc", amount: 10000, amount_captured: 10000, amount_refunded: 0, currency: Currency.USD, created: 1709251200, // Mar 1, 2024
      status: "succeeded", description: "Online Software Subscription", customer: "cus_xyz", payment_intent: "pi_def", refunds: [], dispute: null, metadata: {}, receipt_url: null
    };
    const stripeCharge2: StripeCharge = {
      id: "ch_456def", amount: 5000, amount_captured: 5000, amount_refunded: 0, currency: Currency.USD, created: 1709856000, // Mar 8, 2024
      status: "succeeded", description: "One-time service fee", customer: "cus_xyz", payment_intent: "pi_ghi", refunds: [], dispute: null, metadata: {}, receipt_url: null
    };
    this.mockData.stripeCharges.push(stripeCharge1, stripeCharge2);

    // 5. Modern Treasury Accounts & Transactions
    const mtAccount1: ModernTreasuryAccount = {
      id: "mt_acc_123", name: "Treasury Operations Account", account_number: "*********9876", currency: Currency.USD,
      account_type: "checking", created_at: "2023-01-01T00:00:00Z", bank_name: "Citibank",
      iban: "US99CITI999999999999999999999", routing_number: "021000089"
    };
    this.mockData.modernTreasuryAccounts.push(mtAccount1);
    this.mockData.accounts.push(transformModernTreasuryAccountToUnifiedAccount(mtAccount1));
    const unifiedMtAccount1 = this.mockData.accounts[3];

    const mtTx1: ModernTreasuryTransaction = {
      id: "mttx_001", amount: 2500000, currency: Currency.USD, type: ModernTreasuryTransactionType.Incoming, status: ModernTreasuryTransactionStatus.Posted,
      description: "Transfer from client account", vendor_buyer_id: "CLIENT-A", posted_at: "2024-03-01T10:00:00Z", expected_at: "2024-03-01T10:00:00Z",
      internal_account_id: mtAccount1.id, live_mode: true, metadata: {}, source: "Wire", direction: "credit", effective_date: "2024-03-01T10:00:00Z"
    };
    const mtTx2: ModernTreasuryTransaction = {
      id: "mttx_002", amount: 1000000, currency: Currency.USD, type: ModernTreasuryTransactionType.Outgoing, status: ModernTreasuryTransactionStatus.Pending,
      description: "Payroll disbursement", vendor_buyer_id: "PAYROLL_VENDOR", posted_at: "2024-03-05T15:00:00Z", expected_at: "2024-03-06T09:00:00Z",
      internal_account_id: mtAccount1.id, live_mode: true, metadata: {}, source: "ACH", direction: "debit", effective_date: "2024-03-06T09:00:00Z"
    };
    this.mockData.modernTreasuryTransactions.push(mtTx1, mtTx2);

    // 6. Citibank Internal Transactions (e.g., manual adjustments, bank fees)
    const cbTx1: CitibankInternalTransaction = {
      transactionId: "cbtx_001", accountId: cbAccount1.accountId, customerId: customer1.customerId, amount: -250.00, currency: Currency.USD,
      type: TransactionType.Fee, status: TransactionStatus.Completed, description: "Monthly Account Fee", transactionDate: "2024-03-01T09:00:00Z",
      postedDate: "2024-03-01T09:00:00Z", referenceId: null, metadata: {}
    };
    const cbTx2: CitibankInternalTransaction = {
      transactionId: "cbtx_002", accountId: cbAccount1.accountId, customerId: customer1.customerId, amount: 5000.00, currency: Currency.USD,
      type: TransactionType.Deposit, status: TransactionStatus.Completed, description: "Investor Capital Injection", transactionDate: "2024-03-10T11:00:00Z",
      postedDate: "2024-03-10T11:00:00Z", referenceId: null, metadata: {}
    };
    this.mockData.citibankTransactions.push(cbTx1, cbTx2);

    // 7. Unify all transactions for the mockData.transactions array
    this.mockData.transactions.push(
      transformStripeChargeToUnifiedTransaction(stripeCharge1, unifiedCustomer1.id),
      transformStripeChargeToUnifiedTransaction(stripeCharge2, unifiedCustomer1.id),
      transformPlaidTransactionToUnifiedTransaction(plaidTx1, unifiedPlaidAccount1.id, unifiedCustomer1.id),
      transformPlaidTransactionToUnifiedTransaction(plaidTx2, unifiedPlaidAccount1.id, unifiedCustomer1.id),
      transformModernTreasuryTransactionToUnifiedTransaction(mtTx1, unifiedMtAccount1.id, unifiedCustomer1.id),
      transformModernTreasuryTransactionToUnifiedTransaction(mtTx2, unifiedMtAccount1.id, unifiedCustomer1.id),
      transformCitibankInternalTransactionToUnified(cbTx1, unifiedCbAccount1.id, unifiedCustomer1.id),
      transformCitibankInternalTransactionToUnified(cbTx2, unifiedCbAccount1.id, unifiedCustomer1.id)
    );
  }

  /**
   * Simulate a network request to the backend API.
   * This method applies basic filtering and pagination to the mock data.
   * @param url The abstract URL, mapping to a data type.
   * @param params Query parameters for filtering and pagination.
   * @returns A promise resolving to an APIResponse containing the requested data.
   */
  private async simulateFetch<T>(
    url: string,
    params: FinancialDataRequestParams | FetchAccountsParams | FetchCustomersParams | FetchPaymentsParams | FetchDisputesParams
  ): Promise<APIResponse<T>> {
    OrchestratorLogger.info(`Simulating fetch to ${url} with params:`, params);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let data: T[] = [];
        let total = 0;

        // Apply filtering logic based on the requested endpoint
        if (url.includes(API_ROUTES.fetchUnifiedTransactions)) {
          const filterFn = buildUnifiedTransactionFilterPredicate(params as FinancialDataRequestParams);
          data = this.mockData.transactions.filter(filterFn) as T[];
        } else if (url.includes(API_ROUTES.fetchUnifiedAccounts)) {
          const filterFn = buildUnifiedAccountFilterPredicate(params as FetchAccountsParams);
          data = this.mockData.accounts.filter(filterFn) as T[];
        } else if (url.includes(API_ROUTES.fetchUnifiedCustomers)) {
          const filterFn = buildUnifiedCustomerFilterPredicate(params as FetchCustomersParams);
          data = this.mockData.customers.filter(filterFn) as T[];
        } else if (url.includes(API_ROUTES.fetchUnifiedDisputes)) {
          // Disputes might need a specific filter, for now, just return mock disputes
          data = this.mockData.disputes as T[]; // Assuming disputes are managed directly in mockData
        } else if (url.includes(API_ROUTES.fetchUnifiedPayments)) {
          data = this.mockData.payments as T[]; // Payments would be populated via specific transformations
        }
        // Add more routes and data types as needed for comprehensive mocking

        total = data.length;
        const limit = params.limit || 100; // Default limit
        const offset = params.offset || 0; // Default offset

        // Simulate pagination
        const paginatedData = data.slice(offset, offset + limit);

        // Simulate errors for demonstration
        if (Math.random() < 0.01) { // 1% chance of network error
          return reject(new OrchestratorError(OrchestratorErrorCode.NetworkError, `Simulated network error during fetch to ${url}`));
        }

        resolve({
          data: paginatedData,
          total: total,
          hasMore: total > (offset + limit),
          nextCursor: total > (offset + limit) ? `cursor_${offset + limit}` : undefined,
        });
      }, this.simulateDelay);
    });
  }

  // --- Unified Data Fetchers (interacting with the simulated backend) ---

  async fetchUnifiedTransactions(params: FinancialDataRequestParams): Promise<APIResponse<UnifiedTransaction>> {
    return this.simulateFetch<UnifiedTransaction>(API_ROUTES.fetchUnifiedTransactions, params);
  }

  async fetchUnifiedAccounts(params: FetchAccountsParams): Promise<APIResponse<UnifiedAccount>> {
    return this.simulateFetch<UnifiedAccount>(API_ROUTES.fetchUnifiedAccounts, params);
  }

  async fetchUnifiedCustomers(params: FetchCustomersParams): Promise<APIResponse<UnifiedCustomer>> {
    return this.simulateFetch<UnifiedCustomer>(API_ROUTES.fetchUnifiedCustomers, params);
  }

  async fetchUnifiedPayments(params: FetchPaymentsParams): Promise<APIResponse<UnifiedPayment>> {
    return this.simulateFetch<UnifiedPayment>(API_ROUTES.fetchUnifiedPayments, params);
  }

  async fetchUnifiedDisputes(params: FetchDisputesParams): Promise<APIResponse<UnifiedDispute>> {
    return this.simulateFetch<UnifiedDispute>(API_ROUTES.fetchUnifiedDisputes, params);
  }

  // --- Source-specific raw data fetchers (proxied through simulated backend) ---
  // These are examples; a complete system would have more.

  async fetchRawStripeCharges(params: PaginationParams & DateRange): Promise<APIResponse<StripeCharge>> {
    OrchestratorLogger.info("Simulating fetchRawStripeCharges");
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let data = this.mockData.stripeCharges;
        if (params.startDate) {
          const startUnix = convertISOToUnix(params.startDate);
          data = data.filter(charge => charge.created >= startUnix);
        }
        if (params.endDate) {
          const endUnix = convertISOToUnix(params.endDate);
          data = data.filter(charge => charge.created <= endUnix);
        }
        const total = data.length;
        const limit = params.limit || 100;
        const offset = params.offset || 0;
        const paginatedData = data.slice(offset, offset + limit);
        resolve({ data: paginatedData, total: total, hasMore: total > (offset + limit) });
      }, this.simulateDelay);
    });
  }

  async fetchRawPlaidTransactions(params: PaginationParams & DateRange & { accountId?: string }): Promise<APIResponse<PlaidTransaction>> {
    OrchestratorLogger.info("Simulating fetchRawPlaidTransactions");
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let data = this.mockData.plaidTransactions;
        if (params.accountId) {
          data = data.filter(tx => tx.account_id === params.accountId);
        }
        if (params.startDate) {
          data = data.filter(tx => tx.date >= params.startDate);
        }
        if (params.endDate) {
          data = data.filter(tx => tx.date <= params.endDate);
        }
        const total = data.length;
        const limit = params.limit || 100;
        const offset = params.offset || 0;
        const paginatedData = data.slice(offset, offset + limit);
        resolve({ data: paginatedData, total: total, hasMore: total > (offset + limit) });
      }, this.simulateDelay);
    });
  }

  async fetchRawModernTreasuryTransactions(params: PaginationParams & DateRange & { internalAccountId?: string }): Promise<APIResponse<ModernTreasuryTransaction>> {
    OrchestratorLogger.info("Simulating fetchRawModernTreasuryTransactions");
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let data = this.mockData.modernTreasuryTransactions;
        if (params.internalAccountId) {
          data = data.filter(tx => tx.internal_account_id === params.internalAccountId);
        }
        if (params.startDate) {
          data = data.filter(tx => tx.posted_at >= params.startDate);
        }
        if (params.endDate) {
          data = data.filter(tx => tx.posted_at <= params.endDate);
        }
        const total = data.length;
        const limit = params.limit || 100;
        const offset = params.offset || 0;
        const paginatedData = data.slice(offset, offset + limit);
        resolve({ data: paginatedData, total: total, hasMore: total > (offset + limit) });
      }, this.simulateDelay);
    });
  }
}

/**
 * The main FinancialDataOrchestrator class.
 * This class encapsulates the logic for fetching, aggregating, filtering,
 * and processing financial data from various sources into a unified view,
 * interacting with the `citibankdemobusiness.dev` backend.
 */
class FinancialDataOrchestrator {
  private apiClient: SimulatedBackendApiClient; // In a real app, this would be an actual HTTP client

  constructor() {
    this.apiClient = new SimulatedBackendApiClient();
    OrchestratorLogger.info("FinancialDataOrchestrator initialized.");
  }

  /**
   * Fetches unified transactions based on provided filters.
   * This is the primary entry point for transaction data.
   * @param params Filter and pagination parameters.
   * @returns A promise resolving to an APIResponse of UnifiedTransaction.
   */
  public async getUnifiedTransactions(params: FinancialDataRequestParams): Promise<APIResponse<UnifiedTransaction>> {
    OrchestratorLogger.info("Attempting to fetch unified transactions.", { params });
    try {
      if (params.minAmount !== undefined && params.minAmount < 0) {
        throw new OrchestratorError(OrchestratorErrorCode.InvalidParameters, "minAmount cannot be negative.");
      }
      if (params.maxAmount !== undefined && params.maxAmount < 0) {
        throw new OrchestratorError(OrchestratorErrorCode.InvalidParameters, "maxAmount cannot be negative.");
      }
      if (params.startDate && !isValidYYYYMMDD(params.startDate)) {
        throw new OrchestratorError(OrchestratorErrorCode.InvalidParameters, "Invalid startDate format. Expected YYYY-MM-DD.");
      }
      if (params.endDate && !isValidYYYYMMDD(params.endDate)) {
        throw new OrchestratorError(OrchestratorErrorCode.InvalidParameters, "Invalid endDate format. Expected YYYY-MM-DD.");
      }

      // The simulated client already applies filters. In a real system, the orchestrator
      // might call multiple source-specific endpoints (e.g., /stripe/charges, /plaid/transactions)
      // then transform, aggregate, and filter the combined data here if the backend doesn't unify fully.
      const response = await this.apiClient.fetchUnifiedTransactions(params);

      OrchestratorLogger.info(`Successfully fetched ${response.data.length} unified transactions (total: ${response.total}).`);
      return response;
    } catch (error) {
      const orchestratorError = error instanceof OrchestratorError ? error :
        new OrchestratorError(OrchestratorErrorCode.NetworkError, `Failed to fetch unified transactions: ${error instanceof Error ? error.message : String(error)}`, { originalError: error });
      OrchestratorLogger.error("Error fetching unified transactions.", orchestratorError, { params });
      throw orchestratorError;
    }
  }

  /**
   * Fetches unified accounts.
   * @param params Filter and pagination parameters.
   * @returns A promise resolving to an APIResponse of UnifiedAccount.
   */
  public async getUnifiedAccounts(params: FetchAccountsParams): Promise<APIResponse<UnifiedAccount>> {
    OrchestratorLogger.info("Attempting to fetch unified accounts.", { params });
    try {
      const response = await this.apiClient.fetchUnifiedAccounts(params);
      OrchestratorLogger.info(`Successfully fetched ${response.data.length} unified accounts (total: ${response.total}).`);
      return response;
    } catch (error) {
      const orchestratorError = error instanceof OrchestratorError ? error :
        new OrchestratorError(OrchestratorErrorCode.NetworkError, `Failed to fetch unified accounts: ${error instanceof Error ? error.message : String(error)}`, { originalError: error });
      OrchestratorLogger.error("Error fetching unified accounts.", orchestratorError, { params });
      throw orchestratorError;
    }
  }

  /**
   * Fetches unified customers.
   * @param params Filter and pagination parameters.
   * @returns A promise resolving to an APIResponse of UnifiedCustomer.
   */
  public async getUnifiedCustomers(params: FetchCustomersParams): Promise<APIResponse<UnifiedCustomer>> {
    OrchestratorLogger.info("Attempting to fetch unified customers.", { params });
    try {
      const response = await this.apiClient.fetchUnifiedCustomers(params);
      OrchestratorLogger.info(`Successfully fetched ${response.data.length} unified customers (total: ${response.total}).`);
      return response;
    } catch (error) {
      const orchestratorError = error instanceof OrchestratorError ? error :
        new OrchestratorError(OrchestratorErrorCode.NetworkError, `Failed to fetch unified customers: ${error instanceof Error ? error.message : String(error)}`, { originalError: error });
      OrchestratorLogger.error("Error fetching unified customers.", orchestratorError, { params });
      throw orchestratorError;
    }
  }

  /**
   * Retrieves aggregated financial insights for a given period and currency.
   * This method demonstrates combining multiple data types to generate a higher-level insight.
   * @param params Parameters including date range and currency.
   * @returns A promise resolving to a detailed financial insight object.
   */
  public async getFinancialInsights(params: DateRange & { currency: Currency; customerId?: string }): Promise<{
    transactionSummary: TransactionSummary;
    totalAccountBalance: number;
    topMerchants: { name: string; totalAmount: number }[];
    recentDisputes: UnifiedDispute[];
  }> {
    OrchestratorLogger.info("Generating financial insights.", { params });
    try {
      const transactionParams: FinancialDataRequestParams = {
        startDate: params.startDate,
        endDate: params.endDate,
        currency: params.currency,
        customerId: params.customerId,
        limit: 1000, // Fetch a larger set for aggregation
      };
      const accountsParams: FetchAccountsParams = {
        currency: params.currency,
        customerId: params.customerId,
      };
      const disputesParams: FetchDisputesParams = {
        startDate: params.startDate,
        endDate: params.endDate,
        customerId: params.customerId,
        status: "needs_response", // Focus on actionable disputes
        limit: 10,
      };

      const [transactionsResponse, accountsResponse, disputesResponse] = await Promise.all([
        this.getUnifiedTransactions(transactionParams),
        this.getUnifiedAccounts(accountsParams),
        this.apiClient.fetchUnifiedDisputes(disputesParams),
      ]);

      const transactionSummary = generateTransactionSummary(
        transactionsResponse.data,
        params.currency,
        params.startDate,
        params.endDate,
      );

      const totalAccountBalance = calculateTotalBalance(accountsResponse.data, params.currency);

      const merchantAggregates: { [key: string]: number } = {};
      for (const tx of transactionsResponse.data) {
        if (tx.merchantName && tx.currency === params.currency && tx.direction === "debit") { // Aggregate outflows for top merchants
          merchantAggregates[tx.merchantName] = (merchantAggregates[tx.merchantName] || 0) + tx.amount;
        }
      }
      const topMerchants = Object.entries(merchantAggregates)
        .sort(([, a], [, b]) => b - a) // Sort descending by total amount
        .slice(0, 5) // Top 5
        .map(([name, totalAmount]) => ({ name, totalAmount }));

      OrchestratorLogger.info("Financial insights generated successfully.", {
        transactionSummary,
        totalAccountBalance,
        topMerchantsCount: topMerchants.length,
        recentDisputesCount: disputesResponse.data.length,
      });

      return {
        transactionSummary,
        totalAccountBalance,
        topMerchants,
        recentDisputes: disputesResponse.data,
      };
    } catch (error) {
      const orchestratorError = error instanceof OrchestratorError ? error :
        new OrchestratorError(OrchestratorErrorCode.AggregationError, `Failed to generate financial insights: ${error instanceof Error ? error.message : String(error)}`, { originalError: error });
      OrchestratorLogger.error("Error generating financial insights.", orchestratorError, { params });
      throw orchestratorError;
    }
  }

  /**
   * Provides a health check of the integration status for various financial sources.
   * This would query backend services that monitor integration status.
   * @returns A promise resolving to an object indicating the health of each source.
   */
  public async getIntegrationHealthStatus(): Promise<{
    [source in FinancialSource]?: { status: "operational" | "degraded" | "offline"; lastChecked: string; message?: string };
  }> {
    OrchestratorLogger.info("Checking integration health status.");
    const statuses = {
      [FinancialSource.Stripe]: { status: "operational", lastChecked: new Date().toISOString() },
      [FinancialSource.Plaid]: { status: "operational", lastChecked: new Date().toISOString() },
      [FinancialSource.ModernTreasury]: { status: "operational", lastChecked: new Date().toISOString() },
      [FinancialSource.CitibankInternal]: { status: "operational", lastChecked: new Date().toISOString(), message: "All internal systems online." },
      [FinancialSource.Other]: { status: "offline", lastChecked: new Date().toISOString(), message: "No 'Other' integrations configured." },
    };
    // Simulate a potential degraded state for a specific source sometimes
    if (Math.random() < 0.1) {
      statuses[FinancialSource.Plaid] = { status: "degraded", lastChecked: new Date().toISOString(), message: "Sporadic delays reported by Plaid." };
    }
    return new Promise(resolve => setTimeout(() => resolve(statuses), this.simulateDelay));
  }

  /**
   * Refreshes data for a specific account or all accounts.
   * This would typically trigger a backend job to re-fetch data from external sources.
   * @param accountId Optional ID of the account to refresh.
   * @param source Optional financial source to limit refresh to.
   * @returns A promise resolving to a status message.
   */
  public async refreshData(accountId?: string, source?: FinancialSource): Promise<{ status: "success" | "pending"; message: string }> {
    OrchestratorLogger.info("Initiating data refresh.", { accountId, source });
    // This would call a backend endpoint like POST /integrations/refresh.
    return new Promise(resolve => setTimeout(() => {
      OrchestratorLogger.info("Data refresh simulation complete.");
      resolve({ status: "pending", message: `Data refresh initiated for ${accountId ? `account ${accountId}` : source ? `source ${source}` : "all accounts"}. Check back shortly.` });
    }, this.simulateDelay * 2)); // Simulate a longer process
  }

  /**
   * Exports unified financial data to a specified format (e.g., CSV, JSON).
   * This function would prepare the data and potentially trigger a backend export service.
   * @param type The type of data to export (e.g., 'transactions', 'accounts').
   * @param format The desired export format ('csv', 'json').
   * @param params Filter parameters for the data to be exported.
   * @returns A promise resolving to a URL for the exported file or a success message.
   */
  public async exportFinancialData<T extends "transactions" | "accounts" | "customers">(
    type: T,
    format: "csv" | "json",
    params: T extends "transactions" ? FinancialDataRequestParams : T extends "accounts" ? FetchAccountsParams : FetchCustomersParams,
  ): Promise<{ status: "success" | "pending"; message: string; downloadUrl?: string }> {
    OrchestratorLogger.info(`Initiating export of ${type} data in ${format} format.`, { params });

    let dataToExport: UnifiedTransaction[] | UnifiedAccount[] | UnifiedCustomer[] = [];
    let fetchFn;

    if (type === "transactions") {
      fetchFn = this.getUnifiedTransactions;
    } else if (type === "accounts") {
      fetchFn = this.getUnifiedAccounts;
    } else if (type === "customers") {
      fetchFn = this.getUnifiedCustomers;
    } else {
      throw new OrchestratorError(OrchestratorErrorCode.InvalidParameters, `Unsupported export type: ${type}`);
    }

    try {
      // Fetch all relevant data (might need to loop for pagination if total > limit)
      let allItems: any[] = [];
      let currentPageParams = { ...params, limit: 1000 }; // Fetch large chunks or iterate
      let hasMore = true;
      while (hasMore) {
        const response: APIResponse<any> = await (fetchFn as any).call(this, currentPageParams);
        allItems = allItems.concat(response.data);
        hasMore = response.hasMore;
        if (response.nextCursor) {
          currentPageParams = { ...currentPageParams, afterCursor: response.nextCursor };
        } else {
          // If no cursor is provided but hasMore is true, increment offset
          currentPageParams = { ...currentPageParams, offset: (currentPageParams.offset || 0) + (currentPageParams.limit || 1000) };
        }
      }
      dataToExport = allItems;

      if (dataToExport.length === 0) {
        return { status: "success", message: "No data found matching criteria for export." };
      }

      // Simulate the backend generating the file and providing a download link
      const fakeDownloadUrl = `${API_BASE_URL}/exports/${type}_${generateUUID()}.${format}`;
      OrchestratorLogger.info(`Export initiated for ${type}, file will be available at: ${fakeDownloadUrl}`);

      return {
        status: "pending",
        message: `Your ${type} data export in ${format} format is being processed. It will be available shortly.`,
        downloadUrl: fakeDownloadUrl,
      };
    } catch (error) {
      const orchestratorError = error instanceof OrchestratorError ? error :
        new OrchestratorError(OrchestratorErrorCode.AggregationError, `Failed to export ${type} data: ${error instanceof Error ? error.message : String(error)}`, { originalError: error });
      OrchestratorLogger.error(`Error during ${type} data export.`, orchestratorError, { params, type, format });
      throw orchestratorError;
    }
  }

  /**
   * Retrieves a detailed report of all disputes within a specified date range.
   * @param params Date range and pagination parameters.
   * @returns A promise resolving to an APIResponse of UnifiedDispute.
   */
  public async getDetailedDisputeReport(params: FetchDisputesParams): Promise<APIResponse<UnifiedDispute>> {
    OrchestratorLogger.info("Fetching detailed dispute report.", { params });
    try {
      const response = await this.apiClient.fetchUnifiedDisputes(params);
      OrchestratorLogger.info(`Successfully fetched ${response.data.length} disputes for report.`);
      return response;
    } catch (error) {
      const orchestratorError = error instanceof OrchestratorError ? error :
        new OrchestratorError(OrchestratorErrorCode.NetworkError, `Failed to fetch dispute report: ${error instanceof Error ? error.message : String(error)}`, { originalError: error });
      OrchestratorLogger.error("Error fetching detailed dispute report.", orchestratorError, { params });
      throw orchestratorError;
    }
  }

  /**
   * Retrieves a comprehensive report on payment orders, including their status and linked transactions.
   * @param params Date range and pagination parameters.
   * @returns A promise resolving to an APIResponse of UnifiedPayment.
   */
  public async getPaymentOrderReport(params: FetchPaymentsParams): Promise<APIResponse<UnifiedPayment>> {
    OrchestratorLogger.info("Fetching payment order report.", { params });
    try {
      // In a real scenario, this would involve fetching Modern Treasury Payment Orders,
      // and potentially cross-referencing them with internal Citibank transactions
      // or other unified transactions based on reference IDs.
      const response = await this.apiClient.fetchUnifiedPayments(params);
      OrchestratorLogger.info(`Successfully fetched ${response.data.length} payments for report.`);
      return response;
    } catch (error) {
      const orchestratorError = error instanceof OrchestratorError ? error :
        new OrchestratorError(OrchestratorErrorCode.NetworkError, `Failed to fetch payment order report: ${error instanceof Error ? error.message : String(error)}`, { originalError: error });
      OrchestratorLogger.error("Error fetching payment order report.", orchestratorError, { params });
      throw orchestratorError;
    }
  }

  /**
   * Retrieves account statements for a specific unified account within a date range.
   * This might involve fetching all transactions for an account and formatting them into a statement.
   * @param accountId The unified account ID.
   * @param params Date range parameters.
   * @returns A promise resolving to a structured account statement.
   */
  public async getAccountStatement(accountId: string, params: DateRange): Promise<{
    accountId: string;
    statementPeriod: DateRange;
    startingBalance: number;
    endingBalance: number;
    transactions: UnifiedTransaction[];
    summary: TransactionSummary;
  }> {
    OrchestratorLogger.info(`Generating account statement for account ${accountId}.`, { params });
    try {
      if (params.startDate && !isValidYYYYMMDD(params.startDate)) {
        throw new OrchestratorError(OrchestratorErrorCode.InvalidParameters, "Invalid startDate format. Expected YYYY-MM-DD.");
      }
      if (params.endDate && !isValidYYYYMMDD(params.endDate)) {
        throw new OrchestratorError(OrchestratorErrorCode.InvalidParameters, "Invalid endDate format. Expected YYYY-MM-DD.");
      }

      const accountResponse = await this.apiClient.fetchUnifiedAccounts({ sourceId: accountId, limit: 1 });
      if (accountResponse.data.length === 0) {
        throw new OrchestratorError(OrchestratorErrorCode.InvalidParameters, `Account not found: ${accountId}`);
      }
      const account = accountResponse.data[0];

      const transactionParams: FinancialDataRequestParams = {
        accountId: account.id,
        startDate: params.startDate,
        endDate: params.endDate,
        currency: account.currency,
        limit: 5000,
      };
      const transactionsResponse = await this.getUnifiedTransactions(transactionParams);
      const transactions = transactionsResponse.data.sort((a, b) => new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime());

      // Calculate starting balance: current balance - net change in period.
      // A more robust system would involve fetching balance snapshots.
      const summary = generateTransactionSummary(transactions, account.currency, params.startDate, params.endDate);
      const endingBalance = account.currentBalance;
      const startingBalance = endingBalance - summary.netChange;

      OrchestratorLogger.info(`Account statement generated for ${accountId}.`);
      return {
        accountId: account.id,
        statementPeriod: params,
        startingBalance,
        endingBalance,
        transactions,
        summary,
      };
    } catch (error) {
      const orchestratorError = error instanceof OrchestratorError ? error :
        new OrchestratorError(OrchestratorErrorCode.AggregationError, `Failed to generate account statement for ${accountId}: ${error instanceof Error ? error.message : String(error)}`, { originalError: error });
      OrchestratorLogger.error("Error generating account statement.", orchestratorError, { accountId, params });
      throw orchestratorError;
    }
  }

  /**
   * Manages webhooks for external integrations (Stripe, Plaid, Modern Treasury).
   * This function would register, update, or deregister webhooks via the backend.
   * @param source The financial source for the webhook.
   * @param action 'register', 'update', or 'deregister'.
   * @param callbackUrl The URL for the webhook callback.
   * @param events Optional list of events to subscribe to.
   * @param webhookId Optional existing webhook ID for 'update'/'deregister' actions.
   * @returns A promise resolving to a status message about the webhook operation.
   */
  public async manageWebhook(
    source: FinancialSource,
    action: "register" | "update" | "deregister",
    callbackUrl: string,
    events?: string[],
    webhookId?: string,
  ): Promise<{ status: "success" | "failed"; message: string; webhookId?: string }> {
    OrchestratorLogger.info(`Managing webhook for ${source}: ${action}.`, { callbackUrl, events, webhookId });

    // In a real system, this would call a backend endpoint
    // e.g., POST /integrations/webhooks/stripe with action in body.
    // The backend would then interact with Stripe/Plaid/MT's webhook APIs.

    const isSuccess = Math.random() > 0.1; // Simulate a 10% failure rate
    let simulatedWebhookId = webhookId || `wh_${source.toLowerCase()}_${generateUUID().substring(0, 8)}`;

    if (isSuccess) {
      OrchestratorLogger.info(`Webhook ${action} for ${source} successful.`, { webhookId: simulatedWebhookId });
      return {
        status: "success",
        message: `Webhook ${action} operation for ${source} was successful.`,
        webhookId: simulatedWebhookId,
      };
    } else {
      const errorMessage = `Failed to ${action} webhook for ${source}. Please check parameters and try again.`;
      OrchestratorLogger.error(errorMessage, undefined, { source, action, callbackUrl });
      return {
        status: "failed",
        message: errorMessage,
      };
    }
  }

  /**
   * Processes a received webhook event from an external source.
   * This typically means validating the payload, updating internal records,
   * and possibly triggering downstream processes.
   * @param source The source of the webhook (e.g., Stripe, Plaid).
   * @param eventPayload The raw payload received from the webhook.
   * @param signature The webhook signature for verification (if provided by source).
   * @returns A promise resolving to a processing status.
   */
  public async processWebhookEvent(
    source: FinancialSource,
    eventPayload: any,
    signature?: string,
  ): Promise<{ status: "processed" | "ignored" | "failed"; message: string }> {
    OrchestratorLogger.info(`Processing webhook event from ${source}.`, { source, eventType: eventPayload?.type });

    // 1. Signature Verification (Simulated) - Crucial for security
    const isValidSignature = signature ? (Math.random() > 0.05) : true; // Simulate 5% verification failure
    if (!isValidSignature) {
      OrchestratorLogger.warn(`Webhook signature verification failed for ${source}.`, { signature });
      return { status: "failed", message: "Webhook signature verification failed." };
    }

    // 2. Event Parsing and Type Handling
    // This would be a large switch or map for different event types.
    const eventType = eventPayload?.type || "unknown";
    switch (source) {
      case FinancialSource.Stripe:
        if (eventType === "charge.succeeded") {
          OrchestratorLogger.info(`Stripe charge.succeeded event received. ID: ${eventPayload.data?.object?.id}`);
          // Logic to update internal records, potentially transform and save as UnifiedTransaction
          return { status: "processed", message: `Stripe charge.succeeded event processed for ${eventPayload.data?.object?.id}.` };
        } else if (eventType === "charge.refunded") {
          OrchestratorLogger.info(`Stripe charge.refunded event received. ID: ${eventPayload.data?.object?.id}`);
          return { status: "processed", message: `Stripe charge.refunded event processed for ${eventPayload.data?.object?.id}.` };
        }
        break;
      case FinancialSource.Plaid:
        if (eventType === "TRANSACTIONS_REMOVED") {
          OrchestratorLogger.info(`Plaid TRANSACTIONS_REMOVED event received for account: ${eventPayload.removed_transactions?.join(', ')}`);
          return { status: "processed", message: `Plaid TRANSACTIONS_REMOVED processed.` };
        } else if (eventType === "TRANSACTIONS_SYNCED") {
          OrchestratorLogger.info(`Plaid TRANSACTIONS_SYNCED event received. Added: ${eventPayload.added?.length}, Modified: ${eventPayload.modified?.length}`);
          return { status: "processed", message: `Plaid TRANSACTIONS_SYNCED processed.` };
        }
        break;
      case FinancialSource.ModernTreasury:
        if (eventType === "payment_order.created" || eventType === "payment_order.updated") {
          OrchestratorLogger.info(`Modern Treasury payment_order event received. ID: ${eventPayload.data?.id}`);
          return { status: "processed", message: `Modern Treasury payment_order event processed for ${eventPayload.data?.id}.` };
        }
        break;
      case FinancialSource.CitibankInternal:
        OrchestratorLogger.info(`Internal Citibank event received. Type: ${eventType}`);
        return { status: "processed", message: `Internal Citibank event processed.` };
    }

    OrchestratorLogger.warn(`Webhook event from ${source} of type ${eventType} was ignored (no specific handler).`);
    return { status: "ignored", message: `Event type ${eventType} from ${source} is not explicitly handled.` };
  }

  /**
   * Generates a cash flow projection report for a specified period.
   * This involves analyzing historical transactions and known recurring payments/incomes.
   * @param accountId The unified account ID.
   * @param params Date range for historical data analysis.
   * @param projectionHorizonDays Number of days into the future to project.
   * @returns A promise resolving to a cash flow projection.
   */
  public async getCashFlowProjection(
    accountId: string,
    params: DateRange,
    projectionHorizonDays: number = 90,
  ): Promise<{
    accountId: string;
    projectionStartDate: string;
    projectionEndDate: string;
    initialBalance: number;
    projectedBalances: { date: string; balance: number; events: string[] }[];
    recurringIncomes: Array<{ description: string; amount: number; frequency: "daily" | "weekly" | "monthly" }>;
    recurringExpenses: Array<{ description: string; amount: number; frequency: "daily" | "weekly" | "monthly" }>;
  }> {
    OrchestratorLogger.info(`Generating cash flow projection for account ${accountId}.`, { params, projectionHorizonDays });
    try {
      const accountResponse = await this.apiClient.fetchUnifiedAccounts({ sourceId: accountId, limit: 1 });
      if (accountResponse.data.length === 0) {
        throw new OrchestratorError(OrchestratorErrorCode.InvalidParameters, `Account not found: ${accountId}`);
      }
      const account = accountResponse.data[0];
      const initialBalance = account.currentBalance;

      // Simulate fetching historical transactions to identify patterns (real logic would be more complex)
      const historicalParams: FinancialDataRequestParams = {
        accountId: account.id,
        startDate: params.startDate,
        endDate: params.endDate,
        currency: account.currency,
        limit: 5000,
      };
      await this.getUnifiedTransactions(historicalParams); // Simulate fetching, but patterns are hardcoded for "no imports"

      // Basic recurring logic simulation for demo purposes
      const recurringIncomes: Array<{ description: string; amount: number; frequency: "daily" | "weekly" | "monthly" }> = [
        { description: "Salary Deposit", amount: 5000, frequency: "monthly" },
        { description: "Subscription Revenue", amount: 1200, frequency: "monthly" },
      ];
      const recurringExpenses: Array<{ description: string; amount: number; frequency: "daily" | "weekly" | "monthly" }> = [
        { description: "Rent Payment", amount: 2000, frequency: "monthly" },
        { description: "Utility Bill", amount: 150, frequency: "monthly" },
        { description: "Cloud Services", amount: 300, frequency: "monthly" },
        { description: "Software Licenses", amount: 250, frequency: "monthly" },
      ];

      const projectionStartDate = new Date().toISOString().split('T')[0];
      const projectionEndDate = new Date(Date.now() + projectionHorizonDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      let currentProjectedBalance = initialBalance;
      const projectedBalances: { date: string; balance: number; events: string[] }[] = [];
      let currentDate = new Date(projectionStartDate);

      for (let i = 0; i < projectionHorizonDays; i++) {
        const dayEvents: string[] = [];
        const dateString = currentDate.toISOString().split('T')[0];

        // Apply recurring incomes
        recurringIncomes.forEach(income => {
          if (
            (income.frequency === "daily") ||
            (income.frequency === "weekly" && currentDate.getDay() === 1) || // Monday
            (income.frequency === "monthly" && currentDate.getDate() === 1) // First day of month
          ) {
            currentProjectedBalance += income.amount;
            dayEvents.push(`+ ${formatAmount(income.amount, account.currency)}: ${income.description}`);
          }
        });

        // Apply recurring expenses
        recurringExpenses.forEach(expense => {
          if (
            (expense.frequency === "daily") ||
            (expense.frequency === "weekly" && currentDate.getDay() === 5) || // Friday
            (expense.frequency === "monthly" && currentDate.getDate() === 15) // 15th of month
          ) {
            currentProjectedBalance -= expense.amount;
            dayEvents.push(`- ${formatAmount(expense.amount, account.currency)}: ${expense.description}`);
          }
        });

        projectedBalances.push({ date: dateString, balance: currentProjectedBalance, events: dayEvents });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      OrchestratorLogger.info(`Cash flow projection generated successfully for account ${accountId}.`);
      return {
        accountId: account.id,
        projectionStartDate,
        projectionEndDate,
        initialBalance,
        projectedBalances,
        recurringIncomes,
        recurringExpenses,
      };
    } catch (error) {
      const orchestratorError = error instanceof OrchestratorError ? error :
        new OrchestratorError(OrchestratorErrorCode.AggregationError, `Failed to generate cash flow projection for ${accountId}: ${error instanceof Error ? error.message : String(error)}`, { originalError: error });
      OrchestratorLogger.error("Error generating cash flow projection.", orchestratorError, { accountId, params });
      throw orchestratorError;
    }
  }

  /**
   * Monitors and reports on potential fraud or suspicious activities.
   * This is a placeholder for a complex fraud detection system.
   * @param params Date range for monitoring.
   * @returns A promise resolving to a fraud report.
   */
  public async getFraudMonitoringReport(params: DateRange): Promise<{
    potentialFraudulentTransactions: UnifiedTransaction[];
    suspiciousLogins: Array<{ customerId: string; timestamp: string; ipAddress: string; reason: string }>;
    totalAlerts: number;
  }> {
    OrchestratorLogger.info("Generating fraud monitoring report.", { params });
    try {
      const fraudulentTransactions: UnifiedTransaction[] = [];
      const allTransactions = await this.getUnifiedTransactions({
        startDate: params.startDate,
        endDate: params.endDate,
        limit: 10000, // Fetch a large dataset for analysis
      });

      allTransactions.data.forEach(tx => {
        // Simple fraud rules for simulation:
        if (tx.amount > 5000 && tx.currency !== Currency.USD && tx.source !== FinancialSource.CitibankInternal) {
          fraudulentTransactions.push(tx);
        }
        if (tx.metadata.isFlaggedForFraud === true) { // Assume a backend flags these
          fraudulentTransactions.push(tx);
        }
      });

      const suspiciousLogins = [
        { customerId: "cbcust_001", timestamp: "2024-03-01T14:30:00Z", ipAddress: "192.168.1.100", reason: "Multiple failed login attempts from new IP" },
        { customerId: "cbcust_002", timestamp: "2024-03-02T08:15:00Z", ipAddress: "203.0.113.45", reason: "Login from geographically distant location" },
      ];

      OrchestratorLogger.info("Fraud monitoring report generated.");
      return {
        potentialFraudulentTransactions: fraudulentTransactions,
        suspiciousLogins,
        totalAlerts: fraudulentTransactions.length + suspiciousLogins.length,
      };
    } catch (error) {
      const orchestratorError = error instanceof OrchestratorError ? error :
        new OrchestratorError(OrchestratorErrorCode.AggregationError, `Failed to generate fraud report: ${error instanceof Error ? error.message : String(error)}`, { originalError: error });
      OrchestratorLogger.error("Error generating fraud monitoring report.", orchestratorError, { params });
      throw orchestratorError;
    }
  }

  /**
   * Provides an audit trail for specific financial operations or data changes.
   * This would interact with a dedicated auditing service backend.
   * @param entityType The type of entity being audited (e.g., 'transaction', 'account', 'user').
   * @param entityId Optional ID of the specific entity.
   * @param params Date range and pagination parameters for the audit trail.
   * @returns A promise resolving to an audit log.
   */
  public async getAuditTrail(
    entityType: "transaction" | "account" | "customer" | "user",
    entityId?: string,
    params?: DateRange & PaginationParams,
  ): Promise<{
    auditEvents: Array<{
      eventId: string;
      timestamp: string;
      actorId: string;
      action: string;
      entityType: string;
      entityId: string;
      details: Metadata;
    }>;
    total: number;
    hasMore: boolean;
  }> {
    OrchestratorLogger.info(`Fetching audit trail for ${entityType}.`, { entityId, params });

    const mockAuditEvents = [
      {
        eventId: "audit_001", timestamp: "2024-03-10T10:00:00Z", actorId: "user_admin", action: "viewed_transactions",
        entityType: "transaction", entityId: "cbtx_001", details: { filter: { startDate: "2024-03-01" } }
      },
      {
        eventId: "audit_002", timestamp: "2024-03-10T11:00:00Z", actorId: "user_ops", action: "updated_customer_email",
        entityType: "customer", entityId: "cbcust_001", details: { oldEmail: "john.doe@corp.com", newEmail: "john.d@newdomain.com" }
      },
      {
        eventId: "audit_003", timestamp: "2024-03-11T09:00:00Z", actorId: "user_finance", action: "exported_accounts",
        entityType: "account", entityId: "all", details: { format: "csv", dateRange: { endDate: "2024-03-10" } }
      },
      {
        eventId: "audit_004", timestamp: "2024-03-12T13:00:00Z", actorId: "system_webhook", action: "processed_webhook",
        entityType: "transaction", entityId: "ch_123abc", details: { source: FinancialSource.Stripe, eventType: "charge.succeeded" }
      },
      {
        eventId: "audit_005", timestamp: "2024-03-13T16:00:00Z", actorId: "user_admin", action: "refreshed_data",
        entityType: "account", entityId: "plaid_acc_abc", details: { source: FinancialSource.Plaid }
      },
    ];

    let filteredEvents = mockAuditEvents.filter(event => {
      if (event.entityType !== entityType) return false;
      if (entityId && event.entityId !== entityId) return false;
      if (params?.startDate && event.timestamp < params.startDate) return false;
      if (params?.endDate && event.timestamp > params.endDate) return false;
      return true;
    });

    const total = filteredEvents.length;
    const limit = params?.limit || 100;
    const offset = params?.offset || 0;
    const paginatedEvents = filteredEvents.slice(offset, offset + limit);

    OrchestratorLogger.info(`Audit trail fetched: ${paginatedEvents.length} events (total: ${total}).`);

    return new Promise(resolve => setTimeout(() => resolve({
      auditEvents: paginatedEvents,
      total: total,
      hasMore: total > (offset + limit),
    }), this.simulateDelay));
  }
}

// Export the orchestrator for use in other parts of the application.
// This implements a singleton pattern, ensuring only one instance of the orchestrator exists
// throughout the application's lifecycle, which is common for service layers.
export const financialDataOrchestrator = new FinancialDataOrchestrator();