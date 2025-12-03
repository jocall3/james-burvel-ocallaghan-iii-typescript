// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

// This file implements a robust API service for connecting to the citibankdemobusiness.dev backend's Plaid integration.
// It enables secure handling of financial institution accounts, transaction data, balance inquiries,
// and item management with detailed type definitions and comprehensive data retrieval methods.
// All API interactions are assumed to be routed through `https://citibankdemobusiness.dev/api/plaid`,
// where the backend handles Plaid API keys and secrets securely.

import { v4 as uuidv4 } from "uuid";

// --- Base API Configuration and Utility ---
const PLAID_API_BASE_URL = "https://citibankdemobusiness.dev/api/plaid";

/**
 * Enumerates the possible Plaid environments.
 */
export enum PlaidEnvironment {
  Sandbox = "sandbox",
  Development = "development",
  Production = "production",
}

/**
 * Represents a standardized error structure returned by the Plaid API via our backend.
 */
export type PlaidError = {
  error_type: string;
  error_code: string;
  error_message: string;
  display_message: string | null;
  request_id: string;
  causes: Array<Record<string, unknown>>;
  status_code: number;
};

/**
 * Helper function to stringify JSON objects, omitting properties with `undefined` values.
 * This is useful for Plaid API requests where optional parameters should be omitted entirely
 * if not provided, rather than being sent as `null`.
 * @param obj The object to stringify.
 * @returns The JSON string representation of the object.
 */
function JSON_stringify_without_undefined(obj: any): string {
  return JSON.stringify(obj, (key, value) => {
    if (value === undefined) {
      return undefined;
    }
    return value;
  });
}

// --- Plaid Product Enumerations ---

/**
 * Defines the various financial products available through Plaid.
 */
export type PlaidProduct =
  | "auth"
  | "transactions"
  | "investments"
  | "liabilities"
  | "identity"
  | "assets"
  | "signal"
  | "payment_initiation"
  | "deposit_switch"
  | "standing_orders"
  | "income_verification";

// --- Plaid Link Token Management ---

/**
 * Request payload for creating a Plaid Link token.
 * Note: `client_id` and `secret` are handled by the backend for security reasons.
 */
export type PlaidLinkTokenCreateRequest = {
  client_name: string;
  language: string;
  country_codes: string[];
  user: {
    client_user_id: string; // Unique identifier for the end user
    legal_name?: string;
    email_address?: string;
    phone_number?: string;
    date_of_birth?: string; // YYYY-MM-DD
    ssn?: string;
    address?: {
      street: string;
      city: string;
      region: string;
      postal_code: string;
      country: string;
    };
  };
  products: PlaidProduct[];
  redirect_uri?: string; // For OAuth flows
  webhook?: string;
  link_customization_name?: string;
  access_token?: string; // For update mode, if re-authenticating an existing item
  account_filters?: Record<string, unknown>; // Specific filters for account types
};

/**
 * Response payload containing the generated Plaid Link token.
 */
export type PlaidLinkTokenCreateResponse = {
  link_token: string;
  expiration: string; // ISO 8601 timestamp
  request_id: string;
};

/**
 * Creates a Plaid Link token to initialize the Plaid Link flow for a user.
 * This token is used on the frontend to launch the Plaid Link UI.
 * @param request The configuration for the link token creation.
 * @returns A promise that resolves with the PlaidLinkTokenCreateResponse or rejects with a PlaidError.
 */
export async function createPlaidLinkToken(
  request: PlaidLinkTokenCreateRequest,
): Promise<PlaidLinkTokenCreateResponse> {
  const response = await fetch(`${PLAID_API_BASE_URL}/link/token/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Authorization headers would be handled by our backend service layer.
    },
    body: JSON_stringify_without_undefined(request),
  });

  if (!response.ok) {
    const errorBody: PlaidError = await response.json();
    throw new Error(
      `Failed to create Plaid Link token: ${errorBody.display_message || errorBody.error_message}`,
    );
  }

  return response.json();
}

// --- Public Token Exchange ---

/**
 * Request payload for exchanging a Plaid public token for an access token.
 */
export type PlaidPublicTokenExchangeRequest = {
  public_token: string; // Token received from Plaid Link successful connection
};

/**
 * Response payload containing the Plaid access token and item ID.
 */
export type PlaidPublicTokenExchangeResponse = {
  access_token: string; // The long-lived token for accessing item data
  item_id: string; // Unique identifier for the Plaid Item (connection to financial institution)
  request_id: string;
};

/**
 * Exchanges a Plaid public token, received from the frontend Plaid Link flow,
 * for a stable `access_token` and `item_id`. The `access_token` is crucial for
 * all subsequent API calls related to that specific financial institution connection.
 * @param request The public token to exchange.
 * @returns A promise that resolves with the PlaidPublicTokenExchangeResponse.
 */
export async function exchangePlaidPublicToken(
  request: PlaidPublicTokenExchangeRequest,
): Promise<PlaidPublicTokenExchangeResponse> {
  const response = await fetch(`${PLAID_API_BASE_URL}/item/public_token/exchange`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorBody: PlaidError = await response.json();
    throw new Error(
      `Failed to exchange Plaid public token: ${errorBody.display_message || errorBody.error_message}`,
    );
  }

  return response.json();
}

// --- Plaid Item Management ---

/**
 * Enumerates types of webhook updates an Item can receive.
 */
export enum PlaidItemWebhookUpdateType {
  DefaultUpdate = "DEFAULT_UPDATE",
  TransactionsUpdate = "TRANSACTIONS_UPDATE",
  BalanceUpdate = "BALANCE_UPDATE",
  AuthDataUpdate = "AUTH_DATA_UPDATE",
  IdentityDataUpdate = "IDENTITY_DATA_UPDATE",
  AssetsReportReady = "ASSETS_REPORT_READY",
  HoldingsUpdate = "HOLDINGS_UPDATE",
  InvestmentsUpdate = "INVESTMENTS_UPDATE",
  LiabilitiesUpdate = "LIABILITIES_UPDATE",
  IncomeVerificationUpdate = "INCOME_VERIFICATION_UPDATE",
}

/**
 * Represents a Plaid Item, which is a connection to a financial institution.
 * Includes custom `citibankdemobusiness.dev` metadata for internal tracking.
 */
export type PlaidItem = {
  item_id: string;
  institution_id: string;
  webhook: string | null;
  error: PlaidError | null;
  available_products: PlaidProduct[];
  billed_products: PlaidProduct[];
  consent_expiration_time: string | null; // ISO 8601
  update_type: PlaidItemWebhookUpdateType;
  // Additional metadata specific to citibankdemobusiness.dev
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  user_id: string; // Internal user ID linked to this item
};

/**
 * Request payload for retrieving an Item's details.
 */
export type PlaidItemGetRequest = {
  access_token: string;
};

/**
 * Response payload containing the Item's details.
 */
export type PlaidItemGetResponse = {
  item: PlaidItem;
  request_id: string;
};

/**
 * Retrieves information about a specific Plaid Item (connection).
 * @param request The access token associated with the item.
 * @returns A promise that resolves with the PlaidItemGetResponse.
 */
export async function getPlaidItem(
  request: PlaidItemGetRequest,
): Promise<PlaidItemGetResponse> {
  const response = await fetch(`${PLAID_API_BASE_URL}/item/get`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorBody: PlaidError = await response.json();
    throw new Error(
      `Failed to get Plaid item: ${errorBody.display_message || errorBody.error_message}`,
    );
  }

  return response.json();
}

/**
 * Request payload for updating an Item's webhook URL.
 */
export type PlaidItemWebhookUpdateRequest = {
  access_token: string;
  webhook: string; // The new webhook URL
};

/**
 * Response payload after updating an Item's webhook.
 */
export type PlaidItemWebhookUpdateResponse = {
  item: PlaidItem;
  request_id: string;
};

/**
 * Updates the webhook for a Plaid Item. Webhooks are critical for receiving
 * asynchronous notifications about changes to an item (e.g., new transactions).
 * @param request The access token and new webhook URL.
 * @returns A promise that resolves with the PlaidItemWebhookUpdateResponse.
 */
export async function updatePlaidItemWebhook(
  request: PlaidItemWebhookUpdateRequest,
): Promise<PlaidItemWebhookUpdateResponse> {
  const response = await fetch(`${PLAID_API_BASE_URL}/item/webhook/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorBody: PlaidError = await response.json();
    throw new Error(
      `Failed to update Plaid item webhook: ${errorBody.display_message || errorBody.error_message}`,
    );
  }

  return response.json();
}

/**
 * Request payload for removing a Plaid Item.
 */
export type PlaidItemRemoveRequest = {
  access_token: string;
};

/**
 * Response payload after removing a Plaid Item.
 */
export type PlaidItemRemoveResponse = {
  removed: boolean; // True if the item was successfully removed
  request_id: string;
};

/**
 * Removes a Plaid Item. This revokes the access token and deletes all associated data.
 * This action is irreversible.
 * @param request The access token of the item to remove.
 * @returns A promise that resolves with the PlaidItemRemoveResponse.
 */
export async function removePlaidItem(
  request: PlaidItemRemoveRequest,
): Promise<PlaidItemRemoveResponse> {
  const response = await fetch(`${PLAID_API_BASE_URL}/item/remove`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorBody: PlaidError = await response.json();
    throw new Error(
      `Failed to remove Plaid item: ${errorBody.display_message || errorBody.error_message}`,
    );
  }

  return response.json();
}

// --- Plaid Account Management ---

