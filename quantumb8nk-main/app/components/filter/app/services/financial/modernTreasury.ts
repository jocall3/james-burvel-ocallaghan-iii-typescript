// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import { v4 as uuidv4 } from "uuid";

/**
 * Base URL for the Citibank Demo Business API, routing to Modern Treasury services.
 */
const BASE_URL = "https://citibankdemobusiness.dev/api/modern-treasury";

/**
 * Common API pagination interface.
 */
export interface PaginationParameters {
  page?: number;
  per_page?: number;
  after_cursor?: string;
}

/**
 * Common API response for paginated lists.
 */
export interface PaginatedResponse<T> {
  data: T[];
  metadata: {
    next_cursor?: string;
    has_more: boolean;
  };
}

/**
 * Standard API error structure.
 */
export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Custom error for Modern Treasury API interactions.
 */
export class ModernTreasuryApiError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;
  public readonly status: number;

  constructor(
    message: string,
    code: string,
    status: number,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ModernTreasuryApiError";
    this.code = code;
    this.details = details;
    this.status = status;
    Object.setPrototypeOf(this, ModernTreasuryApiError.prototype);
  }
}

/**
 * Common attributes for Modern Treasury entities.
 */
export interface ModernTreasuryEntity {
  id: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, string>;
}

/**
 * Types for Cash Accounts
 */
export enum CashAccountType {
  Checking = "checking",
  Savings = "savings",
  MoneyMarket = "money_market",
  LineOfCredit = "line_of_credit",
  CreditCard = "credit_card",
  Other = "other",
}

export enum CashAccountStatus {
  Active = "active",
  Inactive = "inactive",
  Closed = "closed",
}

export interface CashAccount extends ModernTreasuryEntity {
  account_number: string;
  routing_number: string;
  account_type: CashAccountType;
  currency: string;
  name: string;
  description?: string;
  bank_name: string;
  internal_account_id: string; // Refers to the internal account in Modern Treasury
  parent_id?: string;
  ledger_account_id?: string; // Link to a ledger account if applicable
  status: CashAccountStatus;
  balances: {
    available_balance: number;
    current_balance: number;
    pending_credits: number;
    pending_debits: number;
  };
}

export interface CreateCashAccountRequest {
  account_number: string;
  routing_number: string;
  account_type: CashAccountType;
  currency: string;
  name: string;
  description?: string;
  bank_name: string;
  internal_account_id: string;
  metadata?: Record<string, string>;
}

export interface UpdateCashAccountRequest {
  name?: string;
  description?: string;
  metadata?: Record<string, string>;
  status?: CashAccountStatus;
}

export interface ListCashAccountsParameters extends PaginationParameters {
  account_number?: string;
  routing_number?: string;
  currency?: string;
  internal_account_id?: string;
  status?: CashAccountStatus;
  metadata?: Record<string, string>;
}

/**
 * Types for Ledgers
 */
export interface Ledger extends ModernTreasuryEntity {
  name: string;
  description?: string;
  currency: string;
  seed_id?: string; // For templated ledgers
}

export interface CreateLedgerRequest {
  name: string;
  currency: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface UpdateLedgerRequest {
  name?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface ListLedgersParameters extends PaginationParameters {
  currency?: string;
  name?: string;
  metadata?: Record<string, string>;
}

/**
 * Types for Ledger Accounts
 */
export enum LedgerAccountNormalBalance {
  Debit = "debit",
  Credit = "credit",
}

export enum LedgerAccountStatus {
  Active = "active",
  Archived = "archived",
}

export interface LedgerAccount extends ModernTreasuryEntity {
  name: string;
  description?: string;
  ledger_id: string;
  currency: string;
  normal_balance: LedgerAccountNormalBalance;
  parent_account_id?: string;
  balances: {
    pending_balance: number;
    posted_balance: number;
    available_balance: number;
  };
  status: LedgerAccountStatus;
}

export interface CreateLedgerAccountRequest {
  name: string;
  ledger_id: string;
  currency: string;
  normal_balance: LedgerAccountNormalBalance;
  description?: string;
  parent_account_id?: string;
  metadata?: Record<string, string>;
}

export interface UpdateLedgerAccountRequest {
  name?: string;
  description?: string;
  metadata?: Record<string, string>;
  status?: LedgerAccountStatus;
}

export interface ListLedgerAccountsParameters extends PaginationParameters {
  ledger_id?: string;
  currency?: string;
  normal_balance?: LedgerAccountNormalBalance;
  parent_account_id?: string;
  status?: LedgerAccountStatus;
  metadata?: Record<string, string>;
}

/**
 * Types for Ledger Entries
 */
export enum LedgerEntryStatus {
  Pending = "pending",
  Posted = "posted",
  Archived = "archived",
}

export interface LedgerEntry extends ModernTreasuryEntity {
  amount: number;
  direction: "credit" | "debit";
  status: LedgerEntryStatus;
  ledger_account_id: string;
  ledger_transaction_id: string;
  lock_version: number;
  metadata?: Record<string, string>;
}

export interface CreateLedgerEntryRequest {
  amount: number;
  direction: "credit" | "debit";
  ledger_account_id: string;
  ledger_transaction_id: string;
  status?: LedgerEntryStatus; // Defaults to 'pending'
  metadata?: Record<string, string>;
}

export interface ListLedgerEntriesParameters extends PaginationParameters {
  ledger_account_id?: string;
  ledger_transaction_id?: string;
  status?: LedgerEntryStatus;
  direction?: "credit" | "debit";
  metadata?: Record<string, string>;
}

/**
 * Types for Ledger Transactions
 */
export enum LedgerTransactionStatus {
  Pending = "pending",
  Posted = "posted",
  Archived = "archived",
  Voided = "voided",
}

export interface LedgerTransaction extends ModernTreasuryEntity {
  description?: string;
  ledger_id: string;
  ledger_entries: LedgerEntry[];
  status: LedgerTransactionStatus;
  posted_at?: string;
  effective_at: string;
  external_id?: string; // e.g., an invoice ID
  metadata?: Record<string, string>;
}

export interface CreateLedgerTransactionRequest {
  ledger_id: string;
  description?: string;
  effective_at: string;
  ledger_entries: Array<{
    amount: number;
    direction: "credit" | "debit";
    ledger_account_id: string;
  }>;
  status?: LedgerTransactionStatus; // Defaults to 'pending'
  external_id?: string;
  metadata?: Record<string, string>;
  idempotency_key?: string;
}

export interface UpdateLedgerTransactionRequest {
  description?: string;
  status?: LedgerTransactionStatus;
  metadata?: Record<string, string>;
}

export interface ListLedgerTransactionsParameters extends PaginationParameters {
  ledger_id?: string;
  ledger_account_id?: string;
  status?: LedgerTransactionStatus;
  effective_at_start?: string;
  effective_at_end?: string;
  external_id?: string;
  metadata?: Record<string, string>;
}

/**
 * Types for Payment Orders
 */
export enum PaymentOrderType {
  ACH = "ach",
  Wire = "wire",
  Book = "book",
  SEPA = "sepa",
  RTP = "rtp", // Real-Time Payment
  Card = "card",
  Check = "check",
  InternationalWire = "international_wire",
  CrossBorder = "cross_border",
}

export enum PaymentOrderDirection {
  Credit = "credit", // Funds flowing in
  Debit = "debit", // Funds flowing out
}

export enum PaymentOrderStatus {
  Pending = "pending",
  Approved = "approved",
  Cancelled = "cancelled",
  Processing = "processing",
  Completed = "completed",
  Returned = "returned",
  Failed = "failed",
}

export enum FundingSource {
  Operating = "operating",
  Customer = "customer",
  LineOfCredit = "line_of_credit",
}

export interface PaymentOrder extends ModernTreasuryEntity {
  amount: number;
  currency: string;
  direction: PaymentOrderDirection;
  type: PaymentOrderType;
  status: PaymentOrderStatus;
  originating_account_id: string; // Our internal account
  receiving_account_id?: string; // Can be an external account or another internal account
  description?: string;
  statement_descriptor?: string;
  external_account_id?: string; // If external
  virtual_account_id?: string; // If virtual
  transaction_id?: string; // Modern Treasury transaction ID
  reference_number?: string;
  expires_at?: string;
  funding_source?: FundingSource;
  processed_at?: string;
  return_id?: string;
  reversal_id?: string;
  // ... many more fields possible for specific payment types
}

export interface CreatePaymentOrderRequest {
  amount: number;
  currency: string;
  direction: PaymentOrderDirection;
  type: PaymentOrderType;
  originating_account_id: string;
  receiving_account_id?: string;
  external_account_id?: string;
  virtual_account_id?: string;
  description?: string;
  statement_descriptor?: string;
  expires_at?: string;
  funding_source?: FundingSource;
  metadata?: Record<string, string>;
  idempotency_key?: string;
}

export interface UpdatePaymentOrderRequest {
  description?: string;
  statement_descriptor?: string;
  metadata?: Record<string, string>;
  status?: PaymentOrderStatus; // Limited updates usually
}

export interface ListPaymentOrdersParameters extends PaginationParameters {
  status?: PaymentOrderStatus;
  direction?: PaymentOrderDirection;
  type?: PaymentOrderType;
  currency?: string;
  originating_account_id?: string;
  receiving_account_id?: string;
  external_account_id?: string;
  virtual_account_id?: string;
  transaction_id?: string;
  created_at_start?: string;
  created_at_end?: string;
  metadata?: Record<string, string>;
}

/**
 * Types for Expected Payments
 */
export enum ExpectedPaymentType {
  ACH = "ach",
  Wire = "wire",
  Book = "book",
  SEPA = "sepa",
  RTP = "rtp",
  Card = "card",
  Check = "check",
  InternationalWire = "international_wire",
  CrossBorder = "cross_border",
}

export enum ExpectedPaymentStatus {
  Pending = "pending",
  Received = "received",
  Archived = "archived",
}

export interface ExpectedPayment extends ModernTreasuryEntity {
  amount: number;
  currency: string;
  description?: string;
  expected_date: string; // The date funds are expected
  internal_account_id: string;
  status: ExpectedPaymentStatus;
  type: ExpectedPaymentType;
  counterparty_id?: string; // Link to an external counterparty
  virtual_account_id?: string;
  statement_descriptor?: string;
  remittance_information?: string; // Reference from the payer
  transaction_id?: string; // Actual transaction ID if received
}

export interface CreateExpectedPaymentRequest {
  amount: number;
  currency: string;
  description?: string;
  expected_date: string;
  internal_account_id: string;
  type: ExpectedPaymentType;
  counterparty_id?: string;
  virtual_account_id?: string;
  statement_descriptor?: string;
  remittance_information?: string;
  metadata?: Record<string, string>;
  idempotency_key?: string;
}

export interface UpdateExpectedPaymentRequest {
  amount?: number;
  description?: string;
  expected_date?: string;
  status?: ExpectedPaymentStatus; // Limited updates
  statement_descriptor?: string;
  remittance_information?: string;
  metadata?: Record<string, string>;
}

export interface ListExpectedPaymentsParameters extends PaginationParameters {
  status?: ExpectedPaymentStatus;
  type?: ExpectedPaymentType;
  currency?: string;
  internal_account_id?: string;
  counterparty_id?: string;
  virtual_account_id?: string;
  expected_date_start?: string;
  expected_date_end?: string;
  metadata?: Record<string, string>;
}

/**
 * Types for Virtual Accounts
 */
export enum VirtualAccountStatus {
  Active = "active",
  Inactive = "inactive",
  Closed = "closed",
}

export interface VirtualAccount extends ModernTreasuryEntity {
  account_number: string;
  routing_number: string;
  name: string;
  description?: string;
  internal_account_id: string; // The physical account this virtual account maps to
  currency: string;
  ledger_account_id?: string; // Optional: link to a ledger account
  status: VirtualAccountStatus;
  balances: {
    available_balance: number;
    current_balance: number;
  };
}

export interface CreateVirtualAccountRequest {
  name: string;
  internal_account_id: string;
  currency: string;
  description?: string;
  ledger_account_id?: string;
  metadata?: Record<string, string>;
}

export interface UpdateVirtualAccountRequest {
  name?: string;
  description?: string;
  status?: VirtualAccountStatus;
  metadata?: Record<string, string>;
}

export interface ListVirtualAccountsParameters extends PaginationParameters {
  internal_account_id?: string;
  currency?: string;
  status?: VirtualAccountStatus;
  metadata?: Record<string, string>;
}

/**
 * Types for Internal Accounts
 */
export enum InternalAccountCurrency {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  // ... other currencies
}

export enum InternalAccountAccountType {
  Checking = "checking",
  Savings = "savings",
  MoneyMarket = "money_market",
  LineOfCredit = "line_of_credit",
  CreditCard = "credit_card",
  Loan = "loan",
  Other = "other",
}

export interface InternalAccount extends ModernTreasuryEntity {
  account_number: string;
  routing_number: string;
  bank_name: string;
  name: string;
  currency: InternalAccountCurrency;
  account_type: InternalAccountAccountType;
  connection_id: string; // Link to a bank connection
  party_name: string; // Legal name of the account holder
  party_address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  balances: {
    available_balance: number;
    current_balance: number;
    pending_credits: number;
    pending_debits: number;
  };
}

export interface ListInternalAccountsParameters extends PaginationParameters {
  currency?: InternalAccountCurrency;
  account_type?: InternalAccountAccountType;
  bank_name?: string;
  connection_id?: string;
  metadata?: Record<string, string>;
}

/**
 * Types for Counterparties (External Accounts / Contacts)
 */
export enum CounterpartyEntityType {
  Individual = "individual",
  Organization = "organization",
}

export interface CounterpartyAccountDetail {
  account_number?: string;
  routing_number?: string;
  iban?: string;
  swift_code?: string;
  bics?: string; // SWIFT/BIC
  bsb_number?: string; // Australia
  clabe?: string; // Mexico
  sort_code?: string; // UK
  aba?: string; // USA routing number
  bank_address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
}

export interface Counterparty extends ModernTreasuryEntity {
  name: string;
  email?: string;
  phone_number?: string;
  tax_payer_id?: string; // e.g., EIN, SSN
  entity_type: CounterpartyEntityType;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  accounts: Array<CounterpartyAccountDetail & {
    id: string;
    name?: string; // e.g., "Main Checking"
    currency: string;
    ledger_account_id?: string;
    live_mode: boolean;
    created_at: string;
    updated_at: string;
    metadata?: Record<string, string>;
  }>;
}

export interface CreateCounterpartyRequest {
  name: string;
  entity_type: CounterpartyEntityType;
  email?: string;
  phone_number?: string;
  tax_payer_id?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  accounts?: Array<{
    account_number?: string;
    routing_number?: string;
    iban?: string;
    swift_code?: string;
    bank_name: string;
    currency: string;
    name?: string; // Display name for this specific account
    ledger_account_id?: string;
    metadata?: Record<string, string>;
  }>;
  metadata?: Record<string, string>;
}

export interface UpdateCounterpartyRequest {
  name?: string;
  email?: string;
  phone_number?: string;
  tax_payer_id?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  metadata?: Record<string, string>;
}

export interface ListCounterpartiesParameters extends PaginationParameters {
  name?: string;
  email?: string;
  entity_type?: CounterpartyEntityType;
  metadata?: Record<string, string>;
}

/**
 * Types for Returns
 */
export enum ReturnStatus {
  Pending = "pending",
  Completed = "completed",
}

export enum ReturnReason {
  InsufficientFunds = "insufficient_funds",
  AccountClosed = "account_closed",
  AuthorizationRevoked = "authorization_revoked",
  NoAccount = "no_account",
  PaymentStopped = "payment_stopped",
  CustomerAdvisedUnauthorized = "customer_advised_unauthorized",
  DebitNotAuthorized = "debit_not_authorized",
  CreditNotAuthorized = "credit_not_authorized",
  IncorrectAccountDetails = "incorrect_account_details",
  BankRequest = "bank_request",
  Other = "other",
}

export interface Return extends ModernTreasuryEntity {
  amount: number;
  currency: string;
  internal_account_id: string;
  status: ReturnStatus;
  reason: ReturnReason;
  payment_order_id: string; // Original payment order that was returned
  transaction_id?: string;
  reference_number?: string;
  explanation?: string;
}

export interface ListReturnsParameters extends PaginationParameters {
  status?: ReturnStatus;
  reason?: ReturnReason;
  currency?: string;
  payment_order_id?: string;
  internal_account_id?: string;
  created_at_start?: string;
  created_at_end?: string;
  metadata?: Record<string, string>;
}

/**
 * Types for Reversals
 */
export enum ReversalStatus {
  Pending = "pending",
  Approved = "approved",
  Declined = "declined",
  Processing = "processing",
  Completed = "completed",
}

export interface Reversal extends ModernTreasuryEntity {
  amount: number;
  currency: string;
  status: ReversalStatus;
  payment_order_id: string; // The original payment order being reversed
  description?: string;
  transaction_id?: string;
  financial_account_id?: string; // Which account it affected
}

export interface CreateReversalRequest {
  payment_order_id: string;
  description?: string;
  metadata?: Record<string, string>;
  idempotency_key?: string;
}

export interface ListReversalsParameters extends PaginationParameters {
  status?: ReversalStatus;
  payment_order_id?: string;
  currency?: string;
  created_at_start?: string;
  created_at_end?: string;
  metadata?: Record<string, string>;
}

/**
 * Types for Transactions (represents actual bank account movements)
 */
export enum TransactionStatus {
  Pending = "pending",
  Posted = "posted",
}

export enum TransactionType {
  ACH = "ach",
  Wire = "wire",
  Book = "book",
  SEPA = "sepa",
  RTP = "rtp",
  Card = "card",
  Check = "check",
  InternationalWire = "international_wire",
  CrossBorder = "cross_border",
  Incoming = "incoming", // Generic incoming
  Outgoing = "outgoing", // Generic outgoing
  Refund = "refund",
  Fee = "fee",
  Adjustment = "adjustment",
  Interest = "interest",
  CreditMemo = "credit_memo",
  DebitMemo = "debit_memo",
  LoanPayment = "loan_payment",
  BillPayment = "bill_payment",
  Payroll = "payroll",
  TaxPayment = "tax_payment",
  // ... many more
}

export enum TransactionDirection {
  Credit = "credit", // Funds flowing into our account
  Debit = "debit", // Funds flowing out of our account
}

export interface Transaction extends ModernTreasuryEntity {
  amount: number;
  currency: string;
  description?: string;
  posted_at: string; // The date the transaction was posted by the bank
  effective_at: string; // The value date
  type: TransactionType;
  direction: TransactionDirection;
  vendor_id: string; // ID from the bank's system
  internal_account_id: string;
  virtual_account_id?: string;
  metadata?: Record<string, string>;
  ledger_transaction_id?: string; // If matched to a ledger transaction
  expected_payment_id?: string; // If matched to an expected payment
  payment_order_id?: string; // If matched to a payment order
}

export interface ListTransactionsParameters extends PaginationParameters {
  status?: TransactionStatus;
  type?: TransactionType;
  direction?: TransactionDirection;
  currency?: string;
  internal_account_id?: string;
  virtual_account_id?: string;
  posted_at_start?: string;
  posted_at_end?: string;
  effective_at_start?: string;
  effective_at_end?: string;
  vendor_id?: string;
  ledger_transaction_id?: string;
  expected_payment_id?: string;
  payment_order_id?: string;
  metadata?: Record<string, string>;
}

/**
 * Utility function to make API requests to the backend.
 * Handles authentication, JSON parsing, and error handling.
 */
async function sendRequest<T>(
  path: string,
  method: string,
  body?: object,
  params?: Record<string, string | number | boolean | undefined>,
  idempotencyKey?: string,
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    // In a real application, you'd add an Authorization header here.
    // For citibankdemobusiness.dev, this would likely be an API key
    // or an OAuth token managed by the backend service.
    // "Authorization": `Bearer ${YOUR_AUTH_TOKEN}`,
  };

  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  } else if (method === "POST") {
    // Generate a default idempotency key for POST requests if not provided
    // This helps prevent accidental duplicate resource creation
    headers["Idempotency-Key"] = uuidv4();
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorBody: ApiErrorResponse = await response.json();
    throw new ModernTreasuryApiError(
      errorBody.message || "An unknown API error occurred",
      errorBody.code || "UNKNOWN_ERROR",
      response.status,
      errorBody.details,
    );
  }