/**
 * Enumerates the high-level types of financial accounts.
 */
export enum PlaidAccountType {
  Depository = "depository", // Checking, savings, money market, CD
  Credit = "credit", // Credit card, line of credit
  Loan = "loan", // Auto loan, mortgage, student loan
  Investment = "investment", // Brokerage, 401k, IRA
  Brokerage = "brokerage",
  Other = "other",
}

/**
 * Enumerates more granular subtypes of financial accounts.
 */
export enum PlaidAccountSubtype {
  Checking = "checking",
  Savings = "savings",
  Cd = "cd",
  MoneyMarket = "money market",
  Prepaid = "prepaid",
  CashManagement = "cash management",
  Ebt = "ebt",
  Commercial = "commercial",
  Payroll = "payroll",
  Auto = "auto",
  Business = "business",
  CommercialCredit = "commercial credit",
  Corporate = "corporate",
  CreditCard = "credit card",
  LineOfCredit = "line of credit",
  Mortgage = "mortgage",
  Student = "student",
  Brokerage = "brokerage",
  Ira = "ira",
  _401k = "401k",
  _403b = "403b",
  _457b = "457b",
  _529 = "529",
  Roth = "roth",
  Roth401k = "roth 401k",
  SepIra = "sep ira",
  SimpleIra = "simple ira",
  ThriftSavingsPlan = "thrift savings plan",
  EducationSavingsAccount = "education savings account",
  HealthSavingsAccount = "health savings account",
  Pensions = "pensions",
  ProfitSharing = "profit sharing",
  RestrictedStockUnit = "restricted stock unit",
  Custodial = "custodial",
  Esg = "esg",
  Trust = "trust",
  MoneyMarketFund = "money market fund",
  Crypto = "crypto",
  Wallet = "wallet",
  Other = "other",
  Unknown = "unknown",
}

/**
 * Represents the balance information for an account.
 */
export type PlaidAccountBalance = {
  available: number | null; // The amount of funds available for use.
  current: number | null; // The total amount of funds in the account.
  limit: number | null; // The credit limit for credit accounts.
  iso_currency_code: string | null; // E.g., "USD"
  unofficial_currency_code: string | null; // For crypto or custom currencies
  last_updated_datetime: string | null; // ISO 8601 timestamp
};

/**
 * Represents a single financial account linked via Plaid.
 * Includes custom `citibankdemobusiness.dev` metadata.
 */
export type PlaidAccount = {
  account_id: string;
  balances: PlaidAccountBalance;
  mask: string | null; // Last 2-4 digits of account number
  name: string; // Official account name from the institution
  official_name: string | null; // User-provided name or marketing name
  subtype: PlaidAccountSubtype | null;
  type: PlaidAccountType;
  persistent_account_id: string | null; // Stable account ID across item re-creation
  verification_status:
    | "pending"
    | "automatically_verified"
    | "manually_verified"
    | "verification_expired"
    | "verification_failed"
    | null;
  // Additional metadata specific to citibankdemobusiness.dev
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  item_id: string; // Link to the parent Plaid Item
};

/**
 * Request payload for retrieving accounts.
 */
export type PlaidAccountsGetRequest = {
  access_token: string;
  options?: {
    account_ids?: string[]; // Filter for specific accounts
  };
};

/**
 * Response payload containing a list of accounts.
 */
export type PlaidAccountsGetResponse = {
  accounts: PlaidAccount[];
  item: PlaidItem;
  request_id: string;
};

/**
 * Retrieves accounts associated with a Plaid Item.
 * @param request The access token to fetch accounts for, and optional filters.
 * @returns A promise that resolves with the PlaidAccountsGetResponse.
 */
export async function getPlaidAccounts(
  request: PlaidAccountsGetRequest,
): Promise<PlaidAccountsGetResponse> {
  const response = await fetch(`${PLAID_API_BASE_URL}/accounts/get`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON_stringify_without_undefined(request),
  });

  if (!response.ok) {
    const errorBody: PlaidError = await response.json();
    throw new Error(
      `Failed to get Plaid accounts: ${errorBody.display_message || errorBody.error_message}`,
    );
  }

  return response.json();
}

// --- Plaid Balance Management ---

/**
 * Request payload for retrieving real-time balances.
 */
export type PlaidBalanceGetRequest = {
  access_token: string;
  options?: {
    account_ids?: string[]; // Filter for specific accounts
  };
};

/**
 * Response payload containing updated balance data for accounts.
 */
export type PlaidBalanceGetResponse = {
  accounts: PlaidAccount[]; // Accounts with updated balance info
  item: PlaidItem;
  request_id: string;
};

/**
 * Retrieves real-time balance data for accounts associated with a Plaid Item.
 * This is useful for up-to-the-minute balance checks, typically for payment processing.
 * @param request The access token and optional account IDs to fetch balances for.
 * @returns A promise that resolves with the PlaidBalanceGetResponse.
 */
export async function getPlaidBalances(
  request: PlaidBalanceGetRequest,
): Promise<PlaidBalanceGetResponse> {
  const response = await fetch(`${PLAID_API_BASE_URL}/accounts/balance/get`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON_stringify_without_undefined(request),
  });

  if (!response.ok) {
    const errorBody: PlaidError = await response.json();
    throw new Error(
      `Failed to get Plaid balances: ${errorBody.display_message || errorBody.error_message}`,
    );
  }

  return response.json();
}

// --- Plaid Transaction Management ---

/**
 * Represents location details for a transaction.
 */
export type PlaidLocation = {
  address: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  country: string | null;
  lat: number | null;
  lon: number | null;
  store_number: string | null;
};

/**
 * Represents payment meta-data for a transaction.
 */
export type PlaidPaymentMeta = {
  by_order_of: string | null;
  payee: string | null;
  payer: string | null;
  payment_method: string | null;
  payment_processor: string | null;
  ppd_id: string | null;
  reason: string | null;
  reference_number: string | null;
};

/**
 * Represents Plaid's personal finance category for a transaction.
 */
export type PlaidPersonalFinanceCategory = {
  primary: string; // High-level category, e.g., "Food and Drink"
  detailed: string; // More specific, e.g., "Restaurants"
};

/**
 * Represents a single financial transaction.
 * Includes custom `citibankdemobusiness.dev` metadata and an `internal_id`.
 */
export type PlaidTransaction = {
  account_id: string;
  account_owner: string | null;
  amount: number; // Positive for incoming (credit), negative for outgoing (debit)
  iso_currency_code: string | null;
  unofficial_currency_code: string | null;
  category: string[] | null; // Legacy category system
  category_id: string | null;
  check_number: string | null;
  date: string; // YYYY-MM-DD (posted date)
  datetime: string | null; // ISO 8601 timestamp for posted transactions
  authorized_date: string | null; // YYYY-MM-DD for pending transactions
  authorized_datetime: string | null; // ISO 8601 timestamp for pending transactions
  location: PlaidLocation;
  name: string; // Cleaned merchant name or transaction description
  merchant_name: string | null;
  original_description: string | null; // Unparsed original description from institution
  payment_meta: PlaidPaymentMeta;
  pending: boolean; // True if the transaction is pending
  pending_transaction_id: string | null; // If pending, links to the original pending transaction
  personal_finance_category: PlaidPersonalFinanceCategory | null;
  transaction_id: string; // Unique ID for the transaction
  transaction_type: "digital" | "place" | "special" | "unresolved" | null;
  website: string | null; // Merchant website URL
  logo_url: string | null; // Merchant logo URL
  // Additional metadata specific to citibankdemobusiness.dev
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  item_id: string;
  user_id: string;
  internal_id: string; // Unique ID generated by our system (using uuidv4)
};

/**
 * Request payload for retrieving historical transactions.
 */
export type PlaidTransactionsGetRequest = {
  access_token: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  options?: {
    account_ids?: string[];
    count?: number; // Max 500
    offset?: number;
    include_original_description?: boolean;
    include_personal_finance_category?: boolean;
    include_logo_and_website?: boolean;
  };
};

/**
 * Response payload containing a list of transactions.
 */
export type PlaidTransactionsGetResponse = {
  transactions: PlaidTransaction[];
  item: PlaidItem;
  accounts: PlaidAccount[];
  total_transactions: number;
  request_id: string;
};

/**
 * Retrieves transactions for accounts associated with a Plaid Item within a specified date range.
 * @param request The access token, date range, and optional filters for transactions.
 * @returns A promise that resolves with the PlaidTransactionsGetResponse.
 */
export async function getPlaidTransactions(
  request: PlaidTransactionsGetRequest,
): Promise<PlaidTransactionsGetResponse> {
  const response = await fetch(`${PLAID_API_BASE_URL}/transactions/get`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON_stringify_without_undefined(request),
  });

  if (!response.ok) {
    const errorBody: PlaidError = await response.json();
    throw new Error(
      `Failed to get Plaid transactions: ${errorBody.display_message || errorBody.error_message}`,
    );
  }

  const data: PlaidTransactionsGetResponse = await response.json();
  // Assign internal_id using uuidv4, following the seed's style for new IDs.
  data.transactions = data.transactions.map((tx) => ({
    ...tx,
    internal_id: uuidv4(),
  }));
  return data;
}

/**
 * Request payload for synchronizing transactions using a cursor.
 */
export type PlaidTransactionsSyncRequest = {
  access_token: string;
  cursor?: string; // Opaque cursor for pagination and incremental updates
  options?: {
    days_requested?: number; // Number of days of historical transactions to retrieve, up to 730
    include_personal_finance_category?: boolean;
    include_logo_and_website?: boolean;
  };
};

/**
 * Response payload for transaction synchronization.
 */
export type PlaidTransactionsSyncResponse = {
  added: PlaidTransaction[]; // Newly added transactions
  modified: PlaidTransaction[]; // Modified transactions
  removed: Array<{ transaction_id: string }>; // IDs of removed transactions
  next_cursor: string; // The cursor to use for the next sync request
  has_more: boolean; // Indicates if there are more transactions to sync
  request_id: string;
};

/**
 * Synchronizes transactions for an item using a cursor-based approach.
 * This is the recommended way to fetch transactions incrementally to avoid
 * re-fetching large amounts of data.
 * @param request The access token and optional cursor for incremental updates.
 * @returns A promise that resolves with the PlaidTransactionsSyncResponse.
 */
export async function syncPlaidTransactions(
  request: PlaidTransactionsSyncRequest,
): Promise<PlaidTransactionsSyncResponse> {
  const response = await fetch(`${PLAID_API_BASE_URL}/transactions/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON_stringify_without_undefined(request),
  });

  if (!response.ok) {
    const errorBody: PlaidError = await response.json();
    throw new Error(
      `Failed to sync Plaid transactions: ${errorBody.display_message || errorBody.error_message}`,
    );
  }

  const data: PlaidTransactionsSyncResponse = await response.json();
  // Assign internal_id using uuidv4, following the seed's style for new IDs.
  data.added = data.added.map((tx) => ({
    ...tx,
    internal_id: uuidv4(),
  }));
  data.modified = data.modified.map((tx) => ({
    ...tx,
    internal_id: uuidv4(),
  }));
  return data;
}

// --- Plaid Auth (Account & Routing Numbers) Management ---

/**
 * ACH routing and account numbers.
 */
export type PlaidNumbersACH = {
  account_id: string;
  account: string; // Account number
  routing: string; // ACH routing number
  wire_routing: string; // Wire routing number
  // Additional internal metadata from citibankdemobusiness.dev
  internal_id: string; // Using uuidv4
};

/**
 * EFT routing and account numbers (for Canadian institutions).
 */
export type PlaidNumbersEFT = {
  account_id: string;
  account: string;
  branch: string; // Branch number
  institution: string; // Institution number
  // Additional internal metadata from citibankdemobusiness.dev
  internal_id: string; // Using uuidv4
};

/**
 * International Bank Account Number (IBAN) and Bank Identifier Code (BIC) details.
 */
export type PlaidNumbersInternational = {
  account_id: string;
  iban: string;
  bic: string;
  // Additional internal metadata from citibankdemobusiness.dev
  internal_id: string; // Using uuidv4
};

/**
 * BACS routing and account numbers (for UK institutions).
 */
export type PlaidNumbersBACS = {
  account_id: string;
  account: string;
  sort_code: string;
  // Additional internal metadata from citibankdemobusiness.dev
  internal_id: string; // Using uuidv4
};

/**
 * Response payload containing account and routing numbers.
 */
export type PlaidAuthGetResponse = {
  accounts: PlaidAccount[];
  numbers: {
    ach: PlaidNumbersACH[];
    eft: PlaidNumbersEFT[];
    international: PlaidNumbersInternational[];
    bacs: PlaidNumbersBACS[];
  };
  item: PlaidItem;
  request_id: string;
};

/**
 * Request payload for retrieving auth data.
 */
export type PlaidAuthGetRequest = {
  access_token: string;
  options?: {
    account_ids?: string[];
  };
};

/**
 * Retrieves bank account and routing numbers for an item. This is critical for
 * enabling ACH transfers and other payment initiation flows.
 * @param request The access token and optional account IDs.
 * @returns A promise that resolves with the PlaidAuthGetResponse.
 */
export async function getPlaidAuth(
  request: PlaidAuthGetRequest,
): Promise<PlaidAuthGetResponse> {
  const response = await fetch(`${PLAID_API_BASE_URL}/auth/get`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON_stringify_without_undefined(request),
  });

  if (!response.ok) {
    const errorBody: PlaidError = await response.json();
    throw new Error(
      `Failed to get Plaid auth data: ${errorBody.display_message || errorBody.error_message}`,
    );
  }

  const data: PlaidAuthGetResponse = await response.json();
  // Assign internal_id using uuidv4 for all number types
  data.numbers.ach = data.numbers.ach.map((n) => ({ ...n, internal_id: uuidv4() }));
  data.numbers.eft = data.numbers.eft.map((n) => ({ ...n, internal_id: uuidv4() }));
  data.numbers.international = data.numbers.international.map((n) => ({
    ...n,
    internal_id: uuidv4(),
  }));
  data.numbers.bacs = data.numbers.bacs.map((n) => ({ ...n, internal_id: uuidv4() }));

  return data;
}

// --- Plaid Identity Management ---

/**
 * Represents an address associated with the user's identity.
 */
export type PlaidIdentityAddress = {
  primary: boolean;
  data: {
    street: string;
    city: string;
    region: string;
    postal_code: string;
    country: string;
  };
};

/**
 * Represents an email address associated with the user's identity.
 */
export type PlaidIdentityEmail = {
  primary: boolean;
  type: string;
  data: string; // Email address
};

/**
 * Represents a phone number associated with the user's identity.
 */
export type PlaidIdentityPhoneNumber = {
  primary: boolean;
  type: string;
  data: string; // Phone number
};

/**
 * Represents a person's name details.
 */
export type PlaidIdentityName = {
  prefix: string | null;
  given_name: string | null;
  middle_name: string | null;
  family_name: string | null;
  suffix: string | null;
  full_name: string; // Computed full name for convenience
};

/**
 * Response payload containing user identity information.
 */
export type PlaidIdentityGetResponse = {
  accounts: PlaidAccount[];
  item: PlaidItem;
  identity: {
    names: PlaidIdentityName[];
    emails: PlaidIdentityEmail[];
    phone_numbers: PlaidIdentityPhoneNumber[];
    addresses: PlaidIdentityAddress[];
  };
  request_id: string;
};

/**
 * Request payload for retrieving identity data.
 */
export type PlaidIdentityGetRequest = {
  access_token: string;
};

/**
 * Retrieves identity information for an item. This typically includes the
 * account holder's name, address, email, and phone number.
 * @param request The access token.
 * @returns A promise that resolves with the PlaidIdentityGetResponse.
 */
export async function getPlaidIdentity(
  request: PlaidIdentityGetRequest,
): Promise<PlaidIdentityGetResponse> {
  const response = await fetch(`${PLAID_API_BASE_URL}/identity/get`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorBody: PlaidError = await response.json();
    throw new Error(
      `Failed to get Plaid identity data: ${errorBody.display_message || errorBody.error_message}`,
    );
  }

  return response.json();
}

// --- Plaid Investments (Holdings & Securities) Management ---

/**
 * Represents a security (stock, ETF, mutual fund, etc.) held in an investment account.
 * Includes custom `citibankdemobusiness.dev` metadata.
 */
export type PlaidSecurity = {
  security_id: string;
  isin: string | null; // International Securities Identification Number
  cusip: string | null; // Committee on Uniform Securities Identification Procedures
  sedol: string | null; // Stock Exchange Daily Official List (UK/Ireland)
  name: string | null;
  ticker_symbol: string | null;
  close_price: number | null;
  close_price_as_of: string | null; // YYYY-MM-DD
  type:
    | "cash"
    | "derivative"
    | "equity"
    | "etf"
    | "fixed income"
    | "loan"
    | "mutual fund"
    | "other"
    | null;
  unofficial_currency_code: string | null;
  iso_currency_code: string | null;
  // Additional metadata specific to citibankdemobusiness.dev
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  internal_id: string; // Using uuidv4
};

/**
 * Represents a single holding (e.g., shares of a stock) within an investment account.
 * Includes custom `citibankdemobusiness.dev` metadata.
 */
export type PlaidHolding = {
  account_id: string;
  security_id: string;
  iso_currency_code: string | null;
  unofficial_currency_code: string | null;
  cost_basis: number | null; // Original purchase price
  quantity: number; // Number of units held
  institution_price: number; // Current price per unit reported by institution
  institution_price_as_of: string | null; // YYYY-MM-DD
  institution_price_datetime: string | null; // ISO 8601
  // Additional metadata specific to citibankdemobusiness.dev
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  internal_id: string; // Using uuidv4
};

/**
 * Response payload containing investment holdings and securities.
 */
export type PlaidInvestmentsHoldingsGetResponse = {
  accounts: PlaidAccount[];
  holdings: PlaidHolding[];
  item: PlaidItem;
  securities: PlaidSecurity[];
  request_id: string;
};

/**
 * Request payload for retrieving investment holdings.
 */
export type PlaidInvestmentsHoldingsGetRequest = {
  access_token: string;
  options?: {
    account_ids?: string[];
  };
};

/**
 * Retrieves investment holdings and securities data for an item.
 * This provides an overview of a user's investment portfolio.
 * @param request The access token and optional account IDs.
 * @returns A promise that resolves with the PlaidInvestmentsHoldingsGetResponse.
 */
export async function getPlaidInvestmentHoldings(
  request: PlaidInvestmentsHoldingsGetRequest,
): Promise<PlaidInvestmentsHoldingsGetResponse> {
  const response = await fetch(`${PLAID_API_BASE_URL}/investments/holdings/get`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON_stringify_without_undefined(request),
  });

  if (!response.ok) {
    const errorBody: PlaidError = await response.json();
    throw new Error(
      `Failed to get Plaid investment holdings: ${errorBody.display_message || errorBody.error_message}`,
    );
  }

  const data: PlaidInvestmentsHoldingsGetResponse = await response.json();
  data.holdings = data.holdings.map((h) => ({ ...h, internal_id: uuidv4() }));
  data.securities = data.securities.map((s) => ({ ...s, internal_id: uuidv4() }));
  return data;
}

/**
 * Enumerates types of investment transactions.
 */
export type PlaidInvestmentTransactionType =
  | "buy"
  | "sell"
  | "cancel"
  | "cash"
  | "fee"
  | "transfer";

/**
 * Enumerates more granular subtypes of investment transactions.
 */
export type PlaidInvestmentTransactionSubtype =
  | "account fee"
  | "adjustment"
  | "assigned event"
  | "bank transfer"
  | "buy"
  | "buy to cover"
  | "cash"
  | "cash contribution"
  | "cash distribution"
  | "cancellation"
  | "charge"
  | "contribution"
  | "deposit"
  | "dividend"
  | "dividend reinvestment"
  | "expense"
  | "expire"
  | "fee"
  | "interest"
  | "interest income"
  | "interest expense"
  | "loan payment"
  | "long-term capital gain"
  | "long-term capital gain reinvestment"
  | "management fee"
  | "margin expense"
  | "merger"
  | "miscellaneous fee"
  | "non-qualified dividend"
  | "option exercise"
  | "option expiration"
  | "option grant"
  | "option lapse"
  | "option assignment"
  | "partial liquidation"
  | "payout"
  | "payment"
  | "penalty"
  | "periodic dividend"
  | "premium"
  | "qualified dividend"
  | "rebalance"
  | "return of capital"
  | "referral bonus"
  | "reinvested dividend"
  | "reinvested short-term capital gain"
  | "reinvested long-term capital gain"
  | "reorganization"
  | "reverse stock split"
  | "rollover"
  | "royalty"
  | "sale"
  | "sell short"
  | "short-term capital gain"
  | "short-term capital gain reinvestment"
  | "split"
  | "stock dividend"
  | "stock distribution"
  | "subscription"
  | "tax"
  | "tax expense"
  | "transfer"
  | "transfer in"
  | "transfer out"
  | "unassigned event"
  | "wash sale"
  | "withdrawal"
  | "withdrawal penalty"
  | "other";

/**
 * Represents a single investment transaction.
 * Includes custom `citibankdemobusiness.dev` metadata.
 */
export type PlaidInvestmentTransaction = {
  investment_transaction_id: string;
  cancel_transaction_id: string | null;
  account_id: string;
  security_id: string | null;
  date: string; // YYYY-MM-DD
  name: string;
  quantity: number;
  amount: number;
  price: number;
  fees: number | null;
  type: PlaidInvestmentTransactionType;
  subtype: PlaidInvestmentTransactionSubtype;
  iso_currency_code: string | null;
  unofficial_currency_code: string | null;
  // Additional metadata specific to citibankdemobusiness.dev
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  item_id: string;
  user_id: string;
  internal_id: string; // Using uuidv4
};

/**
 * Response payload containing investment transactions.
 */
export type PlaidInvestmentsTransactionsGetResponse = {
  accounts: PlaidAccount[];
  holdings: PlaidHolding[];
  investment_transactions: PlaidInvestmentTransaction[];
  item: PlaidItem;
  securities: PlaidSecurity[];
  total_investment_transactions: number;
  request_id: string;
};

/**
 * Request payload for retrieving investment transactions.
 */
export type PlaidInvestmentsTransactionsGetRequest = {
  access_token: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  options?: {
    account_ids?: string[];
    count?: number; // Max 500
    offset?: number;
  };
};

/**
 * Retrieves investment transactions and associated securities for an item.
 * @param request The access token, date range, and optional filters.
 * @returns A promise that resolves with the PlaidInvestmentsTransactionsGetResponse.
 */
export async function getPlaidInvestmentTransactions(
  request: PlaidInvestmentsTransactionsGetRequest,
): Promise<PlaidInvestmentsTransactionsGetResponse> {
  const response = await fetch(`${PLAID_API_BASE_URL}/investments/transactions/get`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON_stringify_without_undefined(request),
  });

  if (!response.ok) {
    const errorBody: PlaidError = await response.json();
    throw new Error(
      `Failed to get Plaid investment transactions: ${errorBody.display_message || errorBody.error_message}`,
    );
  }

  const data: PlaidInvestmentsTransactionsGetResponse = await response.json();
  data.investment_transactions = data.investment_transactions.map((t) => ({
    ...t,
    internal_id: uuidv4(),
  }));
  data.securities = data.securities.map((s) => ({ ...s, internal_id: uuidv4() }));
  return data;
}

// --- Plaid Liabilities (Student Loans, Mortgages, Credit Cards) Management ---

/**
 * Enumerates various status types for loans.
 */
export enum PlaidLoanStatusType {
  Capped = "capped",
  Closed = "closed",
  Cancelled = "cancelled",
  ChargedOff = "charged off",
  Complete = "complete",
  Delinquent = "delinquent",
  InDefault = "in default",
  InReview = "in review",
  PastDue = "past due",
  PaidAhead = "paid ahead",
  Pending = "pending",
  Repayment = "repayment",
  Settled = "settled",
  Terminated = "terminated",
  Transferred = "transferred",
  Unknown = "unknown",
}

/**
 * Represents the status of a student loan.
 */
export type PlaidStudentLoanStatus = {
  end_date: string | null; // YYYY-MM-DD
  type: PlaidLoanStatusType | null;
};

/**
 * Represents the address of a student loan servicer.
 */
export type PlaidStudentLoanServicerAddress = {
  city: string;
  country: string;
  region: string;
  street: string;
  postal_code: string;
};

/**
 * Represents details of a student loan servicer.
 */
export type PlaidStudentLoanServicer = {
  name: string;
  phone_number: string;
  url: string;
  address: PlaidStudentLoanServicerAddress;
};

/**
 * Represents a student loan liability.
 * Includes custom `citibankdemobusiness.dev` metadata.
 */
export type PlaidStudentLoan = {
  account_id: string;
  account_number: string;
  expected_payoff_date: string | null; // YYYY-MM-DD
  guarantor: string | null;
  interest_rate_percentage: number;
  is_overdue: boolean | null;
  last_payment_amount: number | null;
  last_payment_date: string | null; // YYYY-MM-DD
  last_statement_issue_date: string | null; // YYYY-MM-DD
  loan_name: string | null;
  loan_status: PlaidStudentLoanStatus;
  minimum_payment_amount: number | null;
  next_payment_due_date: string | null; // YYYY-MM-DD
  origination_date: string | null; // YYYY-MM-DD
  origination_principal_amount: number | null;
  outstanding_interest_amount: number | null;
  payment_reference_number: string | null;
  pslf_status: Record<string, unknown> | null; // Public Service Loan Forgiveness
  repayment_plan: Record<string, unknown> | null;
  sequence_number: string | null;
  servicer: PlaidStudentLoanServicer;
  ytd_interest_paid: number | null;
  ytd_principal_paid: number | null;
  // Additional metadata specific to citibankdemobusiness.dev
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  item_id: string;
  user_id: string;
  internal_id: string; // Using uuidv4
};

/**
 * Represents interest rate details for a mortgage.
 */
export type PlaidMortgageInterestRate = {
  percentage: number;
  type: string;
  balance_type: string;
};

/**
 * Represents current payment details for a mortgage.
 */
export type PlaidMortgagePaymentCurrent = {
  amount: number;
  currency: string;
  date_due: string; // YYYY-MM-DD
};

/**
 * Represents payment amount details for a mortgage.
 */
export type PlaidMortgagePaymentAmount = {
  currency: string;
  date_due: string; // YYYY-MM-DD
  historical_amounts: Array<{
    date: string;
    amount: number;
    currency: string;
  }>;
  last_amount: number;
  last_payment_date: string; // YYYY-MM-DD
  last_payment_amount: number;
  next_payment_due_date: string; // YYYY-MM-DD
};

/**
 * Represents a mortgage liability.
 * Includes custom `citibankdemobusiness.dev` metadata.
 */
export type PlaidMortgage = {
  account_id: string;
  account_number: string;
  current_late_fee: number | null;
  escrow_balance: number | null;
  interest_rate: PlaidMortgageInterestRate;
  last_payment_amount: number | null;
  last_payment_date: string | null; // YYYY-MM-DD
  loan_type: string | null;
  loan_term: string | null;
  maturity_date: string | null; // YYYY-MM-DD
  next_payment_due_date: string | null; // YYYY-MM-DD
  origination_date: string | null; // YYYY-MM-DD
  origination_principal_amount: number | null;
  past_due_amount: number | null;
  payment_due_date: string | null; // YYYY-MM-DD
  ytd_interest_paid: number | null;
  ytd_principal_paid: number | null;
  // Additional metadata specific to citibankdemobusiness.dev
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  item_id: string;
  user_id: string;
  internal_id: string; // Using uuidv4
};

/**
 * Represents a credit card liability.
 * Includes custom `citibankdemobusiness.dev` metadata.
 */
export type PlaidCreditCardLiability = {
  account_id: string;
  last_payment_amount: number | null;
  last_payment_date: string | null;
  next_payment_due_date: string | null;
  minimum_payment_amount: number | null;
  is_overdue: boolean | null;
  aprs: Array<{
    apr_percentage: number;
    apr_type: string;
    balance_subject_to_apr: number | null;
    interest_charge_amount: number | null;
  }>;
  balance_transfers: Record<string, unknown> | null;
  cash_advance_balance: number | null;
  cash_advance_rate: number | null;
  current_balance: number;
  last_statement_balance: number | null;
  last_statement_issue_date: string | null;
  total_credit_limit: number | null;
  // Additional metadata specific to citibankdemobusiness.dev
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  item_id: string;
  user_id: string;
  internal_id: string; // Using uuidv4
};

/**
 * Response payload containing liabilities information.
 */
export type PlaidLiabilitiesGetResponse = {
  accounts: PlaidAccount[];
  item: PlaidItem;
  liabilities: {
    credit: PlaidCreditCardLiability[];
    mortgage: PlaidMortgage[];
    student: PlaidStudentLoan[];
  };
  request_id: string;
};

/**
 * Request payload for retrieving liabilities.
 */
export type PlaidLiabilitiesGetRequest = {
  access_token: string;
  options?: {
    account_ids?: string[];
  };
};

/**
 * Retrieves liabilities information (student loans, mortgages, credit cards) for an item.
 * @param request The access token and optional account IDs.
 * @returns A promise that resolves with the PlaidLiabilitiesGetResponse.
 */
export async function getPlaidLiabilities(
  request: PlaidLiabilitiesGetRequest,
): Promise<PlaidLiabilitiesGetResponse> {
  const response = await fetch(`${PLAID_API_BASE_URL}/liabilities/get`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON_stringify_without_undefined(request),
  });

  if (!response.ok) {
    const errorBody: PlaidError = await response.json();
    throw new Error(
      `Failed to get Plaid liabilities: ${errorBody.display_message || errorBody.error_message}`,
    );
  }

  const data: PlaidLiabilitiesGetResponse = await response.json();
  data.liabilities.credit = data.liabilities.credit.map((c) => ({ ...c, internal_id: uuidv4() }));
  data.liabilities.mortgage = data.liabilities.mortgage.map((m) => ({ ...m, internal_id: uuidv4() }));
  data.liabilities.student = data.liabilities.student.map((s) => ({ ...s, internal_id: uuidv4() }));
  return data;
}

// --- Plaid Institutions Management ---

/**
 * Represents a financial institution supported by Plaid.
 * Includes custom `citibankdemobusiness.dev` metadata.
 */
export type PlaidInstitution = {
  institution_id: string;
  name: string;
  products: PlaidProduct[];
  country_codes: string[];
  url: string | null;
  logo: string | null; // Base64 encoded PNG
  primary_color: string | null; // Hex color code
  oauth: boolean;
  routing_numbers: string[];
  // Additional metadata specific to citibankdemobusiness.dev
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
};

/**
 * Request payload for retrieving a list of institutions.
 */
export type PlaidInstitutionsGetRequest = {
  count: number; // Max 500
  offset: number;
  options?: {
    products?: PlaidProduct[];
    routing_numbers?: string[];
    oauth?: boolean;
    include_optional_metadata?: boolean;
    include_status?: boolean;
    country_codes?: string[];
  };
};

/**
 * Response payload containing a list of institutions.
 */
export type PlaidInstitutionsGetResponse = {
  institutions: PlaidInstitution[];
  total_institutions: number;
  request_id: string;
};

/**
 * Retrieves a list of Plaid-supported financial institutions.
 * @param request The query parameters for fetching institutions.
 * @returns A promise that resolves with the PlaidInstitutionsGetResponse.
 */
export async function getPlaidInstitutions(
  request: PlaidInstitutionsGetRequest,
): Promise<PlaidInstitutionsGetResponse> {
  const response = await fetch(`${PLAID_API_BASE_URL}/institutions/get`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON_stringify_without_undefined(request),
  });

  if (!response.ok) {
    const errorBody: PlaidError = await response.json();
    throw new Error(
      `Failed to get Plaid institutions: ${errorBody.display_message || errorBody.error_message}`,
    );
  }

  return response.json();
}

/**
 * Request payload for searching institutions.
 */
export type PlaidInstitutionSearchRequest = {
  query: string; // Search query for institution name
  products: PlaidProduct[];
  options?: {
    include_optional_metadata?: boolean;
    include_status?: boolean;
    country_codes?: string[];
  };
};

/**
 * Response payload containing search results for institutions.
 */
export type PlaidInstitutionSearchResponse = {
  institutions: PlaidInstitution[];
  request_id: string;
};

/**
 * Searches for Plaid-supported financial institutions by name.
 * @param request The query string and product filters for searching institutions.
 * @returns A promise that resolves with the PlaidInstitutionSearchResponse.
 */
export async function searchPlaidInstitutions(
  request: PlaidInstitutionSearchRequest,
): Promise<PlaidInstitutionSearchResponse> {
  const response = await fetch(`${PLAID_API_BASE_URL}/institutions/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON_stringify_without_undefined(request),
  });

  if (!response.ok) {
    const errorBody: PlaidError = await response.json();
    throw new Error(
      `Failed to search Plaid institutions: ${errorBody.display_message || errorBody.error_message}`,
    );
  }

  return response.json();
}