  // Handle No Content responses
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

/**
 * ModernTreasuryClient: A comprehensive client for interacting with the
 * Citibank Demo Business backend's Modern Treasury integration.
 * Provides highly-typed functions for managing financial operations.
 */
export class ModernTreasuryClient {
  /**
   * Cash Accounts API
   */
  public cashAccounts = {
    /**
     * Lists all cash accounts associated with the business.
     * @param params Filtering and pagination parameters.
     * @returns A paginated list of CashAccount objects.
     */
    list: async (
      params?: ListCashAccountsParameters,
    ): Promise<PaginatedResponse<CashAccount>> => {
      return sendRequest<PaginatedResponse<CashAccount>>(
        "/cash_accounts",
        "GET",
        undefined,
        params as Record<string, string | number | boolean | undefined>,
      );
    },

    /**
     * Retrieves a specific cash account by its ID.
     * @param id The ID of the cash account.
     * @returns The requested CashAccount object.
     */
    retrieve: async (id: string): Promise<CashAccount> => {
      return sendRequest<CashAccount>(`/cash_accounts/${id}`, "GET");
    },

    /**
     * Creates a new cash account. Note: In many integrations, cash accounts are
     * synced from banks, but this allows for direct creation if supported by the backend.
     * @param data The request body for creating a cash account.
     * @param idempotencyKey An optional idempotency key to prevent duplicate creation.
     * @returns The newly created CashAccount object.
     */
    create: async (
      data: CreateCashAccountRequest,
      idempotencyKey?: string,
    ): Promise<CashAccount> => {
      return sendRequest<CashAccount>(
        "/cash_accounts",
        "POST",
        data,
        undefined,
        idempotencyKey,
      );
    },

    /**
     * Updates an existing cash account.
     * @param id The ID of the cash account to update.
     * @param data The request body for updating a cash account.
     * @returns The updated CashAccount object.
     */
    update: async (
      id: string,
      data: UpdateCashAccountRequest,
    ): Promise<CashAccount> => {
      return sendRequest<CashAccount>(`/cash_accounts/${id}`, "PATCH", data);
    },
  };