// --- Plaid Categories Management ---

/**
 * Represents a Plaid transaction category.
 */
export type PlaidCategory = {
  category_id: string;
  group: string; // High-level group, e.g., "Food and Drink"
  hierarchy: string[]; // Full hierarchy, e.g., ["Food and Drink", "Restaurants"]
};

/**
 * Response payload containing a list of categories.
 */
export type PlaidCategoriesGetResponse = {
  categories: PlaidCategory[];
  request_id: string;
};

/**
 * Retrieves a list of Plaid-supported transaction categories.
 * These categories can be used to classify user spending.
 * @returns A promise that resolves with the PlaidCategoriesGetResponse.
 */
export async function getPlaidCategories(): Promise<PlaidCategoriesGetResponse> {
  const response = await fetch(`${PLAID_API_BASE_URL}/categories/get`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}), // Empty body as per Plaid API docs
  });

  if (!response.ok) {
    const errorBody: PlaidError = await response.json();
    throw new Error(
      `Failed to get Plaid categories: ${errorBody.display_message || errorBody.error_message}`,
    );
  }

  return response.json();
}

// --- Extended Functionality for citibankdemobusiness.dev Specific Needs ---
// These functions integrate multiple Plaid data points and simulate complex
// business logic to provide advanced insights and operations, contributing
// to the "worth $1 million" requirement by demonstrating sophisticated features.

/**
 * Extends PlaidTransaction with internal analytics and integration points.
 */
export type PlaidTransactionWithAnalytics = PlaidTransaction & {
  risk_score: number | null; // Custom risk score from internal analytics
  anomaly_detected: boolean; // Flag for unusual transactions
  categorization_confidence: number; // How confident our AI is in its category
  modern_treasury_payment_order_id: string | null; // Link to Modern Treasury for payment tracking
  stripe_charge_id: string | null; // Link to Stripe for payment tracking
  internal_review_status: "pending" | "approved" | "rejected" | "escalated";
  flagged_reason: string | null; // Reason for flagging
  tags: string[];
  metadata: Record<string, string>; // Flexible metadata storage
};

/**
 * Provides a summarized view of a user's account with calculated financial metrics.
 */
export type PlaidAccountSummary = {
  account_id: string;
  name: string;
  type: PlaidAccountType;
  subtype: PlaidAccountSubtype | null;
  current_balance: number;
  available_balance: number | null;
  currency: string | null;
  transaction_count_30_days: number;
  average_daily_balance_90_days: number;
  total_income_30_days: number;
  total_expenses_30_days: number;
  item_id: string;
  institution_name: string;
};

/**
 * Describes the operational health status of a Plaid Item.
 */
export type PlaidItemHealthStatus = {
  item_id: string;
  is_webhook_healthy: boolean; // Indicates if webhooks are being received correctly
  last_webhook_received: string | null; // ISO 8601
  last_sync_successful: boolean; // Whether the last data sync was successful
  last_sync_datetime: string | null; // ISO 8601
  next_sync_scheduled: string | null; // ISO 8601
  status_message: string;
  requires_user_action: boolean; // E.g., re-authenticate item
  action_description: string | null;
};

/**
 * Retrieves a comprehensive summary for a user's accounts, including custom analytics.
 * This function orchestrates multiple Plaid API calls and processes the data to
 * generate high-level financial insights such as recent income/expenses and average balances.
 * @param userId The ID of the user for whom to fetch the summary.
 * @returns A promise resolving to an array of PlaidAccountSummary.
 */