  /**
   * Ledgers API
   */
  public ledgers = {
    /**
     * Lists all ledgers.
     * @param params Filtering and pagination parameters.
     * @returns A paginated list of Ledger objects.
     */
    list: async (
      params?: ListLedgersParameters,
    ): Promise<PaginatedResponse<Ledger>> => {
      return sendRequest<PaginatedResponse<Ledger>>(
        "/ledgers",
        "GET",
        undefined,
        params as Record<string, string | number | boolean | undefined>,
      );
    },

    /**
     * Retrieves a specific ledger by its ID.
     * @param id The ID of the ledger.
     * @returns The requested Ledger object.
     */
    retrieve: async (id: string): Promise<Ledger> => {
      return sendRequest<Ledger>(`/ledgers/${id}`, "GET");
    },

    /**
     * Creates a new ledger.
     * @param data The request body for creating a ledger.
     * @param idempotencyKey An optional idempotency key.
     * @returns The newly created Ledger object.
     */
    create: async (
      data: CreateLedgerRequest,
      idempotencyKey?: string,
    ): Promise<Ledger> => {
      return sendRequest<Ledger>(
        "/ledgers",
        "POST",
        data,
        undefined,
        idempotencyKey,
      );
    },

    /**
     * Updates an existing ledger.
     * @param id The ID of the ledger to update.
     * @param data The request body for updating a ledger.
     * @returns The updated Ledger object.
     */
    update: async (id: string, data: UpdateLedgerRequest): Promise<Ledger> => {
      return sendRequest<Ledger>(`/ledgers/${id}`, "PATCH", data);
    },

    /**
     * Deletes a ledger. This action is usually irreversible and may only be allowed for empty ledgers.
     * @param id The ID of the ledger to delete.
     * @returns void
     */
    delete: async (id: string): Promise<void> => {
      return sendRequest<void>(`/ledgers/${id}`, "DELETE");
    },
  };