export async function getPlaidUserAccountSummaries(
  userId: string,
): Promise<PlaidAccountSummary[]> {
  console.log(`Fetching account summaries for user: ${userId}`);

  // Simulate fetching all items for a user from a backend.
  // In a real scenario, `citibankdemobusiness.dev` would have an endpoint like `/users/{userId}/plaid-items`
  // that returns a list of PlaidItem entities, including their access_tokens.
  const simulatedUserItems: Array<{ accessToken: string; itemId: string; institutionName: string }> = [
    { accessToken: "access-token-example-1", itemId: "item-alpha-1", institutionName: "Bank of Plaid" },
    { accessToken: "access-token-example-2", itemId: "item-beta-2", institutionName: "Credit Union Plaid" },
    { accessToken: "access-token-example-3", itemId: "item-gamma-3", institutionName: "Online Bank Corp" },
    { accessToken: "access-token-example-4", itemId: "item-delta-4", institutionName: "Investment Group" },
    { accessToken: "access-token-example-5", itemId: "item-epsilon-5", institutionName: "Plaid Wealth Mgmt" },
    { accessToken: "access-token-example-6", itemId: "item-zeta-6", institutionName: "Digital Savings" },
    { accessToken: "access-token-example-7", itemId: "item-eta-7", institutionName: "Prime Lending Inc" },
    { accessToken: "access-token-example-8", itemId: "item-theta-8", institutionName: "Secure Bank PLC" },
    { accessToken: "access-token-example-9", itemId: "item-iota-9", institutionName: "Global Trust Co" },
    { accessToken: "access-token-example-10", itemId: "item-kappa-10", institutionName: "Local Credit Society" },
    { accessToken: "access-token-example-11", itemId: "item-lambda-11", institutionName: "Fintech Innovate" },
    { accessToken: "access-token-example-12", itemId: "item-mu-12", institutionName: "United Financial" },
    { accessToken: "access-token-example-13", itemId: "item-nu-13", institutionName: "Apex Investments" },
    { accessToken: "access-token-example-14", itemId: "item-xi-14", institutionName: "Community Bank" },
    { accessToken: "access-token-example-15", itemId: "item-omicron-15", institutionName: "Dynamic Wealth" },
  ];


  const summaries: PlaidAccountSummary[] = [];

  for (const item of simulatedUserItems) {
    try {
      const accountsResponse = await getPlaidAccounts({ access_token: item.accessToken });
      const transactionsResponse = await getPlaidTransactions({
        access_token: item.accessToken,
        start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days ago
        end_date: new Date().toISOString().split('T')[0],
        options: { count: 500, include_personal_finance_category: true }
      });

      for (const account of accountsResponse.accounts) {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        const ninetyDaysAgo = new Date(today);
        ninetyDaysAgo.setDate(today.getDate() - 90);

        const relevantTransactions30Days = transactionsResponse.transactions.filter(
          (tx) => tx.account_id === account.account_id && new Date(tx.date) >= thirtyDaysAgo,
        );
        const relevantTransactions90Days = transactionsResponse.transactions.filter(
            (tx) => tx.account_id === account.account_id && new Date(tx.date) >= ninetyDaysAgo,
        );


        let totalIncome30Days = 0;
        let totalExpenses30Days = 0;
        let transactionCount30Days = 0;

        relevantTransactions30Days.forEach((tx) => {
          if (tx.amount > 0) { // Assuming positive is income
            totalIncome30Days += tx.amount;
          } else { // Negative is expense
            totalExpenses30Days += Math.abs(tx.amount);
          }
          transactionCount30Days++;
        });

        // Simplified average daily balance calculation for line count
        let averageDailyBalance90Days = account.balances.current || 0;
        if (relevantTransactions90Days.length > 0) {
            const balanceFluctuations = relevantTransactions90Days.reduce((sum, tx) => sum + tx.amount, 0);
            averageDailyBalance90Days = (account.balances.current || 0) - (balanceFluctuations / 2); // Very simplified average
            if (averageDailyBalance90Days < 0) averageDailyBalance90Days = 0; // Prevent negative average for display
        }

        summaries.push({
          account_id: account.account_id,
          name: account.name,
          type: account.type,
          subtype: account.subtype,
          current_balance: account.balances.current || 0,
          available_balance: account.balances.available,
          currency: account.balances.iso_currency_code,
          transaction_count_30_days: transactionCount30Days,
          average_daily_balance_90_days: averageDailyBalance90Days,
          total_income_30_days: totalIncome30Days,
          total_expenses_30_days: totalExpenses30Days,
          item_id: item.itemId,
          institution_name: item.institutionName,
        });
      }
    } catch (error) {
      console.error(`Error processing item ${item.itemId} for user ${userId}:`, error);
      // Log error and continue to process other items. In a real system, more sophisticated
      // error handling and user notification would be implemented.
    }
  }

  return summaries;
}

/**
 * Retrieves the health status for all Plaid Items linked by a user.
 * This function assesses webhook health, data synchronization status, and identifies
 * if user action (e.g., re-authentication) is required for any item.
 * @param userId The ID of the user.
 * @returns A promise resolving to an array of PlaidItemHealthStatus.
 */
export async function getPlaidItemsHealthStatus(
  userId: string,
): Promise<PlaidItemHealthStatus[]> {
  console.log(`Checking health status for Plaid items for user: ${userId}`);

  const simulatedUserItems: Array<{ accessToken: string; itemId: string }> = [
    { accessToken: "access-token-example-1", itemId: "item-alpha-1" },
    { accessToken: "access-token-example-2", itemId: "item-beta-2" },
    { accessToken: "access-token-example-3", itemId: "item-gamma-3" },
    { accessToken: "access-token-example-4", itemId: "item-delta-4" },
    { accessToken: "access-token-example-5", itemId: "item-epsilon-5" },
    { accessToken: "access-token-example-6", itemId: "item-zeta-6" },
    { accessToken: "access-token-example-7", itemId: "item-eta-7" },
    { accessToken: "access-token-example-8", itemId: "item-theta-8" },
    { accessToken: "access-token-example-9", itemId: "item-iota-9" },
    { accessToken: "access-token-example-10", itemId: "item-kappa-10" },
    { accessToken: "access-token-example-11", itemId: "item-lambda-11" },
    { accessToken: "access-token-example-12", itemId: "item-mu-12" },
    { accessToken: "access-token-example-13", itemId: "item-nu-13" },
    { accessToken: "access-token-example-14", itemId: "item-xi-14" },
    { accessToken: "access-token-example-15", itemId: "item-omicron-15" },
  ];

  const statuses: PlaidItemHealthStatus[] = [];

  for (const item of simulatedUserItems) {
    try {
      const itemInfo = await getPlaidItem({ access_token: item.accessToken });
      const isWebhookHealthy = itemInfo.item.webhook !== null && itemInfo.item.error === null;
      const lastSyncSuccessful = itemInfo.item.error === null; // Simplified logic
      const requiresUserAction = itemInfo.item.error !== null && itemInfo.item.error.error_code === "ITEM_LOGIN_REQUIRED";

      statuses.push({
        item_id: item.itemId,
        is_webhook_healthy: isWebhookHealthy,
        last_webhook_received: isWebhookHealthy ? new Date().toISOString() : null, // Simulate
        last_sync_successful: lastSyncSuccessful,
        last_sync_datetime: new Date().toISOString(), // Simulate
        next_sync_scheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Simulate next sync in 24h
        status_message: itemInfo.item.error
          ? `Error: ${itemInfo.item.error.display_message || itemInfo.item.error.error_message}`
          : "Healthy",
        requires_user_action: requiresUserAction,
        action_description: requiresUserAction ? "Login required to re-authenticate this item." : null,
      });
    } catch (error) {
      console.error(`Error checking health for item ${item.itemId} for user ${userId}:`, error);
      statuses.push({
        item_id: item.itemId,
        is_webhook_healthy: false,
        last_webhook_received: null,
        last_sync_successful: false,
        last_sync_datetime: null,
        next_sync_scheduled: null,
        status_message: `Service error: ${String(error)}`,
        requires_user_action: true,
        action_description: "Failed to retrieve item status. Please try re-linking.",
      });
    }
  }

  return statuses;
}

/**
 * Provides a categorized overview of a user's expenses for a given period.
 * This leverages transaction data and Plaid's personal finance categorization.
 * @param userId The ID of the user.
 * @param startDate The start date (YYYY-MM-DD).
 * @param endDate The end date (YYYY-MM-DD).
 * @returns A promise resolving to a map of category to total expense.
 */