  /**
   * Ledger Accounts API
   */
  public ledgerAccounts = {
    /**
     * Lists all ledger accounts.
     * @param params Filtering and pagination parameters.
     * @returns A paginated list of LedgerAccount objects.
     */
    list: async (
      params?: ListLedgerAccountsParameters,
    ): Promise<PaginatedResponse<LedgerAccount>> => {
      return sendRequest<PaginatedResponse<LedgerAccount>>(
        "/ledger_accounts",
        "GET",
        undefined,
        params as Record<string, string | number | boolean | undefined>,
      );
    },

    /**
     * Retrieves a specific ledger account by its ID.
     * @param id The ID of the ledger account.
     * @returns The requested LedgerAccount object.
     */
    retrieve: async (id: string): Promise<LedgerAccount> => {
      return sendRequest<LedgerAccount>(`/ledger_accounts/${id}`, "GET");
    },

    /**
     * Creates a new ledger account.
     * @param data The request body for creating a ledger account.
     * @param idempotencyKey An optional idempotency key.
     * @returns The newly created LedgerAccount object.
     */
    create: async (
      data: CreateLedgerAccountRequest,
      idempotencyKey?: string,
    ): Promise<LedgerAccount> => {
      return sendRequest<LedgerAccount>(
        "/ledger_accounts",
        "POST",
        data,
        undefined,
        idempotencyKey,
      );
    },

    /**
     * Updates an existing ledger account.
     * @param id The ID of the ledger account to update.
     * @param data The request body for updating a ledger account.
     * @returns The updated LedgerAccount object.
     */
    update: async (
      id: string,
      data: UpdateLedgerAccountRequest,
    ): Promise<LedgerAccount> => {
      return sendRequest<LedgerAccount>(`/ledger_accounts/${id}`, "PATCH", data);
    },
  };

  /**
   * Ledger Entries API (for specific entries, usually managed via transactions)
   */
  public ledgerEntries = {
    /**
     * Lists all ledger entries.
     * @param params Filtering and pagination parameters.
     * @returns A paginated list of LedgerEntry objects.
     */
    list: async (
      params?: ListLedgerEntriesParameters,
    ): Promise<PaginatedResponse<LedgerEntry>> => {
      return sendRequest<PaginatedResponse<LedgerEntry>>(
        "/ledger_entries",
        "GET",
        undefined,
        params as Record<string, string | number | boolean | undefined>,
      );
    },

    /**
     * Retrieves a specific ledger entry by its ID.
     * @param id The ID of the ledger entry.
     * @returns The requested LedgerEntry object.
     */
    retrieve: async (id: string): Promise<LedgerEntry> => {
      return sendRequest<LedgerEntry>(`/ledger_entries/${id}`, "GET");
    },
  };

  /**
   * Ledger Transactions API
   */
  public ledgerTransactions = {
    /**
     * Lists all ledger transactions.
     * @param params Filtering and pagination parameters.
     * @returns A paginated list of LedgerTransaction objects.
     */
    list: async (
      params?: ListLedgerTransactionsParameters,
    ): Promise<PaginatedResponse<LedgerTransaction>> => {
      return sendRequest<PaginatedResponse<LedgerTransaction>>(
        "/ledger_transactions",
        "GET",
        undefined,
        params as Record<string, string | number | boolean | undefined>,
      );
    },

    /**
     * Retrieves a specific ledger transaction by its ID.
     * @param id The ID of the ledger transaction.
     * @returns The requested LedgerTransaction object.
     */
    retrieve: async (id: string): Promise<LedgerTransaction> => {
      return sendRequest<LedgerTransaction>(`/ledger_transactions/${id}`, "GET");
    },

    /**
     * Creates a new ledger transaction with multiple entries.
     * @param data The request body for creating a ledger transaction.
     * @param idempotencyKey An optional idempotency key.
     * @returns The newly created LedgerTransaction object.
     */
    create: async (
      data: CreateLedgerTransactionRequest,
      idempotencyKey?: string,
    ): Promise<LedgerTransaction> => {
      return sendRequest<LedgerTransaction>(
        "/ledger_transactions",
        "POST",
        data,
        undefined,
        idempotencyKey,
      );
    },

    /**
     * Updates an existing ledger transaction. E.g., changing its status from pending to posted.
     * @param id The ID of the ledger transaction to update.
     * @param data The request body for updating a ledger transaction.
     * @returns The updated LedgerTransaction object.
     */
    update: async (
      id: string,
      data: UpdateLedgerTransactionRequest,
    ): Promise<LedgerTransaction> => {
      return sendRequest<LedgerTransaction>(
        `/ledger_transactions/${id}`,
        "PATCH",
        data,
      );
    },
  };

  /**
   * Payment Orders API
   */
  public paymentOrders = {
    /**
     * Lists all payment orders.
     * @param params Filtering and pagination parameters.
     * @returns A paginated list of PaymentOrder objects.
     */
    list: async (
      params?: ListPaymentOrdersParameters,
    ): Promise<PaginatedResponse<PaymentOrder>> => {
      return sendRequest<PaginatedResponse<PaymentOrder>>(
        "/payment_orders",
        "GET",
        undefined,
        params as Record<string, string | number | boolean | undefined>,
      );
    },

    /**
     * Retrieves a specific payment order by its ID.
     * @param id The ID of the payment order.
     * @returns The requested PaymentOrder object.
     */
    retrieve: async (id: string): Promise<PaymentOrder> => {
      return sendRequest<PaymentOrder>(`/payment_orders/${id}`, "GET");
    },

    /**
     * Creates a new payment order to initiate an outgoing payment.
     * @param data The request body for creating a payment order.
     * @param idempotencyKey An optional idempotency key.
     * @returns The newly created PaymentOrder object.
     */
    create: async (
      data: CreatePaymentOrderRequest,
      idempotencyKey?: string,
    ): Promise<PaymentOrder> => {
      return sendRequest<PaymentOrder>(
        "/payment_orders",
        "POST",
        data,
        undefined,
        idempotencyKey,
      );
    },

    /**
     * Updates an existing payment order. Status updates (e.g., cancelling a pending payment)
     * are common here.
     * @param id The ID of the payment order to update.
     * @param data The request body for updating a payment order.
     * @returns The updated PaymentOrder object.
     */
    update: async (
      id: string,
      data: UpdatePaymentOrderRequest,
    ): Promise<PaymentOrder> => {
      return sendRequest<PaymentOrder>(`/payment_orders/${id}`, "PATCH", data);
    },
  };