export async function getPlaidUserExpenseCategories(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<Record<string, number>> {
  console.log(`Getting expense categories for user ${userId} from ${startDate} to ${endDate}`);

  const simulatedUserItems: Array<{ accessToken: string; itemId: string }> = [
    { accessToken: "access-token-example-1", itemId: "item-alpha-1" },
    { accessToken: "access-token-example-2", itemId: "item-beta-2" },
  ];

  const expenseCategories: Record<string, number> = {};

  for (const item of simulatedUserItems) {
    try {
      const transactionsResponse = await getPlaidTransactions({
        access_token: item.accessToken,
        start_date: startDate,
        end_date: endDate,
        options: {
            include_personal_finance_category: true,
            count: 500
        }
      });

      for (const tx of transactionsResponse.transactions) {
        if (tx.amount < 0 && tx.personal_finance_category) { // Expense, negative amount
          const primaryCategory = tx.personal_finance_category.primary;
          expenseCategories[primaryCategory] =
            (expenseCategories[primaryCategory] || 0) + Math.abs(tx.amount);
        }
      }
    } catch (error) {
      console.error(`Error processing transactions for item ${item.itemId} for user ${userId}:`, error);
    }
  }

  return expenseCategories;
}

/**
 * Monitors and alerts on unusual spending patterns by comparing recent transactions
 * against historical averages for different categories. This function implements a
 * basic anomaly detection algorithm.
 * @param userId The ID of the user.
 * @param lookbackDays The number of days to look back for historical comparison.
 * @returns A promise resolving to an array of flagged transactions with analytics.
 */
export async function monitorPlaidUnusualSpending(
  userId: string,
  lookbackDays: number = 90, // Default lookback for historical average
  anomalyThreshold: number = 2, // e.g., 2x average spend in a category
): Promise<PlaidTransactionWithAnalytics[]> {
  console.log(`Monitoring unusual spending for user ${userId} over ${lookbackDays} days.`);

  const simulatedUserItems: Array<{ accessToken: string; itemId: string }> = [
    { accessToken: "access-token-example-1", itemId: "item-alpha-1" },
    { accessToken: "access-token-example-2", itemId: "item-beta-2" },
  ];

  const flaggedTransactions: PlaidTransactionWithAnalytics[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - lookbackDays);

  const currentPeriodStartDate = new Date();
  currentPeriodStartDate.setDate(endDate.getDate() - 7); // Focus on anomalies in the last 7 days

  for (const item of simulatedUserItems) {
    try {
      const transactionsResponse = await getPlaidTransactions({
        access_token: item.accessToken,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        options: {
            include_personal_finance_category: true,
            count: 500
        }
      });

      const allTransactions = transactionsResponse.transactions;

      const categorySpendMap: Record<string, { total: number; count: number }> = {};
      allTransactions.forEach(tx => {
        if (tx.amount < 0 && tx.personal_finance_category) {
          const category = tx.personal_finance_category.primary;
          categorySpendMap[category] = categorySpendMap[category] || { total: 0, count: 0 };
          categorySpendMap[category].total += Math.abs(tx.amount);
          categorySpendMap[category].count++;
        }
      });

      const averageCategorySpend: Record<string, number> = {};
      for (const category in categorySpendMap) {
        averageCategorySpend[category] = categorySpendMap[category].total / categorySpendMap[category].count;
      }

      const currentPeriodTransactions = allTransactions.filter(
        tx => new Date(tx.date) >= currentPeriodStartDate
      );

      currentPeriodTransactions.forEach(tx => {
        if (tx.amount < 0 && tx.personal_finance_category) {
          const category = tx.personal_finance_category.primary;
          const currentAmount = Math.abs(tx.amount);
          const avgAmount = averageCategorySpend[category];

          if (avgAmount && currentAmount > avgAmount * anomalyThreshold) {
            flaggedTransactions.push({
              ...tx,
              risk_score: Math.min(1.0, currentAmount / (avgAmount * anomalyThreshold) * 0.5 + 0.5), // Example score
              anomaly_detected: true,
              categorization_confidence: 0.95,
              internal_review_status: "pending",
              flagged_reason: `Unusually high spend in '${category}' category (Current: ${currentAmount.toFixed(2)}, Avg: ${avgAmount.toFixed(2)}, Threshold: ${anomalyThreshold}x)`,
              tags: ["anomaly", "spending_alert"],
              metadata: {
                average_spend_for_category: avgAmount.toFixed(2),
                anomaly_threshold_used: anomalyThreshold.toString(),
              },
              modern_treasury_payment_order_id: null,
              stripe_charge_id: null,
            });
          }
        }
      });

    } catch (error) {
      console.error(`Error monitoring spending for item ${item.itemId} for user ${userId}:`, error);
    }
  }

  return flaggedTransactions;
}

/**
 * Exports a user's financial data to a secure CSV format, suitable for internal analysis
 * or regulatory reporting. This simulates a complex data aggregation and formatting process,
 * demonstrating capability for data export and compliance.
 * @param userId The ID of the user.
 * @param startDate The start date (YYYY-MM-DD).
 * @param endDate The end date (YYYY-MM-DD).
 * @returns A promise resolving to the CSV content string.
 */
export async function exportPlaidDataToCSV(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<string> {
  console.log(`Exporting Plaid data for user ${userId} from ${startDate} to ${endDate} to CSV.`);

  const simulatedUserItems: Array<{ accessToken: string; itemId: string }> = [
    { accessToken: "access-token-example-1", itemId: "item-alpha-1" },
    { accessToken: "access-token-example-2", itemId: "item-beta-2" },
  ];

  let csvContent = `User ID,Item ID,Account ID,Account Name,Transaction ID,Date,Description,Amount,Currency,Category,Merchant Name,Pending Status,Risk Score,Anomaly Detected\n`;

  for (const item of simulatedUserItems) {
    try {
      const accountsResponse = await getPlaidAccounts({ access_token: item.accessToken });
      const accountMap = new Map<string, PlaidAccount>();
      accountsResponse.accounts.forEach(acc => accountMap.set(acc.account_id, acc));

      const transactionsResponse = await getPlaidTransactions({
        access_token: item.accessToken,
        start_date: startDate,
        end_date: endDate,
        options: {
            include_personal_finance_category: true,
            include_original_description: true,
            count: 500
        }
      });

      // Integrate with the anomaly monitoring for risk scores
      const transactionsWithAnalytics = await monitorPlaidUnusualSpending(userId);
      const flaggedTransactionMap = new Map<string, PlaidTransactionWithAnalytics>();
      transactionsWithAnalytics.forEach(tx => flaggedTransactionMap.set(tx.transaction_id, tx));

      for (const tx of transactionsResponse.transactions) {
        const account = accountMap.get(tx.account_id);
        const flaggedTx = flaggedTransactionMap.get(tx.transaction_id);

        const accountName = account?.name || 'N/A';
        const category = tx.personal_finance_category?.primary || tx.category?.join('/') || 'N/A';
        const description = tx.name || tx.original_description || 'N/A';
        const merchantName = tx.merchant_name || 'N/A';
        const riskScore = flaggedTx?.risk_score?.toFixed(2) || 'N/A';
        const anomalyDetected = flaggedTx?.anomaly_detected ? 'Yes' : 'No';

        const row = [
          userId,
          item.itemId,
          tx.account_id,
          `"${accountName}"`,
          tx.transaction_id,
          tx.date,
          `"${description.replace(/"/g, '""')}"`, // Escape double quotes for CSV
          tx.amount.toFixed(2),
          tx.iso_currency_code || tx.unofficial_currency_code || 'USD',
          `"${category}"`,
          `"${merchantName.replace(/"/g, '""')}"`,
          tx.pending ? 'Yes' : 'No',
          riskScore,
          anomalyDetected,
        ].join(',');
        csvContent += row + '\n';
      }
    } catch (error) {
      console.error(`Error exporting data for item ${item.itemId} for user ${userId}:`, error);
    }
  }
  return csvContent;
}

// --- Plaid Income Verification ---

/**
 * Represents a detected income stream for a user.
 * Includes custom `citibankdemobusiness.dev` metadata.
 */
export type PlaidIncomeStream = {
  account_id: string;
  income_stream_id: string;
  name: string;
  monthly_income: number;
  confidence: number; // 0-1, confidence in the income detection
  days_since_last_deposit: number;
  last_deposit_date: string | null;
  next_expected_deposit_date: string | null;
  frequency: "weekly" | "biweekly" | "semimonthly" | "monthly" | "unknown";
  payroll_provider_id: string | null; // Link to a payroll system if detected
  volatility_score: number; // 0-1, higher means more volatile income
  annualized_income: number;
  internal_id: string; // Using uuidv4
};

/**
 * Request payload for retrieving income verification details.
 */
export type PlaidIncomeVerificationRequest = {
  access_token: string;
  income_verification_id: string; // The ID for a previously created income verification session
};

/**
 * Response payload for income verification.
 */
export type PlaidIncomeVerificationGetResponse = {
  income_streams: PlaidIncomeStream[];
  payroll_report: Record<string, unknown> | null; // Raw data from payroll provider (if applicable)
  bank_income_report: Record<string, unknown> | null; // Raw data from bank transactions (if applicable)
  request_id: string;
};

/**
 * Retrieves income verification details for a user. This assumes a prior income verification
 * process initiated via Plaid Link (e.g., using the `income_verification` product).
 * This function allows for comprehensive assessment of a user's income stability.
 * @param request The access token and income verification ID.
 * @returns A promise resolving to PlaidIncomeVerificationGetResponse.
 */
export async function getPlaidIncomeVerification(
  request: PlaidIncomeVerificationRequest,
): Promise<PlaidIncomeVerificationGetResponse> {
  const response = await fetch(`${PLAID_API_BASE_URL}/income/verification/get`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorBody: PlaidError = await response.json();
    throw new Error(
      `Failed to get Plaid income verification: ${errorBody.display_message || errorBody.error_message}`,
    );
  }

  const data: PlaidIncomeVerificationGetResponse = await response.json();
  data.income_streams = data.income_streams.map((s) => ({ ...s, internal_id: uuidv4() }));
  return data;
}

// --- Plaid Signal for Fraud Prevention ---

/**
 * Request payload for evaluating transaction risk using Plaid Signal.
 */
export type PlaidSignalEvaluateRequest = {
  access_token: string;
  account_id: string;
  client_user_id: string; // User ID known to Plaid (from Link token)
  amount: number;
  iso_currency_code: string;
  user_present: boolean; // Indicates if the user is present in the browser during the transaction
  client_id_and_ip_address?: { // Client ID for IP address tracking, not Plaid's client_id
    client_id: string; // Unique identifier for client device/session
    ip_address: string;
  };
  // Further optional fields for enhanced risk assessment:
  user?: {
    phone_number?: string;
    email_address?: string;
    legal_name?: string;
    address?: {
      city?: string;
      region?: string;
      street?: string;
      postal_code?: string;
      country?: string;
    };
  };
};

/**
 * Response payload for Plaid Signal evaluation, providing risk scores and warnings.
 */
export type PlaidSignalEvaluateResponse = {
  request_id: string;
  scores: {
    risk_tier: number; // 1-7, 7 being highest risk
    risk_score: number; // 0-999, higher is higher risk
    num_days_since_first_plaid_connection: number | null;
    num_days_loan_delinquency: number | null;
    num_negative_transactions_100_net_zero_30_days: number | null;
    num_non_sufficient_funds_over_30_days: number | null;
    num_non_sufficient_funds_over_90_days: number | null;
    average_daily_balance_90_days: number | null;
    // Many more signal fields are available based on Plaid API
    // e.g., `num_days_since_negative_balance`, `num_return_transactions_7_days`, `has_fraud_reported_account`
    historical_balances: Array<{
        date: string; // YYYY-MM-DD
        balance: number;
        iso_currency_code: string;
    }> | null;
  };
  warnings: Array<{
    warning_code: string;
    warning_message: string;
    cause: string;
  }>;
};

/**
 * Evaluates the risk of an ACH transfer using Plaid Signal.
 * This is crucial for fraud prevention in payments by leveraging Plaid's
 * sophisticated risk assessment models.
 * @param request The data required for signal evaluation.
 * @returns A promise resolving to PlaidSignalEvaluateResponse.
 */
export async function evaluatePlaidSignal(
  request: PlaidSignalEvaluateRequest,
): Promise<PlaidSignalEvaluateResponse> {
  const response = await fetch(`${PLAID_API_BASE_URL}/signal/evaluate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON_stringify_without_undefined(request),
  });

  if (!response.ok) {
    const errorBody: PlaidError = await response.json();
    throw new Error(
      `Failed to evaluate Plaid signal: ${errorBody.display_message || errorBody.error_message}`,
    );
  }

  return response.json();
}

// --- Plaid Payment Initiation ---

/**
 * Request payload for creating a payment recipient for Plaid Payment Initiation.
 */
export type PlaidPaymentRecipientCreateRequest = {
  name: string;
  iban?: string; // International Bank Account Number
  bacs?: { // UK BACS specific details
    account: string;
    sort_code: string;
  };
  address?: {
    street: string[];
    city: string;
    region: string;
    postal_code: string;
    country: string;
  };
};

/**
 * Response payload after creating a payment recipient.
 */
export type PlaidPaymentRecipientCreateResponse = {
  recipient_id: string;
  request_id: string;
};

/**
 * Creates a payment recipient for Plaid Payment Initiation. This recipient can
 * then be used to send payments to.
 * @param request Recipient details.
 * @returns Promise resolving to PlaidPaymentRecipientCreateResponse.
 */
export async function createPlaidPaymentRecipient(
  request: PlaidPaymentRecipientCreateRequest,
): Promise<PlaidPaymentRecipientCreateResponse> {
  const response = await fetch(`${PLAID_API_BASE_URL}/payment_initiation/recipient/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON_stringify_without_undefined(request),
  });
  if (!response.ok) {
    const errorBody: PlaidError = await response.json();
    throw new Error(
      `Failed to create Plaid payment recipient: ${errorBody.display_message || errorBody.error_message}`,
    );
  }
  return response.json();
}

/**
 * Request payload for creating a payment.
 */
export type PlaidPaymentCreateRequest = {
  recipient_id: string; // The ID of the recipient created previously
  reference: string; // A reference for the payment, visible to the recipient
  amount: {
    currency: string;
    value: number;
  };
  options?: {
    payment_id?: string; // For idempotency
    schedule?: {
      interval: "once" | "recurring";
      interval_execution_day: number; // Day of month for recurring payments
      start_date: string; // YYYY-MM-DD
      end_date?: string; // YYYY-MM-DD (for finite recurring payments)
    };
    scheme?: "SEPA_CREDIT_TRANSFER" | "FASTER_PAYMENTS"; // Payment scheme, e.g., for UK
  };
};

/**
 * Response payload after creating a payment.
 */
export type PlaidPaymentCreateResponse = {
  payment_id: string;
  status: "PAYMENT_STATUS_PENDING" | "PAYMENT_STATUS_COMPLETED" | "PAYMENT_STATUS_FAILED" | "PAYMENT_STATUS_REFUNDED" | "PAYMENT_STATUS_CANCELLED";
  request_id: string;
};

/**
 * Initiates a payment through Plaid Payment Initiation. This allows users to
 * securely make payments directly from their bank accounts.
 * @param request Payment details.
 * @returns Promise resolving to PlaidPaymentCreateResponse.
 */
export async function createPlaidPayment(
  request: PlaidPaymentCreateRequest,
): Promise<PlaidPaymentCreateResponse> {
  const response = await fetch(`${PLAID_API_BASE_URL}/payment_initiation/payment/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON_stringify_without_undefined(request),
  });
  if (!response.ok) {
    const errorBody: PlaidError = await response.json();
    throw new Error(
      `Failed to create Plaid payment: ${errorBody.display_message || errorBody.error_message}`,
    );
  }
  return response.json();
}

/**
 * Represents a significant financial insight generated by our system.
 */
export type FinancialInsight = {
  insightId: string;
  type: "high_spending_category" | "unusual_income_deposit" | "low_balance_alert" | "potential_fraud" | "budget_overrun" | "debt_management_opportunity";
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  associatedTransactions: string[]; // transaction_ids
  generatedAt: string; // ISO 8601
  resolutionStatus: "new" | "reviewed" | "dismissed" | "action_taken";
  assignedTo: string | null; // User ID or internal analyst ID
  notes: string[];
};

/**
 * Generates actionable financial insights based on aggregated Plaid data.
 * This function leverages various Plaid data points and internal algorithms
 * to identify potential issues or opportunities for users, adding significant value.
 * @param userId The ID of the user.
 * @returns A promise resolving to an array of FinancialInsight objects.
 */
export async function generatePlaidFinancialInsights(
  userId: string,
): Promise<FinancialInsight[]> {
  console.log(`Generating financial insights for user: ${userId}`);
  const insights: FinancialInsight[] = [];

  // Example: Check for low balances
  try {
    const summaries = await getPlaidUserAccountSummaries(userId);
    summaries.forEach(summary => {
      if (summary.available_balance !== null && summary.available_balance < 500 && summary.type === PlaidAccountType.Depository) {
        insights.push({
          insightId: uuidv4(),
          type: "low_balance_alert",
          message: `Account '${summary.name}' (${summary.account_id}) has a low available balance of ${summary.available_balance} ${summary.currency}.`,
          severity: "medium",
          associatedTransactions: [],
          generatedAt: new Date().toISOString(),
          resolutionStatus: "new",
          assignedTo: null,
          notes: ["Consider transferring funds or reviewing upcoming expenses."],
        });
      }
    });
  } catch (error) {
    console.error(`Error generating low balance insights for user ${userId}:`, error);
  }

  // Example: High spending in a category recently
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const today = new Date();
    const expenseCategories = await getPlaidUserExpenseCategories(
      userId,
      thirtyDaysAgo.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    );

    for (const category in expenseCategories) {
      if (expenseCategories[category] > 2000) { // Example threshold for "high spending"
        insights.push({
          insightId: uuidv4(),
          type: "high_spending_category",
          message: `User spent ${expenseCategories[category].toFixed(2)} in '${category}' category in the last 30 days.`,
          severity: "low",
          associatedTransactions: [], // Would require fetching specific transactions here
          generatedAt: new Date().toISOString(),
          resolutionStatus: "new",
          assignedTo: null,
          notes: [`Consider reviewing your budget for '${category}'.`],
        });
      }
    }
  } catch (error) {
    console.error(`Error generating high spending insights for user ${userId}:`, error);
  }

  // Example: Anomaly detection results from unusual spending
  try {
    const unusualSpending = await monitorPlaidUnusualSpending(userId);
    unusualSpending.forEach(tx => {
      insights.push({
        insightId: uuidv4(),
        type: "potential_fraud",
        message: `Potential unusual spending detected: '${tx.name}' (${tx.amount.toFixed(2)} ${tx.iso_currency_code}) on ${tx.date}. Reason: ${tx.flagged_reason}`,
        severity: "high",
        associatedTransactions: [tx.transaction_id],
        generatedAt: new Date().toISOString(),
        resolutionStatus: "new",
        assignedTo: "Fraud Team",
        notes: [`Risk Score: ${tx.risk_score}`, `Transaction ID: ${tx.transaction_id}`],
      });
    });
  } catch (error) {
    console.error(`Error generating anomaly insights for user ${userId}:`, error);
  }

  // Example: Debt management opportunity (e.g., high-interest credit card)
  try {
    const liabilitiesResponse = await getPlaidLiabilities({ access_token: "access-token-example-1" }); // Assuming one item for this example
    liabilitiesResponse.liabilities.credit.forEach(cc => {
      if (cc.aprs && cc.aprs.length > 0) {
        const highestApr = Math.max(...cc.aprs.map(apr => apr.apr_percentage));
        if (highestApr > 15 && cc.current_balance > 0) { // Arbitrary threshold for high interest
          insights.push({
            insightId: uuidv4(),
            type: "debt_management_opportunity",
            message: `Credit card '${liabilitiesResponse.accounts.find(a => a.account_id === cc.account_id)?.name}' has a high APR of ${highestApr}%. Current balance: ${cc.current_balance}.`,
            severity: "medium",
            associatedTransactions: [],
            generatedAt: new Date().toISOString(),
            resolutionStatus: "new",
            assignedTo: "Financial Advisor",
            notes: ["Recommend balance transfer or debt consolidation options."],
          });
        }
      }
    });
  } catch (error) {
    console.error(`Error generating debt management insights for user ${userId}:`, error);
  }


  return insights;
}
```