  /**
   * Expected Payments API (for reconciliation)
   */
  public expectedPayments = {
    /**
     * Lists all expected payments.
     * @param params Filtering and pagination parameters.
     * @returns A paginated list of ExpectedPayment objects.
     */
    list: async (
      params?: ListExpectedPaymentsParameters,
    ): Promise<PaginatedResponse<ExpectedPayment>> => {
      return sendRequest<PaginatedResponse<ExpectedPayment>>(
        "/expected_payments",
        "GET",
        undefined,
        params as Record<string, string | number | boolean | undefined>,
      );
    },

    /**
     * Retrieves a specific expected payment by its ID.
     * @param id The ID of the expected payment.
     * @returns The requested ExpectedPayment object.
     */
    retrieve: async (id: string): Promise<ExpectedPayment> => {
      return sendRequest<ExpectedPayment>(`/expected_payments/${id}`, "GET");
    },

    /**
     * Creates a new expected payment to track incoming funds.
     * @param data The request body for creating an expected payment.
     * @param idempotencyKey An optional idempotency key.
     * @returns The newly created ExpectedPayment object.
     */
    create: async (
      data: CreateExpectedPaymentRequest,
      idempotencyKey?: string,
    ): Promise<ExpectedPayment> => {
      return sendRequest<ExpectedPayment>(
        "/expected_payments",
        "POST",
        data,
        undefined,
        idempotencyKey,
      );
    },

    /**
     * Updates an existing expected payment.
     * @param id The ID of the expected payment to update.
     * @param data The request body for updating an expected payment.
     * @returns The updated ExpectedPayment object.
     */
    update: async (
      id: string,
      data: UpdateExpectedPaymentRequest,
    ): Promise<ExpectedPayment> => {
      return sendRequest<ExpectedPayment>(
        `/expected_payments/${id}`,
        "PATCH",
        data,
      );
    },

    /**
     * Deletes an expected payment.
     * @param id The ID of the expected payment to delete.
     * @returns void
     */
    delete: async (id: string): Promise<void> => {
      return sendRequest<void>(`/expected_payments/${id}`, "DELETE");
    },
  };

  /**
   * Virtual Accounts API
   */
  public virtualAccounts = {
    /**
     * Lists all virtual accounts.
     * @param params Filtering and pagination parameters.
     * @returns A paginated list of VirtualAccount objects.
     */
    list: async (
      params?: ListVirtualAccountsParameters,
    ): Promise<PaginatedResponse<VirtualAccount>> => {
      return sendRequest<PaginatedResponse<VirtualAccount>>(
        "/virtual_accounts",
        "GET",
        undefined,
        params as Record<string, string | number | boolean | undefined>,
      );
    },

    /**
     * Retrieves a specific virtual account by its ID.
     * @param id The ID of the virtual account.
     * @returns The requested VirtualAccount object.
     */
    retrieve: async (id: string): Promise<VirtualAccount> => {
      return sendRequest<VirtualAccount>(`/virtual_accounts/${id}`, "GET");
    },

    /**
     * Creates a new virtual account.
     * @param data The request body for creating a virtual account.
     * @param idempotencyKey An optional idempotency key.
     * @returns The newly created VirtualAccount object.
     */
    create: async (
      data: CreateVirtualAccountRequest,
      idempotencyKey?: string,
    ): Promise<VirtualAccount> => {
      return sendRequest<VirtualAccount>(
        "/virtual_accounts",
        "POST",
        data,
        undefined,
        idempotencyKey,
      );
    },

    /**
     * Updates an existing virtual account.
     * @param id The ID of the virtual account to update.
     * @param data The request body for updating a virtual account.
     * @returns The updated VirtualAccount object.
     */
    update: async (
      id: string,
      data: UpdateVirtualAccountRequest,
    ): Promise<VirtualAccount> => {
      return sendRequest<VirtualAccount>(
        `/virtual_accounts/${id}`,
        "PATCH",
        data,
      );
    },

    /**
     * Deletes a virtual account.
     * @param id The ID of the virtual account to delete.
     * @returns void
     */
    delete: async (id: string): Promise<void> => {
      return sendRequest<void>(`/virtual_accounts/${id}`, "DELETE");
    },
  };

  /**
   * Internal Accounts API (represents our actual bank accounts linked to Modern Treasury)
   */
  public internalAccounts = {
    /**
     * Lists all internal accounts.
     * @param params Filtering and pagination parameters.
     * @returns A paginated list of InternalAccount objects.
     */
    list: async (
      params?: ListInternalAccountsParameters,
    ): Promise<PaginatedResponse<InternalAccount>> => {
      return sendRequest<PaginatedResponse<InternalAccount>>(
        "/internal_accounts",
        "GET",
        undefined,
        params as Record<string, string | number | boolean | undefined>,
      );
    },

    /**
     * Retrieves a specific internal account by its ID.
     * @param id The ID of the internal account.
     * @returns The requested InternalAccount object.
     */
    retrieve: async (id: string): Promise<InternalAccount> => {
      return sendRequest<InternalAccount>(`/internal_accounts/${id}`, "GET");
    },
  };

  /**
   * Counterparties API (External accounts/contacts)
   */
  public counterparties = {
    /**
     * Lists all counterparties.
     * @param params Filtering and pagination parameters.
     * @returns A paginated list of Counterparty objects.
     */
    list: async (
      params?: ListCounterpartiesParameters,
    ): Promise<PaginatedResponse<Counterparty>> => {
      return sendRequest<PaginatedResponse<Counterparty>>(
        "/counterparties",
        "GET",
        undefined,
        params as Record<string, string | number | boolean | undefined>,
      );
    },

    /**
     * Retrieves a specific counterparty by its ID.
     * @param id The ID of the counterparty.
     * @returns The requested Counterparty object.
     */
    retrieve: async (id: string): Promise<Counterparty> => {
      return sendRequest<Counterparty>(`/counterparties/${id}`, "GET");
    },

    /**
     * Creates a new counterparty, which can include associated external accounts.
     * @param data The request body for creating a counterparty.
     * @param idempotencyKey An optional idempotency key.
     * @returns The newly created Counterparty object.
     */
    create: async (
      data: CreateCounterpartyRequest,
      idempotencyKey?: string,
    ): Promise<Counterparty> => {
      return sendRequest<Counterparty>(
        "/counterparties",
        "POST",
        data,
        undefined,
        idempotencyKey,
      );
    },

    /**
     * Updates an existing counterparty.
     * @param id The ID of the counterparty to update.
     * @param data The request body for updating a counterparty.
     * @returns The updated Counterparty object.
     */
    update: async (
      id: string,
      data: UpdateCounterpartyRequest,
    ): Promise<Counterparty> => {
      return sendRequest<Counterparty>(`/counterparties/${id}`, "PATCH", data);
    },

    /**
     * Deletes a counterparty.
     * @param id The ID of the counterparty to delete.
     * @returns void
     */
    delete: async (id: string): Promise<void> => {
      return sendRequest<void>(`/counterparties/${id}`, "DELETE");
    },
  };

  /**
   * Returns API
   */
  public returns = {
    /**
     * Lists all returns (e.g., ACH returns).
     * @param params Filtering and pagination parameters.
     * @returns A paginated list of Return objects.
     */
    list: async (
      params?: ListReturnsParameters,
    ): Promise<PaginatedResponse<Return>> => {
      return sendRequest<PaginatedResponse<Return>>(
        "/returns",
        "GET",
        undefined,
        params as Record<string, string | number | boolean | undefined>,
      );
    },

    /**
     * Retrieves a specific return by its ID.
     * @param id The ID of the return.
     * @returns The requested Return object.
     */
    retrieve: async (id: string): Promise<Return> => {
      return sendRequest<Return>(`/returns/${id}`, "GET");
    },
  };

  /**
   * Reversals API
   */
  public reversals = {
    /**
     * Lists all payment reversals.
     * @param params Filtering and pagination parameters.
     * @returns A paginated list of Reversal objects.
     */
    list: async (
      params?: ListReversalsParameters,
    ): Promise<PaginatedResponse<Reversal>> => {
      return sendRequest<PaginatedResponse<Reversal>>(
        "/reversals",
        "GET",
        undefined,
        params as Record<string, string | number | boolean | undefined>,
      );
    },

    /**
     * Retrieves a specific reversal by its ID.
     * @param id The ID of the reversal.
     * @returns The requested Reversal object.
     */
    retrieve: async (id: string): Promise<Reversal> => {
      return sendRequest<Reversal>(`/reversals/${id}`, "GET");
    },

    /**
     * Creates a new reversal for a payment order.
     * @param data The request body for creating a reversal.
     * @param idempotencyKey An optional idempotency key.
     * @returns The newly created Reversal object.
     */
    create: async (
      data: CreateReversalRequest,
      idempotencyKey?: string,
    ): Promise<Reversal> => {
      return sendRequest<Reversal>(
        "/reversals",
        "POST",
        data,
        undefined,
        idempotencyKey,
      );
    },
  };

  /**
   * Transactions API (Bank Statement Transactions)
   */
  public transactions = {
    /**
     * Lists all bank transactions. These represent actual movements on physical bank accounts.
     * @param params Filtering and pagination parameters.
     * @returns A paginated list of Transaction objects.
     */
    list: async (
      params?: ListTransactionsParameters,
    ): Promise<PaginatedResponse<Transaction>> => {
      return sendRequest<PaginatedResponse<Transaction>>(
        "/transactions",
        "GET",
        undefined,
        params as Record<string, string | number | boolean | undefined>,
      );
    },

    /**
     * Retrieves a specific transaction by its ID.
     * @param id The ID of the transaction.
     * @returns The requested Transaction object.
     */
    retrieve: async (id: string): Promise<Transaction> => {
      return sendRequest<Transaction>(`/transactions/${id}`, "GET");
    },
  };

  // Potentially add more top-level resources or utility functions here as needed,
  // e.g., webhooks, events, vendor accounts, etc.
}

// Export a default instance for convenience
export const modernTreasuryClient = new ModernTreasuryClient();